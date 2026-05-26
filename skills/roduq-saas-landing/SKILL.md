---
name: roduq-saas-landing
description: |
  Generate complete SaaS landing page design system z hero + features + pricing + testimonials + FAQ + CTA.
  Polish-first content (PL primary, EN drafts). Produces tokens.json + sections.json + content.json + design-system.md
  w ~/.roduq/output/{client-id}/, validated against JSON Schema v1.
triggers:
  - "saas landing"
  - "saas landing page"
  - "software product page"
  - "saas website"
  - "landing dla software"
  - "landing dla saas"
  - "strona dla saas"
  - "landing dla aplikacji"
  - "lp dla saas"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: saas
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq SaaS Landing Page Generator

> Industry-specific Anthropic skill dla software product landing pages. Część Roduq design pipeline — output consumed by `@roduq/cli` w [roduq-web-starter](../../README.md) monorepo.

## What it does

Generate end-to-end SaaS landing page design system z industry-appropriate:
- **Color palette** + typography + spacing tokens (validated z JSON Schema v1)
- **Section sequence** (hero → features → social-proof → pricing → testimonials → FAQ → CTA)
- **Draft copy** PL primary + EN backup per section
- **Image prompts** dla AI image generation (Replicate / DALL-E / etc.)
- **design-system.md** human-readable summary dla developer handoff

Output landed w `~/.roduq/output/{client-id}/` → consumed by `@roduq/cli` w roduq-web-starter monorepo → injected into Astro 6 + Payload CMS scaffold.

## When to use

✅ Brief mentions SaaS / software / aplikacja / tool / platform / dashboard
✅ Audience = decision-makers (CTOs, founders, ops leaders, SDRs, marketers, devs)
✅ Pricing tiers, free trial, demo, integrations są w scope
✅ Need conversion-focused page (CTA-driven, social proof heavy)
✅ Verticals: fintech, HR tech, dev tools, marketing tech, ops, analytics, etc.

❌ NIE używaj dla:
- Restauracja / kawiarnia → use `roduq-restaurant`
- Gabinet medyczny (lekarz/dietetyk/psycholog) → use `roduq-clinic`
- Biuro nieruchomości → use `roduq-real-estate`
- Single-product launch z waitlist → use `roduq-product-launch`
- Portfolio freelancer/agency → use `roduq-portfolio`
- Agencja kreatywna B2B → use `roduq-agency`

## Instructions

### Step 1 — Parse user brief

Extract structured input z user's free-form brief:

```typescript
type Brief = {
  productName: string;           // np. "FreshBooks alternative dla freelancerów"
  industry: string;              // np. "fintech / accounting"
  audience: string;              // np. "freelancerzy 30-40, profesjonalni ale przeładowani"
  toneAdjectives: string[];      // np. ["profesjonalny", "ciepły", "konkretny"]
  brandColors?: string[];        // optional — hex codes if klient ma identity
  competitors?: string[];        // optional — np. ["Stripe", "Linear"]
  pricingModel?: "freemium" | "trial" | "tiered" | "usage" | "enterprise";
  uniqueValueProp: string;       // 1-zdaniowe streszczenie "what makes this different"
};
```

Use Zod parse — throw helpful error gdy brief incomplete.

### Step 2 — Select preset (DESIGN.md system)

Map brief → preferred preset z `design-systems/`:

| Brief signal | Preferred preset | Why |
|---|---|---|
| Dev tools / DevTools / platform / API | `tech-modern` | Linear/Vercel aesthetic |
| Fintech / banking / consumer finance | `dark-cinematic` lub `tech-modern` | Premium trust |
| Marketing tech / SaaS B2B | `soft-pastel` lub `tech-modern` | Approachable |
| Editorial / content platform / publishing | `warm-editorial` | Long-form respect |
| Statement brand / unconventional positioning | `brutalist` | Stand out |
| Heritage / hospitality / wellness | `monolith-meadow` | Earthy trust |
| Default / no strong signal | `default` | Safe starter |

Allow user override gdy explicit ("use brutalist", "tech-modern please").

