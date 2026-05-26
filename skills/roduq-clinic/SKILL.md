---
name: roduq-clinic
description: |
  Generate complete medical/wellness practice website z hero + services + doctor-bio + booking + trust-credentials + contact.
  Empathetic trust voice. Polish-first content. Strict RODO compliance — medical data sensitivity.
triggers:
  - "clinic"
  - "gabinet"
  - "gabinet lekarski"
  - "praktyka medyczna"
  - "dietetyk"
  - "psycholog"
  - "psychoterapeuta"
  - "fizjoterapeuta"
  - "dentysta"
  - "stomatolog"
  - "ortopeda"
  - "klinika"
  - "private practice"
od:
  mode: design-system
  category: marketing-creative
  roduq:
    industry: clinic
    target_repo: roduq-web-starter
    output_protocol: "https://roduq.dev/schemas/v1/"
    model_hint: anthropic
    polish_first: true
    rodo_strict: true
---

# Roduq Clinic / Medical Practice Website Generator

> Industry skill dla gabinet lekarski / dietetyk / psycholog / fizjoterapeuta / stomatolog. Empathetic trust voice + RODO-strict.

## What it does

Generate medical practice website z:
- **Hero** — trust-building (doctor photo + empathetic positioning)
- **Services** — concrete treatment offerings z descriptions
- **Doctor bio** — credentials, education, philosophy, patient approach
- **Booking** — Calendly / online booking system / phone primary
- **Trust credentials** — diplomas, certifications, professional memberships
- **Contact + location** — address + parking + accessibility info
- **RODO compliance** — clear data handling, patient confidentiality
- **Testimonials** — anonymous-safe (per RODO + medical ethics)

## When to use

✅ Solo practitioner: lekarz / dietetyk / psycholog / psychoterapeuta / fizjoterapeuta / stomatolog / chirurg
✅ Małe klinika (2-5 specjalistów)
✅ Wellness practice (osteopatia, akupunktura — gdy regulated)
✅ Audience: pacjenci szukający opieki (anxious, hopeful)

❌ NIE używaj dla:
- Duża klinika sieciowa (multi-location enterprise) → custom skill needed
- Spa / wellness non-medical (massage, beauty) → use `roduq-portfolio` z mods
- Telemedycyna platforma → use `roduq-saas-landing`

## Instructions

### Step 1 — Parse brief

```typescript
type ClinicBrief = {
  practitionerName: string;
  title: string;                // "dr n. med." / "mgr" / "specjalista"
  specialty: string;            // "psychoterapia poznawczo-behawioralna" / "dietetyka kliniczna"
  city: string;
  practiceType: "solo" | "small-clinic" | "multi-disciplinary";
  yearsExperience: number;
  education: { degree: string; institution: string; year: number }[];
  certifications: string[];     // ["Polskie Towarzystwo Psychologiczne"]
  services: string[];
  patientAudience: string;      // "dorośli", "młodzież 12-18", "pary"
  bookingSystem: "calendly" | "znanylekarz" | "internal-form" | "phone-only";
  acceptsInsurance: boolean;
  pricePerVisit?: number;       // PLN typical
  consultationFormat: "in-person" | "online" | "both";
};
```

### Step 2 — Select preset

| Practice type | Preferred preset |
|---|---|
| Mental health (psycholog, psychoterapeuta) | `soft-pastel` lub `warm-editorial` |
| Dietetyk / wellness | `monolith-meadow` lub `soft-pastel` |
| Stomatolog / fizjoterapeuta | `default` (neutral medical clean) |
| Specjalista (dermatolog, ginekolog, etc.) | `default` lub `tech-modern` (modern medical) |
| Children's specialist | `soft-pastel` (warmer) |

### Step 3 — Generate sections.json

```json
{
  "homepage": {
    "blocks": [
      { "blockType": "hero", "variant": "doctor-photo-trust" | "split-with-credentials" },
      { "blockType": "services", "variant": "list-detailed" | "cards-with-icons" },
      { "blockType": "doctor-bio", "variant": "extended-bio" | "credentials-prominent" },
      { "blockType": "booking", "variant": "calendly-embed" | "form-inline" | "phone-prominent" },
      { "blockType": "trust", "variant": "credentials-grid" | "memberships-strip" },
      { "blockType": "testimonials", "variant": "anonymous-quotes" },
      { "blockType": "faq", "variant": "accordion" },
      { "blockType": "location", "variant": "map-accessibility-info" }
    ]
  },
  "pages": {
    "/uslugi": { "blocks": [...] },
    "/o-mnie": { "blocks": [...] },
    "/cennik": { "blocks": [...] },
    "/kontakt": { "blocks": [...] },
    "/rodo": { "blocks": [...] }
  }
}
```

### Step 4 — Generate content.json

