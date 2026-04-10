// DCT Platform — UI/Data Point Mapping
// Shows how Roger UI data points map to PDC and TDC API endpoints
import { useState } from "react";

const UI_SCREENS = [
  {
    screen: "Trial Balance Upload",
    batch: "Batch 1",
    batchColor: "#059669",
    fields: [
      { uiLabel: "Client Name", apiField: "EntityId", source: "PDC", endpoint: "POST /ingestion/jobs", type: "string" },
      { uiLabel: "Tax Year", apiField: "TaxYear", source: "PDC", endpoint: "POST /ingestion/jobs", type: "integer" },
      { uiLabel: "Period Start", apiField: "PeriodStart", source: "PDC", endpoint: "POST /ingestion/jobs", type: "date" },
      { uiLabel: "Period End", apiField: "PeriodEnd", source: "PDC", endpoint: "POST /ingestion/jobs", type: "date" },
      { uiLabel: "File Upload", apiField: "SourceFile.FileHash", source: "PDC", endpoint: "POST /ingestion/files", type: "blob" },
      { uiLabel: "Job Status", apiField: "IngestionJob.Status", source: "PDC", endpoint: "GET /ingestion/jobs/{jobId}", type: "enum" },
    ],
  },
  {
    screen: "Normalized Records View",
    batch: "Batch 2",
    batchColor: "#2563eb",
    fields: [
      { uiLabel: "Account Code", apiField: "NormalizedRecord.AccountCode", source: "PDC", endpoint: "GET /normalized/{runId}/facts", type: "string" },
      { uiLabel: "Amount", apiField: "NormalizedRecord.Amount", source: "PDC", endpoint: "GET /normalized/{runId}/facts", type: "decimal" },
      { uiLabel: "Currency", apiField: "NormalizedRecord.CurrencyCode", source: "PDC", endpoint: "GET /normalized/{runId}/facts", type: "string" },
      { uiLabel: "LOB", apiField: "NormalizedRecord.LOBCode", source: "PDC", endpoint: "GET /normalized/{runId}/facts", type: "string" },
      { uiLabel: "Record Count", apiField: "CanonicalDataset.RecordCount", source: "PDC", endpoint: "GET /datasets/{datasetId}", type: "integer" },
    ],
  },
  {
    screen: "Tax Mapping Review",
    batch: "Batch 4",
    batchColor: "#7c3aed",
    fields: [
      { uiLabel: "Tax Code", apiField: "TaxMapping.TaxCode", source: "TDC", endpoint: "GET /mappings/{runId}", type: "string" },
      { uiLabel: "Confidence Score", apiField: "TaxMapping.Confidence", source: "TDC", endpoint: "GET /mappings/{runId}", type: "decimal" },
      { uiLabel: "Evidence", apiField: "TaxMapping.Evidence", source: "TDC", endpoint: "GET /mappings/{runId}/evidence", type: "json" },
      { uiLabel: "AI Reasoning", apiField: "TaxMapping.Reasoning", source: "TDC", endpoint: "GET /mappings/{runId}/reasoning", type: "text" },
      { uiLabel: "Proposal Status", apiField: "TaxMapping.Status", source: "TDC", endpoint: "PATCH /mappings/{mappingId}", type: "enum" },
    ],
  },
  {
    screen: "Practitioner Adjustment",
    batch: "Batch 6",
    batchColor: "#d97706",
    fields: [
      { uiLabel: "Original Amount", apiField: "TaxDecision.OriginalAmount", source: "TDC", endpoint: "GET /decisions/{decisionId}", type: "decimal" },
      { uiLabel: "Adjusted Amount", apiField: "TaxDecision.AdjustedAmount", source: "TDC", endpoint: "PATCH /decisions/{decisionId}", type: "decimal" },
      { uiLabel: "Adjustment Reason", apiField: "TaxDecision.AdjustmentReason", source: "TDC", endpoint: "PATCH /decisions/{decisionId}", type: "text" },
      { uiLabel: "Approved By", apiField: "TaxDecision.ApprovedBy", source: "TDC", endpoint: "POST /decisions/{decisionId}/approve", type: "string" },
      { uiLabel: "Audit Trail", apiField: "TaxDecision.AuditTrail", source: "TDC", endpoint: "GET /decisions/{decisionId}/audit", type: "json" },
    ],
  },
];

const SOURCE_COLOR: Record<string, string> = { PDC: "#059669", TDC: "#2563eb" };
const TYPE_COLOR: Record<string, string> = {
  string: "#6366f1", integer: "#0891b2", decimal: "#059669",
  date: "#d97706", enum: "#7c3aed", blob: "#dc2626", json: "#374151", text: "#6b7280"
};

export default function DataModelPage() {
  const [activeScreen, setActiveScreen] = useState(0);
  const screen = UI_SCREENS[activeScreen];

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 8px", borderRadius: "4px" }}>
            Data Mapping
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Roger UI — Data Point Mapping
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Maps every Roger UI field to its backing API endpoint across PDC and TDC.
        </p>
      </div>

      {/* Screen selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {UI_SCREENS.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveScreen(i)}
            style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px",
              border: `1px solid ${activeScreen === i ? s.batchColor : "#e5e7eb"}`,
              backgroundColor: activeScreen === i ? s.batchColor + "18" : "white",
              color: activeScreen === i ? s.batchColor : "#374151",
              cursor: "pointer"
            }}
          >
            {s.screen}
            <span style={{ marginLeft: "6px", fontSize: "10px", opacity: 0.7 }}>{s.batch}</span>
          </button>
        ))}
      </div>

      {/* Mapping table */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{screen.screen}</span>
          <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: screen.batchColor + "20", color: screen.batchColor }}>
            {screen.batch}
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb" }}>
              {["UI Label", "API Field", "Source", "Endpoint", "Type"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {screen.fields.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>{f.uiLabel}</td>
                <td style={{ padding: "10px 16px", fontSize: "12px", fontFamily: "monospace", color: "#374151" }}>{f.apiField}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: SOURCE_COLOR[f.source] + "20", color: SOURCE_COLOR[f.source] }}>
                    {f.source}
                  </span>
                </td>
                <td style={{ padding: "10px 16px", fontSize: "11px", fontFamily: "monospace", color: "#6b7280" }}>{f.endpoint}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 6px", borderRadius: "3px", backgroundColor: TYPE_COLOR[f.type] + "20", color: TYPE_COLOR[f.type] }}>
                    {f.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
