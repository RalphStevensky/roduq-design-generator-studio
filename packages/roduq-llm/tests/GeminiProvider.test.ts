import { describe, expect, it } from "vitest";
import {
  GeminiProvider,
  type GeminiLike,
  type GeminiResponse,
} from "../src/providers/GeminiProvider.js";

describe("GeminiProvider", () => {
  it("maps to responseJsonSchema (definitions→$defs), systemInstruction, assistant→model, signal, usage", async () => {
    let captured: Record<string, unknown> = {};
    const sdk: GeminiLike = {
      models: {
        generateContent: async (params: Record<string, unknown>): Promise<GeminiResponse> => {
          captured = params;
          return {
            text: '{"ok":true}',
            usageMetadata: {
              promptTokenCount: 200,
              candidatesTokenCount: 40,
              totalTokenCount: 240,
              cachedContentTokenCount: 50,
            },
            candidates: [{ finishReason: "STOP" }],
          };
        },
      },
    };
    const ac = new AbortController();
    const p = new GeminiProvider({ sdk });
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: { a: { $ref: "#/definitions/A" } },
      definitions: { A: { type: "string" } },
    };
    const res = await p.complete(
      [
        { role: "user", content: "u" },
        { role: "assistant", content: "a" },
      ],
      { system: "S", responseSchema: { name: "bundle", schema }, abortSignal: ac.signal },
    );

    expect(res.content).toBe('{"ok":true}');
    expect(res.inputTokens).toBe(200);
    expect(res.cachedInputTokens).toBe(50);
    expect(res.stopReason).toBe("STOP");

    const cfg = captured["config"] as Record<string, unknown>;
    expect(cfg["responseMimeType"]).toBe("application/json");
    // raw JSON Schema → responseJsonSchema (NOT responseSchema), normalized to $defs
    const rjs = cfg["responseJsonSchema"] as Record<string, unknown>;
    expect("$defs" in rjs).toBe(true);
    expect("definitions" in rjs).toBe(false);
    expect("$schema" in rjs).toBe(false);
    expect(JSON.stringify(rjs)).toContain("#/$defs/A");
    expect(cfg["responseSchema"]).toBeUndefined();
    expect(cfg["systemInstruction"]).toBe("S");
    expect(cfg["abortSignal"]).toBe(ac.signal);

    const contents = captured["contents"] as Array<{ role: string }>;
    expect(contents[1]?.role).toBe("model");
  });
});
