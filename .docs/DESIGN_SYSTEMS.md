# Open Design — 7 DESIGN.md System Presets

> Complete specs dla 7 brand-agnostic visual systems do zaimplementowania w `roduq-design-generator-studio`. Każdy preset to katalog `design-systems/<name>/` z DESIGN.md + tokens.example.json + inspiration.md + samples/.

## Format każdego preset

```
design-systems/<preset-name>/
├── DESIGN.md                    # Main spec (palette + typography + voice + layout)
├── tokens.example.json          # Working example dla referencja
├── inspiration.md               # Industry references + samples references
└── samples/
    ├── hero.html                # HTML snippet
    ├── features.html
    ├── cta.html
    ├── pricing.html
    └── full-page.html           # Combined sample dla preview
```

---

## 1. `default` — Starter neutral

**Tagline**: "Bezpieczny start dla każdego projektu. Można refine później."

### Color palette

```json
{
  "surface": {
    "default": "#FFFFFF",
    "raised": "#FAFAFA",
    "sunken": "#F5F5F5",
    "muted": "#F0F0F0"
  },
  "ink": {
    "primary": "#0F0F0F",
    "secondary": "#525252",
    "muted": "#737373",
    "inverse": "#FFFFFF"
  },
  "outline": {
    "subtle": "rgba(0, 0, 0, 0.06)",
    "default": "rgba(0, 0, 0, 0.12)",
    "strong": "rgba(0, 0, 0, 0.2)"
  },
  "brand": {
    "primary": "#2563EB",
    "secondary": "#0EA5E9"
  },
  "status": {
    "success": "#10B981",
    "warning": "#F59E0B",
    "danger": "#EF4444",
    "info": "#3B82F6"
  }
}
```

### Typography

- **Display**: `Inter Tight` (700) — geometric, modern, clear hierarchy
- **Body**: `Inter` (400/500) — universal readability
- **Mono**: `JetBrains Mono` (400) — code blocks

Scale (rem):
- xs: 0.75 / sm: 0.875 / base: 1 / lg: 1.125 / xl: 1.25 / 2xl: 1.5 / 3xl: 1.875 / 4xl: 2.25 / 5xl: 3 / 6xl: 3.75

Line-height: tight 1.25 / normal 1.5 / relaxed 1.625 / loose 2

### Spacing scale (rem)

3xs: 0.125 / 2xs: 0.25 / xs: 0.5 / sm: 0.75 / md: 1 / lg: 1.5 / xl: 2 / 2xl: 3 / 3xl: 4 / 4xl: 6

### Radii (rem)

none: 0 / sm: 0.25 / md: 0.5 / lg: 0.75 / xl: 1 / full: 9999px

### Voice

- **Tone**: Neutral, helpful, direct
- **Reading level**: 8-th grade (universal)
- **Use "you" not "users"**
- **Active voice over passive**
- **Avoid jargon** — explain technical terms inline

### Layout principles

- Max content width: 1200px
- Section padding: 4-6rem desktop / 2-3rem mobile
- Generous whitespace dla scannability
- Hero: centered text, single CTA, optional secondary
- Features: 3-column grid (icon + headline + description)
- CTA: centered, single primary action

### Inspiration

