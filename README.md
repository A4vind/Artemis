# KaamSetu — Your Skills. Your Work. Your Dignity.

**Artemis 2026 · Problem Statement 2: Beyond the Waiting Line**

KaamSetu ("work bridge" in Hindi and Marathi) helps daily-wage workers — plumbers, masons, painters,
cleaners, helpers — find nearby work, show their skills without a resume, and **check every job
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
| Onboarding | 6 tap-first steps (name, trades, experience, city + area + travel distance, availability/languages, optional photo with Skip); no resume, no documents; phone optional |
| Work home | "Free today" switch, area + distance, search, quick filters, jobs grouped by *your work types* then *other work near you*, read-aloud per job |
| Job detail | Big pay with period and timing, total-earnings estimate with its calculation shown, per-hour rate, facts grid, employer info ("not checked by KaamSetu"), Pakka Check, apply, report |
| Apply | Recap of conditions + warnings before confirming; honest demo confirmation |
| My jobs | Grouped by *offers / work fixed / waiting / finished*; 4-step timeline (applied or invited → offer → work fixed → paid); offers compared with the job post, with worse terms flagged red; accept or decline; withdraw |
| Hiring loop | Employer selects or declines applicants and sends an **offer** with exact terms; worker accepts → **Pakka Parchi** (shareable agreed-terms slip); employer marks work complete; worker records **Did you get paid?** (yes / partly / no) → unpaid amounts lead to complaint routes |
| Naka mode | **Kaam Card QR** to show at the roadside hiring point: a contractor scans it with any phone camera and sees the card (no phone number or photo in it). Employers can **invite** a worker who is free today, so work comes to the worker |
| Kaam Diary | Days worked and money received, added automatically from finished jobs or by hand for naka work; this month's days / money / still owed; progress towards the construction board's 90-day rule; shareable record; days feed the Kaam Card |
| Kaam Card | Resume-free work identity; QR for the naka; share; recorded work days; optional profile photo and up to 4 **photos of past work**; work details (own tools, usual daily rate, shifts); **private details** (age band, gender, home town) that are never shown to employers or put in the QR and only power a "schemes you may be able to apply for" hint on Help; delete my data |
| Help & rights | Personal "you may be able to apply for" hint from the worker's private age band and trades; 4 safety rules; e-Shram, Maharashtra BOCW, PM-SYM, PM-JAY, CPGRAMS, SAMADHAN, 1930 cyber-fraud, 112 — eligibility, documents, how to apply, helpline, official link |
| Employer | 4-step post-work form with required pay/hours/timing/contact and a no-fee pledge; review with Pakka Check preview; My posts with applicants to select or decline; Find workers with **Invite** |
| Language | English, हिन्दी, मराठी — all 618 UI strings translated; central dictionary with English fallback |
| Accessibility | Semantic HTML, labelled controls, native `<dialog>` sheets (focus trap, Esc), visible focus, live-region toasts, focus moves to first error, icons always with text, status never by colour alone, reduced-motion, larger-text setting |
| Resilience | Offline banner; everything works offline from local state |

## Honesty rules followed

- All employers, workers, phone numbers (99999 00xxx) and jobs are **fictional demo data**, labelled as such in the UI.
- No fake ratings, reviews, verification badges, statistics or testimonials.
- Applying, reporting and posting are saved **on this device only**, and the UI says so.
- Demo employers cannot really reply, so their offers come from a clearly labelled **Simulate employer reply** button. Demo applicants are labelled and never pretend to answer.
- The Pakka Parchi says it is a demo record, not a legal contract. Diary days are marked self-recorded.
- Scheme summaries were checked against official sources (Oct 2026); the UI tells users to confirm on the official site.

## Brand

- **Logo:** the KaamSetu artwork is used as-is (`public/brand/`): the full logo on the welcome screen, the emblem in the header, on the Kaam Card and as the app icon. `kaamsetu-logo-full.png` includes the tagline, for slides.
- **Colours** come from the logo: earth brown (text and structure), Setu teal (actions and selections), sunrise orange (highlights) on the logo's cream. Buttons use a deeper teal than the logo (#136C82) because the logo teal is too light for white text.

## Tech

React 19 · TypeScript · Vite · React Router · Lucide icons · plain CSS with design tokens
(`src/styles/tokens.css`). No backend. State in a reducer persisted to `localStorage`.

```
src/
  data/        trades, localities (Pune + Mumbai), demo jobs, demo workers, schemes
  i18n/        en.ts (source), hi.ts, mr.ts, useT()
  lib/         pakkaCheck.ts, hiring.ts (offers, changes, totals, QR link), format.ts, device.ts
  state/       store.tsx (reducer + persistence)
  components/  AppShell, JobCard, PakkaCheckPanel, KaamCard, PhotoFields, AreaPicker, Hiring (offer form, Parchi), QrCode, Sheet, Toast, ui
  screens/     Welcome, Onboarding, WorkHome, JobDetail, MyJobs, Diary, Profile, PublicCard, Help, Hire
```

## 4-minute demo script

1. **Welcome** — tap **मराठी**, then back to English: the whole interface switches, not just labels.
2. **I want work** → make a profile in ~30 seconds: name, tap *Mason* + *Plumber*, experience, *Kothrud*, done. "This Kaam Card is the resume."
3. **Work home** — "Free today" switch; pay is the biggest thing on every card. Tap 🔊 on a card to hear it.
4. Open **Urgent plumber needed** — red **Pakka Check**: asks for an OTP, details missing, questions to ask. **Report this job**.
5. Open **Brick work at building site** — green check, total pay with its calculation → **Apply**.
6. **My jobs** → **Simulate employer reply** (labelled demo) → the offer shows "same terms as the job post" → **Accept** → the **Pakka Parchi** appears.
7. **Work done? Record payment** → *Only part of it* → the app shows what is still owed and where to complain. Open **Diary**: days, money, still owed, progress to the 90-day construction rule.
8. **Kaam Card → Show at the naka**: the QR a contractor scans at the roadside.
9. **I want to hire** → post a job → **Find workers** → **Invite** "You (this phone)" and lower the pay → switch back: the home screen says "You have 1 work offer" and the offer flags the pay cut in red.
10. **My posts**: applicants with **Select / Not now**, the accepted worker's Parchi, **Mark work complete**.

## Known limitations

- No backend: no real employers, messaging, payments or verification; data lives in one browser, so the hiring loop is demonstrated by switching between worker and employer on the same phone.
- The naka QR opens a public link, so it only works for someone else's phone once the app is deployed (it cannot reach `localhost`).
- Locations are a fixed list of Pune and Mumbai areas (Mumbai includes Thane and Vashi); distances are straight-line estimates (labelled).
- Read-aloud depends on the phone having a Hindi/Marathi voice; the app tells the user when it doesn't.
- Employer-written job text appears in the language it was written in (demo jobs include Hindi/Marathi).
- Scheme information is a summary and may change.
