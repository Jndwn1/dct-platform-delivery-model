import { useState } from "react";
import {
  countBy,
  DELIVERY_STATUSES,
  QA_READINESS_STATUSES,
  ROGER_MVP_MILESTONES,
  ROGER_MVP_SCREEN_RECORDS,
  ROGER_SCREEN_STATUS_STORAGE_KEY,
  type DeliveryStatus,
  type FunctionalStatus,
  type QAReadinessStatus,
  type RogerMvpScreenRecord,
} from "@/lib/rogerMvpScreenStatus";

const QA_STYLE: Record<QAReadinessStatus, { bg: string; text: string; border: string }> = {
  "Ready to Test": { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "Partially Ready": { bg: "#fefce8", text: "#854d0e", border: "#fde68a" },
  "Not Ready": { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
  "Out of Scope": { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
  "Not Functional": { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
};

const DELIVERY_STYLE: Record<DeliveryStatus, { bg: string; text: string; border: string }> = {
  Completed: { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" }, Done: { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  "In QA": { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }, "In Progress": { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  "Not Started": { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" }, "Out of Scope": { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
  "Not Functional": { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3" },
};

const FUNCTIONAL_STATUSES: FunctionalStatus[] = ["Functional (reported)", "Functional with dependencies", "Not stated", "Not functional"];
const inputStyle = { width: "100%", boxSizing: "border-box" as const, fontSize: "11px", padding: "5px", border: "1px solid #cbd5e1", borderRadius: "4px", fontFamily: "inherit" };

function Badge({ label, style }: { label: string; style: { bg: string; text: string; border: string } }) {
  return <span style={{ display: "inline-flex", alignItems: "center", fontSize: "10px", fontWeight: 700, padding: "3px 7px", borderRadius: "10px", backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`, whiteSpace: "nowrap" }}>{label}</span>;
}

function loadScreens() {
  try {
    const saved = localStorage.getItem(ROGER_SCREEN_STATUS_STORAGE_KEY);
    if (saved) {
      const records = JSON.parse(saved) as RogerMvpScreenRecord[];
      if (Array.isArray(records) && records.length) return records;
    }
  } catch { /* Current authoritative inventory is the fallback. */ }
  return ROGER_MVP_SCREEN_RECORDS;
}

export default function RogerScreenTestingStatus() {
  const [screens, setScreens] = useState<RogerMvpScreenRecord[]>(loadScreens);
  const [qaFilter, setQaFilter] = useState<QAReadinessStatus | "All">("All");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | "All">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RogerMvpScreenRecord | null>(null);

  const persist = (next: RogerMvpScreenRecord[]) => {
    setScreens(next);
    localStorage.setItem(ROGER_SCREEN_STATUS_STORAGE_KEY, JSON.stringify(next));
  };
  const visible = screens.filter(screen => (qaFilter === "All" || screen.qaReadinessStatus === qaFilter) && (deliveryFilter === "All" || screen.deliveryStatus === deliveryFilter));
  const save = () => {
    if (!draft) return;
    persist(screens.map(screen => screen.id === draft.id ? { ...draft, lastUpdated: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) } : screen));
    setEditingId(null); setDraft(null);
  };
  const cell = (value: string, tone = "#475569") => <div style={{ fontSize: "11px", color: tone, lineHeight: 1.42, whiteSpace: "pre-line" }}>{value}</div>;

  return (
    <section style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", marginTop: "28px" }}>
      <header style={{ backgroundColor: "#1e3a5f", padding: "16px 20px" }}>
        <div style={{ fontSize: "15px", fontWeight: 800, color: "#ffffff" }}>Roger Screen Testing Status</div>
        <div style={{ fontSize: "11px", color: "#bfdbfe", marginTop: "3px" }}>Authoritative Roger MVP screen lifecycle, QA readiness, dependencies, and milestone dates. Delivery status and QA readiness are distinct measures.</div>
      </header>

      <div style={{ padding: "14px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#1e3a5f", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>QA Readiness Status</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => setQaFilter("All")} style={{ minWidth: "96px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: qaFilter === "All" ? "#1e3a5f" : "#fff", color: qaFilter === "All" ? "#fff" : "#1e3a5f", cursor: "pointer" }}><strong style={{ fontSize: "19px" }}>{screens.length}</strong><div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase" }}>Total screens</div></button>
          {QA_READINESS_STATUSES.map(status => <button key={status} onClick={() => setQaFilter(status)} style={{ minWidth: "104px", padding: "8px 12px", borderRadius: "8px", border: `1px solid ${QA_STYLE[status].border}`, background: qaFilter === status ? QA_STYLE[status].text : QA_STYLE[status].bg, color: qaFilter === status ? "#fff" : QA_STYLE[status].text, cursor: "pointer" }}><strong style={{ fontSize: "19px" }}>{countBy(screens, "qaReadinessStatus", status)}</strong><div style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase" }}>{status}</div></button>)}
        </div>
        <div style={{ fontSize: "10px", fontWeight: 800, color: "#1e3a5f", letterSpacing: "0.08em", textTransform: "uppercase", margin: "14px 0 8px" }}>Delivery Status</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button onClick={() => setDeliveryFilter("All")} style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", background: deliveryFilter === "All" ? "#1e3a5f" : "#fff", color: deliveryFilter === "All" ? "#fff" : "#1e3a5f", border: "1px solid #cbd5e1" }}>All ({screens.length})</button>
          {DELIVERY_STATUSES.map(status => <button key={status} onClick={() => setDeliveryFilter(status)} style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, cursor: "pointer", background: deliveryFilter === status ? DELIVERY_STYLE[status].text : DELIVERY_STYLE[status].bg, color: deliveryFilter === status ? "#fff" : DELIVERY_STYLE[status].text, border: `1px solid ${DELIVERY_STYLE[status].border}` }}>{status} ({countBy(screens, "deliveryStatus", status)})</button>)}
        </div>
      </div>

      <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0" }}>
        <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#1e3a5f", margin: "0 0 10px" }}>Roger MVP — Key Milestone Dates</h3>
        <div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse", fontSize: "11px" }}><thead><tr style={{ backgroundColor: "#eef2f7" }}>{["Milestone", "Owner(s)", "Date", "Status / Notes"].map(head => <th key={head} style={{ textAlign: "left", padding: "8px", color: "#1e3a5f", fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{head}</th>)}</tr></thead><tbody>{ROGER_MVP_MILESTONES.map(milestone => <tr key={milestone.milestone} style={{ borderTop: "1px solid #e2e8f0" }}><td style={{ padding: "8px", color: "#0f172a", fontWeight: 700 }}>{milestone.milestone}</td><td style={{ padding: "8px", color: "#475569" }}>{milestone.owners}</td><td style={{ padding: "8px", color: milestone.date === "TBD" ? "#92400e" : "#166534", fontWeight: 800 }}>{milestone.date}</td><td style={{ padding: "8px", color: "#475569", lineHeight: 1.4 }}>{milestone.notes}</td></tr>)}</tbody></table></div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "1550px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "165px 115px 125px 125px 1fr 130px 105px 105px 115px 150px 82px", gap: "8px", backgroundColor: "#0f1623", padding: "9px 16px" }}>{["Screen / Area", "Delivery", "QA Readiness", "Functional", "What's Not Working / Dependency", "Dev Ready", "QA Ready", "UAT Ready", "Owner / Dependency", "Notes", ""].map((head, index) => <div key={`${head}-${index}`} style={{ color: "#bfdbfe", fontSize: "9px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>{head}</div>)}</div>
          {visible.map((screen, index) => {
            const editing = editingId === screen.id;
            const row = editing && draft ? draft : screen;
            const field = <K extends keyof RogerMvpScreenRecord>(key: K, rows = 2) => editing ? <textarea value={String(row[key])} onChange={event => setDraft({ ...row, [key]: event.target.value })} rows={rows} style={inputStyle} /> : cell(String(row[key]), row[key] === "TBD" ? "#92400e" : "#475569");
            return <div key={screen.id} style={{ display: "grid", gridTemplateColumns: "165px 115px 125px 125px 1fr 130px 105px 105px 115px 150px 82px", gap: "8px", alignItems: "start", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", backgroundColor: editing ? "#eff6ff" : index % 2 ? "#f8fafc" : "#fff" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>{row.screen}<div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>Updated {row.lastUpdated}</div></div>
              <div>{editing ? <select value={row.deliveryStatus} onChange={event => setDraft({ ...row, deliveryStatus: event.target.value as DeliveryStatus })} style={inputStyle}>{DELIVERY_STATUSES.map(status => <option key={status}>{status}</option>)}</select> : <Badge label={row.deliveryStatus} style={DELIVERY_STYLE[row.deliveryStatus]} />}</div>
              <div>{editing ? <select value={row.qaReadinessStatus} onChange={event => setDraft({ ...row, qaReadinessStatus: event.target.value as QAReadinessStatus })} style={inputStyle}>{QA_READINESS_STATUSES.map(status => <option key={status}>{status}</option>)}</select> : <Badge label={row.qaReadinessStatus} style={QA_STYLE[row.qaReadinessStatus]} />}</div>
              <div>{editing ? <select value={row.functionalStatus} onChange={event => setDraft({ ...row, functionalStatus: event.target.value as FunctionalStatus })} style={inputStyle}>{FUNCTIONAL_STATUSES.map(status => <option key={status}>{status}</option>)}</select> : cell(row.functionalStatus)}</div>
              <div>{field("dependency", 3)}</div><div>{field("devReady", 2)}</div><div>{field("qaReady", 2)}</div><div>{field("uatReady", 2)}</div><div>{field("owner", 2)}</div><div>{field("notes", 3)}</div>
              <div>{editing ? <><button onClick={save} style={{ display: "block", width: "100%", padding: "4px", marginBottom: "4px", border: "none", borderRadius: "4px", background: "#059669", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save</button><button onClick={() => { setEditingId(null); setDraft(null); }} style={{ display: "block", width: "100%", padding: "4px", border: "1px solid #cbd5e1", borderRadius: "4px", background: "#fff", color: "#475569", fontWeight: 700, cursor: "pointer" }}>Cancel</button></> : <button onClick={() => { setEditingId(screen.id); setDraft({ ...screen }); }} style={{ width: "100%", padding: "4px", border: "1px solid #bfdbfe", borderRadius: "4px", background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, cursor: "pointer" }}>Edit</button>}</div>
            </div>;
          })}
          {visible.length === 0 && <div style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No screens match both selected filters.</div>}
        </div>
      </div>
    </section>
  );
}
