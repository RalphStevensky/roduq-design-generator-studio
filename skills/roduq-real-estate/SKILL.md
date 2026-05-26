---
name: roduq-real-estate
description: |
  Generate complete real estate agency website z hero (search) + property listings + agent bios + market insights + contact.
  Polish primary, EN secondary dla international buyers. Trust-heavy, area-knowledge prominent.
triggers:
  - "real estate"
  - "real estate agency"
  - "biuro nieruchomości"
  - "agencja nieruchomości"
  - "pośrednik nieruchomości"
  - "agent nieruchomości"
  - "deweloper"
  - "developer"
  - "wynajem mieszkań"
  - "sprzedaż nieruchomości"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: real-estate
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
---

# Roduq Real Estate Agency Website Generator

> Industry skill dla biur nieruchomości / agentów / małych deweloperów. Search-first hero, listings prominent, neighborhood expertise.

## What it does

Generate real estate website z:
- **Hero z search bar** — quick filter (location / type / price range)
- **Featured listings** — top 3-6 properties z photo + price + key specs
- **Property categories** — sprzedaż / wynajem / komercyjne / inwestycyjne
- **Agent bios** — z specialization + neighborhoods + sales history
- **Market insights** — area trends, sold history, "co czeka w dzielnicy"
- **Contact** — form + agent direct phone + WhatsApp common
- **Mortgage calculator** (optional widget)

## When to use

✅ Agencja nieruchomości (5-50 agents)
✅ Single agent z personal brand
✅ Mały deweloper (1-3 inwestycje aktywne)
✅ Sprzedaż / wynajem / mix
✅ Audience: kupujący / sprzedający / wynajmujący

❌ NIE używaj dla:
- Duża sieć (50+ agents, multi-city) → custom enterprise skill
- Marketplace platforma (Otodom alternative) → use `roduq-saas-landing`
- Property management software → use `roduq-saas-landing`
- Single luxury property listing → use `roduq-product-launch`

## Instructions

### Step 1 — Parse brief

```typescript
type RealEstateBrief = {
  agencyName: string;
  agencyType: "boutique" | "mid-size" | "single-agent" | "developer";
  agentCount: number;
  city: string;
  neighborhoods: string[];      // Areas of specialization
  propertyTypes: ("apartment" | "house" | "commercial" | "land" | "investment")[];
  transactionTypes: ("sale" | "rent" | "both")[];
  averageListingPrice?: { sale: number; rent: number };  // PLN
  primarySegment: "budget" | "mid-market" | "premium" | "luxury";
  yearEstablished: number;
  notableTransactions?: { property: string; price: string; year: number }[];
  toneAdjectives: string[];     // ["professional", "ciepły", "lokalny"]
};
```

### Step 2 — Select preset

| Agency segment | Preferred preset |
|---|---|
| Premium / luxury | `dark-cinematic` lub `warm-editorial` |
| Mid-market boutique | `default` lub `tech-modern` |
| Budget / mass-market | `default` |
| Heritage properties / kamienice | `monolith-meadow` lub `warm-editorial` |
| Modern developer | `tech-modern` lub `dark-cinematic` |

