/**
 * @roduq/llm — provider-agnostic LLM layer.
 *
 * Public surface: interface + router + 4 adapters (Mock/Anthropic/OpenAI/Gemini)
 * + env-driven wiring. Callers depend only on LLMProvider — model is chosen by config.
 */

export type {
  ChatRole,
  ChatMessage,
  ResponseSchema,
  CompleteOptions,
  CompleteResult,
  LLMProvider,
} from "./types.js";

export { LLMRouter } from "./router.js";
export { estimateTokens, chunkString } from "./lib/tokenCount.js";

export { MockProvider } from "./providers/MockProvider.js";
export type { MockProviderConfig, MockResponder } from "./providers/MockProvider.js";

export { AnthropicProvider } from "./providers/AnthropicProvider.js";
export type {
  AnthropicProviderConfig,
  AnthropicLike,
  AnthropicMessageResponse,
  AnthropicContentBlock,
} from "./providers/AnthropicProvider.js";

export { OpenAIProvider } from "./providers/OpenAIProvider.js";
export type {
  OpenAIProviderConfig,
  OpenAILike,
  OpenAIResponse,
  OpenAIChoice,
} from "./providers/OpenAIProvider.js";

export { GeminiProvider } from "./providers/GeminiProvider.js";
export type { GeminiProviderConfig, GeminiLike, GeminiResponse } from "./providers/GeminiProvider.js";

export { createRouterFromEnv } from "./config.js";
export type { EnvLike } from "./config.js";
