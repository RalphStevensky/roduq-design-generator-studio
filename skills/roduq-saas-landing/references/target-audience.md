# SaaS Landing — Target Audience Profiles

> Reference dla `roduq-saas-landing` skill. Common SaaS audience personas z voice + content adjustments.

## Persona axes

Każda SaaS audience differs along 4 axes:

1. **Technical depth**: Engineer / Product manager / Marketer / Operations / Executive
2. **Decision-making role**: Individual contributor / Manager / Director / VP / C-level
3. **Company size**: Solo / Startup (1-50) / Mid-market (50-500) / Enterprise (500+)
4. **Industry domain**: Fintech / DevTools / Marketing / HR / Sales / Ops / Healthcare / etc.

## Common personas dla Roduq SaaS clients

### Persona 1: Polish Freelancer (30-40)

- **Role**: Solo freelancer / 1-osobowa firma
- **Tech depth**: medium — używa tools daily ale nie programuje
- **Industries**: Marketing / Design / Content / Consulting / Programming freelance
- **Pain points**: Bookkeeping odbiera energię, faktury manualne, podatki niejasne, cashflow nieprzewidywalny
- **Voice preference**: Informal ("Ty"), warm, no enterprise jargon
- **Decision speed**: Fast — wybiera w 1-2 dni, paid via Stripe
- **Pricing sensitivity**: medium — 50-300 PLN/mc OK gdy benefit clear
- **Trust signals needed**:
  - 10000+ existing users
  - Testimonials z znanych freelancerów Polish market
  - Free trial bez karty
  - Polish support (email/chat w PL)

**Copy strategy**:
- Title: konkretny benefit + "Dla freelancerów"
- Hero: "Zaoszczędzisz 5h tygodniowo na fakturach. {Brand} robi to za Ciebie."
- Pricing: 3-tier z generous free + 49zł Pro tier
- CTA: "Zacznij za darmo" (low commitment)

### Persona 2: Mid-Market CFO (40-55)

- **Role**: VP Finance / CFO / Head of Operations
- **Tech depth**: low-medium — używa Excel + workflow tools
- **Companies**: 100-500 employees, B2B SaaS or services
- **Pain points**: Excel scaling fail, multi-entity reporting headache, cashflow visibility lacking
- **Voice preference**: Formal ("Państwo" lub neutral "Ty" depending na pitch), professional, ROI-focused
- **Decision speed**: Slow — RFP / demo / 2-4 week eval cycle
- **Pricing sensitivity**: low if ROI clear — $5k-$50k/year acceptable
- **Trust signals needed**:
  - SOC 2 / GDPR / ISO 27001 badges
  - Fortune 500 customer logos
  - Detailed case studies (PDF download)
  - Sales-assisted onboarding ("Book a demo")

**Copy strategy**:
- Title: outcome-focused ("Cashflow visibility w 30 dni." / "Zredukuj closing cycle o 40%.")
- Hero: dual CTA (Demo + Free assessment), heavy social proof
- Pricing: "Contact sales" tier alongside transparent self-serve
- CTA: "Book a demo" / "Umów demo (30 min)"

### Persona 3: Senior Software Engineer (25-40)

- **Role**: Backend / Frontend / DevOps engineer / SRE / Tech lead
- **Tech depth**: high
- **Companies**: Startups + scaleups + tech-forward enterprises
- **Pain points**: Tooling friction, integration complexity, slow vendor onboarding
- **Voice preference**: Technical, terse, no fluff. English-first OK
- **Decision speed**: Self-serve preferred — wants free trial, docs, API examples
- **Pricing sensitivity**: medium — usage-based preferred over seat-based
- **Trust signals needed**:
  - Open API + docs link prominent
  - GitHub stars / npm downloads jeśli OSS
  - Engineering blog posts
  - Status page link
  - Stripe Atlas / YC etc. credibility

**Copy strategy**:
- Title: outcome + technical proof ("Logs w 50ms p99." / "10x faster queries.")
- Hero: code snippet jako primary visual
- Pricing: usage-based calculator
- CTA: "Get API key" / "Start free (no credit card)"

### Persona 4: Marketing Manager (28-45)

- **Role**: Demand gen / Performance / Content / SEO manager
- **Tech depth**: medium-high — używa MarTech stack daily
- **Companies**: B2B SaaS marketing teams 5-50 people
- **Pain points**: Tool sprawl, attribution unclear, reporting manual
- **Voice preference**: Practical, ROI-focused, A/B testing minded
- **Decision speed**: Medium — 1-2 weeks z trial
- **Pricing sensitivity**: medium — $50-500/mc per user OK
- **Trust signals needed**:
  - Integrations grid (must show their existing tools: HubSpot/Salesforce/Mailchimp/etc.)
  - Templates / playbooks library
  - ROI calculator
  - Marketing-specific customer case studies

