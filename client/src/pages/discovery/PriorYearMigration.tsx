// Prior Year Migration — Legacy Tax Workbooks → Roger → DCT
// Discovery Workspace — Living Business Discovery Artifact

import { useState } from "react";
import { Link } from "wouter";

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY  = "#1e3a5f";
const GREEN = "#059669";
const AMBER = "#d97706";
const SLATE = "#64748b";
const TEAL  = "#0d9488";
const PURPLE = "#7c3aed";
const RED   = "#dc2626";

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

function Callout({ type, children }: { type: "governance" | "info" | "warning" | "proposed"; children: React.ReactNode }) {
  const styles: Record<string, { bg: string; border: string; color: string; label: string }> = {
    governance: { bg: "#eff6ff", border: "#93c5fd", color: "#1e40af", label: "Governance" },
    info:       { bg: "#f0fdf4", border: "#bbf7d0", color: "#065f46", label: "Note" },
    warning:    { bg: "#fffbeb", border: "#fde68a", color: "#92400e", label: "⚠ Important" },
    proposed:   { bg: "#faf5ff", border: "#d8b4fe", color: "#6b21a8", label: "Proposed — Not Finalized" },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderLeft: `4px solid ${s.border}`, borderRadius: 8, padding: "10px 16px", marginBottom: 14, fontSize: 12, color: s.color }}>
      <strong>{s.label}:</strong> {children}
    </div>
  );
}

function FlowStep({ step, label, sub, isUser }: { step: number; label: string; sub?: string; isUser?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4 }}>
      <div style={{
        background: isUser ? AMBER : NAVY,
        color: "white", borderRadius: 8,
        padding: "10px 18px", textAlign: "center" as const,
        minWidth: 160, fontSize: 12, fontWeight: 700,
        border: isUser ? `2px solid ${AMBER}` : `2px solid ${NAVY}`,
      }}>
        <div style={{ fontSize: 10, opacity: 0.8, marginBottom: 2 }}>Step {step}</div>
        {label}
        {sub && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function FlowArrow() {
  return <div style={{ fontSize: 18, color: SLATE, lineHeight: 1, margin: "4px 0" }}>↓</div>;
}

function StatusBadge({ status }: { status: "Confirmed" | "Candidate" | "Open" | "Closed" | "In Progress" }) {
  const map: Record<string, { bg: string; color: string }> = {
    Confirmed:   { bg: "#f0fdf4", color: "#166534" },
    Candidate:   { bg: "#fffbeb", color: "#92400e" },
    Open:        { bg: "#fef2f2", color: "#991b1b" },
    Closed:      { bg: "#f0fdf4", color: "#166534" },
    "In Progress": { bg: "#eff6ff", color: "#1e40af" },
  };
  const s = map[status] ?? { bg: "#f8fafc", color: SLATE };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, background: s.bg, color: s.color, borderRadius: 4, padding: "2px 8px" }}>{status}</span>
  );
}

