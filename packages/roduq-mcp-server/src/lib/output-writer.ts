/**
 * Mutating operations on ~/.roduq/output/{clientId}/.
 * Currently scoped do pick_variant promote flow.
 *
 * Mirrors atomic write protocol z schemas/README.md.
 */

import { promises as fs } from "node:fs";
import { join } from "node:path";
import {
  type ClientId,
  type MultiVariantMeta,
  type VariantId,
  type VariantLabel,
  MCPServerError,
} from "./types.js";

export interface OutputWriterConfig {
  readonly outputDir: string;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export class OutputWriter {
  constructor(private readonly config: OutputWriterConfig) {}

  clientDir(clientId: ClientId): string {
    return join(this.config.outputDir, clientId);
  }

  /**
   * Promote variant N to top-level + write .complete flag.
   *
   * Pre-conditions:
   * - clientId exists w outputDir
   * - meta-multi-variant.json exists
   * - Variant N status === "complete"
   *
   * Steps (per schemas/README.md atomic write protocol):
   * 1. Read meta-multi-variant.json
   * 2. Verify variantId is in [1, 2, 3]
   * 3. Verify variants[variantId-1].status === "complete"
   * 4. Copy 5 files (tokens / sections / content / design-system / preview) variants/N-label/ → root
   * 5. Update meta-multi-variant.json: selectedVariant + userPick + userPickedAt
   * 6. Write .complete flag LAST
   */
  async promoteVariant(clientId: ClientId, variantId: VariantId): Promise<{
    promotedFiles: string[];
    selectedVariant: VariantId;
    userPickedAt: string;
  }> {
    const clientDir = this.clientDir(clientId);

    // Step 1: Read meta
    const metaPath = join(clientDir, "meta-multi-variant.json");
    if (!(await fileExists(metaPath))) {
      throw new MCPServerError(
        `meta-multi-variant.json not found w ${clientDir} — pick_variant only available for multi-variant projects`,
        "CLIENT_NOT_FOUND",
      );
    }
    const meta = JSON.parse(await fs.readFile(metaPath, "utf-8")) as MultiVariantMeta;

    // Step 2: Verify variantId
    if (variantId !== 1 && variantId !== 2 && variantId !== 3) {
      throw new MCPServerError(
        `variantId must be 1, 2, or 3 (got ${variantId})`,
        "INVALID_INPUT",
      );
    }

    // Step 3: Verify variant status
    const variantEntry = meta.variants.find((v) => v.id === variantId);
    if (!variantEntry) {
      throw new MCPServerError(
        `Variant ${variantId} not found w meta.variants`,
        "VARIANT_NOT_FOUND",
      );
    }
    if (variantEntry.status !== "complete") {
      throw new MCPServerError(
        `Variant ${variantId} status is "${variantEntry.status}" — cannot promote incomplete variant`,
        "VARIANT_NOT_COMPLETE",
      );
    }

    // Step 4: Copy 5 files variants/N-label/ → root
    const variantDir = join(
      clientDir,
      "variants",
      `${variantId}-${variantEntry.label.toLowerCase() satisfies Lowercase<VariantLabel>}`,
    );
    const filesToPromote = [
      "tokens.json",
      "sections.json",
      "content.json",
      "design-system.md",
      "preview.html",
    ] as const;

    const promotedFiles: string[] = [];
    for (const filename of filesToPromote) {
      const src = join(variantDir, filename);
      const dest = join(clientDir, filename);
      if (await fileExists(src)) {
        await fs.copyFile(src, dest);
        promotedFiles.push(filename);
      }
    }

    // Step 5: Update meta-multi-variant.json
    const userPickedAt = new Date().toISOString();
    meta.selectedVariant = variantId;
    meta.userPick = variantId;
    meta.userPickedAt = userPickedAt;
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

    // Step 6: Write .complete flag LAST
    await fs.writeFile(join(clientDir, ".complete"), "");

    return {
      promotedFiles,
      selectedVariant: variantId,
      userPickedAt,
    };
  }
}