**Copy strategy**:
- Title: campaign-style ("Stop guessing. Start measuring." / "Atrybucja która działa.")
- Hero: dashboard screenshot or animated chart
- Pricing: per-user z annual discount
- CTA: "Try free" + "Get demo" dual

### Persona 5: Startup Founder (25-50)

- **Role**: Solo founder / Co-founder
- **Tech depth**: variable
- **Companies**: Seed / Series A / Pre-seed startups
- **Pain points**: Wear all hats, limited budget, need fast iteration
- **Voice preference**: Casual, ambitious, growth-focused
- **Decision speed**: Fast (when budget allows)
- **Pricing sensitivity**: high — every $/mc counts
- **Trust signals needed**:
  - Y Combinator / accelerator badges if applicable
  - Other startup customers (avoid only-enterprise logos)
  - Founder-led pricing ("Startup-friendly: 50% off first year")
  - Quick setup proof ("Setup w 5 min")

**Copy strategy**:
- Title: ambition + simplicity ("Build your SaaS faster.")
- Hero: time-to-value emphasis ("From signup to first dashboard w 4 minutes")
- Pricing: generous free tier + simple paid + "Talk to us" enterprise
- CTA: "Start building" (active)

## Audience signals — how to identify w brief

Auto-detect personas z user brief:

| Brief contains | Likely persona |
|---|---|
| "freelancer", "samozatrudniony", "JDG" | Persona 1 (Freelancer) |
| "CFO", "controller", "księgowość zespołu", "raportowanie zarządcze" | Persona 2 (CFO) |
| "developers", "engineers", "API", "DevOps", "infrastruktura" | Persona 3 (Engineer) |
| "marketing", "campaign", "attribution", "demand gen", "lead gen" | Persona 4 (Marketer) |
| "startup", "founder", "early stage", "MVP", "seed" | Persona 5 (Founder) |
| "enterprise", "Fortune 500", "compliance" | Persona 2 amplified (Enterprise CFO) |
| "wellness", "lifestyle", "consumer" | NIE używaj saas-landing — use roduq-portfolio lub roduq-product-launch |

## Generic SaaS adjustments per persona

| Element | Persona 1 (Freelancer) | Persona 2 (CFO) | Persona 3 (Engineer) | Persona 4 (Marketer) | Persona 5 (Founder) |
|---|---|---|---|---|---|
| **Tone** | Warm, informal | Formal, ROI-focused | Technical, terse | Practical, A/B-minded | Casual, ambitious |
| **Hero CTA** | "Zacznij za darmo" | "Umów demo" | "Get API key" | "Try free" + "Demo" | "Start building" |
| **Pricing model** | Freemium + 2 paid | Tiered (seat-based) | Usage-based | Per-user annual | Generous free + simple paid |
| **Social proof** | Polish freelancers | Fortune 500 logos | GitHub stars + tech logos | MarTech stack integrations | YC + startup logos |
| **Trust badges** | "Bez karty kredytowej" | SOC 2 + GDPR + ISO | Status page + open API | Integrations grid | "Startup-friendly" |
| **Length** | Short (concise) | Medium (case studies link) | Short (link to docs) | Medium (templates focus) | Short (TLDR-friendly) |

## Polish-specific voice notes

### "Ty" vs "Państwo" decision tree

- B2B SaaS targeting developers / freelancers / startups → **always "Ty"**
- B2B SaaS targeting enterprise CFO / Board / Healthcare → **"Państwo" or neutral**
- B2C SaaS (wellness, finance, education) → **"Ty"**
- Government / education / public sector → **"Państwo"**

### Inclusive language (Polish-specific)

- Avoid generic male forms: use **"specjaliści"** instead of just "specjaliści" (already neutral form)
- For roles: "deweloperzy" preferred over "programiści-mężczyźni"
- Diversity w testimonial avatars + customer logos

### Reading level

- Persona 1 (Freelancer): 8-th grade Polish — accessible
- Persona 2 (CFO): 12-th grade — business jargon OK
- Persona 3 (Engineer): assume domain expertise — technical terms inline OK
- Persona 4 (Marketer): mix — explain marketing-specific jargon, assume tech baseline
- Persona 5 (Founder): mix — business + tech literacy assumed

## Validation

Po wygenerowaniu copy, validate dla each persona target:

```yaml
persona: freelancer
target_voice_check:
  - uses_ty: true              # "Ty" present, no "Państwo"
  - formal_jargon: false       # no "synergia", "kompleksowe", "rozwiązanie"
  - concrete_benefits: true    # numeric proof, time saved, money saved
  - polish_diacritics: true    # ą/ć/ę/ł/ń/ó/ś/ź/ż render OK

persona: enterprise_cfo
target_voice_check:
  - uses_panstwo_or_neutral: true
  - includes_trust_badges: true # SOC 2, GDPR mention
  - case_study_link: true
  - roi_metric: true
```

Failed checks → re-generate z explicit hint.
