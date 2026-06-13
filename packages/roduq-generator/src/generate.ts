/**
 * Skill runner (Faza 2 / F2.2) — the core generation engine.
 *
 * brief + skill + preset → assemble prompt → provider.complete (structured output,
 * per-artifact JSON Schema) → ajv validate (+ 1 retry with error hint) → assemble
 * bundle (meta + design-system.md + preview.html) → atomic write + .complete.
 *
 * Provider-agnostic: depends only on @roduq/llm's LLMProvider (model chosen by config).
 */

import { promises as fs } from "node:fs";
import { join } from "node:path";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import type { ChatMessage, LLMProvider, ResponseSchema } from "@roduq/llm";

import { loadPreset, loadSchemas, loadSkill } from "./loaders.js";
import type { Brief, GenerateResult } from "./types.js";

type Artifact = "tokens" | "sections" | "content";

const SCHEMA_ID: Record<Artifact, string> = {
  tokens: "https://roduq.dev/schemas/v1/tokens.schema.json",
  sections: "https://roduq.dev/schemas/v1/sections.schema.json",
  content: "https://roduq.dev/schemas/v1/content.schema.json",
};

export interface GenerateConfig {
  readonly provider: LLMProvider;
  /** Repo root containing skills/, design-systems/, schemas/. */
  readonly contentRoot: string;
  readonly outputDir: string;
  readonly preset?: string;
  readonly model?: string;
  readonly now?: string;
  readonly maxAjvRetries?: number;
  readonly maxTokens?: number;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export async function generate(brief: Brief, cfg: GenerateConfig): Promise<GenerateResult> {
  const now = cfg.now ?? new Date().toISOString();
  const skillName = brief._meta?.skill ?? "roduq-saas-landing";
  const presetName = cfg.preset ?? brief._meta?.expectedMatrix?.conservative ?? "roduq-tech-modern";

  const skill = loadSkill(cfg.contentRoot, skillName);
  const preset = loadPreset(cfg.contentRoot, presetName);
  const schemas = loadSchemas(cfg.contentRoot);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv, ["date-time", "uri"]);
  const validators: Record<Artifact | "meta", ValidateFunction> = {
    tokens: ajv.compile(schemas.tokens),
    sections: ajv.compile(schemas.sections),
    content: ajv.compile(schemas.content),
    meta: ajv.compile(schemas.meta),
  };

  const system = [
    skill.body,
    `\n\n## Active preset: ${presetName}\n`,
    preset.designMd,
    preset.tokensExample ? `\n\n## Preset reference tokens (tokens.example.json)\n${preset.tokensExample}\n` : "",
    skill.references,
    `\n\n## Brand override\nNadpisz paletę presetu kolorami marki: ${JSON.stringify(brief.brandColors)}. Zachowaj kontrast WCAG AA.`,
    `\n\n## Output rules\nZwróć WYŁĄCZNIE jeden obiekt JSON zgodny z podanym schematem. Generuj ZWIĘŹLE: pola wymagane + rozsądny podzbiór opcjonalnych (NIE wypełniaj wszystkich możliwych). Copy Polish-first (pl główne, en draft). Poprawne polskie znaki diakrytyczne. Bez komentarzy, bez markdown.`,
  ].join("");

  const asRecord = (v: unknown): Record<string, unknown> =>
    v !== null && typeof v === "object" ? (v as Record<string, unknown>) : {};

  // The model returns the INNER content (color/font/…, homepage/…, siteSettings/…);
  // the runner wraps it with the envelope ($schema/version/…). More reliable than
  // asking the model to reproduce the full file envelope (it tends to flatten it).
  const specFor = (
    kind: Artifact,
  ): {
    innerSchema: Record<string, unknown>;
    exampleInner: Record<string, unknown>;
    wrap: (inner: Record<string, unknown>) => Record<string, unknown>;
  } => {
    const full = asRecord(schemas[kind]);
    const props = asRecord(full["properties"]);
    const defs = full["definitions"];
    const withDefs = (s: Record<string, unknown>): Record<string, unknown> =>
      defs !== undefined ? { ...s, definitions: defs } : s;

    if (kind === "tokens") {
      return {
        innerSchema: withDefs(asRecord(props["tokens"])),
        exampleInner: asRecord(asRecord(schemas.tokensExample)["tokens"]),
        wrap: (inner) => ({
          $schema: SCHEMA_ID.tokens,
          version: "1.0.0",
          generatedAt: now,
          sourcePrompt: brief.brief,
          _meta: { preset: presetName, category: "generated", description: `${brief.clientId} design tokens` },
          tokens: inner,
        }),
      };
    }
    if (kind === "sections") {
      return {
        innerSchema: withDefs({
          type: "object",
          required: ["homepage"],
          properties: { homepage: props["homepage"] },
        }),
        // Compact few-shot: sections = STRUCTURE only (blockType + variant). The
        // actual copy lives in content.json; bloating blocks here blows the budget.
        exampleInner: {
          homepage: {
            blocks: [
              { blockType: "hero", variant: "centered" },
              { blockType: "social-proof", variant: "logos-strip" },
              { blockType: "features", variant: "3-col-icons" },
              { blockType: "pricing", variant: "3-tier" },
              { blockType: "testimonials", variant: "grid" },
              { blockType: "faq", variant: "accordion" },
              { blockType: "cta", variant: "centered-gradient" },
            ],
          },
        },
        wrap: (inner) => ({ $schema: SCHEMA_ID.sections, version: "1.0.0", ...inner }),
      };
    }
    const ex = asRecord(schemas.contentExample);
    // Give draftCopy EXPLICIT keys (from the example) as properties so structured
    // mode fills each one — an open additionalProperties map yields an empty object.
    const draftKeys = Object.keys(asRecord(ex["draftCopy"]));
    const draftProps: Record<string, unknown> = {};
    for (const key of draftKeys) draftProps[key] = { $ref: "#/definitions/bilingualString" };
    return {
      innerSchema: withDefs({
        type: "object",
        required: ["siteSettings", "draftCopy"],
        properties: {
          siteSettings: props["siteSettings"],
          draftCopy: { type: "object", required: draftKeys, properties: draftProps },
          imagePrompts: props["imagePrompts"],
        },
      }),
      exampleInner: {
        siteSettings: ex["siteSettings"],
        draftCopy: ex["draftCopy"],
        imagePrompts: ex["imagePrompts"],
      },
      wrap: (inner) => ({ $schema: SCHEMA_ID.content, version: "1.0.0", ...inner }),
    };
  };

