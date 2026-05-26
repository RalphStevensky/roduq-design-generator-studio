# Roduq Schemas v1

> JSON Schema (Draft 7) definitions dla Roduq design output protocol. Validates artifacts produced by skills/roduq-* + skills/multi-variant w `~/.roduq/output/{client-id}/`.

## Schemas

| File | Validates | Schema URI |
|------|-----------|-----------|
| [`tokens.v1.schema.json`](./tokens.v1.schema.json) | `tokens.json` — design tokens (color/font/spacing/radii) | `https://roduq.dev/schemas/v1/tokens.schema.json` |
| [`sections.v1.schema.json`](./sections.v1.schema.json) | `sections.json` — Payload-ready block configurations | `https://roduq.dev/schemas/v1/sections.schema.json` |
| [`content.v1.schema.json`](./content.v1.schema.json) | `content.json` — bilingual PL+EN draft copy | `https://roduq.dev/schemas/v1/content.schema.json` |
| [`meta.v1.schema.json`](./meta.v1.schema.json) | `meta.json` — single-variant generation metadata | `https://roduq.dev/schemas/v1/meta.schema.json` |
| [`meta-multi-variant.v1.schema.json`](./meta-multi-variant.v1.schema.json) | `meta-multi-variant.json` — 3-variant orchestrator state | `https://roduq.dev/schemas/v1/meta-multi-variant.schema.json` |

Examples: [`./examples/`](./examples/) — valid output samples for each schema.

## Hosting strategy

- **Local copy** (this directory) — used przy validation w Roduq daemon + `@roduq/cli` w roduq-web-starter
- **Production CDN** at `https://roduq.dev/schemas/v1/` — referenced via `$schema` field w output JSON files
- **Versioning** — major version locked w directory name (v1). Breaking changes → v2/ directory + migration helper w `@roduq/cli`

## Output directory layout

```
~/.roduq/output/{client-id}/
├── .complete                    # written LAST — signals @roduq/cli consumer ready
├── meta.json                    # single OR meta-multi-variant.json (mutually exclusive)
├── design-system.md             # human-readable summary
├── tokens.json                  # validated
├── sections.json                # validated
├── content.json                 # validated
├── preview.html                 # static snapshot dla verification
├── assets/                      # optional uploaded brand files
└── variants/                    # only present when multi-variant skill used
    ├── 1-conservative/
    │   ├── tokens.json
    │   ├── sections.json
    │   ├── content.json
    │   ├── design-system.md
    │   └── preview.html
    ├── 2-modern/
    └── 3-bold/
```

After user picks variant N via multi-variant flow, that variant's files copied to top-level + `.complete` written. Unselected variants stay w `variants/` dla future reference.

## ajv validation pattern

### Install ajv (Phase 7 daemon implementation)

```bash
pnpm --filter @open-design/daemon add ajv ajv-formats
# or workspace-wide:
pnpm add -w ajv ajv-formats
```

### Compile + validate per schema

```typescript
import Ajv from "ajv";
import addFormats from "ajv-formats";
import tokensSchema from "../../schemas/tokens.v1.schema.json";
import sectionsSchema from "../../schemas/sections.v1.schema.json";
import contentSchema from "../../schemas/content.v1.schema.json";
import metaSchema from "../../schemas/meta.v1.schema.json";
import metaMultiVariantSchema from "../../schemas/meta-multi-variant.v1.schema.json";

const ajv = new Ajv({
  strict: true,
  allErrors: true,
  removeAdditional: false,    // preserve unknown properties dla forward-compat
});
addFormats(ajv, ["date-time", "uri"]);

export const validators = {
  tokens: ajv.compile(tokensSchema),
  sections: ajv.compile(sectionsSchema),
  content: ajv.compile(contentSchema),
  meta: ajv.compile(metaSchema),
  metaMultiVariant: ajv.compile(metaMultiVariantSchema),
};

export function validateOrThrow(
  validator: ReturnType<typeof ajv.compile>,
  data: unknown,
  label: string,
): void {
  if (!validator(data)) {
    throw new ValidationError(
      `${label} schema validation failed: ${ajv.errorsText(validator.errors)}`,
      validator.errors,
    );
  }
}
```

