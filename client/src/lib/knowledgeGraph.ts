// knowledgeGraph.ts
// DCT Platform Knowledge Graph — fully connected node/edge model
// Every entity in the Discovery Center is a node.
// Edges represent typed relationships between nodes.
// Users can navigate the graph by clicking any node.

export type NodeType =
  | "system"       // PDC, TDC, Orchestrator, Roger, GoSystem
  | "api"          // REST API endpoints
  | "story"        // User stories
  | "feature"      // Platform features
  | "businessObject" // Domain entities (KnownMapping, TaxObject, etc.)
  | "screen"       // UI screens
  | "batch"        // Delivery batches (B1–B43)
  | "qa"           // QA test cases / acceptance criteria
  | "gate"         // Governance gates (G1–G4)
  | "page"         // Discovery Center pages
  | "rule";        // Business rules

export type EdgeType =
  | "calls"        // System/screen calls an API
  | "implements"   // Story implements a feature
  | "produces"     // API produces a business object
  | "consumes"     // System/screen consumes a business object
  | "populates"    // API/batch populates a screen
  | "validates"    // QA validates a story/feature
  | "requires"     // Feature/story requires a batch
  | "governs"      // Gate governs a batch
  | "relatedTo"    // Generic bidirectional relationship
  | "partOf"       // Node is part of a parent node
  | "triggers"     // Event/action triggers another node
  | "documents";   // Page documents a node

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  description: string;
  icon: string;
  route?: string;       // Internal route to navigate to
  externalUrl?: string; // External URL if applicable
  metadata?: Record<string, string | string[]>;
}

export interface GraphEdge {
  id: string;
  source: string;  // Node ID
  target: string;  // Node ID
  type: EdgeType;
  label?: string;
}

// ─── NODES ────────────────────────────────────────────────────────────────────

