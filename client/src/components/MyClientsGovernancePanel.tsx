// MyClientsGovernancePanel.tsx
// DCT Platform — Data Model & Gaps — My Clients Governance Intelligence
// Spec: pasted_content_31.txt (2026-05-08)
// Reference: Roger API Design v1.0, TIM Swagger, DCT Governance Gap Analysis
//
// DESIGN: RSM Midnight Blue (#003865) primary, governance color-coding per spec
// LAYOUT: Executive summary tiles → enhanced field table (6 new columns) → 4 governance panels → export bar
// RULES:
//   - Preserve all existing mapping data
//   - NEVER imply operational APIs = governed filing authority
//   - Explicitly surface unresolved ownership and derived logic
//   - Language must be executive-safe and architecture-ready

import { useState, useMemo } from "react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type GovStatus = "Governed" | "Operational" | "Derived" | "Requires ADR" | "Undefined" | "Partial";
type SemanticType = "Source Field" | "Derived Metric" | "Workflow Status" | "Governance Calculation" | "Consolidated Logic" | "Filing Authority Object" | "Operational Metadata" | "Audit Attribute";
type AuthorityOwner = "TIM" | "Roger" | "PDC" | "TDC" | "CEM" | "Shared" | "Undefined";
type AdrDependency = "Filing Authority ADR" | "Consolidated Governance ADR" | "Signoff Governance ADR" | "Lineage Ownership ADR" | "Delivery Semantics ADR" | "None";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

interface GovernanceField {
  uiField: string;
  apiField: string;
  source: string;
  owner: string;
  batch: string;
  swagger: string;
  status: string;
  gap: string;
  // Governance enhancements
  govStatus: GovStatus;
  semanticType: SemanticType;
  authorityOwner: AuthorityOwner;
  adrDependency: AdrDependency;
  risk: RiskLevel;
  govNotes: string;
}

// ─── GOVERNANCE DATA ──────────────────────────────────────────────────────────

