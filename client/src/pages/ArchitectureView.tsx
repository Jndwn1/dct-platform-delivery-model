// Architecture View — Platform Architecture Layers v3.0
// RSM | CATT | DCT Platform Executive Demo Environment
// Layered architecture with system boundaries, ownership, agent connections, T1–T11 mapping

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Database, Brain, ArrowDown, CheckCircle2,
  FileText, Link2, Play, GitBranch, ShieldCheck, ArrowRight, X
} from "lucide-react";
import {
  PLATFORM_LAYERS, TOUCHPOINTS, AGENTS, getAgent, getLayer,
  type PlatformLayer, type EnrichedTouchpoint
} from "@/lib/platformData";

// ─── AGENT ICONS ─────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ElementType> = {
  analyst: FileText, architecture: GitBranch, qa: ShieldCheck,
  demo_runner: Play, roger_ai: Brain,
};

// ─── TOUCHPOINT CHIP ─────────────────────────────────────────────────────────

const TP_STATUS_DOT: Record<string, string> = {
  COMPLETE: "bg-emerald-400", IN_PROGRESS: "bg-blue-400",
  PENDING: "bg-amber-400", PLANNED: "bg-slate-300", BLOCKED: "bg-red-400",
};

function TouchpointChip({ tp, onClick, selected }: {
  tp: EnrichedTouchpoint;
  onClick: () => void;
  selected: boolean;
}) {
  const agent = tp.agentId ? getAgent(tp.agentId) : null;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
        selected
          ? "bg-white shadow-md border-white/60 scale-105"
          : "bg-white/10 border-white/20 hover:bg-white/20"
      }`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${TP_STATUS_DOT[tp.status]}`} />
      <div>
        <div className={`text-xs font-bold ${selected ? "text-foreground" : "text-white"}`}>{tp.id}</div>
        <div className={`text-xs leading-tight max-w-[7rem] ${selected ? "text-muted-foreground" : "text-white/70"}`}>
          {tp.name.split(" ").slice(0, 3).join(" ")}
        </div>
        {agent && (
          <div className={`text-xs mt-0.5 ${selected ? "text-[#003A8F]" : "text-white/60"}`}>
            {agent.name.split(" ")[0]}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── LAYER ROW ────────────────────────────────────────────────────────────────

function LayerRow({ layer, touchpoints, selectedTp, onSelectTp }: {
  layer: PlatformLayer;
  touchpoints: EnrichedTouchpoint[];
  selectedTp: string | null;
  onSelectTp: (id: string | null) => void;
}) {
  const layerAgents = AGENTS.filter(a => a.layerId === layer.id);

  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      {/* Header */}
      <div className={`${layer.color} px-5 py-3`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">{layer.label}</span>
                {layer.isSystemOfRecord && (
                  <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold border border-white/30">
                    ◆ AUTHORITY
                  </span>
                )}
              </div>
              <div className="text-xs text-white/80 mt-0.5">{layer.sublabel}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {layer.systems.map(s => (
              <span key={s} className="text-xs bg-white/15 text-white px-2 py-0.5 rounded border border-white/20">{s}</span>
            ))}
            <span className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/20">
              {layer.authority}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800/60 px-5 py-3">
        <div className="flex items-start gap-6 flex-wrap">
          {touchpoints.length > 0 ? (
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Touchpoints</div>
              <div className="flex flex-wrap gap-2">
                {touchpoints.map(tp => (
                  <TouchpointChip
                    key={tp.id} tp={tp}
                    selected={selectedTp === tp.id}
                    onClick={() => onSelectTp(selectedTp === tp.id ? null : tp.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <div className="text-xs text-slate-500 italic">Source systems — no platform touchpoints</div>
            </div>
          )}

          {layerAgents.length > 0 && (
            <div className="shrink-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Agents</div>
              <div className="flex flex-col gap-1.5">
                {layerAgents.map(agent => {
                  const Icon = AGENT_ICONS[agent.id] || Brain;
                  return (
                    <div key={agent.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 border border-white/10">
                      <div className={`w-5 h-5 rounded ${agent.color} flex items-center justify-center`}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">{agent.name}</div>
                        <div className="text-xs text-slate-400">{agent.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TOUCHPOINT DETAIL PANEL ─────────────────────────────────────────────────

function TouchpointDetailPanel({ tpId, onClose }: { tpId: string; onClose: () => void }) {
  const tp = TOUCHPOINTS.find(t => t.id === tpId);
  if (!tp) return null;
  const agent = tp.agentId ? getAgent(tp.agentId) : null;
  const layer = getLayer(tp.layerId);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white border border-border rounded-xl shadow-lg p-5 w-80 shrink-0 self-start sticky top-0"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full ${layer?.color || "bg-slate-500"} flex items-center justify-center text-white text-xs font-bold`}>
            {tp.id}
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{tp.id}</div>
            <div className="text-xs text-muted-foreground">{tp.name}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <Row label="System Owner" value={tp.system} />
        <Row label="Platform Layer" value={layer?.label || ""} sub={layer?.authority} />
        <Row label="Executing Agent" value={agent?.name || "Practitioner / Manual"} sub={agent?.role} />
        <Row label="Gate" value={tp.gate} />
        <Row label="Authority Action" value={tp.isAuthorityAction ? "Yes — establishes platform authority" : "No"} />

        <div>
          <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">Responsibility</div>
          <p className="text-muted-foreground leading-relaxed">{tp.responsibility}</p>
        </div>

        <div>
          <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">Inputs</div>
          <div className="space-y-0.5">
            {tp.inputs.map((inp, i) => (
              <div key={i} className="text-muted-foreground flex items-start gap-1">
                <ArrowRight className="w-3 h-3 text-[#003A8F] shrink-0 mt-0.5" />{inp}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">Outputs</div>
          <div className="space-y-0.5">
            {tp.outputs.map((out, i) => (
              <div key={i} className="text-muted-foreground flex items-start gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />{out}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium text-foreground mt-0.5">{value}</div>
      {sub && <div className="text-muted-foreground">{sub}</div>}
    </div>
  );
}

// ─── ARCHITECTURE RULES ───────────────────────────────────────────────────────

function ArchitectureRules() {
  return (
    <div className="bg-[#003A8F] rounded-xl p-5 text-white">
      <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-3">Architecture Rules — Enforced</div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Brain, rule: "AI Orchestrator (Roger AI) = Stateless Compute", sub: "Performs T2, T3, T8 — never system of record" },
          { icon: Database, rule: "PDC = Canonical Financial Authority", sub: "All financial data authority flows through PDC" },
          { icon: Shield, rule: "TDC = Tax Decision Authority", sub: "All tax decisions persisted immutably in TDC" },
          { icon: CheckCircle2, rule: "Roger UI = Read-Only Consumer", sub: "Surfaces data only — no write operations" },
        ].map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <r.icon className="w-4 h-4 text-blue-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">{r.rule}</div>
              <div className="text-xs text-blue-200/80">{r.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ArchitectureView() {
  const [selectedTp, setSelectedTp] = useState<string | null>(null);

  const tpsByLayer = (layerId: string) =>
    TOUCHPOINTS.filter(tp => tp.layerId === layerId);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Platform Architecture</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            6 layers · 11 touchpoints · 5 AI agents · T1–T11 runtime flow · Click any touchpoint for detail
          </p>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        <div className="flex-1 space-y-2">
          <div className="bg-slate-900 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 px-1">
              DCT Platform Architecture Stack — T1–T11 Runtime Flow
            </div>
            {PLATFORM_LAYERS.map((layer, i) => (
              <div key={layer.id}>
                <LayerRow
                  layer={layer}
                  touchpoints={tpsByLayer(layer.id)}
                  selectedTp={selectedTp}
                  onSelectTp={setSelectedTp}
                />
                {i < PLATFORM_LAYERS.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <ArchitectureRules />
        </div>

        <AnimatePresence>
          {selectedTp && (
            <TouchpointDetailPanel
              tpId={selectedTp}
              onClose={() => setSelectedTp(null)}
            />
          )}
        </AnimatePresence>
      </div>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Architecture View · RSM | CATT · v3.0</span>
          <span>Governed by the DCT Delivery Model · Source of truth: platformData.ts</span>
        </div>
      </footer>
    </div>
  );
}
