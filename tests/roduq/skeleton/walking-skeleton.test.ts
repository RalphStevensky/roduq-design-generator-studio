/**
 * Walking skeleton (Faza 1 / F1.2) — end-to-end proof.
 *
 * brief (golf-in-one) → MockProvider → ajv → atomic write + .complete → OutputReader round-trip.
 * Dowodzi kontraktu producenta + konsumenta (OutputReader = proof per decyzja konsumenta,
 * bo @roduq/cli w sister repo to stub v0.4.0) zanim w Fazie 2 dojdzie prawdziwy LLM.
 */

import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { OutputReader } from "@roduq/mcp-server";

import golfBrief from "../fixtures/briefs/golf-in-one.json" with { type: "json" };
import { generateFromBrief } from "./generate";
import { MockProvider } from "./provider";
import type { Brief } from "./provider";

const brief = golfBrief as unknown as Brief;
const FIXED_NOW = "2026-06-13T12:00:00.000Z";

describe("Walking skeleton (F1.2) — brief → Mock → atomic write → round-trip", () => {
  let outputDir: string;

  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "roduq-skel-"));
  });
  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("produces a schema-valid golf-in-one bundle with .complete flag", async () => {
    const res = await generateFromBrief(brief, {
      provider: new MockProvider(),
      outputDir,
      now: FIXED_NOW,
    });

    expect(res.files).toContain(".complete");
    // .complete present (write-LAST signal)
    await expect(access(join(res.clientDir, ".complete"))).resolves.toBeUndefined();

    // golf brand override landed in tokens
    const tokens = JSON.parse(await readFile(join(res.clientDir, "tokens.json"), "utf-8"));
    expect(tokens.tokens.color.brand.primary).toBe("#275445");
    expect(tokens.tokens.font.display).toContain("Figtree");
    expect(tokens.generatedAt).toBe(FIXED_NOW);

    // Polish diacritics survive the write pipeline
    const content = JSON.parse(await readFile(join(res.clientDir, "content.json"), "utf-8"));
    expect(content.draftCopy["homepage-hero-subtitle"].pl).toContain("żółw");
    expect(content.siteSettings.siteName).toBe("Golf In One");
  });

  it("round-trips through OutputReader as status=complete", async () => {
    await generateFromBrief(brief, { provider: new MockProvider(), outputDir, now: FIXED_NOW });

    const reader = new OutputReader({ outputDir });
    const state = await reader.readDesignState("golf-in-one");

    expect(state.status).toBe("complete");
    expect(state.type).toBe("single");
    if (state.type === "single") {
      expect(state.tokens?.tokens.color.brand.primary).toBe("#275445");
      expect(state.sections?.homepage.blocks.length).toBeGreaterThan(0);
      expect(state.content?.siteSettings.siteName).toBe("Golf In One");
    }
  });

  it("rejects a bundle the provider corrupts (ajv safety net)", async () => {
    const brokenProvider = {
      name: "broken",
      async generateBundle(b: Brief) {
        const ok = await new MockProvider().generateBundle(b);
        // Corrupt tokens: invalid length value (F-19 guard) → must fail ajv
        (ok.tokens as Record<string, any>).tokens.spacing.md = "1.2.3rem";
        return ok;
      },
    };
    await expect(
      generateFromBrief(brief, { provider: brokenProvider, outputDir, now: FIXED_NOW }),
    ).rejects.toThrow(/ajv tokens/);
  });
});
