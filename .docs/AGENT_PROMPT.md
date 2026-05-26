# Open Design — Agent Execution Prompt

> Copy-paste this prompt do nowej sesji Claude Opus 4.7 (1M context) gdy chcesz launch parallel work na `roduq-design-generator-studio`. Self-contained — agent dostaje wszystko czego potrzebuje.

## How to use

1. Otwórz nową sesję Claude Code w **osobnym folderze** (np. `C:/Users/stefa/GIT/roduq-design-generator-studio/`). Ta sesja będzie pracować równolegle z `roduq-web-starter`.
2. Skopiuj cały TL;DR poniżej + paste jako pierwszą wiadomość.
3. Agent execute autonomously phase-by-phase. Commits co phase ukończony.
4. Po każdej fazie agent **paused** i waits for `kontynuuj` lub feedback. Możesz redirect mid-flight.

---

## TL;DR — copy from here ↓

```
Pracujemy równolegle z głównym repo `roduq-web-starter` (Astro 6 + Payload CMS + MongoDB).

Twoje zadanie: **build `roduq-design-generator-studio`** — fork [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0) z Roduq customizations.

Cel końcowy: standalone aplikacja desktopowa (Next.js + SQLite + ~140 Anthropic skills) która:
1. User wpisuje brief (industry / audience / tone / brand)
2. AI generuje 3 design variants równolegle (Conservative / Modern / Bold)
3. User wybiera variant + exportuje do `~/.roduq/output/{client-id}/`
4. `@roduq/cli` w `roduq-web-starter` consume artifacts i scaffolduje pełny client project z working Astro + Payload + dev server

Wynik: **2-5 dni manual setup → 5 minut AI-driven**.

## Context (READ FIRST — dwa źródła wiedzy)

### Step 1: Cursor rules (operational TL;DR — auto-loaded w Cursor IDE)

1. **`.cursor/rules/README.md`** ⭐ — index 9 rules + sync policy między `.docs/` + `.cursor/rules/`
2. **`.cursor/rules/009-docs-sync.mdc`** — **META** rule: każda nowa decyzja MUSI być w obu lokalizacjach
3. **`.cursor/rules/001-project-overview.mdc`** — repo overview
4. Pozostałe rules (002-008) per glob match — Cursor IDE auto-loaduje, Claude Code czyta gdy zaczyna dotykać konkretne ścieżki

### Step 2: Narrative documentation (deep context)

5. **`.docs/decisions/0001-separate-repo.md`** — DLACZEGO separate repo (NIE monorepo) — Apache-2.0 vs proprietary, upstream sync, lifecycle
6. **`.docs/BRIDGE.md`** — Architektura symbiozy marketing-starter ↔ Open Design fork, file protocol `.roduq/output/`, @roduq/cli orchestrator flow
7. **`.docs/IMPLEMENTATION.md`** — **MAIN GUIDE** — 7 phases, 1-2 weeks. Phase 1 (fork) → Phase 7 (testing). Anthropic skills convention. Industry references.
8. **`.docs/DESIGN_SYSTEMS.md`** — 7 brand-agnostic visual presets (default / monolith-meadow / tech-modern / warm-editorial / brutalist / soft-pastel / dark-cinematic) z full color palettes + typography + voice + layout principles + inspiration links.

Read wszystkie przed startem. NIE skip. Cursor user czyta rules natywnie per glob, ale przy starcie warto explicit przeczytać.

### Step 3 (CRITICAL): docs sync protocol

Po każdej decyzji / nowym wzorcu / lesson learned → **update OBYDWA**:
- Pełen opis + kontekst w `.docs/<plik>.md`
- Concise actionable rule w `.cursor/rules/NNN-<slug>.mdc` z linkiem do `.docs/`

Patrz `.cursor/rules/009-docs-sync.mdc` dla pełnej polityki.

## Execution plan

Execute phases sequentially. Commit każdy phase jako separate commit z conventional message (`feat(skills): ...` / `feat(presets): ...` etc).

### Phase 1 — Fork + project setup (~4h)

1. `gh repo fork nexu-io/open-design --clone=true --remote=true` → rename do `roduq-design-generator-studio`
2. Verify upstream: `pnpm install && pnpm dev` — http://localhost:8765 ładuje OK
3. Rebrand minimal: logo + favicon + page title "Roduq Design Studio"
4. README rewrite z Roduq context + cross-reference do `roduq-web-starter`
5. License: Apache-2.0 preserved + Roduq additions under proprietary (LICENSE-ROduQ.txt — copy z roduq-web-starter LICENSE)
6. `.env.example` z required keys:
   - `ANTHROPIC_API_KEY` (preferred — Claude Sonnet 4.6+ dla design generation)
   - `OPENAI_API_KEY` (alternative)
   - `GOOGLE_API_KEY` (alternative — Gemini 2.5 Pro)
   - `ROduQ_OUTPUT_DIR` (default `${HOME}/.roduq/output`)

**Acceptance**: `pnpm dev` uruchamia z Roduq branding. Commit: `feat: fork z nexu-io/open-design + Roduq rebranding`.

### Phase 2 — Anthropic skills convention deep dive (~3h reading + ~6h implementation)

Read IMPLEMENTATION.md § 3 (Anthropic Skills Convention canonical) + study existing nexu-io/open-design skills format.

Implement 7 custom Roduq skills (każda skill = `skills/<name>/` katalog):

1. **`roduq-saas-landing`** — software product pages
2. **`roduq-agency`** — agencja kreatywna
3. **`roduq-restaurant`** — restauracja / kawiarnia
4. **`roduq-clinic`** — gabinet (lekarz / dietetyk / psycholog)
5. **`roduq-real-estate`** — biuro nieruchomości
6. **`roduq-product-launch`** — single-product launch z waitlist
7. **`roduq-portfolio`** — portfolio freelancer / agency

Każda skill struktura:
```
skills/<name>/
├── SKILL.md                     # frontmatter (name, description, when_to_use, model_hint) + instructions + examples
├── assets/
│   ├── template-hero.html       # boilerplate dla każdej section type
│   ├── template-features.html
│   └── ...
└── references/
    ├── inspiration.md           # industry refs (links + screenshots URLs)
    ├── content-patterns.md      # copy structure dla industry
    └── target-audience.md       # demographics + voice notes
