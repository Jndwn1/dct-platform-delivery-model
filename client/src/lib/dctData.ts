// DCT Platform Gate Verification Dashboard — Data Model
// RSM | DCT + Roger | Prototype Sandbox / UI Dashboards
// Design: RSM Command Center — consulting-grade, data-forward, RSM Blue authority palette

export type GateStatus = "PASSED" | "PENDING" | "BLOCKED" | "PLANNED";
export type BatchStatus = "ACTIVE" | "PLANNED" | "CLOSED" | "ON_HOLD" | "GATE_PENDING";
export type TouchpointStatus = "COMPLETE" | "IN_PROGRESS" | "PENDING" | "BLOCKED" | "PLANNED";
export type SystemLayer = "Phoenix/DMS" | "AI Orchestrator" | "PDC" | "TDC" | "Roger UI";

export interface GateArtifact {
  id: string;
  name: string;
  status: "ISSUED" | "PENDING" | "MISSING";
  issuedDate?: string;
  issuedBy?: string;
}

export interface Gate {
  id: "G1" | "G2" | "G3" | "G4";
  name: string;
  purpose: string;
  status: GateStatus;
  approvingAuthority: string;
  artifacts: GateArtifact[];
  openIssues: number;
  lastUpdated: string;
}

export interface Touchpoint {
  id: string;
  label: string;
  name: string;
  system: SystemLayer;
  status: TouchpointStatus;
  gate?: "G1" | "G2" | "G3" | "G4";
  description: string;
}

export interface ArchitecturalBatch {
  id: string;
  name: string;
  status: BatchStatus;
  touchpoints: string[];
  primarySystem: string;
  keyGate: string;
  entryCondition: string;
  exitCondition: string;
  batchLead: string;
  openIssues: number;
  completionPct: number;
  gates: Gate[];
  startDate?: string;
  targetDate?: string;
}

// ─── TOUCHPOINTS ────────────────────────────────────────────────────────────

export const touchpoints: Touchpoint[] = [
  {
    id: "T1", label: "T1", name: "File Ingestion",
    system: "Phoenix/DMS", status: "COMPLETE", gate: "G1",
    description: "Client ERP source files received and logged by Phoenix/DMS"
  },
  {
    id: "T2", label: "T2", name: "Schema Recognition",
    system: "AI Orchestrator", status: "COMPLETE", gate: "G1",
    description: "AI Orchestrator identifies and classifies incoming file schema"
  },
  {
    id: "T3", label: "T3", name: "Financial Normalization",
    system: "AI Orchestrator", status: "COMPLETE", gate: "G1",
    description: "AI Orchestrator normalizes source data to canonical financial model"
  },
  {
    id: "T4", label: "T4", name: "Canonical Persistence",
    system: "PDC", status: "COMPLETE", gate: "G2",
    description: "Normalized records persisted as canonical financial dataset in PDC"
  },
  {
    id: "T5", label: "T5", name: "Lineage Capture",
    system: "PDC", status: "IN_PROGRESS", gate: "G3",
    description: "Full provenance graph captured from source file to canonical record"
  },
  {
    id: "T6", label: "T6", name: "Dataset Authority",
    system: "PDC", status: "PENDING", gate: "G3",
    description: "Canonical dataset versioned, locked, and authority established"
  },
  {
    id: "T7", label: "T7", name: "Readiness Signal",
    system: "PDC", status: "PENDING", gate: "G3",
    description: "PDC emits data readiness signal to trigger TDC processing"
  },
  {
    id: "T8", label: "T8", name: "Mapping Proposals",
    system: "TDC", status: "PENDING", gate: "G4",
    description: "AI Orchestrator generates tax mapping proposals for practitioner review"
  },
  {
    id: "T9", label: "T9", name: "Tax Workflow",
    system: "TDC", status: "PLANNED", gate: "G4",
    description: "Practitioner executes tax review workflow against mapping proposals"
  },
  {
    id: "T10", label: "T10", name: "Tax Decision",
    system: "TDC", status: "PLANNED", gate: "G4",
    description: "Tax decisions persisted as immutable records in TDC"
  },
  {
    id: "T11", label: "T11", name: "Practitioner View",
    system: "Roger UI", status: "PLANNED", gate: "G4",
    description: "Verified tax results surfaced to practitioners in Roger UI"
  },
];

