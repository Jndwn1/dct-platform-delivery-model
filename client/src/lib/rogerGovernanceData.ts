// DCT Platform — Roger UI Governance Data Layer
// Source: Roger API Design v1.0 (05.07.2026) + TIM Governance Gap Analysis
// Used by: RogerMappingPage.tsx (rebuilt as governed architecture mapping hub)

export type GovStatus = "governed" | "partial" | "gap" | "missing" | "adr-required";
export type RiskLevel = "high" | "medium" | "low" | "none";
export type Owner = "TIM" | "Roger" | "CEM" | "PDC" | "TDC" | "Orchestrator" | "Unknown";

export interface FieldMapping {
  uiField: string;
  rogerApiField: string;
  timSupport: string;
  sourceSystem: Owner;
  govStatus: GovStatus;
  riskLevel: RiskLevel;
  notes: string;
  adrRef?: string;
  batch?: string;
}

export interface ScreenSection {
  id: string;
  screen: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  fields: FieldMapping[];
  archNotes: string[];
  govFindings: string[];
  riskIndicators: string[];
}

// ─── Screen 1 — My Clients ───────────────────────────────────────────────────
export const SCREEN1_MAPPING: ScreenSection = {
  id: "my-clients",
  screen: "My Clients",
  endpoint: "GET /api/clients?taxYear={year}",
  method: "GET",
  fields: [
    {
      uiField: "Client Name",
      rogerApiField: "name",
      timSupport: "CEM provides client display name via PDC integration",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Client appears operationally supported. No governed filing relationship identified.",
      batch: "FC",
    },
    {
      uiField: "Client ID",
      rogerApiField: "clientId",
      timSupport: "CEM/EODS provides stable client identifier",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Used in downstream routes. No lineage ownership identified.",
      batch: "FC",
    },
    {
      uiField: "% Complete",
      rogerApiField: "pctcompleted",
      timSupport: "TIM operational workflow completion — not governed filing completion",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Completion percentages appear operational only. No lineage ownership identified. Deliverables ≠ filings.",
      adrRef: "ADR-3",
      batch: "B10",
    },
    {
      uiField: "Entity Count",
      rogerApiField: "entityCount",
      timSupport: "TIM tracks entity count operationally",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "medium",
      notes: "Count derived from PDC entity master. No entity lineage ownership confirmed.",
      batch: "B5",
    },
    {
      uiField: "Deliverables",
      rogerApiField: "deliverables",
      timSupport: "TIM manages deliverable workflow",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Deliverables are operational TIM tasks. No governed filing semantics. Deliverables ≠ filings.",
      adrRef: "ADR-3",
      batch: "B10",
    },
    {
      uiField: "Approaching Date",
      rogerApiField: "approachingDate",
      timSupport: "TIM manages due dates operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Due date authority unclear. No governed deadline ownership identified.",
      adrRef: "ADR-7",
      batch: "B10",
    },
  ],
  archNotes: [
    "Client appears operationally supported via CEM/EODS → PDC integration",
    "No governed filing relationship identified between client and consolidation",
    "Completion percentages are operational only — no lineage ownership",
    "No consolidated filing governance authority identified",
  ],
  govFindings: [
    "TIM is operational unless governance is explicitly defined",
    "Deliverables do NOT equal filings — semantics must be disambiguated",
    "No filing authority rules identified for client-level aggregation",
    "No immutable audit chain for client completion state",
  ],
  riskIndicators: [
    "Filing governance ambiguity — completion % not governed",
    "Operational vs governed semantics unresolved",
    "Missing audit lineage for client-level state",
  ],
};

