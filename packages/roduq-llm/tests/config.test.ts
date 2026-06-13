import { describe, expect, it } from "vitest";
import { createRouterFromEnv } from "../src/config.js";

describe("createRouterFromEnv", () => {
  it("registers only mock when no keys present; mock is default", async () => {
    const router = await createRouterFromEnv({});
    expect(router.list()).toEqual(["mock"]);
    expect(router.getDefaultKey()).toBe("mock");
    expect(router.pick().name).toBe("mock");
  });

  it("fails loud when LLM_PROVIDER is set but that provider is unavailable", async () => {
    await expect(
      createRouterFromEnv({ LLM_PROVIDER: "openai" }),
    ).rejects.toThrow(/LLM_PROVIDER='openai'.*unavailable/i);
  });
});