**Voice principles (medical-specific)**:
- **Empathetic but professional** — "Rozumiem, że pierwsza wizyta wymaga odwagi." (NIE "Don't be afraid!")
- **Honest about uncertainty** — "Nie ma jednego sposobu na X. Razem znajdziemy Twój."
- **Polish "Pan/Pani"** for older audience (50+), "Ty" for younger (mental health young adult)
- **Avoid medical jargon w hero** — "Help with anxiety" > "Cognitive behavioral therapy for GAD"
- **Trust through specifics** — concrete years/credentials/methodology

**Hero patterns**:
- PL: "Pomoc psychologiczna z {godziwości / spokoju / zrozumieniem}. {Miasto}."
- "Spokojny ton. Konkretne narzędzia. Pomoc psychologiczna dorośli. Warszawa, Mokotów."
- "Dietetyka kliniczna. Bez diet-cudów. Z dowodami naukowymi. Kraków."

**Doctor bio template**:
- Photo (professional, warm, not stiff)
- "{Tytuł}. Specjalizuję się w {specialty} od {N} lat."
- Education list (chronological)
- Philosophy paragraph (1-2 sentences)
- Approach to patients (1-2 sentences)
- Memberships (lista organizacji zawodowych)

### Step 5 — RODO + trust requirements

**Każdy clinic site MUSI zawierać**:
1. **Polityka prywatności** — explicit medical data handling
2. **RODO clause** w booking form — explicit consent
3. **Confidentiality statement** — "Pełna poufność. Dane medyczne nie są udostępniane."
4. **Cookie banner** with categories (necessary / analytics / marketing)
5. **Contact email** dla RODO inquiries (often `rodo@{domain}`)

**Testimonials approach** (RODO + medical ethics):
- ❌ Don't use full names of patients
- ❌ Don't use patient photos
- ✅ Anonymous quotes: "Pacjent K., 34 lata" or "Kobieta, 28 lat"
- ✅ Quote about EXPERIENCE (not specific diagnosis)
- ✅ Written consent obtained + documented

### Step 6 — Booking system integration

**Polish market common**:
- **ZnanyLekarz** — Polish booking system, widget embeddable. Pattern: link button + iframe widget
- **Calendly** — international, growing w Polish market dla psychotherapy
- **Internal form** — full control, ale wymaga email + SMS reminder system
- **Phone only** — older audience, but adds friction

Recommended: ZnanyLekarz dla traditional specialists + Calendly dla mental health professionals.

## Examples

### Example 1: Psycholog (poznawczo-behawioralna terapia)

**Brief**: "Psycholog z Warszawy (Mokotów), specjalizacja CBT dla dorosłych z lękiem i depresją. 8 lat doświadczenia. PTP członek. Online + stacjonarnie. 250 zł/sesja. Calendly booking. Tone: spokojny, profesjonalny, empatyczny."

**Output**:
- Preset: `soft-pastel`
- Hero: "Spokojny ton. Konkretne narzędzia. Pomoc psychologiczna dorosłym. Warszawa, Mokotów."
- Services: 4 (terapia indywidualna lęku / depresji / kryzysu / długoterminowa)
- Doctor bio: education + 8 lat doświadczenia + philosophy ("Wierzę w terapię opartą na dowodach. CBT to konkretne narzędzia.") + PTP membership
- Booking: Calendly embed
- Testimonials: 3 anonymous quotes (z explicit consent)
- FAQ: pierwsza wizyta / koszt / online vs stacjonarnie / czas trwania terapii
- Location: dyskretny adres + parking + akcesibility

### Example 2: Dietetyk kliniczny

**Brief**: "Dietetyk kliniczny w Krakowie, specjalizacja w insulinooporności i PCOS. 5 lat. Online consultations only (after COVID). 200 zł/wizyta initial / 150 zł follow-up. Internal form booking. Tone: konkretny, naukowy, ciepły bez fluffu."

**Output**:
- Preset: `monolith-meadow`
- Hero: "Dietetyka kliniczna. Bez diet-cudów. Z dowodami naukowymi."
- Services: 3 (insulinooporność / PCOS / zdrowe nawyki)
- Doctor bio: UJ medical + 5 lat + philosophy ("Każdy organizm jest inny. Diety uniwersalne nie działają.")
- Booking: internal form z medical questionnaire upfront (alergie, leki, cele)
- Cennik table prominent (wizyta initial / follow-up / plan żywieniowy)

## Output contract

Standard 7 files per `.cursor/rules/004-file-protocol.mdc` + dodatkowo:
- `rodo-policy.md` z medical data handling (gdy `rodo_strict: true`)

## Related

- **Sister skills**: roduq-restaurant (trust-building pattern), roduq-portfolio (solo practitioner self-promotion)
- **Presets**: `soft-pastel`, `monolith-meadow`, `default`, `warm-editorial`
- **References**: [`./references/inspiration.md`](./references/inspiration.md), [`./references/content-patterns.md`](./references/content-patterns.md), [`./references/target-audience.md`](./references/target-audience.md)
- **Assets**: [`./assets/template-hero.html`](./assets/template-hero.html), [`./assets/template-doctor-bio.html`](./assets/template-doctor-bio.html), [`./assets/template-booking.html`](./assets/template-booking.html)
