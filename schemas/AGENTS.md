# schemas

Roduq Additions directory (per LICENSE-ROduQ.txt). JSON Schema v1 definitions dla design output protocol consumed across roduq-design-generator-studio (producer) + roduq-web-starter (consumer via @roduq/cli).

Not part of upstream nexu-io/open-design.

## Files

- `tokens.v1.schema.json` — design tokens
- `sections.v1.schema.json` — block configurations
- `content.v1.schema.json` — bilingual PL+EN copy
- `meta.v1.schema.json` — single-variant metadata
- `meta-multi-variant.v1.schema.json` — 3-variant orchestrator state
- `examples/*.example.json` — valid output samples
- `README.md` — usage + ajv validation pattern + atomic write protocol

## Agent guidance

### When generating output JSON files

ALWAYS:
1. Set `$schema` field to canonical URL: `https://roduq.dev/schemas/v1/<schema-name>.schema.json`
2. Set `version` to current schema major.minor.patch (currently `1.0.0`)
3. Use Polish content with full diacritics preservation
4. Validate against schema BEFORE writing to disk (ajv compile + runtime check)

NEVER:
- Skip `$schema` field — downstream CLI relies on it dla migration detection
- Invent new `blockType` values — must be in sections.schema.json enum
- Use `null` where schema requires string/number — type-check explicit
- Hardcode paths to schemas — use canonical roduq.dev URL

### When extending schemas

Adding optional field (forward-compatible):
1. Add to `properties` in schema file
2. Update example fixture w `examples/`
3. Update README.md if behavior change relevant
4. Update rule 004 if operational pattern changes
5. NO schema version bump (additive change OK w 1.x)

Adding required field OR removing field (breaking change):
1. Bump major version → `schemas/v2/`
2. Add migration helper w `@roduq/cli`
3. Coordinate PR with roduq-web-starter
4. Deprecate v1 z 6-12 month window

### When consuming output (gdy reading from `~/.roduq/output/`)

Detect schema version via `$schema` field:
```typescript
const data = JSON.parse(await fs.readFile("tokens.json", "utf-8"));
const schemaVersion = parseSchemaUrl(data.$schema);   // e.g., "1"
const handler = VERSION_HANDLERS[schemaVersion] ?? throwUnknownVersion();
const internal = handler.parse(data);
```

This pattern lets `@roduq/cli` handle multiple schema versions during migration windows.

## Linkage

- `apps/daemon` will integrate schemas w Phase 7 (validators compiled, atomic writer wired)
- `apps/web` reads schemas dla form validation (gdy admin manually edits tokens)
- Sister repo `roduq-web-starter`/`packages/cli/schemas/` mirrors local copy
- Production CDN: `https://roduq.dev/schemas/v1/` (deploy TBD post-Phase-7)

## Powiązane (Roduq operational rules)

- `.cursor/rules/004-file-protocol.mdc`
- `.cursor/rules/005-coding-standards.mdc` (TS strict + ajv usage)
- `.cursor/rules/006-git-workflow.mdc` (commit conventions dla schema changes)