// ─── Business Requirements ────────────────────────────────────────────────────
const BUSINESS_REQUIREMENTS = [
  {
    id: "BR-001", title: "Prior Year Retrieval",
    purpose: "The system must be able to retrieve prior-year tax data for a given entity and tax year.",
    rules: ["Prior year data must be retrieved from the authoritative source (DUO/CDS via CEM APIs).", "Retrieval must be scoped to the correct legal entity and tax year.", "Retrieval must not modify or overwrite current-year data."],
    dependencies: ["CEM API availability", "Legal Entity ID resolution", "Prior Year Project identification"],
    openQuestions: ["Is retrieval triggered automatically on workspace open, or by user action?", "What happens if no prior-year data exists for the entity?"],
    ac: ["Given a valid entity and tax year, the system retrieves prior-year data without error.", "Given no prior-year data exists, the system displays an appropriate message."],
  },
  {
    id: "BR-002", title: "Prior Year Project Selection",
    purpose: "When multiple prior-year projects exist for an entity, the user must be able to select the correct project.",
    rules: ["If only one project exists, selection may be automatic.", "If multiple projects exist, the user must be presented with a selection UI.", "The selected project determines the Job ID used for retrieval."],
    dependencies: ["BR-001 Prior Year Retrieval", "Roger UI — Project Picker component"],
    openQuestions: ["Should Roger remember the last selected project for the same entity?", "How are short-year returns handled when multiple projects exist?"],
    ac: ["Given multiple prior-year projects, a project picker is displayed.", "Given one prior-year project, the system may auto-select without user interaction (pending decision)."],
  },
  {
    id: "BR-003", title: "Job ID Resolution",
    purpose: "The system must resolve the correct Job ID from the selected prior-year project.",
    rules: ["Job ID must be derived from the selected Prior Year Project.", "Job ID must be validated before retrieval proceeds.", "If Job ID cannot be resolved, the user must be notified."],
    dependencies: ["BR-002 Prior Year Project Selection", "CEM API — Job ID lookup"],
    openQuestions: ["Can Job ID be derived automatically without user input in all cases?", "What is the fallback if Job ID resolution fails?"],
    ac: ["Given a selected project, the correct Job ID is resolved.", "Given a resolution failure, the user receives a clear error message."],
  },
  {
    id: "BR-004", title: "Commit Selection",
    purpose: "The user must be able to select the correct DUO commit to use as the prior-year source.",
    rules: ["Available commits must be retrieved from DUO for the resolved Job ID.", "Commits must be displayed with sufficient metadata for the user to identify the correct one.", "The selected commit determines the data set used for migration."],
    dependencies: ["BR-003 Job ID Resolution", "DUO API — Commit retrieval"],
    openQuestions: ["Should the most recent commit be auto-selected?", "What metadata should be displayed per commit (date, status, description)?"],
    ac: ["Given a resolved Job ID, available commits are displayed.", "Given a selected commit, the system uses that commit's data for migration."],
  },
  {
    id: "BR-005", title: "Source of Truth Selection",
    purpose: "The user must confirm or select the authoritative source of truth for prior-year data before migration proceeds.",
    rules: ["The approved workbook is the source of truth for Master Data.", "CDS mappings are the source of truth for mapping data.", "The user must confirm the source before migration is executed."],
    dependencies: ["BR-004 Commit Selection", "Master Data Workbook"],
    openQuestions: ["Is source selection always required, or only when ambiguity exists?"],
    ac: ["Given a selected commit, the user is presented with the source of truth confirmation.", "Given user confirmation, migration proceeds with the confirmed source."],
  },
  {
    id: "BR-006", title: "Migration Execution",
    purpose: "The system must execute the prior-year migration after all selections and confirmations are complete.",
    rules: ["Migration must not begin until all required selections are confirmed.", "Migration must be atomic — partial migrations must not leave data in an inconsistent state.", "Migration progress must be visible to the user."],
    dependencies: ["BR-005 Source of Truth Selection", "DCT persistence layer", "Roger orchestration"],
    openQuestions: ["What is the expected migration duration? Is a progress indicator sufficient?", "Should migration be synchronous or asynchronous?"],
    ac: ["Given all confirmations complete, migration executes without error.", "Given a migration failure, the system rolls back and notifies the user."],
  },
  {
    id: "BR-007", title: "Prior Year Data Population",
    purpose: "After migration, prior-year data must be available in the Roger workspace for the current-year engagement.",
    rules: ["Migrated data must be visible in Roger within the same session.", "Data must be correctly mapped to the current-year structure.", "Prior-year data must not overwrite current-year entries."],
    dependencies: ["BR-006 Migration Execution", "DCT data model", "Roger UI data binding"],
    openQuestions: ["Which Roger screens display prior-year data?", "How is prior-year data visually distinguished from current-year data?"],
    ac: ["Given a completed migration, prior-year data appears in the Roger workspace.", "Given a current-year entry exists, prior-year data is displayed alongside without overwriting."],
  },
  {
    id: "BR-008", title: "Mapping Translation",
    purpose: "Legacy CDS mappings must be translated into DCT-compatible Known Mappings.",
    rules: ["Translation must preserve the semantic meaning of the original mapping.", "Unmapped items must be flagged for user review.", "Translation rules must be documented and auditable."],
    dependencies: ["CDS API", "DCT Known Mapping model", "Taxonomy translation tables"],
    openQuestions: ["How are taxonomy differences between legacy and DCT handled?", "Who owns the translation table maintenance?"],
    ac: ["Given a CDS mapping, a corresponding DCT Known Mapping is generated.", "Given an unmapped item, the user is notified and prompted to resolve."],
  },
  {
    id: "BR-009", title: "User Confirmation",
    purpose: "The user must confirm migration results before they are committed as governed DCT data.",
    rules: ["A migration summary must be presented before final commit.", "The user must explicitly approve the migration.", "Approval must be logged with user identity and timestamp."],
    dependencies: ["BR-006 Migration Execution", "Roger UI — Confirmation dialog", "DCT audit log"],
    openQuestions: ["Is approval required for every migration, or only for first-time or high-risk migrations?"],
    ac: ["Given a completed migration, a summary is displayed for user review.", "Given user approval, the migration is committed and the approval is logged."],
  },
  {
    id: "BR-010", title: "Error Handling",
    purpose: "The system must handle migration errors gracefully and provide actionable guidance to the user.",
    rules: ["All errors must be logged with sufficient detail for diagnosis.", "User-facing error messages must be clear and non-technical.", "The system must support retry for transient failures."],
    dependencies: ["All prior BRs", "DCT error logging", "Roger UI — Error display"],
    openQuestions: ["What errors are retryable vs. terminal?", "Who is notified on migration failure — user only, or also support team?"],
    ac: ["Given a transient failure, the user is offered a retry option.", "Given a terminal failure, the user receives a clear message and support contact."],
  },
];

