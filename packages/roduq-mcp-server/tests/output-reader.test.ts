/**
 * OutputReader tests — exercises file-system reading dla single + multi-variant projects.
 *
 * Phase 6 scaffold. Phase 7 will expand z e2e MCP integration.
 */

import { promises as fs } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { OutputReader, validateClientId } from "../src/lib/output-reader";
import { MCPServerError } from "../src/lib/types";

const FIXTURES = {
  singleMeta: {
    $schema: "https://roduq.dev/schemas/v1/meta.schema.json",
    version: "1.0.0",
    type: "single",
    clientId: "test-client",
    generatedAt: "2026-05-26T20:00:00Z",
    skill: "roduq-saas-landing",
    prompt: "Test brief",
  },
  multiVariantMeta: {
    $schema: "https://roduq.dev/schemas/v1/meta-multi-variant.schema.json",
    version: "1.0.0",
    type: "multi-variant",
    clientId: "test-mv",
    generatedAt: "2026-05-26T20:00:00Z",
    industrySkill: "roduq-saas-landing",
    skill: "multi-variant",
    prompt: "Test brief",
    variants: [
      {
        id: 1,
        label: "Conservative",
        preset: "roduq-tech-modern",
        presetSource: "matrix",
        status: "complete",
      },
      {
        id: 2,
        label: "Modern",
        preset: "roduq-dark-cinematic",
        presetSource: "matrix",
        status: "complete",
      },
      {
        id: 3,
        label: "Bold",
        preset: "roduq-brutalist",
        presetSource: "matrix",
        status: "complete",
      },
    ],
    selectedVariant: null,
    userPick: null,
    userPickedAt: null,
  },
  emptyTokens: {
    $schema: "https://roduq.dev/schemas/v1/tokens.schema.json",
    version: "1.0.0",
    generatedAt: "2026-05-26T20:00:00Z",
    tokens: {
      color: {
        surface: { default: "#FFFFFF", raised: "#FAFAFA", sunken: "#F5F5F5" },
        ink: { primary: "#0F0F0F", secondary: "#525252" },
        outline: { default: "rgba(0,0,0,0.12)" },
        brand: { primary: "#2563EB" },
      },
      font: { display: "Inter Tight", body: "Inter" },
      spacing: { md: "1rem" },
      radii: { md: "0.5rem" },
    },
  },
  emptySections: {
    $schema: "https://roduq.dev/schemas/v1/sections.schema.json",
    version: "1.0.0",
    homepage: {
      blocks: [{ blockType: "hero", variant: "centered" }],
    },
  },
  emptyContent: {
    $schema: "https://roduq.dev/schemas/v1/content.schema.json",
    version: "1.0.0",
    siteSettings: { siteName: "Test", tagline: "Test tagline" },
    draftCopy: { "homepage-hero-title": { pl: "Test", en: "Test" } },
  },
};

describe("validateClientId", () => {
  it("accepts kebab-case slugs", () => {
    expect(() => validateClientId("acme-corp")).not.toThrow();
    expect(() => validateClientId("a")).not.toThrow();
    expect(() => validateClientId("123-test")).not.toThrow();
  });

  it("rejects invalid clientIds", () => {
    expect(() => validateClientId("Acme")).toThrow(MCPServerError);
    expect(() => validateClientId("acme_corp")).toThrow(MCPServerError);
    expect(() => validateClientId("-leading-dash")).toThrow(MCPServerError);
    expect(() => validateClientId("")).toThrow(MCPServerError);
  });
});

describe("OutputReader", () => {
  let outputDir: string;
  let reader: OutputReader;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "roduq-mcp-test-"));
    reader = new OutputReader({ outputDir });
  });

  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("throws CLIENT_NOT_FOUND when client directory missing", async () => {
    await expect(reader.readDesignState("nonexistent")).rejects.toMatchObject({
      code: "CLIENT_NOT_FOUND",
    });
  });

  it("reads single-variant complete state", async () => {
    const clientDir = join(outputDir, "test-client");
    await fs.mkdir(clientDir, { recursive: true });
    await fs.writeFile(join(clientDir, "meta.json"), JSON.stringify(FIXTURES.singleMeta));
    await fs.writeFile(join(clientDir, "tokens.json"), JSON.stringify(FIXTURES.emptyTokens));
    await fs.writeFile(join(clientDir, "sections.json"), JSON.stringify(FIXTURES.emptySections));
    await fs.writeFile(join(clientDir, "content.json"), JSON.stringify(FIXTURES.emptyContent));
    await fs.writeFile(join(clientDir, "design-system.md"), "# Test design system");
    await fs.writeFile(join(clientDir, ".complete"), "");

    const state = await reader.readDesignState("test-client");

    expect(state.status).toBe("complete");
    expect(state.type).toBe("single");
    expect(state.meta.skill).toBe("roduq-saas-landing");
    if (state.type === "single") {
      expect(state.tokens.tokens.color.brand.primary).toBe("#2563EB");
      expect(state.sections.homepage.blocks).toHaveLength(1);
      expect(state.content.siteSettings.siteName).toBe("Test");
    }
  });

  it("returns in-progress status when .complete flag missing", async () => {
    const clientDir = join(outputDir, "test-pending");
    await fs.mkdir(clientDir, { recursive: true });
    const pendingMeta = { ...FIXTURES.singleMeta, clientId: "test-pending" };
    await fs.writeFile(join(clientDir, "meta.json"), JSON.stringify(pendingMeta));

    const state = await reader.readDesignState("test-pending");
    expect(state.status).toBe("in-progress");
  });

  it("reads multi-variant state without user picked", async () => {
    const clientDir = join(outputDir, "test-mv");
    const variantsDir = join(clientDir, "variants");
    await fs.mkdir(join(variantsDir, "1-conservative"), { recursive: true });
    await fs.mkdir(join(variantsDir, "2-modern"), { recursive: true });
    await fs.mkdir(join(variantsDir, "3-bold"), { recursive: true });
    await fs.writeFile(
      join(clientDir, "meta-multi-variant.json"),
      JSON.stringify(FIXTURES.multiVariantMeta),
    );

    for (const label of ["1-conservative", "2-modern", "3-bold"] as const) {
      await fs.writeFile(
        join(variantsDir, label, "tokens.json"),
        JSON.stringify(FIXTURES.emptyTokens),
      );
      await fs.writeFile(
        join(variantsDir, label, "sections.json"),
        JSON.stringify(FIXTURES.emptySections),
      );
      await fs.writeFile(
        join(variantsDir, label, "content.json"),
        JSON.stringify(FIXTURES.emptyContent),
      );
      await fs.writeFile(join(variantsDir, label, "design-system.md"), "# Test");
    }

    const state = await reader.readDesignState("test-mv");

    expect(state.type).toBe("multi-variant");
    expect(state.status).toBe("in-progress"); // no .complete yet
    if (state.type === "multi-variant") {
      expect(state.variants).toHaveLength(3);
      expect(state.variants[0].label).toBe("Conservative");
      expect(state.variants[0].tokens).toBeDefined();
      // Top-level files NOT promoted yet
      expect(state.tokens).toBeUndefined();
    }
  });
});
