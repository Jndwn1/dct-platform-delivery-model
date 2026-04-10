// DCT Platform — Cross-LOB Taxonomy Viewer
// Shows the canonical entity taxonomy, LOB hierarchy, and cross-LOB mapping status
import { useState } from "react";

const TAXONOMY_GROUPS = [
  {
    lob: "Tax",
    color: "#2563eb",
    bg: "#1e3a5f",
    entities: [
      { name: "TaxEntity", fields: ["EntityId", "TaxYear", "FilingType", "JurisdictionCode"], status: "Locked" },
      { name: "TaxPeriod", fields: ["PeriodStart", "PeriodEnd", "FiscalYear", "QuarterCode"], status: "Locked" },
      { name: "TaxMapping", fields: ["SourceAccountId", "TaxCode", "Confidence", "Evidence"], status: "Active" },
      { name: "TaxDecision", fields: ["DecisionId", "ApprovedBy", "AdjustedAmount", "AuditTrail"], status: "Active" },
    ],
  },
  {
    lob: "Financial (PDC)",
    color: "#059669",
    bg: "#064e3b",
    entities: [
      { name: "IngestionJob", fields: ["JobId", "DocumentId", "Status", "EntityId"], status: "Locked" },
      { name: "SourceFile", fields: ["FileId", "FileName", "FileHash", "UploadedAt"], status: "Locked" },
      { name: "NormalizedRecord", fields: ["RecordId", "AccountCode", "Amount", "CurrencyCode"], status: "Active" },
      { name: "CanonicalDataset", fields: ["DatasetId", "Version", "RecordCount", "LockedAt"], status: "Active" },
    ],
  },
  {
    lob: "Cross-LOB",
    color: "#7c3aed",
    bg: "#3b0764",
    entities: [
      { name: "EntityMapping", fields: ["SourceEntityId", "TargetEntityId", "MappingType", "Confidence"], status: "Active" },
      { name: "LOBBridge", fields: ["BridgeId", "SourceLOB", "TargetLOB", "ContractVersion"], status: "Planned" },
      { name: "TaxonomyVersion", fields: ["VersionId", "PublishedAt", "ApprovedBy", "ChangeLog"], status: "Planned" },
    ],
  },
  {
    lob: "Roger UI",
    color: "#d97706",
    bg: "#451a03",
    entities: [
      { name: "PractitionerView", fields: ["ViewId", "EntityId", "TaxYear", "DisplayFields"], status: "Planned" },
      { name: "AdjustmentRecord", fields: ["AdjId", "OriginalValue", "AdjustedValue", "Reason"], status: "Planned" },
    ],
  },
];

const CROSS_LOB_MAPPINGS = [
  { from: "PDC.NormalizedRecord.AccountCode", to: "TDC.TaxMapping.SourceAccountId", status: "Active", batch: "Batch 2" },
  { from: "PDC.CanonicalDataset.DatasetId", to: "TDC.TaxMapping.DatasetRef", status: "Active", batch: "Batch 2" },
  { from: "PDC.NormalizedRecord.Amount", to: "TDC.TaxDecision.AdjustedAmount", status: "Active", batch: "Batch 3" },
  { from: "TDC.TaxDecision.DecisionId", to: "Roger.PractitionerView.DecisionRef", status: "Planned", batch: "Batch 6" },
  { from: "TDC.TaxMapping.Confidence", to: "Roger.PractitionerView.ConfidenceScore", status: "Planned", batch: "Batch 4" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Locked:  { bg: "#166534", text: "#86efac" },
  Active:  { bg: "#1e3a5f", text: "#93c5fd" },
  Planned: { bg: "#374151", text: "#9ca3af" },
};

export default function TaxonomyPage() {
  const [activeTab, setActiveTab] = useState<"entities" | "mappings">("entities");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Tax");

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7c3aed", backgroundColor: "#ede9fe", padding: "2px 8px", borderRadius: "4px" }}>
            Taxonomy
          </span>
          <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
            Batch 2 — Normalization & Cross-LOB Taxonomy
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Cross-LOB Taxonomy Viewer
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Canonical entity definitions and cross-LOB field mappings across PDC, TDC, and Roger UI.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", borderBottom: "2px solid #e5e7eb", paddingBottom: "0" }}>
        {[
          { id: "entities", label: "Entity Taxonomy" },
          { id: "mappings", label: "Cross-LOB Mappings" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "entities" | "mappings")}
            style={{
              padding: "8px 16px", fontSize: "13px", fontWeight: 600,
              border: "none", background: "none", cursor: "pointer",
              color: activeTab === tab.id ? "#2563eb" : "#6b7280",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: "-2px"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Entity Taxonomy Tab */}
      {activeTab === "entities" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {TAXONOMY_GROUPS.map(group => (
            <div key={group.lob} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.lob ? null : group.lob)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", background: "none", border: "none", cursor: "pointer",
                  backgroundColor: "#f9fafb"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: group.color, display: "inline-block" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{group.lob}</span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>{group.entities.length} entities</span>
                </div>
                <span style={{ fontSize: "16px", color: "#9ca3af" }}>{expandedGroup === group.lob ? "▲" : "▼"}</span>
              </button>

              {expandedGroup === group.lob && (
                <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                  {group.entities.map(entity => {
                    const ss = STATUS_STYLE[entity.status];
                    return (
                      <div key={entity.name} style={{
                        backgroundColor: group.bg, borderRadius: "8px", padding: "12px",
                        border: `1px solid ${group.color}33`
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#f1f5f9" }}>{entity.name}</span>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px", backgroundColor: ss.bg, color: ss.text }}>
                            {entity.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {entity.fields.map(f => (
                            <span key={f} style={{ fontSize: "10px", color: "#94a3b8", backgroundColor: "#0f172a", padding: "2px 6px", borderRadius: "3px" }}>
                              {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cross-LOB Mappings Tab */}
      {activeTab === "mappings" && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                {["Source Field", "Target Field", "Batch", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CROSS_LOB_MAPPINGS.map((m, i) => {
                const ss = STATUS_STYLE[m.status];
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", fontFamily: "monospace", color: "#2563eb" }}>{m.from}</td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", fontFamily: "monospace", color: "#059669" }}>{m.to}</td>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#374151" }}>{m.batch}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: ss.bg, color: ss.text }}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
