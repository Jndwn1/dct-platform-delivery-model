/**
 * DCT Platform — Enriched Data Model
 * RSM | CATT | DCT + Roger | Executive Demo Environment
 *
 * Source of truth for:
 * - Platform architecture layers
 * - AI agent definitions
 * - T1–T11 touchpoint journey (enriched with agent + layer + system)
 * - Demo runtime scenario
 * - Gate verification model (G1–G4 with artifacts)
 * - Batch Roadmap v2.1 delivery alignment (Core → Batch 23 + Migration Track)
 *
 * Last synced: DCT Batch Roadmap v2.1 · April 28, 2026
 * PDC = Phoenix Data Consolidation · TDC = Tax Data Consolidation
 */

// ─── PLATFORM LAYERS ─────────────────────────────────────────────────────────

export interface PlatformLayer {
  id: string;
  order: number;
  label: string;
  sublabel: string;
  authority: string;
  isSystemOfRecord: boolean;
  color: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
  systems: string[];
  agentIds: string[];
}

export const PLATFORM_LAYERS: PlatformLayer[] = [
  {
    id: "client",
    order: 1,
    label: "Client Systems",
    sublabel: "Source of Financial Record",
    authority: "External Source",
    isSystemOfRecord: false,
    color: "bg-slate-700",
    borderColor: "border-slate-600",
    textColor: "text-slate-100",
    badgeColor: "bg-slate-500",
    systems: ["SAP", "Oracle", "Workday", "NetSuite", "Custom ERP"],
    agentIds: [],
  },
  {
    id: "ingestion",
    order: 2,
    label: "Data Ingestion Layer",
    sublabel: "File Intake & doc_id Assignment",
    authority: "Intake Authority",
    isSystemOfRecord: false,
    color: "bg-violet-700",
    borderColor: "border-violet-600",
    textColor: "text-violet-100",
    badgeColor: "bg-violet-500",
    systems: ["DMS", "Phoenix"],
    agentIds: ["analyst"],
  },
  {
    id: "pdc",
    order: 3,
    label: "Cross-LOB Financial Data Authority",
    sublabel: "PDC — Phoenix Data Consolidation",
    authority: "Canonical Financial Authority",
    isSystemOfRecord: true,
    color: "bg-emerald-700",
    borderColor: "border-emerald-600",
    textColor: "text-emerald-100",
    badgeColor: "bg-emerald-500",
    systems: ["PDC", "Phoenix Data Consolidation"],
    agentIds: ["architecture", "qa"],
  },
  {
    id: "tdc",
    order: 4,
    label: "Tax Domain Authority",
    sublabel: "TDC — Tax Data Consolidation",
    authority: "Tax Decision Authority",
    isSystemOfRecord: true,
    color: "bg-red-700",
    borderColor: "border-red-600",
    textColor: "text-red-100",
    badgeColor: "bg-red-500",
    systems: ["TDC", "Tax Data Consolidation"],
    agentIds: ["roger_ai"],
  },
  {
    id: "orchestration",
    order: 5,
    label: "AI Orchestration Layer",
    sublabel: "Stateless Compute — Recognition · Extraction · Mapping",
    authority: "Stateless Compute (No Authority)",
    isSystemOfRecord: false,
    color: "bg-blue-700",
    borderColor: "border-blue-600",
    textColor: "text-blue-100",
    badgeColor: "bg-blue-500",
    systems: ["AI Orchestrator", "Roger AI"],
    agentIds: ["roger_ai", "qa"],
  },
  {
    id: "experience",
    order: 6,
    label: "Practitioner Experience Layer",
    sublabel: "Roger UI — Read-Only Consumer",
    authority: "Read-Only Consumer",
    isSystemOfRecord: false,
    color: "bg-pink-700",
    borderColor: "border-pink-600",
    textColor: "text-pink-100",
    badgeColor: "bg-pink-500",
    systems: ["Roger UI"],
    agentIds: ["demo_runner"],
  },
];

// ─── AI AGENTS ───────────────────────────────────────────────────────────────

export type AgentStatus = "ACTIVE" | "IDLE" | "RUNNING" | "STANDBY";

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  layerId: string;
  layerLabel: string;
  status: AgentStatus;
  lastExecution: string;
  touchpointIds: string[];
  outputs: string[];
  color: string;
  icon: string;
}

export const AGENTS: AgentDefinition[] = [
  {
    id: "analyst",
    name: "Analyst Agent",
    role: "Requirements & Backlog Generation",
    description:
      "Generates requirements, architecture artifacts, and backlog stories aligned to the DCT Delivery Model. Produces epics, features, user stories, spikes, and acceptance criteria from architecture inputs.",
    layerId: "ingestion",
    layerLabel: "Data Ingestion Layer",
    status: "ACTIVE",
    lastExecution: "2026-04-28 09:14:22",
    touchpointIds: ["T1"],
    outputs: ["Epics", "Features", "User Stories", "Acceptance Criteria", "Spikes"],
    color: "bg-violet-600",
    icon: "FileText",
  },
  {
    id: "architecture",
    name: "Architecture Agent",
    role: "Architecture Validation & Contract Enforcement",
    description:
      "Validates architecture alignment and platform contracts. Ensures schema locks, invariant locks, and lineage closure are maintained across all batches. Maintains the architecture diagram in sync with the canonical model.",
    layerId: "pdc",
    layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    status: "ACTIVE",
    lastExecution: "2026-04-28 10:02:47",
    touchpointIds: ["T4", "T5", "T6"],
    outputs: ["Schema Lock Certificate", "Invariant Lock Report", "Architecture Change Summary", "Contract Manifest"],
    color: "bg-emerald-600",
    icon: "GitBranch",
  },
  {
    id: "qa",
    name: "QA Agent",
    role: "Test Generation & Workflow Integrity Validation",
    description:
      "Generates test scenarios and validates workflow integrity across all four gates. Performs shift-left QA, adversarial invariant testing, and lineage closure validation. Enforces quality gates in CI/CD pipelines.",
    layerId: "pdc",
    layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    status: "RUNNING",
    lastExecution: "2026-04-28 11:45:03",
    touchpointIds: ["T4", "T5", "T6", "T7"],
    outputs: ["Schema Validation Report", "Invariant Test Suite", "Lineage Closure Report", "Contract Compliance Report"],
    color: "bg-amber-600",
    icon: "ShieldCheck",
  },
  {
    id: "demo_runner",
    name: "Demo Runner Agent",
    role: "End-to-End Runtime Orchestration",
    description:
      "Orchestrates the end-to-end runtime demonstration across all T1–T11 touchpoints. Simulates the full platform journey from client file upload through Roger UI display for leadership review.",
    layerId: "experience",
    layerLabel: "Practitioner Experience Layer",
    status: "STANDBY",
    lastExecution: "2026-04-28 08:30:00",
    touchpointIds: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"],
    outputs: ["Demo Execution Log", "Runtime Journey Report", "Leadership Summary"],
    color: "bg-pink-600",
    icon: "Play",
  },
  {
    id: "roger_ai",
    name: "Roger AI Agent",
    role: "Tax Mapping & Practitioner Interaction",
    description:
      "Performs AI-assisted tax mapping and facilitates practitioner interaction. Executes schema recognition (T2), financial extraction (T3), and generates tax mapping proposals (T8) as stateless compute. Never acts as system of record.",
    layerId: "orchestration",
    layerLabel: "AI Orchestration Layer",
    status: "IDLE",
    lastExecution: "2026-04-28 07:55:18",
    touchpointIds: ["T2", "T3", "T8"],
    outputs: ["Schema Recognition Report", "Normalization Record", "Tax Mapping Proposals", "Confidence Scores"],
    color: "bg-blue-600",
    icon: "Brain",
  },
];

// ─── ENRICHED TOUCHPOINTS ─────────────────────────────────────────────────────

export type TouchpointStatus = "COMPLETE" | "IN_PROGRESS" | "PENDING" | "PLANNED" | "BLOCKED";

export interface EnrichedTouchpoint {
  id: string;
  label: string;
  name: string;
  system: string;
  layerId: string;
  layerLabel: string;
  agentId: string | null;
  agentName: string | null;
  gate: string;
  status: TouchpointStatus;
  isAuthorityAction: boolean;
  inputs: string[];
  outputs: string[];
  responsibility: string;
  deliveredBy?: string;      // Batch(es) that delivered this touchpoint
  deliveredDate?: string;    // Approximate delivery date from calendar
  statusNote?: string;       // Brief note explaining current status
}

