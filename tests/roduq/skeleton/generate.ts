/**
 * Walking skeleton (Faza 1 / F1.2) — runner.
 *
 * brief → provider.generateBundle → ajv validate → atomic write (tmp → rename) → .complete LAST.
 * To jest najcieńsza nitka end-to-end (bez UI, bez prawdziwego LLM) dowodząca kontraktu
 * producenta zanim w Fazie 2 dojdzie AnthropicProvider. Graduuje do apps/daemon.
 */

import { promises as fs } from "node:fs";
import { join } from "node:path";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

import tokensSchema from "../../../schemas/tokens.v1.schema.json" with { type: "json" };
import sectionsSchema from "../../../schemas/sections.v1.schema.json" with { type: "json" };
import contentSchema from "../../../schemas/content.v1.schema.json" with { type: "json" };
import metaSchema from "../../../schemas/meta.v1.schema.json" with { type: "json" };
import metaExample from "../../../schemas/examples/meta.example.json" with { type: "json" };

import type { Brief, RoduqProvider } from "./provider.js";

const ajv = new Ajv({ strict: true, allErrors: true, removeAdditional: false });
addFormats(ajv, ["date-time", "uri"]);

const validators: Record<string, ValidateFunction> = {
  tokens: ajv.compile(tokensSchema),
  sections: ajv.compile(sectionsSchema),
  content: ajv.compile(contentSchema),
  meta: ajv.compile(metaSchema),
};

function validate(name: string, data: unknown): void {
  const v = validators[name];
  if (!v) throw new Error(`no validator for ${name}`);
  if (!v(data)) {
    throw new Error(`ajv ${name} validation failed: ${JSON.stringify(v.errors)}`);
  }
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export interface GenerateResult {
  clientDir: string;
  files: string[];
}

export interface GenerateOptions {
  provider: RoduqProvider;
  outputDir: string;
  /** Inject a fixed timestamp for deterministic tests; defaults to now. */
  now?: string;
}

export async function generateFromBrief(brief: Brief, opts: GenerateOptions): Promise<GenerateResult> {
  const now = opts.now ?? new Date().toISOString();
  const bundle = await opts.provider.generateBundle(brief);

  // Runner stampuje generatedAt (nie provider — to metadane biegu)
  (bundle.tokens as Record<string, unknown>)["generatedAt"] = now;

  // meta = klon example (gwarancja walidności) + override per brief
  const meta = clone(metaExample) as Record<string, unknown>;
  meta["clientId"] = brief.clientId;
  meta["generatedAt"] = now;
  meta["prompt"] = brief.brief;
  meta["skill"] = brief._meta?.skill ?? "roduq-saas-landing";
  meta["llmProvider"] = opts.provider.name;
  meta["model"] = "mock";
  meta["executionTimeMs"] = 0;
  meta["tokensUsed"] = { input: 0, output: 0 };
  meta["estimatedCostUsd"] = 0;

  // ajv = siatka bezpieczeństwa (w Fazie 2 structured outputs to pierwsza linia)
  validate("tokens", bundle.tokens);
  validate("sections", bundle.sections);
  validate("content", bundle.content);
  validate("meta", meta);

  // Atomic write: tmp dir → rename → .complete LAST (per protokół; F-22)
  const finalDir = join(opts.outputDir, brief.clientId);
  const tmpDir = `${finalDir}.tmp`;
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.rm(finalDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });

  const writes: Array<[string, string]> = [
    ["meta.json", JSON.stringify(meta, null, 2)],
    ["tokens.json", JSON.stringify(bundle.tokens, null, 2)],
    ["sections.json", JSON.stringify(bundle.sections, null, 2)],
    ["content.json", JSON.stringify(bundle.content, null, 2)],
    ["design-system.md", bundle.designSystemMd],
    ["preview.html", bundle.previewHtml],
  ];
  for (const [name, data] of writes) {
    await fs.writeFile(join(tmpDir, name), data, "utf-8");
  }
  await fs.rename(tmpDir, finalDir);
  await fs.writeFile(join(finalDir, ".complete"), "", "utf-8");

  return { clientDir: finalDir, files: [...writes.map(([n]) => n), ".complete"] };
}
