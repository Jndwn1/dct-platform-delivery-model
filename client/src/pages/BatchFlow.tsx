// DCT BatchFlow — Interactive Delivery Platform
// Converts batches into executable backlog artifacts (Epics, Features, Stories)

import { useState } from "react";

const BATCH_OPTIONS = [
  { id: "foundation-core", label: "Foundation Core", status: "Active" },
  { id: "1", label: "Batch 1 — File Ingestion & Initial Storage", status: "Active" },
  { id: "2", label: "Batch 2 — Normalization & Cross-LOB Taxonomy", status: "Planned" },
  { id: "2a", label: "Batch 2A — Orchestrator Contract Enforcement & Classification", status: "Planned" },
  { id: "3", label: "Batch 3 — Tax Domain Authority & Tax Taxonomy", status: "Planned" },
  { id: "4", label: "Batch 4 — AI Tax Mapping & Explainability", status: "Planned" },
  { id: "5", label: "Batch 5 — Entity Identity & Structure", status: "Planned" },
  { id: "6", label: "Batch 6 — Practitioner Review, Adjustments & Lock", status: "Planned" },
  { id: "7", label: "Batch 7 — Client Tax Profile & Eligibility", status: "Planned" },
  { id: "8", label: "Batch 8 — Exceptions & Remediation", status: "Planned" },
  { id: "9", label: "Batch 9 — Roger Gateway & Governed Consumer Access Layer (PDC)", status: "Planned" },
  { id: "10", label: "Batch 10 — Return Assembly, Filing & Lineage Closure", status: "Done" },
  { id: "43", label: "Batch 43 — Practitioner Book & Reclass Adjustments (TDC)", status: "New" },
  { id: "11", label: "Batch 11 — Learning Governance & Model Evolution", status: "Committed" },
  { id: "42", label: "Batch 42 — Tax Rules Framework (TDC)", status: "MVP" },
  { id: "9a", label: "Batch 9A — Data Gateway (IMS, CDS, DUO)", status: "MVP" },
];


const BATCH_ARTIFACTS: Record<string, { epic: string; features: { label: string; stories: string[] }[] }> = {
  "2a": {
    epic: "Orchestrator Contract Enforcement & Classification — Enforce FirmTaxonomyId on every PDC record",
    features: [
      {
        label: "Classification Presence Enforcement",
        stories: [
          "As PDC, I validate that every Orchestrator response includes a non-null FirmTaxonomyId so that unclassified records are never persisted.",
          "As PDC, I reject the entire dataset when FirmTaxonomyId is missing so that partial acceptance never occurs.",
          "As PDC, I log every rejection with structured error details (RunId, EntityId, PeriodStart, PeriodEnd, reason) so that failures are auditable.",
        ],
      },
      {
        label: "Deterministic Validation",
        stories: [
          "As PDC, I apply deterministic validation rules so that the same input always produces the same outcome (accept or reject).",
          "As PDC, I store FirmTaxonomyId at the record level on every accepted normalized record so that classification is queryable per record with RunId lineage intact.",
          "As PDC, I expose a validation audit log endpoint so that every acceptance and rejection is traceable with structured context.",
        ],
      },
    ],
  },
  "1": {
    epic: "File Ingestion & Initial Storage — Establish Tax Portal as the single ingestion gate",
    features: [
      {
        label: "Tax Portal File Upload",
        stories: [
          "As a practitioner, I can upload a client financial file via the Tax Portal so that it enters the DCT platform for processing.",
          "As the system, I generate an immutable DocumentId (GUID) and JobId (GUID) upon file receipt so that the file is uniquely identified.",
          "As the system, I validate EntityId, PeriodStart, and PeriodEnd upon upload so that only valid client/period combinations are accepted.",
        ],
      },
      {
        label: "Service Bus Event Publication",
        stories: [
          "As the Tax Portal, I publish a NEW_FILE_EVENT to the file_ingestion_events Service Bus topic so that downstream systems are notified.",
          "As the system, I ensure NEW_FILE_EVENT includes DocumentId, JobId, EntityId, PeriodStart, PeriodEnd, and file metadata.",
        ],
      },
      {
        label: "PDC Ingestion Record Creation",
        stories: [
          "As PDC, I consume NEW_FILE_EVENT from the Service Bus (at-least-once delivery) so that I can create an IngestionJob and SourceFile record.",
          "As PDC, I implement idempotent event processing so that duplicate events produce no side effects.",
          "As PDC, I advance IngestionJob status from INGESTED through PROCESSING to READY or FAILED using an enum state machine.",
        ],
      },
    ],
  },
  "2": {
    epic: "Normalization & Cross-LOB Taxonomy — AI orchestration pipeline and PDC canonical dataset",
    features: [
      {
        label: "AI Orchestrator Integration",
        stories: [
          "As PDC, I invoke the AI Orchestrator exactly once per file when IngestionJob status advances to PROCESSING.",
          "As the AI Orchestrator, I sequence the agent chain: File Recognizer → File Normalizer → Cross-LOB Mapper → Tax Mapper.",
          "As the AI Orchestrator, I am stateless — all persistence occurs through PDC and TDC APIs, never direct DB writes.",
        ],
      },
      {
        label: "Canonical Dataset Persistence",
        stories: [
          "As the AI Orchestrator, I write normalized FinancialFact records to PDC via API so that PDC becomes the cross-LOB system of record.",
          "As PDC, I assign a RunId (GUID) and SourceRecordId (GUID) to each normalized record.",
          "As PDC, I advance IngestionJob to READY status once all FinancialFact records are persisted.",
        ],
      },
      {
        label: "PDC Read API",
        stories: [
          "As Roger, I can retrieve normalized FinancialFact records via GET /api/v1/financial-facts/{documentId}.",
          "As Roger, I can retrieve Cross-LOB taxonomy mappings via GET /api/v1/cross-lob-mappings/{documentId}.",
        ],
      },
    ],
  },
};

