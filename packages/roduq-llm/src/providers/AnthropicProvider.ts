import type { ChatMessage, CompleteOptions, CompleteResult, LLMProvider } from "../types.js";
import { chunkString, estimateTokens } from "../lib/tokenCount.js";

/** Minimal structural shape of @anthropic-ai/sdk we call (injected — keeps adapter testable without the SDK). */
export interface AnthropicContentBlock {
  readonly type: string;
  readonly text?: string;
  readonly name?: string;
  readonly input?: unknown;
}
export interface AnthropicMessageResponse {
  readonly content: ReadonlyArray<AnthropicContentBlock>;
  readonly usage: {
    readonly input_tokens: number;
    readonly output_tokens: number;
    readonly cache_read_input_tokens?: number;
  };
  readonly stop_reason?: string | null;
}
export interface AnthropicRequestOptions {
  readonly signal?: AbortSignal;
}
export interface AnthropicLike {
  readonly messages: {
    create(
      params: Record<string, unknown>,
      options?: AnthropicRequestOptions,
    ): Promise<AnthropicMessageResponse>;
  };
}

export interface AnthropicProviderConfig {
  readonly sdk: AnthropicLike;
  readonly defaultModel?: string;
  readonly defaultMaxTokens?: number;
}

/**
 * Anthropic adapter. Structured output via forced tool-use (portable across SDK
 * versions); prompt caching via cache_control on the system block when `cache` set.
 */
export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic";
  readonly defaultModel: string;
  private readonly sdk: AnthropicLike;
  private readonly defaultMaxTokens: number;

  constructor(config: AnthropicProviderConfig) {
    this.sdk = config.sdk;
    this.defaultModel = config.defaultModel ?? "claude-sonnet-4-6";
    this.defaultMaxTokens = config.defaultMaxTokens ?? 8192;
  }

  async complete(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Promise<CompleteResult> {
    const params = this.buildParams(messages, options);
    const res = await this.sdk.messages.create(
      params,
      options?.abortSignal !== undefined ? { signal: options.abortSignal } : undefined,
    );
    const content = extractContent(res, options?.responseSchema?.name);
    const inputTokens = res.usage.input_tokens;
    const outputTokens = res.usage.output_tokens;
    const cached = res.usage.cache_read_input_tokens;
    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model: options?.model ?? this.defaultModel,
      ...(cached !== undefined ? { cachedInputTokens: cached } : {}),
      ...(res.stop_reason ? { stopReason: res.stop_reason } : {}),
    };
  }

  async *stream(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): AsyncIterable<string> {
    // v1: chunked replay of complete() — uniform + testable. True SSE streaming is a later refinement.
    const result = await this.complete(messages, options);
    for (const chunk of chunkString(result.content, 64)) yield chunk;
  }

  countTokens(text: string): number {
    return estimateTokens(text);
  }

  private buildParams(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Record<string, unknown> {
    const apiMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    const params: Record<string, unknown> = {
      model: options?.model ?? this.defaultModel,
      max_tokens: options?.maxTokens ?? this.defaultMaxTokens,
      messages: apiMessages,
    };
    if (options?.temperature !== undefined) params["temperature"] = options.temperature;
    if (options?.system !== undefined) {
      params["system"] =
        options.cache === true
          ? [{ type: "text", text: options.system, cache_control: { type: "ephemeral" } }]
          : options.system;
    }
    if (options?.responseSchema !== undefined) {
      params["tools"] = [
        {
          name: options.responseSchema.name,
          description: "Return the result strictly matching the provided JSON schema.",
          input_schema: options.responseSchema.schema,
        },
      ];
      params["tool_choice"] = { type: "tool", name: options.responseSchema.name };
    }
    return params;
  }
}

function extractContent(res: AnthropicMessageResponse, toolName?: string): string {
  if (toolName !== undefined) {
    for (const block of res.content) {
      if (block.type === "tool_use" && block.name === toolName && block.input !== undefined) {
        return JSON.stringify(block.input);
      }
    }
    // Forced tool-use can still be skipped (refusal / max_tokens / pause_turn).
    // Returning text here would crash the caller's JSON.parse with no context.
    throw new Error(
      `AnthropicProvider: expected structured output via tool '${toolName}' but the model returned none (stop_reason=${res.stop_reason ?? "unknown"}).`,
    );
  }
  return res.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text ?? "")
    .join("");
}
