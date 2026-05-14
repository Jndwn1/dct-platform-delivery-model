// ─────────────────────────────────────────────────────────────────────────────
// Global Batch Control Panel — v2.1 Source of Truth
// Sections:
//   1. Batch Status (existing — propagates to all screens)
//   2. Delivered Work by Batch
//   3. Swagger / API Coverage
//   4. Roger UI Data Availability
//   5. PO Status Summary (copy-ready)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "wouter";
import {
  useBatchStatus, STATUS_STYLES, BATCH_LABELS, CASCADE_STEPS,
  type BatchKey, type BatchStatus,
} from "@/contexts/BatchStatusContext";
import { CheckCircle2, Clock, Circle, Lock, Shield, Link2, FileText, RotateCcw, Zap, Copy, Check, ChevronDown, ChevronUp, ClipboardCopy, Bug, Activity, Send, Download, FileSpreadsheet, FileJson, AlignLeft, Filter } from "lucide-react";

// ── CopyNoteButton ────────────────────────────────────────────────────────────
function CopyNoteButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      title="Copy note"
      className="ml-1.5 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <ClipboardCopy className="w-3 h-3" />}
    </button>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = "Delivered" | "Complete" | "In Progress" | "Carried Forward" | "Backlogged" | "Not Started" | "Needs PO/Dev Confirmation";
type ApiStatus = "Delivered" | "In Progress" | "Missing" | "Needs PO/Dev Confirmation";
type RogerAvailability = "Available" | "Partially Available" | "Not Available" | "Carried Forward" | "Backlogged";

interface DeliveredBatch {
  key: string;
  label: string;
  owner: string;
  status: DeliveryStatus;
  delivered: string[];
  validated: string[];
  open: string[];
  readiness: string;
  poNote: string;
}

interface SwaggerEntry {
  batch: string;
  endpoint: string;
  path: string;
  status: ApiStatus;
  consumerGuide: "Aligned" | "Missing" | "Partial";
  missingFromGuide: boolean;
  missingFromSwagger: boolean;
  notes: string;
}

interface AdoStory {
  title: string;
  id: string;
}

