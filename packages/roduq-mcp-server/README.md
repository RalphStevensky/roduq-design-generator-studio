# @roduq/mcp-server

> Stdio MCP (Model Context Protocol) server exposing Roduq design output state to Claude Code in client repos. Roduq Addition under [LICENSE-ROduQ.txt](../../LICENSE-ROduQ.txt).

## What it does

Provides 3 MCP tools dla Claude Code w client repos (typically `roduq-web-starter` scaffolds):

| Tool | Description | Status (Phase 6) |
|------|-------------|------------------|
| `get_design_state(clientId)` | Returns current design artifacts (tokens / sections / content / meta + variants if multi-variant) | ✅ Implemented |
| `regenerate_section(clientId, sectionId, hint?)` | Re-runs single section with optional LLM hint | ⚠ Interface only — LLM wiring deferred do Phase 7 |
| `pick_variant(clientId, variantNum)` | Promote variant N to top-level + write .complete flag | ✅ Implemented |

All tools use Zod input validation + structured error responses.

## Architecture

```
Client repo (e.g., roduq-web-starter)
  └── .claude/settings.json
       └── mcpServers."roduq-design"
            └── command: node ../roduq-design-generator-studio/packages/roduq-mcp-server/dist/index.js
                 └── @roduq/mcp-server (stdio transport)
                      ├── createServer() — registers 3 tools
                      ├── OutputReader — reads ~/.roduq/output/{clientId}/
                      └── OutputWriter — promote variant flow
```

## Installation

In `roduq-design-generator-studio` (this repo):

```bash
pnpm --filter @roduq/mcp-server install
pnpm --filter @roduq/mcp-server build
```

Produces `packages/roduq-mcp-server/dist/index.js` — the binary referenced in client `.claude/settings.json`.

## Client integration

In `roduq-web-starter` (sister repo) or any Claude Code project consuming Roduq outputs:

### `.claude/settings.json`

```jsonc
{
  "mcpServers": {
    "roduq-design": {
      "command": "node",
      "args": [
        "C:/Users/stefa/GIT/roduq-design-generator-studio/packages/roduq-mcp-server/dist/index.js"
      ],
      "env": {
        "ROduQ_OUTPUT_DIR": "C:/Users/stefa/.roduq/output"
      }
    }
  }
}
```

### Verify

```
$ claude mcp list
roduq-design [stdio] connected
  Tools: get_design_state, regenerate_section, pick_variant
```

## Tool usage examples

### get_design_state

```jsonc
// Input
{ "clientId": "acme-corp" }

// Output (single-variant project)
{
  "clientId": "acme-corp",
  "status": "complete",
  "type": "single",
  "meta": {
    "skill": "roduq-saas-landing",
    "preset": "roduq-tech-modern",
    "generatedAt": "2026-05-26T20:30:00Z"
  },
  "tokens": { "tokens": { "color": { ... }, "font": { ... } } },
  "sections": { "homepage": { "blocks": [...] } },
  "content": { "siteSettings": { ... }, "draftCopy": { ... } },
  "designSystemMd": "# Acme Corp Design System\n..."
}

// Output (multi-variant before user picked)
{
  "clientId": "acme-corp",
  "status": "in-progress",
  "type": "multi-variant",
  "meta": { "selectedVariant": null, "variants": [...] },
  "variants": [
    { "id": 1, "label": "Conservative", "preset": "roduq-tech-modern", "status": "complete", "tokens": {...} },
    { "id": 2, "label": "Modern", "preset": "roduq-dark-cinematic", "status": "complete", "tokens": {...} },
    { "id": 3, "label": "Bold", "preset": "roduq-brutalist", "status": "complete", "tokens": {...} }
  ]
}
```

### pick_variant

```jsonc
// Input
{ "clientId": "acme-corp", "variantNum": 2 }

// Output
{
  "success": true,
  "clientId": "acme-corp",
  "selectedVariant": 2,
  "userPickedAt": "2026-05-26T20:34:12Z",
  "promotedFiles": ["tokens.json", "sections.json", "content.json", "design-system.md", "preview.html"],
  "message": "Variant 2 promoted to top-level. .complete flag written. @roduq/cli w roduq-web-starter może teraz consume artifacts."
}
```

