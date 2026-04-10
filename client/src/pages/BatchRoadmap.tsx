// Batch Roadmap — Foundation Core + Batch 1–9
// Matches reference: rsm-ai-team-niua6bzx.manus.space

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, CheckCircle2, Clock, Circle,
  AlertTriangle, Calendar, Layers, Shield, ArrowRight, Lock,
  Link2, FileText, Play
} from "lucide-react";
import { allBatches } from "@/lib/dctData";
import { TOUCHPOINTS } from "@/lib/platformData";

// ─── BATCH STATUS CONFIG ──────────────────────────────────────────────────────

const BATCH_STATUS: Record<string, {
  badge: string; bar: string; icon: React.ElementType; dot: string;
}> = {
  ACTIVE: { badge: "bg-blue-100 text-blue-800 border-blue-200", bar: "bg-blue-500", icon: Play, dot: "bg-blue-500" },
  GATE_PENDING: { badge: "bg-amber-100 text-amber-800 border-amber-200", bar: "bg-amber-500", icon: Clock, dot: "bg-amber-500" },
  PLANNED: { badge: "bg-slate-100 text-slate-600 border-slate-200", bar: "bg-slate-300", icon: Circle, dot: "bg-slate-400" },
  CLOSED: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", bar: "bg-emerald-500", icon: CheckCircle2, dot: "bg-emerald-500" },
  ON_HOLD: { badge: "bg-red-100 text-red-800 border-red-200", bar: "bg-red-500", icon: AlertTriangle, dot: "bg-red-500" },
};

const GATE_ICONS: Record<string, React.ElementType> = {
  "G1 — Schema Lock": Lock,
  "G2 — Invariant Lock": Shield,
  "G3 — Lineage Closure": Link2,
  "G4 — Contract Publication": FileText,
  "All Gates": Shield,
  "Orchestration Manifest": Layers,
};

const BATCH_COLORS = [
  "border-l-violet-500",
  "border-l-blue-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-purple-500",
  "border-l-pink-500",
];

// ─── BATCH CARD ───────────────────────────────────────────────────────────────

function BatchCard({ batch, index, isExpanded, onToggle }: {
  batch: typeof allBatches[0];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const statusCfg = BATCH_STATUS[batch.status] || BATCH_STATUS.PLANNED;
  const StatusIcon = statusCfg.icon;
  const GateIcon = GATE_ICONS[batch.keyGate] || Shield;
  const borderColor = BATCH_COLORS[index % BATCH_COLORS.length];
  const touchpointDetails = TOUCHPOINTS.filter(tp => batch.touchpoints.includes(tp.id));

  return (
    <div className={`bg-white border border-border border-l-4 ${borderColor} rounded-xl shadow-sm overflow-hidden`}>
      {/* Card header */}
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Batch ID circle */}
        <div className={`w-10 h-10 rounded-full ${statusCfg.dot} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {batch.id.replace("AB-", "")}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">{batch.id}</span>
            <span className="text-sm font-bold text-foreground">{batch.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ml-auto ${statusCfg.badge}`}>
              {batch.status.replace("_", " ")}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
            <div
              className={`${statusCfg.bar} h-1.5 rounded-full transition-all`}
              style={{ width: `${batch.completionPct}%` }}
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <GateIcon className="w-3 h-3" />
              <span>{batch.keyGate}</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{batch.primarySystem}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Target: {batch.targetDate || "TBD"}</span>
            </div>
            {batch.openIssues > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-3 h-3" />
                <span>{batch.openIssues} open issue{batch.openIssues > 1 ? "s" : ""}</span>
              </div>
            )}
            <span className="font-medium text-foreground">{batch.completionPct}% complete</span>
          </div>
        </div>

        {/* Expand icon */}
        <div className="shrink-0 mt-1">
          {isExpanded
            ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
            : <ChevronRight className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <div className="grid grid-cols-2 gap-6 mt-4">
                {/* Left: conditions */}
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Entry Condition</div>
                    <div className="bg-slate-50 border border-border rounded-lg p-3 text-xs text-foreground leading-relaxed">
                      {batch.entryCondition}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Exit Condition</div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-foreground leading-relaxed">
                      {batch.exitCondition}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Batch Lead</div>
                    <div className="text-xs text-foreground font-medium">{batch.batchLead}</div>
                  </div>
                </div>

                {/* Right: touchpoints */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Touchpoints ({batch.touchpoints.length})
                  </div>
                  <div className="space-y-1.5">
                    {touchpointDetails.map(tp => (
                      <div key={tp.id} className="flex items-center gap-2 text-xs">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                          tp.layerId === "ingestion" ? "bg-violet-600" :
                          tp.layerId === "orchestration" ? "bg-blue-600" :
                          tp.layerId === "pdc" ? "bg-emerald-600" :
                          tp.layerId === "tdc" ? "bg-red-600" :
                          tp.layerId === "experience" ? "bg-pink-600" : "bg-slate-600"
                        }`}>
                          {tp.id.replace("T", "")}
                        </span>
                        <span className="font-medium text-foreground">{tp.name}</span>
                        <span className="text-muted-foreground ml-auto">{tp.system}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── TIMELINE STRIP ───────────────────────────────────────────────────────────

function TimelineStrip() {
  return (
    <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
        Delivery Timeline — AB-01 through AB-06
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {allBatches.map((batch, i) => {
          const statusCfg = BATCH_STATUS[batch.status] || BATCH_STATUS.PLANNED;
          const StatusIcon = statusCfg.icon;
          const colors = BATCH_COLORS[i % BATCH_COLORS.length];
          return (
            <div key={batch.id} className="flex items-center shrink-0">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full ${statusCfg.dot} flex items-center justify-center text-white text-xs font-bold`}>
                  {i + 1}
                </div>
                <div className="text-center w-24">
                  <div className="text-xs font-bold text-foreground">{batch.id}</div>
                  <div className="text-xs text-muted-foreground leading-tight">{batch.name.split(" ").slice(0, 2).join(" ")}</div>
                  <div className="text-xs text-muted-foreground">{batch.targetDate?.split("-").slice(0, 2).join("-") || "TBD"}</div>
                </div>
              </div>
              {i < allBatches.length - 1 && (
                <div className="w-8 h-0.5 bg-slate-200 shrink-0 mx-1" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BatchRoadmap() {
  const [expanded, setExpanded] = useState<string>("AB-01");

  const toggle = (id: string) => setExpanded(prev => prev === id ? "" : id);

  const inProgress = allBatches.filter(b => b.status === "ACTIVE" || b.status === "GATE_PENDING").length;
  const planned = allBatches.filter(b => b.status === "PLANNED").length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Architectural Batch Roadmap</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {allBatches.length} batches · {inProgress} in progress · {planned} planned · DCT Delivery Model
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-blue-500" />{inProgress} Active
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-slate-400" />{planned} Planned
          </span>
        </div>
      </div>

      {/* Timeline strip */}
      <TimelineStrip />

      {/* Batch cards */}
      <div className="space-y-3">
        {allBatches.map((batch, i) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            index={i}
            isExpanded={expanded === batch.id}
            onToggle={() => toggle(batch.id)}
          />
        ))}
      </div>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Batch Roadmap · RSM | CATT · v3.0</span>
          <span>Governed by the DCT Delivery Model · Batch execution requires Gate verification</span>
        </div>
      </footer>
    </div>
  );
}
