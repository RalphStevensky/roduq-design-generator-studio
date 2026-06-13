/**
 * Integration smoke (F2.1) — ONE real call per configured provider.
 *
 * Loads .env.local (gitignored) from repo root, builds the router from env, and
 * runs a small structured-output call. Validates the adapter against the REAL SDK.
 *
 * Run from repo root: pnpm exec tsx packages/roduq-llm/scripts/smoke.ts
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createRouterFromEnv } from "../src/index.js";

function loadEnvLocal(): void {
  const path = join(process.cwd(), ".env.local");
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
console.log("registered providers:", router.list().join(", "), "| default:", router.getDefaultKey());

const provider = router.pick();
console.log("using provider:", provider.name, "| model:", provider.defaultModel);

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["headlinePl", "headlineEn", "accentHex"],
  properties: {
    headlinePl: { type: "string" },
    headlineEn: { type: "string" },
    accentHex: { type: "string" },
  },
};

const started = Date.now();
const res = await provider.complete(
  [
    {
      role: "user",
      content:
        "Wygeneruj krótki nagłówek hero dla landing page aplikacji Golf In One (rezerwacja symulatorów golfowych, członkostwa). Po polsku i angielsku. accentHex = #275445. Użyj polskich znaków diakrytycznych.",
    },
  ],
  {
    system:
      "Jesteś generatorem treści marketingowych Roduq. Zwróć WYŁĄCZNIE JSON zgodny ze schematem, bez komentarzy.",
    responseSchema: { name: "hero", schema },
    maxTokens: 512,
  },
);
const elapsed = Date.now() - started;

console.log("\n--- content ---");
console.log(res.content);
console.log("\n--- usage ---");
console.log(
  `input=${res.inputTokens} output=${res.outputTokens} total=${res.totalTokens} cached=${res.cachedInputTokens ?? 0} stop=${res.stopReason ?? "?"} elapsed=${elapsed}ms`,
);

const parsed = JSON.parse(res.content) as Record<string, unknown>;
const hasPolish = /[ąćęłńóśźż]/i.test(JSON.stringify(parsed));
console.log("\n✓ valid JSON parsed. headlinePl:", parsed["headlinePl"]);
console.log("✓ Polish diacritics present:", hasPolish);
