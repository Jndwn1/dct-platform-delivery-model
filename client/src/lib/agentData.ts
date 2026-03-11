// DCT Platform — Agent Hub & Architecture Data Model
// RSM | DCT + Roger | Prototype Sandbox

export type AgentStatus = "ACTIVE" | "IDLE" | "RUNNING" | "ERROR" | "STANDBY";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: AgentStatus;
  lastExecution: string;
  lastTask: string;
  touchpoints: string[];
  executionCount: number;
  successRate: number;
  layer: string;
}

export const agents: Agent[] = [
  {
    id: "recognizer",
    name: "Recognizer Agent",
    role: "File Structure Recognition & Validation",
    description: "Analyzes incoming client files from Phoenix/DMS, identifies file structure, assigns doc_id, and validates format conformance before routing to normalization.",
    status: "IDLE",
    lastExecution: "2026-03-11 09:42:17",
    lastTask: "Trial Balance — Acme Corp Q4 2025",
    touchpoints: ["T1", "T2"],
    executionCount: 147,
    successRate: 98.6,
    layer: "AI Orchestrator",
  },
  {
    id: "normalization",
    name: "Normalization Agent",
    role: "Financial Data Extraction & Cross-LOB Normalization",
    description: "Extracts financial data from recognized files, applies canonical financial model transformations, and produces normalized records for PDC persistence.",
    status: "IDLE",
    lastExecution: "2026-03-11 09:43:05",
    lastTask: "Trial Balance normalization — 1,842 line items",
    touchpoints: ["T3", "T4"],
    executionCount: 143,
    successRate: 97.9,
    layer: "AI Orchestrator",
  },
  {
    id: "mapping",
    name: "Mapping Agent",
    role: "Tax Mapping Proposal Generation",
    description: "Analyzes canonical financial datasets from PDC and generates AI-assisted tax mapping proposals for practitioner review in TDC.",
    status: "STANDBY",
    lastExecution: "2026-03-10 16:22:44",
    lastTask: "Awaiting PDC Readiness Signal (T7)",
    touchpoints: ["T8"],
    executionCount: 89,
    successRate: 94.4,
    layer: "AI Mapping Layer",
  },
  {
    id: "governance",
    name: "Governance Agent",
    role: "Validation Checks & Artifact Verification",
    description: "Performs automated gate pre-checks, validates artifact completeness, monitors invariant compliance, and maintains the delivery manifest across all active batches.",
    status: "ACTIVE",
    lastExecution: "2026-03-11 13:05:00",
    lastTask: "G1 pre-check — Schema Lock artifact validation",
    touchpoints: ["T5", "T6", "T7"],
    executionCount: 312,
    successRate: 99.7,
    layer: "AI Orchestrator",
  },
  {
    id: "architect",
    name: "Architecture Analyst Agent",
    role: "Architecture Diagram Maintenance",
    description: "Monitors platform component changes, updates architecture diagrams, tracks touchpoint state transitions, and flags architectural drift from the approved DCT reference model.",
    status: "IDLE",
    lastExecution: "2026-03-11 08:00:00",
    lastTask: "Architecture sync — AB-01 touchpoint state refresh",
    touchpoints: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"],
    executionCount: 58,
    successRate: 100,
    layer: "AI Orchestrator",
  },
];

// ─── ARCHITECTURE SWIMLANE DATA ──────────────────────────────────────────────

export interface SwimLane {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  touchpoints: string[];
}

export interface ArchTouchpoint {
  id: string;
  label: string;
  name: string;
  lane: string;
  description: string;
  inputs: string[];
  outputs: string[];
  systemOwner: string;
  responsibility: string;
  agentId?: string;
}