// ─── Screen 2 — Entities ─────────────────────────────────────────────────────
export const SCREEN2_MAPPING: ScreenSection = {
  id: "entities",
  screen: "Entities",
  endpoint: "GET /api/clients/{clientId}/entities?taxYear={year}",
  method: "GET",
  fields: [
    {
      uiField: "Entity ID",
      rogerApiField: "entityId",
      timSupport: "CEM/EODS provides stable entity identifier",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Used in downstream routes. No entity lineage ownership confirmed.",
      batch: "B5",
    },
    {
      uiField: "Entity Code",
      rogerApiField: "entityCode",
      timSupport: "Internal short code from CEM",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Operational display code. No governance ownership identified.",
      batch: "B5",
    },
    {
      uiField: "Entity Name",
      rogerApiField: "entityName",
      timSupport: "Legal name from CEM/EODS",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Display name. No lineage ownership identified.",
      batch: "B5",
    },
    {
      uiField: "EIN",
      rogerApiField: "ein",
      timSupport: "Federal EIN from EODS",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "medium",
      notes: "Sensitive identifier. No governed EIN lineage chain identified.",
      batch: "B5",
    },
    {
      uiField: "Entity Type",
      rogerApiField: "type",
      timSupport: "Entity classification from CEM",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "medium",
      notes: "C-Corp | S-Corp | Partnership | LLC | Disregarded | Foreign. No governed classification ownership.",
      batch: "B5",
    },
    {
      uiField: "Tax Return Form",
      rogerApiField: "taxReturn",
      timSupport: "TIM manages return form assignment operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Form assignment is operational. No governed return form authority identified. No filing signoff relationship exposed.",
      adrRef: "ADR-2",
      batch: "B7",
    },
    {
      uiField: "Filing Status",
      rogerApiField: "filingStatus",
      timSupport: "TIM operational status — Not Started | In Progress | In Review | Completed",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "FilingStatus is operational status, NOT governed filing state. No filing signoff relationship exposed. No consolidated hierarchy ownership identified.",
      adrRef: "ADR-4",
      batch: "B6",
    },
  ],
  archNotes: [
    "Entity data is operationally supported via CEM/EODS → PDC",
    "No entity lineage ownership identified in current contracts",
    "No filing signoff relationship exposed at entity level",
    "No consolidated hierarchy ownership identified",
  ],
  govFindings: [
    "FilingStatus is operational status — not governed filing state",
    "No entity lineage ownership identified",
    "No filing signoff relationship exposed",
    "No consolidated hierarchy ownership identified",
  ],
  riskIndicators: [
    "Filing governance ambiguity — operational vs governed filing status",
    "Operational vs governed semantics unresolved for filingStatus",
    "Missing audit lineage for entity filing state",
  ],
};

// ─── Screen 3 — Return Detail ─────────────────────────────────────────────────
export const SCREEN3_MAPPING: ScreenSection = {
  id: "return-detail",
  screen: "Return Detail",
  endpoint: "GET /api/returns/{returnId}/members",
  method: "GET",
  fields: [
    {
      uiField: "Return Name",
      rogerApiField: "returnName",
      timSupport: "TIM manages return naming operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Editable via PUT /api/returns/{returnId}/name. No immutable name lineage identified.",
      batch: "B6",
    },
    {
      uiField: "Entity Name",
      rogerApiField: "members[].name",
      timSupport: "CEM/EODS via PDC",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "low",
      notes: "Legal name from entity master.",
      batch: "B5",
    },
    {
      uiField: "Entity Type",
      rogerApiField: "members[].type",
      timSupport: "CEM entity classification",
      sourceSystem: "PDC",
      govStatus: "partial",
      riskLevel: "medium",
      notes: "C-Corp | S-Corp | Partnership | LLC | Disregarded | Foreign.",
      batch: "B5",
    },
    {
      uiField: "Member Role",
      rogerApiField: "members[].role",
      timSupport: "TIM manages role assignment operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Parent | Member | Elimination. Role exists operationally. No consolidated filing authority defined. No governed signoff structure. No immutable role lineage.",
      adrRef: "ADR-2",
      batch: "B6",
    },
    {
      uiField: "Add Members Action",
      rogerApiField: "POST /api/returns/{returnId}/members",
      timSupport: "TIM manages member addition operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "No governed membership lock/finalization. No filing lock state identified.",
      adrRef: "ADR-7",
      batch: "B6",
    },
    {
      uiField: "Remove Member Action",
      rogerApiField: "DELETE /api/returns/{returnId}/members/{entityId}",
      timSupport: "TIM manages member removal operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Cannot remove only Parent — operational guard only. No governed immutable membership record.",
      adrRef: "ADR-7",
      batch: "B6",
    },
    {
      uiField: "Role Change Action",
      rogerApiField: "PUT /api/returns/{returnId}/members/{entityId}/role",
      timSupport: "TIM manages role changes operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "No governed role lineage. No immutable role history. No filing lock state.",
      adrRef: "ADR-2",
      batch: "B6",
    },
  ],
  archNotes: [
    "Parent role exists operationally — no consolidated filing authority defined",
    "No governed signoff structure identified for return membership",
    "No immutable role lineage identified",
    "No filing lock/finalization governance identified",
  ],
  govFindings: [
    "Return membership is operationally modeled — not governed",
    "No consolidated filing authority defined",
    "No governed signoff structure for member roles",
    "No immutable role lineage or audit chain",
    "No filing lock state identified",
  ],
  riskIndicators: [
    "Consolidated Filing Governance Risk — no authority defined",
    "Role governance ambiguity — Parent role has no filing authority backing",
    "Missing filing lock/finalization state",
  ],
};

