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
const CAPABILITY_ROWS = [
  { need: "Access state tax data", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/state/apportionment/{jurisdiction}", gap: false },
  { need: "Access provision schedules", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/provision/schedules/{period}", gap: false },
  { need: "Access workpapers", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "GET /api/v1/gateway/workpapers/{entityId}", gap: false },
  { need: "Audit trail for tax decisions", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/decisions/{entityId}", gap: false },
  { need: "Lineage from ERP to output", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/lineage/{entityId}", gap: false },
  { need: "Decision history & overrides", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/history/{decisionId}", gap: false },
  { need: "DTA/DTL classification reference data", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/dta-classification/{entityTypeCode}", gap: false },
  { need: "ETR category reference data", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/etr-category/{entityTypeCode}", gap: false },
  { need: "Valuation allowance criteria", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "GET /api/v1/provision/reference/valuation-allowance/{entityTypeCode}", gap: false },
  { need: "BTP provision outbound (DTA/DTL recon, ETR recon, return-to-provision)", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "POST /api/v1/provision/outbound/btp/{entityId}", gap: false },
  { need: "Provision compute / recognition rules (UTP, period mismatch, consolidation)", capability: "Not in DCT scope — owned by Provision team & BTP", batch: "—", apis: "Not applicable", gap: true },
  { need: "Audit export for IMS delivery", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/export/{entityId}", gap: false },
];

function CapabilityMappingTable() {
  const batchColor = (b: string) => b === "B9A" ? C.b9a : b === "B16" ? C.b16 : C.b28;

  return (
    <section id="s5" style={{ marginBottom: "48px" }}>
      <SectionHeading number="5" title="How DCT Supports State & Provision" subtitle="Review this table before documenting new requirements. If a capability exists, reference the batch and API rather than creating new scope." />
      <div style={{ overflowX: "auto", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Business Need</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Existing DCT Capability</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Supporting Batch</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Supporting APIs</th>
              <th style={{ padding: "10px 14px", textAlign: "center", color: "white", fontWeight: 700 }}>Gap?</th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITY_ROWS.map((r, i) => (
              <tr key={r.need} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: C.navy, verticalAlign: "top" }}>{r.need}</td>
                <td style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top" }}>{r.capability}</td>
                <td style={{ padding: "10px 14px", verticalAlign: "top" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: batchColor(r.batch), color: "white", borderRadius: "4px", padding: "2px 8px" }}>{r.batch}</span>
                </td>
                <td style={{ padding: "10px 14px", verticalAlign: "top", fontFamily: "monospace", fontSize: "11px", color: "#0f172a" }}>{r.apis}</td>
                <td style={{ padding: "10px 14px", textAlign: "center", verticalAlign: "top" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: r.gap ? "#dc2626" : "#059669" }}>{r.gap ? "⚠ Yes" : "✓ No"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── SECTION 6: Discovery Questions ──────────────────────────────────────────
const DISCOVERY_QUESTIONS = [
  { category: "Capability Check", questions: [
    "Does DCT already support this capability? Which Batch provides it?",
    "Which APIs are available for this business need?",
    "Is this capability already on the DCT roadmap (B9A, B16, B28)?",
    "Is additional functionality required, or does the existing capability satisfy the need?",
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
  "Which Batch supports State tax data access?",
  "Which APIs support Provision schedules?",
  "How does Batch 28 work?",
  "What does Roger provide to practitioners?",
  "What information does IMS route to return engines?",
  "Does DCT already support audit trail for provision?",
];

function AskBuddySection() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "👋 I'm Ask Buddy. I'm pre-loaded with full context for Batch 9A, Batch 16, Batch 28, the Discovery Center, and the DCT architecture.\n\nBefore documenting any new requirement, ask me whether DCT already supports it. I will check existing capabilities first and identify the relevant Feature, Batch, and APIs.",
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
      <SectionHeading number="7" title="Ask Buddy" subtitle="Research existing DCT capabilities before writing requirements. Buddy checks B9A, B16, B28, and the full DCT architecture." />
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

// ─── Floating Quick Links sidebar ────────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Batch 9A", href: "#s3", color: C.b9a, icon: "🔐" },
  { label: "Batch 16", href: "#s3", color: C.b16, icon: "📋" },
  { label: "Batch 28", href: "#s3", color: C.b28, icon: "📄" },
  { label: "Workstream Overview", href: "#s1", color: C.slate, icon: "◎" },
  { label: "Responsibilities", href: "#s2", color: C.slate, icon: "▦" },
  { label: "Data Flow", href: "#s4", color: C.slate, icon: "→" },
  { label: "Capability Map", href: "#s5", color: C.slate, icon: "☑" },
  { label: "Discovery Questions", href: "#s6", color: C.slate, icon: "?" },
  { label: "Ask Buddy", href: "#s7", color: C.slate, icon: "🤖" },
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
          <ExistingCapabilities />
          <DataFlowSection />
          <CapabilityMappingTable />
          <DiscoveryQuestionsSection />
          <AskBuddySection />
        </div>
        {/* Quick links sidebar */}
        <QuickLinks />
      </div>
    </div>
  );
}
