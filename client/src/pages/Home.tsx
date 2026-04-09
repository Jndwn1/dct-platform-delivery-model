// DCT Delivery Model — Main Page
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// 4 layers: Active Batch, Batch Gates, AI Agent Execution, Runtime Data Journey

import { useState } from "react";
import { useLocation } from "wouter";

const BATCHES = [
  { id: "foundation-core", label: "Foundation Core", status: "Active" },
  { id: "1", label: "Batch 1 — File Ingestion & Initial Storage", status: "Active" },
  { id: "2", label: "Batch 2 — Normalization & Cross-LOB Taxonomy", status: "Planned" },
  { id: "3", label: "Batch 3 — Tax Domain Authority & Tax Taxonomy", status: "Planned" },
  { id: "4", label: "Batch 4 — AI Tax Mapping & Explainability", status: "Planned" },
  { id: "5", label: "Batch 5 — Mapping Decisions & Governance", status: "Planned" },
  { id: "6", label: "Batch 6 — Practitioner Review & Adjustment Workflow", status: "Planned" },
  { id: "7", label: "Batch 7 — Rollforward & Prior Year Intelligence", status: "Planned" },
  { id: "8", label: "Batch 8 — Return Assembly, Filing & Lineage Closure", status: "Planned" },
  { id: "9", label: "Batch 9 — Learning Governance & Model Evolution", status: "Planned" },
];

const GATES = [
  {
    num: 1, label: "Schema Lock", status: "Locked", statusColor: "#475569",
    owner: "Enterprise Architect",
    desc: "Confirm that all entity schemas are complete, reviewed, and frozen before implementation begins.",
  },
  {
    num: 2, label: "Invariant Lock", status: "In Progress", statusColor: "#d97706",
    owner: "QA Lead / Tax Technology",
    desc: "Confirm that all system invariants (immutability, hash integrity, client isolation, atomic writes) have been tested adversarially and no violations exist.",
  },
  {
    num: 3, label: "Contract Publication", status: "Pending", statusColor: "#64748b",
    owner: "API Product Owner",
    desc: "Confirm that all API contracts (OpenAPI/Swagger) are published, versioned, and accepted by downstream consumers.",
  },
  {
    num: 4, label: "Lineage Closure", status: "Pending", statusColor: "#64748b",
    owner: "DCT Delivery Lead",
    desc: "Confirm that the full lineage chain is captured, queryable, and verified end-to-end before the Batch is marked complete.",
  },
];

const AGENTS = [
  {
    id: "A", label: "Architect Agent", role: "Enterprise Solution Architect", status: "Complete", statusColor: "#059669",
    tasks: [
      "Schema design for PDC identity model, TDC reference tables, lineage backbone",
      "Platform architecture validation (Azure SQL, Service Bus, AI Orchestrator)",
      "Architecture Decision Records (ADRs)",
    ],
    gates: { g1: "★", g2: "—", g3: "—", g4: "—" },
  },
  {
    id: "B", label: "Analyst Agent", role: "Senior Business Analyst", status: "Complete", statusColor: "#059669",
    tasks: [
      "Touchpoint requirements across all batches",
      "Batch scope definition and Epic/Feature breakdown",
      "User stories with Given/When/Then acceptance criteria",
    ],
    gates: { g1: "—", g2: "—", g3: "—", g4: "★" },
  },
  {
    id: "D", label: "Developer Agent", role: "Blitzy Code Generation", status: "In Progress", statusColor: "#d97706",
    tasks: [
      "Blitzy-generated .NET 8 implementation per batch",
      "API endpoint implementation and Swagger/OpenAPI contracts",
      "EF Core migration scripts and data models",
    ],
    gates: { g1: "—", g2: "—", g3: "★", g4: "—" },
  },
  {
    id: "Q", label: "QA Agent", role: "Adversarial Invariant Testing", status: "In Progress", statusColor: "#d97706",
    tasks: [
      "Adversarial invariant testing for all batch business rules",
      "Gate 2 — Invariant Lock verification",
      "Lineage chain end-to-end validation",
    ],
    gates: { g1: "—", g2: "★", g3: "—", g4: "✓" },
  },
];

