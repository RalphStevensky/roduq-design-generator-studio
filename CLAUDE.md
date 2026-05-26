# CLAUDE.md — context dla Claude Code w roduq-design-generator-studio

> Ten plik czyta każdy agent Claude Code (lub innych AI) startujący pracę w tym repo. Single source of truth dla orientacji.

## Co to za repo

`roduq-design-generator-studio` = **AI-driven design generator** dla Roduq agency. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design) (Next.js 16 + SQLite + Anthropic skills) z Roduq customizations.

**Status**: Pre-implementation. Repo zainicjowane jako empty git repo. Czeka na agent execution per `docs/AGENT_PROMPT.md`.

## Misja

Stworzyć aplikację która:
- User wpisuje brief (industry / audience / tone)
- AI generuje 3 design variants równolegle (Conservative / Modern / Bold)
- User wybiera + exportuje do `~/.roduq/output/{client-id}/`
- `@roduq/cli` (w `roduq-web-starter`) consumuje + scaffolduje working website

**End-state**: brief → AI-designed website w <5 min.

## Przed startem przeczytaj (kolejność)

1. **[docs/AGENT_PROMPT.md](docs/AGENT_PROMPT.md)** ⭐ — MASTER PROMPT z execution plan. Self-contained.
2. **[docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md)** — szczegółowy plan 7 faz + Anthropic skills convention + JSON schemas + MCP spec + industry references
3. **[docs/DESIGN_SYSTEMS.md](docs/DESIGN_SYSTEMS.md)** — 7 brand-agnostic preset specs (default / monolith-meadow / tech-modern / warm-editorial / brutalist / soft-pastel / dark-cinematic) z full palettes + typography + voice
4. **[docs/BRIDGE.md](docs/BRIDGE.md)** — file protocol contract z `roduq-web-starter` (sister repo)
5. **[docs/decisions/0001-separate-repo.md](docs/decisions/0001-separate-repo.md)** — ADR dlaczego separate repo

## Najważniejsze zasady (non-negotiable)

1. **NIE łączymy kodem z `roduq-web-starter`** — kontrakt jest **file protocol** `.roduq/output/{client-id}/{tokens.json, sections.json, content.json}`. Te schemas są source of truth dla integration.

2. **Anthropic Skills convention** — `skills/<name>/SKILL.md` z YAML frontmatter (name + description + when_to_use + model_hint) + `assets/` (templates) + `references/` (additional context). NIE custom format.

3. **License preservation**:
   - **Apache-2.0** dla wszystkiego forked z upstream (zachowane bez zmian)
   - **Proprietary © Roduq** dla Roduq additions w `LICENSE-ROduQ.txt`

4. **Polish-first** — wszystkie 7 skills + 7 presets MUSZĄ produce valid Polish output (test z "Łódź żółw pięć słów"). EN drafts always included.

5. **No vendor lock-in** — LLM provider abstraction (Anthropic Claude Sonnet 4.6+ primary, OpenAI GPT-5 alternative, Google Gemini 2.5 Pro alternative). Klient may swap.

6. **JSON Schema validation strict** — every output file MUST pass ajv check przed write.

7. **TypeScript strict** + `exactOptionalPropertyTypes` — same standard as roduq-web-starter. Use conditional spread `...(value && { key: value })`.

8. **Commit conventional** — `feat(<scope>):` / `fix(<scope>):` / `docs(<scope>):`. Commit per phase minimum.

9. **Tests when realistic** — schema validation + Polish char handling tests od początku.

10. **Don't add features beyond what task requires** (per cursor rule from roduq-web-starter).

## Hard NO

- ❌ NIE łącz w monorepo z roduq-web-starter (per ADR-0001 separate repo)
- ❌ NIE używaj proprietary LLM-only features — multi-provider support wymagany
- ❌ NIE skipuj schema validation (output corruption = downstream CLI broken)
- ❌ NIE custom skill format — Anthropic standard mandatory
- ❌ NIE używaj React-specific patterns w generated HTML samples (target = framework-agnostic dla Astro consumption)
- ❌ NIE add heavy deps gdy zero-dep approach możliwy

