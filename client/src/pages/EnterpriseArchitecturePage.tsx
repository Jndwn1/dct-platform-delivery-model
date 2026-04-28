// Enterprise Architecture — Executive Platform Overview
// RSM | CATT | DCT Platform · For leadership, product owners, and architects

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Database, Brain, Users, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PLATFORM_SYSTEMS = [
  {
    id: "PDC",
    name: "PDC — Phoenix Data Consolidation",
    subtitle: "Cross-LOB Financial System of Record",
    owner: "DCT Team",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: Database,
    role: "Ingests, normalizes, and persists all financial data. Single source of financial truth across all Lines of Business.",
    responsibilities: [
      "Receives financial files via Service Bus (NEW_FILE_EVENT)",
      "Assigns immutable DocumentId and JobId",
      "Persists IngestionJob, SourceFile, and FinancialFact records",
      "Enforces FirmTaxonomyId on every FinancialFact (Batch 2A)",
      "Issues READY signal when all records are CLASSIFIED",
      "Provides RunId and SourceRecordId as lineage anchors",
    ],
    boundaries: [
      "Does NOT derive TaxYear — temporal model uses periodStart + periodEnd",
      "Does NOT invoke the AI Orchestrator",
      "Does NOT store tax decisions — those belong to TDC",
    ],
    batch: "Foundation Core",
    status: "Active",
  },
  {
    id: "Orchestrator",
    name: "AI Orchestrator",
    subtitle: "Stateless AI Execution Engine",
    owner: "Roger Team",
    color: "#2563eb",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Brain,
    role: "Sequences the AI agent pipeline. Coordinates PDC and TDC via APIs. Stateless — no direct database access.",
    responsibilities: [
      "Invoked exactly once per file by PDC (PROCESSING trigger)",
      "Runs 4-agent pipeline: File Recognizer → Normalizer → Cross-LOB Mapper → Tax Mapper",
      "Calls PDC API to persist normalized records (with FirmTaxonomyId — Batch 2A)",
      "Calls TDC API to persist tax mapping proposals",
      "Returns control to PDC after all agents complete",
    ],
    boundaries: [
      "Stateless — no direct DB writes",
      "All persistence flows through PDC or TDC APIs only",
      "Does NOT make tax decisions — proposals only",
      "Batch 2A Gap: not yet returning FirmTaxonomyId with normalized records",
    ],
    batch: "Batch 2",
    status: "Active",
    gap: true,
  },
  {
    id: "TDC",
    name: "TDC — Tax Data Consolidation",
    subtitle: "Tax System of Record · Immutable Decisions",
    owner: "DCT Team",
    color: "#dc2626",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: Shield,
    role: "Persists all tax mapping proposals, practitioner decisions, and finalized tax-ready records. Immutable once locked.",
    responsibilities: [
      "Receives tax mapping proposals from AI Orchestrator",
      "Assigns TdcRecordId and preserves full lineage chain",
      "Stores confidence bands (GREEN / YELLOW / RED) per record",
      "Supports practitioner review, approval, and override",
      "Derives TaxYear from periodStart + periodEnd (only system that does so)",
      "Finalizes TAX_READY records — terminal and immutable",
    ],
    boundaries: [
      "Does NOT invoke the AI Orchestrator",
      "Does NOT accept TaxYear as an input — derives it internally",
      "Locked records cannot be deleted or mutated",
      "Roger has read-only access via API Gateway",
    ],
    batch: "Batch 3",
    status: "Active",
  },
  {
    id: "Taxonomy",
    name: "Taxonomy Service",
    subtitle: "FirmTaxonomyId Authority · Classification Hierarchy",
    owner: "DCT / TDC Team",
    color: "#7c3aed",
    bg: "bg-violet-50",
    border: "border-violet-200",
    icon: Database,
    role: "Provides the authoritative firm and cross-LOB taxonomy hierarchy. FirmTaxonomyId is the classification key required on every FinancialFact record.",
    responsibilities: [
      "Maintains firm taxonomy hierarchy and versioning",
      "Issues FirmTaxonomyId (GUID) for each taxonomy entry",
      "Provides read-only API for Orchestrator (Agent 3) and TDC",
      "Taxonomy versions are append-only — no retroactive changes",
    ],
    boundaries: [
      "Read-only API — no external system can modify taxonomy entries",
      "FirmTaxonomyId is immutable once assigned to a record",
      "Batch 2A: Orchestrator contract must be updated to call this service",
    ],
    batch: "Batch 2A",
    status: "Proposed",
    gap: true,
  },
  {
    id: "Roger",
    name: "Roger Web Application",
    subtitle: "Practitioner UI · Read-Only Consumer",
    owner: "Roger Team",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: Users,
    role: "Practitioner-facing interface for reviewing, approving, and overriding tax mapping proposals. Read-only consumer of TDC.",
    responsibilities: [
      "Displays tax mapping proposals with confidence bands",
      "Surfaces pending vs decided distribution per entity/period",
      "Allows practitioner approve / correct / override actions",
      "Provides full lineage trace to source file",
      "Supports book-to-tax adjustment workflow (Batch 6)",
    ],
    boundaries: [
      "No write access to PDC — read-only consumer",
      "All data consumed via TDC API Gateway",
      "Cannot modify locked TDC records",
      "Does NOT access the AI Orchestrator directly",
    ],
    batch: "Batch 4",
    status: "Active",
  },
];

