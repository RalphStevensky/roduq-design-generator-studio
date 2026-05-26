# Parallel Execution — Promise.all + Timeout + Token Budget

> Implementation pattern dla `multi-variant` skill's 3-parallel-variant generation. Phase 7 ts code implementation reference.

## Pattern overview

```typescript
type SkillContext = {
  llmRouter: LLMRouter;             // patrz rule 007
  outputWriter: AtomicWriter;       // patrz rule 004
  logger: Logger;
  abortController?: AbortController;
};

type VariantInvocation = {
  id: 1 | 2 | 3;
  label: "Conservative" | "Modern" | "Bold";
  industrySkill: string;            // e.g., "roduq-saas-landing"
  preset: string;                   // e.g., "roduq-tech-modern"
  input: SkillInput;
};

type VariantResult = {
  id: 1 | 2 | 3;
  label: string;
  preset: string;
  status: "complete" | "timeout" | "error";
  output?: SkillOutput;
  error?: { code: string; message: string };
  executionTimeMs: number;
  tokensUsed: { input: number; output: number };
};

async function executeMultiVariant(
  invocations: VariantInvocation[],
  ctx: SkillContext,
): Promise<VariantResult[]> {
  const PER_VARIANT_TIMEOUT_MS = 45_000;
  const TOTAL_TIMEOUT_MS = 60_000;          // hard ceiling — Phase 4 target <30s but allow buffer

  const variantPromises = invocations.map(async (inv): Promise<VariantResult> => {
    const startTime = Date.now();
    try {
      const result = await Promise.race([
        runIndustrySkill(inv.industrySkill, inv.input, inv.preset, ctx),
        rejectAfter(PER_VARIANT_TIMEOUT_MS, "variant-timeout"),
      ]);
      return {
        id: inv.id,
        label: inv.label,
        preset: inv.preset,
        status: "complete",
        output: result.output,
        executionTimeMs: Date.now() - startTime,
        tokensUsed: result.tokensUsed,
      };
    } catch (err) {
      ctx.logger.warn(`Variant ${inv.id} (${inv.label}) failed: ${err.message}`);
      return {
        id: inv.id,
        label: inv.label,
        preset: inv.preset,
        status: err.message === "variant-timeout" ? "timeout" : "error",
        error: { code: err.code ?? "UNKNOWN", message: err.message },
        executionTimeMs: Date.now() - startTime,
        tokensUsed: { input: 0, output: 0 },
      };
    }
  });

  // Wait dla all variants (or total timeout)
  const results = await Promise.race([
    Promise.all(variantPromises),
    rejectAfter(TOTAL_TIMEOUT_MS, "total-timeout").then(() => []),
  ]) as VariantResult[];

  return results.length > 0 ? results : variantPromises.map(p => /* fallback partial */);
}

function rejectAfter(ms: number, code: string): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(code)), ms),
  );
}
```

## Industry skill invocation z preset hint

```typescript
async function runIndustrySkill(
  skillName: string,
  input: SkillInput,
  presetHint: string,
  ctx: SkillContext,
): Promise<{ output: SkillOutput; tokensUsed: { input: number; output: number } }> {
  // Load skill — SKILL.md frontmatter + body parsed
  const skill = await loadSkill(skillName);

  // Inject preset hint into prompt context
  const skillPrompt = renderSkillPrompt(skill, { ...input, presetHint });

  // Provider abstraction (rule 007)
  const provider = ctx.llmRouter.pick(skill.modelHint);
  const llmResponse = await provider.complete(
    [
      { role: "system", content: skill.instructions },
      { role: "user", content: skillPrompt },
    ],
    {
      temperature: 0.7,
      maxTokens: 4096,
      responseFormat: "json",        // gdy provider supports
    },
  );

  // Parse + validate output
  const parsed = parseSkillOutput(llmResponse.content);
  const validated = validateAgainstSchema(parsed);   // ajv per rule 004

  return {
    output: validated,
    tokensUsed: {
      input: llmResponse.inputTokens,
      output: llmResponse.outputTokens,
    },
  };
}
```

## Why Promise.all (NIE sequential)

