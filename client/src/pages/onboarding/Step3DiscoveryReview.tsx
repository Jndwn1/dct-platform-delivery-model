// Step3DiscoveryReview.tsx
// Discovery Hub Step 3 — Understand the DCT Solution
// Covers Platform Responsibilities, Architecture, System Ownership, Data Flow, Roger, TDC, GoSystem

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const TOPICS = [
  {
    id: "responsibilities",
    icon: "🏛️",
    title: "Platform Responsibilities",
    color: "#1e3a5f",
    content: [
      { label: "PDC — Phoenix Data Consolidation", desc: "Financial truth layer. Ingests, normalizes, and canonicalizes all financial data from ERP systems. PDC owns the source-of-truth financial record. It does NOT apply tax rules or make tax decisions." },
      { label: "TDC — Tax Data Consolidation (DCT)", desc: "Tax transformation platform. Applies tax rules, mappings, adjustments, and classifications to PDC financial data. TDC owns all tax decisions and business rules. PDC and TDC both fall under the DCT umbrella." },
      { label: "Orchestrator", desc: "Stateless AI execution engine. Coordinates multi-step tax workflows between PDC, TDC, and downstream systems. The Orchestrator does not own data or make tax decisions — it executes instructions." },
      { label: "Roger", desc: "Practitioner-facing read-only interface. Roger displays TDC outputs to tax practitioners. Roger does NOT save data, make decisions, or own business rules. It is a read-only consumer of TDC." },
      { label: "GoSystem", desc: "RSM's tax compliance system. Receives governed workpaper and provision data from TDC via the Gateway. GoSystem is a downstream consumer — it does not feed data back into DCT." },
    ],
  },
  {
    id: "architecture",
    icon: "🏗️",
    title: "DCT Architecture",
    color: "#065f46",
    content: [
      { label: "Batch Model", desc: "DCT delivers capabilities in architectural batches, not individual stories. Each batch represents a complete, deployable unit of platform capability with defined gate criteria." },
      { label: "Four Governance Gates", desc: "G1 Schema Lock → G2 Invariant Lock → G3 Contract Publication → G4 Lineage Closure. All four gates must pass before a batch is considered complete." },
      { label: "API-First Design", desc: "All inter-system communication uses published API contracts. No direct database access is permitted between systems. The Gateway (B9A) is the single entry point for all downstream consumers." },
      { label: "Immutable Decisions", desc: "TDC decisions are immutable once made. Corrections are captured as new override records, not edits. This ensures full auditability and lineage closure." },
      { label: "Agent-Assisted Execution", desc: "The Orchestrator uses AI agents to execute multi-step tax workflows. Agents are stateless and do not persist data — all state lives in TDC." },
    ],
  },
  {
    id: "ownership",
    icon: "🔑",
    title: "System Ownership",
    color: "#7c3aed",
    content: [
      { label: "PDC owns", desc: "Source financial records, normalization rules, canonical data model, ERP ingestion pipelines." },
      { label: "TDC owns", desc: "Tax decisions, business rules, classifications, adjustments, audit trail, lineage records, provision schedules." },
      { label: "Orchestrator owns", desc: "Workflow execution, agent coordination, retry logic. Does NOT own data or decisions." },
      { label: "Roger owns", desc: "Practitioner UI, read-only data display, override submission (which TDC then processes). Roger does NOT own the override decision — TDC does." },
      { label: "GoSystem owns", desc: "Tax compliance filing, workpaper storage, regulatory submission. GoSystem receives data from TDC — it does not send data back." },
    ],
  },
  {
    id: "dataflow",
    icon: "🔄",
    title: "Data Flow",
    color: "#b45309",
    content: [
      { label: "Step 1 — ERP → PDC", desc: "Financial data is ingested from ERP systems (SAP, Oracle, etc.) into PDC. PDC normalizes and canonicalizes the data into the DCT financial data model." },
      { label: "Step 2 — PDC → TDC", desc: "PDC publishes normalized financial records to TDC via the published API contract. TDC receives the data and applies tax rules, classifications, and adjustments." },
      { label: "Step 3 — TDC → Gateway", desc: "TDC makes classified, adjusted financial data available through the Gateway (B9A). All downstream consumers access data exclusively through the Gateway." },
      { label: "Step 4 — Gateway → Roger", desc: "Roger requests practitioner-scoped data from the Gateway. The Gateway returns only the data Roger's consumer profile allows. Roger displays it read-only." },
      { label: "Step 5 — Gateway → IMS → Return Engine", desc: "IMS (Integration & Management System) retrieves governed tax-ready data from TDC via the B9A Gateway. IMS translates the flat IRS-form payload into engine-specific format, performs roll-up and grouping, and routes to the correct return engine (GoSystem, CCH, OIT). DCT does not connect directly to any return engine." },
      { label: "Step 6 — Gateway → Provision/State", desc: "Provision and State teams access their scoped data (provision schedules, apportionment data) through the Gateway using their registered consumer profiles." },
    ],
  },
  {
    id: "roger",
    icon: "👤",
    title: "Roger",
    color: "#0369a1",
    content: [
      { label: "What Roger is", desc: "Roger is the practitioner-facing interface for the DCT platform. It allows tax practitioners to review TDC classifications, view workpapers, and submit overrides for TDC to process." },
      { label: "What Roger is NOT", desc: "Roger does NOT save data. Roger does NOT make tax decisions. Roger does NOT own business rules. Roger is a read-only consumer of TDC data." },
      { label: "Roger's data source", desc: "All data Roger displays comes from TDC via the Gateway. Roger has no direct database access." },
      { label: "Roger's override flow", desc: "When a practitioner submits an override in Roger, Roger sends the override request to TDC via the Gateway. TDC processes the override and updates its records. Roger then displays the updated TDC data." },
      { label: "Roger's APIs", desc: "Roger calls TDC APIs through the Gateway: GET /api/tdc/classifications, GET /api/tdc/workpaper, POST /api/tdc/override/submit, GET /api/audit/trail." },
    ],
  },
  {
    id: "tdc",
    icon: "⚙️",
    title: "TDC — Tax Data Consolidation",
    color: "#065f46",
    content: [
      { label: "TDC's role", desc: "TDC is the tax transformation engine within DCT. It receives normalized financial data from PDC and applies tax rules, classifications, adjustments, and mappings to produce governed tax outputs." },
      { label: "Known Mapping", desc: "Known Mapping is TDC's rule set for classifying financial records into tax categories. It maps PDC financial objects to TDC tax objects based on defined business rules." },
      { label: "TDC Business Objects", desc: "TDC owns: Tax Classification, Tax Adjustment, Provision Schedule, Audit Trail Record, Lineage Record, Override Justification, Known Mapping Rule, Tax Object." },
      { label: "TDC governance", desc: "TDC decisions are immutable. All changes are captured as new records. The four governance gates (G1–G4) must pass before any batch is complete." },
      { label: "TDC and Provision", desc: "Provision schedules are computed by TDC from classified financial records. Provision teams access this data through the Gateway using their registered consumer profile." },
    ],
  },
  {
    id: "gosystem",
    icon: "↔️",
    title: "IMS — Integration & Management System",
    color: "#7c3aed",
    content: [
      { label: "IMS's role", desc: "IMS is the integration broker between DCT/TDC and all downstream return engines (GoSystem, CCH, OIT). DCT does not connect directly to any return engine. IMS retrieves governed tax-ready data from TDC via the B9A Gateway, translates the flat IRS-form payload, and routes it to the correct return engine." },
      { label: "What IMS owns", desc: "IMS owns: IRS line translation (formLineCode → engine field), roll-up of per-record lines to per-form-line totals, engine-specific grouping and worksheet structure, data-copy where engine requires same value in multiple fields, engine routing and return instance selection, per-line feedback using returnLineId." },
      { label: "What IMS does NOT own", desc: "IMS does NOT perform tax-semantic calculations. IMS does NOT compute governed tax values. Tax calculations and governed values remain the responsibility of TDC." },
      { label: "The dividing test", desc: "Does the operation depend on the target engine's input format? If yes → IMS. If it is the same for every engine because it is defined by the IRS form or tax law → TDC." },
      { label: "Provision and State", desc: "IMS receives governed provision and state tax data from TDC and routes it to the appropriate return engine for return preparation and filing. GoSystem, CCH, or OIT receive the engine-shaped payload from IMS." },
    ],
  },
];

