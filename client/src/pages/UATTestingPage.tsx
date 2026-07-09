// DCT Platform — UAT Testing Dashboard
// Source of Truth: DCT Enterprise Master Data Workbook v1.0
// Owner: Jennifer Dawn Stafford | MVP: September 21 | UAT: Mid-August

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
// ─── Types ────────────────────────────────────────────────────────────────────
type TestStatus =
  | "Not Started"
  | "In Progress"
  | "Passed"
  | "Failed"
  | "Blocked"
  | "Deferred"
  | "Retest Required"
  | "Production Ready";

type Priority = "Critical" | "High" | "Medium" | "Low";

type TestCase = {
  testId: string;
  epic: string;
  feature: string;
  story: string;
  requirement: string;
  businessProcess: string;
  tester: string;
  status: TestStatus;
  priority: Priority;
  executionDate: string;
  result: string;
  defectId: string;
  comments: string;
};

type Defect = {
  defectNumber: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  priority: "P1" | "P2" | "P3" | "P4";
  assignedDeveloper: string;
  status: "Open" | "In Progress" | "Fixed" | "Closed" | "Deferred";
  targetFixDate: string;
  retestStatus: "Pending" | "Passed" | "Failed" | "N/A";
  comments: string;
};

type SignoffRow = {
  businessArea: string;
  businessOwner: string;
  dateTested: string;
  approvalStatus: "Approved" | "Pending" | "Rejected";
  signature: string;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────
const TEST_CASES: TestCase[] = [
  { testId: "UAT-001", epic: "PDC Data Ingestion", feature: "Trial Balance Upload", story: "As a practitioner, I can upload a trial balance file", requirement: "REQ-PDC-001", businessProcess: "Data Ingestion", tester: "Neha Sethi", status: "Passed", priority: "Critical", executionDate: "2026-08-05", result: "Pass", defectId: "", comments: "All 47 TB accounts mapped correctly" },
  { testId: "UAT-002", epic: "PDC Data Ingestion", feature: "Trial Balance Upload", story: "As a practitioner, I can validate TB account mapping", requirement: "REQ-PDC-002", businessProcess: "Data Ingestion", tester: "Neha Sethi", status: "Passed", priority: "Critical", executionDate: "2026-08-05", result: "Pass", defectId: "", comments: "TCC pattern validation confirmed" },
  { testId: "UAT-003", epic: "TDC Tax Classification", feature: "Tax Taxonomy", story: "As a practitioner, I can view the tax taxonomy hierarchy", requirement: "REQ-TDC-001", businessProcess: "Tax Classification", tester: "Krista Gigliotti", status: "Passed", priority: "High", executionDate: "2026-08-06", result: "Pass", defectId: "", comments: "Form 1120 taxonomy loaded correctly" },
  { testId: "UAT-004", epic: "TDC Tax Classification", feature: "Adjustment Rules", story: "As a practitioner, book-to-tax adjustments are computed automatically", requirement: "REQ-TDC-002", businessProcess: "Tax Computation", tester: "Krista Gigliotti", status: "In Progress", priority: "Critical", executionDate: "2026-08-07", result: "Pending", defectId: "", comments: "Testing permanent vs temporary adjustments" },
  { testId: "UAT-005", epic: "TDC Tax Classification", feature: "Adjustment Rules", story: "As a practitioner, I can view M-1/M-3 reconciliation output", requirement: "REQ-TDC-003", businessProcess: "Tax Computation", tester: "Courtney Saunders", status: "Not Started", priority: "Critical", executionDate: "", result: "", defectId: "", comments: "Scheduled for Aug 10" },
  { testId: "UAT-006", epic: "Orchestrator", feature: "Agent Execution", story: "As a practitioner, the Orchestrator triggers tax computation automatically", requirement: "REQ-ORC-001", businessProcess: "AI Orchestration", tester: "Neha Sethi", status: "In Progress", priority: "High", executionDate: "2026-08-07", result: "Pending", defectId: "", comments: "Stateless execution confirmed; testing retry logic" },
  { testId: "UAT-007", epic: "Orchestrator", feature: "Agent Execution", story: "As a practitioner, failed agent steps are retried automatically", requirement: "REQ-ORC-002", businessProcess: "AI Orchestration", tester: "Neha Sethi", status: "Failed", priority: "High", executionDate: "2026-08-07", result: "Fail", defectId: "DEF-001", comments: "Retry count exceeded on large TB files" },
  { testId: "UAT-008", epic: "Roger Consumer", feature: "Roger UI", story: "As a practitioner, I can view tax computation results in Roger", requirement: "REQ-ROG-001", businessProcess: "Practitioner Consumption", tester: "Courtney Saunders", status: "Blocked", priority: "Critical", executionDate: "2026-08-08", result: "Blocked", defectId: "DEF-002", comments: "Auth provisioning not yet complete for UAT env" },
  { testId: "UAT-009", epic: "Roger Consumer", feature: "Roger UI", story: "As a practitioner, I can export Roger output to GoSystem", requirement: "REQ-ROG-002", businessProcess: "Practitioner Consumption", tester: "Courtney Saunders", status: "Not Started", priority: "High", executionDate: "", result: "", defectId: "", comments: "Depends on UAT-008 resolution" },
  { testId: "UAT-010", epic: "IMS Integration", feature: "GoSystem Tax", story: "As a practitioner, tax data is transmitted to GoSystem correctly", requirement: "REQ-IMS-001", businessProcess: "IMS Integration", tester: "Krista Gigliotti", status: "Not Started", priority: "Critical", executionDate: "", result: "", defectId: "", comments: "Scheduled for Aug 12" },
  { testId: "UAT-011", epic: "PDC Data Ingestion", feature: "Entity Management", story: "As a practitioner, I can manage entity types and jurisdictions", requirement: "REQ-PDC-003", businessProcess: "Data Ingestion", tester: "Neha Sethi", status: "Passed", priority: "Medium", executionDate: "2026-08-06", result: "Pass", defectId: "", comments: "FEDERAL/STATE/LOCAL/INTERNATIONAL confirmed" },
  { testId: "UAT-012", epic: "TDC Tax Classification", feature: "Return Templates", story: "As a practitioner, return templates are pre-populated from TB data", requirement: "REQ-TDC-004", businessProcess: "Tax Computation", tester: "Krista Gigliotti", status: "Passed", priority: "High", executionDate: "2026-08-06", result: "Pass", defectId: "", comments: "Form 1120 lines 1–28 validated" },
  { testId: "UAT-013", epic: "Orchestrator", feature: "Lineage Tracking", story: "As a practitioner, I can trace data lineage from TB to return line", requirement: "REQ-ORC-003", businessProcess: "Lineage & Audit", tester: "Courtney Saunders", status: "In Progress", priority: "High", executionDate: "2026-08-08", result: "Pending", defectId: "", comments: "Lineage closure testing in progress" },
  { testId: "UAT-014", epic: "PDC Data Ingestion", feature: "Data Quality", story: "As a practitioner, data quality rules are enforced on upload", requirement: "REQ-PDC-004", businessProcess: "Data Ingestion", tester: "Neha Sethi", status: "Passed", priority: "Medium", executionDate: "2026-08-05", result: "Pass", defectId: "", comments: "Null checks and type validations confirmed" },
  { testId: "UAT-015", epic: "IMS Integration", feature: "Provision Reference Data", story: "As a practitioner, provision reference data is loaded correctly", requirement: "REQ-IMS-002", businessProcess: "IMS Integration", tester: "Krista Gigliotti", status: "Not Started", priority: "High", executionDate: "", result: "", defectId: "", comments: "B28 scope: DTAClassification, DTLClassification" },
  { testId: "UAT-016", epic: "Roger Consumer", feature: "Workpaper Generation", story: "As a practitioner, workpapers are generated from TDC output", requirement: "REQ-ROG-003", businessProcess: "Practitioner Consumption", tester: "Courtney Saunders", status: "Not Started", priority: "Medium", executionDate: "", result: "", defectId: "", comments: "Depends on TDC adjustment rules completion" },
  { testId: "UAT-017", epic: "TDC Tax Classification", feature: "Deferred Tax", story: "As a practitioner, deferred tax assets and liabilities are computed", requirement: "REQ-TDC-005", businessProcess: "Tax Computation", tester: "Krista Gigliotti", status: "Not Started", priority: "Critical", executionDate: "", result: "", defectId: "", comments: "B28 scope: DTAClassification, DTLClassification" },
  { testId: "UAT-018", epic: "PDC Data Ingestion", feature: "API Endpoints", story: "As a developer, PDC bulk upload API accepts valid payloads", requirement: "REQ-PDC-005", businessProcess: "API Validation", tester: "Neha Sethi", status: "Passed", priority: "High", executionDate: "2026-08-05", result: "Pass", defectId: "", comments: "POST /api/v1/trial-balance/bulk-upload confirmed" },
  { testId: "UAT-019", epic: "TDC Tax Classification", feature: "API Endpoints", story: "As a developer, TDC tax forms API returns correct line data", requirement: "REQ-TDC-006", businessProcess: "API Validation", tester: "Neha Sethi", status: "Passed", priority: "High", executionDate: "2026-08-06", result: "Pass", defectId: "", comments: "POST /api/TaxForms/bulk-upload confirmed" },
  { testId: "UAT-020", epic: "Orchestrator", feature: "Contract Publication", story: "As a developer, published API contracts match Swagger spec", requirement: "REQ-ORC-004", businessProcess: "API Validation", tester: "Courtney Saunders", status: "Retest Required", priority: "High", executionDate: "2026-08-07", result: "Retest", defectId: "DEF-003", comments: "Minor schema mismatch on ETRCategory field" },
];

const DEFECTS: Defect[] = [
  { defectNumber: "DEF-001", description: "Orchestrator retry logic fails on trial balance files > 5MB — retry count exceeded without fallback", severity: "High", priority: "P1", assignedDeveloper: "Platform Team", status: "In Progress", targetFixDate: "2026-08-12", retestStatus: "Pending", comments: "Root cause: timeout threshold too low for large files" },
  { defectNumber: "DEF-002", description: "Roger authentication not provisioned in UAT environment — all Roger UI tests blocked", severity: "Critical", priority: "P1", assignedDeveloper: "Platform Team", status: "Open", targetFixDate: "2026-08-10", retestStatus: "Pending", comments: "Auth provisioning request submitted to platform team" },
  { defectNumber: "DEF-003", description: "ETRCategory field schema mismatch between published contract and Swagger spec — nullable vs required", severity: "Medium", priority: "P2", assignedDeveloper: "TDC Team", status: "Fixed", targetFixDate: "2026-08-09", retestStatus: "Pending", comments: "Fix deployed to UAT env; awaiting retest" },
];

const SIGNOFF_ROWS: SignoffRow[] = [
  { businessArea: "PDC — Financial Data", businessOwner: "Jennifer Dawn Stafford", dateTested: "2026-08-06", approvalStatus: "Approved", signature: "J. Stafford" },
  { businessArea: "TDC — Tax Classification", businessOwner: "Stephane Lacombe", dateTested: "", approvalStatus: "Pending", signature: "" },
  { businessArea: "Orchestrator — AI Execution", businessOwner: "Stephane Lacombe", dateTested: "", approvalStatus: "Pending", signature: "" },
  { businessArea: "Roger — Practitioner UI", businessOwner: "Jennifer Dawn Stafford", dateTested: "", approvalStatus: "Pending", signature: "" },
  { businessArea: "IMS — GoSystem Integration", businessOwner: "Jennifer Dawn Stafford", dateTested: "", approvalStatus: "Pending", signature: "" },
];

const RELEASE_READINESS = [
  { item: "Requirements Complete", status: true, owner: "Jennifer Dawn Stafford", notes: "All B1–B10 requirements documented" },
  { item: "Stories Complete", status: true, owner: "Jennifer Dawn Stafford", notes: "20 UAT stories authored and linked" },
  { item: "Testing Complete", status: false, owner: "Neha Sethi", notes: "In progress — 60% complete" },
  { item: "Regression Complete", status: false, owner: "Krista Gigliotti", notes: "Not started — scheduled Aug 15" },
  { item: "Critical Defects Closed", status: false, owner: "Platform Team", notes: "DEF-001, DEF-002 open" },
  { item: "Deployment Ready", status: false, owner: "Stephane Lacombe", notes: "Pending testing completion" },
  { item: "Business Approval", status: false, owner: "Jennifer Dawn Stafford", notes: "Pending — 4 of 5 areas pending signoff" },
  { item: "Go / No Go", status: false, owner: "Stephane Lacombe", notes: "Decision: September 14, 2026" },
];

// ─── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: TestStatus }) {
  const map: Record<TestStatus, { bg: string; text: string; dot: string }> = {
    "Passed":            { bg: "#f0fdf4", text: "#166534", dot: "#059669" },
    "Failed":            { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
    "Blocked":           { bg: "#fef3c7", text: "#92400e", dot: "#f59e0b" },
    "In Progress":       { bg: "#eff6ff", text: "#1e40af", dot: "#3b82f6" },
    "Not Started":       { bg: "#f8fafc", text: "#475569", dot: "#94a3b8" },
    "Deferred":          { bg: "#faf5ff", text: "#6b21a8", dot: "#a855f7" },
    "Retest Required":   { bg: "#fff7ed", text: "#9a3412", dot: "#ea580c" },
    "Production Ready":  { bg: "#ecfdf5", text: "#065f46", dot: "#10b981" },
  };
  const s = map[status] ?? map["Not Started"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 11, fontWeight: 700, padding: "2px 8px",
      borderRadius: 4, backgroundColor: s.bg, color: s.text,
      border: `1px solid ${s.dot}40`, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, { bg: string; text: string }> = {
    "Critical": { bg: "#fef2f2", text: "#991b1b" },
    "High":     { bg: "#fff7ed", text: "#9a3412" },
    "Medium":   { bg: "#eff6ff", text: "#1e40af" },
    "Low":      { bg: "#f0fdf4", text: "#166534" },
  };
  const s = map[priority];
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "2px 7px",
      borderRadius: 4, backgroundColor: s.bg, color: s.text,
      border: `1px solid ${s.text}30`,
    }}>{priority}</span>
  );
}

