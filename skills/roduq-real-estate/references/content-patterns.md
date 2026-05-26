# Real Estate — Content Patterns

## Voice principles

### Neighborhood expertise visible
- ❌ "Świetna lokalizacja"
- ✅ "Mieszkanie 3 min od Tesco, 8 min do tramwaju, blisko parku Krakowskiego."

### Realistic > hype
- ❌ "Mieszkanie do przeprowadzki!" (gdy wymaga remontu)
- ✅ "Mieszkanie do remontu — układ funkcjonalny, instalacje do wymiany."

### Polish honorifics
- Default: **"Państwo / Pan / Pani"** dla real estate (formal context)
- Single agent z personal brand: może być "Ty" w hero, "Państwo" w business contact
- Premium / luxury: zawsze "Państwo"

### Tax + finance transparent
- "Cena netto: X zł / Cena brutto z VAT 8%: Y zł" (dla deweloperów)
- "Cena: X zł + notariat ~3000 zł + opłaty sądowe ~500 zł"
- Commission: "Prowizja: 2% (po obu stronach)" / "Prowizja: tylko ze strony sprzedającego"

## Per-section templates

### Hero
- PL pattern: "{Property type} w {City}. {Neighborhoods}."
- "Mieszkania na sprzedaż w Krakowie. Stare Miasto. Kazimierz. Podgórze."
- "Premium nieruchomości w Warszawie. Mokotów. Powiśle. Stare Miasto."

Search bar fields:
- Lokalizacja (autocomplete dropdown)
- Typ (sprzedaż / wynajem)
- Cena (slider range w PLN)
- Pokoi (1+ / 2+ / 3+ / 4+)
- Powierzchnia min m²

### Property listing card
```
[Photo — best room or facade, 16:9]
[Tag: Nowość | Obniżka | Premium | Sprzedaż | Wynajem]
{Price} zł {/miesiąc dla wynajmu}
{Property title — address or identifier}
{m²} m² · {rooms} pokoje · {floor}/{floors} · {year}
{1-line neighborhood context}
[Agent photo small + name]
[Szczegóły →]
```

PL example:
- "Mokotów, ul. Puławska — 3 pokoje, 78m², 4/6, 2018"
- "Nowoczesne mieszkanie z balkonem. 3 min do metra Wilanowska."
- "990 000 zł"

### Property detail page (key sections)
1. **Photo gallery** — 15-30 photos (rooms, kitchen, bathroom, balcony, facade, neighborhood)
2. **Key specs** — large stats (m² / rooms / price/m² / year / floor)
3. **Description** — 2-3 paragraphs (układ → flow → otoczenie)
4. **Layout / floor plan** — schematic image
5. **Neighborhood map** — Google Maps embed z key landmarks
6. **Monthly costs** — czynsz administracyjny + media estimate
7. **Mortgage calculator** (optional widget)
8. **Agent card** — direct contact

### Neighborhood description
```
{Neighborhood name}

{1-paragraph character — kim mieszka, czym żyje}
"Mokotów to dzielnica młodych profesjonalistów. Restauracje, parki, dobre szkoły. 
Komunikacja: metro, tramwaj, autobus. 15 min do centrum."

Średnia cena m² (sprzedaż):  17 500 zł
Średnia cena m² (wynajem):  80 zł
Średni czas sprzedaży:       45 dni

Co znajdziesz:
- 4 stacje metra
- 12 parków
- 38 restauracji
- 8 szkół podstawowych

[Zobacz oferty w dzielnicy →]
```

### Agent bio
```
[Photo — friendly, professional]
{Title} {Name}
{Specialization — types + neighborhoods}
{Years experience}

{2-3 sentence approach paragraph}
"Pracuję w Mokotów i Powiślu od 8 lat. Znam każdą klatkę. 
Pomagam kupującym znaleźć właściwy układ za rozsądną cenę."

Statystyki:
- Sprzedanych nieruchomości: 47
- Średni czas sprzedaży: 38 dni
- Średnia obniżka od ceny ofertowej: 2.1%

[☎ +48 ... ...]
[💬 WhatsApp]
[📧 email]
```

### Market insights / blog preview
- 3-4 latest blog posts
- Categories: "Trendy cenowe", "Porady kupującego", "Dzielnica miesiąca"
- Date + reading time + first paragraph teaser

### Testimonials
```
"{Quote 1-3 sentences}"
{Client identifier} — {Transaction type}, {Year}
"Sprzedaż mieszkania na Mokotowie, 2024"
```

Polish convention: full names mogą być, ale często inicjały + dzielnica + rok.

## Polish-specific

### Currency display
- "990 000 zł" (NIE "990k PLN")
- Million: "2.1 mln zł" or "2 100 000 zł" (both acceptable)
- Per m²: "12 500 zł/m²"

### Property types Polish
- "Mieszkanie" (apartment)
- "Dom" / "Dom wolnostojący" / "Bliźniak" / "Szeregowiec"
- "Lokal komercyjny" / "Lokal usługowy"
- "Działka" / "Działka budowlana" / "Działka inwestycyjna"
- "Kamienica" (heritage tenement)

### Specs format
- "3 pokoje" (NIE "3-room apartment" — Polish convention)
- "78 m²" (m² w superscript notation)
- "4/6 piętro" (floor 4 of 6)
- "2018" (year built)

### Transaction language
- "Sprzedaż" — sale
- "Wynajem" — rent
- "Czynsz administracyjny" — building maintenance fee (separate od rent)
- "Notariat" — notarial fees
- "Prowizja" — commission

### Polish tax/finance
- "Stawka VAT 8%" dla nowych mieszkań od deweloperów
- "Bez VAT (rynek wtórny)" dla used
- "Kredyt hipoteczny: ~XX% sytuacji wspierane"
- "Wkład własny 20%" — standard requirement

## Length constraints

| Section | PL chars max |
|---|---|
| Listing title | 80 |
| Listing description | 250 (1-paragraph teaser) |
| Listing full description | 800 |
| Neighborhood description | 400 |
| Agent bio | 300 |

## Anti-patterns

❌ **Hidden price** ("Cena na zapytanie") — loses 80% of interest
❌ **Stock photos** — credibility killer w real estate
❌ **No agent contact w listing** — buyers want phone
❌ **Generic neighborhood description** ("Spokojna dzielnica") — show specifics
❌ **No monthly cost estimate** — buyers need full picture
✅ **Price visible w hero of listing**
✅ **Multiple agent contact channels** (phone + WhatsApp + email)
✅ **Neighborhood specifics** (street names, landmarks, transport)
✅ **Realistic descriptions** ("wymaga remontu" gdy applicable)
