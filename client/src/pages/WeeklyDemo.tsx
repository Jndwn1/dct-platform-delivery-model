// ─────────────────────────────────────────────────────────────────────────────
// Weekly Demo — Delivered Capabilities
// PROTECTION RULE: This screen must NOT be removed or overwritten by future prompts.
// Content updates only via batch selection. Layout and components are permanent.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useBatchStatus, deriveDemoReadiness, deriveGateStatus, type BatchKey } from "@/contexts/BatchStatusContext";

// ─── BATCH DATA ───────────────────────────────────────────────────────────────

const BATCH_DATA: Record<string, {
  name: string;
  gate: string;
  gateStatus: "Locked" | "In Progress" | "Pending";
  readiness: "ready" | "partial" | "blocked";
  available: string[];
  unavailable: string[];
  features: { id: string; label: string; status: "Complete" | "Dev" | "Blocked" }[];
  pdcState: { label: string; value: string; active: boolean }[];
  tdcState: { label: string; value: string; active: boolean }[];
}> = {
  "1": {
    name: "Batch 1 — File Ingestion & Initial Storage",
    gate: "Gate 1 — Schema Lock",
    gateStatus: "Locked",
    readiness: "ready",
    available: ["Tax Portal upload endpoint", "PDC IngestionJob creation", "DocumentId + JobId generation", "Service Bus NEW_FILE_EVENT", "PDC SourceFile storage"],
    unavailable: ["AI normalization (Batch 2)", "TDC tax mapping (Batch 3)", "Roger UI (Batch 5)"],
    features: [
      { id: "DCT-101", label: "Tax Portal file upload (any format)", status: "Complete" },
      { id: "DCT-102", label: "DocumentId + JobId generation (immutable)", status: "Complete" },
      { id: "DCT-103", label: "EntityId + Period validation", status: "Complete" },
      { id: "DCT-104", label: "NEW_FILE_EVENT → Service Bus", status: "Complete" },
      { id: "DCT-105", label: "PDC IngestionJob + SourceFile persistence", status: "Complete" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: INGESTED", active: true },
      { label: "SourceFile stored", value: "DocumentId assigned", active: true },
      { label: "Normalized records", value: "Not yet — Batch 2", active: false },
    ],
    tdcState: [
      { label: "Tax mappings", value: "Not yet — Batch 3", active: false },
      { label: "Adjustments", value: "Not yet — Batch 6", active: false },
      { label: "Tax-ready records", value: "Not yet — Batch 6", active: false },
    ],
  },
  "2": {
    name: "Batch 2 — Normalization & Cross-LOB Taxonomy",
    gate: "Gate 1 — Schema Lock",
    gateStatus: "In Progress",
    readiness: "partial",
    available: ["AI Orchestrator pipeline", "FinancialFact normalization", "Cross-LOB taxonomy mappings", "PDC canonical dataset", "RunId + SourceRecordId assignment"],
    unavailable: ["TDC tax mapping (Batch 3)", "Roger UI (Batch 5)", "Practitioner decisions (Batch 6)"],
    features: [
      { id: "DCT-201", label: "AI Orchestrator invocation (once per file)", status: "Complete" },
      { id: "DCT-202", label: "File Recognizer + Normalizer agents", status: "Complete" },
      { id: "DCT-203", label: "Cross-LOB Mapper agent", status: "Dev" },
      { id: "DCT-204", label: "PDC FinancialFact persistence (via API)", status: "Dev" },
      { id: "DCT-205", label: "GET /api/v1/financial-facts/{documentId}", status: "Dev" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: PROCESSING → READY", active: true },
      { label: "SourceFile stored", value: "DocumentId + RunId assigned", active: true },
      { label: "Normalized records", value: "1,842 FinancialFact records", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "Not yet — Batch 3", active: false },
      { label: "Adjustments", value: "Not yet — Batch 6", active: false },
      { label: "Tax-ready records", value: "Not yet — Batch 6", active: false },
    ],
  },
  "3": {
    name: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    gate: "Gate 2 — Invariant Lock",
    gateStatus: "In Progress",
    readiness: "partial",
    available: ["TDC tax mapping proposals", "Confidence bands (GREEN/YELLOW/RED)", "TdcRecordId assignment", "Lineage chain (DocumentId → SourceRecordId → TdcRecordId)", "TDC read API"],
    unavailable: ["Roger UI (Batch 5)", "Practitioner decisions (Batch 6)", "TAX_READY finalization (Batch 6)"],
    features: [
      { id: "DCT-301", label: "Tax Mapper agent (AI Orchestrator)", status: "Complete" },
      { id: "DCT-302", label: "TDC TaxMappingProposal persistence", status: "Complete" },
      { id: "DCT-303", label: "ConfidenceBand enum (GREEN/YELLOW/RED)", status: "Complete" },
      { id: "DCT-304", label: "TdcRecordId + lineage chain", status: "Dev" },
      { id: "DCT-305", label: "GET /api/v1/tdc/records/{documentId}", status: "Dev" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "1,842 FinancialFact records", active: true },
      { label: "Normalized records", value: "System of record — immutable", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "1,842 proposals · Avg 94.7% confidence", active: true },
      { label: "Adjustments", value: "Not yet — Batch 6", active: false },
      { label: "Tax-ready records", value: "Not yet — Batch 6", active: false },
    ],
  },
  "4": {
    name: "Batch 4 — AI Tax Mapping & Explainability",
    gate: "Gate 2 — Invariant Lock",
    gateStatus: "Pending",
    readiness: "partial",
    available: ["Structured evidence per mapping", "Confidence score details", "Reasoning chain", "Contributing factors", "Explainability API"],
    unavailable: ["Roger UI (Batch 5)", "Practitioner decisions (Batch 6)"],
    features: [
      { id: "DCT-401", label: "MappingEvidence + ReasoningChain model", status: "Dev" },
      { id: "DCT-402", label: "GET /api/v1/tdc/records/{id}/evidence", status: "Dev" },
      { id: "DCT-403", label: "GET /api/v1/tdc/records/{id}/confidence", status: "Blocked" },
      { id: "DCT-404", label: "ContributingFactor model", status: "Dev" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "1,842 FinancialFact records", active: true },
      { label: "Normalized records", value: "System of record — immutable", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "1,842 proposals + evidence chains", active: true },
      { label: "Adjustments", value: "Not yet — Batch 6", active: false },
      { label: "Tax-ready records", value: "Not yet — Batch 6", active: false },
    ],
  },
  "5": {
    name: "Batch 5 — Practitioner View in Roger",
    gate: "Gate 3 — Contract Publication",
    gateStatus: "Pending",
    readiness: "partial",
    available: ["Roger work item list", "Confidence band highlighting", "Lineage trace per record", "Full detail view (PDC + TDC aggregated)", "Roger read-only API"],
    unavailable: ["Practitioner decisions (Batch 6)", "TAX_READY finalization (Batch 6)"],
    features: [
      { id: "DCT-501", label: "Roger work item list (GET /api/v1/roger/workitems)", status: "Dev" },
      { id: "DCT-502", label: "Work item detail view (PDC + TDC aggregated)", status: "Dev" },
      { id: "DCT-503", label: "Confidence band highlighting (GREEN/YELLOW/RED)", status: "Dev" },
      { id: "DCT-504", label: "Lineage trace per record", status: "Blocked" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "1,842 FinancialFact records", active: true },
      { label: "Normalized records", value: "System of record — immutable", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "1,842 proposals surfaced in Roger", active: true },
      { label: "Adjustments", value: "Not yet — Batch 6", active: false },
      { label: "Tax-ready records", value: "Not yet — Batch 6", active: false },
    ],
  },
  "6": {
    name: "Batch 6 — Practitioner Review & Adjustment Workflow",
    gate: "Gate 3 — Contract Publication",
    gateStatus: "Pending",
    readiness: "partial",
    available: ["Practitioner decisions (ACCEPTED/OVERRIDDEN/REJECTED)", "Append-only decision audit trail", "PDC + TDC adjustment records", "TAX_READY finalization", "POST /api/v1/roger/decisions"],
    unavailable: ["Rollforward intelligence (Batch 7)", "Return assembly (Batch 8)"],
    features: [
      { id: "DCT-601", label: "POST /api/v1/roger/decisions (first write surface)", status: "Dev" },
      { id: "DCT-602", label: "MappingDecision append-only model", status: "Dev" },
      { id: "DCT-603", label: "PDC + TDC adjustment records", status: "Dev" },
      { id: "DCT-604", label: "TAX_READY finalization + lock", status: "Blocked" },
      { id: "DCT-605", label: "GET /api/v1/tdc/records/{documentId}/finalized", status: "Blocked" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "1,842 FinancialFact records", active: true },
      { label: "Normalized records", value: "Adjustments: append-only", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "1,798 ACCEPTED · 44 OVERRIDDEN", active: true },
      { label: "Adjustments", value: "44 adjustment records", active: true },
      { label: "Tax-ready records", value: "1,842 TAX_READY (locked)", active: true },
    ],
  },
  "7": {
    name: "Batch 7 — Rollforward & Prior Year Intelligence",
    gate: "Gate 4 — Lineage Closure",
    gateStatus: "Pending",
    readiness: "partial",
    available: ["Prior year comparison", "Rollforward intelligence", "Year-over-year delta detection"],
    unavailable: ["Return assembly (Batch 8)", "Learning governance (Batch 9)"],
    features: [
      { id: "DCT-701", label: "Prior year FinancialFact comparison", status: "Dev" },
      { id: "DCT-702", label: "Year-over-year delta model", status: "Dev" },
      { id: "DCT-703", label: "Rollforward intelligence agent", status: "Blocked" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "Current + prior year records", active: true },
      { label: "Normalized records", value: "Delta records identified", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "Prior year proposals loaded", active: true },
      { label: "Adjustments", value: "Rollforward adjustments pending", active: false },
      { label: "Tax-ready records", value: "Not yet finalized", active: false },
    ],
  },
  "8": {
    name: "Batch 8 — Return Assembly, Filing & Lineage Closure",
    gate: "Gate 4 — Lineage Closure",
    gateStatus: "Pending",
    readiness: "partial",
    available: ["Return assembly from TAX_READY records", "Filing package generation", "Full lineage closure"],
    unavailable: ["Learning governance (Batch 9)"],
    features: [
      { id: "DCT-801", label: "Return assembly from TAX_READY records", status: "Dev" },
      { id: "DCT-802", label: "Filing package generation", status: "Dev" },
      { id: "DCT-803", label: "Full lineage closure (DocumentId → TaxReturn)", status: "Blocked" },
    ],
    pdcState: [
      { label: "IngestionJob created", value: "Status: READY (locked)", active: true },
      { label: "SourceFile stored", value: "All records immutable", active: true },
      { label: "Normalized records", value: "Full lineage closed", active: true },
    ],
    tdcState: [
      { label: "Tax mappings", value: "All TAX_READY (locked)", active: true },
      { label: "Adjustments", value: "All adjustments finalized", active: true },
      { label: "Tax-ready records", value: "Return assembled + filed", active: true },
    ],
  },
};

// ─── FLOW STEPS ───────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  {
    id: 1, label: "Ingestion", system: "Tax Portal → PDC", systemColor: "#7c3aed",
    what: "Client file enters via Tax Portal",
    dataObject: "DocumentId · JobId · EntityId",
    batchFrom: 1,
  },
  {
    id: 2, label: "PDC Processing", system: "PDC", systemColor: "#059669",
    what: "Jobs created, SourceFile stored",
    dataObject: "IngestionJob · SourceFile · RunId",
    batchFrom: 1,
  },
  {
    id: 3, label: "Contract Published", system: "PDC → Service Bus", systemColor: "#059669",
    what: "Canonical dataset locked, READY signal emitted",
    dataObject: "vNormalizedTb · SourceRecordId",
    batchFrom: 2,
  },
  {
    id: 4, label: "TDC Tax Mapping", system: "AI Orchestrator → TDC", systemColor: "#dc2626",
    what: "AI proposals written to TDC with confidence",
    dataObject: "TdcRecordId · ConfidenceBand · Evidence",
    batchFrom: 3,
  },
  {
    id: 5, label: "Outputs Available", system: "TDC", systemColor: "#dc2626",
    what: "TAX_READY records locked, lineage closed",
    dataObject: "TaxDecision · TAX_READY · Lineage",
    batchFrom: 6,
  },
];

