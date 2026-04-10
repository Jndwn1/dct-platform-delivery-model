// ─────────────────────────────────────────────────────────────────────────────
// Batch Roadmap — Foundation Core + Batch 1–9
// STATUS: Driven by BatchStatusContext (global source of truth)
// Each batch card has an inline dropdown — the ONLY way to change status.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Shield, ArrowRight, Lock,
  Link2, FileText, Layers, Settings, CheckCircle2, Clock, Circle
} from "lucide-react";
import {
  useBatchStatus, type BatchKey, type BatchStatus,
  STATUS_STYLES, BATCH_LABELS
} from "@/contexts/BatchStatusContext";
import { useLocation } from "wouter";

// ─── BATCH DATA ───────────────────────────────────────────────────────────────
interface BatchDef {
  key: BatchKey;
  id: string;
  shortName: string;
  objective: string;
  primarySystem: string;
  keyGate: string;
  touchpoints: string[];
  tables?: string[];
  targetDate: string;
  batchLead: string;
  entryCondition: string;
  exitCondition: string;
}

const BATCHES: BatchDef[] = [
  {
    key: "foundation-core", id: "FC", shortName: "Foundation Core",
    objective: "Infrastructure setup: code repo, templates, Copilot Agent and Blitzy configuration, development environment.",
    primarySystem: "All Systems", keyGate: "All Gates",
    touchpoints: ["T1"], targetDate: "2026-03-14", batchLead: "Program Delivery Lead",
    entryCondition: "Project kickoff approved",
    exitCondition: "All infrastructure components operational; dev environment verified",
  },
  {
    key: "1", id: "B1", shortName: "File Ingestion",
    objective: "Establish file ingestion pipeline from Tax Portal through Phoenix/DMS into PDC with schema recognition.",
    primarySystem: "Phoenix/DMS + PDC", keyGate: "G1 — Schema Lock",
    touchpoints: ["T1", "T2", "T3"], tables: ["IngestionJob", "SourceFile", "SourceRecord"],
    targetDate: "2026-04-11", batchLead: "PDC Workstream Lead",
    entryCondition: "Foundation Core complete; dev environment operational",
    exitCondition: "Schema Lock Certificates issued; SourceRecord table populated",
  },
  {
    key: "2", id: "B2", shortName: "Normalization",
    objective: "Build normalization pipeline producing canonical financial records with cross-LOB taxonomy mappings.",
    primarySystem: "AI Orchestrator + PDC", keyGate: "G1 — Schema Lock",
    touchpoints: ["T3", "T4"], tables: ["NormalizedRecord", "CrossLOBTaxonomy", "CanonicalDataset"],
    targetDate: "2026-05-09", batchLead: "PDC Workstream Lead",
    entryCondition: "Batch 1 Schema Lock issued",
    exitCondition: "NormalizedRecord table populated; vNormalizedTb contract published",
  },
  {
    key: "3", id: "B3", shortName: "Tax Domain",
    objective: "Establish TDC as the tax domain system of record with tax taxonomy and authority boundaries.",
    primarySystem: "TDC", keyGate: "G2 — Invariant Lock",
    touchpoints: ["T4", "T5"], tables: ["TaxTaxonomy", "TaxAuthority", "InvariantRule"],
    targetDate: "2026-06-06", batchLead: "TDC Workstream Lead",
    entryCondition: "Batch 2 NormalizedRecord stable",
    exitCondition: "Invariant Lock Records issued; TaxTaxonomy table populated",
  },
  {
    key: "4", id: "B4", shortName: "AI Tax Mapping",
    objective: "Deploy AI Orchestrator for tax mapping proposals with confidence scores and evidence chains.",
    primarySystem: "AI Orchestrator + TDC", keyGate: "G3 — Contract Publication",
    touchpoints: ["T8", "T9"], tables: ["MappingProposal", "ConfidenceScore", "EvidenceChain"],
    targetDate: "2026-07-11", batchLead: "AI Workstream Lead",
    entryCondition: "Batch 3 Invariant Lock issued",
    exitCondition: "MappingProposal table populated; avg confidence ≥ 90%",
  },
  {
    key: "5", id: "B5", shortName: "Practitioner View",
    objective: "Surface tax mapping proposals and decisions in Roger UI for practitioner review.",
    primarySystem: "Roger UI + TDC", keyGate: "G3 — Contract Publication",
    touchpoints: ["T10", "T11"], tables: ["TaxDecision", "PractitionerReview"],
    targetDate: "2026-08-08", batchLead: "Roger Workstream Lead",
    entryCondition: "Batch 4 MappingProposal stable",
    exitCondition: "TaxDecision surfaced in Roger UI; practitioner review workflow operational",
  },
  {
    key: "6", id: "B6", shortName: "Review Workflow",
    objective: "Enable practitioners to review, adjust, and approve AI-generated tax mapping proposals.",
    primarySystem: "Roger UI + TDC", keyGate: "G4 — Lineage Closure",
    touchpoints: ["T9", "T10", "T11"], tables: ["AdjustmentRecord", "ApprovalLog"],
    targetDate: "2026-09-05", batchLead: "Roger Workstream Lead",
    entryCondition: "Batch 5 practitioner view operational",
    exitCondition: "Adjustment workflow complete; AdjustmentRecord table populated",
  },
  {
    key: "7", id: "B7", shortName: "Rollforward",
    objective: "Enable rollforward of prior year tax decisions and AI-assisted prior year comparison.",
    primarySystem: "TDC + AI Orchestrator", keyGate: "G4 — Lineage Closure",
    touchpoints: ["T5", "T8", "T9"], tables: ["RollforwardRecord", "PriorYearComparison"],
    targetDate: "2026-10-03", batchLead: "TDC Workstream Lead",
    entryCondition: "Batch 6 adjustment workflow stable",
    exitCondition: "RollforwardRecord table populated; prior year comparison available",
  },
  {
    key: "8", id: "B8", shortName: "Return Assembly",
    objective: "Assemble tax returns from TDC decisions, file with authorities, and close the lineage graph.",
    primarySystem: "TDC + PDC", keyGate: "G4 — Lineage Closure",
    touchpoints: ["T10", "T11"], tables: ["TaxReturn", "FilingRecord", "LineageClosure"],
    targetDate: "2026-11-07", batchLead: "Program Delivery Lead",
    entryCondition: "Batch 7 rollforward stable",
    exitCondition: "Lineage Closure Certificates issued; TaxReturn filed",
  },
  {
    key: "9", id: "B9", shortName: "Learning Gov.",
    objective: "Implement model feedback loop, governance controls, and continuous improvement for AI tax mapping.",
    primarySystem: "AI Orchestrator + TDC", keyGate: "All Gates",
    touchpoints: ["T2", "T8"], tables: ["ModelFeedback", "GovernanceLog"],
    targetDate: "2026-12-05", batchLead: "AI Workstream Lead",
    entryCondition: "Batch 8 lineage closure complete",
    exitCondition: "Model feedback loop operational; governance charter approved",
  },
];

