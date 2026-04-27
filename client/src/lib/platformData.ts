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
 * - Blitzy delivery alignment (story-to-guarantee mapping)
 */

// ─── PLATFORM LAYERS ─────────────────────────────────────────────────────────

export interface PlatformLayer {
  id: string;
  order: number;
  label: string;
  sublabel: string;
  authority: string;
  isSystemOfRecord: boolean;
  color: string;        // Tailwind bg class
  borderColor: string;  // Tailwind border class
  textColor: string;    // Tailwind text class
  badgeColor: string;   // Badge bg
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
    sublabel: "PDC — Canonical Financial Dataset",
    authority: "Canonical Financial Authority",
    isSystemOfRecord: true,
    color: "bg-emerald-700",
    borderColor: "border-emerald-600",
    textColor: "text-emerald-100",
    badgeColor: "bg-emerald-500",
    systems: ["PDC", "Phoenix Data Cloud"],
    agentIds: ["architecture", "qa"],
  },
  {
    id: "tdc",
    order: 4,
    label: "Tax Domain Authority",
    sublabel: "TDC — Tax Decision Core",
    authority: "Tax Decision Authority",
    isSystemOfRecord: true,
    color: "bg-red-700",
    borderColor: "border-red-600",
    textColor: "text-red-100",
    badgeColor: "bg-red-500",
    systems: ["TDC", "Tax Data Core"],
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
    lastExecution: "2026-03-11 09:14:22",
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
    layerLabel: "Financial Data Authority (PDC)",
    status: "ACTIVE",
    lastExecution: "2026-03-11 10:02:47",
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
    layerLabel: "Financial Data Authority (PDC)",
    status: "RUNNING",
    lastExecution: "2026-03-11 11:45:03",
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
    lastExecution: "2026-03-11 08:30:00",
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
    lastExecution: "2026-03-11 07:55:18",
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
  },
  {
    id: "T2", label: "T2", name: "File Structure Recognition",
    system: "AI Orchestrator", layerId: "orchestration", layerLabel: "AI Orchestration Layer",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G1", status: "COMPLETE", isAuthorityAction: false,
    inputs: ["Routed file from T1", "doc_id"],
    outputs: ["Schema Recognition Report", "File type classification", "Validation result", "FirmTaxonomyId (proposed — pending Batch 2A enforcement)", "ClassificationStatus (CLASSIFIED | UNCLASSIFIED | OVERRIDE)"],
    responsibility: "Identify file schema, classify financial data model, validate format conformance. Batch 2A: Orchestrator must return FirmTaxonomyId with every record.",
  },
  {
    id: "T3", label: "T3", name: "Financial Data Extraction",
    system: "AI Orchestrator", layerId: "orchestration", layerLabel: "AI Orchestration Layer",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G1", status: "IN_PROGRESS", isAuthorityAction: false,
    inputs: ["Recognized file from T2", "Schema Recognition Report"],
    outputs: ["Normalized financial records", "Normalization Record", "Extraction log", "FirmTaxonomyId per record (from Taxonomy Service via PDC API)", "ClassificationStatus per record"],
    responsibility: "Extract financial data, apply cross-LOB normalization to canonical model. Each record must carry FirmTaxonomyId sourced from the Taxonomy Service.",
  },
  {
    id: "T4", label: "T4", name: "Canonical Normalization (PDC)",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G2", status: "PENDING", isAuthorityAction: true,
    inputs: ["Normalized records from T3", "Normalization Record"],
    outputs: ["Canonical Record Set", "PDC persistence confirmation", "Version record", "FirmTaxonomyId (REQUIRED — stored on every FinancialFact)", "ClassificationStatus (REQUIRED — CLASSIFIED | UNCLASSIFIED | OVERRIDE)"],
    responsibility: "Persist normalized records as versioned canonical financial dataset. FirmTaxonomyId is a REQUIRED field on all PDC FinancialFact records (Batch 2A enforcement pending).",
  },
  {
    id: "T5", label: "T5", name: "Lineage Capture",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G3", status: "PENDING", isAuthorityAction: false,
    inputs: ["Canonical Record Set from T4", "Transformation audit log"],
    outputs: ["Lineage Record", "Provenance graph nodes and edges"],
    responsibility: "Capture full provenance graph from source file through AI transformations to canonical records",
  },
  {
    id: "T6", label: "T6", name: "Canonical Dataset Establishment",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC)",
    agentId: "architecture", agentName: "Architecture Agent",
    gate: "G3", status: "PLANNED", isAuthorityAction: true,
    inputs: ["Lineage Record from T5", "Schema Lock Certificate (G1)"],
    outputs: ["Dataset Authority Certificate", "Locked canonical dataset", "Version manifest"],
    responsibility: "Version, lock, and establish authority for canonical dataset",
  },
  {
    id: "T7", label: "T7", name: "READY Signal to TDC",
    system: "PDC", layerId: "pdc", layerLabel: "Financial Data Authority (PDC)",
    agentId: "qa", agentName: "QA Agent",
    gate: "G3", status: "PLANNED", isAuthorityAction: false,
    inputs: ["Dataset Authority Certificate from T6", "FirmTaxonomyId validation check (all records must be CLASSIFIED before READY signal)"],
    outputs: ["Data Readiness Signal event", "TDC trigger", "AI Mapping Layer trigger"],
    responsibility: "Emit Data Readiness Signal to notify TDC and AI Mapping Layer. READY signal must not be emitted if any record has ClassificationStatus = UNCLASSIFIED (Batch 2A enforcement).",
  },
  {
    id: "T8", label: "T8", name: "AI Tax Mapping Proposals",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC)",
    agentId: "roger_ai", agentName: "Roger AI Agent",
    gate: "G4", status: "PLANNED", isAuthorityAction: false,
    inputs: ["Data Readiness Signal from T7", "Canonical dataset from PDC"],
    outputs: ["Mapping Proposal Set", "Confidence scores", "Proposal rationale"],
    responsibility: "Generate AI-assisted tax mapping proposals for practitioner review",
  },
  {
    id: "T9", label: "T9", name: "Practitioner Tax Review",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC)",
    agentId: null, agentName: null,
    gate: "G4", status: "PLANNED", isAuthorityAction: false,
    inputs: ["Mapping Proposal Set from T8", "Tax domain invariants (G2)"],
    outputs: ["Tax Review Record", "Practitioner validation events", "Approved/modified mappings"],
    responsibility: "Practitioner review and validation of AI mapping proposals against domain invariants",
  },
  {
    id: "T10", label: "T10", name: "Tax Decision Persistence",
    system: "TDC", layerId: "tdc", layerLabel: "Tax Domain Authority (TDC)",
    agentId: null, agentName: null,
    gate: "G4", status: "PLANNED", isAuthorityAction: true,
    inputs: ["Validated mappings from T9", "Tax Review Record"],
    outputs: ["Tax Decision Record", "Immutable decision log", "Audit trail entry"],
    responsibility: "Persist validated tax decisions as immutable, auditable records",
  },
  {
    id: "T11", label: "T11", name: "UI Consumption",
    system: "Roger UI", layerId: "experience", layerLabel: "Practitioner Experience Layer",
    agentId: "demo_runner", agentName: "Demo Runner Agent",
    gate: "G4", status: "PLANNED", isAuthorityAction: false,
    inputs: ["Tax Decision Record from T10", "Canonical dataset from PDC"],
    outputs: ["Practitioner view", "Audit trail display", "Lineage trace UI"],
    responsibility: "Surface verified tax results and full audit trail to practitioners (read-only)",
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
    description: "Validates schema definition, data constraints, required fields, type definitions, relational constraints, and governance fields (job_id, version, timestamps).",
    status: "PENDING_REVIEW",
    touchpointIds: ["T1", "T2", "T3"],
    artifacts: [
      { name: "Schema Definition Document", status: "ISSUED", owner: "Architecture Lead" },
      { name: "Data Constraint Validation Report", status: "ISSUED", owner: "QA Agent" },
      { name: "Schema Lock Certificate", status: "PENDING", owner: "Architecture Lead" },
      { name: "Governance Field Audit", status: "PENDING", owner: "QA Agent" },
      { name: "Schema Review Sign-off", status: "MISSING", owner: "Delivery Lead" },
    ],
    exitCondition: "Schema Lock Certificate issued and signed off by Architecture Lead and Delivery Lead",
    owner: "Architecture Lead",
  },
  {
    id: "G2", label: "G2", name: "Invariant Lock",
    description: "Defines and verifies adversarial test scenarios protecting platform invariants: LOCKED records cannot be overwritten, lineage must remain intact, lifecycle transitions must be enforced.",
    status: "PLANNED",
    touchpointIds: ["T4"],
    artifacts: [
      { name: "Invariant Definition Register", status: "MISSING", owner: "QA Agent" },
      { name: "Adversarial Test Suite", status: "MISSING", owner: "QA Agent" },
      { name: "LOCKED Record Protection Proof", status: "MISSING", owner: "QA Agent" },
      { name: "Lifecycle Transition Validation", status: "MISSING", owner: "Architecture Agent" },
    ],
    exitCondition: "All invariant tests pass with zero failures. Adversarial test suite approved by Lead Dev.",
    owner: "Tax Domain Lead + Architecture Lead",
  },
  {
    id: "G3", label: "G3", name: "Lineage Closure",
    description: "Validates end-to-end traceability: source file → canonical record → tax decision → practitioner output. Full provenance graph must be complete and verifiable.",
    status: "PLANNED",
    touchpointIds: ["T5", "T6", "T7"],
    artifacts: [
      { name: "Lineage Graph Completeness Report", status: "MISSING", owner: "Architecture Agent" },
      { name: "Source-to-Canonical Trace", status: "MISSING", owner: "QA Agent" },
      { name: "Cross-System Continuity Proof", status: "MISSING", owner: "Architecture Agent" },
      { name: "Lineage Closure Certificate", status: "MISSING", owner: "Architecture Lead" },
      { name: "Provenance Audit Log", status: "MISSING", owner: "QA Agent" },
    ],
    exitCondition: "Lineage Closure Certificate issued. Full chain from source file to Roger UI verified.",
    owner: "Architecture Lead",
  },
  {
    id: "G4", label: "G4", name: "Contract Publication",
    description: "Validates API behavior and data contracts: endpoint response structures, schema conformance, error behavior, version compatibility, and consumer integration.",
    status: "PLANNED",
    touchpointIds: ["T8", "T9", "T10", "T11"],
    artifacts: [
      { name: "API Contract Specification", status: "MISSING", owner: "Architecture Agent" },
      { name: "Contract Compliance Report", status: "MISSING", owner: "QA Agent" },
      { name: "Consumer Integration Test Results", status: "MISSING", owner: "QA Agent" },
      { name: "Version Compatibility Matrix", status: "MISSING", owner: "Architecture Agent" },
      { name: "Contract Publication Certificate", status: "MISSING", owner: "Business Owner" },
    ],
    exitCondition: "Contract Publication Certificate issued. All consumer integration tests pass.",
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
    step: 1, label: "Client uploads Trial Balance",
    touchpointId: "T1", system: "Phoenix / DMS", agentId: "analyst", layerId: "ingestion",
    description: "Client uploads trial balance file from ERP system. Phoenix assigns immutable doc_id and logs intake record.",
    output: "doc_id: TB-2026-0311-001 · Intake Log Record created",
  },
  {
    step: 2, label: "AI recognizes schema",
    touchpointId: "T2", system: "AI Orchestrator", agentId: "roger_ai", layerId: "orchestration",
    description: "Roger AI Recognizer Agent analyzes file structure, identifies schema pattern, validates format conformance.",
    output: "Schema: Trial Balance v3.2 · Confidence: 98.4% · Format: XLSX",
  },
  {
    step: 3, label: "Data normalized and canonicalized",
    touchpointId: "T3", system: "AI Orchestrator", agentId: "roger_ai", layerId: "orchestration",
    description: "Roger AI Normalization Agent extracts financial data and applies cross-LOB normalization to canonical model.",
    output: "1,247 records normalized · 3 LOBs mapped · Normalization Record issued",
  },
  {
    step: 4, label: "Canonical dataset persisted in PDC",
    touchpointId: "T4", system: "PDC", agentId: "architecture", layerId: "pdc",
    description: "PDC persists normalized records as versioned canonical financial dataset. Architecture Agent validates schema conformance.",
    output: "Canonical Record Set v1.0 · PDC-2026-0311-001 · Schema Lock applied",
  },
  {
    step: 5, label: "Lineage captured",
    touchpointId: "T5", system: "PDC", agentId: "architecture", layerId: "pdc",
    description: "Full provenance graph captured from source file through AI transformations to canonical records.",
    output: "Lineage Record LR-001 · 14 provenance nodes · 13 edges captured",
  },
  {
    step: 6, label: "Dataset published to TDC",
    touchpointId: "T7", system: "PDC", agentId: "qa", layerId: "pdc",
    description: "PDC emits Data Readiness Signal. QA Agent validates lineage closure before signal is sent.",
    output: "READY Signal emitted · TDC notified · AI Mapping Layer triggered",
  },
  {
    step: 7, label: "Roger AI proposes tax mappings",
    touchpointId: "T8", system: "TDC", agentId: "roger_ai", layerId: "tdc",
    description: "Roger AI Mapping Agent generates AI-assisted tax mapping proposals with confidence scores for practitioner review.",
    output: "847 mapping proposals · Avg confidence: 91.2% · 23 flagged for review",
  },
  {
    step: 8, label: "Practitioner validates mappings",
    touchpointId: "T9", system: "TDC", agentId: null, layerId: "tdc",
    description: "Tax practitioner reviews AI proposals, validates against domain invariants, approves or modifies mappings.",
    output: "824 approved · 23 modified · Tax Review Record TR-001 issued",
  },
  {
    step: 9, label: "Tax decisions generated",
    touchpointId: "T10", system: "TDC", agentId: null, layerId: "tdc",
    description: "Validated tax decisions persisted as immutable, auditable records in TDC.",
    output: "847 Tax Decision Records · Immutable log entry · Audit trail complete",
  },
  {
    step: 10, label: "Roger UI displays results",
    touchpointId: "T11", system: "Roger UI", agentId: "demo_runner", layerId: "experience",
    description: "Roger UI surfaces verified tax results and full audit trail to practitioners in read-only view.",
    output: "Tax-ready records displayed · Full lineage trace available · Audit trail accessible",
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
    platformGuarantee: "All financial records conform to the canonical schema. Required fields, types, and governance fields (job_id, version, timestamps) are enforced at ingestion.",
    batchId: "AB-01",
    status: "IN_PROGRESS",
  },
  {
    storyId: "Story-2",
    title: "Lineage Provenance Capture",
    guaranteeType: "LINEAGE",
    gate: "G3",
    platformGuarantee: "Every canonical record has a complete, verifiable provenance chain from source file through all AI transformations to PDC persistence.",
    batchId: "AB-01",
    status: "PLANNED",
  },
  {
    storyId: "Story-3",
    title: "Invariant Protection",
    guaranteeType: "SCHEMA",
    gate: "G2",
    platformGuarantee: "LOCKED records cannot be overwritten. Lifecycle transitions are enforced. Adversarial scenarios are tested and blocked.",
    batchId: "AB-01",
    status: "PLANNED",
  },
  {
    storyId: "Story-4",
    title: "API Contract Publication",
    guaranteeType: "CONTRACT",
    gate: "G4",
    platformGuarantee: "All platform APIs conform to published contracts. Consumer integration is validated. Version compatibility is maintained.",
    batchId: "AB-02",
    status: "PLANNED",
  },
  {
    storyId: "Story-7",
    title: "End-to-End Runtime Validation",
    guaranteeType: "RUNTIME",
    gate: "G4",
    platformGuarantee: "The full T1–T11 runtime journey executes without interruption. Lineage is traceable end-to-end. Tax decisions are immutable and auditable.",
    batchId: "AB-02",
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
    detail: "All ingestion paths (Direct Upload, Roger Web App, Phoenix, Duo/DSDMS) converge through Tax Portal. No file enters the platform without Tax Portal enforcement." },
  { id: "G-02", rule: "AI Orchestrator runs once per file",
    detail: "Stateless compute — invoked exactly once by PDC. Does not own data and does not persist records." },
  { id: "G-03", rule: "PDC owns cross-LOB truth",
    detail: "PDC is the first system of record for canonical financial data across all lines of business." },
  { id: "G-04", rule: "TDC owns tax truth",
    detail: "All tax mapping proposals, decisions, and TAX_READY transitions are persisted in TDC." },
  { id: "G-05", rule: "Roger only reads and surfaces user decisions",
    detail: "Roger Web App is a read-only consumer. It does not write to PDC or TDC directly." },
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
  { system: "Tax Portal",      owner: "Ingestion / Platform", role: "Ingestion gate and document identifier authority",       sor: false, layer: "ingestion",     colorHex: "#7C3AED" },
  { system: "Service Bus",     owner: "Platform",             role: "Event backbone between publishers and consumers",        sor: false, layer: "ingestion",     colorHex: "#6366F1" },
  { system: "PDC",             owner: "DCT",                  role: "Cross-LOB data authority and first system of record",    sor: true,  layer: "pdc",           colorHex: "#059669" },
  { system: "TDC",             owner: "DCT",                  role: "Tax domain authority and tax system of record",          sor: true,  layer: "tdc",           colorHex: "#DC2626" },
  { system: "AI Orchestrator", owner: "Roger team",           role: "Stateless compute performing recognition and mapping",   sor: false, layer: "orchestration", colorHex: "#2563EB" },
  { system: "Roger Web App",   owner: "Roger team",           role: "User interface for practitioner review",                 sor: false, layer: "experience",    colorHex: "#DB2777" },
  { system: "Taxonomy Service", owner: "DCT / TDC",            role: "Owns firm taxonomy hierarchy, versioning, and FirmTaxonomyId assignment", sor: true,  layer: "tdc",           colorHex: "#7C3AED" },
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
  requiredFields: ["entity_id", "tax_year"],
  rejectionRule: "Files missing required fields are rejected before reaching the Service Bus",
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
    decision: "All file ingestion paths must converge through Tax Portal. No file may enter the platform without Tax Portal enforcement of the ingestion contract (entity_id, tax_year).",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-02", title: "PDC is the cross-LOB system of record",
    decision: "PDC is the authoritative source for canonical financial data across all lines of business. No other system may claim canonical financial authority.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-03", title: "AI Orchestrator runs once per file",
    decision: "The AI Orchestrator is invoked exactly once per file by PDC. Re-invocation requires explicit governance approval and a new doc_id lineage chain.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-04", title: "TDC is the tax system of record",
    decision: "All tax mapping proposals, practitioner decisions, and TAX_READY transitions are persisted exclusively in TDC. Roger Web App is read-only.",
    status: "ACCEPTED", date: "2026-03-01", impact: "High",
  },
  {
    id: "ADR-05", title: "Roger Web App is a read-only consumer",
    decision: "Roger Web App surfaces data from PDC and TDC for practitioner review. It does not write to either system. Practitioner decisions are submitted through a governed API.",
    status: "ACCEPTED", date: "2026-03-01", impact: "Medium",
  },
  {
    id: "ADR-06", title: "FirmTaxonomyId is REQUIRED on all PDC canonical records",
    decision: "Every FinancialFact record persisted in PDC must carry a FirmTaxonomyId sourced from the Taxonomy Service. The AI Orchestrator is responsible for resolving and returning FirmTaxonomyId with every record. PDC must reject records missing FirmTaxonomyId once Batch 2A enforcement is active. The READY signal must not be emitted if any record has ClassificationStatus = UNCLASSIFIED.",
    status: "PROPOSED", date: "2026-04-01", impact: "High",
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
    description: "The mechanism for resolving entity_id at Tax Portal ingestion is not yet defined. Requires alignment between Tax Portal, PDC, and client ERP systems.",
    priority: "High", owner: "Platform Architecture", status: "OPEN",
  },
  {
    id: "OI-02", title: "Future DMS strategy",
    description: "The long-term Document Management System strategy (Duo vs. DSDMS vs. consolidated) has not been decided. Impacts ingestion path design.",
    priority: "Medium", owner: "Platform Architecture", status: "OPEN",
  },
  {
    id: "OI-03", title: "Client adjustment tables",
    description: "The design for client-specific adjustment tables that modify canonical financial data in PDC is not yet specified.",
    priority: "Medium", owner: "DCT Architecture", status: "OPEN",
  },
  {
    id: "OI-04", title: "FirmTaxonomyId enforcement gap — Batch 2A",
    description: "The AI Orchestrator is NOT currently returning FirmTaxonomyId with normalized records. This is the blocking gap addressed by Batch 2A (Orchestrator Contract Enforcement & Classification). PDC cannot enforce FirmTaxonomyId as REQUIRED until the Orchestrator contract is updated. Decision pending: whether FirmTaxonomyId should be REQUIRED or nullable during the transition period.",
    priority: "High", owner: "DCT Architecture + Roger Team", status: "OPEN",
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
    description: "Tax Portal must expose an ingestion API that accepts file uploads, validates entity_id and tax_year, assigns doc_id, and publishes to Service Bus.",
    owner: "Ingestion / Platform team", status: "IN_PROGRESS", blocking: true,
  },
  {
    id: "DEP-02", name: "DSDMS abstraction layer",
    description: "A DSDMS abstraction layer is required to normalize file retrieval across Duo and DSDMS source systems before Tax Portal ingestion.",
    owner: "Platform Architecture", status: "PLANNED", blocking: false,
  },
  {
    id: "DEP-03", name: "Service Bus configuration",
    description: "Service Bus topics and subscriptions must be configured for: New File event (Tax Portal → PDC), READY event (PDC → TDC), and Adjustment event (Roger → PDC/TDC).",
    owner: "Platform team", status: "IN_PROGRESS", blocking: true,
  },
];

export const ARCH_METADATA = {
  title: "DCT Roger End-to-End Data Flow",
  version: "2.0.0",
  sourceOfTruth: "arch_model.py (Architecture Sync Agent)",
  lastUpdated: "2026-03-11",
  authority: "DCT Platform Architecture Team | RSM | CATT",
  visioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663402976610/6z8sjWGC7ihkVcDSZGqeBn/DCT_Platform_Architecture_v2_c18d128a.png",
  layerCount: 6,
  touchpointCount: 11,
  agentCount: 5,
  adrCount: 6,
  openItemCount: 4,
  dependencyCount: 3,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getAgent = (id: string) => AGENTS.find(a => a.id === id);
export const getLayer = (id: string) => PLATFORM_LAYERS.find(l => l.id === id);
export const getGate = (id: string) => GATES.find(g => g.id === id);
export const getTouchpoint = (id: string) => TOUCHPOINTS.find(t => t.id === id);

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
};
