# ROADMAP — aktywna sekwencja wykonawcza (post-audyt 2026-06)

> **Single source of truth dla KOLEJNOŚCI prac.** Godzi audyt Fable 5 ([AUDIT_2026-06.md](AUDIT_2026-06.md)) i plan naprawczy ([REMEDIATION_PLAN.md](REMEDIATION_PLAN.md)) ze strategią "thin / demo-first" zatwierdzoną przez Rafała 2026-06-13.
>
> **Zasada nadrzędna (route vs destination):** Trasa = najcieńsza droga do działającego, pokazywalnego v1.0. Cel = pełna wizja Fable 5 (jakość wybitna + fosa). **Nic z planu Fable 5 nie jest skasowane** — każdy jego element jest "must be done", ale **odblokowany dopiero po spełnieniu warunków wejścia (bramki G0-G5)**. Sekwencjonujemy uczciwie zamiast budować maszynerię jakości na kodzie, który nigdy nie ruszył.
>
> **Reguła dowodu (z audytu F-04):** żadne zadanie nie jest "✅ done" bez artefaktu wykonania (log komendy / wynik testu / screenshot / pomiar). Deklaracja bez dowodu = zadanie otwarte. Log na dole tego pliku.
>
> Dobór modeli per zadanie: [MODEL_STRATEGY.md](MODEL_STRATEGY.md) + rule `010-model-strategy.mdc`. REMEDIATION_PLAN.md pozostaje **szczegółowym katalogiem zadań** (zakresy, kryteria akceptacji); ten plik definiuje, **co i kiedy** z niego ciągniemy.

## Decyzje zablokowane (2026-06-13)

| Decyzja | Ustalenie | Źródło |
|---|---|---|
| Środowisko wykonania | **Windows-native + VS Build Tools 2022** (siostrzane repo + Claude Code już tu żyją; brak granicy ścieżek F-21) | wybór Rafała |
| Aktywny model LLM | **Gemini `gemini-3-flash-preview`** (LLM_PROVIDER=gemini w .env.local); abstrakcja obsługuje też Anthropic/OpenAI | wybór Rafała (klucz dostarczony) |
| Obietnica latencji | **"~2-3 min" (3 warianty równolegle)**, NIE "<30s" | F-12 potwierdzone matematycznie (output dominuje, `Promise.all` nie skraca pojedynczego strumienia) |
| Multi-provider | Mock + Anthropic w v1; OpenAI/Gemini dopiero na żądanie klienta (interfejs zachowuje brak lock-inu) | audyt pt 5 / F-01 |
| Strategia | thin/demo-first jako trasa; pełny Fable 5 jako cel zbramkowany | wybór Rafała |

### Korekty audytu (zweryfikowane empirycznie 2026-06-13 — nie powtarzamy błędów audytu)

- **F-05 (.complete) — ZAWYŻONE.** `BRIDGE.md` **nie** każe CLI usuwać flagi. To nie P0, tylko doprecyzowanie semantyki. Severity → P3.
- **F-15 (NOT_IMPLEMENTED jako sukces) — ZAWYŻONE.** Kod nie zwraca `isError:false` (pola nie ma). Poprawić na właściwy błąd, ale nie udaje aktywnie sukcesu. Severity → P2.
- **F-10 (zawyżone LOC) — BŁĘDNE.** "1860 LOC" jest poprawne dla katalogu; audyt pomylił rozmiar pliku z katalogiem. `INVENTORY.md` był dokładny. Zadanie usunięte.
- **F-09 — licznik.** Enum bloków ma **33** wartości (audyt mówił 31), SKILL.md dopuszcza 9. Sprzeczność realna.
- **F-12 — POTWIERDZONE** mimo że jeden agent weryfikujący "obalił" je, ufając spornym dokumentom (15-25s). Prawda: ~2-3 min.

---

## Bramki (definition of ready dla kolejnej fazy)

