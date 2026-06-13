# HANDOFF — kontynuacja w nowej sesji (post-audyt, 2026-06-13)

> Self-contained start dla świeżej sesji Claude Code. Stan po Fazie 0-2 (G2). Aktywna sekwencja: [ROADMAP.md](ROADMAP.md).

## TL;DR stan
- Gałąź **`remediation/phase-0`**, PR #1 (github RalphStevensky/roduq-design-generator-studio). 10 commitów. **216 testów zielonych.**
- **Faza 0 ✅** (środowisko + prawda w docs + poprawki kontraktów) · **Faza 1 ✅** (walking skeleton) · **Faza 2 ✅ = G2** (warstwa LLM + skill runner; realny output).
- **Silnik działa end-to-end:** brief → LLM (structured) → ajv → atomowy bundle → OutputReader. Realny artefakt: `~/.roduq/output/golf-in-one/` (otwórz `preview.html`).
- Aktywny model: **gemini-3-flash-preview** (`.env.local`). Pilot: **Golf In One**.

## Najpierw przeczytaj (kolejność)
1. **Memory** (auto-ładowane przez MEMORY.md): `roadmap-strategy-decision`, `llm-config`, `fable5-audit-corrections`, `cross-repo-cli-blocker`
2. **[.docs/ROADMAP.md](ROADMAP.md)** — aktywna sekwencja, bramki G0-G5, log wykonania, macierz pokrycia Fable 5
3. [.docs/AUDIT_2026-06.md](AUDIT_2026-06.md) (audyt) + [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) + [MODEL_STRATEGY.md](MODEL_STRATEGY.md)
4. CLAUDE.md (uwaga: opisuje stan PRZED audytem — realny stan jest w ROADMAP)

## Strategia (zatwierdzona)
Thin/demo-first jako TRASA, pełny plan Fable 5 jako CEL (zbramkowany „must be done"). Audyt zweryfikowany empirycznie — F-05/F-10/F-15 były zawyżone (patrz memory). Reguła dowodu: żadne ✅ bez artefaktu.

## Nowe pakiety Roduq
| Pakiet | Rola |
|---|---|
| `packages/roduq-llm` (`@roduq/llm`) | Provider-agnostic LLM: `LLMProvider` + `LLMRouter` + `createRouterFromEnv` + adaptery Anthropic/OpenAI/Gemini/Mock. README ma znane ograniczenia + Gemini learnings. |
| `packages/roduq-generator` (`@roduq/generator`) | Skill runner `generate()`: brief+skill+preset → prompt(few-shot) → provider.complete (structured per artefakt) → ajv(+retry) → atomic write + `.complete`. |
| `packages/roduq-mcp-server` (`@roduq/mcp-server`) | Protokół outputu (`OutputReader`/`OutputWriter`) + 3 MCP tools. |
| `tests/roduq` (`@roduq/tests`) | Schema + struktura + walking skeleton (188 testów). |

## Jak uruchomić (Windows-native, VS Build Tools obecne)
```
pnpm install
pnpm --filter @roduq/llm build && pnpm --filter @roduq/generator build && pnpm --filter @roduq/mcp-server build
# testy:
pnpm --filter @roduq/llm test   # 16
pnpm --filter @roduq/generator test   # 2 (Mock, bez kluczy)
pnpm --filter @roduq/mcp-server test  # 10
pnpm --filter @roduq/tests test       # 188
# realny bieg golfa (czyta .env.local):
pnpm exec tsx packages/roduq-generator/scripts/generate-golf.ts
```
Sekrety: `.env.local` (gitignored, NIE `.env`): `LLM_PROVIDER=gemini`, `GEMINI_API_KEY=...`, `GEMINI_MODEL=gemini-3-flash-preview`. Klucz dany jawnie w czacie → rozważyć rotację.

## Gemini structured-output — NIE regresować (patrz memory llm-config)
- Pełny ajv-schemat → 400 → `sanitizeForGemini` (inline $ref, drop pattern/format/min*, collapse anyOf, **KEEP additionalProperties**).
- Pusty `{type:object}` → degeneracja w whitespace → zawsze konkretny schemat.
- Thinking zżera budżet → `thinkingBudget:0` dla structured.
- Non-stream → headers timeout → **streaming**.
- Otwarte mapy: sections=lekki few-shot (struktura), draftCopy=jawne klucze jako properties.

## Co dalej (kolejność)
1. **F2.4** golden golfa: review `~/.roduq/output/golf-in-one` → dopracuj → commit do `tests/roduq/fixtures/golden/golf-in-one/` + test regresji.
2. **F2.5** token single-source: runner emituje tokens.json + inline JSON→CSS.
3. **Faza 3 = v1.0 (G3) — KEY DIFFERENTIATOR + GUI:**
   - **multi-variant**: 3× `generate()` z presetami Conservative/Modern/Bold (per macierz w `skills/multi-variant/SKILL.md`), `Promise.all`, zapis `variants/`.
   - **pick_variant** (jest w MCP) + protokół konsumpcji.
   - **GUI** (`apps/web`, F3.3): formularz briefu (industry/tone/brand) → daemon/generator → **3 karty side-by-side** → wybór. ← TU JEST GUI.
   - **sędzia QA deterministyczny** (axe-core + kontrast — łapie F-13/F-14).
4. Refinement: brand font (model użył presetowego Inter Tight zamiast brandowego Figtree golfa) — dodać twardy override fontu w runnerze/prompcie.

## Decyzje zablokowane
gemini-3-flash-preview (wszędzie) · Windows-native · OutputReader = proof konsumenta (sister `@roduq/cli` to stub v0.4.0 — gate G0b) · latencja „~2-3 min" nie „<30s" (F-12).
