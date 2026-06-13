import { describe, expect, it } from "vitest";
import {
  GeminiProvider,
  type GeminiLike,
  type GeminiStreamChunk,
} from "../src/providers/GeminiProvider.js";

describe("GeminiProvider (streaming)", () => {
  it("accumulates streamed chunks, maps responseJsonSchema (definitions→$defs), assistant→model, usage", async () => {
    let captured: Record<string, unknown> = {};
    const sdk: GeminiLike = {
      models: {
        generateContentStream: async (
          params: Record<string, unknown>,
        ): Promise<AsyncIterable<GeminiStreamChunk>> => {
          captured = params;
          return (async function* () {
            yield { text: '{"ok":' };
            yield {
              text: "true}",
              usageMetadata: {
                promptTokenCount: 200,
                candidatesTokenCount: 40,
                totalTokenCount: 415,
                cachedContentTokenCount: 50,
              },
              candidates: [{ finishReason: "STOP" }],
            };
          })();
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

    expect(res.content).toBe('{"ok":true}'); // accumulated across chunks
    expect(res.inputTokens).toBe(200);
    expect(res.outputTokens).toBe(40);
    expect(res.totalTokens).toBe(415); // thinking included
    expect(res.cachedInputTokens).toBe(50);
    expect(res.stopReason).toBe("STOP");

    const cfg = captured["config"] as Record<string, unknown>;
    expect(cfg["responseMimeType"]).toBe("application/json");
    expect((cfg["thinkingConfig"] as { thinkingBudget: number }).thinkingBudget).toBe(0);
    // sanitizer inlines $ref and drops $defs/$schema/unsupported keywords
    const rjs = cfg["responseJsonSchema"] as { properties: { a: { type: string } } };
    expect(rjs.properties.a.type).toBe("string");
    const rjsText = JSON.stringify(rjs);
    expect(rjsText).not.toContain("$ref");
    expect(rjsText).not.toContain("$defs");
    expect(rjsText).not.toContain("$schema");
    expect(cfg["responseSchema"]).toBeUndefined();
    expect(cfg["systemInstruction"]).toBe("S");
    expect(cfg["abortSignal"]).toBe(ac.signal);

    const contents = captured["contents"] as Array<{ role: string }>;
    expect(contents[1]?.role).toBe("model");
  });

  it("stream() yields incremental text chunks", async () => {
    const sdk: GeminiLike = {
      models: {
        generateContentStream: async (): Promise<AsyncIterable<GeminiStreamChunk>> =>
          (async function* () {
            yield { text: "Zarezerwuj " };
            yield { text: "tee time" };
          })(),
      },
    };
    const p = new GeminiProvider({ sdk });
    let assembled = "";
    let chunks = 0;
    for await (const c of p.stream([{ role: "user", content: "x" }])) {
      assembled += c;
      chunks++;
    }
    expect(assembled).toBe("Zarezerwuj tee time");
    expect(chunks).toBe(2);
  });
});
