// Tax Logic Repository Readiness — Rule Repository Design
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const LOGICAL_MODEL = [
  {
    entity: "TaxRule",
    description: "The core rule record. Immutable once created. Each version is a new record.",
    attributes: [
      { name: "RuleId", type: "UUID", key: "PK", notes: "Assigned at first creation. Never changes." },
      { name: "RuleName", type: "String(200)", key: "", notes: "Human-readable name." },
      { name: "RuleVersion", type: "Integer", key: "", notes: "Monotonically increasing. Starts at 1." },
      { name: "EffectiveDate", type: "DateOnly", key: "", notes: "Date rule version becomes active." },
      { name: "ExpirationDate", type: "DateOnly?", key: "", notes: "Null = currently active." },
      { name: "Jurisdiction", type: "Enum", key: "", notes: "Federal | State:XX | International" },
      { name: "TaxFormReference", type: "String(100)", key: "", notes: "e.g., Form 1120 Line 28" },
      { name: "RuleText", type: "Text", key: "", notes: "Natural language rule statement." },
      { name: "StructuredLogic", type: "JSONB", key: "", notes: "Machine-readable rule representation." },
      { name: "ConfidenceBandThreshold", type: "Enum", key: "", notes: "GREEN | YELLOW | RED" },
      { name: "AITranslationFlag", type: "Boolean", key: "", notes: "True = AI-translated proposal." },
      { name: "ApprovalRecordId", type: "UUID → ApprovalRecord", key: "FK", notes: "Required before governed promotion." },
      { name: "LineageAnchorId", type: "UUID → SourceFile", key: "FK", notes: "Links to B1 ingestion lineage." },
      { name: "CreatedAt", type: "DateTime", key: "", notes: "Immutable. Set at record creation." },
    ],
  },
  {
    entity: "RuleApprovalRecord",
    description: "Immutable approval record. Created when a Tax SME approves a rule version.",
    attributes: [
      { name: "ApprovalRecordId", type: "UUID", key: "PK", notes: "" },
      { name: "RuleId", type: "UUID → TaxRule", key: "FK", notes: "" },
      { name: "RuleVersion", type: "Integer", key: "", notes: "Version being approved." },
      { name: "ApprovedBy", type: "String(100)", key: "", notes: "Tax SME name." },
      { name: "ApprovedAt", type: "DateTime", key: "", notes: "Immutable." },
      { name: "ApprovalNotes", type: "Text?", key: "", notes: "Optional SME notes." },
    ],
  },
  {
    entity: "RuleLineageEvent",
    description: "Append-only event log for all rule state transitions.",
    attributes: [
      { name: "EventId", type: "UUID", key: "PK", notes: "" },
      { name: "RuleId", type: "UUID → TaxRule", key: "FK", notes: "" },
      { name: "RuleVersion", type: "Integer", key: "", notes: "" },
      { name: "EventType", type: "Enum", key: "", notes: "CREATED | APPROVED | SUPERSEDED | REJECTED" },
      { name: "EventAt", type: "DateTime", key: "", notes: "Immutable." },
      { name: "ActorId", type: "String(100)", key: "", notes: "Who triggered the event." },
      { name: "Notes", type: "Text?", key: "", notes: "" },
    ],
  },
];

const VERSIONING_APPROACH = [
  { principle: "Additive-Only", description: "New rule versions are new records. No existing record is modified. The previous version's ExpirationDate is set when a new version is promoted." },
  { principle: "Version Key", description: "RuleId + RuleVersion is the composite key for a specific rule version. RuleId alone returns the latest active version." },
  { principle: "Effective Date Governance", description: "EffectiveDate is set by Tax SME at approval time. A rule version cannot be active before its EffectiveDate." },
  { principle: "Supersession", description: "When a new version is approved, the previous version's ExpirationDate is set to the new version's EffectiveDate minus one day. No deletion." },
  { principle: "Rejection", description: "Rejected AI proposals are retained with EventType = REJECTED in the lineage log. They are never deleted — retained for audit and learning." },
  { principle: "Contract Alignment", description: "The Rule Metadata Read Contract follows the same additive-only contract pattern as all other DCT read contracts. No field removal or re-typing once published." },
];

