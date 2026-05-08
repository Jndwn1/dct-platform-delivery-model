// EntitiesGovernancePanel.tsx
// Design: RSM Navy (#003865) + governance color system
// Pattern: Matches MyClientsGovernancePanel — collapsible summary toggle, 8-field table,
//          4 governance panels, executive view, filters, and export options.
// Source: pasted_content_32.txt spec · Roger API Design v1.0 · 2026-05-08

import { useState, useMemo } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type GovStatus = "Governed" | "Operational" | "Derived" | "Requires ADR" | "Undefined" | "Partial";
type SemanticType = "Source Field" | "Workflow Status" | "Governance Calculation" | "Filing Authority Object" | "Eligibility Attribute" | "Consolidated Logic" | "Operational Metadata" | "Audit Attribute";
type AuthorityOwner = "PDC" | "TDC" | "TIM" | "Roger" | "Shared" | "Undefined";
type AdrDependency = "Filing Authority ADR" | "Consolidated Governance ADR" | "Eligibility/Profile ADR" | "Lineage Ownership ADR" | "Workflow Aggregation ADR" | "None";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface EntityField {
  uiField: string;
  apiField: string;
  source: string;
  owner: AuthorityOwner;
  batch: string;
  swagger: string;
  status: string;
  govStatus: GovStatus;
  semanticType: SemanticType;
  authorityOwner: AuthorityOwner;
  adrDependency: AdrDependency;
  risk: RiskLevel;
  govNote: string;
  archNote?: string;
}

// ─── GOVERNANCE DATA ──────────────────────────────────────────────────────────
const ENTITIES_FIELDS: EntityField[] = [
  {
    uiField: "Entity ID",
    apiField: "entityId",
    source: "PDC",
    owner: "PDC",
    batch: "B5",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "✓ Delivered",
    govStatus: "Governed",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Low",
    govNote: "Governed entity identity anchored in PDC Batch 5 hierarchy model.",
    archNote: "PDC is the authoritative source for entity identity. EntityId is the primary key for all downstream tax workflow lookups.",
  },
  {
    uiField: "Entity Code",
    apiField: "entityCode",
    source: "PDC",
    owner: "PDC",
    batch: "B5",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "⚠ Partial",
    govStatus: "Partial",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Medium",
    govNote: "Dependent on CEM synchronization and governed entity identity completion.",
    archNote: "CEM (Client Entity Master) synchronization is required for entity code to be fully governed. Partial delivery in Batch 5.",
  },
  {
    uiField: "Entity Name",
    apiField: "name",
    source: "PDC",
    owner: "PDC",
    batch: "B5",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "⚠ Partial",
    govStatus: "Partial",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Medium",
    govNote: "Live governed entity synchronization from CEM not fully delivered.",
    archNote: "Entity name is sourced from CEM via PDC. Full synchronization requires Batch 5 CEM integration to be complete.",
  },
  {
    uiField: "EIN",
    apiField: "ein",
    source: "PDC",
    owner: "PDC",
    batch: "B5",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "⚠ Partial",
    govStatus: "Partial",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "Lineage Ownership ADR",
    risk: "Medium",
    govNote: "Governed entity identifier dependent on CEM synchronization maturity.",
    archNote: "EIN lineage ownership must be formally resolved — PDC holds the value but CEM is the authoritative source. Lineage Ownership ADR required.",
  },
  {
    uiField: "Entity Type",
    apiField: "entityType",
    source: "PDC / TDC",
    owner: "Shared",
    batch: "B5 / B7",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "⚠ Partial",
    govStatus: "Partial",
    semanticType: "Eligibility Attribute",
    authorityOwner: "Shared",
    adrDependency: "Eligibility/Profile ADR",
    risk: "High",
    govNote: "Entity classifications operationally supported; downstream tax semantics governed through TDC eligibility/profile logic.",
    archNote: "Entity Type is a shared governance responsibility. PDC owns the classification; TDC owns the tax-domain semantics. Eligibility/Profile ADR must define the boundary.",
  },
  {
    uiField: "Tax Return",
    apiField: "taxReturn",
    source: "TDC",
    owner: "TDC",
    batch: "B4",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "✗ Missing",
    govStatus: "Undefined",
    semanticType: "Filing Authority Object",
    authorityOwner: "TDC",
    adrDependency: "Filing Authority ADR",
    risk: "Critical",
    govNote: "Tax return applicability and filing semantics not yet formally governed.",
    archNote: "Tax Return is a Filing Authority Object — it must be governed by TDC before Roger can consume it. No contract exists. Filing Authority ADR is blocking.",
  },
  {
    uiField: "Filing Status",
    apiField: "filingStatus",
    source: "TDC",
    owner: "Undefined",
    batch: "B6",
    swagger: "Not published",
    status: "✗ Missing",
    govStatus: "Undefined",
    semanticType: "Workflow Status",
    authorityOwner: "Undefined",
    adrDependency: "Workflow Aggregation ADR",
    risk: "Critical",
    govNote: "Filing status governance, aggregation semantics, and authoritative ownership not formally defined.",
    archNote: "Filing Status is the most critical unresolved field. Ownership is contested between TDC (filing decisions) and TIM (workflow scheduling). Workflow Aggregation ADR must resolve this before any implementation.",
  },
  {
    uiField: "Tax Year",
    apiField: "taxYear",
    source: "PDC",
    owner: "PDC",
    batch: "FC",
    swagger: "GET /api/clients/{clientId}/entities",
    status: "✓ Delivered",
    govStatus: "Partial",
    semanticType: "Operational Metadata",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Medium",
    govNote: "Lookup API operationally available; entity-level filtering and governance alignment pending.",
    archNote: "Tax Year is operationally available via the Lookups API (Foundation Core). Entity-level tax year filtering requires Batch 5 entity hierarchy to be fully delivered.",
  },
];

