---
name: roduq-portfolio
description: |
  Generate complete portfolio website dla freelancer / artist / small studio z hero + work-grid + about + skills + contact.
  Personal, creative voice. Polish-first content z optional EN dla international clients. Work-led layout.
triggers:
  - "portfolio"
  - "portfolio website"
  - "freelancer portfolio"
  - "designer portfolio"
  - "developer portfolio"
  - "artist portfolio"
  - "personal website"
  - "strona osobista"
  - "portfolio fotografa"
  - "portfolio ilustratora"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: portfolio
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq Portfolio Website Generator

> Industry skill dla freelancer / artist / solo creator / small studio. Work-led, personal voice.

## What it does

Generate portfolio website z:
- **Hero** — personal positioning + key role/specialty + photo (optional)
- **Work grid** — projects/pieces w masonry lub uniform grid
- **Project detail page** — case study format z story + visuals + outcomes
- **About** — personal story, skills, philosophy
- **Skills / Tools** — tech stack lub craft toolkit
- **Contact** — direct email + form + social links

Polish primary z optional EN dla international clients (common dla designers / developers).

## When to use

✅ Solo freelancer (designer / developer / writer / photographer / illustrator)
✅ Artist personal website (painter / musician / filmmaker)
✅ Boutique studio (1-5 osób, partnership model)
✅ Creative professional seeking gigs / commissions / employment
✅ Side project showcase

❌ NIE używaj dla:
- Mid-sized agency (5+ osób, services-led) → use `roduq-agency`
- Creative agency z dedicated services → use `roduq-agency`
- Product launch → use `roduq-product-launch`
- Multi-author publication → use `roduq-saas-landing` lub custom

## Instructions

### Step 1 — Parse brief

```typescript
type PortfolioBrief = {
  creatorName: string;
  role: string;                 // "UI/UX Designer", "Photographer", "Full-stack Developer"
  city: string;
  yearsExperience: number;
  workSamples: { title: string; type: string; year: number; image?: string }[];
  skills?: string[];            // Tech stack or craft tools
  availability: "open" | "limited" | "booked" | "selective";
  workTypes: string[];          // ["UI design", "Brand identity", "Illustration"]
  clientPreferences?: string;   // "Tech startups", "Heritage brands", "Editorial"
  pricing: "rates-page" | "request-quote" | "value-based" | "hidden";
  toneAdjectives: string[];     // ["personal", "minimalist", "playful"]
  languages: ("PL" | "EN" | "DE" | "FR")[];
};
```

### Step 2 — Select preset

| Portfolio type | Preferred preset |
|---|---|
| UX/UI designer | `tech-modern` lub `default` |
| Branding designer | `monolith-meadow` lub `warm-editorial` |
| Photographer | `warm-editorial` lub `dark-cinematic` |
| Illustrator / Artist | `soft-pastel` lub `brutalist` |
| Developer (full-stack) | `tech-modern` lub `dark-cinematic` |
| Writer / Editor | `warm-editorial` |
| Statement / experimental | `brutalist` |