### Step 3 — Generate sections.json

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "search-prominent" | "split-with-listings" },
      { "blockType": "listings-featured", "variant": "grid-3-col" | "carousel" },
      { "blockType": "neighborhoods", "variant": "tiles-with-map" | "stats-grid" },
      { "blockType": "agents", "variant": "team-grid" | "founders-spotlight" },
      { "blockType": "market-insights", "variant": "stats-callouts" | "blog-preview" },
      { "blockType": "testimonials", "variant": "satisfied-clients" },
      { "blockType": "cta", "variant": "consultation-form" | "phone-direct" }
    ]
  },
  "pages": {
    "/oferta": { "blocks": [...] },
    "/oferta/{listing-id}": { "blocks": [...] },
    "/zespol": { "blocks": [...] },
    "/dzielnice": { "blocks": [...] },
    "/kontakt": { "blocks": [...] }
  }
}
```

### Step 4 — Generate content.json

**Voice principles (real-estate specific)**:
- **Neighborhood expertise** — name specific streets, restaurants, schools ("blisko T. Kościuszki 12, 3 min do Tesco")
- **Realistic, not hype** — "Mieszkanie wymaga remontu" > "Mieszkanie do przeprowadzki" jeśli wymaga
- **Polish-first agent communication** — agent direct phone visible
- **Tax + finance transparency** — "Cena netto / brutto" / "Notariat extra" explicit
- **Polish "Państwo / Pan/Pani"** typical (real estate = formal context)

**Hero patterns**:
- PL: "Nieruchomości w {neighborhood / city}. {Specialization}."
- "Mieszkania na sprzedaż w Krakowie. Stare Miasto, Kazimierz, Podgórze."
- "Premium nieruchomości w Warszawie. Mokotów, Powiśle, Stare Miasto."

### Step 5 — Property listing card template

```
[Hero photo — most attractive room or facade]
[Price — bold, prominent]
[Title — adres lub identifier]
[Specs row — m² / pokoje / piętro / rok budowy]
[Tags — sprzedaż | wynajem | nowość | obniżka]
[Agent name + photo small]
[View details →]
```

### Step 6 — Neighborhood pages (SEO critical)

Real estate = local SEO heavy. Per neighborhood page:
- Hero z opisem dzielnicy (gentle, informative — not pushy)
- "Co znajdziesz" — schools, parks, transport, restaurants
- "Średnie ceny" — m² / sprzedaż / wynajem (z chart gdy applicable)
- "Najnowsze oferty" — z tej dzielnicy
- "Co czeka" — upcoming infrastructure (metro, park, school)

Polish neighborhood SEO important — landing pages dla "mieszkania Mokotów" / "nieruchomości Krzyki" / "wynajem Krowodrza" etc.

## Examples

### Example 1: Premium boutique w Warszawie

**Brief**: "Boutique agencja w Warszawie, 8 agentów, segment premium (1.5M-15M PLN). Specjalizacja: Mokotów, Powiśle, Stare Miasto. 12 lat. Tone: profesjonalny, dyskretny, lokalna wiedza."

**Output**:
- Preset: `dark-cinematic`
- Hero: search + "Premium nieruchomości w Warszawie. Mokotów. Powiśle. Stare Miasto."
- 6 featured listings (high quality photos prominent)
- 3 neighborhood tiles (Mokotów / Powiśle / Stare Miasto z key stats)
- Agent grid: 8 photos + specializations
- Market insights: "Trendy cenowe 2025 — premium Warszawa"
- Testimonials: satisfied premium clients (anonymous z transaction details)

### Example 2: Single agent w Krakowie

**Brief**: "Single agent w Krakowie, 5 lat doświadczenia. Specjalizacja: mieszkania sprzedaż 600k-1.5M PLN, Krowodrza/Bronowice/Prądnik. Polski/angielski. Tone: konkretny, miły, dostępny."

**Output**:
- Preset: `default`
- Hero: agent photo + search + "Mieszkania w Krakowie. Krowodrza, Bronowice, Prądnik."
- Personal pitch (about section prominent)
- 6 listings carousel
- 3 neighborhood tiles z personal commentary
- Direct phone + WhatsApp + Calendly w hero CTA
- Sold history (last 12 months — anonymous addresses)

## Output contract

Per `.cursor/rules/004-file-protocol.mdc` — 7 files. Block types: hero / listings-featured / neighborhoods / agents / market-insights / testimonials / cta.

## Related

- **Sister skills**: roduq-agency (team + portfolio pattern), roduq-portfolio (single agent self-promotion)
- **Presets**: `dark-cinematic`, `warm-editorial`, `default`, `monolith-meadow`, `tech-modern`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-listings.html`](./assets/template-listings.html), [`./assets/template-neighborhoods.html`](./assets/template-neighborhoods.html)
