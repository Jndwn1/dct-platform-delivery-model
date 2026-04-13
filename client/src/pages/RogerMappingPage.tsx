// DCT Platform — Roger UI Data Point Mapping
// Design: Strict revert to match reference site https://rsm-ai-team-niua6bzx.manus.space/#roger-ui-mapping
// 3 tabs: Screen 1 — My Clients | Screen 2 — Filing Structure | Ownership Summary
// Each tab: RULE banner, Legend, then data sections with 3-column PDC/Firm/TDC tables
// Colors: PDC = blue, Firm = gray, TDC = orange

import { useState } from "react";

type TabId = "screen1" | "screen2" | "ownership";

interface DataRow {
  dataPoint: string;
  isNew?: boolean;
  isTbd?: boolean;
  pdc: string;
  firm: string;
  tdc: string;
}

// ─── Screen 1 — My Clients ────────────────────────────────────────────────────

const SCREEN1_SUMMARY: DataRow[] = [
  { dataPoint: "Total Client Groups", pdc: "Client group concept lives upstream — accessed via PDC integration", firm: "PDC surfaces client group list for Roger display", tdc: "—" },
  { dataPoint: "Total Entities", pdc: "Entity count per client group (EODS / CEM + PDC)", firm: "PDC normalizes entity-to-group mapping", tdc: "—" },
  { dataPoint: "On Track Count", pdc: "—", firm: "Orchestrator reads PDC + TDC status; writes back via API", tdc: "Derived using TDC rule definitions — includes formula, inputs, version, timestamp" },
  { dataPoint: "At Risk Count", pdc: "—", firm: "Orchestrator aggregates status signals", tdc: "Calculated from due date vs. process step" },
  { dataPoint: "Overdue Count", pdc: "—", firm: "Orchestrator aggregates status signals", tdc: "Calculated from due date vs. process step" },
  { dataPoint: "Tax Year", isNew: true, pdc: "PeriodStart / PeriodEnd dates stored in PDC", firm: "Orchestrator passes period context to TDC", tdc: "TaxYear derived from PeriodStart / PeriodEnd — TDC provides derived value" },
];

const SCREEN1_TABLE: DataRow[] = [
  { dataPoint: "Client Group Name", pdc: "Source of Truth = EODS / CEM via PDC integration", firm: "PDC surfaces for Roger display", tdc: "—" },
  { dataPoint: "Engagement Code", pdc: "Source of Truth = EODS / CEM via PDC integration", firm: "PDC surfaces for Roger display", tdc: "—" },
  { dataPoint: "Role", pdc: "Engagement roles upstream via PDC integration", firm: "Snapshot captured at time of action — cannot be looked up dynamically later", tdc: "Process roles owned by TDC — snapshot frozen at assignment (Still Open)" },
  { dataPoint: "Process Step — Data Collection", pdc: "Ingestion status (DocumentId + RunId)", firm: "Orchestrator reads PDC status; PDC and TDC never talk directly", tdc: "—" },
  { dataPoint: "Process Step — Normalization", isNew: true, pdc: "Normalized financial facts (vNormalizedTb)", firm: "Orchestrator confirms normalization complete before TDC handoff", tdc: "—" },
  { dataPoint: "Process Step — Preparation", pdc: "—", firm: "Orchestrator routes to TDC after PDC normalization", tdc: "AI mapping proposals generated (RecordId)" },
  { dataPoint: "Process Step — Review", pdc: "—", firm: "Orchestrator tracks review state", tdc: "Practitioner review in progress" },
  { dataPoint: "Process Step — Client Approval", pdc: "—", firm: "Orchestrator gates filing until approval confirmed", tdc: "Sign-off required before lock — Roger read-only" },
  { dataPoint: "Process Step — Filing", pdc: "—", firm: "Orchestrator confirms filing handoff", tdc: "Return assembled and submitted" },
  { dataPoint: "Process Step — Completed", pdc: "—", firm: "Orchestrator closes workflow chain", tdc: "Return filed with confirmation" },
  { dataPoint: "Entities Count per Row", pdc: "Count of entities within client group (EODS / CEM + PDC)", firm: "PDC normalizes entity-to-group mapping", tdc: "—" },
  { dataPoint: "Complete %", pdc: "—", firm: "Orchestrator aggregates PDC + TDC workflow signals", tdc: "Rollup of process step progression — derived and persisted in TDC" },
  { dataPoint: "Due Date", pdc: "PeriodStartDate stored in PDC — base for TaxYear derivation", firm: "Orchestrator passes period context to TDC", tdc: "Derived from return type + jurisdiction using TaxYear — TIM future dependency TBD" },
  { dataPoint: "Days Left", pdc: "—", firm: "Orchestrator surfaces computed value to Roger", tdc: "Computed and persisted in TDC for traceability (based on DueDate)" },
  { dataPoint: "Status (On Track / At Risk / Overdue)", pdc: "—", firm: "Orchestrator reads TDC status signals", tdc: "Business logic comparing due date to progress — derived and persisted in TDC" },
  { dataPoint: "Industry", pdc: "Reference data in PDC; assignment in EODS / CEM", firm: "PDC surfaces for Roger display", tdc: "—" },
  { dataPoint: "Period Filter", isNew: true, pdc: "PeriodStartDate + PeriodEndDate stored in PDC", firm: "Orchestrator passes period context to TDC", tdc: "TaxYear derived from period dates" },
];

