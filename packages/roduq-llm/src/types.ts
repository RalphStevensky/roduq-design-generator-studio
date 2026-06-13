/**
 * @roduq/llm — public types.
 *
 * Provider-agnostic completion abstraction. Each provider (Anthropic, OpenAI,
 * Gemini, Mock) implements `LLMProvider` — callers switch providers via config
 * (env) without touching call sites. No vendor lock-in (rule 007).
 */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  readonly role: ChatRole;
  readonly content: string;
}

/** Structured-output request — each provider maps to its native JSON mode. */
export interface ResponseSchema {
  /** Schema name (Anthropic tool name / OpenAI json_schema name). */
  readonly name: string;
  /** JSON Schema object the response MUST conform to. */
  readonly schema: Record<string, unknown>;
}

export interface CompleteOptions {
  /** Provider-specific model id (e.g. "claude-sonnet-4-6", "gpt-5", "gemini-3-flash-preview"). Defaults to provider.defaultModel. */
  readonly model?: string;
  /** 0.0–1.0. Lower = deterministic. Provider default when omitted. */
  readonly temperature?: number;
  /** Max output tokens. Provider default when omitted. */
  readonly maxTokens?: number;
  /** System / instruction prompt (stable prefix — cached when `cache` set). */
  readonly system?: string;
  /** Request structured JSON output conforming to a schema. */
  readonly responseSchema?: ResponseSchema;
  /** Enable prompt caching on the stable prefix (system) where the provider supports it. */
  readonly cache?: boolean;
  /** Abort signal — caller can cancel a long call. */
  readonly abortSignal?: AbortSignal;
}

export interface CompleteResult {
  /** Full response text. For structured output: the JSON string (caller parses + ajv-validates). */
  readonly content: string;
  /** Prompt (input) tokens. */
  readonly inputTokens: number;
  /** Response (output) tokens. */
  readonly outputTokens: number;
  /** input + output. */
  readonly totalTokens: number;
  /** Cached input tokens (prompt caching), when reported by the provider. */
  readonly cachedInputTokens?: number;
  /** Model actually used (echoed for logging). */
  readonly model: string;
  /** Provider stop reason (normalized where practical). */
  readonly stopReason?: string;
}

export interface LLMProvider {
  /** Provider key for logging + telemetry. */
  readonly name: string;
  /** Default model id for quick-start. */
  readonly defaultModel: string;

  /** Non-streaming completion — returns full response + usage. Primary path for structured JSON generation. */
  complete(messages: ReadonlyArray<ChatMessage>, options?: CompleteOptions): Promise<CompleteResult>;

  /** Streaming completion — yields incremental text chunks. */
  stream(messages: ReadonlyArray<ChatMessage>, options?: CompleteOptions): AsyncIterable<string>;

  /** Rough token estimate (provider-agnostic heuristic; real tokenizer is a later refinement). */
  countTokens(text: string): number;
}
