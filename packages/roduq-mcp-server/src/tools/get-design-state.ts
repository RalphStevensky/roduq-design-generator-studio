/**
 * Tool 1: get_design_state(clientId)
 *
 * Returns current design artifacts dla client. Single-variant projects return
 * full state. Multi-variant projects return all 3 variants + selection state.
 *
 * Read-only operation.
 */

import { z } from "zod";
import type { OutputReader } from "../lib/output-reader.js";
import { MCPServerError } from "../lib/types.js";

export const GetDesignStateInputSchema = z.object({
  clientId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "clientId must be kebab-case slug"),
});

export type GetDesignStateInput = z.infer<typeof GetDesignStateInputSchema>;

export const GET_DESIGN_STATE_TOOL = {
  name: "get_design_state",
  description: `Read current design artifacts dla a Roduq client project.

Returns parsed JSON state including:
- meta (generation metadata + multi-variant info if applicable)
- tokens (design tokens — colors, fonts, spacing, radii)
- sections (Payload-ready page block configurations)
- content (bilingual PL+EN draft copy)
- designSystemMd (human-readable design system summary)

For multi-variant projects, also returns:
- variants (3 entries z Conservative / Modern / Bold)
- selectedVariant (null until user picks via pick_variant)

Use this dla:
- Synchronizing Claude Code session w client's design state
- Reading current tokens before generating new components
- Diffing variants when user is deciding
- Auditing meta (when generated, by which skill, cost)
`,
  inputSchema: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "Client identifier — kebab-case slug matching ^[a-z0-9][a-z0-9-]*$ (e.g., 'acme-corp')",
        pattern: "^[a-z0-9][a-z0-9-]*$",
        minLength: 1,
        maxLength: 64,
      },
    },
    required: ["clientId"],
    additionalProperties: false,
  },
} as const;

export interface GetDesignStateDeps {
  readonly outputReader: OutputReader;
}

export async function handleGetDesignState(
  rawInput: unknown,
  deps: GetDesignStateDeps,
): Promise<unknown> {
  const parsed = GetDesignStateInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new MCPServerError(
      `Invalid input: ${parsed.error.message}`,
      "INVALID_INPUT",
      parsed.error,
    );
  }
  const { clientId } = parsed.data;

  const state = await deps.outputReader.readDesignState(clientId);

  return {
    clientId: state.clientId,
    status: state.status,
    type: state.type,
    meta: state.meta,
    ...(state.type === "single"
      ? {
          tokens: state.tokens,
          sections: state.sections,
          content: state.content,
          designSystemMd: state.designSystemMd,
        }
      : {
          // multi-variant
          variants: state.variants,
          ...(state.tokens && {
            tokens: state.tokens,
            sections: state.sections,
            content: state.content,
            designSystemMd: state.designSystemMd,
          }),
        }),
  };
}