### regenerate_section (Phase 6 interface only)

```jsonc
// Input
{
  "clientId": "acme-corp",
  "sectionId": "homepage:hero",
  "hint": "Make it more focused on enterprise z social proof"
}

// Output (Phase 6 — interface validated, returns NOT_IMPLEMENTED)
{
  "status": "NOT_IMPLEMENTED",
  "phase": 6,
  "nextPhase": 7,
  "message": "regenerate_section interface defined w Phase 6. LLM wiring deferred do Phase 7.",
  "parsedInput": { "clientId": "acme-corp", "sectionId": "homepage:hero", "hint": "Make it..." },
  "resolvedSection": {
    "page": "homepage",
    "locator": "hero",
    "index": 0,
    "block": { "blockType": "hero", "variant": "centered", ... }
  }
}
```

## Section locator format

For `regenerate_section`, `sectionId` follows:

- `"<page>:<blocks[N]>"` — explicit index (e.g., `"homepage:blocks[0]"`)
- `"<page>:<blockType>"` — first match by type (e.g., `"homepage:hero"`)
- `<page>` = `"homepage"` OR `/[a-z0-9-/]+` (e.g., `/cennik`, `/o-nas`)

## Error codes

| Code | Meaning |
|------|---------|
| `CLIENT_NOT_FOUND` | clientId directory doesn't exist w outputDir |
| `INVALID_INPUT` | Zod validation failed |
| `VARIANT_NOT_FOUND` | variantNum outside [1,2,3] lub section locator unresolved |
| `VARIANT_NOT_COMPLETE` | Variant status != "complete" — cannot promote |
| `VALIDATION_FAILED` | Output schema validation failed (Phase 7 ajv) |
| `FS_ERROR` | Filesystem read/write error |
| `UNSUPPORTED_OPERATION` | Operation not valid dla current state (e.g., regenerate on incomplete multi-variant) |
| `INTERNAL_ERROR` | Unexpected error |

## Configuration

| Env var | Default | Description |
|---------|---------|-------------|
| `ROduQ_OUTPUT_DIR` | `${HOME}/.roduq/output` | Root directory dla Roduq client outputs |
| `RODUQ_OUTPUT_DIR` | (alias) | Alternative casing — both supported |

Output directory layout per [`schemas/README.md`](../../schemas/README.md):

```
${ROduQ_OUTPUT_DIR}/
  {clientId}/
    .complete                # written LAST
    meta.json (or meta-multi-variant.json)
    tokens.json
    sections.json
    content.json
    design-system.md
    preview.html
    variants/                # multi-variant only
      1-conservative/{tokens.json, sections.json, content.json, design-system.md, preview.html}
      2-modern/...
      3-bold/...
```

## Development

```bash
# Build (TypeScript compile)
pnpm --filter @roduq/mcp-server build

# Watch mode
pnpm --filter @roduq/mcp-server dev

# Tests (Vitest)
pnpm --filter @roduq/mcp-server test

# Typecheck without emit
pnpm --filter @roduq/mcp-server typecheck

# Run locally (stdio — needs MCP-aware client)
node packages/roduq-mcp-server/dist/index.js
```

## Testing locally with mcp-inspector

```bash
npx @modelcontextprotocol/inspector node packages/roduq-mcp-server/dist/index.js
```

Opens browser UI dla manual tool invocation testing.

## Related

- [`schemas/`](../../schemas/) — JSON Schema v1 definitions (this server reads/writes against these contracts)
- [`skills/multi-variant/`](../../skills/multi-variant/) — orchestrator skill that produces multi-variant outputs this server reads
- [`.cursor/rules/008-mcp-server.mdc`](../../.cursor/rules/008-mcp-server.mdc) — operational rule
- [`.docs/IMPLEMENTATION.md § Phase 6`](../../.docs/IMPLEMENTATION.md) — phase context + lessons learned
- [`.docs/BRIDGE.md`](../../.docs/BRIDGE.md) — cross-repo architecture z roduq-web-starter
- [MCP specification](https://spec.modelcontextprotocol.io/)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

## License

Proprietary © 2026 Roduq. See [LICENSE-ROduQ.txt](../../LICENSE-ROduQ.txt) for terms.