const LINEAGE_CHAIN = [
  { id: "DocumentId", label: "DocumentId (GUID)", system: "Tax Portal", color: "#7c3aed", note: "Immutable lineage anchor — assigned at ingestion" },
  { id: "JobId", label: "JobId (GUID)", system: "Tax Portal / PDC", color: "#059669", note: "Tracks ingestion lifecycle" },
  { id: "FirmTaxonomyId", label: "FirmTaxonomyId (GUID)", system: "Taxonomy Service", color: "#7c3aed", note: "⚠ Batch 2A — classification key on every FinancialFact", highlight: true },
  { id: "RunId", label: "RunId (GUID)", system: "PDC", color: "#059669", note: "Batch traceability — versioned" },
  { id: "SourceRecordId", label: "SourceRecordId (GUID)", system: "PDC", color: "#059669", note: "Per-record unique identifier — globally unique" },
  { id: "TdcRecordId", label: "TdcRecordId (GUID)", system: "TDC", color: "#dc2626", note: "Tax record identifier — immutable once created" },
];

const BATCH_SUMMARY = [
  { id: "FC", name: "Foundation Core", description: "PDC schema lock, Service Bus contract, Tax Portal ingestion gate", status: "Done", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "B1", name: "Batch 1 — File Ingestion", description: "End-to-end file ingestion, IngestionJob lifecycle, DocumentId assignment", status: "Done", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { id: "B2", name: "Batch 2 — Normalization", description: "AI Orchestrator pipeline, FinancialFact persistence, Cross-LOB mapping", status: "Active", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { id: "B2A", name: "Batch 2A — Contract Enforcement", description: "FirmTaxonomyId REQUIRED on all FinancialFact records. Orchestrator contract update. PDC enforcement gate.", status: "Active", color: "bg-amber-100 text-amber-800 border-amber-200", highlight: true },
  { id: "B3", name: "Batch 3 — Tax Domain Authority", description: "TDC tax mapping proposals, confidence bands, TdcRecordId lineage", status: "Planned", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "B4", name: "Batch 4 — AI Tax Mapping", description: "Roger primary read contract, confidence band display, practitioner review", status: "Planned", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "B5", name: "Batch 5 — Entity Identity", description: "Entity identity resolution, cross-LOB entity matching", status: "Planned", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { id: "B6", name: "Batch 6 — Practitioner Review", description: "Book-to-tax adjustments, sign-off, lock, TAX_READY finalization", status: "Planned", color: "bg-slate-100 text-slate-700 border-slate-200" },
];

const GOVERNANCE_PRINCIPLES = [
  { id: "G1", principle: "PDC = Financial Truth", detail: "All financial data authority flows through PDC. No other system stores canonical financial records." },
  { id: "G2", principle: "TDC = Tax Decision Authority", detail: "All tax decisions are persisted immutably in TDC. TDC is the only system that derives TaxYear." },
  { id: "G3", principle: "Orchestrator is Stateless", detail: "The AI Orchestrator has no direct database access. All persistence flows through PDC or TDC APIs." },
  { id: "G4", principle: "Roger is Read-Only", detail: "Roger has no write access to PDC. All data is consumed via the TDC API Gateway." },
  { id: "G5", principle: "Lineage is Immutable", detail: "DocumentId → SourceRecordId → TdcRecordId chain is established once and never modified." },
  { id: "G6", principle: "FirmTaxonomyId is Required (Batch 2A)", detail: "Every FinancialFact record must carry a FirmTaxonomyId. PDC rejects records missing this field after Batch 2A." },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

type Section = "overview" | "lineage" | "batches" | "governance";

export default function EnterpriseArchitecturePage() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);

  const sections: { id: Section; label: string }[] = [
    { id: "overview", label: "System Overview" },
    { id: "lineage", label: "Lineage Chain" },
    { id: "batches", label: "Batch Roadmap" },
    { id: "governance", label: "Governance Principles" },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F2A5C] to-[#1a3a7a] rounded-xl px-6 py-5">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-1">RSM CATT · DCT Platform</div>
        <h1 className="text-xl font-bold text-white mb-1">Enterprise Architecture</h1>
        <p className="text-xs text-blue-200 max-w-3xl">
          Executive-level view of the DCT Platform — system ownership, governance boundaries, lineage chain, and batch delivery roadmap.
          Designed for leadership, product owners, and enterprise architects.
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: "5 Platform Systems", color: "bg-white/10 text-white border-white/20" },
            { label: "6-Link Lineage Chain", color: "bg-white/10 text-white border-white/20" },
            { label: "8 Delivery Batches", color: "bg-white/10 text-white border-white/20" },
            { label: "⚠ Batch 2A: FirmTaxonomyId Gap", color: "bg-amber-500/20 text-amber-200 border-amber-400/30 font-semibold" },
          ].map(tag => (
            <span key={tag.label} className={`text-xs border px-2.5 py-1 rounded-full ${tag.color}`}>{tag.label}</span>
          ))}
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSection === s.id
                ? "bg-white text-[#003A8F] shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* SYSTEM OVERVIEW */}
        {activeSection === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Systems — Ownership &amp; Boundaries
            </div>
            {/* Flow diagram */}
            <div className="bg-white border border-border rounded-xl px-5 py-4">
              <div className="text-xs font-bold text-slate-700 mb-3">End-to-End Platform Flow</div>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { label: "Tax Portal", sub: "Ingestion Gate", color: "#7c3aed" },
                  null,
                  { label: "Service Bus", sub: "Event Trigger", color: "#64748b" },
                  null,
                  { label: "PDC", sub: "Financial Data", color: "#059669" },
                  null,
                  { label: "Orchestrator", sub: "AI Pipeline", color: "#2563eb" },
                  null,
                  { label: "PDC (Classified)", sub: "FirmTaxonomyId ✓", color: "#059669" },
                  null,
                  { label: "TDC", sub: "Tax Decisions", color: "#dc2626" },
                  null,
                  { label: "Roger", sub: "Read-Only UI", color: "#f97316" },
                ].map((item, i) =>
                  item === null ? (
                    <ArrowRight key={i} className="w-4 h-4 text-slate-300 shrink-0" />
                  ) : (
                    <div key={i} className="text-center">
                      <div className="text-xs font-bold text-white px-3 py-2 rounded-lg" style={{ backgroundColor: item.color }}>
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* System cards */}
            <div className="grid grid-cols-1 gap-3">
              {PLATFORM_SYSTEMS.map(sys => (
                <div key={sys.id} className={`border rounded-xl overflow-hidden ${sys.gap ? "border-amber-200" : sys.border}`}>
                  <button
                    onClick={() => setExpandedSystem(expandedSystem === sys.id ? null : sys.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: sys.color + "20" }}>
                      <sys.icon className="w-5 h-5" style={{ color: sys.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-foreground">{sys.name}</div>
                      <div className="text-xs text-muted-foreground">{sys.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">Owner: {sys.owner}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                        sys.status === "Active" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                        sys.status === "Proposed" ? "bg-amber-50 text-amber-800 border-amber-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>{sys.status}</span>
                      {sys.gap && <span className="text-xs bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">⚠ Gap</span>}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedSystem === sys.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`px-5 py-4 border-t border-border ${sys.bg}`}>
                          <p className="text-xs text-slate-700 mb-4">{sys.role}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Responsibilities</div>
                              <ul className="space-y-1">
                                {sys.responsibilities.map((r, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                    <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" style={{ color: sys.color }} />{r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-2">Boundary Rules</div>
                              <ul className="space-y-1">
                                {sys.boundaries.map((b, i) => (
                                  <li key={i} className={`text-xs flex items-start gap-1.5 ${b.startsWith("Batch 2A") ? "text-amber-800 font-semibold" : "text-slate-600"}`}>
                                    <span className="text-red-500 shrink-0">✕</span>{b}
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
              ))}
            </div>
          </motion.div>
        )}

        {/* LINEAGE CHAIN */}
        {activeSection === "lineage" && (
          <motion.div key="lineage" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              End-to-End Lineage Chain — Immutable audit trail from ingestion to finalization
            </div>
            <div className="bg-white border border-border rounded-xl px-6 py-6">
              <div className="flex flex-col gap-0">
                {LINEAGE_CHAIN.map((link, i) => (
                  <div key={link.id}>
                    <div className={`flex items-start gap-4 p-4 rounded-xl ${link.highlight ? "bg-violet-50 border border-violet-200" : "bg-slate-50"}`}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-xs" style={{ backgroundColor: link.color }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className={`text-sm font-bold font-mono ${link.highlight ? "text-violet-800" : "text-foreground"}`}>{link.label}</code>
                          {link.highlight && <span className="text-xs bg-violet-100 text-violet-800 border border-violet-200 px-2 py-0.5 rounded-full font-bold">Batch 2A</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">System: {link.system}</div>
                        <div className={`text-xs mt-1 ${link.highlight ? "text-violet-700 font-medium" : "text-slate-600"}`}>{link.note}</div>
                      </div>
                    </div>
                    {i < LINEAGE_CHAIN.length - 1 && (
                      <div className="flex items-center justify-start pl-8 py-1">
                        <div className="w-0.5 h-4 bg-slate-200" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0F2A5C] rounded-xl px-5 py-4">
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Lineage Invariant</div>
              <p className="text-xs text-blue-100">
                The lineage chain is established once and is immutable. DocumentId is assigned by Tax Portal and flows through every downstream system.
                SourceRecordId is assigned by PDC and links every FinancialFact to its source document.
                TdcRecordId is assigned by TDC and links every tax decision to its financial origin.
                FirmTaxonomyId (Batch 2A) links every FinancialFact to its classification in the Taxonomy Service.
              </p>
            </div>
          </motion.div>
        )}

        {/* BATCH ROADMAP */}
        {activeSection === "batches" && (
          <motion.div key="batches" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Delivery Batch Roadmap — {BATCH_SUMMARY.length} batches
            </div>
            {BATCH_SUMMARY.map(batch => (
              <div key={batch.id} className={`border rounded-xl px-5 py-4 flex items-start gap-4 ${batch.highlight ? "border-amber-300 bg-amber-50" : "border-border bg-white"}`}>
                <div className="shrink-0">
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${batch.color}`}>{batch.id}</span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">{batch.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{batch.description}</div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {batch.status === "Done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {batch.status === "Active" && <Clock className="w-4 h-4 text-blue-500" />}
                  {batch.status === "Planned" && <Clock className="w-4 h-4 text-slate-400" />}
                  {batch.highlight && <AlertCircle className="w-4 h-4 text-amber-500" />}
                  <span className={`text-xs font-medium ${
                    batch.status === "Done" ? "text-emerald-700" :
                    batch.status === "Active" ? "text-blue-700" : "text-slate-500"
                  }`}>{batch.status}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* GOVERNANCE PRINCIPLES */}
        {activeSection === "governance" && (
          <motion.div key="governance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Governance Principles — Non-negotiable platform invariants
            </div>
            <div className="bg-[#0F2A5C] rounded-xl px-5 py-4 mb-2">
              <p className="text-xs text-blue-200">
                These principles define the governance boundaries of the DCT Platform. They are non-negotiable and apply to all systems,
                agents, and delivery batches. Any architectural decision that conflicts with these principles requires an ADR and explicit
                approval from the DCT architecture team.
              </p>
            </div>
            {GOVERNANCE_PRINCIPLES.map(p => (
              <div key={p.id} className={`border rounded-xl px-5 py-4 flex items-start gap-4 ${p.id === "G6" ? "border-violet-200 bg-violet-50" : "border-border bg-white"}`}>
                <div className="shrink-0">
                  <span className="text-xs font-bold text-slate-400">{p.id}</span>
                </div>
                <div>
                  <div className={`font-bold text-sm mb-1 ${p.id === "G6" ? "text-violet-800" : "text-foreground"}`}>{p.principle}</div>
                  <div className="text-xs text-muted-foreground">{p.detail}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Enterprise Architecture · RSM | CATT · v1.0 · Batch 2A FirmTaxonomyId enforcement pending</span>
          <span>Source of truth: Visio Architecture · platformData.ts</span>
        </div>
      </footer>
    </div>
  );
}
