// discoveryRegistry.ts
// Authoritative data map for all Discovery Center pages.
// Each entry defines the full context the Control Panel should display
// when a user navigates to that Discovery page.

export interface DiscoveryPageContext {
  /** Route path (matches App.tsx route) */
  path: string;
  /** Human-readable page title */
  title: string;
  /** One-sentence description */
  description: string;
  /** Icon emoji for visual identity */
  icon: string;
  /** Related platform features (Azure DevOps feature names) */
  relatedFeatures: string[];
  /** Related API endpoints */
  relatedAPIs: { method: string; path: string; owner: string }[];
  /** Related batch IDs (e.g. "B1", "B4", "FC") */
  relatedBatches: string[];
  /** Related business/data objects */
  relatedBusinessObjects: string[];
  /** Related user story titles */
  relatedStories: string[];
  /** Related Roger/UI screens */
  relatedScreens: string[];
  /** Related system integrations */
  relatedIntegrations: string[];
}

export const DISCOVERY_REGISTRY: Record<string, DiscoveryPageContext> = {

  "/discovery": {
    path: "/discovery",
    title: "Discovery Center Hub",
    description: "Central navigation hub for all Discovery Center learning and BA tooling pages.",
    icon: "🧭",
    relatedFeatures: ["Platform Architecture", "BA Onboarding", "Governance Framework"],
    relatedAPIs: [],
    relatedBatches: ["FC"],
    relatedBusinessObjects: ["Platform Architecture", "Delivery Model", "Governance Gates"],
    relatedStories: ["BA Onboarding to DCT Platform", "Discovery Center Navigation"],
    relatedScreens: ["Discovery Center Hub", "Control Panel"],
    relatedIntegrations: ["All Platform Systems"],
  },

  "/discovery/ecosystem": {
    path: "/discovery/ecosystem",
    title: "Ecosystem Overview",
    description: "Full DCT platform ecosystem diagram showing all five systems and their relationships.",
    icon: "🌐",
    relatedFeatures: [
      "Platform Architecture — System Boundaries",
      "PDC File Ingestion Pipeline",
      "TDC Tax Decision Engine",
      "Orchestrator AI Coordination",
      "Roger UI Practitioner Interface",
      "GoSystem Tax Output",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/ingestion/{jobId}",       owner: "PDC" },
      { method: "GET",  path: "/api/v1/normalized-records",      owner: "PDC" },
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}", owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",       owner: "TDC" },
    ],
    relatedBatches: ["FC", "B1", "B2", "B3", "B4", "B5"],
    relatedBusinessObjects: [
      "DocumentId", "JobId", "EntityId", "FinancialFact",
      "TaxProfile", "MappingDecision", "FilingRecord",
    ],
    relatedStories: [
      "Tax Portal File Upload",
      "PDC State Machine",
      "TDC Reference Data Read Contract",
      "AI Mapping Proposals",
      "Roger Primary Read Contract",
    ],
    relatedScreens: [
      "Tax Portal Upload Screen",
      "Roger Dashboard",
      "Roger Mapping Review",
      "Roger Tax Profile",
    ],
    relatedIntegrations: [
      "Tax Portal → Service Bus",
      "Service Bus → PDC",
      "PDC → Orchestrator",
      "Orchestrator → TDC",
      "TDC → Roger UI",
      "TDC → GoSystem Tax",
    ],
  },

  "/discovery/platform-responsibilities": {
    path: "/discovery/platform-responsibilities",
    title: "Platform Responsibilities",
    description: "Ownership boundaries for PDC, TDC, Orchestrator, and Roger — what each system owns and does not own.",
    icon: "🏛",
    relatedFeatures: [
      "PDC — Financial Data Normalization",
      "TDC — Tax Decision Authority",
      "Orchestrator — AI Coordination (Stateless)",
      "Roger — Practitioner Read/Write Surface",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/normalized-records",       owner: "PDC" },
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "GET",  path: "/api/v1/eligibility/{entityId}",   owner: "TDC" },
    ],
    relatedBatches: ["FC", "B1", "B2", "B2A", "B3", "B4"],
    relatedBusinessObjects: [
      "FinancialFact", "FirmTaxonomyId", "TaxProfile",
      "MappingDecision", "ConfidenceBand", "AuditRecord",
    ],
    relatedStories: [
      "Classification Presence Enforcement",
      "Deterministic Validation",
      "TaxFormTemplates & MappingRules",
      "AI Mapping Proposals",
    ],
    relatedScreens: [
      "Roger Mapping Review Screen",
      "Roger Tax Profile Screen",
      "Roger Eligibility Screen",
    ],
    relatedIntegrations: [
      "PDC → TDC (Normalized TB Contract)",
      "TDC → Orchestrator (Reference Data API)",
      "TDC → Roger (Read Contracts)",
    ],
  },

  "/discovery/data-flow": {
    path: "/discovery/data-flow",
    title: "End-to-End Data Flow",
    description: "Full pipeline from Tax Portal file upload through PDC normalization, TDC tax decisions, and GoSystem output.",
    icon: "🔄",
    relatedFeatures: [
      "File Ingestion Pipeline (B1)",
      "Financial Normalization (B2)",
      "Classification Enforcement (B2A)",
      "TDC Reference Data (B3)",
      "AI Tax Mapping (B4)",
      "Tax Return Assembly (B10)",
    ],
    relatedAPIs: [
      { method: "POST", path: "/api/v1/ingestion-jobs",           owner: "PDC" },
      { method: "GET",  path: "/api/v1/ingestion/{jobId}",        owner: "PDC" },
      { method: "GET",  path: "/api/v1/normalized-records",       owner: "PDC" },
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "GET",  path: "/api/v1/filing-records/{id}",      owner: "TDC" },
    ],
    relatedBatches: ["B1", "B2", "B2A", "B3", "B4", "B5", "B6", "B10"],
    relatedBusinessObjects: [
      "DocumentId", "JobId", "FinancialFact", "FirmTaxonomyId",
      "TaxProfile", "MappingDecision", "FilingRecord", "LineageRecord",
    ],
    relatedStories: [
      "Tax Portal File Upload",
      "Service Bus Event Publication",
      "PDC State Machine",
      "Normalized TB Contract",
      "AI Mapping Proposals",
      "Filing Record (immutable)",
    ],
    relatedScreens: [
      "Tax Portal Upload",
      "Roger Ingestion Status",
      "Roger Mapping Review",
      "Roger Sign-Off Screen",
    ],
    relatedIntegrations: [
      "Tax Portal → Service Bus (NEW_FILE_EVENT)",
      "Service Bus → PDC",
      "PDC → Orchestrator (vNormalizedTb)",
      "Orchestrator → TDC (Mapping Proposals)",
      "TDC → GoSystem Tax (Filing Record)",
    ],
  },

  "/discovery/simulation": {
    path: "/discovery/simulation",
    title: "Data Flow Simulation",
    description: "Animated 32-step walkthrough of a single client file moving through the entire DCT pipeline.",
    icon: "▶",
    relatedFeatures: [
      "File Ingestion Pipeline (B1)",
      "Financial Normalization (B2)",
      "AI Tax Mapping (B4)",
      "Roger UI Practitioner Interface",
    ],
    relatedAPIs: [
      { method: "POST", path: "/api/v1/ingestion-jobs",      owner: "PDC" },
      { method: "GET",  path: "/api/v1/ingestion/{jobId}",   owner: "PDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",   owner: "TDC" },
    ],
    relatedBatches: ["B1", "B2", "B4", "B5"],
    relatedBusinessObjects: [
      "DocumentId", "JobId", "FinancialFact", "MappingDecision",
    ],
    relatedStories: [
      "Tax Portal File Upload",
      "PDC State Machine",
      "AI Mapping Proposals",
      "Roger Primary Read Contract",
    ],
    relatedScreens: [
      "Roger Ingestion Status Screen",
      "Roger Mapping Review Screen",
    ],
    relatedIntegrations: [
      "Tax Portal → Service Bus",
      "PDC → Orchestrator",
      "Orchestrator → TDC",
    ],
  },

  "/discovery/integration-architecture": {
    path: "/discovery/integration-architecture",
    title: "Integration Architecture",
    description: "Layered system integration diagram showing event bus, API contracts, and agent coordination patterns.",
    icon: "⚙",
    relatedFeatures: [
      "Service Bus Event Architecture",
      "API Contract Publication",
      "Orchestrator Agent Coordination",
      "Lineage Closure (G4)",
    ],
    relatedAPIs: [
      { method: "POST", path: "/api/v1/ingestion-jobs",          owner: "PDC" },
      { method: "GET",  path: "/api/v1/normalized-records",      owner: "PDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",       owner: "TDC" },
      { method: "GET",  path: "/api/v1/lineage/{entityId}",      owner: "TDC" },
    ],
    relatedBatches: ["FC", "B1", "B2", "B3", "B4", "B5"],
    relatedBusinessObjects: [
      "NEW_FILE_EVENT", "DocumentId", "JobId",
      "vNormalizedTb", "MappingDecision", "LineageRecord",
    ],
    relatedStories: [
      "Service Bus Event Publication",
      "PDC State Machine",
      "TDC Reference Data Read Contract",
      "Decision Audit & Event Publishing",
    ],
    relatedScreens: [
      "Roger Ingestion Status",
      "Roger Audit Trail Screen",
    ],
    relatedIntegrations: [
      "Tax Portal → Service Bus (NEW_FILE_EVENT)",
      "Service Bus → PDC (Event Consumer)",
      "PDC → Orchestrator (vNormalizedTb Read Contract)",
      "Orchestrator → TDC (Proposal Write Contract)",
      "TDC → GoSystem (Filing Record)",
    ],
  },

  "/discovery/ba-requirements": {
    path: "/discovery/ba-requirements",
    title: "BA Requirement Discovery",
    description: "Guided BA workflow for discovering all requirements needed to write a complete Roger user story.",
    icon: "🔍",
    relatedFeatures: [
      "BA Story Readiness Framework",
      "Roger API Discovery",
      "TDC Object Discovery",
      "Acceptance Criteria Standards",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "GET",  path: "/api/v1/eligibility/{entityId}",   owner: "TDC" },
      { method: "PUT",  path: "/api/v1/adjustments/{id}",         owner: "TDC" },
      { method: "POST", path: "/api/v1/sign-off",                 owner: "TDC" },
    ],
    relatedBatches: ["B4", "B5", "B6", "B7", "B8", "B9"],
    relatedBusinessObjects: [
      "TaxProfile", "MappingDecision", "Adjustment",
      "SignOffRecord", "EligibilityRecord", "AuditRecord",
    ],
    relatedStories: [
      "Roger Mapping Review Screen",
      "Roger Adjustment Entry",
      "Roger Sign-Off Workflow",
      "Roger Eligibility Check",
    ],
    relatedScreens: [
      "Roger Mapping Review",
      "Roger Adjustments Screen",
      "Roger Sign-Off Screen",
      "Roger Eligibility Screen",
      "Roger Tax Profile Screen",
    ],
    relatedIntegrations: [
      "Roger UI → TDC (Write Contracts)",
      "TDC → Audit Log",
      "TDC → GoSystem (downstream)",
    ],
  },

  "/discovery/checklist": {
    path: "/discovery/checklist",
    title: "Discovery Checklist",
    description: "13-item story readiness checklist — all items must be checked before a story is submitted to the backlog.",
    icon: "☑",
    relatedFeatures: [
      "BA Story Readiness",
      "Sprint Ceremony Artifacts",
      "Acceptance Criteria Standards",
    ],
    relatedAPIs: [],
    relatedBatches: [],
    relatedBusinessObjects: [
      "Business Objective", "TDC Owner", "Data Owner",
      "API Contract", "Validation Rules", "Error Handling",
      "UI Behavior", "Security Rules", "Audit Requirements",
      "Lineage Record", "Downstream Impacts", "Acceptance Criteria",
    ],
    relatedStories: [
      "Any Roger user story in active sprint planning",
    ],
    relatedScreens: [
      "Discovery Checklist (printable PDF artifact)",
    ],
    relatedIntegrations: [
      "Azure DevOps (story submission)",
      "Sprint Ceremony (readiness gate)",
    ],
  },

  "/discovery/dct-overview": {
    path: "/discovery/dct-overview",
    title: "DCT / TDC Overview",
    description: "Tax Data Consolidation (TDC) architecture, capabilities, batch model, and governance boundaries.",
    icon: "🏗",
    relatedFeatures: [
      "TDC Reference Data (B3)",
      "AI Tax Mapping (B4)",
      "Adjustments & Overrides (B6)",
      "Exception Management (B8)",
      "Tax Return Assembly (B10)",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "GET",  path: "/api/v1/eligibility/{entityId}",   owner: "TDC" },
      { method: "PUT",  path: "/api/v1/adjustments/{id}",         owner: "TDC" },
      { method: "POST", path: "/api/v1/sign-off",                 owner: "TDC" },
      { method: "GET",  path: "/api/v1/filing-records/{id}",      owner: "TDC" },
    ],
    relatedBatches: ["B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10"],
    relatedBusinessObjects: [
      "TaxFormTemplate", "MappingRule", "ConfidenceBand",
      "TaxProfile", "MappingDecision", "Adjustment",
      "SignOffRecord", "FilingRecord", "LineageRecord",
    ],
    relatedStories: [
      "TaxFormTemplates & MappingRules",
      "AI Mapping Proposals",
      "Mapping Decisions (immutable)",
      "Adjustments Entry",
      "Sign-Off Workflow",
      "Filing Record (immutable)",
    ],
    relatedScreens: [
      "Roger Mapping Review",
      "Roger Tax Profile",
      "Roger Adjustments",
      "Roger Sign-Off",
      "Roger Filing Status",
    ],
    relatedIntegrations: [
      "Orchestrator → TDC (Proposal Write)",
      "TDC → Roger (Read Contracts)",
      "TDC → GoSystem Tax (Filing Record)",
      "TDC → Audit Log (Immutable)",
    ],
  },

  "/discovery/roger-overview": {
    path: "/discovery/roger-overview",
    title: "Roger Overview",
    description: "Roger's role as the practitioner-facing read/write surface — capabilities, APIs, and BA guidance.",
    icon: "👤",
    relatedFeatures: [
      "Roger UI Practitioner Interface",
      "Roger Read Contracts (B4, B5)",
      "Roger Write Contracts (B6, B7)",
      "Roger Sign-Off (B9)",
      "Roger Filing Status (B10)",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/ingestion/{jobId}",        owner: "PDC" },
      { method: "GET",  path: "/api/v1/normalized-records",       owner: "PDC" },
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "GET",  path: "/api/v1/eligibility/{entityId}",   owner: "TDC" },
      { method: "PUT",  path: "/api/v1/adjustments/{id}",         owner: "TDC" },
      { method: "POST", path: "/api/v1/sign-off",                 owner: "TDC" },
    ],
    relatedBatches: ["B4", "B5", "B6", "B7", "B9", "B10"],
    relatedBusinessObjects: [
      "TaxProfile", "MappingDecision", "Adjustment",
      "SignOffRecord", "FilingRecord", "EligibilityRecord",
    ],
    relatedStories: [
      "Roger Primary Read Contract",
      "Roger Mapping Review Screen",
      "Roger Adjustment Entry",
      "Roger Sign-Off Workflow",
      "Roger Filing Status",
    ],
    relatedScreens: [
      "Roger Dashboard",
      "Roger Mapping Review",
      "Roger Tax Profile",
      "Roger Adjustments",
      "Roger Sign-Off",
      "Roger Filing Status",
      "Roger Eligibility Check",
    ],
    relatedIntegrations: [
      "Roger UI → TDC (Read Contracts)",
      "Roger UI → TDC (Write Contracts)",
      "Roger UI → PDC (Ingestion Status)",
    ],
  },

  "/discovery/gosystem": {
    path: "/discovery/gosystem",
    title: "GoSystem Tax",
    description: "GoSystem Tax role as the downstream tax preparation system that receives the immutable filing record from TDC.",
    icon: "📋",
    relatedFeatures: [
      "Tax Return Assembly (B10)",
      "GoSystem Integration",
      "Filing Record Publication",
      "Lineage Closure (G4)",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/filing-records/{id}",      owner: "TDC" },
      { method: "GET",  path: "/api/v1/lineage/{entityId}",       owner: "TDC" },
    ],
    relatedBatches: ["B10"],
    relatedBusinessObjects: [
      "FilingRecord", "LineageRecord", "TaxReturnData",
      "ScheduleK1", "Form1120", "StateReturn",
    ],
    relatedStories: [
      "Filing Record (immutable)",
      "GoSystem Outbound Integration",
      "Lineage Closure",
    ],
    relatedScreens: [
      "Roger Filing Status Screen",
      "Roger Lineage View",
    ],
    relatedIntegrations: [
      "TDC → GoSystem Tax (Filing Record outbound)",
      "TDC → Lineage Closure (G4 Gate)",
    ],
  },

  "/discovery/ba-story-builder": {
    path: "/discovery/ba-story-builder",
    title: "BA Story Builder",
    description: "Guided form that auto-generates a complete Azure DevOps-ready user story from discovery inputs.",
    icon: "✍",
    relatedFeatures: [
      "BA Story Readiness Framework",
      "Azure DevOps Story Authoring",
      "Acceptance Criteria Standards",
      "Roger API Discovery",
    ],
    relatedAPIs: [
      { method: "GET",  path: "/api/v1/tax-profiles/{entityId}",  owner: "TDC" },
      { method: "POST", path: "/api/v1/mapping-decisions",        owner: "TDC" },
      { method: "PUT",  path: "/api/v1/adjustments/{id}",         owner: "TDC" },
      { method: "POST", path: "/api/v1/sign-off",                 owner: "TDC" },
    ],
    relatedBatches: ["B4", "B5", "B6", "B7", "B9"],
    relatedBusinessObjects: [
      "TaxProfile", "MappingDecision", "Adjustment",
      "SignOffRecord", "AuditRecord",
    ],
    relatedStories: [
      "Any Roger user story under active BA authoring",
    ],
    relatedScreens: [
      "BA Story Builder Output",
      "Azure DevOps Story Card",
      "Discovery Checklist",
    ],
    relatedIntegrations: [
      "Azure DevOps (story submission)",
      "Sprint Planning (readiness gate)",
    ],
  },
};

/** Returns the context for the current route, or null if not a Discovery page */
export function getDiscoveryContext(pathname: string): DiscoveryPageContext | null {
  // Exact match first
  if (DISCOVERY_REGISTRY[pathname]) return DISCOVERY_REGISTRY[pathname];
  // Prefix match for nested routes
  const keys = Object.keys(DISCOVERY_REGISTRY).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(key) && key !== "/") return DISCOVERY_REGISTRY[key];
  }
  return null;
}

/** Returns true if the given pathname is a Discovery Center route */
export function isDiscoveryRoute(pathname: string): boolean {
  return pathname.startsWith("/discovery");
}