export const TOUCHPOINTS: EnrichedTouchpoint[] = [
  {
    id: "T1", label: "T1", name: "File Upload + doc_id Assignment",
    system: "Phoenix / DMS", layerId: "ingestion", layerLabel: "Data Ingestion Layer",
    agentId: "analyst", agentName: "Analyst Agent",
    gate: "G1", status: "COMPLETE", isAuthorityAction: false,
    inputs: ["Client ERP export file", "Client metadata"],
    outputs: ["doc_id assignment", "Intake Log Record", "File routing event"],
    responsibility: "Receive client ERP file, assign immutable doc_id, log intake record",
    deliveredBy: "FC + B1",
    deliveredDate: "PI 1 — Complete",
    statusNote: "Foundation Core and Batch 1 (File Ingestion & Initial Storage) fully delivered in PI 1.",
  },
  {
    id: "T2", label: "T2", name: "File Structure Recognition",
    system: "AI Orchestrator", layerId: "orchestration", layerLabel: "AI Orchestration Layer",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G1", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B2 + B2A",
    deliveredDate: "PI 1 — Complete",
    statusNote: "Batch 2 (Normalization & Cross-LOB Taxonomy) and Batch 2A (Orchestrator Contract Enforcement) fully delivered in PI 1. FirmTaxonomyId enforcement active.",
    inputs: ["Routed file from T1", "doc_id", "FirmFinancialTaxonomy (XLOB) reference data from PDC"],
    outputs: ["Schema Recognition Report", "File type classification", "Validation result", "FirmTaxonomyId (GUID — REQUIRED per Batch 2A enforcement)", "ClassificationStatus (CLASSIFIED | UNCLASSIFIED | OVERRIDE)"],
    responsibility: "Identify file schema, classify financial data model, validate format conformance. Batch 2A: Orchestrator must return FirmTaxonomyId with every record — records missing FirmTaxonomyId are rejected by PDC.",
  },
  {
    id: "T3", label: "T3", name: "Financial Data Extraction & Normalization",
    system: "AI Orchestrator", layerId: "orchestration", layerLabel: "AI Orchestration Layer",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G1", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B2 + B2A",
    deliveredDate: "PI 1 — Complete",
    statusNote: "Batch 2 (Normalization) and Batch 2A (Contract Enforcement) both Complete in PI 1. FirmTaxonomyId required on every record; unclassified records rejected.",
    inputs: ["Recognized file from T2", "Schema Recognition Report", "FirmFinancialTaxonomy (XLOB) from PDC"],
    outputs: ["Normalized financial records", "Normalization Record", "RunId (processing version linked to DocumentId)", "FirmTaxonomyId per record (REQUIRED — Batch 2A)", "ClassificationStatus per record"],
    responsibility: "Extract financial data, apply cross-LOB normalization to canonical model. Supported file types: Trial Balance, K-1, W-2, 1099. Each record must carry FirmTaxonomyId. RunId links processing version to originating DocumentId.",
  },
  {
    id: "T4", label: "T4", name: "Canonical Normalization & Persistence (PDC)",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G2", status: "COMPLETE", isAuthorityAction: true,
    deliveredBy: "B2 + B2A",
    deliveredDate: "PI 1 — Complete",
    statusNote: "Batch 2 (PDC canonical persistence) and Batch 2A (FirmTaxonomyId enforcement) both Complete. vNormalizedTb read contract live.",
    inputs: ["Normalized records from T3", "Normalization Record", "FirmTaxonomyId (REQUIRED on every record — Batch 2A)"],
    outputs: ["Canonical Record Set (FinancialFact)", "PDC persistence confirmation", "RunId → DocumentId → EntityId lineage", "FirmTaxonomyId (REQUIRED — stored on every FinancialFact)", "ClassificationStatus (CLASSIFIED | UNCLASSIFIED | OVERRIDE)", "vNormalizedTb read contract (Roger-facing)"],
    responsibility: "Persist normalized records as versioned canonical financial dataset. PDC rejects any record missing FirmTaxonomyId once Batch 2A enforcement is active. vNormalizedTb exposes clean financial facts scoped by EntityId + PeriodStart + PeriodEnd + RunId.",
  },
  {
    id: "T5", label: "T5", name: "Lineage Capture",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G3", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B1 + B10",
    deliveredDate: "B10 delivered Jun 11, 2026",
    statusNote: "Lineage anchor established in Batch 1 (Complete). End-to-end lineage closure delivered in Batch 10 (Return Assembly, Filing & Lineage Closure — Done, Jun 11).",
    inputs: ["Canonical Record Set from T4", "Transformation audit log", "RunId → DocumentId → EntityId chain"],
    outputs: ["Lineage Record", "Provenance graph nodes and edges", "FirmTaxonomyId (Batch 2A) visible in lineage chain"],
    responsibility: "Capture full provenance graph from source file through AI transformations to canonical records. RunId links processing version to originating DocumentId established in Batch 1.",
  },
  {
    id: "T6", label: "T6", name: "Canonical Dataset Establishment",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G3", status: "COMPLETE", isAuthorityAction: true,
    deliveredBy: "B2 + B10",
    deliveredDate: "B10 delivered Jun 11, 2026",
    statusNote: "Canonical dataset established in Batch 2 (Complete). Dataset locked and authority certificate issued as part of Batch 10 lineage closure (Done, Jun 11).",
    inputs: ["Lineage Record from T5", "Schema Lock Certificate (G1)"],
    outputs: ["Dataset Authority Certificate", "Locked canonical dataset", "Version manifest"],
    responsibility: "Version, lock, and establish authority for canonical dataset",
  },
  {
    id: "T7", label: "T7", name: "READY Signal to TDC",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC — Phoenix Data Consolidation)",
    agentId: "qa", agentName: "QA Agent",
    gate: "G3", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B2A + B3",
    deliveredDate: "PI 1 — Complete",
    statusNote: "READY signal gate enforced via Batch 2A (FirmTaxonomyId enforcement, Complete) and Batch 3 (TDC Tax Taxonomy, Complete). All records classified before signal emission.",
    inputs: ["Dataset Authority Certificate from T6", "FirmTaxonomyId validation check — all records must be CLASSIFIED before READY signal is emitted"],
    outputs: ["Data Readiness Signal event", "TDC trigger", "AI Mapping Layer trigger"],
    responsibility: "Emit Data Readiness Signal to notify TDC and AI Mapping Layer. READY signal must not be emitted if any record has ClassificationStatus = UNCLASSIFIED (Batch 2A enforcement). Batch 3 (TDC Tax Taxonomy) must be complete before AI mapping can begin.",
  },
  {
    id: "T8", label: "T8", name: "AI Tax Mapping Proposals",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC — Tax Data Consolidation)",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G4", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B4",
    deliveredDate: "PI 2 — Complete",
    statusNote: "Batch 4 (AI Tax Mapping & Explainability) fully delivered in PI 2. AI mapping proposals with confidence bands (GREEN/YELLOW/RED) and structured evidence are live.",
    inputs: ["Data Readiness Signal from T7", "Canonical dataset from PDC", "TDC Tax Taxonomy & MappingRules (Batch 3)", "ConfidenceBandThresholds (GREEN/YELLOW/RED)"],
    outputs: ["Mapping Proposal Set", "Confidence scores (GREEN/YELLOW/RED/UNRESOLVED)", "Structured evidence (rules, prior year, SEC peer, model version)", "Proposal rationale"],
    responsibility: "Generate AI-assisted tax mapping proposals for practitioner review. Every account gets a proposal with a confidence band and structured evidence. Proposals are immutable records. Batch 4 first delivery point for Roger practitioner experience.",
  },
  {
    id: "T9", label: "T9", name: "Practitioner Tax Review & Decisions",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC — Tax Data Consolidation)",
    agentId: null, agentName: null,
    gate: "G4", status: "COMPLETE", isAuthorityAction: false,
    deliveredBy: "B6 + B7",
    deliveredDate: "PI 2 — Complete",
    statusNote: "Batch 6 (Practitioner Review, Adjustments & Lock) and Batch 7 (Client Tax Profile & Eligibility) both Complete in PI 2. Six-state adjustment lifecycle and eligibility gating active.",
    inputs: ["Mapping Proposal Set from T8", "Tax domain invariants (G2)", "Entity eligibility status (Batch 7)"],
    outputs: ["Tax Review Record", "Practitioner validation events", "Approved/modified/rejected mappings (append-only, immutable)", "Entity review status (OPEN | IN_REVIEW | FINALIZED | AMENDED)"],
    responsibility: "Practitioner review and validation of AI mapping proposals. Decisions are append-only and immutable. Batch 6 introduces governed six-state adjustment lifecycle and deterministic tax-ready record derivation. Batch 7 eligibility gate blocks entities in INELIGIBLE or FLAG_AND_REVIEW state.",
  },
  {
    id: "T10", label: "T10", name: "Tax Decision Persistence",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC — Tax Data Consolidation)",
    agentId: null, agentName: null,
    gate: "G4", status: "COMPLETE", isAuthorityAction: true,
    deliveredBy: "B6 + B10",
    deliveredDate: "B10 delivered Jun 11, 2026",
    statusNote: "Tax-ready record derivation and sign-off delivered in Batch 6 (Complete). Immutable filing record and return assembly delivered in Batch 10 (Done, Jun 11).",
    inputs: ["Validated mappings from T9", "Tax Review Record", "Approved book-to-tax adjustments (Batch 6)"],
    outputs: ["Tax Decision Record (immutable)", "Tax-ready records (derived deterministically from accepted decisions + approved adjustments)", "Sign-off record with SHA-256 hash (Batch 6)", "Immutable decision log", "Audit trail entry"],
    responsibility: "Persist validated tax decisions as immutable, auditable records. Tax-ready records derived deterministically from accepted decisions and approved adjustments only. Sign-off requires all review tasks closed. Lock is terminal at record level.",
  },
  {
    id: "T11", label: "T11", name: "UI Consumption",
    system: "Roger UI", layerId: "experience", layerLabel: "Practitioner Experience Layer",
    agentId: "demo_runner", agentName: "Demo Runner Agent",
    gate: "G4", status: "IN_PROGRESS", isAuthorityAction: false,
    deliveredBy: "B4 + B6 + B8 + B9 + B10",
    deliveredDate: "Core gateway live; B11/B42/B43 in flight",
    statusNote: "Core Roger UI consumption delivered: B4 (mapping proposals), B6 (practitioner workflow), B8 (exceptions), B9 (Roger Gateway — Done), B10 (return assembly — Done). Active: B11 (Learning Governance), B42 (Tax Rules), B43 (Book & Reclass Adjustments).",
    inputs: ["Tax Decision Record from T10", "Canonical dataset from PDC", "TDC Records API Contract (Roger Read Surface — Batch 4)", "Entity eligibility status (Batch 7)", "Exception status (Batch 8)"],
    outputs: ["Practitioner view (GREEN/YELLOW/RED distribution, pending vs decided)", "Audit trail display", "Lineage trace UI", "Exception status surface (Batch 8)", "Gateway consumer surface (Batch 9)", "Return assembly & filing status (Batch 10)"],
    responsibility: "Surface verified tax results and full audit trail to practitioners (read-only). Roger is activated as a practitioner tool at Batch 4. Full practitioner workflow at Batch 6. Eligibility gating visible at Batch 7. Exception surface at Batch 8.",
  },
];

