// ─────────────────────────────────────────────────────────────────────────────
// Consumer Integration Readiness Hub
// Purpose: Single authoritative integration enablement hub for Roger and future
//          consumers. Centralizes API relationship guidance, payload sequencing,
//          lineage mappings, integration dependencies, and consumer onboarding.
//
// Sections:
//   1.  Executive Summary
//   2.  Consumer Integration Architecture Overview
//   3.  Canonical ID & Relationship Mapping Matrix
//   4.  API Relationship Sequencing
//   5.  Required vs Optional Field Governance
//   6.  End-to-End Payload Walkthroughs
//   7.  Consumer Integration Test Dataset
//   8.  API Maturity & Stability Matrix
//   9.  Known Consumer Enhancement Requests
//   10. Governance Boundaries
//   11. Open Questions / Pending Decisions
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { Link } from "wouter";
import {
  ChevronDown, ChevronUp, Shield, Link2, Database, AlertTriangle,
  CheckCircle2, Clock, Circle, FileText, Zap, Eye, Lock, Users, Printer,
} from "lucide-react";

// ── Version metadata ─────────────────────────────────────────────────────────
const HUB_VERSION = "v4.0";
const HUB_SOURCE  = "DCT_Batch_Roadmap_v4.docx";
const HUB_UPDATED = "May 26, 2026";
const HUB_AUTHOR  = "CATT · Sr. BA · Jenniver";

// ── Collapsible Section Wrapper ──────────────────────────────────────────────
function Section({
  id, title, badge, badgeColor = "#003865", children, defaultOpen = false,
}: {
  id: string; title: string; badge?: string; badgeColor?: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="border border-slate-200 rounded-lg overflow-hidden mb-4">
      <button
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
        style={{ background: open ? "#f0f7ff" : "#f8fafc" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2.5">
          {open
            ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
            : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className="text-sm font-bold text-[#003865]">{title}</span>
          {badge && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: badgeColor + "22", color: badgeColor, border: `1px solid ${badgeColor}44` }}
            >
              {badge}
            </span>
          )}
        </div>
      </button>
      {open && <div className="px-5 py-4 bg-white border-t border-slate-100">{children}</div>}
    </div>
  );
}

// ── Callout Box ───────────────────────────────────────────────────────────────
function Callout({
  type = "info", title, children,
}: { type?: "info" | "warning" | "governance" | "boundary"; title: string; children: React.ReactNode }) {
  const styles = {
    info:       { bg: "#eff6ff", border: "#3b82f6", icon: <Circle className="w-4 h-4" style={{ color: "#3b82f6" }} />, titleColor: "#1e40af" },
    warning:    { bg: "#fffbeb", border: "#f59e0b", icon: <AlertTriangle className="w-4 h-4" style={{ color: "#f59e0b" }} />, titleColor: "#92400e" },
    governance: { bg: "#f0fdf4", border: "#16a34a", icon: <Shield className="w-4 h-4" style={{ color: "#16a34a" }} />, titleColor: "#14532d" },
    boundary:   { bg: "#faf5ff", border: "#7c3aed", icon: <Lock className="w-4 h-4" style={{ color: "#7c3aed" }} />, titleColor: "#4c1d95" },
  }[type];
  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: styles.bg, borderLeft: `4px solid ${styles.border}` }}>
      <div className="flex items-center gap-2 mb-1.5">
        {styles.icon}
        <span className="text-sm font-bold" style={{ color: styles.titleColor }}>{title}</span>
      </div>
      <div className="text-sm" style={{ color: styles.titleColor }}>{children}</div>
    </div>
  );
}

