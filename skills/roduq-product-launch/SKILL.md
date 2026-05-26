---
name: roduq-product-launch
description: |
  Generate complete single-product launch website z hero (countdown/teaser) + features + waitlist + FAQ + social-proof.
  Anticipatory, exclusive, story-driven voice. Polish-first content. Email capture-optimized.
triggers:
  - "product launch"
  - "single product"
  - "waitlist"
  - "coming soon"
  - "launch page"
  - "premiera produktu"
  - "lista oczekujących"
  - "kickstarter campaign"
  - "single-page launch"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: product-launch
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq Product Launch Page Generator

> Industry skill dla single-product launches z waitlist focus. Anticipatory voice, exclusive feel, email-capture optimized.

## What it does

Generate single-product launch page z:
- **Hero** — countdown timer / teaser visual + waitlist CTA
- **Story** — why this product exists (origin / problem / vision)
- **Features** — 3-5 core features z visual mockups
- **Waitlist signup** — email capture z incentives (early access / discount)
- **FAQ** — addresses common pre-purchase questions
- **Social proof** — early supporters / press mentions / industry endorsements

Single-page focus, NIE multi-page architecture.

## When to use

✅ Single product launch (consumer good / SaaS pre-launch / book / album / hardware)
✅ Crowdfunding companion site (Kickstarter / Indiegogo)
✅ Pre-order page dla coming product
✅ Waitlist-only product (exclusive launch model)
✅ Audience: early adopters, niche enthusiasts

❌ NIE używaj dla:
- Existing multi-product business → use `roduq-saas-landing` lub `roduq-agency`
- Restaurant opening → use `roduq-restaurant`
- Service launch (consulting / agency) → use `roduq-agency` lub `roduq-portfolio`

## Instructions

### Step 1 — Parse brief

```typescript
type LaunchBrief = {
  productName: string;
  category: "hardware" | "software" | "book" | "album" | "course" | "physical-good";
  oneLinePitch: string;        // What it is, what it does, dla kogo
  uniqueValueProp: string;     // Why this, why now
  launchDate?: string;          // ISO date or "Q2 2026"
  launchType: "waitlist" | "pre-order" | "crowdfunding" | "coming-soon";
  earlyAccessIncentive?: string;  // "Pierwsi 100 zapisanych — 30% discount"
  targetAudience: string;       // "Polish founders 28-45 starting first SaaS"
  toneAdjectives: string[];     // ["ambitious", "exclusive", "story-driven"]
  productImagery: "hero-shot" | "lifestyle" | "abstract" | "video-teaser";
  estimatedPrice?: number;
  pressMentions?: { outlet: string; quote: string }[];
};
```

### Step 2 — Select preset

| Product type | Preferred preset |
|---|---|
| Hardware / consumer good | `dark-cinematic` (cinematic product reveal) |
| Software / SaaS / API | `tech-modern` lub `dark-cinematic` |
| Book / album / course | `warm-editorial` |
| Lifestyle / wellness product | `monolith-meadow` lub `soft-pastel` |
| Statement / avant-garde product | `brutalist` |

### Step 3 — Generate sections.json

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "countdown-teaser" | "story-hero" | "video-bg" },
      { "blockType": "story", "variant": "founders-letter" | "problem-vision" },
      { "blockType": "features", "variant": "showcase-cards" | "spec-list" },
      { "blockType": "waitlist", "variant": "form-with-incentive" | "stepped-form" },
      { "blockType": "social-proof", "variant": "press-mentions" | "early-supporters-count" },
      { "blockType": "faq", "variant": "accordion" },
      { "blockType": "cta", "variant": "waitlist-final" }
    ]
  }
}
```

Single-page typical — no /about, /pricing pages.

### Step 4 — Generate content.json

**Voice principles (launch-specific)**:
- **Anticipation > availability** — "Coming soon" energy, NIE "Buy now"
- **Story-driven** — origin story matters more than feature list
- **Exclusivity signaling** — "Pierwsi 500 zapisanych" / "Tylko 200 sztuk pierwsza produkcja"
- **Polish "Ty" przeważnie** — startup energy, NIE corporate
- **Specific dates** — "Premiera: kwiecień 2026" beats "Q2 2026"

**Hero patterns**:
- Countdown style: "{Product} — {pitch}. Premiera: {data}."
- "Aria. Smart home automation bez wifi. Premiera: 15.06.2026."
- Story style: "{Provocative question / statement}. {Product name w 2nd row}."
- "Dlaczego nikt nie zrobił aplikacji która JUST WORKS? Linear."

### Step 5 — Waitlist conversion optimization

**Best practices**:
- Email + name minimum (skip phone unless needed)
- Single field forms convert highest (just email)
- Incentive clear: "Pierwsi 100 — 30% off launch price"
- Show counter: "847 osób na liście"
- Confirmation: "Sprawdź email — potwierdź zapis"

**Anti-friction**:
- NO password requirement
- NO long forms
- NO captcha pre-submit (only if spam problem)
- Submit returns immediate (don't wait dla email send)

### Step 6 — Story section (CRITICAL)

Launch sites live or die by story. Universal structure:

1. **Hook**: provocative question or industry pain
2. **Origin**: "How we got here" — founder/team intro
3. **Vision**: what world looks like with this product
4. **Why now**: timing rationale

Length: 3-5 paragraphs. Photo of founder / team / process embedded.

## Examples

### Example 1: Hardware product launch (smart device)

**Brief**: "Aria — smart home hub bez wifi-dependence. Lokalna sieć Zigbee + Z-Wave + Thread. Polski startup, premiera Q2 2026 (15.06). Pre-order open, 30% off pierwsi 500. Tone: ambitious, technical-but-accessible."

**Output**:
- Preset: `dark-cinematic`
- Hero: hero shot product + "Aria. Smart home bez wifi. Premiera 15.06.2026."
- Countdown timer (8 weeks)
- Story: founders' frustration z cloud-only smart home + DIY hub journey + vision of local-first
- 4 features showcase (Zigbee + Z-Wave + Thread + offline-first)
- Waitlist form z "Pierwsi 500 — 30% off ($X savings)" incentive + counter "324/500 zapisanych"
- Press mentions (Spider's Web, Bezprzewodowy)
- FAQ: dlaczego nie wifi / kompatybilność / privacy / pricing

### Example 2: Book launch

**Brief**: "Nowa książka non-fiction — 'Rewolucja AI w Polsce'. Autor: znany ekspert tech. Premiera 5.05.2026. Pre-order. Tone: poważny, dziennikarski, ambitny."

**Output**:
- Preset: `warm-editorial`
- Hero: book cover + author photo + "Rewolucja AI w Polsce. Książka." + premiera date
- Story: dlaczego napisał, research process, who's it for
- 3 "chapter previews" (akademickie tłumaczenie themes)
- Pre-order form z incentive "Signed copy dla pierwszych 100"
- Press: industry endorsements
- FAQ: when shipping / signed copies / international shipping

## Output contract

Single-page focus — większość treści w homepage.blocks. Pages section minimal.

## Related

- **Sister skills**: roduq-saas-landing (full product page post-launch), roduq-portfolio (gdy creator-led launch)
- **Presets**: `dark-cinematic`, `tech-modern`, `warm-editorial`, `monolith-meadow`, `brutalist`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-story.html`](./assets/template-story.html), [`./assets/template-waitlist.html`](./assets/template-waitlist.html)
