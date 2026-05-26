# Variant Strategy — Conservative / Modern / Bold

> Deep dive dla `multi-variant` skill. Defines the three philosophies + their visual / typographic / behavioral signatures.

## Philosophy framework

Three variants represent three DIFFERENT positions on the risk-reward curve:

```
         Conservative ←→ Modern ←→ Bold
           (low risk,    (medium     (high risk,
            broad         appeal,    distinct
            appeal)       current)    audience)
```

NIE są to "good / better / best" — to **trzy strategie z trade-offs**.

## Conservative variant — "Won't get fired"

### Goal
Produkować design który ALWAYS WORKS dla risk-averse buyer/audience. No regret choice.

### Visual signatures
- **Layout**: Standard hero (centered text + CTA) → features (3-col-icons) → social proof (logos strip) → pricing (3-tier z highlight middle) → testimonials (3-col grid) → FAQ (accordion) → CTA (centered)
- **Color palette**: 2-3 colors total. Single accent. Plenty of neutral.
- **Typography**: Sans-serif display (Inter Tight, Söhne, Inter), sans-serif body (Inter). Conservative scale (5xl hero max).
- **Spacing**: Generous whitespace. Predictable section padding.
- **Photography**: Real product screenshots / standard stock OK / lifestyle if applicable.
- **Components**: Rounded corners radius-md (0.5rem). Soft shadows. Standard form fields.

### Behavioral signatures
- **Animation**: Minimal. Fade-in on scroll only (NIE parallax, NIE complex sequences).
- **Hover states**: Subtle (color shift, slight scale).
- **Transitions**: 150-200ms ease.
- **Mobile**: Optimized first.

### Voice
- Direct, helpful, neutral.
- "Ty" Polish (informal but professional).
- Numeric proof, concrete benefits.

### Target audience
- B2B mid-market (CFO, VP marketing, ops leader)
- Risk-averse industries (finance, healthcare, education enterprise)
- "Just need something that works" — first-time agency clients
- Sales-led product (long evaluation cycles)

### Preset preferences (most common bind)
- `roduq-default` (universal)
- `roduq-tech-modern` (B2B SaaS)
- `roduq-monolith-meadow` (heritage industries)
- `roduq-soft-pastel` (mental health, wellness)

### When this variant wins
- 70% client base — most Roduq agency clients
- First-time buyer evaluating Roduq
- Pitching to committee (CFO + CEO + CMO must all approve)
- Industries z compliance concerns (medical, financial)

## Modern variant — "Looks current, feels premium"

### Goal
Produkować design który looks 2025-2026 current bez being trend-chase. Premium feel without overselling.

### Visual signatures
- **Layout**: Hero z mesh gradient OR bento grid OR split z product mockup. Features as bento (large cell + small cells) OR alternating rows. Pricing z usage-based calculator (gdy SaaS) OR clean 3-tier.
- **Color palette**: 3-4 colors. Gradient touches (hero, CTA). Subtle glows.
- **Typography**: Modern display (Inter Display, Geist, Inter Tight). Tighter tracking. Larger hero (6rem common).
- **Spacing**: Density mixed — large sections + tight grids.
- **Photography**: Product UI screenshots / abstract 3D / mesh renders / dashboard mockups.
- **Components**: Sharper radii (0.5-0.875rem). Soft glow shadows. Backdrop blur navigation.

### Behavioral signatures
- **Animation**: Scroll-triggered (parallax restraint — 2-3 elements max). Backdrop blur on scroll.
- **Hover states**: Glow effects, subtle scale transforms.
- **Transitions**: 250-350ms cubic-bezier (current best practice).
- **Code blocks**: Inline w copy (gdy applicable — DevTools).

### Voice
- Confident, slightly technical, fluent.
- Mix Polish/English w examples (international ambition signal).
- Stats + outcomes prominent.

### Target audience
- Tech-fluent buyers (engineers, product, modern marketers)
- B2B SaaS norm — Linear/Vercel-aware audience
- Self-serve product evaluation
- Performance-driven (results > "story")

