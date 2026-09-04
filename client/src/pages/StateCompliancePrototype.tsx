import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Database,
  FilePlus2,
  FolderClock,
  History,
  Link2,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Send,
  SlidersHorizontal,
  Table2,
  TriangleAlert,
} from "lucide-react";

type WorkflowId = "inputs" | "apportionment" | "modifications" | "payments" | "control" | "accrual" | "outputs";
type FactorId = "Property" | "Payroll" | "Sales";
type InputView = "factor" | "mapping";

type StateDeliverable = {
  state: string;
  code: string;
  type: string;
  form: string;
  status: "In progress" | "Review" | "Not started";
  progress: number;
  issues: number;
  statutoryDue: string;
  clientDue: string;
};

type StateFiler = {
  id: string;
  name: string;
  descriptor: string;
  designation: "Single Entity" | "Consolidated" | "Combined Unitary";
  returnStructure: string;
  progress: number;
  issues: number;
  nextStatutoryDue: string;
  nextClientDue: string;
  filings: StateDeliverable[];
};

const WORKFLOW_STEPS: { id: WorkflowId; label: string }[] = [
  { id: "inputs", label: "Apportionment Inputs" },
  { id: "apportionment", label: "Apportionment" },
  { id: "modifications", label: "State Modifications" },
  { id: "payments", label: "Payment Inputs" },
  { id: "control", label: "State Tax Control" },
  { id: "accrual", label: "State Tax Accrual" },
  { id: "outputs", label: "Outputs & Tracking" },
];

const FEDERAL_FILINGS = [
  { name: "Platforms Normandy Inc. — PPT", structure: "1120 consolidated", progress: 43, issues: 147 },
  { name: "Hutchings Yachting Inc. — PPT", structure: "1120", progress: 20, issues: 55 },
];

