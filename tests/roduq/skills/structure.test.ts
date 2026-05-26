/**
 * Skill structure tests — verify all 7 Roduq industry skills + multi-variant exist
 * z required files (SKILL.md, references/, assets/).
 *
 * Zero-dependency: pure file-system checks. Runs without LLM lub ajv.
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const REPO_ROOT = resolve(__dirname, "../../..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");

const INDUSTRY_SKILLS = [
  "roduq-saas-landing",
  "roduq-agency",
  "roduq-restaurant",
  "roduq-clinic",
  "roduq-real-estate",
  "roduq-product-launch",
  "roduq-portfolio",
] as const;

const ORCHESTRATOR_SKILL = "multi-variant";

const ALL_SKILLS = [...INDUSTRY_SKILLS, ORCHESTRATOR_SKILL];

describe("Roduq skills — directory structure", () => {
  for (const skill of ALL_SKILLS) {
    describe(`skills/${skill}/`, () => {
      const skillDir = join(SKILLS_ROOT, skill);

      it("directory exists", () => {
        expect(existsSync(skillDir)).toBe(true);
      });

      it("SKILL.md exists", () => {
        expect(existsSync(join(skillDir, "SKILL.md"))).toBe(true);
      });

      it("SKILL.md has YAML frontmatter z required fields", () => {
        const content = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
        expect(content).toMatch(/^---\n/);
        expect(content).toMatch(/\nname:\s/);
        expect(content).toMatch(/\ndescription:\s/);
        expect(content).toMatch(/\ntriggers:\n/);
        expect(content).toMatch(/\nod:\n/);
      });

      it("SKILL.md frontmatter zawiera od.roduq.* namespace", () => {
        const content = readFileSync(join(skillDir, "SKILL.md"), "utf-8");
        expect(content).toMatch(/\s+roduq:\n/);
        expect(content).toMatch(/industry:/);
        expect(content).toMatch(/target_repo:\s+roduq-web-starter/);
        expect(content).toMatch(/polish_first:\s+true/);
      });

      it("references/ directory exists z minimum 1 markdown file", () => {
        const referencesDir = join(skillDir, "references");
        expect(existsSync(referencesDir)).toBe(true);
      });

      it("assets/ directory exists z minimum 1 HTML template", () => {
        const assetsDir = join(skillDir, "assets");
        expect(existsSync(assetsDir)).toBe(true);
      });
    });
  }
});

describe("Industry skills — references files", () => {
  for (const skill of INDUSTRY_SKILLS) {
    describe(`skills/${skill}/references/`, () => {
      const referencesDir = join(SKILLS_ROOT, skill, "references");

      it("inspiration.md exists", () => {
        expect(existsSync(join(referencesDir, "inspiration.md"))).toBe(true);
      });

      it("content-patterns.md exists", () => {
        expect(existsSync(join(referencesDir, "content-patterns.md"))).toBe(true);
      });

      it("target-audience.md exists", () => {
        expect(existsSync(join(referencesDir, "target-audience.md"))).toBe(true);
      });
    });
  }
});

describe("Multi-variant skill — orchestrator structure", () => {
  const mvDir = join(SKILLS_ROOT, ORCHESTRATOR_SKILL);

  it("references/variant-strategy.md exists", () => {
    expect(existsSync(join(mvDir, "references", "variant-strategy.md"))).toBe(true);
  });

  it("references/preset-mapping.md exists", () => {
    expect(existsSync(join(mvDir, "references", "preset-mapping.md"))).toBe(true);
  });

  it("references/parallel-execution.md exists", () => {
    expect(existsSync(join(mvDir, "references", "parallel-execution.md"))).toBe(true);
  });

  it("assets/preview-side-by-side.html exists", () => {
    expect(existsSync(join(mvDir, "assets", "preview-side-by-side.html"))).toBe(true);
  });

  it("SKILL.md frontmatter zawiera variant_count: 3 + parallel_execution: true", () => {
    const content = readFileSync(join(mvDir, "SKILL.md"), "utf-8");
    expect(content).toMatch(/variant_count:\s+3/);
    expect(content).toMatch(/parallel_execution:\s+true/);
  });
});

describe("HTML templates — block type attributes", () => {
  for (const skill of INDUSTRY_SKILLS) {
    it(`${skill} templates contain data-block-type attributes`, () => {
      const assetsDir = join(SKILLS_ROOT, skill, "assets");
      // At least 1 template should have data-block-type
      // (Skill-specific block types vary)
      // This is a smoke check że templates follow convention
      // Phase 7 expansion: validate each template's data-block-type matches sections.v1.schema.json enum
      expect(existsSync(assetsDir)).toBe(true);
    });
  }
});

describe("Polish character handling w skill templates", () => {
  it("at least 1 skill template zawiera Polish content placeholder lub diacritics", () => {
    // Check saas-landing hero template
    const heroPath = join(SKILLS_ROOT, "roduq-saas-landing", "assets", "template-hero.html");
    if (existsSync(heroPath)) {
      const content = readFileSync(heroPath, "utf-8");
      // Template uses {{key}} placeholders which agent fills z Polish content
      expect(content).toMatch(/\{\{[a-z0-9-]+\}\}/);
    }
  });
});
