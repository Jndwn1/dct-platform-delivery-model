# ADO Pipeline Metric Validation

**Authoritative source:** User-supplied Azure DevOps feature extract, August 18, 2026.  
**Verification scope:** DCT Platform Dashboard, Executive Delivery Dashboard, and Batch Control Panel.

## Reconciled Metric Populations

| Metric Population | Complete | In Development / Active | In Review | Planned | Total | Readiness |
|---|---:|---:|---:|---:|---:|---:|
| Batch Delivery | 19 | 6 | 2 | 0 | 27 | 70% |
| Non-Batch MVP | 0 | 5 | 0 | 0 | 5 | 0% |
| Overall MVP Delivery | 19 | 11 | 2 | 0 | 32 | 59% |

The Active count of **11** is the exact supplied ADO population: six Batch Delivery features and five Non-Batch MVP features. Batch Delivery and Overall MVP Delivery are deliberately reported separately so non-batch work cannot inflate the batch-only count.

## Current ADO Active Features — 11

| ADO ID | Feature | Classification | PI | Owner |
|---|---|---|---|---|
| 1354322 | Batch 7  TDC — Client Tax Profile & Eligibility | Batch | PI2 | Luca, Gary |
| 1349599 | Batch 10  TDC — Return Assembly, Filing & Lineage Closure | Batch | PI2 | Luca, Gary |
| 1402117 | Batch 42  TDC — Tax Rule Framework & Book-to-Tax Adjustments | Batch | PI2 | Luca, Gary |
| 1387817 | Batch 9A  DCT Data Gateway & Governed Consumer Access | Batch | PI3 | Abbas, Nasar |
| 1390012 | Batch 28  TDC — Tax Workpapers & Provision Schedules | Batch | PI3 | Luca, Gary |
| 1444477 | Batch 45  TDC — Rule Logic Expression Framework & Adjustments | Batch | PI3 | Luca, Gary |
| 1418018 | DCT MVP Enhancements | Non-Batch MVP | PI3 | Lacombe, Stephane |
| 1408161 | DCT QA Workstream Separation and Sprint Reporting Governance | Non-Batch MVP | PI3 | Kalakonda, Aravind |
| 1403709 | DCT — General Platform Defect Tracking | Non-Batch MVP | PI3 | Stafford, Jenniver |
| 1436035 | TDC Environment Management | Non-Batch MVP | PI3 | Luca, Gary |
| 1395518 | Roger-DCT Integration Stabilization and Follow-up Remediation | Non-Batch MVP | PI3 | Luca, Gary |

## Current ADO Review Ready Features — 2

| ADO ID | Feature | Classification | PI | Owner | Dashboard Bucket |
|---|---|---|---|---|---|
| 1390267 | Batch 31  TDC — Legacy Tool Prior Year Data Housing | Batch | PI3 | Luca, Gary | In Review |
| 1390014 | Batch 31  PDC — Legacy Tool Prior Year Ingestion & Housing | Batch | PI3 | Abbas, Nasar | In Review |

## Classification and Reconciliation Controls

The prior three Planned records were B45, B9A, and B39. The current ADO source confirms B45 and B9A are Active; B39 is absent from the supplied current pipeline and therefore excluded rather than treated as Active or Planned. B20 and B21 are likewise excluded from the current pipeline population.

The Control Panel validates that every feature occupies exactly one status bucket. The reconciliation equations are: `19 + 6 + 2 + 0 = 27` for Batch Delivery, `0 + 5 + 0 + 0 = 5` for Non-Batch MVP, and `19 + 11 + 2 + 0 = 32` for Overall MVP Delivery. A warning is displayed instead of an executive metric when an equation fails.

The prior 23-complete display could not be reconstructed from preserved project sources because its calculation snapshot was not retained. The Control Panel now preserves a record-level traceability view, preventing future unreconcilable aggregate counts.

## Release Candidate