const STATE_FILERS: StateFiler[] = [
  {
    id: "core-group",
    name: "Platforms Normandy State Combined Group",
    descriptor: "Income + Franchise · Unitary · TIM-seeded",
    designation: "Combined Unitary",
    returnStructure: "3-member group",
    progress: 55,
    issues: 3,
    nextStatutoryDue: "Oct 15, 2026",
    nextClientDue: "Sep 30, 2026",
    filings: [
      { state: "California", code: "CA", type: "Income", form: "CA 100", status: "In progress", progress: 75, issues: 1, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026" },
      { state: "New York", code: "NY", type: "Franchise", form: "CT-3", status: "Review", progress: 90, issues: 0, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026" },
      { state: "Illinois", code: "IL", type: "Income", form: "IL-1120", status: "Not started", progress: 0, issues: 2, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026" },
    ],
  },
  {
    id: "separate-filer",
    name: "Platforms Normandy Inc. — Separate State Filer",
    descriptor: "Franchise + Income · Non-unitary · TIM-seeded",
    designation: "Single Entity",
    returnStructure: "1 parent entity",
    progress: 15,
    issues: 0,
    nextStatutoryDue: "Aug 15, 2026",
    nextClientDue: "Aug 8, 2026",
    filings: [
      { state: "Texas", code: "TX", type: "Franchise", form: "05-102", status: "In progress", progress: 15, issues: 0, statutoryDue: "May 15, 2027", clientDue: "Apr 30, 2027" },
      { state: "Massachusetts", code: "MA", type: "Income", form: "355C", status: "Not started", progress: 0, issues: 0, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026" },
    ],
  },
  {
    id: "animal-tower",
    name: "Animal Tower Inc.",
    descriptor: "Annual · Non-unitary · Roger supplemental",
    designation: "Single Entity",
    returnStructure: "1 parent entity",
    progress: 58,
    issues: 1,
    nextStatutoryDue: "Oct 15, 2026",
    nextClientDue: "Oct 1, 2026",
    filings: [
      { state: "California", code: "CA", type: "Income", form: "CA 100", status: "In progress", progress: 58, issues: 1, statutoryDue: "Oct 15, 2026", clientDue: "Oct 1, 2026" },
    ],
  },
];

const ACTIVE_STATES = ["California", "New York", "Texas", "Illinois", "Massachusetts"] as const;
const STATE_CODES: Record<(typeof ACTIVE_STATES)[number], string> = { California: "CA", "New York": "NY", Texas: "TX", Illinois: "IL", Massachusetts: "MA" };
const STYLE = { navy: "#003865", blue: "#00a3d9", orange: "#e57f23", green: "#2f9e44", paleBlue: "#eff9fd", border: "#d8dee4", muted: "#64748b", ink: "#253341", page: "#f5f6f7" };

function ActionButton({ children, onClick, variant = "secondary", disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "text"; disabled?: boolean }) {
  const style = variant === "primary"
    ? { color: "#fff", background: STYLE.blue, border: `1px solid ${STYLE.blue}` }
    : variant === "text"
      ? { color: "#0878aa", background: "transparent", border: "1px solid transparent" }
      : { color: "#0878aa", background: "#fff", border: `1px solid #a6d7e9` };
  return <button onClick={onClick} disabled={disabled} style={{ ...style, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, borderRadius: 3, padding: "6px 9px", fontSize: 11, fontWeight: 700, cursor: disabled ? "default" : "pointer", opacity: disabled ? .5 : 1 }}>{children}</button>;
}

function ProgressBar({ value, color = STYLE.blue }: { value: number; color?: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 76 }}><div style={{ height: 5, width: 48, borderRadius: 4, background: "#e4e9ed", overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", borderRadius: 4, background: color }} /></div><span style={{ fontSize: 10, color: STYLE.muted }}>{value}%</span></div>;
}

function IssuePill({ issues }: { issues: number }) {
  if (!issues) return <span style={{ color: "#1f7a31", fontSize: 10, fontWeight: 700 }}>0</span>;
  return <span style={{ color: "#b91c1c", background: "#fee2e2", borderRadius: 11, padding: "3px 7px", fontSize: 10, fontWeight: 700 }}>{issues} {issues === 1 ? "issue" : "issues"}</span>;
}

function StateStatus({ status }: { status: StateDeliverable["status"] }) {
  const tone = status === "Review" ? { bg: "#e9f7ec", color: "#1f7a31" } : status === "In progress" ? { bg: "#e9f5fb", color: "#0878aa" } : { bg: "#f1f3f5", color: "#64748b" };
  return <span style={{ display: "inline-flex", whiteSpace: "nowrap", borderRadius: 11, padding: "3px 7px", background: tone.bg, color: tone.color, fontSize: 10, fontWeight: 700 }}>{status}</span>;
}

function RogerTopBar({ title, breadcrumb, onBack }: { title: string; breadcrumb: string; onBack?: () => void }) {
  return <>
    <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: `1px solid ${STYLE.border}`, padding: "0 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, color: "#475569" }}><strong style={{ color: "#3f9ab5", fontSize: 18, fontWeight: 500 }}>myRSM Tax</strong><span style={{ height: 20, borderLeft: "1px solid #cbd5e1" }} /><strong style={{ color: STYLE.navy, fontSize: 17, letterSpacing: "-0.05em" }}>r<span style={{ color: STYLE.blue }}>●</span>ger</strong></div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#64748b" }}><Bell size={16} /><span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%", background: STYLE.blue, color: "white", fontSize: 11, fontWeight: 700 }}>JS</span></div>
    </div>
    <div style={{ minHeight: 54, display: "flex", alignItems: "center", background: STYLE.blue, color: "white", padding: "0 20px", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 13 }}><Menu size={18} /><span>Menu</span></div><Search size={18} />
      <div style={{ minWidth: 0, flex: 1, borderLeft: "1px solid rgba(255,255,255,.25)", paddingLeft: 18 }}><div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div><div style={{ fontSize: 10, opacity: .9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{breadcrumb}</div></div>
      {onBack && <ActionButton onClick={onBack} variant="text"><ChevronLeft size={14} /> Back</ActionButton>}
      <div style={{ fontSize: 10, textAlign: "right", whiteSpace: "nowrap" }}><strong style={{ display: "block", fontSize: 13 }}>2026</strong>Filing Tax Year</div>
    </div>
  </>;
}

function SectionHeader({ title, count, state }: { title: string; count?: number; state?: string }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: title === "Federal Compliance" ? "#fff2e8" : STYLE.paleBlue, border: `1px solid ${title === "Federal Compliance" ? "#f0cfb3" : "#cfe8f2"}`, borderLeft: `4px solid ${title === "Federal Compliance" ? STYLE.orange : STYLE.blue}`, padding: "10px 14px", borderRadius: "4px 4px 0 0" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ color: title === "Federal Compliance" ? STYLE.orange : "#0878aa", fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>{title}</span>{count !== undefined && <span style={{ minWidth: 18, height: 18, display: "grid", placeItems: "center", color: "#2f5f73", background: "#d9edf5", borderRadius: 10, fontSize: 9, fontWeight: 800 }}>{count}</span>}</div>{state && <span style={{ color: "#64748b", fontSize: 10 }}>{state}</span>}</div>;
}

function DataTable({ headers, rows, minWidth = 680 }: { headers: React.ReactNode[]; rows: React.ReactNode[][]; minWidth?: number }) {
  return <div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 4, overflowX: "auto", background: "white" }}><table style={{ width: "100%", minWidth, borderCollapse: "collapse", fontSize: 11 }}><thead><tr>{headers.map((header, index) => <th key={index} style={{ textAlign: "left", padding: "10px 12px", borderBottom: `1px solid ${STYLE.border}`, background: "#f8fafc", color: "#64748b", fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 800 }}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ padding: "10px 12px", borderBottom: rowIndex < rows.length - 1 ? "1px solid #e7ebef" : "none", color: "#334155", verticalAlign: "middle" }}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function StateFilerRow({ filer, expanded, onToggle, onOpen }: { filer: StateFiler; expanded: boolean; onToggle: () => void; onOpen: (filer: StateFiler) => void }) {
  const [designation, setDesignation] = useState(filer.designation);
  return <>
    <tr style={{ background: expanded ? "#f5fbfe" : "#fff" }}><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><button onClick={onToggle} aria-label={`${expanded ? "Collapse" : "Expand"} ${filer.name}`} style={{ border: 0, background: "transparent", padding: 0, marginRight: 8, color: "#0878aa", cursor: "pointer", verticalAlign: "middle" }}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button><strong style={{ color: "#334155" }}>{filer.name}</strong><div style={{ paddingLeft: 22, marginTop: 2, color: "#64748b", fontSize: 10 }}>{filer.descriptor}</div></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><select aria-label={`Filing designation for ${filer.name}`} value={designation} onChange={event => setDesignation(event.target.value as StateFiler["designation"])} style={{ width: "100%", border: "1px solid #b8ddea", borderRadius: 3, padding: "5px 7px", color: "#0878aa", fontSize: 10, background: "#fff" }}><option>Single Entity</option><option>Consolidated</option><option>Combined Unitary</option></select></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><strong>{filer.filings.length}</strong></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><div style={{ display: "flex", gap: 4, alignItems: "center" }}><span style={{ border: "1px solid #cfe8f2", color: "#0878aa", padding: "3px 5px", borderRadius: 3, fontSize: 9 }}>{filer.returnStructure}</span></div></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><ProgressBar value={filer.progress} /></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><IssuePill issues={filer.issues} /></td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}>{filer.nextStatutoryDue}</td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}>{filer.nextClientDue}</td><td style={{ padding: "11px 12px", borderBottom: `1px solid ${STYLE.border}` }}><ActionButton onClick={() => onOpen(filer)} variant="text">Open</ActionButton></td></tr>
    {expanded && filer.filings.map(filing => <tr key={`${filer.id}-${filing.code}`} style={{ background: "#fbfdfe" }}><td style={{ padding: "9px 12px 9px 42px", borderBottom: "1px solid #edf1f4" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ display: "grid", width: 20, height: 17, placeItems: "center", borderRadius: 3, background: "#e8f3f8", color: "#0878aa", fontSize: 9, fontWeight: 800 }}>{filing.code}</span>{filing.type === "Income" ? <a href="/state-compliance" aria-label={`Open State Compliance for ${filing.state} Income Tax Return`} style={{ color: "#0878aa", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: 2 }}>{filing.state} State Income Tax Return</a> : <strong>{filing.state} State {filing.type} Return</strong>}<span style={{ color: "#94a3b8", fontSize: 10 }}>TIM source</span></div></td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}>{filing.type}</td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}><strong>{filing.form}</strong></td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}><StateStatus status={filing.status} /></td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}><ProgressBar value={filing.progress} color={filing.status === "Review" ? STYLE.green : STYLE.blue} /></td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}><IssuePill issues={filing.issues} /></td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}>{filing.statutoryDue}</td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}>{filing.clientDue}</td><td style={{ padding: "9px 12px", borderBottom: "1px solid #edf1f4" }}><ActionButton onClick={() => onOpen(filer)} variant="text">Open</ActionButton></td></tr>)}
  </>;
}

