# Production Polish — Patterns + Recipes

> Phase 7 deliverable. Documents error boundaries, rate limiting, output dedup, telemetry, performance, monitoring dla Roduq design generator. Operational rulebook dla post-deploy production usage.

## 1. Error boundaries

### LLM provider errors

```typescript
type LLMError =
  | { code: "RATE_LIMIT"; provider: string; retryAfterMs?: number }
  | { code: "INVALID_RESPONSE"; raw: string; cause: Error }
  | { code: "TIMEOUT"; durationMs: number; limitMs: number }
  | { code: "AUTH_FAILED"; provider: string }
  | { code: "QUOTA_EXCEEDED"; provider: string }
  | { code: "PROVIDER_DOWN"; provider: string };

async function withErrorBoundary<T>(
  fn: () => Promise<T>,
  ctx: { skillName: string; clientId: string; logger: Logger },
): Promise<{ success: T } | { error: LLMError; userMessage: string }> {
  try {
    return { success: await fn() };
  } catch (err) {
    const llmError = classifyError(err);
    ctx.logger.error("LLM error", { ...llmError, skillName: ctx.skillName, clientId: ctx.clientId });

    const userMessage = (() => {
      switch (llmError.code) {
        case "RATE_LIMIT": return `Provider ${llmError.provider} ograniczył liczbę requestów. Spróbuj za ${Math.ceil((llmError.retryAfterMs ?? 60_000) / 1000)}s lub przełącz na innego providera (rule 007).`;
        case "AUTH_FAILED": return `API key dla ${llmError.provider} niepoprawny lub wygasł. Sprawdź .env.local.`;
        case "QUOTA_EXCEEDED": return `Quota ${llmError.provider} wyczerpana. Top up account lub przełącz providera.`;
        case "TIMEOUT": return `Generation przekroczyła ${llmError.limitMs / 1000}s limit. Większy timeout lub mniej skill complexity.`;
        case "INVALID_RESPONSE": return `Provider zwrócił invalid response. Może być transient — retry. Gdy persistent, change provider.`;
        case "PROVIDER_DOWN": return `${llmError.provider} ma awarię. System przełączył się na fallback (Mock w dev / OpenAI/Gemini w prod).`;
      }
    })();

    return { error: llmError, userMessage };
  }
}
```

### File system errors

```typescript
async function withFsErrorBoundary<T>(
  fn: () => Promise<T>,
  ctx: { operation: string; path: string; logger: Logger },
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    ctx.logger.error("FS error", { ...ctx, code, message: (err as Error).message });

    switch (code) {
      case "ENOENT": throw new MCPServerError(`File not found: ${ctx.path}`, "FS_ERROR", err);
      case "EACCES": throw new MCPServerError(`Permission denied: ${ctx.path}. Check ROduQ_OUTPUT_DIR permissions.`, "FS_ERROR", err);
      case "ENOSPC": throw new MCPServerError(`Disk full. Free space and retry.`, "FS_ERROR", err);
      case "EEXIST": throw new MCPServerError(`File already exists: ${ctx.path}. Atomic write conflict.`, "FS_ERROR", err);
      default: throw new MCPServerError(`Filesystem error (${code}): ${(err as Error).message}`, "FS_ERROR", err);
    }
  }
}
```

### Schema validation errors

Per `schemas/README.md`:
```typescript
function validateOrThrow(validator, data, label) {
  if (!validator(data)) {
    const errors = ajv.errorsText(validator.errors, { separator: "\n  " });
    throw new MCPServerError(
      `${label} schema validation failed:\n  ${errors}`,
      "VALIDATION_FAILED",
      validator.errors,
    );
  }
}
```

User-facing message: "Output nie pasuje do JSON Schema v1. To bug w skill — zgłoś do Roduq team: rafal.stefaniszyn@roduq.com z error log."

## 2. Rate limiting

### LLM provider quotas

| Provider | Tier 1 quota | Burst capacity | Multi-variant impact |
|----------|--------------|----------------|---------------------|
| Anthropic Claude Sonnet 4.6+ | 50 req/min input + 100k tokens/min | ~50 concurrent | 3 req per multi-variant — max 16 concurrent runs |
| OpenAI GPT-5 | 500 RPM + 30k TPM | ~500 concurrent | 3 req — max ~166 runs/min |
| Gemini 2.5 Pro | 60 RPM | ~60 concurrent | 3 req — max 20 runs/min |
| MockProvider | unlimited | unlimited | dev/CI only |

### In-process queue (multi-variant)

Per `skills/multi-variant/references/parallel-execution.md`:

```typescript
class MultiVariantQueue {
  private active: number = 0;
  private readonly maxConcurrent: number = 6;  // 6 variants = 2 multi-variant runs
  private waitingQueue: Array<() => void> = [];

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.waitingQueue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.waitingQueue.shift();
      if (next) next();
    }
  }
}
```

### Per-user rate limit (multi-tenant deployment)