// ─── GATE VERIFICATION MODEL ─────────────────────────────────────────────────

export interface GateArtifact {
  name: string;
  status: "ISSUED" | "PENDING" | "MISSING";
  owner: string;
}

export interface Gate {
  id: string;
  label: string;
  name: string;
  description: string;
  status: "PASSED" | "PENDING_REVIEW" | "PLANNED" | "BLOCKED";
  touchpointIds: string[];
  artifacts: GateArtifact[];
  exitCondition: string;
  owner: string;
}

export const GATES: Gate[] = [
  {
    id: "G1", label: "G1", name: "Schema Lock",
    description: "Validates schema definition, data constraints, required fields, type definitions, relational constraints, and governance fields (JobId, RunId, DocumentId, EntityId, PeriodStart, PeriodEnd, timestamps). TaxYear is NOT stored in PDC — it is derived in TDC from PeriodStart/PeriodEnd.",
    status: "PENDING_REVIEW",
    touchpointIds: ["T1", "T2", "T3"],
    artifacts: [
      { name: "Schema Definition Document", status: "ISSUED", owner: "Architecture Lead" },
      { name: "Data Constraint Validation Report", status: "ISSUED", owner: "QA Agent" },
      { name: "Schema Lock Certificate", status: "PENDING", owner: "Architecture Lead" },
      { name: "Governance Field Audit (JobId, RunId, DocumentId, EntityId)", status: "PENDING", owner: "QA Agent" },
      { name: "Schema Review Sign-off", status: "MISSING", owner: "Delivery Lead" },
    ],
    exitCondition: "Schema Lock Certificate issued and signed off by Architecture Lead and Delivery Lead",
    owner: "Architecture Lead",
  },
  {
    id: "G2", label: "G2", name: "Invariant Lock",
    description: "Defines and verifies adversarial test scenarios protecting platform invariants: LOCKED records cannot be overwritten, lineage must remain intact, lifecycle transitions must be enforced. FirmTaxonomyId enforcement (Batch 2A) must be validated — PDC rejects records missing FirmTaxonomyId. DEP-04 (Taxonomy Service API contract) must be resolved before gate can close.",
    status: "PLANNED",
    touchpointIds: ["T4"],
    artifacts: [
      { name: "Invariant Definition Register", status: "MISSING", owner: "QA Agent" },
      { name: "Adversarial Test Suite", status: "MISSING", owner: "QA Agent" },
      { name: "LOCKED Record Protection Proof", status: "MISSING", owner: "QA Agent" },
      { name: "Lifecycle Transition Validation", status: "MISSING", owner: "Architecture Agent" },
      { name: "FirmTaxonomyId Enforcement Validation (Batch 2A)", status: "MISSING", owner: "DCT Architecture + Roger Team" },
    ],
    exitCondition: "All invariant tests pass with zero failures. Adversarial test suite approved by Lead Dev. FirmTaxonomyId enforcement validated (Batch 2A). DEP-04 Taxonomy Service contract resolved.",
    owner: "Tax Domain Lead + Architecture Lead",
  },
  {
    id: "G3", label: "G3", name: "Lineage Closure",
    description: "Validates end-to-end traceability: source file → canonical record → tax decision → practitioner output. Full provenance graph must be complete and verifiable. RunId → DocumentId → EntityId chain must be intact.",
    status: "PLANNED",
    touchpointIds: ["T5", "T6", "T7"],
    artifacts: [
      { name: "Lineage Graph Completeness Report", status: "MISSING", owner: "Architecture Agent" },
      { name: "Source-to-Canonical Trace (RunId → DocumentId → EntityId)", status: "MISSING", owner: "QA Agent" },
      { name: "Cross-System Continuity Proof", status: "MISSING", owner: "Architecture Agent" },
      { name: "Lineage Closure Certificate", status: "MISSING", owner: "Architecture Lead" },
      { name: "Provenance Audit Log", status: "MISSING", owner: "QA Agent" },
    ],
    exitCondition: "Lineage Closure Certificate issued. Full chain from source file to Roger UI verified. RunId → DocumentId → EntityId chain confirmed intact.",
    owner: "Architecture Lead",
  },
  {
    id: "G4", label: "G4", name: "Contract Publication",
    description: "Validates API behavior and data contracts: endpoint response structures, schema conformance, error behavior, version compatibility, and consumer integration. TDC Records API Contract (Roger Read Surface — Batch 4) must be live before Roger practitioner experience is activated.",
    status: "PLANNED",
    touchpointIds: ["T8", "T9", "T10", "T11"],
    artifacts: [
      { name: "API Contract Specification", status: "MISSING", owner: "Architecture Agent" },
      { name: "Contract Compliance Report", status: "MISSING", owner: "QA Agent" },
      { name: "Consumer Integration Test Results", status: "MISSING", owner: "QA Agent" },
      { name: "Version Compatibility Matrix", status: "MISSING", owner: "Architecture Agent" },
      { name: "Contract Publication Certificate", status: "MISSING", owner: "Business Owner" },
      { name: "TDC Records API Contract (Roger Read Surface — Batch 4)", status: "MISSING", owner: "Roger Team" },
    ],
    exitCondition: "Contract Publication Certificate issued. All consumer integration tests pass. TDC Records API Contract (Batch 4) live and Roger-consumable.",
    owner: "Business Owner + Delivery Lead",
  },
];

// ─── DEMO RUNTIME SCENARIO ────────────────────────────────────────────────────

export interface DemoStep {
  step: number;
  label: string;
  touchpointId: string;
  system: string;
  agentId: string | null;
  layerId: string;
  description: string;
  output: string;
}