// ─── Data inventory ───────────────────────────────────────────────────────────
const DATA_INVENTORY = [
  { type: "Trial Balance",       source: "DUO / CDS",  roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Journal Entries",     source: "DUO",        roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Known Mappings",      source: "CDS",        roger: "Yes", dct: "Yes", userSel: "TBD", auto: "Partial" },
  { type: "CDS Mappings",        source: "CDS",        roger: "Yes", dct: "Yes", userSel: "TBD", auto: "Partial" },
  { type: "Tax Adjustments",     source: "Tax WB",     roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Book Return",         source: "Tax WB",     roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Book-to-Tax",         source: "Tax WB",     roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Reference Data",      source: "DCT / TDC",  roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Calculation Data",    source: "Tax WB",     roger: "Yes", dct: "Yes", userSel: "TBD", auto: "TBD" },
  { type: "Prior Year Amounts",  source: "DUO",        roger: "Yes", dct: "Yes", userSel: "No",  auto: "Yes" },
  { type: "Tax Calculations",    source: "Tax WB",     roger: "Yes", dct: "Yes", userSel: "TBD", auto: "TBD" },
];

// ─── Automation decision matrix ───────────────────────────────────────────────
const AUTOMATION_MATRIX = [
  { type: "Prior Year Project",  auto: "No",  userSel: "Yes (if multiple)", userApproval: "No",  oq: "Can be auto-selected if only one exists?" },
  { type: "Job ID",              auto: "Yes", userSel: "No",                userApproval: "No",  oq: "What if Job ID cannot be derived?" },
  { type: "DUO Commits",         auto: "No",  userSel: "Yes",               userApproval: "No",  oq: "Should most recent commit be default?" },
  { type: "CDS Mappings",        auto: "Yes", userSel: "No",                userApproval: "TBD", oq: "Who approves mapping translation?" },
  { type: "Trial Balance",       auto: "Yes", userSel: "No",                userApproval: "No",  oq: "None" },
  { type: "Known Mappings",      auto: "Partial", userSel: "TBD",           userApproval: "TBD", oq: "How are unmapped items handled?" },
  { type: "Tax Adjustments",     auto: "Yes", userSel: "No",                userApproval: "No",  oq: "None" },
  { type: "Migration Execution", auto: "No",  userSel: "No",                userApproval: "Yes", oq: "Is approval always required?" },
];

// ─── Risks ────────────────────────────────────────────────────────────────────
const RISKS = [
  { risk: "Multiple Prior Year Projects",  impact: "High",   mit: "Present project picker UI; document selection rules" },
  { risk: "Multiple Job IDs per project",  impact: "High",   mit: "Define Job ID resolution logic; escalate to architecture" },
  { risk: "Multiple Commits",              impact: "Medium", mit: "Default to most recent; allow user override" },
  { risk: "Short-Year Returns",            impact: "High",   mit: "Document short-year handling rules; flag as open question" },
  { risk: "Incorrect automatic selection", impact: "High",   mit: "Require user confirmation for high-risk selections" },
  { risk: "Legacy data inconsistencies",   impact: "Medium", mit: "Validate data before migration; surface errors clearly" },
  { risk: "Translation complexity",        impact: "High",   mit: "Build and maintain translation tables; audit all mappings" },
  { risk: "Performance",                   impact: "Medium", mit: "Async migration with progress indicator; set SLA expectations" },
  { risk: "Migration failures",            impact: "High",   mit: "Atomic migration with rollback; retry for transient failures" },
  { risk: "User confusion",                impact: "Medium", mit: "Migration wizard with clear step-by-step guidance" },
];

// ─── Open questions ───────────────────────────────────────────────────────────
const OPEN_QUESTIONS = [
  { q: "How is Prior Year migration initiated?",                    status: "Open" as const },
  { q: "When should migration occur — on workspace open or on demand?", status: "Open" as const },
  { q: "Should migration happen automatically without user action?", status: "Open" as const },
  { q: "Should users always select a project, or only when multiple exist?", status: "Open" as const },
  { q: "Can Job ID be derived without user input in all cases?",    status: "Open" as const },
  { q: "Should Roger remember previous project selections?",        status: "Open" as const },
  { q: "How are short-year returns handled?",                       status: "Open" as const },
  { q: "Where should prior-year data be stored — separate tables or existing Tax Ready tables?", status: "Open" as const },
  { q: "How are taxonomy differences between legacy and DCT translated?", status: "Open" as const },
  { q: "Who owns the translation table maintenance?",               status: "Open" as const },
  { q: "Is user approval required for every migration?",            status: "Open" as const },
  { q: "What errors are retryable vs. terminal?",                   status: "Open" as const },
];

