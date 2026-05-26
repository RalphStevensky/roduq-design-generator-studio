# Design Generator Bridge

> Jak `roduq-web-starter` (monorepo) i `roduq-design-generator-studio` (fork [Open Design](https://github.com/nexu-io/open-design)) komunikują się w sposób, który daje natywne uczucie jednego workflow, mimo że to dwa osobne repo.

## TL;DR

```
prompt → Open Design fork (UI w przeglądarce) → 3 warianty wizualne →
user wybiera → eksport do .roduq/output/{client-id}/ →
@roduq/cli czyta artefakty → bootstrap projektu klienta z apps/marketing-starter →
inject design tokens + content drafts + sections → pnpm dev → preview
```

Klej między dwoma światami: **`@roduq/design-tokens` (shared package) + `.roduq/output/` (file-system protocol) + `@roduq/cli` (orchestrator)**.

---

## 1. Dlaczego dwa osobne repo

Patrz ADR-0003 (`docs/decisions/0003-open-design-separate-repo.md`).

**Skrót:**
- Open Design to ~100MB+ kodu Next.js 16 + SQLite + 132 skills + 150 design systems. **Włożenie tego do monorepo zaśmieci git history i complicate updates upstream.**
- Open Design jest pod Apache-2.0 — nasza warstwa proprietary, więc rozdzielamy licencje
- Open Design będzie dostawał updates od upstream (nexu-io) — łatwiej cherry-pickować w osobnym repo
- Open Design ma własny lifecycle deployment (lokalna aplikacja desktopowa) — inny niż marketing-starter

---

## 2. Architektura symbiozy

```
┌────────────────────────────────────────────────────────────────────────┐
│  USER                                                                  │
│  cd C:/Users/stefa/clients                                             │
│  $ roduq new acme-corp --with-design-generator                         │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  @roduq/cli                                                            │
│  - Wykrywa: Open Design running? Jeśli nie → pyta o autostart          │
│  - Otwiera browser: http://localhost:8765/?project=acme-corp           │
│  - Czeka na artefakt w .roduq/output/acme-corp/                        │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                  ┌───────────────┴───────────────┐
                  ↓                               ↓
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│  roduq-design-generator-studio   │ │  @roduq/cli (wait state)         │
│  (fork Open Design)              │ │  - File watcher na               │
│                                  │ │    .roduq/output/acme-corp/      │
│  1. Form: brief, audience, tone  │ │  - Polling co 500ms              │
│  2. Brand: URL / file / none     │ │                                  │
│  3. Multi-variant skill          │ │                                  │
│     → generuje 3 HTML preview    │ │                                  │
│  4. User picks variant           │ │                                  │
│  5. Export wybranego do:         │ │                                  │
│     .roduq/output/acme-corp/     │ │                                  │
│       design-system.md           │ │                                  │
│       tokens.json                │ │                                  │
│       sections.json              │ │                                  │
│       content.json               │ │                                  │
│       preview.html               │ │                                  │
└──────────────────────────────────┘ └──────────────────────────────────┘
                                                  │
                                                  ↓ detects artifacts
┌────────────────────────────────────────────────────────────────────────┐
│  @roduq/cli                                                            │
│  1. Czyta .roduq/output/acme-corp/                                     │
│  2. Kopiuje apps/marketing-starter → C:/clients/acme-corp/             │
│  3. Wstrzykuje:                                                        │
│     - tokens.json → src/styles/client-theme.css (CSS vars override)    │
│     - design-system.md → docs/DESIGN.md (dla deweloperów)              │
│     - sections.json → Payload seed (homepage blocks)                   │
│     - content.json → Payload seed (page content drafts)                │
│  4. Generuje .env, roduq.config.ts                                     │
│  5. pnpm install                                                       │
│  6. supabase db push (jeśli Supabase włączony)                        │
│  7. payload seed                                                       │
│  8. pnpm dev w nowym terminalu                                         │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ↓
┌────────────────────────────────────────────────────────────────────────┐
│  http://localhost:4321 — działający preview z designem AI              │
│  http://localhost:3000/admin — Payload do dalszej edycji               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. File protocol — `.roduq/output/{client-id}/`

**Lokalizacja:** `${HOME}/.roduq/output/` lub `$ROduQ_OUTPUT_DIR` env override.

**Pliki które Open Design fork produkuje:**

### `design-system.md` (markdown, human-readable)
Standardowy DESIGN.md format Open Design (zgodny z Anthropic skills convention).

```markdown
# Acme Corp — Design System

## Brand pillars
- Confidence + warmth
- Professional but approachable
- ...

## Colors
- Primary: #0F4C75
- Surface: #FAFAF7
- ...

## Typography
- Display: Recoleta, serif
- Body: Inter, sans-serif
- ...

## Voice
- Direct, helpful
- Uses "you" not "users"
- ...
```

### `tokens.json` (strukturalny, machine-readable)

```json
{
  "$schema": "https://roduq.dev/schemas/design-tokens-v1.json",
  "version": "1.0.0",
  "generatedAt": "2026-05-23T19:45:00Z",
  "generatedBy": "open-design-fork@1.0.0",
  "sourcePrompt": "SaaS landing for accounting freelancer tool, audience 30-40, tone professional but light",
  "selectedVariant": 2,
  "tokens": {
    "color": {
      "surface": {
        "default": "#FAFAF7",
        "raised": "#FFFFFF",
        "sunken": "#F0EFEA"
      },
      "ink": {
        "primary": "#1A1C19",
        "secondary": "#525249",
        "accent": "#0F4C75"
      },
      "outline": {
        "default": "rgba(26, 28, 25, 0.12)",
        "strong": "rgba(26, 28, 25, 0.2)"
      },
      "brand": {
        "primary": "#0F4C75",
        "secondary": "#FFA552"
      }
    },
    "font": {
      "display": "Recoleta, serif",
      "body": "Inter, system-ui, sans-serif",
      "mono": "JetBrains Mono, monospace"
    },
    "radii": { "sm": "0.25rem", "md": "0.5rem", "lg": "1rem", "full": "9999px" },
    "spacing": { ... },
    "shadow": { ... }
  }
}
```

### `sections.json` (Payload-ready)

Block-by-block opis jak ułożyć homepage (lub inne strony):

```json
{
  "$schema": "https://roduq.dev/schemas/payload-sections-v1.json",
  "homepage": {
    "blocks": [
      {
        "blockType": "hero-carousel",
        "variant": "split-image-right",
        "title": "Księgowość bez nerwów. Dla freelancerów.",
        "subtitle": "Automatyzacja faktur, podatków i przypomnień...",
        "cta": { "primary": "Zacznij za darmo", "secondary": "Zobacz demo" },
        "imageRef": "hero-1"
      },
      { "blockType": "features-grid", "variant": "3-col-icons", "items": [ ... ] },
      { "blockType": "pricing", "variant": "3-tier", "plans": [ ... ] },
      { "blockType": "testimonials", "variant": "marquee", "items": [ ... ] },
      { "blockType": "faq", "items": [ ... ] },
      { "blockType": "cta", "variant": "centered-gradient", ... }
    ]
  },
  "pages": {
    "/about": { "blocks": [...] },
    "/pricing": { "blocks": [...] },
    "/contact": { "blocks": [...] }
  }
}
```

### `content.json` (drafty tekstów)

```json
{
  "siteSettings": {
    "siteName": "Acme Corp",
    "tagline": "...",
    "metaDescription": "...",
    "footer": { "copyright": "...", "socialLinks": [...] }
  },
  "draftCopy": {
    "homepage-hero-title": "...",
    "homepage-hero-subtitle": "...",
    "features-1-title": "...",
    "...": "..."
  },
  "imagePrompts": {
    "hero-1": "Modern accountant at desk with laptop, warm natural lighting...",
    "feature-1": "...",
    "...": "..."
  }
}
```

### `preview.html` (snapshot, dla weryfikacji)
Statyczny HTML wygenerowany przez Open Design — do podglądu i porównania z wybranym variant.

---

## 4. `@roduq/cli` — orchestrator

### Komendy

```bash
roduq new <client-name> [--with-design-generator] [--from-output <path>]
roduq generate                    # tylko design step (jeśli już masz projekt)
roduq module add <module-name>
roduq deploy <env>                # coolify, vercel, ...
```

### `roduq new <name>` flow

```typescript
// packages/cli/src/commands/new.ts (uproszczone)
async function newCommand(name: string, options) {
  // 1. Walidacja: czy folder już istnieje?
  // 2. Decyzja: startujemy z design generatora czy bez?
  if (options.withDesignGenerator) {
    const outputDir = `${HOME}/.roduq/output/${name}`;
    await openDesignGenerator(name, outputDir);  // uruchamia browser
    await waitForArtifact(outputDir);            // file watcher
  }

  // 3. Kopiowanie template
  await copyTemplate(
    "apps/marketing-starter",
    `${options.targetDir ?? "."}/${name}`
  );

  // 4. Wstrzykiwanie design tokens
  if (artifactExists) {
    const tokens = await readJson(`${outputDir}/tokens.json`);
    const css = tokensToCss(tokens);
    await writeFile(`${target}/src/styles/client-theme.css`, css);
  }

  // 5. Payload seed
  if (artifactExists) {
    const sections = await readJson(`${outputDir}/sections.json`);
    const content = await readJson(`${outputDir}/content.json`);
    await generatePayloadSeed(target, sections, content);
  }

  // 6. .env generation
  await generateEnv(target, { ... });

  // 7. roduq.config.ts
  await generateConfig(target, { modules: [] });

  // 8. Install + dev
  await pnpmInstall(target);
  await runDev(target);
}
```

---

## 5. Open Design fork — co konkretnie robimy

### Custom skills (`roduq-design-generator-studio/skills/`)

- `roduq-saas-landing/` — generuje pełną stronę z hero+features+pricing+CTA+testimonials+FAQ
- `roduq-agency/` — strona-wizytówka agencji kreatywnej
- `roduq-restaurant/` — restauracja, menu, rezerwacje
- `roduq-clinic/` — gabinet, lekarz, dietetyk
- `roduq-real-estate/` — biuro nieruchomości
- `roduq-product-launch/` — landing dla nowego produktu z waitlist
- `roduq-portfolio/` — portfolio freelancera/agencji

Każda skill ma `SKILL.md` + `assets/template.html` (snippet do iframe) + `references/` (dodatkowe info dla agenta).

### Custom DESIGN.md systems

- `default/` — neutral, "starter" preset
- `monolith-meadow/` — wzorzec z twierdza_boyen (sanityzowany, brand-agnostic)
- `tech-modern/` — clean, modern, tech focus
- `warm-editorial/` — magazine-style, warm tones
- `brutalist/` — bold, raw, statement
- `soft-pastel/` — gentle, friendly
- `dark-cinematic/` — premium dark theme

### Multi-variant skill (`multi-variant/`)

Nowy skill specjalnie dla nas — **generuje 3 warianty równolegle**:

1. Bierze input prompt + brand info
2. Agent (Claude Code / Cursor) generuje 3 designy w 3 różnych kierunkach:
   - **Conservative** — bezpieczny, sprawdzony layout
   - **Modern** — current trends, animations heavy
   - **Bold** — wyrazisty, statement piece
3. User widzi 3 preview side-by-side
4. Wybiera 1 → export do `.roduq/output/`

---

## 6. MCP bridge (opcjonalny, dla advanced users)

Open Design ma już built-in **MCP server** (stdio). Wyposażony Claude Code w repo klienta może:

```jsonc
// C:/clients/acme-corp/.claude/settings.json
{
  "mcpServers": {
    "roduq-design": {
      "command": "node",
      "args": ["C:/Users/stefa/GIT/roduq-design-generator-studio/dist/mcp-server.js"],
      "env": { "OD_PROJECT_ID": "acme-corp" }
    }
  }
}
```

Wtedy Claude Code w repo klienta może np.:
- "Daj mi zaktualizowany hero block z aktualnego designu Open Design"
- "Co Open Design wyeksportował dla sekcji pricing? Zaktualizuj Payload seed"

Bez kopiowania ZIP-ów ręcznie.

---

## 7. Wersjonowanie schematów

Kluczowe pliki `.json` mają `$schema` field. Schemas hostowane na `https://roduq.dev/schemas/` (TBD) + lokalna kopia w `packages/cli/schemas/`.

Zmiana schema = bump version + migration script w `@roduq/cli` (CLI rozumie wiele wersji schematu).

---

## 8. Co kiedy Open Design jest niedostępny?

CLI ma fallbacks:

```bash
# Bez design generatora — pusty start (manual)
roduq new acme-corp

# Z istniejących artefaktów (ktoś już wygenerował, podaje ścieżkę)
roduq new acme-corp --from-output ./my-design-package/

# Z gotowego preset (bypass design generatora)
roduq new acme-corp --preset warm-editorial
```

---

## 9. Roadmapa bridge'a

Patrz `docs/ROADMAP.md` § v0.4.0 — całość bridge'a planowana na tydzień 5.

Etap implementacji:

1. **v0.4.0-alpha** — `@roduq/cli new` bez generatora (kopia template + manual customization)
2. **v0.4.0-beta** — `@roduq/cli` czyta `.roduq/output/` (jeśli istnieje) — bez integracji z UI Open Design
3. **v0.4.0** — pełna integracja: CLI auto-uruchamia Open Design, file watcher, async workflow
4. **v0.4.1+** — MCP bridge dla Claude Code w repo klienta
5. **v1.0.0** — multi-variant skill jako stable feature Open Design fork

---

## 10. Open questions

- ❓ Czy Open Design fork i marketing-starter dzielą `@roduq/design-tokens` jako git submodule, czy jako npm package (publikowany do GitHub Packages)? **Lean:** GitHub Packages (cleaner). ADR-TBD.
- ❓ Czy `.roduq/output/` jest globalne (`$HOME/.roduq/output/`) czy per-workspace? **Lean:** globalne (łatwiejsze dla CLI auto-detection). ADR-TBD.
- ❓ Czy CLI używa Bun/Deno/Node? **Lean:** Node 22+ (compatibility z Astro/Payload). ADR-TBD.
- ❓ Czy preview Open Design może być HMR'owany do projektu klienta (live sync)? **Lean:** v2.0 stretch. Na v1.0: jednorazowy snapshot eksport.
