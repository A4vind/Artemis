# KaamSetu — Your Skills. Your Work. Your Dignity.

**Artemis 2026 · Problem Statement 2: Beyond the Waiting Line**

KaamSetu ("work bridge" in Hindi and Marathi) helps daily-wage workers — plumbers, masons, painters,
cleaners, helpers — find nearby work, show their skills without a résumé, and **check every job
before they go**. It is a frontend prototype: all data is local demo data and nothing is sent to anyone.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run check:i18n   # Hindi / Marathi translation coverage
```

Requires Node 20+.

## Signature feature — Pakka Check

Every listing is read by a rules engine (`src/lib/pakkaCheck.ts`) that reports, without guessing:

- **What is given** — pay amount and period, payment timing, hours and start time, exact place,
  employer phone, safety gear (for trades where it matters).
- **What is missing** — each gap becomes a plain question under **"Ask before you go"**, which the
  worker can **listen to** (browser speech, in their language) or copy into WhatsApp/SMS.
- **Warning signs** — known scam patterns written *in the listing itself*: asking for a fee, for
  Aadhaar/bank photos before work is fixed, or for an OTP — each with a one-line "why".

It never says a job is "safe" or an employer is "verified". It only reads what the employer wrote,
and says so. Employers see the same check before publishing, which nudges them to fill gaps.

## What's in the prototype

| Area | What works |
|---|---|
| Welcome | Language choice in native script up front, worker / employer entry |
| Onboarding | 5 tap-first steps (name, trades, experience, area + travel distance, availability/languages); no résumé, no documents; phone optional |
| Work home | "Free today" switch, area + distance, search, quick filters, jobs grouped by *your work types* then *other work near you*, read-aloud per job |
| Job detail | Big pay with period and timing, total-earnings estimate with its calculation shown, per-hour rate, facts grid, employer info ("not checked by KaamSetu"), Pakka Check, apply, report |
| Apply | Recap of conditions + warnings before confirming; honest demo confirmation |
| My jobs | Saved snapshot of conditions, status timeline, withdraw, reported jobs |
| Kaam Card | Résumé-free work identity; share (phone share sheet or clipboard); edit everything incl. optional photo (stays on device) and "work I've done"; delete my data |
| Help & rights | 4 safety rules; e-Shram, Maharashtra BOCW, PM-SYM, PM-JAY, CPGRAMS, SAMADHAN, 1930 cyber-fraud, 112 — eligibility, documents, how to apply, helpline, official link |
| Employer | 4-step post-work form with required pay/hours/timing/contact and a no-fee pledge; review with Pakka Check preview; My posts with applicants (the worker's Kaam Card); Find workers |
| Language | English, हिन्दी, मराठी — all 421 UI strings translated; central dictionary with English fallback |
| Accessibility | Semantic HTML, labelled controls, native `<dialog>` sheets (focus trap, Esc), visible focus, live-region toasts, focus moves to first error, icons always with text, status never by colour alone, reduced-motion, larger-text setting |
| Resilience | Offline banner; everything works offline from local state |

## Honesty rules followed

- All employers, workers, phone numbers (99999 00xxx) and jobs are **fictional demo data**, labelled as such in the UI.
- No fake ratings, reviews, verification badges, statistics or testimonials.
- Applying, reporting and posting are saved **on this device only**, and the UI says so.
- Scheme summaries were checked against official sources (Oct 2026); the UI tells users to confirm on the official site.

## Brand

- **Logo:** the KaamSetu artwork is used as-is (`public/brand/`): the full logo on the welcome screen, the emblem in the header, on the Kaam Card and as the app icon. `kaamsetu-logo-full.png` includes the tagline, for slides.
- **Colours** come from the logo: earth brown (text and structure), Setu teal (actions and selections), sunrise orange (highlights) on the logo's cream. Buttons use a deeper teal than the logo (#136C82) because the logo teal is too light for white text.

## Tech

React 19 · TypeScript · Vite · React Router · Lucide icons · plain CSS with design tokens
(`src/styles/tokens.css`). No backend. State in a reducer persisted to `localStorage`.

```
src/
  data/        trades, localities (Pune), demo jobs, demo workers, schemes
  i18n/        en.ts (source), hi.ts, mr.ts, useT()
  lib/         pakkaCheck.ts, format.ts, device.ts (speech, share, offline, photo)
  state/       store.tsx (reducer + persistence)
  components/  AppShell, JobCard, PakkaCheckPanel, KaamCard, Sheet, Toast, ui
  screens/     Welcome, Onboarding, WorkHome, JobDetail, MyJobs, Profile, Help, Hire
```

## 3-minute demo script

1. **Welcome** — tap **मराठी**, then back to English: the whole interface switches, not just labels.
2. **I want work** → make a profile in ~30 seconds: name, tap *Mason* + *Plumber*, experience, *Kothrud*, done. Show the **Kaam Card** — "this is her résumé".
3. **Work home** — "Free today" switch; jobs grouped by your trades; pay is the biggest thing on every card. Tap 🔊 on a card to hear it.
4. Open **Urgent plumber needed** — red **Pakka Check**: asks for an OTP, 4 details missing, and the questions to ask. Tap **Listen to questions**. Then **Report this job**.
5. Open **Brick work at building site** — green check, "About ₹13,500 in total" with the calculation shown. **Apply** → recap → confirmation that is honest about the demo.
6. **My jobs** — the conditions are saved, so the worker can check them again on site.
7. **I want to hire** → post a job. Try **Next** with empty fields (validation), finish, see the **Pakka Check preview** the worker will see → Publish.
8. **See as worker** → apply → back to **My posts**: the employer now sees the worker's Kaam Card.
9. **Help** — "4 rules to stay safe", e-Shram details with helpline and official link.

## Known limitations

- No backend: no real employers, messaging, payments or verification; data lives in one browser.
- Locations are a fixed list of Pune areas; distances are straight-line estimates (labelled).
- Read-aloud depends on the phone having a Hindi/Marathi voice; the app tells the user when it doesn't.
- Employer-written job text appears in the language it was written in (demo jobs include Hindi/Marathi).
- Scheme information is a summary and may change.