### Sequential approach (rejected)
```typescript
// SLOW — total 30-60s
const v1 = await runIndustrySkill(skill, input, preset1, ctx);  // 10-20s
const v2 = await runIndustrySkill(skill, input, preset2, ctx);  // 10-20s
const v3 = await runIndustrySkill(skill, input, preset3, ctx);  // 10-20s
```

### Promise.all approach (used)
```typescript
// FAST — total max(t1, t2, t3) ~15-25s
const [v1, v2, v3] = await Promise.all([
  runIndustrySkill(skill, input, preset1, ctx),
  runIndustrySkill(skill, input, preset2, ctx),
  runIndustrySkill(skill, input, preset3, ctx),
]);
```

Savings: 2× to 3× w wall-clock time. LLM costs identical (3 calls regardless of order).

## Rate limiting + provider quota

LLM provider rate limits (Anthropic example):
- Claude Sonnet 4.6+ Tier 1: 50 req/min input + 100k tokens/min
- Multi-variant burst: 3 simultaneous requests within ~1s of each other

**Risk**: Multi-user concurrent multi-variant runs could hit rate limit.

**Mitigation**:
1. **In-process queue**: gdy >2 multi-variant runs concurrent, queue tail variants
2. **Provider fallback**: gdy Anthropic rate-limited, fall back do OpenAI (rule 007 multi-provider)
3. **Token bucket per skill**: 3 tokens per multi-variant run, refill 1 token/10s
4. **User-friendly error**: "Generating 3 variants in queue (position 2). Estimated 15s..."

```typescript
class MultiVariantQueue {
  private active: number = 0;
  private readonly maxConcurrent: number = 6;   // 6 variants = 2 multi-variant runs

  async enqueue<T>(fn: () => Promise<T>): Promise<T> {
    while (this.active >= this.maxConcurrent) {
      await this.waitForSlot();
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
    }
  }

  private waitForSlot(): Promise<void> {
    return new Promise(resolve => {
      const check = setInterval(() => {
        if (this.active < this.maxConcurrent) {
          clearInterval(check);
          resolve();
        }
      }, 250);
    });
  }
}
```

## Error handling strategy

### Failure modes

1. **Variant timeout (45s)**: LLM hung or slow
2. **Variant LLM error**: Rate limit / API error / invalid response
3. **Variant validation fail**: Output doesn't match JSON Schema v1
4. **Total timeout (60s)**: Multi-variant exceeded hard ceiling
5. **Provider unavailable**: All registered providers down

### Recovery patterns

| Failure | Recovery |
|---------|----------|
| 1 variant fails | Return 2/3 variants; mark failed w meta; UI shows "Variant N: Regenerate?" |
| 2 variants fail | Return 1/3 variant; UI shows error + "Try again" button |
| 3 variants fail | Return error; auto-retry once z different provider |
| Total timeout | Return whatever completed before timeout |
| Provider unavailable | Fall back do MockProvider w dev/CI (rule 007) |

### Per-variant atomicity

Each variant writes to its own tmp directory atomically:
```
~/.roduq/output/{clientId}.tmp/
├── variants/
│   ├── 1-conservative/   ← variant 1 writes here
│   ├── 2-modern/         ← variant 2 writes here (parallel)
│   └── 3-bold/           ← variant 3 writes here (parallel)
```

Final rename happens only AFTER all 3 (or partial) variants complete write phase. Files inside `variants-N/` are validated z ajv per `.cursor/rules/004-file-protocol.mdc`.

## Token budget (LLM costs)

### Per-variant cost (Anthropic Claude Sonnet 4.6+)

| Step | Input tokens | Output tokens | Cost (USD) |
|------|--------------|---------------|-----------|
| Skill instructions (system) | 8-15k | — | $0.024-0.045 |
| User brief + preset hint | 2-5k | — | $0.006-0.015 |
| LLM output (tokens + sections + content + design-system) | — | 8-15k | $0.060-0.113 |
| **Per variant total** | ~10-20k | ~8-15k | **~$0.10-0.17** |

### Multi-variant run cost
- 3 variants: **~$0.30-0.51 per run**
- 100 runs/month (Roduq agency typical): **~$30-50/month**
- 500 runs/month (heavy use): **~$150-255/month**

