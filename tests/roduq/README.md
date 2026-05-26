# tests/roduq

Roduq Addition (per LICENSE-ROduQ.txt). Cross-cutting tests dla Roduq contributions to nexu-io/open-design fork.

Per-package tests live w `packages/<name>/tests/` (upstream convention). This directory holds tests that span multiple Roduq additions (skills + presets + schemas).

## Structure

```
tests/roduq/
├── fixtures/
│   ├── briefs/           # 8 sample briefs (7 industries + multi-variant) z _meta.expectedMatrix
│   └── expected/         # Polish character test corpora + sample output patterns
├── schemas/
│   └── validation.test.ts    # ajv validation of schemas/examples/* against schemas/*.json
├── skills/
│   └── structure.test.ts     # File-system smoke check dla all 7 skills + multi-variant
├── presets/
│   └── structure.test.ts     # Preset structure + tokens.css compliance + aesthetic differentiation
└── vitest.config.ts      # Vitest config
```

## Test categories

### Tier 1: Structure tests (zero-dep, runs immediately)

✅ **`tests/roduq/skills/structure.test.ts`** — verifies:
- All 7 industry skills + multi-variant have SKILL.md z proper frontmatter
- Required references/ files exist (inspiration.md / content-patterns.md / target-audience.md per industry skill)
- Multi-variant has variant-strategy.md / preset-mapping.md / parallel-execution.md
- frontmatter contains od.roduq.* namespace + polish_first: true
- Templates contain {{key}} placeholders dla content injection

✅ **`tests/roduq/presets/structure.test.ts`** — verifies:
- All 7 Roduq presets have DESIGN.md / tokens.css / tokens.example.json / inspiration.md / samples/full-page.html
- tokens.css defines upstream contract (--bg / --surface / --fg / --muted / --border / --accent / --font-display / --font-body)
- tokens.css defines Roduq extensions (--color-brand-primary / --space-md / --radius-md)
- full-page.html valid HTML5 z lang attr + viewport + CSS var usage + prefers-reduced-motion
- Polish character preservation (lang="pl" lub diacritics in content)
- Aesthetic differentiation (brutalist radius 0, soft-pastel 1rem, dark-cinematic #0A0A0A, warm-editorial serif body)

### Tier 2: Schema validation tests (requires ajv + ajv-formats)

⚠ **`tests/roduq/schemas/validation.test.ts`** — verifies:
- All 5 example fixtures validate against their schemas (positive cases)
- Schemas reject invalid input: missing required field, invalid blockType enum, missing pl in bilingualString, invalid skill prefix, fewer than 3 variants in multi-variant
- Polish character preservation w bilingualString.pl

**Status**: scaffold complete. Requires `pnpm install` to bring in ajv + ajv-formats. Currently blocked by Windows native better-sqlite3 compile issue (Phase 1 lesson).

### Tier 3: MCP server integration tests

Live w `packages/roduq-mcp-server/tests/` (per upstream convention — package tests sibling to src/):
- ✅ `output-reader.test.ts` — 4 test cases (validation + read flows)
- ✅ `output-writer.test.ts` — 4 test cases (promote success + 3 rejection scenarios)
- ⏳ Phase 7 expansion: `server-integration.test.ts` — end-to-end MCP client → tool call → response (using @modelcontextprotocol/sdk in-memory transport)

### Tier 4: Visual regression (Playwright)

⏳ **Deferred do post-deploy**. Requires browser engines installed.

Plan dla `tests/roduq/playwright/`:
- `full-page-baseline.spec.ts` — screenshot each preset's `samples/full-page.html` at 1280×800 + 375×667 (mobile)
- Compare vs baseline via pixelmatch (already w upstream `e2e/` deps)
- Surface diffs w PR comments

## Running tests

```bash
# Once dependencies installed:
pnpm --filter tests/roduq install
pnpm --filter tests/roduq test          # Vitest all
pnpm --filter tests/roduq test schemas  # only schema validation
pnpm --filter tests/roduq test skills   # only structure
pnpm --filter tests/roduq test presets  # only preset structure
```

Note: `tests/roduq/` not yet a workspace package (no package.json). Phase 7 final wiring would convert do workspace package (mirror packages/roduq-mcp-server/ pattern).

## Test fixtures

8 sample briefs w `fixtures/briefs/`:

| File | Skill | Industry |
|------|-------|----------|
| `saas-landing.json` | roduq-saas-landing | Polish freelance accounting SaaS |
| `agency.json` | roduq-agency | Krakow heritage branding studio |
| `restaurant.json` | roduq-restaurant | Warsaw Wilanów modernist bistro |
| `clinic.json` | roduq-clinic | Warsaw psychotherapist (CBT) |
| `real-estate.json` | roduq-real-estate | Warsaw premium boutique agency |
| `product-launch.json` | roduq-product-launch | Polish smart home hub pre-launch |
| `portfolio.json` | roduq-portfolio | Warsaw UX/UI freelancer |
| `multi-variant.json` | multi-variant | SaaS multi-variant z saas-landing brief |

Each brief has `_meta.expectedMatrix` documenting which preset multi-variant skill should pick per variant (per `skills/multi-variant/references/preset-mapping.md` 7×3 matrix).

## Polish character test corpus

`fixtures/expected/polish-characters.txt`:
- Full diacritic enumeration (ą ć ę ł ń ó ś ź ż + uppercase)
- Test phrase: "Łódź żółw pięć słów"
- Long passages w cities + compound diacritics

Used dla:
- Verify font rendering w preset samples
- Validate skill outputs preserve diacritics through LLM
- Schema validation accepts full UTF-8 w bilingualString.pl

## Phase 7 status

- ✅ Test fixtures shipped (8 briefs + Polish corpus)
- ✅ Tier 1 structure tests shipped (Vitest, zero-dep)
- ✅ Tier 2 schema validation tests scaffolded (requires pnpm install)
- ✅ Tier 3 MCP server tests w packages/roduq-mcp-server/tests/ (Phase 6 + this phase)
- ⏳ Tier 4 Playwright visual regression deferred do post-deploy
- ⏳ Workspace package conversion deferred do future iteration