export const DEMO_SCENARIO: DemoStep[] = [
  {
    step: 1, label: "File Ingestion (Batch 1)",
    touchpointId: "T1", system: "Phoenix / DMS", agentId: "analyst", layerId: "ingestion",
    description: "Client uploads trial balance file from ERP system. Tax Portal enforces ingestion contract (EntityId, PeriodStart, PeriodEnd). PDC creates IngestionJob and SourceFile records with immutable JobId and DocumentId.",
    output: "JobId: TB-2026-0428-001 · DocumentId: DOC-001 · State: INGESTED · EntityId captured",
  },
  {
    step: 2, label: "Normalization & Cross-LOB Taxonomy (Batch 2)",
    touchpointId: "T2", system: "AI Orchestrator", agentId: "roger_ai", layerId: "orchestration",
    description: "AI Orchestrator recognizes file schema and applies FirmFinancialTaxonomy (XLOB) classification. PDC invokes Orchestrator once per file. Supported: Trial Balance, K-1, W-2, 1099.",
    output: "Schema: Trial Balance v3.2 · XLOB classification applied · RunId: RUN-001 → DocumentId: DOC-001",
  },
  {
    step: 3, label: "Classification Enforcement (Batch 2A — GATE)",
    touchpointId: "T3", system: "PDC + AI Orchestrator", agentId: "roger_ai", layerId: "orchestration",
    description: "CRITICAL GATE: PDC enforces FirmTaxonomyId presence on every record. Records missing FirmTaxonomyId are rejected in full — no partial acceptance. PDC may not infer or generate classification values. Validation is deterministic and auditable.",
    output: "FirmTaxonomyId: GUID-8821 · ClassificationStatus: CLASSIFIED · Validation audit log created · 1,247 records accepted",
  },
  {
    step: 4, label: "PDC Canonical Persistence (Batch 2)",
    touchpointId: "T4", system: "PDC", agentId: "architecture", layerId: "pdc",
    description: "PDC persists normalized records as versioned canonical FinancialFact dataset. vNormalizedTb read contract exposes clean financial facts scoped by EntityId + PeriodStart + PeriodEnd + RunId (latest run by default).",
    output: "1,247 FinancialFact records persisted · RunId: RUN-001 → DocumentId: DOC-001 → EntityId: ENT-042 · vNormalizedTb available",
  },
  {
    step: 5, label: "Tax Domain Authority & Taxonomy (Batch 3)",
    touchpointId: "T7", system: "TDC", agentId: "qa", layerId: "tdc",
    description: "TDC establishes tax domain authority. TaxFormTemplates, FormLines, TaxTaxonomyAccounts, and MappingRules loaded and versioned. ConfidenceBandThresholds configured (GREEN/YELLOW/RED). Runs in parallel with Batch 2.",
    output: "TaxFormTemplates loaded · MappingRules versioned · ConfidenceBandThresholds: GREEN ≥ 85%, YELLOW 60–84%, RED < 60% · TDC ready for AI mapping",
  },
  {
    step: 6, label: "AI Tax Mapping Proposals (Batch 4 — Roger Activated)",
    touchpointId: "T8", system: "TDC", agentId: "roger_ai", layerId: "tdc",
    description: "Orchestrator delivers tax mapping proposals to TDC for the first time. Every account gets a proposal with confidence band and structured evidence. TDC Records API Contract (Roger Read Surface) goes live — this is the moment Roger becomes usable for practitioners.",
    output: "1,247 mapping proposals · GREEN: 847 · YELLOW: 312 · RED: 88 · Avg confidence: 91.2% · TDC Records API live",
  },
  {
    step: 7, label: "Entity Identity & Structure (Batch 5 — parallel to Batch 4)",
    touchpointId: "T9", system: "PDC", agentId: null, layerId: "pdc",
    description: "PDC establishes authoritative entity registry. EntityId is consistently used across ingestion, processing, and consumption layers. Ownership relationships, jurisdictions, and entity characteristics stored as governed, versioned facts. Closes EntityId open item from PI 1.",
    output: "EntityId: ENT-042 · ClientGroup: RSM-CG-001 · Ownership chain visible · DataSourceType: ADMIN_API_MANUAL · CEM sync ready",
  },
  {
    step: 8, label: "Practitioner Review, Adjustments & Lock (Batch 6)",
    touchpointId: "T9", system: "TDC", agentId: null, layerId: "tdc",
    description: "Practitioners can now do real work. Review tasks generated automatically from data state. Adjustments move through governed six-state lifecycle (DRAFT → SUBMITTED → APPROVED → APPLIED → LOCKED). Tax-ready records derived deterministically. Sign-off includes SHA-256 hash.",
    output: "Review tasks: 312 YELLOW + 88 RED generated · 847 accepted · 23 overridden · Tax-ready records derived · Sign-off: SHA-256 hash applied",
  },
  {
    step: 9, label: "Exception Handling (Batch 8)",
    touchpointId: "T10", system: "PDC + TDC", agentId: null, layerId: "tdc",
    description: "Failures are never silent. Every exception across ingestion, normalization, mapping, and workflow is structured, queryable, and tracked through to resolution. Exception state machine: OPEN → IN_PROGRESS → RESOLVED / CLOSED / SUPPRESSED.",
    output: "3 exceptions captured · Root cause logged · Remediation actions tracked · End-to-end traceability: Source → Exception → Resolution",
  },
  {
    step: 10, label: "Roger UI Output (Batch 4+)",
    touchpointId: "T11", system: "Roger UI", agentId: "demo_runner", layerId: "experience",
    description: "Roger UI surfaces verified tax results and full audit trail to practitioners (read-only). Displays GREEN/YELLOW/RED distribution, pending vs decided, full traceability to source. Roger is a read-only consumer — it does not write to PDC or TDC.",
    output: "Tax-ready records displayed · GREEN/YELLOW/RED distribution visible · Full lineage trace: source file → canonical record → tax decision · Audit trail accessible",
  },
];

// ─── BATCH ROADMAP v2.1 ───────────────────────────────────────────────────────

export type BatchStatus = "DELIVERED" | "IN_PROGRESS" | "NOT_STARTED" | "FUTURE" | "PARALLEL";

export interface BatchDefinition {
  id: string;
  name: string;
  title: string;
  pi: string;
  status: BatchStatus;
  sequencing: string;
  overview: string;
  rogerActivation?: string;
  keyOutcomes: string[];
  stories: { id: number; title: string; wmbt: string }[];
}

