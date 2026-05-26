# Restaurant — Content Patterns

## Voice principles

### Sensory > abstract
- ❌ "Quality ingredients prepared with care."
- ✅ "Mięso starzone 28 dni. Sól z Wieliczki. Chleb pieczony rano."

### Place-as-character
- Describe SPECIFIC details about the space — sound, light, view, smell
- "Kameralna jadalnia na 24 osoby. Otwarta kuchnia z lady chef's table."
- "Letnia ogród z widokiem na Wisłę. 40 miejsc."

### Chef story (if applicable)
- Where trained, where worked, why this restaurant
- "Tomek trenował w Noma przez 2 lata. W 2022 wrócił do Krakowa."

### Local sourcing details
- Specific suppliers > generic "local"
- "Warzywa z gospodarstwa Wojtka pod Krakowem. Mięso z Mazur."

## Per-section templates

### Hero copy
- PL pattern: "{Cuisine type / concept}. {Distinguishing detail}."
- "Nowoczesna kuchnia polska. Kraków, ul. Floriańska 41."
- "Włoska trattoria. Pasta robiona codziennie z mąki Caputo."

EN backup:
- "Modern Polish cuisine. Kraków, Floriańska 41."

### Menu intro
- 1-2 sentences setting tone
- PL: "Menu zmieniamy co kwartał, zgodnie z sezonem. Wybierając lokalnych dostawców."
- EN: "Menu rotates seasonally. Local farms and producers prioritized."

### Menu item
```
{Dish name PL} / {Dish name EN}
{Brief description — 1-2 sentences z key ingredients}
{Price} zł
{Tags: V (vegan) · GF (gluten-free) · ♨ (spicy)}
```

PL example:
- "Pierogi z białą rzepą i twarogiem / White turnip & farmer cheese dumplings"
- "Z masłem klarowanym i smażoną cebulką. Domowa kuchnia z polskiego północy."
- "34 zł · V"

### About / story
- 3-5 paragraphs (NIE wall of text)
- Chef intro → restaurant concept → space description → opening time/why
- Photo of chef + photo of interior interspersed

### Reservation
- Form fields:
  - Imię (required) / First name
  - Telefon (required)
  - Email
  - Data (date picker, blocked dates)
  - Godzina (time slots based on opening hours)
  - Liczba osób (1-12 typical)
  - Notatki (allergies, special occasion)
- Confirmation language: "Czekamy na potwierdzenie. Odezwiemy się w 2h."

### Location + hours
```
{Restaurant name}
{Street, postal code city}

[Google Maps button — opens external map]
[Telephone clickable — tel: protocol]

Godziny otwarcia / Opening hours:
Pn-Pt: 12:00 - 22:00
Sob: 12:00 - 23:00
Niedz: 12:00 - 21:00
```

## Polish-specific

### Honorifics by restaurant type
- Fine dining: **"Państwo"** ("Zapraszamy Państwa...")
- Casual / bistro / café: **"Ty / wy"** ("Wpadnij na lunch")
- Special occasion: "Państwo" can be appropriate even casual

### Dietary tags Polish convention
- V — wegańskie
- VG — wegetariańskie
- GF — bezglutenowe
- LF — bez laktozy
- ♨ — ostre

### Prices
- "X zł" (NIE "X PLN" — feels foreign)
- Round numbers when possible (34 zł vs 33.50 zł)
- Range w hero gdy applicable: "Tasting menu: 280 zł / osoba"

### Reservation language
- "Zarezerwuj stolik" (preferred over "Zarezerwuj")
- "Potwierdzenie w SMS" / "Confirmation via SMS" (Polish guests trust SMS)

### Phone format
- "+48 12 345 67 89" (clickable: `tel:+48123456789`)

## Bilingual presentation

For Polish restaurants serving international guests (Kraków / Warsaw tourist areas):
- **Polish primary**, English secondary
- Menu items: PL name "/" EN name pattern
- Navigation: PL labels but link to /en/ subdirectory dla full EN site
- Reservation form: bilingual fields
- Allergens: international symbols (gluten / dairy / nuts icons)

## Length constraints

| Section | PL chars max | EN chars max |
|---|---|---|
| Hero title | 80 | 70 |
| Concept paragraph | 250 | 220 |
| Menu item name | 60 | 50 |
| Menu item description | 120 | 100 |
| Chef bio short | 300 | 270 |
| About long | 800 | 700 |

## Anti-patterns

❌ **Generic "Welcome to {restaurant}"** w hero
❌ **No menu visible** — even teaser dishes critical
❌ **Stock food photos** — looks fake
❌ **Reservation form behind multiple clicks** — friction kills bookings
❌ **No phone number visible** — older audience needs it
✅ **Hours + address persistent w footer / header**
✅ **Click-to-call mobile**
✅ **Photo gallery z behind-the-scenes** (chefs, kitchen, people)
