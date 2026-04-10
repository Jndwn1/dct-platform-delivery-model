// DCT Platform — Roger UI Data Mapping
// Shows how each Roger UI screen maps to backend API endpoints and data objects
import { useState } from "react";

const ROGER_SCREENS = [
  {
    id: "RS-01",
    name: "Dashboard — Platform Status",
    batch: "Foundation Core",
    batchColor: "#059669",
    status: "Live",
    apiConnections: [
      { label: "Active Batches", endpoint: "GET /batches?status=active", source: "PDC", returns: "BatchSummary[]" },
      { label: "Gate Status", endpoint: "GET /gates/current", source: "PDC", returns: "GateStatus" },
      { label: "Agent Health", endpoint: "GET /agents/status", source: "Orchestrator", returns: "AgentHealth[]" },
    ],
  },
  {
    id: "RS-02",
    name: "Trial Balance Upload",
    batch: "Batch 1",
    batchColor: "#2563eb",
    status: "Live",
    apiConnections: [
      { label: "Upload File", endpoint: "POST /ingestion/files", source: "PDC", returns: "{ fileId, documentId }" },
      { label: "Create Job", endpoint: "POST /ingestion/jobs", source: "PDC", returns: "IngestionJob" },
      { label: "Poll Status", endpoint: "GET /ingestion/jobs/{jobId}", source: "PDC", returns: "IngestionJob.Status" },
      { label: "View Events", endpoint: "GET /ingestion/jobs/{jobId}/events", source: "PDC", returns: "ServiceBusEvent[]" },
    ],
  },
  {
    id: "RS-03",
    name: "Normalized Records View",
    batch: "Batch 2",
    batchColor: "#7c3aed",
    status: "In Dev",
    apiConnections: [
      { label: "Fetch Records", endpoint: "GET /normalized/{runId}/facts", source: "PDC", returns: "NormalizedRecord[]" },
      { label: "Dataset Info", endpoint: "GET /datasets/{datasetId}", source: "PDC", returns: "CanonicalDataset" },
      { label: "Lineage Graph", endpoint: "GET /lineage/{runId}", source: "PDC", returns: "LineageGraph" },
    ],
  },
  {
    id: "RS-04",
    name: "Tax Mapping Review",
    batch: "Batch 4",
    batchColor: "#d97706",
    status: "Planned",
    apiConnections: [
      { label: "Fetch Proposals", endpoint: "GET /mappings/{runId}", source: "TDC", returns: "TaxMappingProposal[]" },
      { label: "View Evidence", endpoint: "GET /mappings/{mappingId}/evidence", source: "TDC", returns: "Evidence" },
      { label: "Approve Mapping", endpoint: "PATCH /mappings/{mappingId}", source: "TDC", returns: "TaxMappingProposal" },
      { label: "Fetch Decisions", endpoint: "GET /decisions/{runId}", source: "TDC", returns: "TaxDecision[]" },
    ],
  },
  {
    id: "RS-05",
    name: "Practitioner Adjustment",
    batch: "Batch 6",
    batchColor: "#dc2626",
    status: "Planned",
    apiConnections: [
      { label: "Load Decision", endpoint: "GET /decisions/{decisionId}", source: "TDC", returns: "TaxDecision" },
      { label: "Submit Adjustment", endpoint: "PATCH /decisions/{decisionId}", source: "TDC", returns: "TaxDecision" },
      { label: "Approve Decision", endpoint: "POST /decisions/{decisionId}/approve", source: "TDC", returns: "ApprovalRecord" },
      { label: "Audit Trail", endpoint: "GET /decisions/{decisionId}/audit", source: "TDC", returns: "AuditEntry[]" },
    ],
  },
];

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  "Live":    { bg: "#dcfce7", text: "#166534" },
  "In Dev":  { bg: "#dbeafe", text: "#1e40af" },
  "Planned": { bg: "#f3f4f6", text: "#374151" },
};

const SOURCE_COLOR: Record<string, string> = {
  "PDC": "#059669",
  "TDC": "#2563eb",
  "Orchestrator": "#7c3aed",
};

export default function RogerMappingPage() {
  const [activeScreen, setActiveScreen] = useState("RS-01");
  const screen = ROGER_SCREENS.find(s => s.id === activeScreen)!;

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2563eb", backgroundColor: "#dbeafe", padding: "2px 8px", borderRadius: "4px" }}>
            Roger UI
          </span>
          <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
            Data Point Mapping
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Roger UI Data Mapping
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Maps every Roger UI screen to its backing API endpoints, data objects, and system authority (PDC or TDC).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px" }}>
        {/* Screen list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {ROGER_SCREENS.map(s => {
            const ss = STATUS_STYLE[s.status];
            return (
              <button
                key={s.id}
                onClick={() => setActiveScreen(s.id)}
                style={{
                  padding: "10px 12px", textAlign: "left", borderRadius: "8px",
                  border: `1px solid ${activeScreen === s.id ? s.batchColor : "#e5e7eb"}`,
                  backgroundColor: activeScreen === s.id ? s.batchColor + "10" : "white",
                  cursor: "pointer"
                }}
              >
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#9ca3af", marginBottom: "2px" }}>{s.id}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>{s.name}</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "3px", backgroundColor: s.batchColor + "20", color: s.batchColor }}>{s.batch}</span>
                  <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "3px", backgroundColor: ss.bg, color: ss.text }}>{s.status}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* API connections */}
        <div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", marginRight: "8px" }}>{screen.id}</span>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{screen.name}</span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", backgroundColor: screen.batchColor + "20", color: screen.batchColor, fontWeight: 600 }}>{screen.batch}</span>
                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "4px", backgroundColor: STATUS_STYLE[screen.status].bg, color: STATUS_STYLE[screen.status].text, fontWeight: 600 }}>{screen.status}</span>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  {["UI Element", "API Endpoint", "System", "Returns"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e5e7eb" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {screen.apiConnections.map((conn, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 0 ? "white" : "#fafafa" }}>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>{conn.label}</td>
                    <td style={{ padding: "12px 16px", fontSize: "12px", fontFamily: "monospace", color: "#374151" }}>
                      <span style={{ color: conn.endpoint.startsWith("POST") ? "#dc2626" : conn.endpoint.startsWith("PATCH") ? "#d97706" : "#2563eb", fontWeight: 700, marginRight: "6px" }}>
                        {conn.endpoint.split(" ")[0]}
                      </span>
                      {conn.endpoint.split(" ").slice(1).join(" ")}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: SOURCE_COLOR[conn.source] + "20", color: SOURCE_COLOR[conn.source] }}>
                        {conn.source}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "11px", fontFamily: "monospace", color: "#6b7280" }}>{conn.returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
