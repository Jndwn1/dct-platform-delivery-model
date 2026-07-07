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
    summary: "Full DCT platform ecosystem: PDC, TDC, Orchestrator, Roger, GoSystem Tax, and their relationships.",
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

### 1. PDC — Phoenix Data Consolidation
- **Owner:** PDC Engineering Team
- **Role:** Ingests raw financial data from Tax Portal, normalizes it across Lines of Business (LOB), and enforces the Cross-LOB Taxonomy contract
- **Outputs:** Normalized financial records, ingestion job status, classification results
- **Key APIs:** GET /api/v1/normalized-records, GET /api/v1/ingestion/{jobId}
- **Does NOT own:** Tax decisions, mapping logic, practitioner workflows
- **Key Batches:** FC (Foundation Core), B1 (File Ingestion), B2 (Normalization), B2A (Contract Enforcement)

### 2. TDC — Tax Data Consolidation
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

### 5. GoSystem Tax
- **Role:** RSM's enterprise tax preparation system. Receives finalized, validated tax data from TDC for return assembly and filing.
- **Key Principle:** GoSystem Tax is a CONSUMER of TDC output. It does not push data back into DCT.
- **Integration:** TDC exports a structured tax data package to GoSystem Tax after Sign-Off is complete.
- **Key Batches:** B10 (Return Assembly & Lineage Closure), B29 (Consolidated Return Assembly)

### Platform Data Flow (End-to-End)
1. Tax Portal → PDC (ingestion)
2. PDC → Orchestrator (normalized data for AI mapping)
3. Orchestrator → TDC (mapping proposals)
4. TDC → Practitioner via Roger (review & sign-off)
5. TDC → GoSystem Tax (finalized tax data export)

### Governance Principles
- PDC = Financial truth (no tax logic)
- TDC = Tax judgment and immutable decisions
- Orchestrator = AI execution (proposes, never decides)
- Roger = Read-only practitioner interface
- GoSystem Tax = Downstream consumer only
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

### PDC — Phoenix Data Consolidation
**OWNS:**
- Raw financial data ingestion from Tax Portal
- Cross-LOB financial normalization
- Classification enforcement (B2A)
- Ingestion job tracking and status
- Financial record lineage

**DOES NOT OWN:**
- Tax decisions or tax logic
- Practitioner workflows
- GoSystem Tax integration
- Roger UI data contracts

### TDC — Tax Data Consolidation
**OWNS:**
- All tax mapping decisions (immutable once committed)
- Tax rules framework and enforcement
- Practitioner review and sign-off workflow
- Client tax profile and eligibility
- Exception management and remediation
- Audit trail for all state changes
- Roger read contract (API surface that Roger consumes)
- GoSystem Tax export package

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
- Direct GoSystem Tax integration
- Any write operations outside of submitting confirmed practitioner actions back to TDC

### Cross-System Boundary Rules
1. PDC → TDC: PDC sends normalized financial records; TDC applies tax logic
2. Orchestrator → TDC: Orchestrator sends proposals; TDC confirms or rejects
3. TDC → Roger: TDC exposes read APIs; Roger consumes them (no reverse writes)
4. TDC → GoSystem Tax: One-way export after sign-off; GoSystem does not push back
5. Roger → TDC: Roger submits practitioner actions (adjustments, sign-offs) via TDC write APIs only
`,
  },

  // ── End-to-End Data Flow ──────────────────────────────────────────────────
  "/discovery/data-flow": {
    pageTitle: "End-to-End Data Flow",
    pagePath: "/discovery/data-flow",
    summary: "Step-by-step data flow from Tax Portal ingestion through PDC, TDC, Roger, and GoSystem Tax export.",
    suggestedQuestions: [
      "What happens after a file is ingested?",
      "How does data move from PDC to TDC?",
      "What triggers the AI mapping step?",
      "When does data reach Roger?",
      "What is the final step before GoSystem Tax?",
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

### Step 6: Return Assembly (TDC → GoSystem Tax)
- TDC assembles the final tax data package
- Package is exported to GoSystem Tax for return preparation
- GoSystem Tax uses the package to generate the tax return
- Batches: B10 (Return Assembly), B29 (Consolidated Return Assembly)

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
    summary: "Interactive 32-step simulation of data moving through the DCT platform from ingestion to GoSystem export.",
    suggestedQuestions: [
      "What are all 32 steps in the simulation?",
      "What happens at step 15?",
      "Which steps involve TDC?",
      "Where does the AI mapping happen in the flow?",
      "What is the final simulation step?",
    ],
    context: `
## Data Flow Simulation — 32-Step Platform Journey

The simulation walks through the complete lifecycle of a tax engagement from file upload to GoSystem Tax export.

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
31. TDC exports package to GoSystem Tax
32. GoSystem Tax confirms receipt — engagement complete
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

