# Preset Mapping — 7 Industries × 3 Variants → Preset Matrix

> Per-cell rationale dla `multi-variant` orchestration. 21 combinations covered.

## The matrix

| Industry | Conservative | Modern | Bold |
|----------|--------------|--------|------|
| `roduq-saas-landing` | `roduq-tech-modern` | `roduq-dark-cinematic` | `roduq-brutalist` |
| `roduq-agency` | `roduq-default` | `roduq-tech-modern` | `roduq-brutalist` |
| `roduq-restaurant` | `roduq-monolith-meadow` | `roduq-warm-editorial` | `roduq-dark-cinematic` |
| `roduq-clinic` | `roduq-soft-pastel` | `roduq-default` | `roduq-warm-editorial` |
| `roduq-real-estate` | `roduq-default` | `roduq-dark-cinematic` | `roduq-warm-editorial` |
| `roduq-product-launch` | `roduq-default` | `roduq-dark-cinematic` | `roduq-brutalist` |
| `roduq-portfolio` | `roduq-default` | `roduq-dark-cinematic` | `roduq-brutalist` |

Preset coverage: all 7 presets used across matrix (100% utilization).

## Per-cell rationale

### saas-landing × Conservative → roduq-tech-modern
- **Why**: Tech-modern (Linear/Vercel aesthetic) IS the proven safe choice dla B2B SaaS w 2025-2026. Cobalt + Inter + clean sections = "won't get fired".
- **Alternative**: `roduq-default` (gdy non-tech audience explicit)
- **Voice match**: confident-technical voice z saas-landing skill works perfectly w tech-modern crisp aesthetic.

### saas-landing × Modern → roduq-dark-cinematic
- **Why**: Premium SaaS now means dark mode (Linear, Resend, Vercel). Dark cinematic = current visual norm dla premium B2B SaaS.
- **Alternative**: `roduq-tech-modern` (gdy light mode required by brand)
- **Voice match**: confident + technical + concise stats — matches dark-cinematic voice principles.

### saas-landing × Bold → roduq-brutalist
- **Why**: Statement SaaS landing (challenger brand, indie product, founder-led) needs brutalism's "stand-out" energy.
- **Alternative**: `roduq-dark-cinematic` z aggressive neon (less safe than brutalist)
- **Risk note**: Bold SaaS is rare (10% market). Sales cycle longer (filters out conservative buyers).

### agency × Conservative → roduq-default
- **Why**: Mid-market CMO buyer expects clean + work-led. Default's Inter + cobalt + neutral = trusted agency aesthetic.
- **Alternative**: `roduq-tech-modern` (gdy tech-focused agency)
- **Voice match**: confident-but-evidenced agency voice works w default's calm.

### agency × Modern → roduq-tech-modern
- **Why**: Tech-modern (Linear-aesthetic) appeals do brand managers + design-aware buyers. Bento case study grids work great.
- **Alternative**: `roduq-dark-cinematic` (gdy luxury agency positioning)

### agency × Bold → roduq-brutalist
- **Why**: Brutalist IS the statement-agency aesthetic (Are.na, &Walsh, Pentagram). Manifesto sections + asymmetric work grids + ALL CAPS.
- **Alternative**: None — brutalist defines this category.

### restaurant × Conservative → roduq-monolith-meadow
- **Why**: Warm earthy palette (sage + terracotta + cream) = canonical restaurant aesthetic. Heritage, hospitality, sensory voice.
- **Alternative**: `roduq-warm-editorial` (gdy long-form story-heavy restaurant)
- **Voice match**: sensory restaurant voice + monolith-meadow's place-based aesthetic.

### restaurant × Modern → roduq-warm-editorial
- **Why**: Editorial restaurant (chef-as-character, magazine layout, drop-cap menu intro) = "destination dining" positioning.
- **Alternative**: `roduq-monolith-meadow` (gdy warmer feel preferred)

### restaurant × Bold → roduq-dark-cinematic
- **Why**: Wine bar / cocktail bar / chef's table / premium dining = dark cinematic (Stripe Sigma-aesthetic applied do food).
- **Alternative**: `roduq-brutalist` (avant-garde restaurant)
- **Risk note**: dark mode restaurant requires extra care — photography must work na dark bg.

### clinic × Conservative → roduq-soft-pastel
- **Why**: Mental health, wellness, dietetyk — soft pastel's lavender + peach + mint = anti-anxiety aesthetic. Calm/Headspace pattern.
- **Alternative**: `roduq-default` (gdy traditional medical practice)
- **Voice match**: empathetic clinic voice + soft pastel's encouraging tone.

### clinic × Modern → roduq-default
- **Why**: Modern medical practice = clean Inter + cobalt + clinical organization. Default's neutral works perfectly.
- **Alternative**: `roduq-tech-modern` (rzadko — gdy tech-forward medical platform)