### Step 3 — Generate tokens.json

Read selected preset's `tokens.example.json` → adjust per brief:

- `color.brand.primary` — if brand colors provided, use them. Otherwise preset default.
- `color.brand.secondary` — complementary z primary
- `font.display` + `font.body` — preset default (Inter + Inter Tight for tech, Recoleta for monolith-meadow, etc.)
- `spacing.*` + `radii.*` — preset default

Validate z `schemas/tokens.v1.schema.json` (Phase 5). Throw on validation fail.

### Step 4 — Generate sections.json

Build homepage block sequence per SaaS landing best practice:

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "centered" | "split-right" | "mesh-gradient", ... },
      { "blockType": "social-proof", "variant": "logos-strip", ... },
      { "blockType": "features", "variant": "3-col-icons" | "alternating-rows", ... },
      { "blockType": "pricing", "variant": "3-tier" | "2-tier" | "single-cta", ... },
      { "blockType": "testimonials", "variant": "marquee" | "grid" | "single-spotlight", ... },
      { "blockType": "faq", "variant": "accordion" | "2-col-static", ... },
      { "blockType": "cta", "variant": "centered-gradient" | "split-form", ... }
    ]
  },
  "pages": {
    "/cennik": { "blocks": [...] },
    "/o-nas": { "blocks": [...] },
    "/kontakt": { "blocks": [...] }
  }
}
```

Block types **MUST match** `apps/marketing-starter/src/blocks/types.ts` w roduq-web-starter (canonical). Reference allowlist:

```typescript
const ALLOWED_BLOCKS = [
  "hero",
  "social-proof",
  "features",
  "stats",
  "pricing",
  "testimonials",
  "faq",
  "cta",
  "logos-grid"
];
```

### Step 5 — Generate content.json

Draft copy per section. **Polish primary + English backup**.

Voice principles (per `references/content-patterns.md`):
- **Active voice** > passive
- **Use "Ty"** (informal Polish dla SaaS — chyba że audience explicit formal)
- **Konkretne benefits** > abstract features ("Zaoszczędzisz 5h tygodniowo" > "Optymalizacja procesów")
- **Numeric proof** w hero ("12000+ klientów" / "98% retention")
- **NIE używaj** corporate-speak ("rozwiązanie kompleksowe", "synergia", "best-in-class")

Polish character handling: ą/ć/ę/ł/ń/ó/ś/ź/ż — verify w final output (test z "Łódź żółw pięć słów").

### Step 6 — Generate image prompts

Per section requiring imagery — draft prompt dla AI image generation:

```json
{
  "hero-1": "Modern accountant at standing desk z laptop, warm natural lighting through Scandinavian window, clean white desk, second monitor showing colorful charts, side angle camera, depth of field, photorealistic, 16:9 aspect ratio",
  "feature-automation-1": "Abstract isometric illustration of workflow automation, sage green + cream palette, smooth gradients, 3D depth, business workflow nodes connecting, vector style, 1:1 aspect"
}
```

Style hints z selected preset (warm-editorial → photojournalism, tech-modern → 3D isometric, brutalist → high-contrast B&W).

### Step 7 — Generate design-system.md

Human-readable summary dla developer handoff (in `roduq-web-starter` repo):

```markdown
# {Client Name} — Design System (SaaS Landing)

## Brand pillars

- {pillar 1 — z brief}
- {pillar 2}
- {pillar 3}

## Colors

- **Primary**: #{hex} ({color name}) — used for {CTAs, links, brand accents}
- **Surface**: ... 

## Typography

- **Display**: {font name} ({weight}) — hero headlines, large numbers
- **Body**: {font name} ({weight}) — paragraphs, lists, descriptions

## Voice

- Tone: {tone}
- Reading level: {grade}
- Polish-first, EN drafts for content team

## Generated by