```typescript
// Roduq agency w client mode — 1 active multi-variant per tenant
const TENANT_RATE_LIMITS = {
  multiVariantPerHour: 20,        // 20 runs/hour = ~$10/hour Anthropic
  multiVariantConcurrent: 1,      // serialize per tenant
  totalConcurrent: 6,             // global max
};
```

### Retry strategy

```typescript
const RETRY_DELAYS_MS = [1000, 2000, 5000, 10_000];   // exponential w jitter

async function retryableFetch<T>(
  fn: () => Promise<T>,
  shouldRetry: (err: unknown) => boolean,
): Promise<T> {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLast = attempt === RETRY_DELAYS_MS.length;
      if (isLast || !shouldRetry(err)) throw err;
      const delay = RETRY_DELAYS_MS[attempt]! + Math.random() * 500;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

// Usage:
const result = await retryableFetch(
  () => provider.complete(messages),
  (err) => isRateLimitError(err) || isTransientNetworkError(err),
);
```

## 3. Output deduplication

### Cache identical brief + variant runs

```typescript
type CacheKey = {
  skillName: string;
  brief: string;            // SHA256 of normalized brief
  variantPreset: string;
  audience: string;         // SHA256 of audience string
  brandColors: string[];    // sorted array
};

function cacheKey(input: SkillInput, preset: string): string {
  const normalized = {
    skill: input.skillName,
    brief: hashString(input.brief.trim().toLowerCase()),
    preset,
    audience: hashString(input.audience.trim().toLowerCase()),
    brandColors: [...(input.brandColors ?? [])].sort().join(","),
  };
  return hashObject(normalized);
}

class OutputCache {
  private store = new Map<string, { result: SkillOutput; createdAt: number }>();
  private readonly TTL_MS = 24 * 60 * 60 * 1000;     // 24h

  get(key: string): SkillOutput | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.createdAt > this.TTL_MS) {
      this.store.delete(key);
      return null;
    }
    return entry.result;
  }

  set(key: string, result: SkillOutput): void {
    this.store.set(key, { result, createdAt: Date.now() });
  }

  invalidate(predicate: (key: string) => boolean): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (predicate(key)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }
}
```

### Cache savings

- **Hit rate target**: 15-30% (similar briefs across Roduq agency clients common)
- **Per-hit savings**: ~$0.10-0.17 LLM cost + 10-20s wall-clock
- **Storage**: ~50KB per cached entry (tokens.json + sections.json + content.json + design-system.md as JSON)

### Multi-variant cache strategy

Cache PER-VARIANT (not per multi-variant run). Reasoning:
- User regenerates 1/3 z hint → 2/3 cached (saves 2× LLM cost)
- Different briefs may share Conservative preset hits

## 4. Telemetry (opt-in)

### Events schema

```typescript
type TelemetryEvent =
  | { event: "skill.invoked"; skillName: string; clientId: string; durationMs: number; tokens: { input: number; output: number }; cached: boolean }
  | { event: "multi-variant.started"; clientId: string; industrySkill: string; presetMatrix: Record<number, string> }
  | { event: "multi-variant.completed"; clientId: string; durationMs: number; successCount: number; failureCount: number }
  | { event: "variant.picked"; clientId: string; variantId: 1 | 2 | 3; preset: string; timeSinceGenerationMs: number }
  | { event: "skill.failed"; skillName: string; errorCode: string }
  | { event: "mcp.tool.called"; toolName: string; durationMs: number };

interface TelemetryConfig {
  enabled: boolean;          // default: false (opt-in)
  endpoint?: string;         // production: PostHog (matches upstream)
  anonymousId: string;       // generated once per install, NOT user ID
  includeContent: false;     // NEVER include brief/output content
}
```

### What to track (anonymous metrics)

✅ **Track**:
- Skill names invoked (frequency per skill)
- Variant picked distribution (Conservative/Modern/Bold popularity per industry)
- Preset usage (which presets convert best)
- Error rates per skill / per provider
- Average execution time per skill
- Token usage aggregated (NIE per-user)

❌ **Never track**:
- User briefs / prompts (PII risk)
- Output content (proprietary client data)
- API keys
- Client identifiers (clientId is hashed before reporting)

### Implementation per Phase 7

