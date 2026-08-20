# DCT Platform Operating Model — Phase 1 Change Report

**Date:** August 20, 2026  
**Scope:** Phase 1 navigation and operating-model restructure only.  
**Approval basis:** DCT Platform Audit, Rationalization & Operating Model Assessment.  

> **Phase 1 outcome:** The platform now presents a role-based DCT operating model while preserving existing routes, pages, database records, source artifacts, mapping evidence, deployment history, and Ask Buddy evidence. No consolidation, archiving, or deletion was performed.

## 1. Navigation before and after

| Measure | Before Phase 1 | After Phase 1 | Result |
|---|---:|---:|---|
| Primary sidebar sections | 6 legacy sections | 6 operating-model workspaces | Reorganized by audience and operating purpose. |
| Visible standard navigation entries | 86 | 28 | Reduced by grouping technical, admin, and training content behind disclosure controls. |
| Advanced entries | Mixed into standard navigation | 9, collapsed by default | Preserved and no longer promoted as daily-operating navigation. |
| Admin entries | Mixed into standard navigation | 1, collapsed by default | Batch Control Panel remains accessible without being an executive navigation item. |
| Historical / training entries | Mixed into standard navigation | 3, collapsed by default | Guided Onboarding, Learning Center, and QA Release Simulation are retained. |
| Application routes | 63 | 69 | All 63 pre-existing routes remain; 6 non-destructive workspace routes were added. |
| Page components | 73 | 75 | Existing components preserved; only workspace-hub components were added. |

### New primary operating-model navigation

| Workspace | Primary audience | Standard navigation focus | Source indicator |
|---|---|---|---|
| **Executive Health** | Executive, Product Owner, cross-functional | MVP/PI health, readiness, milestones, risks, decisions, Ask Buddy | Governed Delivery Model |
| **Delivery Management** | Product Owner, BA, Delivery, Admin | Calendar, current pipeline, delivery assurance, dynamic batch drill-down | Governed Delivery Model |
| **Product & Roger Readiness** | Product Owner, BA, QA, Developer | Screen readiness, UI data mapping, API readiness, consumer decisions | Roger QA Registry |
| **Discovery & BA Workspace** | BA, Product Owner, cross-functional | Requirement Discovery → Readiness Checklist → Story Builder, Prior Year, Master Data, traceability | Discovery knowledge and approved artifacts |
| **Architecture & Governance** | Architect, Developer, Product Owner, BA | Architecture primer, domains, views, data governance, mapping and decisioning | Approved architecture artifacts and ADRs |
| **QA / UAT / Deployment** | QA, BA, Product Owner, Developer | QA Registry, UAT readiness, QA release evidence, deployments | QA Registry and Deployment Registry |

**Ask Buddy remains global** through the Executive Health sidebar section and remains available from existing supported experiences. No Ask Buddy sources or audit history were changed.

## 2. Pages reorganized by workspace

| Workspace | Existing pages and capabilities surfaced or linked | Phase 1 treatment |
|---|---|---|
| Executive Health | `/` DCT Delivery Model dashboard; `/ask-buddy` | Landing page is positioned as Executive Health. Governed delivery information remains unchanged; a source indicator was added. |
| Delivery Management | `/batch-calendar`, `/batch-roadmap`, `/batch/:id`, `/gate/overview`, `/gate/:id`, `/gate-status`, `/touchpoints`, `/batch-delivery-review`, `/control-panel` | Delivery hub provides access to calendar, pipeline, assurance, dynamic batch detail, and controlled administration. Underlying pages remain independent routes. |
| Product & Roger Readiness | `/qa-deployment-registry`, `/roger-mapping`, `/roger-api`, `/consumer-integration-hub`, `/discovery/roger-overview` | Roger hub links to existing content. Screen readiness remains sourced from the shared 18-screen QA Registry; no screen list was copied. |
| Discovery & BA Workspace | `/discovery`, `/discovery/ba-requirements`, `/discovery/checklist`, `/discovery/ba-story-builder`, `/discovery/prior-year-inventory`, `/discovery/prior-year-migration`, `/discovery/master-data-governance`, `/discovery/knowledge-graph`, `/discovery/data-gateway` | Reframed around the BA flow and specialized evidence workspaces. Existing Discovery routes remain direct-link accessible. |
| Architecture & Governance | `/architecture`, `/architecture/developer`, `/architecture/enterprise`, `/architecture/sync`, `/architecture/visio`, `/runtime-journey`, `/discovery/ecosystem`, `/discovery/platform-responsibilities`, `/discovery/data-flow`, `/discovery/integration-architecture`, `/discovery/pdc`, `/discovery/dct-overview`, `/discovery/gosystem`, `/data-model`, `/data-governance`, `/taxonomy`, `/tax-mapping`, `/classification-walkthrough`, `/aap-review`, `/gap-analysis` | Related content is grouped by primer, platform domain, architecture view, data governance, mapping/decisioning, and ADR/lineage context. No source content was merged or rewritten. |
| QA / UAT / Deployment | `/qa-deployment-registry`, `/deployment-registry`, `/uat-testing`, `/qa-release-sim` | QA Registry, release evidence, UAT workflow, and deployments are grouped. QA simulation is retained as Historical / Training. |
| Guided Onboarding | `/guided-onboarding`, `/learning-center`, `/onboarding`, `/onboarding/step1` through `/onboarding/step7` | A single Guided Onboarding entry point is available while every existing training and onboarding route remains preserved. |

