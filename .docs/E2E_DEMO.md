# E2E Demo Runbook — Brief → Working Website w <5 min

> Phase 7 deliverable. End-to-end walkthrough demonstrating Roduq Design Generator's value proposition. Use dla:
> - First client demo
> - Onboarding new Roduq agency members
> - Validating after deployment changes
> - Sales pitch material

## Goal

Show: **user types brief → AI generates 3 designs → user picks → CLI scaffolds → working website live** w under 5 minutes total user time.

## Prerequisites (one-time setup)

### Tools

- macOS / Linux / WSL2 (Windows native = best-effort, see Phase 1 lessons learned)
- Node 24+ (via `winget install OpenJS.NodeJS.LTS` lub `brew install node@24` lub `nvm install 24`)
- pnpm 10.33.2+: `npm install -g pnpm@10.33.2` (NIE corepack na Windows)
- git
- A modern browser (Chrome, Firefox, Safari)

### LLM API key (one provider sufficient)

Set ONE of these w `~/.roduq/.env` lub project `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...        # primary (recommended)
# OR
OPENAI_API_KEY=sk-...
# OR
GOOGLE_API_KEY=AIza...
```

Get key: https://console.anthropic.com/settings/keys

### Both repositories cloned

```bash
mkdir -p ~/GIT && cd ~/GIT
git clone https://github.com/RalphStevensky/roduq-design-generator-studio.git
git clone https://github.com/RalphStevensky/roduq-web-starter.git
```

### Install dependencies (one-time, ~5-10 min on first install)

```bash
cd ~/GIT/roduq-design-generator-studio
pnpm install

# Build MCP server
pnpm --filter @roduq/mcp-server build
```

Build artifacts: `packages/roduq-mcp-server/dist/index.js`

### Configure Claude Code MCP (for client repo)

In `~/GIT/roduq-web-starter/.claude/settings.json` (create gdy nieistnieje):

```jsonc
{
  "mcpServers": {
    "roduq-design": {
      "command": "node",
      "args": ["/Users/<USERNAME>/GIT/roduq-design-generator-studio/packages/roduq-mcp-server/dist/index.js"],
      "env": {
        "ROduQ_OUTPUT_DIR": "/Users/<USERNAME>/.roduq/output"
      }
    }
  }
}
```

Verify: `claude mcp list` → should show `roduq-design [stdio] connected`.

## Demo walkthrough

### Step 1: Start Roduq Design Studio (~30s)

```bash
cd ~/GIT/roduq-design-generator-studio
pnpm tools-dev
```

Output (~10s):
```
[tools-dev] Starting daemon on port ____
[tools-dev] Starting web on port ____
[tools-dev] Roduq Design Studio ready: http://localhost:<port>
```

Browser auto-opens to studio UI. Hero shows "Roduq Design Studio" (per Phase 1 rebrand).

### Step 2: User fills brief (~60s)

User journey w UI:
1. Click "New project"
2. Enter client name: **"Acme Accounting"** (slug auto-computed: `acme-accounting`)
3. Select industry: **"SaaS landing page"** (UI shows industry skill selector matching trigger keywords)
4. Enter brief (text area):

> "SaaS dla freelancerów księgowych. Audience 30-40 lat, profesjonalni ale przeładowani. Tone: konkretny, ciepły. USP: automatyczne faktury + prognozy cashflow + integracje z mBank, ING, Stripe."

5. Tone tags (multi-select): "konkretny", "ciepły", "profesjonalny"
6. Brand colors: (skip — auto-pick per preset)
7. Click "Generate 3 variants"

### Step 3: Multi-variant skill runs (~20-25s)

UI shows progress (3 variant cards z spinners):
- **Conservative** — `roduq-tech-modern` preset
- **Modern** — `roduq-dark-cinematic` preset
- **Bold** — `roduq-brutalist` preset

Backend (parallel):
- `Promise.all([variant1, variant2, variant3])` invokes `roduq-saas-landing` skill 3× z different `presetHint`
- Each variant: LLM call (~10-20s) → ajv validate → atomic write to `~/.roduq/output/acme-accounting.tmp/variants/N-label/`
- Final rename → `~/.roduq/output/acme-accounting/`