const LINEAGE_APPROACH = [
  { step: 1, event: "Source Document Ingested", description: "Krista workbook or SME document ingested via B1 pipeline. LineageAnchorId assigned." },
  { step: 2, event: "AI Translation Proposal Created", description: "AI translates natural language rule to StructuredLogic. AITranslationFlag = true. Status = PROPOSED." },
  { step: 3, event: "SME Review", description: "Tax SME reviews AI proposal. May approve, reject, or request revision." },
  { step: 4, event: "Approval Record Created", description: "SME approves. RuleApprovalRecord created. ApprovalRecordId linked to TaxRule." },
  { step: 5, event: "Rule Promoted to Governed", description: "Rule version promoted. EventType = APPROVED logged. Rule available via Read Contract." },
  { step: 6, event: "Rule Superseded", description: "New version approved. Previous version ExpirationDate set. EventType = SUPERSEDED logged." },
];

const OPEN_DESIGN_QUESTIONS = [
  { id: "DQ-01", question: "What is the physical storage location for the rule repository in PDC? Separate schema or shared schema with existing PDC tables?", status: "Open" },
  { id: "DQ-02", question: "What is the StructuredLogic JSON schema? Who defines it — DCT, TDC, or Tax SME?", status: "Open" },
  { id: "DQ-03", question: "How does the rule repository integrate with the B3 TDC Reference Data (TaxFormTemplates, MappingRules)?", status: "Open" },
  { id: "DQ-04", question: "What is the Read Contract endpoint structure for rule metadata? Single endpoint or per-jurisdiction?", status: "Open" },
  { id: "DQ-05", question: "How are multi-jurisdiction rules handled? One record per jurisdiction or a single record with jurisdiction array?", status: "Open" },
];

export default function TaxLogicRepoDesign() {
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
          <h1 className="text-2xl font-bold text-[#003865]">Rule Repository Design</h1>
          <p className="mt-1 text-sm text-slate-500">Logical model, physical model considerations, versioning approach, and lineage strategy.</p>
        </div>

        {/* Logical Model */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Logical Data Model</h2>
          <div className="space-y-6">
            {LOGICAL_MODEL.map((entity) => (
              <div key={entity.entity} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-[#003865] px-5 py-3">
                  <h3 className="text-sm font-bold text-white font-mono">{entity.entity}</h3>
                  <p className="text-xs text-blue-200 mt-0.5">{entity.description}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Attribute</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Type</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Key</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entity.attributes.map((a, i) => (
                        <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          <td className="px-4 py-2 font-mono font-semibold text-[#003865]">{a.name}</td>
                          <td className="px-4 py-2 font-mono text-slate-500">{a.type}</td>
                          <td className="px-4 py-2">
                            {a.key && <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">{a.key}</span>}
                          </td>
                          <td className="px-4 py-2 text-slate-600">{a.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Versioning Approach */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Versioning Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VERSIONING_APPROACH.map((v, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#003865] mb-1">{v.principle}</p>
                <p className="text-xs text-slate-600">{v.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lineage Approach */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Lineage Approach — Rule Lifecycle</h2>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
            <div className="space-y-4">
              {LINEAGE_APPROACH.map((step) => (
                <div key={step.step} className="flex items-start gap-4 pl-14 relative">
                  <div className="absolute left-3.5 w-5 h-5 rounded-full bg-[#003865] text-white text-xs font-bold flex items-center justify-center">{step.step}</div>
                  <div className="bg-white border border-slate-200 rounded-lg p-4 flex-1">
                    <p className="text-sm font-semibold text-[#003865]">{step.event}</p>
                    <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Design Questions */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Open Design Questions</h2>
          <div className="space-y-2">
            {OPEN_DESIGN_QUESTIONS.map((q) => (
              <div key={q.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xs font-mono text-amber-600 shrink-0 mt-0.5">{q.id}</span>
                <p className="text-sm text-slate-700">{q.question}</p>
                <span className="ml-auto shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">{q.status}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