export const BATCH_ROADMAP: BatchDefinition[] = [
  {
    id: "Core",
    name: "Foundation Core",
    title: "Dev Infrastructure & Agent Tooling",
    pi: "PI 1",
    status: "DELIVERED",
    sequencing: "Prerequisite for all batches",
    overview: "Establishes the development infrastructure, environments, and agent tooling the entire platform depends on. Nothing is delivered to Roger from this batch — it is the prerequisite for everything that follows.",
    keyOutcomes: ["Code repository creation", "Code template deployment", "Copilot Agent and Blitzy configuration", "DEV environment in Azure"],
    stories: [],
  },
  {
    id: "Batch 1",
    name: "Batch 1",
    title: "File Ingestion & Initial Storage",
    pi: "PI 1",
    status: "DELIVERED",
    sequencing: "Sequential — foundation for all downstream batches",
    overview: "The platform can receive a client financial file, assign it a permanent immutable identifier, and establish the lineage anchor every downstream record traces back to.",
    rogerActivation: "Roger gains visibility into ingestion status before AI is ever invoked.",
    keyOutcomes: [
      "File uploaded via Tax Portal → Service Bus → PDC",
      "PDC creates: JobId, DocumentId, ClientId + EntityId captured, file lands in PDC, State = INGESTED",
      "IngestionStatus API returns: JobId-based status retrieval, EntityId, DocumentId, Timestamps",
    ],
    stories: [
      { id: 1, title: "Ingest File Event & Persist to PDC", wmbt: "IngestionJob and SourceFile records created. Required fields: JobId (GUID), DocumentId (immutable), ClientId, EntityId, SourceFileId, PeriodStart, PeriodEnd. TaxYear is NOT stored in PDC." },
      { id: 2, title: "Ingestion Status API", wmbt: "JobId-based status retrieval endpoint. Returns EntityId, DocumentId, Timestamps, and current ingestion state." },
    ],
  },
  {
    id: "Batch 2",
    name: "Batch 2",
    title: "Normalization & Cross-LOB Taxonomy",
    pi: "PI 1",
    status: "IN_PROGRESS",
    sequencing: "Runs in parallel with Batch 3",
    overview: "PDC transforms ingested files into clean, normalized financial facts using Firm Financial Taxonomy (XLOB) classification. PDC invokes the AI Orchestrator, which owns all file recognition, schema selection, normalization, and classification decisions.",
    rogerActivation: "vNormalizedTb read contract exposes clean financial facts for Roger consumption.",
    keyOutcomes: [
      "FileSchemas and FirmTaxonomy (XLOB) definitions are queryable and versioned",
      "A file moves through INGESTED → PROCESSING → READY with a RunId assigned",
      "Normalized Trial Balance data with XLOB classification is persisted and queryable",
      "vNormalizedTb returns clean financial facts for an EntityId + PeriodStart + PeriodEnd + RunId",
    ],
    stories: [
      { id: 1, title: "File Schemas & Firm Financial Taxonomy Reference Data (ID: 1349142)", wmbt: "PDC hosts the canonical schemas and firm taxonomy reference data the Orchestrator needs to identify, normalize, and classify files." },
      { id: 2, title: "Master Data Management — Firm Financial Taxonomy & File Schemas", wmbt: "Governance layer for managing taxonomy and schema definitions. Versioned, auditable, and queryable." },
      { id: 3, title: "EDGAR Corpus Reference Data", wmbt: "EDGAR corpus loaded as reference data to support AI training and normalization validation." },
      { id: 4, title: "Persist Normalized Records & Financial Facts", wmbt: "Normalized records returned from the Orchestrator are persisted in PDC with full lineage (RunId → DocumentId → EntityId)." },
      { id: 5, title: "Normalized TB Contract (Roger Read Surface) (ID: 1349150)", wmbt: "vNormalizedTb read contract exposes clean financial facts scoped by EntityId + PeriodStart + PeriodEnd + RunId (latest run by default)." },
    ],
  },
  {
    id: "Batch 2A",
    name: "Batch 2A",
    title: "Orchestrator Contract Enforcement & Classification",
    pi: "PI 1",
    status: "IN_PROGRESS",
    sequencing: "Sequential — must complete before Batch 2 outputs are valid",
    overview: "Establishes the contract enforcement layer between the Orchestrator and PDC. Ensures all classification data is returned, validated, and governed before normalization outputs are accepted. FirmTaxonomyId is required on every record — records without classification are rejected in full.",
    keyOutcomes: [
      "Submit a dataset with FirmTaxonomyId present — system accepts and ingests into PDC",
      "Submit a dataset missing FirmTaxonomyId — system rejects, logs failure, and halts processing",
      "Accepted records store FirmTaxonomyId at record level — classification queryable per normalized record with RunId lineage",
      "Validation audit log is queryable — every acceptance and rejection is traceable",
    ],
    stories: [
      { id: 1, title: "Enforce Classification Presence (FirmTaxonomyId) (ID: 1370843)", wmbt: "FirmTaxonomyId is required on every record. Records without classification are rejected in full — no partial acceptance. PDC may not infer or generate classification values." },
      { id: 2, title: "Bulk Insert vs Upsert Strategy", wmbt: "Defines the accepted ingestion strategy for bulk classification responses — ensures RunId lineage is maintained and validation outcomes are logged." },
    ],
  },
  {
    id: "Batch 3",
    name: "Batch 3",
    title: "Tax Domain Authority & Tax Taxonomy",
    pi: "PI 1",
    status: "DELIVERED",
    sequencing: "Runs in parallel with PDC Batch 2",
    overview: "Establishes TDC as the tax domain authority. TDC owns tax form definitions, form lines, return templates, firm tax taxonomy, mapping rules, and tax-specific reference data. Must be complete before AI tax mapping can begin.",
    keyOutcomes: [
      "TaxFormTemplates and FormLines are queryable by Jurisdiction and TaxYear",
      "TaxTaxonomyAccounts and MappingRules are available and versioned",
      "ConfidenceBandThresholds are configured (GREEN / YELLOW / RED)",
      "TDC is fully prepared for AI Tax Mapping (Batch 4)",
    ],
    stories: [
      { id: 1, title: "Tax Forms, Return Templates & Tax Taxonomy Reference Data", wmbt: "TaxFormTemplates and FormLines loaded and queryable by Jurisdiction and TaxYear. TaxTaxonomyAccounts and MappingRules available and versioned." },
      { id: 2, title: "Master Data Management — Tax Forms, Taxonomy & Mapping Rules", wmbt: "Admin team can load and manage tax reference data via Swagger. Governance layer for versioning and auditability." },
      { id: 3, title: "TDC Reference Data Read Contract (Orchestrator-facing) (ID: 1349152)", wmbt: "Read contract published for Orchestrator consumption. ConfidenceBandThresholds configured (GREEN / YELLOW / RED). TDC fully prepared for AI Tax Mapping (Batch 4)." },
    ],
  },
  {
    id: "Batch 4",
    name: "Batch 4",
    title: "AI Tax Mapping & Explainability",
    pi: "PI 2",
    status: "IN_PROGRESS",
    sequencing: "Sequential anchor — unblocks all PI 2 work",
    overview: "The Orchestrator delivers tax mapping proposals to TDC for the first time. Every account gets a proposal with a confidence band and structured evidence. Roger gets its primary TDC read contract — this is the moment the platform comes to life for a practitioner.",
    rogerActivation: "ROGER ACTIVATED — TDC Records API Contract (Roger Read Surface) goes live.",
    keyOutcomes: [
      "Every account has a mapping proposal with confidence score and band",
      "Proposals include structured evidence (rules, prior year, SEC peer, model version)",
      "Practitioners can accept / override / reject — decisions recorded immutably",
      "Roger can display: GREEN/YELLOW/RED distribution, pending vs decided, full traceability to source",
    ],
    stories: [
      { id: 1, title: "AI Mapping Proposals (ID: 1349156)", wmbt: "TDC receives and persists AI proposals as immutable records with confidence scores (GREEN/YELLOW/RED/UNRESOLVED) and structured evidence." },
      { id: 2, title: "Mapping Decisions (ID: 1349157)", wmbt: "Practitioners can accept, override, or reject proposals. Decisions are append-only, recorded immutably, and layered on top of proposals without mutation." },
      { id: 3, title: "Decision Audit & Event Publishing", wmbt: "All decision events are captured and published. Full audit trail from proposal through decision is maintained." },
      { id: 4, title: "TDC Records API Contract (Roger Read Surface) (ID: 1349158)", wmbt: "Roger's primary read contract is live. Exposes: GREEN/YELLOW/RED distribution, pending vs decided, full traceability to source." },
    ],
  },
  {
    id: "Batch 5",
    name: "Batch 5",
    title: "Entity Identity & Structure",
    pi: "PI 2",
    status: "IN_PROGRESS",
    sequencing: "Runs parallel to Batch 4",
    overview: "PDC establishes the authoritative entity registry — client groups and legal entities — and serves as the single source of truth for EntityId across the platform. Closes the EntityId open item from PI 1.",
    keyOutcomes: [
      "A client group with multiple legal entities is created and persisted in PDC",
      "Ownership relationships (parent/sub) are visible and queryable",
      "EntityId is consistently used across ingestion, processing, and consumption layers",
      "CEM client and legal entity data is synced and versioned in PDC",
    ],
    stories: [
      { id: 1, title: "Client Groups & Legal Entity Registry", wmbt: "PDC functions as system of record for entity identity. Each entity assigned a unique, immutable GUID-based EntityId linked to a ClientId." },
      { id: 2, title: "Ownership Chains, Jurisdictions & Entity Characteristics", wmbt: "Ownership, jurisdiction, and entity characteristic data loaded through governed Admin API. All records include DataSourceType field for traceability." },
      { id: 3, title: "Entity Identity Read Contract (PDC-facing) (ID: 1355868)", wmbt: "EntityId is consistently used across ingestion, processing, and consumption layers. Read contract published for Roger and all PDC consumers." },
      { id: 4, title: "CEM Integration & Sync", wmbt: "PDC supports governed synchronization of client and legal entity identity from CEM. Sync is idempotent — data is versioned in PDC." },
      { id: 5, title: "User Entitlement Sync & Read Contract", wmbt: "User-to-entity mappings are stored and retrievable. PDC does not act as an authorization system." },
    ],
  },
  {
    id: "Batch 6",
    name: "Batch 6",
    title: "Practitioner Review, Adjustments & Lock",
    pi: "PI 2",
    status: "IN_PROGRESS",
    sequencing: "Sequential — begins after Batch 4 closes",
    overview: "Practitioners can now do real work. Review tasks are generated automatically from data state. Adjustments move through a governed six-state lifecycle. Tax-ready records are derived deterministically. Sign-off is non-repudiable with SHA-256 hash.",
    keyOutcomes: [
      "Review tasks generated automatically from data state",
      "Practitioners can create, submit, approve, reject, apply, and lock book-to-tax adjustments",
      "Tax-ready records derived deterministically from mapping decisions and approved adjustments only",
      "Sign-off record includes SHA-256 hash over the complete tax-ready dataset",
      "Locked records are immutable — mutation attempts are rejected and logged",
    ],
    stories: [
      { id: 1, title: "Review Task Management & Entity Status (ID: 1350253)", wmbt: "Review tasks generated automatically from data state via confidence band threshold configuration. Entity review status: OPEN, IN_REVIEW, FINALIZED, AMENDED." },
      { id: 2, title: "Book-to-Tax Adjustments & Approval Routing (ID: 1350254)", wmbt: "Governed six-state lifecycle with rule-based approval routing stored as versioned configuration." },
      { id: 3, title: "Tax-Ready Record Derivation (ID: 1350255)", wmbt: "Tax-ready records derived deterministically from accepted decisions and approved adjustments only. UNRESOLVED records persisted as first-class outputs." },
      { id: 4, title: "Sign-Off, Lock & Entity Finalization", wmbt: "Sign-off requires all review tasks closed and all adjustments in APPROVED or APPLIED state. Includes SHA-256 hash over the signed dataset." },
    ],
  },
  {
    id: "Batch 7",
    name: "Batch 7",
    title: "Client Tax Profile & Eligibility",
    pi: "PI 2",
    status: "NOT_STARTED",
    sequencing: "Sequential — begins after Batch 6 closes",
    overview: "TDC serves as the system of record for tax profile and eligibility determinations. Eligibility acts as a downstream processing gate — entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state must not proceed to AI mapping or practitioner workflow.",
    keyOutcomes: [
      "A client entity is evaluated and assigned a tax profile (e.g., Form 1120)",
      "Eligibility rules are executed and visible (Must Have / Must Not Have / Flag & Review)",
      "Determination results are versioned, persisted, and fully auditable",
      "Entities in FLAG_AND_REVIEW or without a finalized determination are blocked from downstream workflow",
    ],
    stories: [
      { id: 1, title: "Corporate Tax Profile Reference Data (Form 1120)", wmbt: "Corporate tax profile data loaded, versioned, and governed. M-1 vs M-3 determination is governed and traceable." },
      { id: 2, title: "Non-Corporate Profile Reference Data (Partnerships, S-Corps, Trusts)", wmbt: "Non-corporate entity type profiles including pass-through treatment, entity-level tax applicability, and form assignments." },
      { id: 3, title: "Three-Tier Eligibility Model", wmbt: "Must Have / Must Not Have / Flag & Review. All rules explicitly defined and versioned." },
      { id: 4, title: "Client Tax Profile Lifecycle & Determination Records (ID: 1355882)", wmbt: "Determination and re-determination are explicitly triggered governed operations — not executed automatically. Re-determination produces a new versioned record." },
      { id: 5, title: "Controlled Group & Affiliated Group Determination", wmbt: "Controlled group and brother-sister corporate status derived from PDC ownership data via IRC §1563 and §1504 rules." },
      { id: 6, title: "Batch 7 Read Contract (Roger Read Surface)", wmbt: "Roger retrieves: eligibility status, rule reasoning, group status, and gate state through the read contract." },
    ],
  },
  {
    id: "Batch 8",
    name: "Batch 8",
    title: "Exceptions & Remediation",
    pi: "PI 2",
    status: "NOT_STARTED",
    sequencing: "PDC parallel to Batch 7 · TDC sequential after Batch 7",
    overview: "Failures are never silent. Every exception across ingestion, normalization, mapping, and workflow is structured, queryable, and tracked through to resolution. Roger can surface exception status to practitioners.",
    keyOutcomes: [
      "Exceptions generated during ingestion, mapping, or eligibility evaluation",
      "Exceptions visible with full context (entity, record, source)",
      "Practitioners can view, assign, and update exception status",
      "End-to-end traceability: Source data → Exception → Resolution → Final outcome",
    ],
    stories: [
      { id: 1, title: "PDC — Exception Record Structure & Failure Tracking (ID: 1355898)", wmbt: "PDC captures ingestion and normalization exceptions. State machine: OPEN → IN_PROGRESS → RESOLVED / CLOSED / SUPPRESSED." },
      { id: 2, title: "PDC — Flag Management & Remediation Actions", wmbt: "Practitioners can view, assign, and update exception status. Remediation actions are recorded and tracked to resolution." },
      { id: 3, title: "PDC — Root Cause Tracking & Resolution Records", wmbt: "Root cause captured and visible for each exception." },
      { id: 4, title: "PDC — Exceptions Read Contract", wmbt: "Exception data exposed via API for Roger consumption." },
      { id: 5, title: "TDC — Exception Record Structure & Failure Tracking (ID: 1355902)", wmbt: "TDC captures mapping, decision, and workflow exceptions. Invariant violation exceptions have a restricted path to SUPPRESSED requiring an authorized override record." },
      { id: 6, title: "TDC — Flag Management & Remediation Actions", wmbt: "Gateway pass-through failures use this framework — GATEWAY_SURFACE_FAILURE covers pass-through surface errors. B9 TDC Rollforward scope ON HOLD." },
      { id: 7, title: "TDC — Root Cause Tracking & Resolution Records", wmbt: "End-to-end traceability: Source data → Exception → Resolution → Final outcome." },
      { id: 8, title: "TDC — Exceptions Read Contract", wmbt: "TDC exception data exposed via API for Roger consumption." },
    ],
  },
  {
    id: "Batch 9",
    name: "Batch 9",
    title: "Roger Gateway & Governed Consumer Access Layer",
    pi: "PI 2",
    status: "IN_PROGRESS",
    sequencing: "PDC only — sequential after Batch 8 PDC closes. TDC B9 Rollforward ON HOLD — absorbed by B31.",
    overview: "ARCHITECTURAL CHANGE: B9 repurposed from IMS Integration & Prior Year Retrieval to Roger Gateway & Governed Consumer Access Layer (surface-not-store). PDC delivers the Ocelot gateway scaffolding plus IMS, CEM, and TIM pass-through surfaces. Roger and all future consumers access enterprise data through the gateway rather than calling underlying systems directly. eODS deferred. TDC B9 Rollforward scope absorbed by B31.",
    keyOutcomes: [
      "Ocelot gateway deployed as single consumer entry point for Roger and all consumers",
      "IMS, CEM, and TIM data surfaced via pass-through — not stored in PDC",
      "Gateway Read Contract published as versioned, additive-only consumer surface",
      "No consumer calls underlying systems directly — all access routed through gateway",
    ],
    stories: [
      { id: 1, title: "Ocelot Gateway Scaffolding & Governed Consumer Access Layer", wmbt: "Gateway deployed with authentication, routing, and governed consumer access controls. Published as the single consumer entry point." },
      { id: 2, title: "IMS Pass-Through Surface", wmbt: "Current-year and prior-year tax return data available via gateway pass-through. Data is surfaced only — no storage inside PDC." },
      { id: 3, title: "CEM Pass-Through Surface", wmbt: "Client authorization and client-to-user mappings available through gateway pass-through. No storage in PDC." },
      { id: 4, title: "TIM Pass-Through Surface", wmbt: "Engagement metadata, deliverables, due dates, acceptance records, and continuance information available via gateway pass-through." },
      { id: 5, title: "Gateway Read Contract Publication (Roger Consumer Surface)", wmbt: "Versioned consumer contract published for Roger. Contract is additive-only. Published contract becomes the authoritative consumer surface." },
    ],
  },
  {
    id: "Batch 10",
    name: "Batch 10",
    title: "Return Assembly, Filing & Lineage Closure",
    pi: "PI 3",
    status: "FUTURE",
    sequencing: "Sequential — begins after Batch 6 closes",
    overview: "TDC assembles tax returns from locked tax-ready records, enforces cross-schedule validation, produces an immutable filing record, and closes end-to-end lineage. Every form line traces to a locked tax-ready record.",
    keyOutcomes: [
      "Assemble a return from tax-ready records",
      "Lock and generate filing record — demonstrate immutable return snapshot",
      "Roger: full return view and filing status displayed",
      "Execute lineage trace: click from return → tax record → source document",
    ],
    stories: [
      { id: 1, title: "Return Assembly & Cross-Schedule Validation", wmbt: "TDC assembles returns from locked tax-ready records using versioned return templates. BLOCKING rules must pass; WARNING rules surface without blocking." },
      { id: 2, title: "Filing Record", wmbt: "Immutable filing record produced with a denormalized filed amounts snapshot. FILED status assigned when filing record is created." },
      { id: 3, title: "Return Output Contracts (Roger Read Surface)", wmbt: "Roger surfaces the complete return assembly, filing status, and full lineage chain." },
      { id: 4, title: "IMS Outbound Contract Publication (gated on IMS readiness)", wmbt: "TDC delivers directly to IMS — synchronous HTTP 200 acknowledgment, idempotent via delivery_id." },
      { id: 5, title: "Cross-Layer Lineage View", wmbt: "Cross-layer lineage view closes end-to-end traceability from source file through to filing confirmation, spanning TDC and PDC." },
    ],
  },
];

