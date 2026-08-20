# Phase 1 Pre-Restructure Manifest

**Purpose:** Baseline the DCT Platform before the non-destructive operating-model navigation restructure. This manifest is a preservation control, not a retirement list.

> **Phase 1 rule:** Every route, page component, source/artifact registration, database-backed record, Ask Buddy source, redirect, and hidden/unlinked page listed here remains preserved. No deletion, archive, data change, or source removal is authorized by this manifest.

## Baseline counts

| Inventory category | Baseline | Preservation requirement |
|---|---:|---|
| Registered application routes | 63 | Preserve all paths and direct-link behavior. |
| Page components | 73 | Preserve all files and implementation content. |
| Sidebar entries | 86 | Reorganize only; retain route access. |
| Sidebar sections | 6 | Replace with operating-model workspace sections only. |
| Ask Buddy page-context registrations | 43 | Retain all existing registrations; add only workspace-hub context. |
| Unlinked page components | 12 | Preserve as Historical / Training / Pending Archive Review. |

## Current sidebar structure

| Current section | Current purpose | Phase 1 preservation treatment |
|---|---|---|
| Platform | Landing page, Ask Buddy, Learning Center, Batch Calendar | Reorganize into Executive Health, Delivery Management, Ask Buddy, and Guided Onboarding. |
| Batches by PI | Direct batch drill-down across PI 1–4 and on-hold records | Preserve as a collapsed Delivery Management drill-down. |
| Discovery Center | Platform overview, services, integration, BA tools | Reorganize into Discovery & BA Workspace and Architecture & Governance. |
| Business Architecture & Governance | QA, deployments, control, governance, taxonomy, simulations | Reclassify by operational workspace and advanced/admin visibility. |
| Roger UI | Consumer hub, API evolution, UI mapping | Preserve under Product & Roger Readiness. |
| Platform Governance Tools / Architecture & Diagrams | Governance models and architecture visuals | Preserve under Architecture & Governance, with advanced disclosure. |

## Route preservation register

| Area | Preserved routes |
|---|---|
| Executive / delivery | `/`, `/batch-calendar`, `/batch-roadmap`, `/control-panel`, `/batch/:id` |
| Delivery assurance | `/gate-status`, `/gate/overview`, `/gate/:id`, `/touchpoints`, `/batch-delivery-review` |
| Product & Roger | `/consumer-integration-hub`, `/roger-api`, `/roger-mapping`, `/roger-consumer-readiness` |
| Architecture & governance | `/architecture`, `/architecture/developer`, `/architecture/enterprise`, `/architecture/sync`, `/architecture/visio`, `/runtime-journey`, `/data-model`, `/data-governance`, `/taxonomy`, `/tax-mapping`, `/classification-walkthrough`, `/aap-review`, `/gap-analysis` |
| QA / UAT / deployment | `/qa-deployment-registry`, `/deployment-registry`, `/qa-release-sim`, `/uat-testing` |
| Discovery / BA | `/discovery`, `/discovery/ecosystem`, `/discovery/platform-responsibilities`, `/discovery/data-flow`, `/discovery/simulation`, `/discovery/integration-architecture`, `/discovery/ba-requirements`, `/discovery/checklist`, `/discovery/glossary`, `/discovery/dct-overview`, `/discovery/roger-overview`, `/discovery/gosystem`, `/discovery/prior-year-inventory`, `/discovery/pdc`, `/discovery/master-data-governance`, `/discovery/data-gateway`, `/discovery/ba-story-builder`, `/discovery/knowledge-graph`, `/discovery/prior-year-migration` |
| Guided onboarding / specialized workspace | `/learning-center`, `/onboarding`, `/onboarding/step1`, `/onboarding/step2`, `/onboarding/step3`, `/onboarding/step4`, `/onboarding/step5`, `/onboarding/step6`, `/onboarding/step7` |
| Ask Buddy and compatibility | `/ask-buddy`, `/integration-hub`, `/integration-simulation`, `/404` |

## Redirects and compatibility behavior

| Existing path | Preserved target / behavior |
|---|---|
| `/integration-hub` | Redirects to `/consumer-integration-hub`. |
| `/roger-consumer-readiness` | Redirects to `/consumer-integration-hub`. |
| `/architecture/sync` | Preserved Architecture view alias. |
| `/architecture/visio` | Preserved Architecture view alias. |
| `/batch/:id` | Preserved dynamic batch-detail pattern. |
| `/gate/:id` | Preserved gate-detail pattern. |

## Ask Buddy and source preservation

| Source / registration | Phase 1 treatment |
|---|---|
| `PAGE_CONTEXT_REGISTRY` and dynamic path resolvers | Preserve existing entries and dynamic batch/gate/architecture/discovery behavior. |
| Ask Buddy grounding, provenance, source freshness, and conflict detection | Preserve without logic changes. |
| Ask Buddy audit history | Preserve all existing records. |
| Authoritative Master Data registration and active-tab / OLD-tab controls | Preserve. |
| Prior Year mapping artifacts, sessions, results, and evidence rules | Preserve. |
| Registered API/Swagger status and unavailable-source safeguards | Preserve. |

## Database-backed operational evidence

| Data surface | Preservation requirement |
|---|---|
| Deployment Registry and deployment screens | Preserve release/deployment history and links. |
| QA deployment and QA screen records | Preserve all QA release evidence. |
| UAT cases, defects, and risks | Preserve workflow capability and any future/populated evidence. |
| Ask Buddy audits | Preserve governance/provenance history. |
| Mapping artifacts, sessions, results, and review state | Preserve source traceability and mapping evidence. |
| Integration questions / decisions | Preserve decision-log capability and records. |

## Admin and advanced surfaces

| Item | Phase 1 classification |
|---|---|
| Batch Control Panel | Admin / advanced; route remains accessible. |
| Governance Gates, Touchpoints, Batch Delivery Review | Advanced delivery assurance; retain existing pages behind a new workspace hub. |
| AAP Review, Tax Mapping Confidence, Classification Walkthrough, Gap Analysis | Advanced mapping and decisioning; retain routes and source data. |
| Developer Architecture, Architecture Sync, Data Model, Data Governance, Taxonomy | Advanced architecture and governance; retain routes. |

## Historical, training, experimental, and unlinked components

The following components were not found in active router/sidebar/page references before Phase 1. They are preserved and must not be deleted or repurposed during Phase 1:

`AgentHub.tsx`, `BATouchpointSummary.tsx`, `BatchFlow.tsx`, `ComponentShowcase.tsx`, `DeliveryIntelligencePage.tsx`, `DemoRunner.tsx`, `IntegrationAlignmentHub.tsx`, `LineageExplorer.tsx`, `PlaceholderPage.tsx`, `QAReleasePrepPage.tsx`, `RegistryAudit.tsx`, and `WeeklyDemo.tsx`.

**Phase 1 classification:** Historical / Training / Pending Archive Review. They remain available in source history and are not added to standard navigation.
