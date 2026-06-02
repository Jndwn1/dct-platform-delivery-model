// IntegrationSimulation.tsx
// Enterprise Integration Simulation Mode — "The Centralized AI-Powered Operational
// Governance Layer for Roger ↔ DCT Enterprise Integration Management"
//
// Features:
//   • 5-step animated workflow simulation (Roger → Dependency → Collaboration → Governance → Resolution)
//   • 10 live operational panels (Risks, Questions, API Health, Batch Tracker, etc.)
//   • AI-powered Integration Governance Agent with 14 suggested prompts
//   • Animated dependency flow lines, pulse indicators, status cards
//   • RSM Deep Blue + Green/Amber/Red governance color system
//   • Keyboard shortcuts: Space = Play/Pause, → = Next Step

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play, Pause, SkipForward, RotateCcw, Bot, Send, Loader2,
  AlertTriangle, CheckCircle2, XCircle, Clock, Zap, Shield,
  GitBranch, Network, FileWarning, BarChart3, Users, Code2,
  TestTube, Search, Activity, Radio, Eye, ChevronDown, ChevronUp,
  Copy, Check, ClipboardList, ArrowRight, Sparkles, AlertCircle,
  RefreshCw, ExternalLink,
} from "lucide-react";
import { useLLM, type LLMMessage } from "@/hooks/useLLM";

// ── Types ─────────────────────────────────────────────────────────────────────

type RiskLevel = "blocking" | "warning" | "info" | "resolved";
type SystemName = "Roger" | "Orchestrator" | "PDC" | "TDC" | "QA" | "BA" | "DEV" | "Architect";
type SimStep = 0 | 1 | 2 | 3 | 4;

interface IntegrationRisk {
  id: string;
  title: string;
  system: SystemName;
  batch: string;
  level: RiskLevel;
  description: string;
  adoId?: string;
  resolvedAt?: string;
}

interface RogerQuestion {
  id: string;
  from: SystemName;
  to: SystemName;
  question: string;
  status: "open" | "answered" | "escalated";
  batch: string;
  timestamp: string;
}

interface ApiContract {
  name: string;
  path: string;
  batch: string;
  system: "PDC" | "TDC";
  status: "Published" | "In Progress" | "Missing" | "Gap";
  additiveOnly: boolean;
  consumerGuide: boolean;
  lineage: boolean;
}

interface SimEvent {
  time: string;
  actor: SystemName;
  action: string;
  detail: string;
  level: RiskLevel | "info" | "success";
}

// ── Static simulation data ────────────────────────────────────────────────────

const INTEGRATION_RISKS: IntegrationRisk[] = [
  { id: "r1", title: "FirmTaxonomyId missing from TDC Read Contract", system: "TDC", batch: "B4", level: "blocking", description: "Roger cannot render firm-level tax summaries without firmTaxonomyId in the published Read Contract. Blocking practitioner go-live.", adoId: "1349158" },
  { id: "r2", title: "tax_year field inconsistency (camelCase vs snake_case)", system: "PDC", batch: "B3", level: "blocking", description: "PDC exposes taxYear (camelCase) but Roger's mapping layer expects tax_year (snake_case). Contract mismatch will cause silent data drops.", adoId: "1349155" },
  { id: "r3", title: "Lineage reference missing from B8 Exception API", system: "TDC", batch: "B8", level: "warning", description: "ExceptionRecord API does not include lineageRef in the response payload. Audit trail will be incomplete for exception-driven decisions." },
  { id: "r4", title: "Mapping Proposal API not yet Swagger-published", system: "TDC", batch: "B4", level: "warning", description: "GET /api/v1/mapping-proposals exists in code but has no Swagger entry. Roger BA cannot validate the contract before sprint start." },
  { id: "r5", title: "PeriodStart/End not defined in B5 Entity API", system: "PDC", batch: "B5", level: "warning", description: "Entity Identity API response does not include periodStart or periodEnd. Tax year scoping will be ambiguous for multi-year entities." },
  { id: "r6", title: "B9 Gateway Read Contract not yet published", system: "PDC", batch: "B9", level: "info", description: "Gateway Read Contract (Ocelot) is In Progress. Consumer guide entry pending. Roger BA should not call underlying systems directly until contract is published." },
  { id: "r7", title: "Orchestrator contract gap — workflow state transitions", system: "Orchestrator", batch: "B6", level: "info", description: "Practitioner Review workflow states (PENDING_REVIEW, REVIEWED, ESCALATED) are not documented in the Orchestrator contract." },
];

const ROGER_QUESTIONS: RogerQuestion[] = [
  { id: "q1", from: "Roger", to: "TDC", question: "Which fields does the TDC Read Contract expose for the confidence band display (GREEN/YELLOW/RED)?", status: "open", batch: "B4", timestamp: "09:14" },
  { id: "q2", from: "Roger", to: "PDC", question: "What is the authoritative field name for tax year — taxYear or tax_year?", status: "escalated", batch: "B3", timestamp: "09:22" },
  { id: "q3", from: "Roger", to: "TDC", question: "Is firmTaxonomyId included in the B4 published Read Contract? If not, which batch delivers it?", status: "open", batch: "B4", timestamp: "09:31" },
  { id: "q4", from: "Roger", to: "Orchestrator", question: "Which Orchestrator workflow states does Roger need to display in the practitioner review screen?", status: "answered", batch: "B6", timestamp: "09:45" },
  { id: "q5", from: "Roger", to: "PDC", question: "Does the Entity Identity API support multi-year scoping via periodStart/periodEnd?", status: "open", batch: "B5", timestamp: "10:02" },
  { id: "q6", from: "Roger", to: "TDC", question: "Is the Mapping Proposals API additive-only? Can we depend on the current schema for Roger v1?", status: "open", batch: "B4", timestamp: "10:15" },
];

