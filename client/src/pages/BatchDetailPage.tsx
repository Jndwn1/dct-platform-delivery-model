// BatchDetailPage.tsx — Individual batch detail view for all FC + B1–B23
// Data source: batchModel.ts (centralized BatchEntry registry)
// Route: /batch/:id  (e.g. /batch/B1, /batch/B2, /batch/FC, /batch/1, /batch/2)

import { Link, useRoute } from "wouter";
import {
  getAllBatches,
  getBatchById,
  PI_GROUPS,
  STATUS_STYLES,
  type BatchEntry,
  type BatchStatus,
} from "@/lib/batchModel";
import { useBatchStatus, type BatchKey } from "@/contexts/BatchStatusContext";

// Map batchModel ID → context BatchKey (e.g. "B1" → "1", "FC" → "foundation-core")
function batchModelIdToContextKey(id: string): BatchKey | null {
  if (id === "FC") return "foundation-core";
  const m = id.match(/^B(\d+[A-Za-z]?)$/);
  if (!m) return null;
  const num = m[1].toLowerCase();
  const validKeys = ["1","2","2a","3","4","5","6","7","8","9","10","11"];
  return validKeys.includes(num) ? num as BatchKey : null;
}

// Map context BatchStatus → batchModel BatchStatus
function contextStatusToBatchModel(s: string): BatchStatus {
  if (s === "Complete") return "Complete";
  if (s === "In Review") return "Review";
  if (s === "Dev") return "Dev";
  return "Planned";
}

// ── URL param → batch ID normalizer ──────────────────────────────────────────
// Sidebar links use /batch/1, /batch/2a, /batch/foundation-core etc.
// batchModel uses "B1", "B2A", "FC" etc.
function normalizeToBatchId(raw: string): string {
  const r = raw.toLowerCase().trim();
  if (r === "fc" || r === "foundation-core") return "FC";
  if (r === "mt" || r === "migration-track") return "MT";
  // "2a" → "B2A", "2" → "B2", "12" → "B12"
  const upper = r.toUpperCase();
  if (!upper.startsWith("B")) return `B${upper}`;
  return upper;
}

// ── Extended content per batch ────────────────────────────────────────────────
interface BatchContent {
  gate: string;
  systems: string[];
  lead: string;
  entryCondition: string;
  exitCondition: string;
  executiveNote?: string;
  governanceTags?: string[];
  governanceBoundary?: string;
  openClarifications?: string;
  excludedFields?: string[];
  deliverableProjectionFields?: string[];
  stories: { title: string; wmbt: string }[];
}