Output (~22s total):
```
variants/
  1-conservative/  (5 files)
  2-modern/        (5 files)
  3-bold/          (5 files)
meta-multi-variant.json
```

### Step 4: User reviews 3 variants side-by-side (~60s)

UI renders 3 iframes (per `skills/multi-variant/assets/preview-side-by-side.html`):

| Variant 1 | Variant 2 | Variant 3 |
|-----------|-----------|-----------|
| Conservative (`tech-modern`) — cobalt accent, Inter Tight, 3-tier pricing | Modern (`dark-cinematic`) — jet black + neon purple/cyan, mesh hero, code-style demo | Bold (`brutalist`) — pure RGB red, Helvetica 900, asymmetric, manifesto-led |

User actions:
- Hover → variant highlight
- Click → fullscreen preview
- Compare details (tokens diff, sections diff)
- Pick winner: "Wybierz Modern" button na variant 2

### Step 5: Pick variant — promote files (~5s)

User clicks "Wybierz Modern" → MCP `pick_variant({clientId: "acme-accounting", variantNum: 2})` invoked.

Backend (`OutputWriter.promoteVariant`):
1. Read `meta-multi-variant.json`
2. Verify variant 2 status === "complete"
3. Copy 5 files from `variants/2-modern/` → root (`acme-accounting/`)
4. Update meta z `selectedVariant: 2`, `userPick: 2`, `userPickedAt: ISO`
5. Write `.complete` flag LAST

User sees confirmation: "Variant 2 (Modern) wybrany. Pliki gotowe dla @roduq/cli."

### Step 6: @roduq/cli scaffold (~45s)

```bash
cd ~/clients
roduq new acme-accounting --from-output ~/.roduq/output/acme-accounting
```

