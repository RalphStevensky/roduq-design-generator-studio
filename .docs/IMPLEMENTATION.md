# Open Design — Implementation Guide

> Comprehensive marching orders dla parallel agent (Opus) budującego `roduq-design-generator-studio` (fork nexu-io/open-design + Roduq customizations). Wszystko czego agent potrzebuje w jednym miejscu.

## 1. Context (read first)

- **[ADR-0003](decisions/0001-separate-repo.md)** — dlaczego osobne repo, NIE monorepo
- **[BRIDGE.md](BRIDGE.md)** — symbioza marketing-starter ↔ Open Design fork, file protocol, `@roduq/cli` orchestrator
- **[DESIGN_SYSTEMS.md](DESIGN_SYSTEMS.md)** — 7 preset DESIGN.md systems do zaimplementowania
- **[AGENT_PROMPT.md](AGENT_PROMPT.md)** — copy-paste prompt do nowej Opus sesji

## 2. End state (what success looks like)

Po ukończonej implementacji:

```bash
# Klient w terminal:
$ cd C:/Users/stefa/clients
$ roduq new acme-corp --with-design-generator

# CLI:
✓ Detected Open Design running na localhost:8765
✓ Opening browser: http://localhost:8765/?project=acme-corp
[ user fills brief w UI, picks multi-variant, exports ]
✓ Detected artifacts w ~/.roduq/output/acme-corp/
✓ Cloning apps/marketing-starter → ./acme-corp/
✓ Injecting tokens.json → src/styles/client-theme.css
✓ Seeding Payload z sections.json + content.json
✓ pnpm install (45s)
✓ pnpm dev — listening na http://localhost:4321

→ Klient widzi pełny działający website z AI-generated design w 3 minuty od briefu.
```

**Critical**: parallel agent buduje TYLKO `roduq-design-generator-studio` repo (osobny od `roduq-web-starter`). NIE ruszamy marketing-starter — kontrakt = `.roduq/output/{client-id}/` file protocol.

## 3. Phase plan (7 fazy, ~1-2 tygodnie Opus solo)

### Phase 1 — Fork + project setup (~4h) ✅ done

**Goal**: standalone repo z working Open Design upstream + Roduq branding.

**Deliverables (executed 2026-05-26)**:
1. ✅ Merge upstream nexu-io/open-design@v0.8.0 z `--allow-unrelated-histories` (zachowano Roduq `.docs/` + `.cursor/rules/` + CLAUDE.md + README.md)
2. ⚠ Verify upstream działa: `pnpm tools-dev` (NIE `pnpm dev` — patrz lessons learned) — install NIE wykonany jeszcze (Windows: wymaga VS Build Tools 2022+ dla better-sqlite3 compile, user może uruchomić oddzielnie)
3. ✅ Rebrand minimal: page title `apps/web/app/layout.tsx` → "Roduq Design Studio", loading text `apps/web/app/[[...slug]]/client-app.tsx` → "Loading Roduq Design Studio…"
4. ✅ README rewrite z Roduq context + status badges per phase + reference do `roduq-web-starter` + upstream
5. ✅ License: Apache-2.0 preserved (upstream LICENSE) + Roduq additions w `LICENSE-ROduQ.txt` (proprietary, dual-license model)
6. ✅ `.env.example` z 3 LLM provider keys (ANTHROPIC_API_KEY primary / OPENAI_API_KEY / GOOGLE_API_KEY) + ROduQ_OUTPUT_DIR

**Acceptance criteria revision**:
- Page title shows "Roduq Design Studio" w browser tab — ✅ done (via layout.tsx edit)
- Loading shell shows "Loading Roduq Design Studio…" — ✅ done
- Logo/favicon swap — ❌ DEFERRED (Roduq brand assets not yet provided; upstream Open Design assets stay until user delivers Roduq logo.svg + favicon.png)
- `pnpm tools-dev` uruchamia UI — ⚠ NIE verified yet (requires user to run `pnpm install` first; better-sqlite3 may require ~2min compile on Windows)

**Lessons learned (post-Phase-1 — sync z `.cursor/rules/001-project-overview.mdc`)**:

1. **Dev command** = `pnpm tools-dev` (NIE `pnpm dev`!). Per upstream `AGENTS.md` line 53: "Use `pnpm tools-dev` as the only local development lifecycle entry point. Do not add or restore root lifecycle aliases: `pnpm dev`, `pnpm dev:all`, `pnpm daemon`, `pnpm preview`, or `pnpm start`."

2. **Ports** są configurable via `--daemon-port` / `--web-port` flags, exported jako `OD_PORT` (daemon proxy target) / `OD_WEB_PORT` (web listener). **NIE hardcoded 8765** — actual defaults differ. NIE używaj `NEXT_PORT`.

3. **Windows native = best-effort** per `AGENTS.md` § "Windows native":
   - `corepack enable` fails z EPERM (cannot write shims to Program Files) — use `npm install -g pnpm@10.33.2`
   - `better-sqlite3` no prebuilt binary dla win32/Node 24 — compiles from source via node-gyp (~2min), wymaga VS Build Tools 2022+
   - Primary OS support: macOS / Linux / WSL2

