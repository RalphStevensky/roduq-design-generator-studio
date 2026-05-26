/**
 * MCP Server factory — creates Server instance z 3 tools registered.
 *
 * Composable: `index.ts` (CLI entry) wires this to stdio transport.
 * Tests import this directly + connect to in-memory transport.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { OutputReader, defaultOutputDir, type OutputReaderConfig } from "./lib/output-reader.js";
import { OutputWriter, type OutputWriterConfig } from "./lib/output-writer.js";
import { MCPServerError } from "./lib/types.js";
import {
  GET_DESIGN_STATE_TOOL,
  handleGetDesignState,
} from "./tools/get-design-state.js";
import {
  REGENERATE_SECTION_TOOL,
  handleRegenerateSection,
} from "./tools/regenerate-section.js";
import {
  PICK_VARIANT_TOOL,
  handlePickVariant,
} from "./tools/pick-variant.js";

export interface ServerConfig {
  readonly outputDir?: string;
  readonly name?: string;
  readonly version?: string;
}

export function createServer(config: ServerConfig = {}): Server {
  const outputDir = config.outputDir ?? defaultOutputDir();

  const readerConfig: OutputReaderConfig = { outputDir };
  const writerConfig: OutputWriterConfig = { outputDir };
  const outputReader = new OutputReader(readerConfig);
  const outputWriter = new OutputWriter(writerConfig);

  const server = new Server(
    {
      name: config.name ?? "@roduq/mcp-server",
      version: config.version ?? "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      GET_DESIGN_STATE_TOOL,
      REGENERATE_SECTION_TOOL,
      PICK_VARIANT_TOOL,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments ?? {};

    try {
      let result: unknown;
      switch (toolName) {
        case "get_design_state":
          result = await handleGetDesignState(args, { outputReader });
          break;
        case "regenerate_section":
          result = await handleRegenerateSection(args, { outputReader });
          break;
        case "pick_variant":
          result = await handlePickVariant(args, { outputWriter });
          break;
        default:
          return {
            content: [{ type: "text", text: `Unknown tool: ${toolName}` }],
            isError: true,
          };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      if (err instanceof MCPServerError) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: {
                    code: err.code,
                    message: err.message,
                  },
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
      // Unknown error — log + return generic
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: {
                  code: "INTERNAL_ERROR",
                  message,
                },
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}
