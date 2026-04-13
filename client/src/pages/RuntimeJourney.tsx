// Runtime Journey — T1–T10 System Interaction Map
// Matches reference: rsm-ai-team-niua6bzx.manus.space

import { useState, useCallback } from "react";

const TOUCHPOINTS = [
  {
    id: "T1", label: "File Ingestion via Tax Portal", system: "Tax Portal", batch: "Batch 1",
    layer: "Ingestion", layerColor: "#7c3aed",
    desc: "Client financial file enters via any entry point (Direct Upload, Roger Web App, Phoenix, or Duo/DSDMS). Tax Portal is the single ingestion gate. It generates an immutable DocumentId (GUID) and JobId (GUID), validates EntityId (GUID) + PeriodStart + PeriodEnd, and publishes a NEW_FILE_EVENT to the Service Bus topic: file_ingestion_events.",
    inputs: ["Client financial file (any format)", "EntityId (GUID)", "PeriodStart / PeriodEnd"],
    outputs: ["DocumentId (GUID) — immutable", "JobId (GUID)", "NEW_FILE_EVENT → Service Bus"],
    invariants: ["DocumentId is immutable once assigned", "EntityId must be a valid registered client", "PeriodStart < PeriodEnd"],
  },
  {
    id: "T2", label: "PDC Record Creation", system: "PDC", batch: "Batch 1",
    layer: "PDC", layerColor: "#059669",
    desc: "PDC Ingestion Listener consumes NEW_FILE_EVENT from topic file_ingestion_events (at-least-once delivery, replay supported). PDC persists IngestionJob and SourceFile. Status state machine: INGESTED → PROCESSING → READY | FAILED (enum-driven).",
    inputs: ["NEW_FILE_EVENT from Service Bus", "DocumentId, JobId, EntityId, PeriodStart, PeriodEnd"],
    outputs: ["IngestionJob record (INGESTED status)", "SourceFile record", "Status: INGESTED"],
    invariants: ["Idempotent — duplicate events produce no side effects", "Status transitions are enum-driven and irreversible", "SourceFile is immutable once created"],
  },
  {
    id: "T3", label: "AI Processing Trigger", system: "PDC → AI Orchestrator", batch: "Batch 2",
    layer: "Orchestration", layerColor: "#2563eb",
    desc: "PDC advances the IngestionJob status (enum) to PROCESSING and invokes the AI Orchestrator once per file with DocumentId, EntityId, PeriodStart, PeriodEnd, and metadata. The orchestrator sequences all AI stages and coordinates PDC and TDC via APIs.",
    inputs: ["IngestionJob (INGESTED status)", "DocumentId, EntityId, PeriodStart, PeriodEnd"],
    outputs: ["IngestionJob status → PROCESSING", "AI Orchestrator invocation (DocumentId + metadata)"],
    invariants: ["Orchestrator is invoked exactly once per file", "Status PROCESSING is irreversible", "Orchestrator is stateless — no direct DB access"],
  },
  {
    id: "T4", label: "AI Agent Pipeline Execution", system: "AI Orchestrator", batch: "Batch 2",
    layer: "Orchestration", layerColor: "#2563eb",
    desc: "The orchestrator runs a staged agent chain: File Recognizer → File Normalizer → Cross-LOB Mapper → Tax Mapper. Agents are stateless and do not persist data directly. All persistence occurs through PDC and TDC APIs.",
    inputs: ["DocumentId + file metadata", "Raw financial file content"],
    outputs: ["Normalized FinancialFact records (via PDC API)", "Cross-LOB taxonomy mappings (via PDC API)", "Tax mapping proposals (via TDC API)"],
    invariants: ["Agents are stateless — no direct DB writes", "All persistence via PDC/TDC APIs only", "Agent chain is sequential and deterministic"],
  },
  {
    id: "T5", label: "Canonical Dataset Persistence", system: "PDC", batch: "Batch 2",
    layer: "PDC", layerColor: "#059669",
    desc: "Orchestrator writes normalized FinancialFact records and Cross-LOB taxonomy mappings to PDC. PDC assigns RunId (GUID) and SourceRecordId (GUID), confirms READY state (enum), and becomes the authoritative cross-LOB data system of record.",
    inputs: ["Normalized FinancialFact records from AI Orchestrator", "Cross-LOB taxonomy mappings"],
    outputs: ["RunId (GUID)", "SourceRecordId (GUID) per record", "IngestionJob status → READY", "PDC becomes system of record"],
    invariants: ["FinancialFact records are immutable once persisted", "SourceRecordId is globally unique", "READY status is terminal — no further updates to source records"],
  },
  {
    id: "T6", label: "Tax Record Creation in TDC", system: "TDC", batch: "Batch 3",
    layer: "TDC", layerColor: "#dc2626",
    desc: "Orchestrator writes tax mapping proposals to TDC, including confidence scores (GREEN/YELLOW/RED enum band) and structured evidence. TDC assigns TdcRecordId (GUID) and preserves lineage (DocumentId → SourceRecordId → TdcRecordId).",
    inputs: ["Tax mapping proposals from AI Orchestrator", "Confidence scores and evidence", "SourceRecordId (from PDC)"],
    outputs: ["TdcRecordId (GUID)", "TaxMappingProposal with ConfidenceBand", "Lineage: DocumentId → SourceRecordId → TdcRecordId"],
    invariants: ["TdcRecordId is globally unique", "Lineage chain is immutable", "ConfidenceBand is enum: GREEN | YELLOW | RED"],
  },
  {
    id: "T7", label: "Practitioner View in Roger", system: "Roger Web App", batch: "Batch 5",
    layer: "Experience", layerColor: "#f97316",
    desc: "Roger retrieves tax-ready records from TDC using the read-only API. The UI displays cross-LOB classifications, tax proposals, confidence bands (GREEN/YELLOW/RED enum), and lineage for practitioner review. Roger is a read-only consumer — no writes to TDC or PDC.",
    inputs: ["EntityId + PeriodStart + PeriodEnd (practitioner selects client/period)", "TDC read-only API response"],
    outputs: ["Roger work item list (tax records requiring review)", "Confidence band highlighting (GREEN/YELLOW/RED)", "Lineage trace per record"],
    invariants: ["Roger has no write access to PDC or TDC in this batch", "All data is read-only", "Confidence bands drive UI highlighting — not editable"],
  },
  {
    id: "T8", label: "Practitioner Decision", system: "Roger Web App", batch: "Batch 6",
    layer: "Experience", layerColor: "#f97316",
    desc: "Practitioner reviews AI proposals and takes action: accept, override, or reject. Decisions are captured against TdcRecordId (GUID) as append-only MappingDecision records (never overwritten). Decision state enum: ACCEPTED | OVERRIDDEN | REJECTED.",
    inputs: ["TdcRecordId", "Practitioner decision: ACCEPTED | OVERRIDDEN | REJECTED", "Override value (if OVERRIDDEN)"],
    outputs: ["MappingDecision record (append-only)", "Decision state: ACCEPTED | OVERRIDDEN | REJECTED"],
    invariants: ["Decisions are append-only — never updated or deleted", "Each TdcRecordId can have multiple decisions (audit trail)", "OVERRIDDEN requires a new value"],
  },
  {
    id: "T9", label: "Adjustment Propagation", system: "DCT (PDC + TDC APIs)", batch: "Batch 6",
    layer: "Orchestration", layerColor: "#2563eb",
    desc: "Corrections propagate back to the appropriate system of record. Cross-LOB changes update PDC, tax classification changes update TDC, and combined changes update PDC first then TDC.",
    inputs: ["MappingDecision (OVERRIDDEN)", "New cross-LOB value (if PDC adjustment)", "New tax classification (if TDC adjustment)"],
    outputs: ["PDC adjustment record (cross-LOB correction)", "TDC adjustment record (tax classification correction)", "Updated lineage chain"],
    invariants: ["PDC adjustments never overwrite original records — append-only", "TDC adjustments never overwrite original records — append-only", "Lineage chain is extended, not modified"],
  },
  {
    id: "T10", label: "TDC Finalization — TAX_READY", system: "TDC", batch: "Batch 6",
    layer: "TDC", layerColor: "#dc2626",
    desc: "TDC assigns final record state (enum: REVIEW_REQUIRED | TAX_READY) and versions all tax decisions. Locked records are immutable — no updates or deletes ever. Final tax records become the authoritative system output for downstream consumption.",
    inputs: ["All MappingDecision records for a document", "Practitioner sign-off signal"],
    outputs: ["TaxDecision records (TAX_READY status)", "Immutable locked records", "Authoritative output for downstream filing"],
    invariants: ["TAX_READY is terminal — no further updates", "Locked records cannot be deleted", "All downstream systems consume TAX_READY records only"],
  },
];

