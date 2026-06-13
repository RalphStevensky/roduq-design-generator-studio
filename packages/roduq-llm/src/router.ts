/**
 * LLMRouter — registry for multiple providers.
 *
 * The app layer registers the providers it has configured (per env keys);
 * callers pick by key. No caller knows which provider is active — everything
 * goes through `pick(key)`. Mirrors @roduq/llm-router in roduq-web-starter.
 */

import type { LLMProvider } from "./types.js";

export class LLMRouter {
  private readonly providers = new Map<string, LLMProvider>();
  private defaultKey: string | undefined;

  /** Register a provider under `key`. First registered becomes default until setDefault. */
  register(key: string, provider: LLMProvider): this {
    this.providers.set(key, provider);
    if (this.defaultKey === undefined) this.defaultKey = key;
    return this;
  }

  /** Set the explicit default used when pick(key) finds no exact match. */
  setDefault(key: string): this {
    if (!this.providers.has(key)) {
      throw new Error(`LLMRouter.setDefault: provider '${key}' not registered`);
    }
    this.defaultKey = key;
    return this;
  }

  /** Pick by key → exact match, else default, else first registered; throws if empty. */
  pick(key?: string | null): LLMProvider {
    if (key !== undefined && key !== null) {
      const exact = this.providers.get(key);
      if (exact !== undefined) return exact;
    }
    if (this.defaultKey !== undefined) {
      const fallback = this.providers.get(this.defaultKey);
      if (fallback !== undefined) return fallback;
    }
    const first = this.providers.values().next().value;
    if (first === undefined) {
      throw new Error("LLMRouter: no providers registered. Call register(key, provider) first.");
    }
    return first;
  }

  has(key: string): boolean {
    return this.providers.has(key);
  }

  list(): string[] {
    return Array.from(this.providers.keys());
  }

  getDefaultKey(): string | undefined {
    return this.defaultKey;
  }

  /** For admin UI / diagnostics. */
  describe(): Array<{ key: string; name: string; defaultModel: string; isDefault: boolean }> {
    return this.list().map((key) => {
      const p = this.providers.get(key);
      return {
        key,
        name: p?.name ?? "unknown",
        defaultModel: p?.defaultModel ?? "",
        isDefault: key === this.defaultKey,
      };
    });
  }
}