- [Linear marketing](https://linear.app) — clean structure
- [Vercel docs](https://vercel.com/docs) — typography rhythm
- [Stripe homepage](https://stripe.com) — color choices

---

## 2. `monolith-meadow` — Warm earthy (twierdza-boyen sanitized)

**Tagline**: "Solidność z natury. Idealne dla heritage / hospitality / wellness."

### Color palette

```json
{
  "surface": {
    "default": "#FAFAF7",
    "raised": "#FFFFFF",
    "sunken": "#F0EFEA",
    "muted": "#E8E6DD"
  },
  "ink": {
    "primary": "#1A1C19",
    "secondary": "#525249",
    "muted": "#8A8A7F",
    "inverse": "#FAFAF7"
  },
  "outline": {
    "subtle": "rgba(26, 28, 25, 0.08)",
    "default": "rgba(26, 28, 25, 0.14)",
    "strong": "rgba(26, 28, 25, 0.24)"
  },
  "brand": {
    "primary": "#5C7A4F",
    "secondary": "#C97B5A"
  },
  "status": {
    "success": "#5C7A4F",
    "warning": "#D49C3D",
    "danger": "#B53D2C",
    "info": "#446B85"
  }
}
```

Brand colors: sage green (primary) + warm terracotta (accent). Surface = cream/parchment.

### Typography

- **Display**: `Recoleta` (700) lub `Fraunces` (700) — humanist serif z personality
- **Body**: `Inter` (400/500) — readability still kluczowa
- **Mono**: `JetBrains Mono`

### Voice

- **Tone**: Warm, storytelling, place-based
- **Use sensory language** — "feel the stone walls", "morning light"
- **Long-form copy OK** — historical context, narrative
- **Polish-first translation thoughtful** — preserve cultural nuance

### Layout principles

- Asymmetric hero z large featured image
- Photo galleries z masonry layout
- Long-form sections z generous line-height (1.7+)
- Texture overlays subtle (noise / paper grain)
- Buttons z slight rounded corners (lg radius)

### Inspiration

- [Aman resorts](https://aman.com) — premium hospitality
- [Patagonia](https://patagonia.com) — storytelling layout
- [Visit Iceland](https://visiticeland.com) — place identity

---

## 3. `tech-modern` — Linear / Vercel inspired

**Tagline**: "Crisp, fast, opinionated. Dla developer-focused product."

### Color palette

```json
{
  "surface": {
    "default": "#FFFFFF",
    "raised": "#FAFAFA",
    "sunken": "#F5F5F5"
  },
  "ink": {
    "primary": "#000000",
    "secondary": "#52525B",
    "muted": "#A1A1AA"
  },
  "outline": {
    "subtle": "rgba(0, 0, 0, 0.06)",
    "default": "rgba(0, 0, 0, 0.12)"
  },
  "brand": {
    "primary": "#5E5CE6",
    "secondary": "#FF2EAB"
  },
  "gradient": {
    "hero": "linear-gradient(135deg, #5E5CE6 0%, #FF2EAB 100%)",
    "accent": "linear-gradient(90deg, #5E5CE6 0%, #0EA5E9 100%)"
  }
}
```

### Typography

- **Display**: `Geist` (Vercel font) lub `Inter Display` (700/800)
- **Body**: `Inter` (400/500/600)
- **Mono**: `Geist Mono` lub `JetBrains Mono`

Display sizes large (5xl-6xl hero z tight line-height 1.05).

### Voice

- **Tone**: Confident, technical, terse
- **Short paragraphs** (2-3 sentences max)
- **Code examples inline** w sentences
- **Use product terminology** without dumbing down

### Layout principles

- Generous max-width (1400px+) dla wide screens
- Sticky navigation z scroll-on backdrop blur
- Hero z animated gradient mesh OR statement typography
- Code blocks z syntax highlighting (Shiki theme: `github-dark-default`)
- Feature grids 4-col z minimal text
- Micro-animations on hover (subtle scale + shadow)

### Inspiration

- [Linear](https://linear.app)
- [Vercel](https://vercel.com)
- [Resend](https://resend.com) — perfect typography
- [Cal.com](https://cal.com) — sections rhythm

---

## 4. `warm-editorial` — Magazine style (NYT / Substack)

**Tagline**: "Słowa mają wagę. Dla content-driven sites — blog, newsletter, journalism."

### Color palette

```json
{
  "surface": {
    "default": "#FFFAF5",
    "raised": "#FFFFFF",
    "sunken": "#F5EFE6"
  },
  "ink": {
    "primary": "#1C1C1C",
    "secondary": "#5C5C5C",
    "muted": "#8A8A8A"
  },
  "outline": {
    "subtle": "rgba(28, 28, 28, 0.08)",
    "default": "rgba(28, 28, 28, 0.16)"
  },
  "brand": {
    "primary": "#A8321B",
    "secondary": "#0E4F35"
  }
}
```

Cream/butter surface + deep brick red accent + forest green secondary.

### Typography

- **Display**: `Tiempos Headline` (Klim) lub `Fraunces` (display) — editorial serif
- **Body**: `Tiempos Text` lub `Lora` — readable serif body
- **Mono**: rare use

Long-form optimized:
- Body 18-20px (larger than typical 16px)
- Line height 1.7 (relaxed dla long reads)
- Max content width 65ch (optimal reading)
- First-letter dropcap dla articles

### Voice

- **Tone**: Considered, well-researched, conversational z author voice
- **Long paragraphs OK** (5+ sentences w right context)
- **Subheadings frequent** (every 2-3 paragraphs)
- **Pull quotes** wyróżnione

### Layout principles

- Single-column reading view (no sidebar dla articles)
- Bylines + estimated reading time
- Inline images z italic captions
- Pull quotes z large display typography
- Footer z "related articles" section

### Inspiration

- [The New York Times](https://nytimes.com)
- [Substack publications](https://substack.com)
- [Pitchfork reviews](https://pitchfork.com)
- [The Atlantic](https://theatlantic.com)

---

## 5. `brutalist` — Are.na / Stripe Press inspired

**Tagline**: "Statement piece. Dla brands chcących stand out."

### Color palette

```json
{
  "surface": {
    "default": "#FFFFFF",
    "raised": "#FFFFFF",
    "sunken": "#000000"
  },
  "ink": {
    "primary": "#000000",
    "secondary": "#1A1A1A",
    "inverse": "#FFFFFF"
  },
  "outline": {
    "default": "#000000",
    "strong": "#000000"
  },
  "brand": {
    "primary": "#FF0000",
    "secondary": "#FFFF00"
  }
}
```

Black + white + 1-2 accent colors (often primary RGB: pure red / yellow / blue).

### Typography

- **Display**: `Söhne Breit` lub `Helvetica Now Display` (900) — bold, condensed
- **Body**: `Söhne` lub `Inter` (400)
- **Mono**: `IBM Plex Mono`

Mix sizes aggressively — display 8rem next to body 1rem.

### Voice

- **Tone**: Declarative, opinionated, no fluff
- **One-word headlines** często
- **Strong statements** (no hedging language)
- **Sometimes irreverent**

### Layout principles

- Hard borders (2-4px solid black)
- No rounded corners (`radius: 0` everywhere)
- Asymmetric grids — golden ratio dividing
- Strong contrast (black on white, no gray subtitles)
- Sticky elements creative (e.g., persistent text strip)
- Hover states bold (color invert, no fade)

### Inspiration

- [Are.na](https://are.na)
- [Stripe Press](https://press.stripe.com)
- [Bloomberg Businessweek](https://www.bloomberg.com/businessweek)
- [Pentagram designers](https://www.pentagram.com)

---

## 6. `soft-pastel` — Notion / Linear soft mode

**Tagline**: "Approachable, calm, friendly. Dla wellness / education / lifestyle."

### Color palette

```json
{
  "surface": {
    "default": "#FAFAFA",
    "raised": "#FFFFFF",
    "sunken": "#F0F0F2"
  },
  "ink": {
    "primary": "#37352F",
    "secondary": "#787774",
    "muted": "#A5A5A0"
  },
  "outline": {
    "subtle": "rgba(55, 53, 47, 0.08)",
    "default": "rgba(55, 53, 47, 0.16)"
  },
  "brand": {
    "primary": "#8B7EC8",
    "secondary": "#F4A8B5"
  },
  "pastel": {
    "lavender": "#E6E0F5",
    "peach": "#FCE7DD",
    "mint": "#D9F0E6",
    "sky": "#DCEAF5",
    "rose": "#F5DCE4"
  }
}
```

Dusty pastels + warm grays. Avoid pure white surfaces (slight cream).

### Typography

- **Display**: `Recoleta` lub `Söhne Schmal` (500/600) — friendly weight
- **Body**: `Inter` (400) lub `Söhne` (400)
- **Mono**: subtle, rare

Smaller display sizes (rzadko above 4xl) — friendlier scale.

### Voice

- **Tone**: Warm, encouraging, second-person ("Tu jesteś!" / "You've got this!")
- **Emoji thoughtful** (1-2 per page max, not decorative)
- **Inclusive language**

### Layout principles

- Rounded corners (lg/xl radii) — soft feeling
- Soft shadows (high blur, low opacity)
- Generous padding (more space than default preset)
- Decorative SVG illustrations w pastel colors
- Avatar groups + testimonials prominent

### Inspiration

- [Notion homepage](https://notion.so)
- [Linear soft mode](https://linear.app)
- [Headspace](https://headspace.com)
- [Calm](https://calm.com)

---

## 7. `dark-cinematic` — Premium SaaS dark

**Tagline**: "Premium, focused, immersive. Dla high-end SaaS / developer tools / finance."

### Color palette

```json
{
  "surface": {
    "default": "#0A0A0A",
    "raised": "#141414",
    "sunken": "#000000",
    "elevated": "#1F1F1F"
  },
  "ink": {
    "primary": "#FAFAFA",
    "secondary": "#A1A1AA",
    "muted": "#71717A",
    "inverse": "#0A0A0A"
  },
  "outline": {
    "subtle": "rgba(255, 255, 255, 0.06)",
    "default": "rgba(255, 255, 255, 0.12)",
    "strong": "rgba(255, 255, 255, 0.2)"
  },
  "brand": {
    "primary": "#7C5CFC",
    "secondary": "#22D3EE"
  },
  "glow": {
    "primary": "radial-gradient(circle at center, rgba(124, 92, 252, 0.3) 0%, transparent 70%)",
    "accent": "radial-gradient(circle at center, rgba(34, 211, 238, 0.2) 0%, transparent 60%)"
  }
}
```

Jet black base + neon purple/cyan accents + subtle glows.

### Typography

- **Display**: `Inter Display` (700/800) lub `Geist` — tight tracking
- **Body**: `Inter` (400/500) — slightly thinner weight dla dark mode legibility
- **Mono**: `Geist Mono` lub `JetBrains Mono`

Light weights w dark mode hurt readability — minimum 400.

### Voice

- **Tone**: Confident, premium, technical
- **Concise** — every word earns its place
- **Avoid hype words** ("revolutionary", "game-changing") — let product speak

### Layout principles

- Hero z subtle background gradient/mesh (radial glow centered)
- Sticky navigation z backdrop blur (`backdrop-filter: blur(12px)`)
- Cards z subtle border + slight glow on hover
- Code blocks z dark syntax highlighting (Shiki: `github-dark-default` lub `dracula`)
- Scroll-triggered fade-ins + parallax restraint
- Charts/dashboards prominent

### Inspiration

- [Stripe Atlas](https://stripe.com/atlas)
- [Vercel](https://vercel.com)
- [Resend](https://resend.com)
- [Stripe Sigma](https://stripe.com/sigma)
- [Trigger.dev](https://trigger.dev)

---

## Cross-cutting principles (every preset)

### Accessibility (WCAG 2.2 AA minimum)

Każdy preset MUSI mieć:
- Color contrast ratio ≥4.5 dla normal text, ≥3 dla large text
- Focus visible states (2px outline lub equivalent)
- Touch targets ≥24×24px (mobile)
- Color NIE jest sole indicator (use icons + text)

### Performance

- Fonts subset + preload (woff2 only, max 2 font families)
- Images max 250kb hero, max 50kb thumbnails
- CSS critical inline (above fold), rest async
- JS lazy by default (only hydrate islands)

### Brand override capability

Każdy preset to **starting point**. Klient w admin SiteSettings może override:
- Primary color (single CSS variable swap)
- Display font (Google Fonts dropdown)
- Brand voice tone (admin describes, AI re-generates copy w that tone)

CSS variables system pozwala granular override bez touchowania preset code.

### Polish-market readiness

Każdy preset działa z:
- Polish characters (ą/ć/ę/ł/ń/ó/ś/ź/ż) w fontach
- Polish-specific patterns (NIP/REGON display, +48 phone format, postal code XX-XXX)
- RODO compliance w cookie banner + privacy policy generator
- WCAG dla podmiotów publicznych (`A11Y_PUBLIC_ENTITY=true` env flag)

## Validation: each preset MUST pass

- ✅ Lighthouse Performance ≥90 (`pnpm lhci` autonotest)
- ✅ Lighthouse Accessibility ≥95
- ✅ Lighthouse SEO ≥95
- ✅ Screenshot test (Playwright) — visual diff vs baseline
- ✅ Schema validation — output tokens.json + sections.json + content.json
- ✅ Sample full-page.html renders without console errors

## Next steps

After implementing wszystkich 7 presets:
1. Test każdy preset z 3 sample briefs (different industries)
2. Side-by-side comparison page (`/preset-showcase`)
3. Update CLI dla `roduq new --preset <name>` shortcut (bypass Open Design generator)
4. Document each preset w `roduq-design-generator-studio/docs/presets/<name>.md`
