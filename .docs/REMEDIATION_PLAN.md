# Plan naprawczy i rozwojowy (post-audyt 2026-06)

> ⚠️ **AKTYWNA KOLEJNOŚĆ PRAC: [ROADMAP.md](ROADMAP.md)** (zatwierdzona 2026-06-13: thin/demo-first jako trasa, pełny plan poniżej jako zbramkowany cel "must be done"). Ten plik = szczegółowy katalog zadań (zakresy + kryteria akceptacji); ROADMAP definiuje co i kiedy z niego ciągniemy.
>
> Operacjonalizacja [AUDIT_2026-06.md](AUDIT_2026-06.md). Każde zadanie ma: zakres, kryteria akceptacji, przypisany model (sesja Claude Code wykonująca pracę) i protokół jakości. Dobór modeli: [MODEL_STRATEGY.md](MODEL_STRATEGY.md) + rule `010-model-strategy.mdc`.
>
> **Zasada nadrzędna (z audytu, F-04):** żadne zadanie nie jest "✅ done" bez artefaktu wykonania (log komendy, wynik testu, screenshot). Deklaracja bez dowodu = zadanie otwarte.

## Przegląd faz

| Faza | Nazwa | Horyzont | Cel | Szac. czas | Szac. koszt LLM (sesje agentowe) |
|------|-------|----------|-----|-----------|----------------------------------|
| **R0** | Toolchain + prawda w docs | Natychmiast (tydzień 1) | Środowisko zielone, dokumentacja zgodna z rzeczywistością | 2-3 dni | ~$5-15 |
| **R1** | Vertical slice — działająca generacja | Tydzień 1-3 | brief → 1 skill → LLM → ajv → atomic write, bez UI | 5-7 dni | ~$30-60 |
| **R2** | Multi-variant + pick + consume + MCP domknięcie | Tydzień 3-5 (Q3 2026) | KEY DIFFERENTIATOR działa end-to-end | 4-6 dni | ~$25-50 |
| **R3** | Jakość wybitna: sędzia QA, fragments, golden fixtures, UI | Q3/Q4 2026 | Output godny pokazania klientowi bez ręcznego review | 8-12 dni | ~$60-120 |
| **R4** | Fosa: pamięć, feedback translator, pakiety lokalne, pitch pack | Q4 2026 / V2.0 | Przewagi nie do skopiowania | iteracyjnie | wg modułu |

Legenda modeli (sesje Claude Code): **S** = `claude-sonnet-4-6` (effort medium/high), **O** = `claude-opus-4-8` (effort high/xhigh), **F** = `claude-fable-5` (tylko zadania oznaczone ★ — patrz protokół niżej). Runtime produktu ma osobną mapę w MODEL_STRATEGY.md.

---

## R0 — Toolchain + prawda w docs (NATYCHMIAST)

### R0.1 Środowisko zielone — `pnpm install` przechodzi
- **Model: S** (praca diagnostyczno-mechaniczna; eskalacja do O tylko gdy debugging node-gyp przekroczy 2h)
- Kroki: (a) `Remove-Item node_modules -Recurse` (stan zepsuty — F-03); (b) sprawdź prebuilds better-sqlite3 dla ABI bieżącego Node 24 → jeśli brak, pin Node do wersji LTS z prebuildem (nvm-windows / volta) LUB VS Build Tools 2022 LUB WSL2; (c) `pnpm install` → zielony; (d) jeśli WSL2: ustal kanonicznie `ROduQ_OUTPUT_DIR=/mnt/c/Users/stefa/.roduq/output` + smoke test cross-boundary (F-21, R-4).
- **Akceptacja:** log `pnpm install` bez błędów + `node -e "require('better-sqlite3')"` przechodzi. Zapisz wynik w tym pliku (sekcja "Wykonanie" na dole).