// ─── ACTIVE BATCH: AB-01 ────────────────────────────────────────────────────

export const activeBatch: ArchitecturalBatch = {
  id: "AB-01",
  name: "Foundation & Source Onboarding",
  status: "ACTIVE",
  touchpoints: ["T1", "T2", "T3"],
  primarySystem: "Phoenix/DMS + AI Orchestrator",
  keyGate: "G1 — Schema Lock",
  entryCondition: "None — first batch",
  exitCondition: "Schema Lock Certificates issued for all entities in scope",
  batchLead: "PDC Workstream Lead",
  openIssues: 2,
  completionPct: 78,
  startDate: "2026-02-03",
  targetDate: "2026-03-28",
  gates: [
    {
      id: "G1",
      name: "Schema Lock",
      purpose: "Certify that the data entity schema in PDC is validated, stable, and approved for downstream use",
      status: "PENDING",
      approvingAuthority: "Architecture Lead",
      openIssues: 2,
      lastUpdated: "2026-03-10",
      artifacts: [
        { id: "SRR-001", name: "Source Registration Records", status: "ISSUED", issuedDate: "2026-02-14", issuedBy: "PDC Workstream Lead" },
        { id: "SCR-001", name: "Schema Recognition Reports", status: "ISSUED", issuedDate: "2026-02-21", issuedBy: "AI Orchestrator Layer" },
        { id: "NR-001", name: "Normalization Records", status: "ISSUED", issuedDate: "2026-02-28", issuedBy: "AI Orchestrator Layer" },
        { id: "SLC-001", name: "Schema Lock Certificates", status: "PENDING", issuedBy: "Architecture Lead" },
        { id: "QA-SV-001", name: "QA Schema Validation Report", status: "PENDING", issuedBy: "QA Engineer" },
      ]
    },
    {
      id: "G2",
      name: "Invariant Lock",
      purpose: "Certify that all tax domain business rules and constraints are validated and versioned",
      status: "PLANNED",
      approvingAuthority: "Tax Domain Lead + Architecture Lead",
      openIssues: 0,
      lastUpdated: "—",
      artifacts: [
        { id: "IDD-001", name: "Invariant Definition Documents", status: "MISSING" },
        { id: "IVR-001", name: "Invariant Validation Reports", status: "MISSING" },
        { id: "ILR-001", name: "Invariant Lock Records", status: "MISSING" },
        { id: "QA-IV-001", name: "QA Invariant Validation Report", status: "MISSING" },
      ]
    },
    {
      id: "G3",
      name: "Lineage Closure",
      purpose: "Certify that the full data provenance graph is complete and traceable from client source through PDC",
      status: "PLANNED",
      approvingAuthority: "Architecture Lead",
      openIssues: 0,
      lastUpdated: "—",
      artifacts: [
        { id: "LMD-001", name: "Lineage Map Drafts", status: "MISSING" },
        { id: "LR-001", name: "Lineage Records", status: "MISSING" },
        { id: "DAC-001", name: "Dataset Authority Certificates", status: "MISSING" },
        { id: "LCC-001", name: "Lineage Closure Certificates", status: "MISSING" },
        { id: "QA-LC-001", name: "QA Lineage Closure Report", status: "MISSING" },
      ]
    },
    {
      id: "G4",
      name: "Contract Publication",
      purpose: "Certify that the published data contract conforms to platform standards and is ready for consumer access",
      status: "PLANNED",
      approvingAuthority: "Business Owner + Delivery Lead",
      openIssues: 0,
      lastUpdated: "—",
      artifacts: [
        { id: "MPS-001", name: "Mapping Proposal Sets", status: "MISSING" },
        { id: "TRR-001", name: "Tax Review Records", status: "MISSING" },
        { id: "TDR-001", name: "Tax Decision Records", status: "MISSING" },
        { id: "PDC-001", name: "Published Data Contracts", status: "MISSING" },
        { id: "QA-CC-001", name: "QA Contract Compliance Report", status: "MISSING" },
      ]
    }
  ]
};