export const GRAPH_NODES: GraphNode[] = [

  // ── SYSTEMS ──────────────────────────────────────────────────────────────────
  { id: "sys-pdc",         label: "PDC",          type: "system", icon: "🏦", description: "Phoenix Data Consolidation (DCT) — ingests and normalizes financial data from ERP systems", route: "/discovery/ecosystem" },
  { id: "sys-tdc",         label: "TDC",          type: "system", icon: "🏛️", description: "Tax Data Consolidation (DCT) — authoritative tax data platform and system of record", route: "/discovery/dct-overview" },
  { id: "sys-orchestrator",label: "Orchestrator", type: "system", icon: "🤖", description: "Stateless AI orchestration engine — executes classification and decision workflows", route: "/discovery/ecosystem" },
  { id: "sys-roger",       label: "Roger",        type: "system", icon: "💬", description: "Practitioner-facing AI assistant — read-only consumer of TDC data", route: "/discovery/roger-overview" },
  { id: "sys-ims",         label: "IMS Integration", type: "system", icon: "🔀", description: "Integration broker between DCT/Roger and all downstream return engines (GoSystem, CCH, OIT). DCT does not connect directly to any return engine.", route: "/discovery/gosystem" },
  { id: "sys-servicebus",  label: "Service Bus",  type: "system", icon: "🔀", description: "Azure Service Bus — event-driven messaging backbone between all systems", route: "/touchpoints" },
  { id: "sys-erp",         label: "ERP / Tax Portal", type: "system", icon: "🏢", description: "Source ERP systems — originate financial data ingested by PDC", route: "/discovery/data-flow" },

  // ── APIS ─────────────────────────────────────────────────────────────────────
  { id: "api-known-mapping",     label: "Known Mapping API",      type: "api", icon: "📡", description: "Returns pre-classified tax mappings for known financial patterns", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/known-mapping", owner: "TDC", consumer: "Roger" } },
  { id: "api-classification",    label: "Classification API",     type: "api", icon: "📡", description: "Returns AI-generated classification for financial line items", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/classification", owner: "Orchestrator", consumer: "Roger" } },
  { id: "api-entity-resolution", label: "Entity Resolution API",  type: "api", icon: "📡", description: "Resolves ambiguous entity references to canonical TDC entities", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/entity-resolution", owner: "TDC", consumer: "Roger" } },
  { id: "api-confidence-band",   label: "Confidence Band API",    type: "api", icon: "📡", description: "Returns confidence score band for AI classification decisions", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/confidence-band", owner: "Orchestrator", consumer: "Roger" } },
  { id: "api-tax-object-map",    label: "Tax Object Map API",     type: "api", icon: "📡", description: "Returns the full tax object mapping for a given financial entity", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/tax-object-map", owner: "TDC", consumer: "Roger" } },
  { id: "api-audit-trail",       label: "Audit Trail API",        type: "api", icon: "📡", description: "Returns the complete audit trail for a tax decision", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/audit-trail", owner: "TDC", consumer: "Roger" } },
  { id: "api-decisions",         label: "Decision Capture API",   type: "api", icon: "📡", description: "Captures practitioner decisions from Roger back to TDC", route: "/roger-api", metadata: { method: "POST", path: "/api/roger/decisions", owner: "TDC", consumer: "Roger" } },
  { id: "api-screens",           label: "Screen Data API",        type: "api", icon: "📡", description: "Returns structured data for Roger screen population", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/screens", owner: "TDC", consumer: "Roger" } },
  { id: "api-validations",       label: "Validation Rules API",   type: "api", icon: "📡", description: "Returns field-level validation rules for Roger screens", route: "/roger-api", metadata: { method: "GET", path: "/api/roger/validations", owner: "TDC", consumer: "Roger" } },
  { id: "api-ims-deliver",       label: "IMS Delivery API",        type: "api", icon: "📡", description: "IMS retrieves governed payload via B9A Gateway and delivers to the appropriate return engine", route: "/discovery/gosystem", metadata: { method: "POST", path: "/api/v1/ims/deliver/{entityId}/{engine}", owner: "IMS", consumer: "GoSystem/CCH/OIT" } },
  { id: "api-batch-status",      label: "Batch Status API",       type: "api", icon: "📡", description: "Returns current status of all delivery batches", route: "/control-panel", metadata: { method: "GET", path: "/api/batches/status", owner: "Platform", consumer: "Control Panel" } },
  { id: "api-gate-health",       label: "Gate Health API",        type: "api", icon: "📡", description: "Returns health status of all four governance gates", route: "/gate/overview", metadata: { method: "GET", path: "/api/gates/health", owner: "Platform", consumer: "Dashboard" } },

  // ── BUSINESS OBJECTS ─────────────────────────────────────────────────────────
  { id: "bo-known-mapping",      label: "Known Mapping",         type: "businessObject", icon: "🗺️", description: "Pre-classified tax mapping record — immutable once published", route: "/roger-mapping" },
  { id: "bo-classification",     label: "Classification",        type: "businessObject", icon: "🔍", description: "AI-generated classification result with confidence score", route: "/classification-walkthrough" },
  { id: "bo-tax-object",         label: "Tax Object",            type: "businessObject", icon: "💰", description: "Canonical tax domain entity in TDC — the unit of tax decision-making", route: "/discovery/dct-overview" },
  { id: "bo-confidence-band",    label: "Confidence Band",       type: "businessObject", icon: "📊", description: "Confidence score range (0–1) for AI classification decisions", route: "/roger-mapping" },
  { id: "bo-audit-trail",        label: "Audit Trail",           type: "businessObject", icon: "📋", description: "Immutable log of all tax decisions and data transformations", route: "/data-governance" },
  { id: "bo-decision",           label: "Decision",              type: "businessObject", icon: "⚖️", description: "Practitioner tax decision captured from Roger and written to TDC", route: "/discovery/roger-overview" },
  { id: "bo-ims-payload",        label: "IMS Payload",           type: "businessObject", icon: "📝", description: "Governed tax-ready payload retrieved by IMS via B9A Gateway for delivery to return engine", route: "/discovery/gosystem" },
  { id: "bo-entity-resolution",  label: "Entity Resolution",     type: "businessObject", icon: "🔗", description: "Resolved canonical entity reference from ambiguous input", route: "/discovery/roger-overview" },
  { id: "bo-lineage-record",     label: "Lineage Record",        type: "businessObject", icon: "🧬", description: "Data lineage record tracking transformation history", route: "/data-governance" },
  { id: "bo-schema",             label: "Schema",                type: "businessObject", icon: "🗄️", description: "TDC or PDC data schema definition — versioned and governed", route: "/data-model" },
  { id: "bo-taxonomy-node",      label: "Taxonomy Node",         type: "businessObject", icon: "🌳", description: "Classification hierarchy node in the DCT taxonomy", route: "/taxonomy" },
  { id: "bo-contract",           label: "API Contract",          type: "businessObject", icon: "📜", description: "Published API contract — defines interface between systems", route: "/gate/overview" },
  { id: "bo-field-mapping",      label: "Field Mapping",         type: "businessObject", icon: "↔️", description: "Mapping between financial data fields and IMS-ready return engine fields", route: "/tax-mapping" },

  // ── SCREENS ──────────────────────────────────────────────────────────────────
  { id: "scr-known-mapping",     label: "Known Mapping Screen",      type: "screen", icon: "🖥️", description: "Roger screen displaying pre-classified tax mappings for review", route: "/discovery/roger-overview" },
  { id: "scr-classification",    label: "Classification Review",     type: "screen", icon: "🖥️", description: "Roger screen for reviewing and overriding AI classifications", route: "/classification-walkthrough" },
  { id: "scr-entity-resolution", label: "Entity Resolution Panel",   type: "screen", icon: "🖥️", description: "Roger screen for resolving ambiguous entity references", route: "/discovery/roger-overview" },
  { id: "scr-confidence-band",   label: "Confidence Band Display",   type: "screen", icon: "🖥️", description: "Roger screen showing confidence scores for AI decisions", route: "/discovery/roger-overview" },
  { id: "scr-tax-object-map",    label: "Tax Object Map",            type: "screen", icon: "🖥️", description: "Roger screen displaying the full tax object hierarchy", route: "/roger-mapping" },
  { id: "scr-audit-trail",       label: "Audit Trail Screen",        type: "screen", icon: "🖥️", description: "Roger screen showing the complete audit history for a decision", route: "/discovery/roger-overview" },
  { id: "scr-gosystem-export",   label: "GoSystem Export Panel",     type: "screen", icon: "🖥️", description: "Roger screen for initiating and reviewing GoSystem tax exports", route: "/discovery/gosystem" },
  { id: "scr-validation-rules",  label: "Validation Rules Panel",    type: "screen", icon: "🖥️", description: "Roger screen displaying field-level validation requirements", route: "/discovery/roger-overview" },
  { id: "scr-batch-control",     label: "Batch Control Panel",       type: "screen", icon: "🖥️", description: "Platform admin screen for managing batch status and gate verification", route: "/control-panel" },
  { id: "scr-gate-overview",     label: "Governance Gates Screen",   type: "screen", icon: "🖥️", description: "Platform screen showing all four governance gate statuses", route: "/gate/overview" },

  // ── FEATURES ─────────────────────────────────────────────────────────────────
  { id: "feat-known-mapping",    label: "Known Mapping",         type: "feature", icon: "⭐", description: "Pre-classification of known financial patterns to tax categories", route: "/discovery/roger-overview" },
  { id: "feat-classification",   label: "AI Classification",     type: "feature", icon: "⭐", description: "AI-powered classification of financial line items to tax categories", route: "/classification-walkthrough" },
  { id: "feat-entity-res",       label: "Entity Resolution",     type: "feature", icon: "⭐", description: "Resolving ambiguous financial entities to canonical TDC records", route: "/discovery/roger-overview" },
  { id: "feat-confidence",       label: "Confidence Scoring",    type: "feature", icon: "⭐", description: "Scoring AI classification confidence to flag low-confidence items for review", route: "/discovery/roger-overview" },
  { id: "feat-audit",            label: "Audit Trail",           type: "feature", icon: "⭐", description: "Immutable audit logging of all tax decisions and data transformations", route: "/data-governance" },
  { id: "feat-ims",              label: "IMS Integration",       type: "feature", icon: "⭐", description: "IMS engine routing, payload translation, and delivery to return engines (GoSystem, CCH, OIT)", route: "/discovery/gosystem" },
  { id: "feat-decision-capture", label: "Decision Capture",      type: "feature", icon: "⭐", description: "Capturing practitioner tax decisions from Roger back to TDC", route: "/discovery/roger-overview" },
  { id: "feat-schema-lock",      label: "Schema Lock",           type: "feature", icon: "⭐", description: "Governance gate that locks all schemas before downstream development begins", route: "/gate/overview" },
  { id: "feat-lineage",          label: "Lineage Closure",       type: "feature", icon: "⭐", description: "Governance gate ensuring complete data lineage documentation", route: "/gate/overview" },
  { id: "feat-batch-delivery",   label: "Batch Delivery Model",  type: "feature", icon: "⭐", description: "Architectural batch delivery model replacing story-first sprint delivery", route: "/discovery/dct-overview" },

  // ── BATCHES ──────────────────────────────────────────────────────────────────
  { id: "batch-b1",  label: "B1 — Foundation Schema",       type: "batch", icon: "📦", description: "Establishes core TDC schema and PDC ingestion foundation", route: "/batch/B1" },
  { id: "batch-b2",  label: "B2 — Data Model",              type: "batch", icon: "📦", description: "Defines canonical data model entities and relationships", route: "/batch/B2" },
  { id: "batch-b3",  label: "B3 — Service Bus Integration", type: "batch", icon: "📦", description: "Wires Service Bus event-driven messaging between PDC and TDC", route: "/batch/B3" },
  { id: "batch-b4",  label: "B4 — API Contracts",           type: "batch", icon: "📦", description: "Publishes all inter-system API contracts to the registry", route: "/batch/B4" },
  { id: "batch-b5",  label: "B5 — Taxonomy",                type: "batch", icon: "📦", description: "Builds the financial data classification taxonomy", route: "/batch/B5" },
  { id: "batch-b9",  label: "B9 — Roger API Foundation",    type: "batch", icon: "📦", description: "Establishes Roger's core API surface and screen data contracts", route: "/batch/B9" },
  { id: "batch-b15", label: "B15 — Known Mapping",          type: "batch", icon: "📦", description: "Implements Known Mapping pre-classification feature", route: "/batch/B15" },
  { id: "batch-b16", label: "B16 — Entity Resolution",      type: "batch", icon: "📦", description: "Implements entity resolution for ambiguous financial data", route: "/batch/B16" },
  { id: "batch-b17", label: "B17 — Confidence Scoring",     type: "batch", icon: "📦", description: "Implements AI confidence band scoring for classifications", route: "/batch/B17" },
  { id: "batch-b9a", label: "B9A — Gateway & Governed Access", type: "batch", icon: "📦", description: "B9A Gateway provides governed access layer for IMS, Roger, State, and Provision consumers", route: "/batch/9a" },
  { id: "batch-b39", label: "B39 — Tax Field Mapping",      type: "batch", icon: "📦", description: "Maps TDC tax objects to IMS-ready payload format for return engine delivery", route: "/batch/B39" },
  { id: "batch-b40", label: "B40 — Export Validation",      type: "batch", icon: "📦", description: "Validates IMS payload completeness and field requirements before delivery to return engine", route: "/batch/B40" },
  { id: "batch-b42", label: "B42 — Roger Screen Population",type: "batch", icon: "📦", description: "Implements full Roger screen population from TDC APIs", route: "/batch/B42" },
  { id: "batch-b43", label: "B43 — Decision Capture",       type: "batch", icon: "📦", description: "Implements practitioner decision capture from Roger to TDC", route: "/batch/B43" },

  // ── GOVERNANCE GATES ─────────────────────────────────────────────────────────
  { id: "gate-g1", label: "G1 — Schema Lock",          type: "gate", icon: "🔒", description: "All schemas finalized and locked before downstream development", route: "/gate/overview" },
  { id: "gate-g2", label: "G2 — Invariant Lock",       type: "gate", icon: "🔒", description: "All business rules and invariants locked", route: "/gate/overview" },
  { id: "gate-g3", label: "G3 — Contract Publication", type: "gate", icon: "🔒", description: "All API contracts published to the registry", route: "/gate/overview" },
  { id: "gate-g4", label: "G4 — Lineage Closure",      type: "gate", icon: "🔒", description: "Complete data lineage documented and verified", route: "/gate/overview" },

  // ── USER STORIES ─────────────────────────────────────────────────────────────
  { id: "story-known-mapping",    label: "Story: Known Mapping Display",       type: "story", icon: "📖", description: "As a practitioner, I want to see pre-classified tax mappings so I can review without manual classification", route: "/discovery/ba-story-builder" },
  { id: "story-classification",   label: "Story: Classification Review",       type: "story", icon: "📖", description: "As a practitioner, I want to review and override AI classifications so I can ensure accuracy", route: "/discovery/ba-story-builder" },
  { id: "story-ims-delivery",     label: "Story: IMS Return Engine Delivery",  type: "story", icon: "📖", description: "As a practitioner, I want IMS to deliver governed tax data to the return engine so I can complete tax filing", route: "/discovery/ba-story-builder" },
  { id: "story-decision-capture", label: "Story: Decision Capture",            type: "story", icon: "📖", description: "As a practitioner, I want my tax decisions captured automatically so I have a complete audit trail", route: "/discovery/ba-story-builder" },
  { id: "story-audit-trail",      label: "Story: Audit Trail Review",          type: "story", icon: "📖", description: "As a practitioner, I want to view the complete audit trail so I can verify decision history", route: "/discovery/ba-story-builder" },
  { id: "story-confidence-band",  label: "Story: Confidence Band Display",     type: "story", icon: "📖", description: "As a practitioner, I want to see confidence scores so I know which items need manual review", route: "/discovery/ba-story-builder" },
  { id: "story-entity-resolution",label: "Story: Entity Resolution",           type: "story", icon: "📖", description: "As a practitioner, I want ambiguous entities resolved automatically so I can focus on review", route: "/discovery/ba-story-builder" },
  { id: "story-validation",       label: "Story: Field Validation",            type: "story", icon: "📖", description: "As a practitioner, I want to see validation errors before export so I can fix issues proactively", route: "/discovery/ba-story-builder" },

  // ── QA ITEMS ─────────────────────────────────────────────────────────────────
  { id: "qa-known-mapping",    label: "QA: Known Mapping Accuracy",        type: "qa", icon: "✅", description: "Verify known mappings return correct tax categories for all test cases", route: "/discovery/checklist" },
  { id: "qa-classification",   label: "QA: Classification Confidence",     type: "qa", icon: "✅", description: "Verify confidence scores are >= 0.85 for all auto-classified items", route: "/discovery/checklist" },
  { id: "qa-ims-delivery",     label: "QA: IMS Payload Completeness",      type: "qa", icon: "✅", description: "Verify all required IMS payload fields are populated before delivery to return engine", route: "/discovery/checklist" },
  { id: "qa-decision-capture", label: "QA: Decision Write-Back",           type: "qa", icon: "✅", description: "Verify practitioner decisions are written to TDC within 2 seconds", route: "/discovery/checklist" },
  { id: "qa-audit-trail",      label: "QA: Audit Trail Completeness",      type: "qa", icon: "✅", description: "Verify all tax decisions appear in audit trail with correct timestamps", route: "/discovery/checklist" },
  { id: "qa-validation",       label: "QA: Validation Error Display",      type: "qa", icon: "✅", description: "Verify validation errors are shown before export attempt", route: "/discovery/checklist" },
  { id: "qa-entity-resolution",label: "QA: Entity Resolution Accuracy",    type: "qa", icon: "✅", description: "Verify entity resolution returns correct canonical entity for all test inputs", route: "/discovery/checklist" },

  // ── DISCOVERY PAGES ──────────────────────────────────────────────────────────
  { id: "page-roger",          label: "Roger Overview",          type: "page", icon: "🧭", description: "Discovery page covering Roger architecture, APIs, screens, and governance", route: "/discovery/roger-overview" },
  { id: "page-ims",            label: "IMS Integration",         type: "page", icon: "🧭", description: "Discovery page covering IMS as integration broker between DCT/Roger and all downstream return engines", route: "/discovery/gosystem" },
  { id: "page-dct",            label: "TDC / DCT Overview",      type: "page", icon: "🧭", description: "Discovery page covering TDC architecture, batch model, and governance gates", route: "/discovery/dct-overview" },
  { id: "page-ecosystem",      label: "Ecosystem Overview",      type: "page", icon: "🧭", description: "Discovery page covering all five platform components and their relationships", route: "/discovery/ecosystem" },
  { id: "page-data-flow",      label: "End-to-End Data Flow",    type: "page", icon: "🧭", description: "Discovery page covering the complete data flow from ERP to IMS delivery to return engine", route: "/discovery/data-flow" },
  { id: "page-ba-requirements",label: "BA Requirement Discovery",type: "page", icon: "🧭", description: "Discovery page with 13-question BA discovery workflow", route: "/discovery/ba-requirements" },
  { id: "page-checklist",      label: "Discovery Checklist",     type: "page", icon: "🧭", description: "Discovery page with 13-item story readiness checklist", route: "/discovery/checklist" },
  { id: "page-glossary",       label: "Glossary",                type: "page", icon: "🧭", description: "Discovery page with searchable DCT terminology glossary", route: "/discovery/glossary" },
  { id: "page-story-builder",  label: "BA Story Builder",        type: "page", icon: "🧭", description: "Discovery page with guided form for generating ADO-ready user stories", route: "/discovery/ba-story-builder" },

  // ── BUSINESS RULES ───────────────────────────────────────────────────────────
  { id: "rule-roger-readonly",    label: "Roger is Read-Only",             type: "rule", icon: "📏", description: "Roger never writes to TDC directly — all writes go through the Decision Capture API", route: "/discovery/roger-overview" },
  { id: "rule-confidence-85",     label: "Confidence Threshold 0.85",     type: "rule", icon: "📏", description: "Classifications with confidence < 0.85 require manual practitioner review", route: "/discovery/roger-overview" },
  { id: "rule-ims-required",      label: "IMS Payload Fields Required",    type: "rule", icon: "📏", description: "All required IMS payload fields must be populated — missing fields block delivery to return engine", route: "/discovery/gosystem" },
  { id: "rule-tdc-immutable",     label: "TDC Decisions are Immutable",   type: "rule", icon: "📏", description: "Once written to TDC, tax decisions cannot be modified — only superseded", route: "/discovery/dct-overview" },
  { id: "rule-schema-lock",       label: "Schema Lock Required",           type: "rule", icon: "📏", description: "Schema changes require G1 Schema Lock gate approval before implementation", route: "/gate/overview" },
  { id: "rule-api-contract",      label: "API Contract Required",          type: "rule", icon: "📏", description: "All inter-system APIs must have a published contract before G3 passes", route: "/gate/overview" },
];

// ─── EDGES ────────────────────────────────────────────────────────────────────

export const GRAPH_EDGES: GraphEdge[] = [

  // ── ROGER calls APIs ─────────────────────────────────────────────────────────
  { id: "e1",  source: "sys-roger", target: "api-known-mapping",     type: "calls",    label: "calls" },
  { id: "e2",  source: "sys-roger", target: "api-classification",    type: "calls",    label: "calls" },
  { id: "e3",  source: "sys-roger", target: "api-entity-resolution", type: "calls",    label: "calls" },
  { id: "e4",  source: "sys-roger", target: "api-confidence-band",   type: "calls",    label: "calls" },
  { id: "e5",  source: "sys-roger", target: "api-tax-object-map",    type: "calls",    label: "calls" },
  { id: "e6",  source: "sys-roger", target: "api-audit-trail",       type: "calls",    label: "calls" },
  { id: "e7",  source: "sys-roger", target: "api-decisions",         type: "calls",    label: "calls" },
  { id: "e8",  source: "sys-roger", target: "api-screens",           type: "calls",    label: "calls" },
  { id: "e9",  source: "sys-roger", target: "api-validations",       type: "calls",    label: "calls" },
  { id: "e10", source: "sys-roger", target: "api-gosystem-export",   type: "calls",    label: "calls" },

  // ── APIs produce Business Objects ─────────────────────────────────────────────
  { id: "e11", source: "api-known-mapping",     target: "bo-known-mapping",     type: "produces", label: "produces" },
  { id: "e12", source: "api-classification",    target: "bo-classification",    type: "produces", label: "produces" },
  { id: "e13", source: "api-entity-resolution", target: "bo-entity-resolution", type: "produces", label: "produces" },
  { id: "e14", source: "api-confidence-band",   target: "bo-confidence-band",   type: "produces", label: "produces" },
  { id: "e15", source: "api-tax-object-map",    target: "bo-tax-object",        type: "produces", label: "produces" },
  { id: "e16", source: "api-audit-trail",       target: "bo-audit-trail",       type: "produces", label: "produces" },
  { id: "e17", source: "api-decisions",         target: "bo-decision",          type: "produces", label: "produces" },
  { id: "e18", source: "api-gosystem-export",   target: "bo-gosystem-field",    type: "produces", label: "produces" },

  // ── APIs populate Screens ────────────────────────────────────────────────────
  { id: "e19", source: "api-known-mapping",     target: "scr-known-mapping",     type: "populates", label: "populates" },
  { id: "e20", source: "api-classification",    target: "scr-classification",    type: "populates", label: "populates" },
  { id: "e21", source: "api-entity-resolution", target: "scr-entity-resolution", type: "populates", label: "populates" },
  { id: "e22", source: "api-confidence-band",   target: "scr-confidence-band",   type: "populates", label: "populates" },
  { id: "e23", source: "api-tax-object-map",    target: "scr-tax-object-map",    type: "populates", label: "populates" },
  { id: "e24", source: "api-audit-trail",       target: "scr-audit-trail",       type: "populates", label: "populates" },
  { id: "e25", source: "api-gosystem-export",   target: "scr-gosystem-export",   type: "populates", label: "populates" },
  { id: "e26", source: "api-validations",       target: "scr-validation-rules",  type: "populates", label: "populates" },

  // ── Stories implement Features ────────────────────────────────────────────────
  { id: "e27", source: "story-known-mapping",    target: "feat-known-mapping",    type: "implements", label: "implements" },
  { id: "e28", source: "story-classification",   target: "feat-classification",   type: "implements", label: "implements" },
  { id: "e29", source: "story-gosystem-export",  target: "feat-gosystem",         type: "implements", label: "implements" },
  { id: "e30", source: "story-decision-capture", target: "feat-decision-capture", type: "implements", label: "implements" },
  { id: "e31", source: "story-audit-trail",      target: "feat-audit",            type: "implements", label: "implements" },
  { id: "e32", source: "story-confidence-band",  target: "feat-confidence",       type: "implements", label: "implements" },
  { id: "e33", source: "story-entity-resolution",target: "feat-entity-res",       type: "implements", label: "implements" },

  // ── Stories require Batches ───────────────────────────────────────────────────
  { id: "e34", source: "story-known-mapping",    target: "batch-b15", type: "requires", label: "requires" },
  { id: "e35", source: "story-classification",   target: "batch-b9",  type: "requires", label: "requires" },
  { id: "e36", source: "story-gosystem-export",  target: "batch-b38", type: "requires", label: "requires" },
  { id: "e37", source: "story-decision-capture", target: "batch-b43", type: "requires", label: "requires" },
  { id: "e38", source: "story-confidence-band",  target: "batch-b17", type: "requires", label: "requires" },
  { id: "e39", source: "story-entity-resolution",target: "batch-b16", type: "requires", label: "requires" },
  { id: "e40", source: "story-audit-trail",      target: "batch-b9",  type: "requires", label: "requires" },

  // ── QA validates Stories ─────────────────────────────────────────────────────
  { id: "e41", source: "qa-known-mapping",    target: "story-known-mapping",    type: "validates", label: "validates" },
  { id: "e42", source: "qa-classification",   target: "story-classification",   type: "validates", label: "validates" },
  { id: "e43", source: "qa-gosystem-export",  target: "story-gosystem-export",  type: "validates", label: "validates" },
  { id: "e44", source: "qa-decision-capture", target: "story-decision-capture", type: "validates", label: "validates" },
  { id: "e45", source: "qa-audit-trail",      target: "story-audit-trail",      type: "validates", label: "validates" },
  { id: "e46", source: "qa-validation",       target: "story-validation",       type: "validates", label: "validates" },
  { id: "e47", source: "qa-entity-resolution",target: "story-entity-resolution",type: "validates", label: "validates" },

  // ── Gates govern Batches ─────────────────────────────────────────────────────
  { id: "e48", source: "gate-g1", target: "batch-b1",  type: "governs", label: "governs" },
  { id: "e49", source: "gate-g1", target: "batch-b2",  type: "governs", label: "governs" },
  { id: "e50", source: "gate-g2", target: "batch-b3",  type: "governs", label: "governs" },
  { id: "e51", source: "gate-g2", target: "batch-b4",  type: "governs", label: "governs" },
  { id: "e52", source: "gate-g3", target: "batch-b4",  type: "governs", label: "governs" },
  { id: "e53", source: "gate-g4", target: "batch-b9",  type: "governs", label: "governs" },

  // ── Systems own APIs ─────────────────────────────────────────────────────────
  { id: "e54", source: "sys-tdc",          target: "api-known-mapping",     type: "partOf", label: "owns" },
  { id: "e55", source: "sys-orchestrator", target: "api-classification",    type: "partOf", label: "owns" },
  { id: "e56", source: "sys-tdc",          target: "api-entity-resolution", type: "partOf", label: "owns" },
  { id: "e57", source: "sys-orchestrator", target: "api-confidence-band",   type: "partOf", label: "owns" },
  { id: "e58", source: "sys-tdc",          target: "api-tax-object-map",    type: "partOf", label: "owns" },
  { id: "e59", source: "sys-tdc",          target: "api-audit-trail",       type: "partOf", label: "owns" },
  { id: "e60", source: "sys-tdc",          target: "api-decisions",         type: "partOf", label: "owns" },
  { id: "e61", source: "sys-tdc",          target: "api-screens",           type: "partOf", label: "owns" },
  { id: "e62", source: "sys-tdc",          target: "api-validations",       type: "partOf", label: "owns" },
  { id: "e63", source: "sys-tdc",          target: "api-gosystem-export",   type: "partOf", label: "owns" },

  // ── IMS consumes APIs via B9A Gateway ────────────────────────────────────────
  { id: "e64", source: "sys-gosystem", target: "api-gosystem-export", type: "consumes", label: "consumes" },
  { id: "e65", source: "sys-gosystem", target: "bo-gosystem-field",   type: "consumes", label: "consumes" },

  // ── Discovery pages document systems ─────────────────────────────────────────
  { id: "e66", source: "page-roger",    target: "sys-roger",       type: "documents", label: "documents" },
  { id: "e67", source: "page-gosystem", target: "sys-gosystem",    type: "documents", label: "documents" },
  { id: "e68", source: "page-dct",      target: "sys-tdc",         type: "documents", label: "documents" },
  { id: "e69", source: "page-ecosystem",target: "sys-pdc",         type: "documents", label: "documents" },
  { id: "e70", source: "page-ecosystem",target: "sys-orchestrator",type: "documents", label: "documents" },

  // ── Business Rules govern systems/features ────────────────────────────────────
  { id: "e71", source: "rule-roger-readonly",    target: "sys-roger",       type: "governs", label: "governs" },
  { id: "e72", source: "rule-confidence-85",     target: "feat-confidence", type: "governs", label: "governs" },
  { id: "e73", source: "rule-gosystem-required", target: "feat-gosystem",   type: "governs", label: "governs" },
  { id: "e74", source: "rule-tdc-immutable",     target: "sys-tdc",         type: "governs", label: "governs" },
  { id: "e75", source: "rule-schema-lock",       target: "gate-g1",         type: "governs", label: "governs" },
  { id: "e76", source: "rule-api-contract",      target: "gate-g3",         type: "governs", label: "governs" },

  // ── PDC feeds TDC ────────────────────────────────────────────────────────────
  { id: "e77", source: "sys-pdc",        target: "sys-tdc",         type: "triggers",  label: "feeds" },
  { id: "e78", source: "sys-erp",        target: "sys-pdc",         type: "triggers",  label: "sends to" },
  { id: "e79", source: "sys-tdc",        target: "sys-orchestrator",type: "triggers",  label: "triggers" },
  { id: "e80", source: "sys-orchestrator",target: "sys-tdc",        type: "triggers",  label: "writes to" },
  { id: "e81", source: "sys-servicebus", target: "sys-tdc",         type: "triggers",  label: "routes to" },
  { id: "e82", source: "sys-servicebus", target: "sys-pdc",         type: "triggers",  label: "routes to" },

  // ── Batches relate to each other ─────────────────────────────────────────────
  { id: "e83", source: "batch-b1",  target: "batch-b2",  type: "relatedTo", label: "precedes" },
  { id: "e84", source: "batch-b2",  target: "batch-b3",  type: "relatedTo", label: "precedes" },
  { id: "e85", source: "batch-b3",  target: "batch-b4",  type: "relatedTo", label: "precedes" },
  { id: "e86", source: "batch-b4",  target: "batch-b9",  type: "relatedTo", label: "precedes" },
  { id: "e87", source: "batch-b9",  target: "batch-b15", type: "relatedTo", label: "precedes" },
  { id: "e88", source: "batch-b9",  target: "batch-b42", type: "relatedTo", label: "precedes" },
  { id: "e89", source: "batch-b38", target: "batch-b39", type: "relatedTo", label: "precedes" },
  { id: "e90", source: "batch-b39", target: "batch-b40", type: "relatedTo", label: "precedes" },
  { id: "e91", source: "batch-b42", target: "batch-b43", type: "relatedTo", label: "precedes" },
];

// ─── Utility: get all nodes connected to a given node ─────────────────────────
export function getConnectedNodes(nodeId: string): {
  node: GraphNode;
  edge: GraphEdge;
  direction: "outbound" | "inbound";
}[] {
  const results: { node: GraphNode; edge: GraphEdge; direction: "outbound" | "inbound" }[] = [];
  const seen = new Set<string>();
  const nodeMap = new Map(GRAPH_NODES.map(n => [n.id, n]));

  for (const edge of GRAPH_EDGES) {
    if (edge.source === nodeId) {
      const target = nodeMap.get(edge.target);
      if (target && !seen.has(target.id)) {
        seen.add(target.id);
        results.push({ node: target, edge, direction: "outbound" });
      }
    } else if (edge.target === nodeId) {
      const source = nodeMap.get(edge.source);
      if (source && !seen.has(source.id)) {
        seen.add(source.id);
        results.push({ node: source, edge, direction: "inbound" });
      }
    }
  }

  return results;
}

// ─── Utility: get all nodes of a given type connected to a node ───────────────
export function getRelatedByType(nodeId: string, type: NodeType): GraphNode[] {
  return getConnectedNodes(nodeId)
    .filter(c => c.node.type === type)
    .map(c => c.node);
}

// ─── Utility: find a node by ID ───────────────────────────────────────────────
export function findNode(id: string): GraphNode | undefined {
  return GRAPH_NODES.find(n => n.id === id);
}

// ─── Utility: get nodes by type ───────────────────────────────────────────────
export function getNodesByType(type: NodeType): GraphNode[] {
  return GRAPH_NODES.filter(n => n.type === type);
}

// ─── Node type display config ─────────────────────────────────────────────────
export const NODE_TYPE_CONFIG: Record<NodeType, { label: string; color: string; bg: string; border: string }> = {
  system:         { label: "System",          color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  api:            { label: "API",             color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
  story:          { label: "User Story",      color: "#6b21a8", bg: "#faf5ff", border: "#e9d5ff" },
  feature:        { label: "Feature",         color: "#9a3412", bg: "#fff7ed", border: "#fed7aa" },
  businessObject: { label: "Business Object", color: "#713f12", bg: "#fefce8", border: "#fde68a" },
  screen:         { label: "Screen",          color: "#0c4a6e", bg: "#f0f9ff", border: "#bae6fd" },
  batch:          { label: "Batch",           color: "#374151", bg: "#f9fafb", border: "#d1d5db" },
  qa:             { label: "QA",              color: "#065f46", bg: "#ecfdf5", border: "#a7f3d0" },
  gate:           { label: "Gate",            color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
  page:           { label: "Discovery Page",  color: "#4338ca", bg: "#eef2ff", border: "#c7d2fe" },
  rule:           { label: "Business Rule",   color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
};