const BATCH_CONTENT: Record<string, BatchContent> = {
  FC: {
    gate: "None (infrastructure only)",
    systems: ["PDC", "TDC", "Orchestrator"],
    lead: "Platform Engineering Lead",
    entryCondition: "Project kickoff approved; team onboarded",
    exitCondition: "Dev environment live; CI/CD pipeline operational; shared code templates published",
    stories: [
      { title: "Dev Environment Setup", wmbt: "All engineers have working local environments with shared tooling and linting rules." },
      { title: "CI/CD Pipeline", wmbt: "Automated build, test, and deploy pipeline operational for all workstreams." },
      { title: "Shared Code Templates", wmbt: "Contract-first templates published for PDC, TDC, and Orchestrator workstreams." },
      { title: "Agent Scaffolding", wmbt: "Base agent interfaces and tooling scaffolded for AI workstream." },
    ],
  },
  B1: {
    gate: "G1 — Schema Lock",
    systems: ["Tax Portal", "Service Bus", "PDC"],
    lead: "PDC Workstream Lead",
    entryCondition: "Foundation Core complete; Tax Portal accessible",
    exitCondition: "File ingested; DocumentId and JobId assigned; NEW_FILE_EVENT published; IngestionStatus API live",
    stories: [
      { title: "Tax Portal File Upload", wmbt: "Practitioners upload client financial files via Tax Portal. System generates immutable DocumentId (GUID) and JobId (GUID) on receipt." },
      { title: "Service Bus Event Publication", wmbt: "Tax Portal publishes NEW_FILE_EVENT to file_ingestion_events topic with DocumentId, JobId, EntityId, PeriodStart, PeriodEnd, and file metadata." },
      { title: "PDC State Machine", wmbt: "PDC tracks ingestion state: RECEIVED → PROCESSING → NORMALIZED → FAILED. State transitions are logged with timestamps." },
      { title: "IngestionStatus API (Roger Read Surface)", wmbt: "Roger reads ingestion status via GET /api/v1/ingestion/{jobId}. Exposes current state, DocumentId, and error details on FAILED." },
    ],
  },
  B2: {
    gate: "G1 — Schema Lock",
    systems: ["PDC", "Orchestrator"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 1 complete; NEW_FILE_EVENT received by PDC",
    exitCondition: "vNormalizedTb read contract published; FinancialFact records persisted; CrossLOBMapping records live",
    stories: [
      { title: "File Schemas & Firm Financial Taxonomy Reference Data", wmbt: "PDC hosts canonical schemas and firm taxonomy reference data the Orchestrator needs to identify, normalize, and classify files." },
      { title: "EDGAR Corpus Integration", wmbt: "EDGAR corpus loaded as supplementary reference for cross-LOB taxonomy resolution." },
      { title: "Normalized TB Contract (Roger Read Surface)", wmbt: "vNormalizedTb read contract exposes clean financial facts scoped by EntityId + PeriodStart + PeriodEnd + RunId (latest run by default)." },
      { title: "CrossLOBMapping Persistence", wmbt: "Cross-LOB taxonomy mappings persisted as structured records queryable by documentId." },
    ],
  },
  B2A: {
    gate: "G2 — Invariant Lock",
    systems: ["PDC", "Orchestrator"],
    lead: "PDC Workstream Lead + Orchestrator Lead",
    entryCondition: "Batch 2 complete; FirmTaxonomy reference data loaded",
    exitCondition: "FirmTaxonomyId enforcement active; rejection audit log live; classification rejection rate < 1%",
    stories: [
      { title: "Classification Presence Enforcement", wmbt: "PDC validates that every Orchestrator response includes a non-null FirmTaxonomyId. Unclassified records are never persisted." },
      { title: "Deterministic Validation", wmbt: "PDC applies deterministic validation rules so that the same input always produces the same outcome (accept or reject)." },
      { title: "FirmTaxonomyId Record-Level Storage", wmbt: "PDC stores FirmTaxonomyId at the record level on every accepted normalized record so that classification is queryable per record with RunId lineage intact." },
      { title: "Validation Audit Log", wmbt: "PDC exposes a validation audit log endpoint so that every acceptance and rejection is traceable with structured context." },
    ],
  },
  B3: {
    gate: "G2 — Invariant Lock",
    systems: ["TDC"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 2A complete; TDC infrastructure provisioned",
    exitCondition: "TaxFormTemplates loaded; ConfidenceBandThresholds configured; TDC Reference Data API live",
    stories: [
      { title: "TaxFormTemplates & MappingRules", wmbt: "Tax form templates and mapping rules loaded as versioned, immutable reference data. Updates require a new version — no in-place mutation." },
      { title: "ConfidenceBandThresholds Configuration", wmbt: "GREEN / YELLOW / RED thresholds configured and versioned. Thresholds govern AI confidence band assignment in Batch 4." },
      { title: "Corporate Tax Profile Reference Data (Form 1120)", wmbt: "Corporate tax profile data loaded, versioned, and governed. M-1 vs M-3 determination is governed and traceable." },
      { title: "TDC Reference Data Read Contract (Orchestrator-facing)", wmbt: "Read contract published for Orchestrator consumption. TDC fully prepared for AI Tax Mapping." },
    ],
  },
  B4: {
    gate: "G3 — Contract Publication",
    systems: ["Orchestrator", "TDC", "Roger UI"],
    lead: "AI Workstream Lead + TDC Workstream Lead",
    entryCondition: "Batch 3 complete; Orchestrator connected to TDC Reference Data API",
    exitCondition: "AI mapping proposals persisted in TDC; TDC Records API live; Roger consuming GREEN/YELLOW/RED distribution",
    stories: [
      { title: "AI Mapping Proposals", wmbt: "TDC receives and persists AI proposals as immutable records with confidence scores (GREEN/YELLOW/RED/UNRESOLVED) and structured evidence." },
      { title: "Mapping Decisions", wmbt: "Practitioners can accept, override, or reject proposals. Decisions are append-only, recorded immutably, and layered on top of proposals without mutation." },
      { title: "Explainability Layer", wmbt: "Structured evidence and reasoning chain queryable per proposal. Enables practitioners to understand AI reasoning before accepting." },
      { title: "TDC Records API Contract (Roger Read Surface)", wmbt: "Roger's primary read contract is live. Exposes: GREEN/YELLOW/RED distribution, pending vs decided, full traceability to source." },
    ],
  },
  B5: {
    gate: "G3 — Contract Publication",
    systems: ["PDC", "CEM"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 2 complete; CEM integration available",
    exitCondition: "EntityId lifecycle established; entity hierarchy API live; entitlement mappings queryable",
    stories: [
      { title: "EntityId Lifecycle Management", wmbt: "PDC syncs entity identity from CEM. EntityId is immutable once assigned. Deactivation is a state change, not a deletion." },
      { title: "Client Group Hierarchy", wmbt: "Parent-child ownership relationships queryable via GET /api/v1/entities/{clientId}/hierarchy." },
      { title: "Entitlement Mappings", wmbt: "User-to-entity entitlement mappings enforce access scoping. Roger uses entitlements to filter visible entities per practitioner." },
      { title: "Entity Identity Read Contract", wmbt: "PDC entity read contract published. Roger uses EntityId to scope all views, navigate multi-entity engagements, and display client hierarchy." },
    ],
  },
  B6: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "PDC", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 4 complete; Batch 5 complete; practitioners onboarded",
    exitCondition: "Practitioner decisions persisted; TAX_READY records locked; six-state adjustment lifecycle live",
    stories: [
      { title: "Practitioner Decision Submission", wmbt: "Roger submits practitioner decisions via POST /api/v1/roger/decisions. Decisions are append-only — no updates or deletes." },
      { title: "Adjustment Lifecycle", wmbt: "Six-state lifecycle governs adjustments from DRAFT through LOCKED. LOCKED records cannot be mutated." },
      { title: "TAX_READY Record Derivation", wmbt: "TDC derives TAX_READY records from accepted/overridden proposals. TAX_READY status is permanent once assigned." },
      { title: "Decision Audit Trail", wmbt: "Full decision history queryable per TDC record. Every decision includes actor, timestamp, decision type, and rationale." },
    ],
  },
  B7: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 6 complete; client tax profile reference data loaded",
    exitCondition: "Three-Tier Eligibility determination live; Roger surfacing eligibility gates; jurisdiction flags queryable",
    stories: [
      { title: "Three-Tier Eligibility Determination", wmbt: "TDC evaluates client against eligibility rules and produces ELIGIBLE / CONDITIONAL / INELIGIBLE determination. Determination is immutable once produced." },
      { title: "Eligibility History", wmbt: "Append-only eligibility determination history queryable per client. Roger displays history to support practitioner review." },
      { title: "Jurisdiction Flags", wmbt: "Active jurisdiction-level flags affecting filing obligations surfaced via GET /api/v1/clients/{clientId}/tax-profile/jurisdiction-flags." },
      { title: "Roger Eligibility Gating", wmbt: "Roger reads eligibility result and gates practitioner workflows. INELIGIBLE clients display blocking indicators with reason." },
    ],
  },
  B8: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC", "Roger UI"],
    lead: "PDC Workstream Lead + TDC Workstream Lead",
    entryCondition: "Batch 6 complete; exception taxonomy agreed",
    exitCondition: "Exception records live in PDC and TDC; remediation workflow operational; Roger surfacing exception dashboard",
    stories: [
      { title: "PDC Exception Record Structure", wmbt: "PDC captures ingestion and normalization exceptions. State machine: OPEN → IN_PROGRESS → RESOLVED / CLOSED / SUPPRESSED." },
      { title: "TDC Exception Record Structure", wmbt: "TDC captures mapping, decision, and workflow exceptions. Invariant violation exceptions have a restricted path to SUPPRESSED requiring an authorized override record." },
      { title: "Remediation Action Submission", wmbt: "Roger submits remediation actions via POST /api/v1/exceptions/{exceptionId}/remediate. Actions are append-only." },
      { title: "Exception Dashboard (Roger)", wmbt: "Roger home page surfaces exception summary: count by severity (CRITICAL/WARNING/INFO) and system (PDC/TDC). Critical exceptions show blocking indicator." },
    ],
  },
  B9: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC", "IMS", "Roger UI"],
    lead: "PDC Workstream Lead + TDC Workstream Lead",
    entryCondition: "Batch 5 complete; IMS integration available; Batch 6 complete",
    exitCondition: "IMS retrieval contract live; rollforward proposals generated; Roger surfacing prior year comparison",
    stories: [
      { title: "IMS Sync Mechanism & Schema Registry", wmbt: "PDC calls IMS with scoping keys (ClientId, EntityId, TaxYear, ReturnType). Invalid payloads rejected with structured errors." },
      { title: "IMS Inbound Retrieval Contract", wmbt: "IMS inbound retrieval contract published as versioned OpenAPI specification. PDC owns the contract — IMS builds to it." },
      { title: "Prior Year Reference Data", wmbt: "TDC receives normalized prior year decision data and persists as immutable versioned reference data with ACTIVE/SUPERSEDED lifecycle." },
      { title: "Rollforward Proposals", wmbt: "Rollforward proposals generated with confidence scoring using Batch 4 Confidence Band Thresholds. source_type flag (ORCHESTRATOR / ROLLFORWARD) distinguishes proposal origin." },
      { title: "v_rollforward Read Contract (Roger Read Surface)", wmbt: "v_rollforward contract extends the existing TDC Records API for Roger. Roger surfaces rollforward proposals in the review queue with prior year context visible." },
    ],
  },
  B10: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "PDC", "IMS", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 6 complete; all TAX_READY records locked; IMS outbound contract agreed",
    exitCondition: "Return assembled; filing record produced; lineage chain closed; Roger displaying full return view",
    stories: [
      { title: "Return Assembly & Cross-Schedule Validation", wmbt: "TDC assembles returns from locked tax-ready records. BLOCKING rules must pass; WARNING rules surface without blocking." },
      { title: "Filing Record", wmbt: "Immutable filing record produced with denormalized filed amounts snapshot. FILED status assigned when filing record is created." },
      { title: "Return Output Contracts (Roger Read Surface)", wmbt: "Roger surfaces the complete return assembly, filing status, and full lineage chain." },
      { title: "IMS Outbound Contract Publication", wmbt: "TDC delivers directly to IMS — synchronous HTTP 200 acknowledgment, idempotent via delivery_id." },
      { title: "Cross-Layer Lineage View", wmbt: "Cross-layer lineage view closes end-to-end traceability from source file through to filing confirmation." },
    ],
  },
  B11: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "Orchestrator", "Roger UI"],
    lead: "TDC Workstream Lead + AI Workstream Lead",
    entryCondition: "Batch 4 complete; sufficient practitioner decision volume available",
    exitCondition: "Learning signals captured under human-controlled promotion governance; model registry live; PromotionHash validated; O12 lineage published; confidence trend data available to Roger",
    executiveNote: "Batch 11 governs how practitioner decisions become controlled learning signals without allowing autonomous model evolution or uncontrolled AI feedback loops.",
    governanceTags: ["Lineage Critical", "TDC"],
    stories: [
      { title: "Immutable Learning Signal Capture", wmbt: "Practitioner decision outcomes captured as immutable learning signals. Signals derived exclusively from ORCHESTRATOR-source events — no direct practitioner input or ad hoc signal injection permitted." },
      { title: "Consent-Evaluated Signal Persistence", wmbt: "Every learning signal evaluated against consent rules before persistence. Signals failing consent evaluation are discarded and logged. Revocation workflows supported — revoked signals are suppressed from future training runs." },
      { title: "Human-Controlled Promotion Governance", wmbt: "No autonomous model promotion. Every model promotion requires explicit human approval. PromotionHash validated at promotion gate to ensure signal integrity. Promotion record is immutable and auditable." },
      { title: "De-identification Enforcement", wmbt: "All learning signals de-identified before persistence. PII and client-identifiable data stripped at signal capture. De-identification enforcement logged as a lineage event." },
      { title: "Model Registry & Version Governance", wmbt: "Model registration, approval workflow, deployment gate, and rollback all governed and auditable. No model version deployed without passing promotion gate." },
      { title: "Confidence Trend Analytics & Drift Detection", wmbt: "Queryable metrics by model version, entity type, and period. Drift detection flags statistically significant changes. Drift events published as O12 lineage events." },
      { title: "O12 Lineage Publication", wmbt: "All learning governance events — signal capture, consent evaluation, promotion, revocation — published as O12 lineage events. Additive-only contract behavior: no event may be deleted or mutated." },
      { title: "Batch 11 Read Contract (Roger Read Surface)", wmbt: "Roger surfaces model version context on mapping proposals and confidence trend data for leadership via governed read contract only." },
    ],
  },
  B12: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TIM", "Roger UI"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 5 complete; TIM integration available; deliverables and task-state endpoints stable",
    exitCondition: "PDC synchronizing engagements, scope, team assignments, deliverables, and deliverable task state from TIM; Roger consuming all operational engagement data through PDC governed read contracts only",
    executiveNote: "PDC remains the single integration point for TIM operational data. Roger consumes engagement, deliverable, and task-state projections through governed PDC read contracts only.",
    governanceBoundary: "TIM Deliverables are operational workflow metadata only and are NOT governed filing records. TDC Filing Records remain the sole filing authority.",
    governanceTags: ["PDC", "Read Contract", "Operational Metadata Only"],
    deliverableProjectionFields: ["deliverableId", "form", "jurisdiction", "statutory due date", "extension due date", "current due date", "status", "consolidated flag", "task state", "last updated metadata"],
    excludedFields: ["signoff", "attestation", "filing authority", "return identifiers", "governed filing lifecycle", "amounts"],
    openClarifications: "TIM phase hierarchy/object modeling remains under clarification pending confirmation whether phases are first-class TIM entities or workflow abstractions.",
    stories: [
      { title: "PDC → TIM Engagement Synchronization", wmbt: "PDC synchronizes engagements, scope, and team assignments from TIM. TIM IDs reconciled to PDC canonical EntityId and ClientGroupId. Roger never calls TIM directly." },
      { title: "Deliverables Endpoint Ingestion", wmbt: "PDC ingests deliverable data from TIM deliverables endpoint. Projection fields: deliverableId, form, jurisdiction, statutory due date, extension due date, current due date, status, consolidated flag. Explicitly excluded: signoff, attestation, filing authority, return identifiers, governed filing lifecycle, and amounts." },
      { title: "Task-State Endpoint Ingestion", wmbt: "PDC ingests task-state data from TIM task-state endpoint. Task state projected as operational metadata only — not a governed filing record." },
      { title: "Reconciliation Logic & Structured Sync Failures", wmbt: "Reconciliation logic applied to all TIM sync operations. Structured sync failures logged with root cause classification. Endpoint stability governance enforced — breaking TIM API changes require formal change notification." },
      { title: "Engagement Lifecycle Tracking", wmbt: "Lifecycle events (open, active, closed) tracked as immutable records with timestamps. TIM Deliverables are operational workflow metadata only — not governed filing records." },
      { title: "Engagement Ownership Contract", wmbt: "TIM is the authoritative source for engagement codes. DCT does not create or modify engagement codes. Roger never calls TIM directly. Consolidated filing hierarchy and filing lineage remain governed by Batch 10 and future consolidated-return governance batches." },
      { title: "Roger Engagement View (PDC Read Contract)", wmbt: "Roger surfaces engagement status, deliverable projections, task-state, and lifecycle events via Engagement Operations read contract from PDC only. No direct Roger-to-TIM integration." },
      { title: "Identity Reconciliation", wmbt: "TIM IDs reconciled to PDC canonical EntityId and ClientGroupId. Reconciliation failures are logged and surfaced as exceptions." },
    ],
  },
  B13: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "Roger UI"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 12 complete; regulatory calendar data available",
    exitCondition: "Platform reference data live; document provenance records queryable; Roger displaying deadline-aware context",
    stories: [
      { title: "Industry & Currency Reference Data", wmbt: "Industry codes and currency codes loaded as versioned reference data. Updates require a new version — no in-place mutation." },
      { title: "Regulatory Calendar", wmbt: "Regulatory filing deadlines and extension rules available for any jurisdiction. Roger displays deadline-aware workflow context." },
      { title: "Document Provenance Records", wmbt: "Document provenance records show file identity, hash, and version history. Tamper-evidence enforced via hash chain." },
      { title: "Platform Reference Data Read Contract", wmbt: "Read contract published for Roger and downstream consumers. Reference data versioned and queryable." },
    ],
  },
  B14: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 13 complete; computation rule taxonomy agreed",
    exitCondition: "Governed tax formula registry live; deterministic execution enforced; formula lineage published; effective dating applied; computation audit records queryable; no ad hoc practitioner calculations permitted",
    executiveNote: "Batch 14 establishes governed, reproducible tax computation logic as reusable platform assets.",
    governanceTags: ["TDC", "Read Contract"],
    stories: [
      { title: "Governed Tax Formula Registry", wmbt: "All tax computation formulas registered in the governed formula registry. No ad hoc practitioner calculations permitted outside the registry. Every formula is versioned, effective-dated, and immutable once published." },
      { title: "Deterministic Execution", wmbt: "All formula executions are deterministic — same inputs always produce the same output. Execution traceable to formula version, entity, and tax year. Every computation is reproducible from the audit record." },
      { title: "Formula Lineage", wmbt: "Formula lineage published for every computation. Lineage record includes formula version, input snapshot, execution timestamp, and output hash." },
      { title: "Effective Dating", wmbt: "All formulas carry effective date ranges. Formula lookups resolve to the correct version for the applicable tax year. Retroactive formula changes require a new version — no in-place mutation." },
      { title: "Computation Rule Engine", wmbt: "Versioned computation rules for depreciation (MACRS, Straight-Line, Bonus) queryable by tax year. Limitation rules (Section 179, bonus depreciation phase-outs) governed as versioned reference data." },
      { title: "Cross-Formula Dependency Governance", wmbt: "Cross-formula dependencies tracked in the registry. Dependent formulas flagged when a dependency version changes. No formula may reference an unpublished or draft dependency." },
      { title: "Rule Version Governance", wmbt: "Rule version governance enforced — every version increment requires review approval. Rollback to prior version supported via version registry." },
      { title: "Reconciliation Formulas", wmbt: "M-1, M-3, and Schedule L reconciliation formulas governed in TDC. Updates require version increment. Reconciliation formulas are immutable once published." },
      { title: "Computation Audit Record", wmbt: "Computation audit record traceable to rule version, entity, and tax year. Every computation is reproducible." },
      { title: "Rate Tables", wmbt: "Tax rate tables (federal, state, blended) governed as versioned reference data queryable by jurisdiction and tax year." },
      { title: "Computation Rules Read Contract", wmbt: "Read contract published for Orchestrator and Batch 18 consumption." },
    ],
  },
  B15: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "Orchestrator"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 14 complete; ASC 740 reference data available",
    exitCondition: "ASC 740 reference layer live; provision applicability reference data loaded; Tax Provision Reference Data read contract published",
    stories: [
      { title: "ASC 740 Current Tax Expense Rules", wmbt: "ASC 740 current tax expense rules queryable by jurisdiction and tax year." },
      { title: "Deferred Tax Reference Data", wmbt: "Deferred tax reference data including temporary difference categories and measurement guidance." },
      { title: "ETR Reconciliation Reference", wmbt: "ETR reconciliation reference data — statutory rates, permanent differences, discrete items." },
      { title: "UTP Reference Data", wmbt: "Uncertain Tax Position (UTP) reference data — recognition and measurement thresholds." },
      { title: "Provision Applicability Reference", wmbt: "Provision applicability reference data loaded — C-corp vs pass-through governed." },
      { title: "Tax Provision Reference Data Read Contract", wmbt: "Read contract live for Orchestrator and Batch 18 consumption." },
      { title: "Valuation Allowance Reference", wmbt: "Valuation allowance assessment criteria governed as reference data." },
      { title: "Consolidated Provision Reference", wmbt: "Consolidated provision rules for affiliated groups loaded and versioned." },
    ],
  },
  B16: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC"],
    lead: "PDC Workstream Lead + TDC Workstream Lead",
    entryCondition: "Batch 13 complete; audit event taxonomy agreed; EventTypeCatalog defined",
    exitCondition: "Canonical audit lineage governance live; chain-participating event integrity enforced; tax-scope EventTypeCatalog governed; disclosure logging active; AccessLoggingRequirement enforced; immutable chain lineage published; legal hold enforcement operational",
    executiveNote: "Batch 16 establishes immutable, legally defensible lineage and disclosure governance across all governed platform workflows.",
    governanceTags: ["Lineage Critical", "PDC", "TDC"],
    stories: [
      { title: "Canonical Audit Lineage Governance", wmbt: "Canonical audit lineage governance established across PDC and TDC. Every governed event participates in the immutable chain. Chain-participating event integrity enforced — no event may be inserted, deleted, or mutated after publication." },
      { title: "Tax-Scope EventTypeCatalog Governance", wmbt: "Tax-scope EventTypeCatalog governed in TDC. All TDC event types registered, versioned, and approved before use. EventTypeCatalog is the authoritative registry for all lineage event classifications." },
      { title: "Disclosure Logging", wmbt: "Disclosure logging active for all governed data access events. Every disclosure event logged with actor, timestamp, data scope, and purpose. Disclosure log is immutable and queryable." },
      { title: "AccessLoggingRequirement Governance", wmbt: "AccessLoggingRequirement enforced for all governed read contract consumers. Every read access logged against the AccessLoggingRequirement policy. Non-compliant access attempts are blocked and flagged." },
      { title: "READ_CONTRACT_PUBLISHED Lineage Events", wmbt: "READ_CONTRACT_PUBLISHED events published to the lineage chain when governed read contracts are activated. Contract publication is a lineage-participating event — consumers can trace which contract version governs their data access." },
      { title: "Immutable Chain Lineage", wmbt: "Immutable chain lineage enforced across all governed workflows. Hash chain verification available for any lineage segment. Tamper-evidence confirmation queryable by engagement, entity, and period." },
      { title: "Legal Hold Enforcement", wmbt: "Legal hold enforcement operational. Records under legal hold are protected from deletion or modification. Legal hold status queryable by engagement. Hold release requires explicit authorized action." },
      { title: "TDC Lineage Event Schema", wmbt: "Complete event log for TDC defined and queryable. Every mapping, decision, and lock event captured and chain-participating." },
      { title: "PDC Platform-Wide Lineage Event Schema", wmbt: "PDC platform-wide lineage event schema covers ingestion, normalization, and entity sync. All PDC lineage events are additive-only." },
      { title: "Retention Rules", wmbt: "Audit record retention rules defined and enforced. Records retained for regulatory compliance period. Retention policy versioned and auditable." },
      { title: "Audit Trail Read Contract", wmbt: "Roger and compliance teams can retrieve full audit trail for any engagement via governed read contract. Audit trail spans both PDC canonical governance and TDC tax-scope governance." },
      { title: "Audit Trail Query API", wmbt: "Audit log queryable by entity, period, event type, actor, and date range." },
    ],
  },
  B17: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 16 complete; override policy taxonomy agreed",
    exitCondition: "Override policies queryable; workpapers locked and snapshot-pinned; schedule templates available in Roger",
    stories: [
      { title: "Override Policy Governance", wmbt: "Override policies queryable and versioned. Every override requires a policy reference and actor record." },
      { title: "Evidence Records", wmbt: "Evidence records attached to override decisions. Evidence is immutable and queryable by decision." },
      { title: "Workpaper Lock & Snapshot Pinning", wmbt: "Workpapers locked and pinned to exact data snapshot at lock time. Locked workpapers cannot be mutated." },
      { title: "Schedule Templates", wmbt: "Schedule templates for depreciation, amortization, and M-1/M-3 available in Roger." },
      { title: "Decision Support Read Contract", wmbt: "Roger reads override policies, evidence records, and workpaper status via governed read contract." },
      { title: "Override Audit Trail", wmbt: "Full override audit trail queryable by entity, period, and actor." },
    ],
  },
  B18: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "PDC", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 14 complete; Batch 15 complete; book-basis data locked",
    exitCondition: "Provision computation live; DTA/DTL balances tracked; consolidated provision computed; ETR reconciliation available",
    stories: [
      { title: "Current Tax Expense Computation", wmbt: "Current tax expense computed deterministically from locked book-basis data. Computation traceable to rule version." },
      { title: "Deferred Tax Computation", wmbt: "Deferred tax computed from temporary differences. DTA/DTL balances tracked with valuation allowances." },
      { title: "ETR Reconciliation", wmbt: "ETR reconciliation produced from current and deferred tax components. Reconciliation items classified and governed." },
      { title: "Consolidated Provision", wmbt: "Consolidated provision computed for affiliated groups. Intercompany eliminations applied." },
      { title: "DTA/DTL Balance Tracking", wmbt: "DTA/DTL balances tracked with valuation allowances. Rollforward from prior year via Batch 9." },
      { title: "Provision Computation Read Contract", wmbt: "Roger surfaces provision computation results, DTA/DTL balances, and ETR reconciliation." },
      { title: "Provision Audit Record", wmbt: "Every provision computation produces an immutable audit record traceable to inputs and rule versions." },
      { title: "Provision Computation API", wmbt: "Provision computation results queryable by entity, period, and tax year." },
    ],
  },
  B19: {
    gate: "G4 — Lineage Closure",
    systems: ["TDC", "PDC", "Roger UI"],
    lead: "TDC Workstream Lead",
    entryCondition: "Batch 17 complete; Batch 18 complete; provision computation live",
    exitCondition: "Provision sign-off workflow live; Audit LOB output contract published; Roger surfacing complete provision workflow",
    stories: [
      { title: "Provision Review Workflow", wmbt: "Provision review workflow: proposals, adjustments, and sign-off tracked as immutable lifecycle records." },
      { title: "Provision Sign-Off", wmbt: "Provision sign-off independent of return sign-off — aligned to financial reporting period." },
      { title: "Prior Year DTA/DTL Rollforward", wmbt: "Prior year DTA/DTL rollforward via Batch 9 mechanism. Rollforward candidates highlighted in Roger." },
      { title: "Audit LOB Output Contract", wmbt: "Audit LOB consumes locked book tax expense via governed outbound contract." },
      { title: "UTP Workflow", wmbt: "Uncertain Tax Position workflow: identification, measurement, and disclosure governed." },
      { title: "Roger Provision Workflow View", wmbt: "Roger surfaces complete provision workflow: proposals, ETR reconciliation, UTPs, and sign-off status." },
    ],
  },
  B20: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "Roger UI"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 17 complete; firm governance data available",
    exitCondition: "Engagement acceptance criteria queryable; CPA license status live; no sign-off proceeds without governance requirements met",
    stories: [
      { title: "Engagement Acceptance Criteria", wmbt: "Engagement acceptance criteria queryable — new engagements gated by firm governance rules." },
      { title: "AML & Sanctions Screening", wmbt: "AML and sanctions screening results tracked as immutable records per engagement." },
      { title: "Independence Rules", wmbt: "Independence rules enforced at engagement level. Conflicts surfaced and tracked." },
      { title: "CPA License Status", wmbt: "CPA license status and signing authority data available. Expired licenses block sign-off." },
      { title: "Firm Governance Read Contract", wmbt: "Roger surfaces firm governance status — no sign-off proceeds without governance requirements being met." },
    ],
  },
  B21: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC", "Roger UI"],
    lead: "PDC Workstream Lead + TDC Workstream Lead",
    entryCondition: "Batch 19 complete; Batch 20 complete; QC framework agreed",
    exitCondition: "QC review lifecycle tracked; independence confirmation applied; no engagement closes without QC requirements satisfied",
    stories: [
      { title: "QC Review Assignment", wmbt: "QC review assignment and lifecycle tracked for return and provision engagements." },
      { title: "Concurring Partner Standards", wmbt: "Concurring partner review requirements enforced for engagements above materiality threshold." },
      { title: "Independence Confirmation", wmbt: "Independence confirmation standards applied to all engagements requiring concurring review." },
      { title: "QC Lifecycle Tracking", wmbt: "QC lifecycle: ASSIGNED → IN_REVIEW → COMPLETE / REJECTED. Tracked as immutable records." },
      { title: "QC Closure Gate", wmbt: "No engagement closes without QC requirements being satisfied. QC gate enforced at closure." },
      { title: "QC Read Contract", wmbt: "Roger surfaces QC status and lifecycle for practitioners and leadership." },
    ],
  },
  B22: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "Roger UI"],
    lead: "PDC Workstream Lead",
    entryCondition: "Batch 21 complete; client communication framework agreed",
    exitCondition: "Outstanding item lifecycle tracked; aging visible; client communication read contract extends Engagement Operations",
    stories: [
      { title: "Outstanding Item Lifecycle", wmbt: "Outstanding item lifecycle tracked: REQUESTED → RECEIVED → CLOSED. Items are immutable once closed." },
      { title: "Information Request Tracking", wmbt: "Information requests tracked per engagement with requestor, recipient, and due date." },
      { title: "Outstanding Item Aging", wmbt: "Aging of outstanding items visible — overdue items surfaced with escalation indicators." },
      { title: "Client Communication Read Contract", wmbt: "Client Communication read contract extends Engagement Operations from Batch 12. Roger surfaces outstanding items in engagement view." },
    ],
  },
  B23: {
    gate: "None (analytics layer)",
    systems: ["PDC", "Roger UI"],
    lead: "Analytics Workstream Lead",
    entryCondition: "Batch 22 complete; peer group definitions agreed",
    exitCondition: "Peer group definitions queryable; benchmark data live; Roger surfacing benchmark context alongside tax-ready records",
    stories: [
      { title: "Peer Group Definitions", wmbt: "Peer group definitions queryable and versioned. Peer groups defined by industry, entity type, and size." },
      { title: "Industry Benchmark Data", wmbt: "Industry benchmark data loaded as versioned reference data. Comparable ratios available by peer group." },
      { title: "Comparable Ratios", wmbt: "Comparable ratios (ETR, DTA/DTL ratios, provision-to-income) queryable by peer group and tax year." },
      { title: "Roger Benchmark View", wmbt: "Roger surfaces benchmark context alongside tax-ready and provision-ready records. Outlier indicators visible — positions deviating from peer group surfaced." },
    ],
  },
  B24: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC"],
    lead: "PDC Workstream Lead (framework) + TDC Workstream Lead (tax advisory logic)",
    entryCondition: "Batch 19 complete; advisory governance framework agreed; LOB-neutral advisory foundation scoped",
    exitCondition: "Cross-LOB advisory governance framework live in PDC; tax-flavored advisory logic governed in TDC; governed advisory opportunity framework established; live detection workflows not yet executing",
    executiveNote: "Batch 24 establishes the governed advisory opportunity framework but does not yet execute live detection workflows.",
    governanceTags: ["Lineage Critical", "PDC", "TDC", "Read Contract"],
    stories: [
      { title: "PDC: Cross-LOB Advisory Governance Framework", wmbt: "Cross-LOB advisory governance framework established in PDC. LOB-neutral foundation — no LOB-specific advisory logic in PDC. OpportunityCategory governance: all advisory opportunity categories registered, versioned, and approved before use." },
      { title: "PDC: ScoringFramework Governance", wmbt: "ScoringFramework governed in PDC as versioned reference data. Scoring logic is LOB-neutral. Updates require version increment and approval." },
      { title: "PDC: SuppressionRule Governance", wmbt: "SuppressionRule governed in PDC. Suppression rules versioned and auditable. Suppression evaluation is deterministic and traceable." },
      { title: "PDC: DetectionRun Scaffolding", wmbt: "DetectionRun scaffolding established in PDC. Detection runs are consumer-initiated only — no background jobs, schedulers, or autonomous processes may create detection artifacts." },
      { title: "TDC: Tax-Flavored Advisory Logic", wmbt: "Tax-flavored advisory logic governed in TDC. TDC owns all tax-specific advisory rules — PDC does not contain tax advisory logic." },
      { title: "TDC: TaxThresholdDefinition Governance", wmbt: "TaxThresholdDefinition governed in TDC as versioned reference data. Threshold definitions are effective-dated and immutable once published." },
      { title: "TDC: TaxDetectionRule Governance", wmbt: "TaxDetectionRule governed in TDC. All tax detection rules registered, versioned, and approved before use. RuleSourceDeclaration required for every rule." },
      { title: "TDC: TaxRuleExecutorRegistry Governance", wmbt: "TaxRuleExecutorRegistry governed in TDC. Executor registration required before any tax detection rule may execute. TaxYear precedence logic enforced — most recent applicable tax year governs." },
    ],
  },
  B25: {
    gate: "G4 — Lineage Closure",
    systems: ["PDC", "TDC", "Orchestrator", "Roger UI"],
    lead: "PDC Workstream Lead (orchestration/runtime) + TDC Workstream Lead (advisory content)",
    entryCondition: "Batch 24 complete; advisory governance framework live; consumer-initiated detection pattern agreed",
    exitCondition: "Consumer-initiated detection orchestration live; OpportunityRecord persisted; DecisionRecord governed; SurfacingRecord persisted; suppression evaluation engine operational; Advisory Detection Read Contract published; immutable advisory lineage active",
    executiveNote: "Batch 25 operationalizes governed advisory opportunity workflows while preserving immutable lineage, suppression governance, and explicit practitioner interaction.",
    governanceBoundary: "No background jobs, schedulers, streaming subscriptions, or autonomous processes may create advisory workflow artifacts.",
    governanceTags: ["Lineage Critical", "PDC", "TDC", "Read Contract"],
    stories: [
      { title: "Consumer-Initiated Detection Orchestration", wmbt: "Detection orchestration is consumer-initiated only. No background jobs, schedulers, streaming subscriptions, or autonomous processes may create advisory workflow artifacts. Every detection run triggered by explicit consumer action." },
      { title: "OpportunityRecord Persistence", wmbt: "OpportunityRecord persisted as an immutable record upon detection. OpportunityRecord includes detection run reference, rule version, entity, tax year, and opportunity classification." },
      { title: "DecisionRecord Governance", wmbt: "DecisionRecord governed as an immutable practitioner decision artifact. Every accept, reject, or defer decision produces a DecisionRecord. DecisionRecord is chain-participating and lineage-published." },
      { title: "SurfacingRecord Persistence", wmbt: "SurfacingRecord persisted when an opportunity is surfaced to a practitioner. Re-surface and close-out workflows supported. Every surfacing event is immutable and auditable." },
      { title: "Suppression Evaluation Engine", wmbt: "Suppression evaluation engine operational. Every opportunity evaluated against active SuppressionRules before surfacing. Suppression decisions are logged and auditable." },
      { title: "surface() API Behavior", wmbt: "surface() API governs how advisory opportunities are surfaced to practitioners. Re-surface workflows supported for previously suppressed or closed opportunities. Close-out workflows produce immutable close records." },
      { title: "Advisory Detection Read Contract", wmbt: "Advisory Detection Read Contract published. Roger consumes advisory opportunity data through governed read contract only. No direct Roger-to-detection-engine integration." },
      { title: "Immutable Advisory Lineage", wmbt: "All advisory workflow events — detection, surfacing, decision, suppression, close-out — published as immutable lineage events. Additive-only contract behavior enforced." },
    ],
  },
  MT: {
    gate: "None (parallel track)",
    systems: ["PDC", "TDC", "Platform Engineering"],
    lead: "Migration Track Lead",
    entryCondition: "Migration scope agreed; source system access confirmed",
    exitCondition: "TWB TB extraction complete; prior year decisions migrated; migration validation passed",
    stories: [
      { title: "TWB TB Extraction", wmbt: "Trial balance data extracted from TWB with full provenance. Extraction validated against source." },
      { title: "Prior Year Decision Migration", wmbt: "Prior year decisions migrated as immutable records. Migration validated against source system." },
      { title: "Migration Validation", wmbt: "Migration validation passed — record counts, hash checks, and spot audits complete." },
      { title: "Partnersight Extraction", wmbt: "Partnersight data extracted and reconciled to PDC canonical entity model." },
    ],
  },
};