The shared Release Candidate derivation resolves to **RC-2**. It is used by the Platform Dashboard, Executive Delivery Dashboard, UAT dashboard, and PO email generator; no conflicting hard-coded release-candidate labels remain in dashboard components.

## Preview Verification

The refreshed Control Panel displayed **19 Complete**, **6 In Development**, **2 In Review**, and **0 Planned** for the 27-record Batch Delivery population; it displayed **11 In Development** when the five active Non-Batch MVP records were included. The Platform Dashboard visibly listed the ADO-backed active population and showed the source statement: **6 batch features + 5 non-batch MVP features**.

During preview verification, stale B39 and B20/B21 labels were found in supporting Home-page milestone and historical summary content. They are being reconciled separately from the authoritative Active ADO Features list so historical references are not presented as current-pipeline status.

## Final Cross-Dashboard Verification

The Platform Dashboard now shows only B8, B29, B17, and B16 in **Recently Closed in PI3**; it shows only the two supplied B31 records in **Upcoming Milestones**. The Executive Delivery Dashboard caption renders **27 Current Batch Features + 5 Non-Batch MVP Features**. The Control Panel reports **19 Complete**, **6 In Development**, **2 In Review**, and **0 Planned** for Batch Delivery, plus **11 In Development** across Overall MVP Delivery; its reconciliation check passes.

Delivery Intelligence now labels PI3 progress as a **batch-only** measure: **3 complete, 3 active batch features, and 2 Review Ready across 8 PI3 batch records**. Its Capacity Readiness card separately reports **11 Active MVP Features (Platform)**, preventing the PI3 subset from being misread as the total ADO Active population.

## Metric Scope Contract

| Display scope | Population | Status result | Intended surfaces |
|---|---:|---:|---|
| **Current ADO pipeline — overall MVP** | 32 current records: 27 batch + 5 non-batch MVP | 19 Complete · 11 Active · 2 Review Ready · 0 Planned | Platform Home, Executive Delivery Dashboard, Batch Control Panel |
| **Current ADO pipeline — PI3 batch subset** | 8 PI3 batch records | 3 Complete · 3 Active · 2 Review Ready · 0 Planned | Delivery Intelligence PI3 Readiness |
| **Historical planning baseline** | Roadmap and calendar reference records | Not used for current ADO counts | Batch Roadmap and Batch Delivery Calendar, explicitly labeled as historical planning context |

This contract prevents a PI3 subset count from being compared directly with the overall ADO pipeline. B20, B21, and B39 are retained only as historical planning records and are not presented as current ADO Active or Review Ready work.

The Batch Delivery Calendar was browser-verified to display its legacy count as **Historical Planning Baseline** and to direct readers to the Platform Dashboard for the current **11 Active / 2 Review Ready** status.

The Batch Roadmap route was restored and browser-verified. Its header explicitly identifies the roadmap as **Historical planning scope** and directs current ADO pipeline status to Platform Home; B20, B21, and B39 remain visible only within that historical schedule context.

The Control Panel was browser-verified with the overall ADO scope: **19 Complete, 11 In Development, 2 In Review, and 0 Planned** across 32 records. Its traceability table explicitly identifies the six batch and five non-batch Active records, the two B31 Review Ready records, and the exclusion of B20, B21, and B39 from the current executive metric population.

The B21 and B39 detail routes were also browser-verified. Both display the historical planning-reference notice and explicitly exclude themselves from the current ADO Active and Review Ready pipeline, matching the previously verified B20 detail route.

The Consumer Integration Hub was browser-verified after adding its visible **Current delivery scope** notice. The notice explicitly directs current status to Platform Home and states that historical references such as B39 are not Active or Review Ready unless present in the ADO-backed view.

Platform Home was browser-verified after the final reconciliation. It shows **11 Active ADO Features**—six batch features and five non-batch MVP features—and marks B20, B21, and B39 as **Out of Current ADO Pipeline** in the batch portfolio.