const LAYERS = [
  { id: "Ingestion", label: "Tax Portal / Ingestion", color: "#7c3aed" },
  { id: "PDC", label: "PDC — Platform Data Core", color: "#059669" },
  { id: "Orchestration", label: "AI Orchestrator", color: "#2563eb" },
  { id: "TDC", label: "TDC — Tax Data Core", color: "#dc2626" },
  { id: "Experience", label: "Roger Web App", color: "#f97316" },
];

export default function RuntimeJourney() {
  const [selected, setSelected] = useState<string | null>("T1");

  const selectedTp = TOUCHPOINTS.find(tp => tp.id === selected);

  // Keyboard arrow-key navigation for the touchpoint list
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const ids = TOUCHPOINTS.map(tp => tp.id);
    const currentIdx = ids.indexOf(selected ?? "");
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = ids[Math.min(currentIdx + 1, ids.length - 1)];
      if (next) setSelected(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = ids[Math.max(currentIdx - 1, 0)];
      if (prev) setSelected(prev);
    }
  }, [selected]);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "4px" }}>
          Runtime Journey
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Runtime Data Journey — T1–T10</h1>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          How data flows through the platform at runtime. Touchpoints describe system behavior — they are not delivery tasks.
        </p>
      </div>

      {/* Layer legend */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        {LAYERS.map(l => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: "11px", color: "#64748b" }}>{l.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "16px" }}>
        {/* Left: touchpoint list — keyboard navigable: ↑/↓ to move selection */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "4px", outline: "none" }}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Touchpoint list — use arrow keys to navigate"
        >
          {TOUCHPOINTS.map((tp) => (
            <button
              key={tp.id}
              onClick={() => setSelected(tp.id)}
              style={{
                textAlign: "left", padding: "10px 14px", borderRadius: "8px", cursor: "pointer",
                backgroundColor: selected === tp.id ? "white" : "transparent",
                borderWidth: "1px",
                borderColor: selected === tp.id ? tp.layerColor : "transparent",
                boxShadow: selected === tp.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  backgroundColor: tp.layerColor, color: "white",
                  fontSize: "10px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {tp.id.replace("T", "")}
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", lineHeight: "1.3" }}>{tp.label}</span>
              </div>
              <div style={{ paddingLeft: "32px", display: "flex", gap: "6px" }}>
                <span style={{ fontSize: "10px", color: "#64748b" }}>{tp.system}</span>
                <span style={{ fontSize: "10px", color: tp.layerColor, fontWeight: 600 }}>{tp.batch}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        {selectedTp && (
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "24px", borderWidth: "1px", borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "50%",
                backgroundColor: selectedTp.layerColor, color: "white",
                fontSize: "16px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {selectedTp.id.replace("T", "")}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}>{selectedTp.id} — {selectedTp.label}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>{selectedTp.system}</span>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: selectedTp.layerColor }}>{selectedTp.batch}</span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>Layer: {selectedTp.layer}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "20px", paddingBottom: "20px", borderBottomWidth: "1px", borderBottomColor: "#f1f5f9" }}>
              {selectedTp.desc}
            </p>

            {/* Inputs / Outputs / Invariants */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Inputs</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {selectedTp.inputs.map((inp, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", paddingLeft: "14px", position: "relative", lineHeight: "1.4" }}>
                      <span style={{ position: "absolute", left: 0, color: "#2563eb" }}>→</span>
                      {inp}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Outputs</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {selectedTp.outputs.map((out, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", paddingLeft: "14px", position: "relative", lineHeight: "1.4" }}>
                      <span style={{ position: "absolute", left: 0, color: "#059669" }}>←</span>
                      {out}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Invariants</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {selectedTp.invariants.map((inv, i) => (
                    <li key={i} style={{ fontSize: "12px", color: "#475569", marginBottom: "6px", paddingLeft: "14px", position: "relative", lineHeight: "1.4" }}>
                      <span style={{ position: "absolute", left: 0, color: "#dc2626" }}>✕</span>
                      {inv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