### R0.2 Build + pierwsze w historii uruchomienie testów
- **Model: S**
- `pnpm --filter @roduq/mcp-server build` (naprawia F-02) → `pnpm --filter @roduq/mcp-server test` → `npx vitest run --config tests/roduq/vitest.config.ts` (Tier 1+2).
- Spodziewane: część testów Tier 2 może paść (schematy nigdy nie walidowane przeciw fixtures!). Każdy fail = osobny fix-commit.
- **Akceptacja:** pełny output vitest wklejony do "Wykonanie"; wszystkie suites zielone lub fail z otwartym issue.

### R0.3 Naprawy kontraktowe (1 dzień, batch)
- **Model: S** dla edycji mechanicznych; **O** dla decyzji o semantyce `.complete`
- [ ] F-05: `.complete` = plik z `{generationId, completedAt, manifest:{plik:sha256}}`; CLI **nie usuwa**; OutputReader czyta generationId. Update BRIDGE.md + rule 004 + output-reader/writer.
- [ ] F-06: usuń `additionalProperties:false` z top-level tokens/sections (zostaw w bilingualString itd.); test forward-compat (nieznane pole top-level przechodzi).
- [ ] F-07: uzgodnij macierz ↔ Compatible Skills (decyzja: macierz wygrywa → popraw DESIGN.md presets, LUB presety wygrywają → popraw macierz; rekomendacja: `restaurant→Bold→roduq-brutalist` zamiast dark-cinematic? NIE — decyzja projektowa, oznacz w obu plikach docelowy wybór i usuń sprzeczność).
- [ ] F-08: dodaj Step 6b (preview.html — kompozycja z templates + tokens) i Step 8b (meta.json) do SKILL.md saas-landing.
- [ ] F-09: usuń `ALLOWED_BLOCKS` z SKILL.md, zastąp linkiem do schematu + per-skill subset listą.
- [ ] F-15/F-16: NOT_IMPLEMENTED jako `isError:true`; dodaj kody `SECTION_NOT_FOUND`, `PAGE_NOT_FOUND`, `NOT_IMPLEMENTED`, `DAEMON_UNAVAILABLE`; podłącz ajv do readDesignState (VALIDATION_FAILED osiągalny).
- [ ] F-17: usuń puste catch (log via stderr) i rzutowania `as` w output-reader.ts.
- [ ] F-22/F-23: popraw Step 6 multi-variant SKILL.md (opis flow OutputWriter.promoteVariant zamiast sed/cp/touch); ujednolić variants/ vs variants-archive/.
- **Akceptacja:** commit per fix z testem regresji gdzie możliwy.

### R0.4 Prawda w dokumentacji
- **Model: S**
- [ ] F-04: odznacz niezmierzone `[x]` w E2E_DEMO.md → `[ ]` z dopiskiem "(do zmierzenia po R2)".
- [ ] F-10/F-11: popraw liczby LOC (INVENTORY) i ujednolić koszty (źródło prawdy: MODEL_STRATEGY.md § koszty runtime).
- [ ] F-12/R-2: zamień "<30s" na "~2-3 min (3 warianty równolegle)" we wszystkich plikach (AGENT_PROMPT, IMPLEMENTATION, E2E_DEMO, multi-variant SKILL.md, PRODUCTION_POLISH budgets) ALBO udokumentuj progressive generation jako warunek powrotu do krótszego celu.
- [ ] F-24: dopisz notkę o numeracji w ADR.
- [ ] Dopisz do rule 009: "każde ✅/[x] wymaga artefaktu wykonania".
- **Akceptacja:** `git grep "<30s"` zwraca tylko miejsca z kontekstem progressive-generation.

---

## R1 — Vertical slice: działająca generacja (bez UI)

> Architektura docelowa: daemon = mózg (skill loading, prompt assembly, LLM, ajv, atomic write); MCP/CLI = cienkie klienty. Runtime produktu używa modeli per operacja — patrz MODEL_STRATEGY.md § Mapa runtime.

