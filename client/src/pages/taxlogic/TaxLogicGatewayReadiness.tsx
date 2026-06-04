// Tax Logic Repository Readiness — Gateway & API Readiness
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import GovernanceBanner from "@/components/GovernanceBanner";

const SWAGGER_ASSESSMENT = [
  { area: "Rule Metadata Endpoints", current: "Not present in current Swagger export", gap: "Rule metadata read endpoints not yet defined", priority: "Critical" },
  { area: "Rule Version History", current: "Not present", gap: "No endpoint for retrieving rule version history by RuleId", priority: "Critical" },
  { area: "Rule by Jurisdiction", current: "Not present", gap: "No endpoint for filtering rules by jurisdiction or TaxFormReference", priority: "High" },
  { area: "Rule Approval Status", current: "Not present", gap: "No endpoint for checking rule approval status before consumption", priority: "High" },
  { area: "Gateway Auth Layer (B9)", current: "Present — Ocelot gateway scaffolding in B9 PDC", gap: "Rule metadata endpoints must be registered in gateway after repository is built", priority: "Medium" },
  { area: "Consumer Model", current: "Gateway Read Contract pattern established in B9", gap: "Rule Metadata Read Contract not yet defined or published", priority: "Critical" },
];

const EXPOSURE_STRATEGY = [
  {
    principle: "Surface-Not-Store",
    description: "Rule metadata is surfaced through the gateway read contract. Consumers (Roger, TDC) do not store rule metadata locally — they call the gateway on demand.",
    status: "Agreed",
  },
  {
    principle: "Gateway as Single Entry Point",
    description: "Roger and all consumers call the gateway — not the rule repository tables directly. This is the same pattern established for IMS, CEM, and TIM in B9.",
    status: "Agreed",
  },
  {
    principle: "Additive-Only Read Contract",
    description: "The Rule Metadata Read Contract follows the same additive-only pattern as all other DCT read contracts. No field removal or re-typing once published.",
    status: "Agreed",
  },
  {
    principle: "Versioned Contract",
    description: "The Rule Metadata Read Contract is versioned. Breaking changes require a new contract version — consumers must opt in.",
    status: "Pending Design",
  },
  {
    principle: "Auth & Routing",
    description: "Rule metadata endpoints are governed by the same Ocelot gateway auth and routing layer as all other B9 surfaces.",
    status: "Dependency on B9",
  },
];

const CONSUMER_MODEL = [
  {
    consumer: "TDC",
    useCase: "Consume rule metadata to apply confidence band thresholds to AI mapping proposals (B4). Apply rule version to tax mapping decisions for lineage.",
    contractFields: ["RuleId", "RuleVersion", "StructuredLogic", "ConfidenceBandThreshold", "EffectiveDate", "ExpirationDate"],
    readiness: "Blocked — Rule Metadata Read Contract not yet defined",
  },
  {
    consumer: "Roger",
    useCase: "Surface rule context to practitioners during review — which rule was applied, which version, confidence band, effective date.",
    contractFields: ["RuleId", "RuleVersion", "RuleName", "RuleText", "Jurisdiction", "TaxFormReference", "EffectiveDate"],
    readiness: "Blocked — Rule Metadata Read Contract not yet defined",
  },
  {
    consumer: "AI Orchestrator",
    useCase: "Reference rule metadata during AI translation pilot. Validate AI-translated StructuredLogic against existing governed rules.",
    contractFields: ["RuleId", "RuleVersion", "StructuredLogic", "AITranslationFlag", "ApprovalRecordId"],
    readiness: "Blocked — StructuredLogic schema not yet defined",
  },
];

