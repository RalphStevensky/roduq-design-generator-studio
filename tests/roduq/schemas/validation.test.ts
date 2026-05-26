/**
 * Schema validation tests — ajv runtime check that schemas accept example fixtures.
 *
 * Phase 7 scaffold. Will run once ajv installed (pnpm install — currently blocked
 * by Windows native better-sqlite3 compile issue from Phase 1).
 */

import { describe, expect, it } from "vitest";
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import tokensSchema from "../../../schemas/tokens.v1.schema.json" with { type: "json" };
import sectionsSchema from "../../../schemas/sections.v1.schema.json" with { type: "json" };
import contentSchema from "../../../schemas/content.v1.schema.json" with { type: "json" };
import metaSchema from "../../../schemas/meta.v1.schema.json" with { type: "json" };
import metaMultiVariantSchema from "../../../schemas/meta-multi-variant.v1.schema.json" with { type: "json" };

import tokensExample from "../../../schemas/examples/tokens.example.json" with { type: "json" };
import sectionsExample from "../../../schemas/examples/sections.example.json" with { type: "json" };
import contentExample from "../../../schemas/examples/content.example.json" with { type: "json" };
import metaExample from "../../../schemas/examples/meta.example.json" with { type: "json" };
import metaMultiVariantExample from "../../../schemas/examples/meta-multi-variant.example.json" with { type: "json" };

function createValidator(schema: object): ValidateFunction {
  const ajv = new Ajv({
    strict: true,
    allErrors: true,
    removeAdditional: false,
  });
  addFormats(ajv, ["date-time", "uri"]);
  return ajv.compile(schema);
}

describe("Roduq Schemas v1 — example fixtures validate", () => {
  it("tokens.example.json validates against tokens.v1.schema.json", () => {
    const validate = createValidator(tokensSchema);
    const valid = validate(tokensExample);
    if (!valid) {
      console.error("tokens validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });

  it("sections.example.json validates against sections.v1.schema.json", () => {
    const validate = createValidator(sectionsSchema);
    const valid = validate(sectionsExample);
    if (!valid) {
      console.error("sections validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });

  it("content.example.json validates against content.v1.schema.json", () => {
    const validate = createValidator(contentSchema);
    const valid = validate(contentExample);
    if (!valid) {
      console.error("content validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });

  it("meta.example.json validates against meta.v1.schema.json", () => {
    const validate = createValidator(metaSchema);
    const valid = validate(metaExample);
    if (!valid) {
      console.error("meta validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });

  it("meta-multi-variant.example.json validates against meta-multi-variant.v1.schema.json", () => {
    const validate = createValidator(metaMultiVariantSchema);
    const valid = validate(metaMultiVariantExample);
    if (!valid) {
      console.error("meta-multi-variant validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });
});

describe("Roduq Schemas v1 — rejection of invalid input", () => {
  it("rejects tokens missing required `tokens` field", () => {
    const validate = createValidator(tokensSchema);
    const invalid = { ...tokensExample, tokens: undefined };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects sections with invalid blockType", () => {
    const validate = createValidator(sectionsSchema);
    const invalid = {
      ...sectionsExample,
      homepage: { blocks: [{ blockType: "invalid-block-type" }] },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects content draftCopy entry without `pl` field", () => {
    const validate = createValidator(contentSchema);
    const invalid = {
      ...contentExample,
      draftCopy: { "test-key": { en: "English only" } },
    };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects meta z invalid skill prefix", () => {
    const validate = createValidator(metaSchema);
    const invalid = { ...metaExample, skill: "some-other-skill" };
    expect(validate(invalid)).toBe(false);
  });

  it("rejects meta-multi-variant z fewer than 3 variants", () => {
    const validate = createValidator(metaMultiVariantSchema);
    const invalid = {
      ...metaMultiVariantExample,
      variants: metaMultiVariantExample.variants.slice(0, 2),
    };
    expect(validate(invalid)).toBe(false);
  });
});

describe("Polish character preservation w content schema", () => {
  it("accepts Polish diacritics w bilingualString.pl", () => {
    const validate = createValidator(contentSchema);
    const polishContent = {
      $schema: "https://roduq.dev/schemas/v1/content.schema.json",
      version: "1.0.0",
      siteSettings: { siteName: "Łódź żółw pięć", tagline: "Test ą ć ę ł ń ó ś ź ż" },
      draftCopy: {
        "test-hero-title": { pl: "Pięknie żyje się w Polsce 🇵🇱", en: "Living beautifully in Poland 🇵🇱" },
        "test-diacritics": { pl: "ą ć ę ł ń ó ś ź ż Ą Ć Ę Ł Ń Ó Ś Ź Ż" },
      },
    };
    const valid = validate(polishContent);
    if (!valid) {
      console.error("Polish validation errors:", validate.errors);
    }
    expect(valid).toBe(true);
  });
});
