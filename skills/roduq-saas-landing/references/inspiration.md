# SaaS Landing Page — Industry References

> Curated inspiration dla `roduq-saas-landing` skill. Study these przed building. Każda reference ma link + nota co warto kopiować (i czego unikać).

## Gold standard examples

### [Linear](https://linear.app)
- **Co kopiować**: Hero z product video loop + crisp typography (Inter Display 600-800). Section transitions smooth z subtle parallax. Dark mode pierwszy-class.
- **Co NIE kopiować**: Bardzo opinionated layout — może być zbyt suchy dla SaaS B2C / wellness.
- **Tech**: Next.js. SSR + ISR. Tailwind. Motion (formerly Framer Motion).

### [Vercel](https://vercel.com)
- **Co kopiować**: Mesh gradient hero. Bento grid features. Real-time stats (deploy count counter).
- **Co NIE kopiować**: Heavy animations mogą lag na slower devices.
- **Aesthetic**: dark-cinematic (basis dla nasz preset).

### [Stripe](https://stripe.com)
- **Co kopiować**: Color theory (gradient blue → purple z accent salmon). Iconography niemożliwie precyzyjne. Density patterns (high info per screen).
- **Pricing page**: gold standard dla 3-tier comparison.
- **Tech**: Custom React + SCSS.

### [Resend](https://resend.com)
- **Co kopiować**: Perfect typography hierarchy. Code blocks inline (Shiki + syntax). Email previews jako product showcase.
- **Tone**: technical ale warm. "Email for developers, not enterprise."

### [Cal.com](https://cal.com)
- **Co kopiować**: Sections rhythm — alternating gray/white backgrounds. Logos strip (social proof) prominent.
- **CTAs**: dual primary (sign up + book demo) bez confusing user.

## Pricing patterns

### [Notion](https://notion.so/pricing)
- 3-tier z highlight middle ("Most popular"). Free + Plus + Business + Enterprise.
- Monthly/Annual toggle z 20% annual discount.

### [Linear](https://linear.app/pricing)
- Simple 3-tier. Free / Standard / Plus. Pricing per user.
- No "Enterprise — contact sales" — pricing transparency.

### [Figma](https://figma.com/pricing)
- Per-product pricing (Figma / FigJam / Dev Mode). Complex but well-organized.
- Use case: gdy product ma multiple tiers/products.

## Anti-patterns (NIE kopiuj)

### Hero animation overkill
- Tons of scroll triggers, parallax, glitch effects. **Slows page**, distracts od message.
- Limit: max 2 scroll-triggered animations per page.

### Buzzword soup
- "Revolutionary AI-powered next-generation platform leveraging cutting-edge..." → vague.
- ✅ "Saves 5 hours per week. For freelance accountants."

### Generic stock photography
- Smiling diverse team w office, laptop, hands typing. Cliché.
- ✅ Custom illustrations / product screenshots / real customer photos.

### Empty social proof
- "Trusted by leading companies" without naming them. Worse than no claim.
- ✅ Logo strip z 8-12 actual customer logos.

## Polish-market specific

### Local SaaS examples (Polish-language UI)

- [Brand24](https://brand24.com) — Polish founded, English-first now. Solid pricing structure.
- [Livespace](https://livespace.io) — Polish CRM. Bilingual landing.
- [Useme](https://useme.com) — Polish freelance platform. Simple, conversion-focused.

### Polish-specific UX
- **NIP / REGON** in footer (Polish corporate identifier).
- **+48** phone format.
- **PLN** currency by default (z USD/EUR toggle for international).
- **GDPR / RODO** cookie banner — wymóg prawny.
- **WCAG dla podmiotów publicznych** — A11Y_PUBLIC_ENTITY=true env flag w roduq-web-starter.

## Layout primitives references

- [Every Layout](https://every-layout.dev) — Heydon Pickering + Andy Bell reusable layouts.
- [Refactoring UI](https://refactoringui.com) — Adam Wathan + Steve Schoger. Typography + spacing + color.
- [Tailwind UI](https://tailwindui.com) — production component patterns.
- [shadcn/ui](https://ui.shadcn.com) — accessibility-first design system z React.

## Animation references

- [Motion (Framer)](https://motion.dev) — purposeful motion primitives.
- [Tailwind CSS animations](https://tailwindcss.com/docs/animation) — built-ins.
- **Use `prefers-reduced-motion`** — accessibility requirement.

## Color theory

- [Refactoring UI § Color](https://refactoringui.com/previews/building-your-color-palette/) — 9-step scales z saturation curve.
- [Coolors.co](https://coolors.co) — gradient + palette generator.
- [Realtime Colors](https://realtimecolors.com) — preview palette w real layout.