const MY_CLIENTS_FIELDS: GovernanceField[] = [
  {
    uiField: "Client ID",
    apiField: "clientId",
    source: "PDC / EODS",
    owner: "PDC",
    batch: "FC",
    swagger: "GET /api/clients",
    status: "Delivered",
    gap: "—",
    govStatus: "Governed",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Low",
    govNotes: "Governed entity identifier sourced from PDC. Stable and authoritative.",
  },
  {
    uiField: "Client Name",
    apiField: "clientName",
    source: "PDC / EODS",
    owner: "PDC",
    batch: "FC",
    swagger: "GET /api/clients",
    status: "Delivered",
    gap: "—",
    govStatus: "Governed",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "None",
    risk: "Low",
    govNotes: "Governed display name sourced from PDC entity master. Operationally stable.",
  },
  {
    uiField: "% Complete",
    apiField: "completionPct",
    source: "Derived / TIM",
    owner: "Shared",
    batch: "B10",
    swagger: "—",
    status: "Mocked",
    gap: "Aggregation logic not formally defined",
    govStatus: "Derived",
    semanticType: "Derived Metric",
    authorityOwner: "Shared",
    adrDependency: "Delivery Semantics ADR",
    risk: "High",
    govNotes: "Completion aggregation and business logic not formally defined. Operationally supported but not governed. Requires Delivery Semantics ADR before authoritative implementation.",
  },
  {
    uiField: "Entity Count",
    apiField: "entityCount",
    source: "PDC (B5)",
    owner: "PDC",
    batch: "B5",
    swagger: "—",
    status: "Partial",
    gap: "Batch 5 entity identity not yet delivered",
    govStatus: "Partial",
    semanticType: "Source Field",
    authorityOwner: "PDC",
    adrDependency: "Consolidated Governance ADR",
    risk: "Medium",
    govNotes: "Requires Batch 5 governed entity hierarchy support. Consolidated filing entity count semantics not yet resolved.",
  },
  {
    uiField: "Deliverables",
    apiField: "deliverables",
    source: "TIM",
    owner: "TIM",
    batch: "B10",
    swagger: "TIM Swagger",
    status: "Mocked",
    gap: "TIM integration dependency",
    govStatus: "Operational",
    semanticType: "Operational Metadata",
    authorityOwner: "TIM",
    adrDependency: "Delivery Semantics ADR",
    risk: "Medium",
    govNotes: "Operational deliverables identified via TIM. Governed filing relationship between TIM deliverables and DCT filing records is unresolved.",
  },
  {
    uiField: "Approaching Date",
    apiField: "approachingDate",
    source: "TIM / Derived",
    owner: "Shared",
    batch: "B10",
    swagger: "—",
    status: "Mocked",
    gap: "Client due date authority unresolved",
    govStatus: "Derived",
    semanticType: "Workflow Status",
    authorityOwner: "Shared",
    adrDependency: "Filing Authority ADR",
    risk: "High",
    govNotes: "Client due date authority and filing semantics not formally defined. Extension handling and consolidated filing date logic unresolved. Requires Filing Authority ADR.",
  },
  {
    uiField: "On Track / At Risk",
    apiField: "trackingStatus",
    source: "Undefined",
    owner: "Undefined",
    batch: "—",
    swagger: "—",
    status: "Missing",
    gap: "Risk calculation logic and governance ownership unresolved",
    govStatus: "Undefined",
    semanticType: "Governance Calculation",
    authorityOwner: "Undefined",
    adrDependency: "Filing Authority ADR",
    risk: "Critical",
    govNotes: "Risk calculation logic and governance ownership entirely unresolved. No system of record. Potential UI assumption drift if implemented without ADR. Requires Filing Authority ADR before any implementation.",
  },
  {
    uiField: "Overdue Flag",
    apiField: "isOverdue",
    source: "Undefined",
    owner: "Undefined",
    batch: "—",
    swagger: "—",
    status: "Missing",
    gap: "Overdue logic, extension handling, and filing authority semantics unresolved",
    govStatus: "Undefined",
    semanticType: "Workflow Status",
    authorityOwner: "Undefined",
    adrDependency: "Filing Authority ADR",
    risk: "Critical",
    govNotes: "Overdue logic, extension handling, and filing authority semantics entirely unresolved. No agreed definition of 'overdue' across consolidated vs. standalone filings. Requires Filing Authority ADR.",
  },
];

// ─── STYLE MAPS ───────────────────────────────────────────────────────────────

