/**
 * Tool 3: pick_variant(clientId, variantNum)
 *
 * Promote variant N to top-level + write .complete flag.
 *
 * Pre-conditions verified by OutputWriter.promoteVariant:
 * - clientId exists
 * - meta-multi-variant.json present
 * - variants[N-1].status === "complete"
 *
 * Mutating operation. Triggers @roduq/cli consumer (via .complete flag) w sister repo.
 */

import { z } from "zod";
import type { OutputWriter } from "../lib/output-writer.js";
import { MCPServerError } from "../lib/types.js";

export const PickVariantInputSchema = z.object({
  clientId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "clientId must be kebab-case slug"),
  variantNum: z
    .number()
    .int()
    .min(1)
    .max(3),
});

export type PickVariantInput = z.infer<typeof PickVariantInputSchema>;

export const PICK_VARIANT_TOOL = {
  name: "pick_variant",
  description: `Select a variant (1=Conservative, 2=Modern, 3=Bold) z multi-variant project + promote files do top-level.

After this call:
- Variant N's tokens.json / sections.json / content.json / design-system.md / preview.html copied to ~/.roduq/output/{clientId}/
- meta-multi-variant.json updated z selectedVariant + userPick + userPickedAt
- .complete flag written LAST (signals @roduq/cli consumer)
- Unselected variants remain w variants/ subdirectory dla future reference

Use this dla:
- Confirming user's variant choice (typically after side-by-side preview review)
- Triggering downstream @roduq/cli to clone marketing-starter template

Errors:
- CLIENT_NOT_FOUND gdy clientId nieistnieje
- VARIANT_NOT_FOUND gdy variantNum poza [1,2,3]
- VARIANT_NOT_COMPLETE gdy variant status !== "complete"
`,
  inputSchema: {
    type: "object",
    properties: {
      clientId: {
        type: "string",
        description: "Client identifier — kebab-case slug",
        pattern: "^[a-z0-9][a-z0-9-]*$",
        minLength: 1,
        maxLength: 64,
      },
      variantNum: {
        type: "integer",
        description: "Variant number to promote: 1 (Conservative), 2 (Modern), 3 (Bold)",
        enum: [1, 2, 3],
      },
    },
    required: ["clientId", "variantNum"],
    additionalProperties: false,
  },
} as const;

export interface PickVariantDeps {
  readonly outputWriter: OutputWriter;
}

export async function handlePickVariant(
  rawInput: unknown,
  deps: PickVariantDeps,
): Promise<unknown> {
  const parsed = PickVariantInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new MCPServerError(
      `Invalid input: ${parsed.error.message}`,
      "INVALID_INPUT",
      parsed.error,
    );
  }
  const { clientId, variantNum } = parsed.data;

  const result = await deps.outputWriter.promoteVariant(clientId, variantNum as 1 | 2 | 3);

  return {
    success: true,
    clientId,
    selectedVariant: result.selectedVariant,
    userPickedAt: result.userPickedAt,
    promotedFiles: result.promotedFiles,
    message: `Variant ${variantNum} promoted to top-level. .complete flag written. @roduq/cli w roduq-web-starter może teraz consume artifacts.`,
  };
}
