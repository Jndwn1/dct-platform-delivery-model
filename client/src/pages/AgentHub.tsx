// Agent Hub — AI Agent Execution Layer v3.1
// RSM | CATT | DCT Platform Executive Demo Environment
// Analyst Agent: full story library, Blitzy instructions, platform guarantees, T1–T11 mapping

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, GitBranch, ShieldCheck, Play, Brain,
  Clock, CheckCircle2, Loader2, Pause, ChevronDown, ChevronRight,
  ArrowRight, Layers, Code2, Shield, BookOpen, Zap, Check
} from "lucide-react";
import {
  AGENTS, PLATFORM_LAYERS, TOUCHPOINTS, getLayer,
  type AgentDefinition
} from "@/lib/platformData";
import {
  ANALYST_STORIES, PLATFORM_GUARANTEES, GUARANTEE_TYPE_COLORS,
  type AnalystStory
} from "@/lib/analystStories";

// ─── AGENT ICONS ─────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, React.ElementType> = {
  analyst: FileText,
  architecture: GitBranch,
  qa: ShieldCheck,
  demo_runner: Play,
  roger_ai: Brain,
};

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  ACTIVE: { label: "Active", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-500" },
  RUNNING: { label: "Running", badge: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-500" },
  IDLE: { label: "Idle", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  STANDBY: { label: "Standby", badge: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" },
};

const LAYER_DOT: Record<string, string> = {
  ingestion: "bg-violet-600",
  orchestration: "bg-blue-600",
  pdc: "bg-emerald-600",
  tdc: "bg-red-600",
  experience: "bg-pink-600",
};

// ─── STORY CARD ───────────────────────────────────────────────────────────────

function StoryCard({ story, isOpen, onToggle }: {
  story: AnalystStory;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const guaranteeColor = GUARANTEE_TYPE_COLORS[story.guaranteeType] || "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${LAYER_DOT[TOUCHPOINTS.find(t => t.id === story.touchpointId)?.layerId || ""] || "bg-slate-600"}`}>
          {story.touchpointId}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-foreground">{story.title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${guaranteeColor}`}>
              {story.guaranteeType}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{story.system} · {story.gate}</div>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border space-y-3">
              {/* Story ID */}
              <div className="flex items-center gap-2 pt-3">
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">{story.storyId}</span>
                <span className="text-xs text-muted-foreground">{story.layer}</span>
              </div>

              {/* Description */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Description</div>
                <p className="text-xs text-foreground leading-relaxed">{story.description}</p>
              </div>

              {/* Platform Guarantee */}
              <div className="bg-[#003A8F]/5 border border-[#003A8F]/15 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3 h-3 text-[#003A8F]" />
                  <span className="text-xs font-semibold text-[#003A8F]">Platform Guarantee</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{story.platformGuarantee}</p>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Acceptance Criteria</div>
                <div className="space-y-1">
                  {story.acceptanceCriteria.map(ac => (
                    <div key={ac.id} className="flex items-start gap-2 text-xs">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-foreground">{ac.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blitzy Build Logic */}
              <div className="bg-slate-900 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">Blitzy Build Logic</span>
                </div>
                <div className="text-xs text-slate-300 mb-2 font-medium">{story.blitzyTask}</div>
                <div className="space-y-1">
                  {story.blitzySteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="text-slate-600 font-mono shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <span>{step.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ANALYST AGENT DETAIL ─────────────────────────────────────────────────────

function AnalystAgentDetail() {
  const [activeTab, setActiveTab] = useState<"stories" | "guarantees" | "blitzy">("stories");
  const [openStory, setOpenStory] = useState<string | null>(null);

  const tabs = [
    { id: "stories" as const, label: "Story Library", icon: BookOpen, count: ANALYST_STORIES.length },
    { id: "guarantees" as const, label: "Platform Guarantees", icon: Shield, count: PLATFORM_GUARANTEES.length },
    { id: "blitzy" as const, label: "Blitzy Instructions", icon: Zap, count: ANALYST_STORIES.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-slate-50 border border-border rounded-xl p-4 mt-2 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-border rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded transition-all ${
                  activeTab === tab.id
                    ? "bg-[#003A8F] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Story Library tab */}
        {activeTab === "stories" && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {ANALYST_STORIES.length} stories generated from the DCT Delivery Model · T1–T11 runtime journey
            </div>
            {ANALYST_STORIES.map(story => (
              <StoryCard
                key={story.storyId}
                story={story}
                isOpen={openStory === story.storyId}
                onToggle={() => setOpenStory(prev => prev === story.storyId ? null : story.storyId)}
              />
            ))}
          </div>
        )}

        {/* Platform Guarantees tab */}
        {activeTab === "guarantees" && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              5 platform guarantees defined by the Analyst Agent story library
            </div>
            {PLATFORM_GUARANTEES.map(g => (
              <div key={g.id} className="bg-white border border-border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${g.color} flex items-center justify-center shrink-0`}>
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold text-foreground">{g.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ${GUARANTEE_TYPE_COLORS[g.type]}`}>
                        {g.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{g.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">Gate:</span>
                      <span className="text-xs font-medium text-foreground">{g.gate}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">Stories:</span>
                      {g.storyIds.map(sid => (
                        <span key={sid} className="text-xs font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          {sid.replace("DCT-S-", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Blitzy Instructions tab */}
        {activeTab === "blitzy" && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Blitzy execution instructions for all 11 runtime touchpoints
            </div>
            {ANALYST_STORIES.map(story => (
              <div key={story.storyId} className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${LAYER_DOT[TOUCHPOINTS.find(t => t.id === story.touchpointId)?.layerId || ""] || "bg-slate-600"}`}>
                    {story.touchpointId.replace("T", "")}
                  </div>
                  <span className="text-xs font-bold text-white">{story.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span className="text-xs text-amber-400 font-medium">{story.blitzyTask}</span>
                </div>
                <div className="space-y-1 pl-4 border-l border-slate-700">
                  {story.blitzySteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <Code2 className="w-3 h-3 text-slate-600 shrink-0 mt-0.5" />
                      <span>{step.step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── STANDARD AGENT DETAIL ────────────────────────────────────────────────────

function StandardAgentDetail({ agent }: { agent: AgentDefinition }) {
  const touchpoints = TOUCHPOINTS.filter(tp => agent.touchpointIds.includes(tp.id));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-slate-50 border border-border rounded-xl p-5 mt-2 space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Role Description</div>
          <p className="text-sm text-foreground leading-relaxed">{agent.description}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Touchpoints Executed</div>
          <div className="space-y-2">
            {touchpoints.map(tp => (
              <div key={tp.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-border">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${LAYER_DOT[tp.layerId] || "bg-slate-600"}`}>
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
      whileHover={{ y: -1 }}
      className={`w-full text-left bg-white border rounded-xl p-5 shadow-sm transition-all ${
        isSelected
          ? "border-[#003A8F] ring-2 ring-[#003A8F]/20 shadow-md"
          : "border-border hover:border-[#003A8F]/40 hover:shadow-md"
      }`}
    >
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
      <div className="flex items-center gap-1.5 mb-3">
        <Layers className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{layer?.label}</span>
        {layer?.isSystemOfRecord && (
          <span className="text-xs bg-[#003A8F]/10 text-[#003A8F] px-1.5 py-0.5 rounded font-medium">Authority</span>
        )}
        {agent.id === "analyst" && (
          <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium border border-amber-200 ml-1">
            {ANALYST_STORIES.length} Stories · {PLATFORM_GUARANTEES.length} Guarantees
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {agent.touchpointIds.map(tid => (
          <span key={tid} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium border border-slate-200">
            {tid}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>Last run: {agent.lastExecution}</span>
        </div>
        {isSelected
          ? <ChevronDown className="w-3.5 h-3.5 text-[#003A8F]" />
          : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        }
      </div>
    </motion.button>
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
  const activeCount = AGENTS.filter(a => a.status === "ACTIVE" || a.status === "RUNNING").length;

  return (
    <div className="p-6 space-y-6">
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

      <div className="grid grid-cols-1 gap-3">
        {AGENTS.map((agent) => (
          <div key={agent.id}>
            <AgentCard
              agent={agent}
              isSelected={selectedAgent === agent.id}
              onClick={() => setSelectedAgent(prev => prev === agent.id ? null : agent.id)}
            />
            <AnimatePresence>
              {selectedAgent === agent.id && (
                agent.id === "analyst"
                  ? <AnalystAgentDetail key="analyst-detail" />
                  : <StandardAgentDetail key={`${agent.id}-detail`} agent={agent} />
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <PlatformLayerConnector />

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Agent Hub · RSM | CATT · v3.1</span>
          <span>AI Orchestrator Layer — Stateless Compute · Never system of record</span>
        </div>
      </footer>
    </div>
  );
}