const OPEN_API_QUESTIONS = [
  { id: "API-01", question: "What is the endpoint structure for the Rule Metadata Read Contract? Single /rules endpoint with query params or per-jurisdiction endpoints?", priority: "Critical" },
  { id: "API-02", question: "How does the gateway handle rule version negotiation? Latest active version by default, or consumer specifies version?", priority: "High" },
  { id: "API-03", question: "What is the authentication model for rule metadata endpoints? Same as B9 gateway auth or separate?", priority: "High" },
  { id: "API-04", question: "How are rule metadata endpoints registered in the Ocelot gateway configuration?", priority: "Medium" },
  { id: "API-05", question: "What is the caching strategy for rule metadata? Rules change infrequently — caching could reduce gateway load.", priority: "Medium" },
];

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 border border-red-300",
    High: "bg-amber-100 text-amber-800 border border-amber-300",
    Medium: "bg-blue-100 text-blue-800 border border-blue-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[priority] ?? "bg-slate-100 text-slate-600"}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Agreed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    "Pending Design": "bg-amber-100 text-amber-800 border border-amber-300",
    "Dependency on B9": "bg-blue-100 text-blue-800 border border-blue-300",
    "Blocked — Rule Metadata Read Contract not yet defined": "bg-red-100 text-red-800 border border-red-300",
    "Blocked — StructuredLogic schema not yet defined": "bg-red-100 text-red-800 border border-red-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

export default function TaxLogicGatewayReadiness() {
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
          <h1 className="text-2xl font-bold text-[#003865]">Gateway & API Readiness</h1>
          <p className="mt-1 text-sm text-slate-500">Swagger review, API assessment, exposure strategy, and consumer model for rule metadata access.</p>
        </div>

        {/* B9 Dependency Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <span className="text-blue-600 text-lg shrink-0">ℹ</span>
          <div>
            <p className="text-sm font-semibold text-[#003865]">Dependency on B9 — Roger Gateway & Governed Consumer Access Layer</p>
            <p className="text-xs text-slate-600 mt-1">Rule metadata endpoints must be registered in the Ocelot gateway after the rule repository is built. The gateway auth and routing layer from B9 PDC is the prerequisite for all rule metadata exposure. No consumer may call the rule repository directly.</p>
          </div>
        </div>

        {/* Swagger Assessment */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Swagger / API Assessment</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#003865] text-white">
                  <th className="px-4 py-2 text-left font-semibold">Area</th>
                  <th className="px-4 py-2 text-left font-semibold">Current State</th>
                  <th className="px-4 py-2 text-left font-semibold">Gap</th>
                  <th className="px-4 py-2 text-left font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {SWAGGER_ASSESSMENT.map((a, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{a.area}</td>
                    <td className="px-4 py-2.5 text-slate-600">{a.current}</td>
                    <td className="px-4 py-2.5 text-slate-700">{a.gap}</td>
                    <td className="px-4 py-2.5"><PriorityBadge priority={a.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Exposure Strategy */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Exposure Strategy</h2>
          <div className="space-y-3">
            {EXPOSURE_STRATEGY.map((e, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#003865]">{e.principle}</p>
                  <p className="text-xs text-slate-600 mt-1">{e.description}</p>
                </div>
                <StatusBadge status={e.status} />
              </div>
            ))}
          </div>
        </section>

        {/* Consumer Model */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Consumer Model</h2>
          <div className="space-y-4">
            {CONSUMER_MODEL.map((c, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-sm font-bold text-[#003865]">{c.consumer}</p>
                  <StatusBadge status={c.readiness} />
                </div>
                <p className="text-xs text-slate-600 mb-3">{c.useCase}</p>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Required Contract Fields</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.contractFields.map((f, j) => (
                      <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Open API Questions */}
        <section>
          <h2 className="text-base font-semibold text-[#003865] mb-3">Open API Questions</h2>
          <div className="space-y-2">
            {OPEN_API_QUESTIONS.map((q) => (
              <div key={q.id} className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <span className="text-xs font-mono text-amber-600 shrink-0 mt-0.5">{q.id}</span>
                <p className="text-sm text-slate-700 flex-1">{q.question}</p>
                <PriorityBadge priority={q.priority} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