## Phase execution

7 faz definiowanych w `docs/AGENT_PROMPT.md` § "Execution plan":

| Phase | Goal | Estimated time |
|---|---|---|
| 1 | Fork + project setup (rebrand, license, .env) | ~4h |
| 2 | 7 Roduq custom skills (saas-landing, agency, restaurant, clinic, real-estate, product-launch, portfolio) | ~6h |
| 3 | 7 DESIGN.md preset systems | ~8h |
| 4 | Multi-variant skill (KEY DIFFERENTIATOR — 3 parallel) | ~6h |
| 5 | File export protocol + JSON Schema v1 validation | ~3h |
| 6 | MCP server bridge (stdio + 3 tools) | ~4h |
| 7 | Testing + production polish | ~6h |

**Total**: ~37h Opus solo + ~$45-70 LLM tokens.

Agent commits per phase + pauses na approval. User redirect mid-flight gdy potrzeba.

## Reference projects

Industry references do study przed building (full list w docs/IMPLEMENTATION.md § 4):

- **[Refactoring UI](https://www.refactoringui.com/)** — typography + spacing + color theory
- **[Tailwind UI](https://tailwindui.com/)** — production component patterns
- **[shadcn/ui](https://ui.shadcn.com/)** — accessibility-first design system
- **[Linear](https://linear.app/)** — gold standard SaaS dark mode + animation
- **[Stripe](https://stripe.com/)** — color theory + iconography
- **[Vercel](https://vercel.com/)** — dark-cinematic preset reference
- **[Mantine](https://mantine.dev/)** — accessibility-first React components
- **[Layout primitives](https://every-layout.dev/)** — Heydon Pickering reusable layouts
- **[Mailchimp Style Guide](https://styleguide.mailchimp.com/)** — voice principles

## Quick start dla nowej sesji

1. **Open Claude Code** w tym folderze
2. **Copy this prompt verbatim** jako pierwsza wiadomość:

```
Pracujemy nad roduq-design-generator-studio (osobny repo równolegle z roduq-web-starter).

Read te 5 docs w kolejności:
1. CLAUDE.md (ten plik)
2. docs/AGENT_PROMPT.md — main execution prompt z 7-phase plan
3. docs/IMPLEMENTATION.md — szczegóły każdej fazy
4. docs/DESIGN_SYSTEMS.md — 7 brand-agnostic presets
5. docs/BRIDGE.md — file protocol z marketing-starter

Po przeczytaniu, start z Phase 1 (Fork + project setup) per docs/AGENT_PROMPT.md.

Reguły:
- Commit per phase z conventional message (feat(phase-1):, feat(skills):, etc.)
- Po każdej fazie PAUSE i czekaj na "kontynuuj" lub feedback
- TypeScript strict + Anthropic skills convention + JSON Schema validation strict
- Polish-first content (test z "Łódź żółw pięć słów")
- NIE łącz w monorepo z roduq-web-starter

Zaczynaj od Phase 1.
```

3. **Agent execute** + commits + pauses
4. **You approve** każdy phase po review

## Sister repo

[`roduq-web-starter`](../roduq-web-starter/) — main monorepo z Astro 6 + Payload CMS + 29 business modules. Ten generator EKSPORTUJE artifacts do `.roduq/output/`, marketing-starter CLI CONSUMES je. NIE łączymy kodem.

## After implementation ships

Po complete Phase 1-7:
1. **First client test** — wybierz klienta + use Open Design generator + scaffold w roduq-web-starter
2. **Skill refinement** — based on 5 client feedback, refine SKILL.md instructions
3. **Custom skill creator UI** (v2.0 stretch) — admin może build own skills bez kodu
4. **Marketplace** (v2.0+) — community skills sharing
