// Tax Logic Repository Readiness — Open Architecture Decisions
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const ARCH_DECISIONS = [
  {
    id: "ADR-TL-01",
    title: "Rule Execution Ownership",
    category: "Execution",
    status: "Open",
    priority: "Critical",
    question: "Who owns tax logic rule execution — TDC, an external rules engine, or a hybrid model?",
    context: "DCT stores rule metadata. TDC consumes it. But the question of where rule logic is actually executed — inline in TDC, via a dedicated rules engine (e.g., Drools, Azure Logic Apps), or via AI inference — is not yet decided.",
    options: [
      { option: "Option A — TDC Inline Execution", description: "TDC executes rule logic directly using StructuredLogic JSON from DCT. No external rules engine.", pros: "Simpler architecture. No additional system dependency.", cons: "TDC must implement a rule interpreter. Harder to test rules independently." },
      { option: "Option B — External Rules Engine", description: "A dedicated rules engine (e.g., Drools, Azure Logic Apps) executes rule logic. TDC calls the engine.", pros: "Rules are testable and auditable independently. Separation of concerns.", cons: "Additional system dependency. Integration complexity." },
      { option: "Option C — Hybrid (AI + Structured)", description: "AI Orchestrator executes rules for AI mapping proposals. TDC executes structured rules for deterministic calculations.", pros: "Leverages AI for proposals, deterministic for final calculations.", cons: "Two execution paths. Governance complexity." },
    ],
    recommendation: "Pending SME and architecture alignment. Recommend Option A for MVP scope — simplest path to pilot start. Revisit for post-MVP.",
    owner: "DCT Architecture + TDC Lead",
    dueDate: "TBD",
  },
  {
    id: "ADR-TL-02",
    title: "Override Governance for Rule Adjustments",
    category: "Governance",
    status: "Open",
    priority: "High",
    question: "How are practitioner overrides of AI-proposed rule applications governed, versioned, and audited?",
    context: "When a practitioner overrides an AI-proposed tax mapping that was based on a specific rule version, the override must be recorded with the rule version that was overridden, the practitioner's justification, and a lineage link. The governance model for this workflow is not yet defined.",
    options: [
      { option: "Option A — Override as TDC Adjustment Record", description: "Override is recorded as a TDC Adjustment record (B6 pattern). Rule version reference added to adjustment metadata.", pros: "Reuses existing B6 adjustment lifecycle. No new data model.", cons: "B6 adjustment model may not capture rule-specific context." },
      { option: "Option B — Dedicated Rule Override Record", description: "New RuleOverrideRecord entity in TDC. Links to TaxRule version, AdjustmentRecord, and practitioner.", pros: "Purpose-built for rule override governance. Cleaner audit trail.", cons: "New entity required. Additional development scope." },
    ],
    recommendation: "Deferred to post-MVP. Not in scope for readiness effort. Document as future workflow.",
    owner: "TDC Lead + Tax SME",
    dueDate: "Post-MVP",
  },
  {
    id: "ADR-TL-03",
    title: "Future AI Automation of Rule Updates",
    category: "AI Governance",
    status: "Open",
    priority: "Medium",
    question: "Should AI be permitted to propose rule updates autonomously when tax law changes are detected, or is SME-initiated authorship required?",
    context: "As the platform matures, AI could monitor regulatory sources (IRC, IRS publications) and propose rule updates when changes are detected. This raises governance questions about autonomous AI proposals vs. SME-initiated authorship.",
    options: [
      { option: "Option A — SME-Initiated Only", description: "All rule updates are initiated by Tax SME. AI only translates — it does not propose updates autonomously.", pros: "Simplest governance model. Full SME control.", cons: "Slower to respond to tax law changes. Manual monitoring required." },
      { option: "Option B — AI-Proposed with SME Gate", description: "AI monitors regulatory sources and proposes rule updates. All proposals require SME approval before promotion.", pros: "Faster response to tax law changes. AI reduces SME monitoring burden.", cons: "Requires regulatory source monitoring infrastructure. AI proposal quality must be validated." },
    ],
    recommendation: "Option A for MVP. Option B as a future capability after AI translation pilot results are available.",
    owner: "DCT Architecture + Tax SME",
    dueDate: "Post-MVP",
  },
  {
    id: "ADR-TL-04",
    title: "Integration Dependencies — B3, B4, B9",
    category: "Integration",
    status: "Open",
    priority: "Critical",
    question: "What is the sequencing dependency between the Tax Logic Repository and B3 (Tax Taxonomy), B4 (AI Tax Mapping), and B9 (Gateway)?",
    context: "The rule repository must be built before B4 AI Tax Mapping can consume rule metadata for confidence band thresholds. B3 Tax Taxonomy must be complete before rule-to-form references can be validated. B9 Gateway must be complete before rule metadata can be exposed to consumers.",
    options: [],
    recommendation: "Rule repository design must be approved before B4 sprint planning. B3 completion is a prerequisite for rule metadata validation. B9 gateway scaffolding is a prerequisite for consumer exposure. Recommend tracking these as formal dependencies in the batch delivery calendar.",
    owner: "DCT Architecture",
    dueDate: "Before B4 Sprint Planning",
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-amber-100 text-amber-800 border border-amber-300",
    Resolved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    Deferred: "bg-slate-100 text-slate-600 border border-slate-300",
    "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 border border-red-300",
    High: "bg-amber-100 text-amber-800 border border-amber-300",
    Medium: "bg-blue-100 text-blue-800 border border-blue-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[priority] ?? "bg-slate-100 text-slate-600"}`}>{priority}</span>;
}

export default function TaxLogicArchDecisions() {
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
          <h1 className="text-2xl font-bold text-[#003865]">Open Architecture Decisions</h1>
          <p className="mt-1 text-sm text-slate-500">Rule execution ownership, override governance, future AI automation, and integration dependencies.</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total ADRs", value: ARCH_DECISIONS.length, color: "text-[#003865]" },
            { label: "Open", value: ARCH_DECISIONS.filter(d => d.status === "Open").length, color: "text-amber-700" },
            { label: "Critical Priority", value: ARCH_DECISIONS.filter(d => d.priority === "Critical").length, color: "text-red-700" },
            { label: "Resolved", value: ARCH_DECISIONS.filter(d => d.status === "Resolved").length, color: "text-emerald-700" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ADR Cards */}
        <section className="space-y-6">
          {ARCH_DECISIONS.map((adr) => (
            <div key={adr.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-[#003865] px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-blue-300">{adr.id}</span>
                    <span className="text-xs text-blue-300">·</span>
                    <span className="text-xs text-blue-300">{adr.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{adr.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={adr.priority} />
                  <StatusBadge status={adr.status} />
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Decision Question</p>
                  <p className="text-sm font-medium text-slate-800">{adr.question}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Context</p>
                  <p className="text-sm text-slate-600">{adr.context}</p>
                </div>
                {adr.options.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Options</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {adr.options.map((opt, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                          <p className="text-xs font-bold text-[#003865] mb-1">{opt.option}</p>
                          <p className="text-xs text-slate-600 mb-2">{opt.description}</p>
                          <p className="text-xs text-emerald-700"><span className="font-semibold">Pros:</span> {opt.pros}</p>
                          <p className="text-xs text-red-700 mt-0.5"><span className="font-semibold">Cons:</span> {opt.cons}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Recommendation</p>
                    <p className="text-sm text-slate-700">{adr.recommendation}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-400">Owner</p>
                    <p className="text-xs font-medium text-slate-700">{adr.owner}</p>
                    <p className="text-xs text-slate-400 mt-1">Due</p>
                    <p className="text-xs font-medium text-slate-700">{adr.dueDate}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
