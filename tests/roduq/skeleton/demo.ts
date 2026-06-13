/**
 * Walking skeleton — manualny demo-runner (Faza 1 / F1.2).
 *
 * Uruchamia pełną nitkę dla pilota Golf In One na KANONICZNĄ ścieżkę produktu
 * (~/.roduq/output lub ROduQ_OUTPUT_DIR) i czyta wynik przez OutputReader.
 *
 * Run: pnpm exec tsx tests/roduq/skeleton/demo.ts
 */

import { homedir } from "node:os";
import { join } from "node:path";
import { OutputReader } from "@roduq/mcp-server";

import golfBrief from "../fixtures/briefs/golf-in-one.json" with { type: "json" };
import { generateFromBrief } from "./generate.js";
import { MockProvider } from "./provider.js";
import type { Brief } from "./provider.js";

const outputDir =
  process.env["ROduQ_OUTPUT_DIR"] ??
  process.env["RODUQ_OUTPUT_DIR"] ??
  join(homedir(), ".roduq", "output");

const res = await generateFromBrief(golfBrief as unknown as Brief, {
  provider: new MockProvider(),
  outputDir,
});

console.log("✓ Wrote bundle to:", res.clientDir);
console.log("  files:", res.files.join(", "));

const reader = new OutputReader({ outputDir });
const state = await reader.readDesignState("golf-in-one");
console.log("✓ OutputReader status:", state.status, "| type:", state.type);
if (state.type === "single") {
  console.log("  brand.primary :", state.tokens?.tokens.color.brand.primary);
  console.log("  homepage blocks:", state.sections?.homepage.blocks.length);
  console.log("  siteName       :", state.content?.siteSettings.siteName);
}
console.log("→ Open preview:", join(res.clientDir, "preview.html"));
