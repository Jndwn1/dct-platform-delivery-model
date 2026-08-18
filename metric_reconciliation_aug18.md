# DCT Metric Reconciliation — August 18, 2026

## Purpose

This reconciliation establishes one governed delivery model for the DCT dashboard. It keeps four independent dimensions separate: **portfolio delivery status**, **ADO activity**, **QA validation**, and **program readiness**. No dashboard percentage may be used as the sole basis for Release Candidate or program health.

## Source Rules

| Measure | Governing source | Rule applied |
|---|---|---|
| Portfolio scope | August 18 DCT delivery reconciliation | 27 MVP batches and 32 MVP features, including five non-batch MVP features |
| Portfolio delivery status | Governed delivery reconciliation | Mutually exclusive: Complete, In Development, In Review, or Planned |
| ADO activity | Current ADO work item extract | Displayed separately; active ADO work does not automatically mean delivery is in development |
| QA validation | QA readiness tracking | Displayed separately from PI delivery completion |
| Historical PI3 closure | July 28 PI3 baseline plus later completions | Historical aggregate is preserved without inventing an unnamed capability |
| Program health | Governance assessment | Sep. 21 MVP Pilot remains On Track; RC-3 is governance-based |

## Corrected Portfolio Metrics

| Population | Total | Complete | In Development | In Review | Planned | Completion / Readiness |
|---|---:|---:|---:|---:|---:|---:|
| Batch delivery | 27 | 22 | 3 | 2 | 0 | 81% |
| Non-batch MVP features | 5 | 0 | 5 | 0 | 0 | 0% |
| Overall MVP portfolio | 32 | 22 | 8 | 2 | 0 | 69% |

The active ADO feature list contains six batch features—B7, B10, B42, B45, B28, and B9A—and five non-batch features. Their ADO activity is retained for traceability, but B7, B10, and B42 count as **Complete** in governed portfolio delivery. B45, B28, and B9A count as **In Development**. The two B31 records count as **In Review**.

## PI and QA Reconciliation

| Dimension | PI1 | PI2 | PI3 | Interpretation |
|---|---:|---:|---:|---|
| Delivery completion | 100% | 100% | 38% | PI completion measures governed delivery scope only |
| QA validation progress | 100% | 86% | Not reported | QA validation is not a substitute for delivery completion |
| Program / pilot status | Complete | Complete | Active | Overall program status remains **On Track** for Sep. 21 |

PI2 delivery is therefore shown as **Complete**, with a separate 86% QA validation indicator and a late-QA-onboarding note. The dashboard does not call the program At Risk merely because a delivery completion percentage is below an arbitrary threshold.

## PI3 Historical Closure Reconciliation

| Historical point | Completion count | Explanation |
|---|---:|---|
| July 28 baseline | 11 cumulative; 8 in reporting week | The provided baseline names ten capabilities but confirms eleven cumulative completions; the aggregate is preserved rather than guessing an eleventh name |
| Post-baseline closure: B17 | Aug. 4 | Included as a legitimate later completion |
| Post-baseline closure: B29 | Aug. 11 | Included as a legitimate later completion |
| Current cumulative PI3 closures | 13 | 11 baseline + 2 post-baseline closures |
| Aug. 17–23 reporting week | 0 | No completion date falls in the current reporting window |

`Recently Closed in PI3` uses original completion date, not later deployment or QA dates. It no longer labels a prior-week closure as “Closed Today” or “This Week.”

## Program Readiness

> **Program Status: On Track.** QA onboarding occurred late, but delivery remains on pace for the September 21 MVP Pilot. Release Candidate is governed as **RC-3** and is not derived from a raw completion-percent threshold.

## Controls Implemented

1. The shared delivery model supplies Batch Delivery, Overall MVP, PI completion, ADO activity, historical closure, QA, and Release Candidate values.
2. Platform Home, Executive Dashboard, Batch Control Panel, Delivery Intelligence, and UAT Release Candidate views consume shared governed values rather than independent KPI formulas.
3. The Batch Control Panel displays ADO Activity separately from Portfolio Delivery and includes the historical PI3 baseline and QA context.
4. Regression coverage validates the 27/32 portfolio, 22/8/2/0 MVP buckets, 22/3/2/0 batch buckets, PI2 delivery completion, PI3 delivery completion, and historical closure baseline.
