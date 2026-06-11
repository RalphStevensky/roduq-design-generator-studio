# Strategia doboru modeli LLM — Roduq Design Generator

> Single source of truth dla doboru modeli Anthropic: (A) w **runtime produktu** (pipeline generacji) i (B) w **sesjach agentowych** wykonujących prace z [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md). Cel: optymalizacja kosztowa **bez straty jakości** + najcięższe zadania prowadzone skrupulatnie do jakości wybitnej (protokół §Q w REMEDIATION_PLAN.md).
>
> Operational TL;DR: `.cursor/rules/010-model-strategy.mdc`. Dane cennikowe zweryfikowane 2026-06 (skill claude-api). Multi-provider abstraction (rule 007) pozostaje w mocy — ten dokument definiuje domyślne mapowanie dla providera Anthropic (primary); OpenAI/Gemini dostają analogiczne tiery gdy klient wymaga.

## 1. Cennik i charakterystyka (2026-06)

| Model | ID | Input $/1M | Output $/1M | Kontekst / max output | Kluczowe cechy |
|-------|----|-----------|-------------|----------------------|----------------|
| Claude Haiku 4.5 | `claude-haiku-4-5` | $1.00 | $5.00 | 200K / 64K | Najszybszy; klasyfikacja, routing, tanie mapowania |
| Claude Sonnet 4.6 | `claude-sonnet-4-6` | $3.00 | $15.00 | 1M / 64K | **Koń roboczy produktu**: structured outputs, adaptive thinking, effort do `max`, vision; min. cacheable prefix 2048 tok |
| Claude Opus 4.8 | `claude-opus-4-8` | $5.00 | $25.00 | 1M / 128K | Najzdolniejszy Opus; effort do `xhigh`/`max`; brak temperature/top_p (sterowanie promptem + effort); min. cacheable prefix 4096 tok |
| Claude Fable 5 | `claude-fable-5` | $10.00 | $50.00 | 1M / 128K | Najzdolniejszy ogólnodostępny; thinking zawsze włączony; **nowy tokenizer ≈ +30% tokenów**; `stop_reason: "refusal"` do obsłużenia; turny po kilka minut |

Mechanizmy cenowe, które MUSIMY wykorzystywać:
- **Prompt caching**: read ≈ 0.1× ceny inputu, write 1.25× (TTL 5 min) / 2× (TTL 1h). Maks. 4 breakpointy. Prefiks musi być bajt-w-bajt identyczny.
- **Batches API**: −50% na wszystko, do 24h — dla pracy nieinteraktywnej (regeneracja goldenów, eval runs, odświeżanie presetów).
- **Structured outputs** (`output_config.format` z JSON Schema / `messages.parse`): gwarantowany poprawny JSON — eliminuje koszt retry po failach ajv i rozwiązuje problem non-determinizmu strukturalnego z audytu (Q7). Wspierane: Fable 5, Opus 4.8, Sonnet 4.6, Haiku 4.5.
- **Effort** (`output_config.effort: low|medium|high|xhigh|max`): główna dźwignia koszt↔jakość per wywołanie. `xhigh` tylko Opus 4.7+/Fable.

## 2. Mapa runtime produktu (per operacja)

Zasada: **model najtańszy, który nie obniża jakości artefaktu widzianego przez klienta.** Artefakty klienckie (copy PL, tokeny, sekcje) = Sonnet 4.6 minimum; mechanika niewidoczna (routing, mapowanie) = Haiku; artefakty trwałe-kanoniczne = Opus.