const GATE_ICONS: Record<string, React.ElementType> = {
  "G1 — Schema Lock": Lock,
  "G2 — Invariant Lock": Shield,
  "G3 — Contract Publication": FileText,
  "G4 — Lineage Closure": Link2,
  "All Gates": Shield,
};

const BORDER_COLORS = [
  "border-l-violet-500", "border-l-blue-500", "border-l-emerald-500",
  "border-l-amber-500", "border-l-purple-500", "border-l-pink-500",
  "border-l-teal-500", "border-l-orange-500", "border-l-cyan-500",
  "border-l-rose-500",
];

// ─── STATUS DROPDOWN — only control point ────────────────────────────────────
function StatusDropdown({ batchKey }: { batchKey: BatchKey }) {
  const { statuses, setStatus } = useBatchStatus();
  const current = statuses[batchKey];
  const style = STATUS_STYLES[current];

  return (
    <select
      value={current}
      onChange={e => setStatus(batchKey, e.target.value as BatchStatus)}
      onClick={e => e.stopPropagation()}
      className="text-xs font-semibold rounded-full border px-2 py-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0"
      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
    >
      <option value="Planned">Planned</option>
      <option value="Dev">Dev</option>
      <option value="Complete">Complete</option>
    </select>
  );
}

// ─── BATCH CARD ───────────────────────────────────────────────────────────────
function BatchCard({ batch, index, isExpanded, onToggle }: {
  batch: BatchDef; index: number; isExpanded: boolean; onToggle: () => void;
}) {
  const { statuses } = useBatchStatus();
  const status = statuses[batch.key];
  const style = STATUS_STYLES[status];
  const GateIcon = GATE_ICONS[batch.keyGate] || Shield;
  const borderColor = BORDER_COLORS[index % BORDER_COLORS.length];
  const pct = status === "Complete" ? 100 : status === "Dev" ? 45 : 0;

  return (
    <div className={`bg-white border border-slate-200 border-l-4 ${borderColor} rounded-xl shadow-sm overflow-hidden`}>
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={onToggle}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: style.dot }}
        >
          {batch.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 text-sm truncate">{BATCH_LABELS[batch.key]}</div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
            <GateIcon className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{batch.keyGate}</span>
            <span className="text-slate-300">·</span>
            <span>{batch.primarySystem}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:block w-20 shrink-0">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: style.dot }} />
          </div>
          <div className="text-xs text-slate-400 mt-0.5 text-right">{pct}%</div>
        </div>
        {/* Status dropdown — ONLY control point */}
        <div onClick={e => e.stopPropagation()}>
          <StatusDropdown batchKey={batch.key} />
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
              <p className="text-sm text-slate-600">{batch.objective}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Entry Condition</div>
                  <div className="text-slate-700">{batch.entryCondition}</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="font-semibold text-slate-500 uppercase tracking-wide mb-1">Exit Condition</div>
                  <div className="text-slate-700">{batch.exitCondition}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {batch.touchpoints.map(tp => (
                  <span key={tp} className="bg-blue-50 text-blue-700 border border-blue-200 rounded px-2 py-0.5 font-mono">{tp}</span>
                ))}
                {batch.tables?.map(t => (
                  <span key={t} className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-2 py-0.5 font-mono">{t}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Lead: <span className="font-medium text-slate-700">{batch.batchLead}</span></span>
                <span>Target: <span className="font-medium text-slate-700">{batch.targetDate}</span></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TIMELINE MINI ────────────────────────────────────────────────────────────
function TimelineMini() {
  const { statuses } = useBatchStatus();
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {BATCHES.map((b, i) => {
        const style = STATUS_STYLES[statuses[b.key]];
        return (
          <div key={b.key} className="flex items-center shrink-0">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: style.dot }}
              title={b.shortName}
            >
              {b.id}
            </div>
            {i < BATCHES.length - 1 && <div className="w-5 h-0.5 bg-slate-200" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BatchRoadmap() {
  const [expanded, setExpanded] = useState<string>("1");
  const { statuses } = useBatchStatus();
  const [, navigate] = useLocation();

  const toggle = (key: string) => setExpanded(prev => prev === key ? "" : key);
  const complete = BATCHES.filter(b => statuses[b.key] === "Complete").length;
  const dev = BATCHES.filter(b => statuses[b.key] === "Dev").length;
  const planned = BATCHES.filter(b => statuses[b.key] === "Planned").length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">ACTIVE</span>
            <span className="text-xs text-slate-500 font-medium">DCT Data Consolidation Team</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Batch Roadmap</h1>
          <p className="text-sm text-slate-500 mt-0.5">Foundation Core + Batch 1–9 · 10 Delivery Units · Use dropdown on each card to update status</p>
        </div>
        <button
          onClick={() => navigate("/batch-control")}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Global Control Panel
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-700">{complete}</div>
          <div className="text-xs text-emerald-600 font-medium">Complete</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{dev}</div>
          <div className="text-xs text-blue-600 font-medium">In Dev</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-slate-600">{planned}</div>
          <div className="text-xs text-slate-500 font-medium">Planned</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Delivery Timeline</div>
        <TimelineMini />
        <div className="text-xs text-slate-400 mt-2">{BATCHES.length} batches · {complete} complete · {dev} in dev · {planned} planned</div>
      </div>

      {/* Batch cards */}
      <div className="space-y-3">
        {BATCHES.map((batch, i) => (
          <BatchCard
            key={batch.key}
            batch={batch}
            index={i}
            isExpanded={expanded === batch.key}
            onToggle={() => toggle(batch.key)}
          />
        ))}
      </div>

      {/* Gate sequence */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Gate Sequence</div>
        <div className="flex items-center gap-2 flex-wrap">
          {["G1 — Schema Lock", "G2 — Invariant Lock", "G3 — Contract Publication", "G4 — Lineage Closure"].map((g, i, arr) => {
            const GIcon = GATE_ICONS[g] || Shield;
            return (
              <div key={g} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <GIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-medium text-slate-700">{g}</span>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      <footer className="pt-2 pb-1 border-t border-slate-100">
        <div className="text-xs text-slate-400">DCT Platform Batch Roadmap · RSM | CATT · Governed by the DCT Delivery Model</div>
      </footer>
    </div>
  );
}
