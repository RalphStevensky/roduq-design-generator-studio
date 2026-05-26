# Portfolio — Content Patterns

## Voice principles

### First-person, personal
- ❌ "Our process..." / "We deliver..."
- ✅ "Pracuję najlepiej gdy mogę spędzić tydzień z problemem zanim zacznę kodować."

### Show personality
- ❌ "Professional designer with 6 years of experience..."
- ✅ "Robię UX. Lubię typografię i feudalizm. Mieszkam w Warszawie."

### Authenticity over polish
- ❌ "Cutting-edge solutions delivered with excellence."
- ✅ "Czasem rzeczy idą jak po sznurku. Częściej trzeba zacząć od nowa po 2 tygodniach."

### Polish "Ty"
- Default dla peer-to-peer freelance audience
- EN equivalent: informal "you"
- Skip formal honorifics — portfolio = personal brand

## Per-section templates

### Hero copy

**Personal statement** (most common):
- PL pattern: "{Imię}. {Role} z {City}. {Specialty}."
- "Anna Nowak. Projektantka UX z Warszawy. Pracuję z SaaS B2B i fintech."
- "Marek. Full-stack engineer. TypeScript / Node / Postgres. Wrocław."
- "Aleksander. Fotograf editorial + portret. Kraków."

**Work-led** (latest project hero):
- "Ostatnio: {project description}. Dla {client}."
- "Ostatnio: redesign aplikacji mobilnej dla 50k użytkowników. Dla NXX Fintech."

**Statement** (designer/artist personality):
- 1-2 zdaniowy manifest/POV
- "Wierzę że dobra strona internetowa nie potrzebuje 20 sekund animacji żeby pokazać 3 słowa."

### Availability signal
- **Available**: "Dostępny dla nowych projektów" / "Open dla nowych zleceń"
- **Limited**: "Selektywnie nowe projekty — Q2 2026" / "Selective — limited slots"
- **Booked**: "Booked przez Q2 — Q3. Lista oczekujących open." 
- **Selective**: "Selective projects. Email z briefem dla discovery call."

Place w hero (subtle) lub w contact section (prominent).

### Work grid tile
```
[Project thumbnail — best visual]
{Project title}
{Client / Year}
{Tags / type}
```

PL example:
```
[Mockup screen — mobile app redesign]
NXX Mobile Banking — redesign
NXX Fintech · 2025
UX · UI · Design System
```

### Project detail page

Universal structure:
```
[Hero image — full-bleed best visual]

# {Project title}

Klient: {Client name}
Rok: {Year}
Rola: {My role}
Type: {UX / Branding / Photography / etc.}

## Brief

{1-paragraph problem statement}

## Proces

### {Phase 1} — {label}
{2-3 sentence description}
[Image / mockup]

### {Phase 2} — {label}
{2-3 sentence description}
[Image / mockup]

## Rezultat

[Large hero image of final outcome]

{1-2 paragraph outcome description}
{Optional metric — "+34% conversion" / "2 weeks faster delivery"}

## Refleksja

{1-paragraph what I learned / what I'd do differently}

Narzędzia: Figma · Notion · Loom
```

### About section
**Story-led** (preferred):
- 3-4 paragraphs w pierwszej osobie
- Origin / how got into this / what drives / where going
- Photo embedded

PL example:
> Zaczynałem od grafiki w Photoshopie w 2014. Wtedy nie wiedziałem co to UX.
> 
> Po 3 latach w agencji reklamowej zrozumiałem że projektowanie to nie jest o "ładnie wyglądać" — 
> jest o tym żeby coś działało dla konkretnej osoby z konkretnym problemem.
> 
> Od 2019 robię tylko UX/UI. Specjalizuję się w SaaS B2B i fintech — branżach gdzie 
> użytkownik jest zazwyczaj zestresowany i czasu nie ma na "wow factor".
> 
> Mieszkam w Warszawie. Lubię typografię i historię urbanistyki. 
> Dwa lata temu zacząłem trening biegania — okazało się że pomaga to thinking.

### Skills section
**Categorized list**:
```
Projektowanie
- UX research, persona mapping, journey mapping
- Figma (advanced), ProtoPie, Principle
- Design systems w Figma + Storybook

Development
- HTML / CSS / JavaScript (mid)
- Tailwind, React basics
- Webflow

Inne
- Notion, Linear, Loom dla async comm
- Płynny polski + angielski C1
```

**Tag cloud** (dla less formal):
```
UX  ·  UI  ·  Figma  ·  Design Systems  ·  Webflow  ·  Tailwind  ·  Notion  ·  Loom  ·  ProtoPie  ·  TypeScript basics  ·  Eng C1  ·  PL
```

### Contact

**Form + email combo**:
- Direct email visible (clickable mailto:)
- Form dla preference: "Quick brief" pattern
  - Co Cię tu sprowadziło? (long text)
  - Twój email
  - Budżet (range)
  - Timeline
- "Pisanie do mnie": email direct
- Calendly link dla discovery call

### Testimonials (gdy applicable)
```
"{Quote 1-2 sentences}"
{Client name}, {Role}, {Company}
{Project link → }
```

PL example:
> "Anna mocno wpływa na produkt. Nie wykonuje task list — buduje argumenty 
> dlaczego inaczej. Po 6 miesiącach widzę różnicę w product feedback."
> 
> Marek Kowalski, Head of Product, NXX Fintech
> [→ Zobacz projekt]

## Polish-specific

### Honorifics
- **"Ty"** default dla freelance portfolio (peer relationship)
- Exception: enterprise consulting positioning — "Państwo" w about gdy fine
- B2C creative work (photography weddings, art commissions): "Państwo" possible

### Bilingual (PL/EN) pattern
- PL primary at root (`/`)
- EN at `/en/`
- Switch button w nav (flag icons lub "PL / EN" toggle)
- About + project descriptions translated
- Brief / contact form bilingual

### Personal disclosure level
- Less formal Polish convention dla creatives — first name + hobby OK
- Some Polish freelancers add "Mieszkam w X. Lubię Y." — humanizes
- Photography portfolios: photographer's own portrait often missing — work speaks

## Length constraints

| Section | PL chars max |
|---|---|
| Hero title | 80 |
| Hero subtitle | 150 |
| Project tile title | 60 |
| Project tile tags | 80 (combined) |
| Project brief | 250 |
| About paragraph | 500 (per paragraph) |
| Testimonial quote | 200 |
| Contact form notes | unlimited (free-text) |

## Anti-patterns

❌ **Corporate "we" w personal portfolio** — confuses positioning
❌ **Stock smiling profile photo** — fake
❌ **Skill bars** — looks dated
❌ **Hidden contact info** — make hiring easy
❌ **"Cutting-edge" / "innovative"** — buzzwords w personal site = dissonance
❌ **No availability signal** — clients need to know if you can take work
✅ **Real informal photo** (preferred over polished headshot)
✅ **First-person voice throughout**
✅ **Work > self talk** (90% portfolio = work, 10% = you)
✅ **Specific tools / methods** (NIE generic "tech stack")
✅ **Visible email + form**
