---
name: roduq-restaurant
description: |
  Generate complete restaurant / café / bistro website z photo-heavy hero + menu + gallery + reservation + location + hours.
  Sensory, place-based voice. Polish-first content (PL + EN backup dla international guests).
triggers:
  - "restaurant"
  - "restauracja"
  - "café"
  - "cafe"
  - "kawiarnia"
  - "bistro"
  - "trattoria"
  - "pizzeria"
  - "food place"
  - "lokal gastronomiczny"
  - "strona dla restauracji"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: restaurant
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq Restaurant Website Generator

> Photo-heavy industry skill dla restaurants, cafés, bistros, food businesses. Sensory voice, place-as-character.

## What it does

Generate restaurant website design system z:
- **Hero** photo (food / interior / chef) z opening hours visible
- **Menu** — full menu (lub featured dishes) z prices + dietary tags
- **Gallery** — interior + food + people (lifestyle)
- **Reservation** — direct form or OpenTable/Resy embed
- **Location + hours** — map + address + opening times w days/hours format
- **Story / About** — chef bio + concept + sourcing

Polish-first content z EN backup dla international guests.

## When to use

✅ Restauracja / kawiarnia / bistro / pizzeria / food truck / catering
✅ Bar / pub / wine bar gdy menu jest core offering
✅ Hotel restaurant standalone
✅ Local audience: dineri (lokalni + przyjeżdżający na specjalne okazje)
✅ Photography of food + space available

❌ NIE używaj dla:
- Hotel website (multi-amenity) → use `roduq-portfolio` z mods or custom skill
- Food delivery aggregator → use `roduq-saas-landing`
- Cooking school / class → use `roduq-portfolio` or `roduq-clinic` z mods

## Instructions

### Step 1 — Parse brief

```typescript
type RestaurantBrief = {
  name: string;
  concept: string;              // "Modern Polish bistro" / "Italian trattoria"
  cuisine: string;              // "Polish modern" / "Italian / Mediterranean" / "Japanese izakaya"
  priceRange: "$" | "$$" | "$$$" | "$$$$";  // Cost level
  capacity?: number;            // Seats
  city: string;
  neighborhood?: string;
  openingHours: Record<string, string>;  // { mon: "12:00-22:00", tue: "12:00-22:00", ... }
  reservationSystem: "form" | "opentable" | "resy" | "phone" | "walkin-only";
  hasOutdoor?: boolean;
  dietaryAccommodations?: string[];  // ["vegan", "gluten-free", "halal"]
  signatureDishes?: string[];
  storyAngle?: string;          // "Family recipes from Mazury" / "Chef trained at Noma"
};
```

### Step 2 — Select preset

| Restaurant type | Preferred preset |
|---|---|
| Fine dining / chef-led | `monolith-meadow` (warm earthy) lub `warm-editorial` |
| Casual modern / bistro | `default` lub `warm-editorial` |
| Wine bar / cocktail bar | `dark-cinematic` |
| Family / traditional | `monolith-meadow` |
| Statement concept | `brutalist` (rzadko) |

### Step 3 — Generate sections.json

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "photo-fullscreen" | "split-with-photo", ... },
      { "blockType": "intro", "variant": "story-paragraph", ... },
      { "blockType": "menu-featured", "variant": "grid-with-photos" | "list-classic", ... },
      { "blockType": "gallery", "variant": "masonry" | "grid-3-col", ... },
      { "blockType": "reservation", "variant": "form-inline" | "embed-opentable", ... },
      { "blockType": "location", "variant": "map-with-hours", ... }
    ]
  },
  "pages": {
    "/menu": { "blocks": [...] },
    "/rezerwacja": { "blocks": [...] },
    "/o-nas": { "blocks": [...] },
    "/kontakt": { "blocks": [...] }
  }
}
```

### Step 4 — Generate content.json

**Voice principles (restaurant-specific)**:
- **Sensory language** — "ciepły zapach świeżego pieczywa", "chrupiąca skórka", "warm scent of fresh bread"
- **Place-as-character** — describe the space ("kameralna jadalnia na 24 osoby", "summer terrace overlooking Wisła")
- **Chef-driven story** — gdy chef ma background, mention konkretnie ("trenował w Noma, wrócił do Krakowa w 2022")
- **Local sourcing** — gdy applicable ("warzywa z lokalnych farm", "mięso z gospodarstw 50km od restauracji")
- **Polish "Państwo"** for fine dining, "Ty/wy" for casual

**Hero patterns**:
- PL: "{Concept koncepcji}. {Miejsce}."
- "Nowoczesna kuchnia polska. Kraków, ul. Floriańska."
- "Włoska trattoria od trzech pokoleń. Wrocław, Stare Miasto."

**Menu item template**:
```
{Dish name PL} / {Dish name EN}
{Description z key ingredients}
{Price} zł
{Dietary tags}: V / GF / spicy
```

### Step 5 — Image prompts

Photography critical dla restaurant. Per image prompt:
- Hero: "Top-down food shot, warm natural lighting, rustic wooden table, signature dish [name] composition, photorealistic, 16:9"
- Interior: "Restaurant interior, golden hour, intimate dining room, warm wood tones, candles on tables, 16:9"
- Chef: "Chef portrait, kitchen environment, action shot z plating dish, slight motion blur, professional food photography"
- Detail shots: "Close-up of [ingredient] preparation, hands visible, depth of field, photorealistic"

### Step 6 — Generate meta + atomic write

Standard pattern per `.cursor/rules/004-file-protocol.mdc`.

## Examples

### Example 1: Modern Polish bistro w Krakowie

**Brief**: "Bistro w Krakowie na Kazimierzu, 32 miejsca, kuchnia polska z modernistycznym twistem. Chef trenowany w restauracji 3-gwiazdkowej w Berlinie. Price range $$, lunch 12-15 / kolacja 18-23. Reservation via form. Tone: ciepły, professional, dumny z lokalnych składników."

**Output**:
- Preset: `monolith-meadow`
- Hero: "Kuchnia polska. Bez kompromisów. Bez ostentacji." (PL) + EN backup
- Concept paragraph: chef story + sourcing
- Menu featured: 6 signature dishes (3 lunch / 3 dinner)
- Gallery: 12 photos (interior + food + chef)
- Reservation: inline form (date / time / guests / notes)
- Location: map + opening hours table

### Example 2: Italian wine bar w Warszawie

**Brief**: "Wine bar w centrum Warszawy, 18 stolików + bar. Italian wines focus + cicchetti (small plates). Open 17-24 7 days. Walk-in friendly but reservations recommended. Tone: confident, knowledgeable, intimate."

**Output**:
- Preset: `dark-cinematic`
- Hero: "Włoskie wina. Polskie chleba i wybór serów." (statement w mood)
- Menu: wines (by glass + bottle) + cicchetti list
- Sommelier bio prominent
- Gallery: mood photography (dim lighting, wine pours)
- Reservation: OpenTable embed
- Location: Google Maps embed + landmark reference

## Output contract

Per `.cursor/rules/004-file-protocol.mdc` — 7 files w `~/.roduq/output/{client-id}/`.

## Related

- **Sister skills**: roduq-clinic (similar trust-building pattern), roduq-portfolio (chef portfolio if applicable)
- **Presets**: `monolith-meadow`, `warm-editorial`, `dark-cinematic`, `default`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-menu.html`](./assets/template-menu.html), [`./assets/template-reservation.html`](./assets/template-reservation.html)
