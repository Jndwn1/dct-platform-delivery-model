// discoveryKnowledgeBase.ts
// Structured DCT knowledge base for Ask Buddy context-aware responses.
// Each entry maps a Discovery page path to its full knowledge context.
// This is injected into the Ask Buddy system prompt when a Discovery page is active.

export interface DiscoveryPageKnowledge {
  pageTitle: string;
  pagePath: string;
  summary: string;
  context: string; // Full markdown knowledge block injected into system prompt
  suggestedQuestions: string[];
}

export const DISCOVERY_KNOWLEDGE_BASE: Record<string, DiscoveryPageKnowledge> = {

  // ── Ecosystem Overview ────────────────────────────────────────────────────
  "/discovery/ecosystem": {
    pageTitle: "Ecosystem Overview",
    pagePath: "/discovery/ecosystem",
    summary: "Full DCT platform ecosystem: PDC, TDC, Orchestrator, Roger, and IMS (Integration & Management System) — the integration broker to all downstream return engines.",
    suggestedQuestions: [
      "What are the five platform components?",
      "What does PDC own vs TDC?",
      "How does data flow from ingestion to Roger?",
      "What is the Orchestrator's role?",
      "Which system owns tax decisions?",
    ],
    context: `
## DCT Ecosystem Overview

The DCT Platform consists of five primary components that work together to deliver governed, AI-assisted tax data processing:

### 1. PDC — Phoenix Data Consolidation (sub-system of DCT)
- **Owner:** PDC Engineering Team
- **Role:** Ingests raw financial data from Tax Portal, normalizes it across Lines of Business (LOB), and enforces the Cross-LOB Taxonomy contract
- **Outputs:** Normalized financial records, ingestion job status, classification results
- **Key APIs:** GET /api/v1/normalized-records, GET /api/v1/ingestion/{jobId}
- **Does NOT own:** Tax decisions, mapping logic, practitioner workflows
- **Key Batches:** FC (Foundation Core), B1 (File Ingestion), B2 (Normalization), B2A (Contract Enforcement)

### 2. TDC — Tax Data Consolidation (sub-system of DCT)
- **Owner:** TDC Engineering Team
- **Role:** Applies AI-generated tax mapping decisions, enforces tax rules, manages practitioner review workflows, and produces immutable tax records
- **Outputs:** TaxProfile, MappingDecision, Adjustment, SignOffRecord, EligibilityRecord, FilingRecord
- **Key APIs:** GET /api/v1/tax-profiles/{entityId}, POST /api/v1/mapping-decisions, PUT /api/v1/adjustments/{id}, POST /api/v1/sign-off
- **Governance:** All TDC decisions are immutable once committed. Audit records are mandatory for every state change.
- **Key Batches:** B3 (Tax Domain Authority), B4 (AI Tax Mapping), B6 (Practitioner Review), B7 (Client Tax Profile), B9 (Roger Gateway)

### 3. Orchestrator (AI Execution Layer)
- **Role:** Stateless AI agent that coordinates between PDC and TDC. Executes mapping proposals, confidence scoring, and exception routing.
- **Key Principle:** The Orchestrator proposes — TDC decides. The Orchestrator never writes directly to TDC without practitioner confirmation.
- **Outputs:** MappingProposal, ConfidenceBand (GREEN/YELLOW/RED), ExceptionFlag
- **Key Batches:** B4 (AI Tax Mapping & Explainability), B11 (Learning Governance)

### 4. Roger (Practitioner UI)
- **Role:** Read-only consumer of TDC data. Roger displays tax data to practitioners but does NOT own any tax logic.
- **Key Principle:** Roger reads from TDC APIs. Roger does NOT call GoSystem Tax directly. Roger does NOT make tax decisions.
- **Screens:** Dashboard, Mapping Review, Tax Profile, Adjustments, Sign-Off, Eligibility Check, Filing Status, Audit Trail
- **Key APIs consumed:** All TDC read endpoints
- **Key Batches:** B5 (Entity Identity), B9 (Roger Gateway & Consumer Access Layer), B9A (Data Gateway)

### 5. IMS — Integration TTT — Tax Translation & Transmission Engine Management System
- **Role:** Integration broker between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT, future engines). DCT does not integrate directly with any return engine.
- **Key Principle:** IMS retrieves governed data from TDC via the B9A Gateway and routes it to the appropriate return engine. IMS owns all engine routing, payload translation, and delivery.
- **Integration:** TDC → B9A Gateway → IMS → Return Engine (GoSystem, CCH, OIT, etc.)
- **Key Batches:** B9A (Gateway & Governed Access Layer), B16 (Audit Trail & Lineage Governance), B28 (Provision Reference Data & BTP Outbound Contract)

### Platform Data Flow (End-to-End)
1. Tax Portal → PDC (ingestion)
2. PDC → Orchestrator (normalized data for AI mapping)
3. Orchestrator → TDC (mapping proposals)
4. TDC → Practitioner via Roger (review & sign-off)
5. TDC → B9A Gateway → IMS → Return Engine (GoSystem, CCH, OIT — IMS routes and translates)

### Governance Principles
- PDC = Financial truth (no tax logic)
- TDC = Tax judgment and immutable decisions
- Orchestrator = AI execution (proposes, never decides)
- Roger = Read-only practitioner interface
- IMS = Integration broker to return engines (GoSystem, CCH, OIT) — DCT does not connect directly to any return engine
`,
  },

  // ── Platform Responsibilities ─────────────────────────────────────────────
  "/discovery/platform-responsibilities": {
    pageTitle: "Platform Responsibilities",
    pagePath: "/discovery/platform-responsibilities",
    summary: "Ownership boundaries for PDC, TDC, Orchestrator, and Roger — what each system owns and does not own.",
    suggestedQuestions: [
      "What does TDC own that PDC does not?",
      "Can Roger write data to TDC?",
      "Who owns tax decisions?",
      "What is PDC responsible for?",
      "What are the cross-system boundary rules?",
    ],
    context: `
## Platform Responsibilities & Ownership Boundaries

### PDC — Phoenix Data Consolidation (sub-system of DCT)
**OWNS:**
- Raw financial data ingestion from Tax Portal
- Cross-LOB financial normalization
- Classification enforcement (B2A)
- Ingestion job tracking and status
- Financial record lineage

**DOES NOT OWN:**
- Tax decisions or tax logic
- Practitioner workflows
- IMS integration or return engine routing
- Roger UI data contracts

### TDC — Tax Data Consolidation (sub-system of DCT)
**OWNS:**
- All tax mapping decisions (immutable once committed)
- Tax rules framework and enforcement
- Practitioner review and sign-off workflow
- Client tax profile and eligibility
- Exception management and remediation
- Audit trail for all state changes
- Roger read contract (API surface that Roger consumes)
- B9A Gateway consumer contract (IMS retrieves governed data via B9A)

**DOES NOT OWN:**
- Financial normalization (PDC's responsibility)
- AI model training or inference (Orchestrator's responsibility)
- Practitioner UI rendering (Roger's responsibility)

### Orchestrator (AI Execution Layer)
**OWNS:**
- AI mapping proposal generation
- Confidence band scoring (GREEN/YELLOW/RED)
- Exception flagging and routing
- Model versioning and learning governance

**DOES NOT OWN:**
- Final tax decisions (must be confirmed by practitioner via TDC)
- Data persistence (stateless — does not write to any database directly)
- Roger UI

### Roger (Practitioner UI)
**OWNS:**
- Practitioner-facing display of TDC data
- User interaction for review, adjustment, and sign-off
- Navigation and UX for tax workflows

**DOES NOT OWN:**
- Tax data (reads from TDC APIs only)
- Tax logic or decision-making
- Direct return engine integration (IMS owns all return engine routing)
- Any write operations outside of submitting confirmed practitioner actions back to TDC

### Cross-System Boundary Rules
1. PDC → TDC: PDC sends normalized financial records; TDC applies tax logic
2. Orchestrator → TDC: Orchestrator sends proposals; TDC confirms or rejects
3. TDC → Roger: TDC exposes read APIs; Roger consumes them (no reverse writes)
4. TDC → B9A Gateway → IMS → Return Engine: IMS retrieves governed data via B9A and delivers to the appropriate return engine (GoSystem, CCH, OIT). No direct TDC → GoSystem connection.
5. Roger → TDC: Roger submits practitioner actions (adjustments, sign-offs) via TDC write APIs only
`,
  },

  // ── End-to-End Data Flow ──────────────────────────────────────────────────
  "/discovery/data-flow": {
    pageTitle: "End-to-End Data Flow",
    pagePath: "/discovery/data-flow",
    summary: "Step-by-step data flow from Tax Portal ingestion through PDC, TDC, Roger, and IMS delivery to return engine.",
    suggestedQuestions: [
      "What happens after a file is ingested?",
      "How does data move from PDC to TDC?",
      "What triggers the AI mapping step?",
      "When does data reach Roger?",
      "What is the final step before IMS delivers to the return engine?",
    ],
    context: `
## End-to-End Data Flow

### Step 1: Ingestion (Tax Portal → PDC)
- Client uploads tax data via Tax Portal
- PDC receives the upload via Service Bus event trigger
- PDC creates an Ingestion Job record with status PENDING
- Batch: B1 — File Ingestion & Initial Storage

### Step 2: Normalization (PDC)
- PDC normalizes raw financial data across Lines of Business
- Applies Cross-LOB Taxonomy classification rules (B2A)
- Produces normalized financial records with classification tags
- Batches: B2 (Normalization), B2A (Contract Enforcement & Classification)

### Step 3: AI Mapping Proposal (PDC → Orchestrator → TDC)
- PDC sends normalized records to the Orchestrator
- Orchestrator generates AI mapping proposals with confidence bands
- GREEN = high confidence, auto-propose; YELLOW = review required; RED = exception
- Orchestrator sends proposals to TDC as MappingProposal objects
- Batch: B4 — AI Tax Mapping & Explainability

### Step 4: Practitioner Review (TDC → Roger)
- TDC exposes mapping proposals via Roger read APIs
- Roger displays proposals to the practitioner on the Mapping Review screen
- Practitioner can accept, adjust, or reject each proposal
- Adjustments are submitted back to TDC via PUT /api/v1/adjustments/{id}
- Batch: B6 — Practitioner Review, Adjustments & Lock

### Step 5: Sign-Off (TDC)
- After review, practitioner submits sign-off via Roger Sign-Off screen
- TDC records the sign-off as an immutable SignOffRecord
- All mapping decisions become locked (immutable)
- Audit record created for every sign-off action
- Batch: B6, B7 — Client Tax Profile & Eligibility

### Step 6: Return Assembly (TDC → B9A Gateway → IMS → Return Engine)
- TDC assembles the final tax-ready data package
- IMS retrieves the governed package from TDC via the B9A Gateway
- IMS routes and translates the payload to the appropriate return engine (GoSystem, CCH, OIT)
- The return engine generates the tax return
- Batches: B9A (Gateway), B10 (Return Assembly), B29 (Consolidated Return Assembly)

### Key Data Objects by Stage
| Stage | Key Object | Owner |
|-------|-----------|-------|
| Ingestion | IngestionJob | PDC |
| Normalization | NormalizedRecord | PDC |
| AI Mapping | MappingProposal, ConfidenceBand | Orchestrator |
| Tax Decision | MappingDecision, TaxProfile | TDC |
| Review | Adjustment, SignOffRecord | TDC |
| Export | FilingRecord | TDC |
`,
  },

  // ── Data Flow Simulation ──────────────────────────────────────────────────
  "/discovery/simulation": {
    pageTitle: "Data Flow Simulation",
    pagePath: "/discovery/simulation",
    summary: "Interactive 32-step simulation of data moving through the DCT platform from ingestion to IMS delivery to return engine.",
    suggestedQuestions: [
      "What are all 32 steps in the simulation?",
      "What happens at step 15?",
      "Which steps involve TDC?",
      "Where does the AI mapping happen in the flow?",
      "What is the final simulation step?",
    ],
    context: `
## Data Flow Simulation — 32-Step Platform Journey

The simulation walks through the complete lifecycle of a tax engagement from file upload to IMS delivery to the return engine.

### Phase 1: Ingestion (Steps 1–6)
1. Client uploads tax data package via Tax Portal
2. Service Bus receives upload event and triggers PDC ingestion pipeline
3. PDC creates IngestionJob with status PENDING
4. PDC validates file format and schema compliance
5. PDC extracts raw financial records from uploaded package
6. PDC stores raw records in staging with IngestionJob ID reference

### Phase 2: Normalization (Steps 7–12)
7. PDC applies Cross-LOB Taxonomy classification rules
8. PDC normalizes financial records across all Lines of Business
9. PDC enforces B2A contract — classification tags applied to each record
10. PDC generates NormalizedRecord objects with full lineage trace
11. PDC updates IngestionJob status to NORMALIZED
12. PDC sends normalized records to Orchestrator via event trigger

### Phase 3: AI Mapping (Steps 13–18)
13. Orchestrator receives normalized records
14. Orchestrator runs AI model to generate mapping proposals
15. Orchestrator assigns ConfidenceBand: GREEN / YELLOW / RED
16. GREEN proposals are auto-staged for practitioner review
17. RED proposals are flagged as exceptions and routed to exception queue
18. Orchestrator sends MappingProposal objects to TDC

### Phase 4: TDC Processing (Steps 19–24)
19. TDC receives MappingProposal objects from Orchestrator
20. TDC creates pending MappingDecision records (status: PROPOSED)
21. TDC updates TaxProfile with proposed decisions
22. TDC exposes updated data via Roger read APIs
23. Roger displays proposals to practitioner on Mapping Review screen
24. Practitioner reviews, adjusts, or accepts each proposal in Roger

### Phase 5: Sign-Off & Lock (Steps 25–28)
25. Practitioner submits adjustments via Roger → TDC PUT /api/v1/adjustments/{id}
26. TDC records adjustments as immutable Adjustment objects
27. Practitioner submits sign-off via Roger → TDC POST /api/v1/sign-off
28. TDC creates immutable SignOffRecord — all decisions locked

### Phase 6: Export (Steps 29–32)
29. TDC assembles final tax data package (FilingRecord)
30. TDC validates package completeness and lineage closure
31. IMS retrieves governed package from TDC via B9A Gateway and delivers to return engine
32. Return engine (GoSystem/CCH/OIT) confirms receipt — engagement complete
`,
  },

  // ── Integration Architecture ──────────────────────────────────────────────
  "/discovery/integration-architecture": {
    pageTitle: "Integration Architecture",
    pagePath: "/discovery/integration-architecture",
    summary: "Layered system architecture: ingestion, normalization, AI, tax decision, practitioner UI, and export layers.",
    suggestedQuestions: [
      "What are the six architecture layers?",
      "What sits in the AI layer?",
      "How does the Service Bus fit in?",
      "What protocols are used between layers?",
      "What is the export layer?",
    ],
    context: `
## Integration Architecture — Six-Layer Platform Model

### Layer 1: Ingestion Layer
- **Components:** Tax Portal, Service Bus, PDC Ingestion Pipeline
- **Protocol:** HTTPS upload → Service Bus event → PDC REST API
- **Responsibility:** Receive and validate raw client tax data
- **Key Batch:** B1 — File Ingestion & Initial Storage

### Layer 2: Normalization Layer
- **Components:** PDC Normalization Engine, Cross-LOB Taxonomy, Classification Engine
- **Protocol:** Internal PDC processing pipeline
- **Responsibility:** Normalize financial records, apply classification, enforce B2A contract
- **Key Batches:** B2, B2A

### Layer 3: AI Orchestration Layer
- **Components:** Orchestrator, AI Mapping Model, Confidence Scoring Engine, Exception Router
- **Protocol:** Orchestrator REST API → TDC Proposal API
- **Responsibility:** Generate mapping proposals, score confidence, route exceptions
- **Key Batch:** B4 — AI Tax Mapping & Explainability

### Layer 4: Tax Decision Layer (TDC)
- **Components:** TDC Core, Tax Rules Engine, Practitioner Workflow, Audit Engine
- **Protocol:** TDC REST APIs (read + write)
- **Responsibility:** Apply tax rules, manage practitioner review, create immutable decisions
- **Key Batches:** B3, B6, B7, B8, B9

### Layer 5: Practitioner UI Layer (Roger)
- **Components:** Roger Web Application, Roger API Gateway (B9)
- **Protocol:** HTTPS → TDC read APIs
- **Responsibility:** Display TDC data to practitioners, submit practitioner actions back to TDC
- **Key Batches:** B5, B9, B9A

### Layer 6: IMS Integration Layer
- **Components:** B9A Gateway, IMS Engine Router, IMS Payload Translator
- **Protocol:** TDC → B9A Gateway → IMS → Return Engine (GoSystem, CCH, OIT)
- **Responsibility:** IMS retrieves governed tax-ready data via B9A Gateway and routes/translates it to the appropriate return engine. DCT does not connect directly to any return engine.
- **Key Batches:** B9A, B10, B29

### Cross-Layer Integration Patterns
- **Event-Driven:** Service Bus triggers between Tax Portal → PDC
- **REST API:** All inter-system communication uses versioned REST APIs
- **Immutability:** All TDC write operations are append-only (no updates to committed records)
- **Lineage:** Every record carries a lineage trace ID from ingestion through export
`,
  },

  // ── BA Requirement Discovery ──────────────────────────────────────────────
  "/discovery/ba-requirements": {
    pageTitle: "BA Requirement Discovery",
    pagePath: "/discovery/ba-requirements",
    summary: "BA discovery workflow under Stephane Lacombe's operating model: 10-step intake lifecycle, gap analysis classifications, API review (validation only), one feedback cycle, and ownership boundaries.",
    suggestedQuestions: [
      "What are the 10 steps in the BA discovery lifecycle?",
      "What does DCT own vs what does the BA own?",
      "What is the gap analysis classification process?",
      "What happens during the API review step?",
      "How does the feedback cycle work?",
    ],
    context: `
## BA Requirement Discovery — Operating Model (Stephane Lacombe)

### Core Principle
BAs describe business intent. DCT owns platform design, gap analysis, build, QA, and published contracts. There is no endpoint design phase on either side.

### The 10-Step Discovery Lifecycle

**Steps 1–2 (BA owns):**
1. **Business Need** — Identify and articulate the business problem. Describe what the practitioner needs to capture, change, correct, approve, remove, or retrieve, and by which handles.
2. **BA Requirements** — Submit using the DCT intake template. Write at user-story altitude: what the practitioner does, the business outcome, the business process, the required data, user actions, and business rules. No API design, no endpoint definitions, no payload structures.

**Steps 3–6 (DCT owns):**
3. **DCT Intake** — DCT receives requirements via the intake template. This is the formal handoff point — DCT takes ownership of platform design.
4. **Gap Analysis** — DCT runs AI-assisted gap analysis against existing platform contracts. Each requirement is classified as: Covered (integration starts immediately), Partially Covered (scoping agreement produced), or Net-New (DCT authors the build spec).
5. **Platform Specification** — DCT authors the implementation specification. Requirements plus platform conventions become the build spec, with an explicit assumption list.
6. **Platform Build** — DCT generates the initial platform build. First built iteration exists within days of clearing gap analysis.

**Step 7 (BA + Team — validation only):**
7. **API Review** — Review one question: can everything described be done through what is on this page, and are the assumptions right? This is validation, not design.

**Step 8 (BA + DCT — shared):**
8. **Feedback Cycle** — One consolidated feedback pass. Issues come back as one response within five business days; silence confirms. A miss means a spec fix and a rebuild — days, not batches. Disputes route to the DCT Product Owner.

**Steps 9–10 (DCT owns):**
9. **QA** — DCT runs QA against the published spec. Consuming teams do not run DCT QA — they test their own integration.
10. **Published Contract** — The contract publishes. Consuming teams integrate against the published contract.

### Gap Analysis Classifications
- **Covered** — Capability exists. Integration starts immediately against the existing contract.
- **Partially Covered** — Scoping agreement produced. Shows what is covered and what is net-new.
- **Net-New** — DCT authors the build spec. First iteration available within days.

### Ownership Boundaries
**BA owns:** Business requirements, practitioner workflows, business rules, acceptance criteria, validation of business intent, review of DCT-generated assumptions.
**BA does NOT own:** API design, endpoint design, payload modeling, integration architecture, technical implementation.

**DCT owns:** Gap analysis, platform design, API contracts, build specifications, platform implementation, QA, published contracts.
**DCT does NOT own:** Business requirements, practitioner workflow decisions, acceptance criteria, application-specific testing.

### Story Template (Business Intent Level)
As a [tax professional role],
I want to [action — capture / change / correct / approve / remove / retrieve],
So that [business outcome].

Business Process: [describe the practitioner workflow]
Required Data: [what data is needed, by which handles]
Business Rules: [what rules govern this action]

Note: Do not include API endpoints, payload fields, or technical implementation details. DCT derives those from the business intent.
`,
  },

  // ── Discovery Checklist ───────────────────────────────────────────────────
  "/discovery/checklist": {
    pageTitle: "Discovery Checklist",
    pagePath: "/discovery/checklist",
    summary: "Interactive story readiness checklist covering business context, TDC platform context, Roger screen context, validations, and governance flags.",
    suggestedQuestions: [
      "What checklist items are required before a story is ADO-ready?",
      "What must be true before a story is submitted?",
      "What governance items are on the checklist?",
      "What business context items are required?",
      "What does Definition of Done require?",
    ],
    context: `
## Discovery Checklist — Story Readiness Items

A story is ADO-ready when all items are checked. Note: BAs document business intent; DCT derives API endpoints from that intent. Do not include endpoint design in BA requirements.

### Business Context
1. ☐ Business objective defined (what business problem does this story solve?)
2. ☐ TDC owner identified (which TDC domain owns the object or API?)
3. ☐ Data owner confirmed (PDC or TDC?)

### Platform Context (Reference only — DCT derives from business intent)
4. ☐ APIs identified (Read API and Update API if applicable)
5. ☐ Required fields documented
6. ☐ Validation rules documented
7. ☐ Error handling documented

### Roger Screen Context
8. ☐ UI behavior documented (screen layout, actions, buttons, save behavior)
9. ☐ Security documented (authentication, role-based access, field-level security)

### Downstream & Governance
10. ☐ Audit requirements captured
11. ☐ Lineage reviewed
12. ☐ Downstream impacts understood (IMS, Roger, State, Provision, reporting)
13. ☐ Acceptance Criteria complete (Given/When/Then covering happy path, errors, edge cases)

### Definition of Done (Required for all stories)
- API contract published by DCT
- Roger UI screen renders correctly with live API data
- All acceptance criteria verified by QA
- Consumer Guide updated to reflect new contract
- Story demo-ready for PI review
`,
  },

  // ── DCT Overview ─────────────────────────────────────────────────────────
  "/discovery/dct-overview": {
    pageTitle: "TDC / DCT Overview",
    pagePath: "/discovery/dct-overview",
    summary: "DCT platform overview: batch model, governance gates, architectural principles, and delivery model.",
    suggestedQuestions: [
      "What is DCT?",
      "What are the four governance gates?",
      "What is the batch delivery model?",
      "What are the architectural principles?",
      "What is Schema Lock?",
    ],
    context: `
## DCT — Data Coordination Technology Platform Overview

### What is DCT?
DCT (Data Coordination Technology) is RSM's governed, batch-driven architecture and readiness model for enterprise tax data processing. It structures how financial data is ingested, normalized, classified, and made available for tax decision-making across RSM's enterprise platform.

### Core Architectural Principles
1. **Strict Separation of Concerns** — PDC owns financial data, TDC owns tax decisions, Orchestrator owns AI execution, Roger owns practitioner UX
2. **Immutability** — All committed tax decisions are immutable and append-only
3. **Lineage Assurance** — Every record carries a full lineage trace from ingestion to export
4. **API-First** — All inter-system communication uses versioned REST APIs
5. **Audit by Default** — Every state change in TDC creates an immutable audit record

### Batch Delivery Model
- The platform is delivered in **Architectural Batches** (not story-first sprints)
- Each batch has a defined scope, owner, and gate verification requirement
- Batches are organized into Program Increments (PI 1, PI 2, PI 3, PI 4)
- A batch is complete only when all four governance gates are passed

### Four Governance Gates
| Gate | Name | Definition |
|------|------|-----------|
| G1 | Schema Lock | All data schemas for this batch are finalized and cannot change |
| G2 | Invariant Lock | All business rules and invariants are defined and enforced |
| G3 | Contract Publication | All API contracts are published and versioned |
| G4 | Lineage Closure | Full data lineage is traceable from ingestion to this batch's output |

### Batch Registry Summary
- **PI 1:** FC, B1, B2, B2A, B3 — Foundation & AI Mapping
- **PI 2:** B4–B11, B43 — Entity, Workflow & Tax Ready
- **PI 3 MVP:** B42, B17, B20, B21, B26, B28, B29, B31, B9A, B39, B33 — Target: Sep 21, 2026
- **PI 4 / Post-Pilot:** B19, B21-TDC, B26-TDC, B35, B40, B22, B23

### Key TDC Business Objects
TaxProfile, MappingDecision, MappingRule, TaxFormTemplate, Adjustment, SignOffRecord, EligibilityRecord, FilingRecord, ExceptionRecord, RemedyAction, AuditRecord, LineageRecord, ConfidenceBand, EngagementId, EntityId
`,
  },

  // ── Roger Overview ────────────────────────────────────────────────────────
  "/discovery/roger-overview": {
    pageTitle: "Roger Overview",
    pagePath: "/discovery/roger-overview",
    summary: "Roger's role as a read-only TDC consumer, its screens, APIs it calls, and BA guidance for Roger stories.",
    suggestedQuestions: [
      "How does Roger save data?",
      "What APIs does Roger call?",
      "What TDC objects support Roger screens?",
      "What batches affect Roger?",
      "What validations exist in Roger?",
      "Can Roger write to TDC?",
      "What screens does Roger have?",
    ],
    context: `
## Roger — Practitioner UI Overview

### What is Roger?
Roger is RSM's practitioner-facing web application that displays TDC tax data to Tax Practitioners, Tax Managers, and Senior Reviewers. Roger is a **read-only consumer** of TDC data — it does not own any tax logic.

### Core Roger Principle
> "Roger reads from TDC. Roger does not own tax decisions. Roger does not call GoSystem Tax or any return engine directly — IMS owns all return engine integration."

### How Roger Saves Data
Roger does NOT save data directly. When a practitioner performs an action in Roger (e.g., submitting an adjustment or sign-off), Roger calls a **TDC write API**. TDC owns the persistence layer.

- Adjustment submission: Roger calls PUT /api/v1/adjustments/{id} → TDC persists the Adjustment object
- Sign-off submission: Roger calls POST /api/v1/sign-off → TDC creates an immutable SignOffRecord
- Roger never writes to its own database for tax data

### Roger Screens & Supporting TDC Objects
| Roger Screen | TDC Object(s) | API Endpoint(s) |
|-------------|--------------|----------------|
| Roger Dashboard | TaxProfile, EligibilityRecord | GET /api/v1/tax-profiles/{entityId} |
| Roger Mapping Review | MappingDecision, MappingRule | GET /api/v1/mapping-decisions |
| Roger Tax Profile | TaxProfile, EntityId | GET /api/v1/tax-profiles/{entityId} |
| Roger Adjustments Screen | Adjustment, MappingDecision | PUT /api/v1/adjustments/{id} |
| Roger Sign-Off Screen | SignOffRecord | POST /api/v1/sign-off |
| Roger Eligibility Check | EligibilityRecord | GET /api/v1/eligibility/{entityId} |
| Roger Filing Status | FilingRecord | GET /api/v1/filing-records/{id} |
| Roger Ingestion Status | IngestionJob (via PDC) | GET /api/v1/ingestion/{jobId} |
| Roger Audit Trail | AuditRecord | GET /api/v1/lineage/{entityId} |
| Roger Exception Management | ExceptionRecord, RemedyAction | POST /api/v1/exception-records |

### APIs Roger Calls (TDC Read APIs)
- GET /api/v1/tax-profiles/{entityId}
- GET /api/v1/mapping-decisions
- GET /api/v1/eligibility/{entityId}
- GET /api/v1/filing-records/{id}
- GET /api/v1/lineage/{entityId}
- GET /api/v1/normalized-records (PDC passthrough)

### APIs Roger Submits To (TDC Write APIs)
- PUT /api/v1/adjustments/{id} — Submit practitioner adjustment
- POST /api/v1/sign-off — Submit practitioner sign-off
- POST /api/v1/exception-records — Flag an exception

### Batches That Affect Roger
- **B5 — Entity Identity & Structure:** Provides EntityId and engagement identity data
- **B9 — Roger Gateway & Consumer Access Layer:** The primary batch that defines Roger's API surface
- **B9A — Data Gateway (IMS, CDS, DUO):** External data gateway for Roger's data access
- **B6 — Practitioner Review, Adjustments & Lock:** Defines the adjustment and sign-off workflow
- **B7 — Client Tax Profile & Eligibility:** Provides TaxProfile and EligibilityRecord data

### Roger Validations
- All TDC objects displayed in Roger are validated at the TDC layer before being exposed
- Roger enforces: required field display, confidence band color coding, sign-off authentication
- Roger does NOT perform business-level tax validation — that is TDC's responsibility

### BA Guidance for Roger Stories
1. Always identify which Roger screen the story appears on
2. Always identify which TDC object(s) the screen displays
3. Always identify which TDC API the screen calls
4. If the story involves a write action (adjustment, sign-off), specify the TDC write API
5. Check "Audit Required" for any story that changes state in TDC
6. Check "Immutable" for sign-off and filing records
`,
  },

  // ── IMS — Integration TTT — Tax Translation & Transmission Engine Management System ────────────────────────────────
  "/discovery/gosystem": {
    pageTitle: "IMS — Integration TTT — Tax Translation & Transmission Engine Management System",
    pagePath: "/discovery/gosystem",
    summary: "IMS is the integration broker between DCT/Roger and all downstream return engines. DCT does not integrate directly with any return engine.",
    suggestedQuestions: [
      "What does IMS do?",
      "How does data get to GoSystem?",
      "Does DCT connect directly to GoSystem?",
      "What return engines does IMS support?",
      "What is the IMS architecture boundary?",
      "What data types does IMS support for MVP?",
      "What is out of scope for the IMS MVP?",
      "What is the difference between SUMMARY and DETAIL grain?",
      "What form does the MVP support?",
      "What is a Single Activity with Repeating Amounts?",
      "How does DCT prepare data before sending to IMS?",
      "What is the Uniqueness Rule for repeating amounts?",
      "What is Grouped Presentation in DCT?",
      "What happens if duplicate descriptions exist in a repeating set?",
      "What is OIT and how does it relate to IMS?",
      "What return engines does IMS support?",
      "What is the difference between GoSystem, CCH Axcess, and OIT?",
      "What fields are in the IMS payload?",
      "What does the MVP payload look like for a single amount?",
      "What fields are required in the IMS outbound payload?",
      "What is in scope for the IMS MVP?",
      "What phases come after the IMS MVP?",
    ],
    context: `
## IMS — Integration & Management System

### What is IMS?
IMS (Integration & Management System) is the **integration broker** between DCT/Roger and all downstream return engines.
DCT does not integrate directly with GoSystem, CCH, OIT, or any other return engine — all return engine routing, payload translation, and delivery is owned by IMS.

### Core IMS Architecture Rule
> "DCT does not connect directly to any return engine. IMS owns all engine routing, payload translation, and delivery. TDC and Roger have no awareness of GoSystem, CCH, OIT, or any other return engine."

### IMS Responsibilities
| Responsibility | Description |
|---|---|
| Engine Routing | Determines which return engine receives each payload (GoSystem, CCH, OIT, future) |
| Payload Translation | Translates governed TDC/Roger output into the format required by each target engine |
| Inbound Data Retrieval | Retrieves governed tax-ready data from TDC via the B9A Gateway (governed consumer) |
| Outbound Delivery | Delivers translated payloads to the appropriate return engine and tracks acknowledgements |
| Engine Lookup | Maintains the mapping of entity → return engine |

### How Data Reaches a Return Engine (e.g., GoSystem)
1. TDC finalizes tax-ready data and publishes a downstream event
2. IMS retrieves the governed payload from TDC via the **B9A Gateway** (as a governed consumer)
3. IMS performs engine lookup to determine the correct return engine for the entity
4. IMS translates the payload into the engine-specific format
5. IMS delivers the translated payload to the return engine (GoSystem, CCH, OIT, etc.)
6. The return engine confirms receipt — IMS tracks delivery status

### IMS Engine Behavior Rules
| Rule | Description |
|---|---|
| **Preserve Rule (Write-Forward)** | IMS is a write-forward system, not a synchronization system. It does not own GoS data and will never delete or zero out records it did not create. |
| **Scalar Line Overwrite** | For single amounts (scalar lines), IMS always overwrites the GoS value with the DCT value, as there is no description-based matching required. |
| **Full Audit Trail** | All update operations are logged with a timestamp, source (DCT), and matched/added/preserved status for full audit trail support. |

**Governance Note:** The Preserve rule is deliberate — IMS's write-forward design ensures GoSystem data integrity is maintained across all transmission events. IMS never deletes or zeroes out records it did not create.

### MVP Sample Payload — Design Reference (Pre-Build)
This is a representative payload schema for Federal Form 1120 (MVP scope only). Not a live contract.

**Scope:** Federal Form 1120 only. Source: Roger (DCT sign-off data). Target: GoSystem (GoS). Full data update — not a partial update.

**Common Required Fields (all 4 data types):**
| Field | Type | Description | Example |
|---|---|---|---|
| clientId | string | Unique client identifier from DCT | RSM-001234 |
| taxYear | integer | Tax year for the filing | 2024 |
| formType | string | MVP supports 1120 only | 1120 |
| grain | string | SUMMARY or DETAIL | SUMMARY |
| sourceSystem | string | Always DCT for IMS-originated payloads | DCT |
| signOffId | string | Roger sign-off event ID for audit trail | SO-20240315-001 |
| timestamp | datetime | UTC timestamp of sign-off approval | 2024-03-15T14:32:00Z |

**Single Amount payload** (grain: SUMMARY): adds lineCode, lineLabel, amount fields. IMS overwrites GoSystem value — no description matching.

**Repeating Amounts payload** (grain: DETAIL): adds lineCode, lineLabel, items[] array. items[].description must be unique within the set — duplicates are a data quality error.

**Single Activity + Single Amounts payload** (grain: SUMMARY): adds activityName (single-level only for MVP), lines[] array with lineCode and amount per line.

**Single Activity + Repeating Amounts payload** (grain: DETAIL): adds activityName, lines[] array where each line has its own items[] repeating array. All item descriptions must be unique within each line's set.

**Out of scope for MVP:** Matching of repeating items (stretch), multi-level activity nesting, deletion of GoS records, partial sign-off workflows, partial data updates, non-1120 form types.

### IMS Phase Roadmap
| Phase | Scope |
|---|---|
| MVP | Federal 1120, repeating data, single-level activities, Roger → GoS |
| Phase 2 | Additional federal forms (1120, 1065, 990), exact description matching, multi-level activity nesting |
| Phase 3 | Fuzzy/approximate description matching, conflict resolution workflows |
| Phase 4 | Additional downstream consumers beyond GoSystem |
| Phase 5 | State form support, multi-jurisdiction transmission |

Architecture note: The MVP's form-agnostic JSON envelope and modular matching engine minimize rework. Each new form type requires only a form-specific line definition file — the core translation and transmission pipeline remains unchanged.

### Supported Return Engines
| Engine | Vendor | Status | Notes |
|---|---|---|---|
| GoSystem Tax RS | RSM / Thomson Reuters | MVP | Primary target; Federal Form 1120 |
| OIT (ONESOURCE Income Tax) | Thomson Reuters | Planned | Enterprise corporate tax compliance engine |
| CCH Axcess Tax | Wolters Kluwer | Planned | Cloud-based tax compliance platform |
| Future Engines | TBD | Extensible | Architecture is engine-agnostic |

#### OIT — ONESOURCE Income Tax (Detailed Definition)
ONESOURCE Income Tax (OIT) is Thomson Reuters' enterprise corporate income tax compliance and provision software. Within the DCT platform architecture, OIT is a supported tax engine that receives governed tax data through the IMS Integration Layer to generate corporate tax returns and related tax outputs. OIT is a **planned integration target** and is architected alongside GoSystem, CCH Axcess, and future tax engines to enable a tax-engine-agnostic platform.

**Purpose in DCT:**
- Serves as a downstream tax preparation and compliance engine
- Receives standardized tax data from the IMS Integration Layer
- Generates corporate income tax returns and related tax deliverables
- Supports DCT's strategy of separating tax data management from tax return generation

**Key Characteristics:** Vendor: Thomson Reuters | Product: ONESOURCE Income Tax | Role: Enterprise corporate tax compliance and provision engine | Integration: Connected through the IMS Integration Layer | Status: Planned (future integration)

**Related Concepts:** IMS Integration Layer, GoSystem Tax RS, CCH Axcess Tax, Tax Engine, Return Generation, Rollforward, IRS Line Translation, TDC

### MVP Supported Data Types (Federal Form 1120 — U.S. Income Tax Return for Corporations)
The MVP delivers end-to-end translation and transmission for **Federal Form 1120** only.
Source: Roger (DCT sign-off data — structured tax return amounts collected and approved within the Roger workflow).
Target: GoSystem (GoS) — the MVP performs a **full data update** to GoSystem for supported lines, not a partial update.

TTT (Tax Translation Technology) supports four distinct data value types covering all tax line structures:

| Data Type | Description | Example | Grain |
|---|---|---|---|
| **Single Amount** | A scalar value with no sub-items; represents an aggregated or standalone line | Line 1: Gross receipts = $500,000 | SUMMARY |
| **Repeating Amounts** | An array of items sharing the same tax treatment, each with a unique description | Other Income: Grain Sales $10,000; Feed Sales $20,000 | DETAIL |
| **Single Activity + Single Amounts** | A named activity container holding scalar line values | Rental Operations: Gross Rent $200,000 | SUMMARY |
| **Single Activity + Repeating Amounts** | A named activity container holding repeating line arrays | Rental Operations: Storage $6,000; Packaging $2,500 | DETAIL |

**Grain Rule:** The SUMMARY vs. DETAIL assignment per form line is governed by TDC (the Approved Grain Model) — not by IMS. IMS receives the grain as declared and maps it accordingly. IMS never decides or overrides grain.

### DCT Data Preparation Rules (Before Sending to IMS/TTT)
Before transmission, DCT applies four data preparation rules that shape how Roger sign-off data is structured for IMS and TTT:

| Rule | Description |
|---|---|
| **Aggregated Amounts** | Amounts presented as a combined value for sign-off in Roger are sent to IMS as a single amount — no line-level breakdown is transmitted. |
| **Repeating Amounts** | Related amounts signed off separately in Roger are sent to IMS as a set of repeating values, each with a unique description identifying the item. |
| **Grouped Presentation** | DCT presents repeating amounts and activities as grouped data, bundling related items together before transmission rather than sending isolated records. |
| **Uniqueness Rule** | Repeating amounts share the same tax treatment but are reported with unique descriptions. All descriptions within a repeating set must be unique — duplicates are treated as a data quality error. |

**Key Governance Point:** The Uniqueness Rule is enforced as a data quality constraint. If duplicate descriptions exist within a repeating set, the record is rejected as a data quality error before transmission to TTT/IMS.

### Out of Scope for IMS MVP
The following are explicitly out of scope for the MVP:
- Matching of repeating items (stretch goal — may be considered post-MVP)
- Multi-activity nesting beyond one level
- Deletion of GoSystem records
- Partial sign-off workflows
- Partial data updates to GoSystem
- Non-1120 form types

### Governance Rules
- DCT does NOT integrate directly with any return engine
- IMS retrieves data through the B9A Gateway (same governed consumer pattern as Roger)
- IMS does not compute tax or modify the governed payload
- B28 delivers TDC provision reference data (DTAClassification, DTLClassification, ETRCategory, ValuationAllowanceCriterion, BTPProvisionOutbound) — it does NOT export directly to GoSystem
- If a requirement involves delivering data to a return engine, it belongs to the IMS integration layer, not DCT scope

### IMS APIs
- GET /api/v1/ims/payload/{entityId} — Retrieve governed tax-ready payload via B9A
- POST /api/v1/ims/deliver/{entityId}/{engine} — Deliver translated payload to return engine
- GET /api/v1/ims/engine-lookup/{entityId} — Determine which return engine is assigned
- GET /api/v1/ims/delivery-status/{entityId} — Check delivery status and acknowledgement
- POST /api/v1/ims/inbound/{engine}/{entityId} — Receive inbound data from return engine

### Relevant Batches
- **B9A — Gateway & Governed Access Layer:** IMS uses B9A Gateway APIs to retrieve governed data
- **B16 — Audit Trail & Lineage Governance:** Provides audit trail for IMS delivery events
- **B28 — Provision Reference Data & BTP Outbound Contract:** Delivers provision reference data to BTP (not GoSystem directly)
`,
  },

  // ── Prior Year Inventory Discovery ─────────────────────────────────────────
  "/discovery/prior-year-inventory": {
    pageTitle: "Prior Year (PY) Inventory Discovery",
    pagePath: "/discovery/prior-year-inventory",
    summary: "Authoritative discovery workspace for all Prior Year data required by DCT. Documents inventory fields, business rules, mapping matrix, open questions, and action items sourced from the PY Inventory spreadsheet, DUO Commit export, and A110 Tax Workbook.",
    suggestedQuestions: [
      "What is the Prior Year Inventory?",
      "What is the source of truth for Prior Year data in DCT?",
      "What are the four key Prior Year fields confirmed from the DUO Commit?",
      "What is Business Rule BR-PY-001 about PY Tax Adjustment?",
      "Where is the Prior Year Tax Balance calculated — Roger or TDC?",
      "What data does the DUO Commit export contain?",
      "What is the IMS Export API and how does it relate to Prior Year data?",
      "What are the open questions for Prior Year discovery?",
      "Who owns the Prior Year Inventory?",
      "What is the difference between Prior Year Book Balance and Prior Year Tax Balance?",
    ],
    context: `
## Prior Year (PY) Inventory Discovery

### Purpose
The Prior Year Inventory is the authoritative source of truth for all Prior Year data required by DCT. This discovery workspace validates inventory fields against source artifacts, defines canonical Prior Year data, documents business rules, and tracks open questions and action items.

### Source Artifacts
- **Source of Truth:** PY Inventory spreadsheet (twbPriorYearInventory_Revised_Table_IDs.xlsx)
- **Supporting:** DUO Commit export (TrialBalanceEntities: 82 rows, JournalEntryEntities: 3 rows, DataTransferEntities: 11,012 rows, TWB Version: QA 2.11.31.1, TypeKey: A110)
- **Supporting:** A110 Tax Workbook (worksheets: T-03.1 Trial Balance, T-35.2 Journal Entries)
- **Supporting:** IMS Export APIs (XML-configurable, can retrieve PY CCH return data without DUO)

### Confirmed Inventory Fields (from PY Inventory)
| Inv. ID | Source Table | Worksheet | Source Field | Roger Destination | Status |
|---------|-------------|-----------|-------------|-------------------|--------|
| 460 | Tbl_TB | T-03.1 Trial Balance | amountEnding (amountEndingPY) | Prior Year Book Balance | Confirmed |
| 482 | Tbl_FJE | T-35.2 Journal entries | CY Tax Adjustment | PY Tax Adjustment | Pending |
| 328 | Tbl_FJE | T-35.2 Journal entries | glAccountName | Client Account Name | Confirmed |
| 392 | Tbl_TB | T-03.1 Trial Balance | glAccountName | Client Account Name | Confirmed |
| 391 | Tbl_TB | T-03.1 Trial Balance | glAccountNumber | GL Account Number | Confirmed |
| 393 | Tbl_TB | T-03.1 Trial Balance | glAccountNumberRSM | RSM Account Number | Confirmed |
| 394 | Tbl_TB | T-03.1 Trial Balance | glAccountNumberRSMnew | RSM Account Number (New) | Confirmed |
| 395 | Tbl_TB | T-03.1 Trial Balance | glAccountNameRSM | RSM Account Name | Confirmed |
| 396 | Tbl_TB | T-03.1 Trial Balance | glEntity | GL Entity | Confirmed |

### Business Rules
- **BR-PY-001 (PY Tax Adjustment — Approved by Gary Luca):** Store CY Tax Adjustment as PY Tax Adjustment. PY Tax Balance is NOT persisted — it is calculated each time PY values are read from the API. PY Tax Balance = PY Book Balance + Tax Adjustment per TDC Tax Taxonomy Code. Implementation location (Roger vs. TDC/API) TBD by Stephane and Santosh.
- **BR-PY-002 (PY Book Balance — Confirmed):** PY Book Balance is migrated from the authoritative TWB Commit (amountEnding field from Tbl_TB). No additional calculation required.
- **BR-PY-003 (Duplicate Field Separation — Complete):** Fields appearing in both Tbl_TB and Tbl_FJE (e.g., glAccountName) must be separated by source table. Inv. IDs 328 (FJE) and 392 (TB) represent the same logical field from different source tables.
- **BR-PY-004 (IMS Export API — Confirmed):** IMS Export APIs can retrieve PY CCH return data without DUO. Returned data depends on XML configuration. Additional XML configurations can be created as needed.
- **BR-PY-005 (TDC Code Migration Logic — Reference):** Logic must be performed on Prior Year Trial Balance data to migrate from legacy RSM codes to new TDC mapping codes. Decision tree: (1) If glAccountNumberRSMnew is populated — check if it contains 4 levels. If yes, translate to TDC Code. If no (nonstandard), use only the first 4 levels and ignore the 5th level, then translate. (2) If glAccountNumberRSMnew is NOT populated — check if glAccountNumberRSM is populated. If yes, translate glAccountNumberRSM to TDC Code (if no corresponding TDC Code exists, skip — nonstandard code). If no, Trial Balance data is not in DUO — proceed with AI mapping rather than PY data. (3) Once translated to TDC Code, use Tax Taxonomy mappings to layer in: Financial Mapping, Page, Line No & Description, Sub Group. Reference Document: Trial Balance Code Migration.xlsx (1,249 mapping rows).

### Ownership
- **DCT:** Owns the PY Inventory, canonical data model, mapping crosswalk, business rules, gap analysis, and API contract.
- **Roger:** Owns Rule Code and Input Code combinations, UI requirements, and Roger business rules.
- **IMS:** Owns Export APIs, XML configurations, sample payloads, and API documentation.

### Open Questions
1. What PY tax return data will DCT receive from IMS for CCH returns, and what business rules are required? (Owner: Jenniver/IMS, Status: In Progress)
2. What is the complete list of non-Trial Balance fields in the DUO Commit requiring PY mapping? (Owner: Jenniver/Krista, Status: In Progress)
3. Where will the PY Tax Balance calculation be performed — Roger or TDC/API? (Owner: Stephane/Santosh, Status: Pending — Gary Luca confirmed either will work)
4. Should Group 1 and Group 2 migrate or be derived? (Owner: Jenniver/Gary, Status: Pending)
5. What Rule Code and Input Code combinations does Roger require per PY field? (Owner: Roger Team/Krista, Status: Open)

### Key Action Items
- Define Roger PY requirements for IMS XML configuration (High, In Progress, Owner: Roger Team/Jenniver)
- Continue mapping Trial Balance account fields (High, In Progress, Owner: Jenniver)
- Identify non-Trial Balance fields requiring review (High, Not Started, Owner: Jenniver)
- Obtain DUO Commit sample and complete mapping (High, In Progress, Owner: Jenniver)
- Update PY Tax Adjustment documentation to reflect Gary's decision (High, Not Started, Owner: Jenniver)

### Reference Library
The following reference documents support Prior Year discovery but do NOT replace the PY Inventory as the source of truth.

| Artifact | Applicable | Category | Owner | Impact | Notes |
|---|---|---|---|---|---|
| TDC Mapping Migration Business Rules | Partially | Tax Code Migration | DCT | Medium | May help validate tax code translations for Trial Balance accounts |
| Trial Balance Code Migration.xlsx | Yes | Tax Code Migration | DCT / Jenniver | High | 1,249 mapping rows for legacy RSM codes to TDC Mapping Codes |
| Data Standardization, Aggregation, and Dataset Rules.docx | Partially | IMS / GoSystem | IMS | Medium | Relevant to IMS output and aggregation, not Prior Year field discovery |
| GoSystem Business Rules Lists.xlsx | Partially | IMS / GoSystem | IMS | Medium | Form Line Aggregation (1,453 rows), Standard Return Mapping (1,249 rows), M-3 Mapping (1,276 rows) |

**Discovery Workflow:** Prior Year Inventory (Source of Truth) → DUO Commit File (82 TB rows, 3 JE rows) → A110 Tax Workbook (Tbl_TB, Tbl_FJE) → IMS Export API (XML Config Required) → Roger Rule Code Mapping (Rule Code + Input Code)

**Recommended Usage:** Use the PY Inventory as primary source of truth. Use DUO Commit and A110 Tax Workbook to validate inventory mappings. Use IMS Export API documentation to determine available return data. Use Tax Code Migration documentation to understand historical mapping logic (BR-PY-005). Use IMS / GoSystem Business Rules to understand downstream processing and Form Line mapping.
`,
  },

  // ── Glossary ──────────────────────────────────────────────────────────────
  "/discovery/glossary": {
    pageTitle: "Glossary",
    pagePath: "/discovery/glossary",
    summary: "DCT platform glossary of terms, acronyms, and definitions.",
    suggestedQuestions: [
      "What does PDC stand for?",
      "What is a ConfidenceBand?",
      "What is Schema Lock?",
      "What is Lineage Closure?",
      "What is an Invariant?",
      "What is OIT?",
      "What is ONESOURCE Income Tax?",
      "What return engines does DCT support?",
    ],
    context: `
## DCT Platform Glossary

### Acronyms
- **DCT** — Data Coordination Technology (the platform)
- **PDC** — Phoenix Data Consolidation (financial data normalization system)
- **TDC** — Tax Data Consolidation (tax decision and workflow system)
- **PI** — Program Increment (planning period, typically 10–12 weeks)
- **ADR** — Architecture Decision Record
- **LOB** — Line of Business
- **SoT** — Source of Truth
- **AC** — Acceptance Criteria
- **ADO** — Azure DevOps
- **BA** — Business Analyst

### Key Terms
- **Batch** — A defined unit of platform delivery with a specific scope, owner, and gate requirements
- **Schema Lock (G1)** — Gate 1: All data schemas for a batch are finalized and cannot change
- **Invariant Lock (G2)** — Gate 2: All business rules and invariants are defined and enforced
- **Contract Publication (G3)** — Gate 3: All API contracts are published and versioned
- **Lineage Closure (G4)** — Gate 4: Full data lineage is traceable from ingestion to this batch's output
- **ConfidenceBand** — AI scoring of mapping proposal confidence: GREEN (high), YELLOW (review), RED (exception)
- **MappingDecision** — TDC object representing a finalized, immutable tax mapping decision
- **SignOffRecord** — TDC object representing a practitioner's immutable sign-off on a tax profile
- **Immutability** — Once committed, a TDC record cannot be modified or deleted
- **Lineage Trace ID** — A unique identifier that links a record to its full data lineage chain
- **Roger Gateway (B9)** — The API layer that defines Roger's read contract with TDC
- **Orchestrator** — Stateless AI agent that generates mapping proposals (proposes, never decides)
- **FilingRecord** — TDC object representing the finalized tax-ready data package retrieved by IMS via the B9A Gateway for delivery to the return engine
- **EligibilityRecord** — TDC object representing a client's eligibility status for tax filing
- **NormalizedRecord** — PDC object representing a financial record after Cross-LOB normalization
- **IngestionJob** — PDC object tracking the status of a file ingestion pipeline run

### Return Engine Definitions

#### OIT — ONESOURCE Income Tax
ONESOURCE Income Tax (OIT) is Thomson Reuters' enterprise corporate income tax compliance and provision software. Within the DCT platform architecture, OIT is a supported tax engine that receives governed tax data through the IMS Integration Layer to generate corporate tax returns and related tax outputs. OIT is a **planned integration target** and is architected alongside GoSystem, CCH Axcess, and future tax engines to enable a tax-engine-agnostic platform.

**Purpose in DCT:**
- Serves as a downstream tax preparation and compliance engine
- Receives standardized tax data from the IMS Integration Layer
- Generates corporate income tax returns and related tax deliverables
- Supports DCT's strategy of separating tax data management from tax return generation

**Key Characteristics:**
| Field | Value |
|---|---|
| Vendor | Thomson Reuters |
| Product | ONESOURCE Income Tax |
| Role | Enterprise corporate tax compliance and provision engine |
| Integration | Connected through the IMS Integration Layer |
| Status | Planned (future integration) |

**Related Concepts:** IMS Integration Layer, GoSystem Tax RS, CCH Axcess Tax, Tax Engine, Return Generation, Rollforward, IRS Line Translation, TDC (Tax Data Consolidation)

#### GoSystem Tax RS
RSM's primary tax return preparation system. GoSystem is the **MVP integration target** for the TTT Engine (Federal Form 1120 — U.S. Income Tax Return for Corporations). DCT does not connect directly to GoSystem — all routing and translation is handled by IMS.

#### CCH Axcess Tax
Wolters Kluwer's cloud-based tax compliance platform. CCH Axcess is a **planned integration target** for the TTT Engine, architected alongside GoSystem and OIT to support a tax-engine-agnostic delivery model.
`,
  },

  // ── BA Story Builder ──────────────────────────────────────────────────────
  "/discovery/ba-story-builder": {
    pageTitle: "BA Story Builder",
    pagePath: "/discovery/ba-story-builder",
    summary: "Guided form for generating Azure DevOps-ready user stories following DCT governance standards.",
    suggestedQuestions: [
      "What makes a good DCT user story?",
      "What acceptance criteria are always required?",
      "When should I check Immutable?",
      "What is the Definition of Done for a DCT story?",
      "How do I write a story for a Roger screen?",
    ],
    context: `
## BA Story Builder — DCT Story Writing Standards

### User Story Format
All DCT user stories follow this format:
> As a [persona], I want to [action], so that [business benefit].

### Required Story Elements
Every DCT user story must include:
1. **Persona** — The specific user role (Tax Practitioner, Tax Manager, etc.)
2. **Action** — The specific workflow step in Roger or the platform
3. **Business Benefit** — The outcome this story enables
4. **Batch** — The batch that owns this capability
5. **TDC Object** — The specific TDC business object involved
6. **API Endpoint** — The specific REST endpoint called
7. **Roger Screen** — The specific Roger screen this story appears on
8. **Editable Fields** — All fields the practitioner can modify
9. **Validation Rules** — All field-level and business-level validations
10. **Error Handling** — What happens when validation fails
11. **Governance Flags** — Immutable / Audit Required / Lineage Required / Sign-Off Required
12. **Acceptance Criteria** — Given/When/Then format for each behavior
13. **Definition of Done** — Checklist of completion criteria

### Governance Flags — When to Use
- **Immutable:** Any story where the record cannot be modified after submission (sign-off, filing, committed decisions)
- **Audit Required:** Any story that changes state in TDC (adjustments, sign-offs, exceptions)
- **Lineage Required:** Any story where the response must include a lineage trace ID
- **Sign-Off Required:** Any story where practitioner authentication is required before submission

### Definition of Done (Standard)
- API endpoint implemented and unit tested
- Roger UI screen renders correctly with live API data
- All acceptance criteria verified by QA
- Consumer Guide updated to reflect new endpoint
- Story demo-ready for PI review

### Common Mistakes to Avoid
- Do NOT assign tax logic to Roger — Roger only displays TDC data
- Do NOT skip the API endpoint — QA needs this for test case generation
- Do NOT forget immutability AC for sign-off and filing records
- Do NOT write a story without identifying the TDC object — it anchors the story to the data model
`,
  },

  // ── Discovery Center Hub ──────────────────────────────────────────────────
  "/discovery": {
    pageTitle: "Discovery Center",
    pagePath: "/discovery",
    summary: "Discovery Center hub — entry point for all BA learning, platform knowledge, and story readiness resources.",
    suggestedQuestions: [
      "What is the Discovery Center?",
      "Where do I start as a new BA?",
      "What pages are in the Discovery Center?",
      "How do I write my first story?",
      "What is the recommended BA workflow?",
    ],
    context: `
## Discovery Center — BA Learning & Platform Knowledge Hub

The Discovery Center is the primary resource for Business Analysts working on the DCT Platform. It contains everything needed to understand the platform, write stories, and prepare for sprint ceremonies.

### Discovery Center Pages
1. **Ecosystem Overview** — Full platform architecture: PDC, TDC, Orchestrator, Roger, and IMS (integration broker to return engines)
2. **Platform Responsibilities** — Ownership boundaries for each system
3. **End-to-End Data Flow** — Step-by-step data journey from ingestion to IMS delivery to return engine
4. **Data Flow Simulation** — Interactive 32-step simulation of the full platform journey
5. **Integration Architecture** — Six-layer architecture model
6. **BA Requirement Discovery** — 13 questions to answer before writing a story
7. **Discovery Checklist** — 13-item interactive checklist for story readiness
8. **BA Story Builder** — Guided form that auto-generates Azure DevOps-ready user stories
9. **TDC / DCT Overview** — Platform overview, batch model, and governance gates
10. **Roger Overview** — Roger's role, screens, APIs, and BA guidance
11. **IMS Integration** — IMS architecture: engine routing, payload translation, B9A Gateway retrieval, return engine delivery
12. **Glossary** — DCT terms, acronyms, and definitions

### Recommended BA Workflow
1. Start with **Ecosystem Overview** to understand the five platform components
2. Read **Platform Responsibilities** to understand ownership boundaries
3. Review **End-to-End Data Flow** to understand how data moves through the platform
4. Use **BA Requirement Discovery** to answer the 13 questions for your story
5. Complete the **Discovery Checklist** to verify story readiness
6. Use **BA Story Builder** to generate the ADO-ready story output
7. Reference **Roger Overview** and **IMS Integration** for system-specific questions
8. Use the **Glossary** for any unfamiliar terms
`,
  },

  // ── Provision & State Discovery Workspace ─────────────────────────────────
  "/onboarding": {
    pageTitle: "Provision & State Discovery Workspace",
    pagePath: "/onboarding",
    summary: "Discovery workspace for the State and Provision workstreams, covering Batches 9A, 16, and 28 and their governed data access, audit trail, and provision reference data capabilities.",
    suggestedQuestions: [
      "What does Batch 9A deliver for the State and Provision workstreams?",
      "How does Batch 28 support Provision reference data?",
      "What is the role of Batch 16 in audit trail and lineage governance?",
      "What data does the State workstream need from PDC and TDC?",
      "How does the Provision workstream consume governed data from DCT?",
      "What APIs are available for State and Provision consumers?",
      "What is already built vs what is net-new for State and Provision?",
      "How does IMS route State and Provision data to return engines?",
      "What are the governance boundaries between PDC, TDC, and Provision?",
      "What acceptance criteria should a BA define for a State workstream story?",
    ],
    context: `
## Provision & State Discovery Workspace — DCT Platform Context

This workspace covers the **State** and **Provision** workstreams and the DCT batches that support them: **Batch 9A**, **Batch 16**, and **Batch 28**.

---

### State Workstream
- **Purpose:** Manages state income tax compliance and reporting across all jurisdictions where RSM clients operate.
- **Business Functions:** Apply state tax rules and classifications; compute state apportionment factors; prepare state tax returns and disclosures; ensure compliance with state regulations; provide complete audit trail for regulatory review.
- **Downstream Consumers:** Roger (practitioner review), IMS (routes governed data to return engines), state filing teams, regulatory reporting.
- **Key DCT Batches:** B9A (Data Gateway — governed consumer access), B16 (Audit Trail & Lineage Governance), B28 (Provision Reference Data & BTP Outbound Contract).
- **Data Flow:** TDC computes and classifies state tax data → B9A Gateway exposes governed API → IMS retrieves and routes to return engine (GoSystem, CCH, OIT) → Roger surfaces for practitioner review.

---

### Provision Workstream
- **Purpose:** Manages tax provision calculations and reporting for financial statement purposes, ensuring accurate deferred tax assets/liabilities and effective tax rate (ETR) computations.
- **Business Functions:** Compute current and deferred tax provisions; calculate ETR; prepare provision-to-return reconciliations; support financial statement disclosures; provide audit-ready provision data.
- **Downstream Consumers:** Roger (practitioner review), IMS (provision data routing), external reporting systems.
- **Key DCT Batches:** B28 (Provision Reference Data & BTP Outbound Contract — primary), B9A (Data Gateway), B16 (Audit Trail).
- **Data Flow:** PDC normalizes financial data → TDC applies provision tax logic → B28 exposes BTP outbound contract → IMS routes to provision engine → Roger surfaces for review.

---

### Batch 9A — DCT Data Gateway & Governed Consumer Access
- **Owner:** Abbas, Nasar (PI 3, ADO 1387817)
- **Status:** Active in ADO (PI 3)
- **Purpose:** The B9A Gateway is the governed access layer between TDC and all external consumers (IMS, CDS, DUO, Tax Portal). No consumer connects directly to TDC — all access is mediated through B9A.
- **Key Capabilities:** Governed API endpoints for State and Provision data; consumer contract management; access control and audit logging; payload translation for IMS engine routing.
- **Boundary Rule:** TDC owns the data; B9A owns the access contract. Consumers cannot bypass the gateway.

---

### Batch 16 — PDC Audit Trail & Lineage Governance
- **Owner:** Abbas, Nasar (PI 3, ADO 1390258)
- **Status:** Active in ADO (PI 3) — Critical Path item, must land before 9/21 pilot
- **Purpose:** Provides complete audit trail and lineage governance for all data flowing through PDC. Ensures every data transformation is traceable, replayable, and auditable for regulatory review.
- **Key Capabilities:** Immutable audit log of all PDC transformations; lineage closure verification; compliance reporting; integration with TDC decision audit trail.
- **Business Value:** Eliminates manual audit reconstruction. Regulators and practitioners can trace any output back to its source data and transformation logic.

---

### Batch 28 — TDC Tax Workpapers & Provision Schedules
- **Owner:** Luca, Gary (PI 3, ADO 1390012)
- **Status:** Active in ADO (PI 3)
- **Purpose:** Delivers tax workpaper generation and provision schedule outputs for the Provision workstream. Produces the BTP (Book-to-Tax Provision) outbound contract consumed by IMS and Roger.
- **Key Capabilities:** Tax workpaper generation; provision schedule computation; BTP outbound contract publication; ETR calculation support; provision-to-return reconciliation data.
- **Boundary Rule:** TDC owns provision tax logic and workpaper generation. PDC provides normalized financial inputs. Roger consumes the output read-only.

---

### Discovery Principle for This Workspace
Before documenting any new requirement for the State or Provision workstream, determine whether DCT already supports the capability through B9A, B16, or B28. Classify each requirement as:
- **Covered:** Fully supported by an existing batch — no new story needed.
- **Partially Covered:** Supported in part — a gap story or enhancement is appropriate.
- **Net-New:** Not supported — a new feature or batch is required.

### Governance Boundaries
- PDC owns financial data normalization — it does not own tax logic.
- TDC owns all tax decisions, classifications, and provision computations — immutable once locked.
- B9A Gateway owns consumer access — no consumer bypasses it.
- Roger is read-only — it consumes governed outputs but cannot write to TDC or PDC.
- IMS owns engine routing and payload translation — DCT does not connect directly to GoSystem, CCH, or OIT.
`,
  },

  "/qa-deployment-registry": {
    pageTitle: "QA Release Notes & Deployment Registry",
    pagePath: "/qa-deployment-registry",
    summary: "Generate structured QA release notes from deployment notes. Outputs what is available in QA for testing and a screen-by-screen functionality confirmation checklist.",
    context: `
## QA Release Notes Assistant

When a user pastes deployment notes and asks you to generate QA release notes, respond with the following structured format EXACTLY:

---
**QA DEPLOYMENT SUMMARY**
Release Name: [infer from notes, e.g. "Roger QA — My Clients Page"]
Deployment Date: [from notes or today's date]
Environment: QA
Platform: Roger
Deployment Owner: [from notes or "Not Provided"]

---
**WHAT'S AVAILABLE IN QA FOR TESTING**
List every capability or feature that is explicitly confirmed as deployed and available for QA testing. Use checkmarks:
✅ [Capability name] — [1-sentence description of what it does]
✅ [Capability name] — [1-sentence description]

If something is explicitly NOT available or excluded, list it separately:
🚫 [Capability name] — [reason it is not available, e.g. "Not included in this deployment"]

---
**CONFIRM FUNCTIONALITY BY SCREEN**
For each screen mentioned in the notes, provide a section:

**Screen: [Screen Name]**
| Functionality | QA Status | What to Test | Expected Result |
|---|---|---|---|
| [capability] | ✅ Available | [specific test step] | [expected outcome] |
| [capability] | 🚫 Not Available | Do not test | N/A |

---
**KNOWN LIMITATIONS & EXCLUSIONS**
List anything explicitly stated as not included, deferred, or requiring follow-up.

---
**BA FOLLOW-UP REQUIRED**
List any items that need BA confirmation, ADO story updates, or business decisions before QA can proceed.

---
RULES:
1. Only include what is EXPLICITLY stated in the notes. Never assume or invent.
2. If a capability is NOT mentioned as available, mark it 🚫 Not Available.
3. Use plain language — QA testers should be able to follow the test steps without prior context.
4. If the deployment owner is mentioned (e.g. "Gary confirmed"), include their name.
5. Keep each test step specific and actionable (e.g. "Navigate to My Clients, verify Entity Count displays next to each client row").
`,
    suggestedQuestions: [
      "Generate QA release notes from these deployment notes",
      "What is available in QA for testing today?",
      "What should QA test on the My Clients screen?",
      "What functionality is NOT included in this deployment?",
      "What follow-up items does the BA need to confirm?",
    ],
  },

  "/discovery/master-data-governance": {
    pageTitle: "Master Data & Governance",
    pagePath: "/discovery/master-data-governance",
    summary: "Workbook-backed governance for DCT Master Data. Active tabs in DCT_Master_Data_Intake.xlsx are authoritative; tabs explicitly labeled OLD are historical reference only.",
    context: `
## Master Data & Governance

The authoritative source for current DCT Master Data values is **DCT_Master_Data_Intake.xlsx**. Use current active tabs only. Tabs explicitly labeled **OLD** are historical reference and must not be used for current processing, mapping, configuration, or a current-state answer.

The workbook governs PDC Firm Taxonomy, TDC Tax Taxonomy Accounts, Adjustment Rules, Adjustment Rule Inputs, Adjustment Rule Lines, Eligibility Tier Conditions, and other reference domains. Workbook presence does not by itself prove a platform load; use **Requires Verification** when a load record is unavailable.

Do not infer relationships or Input Codes from similar descriptions. If the authoritative active-tab evidence does not establish a relationship, say: "The authoritative Master Data Intake workbook does not currently provide enough information to determine this." Then identify the missing evidence when known.

For the active adjustment-rule inventory, no color indicates previously loaded, orange requires load verification, red indicates supporting information is incomplete, and yellow indicates an updated value or account mapping that needs review or alignment. Updated adjustment rule lines include MP-02, MP-06, MP-07, and MP-08.
`,
    suggestedQuestions: [
      "Which Master Data source is authoritative?",
      "Is the OLD PDC Firm Taxonomy current?",
      "What does the Adjustment Rule Lines tab govern?",
      "Can this Input Code mapping be confirmed from active Master Data?",
      "What is the current load status of a Master Data change?",
    ],
  },

};