### R1.1 `packages/roduq-output-protocol` — wydzielenie współdzielonego kodu
- **Model: S** (refactor mechaniczny istniejącego kodu MCP)
- Reader/Writer/typy/ajv z roduq-mcp-server → osobny pakiet; MCP server konsumuje. Zero deps poza ajv+zod.
- **Akceptacja:** testy MCP zielone po refaktorze; pakiet buildowalny niezależnie.

### R1.2 LLM layer w daemonie — Mock + Anthropic ★
- **Model: O (xhigh)** — kod krytyczny architektonicznie; **review: niezależna sesja O** (protokół jakości §Q poniżej)
- Implementacja per rule 007 (interfejs LLMProvider, LLMRouter, MockProvider, AnthropicProvider z peer-dep injection — SDK już w deps `@open-design/web`). Wymagania twarde:
  - **Structured outputs** (`output_config.format` z JSON Schema / `messages.parse`) dla tokens/sections/content — ajv staje się siatką bezpieczeństwa, nie pierwszą linią (rozwiązuje audyt Q7);
  - **Streaming** (`messages.stream` + `finalMessage()`) — outputy 8-15k tokenów wymagają streamu;
  - **Prompt caching** (`cache_control: ephemeral` na bloku SKILL.md+references; brief po nim) — uwaga na minimum cacheable prefix (Sonnet 4.6 = 2048 tok);
  - typed exceptions (RateLimitError itd.), retry exponential per PRODUCTION_POLISH.md;
  - token usage tracking → meta.json (`tokensUsed`, `estimatedCostUsd` z cennika w MODEL_STRATEGY.md).
- **Akceptacja:** unit testy z MockProvider; 1 realny call Anthropic z logiem `usage` (w tym `cache_read_input_tokens` > 0 przy drugim callu).

### R1.3 Skill runner + manifest egzekucji ★
- **Model: O (xhigh)**; **review: niezależna sesja O**
- (a) Dodaj do frontmatter wszystkich 8 skills manifest: `od.roduq.execution: {inputs: <json-schema>, outputs: [...], prompt_assembly: [skill, preset, references, brief], llm: {model_tier, response_format}}` (audyt Q1); (b) runner w apps/daemon: parse frontmatter (yaml) → złóż prompt wg manifestu → provider.complete (structured output) → ajv → atomic write per protokół R0.3.
- Komenda: `od roduq-generate --brief <plik.json> --skill roduq-saas-landing --preset roduq-tech-modern` (capability dual-track: najpierw CLI, UI w R3).
- **Akceptacja:** `od roduq-generate` z fixture `tests/roduq/fixtures/briefs/saas.json` + MockProvider produkuje 7 plików przechodzących ajv; to samo z AnthropicProvider produkuje sensowny polski output ("Łódź żółw pięć słów" test przechodzi). Output zarchiwizowany jako pierwszy golden artifact.

### R1.4 Golden fixtures — kanon jakości ★
- **Model: O (xhigh)** do autorstwa; **panel sędziów: 2× niezależna sesja S + 1× O** do oceny (protokół §Q)
- Dla każdego z 8 briefów fixtures: wygeneruj kompletny, ręcznie doszlifowany zestaw outputów (tokens+sections+content) jako golden example. Wepnij linki do golden w SKILL.md (naprawia "fixtures istnieją, nielinkowane"). Polski copy w goldenach to wzorzec voice per industry — to JEST produkt; tu nie oszczędzamy.
- Opcjonalnie ★★: jednorazowy pass **F** (Fable 5) nad finalnym kanonem 8 goldenów — najwyższa stawka jakościowa w projekcie, koszt jednorazowy ~$5-15, zwraca się w każdej przyszłej generacji (goldeny są few-shotami na zawsze).
- **Akceptacja:** 8 katalogów golden w `tests/roduq/fixtures/golden/`; każdy przechodzi ajv; test porównujący strukturę (nie treść) outputu MockProvidera z goldenem.

