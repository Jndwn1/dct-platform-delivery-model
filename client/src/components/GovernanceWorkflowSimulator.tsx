// GovernanceWorkflowSimulator.tsx
// Governance Workflow Simulator for Roger UI Data Point Mapping page
// Grounded in Jun 5, 2026 meeting context: Known Mappings defect, Book/Reclass gap, Gateway scope

import { useState } from "react";

// ─── Simulator Data ───────────────────────────────────────────────────────────

const SIM_STEPS = [
  {
    id: 1,
    label: "Roger Story Tagged",
    system: "Roger UI",
    color: "#7c3aed",
    description: "Practitioner opens a tax return in Roger. Roger reads from TDC (vFinalTaxReady) and PDC (vNormalizedTb) via the Gateway (Ocelot). All reads are governed contracts.",
    govCheck: "Read-only contract verified. Gateway ARB-7 in progress.",
    status: "governed",
    note: "Roger has zero write access to PDC or TDC. All data is consumed via GET endpoints only.",
  },
  {
    id: 2,
    label: "Known Mapping Lookup",
    system: "TDC",
    color: "#059669",
    description: "Roger requests known mappings for reuse. TDC API queries prior approved MappingDecisions. DEFECT: Gary's API only queries the newest TaxReadyRecord, missing LOCKED records from prior runs.",
    govCheck: "DEFECT ACTIVE — ADO defect logged. Known mapping reuse is incomplete.",
    status: "defect",
    note: "Impact: Practitioners may re-map accounts that were already approved in prior runs, creating duplicate work and governance risk.",
  },
  {
    id: 3,
    label: "Book/Reclass Adjustment",
    system: "TDC",
    color: "#d97706",
    description: "Practitioner submits a Book/Reclass adjustment from Roger UI. Roger calls TDC adjustment endpoint. GAP: TDC update endpoint is missing — Roger cannot persist the save.",
    govCheck: "GAP — TDC update endpoint not implemented. Roger save fails silently.",
    status: "gap",
    note: "Impact: Practitioners believe adjustments are saved. They are not. This is a silent data loss risk. Nasar confirmed this gap on Jun 5, 2026.",
  },
  {
    id: 4,
    label: "AI Mapping Proposal",
    system: "Orchestrator → TDC",
    color: "#6366f1",
    description: "Orchestrator submits AI-generated mapping proposals to TDC. TDC stores ProposalId + confidence score. Proposals are immutable once submitted. FirmTaxonomyId must be present on all records.",
    govCheck: "WARNING — FirmTaxonomyId not returned by Orchestrator (ADO #1370843).",
    status: "warning",
    note: "Impact: Normalized records missing FirmTaxonomyId cannot be classified. Downstream TDC mapping is blocked.",
  },
  {
    id: 5,
    label: "Practitioner Decision",
    system: "TDC",
    color: "#059669",
    description: "Practitioner reviews AI proposal and approves or overrides. MappingDecision is written to TDC as an append-only record. No update or delete permitted. Immutable once submitted.",
    govCheck: "Append-only enforced. MappingDecision is immutable.",
    status: "governed",
    note: "Governance rule: MappingDecision, LineageEvent, FilingRecord are all append-only. Enforced at DB and API layer.",
  },
  {
    id: 6,
    label: "Tax-Ready Record Issued",
    system: "TDC",
    color: "#003865",
    description: "TDC issues TaxReadyRecordId once all mapping decisions are complete and entity is finalized. Roger reads via vFinalTaxReady. Gate 4 (Lineage Closure) requires this record.",
    govCheck: "Planned — Gate 4 not yet passed for most batches.",
    status: "planned",
    note: "Gate 4 requires: TaxReadyRecordId issued, lineage chain complete, all MappingDecisions immutable.",
  },
];

