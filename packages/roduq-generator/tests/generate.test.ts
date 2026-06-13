import { readFileSync } from "node:fs";
import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MockProvider } from "@roduq/llm";

import { generate } from "../src/generate.js";
import type { Brief } from "../src/types.js";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));
const exObj = (f: string): Record<string, unknown> =>
  JSON.parse(readFileSync(join(repoRoot, "schemas", "examples", f), "utf-8")) as Record<string, unknown>;

const tokensEx = exObj("tokens.example.json");
const sectionsEx = exObj("sections.example.json");
const contentEx = exObj("content.example.json");

// Runner asks for INNER content (it wraps the envelope itself), so the mock returns inner.
const INNER: Record<string, string> = {
  tokens: JSON.stringify(tokensEx["tokens"]),
  sections: JSON.stringify({ homepage: sectionsEx["homepage"], pages: sectionsEx["pages"] }),
  content: JSON.stringify({
    siteSettings: contentEx["siteSettings"],
    draftCopy: contentEx["draftCopy"],
    imagePrompts: contentEx["imagePrompts"],
  }),
};

const brief: Brief = {
  clientId: "golf-in-one",
  brief: "Golf In One — rezerwacja symulatorów golfowych + członkostwa.",
  audience: "golfiści i goście obiektów golfowych",
  toneAdjectives: ["premium", "sportowy", "konkretny"],
  brandColors: ["#275445", "#33705C", "#5CC18F"],
  _meta: { skill: "roduq-saas-landing", expectedMatrix: { conservative: "roduq-tech-modern" } },
  industryHints: { uniqueValueProp: "Cały obiekt golfowy w jednej apce." },
};

describe("generate (F2.2 skill runner, MockProvider — no API key)", () => {
  let outputDir: string;
  beforeEach(async () => {
    outputDir = await mkdtemp(join(tmpdir(), "roduq-gen-"));
  });
  afterEach(async () => {
    await rm(outputDir, { recursive: true, force: true });
  });

  it("produces a schema-valid bundle from skill + preset + brief via the LLM layer", async () => {
    const provider = new MockProvider({
      respond: (_messages, options) => INNER[options?.responseSchema?.name ?? ""] ?? "{}",
    });
    const res = await generate(brief, {
      provider,
      contentRoot: repoRoot,
      outputDir,
      now: "2026-06-13T12:00:00.000Z",
    });

    expect(res.files).toContain(".complete");
    expect(res.preset).toBe("roduq-tech-modern");
    await expect(access(join(res.clientDir, ".complete"))).resolves.toBeUndefined();

    const tokens = JSON.parse(await readFile(join(res.clientDir, "tokens.json"), "utf-8"));
    expect(tokens.$schema).toContain("tokens.schema.json");
    expect(tokens.generatedAt).toBe("2026-06-13T12:00:00.000Z");

    const meta = JSON.parse(await readFile(join(res.clientDir, "meta.json"), "utf-8"));
    expect(meta.clientId).toBe("golf-in-one");
    expect(meta.llmProvider).toBe("mock");
    expect(meta.preset).toBe("roduq-tech-modern");
  });

  it("retries on ajv failure then throws a clear message", async () => {
    let tokenCalls = 0;
    const provider = new MockProvider({
      respond: (_messages, options) => {
        const kind = options?.responseSchema?.name ?? "";
        if (kind === "tokens") {
          tokenCalls++;
          return '{"bogus":true}'; // wrapped into tokens → never valid (missing color/font/…)
        }
        return INNER[kind] ?? "{}";
      },
    });
    await expect(
      generate(brief, { provider, contentRoot: repoRoot, outputDir, maxAjvRetries: 1 }),
    ).rejects.toThrow(/generate\(tokens\): ajv/);
    expect(tokenCalls).toBe(2); // initial + 1 retry
  });
});