export const swimLanes: SwimLane[] = [
  {
    id: "client",
    label: "Client Source Systems",
    sublabel: "SAP · Oracle · Workday · ERP",
    color: "#6B7280",
    bgColor: "#F9FAFB",
    borderColor: "#D1D5DB",
    touchpoints: [],
  },
  {
    id: "dms",
    label: "DMS / Phoenix",
    sublabel: "File Ingestion & Intake",
    color: "#7C3AED",
    bgColor: "#F5F3FF",
    borderColor: "#C4B5FD",
    touchpoints: ["T1"],
  },
  {
    id: "orchestrator",
    label: "AI Orchestrator",
    sublabel: "Recognition · Normalization · Governance",
    color: "#2563EB",
    bgColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    touchpoints: ["T2", "T3"],
  },
  {
    id: "pdc",
    label: "PDC — Data Foundation",
    sublabel: "Canonical Financial Dataset",
    color: "#059669",
    bgColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    touchpoints: ["T4", "T5", "T6", "T7"],
  },
  {
    id: "mapping",
    label: "AI Mapping Layer",
    sublabel: "Tax Mapping Proposals",
    color: "#D97706",
    bgColor: "#FFFBEB",
    borderColor: "#FDE68A",
    touchpoints: ["T8"],
  },
  {
    id: "tdc",
    label: "TDC — Tax Decision Core",
    sublabel: "Tax Workflow · Decision Persistence",
    color: "#DC2626",
    bgColor: "#FEF2F2",
    borderColor: "#FECACA",
    touchpoints: ["T9", "T10"],
  },
  {
    id: "roger",
    label: "Roger UI",
    sublabel: "Practitioner Experience",
    color: "#DB2777",
    bgColor: "#FDF2F8",
    borderColor: "#FBCFE8",
    touchpoints: ["T11"],
  },
];

