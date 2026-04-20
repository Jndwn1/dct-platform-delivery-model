// DCT Platform — Governance Timeline
// Shows gate milestones, batch delivery dates, and governance checkpoints
import { useState } from "react";

const TIMELINE_EVENTS = [
  { date: "2024-Q4", label: "Foundation Core", type: "batch", status: "complete", description: "Infrastructure setup: code repo, templates, Copilot Agent and Blitzy configuration, development environment.", gate: null },
  { date: "2025-Q1", label: "Gate 1 — Schema Lock", type: "gate", status: "locked", description: "All PDC and TDC schemas locked. No structural changes permitted without gate re-approval.", gate: "G1" },
  { date: "2025-Q1", label: "Batch 1 — File Ingestion & Initial Storage", type: "batch", status: "complete", description: "Tax Portal ingestion gate, Service Bus event publication, PDC IngestionJob and SourceFile records. PI 1.", gate: null },
  { date: "2025-Q2", label: "Batch 2 — Normalization & Cross-LOB Taxonomy", type: "batch", status: "active", description: "PDC canonical financial taxonomy. Orchestrator normalizes files and returns classified records. Roger first governed read contract. PI 1.", gate: null },
  { date: "2025-Q2", label: "Gate 2 — Invariant Lock", type: "gate", status: "in-progress", description: "Business invariants locked. PDC authority boundary enforced. TDC read-only access confirmed.", gate: "G2" },
  { date: "2025-Q3", label: "Batch 3 — Tax Domain Authority & Tax Taxonomy", type: "batch", status: "planned", description: "TDC established as tax domain authority. Tax forms, return templates, mapping rules, and confidence thresholds. Runs parallel to Batch 2. PI 1.", gate: null },
  { date: "2025-Q3", label: "Batch 4 — AI Tax Mapping & Explainability", type: "batch", status: "planned", description: "Orchestrator delivers tax mapping proposals to TDC. Confidence bands, structured evidence, immutable decisions. Roger primary read contract. PI 2 — Committed.", gate: null },
  { date: "2025-Q3", label: "Gate 3 — Contract Publication", type: "gate", status: "pending", description: "Published API contracts between PDC and TDC. Versioned contract registry established.", gate: "G3" },
  { date: "2025-Q4", label: "Batch 5 — Entity Identity & Structure", type: "batch", status: "planned", description: "PDC authoritative entity registry. EntityId risk closed. CEM sync, entitlement mappings, DataSourceType tracking. Runs parallel to Batch 4. PI 2 — Committed.", gate: null },
  { date: "2025-Q4", label: "Batch 6 — Practitioner Review, Adjustments & Lock", type: "batch", status: "planned", description: "Governed practitioner workflow. Book-to-tax adjustments, tax-ready record derivation, non-repudiable sign-off, terminal lock. Sequential after Batch 4. PI 2 — Committed.", gate: null },
  { date: "2026-Q1", label: "Gate 4 — Lineage Closure", type: "gate", status: "pending", description: "Full lineage graph closed. Every tax decision traceable to source file.", gate: "G4" },
  { date: "2026-Q1", label: "Batch 7 — Client Tax Profile & Eligibility", type: "batch", status: "planned", description: "TDC system of record for tax profile and eligibility. Three-tier model (Must Have / Must Not Have / Flag & Review). Eligibility gate enforced. Sequential after Batch 6. PI 2 — Committed.", gate: null },
  { date: "2026-Q2", label: "Batch 8 — Exceptions & Remediation", type: "batch", status: "planned", description: "Structured exception tracking across ingestion, normalization, mapping, and workflow. PDC parallel to Batch 7; TDC sequential after Batch 7. PI 2 — Committed.", gate: null },
  { date: "2026-Q3", label: "Batch 9 — PDC IMS Integration & Prior Year Retrieval / TDC Rollforward", type: "batch", status: "planned", description: "PDC governed IMS integration (pull model). TDC rollforward proposals from prior year decisions. Flow: IMS → PDC → Orchestrator → TDC. PI 2 — Stretch.", gate: null },
  { date: "2026-Q3", label: "Batch 10 — Return Assembly, Filing & Lineage Closure", type: "batch", status: "planned", description: "TDC assembles returns from locked tax-ready records. Immutable filing record. IMS outbound contract. End-to-end lineage queryable. PI 2 — Stretch.", gate: null },
  { date: "2026-Q4", label: "Batch 11 — Learning Governance & Model Evolution", type: "batch", status: "planned", description: "AI feedback loop closed. Learning signals captured. Model registry with versioned approval workflow. Confidence trend analytics. PI 2 — Stretch.", gate: null },
];


