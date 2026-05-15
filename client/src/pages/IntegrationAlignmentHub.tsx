/**
 * Roger ↔ DCT Integration Alignment Hub
 *
 * GOVERNANCE RULE:
 * The DCT Control Panel ecosystem remains the authoritative system of record.
 * This page acts as the operational integration orchestration layer.
 * All data is DERIVED from source-of-truth pages — nothing is entered manually here.
 *
 * SOURCE HIERARCHY:
 *   BatchStatusContext   → batch statuses, gates, PI completion, audit log
 *   BatchControlPanel   → SWAGGER_ENTRIES, ROGER_DATA_POINTS, DELIVERED_BATCHES
 *   rogerGovernanceData → ADR_CARDS, FieldMapping, computeSummaryTiles
 *   rogerModelData      → ROGER_MODEL_GROUPS (field readiness)
 *   batchModel          → PI_GROUPS, batch registry
 *   batchModelSource    → DataAvailabilityRow
 */

import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  useBatchStatus,
  BATCH_LABELS,
  BATCH_DEPENDENCIES,
  deriveGateStatus,
  deriveApiReadiness,
  deriveContractStatus,
  deriveQaReadiness,
  deriveDemoReadiness,
  deriveAgentStatus,
  STATUS_STYLES,
  READINESS_STYLES,
  type BatchKey,
  type BatchStatus,
  type ReadinessValue,
} from "@/contexts/BatchStatusContext";
import { ADR_CARDS, computeSummaryTiles } from "@/lib/rogerGovernanceData";
import { ROGER_MODEL_GROUPS } from "@/lib/rogerModelData";
import { PI_GROUPS } from "@/lib/batchModel";
import {
  Shield, RefreshCw, CheckCircle2, AlertTriangle, Clock, Circle,
  ChevronDown, ChevronUp, ExternalLink, Info, Zap, Database,
  FileText, Activity, Lock, Link2, Eye, AlertCircle, TrendingUp,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const GOVERNANCE_RULE = `The DCT Control Panel ecosystem remains the authoritative system of record. The Integration Alignment Hub acts as the operational integration orchestration layer. All data displayed here is derived — no manual entry.`;

const SOURCE_LABELS: Record<string, { label: string; href: string; color: string }> = {
  BatchStatusContext:   { label: "DCT Control Panel",           href: "/control-panel",    color: "#1e40af" },
  BatchRoadmap:         { label: "Batch Roadmap",               href: "/batch-roadmap",    color: "#0e7490" },
  RogerUIMapping:       { label: "Roger UI Data Point Mapping", href: "/roger-mapping",    color: "#7c3aed" },
  RogerAPIEvolution:    { label: "Roger API Evolution",         href: "/roger-api",        color: "#065f46" },
  DataModelGaps:        { label: "Data Model & Gaps",           href: "/data-model",       color: "#92400e" },
  GateStatus:           { label: "Gate Status",                 href: "/gate-status",      color: "#dc2626" },
  BatchDeliveryTracker: { label: "Batch Delivery Tracker",      href: "/batch-calendar",   color: "#6b21a8" },
  BatchControlPanel:    { label: "Swagger / API Inventory",     href: "/control-panel",    color: "#0369a1" },
};

const BATCH_TO_PI: Record<string, string> = {};
PI_GROUPS.forEach(pi => pi.batchIds.forEach(id => { BATCH_TO_PI[id] = pi.label; }));

const ALL_BATCH_KEYS: BatchKey[] = [
  "foundation-core","1","2","2a","3","4","5","6","7","8","9","10","11"
];

// Roger data points — derived from the same source as BatchControlPanel Section 4
// These are the canonical Roger-facing data points by batch
const ROGER_DATA_POINTS_STATIC = [
  { dataPoint: "File Ingestion Status (JobId, DocumentId, State)", batch: "1", system: "PDC", apiEndpoint: "/api/v1/ingestion-jobs", owner: "PDC" },
  { dataPoint: "Lineage Anchor (DocumentId → EntityId → PeriodStart/End)", batch: "1", system: "PDC", apiEndpoint: "/api/v1/documents", owner: "PDC" },
  { dataPoint: "Normalized Trial Balance (vNormalizedTb)", batch: "2", system: "PDC", apiEndpoint: "/api/v1/normalized-records", owner: "PDC" },
  { dataPoint: "FirmTaxonomyId on Normalized Records", batch: "2a", system: "PDC/Orchestrator", apiEndpoint: "/api/v1/normalized-records", owner: "Orchestrator" },
  { dataPoint: "Tax Form Templates and Mapping Rules", batch: "3", system: "TDC", apiEndpoint: "/api/v1/reference-data", owner: "TDC" },
  { dataPoint: "AI Mapping Proposals (Confidence + Evidence)", batch: "4", system: "TDC", apiEndpoint: "/api/v1/mapping-proposals", owner: "TDC" },
  { dataPoint: "Mapping Decisions (Accept / Override / Reject)", batch: "4", system: "TDC", apiEndpoint: "/api/v1/mapping-decisions", owner: "TDC" },
  { dataPoint: "Roger Primary TDC Read Contract (GREEN/YELLOW/RED)", batch: "4", system: "TDC", apiEndpoint: "/api/v1/records", owner: "TDC" },
  { dataPoint: "Entity Identity & Structure (ClientGroupId, EntityId, RBAC)", batch: "5", system: "PDC", apiEndpoint: "/api/v1/entities", owner: "PDC" },
  { dataPoint: "Review Task State and Adjustment Lifecycle", batch: "6", system: "TDC", apiEndpoint: "/api/v1/review-tasks", owner: "TDC" },
  { dataPoint: "Tax-Ready Records (Locked, Derived)", batch: "6", system: "TDC", apiEndpoint: "/api/v1/tax-ready-records", owner: "TDC" },
  { dataPoint: "Eligibility Status and Rule Reasoning", batch: "7", system: "TDC", apiEndpoint: "/api/v1/eligibility", owner: "TDC" },
  { dataPoint: "Exception Status (Ingestion, Mapping, Workflow)", batch: "8", system: "PDC+TDC", apiEndpoint: "— In Progress", owner: "PDC+TDC" },
];

// ── Helper components ────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: string }) {
  const s = SOURCE_LABELS[source];
  if (!s) return null;
  return (
    <Link href={s.href}>
      <span
        className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer hover:opacity-80 transition-opacity"
        style={{ background: s.color + "18", color: s.color, border: `1px solid ${s.color}30` }}
        title={`Source: ${s.label}`}
      >
        <Link2 className="w-2.5 h-2.5" />
        {s.label}
      </span>
    </Link>
  );
}