export const archTouchpoints: ArchTouchpoint[] = [
  {
    id: "T1",
    label: "T1",
    name: "File Upload + doc_id Assignment",
    lane: "dms",
    description: "Client ERP files are received by Phoenix/DMS. Each file is assigned a unique doc_id and logged in the intake registry. File format is validated before routing.",
    inputs: ["Client ERP export file (CSV, XLSX, XML)", "Client metadata"],
    outputs: ["doc_id assignment", "Intake Log Record", "File routing event"],
    systemOwner: "Phoenix / DMS",
    responsibility: "Receive, log, and route client source files",
    agentId: "recognizer",
  },
  {
    id: "T2",
    label: "T2",
    name: "File Recognition",
    lane: "orchestrator",
    description: "Recognizer Agent analyzes the file structure, identifies the financial data model (Trial Balance, GL, etc.), and validates format conformance.",
    inputs: ["Routed file from T1", "doc_id"],
    outputs: ["Schema Recognition Report", "File type classification", "Validation result"],
    systemOwner: "AI Orchestrator — Recognizer Agent",
    responsibility: "Identify file structure and validate format conformance",
    agentId: "recognizer",
  },
  {
    id: "T3",
    label: "T3",
    name: "Financial Extraction",
    lane: "orchestrator",
    description: "Normalization Agent extracts financial data from the recognized file and applies cross-LOB normalization rules to produce a canonical financial record set.",
    inputs: ["Recognized file from T2", "Schema Recognition Report"],
    outputs: ["Normalized financial records", "Normalization Record", "Extraction log"],
    systemOwner: "AI Orchestrator — Normalization Agent",
    responsibility: "Extract and normalize financial data to canonical model",
    agentId: "normalization",
  },
  {
    id: "T4",
    label: "T4",
    name: "Canonical Normalization",
    lane: "pdc",
    description: "Normalized records are persisted as canonical financial dataset in PDC. Each record is versioned and linked to its source doc_id.",
    inputs: ["Normalized records from T3", "Normalization Record"],
    outputs: ["Canonical Record Set", "PDC persistence confirmation", "Version record"],
    systemOwner: "PDC — Phoenix Data Cloud",
    responsibility: "Persist normalized records as versioned canonical dataset",
    agentId: "normalization",
  },
  {
    id: "T5",
    label: "T5",
    name: "Lineage Capture",
    lane: "pdc",
    description: "Governance Agent captures the full provenance graph from client source file through AI Orchestrator transformations to PDC canonical records.",
    inputs: ["Canonical Record Set from T4", "Transformation audit log"],
    outputs: ["Lineage Record", "Provenance graph nodes and edges"],
    systemOwner: "PDC — Governance Agent",
    responsibility: "Capture complete data provenance from source to canonical record",
    agentId: "governance",
  },
  {
    id: "T6",
    label: "T6",
    name: "Canonical Dataset Establishment",
    lane: "pdc",
    description: "The canonical dataset is versioned, locked, and authority is established. The dataset is registered as the authoritative source for downstream tax processing.",
    inputs: ["Lineage Record from T5", "Schema Lock Certificate (G1)"],
    outputs: ["Dataset Authority Certificate", "Locked canonical dataset", "Version manifest"],
    systemOwner: "PDC — Governance Agent",
    responsibility: "Version, lock, and establish authority for canonical dataset",
    agentId: "governance",
  },
  {
    id: "T7",
    label: "T7",
    name: "READY Signal",
    lane: "pdc",
    description: "PDC emits a Data Readiness Signal event to notify TDC and the AI Mapping Layer that the canonical dataset is complete and ready for tax processing.",
    inputs: ["Dataset Authority Certificate from T6"],
    outputs: ["Data Readiness Signal event", "TDC trigger", "AI Mapping Layer trigger"],
    systemOwner: "PDC — Governance Agent",
    responsibility: "Signal downstream systems that canonical data is ready for processing",
    agentId: "governance",
  },
  {
    id: "T8",
    label: "T8",
    name: "AI Mapping Proposals",
    lane: "mapping",
    description: "Mapping Agent analyzes the canonical dataset and generates AI-assisted tax mapping proposals. Proposals are surfaced to practitioners in TDC for review.",
    inputs: ["Data Readiness Signal from T7", "Canonical dataset from PDC"],
    outputs: ["Mapping Proposal Set", "Confidence scores", "Proposal rationale"],
    systemOwner: "AI Mapping Layer — Mapping Agent",
    responsibility: "Generate AI-assisted tax mapping proposals for practitioner review",
    agentId: "mapping",
  },
  {
    id: "T9",
    label: "T9",
    name: "Tax Review",
    lane: "tdc",
    description: "Tax practitioners review AI mapping proposals in TDC, apply domain expertise, validate against invariants, and approve or modify proposed mappings.",
    inputs: ["Mapping Proposal Set from T8", "Tax domain invariants (G2)"],
    outputs: ["Tax Review Record", "Practitioner validation events", "Approved/modified mappings"],
    systemOwner: "TDC — Tax Data Core",
    responsibility: "Practitioner review and validation of AI mapping proposals",
  },
  {
    id: "T10",
    label: "T10",
    name: "Tax Decision Persistence",
    lane: "tdc",
    description: "Validated tax decisions are persisted as immutable records in TDC. Each decision is linked to its source canonical record and practitioner validation event.",
    inputs: ["Validated mappings from T9", "Tax Review Record"],
    outputs: ["Tax Decision Record", "Immutable decision log", "Audit trail entry"],
    systemOwner: "TDC — Tax Data Core",
    responsibility: "Persist validated tax decisions as immutable, auditable records",
  },
  {
    id: "T11",
    label: "T11",
    name: "UI Consumption",
    lane: "roger",
    description: "Tax decisions and canonical data are surfaced to practitioners in Roger UI. Practitioners can trace values back to source, review audit trails, and access workflow status.",
    inputs: ["Tax Decision Record from T10", "Canonical dataset from PDC"],
    outputs: ["Practitioner view", "Audit trail display", "Lineage trace UI"],
    systemOwner: "Roger UI",
    responsibility: "Surface verified tax results and full audit trail to practitioners",
  },
];

// ─── DEMO RUNNER STEPS ───────────────────────────────────────────────────────

export interface DemoStep {
  id: string;
  touchpoint: string;
  label: string;
  description: string;
  duration: number; // ms
  system: string;
  agentId?: string;
  output: string;
}

