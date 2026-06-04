// Tax Logic Repository Readiness — Rule Intake Assessment
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const REQUIRED_ATTRIBUTES = [
  { attribute: "RuleId", type: "UUID", required: true, description: "Immutable unique identifier assigned at first creation. Never changes.", sourceStatus: "Not in Krista workbook" },
  { attribute: "RuleName", type: "String", required: true, description: "Human-readable rule name. Used for display in Roger and TDC.", sourceStatus: "Present" },
  { attribute: "RuleVersion", type: "Integer", required: true, description: "Monotonically increasing version number. Starts at 1.", sourceStatus: "Not in Krista workbook" },
  { attribute: "EffectiveDate", type: "DateOnly", required: true, description: "Date from which this rule version is active. Derived from TaxYear via PeriodStart.", sourceStatus: "Partial" },
  { attribute: "ExpirationDate", type: "DateOnly", required: false, description: "Date after which this rule version is superseded. Null = currently active.", sourceStatus: "Not in Krista workbook" },
  { attribute: "Jurisdiction", type: "Enum", required: true, description: "Federal, State (with state code), or International. Governs rule applicability.", sourceStatus: "Partial" },
  { attribute: "TaxFormReference", type: "String", required: true, description: "Tax form and line reference (e.g., Form 1120, Line 28). Links rule to TDC form templates.", sourceStatus: "Partial" },
  { attribute: "RuleText", type: "Text", required: true, description: "Natural language rule statement as authored by Tax SME.", sourceStatus: "Present" },
  { attribute: "StructuredLogic", type: "JSON", required: true, description: "Machine-readable structured representation of the rule. AI translation target.", sourceStatus: "Not in Krista workbook" },
  { attribute: "ConfidenceBandThreshold", type: "Enum (GREEN/YELLOW/RED)", required: true, description: "Confidence band thresholds for AI mapping proposals using this rule.", sourceStatus: "Not in Krista workbook" },
  { attribute: "SourceDocumentReference", type: "String", required: true, description: "Reference to the source document (Krista workbook row, IRC section, IRS publication).", sourceStatus: "Partial" },
  { attribute: "SMEApprovalRecord", type: "UUID → ApprovalRecord", required: true, description: "Reference to the Tax SME approval record. Required before governed promotion.", sourceStatus: "Not in Krista workbook" },
  { attribute: "AITranslationFlag", type: "Boolean", required: true, description: "True if this rule version was AI-translated. False if authored directly by SME.", sourceStatus: "Not in Krista workbook" },
  { attribute: "LineageAnchorId", type: "UUID → SourceFile", required: true, description: "Links rule version to the source document ingested in B1. Ensures full lineage traceability.", sourceStatus: "Not in Krista workbook" },
  { attribute: "OverridePolicy", type: "Enum", required: false, description: "Future: governs how practitioners may override this rule. Not in scope for readiness effort.", sourceStatus: "Future / Out of Scope" },
];

