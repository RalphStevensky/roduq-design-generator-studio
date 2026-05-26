/**
 * Tool 2: regenerate_section(clientId, sectionId, hint?)
 *
 * Re-runs single section generation z optional LLM hint.
 *
 * IMPLEMENTATION STATUS: Interface complete (Zod schema + tool definition).
 * LLM invocation TODO — wired w Phase 7 alongside @open-design/web daemon integration.
 * Currently returns NOT_IMPLEMENTED error z structured guidance.
 *
 * Section ID format: "<page>:<blocks[index]>" or "<page>:<blockType>" (first match)
 *   e.g., "homepage:blocks[0]" = first hero block
 *   e.g., "homepage:hero" = first hero block (alternative spelling)
 *   e.g., "/cennik:pricing" = pricing block on /cennik page
 */

import { z } from "zod";
import type { OutputReader } from "../lib/output-reader.js";
import { MCPServerError } from "../lib/types.js";

export const RegenerateSectionInputSchema = z.object({
  clientId: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9][a-z0-9-]*$/, "clientId must be kebab-case slug"),
  sectionId: z
    .string()
    .min(1)
    .regex(
      /^(\/[a-z0-9-/]+|homepage):(blocks\[\d+\]|[a-z][a-z0-9-]*)$/,
      "sectionId must match '<page>:<blocks[N]>' or '<page>:<blockType>' (e.g., 'homepage:hero', '/cennik:pricing')",
    ),
  hint: z
    .string()
    .max(500)
    .optional()
    .describe("Optional LLM hint — e.g., 'Make it more focused on enterprise z social proof'"),
});

export type RegenerateSectionInput = z.infer<typeof RegenerateSectionInputSchema>;

export const REGENERATE_SECTION_TOOL = {
  name: "regenerate_section",
  description: `Re-generate a single section (block) within an existing client project z optional LLM hint.

Section ID format: "<page>:<blocks[index]>" or "<page>:<blockType>"
  Examples:
    "homepage:hero"           — first hero block on homepage
    "homepage:blocks[0]"      — explicit index reference (same as above)
    "homepage:blocks[2]"      — third block on homepage
    "/cennik:pricing"         — pricing block on /cennik page

Provides ability to iterate na specific section bez regenerating entire project. Preserves other sections + tokens + meta. Updates sections.json + content.json (for that section's keys only).

IMPLEMENTATION STATUS (Phase 6): Interface defined, LLM invocation deferred to Phase 7 wiring z @open-design/web daemon. Phase 6 returns structured "NOT_IMPLEMENTED" response showing what would be parsed.

Use this dla (Phase 7+):
- Iterating na hero copy after initial generation
- Trying alternative pricing variants (3-tier vs 2-tier)
- A/B testing CTA wording bez full regen cost
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
      sectionId: {
        type: "string",
        description: "Section locator — '<page>:<blocks[N]>' or '<page>:<blockType>' format",
        pattern: "^(\\/[a-z0-9-/]+|homepage):(blocks\\[\\d+\\]|[a-z][a-z0-9-]*)$",
      },
      hint: {
        type: "string",
        description: "Optional LLM hint to guide regeneration",
        maxLength: 500,
      },
    },
    required: ["clientId", "sectionId"],
    additionalProperties: false,
  },
} as const;

export interface RegenerateSectionDeps {
  readonly outputReader: OutputReader;
  // Phase 7: readonly llmRouter: LLMRouter;
  // Phase 7: readonly outputWriter: OutputWriter;
}

export async function handleRegenerateSection(
  rawInput: unknown,
  deps: RegenerateSectionDeps,
): Promise<unknown> {
  const parsed = RegenerateSectionInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    throw new MCPServerError(
      `Invalid input: ${parsed.error.message}`,
      "INVALID_INPUT",
      parsed.error,
    );
  }
  const { clientId, sectionId, hint } = parsed.data;

  // Phase 6: verify clientId + read existing state (validates section locator can find target)
  const state = await deps.outputReader.readDesignState(clientId);

  const [page, locator] = sectionId.split(":") as [string, string];
  let sectionsObj;
  if (state.type === "single") {
    sectionsObj = state.sections;
  } else if (state.tokens) {
    // multi-variant after user picked
    sectionsObj = state.sections;
  } else {
    throw new MCPServerError(
      `Cannot regenerate section dla multi-variant project before user picks a variant. Call pick_variant first lub regenerate via UI multi-variant flow.`,
      "UNSUPPORTED_OPERATION",
    );
  }

  if (!sectionsObj) {
    throw new MCPServerError(
      `No sections.json available dla client "${clientId}"`,
      "CLIENT_NOT_FOUND",
    );
  }

  const blocks = page === "homepage"
    ? sectionsObj.homepage.blocks
    : sectionsObj.pages?.[page]?.blocks;

  if (!blocks) {
    throw new MCPServerError(
      `Page "${page}" not found w sections.json — available pages: ${
        ["homepage", ...Object.keys(sectionsObj.pages ?? {})].join(", ")
      }`,
      "VARIANT_NOT_FOUND",
    );
  }

  // Resolve locator: "blocks[N]" or "<blockType>"
  let targetIndex: number;
  const blocksIndexMatch = locator.match(/^blocks\[(\d+)\]$/);
  if (blocksIndexMatch && blocksIndexMatch[1]) {
    targetIndex = parseInt(blocksIndexMatch[1], 10);
  } else {
    targetIndex = blocks.findIndex((b) => b.blockType === locator);
  }

  if (targetIndex < 0 || targetIndex >= blocks.length) {
    throw new MCPServerError(
      `Section locator "${locator}" not found w page "${page}" (${blocks.length} blocks available)`,
      "VARIANT_NOT_FOUND",
    );
  }

  const targetBlock = blocks[targetIndex];

  // Phase 6: return structured NOT_IMPLEMENTED z context
  // Phase 7: invoke LLM, regenerate block content keys, atomic write updated sections.json + content.json
  return {
    status: "NOT_IMPLEMENTED",
    phase: 6,
    nextPhase: 7,
    message:
      "regenerate_section interface defined w Phase 6. LLM wiring + atomic write deferred do Phase 7 (alongside @open-design/web daemon integration). Tool input validated + section locator resolved as preview.",
    parsedInput: {
      clientId,
      sectionId,
      ...(hint !== undefined && { hint }),
    },
    resolvedSection: {
      page,
      locator,
      index: targetIndex,
      block: targetBlock,
    },
    phase7Implementation: {
      steps: [
        "1. Load skill from meta.skill (industry skill, e.g., roduq-saas-landing)",
        "2. Render skill prompt z section-specific context (block + hint)",
        "3. Invoke ctx.llmRouter.pick(skill.modelHint).complete(messages)",
        "4. Parse LLM response → new block + content keys",
        "5. ajv validate updated sections.json + content.json",
        "6. Atomic write to tmp dir + rename + .complete flag preserved",
        "7. Return updated block + tokens consumption metrics",
      ],
    },
  };
}