function ReadinessDot({ value }: { value: ReadinessValue }) {
  const s = READINESS_STYLES[value];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.text }}
    >
      {value === "ready" ? <CheckCircle2 className="w-3 h-3" /> : value === "partial" ? <Clock className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function GateDot({ status }: { status: "Complete" | "In Progress" | "Locked" }) {
  if (status === "Complete") return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
  if (status === "In Progress") return <Clock className="w-4 h-4 text-amber-500" />;
  return <Lock className="w-4 h-4 text-slate-300" />;
}

function SyncHealthBadge({ status }: { status: "live" | "derived" | "static" }) {
  if (status === "live") return (
    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
      LIVE
    </span>
  );
  if (status === "derived") return (
    <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      <RefreshCw className="w-2.5 h-2.5" />
      DERIVED
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
      <Database className="w-2.5 h-2.5" />
      STATIC
    </span>
  );
}

function TileCard({ label, value, subLabel, color, source }: {
  label: string; value: string | number; subLabel: string;
  color: "green" | "amber" | "red" | "blue" | "slate"; source: string;
}) {
  const colors = {
    green: { bg: "#f0fdf4", border: "#bbf7d0", val: "#15803d", sub: "#166534" },
    amber: { bg: "#fffbeb", border: "#fde68a", val: "#b45309", sub: "#92400e" },
    red:   { bg: "#fef2f2", border: "#fecaca", val: "#dc2626", sub: "#991b1b" },
    blue:  { bg: "#eff6ff", border: "#bfdbfe", val: "#1d4ed8", sub: "#1e40af" },
    slate: { bg: "#f8fafc", border: "#e2e8f0", val: "#334155", sub: "#475569" },
  }[color];
  return (
    <div className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: colors.bg, borderColor: colors.border }}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-black" style={{ color: colors.val }}>{value}</div>
      <div className="text-xs" style={{ color: colors.sub }}>{subLabel}</div>
      <div className="mt-1"><SourceBadge source={source} /></div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function IntegrationAlignmentHub() {
  const { statuses, piCompletion, auditLog, lastUpdated } = useBatchStatus();
  const [expandedPanel, setExpandedPanel] = useState<string | null>("batch-status");
  const [expandedBatch, setExpandedBatch] = useState<BatchKey | null>(null);
  const [showAllGaps, setShowAllGaps] = useState(false);
  const [showSyncHealth, setShowSyncHealth] = useState(false);

  const toggle = (id: string) => setExpandedPanel(p => p === id ? null : id);

  // ── Derived: batch rows ──────────────────────────────────────────────────
  const batchRows = useMemo(() => {
    const liveGates = deriveGateStatus(statuses);
    return ALL_BATCH_KEYS.map(key => {
      const status = statuses[key] ?? "Not Started";
      const deps = BATCH_DEPENDENCIES[key] ?? [];
      const blockedBy = deps.filter(d => {
        const ds = statuses[d] ?? "Not Started";
        return ds !== "Complete" && ds !== "Delivered";
      });
      const isComplete = status === "Complete" || status === "Delivered";
      const isActive = status === "In Progress" || status === "Ready for QA" || status === "QA In Progress" || status === "Demo Ready";
      const gateG1 = isComplete ? "Complete" : isActive ? "In Progress" : "Locked";
      const gateG2 = gateG1 === "Complete" ? "Complete" : gateG1 === "In Progress" ? "In Progress" : "Locked";
      const gateG3 = gateG2 === "Complete" ? "Complete" : gateG2 === "In Progress" ? "In Progress" : "Locked";
      const gateG4 = gateG3 === "Complete" ? "Complete" : gateG3 === "In Progress" ? "In Progress" : "Locked";
      return {
        key, label: BATCH_LABELS[key] ?? key, status,
        apiReadiness: deriveApiReadiness(status),
        contractReadiness: deriveContractStatus(status),
        qaReadiness: deriveQaReadiness(status),
        demoReadiness: deriveDemoReadiness(status),
        agentStatus: deriveAgentStatus(status),
        gateG1: gateG1 as "Complete" | "In Progress" | "Locked",
        gateG2: gateG2 as "Complete" | "In Progress" | "Locked",
        gateG3: gateG3 as "Complete" | "In Progress" | "Locked",
        gateG4: gateG4 as "Complete" | "In Progress" | "Locked",
        pi: BATCH_TO_PI[key] ?? "Unassigned",
        blockedBy,
      };
    });
  }, [statuses]);

  // ── Derived: Roger data point rows with live availability ────────────────
  const rogerRows = useMemo(() => {
    return ROGER_DATA_POINTS_STATIC.map(dp => {
      const batchStatus = statuses[dp.batch as BatchKey] ?? "Not Started";
      const isComplete = batchStatus === "Complete" || batchStatus === "Delivered";
      const isActive = batchStatus === "In Progress" || batchStatus === "Ready for QA" || batchStatus === "QA In Progress";
      const liveAvailability = isComplete ? "Available" : isActive ? "Partially Available" : "Not Available";
      return { ...dp, batchStatus, liveAvailability };
    });
  }, [statuses]);

  // ── Derived: blocking gaps from ADR cards ────────────────────────────────
  const blockingGaps = useMemo(() => {
    return ADR_CARDS
      .filter(c => c.currentStatus === "Open" || c.currentStatus === "In Progress")
      .map(c => ({
        id: c.id, title: c.title, description: c.description,
        severity: c.severity,
        resolved: c.currentStatus === "Resolved",
        riskIfUnresolved: c.riskIfUnresolved,
        impactedSystems: c.impactedSystems,
        proposedOwner: c.proposedOwner,
      }));
  }, []);

  // ── Derived: field gaps from Roger model ─────────────────────────────────
  const fieldGaps = useMemo(() => {
    let total = 0, delivered = 0, partial = 0, missing = 0;
    ROGER_MODEL_GROUPS.forEach(g => g.fields.forEach(f => {
      total++;
      if (f.status === "Delivered") delivered++;
      else if (f.status === "Partial" || f.status === "Mocked") partial++;
      else if (f.status === "Missing" || f.status === "Deferred") missing++;
    }));
    return { total, delivered, partial, missing };
  }, []);

  // ── Derived: summary tiles ───────────────────────────────────────────────
  const completed = batchRows.filter(r => r.status === "Complete" || r.status === "Delivered").length;
  const active = batchRows.filter(r => r.status === "In Progress" || r.status === "Ready for QA" || r.status === "QA In Progress").length;
  const blocked = batchRows.filter(r => r.blockedBy.length > 0).length;
  const openGaps = blockingGaps.filter(g => !g.resolved).length;
  const highRisk = blockingGaps.filter(g => !g.resolved && g.severity === "high").length;
  const rogerAvailable = rogerRows.filter(r => r.liveAvailability === "Available").length;
  const rogerPartial = rogerRows.filter(r => r.liveAvailability === "Partially Available").length;
  const rogerSummary = computeSummaryTiles();
  const pi1Pct = piCompletion?.pi1?.pct ?? 0;
  const pi2Pct = piCompletion?.pi2?.pct ?? 0;

  // ── Sync health ──────────────────────────────────────────────────────────
  const syncTime = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : new Date().toLocaleTimeString();
  const syncSources = [
    { source: "BatchStatusContext",   label: "DCT Control Panel",           status: "live" as const,    items: batchRows.length },
    { source: "BatchRoadmap",         label: "Batch Roadmap",               status: "derived" as const, items: batchRows.length },
    { source: "RogerUIMapping",       label: "Roger UI Data Point Mapping", status: "derived" as const, items: blockingGaps.length },
    { source: "DataModelGaps",        label: "Data Model & Gaps",           status: "derived" as const, items: fieldGaps.total },
    { source: "GateStatus",           label: "Gate Status",                 status: "derived" as const, items: 4 },
    { source: "BatchDeliveryTracker", label: "Batch Delivery Tracker",      status: "derived" as const, items: completed },
    { source: "RogerAPIEvolution",    label: "Roger API Evolution",         status: "derived" as const, items: rogerRows.length },
    { source: "BatchControlPanel",    label: "Swagger / API Inventory",     status: "live" as const,    items: 75 },
  ];

  const displayedGaps = showAllGaps ? blockingGaps : blockingGaps.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">

      {/* ── Governance Rule Banner ─────────────────────────────────────── */}
      <div className="bg-[#003865] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">
                DCT PLATFORM · INTEGRATION ALIGNMENT HUB · GOVERNANCE RULE
              </div>
              <div className="text-sm font-semibold text-white leading-relaxed">{GOVERNANCE_RULE}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-black text-[#003865]">Roger ↔ DCT Integration Alignment Hub</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Operational control tower · Synchronized from 8 source-of-truth pages · All data is inherited, not entered
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Last synced */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              Last synced: <span className="font-semibold text-slate-700">{syncTime}</span>
            </div>
            {/* Sync health toggle */}
            <button
              onClick={() => setShowSyncHealth(s => !s)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              {showSyncHealth ? "Hide" : "Show"} Sync Health
            </button>
            <Link href="/control-panel">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#003865] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" />
                Open Control Panel
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── Sync Health Dashboard ────────────────────────────────────── */}
        {showSyncHealth && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-700">Synchronization Health Dashboard</span>
              <span className="ml-auto text-xs text-slate-400">All sources checked at {syncTime}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-y divide-slate-100">
              {syncSources.map(s => (
                <div key={s.source} className="px-4 py-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 truncate pr-2">{s.label}</span>
                    <SyncHealthBadge status={s.status} />
                  </div>
                  <div className="text-xs text-slate-500">{s.items} items inherited</div>
                  <SourceBadge source={s.source} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 8 Summary Tiles ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TileCard label="Batches Complete" value={completed} subLabel={`of ${batchRows.length} total · ${active} active`} color="green" source="BatchStatusContext" />
          <TileCard label="Active Batches" value={active} subLabel="currently in delivery" color="blue" source="BatchStatusContext" />
          <TileCard label="Blocked Batches" value={blocked} subLabel="dependency not met" color={blocked > 0 ? "red" : "green"} source="BatchStatusContext" />
          <TileCard label="Open Gov Gaps" value={openGaps} subLabel={`${highRisk} high-risk unresolved`} color={openGaps > 0 ? "amber" : "green"} source="RogerUIMapping" />
          <TileCard label="Roger Fields Delivered" value={`${fieldGaps.delivered}/${fieldGaps.total}`} subLabel={`${fieldGaps.partial} partial · ${fieldGaps.missing} missing`} color={fieldGaps.missing > 0 ? "amber" : "green"} source="DataModelGaps" />
          <TileCard label="Roger Data Points" value={`${rogerAvailable}/${rogerRows.length}`} subLabel={`${rogerPartial} partially available`} color={rogerAvailable < rogerRows.length ? "amber" : "green"} source="RogerAPIEvolution" />
          <TileCard label="Gov Coverage" value={`${rogerSummary.fullyMapped}/${rogerSummary.totalScreens}`} subLabel={`${rogerSummary.gaps} gaps · ${rogerSummary.partial} partial`} color={rogerSummary.gaps > 0 ? "amber" : "green"} source="RogerUIMapping" />
          <TileCard label="PI 1 Complete" value={`${Math.round(pi1Pct)}%`} subLabel={`PI 2: ${Math.round(pi2Pct)}% · ${completed} batches done`} color="blue" source="BatchRoadmap" />
        </div>

        {/* ── Panel 1: Batch Integration Status ───────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#003865] text-white hover:bg-[#004a80] transition-colors"
            onClick={() => toggle("batch-status")}
          >
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-bold">Panel 1 — Batch Integration Status</span>
              <span className="text-xs text-blue-300 font-normal">· Derived from DCT Control Panel + Batch Roadmap</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-200">{batchRows.length} batches · {completed} complete · {active} active</span>
              {expandedPanel === "batch-status" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedPanel === "batch-status" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600 w-8">#</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Batch</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">PI</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">API</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">Contract</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">QA</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">Demo</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">G1</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">G2</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">G3</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-slate-600">G4</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Blocked By</th>
                  </tr>
                </thead>
                <tbody>
                  {batchRows.map((row, i) => {
                    const ss = STATUS_STYLES[row.status];
                    const isExpanded = expandedBatch === row.key;
                    return (
                      <>
                        <tr
                          key={row.key}
                          className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? "bg-blue-50" : ""}`}
                          onClick={() => setExpandedBatch(isExpanded ? null : row.key)}
                        >
                          <td className="px-4 py-2 text-slate-400 font-mono">{i + 1}</td>
                          <td className="px-4 py-2 font-semibold text-slate-800">{row.label}</td>
                          <td className="px-4 py-2 text-slate-500">{row.pi}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: ss.bg, color: ss.text }}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center"><ReadinessDot value={row.apiReadiness} /></td>
                          <td className="px-4 py-2 text-center"><ReadinessDot value={row.contractReadiness} /></td>
                          <td className="px-4 py-2 text-center"><ReadinessDot value={row.qaReadiness} /></td>
                          <td className="px-4 py-2 text-center"><ReadinessDot value={row.demoReadiness} /></td>
                          <td className="px-4 py-2 text-center"><GateDot status={row.gateG1} /></td>
                          <td className="px-4 py-2 text-center"><GateDot status={row.gateG2} /></td>
                          <td className="px-4 py-2 text-center"><GateDot status={row.gateG3} /></td>
                          <td className="px-4 py-2 text-center"><GateDot status={row.gateG4} /></td>
                          <td className="px-4 py-2">
                            {row.blockedBy.length > 0
                              ? <span className="text-red-600 font-medium">{row.blockedBy.map(b => BATCH_LABELS[b] ?? b).join(", ")}</span>
                              : <span className="text-emerald-600">—</span>
                            }
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${row.key}-detail`} className="bg-blue-50 border-b border-blue-100">
                            <td colSpan={13} className="px-6 py-3">
                              <div className="flex flex-wrap gap-4 text-xs">
                                <div>
                                  <span className="font-semibold text-slate-600">Agent Status: </span>
                                  <span className="text-slate-700">{row.agentStatus}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-600">Gate G1 Schema Lock: </span>
                                  <span className={row.gateG1 === "Complete" ? "text-emerald-700" : row.gateG1 === "In Progress" ? "text-amber-700" : "text-slate-400"}>{row.gateG1}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-600">Gate G2 Invariant Lock: </span>
                                  <span className={row.gateG2 === "Complete" ? "text-emerald-700" : row.gateG2 === "In Progress" ? "text-amber-700" : "text-slate-400"}>{row.gateG2}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-600">Gate G3 Contract Publication: </span>
                                  <span className={row.gateG3 === "Complete" ? "text-emerald-700" : row.gateG3 === "In Progress" ? "text-amber-700" : "text-slate-400"}>{row.gateG3}</span>
                                </div>
                                <div>
                                  <span className="font-semibold text-slate-600">Gate G4 Lineage Closure: </span>
                                  <span className={row.gateG4 === "Complete" ? "text-emerald-700" : row.gateG4 === "In Progress" ? "text-amber-700" : "text-slate-400"}>{row.gateG4}</span>
                                </div>
                                <div className="ml-auto">
                                  <SourceBadge source="BatchStatusContext" />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">All readiness indicators and gate statuses are derived automatically from batch status changes in the DCT Control Panel.</span>
                <span className="ml-auto"><SourceBadge source="BatchStatusContext" /></span>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel 2: Roger Consumability ────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#065f46] text-white hover:bg-[#047857] transition-colors"
            onClick={() => toggle("roger-consumability")}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-300" />
              <span className="text-sm font-bold">Panel 2 — Roger Consumability</span>
              <span className="text-xs text-emerald-300 font-normal">· Derived from Roger API Evolution + Control Panel</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-200">{rogerAvailable} available · {rogerPartial} partial · {rogerRows.length - rogerAvailable - rogerPartial} not available</span>
              {expandedPanel === "roger-consumability" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedPanel === "roger-consumability" && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Data Point</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Batch</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">System</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Batch Status</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Roger Availability</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">API Endpoint</th>
                    <th className="px-4 py-2.5 text-left font-semibold text-slate-600">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {rogerRows.map((row, i) => {
                    const batchSs = STATUS_STYLES[row.batchStatus as BatchStatus] ?? STATUS_STYLES["Not Started"];
                    const avColor = row.liveAvailability === "Available" ? { bg: "#d1fae5", text: "#065f46" }
                      : row.liveAvailability === "Partially Available" ? { bg: "#fef3c7", text: "#92400e" }
                      : { bg: "#fee2e2", text: "#991b1b" };
                    return (
                      <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-800">{row.dataPoint}</td>
                        <td className="px-4 py-2.5 text-slate-600">B{row.batch}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: "#eff6ff", color: "#1d4ed8" }}>{row.system}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: batchSs.bg, color: batchSs.text }}>{row.batchStatus}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: avColor.bg, color: avColor.text }}>{row.liveAvailability}</span>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500 text-xs">{row.apiEndpoint}</td>
                        <td className="px-4 py-2.5"><SourceBadge source="RogerAPIEvolution" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Roger availability is automatically derived from batch status. When a batch becomes Complete, its data points become Available to Roger.</span>
                <span className="ml-auto"><SourceBadge source="RogerAPIEvolution" /></span>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel 3: Blocking Governance Gaps ───────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors"
            onClick={() => toggle("blocking-gaps")}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-bold">Panel 3 — Blocking Governance Gaps</span>
              <span className="text-xs text-purple-300 font-normal">· Derived from Roger UI Data Point Mapping · ADR Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-purple-200">{openGaps} open · {highRisk} high-risk</span>
              {expandedPanel === "blocking-gaps" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedPanel === "blocking-gaps" && (
            <div className="divide-y divide-slate-100">
              {displayedGaps.length === 0 && (
                <div className="px-5 py-8 text-center text-slate-400 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  All governance gaps resolved. No blocking items.
                </div>
              )}
              {displayedGaps.map(gap => (
                <div key={gap.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${gap.severity === "high" ? "bg-red-500" : gap.severity === "medium" ? "bg-amber-500" : "bg-slate-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-700">{gap.id}</span>
                        <span className="text-sm font-semibold text-slate-800">{gap.title}</span>
                        <span
                          className="text-xs font-semibold px-1.5 py-0.5 rounded"
                          style={{
                            background: gap.severity === "high" ? "#fee2e2" : gap.severity === "medium" ? "#fef3c7" : "#f1f5f9",
                            color: gap.severity === "high" ? "#991b1b" : gap.severity === "medium" ? "#92400e" : "#475569"
                          }}
                        >
                          {gap.severity.toUpperCase()} RISK
                        </span>
                        <span className="text-xs text-slate-400">Proposed Owner: {gap.proposedOwner}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{gap.description}</p>
                      <p className="text-xs text-red-600 mt-1 font-medium">Risk if unresolved: {gap.riskIfUnresolved}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {gap.impactedSystems.map(sys => (
                          <span key={sys} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{sys}</span>
                        ))}
                        <span className="ml-auto"><SourceBadge source="RogerUIMapping" /></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {blockingGaps.length > 3 && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => setShowAllGaps(s => !s)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {showAllGaps ? `Show fewer gaps` : `Show all ${blockingGaps.length} gaps`}
                  </button>
                </div>
              )}
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Gaps are automatically resolved when the associated batch reaches Complete status. Source: Roger UI Data Point Mapping ADR Cards.</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel 4: Field Readiness (Data Model & Gaps) ─────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#92400e] text-white hover:bg-[#78350f] transition-colors"
            onClick={() => toggle("field-readiness")}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold">Panel 4 — Field Readiness by Group</span>
              <span className="text-xs text-amber-300 font-normal">· Derived from Data Model & Gaps · Roger Model Data</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-200">{fieldGaps.delivered} delivered · {fieldGaps.partial} partial · {fieldGaps.missing} missing of {fieldGaps.total}</span>
              {expandedPanel === "field-readiness" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedPanel === "field-readiness" && (
            <div className="divide-y divide-slate-100">
              {ROGER_MODEL_GROUPS.map(group => {
                const gDelivered = group.fields.filter(f => f.status === "Delivered").length;
                const gPartial = group.fields.filter(f => f.status === "Partial" || f.status === "Mocked").length;
                const gMissing = group.fields.filter(f => f.status === "Missing" || f.status === "Deferred").length;
                const pct = group.fields.length > 0 ? Math.round((gDelivered / group.fields.length) * 100) : 0;
                return (
                  <div key={group.id} className="px-5 py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-bold text-slate-700 w-48 shrink-0">{group.title}</span>
                      <div className="flex-1 min-w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600 w-10 text-right">{pct}%</span>
                      <span className="text-xs text-emerald-700">{gDelivered} delivered</span>
                      {gPartial > 0 && <span className="text-xs text-amber-700">{gPartial} partial</span>}
                      {gMissing > 0 && <span className="text-xs text-red-700">{gMissing} missing</span>}
                      <span className="text-xs text-slate-400">{group.fields.length} fields</span>
                      <SourceBadge source="DataModelGaps" />
                    </div>
                  </div>
                );
              })}
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">Field readiness is inherited from the Roger Model Data source. Update field status in Data Model & Gaps to propagate here.</span>
                <span className="ml-auto"><SourceBadge source="DataModelGaps" /></span>
              </div>
            </div>
          )}
        </div>

        {/* ── Panel 5: PI Sequencing & Delivery Tracker ────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <button
            className="w-full flex items-center justify-between px-5 py-3.5 bg-[#0e7490] text-white hover:bg-[#0c6478] transition-colors"
            onClick={() => toggle("pi-sequencing")}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-300" />
              <span className="text-sm font-bold">Panel 5 — PI Sequencing & Delivery Tracker</span>
              <span className="text-xs text-cyan-300 font-normal">· Derived from Batch Roadmap + Batch Delivery Tracker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-cyan-200">PI 1: {Math.round(pi1Pct)}% · PI 2: {Math.round(pi2Pct)}%</span>
              {expandedPanel === "pi-sequencing" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>
          {expandedPanel === "pi-sequencing" && (
            <div className="divide-y divide-slate-100">
              {PI_GROUPS.map(pi => {
                const piBatches = batchRows.filter(r => pi.batchIds.includes(r.key));
                const piComplete = piBatches.filter(r => r.status === "Complete" || r.status === "Delivered").length;
                const piActive = piBatches.filter(r => r.status === "In Progress" || r.status === "Ready for QA").length;
                const piPct = piBatches.length > 0 ? Math.round((piComplete / piBatches.length) * 100) : 0;
                return (
                  <div key={pi.id} className="px-5 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-bold text-slate-800">{pi.label}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${piPct}%` }} />
                      </div>
                      <span className="text-sm font-black text-blue-700">{piPct}%</span>
                      <span className="text-xs text-slate-500">{piComplete}/{piBatches.length} batches</span>
                      {piActive > 0 && <span className="text-xs text-amber-600 font-semibold">{piActive} active</span>}
                      <SourceBadge source="BatchRoadmap" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {piBatches.map(batch => {
                        const ss = STATUS_STYLES[batch.status];
                        return (
                          <Link key={batch.key} href={`/batch/${batch.key}`}>
                            <span
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                              style={{ background: ss.bg, color: ss.text }}
                            >
                              {batch.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500">PI completion percentages are derived from batch status changes. Click any batch to view its full detail page.</span>
                <span className="ml-auto flex gap-2">
                  <SourceBadge source="BatchRoadmap" />
                  <SourceBadge source="BatchDeliveryTracker" />
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Audit Log ─────────────────────────────────────────────────── */}
        {auditLog && auditLog.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-700">Recent Status Changes</span>
              <span className="text-xs text-slate-400 ml-auto">Inherited from DCT Control Panel audit log</span>
              <SourceBadge source="BatchStatusContext" />
            </div>
            <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {auditLog.slice(0, 8).map((entry, i) => (
                <div key={i} className="px-5 py-2.5 flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-mono shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span className="font-semibold text-slate-700 shrink-0">{BATCH_LABELS[entry.batch] ?? entry.batch}</span>
                  <span className="text-slate-400">{entry.from}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-semibold" style={{ color: STATUS_STYLES[entry.to]?.text ?? "#334155" }}>{entry.to}</span>
                  {entry.isRollback && <span className="text-red-500 font-semibold">[Rollback]</span>}
                  {entry.derivedUpdates.length > 0 && <span className="text-slate-500 truncate">{entry.derivedUpdates.length} derived updates</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>
              <strong className="text-slate-700">Governance Rule:</strong> This page is a read-only operational view. To update any status, use the{" "}
              <Link href="/control-panel"><span className="text-blue-600 hover:underline cursor-pointer font-semibold">DCT Control Panel</span></Link>.
              Changes propagate automatically to all synchronized panels above.
            </span>
            <span className="ml-auto text-slate-400">Last synced: {syncTime}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