const GAP_SUMMARY = [
  { category: "Present in Krista workbook", count: 2, color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { category: "Partial (exists but incomplete)", count: 4, color: "bg-amber-100 text-amber-800 border-amber-300" },
  { category: "Not in Krista workbook (must be added)", count: 8, color: "bg-red-100 text-red-800 border-red-300" },
  { category: "Future / Out of Scope", count: 1, color: "bg-slate-100 text-slate-600 border-slate-300" },
];

const RECOMMENDATIONS = [
  {
    id: "R-01",
    priority: "Critical",
    recommendation: "Add RuleId, RuleVersion, and ExpirationDate columns to the Krista workbook before the AI translation pilot begins.",
    rationale: "These are required for versioning and lineage. Without them, AI-translated rules cannot be properly governed.",
    owner: "Tax SME + DCT",
  },
  {
    id: "R-02",
    priority: "Critical",
    recommendation: "Define the StructuredLogic JSON schema before the five-rule AI translation pilot.",
    rationale: "The AI translation target format must be agreed before the pilot can produce usable outputs.",
    owner: "DCT Architecture + Tax SME",
  },
  {
    id: "R-03",
    priority: "High",
    recommendation: "Standardize the Jurisdiction field in the Krista workbook to use the agreed enum values (Federal, State:XX, International).",
    rationale: "Inconsistent jurisdiction values will prevent automated ingestion and classification.",
    owner: "Tax SME",
  },
  {
    id: "R-04",
    priority: "High",
    recommendation: "Add TaxFormReference to all Krista workbook entries that reference a specific form or schedule.",
    rationale: "TDC requires form references to link rule metadata to form templates from B3.",
    owner: "Tax SME",
  },
  {
    id: "R-05",
    priority: "Medium",
    recommendation: "Define the SME Approval workflow before the pilot. Determine who approves, what the SLA is, and how approvals are recorded.",
    rationale: "AI translation proposals cannot be promoted to governed status without a defined approval workflow.",
    owner: "Tax SME + DCT",
  },
  {
    id: "R-06",
    priority: "Medium",
    recommendation: "Add ConfidenceBandThreshold to the rule metadata structure. Align with TDC B3 confidence band definitions (GREEN/YELLOW/RED).",
    rationale: "TDC uses confidence bands from rule metadata to govern AI mapping proposals in B4.",
    owner: "TDC + Tax SME",
  },
];

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 border border-red-300",
    High: "bg-amber-100 text-amber-800 border border-amber-300",
    Medium: "bg-blue-100 text-blue-800 border border-blue-300",
    Low: "bg-slate-100 text-slate-600 border border-slate-200",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[priority] ?? "bg-slate-100 text-slate-600"}`}>{priority}</span>;
}

function SourceBadge({ status }: { status: string }) {
  if (status === "Present") return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">Present</span>;
  if (status === "Partial") return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">Partial</span>;
  if (status === "Future / Out of Scope") return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">Future</span>;
  return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300">Gap</span>;
}

export default function TaxLogicRuleIntake() {
  return (
    <div className="min-h-screen bg-slate-50">
      <GovernanceBanner />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Architecture & Readiness</span>
            <span className="text-slate-300">›</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#003865]">Tax Logic Repository Readiness</span>
          </div>
          <h1 className="text-2xl font-bold text-[#003865]">Rule Intake Assessment</h1>
          <p className="mt-1 text-sm text-slate-500">Krista workbook review, metadata gap analysis, required attributes, and recommendations.</p>
        </div>

        {/* Gap Summary */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Gap Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GAP_SUMMARY.map((g, i) => (
              <div key={i} className={`border rounded-lg p-4 text-center ${g.color}`}>
                <p className="text-2xl font-bold">{g.count}</p>
                <p className="text-xs mt-1">{g.category}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Required Attributes */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Required Rule Metadata Attributes</h2>
          <p className="text-sm text-slate-500 mb-3">Assessment of each required attribute against the current Krista workbook intake document.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">Attribute</th>
                  <th className="px-4 py-2 text-left font-semibold">Type</th>
                  <th className="px-4 py-2 text-left font-semibold">Required</th>
                  <th className="px-4 py-2 text-left font-semibold">Description</th>
                  <th className="px-4 py-2 text-left font-semibold">Krista Status</th>
                </tr>
              </thead>
              <tbody>
                {REQUIRED_ATTRIBUTES.map((a, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-[#003865] font-semibold">{a.attribute}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{a.type}</td>
                    <td className="px-4 py-2.5 text-center">{a.required ? <span className="text-red-600 font-bold">✓</span> : <span className="text-slate-300">–</span>}</td>
                    <td className="px-4 py-2.5 text-slate-700">{a.description}</td>
                    <td className="px-4 py-2.5"><SourceBadge status={a.sourceStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Recommendations</h2>
          <div className="space-y-3">
            {RECOMMENDATIONS.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{r.id}</span>
                      <PriorityBadge priority={r.priority} />
                    </div>
                    <p className="font-medium text-slate-800 text-sm">{r.recommendation}</p>
                    <p className="text-xs text-slate-500 mt-1">{r.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400">Owner</span>
                    <p className="text-xs font-medium text-slate-700">{r.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
