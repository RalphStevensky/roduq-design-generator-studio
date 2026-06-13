import type { ChatMessage, CompleteOptions, CompleteResult, LLMProvider } from "../types.js";
import { chunkString, estimateTokens } from "../lib/tokenCount.js";

export type MockResponder = (
  messages: ReadonlyArray<ChatMessage>,
  options?: CompleteOptions,
) => string;

export interface MockProviderConfig {
  readonly defaultModel?: string;
  /** Custom responder. Default: echo last user message, or "{}" when responseSchema is set. */
  readonly respond?: MockResponder;
}

const defaultRespond: MockResponder = (messages, options) => {
  if (options?.responseSchema !== undefined) return "{}";
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m !== undefined && m.role === "user") return `MOCK: ${m.content}`;
  }
  return "MOCK";
};

/** Deterministic provider for CI/dev (no API key). Configurable responder for runner tests. */
export class MockProvider implements LLMProvider {
  readonly name = "mock";
  readonly defaultModel: string;
  private readonly respond: MockResponder;

  constructor(config: MockProviderConfig = {}) {
    this.defaultModel = config.defaultModel ?? "mock-1";
    this.respond = config.respond ?? defaultRespond;
  }

  async complete(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): Promise<CompleteResult> {
    const content = this.respond(messages, options);
    const promptText = messages.map((m) => m.content).join("\n") + (options?.system ?? "");
    const inputTokens = estimateTokens(promptText);
    const outputTokens = estimateTokens(content);
    return {
      content,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      model: options?.model ?? this.defaultModel,
      stopReason: "end_turn",
    };
  }

  async *stream(
    messages: ReadonlyArray<ChatMessage>,
    options?: CompleteOptions,
  ): AsyncIterable<string> {
    const content = this.respond(messages, options);
    for (const chunk of chunkString(content, 32)) {
      yield chunk;
    }
  }

  countTokens(text: string): number {
    return estimateTokens(text);
  }
}
