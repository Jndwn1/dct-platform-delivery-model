# MVP Critical Milestones Verification

The landing page renders the executive milestone component directly below the Executive Status Summary and before the detailed Executive Delivery Dashboard. The component shows all five communicated delivery commitments: Aug. 21 critical story completion, Aug. 27 remaining stories plus PY data readiness, Aug. 28 environment readiness, Sep. 3 UAT readiness, and the Sep. 21 MVP / RC-3 target.

The Release Targets panel now displays the dynamically selected next critical milestone: **Aug. 21, 2026 — Critical Story Completion**. The existing RC-3 label, Sep. 21 target, MVP feature totals, readiness values, and PI measures remained unchanged. Browser verification confirmed the component is visible in the landing-page executive area; the full regression suite passed with 49 tests.

## Governed source derivation

Milestone dates and commitments retain the approved leadership schedule, while status and source metadata are now derived from the shared governed dashboard inputs. Critical story completion and the release target consume the governed 28-feature lifecycle; Prior Year readiness consumes the two B31 review-ready ADO records; environment readiness consumes the Environment Management ADO record; and UAT readiness consumes the QA Workstream ADO record. The RC-3 target date is read directly from `GOVERNED_PROGRAM_HEALTH.pilotTargetDate`.

If a future milestone has no matching governed source record, the display does not infer completion. It remains Upcoming and identifies **Confirmation required**. A date that passes without an explicit completed source record changes the displayed status to **At Risk / Confirmation Required**.
