// DCT Platform — AAP Review Model (Blitzy)
// Shows the Agentic Architecture Pattern review model and backlog artifact alignment
import { useState } from "react";

const AAP_PATTERNS = [
  {
    id: "AAP-01",
    name: "File Ingestion Pattern",
    batch: "Batch 1",
    status: "Approved",
    agents: ["Ingest Agent", "Validation Agent"],
    invariants: ["DocumentId immutable after creation", "JobId unique per file per period", "Status transitions: INGESTED → PROCESSING → READY | FAILED"],
    contracts: ["NEW_FILE_EVENT schema v1.0", "IngestionJob state machine contract"],
    adoFeatures: ["DCT-101: Tax Portal Upload", "DCT-102: Service Bus Publication", "DCT-103: PDC Ingestion Record"],
  },
  {
    id: "AAP-02",
    name: "Normalization Pattern",
    batch: "Batch 2",
    status: "In Review",
    agents: ["Normalization Agent", "Schema Validator"],
    invariants: ["NormalizedRecord.RecordId immutable", "CanonicalDataset locked after READY signal", "Cross-LOB taxonomy version pinned at lock time"],
    contracts: ["NORMALIZATION_COMPLETE event schema", "CanonicalDataset lock contract", "READY signal specification"],
    adoFeatures: ["DCT-201: Normalization Pipeline", "DCT-202: Canonical Dataset Creation", "DCT-203: Cross-LOB Taxonomy"],
  },
  {
    id: "AAP-03",
    name: "AI Tax Mapping Pattern",
    batch: "Batch 4",
    status: "Draft",
    agents: ["AI Orchestrator", "Mapping Agent", "Evidence Agent"],
    invariants: ["Confidence score range: 0.0–1.0", "Evidence required for all proposals", "Proposals immutable after TDC acceptance"],
    contracts: ["TaxMappingProposal schema v1.0", "Confidence band thresholds", "Evidence payload specification"],
    adoFeatures: ["DCT-401: AI Mapping Engine", "DCT-402: Confidence Scoring", "DCT-403: Evidence Generation"],
  },
  {
    id: "AAP-04",
    name: "Practitioner Review Pattern",
    batch: "Batch 6",
    status: "Draft",
    agents: ["Review Agent", "Audit Agent"],
    invariants: ["Adjustment requires practitioner ID", "Original value preserved in audit trail", "Approval required before TaxDecision persisted"],
    contracts: ["AdjustmentRecord schema", "Approval workflow contract", "Audit trail specification"],
    adoFeatures: ["DCT-601: Practitioner Adjustment UI", "DCT-602: Approval Workflow", "DCT-603: Audit Trail"],
  },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  "Approved":  { bg: "#dcfce7", text: "#166534", border: "#16a34a" },
  "In Review": { bg: "#fef9c3", text: "#854d0e", border: "#ca8a04" },
  "Draft":     { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" },
};

export default function AAPReviewPage() {
  const [expanded, setExpanded] = useState<string | null>("AAP-01");

  return (
    <div style={{ padding: "24px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#059669", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
            Blitzy
          </span>
          <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>
            Agentic Architecture Pattern Review
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          AAP Review Model
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Agentic Architecture Patterns reviewed and approved by Blitzy. Each pattern defines agents, invariants, contracts, and ADO feature alignment.
        </p>
      </div>

      {/* Pattern cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {AAP_PATTERNS.map(pattern => {
          const ss = STATUS_STYLE[pattern.status];
          const isOpen = expanded === pattern.id;
          return (
            <div key={pattern.id} style={{ border: `1px solid ${isOpen ? ss.border : "#e5e7eb"}`, borderRadius: "10px", overflow: "hidden" }}>
              {/* Header row */}
              <button
                onClick={() => setExpanded(isOpen ? null : pattern.id)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
                  backgroundColor: isOpen ? "#fafafa" : "white"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#9ca3af" }}>{pattern.id}</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{pattern.name}</span>
                  <span style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>{pattern.batch}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "4px", backgroundColor: ss.bg, color: ss.text }}>
                    {pattern.status}
                  </span>
                  <span style={{ color: "#9ca3af" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ padding: "0 16px 16px", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                    {/* Agents */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Agents</div>
                      {pattern.agents.map(a => (
                        <div key={a} style={{ fontSize: "12px", color: "#374151", padding: "4px 8px", backgroundColor: "#f5f3ff", borderRadius: "4px", marginBottom: "4px" }}>{a}</div>
                      ))}
                    </div>
                    {/* Invariants */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Invariants</div>
                      {pattern.invariants.map(inv => (
                        <div key={inv} style={{ fontSize: "11px", color: "#374151", padding: "4px 8px", backgroundColor: "#f0fdf4", borderRadius: "4px", marginBottom: "4px", borderLeft: "2px solid #059669" }}>{inv}</div>
                      ))}
                    </div>
                    {/* ADO Features */}
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>ADO Features</div>
                      {pattern.adoFeatures.map(f => (
                        <div key={f} style={{ fontSize: "11px", color: "#374151", padding: "4px 8px", backgroundColor: "#eff6ff", borderRadius: "4px", marginBottom: "4px" }}>{f}</div>
                      ))}
                    </div>
                  </div>
                  {/* Contracts */}
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Published Contracts</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {pattern.contracts.map(c => (
                        <span key={c} style={{ fontSize: "11px", color: "#92400e", padding: "3px 10px", backgroundColor: "#fef3c7", borderRadius: "4px", border: "1px solid #fcd34d" }}>{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
