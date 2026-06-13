# @roduq/llm

Provider-agnostic LLM layer for Roduq design generation. Callers depend only on the
`LLMProvider` interface — the model is chosen by **config (env)**, never hard-wired.
No vendor lock-in (rule 007). Mirrors the `@roduq/llm-router` pattern in `roduq-web-starter`.

## Usage

```ts
import { createRouterFromEnv } from "@roduq/llm";

const router = await createRouterFromEnv(); // reads env (below)
const provider = router.pick(process.env.LLM_PROVIDER); // or router.pick() → default

const res = await provider.complete(
  [{ role: "user", content: "Generate tokens for a golf SaaS landing." }],
  {
    system: skillMarkdown,                 // stable prefix (cached when cache:true)
    cache: true,
    responseSchema: { name: "tokens", schema: tokensJsonSchema }, // structured JSON
  },
);
const parsed = JSON.parse(res.content);   // then ajv-validate (the real enforcement)
console.log(res.inputTokens, res.outputTokens, res.cachedInputTokens);
```

## Configuration (choose the model, supply the key)

```
LLM_PROVIDER=anthropic        # anthropic | openai | gemini | mock  (default: first available)
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...            # or GOOGLE_API_KEY
```

`createRouterFromEnv` always registers `mock`, plus any provider whose key is present.
If `LLM_PROVIDER` is set but that provider has no key, it **throws** (fail loud — no
silent demotion to mock).

## Structured output

`responseSchema` maps to each provider's native JSON mode:
- **Anthropic** — forced tool-use (tool `input` is the JSON). Refusal/no-tool → throws (never silent empty).
- **OpenAI** — `response_format: json_schema` with `strict:false` (strict mode rejects optional props + `pattern`/`format`/… that our ajv schemas use).
- **Gemini** — `responseMimeType:"application/json"` + `responseJsonSchema` (draft-07 `definitions` normalized → `$defs`).

In all cases **ajv is the real enforcement** — `content` is a JSON string the caller parses + validates (and may retry on failure).

## Known limitations (v1)

- **`stream()` = chunked replay of `complete()`** — not true SSE. Fine for current output sizes (`maxTokens` 8192); true token streaming is a later refinement. For long outputs prefer `complete()`.
- **Gemini schema dialect** — `responseJsonSchema` accepts a JSON-Schema subset; exotic keywords may be ignored. ajv catches non-conforming output.
- **Token accounting** — Anthropic `totalTokens` is billed-full-rate (excludes `cachedInputTokens`, reported separately).
- **`estimateTokens`** — ~4 chars/token heuristic (Mock + usage fallbacks only); real providers report exact usage. Polish UTF-8 skews the heuristic.
- **`router.pick(unknownKey)`** falls back to default silently — use `has()`/`describe()` to check.
- **No real integration tests yet** — 15 unit tests run against injected fake SDKs (no keys). Real 1-call-per-provider integration is gated on API keys (ROADMAP F2.1).

## Tests

```
pnpm --filter @roduq/llm test   # 15 unit tests, no API keys required
```