// ── Table Component ───────────────────────────────────────────────────────────
function DataTable({ headers, rows, compact = false }: { headers: string[]; rows: (string | React.ReactNode)[][]; compact?: boolean }) {
  return (
    <div className="overflow-x-auto rounded border border-slate-200 mb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#003865] text-white">
            {headers.map((h, i) => (
              <th key={i} className={`text-left font-semibold px-3 ${compact ? "py-1.5" : "py-2"} whitespace-nowrap`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50"}>
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 ${compact ? "py-1.5" : "py-2"} text-slate-700 align-top`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "#059669": { bg: "#d1fae5", text: "#065f46" },
    "#003865": { bg: "#dbeafe", text: "#1e40af" },
    "#7c3aed": { bg: "#ede9fe", text: "#4c1d95" },
    "#dc2626": { bg: "#fee2e2", text: "#991b1b" },
    "#d97706": { bg: "#fef3c7", text: "#92400e" },
    "#6b7280": { bg: "#f3f4f6", text: "#374151" },
    "#0e7490": { bg: "#cffafe", text: "#164e63" },
  };
  const s = map[color] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.text }}>
      {label}
    </span>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
export default function ConsumerIntegrationReadinessHub() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-5 h-5 text-[#003865]" />
              <h1 className="text-xl font-bold text-[#003865]">Consumer Integration Readiness Hub</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#ede9fe", color: "#4c1d95" }}>
                Authoritative
              </span>
            </div>
            <p className="text-sm text-slate-500">
              DCT Platform · Single integration enablement hub for Roger and future consumers
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-blue-50 text-blue-800 font-medium border border-blue-200">API-First Architecture</span>
              <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 font-medium border border-emerald-200">Lineage Governed</span>
              <span className="px-2 py-1 rounded bg-violet-50 text-violet-800 font-medium border border-violet-200">Roger Read-Only</span>
              <span className="px-2 py-1 rounded bg-amber-50 text-amber-800 font-medium border border-amber-200">Contract Published</span>
            </div>
            {/* Print / Export to PDF button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
              style={{ background: "#003865", color: "#fff", border: "1px solid #003865" }}
              title="Print or Save as PDF — use your browser's Print dialog and choose 'Save as PDF'"
            >
              <Printer className="w-3.5 h-3.5" />
              Export to PDF
            </button>
          </div>
        </div>

        {/* Quick-jump nav */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[
            ["#exec-summary", "Executive Summary"],
            ["#arch-overview", "Architecture"],
            ["#id-matrix", "ID Matrix"],
            ["#api-sequencing", "API Sequencing"],
            ["#field-governance", "Field Governance"],
            ["#payload-walkthroughs", "Payload Walkthroughs"],
            ["#test-dataset", "Test Dataset"],
            ["#maturity-matrix", "Maturity Matrix"],
            ["#enhancements", "Enhancements"],
            ["#gov-boundaries", "Gov Boundaries"],
            ["#open-questions", "Open Questions"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:bg-[#003865] hover:text-white hover:border-[#003865] transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 max-w-7xl mx-auto">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 1 — Executive Summary                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="exec-summary">
          <Section id="s1" title="1 — Executive Summary" badge="Governance" badgeColor="#003865" defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-700 mb-3">
                  The DCT platform exposes <strong>governed APIs and lineage-safe contracts</strong> that enable Roger
                  and future consumers to access authoritative financial data, tax decisions, and AI mapping outputs.
                  This hub centralizes all consumer implementation guidance to reduce fragmentation across Swagger,
                  ADO Features, batch documentation, Consumer Guides, and BA walkthroughs.
                </p>
                <p className="text-sm text-slate-700 mb-3">
                  Prior to this hub, integration knowledge was distributed across multiple artifacts with no single
                  authoritative reference. This page consolidates:
                </p>
                <ul className="text-sm text-slate-700 space-y-1 ml-4 list-disc">
                  <li>API relationship and sequencing guidance</li>
                  <li>Canonical ID and lineage chain documentation</li>
                  <li>Payload examples and field governance rules</li>
                  <li>Consumer onboarding and test dataset references</li>
                  <li>API maturity and stability classifications</li>
                  <li>Governance boundary definitions</li>
                </ul>
              </div>
              <div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ownership Model</p>
                  <div className="space-y-2">
                    {[
                      { system: "PDC", role: "Phoenix Data Consolidation — ingestion, normalization, lineage anchoring", color: "#1e40af" },
                      { system: "TDC", role: "Tax Data Consolidation — tax decisions, eligibility, proposals, tax-ready records", color: "#059669" },
                      { system: "Orchestrator", role: "AI execution — mapping proposals, classification, confidence scoring", color: "#7c3aed" },
                      { system: "Roger", role: "Read-only consumer — UI orchestration, workflow composition, presentation logic", color: "#d97706" },
                    ].map(({ system, role, color }) => (
                      <div key={system} className="flex items-start gap-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0" style={{ background: color + "18", color }}>{system}</span>
                        <span className="text-xs text-slate-600">{role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Lineage Chain</p>
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    {["DocumentId", "EntityId", "ReportingPeriodId", "ProposalId", "DecisionId", "TaxReadyRecordId"].map((id, i, arr) => (
                      <span key={id} className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded font-mono font-semibold" style={{ background: "#dbeafe", color: "#1e40af" }}>{id}</span>
                        {i < arr.length - 1 && <span className="text-slate-400">→</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Callout type="boundary" title="Important Boundary Statement">
              DCT governs authoritative contracts, lineage, taxonomy, and tax-ready outputs.
              Consumer applications (Roger and future consumers) remain responsible for UI orchestration,
              workflow composition, presentation logic, and consumer-side implementation behavior.
              DCT does <strong>not</strong> own Roger UI behavior, paging strategies, caching, or rendering decisions.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 2 — Architecture Overview                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="arch-overview">
          <Section id="s2" title="2 — Consumer Integration Architecture Overview" badge="Architecture" badgeColor="#7c3aed">
            <p className="text-sm text-slate-600 mb-4">
              The following diagram describes the end-to-end relationship between all platform systems,
              showing authoritative ownership, inbound vs outbound integrations, and producer vs consumer relationships.
            </p>

            {/* Architecture visual — system relationship grid */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">System Relationship Map</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { name: "PDC", subtitle: "Phoenix Data Consolidation", role: "Producer", color: "#1e40af", bg: "#dbeafe", items: ["Ingestion", "Normalization", "Lineage Anchor", "Exception Remediation", "Roger Gateway (B9)"] },
                  { name: "TDC", subtitle: "Tax Data Consolidation", role: "Producer", color: "#059669", bg: "#d1fae5", items: ["Tax Profile", "Eligibility", "AI Proposals", "Decisions", "Tax-Ready Records"] },
                  { name: "Orchestrator", subtitle: "AI Execution Engine", role: "Producer", color: "#7c3aed", bg: "#ede9fe", items: ["Mapping Proposals", "Confidence Scoring", "Classification", "Model Governance"] },
                  { name: "Roger", subtitle: "Practitioner Consumer", role: "Consumer (Read-Only)", color: "#d97706", bg: "#fef3c7", items: ["UI Orchestration", "Workflow Composition", "Presentation Logic", "Consumer Caching"] },
                ].map(({ name, subtitle, role, color, bg, items }) => (
                  <div key={name} className="rounded-lg border p-3" style={{ borderColor: color + "44", background: bg + "88" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold" style={{ color }}>{name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: color + "22", color }}>{role}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
                    <ul className="text-xs space-y-0.5">
                      {items.map(i => <li key={i} className="text-slate-600">· {i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>

              {/* External systems */}
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">External Systems (Pass-Through via B9 Gateway)</p>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { name: "IMS", desc: "Prior year + current year data. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "CEM", desc: "Client auth + user mapping. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "TIM", desc: "Engagement metadata, deliverables, due dates. PDC surfaces via gateway — not stored.", color: "#0e7490" },
                  { name: "eODS", desc: "Deferred. Not in current MVP scope. Gated on IMS readiness.", color: "#6b7280" },
                ].map(({ name, desc, color }) => (
                  <div key={name} className="rounded-lg border border-slate-200 bg-white p-3">
                    <span className="text-xs font-bold" style={{ color }}>{name}</span>
                    <p className="text-xs text-slate-500 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <DataTable
              headers={["System", "Direction", "Relationship", "Read/Write", "Authoritative Owner", "Notes"]}
              rows={[
                ["PDC", "Inbound", "Receives raw financial data from Tax Portal via Service Bus", "Write", "PDC", "Ingestion anchor. DocumentId issued here."],
                ["PDC → TDC", "Outbound", "Normalized records consumed by TDC for classification", "Read", "PDC", "NormalizedRecordId is the PDC→TDC handoff key."],
                ["TDC → Orchestrator", "Outbound", "TDC requests AI mapping proposals from Orchestrator", "Read", "TDC", "Orchestrator is execution-only. TDC owns decisions."],
                ["Orchestrator → TDC", "Inbound", "Proposals returned to TDC for practitioner review", "Write (proposals only)", "Orchestrator", "Proposals are immutable once submitted."],
                ["TDC → Roger", "Outbound", "Tax-ready records, proposals, decisions surfaced to Roger", "Read-Only", "TDC", "Roger is read-only. No write surface to TDC."],
                ["PDC → Roger", "Outbound", "Gateway (B9) surfaces IMS/CEM/TIM pass-through to Roger", "Read-Only", "PDC", "Surface-not-store. No IMS/CEM/TIM data persisted in PDC."],
                ["IMS → PDC Gateway", "Inbound pass-through", "Prior year + current year data surfaced via Ocelot", "Read-Only", "IMS", "PDC does not store IMS data. Pass-through only."],
                ["CEM → PDC Gateway", "Inbound pass-through", "Client auth + user mapping surfaced via Ocelot", "Read-Only", "CEM", "PDC does not store CEM data. Pass-through only."],
                ["TIM → PDC Gateway", "Inbound pass-through", "Engagement metadata surfaced via Ocelot", "Read-Only", "TIM", "PDC does not store TIM data. Pass-through only."],
              ]}
            />

            <Callout type="governance" title="Lineage Chain — Authoritative Sequence">
              <span className="font-mono text-xs">
                DocumentId → EntityId → ReportingPeriodId → ProposalId → DecisionId → TaxReadyRecordId
              </span>
              <p className="mt-1 text-xs">
                Each ID in this chain is immutable and lineage-anchored. Consumers must traverse this chain
                in sequence. Skipping steps or resolving IDs out of order is a governance violation.
              </p>
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3 — Canonical ID & Relationship Mapping Matrix         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="id-matrix">
          <Section id="s3" title="3 — Canonical ID & Relationship Mapping Matrix" badge="Lineage" badgeColor="#059669">
            <p className="text-sm text-slate-600 mb-3">
              The following matrix documents all primary keys, foreign key relationships, and lineage properties
              for every authoritative DCT resource. Consumers must use these IDs exactly as issued — they are
              never to be generated, inferred, or substituted by consumer applications.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: "Immutable", color: "#92400e", bg: "#fef3c7" },
                { label: "Lineage Anchor", color: "#065f46", bg: "#d1fae5" },
                { label: "Derived", color: "#1e40af", bg: "#dbeafe" },
                { label: "Consumer-Safe", color: "#4c1d95", bg: "#ede9fe" },
              ].map(({ label, color, bg }) => (
                <span key={label} className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
                  ● {label}
                </span>
              ))}
            </div>

            <DataTable
              headers={["Resource", "Primary Key", "Foreign Keys", "Related Resource", "Relationship Purpose", "Authoritative Owner", "Properties"]}
              rows={[
                ["TaxReadyRecord", "TaxReadyRecordId", "DecisionId, EntityId, ReportingPeriodId", "ProposalDecision, Entity, ReportingPeriod", "Terminal lineage output — tax-ready state", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["AIMappingProposal", "ProposalId", "NormalizedRecordId, FirmTaxonomyId, EntityId", "NormalizedRecord, FirmTaxonomy", "AI classification proposal for practitioner review", "Orchestrator / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ProposalDecision", "DecisionId", "ProposalId, ReviewTaskId", "AIMappingProposal, ReviewTask", "Practitioner accept/reject/override decision", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /></span>],
                ["TaxForm", "TaxFormId", "TaxReadyRecordId, EntityId", "TaxReadyRecord, Entity", "Resolved tax form for a given entity + period", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Derived" color="#003865" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["TaxFormLine", "TaxFormLineId", "TaxFormId, TaxTaxonomyAccountId", "TaxForm, TaxTaxonomyAccount", "Individual line item within a resolved tax form", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Derived" color="#003865" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["TaxTaxonomyAccount", "TaxTaxonomyAccountCode", "FirmTaxonomyId", "FirmTaxonomy", "Canonical taxonomy account — maps financial data to tax lines", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["NormalizedRecord", "NormalizedRecordId", "DocumentId, EntityId, ReportingPeriodId", "Document, Entity, ReportingPeriod", "PDC normalized financial record — TDC input", "PDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Immutable" color="#d97706" /><Badge label="Lineage Anchor" color="#059669" /></span>],
                ["Entity", "EntityId", "ClientId", "Client", "Legal entity within a client engagement", "PDC / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["Client", "ClientId", "—", "Entity (1:N)", "RSM client — top-level engagement anchor", "PDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ReportingPeriod", "ReportingPeriodId", "EntityId", "Entity", "Tax reporting period for a given entity", "PDC / TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Lineage Anchor" color="#059669" /><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
                ["ReviewTask", "ReviewTaskId", "ProposalId, EntityId, AssignedUserId", "AIMappingProposal, Entity", "Practitioner review assignment for a proposal", "TDC",
                  <span className="flex flex-col gap-0.5"><Badge label="Consumer-Safe" color="#7c3aed" /></span>],
              ]}
            />

            <Callout type="warning" title="Consumer Implementation Rule">
              All IDs marked <strong>Immutable</strong> must be stored and referenced exactly as issued by the
              authoritative system. Consumer applications must never generate, hash, or substitute these IDs.
              Lineage Anchor IDs are required for all downstream API calls — missing anchors will result in
              rejected requests.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4 — API Relationship Sequencing                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="api-sequencing">
          <Section id="s4" title="4 — API Relationship Sequencing" badge="Implementation" badgeColor="#0e7490">
            <p className="text-sm text-slate-600 mb-4">
              The following step-by-step walkthrough documents the authoritative API chaining sequence for a
              complete end-to-end integration. Each step must be completed in order — keys produced in earlier
              steps are required inputs for later steps.
            </p>

            <div className="space-y-3">
              {[
                {
                  step: 1, name: "Retrieve Normalized Records",
                  endpoint: "GET /api/v1/data-records", system: "PDC",
                  produced: ["NormalizedRecordId", "EntityId", "ReportingPeriodId", "DocumentId"],
                  consumed: ["EntityId (filter)", "ReportingPeriodId (filter)"],
                  depends: "Ingestion run complete (B1/B2)",
                  lineage: "NormalizedRecordId is the PDC lineage anchor. All downstream TDC calls require this ID.",
                  batch: "B2",
                },
                {
                  step: 2, name: "Retrieve FirmTaxonomy Classifications",
                  endpoint: "GET /api/v1/firm-taxonomy", system: "TDC",
                  produced: ["FirmTaxonomyId", "TaxTaxonomyAccountCode"],
                  consumed: ["EntityId"],
                  depends: "Entity resolved (Step 1)",
                  lineage: "FirmTaxonomyId is required for proposal creation and tax form line resolution.",
                  batch: "B3",
                },
                {
                  step: 3, name: "Retrieve AI Mapping Proposals",
                  endpoint: "GET /api/v1/ai-mapping-proposals", system: "TDC / Orchestrator",
                  produced: ["ProposalId", "FirmTaxonomyId", "NormalizedRecordId"],
                  consumed: ["EntityId", "ReportingPeriodId", "NormalizedRecordId"],
                  depends: "Normalized records resolved (Step 1), FirmTaxonomy resolved (Step 2)",
                  lineage: "ProposalId is the TDC lineage anchor for the decision chain.",
                  batch: "B4 / B5",
                },
                {
                  step: 4, name: "Submit Proposal Decisions",
                  endpoint: "POST /api/v1/proposal-decisions", system: "TDC",
                  produced: ["DecisionId"],
                  consumed: ["ProposalId", "ReviewTaskId"],
                  depends: "Proposal retrieved (Step 3), ReviewTask assigned",
                  lineage: "DecisionId is immutable. Once submitted, the decision cannot be modified — only superseded.",
                  batch: "B6",
                },
                {
                  step: 5, name: "Retrieve Tax-Ready Records",
                  endpoint: "GET /api/v1/tax-ready-records", system: "TDC",
                  produced: ["TaxReadyRecordId"],
                  consumed: ["EntityId", "ReportingPeriodId", "DecisionId"],
                  depends: "All proposals decided (Step 4), eligibility confirmed (B7)",
                  lineage: "TaxReadyRecordId is the terminal lineage output. This is the authoritative tax-ready state.",
                  batch: "B7",
                },
                {
                  step: 6, name: "Resolve Form Lines",
                  endpoint: "GET /api/v1/tax-form-lines", system: "TDC",
                  produced: ["TaxFormLineId", "TaxFormId"],
                  consumed: ["TaxReadyRecordId", "TaxTaxonomyAccountCode"],
                  depends: "Tax-ready records resolved (Step 5)",
                  lineage: "TaxFormLineId is derived from TaxReadyRecordId. Required for practitioner review rendering.",
                  batch: "B7 / B11",
                },
                {
                  step: 7, name: "Generate Review Tasks",
                  endpoint: "POST /api/v1/review-tasks", system: "TDC",
                  produced: ["ReviewTaskId"],
                  consumed: ["ProposalId", "EntityId", "AssignedUserId"],
                  depends: "Proposals available (Step 3)",
                  lineage: "ReviewTaskId links to ProposalId. Required for practitioner assignment and sign-off.",
                  batch: "B6",
                },
                {
                  step: 8, name: "Retrieve Practitioner Review State",
                  endpoint: "GET /api/v1/review-tasks/{taskId}", system: "TDC",
                  produced: ["ReviewState", "SignOffStatus"],
                  consumed: ["ReviewTaskId"],
                  depends: "Review task generated (Step 7)",
                  lineage: "SignOffStatus is immutable once submitted. Drives downstream eligibility and tax-ready state.",
                  batch: "B6 / B7",
                },
              ].map(({ step, name, endpoint, system, produced, consumed, depends, lineage, batch }) => (
                <div key={step} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#003865" }}>
                      {step}
                    </span>
                    <span className="text-sm font-bold text-[#003865]">{name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">{endpoint}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold ml-auto" style={{ background: "#dbeafe", color: "#1e40af" }}>{system}</span>
                    <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: "#d1fae5", color: "#065f46" }}>{batch}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Produced Keys</p>
                      {produced.map(k => <p key={k} className="text-xs font-mono text-emerald-700">{k}</p>)}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Consumed Keys</p>
                      {consumed.map(k => <p key={k} className="text-xs font-mono text-blue-700">{k}</p>)}
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Dependencies</p>
                      <p className="text-xs text-slate-600">{depends}</p>
                    </div>
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Lineage Implication</p>
                      <p className="text-xs text-slate-600">{lineage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 5 — Required vs Optional Field Governance              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="field-governance">
          <Section id="s5" title="5 — Required vs Optional Field Governance" badge="Contracts" badgeColor="#dc2626">
            <Callout type="warning" title="Swagger Is Not the Full Contract">
              Swagger schemas alone do not represent the full governance contract. Batch Features and governing
              ADO stories remain authoritative for conditional rules, lineage requirements, and validation
              expectations. Always cross-reference Swagger with the relevant ADO Feature before implementing.
            </Callout>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                {
                  type: "Required", color: "#dc2626", bg: "#fee2e2",
                  desc: "Must be present in every request. Absence results in HTTP 400 rejection.",
                  examples: ["EntityId on all entity-scoped endpoints", "ReportingPeriodId on period-scoped endpoints", "ProposalId on decision submission", "NormalizedRecordId on proposal creation"],
                },
                {
                  type: "Optional", color: "#059669", bg: "#d1fae5",
                  desc: "May be omitted. Default behavior applies when absent. Documented per endpoint.",
                  examples: ["PageSize (defaults to 50)", "SortOrder (defaults to ascending)", "IncludeInactive (defaults to false)", "FilterByStatus (returns all statuses if omitted)"],
                },
                {
                  type: "Conditional", color: "#d97706", bg: "#fef3c7",
                  desc: "Required only when a related field is present or a specific state is active.",
                  examples: ["DecisionId required when submitting sign-off", "SupersedeReason required when superseding a decision", "ReviewTaskId required when closing a review", "FirmTaxonomyId required when creating a proposal"],
                },
                {
                  type: "Nullable", color: "#6b7280", bg: "#f3f4f6",
                  desc: "May be null in response. Consumers must handle null gracefully — do not assume presence.",
                  examples: ["ConfidenceScore (null if Orchestrator has not processed)", "SignOffDate (null until sign-off submitted)", "TaxReadyDate (null until tax-ready state achieved)", "AssignedUserId (null if unassigned)"],
                },
              ].map(({ type, color, bg, desc, examples }) => (
                <div key={type} className="rounded-lg border p-3" style={{ borderColor: color + "44", background: bg + "66" }}>
                  <p className="text-sm font-bold mb-1" style={{ color }}>{type} Fields</p>
                  <p className="text-xs text-slate-600 mb-2">{desc}</p>
                  <ul className="text-xs space-y-0.5">
                    {examples.map(e => <li key={e} className="text-slate-700">· {e}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <DataTable
              compact
              headers={["Behavior", "HTTP Status", "Trigger", "Consumer Action Required"]}
              rows={[
                ["Required field missing", "400 Bad Request", "EntityId, ReportingPeriodId, or ProposalId absent", "Add required field. Do not retry without correction."],
                ["Conditional field missing", "422 Unprocessable Entity", "Conditional dependency not met (e.g., DecisionId missing on sign-off)", "Resolve dependency chain before retrying."],
                ["Lineage anchor invalid", "404 Not Found", "Referenced ID does not exist in authoritative system", "Verify ID was issued by the correct system. Do not fabricate IDs."],
                ["Immutable field mutation attempt", "409 Conflict", "Attempt to update an immutable field (e.g., DecisionId, ProposalId)", "Immutable fields cannot be changed. Create a supersede record instead."],
                ["Eligibility gate blocked", "403 Forbidden", "Entity in INELIGIBLE or FLAG_AND_REVIEW state", "Resolve eligibility before proceeding. TDC is the eligibility authority."],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 6 — End-to-End Payload Walkthroughs                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="payload-walkthroughs">
          <Section id="s6" title="6 — End-to-End Payload Walkthroughs" badge="Examples" badgeColor="#0e7490">
            <p className="text-sm text-slate-600 mb-4">
              The following payload examples illustrate the authoritative request/response structure for each
              major integration flow. All IDs shown are representative — use the Known Integration Validation
              Dataset (Section 7) for actual test values.
            </p>

            {[
              {
                id: "A", name: "Normalization Flow", batch: "B1/B2",
                request: `POST /api/v1/Ingestion\n{\n  "clientId": "CLT-00042",\n  "entityId": "ENT-10019",\n  "documentTypeCode": "TRIAL_BALANCE",\n  "reportingPeriodId": "RP-2024-Q4",\n  "fileReference": "s3://dct-ingestion/tb-2024-q4.csv"\n}`,
                response: `{\n  "ingestionRunId": "IR-88821",\n  "documentId": "DOC-55310",\n  "entityId": "ENT-10019",\n  "status": "Processing",\n  "submittedAt": "2026-05-21T09:00:00Z"\n}`,
                lineage: "DocumentId → EntityId → ReportingPeriodId",
                required: ["clientId", "entityId", "documentTypeCode", "reportingPeriodId", "fileReference"],
                downstream: "GET /api/v1/data-records?entityId=ENT-10019&reportingPeriodId=RP-2024-Q4",
                next: "Step 2 — Retrieve normalized records once ingestion status = Completed",
              },
              {
                id: "B", name: "AI Proposal Flow", batch: "B4/B5",
                request: `GET /api/v1/ai-mapping-proposals\n?entityId=ENT-10019\n&reportingPeriodId=RP-2024-Q4\n&normalizedRecordId=NR-77201`,
                response: `{\n  "proposals": [\n    {\n      "proposalId": "PROP-33401",\n      "normalizedRecordId": "NR-77201",\n      "firmTaxonomyId": "FT-2024-CORP",\n      "taxTaxonomyAccountCode": "4100-REVENUE",\n      "confidenceScore": 0.94,\n      "confidenceBand": "EXACT",\n      "status": "Pending Review"\n    }\n  ]\n}`,
                lineage: "NormalizedRecordId → ProposalId → FirmTaxonomyId",
                required: ["entityId", "reportingPeriodId"],
                downstream: "POST /api/v1/review-tasks (assign to practitioner)",
                next: "Step 4 — Submit proposal decision after practitioner review",
              },
              {
                id: "C", name: "Mapping Decision Flow", batch: "B6",
                request: `POST /api/v1/proposal-decisions\n{\n  "proposalId": "PROP-33401",\n  "reviewTaskId": "RT-99102",\n  "decision": "ACCEPTED",\n  "decidedBy": "user@rsm.com",\n  "decidedAt": "2026-05-21T14:30:00Z"\n}`,
                response: `{\n  "decisionId": "DEC-44501",\n  "proposalId": "PROP-33401",\n  "decision": "ACCEPTED",\n  "status": "Immutable",\n  "taxReadyEligible": true\n}`,
                lineage: "ProposalId → DecisionId",
                required: ["proposalId", "reviewTaskId", "decision", "decidedBy", "decidedAt"],
                downstream: "GET /api/v1/tax-ready-records?entityId=ENT-10019",
                next: "Step 5 — Retrieve tax-ready records once all proposals decided",
              },
              {
                id: "D", name: "Tax Ready Record Flow", batch: "B7",
                request: `GET /api/v1/tax-ready-records\n?entityId=ENT-10019\n&reportingPeriodId=RP-2024-Q4`,
                response: `{\n  "taxReadyRecords": [\n    {\n      "taxReadyRecordId": "TRR-66701",\n      "entityId": "ENT-10019",\n      "reportingPeriodId": "RP-2024-Q4",\n      "decisionId": "DEC-44501",\n      "status": "Tax Ready",\n      "taxReadyDate": "2026-05-21T15:00:00Z"\n    }\n  ]\n}`,
                lineage: "DecisionId → TaxReadyRecordId",
                required: ["entityId", "reportingPeriodId"],
                downstream: "GET /api/v1/tax-form-lines?taxReadyRecordId=TRR-66701",
                next: "Step 6 — Resolve form lines for practitioner review rendering",
              },
              {
                id: "E", name: "Review Task Flow", batch: "B6",
                request: `POST /api/v1/review-tasks\n{\n  "proposalId": "PROP-33401",\n  "entityId": "ENT-10019",\n  "assignedUserId": "USR-12345",\n  "dueDate": "2026-05-28T00:00:00Z"\n}`,
                response: `{\n  "reviewTaskId": "RT-99102",\n  "proposalId": "PROP-33401",\n  "assignedUserId": "USR-12345",\n  "status": "Open",\n  "dueDate": "2026-05-28T00:00:00Z"\n}`,
                lineage: "ProposalId → ReviewTaskId",
                required: ["proposalId", "entityId", "assignedUserId"],
                downstream: "POST /api/v1/proposal-decisions (after review complete)",
                next: "Step 4 — Submit decision after practitioner completes review",
              },
            ].map(({ id, name, batch, request, response, lineage, required, downstream, next }) => (
              <div key={id} className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: "#0e7490" }}>{id}</span>
                  <span className="text-sm font-bold text-[#003865]">{name}</span>
                  <span className="text-xs px-2 py-0.5 rounded font-semibold ml-auto" style={{ background: "#d1fae5", color: "#065f46" }}>{batch}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Request</p>
                    <pre className="text-xs font-mono bg-slate-900 text-green-400 rounded p-2.5 overflow-x-auto whitespace-pre-wrap">{request}</pre>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1.5">Response</p>
                    <pre className="text-xs font-mono bg-slate-900 text-blue-300 rounded p-2.5 overflow-x-auto whitespace-pre-wrap">{response}</pre>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-slate-100 border-t border-slate-100">
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">ID Lineage</p>
                    <p className="text-xs font-mono text-slate-600">{lineage}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Required Fields</p>
                    {required.map(f => <p key={f} className="text-xs font-mono text-red-700">{f}</p>)}
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Downstream API</p>
                    <p className="text-xs font-mono text-blue-700">{downstream}</p>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Next Step</p>
                    <p className="text-xs text-slate-600">{next}</p>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 7 — Consumer Integration Test Dataset                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="test-dataset">
          <Section id="s7" title="7 — Consumer Integration Test Dataset" badge="QA / Testing" badgeColor="#059669">
            <p className="text-sm text-slate-600 mb-3">
              The following known integration validation dataset allows Roger and future consumers to validate
              joins, lineage traversal, UI rendering, pagination, and relationship chaining against a known
              authoritative state.
            </p>

            <Callout type="info" title="Known Integration Validation Dataset — Purpose">
              Use these values to validate that your consumer implementation correctly resolves the full lineage
              chain from DocumentId through to TaxReadyRecordId. All IDs are authoritative test values — do not
              modify or substitute them in validation scenarios.
            </Callout>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Known Test Entity</p>
                <div className="space-y-2">
                  {[
                    { label: "Client", value: "RSM Test Client — CATT Integration Validation" },
                    { label: "ClientId", value: "CLT-00042" },
                    { label: "EntityId", value: "ENT-10019" },
                    { label: "ReportingPeriodId", value: "RP-2024-Q4" },
                    { label: "FirmTaxonomyId", value: "FT-2024-CORP" },
                    { label: "DocumentId", value: "DOC-55310" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                      <span className="text-xs font-mono font-semibold text-[#003865] bg-white px-2 py-0.5 rounded border border-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Known Lineage Chain</p>
                <div className="space-y-2">
                  {[
                    { label: "ProposalId", value: "PROP-33401" },
                    { label: "DecisionId", value: "DEC-44501" },
                    { label: "TaxReadyRecordId", value: "TRR-66701" },
                    { label: "TaxFormId", value: "TF-88801" },
                    { label: "TaxFormLineId", value: "TFL-99201" },
                    { label: "ReviewTaskId", value: "RT-99102" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 w-36 shrink-0">{label}</span>
                      <span className="text-xs font-mono font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DataTable
              headers={["Validation Scenario", "IDs Required", "Expected Result", "Validates"]}
              rows={[
                ["Lineage traversal — full chain", "EntityId + ReportingPeriodId", "DocumentId → NormalizedRecordId → ProposalId → DecisionId → TaxReadyRecordId all resolve", "ID chain integrity"],
                ["Proposal retrieval", "EntityId + ReportingPeriodId + NormalizedRecordId", "PROP-33401 returned with EXACT confidence band (0.94)", "Proposal API + confidence scoring"],
                ["Decision immutability", "ProposalId PROP-33401", "DEC-44501 returned with status=Immutable. PUT/PATCH rejected with 409.", "Immutability enforcement"],
                ["Tax-ready state", "EntityId + ReportingPeriodId", "TRR-66701 returned with status=Tax Ready", "Tax-ready record resolution"],
                ["Form line resolution", "TaxReadyRecordId TRR-66701", "TFL-99201 returned with TaxTaxonomyAccountCode=4100-REVENUE", "Form line derivation"],
                ["Eligibility gate", "EntityId ENT-10019", "Entity in ELIGIBLE state — downstream APIs accessible", "Eligibility gate enforcement"],
                ["Pagination", "GET /api/v1/data-records?entityId=ENT-10019&pageSize=10", "First page of 10 records returned with continuation token", "Pagination + continuation token"],
                ["Review task assignment", "ProposalId PROP-33401", "RT-99102 returned with status=Open, assignedUserId=USR-12345", "Review task creation + assignment"],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 8 — API Maturity & Stability Matrix                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="maturity-matrix">
          <Section id="s8" title="8 — API Maturity & Stability Matrix" badge="Stability" badgeColor="#003865">
            <p className="text-sm text-slate-600 mb-3">
              The following matrix classifies each API endpoint by maturity and stability status.
              Consumers should only integrate against <strong>Stable</strong> or <strong>MVP</strong> endpoints
              for production-bound work. Experimental and Future PI endpoints are subject to breaking changes.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { label: "Stable", color: "#059669", bg: "#d1fae5", desc: "Production-safe. No breaking changes without versioning." },
                { label: "MVP", color: "#1e40af", bg: "#dbeafe", desc: "Approved for 9/16 pilot. Stable within MVP scope." },
                { label: "Experimental", color: "#d97706", bg: "#fef3c7", desc: "Subject to change. Do not use for production integrations." },
                { label: "Future PI", color: "#6b7280", bg: "#f3f4f6", desc: "Not yet available. Planned for post-MVP delivery." },
                { label: "Internal Only", color: "#dc2626", bg: "#fee2e2", desc: "Not exposed to consumers. DCT internal use only." },
              ].map(({ label, color, bg, desc }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: bg, color }}>
                  <span className="font-bold">{label}</span>
                  <span className="text-xs opacity-70">— {desc}</span>
                </div>
              ))}
            </div>

            <DataTable
              headers={["Endpoint", "System", "Status", "Stability", "Consumer Safe", "PI Scope", "Notes"]}
              rows={[
                ["POST /api/v1/Ingestion", "PDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1", "Lineage anchor. DocumentId issued here."],
                ["GET /api/v1/data-records", "PDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1/2", "Primary normalized record retrieval."],
                ["GET /api/v1/firm-taxonomy", "TDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1", "FirmTaxonomyId resolution."],
                ["GET /api/v1/ai-mapping-proposals", "TDC/Orch", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 1/2", "Proposal retrieval with confidence scoring."],
                ["POST /api/v1/proposal-decisions", "TDC", <Badge label="Stable" color="#059669" />, "Locked", "Yes", "PI 2", "Immutable decision submission."],
                ["GET /api/v1/tax-ready-records", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2", "Terminal lineage output."],
                ["GET /api/v1/tax-form-lines", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2/3", "Form line derivation from TaxReadyRecordId."],
                ["POST /api/v1/review-tasks", "TDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2", "Review task creation and assignment."],
                ["GET /api/v1/exceptions", "TDC+PDC", <Badge label="MVP" color="#003865" />, "Stable within MVP", "Yes", "PI 2 (B8)", "Exception identification surface."],
                ["POST /api/v1/remedy-actions", "TDC", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B8)", "Remediation workflow — in progress."],
                ["GET /api/v1/gateway/ims/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "IMS pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/gateway/cem/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "CEM pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/gateway/tim/*", "PDC Gateway", <Badge label="MVP" color="#003865" />, "In progress", "Pending", "PI 2 (B9)", "TIM pass-through via Ocelot. B9 in progress."],
                ["GET /api/v1/engagement-identity", "TDC", <Badge label="Experimental" color="#d97706" />, "Subject to change", "No", "PI 3 (B12)", "EngagementId issuance — B12 scope."],
                ["GET /api/v1/rollforward", "TDC", <Badge label="Future PI" color="#6b7280" />, "Not available", "No", "PI 3+ (B31)", "Legacy tool carry-forward. B31 scope."],
                ["POST /api/v1/eods/*", "PDC", <Badge label="Future PI" color="#6b7280" />, "Not available", "No", "TBD", "eODS deferred. Gated on IMS readiness."],
                ["GET /api/v1/processing-runs/internal", "PDC", <Badge label="Internal Only" color="#dc2626" />, "Internal", "No", "All", "Internal processing state. Not for consumers."],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 9 — Known Consumer Enhancement Requests                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="enhancements">
          <Section id="s9" title="9 — Known Consumer Enhancement Requests" badge="Backlog" badgeColor="#d97706">
            <Callout type="info" title="Enhancement Request Governance Note">
              These items represent consumer enhancement requests and do not indicate absence of governed contracts.
              All current governed contracts are complete and consumer-safe. Enhancement requests are tracked for
              future PI consideration and are subject to architecture review before acceptance.
            </Callout>

            <DataTable
              headers={["Request", "Requested By", "Category", "Current State", "Priority", "Status", "Notes"]}
              rows={[
                ["Reverse lookup endpoint — resolve EntityId from TaxReadyRecordId", "Roger", "API Design", "Not available — forward traversal only", "High", <Badge label="Under Review" color="#d97706" />, "Architecture review required. Lineage direction is forward-only by design."],
                ["Schedule field enrichment on ReviewTask", "Roger", "Field Enrichment", "DueDate available. Recurrence/schedule not modeled.", "Medium", <Badge label="Backlogged" color="#6b7280" />, "Requires TDC data model extension. PI 3 candidate."],
                ["Pagination metadata improvements — total count + page info", "Roger", "Pagination", "Continuation token available. Total count not returned.", "High", <Badge label="Under Review" color="#d97706" />, "Total count adds query cost. Architecture decision pending."],
                ["Continuation token support on all list endpoints", "Roger", "Pagination", "Available on some endpoints. Not universal.", "Medium", <Badge label="In Progress" color="#003865" />, "Being standardized across all list endpoints in B10/B11."],
                ["Consumer convenience API — single-call entity summary", "Roger", "Consumer API", "Not available — requires multi-step traversal", "Low", <Badge label="Future PI" color="#6b7280" />, "Would aggregate EntityId + proposals + decisions + tax-ready in one call. Post-MVP."],
                ["Bulk proposal decision submission", "Roger", "Performance", "Single decision per call only", "Medium", <Badge label="Backlogged" color="#6b7280" />, "Batch decision endpoint not in current scope. PI 3+ candidate."],
                ["Proposal confidence band filter on list endpoint", "Roger", "Filtering", "Confidence score returned but not filterable", "Low", <Badge label="Backlogged" color="#6b7280" />, "Add ?confidenceBand=EXACT filter param. Low complexity."],
                ["TaxFormLine → source NormalizedRecord reverse link", "Roger", "Lineage", "Forward chain only. Reverse not available.", "Medium", <Badge label="Under Review" color="#d97706" />, "Useful for practitioner drill-down. Architecture review required."],
              ]}
            />
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 10 — Governance Boundaries                             */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="gov-boundaries">
          <Section id="s10" title="10 — Governance Boundaries" badge="Ownership" badgeColor="#4c1d95">
            <p className="text-sm text-slate-600 mb-4">
              The following ownership matrix defines the authoritative boundary between DCT (PDC + TDC + Orchestrator)
              and Roger for every platform capability. This matrix is the governance reference for all scope
              discussions, ADO feature assignments, and PI planning decisions.
            </p>

            <DataTable
              headers={["Capability", "DCT Ownership", "Roger Ownership", "Shared Responsibility"]}
              rows={[
                ["Taxonomy governance", "TDC owns FirmTaxonomy, TaxTaxonomyAccount definitions. Immutable once published.", "Roger renders taxonomy labels. No write access.", "—"],
                ["Lineage", "DCT issues all lineage IDs. Lineage chain is authoritative and immutable.", "Roger traverses lineage chain. Does not modify or extend it.", "—"],
                ["Tax-ready outputs", "TDC determines tax-ready state. TaxReadyRecordId is the authoritative terminal output.", "Roger reads and renders tax-ready records. No write access.", "—"],
                ["UI orchestration", "—", "Roger owns all UI composition, page layout, navigation, and rendering decisions.", "—"],
                ["Workflow composition", "DCT defines workflow states (Open, Decided, Tax Ready, Signed Off).", "Roger composes UI workflows from DCT state. Roger does not define states.", "Roger may add consumer-side workflow steps that do not modify DCT state."],
                ["Paging behavior", "DCT provides continuation tokens and optional page size.", "Roger owns paging strategy, scroll behavior, and load-more UX.", "DCT and Roger align on continuation token contract."],
                ["Caching", "—", "Roger owns all consumer-side caching. DCT does not cache on Roger's behalf.", "Roger must respect DCT cache-control headers."],
                ["Proposal rendering", "TDC issues proposals with confidence scores and bands.", "Roger owns proposal card layout, sorting, and display logic.", "Roger must not modify confidence scores or bands in rendering."],
                ["Validation", "DCT validates all inbound data against governed schemas. Rejects invalid payloads.", "Roger validates consumer-side form inputs before submission.", "Both validate — DCT is the final authority."],
                ["Presentation logic", "—", "Roger owns all presentation logic, theming, and UX decisions.", "—"],
                ["Error handling", "DCT returns structured error responses (HTTP 400/403/404/409/422).", "Roger owns consumer-side error display and recovery UX.", "Both must implement error handling. DCT errors are authoritative."],
                ["Authentication", "PDC Gateway (B9) handles auth routing via Ocelot.", "Roger handles consumer-side token management and refresh.", "CEM pass-through via gateway handles user mapping."],
              ]}
            />

            <Callout type="boundary" title="Scope Drift Prevention">
              Any capability not listed under Roger Ownership above is owned by DCT. If a Roger team member
              requests a DCT change to support a Roger UI behavior, that request must be evaluated against
              this boundary matrix before acceptance. Consumer UI requirements do not drive DCT contract changes.
            </Callout>
          </Section>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 11 — Open Questions / Pending Decisions                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div id="open-questions">
          <Section id="s11" title="11 — Open Questions / Pending Decisions" badge="Action Required" badgeColor="#dc2626">
            <p className="text-sm text-slate-600 mb-3">
              The following items are unresolved integration questions, pending architecture decisions, and
              future PI considerations that require PO, architecture, or engineering input before proceeding.
            </p>

            <DataTable
              headers={["#", "ADO Feature", "Question / Decision", "Category", "Owner", "Priority", "Status", "Target Resolution"]}
              rows={[
                ["1",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-IMS-Gate</a>,
                  "What is the IMS API contract readiness date? Does B10 gate need to be split into B10-core (proceed) and B10-IMS (hold)?", "Architecture Decision", "PO + IMS Team", "Critical", <Badge label="Open" color="#dc2626" />, "Before B10 gate sign-off"],
                ["2",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B12-Scope</a>,
                  "B12 manual write surface was dropped per Roadmap v4. Was this a formal ADO scope change or an informal decision? Needs documented scope change record.", "Governance Record", "BA + PO", "High", <Badge label="Open" color="#dc2626" />, "Before B12 sprint start"],
                ["3",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B28-MVP</a>,
                  "Which specific stories from B14 and B15 are absorbed into B28? Roadmap v4 names reconciliation formulas and depreciation rule definitions — are these the complete MVP slices?", "Scope Boundary", "PO + Architecture", "High", <Badge label="Open" color="#dc2626" />, "Before B28 sprint start"],
                ["4",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B39-MVP</a>,
                  "B39 (Calculation Report) is promoted to MVP with a hard 9/16 date. Is TDC engineering capacity confirmed for this promotion given existing PI 3 load?", "Resourcing", "PO + Engineering", "Critical", <Badge label="Open" color="#dc2626" />, "PI 3 planning"],
                ["5",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-API-Rev</a>,
                  "Reverse lookup endpoint (EntityId from TaxReadyRecordId) — is this a governance-safe operation or does it violate the forward-only lineage principle?", "Architecture Decision", "Architecture", "Medium", <Badge label="Under Review" color="#d97706" />, "PI 3 planning"],
                ["6",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-Paging</a>,
                  "Pagination total count — does returning total count on list endpoints create unacceptable query cost at scale? What is the acceptable performance threshold?", "Performance", "Engineering", "Medium", <Badge label="Under Review" color="#d97706" />, "B10/B11 sprint"],
                ["7",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-ConvAPI</a>,
                  "Consumer convenience API (single-call entity summary) — is this a DCT responsibility or should Roger aggregate via multiple calls?", "Boundary Decision", "Architecture + Roger", "Low", <Badge label="Future PI" color="#6b7280" />, "Post-MVP PI planning"],
                ["8",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-eODS</a>,
                  "eODS integration — what is the current IMS readiness date that gates eODS? Is there a provisional PI 4 slot for eODS if IMS readiness is confirmed?", "Dependency Risk", "Architecture + IMS", "Medium", <Badge label="Watching" color="#6b7280" />, "PI 4 planning"],
                ["9",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-B9-Contract</a>,
                  "B9 PDC Gateway Read Contract — what is the publication date for the versioned consumer surface? Roger cannot begin gateway integration without this contract.", "Contract Publication", "PDC + BA", "High", <Badge label="Open" color="#dc2626" />, "B9 gate sign-off"],
                ["10",
                  <a href="https://dev.azure.com/RSMEquiCo/CATT/_workitems/edit/" target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-[#003865] underline hover:text-blue-700" title="Open ADO Feature">F-GW-Ver</a>,
                  "Roger consumer surface versioning — how will the gateway version the IMS/CEM/TIM pass-through surfaces as underlying systems evolve?", "Architecture Decision", "Architecture", "Medium", <Badge label="Open" color="#dc2626" />, "B9 gate sign-off"],
              ]}
            />

            <Callout type="warning" title="Escalation Path">
              Items marked <strong>Critical</strong> or <strong>High</strong> with status <strong>Open</strong> require
              immediate PO or architecture review. These items are blocking downstream delivery or gate sign-off.
              Unresolved items should be raised in the next PI planning session or architecture review meeting.
            </Callout>
          </Section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 mt-4 pt-4 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Version + source metadata */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#003865", color: "#fff" }}>
                  {HUB_VERSION}
                </span>
                <span className="text-xs text-slate-500">Consumer Integration Readiness Hub</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <FileText className="w-3 h-3" />
                <span>Source: <span className="font-semibold text-slate-600">{HUB_SOURCE}</span></span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Last updated: <span className="font-semibold text-slate-600">{HUB_UPDATED}</span></span>
              </div>
              <div className="text-xs text-slate-400">
                Author: <span className="font-semibold text-slate-600">{HUB_AUTHOR}</span>
              </div>
            </div>
            {/* Quick links */}
            <div className="flex items-center gap-3 text-xs">
              <Link href="/control-panel" className="text-[#003865] hover:underline">Control Panel</Link>
              <span className="text-slate-300">·</span>
              <Link href="/roger-consumer-readiness" className="text-[#003865] hover:underline">Consumer Readiness Center</Link>
              <span className="text-slate-300">·</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-[#003865] hover:underline"
              >
                <Printer className="w-3 h-3" />
                Export PDF
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            DCT Platform · CATT · RSM US LLP · This document is authoritative as of {HUB_UPDATED} and reflects {HUB_SOURCE} as the governing source of truth.
            ADO Feature IDs are placeholders — update with actual ADO work item numbers before distributing.
          </p>
        </div>

      </div>
    </div>
  );
}
