// RSM | CATT · DCT Platform · Batch Delivery Calendar
// PLANNING VIEW ONLY — NOT SOURCE OF TRUTH
// Fully isolated — does NOT read from or write to any other page, Control Panel,
// Batch Roadmap, API coverage, or any system data. All data is local state only.
//
// DESIGN PHILOSOPHY: Executive-first. Timeline is the primary visual.
// Clean, calm, RSM-branded. Understandable in under 60 seconds.

import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { useBatchStatus, contextToCalendarStatus } from "@/contexts/BatchStatusContext";
import {
  AlertTriangle, Calendar, Download, RotateCcw, Plus, Trash2,
  CheckCircle2, Clock, AlertCircle, Printer, ChevronDown, ChevronRight,
  Info, Eye, EyeOff, Copy, Upload, X as XIcon, Mail, FileSpreadsheet,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type BatchStatus = "Done" | "Committed" | "Stretch" | "MVP" | "New" | "On Hold" | "Post-MVP";
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

// ─── BASELINE DATA — rebuilt from authoritative DCT_Calendar.xlsx (2026-05-21) ─
// Source columns: PI | Status | Batch | Feat (=System) | Name | Start | End
// Parked batches (B24 PDC/TDC, B25 PDC/TDC — superseded by Blue J) are excluded
// from the Gantt timeline. On Hold (B9 TDC) is excluded from timeline.
// Post-MVP and Future batches without dates are excluded from the Gantt.
const BASELINE_ROWS: BatchRow[] = [
  // ── PI 1 — Complete ──────────────────────────────────────────────────────────
  {
    id: "pi1-fc-platform", pi: "PI 1", batch: "FC", system: "Platform",
    name: "Foundation Core",
    startDate: "2026-01-01", endDate: "2026-03-31", status: "Done",
    notes: "Foundation Core — Platform. Complete. Schema Lock achieved.", dependsOn: "",
  },
  {
    id: "pi1-b1-pdc", pi: "PI 1", batch: "B1", system: "PDC",
    name: "File Ingestion & Initial Storage",
    startDate: "2026-01-15", endDate: "2026-03-31", status: "Done",
    notes: "Batch 1 PDC. Complete.", dependsOn: "FC",
  },
  {
    id: "pi1-b2-pdc", pi: "PI 1", batch: "B2", system: "PDC",
    name: "Normalization & Cross-LOB Taxonomy",
    startDate: "2026-02-01", endDate: "2026-03-31", status: "Done",
    notes: "Batch 2 PDC. Complete.", dependsOn: "B1",
  },
  {
    id: "pi1-b3-tdc", pi: "PI 1", batch: "B3", system: "TDC",
    name: "Tax Domain Authority & Tax Taxonomy",
    startDate: "2026-02-15", endDate: "2026-03-31", status: "Done",
    notes: "Batch 3 TDC. Complete.", dependsOn: "B2",
  },
  // ── PI 2 — Done ──────────────────────────────────────────────────────────────
  {
    id: "pi2-b4-tdc", pi: "PI 2", batch: "B4", system: "TDC",
    name: "AI Mapping Proposals & Decisions",
    startDate: "2026-04-01", endDate: "2026-04-21", status: "Done",
    notes: "Batch 4 TDC. Done. AI Mapping proposals, decisions, and governance.", dependsOn: "B3",
  },
  {
    id: "pi2-b5-pdc", pi: "PI 2", batch: "B5", system: "PDC",
    name: "Entity Identity & Structure",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "Done",
    notes: "Batch 5 PDC. Done.", dependsOn: "B4",
  },
  {
    id: "pi2-b6-tdc", pi: "PI 2", batch: "B6", system: "TDC",
    name: "Practitioner Review & Lock",
    startDate: "2026-04-22", endDate: "2026-04-30", status: "Done",
    notes: "Batch 6 TDC. Done. Parallel with B5 PDC.", dependsOn: "B4",
  },
  {
    id: "pi2-b2a-pdc", pi: "PI 2", batch: "B2A", system: "PDC",
    name: "Orchestrator Classification Result & Contract Enforcement",
    startDate: "2026-04-29", endDate: "2026-05-09", status: "Done",
    notes: "Batch 2A PDC. Done.", dependsOn: "B5",
  },
  {
    id: "pi2-b7-tdc", pi: "PI 2", batch: "B7", system: "TDC",
    name: "Client Tax Profile & Eligibility",
    startDate: "2026-05-01", endDate: "2026-05-11", status: "Done",
    notes: "Batch 7 TDC. Done.", dependsOn: "B2A,B5,B6",
  },
  // ── PI 2 — Active / Committed ─────────────────────────────────────────────────
  {
    id: "pi2-b8-pdc", pi: "PI 2", batch: "B8", system: "PDC",
    name: "Exceptions & Remediation",
    startDate: "2026-05-12", endDate: "2026-05-20", status: "Done",
    notes: "Batch 8 PDC. Done. Exceptions and remediation — PDC side.", dependsOn: "B5,B2A",
  },
  {
    id: "pi2-b8-tdc", pi: "PI 2", batch: "B8", system: "TDC",
    name: "Exceptions & Remediation",
    startDate: "2026-05-12", endDate: "2026-05-20", status: "Done",
    notes: "Batch 8 TDC. Done. Exceptions and remediation — TDC side. Parallel with B8 PDC.", dependsOn: "B7",
  },
  {
    id: "pi2-b9-pdc", pi: "PI 2", batch: "B9", system: "PDC",
    name: "Roger Gateway & Governed Consumer Access Layer",
    startDate: "2026-05-21", endDate: "2026-06-02", status: "Done",
    notes: "Batch 9 PDC. Done. Roger Gateway & Governed Consumer Access Layer. Ocelot gateway, IMS/CEM/TIM pass-through.", dependsOn: "B8",
  },
  // NOTE: B9 TDC is ON HOLD — absorbed into B31 TDC (Legacy Tool Prior Year Data Housing)
  {
    id: "pi2-b10-tdc", pi: "PI 2", batch: "B10", system: "TDC",
    name: "Return Assembly, Filing & Lineage",
    startDate: "2026-06-03", endDate: "2026-06-05", status: "Done",
    notes: "Batch 10 TDC. Done. Return assembly, filing, and lineage closure.", dependsOn: "B6,B9",
  },
  {
    id: "pi2-b43-tdc", pi: "PI 2", batch: "B43", system: "TDC",
    name: "Practitioner Book & Reclass Adjustments",
    startDate: "2026-06-10", endDate: "2026-06-16", status: "New",
    notes: "Batch 43 TDC. New. Practitioner book and reclass adjustments. Duration: 5 BD. Added Jun 2026.", dependsOn: "B10",
  },
  {
    id: "pi2-b16-pdc-stretch", pi: "PI 2", batch: "B16", system: "PDC",
    name: "Audit Trail & Lineage Governance",
    startDate: "2026-06-17", endDate: "2026-06-25", status: "Stretch",
    notes: "Batch 16 PDC. PI 2 Stretch. Audit trail and lineage governance — PDC side. Duration: 7 BD.", dependsOn: "B43",
  },
  {
    id: "pi2-b11-tdc", pi: "PI 2", batch: "B11", system: "TDC",
    name: "Learning Governance & Model Evolution",
    startDate: "2026-06-17", endDate: "2026-06-25", status: "Committed",
    notes: "Batch 11 TDC. Learning governance and model evolution. Duration: 7 BD.", dependsOn: "B43",
  },
  {
    id: "pi2s-b13-pdc", pi: "PI 2", batch: "B13", system: "PDC",
    name: "Platform Reference & Document Provenance",
    startDate: "2026-06-26", endDate: "2026-07-08", status: "Stretch",
    notes: "Batch 13 PDC. PI 2 Stretch. Platform reference and document provenance. Duration: 7 BD.", dependsOn: "B11",
  },
  {
    id: "pi2s-b16-tdc", pi: "PI 2", batch: "B16", system: "TDC",
    name: "Audit Trail & Lineage Governance",
    startDate: "2026-06-26", endDate: "2026-07-08", status: "Stretch",
    notes: "Batch 16 TDC. PI 2 Stretch. Audit trail and lineage governance — TDC side. Duration: 7 BD.", dependsOn: "B16",
  },
  // ── PI 3 — MVP ───────────────────────────────────────────────────────────────
  {
    id: "pi3-b20-pdc", pi: "PI 3", batch: "B20", system: "PDC",
    name: "Firm Governance & Professional Standards",
    startDate: "2026-07-13", endDate: "2026-07-21", status: "MVP",
    notes: "Batch 20 PDC. MVP. Firm governance and professional standards. Duration: 7 BD.", dependsOn: "B13",
  },
  {
    id: "pi3-b42-tdc", pi: "PI 3", batch: "B42", system: "TDC",
    name: "Tax Rules Framework & Book-to-Tax Adjustment Rules",
    startDate: "2026-07-13", endDate: "2026-07-21", status: "MVP",
    notes: "Batch 42 TDC. MVP. Tax rules framework and book-to-tax adjustment rules. New batch added Jun 2026. Duration: 7 BD.", dependsOn: "B11",
  },
  {
    id: "pi3-b21-pdc", pi: "PI 3", batch: "B21", system: "PDC",
    name: "Quality Control Standards",
    startDate: "2026-07-22", endDate: "2026-07-30", status: "MVP",
    notes: "Batch 21 PDC. MVP. Quality control standards. Duration: 7 BD.", dependsOn: "B20",
  },
  {
    id: "pi3-b28-tdc", pi: "PI 3", batch: "B28", system: "TDC",
    name: "Tax Workpaper & Provision Schedules",
    startDate: "2026-07-22", endDate: "2026-07-30", status: "MVP",
    notes: "Batch 28 TDC. MVP. Tax workpaper and provision schedules. Duration: 7 BD.", dependsOn: "B42",
  },
  {
    id: "pi3-b9a-gateway", pi: "PI 3", batch: "B9a", system: "PDC",
    name: "Data Gateway (IMS, CDS, DUO)",
    startDate: "2026-07-31", endDate: "2026-08-10", status: "MVP",
    notes: "Batch 9a PDC. MVP. Data Gateway — IMS, CDS, DUO integration. Duration: 7 BD.", dependsOn: "B21",
  },
  {
    id: "pi3-b31-pdc", pi: "PI 3", batch: "B31", system: "PDC",
    name: "Legacy Tool Prior Year Ingestion",
    startDate: "2026-07-31", endDate: "2026-08-10", status: "MVP",
    notes: "Batch 31 PDC. MVP. Legacy tool prior year ingestion. Duration: 7 BD.", dependsOn: "B21",
  },
  {
    id: "pi3-b17-tdc", pi: "PI 3", batch: "B17", system: "TDC",
    name: "Decision Support, Overrides, Evidence & Workpapers",
    startDate: "2026-07-31", endDate: "2026-08-10", status: "MVP",
    notes: "Batch 17 TDC. MVP. Decision support, overrides, evidence, and workpapers. Duration: 7 BD.", dependsOn: "B28",
  },
  {
    id: "pi3-b26-pdc", pi: "PI 3", batch: "B26", system: "PDC",
    name: "Entity Constituents & Allocations",
    startDate: "2026-08-11", endDate: "2026-08-19", status: "MVP",
    notes: "Batch 26 PDC. MVP. Entity constituents and allocations. Duration: 7 BD.", dependsOn: "B9a",
  },
  {
    id: "pi3-b29-tdc", pi: "PI 3", batch: "B29", system: "TDC",
    name: "Consolidated Return Assembly",
    startDate: "2026-08-11", endDate: "2026-08-19", status: "MVP",
    notes: "Batch 29 TDC. MVP. Consolidated return assembly. Duration: 7 BD.", dependsOn: "B17",
  },
  {
    id: "pi3-b31-tdc", pi: "PI 3", batch: "B31", system: "TDC",
    name: "Legacy Tool Prior Year Data Housing",
    startDate: "2026-08-20", endDate: "2026-08-28", status: "MVP",
    notes: "Batch 31 TDC. MVP. Legacy tool prior year data housing. Absorbs B9 TDC (On Hold). Duration: 7 BD.", dependsOn: "B29",
  },
  {
    id: "pi3-b39-tdc", pi: "PI 3", batch: "B39", system: "TDC",
    name: "Calculation Report",
    startDate: "2026-08-31", endDate: "2026-09-09", status: "MVP",
    notes: "Batch 39 TDC. MVP. Calculation report. Duration: 7 BD.", dependsOn: "B31",
  },
  {
    id: "pi3-b33-tdc", pi: "PI 3", batch: "B33", system: "TDC",
    name: "State Reference, Apportionment, Payments, NOL/Credit, Forms & TX Franchise",
    startDate: "2026-09-10", endDate: "2026-09-18", status: "Stretch",
    notes: "Batch 33 TDC. PI 3 Stretch. State reference, apportionment, payments, NOL/credit, forms, TX franchise. Duration: 7 BD.", dependsOn: "B39",
  },
  // ── On Hold ───────────────────────────────────────────────────────────────────
  {
    id: "onhold-b9-tdc", pi: "On Hold", batch: "B9", system: "TDC",
    name: "Rollforward & Prior Year Intelligence",
    startDate: "", endDate: "", status: "On Hold",
    notes: "Batch 9 TDC. On Hold. Absorbed: existing clients via TDC query, legacy via B31. No active dates.", dependsOn: "",
  },
  {
    id: "onhold-b12-pdc", pi: "On Hold", batch: "B12", system: "PDC",
    name: "Engagement Identity, Reference Data & TIM Reconciliation",
    startDate: "", endDate: "", status: "On Hold",
    notes: "Batch 12 PDC. On Hold. Engagement identity, reference data, and TIM reconciliation. No active dates.", dependsOn: "",
  },
  // PI 4 rows removed — active pilot scope is PI 2 and PI 3 only (per governance decision Jun 2026)
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
  "New":       { color: "#1e40af", bg: "#eff6ff", bar: "#3b82f6" },
  "On Hold":   { color: "#78350f", bg: "#fef3c7", bar: "#d97706" },
  "Post-MVP":  { color: "#374151", bg: "#f1f5f9", bar: "#6b7280" },
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
// GOVERNANCE: Critical path is EXPLICITLY defined as the mandated delivery sequence.
//   B5(PDC) → B6(TDC) → B7(TDC) → B8(PDC) → B8(TDC) → B9(PDC) → B9(TDC)
//   → B10(TDC) → B11(TDC) → B14(TDC) → B16(TDC) → B21(TDC)
// This sequence is derived from the calendar dependency rules and platform flow.
// DO NOT manually edit the output — update BASELINE_ROWS to change the path.

interface CpNode {
  id: string;
  batch: string;
  system: string;
  pi: string;
  name: string;
  startDate: string;
  endDate: string;
  status: BatchStatus;
}
interface CpResult {
  criticalIds: Set<string>;
  orderedPath: CpNode[];
  totalDays: number;
}

// The explicit critical path sequence: [batch, system] pairs in delivery order.
// This is the ONLY authoritative definition of the critical path.
const CRITICAL_PATH_SEQUENCE: [string, string][] = [
  ["B5",  "PDC"],
  ["B6",  "TDC"],
  ["B7",  "TDC"],
  ["B8",  "PDC"],
  ["B8",  "TDC"],
  ["B9",  "PDC"],
  ["B9",  "TDC"],
  ["B10", "TDC"],
  ["B11", "TDC"],
  ["B14", "TDC"],
  ["B16", "TDC"],
  ["B21", "TDC"],
];

function computeCriticalPath(rows: BatchRow[]): CpResult {
  const valid = rows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);
  if (valid.length === 0) return { criticalIds: new Set(), orderedPath: [], totalDays: 0 };

  // Match each step in the explicit sequence to a row in the calendar.
  // Use the first matching row (by batch + system). Deduplication is implicit.
  const seen = new Set<string>();
  const orderedPath: CpNode[] = [];

  for (const [batch, system] of CRITICAL_PATH_SEQUENCE) {
    const match = valid.find(r => r.batch === batch && r.system === system);
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      orderedPath.push({
        id: match.id,
        batch: match.batch,
        system: match.system,
        pi: match.pi,
        name: match.name,
        startDate: match.startDate,
        endDate: match.endDate,
        status: match.status,
      });
    }
  }

  const criticalIds = new Set<string>(orderedPath.map(n => n.id));

  // Total calendar span: first start → last end
  const firstStart = parseDate(orderedPath[0]?.startDate);
  const lastEnd    = parseDate(orderedPath[orderedPath.length - 1]?.endDate);
  const totalDays  = firstStart && lastEnd ? daysBetween(firstStart, lastEnd) : 0;

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



// ─── UPLOAD & ANALYZE MODAL ───────────────────────────────────────────────────

type UploadedRow = {
  pi: string;
  status: string;
  batch: string;
  system: string;
  name: string;
  startDate: string;
  endDate: string;
};

type DiffItem = {
  type: "added" | "removed" | "changed" | "unchanged";
  batch: string;
  system: string;
  name: string;
  pi: string;
  changes: { field: string; from: string; to: string }[];
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Normalize date strings from various formats to ISO YYYY-MM-DD
// Handles: "Wed 4/22", "Mon 5/9", "2026-05-12", "Jan 2027", "TBD", "Done"
function normalizeDate(raw: string): string {
  if (!raw || raw === "TBD" || raw === "Done" || raw === "None") return "";
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // "Jan 2027" → first of that month
  const monthYear = raw.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYear) {
    const months: Record<string, string> = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };
    const m = months[monthYear[1].toLowerCase().slice(0,3)];
    return m ? `${monthYear[2]}-${m}-01` : "";
  }
  // "Wed 4/22" or "Mon 5/9" → assume 2026
  const dayMonthDay = raw.match(/^[A-Za-z]+\s+(\d{1,2})\/(\d{1,2})$/);
  if (dayMonthDay) {
    const month = dayMonthDay[1].padStart(2, "0");
    const day   = dayMonthDay[2].padStart(2, "0");
    return `2026-${month}-${day}`;
  }
  // "4/22" or "4/22/2026"
  const slashDate = raw.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (slashDate) {
    const year  = slashDate[3] ? (slashDate[3].length === 2 ? `20${slashDate[3]}` : slashDate[3]) : "2026";
    const month = slashDate[1].padStart(2, "0");
    const day   = slashDate[2].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

// Normalize batch label: "8" → "B8", "2A" → "B2A", "FC" → "FC", "B8" → "B8"
function normalizeBatchLabel(raw: string): string {
  if (!raw) return "";
  const s = raw.trim();
  if (/^[A-Za-z]{2,}$/.test(s)) return s.toUpperCase(); // e.g. "FC"
  if (/^B\d/.test(s)) return s.toUpperCase(); // already has B prefix
  if (/^\d/.test(s)) return `B${s.toUpperCase()}`; // "8" → "B8", "2A" → "B2A"
  return s.toUpperCase();
}

function parseUploadedRows(data: Record<string, string>[]): UploadedRow[] {
  return data.map(row => {
    const keys = Object.keys(row).reduce<Record<string, string>>((acc, k) => {
      acc[normalizeHeader(k)] = String(row[k] ?? "");
      return acc;
    }, {});
    const pi = keys["pi"] || keys["pigroup"] || keys["piname"] || "";
    const status = keys["status"] || keys["deliverystatus"] || "";
    const rawBatch = keys["newbatch"] || keys["batchnew"] || keys["new"] || keys["batch"] || keys["batchnumber"] || keys["batchno"] || "";
    const batch = normalizeBatchLabel(rawBatch);
    // "Feat" column maps to system (PDC/TDC) in the authoritative Excel
    const system = keys["feat"] || keys["platform"] || keys["system"] || keys["pdctdc"] || "";
    const name = keys["name"] || keys["featurename"] || keys["batchname"] || keys["description"] || "";
    const rawStart = keys["start"] || keys["startdate"] || keys["startdt"] || "";
    const rawEnd   = keys["end"]   || keys["enddate"]   || keys["enddt"]   || "";
    const startDate = normalizeDate(rawStart);
    const endDate   = normalizeDate(rawEnd);
    return { pi, status, batch, system, name, startDate, endDate };
  }).filter(r => r.batch || r.name);
}

function computeCalendarDiff(baseline: BatchRow[], uploaded: UploadedRow[]): DiffItem[] {
  const result: DiffItem[] = [];
  const baseMap = new Map<string, BatchRow>();
  baseline.forEach(r => { baseMap.set(`${r.batch}|${r.system}`, r); });
  const uploadMap = new Map<string, UploadedRow>();
  uploaded.forEach(r => { uploadMap.set(`${r.batch}|${r.system}`, r); });

  uploaded.forEach(u => {
    const key = `${u.batch}|${u.system}`;
    const base = baseMap.get(key);
    if (!base) {
      result.push({ type: "added", batch: u.batch, system: u.system, name: u.name, pi: u.pi, changes: [] });
    } else {
      const changes: { field: string; from: string; to: string }[] = [];
      if (u.status && u.status !== base.status) changes.push({ field: "Status", from: base.status, to: u.status });
      if (u.startDate && u.startDate !== base.startDate) changes.push({ field: "Start Date", from: base.startDate || "—", to: u.startDate });
      if (u.endDate && u.endDate !== base.endDate) changes.push({ field: "End Date", from: base.endDate || "—", to: u.endDate });
      if (u.pi && u.pi !== base.pi) changes.push({ field: "PI", from: base.pi, to: u.pi });
      if (u.name && u.name !== base.name) changes.push({ field: "Name", from: base.name, to: u.name });
      result.push({ type: changes.length > 0 ? "changed" : "unchanged", batch: u.batch, system: u.system, name: u.name || base.name, pi: u.pi || base.pi, changes });
    }
  });

  baseline.forEach(b => {
    if (!uploadMap.has(`${b.batch}|${b.system}`)) {
      result.push({ type: "removed", batch: b.batch, system: b.system, name: b.name, pi: b.pi, changes: [] });
    }
  });

  return result;
}

function UploadAnalyzeModal({ baselineRows, onClose }: { baselineRows: BatchRow[]; onClose: () => void }) {
  const [phase, setPhase] = React.useState<"idle" | "parsing" | "done" | "error">("idle");
  const [fileName, setFileName] = React.useState("");
  const [diff, setDiff] = React.useState<DiffItem[]>([]);
  const [errorMsg, setErrorMsg] = React.useState("");
  const [uploadedRows, setUploadedRows] = React.useState<UploadedRow[]>([]);
  const [activeTab, setActiveTab] = React.useState<"summary" | "added" | "removed" | "changed" | "raw">("summary");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handleFile = React.useCallback((file: File) => {
    setFileName(file.name);
    setPhase("parsing");
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rows: Record<string, string>[] = [];

        if (file.name.match(/\.xlsx?$/i)) {
          const wb = XLSX.read(data as ArrayBuffer, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        } else if (file.name.endsWith(".csv") || file.type === "text/csv") {
          const wb = XLSX.read(data as string, { type: "string" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
        } else if (file.type.startsWith("image/")) {
          setErrorMsg("Image files cannot be parsed automatically. Please export your calendar as Excel (.xlsx) or CSV and upload that instead.");
          setPhase("error");
          return;
        } else {
          setErrorMsg("Unsupported file type. Please upload an Excel (.xlsx) or CSV (.csv) file.");
          setPhase("error");
          return;
        }

        const parsed = parseUploadedRows(rows);
        if (parsed.length === 0) {
          setErrorMsg("No batch rows found. Ensure your file has columns: PI, Status, Batch #, Platform, Name, Start, End.");
          setPhase("error");
          return;
        }
        const diffResult = computeCalendarDiff(baselineRows, parsed);
        setUploadedRows(parsed);
        setDiff(diffResult);
        setPhase("done");
        setActiveTab("summary");
      } catch (err) {
        setErrorMsg("Failed to parse file: " + String(err));
        setPhase("error");
      }
    };

    if (file.name.endsWith(".csv") || file.type === "text/csv") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, [baselineRows]);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const added = diff.filter(d => d.type === "added");
  const removed = diff.filter(d => d.type === "removed");
  const changed = diff.filter(d => d.type === "changed");
  const unchanged = diff.filter(d => d.type === "unchanged");

  const copyAnalysis = () => {
    const lines = [
      "DCT PLATFORM \u2014 BATCH CALENDAR UPLOAD ANALYSIS",
      `File: ${fileName}`,
      `Analyzed: ${new Date().toLocaleString()}`,
      "\u2550".repeat(60),
      "",
      "SUMMARY",
      `  Uploaded rows: ${uploadedRows.length}`,
      `  Baseline rows: ${baselineRows.length}`,
      `  Added (new): ${added.length}`,
      `  Removed: ${removed.length}`,
      `  Changed: ${changed.length}`,
      `  Unchanged: ${unchanged.length}`,
      "",
    ];
    if (added.length > 0) {
      lines.push("ADDED BATCHES");
      added.forEach(d => lines.push(`  + ${d.batch} (${d.system}) \u2014 ${d.name} [${d.pi}]`));
      lines.push("");
    }
    if (removed.length > 0) {
      lines.push("REMOVED BATCHES");
      removed.forEach(d => lines.push(`  - ${d.batch} (${d.system}) \u2014 ${d.name} [${d.pi}]`));
      lines.push("");
    }
    if (changed.length > 0) {
      lines.push("CHANGED BATCHES");
      changed.forEach(d => {
        lines.push(`  ~ ${d.batch} (${d.system}) \u2014 ${d.name}`);
        d.changes.forEach(c => lines.push(`      ${c.field}: "${c.from}" \u2192 "${c.to}"`));
      });
    }
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const TABS: { id: "summary" | "added" | "removed" | "changed" | "raw"; label: string; color?: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "added", label: `Added (${added.length})`, color: "#166534" },
    { id: "removed", label: `Removed (${removed.length})`, color: "#991b1b" },
    { id: "changed", label: `Changed (${changed.length})`, color: "#92400e" },
    { id: "raw", label: `All Rows (${uploadedRows.length})` },
  ];

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "860px", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "3px", height: "18px", backgroundColor: "#7c3aed", borderRadius: "2px" }} />
            <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Upload & Analyze Calendar</span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>— compare against current baseline</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px", fontSize: "18px", lineHeight: 1 }}>
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {phase === "idle" && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ border: "2px dashed #c4b5fd", borderRadius: "12px", padding: "48px 24px", textAlign: "center", cursor: "pointer", backgroundColor: "#faf5ff" }}
            >
              <Upload size={32} style={{ color: "#7c3aed", margin: "0 auto 12px", display: "block" }} />
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#4c1d95", margin: "0 0 6px" }}>Drop your calendar file here, or click to browse</p>
              <p style={{ fontSize: "12px", color: "#7c3aed", margin: 0 }}>Accepts Excel (.xlsx), CSV (.csv)</p>
              <p style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px" }}>Expected columns: PI &middot; Status &middot; Batch # &middot; Platform (PDC/TDC) &middot; Name &middot; Start Date &middot; End Date</p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>
          )}

          {phase === "parsing" && (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <div style={{ fontSize: "13px", color: "#7c3aed", fontWeight: 600 }}>Parsing {fileName}&hellip;</div>
            </div>
          )}

          {phase === "error" && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "20px 24px" }}>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#991b1b", margin: "0 0 6px" }}>&nbsp;&#9888; Parse Error</p>
              <p style={{ fontSize: "12px", color: "#7f1d1d", margin: 0 }}>{errorMsg}</p>
              <button onClick={() => { setPhase("idle"); setErrorMsg(""); }} style={{ marginTop: "12px", fontSize: "11px", fontWeight: 600, color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: "6px", padding: "5px 12px", backgroundColor: "white", cursor: "pointer" }}>Try Again</button>
            </div>
          )}

          {phase === "done" && (
            <div>
              {/* File info bar */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px 14px" }}>
                <span style={{ fontSize: "12px", color: "#374151" }}>
                  <strong>{fileName}</strong> &mdash; {uploadedRows.length} rows parsed &middot; compared against {baselineRows.length} baseline rows
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={copyAnalysis} style={{ fontSize: "11px", fontWeight: 600, color: copied ? "#166534" : "#1e40af", border: `1px solid ${copied ? "#bbf7d0" : "#bfdbfe"}`, borderRadius: "6px", padding: "4px 10px", backgroundColor: copied ? "#f0fdf4" : "white", cursor: "pointer" }}>
                    {copied ? "✓ Copied!" : "⬆ Copy Analysis"}
                  </button>
                  <button onClick={() => { setPhase("idle"); setDiff([]); setFileName(""); }} style={{ fontSize: "11px", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "4px 10px", backgroundColor: "white", cursor: "pointer" }}>
                    Upload New File
                  </button>
                </div>
              </div>

              {/* Summary tiles */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
                {[
                  { label: "Added", count: added.length, color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" },
                  { label: "Removed", count: removed.length, color: "#991b1b", bg: "#fef2f2", border: "#fecaca" },
                  { label: "Changed", count: changed.length, color: "#92400e", bg: "#fffbeb", border: "#fde68a" },
                  { label: "Unchanged", count: unchanged.length, color: "#374151", bg: "#f8fafc", border: "#e2e8f0" },
                ].map(t => (
                  <div key={t.label} style={{ backgroundColor: t.bg, border: `1px solid ${t.border}`, borderRadius: "8px", padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: 700, color: t.color }}>{t.count}</div>
                    <div style={{ fontSize: "11px", color: t.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.label}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "14px", borderBottom: "1px solid #e2e8f0" }}>
                {TABS.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ fontSize: "11px", fontWeight: activeTab === tab.id ? 700 : 500, color: activeTab === tab.id ? (tab.color || "#1e40af") : "#64748b", border: "none", background: "none", cursor: "pointer", padding: "6px 12px", borderBottom: activeTab === tab.id ? `2px solid ${tab.color || "#1e40af"}` : "2px solid transparent" }}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Summary */}
              {activeTab === "summary" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {added.length === 0 && removed.length === 0 && changed.length === 0 && (
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px 16px", fontSize: "13px", color: "#166534", fontWeight: 600 }}>
                      &#10003; No differences found &mdash; uploaded calendar matches the current baseline exactly.
                    </div>
                  )}
                  {added.length > 0 && (
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "6px" }}>&#10010; {added.length} New Batch{added.length > 1 ? "es" : ""} in Uploaded File</div>
                      {added.map((d, i) => <div key={i} style={{ fontSize: "11px", color: "#14532d", padding: "2px 0" }}>{d.batch} ({d.system}) &mdash; {d.name} [{d.pi}]</div>)}
                    </div>
                  )}
                  {removed.length > 0 && (
                    <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>&#10006; {removed.length} Batch{removed.length > 1 ? "es" : ""} in Baseline Not Found in Upload</div>
                      {removed.map((d, i) => <div key={i} style={{ fontSize: "11px", color: "#7f1d1d", padding: "2px 0" }}>{d.batch} ({d.system}) &mdash; {d.name} [{d.pi}]</div>)}
                    </div>
                  )}
                  {changed.length > 0 && (
                    <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>~ {changed.length} Batch{changed.length > 1 ? "es" : ""} with Changes</div>
                      {changed.map((d, i) => (
                        <div key={i} style={{ fontSize: "11px", color: "#78350f", padding: "3px 0", borderBottom: i < changed.length - 1 ? "1px solid #fde68a" : "none" }}>
                          <strong>{d.batch} ({d.system})</strong> &mdash; {d.name}
                          {d.changes.map((c, j) => (
                            <span key={j} style={{ marginLeft: "8px", color: "#92400e" }}>
                              {c.field}: <span style={{ textDecoration: "line-through", color: "#b45309" }}>{c.from}</span> &rarr; <strong>{c.to}</strong>
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Added */}
              {activeTab === "added" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {added.length === 0 ? <p style={{ fontSize: "12px", color: "#94a3b8" }}>No new batches found.</p> :
                    added.map((d, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "8px 12px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", minWidth: "80px" }}>&#10010; {d.batch}</span>
                        <span style={{ fontSize: "11px", color: "#374151", minWidth: "50px" }}>{d.system}</span>
                        <span style={{ fontSize: "11px", color: "#374151", flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{d.pi}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Tab: Removed */}
              {activeTab === "removed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {removed.length === 0 ? <p style={{ fontSize: "12px", color: "#94a3b8" }}>No removed batches.</p> :
                    removed.map((d, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "8px 12px", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", minWidth: "80px" }}>&#10006; {d.batch}</span>
                        <span style={{ fontSize: "11px", color: "#374151", minWidth: "50px" }}>{d.system}</span>
                        <span style={{ fontSize: "11px", color: "#374151", flex: 1 }}>{d.name}</span>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>{d.pi}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Tab: Changed */}
              {activeTab === "changed" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {changed.length === 0 ? <p style={{ fontSize: "12px", color: "#94a3b8" }}>No changed batches.</p> :
                    changed.map((d, i) => (
                      <div key={i} style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px" }}>
                        <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>~ {d.batch} ({d.system}) &mdash; {d.name}</div>
                        {d.changes.map((c, j) => (
                          <div key={j} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#78350f", padding: "2px 0" }}>
                            <span style={{ minWidth: "90px", fontWeight: 600 }}>{c.field}:</span>
                            <span style={{ textDecoration: "line-through", color: "#b45309" }}>{c.from}</span>
                            <span>&rarr;</span>
                            <strong>{c.to}</strong>
                          </div>
                        ))}
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Tab: Raw */}
              {activeTab === "raw" && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f1f5f9" }}>
                        {["PI", "Status", "Batch", "Platform", "Name", "Start", "End"].map(h => (
                          <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {uploadedRows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "5px 10px", color: "#374151" }}>{r.pi}</td>
                          <td style={{ padding: "5px 10px", color: "#374151" }}>{r.status}</td>
                          <td style={{ padding: "5px 10px", fontWeight: 600, color: "#1e40af" }}>{r.batch}</td>
                          <td style={{ padding: "5px 10px", color: "#374151" }}>{r.system}</td>
                          <td style={{ padding: "5px 10px", color: "#374151", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</td>
                          <td style={{ padding: "5px 10px", color: "#374151", whiteSpace: "nowrap" }}>{r.startDate}</td>
                          <td style={{ padding: "5px 10px", color: "#374151", whiteSpace: "nowrap" }}>{r.endDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Batch key → calendar row ID prefix mapping ─────────────────────────────
// Maps the numeric/FC batch key from BatchStatusContext to the batch label
// used in BASELINE_ROWS (e.g. "2" → "B2", "foundation-core" → "FC").
function batchKeyToLabel(key: string): string {
  if (key === "foundation-core") return "FC";
  return `B${key}`;
}

export default function BatchDeliveryCalendar() {
  const { statuses, lastUpdated, piCompletion } = useBatchStatus();
  const [rows, setRows] = useState<BatchRow[]>(() => BASELINE_ROWS.map(r => ({ ...r })));

  // Sync row statuses from the shared context whenever statuses change
  useEffect(() => {
    setRows(prev => prev.map(r => {
      // Find the matching context key for this row's batch label
      const ctxKey = Object.keys(statuses).find(k => batchKeyToLabel(k) === r.batch);
      if (!ctxKey) return r;
      const ctxStatus = contextToCalendarStatus(statuses[ctxKey as keyof typeof statuses]);
      if (ctxStatus === r.status) return r; // no change
      return { ...r, status: ctxStatus };
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<BatchRow | null>(null);
  const [showDeps, setShowDeps] = useState(true);
  const [showCP, setShowCP] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [showRiskDetail, setShowRiskDetail] = useState(false);
  const riskDetailRef = useRef<HTMLDivElement>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [shiftOffer, setShiftOffer] = useState<{ batchId: string; delta: number; affected: string[] } | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [piFilter, setPiFilter] = useState<string>("All"); // "All" | "PI 1" | "PI 2" | "PI 3" | "PI 4"
  const [showExec, setShowExec] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [copiedExec, setCopiedExec] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [poEmail, setPoEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);



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

  // ── Shared HTML builder (used by Print and Email to PO) ─────────────────────
  const buildGanttHtml = useCallback((forEmail = false) => {
    const piLabel = piFilter === "All" ? "All PIs" : piFilter;
    const rows = piFilter === "All" ? validatedRows : validatedRows.filter(r => r.pi === piFilter);

    // Status colors (background, text, border)
    const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
      "Done":      { bg: "#f0fdf4", color: "#166534", border: "#16a34a", label: "✓ Done" },
      "Committed": { bg: "#eff6ff", color: "#1e40af", border: "#2563eb", label: "Committed" },
      "Stretch":   { bg: "#fffbeb", color: "#92400e", border: "#ea580c", label: "Stretch" },
      "MVP":       { bg: "#faf5ff", color: "#6b21a8", border: "#7c3aed", label: "MVP" },
    };
    const SYS_COLOR: Record<string, string> = {
      PDC: "#2563eb", TDC: "#059669", Orchestrator: "#7c3aed", Roger: "#0ea5e9", Platform: "#94a3b8",
    };
    const PI_COLOR: Record<string, string> = {
      "PI 1": "#1e3a5f", "PI 2": "#1e40af", "PI 3": "#166534", "PI 4": "#7c2d12",
    };
    const PI_THEME: Record<string, string> = {
      "PI 1": "Foundation & AI Mapping",
      "PI 2": "Entity, Workflow & Tax Ready",
      "PI 3": "Intelligence, Provision & Audit",
      "PI 4": "Governance, QC & Analytics",
    };

    // Build critical path set
    const cpBatches: Set<string> = criticalPath;

    // Count by status
    const doneCnt = rows.filter(r => r.status === "Done").length;
    const committedCnt = rows.filter(r => r.status === "Committed").length;
    const stretchCnt = rows.filter(r => r.status === "Stretch").length;
    const mvpCnt = rows.filter(r => r.status === "MVP").length;

    // Group by PI
    const piOrder = ["PI 1", "PI 2", "PI 3", "PI 4"];
    const grouped: { pi: string; rows: typeof rows }[] = [];
    for (const pi of piOrder) {
      const piRows = rows.filter(r => r.pi === pi);
      if (piRows.length > 0) grouped.push({ pi, rows: piRows });
    }

    // Build batch rows HTML — Outlook-safe: no position:absolute, all inline styles
    let batchRowsHtml = "";
    for (const group of grouped) {
      const piColor = PI_COLOR[group.pi] || "#1e3a5f";
      const piTheme = PI_THEME[group.pi] || "";
      // PI header row
      batchRowsHtml += `
        <tr>
          <td colspan="6" style="background-color:${piColor};color:#ffffff;font-size:11px;font-weight:700;
            padding:7px 12px;letter-spacing:0.07em;text-transform:uppercase;border-bottom:2px solid #ffffff;">
            ${group.pi} &rarr; ${piTheme}
          </td>
        </tr>`;
      for (const r of group.rows) {
        const ss = STATUS_STYLE[r.status] || { bg: "#f8fafc", color: "#374151", border: "#94a3b8", label: r.status };
        const sysColor = SYS_COLOR[r.system] || "#94a3b8";
        const isCP = cpBatches.has(r.batch);
        const startFmt = r.startDate || "TBD";
        const endFmt = r.endDate || "TBD";
        batchRowsHtml += `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:7px 10px;border-left:4px solid ${ss.border};background-color:${ss.bg};
            font-size:11px;font-weight:700;color:#1e3a5f;white-space:nowrap;min-width:60px;">
            ${r.batch}${isCP ? " &#9733;" : ""}
          </td>
          <td style="padding:7px 10px;background-color:#ffffff;font-size:10px;font-weight:700;
            color:${sysColor};white-space:nowrap;min-width:55px;">
            ${r.system}
          </td>
          <td style="padding:7px 10px;background-color:${ss.bg};font-size:10px;font-weight:700;
            color:${ss.color};white-space:nowrap;min-width:80px;">
            ${ss.label}
          </td>
          <td style="padding:7px 10px;background-color:#ffffff;font-size:11px;color:#374151;
            min-width:200px;max-width:280px;">
            ${r.name}
          </td>
          <td style="padding:7px 10px;background-color:#f8fafc;font-size:10px;color:#64748b;
            white-space:nowrap;min-width:70px;">
            ${startFmt}
          </td>
          <td style="padding:7px 10px;background-color:#f8fafc;font-size:10px;color:#64748b;
            white-space:nowrap;min-width:70px;">
            ${endFmt}
          </td>
        </tr>`;
      }
    }

    const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>DCT Batch Delivery Calendar &mdash; ${piLabel}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body { margin:0; padding:0; background:#f1f5f9; font-family:Calibri,Arial,sans-serif; }
    @media print { .no-print { display:none !important; } body { background:white; } }
  </style>
</head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:Calibri,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:800px;margin:0 auto;">
  <tr>
    <td>

      <!-- Header -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#1e3a5f;border-radius:8px 8px 0 0;margin-bottom:0;">
        <tr>
          <td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                    RS<span style="color:#60a5fa;">M</span>
                  </span>
                  &nbsp;&nbsp;
                  <span style="font-size:15px;font-weight:700;color:#ffffff;">DCT Batch Delivery Calendar</span>
                  <br/>
                  <span style="font-size:10px;color:#93c5fd;">
                    CATT &middot; Data Consolidation Team &nbsp;|&nbsp; Filter: ${piLabel}
                    &nbsp;|&nbsp; ${rows.length} batches
                    &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </td>
                <td align="right" class="no-print">
                  <button onclick="window.print()" style="font-size:11px;padding:7px 14px;
                    background:#2563eb;color:white;border:none;border-radius:6px;cursor:pointer;
                    font-weight:600;">&#128424; Print / Save as PDF</button>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Summary Tiles -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#ffffff;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;
          margin-bottom:0;">
        <tr>
          <td width="25%" align="center" style="padding:14px 8px;border-right:1px solid #e2e8f0;
            border-bottom:3px solid #16a34a;">
            <div style="font-size:26px;font-weight:800;color:#166534;line-height:1;">${doneCnt}</div>
            <div style="font-size:10px;font-weight:700;color:#166534;text-transform:uppercase;
              letter-spacing:0.08em;margin-top:3px;">Done</div>
          </td>
          <td width="25%" align="center" style="padding:14px 8px;border-right:1px solid #e2e8f0;
            border-bottom:3px solid #2563eb;">
            <div style="font-size:26px;font-weight:800;color:#1e40af;line-height:1;">${committedCnt}</div>
            <div style="font-size:10px;font-weight:700;color:#1e40af;text-transform:uppercase;
              letter-spacing:0.08em;margin-top:3px;">Committed</div>
          </td>
          <td width="25%" align="center" style="padding:14px 8px;border-right:1px solid #e2e8f0;
            border-bottom:3px solid #ea580c;">
            <div style="font-size:26px;font-weight:800;color:#92400e;line-height:1;">${stretchCnt}</div>
            <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;
              letter-spacing:0.08em;margin-top:3px;">Stretch</div>
          </td>
          <td width="25%" align="center" style="padding:14px 8px;
            border-bottom:3px solid #7c3aed;">
            <div style="font-size:26px;font-weight:800;color:#6b21a8;line-height:1;">${mvpCnt}</div>
            <div style="font-size:10px;font-weight:700;color:#6b21a8;text-transform:uppercase;
              letter-spacing:0.08em;margin-top:3px;">MVP</div>
          </td>
        </tr>
      </table>

      <!-- Section label -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;margin-bottom:0;">
        <tr>
          <td style="padding:8px 12px;">
            <span style="font-size:10px;font-weight:700;color:#374151;text-transform:uppercase;
              letter-spacing:0.07em;">Batch Status by PI</span>
            &nbsp;&nbsp;
            <span style="font-size:10px;color:#94a3b8;">
              &#9733; = On Critical Path &nbsp;&middot;&nbsp;
              Left border color = Status &nbsp;&middot;&nbsp;
              PDC = <span style="color:#2563eb;font-weight:700;">Blue</span> &nbsp;
              TDC = <span style="color:#059669;font-weight:700;">Green</span>
            </span>
          </td>
        </tr>
      </table>

      <!-- Batch Table -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="border-collapse:collapse;border:1px solid #e2e8f0;border-top:none;
          border-radius:0 0 8px 8px;overflow:hidden;margin-bottom:16px;">
        <!-- Column headers -->
        <tr style="background-color:#1e3a5f;">
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            white-space:nowrap;min-width:60px;">Batch</td>
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            white-space:nowrap;min-width:55px;">Platform</td>
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            white-space:nowrap;min-width:80px;">Status</td>
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            min-width:200px;">Feature Name</td>
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            white-space:nowrap;min-width:70px;">Start</td>
          <td style="padding:7px 10px;font-size:10px;font-weight:700;color:#ffffff;
            white-space:nowrap;min-width:70px;">End</td>
        </tr>
        ${batchRowsHtml}
      </table>

      <!-- Footer -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center" style="padding:10px;font-size:10px;color:#94a3b8;">
            DCT Platform Gate Verification Dashboard &middot; RSM CATT &middot;
            Planning view only &mdash; not source of truth &middot; Auto-generated &middot; Read-only
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>
</body>
</html>`;

    return html;
  }, [validatedRows, piFilter, criticalPath]);

  // ── Print-optimized Gantt export ─────────────────────────────────────────────
  const printGantt = useCallback(() => {
    const html = buildGanttHtml(false);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  }, [buildGanttHtml]);

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

  // ── Export Excel ─────────────────────────────────────────────────────────────

  const exportExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Batch Calendar ──
    const wsData: (string | number)[][] = [
      ["DCT Batch Delivery Calendar — PLANNING VIEW ONLY — NOT SOURCE OF TRUTH"],
      [`Generated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`],
      [],
      ["PI", "Batch", "System", "Feature Name", "Start Date", "End Date", "Status", "Depends On", "Notes"],
      ...validatedRows.map(r => [r.pi, r.batch, r.system, r.name, r.startDate, r.endDate, r.status, r.dependsOn, r.notes]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [{ wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 50 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, ws, "Batch Calendar");

    // ── Sheet 2: Status Summary ──
    const statusCounts: Record<string, number> = {};
    for (const r of validatedRows) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    const summaryData: (string | number)[][] = [
      ["DCT Batch Delivery Calendar — Status Summary"],
      [],
      ["Status", "Count"],
      ...Object.entries(statusCounts).map(([s, c]) => [s, c]),
      [],
      ["Total Batches", validatedRows.length],
      ["Risk Flags", summary.risks.length],
      ["PIs Covered", summary.piGroups.size],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
    ws2["!cols"] = [{ wch: 20 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");

    XLSX.writeFile(wb, `DCT-Batch-Calendar-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [validatedRows, summary]);

  // ── Legacy CSV export (kept for compatibility) ────────────────────────────────
  const exportCSV = useCallback(() => {
    const header = "PI,Batch,System,Name,Start Date,End Date,Status,Depends On,Notes";
    const lines = validatedRows.map(r =>
      [r.pi, r.batch, r.system, `"${r.name}"`, r.startDate, r.endDate, r.status, `"${r.dependsOn}"`, `"${r.notes}"`].join(",")
    );
    const blob = new Blob([`PLANNING VIEW ONLY — NOT SOURCE OF TRUTH\n${header}\n${lines.join("\n")}`], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `dct-batch-calendar.csv`; a.click();
  }, [validatedRows]);

  // ── Email to PO ───────────────────────────────────────────────────────────────
  const buildEmailBody = useCallback(() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const scopedRows = piFilter === "All" ? validatedRows : validatedRows.filter(r => r.pi === piFilter);

    // Status counts — only count statuses that actually appear
    const STATUS_ORDER = ["Done", "Committed", "MVP", "Stretch", "New", "On Hold", "Post-MVP"];
    const statusCounts: Record<string, number> = {};
    for (const r of scopedRows) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
    const statusSummary = STATUS_ORDER
      .filter(s => statusCounts[s] > 0)
      .map(s => `  ${s}: ${statusCounts[s]}`)
      .join("\n");

    // Risk flags — only flag active/planned batches with real issues (not Done)
    const realRisks = scopedRows.filter(r =>
      r.status !== "Done" && (r._dateError || r._depConflict)
    );
    const stretchItems = scopedRows.filter(r => r.status === "Stretch");
    const riskLines = realRisks.length > 0
      ? realRisks.slice(0, 8).map(r =>
          `  ${r.batch} (${r.system}) — ${r.status}${r._dateError ? " [Date Error]" : ""}${r._depConflict ? " [Dep Conflict]" : ""}`
        ).join("\n")
      : "  No blocking risk flags identified.";

    const piLabel = piFilter === "All" ? "All PIs" : piFilter;
    const piList = Array.from(new Set(scopedRows.map(r => r.pi))).sort().join(", ");

    // Batch table — grouped by PI
    const piGroups: Record<string, typeof scopedRows> = {};
    for (const r of scopedRows) {
      if (!piGroups[r.pi]) piGroups[r.pi] = [];
      piGroups[r.pi].push(r);
    }
    const batchTableLines: string[] = [];
    for (const pi of Object.keys(piGroups).sort()) {
      batchTableLines.push(`\n${pi}`);
      batchTableLines.push(`${"-".repeat(60)}`);
      batchTableLines.push(`  Batch   System   Status        Start        End          Feature`);
      for (const r of piGroups[pi]) {
        const batch = r.batch.padEnd(8);
        const sys   = r.system.padEnd(8);
        const stat  = r.status.padEnd(13);
        const start = (r.startDate || "TBD").padEnd(12);
        const end   = (r.endDate   || "TBD").padEnd(12);
        batchTableLines.push(`  ${batch} ${sys} ${stat} ${start} ${end} ${r.name}`);
      }
    }
    const batchTable = batchTableLines.join("\n");

    return `Hi,

Please find below the current DCT Batch Delivery Calendar summary as of ${today}.
Filter: ${piLabel} | Total Batches: ${scopedRows.length}

This is a planning view only and does not represent the system of record.

${"-".repeat(60)}
STATUS SUMMARY
${"-".repeat(60)}
${statusSummary}

${"-".repeat(60)}
RISK FLAGS — Active Batches Only (${realRisks.length} blocking, ${stretchItems.length} stretch)
${"-".repeat(60)}
${riskLines}
${stretchItems.length > 0 ? `\n  Stretch goals (${stretchItems.length}): ${stretchItems.map(r => r.batch).join(", ")}` : ""}

${"-".repeat(60)}
BATCH DELIVERY SCHEDULE
${"-".repeat(60)}
${batchTable}

${"-".repeat(60)}
NOTES
${"-".repeat(60)}
- The full batch calendar export (Excel) is available from the DCT Platform Gate Verification Dashboard.
- This summary was generated from the Batch Delivery Calendar planning view.
- For questions, contact the CATT Sr. Business Analyst.

Thank you,
CATT Sr. Business Analyst — DCT Platform Delivery`;
  }, [validatedRows, summary, piFilter]);

  const openEmailClient = useCallback((toAddress: string) => {
    // 1. Open mailto: so the user's email client launches with subject pre-filled
    const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const subject = encodeURIComponent(`DCT Batch Delivery Calendar — Status Update ${dateStr}`);
    const bodyText = encodeURIComponent(
      `Hi,\n\nPlease find the DCT Batch Delivery Calendar summary attached.\n\nGenerated: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\nThis is a planning view only and does not represent the system of record.\n\nThank you,\nCATT Sr. Business Analyst — DCT Platform Delivery`
    );
    window.location.href = `mailto:${encodeURIComponent(toAddress)}?subject=${subject}&body=${bodyText}`;
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  }, []);

  const openCopyView = useCallback(() => {
    // Open the styled HTML view in a new window — user can copy-paste into email or print to PDF
    const html = buildGanttHtml(true);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); }
  }, [buildGanttHtml]);

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

            <button onClick={exportExcel} style={{
              fontSize: "11px", fontWeight: 600, color: "#166534",
              border: "1px solid #bbf7d0", borderRadius: "7px",
              padding: "6px 10px", backgroundColor: "#f0fdf4", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <FileSpreadsheet size={12} /> Export Excel
            </button>
            <button onClick={() => setShowEmailModal(true)} style={{
              fontSize: "11px", fontWeight: 600, color: "#1e40af",
              border: "1px solid #bfdbfe", borderRadius: "7px",
              padding: "6px 10px", backgroundColor: "#eff6ff", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "5px",
            }}>
              <Mail size={12} /> Email to PO
            </button>
            <button
              id="copy-page-btn"
              onClick={printGantt}
              style={{
                fontSize: "11px", fontWeight: 600, color: "#1e40af",
                border: "1px solid #bfdbfe", borderRadius: "7px",
                padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.2s",
              }}
            >
              <Copy size={12} /> Copy View
            </button>
            <button
              onClick={() => setShowUpload(true)}
              style={{
                fontSize: "11px", fontWeight: 600, color: "#7c3aed",
                border: "1px solid #e9d5ff", borderRadius: "7px",
                padding: "6px 10px", backgroundColor: "white", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.2s",
              }}
            >
              <Upload size={12} /> Upload & Analyze
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

        {/* ── SUMMARY TILES (4 KPI cards) ─────────────────────────────────────── */}
        {/* KPI counts derived from BATCH_CALENDAR_PI23 (PI 2 + PI 3 only, PI 4 excluded) */}
        {(() => {
          // Use BASELINE_ROWS scoped to PI 2 only for the PI 2 Complete card
          const pi2BaseRows = BASELINE_ROWS.filter(r => r.pi === "PI 2");
          const pi2Done = pi2BaseRows.filter(r => r.status === "Done").length;
          const pi2Total = pi2BaseRows.length;
          const pi2Pct = pi2Total > 0 ? Math.round((pi2Done / pi2Total) * 100) : 0;
          const cpCount = summary.cpOrdered.length;
          const parallelTracks = (() => {
            // Count rows that overlap in time with at least one other row
            const valid2 = validatedRows.filter(r => parseDate(r.startDate) && parseDate(r.endDate));
            let maxOverlap = 1;
            for (const r of valid2) {
              const rs = parseDate(r.startDate)!.getTime();
              const re = parseDate(r.endDate)!.getTime();
              const overlapping = valid2.filter(x => {
                if (x.id === r.id) return false;
                const xs = parseDate(x.startDate)!.getTime();
                const xe = parseDate(x.endDate)!.getTime();
                return xs < re && xe > rs;
              }).length + 1;
              if (overlapping > maxOverlap) maxOverlap = overlapping;
            }
            return maxOverlap;
          })();
          const riskLevel = riskCount === 0 ? "Green" : riskCount <= 2 ? "Yellow" : "Red";
          const riskColor = riskLevel === "Green" ? "#059669" : riskLevel === "Yellow" ? "#d97706" : "#dc2626";
          const tiles = [
            {
              label: "PI 2 Complete",
              value: `${pi2Pct}%`,
              sub: `${pi2Done} of ${pi2Total} batches done`,
              accent: "#059669",
            },
            {
              label: "Critical Path",
              value: `${cpCount} batches`,
              sub: cpStart && cpEnd ? `${formatShort(cpStart)} → ${formatShort(cpEnd)} · ${summary.cpTotalDays}d` : "Toggle Critical Path ON",
              accent: "#1e40af",
              tooltip: "Critical Path: Determines earliest possible delivery of Return Assembly and downstream tax workflows",
            },
            {
              label: "Parallel Tracks",
              value: `${parallelTracks} active`,
              sub: `${summary.piGroups.size} PIs · ${validatedRows.length} batches total`,
              accent: "#7c3aed",
            },
            {
              label: "Risk Indicator",
              value: riskLevel,
              sub: riskCount > 0 ? `${riskCount} risk${riskCount > 1 ? "s" : ""} — click to view` : "No conflicts detected",
              accent: riskColor,
              onClick: riskCount > 0 ? () => {
                setShowRiskDetail(v => {
                  const next = !v;
                  if (next) {
                    setTimeout(() => {
                      riskDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }
                  return next;
                });
              } : undefined,
            },
          ];
          return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
              {tiles.map((card, i) => (
                <div
                  key={i}
                  onClick={card.onClick}
                  title={card.tooltip}
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderTop: `3px solid ${card.accent}`,
                    borderRadius: "10px",
                    padding: "16px 18px",
                    cursor: card.onClick ? "pointer" : "default",
                    transition: "box-shadow 0.15s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; }}
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
          );
        })()}

        {/* ── RISK DETAIL INLINE (appears below summary tiles) ─────────────── */}
        {showRiskDetail && summary.risks.length > 0 && (
          <div
            ref={riskDetailRef}
            style={{
              backgroundColor: "#fffbeb", border: "2px solid #fde68a",
              borderRadius: "10px", padding: "16px 20px", marginBottom: "20px",
              scrollMarginTop: "80px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
                ⚠ {summary.risks.length} risk{summary.risks.length > 1 ? "s" : ""} identified
              </div>
              <button
                onClick={() => setShowRiskDetail(false)}
                style={{ fontSize: "11px", color: "#92400e", background: "none", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fde68a" }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {summary.risks.map(r => (
                <div key={r.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "10px",
                  backgroundColor: "white", border: "1px solid #fde68a",
                  borderRadius: "6px", padding: "8px 12px",
                }}>
                  <div style={{ minWidth: "80px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", backgroundColor: "#dbeafe", padding: "2px 6px", borderRadius: "4px" }}>
                      {r.batch}
                    </span>
                    <div style={{ fontSize: "10px", color: "#64748b", marginTop: "3px" }}>{r.system} · {r.pi}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f172a", marginBottom: "2px" }}>{r.name}</div>
                    <div style={{ fontSize: "11px", color: "#78350f" }}>
                      {r._dateError && "⚠ End date is before start date"}
                      {r._depConflict && !r._dateError && "⚠ Starts before a dependency completes"}
                      {r.status === "Stretch" && !r._dateError && !r._depConflict && "Stretch Goal — opportunistic, non-blocking"}
                    </div>
                    {r.notes && <div style={{ fontSize: "11px", color: "#a16207", marginTop: "2px" }}>{r.notes}</div>}
                  </div>
                  <div style={{ minWidth: "90px", textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{r.startDate}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{r.endDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── DELIVERY HEADLINES, COUNTS & FOOTNOTES ────────────────────────── */}
        <div style={{
          backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px",
          padding: "20px 24px", marginBottom: "24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <div style={{ width: "3px", height: "16px", backgroundColor: "#1e40af", borderRadius: "2px" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Delivery Headlines &amp; Counts
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Headlines */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", borderBottom: "1px solid #dbeafe", paddingBottom: "4px" }}>
                Key Milestones
              </div>
              {[
                { label: "Provision delivered (B19)", date: "Mon 8/3" },
                { label: "Advisory delivered (B25 TDC)", date: "Fri 8/21" },
                { label: "MVP-required complete (B16 TDC close)", date: "Fri 9/11 — 3 BD before 9/21" },
                { label: "Program last close", date: "Tue 9/22" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "12px", color: "#374151" }}>{h.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", whiteSpace: "nowrap", marginLeft: "12px" }}>{h.date}</span>
                </div>
              ))}
            </div>
            {/* Counts */}
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px", borderBottom: "1px solid #dbeafe", paddingBottom: "4px" }}>
                Status Counts
              </div>
              {[
                { status: "Done", count: "10", detail: "B4, B5, B6, B2A, B7, B8 PDC, B8 TDC, B9 PDC, B10, B43", color: "#059669", bg: "#dcfce7" },
                { status: "In Progress", count: "3", detail: "B9 Gateway, B11 TDC, B42 TDC — active this week", color: "#1e40af", bg: "#dbeafe" },
                { status: "MVP", count: "11", detail: "PI 3 planned scope — B16, B31 PDC, B28, B9a, B39, B20, B29, B21, B17, B26, B31 TDC", color: "#7c3aed", bg: "#ede9fe" },
                { status: "Stretch", count: "2", detail: "B16 PDC (PI 2), B33 TDC (PI 3) — opportunistic, non-blocking", color: "#ea580c", bg: "#ffedd5" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "5px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: c.color, backgroundColor: c.bg, padding: "2px 8px", borderRadius: "4px", minWidth: "72px", textAlign: "center" }}>{c.status}</span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", minWidth: "20px" }}>{c.count}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>{c.detail}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Footnotes */}
          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Footnotes</div>
            <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <li style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                Stretch ladder executes in order. Batch 16 PDC committed; Batches 24 PDC and 25 PDC opportunistic.
              </li>
              <li style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>
                Batches 16, 21, 24, 25 each have PDC and TDC Features executing in different PIs — see Batch ALL roster for full Epic structure.
              </li>
            </ul>
          </div>
        </div>
        {/* ── PO EXECUTIVE SUMMARY ─────────────────────────────────────────────── */}
        {(() => {
          const pi2InFlight = validatedRows.filter(r => r.pi === "PI 2" && r.status === "Committed").map(r => r.batch);
          const uniqueInFlight = pi2InFlight.filter((v, i, a) => a.indexOf(v) === i).join(", ");
          return (
            <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "24px", overflow: "hidden" }}>
              <div
                onClick={() => setShowExec(v => !v)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setShowExec(v => !v); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: showExec ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "3px", height: "16px", backgroundColor: "#1e40af", borderRadius: "2px" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    PO Executive Summary
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>— PI 2–4 delivery status · auto-generated</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      const pi2InFlight2 = validatedRows.filter(r => r.pi === "PI 2" && r.status === "Committed").map(r => r.batch).filter((v, i, a) => a.indexOf(v) === i).join(", ");
                      const pi2Done2 = validatedRows.filter(r => r.pi === "PI 2" && r.status === "Done").length;
                      const pi2Total2 = validatedRows.filter(r => r.pi === "PI 2").length;
                      const pi3Mvp = validatedRows.filter(r => r.pi === "PI 3" && r.status === "MVP").map(r => r.batch).filter((v, i, a) => a.indexOf(v) === i).join(", ");
                      const pi4Committed = validatedRows.filter(r => r.pi === "PI 4" && r.status === "Committed").map(r => r.batch).filter((v, i, a) => a.indexOf(v) === i).join(", ");
                      const cpBatches = summary.cpOrdered.map(n => `${n.batch} (${n.system})`).join(" → ");
                      const text = [
                        "DCT PLATFORM — PO EXECUTIVE SUMMARY",
                        "Generated: " + new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
                        "Source: Batch Delivery Calendar (auto-generated)",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "1. CURRENT STATE — PI 2",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        `✓ Completed: Batch 4 (TDC) — AI Mapping Proposals & Decisions. ${pi2Done2} of ${pi2Total2} PI 2 batches done.`,
                        `⚡ Actively In Flight: ${pi2InFlight2 || "B5, B6, B2A, B7, B8, B9"} — running concurrently across PDC and TDC tracks.`,
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "2. CRITICAL PATH INSIGHT",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        `True critical path: ${cpBatches || "B5 → B6 → B7 → B8 → B9 → B10 → B11"}`,
                        "This chain determines the earliest possible delivery of Return Assembly (B10), which gates all PI 3 MVP work.",
                        "⚠ B2A Risk: Batch 2A (Apr 29–May 4) is a required predecessor for B7 and B8. Any delay cascades to the B8→B9 chain.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "3. DELIVERY OUTLOOK",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "Earliest realistic B10 completion: Jun 11, 2026 (assuming no slippage in B8/B9 chain).",
                        "PI 2 scope achievability: Committed batches (B5–B11) are achievable if B2A closes on time.",
                        "Stretch batches (B16 PDC, B24 PDC, B25 PDC) are isolated and non-blocking.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "4. RISKS",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "⚠ Dependency compression: B2A (Apr 29–May 4) feeds B7 (May 1 start). 3-day overlap window.",
                        "⚠ PDC/TDC misalignment: B8 PDC ends May 13; B8 TDC starts May 12. One-day overlap is fragile.",
                        "⚠ Late-start B2A risk: B2A starts Apr 29 — 7 days after B5/B6. B5 slip cascades to B7 and B8.",
                        "⚠ Exception + Prior Year overlap: B8 TDC (May 12–20) and B9 PDC (May 14–26) share engineering bandwidth.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "5. OPPORTUNITIES",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "✓ Parallelization active: B5 (PDC) ∥ B6 (TDC) Apr 22–30. Healthy parallel execution.",
                        "✓ Stretch work isolated: B16/B24/B25 PDC are non-blocking and will not affect committed delivery.",
                        "✓ Strong PI 3 sequencing: B11 (Jun 12–22) cleanly gates PI 3 entry. B14 TDC starts Jun 23.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "6. PI 3 — MVP READINESS",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        `MVP batches in scope: ${pi3Mvp || "B14, B15, B18, B19, B24, B25, B17, B16"} (TDC track, Jun–Sep 2026).`,
                        "Entry gate: B11 TDC (Learning Governance) must close Jun 22 before PI 3 MVP work begins.",
                        "PI 3 carries no inherited risk from PI 2 stretch batches — B16/B24/B25 PDC are isolated.",
                        "Tightest handoff: B9 TDC → B10 TDC (Jun 2 → Jun 3). Zero buffer. Flag as watch item.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "7. PI 4 — COMMITTED SCOPE",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        `Committed batches (3): ${pi4Committed || "B21 TDC — Quality Control Review Records (Sep 14–22) | B22 TDC — Client Communication & Outstanding Items (Sep 23–Oct 1) | B23 TDC — Benchmark & Peer Analytics (Oct 5–14)"}.`,
                        "PI 4 entry gate: B16 TDC (Audit Trail & Lineage Governance) must close Sep 11 before PI 4 begins. B21 TDC starts Sep 14 — 3-day buffer.",
                        "PI 4 runs Sep 14 – Oct 14, 2026. B21 → B22 → B23 TDC in sequence. Committed-only — no stretch or MVP in PI 4.",
                        "Sequential chain with 1-day buffers between batches. Clean close-out pattern. Platform delivery complete Oct 14.",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
                        "END OF SUMMARY",
                      ].join("\n");
                      navigator.clipboard.writeText(text).then(() => {
                        setCopiedExec(true);
                        setTimeout(() => setCopiedExec(false), 2500);
                      }).catch(() => {
                        // Fallback: try execCommand
                        const ta = document.createElement("textarea");
                        ta.value = text;
                        ta.style.position = "fixed";
                        ta.style.opacity = "0";
                        document.body.appendChild(ta);
                        ta.focus();
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                        setCopiedExec(true);
                        setTimeout(() => setCopiedExec(false), 2500);
                      });
                    }}
                    style={{
                      fontSize: "11px", fontWeight: 600,
                      color: copiedExec ? "#166534" : "#1e40af",
                      backgroundColor: copiedExec ? "#dcfce7" : "white",
                      border: copiedExec ? "1px solid #bbf7d0" : "1px solid #bfdbfe",
                      borderRadius: "6px", padding: "5px 12px", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >{copiedExec ? "✓ Copied!" : "⬆ Copy as Text"}</button>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>{showExec ? "▲ Collapse" : "▼ Expand"}</span>
                </div>
              </div>
              {showExec && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {/* 1. Current State */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #dbeafe", paddingBottom: "4px" }}>
                      1 — Current State
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", marginBottom: "4px" }}>✓ Completed</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}>
                          <strong>Batch 4 (TDC)</strong> — AI Mapping Proposals & Decisions is complete. The AI classification layer is locked and available as a dependency for downstream batches.
                        </div>
                      </div>
                      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginBottom: "4px" }}>⚡ Actively In Flight</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}>
                          <strong>Batches {uniqueInFlight || "5, 6, 2A, 7, 8, 9"}</strong> — Entity Identity, Practitioner Review, Classification Contract, Client Eligibility, Exceptions, and IMS/Prior Year are all running concurrently across PDC and TDC tracks.
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* 2. Critical Path Insight */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #dbeafe", paddingBottom: "4px" }}>
                      2 — Critical Path Insight
                    </div>
                    <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.6" }}>
                      {(() => {
                        const cpSteps = summary.cpOrdered.map(n => `${n.batch} (${n.system})`).join(" → ");
                        const cpFirst = summary.cpOrdered[0];
                        const cpLast  = summary.cpOrdered[summary.cpOrdered.length - 1];
                        return (
                          <>
                            The true critical path runs: <strong style={{ color: "#1e40af" }}>{cpSteps || "B5 → B6 → B7 → B8 → B9 → B10 → B11 → B14 → B16 → B21"}</strong>.
                            {cpFirst && cpLast && (
                              <> Spans <strong>{formatDate(cpFirst.startDate)}</strong> → <strong>{formatDate(cpLast.endDate)}</strong> ({summary.cpTotalDays} calendar days).</>
                            )}
                            {" "}This chain determines the earliest possible delivery of Return Assembly (B10), which gates all PI 3 MVP work.
                            <br /><br />
                            <span style={{ color: "#d97706", fontWeight: 600 }}>⚠ B2A Risk:</span> Batch 2A (Orchestrator Classification Contract) starts Apr 29 and must complete by May 4. It is a <strong>required predecessor for B7 (Eligibility)</strong> and B8 (Exceptions). Any delay in B2A compresses the B7 start window and introduces risk to the B8→B9 chain.
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {/* 3. Delivery Outlook */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #dbeafe", paddingBottom: "4px" }}>
                      3 — Delivery Outlook
                    </div>
                    <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.6" }}>
                      <strong>Earliest realistic B10 completion:</strong> Jun 11, 2026 (assuming no slippage in B8/B9 chain).<br />
                      <strong>PI 2 scope achievability:</strong> Committed batches (B5–B11) are achievable if B2A closes on time. Stretch batches (B16 PDC, B24 PDC, B25 PDC) are isolated and non-blocking — they do not affect the critical path.
                    </div>
                  </div>
                  {/* 4. Risks */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #fde68a", paddingBottom: "4px" }}>
                      4 — Risks
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { label: "Dependency compression", detail: "B2A (Apr 29–May 4) feeds B7 (May 1 start). There is a 3-day overlap window — B7 cannot fully start until B2A closes." },
                        { label: "PDC/TDC misalignment", detail: "B8 PDC ends May 13; B8 TDC starts May 12. One-day overlap is intentional but fragile — any PDC delay pushes TDC." },
                        { label: "Late-start B2A risk", detail: "B2A starts Apr 29 — 7 days after B5/B6. If B5 slips, B2A's classification contract is delayed, cascading to B7 and B8." },
                        { label: "Exception + Prior Year overlap", detail: "B8 TDC (May 12–20) and B9 PDC (May 14–26) overlap by 6 days. These are independent tracks but share engineering bandwidth." },
                      ].map((risk, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", minWidth: "180px" }}>⚠ {risk.label}</span>
                          <span style={{ fontSize: "11px", color: "#78350f" }}>{risk.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 5. Opportunities */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #bbf7d0", paddingBottom: "4px" }}>
                      5 — Opportunities
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { label: "Parallelization active", detail: "B5 (PDC) and B6 (TDC) run concurrently Apr 22–30. B8 PDC and B9 PDC overlap May 14–26. This is healthy parallel execution." },
                        { label: "Stretch work isolated", detail: "B16 PDC, B24 PDC, B25 PDC are non-blocking. They can slip without affecting the committed delivery path." },
                        { label: "Strong PI 3 sequencing", detail: "B11 (Learning Governance, Jun 12–22) cleanly gates PI 3 entry. B14 TDC starts Jun 23 — one day after B11 closes. Transition is tight but clean." },
                      ].map((opp, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#166534", minWidth: "180px" }}>✓ {opp.label}</span>
                          <span style={{ fontSize: "11px", color: "#14532d" }}>{opp.detail}</span>
                        </div>
                      ))}
                     </div>
                  </div>

                  {/* 6. PI 3 MVP Readiness */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #e9d5ff", paddingBottom: "4px" }}>
                      6 — PI 3 MVP Readiness
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#6b21a8", marginBottom: "4px" }}>MVP Batches in Scope</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}>
                          <strong>B14, B15, B18, B19, B24, B25, B17, B16</strong> — Tax Computation, Provision, Advisory, Decision Support, and Audit Trail (TDC track, Jun–Sep 2026).
                        </div>
                      </div>
                      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginBottom: "4px" }}>PI 3 Entry Gate</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}>
                          <strong>B11 TDC</strong> (Learning Governance) must close <strong>Jun 22</strong> before PI 3 MVP work begins. B14 TDC starts Jun 23 — one-day transition window.
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { label: "PI 3 risk inheritance", detail: "PI 3 carries no risk from PI 2 stretch batches. B16/B24/B25 PDC are isolated and non-blocking.", ok: true },
                        { label: "Tightest PI 3 handoff", detail: "B9 TDC → B10 TDC (Jun 2 → Jun 3). Zero buffer. Flag as watch item in batch review.", ok: false },
                        { label: "PI 3 close-out gate", detail: "B16 TDC (Audit Trail & Lineage Governance) closes Sep 11 — this is the PI 3 exit gate and PI 4 entry dependency.", ok: true },
                        { label: "Committed PDC track", detail: "B12, B13, B20, B21, B22, B23 PDC run parallel to TDC MVP track. No PDC batch is on the TDC critical path.", ok: true },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: item.ok ? "#f0fdf4" : "#fffbeb", border: `1px solid ${item.ok ? "#bbf7d0" : "#fde68a"}`, borderRadius: "6px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: item.ok ? "#166534" : "#92400e", minWidth: "180px" }}>{item.ok ? "✓" : "⚠"} {item.label}</span>
                          <span style={{ fontSize: "11px", color: item.ok ? "#14532d" : "#78350f" }}>{item.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 7. PI 4 Committed Scope */}
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: "1px solid #fde68a", paddingBottom: "4px" }}>
                      7 — PI 4 Committed Scope
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                      <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "6px" }}>Committed Batches (3)</div>
                        <div style={{ fontSize: "12px", color: "#374151", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div><strong>B21 TDC</strong> — Quality Control Review Records (Sep 14–22)</div>
                          <div><strong>B22 TDC</strong> — Client Communication & Outstanding Items (Sep 23–Oct 1)</div>
                          <div><strong>B23 TDC</strong> — Benchmark & Peer Analytics (Oct 5–14)</div>
                        </div>
                      </div>
                      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginBottom: "4px" }}>PI 4 Entry Gate</div>
                        <div style={{ fontSize: "12px", color: "#374151" }}>
                          <strong>B16 TDC</strong> (Audit Trail & Lineage Governance) must close <strong>Sep 11</strong> before PI 4 begins. B21 TDC starts Sep 14 — 3-day buffer. PI 4 closes Oct 14 with B23 TDC.
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {[
                        { label: "PI 4 swimlane complete", detail: "3 committed TDC batches: B21 (QC), B22 (Client Comms), B23 (Benchmarks). PI 4 runs Sep 14 – Oct 14, 2026.", ok: true },
                        { label: "Clean entry gate", detail: "B16 TDC → B21 TDC has a 3-day buffer (Sep 11 → Sep 14). This is the healthiest PI transition in the roadmap.", ok: true },
                        { label: "No stretch or MVP in PI 4", detail: "PI 4 is committed-only. All stretch and MVP work is contained within PI 2 and PI 3 respectively.", ok: true },
                        { label: "Sequential PI 4 chain", detail: "B21 → B22 → B23 TDC run in sequence with 1-day buffers. No parallel TDC work in PI 4 — clean close-out pattern.", ok: true },
                      ].map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", backgroundColor: item.ok ? "#f0fdf4" : "#fffbeb", border: `1px solid ${item.ok ? "#bbf7d0" : "#fde68a"}`, borderRadius: "6px", padding: "8px 12px" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: item.ok ? "#166534" : "#92400e", minWidth: "180px" }}>{item.ok ? "✓" : "⚠"} {item.label}</span>
                          <span style={{ fontSize: "11px", color: item.ok ? "#14532d" : "#78350f" }}>{item.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })()}
        {/* ── ROADMAP ANALYSIS ─────────────────────────────────────────────────── */}
        {(() => {
          return (
            <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "24px", overflow: "hidden" }}>
              <button
                onClick={() => setShowRoadmap(v => !v)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: showRoadmap ? "1px solid #e2e8f0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "3px", height: "16px", backgroundColor: "#7c3aed", borderRadius: "2px" }} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Roadmap Analysis
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>— sequencing health · bottlenecks · PI transition readiness</span>
                </div>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>{showRoadmap ? "▲ Collapse" : "▼ Expand"}</span>
              </button>
              {showRoadmap && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    {
                      letter: "A", title: "Sequencing Health", color: "#1e40af",
                      items: [
                        "Batches are logically ordered: B4 → B5/B6 → B2A → B7 → B8 → B9 → B10 → B11 follows a clean dependency chain.",
                        "No hard violations detected. B2A starts Apr 29 while B5 ends Apr 30 — a 1-day overlap that is acceptable given B2A only needs B5 entity schema, not final delivery.",
                        "B7 (TDC) starts May 1 while B2A ends May 4 — a 3-day gap risk. B7 should not advance past its classification contract gate until B2A closes.",
                      ],
                    },
                    {
                      letter: "B", title: "Parallelization", color: "#7c3aed",
                      items: [
                        "Safe parallel: B5 (PDC) ∥ B6 (TDC) — Apr 22–30. Independent workstreams, no shared gate.",
                        "Safe parallel: B8 PDC ∥ B9 PDC — May 5–13 overlap. Both depend on B5 but are independent of each other.",
                        "Risky overlap: B8 TDC (May 12–20) ∥ B9 PDC (May 14–26). These share engineering bandwidth and the B9 PDC team may be pulled into B8 TDC issues.",
                        "Stretch tracks (B16 PDC, B24 PDC, B25 PDC) are safely isolated from the committed path.",
                      ],
                    },
                    {
                      letter: "C", title: "Bottlenecks", color: "#d97706",
                      items: [
                        "Primary bottleneck: B7/B8/B9 chain (May 1–Jun 2). Five batches converge here across PDC and TDC. Any single slip cascades.",
                        "B2A is the narrowest point: 4 business days (Apr 29–May 4) to deliver classification contract enforcement before B7 and B8 gates open.",
                        "B9 TDC ends Jun 2 and B10 TDC starts Jun 3 — zero buffer. This is the tightest handoff in PI 2.",
                      ],
                    },
                    {
                      letter: "D", title: "PI Transition Readiness", color: "#059669",
                      items: [
                        "PI 3 entry gate: B11 TDC (Jun 12–22) must close before PI 3 MVP work begins.",
                        "B14 TDC (PI 3) starts Jun 23 — one day after B11 closes. This is clean but leaves no buffer for B11 slippage.",
                        "Recommendation: Confirm B11 scope is locked by Jun 5 to protect the PI 3 start date.",
                        "PI 3 carries no inherited risk from stretch batches — B16/B24/B25 PDC are isolated.",
                      ],
                    },
                    {
                      letter: "E", title: "Recommended Adjustments (dates unchanged)", color: "#dc2626",
                      items: [
                        "Buffer needed: B2A → B7 handoff. Add a 1-day classification contract review gate before B7 TDC advances past schema lock.",
                        "Fragile handoff: B9 TDC → B10 TDC (Jun 2 → Jun 3). Flag this as a watch item in batch review. Any B9 TDC slip pushes B10 and delays PI 3 entry.",
                        "Fragile handoff: B11 TDC → B14 TDC (Jun 22 → Jun 23). Recommend a PI 2 close-out checkpoint on Jun 22 before PI 3 kickoff.",
                        "Stretch ladder: Confirm B16 PDC (May 27–Jun 4) owner is not shared with B9 TDC (May 21–Jun 2) team to avoid bandwidth conflict.",
                      ],
                    },
                  ].map((section) => (
                    <div key={section.letter}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: section.color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", borderBottom: `1px solid ${section.color}22`, paddingBottom: "4px" }}>
                        {section.letter} — {section.title}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {section.items.map((item, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>
                            <span style={{ color: section.color, fontWeight: 700, minWidth: "12px" }}>·</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}


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
                    {["PI", "Batch", "System", "Name", "Start", "End", "Status", "Critical Path", "Blocking", "Blocked By", "Notes", ""].map(h => (
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
                    const today = new Date("2026-05-01");
                    const startD = parseDate(r.startDate);
                    const isAtRisk = isCP && startD !== null && startD < today && r.status !== "Done" && r.status !== "Committed";
                    const hasIssue = r._dateError || r._depConflict || isAtRisk;
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
                                  {(["Done", "Committed", "Stretch", "MVP", "New", "On Hold", "Post-MVP"] as BatchStatus[]).map(s => (
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
                          backgroundColor: isAtRisk ? "#fef2f2" : hasIssue ? "#fffbeb" : i % 2 === 0 ? "white" : "#fafafa",
                          borderLeft: isCP ? "3px solid #1e40af" : "3px solid transparent",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#f0f9ff"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = hasIssue ? "#fffbeb" : i % 2 === 0 ? "white" : "#fafafa"}
                      >
                        <td style={{ padding: "10px 12px", color: "#64748b" }}>{r.pi}</td>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: isCP ? "#1e40af" : "#0f172a" }}>
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
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          {isCP ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                              <span title="On Critical Path — determines earliest delivery of Return Assembly and downstream tax workflows" style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "4px", cursor: "help" }}>Yes ★</span>
                              {isAtRisk && (
                                <span title="At-Risk: Start date has passed but status is not Done or Committed — may impact critical path delivery" style={{ fontSize: "10px", fontWeight: 700, color: "#dc2626", backgroundColor: "#fee2e2", padding: "1px 6px", borderRadius: "4px", cursor: "help" }}>
                                  ⚠ At Risk
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: "11px", color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        {(() => {
                          // Blocking: which batches depend on THIS batch
                          const blockingList = validatedRows
                            .filter(x => x.id !== r.id && x.dependsOn.split(",").map(d => d.trim()).includes(r.batch))
                            .map(x => `${x.batch} (${x.system})`)
                            .filter((v, i, a) => a.indexOf(v) === i);
                          // Blocked By: which batches THIS batch depends on
                          const blockedByList = r.dependsOn
                            ? r.dependsOn.split(",").map(d => d.trim()).filter(Boolean)
                            : [];
                          return (
                            <>
                              <td style={{ padding: "10px 12px", maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {blockingList.length > 0 ? (
                                  <span title={blockingList.join(", ")} style={{ fontSize: "11px", color: "#1e40af", fontWeight: 600, cursor: "help" }}>
                                    {blockingList.slice(0, 2).join(", ")}{blockingList.length > 2 ? ` +${blockingList.length - 2}` : ""}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>—</span>
                                )}
                              </td>
                              <td style={{ padding: "10px 12px", maxWidth: "130px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {blockedByList.length > 0 ? (
                                  <span title={blockedByList.join(", ")} style={{ fontSize: "11px", color: r._depConflict ? "#d97706" : "#64748b", cursor: "help" }}>
                                    {r._depConflict && "⚠ "}{blockedByList.slice(0, 2).join(", ")}{blockedByList.length > 2 ? ` +${blockedByList.length - 2}` : ""}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>—</span>
                                )}
                              </td>
                            </>
                          );
                        })()}
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
          Official batch status, sequencing, and delivery tracking are maintained in the DCT Delivery Model and Control Panel.
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

        {/* ── UPLOAD & ANALYZE MODAL ────────────────────────────────────────────────── */}
        {showUpload && (
          <UploadAnalyzeModal
            baselineRows={BASELINE_ROWS}
            onClose={() => setShowUpload(false)}
          />
        )}

        {/* ── EMAIL TO PO MODAL ────────────────────────────────────────────────────────── */}
        {showEmailModal && (
          <div className="no-print" style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
          }}>
            <div style={{
              backgroundColor: "white", borderRadius: "14px", padding: "28px 32px",
              maxWidth: "520px", width: "92%", boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
            }}>
              {/* Modal header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Mail size={16} color="#1e40af" />
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Email to PO</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>Send batch calendar summary to Product Owner</div>
                  </div>
                </div>
                <button onClick={() => { setShowEmailModal(false); setPoEmail(""); setEmailSent(false); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "4px" }}>
                  <XIcon size={18} />
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: "1px", backgroundColor: "#f1f5f9", marginBottom: "18px" }} />

              {/* Email preview */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Copy View Preview</div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Same view as Print / Save as PDF</div>
                </div>
                <div style={{
                  backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px",
                  padding: "0", overflow: "hidden", maxHeight: "200px", overflowY: "auto",
                }}>
                  <iframe
                    srcDoc={buildGanttHtml(true)}
                    style={{ height: "200px", border: "none", transform: "scale(0.55)", transformOrigin: "top left", width: "182%", pointerEvents: "none" }}
                    title="Email Preview"
                  />
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "4px" }}>
                  Clicking <strong>Open Copy View</strong> opens this in a new window. Copy it into your email or save as PDF to attach.
                </div>
              </div>

              {/* PO email input */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
                  PO Email Address
                </label>
                <input
                  type="email"
                  value={poEmail}
                  onChange={e => setPoEmail(e.target.value)}
                  placeholder="e.g. productowner@rsmus.com"
                  style={{
                    width: "100%", fontSize: "13px", padding: "9px 12px",
                    border: "1px solid #e2e8f0", borderRadius: "8px",
                    outline: "none", color: "#0f172a", backgroundColor: "white",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>
                  This will open your default email client with the summary pre-filled.
                </div>
              </div>

              {/* Tip: export first */}
              <div style={{
                backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px",
                padding: "10px 12px", marginBottom: "18px", fontSize: "11px", color: "#78350f",
                display: "flex", gap: "8px", alignItems: "flex-start",
              }}>
                <span style={{ fontSize: "13px", flexShrink: 0 }}>⚡</span>
                <span><strong>Tip:</strong> Click <strong>Export Excel</strong> first to generate the attachment, then send this email with the file attached from your downloads folder.</span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Row 1: Primary send action */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openEmailClient(poEmail)}
                    disabled={!poEmail.trim()}
                    style={{
                      flex: 1, fontSize: "13px", fontWeight: 600, color: "white",
                      backgroundColor: poEmail.trim() ? "#1e40af" : "#94a3b8",
                      border: "none", borderRadius: "8px", padding: "11px", cursor: poEmail.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    }}
                  >
                    <Mail size={14} />
                    {emailSent ? "Opening Email Client…" : "Send Email"}
                  </button>
                  <button
                    onClick={() => { setShowEmailModal(false); setPoEmail(""); setEmailSent(false); }}
                    style={{
                      fontSize: "13px", fontWeight: 500, color: "#64748b",
                      backgroundColor: "transparent", border: "1px solid #e2e8f0",
                      borderRadius: "8px", padding: "11px 18px", cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
                {/* Row 2: Secondary actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => openCopyView()}
                    style={{
                      flex: 1, fontSize: "12px", fontWeight: 600, color: "#1e40af",
                      backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                      borderRadius: "8px", padding: "8px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                    }}
                  >
                    <FileSpreadsheet size={12} /> Open Copy View
                  </button>
                  <button
                    onClick={() => { exportExcel(); }}
                    style={{
                      flex: 1, fontSize: "12px", fontWeight: 600, color: "#166534",
                      backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                      borderRadius: "8px", padding: "8px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "5px", justifyContent: "center",
                    }}
                  >
                    <FileSpreadsheet size={12} /> Export Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}