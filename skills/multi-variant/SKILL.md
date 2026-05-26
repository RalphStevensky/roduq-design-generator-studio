---
name: multi-variant
description: |
  Generate 3 design variants od jednego briefu — Conservative / Modern / Bold. User wybiera + exportuje wybrany variant.
  KEY DIFFERENTIATOR Roduq Design Studio. Promise.all parallel execution <30s total target. Orchestrator pattern: calls 7 industry skills (roduq-*) z różnymi preset hints per variant.
triggers:
  - "multi-variant"
  - "3 variants"
  - "compare designs"
  - "explore design directions"
  - "3 warianty"
  - "wybierz design"
  - "porównaj warianty"
  - "show me options"
  - "design comparison"
  - "ABC test design"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: orchestrator
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
    variant_count: 3
    parallel_execution: true
    target_execution_time_ms: 30000
---

# Multi-Variant Design Generator

> **KEY DIFFERENTIATOR** dla Roduq Design Studio. Jedna skill, trzy designy parallel, jeden wybór. Decoupling stuck-on-blank-page paralysis poprzez side-by-side comparison.

## What it does

Pojedyncza skill która orchestruje 3 parallel invocations of industry-specific skills (roduq-saas-landing / roduq-agency / etc.) z różnymi preset hints — w rezultacie generuje **3 fundamentally different design variants** dla tego samego briefu w pod 30 sekund:

- **Conservative variant** — proven layout, safe colors, minimal animations
- **Modern variant** — current trends, scroll animations, gradient/mesh accents
- **Bold variant** — statement piece, unconventional layout, strong visual identity

User widzi 3 preview HTML files w side-by-side iframe → wybiera 1 → wybrany variant exportowany do top-level `~/.roduq/output/{client-id}/` (pozostałe 2 saved w `variants-archive/` dla referencji).

## When to use

✅ User's first visit do generator (NIE wie co chce — exploration mode)
✅ Pitching client multiple options before commit
✅ A/B testing brand directions (heritage co. exploring rebrand)
✅ Indecisive client lub committee decision-making
✅ Senior designer chce widzieć "trzy kierunki" przed presentation

❌ NIE używaj gdy:
- User wie dokładnie co chce — use industry skill directly z preset hint
- Need only 1 specific aesthetic — Industry skill + preset more efficient
- Budget allows 3 separate generation runs (multi-variant = 3x LLM cost vs 1x — but parallel saves real time)

## Variant taxonomy (KEY concept)

### Variant 1: Conservative
- **Goal**: "Won't get fired for this" — proven patterns
- **Visual**: Standard layout (hero → features → pricing → CTA), neutral colors, single accent
- **Typography**: Sans-serif display, system body, conservative scale
- **Animation**: Minimal (fade-in on scroll only), no parallax
- **Target audience**: Risk-averse decision-makers (CFO, board, mid-market mainstream)

### Variant 2: Modern
- **Goal**: "Looks current, feels premium"
- **Visual**: Current trends (mesh gradients, bento grids, glassmorphism touches), 2 accent colors
- **Typography**: Modern display (Inter Display, Geist), tight tracking, larger hero
- **Animation**: Scroll-triggered animations (parallax restraint, 2-3 elements), backdrop blur nav
- **Target audience**: Marketing-aware buyers, tech-fluent, B2B SaaS norm

### Variant 3: Bold
- **Goal**: "Stand out or die trying"
- **Visual**: Asymmetric layouts, oversized typography, statement color (red/yellow/neon)
- **Typography**: Display weight 800-900, mixed scales aggressively
- **Animation**: Aggressive when present (color invert hover, marquee strips, ALL CAPS)
- **Target audience**: Brand-conscious buyers, stand-out positioning, design-led companies

## Preset selection matrix (per industry × per variant)

Multi-variant skill auto-selects preset per (industry, variant) combination:

| Industry | Conservative | Modern | Bold |
|---|---|---|---|
| `roduq-saas-landing` | `roduq-tech-modern` | `roduq-dark-cinematic` | `roduq-brutalist` |
| `roduq-agency` | `roduq-default` | `roduq-tech-modern` | `roduq-brutalist` |
| `roduq-restaurant` | `roduq-monolith-meadow` | `roduq-warm-editorial` | `roduq-dark-cinematic` |
| `roduq-clinic` | `roduq-soft-pastel` | `roduq-default` | `roduq-warm-editorial` |
| `roduq-real-estate` | `roduq-default` | `roduq-dark-cinematic` | `roduq-warm-editorial` |
| `roduq-product-launch` | `roduq-default` | `roduq-dark-cinematic` | `roduq-brutalist` |
| `roduq-portfolio` | `roduq-default` | `roduq-dark-cinematic` | `roduq-brutalist` |

Rationale per cell w [`./references/preset-mapping.md`](./references/preset-mapping.md).

User may override per variant: `--variant-2-preset=roduq-monolith-meadow` lub w UI.

## Execution flow

### Step 1 — Parse brief + detect industry

```typescript
type MultiVariantInput = {
  clientId: string;             // kebab-case slug — output directory name
  brief: string;                // free-form brief od user
  audience: string;
  toneAdjectives: string[];
  brandColors?: string[];       // hex codes if klient ma identity
  preferredVariants?: {         // optional per-variant overrides
    conservative?: string;      // preset slug
    modern?: string;
    bold?: string;
  };
};

type DetectedIndustry =
  | "saas-landing" | "agency" | "restaurant" | "clinic"
  | "real-estate" | "product-launch" | "portfolio";
```

**Industry detection** — match brief keywords against industry skills' `triggers` lists:
- "saas landing" / "software product" → `roduq-saas-landing`
- "agency" / "studio" / "agencja" → `roduq-agency`
- "restaurant" / "restauracja" / "café" → `roduq-restaurant`
- "clinic" / "gabinet" / "lekarz" / "psycholog" → `roduq-clinic`
- "real estate" / "biuro nieruchomości" → `roduq-real-estate`
- "launch" / "waitlist" / "premiera" → `roduq-product-launch`
- "portfolio" / "freelancer" → `roduq-portfolio`

Fallback: ask user explicit ("Which industry skill should I use?") gdy detection ambiguous.

### Step 2 — Look up preset per variant

Use matrix above (or user override). Produce 3 invocation configs:

```typescript
const variants = [
  { id: 1, label: "Conservative", preset: "roduq-tech-modern" },
  { id: 2, label: "Modern",       preset: "roduq-dark-cinematic" },
  { id: 3, label: "Bold",         preset: "roduq-brutalist" },
];
```

### Step 3 — Parallel execution z Promise.all

```typescript
const results = await Promise.all([
  invokeSkill("roduq-saas-landing", { ...input, presetHint: variants[0].preset, variantLabel: "Conservative" }),
  invokeSkill("roduq-saas-landing", { ...input, presetHint: variants[1].preset, variantLabel: "Modern" }),
  invokeSkill("roduq-saas-landing", { ...input, presetHint: variants[2].preset, variantLabel: "Bold" }),
]);
```

**Target execution time**: <30s total (per AGENT_PROMPT Phase 4 acceptance). Real-world: 15-25s z Anthropic Claude Sonnet 4.6+ depending na LLM latency. Each variant ~10-20s solo, parallel achieves overlap savings.

**Per-variant timeout**: 45s hard limit. Gdy variant fails → return partial result (2/3 variants), mark failed variant z error message.

Patrz [`./references/parallel-execution.md`](./references/parallel-execution.md) dla detailed pattern + error handling + token budget management.

### Step 4 — Write variants to `~/.roduq/output/{client-id}/variants/`

Atomic write per variant per `.cursor/rules/004-file-protocol.mdc`:

```
~/.roduq/output/{client-id}/
├── variants/
│   ├── 1-conservative/
│   │   ├── tokens.json
│   │   ├── sections.json
│   │   ├── content.json
│   │   ├── design-system.md
│   │   └── preview.html
│   ├── 2-modern/
│   │   └── ... (same structure)
│   └── 3-bold/
│       └── ... (same structure)
├── meta-multi-variant.json    # generation metadata + status per variant
└── (top-level files appear AFTER user picks variant)
```

**meta-multi-variant.json** format:
```json
{
  "$schema": "https://roduq.dev/schemas/v1/meta.schema.json",
  "version": "1.0.0",
  "type": "multi-variant",
  "clientId": "acme-corp",
  "generatedAt": "2026-05-26T20:30:00Z",
  "skill": "multi-variant",
  "industrySkill": "roduq-saas-landing",
  "executionTimeMs": 24300,
  "variants": [
    {
      "id": 1,
      "label": "Conservative",
      "preset": "roduq-tech-modern",
      "status": "complete",
      "tokensCount": 47,
      "sectionsCount": 7,
      "contentKeys": 38
    },
    {
      "id": 2,
      "label": "Modern",
      "preset": "roduq-dark-cinematic",
      "status": "complete",
      ...
    },
    {
      "id": 3,
      "label": "Bold",
      "preset": "roduq-brutalist",
      "status": "complete",
      ...
    }
  ],
  "selectedVariant": null,    // null until user picks
  "userPick": null,
  "userPickedAt": null
}
```

### Step 5 — Render side-by-side iframe preview

Open browser do `/preview/{clientId}` z 3 iframes load preview.html per variant:

See [`./assets/preview-side-by-side.html`](./assets/preview-side-by-side.html) dla iframe layout template (responsive: 3-col desktop / 1-col mobile z swipe / 2-col tablet).

User actions:
- **Click variant** → fullscreen preview tej variant
- **Pick this** button per variant → confirm + Step 6
- **Regenerate one** → re-runs single variant z hint ("more conservative", "darker palette")
- **Compare details** → diff view of tokens.json / sections.json między variants

### Step 6 — Promote selected variant to top-level

When user picks variant N:

```bash
# Promote variant N files to top-level
cp ~/.roduq/output/{client-id}/variants/N-{label}/* ~/.roduq/output/{client-id}/
# Update meta-multi-variant.json
sed -i 's/"selectedVariant": null/"selectedVariant": N/' meta-multi-variant.json
# Write .complete flag LAST (signals CLI consumer ready)
touch ~/.roduq/output/{client-id}/.complete
```

Unselected variants stay w `variants/` subdirectory dla future reference (user may "change mind" later).

## Examples

### Example 1: SaaS landing — księgowość freelancer

**Brief**: "SaaS dla freelancerów księgowych. Audience 30-40, profesjonalni ale przeładowani. Tone: konkretny, ciepły. USP: automatyczne faktury + prognozy cashflow."

**Detected industry**: `roduq-saas-landing`

**3 variants generated**:
- **Conservative** (`roduq-tech-modern`): clean B2B w cobalt accent + Inter Tight, sticky nav, 3-col features, tier pricing
- **Modern** (`roduq-dark-cinematic`): jet black + neon purple, mesh hero, code-style demo, premium feel
- **Bold** (`roduq-brutalist`): pure RGB accent (red), Helvetica 900, asymmetric, statement positioning

**Likely user pick**: Conservative dla mid-market freelancers (trust > flash), Modern dla tech-forward freelancers, Bold dla statement-conscious solo brands.

### Example 2: Restaurant — Italian wine bar Warszawa

**Brief**: "Wine bar w centrum Warszawy. Italian wines + cicchetti. 18 stolików + bar. Open 17-24. Tone: confident, intimate, knowledgeable."

**Detected industry**: `roduq-restaurant`

**3 variants generated**:
- **Conservative** (`roduq-monolith-meadow`): warm earthy palette, Fraunces serif, hero photo, traditional menu list, reservation form prominent
- **Modern** (`roduq-warm-editorial`): magazine-style editorial cover hero, drop-cap intro, food story prominent, anonymous Substack-style
- **Bold** (`roduq-dark-cinematic`): jet black + neon, premium SaaS-feel applied do wine bar — sommelier-led, glass tasting reservations, exclusive feel