| Operacja | Model | Parametry | Koszt szac. | Uzasadnienie |
|----------|-------|-----------|-------------|--------------|
| Parsowanie briefu + detekcja industry | `claude-haiku-4-5` | structured outputs, effort n/d | ~$0.001 | Klasyfikacja; przy confidence < progu → fallback Sonnet |
| Generacja `tokens.json` | `claude-sonnet-4-6` | structured outputs, thinking disabled, effort `low` | ~$0.01 | Deterministyczna transformacja preset+brand → tokeny; nie wymaga kreatywności |
| Generacja `sections.json` + `content.json` (PL copy) per wariant | `claude-sonnet-4-6` | structured outputs, adaptive thinking, effort `medium`→`high`, **streaming** | ~$0.10-0.20/wariant | **Główny koszt produktu.** Sonnet wystarcza GDY skill ma golden few-shoty (R1.4) i voice pack; bez nich jakość spada — goldeny są warunkiem tego tieru |
| `design-system.md` + `preview.html` | `claude-sonnet-4-6` | effort `medium`, streaming | ~$0.05-0.10 | Kompozycja z templates |
| `regenerate_section` z hintem | `claude-sonnet-4-6` | structured outputs, effort `high` | ~$0.02-0.05 | Mały kontekst (1 fragment + 1 blok) |
| Tłumacz feedbacku (mapowanie na osie ontologii) | `claude-haiku-4-5` → eskalacja `claude-sonnet-4-6` | structured outputs (enum osi) | ~$0.001-0.01 | Diff tokenów liczy KOD, nie LLM |
| Sędzia QA — vision rubryka | `claude-sonnet-4-6` | vision, structured outputs (score+uzasadnienie) | ~$0.02-0.05/wariant | Stopień deterministyczny (axe/kontrast) = $0 |
| Brand DNA — ton z URL/PDF | `claude-sonnet-4-6` | effort `medium` | ~$0.02-0.05 | Paleta z logo = kod (node-vibrant), $0 |
| Pitch Pack — uzasadnienia kierunków | `claude-sonnet-4-6` | effort `medium` | ~$0.02 | Treść z variant-strategy.md jako kontekst |
| **Tryb "premium copy pass"** (opcjonalny, klient premium / finalna wersja po akceptacji) | `claude-opus-4-8` | effort `high` | ~$0.30-0.50/stronę | Drugi pass nad zaakceptowanym wariantem; opt-in w UI, koszt komunikowany |
| Destylacja taste engine (kwartalnie) | `claude-opus-4-8` | effort `xhigh` | ~$1-3/run | Judgment-heavy, rzadkie, trwały artefakt |
| Destylator referencji (URL → DESIGN.md) | `claude-sonnet-4-6` | structured outputs | ~$0.05-0.15 | Ekstrakcja stylometryczna z computed styles |

### Skill frontmatter — `model_hint` rozszerzony

Zamiast obecnego `model_hint: anthropic` (provider) wprowadzamy tier (provider-agnostyczny, zgodny z rule 007):

```yaml
od:
  roduq:
    llm:
      tier: standard        # fast (Haiku-class) | standard (Sonnet-class) | premium (Opus-class)
      response_format: json_schema
      effort: medium
```

Router mapuje tier→model per provider: Anthropic `fast=claude-haiku-4-5, standard=claude-sonnet-4-6, premium=claude-opus-4-8`.

## 3. Koszt multi-variant — matematyka (uczciwa, zastępuje sprzeczne liczby F-11)

Założenia per wariant: ~15k tokenów wspólnego prefiksu (SKILL.md+references+preset+brief), ~2k dynamicznych, ~10k output. Model: Sonnet 4.6.

| Scenariusz | Input | Output | Razem/run (3 warianty) |
|-----------|-------|--------|------------------------|
| Bez cachingu | 3×17k × $3/M = $0.153 | 3×10k × $15/M = $0.450 | **~$0.60** |
| Z cachingiem (staggered start) | write 15k×1.25 + read 2×15k×0.1 + 3×2k dyn ≈ $0.085 | $0.450 | **~$0.54** |
| Opus 4.8 (wszystkie 3) | ~$0.26 | $0.750 | **~$1.01** |
| Hybryda: Sonnet ×3 + premium pass Opus nad wybranym | $0.54 | +$0.35 | **~$0.89** (tylko gdy opt-in) |

Wnioski: (a) **output dominuje koszt** — caching daje ~10-15% na całym runie, ale ~45% na inpucie i jest niemal darmowy przy regeneracjach w oknie 5 min TTL; (b) 100 runów/mies. ≈ **$54-60/mies.** na Sonnecie — mieści się w budżecie agencji z dużym zapasem; (c) latencja: ~10k tokenów outputu ≈ 2-3 min per wariant; równolegle ≈ 2-3 min total — **to jest uczciwa obietnica** (R-2).

### Wzorzec cachingu (obowiązkowy w skill runnerze)

```typescript
// Kolejność: stabilne → zmienne. Breakpoint na końcu części wspólnej dla 3 wariantów.
system: [
  { type: "text", text: skillMd + fragments + references,            // identyczne dla 3 wariantów
    cache_control: { type: "ephemeral" } },
  { type: "text", text: briefContext,                                 // identyczne dla 3 wariantów
    cache_control: { type: "ephemeral" } },
  { type: "text", text: presetDesignMd + variantInstructions },       // RÓŻNE per wariant — poza cache
],
```

