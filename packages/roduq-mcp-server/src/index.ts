#!/usr/bin/env node
/**
 * @roduq/mcp-server — CLI entry point.
 *
 * Spawns stdio MCP server exposing 3 tools (get_design_state, regenerate_section, pick_variant).
 *
 * Usage:
 *   roduq-mcp-server
 *   ROduQ_OUTPUT_DIR=/custom/path roduq-mcp-server
 *
 * Wired w Claude Code via roduq-web-starter/.claude/settings.json — see README.md.
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { defaultOutputDir } from "./lib/output-reader.js";

async function main(): Promise<void> {
  const outputDir = defaultOutputDir();

  // Log to stderr (NIE stdout — stdio transport reserves stdout dla MCP protocol)
  process.stderr.write(
    `[@roduq/mcp-server] Starting stdio MCP server. Output dir: ${outputDir}\n`,
  );

  const server = createServer({ outputDir });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.stderr.write(`[@roduq/mcp-server] Connected. Ready dla tool calls.\n`);
}

// Start the stdio server ONLY when run as the executable (bin), not when the
// package is imported for its exports (OutputReader, types, …). Without this guard,
// `import "@roduq/mcp-server"` would spawn an MCP server as a side effect.
function isEntrypoint(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntrypoint()) {
  main().catch((err) => {
    process.stderr.write(`[@roduq/mcp-server] Fatal error: ${err instanceof Error ? err.message : String(err)}\n`);
    process.exit(1);
  });
}

export { createServer } from "./server.js";
export { OutputReader, defaultOutputDir, validateClientId } from "./lib/output-reader.js";
export { OutputWriter } from "./lib/output-writer.js";
export * from "./lib/types.js";
