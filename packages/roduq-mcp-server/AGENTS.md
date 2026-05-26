# packages/roduq-mcp-server

Roduq Addition (per [LICENSE-ROduQ.txt](../../LICENSE-ROduQ.txt)). Standalone workspace package — NOT part of upstream nexu-io/open-design.

## Purpose

Stdio MCP server exposing Roduq design output state via 3 tools:
- `get_design_state(clientId)` — Read parsed artifacts
- `regenerate_section(clientId, sectionId, hint?)` — Re-generate single block (Phase 7 LLM wiring)
- `pick_variant(clientId, variantNum)` — Promote variant + write .complete

## Agent guidance

### Editing tool handlers
- ALWAYS validate input z Zod schema (`src/tools/*.ts` exports `*InputSchema`)
- ALWAYS throw `MCPServerError` z structured `code` (NIE generic Error)
- ALWAYS return JSON-serializable objects (no Date instances, Buffers, etc.)

### Adding new tools
1. Create `src/tools/new-tool.ts` w pattern:
   - Define Zod input schema as `NewToolInputSchema`
   - Export tool definition (`NEW_TOOL = { name, description, inputSchema }`)
   - Export handler `handleNewTool(rawInput, deps)`
2. Register w `src/server.ts`:
   - Add to `ListToolsRequestSchema` handler tools array
   - Add `case` w `CallToolRequestSchema` switch
3. Add tests w `tests/new-tool.test.ts`
4. Update README.md tool list

### Modifying file-system access
- Read operations: extend `OutputReader` class w `src/lib/output-reader.ts`
- Write operations: extend `OutputWriter` class w `src/lib/output-writer.ts`
- Per `.cursor/rules/004-file-protocol.mdc`, atomic write pattern (validate → tmp dir → rename → .complete LAST)

### Logging
- Use `process.stderr.write(...)` NIE `console.log` — stdio transport reserves stdout dla MCP protocol
- Format: `[@roduq/mcp-server] <event>\n`

### Error handling
- Throw `MCPServerError` w handlers — server.ts catches + converts to structured response
- Catch user-facing errors at handler boundary
- Unknown errors → `INTERNAL_ERROR` code (rare — indicates bug)

## Phase 7 integration plan

- LLM wiring dla `regenerate_section` (use @open-design/web's LLMRouter pattern per rule 007)
- Schema validation dla input data using ajv (load schemas/ at startup)
- Telemetry hooks (token usage tracking per call)
- Daemon integration: expose via apps/daemon as `od mcp` subcommand option

## Files

- `src/index.ts` — CLI entry, stdio transport setup
- `src/server.ts` — Server factory, tool registration, error handling
- `src/lib/types.ts` — Shared types mirroring JSON Schema v1
- `src/lib/output-reader.ts` — File system read operations
- `src/lib/output-writer.ts` — Promote variant flow
- `src/lib/errors.ts` — (Phase 7 will extract z types.ts)
- `src/tools/get-design-state.ts` — Tool 1
- `src/tools/regenerate-section.ts` — Tool 2 (interface only Phase 6)
- `src/tools/pick-variant.ts` — Tool 3
- `tests/output-reader.test.ts` — Unit tests
- `tests/output-writer.test.ts` — Unit tests

## Powiązane (Roduq operational rules)

- `.cursor/rules/008-mcp-server.mdc` — MCP server convention
- `.cursor/rules/004-file-protocol.mdc` — JSON Schema v1 + atomic write
- `.cursor/rules/005-coding-standards.mdc` — TS strict + Zod validation
- `.cursor/rules/007-llm-providers.mdc` — Phase 7 LLM integration