- Default disabled (opt-in via `.env.local` `RODUQ_TELEMETRY_ENABLED=true`)
- Privacy policy w UI on first launch
- Self-host option dla Roduq agency clients (don't share with Anthropic)

## 5. Performance budgets

### Skill execution target

| Operation | Target p50 | Target p95 | Hard limit |
|-----------|-----------|------------|-----------|
| Single skill (industry) | 15s | 25s | 45s |
| Multi-variant (3 parallel) | 20s | 30s | 60s |
| Schema validation (ajv) | 5ms | 20ms | 100ms |
| File atomic write | 50ms | 150ms | 500ms |
| MCP tool call (get_design_state) | 50ms | 200ms | 1s |
| MCP tool call (pick_variant) | 100ms | 300ms | 2s |

### Performance regressions

Phase 7 acceptance: multi-variant skill execution **<30s p95** across 5 sample briefs.

Monitoring strategy:
1. Track durationMs w telemetry per skill invocation
2. Alert gdy p95 > target by 50% (e.g., multi-variant p95 > 45s)
3. Profile gdy regression: time spent in LLM vs validation vs FS write

## 6. Monitoring + alerting

### Health checks

```typescript
GET /api/health
→ {
  status: "ok" | "degraded" | "down",
  checks: {
    daemon: "ok",
    sqlite: "ok",                          // upstream .od/app.sqlite reachable
    llmProviders: {
      anthropic: { status: "ok", lastSuccessMs: 1234 },
      openai: { status: "ok", lastSuccessMs: 4567 },
      gemini: { status: "down", error: "AUTH_FAILED" },
      mock: { status: "ok" }
    },
    outputDir: { status: "ok", path: "/Users/.../.roduq/output", writable: true },
    schemas: { status: "ok", loadedAt: "2026-05-26T..." }
  }
}
```

### Critical alerts

1. **Schema validation failure rate > 5%** — bug w skill output OR schema drift
2. **LLM rate limit hit > 1×/hour** — need to add provider OR upgrade tier
3. **Multi-variant total timeout > 1%** — slow LLM provider, escalate
4. **Output dir unwritable** — disk full or permissions broken
5. **Daemon down > 30s** — service interruption

### Logging convention

```typescript
logger.info("event", { /* structured fields */ });
logger.warn("recoverable issue", { ... });
logger.error("failure", { ... });

// Example
logger.info("multi-variant.started", {
  clientId: hashClientId(clientId),       // hashed for privacy
  industrySkill: "roduq-saas-landing",
  presets: ["roduq-tech-modern", "roduq-dark-cinematic", "roduq-brutalist"],
});
```

## 7. Disaster recovery

### Output directory corruption

Symptoms: `.complete` flag present but tokens.json invalid JSON.

Recovery:
1. Detect via schema validation on read
2. Move corrupted client dir → `corrupted/<clientId>-<timestamp>/`
3. Notify user: "Output corrupted dla {clientId}. Backup w corrupted/. Re-run generation."
4. NIE auto-delete — preserve dla forensics

### Multi-variant partial generation

Symptoms: 2/3 variants succeeded, 1 timeout/error.

Recovery (already documented w parallel-execution.md):
- Return partial result (2 variants visible in UI)
- "Regenerate failed variant" button user-triggerable
- Logged failed variant status: "timeout" / "error" w meta

### LLM provider auth failure

Symptoms: All requests to provider returning 401.

Recovery:
1. Detect via auth error code
2. Failover do next provider w LLMRouter chain (per rule 007)
3. Notify user: "Anthropic auth failed. Fell back to OpenAI. Update .env.local."
4. Continue serving requests via fallback

## 8. Migration windows

### Schema version bumps (v1 → v2)

Process:
1. Add v2 schemas w `schemas/v2/`
2. `@roduq/cli` w roduq-web-starter learns to consume both
3. New skills target v2; old skills continue producing v1
4. Migration helper w `@roduq/cli`: `roduq migrate <clientDir>` upgrades v1 → v2
5. Deprecate v1 producers after 6 months (3 months grace + 3 months warning)
6. Remove v1 after 12 months total

### Roduq major version bumps

Process:
1. New major version published
2. Old artifacts continue working (forward-compat removeAdditional: false)
3. New skill iterations target new version
4. Documentation z migration steps

## 9. Backup strategy

### Output directory backups

Phase 7+ recommendation: nightly rsync of `~/.roduq/output/` to:
- Local time-machine equivalent
- Roduq agency S3 bucket (optional — multi-tenant clients require this)

Retention: 30 days incremental + 12 months full-month snapshots.

### Skill + preset versions

Source-controlled w git (this repo). Each release tagged. Rollback via git checkout.

## 10. Security considerations

### API keys

- Stored w `.env.local` (gitignored)
- Loaded via dotenv w daemon startup
- NEVER logged
- Mask gdy displaying in UI ("sk-ant-***...***xyz")

### Client data isolation

- Each client dir owned by single agency user
- Output dir permissions 700 (owner only)
- No cross-client file access

### MCP server hardening

- Only spawn z .claude/settings.json local config (NIE remote)
- Validate all input z Zod (rejected w INVALID_INPUT errors)
- Sanitize clientId before file system operations (kebab-case regex enforced)
- Limit output size (avoid memory exhaustion via huge tokens.json)

## Phase 7 status

- ✅ Documentation complete (this file)
- ⏳ Implementation: Phase 7 final wiring requires pnpm install (currently blocked Windows native better-sqlite3)
- ⏳ Telemetry endpoint deploy TBD
- ⏳ Health check endpoint w apps/daemon Phase 7 wiring
- ⏳ Monitoring/alerting setup TBD (PostHog / Sentry — upstream uses these)
