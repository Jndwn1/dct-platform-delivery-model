/**
 * Roger Consumer Readiness Data Library
 *
 * PURPOSE: Surface consumer-facing readiness information for Roger teams.
 * PERSPECTIVE: "What can Roger operationally consume today?" — not "How is DCT building it?"
 *
 * GOVERNANCE: PDC = Phoenix Data Consolidation | TDC = Tax Data Consolidation
 * Roger consumes governed contracts via the Roger Gateway. Roger does NOT own lineage,
 * governance, or tax authority.
 */

// ── Readiness Status Types ────────────────────────────────────────────────────

export type ConsumerReadiness =
  | "Consumer Ready"
  | "Delivered"
  | "Partial Data"
  | "Mock/Demo Only"
  | "Governance Pending"
  | "Blocked"
  | "Future State";

export type DataAvailability =
  | "Real Data"
  | "Partial Data"
  | "Mock Data"
  | "Sample Payload"
  | "Contract Draft"
  | "Pipeline Validated"
  | "Swagger Only"
  | "Demo Only"
  | "In Progress";

export type DemoReadiness = "Demo Ready" | "Partial Demo" | "Mocked" | "Conceptual" | "Not Started";
export type ProdReadiness = "Production Ready" | "Near Ready" | "In Progress" | "Blocked" | "Future State";

// ── Readiness Status Styles ───────────────────────────────────────────────────