export const demoSteps: DemoStep[] = [
  {
    id: "step1", touchpoint: "T1",
    label: "Upload Trial Balance File",
    description: "Acme Corp Q4 2025 Trial Balance (XLSX, 1,842 line items) received by Phoenix/DMS. doc_id TB-2025-Q4-ACME-001 assigned.",
    duration: 1200, system: "Phoenix / DMS",
    output: "doc_id: TB-2025-Q4-ACME-001 · Intake Log Record created",
  },
  {
    id: "step2", touchpoint: "T2",
    label: "Run AI File Recognition",
    description: "Recognizer Agent analyzing file structure. Identifying schema: Trial Balance — Standard Chart of Accounts. Format validation: PASS.",
    duration: 1800, system: "AI Orchestrator", agentId: "recognizer",
    output: "Schema: Trial Balance · Format: XLSX · Validation: PASS · Confidence: 99.2%",
  },
  {
    id: "step3", touchpoint: "T3",
    label: "Run Financial Extraction",
    description: "Normalization Agent extracting 1,842 financial line items. Applying cross-LOB canonical normalization. Mapping to DCT financial model.",
    duration: 2400, system: "AI Orchestrator", agentId: "normalization",
    output: "1,842 records extracted · 0 exceptions · Normalization Record NR-TB-001 created",
  },
  {
    id: "step4", touchpoint: "T4",
    label: "Persist Canonical Dataset in PDC",
    description: "Persisting normalized records to PDC as canonical financial dataset. Versioning and linking to source doc_id.",
    duration: 1600, system: "PDC",
    output: "Canonical Record Set CRS-001 · Version 1.0 · 1,842 records persisted",
  },
  {
    id: "step5", touchpoint: "T5",
    label: "Capture Data Lineage",
    description: "Governance Agent capturing full provenance graph. Mapping source file → AI transformations → canonical records.",
    duration: 1400, system: "PDC", agentId: "governance",
    output: "Lineage Record LR-001 · 1,842 nodes · 3,684 edges · Graph complete",
  },
  {
    id: "step6", touchpoint: "T6",
    label: "Establish Dataset Authority",
    description: "Locking canonical dataset. Establishing PDC as authoritative source. Issuing Dataset Authority Certificate.",
    duration: 1000, system: "PDC", agentId: "governance",
    output: "Dataset Authority Certificate DAC-001 issued · Dataset LOCKED",
  },
  {
    id: "step7", touchpoint: "T7",
    label: "Emit READY Signal",
    description: "PDC emitting Data Readiness Signal. Notifying AI Mapping Layer and TDC that canonical data is ready for tax processing.",
    duration: 600, system: "PDC", agentId: "governance",
    output: "READY Signal emitted · TDC triggered · AI Mapping Layer triggered",
  },
  {
    id: "step8", touchpoint: "T8",
    label: "Generate AI Tax Mapping Proposals",
    description: "Mapping Agent analyzing canonical dataset. Generating tax mapping proposals for 1,842 line items. Applying tax domain rules.",
    duration: 3200, system: "AI Mapping Layer", agentId: "mapping",
    output: "1,842 mapping proposals · Avg confidence: 94.7% · Mapping Proposal Set MPS-001",
  },
  {
    id: "step9", touchpoint: "T9",
    label: "Execute Tax Workflow",
    description: "Tax practitioner reviewing AI mapping proposals. Validating against domain invariants. Approving high-confidence proposals, modifying exceptions.",
    duration: 2000, system: "TDC",
    output: "1,798 proposals approved · 44 modified · Tax Review Record TRR-001",
  },
  {
    id: "step10", touchpoint: "T10",
    label: "Persist Tax Decisions",
    description: "Persisting validated tax decisions as immutable records in TDC. Linking to canonical records and practitioner validation events.",
    duration: 1200, system: "TDC",
    output: "1,842 Tax Decision Records persisted · Immutable · Audit trail complete",
  },
  {
    id: "step11", touchpoint: "T11",
    label: "Display Results in Roger UI",
    description: "Tax decisions and canonical data surfaced to practitioners in Roger UI. Full audit trail and lineage trace available.",
    duration: 800, system: "Roger UI",
    output: "Results displayed · Audit trail accessible · Lineage trace: T11 → T1 verified",
  },
];