### Layer 6: Export Layer
- **Components:** TDC Export Engine, GoSystem Tax Integration
- **Protocol:** TDC → GoSystem Tax structured data package
- **Responsibility:** Assemble and export finalized tax data for return preparation
- **Key Batches:** B10, B29

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
    summary: "BA discovery workflow: 13 questions to ask before writing a story, covering TDC objects, APIs, validations, and governance.",
    suggestedQuestions: [
      "What are the 13 BA discovery questions?",
      "What questions should I ask about TDC objects?",
      "What governance questions are required?",
      "What API questions should a BA ask?",
      "What validation questions are needed for a story?",
    ],
    context: `
## BA Requirement Discovery — 13 Questions Before Writing a Story

Before writing any user story for the DCT Platform, a BA must answer these 13 questions:

### Category 1: Business Context (Questions 1–3)
1. **Who is the user?** — Identify the persona (Tax Practitioner, Tax Manager, QA Reviewer, etc.)
2. **What action do they need to perform?** — Describe the specific workflow step in Roger or the platform
3. **What is the business benefit?** — Articulate the outcome this story enables (e.g., "practitioners can validate AI proposals before they become immutable decisions")

### Category 2: Platform Context (Questions 4–6)
4. **Which batch does this story belong to?** — Identify the batch (e.g., B6, B9, B42) that owns this capability
5. **Which TDC business object is involved?** — Identify the specific TDC object (e.g., MappingDecision, Adjustment, SignOffRecord)
6. **Which API endpoint does this story call?** — Identify the specific REST endpoint (e.g., PUT /api/v1/adjustments/{id})

### Category 3: Roger Screen Context (Questions 7–8)
7. **Which Roger screen does this story appear on?** — Map to a specific Roger screen (Mapping Review, Adjustments, Sign-Off, etc.)
8. **What fields are editable by the user?** — List all fields the practitioner can modify on this screen

### Category 4: Validation & Error Handling (Questions 9–10)
9. **What validation rules apply?** — List all field-level and business-level validations
10. **What happens when validation fails?** — Define the error state, error message, and recovery path

### Category 5: Governance (Questions 11–13)
11. **Is this record immutable once submitted?** — If yes, add immutability AC and HTTP 409 error handling
12. **Does this story require an audit record?** — If yes, define what is captured (timestamp, actor, previous state, new state, correlation ID)
13. **Does this story require sign-off?** — If yes, define authentication requirements and the sign-off API call

### Story Readiness Checklist
A story is ready for ADO when all 13 questions are answered AND:
- [ ] TDC object is identified
- [ ] API endpoint is specified
- [ ] Roger screen is mapped
- [ ] All validations are listed
- [ ] Governance flags are set (immutable / audit / sign-off)
- [ ] Acceptance criteria cover all 13 answers
- [ ] Definition of Done is complete
`,
  },

  // ── Discovery Checklist ───────────────────────────────────────────────────
  "/discovery/checklist": {
    pageTitle: "Discovery Checklist",
    pagePath: "/discovery/checklist",
    summary: "13-item interactive checklist for story readiness before submitting to Azure DevOps.",
    suggestedQuestions: [
      "What are the 13 checklist items?",
      "What must be true before a story is ADO-ready?",
      "What governance items are on the checklist?",
      "What API items are required?",
      "What does Definition of Done require?",
    ],
    context: `
## Discovery Checklist — 13 Story Readiness Items

A story is ADO-ready when all 13 items are checked:

### Business Context
1. ☐ Persona identified (Tax Practitioner, Tax Manager, QA Reviewer, etc.)
2. ☐ Action described in plain business language
3. ☐ Business benefit articulated (what outcome does this enable?)

### Platform Context
4. ☐ Batch identified (e.g., B6, B9, B42)
5. ☐ TDC business object identified (e.g., MappingDecision, Adjustment)
6. ☐ API endpoint specified (e.g., PUT /api/v1/adjustments/{id})

### Roger Screen Context
7. ☐ Roger screen mapped (e.g., Roger Mapping Review, Roger Adjustments Screen)
8. ☐ Editable fields listed

### Validation & Error Handling
9. ☐ Validation rules listed (field-level and business-level)
10. ☐ Error handling defined (error state, message, recovery path)

### Governance
11. ☐ Immutability flag set (if record is immutable once submitted)
12. ☐ Audit requirement confirmed (if state change requires audit record)
13. ☐ Sign-off requirement confirmed (if practitioner authentication is required)

### Definition of Done (Required for all stories)
- API endpoint implemented and unit tested
- Roger UI screen renders correctly with live API data
- All acceptance criteria verified by QA
- Consumer Guide updated to reflect new endpoint
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
- **PI 3 MVP:** B42, B17, B20, B21, B26, B28, B29, B31, B9A, B39, B33 — Target: Sep 16, 2026
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
> "Roger reads from TDC. Roger does not own tax decisions. Roger does not call GoSystem Tax directly."

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

  // ── GoSystem Tax ─────────────────────────────────────────────────────────
  "/discovery/gosystem": {
    pageTitle: "GoSystem Tax",
    pagePath: "/discovery/gosystem",
    summary: "GoSystem Tax integration: what data is sent, required fields, error handling, and the TDC export process.",
    suggestedQuestions: [
      "What data is sent to GoSystem?",
      "What fields are required?",
      "What happens if a field is missing?",
      "How does TDC export to GoSystem?",
      "What batches handle the GoSystem integration?",
    ],
    context: `
## GoSystem Tax — Integration Overview

### What is GoSystem Tax?
GoSystem Tax is RSM's enterprise tax preparation and filing system. It is a **downstream consumer** of TDC output — it receives finalized, validated tax data from TDC for return assembly and filing.

### Core GoSystem Principle
> "GoSystem Tax receives data FROM TDC. It does not push data back into DCT. It does not interact with PDC or Roger directly."

### What Data is Sent to GoSystem Tax?
TDC exports a structured **FilingRecord** package to GoSystem Tax after sign-off is complete. The package includes:

| Data Element | TDC Object | Required? |
|-------------|-----------|----------|
| Entity identification | EntityId, EngagementId | Yes |
| Tax profile | TaxProfile | Yes |
| Finalized mapping decisions | MappingDecision (locked) | Yes |
| Practitioner sign-off confirmation | SignOffRecord | Yes |
| Eligibility status | EligibilityRecord | Yes |
| Adjusted amounts | Adjustment (committed) | If applicable |
| Lineage trace ID | LineageRecord | Yes |
| Confidence band summary | ConfidenceBand | Yes |

### Required Fields for GoSystem Export
All of the following must be present and non-null before TDC will export to GoSystem:
1. EntityId — unique entity identifier
2. EngagementId — engagement reference
3. TaxProfile.status = "SIGNED_OFF"
4. SignOffRecord — must exist and be immutable
5. All MappingDecision records must be in COMMITTED status
6. LineageRecord — full lineage trace must be closed
7. EligibilityRecord.status = "ELIGIBLE"

### What Happens if a Required Field is Missing?
- TDC validates the export package before sending
- If any required field is missing or invalid, TDC returns an export validation error
- The export is blocked until all required fields are present
- Roger displays an "Export Blocked" status on the Filing Status screen
- The practitioner must resolve the missing data before GoSystem export can proceed

### Error Scenarios
| Error | Cause | Resolution |
|-------|-------|-----------|
| Export Blocked — Missing Sign-Off | SignOffRecord not created | Practitioner must complete sign-off in Roger |
| Export Blocked — Open Decisions | MappingDecision records still in PROPOSED status | Practitioner must review and commit all proposals |
| Export Blocked — Lineage Gap | LineageRecord incomplete | Engineering must resolve lineage closure (B10) |
| Export Blocked — Ineligible | EligibilityRecord.status ≠ ELIGIBLE | Eligibility issue must be resolved (B7) |

### Batches That Handle GoSystem Integration
- **B10 — Return Assembly & Lineage Closure:** Primary batch for GoSystem export
- **B29 — Consolidated Return Assembly:** Consolidated entity return assembly
- **B7 — Client Tax Profile & Eligibility:** Provides EligibilityRecord required for export
- **B6 — Practitioner Review, Adjustments & Lock:** Provides committed Adjustment records

### Integration Protocol
- TDC → GoSystem Tax: Structured JSON data package via REST API
- Authentication: Service-to-service token (managed by TDC)
- Retry policy: 3 retries with exponential backoff on GoSystem API failure
- Confirmation: GoSystem Tax returns a receipt confirmation to TDC upon successful import
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
- **FilingRecord** — TDC object representing the finalized tax data package exported to GoSystem Tax
- **EligibilityRecord** — TDC object representing a client's eligibility status for tax filing
- **NormalizedRecord** — PDC object representing a financial record after Cross-LOB normalization
- **IngestionJob** — PDC object tracking the status of a file ingestion pipeline run
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
1. **Ecosystem Overview** — Full platform architecture: PDC, TDC, Orchestrator, Roger, GoSystem Tax
2. **Platform Responsibilities** — Ownership boundaries for each system
3. **End-to-End Data Flow** — Step-by-step data journey from ingestion to GoSystem export
4. **Data Flow Simulation** — Interactive 32-step simulation of the full platform journey
5. **Integration Architecture** — Six-layer architecture model
6. **BA Requirement Discovery** — 13 questions to answer before writing a story
7. **Discovery Checklist** — 13-item interactive checklist for story readiness
8. **BA Story Builder** — Guided form that auto-generates Azure DevOps-ready user stories
9. **TDC / DCT Overview** — Platform overview, batch model, and governance gates
10. **Roger Overview** — Roger's role, screens, APIs, and BA guidance
11. **GoSystem Tax** — GoSystem integration: data sent, required fields, error handling
12. **Glossary** — DCT terms, acronyms, and definitions

### Recommended BA Workflow
1. Start with **Ecosystem Overview** to understand the five platform components
2. Read **Platform Responsibilities** to understand ownership boundaries
3. Review **End-to-End Data Flow** to understand how data moves through the platform
4. Use **BA Requirement Discovery** to answer the 13 questions for your story
5. Complete the **Discovery Checklist** to verify story readiness
6. Use **BA Story Builder** to generate the ADO-ready story output
7. Reference **Roger Overview** and **GoSystem Tax** for system-specific questions
8. Use the **Glossary** for any unfamiliar terms
`,
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
