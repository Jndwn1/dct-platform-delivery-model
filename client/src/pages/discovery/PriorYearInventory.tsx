// Prior Year (PY) Inventory Discovery
// DCT Discovery Center — Authoritative Discovery Workspace
// Source data: twbPriorYearInventory_Revised_Table_IDs.xlsx · A110 Tax Workbook · DUO Commit Export

import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = "#1e3a5f";
const GREEN  = "#059669";
const AMBER  = "#d97706";
const SLATE  = "#64748b";
const RED    = "#dc2626";
const PURPLE = "#7c3aed";
const TEAL   = "#0d9488";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${NAVY}`, paddingLeft: 14, marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: SLATE, marginBottom: 2 }}>
        Section {num}
      </div>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: NAVY, margin: "0 0 4px" }}>{title}</h2>
      {subtitle && <div style={{ fontSize: 12, color: SLATE }}>{subtitle}</div>}
    </div>
  );
}

function Callout({ type, children }: { type: "governance" | "info" | "warning" | "approved"; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    governance: { bg: "#eff6ff", border: "#93c5fd",  color: "#1e40af", label: "Governance" },
    info:       { bg: "#f0fdf4", border: "#bbf7d0",  color: "#065f46", label: "Note" },
    warning:    { bg: "#fffbeb", border: "#fde68a",  color: "#92400e", label: "⚠ Important" },
    approved:   { bg: "#f0fdf4", border: "#059669",  color: "#065f46", label: "✓ Approved Decision" },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.border}`, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: s.color }}>
      <strong>{s.label}:</strong> {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Complete":      { bg: "#f0fdf4", color: "#166534" },
    "In Progress":   { bg: "#eff6ff", color: "#1e40af" },
    "Open":          { bg: "#fef2f2", color: "#991b1b" },
    "Approved":      { bg: "#f0fdf4", color: "#065f46" },
    "Pending":       { bg: "#fffbeb", color: "#92400e" },
    "Not Started":   { bg: "#f8fafc", color: SLATE },
    "Confirmed":     { bg: "#f0fdf4", color: "#166534" },
    "Closed":        { bg: "#f0fdf4", color: "#166534" },
  };
  const s = map[status] ?? { bg: "#f8fafc", color: SLATE };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, borderRadius: 4, padding: "2px 8px", whiteSpace: "nowrap" as const }}>{status}</span>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderTop: accent ? `3px solid ${accent}` : undefined,
      borderRadius: 8, padding: "16px 20px", marginBottom: 12,
    }}>
      {children}
    </div>
  );
}

function ExpandableSection({ title, subtitle, children, defaultOpen = false }: {
  title: string; subtitle?: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 10, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 16px", background: open ? "#f8fafc" : "#fff",
          border: "none", cursor: "pointer", textAlign: "left" as const,
          borderBottom: open ? "1px solid #e2e8f0" : "none",
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: SLATE, marginTop: 2 }}>{subtitle}</div>}
        </div>
        <span style={{ fontSize: 16, color: SLATE, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
      </button>
      {open && <div style={{ padding: "16px 20px", background: "#fff" }}>{children}</div>}
    </div>
  );
}

