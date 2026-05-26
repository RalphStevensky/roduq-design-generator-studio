# Cursor Rules — Source of Truth (roduq-design-generator-studio)

> Wszystkie reguły kodowania, architektoniczne i procesowe projektu żyją tutaj. Cursor IDE czyta `.mdc` natywnie (per glob match + alwaysApply). Claude Code czyta przez `CLAUDE.md` w root → delegator.

## Reguła #0 (META): synchronizacja dwóch lokalizacji

**KRYTYCZNE dla agentów (Claude Code + Cursor + inne)**: ten projekt ma **dwa źródła** wiedzy:

1. **`.docs/`** — narrative documentation (markdown, długie wyjaśnienia, plany, ADRs, design specs)
2. **`.cursor/rules/`** — operational rules (`.mdc` z YAML frontmatter, per-glob loading dla Cursor IDE)

**Każda nowa decyzja / wzorzec / standard MUSI być dodany w OBYDWU**:
- Pełen opis i kontekst w `.docs/` (długie wyjaśnienie + dlaczego + przykłady)
- Concise actionable rule w `.cursor/rules/NNN-<slug>.mdc` (bullet points + anti-patterns + linki do `.docs/` po deeper context)

Powód: Cursor user widzi rules natywnie per glob match (auto-loaded). Claude Code user widzi przez CLAUDE.md delegator → potrzebuje rule files żeby konwencje były enforced w obu IDE.

## Format `.mdc`

```mdc
---
description: "Krótki opis reguły (1 zdanie) — pokazywany w Cursor UI"
globs: "skills/**/*,**/SKILL.md"
alwaysApply: false
---

# Rule body...

## Anti-patterns
❌ Wzorzec do unikania (z uzasadnieniem)

## Patterns
✅ Wzorzec do stosowania (z przykładem kodu)

## Powiązane
- `.docs/IMPLEMENTATION.md` § Phase 2 — pełen kontekst
- ADR-0001 (`.docs/decisions/0001-separate-repo.md`)
```

Pola frontmatter:
- `description` — pokazywane w Cursor UI gdy reguła aktywna
- `globs` — comma-separated glob patterns (puste = wszystkie pliki)
- `alwaysApply` — `true` = załadowana zawsze, `false` = tylko gdy glob match

## Aktualne reguły

| # | Plik | Scope | Kiedy ładowana |
|---|------|-------|---------------|
| 001 | [`project-overview.mdc`](001-project-overview.mdc) | Cały projekt — co to za repo + cele | zawsze |
| 002 | [`skills-convention.mdc`](002-skills-convention.mdc) | Anthropic SKILL.md format | per glob: `skills/**` |
| 003 | [`design-systems.mdc`](003-design-systems.mdc) | DESIGN.md preset structure | per glob: `design-systems/**` |
| 004 | [`file-protocol.mdc`](004-file-protocol.mdc) | JSON Schema v1 dla output | per glob: `schemas/**,src/output/**` |
| 005 | [`coding-standards.mdc`](005-coding-standards.mdc) | TypeScript strict, naming | zawsze |
| 006 | [`git-workflow.mdc`](006-git-workflow.mdc) | Conventional commits + per-phase | zawsze |
| 007 | [`llm-providers.mdc`](007-llm-providers.mdc) | Provider abstraction (Anthropic/OpenAI/Gemini) | per glob: `src/llm/**` |
| 008 | [`mcp-server.mdc`](008-mcp-server.mdc) | MCP stdio bridge convention | per glob: `src/mcp-server.ts,src/mcp/**` |
| 009 | [`docs-sync.mdc`](009-docs-sync.mdc) | **META** — utrzymuj `.docs/` + `.cursor/rules/` razem | zawsze |

## Dodawanie nowej reguły

1. Stwórz `NNN-slug.mdc` (numeracja chronologiczna od ostatniej)
2. YAML frontmatter (description / globs / alwaysApply)
3. Markdown body — bullet points + anti-patterns + ✅/❌ + linki do `.docs/`
4. Dodaj wpis w tej tabeli
5. Update referencje w `CLAUDE.md` root
6. **Update `.docs/`** jeśli rule wymaga deeper context (długi opis) — link tam stąd
7. Commit: `docs(rules): add NNN-<slug>`

## Konwencje pisania reguł

- **Bullet points > prose** — szybsze do skanowania (Cursor user widzi w tooltip)
- **Anti-patterns z ❌** + dobre wzorce z ✅ konkretne
- **Konkretne przykłady kodu** zamiast abstrakcyjnych opisów
- **Linkuj inne reguły** gdy się odnoszą (np. "patrz `002-skills-convention.mdc`")
- **Linkuj `.docs/`** dla głębszych explanationów (`.docs/IMPLEMENTATION.md § Phase 4`)
- **Polish OK** dla wewnętrznych reguł; English dla public-facing dokumentacji
- **Decyzyjne drzewa** dla nietrywialnych wyborów (`if X → A, else if Y → B`)
- **Max 100 wierszy per rule** — gdy więcej, przenieś deep context do `.docs/`

## Pre-implementation note

Większość rules teraz są **principles** (no code yet). Gdy agent zacznie Phase 1 (fork + setup), rules apply per glob match automatycznie.

Każda Phase MOŻE wymagać dodania nowych rules. Agent powinien:
- Po Phase 2 (skills) — review/extend `002-skills-convention.mdc` z lessons learned
- Po Phase 3 (presets) — review/extend `003-design-systems.mdc`
- Po Phase 5 (file export) — review/extend `004-file-protocol.mdc`
- Po Phase 6 (MCP) — review/extend `008-mcp-server.mdc`

## Update vs deprecate

Gdy reguła staje się nieaktualna:
- **Update** w miejscu, commit `docs(rules): update NNN`
- **NIE usuwaj numeru** — zostaje dla referencji historycznej w PR/commits
- Jeśli reguła całkowicie nieaktualna: zostaw plik z `description: "DEPRECATED — see NNN"` i pustym body z linkiem do następcy

## Dlaczego dwa źródła (.docs/ + .cursor/rules/)

| Format | Strength | Weakness |
|---|---|---|
| `.docs/` markdown | Long-form explanations, ADRs, design specs, plans | NIE auto-loaded w IDE — agent musi wiedzieć żeby read |
| `.cursor/rules/*.mdc` | Auto-loaded w Cursor per glob, frontmatter pokazany w UI | Krótkie — nie wystarczy dla complex architecture |

**Rozwiązanie**: rule files = "what to do" (operational), `.docs/` = "why + how" (deep context). Linki cross-reference.
