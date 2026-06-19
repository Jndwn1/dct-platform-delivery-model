// Touchpoints — T1–T11 Runtime Journey Detail
// RSM | CATT | DCT Platform Executive Demo Environment v3.1

import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronDown, ChevronRight, CheckCircle2,
  Clock, Circle, AlertTriangle, Layers, User, FileText, Zap,
  Package, Calendar, Info, ExternalLink
} from "lucide-react";
import { TOUCHPOINTS, AGENTS, getLayer, type EnrichedTouchpoint } from "@/lib/platformData";
import { ANALYST_STORIES, GUARANTEE_TYPE_COLORS } from "@/lib/analystStories";

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { icon: React.ElementType; badge: string; dot: string; label: string }> = {
  COMPLETE:    { icon: CheckCircle2,  badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500",             label: "Delivered" },
  IN_PROGRESS: { icon: Clock,         badge: "bg-blue-100 text-blue-800 border-blue-200",         dot: "bg-blue-500 animate-pulse", label: "In Progress" },
  PENDING:     { icon: Clock,         badge: "bg-amber-100 text-amber-800 border-amber-200",       dot: "bg-amber-500",              label: "Pending" },
  PLANNED:     { icon: Circle,        badge: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400",              label: "Not Started" },
  BLOCKED:     { icon: AlertTriangle, badge: "bg-red-100 text-red-800 border-red-200",             dot: "bg-red-500",                label: "Blocked" },
};

const LAYER_COLORS: Record<string, string> = {
  client: "bg-slate-500",
  ingestion: "bg-violet-600",
  orchestration: "bg-blue-600",
  pdc: "bg-emerald-600",
  tdc: "bg-red-600",
  experience: "bg-pink-600",
};

const GATE_COLORS: Record<string, string> = {
  "G1": "bg-violet-100 text-violet-800 border-violet-200",
  "G2": "bg-blue-100 text-blue-800 border-blue-200",
  "G3": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "G4": "bg-amber-100 text-amber-800 border-amber-200",
};

// ─── TOUCHPOINT DETAIL CARD ───────────────────────────────────────────────────

function TouchpointDetailCard({ tp, isOpen, onToggle }: {
  tp: EnrichedTouchpoint;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const statusCfg = STATUS_CONFIG[tp.status] || STATUS_CONFIG.PLANNED;
  const StatusIcon = statusCfg.icon;
  const layer = getLayer(tp.layerId);
  const agent = AGENTS.find(a => a.id === tp.agentId);
  const story = ANALYST_STORIES.find(s => s.touchpointId === tp.id);
  const gateColor = tp.gate ? GATE_COLORS[tp.gate] : "bg-slate-100 text-slate-600 border-slate-200";
  const dotColor = LAYER_COLORS[tp.layerId] || "bg-slate-500";

  return (
    <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Touchpoint badge */}
        <div className={`w-10 h-10 rounded-xl ${dotColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {tp.id}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-sm font-bold text-foreground">{tp.name}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.badge}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            {tp.gate && (
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${gateColor}`}>
                {tp.gate}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />{layer?.label}
            </span>
            <ArrowRight className="w-3 h-3" />
            <span>{tp.system}</span>
            {agent && (
              <>
                <ArrowRight className="w-3 h-3" />
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />{agent.name}
                </span>
              </>
            )}
          </div>
        </div>

        {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Responsibility</div>
                    <p className="text-xs text-foreground leading-relaxed">{tp.responsibility}</p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Inputs</div>
                    <div className="flex flex-wrap gap-1.5">
                      {tp.inputs.map((inp, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{inp}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Outputs</div>
                    <div className="flex flex-wrap gap-1.5">
                      {tp.outputs.map((out, i) => (
                        <span key={i} className="text-xs bg-[#003A8F]/10 text-[#003A8F] px-2 py-0.5 rounded border border-[#003A8F]/20">{out}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  {/* Delivery status box */}
                  {tp.deliveredBy && (
                    <div className="rounded-lg p-3 border bg-emerald-50 border-emerald-200">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Package className="w-3 h-3 text-emerald-700" />
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Delivered By</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-900 mb-0.5">{tp.deliveredBy}</div>
                      {tp.deliveredDate && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700">
                          <Calendar className="w-3 h-3" />
                          {tp.deliveredDate}
                        </div>
                      )}
                      {tp.statusNote && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-100 rounded p-2">
                          <Info className="w-3 h-3 shrink-0 mt-0.5" />
                          <span>{tp.statusNote}</span>
                        </div>
                      )}
                      {tp.walkthroughUrl && (
                        <Link href={tp.walkthroughUrl}>
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer bg-white border border-emerald-300 rounded px-2.5 py-1.5 hover:bg-emerald-50 transition-colors w-fit">
                            <ExternalLink className="w-3 h-3" />
                            View Architecture Walkthrough →
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                  {/* For IN_PROGRESS or PLANNED — show status note if no deliveredBy */}
                  {!tp.deliveredBy && tp.statusNote && (
                    <div className="rounded-lg p-3 border bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-1.5 text-xs text-blue-800">
                        <Info className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{tp.statusNote}</span>
                      </div>
                    </div>
                  )}
                  {/* Layer info */}
                  <div className={`rounded-lg p-3 border`} style={{ background: `${dotColor.replace("bg-", "")}10` }}>
                    <div className="text-xs font-semibold text-muted-foreground mb-1">Platform Layer</div>
                    <div className="text-xs font-bold text-foreground">{layer?.label}</div>
                    <div className="text-xs text-muted-foreground">{layer?.authority}</div>
                    {layer?.isSystemOfRecord && (
                      <span className="inline-block mt-1 text-xs bg-[#003A8F]/10 text-[#003A8F] px-2 py-0.5 rounded font-medium">System of Record</span>
                    )}
                  </div>

                  {/* Story reference */}
                  {story && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">Blitzy Story</span>
                        <span className="text-xs font-mono text-slate-400 ml-auto">{story.storyId}</span>
                      </div>
                      <div className="text-xs text-slate-300 mb-1">{story.blitzyTask}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${GUARANTEE_TYPE_COLORS[story.guaranteeType]}`}>
                        {story.guaranteeType} Guarantee
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TouchpointsPage() {
  const [openTp, setOpenTp] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

  const complete = TOUCHPOINTS.filter(t => t.status === "COMPLETE").length;
  const inProgress = TOUCHPOINTS.filter(t => t.status === "IN_PROGRESS").length;
  const pending = TOUCHPOINTS.filter(t => t.status === "PENDING" || t.status === "PLANNED").length;

  const filters = [
    { id: "ALL", label: "All Touchpoints" },
    { id: "G1", label: "G1 — Schema Lock" },
    { id: "G2", label: "G2 — Invariant Lock" },
    { id: "G3", label: "G3 — Lineage Closure" },
    { id: "G4", label: "G4 — Contract Publication" },
  ];

  const filtered = filter === "ALL"
    ? TOUCHPOINTS
    : TOUCHPOINTS.filter(tp => tp.gate === filter);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Touchpoints</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          T1–T11 runtime journey · system ownership · agent mapping · gate alignment
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Complete", value: complete, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "In Progress", value: inProgress, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Pending / Planned", value: pending, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
        ].map(kpi => (
          <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg}`}>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
              filter === f.id
                ? "bg-[#003A8F] text-white border-[#003A8F]"
                : "bg-white text-muted-foreground border-border hover:border-[#003A8F]/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Touchpoint cards */}
      <div className="space-y-3">
        {filtered.map(tp => (
          <TouchpointDetailCard
            key={tp.id}
            tp={tp}
            isOpen={openTp === tp.id}
            onToggle={() => setOpenTp(prev => prev === tp.id ? null : tp.id)}
          />
        ))}
      </div>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Touchpoints · RSM | CATT · v3.1</span>
          <span>T1–T11 · Client Source Systems → Roger UI</span>
        </div>
      </footer>
    </div>
  );
}