4. **`.cursor/` w gitignore upstream** (line 42). Nasze rules dodane PRZED .gitignore są tracked, ale future additions wpadną w ignored bez exception. **Fix**: dodano `!.cursor/rules/` + `!.cursor/rules/**` exception w `.gitignore`.

5. **Upstream NIE jest single Next.js app** — to **monorepo** z 6 apps + 11+ packages + tools/* + e2e:
   - `apps/web` (Next.js 16 + Turbopack), `apps/daemon` (od CLI + /api/*), `apps/desktop` (Electron), `apps/packaged` (packaged runtime), `apps/landing-page` (Astro 6), `apps/telemetry-worker`
   - `packages/contracts` (pure TS web/daemon contract), `packages/host`, `packages/platform`, `packages/sidecar`, `packages/sidecar-proto`, `packages/plugin-runtime`, `packages/registry-protocol`, `packages/agui-adapter`, `packages/diagnostics`, `packages/download`

6. **Capability dual-track rule** (`AGENTS.md` § "Capability exposure"): every user-facing capability must reach both web UI AND `od` CLI. Roduq additions w Phase 2-7 (skills + multi-variant + MCP) MUSZĄ follow ten pattern jeśli touch user-facing features.

7. **App naming channel-distinct**: stable = "Open Design", beta = "Open Design Beta", preview = "Open Design Preview". Roduq distribution = own channel TBD (np. "Roduq Design Studio" jako stable equivalent). Nie ma sense forcować name swap w upstream-shared assets dopóki nie packagujemy własnej distribution.

8. **CONTEXT.md upstream** zawiera domain glossary (Project / Normal Artifact / Live Artifact / etc.) — should respect terminology gdy piszemy Roduq additions interacting z upstream concepts.

9. **AGENTS.md (root)** to canonical agent guide upstream — bardziej szczegółowy niż CLAUDE.md upstream stub (`@AGENTS.md`). Nasze CLAUDE.md (root) jest Roduq-specific; agent powinien czytać OBA gdy zaczyna pracę.

10. **`@open-design/web`** ma już @anthropic-ai/sdk 0.32.1 + openai 6.38.0 dependencies — provider abstraction Roduq będzie reuse'ować te SDK installations zamiast re-installing.

### Phase 2 — Skills convention deep dive (~3h docs + ~6h implementation) ✅ done

**Goal**: Roduq custom skills following Anthropic skills standard.

**Deliverables (executed 2026-05-26)**:
- ✅ 7 Roduq skills shipped — commit per skill (rule 006):
  - `skills/roduq-saas-landing/` — canonical depth (SKILL.md + 3 references + 4 templates ~1860 LOC)
  - `skills/roduq-agency/` — creative/marketing/design agencies (1001 LOC)
  - `skills/roduq-restaurant/` — restauracja/café/bistro (1200 LOC)
  - `skills/roduq-clinic/` — medical/wellness practice z RODO-strict (1295+ LOC)
  - `skills/roduq-real-estate/` — biuro nieruchomości (multi-LOC)
  - `skills/roduq-product-launch/` — single product / waitlist (1295 LOC)
  - `skills/roduq-portfolio/` — freelancer / artist / solo creator (1230 LOC)
- Total: ~9000 LOC new w Phase 2 across 49 files (7 SKILL.md + 21 references + 21 templates)

**Lessons learned (post-Phase-2 — sync z `.cursor/rules/002-skills-convention.mdc`)**:

1. **Frontmatter field name: `triggers`** NIE `when_to_use`! Upstream nexu-io/open-design uses `triggers:` w SKILL.md frontmatter (per `skills/AGENTS.md` line 26 + per actual skill examples like `skills/design-md/SKILL.md`). Nasze docs pierwotnie zakładały `when_to_use` — corrected w all 7 Roduq skills.

2. **`od.*` namespace dla upstream metadata**:
   - `od.mode`: enum — observed values: `utility`, `design-system`, `prototype`. Nasze 7 skills used `design-system` (output = design system + content + sections).
   - `od.category`: free-text. Common values: `marketing-creative`, `design-systems`, `web-artifacts`, `image-generation`, etc. Nasze used `marketing-creative` dla all 7.
   - `od.upstream`: URL — used przez upstream stubs. NIE używamy w Roduq skills (they're not stubs).

3. **Roduq-specific extensions via `od.roduq.*` namespace**:
   ```yaml
   od:
     mode: design-system
     category: marketing-creative
     roduq:
       industry: saas         # saas | agency | restaurant | clinic | real-estate | product-launch | portfolio
       target_repo: roduq-web-starter
       output_protocol: "https://roduq.dev/schemas/v1/"
       model_hint: anthropic   # provider preference
       polish_first: true
       rodo_strict: true      # only dla clinic (medical data sensitivity)
   ```
   Coexists cleanly z upstream `od.*` schema — Anthropic skills convention is open dla extension.

4. **Most upstream skills są stubs** (curated catalogue pointing at external repos: Google Labs, Anthropic skills, VoltAgent, ComposioHQ). Nasze 7 Roduq skills są PIERWSZĄ group z actual `assets/` + `references/` content w main upstream repo (gdy follow standard format). To NIE jest problem — upstream `AGENTS.md` line 4-5 explicitly mentions "any side files (`assets/`, `references/`, scripts, …) the workflow needs."

5. **Skills are markdown-only definitions** — NIE mają `index.ts` lub executable code (per upstream skills format). Execution flow: daemon parses SKILL.md → agent reads instructions + assets/templates → invokes LLM (via provider abstraction Phase 7) → produces output files (Phase 5 ajv validation). Nasze Phase 2 deliverable = definitions only; execution wiring w Phase 5-7.

6. **Block types embedded w HTML templates** via `data-block-type` attribute (e.g., `<section class="hero" data-block-type="hero" data-variant="centered">`). Machine-readable, validates against canonical list w `apps/marketing-starter/src/blocks/types.ts` (sister repo). Polish per industry — common core (hero, cta) + industry-specific (menu dla restaurant, doctor-bio dla clinic, listings-featured dla real-estate, work-grid dla portfolio).

7. **Per-industry voice deeply contextual** — Phase 2 confirmed seven distinct voice profiles required:
   | Skill | Voice principle | Polish honorifics |
   |---|---|---|
   | saas-landing | Concrete benefits + numeric proof | "Ty" default |
   | agency | Confident bez arrogance + work-led | Neutral "Ty/wy" |
   | restaurant | Sensory + place-as-character | "Ty" casual / "Państwo" fine dining |
   | clinic | Empathetic + honest about uncertainty | "Pan/Pani" medical default |
   | real-estate | Neighborhood expertise + realistic > hype | "Państwo" formal |
   | product-launch | Anticipation > availability + story-driven | "Ty" startup energy |
   | portfolio | First-person + personality + authenticity | "Ty" peer-to-peer |

8. **Bilingual PL/EN strategy varies by industry**:
   - Tourist-facing (restaurant w Kraków, agency international clients, portfolio z foreign clients): PL primary + EN at `/en/` subdirectory
   - Local-only (clinic Polish patients, restaurant non-tourist, real-estate Polish market): PL only OK
   - Always: menu items, dish names z bilingual format `PL / EN` inline (restaurant convention)

9. **Mobile-first reality per industry** (recorded w target-audience.md per skill):
   - Restaurant: ~80% mobile bookings → tap-to-call critical
   - Clinic mental health: ~70% mobile → single-action booking
   - Real estate: ~65% mobile browsing → simplified search filters
   - SaaS-landing / agency / portfolio: ~50% mobile (more desktop dla B2B)

10. **HTML templates standards (used across all 7 skills)**:
    - Framework-agnostic (no React, no JSX) — target = Astro consumer w roduq-web-starter
    - CSS variables for tokens (`var(--color-brand-primary)`, etc.) — Phase 5 file protocol injects these
    - `{{key}}` placeholders dla content.json injection
    - `prefers-reduced-motion` respected w hover transforms + animations
    - WCAG AA: focus-visible outlines, touch targets ≥44-48px, color NIE jest sole indicator
    - `data-block-type` + `data-variant` attributes dla machine readability
    - Inline `<style>` blocks (per template) — scoped, no global CSS conflicts

11. **Reference files structure consistency** — 3 files per skill:
    - `inspiration.md` — gold standard examples z industry + Polish-market specifics + layout patterns + anti-patterns
    - `content-patterns.md` — voice principles + per-section templates z PL examples + Polish-specific (honorifics, currency, dates) + length constraints
    - `target-audience.md` — 4-5 personas + signal detection w brief + per-persona content emphasis matrix

12. **Saas-landing as canonical depth** (1860 LOC) — first skill set "canonical depth" pattern (full instructions + 2 examples + 4 templates). Other 6 skills lighter (~1000-1300 LOC) — reference saas-landing pattern dla shared concepts, focused on industry-specific differentiation.

13. **better-sqlite3 install failure** (Phase 1 lesson — confirmed Phase 2): Upstream `pnpm install` failed na Windows native due do brak VS Build Tools 2022+. NIE blocks skill creation (skills are markdown only). User może uruchomić install w WSL/macOS lub install VS Build Tools dla Windows native runtime.

**Anthropic Skills Convention (canonical)**:
```
skills/
└── <skill-name>/                  # kebab-case
    ├── SKILL.md                   # main instructions (required)
    ├── assets/                    # static resources (templates, images, code)
    │   ├── template.html          # boilerplate dla skill output
    │   └── references/            # additional context (Markdown OK)
    │       ├── inspiration.md
    │       └── patterns.md
    └── README.md                  # human-facing description (optional)
```

**SKILL.md structure**:
```markdown
---
name: roduq-saas-landing
description: |
  Generate SaaS landing page z hero + features + pricing + CTA + testimonials + FAQ.
  Use when user wants conversion-focused page dla software product.
when_to_use: |
  - User mentions "SaaS landing", "product page", "software website"
  - Brief includes pricing tiers, feature comparisons
  - Target audience = decision-makers (CTOs, founders, ops)
---

# Roduq SaaS Landing Generator

## Instructions

[Step-by-step instructions agent follows. Reference assets/ files.]

## Examples

[Concrete input → output examples]
```

**Custom Roduq skills do implementacji** (7):

| Skill | Use case | Sections | Asset templates |
|-------|----------|----------|-----------------|
| `roduq-saas-landing` | Software product page | hero, features, pricing, testimonials, FAQ, CTA | dla każdej section |
| `roduq-agency` | Kreatywna agencja | hero, services, case-studies, team, contact | portfolio grid templates |
| `roduq-restaurant` | Restauracja / kawiarnia | hero, menu, gallery, reservation, location | menu cards + booking widget |
| `roduq-clinic` | Gabinet (lekarz/dietetyk/psycholog) | hero, services, doctor-bio, booking, contact | service cards + booking |
| `roduq-real-estate` | Biuro nieruchomości | hero, search, listings, agent-bio, contact | property card grid + map |
| `roduq-product-launch` | Single-product launch z waitlist | hero, features, waitlist, FAQ, social-proof | hero variants + waitlist forms |
| `roduq-portfolio` | Portfolio freelancer/agency | hero, work, about, contact | masonry/grid project layouts |

Każda skill produkuje:
- `tokens.json` — design tokens (palette + typography + spacing)
- `sections.json` — block sequence dla homepage + other pages
- `content.json` — draft copy (PL + EN drafts)
- `design-system.md` — human-readable design system summary

### Phase 3 — 7 DESIGN.md system presets (~8h) ✅ done

**Goal**: curated brand-agnostic visual systems z różnymi aesthetics.

**Deliverables (executed 2026-05-26)**:
- ✅ 7 Roduq presets shipped — commit per preset (rule 006):
  - `design-systems/roduq-default/` — canonical depth (z DESIGN.md + tokens.css + tokens.example.json + inspiration.md + samples/full-page.html z dark mode @media)
  - `design-systems/roduq-monolith-meadow/` — warm earthy (sage + terracotta, Fraunces serif)
  - `design-systems/roduq-tech-modern/` — Linear/Vercel (indigo + magenta gradient, bento, wider 80rem)
  - `design-systems/roduq-warm-editorial/` — NYT/Substack (serif body, dropcap, 38rem article width)
  - `design-systems/roduq-brutalist/` — B/W + RGB (Helvetica 900, radius 0, 4px borders, marquee strip)
  - `design-systems/roduq-soft-pastel/` — wellness (lavender + peach + mint, pill buttons, soft shadows)
  - `design-systems/roduq-dark-cinematic/` — premium SaaS dark (jet black + neon purple/cyan glows)
- Total: 35 plików (7 presetów × 5 plików each)

**Lessons learned (post-Phase-3 — sync z `.cursor/rules/003-design-systems.mdc`)**:

1. **Upstream uses `tokens.css`** (CSS variables w `:root`) NIE `tokens.example.json` jak nasze docs zakładały. Per `design-systems/_schema/AGENTS.md` + observed w `design-systems/default/tokens.css` (upstream). Roduq presets provide BOTH (tokens.css upstream-compatible, tokens.example.json schema preview).

2. **Upstream lint contract** w `craft/color.md` (lint-enforced via `apps/daemon/src/lint-artifact.ts`):
   - Neutrals (70-90% pixels): `--bg`, `--surface`, `--fg`, `--muted`, `--border`
   - Accent (5-10% pixels, max 2 visible uses per screen): `--accent` (SINGLE — NIE second accent)
   - Accent states: `--accent-hover`, `--accent-active`, `--accent-on`
   - Semantic (0-5% pixels): `--success`, `--warn`, `--danger`
   - Typography: `--font-display`, `--font-body`, `--font-mono`
   - "accent-overuse" P1 fires at >6 inline occurrences per screen
   - "raw-hex >12 outside :root" P1
   - "indigo laundering" P0

3. **Schema extensions** (optional per brand): `--fg-2`, `--meta`, `--surface-warm`, `--border-soft` — alias to richer siblings via `var()` gdy brand doesn't differentiate (per upstream default tokens.css comments). Roduq presets follow this.

4. **Naming collision resolution**: upstream already has `default/` and `warm-editorial/` presets (matching our planned names). Solution: `roduq-` prefix dla all 7 presets (e.g., `roduq-default`) — coexist z upstream's 152 existing design systems bez overwrite.

5. **Dual-layer token strategy** (Roduq solution dla upstream compat + skills templates compat):
   ```css
   :root {
     /* Layer 1: Upstream contract (lint-enforced) */
     --bg: ...; --surface: ...; --fg: ...; --accent: ...;
     /* Layer 2: Roduq extensions (used by skills templates from Phase 2) */
     --color-brand-primary: var(--accent);
     --color-surface-default: var(--surface);
     --space-*: ...; --text-*: ...; --radius-*: ...;
   }
   ```
   Phase 2 skills templates (which use `--color-brand-primary` etc.) work transparently z any Roduq preset.

6. **Pure black/white anti-pattern** (per `craft/color.md` § "Dark themes"):
   - Light mode: `#FAFAFA` bg, `#0F0F0F` fg (NIE pure)
   - Dark mode: `#0F0F0F` bg, `#F0F0F0` fg (NIE pure)
   - Exception: Brutalist preset uses pure #000/#FFF (brutalism wants harshness — anti-vibration rule deliberately broken dla style statement)

