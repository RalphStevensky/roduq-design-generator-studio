import type { ChatMessage, CompleteOptions, CompleteResult, LLMProvider } from "../types.js";
import { estimateTokens } from "../lib/tokenCount.js";

/** Minimal structural shape of @google/genai we call (injected). */
export interface GeminiUsageMetadata {
  readonly promptTokenCount?: number;
  readonly candidatesTokenCount?: number;
  readonly totalTokenCount?: number;
  readonly cachedContentTokenCount?: number;
}
export interface GeminiStreamChunk {
  readonly text?: string;
  readonly usageMetadata?: GeminiUsageMetadata;
  readonly candidates?: ReadonlyArray<{ readonly finishReason?: string }>;
}
export interface GeminiLike {
  readonly models: {
    /** Streaming call — returns an async iterable of response chunks. */
    generateContentStream(
      params: Record<string, unknown>,
    ): Promise<AsyncIterable<GeminiStreamChunk>>;
  };
}

export interface GeminiProviderConfig {
  readonly sdk: GeminiLike;
  readonly defaultModel?: string;
  readonly defaultMaxTokens?: number;
}

/**
 * Gemini adapter (@google/genai). Uses STREAMING (generateContentStream) so the
 * connection returns headers immediately — non-streaming generateContent waits for
 * the full (thinking + output) generation and trips undici's headers timeout.
 *
 * Structured output via responseMimeType + responseJsonSchema (raw JSON Schema,
 * definitions→$defs); system via systemInstruction; roles: assistant→model.
 */
export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  readonly defaultModel: string;
  private readonly sdk: GeminiLike;
  private readonly defaultMaxTokens: number;

  constructor(config: GeminiProviderConfig) {
    this.sdk = config.sdk;
    this.defaultModel = config.defaultModel ?? "gemini-3-flash-preview";
    this.defaultMaxTokens = config.defaultMaxTokens ?? 8192;
  }

  async complete(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Promise<CompleteResult> {
    const model = options?.model ?? this.defaultModel;
    const iterable = await this.sdk.models.generateContentStream(this.buildParams(messages, options));

    let text = "";
    let usage: GeminiUsageMetadata | undefined;
    let finish: string | undefined;
    for await (const chunk of iterable) {
      if (typeof chunk.text === "string") text += chunk.text;
      if (chunk.usageMetadata !== undefined) usage = chunk.usageMetadata;
      const fr = chunk.candidates?.[0]?.finishReason;
      if (fr !== undefined) finish = fr;
    }

    const inputTokens =
      usage?.promptTokenCount ?? estimateTokens(messages.map((m) => m.content).join("\n"));
    const outputTokens = usage?.candidatesTokenCount ?? estimateTokens(text);
    const cached = usage?.cachedContentTokenCount;
    return {
      content: text,
      inputTokens,
      outputTokens,
      totalTokens: usage?.totalTokenCount ?? inputTokens + outputTokens,
      model,
      ...(cached !== undefined ? { cachedInputTokens: cached } : {}),
      ...(finish !== undefined ? { stopReason: finish } : {}),
    };
  }

  async *stream(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): AsyncIterable<string> {
    const iterable = await this.sdk.models.generateContentStream(this.buildParams(messages, options));
    for await (const chunk of iterable) {
      if (typeof chunk.text === "string" && chunk.text.length > 0) yield chunk.text;
    }
  }

  countTokens(text: string): number {
    return estimateTokens(text);
  }

  private buildParams(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Record<string, unknown> {
    const contents = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const config: Record<string, unknown> = {
      maxOutputTokens: options?.maxTokens ?? this.defaultMaxTokens,
    };
    if (options?.temperature !== undefined) config["temperature"] = options.temperature;
    if (options?.system !== undefined) config["systemInstruction"] = options.system;
    if (options?.responseSchema !== undefined) {
      config["responseMimeType"] = "application/json";
      // @google/genai expects raw JSON Schema in `responseJsonSchema` (NOT
      // `responseSchema`, which is the OpenAPI-subset dialect). Normalize draft-07
      // `definitions`/`#/definitions` → `$defs`/`#/$defs` which it understands.
      config["responseJsonSchema"] = sanitizeForGemini(options.responseSchema.schema);
      // Disable thinking for structured JSON: thinking models (gemini-3-flash-preview)
      // otherwise spend the output budget on unbounded reasoning, truncating the JSON.
      config["thinkingConfig"] = { thinkingBudget: 0 };
    }
    if (options?.abortSignal !== undefined) config["abortSignal"] = options.abortSignal;

    return { model: options?.model ?? this.defaultModel, contents, config };
  }
}

const asObj = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

/**
 * Sanitize a draft-07 JSON Schema into a Gemini-friendly `responseJsonSchema`:
 * inline $refs, drop keywords Gemini rejects (pattern, format, additionalProperties,
 * minimum/maximum/minLength/$schema…), and collapse anyOf/oneOf/allOf to a single type. Producing a
 * concrete structural schema is what makes Gemini constrain output (an empty
 * {type:"object"} schema makes it degenerate into endless whitespace).
 */
function sanitizeForGemini(schema: Record<string, unknown>): Record<string, unknown> {
  const root = JSON.parse(JSON.stringify(schema)) as Record<string, unknown>;
  const defs: Record<string, unknown> = { ...asObj(root["definitions"]), ...asObj(root["$defs"]) };
  const KEEP = new Set([
    "type",
    "properties",
    "required",
    "items",
    "enum",
    "description",
    "nullable",
    "additionalProperties",
  ]);

  const inferType = (node: Record<string, unknown>): string => {
    const variants = [node["anyOf"], node["oneOf"], node["allOf"]].find((x) => Array.isArray(x));
    if (Array.isArray(variants)) {
      for (const v of variants) {
        const t = asObj(v)["type"];
        if (typeof t === "string") return t;
      }
    }
    return "string";
  };

  const walk = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(walk);
    if (input === null || typeof input !== "object") return input;
    const obj = input as Record<string, unknown>;

    const ref = obj["$ref"];
    if (typeof ref === "string") {
      const name = ref.replace(/^#\/(?:definitions|\$defs)\//, "");
      return name in defs ? walk(defs[name]) : { type: "string" };
    }
    if (obj["anyOf"] !== undefined || obj["oneOf"] !== undefined || obj["allOf"] !== undefined) {
      const explicitType = obj["type"];
      const collapsed: Record<string, unknown> = {
        type: typeof explicitType === "string" ? explicitType : inferType(obj),
      };
      const desc = obj["description"];
      if (typeof desc === "string") collapsed["description"] = desc;
      if (obj["enum"] !== undefined) collapsed["enum"] = obj["enum"];
      return collapsed;
    }

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!KEEP.has(k)) continue;
      if (k === "properties") {
        const props: Record<string, unknown> = {};
        for (const [pk, pv] of Object.entries(asObj(v))) props[pk] = walk(pv);
        out["properties"] = props;
      } else if (k === "items") {
        out["items"] = walk(v);
      } else if (k === "additionalProperties") {
        // Keep open-map value schemas (e.g. draftCopy → bilingualString) so the
        // model fills keys; drop boolean additionalProperties.
        if (v !== null && typeof v === "object" && !Array.isArray(v)) {
          out["additionalProperties"] = walk(v);
        }
      } else {
        out[k] = v;
      }
    }
    if (out["type"] === undefined && out["properties"] !== undefined) out["type"] = "object";
    return out;
  };

  return asObj(walk(root));
}
