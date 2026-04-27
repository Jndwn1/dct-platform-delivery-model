// Developer Architecture — API Contracts, Schema Definitions, Agent Interfaces
// RSM | CATT | DCT Platform · For engineering and architecture teams

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Database, Shield, GitBranch, ChevronDown, ChevronRight, Copy, CheckCircle2 } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const API_CONTRACTS = [
  {
    id: "PDC-01",
    system: "PDC",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    method: "POST",
    endpoint: "/api/pdc/ingestion/jobs",
    description: "Create a new IngestionJob when a NEW_FILE_EVENT is received from the Service Bus.",
    requestFields: [
      { name: "clientId", type: "GUID", required: true, note: "Registered client identifier" },
      { name: "entityId", type: "GUID", required: true, note: "Legal entity identifier" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable — assigned by Tax Portal" },
      { name: "jobId", type: "GUID", required: true, note: "Assigned by Tax Portal" },
      { name: "periodStart", type: "DateOnly", required: true, note: "ISO 8601 date" },
      { name: "periodEnd", type: "DateOnly", required: true, note: "Must be >= periodStart" },
      { name: "documentType", type: "enum", required: true, note: "TRIAL_BALANCE | K1 | W2 | 1099 | OTHER" },
      { name: "sourceSystem", type: "string", required: false, note: "Originating system name" },
    ],
    responseFields: [
      { name: "jobId", type: "GUID", note: "Primary tracking key" },
      { name: "status", type: "enum", note: "INGESTED (initial state)" },
      { name: "createdTimestamp", type: "datetime", note: "UTC ISO 8601" },
    ],
    invariants: ["TaxYear is NOT accepted — derived in TDC from periodStart", "documentId is immutable once assigned", "Duplicate jobId is idempotent"],
    batch: "Batch 1",
  },
  {
    id: "PDC-02",
    system: "PDC",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    method: "POST",
    endpoint: "/api/pdc/records/canonical",
    description: "Orchestrator persists normalized FinancialFact records and Cross-LOB taxonomy mappings. FirmTaxonomyId is REQUIRED per Batch 2A.",
    requestFields: [
      { name: "jobId", type: "GUID", required: true, note: "Links to IngestionJob" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable lineage anchor" },
      { name: "records[]", type: "FinancialFact[]", required: true, note: "Array of normalized records" },
      { name: "records[].accountCode", type: "string", required: true, note: "Source account code" },
      { name: "records[].amount", type: "decimal", required: true, note: "Monetary value" },
      { name: "records[].firmTaxonomyId", type: "GUID", required: true, note: "⚠ REQUIRED per Batch 2A — from Taxonomy Service" },
      { name: "records[].classificationStatus", type: "enum", required: true, note: "CLASSIFIED | UNCLASSIFIED | OVERRIDE" },
      { name: "records[].crossLobCategory", type: "string", required: true, note: "asset | liability | equity | income | expense" },
    ],
    responseFields: [
      { name: "runId", type: "GUID", note: "Batch traceability key" },
      { name: "records[].sourceRecordId", type: "GUID", note: "Per-record unique identifier" },
      { name: "status", type: "enum", note: "READY (if all records CLASSIFIED)" },
    ],
    invariants: [
      "READY signal is BLOCKED if any record has classificationStatus = UNCLASSIFIED",
      "firmTaxonomyId must reference a valid Taxonomy Service entry",
      "FinancialFact records are immutable once persisted",
      "sourceRecordId is globally unique",
    ],
    batch: "Batch 2 / 2A",
    highlight: true,
  },
  {
    id: "PDC-03",
    system: "PDC",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    method: "GET",
    endpoint: "/api/pdc/ingestion/status?jobId={jobId}",
    description: "Poll ingestion job status. Used by Orchestrator and monitoring agents.",
    requestFields: [
      { name: "jobId", type: "GUID", required: true, note: "Query parameter" },
    ],
    responseFields: [
      { name: "jobId", type: "GUID", note: "Primary key" },
      { name: "documentId", type: "GUID", note: "Immutable lineage anchor" },
      { name: "status", type: "enum", note: "INGESTED | PROCESSING | READY | FAILED" },
      { name: "firmTaxonomyId", type: "GUID", note: "Present after Batch 2A" },
    ],
    invariants: ["Status transitions are enum-driven and irreversible"],
    batch: "Batch 1",
  },
  {
    id: "TDC-01",
    system: "TDC",
    color: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    method: "POST",
    endpoint: "/api/tdc/records/proposals",
    description: "Orchestrator writes tax mapping proposals to TDC after AI Tax Mapper completes.",
    requestFields: [
      { name: "sourceRecordId", type: "GUID", required: true, note: "From PDC — lineage anchor" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable — from Tax Portal" },
      { name: "proposedTaxLine", type: "string", required: true, note: "Tax taxonomy line item" },
      { name: "confidenceBand", type: "enum", required: true, note: "GREEN | YELLOW | RED" },
      { name: "evidence", type: "string", required: true, note: "AI reasoning / evidence" },
      { name: "firmTaxonomyId", type: "GUID", required: true, note: "Passed from PDC record" },
    ],
    responseFields: [
      { name: "tdcRecordId", type: "GUID", note: "TDC primary key" },
      { name: "lineage", type: "object", note: "documentId → sourceRecordId → tdcRecordId" },
      { name: "status", type: "enum", note: "PROPOSED (initial state)" },
    ],
    invariants: [
      "tdcRecordId is globally unique",
      "Lineage chain is immutable once established",
      "ConfidenceBand is enum — not a free-text field",
      "TDC never invokes the AI Orchestrator",
    ],
    batch: "Batch 3",
  },
  {
    id: "TDC-02",
    system: "TDC",
    color: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    method: "GET",
    endpoint: "/api/tdc/records?entityId={id}&periodStart={date}&periodEnd={date}",
    description: "Roger primary read contract. Retrieves all tax mapping proposals and decisions for a given entity and period.",
    requestFields: [
      { name: "entityId", type: "GUID", required: true, note: "Query parameter" },
      { name: "periodStart", type: "DateOnly", required: true, note: "ISO 8601" },
      { name: "periodEnd", type: "DateOnly", required: true, note: "ISO 8601" },
    ],
    responseFields: [
      { name: "records[]", type: "TdcRecord[]", note: "All proposals and decisions" },
      { name: "records[].tdcRecordId", type: "GUID", note: "TDC primary key" },
      { name: "records[].confidenceBand", type: "enum", note: "GREEN | YELLOW | RED" },
      { name: "records[].firmTaxonomyId", type: "GUID", note: "From PDC record" },
      { name: "records[].status", type: "enum", note: "PROPOSED | ACCEPTED | OVERRIDDEN | LOCKED" },
    ],
    invariants: [
      "No taxYear parameter — scoped by periodStart + periodEnd only",
      "Roger has no write access through this endpoint",
      "Locked records are returned as read-only",
    ],
    batch: "Batch 4",
  },
  {
    id: "TAX-01",
    system: "Taxonomy Service",
    color: "#7c3aed",
    bg: "bg-violet-50",
    border: "border-violet-200",
    method: "GET",
    endpoint: "/api/taxonomy/firm/{firmTaxonomyId}",
    description: "Resolve a FirmTaxonomyId to its full taxonomy entry. Used by Orchestrator (Agent 3) and TDC for validation.",
    requestFields: [
      { name: "firmTaxonomyId", type: "GUID", required: true, note: "Path parameter" },
    ],
    responseFields: [
      { name: "firmTaxonomyId", type: "GUID", note: "Confirmed identifier" },
      { name: "label", type: "string", note: "Human-readable taxonomy label" },
      { name: "category", type: "string", note: "asset | liability | equity | income | expense" },
      { name: "version", type: "string", note: "Taxonomy version at time of classification" },
      { name: "effectiveDate", type: "DateOnly", note: "When this entry became active" },
    ],
    invariants: [
      "FirmTaxonomyId is immutable once assigned to a record",
      "Taxonomy versions are append-only — no retroactive changes",
      "Owned by DCT/TDC team",
    ],
    batch: "Batch 2A",
    highlight: true,
  },
];

const SCHEMA_DEFINITIONS = [
  {
    name: "FinancialFact",
    system: "PDC",
    color: "#059669",
    fields: [
      { name: "sourceRecordId", type: "GUID", required: true, note: "Primary key — globally unique" },
      { name: "jobId", type: "GUID", required: true, note: "FK → IngestionJob" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable lineage anchor" },
      { name: "runId", type: "GUID", required: true, note: "Batch traceability" },
      { name: "firmTaxonomyId", type: "GUID", required: true, note: "⚠ REQUIRED (Batch 2A) — FK → Taxonomy Service" },
      { name: "classificationStatus", type: "enum", required: true, note: "CLASSIFIED | UNCLASSIFIED | OVERRIDE" },
      { name: "accountCode", type: "string", required: true, note: "Source account code" },
      { name: "amount", type: "decimal", required: true, note: "Monetary value" },
      { name: "crossLobCategory", type: "string", required: true, note: "asset | liability | equity | income | expense" },
      { name: "periodStart", type: "DateOnly", required: true, note: "Period start" },
      { name: "periodEnd", type: "DateOnly", required: true, note: "Period end" },
      { name: "createdTimestamp", type: "datetime", required: true, note: "UTC ISO 8601" },
    ],
    batch2a: true,
  },
  {
    name: "TaxMappingProposal",
    system: "TDC",
    color: "#dc2626",
    fields: [
      { name: "tdcRecordId", type: "GUID", required: true, note: "Primary key — globally unique" },
      { name: "sourceRecordId", type: "GUID", required: true, note: "FK → PDC FinancialFact" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable lineage anchor" },
      { name: "firmTaxonomyId", type: "GUID", required: true, note: "Passed from PDC record" },
      { name: "proposedTaxLine", type: "string", required: true, note: "Tax taxonomy line item" },
      { name: "confidenceBand", type: "enum", required: true, note: "GREEN | YELLOW | RED" },
      { name: "evidence", type: "string", required: true, note: "AI reasoning / evidence text" },
      { name: "status", type: "enum", required: true, note: "PROPOSED | ACCEPTED | OVERRIDDEN | LOCKED" },
      { name: "decisionTimestamp", type: "datetime", required: false, note: "Set when practitioner acts" },
      { name: "decisionActor", type: "string", required: false, note: "Practitioner identity" },
    ],
    batch2a: false,
  },
  {
    name: "IngestionJob",
    system: "PDC",
    color: "#059669",
    fields: [
      { name: "jobId", type: "GUID", required: true, note: "Primary tracking key" },
      { name: "clientId", type: "GUID", required: true, note: "Registered client" },
      { name: "entityId", type: "GUID", required: true, note: "Legal entity" },
      { name: "documentId", type: "GUID", required: true, note: "Immutable — from Tax Portal" },
      { name: "periodStart", type: "DateOnly", required: true, note: "Period start" },
      { name: "periodEnd", type: "DateOnly", required: true, note: "Period end" },
      { name: "status", type: "enum", required: true, note: "INGESTED | PROCESSING | READY | FAILED" },
      { name: "createdTimestamp", type: "datetime", required: true, note: "UTC ISO 8601" },
      { name: "requestedBy", type: "string", required: false, note: "Originating user/system" },
    ],
    batch2a: false,
  },
];

const AGENT_INTERFACES = [
  {
    id: "Agent 1", name: "File Recognizer", owner: "Roger Team",
    color: "#7c3aed", stage: "Stage 1",
    inputs: ["Raw file content", "DocumentId (GUID)", "PDC canonical schemas (read via PDC API)"],
    outputs: ["DocumentType (enum)", "Recognized schema mapping", "Confidence score"],
    reads: ["PDC: GET /api/pdc/schemas/canonical"],
    writes: [],
    invariants: ["Stateless — no direct DB writes", "Reads PDC schemas read-only"],
  },
  {
    id: "Agent 2", name: "File Normalizer", owner: "Roger Team",
    color: "#7c3aed", stage: "Stage 1",
    inputs: ["Raw file content", "DocumentType (from Agent 1)", "Canonical schema"],
    outputs: ["Normalized FinancialFact records (in memory — not yet persisted)"],
    reads: ["PDC: GET /api/pdc/schemas/canonical/{type}"],
    writes: [],
    invariants: ["Stateless", "Output is normalized but NOT yet persisted — Agent 3 persists via PDC API"],
  },
  {
    id: "Agent 3", name: "Cross-LOB / Firm Taxonomy Mapper", owner: "Roger Team",
    color: "#d97706", stage: "Stage 2 (Batch 2A)",
    inputs: ["Normalized records (from Agent 2)", "Taxonomy Service API"],
    outputs: ["FirmTaxonomyId (GUID) per record", "ClassificationStatus per record", "Cross-LOB category per record"],
    reads: ["Taxonomy Service: GET /api/taxonomy/firm/{firmTaxonomyId}", "PDC: GET /api/pdc/taxonomy/crosslob"],
    writes: ["PDC: POST /api/pdc/records/canonical (with FirmTaxonomyId + ClassificationStatus)"],
    invariants: [
      "⚠ Batch 2A Gap: currently NOT returning FirmTaxonomyId",
      "FirmTaxonomyId REQUIRED on every record written to PDC",
      "READY signal blocked if any record is UNCLASSIFIED",
    ],
    highlight: true,
  },
  {
    id: "Agent 4", name: "Tax Taxonomy Mapper", owner: "Roger Team",
    color: "#7c3aed", stage: "Stage 3",
    inputs: ["SourceRecordId (from PDC)", "FirmTaxonomyId (from PDC)", "TDC tax taxonomy tables"],
    outputs: ["TaxMappingProposal per record", "ConfidenceBand (GREEN | YELLOW | RED)", "Evidence text"],
    reads: ["TDC: GET /api/tdc/taxonomy/rules", "PDC: GET /api/pdc/records/{sourceRecordId}"],
    writes: ["TDC: POST /api/tdc/records/proposals"],
    invariants: ["Stateless", "Reads TDC taxonomy read-only", "Writes proposals only — no decisions"],
  },
];

const ENFORCEMENT_RULES = [
  { id: "E-01", rule: "FirmTaxonomyId is REQUIRED on every PDC FinancialFact record", system: "PDC", batch: "Batch 2A", severity: "BLOCKING", status: "PROPOSED" },
  { id: "E-02", rule: "PDC rejects POST /api/pdc/records/canonical if any record has classificationStatus = UNCLASSIFIED", system: "PDC", batch: "Batch 2A", severity: "BLOCKING", status: "PROPOSED" },
  { id: "E-03", rule: "READY signal is blocked until all records have classificationStatus = CLASSIFIED or OVERRIDE", system: "PDC", batch: "Batch 2A", severity: "BLOCKING", status: "PROPOSED" },
  { id: "E-04", rule: "TaxYear is NOT accepted in any PDC API — temporal model uses periodStart + periodEnd only", system: "PDC", batch: "Batch 1", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-05", rule: "Orchestrator is invoked exactly once per file — no re-invocation on partial failure", system: "PDC → Orchestrator", batch: "Batch 2", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-06", rule: "Agents are stateless — all persistence must flow through PDC or TDC APIs", system: "Orchestrator", batch: "Batch 2", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-07", rule: "TDC never invokes the AI Orchestrator — no reverse dependency", system: "TDC", batch: "Batch 3", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-08", rule: "Roger has no write access to PDC — read-only consumer of TDC only", system: "Roger", batch: "Batch 4", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-09", rule: "Locked TDC records are immutable — mutation attempts are rejected and logged", system: "TDC", batch: "Batch 6", severity: "ENFORCED", status: "ACCEPTED" },
  { id: "E-10", rule: "DocumentId is immutable once assigned by Tax Portal — never regenerated", system: "Tax Portal", batch: "Batch 1", severity: "ENFORCED", status: "ACCEPTED" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800 border-blue-200",
    POST: "bg-green-100 text-green-800 border-green-200",
    PUT: "bg-amber-100 text-amber-800 border-amber-200",
    DELETE: "bg-red-100 text-red-800 border-red-200",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono ${colors[method] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
      {method}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-slate-400 hover:text-slate-700 transition-colors"
      title="Copy endpoint"
    >
      {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ApiContractCard({ contract }: { contract: typeof API_CONTRACTS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl overflow-hidden ${contract.highlight ? "border-violet-300 ring-1 ring-violet-200" : "border-border"}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 w-14 shrink-0">{contract.id}</span>
          <MethodBadge method={contract.method} />
          <code className="text-xs font-mono text-slate-800 truncate">{contract.endpoint}</code>
          {contract.highlight && (
            <span className="text-xs bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-full font-bold shrink-0">Batch 2A</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400">{contract.system}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{contract.batch}</span>
          <CopyButton text={contract.endpoint} />
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`px-5 py-4 border-t border-border ${contract.bg} space-y-4`}>
              <p className="text-xs text-slate-700">{contract.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Request Fields</div>
                  <div className="space-y-1.5">
                    {contract.requestFields.map(f => (
                      <div key={f.name} className="flex items-start gap-2">
                        <code className={`text-xs font-mono shrink-0 ${f.required ? "text-slate-800 font-bold" : "text-slate-500"}`}>{f.name}</code>
                        <span className="text-xs text-slate-400 font-mono">{f.type}</span>
                        {f.required && <span className="text-xs text-red-600 font-bold shrink-0">*</span>}
                        <span className="text-xs text-slate-500">{f.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Response Fields</div>
                  <div className="space-y-1.5">
                    {contract.responseFields.map(f => (
                      <div key={f.name} className="flex items-start gap-2">
                        <code className="text-xs font-mono text-slate-700 shrink-0">{f.name}</code>
                        <span className="text-xs text-slate-400 font-mono">{f.type}</span>
                        <span className="text-xs text-slate-500">{f.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Invariants</div>
                  <ul className="space-y-1">
                    {contract.invariants.map((inv, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                        <span className="text-red-500 shrink-0 mt-0.5">✕</span>{inv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

type Section = "api" | "schema" | "agents" | "enforcement";

export default function DeveloperArchitecturePage() {
  const [activeSection, setActiveSection] = useState<Section>("api");

  const sections: { id: Section; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "api", label: "API Contracts", icon: Code2, count: API_CONTRACTS.length },
    { id: "schema", label: "Schema Definitions", icon: Database, count: SCHEMA_DEFINITIONS.length },
    { id: "agents", label: "Agent Interfaces", icon: GitBranch, count: AGENT_INTERFACES.length },
    { id: "enforcement", label: "Enforcement Rules", icon: Shield, count: ENFORCEMENT_RULES.length },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="bg-[#0F2A5C] rounded-xl px-6 py-5">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">RSM CATT · DCT Platform</div>
        <h1 className="text-xl font-bold text-white mb-1">Developer Architecture</h1>
        <p className="text-xs text-blue-200">
          API contracts, schema definitions, agent interfaces, and enforcement rules for the DCT Platform.
          This view is authoritative for engineering implementation.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-white/10 text-white border border-white/20 px-2.5 py-1 rounded-full">PDC · TDC · Taxonomy Service · Roger</span>
          <span className="text-xs bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2.5 py-1 rounded-full font-semibold">⚠ Batch 2A: FirmTaxonomyId enforcement pending</span>
        </div>
      </div>

      {/* Batch 2A Gap Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl px-5 py-3">
        <div className="text-xs font-bold text-amber-900 mb-1">Batch 2A — Open Engineering Gap: FirmTaxonomyId Contract Enforcement</div>
        <div className="text-xs text-amber-800">
          The AI Orchestrator (Agent 3) is <strong>not currently returning FirmTaxonomyId</strong> with normalized records.
          PDC must enforce this field as REQUIRED on all FinancialFact records. The READY signal must be blocked
          if any record has <code className="font-mono bg-amber-100 px-1 rounded">classificationStatus = UNCLASSIFIED</code>.
          See API contract PDC-02 and enforcement rules E-01 through E-03.
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === s.id
                ? "bg-white text-[#003A8F] shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
            {s.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${activeSection === s.id ? "bg-[#003A8F]/10 text-[#003A8F]" : "bg-slate-200 text-slate-600"}`}>
                {s.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Section content */}
      <AnimatePresence mode="wait">
        {activeSection === "api" && (
          <motion.div key="api" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              API Contracts — {API_CONTRACTS.length} endpoints · Click any row to expand
            </div>
            {API_CONTRACTS.map(c => <ApiContractCard key={c.id} contract={c} />)}
          </motion.div>
        )}

        {activeSection === "schema" && (
          <motion.div key="schema" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Schema Definitions — {SCHEMA_DEFINITIONS.length} entities
            </div>
            {SCHEMA_DEFINITIONS.map(schema => (
              <div key={schema.name} className={`border rounded-xl overflow-hidden ${schema.batch2a ? "border-violet-300 ring-1 ring-violet-200" : "border-border"}`}>
                <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: schema.color + "18" }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: schema.color }} />
                  <span className="font-bold text-sm text-foreground">{schema.name}</span>
                  <span className="text-xs text-muted-foreground">{schema.system}</span>
                  {schema.batch2a && (
                    <span className="text-xs bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-full font-bold ml-auto">Batch 2A fields</span>
                  )}
                </div>
                <div className="px-5 py-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left border-b border-border">
                        <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider w-48">Field</th>
                        <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider w-28">Type</th>
                        <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider w-16">Req</th>
                        <th className="pb-2 font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.fields.map(f => (
                        <tr key={f.name} className={`border-b border-border last:border-0 ${f.note.startsWith("⚠") ? "bg-violet-50" : ""}`}>
                          <td className="py-2 pr-4">
                            <code className={`font-mono ${f.note.startsWith("⚠") ? "text-violet-800 font-bold" : "text-foreground"}`}>{f.name}</code>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground font-mono">{f.type}</td>
                          <td className="py-2 pr-4">
                            {f.required ? <span className="text-red-600 font-bold">✓</span> : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-2 text-muted-foreground">{f.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === "agents" && (
          <motion.div key="agents" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Interfaces — {AGENT_INTERFACES.length} agents · Stateless compute layer
            </div>
            {AGENT_INTERFACES.map(agent => (
              <div key={agent.id} className={`border rounded-xl overflow-hidden ${agent.highlight ? "border-amber-300 ring-1 ring-amber-200" : "border-border"}`}>
                <div className="px-5 py-3 flex items-center gap-3" style={{ backgroundColor: agent.color + "18" }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agent.color }} />
                  <span className="font-bold text-sm text-foreground">{agent.id} — {agent.name}</span>
                  <span className="text-xs text-muted-foreground">{agent.stage}</span>
                  <span className="text-xs text-muted-foreground ml-1">· {agent.owner}</span>
                  {agent.highlight && (
                    <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold ml-auto">⚠ Batch 2A Gap</span>
                  )}
                </div>
                <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">Inputs</div>
                      <ul className="space-y-1">
                        {agent.inputs.map((inp, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-blue-500 shrink-0">→</span>{inp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5">Outputs</div>
                      <ul className="space-y-1">
                        {agent.outputs.map((out, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-emerald-500 shrink-0">←</span>{out}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">API Reads</div>
                      {agent.reads.length > 0 ? (
                        <ul className="space-y-1">
                          {agent.reads.map((r, i) => <li key={i} className="text-xs font-mono text-blue-700 bg-blue-50 rounded px-2 py-1">{r}</li>)}
                        </ul>
                      ) : <span className="text-xs text-slate-400 italic">None</span>}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">API Writes</div>
                      {agent.writes.length > 0 ? (
                        <ul className="space-y-1">
                          {agent.writes.map((w, i) => <li key={i} className="text-xs font-mono text-emerald-700 bg-emerald-50 rounded px-2 py-1">{w}</li>)}
                        </ul>
                      ) : <span className="text-xs text-slate-400 italic">None — stateless</span>}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1.5">Invariants</div>
                      <ul className="space-y-1">
                        {agent.invariants.map((inv, i) => (
                          <li key={i} className={`text-xs flex items-start gap-1.5 ${inv.startsWith("⚠") ? "text-amber-800 font-semibold" : "text-slate-600"}`}>
                            <span className="text-red-500 shrink-0">✕</span>{inv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeSection === "enforcement" && (
          <motion.div key="enforcement" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Enforcement Rules — {ENFORCEMENT_RULES.length} rules · Non-negotiable platform invariants
            </div>
            {ENFORCEMENT_RULES.map(rule => (
              <div key={rule.id} className={`border rounded-xl px-5 py-4 flex items-start gap-4 ${
                rule.status === "PROPOSED" ? "border-amber-200 bg-amber-50" : "border-border bg-white"
              }`}>
                <div className="shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-slate-400">{rule.id}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{rule.rule}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{rule.system}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{rule.batch}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${
                      rule.severity === "BLOCKING"
                        ? "bg-red-50 text-red-800 border-red-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>{rule.severity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      rule.status === "PROPOSED"
                        ? "bg-amber-50 text-amber-800 border-amber-200"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200"
                    }`}>{rule.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Developer Architecture · RSM | CATT · v1.0 · Batch 2A FirmTaxonomyId enforcement pending</span>
          <span>Source of truth: Visio Architecture · platformData.ts</span>
        </div>
      </footer>
    </div>
  );
}