// ─── Screen 4 — Consolidation Detail ─────────────────────────────────────────
export const SCREEN4_MAPPING: ScreenSection = {
  id: "consolidation-detail",
  screen: "Consolidation Detail",
  endpoint: "GET /api/clients/{clientId}/consolidations",
  method: "GET",
  fields: [
    {
      uiField: "Consolidation Name",
      rogerApiField: "name",
      timSupport: "TIM manages consolidation naming operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Consolidation objects exist operationally. No formal consolidated filing governance identified.",
      batch: "B8",
    },
    {
      uiField: "Return Count",
      rogerApiField: "returnCount",
      timSupport: "TIM tracks return count operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Count of per-entity returns. No parent filing authority rules identified.",
      adrRef: "ADR-1",
      batch: "B8",
    },
    {
      uiField: "AI Process %",
      rogerApiField: "aiProcess",
      timSupport: "Orchestrator AI process completion",
      sourceSystem: "Orchestrator",
      govStatus: "partial",
      riskLevel: "medium",
      notes: "AI process completion percent. No governed AI lineage ownership identified.",
      batch: "B4",
    },
    {
      uiField: "Due Date",
      rogerApiField: "dueDate",
      timSupport: "TIM manages due dates operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "No governed deadline ownership. No filing lock state tied to due date.",
      adrRef: "ADR-7",
      batch: "B10",
    },
    {
      uiField: "Client Due Date",
      rogerApiField: "clientDueDate",
      timSupport: "TIM manages client due dates operationally",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Client-facing deadline. No governed client commitment ownership identified.",
      adrRef: "ADR-7",
      batch: "B10",
    },
    {
      uiField: "Status",
      rogerApiField: "status",
      timSupport: "TIM operational status — On Track | At Risk | Overdue | Completed",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "Operational status only. No governed signoff semantics identified. No immutable audit chain.",
      adrRef: "ADR-4",
      batch: "B6",
    },
    {
      uiField: "% Complete",
      rogerApiField: "pctComplete",
      timSupport: "TIM operational completion tracking",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "high",
      notes: "No entity contribution lineage identified. No governed rollup ownership.",
      adrRef: "ADR-5",
      batch: "B10",
    },
    {
      uiField: "Issue Count",
      rogerApiField: "issueCount",
      timSupport: "TIM issue tracking — operational",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Operational issue count. No immutable governance chain. No governed evidence retention.",
      batch: "B6",
    },
    {
      uiField: "Document Count",
      rogerApiField: "docCount",
      timSupport: "TIM/DMS document tracking — operational",
      sourceSystem: "TIM",
      govStatus: "gap",
      riskLevel: "medium",
      notes: "Operational document count. No governed evidence retention model identified.",
      batch: "B10",
    },
    {
      uiField: "Pending Doc Count",
      rogerApiField: "pendingDocCount",
      timSupport: "TIM/DMS pending document tracking",
      sourceSystem: "TIM",
      govStatus: "missing",
      riskLevel: "medium",
      notes: "No governed document approval model identified.",
      batch: "B10",
    },
  ],
  archNotes: [
    "Consolidation objects exist operationally — no formal consolidated filing governance",
    "No parent filing authority rules identified",
    "No entity contribution lineage identified",
    "No governed signoff semantics identified",
  ],
  govFindings: [
    "Consolidation objects are operational — not governed filing structures",
    "No formal consolidated filing governance identified",
    "No parent filing authority rules identified",
    "No entity contribution lineage identified",
    "No governed signoff semantics identified",
  ],
  riskIndicators: [
    "Missing Filing Authority — no consolidated filing governance",
    "Missing Signoff Governance — no approval chain",
    "Missing Immutable Audit Chain",
    "Missing Filing Lock State",
    "Missing Rollup Governance — no entity contribution lineage",
  ],
};

