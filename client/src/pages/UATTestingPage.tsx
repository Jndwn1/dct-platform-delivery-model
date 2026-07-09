// DCT/CATT Platform — Enterprise UAT & Release Readiness Command Center
// Source of Truth: DCT Enterprise Master Data Workbook v1.0
// Owner: Jenniver Dawn Stafford | MVP: September 21, 2026

import { useState, useMemo, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
type TestStatus = "Not Started" | "In Progress" | "Passed" | "Failed" | "Blocked" | "Deferred" | "Retest Required" | "Production Ready";
type Priority = "Critical" | "High" | "Medium" | "Low";
type DefectStatus = "Open" | "In Progress" | "Fixed" | "Closed" | "Deferred";
type ApprovalStatus = "Approved" | "Pending" | "Rejected" | "In Review";
type RiskLevel = "Critical" | "High" | "Medium" | "Low";

type TestCase = {
  testId: string; epic: string; feature: string; story: string;
  requirementId: string; configItem: string; workbookTab: string;
  rogerScreen: string; expectedResult: string; actualResult: string;
  tester: string; businessReviewer: string; priority: Priority;
  status: TestStatus; defectId: string; retest: boolean; comments: string;
};

type Defect = {
  defectNumber: string; description: string;
  severity: Priority; priority: "P1" | "P2" | "P3" | "P4";
  assignedDeveloper: string; status: DefectStatus;
  targetFixDate: string; retestStatus: "Pending" | "Passed" | "Failed" | "N/A";
  daysOpen: number; comments: string;
};

type SignoffRow = {
  businessArea: string; businessOwner: string;
  dateTested: string; approvalStatus: ApprovalStatus;
  approvalDate: string; comments: string; signature: string;
};

type ReadinessItem = {
  item: string; completionPct: number; owner: string;
  targetDate: string; risk: RiskLevel; status: string;
};

type Risk = {
  risk: string; businessImpact: string; probability: RiskLevel;
  mitigation: string; owner: string; status: string; targetResolution: string;
};

type TraceabilityRow = {
  epic: string; feature: string; requirement: string; story: string;
  testCase: string; defect: string; businessOwner: string;
  validationStatus: string; release: string;
};

// ─── Empty Data ───────────────────────────────────────────────────────────────
const TEST_CASES: TestCase[] = [];
const DEFECTS: Defect[] = [];
const SIGNOFF_ROWS: SignoffRow[] = [
  { businessArea: "PDC — Financial Data", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
  { businessArea: "TDC — Tax Classification", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
  { businessArea: "Roger — Practitioner UI", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
  { businessArea: "Orchestrator — AI Execution", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
  { businessArea: "IMS — GoSystem Integration", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
  { businessArea: "Enterprise Master Data Workbook", businessOwner: "", dateTested: "", approvalStatus: "Pending", approvalDate: "", comments: "", signature: "" },
];

const RELEASE_READINESS: ReadinessItem[] = [
  { item: "Requirements",      completionPct: 0, owner: "", targetDate: "", risk: "Medium", status: "Not Started" },
  { item: "Stories",           completionPct: 0, owner: "", targetDate: "", risk: "Medium", status: "Not Started" },
  { item: "Master Data",       completionPct: 0, owner: "", targetDate: "", risk: "High",   status: "Not Started" },
  { item: "Configuration",     completionPct: 0, owner: "", targetDate: "", risk: "Medium", status: "Not Started" },
  { item: "Testing",           completionPct: 0, owner: "", targetDate: "", risk: "High",   status: "Not Started" },
  { item: "Regression",        completionPct: 0, owner: "", targetDate: "", risk: "High",   status: "Not Started" },
  { item: "Business Approval", completionPct: 0, owner: "", targetDate: "", risk: "Critical", status: "Not Started" },
  { item: "Deployment",        completionPct: 0, owner: "", targetDate: "", risk: "High",   status: "Not Started" },
  { item: "Documentation",     completionPct: 0, owner: "", targetDate: "", risk: "Medium", status: "Not Started" },
  { item: "Training",          completionPct: 0, owner: "", targetDate: "", risk: "Low",    status: "Not Started" },
  { item: "Operational Readiness", completionPct: 0, owner: "", targetDate: "", risk: "High", status: "Not Started" },
];

const RISKS: Risk[] = [];

const TRACEABILITY: TraceabilityRow[] = [];

const WORKBOOK_TABS = [
  { tab: "Tax Forms",          loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Return Templates",   loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Adjustment Rules",   loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Workpapers",         loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Mappings",           loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Reference Data",     loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Jurisdictions",      loaded: 0, validated: 0, failed: 0, pending: 0 },
  { tab: "Configuration Tables", loaded: 0, validated: 0, failed: 0, pending: 0 },
];

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY = "#0f2d5e";
const BLUE = "#1a56db";
const GREEN = "#059669";
const RED = "#dc2626";
const AMBER = "#d97706";
const SLATE = "#64748b";
const LIGHT_BG = "#f8fafc";
const CARD_BG = "#ffffff";
const BORDER = "#e2e8f0";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function kpiCard(label: string, value: string | number, sub?: string, color?: string, pct?: number) {
  return (
    <div key={label} style={{
      backgroundColor: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 10, padding: "16px 18px",
      borderTop: `3px solid ${color ?? BLUE}`,
      minWidth: 0,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color ?? NAVY, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: SLATE, marginTop: 4 }}>{sub}</div>}
      {pct !== undefined && (
        <div style={{ marginTop: 8, height: 4, backgroundColor: "#e2e8f0", borderRadius: 2 }}>
          <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, backgroundColor: color ?? BLUE, borderRadius: 2, transition: "width 0.4s" }} />
        </div>
      )}
    </div>
  );
}

function sectionHeader(title: string, subtitle?: string, accent?: string) {
  return (
    <div style={{ borderLeft: `4px solid ${accent ?? BLUE}`, paddingLeft: 14, marginBottom: 18 }}>
      {subtitle && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: SLATE, marginBottom: 2 }}>{subtitle}</div>}
      <h2 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: 0 }}>{title}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: TestStatus }) {
  const map: Record<TestStatus, { bg: string; text: string; dot: string }> = {
    "Passed":           { bg: "#f0fdf4", text: "#166534", dot: GREEN },
    "Failed":           { bg: "#fef2f2", text: "#991b1b", dot: RED },
    "Blocked":          { bg: "#fef3c7", text: "#92400e", dot: AMBER },
    "In Progress":      { bg: "#eff6ff", text: "#1e40af", dot: BLUE },
    "Not Started":      { bg: "#f8fafc", text: "#475569", dot: "#94a3b8" },
    "Deferred":         { bg: "#faf5ff", text: "#6b21a8", dot: "#a855f7" },
    "Retest Required":  { bg: "#fff7ed", text: "#9a3412", dot: "#ea580c" },
    "Production Ready": { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  };
  const s = map[status] ?? map["Not Started"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: s.bg, color: s.text, border: `1px solid ${s.dot}40`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, { bg: string; text: string; dot: string }> = {
    "Approved":  { bg: "#f0fdf4", text: "#166534", dot: GREEN },
    "Pending":   { bg: "#f8fafc", text: "#475569", dot: "#94a3b8" },
    "Rejected":  { bg: "#fef2f2", text: "#991b1b", dot: RED },
    "In Review": { bg: "#eff6ff", text: "#1e40af", dot: BLUE },
  };
  const s = map[status];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: s.bg, color: s.text, border: `1px solid ${s.dot}40`, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { bg: string; text: string }> = {
    "Critical": { bg: "#fef2f2", text: "#991b1b" },
    "High":     { bg: "#fff7ed", text: "#9a3412" },
    "Medium":   { bg: "#fefce8", text: "#854d0e" },
    "Low":      { bg: "#f0fdf4", text: "#166534" },
  };
  const s = map[level];
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: s.bg, color: s.text }}>{level}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = { Critical: RED, High: AMBER, Medium: BLUE, Low: GREEN };
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: `${map[priority]}18`, color: map[priority], border: `1px solid ${map[priority]}40` }}>{priority}</span>;
}

