/**
 * Env-driven router wiring — "choose the model by config, supply the matching key".
 *
 * Registers MockProvider always, plus every provider whose API key is present.
 * Default = LLM_PROVIDER, else first available real provider. SDKs are loaded
 * lazily (dynamic import) and cast at the boundary so the build does not depend
 * on the SDKs' internal types (only that they resolve). No vendor lock-in (rule 007).
 *
 *   LLM_PROVIDER=anthropic|openai|gemini|mock
 *   ANTHROPIC_API_KEY=...   OPENAI_API_KEY=...   GEMINI_API_KEY=... (or GOOGLE_API_KEY)
 */

import { LLMRouter } from "./router.js";
import { MockProvider } from "./providers/MockProvider.js";
import { AnthropicProvider, type AnthropicLike } from "./providers/AnthropicProvider.js";
import { OpenAIProvider, type OpenAILike } from "./providers/OpenAIProvider.js";
import { GeminiProvider, type GeminiLike } from "./providers/GeminiProvider.js";

export interface EnvLike {
  readonly [key: string]: string | undefined;
}

export async function createRouterFromEnv(env: EnvLike = process.env): Promise<LLMRouter> {
  const router = new LLMRouter();
  router.register("mock", new MockProvider());

  const anthropicKey = env["ANTHROPIC_API_KEY"];
  if (anthropicKey !== undefined && anthropicKey !== "") {
    try {
      // SDK boundary: structural cast keeps the build free of SDK-internal types.
      const mod = (await import("@anthropic-ai/sdk")) as unknown as {
        default: new (opts: { apiKey: string }) => AnthropicLike;
      };
      router.register(
        "anthropic",
        new AnthropicProvider({
          sdk: new mod.default({ apiKey: anthropicKey }),
          ...modelOpt(env["ANTHROPIC_MODEL"]),
        }),
      );
    } catch (err) {
      warn("anthropic", err);
    }
  }

  const openaiKey = env["OPENAI_API_KEY"];
  if (openaiKey !== undefined && openaiKey !== "") {
    try {
      const mod = (await import("openai")) as unknown as {
        default: new (opts: { apiKey: string }) => OpenAILike;
      };
      router.register(
        "openai",
        new OpenAIProvider({
          sdk: new mod.default({ apiKey: openaiKey }),
          ...modelOpt(env["OPENAI_MODEL"]),
        }),
      );
    } catch (err) {
      warn("openai", err);
    }
  }

  const geminiKey = env["GEMINI_API_KEY"] ?? env["GOOGLE_API_KEY"];
  if (geminiKey !== undefined && geminiKey !== "") {
    try {
      const mod = (await import("@google/genai")) as unknown as {
        GoogleGenAI: new (opts: { apiKey: string }) => GeminiLike;
      };
      router.register(
        "gemini",
        new GeminiProvider({
          sdk: new mod.GoogleGenAI({ apiKey: geminiKey }),
          ...modelOpt(env["GEMINI_MODEL"]),
        }),
      );
    } catch (err) {
      warn("gemini", err);
    }
  }

  const preferred = env["LLM_PROVIDER"];
  if (preferred !== undefined && preferred !== "") {
    if (!router.has(preferred)) {
      // Fail loud — an explicitly requested provider silently demoting to mock/
      // another provider is the "worked in CI, garbage in prod" trap.
      throw new Error(
        `LLM_PROVIDER='${preferred}' requested but unavailable (missing API key or SDK). Registered: ${router.list().join(", ")}.`,
      );
    }
    router.setDefault(preferred);
  } else if (router.has("anthropic")) {
    router.setDefault("anthropic");
  } else if (router.has("openai")) {
    router.setDefault("openai");
  } else if (router.has("gemini")) {
    router.setDefault("gemini");
  }

  return router;
}

function warn(provider: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`[@roduq/llm] provider '${provider}' unavailable: ${message}\n`);
}

/** Optional per-provider model override from env (e.g. GEMINI_MODEL=gemini-3-flash-preview). */
function modelOpt(value: string | undefined): { defaultModel: string } | Record<string, never> {
  return value !== undefined && value !== "" ? { defaultModel: value } : {};
}
