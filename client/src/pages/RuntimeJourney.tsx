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
    id: "T4", label: "AI Agent Pipeline Execution", system: "AI Orchestrator", batch: "Batch 2 / 2A",
    layer: "Orchestration", layerColor: "#2563eb",
    desc: "The orchestrator runs a staged agent chain: File Recognizer → File Normalizer → Cross-LOB Mapper (Agent 3) → Tax Mapper. Agent 3 calls the Taxonomy Service to resolve FirmTaxonomyId for each normalized record before persisting to PDC. FirmTaxonomyId is REQUIRED on every FinancialFact record per Batch 2A. Agents are stateless and do not persist data directly.",
    inputs: ["DocumentId + file metadata", "Raw financial file content", "Taxonomy Service API (Agent 3 — Batch 2A)"],
    outputs: [
      "Normalized FinancialFact records (via PDC API)",
      "FirmTaxonomyId (GUID) per record — from Taxonomy Service · REQUIRED per Batch 2A",
      "ClassificationStatus per record (CLASSIFIED | UNCLASSIFIED | OVERRIDE) — Batch 2A",
      "Cross-LOB taxonomy mappings (via PDC API)",
      "Tax mapping proposals (via TDC API)",
    ],
    invariants: [
      "Agents are stateless — no direct DB writes",
      "All persistence via PDC/TDC APIs only",
      "Agent chain is sequential and deterministic",
      "⚠ Batch 2A Gap: Agent 3 not yet returning FirmTaxonomyId — blocking READY signal",
      "PDC rejects records with ClassificationStatus = UNCLASSIFIED after Batch 2A",
    ],
  },
  {
    id: "T5", label: "Canonical Dataset Persistence", system: "PDC", batch: "Batch 2 / 2A",
    layer: "PDC", layerColor: "#059669",
    desc: "Orchestrator writes normalized FinancialFact records to PDC via POST /api/pdc/records/canonical. Each record MUST include FirmTaxonomyId (GUID) and ClassificationStatus per Batch 2A. PDC validates these fields, assigns RunId (GUID) and SourceRecordId (GUID), and confirms READY state only when all records are CLASSIFIED. PDC becomes the authoritative cross-LOB financial system of record.",
    inputs: [
      "Normalized FinancialFact records from AI Orchestrator",
      "FirmTaxonomyId (GUID) per record — REQUIRED per Batch 2A",
      "ClassificationStatus per record — REQUIRED per Batch 2A",
      "Cross-LOB taxonomy mappings",
    ],
    outputs: [
      "RunId (GUID) — batch traceability key",
      "SourceRecordId (GUID) per record — globally unique",
      "IngestionJob status → READY (only if all records CLASSIFIED)",
      "FirmTaxonomyId stored on every FinancialFact record",
      "PDC becomes authoritative cross-LOB system of record",
    ],
    invariants: [
      "FinancialFact records are immutable once persisted",
      "SourceRecordId is globally unique",
      "READY status is terminal — no further updates to source records",
      "READY signal BLOCKED if any record has ClassificationStatus = UNCLASSIFIED (Batch 2A)",
      "FirmTaxonomyId must reference a valid Taxonomy Service entry (Batch 2A)",
    ],
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
    id: "T7", label: "Roger Primary Read Contract", system: "Roger Web App", batch: "Batch 4",
    layer: "Experience", layerColor: "#f97316",
    desc: "Roger retrieves tax mapping proposals and decisions via TDC primary read contract. Displays confidence bands (GREEN/YELLOW/RED), pending vs decided, and full traceability to source. Roger is a read-only consumer — this is the moment the platform comes to life for a practitioner.",
    inputs: ["EntityId + PeriodStart + PeriodEnd (practitioner selects client/period)", "TDC primary read contract response"],
    outputs: ["Tax mapping proposals with confidence bands (GREEN/YELLOW/RED)", "Pending vs decided distribution", "Full traceability to source file"],
    invariants: ["Roger has no write access to PDC or TDC in this touchpoint", "All data is read-only", "Confidence bands drive UI highlighting — not editable"],
  },
  {
    id: "T8", label: "Practitioner Review & Adjustment", system: "Roger Web App", batch: "Batch 6",
    layer: "Experience", layerColor: "#f97316",
    desc: "Review tasks generated automatically from data state. Practitioner creates, submits, approves, and locks book-to-tax adjustments. Sign-off is non-repudiable. Lock is terminal. Roger surfaces the full practitioner workflow end to end for the first time.",
    inputs: ["Review tasks generated from data state", "Book-to-tax adjustment inputs", "Practitioner sign-off"],
    outputs: ["Adjustment records (versioned, governed lifecycle)", "Entity review status: OPEN | IN_REVIEW | FINALIZED | AMENDED", "Non-repudiable sign-off record"],
    invariants: ["Adjustments are immutable once locked", "Sign-off is non-repudiable", "Lock is terminal — mutation attempts rejected and logged"],
  },
  {
    id: "T9", label: "Tax-Ready Record Derivation", system: "TDC", batch: "Batch 6",
    layer: "TDC", layerColor: "#dc2626",
    desc: "Tax-ready records derived deterministically from accepted mapping decisions and approved book-to-tax adjustments only. UNRESOLVED records persisted as first-class outputs where practitioner decision is still missing.",
    inputs: ["Accepted mapping decisions", "Approved book-to-tax adjustments"],
    outputs: ["TAX_READY records (deterministic derivation)", "UNRESOLVED records (where decision is missing)", "Derivation audit trail"],
    invariants: ["Tax-ready records are system-derived — never manually authored", "UNRESOLVED is a valid first-class output, not an error", "Derivation is deterministic and repeatable"],
  },
  {
    id: "T10", label: "TDC Finalization — TAX_READY / Lock", system: "TDC", batch: "Batch 6",
    layer: "TDC", layerColor: "#dc2626",
    desc: "Finalization requires non-repudiable sign-off. Lock is terminal — mutation attempts rejected and logged. Unlock transitions entity to AMENDED through a governed operation with recorded actor, reason, and timestamp.",
    inputs: ["Non-repudiable sign-off signal", "Finalized tax-ready records"],
    outputs: ["Locked immutable records", "Finalization state: FINALIZED", "Unlock audit record (if AMENDED)"],
    invariants: ["TAX_READY is terminal — no further updates once locked", "Locked records cannot be deleted", "All downstream systems consume locked TAX_READY records only"],
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
                  {selectedTp.outputs.map((out, i) => {
                    const isBatch2A = out.includes("FirmTaxonomyId") || out.includes("ClassificationStatus");
                    return (
                      <li key={i} style={{
                        fontSize: "12px",
                        color: isBatch2A ? "#6d28d9" : "#475569",
                        fontWeight: isBatch2A ? 600 : 400,
                        marginBottom: "6px",
                        paddingLeft: "14px",
                        position: "relative",
                        lineHeight: "1.4",
                        backgroundColor: isBatch2A ? "#f5f3ff" : "transparent",
                        borderRadius: isBatch2A ? "4px" : "0",
                        padding: isBatch2A ? "3px 8px 3px 18px" : undefined,
                      }}>
                        <span style={{ position: "absolute", left: isBatch2A ? 4 : 0, color: isBatch2A ? "#7c3aed" : "#059669" }}>←</span>
                        {out}
                        {isBatch2A && <span style={{ fontSize: "10px", marginLeft: "6px", backgroundColor: "#ede9fe", color: "#5b21b6", border: "1px solid #c4b5fd", borderRadius: "4px", padding: "1px 5px", fontWeight: 700 }}>Batch 2A</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Invariants</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {selectedTp.invariants.map((inv, i) => {
                    const isGap = inv.startsWith("⚠");
                    return (
                      <li key={i} style={{
                        fontSize: "12px",
                        color: isGap ? "#92400e" : "#475569",
                        fontWeight: isGap ? 600 : 400,
                        marginBottom: "6px",
                        paddingLeft: "14px",
                        position: "relative",
                        lineHeight: "1.4",
                        backgroundColor: isGap ? "#fffbeb" : "transparent",
                        borderRadius: isGap ? "4px" : "0",
                        padding: isGap ? "3px 8px 3px 18px" : undefined,
                      }}>
                        <span style={{ position: "absolute", left: isGap ? 4 : 0, color: isGap ? "#d97706" : "#dc2626" }}>{isGap ? "!" : "✕"}</span>
                        {inv}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