const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  complete:    { bg: "#dcfce7", text: "#166534", dot: "#16a34a", label: "Complete" },
  active:      { bg: "#dbeafe", text: "#1e40af", dot: "#2563eb", label: "Active" },
  "in-progress": { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04", label: "In Progress" },
  locked:      { bg: "#d1fae5", text: "#065f46", dot: "#059669", label: "Locked" },
  pending:     { bg: "#f3f4f6", text: "#374151", dot: "#9ca3af", label: "Pending" },
  planned:     { bg: "#f3f4f6", text: "#374151", dot: "#d1d5db", label: "Planned" },
};

export default function GovernanceTimelinePage() {
  const [filter, setFilter] = useState<"all" | "gate" | "batch">("all");

  const filtered = TIMELINE_EVENTS.filter(e => filter === "all" || e.type === filter);

  return (
    <div style={{ padding: "24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#059669", backgroundColor: "#dcfce7", padding: "2px 8px", borderRadius: "4px" }}>
            Governance
          </span>
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Governance Timeline
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Gate milestones, batch delivery dates, and platform governance checkpoints across the full DCT roadmap.
        </p>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "28px" }}>
        {[
          { id: "all", label: "All Events" },
          { id: "gate", label: "Gates Only" },
          { id: "batch", label: "Batches Only" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as "all" | "gate" | "batch")}
            style={{
              padding: "6px 14px", fontSize: "12px", fontWeight: 600, borderRadius: "6px",
              border: `1px solid ${filter === f.id ? "#2563eb" : "#e5e7eb"}`,
              backgroundColor: filter === f.id ? "#eff6ff" : "white",
              color: filter === f.id ? "#2563eb" : "#374151",
              cursor: "pointer"
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: "32px" }}>
        {/* Vertical line */}
        <div style={{ position: "absolute", left: "11px", top: "8px", bottom: "8px", width: "2px", backgroundColor: "#e5e7eb" }} />

        {filtered.map((event, i) => {
          const sc = STATUS_CONFIG[event.status];
          const isGate = event.type === "gate";
          return (
            <div key={i} style={{ position: "relative", marginBottom: "24px" }}>
              {/* Dot */}
              <div style={{
                position: "absolute", left: "-26px", top: "4px",
                width: isGate ? "16px" : "12px", height: isGate ? "16px" : "12px",
                borderRadius: isGate ? "3px" : "50%",
                backgroundColor: sc.dot,
                border: isGate ? `2px solid ${sc.dot}` : "none",
                boxShadow: isGate ? `0 0 0 3px ${sc.dot}33` : "none",
                marginLeft: isGate ? "-2px" : "0"
              }} />

              {/* Card */}
              <div style={{
                border: `1px solid ${isGate ? sc.dot + "66" : "#e5e7eb"}`,
                borderRadius: "8px", padding: "12px 16px",
                backgroundColor: isGate ? sc.bg + "80" : "white",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isGate && event.gate && (
                      <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 6px", borderRadius: "3px", backgroundColor: sc.dot, color: "white" }}>
                        {event.gate}
                      </span>
                    )}
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{event.label}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>{event.date}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
