import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Bell, ChevronLeft, ChevronRight, Check, Menu, Plus, Search, TriangleAlert } from "lucide-react";

type WorkflowId = "summary" | "footprint" | "inputs" | "apportionment" | "modifications" | "payments" | "control" | "accrual" | "outputs";

type StateFiling = {
  id: string;
  name: string;
  jurisdiction: string;
  designation: string;
  structure: string;
  entities: number;
  progress: number;
  issues: number;
  statutoryDue: string;
  clientDue: string;
  readiness: "Ready for review" | "Action required" | "In progress";
};

const WORKFLOW_STEPS: { id: WorkflowId; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "footprint", label: "Filing Footprint" },
  { id: "inputs", label: "Apportionment Inputs" },
  { id: "apportionment", label: "Apportionment" },
  { id: "modifications", label: "State Modifications" },
  { id: "payments", label: "Payment Inputs" },
  { id: "control", label: "State Tax Control" },
  { id: "accrual", label: "State Tax Accrual" },
  { id: "outputs", label: "Outputs & Tracking" },
];

const STATE_FILINGS: StateFiling[] = [
  { id: "ca", name: "Platforms Normandy Inc. — California Combined Return", jurisdiction: "California", designation: "Combined return", structure: "Unitary group", entities: 3, progress: 42, issues: 2, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026", readiness: "Action required" },
  { id: "ny", name: "Platforms Normandy Inc. — New York Combined Return", jurisdiction: "New York", designation: "Combined return", structure: "Unitary group", entities: 3, progress: 67, issues: 1, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026", readiness: "In progress" },
  { id: "il", name: "Midwest Consolidated Group — Illinois Combined Return", jurisdiction: "Illinois", designation: "Combined return", structure: "Consolidated group", entities: 2, progress: 75, issues: 0, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026", readiness: "Ready for review" },
  { id: "tx", name: "Texas Separate Filer — Texas Franchise Return", jurisdiction: "Texas", designation: "Separate return", structure: "Separate filer", entities: 1, progress: 58, issues: 1, statutoryDue: "May 15, 2027", clientDue: "Apr 30, 2027", readiness: "In progress" },
  { id: "ma", name: "Platforms Normandy Inc. — Massachusetts Combined Return", jurisdiction: "Massachusetts", designation: "Combined return", structure: "Unitary group", entities: 3, progress: 25, issues: 3, statutoryDue: "Oct 15, 2026", clientDue: "Sep 30, 2026", readiness: "Action required" },
];

const FEDERAL_FILINGS = [
  { name: "Platforms Normandy Inc. — PPT", structure: "1120 consolidated", progress: 43, issues: 147 },
  { name: "Hutchings Yachting Inc. — PPT", structure: "1120", progress: 20, issues: 55 },
];

const STYLE = {
  navy: "#003865",
  blue: "#00a3d9",
  orange: "#e57f23",
  green: "#2f9e44",
  paleBlue: "#eff9fd",
  border: "#d8dee4",
  muted: "#64748b",
  ink: "#253341",
  page: "#f5f6f7",
};

function ProgressBar({ value, color = STYLE.orange }: { value: number; color?: string }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ height: 6, flex: 1, maxWidth: 150, borderRadius: 4, background: "#e5e7eb", overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 4 }} /></div><span style={{ width: 28, fontSize: 11, color: STYLE.muted }}>{value}%</span></div>;
}

function StatusPill({ status }: { status: StateFiling["readiness"] }) {
  const tones = {
    "Ready for review": { bg: "#e9f7ec", color: "#1f7a31" },
    "Action required": { bg: "#fff0e2", color: "#b8520a" },
    "In progress": { bg: "#e9f5fb", color: "#0878aa" },
  }[status];
  return <span style={{ display: "inline-flex", whiteSpace: "nowrap", borderRadius: 12, padding: "3px 8px", background: tones.bg, color: tones.color, fontSize: 10, fontWeight: 700 }}>{status}</span>;
}

function RogerTopBar({ title, breadcrumb, onBack }: { title: string; breadcrumb: string; onBack?: () => void }) {
  return <>
    <div style={{ height: 48, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: `1px solid ${STYLE.border}`, padding: "0 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, color: "#475569" }}><strong style={{ color: "#3f9ab5", fontSize: 18, fontWeight: 500 }}>myRSM Tax</strong><span style={{ height: 20, borderLeft: "1px solid #cbd5e1" }} /><strong style={{ color: STYLE.navy, fontSize: 17, letterSpacing: "-0.05em" }}>r<span style={{ color: STYLE.blue }}>●</span>ger</strong></div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, color: "#64748b" }}><Bell size={16} /><span style={{ width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: "50%", background: STYLE.blue, color: "white", fontSize: 11, fontWeight: 700 }}>JS</span></div>
    </div>
    <div style={{ minHeight: 54, display: "flex", alignItems: "center", background: STYLE.blue, color: "white", padding: "0 20px", gap: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 13 }}><Menu size={18} /><span>Menu</span></div>
      <Search size={18} />
      <div style={{ minWidth: 0, flex: 1, borderLeft: "1px solid rgba(255,255,255,.25)", paddingLeft: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 10, opacity: .9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{breadcrumb}</div>
      </div>
      {onBack && <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,255,255,.65)", color: "white", background: "transparent", borderRadius: 3, padding: "6px 10px", fontSize: 11, cursor: "pointer" }}><ChevronLeft size={14} /> Back</button>}
      <div style={{ fontSize: 10, textAlign: "right", whiteSpace: "nowrap" }}><strong style={{ display: "block", fontSize: 13 }}>2026</strong>Filing Tax Year</div>
    </div>
  </>;
}

function SectionHeader({ title, count, state }: { title: string; count: number; state?: string }) {
  return <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff2e8", border: "1px solid #f0cfb3", borderLeft: `4px solid ${STYLE.orange}`, padding: "10px 14px", borderRadius: "4px 4px 0 0" }}><div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ color: STYLE.orange, fontSize: 11, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase" }}>{title}</span><span style={{ width: 18, height: 18, display: "grid", placeItems: "center", color: "#9a4c11", background: "#fde2c8", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>{count}</span></div>{state && <span style={{ color: "#6b7280", fontSize: 10 }}>{state}</span>}</div>;
}

function WorkflowNav({ activeStep, onStep }: { activeStep: WorkflowId; onStep: (id: WorkflowId) => void }) {
  const activeIndex = WORKFLOW_STEPS.findIndex(step => step.id === activeStep);
  return <div style={{ background: "#fff", borderBottom: `1px solid ${STYLE.border}`, padding: "16px 26px 14px", overflowX: "auto" }}>
    <div style={{ minWidth: 920, display: "grid", gridTemplateColumns: `repeat(${WORKFLOW_STEPS.length}, minmax(84px, 1fr))`, gap: 0 }}>
      {WORKFLOW_STEPS.map((step, index) => {
        const isActive = step.id === activeStep;
        const isComplete = index < activeIndex;
        return <button key={step.id} onClick={() => onStep(step.id)} style={{ position: "relative", border: 0, background: "transparent", cursor: "pointer", padding: "0 3px", color: isActive ? STYLE.orange : isComplete ? STYLE.green : "#7b8794" }}>
          {index < WORKFLOW_STEPS.length - 1 && <span style={{ position: "absolute", left: "calc(50% + 13px)", right: "calc(-50% + 13px)", top: 10, height: 1, background: isComplete ? "#82c691" : "#d5dce3" }} />}
          <span style={{ position: "relative", zIndex: 1, width: 21, height: 21, margin: "0 auto 6px", display: "grid", placeItems: "center", borderRadius: "50%", background: isComplete ? STYLE.green : isActive ? "#fff" : "#e4e7eb", border: isActive ? `2px solid ${STYLE.orange}` : "none", color: isComplete ? "#fff" : isActive ? STYLE.orange : "#6b7280", fontSize: 10, fontWeight: 800 }}>{isComplete ? <Check size={13} /> : index + 1}</span>
          <span style={{ display: "block", minHeight: 27, fontSize: 10, lineHeight: 1.22, fontWeight: isActive ? 800 : 600 }}>{step.label}</span>
        </button>;
      })}
    </div>
  </div>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 4, overflowX: "auto", background: "white" }}><table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse", fontSize: 11 }}><thead><tr>{headers.map(header => <th key={header} style={{ textAlign: "left", padding: "10px 12px", borderBottom: `1px solid ${STYLE.border}`, background: "#f8fafc", color: "#64748b", fontSize: 9, letterSpacing: ".05em", textTransform: "uppercase", fontWeight: 800 }}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} style={{ padding: "10px 12px", borderBottom: index < rows.length - 1 ? "1px solid #e7ebef" : "none", color: "#334155", verticalAlign: "middle" }}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function StateSummary({ filing }: { filing: StateFiling }) {
  const amountCards = [
    ["Federal taxable income", "($380,817.60)"], ["State modifications", "$14,250.00"], ["Apportioned income", "($125,648.00)"],
    ["State taxable income", "($111,398.00)"], ["Estimated state tax", "$9,802.00"], ["Payments / credits", "$7,500.00"], ["Balance due", "$2,302.00"],
  ];
  return <>
    <div style={{ borderLeft: `3px solid ${STYLE.orange}`, padding: "4px 0 5px 12px", marginBottom: 20, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><strong style={{ color: "#334155", fontSize: 13 }}>Not ready for sign-off</strong><div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>2 blockers require practitioner action before review.</div></div><button style={{ color: "#0878aa", background: "transparent", border: 0, fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Open blockers</button></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", borderTop: `1px solid ${STYLE.border}`, borderBottom: `1px solid ${STYLE.border}`, marginBottom: 24 }}>{amountCards.map(([label, value], index) => <div key={label} style={{ padding: "12px 14px", borderRight: index < amountCards.length - 1 ? "1px solid #e7ebef" : "none" }}><div style={{ color: "#6b7280", fontSize: 9, textTransform: "uppercase", fontWeight: 800, letterSpacing: ".05em" }}>{label}</div><div style={{ color: index === 3 ? STYLE.blue : "#334155", fontWeight: 800, fontSize: 16, marginTop: 4 }}>{value}</div></div>)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(300px, .75fr)", gap: 22 }}>
      <div><div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 }}>ENTITY / FILING GROUP</div><DataTable headers={["Filing designation", "State", "Filing group", "Entities", "Nexus"]} rows={[[filing.designation, filing.jurisdiction, filing.structure, `${filing.entities} included`, "Confirmed"]]} /></div>
      <div><div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: ".06em", marginBottom: 8 }}>WORKFLOW STATUS</div><div style={{ border: `1px solid ${STYLE.border}`, borderRadius: 4, padding: 12, background: "#fff" }}><div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}><TriangleAlert size={15} color={STYLE.orange} /><strong style={{ fontSize: 12, color: "#334155" }}>Action required</strong></div><div style={{ color: "#64748b", fontSize: 11, lineHeight: 1.55 }}>Filing footprint approval and apportionment input validation are required before the State Tax Control can be finalized.</div></div></div>
    </div>
  </>;
}

function FilingFootprint({ filing }: { filing: StateFiling }) {
  return <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(300px, .75fr)", gap: 22 }}><div><DataTable headers={["Jurisdiction", "Designation", "Filing group", "Nexus", "Entities", "Status"]} rows={[[filing.jurisdiction, filing.designation, filing.structure, "Confirmed", String(filing.entities), <StatusPill status={filing.readiness} />]]} /><div style={{ marginTop: 22 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><strong style={{ fontSize: 13, color: "#334155" }}>Included entities</strong><button style={{ display: "inline-flex", alignItems: "center", gap: 4, border: `1px solid ${STYLE.blue}`, background: "white", color: "#0878aa", borderRadius: 3, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}><Plus size={12} /> Add entity</button></div><DataTable headers={["Entity", "Entity ID", "Filing inclusion", "Source"]} rows={[["Platforms Normandy Inc.", "E-1001", "Included", "Federal roll-forward"], ["Animal Tower Inc.", "E-1014", "Included", "Prior-year State return"], ["Hutchings Yachting Inc.", "E-1022", "Included", "Practitioner confirmation"]]} /></div></div><div style={{ border: `1px solid ${STYLE.border}`, background: "#fff", borderRadius: 4, padding: 16 }}><div style={{ color: STYLE.orange, fontSize: 10, fontWeight: 800, letterSpacing: ".06em" }}>DETERMINATION EVIDENCE</div><h3 style={{ fontSize: 15, margin: "8px 0", color: "#253341" }}>Why this jurisdiction is in scope</h3><p style={{ color: "#64748b", fontSize: 12, lineHeight: 1.5, margin: 0 }}>Prior-year {filing.jurisdiction} filing retained for the selected {filing.structure.toLowerCase()}.</p><div style={{ marginTop: 20, display: "grid", gap: 12 }}><div><div style={{ color: "#64748b", fontSize: 9, fontWeight: 800 }}>NEXUS CONCLUSION</div><strong style={{ fontSize: 12, color: "#334155" }}>Confirmed</strong></div><div><div style={{ color: "#64748b", fontSize: 9, fontWeight: 800 }}>SOURCES</div><strong style={{ fontSize: 12, color: "#334155" }}>Prior-Year State Return · Federal Roll Forward</strong></div></div><button style={{ marginTop: 20, width: "100%", background: STYLE.blue, border: 0, borderRadius: 3, color: "white", fontSize: 11, padding: "8px 10px", fontWeight: 700, cursor: "pointer" }}>Review determination</button></div></div>;
}

function WorkflowWorkspace({ step, filing, overrideActive, onToggleOverride }: { step: WorkflowId; filing: StateFiling; overrideActive: boolean; onToggleOverride: () => void }) {
  const content: Record<Exclude<WorkflowId, "summary" | "footprint">, { eyebrow: string; title: string; description: string; headers: string[]; rows: React.ReactNode[][] }> = {
    inputs: { eyebrow: "APPORTIONMENT INPUTS", title: "Required State apportionment inputs", description: "Review source amounts and resolve validation items before calculating the State percentage.", headers: ["Factor", "Numerator", "Denominator", "Expected %", "Actual / override", "Source", "Validation"], rows: [["Property", "$1,840,000", "$8,600,000", "21.40%", "21.40%", "Trial balance", "Validated"], ["Payroll", "$3,210,000", "$12,450,000", "25.78%", "25.78%", "Payroll detail", "Validated"], ["Sales / receipts", "$19,455,000", "$73,200,000", "26.58%", "Pending review", "Sales detail", "Action required"]] },
    apportionment: { eyebrow: "APPORTIONMENT", title: `${filing.jurisdiction} apportionment calculation`, description: "Compare calculated and authorized percentages before applying the result to State taxable income.", headers: ["Numerator", "Denominator", "Expected %", "Actual %", "Override", "Calculation status", "Source / version"], rows: [["$19,455,000", "$73,200,000", "26.58%", overrideActive ? "26.25%" : "26.58%", overrideActive ? "Authorized" : "None", "Ready for review", "Sales detail · v2026.3"]] },
    modifications: { eyebrow: "STATE MODIFICATIONS", title: "State modification review", description: "Use the familiar Book-to-Tax review pattern to evaluate required State modifications.", headers: ["Modification", "Code", "Category", "Source amount", "Adjustment", "Entity", "Status", "Action"], rows: [["Depreciation adjustment", "CA-179", "Addition", "$54,200", "$8,300", "Platforms Normandy", "Review", "Review"], ["State tax add-back", "CA-STX", "Addition", "$26,450", "$5,950", "Platforms Normandy", "Ready", "Approve"], ["NOL carryforward", "CA-NOL", "Subtraction", "$0", "($0)", "Consolidated", "Pending", "Review"]] },
    payments: { eyebrow: "PAYMENT INPUTS", title: "State payments and credits", description: "Confirm payment sources and amounts before State Tax Control calculates the expected balance.", headers: ["Payment type", "Source", "Amount", "Entity / group", "Status"], rows: [["Estimated payment", "Treasury confirmation", "$4,500.00", "Platforms Normandy group", "Validated"], ["Extension payment", "Prior-year workpaper", "$3,000.00", "Platforms Normandy group", "Validated"], ["Prior-year overpayment", "State return", "$0.00", "Platforms Normandy group", "Not applied"]] },
    control: { eyebrow: "STATE TAX CONTROL", title: "State taxable income reconciliation", description: "Surface calculation differences before sign-off using the State-specific control bridge.", headers: ["Control line", "Calculated", "Expected", "Difference", "Status"], rows: [["Federal taxable income", "($380,817.60)", "($380,817.60)", "$0.00", "Reconciled"], ["State modifications", "$14,250.00", "$14,250.00", "$0.00", "Reconciled"], ["Apportioned income", "($125,648.00)", "($125,648.00)", "$0.00", "Reconciled"], ["Expected balance due", "$2,302.00", "$2,302.00", "$0.00", "Reconciled"]] },
    accrual: { eyebrow: "STATE TAX ACCRUAL", title: "Calculated State provision / accrual", description: "Review the MVP State accrual view using the same Roger headers, progress indicators, and status treatment.", headers: ["Accrual component", "Current provision", "Deferred tax", "Total accrual", "Status"], rows: [["Income tax expense", "$9,802.00", "$0.00", "$9,802.00", "Ready for review"], ["State tax payable", "$2,302.00", "$0.00", "$2,302.00", "Pending approval"]] },
    outputs: { eyebrow: "OUTPUTS & TRACKING", title: "State deliverables", description: "Track generated and expected State work products for the selected filing.", headers: ["Deliverable", "Owner", "Status", "Last updated", "Action"], rows: [["State return", "Tax team", "In progress", "Sep 2, 2026", "Open"], ["Supporting schedule", "Tax team", "Ready for review", "Sep 2, 2026", "Review"], ["State workpaper", "Tax team", "Approved", "Sep 1, 2026", "Open"], ["Calculation output", "System", "Generated", "Sep 2, 2026", "Download"]] },
  };
  if (step === "summary") return <StateSummary filing={filing} />;
  if (step === "footprint") return <FilingFootprint filing={filing} />;
  const view = content[step];
  return <><div style={{ color: STYLE.orange, fontSize: 10, fontWeight: 800, letterSpacing: ".07em", marginBottom: 7 }}>{view.eyebrow}</div><h2 style={{ color: "#253341", fontSize: 18, margin: "0 0 6px" }}>{view.title}</h2><p style={{ color: "#64748b", fontSize: 12, margin: "0 0 18px", lineHeight: 1.5 }}>{view.description}</p>{step === "apportionment" && <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}><button onClick={onToggleOverride} style={{ border: `1px solid ${STYLE.orange}`, color: "#a94e10", background: overrideActive ? "#fff1e7" : "white", borderRadius: 3, padding: "6px 9px", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>{overrideActive ? "Remove authorized override" : "Record authorized override"}</button></div>}<DataTable headers={view.headers} rows={view.rows} />{step === "inputs" && <div style={{ marginTop: 14, color: "#9a4c11", background: "#fff9ed", border: "1px solid #f6dfb1", padding: "9px 11px", borderRadius: 4, fontSize: 11 }}><strong>Validation required:</strong> Sales / receipts numerator requires practitioner confirmation before calculation review.</div>}</>;
}

export default function StateCompliancePrototype() {
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<WorkflowId>("summary");
  const [overrideActive, setOverrideActive] = useState(false);
  const selectedFiling = useMemo(() => STATE_FILINGS.find(filing => filing.id === selectedId) ?? null, [selectedId]);
  const stepIndex = WORKFLOW_STEPS.findIndex(step => step.id === activeStep);
  const openFiling = (filing: StateFiling) => { setSelectedId(filing.id); setActiveStep("summary"); setOverrideActive(false); };
  const moveStep = (direction: -1 | 1) => setActiveStep(WORKFLOW_STEPS[Math.min(WORKFLOW_STEPS.length - 1, Math.max(0, stepIndex + direction))].id);

  if (selectedFiling) {
    return <div style={{ minHeight: "100%", background: STYLE.page, color: STYLE.ink, fontFamily: "Inter, Arial, sans-serif" }}>
      <RogerTopBar title={WORKFLOW_STEPS[stepIndex].label} breadcrumb={`My Clients  /  Platforms Normandy  /  ${selectedFiling.name}  /  ${WORKFLOW_STEPS[stepIndex].label}`} onBack={() => setSelectedId(null)} />
      <div style={{ display: "flex", minHeight: "calc(100vh - 102px)" }}>
        <aside style={{ width: 150, flexShrink: 0, background: "#f0f1f2", borderRight: `1px solid ${STYLE.border}`, padding: "18px 14px", color: "#475569" }}><div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 700 }}><span style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 3, background: "#dfe3e7" }}>♟</span>My Clients</div></aside>
        <div style={{ minWidth: 0, flex: 1 }}><WorkflowNav activeStep={activeStep} onStep={setActiveStep} /><section style={{ maxWidth: 1440, margin: "0 auto", padding: "26px 30px 36px" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "flex-start", marginBottom: 22, flexWrap: "wrap" }}><div><div style={{ color: STYLE.orange, fontSize: 10, fontWeight: 800, letterSpacing: ".08em", marginBottom: 5 }}>STATE COMPLIANCE / {selectedFiling.jurisdiction.toUpperCase()}</div><h1 style={{ margin: 0, color: "#253341", fontSize: 22 }}>{activeStep === "summary" ? "State Summary" : WORKFLOW_STEPS[stepIndex].label}</h1><div style={{ color: "#64748b", marginTop: 5, fontSize: 12 }}>{selectedFiling.name}</div></div><StatusPill status={selectedFiling.readiness} /></div><WorkflowWorkspace step={activeStep} filing={selectedFiling} overrideActive={overrideActive} onToggleOverride={() => setOverrideActive(value => !value)} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, borderTop: `1px solid ${STYLE.border}`, paddingTop: 16 }}><button disabled={stepIndex === 0} onClick={() => moveStep(-1)} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${STYLE.border}`, background: "white", borderRadius: 3, padding: "7px 10px", color: stepIndex === 0 ? "#cbd5e1" : "#475569", cursor: stepIndex === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 11 }}><ChevronLeft size={14} /> Previous</button><button disabled={stepIndex === WORKFLOW_STEPS.length - 1} onClick={() => moveStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: 0, background: STYLE.blue, borderRadius: 3, padding: "7px 10px", color: "white", cursor: stepIndex === WORKFLOW_STEPS.length - 1 ? "default" : "pointer", opacity: stepIndex === WORKFLOW_STEPS.length - 1 ? .5 : 1, fontWeight: 700, fontSize: 11 }}>Next — {WORKFLOW_STEPS[Math.min(stepIndex + 1, WORKFLOW_STEPS.length - 1)].label}<ChevronRight size={14} /></button></div><div style={{ marginTop: 22, fontSize: 10, color: "#94a3b8" }}>Prototype data is illustrative and demonstrates the proposed State workflow only; it does not represent a tax calculation or release output.</div></section></div>
      </div>
    </div>;
  }

  return <div style={{ minHeight: "100%", background: STYLE.page, color: STYLE.ink, fontFamily: "Inter, Arial, sans-serif" }}>
    <RogerTopBar title="Return Filings" breadcrumb="My Clients  /  Platforms Normandy" onBack={() => navigate("/")} />
    <div style={{ display: "flex", minHeight: "calc(100vh - 102px)" }}><aside style={{ width: 190, flexShrink: 0, background: "#f0f1f2", borderRight: `1px solid ${STYLE.border}`, padding: "18px 14px", color: "#475569" }}><div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, fontWeight: 700 }}><span style={{ width: 20, height: 20, display: "grid", placeItems: "center", borderRadius: 3, background: "#dfe3e7" }}>♟</span>My Clients</div></aside><main style={{ minWidth: 0, flex: 1, padding: "18px 24px 38px", maxWidth: 1780 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}><div><div style={{ color: STYLE.orange, fontWeight: 800, letterSpacing: ".08em", fontSize: 10 }}>ROGER UI PROTOTYPE</div><h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#253341" }}>Return Filings</h1></div><span style={{ color: "#64748b", fontSize: 11 }}>Platforms Normandy · Tax year 2026</span></div><section style={{ marginBottom: 22 }}><SectionHeader title="Federal Compliance" count={FEDERAL_FILINGS.length} state="2 Federal filings" /><DataTable headers={["Filing name", "Return structure", "Progress", "Issue count", "Statutory due date", "Client due date"]} rows={FEDERAL_FILINGS.map(filing => [<div><strong>{filing.name}</strong><div style={{ color: "#94a3b8", fontSize: 10, marginTop: 2 }}>Federal Compliance</div></div>, filing.structure, <ProgressBar value={filing.progress} />, filing.issues ? <span style={{ color: "#b91c1c", background: "#fee2e2", borderRadius: 11, padding: "3px 7px", fontSize: 10, fontWeight: 700 }}>{filing.issues} issues</span> : "—", "Oct 15, 2026", "Sep 30, 2026"])}/></section><section><SectionHeader title="State Compliance" count={STATE_FILINGS.length} state="Select a State filing to enter the workflow" /><DataTable headers={["Filing name", "State / jurisdiction", "Filing designation", "Return structure", "Entities", "Progress", "Issue count", "Statutory due date", "Client due date"]} rows={STATE_FILINGS.map(filing => [<button onClick={() => openFiling(filing)} style={{ padding: 0, background: "transparent", border: 0, textAlign: "left", color: "#126d96", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>{filing.name}</button>, filing.jurisdiction, <StatusPill status={filing.readiness} />, filing.structure, String(filing.entities), <ProgressBar value={filing.progress} color={filing.progress >= 70 ? STYLE.green : STYLE.orange} />, filing.issues ? <span style={{ color: "#b91c1c", background: "#fee2e2", borderRadius: 11, padding: "3px 7px", fontSize: 10, fontWeight: 700 }}>{filing.issues} {filing.issues === 1 ? "issue" : "issues"}</span> : <span style={{ color: "#1f7a31", fontSize: 10, fontWeight: 700 }}>No issues</span>, filing.statutoryDue, filing.clientDue])} /></section><div style={{ marginTop: 18, padding: "10px 12px", border: "1px solid #d6eaf3", background: STYLE.paleBlue, color: "#47616e", borderRadius: 4, fontSize: 11, lineHeight: 1.45 }}><strong style={{ color: "#0878aa" }}>State is a Roger compliance workflow.</strong> Select a filing to continue from the same Return Filings experience into a State-specific workflow with familiar tables, controls, and practitioner actions.</div></main></div>
  </div>;
}
