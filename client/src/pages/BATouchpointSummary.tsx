// BATouchpointSummary.tsx
// BA Touchpoint Summary Generator — Roger + DCT Alignment Sessions
// Spec: pasted_content_26.txt
// Reads exclusively from BatchStatusContext (live, governed, synchronized)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useBatchStatus, BATCH_LABELS,
  type BatchKey, type BatchStatus,
} from "@/contexts/BatchStatusContext";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Copy, Check,
  Send, ArrowLeft, RefreshCw, ChevronDown, ChevronUp,
  FileText, Zap, Shield, Link2, Activity, Circle,
} from "lucide-react";

// ── Types (mirrored from BatchControlPanel) ───────────────────────────────────
type DeliveryStatus = "Delivered" | "In Progress" | "Carried Forward" | "Backlogged" | "Not Started" | "Needs PO/Dev Confirmation";
type ApiStatus = "Delivered" | "In Progress" | "Missing" | "Needs PO/Dev Confirmation";
type RogerAvailability = "Available" | "Partially Available" | "Not Available" | "Carried Forward" | "Backlogged";

interface DeliveredBatch {
  key: string; label: string; owner: string; status: DeliveryStatus;
  delivered: string[]; validated: string[]; open: string[];
  readiness: string; poNote: string;
}
interface SwaggerEntry {
  batch: string; endpoint: string; path: string; status: ApiStatus;
  consumerGuide: "Aligned" | "Missing" | "Partial";
  missingFromGuide: boolean; missingFromSwagger: boolean; notes: string;
}
interface RogerDataPoint {
  dataPoint: string; source: string; batch: string;
  availability: RogerAvailability; apiEndpoint: string;
  adoStories: { title: string; id: string }[];
  notes: string; owner: string;
}

// ── Qualifying statuses (spec filter rule) ────────────────────────────────────
const QUALIFYING_STATUSES: BatchStatus[] = [
  "Complete", "Delivered", "Ready for QA", "QA In Progress", "Demo Ready",
];