// ─── Donut chart (SVG) ────────────────────────────────────────────────────────
function DonutChart({ passed, failed, blocked, notStarted, inProgress }: {
  passed: number; failed: number; blocked: number; notStarted: number; inProgress: number;
}) {
  const total = passed + failed + blocked + notStarted + inProgress;
  if (total === 0) return null;
  const segments = [
    { value: passed,     color: "#059669", label: "Passed" },
    { value: failed,     color: "#ef4444", label: "Failed" },
    { value: blocked,    color: "#f59e0b", label: "Blocked" },
    { value: inProgress, color: "#3b82f6", label: "In Progress" },
    { value: notStarted, color: "#94a3b8", label: "Not Started" },
  ];
  const r = 60; const cx = 80; const cy = 80;
  let cumAngle = -Math.PI / 2;
  const paths = segments.map((seg) => {
    if (seg.value === 0) return null;
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cumAngle);
    const y1 = cy + r * Math.sin(cumAngle);
    cumAngle += angle;
    const x2 = cx + r * Math.cos(cumAngle);
    const y2 = cy + r * Math.sin(cumAngle);
    const large = angle > Math.PI ? 1 : 0;
    return (
      <path
        key={seg.label}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
        fill={seg.color}
        stroke="white"
        strokeWidth={2}
      />
    );
  });
  const innerR = 38;
  const passPct = Math.round((passed / total) * 100);
  return (
    <svg width={160} height={160} viewBox="0 0 160 160">
      {paths}
      <circle cx={cx} cy={cy} r={innerR} fill="white" />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={18} fontWeight={800} fill="#0f1623">{passPct}%</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="#64748b">Pass Rate</text>
    </svg>
  );
}