const API_CONTRACTS: ApiContract[] = [
  { name: "TDC Records (Read)", path: "GET /api/v1/tdc-records", batch: "B4", system: "TDC", status: "In Progress", additiveOnly: true, consumerGuide: false, lineage: true },
  { name: "Mapping Proposals", path: "GET /api/v1/mapping-proposals", batch: "B4", system: "TDC", status: "Gap", additiveOnly: false, consumerGuide: false, lineage: false },
  { name: "Mapping Decisions", path: "GET /api/v1/mapping-decisions", batch: "B4", system: "TDC", status: "In Progress", additiveOnly: true, consumerGuide: false, lineage: true },
  { name: "Entity Registry", path: "GET /api/v1/entities", batch: "B5", system: "PDC", status: "Published", additiveOnly: true, consumerGuide: true, lineage: true },
  { name: "Client Group List", path: "GET /api/v1/client-groups", batch: "B5", system: "PDC", status: "Published", additiveOnly: true, consumerGuide: true, lineage: false },
  { name: "Practitioner Review", path: "POST /api/v1/practitioner-reviews", batch: "B6", system: "TDC", status: "In Progress", additiveOnly: false, consumerGuide: false, lineage: false },
  { name: "Exception Record", path: "POST /api/v1/exceptions", batch: "B8", system: "TDC", status: "In Progress", additiveOnly: true, consumerGuide: false, lineage: false },
  { name: "Gateway Read Contract", path: "GET /api/v1/gateway/*", batch: "B9", system: "PDC", status: "Missing", additiveOnly: true, consumerGuide: false, lineage: false },
];

const BATCH_DEPS = [
  { from: "FC", to: "B1", status: "resolved", label: "Schema foundation" },
  { from: "B1", to: "B2", status: "resolved", label: "Ingestion → Normalization" },
  { from: "B2", to: "B3", status: "resolved", label: "Normalization → Tax Authority" },
  { from: "B3", to: "B4", status: "warning", label: "tax_year field gap" },
  { from: "B4", to: "B5", status: "warning", label: "Read Contract not published" },
  { from: "B5", to: "B6", status: "blocking", label: "firmTaxonomyId missing" },
  { from: "B6", to: "B7", status: "info", label: "Practitioner Review pending" },
  { from: "B7", to: "B8", status: "info", label: "Exception handling" },
];

const SOURCE_SYSTEMS = [
  { name: "Tax Portal", status: "ready", coverage: 100, note: "All ingestion paths validated" },
  { name: "Service Bus", status: "ready", coverage: 100, note: "Message routing confirmed" },
  { name: "PDC (Classified)", status: "warning", coverage: 78, note: "tax_year field gap in B3" },
  { name: "TDC", status: "blocking", coverage: 52, note: "Read Contract not published" },
  { name: "Orchestrator", status: "warning", coverage: 65, note: "Workflow states not documented" },
  { name: "Roger (Consumer)", status: "blocking", coverage: 38, note: "Blocked by TDC + PDC gaps" },
];

const QA_READINESS = [
  { area: "API Contract Tests", status: "warning", pct: 60, note: "Swagger gaps blocking test generation" },
  { area: "Lineage Validation", status: "warning", pct: 55, note: "B8 lineageRef missing" },
  { area: "Entity Identity Tests", status: "ready", pct: 90, note: "B5 entity API fully testable" },
  { area: "Exception Flow Tests", status: "blocking", pct: 20, note: "B8 Exception API In Progress" },
  { area: "Governance Compliance", status: "warning", pct: 70, note: "Additive-only not enforced on B4" },
  { area: "Roger Integration Tests", status: "blocking", pct: 15, note: "Blocked by TDC Read Contract" },
];

const GOVERNANCE_FEED: SimEvent[] = [
  { time: "09:02", actor: "Roger", action: "Story tagged DCT", detail: "Story #1349158 'TDC Read Contract for Roger' entered backlog with DCT dependency tag", level: "info" },
  { time: "09:14", actor: "BA", action: "Integration analysis initiated", detail: "BA Assistant analyzed story — identified 3 blocking gaps: firmTaxonomyId, Read Contract, lineage", level: "warning" },
  { time: "09:22", actor: "PDC", action: "Field inconsistency escalated", detail: "tax_year vs taxYear mismatch escalated to Architect. Contract amendment required before B3 gate.", level: "blocking" },
  { time: "09:31", actor: "Roger", action: "Question raised to TDC", detail: "Roger BA asked: 'Is firmTaxonomyId in the B4 Read Contract?' — Status: Open", level: "warning" },
  { time: "09:45", actor: "TDC", action: "Workflow states documented", detail: "Orchestrator contract updated with PENDING_REVIEW, REVIEWED, ESCALATED states. Q4 resolved.", level: "success" },
  { time: "10:02", actor: "Architect", action: "B4 contract review scheduled", detail: "Architecture review scheduled for B4 Read Contract. firmTaxonomyId inclusion to be confirmed.", level: "info" },
  { time: "10:15", actor: "DEV", action: "Swagger entry created", detail: "GET /api/v1/mapping-proposals Swagger entry added. Consumer guide entry pending.", level: "info" },
  { time: "10:28", actor: "QA", action: "QA risk report generated", detail: "6 QA risks identified. 2 blocking: Exception Flow Tests, Roger Integration Tests.", level: "warning" },
];

// ── Simulation steps