// ─── BLITZY DELIVERY ALIGNMENT ────────────────────────────────────────────────

export type GuaranteeType = "SCHEMA" | "LINEAGE" | "CONTRACT" | "RUNTIME";

export interface StoryGuarantee {
  storyId: string;
  title: string;
  guaranteeType: GuaranteeType;
  gate: string;
  platformGuarantee: string;
  batchId: string;
  status: "COMPLETE" | "IN_PROGRESS" | "PLANNED";
}

export const STORY_GUARANTEES: StoryGuarantee[] = [
  {
    storyId: "Story-1",
    title: "Canonical Schema Definition",
    guaranteeType: "SCHEMA",
    gate: "G1",
    platformGuarantee: "All financial records conform to the canonical schema. Required fields, types, and governance fields (JobId, RunId, DocumentId, EntityId, PeriodStart, PeriodEnd) are enforced at ingestion. TaxYear is derived in TDC — never stored in PDC.",
    batchId: "Batch 1",
    status: "COMPLETE",
  },
  {
    storyId: "Story-2",
    title: "Lineage Provenance Capture",
    guaranteeType: "LINEAGE",
    gate: "G3",
    platformGuarantee: "Every canonical record has a complete, verifiable provenance chain from source file through all AI transformations to PDC persistence. RunId → DocumentId → EntityId chain is intact.",
    batchId: "Batch 1",
    status: "IN_PROGRESS",
  },
  {
    storyId: "Story-3",
    title: "FirmTaxonomyId Enforcement (Batch 2A)",
    guaranteeType: "SCHEMA",
    gate: "G2",
    platformGuarantee: "FirmTaxonomyId is REQUIRED on all PDC canonical records. Records missing FirmTaxonomyId are rejected in full. PDC may not infer or generate classification values. Validation is deterministic and auditable. READY signal blocked if any record has ClassificationStatus = UNCLASSIFIED.",
    batchId: "Batch 2A",
    status: "IN_PROGRESS",
  },
  {
    storyId: "Story-4",
    title: "API Contract Publication",
    guaranteeType: "CONTRACT",
    gate: "G4",
    platformGuarantee: "All platform APIs conform to published contracts. TDC Records API Contract (Roger Read Surface — Batch 4) is the primary Roger activation contract. Consumer integration is validated. Version compatibility is maintained.",
    batchId: "Batch 4",
    status: "IN_PROGRESS",
  },
  {
    storyId: "Story-5",
    title: "Invariant Protection",
    guaranteeType: "SCHEMA",
    gate: "G2",
    platformGuarantee: "LOCKED records cannot be overwritten. Lifecycle transitions are enforced. Adversarial scenarios are tested and blocked. TDC invariant violation exceptions require an authorized override record before suppression.",
    batchId: "Batch 2",
    status: "IN_PROGRESS",
  },
  {
    storyId: "Story-6",
    title: "Eligibility Gate Enforcement",
    guaranteeType: "RUNTIME",
    gate: "G4",
    platformGuarantee: "Entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state must not proceed to AI mapping or practitioner workflow. Eligibility determination is governed, versioned, and fully auditable.",
    batchId: "Batch 7",
    status: "PLANNED",
  },
  {
    storyId: "Story-7",
    title: "End-to-End Runtime Validation",
    guaranteeType: "RUNTIME",
    gate: "G4",
    platformGuarantee: "The full T1–T11 runtime journey executes without interruption. Lineage is traceable end-to-end. Tax decisions are immutable and auditable. Roger surfaces verified results as a read-only consumer.",
    batchId: "Batch 10",
    status: "PLANNED",
  },
];