Pułapki (z audytu + docs cachingu): (1) **Promise.all jednoczesny = zero hitów** — cache czytelny dopiero gdy pierwszy response zaczyna streamować; rozwiązanie: wystartuj wariant 1, po pierwszym tokenie odpal 2-3; (2) żadnych `Date.now()`/UUID w prefiksie (generatedAt wstawia KOD po odpowiedzi, nie prompt); (3) weryfikacja: `usage.cache_read_input_tokens > 0` w teście integracyjnym — inaczej silent invalidator; (4) min. prefiks Sonnet 4.6 = 2048 tokenów (nasz ~15k — OK).

## 4. Mapa sesji agentowych (prace z REMEDIATION_PLAN)

| Klasa zadania | Model | Effort | Przykłady |
|---------------|-------|--------|-----------|
| Mechaniczne: install, build, edycje docs, refactor strukturalny z testami | `claude-sonnet-4-6` | medium | R0.1, R0.2, R0.4, R1.1, R2.2, R3.5 |
| Standardowa implementacja z niejednoznacznościami | `claude-opus-4-8` | high | R2.1, R2.3, R3.4, R4.8 |
| ★ Krytyczne architektonicznie / kanon treści / przekrojowe refaktory | `claude-opus-4-8` | **xhigh** + protokół §Q (plan→implement→adversarial review w świeżej sesji→test gate) | R1.2, R1.3, R1.4, R3.3, R4.4-R4.7 |
| ★★ Jednorazowe artefakty najwyższej stawki | `claude-fable-5` | (adaptive, always-on) | Finalny pass nad kanonem 8 goldenów; druga opinia architektoniczna R1.2/R1.3; ontologia feedbacku |
| Panel sędziów treści (goldeny, voice) | 2× `claude-sonnet-4-6` + 1× `claude-opus-4-8` | high | Niezależne oceny wg rubryki; rozbieżność >1 = człowiek |

### Kiedy Fable 5, a kiedy nie

**TAK** (★★): wynik jest trwałym artefaktem, od którego zależą wszystkie przyszłe generacje (goldeny = wieczne few-shoty; ontologia = rdzeń feature'u), a koszt jednorazowy ($5-15 za pass) amortyzuje się w setkach runów. **NIE**: praca bieżąca, iteracyjna, łatwa do poprawienia — 2× cena Opusa + ~30% więcej tokenów (nowy tokenizer — nie przenoś `max_tokens` zmierzonych na innych modelach, re-baseline przez `count_tokens`) + turny po kilka minut. Uwagi API: thinking zawsze włączony (nie wysyłać parametru `thinking` poza `{type:"adaptive"}`), obsłużyć `stop_reason: "refusal"` zanim czyta się `content`, brak prefill, wymóg 30-dniowej retencji danych.

### Eskalacja i deeskalacja

- **Eskaluj o tier**, gdy: 2 iteracje nie domykają zadania; zadanie dotyka kontraktu cross-repo; output trafia bezpośrednio do klienta bez review.
- **Deeskaluj o tier**, gdy: zadanie ma golden/regression test, który łapie regresję automatycznie; praca jest czysto mechaniczna po zatwierdzonym planie.
- **Nigdy nie oszczędzaj na**: golden fixtures (R1.4), polskim copy widzianym przez klienta bez QA-bramy, decyzjach o schematach v1→v2.

## 5. Eval set — warunek bezpiecznej deeskalacji

Deeskalacja modelu (np. content na Sonnet zamiast Opus) jest legalna TYLKO przy istniejącym evalu: 8 briefów fixtures → generacja → (a) ajv pass, (b) sędzia deterministyczny pass, (c) panel score ≥ progu vs goldeny. Każda zmiana modelu/effort/promptu w runtime = przebieg evalu przed merge (Batches API, −50%, ~$1-2/przebieg). Wynik evalu = artefakt wykonania (rule 009/010).

## 6. Budżet — projekcja

| Pozycja | Szacunek |
|---------|----------|
| Remediation R0-R2 (sesje agentowe) | $60-125 jednorazowo |
| R3 (jakość) + goldeny z passem Fable | $70-140 jednorazowo |
| Runtime: 100 multi-variant runów/mies. (Sonnet + caching) | ~$55-65/mies. |
| Runtime: QA judge + regeneracje + feedback (narzut ~25%) | ~$15-20/mies. |
| Eval runs (Batches, ~8/mies.) | ~$10-15/mies. |
| **Razem operacyjnie** | **~$80-100/mies.** przy 100 klient-runach |

Próg rentowności trywialny: jeden klient-projekt pokrywa roczny koszt LLM.