// ── Status badge (inline hex colors for reliability) ──────────────────────────
const STATUS_HEX: Record<BatchStatus, { bg: string; text: string; border: string; dot: string; label: string }> = {
  Complete: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#059669", label: "Complete" },
  Dev:      { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", dot: "#2563eb", label: "In Dev" },
  Review:   { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe", dot: "#7c3aed", label: "In Review" },
  Planned:  { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8", label: "Planned" },
  Active:   { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa", dot: "#ea580c", label: "Active" },
};

const PI_HEX: Record<string, { color: string; bg: string; border: string }> = {
  PI1:      { color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
  PI2:      { color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0" },
  PI3:      { color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe" },
  PI4:      { color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  Parallel: { color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
};

const AREA_HEX: Record<string, { bg: string; text: string }> = {
  PDC:       { bg: "#eff6ff", text: "#1e40af" },
  TDC:       { bg: "#f0fdf4", text: "#166534" },
  Platform:  { bg: "#f8fafc", text: "#475569" },
  "PDC+TDC": { bg: "#eef2ff", text: "#3730a3" },
};

// ── All batch IDs in order (for prev/next) ────────────────────────────────────
const ALL_IDS = ["FC", "B1", "B2", "B2A", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "B24", "B25", "MT"];

function batchNavLabel(id: string): string {
  const b = getBatchById(id);
  return b ? `${id} — ${b.name}` : id;
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BatchDetailPage() {
  const [, params] = useRoute("/batch/:id");
  const rawId = params?.id ?? "";
  const batchId = normalizeToBatchId(rawId);
  const batch: BatchEntry | undefined = getBatchById(batchId);

  if (!batch) {
    return (
      <div style={{ padding: "40px 28px", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>⬡</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>Batch Not Found</h2>
        <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
          No batch found for ID:{" "}
          <code style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
            {rawId}
          </code>
        </p>
        <Link href="/batch-roadmap">
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>← Back to Batch Roadmap</span>
        </Link>
      </div>
    );
  }

  // Override batch.status with live context status (single source of truth)
  const { statuses, lastUpdated, piCompletion, readiness } = useBatchStatus();
  const ctxKey = batchModelIdToContextKey(batchId);
  const liveStatus: BatchStatus = ctxKey ? contextStatusToBatchModel(statuses[ctxKey]) : batch.status;
  const liveBatch: BatchEntry = { ...batch, status: liveStatus };

  const content = BATCH_CONTENT[batchId];
  const statusHex = STATUS_HEX[liveBatch.status];
  const piHex = PI_HEX[liveBatch.pi] ?? PI_HEX.Parallel;
  const areaHex = AREA_HEX[liveBatch.area] ?? AREA_HEX.Platform;
  const piGroup = PI_GROUPS.find(g => g.batchIds.includes(batchId));

  const completionPct = liveBatch.status === "Complete" ? 100 : liveBatch.status === "Review" ? 75 : liveBatch.status === "Dev" ? 50 : 0;

  const currentIdx = ALL_IDS.indexOf(batchId);
  const prevId = currentIdx > 0 ? ALL_IDS[currentIdx - 1] : null;
  const nextId = currentIdx < ALL_IDS.length - 1 ? ALL_IDS[currentIdx + 1] : null;

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "24px 28px", maxWidth: "960px", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", fontSize: "12px", color: "#64748b" }}>
        <Link href="/batch-roadmap">
          <span style={{ color: "#2563eb", cursor: "pointer", fontWeight: 600 }}>Batch Roadmap</span>
        </Link>
        <span>›</span>
        {piGroup && (
          <>
            <span style={{ color: piHex.color, fontWeight: 600 }}>{piGroup.label} — {piGroup.subtitle}</span>
            <span>›</span>
          </>
        )}
        <span style={{ color: "#0f172a", fontWeight: 600 }}>{batchId} — {liveBatch.name}</span>
      </div>

      {/* Header card */}
      <div style={{
        backgroundColor: "white", borderRadius: "12px",
        border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        padding: "20px 24px", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* PI badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              color: piHex.color, backgroundColor: piHex.bg, border: `1px solid ${piHex.border}`,
              borderRadius: "12px", padding: "2px 10px", marginBottom: "10px",
            }}>
              {liveBatch.piLabel}
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px", lineHeight: "1.3" }}>
              {batchId} — {liveBatch.fullName}
            </h1>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", margin: "0 0 12px" }}>
              {liveBatch.description}
            </p>
            {/* Meta chips */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                backgroundColor: statusHex.bg, color: statusHex.text, border: `1px solid ${statusHex.border}`,
                display: "inline-flex", alignItems: "center", gap: "4px",
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: statusHex.dot, display: "inline-block" }} />
                {statusHex.label}
              </span>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                backgroundColor: areaHex.bg, color: areaHex.text, border: "1px solid transparent",
              }}>
                {liveBatch.area}
              </span>
              {liveBatch.storyCount > 0 && (
                <span style={{
                  fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0",
                }}>
                  {liveBatch.storyCount} {liveBatch.storyCount === 1 ? "Story" : "Stories"}
                </span>
              )}
              {liveBatch.piCommitment && (
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: liveBatch.piCommitment === "Committed" ? "#f0fdf4" : liveBatch.piCommitment === "Stretch" ? "#fffbeb" : "#f8fafc",
                  color: liveBatch.piCommitment === "Committed" ? "#166534" : liveBatch.piCommitment === "Stretch" ? "#92400e" : "#475569",
                  border: "1px solid transparent",
                }}>
                  {liveBatch.piCommitment}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Completion</span>
            <span style={{ fontSize: "10px", fontWeight: 700, color: statusHex.text }}>{completionPct}%</span>
          </div>
          <div style={{ height: "6px", backgroundColor: "#f1f5f9", borderRadius: "3px" }}>
            <div style={{
              height: "6px", borderRadius: "3px",
              backgroundColor: statusHex.dot,
              width: `${completionPct}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Key Outcomes (always shown from batchModel) */}
      <div style={{
        backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0",
        padding: "18px 22px", marginBottom: "14px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "12px" }}>
          Key Outcomes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {liveBatch.keyOutcomes.map((o, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{
                flexShrink: 0, width: "18px", height: "18px", borderRadius: "50%",
                backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "9px", fontWeight: 800, color: "#059669", marginTop: "1px",
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{o}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dependencies */}
      {liveBatch.dependencies.length > 0 && (
        <div style={{
          backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0",
          padding: "14px 20px", marginBottom: "14px",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", flexShrink: 0 }}>
            Depends On
          </span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {liveBatch.dependencies.map(dep => (
              <Link key={dep} href={`/batch/${dep.replace("B", "").replace("FC", "foundation-core").replace("MT", "mt")}`}>
                <span style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "8px",
                  backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                  cursor: "pointer",
                }}>
                  {dep}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {content ? (
        <>
          {/* Entry / Exit conditions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", padding: "16px 18px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "8px" }}>
                Entry Condition
              </div>
              <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.6", margin: 0 }}>{content.entryCondition}</p>
            </div>
            <div style={{ backgroundColor: "#f0fdf4", borderRadius: "10px", border: "1px solid #bbf7d0", padding: "16px 18px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#059669", marginBottom: "8px" }}>
                Exit Condition
              </div>
              <p style={{ fontSize: "12px", color: "#166534", lineHeight: "1.6", margin: 0 }}>{content.exitCondition}</p>
            </div>
          </div>

          {/* Key metadata row */}
          <div style={{
            backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0",
            padding: "14px 20px", marginBottom: "14px",
            display: "flex", gap: "28px", flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "3px" }}>Gate</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{content.gate}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "3px" }}>Systems</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{content.systems.join(" · ")}</div>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: "3px" }}>Lead</div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a" }}>{content.lead}</div>
            </div>
          </div>

          {/* Governance Badges & Executive Note */}
          {(content.executiveNote || content.governanceTags || content.governanceBoundary || content.openClarifications || content.deliverableProjectionFields || content.excludedFields) && (
            <div style={{
              backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a",
              padding: "16px 20px", marginBottom: "14px",
            }}>
              {content.governanceTags && content.governanceTags.length > 0 && (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: content.executiveNote ? "10px" : "0" }}>
                  {content.governanceTags.map(tag => {
                    const tagColors: Record<string, { bg: string; text: string; border: string }> = {
                      "Lineage Critical": { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
                      "PDC":             { bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe" },
                      "TDC":             { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
                      "Read Contract":   { bg: "#f5f3ff", text: "#5b21b6", border: "#ddd6fe" },
                      "Operational Metadata Only": { bg: "#fff7ed", text: "#c2410c", border: "#fed7aa" },
                      "Governed Filing Authority": { bg: "#ecfdf5", text: "#065f46", border: "#6ee7b7" },
                    };
                    const c = tagColors[tag] || { bg: "#f1f5f9", text: "#475569", border: "#e2e8f0" };
                    return (
                      <span key={tag} style={{
                        fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "6px",
                        backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              )}
              {content.executiveNote && (
                <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.6", fontStyle: "italic", marginBottom: (content.governanceBoundary || content.openClarifications || content.deliverableProjectionFields) ? "10px" : "0" }}>
                  {content.executiveNote}
                </div>
              )}
              {content.governanceBoundary && (
                <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: (content.openClarifications || content.deliverableProjectionFields) ? "10px" : "0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#991b1b", marginBottom: "4px" }}>Governance Boundary</div>
                  <div style={{ fontSize: "12px", color: "#7f1d1d", lineHeight: "1.5" }}>{content.governanceBoundary}</div>
                </div>
              )}
              {content.openClarifications && (
                <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px", marginBottom: content.deliverableProjectionFields ? "10px" : "0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92400e", marginBottom: "4px" }}>Open Clarification</div>
                  <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.5" }}>{content.openClarifications}</div>
                </div>
              )}
              {content.deliverableProjectionFields && content.deliverableProjectionFields.length > 0 && (
                <div style={{ marginBottom: content.excludedFields ? "10px" : "0" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e40af", marginBottom: "6px" }}>Deliverable Projection Fields</div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {content.deliverableProjectionFields.map(f => (
                      <span key={f} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "5px", backgroundColor: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {content.excludedFields && content.excludedFields.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#991b1b", marginBottom: "6px" }}>Explicitly Excluded Fields</div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {content.excludedFields.map(f => (
                      <span key={f} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "5px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stories */}
          <div style={{
            backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0",
            padding: "18px 22px", marginBottom: "14px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", marginBottom: "12px" }}>
              Stories &amp; What Must Be True
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {content.stories.map((s, i) => (
                <div key={i} style={{
                  padding: "12px 14px", borderRadius: "8px",
                  backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
                }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{s.wmbt}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{
          backgroundColor: "white", borderRadius: "10px", border: "1px solid #e2e8f0",
          padding: "32px 24px", textAlign: "center", marginBottom: "14px",
        }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>⬡</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>Detailed Content Coming Soon</div>
          <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.6", maxWidth: "400px", margin: "0 auto" }}>
            Stories, entry/exit conditions, and system details for this batch will be added as it enters active planning.
          </p>
        </div>
      )}

      {/* Prev / Next navigation */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingTop: "14px", borderTop: "1px solid #e2e8f0", marginTop: "4px",
      }}>
        {prevId ? (
          <Link href={`/batch/${prevId.replace("B", "").replace("FC", "foundation-core").replace("MT", "mt")}`}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
              ← {batchNavLabel(prevId)}
            </span>
          </Link>
        ) : <span />}
        <Link href="/batch-roadmap">
          <span style={{ fontSize: "11px", color: "#94a3b8", cursor: "pointer" }}>Batch Roadmap</span>
        </Link>
        {nextId ? (
          <Link href={`/batch/${nextId.replace("B", "").replace("FC", "foundation-core").replace("MT", "mt")}`}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>
              {batchNavLabel(nextId)} →
            </span>
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