// ─── STYLE MAPS ───────────────────────────────────────────────────────────────
const GOV_STYLE: Record<GovStatus, { bg: string; color: string; label: string }> = {
  "Governed":     { bg: "#d1fae5", color: "#065f46", label: "Governed" },
  "Operational":  { bg: "#dbeafe", color: "#1e40af", label: "Operational" },
  "Derived":      { bg: "#fed7aa", color: "#9a3412", label: "Derived" },
  "Requires ADR": { bg: "#fde68a", color: "#92400e", label: "Requires ADR" },
  "Undefined":    { bg: "#fee2e2", color: "#991b1b", label: "Undefined" },
  "Partial":      { bg: "#fef9c3", color: "#854d0e", label: "Partial" },
};

const RISK_STYLE: Record<RiskLevel, { bg: string; color: string }> = {
  "Low":      { bg: "#d1fae5", color: "#065f46" },
  "Medium":   { bg: "#fef9c3", color: "#854d0e" },
  "High":     { bg: "#fed7aa", color: "#9a3412" },
  "Critical": { bg: "#fee2e2", color: "#991b1b" },
};

const OWNER_STYLE: Record<AuthorityOwner, { bg: string; color: string }> = {
  "PDC":       { bg: "#dbeafe", color: "#1e40af" },
  "TDC":       { bg: "#ede9fe", color: "#5b21b6" },
  "TIM":       { bg: "#fce7f3", color: "#9d174d" },
  "Roger":     { bg: "#d1fae5", color: "#065f46" },
  "Shared":    { bg: "#e0f2fe", color: "#0369a1" },
  "Undefined": { bg: "#f3f4f6", color: "#6b7280" },
};

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────
function buildGovSummary(fields: EntityField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const critical = fields.filter(f => f.risk === "Critical");
  const high = fields.filter(f => f.risk === "High");
  const undefined_ = fields.filter(f => f.govStatus === "Undefined");
  const adrs = Array.from(new Set(fields.filter(f => f.adrDependency !== "None").map(f => f.adrDependency)));

  return `DCT PLATFORM — ENTITIES GOVERNANCE SUMMARY
Roger UI · Entities Screen
Generated: ${date}

EXECUTIVE NARRATIVE
This section maps Roger Entity screen requirements to the emerging enterprise governance model across PDC and TDC. PDC currently serves as the authoritative source for entity identity and master data, while TDC is expected to govern tax workflow semantics, filing applicability, and eligibility logic. Several workflow-oriented fields, including Filing Status and Tax Return semantics, remain dependent on future governance decisions, workflow aggregation rules, and filing authority alignment.

GOVERNANCE GAPS (${undefined_.length} Undefined)
${undefined_.map(f => `• ${f.uiField}: ${f.govNote}`).join("\n")}

CRITICAL RISKS (${critical.length} Critical, ${high.length} High)
${critical.map(f => `• ${f.uiField} [CRITICAL]: ${f.govNote}`).join("\n")}
${high.map(f => `• ${f.uiField} [HIGH]: ${f.govNote}`).join("\n")}

ADR DEPENDENCIES (${adrs.length} ADRs)
${adrs.map(adr => {
  const affected = fields.filter(f => f.adrDependency === adr).map(f => f.uiField).join(", ");
  return `• ${adr}: Affects ${affected}`;
}).join("\n")}

GOVERNANCE OWNERSHIP
PDC: Entity identity, master data, EIN, Tax Year
TDC: Tax workflow, filing applicability, eligibility
Shared: Entity Type (classification boundary)
Undefined: Filing Status (ownership contested)`;
}

