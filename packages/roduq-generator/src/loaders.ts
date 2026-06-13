/**
 * Load skill + preset + schemas from the repo content dirs at runtime
 * (contentRoot = repo root with skills/, design-systems/, schemas/).
 * Read at runtime (not import) so the package isn't coupled to content paths.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface LoadedSkill {
  readonly name: string;
  readonly body: string;
  readonly references: string;
}

export function loadSkill(contentRoot: string, name: string): LoadedSkill {
  const dir = join(contentRoot, "skills", name);
  const body = readFileSync(join(dir, "SKILL.md"), "utf-8");
  let references = "";
  const refDir = join(dir, "references");
  if (existsSync(refDir)) {
    for (const f of readdirSync(refDir)) {
      if (f.endsWith(".md")) {
        references += `\n\n# reference: ${f}\n${readFileSync(join(refDir, f), "utf-8")}`;
      }
    }
  }
  return { name, body, references };
}

export interface LoadedPreset {
  readonly name: string;
  readonly designMd: string;
  readonly tokensExample: string;
}

export function loadPreset(contentRoot: string, name: string): LoadedPreset {
  const dir = join(contentRoot, "design-systems", name);
  const designMd = readFileSync(join(dir, "DESIGN.md"), "utf-8");
  const tokensPath = join(dir, "tokens.example.json");
  const tokensExample = existsSync(tokensPath) ? readFileSync(tokensPath, "utf-8") : "";
  return { name, designMd, tokensExample };
}

export interface LoadedSchemas {
  readonly tokens: Record<string, unknown>;
  readonly sections: Record<string, unknown>;
  readonly content: Record<string, unknown>;
  readonly meta: Record<string, unknown>;
  readonly metaExample: Record<string, unknown>;
  /** Example fixtures — used as few-shot shape guides (bounds output size + lifts quality). */
  readonly tokensExample: Record<string, unknown>;
  readonly sectionsExample: Record<string, unknown>;
  readonly contentExample: Record<string, unknown>;
}

export function loadSchemas(contentRoot: string): LoadedSchemas {
  const dir = join(contentRoot, "schemas");
  const read = (rel: string): Record<string, unknown> =>
    JSON.parse(readFileSync(join(dir, rel), "utf-8")) as Record<string, unknown>;
  return {
    tokens: read("tokens.v1.schema.json"),
    sections: read("sections.v1.schema.json"),
    content: read("content.v1.schema.json"),
    meta: read("meta.v1.schema.json"),
    metaExample: read("examples/meta.example.json"),
    tokensExample: read("examples/tokens.example.json"),
    sectionsExample: read("examples/sections.example.json"),
    contentExample: read("examples/content.example.json"),
  };
}
