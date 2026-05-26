# Roduq Default — Neutral Starter

> Category: Roduq Starter
> Tagline: "Bezpieczny start dla każdego projektu. Można refine później."
> A clean, product-oriented default. Use when brief doesn't call for specific mood — good for B2B SaaS, dashboards, utility pages.

## 1. Visual Theme & Atmosphere

Calm, functional, quietly confident. No ornament. Content-first, chrome-second.

The Roduq default is a neutral B2B-friendly starting point — Inter + cobalt accent, generous whitespace, predictable density. It pairs cleanly z `roduq-saas-landing` skill for software product pages and z `roduq-agency` for mid-market positioning.

Where Roduq default differs od upstream `default/`:
- Slightly cooler accent (#2563EB vs upstream #2F6FEB) — modern blue z Tailwind palette
- Roduq token extensions (--color-brand-secondary, --color-surface-sunken, --space-*, --radius-*) for Roduq skills templates compatibility
- Single accent rule respected per `craft/color.md` upstream contract

## 2. Color Palette & Roles

> Upstream lint contract: `--bg`, `--surface`, `--fg`, `--muted`, `--border`, `--accent`. Roduq extensions are aliases dla skills compatibility.

### Primary

- **Background** (`#FAFAFA`): default page surface (NIE #FFFFFF — pure white vibrates)
- **Surface** (`#FFFFFF`): cards, modals, elevated containers
- **Foreground** (`#0F0F0F`): primary text (NIE #000 — pure black vibrates)

### Secondary & Accent

- **Accent** (`#2563EB`): primary CTAs, links, brand accent — max 2 visible uses per screen (lint enforced)
- **Accent secondary** (`#0EA5E9`): cyan supportive — for charts, secondary highlights only
- **Muted** (`#525252`): secondary text, captions, helper copy
- **Meta** (`#737373`): tertiary text (timestamps, fine print)

### Surface & Background

- **Background** (`#FAFAFA`): default canvas
- **Surface** (`#FFFFFF`): raised cards/modals
- **Surface sunken** (`#F5F5F5`): sections needing visual contrast

### Borders

- **Border** (`#E5E5E5`): default dividers, card edges
- **Border soft** (`rgba(15,15,15,0.06)`): subtle separators

### Semantic

- **Success** (`#10B981`): positive states
- **Warning** (`#F59E0B`): caution states
- **Danger** (`#EF4444`): error states

Hard rules per upstream contract:
- ❌ Never pure black (`#000000`) for foreground
- ❌ Never pure white (`#FFFFFF`) for background (OK for surfaces)
- ❌ Never second accent — keep `--accent` singular
- ✅ Max 2 visible `--accent` uses per screen

## 3. Typography Rules

- **Display / headings**: `'Inter Tight', 'Inter', -apple-system, system-ui, sans-serif`, weight 700 (geometric, modern)
- **Body**: `'Inter', -apple-system, system-ui, sans-serif`, weight 400/500
- **Mono**: `ui-monospace, 'JetBrains Mono', monospace` (rare use — code blocks)

Scale (rem):

| Token | Value | Use |
|---|---|---|
| `--text-xs` | 0.75rem (12px) | Labels, tiny captions |
| `--text-sm` | 0.875rem (14px) | Body small, helpers |
| `--text-base` | 1rem (16px) | Body default |
| `--text-lg` | 1.125rem (18px) | Lead paragraphs |
| `--text-xl` | 1.25rem (20px) | Subheadings |
| `--text-2xl` | 1.5rem (24px) | H3 |
| `--text-3xl` | 1.875rem (30px) | H2 |
| `--text-4xl` | 2.25rem (36px) | H1 section |
| `--text-5xl` | 3rem (48px) | Hero subtitle |
| `--text-6xl` | 3.75rem (60px) | Hero display |

Line-height: 1.5 for body, 1.2 for headings, 1.05 for hero display.

## 4. Spacing & Radii

Spacing scale (rem): 0.125 · 0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 3 · 4 · 6 (3xs/2xs/xs/sm/md/lg/xl/2xl/3xl/4xl)

Radii: 0.25 (sm) · 0.5 (md) · 0.75 (lg) · 1 (xl) · 9999px (full)

Max content width: 1200px (72rem)
Section padding: 4-6rem desktop / 2-3rem mobile

## 5. Voice & Tone

- **Tone**: Neutral, helpful, direct
- **Reading level**: 8th grade (universal)
- **Use "Ty"** (informal Polish dla B2B SaaS)
- **Active voice** over passive
- **Avoid jargon** — explain technical terms inline

Polish-first content z EN drafts always included w content.json.

## 6. Layout Principles

- Hero: centered text, single primary CTA, optional secondary
- Features: 3-column grid (icon + headline + description)
- Pricing: 3-tier z middle tier highlighted (most popular)
- CTA: centered, single primary action
- Generous whitespace dla scannability
- Sticky navigation z subtle backdrop blur (optional, gdy scroll)

## 7. Component Patterns

- **Buttons**: pill (radius-full) lub rounded (radius-md). Primary = filled accent + accent-on label. Secondary = transparent + border.
- **Cards**: surface bg + border + radius-lg + subtle shadow (0 4px 6px rgba(0,0,0,0.04))
- **Forms**: inputs z 44-48px min-height (WCAG touch target), focus-visible 2px accent outline

## 8. Accessibility

- Color contrast ≥4.5:1 normal text / ≥3:1 large text
- Focus-visible 2px accent outline z 2px offset
- Touch targets ≥24×24px mobile / 44px ideal
- `prefers-reduced-motion` respected
- Polish chars render OK (test "Łódź żółw pięć słów")

## 9. Inspiration & References

See [`inspiration.md`](./inspiration.md) for industry references (Linear, Vercel, Stripe, etc.).

## 10. Compatible Roduq Skills

- ✅ `roduq-saas-landing` (canonical pairing)
- ✅ `roduq-agency` (when neutral tone preferred)
- ✅ `roduq-real-estate` (default neutral works dla mid-market)
- ⚠ `roduq-restaurant` (recommend `roduq-monolith-meadow` for warmer feel)
- ⚠ `roduq-clinic` (recommend `roduq-soft-pastel` dla mental health softness)
- ✅ `roduq-product-launch` (neutral preset works dla broad-audience launches)
- ✅ `roduq-portfolio` (neutral starter dla developers / B2B designers)
