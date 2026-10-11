# Specification v1.1 handover

The public experience now consists of the dashboard, Understand and Sources. Its order is official status → seasonal outlook → India/Global context → observed history → a short explanation. The working title is configurable; the initiative is Sriram Advisory and corrections go to sriram@sriramadvisory.com. There are no account, subscription, chatbot, local forecasting or public write routes in this version. Legacy code remains unused in the repository.

## Run and verify

Use Node 24, `npm.cmd install`, `npm.cmd run build`, then `npm.cmd start` on Windows. Elsewhere use `npm`. The application runs at http://localhost:3000. `npm.cmd test` checks NOAA parsing, release validation, season labels, freshness and fetch restrictions. `npm.cmd run test:browser` checks the main flows, read-only APIs and 390/320px layouts with locally installed Chrome. Set CHROME_PATH if Chrome is elsewhere and TEST_URL for a different port. Browser screenshots are written to test-results.

Copy .env.example to .env.local for site settings. Only server-side settings are used. No API keys or paid services are required. Keep the same configuration when running CLI jobs (export variables in the scheduler; Node CLI does not automatically read .env.local).

## Source mapping and operating policy

| Public field | Official source | Adapter |
| --- | --- | --- |
| Present phase, watch/advisory, issue date | NOAA CPC ENSO Diagnostic Discussion | parseAssessment |
| Published three-month probabilities | NOAA CPC RONI probability table | parseOutlook |
| Observed ocean index | NOAA CPC RONI, ERSSTv6, 1991–2020 reference | parseHistory |
| India information links | IMD monsoon information, historical ENSO/monsoon information and agrometeorology | data/impact-content.json |

Source URLs live in lib/enso/policy.mjs. Source fixtures in tests/fixtures/enso are archived HTML with check metadata; they are adapter tests, not a live forecast. Verified bootstrap records in data/bootstrap supply a last-known release on a fresh checkout and retain original dates. Never relabel bootstrap information as newly issued.

**Documented source exception:** NOAA's RONI history HTML does not state an exact publication day, and the response used here did not supply Last-Modified. History therefore has issued_at=null and an explicit issued_at_basis, with the observation period and fetch time shown separately. We do not invent a publication date or substitute the fetch time. This is a deliberate exception to a required exact issued_at field, pending publisher availability/reviewer approval.

Daily checks run at 06:00 UTC while the Node process is continuously running. Serverless deployments must instead schedule `npm run data:refresh` daily and set ENSO_AUTO_REFRESH=0. Sources have a 15-second timeout, two retries, conditional HTTP headers when available, an HTTPS NOAA host allowlist, bounded redirects and a 3MB response limit. A successful check does not change source issue dates. Overdue means seven days after a known expected issue, otherwise 45 days after issue; older than 90 days is an archive. These are website operating rules, not NOAA definitions. History uses its last completed observation period where no issue date exists.

## Publication and recovery runbook

1. `npm run data:refresh` retrieves the three sources and archives their exact HTML with SHA-256 checksums. Status and outlook are validated and published as one matching-issue bundle; observed history publishes independently.
2. Release files are immutable. A temporary file and rename replace only the public manifest after validation. Public readers resolve one manifest and never read staged records. Validation rejects ambiguous phase labels, mismatched source periods, invalid percentages, duplicate observations and index migration. Rounded totals of 99–101 retain original percentages; only drawn widths normalize.
3. Failed fetches or unexpected parsing retain the approved release. `.enso-data/checks.json` distinguishes failed checks from publication age; staged records and audit.ndjson explain the failure. `npm run data:status` provides an operational check. Inspect failures daily; do not assume scheduling is operational merely because the footer describes it.
4. After an upstream change, update the fixed adapter, add the changed HTML fixture and a regression test, then run all checks. A trained reviewer must verify meaning before accepting a new index, altered columns or unusually large revisions.
5. Manual recovery: archive the exact HTML in ENSO_DATA_DIR/raw using the record's raw_file name; make a JSON object with `releases` containing the reviewed assessment/outlook pair (and optionally history), using the existing schema. Run `node scripts/enso-data.mjs import path/to/bundle.json "reviewer identity"`. The CLI validates records, requires matching diagnosis issue dates and records the approving identity. There is no web import endpoint.
6. Roll back an approved diagnosis using `node scripts/enso-data.mjs rollback diagnosis bundle-id "operator identity"`; for history use `rollback history release-id "operator identity"`. IDs are listed in bundles/releases and audit.ndjson. Rollback preserves files and records the action.
7. Recovery copies of published records and raw sources are retained in ENSO_RECOVERY_DIR. Put this directory on separately backed-up storage for production; the default local sibling directory is only a convenient local copy. Restore a reviewed recovery manifest together with all referenced releases/raw sources into ENSO_DATA_DIR while refresh is disabled, then verify `data:status` and the four APIs. Manually check that restored dates remain original.
8. `node scripts/enso-data.mjs bootstrap` saves the current complete approved snapshot for a reviewed repository release. Do not use it to hide stale sources. Runtime archives/recovery and the specification DOCX are ignored by Git.

