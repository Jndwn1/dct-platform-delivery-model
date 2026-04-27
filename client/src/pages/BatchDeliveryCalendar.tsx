// BatchDeliveryCalendar.tsx
// RSM | CATT · DCT Platform · Batch Delivery Calendar
// PLANNING VIEW ONLY — NOT SOURCE OF TRUTH
// This page is fully isolated. It does NOT read from or write to any other page,
// the Control Panel, Batch Roadmap, API coverage, or any system data.
// All data is local state only. No persistence.

import { useState, useMemo, useRef } from "react";
import {
  AlertTriangle, Calendar, Download, RotateCcw, Plus, Trash2,
  ChevronDown, ChevronUp, Info, CheckCircle2, Clock, AlertCircle,
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
  // validation state (not user-editable)
  _dateError?: boolean;
  _overlapWarning?: boolean;
}

// ─── SCENARIO DEFINITIONS ─────────────────────────────────────────────────────

const SCENARIOS = [
  { id: "v1", label: "PI Planning Draft v1", description: "Initial planning estimate — unreviewed" },
  { id: "v2", label: "PI Planning Draft v2", description: "Revised after architecture sync" },
  { id: "final", label: "PI Planning Final", description: "Agreed baseline for PI execution" },
  { id: "custom", label: "Custom Scenario", description: "Ad-hoc scenario for what-if analysis" },
];

// ─── BASELINE DATA (reset target) ─────────────────────────────────────────────