---

## R2 — Multi-variant + pick + consume

### R2.1 Multi-variant runtime
- **Model: O (high)** — orkiestracja, timeouty, partial failure; logika wprost z `references/parallel-execution.md`
- Promise.all z **staggered start dla cache** (wariant 1 → po pierwszym tokenie warianty 2-3; +1-2s wall-clock, cache hit na 2/3 inputu — patrz MODEL_STRATEGY.md § Caching), kolejka max 3, timeout per wariant, partial result 2/3, zapis `variants/` + meta-multi-variant.
- **Akceptacja:** 3 warianty z fixture w czasie zmierzonym i zapisanym (real Anthropic); koszt z `usage` zapisany; partial-failure test z MockProviderem symulującym timeout.

### R2.2 Pick + consume + MCP domknięcie
- **Model: S**
- `pick_variant` e2e przez realny stdio MCP client test; `list_clients` tool (brak #1 z audytu Q17); MCP resources (`roduq://clients/{id}/design-system` itd. — audyt Q34); test konsumpcji przez `@roduq/cli` (sister repo) z fixture.
- **Akceptacja:** `claude mcp list` pokazuje connected; sesja Claude Code w repo testowym czyta design state.

### R2.3 regenerate_section przez daemon (audyt Q33)
- **Model: O (high)**
- `POST /api/roduq/regenerate-section` + async job pattern (`jobId`, `get_job_status` tool); MCP = cienki klient z `DAEMON_UNAVAILABLE`; selektor wystąpień `hero@2`.
- **Akceptacja:** regeneracja hero z hintem na realnym kliencie testowym; sections.json + content.json zaktualizowane atomowo, reszta nietknięta.

### R2.4 Pierwszy klient pilotażowy
- **Model: —** (człowiek + produkt). Pełny runbook E2E_DEMO z pomiarami → dopiero teraz odznaczanie checkboxów.

---

## R3 — Jakość wybitna

### R3.1 Sędzia jakości (I-5) — stopień deterministyczny
- **Model: S** (implementacja zna te biblioteki)
- Playwright render preview.html → axe-core, kontrast z faktycznych kolorów (wykrywa F-13!), overflow @360px, glify diacritics, lint accent warstwy 2 (F-14). Brama przed `status: complete`.
- **Akceptacja:** sędzia odrzuca celowo zepsuty fixture (żółty na białym) i przepuszcza goldeny.

### R3.2 Sędzia jakości — stopień LLM-vision
- **Model runtime: Sonnet 4.6** (vision + rubryka, ~$0.02-0.05/wariant); implementacja: **S**
- Screenshot → rubryka 5 osi (hierarchia, rytm, dyscyplina akcentu, zgodność z DESIGN.md presetu, współczesność) → score + uzasadnienie; <próg → auto-regen z feedbackiem jako hint (max 1 retry). Score do meta v1.1 + telemetrii (metryka regresji skills).

### R3.3 Refactor skills → fragments + industry packs (audyt Q8/Q25) ★
- **Model: O (xhigh)** — przekrojowy refactor treści; **review: O**; polskie voice packs po refaktorze porównane z goldenami R1.4 (regresja jakości = blocker)
- `roduq-page-generator` + `sections/*.md` fragments + `industries/*/voice.md`. Limity długości per pole do content schema (umożliwia I-4).

### R3.4 Minimalny UI briefu (F-20)
- **Model: O (high)** — integracja z upstream apps/web wymaga ostrożności cherry-pick; minimalna osobna strona zamiast głębokiej integracji.
- Formularz: nazwa klienta, industry select, brief, tone tags, brand colors → wywołuje daemon → progress 3 kart → preview side-by-side (asset już istnieje) → pick.

### R3.5 Codegen tokens.json → tokens.css (audyt Q12) + interaction tokens (Q29)
- **Model: S**

---

## R4 — Fosa konkurencyjna (kolejność wg ROI)

| Zadanie | Model sesji | Model runtime | Uwagi |
|---------|------------|---------------|-------|
| R4.1 Pakiety wiedzy lokalnej (I-6) | **S** + copywriter/człowiek | n/d (treść statyczna) | Najtańsze / najszybsza fosa; start: gastro-Kraków, clinic-Warszawa, saas-PL |
| R4.2 Pitch Pack (I-7) | **S** | Sonnet 4.6 (uzasadnienia) | Bezpośredni wpływ na przychód |
| R4.3 Zbieranie danych pamięci (I-1, faza zapisu) | **S** | n/d | Zacząć NATYCHMIAST po R2.4 — dane od 1. klienta; destylacja później |
| R4.4 Tłumacz feedbacku (I-2) | **O** (ontologia ★) | Haiku 4.5 mapowanie → Sonnet 4.6 przy niskiej pewności | Diff deterministyczny w kodzie, nie w LLM |
| R4.5 Content-first solver (I-4) | **O** ★ | n/d (pomiar deterministyczny) | Wymaga R3.3 (limity + fragments) |
| R4.6 Destylacja taste engine (I-1, faza uczenia) | **O** | Opus 4.8 (kwartalnie, judgment-heavy) | Po ≥10 projektach w bazie |
| R4.7 Destylator referencji (I-3) | **O** ★ | Sonnet 4.6 | V2.0 |
| R4.8 Brand DNA (Q27) | **S** (logo→paleta = kod) potem **O** (ton z URL/PDF) | Sonnet 4.6 | Start od samego logo |

---

## §Q Protokół jakości dla zadań ★ ("skrupulatne prowadzenie")

Zadania oznaczone ★ to praca, której błąd kosztuje najwięcej (architektura runtime, kanon jakości, przekrojowe refaktory treści). Dla nich obowiązuje pełny cykl — nie pojedyncza sesja:

1. **Plan przed kodem** — sesja wykonawcza (O, xhigh) najpierw produkuje plan implementacji z kryteriami akceptacji; człowiek zatwierdza.
2. **Pełna specyfikacja w pierwszym turnie** — nie dawkować wymagań w trakcie; cały kontekst (linki do AUDIT/MODEL_STRATEGY/fixtures) na starcie sesji.
3. **Implementacja z testami w tym samym commicie** — golden/regression test jest częścią definicji done.
4. **Adversarial review w świeżej sesji** (osobny kontekst, model O): prompt "spróbuj obalić — znajdź przypadki brzegowe, race conditions, naruszenia kontraktów z AUDIT_2026-06.md". Znaleziska wracają do sesji wykonawczej.
5. **Panel sędziów dla treści** (goldeny, voice packs): 2× S + 1× O oceniają niezależnie wg rubryki (poprawność PL, zgodność z voice profile, zgodność ze schematem, brak corporate-speak); rozbieżność >1 stopnia = eskalacja do człowieka.
6. **Fable 5 (★★) wyłącznie do:** jednorazowego passu nad kanonem goldenów (R1.4), opcjonalnej drugiej opinii architektonicznej przy R1.2/R1.3, projektowania ontologii feedbacku (R4.4). Uzasadnienie: $10/$50 + ~30% więcej tokenów (nowy tokenizer) — opłacalne tylko tam, gdzie wynik jest trwałym artefaktem najwyższej stawki, nie pracą bieżącą. Szczegóły: MODEL_STRATEGY.md § Fable 5.
7. **Artefakt wykonania obowiązkowy** — log testów / pomiar / screenshot w commit message lub w sekcji "Wykonanie" poniżej.

## Wykonanie (log postępu — uzupełniać przy każdym zadaniu)

| Data | Zadanie | Artefakt | Status |
|------|---------|----------|--------|
| — | — | — | — |
