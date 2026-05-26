---
name: roduq-agency
description: |
  Generate complete creative/marketing/design agency website z hero + services + case-studies + team + process + contact.
  Work-led layout (case studies prominent). Polish-first content. Produces tokens.json + sections.json + content.json + design-system.md.
triggers:
  - "agency"
  - "creative agency"
  - "marketing agency"
  - "design studio"
  - "branding studio"
  - "agencja kreatywna"
  - "agencja marketingowa"
  - "studio brandingowe"
  - "agencja reklamowa"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: agency
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq Agency Website Generator

> Industry-specific skill dla creative / marketing / design / branding agencies. Work-led, case-study heavy.

## What it does

Generate end-to-end agency website design system z work-first focus:
- **Hero** z statement positioning (1-zdaniowa pozycja market)
- **Services** grid (3-6 service offerings)
- **Case studies** prominent (3-6 najlepszych prac z metrics + visual)
- **Team / About** (founders + key creative directors)
- **Process** (3-5 step workflow)
- **Contact** z brief form lub Calendly embed

Output: PL primary + EN drafts, design tokens + Payload-ready blocks.

## When to use

✅ Creative agency (branding, design, content, video, performance)
✅ Marketing agency (B2B, B2C)
✅ Boutique design studio (3-30 people)
✅ Audience: marketing directors / CMOs / brand managers seeking external partner
✅ Sales cycle: 1-3 months, lead via inbound or referral

❌ NIE używaj dla:
- Software company → use `roduq-saas-landing`
- Freelancer solo → use `roduq-portfolio`
- Production company / VFX studio (visual-heavy single-niche) → use `roduq-portfolio` z modyfikacjami

## Instructions

### Step 1 — Parse brief

```typescript
type AgencyBrief = {
  agencyName: string;
  positioning: string;          // "Branding studio focusing on heritage brands" / 1-zdaniowa
  services: string[];           // ["branding", "web design", "content", "video"]
  audience: string;             // "Mid-market CMOs in CEE region"
  caseStudyCount: number;       // 3-6 najlepszych
  teamSize: "studio" | "boutique" | "midsize";  // ≤10 / 10-30 / 30+
  workSamples?: { client: string; metric: string; image?: string }[];
  toneAdjectives: string[];     // ["confident", "ciepły", "konkretny"]
};
```

### Step 2 — Select preset

| Agency type | Preferred preset |
|---|---|
| Heritage/lifestyle brand agency | `monolith-meadow` lub `warm-editorial` |
| Tech/SaaS-focused agency | `tech-modern` lub `dark-cinematic` |
| Statement/avant-garde studio | `brutalist` |
| General creative agency | `default` lub `soft-pastel` |

### Step 3 — Generate sections.json

Standard agency homepage sequence:

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "statement-text" | "split-with-work" },
      { "blockType": "logos-grid", "variant": "client-logos" },
      { "blockType": "services", "variant": "grid-3-col" | "cards-with-icons" },
      { "blockType": "case-studies", "variant": "featured-3" | "masonry" | "carousel" },
      { "blockType": "process", "variant": "horizontal-steps" | "numbered-list" },
      { "blockType": "team", "variant": "grid-with-bios" | "founders-spotlight" },
      { "blockType": "cta", "variant": "brief-form" | "calendly-embed" }
    ]
  },
  "pages": {
    "/prace": { "blocks": [...] },
    "/uslugi": { "blocks": [...] },
    "/o-nas": { "blocks": [...] },
    "/kontakt": { "blocks": [...] }
  }
}
```

### Step 4 — Generate content.json

**Voice principles agency-specific**:
- Confident bez arrogance ("Pomagamy markom heritage" > "Tworzymy najlepsze brandy na rynku")
- Work-led — let case study metrics talk
- Process-oriented — clients buy predictability + craftsmanship
- Polish "Ty/wy" depends na audience (mid-market → "Państwo / wy", startup → "Ty")

**Hero patterns**:
- PL: "Brandy które rosną przez 10 lat. Nie 10 miesięcy."
- EN: "Brands that last decades, not quarters."
- PL: "Strony które konwertują. Bez przesłania w stylu."
- EN: "Websites that convert. Without compromising style."

**Case study card template**:
```
[Client logo] | [Client name]
[Project type] (e.g. "Brand refresh + new website")
[Metric] (e.g. "+47% organic traffic w 6 miesięcy")
[Tags] (e.g. "Branding · Webdesign · CMS")
```

### Step 5 — Generate tokens + preview + meta

Per pattern w roduq-saas-landing § Step 6-8. Atomic write z ajv validation (Phase 5).

## Examples

### Example 1: Mid-market branding studio

**Brief**: "Branding studio z Krakowa, 12 osób. Specjalizujemy się w rebrand heritage marek konsumenckich (FMCG, retail). Klienci: 50-500 employees firms. Tone: konkretny, ciepły, dumny z rzemiosła."

**Output**:
- Preset: `monolith-meadow` (warm earthy — matches heritage focus)
- Hero: "Brand który Twoi klienci pamiętają. Bez gadżetów." (PL primary, EN backup)
- 4 case studies featured (FMCG client repositioning, retail rebrand, lifestyle co. visual identity, food co. packaging)
- Team: founders spotlight + grid 8 people
- Process: 5-step (Discovery → Strategy → Identity → Activation → Evolution)

### Example 2: Performance marketing agency

**Brief**: "Performance marketing agency dla SaaS B2B. 25 osób. Specializing in paid ads + SEO + lifecycle. Klienci: $1M-$50M ARR. Tone: data-driven, confident, terse."

**Output**:
- Preset: `tech-modern` (clean, data-forward)
- Hero: "ROAS że Twój CFO Cię pochwali. Nie tylko CMO." (Polish-PL alt: "Ad spend który się zwraca. Mierzone w przychodzie, nie kliknięciach.")
- Case studies: metric-heavy (e.g. "ARR od $2M → $12M w 18 miesięcy")
- Services: paid ads / SEO / lifecycle / analytics — 4-card grid
- Process: 3-step (Audit → Build → Scale)

## Output contract

Per `.cursor/rules/004-file-protocol.mdc` — 7 files w `~/.roduq/output/{client-id}/`:
1. `.complete` flag (written LAST)
2. `meta.json` { skill: "roduq-agency", ... }
3. `tokens.json` (JSON Schema v1)
4. `sections.json` (block types match canonical)
5. `content.json` (PL + EN)
6. `design-system.md`
7. `preview.html`

## Related

- **Sister skills**: roduq-saas-landing, roduq-portfolio (small agency / freelance), roduq-product-launch
- **Multi-variant**: invocable jako part of multi-variant generation
- **Presets**: `monolith-meadow`, `warm-editorial`, `tech-modern`, `brutalist`, `default`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-case-studies.html`](./assets/template-case-studies.html), [`./assets/template-services.html`](./assets/template-services.html)
