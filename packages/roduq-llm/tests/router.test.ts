import { describe, expect, it } from "vitest";
import { LLMRouter } from "../src/router.js";
import { MockProvider } from "../src/providers/MockProvider.js";

describe("LLMRouter", () => {
  it("registers, picks by key, falls back to default then first", () => {
    const r = new LLMRouter();
    r.register("a", new MockProvider({ defaultModel: "a" }));
    r.register("b", new MockProvider({ defaultModel: "b" }));

    expect(r.pick("a").defaultModel).toBe("a");
    expect(r.pick("missing").defaultModel).toBe("a"); // first registered = default
    r.setDefault("b");
    expect(r.pick("missing").defaultModel).toBe("b");
    expect(r.pick().defaultModel).toBe("b");
    expect(r.pick(null).defaultModel).toBe("b");
  });

  it("throws when no providers registered", () => {
    expect(() => new LLMRouter().pick()).toThrow(/no providers/);
  });

  it("setDefault throws for unregistered key", () => {
    expect(() => new LLMRouter().setDefault("nope")).toThrow(/not registered/);
  });

  it("describe() reports keys + isDefault", () => {
    const r = new LLMRouter();
    r.register("mock", new MockProvider());
    const d = r.describe();
    expect(d[0]?.key).toBe("mock");
    expect(d[0]?.isDefault).toBe(true);
    expect(r.list()).toEqual(["mock"]);
  });
});