### Step 3 — Generate sections.json

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "personal-statement" | "split-with-photo" | "work-led" },
      { "blockType": "work-grid", "variant": "masonry" | "uniform-grid" | "horizontal-scroll" },
      { "blockType": "about", "variant": "split-photo-text" | "story-led" },
      { "blockType": "skills", "variant": "tag-cloud" | "categorized-list" | "tool-icons" },
      { "blockType": "testimonials", "variant": "client-quotes" | "single-spotlight" },
      { "blockType": "contact", "variant": "form-with-email" | "calendly-embed" }
    ]
  },
  "pages": {
    "/prace": { "blocks": [...] },
    "/prace/{project-id}": { "blocks": [...] },
    "/o-mnie": { "blocks": [...] },
    "/kontakt": { "blocks": [...] }
  }
}
```

### Step 4 — Generate content.json

**Voice principles (portfolio-specific)**:
- **Personal first-person** — "Jestem...", "Pracuję z...", NIE "Naszym celem..."
- **Show personality** — quirks OK ("Wciągam się w problemy. Czasem zbyt głęboko.")
- **Work-led claims** — show through case studies, NIE "I'm the best at..."
- **Polish "Ty"** dla freelance audience (peer-to-peer relationship)
- **Authenticity > polish** — natural language, NOT corporate

**Hero patterns**:
- Personal statement: "{Role} z {City/specialty}."
- "Projektant UX/UI z Warszawy. Pracuję z marką, kodem i czasem."
- "Photographer + storyteller. Portret i editorial. Kraków."
- Work-led: "Ostatnio: {project} dla {client}." (latest work prominent)

### Step 5 — Project detail pages

Per project case study structure:
1. **Hero shot** — best visual of project
2. **Meta row** — Client / Year / Role / Type
3. **Brief** — 1-paragraph problem statement
4. **Process** — 3-5 steps z visuals interspersed
5. **Outcome** — final visuals (large) + metric if applicable
6. **Reflection** — 1-paragraph "what I learned / what I'd do differently"
7. **Tech / tools** — used (tag list)

This format works dla designers / developers / photographers / illustrators alike.

### Step 6 — Optional EN site

Designers + developers often serve international clients. Recommend:
- **PL primary** dla local market discovery
- **EN secondary** at `/en/` subdirectory
- Same content structure
- Switch link prominent in nav

## Examples

### Example 1: UX/UI Designer freelancer

**Brief**: "UX/UI designer freelancer z Warszawy, 6 lat doświadczenia. Pracuję z SaaS B2B i fintech. Portfolio: 12 projektów. Pricing: request quote. Languages: PL + EN. Tone: konkretny, minimalist, profesjonalny."

**Output**:
- Preset: `tech-modern`
- Hero: "UX/UI Designer z Warszawy. Pracuję z SaaS B2B i fintech."
- Work grid: 8 featured projects (uniform-grid 3-col)
- About: split z photo + 3-paragraph story
- Skills: Figma · ProtoPie · Webflow · Tools list
- Contact: form + Calendly link
- EN site at /en/

### Example 2: Photographer

**Brief**: "Fotograf z Krakowa, 10 lat, specjalizacja: editorial + portrait. Portfolio: 24 sesji. Available: limited (selective projects). Tone: ciepły, artystyczny, dyskretny."

**Output**:
- Preset: `warm-editorial`
- Hero: "Aleksander Nowak — fotograf editorial + portret. Kraków."
- Work grid: masonry layout (uneven aspect ratios)
- About: long-form essay-style
- Project pages: full-bleed images, minimal text
- Contact: email primary, "selective projects" disclaimer

### Example 3: Full-stack developer

**Brief**: "Full-stack developer z Wrocławia, 8 lat. Stack: TypeScript + Node + React + Postgres. Open source contributor. Available: open dla long-term contracts. Tone: technical, no-fluff."

**Output**:
- Preset: `dark-cinematic`
- Hero: "{Imię}. Full-stack engineer. TypeScript / Node / Postgres."
- Work grid: 6 projects z tech stack tags
- GitHub repos featured (4-5 most active)
- About: technical bio + open source contributions
- Skills: structured tech stack list
- Contact: email + GitHub + LinkedIn

## Output contract

Standard 7 files per `.cursor/rules/004-file-protocol.mdc`.

## Related

- **Sister skills**: roduq-agency (when scaling to studio), roduq-product-launch (gdy creator launches product), roduq-clinic (single practitioner pattern similar)
- **Presets**: `tech-modern`, `warm-editorial`, `dark-cinematic`, `monolith-meadow`, `soft-pastel`, `brutalist`, `default`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-work-grid.html`](./assets/template-work-grid.html), [`./assets/template-about.html`](./assets/template-about.html)