  const usage = { input: 0, output: 0, total: 0 };

  const genArtifact = async (kind: Artifact): Promise<Record<string, unknown>> => {
    // The real JSON Schema goes in the PROMPT (reliable across providers); the
    // provider only gets a minimal responseSchema to trigger JSON mode. Gemini's
    // responseJsonSchema and OpenAI strict mode reject our full ajv schemas
    // (pattern/anyOf/$ref/additionalProperties) — ajv is the real enforcement.
    const spec = specFor(kind);
    const responseSchema: ResponseSchema = { name: kind, schema: spec.innerSchema };
    const validate = validators[kind];
    const shapeGuide = JSON.stringify(spec.exampleInner);
    const userPrompt = `${buildUserPrompt(kind, brief)}\n\nWzoruj się NA TEJ STRUKTURZE (te same pola, podobny rozmiar — dostosuj WARTOŚCI do briefu i marki; NIE kopiuj treści z przykładu, NIE rozdmuchuj). NIE dodawaj $schema/version/generatedAt (dodajemy je sami):\n${shapeGuide}`;
    const retries = cfg.maxAjvRetries ?? 1;
    let lastErr = "";

    for (let attempt = 0; attempt <= retries; attempt++) {
      const content =
        attempt === 0
          ? userPrompt
          : `${userPrompt}\n\nPoprzednia próba NIE przeszła walidacji JSON Schema: ${lastErr}\nZwróć poprawiony, kompletny JSON.`;
      const messages: ChatMessage[] = [{ role: "user", content }];
      const res = await cfg.provider.complete(messages, {
        system,
        responseSchema,
        // Thinking off (provider-side) + sanitized schema bound output to real
        // content. sections/content are large (~16k tok); 32768 gives headroom.
        // Streaming means a long call won't hit the headers timeout.
        maxTokens: cfg.maxTokens ?? 32768,
        cache: true,
        ...(cfg.model !== undefined ? { model: cfg.model } : {}),
      });
      usage.input += res.inputTokens;
      usage.output += res.outputTokens;
      usage.total += res.totalTokens;

      const diag = `[stop=${res.stopReason ?? "?"} len=${res.content.length} out=${res.outputTokens}]`;
      let inner: Record<string, unknown>;
      try {
        inner = JSON.parse(res.content) as Record<string, unknown>;
      } catch (e) {
        lastErr = `JSON.parse ${diag}: ${e instanceof Error ? e.message : String(e)}`;
        continue;
      }
      // Model returns the inner content; runner wraps it with the envelope.
      const full = spec.wrap(inner);
      if (validate(full)) return full;
      lastErr = `${diag} ${ajv.errorsText(validate.errors, { separator: "; " })}`;
    }
    throw new Error(`generate(${kind}): ajv validation failed after ${retries} retries — ${lastErr}`);
  };

  const tokens = await genArtifact("tokens");
  const sections = await genArtifact("sections");
  const content = await genArtifact("content");

  const meta = clone(schemas.metaExample);
  meta["clientId"] = brief.clientId;
  meta["generatedAt"] = now;
  meta["prompt"] = brief.brief;
  meta["skill"] = skillName;
  meta["preset"] = presetName;
  meta["llmProvider"] = cfg.provider.name;
  meta["model"] = cfg.model ?? cfg.provider.defaultModel;
  meta["tokensUsed"] = { input: usage.input, output: usage.output };
  meta["estimatedCostUsd"] = 0;
  if (!validators.meta(meta)) {
    throw new Error(`generate(meta): invalid — ${ajv.errorsText(validators.meta.errors)}`);
  }