const BASELINE_ROWS: BatchRow[] = [
  {
    id: "fc",
    pi: "PI 1",
    batch: "Foundation Core",
    system: "Platform",
    name: "Schema Lock & Platform Scaffolding",
    startDate: "2025-01-06",
    endDate: "2025-02-14",
    status: "Completed",
    notes: "Gate 1 (Schema Lock) achieved. Baseline locked.",
  },
  {
    id: "b1",
    pi: "PI 1",
    batch: "Batch 1",
    system: "PDC",
    name: "File Ingestion & Raw Storage",
    startDate: "2025-02-17",
    endDate: "2025-03-28",
    status: "Completed",
    notes: "PDC ingestion pipeline complete. IngestionJob lifecycle validated.",
  },
  {
    id: "b2",
    pi: "PI 2",
    batch: "Batch 2",
    system: "Orchestrator",
    name: "Normalization & Agent Execution",
    startDate: "2025-03-31",
    endDate: "2025-05-09",
    status: "In Progress",
    notes: "Agent 1 (File Recognizer) and Agent 2 (Normalizer) in validation.",
  },
  {
    id: "b2a",
    pi: "PI 2",
    batch: "Batch 2A",
    system: "PDC",
    name: "Contract Enforcement — FirmTaxonomyId",
    startDate: "2025-04-14",
    endDate: "2025-05-23",
    status: "In Progress",
    notes: "DEP-04 (Taxonomy Service API) blocking. ADR-06 enforcement pending.",
  },
  {
    id: "b3",
    pi: "PI 2",
    batch: "Batch 3",
    system: "TDC",
    name: "Tax Domain Authority & TdcRecordId",
    startDate: "2025-05-12",
    endDate: "2025-06-20",
    status: "Planned",
    notes: "Depends on Batch 2A READY signal. TaxYear derivation in scope.",
  },
  {
    id: "b4",
    pi: "PI 3",
    batch: "Batch 4",
    system: "TDC",
    name: "AI Tax Mapping & Confidence Bands",
    startDate: "2025-06-23",
    endDate: "2025-08-01",
    status: "Planned",
    notes: "Agent 4 (Tax Mapper) scope. GREEN/YELLOW/RED confidence bands.",
  },
  {
    id: "b5",
    pi: "PI 3",
    batch: "Batch 5",
    system: "Platform",
    name: "Entity Identity & Structure",
    startDate: "2025-08-04",
    endDate: "2025-09-12",
    status: "Planned",
    notes: "EntityId resolution and firm hierarchy scope.",
  },
  {
    id: "b6",
    pi: "PI 3",
    batch: "Batch 6",
    system: "Roger",
    name: "Practitioner Review & Roger UI",
    startDate: "2025-09-15",
    endDate: "2025-10-24",
    status: "Planned",
    notes: "Roger read-only access. Practitioner approve/override flows.",
  },
  {
    id: "b7",
    pi: "PI 4",
    batch: "Batch 7",
    system: "TDC",
    name: "Client Tax Profile & Eligibility",
    startDate: "2025-10-27",
    endDate: "2025-12-05",
    status: "Planned",
    notes: "Client-level tax profile derivation. Eligibility rules.",
  },
  {
    id: "b8",
    pi: "PI 4",
    batch: "Batch 8",
    system: "Platform",
    name: "Exceptions & Remediation",
    startDate: "2025-12-08",
    endDate: "2026-01-16",
    status: "Planned",
    notes: "Exception handling, remediation workflows, and audit trail.",
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SYSTEM_COLORS: Record<SystemType, { bg: string; text: string; bar: string }> = {
  PDC:          { bg: "#dbeafe", text: "#1e40af", bar: "#2563eb" },
  TDC:          { bg: "#dcfce7", text: "#166534", bar: "#059669" },
  Orchestrator: { bg: "#ede9fe", text: "#5b21b6", bar: "#7c3aed" },
  Roger:        { bg: "#ffedd5", text: "#9a3412", bar: "#f97316" },
  Platform:     { bg: "#f1f5f9", text: "#334155", bar: "#64748b" },
};

const STATUS_META: Record<BatchStatus, { color: string; bg: string; icon: React.ElementType }> = {
  "Completed":   { color: "#166534", bg: "#dcfce7", icon: CheckCircle2 },
  "In Progress": { color: "#1e40af", bg: "#dbeafe", icon: Clock },
  "Planned":     { color: "#374151", bg: "#f3f4f6", icon: Calendar },
  "At Risk":     { color: "#92400e", bg: "#fef3c7", icon: AlertTriangle },
  "On Hold":     { color: "#6b7280", bg: "#f9fafb", icon: AlertCircle },
};

function parseDate(s: string): Date | null {
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

function generateId(): string {
  return "row-" + Math.random().toString(36).slice(2, 8);
}

// ─── GANTT COMPONENT ──────────────────────────────────────────────────────────

function GanttChart({ rows }: { rows: BatchRow[] }) {
  const validRows = rows.filter(r => parseDate(r.startDate) && parseDate(r.endDate) && !r._dateError);
  if (validRows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
        No valid date ranges to display. Add start and end dates to see the timeline.
      </div>
    );
  }

  const allDates = validRows.flatMap(r => [parseDate(r.startDate)!, parseDate(r.endDate)!]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  // Add 5-day padding on each side
  minDate.setDate(minDate.getDate() - 5);
  maxDate.setDate(maxDate.getDate() + 5);
  const totalDays = daysBetween(minDate, maxDate);

  // Build month markers
  const months: { label: string; left: number; width: number }[] = [];
  const cursor = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  while (cursor <= maxDate) {
    const monthStart = new Date(Math.max(cursor.getTime(), minDate.getTime()));
    const nextMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    const monthEnd = new Date(Math.min(nextMonth.getTime() - 86400000, maxDate.getTime()));
    const left = (daysBetween(minDate, monthStart) / totalDays) * 100;
    const width = ((daysBetween(monthStart, monthEnd) + 1) / totalDays) * 100;
    months.push({
      label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      left,
      width,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  // Group rows by PI for visual separation
  const piGroups: Record<string, BatchRow[]> = {};
  for (const row of validRows) {
    if (!piGroups[row.pi]) piGroups[row.pi] = [];
    piGroups[row.pi].push(row);
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: "700px" }}>
        {/* Month header */}
        <div className="relative h-7 border-b border-slate-200 mb-1" style={{ marginLeft: "140px" }}>
          {months.map((m, i) => (
            <div
              key={i}
              className="absolute top-0 h-full flex items-center justify-center text-xs text-slate-500 font-medium border-l border-slate-200"
              style={{ left: `${m.left}%`, width: `${m.width}%` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {Object.entries(piGroups).map(([pi, piRows]) => (
          <div key={pi} className="mb-2">
            {/* PI label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-[140px] shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider pr-2 text-right">{pi}</div>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            {piRows.map(row => {
              const start = parseDate(row.startDate)!;
              const end = parseDate(row.endDate)!;
              const leftPct = (daysBetween(minDate, start) / totalDays) * 100;
              const widthPct = Math.max((daysBetween(start, end) / totalDays) * 100, 0.5);
              const sys = SYSTEM_COLORS[row.system];
              const isCompleted = row.status === "Completed";

              return (
                <div key={row.id} className="flex items-center mb-1.5 group">
                  {/* Row label */}
                  <div className="w-[140px] shrink-0 pr-3 text-right">
                    <div className="text-xs font-semibold text-slate-700 truncate">{row.batch}</div>
                    <div className="text-xs text-slate-400 truncate">{row.system}</div>
                  </div>
                  {/* Bar track */}
                  <div className="flex-1 relative h-7 bg-slate-50 rounded border border-slate-100">
                    {/* Month grid lines */}
                    {months.map((m, i) => (
                      <div key={i} className="absolute top-0 h-full border-l border-slate-100" style={{ left: `${m.left}%` }} />
                    ))}
                    {/* Gantt bar */}
                    <div
                      className="absolute top-1 h-5 rounded flex items-center px-2 overflow-hidden transition-all"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: isCompleted ? "#e2e8f0" : sys.bar,
                        opacity: isCompleted ? 0.7 : 1,
                        minWidth: "4px",
                      }}
                      title={`${row.batch} · ${formatDate(row.startDate)} → ${formatDate(row.endDate)}`}
                    >
                      <span className="text-xs font-semibold truncate" style={{ color: isCompleted ? "#64748b" : "white", fontSize: "10px" }}>
                        {row.name}
                      </span>
                    </div>
                    {/* Overlap warning indicator */}
                    {row._overlapWarning && (
                      <div
                        className="absolute top-0 h-full border-l-2 border-amber-400 opacity-60"
                        style={{ left: `${leftPct}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100">
          {(Object.entries(SYSTEM_COLORS) as [SystemType, typeof SYSTEM_COLORS[SystemType]][]).map(([sys, col]) => (
            <div key={sys} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: col.bar }} />
              <span className="text-xs text-slate-500">{sys}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-300" />
            <span className="text-xs text-slate-500">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BatchDeliveryCalendar() {
  const [rows, setRows] = useState<BatchRow[]>(() =>
    BASELINE_ROWS.map(r => ({ ...r }))
  );
  const [scenarioId, setScenarioId] = useState("v1");
  const [showScenarioDropdown, setShowScenarioDropdown] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showGantt, setShowGantt] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const tableRef = useRef<HTMLTableElement>(null);

  const scenario = SCENARIOS.find(s => s.id === scenarioId) ?? SCENARIOS[0];

  // ── Validation ────────────────────────────────────────────────────────────
  const validatedRows = useMemo<BatchRow[]>(() => {
    return rows.map((row, i) => {
      const start = parseDate(row.startDate);
      const end = parseDate(row.endDate);
      const dateError = !!(start && end && end < start);

      // Overlap: check if this row overlaps with any other row of the same system
      let overlapWarning = false;
      if (start && end && !dateError) {
        for (let j = 0; j < rows.length; j++) {
          if (j === i) continue;
          const other = rows[j];
          if (other.system !== row.system) continue;
          const oStart = parseDate(other.startDate);
          const oEnd = parseDate(other.endDate);
          if (oStart && oEnd && start <= oEnd && end >= oStart) {
            overlapWarning = true;
            break;
          }
        }
      }

      return { ...row, _dateError: dateError, _overlapWarning: overlapWarning };
    });
  }, [rows]);

  const errorCount = validatedRows.filter(r => r._dateError).length;
  const overlapCount = validatedRows.filter(r => r._overlapWarning).length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function updateRow(id: string, field: keyof BatchRow, value: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function addRow() {
    const newRow: BatchRow = {
      id: generateId(),
      pi: "PI 1",
      batch: "New Batch",
      system: "PDC",
      name: "New Batch Name",
      startDate: "",
      endDate: "",
      status: "Planned",
      notes: "",
    };
    setRows(prev => [...prev, newRow]);
    setEditingId(newRow.id);
  }

  function deleteRow(id: string) {
    setRows(prev => prev.filter(r => r.id !== id));
  }

  function resetToBaseline() {
    setRows(BASELINE_ROWS.map(r => ({ ...r })));
    setScenarioId("v1");
    setShowResetConfirm(false);
  }

  function exportCSV() {
    const headers = ["PI", "Batch", "System", "Name", "Start Date", "End Date", "Status", "Notes"];
    const csvRows = [
      `"Scenario: ${scenario.label}"`,
      `"Planning View Only — Not Source of Truth"`,
      "",
      headers.map(h => `"${h}"`).join(","),
      ...validatedRows.map(r =>
        [r.pi, r.batch, r.system, r.name, r.startDate, r.endDate, r.status, r.notes]
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DCT-BatchCalendar-${scenario.id}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const piOptions = ["PI 1", "PI 2", "PI 3", "PI 4", "PI 5"];
  const systemOptions: SystemType[] = ["PDC", "TDC", "Orchestrator", "Roger", "Platform"];
  const statusOptions: BatchStatus[] = ["Planned", "In Progress", "Completed", "At Risk", "On Hold"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

        {/* ── Governance Banner ── */}
        <div className="flex items-start gap-3 rounded-xl px-5 py-4 border-2 border-amber-300 bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-amber-800">Planning View Only — Not Source of Truth</div>
            <div className="text-sm text-amber-700 mt-0.5">
              This calendar is used for scenario modeling. Official batch status, sequencing, and delivery tracking are maintained in the <strong>Batch Roadmap</strong> and <strong>Control Panel</strong>.
            </div>
          </div>
        </div>

        {/* ── Page Header ── */}
        <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 shadow-sm">
          {/* Scenario label */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="relative">
              <button
                onClick={() => setShowScenarioDropdown(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-600 hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <Calendar className="w-3.5 h-3.5" />
                Scenario: {scenario.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showScenarioDropdown && (
                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-64">
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setScenarioId(s.id); setShowScenarioDropdown(false); }}
                      className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors ${s.id === scenarioId ? "bg-blue-50" : ""}`}
                    >
                      <div className="text-sm font-semibold text-slate-800">{s.label}</div>
                      <div className="text-xs text-slate-500">{s.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400 italic">Working draft — not final</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Batch Delivery Calendar</h1>
              <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 mt-0.5">RSM · CATT · DCT Platform</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowGantt(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {showGantt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showGantt ? "Hide" : "Show"} Timeline
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to Baseline
              </button>
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#003A8F" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Batch
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-3 max-w-3xl leading-relaxed">
            This page provides a manual planning view of batch timelines across PIs. It is used for scenario modeling and scheduling discussions only.
            Data entered here <strong>does not update or override any other platform views</strong>.
          </p>

          {/* Validation summary */}
          {(errorCount > 0 || overlapCount > 0) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {errorCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errorCount} date error{errorCount > 1 ? "s" : ""} — End Date before Start Date
                </div>
              )}
              {overlapCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {overlapCount} overlap warning{overlapCount > 1 ? "s" : ""} — same system, overlapping dates
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Gantt Timeline ── */}
        {showGantt && (
          <div className="bg-white rounded-xl border border-slate-200 px-6 py-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Timeline View</h2>
                <div className="text-xs text-slate-400 mt-0.5">Updates immediately as you edit dates in the table below</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <Info className="w-3 h-3" />
                Visualization only
              </div>
            </div>
            <GanttChart rows={validatedRows} />
          </div>
        )}

        {/* ── Editable Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Batch Schedule</h2>
              <div className="text-xs text-slate-400 mt-0.5">{rows.length} batches · Click any cell to edit</div>
            </div>
            <div className="text-xs text-slate-400 italic">All edits are local only — no system data is modified</div>
          </div>

          <div className="overflow-x-auto">
            <table ref={tableRef} className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100" style={{ backgroundColor: "#003A8F" }}>
                  {["PI", "Batch", "System", "Name", "Start Date", "End Date", "Status", "Notes", ""].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validatedRows.map((row, idx) => {
                  const isEditing = editingId === row.id;
                  const sys = SYSTEM_COLORS[row.system];
                  const statusMeta = STATUS_META[row.status];
                  const StatusIcon = statusMeta.icon;
                  const rowBg = row._dateError ? "#fff1f2" : idx % 2 === 0 ? "white" : "#f8fafc";

                  return (
                    <tr
                      key={row.id}
                      className={`border-b border-slate-100 transition-colors ${isEditing ? "ring-2 ring-inset ring-blue-400" : "hover:bg-blue-50/30"}`}
                      style={{ backgroundColor: isEditing ? "#eff6ff" : rowBg }}
                      onClick={() => setEditingId(row.id)}
                    >
                      {/* PI */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <select
                            value={row.pi}
                            onChange={e => updateRow(row.id, "pi", e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-20 text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            {piOptions.map(p => <option key={p}>{p}</option>)}
                          </select>
                        ) : (
                          <span className="text-xs font-semibold text-slate-600">{row.pi}</span>
                        )}
                      </td>

                      {/* Batch */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            value={row.batch}
                            onChange={e => updateRow(row.id, "batch", e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-28 text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-800">{row.batch}</span>
                        )}
                      </td>

                      {/* System */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <select
                            value={row.system}
                            onChange={e => updateRow(row.id, "system", e.target.value as SystemType)}
                            onClick={e => e.stopPropagation()}
                            className="w-28 text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            {systemOptions.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: sys.bg, color: sys.text }}>
                            {row.system}
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-3 py-2 max-w-[200px]">
                        {isEditing ? (
                          <input
                            value={row.name}
                            onChange={e => updateRow(row.id, "name", e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="w-full text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="text-xs text-slate-700 line-clamp-2">{row.name}</span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            type="date"
                            value={row.startDate}
                            onChange={e => updateRow(row.id, "startDate", e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        ) : (
                          <span className="text-xs text-slate-600 whitespace-nowrap">{row.startDate ? formatDate(row.startDate) : <span className="text-slate-300 italic">Not set</span>}</span>
                        )}
                      </td>

                      {/* End Date */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <div>
                            <input
                              type="date"
                              value={row.endDate}
                              onChange={e => updateRow(row.id, "endDate", e.target.value)}
                              onClick={e => e.stopPropagation()}
                              className={`text-xs border rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 ${row._dateError ? "border-red-400 focus:ring-red-400" : "border-blue-300 focus:ring-blue-400"}`}
                            />
                            {row._dateError && (
                              <div className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> End before Start
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className={`text-xs whitespace-nowrap ${row._dateError ? "text-red-600 font-semibold" : "text-slate-600"}`}>
                              {row.endDate ? formatDate(row.endDate) : <span className="text-slate-300 italic">Not set</span>}
                            </span>
                            {row._dateError && <div className="text-xs text-red-500">⚠ Date error</div>}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <select
                            value={row.status}
                            onChange={e => updateRow(row.id, "status", e.target.value as BatchStatus)}
                            onClick={e => e.stopPropagation()}
                            className="text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            {statusOptions.map(s => <option key={s}>{s}</option>)}
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
                            <StatusIcon className="w-3 h-3" />
                            {row.status}
                          </span>
                        )}
                      </td>

                      {/* Notes */}
                      <td className="px-3 py-2 max-w-[220px]">
                        {isEditing ? (
                          <textarea
                            value={row.notes}
                            onChange={e => updateRow(row.id, "notes", e.target.value)}
                            onClick={e => e.stopPropagation()}
                            rows={2}
                            className="w-full text-xs border border-blue-300 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                          />
                        ) : (
                          <span className="text-xs text-slate-500 line-clamp-2">{row.notes || <span className="italic text-slate-300">No notes</span>}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          {isEditing && (
                            <button
                              onClick={e => { e.stopPropagation(); setEditingId(null); }}
                              className="p-1 rounded hover:bg-green-100 text-green-600 transition-colors"
                              title="Done editing"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); deleteRow(row.id); }}
                            className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <button
              onClick={addRow}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
            <div className="text-xs text-slate-400 italic">
              Click any row to edit · Click ✓ or outside to confirm · Changes are local only
            </div>
          </div>
        </div>

        {/* ── Footer disclaimer ── */}
        <div className="flex items-start gap-2 text-xs text-slate-400 px-1 pb-4">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong>Data isolation:</strong> This page does not read from or write to the Control Panel, Batch Roadmap, API Coverage, or any system data.
            All entries are local state only and are not persisted across sessions.
            Scenario: <em>{scenario.label}</em> · {scenario.description}
          </span>
        </div>
      </div>

      {/* ── Reset Confirmation Modal ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-bold text-slate-800">Reset to Baseline?</div>
                <div className="text-xs text-slate-500">All current edits will be lost.</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              This will restore the original 10-batch baseline plan and reset the scenario to <strong>PI Planning Draft v1</strong>.
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetToBaseline}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-bold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#dc2626" }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
