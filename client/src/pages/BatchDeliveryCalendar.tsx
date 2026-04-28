// RSM | CATT · DCT Platform · Batch Delivery Calendar
// PLANNING VIEW ONLY — NOT SOURCE OF TRUTH
// Fully isolated — does NOT read from or write to any other page, Control Panel,
// Batch Roadmap, API coverage, or any system data. All data is local state only.
//
// DESIGN PHILOSOPHY: Executive-first. Timeline is the primary visual.
// Clean, calm, RSM-branded. Understandable in under 60 seconds.

import { useState, useMemo, useRef, useCallback } from "react";
import {
  AlertTriangle, Calendar, Download, RotateCcw, Plus, Trash2,
  CheckCircle2, Clock, AlertCircle, Printer, ChevronDown, ChevronRight,
  Info, Eye, EyeOff,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BatchStatus = "Planned" | "In Progress" | "Completed" | "At Risk" | "On Hold";
type SystemType = "PDC" | "TDC" | "Orchestrator" | "Roger" | "Platform";

interface BatchRow {
  id: string;
  pi: string;
  batch: string;
  system: SystemType;
  name: string;
  startDate: string;
  endDate: string;
  status: BatchStatus;
  notes: string;
  dependsOn: string;
  _dateError?: boolean;
  _overlapWarning?: boolean;
  _depConflict?: boolean;
}

// ─── SCENARIOS ────────────────────────────────────────────────────────────────

const SCENARIOS = [
  { id: "v1",     label: "PI Planning Draft v1",  description: "Initial planning estimate — unreviewed" },
  { id: "v2",     label: "PI Planning Draft v2",  description: "Revised after architecture sync" },
  { id: "final",  label: "PI Planning Final",     description: "Agreed baseline for PI execution" },
  { id: "custom", label: "Custom Scenario",       description: "Ad-hoc scenario for what-if analysis" },
];

// ─── BASELINE DATA ────────────────────────────────────────────────────────────

const BASELINE_ROWS: BatchRow[] = [
  // ── PI 1 (Historical / Complete) ──────────────────────────────────────────
  { id: "fc",   pi: "PI 1", batch: "Foundation Core", system: "Platform",
    name: "Batch FC — Platform — Schema Lock & Platform Scaffolding",
    startDate: "2026-01-06", endDate: "2026-02-14", status: "Completed",
    notes: "Gate 1 (Schema Lock) achieved. Baseline locked.", dependsOn: "" },
  { id: "b1",   pi: "PI 1", batch: "Batch 1", system: "PDC",
    name: "Batch 1 — PDC — File Ingestion & Initial Storage",
    startDate: "2026-02-17", endDate: "2026-03-28", status: "Completed",
    notes: "PDC ingestion pipeline complete. IngestionJob lifecycle validated.", dependsOn: "Foundation Core" },
  { id: "b2",   pi: "PI 1", batch: "Batch 2", system: "PDC",
    name: "Batch 2 — PDC — Normalization & Cross-LOB Taxonomy",
    startDate: "2026-03-31", endDate: "2026-04-18", status: "Completed",
    notes: "Normalized TB contract published. CrossLOBMapping records live.", dependsOn: "Batch 1" },
  { id: "b3",   pi: "PI 1", batch: "Batch 3", system: "TDC",
    name: "Batch 3 — TDC — Tax Domain Authority & Tax Taxonomy",
    startDate: "2026-03-31", endDate: "2026-04-21", status: "Completed",
    notes: "TaxFormTemplates loaded. ConfidenceBandThresholds configured. TDC Reference Data API live.", dependsOn: "Batch 2" },
  // ── PI 2 ──────────────────────────────────────────────────────────────────
  { id: "b4",   pi: "PI 2", batch: "Batch 4", system: "TDC",
    name: "Batch 4 — TDC — AI Mapping Proposals, Decisions & Governance",
    startDate: "2026-03-24", endDate: "2026-04-21", status: "Completed",
    notes: "AI mapping proposals persisted. TDC Records API live. Roger consuming GREEN/YELLOW/RED distribution.", dependsOn: "Batch 3" },
  { id: "b5",   pi: "PI 2", batch: "Batch 5", system: "PDC",
    name: "Batch 5 — PDC — Entity Identity & Structure",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "In Progress",
    notes: "EntityId lifecycle. Client group hierarchy. Entitlement mappings. Runs parallel to Batch 6.", dependsOn: "Batch 4" },
  { id: "b6",   pi: "PI 2", batch: "Batch 6", system: "TDC",
    name: "Batch 6 — TDC — Practitioner Review, Adjustments & Lock",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "In Progress",
    notes: "Six-state adjustment lifecycle. TAX_READY derivation. Runs parallel to Batch 5.", dependsOn: "Batch 4" },
  { id: "b2a",  pi: "PI 2", batch: "Batch 2A", system: "PDC",
    name: "Batch 2A — PDC — Contract Enforcement (TBD Name)",
    startDate: "2026-04-29", endDate: "2026-05-04", status: "In Progress",
    notes: "FirmTaxonomyId enforcement. Validation audit log. Runs parallel to Batch 5.", dependsOn: "Batch 2" },
  { id: "b7",   pi: "PI 2", batch: "Batch 7", system: "TDC",
    name: "Batch 7 — TDC — Client Tax Profile & Eligibility",
    startDate: "2026-05-01", endDate: "2026-05-11", status: "Planned",
    notes: "Three-Tier Eligibility determination. Jurisdiction flags. Roger eligibility gating.", dependsOn: "Batch 6" },
  { id: "b8p",  pi: "PI 2", batch: "Batch 8 (PDC)", system: "PDC",
    name: "Batch 8 — PDC — Exceptions & Remediation",
    startDate: "2026-05-05", endDate: "2026-05-13", status: "Planned",
    notes: "PDC exception record structure. Remediation action submission. Exception dashboard.", dependsOn: "Batch 6" },
  { id: "b8t",  pi: "PI 2", batch: "Batch 8 (TDC)", system: "TDC",
    name: "Batch 8 — TDC — Exceptions & Remediation",
    startDate: "2026-05-12", endDate: "2026-05-20", status: "Planned",
    notes: "TDC exception record structure. Invariant violation handling. Follows Batch 8 PDC.", dependsOn: "Batch 8 (PDC)" },
  { id: "b9p",  pi: "PI 2", batch: "Batch 9 (PDC)", system: "PDC",
    name: "Batch 9 — PDC — IMS Integration & Prior Year Retrieval",
    startDate: "2026-05-14", endDate: "2026-05-26", status: "Planned",
    notes: "IMS sync mechanism. Inbound retrieval contract. Prior year reference data.", dependsOn: "Batch 8 (PDC)" },
  { id: "b9t",  pi: "PI 2", batch: "Batch 9 (TDC)", system: "TDC",
    name: "Batch 9 — TDC — Rollforward & Prior Year Intelligence",
    startDate: "2026-05-21", endDate: "2026-06-02", status: "Planned",
    notes: "Rollforward proposals with confidence scoring. v_rollforward read contract for Roger.", dependsOn: "Batch 9 (PDC)" },
  { id: "b10",  pi: "PI 2", batch: "Batch 10", system: "TDC",
    name: "Batch 10 — TDC — Return Assembly, Filing & Lineage Closure",
    startDate: "2026-06-03", endDate: "2026-06-11", status: "Planned",
    notes: "Return assembled. Filing record produced. Lineage chain closed. IMS outbound contract.", dependsOn: "Batch 9 (TDC)" },
  { id: "b11",  pi: "PI 2", batch: "Batch 11", system: "TDC",
    name: "Batch 11 — TDC — Learning Governance & Model Evolution",
    startDate: "2026-06-12", endDate: "2026-06-22", status: "Planned",
    notes: "Learning signal capture. Model registry. Confidence trend analytics. Drift detection.", dependsOn: "Batch 10" },
  // ── PI 3 (overlaps PI 2 intentionally) ───────────────────────────────────
  { id: "b12",  pi: "PI 3", batch: "Batch 12", system: "PDC",
    name: "Batch 12 — PDC — TIM Integration & Engagement Operations",
    startDate: "2026-05-27", endDate: "2026-06-04", status: "Planned",
    notes: "TIM engagement code sync. Identity reconciliation. Engagement Operations read contract.", dependsOn: "Batch 5" },
  { id: "b13",  pi: "PI 3", batch: "Batch 13", system: "PDC",
    name: "Batch 13 — PDC — Platform Reference & Document Provenance",
    startDate: "2026-06-05", endDate: "2026-06-15", status: "Planned",
    notes: "Industry codes. Regulatory calendar. Document provenance and tamper-evidence.", dependsOn: "Batch 12" },
  { id: "b16p", pi: "PI 3", batch: "Batch 16 (PDC)", system: "PDC",
    name: "Batch 16 — PDC — Audit Trail & Lineage Governance",
    startDate: "2026-06-16", endDate: "2026-06-24", status: "Planned",
    notes: "PDC platform-wide lineage event schema. Retention rules. Audit trail read contract.", dependsOn: "Batch 13" },
  { id: "b14",  pi: "PI 3", batch: "Batch 14", system: "TDC",
    name: "Batch 14 — TDC — Tax Computation Rules & Formula Governance",
    startDate: "2026-06-23", endDate: "2026-07-01", status: "Planned",
    notes: "Versioned computation rules. Limitation rules. Reconciliation formulas. Rate tables.", dependsOn: "Batch 13" },
  { id: "b15",  pi: "PI 3", batch: "Batch 15", system: "TDC",
    name: "Batch 15 — TDC — Tax Provision Reference Data & ASC 740 Authority",
    startDate: "2026-07-06", endDate: "2026-07-14", status: "Planned",
    notes: "ASC 740 current tax expense rules. Provision applicability reference data. UTP reference.", dependsOn: "Batch 14" },
  { id: "b16t", pi: "PI 3", batch: "Batch 16 (TDC)", system: "TDC",
    name: "Batch 16 — TDC — Audit Trail & Lineage Governance",
    startDate: "2026-07-15", endDate: "2026-07-23", status: "Planned",
    notes: "TDC lineage event schema. Tamper-evidence verification. Audit trail query API. Follows Batch 16 PDC.", dependsOn: "Batch 16 (PDC)" },
  { id: "b17",  pi: "PI 3", batch: "Batch 17", system: "TDC",
    name: "Batch 17 — TDC — Decision Support (Overrides, Evidence & Workpapers)",
    startDate: "2026-07-24", endDate: "2026-08-03", status: "Planned",
    notes: "Override policies. Evidence records. Workpaper lock and snapshot pinning. Schedule templates.", dependsOn: "Batch 16 (TDC)" },
  { id: "b18",  pi: "PI 3", batch: "Batch 18", system: "TDC",
    name: "Batch 18 — TDC — Provision Computation (DTA/DTL & ETR Reconciliation)",
    startDate: "2026-08-04", endDate: "2026-08-12", status: "Planned",
    notes: "Current tax expense. Deferred tax. DTA/DTL balances. ETR reconciliation. Consolidated provision.", dependsOn: "Batch 15,Batch 17" },
  { id: "b19",  pi: "PI 3", batch: "Batch 19", system: "TDC",
    name: "Batch 19 — TDC — Provision Workflow, Sign-Off & Cross-LOB Output",
    startDate: "2026-08-13", endDate: "2026-08-21", status: "Planned",
    notes: "Provision sign-off. Prior year DTA/DTL rollforward. Audit LOB output contract.", dependsOn: "Batch 17,Batch 18" },
  // ── PI 4 ──────────────────────────────────────────────────────────────────
  { id: "b20",  pi: "PI 4", batch: "Batch 20", system: "PDC",
    name: "Batch 20 — PDC — Firm Governance & Professional Standards",
    startDate: "2026-09-09", endDate: "2026-09-17", status: "Planned",
    notes: "Engagement acceptance. AML/sanctions. Independence rules. CPA license status.", dependsOn: "Batch 17" },
  { id: "b21t", pi: "PI 4", batch: "Batch 21 (TDC)", system: "TDC",
    name: "Batch 21 — TDC — Quality Control Review Records",
    startDate: "2026-09-09", endDate: "2026-09-17", status: "Planned",
    notes: "QC review assignment. Concurring partner standards. Runs parallel to Batch 20.", dependsOn: "Batch 19" },
  { id: "b21p", pi: "PI 4", batch: "Batch 21 (PDC)", system: "PDC",
    name: "Batch 21 — PDC — Quality Control Standards",
    startDate: "2026-09-18", endDate: "2026-09-28", status: "Planned",
    notes: "Independence confirmation. QC lifecycle tracking. QC closure gate.", dependsOn: "Batch 20,Batch 21 (TDC)" },
  { id: "b22",  pi: "PI 4", batch: "Batch 22", system: "PDC",
    name: "Batch 22 — PDC — Client Communication & Outstanding Items",
    startDate: "2026-09-29", endDate: "2026-10-07", status: "Planned",
    notes: "Outstanding item lifecycle. Information request tracking. Aging and escalation.", dependsOn: "Batch 21 (PDC)" },
  { id: "b23",  pi: "PI 4", batch: "Batch 23", system: "PDC",
    name: "Batch 23 — PDC — Benchmark & Peer Analytics",
    startDate: "2026-10-08", endDate: "2026-10-16", status: "Planned",
    notes: "Peer group definitions. Industry benchmark data. Comparable ratios. Roger analytics surface.", dependsOn: "Batch 22" },
];

// ─── COLORS ───────────────────────────────────────────────────────────────────
// RSM palette: Blue = PDC, Green = TDC, Gray = completed/platform, Amber = risk

const SYSTEM_BAR: Record<SystemType, string> = {
  PDC:          "#2563eb",   // RSM Blue
  TDC:          "#059669",   // RSM Green
  Orchestrator: "#7c3aed",   // Violet
  Roger:        "#0ea5e9",   // Sky
  Platform:     "#94a3b8",   // Slate gray
};

const STATUS_BADGE: Record<BatchStatus, { color: string; bg: string }> = {
  "Completed":   { color: "#166534", bg: "#dcfce7" },
  "In Progress": { color: "#1e40af", bg: "#dbeafe" },
  "Planned":     { color: "#475569", bg: "#f1f5f9" },
  "At Risk":     { color: "#92400e", bg: "#fef3c7" },
  "On Hold":     { color: "#6b7280", bg: "#f3f4f6" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatDate(s: string): string {
  const d = parseDate(s);
  if (!d) return s;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatShort(s: string): string {
  const d = parseDate(s);
  if (!d) return s;
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function generateId(): string {
  return "row-" + Math.random().toString(36).slice(2, 8);
}

// ─── CRITICAL PATH ────────────────────────────────────────────────────────────

function computeCriticalPath(rows: BatchRow[]): Set<string> {
  const byLabel: Record<string, BatchRow> = {};
  for (const r of rows) byLabel[r.batch] = r;
  const memo: Record<string, number> = {};

  function chainLength(label: string, visited = new Set<string>()): number {
    if (memo[label] !== undefined) return memo[label];
    if (visited.has(label)) return 0;
    visited.add(label);
    const row = byLabel[label];
    if (!row) return 0;
    const start = parseDate(row.startDate);
    const end = parseDate(row.endDate);
    const ownDuration = start && end ? daysBetween(start, end) : 0;
    const deps = row.dependsOn.split(",").map(s => s.trim()).filter(Boolean);
    const maxPred = deps.length > 0 ? Math.max(...deps.map(d => chainLength(d, new Set(visited)))) : 0;
    memo[label] = maxPred + ownDuration;
    return memo[label];
  }

  for (const r of rows) chainLength(r.batch);
  const maxLen = Math.max(0, ...Object.values(memo));
  if (maxLen === 0) return new Set();

  const criticalLabels = new Set<string>();
  const queue: string[] = Object.entries(memo).filter(([, v]) => v === maxLen).map(([k]) => k);
  while (queue.length > 0) {
    const label = queue.pop()!;
    if (criticalLabels.has(label)) continue;
    criticalLabels.add(label);
    const row = byLabel[label];
    if (!row) continue;
    row.dependsOn.split(",").map(s => s.trim()).filter(Boolean).forEach(dep => {
      if (!criticalLabels.has(dep)) queue.push(dep);
    });
  }
  return criticalLabels;
}

// ─── GANTT CHART ──────────────────────────────────────────────────────────────

interface GanttProps {
  rows: BatchRow[];
  showDeps: boolean;
  showCriticalPath: boolean;
  criticalPath: Set<string>;
}

function GanttChart({ rows, showDeps, showCriticalPath, criticalPath }: GanttProps) {
  const validRows = rows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);

  if (validRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
        Add start and end dates to see the timeline.
      </div>
    );
  }

  const allDates = validRows.flatMap(r => [parseDate(r.startDate)!, parseDate(r.endDate)!]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);
  const totalDays = daysBetween(minDate, maxDate);

  // Quarter markers only (less clutter than monthly)
  const quarters: { label: string; left: number }[] = [];
  const qCursor = new Date(minDate.getFullYear(), Math.floor(minDate.getMonth() / 3) * 3, 1);
  while (qCursor <= maxDate) {
    const left = (daysBetween(minDate, qCursor) / totalDays) * 100;
    if (left >= 0 && left <= 100) {
      quarters.push({
        label: `Q${Math.floor(qCursor.getMonth() / 3) + 1} ${qCursor.getFullYear()}`,
        left,
      });
    }
    qCursor.setMonth(qCursor.getMonth() + 3);
  }

  // Month markers (lighter, for reference)
  const months: { label: string; left: number }[] = [];
  const mCursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (mCursor <= maxDate) {
    const left = (daysBetween(minDate, mCursor) / totalDays) * 100;
    if (left >= 0 && left <= 100) {
      months.push({
        label: mCursor.toLocaleDateString("en-US", { month: "short" }),
        left,
      });
    }
    mCursor.setMonth(mCursor.getMonth() + 1);
  }

  const ROW_H = 52;   // taller bars for executive readability
  const LABEL_W = 200;
  const svgH = validRows.length * ROW_H + 40;

  // Dependency arrows
  const arrows: { x1: number; y1: number; x2: number; y2: number; conflict: boolean; critical: boolean }[] = [];
  if (showDeps) {
    const rowIndex: Record<string, number> = {};
    validRows.forEach((r, i) => { rowIndex[r.batch] = i; });

    validRows.forEach((r, i) => {
      const deps = r.dependsOn.split(",").map(s => s.trim()).filter(Boolean);
      deps.forEach(dep => {
        const di = rowIndex[dep];
        if (di === undefined) return;
        const depRow = validRows[di];
        const depEnd = parseDate(depRow.endDate)!;
        const rStart = parseDate(r.startDate)!;

        const x1 = ((daysBetween(minDate, depEnd) / totalDays) * 100);
        const y1 = di * ROW_H + ROW_H / 2 + 32;
        const x2 = ((daysBetween(minDate, rStart) / totalDays) * 100);
        const y2 = i * ROW_H + ROW_H / 2 + 32;
        const conflict = rStart < depEnd;
        const critical = showCriticalPath && criticalPath.has(r.batch) && criticalPath.has(dep);
        arrows.push({ x1, y1, x2, y2, conflict, critical });
      });
    });
  }

  return (
    <div style={{ overflowX: "auto", overflowY: "visible" }}>
      <div style={{ minWidth: "700px", position: "relative" }}>
        {/* Month header */}
        <div style={{ marginLeft: `${LABEL_W}px`, position: "relative", height: "32px", marginBottom: "4px" }}>
          {months.map((m, i) => (
            <div key={i} style={{
              position: "absolute", left: `${m.left}%`, top: 0,
              transform: "translateX(-50%)",
              fontSize: "11px", color: "#94a3b8", fontWeight: 500, whiteSpace: "nowrap",
            }}>
              {m.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div style={{ position: "relative" }}>
          {/* SVG for dependency arrows */}
          <svg
            style={{ position: "absolute", left: `${LABEL_W}px`, top: 0, width: `calc(100% - ${LABEL_W}px)`, height: `${svgH}px`, pointerEvents: "none", zIndex: 1 }}
            viewBox={`0 0 100 ${svgH}`}
            preserveAspectRatio="none"
          >
            {/* Vertical grid lines — minimal, only at quarters */}
            {quarters.map((q, i) => (
              <line key={i} x1={q.left} y1={0} x2={q.left} y2={svgH}
                stroke="#e2e8f0" strokeWidth="0.3" strokeDasharray="3,4" />
            ))}

            {/* Dependency arrows */}
            {arrows.map((a, i) => {
              const color = a.conflict ? "#f59e0b" : a.critical ? "#f97316" : "#cbd5e1";
              const strokeW = a.critical ? "0.6" : "0.4";
              const midX = (a.x1 + a.x2) / 2;
              return (
                <g key={i}>
                  <path
                    d={`M ${a.x1} ${a.y1} C ${midX} ${a.y1}, ${midX} ${a.y2}, ${a.x2} ${a.y2}`}
                    fill="none" stroke={color} strokeWidth={strokeW}
                    strokeDasharray={a.conflict ? "2,2" : undefined}
                    markerEnd={`url(#arrow-${a.conflict ? "conflict" : a.critical ? "critical" : "normal"})`}
                  />
                </g>
              );
            })}

            <defs>
              {[
                { id: "arrow-normal",   color: "#cbd5e1" },
                { id: "arrow-conflict", color: "#f59e0b" },
                { id: "arrow-critical", color: "#f97316" },
              ].map(({ id, color }) => (
                <marker key={id} id={id} markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                  <path d="M0,0 L0,4 L4,2 z" fill={color} />
                </marker>
              ))}
            </defs>
          </svg>

          {/* Batch rows */}
          {validRows.map((r, i) => {
            const start = parseDate(r.startDate)!;
            const end = parseDate(r.endDate)!;
            const left = (daysBetween(minDate, start) / totalDays) * 100;
            const width = Math.max((daysBetween(start, end) / totalDays) * 100, 0.8);
            const isCP = showCriticalPath && criticalPath.has(r.batch);
            const isCompleted = r.status === "Completed";
            const isAtRisk = r.status === "At Risk";
            const barColor = isCompleted ? "#166534" : isAtRisk ? "#d97706" : SYSTEM_BAR[r.system];

            return (
              <div key={r.id} style={{
                display: "flex", alignItems: "center",
                height: `${ROW_H}px`,
                borderBottom: i < validRows.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                {/* Label */}
                <div style={{
                  width: `${LABEL_W}px`, flexShrink: 0,
                  paddingRight: "12px", overflow: "hidden",
                }}>
                  <div style={{
                    fontSize: "12px", fontWeight: isCP ? 700 : 500,
                    color: isCP ? "#0f172a" : "#374151",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {isCP && <span style={{ color: "#f97316", marginRight: "4px" }}>★</span>}
                    {r.batch}
                  </div>
                  <div style={{
                    fontSize: "10px", color: "#94a3b8",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {r.system}
                  </div>
                </div>

                {/* Bar area */}
                <div style={{ flex: 1, position: "relative", height: "100%", zIndex: 2 }}>
                  <div style={{
                    position: "absolute",
                    left: `${left}%`,
                    width: `${width}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    height: "28px",
                    backgroundColor: barColor,
                    borderRadius: "5px",
                    display: "flex", alignItems: "center",
                    paddingLeft: "8px", paddingRight: "8px",
                    overflow: "hidden",
                    boxShadow: isCP ? `0 0 0 2px #f97316, 0 2px 6px rgba(249,115,22,0.25)` : "0 1px 3px rgba(0,0,0,0.12)",
                    opacity: 1,
                    transition: "box-shadow 0.2s",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, color: "#fff",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {r.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{
          marginTop: "16px", marginLeft: `${LABEL_W}px`,
          display: "flex", gap: "20px", flexWrap: "wrap",
        }}>
          {[
            { color: "#2563eb", label: "PDC (Phoenix Data Consolidation)" },
            { color: "#059669", label: "TDC (Tax Data Consolidation)" },
            { color: "#166534", label: "Completed (Dark Green)" },
            { color: "#94a3b8", label: "Platform / Infrastructure" },
            { color: "#d97706", label: "At Risk" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#64748b" }}>{l.label}</span>
            </div>
          ))}
          {showDeps && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "20px", height: "1px", backgroundColor: "#cbd5e1" }} />
                <span style={{ fontSize: "11px", color: "#64748b" }}>Dependency</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "20px", height: "1px", backgroundColor: "#f59e0b", borderTop: "1px dashed #f59e0b" }} />
                <span style={{ fontSize: "11px", color: "#64748b" }}>Conflict</span>
              </div>
              {showCriticalPath && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "20px", height: "2px", backgroundColor: "#f97316" }} />
                  <span style={{ fontSize: "11px", color: "#64748b" }}>★ Critical Path</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BatchDeliveryCalendar() {
  const [rows, setRows] = useState<BatchRow[]>(() => BASELINE_ROWS.map(r => ({ ...r })));
  const [scenarioId, setScenarioId] = useState("v1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<BatchRow | null>(null);
  const [showDeps, setShowDeps] = useState(true);
  const [showCP, setShowCP] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [showRiskDetail, setShowRiskDetail] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shiftOffer, setShiftOffer] = useState<{ batchId: string; delta: number; affected: string[] } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  const scenario = SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[0];

  // ── Validation ──────────────────────────────────────────────────────────────

  const validatedRows = useMemo<BatchRow[]>(() => {
    const byLabel: Record<string, BatchRow> = {};
    for (const r of rows) byLabel[r.batch] = r;

    return rows.map(r => {
      const s = parseDate(r.startDate);
      const e = parseDate(r.endDate);
      const dateError = !!(s && e && e < s);
      const deps = r.dependsOn.split(",").map(x => x.trim()).filter(Boolean);
      const depConflict = deps.some(dep => {
        const dr = byLabel[dep];
        if (!dr) return false;
        const de = parseDate(dr.endDate);
        return !!(s && de && s < de);
      });
      const overlapWarning = rows.some(other => {
        if (other.id === r.id || other.system !== r.system) return false;
        const os = parseDate(other.startDate);
        const oe = parseDate(other.endDate);
        return !!(s && e && os && oe && s < oe && e > os);
      });
      return { ...r, _dateError: dateError, _depConflict: depConflict, _overlapWarning: overlapWarning };
    });
  }, [rows]);

  const criticalPath = useMemo(() => computeCriticalPath(validatedRows), [validatedRows]);

  // ── Executive summary metrics ────────────────────────────────────────────────

  const summary = useMemo(() => {
    const valid = validatedRows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);
    const allDates = valid.flatMap(r => [parseDate(r.startDate)!, parseDate(r.endDate)!]);
    const minD = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
    const maxD = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;
    const totalDays = minD && maxD ? daysBetween(minD, maxD) : 0;
    const risks = validatedRows.filter(r => r._dateError || r._depConflict || r.status === "At Risk");
    const cpBatches = validatedRows.filter(r => criticalPath.has(r.batch));
    const cpOrdered = cpBatches.sort((a, b) => (parseDate(a.startDate)?.getTime() ?? 0) - (parseDate(b.startDate)?.getTime() ?? 0));
    const piGroups = new Set(validatedRows.map(r => r.pi));
    const systemGroups = new Set(validatedRows.map(r => r.system));
    return { totalDays, minD, maxD, risks, cpOrdered, piGroups, systemGroups };
  }, [validatedRows, criticalPath]);

  // ── Row editing ──────────────────────────────────────────────────────────────

  const startEdit = useCallback((r: BatchRow) => {
    setEditingId(r.id);
    setEditDraft({ ...r });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (!editDraft) return;
    const prev = rows.find(r => r.id === editDraft.id);
    const prevEnd = prev ? parseDate(prev.endDate) : null;
    const newEnd = parseDate(editDraft.endDate);
    let delta = 0;
    if (prevEnd && newEnd) delta = daysBetween(prevEnd, newEnd);

    setRows(prev => prev.map(r => r.id === editDraft.id ? { ...editDraft } : r));
    setEditingId(null);
    setEditDraft(null);

    if (delta > 0) {
      const byLabel: Record<string, BatchRow> = {};
      for (const r of rows) byLabel[r.batch] = r;
      const affected: string[] = [];
      const queue = [editDraft.batch];
      const visited = new Set<string>();
      while (queue.length) {
        const cur = queue.pop()!;
        if (visited.has(cur)) continue;
        visited.add(cur);
        rows.forEach(r => {
          if (r.id !== editDraft.id && r.dependsOn.split(",").map(s => s.trim()).includes(cur)) {
            affected.push(r.batch);
            queue.push(r.batch);
          }
        });
      }
      if (affected.length > 0) setShiftOffer({ batchId: editDraft.id, delta, affected });
    }
  }, [editDraft, rows]);

  const applyShift = useCallback(() => {
    if (!shiftOffer) return;
    const affectedSet = new Set(shiftOffer.affected);
    setRows(prev => prev.map(r => {
      if (!affectedSet.has(r.batch)) return r;
      const s = parseDate(r.startDate);
      const e = parseDate(r.endDate);
      if (!s || !e) return r;
      const ns = new Date(s); ns.setDate(ns.getDate() + shiftOffer.delta);
      const ne = new Date(e); ne.setDate(ne.getDate() + shiftOffer.delta);
      return { ...r, startDate: ns.toISOString().slice(0, 10), endDate: ne.toISOString().slice(0, 10) };
    }));
    setShiftOffer(null);
  }, [shiftOffer]);

  const addRow = useCallback(() => {
    const newRow: BatchRow = {
      id: generateId(), pi: "PI 1", batch: "New Batch", system: "PDC",
      name: "New Batch", startDate: "", endDate: "", status: "Planned", notes: "", dependsOn: "",
    };
    setRows(prev => [...prev, newRow]);
    setEditingId(newRow.id);
    setEditDraft({ ...newRow });
  }, []);

  const deleteRow = useCallback((id: string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Export CSV ───────────────────────────────────────────────────────────────

  const exportCSV = useCallback(() => {
    const header = "Scenario,PI,Batch,System,Name,Start Date,End Date,Status,Depends On,Notes";
    const lines = validatedRows.map(r =>
      [scenario.label, r.pi, r.batch, r.system, `"${r.name}"`, r.startDate, r.endDate, r.status, `"${r.dependsOn}"`, `"${r.notes}"`].join(",")
    );
    const blob = new Blob([`PLANNING VIEW ONLY — NOT SOURCE OF TRUTH\n${header}\n${lines.join("\n")}`], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `dct-batch-calendar-${scenarioId}.csv`; a.click();
  }, [validatedRows, scenario, scenarioId]);

  // ─────────────────────────────────────────────────────────────────────────────

  const riskCount = summary.risks.length;
  const cpStart = summary.cpOrdered[0]?.startDate;
  const cpEnd = summary.cpOrdered[summary.cpOrdered.length - 1]?.endDate;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-page { padding: 24px !important; }
        }
      `}</style>

      <div className="print-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>

        {/* ── HEADER ──────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            {/* Scenario label */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "11px", fontWeight: 600, color: "#64748b",
              border: "1px solid #e2e8f0", borderRadius: "6px",
              padding: "3px 10px", marginBottom: "8px", backgroundColor: "#f8fafc",
              letterSpacing: "0.04em", textTransform: "uppercase",
            }}>
              <Calendar size={11} />
              Scenario: {scenario.label}
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
              Batch Delivery Calendar
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0", maxWidth: "520px" }}>
              Manual planning view for scenario modeling and scheduling discussions.
              Data entered here does not update any other platform view.
            </p>
          </div>

          {/* Controls — top right, minimal */}
          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Scenario selector */}
            <select
              value={scenarioId}
              onChange={e => setScenarioId(e.target.value)}
              style={{
                fontSize: "12px", border: "1px solid #e2e8f0", borderRadius: "7px",
                padding: "6px 10px", color: "#374151", backgroundColor: "white",
                cursor: "pointer", outline: "none",
              }}
            >
              {SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>

            <button
              onClick={() => setShowAdvanced(v => !v)}
              style={{
                fontSize: "11px", fontWeight: 500, color: "#64748b",
                border: "1px solid #e2e8f0", borderRadius: "7px",
                padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
              }}
            >
              {showAdvanced ? <EyeOff size={12} /> : <Eye size={12} />}
              {showAdvanced ? "Hide" : "Show"} Options
            </button>

            {showAdvanced && (
              <>
                <button onClick={() => setShowDeps(v => !v)} style={{
                  fontSize: "11px", fontWeight: 500, color: showDeps ? "#1e40af" : "#94a3b8",
                  border: `1px solid ${showDeps ? "#bfdbfe" : "#e2e8f0"}`, borderRadius: "7px",
                  padding: "6px 10px", backgroundColor: showDeps ? "#eff6ff" : "white", cursor: "pointer",
                }}>
                  Dependencies {showDeps ? "ON" : "OFF"}
                </button>
                <button onClick={() => setShowCP(v => !v)} style={{
                  fontSize: "11px", fontWeight: 500, color: showCP ? "#c2410c" : "#94a3b8",
                  border: `1px solid ${showCP ? "#fed7aa" : "#e2e8f0"}`, borderRadius: "7px",
                  padding: "6px 10px", backgroundColor: showCP ? "#fff7ed" : "white", cursor: "pointer",
                }}>
                  Critical Path {showCP ? "ON" : "OFF"}
                </button>
                <button onClick={() => setShowTable(v => !v)} style={{
                  fontSize: "11px", fontWeight: 500, color: "#64748b",
                  border: "1px solid #e2e8f0", borderRadius: "7px",
                  padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
                }}>
                  {showTable ? "Hide" : "Show"} Table
                </button>
              </>
            )}

            <button onClick={exportCSV} style={{
              fontSize: "11px", fontWeight: 500, color: "#374151",
              border: "1px solid #e2e8f0", borderRadius: "7px",
              padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Download size={12} /> Export
            </button>

            <button onClick={() => window.print()} style={{
              fontSize: "11px", fontWeight: 500, color: "#374151",
              border: "1px solid #e2e8f0", borderRadius: "7px",
              padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Printer size={12} /> Print
            </button>

            <button onClick={() => setResetConfirm(true)} style={{
              fontSize: "11px", fontWeight: 500, color: "#94a3b8",
              border: "1px solid #e2e8f0", borderRadius: "7px",
              padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>

        {/* ── EXECUTIVE SUMMARY CARD ───────────────────────────────────────────── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px",
          marginBottom: "24px",
        }}>
          {[
            {
              label: "Total Timeline",
              value: summary.totalDays > 0 ? `${summary.totalDays} days` : "—",
              sub: summary.minD && summary.maxD
                ? `${formatShort(summary.minD.toISOString())} → ${formatShort(summary.maxD.toISOString())}`
                : "Set dates to calculate",
              accent: "#2563eb",
            },
            {
              label: "Critical Path",
              value: `${summary.cpOrdered.length} batches`,
              sub: cpStart && cpEnd ? `${formatShort(cpStart)} → ${formatShort(cpEnd)}` : "—",
              accent: "#f97316",
            },
            {
              label: "Workstreams",
              value: `${summary.systemGroups.size} systems`,
              sub: `${summary.piGroups.size} PIs · ${validatedRows.length} batches total`,
              accent: "#059669",
            },
            {
              label: "Risks",
              value: riskCount > 0 ? `${riskCount} identified` : "None",
              sub: riskCount > 0 ? "Click to view details" : "No conflicts detected",
              accent: riskCount > 0 ? "#d97706" : "#059669",
              onClick: riskCount > 0 ? () => setShowRiskDetail(v => !v) : undefined,
            },
          ].map((card, i) => (
            <div
              key={i}
              onClick={card.onClick}
              style={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderTop: `3px solid ${card.accent}`,
                borderRadius: "10px",
                padding: "16px 18px",
                cursor: card.onClick ? "pointer" : "default",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={e => { if (card.onClick) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                {card.label}
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: card.accent, lineHeight: 1.1, marginBottom: "4px" }}>
                {card.value}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── RISK DETAIL (collapsible) ────────────────────────────────────────── */}
        {showRiskDetail && summary.risks.length > 0 && (
          <div style={{
            backgroundColor: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: "10px", padding: "14px 18px", marginBottom: "20px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "8px" }}>
              ⚠ {summary.risks.length} risk{summary.risks.length > 1 ? "s" : ""} identified
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {summary.risks.map(r => (
                <div key={r.id} style={{ fontSize: "12px", color: "#78350f" }}>
                  <strong>{r.batch}</strong>
                  {r._dateError && " — End date is before start date"}
                  {r._depConflict && !r._dateError && " — Starts before a dependency completes"}
                  {r.status === "At Risk" && !r._dateError && !r._depConflict && " — Marked At Risk"}
                  {r.notes && <span style={{ color: "#a16207" }}> · {r.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CRITICAL PATH SEQUENCE ───────────────────────────────────────────── */}
        {showCP && summary.cpOrdered.length > 0 && (
          <div style={{
            backgroundColor: "white", border: "1px solid #e2e8f0",
            borderRadius: "10px", padding: "16px 20px", marginBottom: "24px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "3px", height: "16px", backgroundColor: "#f97316", borderRadius: "2px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Critical Path
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                — longest dependency chain · {summary.totalDays} calendar days
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0" }}>
              {summary.cpOrdered.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    padding: "6px 12px",
                    backgroundColor: "#fff7ed",
                    border: "1px solid #fed7aa",
                    borderRadius: "7px",
                    minWidth: "90px",
                  }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#c2410c" }}>{r.batch}</span>
                    <span style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                      {formatShort(r.startDate)} → {formatShort(r.endDate)}
                    </span>
                  </div>
                  {i < summary.cpOrdered.length - 1 && (
                    <div style={{ width: "20px", height: "1px", backgroundColor: "#f97316", flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GANTT TIMELINE ───────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: "white", border: "1px solid #e2e8f0",
          borderRadius: "12px", padding: "24px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ width: "3px", height: "16px", backgroundColor: "#2563eb", borderRadius: "2px" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Delivery Timeline
            </span>
          </div>
          <GanttChart
            rows={validatedRows}
            showDeps={showDeps}
            showCriticalPath={showCP}
            criticalPath={criticalPath}
          />
        </div>

        {/* ── BATCH TABLE (collapsible) ─────────────────────────────────────────── */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" }}>
          <button
            onClick={() => setShowTable(v => !v)}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
              borderBottom: showTable ? "1px solid #f1f5f9" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "3px", height: "16px", backgroundColor: "#64748b", borderRadius: "2px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Batch Schedule
              </span>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>{validatedRows.length} batches</span>
            </div>
            {showTable ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronRight size={14} color="#94a3b8" />}
          </button>

          {showTable && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    {["PI", "Batch", "System", "Name", "Start", "End", "Status", "Depends On", "Notes", ""].map(h => (
                      <th key={h} style={{
                        padding: "10px 12px", textAlign: "left",
                        fontSize: "10px", fontWeight: 700, color: "#94a3b8",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {validatedRows.map((r, i) => {
                    const isEditing = editingId === r.id;
                    const isCP = showCP && criticalPath.has(r.batch);
                    const hasIssue = r._dateError || r._depConflict;
                    const sb = STATUS_BADGE[r.status];

                    if (isEditing && editDraft) {
                      return (
                        <tr key={r.id} style={{ backgroundColor: "#eff6ff" }}>
                          {(["pi", "batch", "system", "name", "startDate", "endDate", "status", "dependsOn", "notes"] as (keyof BatchRow)[]).map(field => (
                            <td key={field} style={{ padding: "6px 8px" }}>
                              {field === "status" ? (
                                <select
                                  value={editDraft.status}
                                  onChange={e => setEditDraft(d => d ? { ...d, status: e.target.value as BatchStatus } : d)}
                                  style={{ fontSize: "11px", border: "1px solid #bfdbfe", borderRadius: "5px", padding: "3px 6px", width: "100%" }}
                                >
                                  {(["Planned", "In Progress", "Completed", "At Risk", "On Hold"] as BatchStatus[]).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              ) : field === "system" ? (
                                <select
                                  value={editDraft.system}
                                  onChange={e => setEditDraft(d => d ? { ...d, system: e.target.value as SystemType } : d)}
                                  style={{ fontSize: "11px", border: "1px solid #bfdbfe", borderRadius: "5px", padding: "3px 6px", width: "100%" }}
                                >
                                  {(["PDC", "TDC", "Orchestrator", "Roger", "Platform"] as SystemType[]).map(s => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={field === "startDate" || field === "endDate" ? "date" : "text"}
                                  value={(editDraft[field] as string) ?? ""}
                                  onChange={e => setEditDraft(d => d ? { ...d, [field]: e.target.value } : d)}
                                  style={{
                                    fontSize: "11px", border: "1px solid #bfdbfe", borderRadius: "5px",
                                    padding: "3px 6px", width: "100%", minWidth: "60px",
                                  }}
                                />
                              )}
                            </td>
                          ))}
                          <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>
                            <button onClick={saveEdit} style={{
                              fontSize: "11px", fontWeight: 600, color: "white",
                              backgroundColor: "#2563eb", border: "none", borderRadius: "5px",
                              padding: "3px 8px", cursor: "pointer", marginRight: "4px",
                            }}>✓</button>
                            <button onClick={cancelEdit} style={{
                              fontSize: "11px", color: "#94a3b8",
                              backgroundColor: "transparent", border: "1px solid #e2e8f0",
                              borderRadius: "5px", padding: "3px 8px", cursor: "pointer",
                            }}>✕</button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={r.id}
                        onClick={() => startEdit(r)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: hasIssue ? "#fffbeb" : i % 2 === 0 ? "white" : "#fafafa",
                          borderLeft: isCP ? "3px solid #f97316" : "3px solid transparent",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f0f9ff"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = hasIssue ? "#fffbeb" : i % 2 === 0 ? "white" : "#fafafa"}
                      >
                        <td style={{ padding: "10px 12px", color: "#64748b" }}>{r.pi}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: isCP ? "#c2410c" : "#0f172a" }}>
                          {isCP && "★ "}{r.batch}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: 600,
                            color: SYSTEM_BAR[r.system], backgroundColor: `${SYSTEM_BAR[r.system]}18`,
                            padding: "2px 7px", borderRadius: "4px",
                          }}>{r.system}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: "#374151", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</td>
                        <td style={{ padding: "10px 12px", color: r._dateError ? "#d97706" : "#64748b", whiteSpace: "nowrap" }}>{formatDate(r.startDate)}</td>
                        <td style={{ padding: "10px 12px", color: r._dateError ? "#d97706" : "#64748b", whiteSpace: "nowrap" }}>{formatDate(r.endDate)}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{
                            fontSize: "10px", fontWeight: 600,
                            color: sb.color, backgroundColor: sb.bg,
                            padding: "2px 7px", borderRadius: "4px",
                          }}>{r.status}</span>
                        </td>
                        <td style={{ padding: "10px 12px", color: r._depConflict ? "#d97706" : "#64748b", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r._depConflict && "⚠ "}{r.dependsOn || "—"}
                        </td>
                        <td style={{ padding: "10px 12px", color: "#94a3b8", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.notes || "—"}</td>
                        <td style={{ padding: "10px 12px" }}>
                          <button
                            onClick={e => { e.stopPropagation(); deleteRow(r.id); }}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", padding: "2px" }}
                            title="Delete row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={addRow} style={{
                  fontSize: "12px", fontWeight: 600, color: "#2563eb",
                  backgroundColor: "transparent", border: "1px dashed #bfdbfe",
                  borderRadius: "7px", padding: "6px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <Plus size={13} /> Add Batch
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── GOVERNANCE FOOTER ────────────────────────────────────────────────── */}
        <div style={{
          fontSize: "11px", color: "#94a3b8", textAlign: "center",
          borderTop: "1px solid #f1f5f9", paddingTop: "16px",
        }}>
          <strong style={{ color: "#64748b" }}>Planning View Only — Not Source of Truth.</strong>{" "}
          Official batch status, sequencing, and delivery tracking are maintained in the Batch Roadmap and Control Panel.
        </div>
      </div>

      {/* ── SHIFT DOWNSTREAM MODAL ───────────────────────────────────────────── */}
      {shiftOffer && (
        <div className="no-print" style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "14px", padding: "28px 32px",
            maxWidth: "420px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              Shift Downstream Batches?
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px" }}>
              End date moved forward by <strong>{shiftOffer.delta} days</strong>. Shift these dependent batches by the same amount?
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {shiftOffer.affected.map(b => (
                <span key={b} style={{
                  fontSize: "11px", fontWeight: 600, color: "#1e40af",
                  backgroundColor: "#dbeafe", padding: "3px 8px", borderRadius: "4px",
                }}>{b}</span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={applyShift} style={{
                flex: 1, fontSize: "13px", fontWeight: 600, color: "white",
                backgroundColor: "#2563eb", border: "none", borderRadius: "8px",
                padding: "10px", cursor: "pointer",
              }}>
                Shift {shiftOffer.delta} Days Downstream
              </button>
              <button onClick={() => setShiftOffer(null)} style={{
                flex: 1, fontSize: "13px", fontWeight: 500, color: "#64748b",
                backgroundColor: "transparent", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "10px", cursor: "pointer",
              }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET CONFIRM MODAL ──────────────────────────────────────────────── */}
      {resetConfirm && (
        <div className="no-print" style={{
          position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "14px", padding: "28px 32px",
            maxWidth: "360px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" }}>
              Reset to Baseline?
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px" }}>
              All current edits will be lost. This cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setRows(BASELINE_ROWS.map(r => ({ ...r }))); setResetConfirm(false); }} style={{
                flex: 1, fontSize: "13px", fontWeight: 600, color: "white",
                backgroundColor: "#dc2626", border: "none", borderRadius: "8px",
                padding: "10px", cursor: "pointer",
              }}>
                Reset
              </button>
              <button onClick={() => setResetConfirm(false)} style={{
                flex: 1, fontSize: "13px", fontWeight: 500, color: "#64748b",
                backgroundColor: "transparent", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "10px", cursor: "pointer",
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
