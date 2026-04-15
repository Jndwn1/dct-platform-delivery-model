// ─────────────────────────────────────────────────────────────────────────────
// Weekly Demo Simulator — DCT Platform Data Flow Simulation
// PROTECTION RULE: This screen must NOT be removed or structurally altered.
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// Layout: Top controls bar → 5-node horizontal system flow →
//         System Events log (left) + Data State / API Proof / Demo Readiness (right)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ChevronRight, ChevronLeft, BarChart2, Mic, GitCompare,
  CheckCircle2, Clock, AlertCircle, Zap,
  Database, Network, FileText, ArrowRight,
  Play, RotateCcw, Shield
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type NodeStatus = "Complete" | "Processing" | "Pending";
type Readiness  = "Ready" | "Partial" | "Blocked";
type FeatureStatus = "Complete" | "Dev" | "Blocked";
type ApiMethod = "GET" | "POST" | "PUT";
type ApiSystem = "PDC" | "Orchestrator" | "TDC";

interface FlowNode {
  id: string;
  label: string;
  sub: string;
  system: "Portal" | "PDC" | "Orchestrator" | "TDC" | "Output";
  status: NodeStatus;
}

interface ApiEndpoint {
  method: ApiMethod;
  path: string;
  desc: string;
  system: ApiSystem;
}

interface BatchDemoData {
  name: string;
  shortName: string;
  readiness: Readiness;
  readinessDetail: string;
  runId: string;
  agentChain: string;
  status: string;
  target: string;
  totalSteps: number;
  events: { time: string; msg: string }[];
  apis: ApiEndpoint[];
  features: { id: string; label: string; status: FeatureStatus }[];
  flowNodes: FlowNode[];
}

// ─── BATCH DATA ───────────────────────────────────────────────────────────────

