/**
 * Shared types dla @roduq/mcp-server.
 * Mirrors JSON Schema v1 definitions w schemas/ — kept structurally aligned manually
 * (Phase 7 may codegen these from schemas via json-schema-to-typescript).
 */

export type ClientId = string;        // kebab-case slug pattern ^[a-z0-9][a-z0-9-]*$

export type VariantId = 1 | 2 | 3;
export type VariantLabel = "Conservative" | "Modern" | "Bold";
export type VariantStatus = "complete" | "timeout" | "error" | "in-progress";

export interface DesignTokens {
  $schema: "https://roduq.dev/schemas/v1/tokens.schema.json";
  version: string;
  generatedAt: string;
  generatedBy?: string;
  sourcePrompt?: string;
  selectedVariant?: VariantId;
  _meta?: { preset?: string; category?: string; description?: string };
  tokens: {
    color: {
      surface: { default: string; raised: string; sunken: string; muted?: string; elevated?: string };
      ink: { primary: string; secondary: string; muted?: string; inverse?: string };
      outline: { subtle?: string; default: string; strong?: string };
      brand: { primary: string; secondary?: string; tertiary?: string };
      status?: { success?: string; warning?: string; danger?: string; info?: string };
      gradient?: Record<string, string>;
      glow?: Record<string, string>;
      pastel?: Record<string, string>;
    };
    font: { display: string; body: string; mono?: string };
    spacing: Record<string, string>;
    radii: Record<string, string>;
    fontSize?: Record<string, string>;
    lineHeight?: Record<string, number | string>;
    shadow?: Record<string, string>;
    container?: { sm?: string; md?: string; lg?: string };
    borderWidth?: Record<string, string>;
  };
}

export type BlockType =
  | "hero" | "social-proof" | "logos-grid" | "features" | "services"
  | "case-studies" | "stats" | "pricing" | "testimonials" | "faq" | "cta"
  | "menu-featured" | "menu-full" | "gallery" | "reservation" | "location"
  | "doctor-bio" | "booking" | "trust" | "listings-featured" | "neighborhoods"
  | "agents" | "market-insights" | "story" | "waitlist" | "work-grid"
  | "about" | "skills" | "contact" | "intro" | "process" | "team";

export interface Block {
  blockType: BlockType;
  variant?: string;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaPrimary?: CtaSpec;
  ctaSecondary?: CtaSpec;
  items?: unknown[];
  imageRef?: string;
  [key: string]: unknown;
}

export interface CtaSpec {
  label: string;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
}

export interface Sections {
  $schema: "https://roduq.dev/schemas/v1/sections.schema.json";
  version: string;
  homepage: { blocks: Block[] };
  pages?: Record<string, { blocks: Block[] }>;
}

export interface BilingualString {
  pl: string;
  en?: string;
}

export interface Content {
  $schema: "https://roduq.dev/schemas/v1/content.schema.json";
  version: string;
  siteSettings: {
    siteName: string;
    tagline: string;
    metaDescription?: string;
    language?: "pl" | "en" | "pl-en";
    footer?: {
      copyright?: string;
      socialLinks?: Array<{ platform: string; url: string }>;
      address?: string;
      nip?: string;
      regon?: string;
    };
  };
  draftCopy: Record<string, BilingualString>;
  imagePrompts?: Record<string, string>;
}

export interface SingleMeta {
  $schema: "https://roduq.dev/schemas/v1/meta.schema.json";
  version: string;
  type: "single";
  clientId: ClientId;
  generatedAt: string;
  skill: string;
  prompt: string;
  variant?: VariantId;
  variantLabel?: VariantLabel;
  preset?: string;
  llmProvider?: "anthropic" | "openai" | "gemini" | "mock";
  model?: string;
  executionTimeMs?: number;
  tokensUsed?: { input?: number; output?: number; cached?: number };
  estimatedCostUsd?: number;
  schemaVersions?: { tokens?: string; sections?: string; content?: string };
}

export interface VariantEntry {
  id: VariantId;
  label: VariantLabel;
  preset: string;
  presetSource?: "matrix" | "user-override";
  presetDefault?: string;
  status: VariantStatus;
  executionTimeMs?: number;
  tokensUsed?: { input?: number; output?: number };
  tokensCount?: number;
  sectionsCount?: number;
  contentKeys?: number;
  error?: { code: string; message: string };
}

export interface MultiVariantMeta {
  $schema: "https://roduq.dev/schemas/v1/meta-multi-variant.schema.json";
  version: string;
  type: "multi-variant";
  clientId: ClientId;
  generatedAt: string;
  industrySkill: string;
  skill: "multi-variant";
  prompt: string;
  executionTimeMs?: number;
  totalTokensUsed?: { input?: number; output?: number };
  totalCostUsd?: number;
  variants: [VariantEntry, VariantEntry, VariantEntry];
  selectedVariant: VariantId | null;
  userPick: VariantId | null;
  userPickedAt: string | null;
  regenerations?: Array<{
    variantId: VariantId;
    regeneratedAt: string;
    hint: string;
    executionTimeMs?: number;
  }>;
}

export type ProjectMeta = SingleMeta | MultiVariantMeta;

export interface DesignStateSingle {
  clientId: ClientId;
  status: "complete" | "in-progress" | "error";
  type: "single";
  meta: SingleMeta;
  tokens: DesignTokens;
  sections: Sections;
  content: Content;
  designSystemMd: string;
}

export interface DesignStateMultiVariant {
  clientId: ClientId;
  status: "complete" | "in-progress" | "error";
  type: "multi-variant";
  meta: MultiVariantMeta;
  // top-level files only present if user already picked variant
  tokens?: DesignTokens;
  sections?: Sections;
  content?: Content;
  designSystemMd?: string;
  // all 3 variants' artifacts:
  variants: Array<{
    id: VariantId;
    label: VariantLabel;
    preset: string;
    status: VariantStatus;
    tokens?: DesignTokens;
    sections?: Sections;
    content?: Content;
    designSystemMd?: string;
  }>;
}

export type DesignState = DesignStateSingle | DesignStateMultiVariant;

export class MCPServerError extends Error {
  override readonly name = "MCPServerError";
  constructor(
    message: string,
    readonly code:
      | "CLIENT_NOT_FOUND"
      | "GENERATION_IN_PROGRESS"
      | "INVALID_INPUT"
      | "VARIANT_NOT_FOUND"
      | "VARIANT_NOT_COMPLETE"
      | "VALIDATION_FAILED"
      | "FS_ERROR"
      | "UNSUPPORTED_OPERATION"
      | "INTERNAL_ERROR",
    readonly cause?: unknown,
  ) {
    super(message);
    if (cause !== undefined) {
      // Preserve cause chain dla Node 20+ Error.cause support
      Object.defineProperty(this, "cause", { value: cause, enumerable: false });
    }
  }
}