```

Każda skill produkuje 4 output files w `.roduq/output/<client-id>/`:
- `tokens.json` — design tokens (validated z JSON Schema v1)
- `sections.json` — Payload-ready block configurations (matches `apps/marketing-starter/src/blocks/types.ts`)
- `content.json` — draft copy (PL + EN per section)
- `design-system.md` — human-readable summary

**Acceptance**: Każda z 7 skills working z sample brief — generuje valid output JSON. Commit per skill: `feat(skills): roduq-<name>`.

### Phase 3 — 7 DESIGN.md preset systems (~8h)

Read DESIGN_SYSTEMS.md (every preset spec szczegółowy). Implement w `design-systems/<name>/`:

```
design-systems/<preset>/
├── DESIGN.md
├── tokens.example.json
├── inspiration.md
└── samples/
    ├── hero.html
    ├── features.html
    ├── cta.html
    ├── pricing.html
    └── full-page.html
```

7 presets do zaimplementowania:
1. `default` — neutral starter
2. `monolith-meadow` — earthy warm
3. `tech-modern` — Linear/Vercel
4. `warm-editorial` — NYT/Substack
5. `brutalist` — Are.na/Stripe Press
6. `soft-pastel` — Notion friendly
7. `dark-cinematic` — premium SaaS dark

Każdy preset musi pass:
- Lighthouse Performance ≥90 dla `samples/full-page.html`
- Lighthouse Accessibility ≥95
- Color contrast WCAG AA dla wszystkich text/background combos
- Polish characters render OK (test z "Łódź żółw pięć")

**Acceptance**: 7 presets z full-page.html samples renderable + Lighthouse passing. Commit per preset.

### Phase 4 — Multi-variant skill (KEY DIFFERENTIATOR, ~6h)

Read IMPLEMENTATION.md § Phase 4.

Implement `skills/multi-variant/SKILL.md` które:
1. Receives brief + audience + tone + optional brand colors
2. Generates **3 variants równolegle** (Promise.all) — Conservative / Modern / Bold każda z innym preset selection
3. Renders 3 preview HTML files w iframe side-by-side
4. User picks 1 → export do `.roduq/output/`

Variant strategy:
- **Conservative**: `tech-modern` OR `warm-editorial` preset, standard layout, minimal animations
- **Modern**: `dark-cinematic` OR `soft-pastel`, scroll animations, gradient/mesh accents
- **Bold**: `brutalist` OR `monolith-meadow`, asymmetric, statement typography

Test z 5+ different briefs across industries (SaaS / restaurant / agency / clinic / portfolio).

**Acceptance**: 3 variants generowane <30s total (parallel execution), each renderable, user can pick + export. Commit: `feat(skills): multi-variant generator`.

### Phase 5 — File export protocol (~3h)

Implement deterministic file output do `${HOME}/.roduq/output/<client-id>/`:

```
~/.roduq/output/acme-corp/
├── .complete                    # written LAST — signals CLI consumer ready
├── meta.json                    # { generatedAt, skill, prompt, variant, version }
├── design-system.md
├── tokens.json                  # JSON Schema v1 validated
├── sections.json                # JSON Schema v1 validated
├── content.json                 # JSON Schema v1 validated
├── preview.html                 # static snapshot dla verification
└── assets/                      # optional uploaded brand files
```

**JSON Schemas** (Draft 7) host w `schemas/` katalog:
- `tokens.v1.schema.json`
- `sections.v1.schema.json`
- `content.v1.schema.json`

Reference: full schema specs w IMPLEMENTATION.md § Phase 5.

Use `ajv` library dla validation przed write. Atomic write (temp file + rename).

**Acceptance**: Skill execution writes wszystkie 7 files + `.complete` flag. ajv validation passes. Commit: `feat(output): file protocol + JSON Schema v1`.

### Phase 6 — MCP server bridge (~4h)

Implement MCP stdio server (`src/mcp-server.ts`) z 3 tools:
- `get_design_state(clientId)` → returns parsed artifacts
- `regenerate_section(clientId, sectionId, hint?)` → re-runs single section
- `pick_variant(clientId, variantNum)` → updates meta.json

Klient w `roduq-web-starter` repo dodaje do `.claude/settings.json`:
```jsonc
{
  "mcpServers": {
    "roduq-design": {
      "command": "node",
      "args": ["C:/Users/stefa/GIT/roduq-design-generator-studio/dist/mcp-server.js"],
      "env": { "ROduQ_OUTPUT_DIR": "C:/Users/stefa/.roduq/output" }
    }
  }
}
```

Test: w sample client repo (`C:/Users/stefa/clients/test-client/`) Claude Code reads design state przez MCP tool.

**Acceptance**: MCP server starts via stdio, 3 tools callable, returns valid JSON. Commit: `feat(mcp): stdio bridge dla Claude Code`.

### Phase 7 — Testing + production polish (~6h)

**Unit tests** (Vitest) per skill:
- Input fixtures (briefs) → expected output structure
- Schema validation passes
- Polish characters preserved

**Integration tests**:
- End-to-end skill execution → output validation → mock CLI consumption
- Multi-variant z 5 sample briefs

**Visual regression** (Playwright):
- Screenshot każdej variant per skill
- Diff vs baseline (CI artifact)

**Production polish**:
- Error boundaries z useful messages (np. "API key missing — set ANTHROPIC_API_KEY")
- Rate limiting per skill execution (LLM quota awareness)
- Output deduplication (same prompt + variant = cached)
- Telemetry opt-in (skills popularity, gen time)

**Performance target**: skill execution <30s (target <15s).

**Acceptance**: All tests pass. End-to-end demo: brief → multi-variant → export → CLI consume → working website w <5 min. Commit: `chore: tests + production polish (v1.0)`.

## Rules (cursor rules-style, non-negotiable)

1. **NIE ruszać `roduq-web-starter` repo** — kontrakt jest `.roduq/output/{client-id}/` file protocol. Wszystkie zmiany w `apps/marketing-starter/src/blocks/types.ts` są our source of truth dla `sections.json` schema — tylko czytaj, nie modify.

2. **TypeScript strict + exactOptionalPropertyTypes** — same standard as roduq-web-starter. Use conditional spread `...(value && { key: value })` pattern dla optional fields.

3. **Anthropic skills convention** — czytaj canonical SKILL.md format (frontmatter + instructions + examples). NIE custom format.

4. **License preservation** — Apache-2.0 dla wszystkiego forked z upstream. Roduq additions w `LICENSE-ROduQ.txt` proprietary.

5. **Polish-first** — wszystkie 7 skills + 7 presets MUSZĄ produce valid Polish output (test z "Łódź żółw pięć słów"). EN drafts always included w content.json.

6. **No vendor lock-in** — LLM provider abstraction (Anthropic primary, OpenAI/Gemini alternative). Klient may swap.

7. **JSON Schema validation** strict — every output file MUST pass ajv check przed write.

8. **Commit conventional** — `feat(<scope>):` / `fix(<scope>):` / `docs(<scope>):` etc. Commit per phase minimum (lepiej per skill / per preset).

9. **Tests first when realistic** — schema validation + Polish char handling powinno mieć tests od początku.

10. **Don't add features beyond what task requires** — copying z roduq-web-starter CLAUDE.md rule.

## Hard NO

- ❌ NIE integrować z marketing-starter monorepo (osobne repo per ADR-0003)
- ❌ NIE używać proprietary LLM-only features — wszystko musi działać z multiple providers
- ❌ NIE skipować schema validation (output corruption = CLI broken)
- ❌ NIE add custom skill format — Anthropic SKILL.md jest standard
- ❌ NIE używać heavy deps gdy zero-dep approach możliwy
- ❌ NIE używać React-specific patterns w generated HTML samples (Astro target = framework-agnostic)

## What "done" looks like

Pełna walidacja success (run wszystko po Phase 7):
- ✅ 7 phases shipped (każda z own commits)
- ✅ 7 skills working (test z 5+ briefów across industries)
- ✅ 7 DESIGN.md presets documented z renderable samples
- ✅ multi-variant working end-to-end (<30s execution)
- ✅ JSON Schema validation strict
- ✅ MCP server callable z Claude Code
- ✅ Visual regression baseline ustawiony
- ✅ Documentation kompletna: README + CONTRIBUTING + each skill own README

End-to-end demo: 
```
$ open-design dev
[ user fills brief: "SaaS landing dla księgowości freelancers, audience 30-40, professional but warm" ]
[ generates 3 variants w ~25s ]
[ user picks variant 2 (Modern) ]
[ exports do ~/.roduq/output/freelance-accounting/ ]
$ cd ~/clients && roduq new freelance-accounting --from-output ~/.roduq/output/freelance-accounting
[ CLI scaffolds w 30s ]
$ cd freelance-accounting && pnpm dev
→ http://localhost:4321 — działający website z AI-designed look
```

Total user time: <5 minutes brief → preview.

## Start sequence

1. Read 4 reference docs z `roduq-web-starter` (linki na górze)
2. Fork repo + Phase 1 setup
3. Commit Phase 1 → pause + status update do user
4. Awaiting user "kontynuuj" → Phase 2
5. ... etc per phase

Zaczynaj.
```