7. **Dark mode accent-hover requires white-mix** (NIE black-mix used dla light mode). Light accents na dark bg already low-contrast — darkening makes worse. White-mix lightens for hover visibility. Confirmed w roduq-dark-cinematic + per upstream tokens.css comments (kami brand pattern).

8. **Per-preset radii signature** (visual differentiator):
   - Brutalist: 0 (anti-rounded)
   - Default/Tech Modern/Dark Cinematic: 0.5-0.875rem md (standard)
   - Monolith Meadow: 0.625-1rem md (slightly softer)
   - Soft Pastel: 1-1.5rem md (signature soft)
   - Warm Editorial: 0.125-0.25rem md (tight print feel)

9. **Per-preset container width** (layout signature):
   - Warm Editorial: 38rem article / 48rem md (narrow 65ch optimal reading)
   - Default / Monolith Meadow: 70-72rem
   - Tech Modern / Dark Cinematic: 76-80rem (wider for tech)
   - Brutalist: 84rem (very wide asymmetric layouts)

10. **Per-preset font scale variations**:
    - Brutalist: 8rem hero (statement)
    - Tech Modern: 5rem hero (large but readable)
    - Dark Cinematic: 4.5rem hero
    - Default / Monolith Meadow: 3.75-4rem hero
    - Soft Pastel: 3.25rem hero (friendlier scale)
    - Warm Editorial: 5.5rem hero z serif (display typography weight)