const TABS = ["Backlog Generation", "Roadmap", "Dependencies", "ADO Export"];

export default function BatchFlow() {
  const [activeTab, setActiveTab] = useState("Backlog Generation");
  const [selectedBatch, setSelectedBatch] = useState("1");

  const artifacts = BATCH_ARTIFACTS[selectedBatch];

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>DCT BatchFlow</h1>
          <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
            Interactive Delivery Platform
          </span>
        </div>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          Convert delivery batches into executable backlog artifacts. Generate Epics, Features, and Stories with Azure DevOps-ready acceptance criteria.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottomWidth: "1px", borderBottomColor: "#e2e8f0" }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", fontSize: "13px", fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "#2563eb" : "#64748b",
              borderBottomWidth: "2px",
              borderBottomColor: activeTab === tab ? "#2563eb" : "transparent",
              backgroundColor: "transparent", border: "none", cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Backlog Generation" && (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px" }}>
          {/* Batch selector */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Select Batch
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {BATCH_OPTIONS.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBatch(b.id)}
                  style={{
                    textAlign: "left", padding: "10px 14px", borderRadius: "8px", cursor: "pointer",
                    backgroundColor: selectedBatch === b.id ? "#eff6ff" : "white",
                    borderWidth: "1px",
                    borderColor: selectedBatch === b.id ? "#2563eb" : "#e2e8f0",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: selectedBatch === b.id ? "#1d4ed8" : "#1e293b", lineHeight: "1.3" }}>{b.label}</div>
                  <div style={{ fontSize: "10px", color: b.status === "Active" ? "#059669" : "#94a3b8", fontWeight: 600, marginTop: "2px" }}>{b.status}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Artifact output */}
          <div>
            {artifacts ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Epic */}
                <div style={{
                  backgroundColor: "#1e40af", borderRadius: "10px", padding: "16px 20px", color: "white"
                }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#93c5fd", marginBottom: "6px" }}>Epic</div>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>{artifacts.epic}</div>
                </div>

                {/* Features + Stories */}
                {artifacts.features.map((feature, fi) => (
                  <div key={fi} style={{ backgroundColor: "white", borderRadius: "10px", borderWidth: "1px", borderColor: "#e2e8f0", overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", borderBottomWidth: "1px", borderBottomColor: "#d1fae5" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#065f46", marginBottom: "2px" }}>Feature</div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#064e3b" }}>{feature.label}</div>
                    </div>
                    <div style={{ padding: "12px 16px" }}>
                      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", marginBottom: "8px" }}>User Stories</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {feature.stories.map((story, si) => (
                          <div key={si} style={{
                            padding: "10px 14px", borderRadius: "6px",
                            backgroundColor: "#f8fafc", borderWidth: "1px", borderColor: "#e2e8f0",
                            fontSize: "12px", color: "#475569", lineHeight: "1.5"
                          }}>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>Story {fi + 1}.{si + 1}:</span> {story}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Export button */}
                <div style={{ display: "flex", gap: "10px" }}>
                  <button style={{
                    padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                    backgroundColor: "#2563eb", color: "white", border: "none", cursor: "pointer"
                  }}>
                    Export to Azure DevOps
                  </button>
                  <button style={{
                    padding: "10px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                    backgroundColor: "white", color: "#475569", borderWidth: "1px", borderColor: "#e2e8f0", cursor: "pointer"
                  }}>
                    Copy as Markdown
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "40px", textAlign: "center", borderWidth: "1px", borderColor: "#e2e8f0" }}>
                <div style={{ fontSize: "14px", color: "#64748b" }}>Select a batch to generate backlog artifacts</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== "Backlog Generation" && (
        <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "40px", textAlign: "center", borderWidth: "1px", borderColor: "#e2e8f0" }}>
          <div style={{ fontSize: "14px", color: "#64748b" }}>{activeTab} — Coming in next batch</div>
        </div>
      )}
    </div>
  );
}