## End of prompt — copy above ↑

---

## Notes for the user (Rafał) — how to manage parallel session

1. **Launch w osobnym terminalu** — nie blokujesz głównego `roduq-web-starter` workflow
2. **Use Opus 4.7** — Sonnet handle skills OK ale Opus better dla design judgment + multi-variant orchestration
3. **Check progress co kilka godzin** — agent commits per phase, możesz `git log` w design-generator-studio repo
4. **Redirect mid-flight** — gdy widzisz że agent picks gorszą kierunek, post correction message
5. **Approve każdy phase** — agent pauses po phase, czeka na `kontynuuj`. Możesz dać feedback przed next phase.

## Resources for parallel agent (copy these links do startup)

- [nexu-io/open-design](https://github.com/nexu-io/open-design) — upstream
- [Anthropic Skills docs](https://docs.anthropic.com/en/docs/build-with-claude/skills) — convention reference
- [Refactoring UI](https://www.refactoringui.com/) — design quality bar
- [JSON Schema Draft 7](https://json-schema.org/draft-07/schema) — validation standard
- [MCP specification](https://spec.modelcontextprotocol.io/) — bridge protocol
- This repo's `.docs/` files (4 docs together: IMPLEMENTATION.md / DESIGN_SYSTEMS.md / BRIDGE.md / decisions/0001-separate-repo.md)

## Cost estimate

| Phase | Hours (Opus solo) | LLM tokens estimate |
|-------|-------------------|---------------------|
| 1 (fork) | 4 | ~50k |
| 2 (skills × 7) | 6 | ~300k |
| 3 (presets × 7) | 8 | ~200k |
| 4 (multi-variant) | 6 | ~150k |
| 5 (file export) | 3 | ~30k |
| 6 (MCP server) | 4 | ~80k |
| 7 (testing) | 6 | ~100k |
| **Total** | **37h** | **~910k tokens** |

Per Anthropic pricing (Claude Opus 4.7 = $15/M input + $75/M output, rough 70:30 split): **~$45-70 total LLM cost** dla pełnej implementacji.

Plus your time as reviewer/redirector: **~1-2h spread across 1-2 tygodnie**.

## What's next after Open Design ships

1. **First real client deployment** — wybór klienta + użyć Open Design generator + scaffold → measure real time savings
2. **Skill quality refinement** — based on first 5 clients feedback, refine SKILL.md instructions
3. **Custom skill creator UI** — v2.0 stretch (admin może build own skills bez kodu)
4. **Marketplace** — community skills sharing (v2.0+)

Trzymaj kciuki za parallel agent! 🚀