11. **Polish character handling** verified w all 7 presets — Inter, Fraunces, Lora, Recoleta, Geist all support full Polish charset (ą/ć/ę/ł/ń/ó/ś/ź/ż).

12. **Google Fonts preconnect pattern** used w samples że include free fonts (Fraunces, Inter, JetBrains Mono, Lora). Premium fonts (Tiempos, Söhne, Recoleta proper) listed w font-family stack z free fallbacks.

13. **`prefers-reduced-motion: reduce`** respected w all 7 samples — animation/transitions duration overridden do 0.01ms. Brutalist marquee, soft-pastel hover transforms, dark-cinematic badge pulse — all safe.

14. **HTML samples scope**: Phase 3 delivered full-page.html primary dla each preset (renderable demo). Individual section samples (hero/features/cta/pricing) NIE created — can be derived from skills templates Phase 2 z token substitution gdy needed. Future Phase 7 może add per-preset section samples gdy visual regression testing wymaga.

Każdy preset to katalog `design-systems/<name>/` z:
- `DESIGN.md` — main spec (palette, typography, voice, layout principles)
- `tokens.example.json` — output tokens example
- `inspiration.md` — references (Refactoring UI / Tailwind UI / shadcn / Linear / Mantine snippets)
- `samples/` — HTML snippets dla każdej section type