function buildExecReadout(fields: EntityField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const governed = fields.filter(f => f.govStatus === "Governed").length;
  const total = fields.length;
  return `DCT PLATFORM — ENTITIES EXECUTIVE READOUT
Generated: ${date}

SUMMARY
${governed} of ${total} fields are fully governed. 2 fields (Tax Return, Filing Status) are Critical — no governance authority defined. 4 ADRs are required before implementation can proceed.

KEY DECISIONS REQUIRED
1. Filing Authority ADR — Who owns Tax Return semantics? (TDC)
2. Workflow Aggregation ADR — Who owns Filing Status? (TDC vs TIM contested)
3. Eligibility/Profile ADR — Entity Type tax-domain boundary (PDC vs TDC)
4. Lineage Ownership ADR — EIN lineage from CEM through PDC

RECOMMENDATION
Do not implement Filing Status or Tax Return in Roger UI until the Filing Authority ADR and Workflow Aggregation ADR are formally resolved and published.`;
}

function buildAdrReport(fields: EntityField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const adrMap: Record<string, EntityField[]> = {};
  fields.filter(f => f.adrDependency !== "None").forEach(f => {
    const key = f.adrDependency as string;
    if (!adrMap[key]) adrMap[key] = [];
    adrMap[key].push(f);
  });
  return `DCT PLATFORM — ADR DEPENDENCY REPORT
Entities Screen
Generated: ${date}

${Object.entries(adrMap).map(([adr, flds]) => `${adr.toUpperCase()}
Affected Fields: ${flds.map(f => f.uiField).join(", ")}
Risk Levels: ${flds.map(f => f.risk).join(", ")}
Notes:
${flds.map(f => `  • ${f.uiField}: ${f.govNote}`).join("\n")}`).join("\n\n")}`;
}