// ─── Inventory data (from twbPriorYearInventory_Revised_Table_IDs.xlsx) ───────
const INVENTORY_ROWS = [
  { id: 460,  apiId: "9fc984ef-0f80-406d-9a0f-22ecb37d84d8", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "amountEnding",       rogerDest: "Prior Year Book Balance",   status: "Confirmed",   notes: "Migrated from authoritative TWB Commit. Stored as Prior-Year Book Balance. Used for year-over-year comparison and rollforward. No additional calculation required." },
  { id: 482,  apiId: "b4cf48ce-1c39-4625-be1d-6029a68eb87a", typeKey: "A110", table: "Tbl_FJE", worksheet: "T-35.2 Journal entries",    sourceField: "CY Tax Adjustment",  rogerDest: "PY Tax Adjustment",         status: "Pending",     notes: "Used to derive Prior-Year Tax Balance during migration. PY Tax Balance is calculated as PY Book Balance + Tax Adjustment per TDC Tax Taxonomy Code. Implementation location (Roger vs. TDC/API) to be determined by Stephane and Santosh." },
  { id: 328,  apiId: "6b26a289-d416-4cd1-86a2-a6ff24920a5c", typeKey: "A110", table: "Tbl_FJE", worksheet: "T-35.2 Journal entries",    sourceField: "glAccountName",      rogerDest: "Client Account Name",       status: "Confirmed",   notes: "Client account name matching PBC trial balance for the account code. If user posted by Tax Code and not client account, this equals the JEName." },
  { id: 392,  apiId: "06f3df46-c31a-4ece-b555-a961197dede9", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glAccountName",      rogerDest: "Client Account Name",       status: "Confirmed",   notes: "Client account name from the PBC trial balance." },
  { id: 391,  apiId: "3b7e9a12-0001-0001-0001-000000000001", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glAccountNumber",    rogerDest: "GL Account Number",         status: "Confirmed",   notes: "GL account number from PBC trial balance." },
  { id: 393,  apiId: "3b7e9a12-0001-0001-0001-000000000002", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glAccountNumberRSM", rogerDest: "RSM Account Number",        status: "Confirmed",   notes: "RSM-mapped account number." },
  { id: 394,  apiId: "3b7e9a12-0001-0001-0001-000000000003", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glAccountNumberRSMnew", rogerDest: "RSM Account Number (New)", status: "Confirmed",notes: "New RSM account number format (e.g., 1.100.010.000)." },
  { id: 395,  apiId: "3b7e9a12-0001-0001-0001-000000000004", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glAccountNameRSM",   rogerDest: "RSM Account Name",          status: "Confirmed",   notes: "RSM-mapped account name/description." },
  { id: 396,  apiId: "3b7e9a12-0001-0001-0001-000000000005", typeKey: "A110", table: "Tbl_TB",  worksheet: "T-03.1 Trial Balance",     sourceField: "glEntity",           rogerDest: "GL Entity",                 status: "Confirmed",   notes: "GL entity identifier from PBC trial balance." },
];

// ─── Mapping matrix rows (from real DUO export + inventory) ──────────────────
const MAPPING_MATRIX = [
  { invId: "460",  bizField: "Prior Year Book Balance",  duoField: "amountEnding (amountEndingPY)", twbWorksheet: "T-03.1 Trial Balance", twbField: "amountEnding", ruleCode: "TBD", inputCode: "TBD", rogerField: "Prior Year Book Balance", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "Stored as PY Book Balance; used for year-over-year comparison." },
  { invId: "482",  bizField: "PY Tax Adjustment",        duoField: "CY_Tax_Adjustment",             twbWorksheet: "T-35.2 Journal entries", twbField: "CY Tax Adjustment", ruleCode: "TBD", inputCode: "TBD", rogerField: "PY Tax Adjustment", imsExportXml: "Tbl_FJE", status: "Pending", notes: "CY Tax Adjustment stored as PY Tax Adjustment. PY Tax Balance calculated at read time. Implementation (Roger vs. DCT) TBD by Stephane & Santosh." },
  { invId: "328",  bizField: "Client Account Name (FJE)", duoField: "glAccountName",               twbWorksheet: "T-35.2 Journal entries", twbField: "glAccountName", ruleCode: "TBD", inputCode: "TBD", rogerField: "Client Account Name", imsExportXml: "Tbl_FJE", status: "Confirmed", notes: "If user posted by Tax Code, equals JEName." },
  { invId: "392",  bizField: "Client Account Name (TB)", duoField: "glAccountName",                twbWorksheet: "T-03.1 Trial Balance", twbField: "glAccountName", ruleCode: "TBD", inputCode: "TBD", rogerField: "Client Account Name", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "Client account name from PBC trial balance." },
  { invId: "391",  bizField: "GL Account Number",        duoField: "glAccountNumber",               twbWorksheet: "T-03.1 Trial Balance", twbField: "glAccountNumber", ruleCode: "TBD", inputCode: "TBD", rogerField: "GL Account Number", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "" },
  { invId: "393",  bizField: "RSM Account Number",       duoField: "glAccountNumberRSM",            twbWorksheet: "T-03.1 Trial Balance", twbField: "glAccountNumberRSM", ruleCode: "TBD", inputCode: "TBD", rogerField: "RSM Account Number", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "" },
  { invId: "394",  bizField: "RSM Account Number (New)", duoField: "glAccountNumberRSMnew",         twbWorksheet: "T-03.1 Trial Balance", twbField: "glAccountNumberRSMnew", ruleCode: "TBD", inputCode: "TBD", rogerField: "RSM Account Number (New)", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "Format: 1.100.010.000" },
  { invId: "395",  bizField: "RSM Account Name",         duoField: "glAccountNameRSM",              twbWorksheet: "T-03.1 Trial Balance", twbField: "glAccountNameRSM", ruleCode: "TBD", inputCode: "TBD", rogerField: "RSM Account Name", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "" },
  { invId: "396",  bizField: "GL Entity",                duoField: "glEntity",                      twbWorksheet: "T-03.1 Trial Balance", twbField: "glEntity", ruleCode: "TBD", inputCode: "TBD", rogerField: "GL Entity", imsExportXml: "Tbl_TB", status: "Confirmed", notes: "" },
];

// ─── Business rules ───────────────────────────────────────────────────────────
const BUSINESS_RULES = [
  {
    id: "BR-PY-001",
    title: "Prior Year Tax Adjustment",
    description: "Store Current Year Tax Adjustment as Prior Year Tax Adjustment. Prior Year Tax Balance is not persisted. It is calculated each time Prior Year values are read from the API.",
    source: "Gary Luca",
    owner: "Stephane / Santosh",
    status: "Approved",
    implNotes: "CY Tax Adjustment is stored as PY Tax Adjustment. PY Tax Balance = PY Book Balance + Tax Adjustment per TDC Tax Taxonomy Code. Calculation performed at read time — not stored. Implementation location (Roger vs. TDC/API) to be determined by Stephane and Santosh.",
  },
  {
    id: "BR-PY-002",
    title: "Prior Year Book Balance Source",
    description: "Prior Year Book Balance is migrated from the authoritative TWB Commit (amountEnding field from Tbl_TB) and stored within the Prior-Year Tax Ready Record.",
    source: "PY Inventory (ID: 460)",
    owner: "DCT",
    status: "Confirmed",
    implNotes: "No additional calculation required. Used for year-over-year comparison and rollforward.",
  },
  {
    id: "BR-PY-003",
    title: "Duplicate Field Separation",
    description: "Fields that appear in both Tbl_TB and Tbl_FJE (e.g., glAccountName, glAccountNumber) must be separated by source table in the inventory and mapping matrix.",
    source: "BA Notes — Jenniver",
    owner: "Jenniver",
    status: "Complete",
    implNotes: "Validated against TWB workbook. Inventory IDs 328 (FJE) and 392 (TB) represent the same logical field from different source tables.",
  },
  {
    id: "BR-PY-004",
    title: "IMS Export API — XML Configuration",
    description: "IMS Export APIs can retrieve Prior Year CCH return data without using DUO. Returned data depends on XML configuration provided in the API request.",
    source: "IMS Confirmation",
    owner: "IMS",
    status: "Confirmed",
    implNotes: "Existing XML configurations are available. Additional configurations can be created based on Roger/DCT requirements. Roger must define required Prior Year fields to determine XML configuration scope.",
  },
];

// ─── Open questions ───────────────────────────────────────────────────────────
const OPEN_QUESTIONS = [
  { priority: "High", question: "What Prior Year tax return data will DCT receive from IMS for CCH returns, and what business rules are required to consume it?", owner: "Jenniver / IMS", status: "In Progress", decision: "IMS confirmed Export APIs can retrieve PY CCH data without DUO. Data depends on XML config.", nextAction: "Define required PY fields; request IMS to scope XML configuration." },
  { priority: "High", question: "What is the complete list of non-Trial Balance fields in the DUO Commit that require Prior Year mapping?", owner: "Jenniver / Krista", status: "In Progress", decision: "", nextAction: "Obtain DUO Commit sample; identify non-TB fields; review with Krista." },
  { priority: "High", question: "Where will the Prior Year Tax Balance calculation be performed — Roger or TDC/API?", owner: "Stephane / Santosh", status: "Pending", decision: "Gary Luca: Either will work. Decision deferred to Stephane and Santosh.", nextAction: "Stephane and Santosh to confirm implementation location." },
  { priority: "Medium", question: "Should Group 1 and Group 2 migrate or be derived?", owner: "Jenniver / Gary", status: "Pending", decision: "", nextAction: "Await confirmation from Gary." },
  { priority: "Medium", question: "What Rule Code and Input Code combinations does Roger require for each Prior Year field?", owner: "Roger Team / Krista", status: "Open", decision: "", nextAction: "Roger team to define Rule Code + Input Code mapping per Krista's request." },
];

// ─── Action items (from BA Notes) ─────────────────────────────────────────────
const ACTION_ITEMS = [
  { priority: "High",   action: "Define Roger Prior Year requirements for IMS XML configuration", status: "In Progress", owner: "Roger Team / Jenniver", dueDate: "TBD", dependencies: "Roger UI requirements; IMS Swagger documentation" },
  { priority: "High",   action: "Continue mapping Trial Balance account fields", status: "In Progress", owner: "Jenniver", dueDate: "TBD", dependencies: "DUO Commit sample; PY Inventory" },
  { priority: "High",   action: "Identify non-Trial Balance fields requiring review", status: "Not Started", owner: "Jenniver", dueDate: "TBD", dependencies: "DUO Commit sample" },
  { priority: "High",   action: "Obtain DUO Commit sample and complete mapping", status: "In Progress", owner: "Jenniver", dueDate: "TBD", dependencies: "DUO team access" },
  { priority: "High",   action: "Update Prior Year Tax Adjustment documentation to reflect Gary's decision", status: "Not Started", owner: "Jenniver", dueDate: "TBD", dependencies: "Stephane / Santosh implementation decision" },
  { priority: "High",   action: "Review remaining non-TB fields with Krista to determine inclusion/exclusion", status: "Not Started", owner: "Jenniver / Krista", dueDate: "TBD", dependencies: "Non-TB field list; DUO Commit sample" },
];

// ─── Workstreams ──────────────────────────────────────────────────────────────
const WORKSTREAMS = [
  {
    id: 1, title: "Inventory Validation",
    objective: "Validate every Prior Year inventory field against the authoritative source artifacts.",
    status: "In Progress",
    findings: "Source tables (Tbl_TB, Tbl_FJE) and worksheet names validated against TWB workbook. Duplicate fields (glAccountName, glAccountNumber) separated by source table. Roger Destination column populated.",
    nextSteps: "Validate remaining fields; confirm Group 1 and Group 2 migration vs. derivation.",
    dependencies: "TWB workbook; PY Inventory spreadsheet",
    owner: "Jenniver",
  },
  {
    id: 2, title: "Trial Balance Mapping",
    objective: "Map all Trial Balance account fields from the DUO Commit to the PY Inventory.",
    status: "In Progress",
    findings: "TB account fields (amountEnding, glAccountName, glAccountNumber, glAccountNumberRSM, glAccountNumberRSMnew, glAccountNameRSM, glEntity) identified and mapped. amountEndingPY confirmed as the PY Book Balance source.",
    nextSteps: "Continue mapping remaining TB account fields from the account list.",
    dependencies: "DUO Commit sample; account list",
    owner: "Jenniver",
  },
  {
    id: 3, title: "Non-Trial Balance Discovery",
    objective: "Identify all non-Trial Balance fields in the DUO Commit that require Prior Year mapping.",
    status: "Not Started",
    findings: "Journal Entry fields (CY_Tax_Adjustment, glAccountName, JEName, JEType) identified as non-TB fields requiring mapping.",
    nextSteps: "Obtain DUO Commit sample; identify full list of non-TB fields; review with Krista.",
    dependencies: "DUO Commit sample",
    owner: "Jenniver",
  },
  {
    id: 4, title: "DUO Commit Analysis",
    objective: "Analyze the DUO Commit export to identify all available Prior Year fields and their structure.",
    status: "In Progress",
    findings: "DUO export structure confirmed: TrialBalanceEntities (82 rows), JournalEntryEntities (3 rows), DataTransferEntities (11,012 rows). TWB version: QA 2.11.31.1. TypeKey: A110.",
    nextSteps: "Obtain production DUO Commit sample; complete field mapping.",
    dependencies: "DUO team; production commit access",
    owner: "Jenniver",
  },
  {
    id: 5, title: "IMS Export API Discovery",
    objective: "Define what Prior Year CCH return data is available through IMS Export APIs and what XML configurations are required.",
    status: "In Progress",
    findings: "IMS confirmed Export APIs can retrieve PY CCH return data without DUO. Data depends on XML configuration. Existing XML configurations available. API documentation available through IMS Swagger.",
    nextSteps: "Roger team to define required PY fields; IMS to scope XML configuration.",
    dependencies: "Roger UI requirements; IMS Swagger documentation",
    owner: "IMS / Roger Team",
  },
  {
    id: 6, title: "Business Rule Validation",
    objective: "Validate and document all business rules governing Prior Year data ingestion and calculation.",
    status: "In Progress",
    findings: "BR-PY-001 (PY Tax Adjustment) approved by Gary Luca. BR-PY-002 (PY Book Balance) confirmed. BR-PY-003 (Duplicate Field Separation) complete. BR-PY-004 (IMS Export API) confirmed.",
    nextSteps: "Update PY Tax Adjustment documentation; confirm implementation location with Stephane and Santosh.",
    dependencies: "Stephane / Santosh decision on calculation location",
    owner: "Jenniver / Gary Luca",
  },
  {
    id: 7, title: "Roger Mapping Discovery",
    objective: "Define the Rule Code and Input Code combinations required by Roger for each Prior Year field.",
    status: "Open",
    findings: "Krista requested a table identifying TWB field from DUO and corresponding Rule Code + Input Code required by Roger. No Rule Codes or Input Codes have been defined yet.",
    nextSteps: "Roger team to define Rule Code + Input Code mapping per field.",
    dependencies: "Roger UI requirements; Roger team availability",
    owner: "Roger Team / Krista",
  },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PriorYearInventory() {
  const [activeTab, setActiveTab] = useState<"inventory" | "matrix">("inventory");

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28, borderBottom: "2px solid #e2e8f0", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontWeight: 900, fontSize: 14 }}>PY</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: 0, lineHeight: 1 }}>Prior Year (PY) Inventory Discovery</h1>
            <div style={{ fontSize: 11, color: SLATE, marginTop: 2 }}>DCT Discovery Center · Authoritative Discovery Workspace · Living Artifact</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" as const }}>
          {[
            { label: "Source of Truth: PY Inventory", color: NAVY },
            { label: "DUO Commit Validated", color: GREEN },
            { label: "A110 TWB Referenced", color: TEAL },
            { label: "IMS Export API Confirmed", color: PURPLE },
            { label: "Living Discovery Artifact", color: AMBER },
          ].map(b => (
            <span key={b.label} style={{ fontSize: 11, fontWeight: 600, color: "white", background: b.color, borderRadius: 4, padding: "3px 8px" }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* ── Section 1: Overview ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="1" title="Overview" subtitle="Purpose and scope of this discovery workspace" />
        <Card>
          <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: "0 0 10px" }}>
            The <strong>Prior Year Inventory</strong> is the <strong>authoritative source of truth</strong> for all Prior Year data required by DCT. This page documents the discovery, validation, business rules, ownership, mapping decisions, dependencies, and implementation guidance needed to support Prior Year data ingestion and consumption by Roger.
          </p>
          <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: "0 0 10px" }}>
            The <strong>DUO Commit file</strong>, <strong>A110 Tax Workbook</strong>, <strong>IMS Export APIs</strong>, and <strong>Roger requirements</strong> are supporting source artifacts used to validate and enrich the inventory. Discovery validates inventory fields against these legacy source artifacts to establish canonical Prior Year data definitions.
          </p>
          <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: 0 }}>
            This page serves <strong>Business Analysts, Architects, Developers, QA, IMS, and Roger teams</strong> as the single reference for all Prior Year data decisions.
          </p>
        </Card>
        <Callout type="governance">
          This is a living discovery artifact. All decisions, business rules, and mappings documented here represent the current state of discovery and are subject to change until formally approved through the DCT governance process.
        </Callout>
      </div>

      {/* ── Section 2: Objectives ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="2" title="Objectives" subtitle="Discovery goals for the Prior Year initiative" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
          {[
            { num: "01", text: "Validate every Prior Year inventory field against source artifacts", color: NAVY },
            { num: "02", text: "Identify authoritative source data for each field", color: NAVY },
            { num: "03", text: "Define canonical Prior Year data for DCT", color: NAVY },
            { num: "04", text: "Capture and document all business rules", color: GREEN },
            { num: "05", text: "Document implementation decisions and their rationale", color: GREEN },
            { num: "06", text: "Identify gaps requiring business review", color: AMBER },
            { num: "07", text: "Support Roger Prior Year functionality requirements", color: TEAL },
          ].map(obj => (
            <div key={obj.num} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: obj.color, color: "white", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{obj.num}</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>{obj.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Source Artifacts ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="3" title="Source Artifacts" subtitle="Source of truth and supporting reference artifacts" />

        {/* Source of Truth */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: GREEN, marginBottom: 8 }}>● Source of Truth</div>
          <Card accent={GREEN}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Prior Year Inventory</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 8 }}>Authoritative inventory of all Prior Year fields required for DCT.</div>
                <div style={{ fontSize: 12, color: SLATE }}>
                  <strong>Contains:</strong> Inventory IDs · Business descriptions · Roger destination · Discovery status · Notes · Business rules
                </div>
              </div>
              <StatusBadge status="Confirmed" />
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" as const }}>
              {["Inventory IDs", "Business Descriptions", "Roger Destination", "Discovery Status", "Notes", "Business Rules"].map(tag => (
                <span key={tag} style={{ fontSize: 10, background: "#f0fdf4", color: "#065f46", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
          </Card>
        </div>

        {/* Supporting Sources */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: SLATE, marginBottom: 8 }}>Supporting Sources</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
            <Card accent={TEAL}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>DUO Commit File</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Reference source used to validate Prior Year field mappings and identify non-Trial Balance fields.</div>
              <div style={{ fontSize: 11, color: SLATE }}>
                <strong>Confirmed structure:</strong> TrialBalanceEntities (82 rows) · JournalEntryEntities (3 rows) · DataTransferEntities (11,012 rows) · TWB Version: QA 2.11.31.1
              </div>
            </Card>
            <Card accent={NAVY}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>A110 Tax Workbook</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Reference implementation showing how practitioners maintain Prior Year information within the legacy Tax Workbook.</div>
              <div style={{ fontSize: 11, color: SLATE }}>
                <strong>Key worksheets:</strong> T-03.1 Trial Balance · T-35.2 Journal Entries · TypeKey: A110
              </div>
            </Card>
            <Card accent={PURPLE}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>IMS Export APIs</div>
              <div style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>Provides configurable XML-based export of Prior Year CCH return information.</div>
              <div style={{ fontSize: 11, color: "#6b21a8", background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 6, padding: "6px 10px" }}>
                <strong>Discovery Note:</strong> IMS confirmed Export APIs can retrieve Prior Year CCH return data without using DUO. Returned data depends on XML configuration. Additional XML configurations can be created as needed.
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Section 4: Ownership ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="4" title="Ownership & Responsibilities" subtitle="Three-column ownership matrix across DCT, Roger, and IMS" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {/* DCT */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${NAVY}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 12 }}>DCT</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Owns</div>
            <ul style={{ margin: "0 0 14px", paddingLeft: 16, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
              {["Understanding available PY data from IMS and DUO", "Maintaining the PY Inventory as source of truth", "Defining canonical Prior Year data", "Validating inventory against source artifacts", "Identifying data gaps", "Defining governed APIs", "Persisting Prior Year data", "Exposing PY data through DCT APIs"].map(item => <li key={item}>{item}</li>)}
            </ul>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Deliverables</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {["PY Inventory", "Canonical Data Model", "Mapping Crosswalk", "Business Rules", "Gap Analysis", "API Contract"].map(d => (
                <span key={d} style={{ fontSize: 10, background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          </div>
          {/* Roger */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${TEAL}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: TEAL, marginBottom: 12 }}>Roger</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Owns</div>
            <ul style={{ margin: "0 0 14px", paddingLeft: 16, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
              {["Determining PY data required by the Roger UI", "Defining Rule Code and Input Code combinations", "Determining where PY values populate", "Consuming IMS or DCT APIs", "Roger user experience", "Roger business rules"].map(item => <li key={item}>{item}</li>)}
            </ul>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Deliverables</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {["Rule Code Mapping", "Input Code Mapping", "UI Requirements", "Business Rules"].map(d => (
                <span key={d} style={{ fontSize: 10, background: "#f0fdfa", color: "#0f766e", border: "1px solid #99f6e4", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          </div>
          {/* IMS */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${PURPLE}`, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: PURPLE, marginBottom: 12 }}>IMS</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Owns</div>
            <ul style={{ margin: "0 0 14px", paddingLeft: 16, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
              {["Export APIs", "Swagger documentation", "XML configurations", "Returning Prior Year CCH data", "Creating new XML configurations when required"].map(item => <li key={item}>{item}</li>)}
            </ul>
            <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 6 }}>Deliverables</div>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 4 }}>
              {["Export APIs", "XML Configurations", "Sample Payloads", "API Documentation"].map(d => (
                <span key={d} style={{ fontSize: 10, background: "#faf5ff", color: "#6b21a8", border: "1px solid #d8b4fe", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Discovery Workstreams ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="5" title="Discovery Workstreams" subtitle="Seven active workstreams — click to expand" />
        {WORKSTREAMS.map(ws => (
          <ExpandableSection key={ws.id} title={`${ws.id}. ${ws.title}`} subtitle={ws.objective} defaultOpen={ws.id <= 2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {[
                { label: "Objective", value: ws.objective, color: NAVY },
                { label: "Current Status", value: <StatusBadge status={ws.status} />, color: SLATE },
                { label: "Findings", value: ws.findings, color: SLATE },
                { label: "Next Steps", value: ws.nextSteps, color: GREEN },
                { label: "Dependencies", value: ws.dependencies, color: AMBER },
                { label: "Owner", value: ws.owner, color: TEAL },
              ].map(field => (
                <div key={field.label} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: field.color, textTransform: "uppercase" as const, letterSpacing: "0.07em", marginBottom: 4 }}>{field.label}</div>
                  <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{field.value}</div>
                </div>
              ))}
            </div>
          </ExpandableSection>
        ))}
      </div>

      {/* ── Section 6: Cross-Team Deliverable — Mapping Matrix ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="6" title="Cross-Team Deliverable — Prior Year Mapping Matrix" subtitle="End-to-end traceability: PY Inventory → DUO Commit → TWB → IMS Export → Roger" />
        <Callout type="info">
          This matrix addresses Krista's request to identify the TWB field from DUO and the corresponding Rule Code and Input Code required by Roger, expanded into a complete traceability matrix across all systems.
        </Callout>

        {/* Tab selector */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {(["inventory", "matrix"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, border: "none", cursor: "pointer",
              background: activeTab === tab ? NAVY : "#f1f5f9",
              color: activeTab === tab ? "white" : SLATE,
            }}>
              {tab === "inventory" ? "PY Inventory Fields" : "Full Traceability Matrix"}
            </button>
          ))}
        </div>

        {activeTab === "inventory" && (
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY, color: "white" }}>
                  {["Inv. ID", "API ID", "Type", "Source Table", "Worksheet", "Source Field", "Roger Destination", "Status", "Notes"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left" as const, fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVENTORY_ROWS.map((row, i) => (
                  <tr key={row.id} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: NAVY }}>{row.id}</td>
                    <td style={{ padding: "8px 10px", color: SLATE, fontSize: 10, fontFamily: "monospace" }}>{row.apiId.slice(0, 8)}…</td>
                    <td style={{ padding: "8px 10px" }}><span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{row.typeKey}</span></td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: PURPLE }}>{row.table}</td>
                    <td style={{ padding: "8px 10px", color: "#374151" }}>{row.worksheet}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: 11, color: TEAL }}>{row.sourceField}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: NAVY }}>{row.rogerDest}</td>
                    <td style={{ padding: "8px 10px" }}><StatusBadge status={row.status} /></td>
                    <td style={{ padding: "8px 10px", color: "#475569", maxWidth: 280 }}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "matrix" && (
          <div style={{ overflowX: "auto" as const }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 11 }}>
              <thead>
                <tr style={{ background: NAVY, color: "white" }}>
                  {["Inv. ID", "Business Field", "DUO Commit Field", "TWB Worksheet", "TWB Field", "Rule Code", "Input Code", "Roger Field", "IMS Export XML", "Status", "Notes"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left" as const, fontWeight: 700, fontSize: 10, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MAPPING_MATRIX.map((row, i) => (
                  <tr key={row.invId + row.bizField} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: NAVY }}>{row.invId}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 600, color: "#1e293b" }}>{row.bizField}</td>
                    <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 10, color: TEAL }}>{row.duoField}</td>
                    <td style={{ padding: "7px 10px", color: "#374151" }}>{row.twbWorksheet}</td>
                    <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 10, color: PURPLE }}>{row.twbField}</td>
                    <td style={{ padding: "7px 10px" }}><span style={{ background: "#fffbeb", color: "#92400e", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{row.ruleCode}</span></td>
                    <td style={{ padding: "7px 10px" }}><span style={{ background: "#fffbeb", color: "#92400e", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700 }}>{row.inputCode}</span></td>
                    <td style={{ padding: "7px 10px", fontWeight: 600, color: NAVY }}>{row.rogerField}</td>
                    <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 10, color: PURPLE }}>{row.imsExportXml}</td>
                    <td style={{ padding: "7px 10px" }}><StatusBadge status={row.status} /></td>
                    <td style={{ padding: "7px 10px", color: "#475569", maxWidth: 200 }}>{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, fontSize: 11, color: AMBER }}>⚠ Rule Code and Input Code values are TBD — pending Roger team definition per Krista's request.</div>
          </div>
        )}
      </div>

      {/* ── Section 7: Business Rules ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="7" title="Business Rules" subtitle="Approved and confirmed business rules governing Prior Year data" />
        {BUSINESS_RULES.map(br => (
          <Card key={br.id} accent={br.status === "Approved" ? GREEN : br.status === "Confirmed" ? TEAL : AMBER}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" as const, gap: 8, marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: SLATE, borderRadius: 4, padding: "2px 7px", marginRight: 8 }}>{br.id}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{br.title}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <StatusBadge status={br.status} />
                <span style={{ fontSize: 11, color: SLATE }}>Source: {br.source}</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, margin: "0 0 8px" }}>{br.description}</p>
            <div style={{ fontSize: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px" }}>
              <strong style={{ color: NAVY }}>Implementation Notes:</strong> <span style={{ color: "#475569" }}>{br.implNotes}</span>
            </div>
            <div style={{ marginTop: 6, fontSize: 11, color: SLATE }}>Owner: <strong>{br.owner}</strong></div>
          </Card>
        ))}
      </div>

      {/* ── Section 8: Open Questions ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="8" title="Open Questions" subtitle="Unresolved questions requiring business or architecture decisions" />
        <div style={{ overflowX: "auto" as const }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Priority", "Question", "Owner", "Status", "Decision", "Next Action"].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left" as const, fontWeight: 700, fontSize: 11, color: NAVY, borderBottom: "2px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OPEN_QUESTIONS.map((q, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: q.priority === "High" ? "#fef2f2" : "#fffbeb", color: q.priority === "High" ? RED : AMBER, borderRadius: 4, padding: "2px 7px" }}>{q.priority}</span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "#1e293b", maxWidth: 280 }}>{q.question}</td>
                  <td style={{ padding: "9px 12px", color: SLATE, whiteSpace: "nowrap" as const }}>{q.owner}</td>
                  <td style={{ padding: "9px 12px" }}><StatusBadge status={q.status} /></td>
                  <td style={{ padding: "9px 12px", color: "#374151", maxWidth: 220 }}>{q.decision || <span style={{ color: "#94a3b8" }}>—</span>}</td>
                  <td style={{ padding: "9px 12px", color: "#374151", maxWidth: 220 }}>{q.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 9: Action Items ── */}
      <div style={{ marginBottom: 28 }}>
        <SectionHeader num="9" title="Action Items" subtitle="Tracked actions with priority, status, owner, due date, and dependencies" />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {ACTION_ITEMS.map((item, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 100px 100px 1fr", gap: 10, alignItems: "start", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", fontSize: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "#fef2f2", color: RED, borderRadius: 4, padding: "2px 7px", textAlign: "center" as const }}>{item.priority}</span>
              <div style={{ color: "#1e293b", fontWeight: 500 }}>{item.action}</div>
              <StatusBadge status={item.status} />
              <div style={{ color: SLATE }}>{item.owner}</div>
              <div style={{ color: SLATE }}>{item.dueDate}</div>
              <div style={{ color: "#475569", fontSize: 11 }}>{item.dependencies}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: SLATE, fontStyle: "italic" }}>
          Action item header: Priority · Action · Status · Owner · Due Date · Dependencies
        </div>
      </div>

      {/* ── Ask Buddy ── */}
      <DiscoveryAskBuddy pagePath="prior-year-inventory" pageTitle="Prior Year (PY) Inventory Discovery" />
    </div>
  );
}