// ─── Screen 2 — Filing Structure ─────────────────────────────────────────────

const SCREEN2_SUMMARY: DataRow[] = [
  { dataPoint: "Total Filings", pdc: "—", firm: "Orchestrator aggregates filing counts", tdc: "Count of filings — all business logic owned by TDC" },
  { dataPoint: "Total Entities", pdc: "Entity count within client group (EODS / CEM + PDC)", firm: "PDC normalizes entity-to-group mapping", tdc: "—" },
  { dataPoint: "Avg. Completion %", pdc: "—", firm: "Orchestrator aggregates PDC + TDC workflow signals", tdc: "Average process step completion — derived and persisted in TDC" },
  { dataPoint: "Completed Count", pdc: "—", firm: "Orchestrator reads TDC filing status", tdc: "Count of returns with filed status — all business logic owned by TDC" },
];

const SCREEN2_TABLE: DataRow[] = [
  { dataPoint: "Filing Name", pdc: "—", firm: "Orchestrator maps PDC records to TDC return templates", tdc: "Return name from type and template — TDC owns" },
  { dataPoint: "Federal / State / International", pdc: "—", firm: "Orchestrator routes by jurisdiction type", tdc: "Jurisdiction type — TDC owns" },
  { dataPoint: "Entities per Consolidation", pdc: "Entity source of truth (EODS / CEM + PDC)", firm: "PDC normalizes entity-to-consolidation mapping", tdc: "Aggregated from PDC + TDC — entities in consolidated return" },
  { dataPoint: "AI Process %", pdc: "—", firm: "Orchestrator aggregates workflow signals from PDC + TDC", tdc: "Overall workflow completion % — derived and persisted in TDC" },
  { dataPoint: "Issue Count", pdc: "—", firm: "Orchestrator surfaces unresolved item counts", tdc: "Count of unresolved items — derived and persisted in TDC" },
  { dataPoint: "Document Status", isNew: true, pdc: "Portal / DUO — source TBD", firm: "Orchestrator reads document status from portal layer", tdc: "TDC owns business logic — source TBD (Portal / DUO)" },
  { dataPoint: "Due Date", pdc: "PeriodStartDate stored in PDC — base for TaxYear derivation", firm: "Orchestrator passes period context to TDC", tdc: "Derived from return type + jurisdiction — TIM dependency pending" },
  { dataPoint: "Days Left", pdc: "—", firm: "Orchestrator surfaces computed value to Roger", tdc: "Computed and persisted in TDC for traceability" },
  { dataPoint: "Status", pdc: "—", firm: "Orchestrator reads TDC status signals", tdc: "Business logic comparing due date to progress — derived and persisted in TDC" },
];

