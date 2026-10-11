# India cards: source verification and maintenance

The owner requested substantive guidance instead of empty source-link fallbacks. The cards now summarize official publications with a separate source_verified editorial status. This does not claim independent scientific review, which remains a public-launch requirement. The public cards show useful inputs first; detailed scope and verification information is expandable.

## Current dated inputs

Source: [IMD seasonal outlook issued 30 September 2026](https://internal.imd.gov.in/press_release/20260930_pr_5356.pdf).

- Page 1, highlights a–c and page 3: October national rainfall is forecast below 85% of the long-period average; October–December rain over the five listed southern subdivisions is most likely normal. The card says “usual amount” to explain the average. The 85% is a rainfall amount compared with usual, not a probability.
- Page 1, highlight c: October maximum temperatures are forecast above normal over most of India, with specified exceptions. The card retains “most” and regional exceptions; it does not create a district heatwave alert.
- Page 2: potential post-monsoon water/soil-moisture pressures and increased irrigation needs, with advice to assess water availability and improve irrigation efficiency. The farming card preserves conditional wording and does not predict harvest losses.

The monthly rain and heat cards expire at the end of October. The winter-crop outlook expires at the end of December. Any valid IMD outlook is displayed regardless of the NOAA phase, because regional forecasts include additional climate influences.

## General guidance after expiry

- [IMD monsoon FAQ](https://mausam.imd.gov.in/imd_latest/monsoonfaq.pdf): multiple monsoon influences, different seasons and spatial/temporal variability. This is general context, not a forecast for a specific year.
- [NCDC public heat advisory](https://ncdc.mohfw.gov.in/uploads/pdf/heat6.pdf): drinking water, shade, extra attention to vulnerable people and strenuous work in cooler hours. These are precautions for hot conditions, not medical treatment or an active alert. The linked PDF has inconsistent date labels, so no exact publication date is invented.
- IMD's post-monsoon preparation advice supplies the general water/farming card. It is conditional on low rainfall and explicitly labeled general guidance when the dated forecast expires.

## Updating the content

This is a curated official-summary release, not an automatic IMD PDF feed. NOAA’s scheduled refresh does not update these summaries. The operational owner should check new monthly IMD outlooks near the end of each month and add a new reviewed source summary to data/impact-content.json. Preserve the exact PDF URL, issue date, validity dates and supporting passage in these notes. Update source_checked_at only after checking the publication.

Give each new card the same topic (rain, water or farms); the selector chooses the newest valid official outlook for that topic, otherwise its verified general guidance. Set evidence_type=official_outlook for dated forecasts or official_guidance for general precautions, with review_state=source_verified, supporting HTTPS sources and a check date. Independent reviewer approval remains separate. Keep explanation plus action under 55 words, do not mix phase probabilities with local rainfall and do not extend validity to hide expiry.

Verify with npm test and npm run test:browser. Tests cover monthly versus seasonal expiry, rejection of unverified interpretation, practical actions and word limits. Source payloads are editorial summaries; no new agency forecast is calculated.