// ─── Governance Heatmap Data ──────────────────────────────────────────────────
export type HeatmapValue = "governed" | "partial" | "undefined" | "missing";

export interface HeatmapRow {
  capability: string;
  TIM: HeatmapValue;
  Roger: HeatmapValue;
  CEM: HeatmapValue;
  PDC: HeatmapValue;
  TDC: HeatmapValue;
}

export const HEATMAP_DATA: HeatmapRow[] = [
  { capability: "Filing Authority",        TIM: "undefined", Roger: "undefined", CEM: "undefined", PDC: "partial",   TDC: "partial"   },
  { capability: "Consolidated Rollups",    TIM: "partial",   Roger: "undefined", CEM: "undefined", PDC: "missing",   TDC: "missing"   },
  { capability: "Filing Signoff",          TIM: "undefined", Roger: "undefined", CEM: "undefined", PDC: "missing",   TDC: "partial"   },
  { capability: "Entity Lineage",          TIM: "undefined", Roger: "undefined", CEM: "partial",   PDC: "partial",   TDC: "missing"   },
  { capability: "Auditability",            TIM: "partial",   Roger: "undefined", CEM: "undefined", PDC: "partial",   TDC: "partial"   },
  { capability: "Filing Visibility",       TIM: "partial",   Roger: "partial",   CEM: "undefined", PDC: "undefined", TDC: "undefined" },
  { capability: "Deliverable Governance",  TIM: "partial",   Roger: "undefined", CEM: "undefined", PDC: "missing",   TDC: "missing"   },
  { capability: "Role Governance",         TIM: "partial",   Roger: "undefined", CEM: "undefined", PDC: "missing",   TDC: "missing"   },
  { capability: "Approval Workflow",       TIM: "undefined", Roger: "undefined", CEM: "undefined", PDC: "missing",   TDC: "partial"   },
  { capability: "Filing Lock State",       TIM: "missing",   Roger: "missing",   CEM: "missing",   PDC: "missing",   TDC: "partial"   },
];

// ─── ADR Dependency Tracker ───────────────────────────────────────────────────
export interface ADRCard {
  id: string;
  title: string;
  description: string;
  whyNeeded: string;
  riskIfUnresolved: string;
  impactedSystems: Owner[];
  currentStatus: "Open" | "In Progress" | "Proposed" | "Resolved";
  proposedOwner: Owner;
  severity: "high" | "medium" | "low";
}