const SIM_STEPS = [
  {
    id: 0,
    label: "Roger Story Tagged",
    icon: <GitBranch className="w-4 h-4" />,
    color: "#003865",
    description: "A new ADO story enters the backlog tagged 'DCT'. The Integration Governance Agent detects the dependency and begins analysis.",
    story: { id: "1349158", title: "TDC Read Contract for Roger — Confidence Band Display", state: "Active", assignedTo: "Jennifer L.", batch: "B4", tags: "DCT, Roger, TDC, Read-Contract" },
    findings: [
      { label: "Batch Alignment", value: "Batch 4 — AI Mapping & TDC Integration", level: "info" as RiskLevel },
      { label: "APIs Referenced", value: "GET /api/v1/tdc-records, GET /api/v1/mapping-decisions", level: "info" as RiskLevel },
      { label: "Blocking Gap", value: "firmTaxonomyId not in published Read Contract", level: "blocking" as RiskLevel },
      { label: "Roger UI Impact", value: "Confidence Band screen (GREEN/YELLOW/RED) blocked", level: "blocking" as RiskLevel },
    ],
  },
  {
    id: 1,
    label: "Dependency Analysis",
    icon: <Network className="w-4 h-4" />,
    color: "#1a5a8a",
    description: "The agent identifies missing API contracts, payload gaps, and governance issues. BA follow-up actions and DEV questions are generated.",
    gaps: [
      { label: "Missing API Contract", detail: "TDC Read Contract not yet published. Roger cannot validate schema.", level: "blocking" as RiskLevel },
      { label: "Missing Payload Field", detail: "firmTaxonomyId absent from /api/v1/tdc-records response", level: "blocking" as RiskLevel },
      { label: "Missing Lineage", detail: "lineageRef not included in TDC Records API response", level: "warning" as RiskLevel },
      { label: "Field Inconsistency", detail: "tax_year (PDC) vs taxYear (Roger mapping) — contract mismatch", level: "blocking" as RiskLevel },
      { label: "Missing Governance Notes", detail: "Additive-only constraint not documented for B4 contract", level: "warning" as RiskLevel },
    ],
  },
  {
    id: 2,
    label: "Cross-Team Collaboration",
    icon: <Users className="w-4 h-4" />,
    color: "#065f46",
    description: "Roger BA, DCT BA, DEV, QA, and Architect collaborate to resolve dependencies. Questions are raised, decisions are tracked, risks are escalated.",
    interactions: [
      { from: "Roger BA", to: "DCT BA", message: "Is firmTaxonomyId in the B4 Read Contract?", status: "open" },
      { from: "DCT BA", to: "Architect", message: "B4 contract amendment needed — firmTaxonomyId must be added before G3.", status: "escalated" },
      { from: "Architect", to: "DEV", message: "Add firmTaxonomyId to TDC Records schema. Additive-only — no removals.", status: "in-progress" },
      { from: "DEV", to: "QA", message: "Swagger updated with firmTaxonomyId. Consumer guide entry pending.", status: "resolved" },
      { from: "QA", to: "Roger BA", message: "Test coverage ready for firmTaxonomyId once consumer guide is published.", status: "open" },
    ],
  },
  {
    id: 3,
    label: "Governance Validation",
    icon: <Shield className="w-4 h-4" />,
    color: "#7c3aed",
    description: "All governance gates are validated: additive-only compliance, contract publication, Swagger alignment, lineage, and ownership checks.",
    checks: [
      { label: "Additive-Only Validation", status: "warning" as RiskLevel, note: "B4 contract not yet tagged additive-only in Swagger" },
      { label: "Contract Publication (G3)", status: "blocking" as RiskLevel, note: "Read Contract not published — G3 gate blocked" },
      { label: "Swagger Alignment", status: "warning" as RiskLevel, note: "firmTaxonomyId added to code but not Swagger" },
      { label: "Lineage Validation", status: "warning" as RiskLevel, note: "lineageRef missing from TDC Records response" },
      { label: "Ownership Checks", status: "info" as RiskLevel, note: "TDC owns Read Contract. Roger is consumer only." },
      { label: "Batch Sequencing", status: "info" as RiskLevel, note: "B4 must complete G3 before B5 can start" },
    ],
  },
  {
    id: 4,
    label: "Resolution + Dashboard Update",
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "#065f46",
    description: "Blocking gaps are resolved. Batch status updates, Roger readiness improves, and the Integration Hub refreshes automatically.",
    updates: [
      { label: "B4 Read Contract", change: "Published — G3 gate passed", level: "success" as const },
      { label: "firmTaxonomyId", change: "Added to TDC Records schema (additive)", level: "success" as const },
      { label: "Roger Readiness", change: "TDC Records: Not Available → Partially Available", level: "success" as const },
      { label: "Confidence Band Screen", change: "Unblocked — Roger can now consume TDC Read Contract", level: "success" as const },
      { label: "Control Panel", change: "B4 API Readiness updated to ✓ Complete", level: "success" as const },
      { label: "Integration Hub", change: "Panel 2 Roger Consumability refreshed", level: "success" as const },
    ],
  },
];

const SUGGESTED_PROMPTS = [
  "Which Roger data points are blocked today?",
  "Why is FirmTaxonomyId blocking Roger readiness?",
  "Which APIs are still not Roger-consumable?",
  "Which batches are carrying forward into PI 2?",
  "What dependencies exist between Batch 4 and Batch 6?",
  "Which Swagger contracts are incomplete?",
  "Which stories tagged DCT require BA follow-up?",
  "What questions should Roger ask DCT for this screen?",
  "Which source systems are blocking Batch 9?",
  "Which contracts are additive-only?",
  "What governance gaps still exist?",
  "Which APIs are Orchestrator-facing only?",
  "Which Roger UI workflows are not yet backed by live APIs?",
  "Show unresolved integration risks.",
];

// ── Helper components ─────────────────────────────────────────────────────────