// ─── Ask Buddy panel ──────────────────────────────────────────────────────────
const BUDDY_PROMPTS = [
  "Generate UAT Test Cases",
  "Summarize Failed Tests",
  "Identify Missing Test Coverage",
  "Create Regression Test Cases",
  "Summarize Defects",
  "Generate Executive UAT Report",
  "Recommend Go/No Go",
];

function AskBuddyPanel({ testCases, defects }: { testCases: TestCase[]; defects: Defect[] }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "Hello! I'm Ask Buddy, your AI Testing Assistant for the DCT Platform UAT. I can help you generate test cases, summarize defects, identify coverage gaps, and recommend Go/No Go. What would you like to know?" }
  ]);
  const [loading, setLoading] = useState(false);

  const askBuddy = trpc.uat.askBuddy.useMutation();

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const result = await askBuddy.mutateAsync({ question: userMsg });
      setMessages(m => [...m, { role: "assistant", text: result.answer }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ backgroundColor: "#0f1623", padding: "14px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>🤖</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Ask Buddy — AI Testing Assistant</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>DCT Platform UAT · Powered by Enterprise Master Data Workbook</div>
        </div>
      </div>
      {/* Suggested prompts */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {BUDDY_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} style={{
            fontSize: 12, padding: "4px 10px", borderRadius: 16,
            backgroundColor: "white", border: "1px solid #003865",
            color: "#003865", cursor: "pointer", fontWeight: 600,
          }}>{p}</button>
        ))}
      </div>
      {/* Messages */}
      <div style={{ height: 280, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "80%",
            backgroundColor: m.role === "user" ? "#003865" : "white",
            color: m.role === "user" ? "white" : "#1e293b",
            border: m.role === "assistant" ? "1px solid #e2e8f0" : "none",
            borderRadius: 8, padding: "8px 12px", fontSize: 13, lineHeight: 1.5,
          }}>{m.text}</div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#64748b" }}>
            Thinking…
          </div>
        )}
      </div>
      {/* Input */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid #e2e8f0", display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask about UAT coverage, defects, or test cases…"
          style={{
            flex: 1, padding: "8px 12px", borderRadius: 6,
            border: "1px solid #e2e8f0", fontSize: 13, outline: "none",
          }}
        />
        <button onClick={() => send(input)} disabled={loading} style={{
          padding: "8px 16px", borderRadius: 6, backgroundColor: "#003865",
          color: "white", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
        }}>Send</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UATTestingPage() {
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [epicFilter, setEpicFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [testerFilter, setTesterFilter] = useState<string>("All");
  const [reportOutput, setReportOutput] = useState<string>("");
  const [reportLoading, setReportLoading] = useState<string>("");

  const generateReport = trpc.uat.generateReport.useMutation();

  const handleGenerateReport = async (type: string) => {
    setReportLoading(type);
    setReportOutput("");
    try {
      const result = await generateReport.mutateAsync({ reportType: type });
      setReportOutput(result.report);
    } catch {
      setReportOutput("Unable to generate report at this time. Please try again.");
    }
    setReportLoading("");
  };

  // ── Computed stats ──
  const stats = useMemo(() => {
    const total = TEST_CASES.length;
    const passed = TEST_CASES.filter(t => t.status === "Passed" || t.status === "Production Ready").length;
    const failed = TEST_CASES.filter(t => t.status === "Failed").length;
    const blocked = TEST_CASES.filter(t => t.status === "Blocked").length;
    const inProgress = TEST_CASES.filter(t => t.status === "In Progress" || t.status === "Retest Required").length;
    const notStarted = TEST_CASES.filter(t => t.status === "Not Started" || t.status === "Deferred").length;
    const completed = passed;
    const defectsLogged = DEFECTS.length;
    const criticalDefects = DEFECTS.filter(d => d.severity === "Critical").length;
    const readyForProd = TEST_CASES.filter(t => t.status === "Production Ready").length;
    return { total, passed, failed, blocked, inProgress, notStarted, completed, defectsLogged, criticalDefects, readyForProd };
  }, []);

  const passPct = Math.round((stats.passed / stats.total) * 100);
  const failPct = Math.round((stats.failed / stats.total) * 100);
  const blockedPct = Math.round((stats.blocked / stats.total) * 100);
  const notStartedPct = Math.round((stats.notStarted / stats.total) * 100);

  // ── Filtered test cases ──
  const filteredTests = useMemo(() => TEST_CASES.filter(t => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (epicFilter !== "All" && t.epic !== epicFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (testerFilter !== "All" && t.tester !== testerFilter) return false;
    return true;
  }), [statusFilter, epicFilter, priorityFilter, testerFilter]);

  const epics = ["All", ...Array.from(new Set(TEST_CASES.map(t => t.epic)))];
  const testers = ["All", ...Array.from(new Set(TEST_CASES.map(t => t.tester)))];
  const statuses: TestStatus[] = ["Not Started", "In Progress", "Passed", "Failed", "Blocked", "Deferred", "Retest Required", "Production Ready"];
  const priorities: Priority[] = ["Critical", "High", "Medium", "Low"];

  const goNoGo = stats.failed === 0 && stats.blocked === 0 && stats.notStarted === 0 ? "GO" : "NO GO";
  const goColor = goNoGo === "GO" ? "#059669" : "#dc2626";

  const REPORT_BUTTONS = [
    { type: "Executive Summary", label: "Generate Executive Summary" },
    { type: "UAT Completion Report", label: "Generate UAT Completion Report" },
    { type: "Defect Summary", label: "Generate Defect Summary" },
    { type: "Go Live Readiness Report", label: "Generate Go Live Readiness Report" },
    { type: "Daily Status Email", label: "Generate Daily Status Email" },
    { type: "PO Update", label: "Generate PO Update" },
    { type: "Release Notes", label: "Generate Release Notes" },
  ];

  const sectionHeader = (title: string, subtitle?: string) => (
    <div style={{ marginBottom: 20, borderLeft: "4px solid #003865", paddingLeft: 14 }}>
      {subtitle && <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>{subtitle}</div>}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f1623", margin: 0 }}>{title}</h2>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1300, margin: "0 auto", fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ backgroundColor: "#0f1623", borderRadius: 12, padding: "24px 28px", marginBottom: 28, color: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
              DCT Platform · Source of Truth: Enterprise Master Data Workbook v1.0
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 4px", color: "white" }}>User Acceptance Testing</h1>
            <div style={{ fontSize: 14, color: "#94a3b8" }}>Owner: Jennifer Dawn Stafford · MVP Release: September 21, 2026 · UAT Phase: Mid-August</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ textAlign: "center", backgroundColor: "#1e3a5f", borderRadius: 8, padding: "10px 18px" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Phase</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#3b82f6" }}>UAT</div>
            </div>
            <div style={{ textAlign: "center", backgroundColor: "#1e3a5f", borderRadius: 8, padding: "10px 18px" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Go / No Go</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: goColor }}>{goNoGo}</div>
            </div>
          </div>
        </div>

        {/* Progress bars */}
        <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { label: "Pass", pct: passPct, color: "#059669" },
            { label: "Fail", pct: failPct, color: "#ef4444" },
            { label: "Blocked", pct: blockedPct, color: "#f59e0b" },
            { label: "Not Started", pct: notStartedPct, color: "#94a3b8" },
          ].map(b => (
            <div key={b.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{b.label}</span>
                <span style={{ fontSize: 12, color: "white", fontWeight: 700 }}>{b.pct}%</span>
              </div>
              <div style={{ height: 8, backgroundColor: "#1e3a5f", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${b.pct}%`, backgroundColor: b.color, borderRadius: 4, transition: "width 0.4s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EXECUTIVE SUMMARY CARDS ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Executive Summary", "Section 1")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Test Cases", value: stats.total, color: "#003865" },
            { label: "Passed", value: stats.passed, color: "#059669" },
            { label: "Failed", value: stats.failed, color: "#ef4444" },
            { label: "Blocked", value: stats.blocked, color: "#f59e0b" },
            { label: "In Progress", value: stats.inProgress, color: "#3b82f6" },
            { label: "Completed", value: stats.completed, color: "#059669" },
            { label: "Defects Logged", value: stats.defectsLogged, color: "#7c3aed" },
            { label: "Critical Defects", value: stats.criticalDefects, color: "#dc2626" },
            { label: "Ready for Production", value: stats.readyForProd, color: "#065f46" },
          ].map(c => (
            <div key={c.label} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: 10, padding: "16px 18px",
              borderTop: `4px solid ${c.color}`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: c.color }}>{c.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VISUAL CHARTS ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Test Coverage Visuals", "Section 2")}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Donut chart */}
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1623", marginBottom: 12 }}>Test Status Distribution</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <DonutChart passed={stats.passed} failed={stats.failed} blocked={stats.blocked} notStarted={stats.notStarted} inProgress={stats.inProgress} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Passed", count: stats.passed, color: "#059669" },
                  { label: "Failed", count: stats.failed, color: "#ef4444" },
                  { label: "Blocked", count: stats.blocked, color: "#f59e0b" },
                  { label: "In Progress", count: stats.inProgress, color: "#3b82f6" },
                  { label: "Not Started", count: stats.notStarted, color: "#94a3b8" },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: l.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#475569" }}>{l.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f1623", marginLeft: "auto" }}>{l.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Epic coverage heatmap */}
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1623", marginBottom: 12 }}>Epic Coverage</div>
            {epics.filter(e => e !== "All").map(epic => {
              const epicTests = TEST_CASES.filter(t => t.epic === epic);
              const epicPassed = epicTests.filter(t => t.status === "Passed").length;
              const pct = Math.round((epicPassed / epicTests.length) * 100);
              return (
                <div key={epic} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{epic.replace(" — ", " ")}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 80 ? "#059669" : pct >= 50 ? "#f59e0b" : "#ef4444" }}>{pct}%</span>
                  </div>
                  <div style={{ height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, backgroundColor: pct >= 80 ? "#059669" : pct >= 50 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Defect severity breakdown */}
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1623", marginBottom: 12 }}>Defect Severity Breakdown</div>
            {(["Critical", "High", "Medium", "Low"] as const).map(sev => {
              const count = DEFECTS.filter(d => d.severity === sev).length;
              const colors: Record<string, string> = { Critical: "#dc2626", High: "#ea580c", Medium: "#3b82f6", Low: "#059669" };
              return (
                <div key={sev} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 70, fontSize: 12, fontWeight: 700, color: colors[sev] }}>{sev}</span>
                  <div style={{ flex: 1, height: 20, backgroundColor: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(count / Math.max(DEFECTS.length, 1)) * 100}%`, backgroundColor: colors[sev], borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                      {count > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{count}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f1623", width: 20, textAlign: "right" }}>{count}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 16, padding: "10px 12px", backgroundColor: "#fef2f2", borderRadius: 6, border: "1px solid #fecaca" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b" }}>⚠ {DEFECTS.filter(d => d.status === "Open" || d.status === "In Progress").length} Active Defects</div>
              <div style={{ fontSize: 11, color: "#7f1d1d", marginTop: 2 }}>DEF-001 and DEF-002 are blocking UAT completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── UAT TEST EXECUTION TABLE ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("UAT Test Execution", "Section 3")}

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14, padding: "12px 16px", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Epic:</span>
            <select value={epicFilter} onChange={e => setEpicFilter(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0", color: "#1e293b" }}>
              {epics.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Status:</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0", color: "#1e293b" }}>
              <option>All</option>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Priority:</span>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0", color: "#1e293b" }}>
              <option>All</option>
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Tester:</span>
            <select value={testerFilter} onChange={e => setTesterFilter(e.target.value)} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0", color: "#1e293b" }}>
              {testers.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto", alignSelf: "center" }}>
            Showing {filteredTests.length} of {TEST_CASES.length} test cases
          </span>
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: "#003865" }}>
                  {["Test ID", "Epic", "Feature", "Story", "Requirement", "Business Process", "Tester", "Status", "Priority", "Exec Date", "Result", "Defect ID", "Comments"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "white", fontWeight: 700, whiteSpace: "nowrap", fontSize: 11, letterSpacing: "0.04em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTests.map((t, i) => (
                  <tr key={t.testId} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "#003865", whiteSpace: "nowrap" }}>{t.testId}</td>
                    <td style={{ padding: "8px 12px", color: "#475569", maxWidth: 120 }}>{t.epic}</td>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{t.feature}</td>
                    <td style={{ padding: "8px 12px", color: "#1e293b", maxWidth: 200 }}>{t.story}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{t.requirement}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{t.businessProcess}</td>
                    <td style={{ padding: "8px 12px", color: "#475569", whiteSpace: "nowrap" }}>{t.tester}</td>
                    <td style={{ padding: "8px 12px" }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: "8px 12px" }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding: "8px 12px", color: "#64748b", whiteSpace: "nowrap" }}>{t.executionDate || "—"}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: t.result === "Pass" ? "#059669" : t.result === "Fail" ? "#dc2626" : "#64748b" }}>{t.result || "—"}</td>
                    <td style={{ padding: "8px 12px", color: t.defectId ? "#dc2626" : "#94a3b8", fontWeight: t.defectId ? 700 : 400 }}>{t.defectId || "—"}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b", maxWidth: 200 }}>{t.comments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── DEFECT TRACKING ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Defect Tracking", "Section 4")}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: "#003865" }}>
                {["Defect #", "Description", "Severity", "Priority", "Assigned Developer", "Status", "Target Fix Date", "Retest Status", "Comments"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "white", fontWeight: 700, whiteSpace: "nowrap", fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEFECTS.map((d, i) => {
                const sevColors: Record<string, string> = { Critical: "#dc2626", High: "#ea580c", Medium: "#3b82f6", Low: "#059669" };
                const statusColors: Record<string, { bg: string; text: string }> = {
                  "Open": { bg: "#fef2f2", text: "#991b1b" },
                  "In Progress": { bg: "#eff6ff", text: "#1e40af" },
                  "Fixed": { bg: "#f0fdf4", text: "#166534" },
                  "Closed": { bg: "#ecfdf5", text: "#065f46" },
                  "Deferred": { bg: "#faf5ff", text: "#6b21a8" },
                };
                const sc = statusColors[d.status] ?? statusColors["Open"];
                return (
                  <tr key={d.defectNumber} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "#dc2626" }}>{d.defectNumber}</td>
                    <td style={{ padding: "8px 12px", color: "#1e293b", maxWidth: 280 }}>{d.description}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: sevColors[d.severity] }}>{d.severity}</span>
                    </td>
                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "#475569" }}>{d.priority}</td>
                    <td style={{ padding: "8px 12px", color: "#475569" }}>{d.assignedDeveloper}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 4, backgroundColor: sc.bg, color: sc.text }}>{d.status}</span>
                    </td>
                    <td style={{ padding: "8px 12px", color: "#64748b" }}>{d.targetFixDate}</td>
                    <td style={{ padding: "8px 12px", color: d.retestStatus === "Passed" ? "#059669" : d.retestStatus === "Failed" ? "#dc2626" : "#64748b", fontWeight: 600 }}>{d.retestStatus}</td>
                    <td style={{ padding: "8px 12px", color: "#64748b", maxWidth: 200 }}>{d.comments}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BUSINESS SIGNOFF ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Business Signoff", "Section 5")}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ backgroundColor: "#003865" }}>
                {["Business Area", "Business Owner", "Date Tested", "Approval Status", "Electronic Signature"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: "white", fontWeight: 700, fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIGNOFF_ROWS.map((row, i) => {
                const approvalColors: Record<string, { bg: string; text: string; dot: string }> = {
                  "Approved": { bg: "#f0fdf4", text: "#166534", dot: "#059669" },
                  "Pending":  { bg: "#fff7ed", text: "#9a3412", dot: "#f59e0b" },
                  "Rejected": { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
                };
                const ac = approvalColors[row.approvalStatus];
                return (
                  <tr key={row.businessArea} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#003865" }}>{row.businessArea}</td>
                    <td style={{ padding: "10px 12px", color: "#475569" }}>{row.businessOwner}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b" }}>{row.dateTested || "—"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 4, backgroundColor: ac.bg, color: ac.text, border: `1px solid ${ac.dot}40` }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: ac.dot }} />
                        {row.approvalStatus}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: row.signature ? "#059669" : "#94a3b8", fontStyle: row.signature ? "italic" : "normal", fontWeight: row.signature ? 700 : 400 }}>
                      {row.signature || "Awaiting signature"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RELEASE READINESS ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Release Readiness", "Section 6")}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {RELEASE_READINESS.map(item => (
            <div key={item.item} style={{
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: 8, padding: "14px 16px",
              borderLeft: `4px solid ${item.status ? "#059669" : "#e2e8f0"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{item.status ? "✅" : "⬜"}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0f1623" }}>{item.item}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Owner: {item.owner}</div>
              <div style={{ fontSize: 12, color: item.status ? "#059669" : "#475569" }}>{item.notes}</div>
            </div>
          ))}
        </div>

        {/* Go/No Go banner */}
        <div style={{
          marginTop: 16, padding: "16px 20px", borderRadius: 10,
          backgroundColor: goNoGo === "GO" ? "#f0fdf4" : "#fef2f2",
          border: `2px solid ${goNoGo === "GO" ? "#059669" : "#ef4444"}`,
          display: "flex", alignItems: "center", gap: 16,
        }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: goColor }}>{goNoGo}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: goColor }}>
              {goNoGo === "GO" ? "Platform is ready for production release." : "Platform is NOT ready for production release."}
            </div>
            <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>
              {goNoGo === "NO GO"
                ? `${stats.failed} failed test(s) · ${stats.blocked} blocked test(s) · ${stats.notStarted} not started · ${DEFECTS.filter(d => d.status === "Open" || d.status === "In Progress").length} open defects`
                : "All tests passed, no open defects, all business areas signed off."}
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>Decision Date: September 14, 2026</div>
        </div>
      </div>

      {/* ── AI TESTING ASSISTANT ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("AI Testing Assistant", "Section 7")}
        <AskBuddyPanel testCases={TEST_CASES} defects={DEFECTS} />
      </div>

      {/* ── EXECUTIVE REPORTS ── */}
      <div style={{ marginBottom: 32 }}>
        {sectionHeader("Executive Reports", "Section 8")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {REPORT_BUTTONS.map(btn => (
            <button
              key={btn.type}
              onClick={() => handleGenerateReport(btn.type)}
              disabled={reportLoading === btn.type}
              style={{
                padding: "10px 18px", borderRadius: 6,
                backgroundColor: reportLoading === btn.type ? "#94a3b8" : "#003865",
                color: "white", border: "none", cursor: reportLoading === btn.type ? "not-allowed" : "pointer",
                fontWeight: 700, fontSize: 13,
              }}
            >
              {reportLoading === btn.type ? "Generating…" : btn.label}
            </button>
          ))}
        </div>
        {reportOutput && (
          <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 24px" }}>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, color: "#1e293b", lineHeight: 1.7, fontFamily: "system-ui, sans-serif", margin: 0 }}>{reportOutput}</pre>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 12, color: "#64748b" }}>
          <strong>Source of Truth:</strong> DCT Enterprise Master Data Workbook v1.0 · Owner: Jennifer Dawn Stafford
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          {["Ask Buddy", "Azure DevOps", "Power BI", "DCT Platform"].map(s => (
            <span key={s} style={{ fontSize: 12, color: "#003865", fontWeight: 600 }}>⬡ {s}</span>
          ))}
        </div>
      </div>

    </div>
  );
}