**7 presets** (szczegóły w [DESIGN_SYSTEMS.md](DESIGN_SYSTEMS.md)):
1. `default` — neutral, "starter" preset (Inter + zinc grays)
2. `monolith-meadow` — warm earthy, twierdza-boyen sanitized (Recoleta + sage/terracotta)
3. `tech-modern` — Linear/Vercel inspired (Geist + dark indigo + crisp shadows)
4. `warm-editorial` — magazine style NYT/Substack (Tiempos + cream + serif emphasis)
5. `brutalist` — Are.na/Stripe Press inspired (Mono + raw black on white + strong borders)
6. `soft-pastel` — Notion/Linear soft (rounded + dusty pastels + low contrast)
7. `dark-cinematic` — premium SaaS dark (Inter Display + jet black + neon accents)

### Phase 4 — Multi-variant skill (KEY DIFFERENTIATOR, ~6h) ✅ done

**Goal**: skill który generuje **3 warianty równolegle** różnymi kierunkami → user wybiera.

**Deliverables (executed 2026-05-26)**:
- ✅ `skills/multi-variant/` — 6 plików ~1800 LOC:
  - `SKILL.md` (~350 lines) — frontmatter (10 triggers, od.roduq.variant_count + parallel_execution + target_execution_time_ms) + variant taxonomy + 7×3 preset matrix + execution flow + 3 examples + performance budget + LLM cost analysis
  - `references/variant-strategy.md` (~210 lines) — Conservative/Modern/Bold philosophy + per-industry trade-offs
  - `references/preset-mapping.md` (~190 lines) — 21-cell matrix rationale + edge cases
  - `references/parallel-execution.md` (~350 lines) — Promise.all + timeout + error recovery + token budget
  - `assets/preview-side-by-side.html` (~440 lines) — 3-col iframe layout + fullscreen modal + pick/regenerate API
  - `assets/variant-picker.html` (~250 lines) — compact sidebar picker