const RiskBadge = ({ level }: { level: RiskLevel | "success" | "info" }) => {
  const map: Record<string, string> = {
    blocking: "bg-red-100 text-red-700 border-red-200",
    warning:  "bg-amber-100 text-amber-700 border-amber-200",
    info:     "bg-blue-100 text-blue-700 border-blue-200",
    resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    success:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
  const labels: Record<string, string> = {
    blocking: "BLOCKING", warning: "WARNING", info: "INFO", resolved: "RESOLVED", success: "RESOLVED",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[level] ?? map.info}`}>
      {labels[level] ?? level.toUpperCase()}
    </span>
  );
};

const SystemBadge = ({ system }: { system: string }) => {
  const map: Record<string, string> = {
    Roger: "bg-purple-100 text-purple-700", TDC: "bg-blue-100 text-blue-700",
    PDC: "bg-indigo-100 text-indigo-700", Orchestrator: "bg-teal-100 text-teal-700",
    QA: "bg-orange-100 text-orange-700", BA: "bg-pink-100 text-pink-700",
    DEV: "bg-slate-100 text-slate-700", Architect: "bg-violet-100 text-violet-700",
  };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded ${map[system] ?? "bg-slate-100 text-slate-600"}`}>{system}</span>;
};

const PulseIndicator = ({ level }: { level: "blocking" | "warning" | "ok" }) => {
  const colors = { blocking: "bg-red-500", warning: "bg-amber-500", ok: "bg-emerald-500" };
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[level]}`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[level]}`} />
    </span>
  );
};

const StatusDot = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    ready: "bg-emerald-500", warning: "bg-amber-500", blocking: "bg-red-500", info: "bg-blue-400",
    Published: "bg-emerald-500", "In Progress": "bg-amber-500", Missing: "bg-red-500", Gap: "bg-red-400",
    resolved: "bg-emerald-500", escalated: "bg-red-500", open: "bg-amber-500", answered: "bg-emerald-500",
    "in-progress": "bg-blue-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${map[status] ?? "bg-slate-400"}`} />;
};

// ── Main component ────────────────────────────────────────────────────────────

