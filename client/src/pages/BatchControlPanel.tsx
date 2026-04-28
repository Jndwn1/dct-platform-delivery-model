// ─────────────────────────────────────────────────────────────────────────────
// Global Batch Control Panel — v1.9 Source of Truth
// Sections:
//   1. Batch Status (existing — propagates to all screens)
//   2. Delivered Work by Batch
//   3. Swagger / API Coverage
//   4. Roger UI Data Availability
//   5. PO Status Summary (copy-ready)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { useBatchStatus, deriveGateStatus, STATUS_STYLES, BATCH_LABELS, type BatchKey, type BatchStatus } from "@/contexts/BatchStatusContext";
import { CheckCircle2, Clock, Circle, Lock, Shield, Link2, FileText, RotateCcw, Zap, Copy, Check, ChevronDown, ChevronUp, ClipboardCopy } from "lucide-react";

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

type DeliveryStatus = "Delivered" | "In Progress" | "Carried Forward" | "Backlogged" | "Not Started" | "Needs PO/Dev Confirmation";
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
    status: "In Progress",
    delivered: ["FileSchemas reference data", "FirmTaxonomy (XLOB) reference data", "EDGAR Corpus reference data", "Normalized record persistence (vNormalizedTb)"],
    validated: ["FileSchemas queryable and versioned", "RunId assigned on processing"],
    open: ["Normalized Trial Balance Contract (Roger Read Surface) — in progress", "Batch 2A contract enforcement not yet complete"],
    readiness: "Partially API-ready · Demo partially ready",
    poNote: "Batch 2 is in progress. Normalization reference data and XLOB taxonomy are operational. Normalized record persistence is functional. Roger read contract (vNormalizedTb) is pending Batch 2A contract enforcement completion.",
  },
  {
    key: "2a",
    label: "Batch 2A — Orchestrator Contract Enforcement & Classification",
    owner: "PDC + AI Orchestrator",
    status: "In Progress",
    delivered: ["FirmTaxonomyId enforcement rule defined", "Rejection logic for missing classification"],
    validated: [],
    open: ["Bulk insert vs upsert strategy — future scope", "Validation audit log not yet queryable", "Classification rejection demo not yet confirmed"],
    readiness: "Backlog-only — not yet demo-ready",
    poNote: "Batch 2A is in progress. Contract enforcement layer between Orchestrator and PDC is being defined. FirmTaxonomyId is required on every record. Classification rejection and audit log are open items. This is the blocking gap identified in the Classification Walkthrough.",
  },
  {
    key: "3",
    label: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    owner: "TDC",
    status: "In Progress",
    delivered: ["TaxFormTemplates and FormLines", "TaxTaxonomyAccounts and MappingRules", "ConfidenceBandThresholds (GREEN/YELLOW/RED)", "TDC Reference Data Read Contract (Orchestrator-facing)"],
    validated: ["TaxFormTemplates queryable by Jurisdiction", "MappingRules versioned and available", "ConfidenceBandThresholds configured"],
    open: ["Domain Governance Note 3b: Tax calculation reference data must be governed tables, not hard-coded"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 3 is in progress. TDC is established as the tax domain authority. Tax forms, return templates, taxonomy, and mapping rules are loaded, versioned, and governed. Domain Governance Note 3b (tax calculation reference data must be governed tables, not hard-coded) remains an open item. Orchestrator has everything needed to generate proposals.",
  },
  {
    key: "4",
    label: "Batch 4 — AI Tax Mapping & Explainability",
    owner: "TDC + AI Orchestrator",
    status: "In Progress",
    delivered: ["AI Mapping Proposals structure", "Confidence band framework (GREEN/YELLOW/RED)", "Mapping Decisions (immutable)"],
    validated: ["Proposals include confidence score and band", "Decision audit structure confirmed"],
    open: ["TDC Records API Contract (Roger Read Surface) — not yet published", "Decision Audit & Event Publishing — in progress", "Roger primary read contract pending"],
    readiness: "Partially demo-ready · Roger contract pending",
    poNote: "Batch 4 is in progress. AI mapping proposals are being delivered to TDC. Confidence bands and structured evidence are in place. Practitioner decision recording is functional. Roger's primary TDC read contract is the open item — this is the moment the platform comes to life for practitioners.",
  },
  {
    key: "5",
    label: "Batch 5 — Entity Identity & Structure",
    owner: "PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: ["EntityId risk open since PI 1", "CEM Integration & Sync not started", "User Entitlement Sync — future scope", "Client Groups & Legal Entity Registration not started"],
    readiness: "Not started — backlog only",
    poNote: "Batch 5 has not started. This batch closes the EntityId risk open since PI 1. PDC will establish the authoritative entity registry. Planned for PI 2 Committed.",
  },
  {
    key: "6",
    label: "Batch 6 — Practitioner Review, Adjustments & Lock",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: ["Sequential — begins after Batch 4 closes", "Sign-Off, Lock & Entity Finalization not started", "Tax-Ready Record Derivation not started", "SHA-256 cryptographic hash sign-off not started"],
    readiness: "Not started — backlog only",
    poNote: "Batch 6 has not started. Sequential after Batch 4 closes. Practitioners will be able to do real work: review tasks, adjustments, tax-ready derivation, and non-repudiable sign-off. Planned for PI 2 Committed.",
  },
  {
    key: "7",
    label: "Batch 7 — Client Tax Profile & Eligibility",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: ["Sequential — begins after Batch 6 closes", "Three-Tier Eligibility Model not started", "Controlled Group & Affiliated Group Determination not started"],
    readiness: "Not started — backlog only",
    poNote: "Batch 7 has not started. Sequential after Batch 6 closes. TDC will serve as system of record for tax profile and eligibility. Eligibility acts as a downstream processing gate. Planned for PI 2 Committed.",
  },
];