**Lessons learned (post-Phase-4)**:

1. **Orchestrator pattern via Anthropic skills convention** — multi-variant SKILL.md instructions describe calling 7 industry skills (roduq-*) as sub-tasks. Agent recursion natural w Claude — no TypeScript "skill runner" needed dla Phase 4 (Phase 7 implements code wiring).

2. **7×3 preset selection matrix** — 100% utilization across 7 Roduq presets, each used w 2-5 cells:
   - saas-landing: tech-modern / dark-cinematic / brutalist
   - agency: default / tech-modern / brutalist
   - restaurant: monolith-meadow / warm-editorial / dark-cinematic
   - clinic: soft-pastel / default / warm-editorial
   - real-estate: default / dark-cinematic / warm-editorial
   - product-launch: default / dark-cinematic / brutalist
   - portfolio: default / dark-cinematic / brutalist

3. **Variant philosophy** — Conservative/Modern/Bold framed as TRADE-OFFS na risk-reward curve, NIE quality hierarchy. Conservative wymaga REAL design thinking (Linear/Vercel są conservative AND excellent).

4. **Promise.all over sequential** — 2-3× wall-clock savings (15-25s vs 30-60s). Identical LLM cost. Per-variant timeout 45s, total timeout 60s hard ceiling.

5. **meta-multi-variant.json extends file protocol** (rule 004): status per variant (complete/timeout/error), token usage, selection state (selectedVariant: number | null), userPick + timestamps.

6. **Output structure extends** — `variants/{1-conservative, 2-modern, 3-bold}/` subdirectories during generation; promotion to root after user picks. Unselected variants stay w variants/ dla future reference.

7. **Token budget realistic** (Anthropic Claude Sonnet 4.6+):
   - Per variant: ~$0.10-0.17 (10-20k input + 8-15k output)
   - Per multi-variant run: ~$0.30-0.51
   - Roduq agency typical (100 runs/month): ~$30-50/month

8. **Cost optimization opportunities** dla Phase 7: prompt caching (Anthropic ~20% input reduction), Haiku dla Conservative (~80% cost), response cache dla regeneration, OpenAI fallback gdy rate-limited.

9. **iframe preview UX pattern** — 3-col scaled 0.4× thumbnails z transform-origin top-left, pointer-events none on iframe + overlay button dla fullscreen, Escape key + close button.

10. **Edge cases documented** w preset-mapping.md: ambiguous industry detection (prompt), brand color overrides (palette locked across variants), bilingual default, restricted preset list (e.g., government client = light theme only), regeneration (move existing to variants-archive-{timestamp}/).

11. **Rate limiting strategy** — in-process queue max 6 concurrent variants (2 multi-variant runs), Mock fallback gdy primary provider down (rule 007).

12. **Phase 7 implementation notes** w parallel-execution.md: use existing `@open-design/web` SDKs, add `ajv`, implement w `apps/daemon` (NOT apps/web — daemon owns skill execution per upstream AGENTS.md), `yaml` library dla frontmatter parsing.

**`skills/multi-variant/SKILL.md`**:

```markdown
---
name: multi-variant
description: |
  Generate 3 design variants od jednego briefu — Conservative / Modern / Bold.
  User wybiera + exportuje wybrany variant.
when_to_use: |
  - User pierwsza wizyta i nie wie co chce
  - User chce porównać aesthetics przed committing
  - User generujący dla nowego klienta i chce options dla pitch
---

# Multi-Variant Generator

## Flow

1. **Receive input**: brief + audience + tone + brand colors (opcjonalne)
2. **Generate w parallel** (Promise.all):
   - **Conservative variant** — proven layout, safe colors, minimal animations
   - **Modern variant** — current trends, scroll animations, gradient/mesh accents
   - **Bold variant** — statement piece, unconventional layout, strong visual identity
3. **Render** 3 preview HTML files w iframe side-by-side
4. **User picks** 1 → export do `.roduq/output/{client-id}/`

## Per-variant generation

Conservative:
- Use `tech-modern` lub `warm-editorial` preset (safer choices)
- Standard sections order (hero → features → pricing → CTA)
- Conservative animations (fade-in, no scroll triggers)
- High contrast, readable typography

Modern:
- Use `dark-cinematic` lub `soft-pastel` preset
- Add scroll-triggered animations (parallax light, scale-in)
- Gradient/mesh backgrounds
- Trending layout patterns (bento grids, bento heroes)

Bold:
- Use `brutalist` lub `monolith-meadow` preset
- Asymmetric layouts, oversized typography
- Statement hero (text-only hero z killer headline)
- Unusual color combinations z palette
```

### Phase 5 — File export protocol (~3h)