The Batch Delivery Calendar was browser-verified and displays its **Historical Planning Baseline** notice, explicitly directing current delivery status to Platform Home. Delivery Intelligence was also browser-verified: it distinguishes the PI3 batch-only subset (**3 Active Batch Features**, **2 Review Ready**, **0 Planned**) from the overall platform measure of **11 Active MVP Features**.

Additional scope controls were applied to supporting views: the Consumer Integration Hub classifies its B39 resourcing question as a historical planning assumption excluded from the current ADO pipeline, while Delivery Intelligence labels B20, B21, and B39 dependency nodes as historical planning references and excludes them from the current critical-path classification.

## B20 / B21 / B39 Reference Audit

| Source surface | Reference purpose | Required scope treatment | Verified treatment |
|---|---|---|---|
| Platform Home | Current batch and overall MVP delivery metrics | Current ADO pipeline | Uses the 11 Active / 2 Review Ready population; excluded records are labeled outside the current pipeline. |
| Executive Dashboard | Current delivery KPI and calendar reference | Current ADO pipeline | B20, B21, and B39 are marked **Out of Current ADO Pipeline**; B31 records are **Review Ready**. |
| Batch Control Panel | Record-level delivery metric traceability | Current ADO pipeline | Uses the authoritative 27 batch + 5 non-batch population and ADO IDs/owners. |
| Delivery Intelligence | PI3 batch-only readiness and dependency analysis | PI3 batch subset plus historical reference | Displays 3 Active / 2 Review Ready PI3 batch records; B20, B21, and B39 nodes are explicitly historical and non-critical. |
| Batch Delivery Calendar | Schedule and planning reference | Historical planning baseline | Labels legacy counts as **Historical Planning Baseline** and directs current-status interpretation to Platform Home. |
| Batch Detail pages | Architecture, stories, and dependency detail | Live status plus historical reference | B20, B21, and B39 display a historical-planning notice that excludes them from current ADO Active and Review Ready status. |
| Batch Roadmap source | Roadmap and epic-mapping reference | Historical planning context | Header labels roadmap metrics as historical planning context and directs current ADO status to Platform Home. |
| Consumer Integration Hub | Open governance/resourcing question | Historical planning context | B39 question is labeled **Historical** and explicitly excluded from current ADO status. |
| Sidebar, knowledge graph, context registry, batch model | Navigation, architecture metadata, and shared reference data | Reference only | These sources do not render a current delivery count; live status is governed by the shared metric model. |
| Demo Runner, Gap Analysis, Lineage Explorer, and PDC discovery views | Simulation, backlog, lineage, and architecture documentation | Reference only | Mentions are retained for architecture traceability and do not contribute to current ADO delivery metrics. |

This audit distinguishes all current-status surfaces from historical, simulation, and architecture-reference surfaces. The supplied ADO extract remains the controlling source for the current pipeline.

### Individual Source-File Classification