// ─── ARCHITECTURE GUARDRAILS ─────────────────────────────────────────────────

export interface ArchitectureGuardrail {
  id: string;
  rule: string;
  detail: string;
}

export const ARCHITECTURE_GUARDRAILS: ArchitectureGuardrail[] = [
  { id: "G-01", rule: "Tax Portal is the single ingestion gate",
    detail: "All ingestion paths (Direct Upload, Roger Web App, Phoenix, Duo/DSDMS) converge through Tax Portal. No file enters the platform without Tax Portal enforcement of the ingestion contract (EntityId, PeriodStart, PeriodEnd)." },
  { id: "G-02", rule: "AI Orchestrator runs once per file",
    detail: "Stateless compute — invoked exactly once by PDC per file. Does not own data and does not persist records. Re-invocation requires explicit governance approval and a new doc_id lineage chain." },
  { id: "G-03", rule: "PDC owns cross-LOB truth",
    detail: "PDC (Phoenix Data Consolidation) is the first system of record for canonical financial data across all lines of business. TaxYear is NOT stored in PDC — it is derived in TDC from PeriodStart/PeriodEnd." },
  { id: "G-04", rule: "TDC owns tax truth",
    detail: "TDC (Tax Data Consolidation) is the authoritative source for all tax mapping proposals, decisions, and TAX_READY transitions. All decisions are append-only and immutable." },
  { id: "G-05", rule: "Roger only reads and surfaces user decisions",
    detail: "Roger Web App is a read-only consumer. It does not write to PDC or TDC directly. Practitioner decisions are submitted through a governed API." },
  { id: "G-06", rule: "FirmTaxonomyId is REQUIRED on all PDC canonical records",
    detail: "Every FinancialFact record persisted in PDC must carry a FirmTaxonomyId sourced from the Taxonomy Service. PDC rejects records missing FirmTaxonomyId once Batch 2A enforcement is active." },
  { id: "G-07", rule: "Eligibility gates downstream processing",
    detail: "Entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state must not proceed to AI mapping or practitioner workflow. Eligibility determination (Batch 7) is a blocking gate." },
];

// ─── SYSTEM OWNERSHIP ────────────────────────────────────────────────────────

export interface SystemOwnership {
  system: string;
  owner: string;
  role: string;
  sor: boolean;
  layer: string;
  colorHex: string;
}

export const SYSTEM_OWNERSHIP: SystemOwnership[] = [
  { system: "Tax Portal",       owner: "Ingestion / Platform", role: "Ingestion gate and document identifier authority",                                    sor: false, layer: "ingestion",     colorHex: "#7C3AED" },
  { system: "Service Bus",      owner: "Platform",             role: "Event backbone between publishers and consumers",                                      sor: false, layer: "ingestion",     colorHex: "#6366F1" },
  { system: "PDC",              owner: "DCT",                  role: "Phoenix Data Consolidation — Cross-LOB data authority and first system of record",     sor: true,  layer: "pdc",           colorHex: "#059669" },
  { system: "TDC",              owner: "DCT",                  role: "Tax Data Consolidation — Tax domain authority and tax system of record",               sor: true,  layer: "tdc",           colorHex: "#DC2626" },
  { system: "AI Orchestrator",  owner: "Roger team",           role: "Stateless compute performing recognition, normalization, and mapping (once per file)", sor: false, layer: "orchestration", colorHex: "#2563EB" },
  { system: "Roger Web App",    owner: "Roger team",           role: "User interface for practitioner review — read-only consumer",                          sor: false, layer: "experience",    colorHex: "#DB2777" },
  { system: "Taxonomy Service", owner: "DCT / TDC",            role: "Owns firm taxonomy hierarchy, versioning, and FirmTaxonomyId assignment",              sor: true,  layer: "tdc",           colorHex: "#7C3AED" },
  { system: "IMS",              owner: "Platform / External",  role: "Pass-through data surface via B9 Gateway (not stored in PDC) and filing delivery target (Batch 10)",               sor: false, layer: "ingestion",     colorHex: "#64748B" },
  { system: "CEM",              owner: "Platform",             role: "Client and legal entity identity source for PDC sync (Batch 5)",                       sor: false, layer: "ingestion",     colorHex: "#0891B2" },
];

// ─── ENTRY POINTS ─────────────────────────────────────────────────────────────

export interface EntryPoint {
  name: string;
  description: string;
}

export const ENTRY_POINTS: EntryPoint[] = [
  { name: "Direct Upload",  description: "User uploads file directly via web interface" },
  { name: "Roger Web App",  description: "File submitted through Roger practitioner interface" },
  { name: "Phoenix",        description: "File sourced from Phoenix ERP system" },
  { name: "Duo / DSDMS",    description: "File sourced from Duo or Document Storage DMS" },
];

export const INGESTION_CONTRACT = {
  enforcer: "Tax Portal",
  requiredFields: ["EntityId", "PeriodStart", "PeriodEnd"],
  rejectionRule: "Files missing required fields are rejected before reaching the Service Bus. TaxYear is NOT a required ingestion field — it is derived in TDC from PeriodStart/PeriodEnd.",
};

// ─── ADR REGISTRY ─────────────────────────────────────────────────────────────

export type ADRStatus = "ACCEPTED" | "PROPOSED" | "SUPERSEDED";

export interface ADR {
  id: string;
  title: string;
  decision: string;
  status: ADRStatus;
  date: string;
  impact: "High" | "Medium" | "Low";
}

