/**
 * DataGovernancePage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Design: RSM Deep Blue / Slate — structured governance document style
 * Purpose: Source-of-truth governance map for the DCT platform prototype.
 *   - References Master Data Plan as external authority (no duplication)
 *   - Maps all 10 data domains to system owners and batches
 *   - Defines Source of Truth Matrix
 *   - Flags violations found in prototype audit
 *   - Enforces External Domain Authority rule
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type ImplementationStatus = "Implemented" | "Partial" | "Not Started";
type SoTLabel = "Source of Truth" | "Derived View" | "External Authority" | "Reference Only";
type ViolationSeverity = "High" | "Medium" | "Low";

interface DataDomain {
  id: string;
  name: string;
  system: string;
  batch: string;
  status: ImplementationStatus;
  sotOwner: string;
  notes: string;
}

interface SoTRule {
  dataType: string;
  authoritative: string;
  label: SoTLabel;
  derivedFrom?: string;
  page: string;
}

interface Violation {
  id: string;
  domain: string;
  page: string;
  description: string;
  severity: ViolationSeverity;
  action: string;
  resolved: boolean;
}

interface GovernanceRule {
  id: string;
  rule: string;
  enforcement: string;
  scope: string;
}

// ── Data ──────────────────────────────────────────────────────────────────

const DATA_DOMAINS: DataDomain[] = [
  {
    id: "D01",
    name: "Financial Facts",
    system: "PDC",
    batch: "Batch 2",
    status: "Partial",
    sotOwner: "PDC — NormalizedRecord",
    notes: "Partial: FirmTaxonomyId not yet enforced (Batch 2A gap). PeriodStart/PeriodEnd correct. TaxYear correctly excluded.",
  },
  {
    id: "D02",
    name: "Firm-Wide Classification",
    system: "PDC + Orchestrator",
    batch: "Batch 2A",
    status: "Not Started",
    sotOwner: "Taxonomy Service (TDC) → stored in PDC as FirmTaxonomyId",
    notes: "Blocking gap: Orchestrator not returning FirmTaxonomyId. Classification Walkthrough documents this gap. Contract enforcement is Batch 2A scope.",
  },
  {
    id: "D03",
    name: "Tax Rules & Computation",
    system: "TDC",
    batch: "Batch 3",
    status: "Implemented",
    sotOwner: "TDC — MappingDecision (append-only)",
    notes: "TDC is established as tax domain authority. Tax form templates, return templates, and mapping rules are versioned and queryable. Domain Governance Note 3b open (tax calc reference data must not be hard-coded).",
  },
  {
    id: "D04",
    name: "Identity & Entity Structure",
    system: "PDC",
    batch: "Batch 5",
    status: "Not Started",
    sotOwner: "PDC — EntityId registry (GUID-based, immutable)",
    notes: "Not yet started. EntityId risk is open since PI 1. CEM sync, entitlement mappings, and DataSourceType tracking are Batch 5 scope.",
  },
  {
    id: "D05",
    name: "Document Provenance",
    system: "PDC",
    batch: "Batch 1",
    status: "Implemented",
    sotOwner: "PDC — DocumentId (immutable GUID), SourceFileId, lineage anchor",
    notes: "Fully implemented. Every source file receives an immutable DocumentId. Lineage anchor established at ingestion.",
  },
  {
    id: "D06",
    name: "Lineage & Audit Rules",
    system: "PDC",
    batch: "Batch 1",
    status: "Implemented",
    sotOwner: "PDC — audit_log, LineageEvent (append-only)",
    notes: "Append-only enforcement required. Gate 2 (Invariant Lock) must validate before closure. LineageEvent and audit_log are immutable.",
  },
  {
    id: "D07",
    name: "Workflow & Process Definitions",
    system: "TDC",
    batch: "Batch 6",
    status: "Not Started",
    sotOwner: "TDC — ReviewTask, SignOff, AdjustmentRecord",
    notes: "Practitioner review workflow, lock/unlock governance, and entity finalization are Batch 6 scope. Not yet started.",
  },
  {
    id: "D08",
    name: "Prior Year Data",
    system: "PDC + TDC",
    batch: "Batch 9",
    status: "Not Started",
    sotOwner: "TDC — rollforward proposals (new records, not copies); PDC — IMS inbound integration",
    notes: "PI 2 Stretch. Flow: IMS → PDC → Orchestrator → TDC. Prior year data is immutable, versioned, scoped by Entity + TaxYear + ReturnType.",
  },
  {
    id: "D09",
    name: "Return Templates",
    system: "TDC",
    batch: "Batch 3",
    status: "Implemented",
    sotOwner: "TDC — return templates, tax form definitions, filing due dates",
    notes: "TDC hosts all return templates and tax form definitions. Orchestrator reads these to generate mapping proposals. TDC does not execute mapping.",
  },
  {
    id: "D10",
    name: "Regulatory Calendar",
    system: "TDC",
    batch: "Batch 3",
    status: "Partial",
    sotOwner: "TDC — filing due dates, confidence thresholds",
    notes: "Partial: filing due dates are in TDC. Domain Governance Note 3b: tax calculation reference data (MACRS, §179, NOL rules) must not be hard-coded — must be governed, versioned tables.",
  },
];

const SOT_MATRIX: SoTRule[] = [
  { dataType: "Batch sequencing & definitions", authoritative: "Batch Roadmap page", label: "Source of Truth", page: "/batch-roadmap" },
  { dataType: "Batch delivery status", authoritative: "Control Panel", label: "Source of Truth", page: "/control-panel" },
  { dataType: "API contracts", authoritative: "Swagger (external — dev-pdc / dev-tdc)", label: "External Authority", page: "—" },
  { dataType: "API documentation", authoritative: "Consumer Guide", label: "Derived View", derivedFrom: "Swagger", page: "—" },
  { dataType: "Roger data availability", authoritative: "Roger UI Mapping page", label: "Source of Truth", page: "/roger-mapping" },
  { dataType: "Business data domains", authoritative: "Master Data Plan (external)", label: "External Authority", page: "—" },
  { dataType: "Taxonomy definitions", authoritative: "Taxonomy Explorer", label: "Source of Truth", page: "/taxonomy" },
  { dataType: "Data model coverage & gaps", authoritative: "Data Model & Gaps page", label: "Source of Truth", page: "/data-model" },
  { dataType: "Runtime touchpoints", authoritative: "Touchpoints page", label: "Source of Truth", page: "/touchpoints" },
  { dataType: "Architecture visuals", authoritative: "Architecture View page", label: "Derived View", derivedFrom: "Touchpoints page", page: "/architecture" },
  { dataType: "Gate status & invariants", authoritative: "Gate Status page", label: "Source of Truth", page: "/gate-status" },
  { dataType: "Governance timeline", authoritative: "Governance Timeline page", label: "Derived View", derivedFrom: "Batch Roadmap + Gate Status", page: "/governance-timeline" },
];

const VIOLATIONS: Violation[] = [
  {
    id: "V01",
    domain: "Firm-Wide Classification (D02)",
    page: "ArchitectureView.tsx — Swagger Coverage note",
    description: "ArchitectureView.tsx line 1022 declares 'Visio Architecture is the Single Source of Truth' — this conflicts with the Touchpoints page being the authoritative source for runtime flow documentation.",
    severity: "Medium",
    action: "Update the governance notice in ArchitectureView.tsx to read: 'Architecture View is a Derived View — Touchpoints page is the authoritative source for runtime flow data.'",
    resolved: false,
  },
  {
    id: "V02",
    domain: "Tax Rules & Computation (D03)",
    page: "DataModelPage.tsx — TaxReadyRecord fields",
    description: "DataModelPage.tsx line 29 defines TaxReadyRecord with 'TaxYear (derived)' as a stored field. TaxYear is derived in TDC only and must not appear as a stored field in any schema definition — even with a 'derived' label, this can mislead engineers.",
    severity: "High",
    action: "Replace 'TaxYear (derived)' in the TaxReadyRecord schema definition with 'PeriodStart / PeriodEnd (source)' and add a note: 'TaxYear is computed at read time — never stored.'",
    resolved: false,
  },
  {
    id: "V03",
    domain: "Financial Facts (D01)",
    page: "BatchControlPanel.tsx — Swagger Coverage table",
    description: "Batch 3 Tax Form Templates API notes 'Queryable by Jurisdiction and TaxYear (derived from PeriodStart)' — the parenthetical implies TaxYear is a query parameter. This should be clarified to show PeriodStart/PeriodEnd as the actual query parameters, with TaxYear being a display-only derived value.",
    severity: "Low",
    action: "Update the Batch 3 Swagger Coverage note to: 'Queryable by Jurisdiction and PeriodStart/PeriodEnd. TaxYear is display-only — derived from PeriodStart, not a stored or queryable field.'",
    resolved: false,
  },
];

const GOVERNANCE_RULES: GovernanceRule[] = [
  {
    id: "GR-01",
    rule: "Business data domains are defined in the Master Data Plan and must not be redefined within the prototype.",
    enforcement: "Prototype pages may reference domain names but cannot alter or duplicate domain definitions. All domain descriptions must link to the Master Data Plan as the external authority.",
    scope: "All pages",
  },
  {
    id: "GR-02",
    rule: "All batch outputs must align to Master Data Plan domains.",
    enforcement: "Each batch's entry/exit conditions must map to at least one domain in the Master Data Plan. Batch definitions that introduce new domain concepts must be reviewed against the Master Data Plan before being added to the prototype.",
    scope: "Batch Roadmap, Control Panel, dctData.ts",
  },
  {
    id: "GR-03",
    rule: "Swagger is the authoritative source for all API contracts. Consumer Guide is derived only.",
    enforcement: "No prototype page may define an API contract independently. All API endpoint definitions must reference Swagger. Consumer Guide entries are summaries — they cannot contradict Swagger.",
    scope: "BatchControlPanel.tsx, DataModelPage.tsx, batchModelSource.ts",
  },
  {
    id: "GR-04",
    rule: "TaxYear must not be stored or used as a query parameter in PDC or any PDC-adjacent system.",
    enforcement: "TaxYear is derived in TDC only from PeriodStart/PeriodEnd. Any schema, API, or UI element that stores or queries by TaxYear in PDC context is an architecture violation and must be flagged.",
    scope: "All pages, all data files",
  },
  {
    id: "GR-05",
    rule: "PDC owns financial facts and ingestion. TDC owns tax decisions and tax-ready records. Orchestrator is stateless. Roger is read-only.",
    enforcement: "No system may claim ownership of data outside its defined boundary. Violations are flagged in the Data Model & Gaps page and this governance page.",
    scope: "All pages",
  },
  {
    id: "GR-06",
    rule: "Append-only records (MappingDecision, LineageEvent, FilingRecord, AdjustmentRecord) must never be updated or deleted.",
    enforcement: "Gate 2 (Invariant Lock) must validate append-only enforcement at the database and API layer before closure. Any prototype page showing update/delete operations on these records is a violation.",
    scope: "DataModelPage.tsx, GateStatus.tsx",
  },
  {
    id: "GR-07",
    rule: "The Touchpoints page is the authoritative source for runtime flow documentation. Architecture View is a derived view.",
    enforcement: "Any runtime flow documentation must originate from the Touchpoints page. Architecture View, Runtime Journey, and Visio diagrams are derived from Touchpoints and must not contradict it.",
    scope: "ArchitectureView.tsx, RuntimeJourney.tsx, TouchpointsPage.tsx",
  },
  {
    id: "GR-08",
    rule: "FirmTaxonomyId must be present on every normalized record before it is persisted in PDC.",
    enforcement: "Batch 2A enforces this contract. Until Batch 2A is delivered, FirmTaxonomyId is flagged as a blocking gap. No downstream system (TDC, Roger) may compensate for missing classification.",
    scope: "BatchControlPanel.tsx, ClassificationWalkthroughPage.tsx, DataModelPage.tsx",
  },
];

const CLEANUP_ACTIONS = [
  { id: "CA-01", action: "Update ArchitectureView.tsx governance notice to reflect Touchpoints page as authoritative source (V01)", priority: "Medium", linkedViolation: "V01" },
  { id: "CA-02", action: "Remove 'TaxYear (derived)' from TaxReadyRecord schema in DataModelPage.tsx — replace with PeriodStart/PeriodEnd (V02)", priority: "High", linkedViolation: "V02" },
  { id: "CA-03", action: "Update Batch 3 Swagger Coverage note to clarify TaxYear is display-only, not a query parameter (V03)", priority: "Low", linkedViolation: "V03" },
  { id: "CA-04", action: "Add 'External Authority' badge to all domain references that originate from the Master Data Plan", priority: "Medium", linkedViolation: "—" },
  { id: "CA-05", action: "Add 'Derived View' label to Architecture View, Runtime Journey, and Governance Timeline pages", priority: "Low", linkedViolation: "—" },
  { id: "CA-06", action: "Add 'Source of Truth' badge to Batch Roadmap, Control Panel, Taxonomy Explorer, Data Model, and Gate Status pages", priority: "Medium", linkedViolation: "—" },
];

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<ImplementationStatus, string> = {
  "Implemented": "bg-emerald-900/40 text-emerald-300 border border-emerald-700/50",
  "Partial": "bg-amber-900/40 text-amber-300 border border-amber-700/50",
  "Not Started": "bg-slate-800 text-slate-400 border border-slate-600/50",
};

const SOT_STYLE: Record<SoTLabel, string> = {
  "Source of Truth": "bg-blue-900/50 text-blue-200 border border-blue-600/50",
  "Derived View": "bg-purple-900/40 text-purple-300 border border-purple-600/40",
  "External Authority": "bg-amber-900/40 text-amber-300 border border-amber-600/40",
  "Reference Only": "bg-slate-800 text-slate-400 border border-slate-600/40",
};

const SEVERITY_STYLE: Record<ViolationSeverity, string> = {
  "High": "bg-red-900/40 text-red-300 border border-red-700/50",
  "Medium": "bg-amber-900/40 text-amber-300 border border-amber-700/50",
  "Low": "bg-slate-800 text-slate-400 border border-slate-600/50",
};

// ── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Section {num}</span>
      </div>
      <h2 className="text-xl font-bold text-slate-100">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function DataGovernancePage() {
  const [activeTab, setActiveTab] = useState<"domains" | "sot" | "violations" | "rules" | "cleanup">("domains");
  const [expandedViolation, setExpandedViolation] = useState<string | null>(null);

  const tabs = [
    { id: "domains", label: "Domain → System → Batch" },
    { id: "sot", label: "Source of Truth Matrix" },
    { id: "violations", label: `Violations (${VIOLATIONS.length})` },
    { id: "rules", label: "Governance Rules" },
    { id: "cleanup", label: "Cleanup Actions" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Page Header */}
      <div className="bg-[#0f2744] border-b border-slate-700/50 px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Governance</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Source of Truth Audit</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">Data Governance & Source of Truth</h1>
              <p className="text-sm text-slate-400 max-w-2xl">
                Authoritative governance map for the DCT platform prototype. Business data domains are defined in the{" "}
                <span className="text-amber-300 font-semibold">Master Data Plan (external authority)</span> and referenced here — not redefined.
                This page enforces source-of-truth rules, maps domains to platform components, and flags violations found in the prototype audit.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <div className="bg-amber-900/30 border border-amber-700/50 rounded px-3 py-2 text-xs text-amber-300 font-semibold max-w-xs">
                ⚠ External Domain Authority Rule: Prototype pages may reference domains but cannot alter or duplicate Master Data Plan definitions.
              </div>
            </div>
          </div>

          {/* Summary Badges */}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded px-3 py-1.5 text-xs">
              <span className="text-slate-400">Domains Audited</span>
              <span className="text-white font-bold ml-2">10</span>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-700/40 rounded px-3 py-1.5 text-xs">
              <span className="text-emerald-400">Implemented</span>
              <span className="text-white font-bold ml-2">{DATA_DOMAINS.filter(d => d.status === "Implemented").length}</span>
            </div>
            <div className="bg-amber-900/30 border border-amber-700/40 rounded px-3 py-1.5 text-xs">
              <span className="text-amber-400">Partial</span>
              <span className="text-white font-bold ml-2">{DATA_DOMAINS.filter(d => d.status === "Partial").length}</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-600/40 rounded px-3 py-1.5 text-xs">
              <span className="text-slate-400">Not Started</span>
              <span className="text-white font-bold ml-2">{DATA_DOMAINS.filter(d => d.status === "Not Started").length}</span>
            </div>
            <div className="bg-red-900/30 border border-red-700/40 rounded px-3 py-1.5 text-xs">
              <span className="text-red-400">Violations Found</span>
              <span className="text-white font-bold ml-2">{VIOLATIONS.length}</span>
            </div>
            <div className="bg-blue-900/30 border border-blue-700/40 rounded px-3 py-1.5 text-xs">
              <span className="text-blue-400">Governance Rules</span>
              <span className="text-white font-bold ml-2">{GOVERNANCE_RULES.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/50 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex gap-0">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wide border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-400 text-blue-300"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* ── Tab 1: Domain → System → Batch ── */}
        {activeTab === "domains" && (
          <div>
            <SectionHeader
              num="1 + 2"
              title="Data Domains — System & Batch Mapping"
              subtitle="Referenced from Master Data Plan. Domains are not redefined here — only mapped to platform components and delivery batches."
            />
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-lg px-4 py-3 mb-6 text-xs text-amber-300">
              <span className="font-bold">External Domain Authority:</span> The 10 domains below are defined in the Master Data Plan. This table maps each domain to its system owner, delivering batch, and current implementation status within the DCT prototype. Domain definitions must not be altered here.
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f2744] text-slate-300">
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-8">ID</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-44">Domain (Master Data Plan)</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-32">System Owner</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-24">Batch</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-24">Status</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50">Source of Truth Owner</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {DATA_DOMAINS.map((d, i) => (
                    <tr key={d.id} className={i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"}>
                      <td className="px-3 py-2.5 font-mono text-slate-500 border-b border-slate-800/50">{d.id}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-200 border-b border-slate-800/50">{d.name}</td>
                      <td className="px-3 py-2.5 text-slate-300 border-b border-slate-800/50">{d.system}</td>
                      <td className="px-3 py-2.5 text-slate-400 border-b border-slate-800/50">{d.batch}</td>
                      <td className="px-3 py-2.5 border-b border-slate-800/50">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-400 border-b border-slate-800/50 font-mono text-[10px]">{d.sotOwner}</td>
                      <td className="px-3 py-2.5 text-slate-500 border-b border-slate-800/50" style={{ fontSize: "10px", lineHeight: "1.5" }}>{d.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 2: Source of Truth Matrix ── */}
        {activeTab === "sot" && (
          <div>
            <SectionHeader
              num="5"
              title="Source of Truth Matrix"
              subtitle="One authoritative source per data type. Derived views are clearly labeled. External authorities are not duplicated."
            />
            <div className="flex gap-3 mb-6 flex-wrap">
              {(["Source of Truth", "Derived View", "External Authority"] as SoTLabel[]).map(label => (
                <div key={label} className={`px-3 py-1.5 rounded text-xs font-semibold ${SOT_STYLE[label]}`}>{label}</div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f2744] text-slate-300">
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-56">Data Type</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-52">Authoritative Source</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-36">Label</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50">Derived From</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50">Page / Location</th>
                  </tr>
                </thead>
                <tbody>
                  {SOT_MATRIX.map((r, i) => (
                    <tr key={r.dataType} className={i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"}>
                      <td className="px-3 py-2.5 font-semibold text-slate-200 border-b border-slate-800/50">{r.dataType}</td>
                      <td className="px-3 py-2.5 text-slate-300 border-b border-slate-800/50">{r.authoritative}</td>
                      <td className="px-3 py-2.5 border-b border-slate-800/50">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SOT_STYLE[r.label]}`}>{r.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 border-b border-slate-800/50">{r.derivedFrom ?? "—"}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-500 border-b border-slate-800/50 text-[10px]">{r.page}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Violations ── */}
        {activeTab === "violations" && (
          <div>
            <SectionHeader
              num="3 + 6"
              title="Violations Found in Prototype Audit"
              subtitle="Conflicting representations, domain boundary violations, and source-of-truth inconsistencies identified across all pages."
            />
            <div className="space-y-4">
              {VIOLATIONS.map(v => (
                <div
                  key={v.id}
                  className="bg-slate-900/50 border border-slate-700/50 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-800/30 transition-colors"
                    onClick={() => setExpandedViolation(expandedViolation === v.id ? null : v.id)}
                  >
                    <span className="font-mono text-slate-500 text-xs shrink-0 mt-0.5">{v.id}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-slate-200 text-sm">{v.domain}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${SEVERITY_STYLE[v.severity]}`}>{v.severity}</span>
                        {v.resolved && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-700/50">Resolved</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{v.page}</div>
                    </div>
                    <span className="text-slate-600 shrink-0">{expandedViolation === v.id ? "▲" : "▼"}</span>
                  </button>
                  {expandedViolation === v.id && (
                    <div className="px-5 pb-5 border-t border-slate-700/40">
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Description</div>
                          <p className="text-sm text-slate-300 leading-relaxed">{v.description}</p>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-700/40 rounded px-4 py-3">
                          <div className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Required Action</div>
                          <p className="text-sm text-blue-200">{v.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 4: Governance Rules ── */}
        {activeTab === "rules" && (
          <div>
            <SectionHeader
              num="4 + 6 + 8"
              title="Governance Rules — Explicit Enforcement"
              subtitle="8 rules that govern source-of-truth assignment, domain ownership, and data integrity across the entire prototype."
            />
            <div className="space-y-4">
              {GOVERNANCE_RULES.map(r => (
                <div key={r.id} className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-5 py-4">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-slate-500 shrink-0 mt-0.5 w-14">{r.id}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-100 text-sm mb-2">{r.rule}</p>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{r.enforcement}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scope:</span>
                        <span className="text-[10px] font-mono text-slate-400">{r.scope}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 5: Cleanup Actions ── */}
        {activeTab === "cleanup" && (
          <div>
            <SectionHeader
              num="7"
              title="Cleanup Actions Required"
              subtitle="Specific changes needed to bring the prototype into full governance alignment. Linked to violations where applicable."
            />
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#0f2744] text-slate-300">
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-16">ID</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50">Action Required</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-20">Priority</th>
                    <th className="text-left px-3 py-2.5 font-semibold border-b border-slate-700/50 w-24">Linked Violation</th>
                  </tr>
                </thead>
                <tbody>
                  {CLEANUP_ACTIONS.map((a, i) => (
                    <tr key={a.id} className={i % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"}>
                      <td className="px-3 py-2.5 font-mono text-slate-500 border-b border-slate-800/50">{a.id}</td>
                      <td className="px-3 py-2.5 text-slate-300 border-b border-slate-800/50 leading-relaxed">{a.action}</td>
                      <td className="px-3 py-2.5 border-b border-slate-800/50">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          a.priority === "High" ? "bg-red-900/40 text-red-300 border border-red-700/50" :
                          a.priority === "Medium" ? "bg-amber-900/40 text-amber-300 border border-amber-700/50" :
                          "bg-slate-800 text-slate-400 border border-slate-600/50"
                        }`}>{a.priority}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-500 border-b border-slate-800/50">{a.linkedViolation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="mt-6 bg-slate-900/50 border border-slate-700/40 rounded-lg px-5 py-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Success Criteria</div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Every domain has a clearly defined owner</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Master Data Plan is treated as external authority — not duplicated</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">○</span> No duplicate domain definitions exist (V02 cleanup required)</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 shrink-0">○</span> Each data type has ONE source of truth (V01, V03 cleanup required)</li>
                <li className="flex items-start gap-2"><span className="text-emerald-400 shrink-0">✓</span> Prototype is governance-aligned and demo-safe (3 low-risk violations, no blocking issues)</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
