# roduq-design-generator-studio

> AI-driven design generator z Anthropic skills. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0) z Roduq customizations. Produkuje design artifacts consumable by `@roduq/cli` w [roduq-web-starter](../roduq-web-starter/) monorepo.

## Status

🎉 **All 7 phases done — Roduq Design Generator Studio v1.0 architecture + definitions complete.**

| Phase | Status | Scope |
|-------|--------|-------|
| 1 | ✅ done | Fork + Roduq rebrand + LICENSE-ROduQ.txt + .env.example |
| 2 | ✅ done | 7 Roduq skills (saas-landing / agency / restaurant / clinic / real-estate / product-launch / portfolio) |
| 3 | ✅ done | 7 Roduq presets (roduq-default / roduq-monolith-meadow / roduq-tech-modern / roduq-warm-editorial / roduq-brutalist / roduq-soft-pastel / roduq-dark-cinematic) |
| 4 | ✅ done | Multi-variant skill (3 designs parallel — KEY differentiator) |
| 5 | ✅ done | File export protocol + JSON Schema v1 ajv validation |
| 6 | ✅ done | MCP stdio server (3 tools dla Claude Code bridge) |
| 7 | ✅ done | Test scaffolds + production polish docs + E2E runbook + INVENTORY + final retrospective |

Pełny phase plan: [`.docs/AGENT_PROMPT.md`](.docs/AGENT_PROMPT.md) i [`.docs/IMPLEMENTATION.md`](.docs/IMPLEMENTATION.md).

## End-state

User wpisuje brief → AI generuje 3 design variants równolegle → user wybiera + eksportuje do `~/.roduq/output/{client-id}/` → `@roduq/cli` (w roduq-web-starter) consume artifacts i scaffolduje pełny client project z working Astro 6 + Payload CMS + dev server.

**Czas**: brief → working AI-designed website w **<5 min** (vs. 2-5 dni manual setup).

