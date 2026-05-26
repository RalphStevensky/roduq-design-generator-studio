# Open Design — Implementation Guide

> Comprehensive marching orders dla parallel agent (Opus) budującego `roduq-design-generator-studio` (fork nexu-io/open-design + Roduq customizations). Wszystko czego agent potrzebuje w jednym miejscu.

## 1. Context (read first)

- **[ADR-0003](decisions/0003-open-design-separate-repo.md)** — dlaczego osobne repo, NIE monorepo
- **[DESIGN_GENERATOR_BRIDGE.md](DESIGN_GENERATOR_BRIDGE.md)** — symbioza marketing-starter ↔ Open Design fork, file protocol, `@roduq/cli` orchestrator
- **[OPEN_DESIGN_DESIGN_SYSTEMS.md](OPEN_DESIGN_DESIGN_SYSTEMS.md)** — 7 preset DESIGN.md systems do zaimplementowania
- **[OPEN_DESIGN_AGENT_PROMPT.md](OPEN_DESIGN_AGENT_PROMPT.md)** — copy-paste prompt do nowej Opus sesji

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

### Phase 1 — Fork + project setup (~4h)

**Goal**: standalone repo z working Open Design upstream + Roduq branding.

**Deliverables**:
1. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design) → `roduq-design-generator-studio`
2. Verify upstream działa: `pnpm install && pnpm dev` — http://localhost:8765 ładuje
3. Rebrand minimal: logo + favicon + page title "Roduq Design Studio"
4. README z Roduq context + link do `roduq-web-starter` documentation
5. License preservation: Apache-2.0 (upstream) + Roduq additions under proprietary (LICENSE-ROduQ.txt)
6. `.env.example` z required keys (ANTHROPIC_API_KEY lub OPENAI_API_KEY dla skill execution)

**Acceptance**:
- `pnpm dev` uruchamia UI
- User widzi Roduq branding
- Upstream skills działają (np. generate-button)

### Phase 2 — Skills convention deep dive (~3h docs + ~6h implementation)

**Goal**: Roduq custom skills following Anthropic skills standard.

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

### Phase 3 — 7 DESIGN.md system presets (~8h)

**Goal**: curated brand-agnostic visual systems z różnymi aesthetics.

Każdy preset to katalog `design-systems/<name>/` z:
- `DESIGN.md` — main spec (palette, typography, voice, layout principles)
- `tokens.example.json` — output tokens example
- `inspiration.md` — references (Refactoring UI / Tailwind UI / shadcn / Linear / Mantine snippets)
- `samples/` — HTML snippets dla każdej section type

**7 presets** (szczegóły w [OPEN_DESIGN_DESIGN_SYSTEMS.md](OPEN_DESIGN_DESIGN_SYSTEMS.md)):
1. `default` — neutral, "starter" preset (Inter + zinc grays)
2. `monolith-meadow` — warm earthy, twierdza-boyen sanitized (Recoleta + sage/terracotta)
3. `tech-modern` — Linear/Vercel inspired (Geist + dark indigo + crisp shadows)
4. `warm-editorial` — magazine style NYT/Substack (Tiempos + cream + serif emphasis)
5. `brutalist` — Are.na/Stripe Press inspired (Mono + raw black on white + strong borders)
6. `soft-pastel` — Notion/Linear soft (rounded + dusty pastels + low contrast)
7. `dark-cinematic` — premium SaaS dark (Inter Display + jet black + neon accents)

### Phase 4 — Multi-variant skill (KEY DIFFERENTIATOR, ~6h)

**Goal**: skill który generuje **3 warianty równolegle** różnymi kierunkami → user wybiera.

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

1. Read [OPEN_DESIGN_AGENT_PROMPT.md](OPEN_DESIGN_AGENT_PROMPT.md) — copy do nowej Opus sesji
2. Read [OPEN_DESIGN_DESIGN_SYSTEMS.md](OPEN_DESIGN_DESIGN_SYSTEMS.md) — 7 preset specs
3. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design)
4. Execute Phase 1 → 7 sequentially

Agent powinien commit każde phase incrementally — łatwiejszy debugging gdy coś się rozjedzie.