function ReturnFilingsLanding({ onOpen }: { onOpen: (filer: StateFiler) => void }) {
  const [, navigate] = useLocation();
  const [expandedFiler, setExpandedFiler] = useState<string | null>("core-group");
  const [notice, setNotice] = useState<string | null>(null);
  const stateFilings = STATE_FILERS.reduce((count, filer) => count + filer.filings.length, 0);
  const stateIssues = STATE_FILERS.reduce((count, filer) => count + filer.issues, 0);
  return <div style={{ minHeight: "100vh", background: STYLE.page, color: STYLE.ink, fontFamily: "Inter, Arial, sans-serif" }}>
    <RogerTopBar title="Return Filings" breadcrumb="My Clients  /  Platforms Normandy  /  State Tax" onBack={() => navigate("/")} />
    <div style={{ display: "flex", minHeight: "calc(100vh - 102px)" }}><aside style={{ width: 190, flexShrink: 0, background: "#f0f1f2", borderRight: `1px solid ${STYLE.border}`, padding: "18px 14px", color: "#475569" }}><div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 700 }}><span style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 3, background: "#dfe3e7" }}>♟</span>My Clients</div></aside>
      <main style={{ minWidth: 0, flex: 1, padding: "20px 24px 38px", maxWidth: 1780 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16, gap: 16, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontWeight: 800, letterSpacing: ".08em", fontSize: 10 }}>STATE TAX / RETURN PORTFOLIO</div><h1 style={{ margin: "5px 0 4px", fontSize: 22, color: "#253341" }}>Return Filings</h1><div style={{ color: "#64748b", fontSize: 11 }}>Review filers and State filing deliverables without leaving the familiar Roger filing hierarchy.</div></div><div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}><ActionButton onClick={() => setNotice("A new State filer or filing group can be added during prototype review.")}><FilePlus2 size={13} /> Add filer / filing group</ActionButton><ActionButton onClick={() => setNotice("TIM refresh recorded for the State portfolio.")}><RefreshCw size={13} /> Refresh from TIM</ActionButton><ActionButton onClick={() => setNotice("TIM delta review opened for the State portfolio.")}><History size={13} /> Show changes from TIM</ActionButton></div></div>
        {notice && <div role="status" style={{ marginBottom: 13, padding: "9px 11px", background: STYLE.paleBlue, border: "1px solid #cfe8f2", borderRadius: 4, color: "#47616e", fontSize: 11 }}>{notice}</div>}
        <section style={{ marginBottom: 22 }}><SectionHeader title="Federal Compliance" count={FEDERAL_FILINGS.length} state="Existing Roger experience — unchanged" /><DataTable headers={["Filing name", "Return structure", "Progress", "Issue count", "Statutory due date", "Client due date"]} rows={FEDERAL_FILINGS.map(filing => [<div><strong>{filing.name}</strong><div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>Federal Compliance</div></div>, filing.structure, <ProgressBar value={filing.progress} />, <IssuePill issues={filing.issues} />, "Oct 15, 2026", "Sep 30, 2026"])} /></section>
        <section><SectionHeader title="State Compliance" state={`${STATE_FILERS.length} FILERS / ${stateFilings} FILINGS · ${stateIssues} open State issues`} /><div style={{ border: `1px solid ${STYLE.border}`, borderTop: 0, overflowX: "auto", background: "#fff" }}><table style={{ width: "100%", minWidth: 1040, borderCollapse: "collapse", fontSize: 11 }}><thead><tr>{["Filer / filing group", "Filing designation", "State filings / form", "Return structure", "Progress", "Issues", "Statutory due date", "Client due date", ""].map(header => <th key={header} style={{ textAlign: "left", padding: "10px 12px", background: "#f8fafc", color: "#64748b", fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 800, borderBottom: `1px solid ${STYLE.border}` }}>{header}</th>)}</tr></thead><tbody>{STATE_FILERS.map(filer => <StateFilerRow key={filer.id} filer={filer} expanded={expandedFiler === filer.id} onToggle={() => setExpandedFiler(expandedFiler === filer.id ? null : filer.id)} onOpen={() => onOpen(filer)} />)}</tbody></table></div><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "9px 11px", background: "#f8fcfe", border: "1px solid #cfe8f2", borderTop: 0, color: "#47616e", fontSize: 10 }}><span><strong>Filer first;</strong> State returns are indented child rows; parent filing designation and return structure remain at the filer level.</span><span style={{ fontWeight: 800, letterSpacing: ".04em" }}>TIM-SOURCED RECORDS REMAIN AUTHORITATIVE IN TIM</span></div></section>
        <div style={{ marginTop: 20, color: "#94a3b8", fontSize: 10 }}>Prototype assumption: values, entities, and statuses are illustrative; no tax calculation or external release has occurred.</div>
      </main></div>
  </div>;
}