### Preset preferences (most common bind)
- `roduq-tech-modern` (B2B SaaS, agencies)
- `roduq-dark-cinematic` (premium SaaS, DevTools, fintech)
- `roduq-warm-editorial` (content-driven products, restaurants)
- `roduq-default` (when industry doesn't have strong "modern" preset)

### When this variant wins
- 20% client base — tech-savvy or scale-ups
- Pitch dla design-aware buyers
- B2B SaaS targeting 2025-2026 expectations
- Premium positioning ($$$ market)

## Bold variant — "Stand out or die trying"

### Goal
Produkować design który CANNOT be ignored. Statement piece. Polarizing on purpose.

### Visual signatures
- **Layout**: Asymmetric hero (text-only OR text + work). Big positioning headline. Manifesto section z marked highlights. Color-block sections. Marquee strips.
- **Color palette**: B/W + pure RGB accent (red / yellow / blue) OR jet black + neon. Strong contrast.
- **Typography**: Heavy display weights (800-900). Mixed scales aggressively (8rem hero next to 1rem body). ALL CAPS used.
- **Spacing**: Bold use of negative space. Sharp section transitions.
- **Photography**: Stylized / illustrated / black-and-white photography / abstract.
- **Components**: Hard borders (2-4px solid). Often radius 0. Color invert hovers.

### Behavioral signatures
- **Animation**: Statement (marquee strips, color inversion). Sometimes aggressive (gdy intentional).
- **Hover states**: Color invert (NIE subtle fade).
- **Mobile**: Often less optimized — desktop-first design language. Compromises acceptable.

### Voice
- Declarative, no-fluff.
- One-word headlines often.
- Strong statements (NIE hedging).
- Sometimes irreverent.

### Target audience
- Brand-conscious buyers (CMOs, marketing directors at design-led companies)
- Statement positioning (avant-garde, fashion, publishing, gallerie, culture)
- Founders who want to "be noticed"
- Anti-conventional industries (challenger brands, indie SaaS)

### Preset preferences (most common bind)
- `roduq-brutalist` (statement brands, agencies, culture)
- `roduq-dark-cinematic` (luxury / premium statement)
- `roduq-warm-editorial` (statement-led editorial brands — rzadko)
- `roduq-monolith-meadow` (statement heritage gdy ultra-confident)

### When this variant wins
- 10% client base — statement-conscious brands
- Stand-out positioning required (saturated market)
- Designer-as-client (designer running agency, accepts polarizing)
- Niche audience (festival, culture space, indie publisher)

## Per-industry variant trade-offs

### saas-landing
- **Conservative wins**: enterprise SaaS, B2B mid-market, financial / healthcare verticals
- **Modern wins**: developer tools, AI / ML platforms, premium SaaS
- **Bold wins**: indie SaaS, founder-led products w strong positioning

### agency
- **Conservative wins**: full-service agencies serving F500
- **Modern wins**: tech-focused agencies, scaleup-serving
- **Bold wins**: branding studios, fashion/culture-focused, awarded creative agencies

### restaurant
- **Conservative wins**: family restaurants, hotel dining, heritage venues
- **Modern wins**: bistros w tourist areas, modern Polish cuisine
- **Bold wins**: wine bars, chef-led concepts, statement venues

### clinic
- **Conservative wins**: pediatric, family medicine, traditional specialists
- **Modern wins**: mental health (Calm-aesthetic), wellness practices
- **Bold wins**: extremely rare — luxury aesthetic medicine, statement boutique clinics

### real-estate
- **Conservative wins**: family-friendly residential agencies, mid-market
- **Modern wins**: premium agencies, luxury developments, tech-forward agents
- **Bold wins**: statement luxury brokers, heritage property specialists, gallery-style listings

### product-launch
- **Conservative wins**: consumer products dla mass market
- **Modern wins**: tech products, premium hardware, niche enthusiast
- **Bold wins**: avant-garde products, statement consumer goods, fashion/culture

### portfolio
- **Conservative wins**: B2B SaaS designers, freelance developers
- **Modern wins**: tech-focused creators, design system specialists
- **Bold wins**: branding designers, artists, statement creators

## Anti-patterns w variant generation

❌ **All 3 variants similar** — defeats purpose. Each must be FUNDAMENTALLY different.
❌ **Bold variant = "Conservative z neon accent"** — Bold must change layout + typography + voice, NIE only color.
❌ **Conservative = "boring default"** — Conservative should still be GOOD design, just safer choices.
❌ **Modern = trend-chasing** — Modern should age well 2-3 years, NIE fad.
✅ **Each variant testable separately** — should look like different agency made each.
✅ **Industry-appropriate variants** — Bold restaurant should still feel like a RESTAURANT (NIE generic brutalist design).
✅ **Polish content consistent across variants** — same brief, same content drafts, DIFFERENT visual + structural treatment.

## How variants differ w generated outputs

| Aspect | Conservative | Modern | Bold |
|--------|--------------|--------|------|
| `tokens.json::brand.primary` | Subdued (cobalt, sage, soft pastel) | Saturated (indigo, magenta, neon) | Pure RGB or neon (red, yellow, neon purple) |
| `tokens.json::font.display` | Sans-serif standard (Inter Tight) | Modern sans (Geist, Inter Display) | Heavy (Helvetica 900) OR statement serif (Fraunces display) |
| `sections.json::homepage::blocks` order | Standard order | May reorder dla impact | Asymmetric — manifesto-led or work-led |
| `content.json` hero title | Benefit + audience clarity | Outcome + positioning | One-word statement or provocative question |
| `preview.html` overall feel | Approachable, organized | Premium, current | Statement, polarizing |

## Conservative is NOT a fallback

Critical mindset shift dla generators:

❌ "Conservative = baseline if I can't think of anything better"
✅ "Conservative = deliberate strategic choice dla risk-averse audience"

Conservative requires REAL design thinking — Linear, Vercel, Stripe are not "boring" — they're THE proven conservative SaaS aesthetics. Each variant deserves equal care.
