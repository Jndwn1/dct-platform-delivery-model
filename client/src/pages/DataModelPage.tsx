// DCT Platform — Data Model & Gaps — Executive Reference
// 5 sections: Data Model Relationships, Data Availability, UI to Data Mapping, Gaps, Architecture Violations
//
// GOVERNANCE RULE: Data Availability rows are derived from batchModelSource.ts
// (which reads from dctData.ts). DO NOT hardcode batch names, statuses, or
// systems here. Update dctData.ts to change batch metadata.
import { useState, useMemo } from "react";
import { getDataAvailabilityRows, batchStatusBadge, validateBatchRefs, type SwaggerContractStatus } from "../lib/batchModelSource";
import { ROGER_MODEL_GROUPS, READINESS_STYLE, OWNER_STYLE } from "../lib/rogerModelData";

// ─── ROGER MODEL GROUPINGS COMPONENT ─────────────────────────────────────────
function RogerModelGroupings() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(["my-clients"]));
  const toggle = (id: string) => setOpenGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {ROGER_MODEL_GROUPS.map(group => {
        const open = openGroups.has(group.id);
        const counts = { Delivered: 0, Partial: 0, Mocked: 0, Missing: 0, Deferred: 0 };
        group.fields.forEach(f => counts[f.status]++);
        return (
          <div key={group.id} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <button onClick={() => toggle(group.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#003865", color: "white", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700 }}>{group.title}</span>
                <div style={{ display: "flex", gap: "4px" }}>
                  {(Object.entries(counts) as [keyof typeof counts, number][]).filter(([, n]) => n > 0).map(([s, n]) => (
                    <span key={s} style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "9999px", backgroundColor: READINESS_STYLE[s].bg, color: READINESS_STYLE[s].text, fontWeight: 700 }}>{n} {s.slice(0,1)}</span>
                  ))}
                </div>
              </div>
              <span style={{ color: "#93c5fd", fontSize: "12px" }}>{open ? "▲" : "▼"}</span>
            </button>
            {open && (
              <div style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "10px", fontStyle: "italic" }}>{group.desc}</p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        {["UI Field","API Field","Source","Owner","Batch","Swagger","Status","Gap / Blocker"].map(h => (
                          <th key={h} style={{ padding: "7px 10px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {group.fields.map((f, i) => {
                        const rs = READINESS_STYLE[f.status];
                        const os = OWNER_STYLE[f.owner] || { bg: "#f3f4f6", text: "#374151" };
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: f.status === "Missing" ? "#fff5f5" : i % 2 === 0 ? "white" : "#fafafa" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 600, color: "#111827" }}>{f.uiField}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: "11px", color: "#6b7280" }}>{f.apiField}</td>
                            <td style={{ padding: "8px 10px", color: "#374151" }}>{f.source}</td>
                            <td style={{ padding: "8px 10px" }}><span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: os.bg, color: os.text }}>{f.owner}</span></td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#374151" }}>{f.batch}</td>
                            <td style={{ padding: "8px 10px", fontFamily: "monospace", fontSize: "10px", color: "#9ca3af", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.swagger}>{f.swagger}</td>
                            <td style={{ padding: "8px 10px" }}><span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "9999px", backgroundColor: rs.bg, color: rs.text, whiteSpace: "nowrap" }}>{rs.label}</span></td>
                            <td style={{ padding: "8px 10px", color: "#6b7280", fontSize: "11px" }}>{f.gap !== "—" ? <span>⚠ {f.gap}</span> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── SWAGGER CONTRACT BADGE HELPER ───────────────────────────────────────────────────────────
function swaggerBadge(status: SwaggerContractStatus): { bg: string; text: string; label: string; icon: string } {
  switch (status) {
    case "ALIGNED":          return { bg: "#d1fae5", text: "#065f46", label: "Aligned",          icon: "✓" };
    case "MISSING_CONTRACT": return { bg: "#fef3c7", text: "#92400e", label: "Missing Contract",  icon: "○" };
    case "OUT_OF_SYNC":      return { bg: "#fee2e2", text: "#991b1b", label: "Out of Sync",       icon: "⚠" };
    case "NOT_APPLICABLE":   return { bg: "#f3f4f6", text: "#9ca3af", label: "N/A",               icon: "—" };
  }
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const LINEAGE_NODES = [
  { label: "Client Group", system: "EODS / CEM", color: "#6366f1", fields: [] },
  { label: "Entity", system: "EODS / CEM", color: "#6366f1", fields: ["EntityId (GUID)"] },
  { label: "Engagement", system: "EODS / CEM", color: "#6366f1", fields: ["PeriodStart", "PeriodEnd"] },
  { label: "Source File", system: "Tax Portal → PDC", color: "#059669", fields: ["DocumentId (GUID)", "JobId (GUID)"] },
  { label: "PDC Record", system: "PDC", color: "#059669", fields: ["SourceRecordId (GUID)", "RunId (GUID)"] },
  { label: "TDC Record", system: "TDC", color: "#2563eb", fields: ["TdcRecordId (GUID)"] },
  { label: "Tax-Ready Record", system: "TDC", color: "#2563eb", fields: ["TaxReadyId (GUID)", "TaxYear (derived)"] },
  { label: "Filed Return", system: "Roger", color: "#7c3aed", fields: ["FilingId (GUID)"] },
];

const KEY_IDENTIFIERS = [
  { id: "DocumentId (GUID)", assignedBy: "Tax Portal", travelsTo: "PDC, TDC, Roger" },
  { id: "JobId (GUID)", assignedBy: "Tax Portal", travelsTo: "PDC, TDC" },
  { id: "EntityId (GUID)", assignedBy: "EODS / CEM", travelsTo: "All systems" },
  { id: "PeriodStart (DateOnly)", assignedBy: "EODS / CEM", travelsTo: "All systems — governing temporal field; TaxYear is derived from this in TDC only" },
  { id: "PeriodEnd (DateOnly)", assignedBy: "EODS / CEM", travelsTo: "All systems — PeriodEnd >= PeriodStart enforced" },
  { id: "SourceRecordId (GUID)", assignedBy: "PDC", travelsTo: "TDC" },
  { id: "RunId (GUID)", assignedBy: "PDC", travelsTo: "TDC" },
  { id: "TdcRecordId (GUID)", assignedBy: "TDC", travelsTo: "Roger" },
  { id: "TaxYear (derived)", assignedBy: "TDC only", travelsTo: "Roger (display only) — never stored in PDC" },
];

// DATA_AVAILABILITY is now derived from batchModelSource.ts (see import above)
// DO NOT define a static DATA_AVAILABILITY array here.

const UI_MAPPING = [
  { field: "Process Step", source: "Batch status in batchFlowStore", type: "Stored", owner: "DCT / BA" },
  { field: "Completion %", source: "Component + story counts (runtime)", type: "Derived", owner: "DCT / BA" },
  { field: "On Track / At Risk / Overdue", source: "Readiness score + due date delta", type: "Derived", owner: "Undefined" },
  { field: "Issue Count", source: "Next Actions panel (runtime filter)", type: "Derived", owner: "DCT / BA" },
  { field: "Entity Count", source: "EODS / CEM via EntityId (GUID)", type: "Stored", owner: "EODS / CEM" },
  { field: "Due Date", source: "Engagement record in EODS / CEM", type: "Stored", owner: "EODS / CEM" },
];

const GAPS = [
  { num: 1, title: "Process state ownership", desc: "No single system owns the authoritative delivery status (Active / Complete / Blocked) across batch lifecycle; currently managed in prototype only." },
  { num: 2, title: "Derived metric definitions", desc: "Completion % and On Track / At Risk / Overdue have no agreed formula or system of record; definitions must be formalized before Roger or reporting can consume them." },
  { num: 3, title: "Role ownership", desc: "No defined owner for readiness gate sign-off (Architecture Ready, Schema Defined, Stories Generated); approval authority is unassigned." },
  { num: 4, title: "Client approval ownership", desc: "Client Group and Engagement approval steps are not mapped to a system; EODS / CEM holds the data but the approval workflow owner is undefined." },
  { num: 5, title: "System of record conflicts", desc: "EntityId (GUID) originates in EODS / CEM but is passed through Tax Portal, PDC, and TDC without a formal master data contract; risk of divergence across systems." },
  { num: 6, title: "PeriodStart / PeriodEnd adoption", desc: "All transactional records must carry PeriodStart (DateOnly) and PeriodEnd (DateOnly) instead of tax_year. TaxYear is derived in TDC only. Any screen or API still using tax_year as a stored field must be updated." },
  { num: 7, title: "Append-only enforcement", desc: "MappingDecision, LineageEvent, FilingRecord, and AdjustmentRecord are append-only. No update or delete operations are permitted. Enforcement must be validated at the database and API layer before Gate 2 (Invariant Lock) can close." },
  { num: 8, title: "IMS integration boundary", desc: "IMS receives outbound outputs from TDC only (vFinalTaxReady, vReturnSummary). IMS does not read from the platform and has no write access. The integration contract must be formally defined before Batch 8 delivery." },
  { num: 9, title: "AI Orchestrator statelessness", desc: "The AI Orchestrator is stateless and does not persist data. All persistence flows through PDC or TDC APIs. TDC does not invoke the Orchestrator. A second AI execution is not permitted for the same file." },
];

const VIOLATIONS = [
  {
    id: "V1", title: "No Direct PDC ↔ TDC Communication", type: "BOUNDARY RULE",
    desc: "PDC and TDC must never communicate directly. All interactions between PDC and TDC occur exclusively via the AI Orchestrator (for proposals) or via Service Bus events (PDC_READY_EVENT). Any design that routes data directly from PDC to TDC — or vice versa — is an architecture violation.",
    permitted: "PDC → Service Bus → AI Orchestrator → TDC",
    prohibited: "PDC → TDC (direct)",
    color: "#dc2626"
  },
  {
    id: "V2", title: "No Tax Logic in PDC", type: "SEPARATION OF CONCERNS",
    desc: "PDC is the system of record for firm-level financial facts, ingestion, normalization, and XLOB taxonomy only. Tax taxonomy, tax mapping decisions, tax-ready records, and TaxYear derivation belong exclusively to TDC. Any tax logic, tax field, or tax-derived value stored or computed in PDC is an architecture violation.",
    permitted: "PDC owns: FinancialFact, IngestionJob, SourceFile, vNormalizedTb",
    prohibited: "TDC owns: TaxYear, MappingDecision, TaxReadyRecord, FilingRecord",
    color: "#d97706"
  },
  {
    id: "V3", title: "No Write Access from Roger", type: "READ-ONLY CONSUMER",
    desc: "Roger UI is a read-only consumer of PDC and TDC. Roger displays data from PDC (via vNormalizedTb) and TDC (via TDC Records API, vFinalTaxReady, vReturnSummary) but has zero write access to either system. Any feature that allows Roger to create, update, or delete records in PDC or TDC is an architecture violation.",
    permitted: "Roger → GET /api/tdc/records",
    prohibited: "Roger → POST / PUT / DELETE to PDC or TDC",
    color: "#7c3aed"
  },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = {
  page: { padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" } as React.CSSProperties,
  sectionCard: { border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", marginBottom: "24px" } as React.CSSProperties,
  sectionHeader: { padding: "14px 20px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px" } as React.CSSProperties,
  sectionTitle: { fontSize: "13px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, color: "#374151" },
  sectionBody: { padding: "20px" } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "13px" },
  th: { padding: "8px 12px", textAlign: "left" as const, fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase" as const, letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f9fafb" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" as const },
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function DataModelPage() {
  const [expandedGap, setExpandedGap] = useState<number | null>(null);
  const [expandedViolation, setExpandedViolation] = useState<string | null>("V1");

  // GOVERNANCE: Data Availability rows derived from Batch Model (dctData.ts via batchModelSource.ts)
  // Updating allBatches in dctData.ts automatically updates this table.
  const dataAvailabilityRows = useMemo(() => getDataAvailabilityRows(), []);

  // Validate all batch refs used on this page against the Batch Model
  const batchRefValidation = useMemo(() => validateBatchRefs(["FC-00", "AB-01", "AB-02", "AB-03", "AB-04", "AB-05", "AB-06", "AB-07", "AB-08", "AB-09", "AB-10", "AB-11", "AB-12"]), []);
  const hasOrphanedRefs = batchRefValidation.orphaned.length > 0;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>Executive Reference</span>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#374151", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>DCT Platform</span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Data Model &amp; Gaps</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>Executive reference · Platform data relationships, availability, UI mapping, and open gaps</p>
      </div>

      {/* Section 1 — Data Model Relationships */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>🔗</span>
          <span style={s.sectionTitle}>1 · Data Model Relationships</span>
        </div>
        <div style={s.sectionBody}>
          {/* Lineage Chain */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "12px" }}>Lineage Chain</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0", alignItems: "flex-start" }}>
              {LINEAGE_NODES.map((node, i) => (
                <div key={node.label} style={{ display: "flex", alignItems: "flex-start" }}>
                  <div style={{ border: `1.5px solid ${node.color}`, borderRadius: "8px", padding: "8px 12px", minWidth: "110px", backgroundColor: node.color + "0d" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: node.color, marginBottom: "2px" }}>{node.label}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", marginBottom: node.fields.length ? "4px" : 0 }}>{node.system}</div>
                    {node.fields.map(f => (
                      <div key={f} style={{ fontSize: "10px", fontFamily: "monospace", color: "#374151", backgroundColor: "#f3f4f6", padding: "1px 4px", borderRadius: "3px", marginTop: "2px", display: "inline-block", marginRight: "2px" }}>{f}</div>
                    ))}
                  </div>
                  {i < LINEAGE_NODES.length - 1 && (
                    <div style={{ padding: "16px 4px", color: "#9ca3af", fontSize: "14px" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Identifiers */}
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "10px" }}>Key Identifiers by System</div>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Identifier</th>
                <th style={s.th}>Assigned By</th>
                <th style={s.th}>Travels To</th>
              </tr>
            </thead>
            <tbody>
              {KEY_IDENTIFIERS.map((row, i) => (
                <tr key={row.id} style={{ backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: "12px", color: "#2563eb", fontWeight: 600 }}>{row.id}</td>
                  <td style={{ ...s.td, color: "#374151" }}>{row.assignedBy}</td>
                  <td style={{ ...s.td, color: "#6b7280" }}>{row.travelsTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2 — Data Availability */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>🗂️</span>
          <span style={s.sectionTitle}>2 · Data Availability</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ ...s.table, minWidth: "900px" }}>
            <thead>
              <tr>
                <th style={s.th}>Stage</th>
                <th style={s.th}>System</th>
                <th style={s.th}>Data Available</th>
                <th style={s.th}>Roger Can Use</th>
                <th style={s.th}>Usage Type</th>
                <th style={s.th}>Notes</th>
                <th style={{ ...s.th, whiteSpace: "nowrap" as const }}>Contract</th>
              </tr>
            </thead>
            <tbody>
              {/* Orphaned batch reference warning — only shown if Batch Model has changed */}
              {hasOrphanedRefs && (
                <tr>
                  <td colSpan={7} style={{ padding: "8px 12px", backgroundColor: "#fef3c7", color: "#92400e", fontSize: "11px", fontWeight: 600 }}>
                    ⚠ Governance Warning: {batchRefValidation.orphaned.join(", ")} referenced here but not found in Batch Model (dctData.ts). Update batchModelSource.ts to resolve.
                  </td>
                </tr>
              )}
              {dataAvailabilityRows.map((row, i) => (
                <tr key={row.stage} style={{ backgroundColor: i % 2 === 0 ? "white" : "#fafafa", opacity: row.isOrphaned ? 0.5 : 1 }}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: "13px" }}>{row.stage}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <span style={{ fontSize: "10px", color: "#9ca3af" }}>{row.batchId}</span>
                      {(() => { const b = batchStatusBadge(row.batchStatus); return <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", backgroundColor: b.bg, color: b.text }}>{b.label}</span>; })()}
                      {row.isOrphaned && <span style={{ fontSize: "9px", fontWeight: 700, color: "#dc2626" }}>ORPHANED</span>}
                    </div>
                  </td>
                  <td style={{ ...s.td, fontFamily: "monospace", fontSize: "11px", color: "#374151", whiteSpace: "nowrap" as const }}>{row.system}</td>
                  <td style={{ ...s.td, fontSize: "12px", color: "#374151", maxWidth: "280px" }}>{row.dataAvailable}</td>
                  <td style={s.td}>
                    <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: row.rogerCanUse ? "#d1fae5" : "#fee2e2", color: row.rogerCanUse ? "#059669" : "#dc2626" }}>
                      {row.rogerCanUse ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: "12px", color: "#6b7280" }}>{row.usageType}</td>
                  <td style={{ ...s.td, fontSize: "11px", color: "#9ca3af", maxWidth: "200px" }}>{row.notes}</td>
                  <td style={{ ...s.td, verticalAlign: "top" as const }}>
                    {(() => {
                      const b = swaggerBadge(row.swaggerStatus);
                      return (
                        <div style={{ display: "flex", flexDirection: "column" as const, gap: "3px" }}>
                          <span
                            title={row.swaggerDetail}
                            style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px", backgroundColor: b.bg, color: b.text, whiteSpace: "nowrap" as const, cursor: "default" }}
                          >
                            {b.icon} {b.label}
                          </span>
                          {row.swaggerEndpoint && (
                            <span style={{ fontSize: "9px", fontFamily: "monospace", color: "#6b7280", whiteSpace: "nowrap" as const }}>{row.swaggerEndpoint}</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Swagger Contract Validation Legend */}
        <div style={{ padding: "10px 20px 14px", borderTop: "1px solid #f3f4f6", display: "flex", flexWrap: "wrap" as const, gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#9ca3af", marginRight: "4px" }}>Contract Validation:</span>
          {([
            { status: "ALIGNED",          icon: "✓", label: "Aligned — contract exists and matches Batch Model",         bg: "#d1fae5", text: "#065f46" },
            { status: "MISSING_CONTRACT", icon: "○", label: "Missing Contract — not yet published in Swagger",           bg: "#fef3c7", text: "#92400e" },
            { status: "OUT_OF_SYNC",      icon: "⚠", label: "Out of Sync — Swagger field mismatch with Batch Model",    bg: "#fee2e2", text: "#991b1b" },
            { status: "NOT_APPLICABLE",   icon: "—", label: "N/A — internal/infrastructure; no API contract expected",  bg: "#f3f4f6", text: "#9ca3af" },
          ] as const).map(item => (
            <span key={item.status} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#6b7280" }}>
              <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "3px", backgroundColor: item.bg, color: item.text }}>{item.icon} {item.status === "ALIGNED" ? "Aligned" : item.status === "MISSING_CONTRACT" ? "Missing Contract" : item.status === "OUT_OF_SYNC" ? "Out of Sync" : "N/A"}</span>
              <span style={{ fontSize: "10px", color: "#9ca3af" }}>{item.label.split("—")[1]?.trim()}</span>
            </span>
          ))}
          <span style={{ fontSize: "10px", color: "#d1d5db", marginLeft: "auto" }}>Swagger validation is read-only — Batch Model remains source of truth</span>
        </div>
      </div>

      {/* Section 3 — UI to Data Mapping */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>📊</span>
          <span style={s.sectionTitle}>3 · UI to Data Mapping</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>UI Field</th>
                <th style={s.th}>Source</th>
                <th style={s.th}>Type</th>
                <th style={s.th}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {UI_MAPPING.map((row, i) => (
                <tr key={row.field} style={{ backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#111827" }}>{row.field}</td>
                  <td style={{ ...s.td, color: "#374151" }}>{row.source}</td>
                  <td style={s.td}>
                    <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 7px", borderRadius: "4px", backgroundColor: row.type === "Stored" ? "#dbeafe" : "#fef3c7", color: row.type === "Stored" ? "#2563eb" : "#d97706" }}>
                      {row.type}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontSize: "12px", color: row.owner === "Undefined" ? "#dc2626" : "#374151", fontStyle: row.owner === "Undefined" ? "italic" : "normal" }}>{row.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4 — Gaps */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>⚠️</span>
          <span style={s.sectionTitle}>4 · Gaps</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: "#fee2e2", color: "#dc2626" }}>{GAPS.length} open</span>
        </div>
        <div style={{ padding: "12px 20px" }}>
          {GAPS.map((gap) => (
            <div
              key={gap.num}
              style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
              onClick={() => setExpandedGap(expandedGap === gap.num ? null : gap.num)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#fee2e2", color: "#dc2626", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {gap.num}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827", flex: 1 }}>{gap.title}</span>
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>{expandedGap === gap.num ? "▲" : "▼"}</span>
              </div>
              {expandedGap === gap.num && (
                <div style={{ padding: "0 0 14px 36px", fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                  {gap.desc}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 5 — Architecture Violations */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>🚫</span>
          <span style={s.sectionTitle}>5 · Architecture Violations</span>
        </div>
        <div style={{ padding: "12px 20px 4px" }}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px", padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px" }}>
            Critical no-go rules — any design or implementation that violates these boundaries must be rejected
          </div>
          {VIOLATIONS.map((v) => (
            <div
              key={v.id}
              style={{ border: `1px solid ${v.color}30`, borderRadius: "10px", marginBottom: "12px", overflow: "hidden", cursor: "pointer" }}
              onClick={() => setExpandedViolation(expandedViolation === v.id ? null : v.id)}
            >
              <div style={{ padding: "12px 16px", backgroundColor: v.color + "08", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: v.color, color: "white", flexShrink: 0 }}>INVARIANT</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: v.color, flexShrink: 0 }}>{v.id}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", flex: 1 }}>{v.title}</span>
                <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "3px", backgroundColor: "#f3f4f6", color: "#6b7280" }}>{v.type}</span>
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>{expandedViolation === v.id ? "▲" : "▼"}</span>
              </div>
              {expandedViolation === v.id && (
                <div style={{ padding: "14px 16px", borderTop: `1px solid ${v.color}20` }}>
                  <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" }}>{v.desc}</p>
                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>✓ Permitted</div>
                      <code style={{ fontSize: "11px", color: "#059669", backgroundColor: "#d1fae5", padding: "4px 8px", borderRadius: "4px", display: "block" }}>{v.permitted}</code>
                    </div>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>✗ Prohibited</div>
                      <code style={{ fontSize: "11px", color: "#dc2626", backgroundColor: "#fee2e2", padding: "4px 8px", borderRadius: "4px", display: "block" }}>{v.prohibited}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Section 6 — Roger API Model Groupings */}
      <div style={s.sectionCard}>
        <div style={s.sectionHeader}>
          <span style={{ fontSize: "16px" }}>🔌</span>
          <span style={s.sectionTitle}>6 · Roger API Model Groupings — Field-Level Readiness</span>
        </div>
        <div style={s.sectionBody}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>Source: Roger API Design v1.0 · 05.07.2026. Each grouping maps Roger UI fields to API contracts, ownership, batch dependency, and readiness status.</p>
          <RogerModelGroupings />
        </div>
      </div>
    </div>
  );
}
