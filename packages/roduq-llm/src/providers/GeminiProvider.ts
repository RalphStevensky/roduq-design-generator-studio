import type { ChatMessage, CompleteOptions, CompleteResult, LLMProvider } from "../types.js";
import { chunkString, estimateTokens } from "../lib/tokenCount.js";

/** Minimal structural shape of @google/genai we call (injected). */
export interface GeminiResponse {
  readonly text?: string;
  readonly usageMetadata?: {
    readonly promptTokenCount?: number;
    readonly candidatesTokenCount?: number;
    readonly totalTokenCount?: number;
    readonly cachedContentTokenCount?: number;
  };
  readonly candidates?: ReadonlyArray<{ readonly finishReason?: string }>;
}
export interface GeminiLike {
  readonly models: {
    generateContent(params: Record<string, unknown>): Promise<GeminiResponse>;
  };
}

export interface GeminiProviderConfig {
  readonly sdk: GeminiLike;
  readonly defaultModel?: string;
  readonly defaultMaxTokens?: number;
}

/**
 * Gemini adapter (@google/genai). Structured output via responseMimeType +
 * responseSchema; system prompt via systemInstruction; roles: assistant→model.
 */
export class GeminiProvider implements LLMProvider {
  readonly name = "gemini";
  readonly defaultModel: string;
  private readonly sdk: GeminiLike;
  private readonly defaultMaxTokens: number;

  constructor(config: GeminiProviderConfig) {
    this.sdk = config.sdk;
    this.defaultModel = config.defaultModel ?? "gemini-2.5-pro";
    this.defaultMaxTokens = config.defaultMaxTokens ?? 8192;
  }

  async complete(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Promise<CompleteResult> {
    const model = options?.model ?? this.defaultModel;
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
      config["responseJsonSchema"] = toGeminiJsonSchema(options.responseSchema.schema);
    }
    if (options?.abortSignal !== undefined) config["abortSignal"] = options.abortSignal;

    const res = await this.sdk.models.generateContent({ model, contents, config });
    const content = res.text ?? "";
    const inputTokens =
      res.usageMetadata?.promptTokenCount ??
      estimateTokens(messages.map((m) => m.content).join("\n"));
    const outputTokens = res.usageMetadata?.candidatesTokenCount ?? estimateTokens(content);
    const cached = res.usageMetadata?.cachedContentTokenCount;
    const finish = res.candidates?.[0]?.finishReason;
    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: res.usageMetadata?.totalTokenCount ?? inputTokens + outputTokens,
      model,
      ...(cached !== undefined ? { cachedInputTokens: cached } : {}),
      ...(finish !== undefined ? { stopReason: finish } : {}),
    };
  }

  async *stream(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): AsyncIterable<string> {
    const result = await this.complete(messages, options);
    for (const chunk of chunkString(result.content, 64)) yield chunk;
  }

  countTokens(text: string): number {
    return estimateTokens(text);
  }
}

/** Normalize a draft-07 JSON Schema for @google/genai `responseJsonSchema` (definitions→$defs). */
function toGeminiJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const rewritten = JSON.stringify(schema).replace(/#\/definitions\//g, () => "#/$defs/");
  const clone = JSON.parse(rewritten) as Record<string, unknown>;
  if ("definitions" in clone && !("$defs" in clone)) {
    clone["$defs"] = clone["definitions"];
    delete clone["definitions"];
  }
  delete clone["$schema"];
  return clone;
}
