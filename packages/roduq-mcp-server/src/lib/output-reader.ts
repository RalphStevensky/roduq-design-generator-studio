/**
 * Read parsed artifacts from ~/.roduq/output/{clientId}/.
 * Handles both single-variant + multi-variant project layouts.
 */

import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  type ClientId,
  type Content,
  type DesignState,
  type DesignStateMultiVariant,
  type DesignStateSingle,
  type DesignTokens,
  type MultiVariantMeta,
  type Sections,
  type SingleMeta,
  type ProjectMeta,
  type VariantEntry,
  MCPServerError,
} from "./types.js";

const CLIENT_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export interface OutputReaderConfig {
  readonly outputDir: string;
}

export function defaultOutputDir(): string {
  return process.env["ROduQ_OUTPUT_DIR"]
    ?? process.env["RODUQ_OUTPUT_DIR"]
    ?? join(homedir(), ".roduq", "output");
}

export function validateClientId(clientId: string): asserts clientId is ClientId {
  if (typeof clientId !== "string" || !CLIENT_ID_PATTERN.test(clientId)) {
    throw new MCPServerError(
      `Invalid clientId "${clientId}" — must be kebab-case slug matching ${CLIENT_ID_PATTERN.source}`,
      "INVALID_INPUT",
    );
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson<T>(path: string): Promise<T> {
  const raw = await fs.readFile(path, "utf-8");
  return JSON.parse(raw) as T;
}

async function readText(path: string): Promise<string> {
  return fs.readFile(path, "utf-8");
}

export class OutputReader {
  constructor(private readonly config: OutputReaderConfig) {}

  clientDir(clientId: ClientId): string {
    return join(this.config.outputDir, clientId);
  }

  async assertClientExists(clientId: ClientId): Promise<void> {
    const dir = this.clientDir(clientId);
    if (!(await fileExists(dir))) {
      throw new MCPServerError(
        `Client "${clientId}" not found at ${dir}`,
        "CLIENT_NOT_FOUND",
      );
    }
  }

  async readMeta(clientId: ClientId): Promise<ProjectMeta> {
    const clientDir = this.clientDir(clientId);
    const singleMetaPath = join(clientDir, "meta.json");
    const multiMetaPath = join(clientDir, "meta-multi-variant.json");

    if (await fileExists(multiMetaPath)) {
      return readJson<MultiVariantMeta>(multiMetaPath);
    }
    if (await fileExists(singleMetaPath)) {
      return readJson<SingleMeta>(singleMetaPath);
    }
    throw new MCPServerError(
      `No meta.json or meta-multi-variant.json found in ${clientDir}`,
      "CLIENT_NOT_FOUND",
    );
  }

  async readDesignState(clientId: ClientId): Promise<DesignState> {
    validateClientId(clientId);
    await this.assertClientExists(clientId);

    const clientDir = this.clientDir(clientId);
    const meta = await this.readMeta(clientId);
    const completeFlag = await fileExists(join(clientDir, ".complete"));

    if (meta.type === "single") {
      return this.readSingleState(clientId, meta, completeFlag);
    }
    return this.readMultiVariantState(clientId, meta, completeFlag);
  }

  private async readSingleState(
    clientId: ClientId,
    meta: SingleMeta,
    completeFlag: boolean,
  ): Promise<DesignStateSingle> {
    const clientDir = this.clientDir(clientId);
    const status: DesignStateSingle["status"] = completeFlag ? "complete" : "in-progress";

    if (!completeFlag) {
      // Partial state — meta only
      return {
        clientId,
        status,
        type: "single",
        meta,
        tokens: {} as DesignTokens,
        sections: {} as Sections,
        content: {} as Content,
        designSystemMd: "",
      };
    }

    const [tokens, sections, content, designSystemMd] = await Promise.all([
      readJson<DesignTokens>(join(clientDir, "tokens.json")),
      readJson<Sections>(join(clientDir, "sections.json")),
      readJson<Content>(join(clientDir, "content.json")),
      readText(join(clientDir, "design-system.md")),
    ]);

    return {
      clientId,
      status,
      type: "single",
      meta,
      tokens,
      sections,
      content,
      designSystemMd,
    };
  }

  private async readMultiVariantState(
    clientId: ClientId,
    meta: MultiVariantMeta,
    completeFlag: boolean,
  ): Promise<DesignStateMultiVariant> {
    const clientDir = this.clientDir(clientId);
    const userPicked = meta.selectedVariant !== null;
    const status: DesignStateMultiVariant["status"] = completeFlag && userPicked ? "complete" : "in-progress";

    // Read 3 variants from variants/N-{label}/
    const variantsData = await Promise.all(
      meta.variants.map(async (entry) => this.readSingleVariant(clientDir, entry)),
    );

    const state: DesignStateMultiVariant = {
      clientId,
      status,
      type: "multi-variant",
      meta,
      variants: variantsData,
    };

    // If user picked, top-level files exist as promoted copies
    if (userPicked && completeFlag) {
      try {
        const [tokens, sections, content, designSystemMd] = await Promise.all([
          readJson<DesignTokens>(join(clientDir, "tokens.json")),
          readJson<Sections>(join(clientDir, "sections.json")),
          readJson<Content>(join(clientDir, "content.json")),
          readText(join(clientDir, "design-system.md")),
        ]);
        Object.assign(state, { tokens, sections, content, designSystemMd });
      } catch (err) {
        // Top-level files missing despite meta saying user picked — log + continue
        // (could be partial promote — agent should re-run pick)
      }
    }

    return state;
  }

  private async readSingleVariant(
    clientDir: string,
    entry: VariantEntry,
  ): Promise<DesignStateMultiVariant["variants"][number]> {
    const variantDir = join(
      clientDir,
      "variants",
      `${entry.id}-${entry.label.toLowerCase()}`,
    );

    const result: DesignStateMultiVariant["variants"][number] = {
      id: entry.id,
      label: entry.label,
      preset: entry.preset,
      status: entry.status,
    };

    if (entry.status !== "complete") {
      // Skip reading content gdy variant not complete
      return result;
    }

    if (!(await fileExists(variantDir))) {
      return result;
    }

    try {
      const [tokens, sections, content, designSystemMd] = await Promise.all([
        readJson<DesignTokens>(join(variantDir, "tokens.json")),
        readJson<Sections>(join(variantDir, "sections.json")),
        readJson<Content>(join(variantDir, "content.json")),
        readText(join(variantDir, "design-system.md")),
      ]);
      return {
        ...result,
        tokens,
        sections,
        content,
        designSystemMd,
      };
    } catch (err) {
      return result;
    }
  }
}