**Goal**: deterministic, schema-validated artifacts w `.roduq/output/{client-id}/`.

**Files generated**:
- `tokens.json` — design tokens (validated z JSON Schema v7)
- `sections.json` — Payload-ready block configurations
- `content.json` — copy drafts (PL + EN per section)
- `design-system.md` — human-readable summary
- `preview.html` — static snapshot dla verification
- `meta.json` — generation metadata (skill used, prompt, timestamp, variant picked)

**Output directory layout**:
```
~/.roduq/output/
└── acme-corp/                     # client-id (slug)
    ├── meta.json                  # { generatedAt, skill, prompt, variant }
    ├── design-system.md
    ├── tokens.json
    ├── sections.json
    ├── content.json
    ├── preview.html
    └── assets/                    # optional uploaded brand assets
        ├── logo-original.png
        └── existing-brand.pdf
```

**JSON Schemas** (host na `roduq.dev/schemas/v1/`):

### `tokens.json` v1 schema (abbreviated)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "generatedAt", "tokens"],
  "properties": {
    "version": { "type": "string", "pattern": "^1\\." },
    "generatedAt": { "type": "string", "format": "date-time" },
    "generatedBy": { "type": "string" },
    "sourcePrompt": { "type": "string" },
    "selectedVariant": { "type": "integer", "enum": [1, 2, 3] },
    "tokens": {
      "type": "object",
      "required": ["color", "font", "spacing", "radii"],
      "properties": {
        "color": {
          "type": "object",
          "required": ["surface", "ink", "outline", "brand"],
          "properties": {
            "surface": { "type": "object", "required": ["default", "raised", "sunken"] },
            "ink": { "type": "object", "required": ["primary", "secondary"] },
            "outline": { "type": "object", "required": ["default", "strong"] },
            "brand": { "type": "object", "required": ["primary"] }
          }
        },
        "font": {
          "type": "object",
          "required": ["display", "body"]
        }
      }
    }
  }
}
```

### `sections.json` v1 schema (abbreviated)
```json
{
  "homepage": {
    "blocks": [
      {
        "blockType": "hero",         // matches @roduq/marketing-starter blocks/types.ts
        "variant": "centered" | "split-right" | "mesh-gradient",
        "title": "string",
        "subtitle": "string",
        "ctaPrimary": { "label": "string", "href": "string" }
      }
    ]
  }
}
```

Block types **MUST** match `apps/marketing-starter/src/blocks/types.ts` w roduq-web-starter (canonical source). Skill template includes that file za reference.

### Phase 6 — MCP server bridge (~4h)

**Goal**: Claude Code w repo klienta może query Open Design state przez Model Context Protocol.

**Implementation**:
- `src/mcp-server.ts` — stdio MCP server
- Tools exposed:
  - `get_design_state(clientId)` → returns current artifacts
  - `regenerate_section(clientId, sectionId)` → triggers skill re-run
  - `pick_variant(clientId, variantNum)` → updates `meta.json`
- Klient w `roduq-web-starter`/.claude/settings.json wires MCP server

Bonus: real-time HMR — gdy admin zmienia tokens w Open Design UI, MCP server emits event → marketing-starter `client-theme.css` re-syncs bez page reload.

### Phase 7 — Testing + production polish (~6h)

**Test strategy**:
- **Unit tests** per skill (input fixtures → expected output JSON)
- **Integration tests**: end-to-end skill execution → schema-validated output → CLI consumption
- **Visual regression**: Playwright screenshot test każdej variant per skill (catches accidental CSS breakage)
- **Schema validation**: ajv strict check dla każdego output file

**Production polish**:
- Error boundaries z useful messages ("API key missing — set ANTHROPIC_API_KEY")
- Rate limiting per skill execution (caller paid LLM quota)
- Output deduplication (same prompt + variant = cached result)
- Telemetry (opt-in) — popular skills, avg generation time

## 4. Industry references (study these BEFORE building)

### Visual design quality bar
- **[Refactoring UI](https://www.refactoringui.com/)** — Adam Wathan + Steve Schoger. Best book na typography + spacing + color theory dla web.
- **[Tailwind UI](https://tailwindui.com/)** — production-quality components do study (subscribers can inspect HTML).
- **[shadcn/ui](https://ui.shadcn.com/)** — design system patterns + accessibility patterns dla React. Open source.
- **[Linear](https://linear.app/)** — gold standard SaaS dark mode + animation choreography.
- **[Stripe](https://stripe.com/)** — color theory + iconography + density patterns.
- **[Vercel](https://vercel.com/)** — dark-cinematic preset reference.
- **[Mantine](https://mantine.dev/)** — accessibility-first React components.

### Layout principles
- **[Layout primitives](https://every-layout.dev/)** — Heydon Pickering + Andy Bell. Reusable layout patterns z minimum coupling.
- **[Inclusive Components](https://inclusive-components.design/)** — accessible patterns dla complex widgets.

### Voice + tone
- **[Mailchimp Content Style Guide](https://styleguide.mailchimp.com/)** — defining brand voice.
- **[Atlassian Design](https://atlassian.design/content/voice-and-tone)** — voice principles dla SaaS.

### Animation
- **[Animation Handbook](https://www.designbetter.co/animation-handbook)** by InVision — purposeful motion.
- **[Tailwind CSS animations](https://tailwindcss.com/docs/animation)** + Motion (formerly Framer Motion).

## 5. AI integration architecture

### LLM provider abstraction

Open Design fork używa swojego LLM router (separate od marketing-starter's `@roduq/llm-router`, ale similar pattern). Reasons:
- Open Design jest desktop-style local-first — caller wstrzykuje API key
- Marketing-starter jest server SSR — env-based providers

Recommended providers per use case:
- **Anthropic Claude Sonnet 4.6+** — primary dla design generation (highest quality, reasoning over visual choices)
- **OpenAI GPT-5** — alternative dla users z OpenAI subscription
- **Google Gemini 2.5 Pro** — alternative dla users z Google Workspace

Każda skill ma `model_hint: "anthropic|openai|gemini"` w SKILL.md frontmatter — preferred provider gdy multiple available.

### Skills execution pattern

```
User input → SKILL.md instructions parsed → 
  Agent calls LLM z context (template + references + brief) →
  LLM produces structured output (JSON validated) →
  Asset files generated (HTML preview rendered) →
  User reviews + iterates lub exports