`roduq-saas-landing` skill version {VERSION}, model {LLM}, w {date}.
```

### Step 8 — Atomic write + validate

Write all files atomically (per `.cursor/rules/004-file-protocol.mdc`):

1. Write do `~/.roduq/output/{client-id}.tmp/`
2. Validate each file z `ajv` against JSON Schema v1
3. Rename temp dir → final location
4. Write `.complete` flag LAST (signals CLI consumer ready)

## Examples

### Example 1: Freelance accounting SaaS

**Input brief**:
> "SaaS dla freelancerów księgowych. Audience 30-40 lat, profesjonalni ale przeładowani roboczo. Tone: konkretny, ciepły. Konkurujemy z FreshBooks i Stripe. Pricing: freemium + 2 tiery płatne. USP: automatyczne przypomnienia o fakturach i prognozowanie cashflow."

**Output structure** (`~/.roduq/output/freelance-accounting/`):
- `tokens.json` — preset `tech-modern` + brand primary `#0F4C75` (deep navy trust) + secondary `#FFA552` (warm accent)
- `sections.json` — homepage: hero (split-right + product mockup) → social-proof (12 logos strip) → features (3-col-icons: automation/forecasting/integrations) → pricing (3-tier) → testimonials (marquee) → FAQ (accordion) → CTA (centered + gradient)
- `content.json` — PL: "Księgowość bez nerwów. Dla freelancerów." / EN: "Stress-free accounting. For freelancers."
- `design-system.md` — pillars: konkretność / profesjonalizm / ciepło

### Example 2: B2B Dev Tools

**Input brief**:
> "Platform observability dla SaaS startupów. Audience: backend engineers, SREs, ops. Tone: technical, no-bullshit. Konkurencja: Datadog, Honeycomb. Pricing: usage-based + free tier 100GB/month."

**Output structure**:
- `tokens.json` — preset `dark-cinematic` + brand primary `#7C5CFC` (neon purple) + secondary `#22D3EE` (cyan accent)
- `sections.json` — hero (mesh-gradient + statement headline) → social-proof (engineering team logos) → features (alternating-rows + code snippets) → pricing (usage-based calculator) → testimonials (grid + engineer quotes) → FAQ (2-col-static) → CTA (split-form: signup w/ Google)
- Polish content secondary; English-first dla international dev audience

## Output contract

Per `.cursor/rules/004-file-protocol.mdc` — 7 files w `~/.roduq/output/{client-id}/`:

1. `.complete` — written LAST flag dla CLI consumer
2. `meta.json` — { generatedAt, skill: "roduq-saas-landing", prompt, variant, llmProvider, model, executionTimeMs }
3. `design-system.md` — human-readable summary
4. `tokens.json` — JSON Schema v1 validated
5. `sections.json` — JSON Schema v1 validated, blockTypes MUST match `apps/marketing-starter/src/blocks/types.ts`
6. `content.json` — JSON Schema v1 validated, PL + EN per key
7. `preview.html` — static snapshot dla verification

## Related

- **Sister skills**: roduq-agency, roduq-restaurant, roduq-clinic, roduq-real-estate, roduq-product-launch, roduq-portfolio
- **Multi-variant**: `skills/multi-variant` calls this skill 3× w parallel dla Conservative/Modern/Bold variants
- **Presets used**: `design-systems/tech-modern`, `design-systems/dark-cinematic`, `design-systems/soft-pastel`, `design-systems/default`
- **Output protocol**: [`.docs/BRIDGE.md`](../../.docs/BRIDGE.md) + [`.cursor/rules/004-file-protocol.mdc`](../../.cursor/rules/004-file-protocol.mdc)
- **References**:
  - [`./references/inspiration.md`](./references/inspiration.md) — industry references
  - [`./references/content-patterns.md`](./references/content-patterns.md) — copy structure dla SaaS
  - [`./references/target-audience.md`](./references/target-audience.md) — demographics + voice notes
- **Assets**:
  - [`./assets/template-hero.html`](./assets/template-hero.html) — boilerplate hero variants
  - [`./assets/template-features.html`](./assets/template-features.html) — feature grid variants
  - [`./assets/template-pricing.html`](./assets/template-pricing.html) — pricing tier variants
  - [`./assets/template-cta.html`](./assets/template-cta.html) — closing CTA variants