/**
 * Get the knowledge context for a specific Discovery page path.
 * Returns null if the path is not a Discovery page.
 */
export function getDiscoveryKnowledge(pagePath: string): DiscoveryPageKnowledge | null {
  // Exact match first
  if (DISCOVERY_KNOWLEDGE_BASE[pagePath]) {
    return DISCOVERY_KNOWLEDGE_BASE[pagePath];
  }
  // Prefix match for sub-paths
  for (const key of Object.keys(DISCOVERY_KNOWLEDGE_BASE)) {
    if (pagePath.startsWith(key) && key !== "/discovery") {
      return DISCOVERY_KNOWLEDGE_BASE[key];
    }
  }
  // Default to Discovery Center hub
  if (pagePath.startsWith("/discovery")) {
    return DISCOVERY_KNOWLEDGE_BASE["/discovery"];
  }
  return null;
}

/**
 * Build the Discovery context block to inject into the Ask Buddy system prompt.
 */
export function buildDiscoveryContextBlock(pagePath: string): string {
  const knowledge = getDiscoveryKnowledge(pagePath);
  if (!knowledge) return "";

  return `
---
## 🧭 DISCOVERY CENTER CONTEXT — ${knowledge.pageTitle.toUpperCase()}

The user is currently viewing the **${knowledge.pageTitle}** page in the Discovery Center.
Automatically apply this context to all responses. When answering questions, prioritize information from this section.

${knowledge.context}

### Suggested Questions for This Page
${knowledge.suggestedQuestions.map(q => `- "${q}"`).join("\n")}
---
`;
}
