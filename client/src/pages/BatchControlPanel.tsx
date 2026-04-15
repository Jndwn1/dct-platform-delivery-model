// ─────────────────────────────────────────────────────────────────────────────
// Global Batch Control Panel
// The ONLY place to update batch statuses in bulk.
// Changes propagate instantly to: Batch Roadmap, Weekly Demo, Gate Status, Agent Hub.
// ─────────────────────────────────────────────────────────────────────────────

import { useBatchStatus, deriveGateStatus, STATUS_STYLES, BATCH_LABELS, type BatchKey, type BatchStatus } from "@/contexts/BatchStatusContext";
import { CheckCircle2, Clock, Circle, Lock, Shield, Link2, FileText, RotateCcw, Zap } from "lucide-react";

const BATCH_KEYS: BatchKey[] = ["foundation-core","1","2","3","4","5","6","7","8","9"];

const GATE_ICONS = { g1: Lock, g2: Shield, g3: FileText, g4: Link2 };
const GATE_LABELS = {
  g1: "G1 — Schema Lock",
  g2: "G2 — Invariant Lock",
  g3: "G3 — Contract Publication",
  g4: "G4 — Lineage Closure",
};

function GateStatusBadge({ status }: { status: "Complete" | "In Progress" | "Locked" }) {
  const cfg = {
    Complete:    { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500", label: "Complete" },
    "In Progress": { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500", label: "In Progress" },
    Locked:      { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", label: "Locked" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function BatchControlPanel() {
  const { statuses, setStatus, resetAll } = useBatchStatus();
  const gates = deriveGateStatus(statuses);

  const complete  = BATCH_KEYS.filter(k => statuses[k] === "Complete").length;
  const dev       = BATCH_KEYS.filter(k => statuses[k] === "Dev").length;
  const inReview  = BATCH_KEYS.filter(k => statuses[k] === "In Review").length;
  const planned   = BATCH_KEYS.filter(k => statuses[k] === "Planned").length;

  // Quick-set helpers
  const advanceAll = () => {
    BATCH_KEYS.forEach(k => {
      const current = statuses[k];
      if (current === "Planned") setStatus(k, "Dev");
      else if (current === "Dev") setStatus(k, "In Review");
      else if (current === "In Review") setStatus(k, "Complete");
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Control Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Update batch statuses here — changes propagate instantly to all screens
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={advanceAll}
            className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Advance All
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-emerald-700">{complete}</div>
          <div className="text-xs text-emerald-600 font-semibold mt-0.5">Complete</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-700">{dev}</div>
          <div className="text-xs text-blue-600 font-semibold mt-0.5">In Dev</div>
        </div>
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-violet-700">{inReview}</div>
          <div className="text-xs text-violet-600 font-semibold mt-0.5">In Review</div>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-slate-600">{planned}</div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Planned</div>
        </div>
      </div>

      {/* Batch status table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Batch Status — Use dropdown to update · Changes save automatically
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {BATCH_KEYS.map((key, i) => {
            const status = statuses[key];
            const style = STATUS_STYLES[status];
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                {/* Index */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: style.dot }}
                >
                  {key === "foundation-core" ? "FC" : `B${key}`}
                </div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{BATCH_LABELS[key]}</div>
                </div>

                {/* Status dropdown */}
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

      {/* Live gate status preview */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Derived Gate Status — Updates automatically from batch progress
          </div>
        </div>
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

      {/* How it works */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-blue-800 mb-2">How Status Propagation Works</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Batch Roadmap</strong> — progress bar and badge update instantly</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Weekly Demo</strong> — readiness banner and feature statuses update</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Gate Status</strong> — G1–G4 PASSED/PENDING/PLANNED derived automatically</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Agent Hub</strong> — agent Active/Running/Standby/Idle derived from batch progress</span></div>
          <div className="flex items-start gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Persisted to localStorage</strong> — status survives page refresh and navigation</span></div>
          <div className="flex items-start gap-1.5"><Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Reset to Default</strong> — restores Foundation Core + Batch 1 as Complete, Batch 2 as Dev</span></div>
        </div>
      </div>

      <footer className="pt-2 pb-1 border-t border-slate-100">
        <div className="text-xs text-slate-400">DCT Platform Global Control Panel · RSM | CATT · Status changes are local to this browser session</div>
      </footer>
    </div>
  );
}
