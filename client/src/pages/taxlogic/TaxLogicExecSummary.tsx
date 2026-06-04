// Tax Logic Repository Readiness — Executive Summary
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE — Not authoritative for delivery

import GovernanceBanner from "@/components/GovernanceBanner";

const MEETING_RECAP = [
  {
    date: "TBD",
    attendees: "Tax SME, DCT Architect, TDC Lead, Roger Product Owner",
    topic: "Tax Logic Repository Readiness — Kickoff",
    outcome: "Workstream initiated. Ownership boundaries, metadata structure, and AI translation pilot scope to be defined.",
    status: "Scheduled",
  },
];

const KEY_DECISIONS = [
  {
    id: "KD-01",
    decision: "DCT is the governed repository and system of record for rule metadata and storage.",
    rationale: "Aligns with platform governance model. DCT does not own tax logic calculations — it stores, versions, and surfaces rule metadata.",
    owner: "DCT Architecture",
    status: "Approved",
  },
  {
    id: "KD-02",
    decision: "Rule execution ownership is an open architecture decision — not yet assigned.",
    rationale: "Tax logic calculations may be executed by TDC, an external rules engine, or a hybrid model. Requires SME and architecture alignment.",
    owner: "Open",
    status: "Open",
  },
  {
    id: "KD-03",
    decision: "AI translation pilot will cover five rules from the Krista workbook.",
    rationale: "Five-rule pilot scoped to test AI-assisted translation from natural language tax rules to structured rule metadata before broader rollout.",
    owner: "DCT + Tax SME",
    status: "Planned",
  },
  {
    id: "KD-04",
    decision: "Gateway exposure strategy for rule metadata will follow the same surface-not-store pattern as B9.",
    rationale: "Roger and other consumers access rule metadata through the governed gateway — not directly from the rule repository.",
    owner: "DCT Architecture",
    status: "Pending Review",
  },
];

const ARCH_ASSUMPTIONS = [
  "DCT stores rule metadata (rule ID, version, lineage, confidence band, effective date, jurisdiction). It does not execute tax calculations.",
  "Rule versioning follows the same additive-only contract pattern as all other DCT read contracts — no field removal or re-typing once published.",
  "Rule lineage traces every rule version back to its source document (Krista workbook, SME approval, or AI translation output).",
  "Roger accesses rule metadata through the gateway read contract — not directly from the rule repository tables.",
  "Override governance for rule adjustments is a future workflow — not in scope for this readiness effort.",
  "AI translation outputs are proposals only — Tax SME approval is required before a rule is promoted to governed status.",
];

const OWNERSHIP_SUMMARY = [
  { system: "Tax SME", role: "Rule authorship, approval, and governance. Source of truth for tax logic intent." },
  { system: "DCT (PDC)", role: "Rule metadata storage, versioning, lineage, and gateway exposure. Does not own tax logic calculations." },
  { system: "TDC", role: "Tax rule execution and application to return data. Consumes rule metadata from DCT." },
  { system: "Roger", role: "Surfaces rule context to practitioners. Reads rule metadata through gateway read contract." },
  { system: "AI / Orchestrator", role: "AI translation pilot — proposes structured rule metadata from natural language. Proposals require SME approval." },
];

const SUCCESS_CRITERIA = [
  { id: 1, criterion: "Ownership boundaries documented and approved", status: "In Progress" },
  { id: 2, criterion: "Rule metadata structure approved", status: "Not Started" },
  { id: 3, criterion: "Intake document gaps identified", status: "Not Started" },
  { id: 4, criterion: "Rule repository design approved", status: "Not Started" },
  { id: 5, criterion: "Versioning and lineage strategy approved", status: "Not Started" },
  { id: 6, criterion: "Gateway exposure strategy approved", status: "Not Started" },
  { id: 7, criterion: "AI translation pilot completed", status: "Not Started" },
  { id: 8, criterion: "Open architecture decisions documented", status: "Not Started" },
  { id: 9, criterion: "DCT positioned as governed repository — not owner of tax logic calculations", status: "In Progress" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    Open: "bg-amber-100 text-amber-800 border border-amber-300",
    Planned: "bg-blue-100 text-blue-800 border border-blue-300",
    "Pending Review": "bg-violet-100 text-violet-800 border border-violet-300",
    Scheduled: "bg-slate-100 text-slate-700 border border-slate-300",
    "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
    "Not Started": "bg-slate-100 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

export default function TaxLogicExecSummary() {
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
          <h1 className="text-2xl font-bold text-[#003865]">Executive Summary</h1>
          <p className="mt-1 text-sm text-slate-500">Meeting recap, key decisions, architecture assumptions, and ownership boundaries for the Tax Logic Repository Readiness workstream.</p>
        </div>

        {/* Workstream Context */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Workstream Context</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-5 text-sm text-slate-700 space-y-2">
            <p>The <strong>Tax Logic Repository Readiness</strong> workstream is an architecture and readiness discovery effort — not a current delivery stream. It supports DCT architecture, TDC architecture, gateway integration, Roger integration, tax rule governance, rule repository design, rule versioning, lineage and auditability, and future adjustment workflows.</p>
            <p>This workstream is tracked alongside <strong>TIM Discovery</strong>, <strong>Gateway Architecture</strong>, <strong>Roger API Evolution</strong>, <strong>Data Model &amp; Gaps</strong>, and <strong>QA Readiness</strong> as a parallel readiness initiative.</p>
            <p className="font-medium text-[#003865]">DCT is the governed repository and system of record for rule metadata and storage — not the owner of tax logic calculations.</p>
          </div>
        </section>

        {/* Meeting Recap */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Meeting Recap</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-semibold">Attendees</th>
                  <th className="px-4 py-2 text-left font-semibold">Topic</th>
                  <th className="px-4 py-2 text-left font-semibold">Outcome</th>
                  <th className="px-4 py-2 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {MEETING_RECAP.map((m, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{m.date}</td>
                    <td className="px-4 py-3 text-slate-700">{m.attendees}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{m.topic}</td>
                    <td className="px-4 py-3 text-slate-600">{m.outcome}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Decisions */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Key Decisions</h2>
          <div className="space-y-3">
            {KEY_DECISIONS.map((d) => (
              <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">{d.id}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="font-medium text-slate-800 text-sm">{d.decision}</p>
                    <p className="text-xs text-slate-500 mt-1">{d.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400">Owner</span>
                    <p className="text-xs font-medium text-slate-700">{d.owner}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Assumptions */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Architecture Assumptions</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-5">
            <ul className="space-y-2">
              {ARCH_ASSUMPTIONS.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="mt-1 w-5 h-5 rounded-full bg-[#003865] text-white text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Ownership Summary */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Ownership Boundaries — Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">System / Team</th>
                  <th className="px-4 py-2 text-left font-semibold">Role in Tax Logic Repository</th>
                </tr>
              </thead>
              <tbody>
                {OWNERSHIP_SUMMARY.map((o, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-3 font-semibold text-[#003865]">{o.system}</td>
                    <td className="px-4 py-3 text-slate-700">{o.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Success Criteria */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Success Criteria</h2>
          <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            {SUCCESS_CRITERIA.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">{s.id}</span>
                  <span className="text-sm text-slate-700">{s.criterion}</span>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