const TOUCHPOINTS = [
  { id: "T1", label: "File Ingestion via Tax Portal", system: "Tax Portal", batch: "Batch 1",
    desc: "Client financial file enters via any entry point (Direct Upload, Roger Web App, Phoenix, or Duo/DSDMS). Tax Portal is the single ingestion gate. It generates an immutable DocumentId (GUID) and JobId (GUID), validates EntityId (GUID) + PeriodStart + PeriodEnd, and publishes a NEW_FILE_EVENT to the Service Bus topic: file_ingestion_events." },
  { id: "T2", label: "PDC Record Creation", system: "PDC", batch: "Batch 1",
    desc: "PDC Ingestion Listener consumes NEW_FILE_EVENT from topic file_ingestion_events (at-least-once delivery, replay supported). PDC persists IngestionJob and SourceFile. Status state machine: INGESTED → PROCESSING → READY | FAILED (enum-driven)." },
  { id: "T3", label: "AI Processing Trigger", system: "PDC → AI Orchestrator", batch: "Batch 2",
    desc: "PDC advances the IngestionJob status (enum) to PROCESSING and invokes the AI Orchestrator once per file with DocumentId, EntityId, PeriodStart, PeriodEnd, and metadata. The orchestrator sequences all AI stages and coordinates PDC and TDC via APIs." },
  { id: "T4", label: "AI Agent Pipeline Execution", system: "AI Orchestrator", batch: "Batch 2",
    desc: "The orchestrator runs a staged agent chain: File Recognizer → File Normalizer → Cross-LOB Mapper → Tax Mapper. Agents are stateless and do not persist data directly. All persistence occurs through PDC and TDC APIs." },
  { id: "T5", label: "Canonical Dataset Persistence", system: "PDC", batch: "Batch 2",
    desc: "Orchestrator writes normalized FinancialFact records and Cross-LOB taxonomy mappings to PDC. PDC assigns RunId (GUID) and SourceRecordId (GUID), confirms READY state (enum), and becomes the authoritative cross-LOB data system of record." },
  { id: "T6", label: "Tax Record Creation in TDC", system: "TDC", batch: "Batch 3",
    desc: "Orchestrator writes tax mapping proposals to TDC, including confidence scores (GREEN/YELLOW/RED enum band) and structured evidence. TDC assigns TdcRecordId (GUID) and preserves lineage (DocumentId → SourceRecordId → TdcRecordId)." },
  { id: "T7", label: "Practitioner View in Roger", system: "Roger Web App", batch: "Batch 5",
    desc: "Roger retrieves tax-ready records from TDC using the read-only API. The UI displays cross-LOB classifications, tax proposals, confidence bands (GREEN/YELLOW/RED enum), and lineage for practitioner review. Roger is a read-only consumer — no writes to TDC or PDC." },
  { id: "T8", label: "Practitioner Decision", system: "Roger Web App", batch: "Batch 6",
    desc: "Practitioner reviews AI proposals and takes action: accept, override, or reject. Decisions are captured against TdcRecordId (GUID) as append-only MappingDecision records (never overwritten). Decision state enum: ACCEPTED | OVERRIDDEN | REJECTED." },
  { id: "T9", label: "Adjustment Propagation", system: "DCT (PDC + TDC APIs)", batch: "Batch 6",
    desc: "Corrections propagate back to the appropriate system of record. Cross-LOB changes update PDC, tax classification changes update TDC, and combined changes update PDC first then TDC." },
  { id: "T10", label: "TDC Finalization — TAX_READY", system: "TDC", batch: "Batch 6",
    desc: "TDC assigns final record state (enum: REVIEW_REQUIRED | TAX_READY) and versions all tax decisions. Locked records are immutable — no updates or deletes ever. Final tax records become the authoritative system output for downstream consumption." },
];