const GOV_STATUS_STYLE: Record<GovStatus, { bg: string; text: string; border: string }> = {
  "Governed":     { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
  "Operational":  { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
  "Partial":      { bg: "#fef9c3", text: "#854d0e", border: "#fde047" },
  "Derived":      { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  "Requires ADR": { bg: "#ffedd5", text: "#9a3412", border: "#fdba74" },
  "Undefined":    { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
};

const RISK_STYLE: Record<RiskLevel, { bg: string; text: string }> = {
  "Low":      { bg: "#d1fae5", text: "#065f46" },
  "Medium":   { bg: "#fef9c3", text: "#854d0e" },
  "High":     { bg: "#ffedd5", text: "#9a3412" },
  "Critical": { bg: "#fee2e2", text: "#991b1b" },
};

const OWNER_STYLE: Record<AuthorityOwner, { bg: string; text: string }> = {
  "PDC":       { bg: "#dbeafe", text: "#1e40af" },
  "TDC":       { bg: "#ede9fe", text: "#5b21b6" },
  "TIM":       { bg: "#d1fae5", text: "#065f46" },
  "Roger":     { bg: "#f3f4f6", text: "#374151" },
  "CEM":       { bg: "#fce7f3", text: "#9d174d" },
  "Shared":    { bg: "#fef9c3", text: "#854d0e" },
  "Undefined": { bg: "#fee2e2", text: "#991b1b" },
};

const READINESS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  "Delivered": { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
  "Partial":   { bg: "#fef9c3", text: "#854d0e", label: "Partial" },
  "Mocked":    { bg: "#ffedd5", text: "#9a3412", label: "Mocked" },
  "Missing":   { bg: "#fee2e2", text: "#991b1b", label: "Missing" },
};

const ADR_STYLE: Record<AdrDependency, { bg: string; text: string }> = {
  "Filing Authority ADR":        { bg: "#fee2e2", text: "#991b1b" },
  "Consolidated Governance ADR": { bg: "#ffedd5", text: "#9a3412" },
  "Signoff Governance ADR":      { bg: "#ede9fe", text: "#5b21b6" },
  "Lineage Ownership ADR":       { bg: "#fce7f3", text: "#9d174d" },
  "Delivery Semantics ADR":      { bg: "#fef9c3", text: "#854d0e" },
  "None":                        { bg: "#f3f4f6", text: "#9ca3af" },
};

// ─── EXPORT HELPERS ───────────────────────────────────────────────────────────

function buildGovGapSummary(fields: GovernanceField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const critical = fields.filter(f => f.risk === "Critical");
  const high = fields.filter(f => f.risk === "High");
  const undefined_ = fields.filter(f => f.govStatus === "Undefined");
  const adrs = Array.from(new Set(fields.filter(f => f.adrDependency !== "None").map(f => f.adrDependency)));

  return `DCT PLATFORM — GOVERNANCE GAP SUMMARY
My Clients Screen — Roger UI Data Governance
Generated: ${date}

EXECUTIVE NARRATIVE
This section maps Roger UI client-level data requirements to operational source systems, governance ownership, and architecture readiness. Several fields currently rely on derived calculations, unresolved business semantics, or undefined governance authority that require architecture alignment before authoritative implementation.

GOVERNANCE GAPS
${undefined_.map(f => `• ${f.uiField}: ${f.govNotes}`).join("\n")}
${high.map(f => f.govStatus !== "Undefined" ? `• ${f.uiField}: ${f.govNotes}` : "").filter(Boolean).join("\n")}

CRITICAL RISKS (${critical.length})
${critical.map(f => `• ${f.uiField} — ${f.govNotes}`).join("\n")}

ADR DEPENDENCIES (${adrs.length})
${adrs.map(a => `• ${a}`).join("\n")}

FIELD SUMMARY
${fields.map(f => `• ${f.uiField} | Gov: ${f.govStatus} | Owner: ${f.authorityOwner} | Risk: ${f.risk}`).join("\n")}
`;
}

function buildExecSummary(fields: GovernanceField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const governed = fields.filter(f => f.govStatus === "Governed").length;
  const operational = fields.filter(f => f.govStatus === "Operational").length;
  const derived = fields.filter(f => f.govStatus === "Derived").length;
  const undefined_ = fields.filter(f => f.govStatus === "Undefined").length;
  const critical = fields.filter(f => f.risk === "Critical").length;

  return `DCT PLATFORM — EXECUTIVE SUMMARY
My Clients Screen — Governance & Architecture Readiness
Generated: ${date}

SUMMARY
${governed} of ${fields.length} fields are fully governed. ${operational} are operationally supported but not governed. ${derived} rely on derived calculations without formal definitions. ${undefined_} fields have entirely undefined governance ownership.

CRITICAL ITEMS (${critical})
${fields.filter(f => f.risk === "Critical").map(f => `• ${f.uiField}: ${f.govNotes}`).join("\n")}

RECOMMENDATION
Architecture alignment is required before Roger UI can display authoritative data for On Track / At Risk, Overdue Flag, % Complete, and Approaching Date. Filing Authority ADR and Delivery Semantics ADR must be resolved to unblock these fields.
`;
}

function buildAdrReport(fields: GovernanceField[]): string {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const adrMap: Record<string, GovernanceField[]> = {};
  fields.filter(f => f.adrDependency !== "None").forEach(f => {
    const key = f.adrDependency as string;
    if (!adrMap[key]) adrMap[key] = [];
    adrMap[key].push(f);
  });

  return `DCT PLATFORM — ADR DEPENDENCY REPORT
My Clients Screen
Generated: ${date}

${Object.entries(adrMap).map(([adr, fs]) => `${adr.toUpperCase()}
Impacted Fields: ${fs.map(f => f.uiField).join(", ")}
${fs.map(f => `  • ${f.uiField}: ${f.govNotes}`).join("\n")}`).join("\n\n")}
`;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MyClientsGovernancePanel() {
  const [govFilter, setGovFilter] = useState<GovStatus | "All">("All");
  const [adrFilter, setAdrFilter] = useState<AdrDependency | "All">("All");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "All">("All");
  const [execView, setExecView] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const filteredFields = useMemo(() => {
    return MY_CLIENTS_FIELDS.filter(f => {
      if (govFilter !== "All" && f.govStatus !== govFilter) return false;
      if (adrFilter !== "All" && f.adrDependency !== adrFilter) return false;
      if (riskFilter !== "All" && f.risk !== riskFilter) return false;
      return true;
    });
  }, [govFilter, adrFilter, riskFilter]);

  const counts = useMemo(() => ({
    governed: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Governed").length,
    operational: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Operational").length,
    derived: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Derived").length,
    partial: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Partial").length,
    undefined: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Undefined").length,
    adrs: Array.from(new Set(MY_CLIENTS_FIELDS.filter(f => f.adrDependency !== "None").map(f => f.adrDependency))).length,
    critical: MY_CLIENTS_FIELDS.filter(f => f.risk === "Critical").length,
    high: MY_CLIENTS_FIELDS.filter(f => f.risk === "High").length,
    gaps: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Undefined" || f.govStatus === "Derived").length,
    consolidatedRisks: MY_CLIENTS_FIELDS.filter(f => f.adrDependency === "Consolidated Governance ADR" || f.adrDependency === "Filing Authority ADR").length,
  }), []);

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(null), 2000); });
  };

  const TOOLTIP_DEFS: Record<string, string> = {
    "Governed": "Data is sourced from an authoritative, contract-backed system with defined ownership and lineage.",
    "Operational": "Data is available and functional but not yet subject to formal governance contracts or filing authority.",
    "Derived": "Value is calculated from other fields. The aggregation logic and system of record are not formally defined.",
    "Undefined": "No system of record, no governance owner, and no agreed definition. Cannot be implemented authoritatively without an ADR.",
    "Partial": "Some governance exists but is incomplete — typically blocked by a batch dependency.",
    "Requires ADR": "An Architecture Decision Record must be resolved before this field can be governed.",
    "Source Field": "A raw identifier or attribute sourced directly from a governed system.",
    "Derived Metric": "A calculated value with no single authoritative source.",
    "Governance Calculation": "A business rule or risk calculation that requires formal governance definition.",
    "Workflow Status": "A status flag driven by workflow logic, not a governed data attribute.",
    "Operational Metadata": "Supporting metadata from an operational system (e.g. TIM) without filing governance.",
  };

  return (
    <div style={{ marginBottom: "24px" }}>

      {/* ── SECTION HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b7280" }}>Section 1 — My Clients</span>
            <span style={{ fontSize: "10px", padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#003865", color: "white", fontWeight: 700 }}>Governance Intelligence</span>
          </div>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: "4px 0 0" }}>Governance & Architecture Readiness — My Clients</h3>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>API: <code style={{ fontFamily: "monospace", backgroundColor: "#f3f4f6", padding: "1px 5px", borderRadius: "3px" }}>GET /api/clients?taxYear={"{year}"}</code></p>
        </div>
        <button
          onClick={() => setExecView(v => !v)}
          style={{ fontSize: "11px", fontWeight: 700, padding: "6px 14px", borderRadius: "6px", border: "1px solid #003865", backgroundColor: execView ? "#003865" : "white", color: execView ? "white" : "#003865", cursor: "pointer" }}
        >
          {execView ? "Full View" : "Executive View"}
        </button>
      </div>

      {/* ── EXECUTIVE NARRATIVE ── */}
      <div style={{ padding: "14px 18px", backgroundColor: "#f0f4f8", borderLeft: "4px solid #003865", borderRadius: "0 8px 8px 0", marginBottom: "16px" }}>
        <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: 1.6 }}>
          This section maps Roger UI client-level data requirements to operational source systems, governance ownership, and architecture readiness.{" "}
          <strong>Several fields currently rely on derived calculations, unresolved business semantics, or undefined governance authority</strong> that require architecture alignment before authoritative implementation.
        </p>
      </div>

      {/* ── EXECUTIVE SUMMARY TILES ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "10px", marginBottom: "16px" }}>
        {[
          { label: "Operationally Supported", value: counts.operational, color: "#1e40af", bg: "#dbeafe", icon: "⚙" },
          { label: "Governed Fields", value: counts.governed, color: "#065f46", bg: "#d1fae5", icon: "✓" },
          { label: "Derived Metrics", value: counts.derived, color: "#9a3412", bg: "#ffedd5", icon: "∑" },
          { label: "Undefined Ownership", value: counts.undefined, color: "#991b1b", bg: "#fee2e2", icon: "✗" },
          { label: "ADR Dependencies", value: counts.adrs, color: "#5b21b6", bg: "#ede9fe", icon: "⚖" },
          { label: "Governance Gaps", value: counts.gaps, color: "#92400e", bg: "#fef3c7", icon: "△" },
          { label: "Consolidated Risks", value: counts.consolidatedRisks, color: "#991b1b", bg: "#fee2e2", icon: "⚠" },
        ].map(t => (
          <div key={t.label} style={{ padding: "12px 14px", borderRadius: "8px", backgroundColor: t.bg, border: `1px solid ${t.bg}` }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: t.color }}>{t.icon} {t.value}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: t.color, marginTop: "2px", lineHeight: 1.3 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* ── MATURITY INDICATORS ── */}
      {!execView && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
          {[
            { label: "Mature Governance", color: "#065f46", bg: "#d1fae5", fields: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Governed").map(f => f.uiField) },
            { label: "Partial Governance", color: "#854d0e", bg: "#fef9c3", fields: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Partial" || f.govStatus === "Operational").map(f => f.uiField) },
            { label: "Emerging Semantics", color: "#9a3412", bg: "#ffedd5", fields: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Derived").map(f => f.uiField) },
            { label: "Undefined Governance", color: "#991b1b", bg: "#fee2e2", fields: MY_CLIENTS_FIELDS.filter(f => f.govStatus === "Undefined").map(f => f.uiField) },
          ].map(m => (
            <div key={m.label} style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: m.bg, border: `1px solid ${m.bg}` }}>
              <span style={{ fontSize: "10px", fontWeight: 700, color: m.color }}>{m.label}</span>
              <span style={{ fontSize: "10px", color: m.color, marginLeft: "6px" }}>{m.fields.join(", ")}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── FILTERS ── */}
      {!execView && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px", padding: "10px 14px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", alignSelf: "center" }}>FILTER:</span>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", alignSelf: "center" }}>Gov Status:</span>
            {(["All", "Governed", "Operational", "Partial", "Derived", "Undefined"] as const).map(v => (
              <button key={v} onClick={() => setGovFilter(v)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e5e7eb", backgroundColor: govFilter === v ? "#003865" : "white", color: govFilter === v ? "white" : "#374151", cursor: "pointer", fontWeight: govFilter === v ? 700 : 400 }}>{v}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", alignSelf: "center" }}>Risk:</span>
            {(["All", "Low", "Medium", "High", "Critical"] as const).map(v => (
              <button key={v} onClick={() => setRiskFilter(v)} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e5e7eb", backgroundColor: riskFilter === v ? "#003865" : "white", color: riskFilter === v ? "white" : "#374151", cursor: "pointer", fontWeight: riskFilter === v ? 700 : 400 }}>{v}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", alignSelf: "center" }}>ADR:</span>
            {(["All", "Filing Authority ADR", "Delivery Semantics ADR", "Consolidated Governance ADR", "None"] as const).map(v => (
              <button key={v} onClick={() => setAdrFilter(v as AdrDependency | "All")} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: "4px", border: "1px solid #e5e7eb", backgroundColor: adrFilter === v ? "#003865" : "white", color: adrFilter === v ? "white" : "#374151", cursor: "pointer", fontWeight: adrFilter === v ? 700 : 400 }}>{v}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── ENHANCED FIELD TABLE ── */}
      <div style={{ overflowX: "auto", marginBottom: "20px", border: "1px solid #e5e7eb", borderRadius: "10px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: "#003865", color: "white" }}>
              {["UI Field", "Gov Status", "Semantic Type", "Authority Owner", "Risk", "ADR Dependency", "Governance Notes"].map(h => (
                <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredFields.map((f, i) => {
              const gs = GOV_STATUS_STYLE[f.govStatus];
              const rs = RISK_STYLE[f.risk];
              const os = OWNER_STYLE[f.authorityOwner];
              const as_ = ADR_STYLE[f.adrDependency];
              const isExpanded = expandedField === f.uiField;
              return [
                <tr key={f.uiField} onClick={() => setExpandedField(isExpanded ? null : f.uiField)} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: f.risk === "Critical" ? "#fff5f5" : i % 2 === 0 ? "white" : "#fafafa", cursor: "pointer" }}>
                  <td style={{ padding: "9px 12px", fontWeight: 700, color: "#111827" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {f.uiField}
                      {f.risk === "Critical" && <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "9999px", backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 700 }}>CRITICAL</span>}
                    </div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", fontFamily: "monospace", marginTop: "1px" }}>{f.apiField}</div>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span
                      style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px", backgroundColor: gs.bg, color: gs.text, border: `1px solid ${gs.border}`, cursor: "help" }}
                      onMouseEnter={() => setTooltip(TOOLTIP_DEFS[f.govStatus] || "")}
                      onMouseLeave={() => setTooltip(null)}
                    >{f.govStatus}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span
                      style={{ fontSize: "10px", color: "#374151", cursor: "help" }}
                      onMouseEnter={() => setTooltip(TOOLTIP_DEFS[f.semanticType] || f.semanticType)}
                      onMouseLeave={() => setTooltip(null)}
                    >{f.semanticType}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: os.bg, color: os.text }}>{f.authorityOwner}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "9999px", backgroundColor: rs.bg, color: rs.text }}>{f.risk}</span>
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {f.adrDependency !== "None" ? (
                      <span style={{ fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: as_.bg, color: as_.text }}>{f.adrDependency}</span>
                    ) : (
                      <span style={{ fontSize: "10px", color: "#d1d5db" }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: "9px 12px", color: "#6b7280", fontSize: "11px", maxWidth: "220px" }}>
                    <span style={{ display: "-webkit-box", WebkitLineClamp: isExpanded ? undefined : 2, WebkitBoxOrient: "vertical" as const, overflow: isExpanded ? "visible" : "hidden" }}>{f.govNotes}</span>
                    {!isExpanded && f.govNotes.length > 80 && <span style={{ color: "#003865", fontSize: "10px", cursor: "pointer" }}> more</span>}
                  </td>
                </tr>,
                isExpanded && (
                  <tr key={`${f.uiField}-detail`} style={{ backgroundColor: "#f0f4f8" }}>
                    <td colSpan={7} style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "11px" }}>
                        <div><span style={{ color: "#6b7280", fontWeight: 600 }}>Source: </span><span>{f.source}</span></div>
                        <div><span style={{ color: "#6b7280", fontWeight: 600 }}>Batch: </span><span style={{ fontFamily: "monospace" }}>{f.batch}</span></div>
                        <div><span style={{ color: "#6b7280", fontWeight: 600 }}>Swagger: </span><span style={{ fontFamily: "monospace" }}>{f.swagger}</span></div>
                        <div><span style={{ color: "#6b7280", fontWeight: 600 }}>Readiness: </span>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "9999px", backgroundColor: READINESS_STYLE[f.status]?.bg || "#f3f4f6", color: READINESS_STYLE[f.status]?.text || "#374151" }}>{f.status}</span>
                        </div>
                        {f.gap !== "—" && <div><span style={{ color: "#6b7280", fontWeight: 600 }}>Gap: </span><span style={{ color: "#dc2626" }}>⚠ {f.gap}</span></div>}
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
        {filteredFields.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: "12px" }}>No fields match the current filters.</div>
        )}
      </div>

      {/* ── TOOLTIP ── */}
      {tooltip && (
        <div style={{ position: "fixed", bottom: "80px", right: "24px", maxWidth: "280px", padding: "10px 14px", backgroundColor: "#1e293b", color: "white", borderRadius: "8px", fontSize: "11px", lineHeight: 1.5, zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {tooltip}
        </div>
      )}

      {/* ── 4 GOVERNANCE PANELS ── */}
      {!execView && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>

          {/* Panel 1: Operational vs Governed Summary */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#003865", color: "white" }}>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>1 · Operational vs. Governed Summary</span>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Governed", count: counts.governed, color: "#065f46", bg: "#d1fae5", desc: "Authoritative, contract-backed" },
                { label: "Operationally Supported", count: counts.operational, color: "#1e40af", bg: "#dbeafe", desc: "Functional but not governed" },
                { label: "Derived (No System of Record)", count: counts.derived, color: "#9a3412", bg: "#ffedd5", desc: "Calculated — logic undefined" },
                { label: "Undefined Governance", count: counts.undefined, color: "#991b1b", bg: "#fee2e2", desc: "No owner, no definition" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "13px", color: item.color, flexShrink: 0 }}>{item.count}</div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: item.color }}>{item.label}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 2: Governance Risk Callout */}
          <div style={{ border: "1px solid #fca5a5", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#dc2626", color: "white" }}>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>2 · Governance Risk Callout</span>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { risk: "Derived calculations without formal definitions", fields: "% Complete, Approaching Date", severity: "High" },
                { risk: "Filing authority ambiguity", fields: "On Track / At Risk, Overdue Flag, Approaching Date", severity: "Critical" },
                { risk: "Consolidated filing semantics unresolved", fields: "Entity Count, Overdue Flag", severity: "High" },
                { risk: "Undefined risk calculation logic", fields: "On Track / At Risk", severity: "Critical" },
                { risk: "Potential UI assumption drift", fields: "On Track / At Risk, Overdue Flag", severity: "Critical" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", padding: "7px 10px", borderRadius: "6px", backgroundColor: r.severity === "Critical" ? "#fff5f5" : "#fffbeb", border: `1px solid ${r.severity === "Critical" ? "#fca5a5" : "#fde68a"}` }}>
                  <span style={{ fontSize: "14px", flexShrink: 0 }}>{r.severity === "Critical" ? "🔴" : "🟡"}</span>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: r.severity === "Critical" ? "#991b1b" : "#92400e" }}>{r.risk}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280" }}>Affects: {r.fields}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: ADR Dependency Summary */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#5b21b6", color: "white" }}>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>3 · ADR Dependency Summary</span>
            </div>
            <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { adr: "Filing Authority ADR", fields: ["On Track / At Risk", "Overdue Flag", "Approaching Date"], priority: "Critical", desc: "Defines which system owns filing due dates, risk calculations, and overdue logic" },
                { adr: "Delivery Semantics ADR", fields: ["% Complete", "Deliverables"], priority: "High", desc: "Defines completion aggregation logic and deliverable-to-filing relationship" },
                { adr: "Consolidated Governance ADR", fields: ["Entity Count"], priority: "Medium", desc: "Defines entity hierarchy governance for consolidated filing scenarios" },
              ].map(a => (
                <div key={a.adr} style={{ padding: "10px 12px", borderRadius: "8px", backgroundColor: "#faf5ff", border: "1px solid #e9d5ff" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#5b21b6" }}>{a.adr}</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 6px", borderRadius: "9999px", backgroundColor: a.priority === "Critical" ? "#fee2e2" : a.priority === "High" ? "#ffedd5" : "#fef9c3", color: a.priority === "Critical" ? "#991b1b" : a.priority === "High" ? "#9a3412" : "#854d0e" }}>{a.priority}</span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: "4px" }}>{a.desc}</div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {a.fields.map(f => <span key={f} style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#ede9fe", color: "#5b21b6", fontWeight: 600 }}>{f}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 4: Architecture Ownership Diagram */}
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#0f172a", color: "white" }}>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>4 · Architecture Ownership Diagram</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { system: "TIM", role: "Operational Workflow", fields: ["Deliverables", "Approaching Date (partial)"], color: "#065f46", bg: "#d1fae5", arrow: "→ Roger UI (read)" },
                  { system: "PDC", role: "Entity Hierarchy", fields: ["Client ID", "Client Name", "Entity Count (B5)"], color: "#1e40af", bg: "#dbeafe", arrow: "→ Roger UI (read)" },
                  { system: "Roger", role: "UI Consumption", fields: ["All fields (read-only consumer)"], color: "#374151", bg: "#f3f4f6", arrow: "← reads from PDC + TDC" },
                  { system: "TDC", role: "Filing Authority", fields: ["On Track / At Risk (future)", "Overdue Flag (future)"], color: "#5b21b6", bg: "#ede9fe", arrow: "→ Roger UI (future)" },
                  { system: "Shared", role: "Derived Business Logic", fields: ["% Complete", "Approaching Date"], color: "#92400e", bg: "#fef3c7", arrow: "⚠ No single owner — ADR required" },
                ].map(item => (
                  <div key={item.system} style={{ display: "flex", gap: "10px", padding: "8px 10px", borderRadius: "6px", backgroundColor: item.bg, border: `1px solid ${item.bg}` }}>
                    <div style={{ width: "48px", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", fontWeight: 800, color: item.color }}>{item.system}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: item.color }}>{item.role}</div>
                      <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>{item.fields.join(" · ")}</div>
                      <div style={{ fontSize: "9px", color: item.color, marginTop: "2px", fontStyle: "italic" }}>{item.arrow}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── EXPORT BAR ── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", padding: "12px 16px", backgroundColor: "#f9fafb", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", alignSelf: "center" }}>EXPORT:</span>
        {[
          { label: "Governance Gap Summary", fn: () => copyText(buildGovGapSummary(MY_CLIENTS_FIELDS), "gap") },
          { label: "Executive Summary", fn: () => copyText(buildExecSummary(MY_CLIENTS_FIELDS), "exec") },
          { label: "ADR Dependency Report", fn: () => copyText(buildAdrReport(MY_CLIENTS_FIELDS), "adr") },
          {
            label: "Architecture Review Snapshot",
            fn: () => copyText(
              `DCT PLATFORM — ARCHITECTURE REVIEW SNAPSHOT\nMy Clients Screen — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\n\nFIELD GOVERNANCE MATRIX\n${MY_CLIENTS_FIELDS.map(f => `${f.uiField.padEnd(22)} | Gov: ${f.govStatus.padEnd(12)} | Owner: ${f.authorityOwner.padEnd(10)} | Risk: ${f.risk.padEnd(8)} | ADR: ${f.adrDependency}`).join("\n")}`,
              "arch"
            ),
          },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={btn.fn}
            style={{ fontSize: "11px", fontWeight: 600, padding: "6px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", backgroundColor: "white", color: "#374151", cursor: "pointer", transition: "all 0.15s" }}
          >
            {copied === btn.label.split(" ")[0].toLowerCase() ? "✓ Copied!" : `📋 ${btn.label}`}
          </button>
        ))}
        <button
          onClick={() => {
            const text = buildGovGapSummary(MY_CLIENTS_FIELDS);
            const subject = "DCT Platform — My Clients Governance Gap Summary";
            window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`);
          }}
          style={{ fontSize: "11px", fontWeight: 600, padding: "6px 12px", borderRadius: "6px", border: "1px solid #003865", backgroundColor: "#003865", color: "white", cursor: "pointer" }}
        >
          ✉ Email Summary
        </button>
      </div>

    </div>
  );
}
