// DCT Platform Gate Verification Dashboard — Data Model
// RSM | DCT + Roger | Prototype Sandbox / UI Dashboards
// Design: RSM Command Center — consulting-grade, data-forward, RSM Blue authority palette
// Last updated: April 20, 2026 — aligned to DCT_Batch_Roadmap_v1.8

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
  // v1.8 additions
  overview?: string;
  piLabel?: string;
  stories?: string[];
  outcomes?: string[];
  whatMustBeTrue?: string;
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
  name: "File Ingestion & Initial Storage",
  status: "ACTIVE",
  touchpoints: ["T1", "T2", "T3"],
  primarySystem: "PDC",
  keyGate: "G1 — Schema Lock",
  entryCondition: "Foundation Core complete",
  exitCondition: "Ingestion contract published; lineage anchor established for all entities in scope",
  batchLead: "PDC Workstream Lead",
  openIssues: 2,
  completionPct: 78,
  startDate: "2026-02-03",
  targetDate: "2026-03-28",
  piLabel: "PI 1",
  overview: "The platform can receive a client financial file, assign it a permanent immutable identifier, and establish the lineage anchor every downstream record traces back to. Roger gains visibility into ingestion status — it can confirm a file arrived and is being processed before AI is ever invoked.",
  whatMustBeTrue: "Establish PDC as the authoritative ingestion layer by creating a JobId-based ingestion model, capturing immutable lineage at entry, enforcing a PDC-owned state machine, and storing raw + metadata only (no tax logic). Required fields: JobId (GUID), DocumentId (immutable), ClientId, EntityId, SourceFileId, PeriodStart, PeriodEnd. Note: TaxYear is NOT stored or required in PDC — TaxYear is derived in TDC from PeriodStart/PeriodEnd.",
  stories: [
    "Implement PDC Ingestion Framework — the work + governance (reference data discovered and created as needed)",
    "Create Dev Infrastructure",
  ],
  outcomes: [
    "A file is uploaded via Tax Portal → Service Bus → PDC",
    "PDC creates: JobId, DocumentId, ClientId + EntityId captured, file lands in PDC, State = INGESTED",
    "Lineage is immediately visible",
    "IngestionStatus API returns: JobId-based status retrieval, EntityId, DocumentId, Timestamps",
  ],
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
  piLabel: "Complete",
  overview: "Establishes the development infrastructure, environments, and agent tooling the entire platform depends on. Nothing is delivered to Roger from this batch — it is the prerequisite for everything that follows.",
  stories: [],
  outcomes: [
    "Code repository created and configured",
    "Code templates deployed",
    "Copilot Agent and Blitzy configured",
    "DEV environment in Azure provisioned",
    "Both PDC and TDC teams ready to build",
  ],
  gates: []
};

// ─── ALL BATCHES ─────────────────────────────────────────────────────────────

