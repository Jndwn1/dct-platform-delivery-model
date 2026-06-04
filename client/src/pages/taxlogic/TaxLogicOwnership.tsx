// Tax Logic Repository Readiness — Ownership & Governance
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const OWNERSHIP_MATRIX = [
  {
    team: "Tax SME",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-700",
    responsibilities: [
      "Author and approve all tax rules before they are promoted to governed status",
      "Review and sign off on AI-translated rule proposals",
      "Define rule metadata attributes (jurisdiction, effective date, confidence band thresholds)",
      "Maintain the Krista workbook as the source intake document",
      "Approve changes to existing rule versions — no rule may be superseded without SME sign-off",
      "Own the definition of override governance policy for future adjustment workflows",
    ],
    openQuestions: [
      "Who is the designated Tax SME owner for each rule category (federal, state, international)?",
      "What is the SME approval SLA for AI-translated rule proposals?",
      "How are rule conflicts between jurisdictions resolved?",
    ],
  },
  {
    team: "DCT (PDC)",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-[#003865]",
    responsibilities: [
      "Store and version all rule metadata in the governed rule repository",
      "Enforce additive-only versioning — no rule field may be removed or re-typed once published",
      "Maintain rule lineage from source document through AI translation to governed record",
      "Publish the Rule Metadata Read Contract for gateway exposure",
      "Enforce the gateway surface-not-store pattern — rule metadata is surfaced, not duplicated",
      "Manage the schema registry for rule metadata structure",
      "Does NOT own tax logic calculations — execution is TDC responsibility",
    ],
    openQuestions: [
      "What is the physical data model for rule metadata storage in PDC?",
      "How does the rule repository integrate with the existing PDC schema registry?",
      "What is the versioning key structure for rule records (RuleId + Version + EffectiveDate)?",
    ],
  },
  {
    team: "TDC",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-700",
    responsibilities: [
      "Execute tax logic calculations using rule metadata sourced from DCT",
      "Apply confidence band thresholds from rule metadata to AI mapping proposals",
      "Consume the Rule Metadata Read Contract — no direct table access to rule repository",
      "Record which rule version was applied to each tax mapping decision (rule version lineage)",
      "Surface rule version context to Roger for practitioner review",
    ],
    openQuestions: [
      "Does TDC execute rules inline or via a separate rules engine?",
      "How does TDC handle rule version conflicts when multiple versions are active for the same jurisdiction?",
      "What is the TDC dependency on rule metadata readiness before AI tax mapping (B4) can proceed?",
    ],
  },
  {
    team: "Roger",
    color: "bg-violet-50 border-violet-200",
    headerColor: "bg-violet-700",
    responsibilities: [
      "Surface rule context to practitioners during review — which rule was applied, which version, confidence band",
      "Read rule metadata exclusively through the gateway read contract",
      "Display rule version and effective date alongside tax mapping proposals",
      "Surface override context when a practitioner overrides an AI-proposed mapping",
    ],
    openQuestions: [
      "What rule metadata fields does Roger need to display to practitioners?",
      "How does Roger surface rule version history for audit purposes?",
      "What is the Roger UI design for rule context within the review workflow?",
    ],
  },
  {
    team: "AI / Orchestrator",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-700",
    responsibilities: [
      "Translate natural language tax rules from the Krista workbook into structured rule metadata proposals",
      "AI translation outputs are proposals only — Tax SME approval required before governed promotion",
      "Record confidence score and source document reference for every AI-translated rule proposal",
      "Five-rule pilot: translate five rules, submit for SME review, record findings",
    ],
    openQuestions: [
      "What AI model and prompt strategy will be used for the five-rule pilot?",
      "How are AI translation errors or low-confidence proposals flagged for SME review?",
      "What is the rejection and re-submission workflow for AI proposals that fail SME review?",
    ],
  },
];

const GOVERNANCE_PRINCIPLES = [
  { principle: "Additive-Only Versioning", description: "No rule field may be removed or re-typed once published. New versions are additive. Superseded versions are retained for lineage." },
  { principle: "SME Approval Gate", description: "All rule records — whether authored by SME or AI-translated — require Tax SME approval before promotion to governed status." },
  { principle: "Lineage Traceability", description: "Every rule version must trace back to its source document (Krista workbook entry, SME approval record, or AI translation output)." },
  { principle: "Surface-Not-Store (Gateway)", description: "Consumers access rule metadata through the gateway read contract. Rule data is not duplicated in consumer systems." },
  { principle: "Execution Separation", description: "DCT stores rule metadata. TDC executes rule logic. These responsibilities are not conflated." },
  { principle: "Override Governance (Future)", description: "Override policies for rule adjustments are a future workflow. Not in scope for this readiness effort — documented as an open architecture decision." },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Open: "bg-amber-100 text-amber-800 border border-amber-300",
    Resolved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function TaxLogicOwnership() {
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
          <h1 className="text-2xl font-bold text-[#003865]">Ownership & Governance</h1>
          <p className="mt-1 text-sm text-slate-500">Responsibilities, boundaries, and open governance questions for each team in the Tax Logic Repository workstream.</p>
        </div>

        {/* Governance Principles */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Governing Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {GOVERNANCE_PRINCIPLES.map((p, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-[#003865] mb-1">{p.principle}</p>
                <p className="text-xs text-slate-600">{p.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Ownership Matrix */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Ownership Matrix by Team</h2>
          <div className="space-y-4">
            {OWNERSHIP_MATRIX.map((team) => (
              <div key={team.team} className={`border rounded-lg overflow-hidden ${team.color}`}>
                <div className={`px-5 py-3 ${team.headerColor}`}>
                  <h3 className="text-sm font-bold text-white">{team.team}</h3>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Responsibilities</p>
                    <ul className="space-y-1.5">
                      {team.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">Open Governance Questions</p>
                    <ul className="space-y-1.5">
                      {team.openQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-1 text-amber-500 shrink-0">?</span>
                          {q}
                        </li>
                      ))}
                    </ul>
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