export const ADR_CARDS: ADRCard[] = [
  {
    id: "ADR-1",
    title: "Consolidated Filing Governance",
    description: "Define the formal governance model for consolidated tax filings — who owns the consolidation object, what rules govern it, and how it is locked.",
    whyNeeded: "Consolidation objects currently exist only operationally in TIM. No governed filing authority has been defined. Roger UI displays consolidation data without a governance backing.",
    riskIfUnresolved: "Roger UI may present consolidation data that has no audit lineage, no filing authority, and no immutable record — creating compliance exposure.",
    impactedSystems: ["TIM", "Roger", "PDC", "TDC"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
  {
    id: "ADR-2",
    title: "Filing Authority Ownership",
    description: "Establish which system owns filing authority for consolidated returns — including Parent/Subsidiary role definitions and their governance implications.",
    whyNeeded: "Parent role exists operationally in TIM. No system has been designated as the filing authority owner. Role changes have no immutable audit trail.",
    riskIfUnresolved: "Filing authority disputes between TIM, Roger, and TDC could result in incorrect consolidated return submissions with no audit trail.",
    impactedSystems: ["TIM", "Roger", "TDC"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
  {
    id: "ADR-3",
    title: "Deliverable vs Filing Semantics",
    description: "Define the formal distinction between a TIM deliverable (operational task) and a governed filing (immutable tax record). Establish which system owns each concept.",
    whyNeeded: "Roger UI displays deliverables alongside filing data. TIM deliverables are operational tasks — they are NOT governed filings. This ambiguity creates governance risk.",
    riskIfUnresolved: "Practitioners may interpret deliverable completion as filing completion, creating false confidence in filing readiness and potential regulatory exposure.",
    impactedSystems: ["TIM", "Roger", "TDC"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
  {
    id: "ADR-4",
    title: "Filing Signoff Governance",
    description: "Define the governed signoff model for tax filings — who can approve, what constitutes a valid signoff, and how signoff is recorded immutably.",
    whyNeeded: "No governed approval chain has been identified in any current system. TIM tracks operational status (In Progress, Completed) but has no governed signoff semantics.",
    riskIfUnresolved: "Tax filings may be submitted without a governed approval record, creating audit and compliance exposure.",
    impactedSystems: ["TIM", "Roger", "CEM", "TDC"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
  {
    id: "ADR-5",
    title: "Filing Lineage Ownership",
    description: "Establish which system owns the lineage chain for each filing — from entity contribution through consolidation rollup to final filing record.",
    whyNeeded: "No entity contribution lineage has been identified. No rollup governance exists. Roger UI displays completion percentages with no lineage backing.",
    riskIfUnresolved: "Filing lineage gaps make it impossible to audit how a consolidated return was assembled, creating regulatory and restatement risk.",
    impactedSystems: ["PDC", "TDC", "Roger"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
  {
    id: "ADR-6",
    title: "Roger Visibility Mediation",
    description: "Define the mediation layer between Roger UI and the governed data systems (PDC, TDC). Establish what Roger can read, what it can write, and what it cannot access.",
    whyNeeded: "Roger currently reads from both TIM (operational) and PDC/TDC (governed) without a clear mediation boundary. This creates risk of Roger displaying ungoverned data as if it were governed.",
    riskIfUnresolved: "Roger UI may surface operational TIM data alongside governed PDC/TDC data without distinguishing between them, misleading practitioners.",
    impactedSystems: ["Roger", "TIM", "PDC", "TDC", "Orchestrator"],
    currentStatus: "Proposed",
    proposedOwner: "Orchestrator",
    severity: "medium",
  },
  {
    id: "ADR-7",
    title: "Filing Lock & Finalization",
    description: "Define the filing lock state — when a filing is considered final, who can lock it, and what happens to downstream systems when a filing is locked.",
    whyNeeded: "No filing lock state has been identified in any current system. TIM due dates are operational. No governed finalization event exists.",
    riskIfUnresolved: "Filings may be modified after they should be considered final, creating audit trail gaps and potential regulatory violations.",
    impactedSystems: ["TIM", "TDC", "Roger"],
    currentStatus: "Open",
    proposedOwner: "TDC",
    severity: "high",
  },
];

// ─── Summary Tile Counts (derived from field mappings) ───────────────────────
export function computeSummaryTiles() {
  const allFields = [
    ...SCREEN1_MAPPING.fields,
    ...SCREEN2_MAPPING.fields,
    ...SCREEN3_MAPPING.fields,
    ...SCREEN4_MAPPING.fields,
  ];
  const totalScreens = 6;
  const fullyMapped = allFields.filter(f => f.govStatus === "governed").length;
  const partial = allFields.filter(f => f.govStatus === "partial").length;
  const gaps = allFields.filter(f => f.govStatus === "gap").length;
  const missing = allFields.filter(f => f.govStatus === "missing").length;
  const adrDeps = ADR_CARDS.filter(a => a.currentStatus === "Open" || a.currentStatus === "In Progress").length;
  const consolidatedRisks = allFields.filter(f => f.adrRef === "ADR-1" || f.adrRef === "ADR-5").length;
  const unmapped = allFields.filter(f => f.govStatus === "missing" || f.govStatus === "gap").length;
  return { totalScreens, fullyMapped, partial, gaps, missing, adrDeps, consolidatedRisks, unmapped, total: allFields.length };
}