function buildArchSnapshot(fields: EntityField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  return `DCT PLATFORM — ARCHITECTURE REVIEW SNAPSHOT
Entities Screen · Roger UI
Generated: ${date}

FIELD ARCHITECTURE NOTES
${fields.filter(f => f.archNote).map(f => `${f.uiField} [${f.govStatus} · ${f.risk}]
  ${f.archNote}`).join("\n\n")}

CONSOLIDATED FILING WARNING
Entity hierarchy support exists operationally; consolidated filing governance and parent/subsidiary authority semantics remain under architecture review.

IDENTITY vs WORKFLOW BOUNDARY
PDC → Entity Identity Authority (EntityId, EntityCode, EntityName, EIN, TaxYear)
TDC → Tax Workflow Authority (TaxReturn, FilingStatus, EntityType semantics)
Roger → UI Consumption (read-only consumer)
TIM → Operational Workflow Support (scheduling, due dates)`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EntitiesGovernancePanel() {
  const [govFilter, setGovFilter] = useState<GovStatus | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [adrFilter, setAdrFilter] = useState<AdrDependency | "All">("All");
  const [execView, setExecView] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showArchNotes, setShowArchNotes] = useState(false);
  const [showAdrPanel, setShowAdrPanel] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const stats = useMemo(() => ({
    total: ENTITIES_FIELDS.length,
    governed: ENTITIES_FIELDS.filter(f => f.govStatus === "Governed").length,
    partial: ENTITIES_FIELDS.filter(f => f.govStatus === "Partial").length,
    undefined_: ENTITIES_FIELDS.filter(f => f.govStatus === "Undefined").length,
    critical: ENTITIES_FIELDS.filter(f => f.risk === "Critical").length,
    high: ENTITIES_FIELDS.filter(f => f.risk === "High").length,
    adrs: Array.from(new Set(ENTITIES_FIELDS.filter(f => f.adrDependency !== "None").map(f => f.adrDependency))).length,
    pdcOwned: ENTITIES_FIELDS.filter(f => f.authorityOwner === "PDC").length,
    tdcOwned: ENTITIES_FIELDS.filter(f => f.authorityOwner === "TDC").length,
  }), []);

  const filtered = useMemo(() => ENTITIES_FIELDS.filter(f => {
    if (govFilter !== "All" && f.govStatus !== govFilter) return false;
    if (riskFilter !== "All" && f.risk !== riskFilter) return false;
    if (adrFilter !== "All" && f.adrDependency !== adrFilter) return false;
    return true;
  }), [govFilter, riskFilter, adrFilter]);

  const copyExport = (label: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    });
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const emailExport = (subject: string, body: string) => {
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const s = {
    pill: (bg: string, color: string): React.CSSProperties => ({ display: "inline-block", padding: "2px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: 600, backgroundColor: bg, color }),
    btn: (active?: boolean): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", backgroundColor: active ? "#003865" : "#f0f4f8", color: active ? "white" : "#003865", border: "1.5px solid #003865", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }),
    exportBtn: (color: string): React.CSSProperties => ({ padding: "6px 14px", backgroundColor: color, color: "white", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }),
    th: { padding: "8px 10px", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#6b7280", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" as const },
    td: { padding: "8px 10px", fontSize: "11px", color: "#374151", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" as const },
  };

  const adrsForPanel = Array.from(new Set(ENTITIES_FIELDS.filter(f => f.adrDependency !== "None").map(f => f.adrDependency)));

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>

      {/* ── HEADER ROW ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#003865" }}>Entities — Governance Intelligence</div>
          <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>GET /api/clients/&#123;clientId&#125;/entities?taxYear=&#123;year&#125; · PDC owns entity hierarchy · TDC owns tax workflow semantics · Roger consumes read contracts only.</div>
        </div>
        <button onClick={() => setExecView(v => !v)} style={s.btn(execView)}>
          {execView ? "⬡ Full View" : "◈ Executive View"}
        </button>
      </div>

      {/* ── COLLAPSIBLE GOVERNANCE SUMMARY ── */}
      <div style={{ marginBottom: "12px" }}>
        <button onClick={() => setShowSummary(v => !v)} style={s.btn(showSummary)}>
          <span style={{ fontSize: "14px" }}>ⓘ</span>
          Read Governance Summary
          <span style={{ fontSize: "10px", opacity: 0.7 }}>{showSummary ? "▲" : "▼"}</span>
        </button>
        {showSummary && (
          <div style={{ marginTop: "8px", padding: "16px 18px", backgroundColor: "#003865", borderRadius: "8px", color: "white" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#93c5fd", marginBottom: "8px" }}>Entities Governance &amp; Architecture Summary</div>
            <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.7, color: "#e2e8f0" }}>
              This section maps Roger Entity screen requirements to the emerging enterprise governance model across PDC and TDC. <strong style={{ color: "white" }}>PDC currently serves as the authoritative source for entity identity and master data</strong>, while <strong style={{ color: "white" }}>TDC is expected to govern tax workflow semantics, filing applicability, and eligibility logic</strong>. Several workflow-oriented fields, including Filing Status and Tax Return semantics, remain dependent on future governance decisions, workflow aggregation rules, and filing authority alignment. The section intentionally distinguishes identity ownership from tax-domain workflow semantics to prevent operational UI assumptions from becoming implicit governance authority.
            </p>
            <div style={{ marginTop: "12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "PDC Identity Authority", desc: "EntityId, EntityCode, EntityName, EIN, TaxYear — governed or partially governed" },
                { label: "TDC Workflow Authority", desc: "TaxReturn, FilingStatus — undefined; requires Filing Authority ADR and Workflow Aggregation ADR" },
                { label: "Filing Workflow Maturity", desc: "Filing Status and Tax Return are Critical — no authoritative owner defined" },
                { label: "Consolidated Filing Concerns", desc: "Entity hierarchy exists operationally; parent/subsidiary governance semantics not resolved" },
              ].map(item => (
                <div key={item.label} style={{ padding: "10px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#93c5fd", marginBottom: "4px" }}>{item.label}</div>
                  <div style={{ fontSize: "11px", color: "#cbd5e1", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── EXECUTIVE SUMMARY TILES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Total Fields", value: stats.total, bg: "#f0f4f8", color: "#003865" },
          { label: "Governed", value: stats.governed, bg: "#d1fae5", color: "#065f46" },
          { label: "Partial", value: stats.partial, bg: "#fef9c3", color: "#854d0e" },
          { label: "Undefined", value: stats.undefined_, bg: "#fee2e2", color: "#991b1b" },
          { label: "Critical Risk", value: stats.critical, bg: "#fee2e2", color: "#991b1b" },
          { label: "High Risk", value: stats.high, bg: "#fed7aa", color: "#9a3412" },
          { label: "ADRs Required", value: stats.adrs, bg: "#ede9fe", color: "#5b21b6" },
          { label: "PDC Owned", value: stats.pdcOwned, bg: "#dbeafe", color: "#1e40af" },
          { label: "TDC Owned", value: stats.tdcOwned, bg: "#ede9fe", color: "#5b21b6" },
        ].map(tile => (
          <div key={tile.label} style={{ padding: "10px 12px", backgroundColor: tile.bg, borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "22px", fontWeight: 800, color: tile.color }}>{tile.value}</div>
            <div style={{ fontSize: "10px", color: tile.color, fontWeight: 600, marginTop: "2px" }}>{tile.label}</div>
          </div>
        ))}
      </div>

      {/* ── INTERACTIVE BUTTONS ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
        <button onClick={() => setShowArchNotes(v => !v)} style={s.btn(showArchNotes)}>🏗 View Architecture Notes</button>
        <button onClick={() => setShowAdrPanel(v => !v)} style={s.btn(showAdrPanel)}>📋 View ADR Dependencies</button>
        <button onClick={() => setShowRiskPanel(v => !v)} style={s.btn(showRiskPanel)}>⚠ View Governance Risks</button>
      </div>

      {/* ── ARCHITECTURE NOTES PANEL ── */}
      {showArchNotes && (
        <div style={{ marginBottom: "14px", padding: "14px 16px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#003865", marginBottom: "10px" }}>Architecture Notes — Entities Screen</div>
          {ENTITIES_FIELDS.filter(f => f.archNote).map(f => (
            <div key={f.uiField} style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "3px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>{f.uiField}</span>
                <span style={s.pill(GOV_STYLE[f.govStatus].bg, GOV_STYLE[f.govStatus].color)}>{f.govStatus}</span>
                <span style={s.pill(RISK_STYLE[f.risk].bg, RISK_STYLE[f.risk].color)}>{f.risk}</span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569", lineHeight: 1.5 }}>{f.archNote}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ADR DEPENDENCIES PANEL ── */}
      {showAdrPanel && (
        <div style={{ marginBottom: "14px", padding: "14px 16px", backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#5b21b6", marginBottom: "10px" }}>ADR Dependencies — Entities Screen ({adrsForPanel.length} ADRs)</div>
          {adrsForPanel.map(adr => {
            const affected = ENTITIES_FIELDS.filter(f => f.adrDependency === adr);
            return (
              <div key={adr} style={{ marginBottom: "10px", padding: "10px 12px", backgroundColor: "white", borderRadius: "6px", border: "1px solid #e9d5ff" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#5b21b6", marginBottom: "4px" }}>{adr}</div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}>Affects: {affected.map(f => f.uiField).join(", ")}</div>
                {affected.map(f => (
                  <div key={f.uiField} style={{ fontSize: "11px", color: "#374151", marginTop: "3px" }}>
                    <span style={s.pill(RISK_STYLE[f.risk].bg, RISK_STYLE[f.risk].color)}>{f.risk}</span>{" "}
                    <strong>{f.uiField}:</strong> {f.govNote}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── GOVERNANCE RISKS PANEL ── */}
      {showRiskPanel && (
        <div style={{ marginBottom: "14px" }}>
          {/* Consolidated Filing Warning */}
          <div style={{ padding: "10px 14px", backgroundColor: "#fff7ed", border: "1.5px solid #f97316", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9a3412", marginBottom: "4px" }}>⚠ Consolidated Filing Warning</div>
            <div style={{ fontSize: "11px", color: "#7c2d12", lineHeight: 1.5 }}>Entity hierarchy support exists operationally; consolidated filing governance and parent/subsidiary authority semantics remain under architecture review.</div>
          </div>
          {/* Identity vs Workflow Authority */}
          <div style={{ padding: "12px 14px", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", marginBottom: "10px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", marginBottom: "8px" }}>Identity vs Workflow Authority</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
              {[
                { system: "PDC", role: "Entity Identity Authority", color: "#1e40af", bg: "#dbeafe" },
                { system: "TDC", role: "Tax Workflow Authority", color: "#5b21b6", bg: "#ede9fe" },
                { system: "Roger", role: "UI Consumption (Read-Only)", color: "#065f46", bg: "#d1fae5" },
                { system: "TIM", role: "Operational Workflow Support", color: "#9d174d", bg: "#fce7f3" },
              ].map(item => (
                <div key={item.system} style={{ padding: "8px 10px", backgroundColor: item.bg, borderRadius: "6px", textAlign: "center" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: item.color }}>{item.system}</div>
                  <div style={{ fontSize: "10px", color: item.color, marginTop: "2px", lineHeight: 1.4 }}>{item.role}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Critical fields */}
          <div style={{ padding: "12px 14px", backgroundColor: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b", marginBottom: "8px" }}>Filing Governance Risk — Critical Fields</div>
            {ENTITIES_FIELDS.filter(f => f.risk === "Critical" || f.risk === "High").map(f => (
              <div key={f.uiField} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                <span style={s.pill(RISK_STYLE[f.risk].bg, RISK_STYLE[f.risk].color)}>{f.risk}</span>
                <div style={{ fontSize: "11px", color: "#374151", lineHeight: 1.5 }}><strong>{f.uiField}:</strong> {f.govNote}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTERS ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px", padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", alignSelf: "center" }}>Filter:</span>
        <select value={govFilter} onChange={e => setGovFilter(e.target.value as GovStatus | "All")} style={{ fontSize: "11px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", backgroundColor: "white" }}>
          <option value="All">All Gov Status</option>
          {(["Governed","Operational","Derived","Requires ADR","Undefined","Partial"] as GovStatus[]).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as RiskLevel | "All")} style={{ fontSize: "11px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", backgroundColor: "white" }}>
          <option value="All">All Risk Levels</option>
          {(["Low","Medium","High","Critical"] as RiskLevel[]).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={adrFilter} onChange={e => setAdrFilter(e.target.value as AdrDependency | "All")} style={{ fontSize: "11px", padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: "4px", backgroundColor: "white" }}>
          <option value="All">All ADRs</option>
          {(["Filing Authority ADR","Consolidated Governance ADR","Eligibility/Profile ADR","Lineage Ownership ADR","Workflow Aggregation ADR","None"] as AdrDependency[]).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <span style={{ fontSize: "11px", color: "#9ca3af", alignSelf: "center" }}>{filtered.length} of {ENTITIES_FIELDS.length} fields</span>
      </div>

      {/* ── MAPPING TABLE ── */}
      <div style={{ overflowX: "auto", marginBottom: "16px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr>
              <th style={s.th}>UI Field</th>
              {!execView && <th style={s.th}>API Field</th>}
              {!execView && <th style={s.th}>Source</th>}
              <th style={s.th}>Owner</th>
              {!execView && <th style={s.th}>Batch</th>}
              {!execView && <th style={s.th}>Swagger</th>}
              {!execView && <th style={s.th}>Status</th>}
              <th style={s.th}>Gov Status</th>
              <th style={s.th}>Semantic Type</th>
              <th style={s.th}>Authority</th>
              <th style={s.th}>Risk</th>
              <th style={s.th}>ADR</th>
              <th style={s.th}>Gov Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <>
                <tr
                  key={f.uiField}
                  onClick={() => setExpandedField(expandedField === f.uiField ? null : f.uiField)}
                  style={{ cursor: "pointer", backgroundColor: expandedField === f.uiField ? "#f0f9ff" : "white", transition: "background 0.1s" }}
                >
                  <td style={{ ...s.td, fontWeight: 600, color: "#003865" }}>{f.uiField}</td>
                  {!execView && <td style={s.td}><code style={{ fontSize: "10px", backgroundColor: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{f.apiField}</code></td>}
                  {!execView && <td style={s.td}>{f.source}</td>}
                  <td style={s.td}><span style={s.pill(OWNER_STYLE[f.owner].bg, OWNER_STYLE[f.owner].color)}>{f.owner}</span></td>
                  {!execView && <td style={s.td}>{f.batch}</td>}
                  {!execView && <td style={s.td}><code style={{ fontSize: "10px", color: "#6b7280" }}>{f.swagger}</code></td>}
                  {!execView && <td style={s.td}>{f.status}</td>}
                  <td style={s.td}><span style={s.pill(GOV_STYLE[f.govStatus].bg, GOV_STYLE[f.govStatus].color)}>{f.govStatus}</span></td>
                  <td style={s.td}><span style={{ fontSize: "10px", color: "#6b7280" }}>{f.semanticType}</span></td>
                  <td style={s.td}><span style={s.pill(OWNER_STYLE[f.authorityOwner].bg, OWNER_STYLE[f.authorityOwner].color)}>{f.authorityOwner}</span></td>
                  <td style={s.td}><span style={s.pill(RISK_STYLE[f.risk].bg, RISK_STYLE[f.risk].color)}>{f.risk}</span></td>
                  <td style={s.td}><span style={{ fontSize: "10px", color: f.adrDependency !== "None" ? "#5b21b6" : "#9ca3af", fontWeight: f.adrDependency !== "None" ? 600 : 400 }}>{f.adrDependency}</span></td>
                  <td style={{ ...s.td, maxWidth: "220px", color: "#475569" }}>{f.govNote}</td>
                </tr>
                {expandedField === f.uiField && (
                  <tr key={`${f.uiField}-expand`}>
                    <td colSpan={execView ? 7 : 13} style={{ padding: "10px 14px", backgroundColor: "#f0f9ff", borderBottom: "2px solid #bae6fd" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", marginBottom: "4px" }}>Architecture Note — {f.uiField}</div>
                      <div style={{ fontSize: "11px", color: "#1e40af", lineHeight: 1.6 }}>{f.archNote || f.govNote}</div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── EXPORT OPTIONS ── */}
      <div style={{ padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#374151", marginBottom: "8px" }}>Export Options</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button onClick={() => copyExport("gov", buildGovSummary(ENTITIES_FIELDS))} style={s.exportBtn("#003865")}>
            {copied === "gov" ? "✓ Copied!" : "📋 Governance Summary"}
          </button>
          <button onClick={() => copyExport("exec", buildExecReadout(ENTITIES_FIELDS))} style={s.exportBtn("#1d4ed8")}>
            {copied === "exec" ? "✓ Copied!" : "📊 Executive Readout"}
          </button>
          <button onClick={() => copyExport("adr", buildAdrReport(ENTITIES_FIELDS))} style={s.exportBtn("#5b21b6")}>
            {copied === "adr" ? "✓ Copied!" : "📌 ADR Report"}
          </button>
          <button onClick={() => copyExport("arch", buildArchSnapshot(ENTITIES_FIELDS))} style={s.exportBtn("#0369a1")}>
            {copied === "arch" ? "✓ Copied!" : "🏗 Architecture Snapshot"}
          </button>
          <button onClick={() => emailExport("DCT Platform — Entities Governance Summary", buildGovSummary(ENTITIES_FIELDS))} style={s.exportBtn("#0f766e")}>
            ✉ Email Summary
          </button>
        </div>
      </div>
    </div>
  );
}