export default function Step3DiscoveryReview() {
  const [, navigate] = useLocation();
  const [activeTopic, setActiveTopic] = useState("responsibilities");
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  const topic = TOPICS.find(t => t.id === activeTopic)!;
  const allReviewed = TOPICS.every(t => reviewed.has(t.id));

  function handleTopicClick(id: string) {
    setActiveTopic(id);
    setReviewed(prev => new Set(Array.from(prev).concat(id)));
  }

  function handleContinue() {
    markStepComplete("step3-discovery-center");
    navigate("/onboarding/step4");
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Provision &amp; State Discovery Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 3 — Understand the DCT Solution</span>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 8px" }}>
        🧭 Understand the DCT Solution
      </h1>
      <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px", lineHeight: "1.6" }}>
        Review platform responsibilities, system ownership, architecture, data flow, Roger, TDC, GoSystem, and integration responsibilities.
        The objective is to understand where each capability exists within the DCT ecosystem before defining new requirements.
        Topics reviewed: <strong>{reviewed.size} / {TOPICS.length}</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px" }}>

        {/* Topic nav */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {TOPICS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTopicClick(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", borderRadius: "8px", border: "none",
                cursor: "pointer", textAlign: "left",
                backgroundColor: activeTopic === t.id ? t.color : reviewed.has(t.id) ? "#f0fdf4" : "#f8fafc",
                color: activeTopic === t.id ? "white" : "#0f1623",
                borderLeft: reviewed.has(t.id) && activeTopic !== t.id ? "3px solid #059669" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: "16px" }}>{t.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: 600 }}>{t.title}</span>
              {reviewed.has(t.id) && activeTopic !== t.id && (
                <span style={{ marginLeft: "auto", fontSize: "12px", color: "#059669" }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Topic content */}
        <div style={{
          backgroundColor: "white", border: `1.5px solid ${topic.color}30`,
          borderRadius: "12px", padding: "20px 24px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "24px" }}>{topic.icon}</span>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", margin: 0 }}>{topic.title}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {topic.content.map((item, i) => (
              <div key={i} style={{
                padding: "12px 16px", backgroundColor: `${topic.color}06`,
                border: `1px solid ${topic.color}20`, borderRadius: "8px",
                borderLeft: `3px solid ${topic.color}`,
              }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: topic.color, marginBottom: "4px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress and continue */}
      <div style={{
        marginTop: "24px", padding: "16px 20px",
        backgroundColor: allReviewed ? "#f0fdf4" : "#f8fafc",
        border: `1px solid ${allReviewed ? "#86efac" : "#e2e8f0"}`,
        borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: "13px", color: allReviewed ? "#065f46" : "#64748b" }}>
          {allReviewed
            ? "✓ All 7 topics reviewed — you are ready to proceed to the Data Flow Simulation."
            : `Review all 7 topics to unlock Step 4. ${TOPICS.length - reviewed.size} remaining.`}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/onboarding/step2")}
            style={{
              fontSize: "13px", fontWeight: 600, color: "#64748b",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
            }}
          >
            ← Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!allReviewed}
            style={{
              fontSize: "13px", fontWeight: 700, color: "white",
              backgroundColor: allReviewed ? "#059669" : "#94a3b8",
              border: "none", borderRadius: "7px", padding: "9px 20px",
              cursor: allReviewed ? "pointer" : "not-allowed",
            }}
          >
            ✓ Continue to Step 4 — Data Flow Simulation →
          </button>
        </div>
      </div>
    </div>
  );
}
