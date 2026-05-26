# ADR-0003: Open Design fork w osobnym repo (nie w monorepo)

**Status:** accepted
**Data:** 2026-05-23
**Decydent:** Roduq
**Tagi:** architecture, integration

## Kontekst

Chcemy zintegrować [Open Design (nexu-io)](https://github.com/nexu-io/open-design) — Apache-2.0 lokalny generator designu — z naszym workflow. Pytanie: gdzie go umieścić?

Open Design to:
- ~100MB+ kodu (Next.js 16, SQLite, 132 skills, 150 design systems)
- Aktywnie rozwijany upstream (nexu-io regular commits)
- Apache-2.0 (vs nasza proprietary `roduq-web-starter`)
- Standalone aplikacja desktopowa (UI w browser, daemon w Node)

## Rozważane opcje

### Opcja A: Open Design jako `apps/design-generator-studio` w monorepo
- ✅ Wszystko w jednym repo, łatwy cross-package development
- ✅ Cross-cutting zmiany w pojedynczym PR
- ❌ +100MB obcego kodu w git history (slow git operations)
- ❌ Mixed licensing (Apache-2.0 vs proprietary)
- ❌ Trudniejsze pulls z upstream (merge conflicts, drift)
- ❌ Naszego `pnpm install` musi instalować deps Open Design — wolniej
- ❌ Turborepo cache traci na obecności obcego workspace

### Opcja B: Open Design jako git submodule w monorepo
- ✅ Kod w "naszym repo" ale jako reference
- ✅ Można aktualizować separately
- ❌ git submodules są notoryjnie kłopotliwe (developerzy zapominają o `--recurse-submodules`)
- ❌ Branchowanie/forking submodule = piekło
- ❌ CI musi obsłużyć submodules (extra config)

### Opcja C: Osobne repo `roduq-design-generator-studio` (fork od Open Design upstream) (Recommended)
- ✅ Niezależny lifecycle: aktualizacje upstream cherry-pickujemy controlowanie
- ✅ Czysta separacja licencji (Apache-2.0 zostaje, nie miesza się z proprietary)
- ✅ Mniejsze monorepo = szybsze operacje
- ✅ Open Design jest aplikacją desktop — niezależny deploy
- ✅ Bridge przez `.roduq/output/` (file system) + `@roduq/cli` — clean interface
- ⚠ Brak atomic commits cross-repo — wymaga koordynacji
- ⚠ Developer musi sklonować 2 repo zamiast 1

## Decyzja

**Opcja C: osobne repo `roduq-design-generator-studio` (fork upstream Open Design).**

Czynniki:
1. **Licensing** — Apache-2.0 i proprietary mieszanie w jednym repo to recipe for legal headache w przyszłości (gdy może otworzymy moduł open-source albo gdy klient pyta o licencję)
2. **Update flow** — Open Design jest aktywnie rozwijany, chcemy mieć łatwą drogę do cherry-pick'owania features upstream. Submodule jest piekłem, monorepo merge to konflikt po koncepcie.
3. **Wielkość repo** — nasze `pnpm install` ma być fast. Każdy nowy klon Open Design w monorepo to ~80MB+ dependencies extra.
4. **Architektura** — Open Design to standalone desktop app. Nasza marketing-starter to web app + Astro server. Życie tych dwóch jest fundamentalnie różne — separacja repo odzwierciedla separację concern.
5. **Bridge wystarczy** — komunikacja przez file system (`.roduq/output/`) + CLI (`@roduq/cli`) jest jasna, debuggable, nie wymaga atomic commits.

## Konsekwencje

### Pozytywne
- Czyste licencje
- Szybkie `pnpm install` w roduq-web-starter
- Łatwy update upstream Open Design
- Można niezależnie open-source roduq-design-generator-studio (jeśli kiedyś)

### Negatywne
- Developer musi sklonować 2 repo (`roduq-web-starter` + `roduq-design-generator-studio`)
- Brak atomic commits — zmiana w schemach `.roduq/output/` wymaga koordynacji
- CI w `roduq-design-generator-studio` musi być setup oddzielnie

### Co trzeba zrobić
- [ ] Fork Open Design upstream do `https://github.com/Roduq/roduq-design-generator-studio` (v0.4.0)
- [ ] Sklonowanie lokalnie do `C:/Users/stefa/GIT/roduq-design-generator-studio/`
- [ ] Pierwszy customization: nasze skills + DESIGN.md systems + multi-variant skill
- [ ] Bridge przez `@roduq/cli` (file watcher na `.roduq/output/`)
- [ ] Dokumentacja w `.docs/BRIDGE.md` (DONE)
- [ ] Schema versioning dla `.roduq/output/*.json` (TBD ADR)

## Linki

- Open Design: [github.com/nexu-io/open-design](https://github.com/nexu-io/open-design)
- Powiązane: ADR-0004 (modules as packages), `.docs/BRIDGE.md`