const AGENT_COLORS: Record<string, string> = {
  A: "#6366f1", B: "#0ea5e9", D: "#f97316", Q: "#a855f7"
};

export default function Home() {
  const [, navigate] = useLocation();
  const [expandedGate, setExpandedGate] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "0" }}>

      {/* LAYER 1 — ACTIVE BATCH */}
      <section style={{ padding: "24px 28px 0" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "2px" }}>
            Layer 1 — Active Batch
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Batches control platform delivery scope and gate sequencing</div>
        </div>

        {/* Hero batch card */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
          borderRadius: "12px", padding: "28px 32px", color: "white", marginBottom: "0"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: "#10b981", padding: "2px 10px", borderRadius: "12px" }}>ACTIVE</span>
            <span style={{ fontSize: "12px", color: "#93c5fd" }}>DCT Data Consolidation Team</span>
          </div>
          <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.02em" }}>Foundation Core</h1>
          <p style={{ fontSize: "13px", color: "#93c5fd", marginBottom: "20px" }}>
            Full Roadmap: Foundation Core + Batch 1–10 · 11 Delivery Units
          </p>
          <p style={{ fontSize: "14px", color: "#bfdbfe", marginBottom: "24px" }}>
            Infrastructure setup: code repo, templates, Copilot Agent and Blitzy configuration, development environment.
          </p>

          {/* Batch list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {BATCHES.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                  backgroundColor: b.status === "Active" ? "#10b981" : "rgba(255,255,255,0.3)"
                }} />
                <span style={{ fontSize: "13px", color: b.status === "Active" ? "white" : "#93c5fd", flex: 1 }}>{b.label}</span>
                {b.status === "Planned" && (
                  <span style={{ fontSize: "10px", color: "#60a5fa" }}>Planned</span>
                )}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginTop: "24px" }}>
            {[
              { label: "Foundation", sub: "Touchpoints", sub2: "Foundation Core scope" },
              { label: "4", sub: "Gates", sub2: "1 locked · 1 in progress" },
              { label: "2", sub: "Agents", sub2: "Architect · Analyst · Developer · QA" },
              { label: "Active", sub: "Batch Status", sub2: "Batch 1–2 · 11-Batch Roadmap" },
            ].map((s, i) => (
              <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "14px 16px" }}>
                <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "2px" }}>{s.label}</div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.sub}</div>
                <div style={{ fontSize: "11px", color: "#bfdbfe", marginTop: "2px" }}>{s.sub2}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "20px", padding: "12px 0", flexWrap: "wrap" }}>
          {[
            { color: "#2563eb", label: "Batches control delivery" },
            { color: "#10b981", label: "Humans close Gates" },
            { color: "#a855f7", label: "Agents execute implementation" },
            { color: "#f97316", label: "Touchpoints describe runtime behavior" },
          ].map((l) => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: "11px", color: "#64748b" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* LAYER 2 — BATCH GATES */}
      <section style={{ padding: "24px 28px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "2px" }}>
            Layer 2 — Batch Gates
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Sequential quality gates — humans verify and close each gate before the next opens</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {GATES.map((gate) => (
            <button
              key={gate.num}
              onClick={() => setExpandedGate(expandedGate === gate.num ? null : gate.num)}
              style={{
                textAlign: "left", padding: "16px", borderRadius: "10px", cursor: "pointer",
                backgroundColor: "white", borderWidth: "1px",
                borderColor: expandedGate === gate.num ? "#2563eb" : "#e2e8f0",
                boxShadow: expandedGate === gate.num ? "0 0 0 2px #bfdbfe" : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.15s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#1e40af",
                  color: "white", fontSize: "12px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {gate.num}
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: gate.statusColor, color: "white"
                }}>
                  {gate.status}
                </span>
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>{gate.label}</div>
              <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{gate.desc}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px" }}>Owner: {gate.owner}</div>
            </button>
          ))}
        </div>

        {/* Gate sequence */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px", padding: "12px 16px",
          borderWidth: "1px", borderColor: "#e2e8f0",
          display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"
        }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b" }}>Gate Sequence</span>
          {GATES.map((g, i) => (
            <span key={g.num} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "11px", color: "#1e293b", fontWeight: 500 }}>
                {g.num} {g.label}
                <span style={{ marginLeft: "4px", fontSize: "10px", color: g.statusColor, fontWeight: 600 }}>{g.status}</span>
              </span>
              {i < GATES.length - 1 && <span style={{ color: "#94a3b8" }}>→</span>}
            </span>
          ))}
        </div>
      </section>

      {/* LAYER 3 — AI AGENT EXECUTION */}
      <section style={{ padding: "24px 28px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "2px" }}>
            Layer 3 — AI Agent Execution
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>Agents execute implementation — they support gates but do not close them</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "16px" }}>
          {AGENTS.map((agent) => (
            <div key={agent.id} style={{
              backgroundColor: "white", borderRadius: "10px", padding: "16px",
              borderWidth: "1px", borderColor: "#e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  backgroundColor: AGENT_COLORS[agent.id], color: "white",
                  fontSize: "14px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {agent.id}
                </div>
                <span style={{
                  fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                  backgroundColor: agent.statusColor, color: "white"
                }}>
                  {agent.status}
                </span>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "2px" }}>{agent.label}</div>
              <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>{agent.role}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {agent.tasks.map((t, i) => (
                  <li key={i} style={{ fontSize: "11px", color: "#475569", marginBottom: "4px", paddingLeft: "12px", position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: "#94a3b8" }}>·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Agent → Gate Support Matrix */}
        <div style={{ backgroundColor: "white", borderRadius: "10px", padding: "16px", borderWidth: "1px", borderColor: "#e2e8f0" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Agent → Gate Support Matrix
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 12px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0" }}>Agent</th>
                {GATES.map(g => (
                  <th key={g.num} style={{ textAlign: "center", padding: "6px 12px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0" }}>
                    Gate {g.num}<br /><span style={{ fontWeight: 400, fontSize: "10px" }}>{g.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((agent) => (
                <tr key={agent.id} style={{ borderBottomWidth: "1px", borderBottomColor: "#f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1e293b" }}>{agent.label}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", color: agent.gates.g1 === "★" ? "#2563eb" : "#94a3b8" }}>{agent.gates.g1}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", color: agent.gates.g2 === "★" ? "#2563eb" : "#94a3b8" }}>{agent.gates.g2}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", color: agent.gates.g3 === "★" ? "#2563eb" : "#94a3b8" }}>{agent.gates.g3}</td>
                  <td style={{ textAlign: "center", padding: "8px 12px", color: agent.gates.g4 === "★" ? "#2563eb" : agent.gates.g4 === "✓" ? "#10b981" : "#94a3b8" }}>{agent.gates.g4}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
            <span style={{ fontSize: "10px", color: "#64748b" }}>★ Gate owner (primary)</span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>✓ Gate supporter</span>
          </div>
        </div>
      </section>

      {/* LAYER 4 — RUNTIME DATA JOURNEY */}
      <section style={{ padding: "24px 28px 0" }}>
        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "2px" }}>
            Layer 4 — Runtime Data Journey
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>T1–T10 describe runtime system behavior — touchpoints are not delivery tasks</div>
        </div>

        {/* Active batch notice */}
        <div style={{
          backgroundColor: "#fef3c7", borderRadius: "8px", padding: "10px 14px",
          borderWidth: "1px", borderColor: "#fde68a", marginBottom: "16px",
          fontSize: "12px", color: "#92400e"
        }}>
          <strong>Batch -1 — Foundation Core</strong> covers touchpoints. Gold highlights indicate active batch scope.
        </div>

        {/* Touchpoint chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", overflowX: "auto", marginBottom: "16px", paddingBottom: "4px" }}>
          {TOUCHPOINTS.map((tp) => (
            <div key={tp.id} style={{
              flexShrink: 0, backgroundColor: "white", borderRadius: "8px",
              padding: "10px 14px", borderWidth: "1px", borderColor: "#e2e8f0",
              minWidth: "120px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)"
            }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#2563eb", marginBottom: "2px" }}>{tp.id}</div>
              <div style={{ fontSize: "11px", color: "#1e293b", fontWeight: 500, lineHeight: "1.3" }}>{tp.label}</div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{tp.system}</div>
            </div>
          ))}
        </div>

        {/* Touchpoint table */}
        <div style={{ backgroundColor: "white", borderRadius: "10px", borderWidth: "1px", borderColor: "#e2e8f0", overflow: "hidden", marginBottom: "24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0", width: "50px" }}>ID</th>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0", width: "200px" }}>Touchpoint</th>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0", width: "150px" }}>System</th>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0" }}>Description</th>
                <th style={{ textAlign: "left", padding: "10px 16px", color: "#64748b", fontWeight: 600, borderBottomWidth: "1px", borderBottomColor: "#e2e8f0", width: "80px" }}>Batch</th>
              </tr>
            </thead>
            <tbody>
              {TOUCHPOINTS.map((tp, i) => (
                <tr key={tp.id} style={{ borderBottomWidth: i < TOUCHPOINTS.length - 1 ? "1px" : "0", borderBottomColor: "#f1f5f9" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 700, color: "#2563eb" }}>{tp.id}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 600, color: "#1e293b" }}>{tp.label}</td>
                  <td style={{ padding: "10px 16px", color: "#475569" }}>{tp.system}</td>
                  <td style={{ padding: "10px 16px", color: "#475569", lineHeight: "1.5" }}>{tp.desc}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px",
                      backgroundColor: "#eff6ff", color: "#1d4ed8"
                    }}>
                      {tp.batch}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* DCT BatchFlow section */}
      <section style={{ padding: "0 28px 24px" }}>
        <div style={{
          backgroundColor: "white", borderRadius: "10px", padding: "20px 24px",
          borderWidth: "1px", borderColor: "#e2e8f0",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>DCT BatchFlow</span>
              <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: "10px", backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
                Interactive Delivery Platform
              </span>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
              Convert delivery batches into executable backlog artifacts. Generate Epics, Features, and Stories with Azure DevOps-ready acceptance criteria.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["Backlog Generation", "Roadmap", "Dependencies", "ADO Export"].map(tab => (
                <span key={tab} style={{ fontSize: "11px", color: "#64748b", padding: "3px 10px", borderRadius: "6px", backgroundColor: "#f1f5f9" }}>{tab}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => navigate("/batchflow")}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                backgroundColor: "#2563eb", color: "white", border: "none", cursor: "pointer"
              }}
            >
              Open BatchFlow →
            </button>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section style={{ padding: "0 28px 32px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", marginBottom: "12px" }}>
          DCT Delivery Model — Key Principles
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {[
            { title: "Batches control delivery", desc: "Each batch defines a bounded delivery scope with its own gates, agents, and touchpoints. Batches are sequential and non-overlapping." },
            { title: "Humans close Gates", desc: "Gates are verification checkpoints closed by human owners (Architect, QA Lead, API PO, DCT Lead). Agents support but do not close gates." },
            { title: "Agents execute implementation", desc: "AI agents produce artifacts (schemas, requirements, code, tests) that feed gate verification. They are the execution layer, not the governance layer." },
            { title: "Touchpoints describe runtime", desc: "Touchpoints (T1–T10) describe how data moves through the platform at runtime. They are not delivery tasks — they are the observable behavior the batch enables." },
          ].map((p) => (
            <div key={p.title} style={{
              backgroundColor: "white", borderRadius: "10px", padding: "16px",
              borderWidth: "1px", borderColor: "#e2e8f0"
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "6px" }}>{p.title}</div>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.5" }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
