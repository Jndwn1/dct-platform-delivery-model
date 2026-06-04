// Tax Logic Repository Readiness — AI Translation Pilot
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const PILOT_RULES = [
  { id: "PILOT-01", ruleName: "Standard Deduction — Single Filer", jurisdiction: "Federal", formRef: "Form 1040, Line 12", status: "Pending Selection", aiStatus: "Not Started", smeStatus: "Not Started" },
  { id: "PILOT-02", ruleName: "Net Operating Loss Carryforward (C-corp)", jurisdiction: "Federal", formRef: "Form 1120, Line 29a", status: "Pending Selection", aiStatus: "Not Started", smeStatus: "Not Started" },
  { id: "PILOT-03", ruleName: "§179 Expensing Limitation", jurisdiction: "Federal", formRef: "Form 4562, Line 11", status: "Pending Selection", aiStatus: "Not Started", smeStatus: "Not Started" },
  { id: "PILOT-04", ruleName: "Bonus Depreciation (MACRS)", jurisdiction: "Federal", formRef: "Form 4562, Line 14", status: "Pending Selection", aiStatus: "Not Started", smeStatus: "Not Started" },
  { id: "PILOT-05", ruleName: "State Apportionment — Three-Factor Formula", jurisdiction: "State", formRef: "State Schedule — Multi-State", status: "Pending Selection", aiStatus: "Not Started", smeStatus: "Not Started" },
];

const PILOT_PHASES = [
  {
    phase: 1,
    title: "Rule Selection",
    description: "Tax SME selects five representative rules from the Krista workbook. Rules should span federal, state, and complexity levels.",
    owner: "Tax SME",
    status: "Not Started",
    criteria: [
      "Five rules selected and documented",
      "Each rule has a complete Krista workbook entry",
      "Rules span at least two jurisdictions",
      "At least one rule involves a carryforward or multi-year calculation",
    ],
  },
  {
    phase: 2,
    title: "AI Translation",
    description: "AI Orchestrator translates each rule from natural language to structured StructuredLogic JSON. Confidence score recorded for each translation.",
    owner: "DCT + AI Orchestrator",
    status: "Not Started",
    criteria: [
      "StructuredLogic JSON schema defined and agreed",
      "All five rules translated to StructuredLogic",
      "Confidence score recorded for each translation",
      "Source document reference captured for each rule",
    ],
  },
  {
    phase: 3,
    title: "SME Review",
    description: "Tax SME reviews each AI-translated rule proposal. Approves, rejects, or requests revision. Approval record created for approved rules.",
    owner: "Tax SME",
    status: "Not Started",
    criteria: [
      "All five rules reviewed by Tax SME",
      "Approval or rejection decision recorded for each rule",
      "Revision requests documented with specific feedback",
      "Approval records created for approved rules",
    ],
  },
  {
    phase: 4,
    title: "Governed Promotion",
    description: "Approved rules promoted to governed status in the rule repository. Rule Metadata Read Contract updated to include pilot rules.",
    owner: "DCT",
    status: "Not Started",
    criteria: [
      "Approved rules promoted with RuleVersion = 1",
      "LineageAnchorId linked to source document",
      "RuleLineageEvent records created for each promotion",
      "Rules available via Rule Metadata Read Contract",
    ],
  },
  {
    phase: 5,
    title: "Findings & Recommendations",
    description: "Pilot findings documented. AI translation accuracy assessed. Recommendations for broader rollout produced.",
    owner: "DCT + Tax SME",
    status: "Not Started",
    criteria: [
      "AI translation accuracy rate documented",
      "Common failure patterns identified",
      "SME review effort per rule estimated",
      "Recommendations for broader rollout documented",
    ],
  },
];

const FINDINGS_PLACEHOLDER = [
  { category: "AI Translation Accuracy", finding: "Pending pilot completion", status: "Not Started" },
  { category: "Common Failure Patterns", finding: "Pending pilot completion", status: "Not Started" },
  { category: "SME Review Effort", finding: "Pending pilot completion", status: "Not Started" },
  { category: "StructuredLogic Schema Gaps", finding: "Pending pilot completion", status: "Not Started" },
  { category: "Jurisdiction Handling", finding: "Pending pilot completion", status: "Not Started" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Not Started": "bg-slate-100 text-slate-500 border border-slate-200",
    "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
    Complete: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    "Pending Selection": "bg-amber-100 text-amber-800 border border-amber-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

export default function TaxLogicAIPilot() {
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
          <h1 className="text-2xl font-bold text-[#003865]">AI Translation Pilot</h1>
          <p className="mt-1 text-sm text-slate-500">Five-rule pilot to test AI-assisted translation from natural language tax rules to structured rule metadata. Results and recommendations to follow.</p>
        </div>

        {/* Pilot Overview */}
        <section>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <h2 className="text-sm font-bold text-[#003865] mb-2">Pilot Scope</h2>
            <p className="text-sm text-slate-700">The AI Translation Pilot covers five rules selected from the Krista workbook. The objective is to test whether AI can reliably translate natural language tax rules into structured <code className="bg-blue-100 px-1 rounded text-xs">StructuredLogic</code> JSON that TDC can consume for tax mapping proposals. All AI outputs are proposals — Tax SME approval is required before any rule is promoted to governed status.</p>
          </div>
        </section>

        {/* Pilot Rules */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Pilot Rules — Pending Selection</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">ID</th>
                  <th className="px-4 py-2 text-left font-semibold">Rule Name</th>
                  <th className="px-4 py-2 text-left font-semibold">Jurisdiction</th>
                  <th className="px-4 py-2 text-left font-semibold">Form Reference</th>
                  <th className="px-4 py-2 text-left font-semibold">AI Status</th>
                  <th className="px-4 py-2 text-left font-semibold">SME Status</th>
                </tr>
              </thead>
              <tbody>
                {PILOT_RULES.map((r, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{r.id}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.ruleName}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.jurisdiction}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{r.formRef}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.aiStatus} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.smeStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-2">Note: Rule selection is pending Tax SME confirmation. Placeholder rules shown above are illustrative only.</p>
        </section>

        {/* Pilot Phases */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Pilot Phases</h2>
          <div className="space-y-4">
            {PILOT_PHASES.map((phase) => (
              <div key={phase.phase} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-[#003865] text-white text-sm font-bold flex items-center justify-center shrink-0">{phase.phase}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">{phase.title}</p>
                    <p className="text-xs text-slate-500">{phase.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <StatusBadge status={phase.status} />
                    <p className="text-xs text-slate-400 mt-1">{phase.owner}</p>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Exit Criteria</p>
                  <ul className="space-y-1">
                    {phase.criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Findings */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Findings — Pending Pilot Completion</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">Category</th>
                  <th className="px-4 py-2 text-left font-semibold">Finding</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {FINDINGS_PLACEHOLDER.map((f, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{f.category}</td>
                    <td className="px-4 py-2.5 text-slate-500 italic">{f.finding}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