  const designSystemMd = composeDesignSystemMd(brief, presetName, tokens);
  const previewHtml = composePreviewHtml(brief, tokens, content);

  const finalDir = join(cfg.outputDir, brief.clientId);
  const tmpDir = `${finalDir}.tmp`;
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.rm(finalDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });

  const writes: Array<[string, string]> = [
    ["meta.json", JSON.stringify(meta, null, 2)],
    ["tokens.json", JSON.stringify(tokens, null, 2)],
    ["sections.json", JSON.stringify(sections, null, 2)],
    ["content.json", JSON.stringify(content, null, 2)],
    ["design-system.md", designSystemMd],
    ["preview.html", previewHtml],
  ];
  for (const [name, data] of writes) {
    await fs.writeFile(join(tmpDir, name), data, "utf-8");
  }
  await fs.rename(tmpDir, finalDir);
  await fs.writeFile(join(finalDir, ".complete"), "", "utf-8");

  return { clientDir: finalDir, files: [...writes.map(([n]) => n), ".complete"], preset: presetName, usage };
}

function buildUserPrompt(kind: Artifact, brief: Brief): string {
  const base = `Klient: ${brief.clientId}\nBrief: ${brief.brief}\nAudience: ${brief.audience}\nTon: ${brief.toneAdjectives.join(", ")}\nMarka (hex): ${JSON.stringify(brief.brandColors)}\nUSP: ${brief.industryHints?.uniqueValueProp ?? ""}`;
  switch (kind) {
    case "tokens":
      return `${base}\n\nWygeneruj kompletny tokens.json (design tokens: color/font/spacing/radii i opcjonalne grupy) zgodny ze schematem. Użyj kolorów marki dla color.brand.*.`;
    case "sections":
      return `${base}\n\nWygeneruj LEKKI sections.json — TYLKO struktura homepage: tablica "blocks", każdy blok = { blockType, variant }. blockType MUSI być z dozwolonego enum. MAX 8 bloków. BEZ podstron, BEZ treści (treść idzie do content.json).`;
    case "content":
      return `${base}\n\nWygeneruj content.json — siteSettings (metaDescription MAX 160 znaków!) + draftCopy: WYPEŁNIJ KAŻDY klucz wartością { pl, en } (pl główne, en draft). Konkretne benefity, bez corporate-speak, poprawne polskie znaki.`;
    default:
      return base;
  }
}

function pickHex(tokens: Record<string, unknown>, fallback: string): string {
  const t = tokens["tokens"];
  if (t !== null && typeof t === "object") {
    const color = (t as Record<string, unknown>)["color"];
    if (color !== null && typeof color === "object") {
      const brand = (color as Record<string, unknown>)["brand"];
      if (brand !== null && typeof brand === "object") {
        const primary = (brand as Record<string, unknown>)["primary"];
        if (typeof primary === "string") return primary;
      }
    }
  }
  return fallback;
}

function composeDesignSystemMd(brief: Brief, preset: string, tokens: Record<string, unknown>): string {
  const primary = pickHex(tokens, brief.brandColors?.[0] ?? "#275445");
  return [
    `# ${brief.clientId} — Design System`,
    "",
    `Preset: \`${preset}\` · Primary: ${primary}`,
    "",
    `## Brief`,
    brief.brief,
    "",
    `## Brand colors`,
    (brief.brandColors ?? []).map((c) => `- ${c}`).join("\n"),
    "",
    `_Wygenerowane przez @roduq/generator (Faza 2)._`,
  ].join("\n");
}

function composePreviewHtml(
  brief: Brief,
  tokens: Record<string, unknown>,
  content: Record<string, unknown>,
): string {
  const primary = pickHex(tokens, brief.brandColors?.[0] ?? "#275445");
  const draft = content["draftCopy"];
  let heroTitle = brief.clientId;
  let heroSub = brief.brief;
  if (draft !== null && typeof draft === "object") {
    const d = draft as Record<string, unknown>;
    const title = d["homepage-hero-title"];
    const sub = d["homepage-hero-subtitle"];
    if (title !== null && typeof title === "object") {
      const pl = (title as Record<string, unknown>)["pl"];
      if (typeof pl === "string") heroTitle = pl;
    }
    if (sub !== null && typeof sub === "object") {
      const pl = (sub as Record<string, unknown>)["pl"];
      if (typeof pl === "string") heroSub = pl;
    }
  }
  return [
    '<!doctype html><html lang="pl"><head><meta charset="utf-8">',
    `<title>${brief.clientId}</title>`,
    `<style>:root{--brand:${primary}}body{font-family:Figtree,system-ui,sans-serif;margin:0;padding:3rem;max-width:60rem}h1{color:var(--brand);font-size:2.5rem}p{font-size:1.25rem;color:#333}</style>`,
    "</head><body>",
    `<h1>${escapeHtml(heroTitle)}</h1>`,
    `<p>${escapeHtml(heroSub)}</p>`,
    "</body></html>",
  ].join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