| Source file | Classification | Current ADO display behavior or rationale |
|---|---|---|
| `client/src/components/ExecDashboard.tsx` | Current ADO dashboard | Uses the shared metric model; B20, B21, and B39 calendar rows are explicitly outside the current ADO pipeline. |
| `client/src/components/Sidebar.tsx` | Navigation only | References are navigation/grouping metadata and do not render delivery status. |
| `client/src/lib/batchModel.ts` | Shared architecture metadata | Static batch definitions are overlaid by the live shared status model in current-status views. |
| `client/src/lib/knowledgeGraph.ts` | Architecture reference | Batch mentions describe system relationships, not current delivery state. |
| `client/src/lib/pageContextRegistry.ts` | Context metadata | Page context supports discovery guidance and does not publish a delivery metric. |
| `client/src/pages/BatchControlPanel.tsx` | Current ADO dashboard | Authoritative 27-batch + 5-non-batch metric records with ADO identifiers and owners. |
| `client/src/pages/BatchDeliveryCalendar.tsx` | Historical planning baseline | Legacy PI schedule clearly labels its counts as historical and links to Platform Home for current status. |
| `client/src/pages/BatchDetailPage.tsx` | Detail / architecture traceability | B20, B21, and B39 show the historical planning-reference notice; other batches use live status. |
| `client/src/pages/BatchRoadmap.tsx` | Historical planning context | Restored route labels the roadmap as historical planning scope and directs current status to Platform Home. |
| `client/src/pages/ConsumerIntegrationReadinessHub.tsx` | Historical governance question | B39 resourcing entry is labeled Historical and excluded from current ADO Active/Review Ready status. |
| `client/src/pages/DeliveryIntelligencePage.tsx` | PI3 batch subset | Current PI3 measures are 3 Active / 2 Review Ready; B20, B21, and B39 dependencies are historical and non-critical. |
| `client/src/pages/DemoRunner.tsx` | Simulation | Scenario data is not a current delivery metric source. |
| `client/src/pages/GapAnalysisEngine.tsx` | Architecture backlog reference | Mentions describe analysis gaps and do not contribute to the current ADO population. |
| `client/src/pages/Home.tsx` | Current ADO dashboard | Uses the 11 Active / 2 Review Ready overall population and marks excluded historical portfolio records. |
| `client/src/pages/LineageExplorer.tsx` | Architecture reference | Mentions model lineage and do not render delivery status. |
| `client/src/pages/discovery/PDCOverview.tsx` | Discovery / architecture reference | Mentions describe capability context and do not publish a current delivery metric. |

### Exhaustive Source Occurrence Inventory

The following inventory was generated by scanning all TypeScript and TSX files under `client/src` for exact `B20`, `B21`, or `B39` references. Each source file is classified once because every occurrence within a file is governed by the same page-level scope treatment.

| Occurrences | Source file | Scope classification | Evidence / treatment |
|---:|---|---|---|
| 25 | `pages/BatchRoadmap.tsx` | Historical planning context | Browser-verified route header identifies the schedule as historical planning scope. |
| 19 | `pages/BatchDeliveryCalendar.tsx` | Historical planning baseline | Browser-verified baseline label directs current status to Platform Home. |
| 13 | `pages/DeliveryIntelligencePage.tsx` | PI3 current subset + historical dependencies | B20, B21, and B39 are marked historical and non-critical; PI3 uses the 3 Active / 2 Review Ready subset. |
| 8 | `lib/batchModel.ts` | Architecture metadata | Current-status components overlay these static records with the shared status model. |
| 5 | `pages/GapAnalysisEngine.tsx` | Architecture backlog reference | References do not contribute to delivery metrics. |
| 5 | `pages/BatchDetailPage.tsx` | Detail / architecture traceability | B20, B21, and B39 route headers show the browser-verified historical notice. |
| 4 | `lib/pageContextRegistry.ts` | Context metadata | Discovery context only; no delivery metric rendered. |
| 4 | `components/Sidebar.tsx` | Navigation metadata | Navigation grouping only; no delivery status rendered. |
| 3 | `pages/Home.tsx` | Current ADO dashboard | Shared ADO metric population is used; excluded historical records are labeled outside the current pipeline. |
| 3 | `pages/ConsumerIntegrationReadinessHub.tsx` | Historical governance context | Browser-verified visible current-delivery scope notice excludes B39 unless in the ADO-backed view. |
| 3 | `components/ExecDashboard.tsx` | Current ADO dashboard | Calendar entries for B20, B21, and B39 are outside the current ADO pipeline. |
| 1 | `pages/discovery/PDCOverview.tsx` | Discovery / architecture reference | Capability context only; no delivery metric rendered. |
| 1 | `pages/BatchControlPanel.tsx` | Current ADO dashboard | Browser-verified overall 32-record traceability table excludes B20, B21, and B39. |
| 1 | `lib/knowledgeGraph.ts` | Architecture reference | Relationship metadata only; no delivery metric rendered. |

The deterministic line-level audit (`/home/ubuntu/ado_occurrence_audit.mjs`) scanned every exact B20, B21, and B39 occurrence under `client/src`. It confirmed that **all 86 occurrences** have an explicit source-file scope classification and that **0 occurrences are unclassified**.