## 3. Progressive disclosure and route compatibility

| Classification | Visibility behavior | Preserved examples |
|---|---|---|
| **Standard** | Visible in the six primary workspaces | Calendar, Roger QA Registry, BA workflow, Master Data, Architecture Views, UAT, Deployments. |
| **Advanced** | Collapsed in the sidebar, available on demand | Developer Architecture, Architecture Sync, Runtime Journey, Taxonomy Explorer, Tax Mapping Confidence, AAP Review, Classification Walkthrough, Integration Simulation, Provision & State Workspace. |
| **Admin** | Collapsed in the sidebar, available on demand | Batch Control Panel. |
| **Historical / Training** | Collapsed in the sidebar, available on demand | Guided Onboarding, Learning Center, QA Release Simulation. |

All pre-existing direct routes remain registered, including dynamic Batch Detail and Gate Detail patterns, onboarding steps, legacy compatibility redirects, QA/deployment paths, Discovery pages, architecture aliases, and Ask Buddy. The Phase 1 regression test validates the full pre-restructure route list remains in `App.tsx`.

## 4. Source integrity and data preservation

| Control | Phase 1 result |
|---|---|
| Governed delivery status | Retained. Workspace and Executive Health surfaces link to or derive from the governed delivery model; no duplicate batch-status dataset was created. |
| Roger readiness | Retained. Product & Roger Readiness links Screen Readiness to the QA Deployment Registry and identifies Roger QA Registry as the source. |
| API readiness | Retained. Roger API Evolution continues to carry registered API/contract evidence. |
| Master Data and Prior Year | Retained. The hub links existing artifact-governed pages; no Master Data, PY inventory, mapping session, or mapping result was changed. |
| QA/UAT/deployment | Retained. QA Registry, Deployment Registry, UAT workflow, release evidence, and historical simulations remain separate, existing capabilities. |
| Ask Buddy | Retained. Existing grounding, source hierarchy, page contexts, registered sources, and audit history were not deleted or changed. New workspace routes were registered in the page-context registry. |
| Database records | **No operational database records were modified or deleted.** |
| Source artifacts | **No uploaded or registered artifacts were modified or deleted.** |

## 5. Pre-restructure manifest and validation evidence

The complete pre-restructure manifest is retained at `docs/phase1-pre-restructure-manifest.md`. It records the previous sidebar structure, 63 original routes, redirects, Ask Buddy/page-context preservation controls, source artifacts, database-backed evidence, advanced/admin surfaces, and the twelve preserved unlinked components.

The browser validation record is retained at `docs/phase1-validation-notes.md`. Validation confirmed that Executive Health, Delivery Management, Product & Roger Readiness, Guided Onboarding, and an existing BA Requirement Discovery direct route render correctly after the navigation update.

| Validation control | Result |
|---|---|
| Six primary workspaces visible | Passed |
| Global Ask Buddy available | Passed |
| Ask Buddy route and retained/new page-context resolution | Passed |
| Shared Roger QA Registry remains the screen-readiness source | Passed |
| Advanced content is progressively disclosed | Passed |
| Guided Onboarding route and staged sequence accessible | Passed |
| Existing BA Discovery direct route accessible | Passed |
| Pre-existing registered routes preserved in router source | Passed |
| Historical / unlinked components preserved on disk | Passed |
| Regression suite | **54 tests passed** |

## 6. Data changes and deletions

| Item | Phase 1 result |
|---|---|
| Operational data modified | **0** |
| Source artifacts deleted | **0** |
| Mapping results deleted | **0** |
| Deployment history deleted | **0** |
| QA/UAT information deleted | **0** |
| Ask Buddy sources/audits deleted | **0** |
| Pages deleted | **0** |
| Routes deleted | **0** |

## 7. Items deferred to Phase 2 review

Phase 1 stops here. The following are review candidates only; no action has been taken.

| Category | Items for later owner review |
|---|---|
| Consolidation candidates | Architecture primer views, QA/UAT/deployment flow, mapping and decisioning views, Roger Overview placement, Delivery Assurance presentation. |
| Archive candidates | QA release simulations, Learning Center variants, historical delivery-dashboard implementations, demo/training components, alternate architecture views. |
| Delete candidates | Component Showcase, Placeholder Page, Agent Hub, Registry Audit, Delivery Intelligence, BATouchpointSummary, and other unlinked components — only after approved archive and backup confirmation. |
| Owner-decision items | Data Gateway long-term placement; Provision & State workspace standard versus advanced status; UAT evidence source model; formal source owner for API/Swagger and ADR artifacts. |

> **Stop condition met:** Phase 1 navigation restructuring and validation are complete. No Phase 2 archive, consolidation, or deletion activity has begun.
