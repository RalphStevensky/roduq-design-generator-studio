# SaaS Landing — Content Patterns

> Copy structure templates dla `roduq-saas-landing` skill. Polish primary + EN backup. Voice principles + per-section templates.

## Voice principles

### Active voice > passive
- ❌ "Faktury są generowane automatycznie przez nasz system."
- ✅ "Generujemy faktury automatycznie. Ty tylko klikasz wyślij."

### "Ty" / "you" (informal Polish)
- ❌ "Państwo otrzymają..." (formal — używaj tylko dla finance/legal/medical)
- ✅ "Otrzymasz powiadomienie..." (informal — domyślne dla SaaS B2B i B2C)
- Wyjątek: enterprise SaaS targeting C-level CFO/CIO → formal może być appropriate

### Konkretne benefits > abstract features
- ❌ "Zaawansowana automatyzacja procesów księgowych."
- ✅ "Zaoszczędzisz 5h tygodniowo na ręcznym wystawianiu faktur."

### Numeric proof w hero
- "12 000+ freelancerów korzysta"
- "98% retention po pierwszym roku"
- "Średnia oszczędność: 4.2h tygodniowo"

### NIE używaj corporate-speak
- ❌ "Kompleksowe rozwiązanie", "synergia", "best-in-class", "rewolucyjny", "nowej generacji"
- ✅ Konkretne czasowniki + nazwane benefits

## Per-section copy templates

### Hero

**Title pattern** (PL):
- `{Konkretny benefit}. {Dla kogo}.`
- Examples:
  - "Księgowość bez nerwów. Dla freelancerów."
  - "Faktury w 30 sekund. Bez Excela."
  - "Cashflow który widzisz. Decyzje które rozumiesz."

**Title pattern** (EN):
- `{Concrete benefit}. {For whom}.`
- Examples:
  - "Stress-free accounting. For freelancers."
  - "Invoices in 30 seconds. Without Excel."

**Subtitle pattern** (1-2 sentences):
- PL: "{Co konkretnie robi product} {Dla kogo / w jakim kontekście}. {Optional differentiator vs konkurencji}."
- "Generujemy faktury, przypominamy o płatnościach i prognozujemy cashflow. Dla freelancerów którzy wolą programować niż liczyć podatki."

**CTAs**:
- Primary: "Zacznij za darmo" / "Get started free" — frictionless trial
- Secondary: "Zobacz demo (3 min)" / "Watch demo (3 min)" — content marketing

### Social Proof (logos strip)

**Header pattern**:
- PL: "Zaufali nam:" / "Ponad 12 000 freelancerów już korzysta:"
- EN: "Trusted by:" / "Used by 12,000+ freelancers:"

Display 8-12 logos. Grayscale by default, color on hover.

### Features (3-col-icons)

**Per feature template**:
- **Icon**: Lucide-react / Iconify — semantic, simple
- **Title (PL)**: 2-4 słowa, action-oriented. "Automatyczne faktury", "Prognozy cashflow", "Integracje 1-click"
- **Description (PL)**: 1-2 sentences. Benefit-focused. "Wystawiaj faktury jednym kliknięciem. System sam wypełnia dane klienta z bazy."

**Patterns dla 3 features na hero**:
- Most common SaaS triad: **Save time** / **Make better decisions** / **Connect existing workflow**
- B2B variant: **Automation** / **Insights** / **Integrations**
- DevTools variant: **Observability** / **Reliability** / **Developer Experience**

### Pricing (3-tier)

**Tier names** (best practice):
- Tier 1: "Start" / "Free" / "Hobby" — generous free trial
- Tier 2: "Pro" / "Plus" / "Studio" — most popular (highlight)
- Tier 3: "Business" / "Team" / "Enterprise" — high-touch

**Per-tier copy structure**:
```
{Tier name}
{Tagline — 1 sentence}
{Price + period}
{CTA}

Includes:
- {Benefit 1 — concrete}
- {Benefit 2 — concrete}
- {Benefit 3 — concrete}
```

**Polish tier descriptions** (przykład):
- Start: "Darmowy plan dla pojedynczych freelancerów. Bez ograniczeń czasowych."
- Pro: "Dla aktywnych freelancerów. Pełne automatyzacje + integracje."
- Business: "Dla agencji i zespołów. Multi-user + dedicated support."

