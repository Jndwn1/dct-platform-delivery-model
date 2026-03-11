// Agent Hub — AI Agent Execution Layer v3.0
// RSM | CATT | DCT Platform Executive Demo Environment
// 5 agents visually connected to platform stage with execution status

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GitBranch, ShieldCheck, Play, Brain,
  Clock, CheckCircle2, Loader2, Pause, ChevronDown, ChevronRight,
  ArrowRight, Layers
} from "lucide-react";
import {
  AGENTS, PLATFORM_LAYERS, TOUCHPOINTS, getLayer,
  type AgentDefinition
} from "@/lib/platformData";

// ─── AGENT ICONS ─────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ElementType> = {
  analyst: FileText,
  architecture: GitBranch,
  qa: ShieldCheck,
  demo_runner: Play,
  roger_ai: Brain,
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, {
  label: string;
  badge: string;
  dot: string;
}> = {
  ACTIVE: { label: "Active", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  RUNNING: { label: "Running", badge: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  IDLE: { label: "Idle", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  STANDBY: { label: "Standby", badge: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" },
};

// ─── AGENT CARD ───────────────────────────────────────────────────────────────

function AgentCard({ agent, isSelected, onClick }: {
  agent: AgentDefinition;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = AGENT_ICONS[agent.id] || Brain;
  const status = STATUS_CONFIG[agent.status] || STATUS_CONFIG.IDLE;
  const layer = getLayer(agent.layerId);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      className={`w-full text-left bg-white border rounded-xl p-5 shadow-sm transition-all ${
        isSelected
          ? "border-[#003A8F] ring-2 ring-[#003A8F]/20 shadow-md"
          : "border-border hover:border-[#003A8F]/40 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${agent.color} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{agent.name}</div>
            <div className="text-xs text-muted-foreground">{agent.role}</div>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${status.badge}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot} ${agent.status === "RUNNING" ? "animate-pulse" : ""}`} />
          {status.label}
        </div>
      </div>

      {/* Layer badge */}
      <div className="flex items-center gap-1.5 mb-3">
        <Layers className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{layer?.label}</span>
        {layer?.isSystemOfRecord && (
          <span className="text-xs bg-[#003A8F]/10 text-[#003A8F] px-1.5 py-0.5 rounded font-medium">Authority</span>
        )}
      </div>

      {/* Touchpoint chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {agent.touchpointIds.map(tid => (
          <span key={tid} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium border border-slate-200">
            {tid}
          </span>
        ))}
      </div>

      {/* Last execution */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Last run: {agent.lastExecution}</span>
      </div>

      {/* Expand indicator */}
      <div className="flex items-center justify-end mt-2">
        {isSelected
          ? <ChevronDown className="w-3.5 h-3.5 text-[#003A8F]" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        }
      </div>
    </motion.button>
  );
}

// ─── AGENT DETAIL PANEL ───────────────────────────────────────────────────────

function AgentDetailPanel({ agent }: { agent: AgentDefinition }) {
  const touchpoints = TOUCHPOINTS.filter(tp => agent.touchpointIds.includes(tp.id));

  const layerDotColor: Record<string, string> = {
    ingestion: "bg-violet-600",
    orchestration: "bg-blue-600",
    pdc: "bg-emerald-600",
    tdc: "bg-red-600",
    experience: "bg-pink-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-slate-50 border border-border rounded-xl p-5 mt-2 space-y-4">
        {/* Description */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Role Description</div>
          <p className="text-sm text-foreground leading-relaxed">{agent.description}</p>
        </div>

        {/* Touchpoint detail */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Touchpoints Executed</div>
          <div className="space-y-2">
            {touchpoints.map(tp => (
              <div key={tp.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-border">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${layerDotColor[tp.layerId] || "bg-slate-600"}`}>
                  {tp.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground">{tp.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tp.responsibility}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-muted-foreground">{tp.system}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{tp.outputs[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Outputs */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Agent Outputs</div>
          <div className="flex flex-wrap gap-2">
            {agent.outputs.map((out, i) => (
              <span key={i} className="text-xs bg-[#003A8F]/10 text-[#003A8F] px-2.5 py-1 rounded-lg border border-[#003A8F]/20 font-medium">
                {out}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PLATFORM LAYER CONNECTOR ─────────────────────────────────────────────────

function PlatformLayerConnector() {
  return (
    <div className="bg-[#003A8F] rounded-xl p-5 text-white">
      <div className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">
        Agent → Platform Layer Mapping
      </div>
      <div className="space-y-2">
        {PLATFORM_LAYERS.filter(l => l.id !== "client").map((layer) => {
          const layerAgents = AGENTS.filter(a => a.layerId === layer.id);
          if (layerAgents.length === 0) return null;
          return (
            <div key={layer.id} className="flex items-center gap-3 flex-wrap">
              <div className={`${layer.color} rounded-lg px-3 py-2 min-w-48`}>
                <div className="text-xs font-bold text-white">{layer.label}</div>
                <div className="text-xs text-white/70">{layer.authority}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-300 shrink-0" />
              <div className="flex flex-wrap gap-2">
                {layerAgents.map(agent => {
                  const Icon = AGENT_ICONS[agent.id] || Brain;
                  return (
                    <div key={agent.id} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5 border border-white/15">
                      <div className={`w-4 h-4 rounded ${agent.color} flex items-center justify-center`}>
                        <Icon className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-xs text-white font-medium">{agent.name}</span>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        agent.status === "ACTIVE" ? "bg-emerald-400" :
                        agent.status === "RUNNING" ? "bg-blue-400 animate-pulse" :
                        agent.status === "STANDBY" ? "bg-purple-400" : "bg-slate-400"
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function AgentHub() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedAgent(prev => prev === id ? null : id);
  };

  const activeCount = AGENTS.filter(a => a.status === "ACTIVE" || a.status === "RUNNING").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Agent Hub</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {AGENTS.length} agents · {activeCount} active · DCT Platform AI Orchestrator Layer
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">{activeCount} agents operational</span>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 gap-3">
        {AGENTS.map((agent) => (
          <div key={agent.id}>
            <AgentCard
              agent={agent}
              isSelected={selectedAgent === agent.id}
              onClick={() => handleSelect(agent.id)}
            />
            <AnimatePresence>
              {selectedAgent === agent.id && (
                <AgentDetailPanel agent={agent} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Platform layer connector */}
      <PlatformLayerConnector />

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Agent Hub · RSM | CATT · v3.0</span>
          <span>AI Orchestrator Layer — Stateless Compute · Never system of record</span>
        </div>
      </footer>
    </div>
  );
}
