/**
 * F2.2 demo — generate the REAL Golf In One bundle via the configured provider.
 *
 * Loads .env.local (gitignored) for the API key + model, runs the skill runner,
 * reads the result back via OutputReader. Run from repo root:
 *   pnpm exec tsx packages/roduq-generator/scripts/generate-golf.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRouterFromEnv } from "@roduq/llm";
import { OutputReader } from "@roduq/mcp-server";

import { generate } from "../src/generate.js";
import type { Brief } from "../src/types.js";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

function loadEnvLocal(): void {
  const path = join(repoRoot, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const t = line.trim();
    if (t === "" || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvLocal();

const router = await createRouterFromEnv();
const provider = router.pick();
console.log("provider:", provider.name, "| model:", provider.defaultModel);

const brief = JSON.parse(
  readFileSync(join(repoRoot, "tests", "roduq", "fixtures", "briefs", "golf-in-one.json"), "utf-8"),
) as Brief;

const outputDir = process.env["ROduQ_OUTPUT_DIR"] || join(homedir(), ".roduq", "output");

const started = Date.now();
const res = await generate(brief, { provider, contentRoot: repoRoot, outputDir, maxAjvRetries: 2 });
const elapsed = Date.now() - started;

console.log("\n✓ Wrote:", res.clientDir);
console.log("  preset:", res.preset, "| files:", res.files.join(", "));
console.log(`  usage: input=${res.usage.input} output=${res.usage.output} total=${res.usage.total} | ${(elapsed / 1000).toFixed(1)}s`);

const reader = new OutputReader({ outputDir });
const state = await reader.readDesignState("golf-in-one");
console.log("\n✓ OutputReader status:", state.status, "| type:", state.type);
if (state.type === "single") {
  console.log("  brand.primary :", state.tokens?.tokens.color.brand.primary);
  console.log("  homepage blocks:", state.sections?.homepage.blocks.length);
  console.log("  siteName       :", state.content?.siteSettings.siteName);
  const draft = state.content?.draftCopy as Record<string, { pl?: string }> | undefined;
  console.log("  hero (pl)      :", draft?.["homepage-hero-title"]?.pl ?? "(n/a)");
}
console.log("→ preview:", join(res.clientDir, "preview.html"));