### Testimonials

**Format**:
- Quote (1-3 sentences max)
- Name + role + company (z logo / avatar)
- Specific outcome ("Zaoszczędziłem 6h tygodniowo" > "Świetna apka")

**Pattern (PL)**:
> "{Konkretna ocena z konkretnym benefitem}." — {Imię}, {Rola}, {Firma}

> "Zaoszczędziłem 6h tygodniowo na fakturach. Przeznaczam ten czas na development." — Marek K., Frontend Developer, Self-employed

### FAQ

**Question patterns** (top 5 SaaS FAQ universals):
1. "Czy są jakieś dodatkowe koszty?" / "Are there any hidden fees?"
2. "Jak długo trwa setup?" / "How long does setup take?"
3. "Czy mogę zrezygnować w każdej chwili?" / "Can I cancel anytime?"
4. "Z jakimi narzędziami się integrujecie?" / "What integrations do you support?"
5. "Czy moje dane są bezpieczne?" / "Is my data secure?" (GDPR / SOC 2 mention)

**Answer patterns**:
- Direct, no hedging
- Specific numbers gdy applicable ("Setup zajmuje średnio 4 minuty.")
- Link to deeper docs gdy potrzeba

### CTA (closing)

**Title pattern**:
- PL: "Gotowy {benefit}?" / "{Benefit} już dziś."
- "Gotowy zaoszczędzić 5h tygodniowo?"
- "Bezbolesna księgowość — zacznij za 2 minuty."

**Subtitle** (optional): trust signals ("Bez karty kredytowej. 14 dni za darmo.")

**CTA buttons**:
- Primary: action verb + benefit ("Załóż konto za darmo")
- Optional secondary: lower commitment ("Wypróbuj demo")

## Polish-specific copy considerations

### Diacritics test
Każdy wygenerowany copy musi zawierać Polish chars. Verification phrase: **"Łódź żółw pięć słów"** — jeśli renders OK we wszystkich fontach + browsers, pass.

### Numbers + currency
- Spaces in numbers: "12 000" (NIE "12,000")
- PLN by default: "29 zł/miesiąc" (lowercase "zł", "/miesiąc" preferred over "/mc")
- USD/EUR toggle dla international audience

### Dates
- DD.MM.YYYY format (NIE MM/DD/YYYY)
- "5 maja 2026" (descriptive form acceptable in body)

### Phone numbers
- +48 prefix optional
- Format: "+48 123 456 789" lub "123 456 789"

### Honorifics
- B2B SaaS: skip "Pan/Pani" — direct "Ty"
- Enterprise: "Państwo" w forms only

## Length constraints

| Section | PL chars (max) | EN chars (max) |
|---|---|---|
| Hero title | 60 | 50 |
| Hero subtitle | 150 | 130 |
| Feature title | 30 | 25 |
| Feature description | 150 | 130 |
| Testimonial quote | 200 | 180 |
| CTA button | 25 | 20 |
| FAQ question | 80 | 70 |
| FAQ answer | 300 | 270 |

Polish trends ~15% longer than English — buffer adequate.

## SEO meta

**Title pattern**:
- `{Product} — {Main benefit} | {Brand}`
- "FreshBooks Alternative — Księgowość dla Freelancerów | YourBrand"

**Meta description**:
- 140-160 chars
- Include primary keyword + CTA
- "Automatyczne faktury, prognozy cashflow, 12k+ freelancerów. Wypróbuj 14 dni za darmo. Bez karty."

## Anti-patterns

❌ **Generic openers** ("Welcome to {product}!" / "Witamy na {strona}!") — wastes hero real estate
❌ **Vague benefits** ("Optymalizacja procesów" / "Optimize your workflow") — no proof, no specificity
❌ **Stock testimonials** ("Great product!" / "Świetna apka!") — sounds fake
❌ **Hidden pricing** ("Contact us for pricing") — kills conversion w small/mid-market SaaS
❌ **Wall-of-text features** (paragraphs descriptions) — use bulleted benefit lists
❌ **Industry jargon bez context** — define inline or link to glossary