export default function IntegrationSimulation() {
  const { ask, loading: llmLoading } = useLLM();

  // Simulation state
  const [simStep, setSimStep] = useState<SimStep>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [simStarted, setSimStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [feedVisible, setFeedVisible] = useState(5);
  const [activePanel, setActivePanel] = useState<string | null>("risks");

  // Agent state
  const [agentExpanded, setAgentExpanded] = useState(true);
  const [agentInput, setAgentInput] = useState("");
  const [agentHistory, setAgentHistory] = useState<{ role: "user" | "assistant"; content: string; ts: string }[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const agentBottomRef = useRef<HTMLDivElement>(null);

  // Auto-advance simulation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setSimStep(prev => {
        const next = (prev + 1) as SimStep;
        if (next > 4) { setIsPlaying(false); return prev; }
        setCompletedSteps(s => new Set(Array.from(s).concat(prev)));
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); setIsPlaying(p => !p); setSimStarted(true); }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        setSimStep(prev => {
          const next = Math.min(4, prev + 1) as SimStep;
          setCompletedSteps(s => new Set(Array.from(s).concat(prev)));
          setSimStarted(true);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (agentHistory.length > 0) agentBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agentHistory]);

  const advanceStep = () => {
    setSimStarted(true);
    setCompletedSteps(s => new Set(Array.from(s).concat(simStep)));
    setSimStep(prev => Math.min(4, prev + 1) as SimStep);
  };

  const resetSim = () => {
    setSimStep(0); setIsPlaying(false); setSimStarted(false); setCompletedSteps(new Set());
  };

  const systemPrompt = `You are the DCT Integration Governance Agent — an AI-powered enterprise integration analyst embedded in the DCT Platform Integration Simulation.

Your knowledge base includes:
ACTIVE RISKS: ${INTEGRATION_RISKS.map(r => `[${r.level.toUpperCase()}] ${r.title} (${r.batch}, ${r.system}): ${r.description}`).join(" | ")}
OPEN QUESTIONS: ${ROGER_QUESTIONS.map(q => `${q.from}→${q.to}: "${q.question}" [${q.status}] (${q.batch})`).join(" | ")}
API CONTRACTS: ${API_CONTRACTS.map(a => `${a.name} ${a.path} (${a.batch}, ${a.system}, ${a.status}, additiveOnly:${a.additiveOnly}, consumerGuide:${a.consumerGuide}, lineage:${a.lineage})`).join(" | ")}
BATCH DEPS: ${BATCH_DEPS.map(d => `${d.from}→${d.to} [${d.status}]: ${d.label}`).join(" | ")}
SOURCE SYSTEMS: ${SOURCE_SYSTEMS.map(s => `${s.name} ${s.coverage}% ready [${s.status}]: ${s.note}`).join(" | ")}
QA READINESS: ${QA_READINESS.map(q => `${q.area} ${q.pct}% [${q.status}]: ${q.note}`).join(" | ")}

Platform rules:
- PDC = Phoenix Data Consolidation (financial data, ingestion, entity registry)
- TDC = Tax Data Consolidation (tax decisions, mapping, eligibility)
- Roger = practitioner UI, READ-ONLY, consumes via published Read Contracts only
- Orchestrator = AI execution engine
- Additive-only: fields may never be removed or renamed once published
- Gate sequence: G1 Schema Lock → G2 Invariant Lock → G3 Contract Publication → G4 Lineage Closure

Answer governance, integration, dependency, and risk questions grounded in the data above. Use [BLOCKING], [WARNING], [INFO] severity labels. Be concise (150-300 words). Format with **bold** headers.`;

  const submitAgent = async (q: string) => {
    if (!q.trim() || llmLoading) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setAgentHistory(h => [...h, { role: "user", content: q.trim(), ts }]);
    setAgentInput("");
    const msgs: LLMMessage[] = [
      { role: "system", content: systemPrompt },
      ...agentHistory.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: "user", content: q.trim() },
    ];
    try {
      const answer = await ask(msgs);
      setAgentHistory(h => [...h, { role: "assistant", content: answer, ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    } catch {
      setAgentHistory(h => [...h, { role: "assistant", content: "⚠️ Agent encountered an error. Please try again.", ts: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }
  };

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => { setCopiedIdx(idx); setTimeout(() => setCopiedIdx(null), 2000); });
  };

  const renderContent = (text: string) =>
    text.split("\n").map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((p, j) =>
            p.startsWith("**") && p.endsWith("**")
              ? <strong key={j} className="font-semibold text-slate-900">{p.slice(2, -2)}</strong>
              : <span key={j}>{p}</span>
          )}
          {i < text.split("\n").length - 1 && <br />}
        </span>
      );
    });

  const currentStep = SIM_STEPS[simStep];
  const blockingCount = INTEGRATION_RISKS.filter(r => r.level === "blocking").length;
  const warningCount = INTEGRATION_RISKS.filter(r => r.level === "warning").length;
  const openQuestions = ROGER_QUESTIONS.filter(q => q.status === "open" || q.status === "escalated").length;
  const publishedContracts = API_CONTRACTS.filter(a => a.status === "Published").length;

  const PANELS = [
    { id: "risks", label: "Active Integration Risks", icon: <AlertTriangle className="w-3.5 h-3.5" />, badge: blockingCount, badgeColor: "bg-red-500" },
    { id: "questions", label: "Open Roger Questions", icon: <Search className="w-3.5 h-3.5" />, badge: openQuestions, badgeColor: "bg-amber-500" },
    { id: "contracts", label: "API Contract Health", icon: <Shield className="w-3.5 h-3.5" />, badge: API_CONTRACTS.filter(a => a.status !== "Published").length, badgeColor: "bg-amber-500" },
    { id: "batches", label: "Batch Dependency Tracker", icon: <GitBranch className="w-3.5 h-3.5" />, badge: null, badgeColor: "" },
    { id: "feed", label: "Governance Decision Feed", icon: <Activity className="w-3.5 h-3.5" />, badge: null, badgeColor: "" },
    { id: "sources", label: "Source System Readiness", icon: <Radio className="w-3.5 h-3.5" />, badge: SOURCE_SYSTEMS.filter(s => s.status === "blocking").length, badgeColor: "bg-red-500" },
    { id: "qa", label: "QA Readiness", icon: <TestTube className="w-3.5 h-3.5" />, badge: QA_READINESS.filter(q => q.status === "blocking").length, badgeColor: "bg-red-500" },
    { id: "roger", label: "Roger UI Readiness", icon: <Eye className="w-3.5 h-3.5" />, badge: null, badgeColor: "" },
    { id: "pi", label: "PI Carry Forward Risks", icon: <BarChart3 className="w-3.5 h-3.5" />, badge: null, badgeColor: "" },
    { id: "swagger", label: "Swagger Gap Monitor", icon: <Code2 className="w-3.5 h-3.5" />, badge: API_CONTRACTS.filter(a => !a.consumerGuide).length, badgeColor: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* ── War Room Header ── */}
      <div className="bg-gradient-to-r from-[#001f3f] via-[#003865] to-[#004a80] text-white px-6 py-4 shadow-xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Integration Simulation Mode</h1>
                <span className="flex items-center gap-1 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              </div>
              <p className="text-xs text-blue-300">Roger ↔ DCT Enterprise Integration Governance · AI-Powered Operational Command Center</p>
            </div>
          </div>

          {/* Live metrics */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-red-900/30 border border-red-700/40 px-3 py-1.5 rounded-lg">
              <PulseIndicator level="blocking" />
              <span className="text-xs font-bold text-red-300">{blockingCount} Blocking</span>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-900/30 border border-amber-700/40 px-3 py-1.5 rounded-lg">
              <PulseIndicator level="warning" />
              <span className="text-xs font-bold text-amber-300">{warningCount} Warnings</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-900/30 border border-blue-700/40 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-blue-300">{openQuestions} Open Questions</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-700/40 px-3 py-1.5 rounded-lg">
              <span className="text-xs font-bold text-emerald-300">{publishedContracts}/{API_CONTRACTS.length} Contracts</span>
            </div>
          </div>

          {/* Sim controls */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 hidden md:block">Space = Play/Pause · → = Next</span>
            <button onClick={resetSim} className="flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/20 text-white px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => { setSimStarted(true); setIsPlaying(p => !p); }}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors ${isPlaying ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
            >
              {isPlaying ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> {simStarted ? "Resume" : "Run Simulation"}</>}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* ── 5-Step Workflow ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#003865] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-bold">Enterprise Integration Workflow</span>
              <span className="text-xs text-blue-300">· 5-step simulation</span>
            </div>
            <button onClick={advanceStep} disabled={simStep >= 4}
              className="flex items-center gap-1.5 text-xs font-bold bg-white/10 border border-white/20 text-white px-3 py-1 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <SkipForward className="w-3.5 h-3.5" />
              Next Step
            </button>
          </div>

          {/* Step progress bar */}
          <div className="flex border-b border-slate-100">
            {SIM_STEPS.map((step, i) => {
              const isDone = completedSteps.has(i);
              const isActive = simStep === i && simStarted;
              return (
                <button key={step.id} onClick={() => { setSimStarted(true); setSimStep(i as SimStep); }}
                  className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 text-xs font-semibold transition-all border-b-2 ${
                    isDone ? "border-emerald-500 text-emerald-700 bg-emerald-50"
                    : isActive ? "border-[#003865] text-[#003865] bg-blue-50"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    isDone ? "bg-emerald-500" : isActive ? "bg-[#003865]" : "bg-slate-200"
                  }`}>
                    {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-center leading-tight hidden sm:block">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active step content */}
          <div className="p-5">
            {!simStarted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-[#003865]/10 flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-[#003865]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">Enterprise Integration War Room</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                  Click <strong>Run Simulation</strong> to walk through a live Roger ↔ DCT integration governance scenario, or click any step above to jump directly.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button onClick={() => { setSimStarted(true); setIsPlaying(true); }}
                    className="flex items-center gap-2 text-sm font-bold bg-[#003865] text-white px-5 py-2.5 rounded-xl hover:bg-[#004a80] transition-colors">
                    <Play className="w-4 h-4" /> Run Full Simulation
                  </button>
                  <button onClick={() => { setSimStarted(true); setSimStep(0); }}
                    className="flex items-center gap-2 text-sm font-semibold bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors">
                    Step Through Manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: currentStep.color }}>
                    {currentStep.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800">Step {simStep + 1} — {currentStep.label}</h3>
                      {isPlaying && <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{currentStep.description}</p>
                  </div>
                </div>

                {/* Step 0 — Story */}
                {simStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => { const s0 = currentStep as typeof SIM_STEPS[0]; return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                        <GitBranch className="w-3.5 h-3.5" /> ADO Story Detected
                      </div>
                      <div className="text-xs font-semibold text-slate-800">#{s0.story?.id} — {s0.story?.title}</div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-slate-600">
                        <div><span className="font-semibold">State:</span> {s0.story?.state}</div>
                        <div><span className="font-semibold">Assigned:</span> {s0.story?.assignedTo}</div>
                        <div><span className="font-semibold">Batch:</span> {s0.story?.batch}</div>
                        <div><span className="font-semibold">Tags:</span> {s0.story?.tags}</div>
                      </div>
                    </div>); })()}
                    <div className="space-y-2">
                      {(currentStep as typeof SIM_STEPS[0]).findings?.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                          <RiskBadge level={f.level} />
                          <div className="text-xs"><span className="font-semibold text-slate-700">{f.label}:</span> <span className="text-slate-600">{f.value}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1 — Gaps */}
                {simStep === 1 && (
                  <div className="space-y-2">
                    {(currentStep as typeof SIM_STEPS[1]).gaps?.map((g, i) => (
                      <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                        <RiskBadge level={g.level} />
                        <div className="text-xs"><span className="font-semibold text-slate-800">{g.label}</span> — <span className="text-slate-600">{g.detail}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2 — Collaboration */}
                {simStep === 2 && (
                  <div className="space-y-2">
                    {(currentStep as typeof SIM_STEPS[2]).interactions?.map((interaction, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                        <SystemBadge system={interaction.from} />
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <SystemBadge system={interaction.to} />
                        <span className="text-xs text-slate-600 flex-1 min-w-0 truncate">{interaction.message}</span>
                        <StatusDot status={interaction.status} />
                        <span className="text-xs text-slate-400 capitalize shrink-0">{interaction.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 3 — Governance */}
                {simStep === 3 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(currentStep as typeof SIM_STEPS[3]).checks?.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                        <RiskBadge level={c.status} />
                        <div className="text-xs min-w-0">
                          <div className="font-semibold text-slate-800">{c.label}</div>
                          <div className="text-slate-500 truncate">{c.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 4 — Resolution */}
                {simStep === 4 && (
                  <div className="space-y-2">
                    {(currentStep as typeof SIM_STEPS[4]).updates?.map((u, i) => (
                      <div key={i} className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="text-xs"><span className="font-semibold text-slate-800">{u.label}:</span> <span className="text-emerald-700">{u.change}</span></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Next button */}
                {simStep < 4 && (
                  <div className="pt-2 flex justify-end">
                    <button onClick={advanceStep}
                      className="flex items-center gap-2 text-xs font-bold bg-[#003865] text-white px-4 py-2 rounded-lg hover:bg-[#004a80] transition-colors">
                      Next — {SIM_STEPS[simStep + 1].label} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 10 Live Panels ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#003865] text-white">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-bold">Operational Control Tower</span>
              <span className="text-xs text-blue-300">· 10 live panels</span>
            </div>
          </div>

          {/* Panel selector */}
          <div className="border-b border-slate-100 overflow-x-auto">
            <div className="flex min-w-max">
              {PANELS.map(p => (
                <button key={p.id} onClick={() => setActivePanel(activePanel === p.id ? null : p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${activePanel === p.id ? "border-[#003865] text-[#003865] bg-blue-50" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}>
                  {p.icon}
                  {p.label}
                  {p.badge !== null && p.badge > 0 && (
                    <span className={`text-xs font-bold text-white px-1.5 py-0.5 rounded-full ${p.badgeColor}`}>{p.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activePanel && (
            <div className="p-4">

              {/* Panel 1 — Active Integration Risks */}
              {activePanel === "risks" && (
                <div className="space-y-2">
                  {INTEGRATION_RISKS.map(r => (
                    <div key={r.id} className={`flex items-start gap-3 rounded-lg px-4 py-3 border ${r.level === "blocking" ? "bg-red-50 border-red-200" : r.level === "warning" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"}`}>
                      <PulseIndicator level={r.level === "blocking" ? "blocking" : r.level === "warning" ? "warning" : "ok"} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800">{r.title}</span>
                          <SystemBadge system={r.system} />
                          <span className="text-xs text-slate-500 font-mono">{r.batch}</span>
                          {r.adoId && <a href={`https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${r.adoId}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">#{r.adoId} <ExternalLink className="w-2.5 h-2.5" /></a>}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{r.description}</p>
                      </div>
                      <RiskBadge level={r.level} />
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 2 — Open Roger Questions */}
              {activePanel === "questions" && (
                <div className="space-y-2">
                  {ROGER_QUESTIONS.map(q => (
                    <div key={q.id} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <StatusDot status={q.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <SystemBadge system={q.from} />
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <SystemBadge system={q.to} />
                          <span className="text-xs text-slate-400">{q.timestamp}</span>
                          <span className="text-xs font-mono text-slate-500">{q.batch}</span>
                        </div>
                        <p className="text-xs text-slate-700">{q.question}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${q.status === "open" ? "bg-amber-100 text-amber-700" : q.status === "escalated" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{q.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 3 — API Contract Health */}
              {activePanel === "contracts" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {["Contract", "Path", "Batch", "System", "Status", "Additive-Only", "Consumer Guide", "Lineage"].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {API_CONTRACTS.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 font-semibold text-slate-800">{c.name}</td>
                          <td className="px-3 py-2 font-mono text-slate-500">{c.path}</td>
                          <td className="px-3 py-2 font-mono text-slate-600">{c.batch}</td>
                          <td className="px-3 py-2"><SystemBadge system={c.system} /></td>
                          <td className="px-3 py-2"><span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${c.status === "Published" ? "bg-emerald-100 text-emerald-700" : c.status === "In Progress" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{c.status}</span></td>
                          <td className="px-3 py-2 text-center">{c.additiveOnly ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />}</td>
                          <td className="px-3 py-2 text-center">{c.consumerGuide ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />}</td>
                          <td className="px-3 py-2 text-center">{c.lineage ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-400 mx-auto" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Panel 4 — Batch Dependency Tracker */}
              {activePanel === "batches" && (
                <div className="space-y-2">
                  {BATCH_DEPS.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <span className="text-xs font-bold font-mono text-slate-700 w-6 text-center">{d.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-xs font-bold font-mono text-slate-700 w-6 text-center">{d.to}</span>
                      <div className="flex-1 text-xs text-slate-600">{d.label}</div>
                      <RiskBadge level={d.status as RiskLevel} />
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 5 — Governance Decision Feed */}
              {activePanel === "feed" && (
                <div className="space-y-2">
                  {GOVERNANCE_FEED.slice(0, feedVisible).map((e, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <span className="text-xs text-slate-400 font-mono shrink-0 w-10">{e.time}</span>
                      <SystemBadge system={e.actor} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-800">{e.action}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{e.detail}</div>
                      </div>
                      <RiskBadge level={e.level as RiskLevel} />
                    </div>
                  ))}
                  {feedVisible < GOVERNANCE_FEED.length && (
                    <button onClick={() => setFeedVisible(v => v + 5)} className="w-full text-xs text-blue-600 hover:text-blue-800 py-2 text-center">
                      Show more events
                    </button>
                  )}
                </div>
              )}

              {/* Panel 6 — Source System Readiness */}
              {activePanel === "sources" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SOURCE_SYSTEMS.map((s, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${s.status === "blocking" ? "bg-red-50 border-red-200" : s.status === "warning" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">{s.name}</span>
                        <RiskBadge level={s.status as RiskLevel} />
                      </div>
                      <div className="w-full bg-white rounded-full h-2 mb-1.5 border border-slate-200">
                        <div className={`h-2 rounded-full transition-all ${s.status === "blocking" ? "bg-red-500" : s.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${s.coverage}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{s.note}</span>
                        <span className="font-bold text-slate-700">{s.coverage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 7 — QA Readiness */}
              {activePanel === "qa" && (
                <div className="space-y-2">
                  {QA_READINESS.map((q, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <div className="w-36 shrink-0 text-xs font-semibold text-slate-700">{q.area}</div>
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                          <div className={`h-2 rounded-full ${q.status === "blocking" ? "bg-red-500" : q.status === "warning" ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${q.pct}%` }} />
                        </div>
                        <div className="text-xs text-slate-500">{q.note}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-slate-700">{q.pct}%</span>
                        <RiskBadge level={q.status as RiskLevel} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 8 — Roger UI Readiness */}
              {activePanel === "roger" && (
                <div className="space-y-3">
                  {[
                    { screen: "Confidence Band Display", batch: "B4", status: "blocking", note: "TDC Read Contract not published. firmTaxonomyId missing." },
                    { screen: "Mapping Proposals Review", batch: "B4", status: "warning", note: "Swagger entry added but consumer guide missing." },
                    { screen: "Entity Identity View", batch: "B5", status: "ready", note: "Entity Registry API published. PeriodStart/End gap noted." },
                    { screen: "Client Group List", batch: "B5", status: "ready", note: "Client Groups API published and consumer guide available." },
                    { screen: "Practitioner Review Workflow", batch: "B6", status: "warning", note: "Workflow states documented. API In Progress." },
                    { screen: "Exception Management", batch: "B8", status: "blocking", note: "Exception API In Progress. Lineage missing." },
                    { screen: "Gateway Consumer Screen", batch: "B9", status: "warning", note: "Gateway Read Contract In Progress. Roger should consume via gateway — not direct system calls." },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${r.status === "blocking" ? "bg-red-50 border-red-200" : r.status === "warning" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <PulseIndicator level={r.status === "blocking" ? "blocking" : r.status === "warning" ? "warning" : "ok"} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-800">{r.screen}</div>
                        <div className="text-xs text-slate-500">{r.note}</div>
                      </div>
                      <span className="text-xs font-mono text-slate-500 shrink-0">{r.batch}</span>
                      <RiskBadge level={r.status as RiskLevel} />
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 9 — PI Carry Forward Risks */}
              {activePanel === "pi" && (
                <div className="space-y-3">
                  {[
                    { item: "TDC Read Contract (B4)", pi: "PI 1 → PI 2", risk: "blocking", note: "G3 gate not passed. firmTaxonomyId and lineage gaps must be resolved before PI 2 sprint 1." },
                    { item: "tax_year field contract amendment (B3)", pi: "PI 1 → PI 2", risk: "blocking", note: "PDC contract amendment required. Affects all downstream consumers including Roger and Orchestrator." },
                    { item: "Practitioner Review API (B6)", pi: "PI 1 → PI 2", risk: "warning", note: "API In Progress. Consumer guide and Swagger entry pending. Roger cannot build review screen." },
                    { item: "Exception API Lineage (B8)", pi: "PI 2 → PI 3", risk: "warning", note: "lineageRef missing from Exception API response. Audit trail incomplete." },
                    { item: "Gateway Read Contract (B9)", pi: "PI 2 Committed", risk: "warning", note: "Gateway Read Contract In Progress. Roger and all consumers must route through Ocelot gateway — no direct IMS/CEM/TIM calls permitted." },
                    { item: "Consumer Guide entries (B4, B6, B8)", pi: "PI 1 → PI 2", risk: "warning", note: "3 APIs missing consumer guide entries. Roger BA cannot validate integration before sprint start." },
                  ].map((r, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${r.risk === "blocking" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800">{r.item}</span>
                        <RiskBadge level={r.risk as RiskLevel} />
                      </div>
                      <div className="text-xs text-slate-500 mb-1.5">{r.note}</div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600">{r.pi}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Panel 10 — Swagger Gap Monitor */}
              {activePanel === "swagger" && (
                <div className="space-y-2">
                  {API_CONTRACTS.filter(c => !c.consumerGuide || !c.lineage || c.status !== "Published").map((c, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-slate-800">{c.name}</span>
                          <span className="text-xs font-mono text-slate-500">{c.path}</span>
                          <SystemBadge system={c.system} />
                          <span className="text-xs font-mono text-slate-500">{c.batch}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {!c.consumerGuide && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">No Consumer Guide</span>}
                          {!c.lineage && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">No Lineage Ref</span>}
                          {!c.additiveOnly && <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Additive-Only Not Set</span>}
                          {c.status !== "Published" && <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">Not Published</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Integration Governance Agent ── */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => setAgentExpanded(e => !e)}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#001f3f] via-[#003865] to-[#004a80] text-white hover:from-[#002a55] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-200" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold flex items-center gap-2">
                  Integration Governance Agent
                  <span className="text-xs font-normal bg-blue-500/30 text-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> AI-Powered
                  </span>
                </div>
                <div className="text-xs text-blue-300">Ask operational integration questions · Grounded on live platform data</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {agentHistory.length > 0 && <span className="text-xs text-blue-300 bg-blue-800/40 px-2 py-0.5 rounded-full">{Math.ceil(agentHistory.length / 2)} exchanges</span>}
              {agentExpanded ? <ChevronUp className="w-4 h-4 text-blue-300" /> : <ChevronDown className="w-4 h-4 text-blue-300" />}
            </div>
          </button>

          {agentExpanded && (
            <div className="p-5 space-y-4">

              {/* Suggested prompts */}
              {agentHistory.length === 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Suggested Prompts</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.map((p, i) => (
                      <button key={i} onClick={() => submitAgent(p)} disabled={llmLoading}
                        className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 hover:border-blue-400 transition-colors text-left disabled:opacity-50">
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat history */}
              {agentHistory.length > 0 && (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {agentHistory.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${msg.role === "user" ? "bg-[#003865] text-white" : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"}`}>
                        {msg.role === "user" ? "BA" : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={`flex-1 max-w-[87%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${msg.role === "user" ? "bg-[#003865] text-white rounded-tr-sm" : "bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-sm"}`}>
                          {msg.role === "assistant" ? renderContent(msg.content) : msg.content}
                        </div>
                        {msg.role === "assistant" && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">{msg.ts}</span>
                            <button onClick={() => copyText(msg.content, idx)}
                              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                              {copiedIdx === idx ? <><Check className="w-3 h-3 text-emerald-500" /><span className="text-emerald-600">Copied</span></> : <><Copy className="w-3 h-3" /><span>Copy</span></>}
                            </button>
                            <button onClick={() => copyText(`=== DCT Integration Governance Agent ===\nQ: ${agentHistory[idx - 1]?.content ?? ""}\n\n${msg.content}\n\nSource: DCT Gate Dashboard · Integration Simulation\nTimestamp: ${msg.ts}`, idx + 1000)}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${copiedIdx === idx + 1000 ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"}`}>
                              {copiedIdx === idx + 1000 ? <><Check className="w-3 h-3" /> Saved</> : <><ClipboardList className="w-3 h-3" /> Save to ADO</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {llmLoading && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                        <span className="text-xs text-slate-500">Analyzing platform data…</span>
                      </div>
                    </div>
                  )}
                  <div ref={agentBottomRef} />
                </div>
              )}

              {/* Input */}
              <div className="relative">
                <textarea
                  value={agentInput}
                  onChange={e => setAgentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAgent(agentInput); } }}
                  rows={3}
                  placeholder="Ask about integration risks, API gaps, batch dependencies, governance issues, Roger readiness… (Enter to send)"
                  className="w-full text-xs border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none bg-slate-50 leading-relaxed"
                  disabled={llmLoading}
                />
                <button onClick={() => submitAgent(agentInput)} disabled={llmLoading || !agentInput.trim()}
                  className="absolute right-3 bottom-3 w-7 h-7 rounded-lg bg-[#003865] text-white flex items-center justify-center hover:bg-[#004a80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {llmLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  {INTEGRATION_RISKS.length} risks · {ROGER_QUESTIONS.length} questions · {API_CONTRACTS.length} contracts · {BATCH_DEPS.length} dependencies
                </div>
                {agentHistory.length > 0 && (
                  <button onClick={() => setAgentHistory([])} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Clear chat
                  </button>
                )}
              </div>

              {/* Follow-up chips */}
              {agentHistory.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_PROMPTS.slice(0, 6).map((p, i) => (
                      <button key={i} onClick={() => submitAgent(p)} disabled={llmLoading}
                        className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 hover:bg-slate-100 transition-colors disabled:opacity-50">
                        {p.length > 50 ? p.slice(0, 47) + "…" : p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
