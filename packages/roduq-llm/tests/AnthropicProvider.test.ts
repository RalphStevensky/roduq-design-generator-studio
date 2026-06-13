import { describe, expect, it } from "vitest";
import {
  AnthropicProvider,
  type AnthropicLike,
  type AnthropicMessageResponse,
} from "../src/providers/AnthropicProvider.js";

function fakeSdk(impl: (params: Record<string, unknown>) => AnthropicMessageResponse): {
  sdk: AnthropicLike;
  params: () => Record<string, unknown>;
  opts: () => { signal?: AbortSignal } | undefined;
} {
  let lastParams: Record<string, unknown> = {};
  let lastOpts: { signal?: AbortSignal } | undefined;
  const sdk: AnthropicLike = {
    messages: {
      create: async (params: Record<string, unknown>, options?: { signal?: AbortSignal }) => {
        lastParams = params;
        lastOpts = options;
        return impl(params);
      },
    },
  };
  return { sdk, params: () => lastParams, opts: () => lastOpts };
}

describe("AnthropicProvider", () => {
  it("maps responseSchema → forced tool use, returns tool input JSON, threads abortSignal", async () => {
    const { sdk, params, opts } = fakeSdk(() => ({
      content: [{ type: "tool_use", name: "bundle", input: { primary: "#275445" } }],
      usage: { input_tokens: 100, output_tokens: 50 },
      stop_reason: "tool_use",
    }));
    const ac = new AbortController();
    const p = new AnthropicProvider({ sdk });
    const res = await p.complete([{ role: "user", content: "gen" }], {
      system: "SKILL",
      responseSchema: { name: "bundle", schema: { type: "object" } },
      cache: true,
      abortSignal: ac.signal,
    });

    expect(JSON.parse(res.content).primary).toBe("#275445");
    expect(res.totalTokens).toBe(150);
    expect(res.stopReason).toBe("tool_use");
    expect((params()["tool_choice"] as { name: string }).name).toBe("bundle");
    expect(Array.isArray(params()["system"])).toBe(true); // cache → block array
    expect(opts()?.signal).toBe(ac.signal);
  });

  it("throws (not silent empty) when forced tool-use returns no tool_use (refusal)", async () => {
    const { sdk } = fakeSdk(() => ({
      content: [{ type: "text", text: "I can't help with that." }],
      usage: { input_tokens: 10, output_tokens: 5 },
      stop_reason: "refusal",
    }));
    const p = new AnthropicProvider({ sdk });
    await expect(
      p.complete([{ role: "user", content: "x" }], {
        responseSchema: { name: "bundle", schema: { type: "object" } },
      }),
    ).rejects.toThrow(/structured output/i);
  });

  it("concatenates text + reports cached tokens when no responseSchema", async () => {
    const { sdk } = fakeSdk(() => ({
      content: [
        { type: "text", text: "Hello " },
        { type: "text", text: "world" },
      ],
      usage: { input_tokens: 10, output_tokens: 2, cache_read_input_tokens: 8 },
      stop_reason: "end_turn",
    }));
    const p = new AnthropicProvider({ sdk });
    const res = await p.complete([{ role: "user", content: "hi" }], { system: "S" });
    expect(res.content).toBe("Hello world");
    expect(res.cachedInputTokens).toBe(8);
  });
});
