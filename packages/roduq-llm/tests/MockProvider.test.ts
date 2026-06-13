import { describe, expect, it } from "vitest";
import { MockProvider } from "../src/providers/MockProvider.js";

describe("MockProvider", () => {
  it("echoes last user message + counts tokens", async () => {
    const p = new MockProvider();
    const res = await p.complete([
      { role: "system", content: "sys" },
      { role: "user", content: "hello world" },
    ]);
    expect(res.content).toBe("MOCK: hello world");
    expect(res.outputTokens).toBeGreaterThan(0);
    expect(res.totalTokens).toBe(res.inputTokens + res.outputTokens);
    expect(res.model).toBe("mock-1");
  });

  it("returns {} for structured output by default", async () => {
    const p = new MockProvider();
    const res = await p.complete([{ role: "user", content: "x" }], {
      responseSchema: { name: "t", schema: { type: "object" } },
    });
    expect(res.content).toBe("{}");
  });

  it("uses a custom responder (runner injects canned JSON)", async () => {
    const p = new MockProvider({ respond: () => '{"ok":true}' });
    const res = await p.complete([{ role: "user", content: "x" }], {
      responseSchema: { name: "t", schema: { type: "object" } },
    });
    expect(JSON.parse(res.content).ok).toBe(true);
  });

  it("streams in multiple chunks", async () => {
    const p = new MockProvider({ respond: () => "a".repeat(80) });
    let assembled = "";
    let chunks = 0;
    for await (const c of p.stream([{ role: "user", content: "x" }])) {
      assembled += c;
      chunks++;
    }
    expect(assembled).toBe("a".repeat(80));
    expect(chunks).toBeGreaterThan(1);
  });
});