## Content editing

Edit data/impact-content.json. Each card needs a region, phase, applicable months, evidence type, official link, text and verification metadata. Keep explanation plus action under 55 words. Direct summaries of official outlooks and precautions can publish after source verification, with supporting source links and check dates. This is separate from independent scientific sign-off. Typical patterns require scientific approval; dated official outlooks require valid_from/valid_until and issued_at. Never present global phase chances as local rainfall chances. October–December India context must distinguish the past/future southwest monsoon from the northeast monsoon. Unverified interpretations remain unpublished.

Scientific and operational owners are intentionally not invented. Appoint both via environment configuration and verify their display on Sources. At the owner's request, India cards now provide editorially source-verified summaries of published IMD outlooks and NCDC precautions. This verification is distinct from independent scientific sign-off. See INDIA-GUIDANCE-SOURCES.md for the source passages, validity and monthly maintenance.

## Plain-language improvements

The dashboard includes a seasonal “What does this mean for me?” takeaway, a Global selector for worldwide, North America, South America, Australia and Southeast Asia, and source guides. Global guides link to NOAA's public explanation and Australia's Bureau of Meteorology monitoring pages. India cards summarize verified IMD outlooks and official precautions directly. Switching a region never changes global diagnosis or phase probabilities.

“What changed?” compares original percentages only for identical season dates, provider, source, adapter and probability basis across two differently dated approved outlooks. It reports percentage points, not percent change. No prior baseline means no invented comparison. The first retained release may therefore have no comparison; later published releases supply it. The observed history takeaway reports the difference between the latest two overlapping three-month values and explicitly avoids diagnosing a phase.

Share this view copies region, area and forecast period into a URL; it falls back to a selectable text field when clipboard access fails. A shared link always displays the latest approved release and falls back to the earliest ongoing forecast if its requested period has ended. No tracking, accounts or clipboard reads are used by the application. See COMPREHENSION-TEST.md for the five-person test protocol; actual testing remains pending. Multilingual support is excluded at the owner's request.

## Hosting and public launch checklist

This is currently a local implementation; hosting and domain publication require the owner's decision. Use a continuously running Node server with persistent ENSO_DATA_DIR and separately backed-up ENSO_RECOVERY_DIR, or an external daily job with storage visible to all web workers. Do not use ephemeral per-request/serverless disks for ingestion. For multiple workers run one scheduler, and serve/cache the read-only API through the chosen CDN using its response headers. Confirm pricing, region, domain and deployment access before publishing.

- Appoint the operational owner and scientific reviewer; document daily failure monitoring and backup restore responsibility.
- Have at least five nonexperts explain current status, future chance and India caveats after using the app. Record findings and revise wording. Automated tests cannot replace this study.
- Complete human keyboard, screen-reader, contrast and 200% zoom checks, plus an accessibility audit before claiming WCAG AA conformance.
- Verify official links, source dates, expected updates, changing-release scenarios, rollback and backup restore in the chosen hosting environment.
- Review licensing and attribution, refresh cadence, configurable name, footer contact, and India/Global interpretation wording.
- Approve production cost and domain, measure deployed performance and caching, and verify HTTPS. No public deployment has been performed.
