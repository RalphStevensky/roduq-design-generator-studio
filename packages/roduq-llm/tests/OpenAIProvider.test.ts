import { describe, expect, it } from "vitest";
import {
  OpenAIProvider,
  type OpenAILike,
  type OpenAIResponse,
} from "../src/providers/OpenAIProvider.js";

describe("OpenAIProvider", () => {
  it("maps responseSchema → json_schema strict:false, system via options, drops system-role, threads signal", async () => {
    let captured: Record<string, unknown> = {};
    let capturedOpts: { signal?: AbortSignal } | undefined;
    const sdk: OpenAILike = {
      chat: {
        completions: {
          create: async (
            params: Record<string, unknown>,
            options?: { signal?: AbortSignal },
          ): Promise<OpenAIResponse> => {
            captured = params;
            capturedOpts = options;
            return {
              choices: [{ message: { content: '{"ok":1}' }, finish_reason: "stop" }],
              usage: {
                prompt_tokens: 120,
                completion_tokens: 30,
                total_tokens: 150,
                prompt_tokens_details: { cached_tokens: 100 },
              },
            };
          },
        },
      },
    };
    const ac = new AbortController();
    const p = new OpenAIProvider({ sdk });
    const res = await p.complete(
      [
        { role: "system", content: "SHOULD_BE_DROPPED" },
        { role: "user", content: "x" },
      ],
      { system: "S", responseSchema: { name: "bundle", schema: { type: "object" } }, abortSignal: ac.signal },
    );

    expect(res.content).toBe('{"ok":1}');
    expect(res.inputTokens).toBe(120);
    expect(res.cachedInputTokens).toBe(100);
    expect(res.stopReason).toBe("stop");

    const rf = captured["response_format"] as { type: string; json_schema: { strict: boolean } };
    expect(rf.type).toBe("json_schema");
    expect(rf.json_schema.strict).toBe(false); // ajv is the real enforcement

    const msgs = captured["messages"] as Array<{ role: string; content: string }>;
    expect(msgs.filter((m) => m.role === "system").length).toBe(1); // only options.system
    expect(msgs[0]?.content).toBe("S");
    expect(capturedOpts?.signal).toBe(ac.signal);
  });
});