## Architecture overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  roduq-design-generator-studio (TEN REPO)                              │
│  Fork nexu-io/open-design — monorepo pnpm + Node 24                    │
│    apps/web        — Next.js 16 App Router + React 18 (UI)             │
│    apps/daemon     — CLI (`od`) + /api/* + skills + design systems     │
│    apps/desktop    — Electron shell                                    │
│    apps/packaged   — packaged Electron runtime entry                   │
│    apps/landing-page — Astro 6 marketing                               │
│    packages/*      — contracts / host / platform / sidecar / etc.      │
│  + Roduq additions:                                                    │
│    skills/roduq-*           — 7 Roduq custom skills                    │
│    design-systems/*         — 7 Roduq brand-agnostic presets           │
│    skills/multi-variant     — 3 designs parallel generator             │
│    src/mcp-server.ts        — Claude Code MCP bridge                   │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ exports
┌────────────────────────────────────────────────────────────────────────┐
│  ~/.roduq/output/{client-id}/  ← file protocol contract                │
│    tokens.json + sections.json + content.json + design-system.md       │
│    + preview.html + meta.json + .complete flag                         │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ consumed by
┌────────────────────────────────────────────────────────────────────────┐
│  @roduq/cli (w roduq-web-starter monorepo)                             │
│  Detects artifacts → clones apps/marketing-starter → injects tokens →  │
│  seeds Payload → pnpm install + dev                                    │
└────────────────────────────────────────────────────────────────────────┘
```

Pełna architektura: [`.docs/BRIDGE.md`](.docs/BRIDGE.md).

## Documentation

### Roduq operational rules (auto-loaded w Cursor IDE)

| Rule | Scope |
|------|-------|
| [`README`](.cursor/rules/README.md) | Index 9 rules + sync policy |
| [`009-docs-sync`](.cursor/rules/009-docs-sync.mdc) ⭐ META | Sync `.docs/` + `.cursor/rules/` razem |
| [`001-project-overview`](.cursor/rules/001-project-overview.mdc) | Repo overview, stack, end-state |
| 002-008 (per glob) | Skills convention, design systems, file protocol, coding standards, git workflow, LLM providers, MCP server |

### Narrative documentation (deep context)

| File | Purpose |
|---|---|
| [`.docs/AGENT_PROMPT.md`](.docs/AGENT_PROMPT.md) ⭐ | Copy-paste master prompt z 7-phase execution plan |
| [`.docs/IMPLEMENTATION.md`](.docs/IMPLEMENTATION.md) | Detailed phase plan + Anthropic skills convention + JSON schemas + MCP spec + industry references |
| [`.docs/DESIGN_SYSTEMS.md`](.docs/DESIGN_SYSTEMS.md) | 7 brand-agnostic preset specs (full palettes + typography + voice + layout principles) |
| [`.docs/BRIDGE.md`](.docs/BRIDGE.md) | File protocol contract z roduq-web-starter (sister repo) |
| [`.docs/decisions/0001-separate-repo.md`](.docs/decisions/0001-separate-repo.md) | ADR — dlaczego separate repo, NIE monorepo |

### Upstream documentation (Open Design)

Upstream `nexu-io/open-design` documentation:
- [`AGENTS.md`](AGENTS.md) — canonical agent guide (workspace layout, dev workflow, capability dual-track)
- [`QUICKSTART.md`](QUICKSTART.md) — fastest path do action
- [`CONTEXT.md`](CONTEXT.md) — domain language glossary
- [`README.md`](README.md) (ten plik) — Roduq-specific overview
- Upstream README zostawione w innych językach (`README.{de,es,fr,ja-JP,ko,pt-BR,ru,tr,uk,zh-CN,zh-TW,ar}.md`)

## Quick start (lokalnie)

```powershell
# 1. Install dependencies (Windows: requires VS Build Tools 2022+ dla better-sqlite3 compile)
# Note: pnpm 10.33.2 + Node 24 required. NIE używaj corepack na Windows (EPERM).
npm install -g pnpm@10.33.2
pnpm install

# 2. Copy env template
copy .env.example .env.local
# Wypełnij ANTHROPIC_API_KEY (lub OPENAI_API_KEY / GOOGLE_API_KEY)

# 3. Run dev (upstream tools-dev — NIE pnpm dev)
pnpm tools-dev
# Web port (Next.js): assigned by tools-dev (export OD_WEB_PORT)
# Daemon port: assigned by tools-dev (export OD_PORT)
# Override z --daemon-port / --web-port flags jeśli potrzeba.
```

Windows native is **best-effort** per upstream `AGENTS.md`. Primary support: macOS / Linux / WSL2.

## How to start work (parallel agent — phase 2-7)

1. **Read** [`.docs/AGENT_PROMPT.md`](.docs/AGENT_PROMPT.md) end-to-end
2. **Open new Claude Code session** w tym folderze
3. **Paste startup prompt** z CLAUDE.md (root)
4. **Agent executes autonomously** phase-by-phase z commit per phase
5. **Review pause points** — agent commits + pauses po każdej fazie, czeka na `kontynuuj`

Estimated remaining effort: **~33h Opus solo + ~$45-70 LLM tokens** dla Phase 2-7.

## Related repos

- **[roduq-web-starter](../roduq-web-starter/)** — main monorepo z Astro 6 + Payload CMS + 29 business modules. CONSUME artifacts z tego generator. **NIE łączymy kodem** — kontrakt = file protocol w `~/.roduq/output/`.
- **[nexu-io/open-design](https://github.com/nexu-io/open-design)** — upstream Apache-2.0 fork base (52k stars, active development by nexu-io).

## License

**Dual license** — patrz [`LICENSE`](LICENSE) (Apache-2.0 dla upstream) + [`LICENSE-ROduQ.txt`](LICENSE-ROduQ.txt) (Proprietary © Roduq dla Roduq additions).

- **Apache-2.0** dla wszystkiego forked z upstream (zachowane bez zmian — `apps/`, `packages/`, `tools/`, `skills/` upstream, `design-systems/` upstream, etc.)
- **Proprietary © Roduq** dla Roduq additions (skills/roduq-*, design-systems/{nasze presets}, multi-variant, src/output/, src/mcp/, .docs/, .cursor/rules/, CLAUDE.md, etc.) — patrz `LICENSE-ROduQ.txt` dla full list

## Project tracking

Per `.cursor/rules/006-git-workflow.mdc`:
- Commit per phase (`feat(phase-N):`, `feat(skills):`, `feat(presets):`, etc.)
- Update tego README z status badge per phase
- **CRITICAL** (rule 009 META): każda nowa decyzja/wzorzec → update OBYDWA `.docs/` + `.cursor/rules/`