interface RogerDataPoint {
  dataPoint: string;
  source: string;
  batch: string;
  availability: RogerAvailability;
  apiEndpoint: string;
  adoStories: AdoStory[];   // ADO Tech Story traceability
  notes: string;
  owner: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const DELIVERED_BATCHES: DeliveredBatch[] = [
  {
    key: "foundation-core",
    label: "Foundation Core",
    owner: "PDC + TDC",
    status: "Delivered",
    delivered: ["Code repository", "Code templates", "Copilot Agent & Blitzy configuration", "DEV environment in Azure"],
    validated: ["Dev environment operational", "Agent tooling configured"],
    open: [],
    readiness: "Infrastructure only — not demo-ready",
    poNote: "Foundation Core is complete. Dev infrastructure, code templates, and agent tooling are operational. No Roger-facing output from this batch.",
  },
  {
    key: "1",
    label: "Batch 1 — File Ingestion & Initial Storage",
    owner: "PDC",
    status: "Delivered",
    delivered: ["JobId-based ingestion model", "IngestionJob + SourceFile records", "DocumentId (immutable)", "Lineage anchor at ingestion", "PDC-owned state machine", "IngestionStatus API"],
    validated: ["File upload → Service Bus → PDC flow", "JobId, DocumentId, EntityId captured", "State = INGESTED confirmed", "Lineage immediately visible"],
    open: ["TaxYear governance note: TaxYear is NOT stored in PDC — derived in TDC from PeriodStart/PeriodEnd"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 1 delivered. PDC ingestion framework is operational. Files are received, assigned immutable identifiers, and lineage is anchored at entry. IngestionStatus API is live. Roger can confirm file arrival and processing state.",
  },
  {
    key: "2",
    label: "Batch 2 — Normalization & Cross-LOB Taxonomy",
    owner: "PDC + AI Orchestrator",
    status: "Complete",
    delivered: ["FileSchemas reference data", "FirmTaxonomy (XLOB) reference data", "EDGAR Corpus reference data", "Normalized record persistence (vNormalizedTb)", "Normalized Trial Balance Contract (Roger Read Surface)", "Batch 2A contract enforcement complete"],
    validated: ["FileSchemas queryable and versioned", "RunId assigned on processing", "vNormalizedTb Roger read contract published"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 2 is complete. Normalization reference data and XLOB taxonomy are operational. Normalized record persistence is functional. Roger read contract (vNormalizedTb) is live. Batch 2A contract enforcement is complete.",
  },
  {
    key: "2a",
    label: "Batch 2A — Orchestrator Contract Enforcement & Classification",
    owner: "PDC + AI Orchestrator",
    status: "Complete",
    delivered: ["FirmTaxonomyId enforcement rule implemented", "Rejection logic for missing classification", "Classification status read contract", "Validation audit log queryable"],
    validated: ["FirmTaxonomyId required on all PDC records", "Classification rejection confirmed in demo"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 2A is complete. Contract enforcement layer between Orchestrator and PDC is operational. FirmTaxonomyId is required on every record. Classification rejection and audit log are live.",
  },
  {
    key: "3",
    label: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    owner: "TDC",
    status: "Delivered",
    delivered: ["TaxFormTemplates and FormLines", "TaxTaxonomyAccounts and MappingRules", "ConfidenceBandThresholds (GREEN/YELLOW/RED)", "TDC Reference Data Read Contract (Orchestrator-facing)"],
    validated: ["TaxFormTemplates queryable by Jurisdiction", "MappingRules versioned and available", "ConfidenceBandThresholds configured"],
    open: ["Domain Governance Note 3b: Tax calculation reference data must be governed tables, not hard-coded"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 3 is delivered. TDC is established as the tax domain authority. TaxFormTemplates, FormLines, TaxTaxonomyAccounts, MappingRules, and ConfidenceBandThresholds (GREEN/YELLOW/RED) are loaded, versioned, and governed. TDC Reference Data Read Contract (Orchestrator-facing) is live. Orchestrator has everything needed to generate proposals (Batch 4).",
  },
  {
    key: "4",
    label: "Batch 4 — AI Tax Mapping & Explainability",
    owner: "TDC + AI Orchestrator",
    status: "Complete",
    delivered: ["AI Mapping Proposals structure", "Confidence band framework (GREEN/YELLOW/RED)", "Mapping Decisions (immutable)", "TDC Records API Contract (Roger Read Surface) — published", "Decision Audit & Event Publishing", "Roger primary read contract live"],
    validated: ["Proposals include confidence score and band", "Decision audit structure confirmed", "Roger practitioner view unblocked"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 4 is complete. AI mapping proposals are live in TDC. Confidence bands and structured evidence are in place. Practitioner decision recording is functional. Roger's primary TDC read contract is published — the platform is live for practitioners.",
  },
  {
    key: "5",
    label: "Batch 5 — Entity Identity & Structure",
    owner: "PDC",
    status: "Complete",
    delivered: ["Client Groups & Legal Entity Registry", "Ownership Chains & Jurisdictions", "Entity Characteristics (DataSourceType, RBAC context)", "Entity Identity Read Contract (PDC-facing)", "CEM Integration & Sync"],
    validated: ["EntityId risk from PI 1 closed", "Entity Identity Read Contract published"],
    open: ["User Entitlement Sync — future scope"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 5 is complete. PDC is the authoritative entity registry. Client Groups, Legal Entity Registry, Ownership Chains, Jurisdictions, and Entity Characteristics are operational. Entity Identity Read Contract is published. EntityId open item from PI 1 is closed.",
  },
  {
    key: "6",
    label: "Batch 6 — Practitioner Review, Adjustments & Lock",
    owner: "TDC",
    status: "Complete",
    delivered: ["Review task generation from data state", "Six-state adjustment lifecycle (DRAFT → SUBMITTED → APPROVED → APPLIED → LOCKED)", "Sign-Off, Lock & Entity Finalization", "Tax-Ready Record Derivation", "SHA-256 cryptographic hash sign-off (non-repudiable)", "Approval Routing Rules engine"],
    validated: ["Review tasks generated automatically", "Adjustment lifecycle confirmed in demo", "Sign-off hash verified"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 6 is complete. Practitioners can do real work: review tasks generated automatically from data state, governed six-state adjustment lifecycle, tax-ready record derivation, and non-repudiable sign-off with SHA-256 hash.",
  },
  {
    key: "7",
    label: "Batch 7 — Client Tax Profile & Eligibility",
    owner: "TDC",
    status: "Complete",
    delivered: ["Three-Tier Eligibility Model (Must Have / Must Not Have / Flag & Review)", "Client Tax Profile Lifecycle & Determination Records", "Controlled Group & Affiliated Group Determination", "Eligibility gate enforcement", "Flag & Review confirm/override workflow"],
    validated: ["Eligibility gate blocks INELIGIBLE entities", "Controlled group determination confirmed", "Flag & Review workflow operational"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 7 is complete. TDC is the system of record for tax profile and eligibility determinations. Three-Tier Eligibility Model is live. Entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state are blocked from downstream workflow.",
  },
  {
    key: "8",
    label: "Batch 8 — Exceptions & Remediation",
    owner: "TDC + PDC",
    status: "In Progress",
    delivered: ["Exception identification surface (TDC Records v2 Known Mapping)", "Proposal decision supersede workflow (in progress)", "Sign-off unlock for remediation (in progress)"],
    validated: [],
    open: ["ExceptionRecord API — in progress", "RemedyAction API — in progress", "Re-ingestion trigger API — in progress", "Remediation audit trail — in progress"],
    readiness: "In progress — PI 2 Committed (sequential after Batch 7)",
    poNote: "Batch 8 is the active delivery batch (PI 2 Committed, sequential after Batch 7 closes). TDC and PDC collaborate on exception identification, remediation workflow, and re-ingestion triggers. ExceptionRecord, RemedyAction, and re-ingestion audit trail are the primary deliverables. Target close: 5/20.",
  },
];

const SWAGGER_ENTRIES: SwaggerEntry[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // PDC (dev-pdc.api.rsmus.com) — RSM.TaxSolutions.PDC.Api
  // ══════════════════════════════════════════════════════════════════════════

  // ── Batch 1 — File Ingestion & Initial Storage ────────────────────────────
  { batch: "Batch 1", endpoint: "Ingestion — Submit File", path: "POST /api/v1/Ingestion", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits a new ingestion run. Returns IngestionRunId used for lineage anchor." },
  { batch: "Batch 1", endpoint: "Ingestion — Get Run Status", path: "GET /api/v1/Ingestion/{runId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves ingestion run status by RunId. EntityId, DocumentId, Timestamps returned." },
  { batch: "Batch 1", endpoint: "Processing Run — Create", path: "POST /api/v1/processing-runs", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Creates a new processing run for a given ingestion record." },
  { batch: "Batch 1", endpoint: "Processing Run — Get by ID", path: "GET /api/v1/processing-runs/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the status of a processing run by its unique identifier." },
  { batch: "Batch 1", endpoint: "Processing Run — Get Latest by Ingestion", path: "GET /api/v1/processing-runs/by-ingestion/{ingestionRunId}/latest", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the latest processing run for a given ingestion run. Consumer Guide missing PeriodStart/End." },
  { batch: "Batch 1", endpoint: "Processing Run — Submit Results", path: "POST /api/v1/processing-runs/{id}/results", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits the results of a completed processing run." },
  { batch: "Batch 1", endpoint: "Document Type — Get All", path: "GET /api/v1/document-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all document types. Reference data for ingestion classification." },
  { batch: "Batch 1", endpoint: "Document Type — Get by ID", path: "GET /api/v1/document-types/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a document type by its unique identifier." },
  { batch: "Batch 1", endpoint: "File Schema — Get All", path: "GET /api/v1/file-schemas", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active file schema versions. Versioned and queryable." },
  { batch: "Batch 1", endpoint: "File Schema — Get Latest Active", path: "GET /api/v1/file-schemas/latest-active", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the latest active file schema version per document type." },
  { batch: "Batch 1", endpoint: "File Schema — Get by Type", path: "GET /api/v1/file-schemas/by-type/{documentTypeCode}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active file schema versions for a given document type code." },

  // ── Batch 2 — Normalization & Cross-LOB Taxonomy ──────────────────────────
  { batch: "Batch 2", endpoint: "Data Records — Get Normalized", path: "GET /api/v1/data-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves normalized data records with optional filtering by entity, period, and classification status." },
  { batch: "Batch 2", endpoint: "Taxonomy Concept — Get All", path: "GET /api/v1/taxonomy/concepts", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active XLOB taxonomy concepts. Versioned." },
  { batch: "Batch 2", endpoint: "Taxonomy Concept — Get by ID", path: "GET /api/v1/taxonomy/concepts/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a taxonomy concept by its unique identifier." },
  { batch: "Batch 2", endpoint: "Characteristic Definition — Get All", path: "GET /api/v1/reference-data/characteristic-definitions", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active characteristic definitions. Reference data for entity profiling." },
  { batch: "Batch 2", endpoint: "Entity Type Ref — Get All", path: "GET /api/v1/reference-data/entity-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active entity types. Reference data." },
  { batch: "Batch 2", endpoint: "Jurisdiction Type Ref — Get All", path: "GET /api/v1/reference-data/jurisdiction-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active jurisdiction types. Reference data." },

  // ── Batch 2A — Orchestrator Contract Enforcement & Classification ──────────
  { batch: "Batch 2A", endpoint: "Data Records — Submit Classification", path: "PATCH /api/v1/data-records/{id}/classify", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits a classification decision for a normalized record. FirmTaxonomyId enforcement." },

  // ── Batch 3 — Tax Domain Authority & Tax Taxonomy ─────────────────────────
  { batch: "Batch 3", endpoint: "TDC Reference Data Read Contract", path: "GET /api/v1/reference-data", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Orchestrator-facing read-only contract. TaxFormTemplates, MappingRules, ConfidenceBandThresholds." },
  { batch: "Batch 3", endpoint: "Tax Forms — Get All", path: "GET /api/TaxForms", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all tax forms with optional filtering by jurisdiction and tax year." },
  { batch: "Batch 3", endpoint: "Tax Form Lines — Get by Form", path: "GET /api/tax-forms/{formId}/lines", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all tax form lines for a given parent tax form, sorted by sort order." },
  { batch: "Batch 3", endpoint: "Tax Taxonomy Accounts — Get All", path: "GET /api/TaxTaxonomyAccounts", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves tax taxonomy accounts with optional scoping by effective date." },
  { batch: "Batch 3", endpoint: "Mapping Rules — Get All", path: "GET /api/MappingRules", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all mapping rules. Versioned and queryable by tax year." },
  { batch: "Batch 3", endpoint: "Return Templates — Get All", path: "GET /api/ReturnTemplates", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all return templates. Reference data for tax form assembly." },
  { batch: "Batch 3", endpoint: "Tax Year Locks — Get Status", path: "GET /api/TaxYearLocks/{taxYear}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves the lock status of a specific tax year. Returns default unlocked if no lock record exists." },
  { batch: "Batch 3", endpoint: "Filing Due Dates — Get All", path: "GET /api/FilingDueDates", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all filing due dates. Queryable by jurisdiction and tax year." },

  // ── Batch 4 — AI Tax Mapping & Explainability ──────────────────────────────
  { batch: "Batch 4", endpoint: "AI Mapping Proposals — Get", path: "GET /api/v1/ai-mapping-proposals", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves AI mapping proposals by tax year and by client and/or entity. Confidence score + band (GREEN/YELLOW/RED) + structured evidence." },
  { batch: "Batch 4", endpoint: "AI Mapping Proposals — Bulk Submit", path: "POST /api/v1/ai-mapping-proposals/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Submits a batch of AI mapping proposals from the Orchestrator. Per-record validation." },
  { batch: "Batch 4", endpoint: "Proposal Decisions — Bulk Confirm", path: "POST /api/v1/proposal-decisions/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Bulk confirms mapping proposal decisions. Immutable once confirmed." },
  { batch: "Batch 4", endpoint: "Proposal Decisions — Get Confirmed", path: "GET /api/v1/proposal-decisions/confirmed", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves confirmed mapping decisions. Immutable decision records." },
  { batch: "Batch 4", endpoint: "TDC Records v1 — Get", path: "GET /api/v1/tdc-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger primary read contract v1. Published. Roger practitioner view unblocked." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Get", path: "GET /api/v2/tdc-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger primary read contract v2 with enhanced filtering and pagination." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Adjustments", path: "GET /api/v2/tdc-records/adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves adjustment records scoped to TDC records. Roger read surface." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Derived Records", path: "GET /api/v2/tdc-records/derived-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves derived TDC records. Roger read surface." },
  { batch: "Batch 4", endpoint: "TDC Derivation — Get", path: "GET /api/v1/tdc-derivation", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves TDC derivation records. Consumer Guide missing derivation field schema." },
  { batch: "Batch 4", endpoint: "Confidence Band Thresholds — Get", path: "GET /api/ConfidenceBandThresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. GREEN/YELLOW/RED threshold configuration. Queryable by TaxYear and Jurisdiction." },

  // ── Batch 5 — Entity Identity & Structure ─────────────────────────────────
  { batch: "Batch 5", endpoint: "Clients — Get All", path: "GET /api/v1/clients", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active clients. Client Groups and Legal Entity Registry." },
  { batch: "Batch 5", endpoint: "Clients — Get by ID", path: "GET /api/v1/clients/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a client by its unique identifier." },
  { batch: "Batch 5", endpoint: "Clients — Get by MDM Client", path: "GET /api/v1/clients/by-mdm-client/{mdmClientId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all clients for a given MDM client identifier." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get All", path: "GET /api/v1/legal-entities", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all legal entities for a client. Ownership chains and jurisdictions included." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get by ID", path: "GET /api/v1/legal-entities/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a legal entity by its unique identifier." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get by MDM Legal Entity", path: "GET /api/v1/legal-entities/by-mdm-legal-entity/{mdmLegalEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a legal entity by its MDM legal entity identifier." },
  { batch: "Batch 5", endpoint: "Entity Characteristics — Get All", path: "GET /api/v1/entity-characteristics", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves entity characteristics. Includes DataSourceType and RBAC context." },
  { batch: "Batch 5", endpoint: "Entity Characteristics — Get by MDM Legal Entity", path: "GET /api/v1/entity-characteristics/by-mdm-legal-entity/{mdmLegalEntityId}", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves entity characteristics by MDM legal entity. Consumer Guide missing RBAC context field." },
  { batch: "Batch 5", endpoint: "Ownership Relationships — Get by Parent", path: "GET /api/v1/ownership-relationships/by-parent/{parentEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all ownership relationships where the given entity is the parent." },
  { batch: "Batch 5", endpoint: "Ownership Relationships — Get by Subsidiary", path: "GET /api/v1/ownership-relationships/by-subsidiary/{subsidiaryEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all ownership relationships where the given entity is a subsidiary." },
  { batch: "Batch 5", endpoint: "Jurisdiction Assignments — Get", path: "GET /api/v1/jurisdiction-assignments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves jurisdiction assignments for an entity." },
  { batch: "Batch 5", endpoint: "Entity Profile Attributes — Get", path: "GET /api/v1/entity-profile-attributes", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity profile attributes. Used for tax profile determination." },

  // ── Batch 6 — Practitioner Review, Adjustments & Lock ─────────────────────
  { batch: "Batch 6", endpoint: "Review Tasks — Get", path: "GET /api/v1/review-tasks", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves review tasks. Six-state lifecycle (DRAFT→SUBMITTED→APPROVED→APPLIED→LOCKED)." },
  { batch: "Batch 6", endpoint: "Review Tasks — Generate", path: "POST /api/v1/review-tasks/generate", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Generates review tasks from current data state." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Review Tasks", path: "GET /api/v2/tdc-records/review-tasks", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves review tasks scoped to TDC records. Roger read surface." },
  { batch: "Batch 6", endpoint: "Adjustments — Create", path: "POST /api/Adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a single governed adjustment in DRAFT status. Linked to a tax-ready record." },
  { batch: "Batch 6", endpoint: "Adjustments — Get by Entity Scope", path: "GET /api/Adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all adjustments scoped by entity identifier and tax year." },
  { batch: "Batch 6", endpoint: "Adjustments — Bulk Create", path: "POST /api/Adjustments/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a batch of governed adjustments atomically in DRAFT status." },
  { batch: "Batch 6", endpoint: "Adjustments — Submit for Approval", path: "PUT /api/Adjustments/{id}/submit", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Submits a DRAFT adjustment for approval. Resolves applicable approval routing rule." },
  { batch: "Batch 6", endpoint: "Adjustments — Approve", path: "PUT /api/Adjustments/{id}/approve", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Approves a SUBMITTED adjustment. Captures approval routing rule version at approval time." },
  { batch: "Batch 6", endpoint: "Adjustments — Reject", path: "PUT /api/Adjustments/{id}/reject", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Rejects a SUBMITTED adjustment with a required rejection reason. Immutably preserved." },
  { batch: "Batch 6", endpoint: "Sign-Off — Get", path: "GET /api/v1/sign-off", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves sign-off records. Non-repudiable SHA-256 hash sign-off." },
  { batch: "Batch 6", endpoint: "Sign-Off — Create", path: "POST /api/v1/sign-off", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a sign-off record. Consumer Guide missing hash verification schema." },
  { batch: "Batch 6", endpoint: "Approval Routing Rules — Get by Client", path: "GET /api/v1/approval-routing-rules/by-client", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all active client-level and entity-level approval routing rules." },
  { batch: "Batch 6", endpoint: "Approver Roles — Get All", path: "GET /api/v1/approver-roles", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all active approver role definitions." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Finalization State", path: "GET /api/v2/tdc-records/finalization-state", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves finalization state for TDC records. Lock events and sign-off status." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Lock Events", path: "GET /api/v2/tdc-records/lock-events", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves lock events for TDC records. Audit trail for lock/unlock operations." },
  { batch: "Batch 6", endpoint: "Entity Finalization — Get", path: "GET /api/v1/entity-finalization", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity finalization state. Used for sign-off gate enforcement." },
  { batch: "Batch 6", endpoint: "Entity Review Status — Get", path: "GET /api/v1/entity-review-status", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity review status. Aggregated review task completion state." },

  // ── Batch 7 — Client Tax Profile & Eligibility ────────────────────────────
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Get", path: "GET /api/v1/tax-profile-determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves tax profile determinations. TaxProfile per EntityId with filing status, tax year, jurisdiction." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Get by ID", path: "GET /api/v1/tax-profile-determinations/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves a specific tax profile determination by ID." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Gate Status", path: "GET /api/v1/tax-profile-determinations/gate-status", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves gate status for tax profile determinations. Blocks INELIGIBLE entities from downstream workflow." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Redetermine", path: "POST /api/v1/tax-profile-determinations/redetermine", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Triggers re-determination of tax profile for an entity." },
  { batch: "Batch 7", endpoint: "Controlled Group Determinations — Get", path: "GET /api/v1/controlled-group-determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active controlled-group determinations including the given entity." },
  { batch: "Batch 7", endpoint: "Controlled Group Determinations — Run", path: "POST /api/v1/controlled-group-determinations", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Runs the requested ownership tests against the entity set. Consumer Guide missing consolidated filing flag." },
  { batch: "Batch 7", endpoint: "Eligibility Tier Conditions — Get", path: "GET /api/v1/eligibility-tier-conditions", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active tier conditions filtered by entity type / rule / tier. Three-Tier Eligibility Model." },
  { batch: "Batch 7", endpoint: "Flag and Review — Get", path: "GET /api/v1/flag-and-review", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves FLAG_AND_REVIEW records. Entities requiring manual review before eligibility gate." },
  { batch: "Batch 7", endpoint: "Flag and Review — Confirm", path: "POST /api/v1/flag-and-review/{id}/confirm", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Confirms a FLAG_AND_REVIEW record. Allows entity to proceed through eligibility gate." },
  { batch: "Batch 7", endpoint: "Flag and Review — Override", path: "POST /api/v1/flag-and-review/{id}/override", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Overrides a FLAG_AND_REVIEW record with documented justification." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Controlled Groups", path: "GET /api/v3/tdc-records/controlled-groups", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for controlled group determinations." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Determinations", path: "GET /api/v3/tdc-records/determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for tax profile determinations." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Eligibility Gate", path: "GET /api/v3/tdc-records/eligibility-gate", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for eligibility gate status." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Flag and Review", path: "GET /api/v3/tdc-records/flag-and-review", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for FLAG_AND_REVIEW records." },
  { batch: "Batch 7", endpoint: "Corporate Profile Criteria — Get", path: "GET /api/v1/corporate-profile-criteria", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active corporate profile criteria for a tax year." },
  { batch: "Batch 7", endpoint: "Corporate Profile Thresholds — Get", path: "GET /api/v1/corporate-profile-thresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active corporate profile thresholds for a tax year." },
  { batch: "Batch 7", endpoint: "Determination Confidence Thresholds — Get", path: "GET /api/v1/determination-confidence-thresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active confidence thresholds for a tax year." },

  // ── Batch 8 — Exceptions & Remediation (In Progress) ──────────────────────
  { batch: "Batch 8", endpoint: "TDC Records v2 — Known Mapping", path: "GET /api/v2/tdc-records/known-mapping", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Retrieves known mapping records. Part of exception identification surface. In progress." },
  { batch: "Batch 8", endpoint: "Proposal Decisions — Supersede", path: "POST /api/v1/proposal-decisions/supersede", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Supersedes an existing proposal decision. Used in remediation workflow. In progress." },
  { batch: "Batch 8", endpoint: "Sign-Off — Unlock", path: "POST /api/v1/sign-off/{id}/unlock", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Unlocks a previously locked sign-off. Used in exception remediation. In progress." },
  { batch: "Batch 8", endpoint: "EDGAR Corpus — Get Versions", path: "GET /api/v1/edgar-corpus/versions", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "PDC. Retrieves EDGAR corpus versions. Reference data for exception classification. In progress." },
];

const ROGER_DATA_POINTS: RogerDataPoint[] = [
  {
    dataPoint: "File ingestion status (JobId, DocumentId, State)",
    source: "PDC", batch: "Batch 1", availability: "Available",
    apiEndpoint: "GET /api/pdc/ingestion/status/{jobId}",
    adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }],
    notes: "Operational. Roger can confirm file arrival and processing state.", owner: "PDC",
  },
  {
    dataPoint: "Lineage anchor (DocumentId → EntityId → PeriodStart/End)",
    source: "PDC", batch: "Batch 1", availability: "Available",
    apiEndpoint: "GET /api/pdc/ingestion/status/{jobId}",
    adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }],
    notes: "Lineage immediately visible at ingestion.", owner: "PDC",
  },
  {
    dataPoint: "Normalized Trial Balance (vNormalizedTb)",
    source: "PDC", batch: "Batch 2", availability: "Partially Available",
    apiEndpoint: "GET /api/pdc/normalized-tb",
    adoStories: [
      { title: "Normalized TB Contract (Roger Read Surface)", id: "1349150" },
      { title: "File Schemas & Firm Financial Taxonomy Reference Data", id: "1349142" },
    ],
    notes: "Pending Batch 2A contract enforcement. Not yet Roger-consumable.", owner: "PDC",
  },
  {
    dataPoint: "FirmTaxonomyId on normalized records",
    source: "PDC / Orchestrator", batch: "Batch 2A", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Enforce Classification Presence (FirmTaxonomyId)", id: "1370843" }],
    notes: "Blocking gap. Orchestrator not returning FirmTaxonomyId. Classification Walkthrough documents this gap.", owner: "PDC + Orchestrator",
  },
  {
    dataPoint: "Tax form templates and mapping rules",
    source: "TDC", batch: "Batch 3", availability: "Available",
    apiEndpoint: "GET /api/tdc/reference-data",
    adoStories: [{ title: "TDC Reference Data Read Contract (Orchestrator Facing)", id: "1349152" }],
    notes: "Orchestrator-facing only. Not Roger-facing.", owner: "TDC",
  },
  {
    dataPoint: "AI mapping proposals (confidence + evidence)",
    source: "TDC", batch: "Batch 4", availability: "Partially Available",
    apiEndpoint: "GET /api/tdc/mapping-proposals",
    adoStories: [{ title: "AI Mapping Proposals", id: "1349156" }],
    notes: "Proposals available. Roger read contract (TDC Records API) not yet published.", owner: "TDC",
  },
  {
    dataPoint: "Mapping decisions (accept / override / reject)",
    source: "TDC", batch: "Batch 4", availability: "Partially Available",
    apiEndpoint: "GET /api/tdc/mapping-decisions",
    adoStories: [{ title: "Mapping Decisions", id: "1349157" }],
    notes: "Immutable decisions in place. Out of Sync — tax_year field gap in Swagger.", owner: "TDC",
  },
  {
    dataPoint: "Roger primary TDC read contract (GREEN/YELLOW/RED, pending vs decided)",
    source: "TDC", batch: "Batch 4", availability: "Not Available",
    apiEndpoint: "GET /api/tdc/records",
    adoStories: [{ title: "TDC Records API Contract (Roger Read Surface)", id: "1349158" }],
    notes: "Not yet published. This is the moment the platform comes to life for practitioners. Blocking.", owner: "TDC",
  },
  {
    dataPoint: "Entity identity (ClientGroupId, EntityId, hierarchy)",
    source: "PDC", batch: "Batch 5", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Entity Identity Read Contract (PDC-facing)", id: "1355868" }],
    notes: "In progress (PI 2). EntityId risk from PI 1 being closed. Entity Identity Read Contract (PDC-facing) is the Roger-facing deliverable.", owner: "PDC",
  },
  {
    dataPoint: "Review task state and adjustment lifecycle",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [
      { title: "Review Task Management & Entity Status", id: "1350253" },
      { title: "Book-to-Tax Adjustments & Approval Routing", id: "1350254" },
    ],
    notes: "In progress (PI 2, sequential after Batch 4). Review tasks auto-generated from data state. Six-state adjustment lifecycle in development.", owner: "TDC",
  },
  {
    dataPoint: "Tax-ready records (locked, derived)",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Tax-Ready Record Derivation", id: "1350255" }],
    notes: "In progress (PI 2). Tax-ready derivation from mapping decisions + approved adjustments. SHA-256 sign-off in development.", owner: "TDC",
  },
  {
    dataPoint: "Eligibility status and rule reasoning",
    source: "TDC", batch: "Batch 7", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Client Tax Profile Lifecycle & Determination Records", id: "1355882" }],
    notes: "In progress (PI 2, sequential after Batch 6). Three-Tier Eligibility Model (Must Have / Must Not Have / Flag & Review). Ineligible entities blocked from downstream workflow.", owner: "TDC",
  },
  {
    dataPoint: "Exception status (ingestion, mapping, workflow)",
    source: "PDC + TDC", batch: "Batch 8", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [
      { title: "PDC Exception Record Structure & Failure Tracking", id: "1355898" },
      { title: "TDC Exception Record Structure & Failure Tracking", id: "1355902" },
    ],
    notes: "In progress (PI 2). PDC parallel to Batch 7, TDC sequential after Batch 7. Exception state machine: OPEN → IN_PROGRESS → RESOLVED / CLOSED / SUPPRESSED.", owner: "PDC + TDC",
  },
  {
    dataPoint: "Rollforward proposals & prior year intelligence",
    source: "PDC + TDC", batch: "Batch 9", availability: "Not Available",
    apiEndpoint: "GET /api/tdc/rollforward",
    adoStories: [
      { title: "IMS Inbound Retrieval Contract", id: "1350260" },
    ],
    notes: "Batch 9 not started. PDC free after Batch 5 closes, TDC sequential after Batch 6 closes. v_rollforward contract extends TDC Records API for Roger. Prior year proposals with EXACT / APPROXIMATE / NO_MATCH confidence scoring.", owner: "PDC + TDC",
  },
];

//// ── Batch label → context key mapping ────────────────────────────────────────────────────────────────
// Maps "Batch 1" → "1", "Batch 2A" → "2a", "Batch FC" / "Foundation Core" → "foundation-core"
function batchLabelToKey(batch: string): string {
  const b = batch.trim();
  if (b === "Foundation Core" || b === "Batch FC" || b === "FC") return "foundation-core";
  const m = b.match(/Batch\s+([0-9]+[A-Za-z]?)/i);
  if (m) return m[1].toLowerCase();
  return b.toLowerCase();
}

// Derive live Swagger status from batch context status
function deriveSwaggerStatus(batchKey: string, statuses: Record<string, string>): ApiStatus {
  const s = statuses[batchKey];
  if (s === "Complete" || s === "Delivered") return "Delivered";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") return "In Progress";
  if (s === "Blocked") return "Needs PO/Dev Confirmation";
  return "Missing";
}

// Derive live Roger availability from batch context status
function deriveRogerAvailability(batchKey: string, statuses: Record<string, string>): RogerAvailability {
  const s = statuses[batchKey];
  if (s === "Complete" || s === "Delivered") return "Available";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") return "Partially Available";
  if (s === "Blocked") return "Carried Forward";
  return "Not Available";
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DELIVERY_STYLE: Record<DeliveryStatus, { bg: string; text: string; border: string }> = {
  "Complete":                   { bg: "bg-emerald-50",  text: "text-emerald-800", border: "border-emerald-200" },
  "Delivered":                  { bg: "bg-emerald-50",  text: "text-emerald-800", border: "border-emerald-200" },
  "In Progress":                { bg: "bg-blue-50",     text: "text-blue-800",    border: "border-blue-200" },
  "Carried Forward":            { bg: "bg-amber-50",    text: "text-amber-800",   border: "border-amber-200" },
  "Backlogged":                 { bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200" },
  "Not Started":                { bg: "bg-slate-50",    text: "text-slate-500",   border: "border-slate-200" },
  "Needs PO/Dev Confirmation":  { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200" },
};

const API_STYLE: Record<ApiStatus, { bg: string; text: string }> = {
  "Delivered":                 { bg: "bg-emerald-100", text: "text-emerald-800" },
  "In Progress":               { bg: "bg-blue-100",    text: "text-blue-800" },
  "Missing":                   { bg: "bg-red-100",     text: "text-red-700" },
  "Needs PO/Dev Confirmation": { bg: "bg-amber-100",   text: "text-amber-800" },
};

const ROGER_STYLE: Record<RogerAvailability, { bg: string; text: string }> = {
  "Available":           { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Partially Available": { bg: "bg-blue-100",    text: "text-blue-800" },
  "Not Available":       { bg: "bg-red-100",     text: "text-red-700" },
  "Carried Forward":     { bg: "bg-amber-100",   text: "text-amber-800" },
  "Backlogged":          { bg: "bg-slate-100",   text: "text-slate-600" },
};

const GATE_ICONS = { g1: Lock, g2: Shield, g3: FileText, g4: Link2 };
const GATE_LABELS = {
  g1: "G1 — Schema Lock",
  g2: "G2 — Invariant Lock",
  g3: "G3 — Contract Publication",
  g4: "G4 — Lineage Closure",
};

const BATCH_KEYS: BatchKey[] = ["foundation-core","1","2","3","4","5","6","7","8","9","10","11"];

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
}

function SectionHeader({ title, subtitle, cascadeStep, cascadeActive, cascadeDone }: {
  title: string;
  subtitle?: string;
  cascadeStep?: number;
  cascadeActive?: boolean;
  cascadeDone?: boolean;
}) {
  return (
    <div className="px-5 py-3 border-b border-slate-100 bg-[#003865] flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        {subtitle && <div className="text-xs text-blue-200 mt-0.5">{subtitle}</div>}
      </div>
      {cascadeStep !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          cascadeDone
            ? "bg-emerald-500 text-white"
            : cascadeActive
              ? "bg-blue-400 text-white"
              : "bg-blue-800 text-blue-300"
        }`}>
          {cascadeDone
            ? <CheckCircle2 className="w-3 h-3" />
            : cascadeActive
              ? <div className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin" />
              : <Circle className="w-3 h-3" />
          }
          Step {cascadeStep}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-2 py-1 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GateStatusBadge({ status }: { status: "Complete" | "In Progress" | "Locked" }) {
  const cfg = {
    Complete:      { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
    "In Progress": { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500" },
    Locked:        { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BatchControlPanel() {
  const { statuses, setStatus, resetAll, gates, lastUpdated, syncLog, clearSyncLog, unlockedBatches, piCompletion, cascade } = useBatchStatus();
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [poSummaryCopied, setPoSummaryCopied] = useState(false);
  const [poSummaryGeneratedAt, setPoSummaryGeneratedAt] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [expandedAdoRows, setExpandedAdoRows] = useState<Set<number>>(new Set());
  const [adoCopied, setAdoCopied] = useState(false);
  const [panelCopied, setPanelCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [syncFlash, setSyncFlash] = useState(false);
  const prevLastUpdated = useRef<string | null>(null);

  // Flash the sync indicator whenever a status update propagates
  useEffect(() => {
    if (lastUpdated && lastUpdated !== prevLastUpdated.current) {
      prevLastUpdated.current = lastUpdated;
      setSyncFlash(true);
      const t = setTimeout(() => setSyncFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [lastUpdated]);

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" })
    : null;
  const copyFullPanel = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    // Build styled HTML table rows
    let prevBatch = '';
    const rows = liveRogerPoints.map((d, i) => {
      const isNewBatch = d.batch !== prevBatch;
      prevBatch = d.batch;
      const batchGroupIndex = liveRogerPoints.filter((x, xi) => xi <= i && (xi === 0 || liveRogerPoints[xi-1].batch !== x.batch)).length - 1;
      const rowBg = batchGroupIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
      const borderTop = isNewBatch && i > 0 ? '2px solid #cbd5e1' : '1px solid #f1f5f9';
      const availStyle = d.availability === 'Available'
        ? 'background:#dcfce7;color:#166534;'
        : d.availability === 'Partially Available'
        ? 'background:#dbeafe;color:#1e3a8a;'
        : 'background:#fee2e2;color:#991b1b;';
      const noteIcon = (d.notes.toLowerCase().includes('block') || d.notes.toLowerCase().includes('gap') || d.notes.toLowerCase().includes('pending')) ? '⚠️' : 'ℹ️';
      const adoHtml = d.adoStories.map(s => s.id
        ? `<div style="margin-bottom:4px;text-align:right"><div style="font-size:9px;color:#374151;line-height:1.3">${s.title}</div><span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700">#${s.id} ↗</span></div>`
        : `<div style="font-size:9px;color:#9ca3af;font-style:italic">${s.title}</div>`
      ).join('');
      return `<tr style="background:${rowBg};border-top:${borderTop}">
        <td style="padding:10px 10px;font-size:11px;font-weight:600;color:#1e293b;word-break:break-word;vertical-align:top">${d.dataPoint}</td>
        <td style="padding:10px 10px;font-size:10px;color:#64748b;vertical-align:top;word-break:break-word">${d.source}</td>
        <td style="padding:10px 10px;font-size:10px;font-weight:700;color:#003865;white-space:nowrap;vertical-align:top">${d.batch}</td>
        <td style="padding:10px 10px;vertical-align:top;text-align:center">
          <span style="display:inline-block;${availStyle}border-radius:9999px;padding:3px 10px;font-size:9px;font-weight:700;white-space:nowrap;min-width:80px;text-align:center">${d.availability}</span>
        </td>
        <td style="padding:10px 10px;vertical-align:top">
          <span style="font-family:monospace;font-size:8.5px;background:#f1f5f9;color:#475569;border-radius:3px;padding:2px 5px;display:block;word-break:break-all;line-height:1.5">${d.apiEndpoint}</span>
        </td>
        <td style="padding:10px 10px;vertical-align:top;text-align:right">${adoHtml}</td>
        <td style="padding:10px 10px;vertical-align:top;font-size:10px;color:#475569">${noteIcon} ${d.notes}</td>
        <td style="padding:10px 10px;vertical-align:top;font-size:10px;color:#64748b;word-break:break-word">${d.owner}</td>
      </tr>`;
    }).join('');
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Roger UI Data Availability — BA Weekly ${today}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px;background:#f8fafc;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.10);}
  .header{background:#003865;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
  .header-title{color:#fff;font-size:14px;font-weight:700;margin:0;}
  .header-sub{color:#93c5fd;font-size:11px;margin-top:2px;}
  .header-meta{color:#bfdbfe;font-size:10px;text-align:right;}
  table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;}
  thead tr{background:#002a52;}
  th{padding:10px 10px;font-weight:700;font-size:10px;letter-spacing:.04em;color:#fff;text-align:left;}
  th:nth-child(4){text-align:center;}
  th:nth-child(6){text-align:right;}
  tr:hover{background:#eff6ff !important;}
  .legend{display:flex;gap:16px;padding:10px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:10px;color:#64748b;}
  .legend span{display:inline-flex;align-items:center;gap:4px;}
  .footer{padding:8px 16px;font-size:9px;color:#94a3b8;border-top:1px solid #f1f5f9;text-align:right;}
  @media print{body{padding:0;background:#fff;}.card{box-shadow:none;}}
</style></head><body>
<div class="card">
  <div class="header">
    <div><div class="header-title">Roger UI Data Availability</div><div class="header-sub">Which data points are ready for Roger to consume now vs carried forward to PI 2</div></div>
    <div class="header-meta">BA Weekly Update<br>${today}</div>
  </div>
  <table>
    <thead><tr>
      <th style="width:20%">Data Point</th>
      <th style="width:10%">Source</th>
      <th style="width:7%">Batch</th>
      <th style="width:11%;text-align:center">Availability</th>
      <th style="width:15%">API Endpoint</th>
      <th style="width:17%;text-align:right">ADO Story (ID)</th>
      <th style="width:13%">Notes / Gap</th>
      <th style="width:7%">Owner</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="legend">
    <span><span style="display:inline-block;background:#dcfce7;color:#166534;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Available</span></span>
    <span><span style="display:inline-block;background:#dbeafe;color:#1e3a8a;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Partially Available</span></span>
    <span><span style="display:inline-block;background:#fee2e2;color:#991b1b;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Not Available</span></span>
    <span>⚠️ Gap / Blocker &nbsp; ℹ️ Informational</span>
  </div>
  <div class="footer">DCT Platform Gate Verification Dashboard — Control Panel — Planning View</div>
</div>
</body></html>`;
    const popup = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      setPanelCopied(true);
      setTimeout(() => setPanelCopied(false), 3000);
    }
  };
  const toggleNote = (i: number) => setExpandedNotes(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const toggleAdo = (i: number) => setExpandedAdoRows(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const copyAdoIds = () => {
    const ids = liveRogerPoints.flatMap(d => d.adoStories.map(s => s.id)).filter(Boolean).join(', ');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ids).then(() => {
        setAdoCopied(true);
        setTimeout(() => setAdoCopied(false), 2500);
      }).catch(() => {
        // fallback
        const el = document.createElement('textarea');
        el.value = ids;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setAdoCopied(true);
        setTimeout(() => setAdoCopied(false), 2500);
      });
    } else {
      // execCommand fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = ids;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setAdoCopied(true);
      setTimeout(() => setAdoCopied(false), 2500);
    }
  };

  const complete   = BATCH_KEYS.filter(k => statuses[k] === "Complete" || statuses[k] === "Delivered").length;
  const dev        = BATCH_KEYS.filter(k => statuses[k] === "In Progress" || statuses[k] === "Blocked" || statuses[k] === "MVP" || statuses[k] === "Stretch").length;
  const inReview   = BATCH_KEYS.filter(k => statuses[k] === "Ready for QA" || statuses[k] === "QA In Progress" || statuses[k] === "Demo Ready").length;
  const planned    = BATCH_KEYS.filter(k => statuses[k] === "Not Started").length;

  const advanceAll = () => {
    BATCH_KEYS.forEach(k => {
      const current = statuses[k];
      if (current === "Not Started") setStatus(k, "In Progress");
      else if (current === "In Progress") setStatus(k, "Ready for QA");
      else if (current === "Ready for QA") setStatus(k, "QA In Progress");
      else if (current === "QA In Progress") setStatus(k, "Demo Ready");
      else if (current === "Demo Ready") setStatus(k, "Delivered");
      else if (current === "Delivered") setStatus(k, "Complete");
    });
  };

  // ── Dynamic PO Status Summary (rebuilds whenever statuses change) ────────────
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Classify each batch by live context status
  // Build a full label map from DELIVERED_BATCHES for PO Summary (covers all tracked batches)
  const BATCH_LABEL_MAP: Record<string, string> = Object.fromEntries(
    DELIVERED_BATCHES.map(b => [b.key, b.label])
  );

  const liveDeliveredBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return (s === "Delivered" || s === "Complete") && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveInProgressBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveBlockedBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return s === "Blocked" && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveNotStartedBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return s === "Not Started" && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  // ── Live Swagger entries — status derived from batch context ────────────────────────────────────────────────────────────────
  const liveSwaggerEntries: SwaggerEntry[] = SWAGGER_ENTRIES.map(e => ({
    ...e,
    status: deriveSwaggerStatus(batchLabelToKey(e.batch), statuses as unknown as Record<string, string>),
  }));

  // ── Live Roger data points — availability derived from batch context ────────────────────────────────────────────────────────────────
  const liveRogerPoints: RogerDataPoint[] = ROGER_DATA_POINTS.map(d => ({
    ...d,
    availability: deriveRogerAvailability(batchLabelToKey(d.batch), statuses as unknown as Record<string, string>),
  }));

  const apisDelivered = liveSwaggerEntries.filter(e => e.status === "Delivered").length;
  const apisMissing = liveSwaggerEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const rogerAvailable = liveRogerPoints.filter(d => d.availability === "Available").length;
  const rogerBlocked = liveRogerPoints.filter(d => d.availability === "Not Available").length;

  // ── TDC / PDC split counters ────────────────────────────────────────────────
  const tdcEntries = liveSwaggerEntries.filter(e => e.notes?.startsWith("TDC."));
  const pdcEntries = liveSwaggerEntries.filter(e => e.notes?.startsWith("PDC."));
  const tdcDelivered = tdcEntries.filter(e => e.status === "Delivered").length;
  const pdcDelivered = pdcEntries.filter(e => e.status === "Delivered").length;
  const tdcInProgress = tdcEntries.filter(e => e.status === "In Progress").length;
  const pdcInProgress = pdcEntries.filter(e => e.status === "In Progress").length;
  const tdcMissing = tdcEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const pdcMissing = pdcEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const tdcTotal = tdcEntries.length;
  const pdcTotal = pdcEntries.length;

  const tdcRogerPoints = liveRogerPoints.filter(d => d.source?.includes("TDC"));
  const pdcRogerPoints = liveRogerPoints.filter(d => d.source?.includes("PDC") && !d.source?.includes("TDC"));
  const tdcRogerAvailable = tdcRogerPoints.filter(d => d.availability === "Available").length;
  const pdcRogerAvailable = pdcRogerPoints.filter(d => d.availability === "Available").length;

  // Carry-forward: open items from batches that are NOT yet complete
  const liveCarryForward = DELIVERED_BATCHES
    .filter(b => {
      const s = statuses[b.key as BatchKey];
      return s !== "Delivered" && s !== "Complete";
    })
    .flatMap(b => b.open.map(o => `${b.label.split(" — ")[0]}: ${o}`))
    .filter(o => o.length > 0);

  // Blockers: only show for Blocked batches
  const liveBlockers = DELIVERED_BATCHES
    .filter(b => statuses[b.key as BatchKey] === "Blocked")
    .flatMap(b => b.open.map(o => `${b.label.split(" — ")[0]}: ${o}`));

  const poSummaryText = [
    `DCT Platform — Delivery Status Update (${today})`,
    "",
    liveDeliveredBatches.length > 0
      ? `DELIVERED (${liveDeliveredBatches.length}):\n${liveDeliveredBatches.map(b => `• ${b}`).join("\n")}`
      : "DELIVERED:\n• No batches marked Delivered yet",
    "",
    liveInProgressBatches.length > 0
      ? `IN PROGRESS (${liveInProgressBatches.length}):\n${liveInProgressBatches.map(b => `• ${b}`).join("\n")}`
      : "IN PROGRESS:\n• No batches currently in progress",
    liveBlockedBatches.length > 0
      ? `\nBLOCKED (${liveBlockedBatches.length}):\n${liveBlockedBatches.map(b => `• ${b}`).join("\n")}`
      : "",
    liveNotStartedBatches.length > 0
      ? `\nNOT STARTED (${liveNotStartedBatches.length}):\n${liveNotStartedBatches.map(b => `• ${b}`).join("\n")}`
      : "",
    "",
    `API COVERAGE (${apisDelivered} of ${liveSwaggerEntries.length} endpoints delivered):\n  TDC: ${tdcDelivered} delivered${tdcInProgress > 0 ? `, ${tdcInProgress} in progress` : ""} of ${tdcTotal} total${tdcMissing > 0 ? ` · ${tdcMissing} missing from Consumer Guide` : ""}\n  PDC: ${pdcDelivered} delivered${pdcInProgress > 0 ? `, ${pdcInProgress} in progress` : ""} of ${pdcTotal} total${pdcMissing > 0 ? ` · ${pdcMissing} missing from Consumer Guide` : ""}${apisMissing > 0 ? `\n• ${apisMissing} endpoint(s) missing from Swagger or Consumer Guide` : "\n• All delivered endpoints aligned with Consumer Guide"}`,
    "",
    `ROGER UI DATA AVAILABILITY (${rogerAvailable} of ${liveRogerPoints.length} data points available):\n  TDC: ${tdcRogerAvailable} of ${tdcRogerPoints.length} data points available\n  PDC: ${pdcRogerAvailable} of ${pdcRogerPoints.length} data points available\n• ${rogerBlocked} data point(s) not yet available to Roger`,
    "",
    liveCarryForward.length > 0
      ? `CARRY-FORWARD ITEMS:\n${liveCarryForward.map(o => `• ${o}`).join("\n")}`
      : "CARRY-FORWARD ITEMS:\n• None — all open items resolved",
    "",
    liveBlockers.length > 0
      ? `RISKS / BLOCKERS:\n${liveBlockers.map(o => `• ${o}`).join("\n")}`
      : "RISKS / BLOCKERS:\n• No active blockers",
    "",
    `OPEN DECISIONS:\n• FirmTaxonomyId enforcement: REQUIRED on all PDC records (ADR-06 proposed)\n• Which system generates JobId — Tax Portal or PDC?\n• Engagement code ownership between EODS and CEM`,
    "",
    `RECOMMENDED NEXT ACTION:\n• Confirm Batch 2A FirmTaxonomyId enforcement decision with engineering (ADR-06 pending approval)\n• Publish TDC Records API contract to unblock Roger Batch 4 view\n• Update Consumer Guide with missing endpoint documentation (Processing Run API, Normalized TB, Mapping Decisions)\n• Confirm Batch 5 EntityId contract scope with PDC team before PI 2 sprint planning`,
  ].filter(s => s !== "").join("\n");

  const formatTimestamp = () => new Date().toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const copyPoSummary = () => {
    const ts = formatTimestamp();
    setPoSummaryGeneratedAt(ts);
    navigator.clipboard.writeText(poSummaryText).then(() => {
      setPoSummaryCopied(true);
      setTimeout(() => setPoSummaryCopied(false), 3000);
    });
  };

  const sendToTeams = () => {
    const ts = formatTimestamp();
    setPoSummaryGeneratedAt(ts);
    // Teams deep link: opens a new chat with pre-filled message
    const message = encodeURIComponent(poSummaryText);
    window.open(`https://teams.microsoft.com/l/chat/0/0?message=${message}`, "_blank");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#003865]">Global Control Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            DCT Batch Roadmap v2.1 · Source of truth for all batch-related pages · RSM | CATT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ba-touchpoint"
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            BA Touchpoint Summary
          </Link>
          <button
            onClick={() => setShowDebug(d => !d)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              showDebug ? "bg-amber-50 border-amber-300 text-amber-700" : "text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle debug / sync log"
          >
            <Bug className="w-3.5 h-3.5" />
            Debug
          </button>
          <button
            onClick={advanceAll}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#003865] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Advance All
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── Sync Status Bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-500"
        style={{
          backgroundColor: syncFlash ? "#f0fdf4" : "#f8fafc",
          borderColor: syncFlash ? "#86efac" : "#e2e8f0",
          color: syncFlash ? "#166534" : "#64748b",
        }}
      >
        <Activity className={`w-3.5 h-3.5 shrink-0 ${syncFlash ? "text-emerald-500" : "text-slate-400"}`} />
        <span className="flex-1">
          {syncFlash
            ? "✓ Status update propagated to all platform views — Roadmap, Calendar, Detail Pages, Executive Summary, Home"
            : "Control Panel is the single source of truth. All platform views sync automatically on status change."}
        </span>
        {lastUpdatedLabel && (
          <span className="shrink-0 text-slate-400 font-normal">
            Last updated: {lastUpdatedLabel}
          </span>
        )}
      </div>

      {/* ── Dependency Unlock Notification ── */}
      {unlockedBatches.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800">
          <span className="text-base">🔓</span>
          <span>
            Dependency unlocked: {unlockedBatches.map(k => k === "foundation-core" ? "FC" : `B${k}`).join(", ")} — now available to start
          </span>
        </div>
      )}

      {/* ── Debug / Sync Log Panel ── */}
      {showDebug && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Bug className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Sync Log — Last {syncLog.length} Updates</span>
            </div>
            <button
              onClick={clearSyncLog}
              className="text-xs text-amber-600 hover:text-amber-900 font-semibold"
            >
              Clear log
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-amber-100">
            {syncLog.length === 0 ? (
              <div className="px-4 py-3 text-xs text-amber-600 italic">No updates recorded yet. Change a batch status to see propagation.</div>
            ) : (
              [...syncLog].reverse().map((entry, i) => (
                <div key={i} className="px-4 py-2.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-amber-500 shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold text-amber-900">{entry.batch === "foundation-core" ? "FC" : `B${entry.batch}`}</span>
                    <span className="text-amber-600">{entry.from} → {entry.to}</span>
                    <span className="text-amber-500 text-xs">{entry.derivedUpdates.length} views updated</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.derivedUpdates.map((d, j) => (
                      <span key={j} className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{d}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-amber-200 bg-amber-100">
            <div className="text-xs font-bold text-amber-800 mb-1">PI Completion (live)</div>
            <div className="flex gap-4">
              {(["pi1","pi2","pi3","pi4"] as const).map(pi => (
                <div key={pi} className="text-center">
                  <div className="text-sm font-bold text-amber-900">{piCompletion[pi].pct}%</div>
                  <div className="text-[10px] text-amber-600 uppercase">{pi.toUpperCase()}</div>
                  <div className="text-[10px] text-amber-500">{piCompletion[pi].complete}/{piCompletion[pi].total}</div>
                </div>
              ))}
              <div className="text-center border-l border-amber-200 pl-4">
                <div className="text-sm font-bold text-amber-900">{piCompletion.overall.pct}%</div>
                <div className="text-[10px] text-amber-600 uppercase">Overall</div>
                <div className="text-[10px] text-amber-500">{piCompletion.overall.complete}/{piCompletion.overall.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cascade Progress Overlay ── */}
      {cascade.active && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-200 bg-blue-100">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
            <span className="text-sm font-bold text-blue-900">Updating Platform…</span>
            <span className="text-xs text-blue-600 ml-auto">
              {cascade.batch === "foundation-core" ? "FC" : `B${cascade.batch}`} status change propagating
            </span>
          </div>
          {cascade.isRollback && cascade.rollbackImpact.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-800">
              <span>⚠️</span>
              <span>Rollback detected — recalculating downstream readiness for: {cascade.rollbackImpact.map(k => k === "foundation-core" ? "FC" : `B${k}`).join(", ")}</span>
            </div>
          )}
          <div className="px-4 py-3 space-y-2">
            {([1, 2, 3, 4] as const).map(step => {
              const done = cascade.completedSteps.includes(step);
              const active = cascade.currentStep === step;
              return (
                <div key={step} className={`flex items-start gap-3 text-xs transition-all duration-300 ${
                  done ? "opacity-100" : active ? "opacity-100" : "opacity-40"
                }`}>
                  <div className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                    done ? "bg-emerald-500" : active ? "bg-blue-500" : "bg-slate-200"
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-3 h-3 text-white" />
                      : active
                        ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        : <span className="text-[9px] text-slate-400 font-bold">{step}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${
                      done ? "text-emerald-700" : active ? "text-blue-800" : "text-slate-400"
                    }`}>
                      Step {step} — {CASCADE_STEPS[step].label}
                    </div>
                    {active && (
                      <div className="text-blue-600 mt-0.5">{CASCADE_STEPS[step].description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cascade Success Confirmation ── */}
      {!cascade.active && cascade.completedSteps.length === 4 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="flex-1">
            ✓ Platform sync complete — Delivered Work, Swagger/API Coverage, Roger UI, and PO Summary all updated
          </span>
          {cascade.isRollback && (
            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">ROLLBACK</span>
          )}
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { count: complete,  label: "Complete",   bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
          { count: dev,       label: "In Dev",      bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700" },
          { count: inReview,  label: "In Review",   bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700" },
          { count: planned,   label: "Planned",     bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${s.text}`}>{s.count}</div>
            <div className={`text-xs font-semibold mt-0.5 ${s.text}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Section 1: Batch Status ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Batch Status" subtitle="Update status here — changes propagate instantly to all screens" />
        <div className="divide-y divide-slate-100">
          {BATCH_KEYS.map((key) => {
            const status = statuses[key];
            const style = STATUS_STYLES[status];
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: style.dot }}
                >
                  {key === "foundation-core" ? "FC" : `B${key}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{BATCH_LABELS[key]}</div>
                </div>
                <select
                  value={status}
                  onChange={e => setStatus(key, e.target.value as BatchStatus)}
                  disabled={cascade.active}
                  className="text-xs font-semibold rounded-full border px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Ready for QA">Ready for QA</option>
                  <option value="QA In Progress">QA In Progress</option>
                  <option value="Demo Ready">Demo Ready</option>
                  <option value="MVP">MVP</option>
                  <option value="Stretch">Stretch</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gate Status ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Derived Gate Status" subtitle="Updates automatically from batch progress" />
        <div className="divide-y divide-slate-100">
          {(["g1","g2","g3","g4"] as const).map(gKey => {
            const Icon = GATE_ICONS[gKey];
            return (
              <div key={gKey} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 text-sm font-semibold text-slate-800">{GATE_LABELS[gKey]}</div>
                <GateStatusBadge status={gates[gKey]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Delivered Work by Batch ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader
          title="Delivered Work by Batch"
          subtitle="What was delivered, validated, and what remains open — use for PO status updates"
          cascadeStep={1}
          cascadeActive={cascade.active && cascade.currentStep === 1}
          cascadeDone={cascade.completedSteps.includes(1)}
        />
        {/* ── Export Panel ── */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mr-1">
            <Download className="w-3.5 h-3.5" />
            Export Batch Delivery Data
          </div>
          {/* Filter selector */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              id="batchExportFilter"
              className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#003865]"
              defaultValue="all"
              onChange={e => {
                (window as any)._batchExportFilter = e.target.value;
              }}
            >
              <option value="all">All Batches</option>
              <option value="complete">Complete Only</option>
              <option value="inprogress">In Progress Only</option>
              <option value="open">Has Open Items</option>
            </select>
          </div>
          {/* CSV Export */}
          <button
            onClick={() => {
              const filterVal = (window as any)._batchExportFilter ?? "all";
              const rows = DELIVERED_BATCHES.filter(b => {
                const s = statuses[b.key as BatchKey] ?? "Not Started";
                if (filterVal === "complete") return s === "Complete" || s === "Delivered";
                if (filterVal === "inprogress") return s === "In Progress";
                if (filterVal === "open") return b.open.length > 0;
                return true;
              });
              const header = ["Batch","Owner","Status","Readiness","Delivered Items","Validated Items","Open Items","PO Note"];
              const csvRows = rows.map(b => [
                `"${b.label}"`,
                `"${b.owner}"`,
                `"${statuses[b.key as BatchKey] ?? "Not Started"}"`,
                `"${b.readiness}"`,
                `"${b.delivered.join(" | ")}"`,
                `"${b.validated.join(" | ")}"`,
                `"${b.open.join(" | ")}"`,
                `"${b.poNote.replace(/"/g, "'")}"`
              ]);
              const csv = [header.join(","), ...csvRows.map(r => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `DCT_Batch_Delivery_${new Date().toISOString().slice(0,10)}.csv`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors font-medium"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Export CSV
          </button>
          {/* JSON Export */}
          <button
            onClick={() => {
              const filterVal = (window as any)._batchExportFilter ?? "all";
              const rows = DELIVERED_BATCHES.filter(b => {
                const s = statuses[b.key as BatchKey] ?? "Not Started";
                if (filterVal === "complete") return s === "Complete" || s === "Delivered";
                if (filterVal === "inprogress") return s === "In Progress";
                if (filterVal === "open") return b.open.length > 0;
                return true;
              }).map(b => ({
                batch: b.label, owner: b.owner,
                status: statuses[b.key as BatchKey] ?? "Not Started",
                readiness: b.readiness,
                delivered: b.delivered,
                validated: b.validated,
                open: b.open,
                poNote: b.poNote,
              }));
              const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `DCT_Batch_Delivery_${new Date().toISOString().slice(0,10)}.json`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors font-medium"
          >
            <FileJson className="w-3.5 h-3.5" />
            Export JSON
          </button>
          {/* Formatted Text Export */}
          <button
            onClick={() => {
              const filterVal = (window as any)._batchExportFilter ?? "all";
              const rows = DELIVERED_BATCHES.filter(b => {
                const s = statuses[b.key as BatchKey] ?? "Not Started";
                if (filterVal === "complete") return s === "Complete" || s === "Delivered";
                if (filterVal === "inprogress") return s === "In Progress";
                if (filterVal === "open") return b.open.length > 0;
                return true;
              });
              const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
              const lines = [
                `DCT PLATFORM — DELIVERED WORK BY BATCH (${today})`,
                `Generated from: DCT Gate Verification Dashboard`,
                `Filter: ${filterVal === "all" ? "All Batches" : filterVal === "complete" ? "Complete Only" : filterVal === "inprogress" ? "In Progress Only" : "Has Open Items"}`,
                `Total batches: ${rows.length}`,
                "",
                "═".repeat(60),
                "",
                ...rows.flatMap(b => [
                  `BATCH: ${b.label}`,
                  `Owner: ${b.owner}  |  Status: ${statuses[b.key as BatchKey] ?? "Not Started"}`,
                  `Readiness: ${b.readiness}`,
                  "",
                  "DELIVERED:",
                  ...b.delivered.map(d => `  ✓ ${d}`),
                  "",
                  "VALIDATED:",
                  ...(b.validated.length > 0 ? b.validated.map(v => `  ✓ ${v}`) : ["  (not yet validated)"]),
                  "",
                  "OPEN / CARRY-FORWARD:",
                  ...(b.open.length > 0 ? b.open.map(o => `  › ${o}`) : ["  (none)"]),
                  "",
                  `PO NOTE: ${b.poNote}`,
                  "",
                  "─".repeat(60),
                  "",
                ]),
              ].join("\n");
              const blob = new Blob([lines], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url;
              a.download = `DCT_Batch_Delivery_${new Date().toISOString().slice(0,10)}.txt`;
              a.click(); URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Export Text
          </button>
          {/* Copy All PO Notes */}
          <button
            onClick={() => {
              const filterVal = (window as any)._batchExportFilter ?? "all";
              const rows = DELIVERED_BATCHES.filter(b => {
                const s = statuses[b.key as BatchKey] ?? "Not Started";
                if (filterVal === "complete") return s === "Complete" || s === "Delivered";
                if (filterVal === "inprogress") return s === "In Progress";
                if (filterVal === "open") return b.open.length > 0;
                return true;
              });
              const text = rows.map(b => `${b.label.split(" — ")[0]}: ${b.poNote}`).join("\n\n");
              navigator.clipboard.writeText(text);
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-medium"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            Copy PO Notes
          </button>
          <span className="ml-auto text-xs text-slate-400">{DELIVERED_BATCHES.length} batches tracked</span>
        </div>
        <div className="divide-y divide-slate-100">
          {DELIVERED_BATCHES.map(b => {
            // Use live context status — overrides the hardcoded static value
            const liveStatus: BatchStatus = statuses[b.key as BatchKey] ?? "Not Started";
            // Map BatchStatus → DeliveryStatus for the style lookup
            const deliveryStatus: DeliveryStatus = (
              liveStatus === "Complete" || liveStatus === "Delivered" ? "Delivered" :
              liveStatus === "In Progress" || liveStatus === "Ready for QA" || liveStatus === "QA In Progress" || liveStatus === "Demo Ready" || liveStatus === "MVP" || liveStatus === "Stretch" ? "In Progress" :
              liveStatus === "Blocked" ? "Needs PO/Dev Confirmation" :
              "Not Started"
            );
            const style = DELIVERY_STYLE[deliveryStatus];
            const isExpanded = expandedBatch === b.key;
            return (
              <div key={b.key}>
                <button
                  onClick={() => setExpandedBatch(isExpanded ? null : b.key)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                    {liveStatus}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{b.label}</div>
                    <div className="text-xs text-slate-500">{b.owner} · {b.readiness}</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs font-bold text-[#003865] uppercase tracking-wide mb-1.5">Delivered</div>
                        {b.delivered.length > 0 ? b.delivered.map((d, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
                            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{d}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">Nothing delivered yet</div>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#003865] uppercase tracking-wide mb-1.5">Validated</div>
                        {b.validated.length > 0 ? b.validated.map((v, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
                            <span className="text-blue-500 shrink-0 mt-0.5">✓</span>{v}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">Not yet validated</div>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">Open / Carry-Forward</div>
                        {b.open.length > 0 ? b.open.map((o, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 mb-1">
                            <span className="shrink-0 mt-0.5">›</span>{o}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">No open items</div>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">PO Status Note</div>
                        <div className="text-xs text-slate-700">{b.poNote}</div>
                      </div>
                      <CopyButton text={b.poNote} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Swagger / API Coverage ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader
          title="Swagger / API Coverage"
          subtitle="All API endpoints mapped to batch — flag missing Consumer Guide or Swagger entries"
          cascadeStep={2}
          cascadeActive={cascade.active && cascade.currentStep === 2}
          cascadeDone={cascade.completedSteps.includes(2)}
        />
        <div className="overflow-x-auto">
          <table className="w-full" style={{fontSize: '11.5px', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0}}>
            <colgroup>
              <col style={{width: '8%'}} />
              <col style={{width: '18%'}} />
              <col style={{width: '22%'}} />
              <col style={{width: '13%'}} />
              <col style={{width: '11%'}} />
              <col style={{width: '8%'}} />
              <col style={{width: '8%'}} />
              <col style={{width: 'auto'}} />
            </colgroup>
            <thead>
              <tr style={{background: '#002a52', borderBottom: '2px solid #001d3d'}}>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Batch</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Endpoint</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Path</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Status</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Consumer Guide</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Missing Guide?</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Missing Swagger?</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Notes</th>
              </tr>
            </thead>
            <tbody>
              {liveSwaggerEntries.map((e, i) => {
                const apiStyle = API_STYLE[e.status];
                const prevBatch = i > 0 ? liveSwaggerEntries[i - 1].batch : null;
                const isNewBatch = e.batch !== prevBatch;
                const swaggerBatchGroupIndex = liveSwaggerEntries.filter((x, xi) => xi <= i && (xi === 0 || liveSwaggerEntries[xi-1].batch !== x.batch)).length - 1;
                const swaggerRowBg = swaggerBatchGroupIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
                const isNoteGap = e.notes.toLowerCase().includes("block") || e.notes.toLowerCase().includes("gap") || e.notes.toLowerCase().includes("not yet") || e.notes.toLowerCase().includes("pending") || e.notes.toLowerCase().includes("missing");
                return (
                  <tr
                    key={i}
                    style={{background: swaggerRowBg, borderTop: isNewBatch && i > 0 ? '2px solid #e2e8f0' : '1px solid #f1f5f9'}}
                    className="transition-colors"
                    onMouseEnter={ev => (ev.currentTarget.style.background = '#eff6ff')}
                    onMouseLeave={ev => (ev.currentTarget.style.background = swaggerRowBg)}
                  >
                    <td className="font-semibold text-xs" style={{padding:'12px 12px', color:'#003865', whiteSpace:'nowrap', verticalAlign:'top'}}>{e.batch}</td>
                    <td className="font-medium text-slate-800" style={{padding:'12px 12px', wordBreak:'break-word', verticalAlign:'top', fontSize:'11px'}}>{e.endpoint}</td>
                    <td style={{padding:'12px 12px', verticalAlign:'top'}}>
                      <span
                        className="font-mono text-slate-600 rounded px-1.5 py-0.5 block"
                        style={{fontSize:'9.5px', background:'#f1f5f9', wordBreak:'break-all', lineHeight:'1.5'}}
                      >
                        {e.path}
                      </span>
                    </td>
                    <td style={{padding:'12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      <span
                        className={`inline-flex items-center justify-center font-semibold rounded-full ${apiStyle.bg} ${apiStyle.text}`}
                        style={{fontSize:'10px', padding:'3px 10px', whiteSpace:'nowrap', minWidth:'80px'}}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td style={{padding:'12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      <span
                        className={`inline-flex items-center justify-center font-semibold rounded-full`}
                        style={{
                          fontSize:'10px', padding:'3px 10px', whiteSpace:'nowrap', minWidth:'64px',
                          background: e.consumerGuide === 'Aligned' ? '#d1fae5' : e.consumerGuide === 'Partial' ? '#fef3c7' : '#fee2e2',
                          color: e.consumerGuide === 'Aligned' ? '#065f46' : e.consumerGuide === 'Partial' ? '#92400e' : '#991b1b',
                        }}
                      >
                        {e.consumerGuide}
                      </span>
                    </td>
                    <td style={{padding:'12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      {e.missingFromGuide
                        ? <span className="inline-flex items-center justify-center font-bold rounded-full bg-red-100 text-red-700" style={{fontSize:'10px', padding:'3px 10px'}}>Yes</span>
                        : <span className="inline-flex items-center justify-center font-semibold rounded-full bg-emerald-100 text-emerald-700" style={{fontSize:'10px', padding:'3px 10px'}}>No</span>}
                    </td>
                    <td style={{padding:'12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      {e.missingFromSwagger
                        ? <span className="inline-flex items-center justify-center font-bold rounded-full bg-red-100 text-red-700" style={{fontSize:'10px', padding:'3px 10px'}}>Yes</span>
                        : <span className="inline-flex items-center justify-center font-semibold rounded-full bg-emerald-100 text-emerald-700" style={{fontSize:'10px', padding:'3px 10px'}}>No</span>}
                    </td>
                    <td style={{padding:'12px 12px', verticalAlign:'top'}}>
                      <div className="flex items-start gap-1">
                        <span style={{fontSize:'11px', lineHeight:'1.1', flexShrink:0}}>{isNoteGap ? '⚠️' : 'ℹ️'}</span>
                        <span className="flex-1 text-slate-600 leading-snug" style={{fontSize:'10.5px'}}>{e.notes}</span>
                        <CopyNoteButton text={e.notes} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Roger UI Data Availability ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-[#003865] flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Roger UI Data Availability</div>
            <div className="text-xs text-blue-200 mt-0.5">Which data points are ready for Roger to consume now vs carried forward to PI 2</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Cascade Step 3 indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
              cascade.completedSteps.includes(3)
                ? "bg-emerald-500 text-white"
                : cascade.active && cascade.currentStep === 3
                  ? "bg-blue-400 text-white"
                  : "bg-blue-800 text-blue-300"
            }`}>
              {cascade.completedSteps.includes(3)
                ? <CheckCircle2 className="w-3 h-3" />
                : cascade.active && cascade.currentStep === 3
                  ? <div className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin" />
                  : <Circle className="w-3 h-3" />
              }
              Step 3
            </div>
            {/* Copy Full Panel — for BA weekly */}
            <button
              onClick={copyFullPanel}
              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                panelCopied
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
              }`}
              title="Copy full panel as formatted text for BA weekly update"
            >
              {panelCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {panelCopied ? 'Opened!' : 'Export Panel'}
            </button>
            {/* Copy ADO IDs only */}
            <button
              onClick={copyAdoIds}
              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                adoCopied
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
              }`}
              title="Copy all ADO Story IDs as comma-separated list"
            >
              {adoCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {adoCopied ? 'Copied!' : 'Copy ADO IDs'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{fontSize: '11.5px', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0}}>
            <colgroup>
              {/* Data Point 20% */}
              <col style={{width: '20%'}} />
              {/* Source 10% */}
              <col style={{width: '10%'}} />
              {/* Batch 7% */}
              <col style={{width: '7%'}} />
              {/* Availability 11% */}
              <col style={{width: '11%'}} />
              {/* API Endpoint 15% */}
              <col style={{width: '15%'}} />
              {/* ADO Story 17% */}
              <col style={{width: '17%'}} />
              {/* Notes 13% */}
              <col style={{width: '13%'}} />
              {/* Owner 7% */}
              <col style={{width: '7%'}} />
            </colgroup>
            <thead>
              <tr style={{background: '#002a52', borderBottom: '2px solid #001d3d'}}>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Data Point</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Source</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Batch</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Availability</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">API Endpoint</th>
                <th className="text-right px-3 py-2.5 font-bold text-white text-xs tracking-wide">ADO Story (ID)</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Notes / Gap</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody>
              {liveRogerPoints.map((d, i) => {
                const rStyle = ROGER_STYLE[d.availability];
                const prevBatch = i > 0 ? liveRogerPoints[i - 1].batch : null;
                const isNewBatch = d.batch !== prevBatch;
                const isGap = d.notes.toLowerCase().includes("block") || d.notes.toLowerCase().includes("gap") || d.notes.toLowerCase().includes("not yet") || d.notes.toLowerCase().includes("pending");
                const noteIcon = isGap ? "⚠️" : "ℹ️";
                const noteExpanded = expandedNotes.has(i);
                const adoExpanded = expandedAdoRows.has(i);
                const visibleStories = adoExpanded ? d.adoStories : d.adoStories.slice(0, 2);
                const hasMoreStories = d.adoStories.length > 2;
                // Batch group tint — alternate subtle background per batch group
                const batchIndex = liveRogerPoints.findIndex(x => x.batch === d.batch);
                const batchGroupIndex = liveRogerPoints.filter((x, xi) => xi <= i && (xi === 0 || liveRogerPoints[xi-1].batch !== x.batch)).length - 1;
                const rowBg = batchGroupIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
                return (
                  <tr
                    key={i}
                    style={{background: rowBg, borderTop: isNewBatch && i > 0 ? '2px solid #e2e8f0' : '1px solid #f1f5f9'}}
                    className="transition-colors hover:bg-blue-50"
                    onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                  >
                    {/* Data Point */}
                    <td className="px-3 font-medium text-slate-800" style={{padding: '12px 12px', wordBreak:'break-word', verticalAlign:'top'}}>{d.dataPoint}</td>
                    {/* Source */}
                    <td className="px-3 text-slate-500 text-xs" style={{padding: '12px 12px', wordBreak:'break-word', verticalAlign:'top'}}>{d.source}</td>
                    {/* Batch */}
                    <td className="px-3 font-semibold text-xs" style={{padding: '12px 12px', color:'#003865', whiteSpace:'nowrap', verticalAlign:'top'}}>{d.batch}</td>
                    {/* Availability — centered badge */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      <span
                        className={`inline-flex items-center justify-center font-semibold rounded-full ${rStyle.bg} ${rStyle.text}`}
                        style={{fontSize:'10px', padding:'3px 10px', whiteSpace:'nowrap', minWidth:'90px'}}
                      >
                        {d.availability}
                      </span>
                    </td>
                    {/* API Endpoint — monospace with tint */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top'}}>
                      <span
                        className="font-mono text-slate-600 rounded px-1.5 py-0.5 block"
                        style={{fontSize:'9.5px', background:'#f1f5f9', wordBreak:'break-all', lineHeight:'1.5'}}
                      >
                        {d.apiEndpoint}
                      </span>
                    </td>
                    {/* ADO Story — right-aligned stacked cards with clickable links */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top', textAlign:'right'}}>
                      {visibleStories.map((s, si) => (
                        <div key={si} style={{marginBottom: si < visibleStories.length - 1 ? '8px' : 0}}>
                          {s.id ? (
                            <div className="inline-block text-right">
                              <div className="text-slate-700 leading-snug" style={{fontSize:'10px'}}>{s.title}</div>
                              <a
                                href={`https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${s.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 mt-0.5 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                                style={{fontSize:'9px', padding:'2px 7px', textDecoration:'none'}}
                                title={`View in Azure DevOps — Story #${s.id}`}
                              >
                                #{s.id} ↗
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic" style={{fontSize:'10px'}}>{s.title}</span>
                          )}
                        </div>
                      ))}
                      {hasMoreStories && (
                        <button
                          onClick={() => toggleAdo(i)}
                          className="text-blue-600 hover:text-blue-800 font-medium mt-1 block ml-auto"
                          style={{fontSize:'9.5px'}}
                        >
                          {adoExpanded ? '▲ show less' : `+${d.adoStories.length - 2} more`}
                        </button>
                      )}
                    </td>
                    {/* Notes / Gap — truncated with expand */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top'}}>
                      <div className="flex items-start gap-1">
                        <span style={{fontSize:'11px', lineHeight:'1.1', flexShrink:0}}>{noteIcon}</span>
                        <div className="flex-1">
                          <span
                            className="text-slate-600 leading-snug"
                            style={{
                              fontSize:'10.5px',
                              display: noteExpanded ? 'block' : '-webkit-box',
                              WebkitLineClamp: noteExpanded ? undefined : 3,
                              WebkitBoxOrient: 'vertical' as const,
                              overflow: noteExpanded ? 'visible' : 'hidden',
                            }}
                          >
                            {d.notes}
                          </span>
                          {d.notes.length > 80 && (
                            <button
                              onClick={() => toggleNote(i)}
                              className="text-blue-500 hover:text-blue-700 font-medium mt-0.5 block"
                              style={{fontSize:'9.5px'}}
                            >
                              {noteExpanded ? 'show less' : '...'}
                            </button>
                          )}
                        </div>
                        <CopyNoteButton text={d.notes} />
                      </div>
                    </td>
                    {/* Owner */}
                    <td className="px-3 text-slate-500 text-xs" style={{padding: '12px 12px', wordBreak:'break-word', verticalAlign:'top', whiteSpace:'normal', overflowWrap:'break-word'}}>{d.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: PO Status Summary ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader
          title="PO Status Summary"
          subtitle="Copy-ready summary for Stephane / PO email or Teams update"
          cascadeStep={4}
          cascadeActive={cascade.active && cascade.currentStep === 4}
          cascadeDone={cascade.completedSteps.includes(4)}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-generated from current batch data</div>
              {poSummaryGeneratedAt && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Generated: {poSummaryGeneratedAt}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={sendToTeams}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#464EB8] text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                title="Open Microsoft Teams with this summary pre-filled"
              >
                <Send className="w-3.5 h-3.5" />
                Send to Teams
              </button>
              <button
                onClick={copyPoSummary}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#003865] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
              >
                {poSummaryCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {poSummaryCopied ? "Copied!" : "Copy Full Summary"}
              </button>
            </div>
          </div>
          <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
            {poSummaryText}
          </pre>
        </div>
      </div>

      {/* ── How it works ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-blue-800 mb-2">How Status Propagation Works</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Batch Roadmap</strong> — progress bar and badge update instantly</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Weekly Demo</strong> — readiness banner and feature statuses update</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Gate Status</strong> — G1–G4 PASSED/PENDING/PLANNED derived automatically</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Agent Hub</strong> — agent Active/Running/Standby/Idle derived from batch progress</span></div>
          <div className="flex items-start gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Persisted to localStorage</strong> — status survives page refresh and navigation</span></div>
          <div className="flex items-start gap-1.5"><Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Reset</strong> — restores Foundation Core + Batch 1 as Complete, Batch 2 as Dev</span></div>
        </div>
      </div>

      <footer className="pt-2 pb-1 border-t border-slate-100">
        <div className="text-xs text-slate-400">DCT Platform Global Control Panel · RSM | CATT · Batch Roadmap v2.1 · April 28, 2026</div>
      </footer>
    </div>
  );
}