const OPEN_QUESTIONS = [
  { id: "Q1", question: "Who owns the Known Mappings defect fix?", owner: "Gary / TDC Team", priority: "High", status: "Active" },
  { id: "Q2", question: "When will the Book/Reclass update endpoint be delivered?", owner: "Nasar / TDC Team", priority: "High", status: "Active" },
  { id: "Q3", question: "Is the Gateway (Ocelot) scope confirmed for Batch 9?", owner: "Architecture Board", priority: "Medium", status: "Pending" },
  { id: "Q4", question: "Who resolves the FirmTaxonomyId gap (ADO #1370843)?", owner: "Orchestrator Team", priority: "High", status: "Active" },
  { id: "Q5", question: "What is the filing authority for consolidated returns?", owner: "TDC PO + Architecture", priority: "High", status: "Escalated" },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  governed: { bg: "#dcfce7", text: "#15803d", dot: "#16a34a" },
  defect:   { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
  gap:      { bg: "#fff7ed", text: "#9a3412", dot: "#ea580c" },
  warning:  { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
  planned:  { bg: "#f5f3ff", text: "#5b21b6", dot: "#7c3aed" },
};

const PRIORITY_STYLE: Record<string, { bg: string; text: string }> = {
  High:   { bg: "#fee2e2", text: "#991b1b" },
  Medium: { bg: "#fff7ed", text: "#9a3412" },
  Low:    { bg: "#dcfce7", text: "#15803d" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function GovernanceWorkflowSimulator() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "24px", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "#003865", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "white", fontWeight: 800, fontSize: "14px" }}>Governance Workflow Simulator</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", marginTop: "2px" }}>
            Roger → TDC → PDC integration flow · Grounded in Jun 5, 2026 meeting context
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>1 Defect</span>
          <span style={{ background: "#fff7ed", color: "#9a3412", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>1 Gap</span>
          <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px" }}>1 Warning</span>
          <button
            onClick={() => setShowQuestions(v => !v)}
            style={{ background: showQuestions ? "#fef9c3" : "rgba(255,255,255,0.15)", color: showQuestions ? "#854d0e" : "white", border: "none", borderRadius: "6px", padding: "5px 12px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}
          >
            {showQuestions ? "▲ Hide Open Questions" : "▼ Open Questions"}
          </button>
        </div>
      </div>

      {/* Open Questions Panel */}
      {showQuestions && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fde68a", padding: "14px 20px" }}>
          <div style={{ fontSize: "10px", fontWeight: 800, color: "#92400e", letterSpacing: "0.08em", marginBottom: "10px" }}>OPEN QUESTIONS — Jun 5, 2026 Meeting</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {OPEN_QUESTIONS.map(q => {
              const ps = PRIORITY_STYLE[q.priority] ?? PRIORITY_STYLE.Low;
              const statusColor = q.status === "Active" ? "#059669" : q.status === "Escalated" ? "#dc2626" : "#6b7280";
              return (
                <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", background: "white", border: "1px solid #fde68a", borderRadius: "6px" }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", minWidth: 28 }}>{q.id}</span>
                  <span style={{ fontSize: "12px", color: "#0f1623", flex: 1, fontWeight: 500 }}>{q.question}</span>
                  <span style={{ fontSize: "10px", color: "#64748b", minWidth: 120 }}>{q.owner}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: ps.bg, color: ps.text, whiteSpace: "nowrap" }}>{q.priority}</span>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: statusColor, whiteSpace: "nowrap" }}>{q.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div style={{ padding: "16px 20px", background: "white" }}>
        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
          Click any step to expand governance details. Steps with defects or gaps are highlighted.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {SIM_STEPS.map((step, idx) => {
            const ss = STATUS_STYLE[step.status] ?? STATUS_STYLE.planned;
            const isActive = activeStep === step.id;
            return (
              <div key={step.id}>
                {/* Step Row */}
                <div
                  onClick={() => setActiveStep(isActive ? null : step.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "10px 14px",
                    border: `1px solid ${isActive ? step.color : "#e2e8f0"}`,
                    borderRadius: isActive ? "8px 8px 0 0" : "8px",
                    background: step.status === "defect" ? "#fff5f5" : step.status === "gap" ? "#fffbeb" : step.status === "warning" ? "#fffde7" : "#f8fafc",
                    cursor: "pointer",
                  }}
                >
                  {/* Step number */}
                  <span style={{ width: 28, height: 28, borderRadius: "50%", background: step.color, color: "white", fontSize: "12px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {step.id}
                  </span>
                  {/* Label */}
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", flex: 1 }}>{step.label}</span>
                  {/* System */}
                  <span style={{ fontSize: "11px", color: "#64748b", minWidth: 140 }}>{step.system}</span>
                  {/* Status badge */}
                  <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: ss.bg, color: ss.text, display: "inline-flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block" }} />
                    {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                  </span>
                  <span style={{ color: "#9ca3af", fontSize: "12px" }}>{isActive ? "▲" : "▼"}</span>
                </div>

                {/* Expanded Detail */}
                {isActive && (
                  <div style={{ border: `1px solid ${step.color}`, borderTop: "none", borderRadius: "0 0 8px 8px", padding: "14px 16px", background: "white" }}>
                    <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", margin: "0 0 10px" }}>{step.description}</p>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200, background: ss.bg, border: `1px solid ${ss.dot}30`, borderRadius: "6px", padding: "10px 12px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: ss.text, marginBottom: "4px", letterSpacing: "0.06em" }}>GOVERNANCE CHECK</div>
                        <div style={{ fontSize: "12px", color: ss.text }}>{step.govCheck}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 200, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px 12px" }}>
                        <div style={{ fontSize: "10px", fontWeight: 800, color: "#374151", marginBottom: "4px", letterSpacing: "0.06em" }}>IMPACT NOTE</div>
                        <div style={{ fontSize: "12px", color: "#475569" }}>{step.note}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connector arrow between steps */}
                {idx < SIM_STEPS.length - 1 && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "3px 0" }}>
                    <span style={{ color: "#d1d5db", fontSize: "14px" }}>↓</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Executive Summary */}
        <div style={{ marginTop: "16px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "14px 16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1", letterSpacing: "0.07em", marginBottom: "8px" }}>EXECUTIVE SUMMARY — Governance Simulation</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { label: "Governed Steps", value: "2 of 6", color: "#15803d", bg: "#dcfce7" },
              { label: "Active Defects", value: "1 (Known Mappings)", color: "#991b1b", bg: "#fee2e2" },
              { label: "Active Gaps", value: "1 (Book/Reclass)", color: "#9a3412", bg: "#fff7ed" },
              { label: "Warnings", value: "1 (FirmTaxonomyId)", color: "#854d0e", bg: "#fef9c3" },
              { label: "Open Questions", value: `${OPEN_QUESTIONS.length} tracked`, color: "#1d4ed8", bg: "#eff6ff" },
              { label: "Gate 4 Status", value: "Blocked (B6, B7, B8)", color: "#5b21b6", bg: "#f5f3ff" },
            ].map(item => (
              <div key={item.label} style={{ background: item.bg, borderRadius: "6px", padding: "10px 12px" }}>
                <div style={{ fontSize: "16px", fontWeight: 800, color: item.color }}>{item.value}</div>
                <div style={{ fontSize: "10px", fontWeight: 600, color: item.color, opacity: 0.8, marginTop: "2px" }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