// ── Shared data (same source as BatchControlPanel) ────────────────────────────
const ALL_BATCHES: DeliveredBatch[] = [
  { key: "foundation-core", label: "Foundation Core", owner: "PDC + TDC", status: "Delivered",
    delivered: ["Code repository", "Code templates", "Copilot Agent & Blitzy configuration", "DEV environment in Azure"],
    validated: ["Dev environment operational", "Agent tooling configured"], open: [],
    readiness: "Infrastructure only — not demo-ready",
    poNote: "Foundation Core is complete. Dev infrastructure, code templates, and agent tooling are operational. No Roger-facing output from this batch." },
  { key: "1", label: "Batch 1 — File Ingestion & Initial Storage", owner: "PDC", status: "Delivered",
    delivered: ["JobId-based ingestion model", "IngestionJob + SourceFile records", "DocumentId (immutable)", "Lineage anchor at ingestion", "PDC-owned state machine", "IngestionStatus API"],
    validated: ["File upload → Service Bus → PDC flow", "JobId, DocumentId, EntityId captured", "State = INGESTED confirmed", "Lineage immediately visible"],
    open: ["TaxYear governance note: TaxYear is NOT stored in PDC — derived in TDC from PeriodStart/PeriodEnd"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 1 delivered. PDC ingestion framework is operational. Files are received, assigned immutable identifiers, and lineage is anchored at entry. IngestionStatus API is live. Roger can confirm file arrival and processing state." },
  { key: "2", label: "Batch 2 — Normalization & Cross-LOB Taxonomy", owner: "PDC + AI Orchestrator", status: "In Progress",
    delivered: ["FileSchemas reference data", "FirmTaxonomy (XLOB) reference data", "EDGAR Corpus reference data", "Normalized record persistence (vNormalizedTb)"],
    validated: ["FileSchemas queryable and versioned", "RunId assigned on processing"],
    open: ["Normalized Trial Balance Contract (Roger Read Surface) — in progress", "Batch 2A contract enforcement not yet complete"],
    readiness: "Partially API-ready · Demo partially ready",
    poNote: "Batch 2 is in progress. Normalization reference data and XLOB taxonomy are operational. Roger read contract (vNormalizedTb) is pending Batch 2A contract enforcement completion." },
  { key: "2a", label: "Batch 2A — Orchestrator Contract Enforcement & Classification", owner: "PDC + AI Orchestrator", status: "In Progress",
    delivered: ["FirmTaxonomyId enforcement rule defined", "Rejection logic for missing classification"],
    validated: [],
    open: ["Bulk insert vs upsert strategy — future scope", "Validation audit log not yet queryable", "Classification rejection demo not yet confirmed"],
    readiness: "Backlog-only — not yet demo-ready",
    poNote: "Batch 2A is in progress. Contract enforcement layer between Orchestrator and PDC is being defined. FirmTaxonomyId is required on every record. Classification rejection and audit log are open items. This is the blocking gap identified in the Classification Walkthrough." },
  { key: "3", label: "Batch 3 — Tax Domain Authority & Tax Taxonomy", owner: "TDC", status: "Delivered",
    delivered: ["TaxFormTemplates and FormLines", "TaxTaxonomyAccounts and MappingRules", "ConfidenceBandThresholds (GREEN/YELLOW/RED)", "TDC Reference Data Read Contract (Orchestrator-facing)"],
    validated: ["TaxFormTemplates queryable by Jurisdiction", "MappingRules versioned and available", "ConfidenceBandThresholds configured"],
    open: ["Domain Governance Note 3b: Tax calculation reference data must be governed tables, not hard-coded"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 3 is delivered. TDC is established as the tax domain authority. TaxFormTemplates, FormLines, TaxTaxonomyAccounts, MappingRules, and ConfidenceBandThresholds (GREEN/YELLOW/RED) are loaded, versioned, and governed." },
  { key: "4", label: "Batch 4 — AI Tax Mapping & Explainability", owner: "TDC + AI Orchestrator", status: "In Progress",
    delivered: ["AI Mapping Proposals structure", "Confidence band framework (GREEN/YELLOW/RED)", "Mapping Decisions (immutable)"],
    validated: ["Proposals include confidence score and band", "Decision audit structure confirmed"],
    open: ["TDC Records API Contract (Roger Read Surface) — not yet published", "Decision Audit & Event Publishing — in progress", "Roger primary read contract pending"],
    readiness: "Partially demo-ready · Roger contract pending",
    poNote: "Batch 4 is in progress. AI mapping proposals are being delivered to TDC. Confidence bands and structured evidence are in place. Practitioner decision recording is functional. Roger's primary TDC read contract is the open item — this is the moment the platform comes to life for practitioners." },
  { key: "5", label: "Batch 5 — Entity Identity & Structure", owner: "PDC", status: "In Progress",
    delivered: ["Client Groups & Legal Entity Registry (in progress)", "Ownership Chains & Jurisdictions (in progress)"],
    validated: [],
    open: ["EntityId risk open since PI 1 — being closed", "CEM Integration & Sync — in progress", "User Entitlement Sync — future scope"],
    readiness: "In progress — PI 2 Committed (parallel to Batch 4)",
    poNote: "Batch 5 is in progress (PI 2 Committed, parallel to Batch 4). PDC is establishing the authoritative entity registry. Entity Identity Read Contract (PDC-facing, ID: 1355868) is the primary Roger-facing deliverable." },
  { key: "6", label: "Batch 6 — Practitioner Review, Adjustments & Lock", owner: "TDC", status: "In Progress",
    delivered: ["Review task generation logic (in progress)", "Six-state adjustment lifecycle defined"],
    validated: [],
    open: ["Sequential — begins after Batch 4 closes", "Sign-Off, Lock & Entity Finalization — in progress", "Tax-Ready Record Derivation — in progress"],
    readiness: "In progress — PI 2 Committed (sequential after Batch 4)",
    poNote: "Batch 6 is in progress (PI 2 Committed, sequential after Batch 4 closes). Practitioners will be able to review tasks, govern adjustments, and produce tax-ready records with SHA-256 sign-off." },
  { key: "7", label: "Batch 7 — Client Tax Profile & Eligibility", owner: "TDC", status: "In Progress",
    delivered: ["Three-Tier Eligibility Model defined", "Client Tax Profile structure defined"],
    validated: [],
    open: ["Sequential — begins after Batch 6 closes", "Controlled Group & Affiliated Group Determination — in progress"],
    readiness: "In progress — PI 2 Committed (sequential after Batch 6)",
    poNote: "Batch 7 is in progress (PI 2 Committed, sequential after Batch 6 closes). Three-Tier Eligibility Model (Must Have / Must Not Have / Flag & Review). Ineligible entities blocked from downstream workflow." },
];

const ALL_SWAGGER: SwaggerEntry[] = [
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

const ALL_ROGER: RogerDataPoint[] = [
  { dataPoint: "File ingestion status (JobId, DocumentId, State)", source: "PDC", batch: "Batch 1", availability: "Available", apiEndpoint: "GET /api/pdc/ingestion/status/{jobId}", adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }], notes: "Operational. Roger can confirm file arrival and processing state.", owner: "PDC" },
  { dataPoint: "Lineage anchor (DocumentId → EntityId → PeriodStart/End)", source: "PDC", batch: "Batch 1", availability: "Available", apiEndpoint: "GET /api/pdc/ingestion/status/{jobId}", adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }], notes: "Lineage immediately visible at ingestion.", owner: "PDC" },
  { dataPoint: "Normalized Trial Balance (vNormalizedTb)", source: "PDC", batch: "Batch 2", availability: "Partially Available", apiEndpoint: "GET /api/pdc/normalized-tb", adoStories: [{ title: "Normalized TB Contract (Roger Read Surface)", id: "1349150" }], notes: "Pending Batch 2A contract enforcement. Not yet Roger-consumable.", owner: "PDC" },
  { dataPoint: "FirmTaxonomyId on normalized records", source: "PDC / Orchestrator", batch: "Batch 2A", availability: "Not Available", apiEndpoint: "—", adoStories: [{ title: "Enforce Classification Presence (FirmTaxonomyId)", id: "1370843" }], notes: "Blocking gap. Orchestrator not returning FirmTaxonomyId. Classification Walkthrough documents this gap.", owner: "PDC + Orchestrator" },
  { dataPoint: "Tax form templates and mapping rules", source: "TDC", batch: "Batch 3", availability: "Available", apiEndpoint: "GET /api/tdc/reference-data", adoStories: [{ title: "TDC Reference Data Read Contract (Orchestrator Facing)", id: "1349152" }], notes: "Orchestrator-facing only. Not Roger-facing.", owner: "TDC" },
  { dataPoint: "AI mapping proposals (confidence + evidence)", source: "TDC", batch: "Batch 4", availability: "Partially Available", apiEndpoint: "GET /api/tdc/mapping-proposals", adoStories: [{ title: "AI Mapping Proposals", id: "1349156" }], notes: "Proposals available. Roger read contract (TDC Records API) not yet published.", owner: "TDC" },
  { dataPoint: "Mapping decisions (accept / override / reject)", source: "TDC", batch: "Batch 4", availability: "Partially Available", apiEndpoint: "GET /api/tdc/mapping-decisions", adoStories: [{ title: "Mapping Decisions", id: "1349157" }], notes: "Immutable decisions in place. Out of Sync — tax_year field gap in Swagger.", owner: "TDC" },
  { dataPoint: "Roger primary TDC read contract (GREEN/YELLOW/RED, pending vs decided)", source: "TDC", batch: "Batch 4", availability: "Not Available", apiEndpoint: "GET /api/tdc/records", adoStories: [{ title: "TDC Records API Contract (Roger Read Surface)", id: "1349158" }], notes: "Not yet published. This is the moment the platform comes to life for practitioners. Blocking.", owner: "TDC" },
  { dataPoint: "Entity identity (ClientGroupId, EntityId, hierarchy)", source: "PDC", batch: "Batch 5", availability: "Not Available", apiEndpoint: "—", adoStories: [{ title: "Entity Identity Read Contract (PDC-facing)", id: "1355868" }], notes: "In progress (PI 2). EntityId risk from PI 1 being closed.", owner: "PDC" },
  { dataPoint: "Review task state and adjustment lifecycle", source: "TDC", batch: "Batch 6", availability: "Not Available", apiEndpoint: "—", adoStories: [{ title: "Review Task Management & Entity Status", id: "1350253" }, { title: "Book-to-Tax Adjustments & Approval Routing", id: "1350254" }], notes: "In progress (PI 2, sequential after Batch 4). Six-state adjustment lifecycle in development.", owner: "TDC" },
  { dataPoint: "Tax-ready records (locked, derived)", source: "TDC", batch: "Batch 6", availability: "Not Available", apiEndpoint: "—", adoStories: [{ title: "Tax-Ready Record Derivation", id: "1350255" }], notes: "In progress (PI 2). Tax-ready derivation from mapping decisions + approved adjustments.", owner: "TDC" },
  { dataPoint: "Eligibility status and rule reasoning", source: "TDC", batch: "Batch 7", availability: "Not Available", apiEndpoint: "—", adoStories: [{ title: "Client Tax Profile Lifecycle & Determination Records", id: "1355882" }], notes: "In progress (PI 2, sequential after Batch 6). Three-Tier Eligibility Model.", owner: "TDC" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_PILL: Record<BatchStatus, { bg: string; text: string; label: string }> = {
  "Not Started":    { bg: "bg-slate-100",   text: "text-slate-500",   label: "Not Started" },
  "In Progress":    { bg: "bg-blue-100",    text: "text-blue-800",    label: "In Progress" },
  "Blocked":        { bg: "bg-red-100",     text: "text-red-700",     label: "Blocked" },
  "Ready for QA":   { bg: "bg-amber-100",   text: "text-amber-800",   label: "Ready for QA" },
  "QA In Progress": { bg: "bg-orange-100",  text: "text-orange-800",  label: "QA In Progress" },
  "Demo Ready":     { bg: "bg-purple-100",  text: "text-purple-800",  label: "Demo Ready" },
  "MVP":            { bg: "bg-indigo-100",  text: "text-indigo-800",  label: "MVP" },
  "Stretch":        { bg: "bg-cyan-100",    text: "text-cyan-800",    label: "Stretch" },
  "Delivered":      { bg: "bg-emerald-100", text: "text-emerald-800", label: "Delivered" },
  "Complete":       { bg: "bg-emerald-200", text: "text-emerald-900", label: "Complete" },
};

const ROGER_PILL: Record<RogerAvailability, { bg: string; text: string; icon: string }> = {
  "Available":           { bg: "bg-emerald-100", text: "text-emerald-800", icon: "🟢" },
  "Partially Available": { bg: "bg-amber-100",   text: "text-amber-800",   icon: "🟡" },
  "Not Available":       { bg: "bg-red-100",     text: "text-red-700",     icon: "🔴" },
  "Carried Forward":     { bg: "bg-amber-50",    text: "text-amber-700",   icon: "🟡" },
  "Backlogged":          { bg: "bg-slate-100",   text: "text-slate-600",   icon: "⚪" },
};

function Pill({ label, bg, text }: { label: string; bg: string; text: string }) {
  return <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>{label}</span>;
}

function SectionCard({ id, title, icon, children, defaultOpen = true }: {
  id: string; title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#003865] text-white hover:bg-blue-900 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-blue-200">{icon}</span>
          <span className="text-sm font-bold tracking-wide">{id} — {title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-blue-200" /> : <ChevronDown className="w-4 h-4 text-blue-200" />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BATouchpointSummary() {
  const { statuses, lastUpdated } = useBatchStatus();
  const [generated, setGenerated] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includeStretch, setIncludeStretch] = useState(false);

  // ── Filter: qualifying batches only ──────────────────────────────────────────
  const qualifyingStatuses = useMemo(() => {
    const base = [...QUALIFYING_STATUSES];
    if (includeStretch) base.push("Stretch");
    return base;
  }, [includeStretch]);

  const qualifyingBatches = useMemo(() =>
    ALL_BATCHES.filter(b => {
      const live = statuses[b.key as BatchKey];
      return live && qualifyingStatuses.includes(live);
    }),
    [statuses, qualifyingStatuses]
  );

  const qualifyingKeys = useMemo(() => new Set(qualifyingBatches.map(b => b.key)), [qualifyingBatches]);

  // ── Section 1 derived metrics ─────────────────────────────────────────────
  const completedCount = ALL_BATCHES.filter(b => {
    const s = statuses[b.key as BatchKey];
    return s === "Complete" || s === "Delivered";
  }).length;

  const qaReadyCount = ALL_BATCHES.filter(b => {
    const s = statuses[b.key as BatchKey];
    return s === "Ready for QA" || s === "QA In Progress";
  }).length;

  const demoReadyCount = ALL_BATCHES.filter(b => {
    const s = statuses[b.key as BatchKey];
    return s === "Demo Ready" || s === "Complete" || s === "Delivered";
  }).length;

  const rogerReadyPoints = ALL_ROGER.filter(d => d.availability === "Available").length;
  const rogerTotalPoints = ALL_ROGER.length;
  const apisDelivered = ALL_SWAGGER.filter(e => e.status === "Delivered").length;
  const apisMissing = ALL_SWAGGER.filter(e => e.status === "Missing" || e.missingFromSwagger).length;

  const criticalRisks = ALL_ROGER.filter(d => d.availability === "Not Available" && qualifyingBatches.some(b => b.key === d.batch.replace("Batch ", "").toLowerCase().replace(" ", "")));

  const platformHealth = completedCount >= 3 && qaReadyCount === 0 ? "Stable" :
    qaReadyCount > 0 ? "Active QA" :
    criticalRisks.length > 2 ? "At Risk" : "In Progress";

  const healthColor = platformHealth === "Stable" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
    platformHealth === "Active QA" ? "text-amber-700 bg-amber-50 border-amber-200" :
    platformHealth === "At Risk" ? "text-red-700 bg-red-50 border-red-200" :
    "text-blue-700 bg-blue-50 border-blue-200";

  // ── Section 5 risks ───────────────────────────────────────────────────────
  const RISKS = [
    { severity: "HIGH", owner: "PDC + Orchestrator", batch: "Batch 2A", rogerImpact: "Normalized TB not Roger-consumable", description: "Orchestrator not returning FirmTaxonomyId — blocks Batch 2 normalization completeness", action: "Confirm FirmTaxonomyId enforcement decision with engineering (ADR-06 pending approval)" },
    { severity: "HIGH", owner: "TDC", batch: "Batch 4", rogerImpact: "Roger practitioner view blocked", description: "TDC Records API not published — blocks Roger primary read surface", action: "Publish TDC Records API contract to unblock Roger Batch 4 view" },
    { severity: "MEDIUM", owner: "TDC", batch: "Batch 4", rogerImpact: "Mapping decisions partially visible", description: "Swagger exposes tax_year field instead of PeriodStart/PeriodEnd — out of sync", action: "Update Mapping Decisions API Swagger to align PeriodStart/PeriodEnd fields" },
    { severity: "MEDIUM", owner: "PDC + TDC", batch: "Multiple", rogerImpact: "Consumer Guide gaps block integration", description: "6 endpoints missing from Consumer Guide — Processing Run API, Normalized TB, Mapping Decisions, Classification Enforcement, Entity Identity, Tax-Ready Record", action: "Update Consumer Guide with missing endpoint documentation" },
    { severity: "LOW", owner: "PDC", batch: "Batch 5", rogerImpact: "Entity hierarchy not available to Roger", description: "EntityId risk open since PI 1 — CEM Integration & Sync in progress", action: "Confirm Batch 5 EntityId contract scope with PDC team before PI 2 sprint planning" },
  ];

  // ── Section 6 dependencies ────────────────────────────────────────────────
  const DEPENDENCIES = [
    { type: "Upstream", from: "Orchestrator", to: "PDC (Batch 2A)", description: "Orchestrator must return FirmTaxonomyId on every classification call", status: "Blocked", impact: "Blocks Batch 2 normalization completeness and Roger vNormalizedTb read surface" },
    { type: "Sequential", from: "Batch 4", to: "Batch 6", description: "Batch 6 (Practitioner Review) begins only after Batch 4 closes", status: "Pending", impact: "Six-state adjustment lifecycle cannot start until mapping decisions are finalized" },
    { type: "Sequential", from: "Batch 6", to: "Batch 7", description: "Batch 7 (Eligibility) begins only after Batch 6 closes", status: "Pending", impact: "Three-Tier Eligibility Model requires tax-ready records from Batch 6" },
    { type: "Parallel", from: "Batch 4", to: "Batch 5", description: "Batch 5 (Entity Identity) runs parallel to Batch 4", status: "Active", impact: "EntityId risk from PI 1 being closed concurrently" },
    { type: "Roger Read", from: "TDC Records API", to: "Roger UI", description: "Roger primary read surface depends on TDC Records API contract publication", status: "Blocked", impact: "Roger cannot display practitioner-facing mapping data until contract is published" },
    { type: "PDC ↔ TDC", from: "PDC (vNormalizedTb)", to: "TDC (Batch 4)", description: "TDC mapping proposals depend on normalized TB records from PDC", status: "Partial", impact: "Batch 2A blocking gap delays full TDC proposal generation" },
  ];

  // ── Section 7 open decisions ──────────────────────────────────────────────
  const DECISIONS = [
    { id: "ADR-06", decision: "FirmTaxonomyId enforcement on all PDC records", owner: "PDC + Architecture", batches: "Batch 2, 2A", deadline: "Before PI 2 Sprint 1", recommendation: "REQUIRED — enforce on all normalized records; reject records missing classification", risk: "Batch 2 normalization completeness and Roger read surface remain blocked" },
    { id: "DEP-04", decision: "Which system generates JobId — Tax Portal or PDC?", owner: "Tax Portal + PDC", batches: "Batch 1, Foundation", deadline: "Before PI 2 Sprint 2", recommendation: "PDC generates JobId; Tax Portal passes through", risk: "Lineage anchor ambiguity; Roger cannot trace file-to-entity without clear JobId ownership" },
    { id: "GOV-01", decision: "Engagement code ownership between EODS and CEM", owner: "EODS + CEM + Architecture", batches: "Batch 5", deadline: "Before Batch 5 contract sign-off", recommendation: "CEM as system of record; EODS syncs on change events", risk: "Entity Identity Read Contract cannot be finalized without engagement code ownership clarity" },
    { id: "API-03", decision: "TDC Records API contract scope and versioning strategy", owner: "TDC + Roger Team", batches: "Batch 4", deadline: "Immediate — blocking Roger", recommendation: "Publish v1.0 with GREEN/YELLOW/RED status, pending vs decided fields; version separately from mapping proposals", risk: "Roger practitioner view remains blocked; PI 2 demo readiness at risk" },
    { id: "UX-01", decision: "Partial availability handling in Roger UI (YELLOW state display)", owner: "Roger Team + UX", batches: "Batch 2, 4", deadline: "Before first Roger demo", recommendation: "Show YELLOW state with tooltip explaining pending contract; do not suppress data", risk: "Roger UI may display misleading empty states if partial availability is not handled" },
  ];

  // ── Section 8 recommended actions ────────────────────────────────────────
  const ACTIONS = [
    { priority: "IMMEDIATE", category: "Roger Alignment", action: "Publish TDC Records API contract (GET /api/tdc/records) to unblock Roger practitioner view", owner: "TDC Team" },
    { priority: "IMMEDIATE", category: "Contract Completion", action: "Confirm ADR-06: FirmTaxonomyId enforcement decision with engineering", owner: "PDC + Architecture" },
    { priority: "THIS SPRINT", category: "QA Priority", action: "Validate Batch 1 IngestionStatus API end-to-end with Roger team — confirm JobId, DocumentId, EntityId contract alignment", owner: "PDC + Roger Team" },
    { priority: "THIS SPRINT", category: "Swagger Alignment", action: "Update Mapping Decisions API Swagger to replace tax_year with PeriodStart/PeriodEnd", owner: "TDC Team" },
    { priority: "THIS SPRINT", category: "Consumer Guide", action: "Document Processing Run API, Normalized TB, and Mapping Decisions in Consumer Guide", owner: "BA + TDC Team" },
    { priority: "PI READINESS", category: "Dependency Resolution", action: "Confirm Batch 5 EntityId contract scope with PDC team before PI 2 sprint planning", owner: "PDC Team" },
    { priority: "PI READINESS", category: "Demo Readiness", action: "Schedule Batch 3 TDC Reference Data demo with Roger team — confirm Orchestrator-facing contract is sufficient for current sprint", owner: "TDC + Roger Team" },
    { priority: "GOVERNANCE", category: "Open Decision", action: "Resolve DEP-04: Engagement code ownership between EODS and CEM before Batch 5 contract sign-off", owner: "EODS + CEM + Architecture" },
  ];

  // ── Plain-text export ─────────────────────────────────────────────────────
  const plainText = useMemo(() => {
    if (!generated) return "";
    const ts = generatedAt || "";
    const lines: string[] = [
      `DCT Platform — BA Touchpoint Summary`,
      `Roger + DCT Alignment Session`,
      `Generated: ${ts}`,
      `Qualifying Filter: ${qualifyingStatuses.join(", ")}`,
      ``,
      `═══════════════════════════════════════════════════════`,
      `SECTION 1 — EXECUTIVE SUMMARY`,
      `═══════════════════════════════════════════════════════`,
      `Platform Health: ${platformHealth}`,
      `Completed / Delivered Batches: ${completedCount}`,
      `Ready for QA: ${qaReadyCount}`,
      `Demo-Ready Capabilities: ${demoReadyCount}`,
      `Roger-Ready Data Points: ${rogerReadyPoints} of ${rogerTotalPoints}`,
      `APIs Delivered: ${apisDelivered} of ${ALL_SWAGGER.length}`,
      `APIs Missing / Unpublished: ${apisMissing}`,
      ``,
      `═══════════════════════════════════════════════════════`,
      `SECTION 2 — DELIVERED WORK BY BATCH`,
      `═══════════════════════════════════════════════════════`,
      ...qualifyingBatches.flatMap(b => {
        const live = statuses[b.key as BatchKey] || b.status;
        return [
          ``,
          `${b.label}`,
          `Status: ${live}`,
          `Owner: ${b.owner}`,
          `Delivered:`,
          ...b.delivered.map(d => `  • ${d}`),
          `Readiness: ${b.readiness}`,
          b.open.length > 0 ? `Open Items:\n${b.open.map(o => `  • ${o}`).join("\n")}` : `Open Items: None`,
        ];
      }),
      ``,
      `═══════════════════════════════════════════════════════`,
      `SECTION 3 — SWAGGER / API COVERAGE`,
      `═══════════════════════════════════════════════════════`,
      `Total Endpoints: ${ALL_SWAGGER.length}`,
      `Delivered: ${apisDelivered}`,
      `Missing / Unpublished: ${apisMissing}`,
      ``,
      ...ALL_SWAGGER.flatMap(e => [
        `${e.endpoint} [${e.batch}]`,
        `  Path: ${e.path}`,
        `  Status: ${e.status}`,
        `  Consumer Guide: ${e.consumerGuide}`,
        e.missingFromSwagger ? `  ⚠ MISSING FROM SWAGGER` : "",
        e.missingFromGuide ? `  ⚠ MISSING FROM CONSUMER GUIDE` : "",
        `  Notes: ${e.notes}`,
        ``,
      ]).filter(l => l !== ""),
      `═══════════════════════════════════════════════════════`,
      `SECTION 4 — ROGER UI DATA AVAILABILITY`,
      `═══════════════════════════════════════════════════════`,
      `Available: ${rogerReadyPoints} | Partial: ${ALL_ROGER.filter(d => d.availability === "Partially Available").length} | Not Available: ${ALL_ROGER.filter(d => d.availability === "Not Available").length}`,
      ``,
      ...ALL_ROGER.flatMap(d => [
        `${d.dataPoint} [${d.batch}]`,
        `  Availability: ${d.availability === "Available" ? "🟢" : d.availability === "Partially Available" ? "🟡" : "🔴"} ${d.availability}`,
        `  API: ${d.apiEndpoint}`,
        `  Notes: ${d.notes}`,
        ``,
      ]),
      `═══════════════════════════════════════════════════════`,
      `SECTION 5 — RISKS & BLOCKERS`,
      `═══════════════════════════════════════════════════════`,
      ...RISKS.flatMap(r => [
        `[${r.severity}] ${r.description}`,
        `  Batch: ${r.batch} | Owner: ${r.owner}`,
        `  Roger Impact: ${r.rogerImpact}`,
        `  Action: ${r.action}`,
        ``,
      ]),
      `═══════════════════════════════════════════════════════`,
      `SECTION 6 — DEPENDENCIES`,
      `═══════════════════════════════════════════════════════`,
      ...DEPENDENCIES.flatMap(d => [
        `[${d.type}] ${d.from} → ${d.to}`,
        `  ${d.description}`,
        `  Status: ${d.status}`,
        `  Impact: ${d.impact}`,
        ``,
      ]),
      `═══════════════════════════════════════════════════════`,
      `SECTION 7 — OPEN DECISIONS`,
      `═══════════════════════════════════════════════════════`,
      ...DECISIONS.flatMap(d => [
        `${d.id}: ${d.decision}`,
        `  Owner: ${d.owner} | Batches: ${d.batches}`,
        `  Deadline: ${d.deadline}`,
        `  Recommendation: ${d.recommendation}`,
        `  Risk if Unresolved: ${d.risk}`,
        ``,
      ]),
      `═══════════════════════════════════════════════════════`,
      `SECTION 8 — RECOMMENDED NEXT ACTIONS`,
      `═══════════════════════════════════════════════════════`,
      ...ACTIONS.map(a => `[${a.priority}] ${a.action}\n  Category: ${a.category} | Owner: ${a.owner}`),
      ``,
      `─────────────────────────────────────────────────────`,
      `DCT Platform · RSM | CATT · Generated ${ts}`,
    ];
    return lines.join("\n");
  }, [generated, generatedAt, qualifyingBatches, qualifyingStatuses, statuses, platformHealth, completedCount, qaReadyCount, demoReadyCount, rogerReadyPoints, apisDelivered, apisMissing]);

  const handleGenerate = () => {
    const ts = new Date().toLocaleString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
    setGeneratedAt(ts);
    setGenerated(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleSendToTeams = () => {
    window.open(`https://teams.microsoft.com/l/chat/0/0?message=${encodeURIComponent(plainText.slice(0, 4000))}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`DCT Platform — BA Touchpoint Summary (${generatedAt})`);
    const body = encodeURIComponent(plainText.slice(0, 2000) + "\n\n[Full summary — see attached or Control Panel]");
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const priorityColor: Record<string, string> = {
    "IMMEDIATE": "bg-red-100 text-red-800",
    "THIS SPRINT": "bg-amber-100 text-amber-800",
    "PI READINESS": "bg-blue-100 text-blue-800",
    "GOVERNANCE": "bg-purple-100 text-purple-800",
  };

  const severityColor: Record<string, string> = {
    "HIGH": "bg-red-100 text-red-800",
    "MEDIUM": "bg-amber-100 text-amber-800",
    "LOW": "bg-slate-100 text-slate-600",
  };

  const depStatusColor: Record<string, string> = {
    "Blocked": "bg-red-100 text-red-700",
    "Pending": "bg-amber-100 text-amber-700",
    "Active": "bg-blue-100 text-blue-800",
    "Partial": "bg-orange-100 text-orange-800",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/control-panel" className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#003865] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Control Panel
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#003865]">BA Touchpoint Summary</h1>
          <p className="text-sm text-slate-500 mt-0.5">Roger + DCT Alignment Session · Auto-generated from governed platform state</p>
          {generatedAt && (
            <p className="text-xs text-slate-400 mt-0.5">Generated: {generatedAt}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {generated && (
            <>
              <button onClick={handleEmail} className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200">
                <FileText className="w-3.5 h-3.5" /> Email Summary
              </button>
              <button onClick={handleSendToTeams} className="flex items-center gap-1.5 text-xs font-semibold bg-[#464EB8] text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                <Send className="w-3.5 h-3.5" /> Send to Teams
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy All"}
              </button>
            </>
          )}
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 text-sm font-bold bg-[#003865] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            {generated ? "Regenerate Summary" : "Generate BA Touchpoint Summary"}
          </button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-slate-600 mb-1">FILTER — Qualifying Statuses</div>
          <div className="flex flex-wrap gap-1.5">
            {QUALIFYING_STATUSES.map(s => (
              <Pill key={s} label={s} bg={STATUS_PILL[s].bg} text={STATUS_PILL[s].text} />
            ))}
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={includeStretch} onChange={e => setIncludeStretch(e.target.checked)} className="w-3 h-3 accent-[#003865]" />
              <Pill label="+ Stretch" bg={includeStretch ? "bg-cyan-100" : "bg-slate-100"} text={includeStretch ? "text-cyan-800" : "text-slate-500"} />
            </label>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Qualifying batches</div>
          <div className="text-2xl font-bold text-[#003865]">{qualifyingBatches.length}</div>
          <div className="text-xs text-slate-400">of {ALL_BATCHES.length} total</div>
        </div>
      </div>

      {!generated && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
          <Activity className="w-10 h-10 text-blue-300 mx-auto mb-3" />
          <div className="text-base font-semibold text-blue-800 mb-1">Ready to Generate</div>
          <p className="text-sm text-blue-600 max-w-md mx-auto">Click <strong>Generate BA Touchpoint Summary</strong> to produce an 8-section Roger + DCT alignment summary filtered to {qualifyingBatches.length} qualifying batch{qualifyingBatches.length !== 1 ? "es" : ""}.</p>
        </div>
      )}

      {generated && (
        <>
          {/* ── Section 1: Executive Summary ── */}
          <SectionCard id="SECTION 1" title="Executive Summary" icon={<Zap className="w-4 h-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Completed / Delivered", value: completedCount, color: "text-emerald-700" },
                { label: "Ready for QA", value: qaReadyCount, color: "text-amber-700" },
                { label: "Demo-Ready Capabilities", value: demoReadyCount, color: "text-purple-700" },
                { label: "Roger-Ready Data Points", value: `${rogerReadyPoints}/${rogerTotalPoints}`, color: "text-blue-700" },
              ].map(m => (
                <div key={m.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 mb-1">API Readiness</div>
                <div className="text-sm font-bold text-[#003865]">{apisDelivered} of {ALL_SWAGGER.length} delivered</div>
                <div className="text-xs text-red-600">{apisMissing} missing / unpublished</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-semibold text-slate-500 mb-1">Critical Roger Risks</div>
                <div className="text-sm font-bold text-red-700">{RISKS.filter(r => r.severity === "HIGH").length} HIGH severity</div>
                <div className="text-xs text-slate-500">{RISKS.filter(r => r.severity === "MEDIUM").length} MEDIUM · {RISKS.filter(r => r.severity === "LOW").length} LOW</div>
              </div>
              <div className={`border rounded-lg p-3 ${healthColor}`}>
                <div className="text-xs font-semibold mb-1 opacity-70">Platform Health</div>
                <div className="text-sm font-bold">{platformHealth}</div>
                <div className="text-xs opacity-70">{qualifyingBatches.length} qualifying batches</div>
              </div>
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-3">
              <strong>Qualifying filter applied:</strong> {qualifyingStatuses.join(", ")}. Batches in Not Started, Blocked, In Progress, MVP, or Backlog status are excluded from this summary per BA Touchpoint governance rules.
            </div>
          </SectionCard>

          {/* ── Section 2: Delivered Work (Batches 1–7) ── */}
          <SectionCard id="SECTION 2" title="Delivered Work (Batches 1–7)" icon={<CheckCircle2 className="w-4 h-4" />}>
            <div className="text-sm text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4 italic">
              Delivery through Batch 7 establishes the foundation for entity structure, governed workflow, and eligibility required for tax-ready outputs.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 w-20">Batch</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 w-28">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Key Delivered Capabilities</th>
                  </tr>
                </thead>
                <tbody>
                  {ALL_BATCHES.filter(b => {
                    const keys = ["foundation-core","1","2","2a","3","4","5","6","7"];
                    return keys.includes(b.key);
                  }).map(b => {
                    const live = statuses[b.key as BatchKey] || b.status as BatchStatus;
                    const pill = STATUS_PILL[live] || STATUS_PILL["Not Started"];
                    const caps = b.delivered.filter(d => !d.toLowerCase().includes("in progress")).slice(0, 2);
                    return (
                      <tr key={b.key} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-mono text-slate-500 align-top">
                          {b.key === "foundation-core" ? "FC" : b.key === "2a" ? "B2A" : `B${b.key}`}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-800 align-top">{b.label.replace(/^Batch \S+ — /, "").replace(/^Foundation Core$/, "Foundation Core")}</td>
                        <td className="px-3 py-2.5 align-top">
                          <Pill label={live} bg={pill.bg} text={pill.text} />
                        </td>
                        <td className="px-3 py-2.5 align-top">
                          {caps.length > 0 ? (
                            <ul className="space-y-0.5">
                              {caps.map((c, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-slate-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{c}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-slate-400 italic">In progress</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* ── Section 3: API / Endpoint + Roger UI Availability (Batches 2–7) ── */}
          <SectionCard id="SECTION 3" title="API / Endpoint View — Batches 2–7" icon={<FileText className="w-4 h-4" />}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-3 py-2 font-semibold text-slate-600">Endpoint</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 w-20">Batch</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 w-32">Status</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 w-36">Roger UI Data Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Batches 2–7 only, sorted by batch then endpoint
                    const b27 = ["Batch 2","Batch 2A","Batch 3","Batch 4","Batch 5","Batch 6","Batch 7"];
                    const rows = ALL_SWAGGER
                      .filter(e => b27.includes(e.batch))
                      .sort((a, b) => b27.indexOf(a.batch) - b27.indexOf(b.batch));
                    return rows.map((e, i) => {
                      // Find Roger availability for this endpoint
                      const roger = ALL_ROGER.find(r => r.apiEndpoint === e.path || r.batch === e.batch && r.apiEndpoint !== "—");
                      const avail: RogerAvailability = roger?.availability ?? "Not Available";
                      const rogerPill = ROGER_PILL[avail];
                      const statusBg = e.status === "Delivered" ? "bg-emerald-100" : e.status === "In Progress" ? "bg-blue-100" : e.status === "Missing" ? "bg-red-100" : "bg-amber-100";
                      const statusText = e.status === "Delivered" ? "text-emerald-800" : e.status === "In Progress" ? "text-blue-800" : e.status === "Missing" ? "text-red-700" : "text-amber-800";
                      const availBg = avail === "Available" ? "bg-emerald-100" : avail === "Partially Available" ? "bg-amber-100" : "bg-slate-100";
                      const availText = avail === "Available" ? "text-emerald-800" : avail === "Partially Available" ? "text-amber-800" : "text-slate-500";
                      const availLabel = avail === "Available" ? "🟢 Available" : avail === "Partially Available" ? "🟡 Partial" : "□ Not Available";
                      return (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-3 py-2.5">
                            <div className="font-medium text-slate-800">{e.endpoint}</div>
                            <div className="text-slate-400 font-mono text-[10px] mt-0.5">{e.path}</div>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600 font-medium">{e.batch}</td>
                          <td className="px-3 py-2.5">
                            <Pill label={e.status === "Needs PO/Dev Confirmation" ? "Needs Confirmation" : e.status} bg={statusBg} text={statusText} />
                          </td>
                          <td className="px-3 py-2.5">
                            <Pill label={availLabel} bg={availBg} text={availText} />
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Available — data visible in Roger UI</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Partial — some fields available, incomplete</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block"></span> Not Available — no UI consumption yet</span>
            </div>
          </SectionCard>

          {/* ── Section 4: Risks & Blockers ── */}
          <SectionCard id="SECTION 4" title="Risks & Blockers" icon={<AlertTriangle className="w-4 h-4" />}>
            <div className="space-y-3">
              {RISKS.map((r, i) => (
                <div key={i} className={`border rounded-lg p-4 ${r.severity === "HIGH" ? "border-red-200 bg-red-50" : r.severity === "MEDIUM" ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div className="font-semibold text-sm text-slate-800">{r.description}</div>
                    <Pill label={r.severity} bg={severityColor[r.severity].split(" ")[0]} text={severityColor[r.severity].split(" ")[1]} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div><span className="font-semibold text-slate-500">Batch:</span> <span className="text-slate-700">{r.batch}</span></div>
                    <div><span className="font-semibold text-slate-500">Owner:</span> <span className="text-slate-700">{r.owner}</span></div>
                    <div><span className="font-semibold text-slate-500">Roger Impact:</span> <span className="text-slate-700">{r.rogerImpact}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded px-2 py-1.5">
                    <span className="font-semibold">Action:</span> {r.action}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Section 5: Dependencies ── */}
          <SectionCard id="SECTION 5" title="Dependencies" icon={<Link2 className="w-4 h-4" />}>
            <div className="space-y-3">
              {DEPENDENCIES.map((d, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Pill label={d.type} bg="bg-slate-200" text="text-slate-700" />
                      <span className="text-sm font-semibold text-slate-800">{d.from} → {d.to}</span>
                    </div>
                    <Pill label={d.status} bg={depStatusColor[d.status].split(" ")[0]} text={depStatusColor[d.status].split(" ")[1]} />
                  </div>
                  <div className="text-xs text-slate-600">{d.description}</div>
                  <div className="text-xs text-amber-700 mt-1"><span className="font-semibold">Impact:</span> {d.impact}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Section 6: Open Decisions ── */}
          <SectionCard id="SECTION 6" title="Open Decisions" icon={<Shield className="w-4 h-4" />}>
            <div className="space-y-3">
              {DECISIONS.map((d, i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div>
                      <span className="text-xs font-bold text-[#003865] bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 mr-2">{d.id}</span>
                      <span className="text-sm font-semibold text-slate-800">{d.decision}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                    <div><span className="font-semibold text-slate-500">Owner:</span> <span className="text-slate-700">{d.owner}</span></div>
                    <div><span className="font-semibold text-slate-500">Batches:</span> <span className="text-slate-700">{d.batches}</span></div>
                    <div><span className="font-semibold text-slate-500">Deadline:</span> <span className="text-amber-700 font-medium">{d.deadline}</span></div>
                  </div>
                  <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-2 py-1.5 mb-1.5">
                    <span className="font-semibold">Recommendation:</span> {d.recommendation}
                  </div>
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
                    <span className="font-semibold">Risk if Unresolved:</span> {d.risk}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Section 7: Recommended Next Actions ── */}
          <SectionCard id="SECTION 7" title="Recommended Next Actions" icon={<CheckCircle2 className="w-4 h-4" />}>
            <div className="space-y-2">
              {ACTIONS.map((a, i) => (
                <div key={i} className="flex items-start gap-3 border border-slate-200 rounded-lg p-3 bg-white">
                  <Pill label={a.priority} bg={priorityColor[a.priority].split(" ")[0]} text={priorityColor[a.priority].split(" ")[1]} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-slate-800">{a.action}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{a.category} · Owner: {a.owner}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Export bar ── */}
          <div className="bg-[#003865] rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-bold text-white">Export BA Touchpoint Summary</div>
              <div className="text-xs text-blue-200">Generated: {generatedAt}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={handleEmail} className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                <FileText className="w-3.5 h-3.5" /> Email Summary
              </button>
              <button onClick={handleSendToTeams} className="flex items-center gap-1.5 text-xs font-semibold bg-[#464EB8] text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                <Send className="w-3.5 h-3.5" /> Send to Teams
              </button>
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold bg-white text-[#003865] px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors font-bold">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy All Sections"}
              </button>
            </div>
          </div>
        </>
      )}

      <footer className="pt-2 pb-1 border-t border-slate-100">
        <div className="text-xs text-slate-400">DCT Platform BA Touchpoint Summary · RSM | CATT · Reads from governed BatchStatusContext · {generatedAt || "Not yet generated"}</div>
      </footer>
    </div>
  );
}
