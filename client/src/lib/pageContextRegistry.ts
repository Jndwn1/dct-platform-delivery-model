// pageContextRegistry.ts
// Global page context registry for the DCT Platform.
// Maps every route to its related features, APIs, stories, screens,
// business rules, batches, and integrations.
// Used by GlobalPageContext to surface context-aware information automatically.

export interface PageContextEntry {
  pageTitle: string;
  pageIcon: string;
  description: string;
  features: string[];
  apis: string[];
  stories: string[];
  screens: string[];
  businessRules: string[];
  batches: string[];
  businessObjects: string[];
  integrations: string[];
}

export const PAGE_CONTEXT_REGISTRY: Record<string, PageContextEntry> = {

  // ─── HOME / DASHBOARD ────────────────────────────────────────────────────────
  "/": {
    pageTitle: "DCT Platform Dashboard",
    pageIcon: "🏠",
    description: "Main delivery dashboard — platform readiness, batch status, and gate health",
    features: ["Platform Readiness Tracking", "Batch Status Overview", "Gate Health Monitoring", "PI Progress Tracking"],
    apis: ["GET /api/batches/status", "GET /api/gates/health", "GET /api/pi/completion"],
    stories: ["Platform Readiness Dashboard", "Executive KPI View", "Batch Summary Cards"],
    screens: ["Main Dashboard", "Platform Readiness Bar", "Batch Summary", "Gate Status Indicators"],
    businessRules: ["Batch status drives overall readiness %", "All 4 gates must pass before RC", "PI completion rolls up from batch completion"],
    batches: ["All batches (B1–B43+)"],
    businessObjects: ["Batch", "Gate", "PI", "Release Candidate"],
    integrations: ["BatchStatusContext", "Azure DevOps", "GitHub"],
  },

  // ─── BATCH CONTROL PANEL ─────────────────────────────────────────────────────
  "/control-panel": {
    pageTitle: "Batch Control Panel",
    pageIcon: "⚙️",
    description: "Live batch status management, gate tracking, and delivery intelligence hub",
    features: ["Batch Status Management", "Gate Verification", "Roger Consumer Readiness", "PI Completion Tracking", "Discovery Center Context Panel"],
    apis: ["GET /api/batches", "PUT /api/batches/:id/status", "GET /api/gates/status", "GET /api/roger/readiness"],
    stories: ["Update Batch Status", "View Gate Verification Status", "Track Roger API Readiness"],
    screens: ["Batch Status Grid", "Gate Status Panel", "Roger Readiness Panel", "Discovery Context Panel", "PI Completion Charts"],
    businessRules: ["Only Admin can change batch status", "Gate status auto-derives from batch completion", "Roger readiness requires B9 + B42 + B43"],
    batches: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "B26", "B27", "B28", "B29", "B30", "B31", "B32", "B33", "B34", "B35", "B36", "B37", "B38", "B39", "B40", "B41", "B42", "B43"],
    businessObjects: ["Batch", "Gate", "RogerAPI", "PICompletion"],
    integrations: ["BatchStatusContext", "DiscoveryContext", "Azure DevOps"],
  },

  // ─── BATCH DETAIL ────────────────────────────────────────────────────────────
  "/batch/:id": {
    pageTitle: "Batch Detail",
    pageIcon: "📦",
    description: "Individual batch detail — stories, acceptance criteria, deployment history, and gate status",
    features: ["Batch Story Tracking", "Acceptance Criteria Review", "Deployment History", "Gate Verification Status", "Discovery Center Links"],
    apis: ["GET /api/batches/:id", "GET /api/batches/:id/stories", "GET /api/batches/:id/deployments"],
    stories: ["View Batch Stories", "Review Acceptance Criteria", "Track Deployment History"],
    screens: ["Batch Header", "Story List", "Acceptance Criteria Panel", "Deployment History", "Discovery Links"],
    businessRules: ["Batch must have all stories in Done before gate verification", "Deployment history is immutable once recorded", "Gate status is read-only on batch detail"],
    batches: ["Dynamic — based on batch ID in URL"],
    businessObjects: ["Batch", "Story", "AcceptanceCriteria", "Deployment"],
    integrations: ["Azure DevOps", "GitHub", "Discovery Center"],
  },

  // ─── GOVERNANCE GATES ────────────────────────────────────────────────────────
  "/gate/overview": {
    pageTitle: "Governance Gates",
    pageIcon: "🔒",
    description: "Four-gate governance model — Schema Lock, Invariant Lock, Contract Publication, Lineage Closure",
    features: ["Gate Status Tracking", "Gate Definition Reference", "Batch-to-Gate Mapping", "Gate Verification Workflow"],
    apis: ["GET /api/gates", "GET /api/gates/:id/status", "GET /api/gates/:id/batches"],
    stories: ["Schema Lock Verification", "Invariant Lock Verification", "Contract Publication", "Lineage Closure"],
    screens: ["Gate Overview", "Gate Detail", "Gate Verification Checklist"],
    businessRules: ["G1 Schema Lock: all schemas finalized before G1 passes", "G2 Invariant Lock: all business rules locked", "G3 Contract Publication: all APIs published to registry", "G4 Lineage Closure: full data lineage documented"],
    batches: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
    businessObjects: ["Gate", "Schema", "Invariant", "Contract", "Lineage"],
    integrations: ["TDC Schema Registry", "API Contract Registry", "Lineage Tracker"],
  },

  // ─── ROGER API EVOLUTION ─────────────────────────────────────────────────────
  "/roger-api": {
    pageTitle: "Roger API Evolution",
    pageIcon: "📡",
    description: "Roger's API surface — all endpoints, versions, and readiness status",
    features: ["API Version Tracking", "Endpoint Readiness", "Roger API Catalog", "API Dependency Mapping"],
    apis: [
      "GET /api/roger/known-mapping",
      "GET /api/roger/classification",
      "GET /api/roger/entity-resolution",
      "GET /api/roger/confidence-band",
      "GET /api/roger/tax-object-map",
      "GET /api/roger/audit-trail",
      "POST /api/roger/decisions",
      "GET /api/roger/screens",
      "GET /api/roger/validations",
      "GET /api/roger/gosystem-export",
    ],
    stories: ["Roger Known Mapping API", "Roger Classification API", "Roger Entity Resolution", "Roger Confidence Band", "Roger Tax Object Map", "Roger Audit Trail", "Roger Decision Capture", "Roger Screen Data", "Roger Validation Rules", "Roger GoSystem Export"],
    screens: ["API Catalog", "API Readiness Dashboard", "Endpoint Detail", "Version History"],
    businessRules: ["Roger is read-only — it never writes to TDC directly", "All Roger APIs are GET except decision capture", "API readiness requires B9 + B42 + B43 complete"],
    batches: ["B9", "B42", "B43"],
    businessObjects: ["RogerAPI", "KnownMapping", "Classification", "EntityResolution", "ConfidenceBand", "TaxObjectMap", "AuditTrail"],
    integrations: ["TDC", "Roger UI", "GoSystem"],
  },

  // ─── CONSUMER INTEGRATION HUB ────────────────────────────────────────────────
  "/consumer-integration-hub": {
    pageTitle: "Consumer Integration Hub",
    pageIcon: "🔗",
    description: "Roger consumer readiness — API availability, screen readiness, and integration status",
    features: ["Consumer Readiness Tracking", "API Availability Matrix", "Screen Readiness Dashboard", "Integration Health"],
    apis: ["GET /api/roger/readiness", "GET /api/roger/screens/status", "GET /api/integrations/health"],
    stories: ["Roger Consumer Readiness", "API Availability Check", "Screen Integration Validation"],
    screens: ["Consumer Readiness Matrix", "API Status Grid", "Screen Readiness Cards"],
    businessRules: ["Consumer integration requires all Roger APIs at 100%", "Screen readiness depends on underlying batch completion", "GoSystem integration requires B38 complete"],
    batches: ["B9", "B38", "B42", "B43"],
    businessObjects: ["ConsumerIntegration", "RogerAPI", "Screen", "GoSystemExport"],
    integrations: ["Roger UI", "GoSystem", "TDC", "PDC"],
  },

  // ─── ROGER MAPPING ───────────────────────────────────────────────────────────
  "/roger-mapping": {
    pageTitle: "Roger Mapping",
    pageIcon: "🗺️",
    description: "Known Mapping and tax object mapping — how financial data maps to tax fields",
    features: ["Known Mapping Viewer", "Tax Object Map", "Field-Level Mapping", "Confidence Band Display"],
    apis: ["GET /api/roger/known-mapping", "GET /api/roger/tax-object-map", "GET /api/roger/confidence-band"],
    stories: ["View Known Mapping", "Review Tax Object Map", "Inspect Field Mappings", "Check Confidence Bands"],
    screens: ["Known Mapping Grid", "Tax Object Map", "Field Detail Panel", "Confidence Band Indicator"],
    businessRules: ["Known Mapping is immutable once published", "Confidence band must be >= 0.85 for auto-classification", "Tax object map is owned by TDC — Roger reads only"],
    batches: ["B9", "B15", "B16", "B17"],
    businessObjects: ["KnownMapping", "TaxObjectMap", "ConfidenceBand", "FieldMapping"],
    integrations: ["TDC", "Roger UI", "Classification Engine"],
  },

  // ─── TAXONOMY ────────────────────────────────────────────────────────────────
  "/taxonomy": {
    pageTitle: "Taxonomy",
    pageIcon: "🌳",
    description: "DCT taxonomy — financial data classification hierarchy and category definitions",
    features: ["Taxonomy Browser", "Category Hierarchy", "Classification Rules", "Taxonomy Versioning"],
    apis: ["GET /api/taxonomy", "GET /api/taxonomy/:id", "GET /api/taxonomy/versions"],
    stories: ["Browse Taxonomy", "View Category Definitions", "Review Classification Rules"],
    screens: ["Taxonomy Tree", "Category Detail", "Classification Rules Panel"],
    businessRules: ["Taxonomy is versioned — changes require governance approval", "All financial data must map to a taxonomy node", "Taxonomy changes trigger re-classification"],
    batches: ["B5", "B6", "B7"],
    businessObjects: ["TaxonomyNode", "Category", "ClassificationRule"],
    integrations: ["PDC", "TDC", "Classification Engine"],
  },

  // ─── DATA MODEL ──────────────────────────────────────────────────────────────
  "/data-model": {
    pageTitle: "Data Model",
    pageIcon: "🗄️",
    description: "DCT data model — entities, relationships, and schema definitions",
    features: ["Entity Browser", "Schema Viewer", "Relationship Map", "Schema Version History"],
    apis: ["GET /api/data-model/entities", "GET /api/data-model/schemas", "GET /api/data-model/relationships"],
    stories: ["View Data Model", "Inspect Entity Schemas", "Review Relationships"],
    screens: ["Entity List", "Schema Detail", "Relationship Diagram"],
    businessRules: ["Schema changes require Schema Lock gate approval", "All entities must have a defined owner (PDC or TDC)", "Relationships are directional — no circular dependencies"],
    batches: ["B1", "B2", "B3", "B4"],
    businessObjects: ["Entity", "Schema", "Relationship", "Attribute"],
    integrations: ["PDC Schema Registry", "TDC Schema Registry"],
  },

  // ─── DATA GOVERNANCE ─────────────────────────────────────────────────────────
  "/data-governance": {
    pageTitle: "Data Governance",
    pageIcon: "📋",
    description: "Data governance policies, lineage rules, and compliance requirements",
    features: ["Governance Policy Viewer", "Lineage Tracking", "Compliance Dashboard", "Audit Log"],
    apis: ["GET /api/governance/policies", "GET /api/governance/lineage", "GET /api/governance/audit"],
    stories: ["View Governance Policies", "Track Data Lineage", "Review Compliance Status"],
    screens: ["Policy List", "Lineage Map", "Compliance Dashboard", "Audit Log"],
    businessRules: ["All data transformations must be logged for lineage", "PII data requires masking before Roger consumption", "Governance policies are immutable once approved"],
    batches: ["B1", "B2", "B3", "B8"],
    businessObjects: ["GovernancePolicy", "LineageRecord", "AuditLog", "ComplianceRule"],
    integrations: ["TDC Lineage Tracker", "PDC Audit Log", "Compliance Engine"],
  },

  // ─── ARCHITECTURE ────────────────────────────────────────────────────────────
  "/architecture": {
    pageTitle: "Architecture Overview",
    pageIcon: "🏗️",
    description: "DCT platform architecture — system layers, component interactions, and design patterns",
    features: ["Architecture Diagram", "Component Inventory", "Layer Definitions", "Design Pattern Reference"],
    apis: ["GET /api/architecture/components", "GET /api/architecture/layers"],
    stories: ["Architecture Review", "Component Mapping", "Layer Definition"],
    screens: ["Architecture Diagram", "Component Detail", "Layer View"],
    businessRules: ["Each component owns exactly one domain", "No cross-domain writes — only reads via published APIs", "All inter-system communication via Service Bus"],
    batches: ["B1", "B2"],
    businessObjects: ["Component", "Layer", "Interface", "ServiceBus"],
    integrations: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem", "Service Bus"],
  },

  // ─── DELIVERY INTELLIGENCE ───────────────────────────────────────────────────
  "/delivery-intelligence": {
    pageTitle: "Delivery Intelligence PI3",
    pageIcon: "📊",
    description: "PI3 delivery intelligence — readiness scoring, critical path, and Roger capability impact",
    features: ["PI Readiness Dashboard", "Critical Path Tracking", "Roger Capability Impact Matrix", "Executive KPIs", "Azure DevOps Review", "Optimization Review"],
    apis: ["GET /api/delivery/pi3/readiness", "GET /api/delivery/critical-path", "GET /api/roger/capability-impact"],
    stories: ["PI3 Readiness Assessment", "Critical Path Analysis", "Roger Capability Mapping"],
    screens: ["PI Readiness Dashboard", "Critical Path Diagram", "Roger Impact Matrix", "Executive KPI Cards", "ADO Review Panel", "Optimization Panel"],
    businessRules: ["PI3 target: Sep 16, 2026 MVP", "Critical path batches cannot slip without RC impact", "Roger capability requires 7/10 APIs ready for MVP"],
    batches: ["B9", "B38", "B39", "B40", "B41", "B42", "B43"],
    businessObjects: ["PI", "CriticalPath", "RogerCapability", "KPI"],
    integrations: ["Azure DevOps", "GitHub", "Roger UI"],
  },

  // ─── TOUCHPOINTS ─────────────────────────────────────────────────────────────
  "/touchpoints": {
    pageTitle: "System Touchpoints",
    pageIcon: "🔀",
    description: "Cross-system touchpoints — where PDC, TDC, Orchestrator, Roger, and GoSystem interact",
    features: ["Touchpoint Map", "Integration Point Inventory", "Data Exchange Patterns", "Event Flow Diagram"],
    apis: ["GET /api/touchpoints", "GET /api/touchpoints/:id"],
    stories: ["Map System Touchpoints", "Document Integration Points", "Review Data Exchange Patterns"],
    screens: ["Touchpoint Map", "Integration Detail", "Event Flow Diagram"],
    businessRules: ["All touchpoints must be documented before G3 Contract Publication", "Data exchange must use defined contract schemas", "Event-driven touchpoints require Service Bus"],
    batches: ["B3", "B4", "B5", "B6"],
    businessObjects: ["Touchpoint", "IntegrationPoint", "DataExchange", "Event"],
    integrations: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem", "Service Bus"],
  },

  // ─── AGENT HUB ───────────────────────────────────────────────────────────────
  "/agent-hub": {
    pageTitle: "Agent Hub",
    pageIcon: "🤖",
    description: "AI agent orchestration — agent definitions, execution logs, and governance rules",
    features: ["Agent Catalog", "Execution Log", "Agent Governance Rules", "Orchestrator Integration"],
    apis: ["GET /api/agents", "GET /api/agents/:id", "GET /api/agents/:id/logs"],
    stories: ["View Agent Catalog", "Review Execution Logs", "Inspect Agent Governance"],
    screens: ["Agent List", "Agent Detail", "Execution Log", "Governance Rules Panel"],
    businessRules: ["Agents are stateless — no persistent state between executions", "All agent decisions are logged for audit", "Agents cannot write to TDC directly — only via Orchestrator"],
    batches: ["B30", "B31", "B32"],
    businessObjects: ["Agent", "ExecutionLog", "AgentGovernanceRule", "Orchestrator"],
    integrations: ["Orchestrator", "TDC", "PDC", "Azure OpenAI"],
  },

  // ─── INTEGRATION SIMULATION ──────────────────────────────────────────────────
  "/integration-simulation": {
    pageTitle: "Integration Simulation",
    pageIcon: "🎮",
    description: "Live simulation of the end-to-end DCT integration flow",
    features: ["Step-by-Step Simulation", "Event Trigger Visualization", "Data Transformation Preview", "Error Scenario Testing"],
    apis: ["POST /api/simulation/run", "GET /api/simulation/steps", "GET /api/simulation/results"],
    stories: ["Run Integration Simulation", "View Step Results", "Test Error Scenarios"],
    screens: ["Simulation Control Panel", "Step Visualizer", "Results Panel", "Error Scenario Panel"],
    businessRules: ["Simulation uses mock data — not production data", "All 32 steps must complete for a successful simulation", "Error scenarios test boundary conditions only"],
    batches: ["B1", "B2", "B3", "B4", "B5"],
    businessObjects: ["SimulationRun", "SimulationStep", "SimulationResult"],
    integrations: ["PDC Mock", "TDC Mock", "Orchestrator Mock", "Roger Mock"],
  },

  // ─── RUNTIME JOURNEY ─────────────────────────────────────────────────────────
  "/runtime-journey": {
    pageTitle: "Runtime Journey",
    pageIcon: "🚀",
    description: "End-to-end runtime journey — from file ingestion to Roger screen population",
    features: ["Journey Visualization", "Step-by-Step Walkthrough", "Data State at Each Step", "Timing Analysis"],
    apis: ["GET /api/runtime/journey", "GET /api/runtime/journey/steps"],
    stories: ["View Runtime Journey", "Inspect Data State", "Analyze Timing"],
    screens: ["Journey Map", "Step Detail", "Data State Panel", "Timing Chart"],
    businessRules: ["Runtime journey is read-only — visualization only", "Data state shown is from last simulation run", "Timing data is approximate — not production SLA"],
    batches: ["B1", "B2", "B3", "B4", "B5", "B9"],
    businessObjects: ["JourneyStep", "DataState", "TimingRecord"],
    integrations: ["PDC", "TDC", "Orchestrator", "Roger"],
  },

  // ─── TAX MAPPING ─────────────────────────────────────────────────────────────
  "/tax-mapping": {
    pageTitle: "Tax Mapping",
    pageIcon: "💰",
    description: "Tax field mapping — how financial data maps to GoSystem tax fields",
    features: ["Tax Field Mapping", "GoSystem Field Reference", "Mapping Validation", "Missing Field Detection"],
    apis: ["GET /api/tax-mapping", "GET /api/tax-mapping/gosystem-fields", "GET /api/tax-mapping/validation"],
    stories: ["View Tax Field Mappings", "Validate Mappings", "Detect Missing Fields"],
    screens: ["Tax Mapping Grid", "GoSystem Field Reference", "Validation Results", "Missing Field Report"],
    businessRules: ["All required GoSystem fields must have a mapping", "Missing required fields block GoSystem export", "Tax mappings are versioned by tax year"],
    batches: ["B38", "B39", "B40"],
    businessObjects: ["TaxMapping", "GoSystemField", "MappingValidation"],
    integrations: ["TDC", "GoSystem", "Tax Mapping Engine"],
  },

  // ─── CLASSIFICATION WALKTHROUGH ───────────────────────────────────────────────
  "/classification-walkthrough": {
    pageTitle: "Classification Walkthrough",
    pageIcon: "🔍",
    description: "Step-by-step walkthrough of the AI classification process",
    features: ["Classification Steps", "AI Decision Visualization", "Confidence Score Display", "Override Workflow"],
    apis: ["GET /api/classification/steps", "GET /api/classification/decisions", "POST /api/classification/override"],
    stories: ["View Classification Steps", "Inspect AI Decisions", "Override Classification"],
    screens: ["Classification Stepper", "Decision Detail", "Confidence Display", "Override Panel"],
    businessRules: ["Classifications with confidence < 0.85 require human review", "Overrides are logged and auditable", "AI classification is non-deterministic — same input may yield different confidence"],
    batches: ["B10", "B11", "B12"],
    businessObjects: ["Classification", "ConfidenceScore", "ClassificationOverride"],
    integrations: ["Orchestrator", "TDC", "Azure OpenAI"],
  },

  // ─── GAP ANALYSIS ────────────────────────────────────────────────────────────
  "/gap-analysis": {
    pageTitle: "Gap Analysis Engine",
    pageIcon: "📉",
    description: "Platform gap analysis — identifies missing features, APIs, and stories",
    features: ["Gap Detection", "Coverage Analysis", "Priority Scoring", "Remediation Recommendations"],
    apis: ["GET /api/gaps", "GET /api/gaps/coverage", "GET /api/gaps/priorities"],
    stories: ["Run Gap Analysis", "View Coverage Report", "Review Remediation Plan"],
    screens: ["Gap Summary", "Coverage Matrix", "Priority List", "Remediation Panel"],
    businessRules: ["Gaps are scored by impact × likelihood", "Critical gaps block RC", "Remediation plans require PO approval"],
    batches: ["All batches"],
    businessObjects: ["Gap", "CoverageScore", "RemediationPlan"],
    integrations: ["Azure DevOps", "BatchStatusContext"],
  },

  // ─── DEPLOYMENT REGISTRY ─────────────────────────────────────────────────────
  "/deployment-registry": {
    pageTitle: "Deployment Registry",
    pageIcon: "📦",
    description: "Deployment history — all releases, hotfixes, and rollbacks across PDC and TDC",
    features: ["Deployment History", "Release Notes", "Rollback Tracking", "Deployment Filtering"],
    apis: ["GET /api/deployments", "POST /api/deployments", "PUT /api/deployments/:id/status"],
    stories: ["View Deployment History", "Create Deployment Record", "Track Rollbacks"],
    screens: ["Deployment List", "Deployment Detail", "Release Notes Panel", "Rollback History"],
    businessRules: ["Deployment records are immutable once created", "Rollbacks must be documented with reason", "Production deployments require PO sign-off"],
    batches: ["All batches"],
    businessObjects: ["Deployment", "ReleaseNote", "Rollback"],
    integrations: ["GitHub", "Azure DevOps", "PDC", "TDC"],
  },

  // ─── ASK BUDDY ───────────────────────────────────────────────────────────────
  "/ask-buddy": {
    pageTitle: "Ask Buddy",
    pageIcon: "🤖",
    description: "AI-powered Q&A assistant for the DCT platform — answers questions about batches, APIs, governance, and architecture",
    features: ["Natural Language Q&A", "Batch Status Queries", "Architecture Questions", "Governance Guidance"],
    apis: ["POST /api/trpc/askBuddy.chat"],
    stories: ["Ask About Batch Status", "Query Architecture", "Get Governance Guidance"],
    screens: ["Chat Interface", "Message History", "Suggested Questions"],
    businessRules: ["Ask Buddy uses live batch context from BatchStatusContext", "Responses are AI-generated — verify critical decisions", "Ask Buddy does not write to any system"],
    batches: ["All batches"],
    businessObjects: ["ChatMessage", "BatchContext", "GateContext"],
    integrations: ["BatchStatusContext", "DCT Knowledge Base", "LLM API"],
  },

  // ─── DISCOVERY CENTER HUB ────────────────────────────────────────────────────
  "/discovery": {
    pageTitle: "Discovery Center",
    pageIcon: "🧭",
    description: "BA onboarding hub — ecosystem overview, platform responsibilities, data flows, and requirement discovery",
    features: ["Ecosystem Overview", "Platform Responsibilities", "Data Flow Visualization", "BA Requirement Discovery", "Discovery Checklist", "Glossary", "BA Story Builder"],
    apis: ["All Discovery Center pages are read-only reference content"],
    stories: ["BA Onboarding", "Platform Orientation", "Requirement Discovery Workflow"],
    screens: ["Discovery Hub", "Ecosystem Overview", "Platform Responsibilities", "Data Flow", "Simulation", "Integration Architecture", "BA Requirements", "Checklist", "Glossary", "DCT Overview", "Roger Overview", "GoSystem", "BA Story Builder"],
    businessRules: ["Discovery Center is read-only — no data writes", "Checklist items must all be checked before story is ADO-ready", "BA Story Builder output must be reviewed before ADO submission"],
    batches: ["All batches (reference)"],
    businessObjects: ["DiscoveryPage", "ChecklistItem", "Story", "Glossary"],
    integrations: ["Ask Buddy", "Azure DevOps", "BatchStatusContext"],
  },

  // ─── DISCOVERY: ROGER OVERVIEW ───────────────────────────────────────────────
  "/discovery/roger-overview": {
    pageTitle: "Roger Overview",
    pageIcon: "🤖",
    description: "Roger — the practitioner-facing AI assistant that surfaces TDC data for tax review",
    features: ["Roger Architecture", "Roger API Catalog", "Roger Screen Inventory", "Roger Data Flow", "Roger Governance Rules"],
    apis: [
      "GET /api/roger/known-mapping",
      "GET /api/roger/classification",
      "GET /api/roger/entity-resolution",
      "GET /api/roger/confidence-band",
      "GET /api/roger/tax-object-map",
      "GET /api/roger/audit-trail",
      "POST /api/roger/decisions",
      "GET /api/roger/screens",
      "GET /api/roger/validations",
      "GET /api/roger/gosystem-export",
    ],
    stories: ["Roger Known Mapping", "Roger Classification Display", "Roger Entity Resolution", "Roger Confidence Band", "Roger Tax Object Map", "Roger Audit Trail", "Roger Decision Capture", "Roger Screen Population", "Roger Validation Rules", "Roger GoSystem Export"],
    screens: ["Known Mapping Screen", "Classification Review", "Entity Resolution Panel", "Confidence Band Display", "Tax Object Map", "Audit Trail", "Decision Capture", "Validation Rules", "GoSystem Export"],
    businessRules: [
      "Roger is read-only — it never writes to TDC directly",
      "Roger decisions are captured and sent back to TDC via the Decision API",
      "Roger screens are populated from TDC via published APIs",
      "Roger cannot access PDC directly — only TDC",
      "All Roger API calls are authenticated and logged",
      "Confidence band < 0.85 triggers manual review flag in Roger",
    ],
    batches: ["B9", "B42", "B43"],
    businessObjects: ["KnownMapping", "Classification", "EntityResolution", "ConfidenceBand", "TaxObjectMap", "AuditTrail", "Decision"],
    integrations: ["TDC", "GoSystem", "Azure AD", "Service Bus"],
  },

  // ─── DISCOVERY: DCT OVERVIEW ─────────────────────────────────────────────────
  "/discovery/dct-overview": {
    pageTitle: "TDC / DCT Overview",
    pageIcon: "🏛️",
    description: "Tax Data Consolidation — the authoritative tax data platform and its batch delivery model",
    features: ["TDC Architecture", "Batch Delivery Model", "Four Governance Gates", "TDC Business Objects", "TDC API Surface"],
    apis: ["GET /api/tdc/objects", "GET /api/tdc/schemas", "GET /api/tdc/lineage", "GET /api/tdc/audit"],
    stories: ["TDC Schema Definition", "TDC Business Object Mapping", "TDC Lineage Tracking", "TDC Audit Logging"],
    screens: ["TDC Overview", "Business Object Browser", "Schema Viewer", "Lineage Map", "Audit Log"],
    businessRules: [
      "TDC is the single system of record for tax data",
      "TDC decisions are immutable once written",
      "All downstream systems read from TDC — never write to it directly",
      "TDC schema changes require Schema Lock gate approval",
      "TDC lineage must be complete before Lineage Closure gate",
    ],
    batches: ["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"],
    businessObjects: ["TaxObject", "Schema", "LineageRecord", "AuditRecord", "BusinessRule", "Contract"],
    integrations: ["PDC", "Orchestrator", "Roger", "GoSystem", "Service Bus"],
  },

  // ─── DISCOVERY: GOSYSTEM ─────────────────────────────────────────────────────
  "/discovery/gosystem": {
    pageTitle: "GoSystem Tax",
    pageIcon: "💼",
    description: "GoSystem Tax — downstream tax filing system that consumes TDC data via Roger",
    features: ["GoSystem Integration", "Field Mapping", "Export Workflow", "Missing Field Detection", "GoSystem Validation Rules"],
    apis: ["GET /api/roger/gosystem-export", "GET /api/tax-mapping/gosystem-fields", "POST /api/gosystem/export"],
    stories: ["GoSystem Export", "Field Mapping Validation", "Missing Field Detection", "GoSystem Integration Testing"],
    screens: ["GoSystem Export Panel", "Field Mapping Grid", "Validation Results", "Export History"],
    businessRules: [
      "GoSystem only reads from TDC — it never writes back",
      "All required GoSystem fields must be populated before export",
      "Missing required fields block the export and generate an error",
      "GoSystem export is triggered by practitioner action in Roger",
      "Export format is fixed — no customization per client",
      "GoSystem integration requires B38 complete",
    ],
    batches: ["B38", "B39", "B40"],
    businessObjects: ["GoSystemField", "ExportRecord", "FieldMapping", "ValidationError"],
    integrations: ["TDC", "Roger", "GoSystem Tax Platform"],
  },

  // ─── DISCOVERY: ECOSYSTEM ────────────────────────────────────────────────────
  "/discovery/ecosystem": {
    pageTitle: "Ecosystem Overview",
    pageIcon: "🌐",
    description: "Five-component DCT ecosystem — PDC, TDC, Orchestrator, Roger, and GoSystem",
    features: ["Component Architecture", "Data Flow Visualization", "Ownership Boundaries", "Integration Points"],
    apis: ["Reference content — no live APIs"],
    stories: ["Ecosystem Orientation", "Component Boundary Understanding"],
    screens: ["Ecosystem Diagram", "Component Cards", "Data Flow Arrows"],
    businessRules: ["PDC owns financial data", "TDC owns tax decisions", "Orchestrator is stateless AI", "Roger is read-only consumer", "GoSystem is downstream filing system"],
    batches: ["All batches (reference)"],
    businessObjects: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
    integrations: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
  },

  // ─── DISCOVERY: PLATFORM RESPONSIBILITIES ────────────────────────────────────
  "/discovery/platform-responsibilities": {
    pageTitle: "Platform Responsibilities",
    pageIcon: "▦",
    description: "What each platform owns — clear boundaries between PDC, TDC, Orchestrator, Roger, and GoSystem",
    features: ["Ownership Matrix", "Boundary Definitions", "Cross-System Rules", "BA Guidance"],
    apis: ["Reference content — no live APIs"],
    stories: ["Platform Boundary Definition", "Ownership Clarification"],
    screens: ["Responsibility Cards", "Ownership Matrix", "Boundary Rules"],
    businessRules: ["PDC: financial data ingestion and normalization only", "TDC: tax decisions and immutable records only", "Orchestrator: AI execution only — no data ownership", "Roger: read-only practitioner interface", "GoSystem: downstream consumer only"],
    batches: ["All batches (reference)"],
    businessObjects: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
    integrations: ["PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
  },

  // ─── DISCOVERY: DATA FLOW ────────────────────────────────────────────────────
  "/discovery/data-flow": {
    pageTitle: "End-to-End Data Flow",
    pageIcon: "🔄",
    description: "How data flows from ERP ingestion through PDC, TDC, Orchestrator, Roger, and GoSystem",
    features: ["Data Flow Timeline", "Step-by-Step Walkthrough", "System Handoffs", "Data Transformation Points"],
    apis: ["Reference content — no live APIs"],
    stories: ["Data Flow Understanding", "Handoff Point Documentation"],
    screens: ["Flow Timeline", "Step Detail", "Handoff Points"],
    businessRules: ["Data flows in one direction: ERP → PDC → TDC → Roger/GoSystem", "Roger decisions flow back to TDC via Decision API", "No reverse data flow from GoSystem to TDC"],
    batches: ["B1", "B2", "B3", "B4", "B5"],
    businessObjects: ["ERPData", "PDCRecord", "TDCRecord", "RogerDecision", "GoSystemExport"],
    integrations: ["ERP", "PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
  },

  // ─── DISCOVERY: BA REQUIREMENTS ──────────────────────────────────────────────
  "/discovery/ba-requirements": {
    pageTitle: "BA Requirement Discovery",
    pageIcon: "📝",
    description: "13-question BA discovery workflow for writing DCT-compliant user stories",
    features: ["Discovery Question Framework", "Governance Checklist", "API Discovery Questions", "Validation Discovery", "ADO Story Template"],
    apis: ["Reference content — no live APIs"],
    stories: ["BA Discovery Workflow", "Story Readiness Assessment"],
    screens: ["Discovery Questions", "Governance Checklist", "API Questions", "Validation Questions"],
    businessRules: ["All 13 discovery questions must be answered before story is ADO-ready", "Governance questions are mandatory for all TDC stories", "API questions required for any story touching Roger"],
    batches: ["All batches (reference)"],
    businessObjects: ["DiscoveryQuestion", "StoryTemplate", "AcceptanceCriteria"],
    integrations: ["Azure DevOps", "Ask Buddy"],
  },

  // ─── DISCOVERY: CHECKLIST ────────────────────────────────────────────────────
  "/discovery/checklist": {
    pageTitle: "Discovery Checklist",
    pageIcon: "✅",
    description: "13-item story readiness checklist — must be complete before submitting to ADO",
    features: ["Interactive Checklist", "Progress Tracking", "Print/Export PDF", "Definition of Done"],
    apis: ["Reference content — no live APIs"],
    stories: ["Story Readiness Verification", "Definition of Done Confirmation"],
    screens: ["Checklist Items", "Progress Bar", "Export Button"],
    businessRules: ["All 13 items must be checked before story is ADO-ready", "Checklist is per-story — reset for each new story", "Exported PDF is the official story readiness artifact"],
    batches: ["All batches (reference)"],
    businessObjects: ["ChecklistItem", "StoryReadiness", "DefinitionOfDone"],
    integrations: ["Azure DevOps", "PDF Export"],
  },

  // ─── DISCOVERY: GLOSSARY ─────────────────────────────────────────────────────
  "/discovery/glossary": {
    pageTitle: "Glossary",
    pageIcon: "📖",
    description: "DCT platform glossary — definitions for all key terms, acronyms, and business objects",
    features: ["Searchable Glossary", "Category Filtering", "Term Definitions", "Related Terms"],
    apis: ["Reference content — no live APIs"],
    stories: ["Glossary Reference"],
    screens: ["Search Bar", "Term List", "Term Detail"],
    businessRules: ["Glossary is the authoritative source for DCT terminology", "All story acceptance criteria must use glossary-defined terms"],
    batches: ["All batches (reference)"],
    businessObjects: ["GlossaryTerm", "Acronym", "Definition"],
    integrations: ["Ask Buddy"],
  },

  // ─── DISCOVERY: BA STORY BUILDER ─────────────────────────────────────────────
  "/discovery/ba-story-builder": {
    pageTitle: "BA Story Builder",
    pageIcon: "✍️",
    description: "Guided form that auto-generates complete Azure DevOps-ready user stories",
    features: ["Guided Story Form", "Auto-Generated Acceptance Criteria", "Governance Flag Detection", "ADO-Ready Output", "Copy to Clipboard"],
    apis: ["Reference content — no live APIs"],
    stories: ["Story Generation", "Acceptance Criteria Generation", "Governance Flag Review"],
    screens: ["Story Form", "Generated Story Output", "Copy Panel"],
    businessRules: ["Generated stories must be reviewed before ADO submission", "Immutable flag requires TDC PO approval", "All generated stories include Definition of Done"],
    batches: ["All batches (reference)"],
    businessObjects: ["UserStory", "AcceptanceCriteria", "GovernanceFlag", "DefinitionOfDone"],
    integrations: ["Azure DevOps"],
  },

  // ─── DISCOVERY: INTEGRATION ARCHITECTURE ─────────────────────────────────────
  "/discovery/integration-architecture": {
    pageTitle: "Integration Architecture",
    pageIcon: "🔌",
    description: "Six-layer integration architecture — ingestion, processing, AI, decision, consumption, and filing",
    features: ["Layer Diagram", "Component Inventory", "Protocol Reference", "Integration Patterns"],
    apis: ["Reference content — no live APIs"],
    stories: ["Architecture Understanding", "Integration Pattern Reference"],
    screens: ["Layer Diagram", "Component Cards", "Protocol Reference"],
    businessRules: ["All inter-layer communication is event-driven via Service Bus", "No direct database access across layers", "Each layer has exactly one owner"],
    batches: ["B1", "B2", "B3", "B4"],
    businessObjects: ["Layer", "Component", "Protocol", "IntegrationPattern"],
    integrations: ["Service Bus", "PDC", "TDC", "Orchestrator", "Roger", "GoSystem"],
  },

  // ─── DISCOVERY: SIMULATION ───────────────────────────────────────────────────
  "/discovery/simulation": {
    pageTitle: "Data Flow Simulation",
    pageIcon: "🎬",
    description: "32-step animated simulation of the complete DCT data flow",
    features: ["Step-by-Step Animation", "System Handoff Visualization", "Data State Preview", "Pause/Resume Control"],
    apis: ["Reference content — no live APIs"],
    stories: ["Data Flow Simulation", "Step Walkthrough"],
    screens: ["Simulation Player", "Step List", "Data State Panel"],
    businessRules: ["Simulation uses mock data — not production data", "All 32 steps must complete for a valid simulation run"],
    batches: ["B1", "B2", "B3", "B4", "B5"],
    businessObjects: ["SimulationStep", "DataState", "SystemHandoff"],
    integrations: ["PDC Mock", "TDC Mock", "Orchestrator Mock", "Roger Mock"],
  },

  // ─── PROVISION & STATE DISCOVERY WORKSPACE ─────────────────────────────────
  "/onboarding": {
    pageTitle: "Provision & State Discovery Workspace",
    pageIcon: "🔎",
    description: "Single-page discovery workspace for State and Provision BAs — review existing DCT capabilities (B9A, B16, B28) before documenting new requirements.",
    features: [
      "Workstream Overview — State & Provision",
      "Responsibility Matrix (State / Provision / DCT / Roger / GoSystem)",
      "Batch 9A — Gateway & Governed Consumer Access Layer",
      "Batch 16 — Audit Trail & Lineage Governance",
      "Batch 28 — Provision Reference Data & BTP Outbound Contract",
      "End-to-End Data Flow Simulation (State & Provision specific)",
      "Capability Mapping Table (Business Need → Batch → API → Gap?)",
      "B28 Governance Note: B28 is reference data only — provision compute is Provision team / BTP scope",
      "Discovery Questions (4 categories)",
      "Ask Buddy (pre-loaded with B9A / B16 / B28 context)",
    ],
    apis: [
      "GET /api/v1/gateway/tax-profiles/{entityId}",
      "GET /api/v1/gateway/provision/schedules/{period}",
      "GET /api/v1/gateway/state/apportionment/{jurisdiction}",
      "GET /api/v1/gateway/workpapers/{entityId}",
      "GET /api/v1/audit/decisions/{entityId}",
      "GET /api/v1/audit/lineage/{entityId}",
      "GET /api/v1/provision/schedules/{entityId}/{period}",
      "GET /api/v1/provision/workpapers/{entityId}",
      "GET /api/v1/provision/deferred-tax/{entityId}",
      "POST /api/v1/provision/export/gosystem/{entityId}",
    ],
    stories: [
      "State BA reviews existing DCT capabilities before writing requirements",
      "Provision BA identifies Batch 28 as primary provision support",
      "BA confirms no gap exists for audit trail requirement (B16)",
      "BA asks Ask Buddy which APIs support provision schedules",
    ],
    screens: [
      "Workstream Overview Cards",
      "Responsibility Matrix",
      "B9A Capability Card (expandable)",
      "B16 Capability Card (expandable)",
      "B28 Capability Card (expandable)",
      "Data Flow Simulation (ERP → PDC → TDC → Roger → GoSystem)",
      "Capability Mapping Table",
      "Discovery Questions Panel",
      "Ask Buddy Chat",
      "Quick Links Sidebar",
    ],
    businessRules: [
      "BAs must review existing DCT capabilities before documenting new requirements",
      "Batch 28 is the primary batch supporting the Provision workstream",
      "Batch 9A is the gateway for all downstream consumer access (Roger, GoSystem, State, Provision)",
      "Batch 16 provides the audit trail and lineage governance for all TDC decisions",
      "Roger is read-only — it does NOT own data or make decisions",
      "GoSystem is a downstream consumer — it does not write back to DCT",
      "Ask Buddy checks existing capabilities before recommending new requirements",
    ],
    batches: ["B9A", "B16", "B28"],
    businessObjects: [
      "ConsumerProfile", "AccessToken", "DataScope", "APIContract",
      "AuditRecord", "LineageChain", "DecisionHistory",
      "DTAClassification", "DTLClassification", "ETRCategory", "ValuationAllowanceCriterion", "BTPProvisionOutbound",
    ],
    integrations: ["Ask Buddy", "Roger", "GoSystem", "PDC", "TDC", "ERP"],
  },

  // ─── AAP REVIEW ──────────────────────────────────────────────────────────────
  "/aap-review": {
    pageTitle: "AAP Review",
    pageIcon: "📑",
    description: "Architecture Alignment Plan review — architecture decisions and alignment status",
    features: ["AAP Document Viewer", "Decision Log", "Alignment Status", "Review Workflow"],
    apis: ["GET /api/aap/decisions", "GET /api/aap/alignment"],
    stories: ["AAP Review", "Architecture Decision Log"],
    screens: ["AAP Document", "Decision Log", "Alignment Status"],
    businessRules: ["AAP decisions require architecture board approval", "Alignment gaps must be resolved before RC"],
    batches: ["B1", "B2"],
    businessObjects: ["AAPDecision", "AlignmentRecord"],
    integrations: ["Architecture Board", "Azure DevOps"],
  },

  // ─── BATCH DELIVERY REVIEW ───────────────────────────────────────────────────
  "/batch-delivery-review": {
    pageTitle: "Batch Delivery Review",
    pageIcon: "🔎",
    description: "Batch delivery review model — sprint-to-batch mapping and delivery verification",
    features: ["Delivery Review Dashboard", "Sprint-to-Batch Mapping", "Delivery Verification", "Review Sign-Off"],
    apis: ["GET /api/delivery/review", "POST /api/delivery/review/signoff"],
    stories: ["Batch Delivery Review", "Sprint Mapping", "Delivery Sign-Off"],
    screens: ["Review Dashboard", "Sprint Map", "Sign-Off Panel"],
    businessRules: ["All batches must have a delivery review before gate verification", "Sign-off requires PO and architect approval"],
    batches: ["All batches"],
    businessObjects: ["DeliveryReview", "SprintMapping", "SignOff"],
    integrations: ["Azure DevOps", "BatchStatusContext"],
  },

};

// ─── Utility: resolve context for a given pathname ─────────────────────────
// Handles dynamic routes like /batch/:id and /gate/:id
export function resolvePageContext(pathname: string): PageContextEntry | null {
  // Exact match first
  if (PAGE_CONTEXT_REGISTRY[pathname]) {
    return PAGE_CONTEXT_REGISTRY[pathname];
  }

  // Dynamic route matching
  if (/^\/batch\/[^/]+$/.test(pathname)) {
    const entry = PAGE_CONTEXT_REGISTRY["/batch/:id"];
    if (!entry) return null;
    const batchId = pathname.split("/")[2]?.toUpperCase() ?? "Unknown";
    return {
      ...entry,
      pageTitle: `Batch ${batchId} Detail`,
      description: `Detail view for Batch ${batchId} — stories, acceptance criteria, deployment history, and gate status`,
      batches: [batchId],
    };
  }

  if (/^\/gate\/[^/]+$/.test(pathname)) {
    return PAGE_CONTEXT_REGISTRY["/gate/overview"] ?? null;
  }

  if (/^\/agent\/[^/]+$/.test(pathname)) {
    return PAGE_CONTEXT_REGISTRY["/agent-hub"] ?? null;
  }

  if (/^\/architecture\/[^/]+$/.test(pathname)) {
    return PAGE_CONTEXT_REGISTRY["/architecture"] ?? null;
  }

  // Prefix match for discovery sub-pages
  if (pathname.startsWith("/discovery/")) {
    return PAGE_CONTEXT_REGISTRY[pathname] ?? PAGE_CONTEXT_REGISTRY["/discovery"] ?? null;
  }

  return null;
}