const BATCH_DATA: Record<string, BatchDemoData> = {
  "1": {
    name: "Batch 1 — File Ingestion & Initial Storage",
    shortName: "Batch 1 — File Ingestion",
    readiness: "Ready",
    readinessDetail: "PDC, APIs, Schema Lock available",
    runId: "RUN-20240315-0041",
    agentChain: "Ingest → Validate",
    status: "INGESTING",
    target: "PDC — Source Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Schema recognition triggered" },
      { time: "12:10:50 PM", msg: "Schema: Trial Balance — PASS" },
      { time: "12:10:50 PM", msg: "SourceRecord table populated" },
      { time: "12:10:50 PM", msg: "Validation complete — 1,842 records" },
    ],
    apis: [
      { method: "POST", path: "/ingest/job", desc: "Create ingestion job in PDC", system: "PDC" },
      { method: "GET",  path: "/schema/recognize/{fileId}", desc: "Run AI schema recognition", system: "Orchestrator" },
      { method: "GET",  path: "/ingest/{jobId}/status", desc: "Check ingestion job status", system: "PDC" },
    ],
    features: [
      { id: "DCT-101", label: "File intake via Tax Portal", status: "Complete" },
      { id: "DCT-102", label: "Schema recognition (AI)", status: "Complete" },
      { id: "DCT-103", label: "SourceRecord persistence in PDC", status: "Complete" },
      { id: "DCT-104", label: "G1 Schema Lock Certificate", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Processing" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "2": {
    name: "Batch 2 — Normalization & Cross-LOB Taxonomy",
    shortName: "Batch 2 — Normalization",
    readiness: "Ready",
    readinessDetail: "PDC, AI Orchestrator, APIs available",
    runId: "RUN-20240315-0042",
    agentChain: "Ingest → Normalize → Map → Validate",
    status: "NORMALIZING",
    target: "PDC — Normalized Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Normalization pipeline triggered" },
      { time: "12:10:38 PM", msg: "Status: PROCESSING → READY" },
      { time: "12:10:50 PM", msg: "Agent chain executing" },
      { time: "12:10:50 PM", msg: "Normalization event dispatched" },
      { time: "12:10:50 PM", msg: "Cross-LOB taxonomy mapping initiated" },
      { time: "12:10:50 PM", msg: "TDC handoff queued" },
    ],
    apis: [
      { method: "GET",  path: "/normalized/{runId}/facts",     desc: "Confirm normalized output ready for TDC", system: "PDC" },
      { method: "POST", path: "/orchestration/dispatch",       desc: "Dispatch agent chain to TDC",            system: "Orchestrator" },
      { method: "GET",  path: "/orchestration/{runId}/log",    desc: "Retrieve agent execution log",           system: "Orchestrator" },
    ],
    features: [
      { id: "DCT-201", label: "Normalization pipeline (AI)", status: "Complete" },
      { id: "DCT-202", label: "Cross-LOB taxonomy mappings", status: "Complete" },
      { id: "DCT-203", label: "NormalizedRecord table in PDC", status: "Dev" },
      { id: "DCT-204", label: "Contract publication (vNormalizedTb)", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Processing" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "3": {
    name: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    shortName: "Batch 3 — Tax Domain Authority",
    readiness: "Ready",
    readinessDetail: "TDC, PDC, APIs available",
    runId: "RUN-20240315-0042",
    agentChain: "Ingest → Normalize → Map → Validate",
    status: "ROUTING",
    target: "TDC Tax Domain",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "IngestionJob record created in PDC" },
      { time: "12:10:38 PM", msg: "SourceFile stored with full provenance" },
      { time: "12:10:38 PM", msg: "Normalization pipeline triggered" },
      { time: "12:10:38 PM", msg: "Status: PROCESSING → READY" },
      { time: "12:10:50 PM", msg: "Agent chain executing" },
      { time: "12:10:50 PM", msg: "Normalization event dispatched" },
      { time: "12:10:50 PM", msg: "Cross-LOB taxonomy mapping initiated" },
      { time: "12:10:50 PM", msg: "TDC handoff queued" },
    ],
    apis: [
      { method: "GET",  path: "/normalized/{runId}/facts",   desc: "Confirm normalized output ready for TDC", system: "PDC" },
      { method: "POST", path: "/orchestration/dispatch",     desc: "Dispatch agent chain to TDC",            system: "Orchestrator" },
      { method: "GET",  path: "/orchestration/{runId}/log",  desc: "Retrieve agent execution log",           system: "Orchestrator" },
    ],
    features: [
      { id: "DCT-301", label: "TDC schema established", status: "Complete" },
      { id: "DCT-302", label: "Tax taxonomy loaded", status: "Complete" },
      { id: "DCT-303", label: "TaxMapping table created", status: "Dev" },
      { id: "DCT-304", label: "G2 Invariant Lock Certificate", status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Processing" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "4": {
    name: "Batch 4 — AI Mapping Proposals, Decisions & Governance",
    shortName: "Batch 4 — AI Tax Mapping",
    readiness: "Ready",
    readinessDetail: "TDC, AI Mapping Layer, Governed Contract, APIs available",
    runId: "RUN-20240315-0043",
    agentChain: "Normalize → Propose → Govern → Decide → Publish",
    status: "PROPOSALS GENERATED",
    target: "TDC — Mapping Proposals & Decisions",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "NormalizedRecord set received from PDC (DocumentId: DOC-0041, RunId: RUN-0043)" },
      { time: "12:10:39 PM", msg: "Orchestrator: AI mapping pipeline triggered against TDC tax taxonomy" },
      { time: "12:10:42 PM", msg: "1,842 mapping proposals generated — Avg confidence: 94.7%" },
      { time: "12:10:42 PM", msg: "Proposals sent to TDC via governed contract (POST /api/tdc/mapping-proposals)" },
      { time: "12:10:43 PM", msg: "TDC: Proposals persisted as IMMUTABLE records — no edits permitted" },
      { time: "12:10:43 PM", msg: "TDC: Each proposal carries ProposalId, CanonicalAccountId, SuggestedTaxLine, ConfidenceScore" },
      { time: "12:10:43 PM", msg: "TDC: Source lineage attached — DocumentId → RunId → SourceRecordId" },
      { time: "12:10:44 PM", msg: "TDC: Decision state machine initialized — Status: Proposed" },
      { time: "12:10:50 PM", msg: "Roger read contract published — GET /api/tdc/mapping-proposals available (read-only)" },
    ],
    apis: [
      { method: "POST", path: "/api/tdc/mapping-proposals",        desc: "Orchestrator delivers immutable proposals to TDC via governed contract", system: "TDC" },
      { method: "GET",  path: "/api/tdc/mapping-proposals",        desc: "Retrieve proposals by entityId & period — read-only Roger surface",     system: "TDC" },
      { method: "PUT",  path: "/api/tdc/mapping-decisions/{id}",   desc: "Record practitioner decision: Proposed → Accepted / Rejected",          system: "TDC" },
    ],
    features: [
      { id: "DCT-401", label: "AI Mapping Proposals Generated",          status: "Complete" },
      { id: "DCT-402", label: "TDC Decision Workflow Active",             status: "Complete" },
      { id: "DCT-403", label: "Lineage Preserved Across Mapping Layer",   status: "Complete" },
      { id: "DCT-404", label: "Immutable Proposal Persistence in TDC",    status: "Dev" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal",   sub: "File Intake",                          system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",          sub: "Financial Truth — No Tax Logic",        system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "AI Mapping Proposals Generated",        system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",          sub: "Mapping Decisions + Governance Applied", system: "TDC",          status: "Processing" },
      { id: "out",    label: "Output",       sub: "Roger — Read-Only View",                system: "Output",       status: "Pending" },
    ],
  },
  "5": {
    name: "Batch 5 — Mapping Decisions & Governance",
    shortName: "Batch 5 — Mapping Decisions",
    readiness: "Partial",
    readinessDetail: "TDC available; Roger UI in dev",
    runId: "RUN-20240315-0044",
    agentChain: "Map → Decide → Persist → Publish",
    status: "DECIDING",
    target: "TDC — Tax Decisions",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Mapping proposals received" },
      { time: "12:10:38 PM", msg: "Decision workflow triggered" },
      { time: "12:10:50 PM", msg: "1,798 proposals approved" },
      { time: "12:10:50 PM", msg: "44 proposals modified by practitioner" },
      { time: "12:10:50 PM", msg: "TaxDecisionRecord-001 created" },
      { time: "12:10:50 PM", msg: "Immutable audit trail written" },
    ],
    apis: [
      { method: "POST", path: "/decisions/commit",           desc: "Commit tax decisions to TDC",          system: "TDC" },
      { method: "GET",  path: "/decisions/{runId}/records",  desc: "Retrieve immutable decision records",  system: "TDC" },
      { method: "GET",  path: "/decisions/{runId}/audit",    desc: "Retrieve audit trail",                 system: "TDC" },
    ],
    features: [
      { id: "DCT-501", label: "Tax decision workflow", status: "Complete" },
      { id: "DCT-502", label: "Immutable TaxDecisionRecord", status: "Dev" },
      { id: "DCT-503", label: "Practitioner override capture", status: "Dev" },
      { id: "DCT-504", label: "G3 Contract Publication", status: "Blocked" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Processing" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "6": {
    name: "Batch 6 — Practitioner Review & Adjustment Workflow",
    shortName: "Batch 6 — Practitioner Review",
    readiness: "Partial",
    readinessDetail: "TDC available; Roger UI partial",
    runId: "RUN-20240315-0045",
    agentChain: "Decide → Review → Adjust → Approve",
    status: "REVIEWING",
    target: "Roger UI — Practitioner View",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Tax decisions surfaced to Roger UI" },
      { time: "12:10:38 PM", msg: "Practitioner review session opened" },
      { time: "12:10:50 PM", msg: "Adjustment workflow triggered" },
      { time: "12:10:50 PM", msg: "Override recorded with justification" },
      { time: "12:10:50 PM", msg: "Approval workflow complete" },
    ],
    apis: [
      { method: "GET",  path: "/review/{runId}/decisions", desc: "Surface decisions to Roger UI",      system: "TDC" },
      { method: "POST", path: "/review/{runId}/adjust",    desc: "Submit practitioner adjustment",     system: "TDC" },
      { method: "POST", path: "/review/{runId}/approve",   desc: "Approve adjusted decisions",         system: "TDC" },
    ],
    features: [
      { id: "DCT-601", label: "Roger UI decision surface", status: "Dev" },
      { id: "DCT-602", label: "Practitioner adjustment workflow", status: "Dev" },
      { id: "DCT-603", label: "Approval and sign-off capture", status: "Blocked" },
      { id: "DCT-604", label: "Full lineage trace in UI", status: "Blocked" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Complete" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Processing" },
    ],
  },
  "7": {
    name: "Batch 7 — Rollforward & Prior Year Intelligence",
    shortName: "Batch 7 — Rollforward",
    readiness: "Partial",
    readinessDetail: "PDC available; Prior year data in dev",
    runId: "RUN-20240315-0046",
    agentChain: "Load → Compare → Rollforward → Validate",
    status: "COMPARING",
    target: "PDC — Rollforward Records",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Prior year dataset loaded" },
      { time: "12:10:38 PM", msg: "Year-over-year comparison triggered" },
      { time: "12:10:50 PM", msg: "Rollforward mapping generated" },
      { time: "12:10:50 PM", msg: "Delta records identified" },
    ],
    apis: [
      { method: "GET",  path: "/rollforward/{entityId}/prior",   desc: "Load prior year canonical records",   system: "PDC" },
      { method: "POST", path: "/rollforward/{entityId}/compare", desc: "Run year-over-year comparison",       system: "Orchestrator" },
      { method: "GET",  path: "/rollforward/{entityId}/delta",   desc: "Retrieve delta records",              system: "PDC" },
    ],
    features: [
      { id: "DCT-701", label: "Prior year data load", status: "Dev" },
      { id: "DCT-702", label: "Year-over-year comparison", status: "Dev" },
      { id: "DCT-703", label: "Rollforward mapping", status: "Blocked" },
      { id: "DCT-704", label: "Delta record persistence", status: "Blocked" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Processing" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Pending" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Pending" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
  "8": {
    name: "Batch 8 — Return Assembly, Filing & Lineage Closure",
    shortName: "Batch 8 — Return Assembly",
    readiness: "Partial",
    readinessDetail: "TDC available; Filing pipeline in dev",
    runId: "RUN-20240315-0047",
    agentChain: "Decide → Assemble → File → Close",
    status: "ASSEMBLING",
    target: "TDC — Filed Returns",
    totalSteps: 5,
    events: [
      { time: "12:10:38 PM", msg: "Tax decisions finalized" },
      { time: "12:10:38 PM", msg: "Return assembly triggered" },
      { time: "12:10:50 PM", msg: "Return package generated" },
      { time: "12:10:50 PM", msg: "G4 Lineage Closure initiated" },
    ],
    apis: [
      { method: "POST", path: "/return/assemble", desc: "Assemble tax return package",             system: "TDC" },
      { method: "POST", path: "/return/file",     desc: "Submit return to filing system",          system: "TDC" },
      { method: "POST", path: "/lineage/close",   desc: "Issue G4 Lineage Closure Certificate",   system: "PDC" },
    ],
    features: [
      { id: "DCT-801", label: "Return assembly pipeline", status: "Dev" },
      { id: "DCT-802", label: "Filing system integration", status: "Blocked" },
      { id: "DCT-803", label: "G4 Lineage Closure Certificate", status: "Blocked" },
      { id: "DCT-804", label: "Full audit trail closure", status: "Blocked" },
    ],
    flowNodes: [
      { id: "portal", label: "Tax Portal", sub: "File Intake",    system: "Portal",       status: "Complete" },
      { id: "pdc",    label: "PDC",        sub: "Financial Truth", system: "PDC",          status: "Complete" },
      { id: "orch",   label: "Orchestrator", sub: "Agent Routing", system: "Orchestrator", status: "Complete" },
      { id: "tdc",    label: "TDC",        sub: "Tax Judgment",   system: "TDC",          status: "Processing" },
      { id: "out",    label: "Output",     sub: "Roger (Read-Only)", system: "Output",     status: "Pending" },
    ],
  },
};

// ─── STYLE MAPS ───────────────────────────────────────────────────────────────

const NODE_STYLE: Record<string, { bg: string; border: string; color: string; icon: React.ElementType }> = {
  Portal:       { bg: "#1a2e1a", border: "#22c55e", color: "#22c55e", icon: FileText },
  PDC:          { bg: "#1a2e1a", border: "#22c55e", color: "#22c55e", icon: Database },
  Orchestrator: { bg: "#1e1a2e", border: "#a855f7", color: "#a855f7", icon: Network },
  TDC:          { bg: "#1a1a2e", border: "#64748b", color: "#94a3b8", icon: Shield },
  Output:       { bg: "#1a1a2e", border: "#64748b", color: "#94a3b8", icon: BarChart2 },
};

const NODE_STATUS_STYLE: Record<NodeStatus, { bg: string; text: string }> = {
  Complete:   { bg: "#166534", text: "#86efac" },
  Processing: { bg: "#3b0764", text: "#d8b4fe" },
  Pending:    { bg: "#1e293b", text: "#475569" },
};

const METHOD_COLOR: Record<ApiMethod, string> = {
  GET: "#3b82f6", POST: "#22c55e", PUT: "#f59e0b",
};

const FEATURE_STYLE: Record<FeatureStatus, { bg: string; text: string }> = {
  Complete: { bg: "#166534", text: "#86efac" },
  Dev:      { bg: "#1e3a5f", text: "#93c5fd" },
  Blocked:  { bg: "#7f1d1d", text: "#fca5a5" },
};

const READINESS_STYLE: Record<Readiness, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  Ready:   { bg: "#166534", text: "#86efac", dot: "#22c55e", icon: CheckCircle2 },
  Partial: { bg: "#78350f", text: "#fde68a", dot: "#f59e0b", icon: Clock },
  Blocked: { bg: "#7f1d1d", text: "#fca5a5", dot: "#ef4444", icon: AlertCircle },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WeeklyDemo() {
  const [location] = useLocation();

  // Read ?batch= query param for deep-link support (e.g. /weekly-demo?batch=1)
  const getInitialBatch = (): string => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const b = params.get("batch");
    return b && BATCH_DATA[b] ? b : "3";
  };

  const [selectedBatch, setSelectedBatch] = useState(getInitialBatch);
  const [currentStep, setCurrentStep] = useState(1);
  const [speakerMode, setSpeakerMode] = useState(true);
  const [running, setRunning] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<number>(-1);
  const eventsRef = useRef<HTMLDivElement>(null);

  const batch = BATCH_DATA[selectedBatch] ?? BATCH_DATA["3"];
  const totalSteps = batch.totalSteps;
  const readinessCfg = READINESS_STYLE[batch.readiness];
  const ReadinessIcon = readinessCfg.icon;

  // Sync batch selection when URL changes (deep-link from sidebar)
  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const b = params.get("batch");
    if (b && BATCH_DATA[b]) setSelectedBatch(b);
  }, [location]);

  // Reset on batch change
  useEffect(() => {
    setVisibleEvents(-1);
    setCurrentStep(1);
    setRunning(false);
  }, [selectedBatch]);

  // Animate events
  useEffect(() => {
    if (!running) return;
    if (visibleEvents >= batch.events.length) { setRunning(false); return; }
    const t = setTimeout(() => {
      setVisibleEvents(v => v + 1);
      if (eventsRef.current) eventsRef.current.scrollTop = eventsRef.current.scrollHeight;
    }, 400);
    return () => clearTimeout(t);
  }, [running, visibleEvents, batch.events.length]);

  const handleRun = () => { setVisibleEvents(0); setRunning(true); };
  const handleReset = () => { setVisibleEvents(-1); setRunning(false); };
  const handleNextStep = () => { if (currentStep < totalSteps) setCurrentStep(s => s + 1); };
  const handlePrevStep = () => { if (currentStep > 1) setCurrentStep(s => s - 1); };

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      backgroundColor: "#0a0f1a", color: "#e2e8f0",
      fontFamily: "'Inter', sans-serif", minHeight: "100vh"
    }}>

      {/* ── TOP CONTROLS BAR ──────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
        padding: "8px 16px", borderBottom: "1px solid #1e2a3a",
        backgroundColor: "#0d1420"
      }}>
        {/* Badges */}
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase" }}>
          System Simulation
        </span>
        <span style={{ fontSize: "10px", color: "#94a3b8", backgroundColor: "#1e293b", padding: "2px 8px", borderRadius: "4px" }}>
          No Live Execution
        </span>

        {/* Title */}
        <div style={{ flex: 1, fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>
          DCT Platform — Data Flow Simulation
        </div>

        {/* Batch selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Batch</span>
          <select
            value={selectedBatch}
            onChange={e => setSelectedBatch(e.target.value)}
            style={{
              backgroundColor: "#1e293b", color: "#e2e8f0",
              border: "1px solid #334155", borderRadius: "6px",
              padding: "4px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer"
            }}
          >
            {Object.entries(BATCH_DATA).map(([k, b]) => (
              <option key={k} value={k}>{b.shortName}</option>
            ))}
          </select>
        </div>

        {/* Readiness pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          backgroundColor: readinessCfg.bg, color: readinessCfg.text,
          padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: readinessCfg.dot, display: "inline-block" }} />
          {batch.readiness}
        </div>

        {/* Compare */}
        <button
          onClick={() => toast.info("Batch comparison — feature coming soon")}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            backgroundColor: "#1e293b", color: "#94a3b8",
            border: "1px solid #334155", borderRadius: "6px",
            padding: "4px 10px", fontSize: "11px", cursor: "pointer"
          }}
        >
          <GitCompare size={12} /> Compare
        </button>

        {/* Speaker toggle */}
        <button
          onClick={() => setSpeakerMode(m => !m)}
          style={{
            display: "flex", alignItems: "center", gap: "4px",
            backgroundColor: speakerMode ? "#1e3a5f" : "#1e293b",
            color: speakerMode ? "#93c5fd" : "#94a3b8",
            border: `1px solid ${speakerMode ? "#3b82f6" : "#334155"}`,
            borderRadius: "6px", padding: "4px 10px", fontSize: "11px", cursor: "pointer"
          }}
        >
          <Mic size={12} /> {speakerMode ? "Speaker" : "Audience"}
        </button>

        {/* Step progress */}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span style={{ fontSize: "11px", color: "#64748b" }}>Step {currentStep} of {totalSteps}</span>
          <div style={{ display: "flex", gap: "3px" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: "18px", height: "4px", borderRadius: "2px",
                backgroundColor: i < currentStep ? "#3b82f6" : "#1e293b"
              }} />
            ))}
          </div>
        </div>

        {/* Step Navigation */}
        <div style={{ display: "flex", gap: "5px" }}>
          <button
            onClick={handlePrevStep}
            disabled={currentStep <= 1}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              backgroundColor: currentStep <= 1 ? "#1e293b" : "#1e3a5f",
              color: currentStep <= 1 ? "#475569" : "#93c5fd",
              border: `1px solid ${currentStep <= 1 ? "#334155" : "#3b82f6"}`,
              borderRadius: "7px",
              padding: "6px 12px", fontSize: "12px", fontWeight: 700,
              cursor: currentStep <= 1 ? "not-allowed" : "pointer"
            }}
          >
            <ChevronLeft size={13} /> Prev
          </button>
          <button
            onClick={handleNextStep}
            disabled={currentStep >= totalSteps}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              backgroundColor: currentStep >= totalSteps ? "#1e293b" : "#2563eb",
              color: currentStep >= totalSteps ? "#475569" : "white",
              border: "none", borderRadius: "7px",
              padding: "6px 14px", fontSize: "12px", fontWeight: 700,
              cursor: currentStep >= totalSteps ? "not-allowed" : "pointer"
            }}
          >
            Next Step <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── SYSTEM FLOW ───────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #1e2a3a" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "10px" }}>
          System Flow
        </div>
        <div style={{ display: "flex", alignItems: "center", overflowX: "auto", gap: "0" }}>
          {batch.flowNodes.map((node, i) => {
            const ns = NODE_STYLE[node.system];
            const ss = NODE_STATUS_STYLE[node.status];
            const Icon = ns.icon;
            return (
              <div key={node.id} style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  backgroundColor: ns.bg, border: `2px solid ${ns.border}`,
                  borderRadius: "10px", padding: "12px 16px",
                  minWidth: "110px", textAlign: "center"
                }}>
                  <Icon size={18} style={{ color: ns.color, margin: "0 auto 5px" }} />
                  <div style={{ fontSize: "12px", fontWeight: 700, color: ns.color }}>{node.label}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "6px" }}>{node.sub}</div>
                  <div style={{
                    display: "inline-block",
                    backgroundColor: ss.bg, color: ss.text,
                    fontSize: "10px", fontWeight: 700,
                    padding: "2px 8px", borderRadius: "4px"
                  }}>
                    {node.status}
                  </div>
                  {/* Batch 4: immutability indicator on TDC node */}
                  {selectedBatch === "4" && node.system === "TDC" && (
                    <div style={{
                      marginTop: "5px",
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      backgroundColor: "#1c1a0e", color: "#fbbf24",
                      border: "1px solid #92400e",
                      fontSize: "10px", fontWeight: 700,
                      padding: "3px 7px", borderRadius: "4px",
                      letterSpacing: "0.04em"
                    }}>
                      🔒 IMMUTABLE
                    </div>
                  )}
                </div>
                {i < batch.flowNodes.length - 1 && (
                  <ArrowRight size={14} style={{ color: "#334155", flexShrink: 0, margin: "0 3px" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM PANELS ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* LEFT — System Events */}
        <div style={{
          flex: "1 1 0", borderRight: "1px solid #1e2a3a",
          display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 14px", borderBottom: "1px solid #1e2a3a"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Zap size={13} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                System Events
              </span>
            </div>
            <div style={{ display: "flex", gap: "5px" }}>
              <button onClick={handleRun} style={{
                display: "flex", alignItems: "center", gap: "3px",
                backgroundColor: "#166534", color: "#86efac",
                border: "none", borderRadius: "5px",
                padding: "4px 11px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
              }}>
                <Play size={11} /> Run
              </button>
              <button onClick={handleReset} style={{
                display: "flex", alignItems: "center", gap: "3px",
                backgroundColor: "#1e293b", color: "#94a3b8",
                border: "1px solid #334155", borderRadius: "5px",
                padding: "4px 11px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
              }}>
                <RotateCcw size={11} /> Reset
              </button>
            </div>
          </div>

          <div ref={eventsRef} style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {visibleEvents >= 0 && batch.events.slice(0, visibleEvents).map((ev, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "7px",
                padding: "4px 14px"
              }}>
                <ChevronRight size={10} style={{ color: "#3b82f6", flexShrink: 0, marginTop: "2px" }} />
                <span style={{ fontSize: "12px", color: "#cbd5e1", flex: 1 }}>{ev.msg}</span>
                <span style={{ fontSize: "11px", color: "#64748b", flexShrink: 0 }}>{ev.time}</span>
              </div>
            ))}
            {visibleEvents < 0 && !running && (
              <div style={{ padding: "14px", textAlign: "center", color: "#475569", fontSize: "12px" }}>
                Click Run to simulate system events
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — Data State + API Proof + Demo Readiness */}
        <div style={{ width: "290px", flexShrink: 0, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Data State */}
          <div style={{ borderBottom: "1px solid #1e2a3a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Database size={13} style={{ color: "#60a5fa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                Data State
              </span>
            </div>
            <div style={{ padding: "2px 14px 10px" }}>
              {[
                { label: "RunId",       value: batch.runId },
                { label: "AgentChain",  value: batch.agentChain },
                { label: "Status",      value: batch.status },
                { label: "Target",      value: batch.target },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", borderBottom: "1px solid #1e293b"
                }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{row.label}</span>
                  <span style={{ fontSize: "12px", color: "#e2e8f0", fontWeight: 600, textAlign: "right", maxWidth: "155px", wordBreak: "break-word" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* API Proof */}
          <div style={{ borderBottom: "1px solid #1e2a3a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Network size={13} style={{ color: "#a78bfa" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                API Proof
              </span>
            </div>
            <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "7px" }}>
              {batch.apis.map((api, i) => (
                <div key={i}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                    ● {api.system} API
                  </div>
                  <div style={{
                    backgroundColor: "#0d1420", border: "1px solid #1e293b",
                    borderRadius: "5px", padding: "5px 8px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: METHOD_COLOR[api.method] }}>{api.method}</span>
                      <code style={{ fontSize: "11px", color: "#93c5fd" }}>{api.path}</code>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{api.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Batch 4 — Governance Rules */}
          {selectedBatch === "4" && (
            <div style={{ borderBottom: "1px solid #1e2a3a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
                <Shield size={13} style={{ color: "#fbbf24" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                  Governance Rules
                </span>
              </div>
              <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {[
                  "Proposals are IMMUTABLE once created",
                  "Only TDC stores tax mapping decisions",
                  "PDC cannot store or modify tax logic",
                  "All mappings trace: DocumentId → RunId → SourceRecordId",
                ].map((rule, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px" }}>
                    <span style={{ color: "#fbbf24", fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>●</span>
                    <span style={{ fontSize: "12px", color: "#cbd5e1" }}>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch 4 — Roger Output (Read-Only) */}
          {selectedBatch === "4" && (
            <div style={{ borderBottom: "1px solid #1e2a3a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
                <BarChart2 size={13} style={{ color: "#94a3b8" }} />
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                  Roger Output — Read-Only
                </span>
                <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, backgroundColor: "#1e293b", color: "#94a3b8", padding: "2px 6px", borderRadius: "3px" }}>NO EDIT</span>
              </div>
              <div style={{ padding: "2px 14px 10px", display: "flex", flexDirection: "column", gap: "5px" }}>
                {[
                  { proposalId: "PROP-0001", account: "Acct-4421", taxLine: "Sch M-1 Line 2a", confidence: "97%", status: "Proposed" },
                  { proposalId: "PROP-0002", account: "Acct-1183", taxLine: "Form 1120 Line 28", confidence: "91%", status: "Accepted" },
                  { proposalId: "PROP-0003", account: "Acct-7702", taxLine: "Sch M-1 Line 4", confidence: "78%", status: "Rejected" },
                ].map((row) => (
                  <div key={row.proposalId} style={{
                    backgroundColor: "#0d1420", border: "1px solid #1e293b",
                    borderRadius: "5px", padding: "6px 8px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                      <code style={{ fontSize: "11px", color: "#60a5fa" }}>{row.proposalId}</code>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px",
                        backgroundColor: row.status === "Accepted" ? "#166534" : row.status === "Rejected" ? "#7f1d1d" : "#1e3a5f",
                        color: row.status === "Accepted" ? "#86efac" : row.status === "Rejected" ? "#fca5a5" : "#93c5fd",
                      }}>{row.status}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#cbd5e1" }}>{row.account} → {row.taxLine}</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Confidence: {row.confidence}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Demo Readiness */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 14px 4px" }}>
              <Shield size={13} style={{ color: "#34d399" }} />
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#cbd5e1" }}>
                Demo Readiness
              </span>
            </div>
            <div style={{ padding: "2px 14px 12px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "5px",
                backgroundColor: readinessCfg.bg, color: readinessCfg.text,
                padding: "6px 10px", borderRadius: "6px", marginBottom: "8px"
              }}>
                <ReadinessIcon size={12} />
                <span style={{ fontSize: "12px", fontWeight: 700 }}>{batch.readiness} to Demo</span>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>{batch.readinessDetail}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                Delivered in This Demo
              </div>
              {batch.features.map(f => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "3px 0" }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    backgroundColor: FEATURE_STYLE[f.status].bg,
                    color: FEATURE_STYLE[f.status].text,
                    padding: "2px 7px", borderRadius: "3px", flexShrink: 0
                  }}>
                    {f.status}
                  </span>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>{f.id} — {f.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
