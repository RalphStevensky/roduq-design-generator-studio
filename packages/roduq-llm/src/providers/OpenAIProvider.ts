import type { ChatMessage, CompleteOptions, CompleteResult, LLMProvider } from "../types.js";
import { chunkString, estimateTokens } from "../lib/tokenCount.js";

/** Minimal structural shape of the openai SDK we call (injected). */
export interface OpenAIChoice {
  readonly message: { readonly content: string | null };
  readonly finish_reason?: string | null;
}
export interface OpenAIResponse {
  readonly choices: ReadonlyArray<OpenAIChoice>;
  readonly usage?: {
    readonly prompt_tokens: number;
    readonly completion_tokens: number;
    readonly total_tokens: number;
    readonly prompt_tokens_details?: { readonly cached_tokens?: number };
  };
}
export interface OpenAIRequestOptions {
  readonly signal?: AbortSignal;
}
export interface OpenAILike {
  readonly chat: {
    readonly completions: {
      create(
        params: Record<string, unknown>,
        options?: OpenAIRequestOptions,
      ): Promise<OpenAIResponse>;
    };
  };
}

export interface OpenAIProviderConfig {
  readonly sdk: OpenAILike;
  readonly defaultModel?: string;
  readonly defaultMaxTokens?: number;
}

/** OpenAI adapter. Structured output via response_format json_schema (strict). */
export class OpenAIProvider implements LLMProvider {
  readonly name = "openai";
  readonly defaultModel: string;
  private readonly sdk: OpenAILike;
  private readonly defaultMaxTokens: number;

  constructor(config: OpenAIProviderConfig) {
    this.sdk = config.sdk;
    this.defaultModel = config.defaultModel ?? "gpt-5";
    this.defaultMaxTokens = config.defaultMaxTokens ?? 8192;
  }

  async complete(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Promise<CompleteResult> {
    const model = options?.model ?? this.defaultModel;
    const apiMessages: Array<{ role: string; content: string }> = [];
    if (options?.system !== undefined) apiMessages.push({ role: "system", content: options.system });
    // System prompt only via options.system — drop system-role messages so all
    // three providers treat the system prompt identically.
    for (const m of messages) {
      if (m.role === "system") continue;
      apiMessages.push({ role: m.role, content: m.content });
    }

    const params: Record<string, unknown> = {
      model,
      messages: apiMessages,
      max_completion_tokens: options?.maxTokens ?? this.defaultMaxTokens,
    };
    if (options?.temperature !== undefined) params["temperature"] = options.temperature;
    if (options?.responseSchema !== undefined) {
      // strict:false — OpenAI strict mode rejects optional props + keywords
      // (pattern/format/minLength/minItems/…) that our ajv schemas use, so it
      // would 400. ajv post-validation is the real enforcement; this is guidance.
      params["response_format"] = {
        type: "json_schema",
        json_schema: {
          name: options.responseSchema.name,
          schema: options.responseSchema.schema,
          strict: false,
        },
      };
    }

    const res = await this.sdk.chat.completions.create(
      params,
      options?.abortSignal !== undefined ? { signal: options.abortSignal } : undefined,
    );
    const first = res.choices[0];
    const content = first?.message.content ?? "";
    const inputTokens =
      res.usage?.prompt_tokens ?? estimateTokens(apiMessages.map((m) => m.content).join("\n"));
    const outputTokens = res.usage?.completion_tokens ?? estimateTokens(content);
    const cached = res.usage?.prompt_tokens_details?.cached_tokens;
    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: res.usage?.total_tokens ?? inputTokens + outputTokens,
      model,
      ...(cached !== undefined ? { cachedInputTokens: cached } : {}),
      ...(first?.finish_reason ? { stopReason: first.finish_reason } : {}),
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