| Bramka | Warunek przejścia (z artefaktem) | Odblokowuje |
|---|---|---|
| **G0** Środowisko zielone | ✅ `pnpm install`; `better-sqlite3` OK; MCP build→`dist/`; testy zielone (10+185); ✅ **G0a** producent round-trip na Windows-native. ⛔ **G0b** (CLI konsumuje) zablokowane — sister `@roduq/cli` stub v0.4.0 | Faza 1 (z notą o blokerze konsumenta) |
| **G1** Pętla udowodniona | ✅ brief → Mock → tokens/sections/content → atomowy zapis + `.complete` → round-trip `OutputReader` (status=complete). Konsumpcja `@roduq/cli` odłożona do v0.4.0 (decyzja konsumenta) | Faza 2 ✅ odblokowana |
| **G2** Generacja realna stabilna | 1 skill → realny output Anthropic przez ajv; 1 golden; test "Łódź żółw pięć słów"; runner stabilny (schemat/prompt nie zmienia się między biegami) | Faza 3 + rozszerzenia must-do gr. A |
| **G3** v1.0 zdemonstrowane | multi-variant + pick + UI + deterministyczny sędzia QA; pierwszy klient E2E z **pomiarami** (czas, koszt z `usage`); demo 2× pod rząd bez awarii | Warstwa rygoru Fable 5 (must-do gr. B) |
| **G4** Produkt dojrzały | 1-3 realnych klientów obsłużonych; zaobserwowane realne potrzeby (edycje, dryf treści) | Fosa I-1..I-7 + refaktory (must-do gr. C) |
| **G5** Skala | wolumen 10-50× lub ≥10 projektów w bazie | Optymalizacje skali (must-do gr. D) |

---

## Definition of Done — v1.0 (falsyfikowalna)

> Brief realnego, **nazwanego** klienta → 3 warianty w ~3 min → deweloper (nie klient) wybiera jeden w UI/CLI → `@roduq/cli` scaffolduje go w roduq-web-starter **bez ręcznej edycji JSON** → demo przechodzi 2× pod rząd. Branża pierwszego klienta wyznacza, który JEDEN skill robimy w Fazie 2.

---

## TRASA — Fazy do v1.0

### Faza 0 — Fundament prawdy `[bramka wyjścia: G0]`
*Szac. 2-3 dni · ~$5-15 · model: S (Sonnet), eskalacja O gdy node-gyp > 2h*

- [x] **F0.1** Środowisko: VS Build Tools 2022 obecne; `pnpm install` zielony (27s, 22 projekty); `better-sqlite3` natywny binarny zbudowany przez prebuild (Python niepotrzebny), roundtrip=42. *(R0.1)* — **artefakt: log b4w4xxocn**
- [x] **F0.2** Build MCP (`dist/`, exit 0 po naprawie 2 błędów TS) + **pierwsze w historii** testy: MCP 10/10, roduq 181/181. Naprawione przy okazji: (a) 2 błędy TS w MCP (`output-writer` zbędne `satisfies`, `types` brak `override`), (b) `tests/roduq` nie był pakietem workspace → dodany jako `@roduq/tests` + `tests/*` do workspace, (c) **nowy defekt: 5 schematów miało `$schema: https://...draft-07` zamiast kanonicznego `http://` → ajv nie walidował** (uderzyłby w R1). *(R0.2, naprawia F-02/F-03)*
- [ ] **F0.3** Smoke-test handoff: ręcznie zapisz `~/.roduq/output/<id>/` z `.complete` → potwierdź że `@roduq/cli` w siostrzanym repo to widzi (Windows-native, jedna ścieżka). *(gate F-21)*
- [x] **F0.4** Batch poprawek kontraktowych: F-06 (additionalProperties:false z top-level usunięte), F-08 (Step 7b preview.html + Step 8 meta.json), F-09 (schema = single source of truth bloków), F-16/F-17 (4 nowe kody + usunięte puste `catch`/`as` — rule 005), F-19 (lengthValue), F-22/F-23 (atomowy flow + `variants/`). **F-07 wydzielone do decyzji (niżej).** *(R0.3)*
- [x] **F0.5** Prawda w docs: odznaczone niezmierzone `[x]` w E2E_DEMO (F-04); "<30s"→"~2-3 min" w 5 plikach (F-12); F-11 koszty ujednolicone; reguła "✅ wymaga artefaktu" w rule 009. *(R0.4)*
- [x] **F-07** ROZSTRZYGNIĘTE (Rafał, Option A): macierz wygrywa, presety doprecyzowane — dark-cinematic `⚠ restaurant tylko premium/fine-dining`, brutalist `✅ saas tylko jako Bold/statement`. Zero zmian w macierzy.
- [x] **F0.3a** (producent) Round-trip: fixture bundle → kanoniczna ścieżka Windows `~/.roduq/output/` + `.complete` → odczytany przez `OutputReader` jako `status: complete` (tokeny/sekcje/treść sparsowane). Granica ścieżek F-21 zażegnana (Windows-native). ✅
- [ ] **F0.3b** (konsument) **ZABLOKOWANE**: `@roduq/cli` w roduq-web-starter to stub (`"CLI is stub. MVP v0.4.0"`, `build: echo TODO`). Pełny handoff cross-repo wymaga implementacji CLI w siostrzanym repo (v0.4.0). **Wpływa na walking skeleton (F1.2)** — patrz nota niżej.

