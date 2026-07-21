// DiscoveryWorkspace.tsx
// Provision & State Discovery Workspace
// Single-page interactive architecture workspace for BA requirements discovery
// Replaces the multi-step onboarding wizard entirely

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  navy:    "#0f1623",
  blue:    "#1e3a5f",
  green:   "#065f46",
  purple:  "#7c3aed",
  amber:   "#b45309",
  teal:    "#0369a1",
  rose:    "#be185d",
  slate:   "#475569",
  b9a:     "#1e3a5f",
  b16:     "#065f46",
  b28:     "#7c3aed",
};

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          backgroundColor: C.navy, color: "#10b981",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", fontWeight: 800, flexShrink: 0,
        }}>{number}</div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: C.navy, margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "12px", color: C.slate, margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ height: "2px", backgroundColor: "#e2e8f0", marginTop: "14px" }} />
    </div>
  );
}

// ─── SECTION 1: Workstream Overview ──────────────────────────────────────────
function WorkstreamOverview() {
  return (
    <section id="s1" style={{ marginBottom: "48px" }}>
      <SectionHeading number="1" title="Workstream Overview" subtitle="Understand the State and Provision workstreams before reviewing DCT capabilities." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* STATE */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: C.teal, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🗺️</span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>State Workstream</div>
                <div style={{ fontSize: "11px", color: "#bae6fd" }}>State Income Tax Compliance & Reporting</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 20px" }}>
            {[
              { label: "What is it?", text: "The State workstream manages state income tax compliance and reporting across all jurisdictions where RSM clients operate. It ensures that state-specific tax data is accurately computed, classified, and delivered to practitioners and downstream systems." },
              { label: "Business Objectives", text: "Ensure accurate state tax data is available for practitioner review, state return preparation, and regulatory compliance. Reduce manual effort in state apportionment and classification." },
              { label: "Primary Business Functions", items: ["Apply state tax rules and classifications", "Compute state apportionment factors", "Prepare state tax returns and disclosures", "Ensure compliance with state regulations", "Provide complete audit trail for regulatory review"] },
              { label: "Downstream Consumers", items: ["Roger (practitioner review)", "IMS (routes governed data to return engines)", "State filing teams", "Regulatory reporting"] },
              { label: "Business Outcomes", text: "Accurate, auditable state tax data available through governed APIs. Reduced manual intervention in state compliance workflows." },
            ].map(({ label, text, items }) => (
              <div key={label} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
                {text && <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{text}</p>}
                {items && <ul style={{ margin: "0", paddingLeft: "16px" }}>{items.map(i => <li key={i} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{i}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>

        {/* PROVISION */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: C.purple, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>📊</span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>Provision Workstream</div>
                <div style={{ fontSize: "11px", color: "#e9d5ff" }}>Tax Provision Computation & Reporting</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 20px" }}>
            {[
              { label: "What is it?", text: "The Provision workstream manages tax provision computation and financial reporting. It computes current and deferred tax positions, prepares provision schedules, and delivers structured outputs to practitioners and financial reporting systems. Governed provision data is handed off to IMS, which routes it to the appropriate return engine." },
              { label: "Business Objectives", text: "Deliver accurate, auditable tax provision data for financial reporting. Support interim and annual provision cycles. Ensure traceability from source financial data to final provision output." },
              { label: "Primary Business Functions", items: ["Compute current and deferred tax positions", "Manage uncertain tax positions and reserves", "Prepare provision schedules and workpapers", "Support financial statement reporting", "Require accurate, traceable data and supporting evidence"] },
              { label: "Downstream Consumers", items: ["Roger (provision review)", "IMS (routes governed provision data to return engines)", "Provision teams", "Financial reporting and audit"] },
              { label: "Business Outcomes", text: "Structured, governed provision schedules and workpapers delivered through DCT APIs. Full lineage from ERP source data to final provision output." },
            ].map(({ label, text, items }) => (
              <div key={label} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
                {text && <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{text}</p>}
                {items && <ul style={{ margin: "0", paddingLeft: "16px" }}>{items.map(i => <li key={i} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{i}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2: Responsibility Matrix ────────────────────────────────────────
const RESP_ROWS = [
  { row: "Business Rules",  state: "State tax rules, apportionment formulas", provision: "Provision computation rules, deferred tax logic", dct: "TDC owns all tax rule execution", roger: "Displays rule outputs (read-only)", ims: "Routes governed outputs to return engines" },
  { row: "Data Ownership",  state: "State-scoped tax data", provision: "Provision-scoped financial data", dct: "PDC owns source financial records; TDC owns tax records", roger: "No data ownership — read-only consumer", ims: "No data ownership — integration broker only" },
  { row: "User Experience", state: "State practitioners via Roger", provision: "Provision practitioners via Roger", dct: "No direct UX — API provider", roger: "Primary practitioner interface", ims: "No direct UX — engine routing layer" },
  { row: "Persistence",     state: "TDC persists state decisions", provision: "TDC persists provision schedules", dct: "TDC is system of record for all tax decisions", roger: "Does NOT persist data", ims: "Does NOT persist tax data — broker only" },
  { row: "Audit",           state: "Full audit trail via Batch 16", provision: "Full audit trail via Batch 16", dct: "TDC maintains immutable audit records", roger: "Displays audit trail (read-only)", ims: "Receives audit exports for delivery" },
  { row: "Reporting",       state: "State return data via Gateway (B9A)", provision: "Provision schedule data via Gateway (B9A)", dct: "Provides governed API access via B9A", roger: "Renders reports for practitioners", ims: "Routes governed data to return engines for filing" },
  { row: "Tax Returns",     state: "State returns prepared by practitioners", provision: "Not applicable (provision ≠ filing)", dct: "Provides data; does not file", roger: "Supports review before filing", ims: "Routes to GoSystem / CCH / OIT for return execution" },
  { row: "APIs",            state: "Consumes B9A Gateway APIs", provision: "Consumes B9A Gateway APIs", dct: "Publishes all APIs via B9A Gateway", roger: "Calls TDC read APIs via Gateway", ims: "Inbound retrieval, outbound delivery, engine lookup APIs" },
  { row: "Workpapers",      state: "State workpapers via Batch 28", provision: "Provision workpapers via Batch 28", dct: "Batch 28 generates structured workpapers", roger: "Displays workpapers for review", ims: "Receives workpaper payload for engine delivery" },
  { row: "Lineage",         state: "Full lineage via Batch 16", provision: "Full lineage via Batch 16", dct: "TDC enforces lineage closure (G4)", roger: "Displays lineage (read-only)", ims: "Receives lineage evidence with payload" },
];

function ResponsibilityMatrix() {
  const cols = [
    { key: "state",     label: "State",     color: C.teal },
    { key: "provision", label: "Provision", color: C.purple },
    { key: "dct",       label: "DCT / TDC", color: C.blue },
    { key: "roger",     label: "Roger",     color: "#0891b2" },
    { key: "ims",       label: "IMS",       color: C.rose },
  ];

  return (
    <section id="s2" style={{ marginBottom: "48px" }}>
      <SectionHeading number="2" title="Workstream Responsibilities" subtitle="Who owns what across State, Provision, DCT, Roger, and IMS (Integration & Management System)." />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "110px" }}>Responsibility</th>
              {cols.map(c => (
                <th key={c.key} style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "160px" }}>
                  <span style={{ display: "inline-block", backgroundColor: c.color, borderRadius: "4px", padding: "2px 8px", fontSize: "11px" }}>{c.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESP_ROWS.map((r, i) => (
              <tr key={r.row} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: C.navy, verticalAlign: "top" }}>{r.row}</td>
                {cols.map(c => (
                  <td key={c.key} style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top", lineHeight: "1.5" }}>
                    {r[c.key as keyof typeof r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── NEW SECTION 3: Discovery Workflow ──────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    number: "1",
    title: "Define the Business Need",
    icon: "🎯",
    color: "#0369a1",
    purpose: "Describe the business capability from the practitioner's perspective.",
    guidance: "Start by clearly articulating what the business needs to accomplish — not how the platform should implement it. Focus on the practitioner's goal.",
    examples: [
      "State Apportionment",
      "State Taxable Income",
      "State Adjustments",
      "Provision Schedules",
      "Workpapers",
      "Audit Evidence",
      "Lineage",
    ],
    note: null,
  },
  {
    number: "2",
    title: "Assess the Current State",
    icon: "🔍",
    color: "#065f46",
    purpose: "Understand how the business capability works today before defining future-state requirements.",
    guidance: "Discovery begins with evaluating the existing business process and platform capabilities. Do not define new requirements until you understand what already exists.",
    examples: [
      "Current business process",
      "Existing systems involved",
      "Current user workflow",
      "Existing platform capabilities",
      "Current pain points",
      "Existing data sources",
      "Existing integrations",
    ],
    note: "Current-state assessment should identify existing capabilities before proposing new functionality.",
  },
  {
    number: "3",
    title: "Review Existing DCT Capabilities",
    icon: "📋",
    color: "#1e3a5f",
    purpose: "Use this Discovery Center and Ask Buddy to determine whether DCT already supports the requested capability.",
    guidance: "Before documenting any requirement, verify whether DCT already delivers it. Check the Existing DCT Capabilities section and use Ask Buddy to search the knowledge base.",
    examples: [
      "Does DCT already support this capability?",
      "Which Batch delivers it?",
      "Which APIs already exist?",
      "Which data model already exists?",
      "Which business objects already support this capability?",
      "Can the capability be reused?",
      "Is this already on the roadmap?",
    ],
    note: "If an existing capability satisfies the business need, reference that capability rather than creating a new requirement.",
  },
  {
    number: "4",
    title: "Classify the Gap",
    icon: "⚖️",
    color: "#b45309",
    purpose: "Determine whether the business need is Covered, Partially Covered, or Net-New.",
    guidance: "Use the three-tier classification to determine the correct action. Only document requirements for the true gap — not for capabilities that already exist.",
    examples: [],
    note: null,
  },
  {
    number: "5",
    title: "Document Business Requirements",
    icon: "📝",
    color: "#7c3aed",
    purpose: "Only document requirements for the identified business gap.",
    guidance: "Requirements define WHAT the business needs. They do not include API design, database design, architecture, or implementation approach. DCT determines HOW the platform implements the solution.",
    examples: [
      "Business purpose",
      "User actions",
      "Functional behavior",
      "Business rules",
      "Validation rules",
      "Exception handling",
      "Expected outcomes",
    ],
    note: null,
  },
  {
    number: "6",
    title: "DCT Platform Assessment",
    icon: "🏗️",
    color: "#be185d",
    purpose: "Once business discovery is complete, DCT performs platform and technical assessment.",
    guidance: "DCT validates platform alignment using the completed business discovery artifacts. This step is DCT-owned and occurs after the BA has completed Steps 1–5.",
    examples: [
      "Platform Capability Assessment",
      "Technical Gap Analysis",
      "Architecture Assessment",
      "Technical Solution Assessment",
      "Implementation Planning",
    ],
    note: "DCT validates platform alignment using the completed business discovery artifacts.",
  },
];

const GAP_CLASSIFICATIONS = [
  {
    label: "Covered",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    definition: "Existing DCT capability satisfies the business need.",
    action: "Reuse the capability.",
    icon: "✓",
  },
  {
    label: "Partially Covered",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    definition: "Existing capability requires enhancement.",
    action: "Document only the enhancement.",
    icon: "~",
  },
  {
    label: "Net-New",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    definition: "No existing platform capability exists.",
    action: "Document the new business requirement.",
    icon: "!",
  },
];

function DiscoveryWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="s-workflow" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="↓"
        title="Discovery Workflow"
        subtitle="Follow this process before documenting new requirements or creating implementation work."
      />

      {/* Workflow step cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px" }}>
        {WORKFLOW_STEPS.map((step, idx) => (
          <div
            key={step.number}
            onClick={() => setActiveStep(activeStep === idx ? null : idx)}
            style={{
              backgroundColor: "white",
              border: `2px solid ${activeStep === idx ? step.color : "#e2e8f0"}`,
              borderRadius: "10px",
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.15s",
              borderLeft: `4px solid ${step.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "6px",
                backgroundColor: step.color, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, flexShrink: 0,
              }}>{step.number}</div>
              <span style={{ fontSize: "14px" }}>{step.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", lineHeight: "1.3" }}>{step.title}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{step.purpose}</p>
            {activeStep === idx && (
              <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <p style={{ fontSize: "12px", color: "#334155", margin: "0 0 10px", lineHeight: "1.6" }}>{step.guidance}</p>
                {step.examples.length > 0 && (
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
                      {step.number === "3" ? "Checklist" : step.number === "5" ? "Requirements Include" : step.number === "6" ? "DCT Performs" : "Examples"}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      {step.examples.map(e => (
                        <li key={e} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.note && (
                  <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "8px 12px" }}>
                    <p style={{ fontSize: "11px", color: "#065f46", margin: 0, lineHeight: "1.5" }}>💡 {step.note}</p>
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: "8px", fontSize: "10px", color: "#94a3b8", textAlign: "right" }}>
              {activeStep === idx ? "▲ collapse" : "▼ expand"}
            </div>
          </div>
        ))}
      </div>

      {/* Step 4 Gap Classification Table */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#b45309", padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⚖️</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>Step 4 — Gap Classification</div>
              <div style={{ fontSize: "11px", color: "#fde68a" }}>Use this decision table to classify the gap before documenting requirements.</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
          {GAP_CLASSIFICATIONS.map((g, i) => (
            <div key={g.label} style={{
              backgroundColor: g.bg,
              border: `1px solid ${g.border}`,
              borderTop: "none",
              borderLeft: i === 0 ? "none" : `1px solid ${g.border}`,
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  backgroundColor: g.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 800, flexShrink: 0,
                }}>{g.icon}</div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: g.color }}>{g.label}</span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Definition</div>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{g.definition}</p>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Action</div>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0, fontWeight: 600, lineHeight: "1.5" }}>{g.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 5 BA vs DCT ownership callout */}
      <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>📝 Step 5 — BA vs. DCT Ownership</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "6px" }}>✅ Requirements INCLUDE</div>
            {["Business purpose", "User actions", "Functional behavior", "Business rules", "Validation rules", "Exception handling", "Expected outcomes"].map(i => (
              <div key={i} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.7" }}>• {i}</div>
            ))}
          </div>
          <div style={{ backgroundColor: "white", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", marginBottom: "6px" }}>🚫 Requirements do NOT include</div>
            {["API design", "Database design", "Architecture", "Implementation approach", "Technical solution"].map(i => (
              <div key={i} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.7" }}>• {i}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "12px", backgroundColor: "#7c3aed", borderRadius: "8px", padding: "10px 16px" }}>
          <p style={{ fontSize: "13px", color: "white", margin: 0, fontWeight: 600, lineHeight: "1.5" }}>
            💡 The Business Analyst defines <strong>WHAT</strong> the business needs. DCT determines <strong>HOW</strong> the platform implements the solution.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3: Existing DCT Capabilities ────────────────────────────────────
const BATCHES = [
  {
    id: "B9A",
    name: "Gateway & Governed Consumer Access Layer",
    color: C.b9a,
    icon: "🔐",
    businessPurpose: "Provides a secure, governed API gateway that controls how all downstream consumers (Roger, IMS, Provision, State) access TDC data. B9A is the single entry point for all data consumption outside TDC.",
    businessProblem: "Without a governed gateway, downstream systems would require direct database access to TDC, creating uncontrolled data exposure, no consumer scoping, and no audit trail for data access.",
    capabilities: [
      "Consumer-scoped API access — each consumer (Roger, IMS, State, Provision) receives only the data their profile allows",
      "Governed read-only access to all TDC financial and tax records",
      "Authentication and authorization for all downstream API calls",
      "Rate limiting, logging, and access audit trail",
      "Single versioned API contract for all consumers",
    ],
    scope: "Covers all downstream read access to TDC. Does NOT include write operations — all writes go directly to TDC.",
    businessObjects: ["ConsumerProfile", "AccessToken", "DataScope", "APIContract", "AuditLog"],
    apis: [
      "GET /api/v1/gateway/tax-profiles/{entityId}",
      "GET /api/v1/gateway/provision/schedules/{period}",
      "GET /api/v1/gateway/state/apportionment/{jurisdiction}",
      "GET /api/v1/gateway/workpapers/{entityId}",
      "GET /api/v1/gateway/audit-trail/{entityId}",
    ],
    dependencies: ["TDC (source of all data)", "B3 (Tax Domain Authority)", "B16 (Audit Trail)"],
    supportsState: "Provides State teams with governed API access to state apportionment data, state tax classifications, and state filing data. State consumers are scoped to state-relevant records only. IMS receives the governed state payload for routing to the appropriate return engine.",
    supportsProvision: "Provides Provision teams with governed API access to provision schedules, deferred tax data, and uncertain tax positions. Provision consumers are scoped to provision-relevant records only. IMS receives the governed provision payload for routing to the appropriate return engine.",
  },
  {
    id: "B16",
    name: "Audit Trail & Lineage Governance",
    color: C.b16,
    icon: "📋",
    businessPurpose: "Establishes a complete, immutable audit trail for all TDC decisions and data transformations. Ensures every tax decision can be traced from source financial data through to final output, supporting regulatory review and internal audit.",
    businessProblem: "Tax decisions require full traceability for regulatory compliance and audit readiness. Without a governed audit trail, practitioners cannot demonstrate how a tax position was reached, creating regulatory risk.",
    capabilities: [
      "Immutable audit records for every TDC decision (create, update, override)",
      "Full lineage chain from ERP source data through PDC normalization to TDC tax decision",
      "Decision history with timestamps, actor, and justification",
      "Lineage closure verification (G4 Gate requirement)",
      "Audit export for regulatory review and IMS delivery",
    ],
    scope: "Covers all TDC state changes and decisions. Lineage records are append-only and cannot be modified.",
    businessObjects: ["AuditRecord", "LineageChain", "DecisionHistory", "OverrideRecord", "LineageClosure"],
    apis: [
      "GET /api/v1/audit/decisions/{entityId}",
      "GET /api/v1/audit/lineage/{entityId}",
      "GET /api/v1/audit/history/{decisionId}",
      "POST /api/v1/audit/lineage-closure/{batchId}",
      "GET /api/v1/audit/export/{entityId}",
    ],
    dependencies: ["TDC (source of decisions)", "B3 (Tax Domain Authority)", "B9A (Gateway for audit access)"],
    supportsState: "Provides complete audit trail for all state tax decisions, including state apportionment computations, state classifications, and state override history. Supports regulatory review of state positions.",
    supportsProvision: "Provides complete audit trail for all provision decisions, including provision schedule computations, deferred tax adjustments, and uncertain tax position changes. Supports financial statement audit requirements.",
  },
  {
    id: "B28",
    name: "Provision Reference Data & BTP Outbound Contract",
    color: C.b28,
    icon: "📄",
    businessPurpose: "Batch 28 publishes TDC provision reference data to downstream consumers and hands off the BTPProvisionOutbound contract to BTP. It delivers classification reference data (DTAClassification, DTLClassification, ETRCategory, ValuationAllowanceCriterion) scoped by EntityTypeCode, plus DTA/DTL reconciliation, ETR recon, and return-to-provision data via the BTPProvisionOutbound contract.",
    businessProblem: "Downstream consumers and BTP need governed, structured provision reference data from TDC — specifically classification outputs and reconciliation data — delivered through a versioned contract. Without B28, there is no governed handoff of TDC provision reference data to BTP or downstream consumers.",
    capabilities: [
      "Publishes DTAClassification reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes DTLClassification reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes ETRCategory reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes ValuationAllowanceCriterion reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "BTPProvisionOutbound contract: DTA/DTL reconciliation data to BTP",
      "BTPProvisionOutbound contract: ETR reconciliation data to BTP",
      "BTPProvisionOutbound contract: Return-to-provision data to BTP",
    ],
    scope: "B28 delivers TDC provision reference data and the BTPProvisionOutbound contract only. It does NOT perform provision computation, recognition/measurement rules, UTP analysis, period mismatch resolution, consolidation, acquisition accounting, or disclosure classification. The actual provision work is owned by the Provision team and BTP.",
    businessObjects: ["DTAClassification", "DTLClassification", "ETRCategory", "ValuationAllowanceCriterion", "BTPProvisionOutbound"],
    apis: [
      "GET /api/v1/provision/reference/dta-classification/{entityTypeCode}",
      "GET /api/v1/provision/reference/dtl-classification/{entityTypeCode}",
      "GET /api/v1/provision/reference/etr-category/{entityTypeCode}",
      "GET /api/v1/provision/reference/valuation-allowance/{entityTypeCode}",
      "POST /api/v1/provision/outbound/btp/{entityId}",
    ],
    dependencies: ["TDC (source of classification and reference data)", "B9A (Gateway for consumer access)", "B16 (Audit trail for reference data)", "B3 (Tax Domain Authority)"],
    supportsState: "B28 does not directly support state-specific provision computation. State provision requirements are handled by the State workstream using state apportionment data from B9A.",
    supportsProvision: "B28 provides TDC provision reference data (DTA/DTL classifications, ETR categories, valuation allowance criteria) and the BTPProvisionOutbound contract. It does NOT compute provision, apply recognition/measurement rules, or handle UTP, period mismatch, consolidation, acquisition accounting, or disclosure classification — those are Provision team and BTP responsibilities.",
  },
];

function CapabilityCard({ batch }: { batch: typeof BATCHES[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ backgroundColor: "white", border: `1px solid ${batch.color}30`, borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", background: "none", border: "none", cursor: "pointer",
          borderLeft: `4px solid ${batch.color}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "24px" }}>{batch.icon}</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: batch.color, color: "white", borderRadius: "4px", padding: "2px 8px" }}>{batch.id}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: C.navy }}>{batch.name}</span>
            </div>
            <p style={{ fontSize: "12px", color: C.slate, margin: "3px 0 0", textAlign: "left" }}>{batch.businessPurpose.substring(0, 120)}...</p>
          </div>
        </div>
        <span style={{ fontSize: "18px", color: C.slate, flexShrink: 0, marginLeft: "12px" }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "18px" }}>
            {/* Left column */}
            <div>
              {[
                { label: "Business Purpose", text: batch.businessPurpose },
                { label: "Business Problem Solved", text: batch.businessProblem },
                { label: "Scope", text: batch.scope },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{f.label}</div>
                  <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{f.text}</p>
                </div>
              ))}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Capabilities</div>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {batch.capabilities.map(c => <li key={c} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{c}</li>)}
                </ul>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Dependencies</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {batch.dependencies.map(d => (
                    <span key={d} style={{ fontSize: "11px", backgroundColor: "#f1f5f9", color: C.slate, borderRadius: "4px", padding: "2px 8px" }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column */}
            <div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Business Objects</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {batch.businessObjects.map(o => (
                    <span key={o} style={{ fontSize: "11px", backgroundColor: `${batch.color}10`, color: batch.color, border: `1px solid ${batch.color}30`, borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>{o}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Related APIs</div>
                {batch.apis.map(a => (
                  <div key={a} style={{ fontSize: "11px", fontFamily: "monospace", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "4px 8px", marginBottom: "4px", color: "#0f172a" }}>{a}</div>
                ))}
              </div>
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>🗺️ Supports State by...</div>
                <p style={{ fontSize: "13px", color: "#166534", margin: 0, lineHeight: "1.6" }}>{batch.supportsState}</p>
              </div>
              <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>📊 Supports Provision by...</div>
                <p style={{ fontSize: "13px", color: "#5b21b6", margin: 0, lineHeight: "1.6" }}>{batch.supportsProvision}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExistingCapabilities() {
  return (
    <section id="s3" style={{ marginBottom: "48px" }}>
      <SectionHeading number="3" title="Existing DCT Capabilities" subtitle="Review what DCT already delivers before documenting new requirements. Click any batch to expand." />
      {BATCHES.map(b => <CapabilityCard key={b.id} batch={b} />)}
    </section>
  );
}

// ─── SECTION 4: End-to-End Data Flow ─────────────────────────────────────────
const FLOW_STEPS = [
  {
    id: "erp",
    label: "ERP Systems",
    sublabel: "SAP · Oracle · GL",
    color: "#334155",
    icon: "🏭",
    businessPurpose: "Source of all financial transaction data. ERP systems hold the general ledger, trial balance, and master data that feeds into DCT.",
    dataOwner: "Client ERP / Finance Team",
    infoMoves: "General ledger entries, trial balance, chart of accounts, entity master data",
    stateUse: "State apportionment factors and state-specific financial data originate here",
    provisionUse: "Provision source data (book income, temporary differences) originates here",
    batch: "Pre-DCT — ingestion handled by Tax Portal",
  },
  {
    id: "pdc",
    label: "PDC",
    sublabel: "Phoenix Data Consolidation",
    color: C.blue,
    icon: "⚙️",
    businessPurpose: "Ingests raw ERP data, normalizes it across Lines of Business, and enforces the Cross-LOB Taxonomy contract. PDC is the financial truth layer.",
    dataOwner: "PDC Engineering Team",
    infoMoves: "Normalized financial records, ingestion job status, Cross-LOB classification results",
    stateUse: "State-relevant financial data is normalized and tagged for state workstream consumption",
    provisionUse: "Provision-relevant financial data (book income, temporary differences) is normalized and made available to TDC",
    batch: "FC (Foundation Core), B1 (File Ingestion), B2 (Normalization)",
  },
  {
    id: "tdc",
    label: "TDC",
    sublabel: "Tax Data Consolidation",
    color: C.green,
    icon: "🧮",
    businessPurpose: "Applies tax rules, classifications, and adjustments to PDC financial data. TDC owns all tax decisions and business rules. Generates provision schedules and state tax data.",
    dataOwner: "TDC Engineering Team",
    infoMoves: "TaxProfile, MappingDecision, Adjustment, ProvisionSchedule, StateApportionment, AuditRecord",
    stateUse: "TDC applies state tax rules, computes state apportionment, and generates state tax classifications",
    provisionUse: "TDC computes current and deferred tax positions, generates provision schedules, and creates workpapers (Batch 28)",
    batch: "B3 (Tax Domain), B4 (AI Mapping), B16 (Audit Trail), B28 (Provision Schedules)",
  },
  {
    id: "roger",
    label: "Roger",
    sublabel: "Practitioner Interface",
    color: "#0891b2",
    icon: "👤",
    businessPurpose: "Read-only practitioner interface. Roger displays TDC outputs to tax practitioners for review, override submission, and sign-off. Roger does NOT own data or make decisions.",
    dataOwner: "Roger does NOT own data — read-only consumer via B9A Gateway",
    infoMoves: "Tax profiles, provision schedules, workpapers, audit trail, state apportionment data",
    stateUse: "State practitioners review state tax data, state apportionment, and state workpapers through Roger",
    provisionUse: "Provision practitioners review provision schedules, deferred tax positions, and provision workpapers through Roger",
    batch: "B9A (Gateway — primary access layer for Roger)",
  },
  {
    id: "ims",
    label: "IMS",
    sublabel: "Integration & Management System",
    color: C.rose,
    icon: "🔀",
    businessPurpose: "IMS is the integration broker between DCT/Roger and downstream return engines (GoSystem, CCH, OIT, future engines). DCT does not integrate directly with any return engine — IMS owns all engine routing, translation, and delivery.",
    dataOwner: "IMS Team",
    infoMoves: "Governed tax-ready payload from Roger/TDC; inbound return data from engines; engine lookup results; delivery acknowledgements",
    stateUse: "IMS receives governed state tax data from TDC and routes it to the appropriate return engine for state return preparation and filing",
    provisionUse: "IMS receives governed provision data from TDC and routes it to the appropriate return engine for provision reporting and filing",
    batch: "B9A (Gateway — IMS consumer access)",
  },
];

function DataFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= FLOW_STEPS.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const step = FLOW_STEPS[activeStep];
  const batchHighlights = ["B9A", "B16", "B28"];

  return (
    <section id="s4" style={{ marginBottom: "48px" }}>
      <SectionHeading number="4" title="End-to-End Data Flow" subtitle="State & Provision specific. Step through how data moves from ERP through IMS to return engines and how each workstream uses it." />

      {/* Flow diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "20px", overflowX: "auto", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px 24px" }}>
        {FLOW_STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => { setPlaying(false); setActiveStep(i); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                padding: "12px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
                backgroundColor: activeStep === i ? s.color : "#f8fafc",
                transition: "all 0.2s",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: activeStep === i ? "white" : C.navy }}>{s.label}</span>
              <span style={{ fontSize: "10px", color: activeStep === i ? "rgba(255,255,255,0.8)" : C.slate }}>{s.sublabel}</span>
            </button>
            {i < FLOW_STEPS.length - 1 && (
              <div style={{ fontSize: "20px", color: "#94a3b8", padding: "0 4px", flexShrink: 0 }}>↓</div>
            )}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={() => { setActiveStep(0); setPlaying(false); }}
            style={{ fontSize: "12px", fontWeight: 600, padding: "7px 14px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "white", color: C.slate, cursor: "pointer" }}
          >↺ Reset</button>
          <button
            onClick={() => { if (activeStep === FLOW_STEPS.length - 1) setActiveStep(0); setPlaying(!playing); }}
            style={{ fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "6px", border: "none", backgroundColor: playing ? "#dc2626" : "#059669", color: "white", cursor: "pointer" }}
          >{playing ? "⏸ Pause" : "▶ Play"}</button>
        </div>
      </div>

      {/* Step detail */}
      <div style={{ backgroundColor: "white", border: `2px solid ${step.color}`, borderRadius: "12px", padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
          <span style={{ fontSize: "28px" }}>{step.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: C.navy }}>{step.label}</span>
              <span style={{ fontSize: "11px", color: C.slate }}>{step.sublabel}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              {batchHighlights.filter(b => step.batch.includes(b)).map(b => (
                <span key={b} style={{ fontSize: "10px", fontWeight: 700, backgroundColor: b === "B9A" ? C.b9a : b === "B16" ? C.b16 : C.b28, color: "white", borderRadius: "4px", padding: "2px 7px" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { label: "Business Purpose", text: step.businessPurpose, color: step.color },
            { label: "Data Owner", text: step.dataOwner, color: step.color },
            { label: "Information Moves", text: step.infoMoves, color: step.color },
          ].map(f => (
            <div key={f.label} style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: f.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{f.label}</div>
              <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{f.text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>🗺️ How State Uses This</div>
            <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.5" }}>{step.stateUse}</p>
          </div>
          <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>📊 How Provision Uses This</div>
            <p style={{ fontSize: "12px", color: "#5b21b6", margin: 0, lineHeight: "1.5" }}>{step.provisionUse}</p>
          </div>
        </div>
        <div style={{ marginTop: "12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Supporting Batch: </span>
          <span style={{ fontSize: "12px", color: "#78350f" }}>{step.batch}</span>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: Capability Mapping Table ─────────────────────────────────────
type StatusType = "Covered" | "Partially Covered" | "Net-New" | "Out of Scope";

const STATUS_CONFIG: Record<StatusType, { dot: string; bg: string; text: string; border: string; label: string }> = {
  "Covered":          { dot: "🟢", bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Covered" },
  "Partially Covered":{ dot: "🟡", bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "Partially Covered" },
  "Net-New":          { dot: "🔵", bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", label: "Net-New" },
  "Out of Scope":     { dot: "⚪", bg: "#f8fafc", text: "#475569", border: "#e2e8f0", label: "Out of Scope" },
};

const CAPABILITY_ROWS: { need: string; capability: string; batch: string; apis: string; status: StatusType; action: string }[] = [
  { need: "Access state tax data", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/state/apportionment/{jurisdiction}", status: "Covered", action: "Reference the existing Gateway capability. Do not create a new requirement unless additional functionality is required." },
  { need: "Access provision schedules", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/provision/schedules/{period}", status: "Covered", action: "Reference the existing capability. Validate only additional business fields if needed." },
  { need: "Access workpapers", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/workpapers/{entityId}", status: "Covered", action: "Reuse the existing capability. Document only additional workpaper requirements." },
  { need: "Audit trail for tax decisions", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/decisions/{entityId}", status: "Covered", action: "Reference Batch 16. Do not create a new audit capability." },
  { need: "Lineage from ERP to output", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/lineage/{entityId}", status: "Covered", action: "Reuse existing lineage framework. Document only additional lineage requirements if applicable." },
  { need: "Decision history & overrides", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/history/{decisionId}", status: "Covered", action: "Reference existing audit capability." },
  { need: "DTA/DTL classification reference data", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/dta-classification/{entityTypeCode}", status: "Covered", action: "Reference existing reference data APIs." },
  { need: "ETR category reference data", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/etr-category/{entityTypeCode}", status: "Covered", action: "Reference existing reference data APIs." },
  { need: "Valuation allowance criteria", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/valuation-allowance/{entityTypeCode}", status: "Covered", action: "Reference existing reference data APIs." },
  { need: "BTP provision outbound (DTA/DTL recon, ETR recon, return-to-provision)", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "POST /api/v1/provision/outbound/btp/{entityId}", status: "Covered", action: "Reuse the existing outbound contract." },
  { need: "Provision compute / recognition rules (UTP, period mismatch, consolidation)", capability: "Not in DCT scope — owned by Provision team & BTP", batch: "—", apis: "Not applicable", status: "Out of Scope", action: "Document the business requirement and coordinate with the Provision/BTP team. Do not create DCT implementation work." },
  { need: "Audit export for IMS delivery", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/export/{entityId}", status: "Covered", action: "Reuse the existing Batch 16 capability." },
];

const LEGEND_ITEMS: { status: StatusType; definition: string; action: string }[] = [
  { status: "Covered",          definition: "Existing DCT capability satisfies the business need.",  action: "Reference the existing capability." },
  { status: "Partially Covered",definition: "Existing capability requires enhancement.",              action: "Document only the enhancement." },
  { status: "Net-New",          definition: "No existing DCT capability exists.",                    action: "Document the complete business requirement." },
  { status: "Out of Scope",     definition: "Capability belongs to another platform or team.",       action: "Coordinate with the owning team rather than creating DCT implementation work." },
];

function CapabilityMappingTable() {
  const batchColor = (b: string) => b === "B9A" ? C.b9a : b === "B16" ? C.b16 : b === "—" ? "#94a3b8" : C.b28;

  return (
    <section id="s5" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="5"
        title="How DCT Supports State & Provision"
        subtitle="Discovery Decision Matrix — Review this matrix before documenting new business requirements."
      />

      {/* Section description */}
      <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", marginBottom: "20px", marginTop: "-8px" }}>
        The purpose of this matrix is to determine whether the requested business capability already exists within DCT, whether an enhancement is required, or whether the capability is outside the DCT platform.
        Business Analysts should reference existing capabilities whenever possible rather than creating duplicate implementation work.
      </p>

      {/* Discovery Guidance panel */}
      <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", borderLeft: "4px solid #059669" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
          🔎 Discovery Guidance
        </div>
        <p style={{ fontSize: "13px", color: "#166534", margin: "0 0 10px", lineHeight: "1.6" }}>
          Before documenting a new requirement, determine whether DCT already provides the requested capability.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", marginBottom: "5px" }}>✅ If the capability already exists</div>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {["Reference the existing Batch.", "Reference the existing API.", "Document only the business enhancement."].map(t => (
                <li key={t} style={{ fontSize: "12px", color: "#166534", lineHeight: "1.6" }}>{t}</li>
              ))}
            </ul>
            <p style={{ fontSize: "11px", color: "#065f46", margin: "8px 0 0", fontWeight: 600 }}>Avoid creating duplicate implementation work.</p>
          </div>
          <div style={{ backgroundColor: "white", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginBottom: "5px" }}>🔵 If the capability does not exist</div>
            <p style={{ fontSize: "12px", color: "#1e40af", margin: 0, lineHeight: "1.6" }}>
              Document the business requirement and identify the capability as <strong>Net-New</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Matrix table */}
      <div style={{ overflowX: "auto", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "160px" }}>Business Need</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "180px" }}>Existing DCT Capability</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Supporting Batch</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "200px" }}>Supporting APIs</th>
              <th style={{ padding: "10px 14px", textAlign: "center", color: "white", fontWeight: 700, minWidth: "120px" }}>Status</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "200px" }}>BA Action</th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITY_ROWS.map((r, i) => {
              const sc = STATUS_CONFIG[r.status];
              return (
                <tr key={r.need} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: C.navy, verticalAlign: "top" }}>{r.need}</td>
                  <td style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top" }}>{r.capability}</td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: batchColor(r.batch), color: "white", borderRadius: "4px", padding: "2px 8px" }}>{r.batch}</span>
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", fontFamily: "monospace", fontSize: "11px", color: "#0f172a" }}>{r.apis}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center", verticalAlign: "top" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: "5px", padding: "3px 8px", whiteSpace: "nowrap" }}>
                      {sc.dot} {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top", fontSize: "12px", lineHeight: "1.5" }}>{r.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discovery Decision Legend */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Discovery Decision Legend</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
          {LEGEND_ITEMS.map(item => {
            const sc = STATUS_CONFIG[item.status];
            return (
              <div key={item.status} style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{sc.dot}</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: sc.text }}>{sc.label}</span>
                </div>
                <p style={{ fontSize: "11px", color: sc.text, margin: "0 0 5px", lineHeight: "1.5" }}>{item.definition}</p>
                <p style={{ fontSize: "11px", color: sc.text, margin: 0, fontWeight: 600, lineHeight: "1.5" }}>{item.action}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final reminder */}
      <div style={{ backgroundColor: C.navy, borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
          💡 Discovery Reminder
        </div>
        <p style={{ fontSize: "13px", color: "#e2e8f0", margin: "0 0 6px", fontWeight: 600 }}>
          Business Analysts define <span style={{ color: "#10b981" }}>WHAT</span> the business needs. DCT determines <span style={{ color: "#10b981" }}>HOW</span> the platform implements the solution.
        </p>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.6" }}>
          Understanding existing platform capabilities before documenting new requirements reduces duplicate work, accelerates solution assessment, and ensures implementation builds upon the current DCT platform rather than recreating existing functionality.
        </p>
      </div>
    </section>
  );
}

// ─── SECTION 6: Discovery Questions ──────────────────────────────────────────
const DISCOVERY_QUESTIONS = [
  { category: "Current-State Assessment", questions: [
    "What is the current business process?",
    "Which system performs this function today?",
    "What existing functionality already supports this capability?",
    "Which platform owns the capability?",
    "Which data is persisted?",
    "Which data is calculated?",
    "Which system is the system of record?",
    "What business problem is not solved today?",
  ]},
  { category: "Capability Check", questions: [
    "Does DCT already support this capability?",
    "Which existing Batch provides it?",
    "Which APIs already exist?",
    "Which existing business objects support it?",
    "Is the capability Covered, Partially Covered, or Net-New?",
    "If partially covered, what enhancement is required?",
    "If Net-New, why can't the existing platform satisfy the requirement?",
  ]},

  { category: "Scope & Requirements", questions: [
    "Would this require new scope beyond B9A, B16, or B28?",
    "Which system owns this capability — PDC, TDC, or the Gateway?",
    "Is this a new business rule (TDC), a new API (B9A), or a new output format (B28)?",
    "What is the downstream consumer — Roger, IMS, or both?",
  ]},
  { category: "Data & Lineage", questions: [
    "What source data is required, and does PDC already normalize it?",
    "Is full lineage required from ERP to output? (B16 supports this)",
    "Does this require a new business object in TDC, or can an existing one be extended?",
    "What audit trail requirements apply to this capability?",
  ]},
  { category: "Integration", questions: [
    "Does IMS need to route this data to a return engine? (B9A Gateway consumer scope)",
    "Does Roger need to display this data? (B9A Gateway consumer scope)",
    "Are there dependencies on other batches not yet delivered?",
    "What validations and error handling are required?",
  ]},
];

function DiscoveryQuestionsSection() {
  const [expanded, setExpanded] = useState<string | null>("Capability Check");

  return (
    <section id="s6" style={{ marginBottom: "48px" }}>
      <SectionHeading number="6" title="Discovery Questions" subtitle="Use these questions to guide requirements discovery. Expand each category." />
      {DISCOVERY_QUESTIONS.map(cat => (
        <div key={cat.category} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" }}>
          <button
            onClick={() => setExpanded(expanded === cat.category ? null : cat.category)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.navy }}>{cat.category}</span>
            <span style={{ fontSize: "16px", color: C.slate }}>{expanded === cat.category ? "▲" : "▼"}</span>
          </button>
          {expanded === cat.category && (
            <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f1f5f9" }}>
              {cat.questions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < cat.questions.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>?</span>
                  <span style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// ─── SECTION 7: Ask Buddy ─────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string };

const BUDDY_SUGGESTED = [
  "Does DCT already support this capability?",
  "Which Batch delivers this functionality?",
  "Which APIs already exist for this need?",
  "Which business objects support this capability?",
  "Is this Covered, Partially Covered, or Net-New?",
  "What existing DCT capabilities can be reused?",
  "What business information should be documented before engaging DCT?",
];

function AskBuddySection() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "👋 I'm Ask Buddy — your discovery guide for the DCT platform.\n\nBefore documenting any new requirement, ask me to determine whether DCT already supports the capability. I will evaluate existing platform capabilities, identify supporting batches, APIs, and business objects, and classify the request as Covered, Partially Covered, or Net-New before new requirements are created.\n\nDescribe the business capability you need — I'll check the DCT knowledge base first.",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.askBuddy.chat.useMutation();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send(text: string) {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const allMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const result = await chatMutation.mutateAsync({
        messages: allMsgs,
        discoveryPagePath: "/discovery/ims",
      });
      setMessages(prev => [...prev, { role: "assistant", content: result.text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="s7" style={{ marginBottom: "48px" }}>
      <SectionHeading number="7" title="Ask Buddy" subtitle="Before documenting any new requirement, ask Buddy to determine whether DCT already supports the capability. Buddy guides discovery — not just answers." />
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ height: "340px", overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", lineHeight: "1.6",
                backgroundColor: m.role === "user" ? C.navy : "#f8fafc",
                color: m.role === "user" ? "white" : "#1e293b",
                border: m.role === "assistant" ? "1px solid #e2e8f0" : "none",
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "13px", color: C.slate }}>
                Searching DCT knowledge base...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {/* Suggested questions */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {BUDDY_SUGGESTED.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "5px",
              border: "1px solid #e2e8f0", backgroundColor: "white", color: C.blue, cursor: "pointer",
            }}>{q}</button>
          ))}
        </div>
        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Ask about existing DCT capabilities for State & Provision..."
            style={{ flex: 1, padding: "9px 12px", fontSize: "13px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#0f1623" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            style={{
              padding: "9px 18px", fontSize: "13px", fontWeight: 700,
              backgroundColor: input.trim() && !isLoading ? C.navy : "#94a3b8",
              color: "white", border: "none", borderRadius: "6px",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            }}
          >Ask</button>
        </div>
      </div>
    </section>
  );
}

// ─── FINAL SECTION: Definition of Ready for DCT ─────────────────────────────────
const READY_CHECKLIST = [
  { id: "r1",  text: "Business capability defined" },
  { id: "r2",  text: "Current-state process documented" },
  { id: "r3",  text: "Existing platform capabilities evaluated" },
  { id: "r4",  text: "Business gap identified" },
  { id: "r5",  text: "Functional requirements documented" },
  { id: "r6",  text: "Business rules documented" },
  { id: "r7",  text: "Data ownership identified" },
  { id: "r8",  text: "System of record identified" },
  { id: "r9",  text: "Existing DCT capabilities referenced" },
  { id: "r10", text: "New functionality clearly defined" },
];

function DefinitionOfReadySection() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const pct = Math.round((checked.size / READY_CHECKLIST.length) * 100);
  const allDone = checked.size === READY_CHECKLIST.length;

  return (
    <section id="s-ready" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="✓"
        title="Definition of Ready for DCT"
        subtitle="Before engaging DCT for platform assessment, ensure business discovery is complete."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Checklist */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#0f1623", padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>✅ Business Discovery Checklist</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: allDone ? "#10b981" : "#fbbf24" }}>
                {checked.size}/{READY_CHECKLIST.length} complete
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                backgroundColor: allDone ? "#10b981" : "#f59e0b",
                borderRadius: "3px", transition: "width 0.3s ease",
              }} />
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {READY_CHECKLIST.map(item => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "9px 0",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
                  border: `2px solid ${checked.has(item.id) ? "#059669" : "#cbd5e1"}`,
                  backgroundColor: checked.has(item.id) ? "#059669" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {checked.has(item.id) && <span style={{ color: "white", fontSize: "12px", fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: "13px",
                  color: checked.has(item.id) ? "#64748b" : "#1e293b",
                  textDecoration: checked.has(item.id) ? "line-through" : "none",
                  lineHeight: "1.4",
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: what happens next + DCT actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* What DCT does next */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>🏗️ When These Items Are Complete, DCT Performs</div>
            {[
              { label: "Platform Capability Assessment", desc: "DCT evaluates whether existing platform capabilities can satisfy the documented business need." },
              { label: "Technical Gap Analysis", desc: "DCT identifies the technical delta between existing capabilities and the documented requirements." },
              { label: "Technical Solution Assessment", desc: "DCT proposes the implementation approach aligned to the batch delivery model." },
              { label: "Implementation Planning", desc: "DCT sequences the work into the appropriate batch and gate framework." },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  backgroundColor: "#059669", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px",
                }}>→</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "2px" }}>{item.label}</div>
                  <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.5" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Readiness status callout */}
          <div style={{
            backgroundColor: allDone ? "#059669" : "#0f1623",
            borderRadius: "12px", padding: "18px 20px",
            transition: "background-color 0.3s ease",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "white", marginBottom: "8px" }}>
              {allDone ? "🎉 Ready to Engage DCT" : "🕒 Discovery In Progress"}
            </div>
            <p style={{ fontSize: "13px", color: allDone ? "#d1fae5" : "#94a3b8", margin: 0, lineHeight: "1.6" }}>
              {allDone
                ? "All business discovery items are complete. You are ready to engage DCT for Platform Capability Assessment, Technical Gap Analysis, Technical Solution Assessment, and Implementation Planning."
                : `Complete all ${READY_CHECKLIST.length} checklist items before engaging DCT. ${READY_CHECKLIST.length - checked.size} item${READY_CHECKLIST.length - checked.size !== 1 ? "s" : ""} remaining.`
              }
            </p>
          </div>

          {/* Boundary reminder */}
          <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "14px 18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>📝 Ownership Boundary</div>
            <p style={{ fontSize: "12px", color: "#5b21b6", margin: 0, lineHeight: "1.6" }}>
              The Business Analyst defines <strong>WHAT</strong> the business needs. DCT determines <strong>HOW</strong> the platform implements the solution. Business discovery artifacts must be complete before DCT begins technical assessment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Floating Quick Links sidebar ────────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Discovery Workflow", href: "#s-workflow", color: "#0369a1", icon: "🔎" },
  { label: "Batch 9A", href: "#s3", color: C.b9a, icon: "🔐" },
  { label: "Batch 16", href: "#s3", color: C.b16, icon: "📋" },
  { label: "Batch 28", href: "#s3", color: C.b28, icon: "📄" },
  { label: "Workstream Overview", href: "#s1", color: C.slate, icon: "◎" },
  { label: "Responsibilities", href: "#s2", color: C.slate, icon: "▦" },
  { label: "Data Flow", href: "#s4", color: C.slate, icon: "→" },
  { label: "Capability Map", href: "#s5", color: C.slate, icon: "☑" },
  { label: "Discovery Questions", href: "#s6", color: C.slate, icon: "?" },
  { label: "Ask Buddy", href: "#s7", color: C.slate, icon: "🤖" },
  { label: "Ready for DCT", href: "#s-ready", color: "#059669", icon: "✓" },
];

function QuickLinks() {
  return (
    <div style={{
      position: "sticky", top: "20px", width: "180px", flexShrink: 0,
      backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
      padding: "14px 0", alignSelf: "flex-start",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 800, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        Quick Links
      </div>
      {QUICK_LINKS.map(l => (
        <a key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", textDecoration: "none", color: "#334155", fontSize: "12px", fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <span style={{ fontSize: "13px", width: "16px", textAlign: "center", flexShrink: 0 }}>{l.icon}</span>
          <span>{l.label}</span>
        </a>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DiscoveryWorkspace() {
  const [, navigate] = useLocation();

  return (
    <div style={{ padding: "28px 32px", fontFamily: "system-ui, sans-serif", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: "32px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", fontWeight: 900, fontSize: "16px" }}>D</div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, color: C.navy, margin: 0 }}>Provision & State Discovery Workspace</h1>
            </div>
            <p style={{ fontSize: "14px", color: C.slate, margin: 0, lineHeight: "1.6", maxWidth: "700px" }}>
              Review existing DCT capabilities to understand what already exists before documenting new business requirements.
              This workspace covers Batches 9A, 16, and 28 and their support for the State and Provision workstreams.
            </p>
          </div>
          {/* Discovery Principle */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px 18px", minWidth: "260px", flexShrink: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>🔎 Discovery Principle</div>
            <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.6" }}>
              Effective discovery begins with understanding existing capabilities before defining new requirements.
            </p>
          </div>
        </div>
        {/* Batch badges */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          {[
            { label: "Batch 9A — Gateway", color: C.b9a },
            { label: "Batch 16 — Audit Trail", color: C.b16 },
            { label: "Batch 28 — Provision Reference Data", color: C.b28 },
            { label: "State Workstream", color: C.teal },
            { label: "Provision Workstream", color: C.purple },
          ].map(b => (
            <span key={b.label} style={{ fontSize: "11px", fontWeight: 600, color: "white", backgroundColor: b.color, borderRadius: "4px", padding: "3px 9px" }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Two-column layout: content + quick links */}
      <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <WorkstreamOverview />
          <ResponsibilityMatrix />
          <DiscoveryWorkflowSection />
          <ExistingCapabilities />
          <DataFlowSection />
          <CapabilityMappingTable />
          <DiscoveryQuestionsSection />
          <AskBuddySection />
          <DefinitionOfReadySection />
        </div>
        {/* Quick links sidebar */}
        <QuickLinks />
      </div>
    </div>
  );
}