export const ADR_REGISTRY: ADR[] = [
  {
    id: "ADR-01", title: "Tax Portal is the single ingestion gate",
    decision: "All file ingestion paths must converge through Tax Portal. No file may enter the platform without Tax Portal enforcement of the ingestion contract (EntityId, PeriodStart, PeriodEnd).",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-02", title: "PDC (Phoenix Data Consolidation) is the cross-LOB system of record",
    decision: "PDC is the authoritative source for canonical financial data across all lines of business. TaxYear is NOT stored in PDC — it is derived in TDC from PeriodStart/PeriodEnd. No other system may claim canonical financial authority.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-03", title: "AI Orchestrator runs once per file",
    decision: "The AI Orchestrator is invoked exactly once per file by PDC. Re-invocation requires explicit governance approval and a new doc_id lineage chain. Orchestrator is stateless compute — it does not own data.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-04", title: "TDC (Tax Data Consolidation) is the tax system of record",
    decision: "All tax mapping proposals, practitioner decisions, and TAX_READY transitions are persisted exclusively in TDC. All decisions are append-only and immutable. Roger Web App is read-only.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-05", title: "Roger Web App is a read-only consumer",
    decision: "Roger Web App surfaces data from PDC and TDC for practitioner review. It does not write to either system. Practitioner decisions are submitted through a governed API.",
    status: "ACCEPTED", date: "2026-03-01", impact: "Medium",
  },
  {
    id: "ADR-06", title: "FirmTaxonomyId is REQUIRED on all PDC canonical records (Batch 2A)",
    decision: "Every FinancialFact record persisted in PDC must carry a FirmTaxonomyId sourced from the Taxonomy Service. The AI Orchestrator is responsible for resolving and returning FirmTaxonomyId with every record. PDC must reject records missing FirmTaxonomyId once Batch 2A enforcement is active. The READY signal must not be emitted if any record has ClassificationStatus = UNCLASSIFIED.",
    status: "ACCEPTED", date: "2026-04-28", impact: "High",
  },
  {
    id: "ADR-07", title: "Eligibility gates downstream processing (Batch 7)",
    decision: "Entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state must not proceed to AI mapping or practitioner workflow. Eligibility determination is a blocking gate governed by the three-tier model (Must Have / Must Not Have / Flag & Review).",
    status: "PROPOSED", date: "2026-04-28", impact: "High",
  },
];

// ─── OPEN ITEMS ───────────────────────────────────────────────────────────────

export type OpenItemPriority = "High" | "Medium" | "Low";

export interface OpenItem {
  id: string;
  title: string;
  description: string;
  priority: OpenItemPriority;
  owner: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED";
}

export const OPEN_ITEMS: OpenItem[] = [
  {
    id: "OI-01", title: "Entity identification at ingestion",
    description: "The mechanism for resolving EntityId at Tax Portal ingestion is not yet defined. Batch 5 (Entity Identity & Structure) addresses this by establishing PDC as the authoritative entity registry with a governed Admin API interim approach.",
    priority: "High", owner: "Platform Architecture", status: "IN_REVIEW",
  },
  {
    id: "OI-02", title: "Future DMS strategy",
    description: "The long-term Document Management System strategy (Duo vs. DSDMS vs. consolidated) has not been decided. Impacts ingestion path design.",
    priority: "Medium", owner: "Platform Architecture", status: "OPEN",
  },
  {
    id: "OI-03", title: "Client adjustment tables",
    description: "The design for client-specific adjustment tables that modify canonical financial data in PDC is not yet specified. Batch 6 introduces book-to-tax adjustments through a governed six-state lifecycle.",
    priority: "Medium", owner: "DCT Architecture", status: "IN_REVIEW",
  },
  {
    id: "OI-04", title: "FirmTaxonomyId enforcement gap — Batch 2A",
    description: "The AI Orchestrator is NOT currently returning FirmTaxonomyId with normalized records. This is the blocking gap addressed by Batch 2A (Orchestrator Contract Enforcement & Classification). PDC cannot enforce FirmTaxonomyId as REQUIRED until the Orchestrator contract is updated. Batch 2 outputs are NOT valid until Batch 2A is complete.",
    priority: "High", owner: "DCT Architecture + Roger Team", status: "OPEN",
  },
  {
    id: "OI-05", title: "IMS readiness for Batch 9 Gateway and Batch 10",
    description: "IMS outbound contract (Batch 10) is gated on IMS readiness. B9 Gateway surfaces IMS data via pass-through — not stored in PDC. IMS pass-through readiness must be confirmed before B9 Gateway Read Contract can be published.",
    priority: "High", owner: "Platform Architecture + IMS Team", status: "OPEN",
  },
];

// ─── DEPENDENCIES ─────────────────────────────────────────────────────────────

export type DependencyStatus = "IN_PROGRESS" | "PLANNED" | "COMPLETE" | "BLOCKED";

export interface Dependency {
  id: string;
  name: string;
  description: string;
  owner: string;
  status: DependencyStatus;
  blocking: boolean;
}

export const DEPENDENCIES: Dependency[] = [
  {
    id: "DEP-01", name: "Tax Portal integration",
    description: "Tax Portal must expose an ingestion API that accepts file uploads, validates EntityId, PeriodStart, and PeriodEnd, assigns JobId/DocumentId, and publishes to Service Bus.",
    owner: "Ingestion / Platform team", status: "IN_PROGRESS", blocking: true,
  },
  {
    id: "DEP-02", name: "DSDMS abstraction layer",
    description: "A DSDMS abstraction layer is required to normalize file retrieval across Duo and DSDMS source systems before Tax Portal ingestion.",
    owner: "Platform Architecture", status: "PLANNED", blocking: false,
  },
  {
    id: "DEP-03", name: "Service Bus configuration",
    description: "Service Bus topics and subscriptions must be configured for: NewFileEvent (Tax Portal → PDC), READY event (PDC → TDC), and Adjustment event (Roger → PDC/TDC).",
    owner: "Platform team", status: "IN_PROGRESS", blocking: true,
  },
  {
    id: "DEP-04", name: "Taxonomy Service API contract (Batch 2A blocker)",
    description: "The Taxonomy Service must expose a read-only API that returns FirmTaxonomyId (GUID) and ClassificationStatus per record. This is a BLOCKING dependency for Batch 2A. PDC cannot enforce FirmTaxonomyId as REQUIRED until this contract is live.",
    owner: "DCT / TDC team", status: "BLOCKED", blocking: true,
  },
  {
    id: "DEP-05", name: "CEM integration for entity sync (Batch 5)",
    description: "CEM must support governed synchronization of client and legal entity identity to PDC. Sync must be idempotent — data is versioned in PDC. Required for Batch 5 Entity Identity & Structure.",
    owner: "Platform team", status: "PLANNED", blocking: false,
  },
  {
    id: "DEP-06", name: "IMS Gateway pass-through (Batch 9) + IMS outbound (Batch 10)",
    description: "B9 Gateway surfaces IMS data via pass-through (surface-not-store). IMS outbound delivery contract (Batch 10) must be published. Batch 10 IMS outbound is gated on IMS readiness — manual admin API load path available as interim.",
    owner: "IMS Team + Platform", status: "PLANNED", blocking: false,
  },
];

// ─── ARCH METADATA ────────────────────────────────────────────────────────────

export const ARCH_METADATA = {
  title: "DCT Roger End-to-End Data Flow",
  version: "2.1.0",
  sourceOfTruth: "DCT Batch Roadmap v2.1 · April 28, 2026",
  lastUpdated: "2026-04-28",
  authority: "DCT Platform Architecture Team | RSM | CATT",
  visioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663402976610/6z8sjWGC7ihkVcDSZGqeBn/DCT_Platform_Architecture_v2_c18d128a.png",
  layerCount: 6,
  touchpointCount: 11,
  agentCount: 5,
  adrCount: 7,
  openItemCount: 5,
  dependencyCount: 6,
  batchCount: 24,
  roadmapVersion: "v2.1 · April 28, 2026",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getAgent = (id: string) => AGENTS.find(a => a.id === id);
export const getLayer = (id: string) => PLATFORM_LAYERS.find(l => l.id === id);
export const getGate = (id: string) => GATES.find(g => g.id === id);
export const getTouchpoint = (id: string) => TOUCHPOINTS.find(t => t.id === id);
export const getBatch = (id: string) => BATCH_ROADMAP.find(b => b.id === id);

export const GUARANTEE_COLORS: Record<GuaranteeType, string> = {
  SCHEMA: "bg-blue-100 text-blue-800 border-blue-200",
  LINEAGE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CONTRACT: "bg-amber-100 text-amber-800 border-amber-200",
  RUNTIME: "bg-purple-100 text-purple-800 border-purple-200",
};

export const STATUS_COLORS: Record<string, string> = {
  COMPLETE: "bg-emerald-100 text-emerald-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  PENDING: "bg-amber-100 text-amber-800",
  PLANNED: "bg-slate-100 text-slate-600",
  BLOCKED: "bg-red-100 text-red-800",
  PASSED: "bg-emerald-100 text-emerald-800",
  PENDING_REVIEW: "bg-amber-100 text-amber-800",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  RUNNING: "bg-blue-100 text-blue-800",
  IDLE: "bg-slate-100 text-slate-600",
  STANDBY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  NOT_STARTED: "bg-slate-100 text-slate-600",
  FUTURE: "bg-slate-100 text-slate-500",
  PARALLEL: "bg-blue-100 text-blue-800",
};
