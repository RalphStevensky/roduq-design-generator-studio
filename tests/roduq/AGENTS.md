# tests/roduq

Roduq Addition (per LICENSE-ROduQ.txt). Cross-cutting tests dla Roduq contributions.

## When adding new tests

1. Place w appropriate subdirectory: `schemas/` / `skills/` / `presets/` / future `e2e/`
2. Use Vitest convention (`*.test.ts`)
3. Import schemas via JSON import attribute: `import x from "../../../schemas/y.json" with { type: "json" }`
4. Polish character coverage: include diacritic test cases gdy testing content/text handling
5. Use fixtures z `fixtures/briefs/` dla skill-related tests
6. NIE add tests that require running daemon (those belong w upstream `e2e/`)

## Adding new fixture briefs

1. Place w `fixtures/briefs/<industry>.json`
2. Include `_meta.skill` + `_meta.expectedMatrix` (if multi-variant relevant)
3. Polish-first content w `brief` field
4. Realistic constraints (price ranges, audience demographics, real Polish examples)
5. Update tests/roduq/README.md fixture table

## Phase 7 final scaffold

This directory shipped w Phase 7 — final implementation phase. Tests are scaffolds:
- Tier 1 (skills/presets structure) — runs immediately, zero deps
- Tier 2 (schemas validation) — runs gdy pnpm install succeeds (currently blocked Windows better-sqlite3)
- Tier 3 (MCP integration) — separate w packages/roduq-mcp-server/tests/
- Tier 4 (Playwright visual regression) — deferred do post-deploy

## Powiązane

- `.cursor/rules/005-coding-standards.mdc` — Vitest + co-located tests + Polish char handling
- `.docs/IMPLEMENTATION.md § Phase 7` — phase context + lessons
- `packages/roduq-mcp-server/tests/` — package-specific MCP tests
