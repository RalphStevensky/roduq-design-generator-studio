# roduq-design-generator-studio

> AI-driven design generator z Anthropic skills. Fork [nexu-io/open-design](https://github.com/nexu-io/open-design) (Apache-2.0) z Roduq customizations. Produces design artifacts consumable by `@roduq/cli` w [roduq-web-starter](../roduq-web-starter/) monorepo.

## Status

🔴 **Pre-implementation** — repo zainicjowane, kod nie wzięty z upstream yet.

Aktualny stan = puste repo z `docs/` directory zawierającym pełne implementation plan dla autonomous agent execution.

## Co to ma być

Standalone aplikacja desktopowa (Next.js 16 + SQLite + Anthropic skills) która:

1. **User wpisuje brief** (industry / audience / tone / brand colors)
2. **AI generuje 3 design variants równolegle** (Conservative / Modern / Bold)
3. **User wybiera + exportuje** do `~/.roduq/output/{client-id}/`
4. **`@roduq/cli`** w roduq-web-starter consume artifacts i scaffolduje pełny client project z working Astro 6 + Payload CMS + dev server

**End-state**: brief → working AI-designed website w <5 minut (vs. 2-5 dni manual setup).

## Architecture overview

```
┌────────────────────────────────────────────────────────────────────────┐
│  roduq-design-generator-studio (TEN REPO)                              │
│  - Fork nexu-io/open-design                                            │
│  - 7 custom Roduq skills (saas-landing/agency/restaurant/etc.)         │
│  - 7 DESIGN.md system presets                                          │
│  - multi-variant skill (3 designs parallel)                            │
│  - MCP server (stdio) dla Claude Code w client repos                  │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ exports
┌────────────────────────────────────────────────────────────────────────┐
│  ~/.roduq/output/{client-id}/  ← file protocol contract                │
│    tokens.json + sections.json + content.json + design-system.md       │
└────────────────────────────────────────────────────────────────────────┘
                                  ↓ consumed by
┌────────────────────────────────────────────────────────────────────────┐
│  @roduq/cli (w roduq-web-starter monorepo)                             │
│  - Detects artifacts                                                   │
│  - Clones apps/marketing-starter                                       │
│  - Injects tokens + seeds Payload                                      │
│  - pnpm install + dev                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

Pełna architektura: [`docs/BRIDGE.md`](docs/BRIDGE.md).

## Documentation

| File | Purpose |
|---|---|
| [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) | **MAIN GUIDE** — 7-phase plan, Anthropic skills convention, JSON schemas, MCP spec, AI integration, industry references, definition of done. |
| [`docs/DESIGN_SYSTEMS.md`](docs/DESIGN_SYSTEMS.md) | 7 brand-agnostic preset specs z full color palettes + typography + voice + layout + inspiration links. |
| [`docs/AGENT_PROMPT.md`](docs/AGENT_PROMPT.md) | Copy-paste prompt dla nowej Claude Code sesji w tym repo. Self-contained marching orders. |
| [`docs/BRIDGE.md`](docs/BRIDGE.md) | Symbioza marketing-starter ↔ Open Design fork. File protocol, @roduq/cli orchestrator flow. |
| [`docs/decisions/0001-separate-repo.md`](docs/decisions/0001-separate-repo.md) | ADR — dlaczego separate repo, NIE monorepo z roduq-web-starter. |

## How to start work (parallel agent)

1. **Read** [`docs/AGENT_PROMPT.md`](docs/AGENT_PROMPT.md) end-to-end
2. **Open new Claude Code session** w tym folderze (`C:/Users/stefa/GIT/roduq-design-generator-studio/`)
3. **Paste startup prompt** (see CLAUDE.md lub AGENT_PROMPT.md)
4. **Agent execute autonomously** phase-by-phase z commit per phase
5. **Review pause points** — agent commits + pauses po każdej fazie, czeka na `kontynuuj`

Estimated effort: **~37h Opus solo + ~$45-70 LLM tokens** dla pełnej implementacji (Phase 1 fork → Phase 7 testing).

## Related repos

- **[roduq-web-starter](../roduq-web-starter/)** — main monorepo z Astro 6 + Payload CMS + 29 business modules. CONSUME artifacts z tego generator. **NIE łączymy kodem** — kontrakt = file protocol w `~/.roduq/output/`.
- **[nexu-io/open-design](https://github.com/nexu-io/open-design)** — upstream Apache-2.0 fork base.

## License

- **Apache-2.0** dla wszystkiego forked z upstream (zachowane bez zmian)
- **Proprietary © Roduq** dla Roduq additions — see `LICENSE-ROduQ.txt` (zostanie dodane po fork)

## Project tracking

Po starcie implementacji, agent powinien:
- Commit per phase (`feat(phase-1):`, `feat(skills):`, etc.)
- Update tego README z status badge per phase
- Update INVENTORY w `docs/INVENTORY.md` (na wzór roduq-web-starter)