export const CONSUMER_READINESS_STYLES: Record<ConsumerReadiness, { bg: string; text: string; border: string; label: string }> = {
  "Consumer Ready":    { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7", label: "Consumer Ready" },
  "Delivered":         { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd", label: "Delivered" },
  "Partial Data":      { bg: "#fef9c3", text: "#854d0e", border: "#fde047", label: "Partial Data" },
  "Mock/Demo Only":    { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe", label: "Mock / Demo Only" },
  "Governance Pending":{ bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", label: "Governance Pending" },
  "Blocked":           { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", label: "Blocked" },
  "Future State":      { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1", label: "Future State" },
};

export const DATA_AVAILABILITY_STYLES: Record<DataAvailability, { bg: string; text: string }> = {
  "Real Data":          { bg: "#d1fae5", text: "#065f46" },
  "Partial Data":       { bg: "#fef9c3", text: "#854d0e" },
  "Mock Data":          { bg: "#f3e8ff", text: "#6b21a8" },
  "Sample Payload":     { bg: "#fef9c3", text: "#854d0e" },
  "Contract Draft":     { bg: "#fff7ed", text: "#9a3412" },
  "Pipeline Validated": { bg: "#dbeafe", text: "#1e40af" },
  "Swagger Only":       { bg: "#f1f5f9", text: "#475569" },
  "Demo Only":          { bg: "#fce7f3", text: "#9d174d" },
  "In Progress":        { bg: "#fff7ed", text: "#c2410c" },
};

// ── Roger Endpoint Readiness Matrix ──────────────────────────────────────────

export interface EndpointReadinessRow {
  batch: string;
  api: string;
  path: string;
  owner: "PDC" | "TDC" | "Orchestrator" | "PDC+TDC";
  rogerCapability: string;       // What Roger screen/feature this enables
  consumerReadiness: ConsumerReadiness;
  dataAvailability: DataAvailability;
  governanceStatus: string;      // ADR, contract, or governance dependency
  blockers: string;              // What is preventing Roger from consuming
  platformExists: boolean;       // API exists in platform
  rogerCanConsume: boolean;      // Roger can actually use it today
}

export const ENDPOINT_READINESS_MATRIX: EndpointReadinessRow[] = [
  // ── Foundation Core ──────────────────────────────────────────────────────
  {
    batch: "FC",
    api: "Ingestion Run — Submit",
    path: "POST /api/v1/ingestion-runs",
    owner: "PDC",
    rogerCapability: "Upload Experience — trigger file ingestion",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "FC",
    api: "Ingestion Run — Get Status",
    path: "GET /api/v1/ingestion-runs/{id}",
    owner: "PDC",
    rogerCapability: "Upload Experience — show ingestion status",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 1 ──────────────────────────────────────────────────────────────
  {
    batch: "B1",
    api: "Processing Run — Get Latest",
    path: "GET /api/v1/processing-runs/by-ingestion/{id}/latest",
    owner: "PDC",
    rogerCapability: "Dashboard — file processing status",
    consumerReadiness: "Partial Data",
    dataAvailability: "Real Data",
    governanceStatus: "Contract Published — PeriodStart/End missing from Consumer Guide",
    blockers: "Consumer Guide incomplete — PeriodStart/End not documented",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "B1",
    api: "Ingestion Job — Get by ID",
    path: "GET /api/v1/ingestion-jobs/{jobId}",
    owner: "PDC",
    rogerCapability: "Work Queue — ingestion job tracking",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 2 ──────────────────────────────────────────────────────────────
  {
    batch: "B2",
    api: "Normalized TB — Get Records",
    path: "GET /api/v1/data-records",
    owner: "PDC",
    rogerCapability: "Filing Review — normalized trial balance data",
    consumerReadiness: "Partial Data",
    dataAvailability: "Real Data",
    governanceStatus: "Batch 2A Contract — FirmTaxonomyId enforcement pending ADR-06",
    blockers: "FirmTaxonomyId field pending ADR-06 approval; payload incomplete",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 2A ─────────────────────────────────────────────────────────────
  {
    batch: "B2A",
    api: "Normalized TB — FirmTaxonomyId",
    path: "GET /api/v1/data-records (field: firmTaxonomyId)",
    owner: "PDC",
    rogerCapability: "Filing Review — taxonomy classification on TB records",
    consumerReadiness: "Governance Pending",
    dataAvailability: "Partial Data",
    governanceStatus: "ADR-06 pending — FirmTaxonomyId enforcement not yet approved",
    blockers: "ADR-06 approval required before field is enforced in payload",
    platformExists: true,
    rogerCanConsume: false,
  },
  // ── Batch 3 ──────────────────────────────────────────────────────────────
  {
    batch: "B3",
    api: "Tax Form Templates — Get",
    path: "GET /api/v1/tax-form-templates",
    owner: "TDC",
    rogerCapability: "Filing Review — tax form template reference data",
    consumerReadiness: "Delivered",
    dataAvailability: "Real Data",
    governanceStatus: "TDC Reference Data Read Contract — Orchestrator-facing only",
    blockers: "Orchestrator-facing contract; Roger access path via Gateway not yet confirmed",
    platformExists: true,
    rogerCanConsume: false,
  },
  // ── Batch 4 ──────────────────────────────────────────────────────────────
  {
    batch: "B4",
    api: "AI Mapping Proposals — Get",
    path: "GET /api/v1/mapping-proposals",
    owner: "TDC",
    rogerCapability: "Filing Review — AI mapping suggestions for practitioner review",
    consumerReadiness: "Partial Data",
    dataAvailability: "Real Data",
    governanceStatus: "AI Mapping Proposals Contract — proposals available, confidence scoring active",
    blockers: "Proposal confidence scoring may be incomplete for some entity types",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "B4",
    api: "Mapping Decisions — Create",
    path: "POST /api/v1/mapping-decisions",
    owner: "TDC",
    rogerCapability: "Filing Review — practitioner accept/override/reject mapping",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "TDC Primary Read Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "B4",
    api: "TDC Records — Get",
    path: "GET /api/v1/tdc-records",
    owner: "TDC",
    rogerCapability: "Dashboard / Filing Review — primary TDC read surface",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "Roger Primary TDC Read Contract — GREEN/YELLOW/RED status",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 5 ──────────────────────────────────────────────────────────────
  {
    batch: "B5",
    api: "Entity Identity — Get",
    path: "GET /api/v1/entities/{entityId}",
    owner: "PDC",
    rogerCapability: "Client List — entity identity and RBAC",
    consumerReadiness: "Partial Data",
    dataAvailability: "Real Data",
    governanceStatus: "EntityId contract scope under review — RBAC context field missing from Consumer Guide",
    blockers: "RBAC context field not yet documented; ClientGroupId scope to be confirmed",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "B5",
    api: "Client Group — Get",
    path: "GET /api/v1/client-groups/{clientGroupId}",
    owner: "PDC",
    rogerCapability: "Client List — fetch client list for current user",
    consumerReadiness: "Partial Data",
    dataAvailability: "Real Data",
    governanceStatus: "ClientGroupId scope pending confirmation with PDC team",
    blockers: "ClientGroupId scope not yet confirmed for PI 2 sprint planning",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 6 ──────────────────────────────────────────────────────────────
  {
    batch: "B6",
    api: "Review Tasks — Get",
    path: "GET /api/v1/review-tasks",
    owner: "TDC",
    rogerCapability: "Work Queue — practitioner review task list",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "TDC Review Task Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  {
    batch: "B6",
    api: "Tax-Ready Records — Get",
    path: "GET /api/v1/tax-ready-records",
    owner: "TDC",
    rogerCapability: "Filing Review — locked, derived tax-ready records",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "TDC Tax-Ready Contract Published — immutable records",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 7 ──────────────────────────────────────────────────────────────
  {
    batch: "B7",
    api: "Eligibility — Get Status",
    path: "GET /api/v1/eligibility/{entityId}",
    owner: "TDC",
    rogerCapability: "Eligibility — entity eligibility status and rule reasoning",
    consumerReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    governanceStatus: "TDC Eligibility Contract Published",
    blockers: "None",
    platformExists: true,
    rogerCanConsume: true,
  },
  // ── Batch 8 ──────────────────────────────────────────────────────────────
  {
    batch: "B8",
    api: "Exception Record — Create",
    path: "POST /api/v1/exception-records",
    owner: "PDC+TDC",
    rogerCapability: "Work Queue / Adjustments — exception tracking",
    consumerReadiness: "Governance Pending",
    dataAvailability: "In Progress",
    governanceStatus: "B8 active delivery — contract not yet published",
    blockers: "Contract publication pending; no seeded data yet",
    platformExists: false,
    rogerCanConsume: false,
  },
  {
    batch: "B8",
    api: "Remedy Action — Create",
    path: "POST /api/v1/remedy-actions",
    owner: "PDC+TDC",
    rogerCapability: "Adjustments — remediation action tracking",
    consumerReadiness: "Future State",
    dataAvailability: "In Progress",
    governanceStatus: "B8 active delivery — not yet available",
    blockers: "API in development; no contract or payload available",
    platformExists: false,
    rogerCanConsume: false,
  },
  {
    batch: "B8",
    api: "Re-ingestion Trigger — Submit",
    path: "POST /api/v1/re-ingestion-triggers",
    owner: "PDC",
    rogerCapability: "Upload Experience — re-trigger failed ingestion",
    consumerReadiness: "Future State",
    dataAvailability: "In Progress",
    governanceStatus: "B8 active delivery — not yet available",
    blockers: "API in development; governance boundary for Roger-initiated re-ingestion not confirmed",
    platformExists: false,
    rogerCanConsume: false,
  },
];

// ── Roger UI Screen Dependency Map ───────────────────────────────────────────

export interface RogerScreenRow {
  screen: string;
  description: string;
  requiredApis: string[];          // API names from ENDPOINT_READINESS_MATRIX
  requiredBatches: string[];
  overallReadiness: ConsumerReadiness;
  dataAvailability: DataAvailability;
  gaps: string;
  notes: string;
}

export const ROGER_SCREEN_DEPENDENCY_MAP: RogerScreenRow[] = [
  {
    screen: "Dashboard",
    description: "Platform status overview — file processing, batch health, TDC record status",
    requiredApis: ["Processing Run — Get Latest", "TDC Records — Get"],
    requiredBatches: ["B1", "B4"],
    overallReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    gaps: "PeriodStart/End missing from Consumer Guide for Processing Run",
    notes: "Core dashboard functional. PeriodStart/End gap is documentation only — data is present.",
  },
  {
    screen: "Client List",
    description: "Fetch and display client list for current user with entity identity",
    requiredApis: ["Client Group — Get", "Entity Identity — Get"],
    requiredBatches: ["B5"],
    overallReadiness: "Partial Data",
    dataAvailability: "Real Data",
    gaps: "ClientGroupId scope not yet confirmed; RBAC context field missing from Consumer Guide",
    notes: "API delivered. Scope confirmation with PDC team needed before PI 2 sprint planning.",
  },
  {
    screen: "Work Queue",
    description: "Practitioner review task list — ingestion jobs and review tasks",
    requiredApis: ["Ingestion Job — Get by ID", "Review Tasks — Get"],
    requiredBatches: ["B1", "B6"],
    overallReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    gaps: "None — both APIs delivered and consumer-ready",
    notes: "Fully functional. Exception tracking (B8) will extend this screen in PI 3.",
  },
  {
    screen: "Filing Review",
    description: "Normalized TB, AI mapping proposals, practitioner decisions, tax-ready records",
    requiredApis: ["Normalized TB — Get Records", "AI Mapping Proposals — Get", "Mapping Decisions — Create", "Tax-Ready Records — Get"],
    requiredBatches: ["B2", "B4", "B6"],
    overallReadiness: "Partial Data",
    dataAvailability: "Real Data",
    gaps: "FirmTaxonomyId (ADR-06 pending); AI proposal confidence incomplete for some entity types",
    notes: "Core filing review functional. FirmTaxonomyId and confidence scoring are enhancement gaps.",
  },
  {
    screen: "Eligibility",
    description: "Entity eligibility status and rule reasoning",
    requiredApis: ["Eligibility — Get Status"],
    requiredBatches: ["B7"],
    overallReadiness: "Consumer Ready",
    dataAvailability: "Real Data",
    gaps: "None",
    notes: "Fully functional. TDC Eligibility Contract published.",
  },
  {
    screen: "Adjustments",
    description: "Adjustment lifecycle — review task state, sign-off, remedy actions",
    requiredApis: ["Review Tasks — Get", "Remedy Action — Create"],
    requiredBatches: ["B6", "B8"],
    overallReadiness: "Partial Data",
    dataAvailability: "Partial Data",
    gaps: "Remedy Action API (B8) not yet delivered; sign-off contract missing hash verification schema",
    notes: "Review task state available. Remedy actions blocked on B8 delivery.",
  },
  {
    screen: "Upload Experience",
    description: "File upload, ingestion trigger, status tracking, re-ingestion",
    requiredApis: ["Ingestion Run — Submit", "Ingestion Run — Get Status", "Re-ingestion Trigger — Submit"],
    requiredBatches: ["FC", "B8"],
    overallReadiness: "Partial Data",
    dataAvailability: "Real Data",
    gaps: "Re-ingestion Trigger (B8) not yet delivered; governance boundary for Roger-initiated re-ingestion not confirmed",
    notes: "Core upload and status tracking fully functional. Re-ingestion is B8 future state.",
  },
  {
    screen: "Tax Form Reference",
    description: "Tax form templates and mapping rules reference data",
    requiredApis: ["Tax Form Templates — Get"],
    requiredBatches: ["B3"],
    overallReadiness: "Governance Pending",
    dataAvailability: "Real Data",
    gaps: "Orchestrator-facing contract — Roger access path via Gateway not yet confirmed",
    notes: "API delivered to Orchestrator. Roger access requires Gateway routing confirmation.",
  },
];

// ── Demo vs Production Readiness Table ───────────────────────────────────────

export interface DemoReadinessRow {
  capability: string;
  screen: string;
  demoReady: DemoReadiness;
  prodReady: ProdReadiness;
  demoNotes: string;
  prodNotes: string;
  batch: string;
}

export const DEMO_READINESS_TABLE: DemoReadinessRow[] = [
  {
    capability: "File Ingestion & Status",
    screen: "Upload Experience",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Full demo with real ingestion pipeline",
    prodNotes: "FC delivered and consumer-ready",
    batch: "FC",
  },
  {
    capability: "Processing Run Status",
    screen: "Dashboard",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Real processing run data available",
    prodNotes: "B1 delivered; PeriodStart/End doc gap only",
    batch: "B1",
  },
  {
    capability: "Normalized Trial Balance",
    screen: "Filing Review",
    demoReady: "Demo Ready",
    prodReady: "Near Ready",
    demoNotes: "Real TB data available for demo",
    prodNotes: "FirmTaxonomyId pending ADR-06 approval",
    batch: "B2 / B2A",
  },
  {
    capability: "AI Mapping Proposals",
    screen: "Filing Review",
    demoReady: "Demo Ready",
    prodReady: "Near Ready",
    demoNotes: "Proposals with confidence scores available",
    prodNotes: "Confidence scoring incomplete for some entity types",
    batch: "B4",
  },
  {
    capability: "Mapping Decisions",
    screen: "Filing Review",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Accept/override/reject fully functional",
    prodNotes: "TDC Primary Read Contract published",
    batch: "B4",
  },
  {
    capability: "TDC Records (Primary Read)",
    screen: "Dashboard / Filing Review",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "GREEN/YELLOW/RED status fully demonstrable",
    prodNotes: "Roger Primary TDC Read Contract published",
    batch: "B4",
  },
  {
    capability: "Entity Identity & Client List",
    screen: "Client List",
    demoReady: "Partial Demo",
    prodReady: "Near Ready",
    demoNotes: "Entity data available; RBAC context partial",
    prodNotes: "ClientGroupId scope pending PDC confirmation",
    batch: "B5",
  },
  {
    capability: "Review Task Queue",
    screen: "Work Queue",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Full review task lifecycle demonstrable",
    prodNotes: "B6 delivered and consumer-ready",
    batch: "B6",
  },
  {
    capability: "Tax-Ready Records",
    screen: "Filing Review",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Locked, derived records available",
    prodNotes: "TDC Tax-Ready Contract published — immutable",
    batch: "B6",
  },
  {
    capability: "Eligibility Status",
    screen: "Eligibility",
    demoReady: "Demo Ready",
    prodReady: "Production Ready",
    demoNotes: "Rule reasoning and status fully demonstrable",
    prodNotes: "TDC Eligibility Contract published",
    batch: "B7",
  },
  {
    capability: "Exception Tracking",
    screen: "Work Queue / Adjustments",
    demoReady: "Mocked",
    prodReady: "In Progress",
    demoNotes: "Demo uses simulated exception data — B8 not yet delivered",
    prodNotes: "B8 active delivery; contract not yet published",
    batch: "B8",
  },
  {
    capability: "Remedy Actions",
    screen: "Adjustments",
    demoReady: "Conceptual",
    prodReady: "Future State",
    demoNotes: "Not yet demonstrable — B8 in development",
    prodNotes: "API in development; no contract or payload",
    batch: "B8",
  },
  {
    capability: "Re-ingestion Trigger",
    screen: "Upload Experience",
    demoReady: "Conceptual",
    prodReady: "Future State",
    demoNotes: "Not yet demonstrable — B8 in development",
    prodNotes: "Governance boundary for Roger-initiated re-ingestion not confirmed",
    batch: "B8",
  },
  {
    capability: "Tax Form Reference Data",
    screen: "Tax Form Reference",
    demoReady: "Mocked",
    prodReady: "Blocked",
    demoNotes: "Demo uses static reference data — Gateway routing not confirmed",
    prodNotes: "Orchestrator-facing contract; Roger Gateway access path pending",
    batch: "B3",
  },
];

// ── Integration Risks (Roger Consumer Perspective) ───────────────────────────

export interface IntegrationRisk {
  id: string;
  category: "Missing Payload" | "Auth" | "Identity" | "Governance" | "Contract" | "Data" | "Cross-Stream";
  severity: "High" | "Medium" | "Low";
  title: string;
  description: string;
  affectedScreens: string[];
  batch: string;
  adoStory?: string;
  resolution: string;
}

export const INTEGRATION_RISKS: IntegrationRisk[] = [
  {
    id: "IR-01",
    category: "Missing Payload",
    severity: "Medium",
    title: "PeriodStart/End not in Consumer Guide",
    description: "Processing Run API returns PeriodStart/End in payload but Consumer Guide does not document these fields. Roger teams may not know to consume them.",
    affectedScreens: ["Dashboard"],
    batch: "B1",
    resolution: "Update Consumer Guide to document PeriodStart/End fields. No API change required.",
  },
  {
    id: "IR-02",
    category: "Governance",
    severity: "High",
    title: "FirmTaxonomyId enforcement blocked on ADR-06",
    description: "FirmTaxonomyId is present in the normalized records payload but enforcement is pending ADR-06 approval. Roger cannot rely on this field until the ADR is approved.",
    affectedScreens: ["Filing Review"],
    batch: "B2A",
    adoStory: "#1370843",
    resolution: "Resolve ADR-06 with architecture team. Field will be enforced post-approval.",
  },
  {
    id: "IR-03",
    category: "Identity",
    severity: "High",
    title: "ClientGroupId scope not confirmed",
    description: "The Client List screen depends on ClientGroupId to fetch the correct client scope for the current user. The scope definition has not been confirmed with the PDC team.",
    affectedScreens: ["Client List"],
    batch: "B5",
    resolution: "Confirm ClientGroupId scope with PDC team before PI 2 sprint planning.",
  },
  {
    id: "IR-04",
    category: "Missing Payload",
    severity: "Medium",
    title: "RBAC context field missing from Consumer Guide",
    description: "Entity Identity API returns RBAC context but it is not documented in the Consumer Guide. Roger teams building access-controlled views may miss this field.",
    affectedScreens: ["Client List"],
    batch: "B5",
    resolution: "Update Consumer Guide to document RBAC context field.",
  },
  {
    id: "IR-05",
    category: "Contract",
    severity: "High",
    title: "Tax Form Templates — Roger Gateway access path not confirmed",
    description: "Tax Form Templates API is delivered to Orchestrator but the Roger Gateway routing for direct Roger consumption has not been confirmed. Roger cannot consume this endpoint.",
    affectedScreens: ["Tax Form Reference"],
    batch: "B3",
    resolution: "Confirm Roger Gateway routing with architecture team. May require new Gateway contract.",
  },
  {
    id: "IR-06",
    category: "Data",
    severity: "Medium",
    title: "AI Proposal confidence scoring incomplete",
    description: "AI Mapping Proposals are available but confidence scoring is incomplete for some entity types. Roger practitioners may see proposals without reliable confidence indicators.",
    affectedScreens: ["Filing Review"],
    batch: "B4",
    resolution: "Confirm entity type coverage with TDC team. Document known gaps in Consumer Guide.",
  },
  {
    id: "IR-07",
    category: "Contract",
    severity: "High",
    title: "B8 APIs not yet delivered — no contract or payload",
    description: "Exception Record, Remedy Action, and Re-ingestion Trigger APIs are in active B8 development. No contract, payload, or seeded data is available for Roger consumption.",
    affectedScreens: ["Work Queue", "Adjustments", "Upload Experience"],
    batch: "B8",
    resolution: "Await B8 delivery. Monitor ADO stories for contract publication milestone.",
  },
  {
    id: "IR-08",
    category: "Cross-Stream",
    severity: "Medium",
    title: "Sign-off hash verification schema missing",
    description: "Sign-Off API is delivered but the hash verification schema is not documented in the Consumer Guide. Roger teams implementing sign-off verification cannot confirm the expected hash format.",
    affectedScreens: ["Adjustments"],
    batch: "B6",
    resolution: "Update Consumer Guide with hash verification schema documentation.",
  },
];

// ── Gateway Consumer Flow ─────────────────────────────────────────────────────

export const GATEWAY_FLOW_STEPS = [
  {
    id: "roger-ui",
    label: "Roger UI",
    sublabel: "Consumer Layer",
    color: "#1e40af",
    bg: "#dbeafe",
    description: "Roger practitioner screens — Dashboard, Client List, Work Queue, Filing Review, Eligibility, Adjustments, Upload Experience",
    owns: ["UI rendering", "Practitioner workflow", "User experience"],
    doesNotOwn: ["Lineage", "Governance", "Tax authority", "System of record"],
  },
  {
    id: "gateway",
    label: "Roger Gateway",
    sublabel: "Governed Access Layer",
    color: "#6b21a8",
    bg: "#f3e8ff",
    description: "Mediates all Roger access to PDC/TDC governed APIs. Enforces contracts, auth, and ownership boundaries.",
    owns: ["Access mediation", "Contract enforcement", "Auth routing"],
    doesNotOwn: ["Data ownership", "Lineage", "Tax decisions"],
  },
  {
    id: "pdc",
    label: "PDC",
    sublabel: "Phoenix Data Consolidation",
    color: "#065f46",
    bg: "#d1fae5",
    description: "Governed operational layer — ingestion, normalization, entity identity, lineage anchor",
    owns: ["Ingestion", "Normalization", "Entity identity", "Lineage"],
    doesNotOwn: ["Tax decisions", "Eligibility rules", "Mapping authority"],
  },
  {
    id: "tdc",
    label: "TDC",
    sublabel: "Tax Data Consolidation",
    color: "#9a3412",
    bg: "#fff7ed",
    description: "Tax authority layer — mapping decisions, eligibility, tax-ready records, review tasks",
    owns: ["Tax decisions", "Eligibility rules", "Mapping authority", "Tax-ready records"],
    doesNotOwn: ["Ingestion", "Normalization", "Entity identity"],
  },
];