export const allBatches: ArchitecturalBatch[] = [
  foundationCoreBatch,
  activeBatch,
  {
    id: "AB-02",
    name: "Normalization & Cross-LOB Taxonomy",
    status: "PLANNED",
    touchpoints: ["T4", "T5"],
    primarySystem: "PDC + AI Orchestrator",
    keyGate: "G2 — Invariant Lock",
    entryCondition: "AB-01 Schema Lock Certificates issued",
    exitCondition: "Normalized Trial Balance contract published; vNormalizedTb available to Roger",
    batchLead: "PDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-05-16",
    piLabel: "PI 1",
    overview: "PDC establishes the firm's canonical financial taxonomy — the universal classification layer that gives every client account a firm-standard meaning regardless of service line. The Orchestrator reads schemas and taxonomy from PDC, normalizes incoming files, and returns classified records. Roger gains its first governed read contract against real financial data.",
    whatMustBeTrue: "PDC hosts the canonical schemas and firm taxonomy reference data the Orchestrator needs to identify, normalize, and classify files. The Orchestrator does the work and returns normalized records to PDC. PDC persists and surfaces them. PDC does not transform data — it stores, retrieves, and exposes it. Runs in parallel with Batch 3. Identifier relationship: DocumentId → EntityId → PeriodStart and PeriodEnd → ClientId.",
    stories: [
      "File Schemas & Firm Financial Taxonomy Reference Data",
      "Master Data Management — Firm Financial Taxonomy & File Schemas",
      "EDGAR Corpus Reference Data",
      "Persist Normalized Records & Financial Facts",
      "Normalized Trial Balance Contract (Roger Read Surface)",
    ],
    outcomes: [
      "FileSchemas and FirmTaxonomy (XLOB) definitions are queryable and versioned",
      "A file moves through INGESTED → PROCESSING → READY with a RunId assigned",
      "Normalized Trial Balance data with XLOB classification is persisted and queryable",
      "vNormalizedTb returns clean financial facts for an EntityId + PeriodStart + PeriodEnd + RunId (latest run by default)",
    ],
    gates: []
  },
  {
    id: "AB-03",
    name: "Tax Domain Authority & Tax Taxonomy",
    status: "PLANNED",
    touchpoints: ["T5", "T6", "T7"],
    primarySystem: "TDC",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-02 Invariant Lock Records issued",
    exitCondition: "TDC established as tax domain authority; Tax taxonomy and mapping rules versioned and available to Orchestrator",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-07-11",
    piLabel: "PI 1",
    overview: "Establishes TDC as the tax domain authority. TDC owns tax form definitions, form lines, return templates, firm tax taxonomy, mapping rules, and tax-specific reference data (including filing due dates and confidence thresholds). Taxonomy and rules enable mapping but do not execute mapping. This batch must be complete before AI tax mapping can begin. Runs in parallel with PDC Batch 2.",
    whatMustBeTrue: "TDC hosts the tax forms, return templates, and tax taxonomy reference data the Orchestrator needs to generate mapping proposals. TDC builds the tables, enables the admin team to load and manage data via Swagger, and exposes a read contract for the Orchestrator to consume. TDC does not receive anything from the Orchestrator in this batch. Domain Governance Note (3b): Tax calculation reference data (e.g., MACRS, §179, tax rates, NOL rules) shall be governed, versioned tables and must not be hard-coded in logic.",
    stories: [
      "Tax Forms, Return Templates & Tax Taxonomy Reference Data",
      "Master Data Management — Tax Forms, Taxonomy & Mapping Rules",
      "TDC Reference Data Read Contract (Orchestrator-facing)",
    ],
    outcomes: [
      "TaxFormTemplates and FormLines are queryable by Jurisdiction and TaxYear (derived from PeriodStart)",
      "TaxTaxonomyAccounts and MappingRules are available and versioned",
      "ConfidenceBandThresholds are configured (GREEN / YELLOW / RED)",
      "TDC is fully prepared for AI Tax Mapping (Batch 4)",
    ],
    gates: []
  },
  {
    id: "AB-04",
    name: "AI Tax Mapping & Explainability",
    status: "PLANNED",
    touchpoints: ["T8", "T9", "T10", "T11"],
    primarySystem: "TDC + AI Orchestrator",
    keyGate: "G4 — Contract Publication",
    entryCondition: "AB-03 TDC reference data and taxonomy available to Orchestrator",
    exitCondition: "TDC Records API contract live; Roger primary read contract published",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-09-19",
    piLabel: "PI 2 — Committed",
    overview: "The Orchestrator delivers tax mapping proposals to TDC for the first time. Every account gets a proposal with a confidence band and structured evidence. Practitioners can accept, override, or reject. All decisions are immutable and auditable. Roger gets its primary TDC read contract — this is the moment the platform comes to life for a practitioner.",
    whatMustBeTrue: "The Orchestrator has completed its tax mapping work and delivers proposals to TDC. TDC receives and persists proposals as immutable records with confidence scores and structured evidence. Practitioners act on proposals — decisions are recorded immutably and layered on top without mutation. TDC publishes facts. Roger's primary read contract is live.",
    stories: [
      "AI Mapping Proposals",
      "Mapping Decisions",
      "Decision Audit & Event Publishing",
      "TDC Records API Contract (Roger Read Surface)",
    ],
    outcomes: [
      "Every account has a mapping proposal with confidence score and band",
      "Proposals include structured evidence (rules, prior year, SEC peer, model version)",
      "Practitioners can accept / override / reject — decisions recorded immutably",
      "Roger can display: GREEN/YELLOW/RED distribution, pending vs decided, full traceability to source",
    ],
    gates: []
  },
  {
    id: "AB-05",
    name: "Entity Identity & Structure",
    status: "PLANNED",
    touchpoints: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11"],
    primarySystem: "PDC",
    keyGate: "All Gates",
    entryCondition: "AB-04 Published Contracts stable; no open gate failures",
    exitCondition: "EntityId risk closed; PDC entity registry live; Roger identity layer available",
    batchLead: "PDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-12-04",
    piLabel: "PI 2 — Committed",
    overview: "PDC establishes the authoritative entity registry — client groups and legal entities — and serves as the single source of truth for EntityId across the platform. Ownership relationships, jurisdictions, and entity characteristics are stored as governed, versioned facts. This closes the EntityId risk that has been an open item since PI 1. Roger gains a stable, governed identity layer it can use to scope views, navigate multi-entity engagements, and display client hierarchy. Batch 5 also establishes governed synchronization with upstream systems (CEM) and user-to-entity entitlement mappings required for downstream consumption.",
    whatMustBeTrue: "PDC must function as the system of record for entity identity, where each entity is assigned a unique, immutable GUID-based EntityId linked to a ClientId. The model must support complex client group structures, including multiple entities per client and parent-child ownership relationships that are hierarchical, queryable, and time-aware. Ownership, jurisdiction, and entity characteristic data are loaded through a governed Admin API as an interim approach until upstream systems (MDM/EODS) become available. All entity, ownership, jurisdiction, and characteristic records must include a DataSourceType field (e.g., ADMIN_API_MANUAL, CEM_SYNC, MDM_SYNC, EODS_SYNC). PDC must support governed synchronization of client and legal entity identity from upstream systems (CEM) and maintain user-to-entity entitlement mappings for downstream consumption, without acting as an authoring or authorization system.",
    stories: [
      "CEM Integration & Sync",
      "Entity Identity Read Contract (PDC-facing)",
      "User Entitlement Sync & Read Contract",
      "Client Groups & Legal Entity Registration",
      "Ownership Chains, Jurisdictions & Entity Characteristics",
    ],
    outcomes: [
      "A client group with multiple legal entities is created and persisted in PDC",
      "Ownership relationships (parent/sub) are visible and queryable",
      "Each entity displays jurisdiction and structural attributes",
      "EntityId is consistently used across ingestion, processing, and consumption layers",
      "DataSourceType is visible for entity, ownership, and characteristic records",
      "CEM client and legal entity data is synced and versioned in PDC — sync behavior is idempotent",
      "User-to-entity mappings are stored and retrievable; unmapped roles are captured and excluded",
    ],
    gates: []
  },
  {
    id: "AB-06",
    name: "Practitioner Review, Adjustments & Lock",
    status: "PLANNED",
    touchpoints: ["T2", "T3", "T8", "T10"],
    primarySystem: "TDC + Roger UI",
    keyGate: "G4 — Contract Publication",
    entryCondition: "AB-04 closes (sequential anchor)",
    exitCondition: "Tax-ready records derived; sign-off non-repudiable; lock terminal; Roger surfaces full workflow",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2027-02-12",
    piLabel: "PI 2 — Committed",
    overview: "Practitioners can now do real work. Review tasks are generated automatically from data state. Adjustments move through a governed lifecycle. Tax-ready records are derived deterministically from mapping decisions and approved book-to-tax adjustments only. Sign-off is non-repudiable, and lock is terminal. Roger surfaces the full practitioner workflow — proposals, decisions, adjustments, derivation results, and finalization state — for the first time end to end.",
    whatMustBeTrue: "Batch 6 establishes a governed practitioner workflow where review tasks are generated automatically from data state and entity status is derived from task and adjustment activity. Adjustments move through a controlled, versioned lifecycle with rule-based approval, and all records are immutable once finalized. Tax-ready records are system-derived from accepted decisions and approved adjustments only. Finalization requires non-repudiable sign-off. Lock is terminal — mutation attempts are rejected and logged. Unlock transitions entity to AMENDED through a governed operation with recorded actor, reason, and timestamp.",
    stories: [
      "Review Task Generation & Entity Status Derivation",
      "Book-to-Tax Adjustment Lifecycle",
      "Tax-Ready Record Derivation",
      "Practitioner Sign-Off & Lock",
      "Batch 6 Read Contract (Roger Read Surface)",
    ],
    outcomes: [
      "Review tasks generated automatically from data state — trackable by entity and reporting period",
      "Entity review status derived and visible: OPEN, IN_REVIEW, FINALIZED, or AMENDED",
      "Practitioners can create, submit, approve, reject, apply, and lock book-to-tax adjustments",
      "Tax-ready records derived deterministically from mapping decisions and approved adjustments only",
      "UNRESOLVED tax-ready records persisted as first-class outputs where practitioner decision is still missing",
      "Practitioners can complete non-repudiable sign-off with explicit scope and locked finalization state",
      "Locked records are immutable — mutation attempts are rejected and logged",
      "Unlock transitions entity to AMENDED through a governed operation with recorded actor, reason, and timestamp",
      "Roger retrieves: review task state, adjustment state, derivation results, finalization state, and lock events",
      "Audit and lineage views show end-to-end traceability from proposal through decision, adjustment, derivation, sign-off, and lock",
    ],
    gates: []
  },
  {
    id: "AB-07",
    name: "Client Tax Profile & Eligibility",
    status: "PLANNED",
    touchpoints: ["T6", "T7"],
    primarySystem: "TDC",
    keyGate: "G2 — Invariant Lock",
    entryCondition: "AB-06 closes (sequential anchor)",
    exitCondition: "Eligibility gate enforced; determination records versioned and immutable; Roger read contract live",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-09-30",
    piLabel: "PI 2 — Committed",
    overview: "TDC serves as the system of record for tax profile and eligibility determinations at the EntityId and ReportingPeriod level. Eligibility is governed through a structured three-tier model (Must Have, Must Not Have, Flag & Review) with all rules explicitly defined and versioned. Eligibility acts as a downstream processing gate — entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state must not proceed to AI mapping or practitioner workflow.",
    whatMustBeTrue: "Determinations are system-evaluated, persisted as governed records, and fully traceable to the exact rule versions and entity inputs used. Flag & Review conditions require explicit practitioner confirmation or override before a determination can be finalized. Determination outcomes are versioned and immutable once finalized, with re-determination producing a new record rather than overwriting prior results. Determination and re-determination are explicitly triggered governed operations and are not executed automatically or by background processes.",
    stories: [
      "Corporate Tax Profile Reference Data (Form 1120)",
      "Non-Corporate Profile Reference Data (Partnerships, S-Corps, Trusts)",
      "Three-Tier Eligibility Model",
      "Client Tax Profile Lifecycle & Determination Records",
      "Controlled Group & Affiliated Group Determination",
      "Batch 7 Read Contract (Roger Read Surface)",
    ],
    outcomes: [
      "A client entity is evaluated and assigned a tax profile (e.g., Form 1120)",
      "Eligibility rules are executed and visible (Must Have / Must Not Have / Flag & Review)",
      "Determination results are versioned, persisted, and fully auditable with rule and input traceability",
      "Flagged conditions require and capture practitioner confirmation or override",
      "Controlled group and affiliated group status derived and visible based on PDC ownership data",
      "Eligibility gate status is visible (allowed vs blocked for downstream processing)",
      "Entities in FLAG_AND_REVIEW or without a finalized determination are blocked from downstream workflow",
      "Re-determination produces new versioned records while preserving prior history",
      "Roger retrieves: eligibility status, rule reasoning, group status, and gate state through the read contract",
    ],
    gates: []
  },
  {
    id: "AB-08",
    name: "Exceptions & Remediation",
    status: "PLANNED",
    touchpoints: ["T8"],
    primarySystem: "PDC + TDC",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "PDC: parallel to AB-07 · TDC: sequential after AB-07 closes",
    exitCondition: "All exception types structured and queryable; PDC and TDC read contracts published",
    batchLead: "PDC Workstream Lead + TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-09-30",
    piLabel: "PI 2 — Committed",
    overview: "Failures are never silent. Every exception across ingestion, normalization, mapping, and workflow is structured, queryable, and tracked through to resolution. Roger can surface exception status to practitioners — data quality issues and processing failures are visible rather than hidden. The data team can manage exceptions without direct database access.",
    whatMustBeTrue: "PDC captures ingestion and normalization exceptions — failure type, entity, period, root cause, and remediation lifecycle. PDC Exceptions read contract published. TDC captures mapping, decision, and workflow exceptions — failure type, entity, period, root cause, and remediation lifecycle. TDC Exceptions read contract published.",
    stories: [
      "PDC/TDC Exception Record Structure & Failure Tracking",
      "PDC/TDC Flag Management & Remediation Actions",
      "PDC/TDC Root Cause Tracking & Resolution Records",
      "PDC/TDC Exceptions Read Contract (4 stories each — PDC and TDC)",
    ],
    outcomes: [
      "Exceptions generated during ingestion, mapping, or eligibility evaluation",
      "Exceptions visible with full context (entity, record, source)",
      "Practitioners can view, assign, and update exception status",
      "Remediation actions are recorded and tracked to resolution",
      "Root cause is captured and visible for each exception",
      "Exceptions do not break processing — they are handled within governed workflows",
      "Exception data exposed via API for UI consumption (Roger)",
      "End-to-end traceability: Source data → Exception → Resolution → Final outcome",
    ],
    gates: []
  },
  {
    id: "AB-09",
    name: "IMS Integration & Prior Year Retrieval / Rollforward & Prior Year Intelligence",
    status: "PLANNED",
    touchpoints: ["T1", "T2", "T3", "T4", "T5"],
    primarySystem: "PDC + TDC + AI Orchestrator",
    keyGate: "All Gates",
    entryCondition: "AB-08 complete",
    exitCondition: "Prior year data normalized and in TDC; rollforward proposals generated; v_rollforward contract live",
    batchLead: "PDC Workstream Lead + TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-06-30",
    piLabel: "PI 2 — Stretch",
    overview: "PDC establishes a governed, contract-first integration with IMS to retrieve prior year tax decision data. TDC consumes normalized prior year decision data and generates rollforward proposals for the current tax year, enabling practitioners to review and validate carryforward mappings instead of starting from scratch.",
    whatMustBeTrue: "PDC (IMS Integration): PDC is the single inbound integration point — initiates all IMS retrievals (pull model). IMS returns prior year mapping decision data only (no TB, no return amounts). PDC enforces a strict inbound contract (OpenAPI, versioned). Invalid payloads are rejected with structured errors — never passed downstream. Valid payloads are routed to the Orchestrator for normalization. Only normalized, governed output is delivered to TDC — raw IMS payload is transient (never stored). Flow: IMS → PDC → Orchestrator → TDC. TDC (Rollforward): Prior year data is immutable, versioned, scoped by Entity + TaxYear + ReturnType. Rollforward proposals are new records (not copies), reference prior year decision (lineage required). SourceType = ROLLFORWARD vs ORCHESTRATOR. No prior year data = UNRESOLVED state (not error). Proposal generation is explicit (API triggered) and append-only (no overwrite).",
    stories: [
      "IMS Sync Mechanism & Schema Registry",
      "IMS Inbound Retrieval Contract",
      "Prior Year Reference Data",
      "Rollforward Proposals",
      "v_rollforward Read Contract",
    ],
    outcomes: [
      "Trigger an IMS sync for an entity / year / return type",
      "Show schema validation (success + rejection scenarios)",
      "Display SyncRun record + lineage event",
      "Show normalized data flowing into TDC (not raw IMS payload)",
      "Demonstrate contract-first enforcement (schema mismatch rejection)",
      "Show that PDC never persists raw IMS data",
      "Load prior year data (IMS or manual path)",
      "Show versioned prior year dataset (ACTIVE vs SUPERSEDED)",
      "Generate rollforward proposals — show exact match vs approximate vs unresolved, confidence scoring + bands",
      "Display lineage: Proposal → prior year record → source",
      "Show Roger consuming: rollforward proposals and prior year context",
      "Demonstrate append-only behavior (no overwrites)",
    ],
    gates: []
  },
  {
    id: "AB-10",
    name: "Return Assembly, Filing & Lineage Closure",
    status: "PLANNED",
    touchpoints: ["T9", "T10", "T11"],
    primarySystem: "TDC + Roger UI",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-09 complete",
    exitCondition: "Filing record immutable; IMS outbound contract published; end-to-end lineage queryable",
    batchLead: "TDC Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2025-12-31",
    piLabel: "PI 2 — Stretch",
    overview: "Every form line traces to a locked tax-ready record. The filing record is immutable. End-to-end lineage is queryable from source file to filing confirmation in a single view. IMS receives locked return-ready data via a governed outbound contract. Roger surfaces the complete return assembly, filing status, and full lineage chain — a CPA can answer where any number came from on any return.",
    whatMustBeTrue: "TDC assembles returns from locked tax-ready records using versioned return templates, enforces cross-schedule validation, produces an immutable filing record, and publishes IMS outbound and Roger return output contracts. Cross-layer lineage view closes end-to-end traceability from source file through to filing confirmation.",
    stories: [
      "Return Assembly & Cross-Schedule Validation",
      "Filing Record",
      "Return Output Contracts",
      "IMS Outbound Contract Publication (gated on IMS readiness)",
      "Cross-Layer Lineage View",
    ],
    outcomes: [
      "Assemble a return from tax-ready records",
      "Show validation passing/failing scenarios",
      "Lock and generate filing record — demonstrate immutable return snapshot",
      "Send (or simulate) outbound payload to IMS",
      "Show Roger: full return view and filing status",
      "Execute lineage trace: click from return → tax record → source document",
      "Prove end-to-end auditability — 'where did this number come from'",
    ],
    gates: []
  },
  {
    id: "AB-11",
    name: "Learning Governance & Model Evolution",
    status: "PLANNED",
    touchpoints: ["T1", "T2", "T3", "T4", "T5"],
    primarySystem: "TDC + AI Orchestrator",
    keyGate: "All Gates",
    entryCondition: "AB-04 and AB-06 complete; sufficient production decisions available",
    exitCondition: "Learning signals captured; model registry live; confidence trend data available to Roger",
    batchLead: "TDC Workstream Lead + AI Workstream Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2026-06-30",
    piLabel: "PI 2 — Stretch",
    overview: "The platform closes the AI feedback loop. Mapping decisions, practitioner overrides, and confidence outcomes are captured as structured learning signals. Governance controls ensure model updates are versioned, reviewed, and traceable before deployment. Roger surfaces model version context and confidence trend data to practitioners, and the platform can demonstrate that AI quality improves over time through governed evidence.",
    whatMustBeTrue: "TDC captures practitioner decisions — accepts, overrides, and rejects — as structured feedback signals attached to the originating mapping proposal, model version, and confidence band. These signals are persisted as immutable records, never mutated, and queryable by entity, period, and model version. Model updates must be versioned, registered in TDC's model registry, reviewed through a governed approval workflow, and deployed only after explicit sign-off. No model version is active in production without a traceable approval record. Rollback to a prior model version is a governed operation with recorded actor, reason, and timestamp. The learning feedback loop does not automatically retrain or update models — it captures and governs the signals that inform model evolution decisions made by the AI/data science team.",
    stories: [
      "Learning Signal Capture & Feedback Record (decision outcomes attached to proposals and model versions)",
      "Model Registry & Version Governance (registration, approval workflow, deployment gate, rollback)",
      "Confidence Trend Analytics & Drift Detection (queryable metrics by model version, entity type, and period)",
      "Batch 11 Read Contract (Roger Read Surface — model version context, confidence trends, feedback visibility)",
    ],
    outcomes: [
      "Practitioner accept/override/reject decisions are captured as structured feedback signals attached to the originating proposal and model version",
      "Feedback records are immutable, versioned, and queryable by entity, period, and model version",
      "Model registry shows current active version, prior versions, approval records, and deployment history",
      "A model version update requires and records explicit sign-off before activation",
      "Rollback to a prior model version is demonstrated as a governed operation with full audit trail",
      "Confidence trend report shows override rate, acceptance rate, and band distribution by model version over time",
      "Roger surfaces model version context on mapping proposals — practitioners can see which model version produced each proposal",
      "Roger surfaces confidence trend data — practitioners and leadership can see whether AI quality is improving",
      "Drift detection flags statistically significant changes in confidence band distribution between model versions",
    ],
    gates: []
  },
  {
    id: "AB-12",
    name: "Migration Track (Parallel)",
    status: "PLANNED",
    touchpoints: ["T10", "T11"],
    primarySystem: "PDC + TDC",
    keyGate: "G3 — Lineage Closure",
    entryCondition: "AB-01 Gate 3 (ingestion contract published) · AB-02 Gate 3 (normalized TB contract published)",
    exitCondition: "Legacy system data migrated; TWB and Partnersight retirement targets met",
    batchLead: "Program Delivery Lead",
    openIssues: 0,
    completionPct: 0,
    startDate: undefined,
    targetDate: "2027-05-01",
    piLabel: "Parallel — Transitional",
    overview: "Legacy system data migration enables retirement of TWB, Partnersight, and other workpaper platforms. This track runs parallel to core batches and is explicitly transitional — it closes when legacy systems are fully retired. All inbound migration data flows through PDC ingestion via the JobId-based ingestion model.",
    whatMustBeTrue: "All inbound migration data flows through PDC ingestion via the JobId-based ingestion model, consistent with the platform pattern. PDC normalizes where appropriate, persists as reference where data is already tax-decided, and signals READY for TDC consumption. Migration is transitional — not a permanent platform capability. PDC is the single front door for all inbound data, including migration.",
    stories: [
      "TWB Historical TB Extraction",
      "TWB Prior Year Mapping Decisions",
      "Migration Validation & Reconciliation",
      "Partnersight Data Extraction",
    ],
    outcomes: [
      "For a migrated 1120 entity, prior year TB data is extracted from TWB and loaded to PDC with lineage to TWB source",
      "For a migrated 1120 entity, prior year mapping decisions are available in TDC for rollforward",
      "A migration audit report confirms record counts, field mappings, and data integrity between source and target",
      "For a migrated 1065 entity, partnership workpaper data and K-1 history are available in PDC with lineage",
    ],
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

export function artifactStatusIcon(status: GateArtifact["status"]): string {
  switch (status) {
    case "ISSUED": return "✓";
    case "PENDING": return "⏳";
    case "MISSING": return "✗";
  }
}