// ─── Decisions log ────────────────────────────────────────────────────────────
const DECISIONS: { date: string; decision: string; owner: string; status: "Confirmed" | "In Progress" | "Open"; reason: string }[] = [
  { date: "Jul 2026", decision: "Roger orchestrates the user experience; DCT owns persistence and governed data.", owner: "Architecture", status: "Confirmed", reason: "Separation of concerns — Roger = practitioner UX, DCT = data authority." },
  { date: "Jul 2026", decision: "Migration must be atomic — partial migrations are not permitted.",                owner: "Architecture", status: "Confirmed", reason: "Data integrity requirement — inconsistent state is unacceptable." },
  { date: "TBD",      decision: "Whether Job ID can always be derived automatically.",                            owner: "BA / Dev",     status: "Open",      reason: "Depends on CEM API capability and data quality." },
  { date: "TBD",      decision: "Whether user approval is required for every migration.",                         owner: "Business",     status: "Open",      reason: "Business risk tolerance and UX tradeoff to be decided." },
  { date: "TBD",      decision: "Short-year return handling approach.",                                           owner: "BA / Dev",     status: "Open",      reason: "Requires business rules from tax subject matter experts." },
];

// ─── Related links ────────────────────────────────────────────────────────────
const RELATED_LINKS = [
  { label: "DCT Overview",           path: "/discovery/dct-overview" },
  { label: "Roger Overview",         path: "/discovery/roger-overview" },
  { label: "Data Gateway",           path: "/discovery/data-gateway" },
  { label: "IMS Integration",        path: "/discovery/gosystem" },
  { label: "Integration Architecture", path: "/discovery/integration-architecture" },
  { label: "Ecosystem Overview",     path: "/discovery/ecosystem" },
  { label: "UAT Readiness",          path: "/uat-testing" },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PriorYearMigration() {
  const [expandedBR, setExpandedBR] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28, borderBottom: `2px solid #e2e8f0`, paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: GREEN, fontWeight: 900, fontSize: 16 }}>PY</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: 0 }}>Prior Year Migration</h1>
            <div style={{ fontSize: 11, color: SLATE, marginTop: 2 }}>Legacy Tax Workbooks → Roger → DCT · Business Discovery Artifact · Living Document</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" as const }}>
          {[
            { label: "Living Document", color: GREEN },
            { label: "Business Discovery", color: NAVY },
            { label: "Not Finalized", color: AMBER },
            { label: "10 Open Questions", color: RED },
            { label: "2 Confirmed Decisions", color: TEAL },
          ].map(b => (
            <span key={b.label} style={{ fontSize: 11, fontWeight: 600, color: "white", background: b.color, borderRadius: 4, padding: "3px 8px" }}>{b.label}</span>
          ))}
        </div>
        <Callout type="info">
          This page is a <strong>living discovery document</strong>. It should be updated as requirements are refined, decisions are made, and open questions are resolved. It is not a technical design document — it is a business discovery artifact that defines scope, requirements, and integration points.
        </Callout>
      </div>

      {/* ── Section 01 — Purpose ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="01" title="Purpose" subtitle="Central discovery and requirements repository for Prior Year migration into DCT and Roger." />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: "0 0 14px" }}>
            This page documents how prior-year tax data is <strong>retrieved, migrated, mapped, and consumed</strong> within Roger and DCT. It serves as the authoritative discovery artifact for the Prior Year Migration capability.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { label: "Existing Tax Workbooks behavior",   color: NAVY },
              { label: "Existing DCT capabilities",         color: TEAL },
              { label: "Roger responsibilities",            color: GREEN },
              { label: "DCT responsibilities",              color: NAVY },
              { label: "Legacy system dependencies",        color: AMBER },
              { label: "Business workflow",                 color: SLATE },
              { label: "Open design decisions",             color: RED },
              { label: "Outstanding requirements",          color: PURPLE },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "#1e293b" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 02 — Business Problem ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="02" title="Business Problem" subtitle="Why Prior Year Migration requires new workflow and UI in Roger." />
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderLeft: `4px solid ${RED}`, borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Current State — Tax Workbooks</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.8 }}>
                <li>User <strong>explicitly selects</strong> a prior-year project during rollover</li>
                <li>Project determines the Job ID</li>
                <li>Job ID retrieves DUO commits</li>
                <li>User selects the correct commit</li>
                <li>CDS mappings are retrieved and applied</li>
                <li>Current-year workbook is populated</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Challenge — Roger</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.8 }}>
                <li>Roger is <strong>engagement-driven</strong> — much of the workflow is automated</li>
                <li>Roger does not currently know which prior-year project or Job ID to use</li>
                <li>Additional <strong>business workflow and UI</strong> are required</li>
                <li>Solution must support migration <strong>without compromising data accuracy</strong></li>
                <li>Roger must orchestrate UX while DCT owns the data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 03 — Current Tax Workbooks Process ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="03" title="Current Tax Workbooks Process" subtitle="Existing workflow — documented for migration reference." />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 0 }}>
            <FlowStep step={1} label="User opens Tax Workbooks" />
            <FlowArrow />
            <FlowStep step={2} label="Select Prior Year Project" isUser />
            <FlowArrow />
            <FlowStep step={3} label="Project determines Job ID" sub="Automatic" />
            <FlowArrow />
            <FlowStep step={4} label="Retrieve DUO commits" sub="via CEM API" />
            <FlowArrow />
            <FlowStep step={5} label="User selects Commit" isUser />
            <FlowArrow />
            <FlowStep step={6} label="Retrieve CDS mappings" sub="via CEM API" />
            <FlowArrow />
            <FlowStep step={7} label="Populate current-year workbook" sub="Migration complete" />
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: SLATE }}>
              <div style={{ width: 12, height: 12, background: AMBER, borderRadius: 2 }} /> User interaction required
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: SLATE }}>
              <div style={{ width: 12, height: 12, background: NAVY, borderRadius: 2 }} /> System / automatic
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 04 — Proposed Roger Workflow ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="04" title="Proposed Roger Workflow" subtitle="How Prior Year migration will work in Roger — PROPOSED, not finalized." />
        <Callout type="proposed">
          This workflow is <strong>proposed</strong> based on discovery sessions. It has not been finalized. Open questions remain regarding automation level and user interaction requirements. All items marked with ⚠ require a decision before implementation.
        </Callout>
        <div style={{ background: "#faf5ff", border: "1px solid #d8b4fe", borderRadius: 10, padding: "20px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 0 }}>
            <FlowStep step={1} label="Open Roger Workspace" sub="Entity context established" />
            <FlowArrow />
            <FlowStep step={2} label="Select Entity" isUser />
            <FlowArrow />
            <FlowStep step={3} label="Retrieve Prior Year Data" sub="Roger calls CEM API" />
            <FlowArrow />
            <FlowStep step={4} label="Display available Prior Year Projects" sub="⚠ If multiple exist" />
            <FlowArrow />
            <FlowStep step={5} label="User selects Project (if required)" isUser sub="⚠ Open question" />
            <FlowArrow />
            <FlowStep step={6} label="Determine Job ID" sub="Derived from selected project" />
            <FlowArrow />
            <FlowStep step={7} label="Retrieve DUO commits" sub="via CEM API" />
            <FlowArrow />
            <FlowStep step={8} label="User selects Commit" isUser />
            <FlowArrow />
            <FlowStep step={9} label="Retrieve CDS mappings" sub="via CEM API" />
            <FlowArrow />
            <FlowStep step={10} label="Populate Roger Workspace" sub="DCT persists governed data" />
          </div>
        </div>
      </div>

      {/* ── Section 05 — DCT Integration ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="05" title="DCT Integration" subtitle="How Prior Year data becomes governed DCT data." />
        <Callout type="governance">
          <strong>Ownership Rule:</strong> DCT owns persistence and governed data. Roger provides the practitioner experience. Roger initiates migration; DCT executes, stores, and governs the result.
        </Callout>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: NAVY, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>DCT Responsibilities</div>
            {["Persist prior-year data", "Store migrated records", "Support retrieval APIs", "Create Tax Ready Records", "Generate Known Mappings", "Apply Proposal Engine", "Apply Decisions", "Maintain lineage", "Maintain audit history"].map(r => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #dbeafe", fontSize: 12, color: "#1e293b" }}>
                <span style={{ color: GREEN, fontWeight: 700 }}>✓</span> {r}
              </div>
            ))}
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: GREEN, marginBottom: 10, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Roger Responsibilities</div>
            {["Initiate migration", "Guide user workflow", "Present prior-year projects", "Present commit selection", "Obtain user approval where required", "Display migration progress", "Display migration results", "Surface migration errors"].map(r => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #d1fae5", fontSize: 12, color: "#1e293b" }}>
                <span style={{ color: NAVY, fontWeight: 700 }}>→</span> {r}
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11, color: SLATE, fontStyle: "italic" }}>Roger orchestrates the user experience but does not become the system of record.</div>
          </div>
        </div>
      </div>

      {/* ── Section 06 — Legacy System Dependencies ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="06" title="Legacy System Dependencies" subtitle="All external systems and identifiers required for Prior Year migration." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { sys: "Tax Workbooks",    desc: "Legacy source of prior-year data",              color: AMBER },
            { sys: "DUO",              desc: "Commit storage and retrieval",                   color: NAVY },
            { sys: "CDS",              desc: "Mapping data source",                            color: TEAL },
            { sys: "CEM APIs",         desc: "Integration layer for DUO and CDS access",       color: PURPLE },
            { sys: "Project IDs",      desc: "Identifies prior-year project context",          color: SLATE },
            { sys: "Job IDs",          desc: "Derived from project; used for DUO retrieval",   color: SLATE },
            { sys: "Legal Entity IDs", desc: "Scopes retrieval to correct entity",             color: SLATE },
            { sys: "Prior Year Projects", desc: "Container for prior-year engagement data",    color: NAVY },
            { sys: "Commits",          desc: "Point-in-time snapshots of DUO data",            color: GREEN },
            { sys: "Mappings",         desc: "CDS mappings translated to Known Mappings",      color: TEAL },
          ].map(item => (
            <div key={item.sys} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: item.color, marginBottom: 4 }}>{item.sys}</div>
              <div style={{ fontSize: 11, color: SLATE }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 07 — Business Requirements ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="07" title="Business Requirements" subtitle="BR-001 through BR-010 — click any requirement to expand details." />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {BUSINESS_REQUIREMENTS.map(br => (
            <div key={br.id} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <button
                onClick={() => setExpandedBR(expandedBR === br.id ? null : br.id)}
                style={{
                  width: "100%", textAlign: "left" as const, background: "none", border: "none",
                  padding: "12px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, background: NAVY, color: "white", borderRadius: 4, padding: "2px 8px" }}>{br.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{br.title}</span>
                </div>
                <span style={{ fontSize: 14, color: SLATE }}>{expandedBR === br.id ? "▲" : "▼"}</span>
              </button>
              {expandedBR === br.id && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Purpose</div>
                      <p style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6, margin: 0 }}>{br.purpose}</p>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: "12px 0 6px" }}>Business Rules</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {br.rules.map(r => <li key={r} style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6, marginBottom: 2 }}>{r}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Dependencies</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {br.dependencies.map(d => <li key={d} style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6, marginBottom: 2 }}>{d}</li>)}
                      </ul>
                      <div style={{ fontSize: 11, fontWeight: 700, color: RED, textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: "12px 0 6px" }}>Open Questions</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {br.openQuestions.map(q => <li key={q} style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.6, marginBottom: 2 }}>{q}</li>)}
                      </ul>
                      <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" as const, letterSpacing: "0.06em", margin: "12px 0 6px" }}>Acceptance Criteria</div>
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {br.ac.map(a => <li key={a} style={{ fontSize: 12, color: "#065f46", lineHeight: 1.6, marginBottom: 2 }}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 08 — Prior Year Data Inventory ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="08" title="Prior Year Data Inventory" subtitle="Every data type that may require migration — source, consumption, and automation classification." />
        <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY }}>
                {["Data Type", "Legacy Source", "Consumed in Roger", "Stored in DCT", "User Selection Required", "Automation Candidate"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700, whiteSpace: "nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DATA_INVENTORY.map((row, i) => (
                <tr key={row.type} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{row.type}</td>
                  <td style={{ padding: "9px 14px", color: "#374151" }}>{row.source}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>{row.roger === "Yes" ? "✅" : "—"}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>{row.dct === "Yes" ? "✅" : "—"}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: row.userSel === "Yes" ? "#fffbeb" : row.userSel === "TBD" ? "#fef2f2" : "#f0fdf4", color: row.userSel === "Yes" ? "#92400e" : row.userSel === "TBD" ? "#991b1b" : "#166534", borderRadius: 4, padding: "2px 8px" }}>{row.userSel}</span>
                  </td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: row.auto === "Yes" ? "#f0fdf4" : row.auto === "Partial" ? "#fffbeb" : "#fef2f2", color: row.auto === "Yes" ? "#166534" : row.auto === "Partial" ? "#92400e" : "#991b1b", borderRadius: 4, padding: "2px 8px" }}>{row.auto}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 09 — Automation Decision Matrix ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="09" title="Automation Decision Matrix" subtitle="What is automatic, what requires user selection, and what requires user approval." />
        <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY }}>
                {["Data Type", "Automatically Retrieved", "Requires User Selection", "Requires User Approval", "Open Question"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUTOMATION_MATRIX.map((row, i) => (
                <tr key={row.type} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{row.type}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>{row.auto === "Yes" ? "✅" : row.auto === "Partial" ? "🟡" : "—"}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>{row.userSel === "Yes" ? "✅" : row.userSel === "TBD" ? "⚠" : "—"}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" as const }}>{row.userApproval === "Yes" ? "✅" : row.userApproval === "TBD" ? "⚠" : "—"}</td>
                  <td style={{ padding: "9px 14px", color: row.oq === "None" ? SLATE : RED, fontSize: 11 }}>{row.oq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 10 — UI Requirements ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="10" title="UI Requirements" subtitle="Proposed Roger UI components for Prior Year migration — status: Confirmed / Candidate / Open." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            { comp: "Migration Wizard",         status: "Candidate" as const, desc: "Step-by-step guided flow for prior-year migration — project → commit → confirmation." },
            { comp: "Migration Dialog",          status: "Candidate" as const, desc: "Modal dialog for initiating migration from within the Roger workspace." },
            { comp: "Prior Year Project Picker", status: "Confirmed" as const, desc: "Dropdown or list UI for selecting the correct prior-year project when multiple exist." },
            { comp: "Commit Picker",             status: "Confirmed" as const, desc: "UI for selecting the correct DUO commit for the selected project." },
            { comp: "Migration Summary",         status: "Candidate" as const, desc: "Pre-confirmation summary showing what data will be migrated." },
            { comp: "Migration Confirmation",    status: "Confirmed" as const, desc: "Explicit user approval step before migration is committed." },
            { comp: "Error Messages",            status: "Confirmed" as const, desc: "Clear, non-technical error messages with retry or support guidance." },
            { comp: "Progress Indicator",        status: "Candidate" as const, desc: "Visual progress bar or spinner during async migration execution." },
          ].map(item => (
            <div key={item.comp} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: NAVY }}>{item.comp}</div>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 11 — Integration Sequence ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="11" title="Integration Sequence" subtitle="System interaction order during Prior Year migration — user interaction points highlighted." />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "20px 24px", overflowX: "auto" as const }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: 700, justifyContent: "center" }}>
            {[
              { sys: "Roger UI",   color: GREEN,  steps: ["1. User opens workspace", "4. Display projects", "7. Display commits", "10. Confirm migration", "13. Display results"] },
              { sys: "CEM",        color: NAVY,   steps: ["2. Retrieve prior-year projects", "5. Resolve Job ID", "8. Retrieve commits", "11. Execute migration"] },
              { sys: "DUO",        color: PURPLE, steps: ["6. Return Job ID", "9. Return commits"] },
              { sys: "CDS",        color: TEAL,   steps: ["12. Return mappings"] },
              { sys: "DCT",        color: AMBER,  steps: ["14. Persist data", "15. Generate Known Mappings", "16. Create Tax Ready Records", "17. Maintain lineage"] },
            ].map(col => (
              <div key={col.sys} style={{ flex: 1, minWidth: 120 }}>
                <div style={{ background: col.color, color: "white", fontWeight: 800, fontSize: 12, textAlign: "center" as const, padding: "8px 4px", borderRadius: "8px 8px 0 0" }}>{col.sys}</div>
                <div style={{ border: `1px solid ${col.color}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "8px 6px", minHeight: 180 }}>
                  {col.steps.map(s => (
                    <div key={s} style={{ fontSize: 10, color: "#1e293b", padding: "3px 4px", borderBottom: "1px solid #f1f5f9", lineHeight: 1.4 }}>{s}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: SLATE, textAlign: "center" as const }}>
            ⚠ User interaction occurs at steps 4 (project selection), 7 (commit selection), and 10 (migration confirmation)
          </div>
        </div>
      </div>

      {/* ── Section 12 — Architecture Considerations ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="12" title="Architecture Considerations" subtitle="Key architectural decisions and open design questions." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { topic: "Translation Tables",              desc: "Legacy taxonomy → DCT taxonomy mapping tables. Owner and maintenance process TBD.", status: "Open" as const },
            { topic: "Known Mapping Generation",        desc: "CDS mappings translated into DCT Known Mappings via Proposal Engine.", status: "Confirmed" as const },
            { topic: "Tax Ready Records",               desc: "Migrated data creates Tax Ready Records in DCT for downstream consumption.", status: "Confirmed" as const },
            { topic: "Proposal Engine",                 desc: "Applies business rules to generate proposals from migrated data.", status: "Confirmed" as const },
            { topic: "Decision Engine",                 desc: "Applies approved decisions to migrated data.", status: "Confirmed" as const },
            { topic: "Lineage",                         desc: "Full lineage maintained from legacy source through DCT to Roger.", status: "Confirmed" as const },
            { topic: "Audit",                           desc: "All migration actions logged with user identity, timestamp, and source.", status: "Confirmed" as const },
            { topic: "Cross-reference Mapping",         desc: "Legacy IDs (Project, Job, Commit) mapped to DCT identifiers.", status: "Open" as const },
            { topic: "Legacy Taxonomy Translation",     desc: "How legacy taxonomy codes map to DCT taxonomy. Translation complexity is high.", status: "Open" as const },
            { topic: "Storage Model",                   desc: "Separate Prior Year tables vs. existing Tax Ready tables — decision pending.", status: "Open" as const },
          ].map(item => (
            <div key={item.topic} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{item.topic}</div>
                <StatusBadge status={item.status} />
              </div>
              <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 13 — Risks ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="13" title="Risks" subtitle="Known risks and proposed mitigations." />
        <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY }}>
                {["#", "Risk", "Impact", "Mitigation"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RISKS.map((r, i) => (
                <tr key={r.risk} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 700, color: SLATE }}>{i + 1}</td>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{r.risk}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: r.impact === "High" ? "#fef2f2" : "#fffbeb", color: r.impact === "High" ? "#991b1b" : "#92400e", borderRadius: 4, padding: "2px 8px" }}>{r.impact}</span>
                  </td>
                  <td style={{ padding: "9px 14px", color: SLATE, fontSize: 11 }}>{r.mit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 14 — Open Questions ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="14" title="Open Questions" subtitle="Running backlog of unresolved questions — update as decisions are made." />
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
          {OPEN_QUESTIONS.map((item, i) => (
            <div key={item.q} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: RED, color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, fontSize: 13, color: "#7f1d1d", lineHeight: 1.5 }}>{item.q}</div>
              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 15 — Decisions ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="15" title="Decision Log" subtitle="Architectural and business decisions — confirmed and pending." />
        <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
            <thead>
              <tr style={{ background: NAVY }}>
                {["Date", "Decision", "Owner", "Status", "Reason"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DECISIONS.map((d, i) => (
                <tr key={d.decision} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "9px 14px", color: SLATE, whiteSpace: "nowrap" as const }}>{d.date}</td>
                  <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{d.decision}</td>
                  <td style={{ padding: "9px 14px", color: "#374151" }}>{d.owner}</td>
                  <td style={{ padding: "9px 14px" }}><StatusBadge status={d.status} /></td>
                  <td style={{ padding: "9px 14px", color: SLATE, fontSize: 11 }}>{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 16 — Meeting Artifacts ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="16" title="Meeting Artifacts" subtitle="Reference materials from discovery sessions." />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {[
              { label: "Prior Year Legacy Tool Meeting",  note: "Initial discovery session — workflow and UI discussion", status: "Reference" },
              { label: "Tax Workbooks Screenshots",       note: "UI reference for project picker and commit selection", status: "Reference" },
              { label: "Architecture Discussions",        note: "DCT / Roger ownership boundary and storage model", status: "Reference" },
              { label: "API Discussions",                 note: "CEM API capabilities, DUO, and CDS integration points", status: "Reference" },
              { label: "Future Design Sessions",          note: "Pending — UI wireframes and sequence diagram review", status: "Pending" },
            ].map(item => (
              <div key={item.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: SLATE, marginBottom: 6 }}>{item.note}</div>
                <span style={{ fontSize: 10, fontWeight: 700, background: item.status === "Pending" ? "#fffbeb" : "#f0fdf4", color: item.status === "Pending" ? "#92400e" : "#166534", borderRadius: 4, padding: "2px 8px" }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ask Buddy Integration ── */}
      <div style={{ background: NAVY, borderRadius: 10, padding: "18px 22px", marginBottom: 36 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Ask Buddy — Prior Year Migration</div>
        <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 14 }}>Ask Buddy is aware of this page. Try these discovery questions:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 8 }}>
          {[
            "How does Prior Year Migration work?",
            "How does Roger retrieve Prior Year data?",
            "What is the relationship between DUO, CDS, Roger, and DCT?",
            "When is user interaction required during migration?",
            "What business requirements remain open?",
            "What responsibilities belong to Roger versus DCT?",
            "What legacy systems are involved in Prior Year migration?",
            "What architecture decisions remain outstanding?",
          ].map(q => (
            <div key={q} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: "#e2e8f0", cursor: "default" }}>
              "{q}"
            </div>
          ))}
        </div>
      </div>

      {/* ── Related Links ── */}
      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>Related Discovery Pages</div>
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
          {RELATED_LINKS.map(link => (
            <Link key={link.path} href={link.path}>
              <a style={{ fontSize: 12, fontWeight: 600, color: NAVY, background: "white", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 12px", textDecoration: "none" }}>
                → {link.label}
              </a>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
