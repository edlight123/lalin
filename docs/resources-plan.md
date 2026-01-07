# Lalin — Expanded Resources Plan (Learn)

## Goals
- Provide practical, culturally relevant health education for Haiti and the diaspora.
- Keep content supportive and non-judgmental, with plain-language explanations.
- Stay privacy-first and offline-friendly (content ships with the app).
- Always include safety guidance (red flags + when to seek urgent care).

## Constraints & product principles
- Educational only, not medical advice.
- Avoid exact local phone numbers/clinic listings unless you have a reliable source and maintenance plan (numbers change).
- Content must work in English, French, and Haitian Creole.
- Keep articles scannable (short sections, bullets, “what to do next”).

## Information architecture (proposed)

### 1) Cycle & Tracking
- Cycle basics (phases)
- What “normal” can look like (range of cycle lengths)
- Period flow and duration (what’s typical vs concerning)
- Spotting / bleeding between periods
- Tracking tips (how to log, what patterns mean)
- Irregular cycles (common reasons, when to get checked)

### 2) Symptoms & Common Conditions
- Cramps & pain (self-care + red flags)
- PMS vs PMDD (when mood symptoms are severe)
- Headaches/migraines around periods
- Fatigue and low energy (iron deficiency basics)
- Bloating and digestion
- Acne and skin changes
- Vaginal discharge basics (normal vs concerning)
- Common conditions overview (endometriosis, fibroids, PCOS) — signs + questions to ask a clinician

### 3) Fertility & Family Planning
- Fertile window & ovulation (what apps estimate vs what they can’t)
- Trying to conceive basics
- Contraception overview:
  - Barrier methods
  - Hormonal pills/patch/ring/injection
  - IUD/implant
  - Emergency contraception (timing basics)
- Myths vs facts (especially about fertility and contraception)

### 4) Sexual Health & STIs
- Safer sex basics
- STI basics (symptoms, testing, prevention)
- Consent and healthy relationships (simple, clear definitions)
- When to seek urgent help (severe pelvic pain, fever, pregnancy + bleeding, etc.)

### 5) Pregnancy, Postpartum, and Breastfeeding
- Early pregnancy signs
- Prenatal care basics (what to expect)
- Warning signs in pregnancy (urgent)
- Postpartum recovery basics
- Mental health postpartum (baby blues vs postpartum depression)

### 6) Wellness & Lifestyle
- Sleep and stress
- Nutrition and hydration
- Movement and gentle exercise
- Pain relief options (heat, stretching, OTC basics with “ask a clinician” disclaimer)

### 7) Safety, Support, and Navigating Care
- “When to seek care” master guide
- How to talk to a clinician (questions checklist)
- Preparing for appointments (symptom diary)
- Safety planning (if someone feels unsafe at home)
- Finding trustworthy information (how to evaluate sources)

### 8) Life Stages
- First periods / adolescence
- Perimenopause & menopause basics

### 9) Glossary
- Simple definitions: ovulation, luteal phase, spotting, discharge, cramps, etc.

## Article template (recommended)
Each article should follow a consistent structure so it’s easy to scan:
1. **TL;DR** (3–5 bullets)
2. **What’s common** (plain language)
3. **What may be concerning** (red flags)
4. **Self-care & practical steps**
5. **What to track in Lalin** (specific logging prompts)
6. **When to seek care** (non-alarming but clear)
7. **Questions to ask a clinician**

## Localization strategy
- Keep content in i18n JSON only for short strings.
- For longer content, use a structured “resource catalog” data file per language (or one catalog keyed by i18n keys) so translators can work without touching code.
- Add a small “translation completeness” checklist for each release.

## Learn UI plan (modern but simple)
- Hero header card with the disclaimer.
- Horizontal category chips.
- Article cards that expand/collapse (“Read more / Read less”).
- Consistent spacing/typography using theme tokens; avoid hard-coded colors.

## Rollout plan (phased)
- Phase 1 (fast): Expand from 8 → ~20 articles using the template above; keep the current 4 categories.
- Phase 2: Add Safety/Support and Sexual Health categories; add glossary.
- Phase 3: Add region-specific “Find care” links (if you decide on a maintenance plan).