```

Skill może być nested (np. `multi-variant` calls `roduq-saas-landing` 3× w parallel).

## 6. File-system protocol details

### Watcher contract

CLI watches `${HOME}/.roduq/output/<client-id>/.complete` flag file. Open Design writes:
1. All output files atomically (temp dir + rename)
2. Validates schemas before emit
3. Writes `.complete` last (signals CLI ready do consume)

CLI:
1. Detects `.complete` (chokidar / fs.watch)
2. Reads all artifacts
3. Validates schemas (ajv)
4. Deletes `.complete` (so re-runs don't trigger duplicate consumption)
5. Proceeds z scaffolding

### Multi-tenancy

Wiele projektów może działać równolegle: `acme-corp/`, `beta-inc/`, `gamma-llc/`. Open Design UI shows project picker przy startup.

### Schema versioning

`$schema` field w każdym JSON output. CLI rozumie multiple versions:
- v1 (current) — described above
- v2 (future) — może mieć animations, theme variants, custom fonts via Google Fonts API

CLI migration helper: `tokens.v1.json` → `tokens.v2.json` automatic dla forward compat.

## 7. Open questions (decide w trakcie implementacji)

| Question | Lean | Decision context |
|----------|------|------------------|
| Where host JSON schemas? | `roduq.dev/schemas/v1/` (CDN) + local copy w `@roduq/cli/schemas/` | Centralized + offline-capable |
| MCP transport: stdio czy HTTP? | stdio (matches Claude Code default) | Standard pattern |
| Animation library: Motion czy CSS-only? | CSS scroll-driven primary + Motion dla complex | Performance + accessibility |
| Image generation: AI lub stock? | Recommend placeholders + suggest stock sources (Unsplash API) | Avoid copyright issues |
| Font hosting: Google Fonts czy local? | Both — preset z fonts.css local, klient może swap | DX + perf flexibility |

## 8. Definition of done (ship criteria)

Phase complete gdy:
- ✅ Wszystkie 7 phase deliverables shipped
- ✅ End-to-end test: `pnpm run e2e:full-cycle` (uruchamia Open Design + creates client + CLI consumes + builds + screenshots)
- ✅ 7 skills working (każda generuje valid output)
- ✅ 7 DESIGN.md systems documented z example outputs
- ✅ multi-variant tested z 5+ briefów across industries
- ✅ MCP server tested z Claude Code w sample client repo
- ✅ Performance: skill execution <30s (target <15s)
- ✅ Documentation: README + CONTRIBUTING + each skill ma own README

## 9. Out of scope (v2.0 stretch)

- Real-time HMR Open Design ↔ marketing-starter
- Multi-user collaboration (designer + dev on same project)
- Custom skill creator (UI dla building new skills bez kodu)
- Marketplace dla community skills
- Image generation integration (Replicate / DALL-E)
- Animation generator (Motion code from natural language)

## 10. Success metrics (post-launch)

- **Time from brief → working site**: target <5 min (currently manual = 2-5 dni)
- **Skill execution success rate**: target >95% (5% retry rate acceptable)
- **Multi-variant adoption**: target >70% users use it
- **Client satisfaction (NPS)**: target >50 (industry SaaS benchmark)

---

## Next steps (start here)

1. Read [AGENT_PROMPT.md](AGENT_PROMPT.md) — copy do nowej Opus sesji
2. Read [DESIGN_SYSTEMS.md](DESIGN_SYSTEMS.md) — 7 preset specs
3. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design)
4. Execute Phase 1 → 7 sequentially

Agent powinien commit każde phase incrementally — łatwiejszy debugging gdy coś się rozjedzie.
