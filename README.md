# ElNinoTracker — El Niño Explained

A simple, non-commercial Next.js application for Sriram Advisory, implementing Website Specification v1.1. It explains the official Pacific status, seasonal chances and everyday context in plain language.

## Run locally

```sh
npm install
npm run build
npm start
```

Open http://localhost:3000. On Windows PowerShell use `npm.cmd` if script execution policy blocks npm.ps1. For development use `npm run dev`.

## Public experience

- NOAA's official current diagnosis, with issue date and watch/advisory shown separately.
- Nine published seasonal outlooks, original phase percentages and explicit full month/year labels.
- An original Pacific illustration with a separate three-phase learning mode.
- India/Global context with official source attribution and separate seasonal guidance.
- India cards show dated IMD rainfall, temperature and farming inputs with practical steps; expired outlooks fall back to useful official guidance. See [content sources and maintenance](docs/INDIA-GUIDANCE-SOURCES.md).
- Observed RONI history with 2-year, 10-year and full-record views, keyboard exploration and a data table.
- Understand and Sources pages, readable local Inter fonts, responsive layouts and correction contact.
- A guided learning page with three NOAA video/transcript links, visual probability examples, India’s two monsoons, common questions, a glossary, six trusted resources and an interactive three-question check.
- Practical seasonal takeaways, a broad-region source guide, matching-period forecast changes and shareable region/season links.
- A plain-language observed history takeaway and a [five-person comprehension test protocol](docs/COMPREHENSION-TEST.md).

No API keys, accounts, paid services, city forecasts or subscriptions are needed. Data adapters archive and validate public NOAA HTML before publishing immutable JSON. Status and outlook publish together; history updates separately. Failed checks retain approved information and show freshness warnings. Runtime scheduling checks daily at 06:00 UTC on a continuously running Node server.

## Verification and operations

```sh
npm test
npm run test:browser
npm run data:refresh
npm run data:status
```

Browser checks need local Chrome (or CHROME_PATH). Copy .env.example to .env.local for the site name, initiative, correction contact and owner/reviewer settings. See [the specification handover and operating runbook](docs/SPECIFICATION-HANDOVER.md) for source mappings, schemas, manual recovery, rollback, hosting requirements and launch checks.

The history publisher does not provide an exact issue day in its HTML: the application records this explicitly rather than inventing a date. Independent scientific review, five-person comprehension testing and a human accessibility audit remain required before public launch. Legacy explorer files are retained but are no longer connected to public routes.
