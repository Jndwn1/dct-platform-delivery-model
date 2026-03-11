// Home — Governance Dashboard (Enhanced)
// RSM Command Center | DCT Platform Executive Demo Environment v3.0
// Design: RSM Blue authority palette, consulting-grade, executive-ready

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Clock, AlertTriangle, FileText, TrendingUp,
  ChevronDown, ChevronRight, Shield, GitBranch, Brain,
  Play, ShieldCheck, Layers, ArrowRight, Lock, Link2
} from "lucide-react";
import {
  GATES, TOUCHPOINTS, DEMO_SCENARIO, STORY_GUARANTEES,
  AGENTS, PLATFORM_LAYERS, STATUS_COLORS, GUARANTEE_COLORS,
  type Gate, type GuaranteeType, getAgent, getLayer
} from "@/lib/platformData";

// ─── KPI STRIP ───────────────────────────────────────────────────────────────

function KPIStrip() {
  const kpis = [
    { label: "Active Batches", value: "1", sub: "5 planned", icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Gates Pending", value: "1", sub: "0 passed · 0 blocked", icon: Shield, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Artifacts Issued", value: "3", sub: "2 pending · 15 missing", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Open Issues", value: "2", sub: "AB-01 · G1 scope", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Platform Progress", value: "18%", sub: "T1–T3 active", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="grid grid-cols-5 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="bg-white border border-border rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <div className={`${k.bg} p-2 rounded-md`}>
            <k.icon className={`w-4 h-4 ${k.color}`} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground leading-none">{k.value}</div>
            <div className="text-xs font-medium text-foreground mt-0.5">{k.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ENHANCED GATE VERIFICATION ──────────────────────────────────────────────

const GATE_ICONS: Record<string, React.ElementType> = {
  G1: Lock, G2: Shield, G3: Link2, G4: FileText,
};

const GATE_STATUS_STYLES: Record<string, { badge: string; ring: string; dot: string }> = {
  PASSED: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  PENDING_REVIEW: { badge: "bg-amber-100 text-amber-800 border-amber-200", ring: "ring-amber-200", dot: "bg-amber-500" },
  PLANNED: { badge: "bg-slate-100 text-slate-600 border-slate-200", ring: "ring-slate-200", dot: "bg-slate-400" },
  BLOCKED: { badge: "bg-red-100 text-red-800 border-red-200", ring: "ring-red-200", dot: "bg-red-500" },
};

function GateVerificationSection() {
  const [expanded, setExpanded] = useState<string | null>("G1");

  return (
    <section>
      <SectionHeader title="Gate Verification Model — G1 through G4" sub="AB-01 Active Batch" />
      <div className="grid grid-cols-4 gap-3 mb-4">
        {GATES.map((gate) => {
          const styles = GATE_STATUS_STYLES[gate.status];
          const Icon = GATE_ICONS[gate.id];
          const issued = gate.artifacts.filter(a => a.status === "ISSUED").length;
          const total = gate.artifacts.length;
          const pct = Math.round((issued / total) * 100);
          const isOpen = expanded === gate.id;

          return (
            <button
              key={gate.id}
              onClick={() => setExpanded(isOpen ? null : gate.id)}
              className={`text-left bg-white border rounded-lg p-4 shadow-sm transition-all ring-1 ${styles.ring} hover:shadow-md`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  <span className="text-xs font-bold text-muted-foreground">{gate.id}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${styles.badge}`}>
                  {gate.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-[#003A8F]" />
                <span className="text-sm font-bold text-foreground">{gate.name}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
                <div
                  className="bg-[#003A8F] h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{issued}/{total} artifacts</div>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {expanded && (() => {
          const gate = GATES.find(g => g.id === expanded)!;
          return (
            <motion.div
              key={expanded}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border border-border rounded-lg p-5 shadow-sm overflow-hidden"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{gate.id} — {gate.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-2xl">{gate.description}</p>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  <div className="font-medium">Owner</div>
                  <div>{gate.owner}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Required Artifacts</div>
                  <div className="space-y-1.5">
                    {gate.artifacts.map((art, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {art.status === "ISSUED" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : art.status === "PENDING" ? (
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 shrink-0" />
                        )}
                        <span className={art.status === "MISSING" ? "text-muted-foreground" : "text-foreground"}>
                          {art.name}
                        </span>
                        <span className="text-muted-foreground ml-auto">— {art.owner}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Touchpoints</div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {gate.touchpointIds.map(tid => {
                      const tp = TOUCHPOINTS.find(t => t.id === tid);
                      return tp ? (
                        <div key={tid} className="bg-[#003A8F]/10 text-[#003A8F] text-xs px-2 py-1 rounded font-medium">
                          {tid} — {tp.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Exit Condition</div>
                  <p className="text-xs text-muted-foreground bg-slate-50 p-2 rounded border border-border">
                    {gate.exitCondition}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}

// ─── ENRICHED TOUCHPOINT JOURNEY ─────────────────────────────────────────────

const TP_LAYER_COLORS: Record<string, string> = {
  ingestion: "bg-violet-500",
  orchestration: "bg-blue-500",
  pdc: "bg-emerald-500",
  tdc: "bg-red-500",
  experience: "bg-pink-500",
};

const TP_STATUS_RING: Record<string, string> = {
  COMPLETE: "ring-emerald-400",
  IN_PROGRESS: "ring-blue-400",
  PENDING: "ring-amber-400",
  PLANNED: "ring-slate-300",
  BLOCKED: "ring-red-400",
};

function EnrichedTouchpointJourney() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section>
      <SectionHeader title="Touchpoint Runtime Journey — T1 through T11" sub="System · Agent · Layer mapping" />
      <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
        {/* Layer legend */}
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          {[
            { id: "ingestion", label: "DMS/Phoenix", color: "bg-violet-500" },
            { id: "orchestration", label: "AI Orchestrator", color: "bg-blue-500" },
            { id: "pdc", label: "PDC", color: "bg-emerald-500" },
            { id: "tdc", label: "TDC", color: "bg-red-500" },
            { id: "experience", label: "Roger UI", color: "bg-pink-500" },
          ].map(l => (
            <div key={l.id} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Complete</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />In Progress</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Pending</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />Planned</span>
          </div>
        </div>

        {/* Journey strip */}
        <div className="flex items-start gap-1 overflow-x-auto pb-2">
          {TOUCHPOINTS.map((tp, i) => {
            const dotColor = TP_LAYER_COLORS[tp.layerId] || "bg-slate-400";
            const ring = TP_STATUS_RING[tp.status];
            const agent = tp.agentId ? getAgent(tp.agentId) : null;
            const isSelected = selected === tp.id;

            return (
              <div key={tp.id} className="flex items-start gap-1 shrink-0">
                <button
                  onClick={() => setSelected(isSelected ? null : tp.id)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className={`w-9 h-9 rounded-full ${dotColor} ring-2 ${ring} flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-110 transition-transform ${isSelected ? "scale-110 shadow-md" : ""}`}>
                    {tp.id}
                  </div>
                  <div className="text-center w-20">
                    <div className="text-xs font-medium text-foreground leading-tight truncate">{tp.name.split(" ").slice(0, 2).join(" ")}</div>
                    <div className="text-xs text-muted-foreground truncate">{tp.system}</div>
                    {agent && (
                      <div className="text-xs text-[#003A8F]/70 truncate">{agent.name.split(" ")[0]}</div>
                    )}
                  </div>
                </button>
                {i < TOUCHPOINTS.length - 1 && (
                  <div className="mt-4 text-slate-300">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Touchpoint detail */}
        <AnimatePresence>
          {selected && (() => {
            const tp = TOUCHPOINTS.find(t => t.id === selected)!;
            const agent = tp.agentId ? getAgent(tp.agentId) : null;
            const layer = getLayer(tp.layerId);
            return (
              <motion.div
                key={selected}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 pt-4 border-t border-border grid grid-cols-4 gap-4"
              >
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">System</div>
                  <div className="text-sm font-medium text-foreground">{tp.system}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tp.responsibility}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Platform Layer</div>
                  <div className="text-sm font-medium text-foreground">{layer?.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{layer?.authority}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Executing Agent</div>
                  {agent ? (
                    <>
                      <div className="text-sm font-medium text-foreground">{agent.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{agent.role}</div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Practitioner / Manual</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Outputs</div>
                  <div className="space-y-0.5">
                    {tp.outputs.slice(0, 3).map((o, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-[#003A8F]/40 shrink-0" />
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── DEMO SCENARIO PANEL ─────────────────────────────────────────────────────

function DemoScenarioPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section>
      <SectionHeader title="Demo Runtime Scenario" sub="End-to-End Platform Workflow" />
      <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#003A8F] flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-foreground">PI-1 Executive Demo — Trial Balance Processing</div>
              <div className="text-xs text-muted-foreground">10 steps · T1–T11 · Client upload → Roger UI display</div>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {DEMO_SCENARIO.map((step) => {
                    const tp = TOUCHPOINTS.find(t => t.id === step.touchpointId);
                    const dotColor = TP_LAYER_COLORS[step.layerId] || "bg-slate-400";
                    const agent = step.agentId ? getAgent(step.agentId) : null;
                    return (
                      <div key={step.step} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-border">
                        <div className={`w-7 h-7 rounded-full ${dotColor} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {step.step}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground">{step.label}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{step.description}</div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-xs bg-white border border-border px-1.5 py-0.5 rounded text-muted-foreground">{step.touchpointId}</span>
                            <span className="text-xs text-muted-foreground">{step.system}</span>
                            {agent && <span className="text-xs text-[#003A8F]/80">{agent.name}</span>}
                          </div>
                          <div className="text-xs text-emerald-700 mt-1 font-medium">→ {step.output}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── BLITZY DELIVERY ALIGNMENT ────────────────────────────────────────────────

const GUARANTEE_ICONS: Record<GuaranteeType, React.ElementType> = {
  SCHEMA: Lock, LINEAGE: Link2, CONTRACT: FileText, RUNTIME: Play,
};

const GUARANTEE_LABELS: Record<GuaranteeType, string> = {
  SCHEMA: "Schema Guarantee", LINEAGE: "Lineage Guarantee",
  CONTRACT: "Contract Guarantee", RUNTIME: "Runtime Guarantee",
};

function BlitzyAlignmentSection() {
  return (
    <section>
      <SectionHeader title="Blitzy Delivery Model Alignment" sub="Backlog Stories → Platform Guarantees" />
      <div className="grid grid-cols-1 gap-3">
        {STORY_GUARANTEES.map((sg) => {
          const Icon = GUARANTEE_ICONS[sg.guaranteeType];
          const colorClass = GUARANTEE_COLORS[sg.guaranteeType];
          const statusStyle = STATUS_COLORS[sg.status] || "bg-slate-100 text-slate-600";
          return (
            <div key={sg.storyId} className="bg-white border border-border rounded-lg p-4 shadow-sm flex items-start gap-4">
              <div className={`p-2 rounded-lg border ${colorClass} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{sg.storyId}</span>
                  <span className="text-xs font-medium text-foreground">{sg.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${statusStyle}`}>{sg.status.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colorClass}`}>{GUARANTEE_LABELS[sg.guaranteeType]}</span>
                  <span className="text-xs text-muted-foreground">Gate: {sg.gate}</span>
                  <span className="text-xs text-muted-foreground">Batch: {sg.batchId}</span>
                </div>
                <p className="text-xs text-muted-foreground">{sg.platformGuarantee}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── AGENT EXECUTION SUMMARY ─────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ElementType> = {
  analyst: FileText, architecture: GitBranch, qa: ShieldCheck,
  demo_runner: Play, roger_ai: Brain,
};

const AGENT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  RUNNING: "bg-blue-100 text-blue-800",
  IDLE: "bg-slate-100 text-slate-600",
  STANDBY: "bg-purple-100 text-purple-800",
};

function AgentExecutionSummary() {
  return (
    <section>
      <SectionHeader title="Agent Execution Layer" sub="AI agents operating across platform stages" />
      <div className="grid grid-cols-5 gap-3">
        {AGENTS.map((agent) => {
          const Icon = AGENT_ICONS[agent.id] || Brain;
          const statusStyle = AGENT_STATUS_COLORS[agent.status];
          const layer = getLayer(agent.layerId);
          return (
            <div key={agent.id} className="bg-white border border-border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle}`}>{agent.status}</span>
              </div>
              <div className="text-sm font-bold text-foreground leading-tight mb-0.5">{agent.name}</div>
              <div className="text-xs text-muted-foreground mb-2">{agent.role}</div>
              <div className="text-xs bg-slate-50 border border-border rounded px-2 py-1 text-muted-foreground truncate">
                {layer?.label}
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.touchpointIds.slice(0, 4).map(tid => (
                  <span key={tid} className="text-xs bg-[#003A8F]/10 text-[#003A8F] px-1.5 py-0.5 rounded font-medium">{tid}</span>
                ))}
                {agent.touchpointIds.length > 4 && (
                  <span className="text-xs text-muted-foreground">+{agent.touchpointIds.length - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">{title}</h2>
      {sub && <span className="text-xs text-muted-foreground/60">— {sub}</span>}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="p-6 space-y-7">
      <KPIStrip />
      <AgentExecutionSummary />
      <GateVerificationSection />
      <EnrichedTouchpointJourney />
      <DemoScenarioPanel />
      <BlitzyAlignmentSection />
      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Executive Demo Environment · RSM | CATT · v3.0</span>
          <span>Governed by the DCT Delivery Model · March 11, 2026</span>
        </div>
      </footer>
    </div>
  );
}