Conservative trades tradition. Modern positions as "destination dining". Bold positions as "premium experience".

### Example 3: Agency — Polish branding studio Kraków

**Brief**: "Boutique branding studio w Krakowie, 12 osób. Heritage marek konsumenckich (FMCG, retail). Klienci 50-500 employees. Tone: konkretny, ciepły, dumny z rzemiosła."

**Detected industry**: `roduq-agency`

**3 variants**:
- **Conservative** (`roduq-default`): neutral Inter + cobalt, work-led, 3 case studies featured, process visualization
- **Modern** (`roduq-tech-modern`): bento case study grid, dark accents, mesh hero z brand positioning statement
- **Bold** (`roduq-brutalist`): Helvetica 900 manifesto-as-hero, asymmetric case study grid, yellow strip rhythm, statement positioning

Conservative = appeals do CMOs. Modern = appeals do brand managers. Bold = appeals do statement brands seeking match.

## Output contract

Per `.cursor/rules/004-file-protocol.mdc` extended dla multi-variant:

```
~/.roduq/output/{client-id}/
├── variants/
│   ├── 1-conservative/  (5 files)
│   ├── 2-modern/        (5 files)
│   └── 3-bold/          (5 files)
├── meta-multi-variant.json
│
├── (BELOW: appear only after user picks)
├── .complete            # signal flag
├── meta.json            # promoted from selected variant
├── tokens.json
├── sections.json
├── content.json
├── design-system.md
└── preview.html
```

**Atomic write protocol**:
1. Each variant written do tmp directory `~/.roduq/output/{client-id}.tmp/variants/N-{label}/`
2. ajv validate each per JSON Schema v1
3. Rename `client-id.tmp` → `client-id` (atomic on POSIX, near-atomic on Windows)
4. Write `meta-multi-variant.json` LAST
5. Open browser do preview
6. User picks → copy variant files to root + write `.complete`

## Performance budget

| Step | Target time | Notes |
|------|-------------|-------|
| Brief parse + industry detect | <500ms | Local — string matching |
| Variant config generation | <100ms | Lookup matrix |
| 3 parallel skill invocations | 15-25s | Promise.all, LLM-bound |
| Validate + write 3 variants | <2s | ajv + fs |
| Render iframe preview | <500ms | Static HTML |
| **Total target** | **<30s** | Phase 4 acceptance |

LLM token budget (Anthropic Claude Sonnet 4.6+):
- Per variant: ~30k input + ~10k output ≈ $0.30
- 3 variants: ~$0.90 per multi-variant run
- 100 multi-variant runs/month: ~$90/month (Roduq agency budget)

## Related

- **Sister skills**: 7 industry skills (`roduq-saas-landing`, `roduq-agency`, `roduq-restaurant`, `roduq-clinic`, `roduq-real-estate`, `roduq-product-launch`, `roduq-portfolio`) — multi-variant orchestrates these
- **Presets used**: all 7 Roduq presets across the 7×3 matrix (covered 100% of preset combinations)
- **File protocol**: `.cursor/rules/004-file-protocol.mdc` (extended dla `variants/` subdirectory)
- **LLM abstraction**: `.cursor/rules/007-llm-providers.mdc` (provider-agnostic invocation w Promise.all)
- **References**:
  - [`./references/variant-strategy.md`](./references/variant-strategy.md) — Conservative/Modern/Bold deep dive
  - [`./references/preset-mapping.md`](./references/preset-mapping.md) — 7×3 matrix rationale
  - [`./references/parallel-execution.md`](./references/parallel-execution.md) — Promise.all + timeout + token budget
- **Assets**:
  - [`./assets/preview-side-by-side.html`](./assets/preview-side-by-side.html) — iframe layout template
  - [`./assets/variant-picker.html`](./assets/variant-picker.html) — UI for picking variant
