/**
 * Preset structure tests — verify all 7 Roduq brand-agnostic presets exist
 * z required files (DESIGN.md, tokens.css, tokens.example.json, inspiration.md, samples/full-page.html).
 *
 * Zero-dependency: pure file-system checks.
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(__dirname, "../../..");
const PRESETS_ROOT = join(REPO_ROOT, "design-systems");

const RODUQ_PRESETS = [
  "roduq-default",
  "roduq-monolith-meadow",
  "roduq-tech-modern",
  "roduq-warm-editorial",
  "roduq-brutalist",
  "roduq-soft-pastel",
  "roduq-dark-cinematic",
] as const;

describe("Roduq presets — directory structure", () => {
  for (const preset of RODUQ_PRESETS) {
    describe(`design-systems/${preset}/`, () => {
      const presetDir = join(PRESETS_ROOT, preset);

      it("directory exists", () => {
        expect(existsSync(presetDir)).toBe(true);
      });

      it("DESIGN.md exists", () => {
        expect(existsSync(join(presetDir, "DESIGN.md"))).toBe(true);
      });

      it("tokens.css exists (upstream contract format)", () => {
        expect(existsSync(join(presetDir, "tokens.css"))).toBe(true);
      });

      it("tokens.example.json exists (JSON Schema v1 preview)", () => {
        expect(existsSync(join(presetDir, "tokens.example.json"))).toBe(true);
      });

      it("inspiration.md exists", () => {
        expect(existsSync(join(presetDir, "inspiration.md"))).toBe(true);
      });

      it("samples/full-page.html exists (canonical renderable demo)", () => {
        expect(existsSync(join(presetDir, "samples", "full-page.html"))).toBe(true);
      });
    });
  }
});

describe("Tokens CSS — upstream contract compliance", () => {
  for (const preset of RODUQ_PRESETS) {
    it(`${preset}/tokens.css defines required upstream tokens`, () => {
      const tokensPath = join(PRESETS_ROOT, preset, "tokens.css");
      if (!existsSync(tokensPath)) {
        throw new Error(`tokens.css missing dla ${preset}`);
      }
      const content = readFileSync(tokensPath, "utf-8");

      // Required upstream contract tokens (per craft/color.md lint enforcement)
      expect(content).toMatch(/--bg:/);
      expect(content).toMatch(/--surface:/);
      expect(content).toMatch(/--fg:/);
      expect(content).toMatch(/--muted:/);
      expect(content).toMatch(/--border:/);
      expect(content).toMatch(/--accent:/);
      expect(content).toMatch(/--font-display:/);
      expect(content).toMatch(/--font-body:/);
    });

    it(`${preset}/tokens.css defines Roduq extensions`, () => {
      const tokensPath = join(PRESETS_ROOT, preset, "tokens.css");
      const content = readFileSync(tokensPath, "utf-8");

      // Roduq extensions used by Phase 2 skills templates
      expect(content).toMatch(/--color-brand-primary:/);
      expect(content).toMatch(/--color-surface-default:/);
      expect(content).toMatch(/--space-md:/);
      expect(content).toMatch(/--radius-md:/);
    });
  }
});

describe("Full-page samples — HTML structure", () => {
  for (const preset of RODUQ_PRESETS) {
    it(`${preset}/samples/full-page.html is valid HTML doctype + lang`, () => {
      const samplePath = join(PRESETS_ROOT, preset, "samples", "full-page.html");
      const content = readFileSync(samplePath, "utf-8");

      expect(content).toMatch(/^<!DOCTYPE html>/i);
      expect(content).toMatch(/<html\s+lang=/);
      expect(content).toMatch(/<meta\s+charset=/);
      expect(content).toMatch(/<meta\s+name="viewport"/);
    });

    it(`${preset}/samples/full-page.html uses CSS variables (tokens reference)`, () => {
      const samplePath = join(PRESETS_ROOT, preset, "samples", "full-page.html");
      const content = readFileSync(samplePath, "utf-8");

      // Verify CSS uses var(--<name>) tokens — confirms tokens.css integration
      expect(content).toMatch(/var\(--bg\)/);
      expect(content).toMatch(/var\(--fg\)/);
      expect(content).toMatch(/var\(--accent\)/);
    });

    it(`${preset}/samples/full-page.html respects prefers-reduced-motion`, () => {
      const samplePath = join(PRESETS_ROOT, preset, "samples", "full-page.html");
      const content = readFileSync(samplePath, "utf-8");

      // Per WCAG + rule 003 — animations must respect prefers-reduced-motion
      expect(content).toMatch(/@media\s+\(prefers-reduced-motion/);
    });
  }
});

describe("Polish character handling w preset samples", () => {
  for (const preset of RODUQ_PRESETS) {
    it(`${preset}/samples/full-page.html zawiera Polish content (or is intentionally English)`, () => {
      const samplePath = join(PRESETS_ROOT, preset, "samples", "full-page.html");
      const content = readFileSync(samplePath, "utf-8");

      // Most samples should have Polish content; some (tech-modern, dark-cinematic) may be EN-first
      // Smoke check: lang attribute is pl OR content contains Polish diacritics
      const hasLangPl = /<html\s+lang="pl"/i.test(content);
      const hasDiacritics = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(content);
      expect(hasLangPl || hasDiacritics).toBe(true);
    });
  }
});

describe("Preset aesthetic differentiation", () => {
  it("roduq-brutalist uses radius 0 everywhere", () => {
    const tokens = readFileSync(join(PRESETS_ROOT, "roduq-brutalist", "tokens.css"), "utf-8");
    // Brutalist signature: --radius-* should all be 0
    expect(tokens).toMatch(/--radius-md:\s*0[;\s]/);
    expect(tokens).toMatch(/--radius-full:\s*0[;\s]/);
  });

  it("roduq-soft-pastel uses large radii", () => {
    const tokens = readFileSync(join(PRESETS_ROOT, "roduq-soft-pastel", "tokens.css"), "utf-8");
    // Soft pastel signature: --radius-md should be >= 1rem
    expect(tokens).toMatch(/--radius-md:\s*1rem/);
  });

  it("roduq-dark-cinematic uses jet black bg (NIE pure #000)", () => {
    const tokens = readFileSync(join(PRESETS_ROOT, "roduq-dark-cinematic", "tokens.css"), "utf-8");
    expect(tokens).toMatch(/--bg:\s*#0A0A0A/i);
    expect(tokens).not.toMatch(/--bg:\s*#000000\b/);
  });

  it("roduq-warm-editorial uses serif body font", () => {
    const tokens = readFileSync(join(PRESETS_ROOT, "roduq-warm-editorial", "tokens.css"), "utf-8");
    expect(tokens).toMatch(/--font-body:.*serif/);
  });
});