// ─── STATUS COLORS ────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  Complete: { bg: "#f0fdf4", text: "#166534", dot: "#22c55e" },
  Dev: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  Blocked: { bg: "#fef2f2", text: "#991b1b", dot: "#ef4444" },
};

const GATE_STYLE: Record<string, { bg: string; text: string }> = {
  Locked: { bg: "#f1f5f9", text: "#475569" },
  "In Progress": { bg: "#fffbeb", text: "#92400e" },
  Pending: { bg: "#f8fafc", text: "#94a3b8" },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function WeeklyDemo() {
  const [selectedBatch, setSelectedBatch] = useState("1");
  const [audienceView, setAudienceView] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Global batch status — source of truth ──────────────────────────────────
  const { statuses } = useBatchStatus();
  const batchKey = selectedBatch as BatchKey;
  const globalStatus = statuses[batchKey] ?? "Planned";
  const gates = deriveGateStatus(statuses);

  // Override readiness and gate status from global context
  const batchDataRaw = BATCH_DATA[selectedBatch];
  const batch = {
    ...batchDataRaw,
    readiness: deriveDemoReadiness(globalStatus),
    gateStatus: (globalStatus === "Complete" ? "In Progress"
      : globalStatus === "Dev" ? "In Progress"
      : "Locked") as "Locked" | "In Progress" | "Pending",
    // Show features based on global status
    features: batchDataRaw?.features?.map(f => ({
      ...f,
      status: globalStatus === "Complete" ? "Complete" as const
        : globalStatus === "Dev" ? f.status
        : "Blocked" as const,
    })) ?? [],
  };
  const currentBatchNum = parseInt(selectedBatch);;

  // Determine step status based on selected batch
  const stepStatus = (step: typeof FLOW_STEPS[0]): "Active" | "Complete" | "Blocked" => {
    if (currentBatchNum >= step.batchFrom + 1) return "Complete";
    if (currentBatchNum >= step.batchFrom) return "Active";
    return "Blocked";
  };

  // Run Demo Simulation
  const runSimulation = () => {
    if (simRunning) {
      clearInterval(simRef.current!);
      setSimRunning(false);
      setSimStep(0);
      setActiveStep(null);
      return;
    }
    setSimRunning(true);
    setSimStep(0);
    setActiveStep(1);
    let step = 1;
    simRef.current = setInterval(() => {
      step++;
      if (step > FLOW_STEPS.length) {
        clearInterval(simRef.current!);
        setSimRunning(false);
        setActiveStep(null);
        setSimStep(FLOW_STEPS.length);
      } else {
        setActiveStep(step);
        setSimStep(step - 1);
      }
    }, 1400);
  };

  useEffect(() => () => { if (simRef.current) clearInterval(simRef.current); }, []);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "0" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        padding: "20px 28px 18px",
        borderBottomWidth: "1px", borderBottomColor: "#1e2a3a"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#60a5fa", marginBottom: "4px" }}>
              DCT Platform · Weekly Demo
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "white", marginBottom: "4px" }}>
              Weekly Demo — Delivered Capabilities
            </h1>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              Demonstrating platform separation: Financial Truth (PDC) vs Tax Judgment (TDC)
            </p>
          </div>

          {/* Audience / Speaker toggle */}
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "4px"
          }}>
            <button
              onClick={() => setAudienceView(false)}
              style={{
                padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none",
                backgroundColor: !audienceView ? "white" : "transparent",
                color: !audienceView ? "#0f172a" : "#94a3b8",
              }}
            >
              Speaker View
            </button>
            <button
              onClick={() => setAudienceView(true)}
              style={{
                padding: "5px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", border: "none",
                backgroundColor: audienceView ? "white" : "transparent",
                color: audienceView ? "#0f172a" : "#94a3b8",
              }}
            >
              Audience View
            </button>
          </div>
        </div>

        {/* ── DEMO CONTROLS ─────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
          <select
            value={selectedBatch}
            onChange={e => { setSelectedBatch(e.target.value); setSimStep(0); setActiveStep(null); setSimRunning(false); if (simRef.current) clearInterval(simRef.current); }}
            style={{
              padding: "7px 12px", borderRadius: "7px", fontSize: "12px", fontWeight: 600,
              backgroundColor: "rgba(255,255,255,0.1)", color: "white",
              borderWidth: "1px", borderColor: "rgba(255,255,255,0.2)", cursor: "pointer",
              appearance: "none", paddingRight: "28px"
            }}
          >
            {Object.entries(BATCH_DATA).map(([k, v]) => (
              <option key={k} value={k} style={{ backgroundColor: "#1e293b", color: "white" }}>
                {v.name}
              </option>
            ))}
          </select>

          <button
            onClick={runSimulation}
            style={{
              padding: "7px 18px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
              backgroundColor: simRunning ? "#dc2626" : "#2563eb",
              color: "white", border: "none",
              boxShadow: "0 2px 8px rgba(37,99,235,0.4)"
            }}
          >
            {simRunning ? "Stop Simulation" : "▶  Run Demo Simulation"}
          </button>

          <button
            style={{
              padding: "7px 18px", borderRadius: "7px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
              backgroundColor: "rgba(255,255,255,0.1)", color: "white",
              borderWidth: "1px", borderColor: "rgba(255,255,255,0.25)"
            }}
          >
            Run PI Demo
          </button>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* ── READINESS BANNER ────────────────────────────────────────────── */}
          <div style={{
            borderRadius: "10px", padding: "14px 18px",
            backgroundColor: batch.readiness === "ready" ? "#f0fdf4" : "#fffbeb",
            borderWidth: "1px",
            borderColor: batch.readiness === "ready" ? "#bbf7d0" : "#fde68a",
            display: "flex", alignItems: "flex-start", gap: "12px"
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
              backgroundColor: batch.readiness === "ready" ? "#22c55e" : "#f59e0b",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontSize: "16px", fontWeight: 700
            }}>
              {batch.readiness === "ready" ? "✓" : "!"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: batch.readiness === "ready" ? "#166534" : "#92400e", marginBottom: "6px" }}>
                {batch.readiness === "ready" ? "Ready to Demo" : "Partially Available — Some Capabilities Planned"}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Available</div>
                  {batch.available.map((a, i) => (
                    <div key={i} style={{ fontSize: "11px", color: "#166534", marginBottom: "2px" }}>✓ {a}</div>
                  ))}
                </div>
                {batch.unavailable.length > 0 && (
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Not Yet Available</div>
                    {batch.unavailable.map((u, i) => (
                      <div key={i} style={{ fontSize: "11px", color: "#92400e", marginBottom: "2px" }}>○ {u}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── VISUAL DEMO FLOW ─────────────────────────────────────────────── */}
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "18px 20px", borderWidth: "1px", borderColor: "#e2e8f0" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
              Platform Data Flow — Step by Step
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {FLOW_STEPS.map((step, idx) => {
                const status = stepStatus(step);
                const isSimActive = simRunning && activeStep === step.id;
                const isSimDone = simStep >= step.id;
                const isSelected = activeStep === step.id && !simRunning;

                const statusColors = {
                  Active: { bg: "#eff6ff", border: "#2563eb", dot: "#2563eb", text: "#1d4ed8" },
                  Complete: { bg: "#f0fdf4", border: "#22c55e", dot: "#22c55e", text: "#166534" },
                  Blocked: { bg: "#f8fafc", border: "#e2e8f0", dot: "#cbd5e1", text: "#94a3b8" },
                };
                const sc = statusColors[status];
                const highlight = isSimActive || isSimDone;

                return (
                  <div key={step.id} style={{ display: "flex", alignItems: "stretch", gap: "0" }}>
                    {/* Connector line */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "32px", flexShrink: 0 }}>
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                        backgroundColor: highlight ? sc.dot : (status === "Blocked" ? "#e2e8f0" : sc.dot),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontSize: "11px", fontWeight: 700,
                        boxShadow: isSimActive ? `0 0 0 4px ${sc.dot}30` : "none",
                        transition: "all 0.3s",
                        marginTop: "10px"
                      }}>
                        {isSimDone && !isSimActive ? "✓" : step.id}
                      </div>
                      {idx < FLOW_STEPS.length - 1 && (
                        <div style={{
                          width: "2px", flex: 1, minHeight: "20px",
                          backgroundColor: isSimDone ? sc.dot : "#e2e8f0",
                          transition: "background-color 0.3s"
                        }} />
                      )}
                    </div>

                    {/* Step card */}
                    <button
                      onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
                      style={{
                        flex: 1, textAlign: "left", margin: "6px 0 6px 10px",
                        padding: "12px 16px", borderRadius: "8px", cursor: "pointer",
                        backgroundColor: isSimActive ? sc.bg : (highlight ? sc.bg : (status === "Blocked" ? "#f8fafc" : "white")),
                        borderWidth: "1px",
                        borderColor: isSimActive ? sc.border : (highlight ? sc.border : "#e2e8f0"),
                        boxShadow: isSimActive ? `0 0 0 2px ${sc.dot}20` : "none",
                        transition: "all 0.3s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: status === "Blocked" ? "#94a3b8" : sc.text }}>
                            Step {step.id} — {step.label}
                          </span>
                          <span style={{
                            fontSize: "10px", padding: "1px 7px", borderRadius: "4px", fontWeight: 600,
                            backgroundColor: sc.bg, color: sc.text,
                            borderWidth: "1px", borderColor: sc.border
                          }}>
                            {status}
                          </span>
                        </div>
                        <span style={{
                          fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                          backgroundColor: step.systemColor + "15", color: step.systemColor, fontWeight: 600
                        }}>
                          {step.system}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: status === "Blocked" ? "#94a3b8" : "#475569" }}>
                        {step.what}
                      </div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px", fontFamily: "monospace" }}>
                        {step.dataObject}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── BACKEND VISIBILITY PANEL ─────────────────────────────────────── */}
          {!audienceView && (
            <div style={{ backgroundColor: "#0f172a", borderRadius: "10px", padding: "18px 20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
                Backend Visibility — What Leadership Cannot See
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* PDC */}
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px",
                    padding: "6px 10px", borderRadius: "6px", backgroundColor: "#059669" + "20"
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#059669" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>PDC — Financial System of Record</span>
                  </div>
                  {batch.pdcState.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px",
                      padding: "8px 10px", borderRadius: "6px",
                      backgroundColor: item.active ? "rgba(5,150,105,0.12)" : "rgba(255,255,255,0.04)"
                    }}>
                      <div style={{
                        width: "6px", height: "6px", borderRadius: "50%", marginTop: "3px", flexShrink: 0,
                        backgroundColor: item.active ? "#34d399" : "#334155"
                      }} />
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: item.active ? "#e2e8f0" : "#475569" }}>{item.label}</div>
                        <div style={{ fontSize: "10px", color: item.active ? "#94a3b8" : "#334155", fontFamily: "monospace" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* TDC */}
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px",
                    padding: "6px 10px", borderRadius: "6px", backgroundColor: "#dc2626" + "20"
                  }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#dc2626" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#f87171" }}>TDC — Tax System of Record</span>
                  </div>
                  {batch.tdcState.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px",
                      padding: "8px 10px", borderRadius: "6px",
                      backgroundColor: item.active ? "rgba(220,38,38,0.12)" : "rgba(255,255,255,0.04)"
                    }}>
                      <div style={{
                        width: "6px", height: "6px", borderRadius: "50%", marginTop: "3px", flexShrink: 0,
                        backgroundColor: item.active ? "#f87171" : "#334155"
                      }} />
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: item.active ? "#e2e8f0" : "#475569" }}>{item.label}</div>
                        <div style={{ fontSize: "10px", color: item.active ? "#94a3b8" : "#334155", fontFamily: "monospace" }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — Delivered in This Demo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Batch + Gate header */}
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "16px", borderWidth: "1px", borderColor: "#e2e8f0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Delivered in This Demo
            </div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "8px", lineHeight: "1.3" }}>
              {batch.name}
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
              backgroundColor: GATE_STYLE[batch.gateStatus].bg,
              color: GATE_STYLE[batch.gateStatus].text
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor", display: "inline-block" }} />
              {batch.gate} · {batch.gateStatus}
            </div>
          </div>

          {/* Features list */}
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "16px", borderWidth: "1px", borderColor: "#e2e8f0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Features (ADO)
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {batch.features.map((f) => {
                const ss = STATUS_STYLE[f.status];
                return (
                  <div key={f.id} style={{
                    padding: "9px 12px", borderRadius: "7px",
                    backgroundColor: ss.bg, borderWidth: "1px", borderColor: ss.bg
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: ss.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: "10px", fontWeight: 700, color: ss.text, fontFamily: "monospace" }}>{f.id}</span>
                      <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", fontWeight: 600, backgroundColor: "white", color: ss.text }}>
                        {f.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "#475569", paddingLeft: "12px", lineHeight: "1.4" }}>{f.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "16px", borderWidth: "1px", borderColor: "#e2e8f0" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Linked Artifacts
            </div>
            {[
              { label: "Batch Roadmap", path: "/batch-roadmap" },
              { label: "Gate Status", path: "/gate-status" },
              { label: "Architecture Diagram", path: "/architecture" },
              { label: "Lineage Explorer", path: "/lineage" },
            ].map(link => (
              <a
                key={link.path}
                href={link.path}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "7px 0", fontSize: "12px", color: "#2563eb", textDecoration: "none",
                  borderBottomWidth: "1px", borderBottomColor: "#f1f5f9"
                }}
              >
                {link.label}
                <span style={{ fontSize: "10px", color: "#94a3b8" }}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