const SCREEN2_WORKFLOW: DataRow[] = [
  { dataPoint: "TB Step Status", pdc: "Trial balance ingested and normalized — DocumentId + RunId status", firm: "Orchestrator reads PDC ingestion status", tdc: "—" },
  { dataPoint: "TB Issue Count", pdc: "Ingestion or normalization exceptions — PDC owns", firm: "Orchestrator surfaces exception counts", tdc: "—" },
  { dataPoint: "Book Return Step Status", pdc: "—", firm: "Orchestrator routes PDC normalized facts to TDC mapping", tdc: "Book-basis mapping decisions accepted (RecordId)" },
  { dataPoint: "Book Return Issue Count", pdc: "—", firm: "Orchestrator surfaces mapping exceptions", tdc: "Mapping exceptions — TDC owns" },
  { dataPoint: "Book Adj Step Status", pdc: "—", firm: "Orchestrator routes adjustment approvals", tdc: "Book adjustments entered and approved — TDC owns" },
  { dataPoint: "Book Adj Issue Count", pdc: "—", firm: "Orchestrator surfaces unapproved items", tdc: "Unapproved book adjustments — TDC owns" },
  { dataPoint: "Reclass Adj Step Status", pdc: "—", firm: "Orchestrator routes reclassification approvals", tdc: "Reclassification adjustments approved — TDC owns" },
  { dataPoint: "Reclass Adj Issue Count", pdc: "—", firm: "Orchestrator surfaces unapproved items", tdc: "Unapproved reclassification adjustments — TDC owns" },
  { dataPoint: "Tax Adj Step Status", pdc: "—", firm: "Orchestrator routes tax adjustment approvals", tdc: "Tax adjustments entered and approved — TDC owns" },
  { dataPoint: "Tax Adj Issue Count", pdc: "—", firm: "Orchestrator surfaces unapproved items", tdc: "Unapproved tax adjustments — TDC owns" },
  { dataPoint: "Book to Tax Step Status", pdc: "—", firm: "Orchestrator confirms dual sign-off complete", tdc: "Tax-ready records locked with sign-off — TDC owns" },
  { dataPoint: "Entity List within Consolidation", pdc: "Entity source of truth (EODS / CEM + PDC)", firm: "PDC normalizes entity-to-consolidation mapping", tdc: "Entities in consolidated return — TDC aggregates" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function RuleBanner() {
  return (
    <div style={{ border: "1px solid #fed7aa", backgroundColor: "#fff7ed", borderRadius: "8px", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
      <span style={{ backgroundColor: "#f97316", color: "white", fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", flexShrink: 0, marginTop: "1px" }}>RULE</span>
      <p style={{ margin: 0, fontSize: "13px", color: "#9a3412" }}>
        Roger does not perform business logic or calculations. All derived values are computed and persisted in TDC for traceability.
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ border: "1px solid #e5e7eb", backgroundColor: "#f9fafb", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", fontSize: "12px", color: "#374151" }}>
      <span style={{ fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "11px", marginRight: "12px" }}>LEGEND</span>
      <span style={{ marginRight: "16px" }}>
        <span style={{ backgroundColor: "#10b981", color: "white", fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", marginRight: "4px" }}>NEW</span>
        Field newly added to this screen — not yet in production
      </span>
      <span>
        <span style={{ backgroundColor: "#f97316", color: "white", fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", marginRight: "4px" }}>RULE</span>
        Platform governance rule — enforced across all Roger screens
      </span>
      <div style={{ marginTop: "8px" }}>
        <span style={{ fontWeight: 700, color: "#9ca3af", marginRight: "6px" }}>TBD</span>
        Source or ownership not yet confirmed — open for discussion
        <span style={{ marginLeft: "16px" }}>
          <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#10b981", marginRight: "4px", verticalAlign: "middle" }}></span>
          Row highlight = new field
        </span>
      </div>
    </div>
  );
}

function ResponsibilityRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "10px" }}>
      <span style={{ color: "#374151", fontWeight: 500 }}>Clear separation of responsibilities:</span>
      <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>Financial Truth (PDC)</span>
      <span style={{ color: "#9ca3af" }}>→</span>
      <span style={{ backgroundColor: "#f3f4f6", color: "#374151", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>Firm Standardization</span>
      <span style={{ color: "#9ca3af" }}>→</span>
      <span style={{ backgroundColor: "#ffedd5", color: "#9a3412", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>Tax Judgment (TDC)</span>
    </div>
  );
}

function DataTable({ rows }: { rows: DataRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", width: "22%" }}>DATA POINT</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", width: "26%" }}>PDC — FINANCIAL TRUTH</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", width: "26%" }}>FIRM — TRANSFORMATION LAYER</th>
            <th style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: "0.05em", width: "26%" }}>TDC — TAX JUDGMENT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: row.isNew ? "#f0fdf4" : (i % 2 === 0 ? "white" : "#fafafa") }}>
              <td style={{ padding: "10px 12px", fontSize: "13px", fontWeight: 600, color: "#111827", verticalAlign: "top" }}>
                {row.dataPoint}
                {row.isNew && <span style={{ marginLeft: "6px", backgroundColor: "#10b981", color: "white", fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px" }}>NEW</span>}
                {row.isTbd && <span style={{ marginLeft: "6px", color: "#9ca3af", fontSize: "11px", fontWeight: 700 }}>TBD</span>}
              </td>
              <td style={{ padding: "10px 12px", fontSize: "12px", color: row.pdc === "—" ? "#d1d5db" : "#1e40af", verticalAlign: "top", lineHeight: "1.5" }}>{row.pdc}</td>
              <td style={{ padding: "10px 12px", fontSize: "12px", color: row.firm === "—" ? "#d1d5db" : "#374151", verticalAlign: "top", lineHeight: "1.5" }}>{row.firm}</td>
              <td style={{ padding: "10px 12px", fontSize: "12px", color: row.tdc === "—" ? "#d1d5db" : "#c2410c", verticalAlign: "top", lineHeight: "1.5" }}>{row.tdc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBlock({ title, rows, note }: { title: string; rows: DataRow[]; note?: string }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", overflow: "hidden", marginBottom: "24px" }}>
      <div style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "12px 16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{title}</div>
        <ResponsibilityRow />
      </div>
      {note && (
        <div style={{ backgroundColor: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "8px 16px", fontSize: "12px", color: "#92400e", fontStyle: "italic" }}>{note}</div>
      )}
      <DataTable rows={rows} />
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function Screen1Content() {
  return (
    <div>
      <RuleBanner />
      <Legend />
      <SectionBlock title="Summary Cards — PDC → Firm → TDC" rows={SCREEN1_SUMMARY} />
      <SectionBlock title="Table Columns — PDC → Firm → TDC" rows={SCREEN1_TABLE} />
    </div>
  );
}

function Screen2Content() {
  return (
    <div>
      <RuleBanner />
      <Legend />
      <SectionBlock title="Summary Cards — PDC → Firm → TDC" rows={SCREEN2_SUMMARY} />
      <SectionBlock title="Table Columns — PDC → Firm → TDC" rows={SCREEN2_TABLE} />
      <SectionBlock
        title="AI Process Workflow Steps — PDC → Firm → TDC"
        rows={SCREEN2_WORKFLOW}
        note="AI Process Workflow Steps are driven by PDC/TDC and are read-only in Roger. May move to a dedicated Review screen."
      />
      <p style={{ fontSize: "11px", color: "#9ca3af", fontStyle: "italic", marginTop: "4px" }}>
        All process steps are orchestrated via AI Orchestrator. Orchestrator reads from PDC and TDC and writes back via APIs. PDC and TDC do NOT communicate directly. Roger is read-only.
      </p>
    </div>
  );
}

function OwnershipContent() {
  const dctOwns = [
    "Ingestion (PDC) — ingestion status and record counts",
    "Normalization (PDC) — normalized financial facts (vNormalizedTb)",
    "Mapping (TDC) — AI mapping proposals and mapping decisions",
    "Adjustments (TDC) — adjustment lifecycle and approval status",
    "Tax-ready records (TDC) — tax-ready record lock status",
    "Due dates (TDC — TIM pending) — derived from return type + jurisdiction",
    "Filing (TDC) — return assembly and filing confirmation",
    "Process steps (PDC + TDC) — Data Collection through Completed; Roger is read-only from both",
    "Issue counts (TDC) — unresolved proposals, unapproved adjustments, unsigned records",
  ];
  const notDct = [
    "Client group names and identifiers — Source of Truth = EODS / CEM via PDC integration",
    "Engagement codes — Source of Truth = EODS / CEM via PDC integration",
    "Entity-to-client-group assignments — Source of Truth = EODS / CEM via PDC integration",
    "Industry assignment per client — Source of Truth = EODS / CEM via PDC integration",
    "Entity counts (source of truth needs EODS/CEM alignment) — Source of Truth = EODS / CEM via PDC integration",
  ];
  const needsDiscussion = [
    "Client Approval ownership — Source = TBD (Likely NOT fully TDC). Ownership unresolved. Must define system of record, whether approval is persisted in TDC, and whether it acts as a gating step before filing.",
    "Snapshot contract (Task 3 dependency) — Role assignments must be snapshotted at time of action; cannot be dynamically looked up later.",
    "Summary card rule definitions (TDC-owned) — exact rule definitions for On Track / At Risk / Overdue need to be confirmed.",
    "Period filtering strategy — Should Roger filter by date range (start/end date), derived tax year, or both?",
    "RunId vs Period default — Should UI default to latest RunId or latest period?",
    "Multi-period display — Can one entity show multiple periods at once? Or one active period per view?",
    "Tax Year vs Date display — Should Roger display Tax Year only? Or show underlying dates too? Roger will consume period context as start/end dates; TDC will provide TaxYear as a derived value.",
  ];

  const sectionStyle = (borderColor: string, bgColor: string) => ({
    border: `1px solid ${borderColor}`,
    borderRadius: "8px",
    overflow: "hidden" as const,
    marginBottom: "24px",
  });

  const headerStyle = (bgColor: string, borderColor: string) => ({
    backgroundColor: bgColor,
    borderBottom: `1px solid ${borderColor}`,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  });

  return (
    <div>
      <RuleBanner />
      <Legend />

      <div style={sectionStyle("#a7f3d0", "#d1fae5")}>
        <div style={headerStyle("#ecfdf5", "#a7f3d0")}>
          <span style={{ color: "#059669", fontSize: "18px" }}>✓</span>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.05em" }}>DCT OWNS — DELIVERED INCREMENTALLY ACROSS BATCHES</h3>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {dctOwns.map((item, i) => (
            <li key={i} style={{ padding: "10px 16px", fontSize: "13px", color: "#374151", borderBottom: i < dctOwns.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ color: "#10b981", marginTop: "2px", flexShrink: 0 }}>●</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle("#bfdbfe", "#dbeafe")}>
        <div style={headerStyle("#eff6ff", "#bfdbfe")}>
          <span style={{ color: "#2563eb", fontSize: "16px" }}>🗄</span>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.05em" }}>NOT DCT — ORIGINATES FROM EODS / CEM (SOURCE OF TRUTH), ACCESSED VIA PDC INTEGRATION LAYER</h3>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {notDct.map((item, i) => (
            <li key={i} style={{ padding: "10px 16px", fontSize: "13px", color: "#374151", borderBottom: i < notDct.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ color: "#60a5fa", marginTop: "2px", flexShrink: 0 }}>●</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle("#fde68a", "#fef3c7")}>
        <div style={headerStyle("#fffbeb", "#fde68a")}>
          <span style={{ color: "#d97706", fontSize: "18px" }}>?</span>
          <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em" }}>NEEDS DISCUSSION</h3>
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {needsDiscussion.map((item, i) => (
            <li key={i} style={{ padding: "10px 16px", fontSize: "13px", color: "#374151", borderBottom: i < needsDiscussion.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <span style={{ color: "#fbbf24", marginTop: "2px", flexShrink: 0 }}>●</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RogerMappingPage() {
  const [activeTab, setActiveTab] = useState<TabId>("screen1");

  const tabs: { id: TabId; label: string }[] = [
    { id: "screen1", label: "Screen 1 — My Clients" },
    { id: "screen2", label: "Screen 2 — Filing Structure (Client Drill-Down)" },
    { id: "ownership", label: "Ownership Summary" },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
          <div style={{ width: "40px", height: "40px", backgroundColor: "#dbeafe", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "18px" }}>🖥</span>
          </div>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: "#111827" }}>Roger UI — Data Point Mapping</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", maxWidth: "600px" }}>
              Where every data point on the Roger screens comes from — Roger UI displays only. It does NOT calculate. All business logic is owned and persisted in TDC. Roger is strictly read-only.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
          <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px" }}>Roger</span>
          <span style={{ backgroundColor: "#f3f4f6", color: "#374151", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px" }}>DCT Platform</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb", paddingBottom: "0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 500,
              borderRadius: "6px 6px 0 0",
              border: "1px solid",
              borderBottom: "none",
              cursor: "pointer",
              transition: "all 0.15s",
              backgroundColor: activeTab === tab.id ? "#1e293b" : "white",
              color: activeTab === tab.id ? "white" : "#6b7280",
              borderColor: activeTab === tab.id ? "#1e293b" : "#e5e7eb",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "screen1" && <Screen1Content />}
        {activeTab === "screen2" && <Screen2Content />}
        {activeTab === "ownership" && <OwnershipContent />}
      </div>
    </div>
  );
}