const SWAGGER_ENTRIES: SwaggerEntry[] = [
  { batch: "Batch 1", endpoint: "Ingestion Status API", path: "GET /api/pdc/ingestion/status/{jobId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "JobId-based status retrieval. EntityId, DocumentId, Timestamps returned." },
  { batch: "Batch 1", endpoint: "Document Type API", path: "GET /api/pdc/documents/{documentId}/type", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "Document type classification. Consumer Guide alignment partial — missing PeriodStart/End fields." },
  { batch: "Batch 1", endpoint: "Processing Run API", path: "GET /api/pdc/processing-runs/{runId}", status: "Delivered", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "RunId-based processing run retrieval. Not yet documented in Consumer Guide." },
  { batch: "Batch 2", endpoint: "Normalized Trial Balance Contract", path: "GET /api/pdc/normalized-tb", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "vNormalizedTb — EntityId + PeriodStart + PeriodEnd + RunId. Roger read surface. Pending Batch 2A completion." },
  { batch: "Batch 2", endpoint: "FileSchemas Reference Data", path: "GET /api/pdc/schemas", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "Queryable and versioned file schemas." },
  { batch: "Batch 2", endpoint: "FirmTaxonomy (XLOB) Reference Data", path: "GET /api/pdc/taxonomy", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "XLOB taxonomy definitions. Consumer Guide missing FirmTaxonomyId field documentation." },
  { batch: "Batch 2A", endpoint: "Classification Enforcement Contract", path: "POST /api/pdc/orchestrator/validate", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "FirmTaxonomyId enforcement. Rejection + audit log. Blocking gap — not yet in Swagger or Consumer Guide." },
  { batch: "Batch 3", endpoint: "TDC Reference Data Read Contract", path: "GET /api/tdc/reference-data", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "Orchestrator-facing. TaxFormTemplates, MappingRules, ConfidenceBandThresholds." },
  { batch: "Batch 3", endpoint: "Tax Form Templates API", path: "GET /api/tdc/tax-forms", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "Queryable by Jurisdiction and TaxYear (derived from PeriodStart)." },
  { batch: "Batch 4", endpoint: "AI Mapping Proposals API", path: "GET /api/tdc/mapping-proposals", status: "In Progress", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "Confidence score + band + structured evidence. Consumer Guide missing evidence field schema." },
  { batch: "Batch 4", endpoint: "Mapping Decisions API", path: "GET /api/tdc/mapping-decisions", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "Immutable decision records. Out of Sync — Swagger currently exposes tax_year field instead of PeriodStart/PeriodEnd." },
  { batch: "Batch 4", endpoint: "TDC Records API (Roger Primary Contract)", path: "GET /api/tdc/records", status: "Needs PO/Dev Confirmation", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "Roger primary read contract. Not yet published. Blocking Roger practitioner view." },
  { batch: "Batch 5", endpoint: "Entity Identity Read Contract", path: "GET /api/pdc/entities/{entityId}", status: "Missing", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "Not started. Batch 5 not yet in scope." },
  { batch: "Batch 6", endpoint: "Tax-Ready Record API", path: "GET /api/tdc/tax-ready", status: "Missing", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "Batch 6 not started. Derivation from mapping decisions + adjustments." },
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
    notes: "Batch 5 not started. EntityId risk open since PI 1.", owner: "PDC",
  },
  {
    dataPoint: "Review task state and adjustment lifecycle",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [
      { title: "Review Task Management & Entity Status", id: "1350253" },
      { title: "Book-to-Tax Adjustments & Approval Routing", id: "1350254" },
    ],
    notes: "Batch 6 not started. Sequential after Batch 4 closes.", owner: "TDC",
  },
  {
    dataPoint: "Tax-ready records (locked, derived)",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Tax-Ready Record Derivation", id: "1350255" }],
    notes: "Batch 6 not started. Derivation from mapping decisions + approved adjustments.", owner: "TDC",
  },
  {
    dataPoint: "Eligibility status and rule reasoning",
    source: "TDC", batch: "Batch 7", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [{ title: "Client Tax Profile Lifecycle & Determination Records", id: "1355882" }],
    notes: "Batch 7 not started. Sequential after Batch 6 closes.", owner: "TDC",
  },
  {
    dataPoint: "Exception status (ingestion, mapping, workflow)",
    source: "PDC + TDC", batch: "Batch 8", availability: "Not Available",
    apiEndpoint: "—",
    adoStories: [
      { title: "PDC Exception Record Structure & Failure Tracking", id: "1355898" },
      { title: "TDC Exception Record Structure & Failure Tracking", id: "1355902" },
    ],
    notes: "Batch 8 not started. Parallel to Batch 7 (PDC), sequential after Batch 7 (TDC).", owner: "PDC + TDC",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const DELIVERY_STYLE: Record<DeliveryStatus, { bg: string; text: string; border: string }> = {
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

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-5 py-3 border-b border-slate-100 bg-[#003865]">
      <div className="text-sm font-bold text-white">{title}</div>
      {subtitle && <div className="text-xs text-blue-200 mt-0.5">{subtitle}</div>}
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
  const { statuses, setStatus, resetAll } = useBatchStatus();
  const gates = deriveGateStatus(statuses);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [poSummaryCopied, setPoSummaryCopied] = useState(false);

  const complete = BATCH_KEYS.filter(k => statuses[k] === "Complete").length;
  const dev      = BATCH_KEYS.filter(k => statuses[k] === "Dev").length;
  const inReview = BATCH_KEYS.filter(k => statuses[k] === "In Review").length;
  const planned  = BATCH_KEYS.filter(k => statuses[k] === "Planned").length;

  const advanceAll = () => {
    BATCH_KEYS.forEach(k => {
      const current = statuses[k];
      if (current === "Planned") setStatus(k, "Dev");
      else if (current === "Dev") setStatus(k, "In Review");
      else if (current === "In Review") setStatus(k, "Complete");
    });
  };

  // Build PO Status Summary
  const deliveredBatches = DELIVERED_BATCHES.filter(b => b.status === "Delivered").map(b => b.label);
  const inProgressBatches = DELIVERED_BATCHES.filter(b => b.status === "In Progress" || b.status === "Carried Forward" || b.status === "Backlogged").map(b => b.label);
  const apisDelivered = SWAGGER_ENTRIES.filter(e => e.status === "Delivered").length;
  const apisMissing = SWAGGER_ENTRIES.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const rogerAvailable = ROGER_DATA_POINTS.filter(d => d.availability === "Available").length;
  const rogerBlocked = ROGER_DATA_POINTS.filter(d => d.availability === "Not Available").length;
  const carryForward = DELIVERED_BATCHES.flatMap(b => b.open).filter(o => o.length > 0);

  const poSummaryText = `DCT Platform — Delivery Status Update (v1.9)

DELIVERED:
${deliveredBatches.map(b => `• ${b}`).join("\n")}

IN PROGRESS:
${inProgressBatches.map(b => `• ${b}`).join("\n")}

API COVERAGE:
• ${apisDelivered} of ${SWAGGER_ENTRIES.length} endpoints delivered
• ${apisMissing} endpoints missing from Swagger or Consumer Guide
• Batch 4 TDC Records API (Roger primary contract) not yet published — blocking Roger practitioner view
• Batch 2A Classification Enforcement contract not yet in Swagger — blocking gap

ROGER UI DATA AVAILABILITY:
• ${rogerAvailable} of ${ROGER_DATA_POINTS.length} data points available to Roger
• ${rogerBlocked} data points not yet available (Batches 5–8 not started)
• FirmTaxonomyId on normalized records: NOT AVAILABLE — Orchestrator not returning classification (see Classification Walkthrough)

CARRY-FORWARD ITEMS:
• Batch 2A: FirmTaxonomyId enforcement and classification rejection audit log
• Batch 4: TDC Records API (Roger primary read contract)
• Batch 5: EntityId risk — entity registry not yet established
• Swagger/Consumer Guide alignment: 6 endpoints missing from Consumer Guide

OPEN DECISIONS:
• Should FirmTaxonomyId be REQUIRED on all PDC records?
• Should PDC reject records without classification?
• Which system generates JobId — Tax Portal or PDC?
• Engagement code ownership between EODS and CEM

RISKS / BLOCKERS:
• Orchestrator not returning FirmTaxonomyId — blocks Batch 2 normalization completeness
• TDC Records API not published — blocks Roger practitioner view
• Batch 2A contract enforcement not yet in Swagger

RECOMMENDED NEXT ACTION:
• Confirm Batch 2A classification enforcement decision with engineering (FirmTaxonomyId required vs optional)
• Publish TDC Records API contract to unblock Roger Batch 4 view
• Update Consumer Guide with missing endpoint documentation (Processing Run API, Normalized TB, Mapping Decisions)`;

  const copyPoSummary = () => {
    navigator.clipboard.writeText(poSummaryText).then(() => {
      setPoSummaryCopied(true);
      setTimeout(() => setPoSummaryCopied(false), 3000);
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#003865]">Global Control Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            DCT Batch Roadmap v1.9 · Source of truth for all batch-related pages · RSM | CATT
          </p>
        </div>
        <div className="flex items-center gap-2">
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
                  className="text-xs font-semibold rounded-full border px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0"
                  style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                  <option value="Planned">Planned</option>
                  <option value="Dev">Dev</option>
                  <option value="In Review">In Review</option>
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
        <SectionHeader title="Delivered Work by Batch" subtitle="What was delivered, validated, and what remains open — use for PO status updates" />
        <div className="divide-y divide-slate-100">
          {DELIVERED_BATCHES.map(b => {
            const style = DELIVERY_STYLE[b.status];
            const isExpanded = expandedBatch === b.key;
            return (
              <div key={b.key}>
                <button
                  onClick={() => setExpandedBatch(isExpanded ? null : b.key)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                    {b.status}
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
        <SectionHeader title="Swagger / API Coverage" subtitle="All API endpoints mapped to batch — flag missing Consumer Guide or Swagger entries" />
        <div className="overflow-x-auto">
          <table className="w-full" style={{fontSize: '11px', tableLayout: 'fixed'}}>
            <colgroup>
              <col style={{width: '72px'}} />
              <col style={{width: '130px'}} />
              <col style={{width: '200px'}} />
              <col style={{width: '110px'}} />
              <col style={{width: '90px'}} />
              <col style={{width: '72px'}} />
              <col style={{width: '72px'}} />
              <col style={{width: 'auto'}} />
            </colgroup>
            <thead>
              <tr className="bg-[#003865] text-white">
                <th className="text-left px-2 py-2 font-semibold">Batch</th>
                <th className="text-left px-2 py-2 font-semibold">Endpoint</th>
                <th className="text-left px-2 py-2 font-semibold">Path</th>
                <th className="text-left px-2 py-2 font-semibold">Status</th>
                <th className="text-left px-2 py-2 font-semibold">Consumer Guide</th>
                <th className="text-left px-2 py-2 font-semibold text-center">Missing Guide?</th>
                <th className="text-left px-2 py-2 font-semibold text-center">Missing Swagger?</th>
                <th className="text-left px-2 py-2 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SWAGGER_ENTRIES.map((e, i) => {
                const apiStyle = API_STYLE[e.status];
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5 font-semibold text-[#003865] whitespace-nowrap">{e.batch}</td>
                    <td className="px-2 py-1.5 text-slate-800 font-medium" style={{wordBreak:'break-word'}}>{e.endpoint}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-600" style={{wordBreak:'break-all', fontSize:'10px'}}>{e.path}</td>
                    <td className="px-2 py-1.5">
                      <Badge label={e.status} bg={apiStyle.bg} text={apiStyle.text} />
                    </td>
                    <td className="px-2 py-1.5">
                      <Badge
                        label={e.consumerGuide}
                        bg={e.consumerGuide === "Aligned" ? "bg-emerald-100" : e.consumerGuide === "Partial" ? "bg-amber-100" : "bg-red-100"}
                        text={e.consumerGuide === "Aligned" ? "text-emerald-800" : e.consumerGuide === "Partial" ? "text-amber-800" : "text-red-700"}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {e.missingFromGuide ? <span className="text-red-600 font-bold">Yes</span> : <span className="text-emerald-600">No</span>}
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      {e.missingFromSwagger ? <span className="text-red-600 font-bold">Yes</span> : <span className="text-emerald-600">No</span>}
                    </td>
                    <td className="px-2 py-1.5 text-slate-600" style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>
                      <div className="flex items-start gap-1">
                        <span className="flex-1">{e.notes}</span>
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
        <SectionHeader title="Roger UI Data Availability" subtitle="Which data points are ready for Roger to consume now vs carried forward to PI 2" />
        <div className="overflow-x-auto">
          <table className="w-full" style={{fontSize: '11px', tableLayout: 'fixed'}}>
            <colgroup>
              <col style={{width: '155px'}} />
              <col style={{width: '80px'}} />
              <col style={{width: '68px'}} />
              <col style={{width: '105px'}} />
              <col style={{width: '165px'}} />
              <col style={{width: '185px'}} />
              <col style={{width: 'auto'}} />
              <col style={{width: '80px'}} />
            </colgroup>
            <thead>
              <tr className="bg-[#003865] text-white">
                <th className="text-left px-2 py-2 font-semibold">Data Point</th>
                <th className="text-left px-2 py-2 font-semibold">Source</th>
                <th className="text-left px-2 py-2 font-semibold">Batch</th>
                <th className="text-left px-2 py-2 font-semibold">Availability</th>
                <th className="text-left px-2 py-2 font-semibold">API Endpoint</th>
                <th className="text-left px-2 py-2 font-semibold">ADO Story (ID)</th>
                <th className="text-left px-2 py-2 font-semibold">Notes / Gap</th>
                <th className="text-left px-2 py-2 font-semibold">Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROGER_DATA_POINTS.map((d, i) => {
                const rStyle = ROGER_STYLE[d.availability];
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-2 py-1.5 font-medium text-slate-800" style={{wordBreak:'break-word'}}>{d.dataPoint}</td>
                    <td className="px-2 py-1.5 text-slate-600" style={{wordBreak:'break-word'}}>{d.source}</td>
                    <td className="px-2 py-1.5 font-semibold text-[#003865] whitespace-nowrap">{d.batch}</td>
                    <td className="px-2 py-1.5">
                      <Badge label={d.availability} bg={rStyle.bg} text={rStyle.text} />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-500" style={{wordBreak:'break-all', fontSize:'10px'}}>{d.apiEndpoint}</td>
                    <td className="px-2 py-1.5" style={{wordBreak:'break-word'}}>
                      {d.adoStories.map((s, si) => (
                        <div key={si} className="mb-1 last:mb-0">
                          {s.id ? (
                            <span
                              title="Click to view ADO work item"
                              className="cursor-help inline-block"
                            >
                              <span className="text-slate-700" style={{fontSize:'10px'}}>{s.title}</span>
                              <span
                                className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200"
                                title={`ADO Story ID: ${s.id} — Click to view ADO work item`}
                              >
                                #{s.id}
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic" style={{fontSize:'10px'}}>{s.title}</span>
                          )}
                        </div>
                      ))}
                    </td>
                    <td className="px-2 py-1.5 text-slate-600" style={{whiteSpace: 'normal', wordBreak: 'break-word'}}>
                      <div className="flex items-start gap-1">
                        <span className="flex-1">{d.notes}</span>
                        <CopyNoteButton text={d.notes} />
                      </div>
                    </td>
                    <td className="px-2 py-1.5 text-slate-600" style={{wordBreak:'break-word'}}>{d.owner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: PO Status Summary ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="PO Status Summary" subtitle="Copy-ready summary for Stephane / PO email or Teams update" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-generated from current batch data</div>
            <button
              onClick={copyPoSummary}
              className="flex items-center gap-1.5 text-xs font-semibold bg-[#003865] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
            >
              {poSummaryCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {poSummaryCopied ? "Copied!" : "Copy Full Summary"}
            </button>
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
        <div className="text-xs text-slate-400">DCT Platform Global Control Panel · RSM | CATT · Batch Roadmap v1.9 · April 27, 2026</div>
      </footer>
    </div>
  );
}