### Atomic write protocol

Per `.cursor/rules/004-file-protocol.mdc`:

```typescript
import { promises as fs } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";

export async function atomicWriteClient(
  outputDir: string,
  clientId: string,
  payload: {
    tokens: unknown;
    sections: unknown;
    content: unknown;
    meta: unknown;
    designSystemMd: string;
    previewHtml: string;
  },
): Promise<void> {
  const finalDir = join(outputDir, clientId);
  const tmpDir = join(outputDir, `${clientId}.tmp-${Date.now()}`);

  // Step 1: Validate all payloads against schemas (rule 004)
  validateOrThrow(validators.tokens, payload.tokens, "tokens");
  validateOrThrow(validators.sections, payload.sections, "sections");
  validateOrThrow(validators.content, payload.content, "content");
  validateOrThrow(validators.meta, payload.meta, "meta");

  // Step 2: Write all files to tmp directory
  await fs.mkdir(tmpDir, { recursive: true });
  await Promise.all([
    fs.writeFile(join(tmpDir, "tokens.json"), JSON.stringify(payload.tokens, null, 2)),
    fs.writeFile(join(tmpDir, "sections.json"), JSON.stringify(payload.sections, null, 2)),
    fs.writeFile(join(tmpDir, "content.json"), JSON.stringify(payload.content, null, 2)),
    fs.writeFile(join(tmpDir, "meta.json"), JSON.stringify(payload.meta, null, 2)),
    fs.writeFile(join(tmpDir, "design-system.md"), payload.designSystemMd),
    fs.writeFile(join(tmpDir, "preview.html"), payload.previewHtml),
  ]);

  // Step 3: Remove existing final dir if present (idempotent re-run)
  try {
    await fs.rm(finalDir, { recursive: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  // Step 4: Atomic rename tmp → final
  await fs.rename(tmpDir, finalDir);

  // Step 5: Write .complete flag LAST (signal CLI consumer ready)
  await fs.writeFile(join(finalDir, ".complete"), "");
}
```

### Multi-variant atomic write

```typescript
export async function atomicWriteMultiVariant(
  outputDir: string,
  clientId: string,
  variants: Array<{
    id: 1 | 2 | 3;
    label: "Conservative" | "Modern" | "Bold";
    tokens: unknown;
    sections: unknown;
    content: unknown;
    designSystemMd: string;
    previewHtml: string;
  }>,
  metaMultiVariant: unknown,
): Promise<void> {
  const finalDir = join(outputDir, clientId);
  const tmpDir = join(outputDir, `${clientId}.tmp-${Date.now()}`);

  // Validate metadata + all variant payloads
  validateOrThrow(validators.metaMultiVariant, metaMultiVariant, "meta-multi-variant");
  for (const variant of variants) {
    validateOrThrow(validators.tokens, variant.tokens, `variant-${variant.id}.tokens`);
    validateOrThrow(validators.sections, variant.sections, `variant-${variant.id}.sections`);
    validateOrThrow(validators.content, variant.content, `variant-${variant.id}.content`);
  }

  // Write all variants in parallel
  await fs.mkdir(join(tmpDir, "variants"), { recursive: true });
  await Promise.all(variants.map(async (v) => {
    const variantDir = join(tmpDir, "variants", `${v.id}-${v.label.toLowerCase()}`);
    await fs.mkdir(variantDir, { recursive: true });
    await Promise.all([
      fs.writeFile(join(variantDir, "tokens.json"), JSON.stringify(v.tokens, null, 2)),
      fs.writeFile(join(variantDir, "sections.json"), JSON.stringify(v.sections, null, 2)),
      fs.writeFile(join(variantDir, "content.json"), JSON.stringify(v.content, null, 2)),
      fs.writeFile(join(variantDir, "design-system.md"), v.designSystemMd),
      fs.writeFile(join(variantDir, "preview.html"), v.previewHtml),
    ]);
  }));

  // Meta-multi-variant.json at root
  await fs.writeFile(join(tmpDir, "meta-multi-variant.json"), JSON.stringify(metaMultiVariant, null, 2));

  // Remove existing + rename atomically
  try { await fs.rm(finalDir, { recursive: true }); } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
  await fs.rename(tmpDir, finalDir);

  // NOTE: No .complete flag yet — written AFTER user picks variant via promote flow
}

export async function promotePickedVariant(
  outputDir: string,
  clientId: string,
  variantId: 1 | 2 | 3,
  variantLabel: "Conservative" | "Modern" | "Bold",
): Promise<void> {
  const clientDir = join(outputDir, clientId);
  const variantDir = join(clientDir, "variants", `${variantId}-${variantLabel.toLowerCase()}`);

  // Copy variant files to top-level
  await Promise.all([
    fs.copyFile(join(variantDir, "tokens.json"), join(clientDir, "tokens.json")),
    fs.copyFile(join(variantDir, "sections.json"), join(clientDir, "sections.json")),
    fs.copyFile(join(variantDir, "content.json"), join(clientDir, "content.json")),
    fs.copyFile(join(variantDir, "design-system.md"), join(clientDir, "design-system.md")),
    fs.copyFile(join(variantDir, "preview.html"), join(clientDir, "preview.html")),
  ]);

  // Update meta-multi-variant.json z selection
  const metaPath = join(clientDir, "meta-multi-variant.json");
  const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
  meta.selectedVariant = variantId;
  meta.userPick = variantId;
  meta.userPickedAt = new Date().toISOString();
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

  // Write .complete flag LAST
  await fs.writeFile(join(clientDir, ".complete"), "");
}
```