function WorkflowNav({ activeStep, onStep }: { activeStep: WorkflowId; onStep: (id: WorkflowId) => void }) {
  const activeIndex = WORKFLOW_STEPS.findIndex(step => step.id === activeStep);
  return <div style={{ background: "#fff", borderBottom: `1px solid ${STYLE.border}`, padding: "16px 26px 14px", overflowX: "auto" }}><div style={{ minWidth: 820, display: "grid", gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, minmax(92px, 1fr))` }}>{WORKFLOW_STEPS.map((step, index) => { const active = step.id === activeStep; const complete = index < activeIndex; return <button key={step.id} onClick={() => onStep(step.id)} style={{ position: "relative", border: 0, background: "transparent", cursor: "pointer", padding: "0 3px", color: active ? "#0878aa" : complete ? STYLE.green : "#7b8794" }}>{index < WORKFLOW_STEPS.length - 1 && <span style={{ position: "absolute", left: "calc(50% + 13px)", right: "calc(-50% + 13px)", top: 10, height: 1, background: complete ? "#82c691" : "#d5dce3" }} />}<span style={{ position: "relative", zIndex: 1, width: 21, height: 21, margin: "0 auto 6px", display: "grid", placeItems: "center", borderRadius: "50%", background: complete ? STYLE.green : active ? STYLE.blue : "#e4e7eb", color: complete || active ? "#fff" : "#6b7280", fontSize: 9, fontWeight: 800 }}>{complete ? <Check size={13} /> : String(index + 1).padStart(2, "0")}</span><span style={{ display: "block", minHeight: 26, fontSize: 10, lineHeight: 1.2, fontWeight: active ? 800 : 600 }}>{step.label}</span><span style={{ display: "block", fontSize: 8, marginTop: 2, fontWeight: 800, letterSpacing: ".06em" }}>{active ? "CURRENT" : complete ? "REVIEWED" : "NEXT"}</span></button>; })}</div></div>;
}

function StateContextStrip({ filer }: { filer: StateFiler }) {
  return <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "8px 12px", background: "#f8fcfe", borderBottom: "1px solid #cfe8f2", color: "#47616e", fontSize: 10 }}><span><strong style={{ color: "#0878aa" }}>STATE FILING CONTEXT</strong></span><span>Filing Group / <strong>{filer.name.replace(" State Combined Group", " — Core group")}</strong></span><span>Designation / <strong>{filer.designation}</strong></span><span>Activated States / <strong>CA · NY · TX · IL · MA</strong></span></div>;
}

function InputsWorkspace() {
  const [factor, setFactor] = useState<FactorId>("Property");
  const [view, setView] = useState<InputView>("factor");
  const [reviewed, setReviewed] = useState(false);
  const factorConfig: Record<FactorId, { source: string; values: number[][]; total: string }> = {
    Property: { source: "Asset system + client property schedule · v.2026.08.28", values: [[5.2, 5.7, 3.9, 1.1], [5.8, 6.4, 4.3, 1.2], [3.1, 4.2, 2.1, 1.4], [3.4, 4.8, 2.3, 1.5], [8.6, 8.9, 5.6, 1.9]], total: "$108.2M" },
    Payroll: { source: "Payroll detail + client payroll schedule · v.2026.08.28", values: [[3.4, 1.2, 0.8, 0.4], [3.8, 1.5, 0.9, 0.5], [2.5, 0.9, 0.6, 0.2], [2.8, 1.1, 0.7, 0.3], [4.1, 1.6, 1.0, 0.5]], total: "$31.6M" },
    Sales: { source: "Federal receipts mapping + State sales schedule · v.2026.08.28", values: [[18.4, 5.7, 3.2, 0.8], [20.1, 6.2, 3.6, 0.9], [11.5, 3.4, 2.1, 0.5], [12.2, 3.8, 2.3, 0.6], [27.4, 8.1, 4.6, 1.2]], total: "$135.6M" },
  };
  const config = factorConfig[factor];
  const rows = ACTIVE_STATES.map((state, index) => [<div><strong>{state}</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>{STATE_CODES[state]} / {factor.toUpperCase()}</div></div>, index % 2 === 0 ? "BOY · roll-forward" : "EOY · client input", ...config.values[index].map((value, valueIndex) => <div style={{ display: "flex", alignItems: "center", gap: 2 }}><span style={{ color: "#94a3b8", fontSize: 9 }}>$M</span><input aria-label={`${state} ${factor} ${["Inventory", "Buildings", "Equipment", "Leaseholds"][valueIndex]} input`} type="number" defaultValue={value} style={{ width: 55, border: "1px solid #d7e3e9", borderRadius: 3, padding: "4px 5px", fontSize: 10, color: "#334155" }} /></div>), `$${config.values[index].reduce((sum, value) => sum + value, 0).toFixed(1)}M`, index === 3 ? "Manual input · client schedule" : index === 4 ? "Orchestrator · Aug close" : "Asset system carry-in", index === 3 ? "Manual input" : index === 4 ? "Needs review" : "Tied"]);
  return <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>01 / APPORTIONMENT INPUTS</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>Review factor inputs before calculation</h1></div><ActionButton variant="text"><Link2 size={13} /> Review approved filing footprint</ActionButton></div><div style={{ display: "flex", gap: 6, margin: "12px 0 16px", flexWrap: "wrap" }}>{(["Property", "Payroll", "Sales"] as FactorId[]).map(item => <ActionButton key={item} onClick={() => setFactor(item)} variant={factor === item ? "primary" : "secondary"}>{item} inputs</ActionButton>)}</div><div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 9 }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>INPUT REVIEW / {factor.toUpperCase()}</div><strong style={{ color: STYLE.ink, fontSize: 15 }}>{factor} inputs</strong><span style={{ color: STYLE.muted, fontSize: 10, marginLeft: 8 }}>SOURCE / {config.source}</span></div><div style={{ display: "flex", gap: 4 }}><ActionButton onClick={() => setView("factor")} variant={view === "factor" ? "primary" : "secondary"}><Table2 size={13} /> Factor inputs</ActionButton><ActionButton onClick={() => setView("mapping")} variant={view === "mapping" ? "primary" : "secondary"}><Link2 size={13} /> Mapping & tie-out</ActionButton></div></div>{view === "factor" ? <><DataTable minWidth={980} headers={["State / jurisdiction", `${factor} period`, "Inventory", "Buildings", "Equipment", "Leaseholds", "Cost / NBV", "Input source", "Review"]} rows={rows} /><div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, padding: "10px 12px", background: "#eef8fc", border: "1px solid #cfe8f2", color: "#2f5f73", fontSize: 10, flexWrap: "wrap" }}><strong>Category totals / Reviewed scope · {config.total}</strong><span>MANUAL EDITS RETAIN SOURCE CONTEXT</span></div></> : <DataTable headers={["Source mapping", "Business factor", "State treatment", "Tie-out result", "Reviewer"]} rows={[["TB property mapping / P-22", factor, "California + New York", "Tied", "DCT"], ["State tax source map", factor, "Texas + Illinois", "Needs review", "State team"], ["Client schedule", factor, "Massachusetts", "Manual input", "BA review"]]} /> }<div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, padding: "14px 16px", borderLeft: `3px solid ${STYLE.blue}`, background: "#fff", flexWrap: "wrap" }}><div><div style={{ fontSize: 10, fontWeight: 800, color: "#0878aa", letterSpacing: ".07em" }}>REVIEW GATE</div><strong style={{ fontSize: 12 }}>Confirm {factor} input totals and tie-out before calculation.</strong><div style={{ fontSize: 10, color: STYLE.muted, marginTop: 3 }}>REVIEW / CG · EVIDENCE / APPORT-INPUTS-03</div></div><div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}><ActionButton onClick={() => setReviewed(true)}><Check size={13} /> {reviewed ? `${factor} inputs reviewed` : `Mark ${factor} inputs reviewed`}</ActionButton><ActionButton variant="primary" disabled={!reviewed}><ChevronRight size={13} /> Apply reviewed inputs to Apportionment calculation</ActionButton></div></div></>;
}

function ApportionmentWorkspace() {
  const [state, setState] = useState("California");
  const [factor, setFactor] = useState<FactorId>("Property");
  const factorCards: { factor: FactorId; current: string; inputs: string; prior: string; source: string }[] = [{ factor: "Property", current: "4.20%", inputs: "$21.0M · $500.0M", prior: "3.94%", source: "TB property mapping / P-22" }, { factor: "Sales", current: "10.40%", inputs: "$260.0M · $2.5B", prior: "9.86%", source: "Federal receipts mapping / S-18" }, { factor: "Payroll", current: "3.75%", inputs: "$15.0M · $400.0M", prior: "3.58%", source: "Federal Form 940 / PR-04" }];
  const selected = factorCards.find(card => card.factor === factor) ?? factorCards[0];
  return <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>02 / APPORTIONMENT CONTROL CENTER</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>Review calculated factors</h1></div><ActionButton variant="text"><ChevronLeft size={13} /> Return to reviewed inputs</ActionButton></div><div style={{ display: "flex", gap: 16, padding: "9px 0", marginBottom: 15, borderTop: "1px solid #d9e6ec", borderBottom: "1px solid #d9e6ec", flexWrap: "wrap" }}><label style={{ fontSize: 10, color: STYLE.muted }}>FILING <select value={state} onChange={event => setState(event.target.value)} style={{ marginLeft: 6, border: "1px solid #b8ddea", borderRadius: 3, padding: "4px 6px", color: "#0878aa", fontSize: 10 }}><option>California</option><option>New York</option><option>Texas</option></select></label><label style={{ fontSize: 10, color: STYLE.muted }}>ENTITY SCOPE <select style={{ marginLeft: 6, border: "1px solid #b8ddea", borderRadius: 3, padding: "4px 6px", color: "#0878aa", fontSize: 10 }}><option>Combined filing (3 entities)</option><option>Platforms Normandy Inc.</option><option>Animal Tower Inc.</option></select></label></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: 12, marginBottom: 20 }}>{factorCards.map(card => <button key={card.factor} onClick={() => setFactor(card.factor)} style={{ textAlign: "left", padding: 14, border: `1px solid ${factor === card.factor ? STYLE.blue : STYLE.border}`, background: "#fff", borderRadius: 4, cursor: "pointer", boxShadow: factor === card.factor ? "0 0 0 1px #b8e3f0" : "none" }}><div style={{ color: "#64748b", fontSize: 9, fontWeight: 800, letterSpacing: ".06em" }}>CALCULATED FACTOR / {card.factor.toUpperCase()}</div><div style={{ fontSize: 24, fontWeight: 800, color: "#0878aa", margin: "6px 0" }}>{card.current}</div><div style={{ color: STYLE.muted, fontSize: 10 }}>CY / {card.inputs}</div><div style={{ borderTop: "1px solid #e9eef1", marginTop: 8, paddingTop: 7, fontSize: 10, color: "#54707d" }}>PY factor <strong style={{ color: "#0878aa" }}>{card.prior}</strong><br />SOURCE / {card.source}</div></button>)}</div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 12, marginBottom: 8, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>FACTOR REVIEW / {factor.toUpperCase()}</div><h2 style={{ margin: "4px 0", fontSize: 16 }}>Property calculated-factor review</h2></div><span style={{ color: STYLE.muted, fontSize: 10 }}>YEAR-OVER-YEAR / {selected.current} CY factor · {selected.prior} PY factor</span></div><DataTable minWidth={900} headers={["Entity contributor", "Numerator", "Denominator", "CY factor", "PY factor", "Evidence", "Status"]} rows={[[<div><strong>Combined filing / all entities</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>ROLLUP / REVIEWED SCOPE</div></div>, "$21.0M", "$500.0M", "4.20%", "3.94%", "17 files", <StateStatus status="Review" />], [<div><strong>Platforms Normandy Inc.</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>Parent contributor</div></div>, "$12.4M", "$300.0M", "4.13%", "3.88%", "8 files", "Tied"], [<div><strong>Animal Tower Inc.</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>Member contributor</div></div>, "$5.8M", "$120.0M", "4.83%", "4.45%", "5 files", "Needs review"], [<div><strong>Hutchings Yachting Inc.</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>Member contributor</div></div>, "$2.8M", "$80.0M", "3.50%", "3.12%", "4 files", "Tied"]]} /><div style={{ marginTop: 20, color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>STATE APPT SUMMARY / NEXUS STATES</div><h2 style={{ margin: "5px 0 9px", fontSize: 16 }}>Weighted apportionment by State</h2><DataTable headers={["State", "Property factor", "Payroll factor", "Sales factor", "Weighted appt %"]} rows={[["California · CA", "4.20%", "3.75%", "31.25%", "13.07%"], ["New York · NY", "2.94%", "6.80%", "24.29%", "11.34%"], ["Texas · TX", "6.30%", "5.10%", "21.07%", "10.82%"], ["Illinois · IL", "3.56%", "4.22%", "14.86%", "7.55%"], ["Massachusetts · MA", "2.71%", "3.90%", "12.44%", "6.35%"]]} />{state && <span style={{ display: "none" }}>{state}</span>}</>;
}

function ModificationsWorkspace() {
  const [modification, setModification] = useState("Federal Bonus / Federal Depreciation");
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const rows = [["Platforms Normandy Inc.", [1320, 1400, 1480, 1560]], ["Animal Tower Inc.", [890, 970, 1050, 1130]], ["Hutchings Yachting Inc.", [460, 540, 620, 700]]];
  return <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>03 / STATE MODIFICATIONS</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>Review State modifications</h1></div><ActionButton variant="text">Next modification <ChevronRight size={13} /></ActionButton></div><div style={{ display: "flex", gap: 9, alignItems: "center", padding: "9px 0", borderTop: "1px solid #d9e6ec", borderBottom: "1px solid #d9e6ec", flexWrap: "wrap" }}><label style={{ color: STYLE.muted, fontSize: 10 }}>SELECT MODIFICATION <select value={modification} onChange={event => setModification(event.target.value)} style={{ marginLeft: 5, border: "1px solid #b8ddea", borderRadius: 3, padding: "4px 6px", color: "#0878aa", fontSize: 10 }}><option>Federal Bonus / Federal Depreciation</option><option>Federal Gain / Loss</option><option>Section 163(j) Business Interest Expense</option><option>Federal Charitable Contributions</option><option>State Income Taxes</option><option>Federal NOL</option></select></label><span style={{ borderRadius: 3, padding: "3px 6px", color: "#0878aa", background: "#eaf6fb", fontSize: 9 }}>Addition</span><span style={{ borderRadius: 3, padding: "3px 6px", color: "#0878aa", background: "#eaf6fb", fontSize: 9 }}>PY candidate</span><span style={{ color: STYLE.muted, fontSize: 9 }}>NEXUS / 4 STATES</span></div><div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".07em" }}>MODIFICATION / ADDITION</div><h2 style={{ margin: "4px 0", fontSize: 16 }}>{modification}</h2><div style={{ color: STYLE.muted, fontSize: 10 }}>Nexus States across columns · filing-group entities down rows</div></div><ActionButton><FolderClock size={13} /> View Year 1 list</ActionButton></div><DataTable minWidth={1000} headers={["Filing-group entity", "California", "New York", "Texas", "Illinois", "Entity total", "Entity treatment"]} rows={[...rows.map(([entity, values]) => { const numeric = values as number[]; return [<div><strong>{entity as string}</strong><div style={{ fontSize: 9, color: "#94a3b8" }}>FILING-GROUP ENTITY</div></div>, ...numeric.map((value, index) => <div style={{ display: "flex", gap: 2, alignItems: "center" }}><span style={{ fontSize: 9, color: "#94a3b8" }}>$K</span><input aria-label={`${entity} ${ACTIVE_STATES[index]} ${modification}`} type="number" defaultValue={value} style={{ width: 62, border: "1px solid #d7e3e9", borderRadius: 3, padding: "4px 5px", fontSize: 10 }} /></div>), <strong>+${numeric.reduce((sum, value) => sum + value, 0).toLocaleString()}K</strong>, <ActionButton onClick={() => setApplied(prev => ({ ...prev, [entity as string]: true }))} variant={applied[entity as string] ? "primary" : "secondary"}><Check size={12} /> {applied[entity as string] ? "Applied to all States" : "Apply to all States"}</ActionButton>]; }), [<strong>State total</strong>, "+$2,670K", "+$2,910K", "+$3,150K", "+$3,390K", <strong>+$12,120K</strong>, "Reviewable"]]} /><div style={{ marginTop: 10, padding: "9px 11px", borderLeft: `3px solid ${STYLE.orange}`, background: "#fffaf3", color: "#76522b", fontSize: 10 }}>Year 1 uses a static common-modification list. Future Prior Year roll-forward inputs will flag and pre-populate review candidates.</div></>;
}

function PaymentsWorkspace() {
  const [cityExpanded, setCityExpanded] = useState(false);
  const rows = [["California", 1450, 2150, 2310, 2470, 2630, 420], ["New York", 0, 2245, 2412, 2578, 2742, 0], ["Texas", 0, 2340, 2514, 2686, 2854, 0], ["Illinois", 0, 2435, 2616, 2794, 2966, 0], ["Massachusetts", 0, 2480, 2670, 2860, 3050, 0], ["Other", 0, 0, 0, 0, 0, 0], ["Foreign", 0, 0, 0, 0, 0, 0]];
  return <><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>PAYMENT INPUTS / TAX YEAR 2026</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>State and local payment workpaper</h1><div style={{ color: STYLE.muted, fontSize: 11 }}>Editable amounts in thousands · activated State jurisdictions, Other, Foreign, and city write-ins.</div></div><div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}><ActionButton onClick={() => setCityExpanded(value => !value)}><ChevronDown size={13} /> {cityExpanded ? "Hide" : "Expand"} city write-ins (2)</ActionButton><ActionButton><Plus size={13} /> Add city / write-in</ActionButton></div></div><DataTable minWidth={1100} headers={["Jurisdiction", "PY overpayment applied", "Q1 estimated", "Q2 estimated", "Q3 estimated", "Q4 estimated", "Other payments / adj.", "Total CY payments"]} rows={rows.map(row => { const [jurisdiction, ...values] = row as [string, ...number[]]; const total = values.reduce((sum, value) => sum + value, 0); return [<div><strong>{jurisdiction}</strong><div style={{ color: "#94a3b8", fontSize: 9 }}>{jurisdiction === "Other" || jurisdiction === "Foreign" ? "SPECIAL JURISDICTION" : `${STATE_CODES[jurisdiction as keyof typeof STATE_CODES]} / STATE`}</div></div>, ...values.map((value, index) => <div style={{ display: "flex", gap: 2, alignItems: "center" }}><span style={{ fontSize: 9, color: "#94a3b8" }}>$K</span><input aria-label={`${jurisdiction} payment ${index + 1}`} type="number" defaultValue={value} style={{ width: 58, border: "1px solid #d7e3e9", borderRadius: 3, padding: "4px 5px", fontSize: 10 }} /></div>), <strong>${total.toLocaleString()}K</strong>]; })} />{cityExpanded && <div style={{ marginTop: 10, padding: "10px 12px", border: "1px solid #cfe8f2", background: STYLE.paleBlue, color: "#47616e", fontSize: 11 }}>City write-ins are expanded for prototype review. Local jurisdictions retain the same payment-period structure and direct-edit evidence.</div>}<div style={{ marginTop: 10, color: STYLE.muted, fontSize: 10 }}>Direct grid edits are retained for review. Payment tie-out to bank and voucher records is intentionally deferred for this prototype.</div></>;
}

function ControlWorkspace() {
  const [retrieved, setRetrieved] = useState<string | null>(null);
  const sources = [["Federal TI", "v.2026.08.28", "Aug 28 · 14:42 ET"], ["Federal NOL", "v.2026.08.28", "Aug 28 · 14:42 ET"], ["Apportionment %", "v.2026.08.30", "Aug 30 · 09:18 ET"], ["Payments", "v.2026.08.29", "Aug 29 · 16:06 ET"]];
  const values = [
    ["Federal TI reconciliation", "$18,464,000", "$18,464,000", "$18,464,000", "$18,464,000", "$18,464,000", "$92,320,000", "RETRIEVED"],
    ["Adjusted Federal Taxable Income", "$18,464,000", "$18,464,000", "$18,464,000", "$18,464,000", "$18,464,000", "$92,320,000", "CALCULATED"],
    ["State additions", "$497,000", "$350,000", "$149,000", "$160,000", "$120,000", "$1,276,000", "RETRIEVED"],
    ["State subtractions", "−$138,000", "−$109,000", "−$24,000", "−$70,000", "−$53,000", "−$394,000", "RETRIEVED"],
    ["Taxable Income After State Modifications", "$18,823,000", "$18,705,000", "$18,589,000", "$18,554,000", "$18,531,000", "$93,202,000", "CALCULATED"],
    ["Allocable Income / (Loss)", "$382,000", "$215,000", "$0", "$98,000", "$76,000", "$771,000", "INPUT"],
    ["Federal NOL carryforward", "−$310,000", "−$180,000", "$0", "−$150,000", "−$125,000", "−$765,000", "RETRIEVED"],
    ["Taxable Income to Apportion", "$18,131,000", "$18,310,000", "$18,589,000", "$18,306,000", "$18,330,000", "$91,666,000", "CALCULATED"],
    ["Weighted Apportionment %", "6.84%", "4.12%", "3.46%", "2.31%", "1.68%", "—", "RETRIEVED"],
    ["Apportioned Income", "$1,240,160", "$754,372", "$643,179", "$422,869", "$307,944", "$3,368,524", "CALCULATED"],
    ["State Taxable Income", "$1,002,160", "$499,372", "$643,179", "$295,869", "$238,944", "$2,679,524", "CALCULATED"],
    ["State tax rate", "8.84%", "7.25%", "0.75%", "9.50%", "8.00%", "—", "SYSTEM RATE"],
    ["State Income Tax Liability", "$88,591", "$36,204", "$4,824", "$28,108", "$19,116", "$176,842", "CALCULATED"],
    ["State credits", "$190,000", "$145,000", "$0", "$82,000", "$54,000", "−$471,000", "INPUT"],
    ["Other taxes", "$70,000", "$46,000", "$204,000", "$34,500", "$22,200", "$376,700", "INPUT"],
    ["Current-year payments", "$685,000", "$532,000", "$378,000", "$299,000", "$240,000", "$2,134,000", "RETRIEVED"],
    ["Return Due / (Overpayment)", "−$615,000", "−$486,000", "−$169,176", "−$264,500", "−$217,800", "−$1,752,476", "CALCULATED"],
  ];
  return <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>STATE TAX CONTROL / 5 NEXUS STATES</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>State taxable income to liability</h1></div><ActionButton onClick={() => setRetrieved("Available source inputs retrieved for review.")}><RefreshCw size={13} /> Retrieve available inputs</ActionButton></div>{retrieved && <div role="status" style={{ margin: "8px 0", color: "#2f5f73", fontSize: 10 }}>{retrieved}</div>}<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 10, margin: "14px 0" }}>{sources.map(([name, version, date]) => <div key={name} style={{ background: "#fff", border: `1px solid ${STYLE.border}`, borderRadius: 4, padding: 11 }}><div style={{ color: "#64748b", fontSize: 9, fontWeight: 800, letterSpacing: ".06em" }}>{name.toUpperCase()}</div><div style={{ color: "#0878aa", fontWeight: 800, fontSize: 10, marginTop: 4 }}>IN USE / {version}</div><div style={{ color: "#94a3b8", fontSize: 9, margin: "4px 0 7px" }}>{date}</div><ActionButton variant="text" onClick={() => setRetrieved(`${name} source retrieval recorded.`)}>Retrieve {name === "Federal TI" || name === "Payments" ? "new" : ""}</ActionButton></div>)}</div><DataTable minWidth={1150} headers={["Calculation component", "California", "New York", "Texas", "Illinois", "Massachusetts", "State total"]} rows={values.map(row => [<div><strong>{row[0]}</strong><span style={{ marginLeft: 6, color: row[7] === "INPUT" ? STYLE.orange : "#0878aa", fontSize: 8, fontWeight: 800 }}>{row[7]}</span></div>, ...row.slice(1, 7)])} /><div style={{ marginTop: 10, padding: "9px 11px", background: STYLE.paleBlue, border: "1px solid #cfe8f2", color: "#47616e", fontSize: 10 }}>Retrieved: Federal TI, Federal NOL, weighted apportionment, State modifications, and payments. Direct input: allocable income, State NOL, State credits, and other taxes.</div></>;
}

function AccrualWorkspace() {
  const [ran, setRan] = useState(false);
  const cards = [["Federal TI before accrual", "$3.24M", "Starting Federal taxable income"], ["State modifications", "$0.16M", "Applied across State footprint"], ["Accrual candidate", ran ? "$122.4K" : "$121.9K", "State liability before payments"], ["Iteration delta", ran ? "$8.9K" : "$2.4K", "Federal adjustment to compare"]];
  return <><div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12, flexWrap: "wrap" }}><div><div style={{ color: "#0878aa", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>06 / STATE TAX ACCRUAL</div><h1 style={{ margin: "6px 0", color: STYLE.ink, fontSize: 20 }}>State Tax Accrual</h1><div style={{ color: STYLE.muted, fontSize: 11 }}>A global, iterative calculation that prepares the final State tax accrual adjustment for Federal approval.</div></div><div style={{ display: "flex", gap: 7 }}><ActionButton><Database size={13} /> View Federal package</ActionButton><ActionButton onClick={() => setRan(true)} variant="primary"><RefreshCw size={13} /> Run iteration</ActionButton></div></div><div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 16, padding: "12px 14px", border: "1px solid #cfe8f2", borderRadius: 5, background: "#fff" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><RefreshCw size={16} color="#0878aa" /><div><strong style={{ fontSize: 12 }}>Global State tax accrual calculation</strong><div style={{ color: STYLE.muted, fontSize: 10 }}>No State drop-down: calculation iterates across the full State footprint.</div></div></div><span style={{ alignSelf: "start", color: "#9a6b1e", background: "#fff6dc", borderRadius: 9, padding: "3px 8px", fontSize: 9, fontWeight: 800 }}>Federal approval pending</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "15px 0 20px" }}>{cards.map(([label, value, detail], index) => <div key={label} style={{ background: "#fff", border: `1px solid ${index === 2 ? "#b8e4c0" : index === 3 ? "#f5dda0" : STYLE.border}`, borderTop: `3px solid ${index === 2 ? STYLE.green : index === 3 ? "#d9a21b" : STYLE.blue}`, borderRadius: 5, padding: 14 }}><div style={{ color: "#64748b", fontSize: 9, letterSpacing: ".06em", fontWeight: 800 }}>{label.toUpperCase()}</div><div style={{ fontSize: 22, fontWeight: 800, color: index === 2 ? "#1f7a31" : STYLE.ink, margin: "7px 0" }}>{value}</div><div style={{ color: STYLE.muted, fontSize: 10 }}>{detail}</div><div style={{ marginTop: 10, color: "#0878aa", fontSize: 9, fontWeight: 800 }}>STATE WORKPAPER / 2026</div></div>)}</div><div style={{ display: "grid", gridTemplateColumns: "minmax(260px, .7fr) minmax(0, 1.3fr)", gap: 16, background: "#fff", border: `1px solid ${STYLE.border}`, borderRadius: 5, padding: 16, marginBottom: 18 }}><div><div style={{ color: "#0878aa", fontSize: 10, letterSpacing: ".07em", fontWeight: 800 }}>CALCULATION PATH</div><h2 style={{ fontSize: 17, margin: "7px 0" }}>Iterate until the State accrual is prepared.</h2><p style={{ color: STYLE.muted, fontSize: 11, lineHeight: 1.5, margin: 0 }}>The final adjustment is prepared for the Federal workflow, where approval continues under the core Roger model.</p></div><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(100px, 1fr))", gap: 8 }}>{[["01", "Federal taxable income", "Before State tax accrual"], ["02", "State modifications", "Calculated and reviewed"], ["03", "State tax accrual", "Iterate State calculation"], ["04", "Federal workflow", "Prepared for approval"]].map(([number, label, detail]) => <div key={number} style={{ border: "1px solid #dce8ed", borderRadius: 4, padding: 10 }}><div style={{ color: "#0878aa", fontSize: 9, fontWeight: 800 }}>{number}</div><strong style={{ display: "block", fontSize: 10, margin: "6px 0" }}>{label}</strong><span style={{ color: STYLE.muted, fontSize: 9 }}>{detail}</span></div>)}</div></div><div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, .6fr)", gap: 16 }}><div><div style={{ color: "#0878aa", fontSize: 10, letterSpacing: ".07em", fontWeight: 800, marginBottom: 6 }}>ITERATION HISTORY</div><DataTable headers={["Run", "State liability pre-payments", "Federal adjustment delta", "Status", "Evidence"]} rows={[["Run 1 · State footprint", "$128,700", "$23,700", "Superseded", "View"], ["Run 2 · State footprint", "$124,800", "$12,300", "Superseded", "View"], ["Run 3 · State footprint", "$121,900", "$2,400", "Prepared", "View"], [ran ? "Run 5 · State footprint" : "Run 4 · State footprint", ran ? "$122,400" : "$122,400", ran ? "$8,900" : "$8,900", ran ? "In review" : "In review", "View"]]} /></div><div style={{ border: "1px solid #cfe8f2", background: STYLE.paleBlue, padding: 15, borderRadius: 5 }}><div style={{ color: "#0878aa", fontSize: 10, letterSpacing: ".07em", fontWeight: 800 }}>FEDERAL WORKFLOW HANDOFF</div><h3 style={{ margin: "7px 0", fontSize: 15 }}>Alert Federal when State accrual is prepared.</h3><p style={{ color: "#47616e", fontSize: 11, lineHeight: 1.5 }}>The State workspace prepares calculation and evidence. Core Roger Federal owns the final approval, release, and bookkeeping process.</p><ActionButton variant="primary"><Send size={13} /> Alert Federal workflow</ActionButton></div></div></>;
}

function OutputsWorkspace() {
  return <div style={{ display: "grid", minHeight: 360, placeItems: "center", border: "1px solid #cfe8f2", borderLeft: `3px solid ${STYLE.blue}`, background: "#fff", borderRadius: 5, textAlign: "center", padding: 28 }}><div><FolderClock size={28} color="#0878aa" style={{ margin: "0 auto 12px" }} /><div style={{ color: "#0878aa", fontSize: 10, letterSpacing: ".08em", fontWeight: 800 }}>STATE TAX / OUTPUTS & TRACKING</div><h1 style={{ margin: "7px 0", fontSize: 21, color: STYLE.ink }}>Coming soon</h1><p style={{ maxWidth: 400, color: STYLE.muted, fontSize: 12, lineHeight: 1.5 }}>This single State Tax workspace will house future outputs and tracking requirements.</p></div></div>;
}

function WorkflowWorkspace({ step }: { step: WorkflowId }) {
  if (step === "inputs") return <InputsWorkspace />;
  if (step === "apportionment") return <ApportionmentWorkspace />;
  if (step === "modifications") return <ModificationsWorkspace />;
  if (step === "payments") return <PaymentsWorkspace />;
  if (step === "control") return <ControlWorkspace />;
  if (step === "accrual") return <AccrualWorkspace />;
  return <OutputsWorkspace />;
}

function StateWorkflow({ filer, onBack }: { filer: StateFiler; onBack: () => void }) {
  const [activeStep, setActiveStep] = useState<WorkflowId>("inputs");
  const stepIndex = WORKFLOW_STEPS.findIndex(step => step.id === activeStep);
  const moveStep = (direction: -1 | 1) => setActiveStep(WORKFLOW_STEPS[Math.min(WORKFLOW_STEPS.length - 1, Math.max(0, stepIndex + direction))].id);
  return <div style={{ minHeight: "100vh", background: STYLE.page, color: STYLE.ink, fontFamily: "Inter, Arial, sans-serif" }}><RogerTopBar title={WORKFLOW_STEPS[stepIndex].label} breadcrumb={`My Clients  /  Platforms Normandy  /  State Tax  /  ${WORKFLOW_STEPS[stepIndex].label}`} onBack={onBack} /><div style={{ display: "flex", minHeight: "calc(100vh - 102px)" }}><aside style={{ width: 150, flexShrink: 0, background: "#f0f1f2", borderRight: `1px solid ${STYLE.border}`, padding: "18px 14px", color: "#475569" }}><div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 700 }}><span style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 3, background: "#dfe3e7" }}>♟</span>My Clients</div></aside><div style={{ minWidth: 0, flex: 1 }}><WorkflowNav activeStep={activeStep} onStep={setActiveStep} /><StateContextStrip filer={filer} /><section style={{ maxWidth: 1440, margin: "0 auto", padding: "26px 30px 36px" }}><WorkflowWorkspace step={activeStep} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, borderTop: `1px solid ${STYLE.border}`, paddingTop: 16 }}><ActionButton onClick={() => moveStep(-1)} disabled={stepIndex === 0}><ChevronLeft size={14} /> Previous</ActionButton><ActionButton onClick={() => moveStep(1)} variant="primary" disabled={stepIndex === WORKFLOW_STEPS.length - 1}>Next — {WORKFLOW_STEPS[Math.min(stepIndex + 1, WORKFLOW_STEPS.length - 1)].label}<ChevronRight size={14} /></ActionButton></div><div style={{ marginTop: 22, fontSize: 10, color: "#94a3b8" }}>Prototype data is illustrative and demonstrates the proposed State workflow only; it does not represent a tax calculation or release output.</div></section></div></div></div>;
}

export default function StateCompliancePrototype() {
  const [selectedFilerId, setSelectedFilerId] = useState<string | null>(null);
  const selectedFiler = useMemo(() => STATE_FILERS.find(filer => filer.id === selectedFilerId) ?? null, [selectedFilerId]);
  return selectedFiler ? <StateWorkflow filer={selectedFiler} onBack={() => setSelectedFilerId(null)} /> : <ReturnFilingsLanding onOpen={filer => setSelectedFilerId(filer.id)} />;
}
