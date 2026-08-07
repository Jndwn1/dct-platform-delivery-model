// RogerScreenTestingStatus.tsx
// Simple Screen Testing Status table for the QA Deployment Registry.
// Spec: pasted_content_152 / pasted_content_153 — Page/Area, Status, QA Guidance/Notes, Target Date.

import { useState } from "react";

type ScreenStatus = "Ready to Test" | "Partially Ready" | "Not Ready" | "Out of Scope" | "Not Functional";

interface ScreenRow {
  page: string;
  status: ScreenStatus;
  notes: string;
  targetDate: string;
}

const STATUS_STYLE: Record<ScreenStatus, { bg: string; text: string; border: string; dot: string }> = {
  "Ready to Test":    { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", dot: "#22c55e" },
  "Partially Ready":  { bg: "#fefce8", text: "#854d0e", border: "#fde68a", dot: "#eab308" },
  "Not Ready":        { bg: "#fef2f2", text: "#991b1b", border: "#fecaca", dot: "#ef4444" },
  "Out of Scope":     { bg: "#f8fafc", text: "#475569", border: "#e2e8f0", dot: "#94a3b8" },
  "Not Functional":   { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", dot: "#be123c" },
};

const INITIAL_SCREENS: ScreenRow[] = [
  { page: "My Clients",                 status: "Partially Ready",  notes: "Entities, deliverables, and average completion are still in progress. Line Mapping is working.",                                                                                                                     targetDate: "TBD – DCT confirmation required" },
  { page: "Return Filings",             status: "Not Ready",        notes: "The screen is functional, but it is not ready for QA testing until deliverable information is available. Current data is not real.",                                                                                  targetDate: "TBD" },
  { page: "Return Structure",           status: "Not Ready",        notes: "Return structure, progress bar, issue count, and statutory/client due dates are still being built. Current data is dummy data.",                                                                                      targetDate: "August 28, 2026 – Consolidations/Eliminations\nPY Data – TBD" },
  { page: "Summary",                    status: "Ready to Test",    notes: "All functionality is ready for QA testing.",                                                                                                                                                                          targetDate: "Ready" },
  { page: "Line Mapping",               status: "Partially Ready",  notes: "Mapping Override Policy gate fix deployed August 7, 2026. Mapping overrides should no longer fail because a Mapping Override Policy does not exist. Other identified Line Mapping readiness issues remain outstanding.", targetDate: "Mapping Override Policy Fix – Deployed August 7, 2026\nRemaining items – TBD" },
  { page: "TB with Line Mapping",       status: "Ready to Test",    notes: "All functionality is ready for QA testing.",                                                                                                                                                                          targetDate: "Ready" },
  { page: "Book Adjustment",            status: "Partially Ready",  notes: "Ready to test except for Add New Account.",                                                                                                                                                                           targetDate: "Add New Account – TBD" },
  { page: "Reclass Adjustment",         status: "Partially Ready",  notes: "Ready to test except for Add New Account.",                                                                                                                                                                           targetDate: "Add New Account – TBD" },
  { page: "Book Return Review",         status: "Partially Ready",  notes: "Ready to test except for PY Final Amount. A manual refresh may currently be required for mapping changes to appear due to a known caching issue.",                                                                    targetDate: "PY Final Amount – TBD\nCaching issue – Under Investigation" },
  { page: "Tax Adjustments",            status: "Not Ready",        notes: "Not ready for QA testing.",                                                                                                                                                                                           targetDate: "TBD" },
  { page: "Book to Tax Report",         status: "Partially Ready",  notes: "Ready to test except for PY Final Amount.",                                                                                                                                                                           targetDate: "PY Final Amount – TBD" },
  { page: "Book to Tax Reconciliation", status: "Not Ready",        notes: "Not ready for QA testing.",                                                                                                                                                                                           targetDate: "TBD" },
  { page: "1120 – Page 1 Income",       status: "Ready to Test",    notes: "Ready for QA testing.",                                                                                                                                                                                               targetDate: "Ready" },
  { page: "1120 – Page 1 Deductions",   status: "Ready to Test",    notes: "Ready for QA testing.",                                                                                                                                                                                               targetDate: "Ready" },
  { page: "1120 – Form 1125-A",         status: "Ready to Test",    notes: "Ready for QA testing.",                                                                                                                                                                                               targetDate: "Ready" },
  { page: "1120 – Schedule L",          status: "Out of Scope",     notes: "Not in scope; please do not test.",                                                                                                                                                                                   targetDate: "N/A" },
  { page: "1120 – Form 4562",           status: "Out of Scope",     notes: "Not in scope; please do not test.",                                                                                                                                                                                   targetDate: "N/A" },
  { page: "1120 – Sign-off",            status: "Not Functional",   notes: "Gateway sign-off is not yet functional.",                                                                                                                                                                             targetDate: "TBD" },
];

const ALL_STATUSES: ScreenStatus[] = ["Ready to Test", "Partially Ready", "Not Ready", "Out of Scope", "Not Functional"];

export default function RogerScreenTestingStatus() {
  const [screens, setScreens] = useState<ScreenRow[]>(INITIAL_SCREENS);
  const [filter, setFilter] = useState<ScreenStatus | "All">("All");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<ScreenRow>>({});

  const counts = {
    total: screens.length,
    readyToTest:    screens.filter(s => s.status === "Ready to Test").length,
    partiallyReady: screens.filter(s => s.status === "Partially Ready").length,
    notReady:       screens.filter(s => s.status === "Not Ready").length,
    outOfScope:     screens.filter(s => s.status === "Out of Scope").length,
    notFunctional:  screens.filter(s => s.status === "Not Functional").length,
  };

  const sortToBottom = (rows: ScreenRow[]) => {
    const active = rows.filter(r => r.status !== "Out of Scope" && r.status !== "Not Functional");
    const outOfScope = rows.filter(r => r.status === "Out of Scope");
    const notFunctional = rows.filter(r => r.status === "Not Functional");
    return [...active, ...outOfScope, ...notFunctional];
  };
  const visible = filter === "All" ? sortToBottom(screens) : screens.filter(s => s.status === filter);

  const startEdit = (idx: number) => { setEditingIdx(idx); setEditDraft({ ...screens[idx] }); };
  const saveEdit  = (idx: number) => { setScreens(prev => prev.map((s, i) => i === idx ? { ...s, ...editDraft } as ScreenRow : s)); setEditingIdx(null); setEditDraft({}); };

  const summaryCards = [
    { label: "Total Screens / Areas", count: counts.total,          bg: "#f8fafc", text: "#1e293b", border: "#e2e8f0" },
    { label: "Ready to Test",         count: counts.readyToTest,    ...STATUS_STYLE["Ready to Test"] },
    { label: "Partially Ready",       count: counts.partiallyReady, ...STATUS_STYLE["Partially Ready"] },
    { label: "Not Ready",             count: counts.notReady,       ...STATUS_STYLE["Not Ready"] },
    { label: "Out of Scope",          count: counts.outOfScope,     ...STATUS_STYLE["Out of Scope"] },
    { label: "Not Functional",        count: counts.notFunctional,  ...STATUS_STYLE["Not Functional"] },
  ];

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginTop: "28px" }}>

      {/* Header */}
      <div style={{ backgroundColor: "#1e3a5f", padding: "14px 20px" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Roger Screen Testing Status</div>
        <div style={{ fontSize: "11px", color: "#93c5fd", marginTop: "2px" }}>Current QA readiness by screen — updated by BA as status changes</div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "8px", padding: "14px 16px", flexWrap: "wrap", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
        {summaryCards.map(c => (
          <div
            key={c.label}
            onClick={() => setFilter(c.label === "Total Screens / Areas" ? "All" : c.label as ScreenStatus)}
            style={{
              backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px",
              padding: "8px 14px", textAlign: "center", minWidth: "90px", cursor: "pointer",
              outline: filter === (c.label === "Total Screens / Areas" ? "All" : c.label) ? `2px solid ${c.text}` : "none",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: c.text }}>{c.count}</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "1.3", marginTop: "2px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: "6px", padding: "10px 16px", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>Filter:</span>
        {(["All", ...ALL_STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: "3px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, cursor: "pointer", backgroundColor: filter === s ? "#1e3a5f" : "white", color: filter === s ? "white" : "#475569", border: filter === s ? "1px solid #1e3a5f" : "1px solid #e2e8f0" }}>
            {s}{s !== "All" && ` (${screens.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "200px 150px 1fr 200px 70px", gap: "0", backgroundColor: "#0f1623", padding: "8px 16px" }}>
        {["Page / Area", "Status", "QA Guidance / Notes", "Target Date", ""].map((h, i) => (
          <div key={i} style={{ fontSize: "9px", fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {visible.length === 0 ? (
        <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#94a3b8" }}>No screens match this filter.</div>
      ) : visible.map((row, i) => {
        const realIdx = screens.indexOf(row);
        const isEditing = editingIdx === realIdx;
        const st = STATUS_STYLE[row.status];
        return (
          <div key={row.page} style={{ display: "grid", gridTemplateColumns: "200px 150px 1fr 200px 70px", gap: "0", padding: "10px 16px", borderBottom: i < visible.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "start", backgroundColor: isEditing ? "#f0f9ff" : "transparent" }}>
            {/* Page */}
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", paddingRight: "12px" }}>{row.page}</div>
            {/* Status */}
            <div>
              {isEditing ? (
                <select value={editDraft.status ?? row.status} onChange={e => setEditDraft(d => ({ ...d, status: e.target.value as ScreenStatus }))} style={{ fontSize: "11px", padding: "4px 6px", border: "1px solid #e2e8f0", borderRadius: "5px", width: "100%" }}>
                  {ALL_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 700, padding: "3px 9px", borderRadius: "10px", backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                  <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: st.dot, flexShrink: 0, display: "inline-block" }} />
                  {row.status}
                </span>
              )}
            </div>
            {/* Notes */}
            <div style={{ paddingRight: "12px" }}>
              {isEditing ? (
                <textarea value={editDraft.notes ?? row.notes} onChange={e => setEditDraft(d => ({ ...d, notes: e.target.value }))} rows={3} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px", resize: "vertical" }} />
              ) : (
                <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", whiteSpace: "pre-line" }}>{row.notes}</div>
              )}
            </div>
            {/* Target Date */}
            <div style={{ paddingRight: "12px" }}>
              {isEditing ? (
                <textarea value={editDraft.targetDate ?? row.targetDate} onChange={e => setEditDraft(d => ({ ...d, targetDate: e.target.value }))} rows={2} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px", resize: "vertical" }} />
              ) : (
                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.5", whiteSpace: "pre-line" }}>{row.targetDate}</div>
              )}
            </div>
            {/* Actions */}
            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
              {isEditing ? (
                <>
                  <button onClick={() => saveEdit(realIdx)} style={{ padding: "3px 8px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>Save</button>
                  <button onClick={() => { setEditingIdx(null); setEditDraft({}); }} style={{ padding: "3px 8px", backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "4px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>Cancel</button>
                </>
              ) : (
                <button onClick={() => startEdit(realIdx)} style={{ padding: "3px 8px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "4px", fontSize: "10px", fontWeight: 700, cursor: "pointer" }}>Edit</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