## Validation gates

Schema validation MUST pass przed write. NIE bypass even gdy "looks correct":

```typescript
// ❌ DON'T
await fs.writeFile("tokens.json", JSON.stringify(tokens));   // skips validation

// ✅ DO
validateOrThrow(validators.tokens, tokens, "tokens");
await fs.writeFile("tokens.json", JSON.stringify(tokens, null, 2));
```

Reason: downstream `@roduq/cli` w roduq-web-starter assumes schemas valid. Invalid output corrupts Payload CMS seed.

## Forward compatibility

`removeAdditional: false` w ajv config — preserves unknown properties. Enables:
- New optional fields (e.g., `tokens.color.glow`) ignored by v1 consumer, picked up by v2 consumer
- Migration period 6-12 months gdy major version bumps planned

Breaking changes (v1 → v2) require:
1. New schema files w `schemas/v2/`
2. `@roduq/cli` migration helper that detects `$schema` URL and adapts
3. Sunset v1 schemas after deprecation window

## Testing

Phase 7 will add Vitest test suite:

```typescript
import { validators } from "./validators";
import tokensExample from "../examples/tokens.example.json";
import sectionsExample from "../examples/sections.example.json";
// ...

describe("Roduq Schemas v1", () => {
  it("tokens.example.json validates against tokens.schema.json", () => {
    expect(validators.tokens(tokensExample)).toBe(true);
  });

  it("rejects tokens missing required `tokens` field", () => {
    const invalid = { ...tokensExample, tokens: undefined };
    expect(validators.tokens(invalid)).toBe(false);
  });

  // ... per schema
});
```

## Polish character handling

Schemas allow full UTF-8 (no character restrictions w content strings). Roduq skills MUST produce Polish content z diacritics (ą/ć/ę/ł/ń/ó/ś/ź/ż) intact.

Test phrase used dla verification: **"Łódź żółw pięć słów"** — gdy renders OK across consumed surfaces (Payload CMS, browser preview, exported HTML), Polish support confirmed.

## Cross-repo contract

These schemas are the CONTRACT between roduq-design-generator-studio (producer) and roduq-web-starter (consumer via @roduq/cli). Breaking changes require coordinated PR across both repos.

Patrz `.docs/BRIDGE.md` dla full file protocol context.

## Powiązane

- `.cursor/rules/004-file-protocol.mdc` — operational rule
- `.docs/BRIDGE.md` — cross-repo architecture
- `.docs/IMPLEMENTATION.md § Phase 5` — Phase 5 lessons learned
- `skills/multi-variant/references/parallel-execution.md` — multi-variant integration
- [JSON Schema Draft 7](https://json-schema.org/draft-07/schema)
- [ajv](https://ajv.js.org/) — recommended validator
