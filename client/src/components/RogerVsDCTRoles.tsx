import { useState } from "react";
import { ChevronDown, ChevronRight, Shield, Users, AlertTriangle, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

// ─── Responsibility Matrix Data ───────────────────────────────────────────────

const PLATFORM_OWNERSHIP = [
  { domain: "Financial Data (SoR)", pdc: "Owns", tdc: "Reads", roger: "Reads", orchestrator: "Routes", governance: "Enforces" },
  { domain: "Tax Decisions (SoR)", pdc: "Provides", tdc: "Owns", roger: "Reads", orchestrator: "Routes", governance: "Enforces" },
  { domain: "Taxonomy Authority", pdc: "—", tdc: "Owns", roger: "Consumes", orchestrator: "—", governance: "Enforces" },
  { domain: "Mapping Decisions", pdc: "—", tdc: "Owns", roger: "Reads", orchestrator: "Executes", governance: "Enforces" },
  { domain: "Filing Authority", pdc: "—", tdc: "Owns", roger: "Reads", orchestrator: "—", governance: "Enforces" },
  { domain: "Lineage", pdc: "Anchors", tdc: "Extends", roger: "Reads", orchestrator: "Traces", governance: "Validates" },
  { domain: "API Contracts", pdc: "Publishes", tdc: "Publishes", roger: "Consumes", orchestrator: "Proxies", governance: "Governs" },
  { domain: "UI Consumption", pdc: "—", tdc: "—", roger: "Owns", orchestrator: "—", governance: "—" },
  { domain: "Immutable Records", pdc: "—", tdc: "Owns", roger: "Reads", orchestrator: "—", governance: "Enforces" },
  { domain: "Compute / Orchestration", pdc: "—", tdc: "—", roger: "—", orchestrator: "Owns", governance: "—" },
  { domain: "Governance ADRs", pdc: "—", tdc: "—", roger: "—", orchestrator: "—", governance: "Owns" },
];

const DECISION_MATRIX = [
  { question: "Who owns taxonomy?", owner: "DCT BA", system: "TDC", note: "Taxonomy authority lives in TDC. Roger BA consumes — does not define." },
  { question: "Why is this field missing from Roger?", owner: "DCT BA", system: "PDC / TDC", note: "Missing fields are a platform gap. DCT BA investigates governed source." },
  { question: "Is this API governed?", owner: "DCT BA", system: "Control Panel", note: "Governance status is verified in the Control Panel Swagger section." },
  { question: "Can Roger consume this data?", owner: "Both", system: "Roger Mapping", note: "Roger BA validates UI readiness; DCT BA validates governed source." },
  { question: "Is lineage complete?", owner: "DCT BA", system: "Gate Status", note: "Lineage Closure is a DCT gate condition — not a Roger responsibility." },
  { question: "Is this production approved?", owner: "DCT BA", system: "Control Panel", note: "Production approval requires all four gate conditions to be met." },
  { question: "Is this demo-only?", owner: "Both", system: "Batch Roadmap", note: "Demo readiness (Schema Lock + Invariant Lock) is a shared checkpoint." },
  { question: "Does this violate governance?", owner: "DCT BA", system: "Data Model & Gaps", note: "Governance violations are escalated by DCT BA to Architecture." },
  { question: "Who escalates governance gaps?", owner: "DCT BA", system: "Architecture", note: "DCT BA owns governance gap identification and escalation." },
  { question: "Who validates Roger UI field mapping?", owner: "Roger BA", system: "Roger Mapping", note: "Roger BA owns UI field mapping validation against the governed contract." },
  { question: "Who tracks ADO story alignment to batches?", owner: "DCT BA", system: "ADO / Batch Detail", note: "DCT BA ensures stories are tagged to the correct batch and PI." },
  { question: "Who reports PI status to leadership?", owner: "Both", system: "Integration Hub", note: "Both BAs contribute; DCT BA owns gate completion %; Roger BA owns consumer readiness %." },
];

const MISALIGNMENT_RISKS = [
  { risk: "Roger assuming operational authority", severity: "red", description: "Roger UI consuming data without a published Read Contract or governed source.", mitigation: "DCT BA validates all Roger data sources against the Control Panel Swagger section." },
  { risk: "UI ahead of governance", severity: "red", description: "Roger UI displaying fields that are not yet in a published Read Contract.", mitigation: "Roger BA validates all displayed fields against the Roger UI Data Point Mapping page." },
  { risk: "APIs ahead of lineage", severity: "red", description: "API endpoints operational but lineage chain not closed — data is untraceable.", mitigation: "DCT BA confirms Lineage Closure gate before marking any API as production-ready." },
  { risk: "Consumer readiness confused with production readiness", severity: "yellow", description: "Roger UI demo-ready but governance coverage incomplete.", mitigation: "Both BAs distinguish demo readiness (2 gates) from operational readiness (4 gates) in all reporting." },
  { risk: "Duplicate ownership assumptions", severity: "yellow", description: "Both teams assuming they own the same data object or decision.", mitigation: "Use the BA Decision Matrix to resolve ownership questions. Escalate ambiguity to Architecture." },
  { risk: "Unclear filing authority", severity: "red", description: "Consolidated filing decisions made without TDC authority confirmation.", mitigation: "DCT BA escalates all filing authority questions to TDC and Architecture." },
  { risk: "Manual interpretation outside source-of-truth systems", severity: "yellow", description: "BAs making delivery or governance decisions based on informal communication rather than the Control Panel.", mitigation: "All delivery and governance decisions must be traceable to a source-of-truth page in the platform." },
];

// ─── Sub-section content ──────────────────────────────────────────────────────

const SUBSECTIONS: SubSection[] = [
  {
    id: "operational-model",
    title: "1. Operational Model Overview",
    content: (
      <div className="space-y-4">
        {/* Architecture callout */}
        <div className="bg-purple-950 border border-purple-700 rounded-lg px-4 py-3">
          <p className="text-purple-200 text-sm font-semibold">
            Architecture Principle: Roger is a downstream governed consumer. DCT owns platform authority and operational data governance.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
            <h4 className="text-blue-300 font-bold text-sm mb-2">DCT Platform</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• System-of-Record ownership (PDC + TDC)</li>
              <li>• Data lineage, authority, and contracts</li>
              <li>• Governance enforcement and ADR ownership</li>
              <li>• All compute flows through Orchestrator</li>
              <li>• No direct PDC → TDC communication</li>
            </ul>
          </div>
          <div className="bg-emerald-950 border border-emerald-800 rounded-lg p-4">
            <h4 className="text-emerald-300 font-bold text-sm mb-2">Roger</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Consumer / User Experience ownership</li>
              <li>• Reads governed outputs only</li>
              <li>• Cannot redefine platform authority</li>
              <li>• Read-only access through governed contracts</li>
              <li>• UI readiness ≠ platform governance approval</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "platform-ownership",
    title: "2. Platform Ownership Model",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-700">
              <th className="text-left px-3 py-2 text-slate-300 font-semibold">Domain</th>
              <th className="text-center px-3 py-2 text-blue-300 font-semibold">PDC</th>
              <th className="text-center px-3 py-2 text-blue-300 font-semibold">TDC</th>
              <th className="text-center px-3 py-2 text-emerald-300 font-semibold">Roger</th>
              <th className="text-center px-3 py-2 text-amber-300 font-semibold">Orchestrator</th>
              <th className="text-center px-3 py-2 text-purple-300 font-semibold">Governance</th>
            </tr>
          </thead>
          <tbody>
            {PLATFORM_OWNERSHIP.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-750"}>
                <td className="px-3 py-2 text-white font-medium">{row.domain}</td>
                <td className="px-3 py-2 text-center text-slate-300">{row.pdc}</td>
                <td className="px-3 py-2 text-center text-slate-300">{row.tdc}</td>
                <td className="px-3 py-2 text-center text-slate-300">{row.roger}</td>
                <td className="px-3 py-2 text-center text-slate-300">{row.orchestrator}</td>
                <td className="px-3 py-2 text-center text-slate-300">{row.governance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "roger-ba-responsibilities",
    title: "3. Roger BA Responsibilities",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-950 border border-emerald-800 rounded-lg p-4">
          <h4 className="text-emerald-300 font-bold text-sm mb-3">Roger BA Owns</h4>
          <ul className="space-y-1 text-sm text-slate-300">
            {[
              "Roger UI workflows and screen readiness",
              "Consumer experience validation",
              "UI field mapping validation",
              "API consumption validation",
              "Consumer dependency tracking",
              "Roger operational workflows",
              "Roger integration feedback",
              "Roger UI gaps and escalations",
              "Consumer readiness reporting",
              "Roger API Evolution alignment",
              "Coordination with DCT for missing governed fields",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-950 border border-red-800 rounded-lg p-4">
          <h4 className="text-red-300 font-bold text-sm mb-3">Roger BA Does NOT Own</h4>
          <ul className="space-y-1 text-sm text-slate-300">
            {[
              "Platform lineage",
              "Tax authority",
              "Immutable records",
              "Governance enforcement",
              "Taxonomy authority",
              "Filing authority",
              "Data system-of-record decisions",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "dct-ba-responsibilities",
    title: "4. DCT BA Responsibilities",
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
          <h4 className="text-blue-300 font-bold text-sm mb-3">DCT BA Owns</h4>
          <ul className="space-y-1 text-sm text-slate-300">
            {[
              "Platform governance alignment",
              "Batch delivery alignment",
              "Data lineage validation",
              "Taxonomy governance",
              "API contract alignment",
              "Architecture invariant enforcement",
              "Cross-platform dependency management",
              "Governance readiness",
              "PI demo readiness",
              "Source-of-truth alignment",
              "Swagger / platform validation",
              "Data object ownership clarity",
              "Operational integration readiness",
              "ADR identification and escalation",
              "Governance gap management",
              "End-to-end batch coordination",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
          <h4 className="text-blue-300 font-bold text-sm mb-3">DCT BA Is Also Responsible For</h4>
          <ul className="space-y-1 text-sm text-slate-300">
            {[
              "Ensuring Roger consumes governed outputs",
              "Identifying platform gaps impacting Roger",
              "Governance and architecture escalation",
              "Aligning delivery readiness vs operational readiness",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "shared-responsibilities",
    title: "5. Shared Responsibilities",
    content: (
      <div className="bg-purple-950 border border-purple-800 rounded-lg p-4">
        <h4 className="text-purple-300 font-bold text-sm mb-3">Shared Governance — Both Teams</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            "Integration alignment meetings",
            "Data mapping reviews",
            "API evolution discussions",
            "Delivery coordination",
            "Dependency management",
            "Cross-team demos",
            "Gap escalation",
            "Consumer validation",
            "Sprint readiness communication",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-purple-900 rounded px-3 py-2">
              <span className="text-purple-400 shrink-0">◈</span>
              <span className="text-sm text-slate-300">{item}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "escalation-model",
    title: "6. Governance Escalation Model",
    content: (
      <div className="space-y-4">
        {/* Escalation path */}
        <div className="flex items-center gap-2 flex-wrap">
          {["BA (Identifies)", "PO (Prioritizes)", "Architecture (Decides)", "Governance Review (Records)"].map((step, i, arr) => (
            <div key={i} className="flex items-center gap-2">
              <div className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm font-semibold text-white">{step}</div>
              {i < arr.length - 1 && <span className="text-amber-400 font-bold">→</span>}
            </div>
          ))}
        </div>
        {/* Escalation triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { trigger: "Ownership ambiguity", color: "red" },
            { trigger: "Missing lineage", color: "red" },
            { trigger: "Governance gaps (ADR candidate)", color: "purple" },
            { trigger: "API contract conflicts", color: "red" },
            { trigger: "Missing immutable records", color: "red" },
            { trigger: "UI consuming non-governed data", color: "red" },
            { trigger: "Filing authority conflicts", color: "red" },
            { trigger: "Cross-platform inconsistencies", color: "yellow" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                item.color === "red"
                  ? "bg-red-950 border border-red-800 text-red-200"
                  : item.color === "purple"
                  ? "bg-purple-950 border border-purple-800 text-purple-200"
                  : "bg-amber-950 border border-amber-800 text-amber-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {item.trigger}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "delivery-vs-consumer",
    title: "7. Delivery vs Consumer Readiness",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { left: "DCT delivery complete", right: "Roger consumer ready", note: "Batch gates passed ≠ Roger UI validated and mapped" },
            { left: "Roger UI ready", right: "Governance approved", note: "UI demo-ready ≠ all four governance gates passed" },
            { left: "APIs available", right: "Operationally consumable", note: "Endpoint operational ≠ lineage closed and contract published" },
            { left: "Demo-ready", right: "Production-ready", note: "Schema Lock + Invariant Lock ≠ Contract Publication + Lineage Closure" },
          ].map((row, i) => (
            <div key={i} className="bg-slate-700 rounded-lg p-3 flex items-center gap-3">
              <span className="text-emerald-400 text-sm font-semibold shrink-0">{row.left}</span>
              <span className="text-red-400 font-bold shrink-0">≠</span>
              <span className="text-red-300 text-sm font-semibold shrink-0">{row.right}</span>
              <span className="text-slate-400 text-xs ml-auto text-right">{row.note}</span>
            </div>
          ))}
        </div>
        <div className="bg-amber-950 border border-amber-700 rounded-lg p-4">
          <h4 className="text-amber-300 font-bold text-sm mb-2">Examples</h4>
          <ul className="space-y-1 text-sm text-slate-300">
            <li>• Endpoint exists but lacks lineage — API is operational but data is untraceable</li>
            <li>• Roger UI field exists but no governed source — field is displayed without a platform authority</li>
            <li>• API operational but governance incomplete — endpoint works but Read Contract is not published</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "dependency-management",
    title: "8. Integration Dependency Management",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold text-sm mb-3">Dependency Chain</h4>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="bg-blue-800 text-blue-200 px-2 py-0.5 rounded text-xs font-semibold">PDC/TDC</span>
                <span className="text-slate-400">→</span>
                <span>Governed outputs published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-800 text-blue-200 px-2 py-0.5 rounded text-xs font-semibold">API Contracts</span>
                <span className="text-slate-400">→</span>
                <span>Read Contract published</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-blue-800 text-blue-200 px-2 py-0.5 rounded text-xs font-semibold">Roger Mapping</span>
                <span className="text-slate-400">→</span>
                <span>UI field mapping validated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded text-xs font-semibold">Roger UI</span>
                <span className="text-slate-400">→</span>
                <span>Consumer-ready data point</span>
              </div>
            </div>
          </div>
          <div className="bg-red-950 border border-red-800 rounded-lg p-4">
            <h4 className="text-red-300 font-bold text-sm mb-3">Dependency Failure Examples</h4>
            <ul className="space-y-1 text-sm text-slate-300">
              <li>• Missing taxonomy mappings — Roger cannot classify data</li>
              <li>• Missing immutable records — tax decisions are unverifiable</li>
              <li>• Missing filing authority — consolidated filing is ungoverned</li>
              <li>• Partial API contracts — Roger reads incomplete data</li>
              <li>• Undefined ownership boundaries — data authority is ambiguous</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "source-of-truth",
    title: "9. Source-of-Truth Rules",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { source: "DCT Control Panel", role: "Operational System of Record", path: "/control-panel", color: "blue" },
            { source: "Batch Roadmap", role: "Delivery System of Record", path: "/batch-roadmap", color: "blue" },
            { source: "Roger UI Mapping", role: "Consumer Mapping SoR", path: "/roger-mapping", color: "emerald" },
            { source: "Roger API Evolution", role: "Roger Consumption SoR", path: "/roger-api", color: "emerald" },
            { source: "Governance ADRs", role: "Governance System of Record", path: "/data-model", color: "purple" },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.path}
              className={`block rounded-lg p-3 border transition-colors ${
                item.color === "blue"
                  ? "bg-blue-950 border-blue-800 hover:border-blue-600"
                  : item.color === "emerald"
                  ? "bg-emerald-950 border-emerald-800 hover:border-emerald-600"
                  : "bg-purple-950 border-purple-800 hover:border-purple-600"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <LinkIcon className="w-3 h-3 text-slate-400" />
                <span className="text-white font-semibold text-sm">{item.source}</span>
              </div>
              <p className="text-slate-400 text-xs">{item.role}</p>
            </Link>
          ))}
        </div>
        <div className="bg-red-950 border border-red-700 rounded-lg px-4 py-3">
          <p className="text-red-200 text-sm font-semibold">
            ⚠ Warning: No manual override or conflicting interpretation outside governed source-of-truth pages. All delivery and governance decisions must be traceable to a source-of-truth page.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "decision-matrix",
    title: "10. BA Decision Matrix",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-700">
              <th className="text-left px-3 py-2 text-slate-300 font-semibold">Question</th>
              <th className="text-center px-3 py-2 text-white font-semibold">Owner</th>
              <th className="text-center px-3 py-2 text-slate-300 font-semibold">Source System</th>
              <th className="text-left px-3 py-2 text-slate-300 font-semibold">Note</th>
            </tr>
          </thead>
          <tbody>
            {DECISION_MATRIX.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-800" : "bg-slate-750"}>
                <td className="px-3 py-2 text-white">{row.question}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      row.owner === "DCT BA"
                        ? "bg-blue-900 text-blue-200"
                        : row.owner === "Roger BA"
                        ? "bg-emerald-900 text-emerald-200"
                        : "bg-purple-900 text-purple-200"
                    }`}
                  >
                    {row.owner}
                  </span>
                </td>
                <td className="px-3 py-2 text-center text-slate-400">{row.system}</td>
                <td className="px-3 py-2 text-slate-300">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "misalignment-risks",
    title: "11. Common Misalignment Risks",
    content: (
      <div className="space-y-3">
        {MISALIGNMENT_RISKS.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg p-4 border ${
              item.severity === "red"
                ? "bg-red-950 border-red-800"
                : "bg-amber-950 border-amber-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${item.severity === "red" ? "text-red-400" : "text-amber-400"}`} />
              <div>
                <p className={`font-semibold text-sm ${item.severity === "red" ? "text-red-200" : "text-amber-200"}`}>{item.risk}</p>
                <p className="text-slate-300 text-xs mt-1">{item.description}</p>
                <p className="text-slate-400 text-xs mt-1 italic">Mitigation: {item.mitigation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "working-agreement",
    title: "12. Cross-Team Working Agreement",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { item: "Shared weekly alignment review", cadence: "Weekly" },
            { item: "Governance gap review", cadence: "Weekly" },
            { item: "API evolution review", cadence: "Bi-weekly" },
            { item: "Dependency escalation tracking", cadence: "Weekly" },
            { item: "Shared PI readiness checkpoints", cadence: "Per Sprint" },
            { item: "Shared demo readiness validation", cadence: "Pre-Demo" },
            { item: "Shared source-of-truth alignment", cadence: "Weekly" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-sm text-white">{item.item}</span>
              </div>
              <span className="text-xs bg-purple-900 text-purple-200 px-2 py-0.5 rounded-full font-medium shrink-0 ml-2">{item.cadence}</span>
            </div>
          ))}
        </div>
        {/* Final callout */}
        <div className="bg-gradient-to-r from-blue-950 via-purple-950 to-emerald-950 border border-purple-700 rounded-lg px-5 py-4 mt-2">
          <p className="text-white text-sm font-semibold text-center">
            "DCT governs platform truth. Roger governs consumer experience. Integration success requires governed alignment between both."
          </p>
        </div>
      </div>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function RogerVsDCTRoles() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["operational-model"]));
  const [expandAll, setExpandAll] = useState(false);

  const toggleSection = (id: string) => {
    if (expandAll) return;
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isExpanded = (id: string) => expandAll || expandedSections.has(id);

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900 rounded-lg">
            <Users className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Roger BA vs DCT BA — Roles, Responsibilities & Operational Boundaries</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines ownership boundaries, delivery responsibilities, governance expectations, and operational collaboration between the Roger BA and DCT BA teams.
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpandAll((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${
            expandAll
              ? "bg-purple-700 border-purple-500 text-white"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </div>

      {/* Color legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { color: "bg-blue-600", label: "DCT" },
          { color: "bg-emerald-600", label: "Roger" },
          { color: "bg-purple-600", label: "Shared Governance" },
          { color: "bg-red-600", label: "Escalation / Risk" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs text-slate-300">
            <span className={`w-3 h-3 rounded-full ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Subsections */}
      <div className="space-y-2">
        {SUBSECTIONS.map((section) => {
          const open = isExpanded(section.id);
          return (
            <div key={section.id} className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-750 transition-colors"
              >
                <span className="font-semibold text-white text-sm">{section.title}</span>
                <span className="text-slate-400">
                  {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
              </button>
              {open && (
                <div className="px-5 pb-5 border-t border-slate-700 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