// ─── FOUNDATION CORE BATCH ─────────────────────────────────────────────────

export const foundationCoreBatch: ArchitecturalBatch = {
  id: "FC-00",
  name: "Foundation Core",
  status: "CLOSED",
  touchpoints: [],
  primarySystem: "All Systems",
  keyGate: "None — Infrastructure",
  entryCondition: "None — program start",
  exitCondition: "Infrastructure ready: code repo, templates, Copilot Agent and Blitzy configuration, development environment",
  batchLead: "Program Delivery Lead",
  openIssues: 0,
  completionPct: 100,
  startDate: "2024-10-01",
  targetDate: "2024-12-31",
  gates: []
};

// ─── ALL BATCHES ─────────────────────────────────────────────────────────────

export const allBatches: ArchitecturalBatch[] = [
  foundationCoreBatch,
  activeBatch,
  {
    id: "AB-02",
    name: "Invariant Framework Establishment",
    status: "PLANNED",
    touchpoints: ["T4", "T5"],
    primarySystem: "TDC + AI Orchestrator",
    keyGate: "G2 — Invariant Lock",
    entryCondition: "AB-01 Schema Lock Certificates issued",
    exitCondition: "Invariant Lock Records issued for all tax domain rule sets",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-05-16",
    gates: []
  },
  {
    id: "AB-03",
    name: "Lineage Graph Construction",
    status: "PLANNED",
    touchpoints: ["T5", "T6", "T7"],
    primarySystem: "PDC",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-02 Invariant Lock Records issued",
    exitCondition: "Lineage Closure Certificates issued for all entities",
    batchLead: "PDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-07-11",
    gates: []
  },
  {
    id: "AB-04",
    name: "Initial Contract Publication",
    status: "PLANNED",
    touchpoints: ["T8", "T9", "T10", "T11"],
    primarySystem: "TDC + Roger UI",
    keyGate: "G4 — Contract Publication",
    entryCondition: "AB-03 Lineage Closure Certificates issued",
    exitCondition: "Published Data Contracts accessible in Roger UI",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-09-19",
    gates: []
  },
  {
    id: "AB-05",
    name: "Expanded Entity Coverage",
    status: "PLANNED",
    touchpoints: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"],
    primarySystem: "All Systems",
    keyGate: "All Gates",
    entryCondition: "AB-04 Published Contracts stable; no open gate failures",
    exitCondition: "Full artifact set for all expanded entities; Published Contracts for expanded scope",
    batchLead: "Program Delivery Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-12-04",
    gates: []
  },
  {
    id: "AB-06",
    name: "AI Orchestrator Layer Integration",
    status: "PLANNED",
    touchpoints: ["T2", "T3", "T8", "T10"],
    primarySystem: "AI Orchestrator",
    keyGate: "Orchestration Manifest",
    entryCondition: "AB-05 complete; AI Orchestrator requirements finalized",
    exitCondition: "Orchestration Manifest approved; AI Orchestrator Governance Charter issued",
    batchLead: "Program Delivery Lead + AI Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2027-02-12",
    gates: []
  },
  // ─── EXTENDED ROADMAP BATCHES (Batch 3–8) ─────────────────────────────────
  // These correspond to the GovernanceTimeline Batch 3–8 delivery stages.
  // Named to match the GovernanceTimelinePage labels for cross-page consistency.
  {
    id: "AB-07",
    name: "Tax Domain Authority & Tax Taxonomy",
    status: "PLANNED",
    touchpoints: ["T6", "T7"],
    primarySystem: "TDC",
    keyGate: "G2 — Invariant Lock",
    entryCondition: "AB-06 Orchestration Manifest approved",
    exitCondition: "TDC established as tax system of record; Tax taxonomy and jurisdiction codes defined",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-09-30",
    gates: []
  },
  {
    id: "AB-08",
    name: "AI Tax Mapping & Explainability",
    status: "PLANNED",
    touchpoints: ["T8"],
    primarySystem: "AI Orchestrator",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-07 Tax taxonomy and jurisdiction codes defined",
    exitCondition: "AI Orchestrator produces tax mapping proposals with confidence scores and evidence",
    batchLead: "AI Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-09-30",
    gates: []
  },
  {
    id: "AB-09",
    name: "Mapping Decisions & Governance",
    status: "PLANNED",
    touchpoints: ["T9", "T10"],
    primarySystem: "TDC",
    keyGate: "G4 — Contract Publication",
    entryCondition: "AB-08 AI mapping proposals available",
    exitCondition: "Practitioner review workflow complete; Tax decision persistence; Immutable audit trail",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-12-31",
    gates: []
  },
  {
    id: "AB-10",
    name: "Practitioner Review & Adjustment Workflow",
    status: "PLANNED",
    touchpoints: ["T9", "T10", "T11"],
    primarySystem: "TDC + Roger UI",
    keyGate: "G4 — Contract Publication",
    entryCondition: "AB-09 Tax decision persistence confirmed",
    exitCondition: "Roger UI adjustment workflow live; Practitioner approval and override capabilities delivered",
    batchLead: "Roger UI Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-12-31",
    gates: []
  },
  {
    id: "AB-11",
    name: "Rollforward & Prior Year Intelligence",
    status: "PLANNED",
    touchpoints: ["T1", "T2", "T3", "T4", "T5"],
    primarySystem: "PDC + AI Orchestrator",
    keyGate: "All Gates",
    entryCondition: "AB-10 Practitioner workflow delivered",
    exitCondition: "Prior year data rollforward complete; AI-assisted prior year comparison available",
    batchLead: "Program Delivery Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-06-30",
    gates: []
  },
  {
    id: "AB-12",
    name: "Return Assembly, Filing & Lineage Closure",
    status: "PLANNED",
    touchpoints: ["T10", "T11"],
    primarySystem: "TDC + Roger UI",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-11 Prior year rollforward complete",
    exitCondition: "Tax return assembly complete; Filing integration live; Full lineage closure certified",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-06-30",
    gates: []
  }
];

