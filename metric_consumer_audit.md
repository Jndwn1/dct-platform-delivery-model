# Locked 28-Feature Metric Consumer Audit

**Baseline:** 28 total MVP features; 23 batch features + 5 active non-batch MVP features; 15 Complete; 11 Active / In Development; 2 In Review; 0 Planned; 54% overall MVP readiness.

This audit is governed by [`metric_baseline_decision.md`](./metric_baseline_decision.md). It records every code consumer returned by the source audit for shared metric helpers, the baseline constant, or the delivery-email export.

| Consumer | Shared source rule | Scope displayed | Verification result |
|---|---|---|---|
| `BatchStatusContext.tsx` | `LOCKED_MVP_BASELINE`, `deriveMvpMetrics`, and `matchesLockedMvpBaseline` | Authoritative model | Defines 28 / 15 / 11 / 2 / 0 and enforces it through regression coverage. |
| `Home.tsx` | `deriveMvpMetrics` for primary KPI cards; `deriveBatchMetrics` only for clearly labelled 23-batch detail | Overall MVP primary; batch detail secondary | Rendered Platform Home KPI cards show 15 Complete, 11 Active, 2 In Review, and 0 Planned. |
| `ExecDashboard.tsx` | `deriveMvpMetrics` for primary lifecycle KPIs | Overall MVP primary | Rendered cards show 15 MVP Features Complete, 11 Active, 2 In Review, and 0 Planned. |
| `BatchControlPanel.tsx` | `deriveMvpMetrics` for summary cards; shared metric records for traceability | Overall MVP primary; 23-batch and 5 non-batch detail | Rendered Control Panel shows All (28), Complete (15), In Development (11), In Review (2), Planned (0). |
| `DeliveryIntelligencePage.tsx` | Shared MVP metrics for platform capacity; `derivePICompletion` for PI3 subset | Overall platform activity plus explicitly separate PI3 batch subset | Rendered view shows 11 Active MVP Features (Platform), while PI3 is separately labelled 3/8 complete, 3 active batch features, and 2 Review Ready. |
| `GeneratePOEmail.tsx` | `deriveMvpMetrics` passed into `buildEmailHTML` | Export summary | Email KPI summary now labels overall MVP readiness, MVP Features Complete, Active, and In Review from the 28-feature shared metric. |
| `server/pi3ClosureStatus.test.ts` | `LOCKED_MVP_BASELINE` plus `matchesLockedMvpBaseline` | Regression guard | Test asserts the full approved baseline and prevents silent metric drift. |

## Rendered Evidence

The Control Panel was rendered after the final baseline lock. Its filter counts were **All (28)**, **Complete (15)**, **In Development (11)**, **In Review (2)**, and **Planned (0)**. Its primary cards showed the same values and its traceability section separately identified 23 batch features and 5 non-batch MVP features.

Delivery Intelligence was rendered after the final baseline lock. It reported **11 Active MVP Features (Platform)** as the overall ADO activity measure and explicitly separated PI3 delivery from that primary population: **3/8 PI3 batch records Complete**, **3 Active Batch Features**, and **2 Review Ready**. Historical PI3 closures were displayed as a separate historical measure.

## Export Surface Result

The only code-based export surface identified by the shared-metric search was `GeneratePOEmail.tsx`. Its primary KPI grid now receives the shared MVP metric object; it no longer calculates “Batches Complete” or “Active Batches” from filtered batch rows for the executive KPI summary.