### Faza 1 — Szkielet end-to-end (walking skeleton) `[bramka: G1]`
*Szac. 2-3 dni · ~$5-10 · model: O (high)*

> ✅ **Decyzja konsumenta (Rafał, 2026-06-13):** Option A — `OutputReader` round-trip (udowodniony w F0.3a) jako proof kontraktu producenta NA TERAZ; realna konsumpcja `@roduq/cli` odłożona do v0.4.0 w roduq-web-starter. Walking skeleton zostaje w TYM repo — bez zależności od sister repo.

- [x] **F1.1** Pilot = **Golf In One** (Roduq product; repo `golf-in-one` / `golf-in-one-web`). Branża = sports-tech / golf venue booking SaaS → skill `roduq-saas-landing`. Brand ugruntowany z `blueprint_6_design_system.md`: Figtree, primary #275445, secondary #33705C, tertiary #5CC18F, accent #B8EB6F, radius 20px. Brief: `tests/roduq/fixtures/briefs/golf-in-one.json`.
- [x] **F1.2** ✅ Walking skeleton: `golf-in-one.json` → `MockProvider` (brand golfa) → ajv → atomowy zapis (tmp→rename) + `.complete` → round-trip `OutputReader` (status=complete). Kod: `tests/roduq/skeleton/{provider,generate,demo}.ts` + test. **Brama G1 osiągnięta.** Naprawiony przy okazji bug: import `@roduq/mcp-server` startował serwer (guard entrypointu). Demo na realnej ścieżce: `~/.roduq/output/golf-in-one/` (7 plików, brand #275445, 7 bloków).

### Faza 2 — Prawdziwa generacja, 1 skill `[bramka: G2]`
*Szac. 3-5 dni · ~$20-40 · model: O (xhigh) + 1 adversarial review interfejsu LLM*

- [~] **F2.1** ✅ (build+unit) Warstwa LLM jako pakiet `packages/roduq-llm` (provider-agnostyczny per rule 007; decyzja Rafała: **wszystkie 3 — Anthropic+OpenAI+Gemini + Mock**): `LLMProvider` + `LLMRouter` + `createRouterFromEnv` (wybór modelu przez env), structured outputs (ajv=siatka), cache breakpoint, token usage. **15 testów (fake SDK, zero kluczy)**. §Q adversarial review znalazł i naprawił **5 realnych bugów** (Gemini responseJsonSchema, Anthropic refusal-throw, OpenAI strict:false, abortSignal threading, config fail-loud). ⏳ **pozostaje: 1 realny call per provider** (test integracyjny — czeka na klucze API). *(R1.2)*
- [ ] **F2.2** Skill runner + manifest egzekucji we frontmatter — dla **jednego** skilla (branża pilota). Budujemy w daemonie (gdzie najłatwiej debugować), **bez** wydzielania pakietu. *(R1.3, część)*
- [ ] **F2.3** `od roduq-generate` → realny polski output przez ajv; test "Łódź żółw pięć słów". *(R1.3)*
- [ ] **F2.4** **Jeden** ręcznie dopracowany golden (branża pilota) z pierwszego realnego outputu Anthropic — kotwica regresji + few-shot. *(R1.4, część)*
- [ ] **F2.5** Token single-source: runner emituje tokens.json + trywialny inline JSON→CSS (10-20 linii, NIE "codegen subsystem"). Zabija dryf tri-słownika teraz. *(uproszczone R3.5)*

### Faza 3 — Multi-variant + wybór + UI = v1.0 `[bramka: G3]`
*Szac. 4-6 dni · ~$25-50 · model: O (high) runtime + S (UI/QA)*

- [ ] **F3.1** Multi-variant runtime = 3× sprawdzona nitka (zwykłe `Promise.all`, kolejka max 3, timeout per wariant, partial 2/3). *(R2.1)*
- [ ] **F3.2** `pick_variant` + `list_clients` (~15 linii) + działający protokół konsumpcji przez `@roduq/cli`. *(R2.2, rdzeń)*
- [ ] **F3.3** UI briefu (naprawia F-20): formularz (nazwa, industry, brief, tone tags, brand colors) → daemon → progress 3 kart → side-by-side preview → pick. **To jest demo, które sprzedaje.** *(R3.4 wciągnięte do v1)*
- [ ] **F3.4** Deterministyczny sędzia QA: Playwright + axe-core + kontrast z faktycznych kolorów (łapie F-13/F-14) + overflow @360px + glify diacritics. Brama przed `status: complete`. *(R3.1 — jedyny element "jakości" wart kosztu w v1)*
- [ ] **F3.5** Pierwszy klient pilotażowy E2E z pomiarami → **dopiero teraz** odhaczamy checkboxy. *(R2.4)*

---

## CEL — "must be done" Fable 5 (zbramkowane, nic nie wypada)

> Pełna wizja Fable 5 realizowana po udowodnieniu, że rdzeń działa. Każda grupa ma twardy warunek wejścia.

### Grupa A — odblokowana przez G2 (runner stabilny)
- [ ] **A1** Manifest egzekucji + runner dla **pozostałych 6 skills** (rozszerzenie F2.2). *(reszta R1.3)*
- [ ] **A2** **Pozostałe 7 goldenów** — leniwie, po jednym przy każdym skillu, po ustabilizowaniu kształtu outputu. *(reszta R1.4)*

### Grupa B — odblokowana przez G3 (v1.0 działa → warstwa rygoru)
- [ ] **B1** **Pełny protokół jakości §Q**: adversarial review w świeżej sesji dla zadań ★, panel sędziów treści (2×S + 1×O), eval-set jako bramka deeskalacji modelu. *(§Q + MODEL_STRATEGY §5)*
- [ ] **B2** **Sędzia QA — stopień LLM-vision** (rubryka 5 osi, score, auto-regen max 1 retry). *(R3.2)*
- [ ] **B3** `regenerate_section` przez daemon (async job, `jobId`, `get_job_status`, `DAEMON_UNAVAILABLE`, selektor `hero@2`) — **gdy pierwszy klient poprosi o edycje**. *(R2.3, Q33)*
- [ ] **B4** **MCP resources** (`roduq://clients/...`, `.../design-system`, `.../DESIGN.md`). *(R2.2 extras, Q34)*
- [ ] **B5** Wydzielenie `packages/roduq-output-protocol` — **teraz są 2 konsumenci** (CLI + MCP), szew uzasadniony. *(R1.1, przesunięte)*
- [ ] **B6** Pełny codegen tokens.json→css + **interaction tokens** v1.1 (focusRing, hover.lift, easing). *(reszta R3.5, Q29)*
- [ ] **B7** Naprawa F-07 jako decyzja projektowa (macierz ↔ DESIGN.md presets — uzgodnić docelowy wybór, usunąć sprzeczność restaurant/saas → Bold).
- [ ] **B8** Pass **Fable 5 (★★)** nad finalnym kanonem goldenów — opcjonalnie, gdy goldeny ustabilizowane (trwały artefakt = wieczne few-shoty). *(R1.4 opcja)*

### Grupa C — odblokowana przez G4 (realne potrzeby klientów → fosa)
- [ ] **C1** Refaktor skills → `roduq-page-generator` + fragmenty + industry voice-packs — **tylko jeśli** zaobserwujemy dryf treści LUB B3 wymaga promptów per-blok. Porównanie z goldenami = blocker regresji. *(R3.3, Q8/Q25)*
- [ ] **C2** Pamięć projektowa / Agency Taste Engine — faza ZAPISU zaczyna się natychmiast po 1. kliencie. *(I-1, R4.3)*
- [ ] **C3** Pakiety wiedzy lokalnej (`references/markets/...`). *(I-6, R4.1 — najtańsza fosa)*
- [ ] **C4** Pitch Pack Generator (`od roduq-pitch`). *(I-7, R4.2)*
- [ ] **C5** Tłumacz feedbacku klienta (ontologia PL → diff tokenów). *(I-2, R4.4)*
- [ ] **C6** Content-first layout solver (opentype.js, limity długości PL). *(I-4, R4.5 — wymaga C1)*
- [ ] **C7** Brand DNA (logo→paleta kodem, potem ton z URL/PDF). *(Q27, R4.8)*
- [ ] **C8** Multi-provider OpenAI/Gemini — **gdy klient zażąda**. *(F-01)*

### Grupa D — odblokowana przez G5 (skala)
- [ ] **D1** Staggered-start caching (gdy wolumen 10-50×). *(audyt pt 26)*
- [ ] **D2** Destylacja taste engine (Opus kwartalnie, po ≥10 projektach). *(I-1 faza uczenia, R4.6)*
- [ ] **D3** Destylator referencji "jak ta strona [URL]". *(I-3, R4.7)*
- [ ] **D4** Marketplace / custom skill creator UI (v2.0+).

---

## Macierz pokrycia (każdy element Fable 5 ma przydział)

| Fable 5 | Gdzie u nas | Bramka |
|---|---|---|
| R0.1-R0.4 | F0.1-F0.5 | G0 |
| R1.1 (output-protocol pkg) | B5 | G3 |
| R1.2 (LLM layer) | F2.1 | G2 |
| R1.3 (skill runner) | F2.2-F2.3 + A1 | G2 |
| R1.4 (8 goldenów) | F2.4 (1) + A2 (7) + B8 (Fable pass) | G2/G3 |
| R2.1 (multi-variant) | F3.1 | G3 |
| R2.2 (pick+consume+MCP) | F3.2 (rdzeń) + B4 (resources) | G3 |
| R2.3 (regenerate_section) | B3 | G3+ (na żądanie) |
| R2.4 (pilot) | F3.5 | G3 |
| R3.1 (QA deterministyczny) | F3.4 | G3 |
| R3.2 (QA LLM-vision) | B2 | G3 |
| R3.3 (fragments refactor) | C1 | G4 (warunkowo) |
| R3.4 (UI) | F3.3 | G3 |
| R3.5 (codegen+interaction) | F2.5 (inline) + B6 (pełny) | G2/G3 |
| §Q protokół jakości | v1: 1 test/skill + review interfejsu; pełny: B1 | G3 |
| I-1..I-7 (fosa) | C2-C7, D2-D3 | G4/G5 |
| Caching staggered | D1 | G5 |

---

## Wykonanie (log — uzupełniać przy każdym zadaniu, reguła dowodu)

| Data | Zadanie | Artefakt | Status |
|------|---------|----------|--------|
| 2026-06-13 | Audyt zweryfikowany empirycznie (6 klastrów) + krytyka planu | workflow `wf_9791fa53-747`, 7 agentów | ✅ |
| 2026-06-13 | ROADMAP zatwierdzony (thin-route + Fable 5 jako zbramkowany cel) | ten plik | ✅ |
| 2026-06-13 | F0.1 środowisko zielone | `pnpm install` 27s exit 0; `better-sqlite3` roundtrip=42; VS BuildTools 2022 ✅ | ✅ |
| 2026-06-13 | F0.2 build + pierwsze testy | MCP build exit 0; vitest: **MCP 10/10 + roduq 181/181** | ✅ |
| 2026-06-13 | Fix: 2 błędy TS (output-writer/types) | `tsc -b --force` exit 0 | ✅ |
| 2026-06-13 | Fix: `tests/roduq` → pakiet workspace `@roduq/tests` | testy uruchamialne | ✅ |
| 2026-06-13 | Fix: 5 schematów `$schema` https→http draft-07 (ajv) | 11 faili → 0 | ✅ |
| 2026-06-13 | F0.4 schemy+kod (F-06/F-19/F-16/F-17) | commit `79915762`; roduq 185/185, MCP 10/10 | ✅ |
| 2026-06-13 | F0.4 SKILL.md (F-08/F-09 saas, F-22/F-23 multi-variant) | testy zielone | ✅ |
| 2026-06-13 | F0.5 prawda w docs (F-04 boxy, F-12 ×5 plików, F-11 koszty, rule 009 artefakt) | git grep "<30s" tylko w audycie/opisie | ✅ |
| 2026-06-13 | F-07 rozstrzygnięte (Option A: niuans presetów) | dark-cinematic + brutalist DESIGN.md, commit `1f1d5e1d` | ✅ |
| 2026-06-13 | F0.3a producent round-trip (gate G0a) | OutputReader: status=complete, brand=#5E5CE6, 7 bloków, ścieżka Windows OK | ✅ |
| 2026-06-13 | F0.3b konsument (gate G0b) | `@roduq/cli` = stub (v0.4.0) — handoff zablokowany na sister repo | ⛔ bloker cross-repo |
| 2026-06-13 | F1.1 pilot ustalony | Golf In One → roduq-saas-landing; brief fixture golf-in-one.json; brand z blueprint | ✅ |
| 2026-06-13 | Decyzja konsumenta | Option A — OutputReader round-trip jako proof, CLI odłożony do v0.4.0 | ✅ |
| 2026-06-13 | F1.2 walking skeleton (Mock → bundle → round-trip) | roduq 188/188; demo `~/.roduq/output/golf-in-one` status=complete | ✅ G1 |
| 2026-06-13 | Fix: import @roduq/mcp-server startował serwer | guard isEntrypoint() w index.ts | ✅ |
| 2026-06-13 | F2.1 warstwa LLM `packages/roduq-llm` (build+unit) | 15 testów (fake SDK); 4 providery + router + config env-driven | ✅ build/unit |
| 2026-06-13 | §Q adversarial review warstwy LLM | 5 bugów (P0×2/P1×3) znaleziony+naprawiony przed kluczem | ✅ |
| 2026-06-13 | F2.1 integracja Gemini (realny call) | gemini-3-flash-preview: structured JSON OK, PL diacritics OK, usage; P0 responseJsonSchema potwierdzony na żywo | ✅ |
| — | F2.1 integracja Anthropic/OpenAI | — | ⏳ gdy będą klucze (adaptery unit+review-gotowe) |
| — | F2.2/F2.3 skill runner (R1.3) | — | ⏳ następne |