// ─── Countdown widget ─────────────────────────────────────────────────────────
function Countdown({ targetDate }: { targetDate: string }) {
  const [days, setDays] = useState(0);
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      setDays(Math.max(0, Math.ceil(diff / 86400000)));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);
  const urgency = days <= 14 ? RED : days <= 30 ? AMBER : GREEN;
  return (
    <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", textAlign: "center", borderTop: `3px solid ${urgency}`, minWidth: 120 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.07em" }}>MVP Countdown</div>
      <div style={{ fontSize: 32, fontWeight: 900, color: urgency, lineHeight: 1, margin: "6px 0 2px" }}>{days}</div>
      <div style={{ fontSize: 11, color: SLATE }}>days remaining</div>
    </div>
  );
}

// ─── Simple bar chart ─────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, padding: "0 4px" }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: d.color }}>{d.value}</div>
          <div style={{ width: "100%", height: `${(d.value / max) * 60}px`, backgroundColor: d.color, borderRadius: "3px 3px 0 0", transition: "height 0.4s", minHeight: d.value > 0 ? 4 : 0 }} />
          <div style={{ fontSize: 9, color: SLATE, textAlign: "center", lineHeight: 1.2 }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 100 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let offset = 0;
  const r = 40; const cx = 50; const cy = 50;
  const circumference = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={12} />
        {segments.filter(s => s.value > 0).map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={12}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              transform="rotate(-90 50 50)" />
          );
          offset += pct;
          return el;
        })}
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={NAVY}>{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color, flexShrink: 0 }} />
            <span style={{ color: SLATE }}>{s.label}</span>
            <span style={{ fontWeight: 700, color: NAVY, marginLeft: "auto" }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Risk heat map ────────────────────────────────────────────────────────────
function RiskHeatMap({ risks }: { risks: Risk[] }) {
  const levels: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
  const matrix: Record<string, number> = {};
  risks.forEach(r => {
    const key = `${r.probability}-${r.businessImpact}`;
    matrix[key] = (matrix[key] ?? 0) + 1;
  });
  const impactLevels = ["Critical", "High", "Medium", "Low"];
  const cellColor = (prob: string, impact: string) => {
    const pi = impactLevels.indexOf(prob);
    const ii = impactLevels.indexOf(impact);
    const score = (3 - pi) + (3 - ii);
    if (score >= 5) return "#fef2f2";
    if (score >= 3) return "#fff7ed";
    if (score >= 1) return "#fefce8";
    return "#f0fdf4";
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", fontSize: 11, width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "6px 10px", backgroundColor: NAVY, color: "white", textAlign: "left", borderRadius: "4px 0 0 0" }}>Probability ↓ / Impact →</th>
            {impactLevels.map(l => <th key={l} style={{ padding: "6px 10px", backgroundColor: NAVY, color: "white", textAlign: "center" }}>{l}</th>)}
          </tr>
        </thead>
        <tbody>
          {levels.map((prob, ri) => (
            <tr key={prob}>
              <td style={{ padding: "6px 10px", fontWeight: 700, backgroundColor: LIGHT_BG, borderBottom: `1px solid ${BORDER}` }}>{prob}</td>
              {impactLevels.map((impact, ci) => {
                const count = matrix[`${prob}-${impact}`] ?? 0;
                return (
                  <td key={ci} style={{ padding: "6px 10px", textAlign: "center", backgroundColor: cellColor(prob, impact), borderBottom: `1px solid ${BORDER}`, fontWeight: count > 0 ? 800 : 400, color: count > 0 ? NAVY : "#cbd5e1" }}>
                    {count > 0 ? count : "·"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", color: SLATE, backgroundColor: LIGHT_BG, borderRadius: 8, border: `1px dashed ${BORDER}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{message}</div>
      <div style={{ fontSize: 11, marginTop: 4, color: "#94a3b8" }}>Data will appear here once UAT begins</div>
    </div>
  );
}

// ─── Tab component ────────────────────────────────────────────────────────────
function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 2, borderBottom: `2px solid ${BORDER}`, marginBottom: 20 }}>
      {tabs.map(t => (
        <button key={t} onClick={() => onChange(t)} style={{
          padding: "8px 16px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
          backgroundColor: "transparent", borderBottom: active === t ? `2px solid ${BLUE}` : "2px solid transparent",
          color: active === t ? BLUE : SLATE, marginBottom: -2, transition: "all 0.15s",
        }}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function UATTestingPage() {
  const MVP_DATE = "2026-09-21";

  // Filters
  const [epicFilter, setEpicFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [testerFilter, setTesterFilter] = useState("All");

  // Active section tab
  const [activeSection, setActiveSection] = useState("Overview");

  // Ask Buddy
  const [buddyMessages, setBuddyMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [buddyInput, setBuddyInput] = useState("");
  const [buddyLoading, setBuddyLoading] = useState(false);
  const buddyChatRef = useRef<HTMLDivElement>(null);
  const askBuddyMutation = trpc.uat.askBuddy.useMutation();

  // Report generation
  const [reportOutput, setReportOutput] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportType, setReportType] = useState("");
  const generateReportMutation = trpc.uat.generateReport.useMutation();

  // Derived stats
  const total = TEST_CASES.length;
  const executed = TEST_CASES.filter(t => t.status !== "Not Started").length;
  const passed = TEST_CASES.filter(t => t.status === "Passed").length;
  const failed = TEST_CASES.filter(t => t.status === "Failed").length;
  const blocked = TEST_CASES.filter(t => t.status === "Blocked").length;
  const retest = TEST_CASES.filter(t => t.status === "Retest Required").length;
  const openDefects = DEFECTS.filter(d => d.status === "Open" || d.status === "In Progress").length;
  const criticalDefects = DEFECTS.filter(d => d.severity === "Critical" && (d.status === "Open" || d.status === "In Progress")).length;
  const signedOff = SIGNOFF_ROWS.filter(s => s.approvalStatus === "Approved").length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const coveragePct = total > 0 ? Math.round((executed / total) * 100) : 0;
  const avgReadiness = RELEASE_READINESS.length > 0 ? Math.round(RELEASE_READINESS.reduce((s, r) => s + r.completionPct, 0) / RELEASE_READINESS.length) : 0;
  const goNoGo = criticalDefects === 0 && signedOff === SIGNOFF_ROWS.length && passRate >= 95 && avgReadiness >= 90;

  // Filtered test cases
  const filteredCases = useMemo(() => TEST_CASES.filter(t =>
    (epicFilter === "All" || t.epic === epicFilter) &&
    (statusFilter === "All" || t.status === statusFilter) &&
    (priorityFilter === "All" || t.priority === priorityFilter) &&
    (testerFilter === "All" || t.tester === testerFilter)
  ), [epicFilter, statusFilter, priorityFilter, testerFilter]);

  const epics = ["All", ...Array.from(new Set(TEST_CASES.map(t => t.epic)))];
  const testers = ["All", ...Array.from(new Set(TEST_CASES.map(t => t.tester).filter(Boolean)))];

  // Ask Buddy send
  const sendBuddyMessage = async (text?: string) => {
    const msg = text ?? buddyInput.trim();
    if (!msg) return;
    setBuddyInput("");
    const newMessages = [...buddyMessages, { role: "user" as const, content: msg }];
    setBuddyMessages(newMessages);
    setBuddyLoading(true);
    try {
      const res = await askBuddyMutation.mutateAsync({ question: msg });
      setBuddyMessages([...newMessages, { role: "assistant" as const, content: res.answer }]);
    } catch {
      setBuddyMessages([...newMessages, { role: "assistant" as const, content: "I encountered an error. Please try again." }]);
    } finally {
      setBuddyLoading(false);
    }
  };

  useEffect(() => {
    if (buddyChatRef.current) buddyChatRef.current.scrollTop = buddyChatRef.current.scrollHeight;
  }, [buddyMessages]);

  // Report generation
  const generateReport = async (type: string) => {
    setReportType(type);
    setReportOutput("");
    setReportLoading(true);
    try {
      const res = await generateReportMutation.mutateAsync({ reportType: type });
      setReportOutput(res.report);
    } catch {
      setReportOutput("Unable to generate report at this time. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  const SECTIONS = ["Overview", "Master Data", "Roger Validation", "Traceability", "Test Execution", "Defects", "Approvals", "Readiness", "Risk Register", "Ask Buddy", "Reports"];

  return (
    <div style={{ backgroundColor: LIGHT_BG, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: NAVY, color: "white", padding: "20px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#93c5fd", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              DCT / CATT Platform
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 900, margin: "0 0 6px", lineHeight: 1.2 }}>
              Enterprise UAT &amp; Release Readiness Command Center
            </h1>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#93c5fd" }}>
              <span>📋 Source of Truth: Enterprise Master Data Workbook v1.0</span>
              <span>👤 Owner: Jenniver Dawn Stafford</span>
              <span>🎯 MVP: September 21, 2026</span>
            </div>
          </div>
          <Countdown targetDate={MVP_DATE} />
        </div>

        {/* Meta tags */}
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
          {[
            { label: "Phase", value: "UAT" },
            { label: "Release", value: "MVP v1.0" },
            { label: "Sprint", value: "—" },
            { label: "Environment", value: "UAT" },
            { label: "Last Refresh", value: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) },
          ].map(m => (
            <div key={m.label} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 12px", fontSize: 11 }}>
              <span style={{ color: "#93c5fd" }}>{m.label}: </span>
              <span style={{ fontWeight: 700 }}>{m.value}</span>
            </div>
          ))}
          <div style={{
            backgroundColor: goNoGo ? "#059669" : "#dc2626",
            borderRadius: 6, padding: "4px 14px", fontSize: 11, fontWeight: 800,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "white", display: "inline-block" }} />
            {goNoGo ? "GO" : "NO GO"}
          </div>
        </div>
      </div>

      {/* ── SECTION NAV ── */}
      <div style={{ backgroundColor: CARD_BG, borderBottom: `1px solid ${BORDER}`, padding: "0 32px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 0 }}>
          {SECTIONS.map(s => (
            <button key={s} onClick={() => setActiveSection(s)} style={{
              padding: "12px 16px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              backgroundColor: "transparent", borderBottom: activeSection === s ? `2px solid ${BLUE}` : "2px solid transparent",
              color: activeSection === s ? BLUE : SLATE, whiteSpace: "nowrap",
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── OVERVIEW ── */}
        {activeSection === "Overview" && (
          <div>
            {sectionHeader("Executive Command Center", "UAT Overview", BLUE)}

            {/* KPI grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
              {kpiCard("Total Test Cases", total, "Planned", NAVY)}
              {kpiCard("Executed", executed, `${coveragePct}% coverage`, BLUE, coveragePct)}
              {kpiCard("Passed", passed, `${passRate}% pass rate`, GREEN, passRate)}
              {kpiCard("Failed", failed, "Requires fix", RED)}
              {kpiCard("Blocked", blocked, "Awaiting resolution", AMBER)}
              {kpiCard("Retest Required", retest, "Pending retest", "#ea580c")}
              {kpiCard("Open Defects", openDefects, `${criticalDefects} critical`, openDefects > 0 ? RED : GREEN)}
              {kpiCard("Critical Defects", criticalDefects, "Must close for GO", criticalDefects > 0 ? RED : GREEN)}
              {kpiCard("Business Signoffs", `${signedOff}/${SIGNOFF_ROWS.length}`, "Areas approved", signedOff === SIGNOFF_ROWS.length ? GREEN : AMBER, Math.round((signedOff / Math.max(SIGNOFF_ROWS.length, 1)) * 100))}
              {kpiCard("Release Readiness", `${avgReadiness}%`, "Overall completion", avgReadiness >= 90 ? GREEN : avgReadiness >= 60 ? AMBER : RED, avgReadiness)}
              {kpiCard("Requirement Coverage", `${coveragePct}%`, "Test coverage", coveragePct >= 90 ? GREEN : AMBER, coveragePct)}
              {kpiCard("Go / No-Go", goNoGo ? "GO ✓" : "NO GO", goNoGo ? "Ready for release" : "Blockers remain", goNoGo ? GREEN : RED)}
            </div>

            {/* Charts row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }}>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Test Status Distribution</div>
                <DonutChart segments={[
                  { label: "Passed", value: passed, color: GREEN },
                  { label: "Failed", value: failed, color: RED },
                  { label: "Blocked", value: blocked, color: AMBER },
                  { label: "In Progress", value: TEST_CASES.filter(t => t.status === "In Progress").length, color: BLUE },
                  { label: "Not Started", value: TEST_CASES.filter(t => t.status === "Not Started").length, color: "#94a3b8" },
                  { label: "Retest", value: retest, color: "#ea580c" },
                ]} size={110} />
              </div>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Defect Severity</div>
                <MiniBarChart data={[
                  { label: "Critical", value: DEFECTS.filter(d => d.severity === "Critical").length, color: RED },
                  { label: "High", value: DEFECTS.filter(d => d.severity === "High").length, color: AMBER },
                  { label: "Medium", value: DEFECTS.filter(d => d.severity === "Medium").length, color: BLUE },
                  { label: "Low", value: DEFECTS.filter(d => d.severity === "Low").length, color: GREEN },
                ]} />
              </div>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Business Approval Progress</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SIGNOFF_ROWS.map(s => (
                    <div key={s.businessArea}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                        <span style={{ color: SLATE, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{s.businessArea}</span>
                        <ApprovalBadge status={s.approvalStatus} />
                      </div>
                      <div style={{ height: 4, backgroundColor: "#e2e8f0", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: s.approvalStatus === "Approved" ? "100%" : "0%", backgroundColor: GREEN, borderRadius: 2 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Release Readiness Gauge */}
            <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Release Readiness Scorecard</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                {RELEASE_READINESS.map(r => (
                  <div key={r.item} style={{ backgroundColor: LIGHT_BG, borderRadius: 8, padding: "12px 14px", border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{r.item}</span>
                      <RiskBadge level={r.risk} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: r.completionPct >= 90 ? GREEN : r.completionPct >= 60 ? AMBER : RED, marginBottom: 4 }}>{r.completionPct}%</div>
                    <div style={{ height: 4, backgroundColor: "#e2e8f0", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: `${r.completionPct}%`, backgroundColor: r.completionPct >= 90 ? GREEN : r.completionPct >= 60 ? AMBER : RED, borderRadius: 2 }} />
                    </div>
                    {r.owner && <div style={{ fontSize: 10, color: SLATE, marginTop: 4 }}>Owner: {r.owner}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MASTER DATA ── */}
        {activeSection === "Master Data" && (
          <div>
            {sectionHeader("Master Data Governance", "Enterprise Master Data Workbook v1.0", GREEN)}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {kpiCard("Workbook Version", "v1.0", "Current", NAVY)}
              {kpiCard("Data Load Status", "Pending", "Not yet loaded", AMBER)}
              {kpiCard("Records Loaded", "0", "Awaiting import", BLUE)}
              {kpiCard("Records Validated", "0", "0% validated", GREEN, 0)}
              {kpiCard("Failed Records", "0", "No failures", GREEN)}
              {kpiCard("Pending Validation", "0", "Queue empty", SLATE)}
              {kpiCard("Data Quality Score", "—", "Not yet assessed", SLATE)}
              {kpiCard("Validation Errors", "0", "No errors", GREEN)}
            </div>

            <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ backgroundColor: NAVY, padding: "12px 20px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Validation Progress by Workbook Tab</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f1f5f9" }}>
                    {["Workbook Tab", "Records Loaded", "Validated", "Failed", "Pending", "Progress"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 700, color: NAVY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {WORKBOOK_TABS.map((tab, i) => (
                    <tr key={tab.tab} style={{ backgroundColor: i % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                      <td style={{ padding: "10px 16px", fontWeight: 600, color: NAVY, borderBottom: `1px solid ${BORDER}` }}>{tab.tab}</td>
                      <td style={{ padding: "10px 16px", color: SLATE, borderBottom: `1px solid ${BORDER}` }}>{tab.loaded}</td>
                      <td style={{ padding: "10px 16px", color: GREEN, fontWeight: 600, borderBottom: `1px solid ${BORDER}` }}>{tab.validated}</td>
                      <td style={{ padding: "10px 16px", color: tab.failed > 0 ? RED : SLATE, fontWeight: tab.failed > 0 ? 700 : 400, borderBottom: `1px solid ${BORDER}` }}>{tab.failed}</td>
                      <td style={{ padding: "10px 16px", color: SLATE, borderBottom: `1px solid ${BORDER}` }}>{tab.pending}</td>
                      <td style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, height: 6, backgroundColor: "#e2e8f0", borderRadius: 3 }}>
                            <div style={{ height: "100%", width: tab.loaded > 0 ? `${Math.round((tab.validated / tab.loaded) * 100)}%` : "0%", backgroundColor: GREEN, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: SLATE, minWidth: 32 }}>
                            {tab.loaded > 0 ? `${Math.round((tab.validated / tab.loaded) * 100)}%` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ROGER VALIDATION ── */}
        {activeSection === "Roger Validation" && (
          <div>
            {sectionHeader("Roger Validation Dashboard", "Configuration & UI Validation", "#7c3aed")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
              {kpiCard("Configuration Loaded", "0", "Items loaded", BLUE)}
              {kpiCard("Verified in Roger", "0", "0% verified", GREEN, 0)}
              {kpiCard("Pending Validation", "0", "Awaiting review", AMBER)}
              {kpiCard("Business Approved", "0", "0 approved", GREEN)}
              {kpiCard("Rejected", "0", "No rejections", RED)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {["Roger Tax Classification Screen", "Roger Workpaper View", "Roger Return Assembly", "Roger Adjustment Rules"].map(screen => (
                <div key={screen} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f1f5f9", padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{screen}</div>
                  </div>
                  <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 140, backgroundColor: "#f8fafc", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 32, color: "#cbd5e1" }}>🖥</div>
                    <div style={{ fontSize: 12, color: SLATE, fontWeight: 600 }}>Screenshot placeholder</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Upload Roger validation screenshot</div>
                  </div>
                  <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <ApprovalBadge status="Pending" />
                    <span style={{ fontSize: 11, color: SLATE }}>Not yet validated</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRACEABILITY ── */}
        {activeSection === "Traceability" && (
          <div>
            {sectionHeader("Requirements Traceability Matrix", "End-to-End Coverage", BLUE)}
            {TRACEABILITY.length === 0 ? (
              <EmptyState message="No traceability records — add requirements, stories, and test cases to populate the matrix" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: NAVY }}>
                      {["Epic", "Feature", "Requirement", "Story", "Test Case", "Defect", "Business Owner", "Validation Status", "Release"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TRACEABILITY.map((row, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, fontWeight: 600, color: NAVY }}>{row.epic}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{row.feature}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{row.requirement}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{row.story}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: BLUE, fontWeight: 600 }}>{row.testCase}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: row.defect ? RED : SLATE }}>{row.defect || "—"}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{row.businessOwner}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}` }}><StatusBadge status={row.validationStatus as TestStatus} /></td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{row.release}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TEST EXECUTION ── */}
        {activeSection === "Test Execution" && (
          <div>
            {sectionHeader("Test Execution Grid", `${filteredCases.length} of ${total} test cases`, BLUE)}

            {/* Filters */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              {[
                { label: "Epic", value: epicFilter, options: epics, onChange: setEpicFilter },
                { label: "Status", value: statusFilter, options: ["All", "Not Started", "In Progress", "Passed", "Failed", "Blocked", "Retest Required"], onChange: setStatusFilter },
                { label: "Priority", value: priorityFilter, options: ["All", "Critical", "High", "Medium", "Low"], onChange: setPriorityFilter },
                { label: "Tester", value: testerFilter, options: testers, onChange: setTesterFilter },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: SLATE }}>{f.label}:</label>
                  <select value={f.value} onChange={e => f.onChange(e.target.value)} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 4, border: `1px solid ${BORDER}`, backgroundColor: CARD_BG, color: NAVY }}>
                    {f.options.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {filteredCases.length === 0 ? (
              <EmptyState message="No test cases yet — populate from the Enterprise Master Data Workbook when UAT begins" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr style={{ backgroundColor: NAVY }}>
                      {["ID", "Epic", "Story", "Config Item", "Workbook Tab", "Roger Screen", "Expected", "Actual", "Tester", "Reviewer", "Priority", "Status", "Defect", "Retest", "Comments"].map(h => (
                        <th key={h} style={{ padding: "9px 12px", textAlign: "left", color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((tc, i) => (
                      <tr key={tc.testId} style={{ backgroundColor: i % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, color: BLUE, whiteSpace: "nowrap" }}>{tc.testId}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: NAVY, fontWeight: 600 }}>{tc.epic}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.story}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{tc.configItem || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{tc.workbookTab || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{tc.rogerScreen || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.expectedResult || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.actualResult || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{tc.tester || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{tc.businessReviewer || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}` }}><PriorityBadge priority={tc.priority} /></td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}` }}><StatusBadge status={tc.status} /></td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: tc.defectId ? RED : SLATE, fontWeight: tc.defectId ? 700 : 400 }}>{tc.defectId || "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>{tc.retest ? "✓" : "—"}</td>
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tc.comments || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── DEFECTS ── */}
        {activeSection === "Defects" && (
          <div>
            {sectionHeader("Defect Command Center", "Active Defect Tracking", RED)}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {kpiCard("Open Defects", openDefects, "Total open", openDefects > 0 ? RED : GREEN)}
              {kpiCard("Critical", DEFECTS.filter(d => d.severity === "Critical" && d.status !== "Closed").length, "P1 — must fix", RED)}
              {kpiCard("High", DEFECTS.filter(d => d.severity === "High" && d.status !== "Closed").length, "P2 — fix before GO", AMBER)}
              {kpiCard("Medium", DEFECTS.filter(d => d.severity === "Medium" && d.status !== "Closed").length, "P3", BLUE)}
              {kpiCard("Low", DEFECTS.filter(d => d.severity === "Low" && d.status !== "Closed").length, "P4", SLATE)}
              {kpiCard("Retest Queue", DEFECTS.filter(d => d.retestStatus === "Pending").length, "Awaiting retest", AMBER)}
              {kpiCard("Avg Resolution", "—", "Days to close", SLATE)}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Defect Trend</div>
                <EmptyState message="Defect trend data will appear as defects are logged" />
              </div>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Defect Aging</div>
                <EmptyState message="Defect aging will appear as defects are logged" />
              </div>
            </div>

            {DEFECTS.length === 0 ? (
              <EmptyState message="No defects logged — defects will appear here as they are discovered during UAT" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: NAVY }}>
                      {["Defect #", "Description", "Severity", "Priority", "Assigned To", "Status", "Target Fix", "Days Open", "Retest", "Comments"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEFECTS.map((d, i) => (
                      <tr key={d.defectNumber} style={{ backgroundColor: i % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, fontWeight: 700, color: RED }}>{d.defectNumber}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: NAVY, maxWidth: 280 }}>{d.description}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}` }}><PriorityBadge priority={d.severity} /></td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE, fontWeight: 700 }}>{d.priority}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{d.assignedDeveloper}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: d.status === "Closed" ? "#f0fdf4" : d.status === "Open" ? "#fef2f2" : "#eff6ff", color: d.status === "Closed" ? GREEN : d.status === "Open" ? RED : BLUE }}>
                            {d.status}
                          </span>
                        </td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{d.targetFixDate}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: d.daysOpen > 7 ? RED : SLATE, fontWeight: d.daysOpen > 7 ? 700 : 400 }}>{d.daysOpen}d</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}` }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, backgroundColor: d.retestStatus === "Passed" ? "#f0fdf4" : "#fff7ed", color: d.retestStatus === "Passed" ? GREEN : AMBER }}>
                            {d.retestStatus}
                          </span>
                        </td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 200 }}>{d.comments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── APPROVALS ── */}
        {activeSection === "Approvals" && (
          <div>
            {sectionHeader("Business Approvals", "Executive Sign-Off by Business Area", GREEN)}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {SIGNOFF_ROWS.map(row => (
                <div key={row.businessArea} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", borderTop: `3px solid ${row.approvalStatus === "Approved" ? GREEN : row.approvalStatus === "Rejected" ? RED : BORDER}` }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{row.businessArea}</div>
                      <ApprovalBadge status={row.approvalStatus} />
                    </div>
                    {row.businessOwner && <div style={{ fontSize: 12, color: SLATE, marginTop: 4 }}>Owner: {row.businessOwner}</div>}
                  </div>
                  <div style={{ padding: "14px 20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.07em" }}>Date Tested</div>
                        <div style={{ color: NAVY, fontWeight: 600, marginTop: 2 }}>{row.dateTested || "—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.07em" }}>Approval Date</div>
                        <div style={{ color: NAVY, fontWeight: 600, marginTop: 2 }}>{row.approvalDate || "—"}</div>
                      </div>
                    </div>
                    {row.comments && <div style={{ marginTop: 10, fontSize: 12, color: SLATE, backgroundColor: LIGHT_BG, borderRadius: 6, padding: "8px 10px" }}>{row.comments}</div>}
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11, color: SLATE }}>Electronic Signature</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: row.signature ? NAVY : "#94a3b8", fontStyle: row.signature ? "italic" : "normal" }}>
                        {row.signature || "Awaiting signature"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── READINESS ── */}
        {activeSection === "Readiness" && (
          <div>
            {sectionHeader("Release Readiness Scorecards", "Go / No-Go Assessment", NAVY)}

            {/* Go/No-Go banner */}
            <div style={{ backgroundColor: goNoGo ? "#f0fdf4" : "#fef2f2", border: `1px solid ${goNoGo ? "#bbf7d0" : "#fecaca"}`, borderRadius: 10, padding: "16px 24px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 32 }}>{goNoGo ? "✅" : "🚫"}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: goNoGo ? GREEN : RED }}>{goNoGo ? "GO — Ready for Release" : "NO GO — Blockers Remain"}</div>
                <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>
                  {goNoGo ? "All release criteria met. Platform is ready for MVP deployment." : `${criticalDefects} critical defect(s) open · ${SIGNOFF_ROWS.length - signedOff} business area(s) pending approval · ${avgReadiness}% overall readiness`}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {RELEASE_READINESS.map(r => (
                <div key={r.item} style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, borderLeft: `4px solid ${r.completionPct >= 90 ? GREEN : r.completionPct >= 60 ? AMBER : "#e2e8f0"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{r.item}</div>
                    <RiskBadge level={r.risk} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: r.completionPct >= 90 ? GREEN : r.completionPct >= 60 ? AMBER : RED, marginBottom: 8 }}>{r.completionPct}%</div>
                  <div style={{ height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, marginBottom: 12 }}>
                    <div style={{ height: "100%", width: `${r.completionPct}%`, backgroundColor: r.completionPct >= 90 ? GREEN : r.completionPct >= 60 ? AMBER : RED, borderRadius: 3 }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                    <div>
                      <div style={{ color: SLATE, fontWeight: 600 }}>Owner</div>
                      <div style={{ color: NAVY }}>{r.owner || "—"}</div>
                    </div>
                    <div>
                      <div style={{ color: SLATE, fontWeight: 600 }}>Target Date</div>
                      <div style={{ color: NAVY }}>{r.targetDate || "—"}</div>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ color: SLATE, fontWeight: 600 }}>Status</div>
                      <div style={{ color: NAVY }}>{r.status}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RISK REGISTER ── */}
        {activeSection === "Risk Register" && (
          <div>
            {sectionHeader("Project Risk Register", "Risk Identification & Mitigation", RED)}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Risk Heat Map</div>
                <RiskHeatMap risks={RISKS} />
              </div>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16 }}>Risk Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {kpiCard("Total Risks", RISKS.length, "Identified", NAVY)}
                  {kpiCard("Critical", RISKS.filter(r => r.probability === "Critical").length, "Immediate action", RED)}
                  {kpiCard("High", RISKS.filter(r => r.probability === "High").length, "Monitor closely", AMBER)}
                  {kpiCard("Open", RISKS.filter(r => r.status === "Open").length, "Unresolved", BLUE)}
                </div>
              </div>
            </div>

            {RISKS.length === 0 ? (
              <EmptyState message="No risks logged — add risks to the register as they are identified" />
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ backgroundColor: NAVY }}>
                      {["Risk", "Business Impact", "Probability", "Mitigation", "Owner", "Status", "Target Resolution"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {RISKS.map((r, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? CARD_BG : LIGHT_BG }}>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: NAVY, fontWeight: 600, maxWidth: 200 }}>{r.risk}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{r.businessImpact}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}` }}><RiskBadge level={r.probability} /></td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE, maxWidth: 240 }}>{r.mitigation}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{r.owner}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{r.status}</td>
                        <td style={{ padding: "9px 14px", borderBottom: `1px solid ${BORDER}`, color: SLATE }}>{r.targetResolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── ASK BUDDY ── */}
        {activeSection === "Ask Buddy" && (
          <div>
            {sectionHeader("Ask Buddy AI", "Enterprise Testing & Release Assistant", "#0d9488")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
              {/* Chat */}
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column", height: 600 }}>
                <div style={{ backgroundColor: "#0d9488", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🐱</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>Ask Buddy AI</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)" }}>Enterprise Testing &amp; Release Assistant</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.9)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#86efac", display: "inline-block" }} />
                    Online
                  </div>
                </div>
                <div ref={buddyChatRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {buddyMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: SLATE, padding: "40px 20px" }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🐱</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Hello! I'm Ask Buddy.</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>I'm your AI assistant for DCT/CATT Platform UAT. Ask me anything about test cases, defects, release readiness, or request a report.</div>
                    </div>
                  )}
                  {buddyMessages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        backgroundColor: msg.role === "user" ? BLUE : LIGHT_BG,
                        color: msg.role === "user" ? "white" : NAVY,
                        fontSize: 13, lineHeight: 1.6,
                        border: msg.role === "assistant" ? `1px solid ${BORDER}` : "none",
                        whiteSpace: "pre-wrap",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {buddyLoading && (
                    <div style={{ display: "flex", gap: 4, padding: "10px 14px", backgroundColor: LIGHT_BG, borderRadius: "12px 12px 12px 2px", width: "fit-content", border: `1px solid ${BORDER}` }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#0d9488", display: "inline-block", animation: `bounce 1s ${i * 0.2}s infinite` }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8 }}>
                  <input
                    value={buddyInput}
                    onChange={e => setBuddyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendBuddyMessage()}
                    placeholder="Ask about test cases, defects, release readiness..."
                    style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, outline: "none", backgroundColor: LIGHT_BG }}
                  />
                  <button onClick={() => sendBuddyMessage()} disabled={buddyLoading || !buddyInput.trim()} style={{ padding: "10px 18px", borderRadius: 8, backgroundColor: "#0d9488", color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: buddyLoading || !buddyInput.trim() ? 0.6 : 1 }}>
                    Send
                  </button>
                </div>
              </div>

              {/* Suggested prompts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Suggested Prompts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      "Generate UAT Test Cases",
                      "Summarize today's UAT progress",
                      "Summarize failed tests",
                      "Identify missing requirement coverage",
                      "Show open Critical defects",
                      "Summarize Master Data validation",
                      "Identify records not validated in Roger",
                      "Recommend Go / No-Go",
                      "Generate Executive Status Report",
                      "Generate Product Owner Update",
                      "Generate Daily Leadership Email",
                      "Generate Release Notes",
                      "Identify deployment blockers",
                      "Recommend regression tests",
                      "Analyze project health",
                      "Create Business Approval Summary",
                    ].map(prompt => (
                      <button key={prompt} onClick={() => sendBuddyMessage(prompt)} style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${BORDER}`, backgroundColor: LIGHT_BG, color: NAVY, fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#eff6ff"; (e.currentTarget as HTMLElement).style.borderColor = BLUE; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = LIGHT_BG; (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeSection === "Reports" && (
          <div>
            {sectionHeader("Executive Reporting", "One-Click Report Generation", NAVY)}
            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12 }}>Available Reports</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Executive Steering Committee Report",
                    "Leadership Dashboard",
                    "Product Owner Summary",
                    "Daily BA Status",
                    "UAT Completion Report",
                    "Defect Summary",
                    "Go / No-Go Assessment",
                    "Release Readiness Report",
                    "Business Approval Report",
                    "Master Data Validation Report",
                    "Roger Validation Report",
                    "Deployment Readiness Report",
                    "Sprint Health Dashboard",
                  ].map(r => (
                    <button key={r} onClick={() => generateReport(r)} style={{
                      padding: "8px 12px", borderRadius: 6, border: `1px solid ${BORDER}`,
                      backgroundColor: reportType === r ? "#eff6ff" : LIGHT_BG,
                      borderColor: reportType === r ? BLUE : BORDER,
                      color: reportType === r ? BLUE : NAVY, fontSize: 11, fontWeight: 600,
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                    }}>
                      {r}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, marginBottom: 8 }}>Export Format</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["PDF", "PowerPoint", "Word", "Excel"].map(fmt => (
                      <button key={fmt} style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${BORDER}`, backgroundColor: LIGHT_BG, color: SLATE, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 20, minHeight: 500 }}>
                {!reportType && !reportOutput && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12, color: SLATE }}>
                    <div style={{ fontSize: 40 }}>📊</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Select a report to generate</div>
                    <div style={{ fontSize: 12 }}>Click any report on the left to generate an AI-powered executive report</div>
                  </div>
                )}
                {reportLoading && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: 32 }}>⏳</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Generating {reportType}...</div>
                    <div style={{ fontSize: 12, color: SLATE }}>Ask Buddy AI is analyzing platform data</div>
                  </div>
                )}
                {!reportLoading && reportOutput && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{reportType}</div>
                      <div style={{ fontSize: 11, color: SLATE }}>Generated {new Date().toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 13, color: NAVY, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{reportOutput}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── FOOTER ── */}
      <div style={{ backgroundColor: NAVY, color: "white", padding: "24px 32px", marginTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>DCT / CATT Platform</div>
            <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 8 }}>Enterprise User Acceptance Testing &amp; Release Readiness Command Center</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              Designed by <span style={{ color: "#93c5fd", fontWeight: 700 }}>Jenniver Dawn Stafford</span> · Business Analyst · RSM US LLP
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Powered By</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Enterprise Master Data Workbook", "Roger", "Ask Buddy AI", "Azure DevOps", "Power BI"].map(p => (
                <span key={p} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 4, backgroundColor: "rgba(255,255,255,0.1)", color: "#e2e8f0", fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