### clinic × Bold → roduq-warm-editorial
- **Why**: Extremely rare. Editorial clinic = luxury aesthetic medicine OR statement boutique practice. Serif body + drop-cap = "considered" aesthetic.
- **Alternative**: None — Bold variant rarely fits clinic context.
- **Risk note**: NIE używaj brutalist dla clinic — patients evaluate trust w stress.

### real-estate × Conservative → roduq-default
- **Why**: Mid-market real estate = neutral + cobalt + search bar prominent. Default's clean works dla mass-market.
- **Alternative**: `roduq-monolith-meadow` (gdy heritage / family agency)

### real-estate × Modern → roduq-dark-cinematic
- **Why**: Premium / luxury real estate = dark cinematic (Sotheby's Realty-aesthetic). Premium listings, glow effects, gradient text dla high-end properties.
- **Alternative**: `roduq-warm-editorial` (luxury heritage)

### real-estate × Bold → roduq-warm-editorial
- **Why**: Statement luxury broker / heritage property specialist = editorial magazine voice. Long-form property descriptions w serif body.
- **Alternative**: `roduq-monolith-meadow` (less editorial, more heritage)
- **Risk note**: Don't use brutalist dla real-estate — buyers want trust, not statement.

### product-launch × Conservative → roduq-default
- **Why**: Mass-market product launch (consumer good, mainstream SaaS) = neutral + cobalt + clear waitlist CTA.
- **Alternative**: `roduq-tech-modern` (tech product launch)

### product-launch × Modern → roduq-dark-cinematic
- **Why**: Premium product launch (hardware, AI product, fintech) = dark cinematic z countdown timer + neon glows. Apple-style reveal energy.
- **Alternative**: `roduq-tech-modern` (lighter feel)

### product-launch × Bold → roduq-brutalist
- **Why**: Statement product launch (avant-garde brand, indie creator, fashion drop) = brutalist's stand-out energy.
- **Alternative**: `roduq-monolith-meadow` (heritage product launch — bourbon, wine, artisan food)

### portfolio × Conservative → roduq-default
- **Why**: Most freelancer portfolios benefit od clean + neutral. Showcases work bez competing.
- **Alternative**: `roduq-tech-modern` (developer portfolio specifically)

### portfolio × Modern → roduq-dark-cinematic
- **Why**: Developer / engineer / AI researcher portfolio = dark cinematic (dev-aesthetic standard 2025-2026).
- **Alternative**: `roduq-tech-modern` (lighter feel)

### portfolio × Bold → roduq-brutalist
- **Why**: Designer / artist / branding specialist portfolio = brutalist's statement energy. Portfolio = personal statement.
- **Alternative**: `roduq-warm-editorial` (writer / journalist portfolio)

## Override patterns

User może override per variant:

```json
{
  "preferredVariants": {
    "conservative": "roduq-monolith-meadow",  // Override default
    "modern": "roduq-tech-modern",
    "bold": "roduq-warm-editorial"           // Override brutalist dla less aggressive Bold
  }
}
```

Multi-variant skill respects overrides + logs override w meta-multi-variant.json:
```json
{
  "variants": [
    {
      "id": 1,
      "label": "Conservative",
      "preset": "roduq-monolith-meadow",
      "presetSource": "user-override",
      "presetDefault": "roduq-tech-modern"
    }
  ]
}
```

## Edge cases

### Edge case 1: Industry ambiguous
Brief mentions "branding studio that also runs co-working space restaurant".

- Multi-variant prompts user: "Detected mixed industries: agency + restaurant. Which is primary for design generation?"
- User picks → multi-variant generates 3 variants of that industry only.

### Edge case 2: Brand colors provided
User provides hex codes dla brand identity.

- Multi-variant generates 3 variants ALL using user's brand colors as `--accent` (overriding preset defaults).
- Variant differentiation reduces to LAYOUT + TYPOGRAPHY + VOICE only.
- Effective dla rebrand scenarios where palette is locked.

### Edge case 3: Bilingual content requirement (PL + EN)
Default — all variants generate PL + EN content per skill convention. No special handling needed.

### Edge case 4: Restricted preset list (e.g., government client must use light theme only)
User passes `--exclude-presets=roduq-dark-cinematic`.

- Multi-variant skips Modern variant gdy preset excluded.
- Falls back to alternative preset per [Variant Strategy § Preset preferences](./variant-strategy.md).
- Logs exclusion w meta.

### Edge case 5: Already-generated client (regeneration)
User regenerates dla same client-id.

- Multi-variant moves existing `variants/` to `variants-archive-{ISO-timestamp}/`
- Generates 3 new variants
- Preserves history dla rollback

## Matrix maintenance

Po Phase 7 testing — review matrix against real client outcomes:
- Which (industry, variant) cells got picked most by users?
- Adjust matrix biases gdy specific cells consistently underperform.
- Add new presets gdy new industries lub variant philosophies emerge.

Telemetry plan (opt-in):
- Track `selectedVariant` distribution per industry
- Track preset usage frequency
- Surface insights dla Roduq team strategy (which presets to invest in?)
