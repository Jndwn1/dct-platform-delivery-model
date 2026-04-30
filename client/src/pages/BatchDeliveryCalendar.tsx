// RSM | CATT · DCT Platform · Batch Delivery Calendar
// PLANNING VIEW ONLY — NOT SOURCE OF TRUTH
// Fully isolated — does NOT read from or write to any other page, Control Panel,
// Batch Roadmap, API coverage, or any system data. All data is local state only.
//
// DESIGN PHILOSOPHY: Executive-first. Timeline is the primary visual.
// Clean, calm, RSM-branded. Understandable in under 60 seconds.

import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  AlertTriangle, Calendar, Download, RotateCcw, Plus, Trash2,
  CheckCircle2, Clock, AlertCircle, Printer, ChevronDown, ChevronRight,
  Info, Eye, EyeOff,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BatchStatus = "Done" | "Committed" | "Stretch" | "MVP";
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


// ─── BASELINE DATA ────────────────────────────────────────────────────────────

const BASELINE_ROWS: BatchRow[] = [
  // ── PI 2 ─────────────────────────────────────────────────────────────────────
  {
    id: "pi2-b4-tdc", pi: "PI 2", batch: "B4", system: "TDC",
    name: "AI Mapping Proposals & Decisions",
    startDate: "2026-04-01", endDate: "2026-04-21", status: "Done",
    notes: "Batch 4 TDC complete. AI Mapping done.", dependsOn: "",
  },
  {
    id: "pi2-b5-pdc", pi: "PI 2", batch: "B5", system: "PDC",
    name: "Entity Identity & Structure",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "Committed",
    notes: "Batch 5 PDC.", dependsOn: "B4",
  },
  {
    id: "pi2-b6-tdc", pi: "PI 2", batch: "B6", system: "TDC",
    name: "Practitioner Review & Lock",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "Committed",
    notes: "Batch 6 TDC. Runs parallel with B5 PDC.", dependsOn: "B4",
  },
  {
    id: "pi2-b2a-pdc", pi: "PI 2", batch: "B2A", system: "PDC",
    name: "Orchestrator Classification Result & Contract Enforcement",
    startDate: "2026-04-29", endDate: "2026-05-04", status: "Committed",
    notes: "Batch 2A PDC. Tiny — TBD.", dependsOn: "B5",
  },
  {
    id: "pi2-b7-tdc", pi: "PI 2", batch: "B7", system: "TDC",
    name: "Client Tax Profile & Eligibility",
    startDate: "2026-05-01", endDate: "2026-05-11", status: "Committed",
    notes: "Batch 7 TDC.", dependsOn: "B6",
  },
  {
    id: "pi2-b8-pdc", pi: "PI 2", batch: "B8", system: "PDC",
    name: "Exceptions & Remediation",
    startDate: "2026-05-05", endDate: "2026-05-13", status: "Committed",
    notes: "Batch 8 PDC.", dependsOn: "B5",
  },
  {
    id: "pi2-b8-tdc", pi: "PI 2", batch: "B8", system: "TDC",
    name: "Exceptions & Remediation",
    startDate: "2026-05-12", endDate: "2026-05-20", status: "Committed",
    notes: "Batch 8 TDC. Follows B8 PDC.", dependsOn: "B8",
  },
  {
    id: "pi2-b9-pdc", pi: "PI 2", batch: "B9", system: "PDC",
    name: "IMS Integration & Prior Year Retrieval",
    startDate: "2026-05-14", endDate: "2026-05-26", status: "Committed",
    notes: "Batch 9 PDC.", dependsOn: "B8",
  },
  {
    id: "pi2-b9-tdc", pi: "PI 2", batch: "B9", system: "TDC",
    name: "Rollforward & Prior Year Intelligence",
    startDate: "2026-05-21", endDate: "2026-06-02", status: "Committed",
    notes: "Batch 9 TDC. Follows B9 PDC.", dependsOn: "B9",
  },
  {
    id: "pi2-b16-pdc", pi: "PI 2", batch: "B16", system: "PDC",
    name: "Audit Trail & Lineage Governance (PDC)",
    startDate: "2026-05-27", endDate: "2026-06-04", status: "Stretch",
    notes: "Batch 16 PDC. Stretch — committed.", dependsOn: "B9",
  },
  {
    id: "pi2-b10-tdc", pi: "PI 2", batch: "B10", system: "TDC",
    name: "Return Assembly, Filing & Lineage",
    startDate: "2026-06-03", endDate: "2026-06-11", status: "Committed",
    notes: "Batch 10 TDC.", dependsOn: "B9",
  },
  {
    id: "pi2-b24-pdc", pi: "PI 2", batch: "B24", system: "PDC",
    name: "Advisory Opportunity Reference (PDC)",
    startDate: "2026-06-05", endDate: "2026-06-15", status: "Stretch",
    notes: "Batch 24 PDC. Stretch — opportunistic.", dependsOn: "B16",
  },
  {
    id: "pi2-b11-tdc", pi: "PI 2", batch: "B11", system: "TDC",
    name: "Learning Governance & Model Evolution",
    startDate: "2026-06-12", endDate: "2026-06-22", status: "Committed",
    notes: "Batch 11 TDC.", dependsOn: "B10",
  },
  {
    id: "pi2-b25-pdc", pi: "PI 2", batch: "B25", system: "PDC",
    name: "Advisory Opportunity Detection (PDC)",
    startDate: "2026-06-16", endDate: "2026-06-24", status: "Stretch",
    notes: "Batch 25 PDC. Stretch — opportunistic.", dependsOn: "B24",
  },
  // ── PI 3 ─────────────────────────────────────────────────────────────────────
  {
    id: "pi3-b14-tdc", pi: "PI 3", batch: "B14", system: "TDC",
    name: "Tax Computation Rules",
    startDate: "2026-06-23", endDate: "2026-07-01", status: "MVP",
    notes: "Batch 14 TDC. MVP.", dependsOn: "B11",
  },
  {
    id: "pi3-b12-pdc", pi: "PI 3", batch: "B12", system: "PDC",
    name: "TIM Integration & Engagement Operations",
    startDate: "2026-06-25", endDate: "2026-07-07", status: "Committed",
    notes: "Batch 12 PDC.", dependsOn: "B11",
  },
  {
    id: "pi3-b15-tdc", pi: "PI 3", batch: "B15", system: "TDC",
    name: "Tax Provision Reference & ASC 740",
    startDate: "2026-07-06", endDate: "2026-07-14", status: "MVP",
    notes: "Batch 15 TDC. MVP.", dependsOn: "B14",
  },
  {
    id: "pi3-b13-pdc", pi: "PI 3", batch: "B13", system: "PDC",
    name: "Platform Reference & Document Provenance",
    startDate: "2026-07-08", endDate: "2026-07-16", status: "Committed",
    notes: "Batch 13 PDC.", dependsOn: "B12",
  },
  {
    id: "pi3-b18-tdc", pi: "PI 3", batch: "B18", system: "TDC",
    name: "Provision Computation, DTA/DTL & ETR",
    startDate: "2026-07-15", endDate: "2026-07-23", status: "MVP",
    notes: "Batch 18 TDC. MVP.", dependsOn: "B15",
  },
  {
    id: "pi3-b22-pdc", pi: "PI 3", batch: "B22", system: "PDC",
    name: "Client Communication & Outstanding Items",
    startDate: "2026-07-17", endDate: "2026-07-27", status: "Committed",
    notes: "Batch 22 PDC.", dependsOn: "B13",
  },
  {
    id: "pi3-b19-tdc", pi: "PI 3", batch: "B19", system: "TDC",
    name: "Provision Workflow & Cross-LOB Output",
    startDate: "2026-07-24", endDate: "2026-08-03", status: "MVP",
    notes: "Batch 19 TDC. MVP.", dependsOn: "B18",
  },
  {
    id: "pi3-b20-pdc", pi: "PI 3", batch: "B20", system: "PDC",
    name: "Firm Governance & Professional Standards",
    startDate: "2026-07-28", endDate: "2026-08-05", status: "Committed",
    notes: "Batch 20 PDC.", dependsOn: "B22",
  },
  {
    id: "pi3-b24-tdc", pi: "PI 3", batch: "B24", system: "TDC",
    name: "Advisory Opportunity Reference",
    startDate: "2026-08-04", endDate: "2026-08-12", status: "MVP",
    notes: "Batch 24 TDC. MVP.", dependsOn: "B19",
  },
  {
    id: "pi3-b21-pdc", pi: "PI 3", batch: "B21", system: "PDC",
    name: "Quality Control Standards",
    startDate: "2026-08-06", endDate: "2026-08-14", status: "Committed",
    notes: "Batch 21 PDC.", dependsOn: "B20",
  },
  {
    id: "pi3-b25-tdc", pi: "PI 3", batch: "B25", system: "TDC",
    name: "Advisory Detection (Stop-Gap)",
    startDate: "2026-08-13", endDate: "2026-08-21", status: "MVP",
    notes: "Batch 25 TDC. MVP.", dependsOn: "B24",
  },
  {
    id: "pi3-b23-pdc", pi: "PI 3", batch: "B23", system: "PDC",
    name: "Benchmark & Peer Analytics",
    startDate: "2026-08-17", endDate: "2026-08-25", status: "Committed",
    notes: "Batch 23 PDC.", dependsOn: "B21",
  },
  {
    id: "pi3-b17-tdc", pi: "PI 3", batch: "B17", system: "TDC",
    name: "Decision Support — Overrides & Workpapers",
    startDate: "2026-08-24", endDate: "2026-09-01", status: "MVP",
    notes: "Batch 17 TDC. MVP.", dependsOn: "B25",
  },
  {
    id: "pi3-b16-tdc", pi: "PI 3", batch: "B16", system: "TDC",
    name: "Audit Trail & Lineage Governance (TDC)",
    startDate: "2026-09-02", endDate: "2026-09-11", status: "MVP",
    notes: "Batch 16 TDC. MVP. TDC side of B16 PDC (PI 2).", dependsOn: "B17",
  },
  // ── PI 4 ─────────────────────────────────────────────────────────────────────
  {
    id: "pi4-b21-tdc", pi: "PI 4", batch: "B21", system: "TDC",
    name: "Quality Control Review Records",
    startDate: "2026-09-14", endDate: "2026-09-22", status: "Committed",
    notes: "Batch 21 TDC. PI 4 committed.", dependsOn: "B16",
  },
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

const STATUS_BADGE: Record<BatchStatus, { color: string; bg: string; bar: string }> = {
  "Done":      { color: "#166534", bg: "#dcfce7", bar: "#16a34a" },
  "Committed": { color: "#1e40af", bg: "#dbeafe", bar: "#2563eb" },
  "Stretch":   { color: "#9a3412", bg: "#ffedd5", bar: "#ea580c" },
  "MVP":       { color: "#581c87", bg: "#f3e8ff", bar: "#7c3aed" },
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

// ─── CRITICAL PATH ENGINE ─────────────────────────────────────────────────────
// SOURCE OF TRUTH: Batch Delivery Calendar (BASELINE_ROWS)
// Algorithm: Longest dependency-driven path using unique row IDs as graph nodes.
// Rules:
//   1. Explicit dependsOn fields (batch label → all rows with that label)
//   2. Implicit PDC→TDC platform flow: same batch#, PDC end → TDC start
//   3. Duplicates resolved by unique ID — no "last row wins" collapse
// GOVERNANCE: This function is the ONLY source of critical path data. Never edit output manually.

interface CpNode { id: string; batch: string; system: string; pi: string; name: string; startDate: string; endDate: string; status: BatchStatus; }
interface CpResult { criticalIds: Set<string>; orderedPath: CpNode[]; totalDays: number; }

function computeCriticalPath(rows: BatchRow[]): CpResult {
  const valid = rows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);
  if (valid.length === 0) return { criticalIds: new Set(), orderedPath: [], totalDays: 0 };

  const byBatch: Record<string, BatchRow[]> = {};
  for (const r of valid) {
    if (!byBatch[r.batch]) byBatch[r.batch] = [];
    byBatch[r.batch].push(r);
  }

  const predecessors: Record<string, string[]> = {};
  for (const r of valid) predecessors[r.id] = [];

  for (const r of valid) {
    const deps = r.dependsOn.split(",").map((s: string) => s.trim()).filter(Boolean);
    for (const dep of deps) {
      const depRows = byBatch[dep] || [];
      for (const dr of depRows) {
        const drEnd = parseDate(dr.endDate);
        const rStart = parseDate(r.startDate);
        if (drEnd && rStart && drEnd <= rStart && !predecessors[r.id].includes(dr.id)) {
          predecessors[r.id].push(dr.id);
        }
      }
    }
    if (r.system === "TDC") {
      const sameBatch = (byBatch[r.batch] || []).filter((x: BatchRow) => x.system === "PDC");
      for (const pdc of sameBatch) {
        const pdcEnd = parseDate(pdc.endDate);
        const rStart = parseDate(r.startDate);
        if (pdcEnd && rStart && pdcEnd <= rStart && !predecessors[r.id].includes(pdc.id)) {
          predecessors[r.id].push(pdc.id);
        }
      }
    }
  }

  const dist: Record<string, number> = {};
  function longestTo(id: string, stack: Set<string>): number {
    if (dist[id] !== undefined) return dist[id];
    if (stack.has(id)) return 0;
    const newStack = new Set(stack);
    newStack.add(id);
    const row = valid.find((r: BatchRow) => r.id === id)!;
    const s = parseDate(row.startDate)!;
    const e = parseDate(row.endDate)!;
    const own = daysBetween(s, e);
    const preds = predecessors[id] || [];
    const maxPred = preds.length > 0 ? Math.max(...preds.map((p: string) => longestTo(p, newStack))) : 0;
    dist[id] = maxPred + own;
    return dist[id];
  }
  for (const r of valid) longestTo(r.id, new Set<string>());

  const maxDist = Math.max(0, ...Object.values(dist));
  if (maxDist === 0) return { criticalIds: new Set(), orderedPath: [], totalDays: 0 };

  const criticalIds = new Set<string>();
  const traceQueue: string[] = valid.filter((r: BatchRow) => dist[r.id] === maxDist).map((r: BatchRow) => r.id);
  while (traceQueue.length > 0) {
    const id = traceQueue.pop()!;
    if (criticalIds.has(id)) continue;
    criticalIds.add(id);
    const row = valid.find((r: BatchRow) => r.id === id)!;
    const own = daysBetween(parseDate(row.startDate)!, parseDate(row.endDate)!);
    for (const pred of (predecessors[id] || [])) {
      const predRow = valid.find((r: BatchRow) => r.id === pred);
      if (!predRow) continue;
      const predEnd = parseDate(predRow.endDate)!;
      const rowStart = parseDate(row.startDate)!;
      const gap = daysBetween(predEnd, rowStart);
      if (Math.abs((dist[pred] || 0) + gap + own - dist[id]) <= 1) {
        traceQueue.push(pred);
      }
    }
  }

  const orderedPath: CpNode[] = valid
    .filter((r: BatchRow) => criticalIds.has(r.id))
    .sort((a: BatchRow, b: BatchRow) => (parseDate(a.startDate)?.getTime() ?? 0) - (parseDate(b.startDate)?.getTime() ?? 0))
    .map((r: BatchRow) => ({ id: r.id, batch: r.batch, system: r.system, pi: r.pi, name: r.name, startDate: r.startDate, endDate: r.endDate, status: r.status }));

  const firstStart = parseDate(orderedPath[0]?.startDate);
  const lastEnd = parseDate(orderedPath[orderedPath.length - 1]?.endDate);
  const totalDays = firstStart && lastEnd ? daysBetween(firstStart, lastEnd) : maxDist;

  return { criticalIds, orderedPath, totalDays };
}

function computeCriticalPathLabels(rows: BatchRow[]): Set<string> {
  const { criticalIds } = computeCriticalPath(rows);
  const labelSet = new Set<string>();
  for (const r of rows) {
    if (criticalIds.has(r.id)) labelSet.add(r.batch);
  }
  return labelSet;
}

// ─── GANTT CHART ──────────────────────────────────────────────────────────────

interface GanttProps {
  rows: BatchRow[];
  showDeps: boolean;
  showCriticalPath: boolean;
  criticalPath: Set<string>;
  piFilter?: string;
}

const PI_BAND_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  "PI 1": { bg: "#f0f4ff", border: "#c7d7f9", text: "#1e3a5f", label: "PI 1 — Foundation & AI Mapping" },
  "PI 2": { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af", label: "PI 2 — Entity, Workflow & Tax Ready (Apr–Jun)" },
  "PI 3": { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", label: "PI 3 — Intelligence, Provision & Audit (Jun–Sep)" },
  "PI 4": { bg: "#fff7ed", border: "#fed7aa", text: "#7c2d12", label: "PI 4 — Governance, QC & Analytics (Sep+)" },
};

function GanttChart({ rows, showDeps, showCriticalPath, criticalPath, piFilter = "All" }: GanttProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = React.useState(0);

  // Measure container width on mount and resize
  React.useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setContainerW(e.contentRect.width);
    });
    obs.observe(containerRef.current);
    setContainerW(containerRef.current.getBoundingClientRect().width);
    return () => obs.disconnect();
  }, []);

  const validRows = rows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);

  if (validRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
        Add start and end dates to see the timeline.
      </div>
    );
  }

  const LABEL_W = 220;
  const ROW_H   = 56;
  const BAR_H   = 32;
  const HEADER_H = 40;

  // ── Shared time scale ──────────────────────────────────────────────────────
  const allDates = validRows.flatMap(r => [parseDate(r.startDate)!, parseDate(r.endDate)!]);
  const rawMin = new Date(Math.min(...allDates.map(d => d.getTime())));
  const rawMax = new Date(Math.max(...allDates.map(d => d.getTime())));
  // Pad 7 days before first batch, 21 days after last
  const minDate = new Date(rawMin); minDate.setDate(minDate.getDate() - 7);
  const maxDate = new Date(rawMax); maxDate.setDate(maxDate.getDate() + 21);
  const totalDays = daysBetween(minDate, maxDate);

  // chartW = the pixel width of the bar area (to the right of labels)
  const chartW = Math.max(containerW - LABEL_W, 100);

  // Convert a date to an x pixel position within the chart area
  function dateToX(d: Date): number {
    return (daysBetween(minDate, d) / totalDays) * chartW;
  }

  // Today
  const today = new Date();
  const todayX = dateToX(today);
  const showToday = todayX >= 0 && todayX <= chartW;

  // Month grid lines & labels
  const monthMarkers: { label: string; x: number }[] = [];
  const mCursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (mCursor <= maxDate) {
    const x = dateToX(mCursor);
    if (x >= 0 && x <= chartW) {
      monthMarkers.push({
        label: mCursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        x,
      });
    }
    mCursor.setMonth(mCursor.getMonth() + 1);
  }

  // ── Row layout — account for PI dividers ──────────────────────────────────
  // Build a flat list of items (dividers + rows) with their y positions
  interface DividerItem { type: "divider"; pi: string; y: number; h: number }
  interface RowItem     { type: "row";     row: BatchRow; rowIndex: number; y: number; h: number }
  type LayoutItem = DividerItem | RowItem;

  const layoutItems: LayoutItem[] = [];
  let yOffset = 0;
  let lastPi = "";
  let rowIndex = 0;
  validRows.forEach(r => {
    if (piFilter === "All" && r.pi !== lastPi) {
      lastPi = r.pi;
      const DIVIDER_H = 28;
      layoutItems.push({ type: "divider", pi: r.pi, y: yOffset, h: DIVIDER_H });
      yOffset += DIVIDER_H;
    }
    layoutItems.push({ type: "row", row: r, rowIndex, y: yOffset, h: ROW_H });
    yOffset += ROW_H;
    rowIndex++;
  });
  const totalGridH = yOffset;

  // Map from batch label → y center (for dependency arrows)
  const rowYCenter: Record<string, number> = {};
  layoutItems.forEach(item => {
    if (item.type === "row") {
      rowYCenter[item.row.batch] = item.y + item.h / 2;
    }
  });

  // ── Dependency arrows (pixel coords) ──────────────────────────────────────
  interface Arrow { x1: number; y1: number; x2: number; y2: number; conflict: boolean; critical: boolean }
  const arrows: Arrow[] = [];
  if (showDeps && chartW > 0) {
    validRows.forEach(r => {
      const deps = r.dependsOn.split(",").map(s => s.trim()).filter(Boolean);
      deps.forEach(dep => {
        const depRow = validRows.find(v => v.batch === dep);
        if (!depRow) return;
        const depEnd  = parseDate(depRow.endDate)!;
        const rStart  = parseDate(r.startDate)!;
        const x1 = dateToX(depEnd);
        const y1 = rowYCenter[dep] ?? 0;
        const x2 = dateToX(rStart);
        const y2 = rowYCenter[r.batch] ?? 0;
        const conflict = rStart < depEnd;
        const critical = showCriticalPath && criticalPath.has(r.batch) && criticalPath.has(dep);
        arrows.push({ x1, y1, x2, y2, conflict, critical });
      });
    });
  }

  return (
    <div ref={containerRef} style={{ overflowX: "auto", overflowY: "visible", minWidth: "600px" }}>
      {containerW === 0 ? null : (
        <div style={{ width: containerW, position: "relative" }}>

          {/* ── HEADER ROW (month labels + Today badge) ── */}
          <div style={{
            display: "flex",
            height: `${HEADER_H}px`,
            borderBottom: "2px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            borderRadius: "8px 8px 0 0",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Label column header */}
            <div style={{
              width: `${LABEL_W}px`, flexShrink: 0,
              display: "flex", alignItems: "center",
              paddingLeft: "8px",
              borderRight: "1px solid #e2e8f0",
            }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Batch
              </span>
            </div>
            {/* Chart header — month labels */}
            <div style={{ flex: 1, position: "relative" }}>
              {monthMarkers.map((m, i) => (
                <div key={i} style={{
                  position: "absolute",
                  left: `${m.x}px`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "11px", fontWeight: 600, color: "#64748b",
                  whiteSpace: "nowrap", letterSpacing: "0.02em",
                  pointerEvents: "none",
                }}>
                  {m.label}
                </div>
              ))}
              {/* TODAY badge in header */}
              {showToday && (
                <div style={{
                  position: "absolute",
                  left: `${todayX}px`,
                  top: 0,
                  transform: "translateX(-50%)",
                  zIndex: 20,
                }}>
                  <div style={{
                    backgroundColor: "#ef4444", color: "white",
                    fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em",
                    padding: "3px 8px",
                    borderRadius: "0 0 5px 5px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(239,68,68,0.35)",
                  }}>
                    TODAY
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── GRID + ROWS ── */}
          <div style={{ display: "flex", position: "relative" }}>

            {/* Label column */}
            <div style={{
              width: `${LABEL_W}px`, flexShrink: 0,
              borderRight: "1px solid #e2e8f0",
              position: "relative", zIndex: 5,
              backgroundColor: "white",
            }}>
              {layoutItems.map((item, idx) => {
                if (item.type === "divider") {
                  const band = PI_BAND_COLORS[item.pi];
                  if (!band) return null;
                  return (
                    <div key={`div-label-${item.pi}`} style={{
                      height: `${item.h}px`,
                      backgroundColor: band.bg,
                      borderTop: `2px solid ${band.border}`,
                      borderBottom: `1px solid ${band.border}`,
                      display: "flex", alignItems: "center",
                      paddingLeft: "8px",
                    }}>
                      <span style={{
                        fontSize: "10px", fontWeight: 700, color: band.text,
                        textTransform: "uppercase", letterSpacing: "0.07em",
                      }}>
                        {band.label}
                      </span>
                    </div>
                  );
                }
                const r = item.row;
                const isCP = showCriticalPath && criticalPath.has(r.batch);
                const band = PI_BAND_COLORS[r.pi];
                const rowBg = piFilter === "All" && band ? band.bg + "55" : "transparent";
                return (
                  <div key={`label-${r.id}`} style={{
                    height: `${item.h}px`,
                    backgroundColor: rowBg,
                    borderBottom: "1px solid #f1f5f9",
                    display: "flex", flexDirection: "column", justifyContent: "center",
                    paddingLeft: "8px", paddingRight: "12px",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      fontSize: "12px", fontWeight: 600, color: "#1e293b",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      {isCP && <span style={{ color: "#f97316", fontSize: "10px", flexShrink: 0 }}>★</span>}
                      {r.batch}
                    </div>
                    <div style={{
                      fontSize: "10px", color: "#94a3b8", fontWeight: 500,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      marginTop: "1px",
                    }}>
                      {r.system}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart area — SVG overlay + HTML bars */}
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

              {/* ── LAYER 1: Grid lines (SVG, back) ── */}
              <svg
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: `${chartW}px`, height: `${totalGridH}px`,
                  pointerEvents: "none", zIndex: 1,
                }}
              >
                {/* Vertical month grid lines */}
                {monthMarkers.map((m, i) => (
                  <line key={i}
                    x1={m.x} y1={0} x2={m.x} y2={totalGridH}
                    stroke="#e8edf3" strokeWidth="1"
                  />
                ))}
                {/* Horizontal row separators */}
                {layoutItems.map((item, i) => (
                  <line key={i}
                    x1={0} y1={item.y + item.h} x2={chartW} y2={item.y + item.h}
                    stroke="#f1f5f9" strokeWidth="1"
                  />
                ))}
              </svg>

              {/* ── LAYER 2: Today line (SVG, above grid) ── */}
              {showToday && (
                <svg
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: `${chartW}px`, height: `${totalGridH}px`,
                    pointerEvents: "none", zIndex: 2,
                  }}
                >
                  <line
                    x1={todayX} y1={0} x2={todayX} y2={totalGridH}
                    stroke="#ef4444" strokeWidth="1.5" opacity="0.7"
                  />
                </svg>
              )}

              {/* ── LAYER 3: Dependency lines (SVG) ── */}
              {showDeps && arrows.length > 0 && (
                <svg
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: `${chartW}px`, height: `${totalGridH}px`,
                    pointerEvents: "none", zIndex: 3,
                    overflow: "visible",
                  }}
                >
                  <defs>
                    {[
                      { id: "arr-normal",   color: "#94a3b8" },
                      { id: "arr-conflict", color: "#f59e0b" },
                      { id: "arr-critical", color: "#f97316" },
                    ].map(({ id, color }) => (
                      <marker key={id} id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill={color} opacity="0.8" />
                      </marker>
                    ))}
                  </defs>
                  {arrows.map((a, i) => {
                    const color   = a.conflict ? "#f59e0b" : a.critical ? "#f97316" : "#94a3b8";
                    const strokeW = a.critical ? 1.5 : 1;
                    const markId  = a.conflict ? "arr-conflict" : a.critical ? "arr-critical" : "arr-normal";
                    // Smooth elbow: go right from x1, then curve down/up to x2
                    const midX = (a.x1 + a.x2) / 2;
                    const d = `M ${a.x1} ${a.y1} C ${midX} ${a.y1}, ${midX} ${a.y2}, ${a.x2} ${a.y2}`;
                    return (
                      <path key={i} d={d}
                        fill="none"
                        stroke={color} strokeWidth={strokeW} opacity="0.7"
                        strokeDasharray={a.conflict ? "4,3" : undefined}
                        markerEnd={`url(#${markId})`}
                      />
                    );
                  })}
                </svg>
              )}

              {/* ── LAYER 4: PI swimlane dividers (HTML, above deps) ── */}
              {piFilter === "All" && layoutItems.filter(i => i.type === "divider").map(item => {
                if (item.type !== "divider") return null;
                const band = PI_BAND_COLORS[item.pi];
                if (!band) return null;
                return (
                  <div key={`div-chart-${item.pi}`} style={{
                    position: "absolute", top: `${item.y}px`, left: 0,
                    width: "100%", height: `${item.h}px`,
                    backgroundColor: band.bg,
                    borderTop: `2px solid ${band.border}`,
                    borderBottom: `1px solid ${band.border}`,
                    zIndex: 4,
                  }} />
                );
              })}

              {/* ── LAYER 5: Batch bars (HTML, front) ── */}
              {layoutItems.map(item => {
                if (item.type !== "row") return null;
                const r = item.row;
                const start = parseDate(r.startDate)!;
                const end   = parseDate(r.endDate)!;
                const barX  = dateToX(start);
                const barW  = Math.max(dateToX(end) - barX, 4);
                const isCP       = showCriticalPath && criticalPath.has(r.batch);
                const barColor    = STATUS_BADGE[r.status]?.bar ?? "#94a3b8";
                const isCompleted = r.status === "Done";
                const band = PI_BAND_COLORS[r.pi];
                const rowBg = piFilter === "All" && band ? band.bg + "55" : "transparent";
                return (
                  <div key={`bar-${r.id}`} style={{
                    position: "absolute",
                    top: `${item.y}px`,
                    left: 0,
                    width: "100%",
                    height: `${item.h}px`,
                    backgroundColor: rowBg,
                    zIndex: 5,
                  }}>
                    <div
                      title={`${r.batch} — ${r.name}\n${r.startDate} → ${r.endDate}\nStatus: ${r.status}${r.dependsOn ? "\nDepends on: " + r.dependsOn : ""}`}
                      style={{
                        position: "absolute",
                        left: `${barX}px`,
                        width: `${barW}px`,
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: `${BAR_H}px`,
                        backgroundColor: barColor,
                        borderRadius: "6px",
                        display: "flex", alignItems: "center",
                        paddingLeft: "10px", paddingRight: "10px",
                        overflow: "hidden",
                        boxShadow: isCP
                          ? "0 0 0 2px #f97316, 0 2px 8px rgba(249,115,22,0.3)"
                          : isCompleted
                          ? "0 1px 4px rgba(22,101,52,0.2)"
                          : "0 1px 4px rgba(0,0,0,0.1)",
                        cursor: "default",
                        transition: "filter 0.15s",
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.filter = "brightness(1.1)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.filter = "none"; }}
                    >
                      {isCompleted && (
                        <span style={{ fontSize: "13px", marginRight: "5px", flexShrink: 0, color: "rgba(255,255,255,0.9)" }}>✓</span>
                      )}
                      <span style={{
                        fontSize: "11px", fontWeight: 600, color: "#fff",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        letterSpacing: "0.01em",
                      }}>
                        {r.name}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>{/* end chart area */}
          </div>{/* end grid+rows */}

          {/* ── LEGEND ── */}
          <div style={{
            marginTop: "16px", marginLeft: `${LABEL_W}px`,
            display: "flex", gap: "20px", flexWrap: "wrap",
          }}>
            {[
              { color: "#16a34a", label: "Done" },
              { color: "#2563eb", label: "Committed" },
              { color: "#ea580c", label: "Stretch" },
              { color: "#7c3aed", label: "MVP" },
              { color: "#ef4444", label: "Today", isLine: true },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {(l as any).isLine
                  ? <div style={{ width: "16px", height: "2px", backgroundColor: l.color, flexShrink: 0, opacity: 0.7 }} />
                  : <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color, flexShrink: 0 }} />
                }
                <span style={{ fontSize: "11px", color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
            {showDeps && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "20px", height: "1px", backgroundColor: "#94a3b8" }} />
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
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BatchDeliveryCalendar() {
  const [rows, setRows] = useState<BatchRow[]>(() => BASELINE_ROWS.map(r => ({ ...r })));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<BatchRow | null>(null);
  const [showDeps, setShowDeps] = useState(true);
  const [showCP, setShowCP] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [showRiskDetail, setShowRiskDetail] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shiftOffer, setShiftOffer] = useState<{ batchId: string; delta: number; affected: string[] } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [piFilter, setPiFilter] = useState<string>("All"); // "All" | "PI 1" | "PI 2" | "PI 3" | "PI 4"



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

  const criticalPathResult = useMemo(() => computeCriticalPath(validatedRows), [validatedRows]);
  const criticalPath = useMemo(() => computeCriticalPathLabels(validatedRows), [validatedRows]);

  // ── Print-optimized Gantt export ─────────────────────────────────────────────
  const printGantt = useCallback(() => {
    const piLabel = piFilter === "All" ? "All PIs" : piFilter;
    const filtered = piFilter === "All" ? validatedRows : validatedRows.filter(r => r.pi === piFilter);
    const rows = filtered;
    const allDates = rows.filter(r => r.startDate && r.endDate)
      .flatMap(r => [new Date(r.startDate), new Date(r.endDate)]);
    if (allDates.length === 0) return;
    const minD = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxD = new Date(Math.max(...allDates.map(d => d.getTime())));
    minD.setDate(minD.getDate() - 7);
    maxD.setDate(maxD.getDate() + 14);
    const totalDays = Math.round((maxD.getTime() - minD.getTime()) / 86400000);
    const ROW_H = 36;
    const LABEL_W = 220;
    const CHART_W = 900;

    // Group rows by PI for swimlane dividers
    const piOrder = ["PI 1", "PI 2", "PI 3", "PI 4"];
    const grouped: { pi: string; rows: typeof rows }[] = [];
    for (const pi of piOrder) {
      const piRows = rows.filter(r => r.pi === pi);
      if (piRows.length > 0) grouped.push({ pi, rows: piRows });
    }

    const PI_COLORS: Record<string, string> = {
      "PI 1": "#1e3a5f", "PI 2": "#1e40af", "PI 3": "#166534", "PI 4": "#7c2d12",
    };
    const SYS_COLORS: Record<string, string> = {
      PDC: "#2563eb", TDC: "#059669", Orchestrator: "#7c3aed", Roger: "#0ea5e9", Platform: "#94a3b8",
    };
    const STATUS_COLORS: Record<string, string> = {
  "Done":      "#16a34a",
  "Committed": "#2563eb",
  "Stretch":   "#ea580c",
  "MVP":       "#7c3aed",
};

    // Build month markers
    const months: { label: string; pct: number }[] = [];
    const mc = new Date(minD.getFullYear(), minD.getMonth(), 1);
    while (mc <= maxD) {
      const pct = ((mc.getTime() - minD.getTime()) / 86400000 / totalDays) * 100;
      if (pct >= 0 && pct <= 100) {
        months.push({ label: mc.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), pct });
      }
      mc.setMonth(mc.getMonth() + 1);
    }

    // Build HTML rows
    let rowsHtml = "";
    for (const group of grouped) {
      const piColor = PI_COLORS[group.pi] || "#1e3a5f";
      rowsHtml += `
        <tr>
          <td colspan="2" style="background:${piColor};color:white;font-size:11px;font-weight:700;
            padding:5px 12px;letter-spacing:0.06em;text-transform:uppercase;border-bottom:2px solid white;">
            ${group.pi} &rarr; ${group.pi === "PI 1" ? "Foundation & AI Mapping" : group.pi === "PI 2" ? "Entity, Workflow & Tax Ready" : group.pi === "PI 3" ? "Intelligence, Provision & Audit" : "Governance, QC & Analytics"}
          </td>
        </tr>`;
      for (const r of group.rows) {
        if (!r.startDate || !r.endDate) continue;
        const s = new Date(r.startDate);
        const e = new Date(r.endDate);
        const leftPct = ((s.getTime() - minD.getTime()) / 86400000 / totalDays) * 100;
        const widthPct = Math.max(((e.getTime() - s.getTime()) / 86400000 / totalDays) * 100, 1.2);
        const barColor = STATUS_BADGE[r.status]?.bar ?? (SYS_COLORS[r.system] || "#94a3b8");
        const isCompleted = r.status === "Done";
        rowsHtml += `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="width:${LABEL_W}px;padding:4px 8px;font-size:11px;font-weight:600;color:#374151;
              white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${LABEL_W}px;">
              ${r.batch}<br/><span style="font-size:9px;color:#94a3b8;font-weight:400;">${r.system}</span>
            </td>
            <td style="position:relative;height:${ROW_H}px;padding:0;">
              <div style="position:absolute;left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;
                top:50%;transform:translateY(-50%);height:22px;background:${barColor};
                border-radius:4px;display:flex;align-items:center;padding:0 6px;overflow:hidden;">
                <span style="font-size:9px;font-weight:600;color:white;white-space:nowrap;
                  overflow:hidden;text-overflow:ellipsis;">${r.name}</span>
              </div>
            </td>
          </tr>`;
      }
    }

    // Month header row
    let monthHeaderCells = `<td style="width:${LABEL_W}px;"></td><td style="position:relative;height:24px;">`;
    for (const m of months) {
      monthHeaderCells += `<span style="position:absolute;left:${m.pct.toFixed(1)}%;transform:translateX(-50%);
        font-size:10px;color:#94a3b8;font-weight:500;white-space:nowrap;">${m.label}</span>`;
    }
    monthHeaderCells += `</td>`;

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>DCT Batch Delivery Calendar — ${piLabel}</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 24px; background: white; color: #0f172a; }
    h1 { font-size: 18px; font-weight: 700; margin: 0 0 4px; color: #0f172a; }
    .sub { font-size: 12px; color: #64748b; margin: 0 0 20px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td { vertical-align: middle; }
    .legend { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px; }
    .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #64748b; }
    .legend-dot { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
    @media print {
      body { padding: 12px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div>
      <h1>DCT Batch Delivery Calendar</h1>
      <p class="sub">RSM · CATT · Planning View Only — Not Source of Truth &nbsp;|&nbsp; Filter: ${piLabel} &nbsp;|&nbsp; ${rows.length} batches</p>
    </div>
    <button onclick="window.print()" style="font-size:12px;padding:8px 16px;background:#2563eb;color:white;
      border:none;border-radius:6px;cursor:pointer;">Print / Save as PDF</button>
  </div>
  <table style="width:100%;">
    <colgroup>
      <col style="width:${LABEL_W}px;"/>
      <col style="width:${CHART_W}px;"/>
    </colgroup>
    <tr>${monthHeaderCells}</tr>
    ${rowsHtml}
  </table>
  <div class="legend">
    <div class="legend-item"><div class="legend-dot" style="background:#2563eb;"></div>PDC</div>
    <div class="legend-item"><div class="legend-dot" style="background:#059669;"></div>TDC</div>
    <div class="legend-item"><div class="legend-dot" style="background:#166534;"></div>Completed</div>
    <div class="legend-item"><div class="legend-dot" style="background:#94a3b8;"></div>Platform</div>
    <div class="legend-item"><div class="legend-dot" style="background:#d97706;"></div>At Risk</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  }, [validatedRows, piFilter]);

  // ── Executive summary metrics ────────────────────────────────────────────────

  const summary = useMemo(() => {
    const valid = validatedRows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);
    const allDates = valid.flatMap(r => [parseDate(r.startDate)!, parseDate(r.endDate)!]);
    const minD = allDates.length ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
    const maxD = allDates.length ? new Date(Math.max(...allDates.map(d => d.getTime()))) : null;
    const totalDays = minD && maxD ? daysBetween(minD, maxD) : 0;
    const risks = validatedRows.filter(r => r._dateError || r._depConflict || r.status === "Stretch");
    const cpOrdered = criticalPathResult.orderedPath;
    const cpTotalDays = criticalPathResult.totalDays;
    const piGroups = new Set(validatedRows.map(r => r.pi));
    const systemGroups = new Set(validatedRows.map(r => r.system));
    return { totalDays, minD, maxD, risks, cpOrdered, cpTotalDays, piGroups, systemGroups };
  }, [validatedRows, criticalPath, criticalPathResult]);

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
      name: "New Batch", startDate: "", endDate: "", status: "Committed", notes: "", dependsOn: "",
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
    const header = "PI,Batch,System,Name,Start Date,End Date,Status,Depends On,Notes";
    const lines = validatedRows.map(r =>
      [r.pi, r.batch, r.system, `"${r.name}"`, r.startDate, r.endDate, r.status, `"${r.dependsOn}"`, `"${r.notes}"`].join(",")
    );
    const blob = new Blob([`PLANNING VIEW ONLY — NOT SOURCE OF TRUTH\n${header}\n${lines.join("\n")}`], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `dct-batch-calendar.csv`; a.click();
  }, [validatedRows]);

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
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.2 }}>
              Batch Delivery Calendar
            </h1>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0", maxWidth: "520px" }}>
              Planning view for scheduling discussions and PI delivery tracking.
              Data entered here does not update any other platform view.
            </p>
          </div>

          {/* Controls — top right, minimal */}
          <div className="no-print" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>

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
              value: `${summary.cpOrdered.length} batches · ${summary.cpTotalDays}d`,
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
                  {r.status === "Stretch" && !r._dateError && !r._depConflict && " — Stretch Goal"}
                  {r.notes && <span style={{ color: "#a16207" }}> · {r.notes}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CRITICAL PATH SEQUENCE ───────────────────────────────────────────── */}
        {showCP && summary.cpOrdered.length > 0 && (() => {
          // Group by PI for swimlane display
          const piOrder = ["PI 2", "PI 3", "PI 4"];
          const piColors: Record<string, { bg: string; border: string; header: string; label: string }> = {
            "PI 2": { bg: "#eff6ff", border: "#bfdbfe", header: "#1e40af", label: "PI 2 — Entity, Workflow & Tax Ready" },
            "PI 3": { bg: "#f0fdf4", border: "#bbf7d0", header: "#166534", label: "PI 3 — Intelligence, Provision & Audit" },
            "PI 4": { bg: "#fefce8", border: "#fde68a", header: "#92400e", label: "PI 4 — Governance, QC & Analytics" },
          };
          const grouped: Record<string, typeof summary.cpOrdered> = {};
          for (const r of summary.cpOrdered) {
            if (!grouped[r.pi]) grouped[r.pi] = [];
            grouped[r.pi].push(r);
          }
          const sysLabel = (sys: string) => sys === "PDC" ? "PDC" : sys === "TDC" ? "TDC" : sys;
          const sysColor = (sys: string) => sys === "PDC" ? "#2563eb" : sys === "TDC" ? "#059669" : "#7c3aed";
          return (
            <div style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "12px", padding: "20px 24px", marginBottom: "24px",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <div style={{ width: "3px", height: "18px", backgroundColor: "#f97316", borderRadius: "2px" }} />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Critical Path
                </span>
                <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                  {summary.cpOrdered.length} batches · {summary.cpTotalDays} calendar days
                </span>
                <span style={{
                  marginLeft: "auto", fontSize: "10px", color: "#64748b",
                  backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0",
                  borderRadius: "4px", padding: "2px 8px", fontStyle: "italic",
                }}>
                  Auto-derived from Batch Delivery Calendar · Read-only
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 16px 13px" }}>
                Longest dependency-driven sequence. PDC precedes TDC where platform flow applies. Updates automatically when calendar data changes.
              </p>

              {/* PI Swimlanes */}
              {piOrder.filter(pi => grouped[pi]?.length > 0).map((pi, piIdx) => {
                const band = piColors[pi] || { bg: "#f8fafc", border: "#e2e8f0", header: "#475569", label: pi };
                const piRows = grouped[pi];
                return (
                  <div key={pi} style={{ marginBottom: piIdx < piOrder.filter(p => grouped[p]?.length > 0).length - 1 ? "16px" : "0" }}>
                    {/* PI label */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      marginBottom: "8px",
                    }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: band.header }} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: band.header, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        {band.label}
                      </span>
                      <div style={{ flex: 1, height: "1px", backgroundColor: band.border }} />
                    </div>
                    {/* Batch cards */}
                    <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap", gap: "0", paddingLeft: "18px" }}>
                      {piRows.map((r, i) => (
                        <div key={r.id} style={{ display: "flex", alignItems: "center" }}>
                          <div style={{
                            display: "flex", flexDirection: "column",
                            padding: "8px 14px",
                            backgroundColor: band.bg,
                            border: `1.5px solid ${band.border}`,
                            borderLeft: `3px solid ${sysColor(r.system)}`,
                            borderRadius: "8px",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}>
                            {/* Batch # + system badge */}
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{r.batch}</span>
                              <span style={{
                                fontSize: "9px", fontWeight: 700,
                                color: sysColor(r.system),
                                backgroundColor: r.system === "PDC" ? "#dbeafe" : r.system === "TDC" ? "#dcfce7" : "#f3e8ff",
                                borderRadius: "3px", padding: "1px 5px",
                              }}>
                                {sysLabel(r.system)}
                              </span>
                            </div>
                            {/* Name */}
                            <span style={{ fontSize: "10px", color: "#374151", lineHeight: "1.3", marginBottom: "4px" }}>
                              {r.name}
                            </span>
                            {/* Date range */}
                            <span style={{ fontSize: "9px", color: "#94a3b8" }}>
                              {formatDate(r.startDate)} → {formatDate(r.endDate)}
                            </span>
                          </div>
                          {i < piRows.length - 1 && (
                            <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
                              <div style={{ width: "16px", height: "1.5px", backgroundColor: "#f97316" }} />
                              <div style={{
                                width: 0, height: 0,
                                borderTop: "4px solid transparent",
                                borderBottom: "4px solid transparent",
                                borderLeft: "6px solid #f97316",
                              }} />
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Cross-PI arrow if this PI feeds the next */}
                      {piIdx < piOrder.filter(p => grouped[p]?.length > 0).length - 1 && (
                        <div style={{ display: "flex", alignItems: "center", padding: "0 8px" }}>
                          <span style={{ fontSize: "10px", color: "#94a3b8", fontStyle: "italic" }}>→ PI {parseInt(pi.replace("PI ", "")) + 1}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* ── GANTT TIMELINE ───────────────────────────────────────────────────── */}
        <div style={{
          backgroundColor: "white", border: "1px solid #e2e8f0",
          borderRadius: "12px", padding: "24px", marginBottom: "24px",
        }}>
          {/* Gantt section header + PI filter + Print button */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "3px", height: "16px", backgroundColor: "#2563eb", borderRadius: "2px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Delivery Timeline
              </span>
            </div>
            {/* PI filter pills */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginRight: "2px" }}>Show:</span>
              {(["All", "PI 1", "PI 2", "PI 3", "PI 4"] as const).map(pi => {
                const active = piFilter === pi;
                const piColors: Record<string, string> = {
                  "All": "#2563eb", "PI 1": "#1e3a5f", "PI 2": "#1e40af", "PI 3": "#166534", "PI 4": "#7c2d12",
                };
                const c = piColors[pi] || "#2563eb";
                const count = pi === "All" ? validatedRows.length : validatedRows.filter(r => r.pi === pi).length;
                return (
                  <button
                    key={pi}
                    onClick={() => setPiFilter(pi)}
                    style={{
                      fontSize: "11px", fontWeight: active ? 700 : 500,
                      color: active ? "white" : c,
                      background: active ? c : "white",
                      border: `1px solid ${active ? c : "#e2e8f0"}`,
                      borderRadius: "20px",
                      padding: "4px 12px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: "5px",
                    }}
                  >
                    {pi}
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      background: active ? "rgba(255,255,255,0.25)" : (c + "22"),
                      color: active ? "white" : c,
                      borderRadius: "10px",
                      padding: "1px 6px",
                      lineHeight: 1.4,
                    }}>{count}</span>
                  </button>
                );
              })}
              <button
                onClick={printGantt}
                style={{
                  fontSize: "11px", fontWeight: 500, color: "#374151",
                  border: "1px solid #e2e8f0", borderRadius: "20px",
                  padding: "4px 12px", backgroundColor: "white", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px", marginLeft: "8px",
                }}
              >
                <Printer size={11} /> Print View
              </button>
            </div>
          </div>
          <GanttChart
            rows={piFilter === "All" ? validatedRows : validatedRows.filter(r => r.pi === piFilter)}
            showDeps={showDeps}
            showCriticalPath={showCP}
            criticalPath={criticalPath}
            piFilter={piFilter}
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
                                  {(["Done", "Committed", "Stretch", "MVP"] as BatchStatus[]).map(s => (
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