### Cost optimization opportunities

1. **Prompt caching** (Anthropic): cache common system prompt across 3 variants → ~20% input cost reduction
2. **Smaller models dla Conservative variant**: Claude Haiku acceptable dla low-risk variants → ~80% cost reduction for variant 1
3. **Response caching**: identical brief regeneration returns cached result (free, 0ms)
4. **OpenAI fallback gdy Anthropic burst-limited**: GPT-4o ~50% Anthropic cost dla similar quality
5. **Mock provider dla dev/CI**: zero cost, deterministic output dla testing

## Provider abstraction integration

Per rule 007 (`.cursor/rules/007-llm-providers.mdc`), multi-variant uses LLMRouter:

```typescript
// All 3 variants invocations use ctx.llmRouter.pick()
// User can prefer Anthropic globally, or per-variant override
const provider = ctx.llmRouter.pick(skill.modelHint);
```

**Why use abstraction**:
- Test environments use MockProvider (no API key needed)
- Klient z OpenAI subscription może swap provider
- Gemini available dla Google Workspace clients
- Failure tolerance — fallback do other provider gdy primary down

## Observability + logging

```typescript
ctx.logger.info("multi-variant: start", {
  clientId,
  industrySkill,
  variants: invocations.map(i => ({ id: i.id, label: i.label, preset: i.preset })),
});

const startTime = Date.now();
const results = await executeMultiVariant(invocations, ctx);
const duration = Date.now() - startTime;

ctx.logger.info("multi-variant: complete", {
  clientId,
  duration,
  status: results.every(r => r.status === "complete") ? "success" : "partial",
  variantStatuses: results.map(r => ({ id: r.id, status: r.status, ms: r.executionTimeMs })),
  totalTokensUsed: results.reduce((sum, r) => sum + r.tokensUsed.input + r.tokensUsed.output, 0),
  estimatedCostUsd: calculateCost(results),
});
```

## Performance benchmarks (target, Phase 7 will measure)

| Scenario | Target | Acceptable |
|----------|--------|-----------|
| All 3 complete | <25s p50 | <30s p95 |
| 1 variant timeout (45s), 2 succeed | <45s | <50s |
| All 3 timeout | 45s + cleanup ~50s | <60s |
| Cold start (LLM provider init) | +2-5s overhead | Acceptable |
| Warm pool (prompts cached) | -3-5s improvement | Bonus |

Phase 7 will add Playwright e2e test:
```typescript
test("multi-variant generates 3 variants under 30s", async () => {
  const start = Date.now();
  const results = await runMultiVariant({ brief: TEST_BRIEFS.saasFreelance });
  expect(Date.now() - start).toBeLessThan(30_000);
  expect(results.length).toBe(3);
  expect(results.every(r => r.status === "complete")).toBe(true);
});
```

## Testing strategy

### Unit tests (Vitest)
- Industry detection logic
- Preset matrix lookup
- Per-variant invocation
- Error handling per failure mode
- Token cost calculation

### Integration tests (Vitest + MockProvider)
- 3 variants generate w parallel
- 1 variant fails → 2/3 return
- Atomic write to tmp + rename
- Schema validation per variant
- meta-multi-variant.json populated correctly

### E2E tests (Playwright)
- User submits brief → 3 variants render w iframe
- User picks variant → files promoted to root
- User regenerates 1 variant → only that variant re-runs
- Performance: <30s for happy path

### Manual smoke tests
- Test z 5+ briefs across industries
- Test z brand color overrides
- Test z preset overrides
- Test rate limiting behavior

## Phase 7 implementation notes

When wiring code w Phase 7:

1. **Use existing `@open-design/web` SDK** — already has `@anthropic-ai/sdk` + `openai` dependencies
2. **Add `ajv` dependency** — JSON Schema validation
3. **Implement w `apps/daemon`** (NOT `apps/web`) — daemon owns skill execution per upstream AGENTS.md line 19
4. **Skill loader** — read `skills/multi-variant/SKILL.md`, parse frontmatter z `yaml` library
5. **Output writer** — `~/.roduq/output/{clientId}/` per rule 004
6. **Telemetry opt-in** — per rule 005, NIE blocking, only summarized metrics
