/**
 * Walking skeleton (Faza 1 / F1.2) — provider seam.
 *
 * Definiuje interfejs `RoduqProvider` (ten sam szew, który w Fazie 2 zaimplementuje
 * AnthropicProvider) + `MockProvider` produkujący deterministyczny, schema-valid bundle.
 *
 * Mock buduje bundle z example fixtures (które przechodzą ajv) + nadpisuje brand z briefu —
 * gwarantuje walidność bez generacji LLM. Graduuje do apps/daemon w Fazie 2 (R1.2/R1.3).
 */

import tokensExample from "../../../schemas/examples/tokens.example.json" with { type: "json" };
import sectionsExample from "../../../schemas/examples/sections.example.json" with { type: "json" };
import contentExample from "../../../schemas/examples/content.example.json" with { type: "json" };

export interface Brief {
  clientId: string;
  brief: string;
  audience: string;
  toneAdjectives: string[];
  brandColors: string[] | null;
  _meta?: { skill?: string };
  industryHints?: { uniqueValueProp?: string };
}

export interface GeneratedBundle {
  tokens: Record<string, unknown>;
  sections: Record<string, unknown>;
  content: Record<string, unknown>;
  designSystemMd: string;
  previewHtml: string;
}

export interface RoduqProvider {
  readonly name: string;
  generateBundle(brief: Brief, opts?: { presetHint?: string }): Promise<GeneratedBundle>;
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

/** Deterministic stand-in for the real LLM provider (Faza 2). */
export class MockProvider implements RoduqProvider {
  readonly name = "mock";

  async generateBundle(brief: Brief, opts?: { presetHint?: string }): Promise<GeneratedBundle> {
    const tokens = clone(tokensExample) as Record<string, any>;
    const sections = clone(sectionsExample) as Record<string, unknown>;
    const content = clone(contentExample) as Record<string, any>;

    // Brand override z briefu (golf greens nadpisują paletę presetu — sanityzacja kontrastu w grupie B/G3)
    const [primary, secondary, tertiary] = brief.brandColors ?? [];
    if (primary) tokens["tokens"].color.brand.primary = primary;
    if (secondary) tokens["tokens"].color.brand.secondary = secondary;
    if (tertiary) tokens["tokens"].color.brand.tertiary = tertiary;
    tokens["tokens"].font.display = "Figtree, Inter, system-ui, sans-serif";
    tokens["tokens"].font.body = "Figtree, Inter, system-ui, sans-serif";
    tokens["sourcePrompt"] = brief.brief;
    tokens["_meta"] = {
      preset: opts?.presetHint ?? "roduq-tech-modern",
      category: "sports-tech-saas",
      description: `Mock bundle (walking skeleton) dla ${brief.clientId}`,
    };

    // Tożsamość + Polish-first copy (test diacritics: "Łódź żółw pięć słów")
    content["siteSettings"].siteName = "Golf In One";
    content["siteSettings"].tagline =
      brief.industryHints?.uniqueValueProp ?? "Cały obiekt golfowy w jednej apce.";
    content["draftCopy"]["homepage-hero-title"] = {
      pl: "Golf In One — cały obiekt w jednej apce.",
      en: "Golf In One — your whole venue in one app.",
    };
    content["draftCopy"]["homepage-hero-subtitle"] = {
      pl: "Rezerwuj symulator, zarządzaj członkostwem, wypożyczaj sprzęt i płać — bez telefonów i papierologii. (Łódź żółw pięć słów: ąćęłńóśźż)",
      en: "Book a simulator, manage membership, rent gear and pay — no calls, no paperwork.",
    };

    const designSystemMd = [
      "# Golf In One — Design System (Mock / walking skeleton)",
      "",
      `- Primary: ${primary ?? "#275445"}`,
      `- Secondary: ${secondary ?? "#33705C"}`,
      `- Tertiary: ${tertiary ?? "#5CC18F"}`,
      "- Font: Figtree",
      "",
      "Wygenerowane przez MockProvider (Faza 1 skeleton). Faza 2 podmienia na AnthropicProvider.",
    ].join("\n");

    const heroPl = (content["draftCopy"]["homepage-hero-subtitle"] as { pl: string }).pl;
    const previewHtml = [
      '<!doctype html><html lang="pl"><head><meta charset="utf-8">',
      "<title>Golf In One</title>",
      `<style>:root{--brand:${primary ?? "#275445"}}body{font-family:Figtree,system-ui,sans-serif;margin:0;padding:2rem}h1{color:var(--brand)}</style>`,
      "</head><body>",
      "<h1>Golf In One</h1>",
      `<p>${heroPl}</p>`,
      "</body></html>",
    ].join("");

    return { tokens, sections, content, designSystemMd, previewHtml };
  }
}