// ─── PLATFORM KPIs ───────────────────────────────────────────────────────────

export const platformKPIs = {
  activeBatches: 1,
  gatesPassedTotal: 0,
  gatesPendingTotal: 1,
  gatesBlockedTotal: 0,
  artifactsIssued: 3,
  artifactsPending: 2,
  artifactsMissing: 15,
  openIssues: 2,
  touchpointsComplete: 4,
  touchpointsInProgress: 1,
  touchpointsPending: 3,
  touchpointsPlanned: 3,
  overallProgress: 18,
};

// ─── STATUS HELPERS ──────────────────────────────────────────────────────────

export function gateStatusColor(status: GateStatus): string {
  switch (status) {
    case "PASSED": return "gate-passed";
    case "PENDING": return "gate-pending";
    case "BLOCKED": return "gate-blocked";
    case "PLANNED": return "gate-planned";
  }
}

export function touchpointStatusColor(status: TouchpointStatus): string {
  switch (status) {
    case "COMPLETE": return "bg-green-100 text-green-800 border-green-400";
    case "IN_PROGRESS": return "bg-amber-100 text-amber-800 border-amber-400 animate-pulse-pending";
    case "PENDING": return "bg-blue-100 text-blue-800 border-blue-400";
    case "BLOCKED": return "bg-red-100 text-red-800 border-red-400";
    case "PLANNED": return "bg-gray-100 text-gray-500 border-gray-300";
  }
}

export function systemColor(system: SystemLayer): string {
  switch (system) {
    case "Phoenix/DMS": return "text-purple-700";
    case "AI Orchestrator": return "text-blue-600";
    case "PDC": return "text-emerald-700";
    case "TDC": return "text-amber-700";
    case "Roger UI": return "text-rose-700";
  }
}

export function artifactStatusIcon(status: "ISSUED" | "PENDING" | "MISSING"): string {
  switch (status) {
    case "ISSUED": return "✓";
    case "PENDING": return "◎";
    case "MISSING": return "○";
  }
}
