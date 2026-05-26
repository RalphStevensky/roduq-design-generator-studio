/**
 * OutputWriter.promoteVariant tests — exercises pick_variant flow.
 */

import { promises as fs } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { OutputWriter } from "../src/lib/output-writer";
import { MCPServerError } from "../src/lib/types";

const MULTI_VARIANT_META = {
  $schema: "https://roduq.dev/schemas/v1/meta-multi-variant.schema.json",
  version: "1.0.0",
  type: "multi-variant",
  clientId: "test-mv",
  generatedAt: "2026-05-26T20:00:00Z",
  industrySkill: "roduq-saas-landing",
  skill: "multi-variant",
  prompt: "Test brief",
  variants: [
    { id: 1, label: "Conservative", preset: "roduq-tech-modern", presetSource: "matrix", status: "complete" },
    { id: 2, label: "Modern", preset: "roduq-dark-cinematic", presetSource: "matrix", status: "complete" },
    { id: 3, label: "Bold", preset: "roduq-brutalist", presetSource: "matrix", status: "complete" },
  ],
  selectedVariant: null,
  userPick: null,
  userPickedAt: null,
};

const FILES = ["tokens.json", "sections.json", "content.json", "design-system.md", "preview.html"];

async function setupMultiVariantProject(outputDir: string, clientId: string): Promise<void> {
  const clientDir = join(outputDir, clientId);
  const variantsDir = join(clientDir, "variants");

  for (const label of ["1-conservative", "2-modern", "3-bold"]) {
    await fs.mkdir(join(variantsDir, label), { recursive: true });
    for (const filename of FILES) {
      await fs.writeFile(
        join(variantsDir, label, filename),
        filename.endsWith(".json") ? '{"test": true}' : "test content",
      );
    }
  }

  await fs.writeFile(
    join(clientDir, "meta-multi-variant.json"),
    JSON.stringify({ ...MULTI_VARIANT_META, clientId }),
  );
}

describe("OutputWriter.promoteVariant", () => {
  let outputDir: string;
  let writer: OutputWriter;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "roduq-mcp-test-"));
    writer = new OutputWriter({ outputDir });
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("promotes variant 1 (Conservative) → top-level + writes .complete", async () => {
    await setupMultiVariantProject(outputDir, "test-mv");

    const result = await writer.promoteVariant("test-mv", 1);

    expect(result.selectedVariant).toBe(1);
    expect(result.promotedFiles).toEqual(FILES);
    expect(result.userPickedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

    // Verify files at root
    for (const filename of FILES) {
      const path = join(outputDir, "test-mv", filename);
      const exists = await fs.access(path).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    }

    // Verify .complete flag
    const completeExists = await fs.access(join(outputDir, "test-mv", ".complete")).then(() => true).catch(() => false);
    expect(completeExists).toBe(true);

    // Verify meta updated
    const meta = JSON.parse(await fs.readFile(join(outputDir, "test-mv", "meta-multi-variant.json"), "utf-8"));
    expect(meta.selectedVariant).toBe(1);
    expect(meta.userPick).toBe(1);
    expect(meta.userPickedAt).toBe(result.userPickedAt);
  });

  it("rejects variantNum outside [1,2,3]", async () => {
    await setupMultiVariantProject(outputDir, "test-mv");

    await expect(writer.promoteVariant("test-mv", 4 as 1 | 2 | 3)).rejects.toMatchObject({
      code: "INVALID_INPUT",
    });
  });

  it("rejects variant z status !== complete", async () => {
    await setupMultiVariantProject(outputDir, "test-mv");

    // Mutate meta to mark variant 2 as timeout
    const metaPath = join(outputDir, "test-mv", "meta-multi-variant.json");
    const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    meta.variants[1].status = "timeout";
    await fs.writeFile(metaPath, JSON.stringify(meta));

    await expect(writer.promoteVariant("test-mv", 2)).rejects.toMatchObject({
      code: "VARIANT_NOT_COMPLETE",
    });
  });

  it("rejects client without meta-multi-variant.json", async () => {
    const clientDir = join(outputDir, "single-only");
    await fs.mkdir(clientDir, { recursive: true });

    await expect(writer.promoteVariant("single-only", 1)).rejects.toMatchObject({
      code: "CLIENT_NOT_FOUND",
    });
  });
});