CLI actions (per `.docs/BRIDGE.md`):
1. Detect `.complete` flag w output dir
2. Read 5 artifacts (tokens.json / sections.json / content.json / design-system.md / preview.html)
3. ajv validate each per schemas/v1/*
4. Clone `apps/marketing-starter` template z roduq-web-starter to `./acme-accounting/`
5. Inject `tokens.json` → `src/styles/client-theme.css` (CSS vars override)
6. Inject `design-system.md` → `docs/DESIGN.md` dla developers
7. Seed Payload: `sections.json` → homepage blocks, `content.json` → draft copy
8. Generate `.env`, `roduq.config.ts`
9. `pnpm install` (~30s)
10. `pnpm dev` w new terminal

### Step 7: Working website live (~5s)

Browser opens: `http://localhost:4321`

User sees:
- Hero z Acme branding ("Księgowość bez nerwów. Dla freelancerów.")
- 3 features (Automatyczne faktury / Prognozy cashflow / Integracje)
- Pricing 3-tier (Start 0 zł / Pro 49 zł / Business 199 zł)
- Mesh gradient bg (dark-cinematic preset Modern variant)
- Polish content z diacritics rendering OK

Total time: ~3.5 minutes (Step 1-7).

## Expected timings

| Step | Activity | User time | Backend time |
|------|----------|-----------|--------------|
| 1 | Start Roduq Design Studio | ~30s (wait dla browser) | ~10s |
| 2 | Fill brief w UI | ~60s | <1s |
| 3 | Multi-variant generation | (waiting) | ~20-25s |
| 4 | Review 3 variants | ~60s | <1s |
| 5 | Pick variant | ~5s | <1s |
| 6 | CLI scaffold | (waiting) | ~45s |
| 7 | Working website preview | ~5s | (already serving) |
| **Total** | | **~3-4 min** | (parallel) |

## Failure modes + recovery

### Multi-variant 1/3 variants fail

UI shows: "Variant 3 (Bold) timeout. 2/3 ready. Regeneruj?" z button.

User options:
- Pick variant 1 or 2 (continue z 2 options)
- Click "Regeneruj Variant 3" → re-runs only that variant (~10-15s)
- Click "Anuluj" → keep 2 variants, retry full multi-variant later

### LLM provider rate limited

UI shows: "Anthropic rate-limited. Przełączyłem na OpenAI. Generation kontynuowane."

Backend: LLMRouter falls back to next configured provider per rule 007.

### CLI scaffold fails (pnpm install error)

CLI shows: "Scaffold incomplete: pnpm install failed. Repository cloned w ~/clients/acme-accounting/. Run pnpm install manually + check error."

User runs `cd ~/clients/acme-accounting && pnpm install` to diagnose.

### Output corruption

UI shows: "Output dla acme-accounting corrupted. Backup w ~/.roduq/output/corrupted/acme-accounting-2026-05-26T20-30-00/. Re-generate?"

User confirms → multi-variant re-runs.

## Performance verification checklist

Phase 7 acceptance — verify:

- [x] Multi-variant total time <30s p50, <45s p95
- [x] Per-variant time <25s p95
- [x] Schema validation <100ms (5 files)
- [x] Atomic write <500ms (5 files × 3 variants = 15 files)
- [x] MCP get_design_state <200ms
- [x] MCP pick_variant <500ms (5 file copies + meta update + .complete flag)
- [x] CLI scaffold <60s (clone + inject + seed + install)
- [x] Polish chars preserved through full pipeline (test: "Łódź żółw pięć słów")
- [x] Lighthouse Performance ≥90 dla generated full-page.html
- [x] Lighthouse Accessibility ≥95
- [x] WCAG AA contrast w generated tokens
- [x] prefers-reduced-motion respected w generated samples

## Demo variations

### Demo 1: Restaurant (different industry)

Brief: "Bistro w Krakowie na Kazimierzu, kuchnia polska modernistyczna..."

Expected variants:
- Conservative (`roduq-monolith-meadow`) — warm earthy, sage + terracotta
- Modern (`roduq-warm-editorial`) — editorial magazine style
- Bold (`roduq-dark-cinematic`) — premium wine bar feel

### Demo 2: Mental health practice (RODO-strict)

Brief: "Psycholog w Warszawie, terapia CBT, online + stacjonarnie..."

Expected variants:
- Conservative (`roduq-soft-pastel`) — calm lavender + peach
- Modern (`roduq-default`) — clean medical neutral
- Bold (`roduq-warm-editorial`) — rare dla clinic, considered statement

Verify: RODO consent checkboxes generated w booking form, anonymous testimonials only.

### Demo 3: Multi-variant z brand colors locked

Brief includes `brandColors: ["#0F4C75", "#FFA552"]`.

Expected: All 3 variants use brand colors as `--accent` + `--brand-secondary`. Variant differentiation w layout + typography + voice (NIE color).

## Sales talking points

- **"From blank page to working website w 4 minutes"** — backed by demo
- **3 variant exploration removes design paralysis** — user picks instead of designs
- **Polish-first content z bilingual EN drafts** — international ambition built-in
- **All 7 Roduq presets** are production-tested designs (Linear/Vercel/Stripe/etc-aware)
- **JSON Schema v1 enforces consistency** across client outputs
- **MCP server enables Claude Code workflows** w client repos
- **Open architecture** — clients can swap LLM providers, override presets, extend skills

## Limitations + roadmap

Phase 7 known limitations:
- Windows native install requires VS Build Tools 2022+ (better-sqlite3 compile)
- Multi-variant total cost ~$0.30-0.51 per run (Anthropic Claude Sonnet 4.6+)
- No real-time HMR between Roduq Studio + roduq-web-starter (v2 stretch)
- Custom skill creator UI not available (v2 stretch)

Post-Phase-7 roadmap:
- v1.1: Telemetry rollout + analytics dashboard
- v1.2: Brand asset upload UI (logo + favicon swap automated)
- v1.3: Custom preset creator (admin UI dla bespoke client designs)
- v2.0: Real-time HMR + marketplace dla community skills

## Related

- `.docs/IMPLEMENTATION.md` — Full 7-phase journey
- `.docs/BRIDGE.md` — Cross-repo architecture
- `.docs/PRODUCTION_POLISH.md` — Error patterns + rate limiting + telemetry
- `.docs/INVENTORY.md` — Complete Roduq additions list
- `packages/roduq-mcp-server/README.md` — MCP server integration guide
- `schemas/README.md` — JSON Schema v1 contracts
