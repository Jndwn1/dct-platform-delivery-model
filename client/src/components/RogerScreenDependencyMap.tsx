/**
 * RogerScreenDependencyMap
 *
 * PURPOSE: Translate architecture into Roger usability.
 * Shows which Roger screens depend on which APIs, their readiness, and gaps.
 *
 * Sections:
 *   1. Roger UI Screen Dependency Map (table)
 *   2. Gateway Consumer Flow (visual)
 *   3. Demo vs Production Readiness Table
 */

import React, { useState } from "react";
import {
  ROGER_SCREEN_DEPENDENCY_MAP,
  DEMO_READINESS_TABLE,
  GATEWAY_FLOW_STEPS,
  CONSUMER_READINESS_STYLES,
  DATA_AVAILABILITY_STYLES,
  type ConsumerReadiness,
  type DataAvailability,
  type DemoReadiness,
  type ProdReadiness,
} from "@/lib/rogerConsumerReadiness";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, ArrowDown, Shield, Monitor,
  Copy, Filter, Layers,
} from "lucide-react";

// ── Badges ────────────────────────────────────────────────────────────────────

function ReadinessBadge({ status }: { status: ConsumerReadiness }) {
  const s = CONSUMER_READINESS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {status === "Consumer Ready" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Partial Data" && <AlertTriangle className="w-3 h-3" />}
      {status === "Governance Pending" && <Clock className="w-3 h-3" />}
      {status === "Blocked" && <XCircle className="w-3 h-3" />}
      {status === "Future State" && <Clock className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function DataBadge({ status }: { status: DataAvailability }) {
  const s = DATA_AVAILABILITY_STYLES[status];
  return (
    <span className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

const DEMO_STYLES: Record<DemoReadiness, { bg: string; text: string }> = {
  "Demo Ready":    { bg: "#d1fae5", text: "#065f46" },
  "Partial Demo":  { bg: "#fef9c3", text: "#854d0e" },
  "Mocked":        { bg: "#f3e8ff", text: "#6b21a8" },
  "Conceptual":    { bg: "#f1f5f9", text: "#475569" },
  "Not Started":   { bg: "#fee2e2", text: "#991b1b" },
};

const PROD_STYLES: Record<ProdReadiness, { bg: string; text: string }> = {
  "Production Ready": { bg: "#d1fae5", text: "#065f46" },
  "Near Ready":       { bg: "#dbeafe", text: "#1e40af" },
  "In Progress":      { bg: "#fff7ed", text: "#c2410c" },
  "Blocked":          { bg: "#fee2e2", text: "#991b1b" },
  "Future State":     { bg: "#f1f5f9", text: "#475569" },
};

// ── Main Component ────────────────────────────────────────────────────────────

export function RogerScreenDependencyMap() {
  const [openSection, setOpenSection] = useState<"screens" | "gateway" | "demo" | null>("screens");
  const [expandedScreen, setExpandedScreen] = useState<number | null>(null);
  const [demoFilter, setDemoFilter] = useState<"All" | "Demo Ready" | "Mocked" | "Conceptual">("All");
  const [copied, setCopied] = useState(false);

  const filteredDemo = demoFilter === "All"
    ? DEMO_READINESS_TABLE
    : DEMO_READINESS_TABLE.filter(r => r.demoReady === demoFilter);

  const copyScreenMap = () => {
    const header = "Roger Screen | Required APIs | Readiness | Data Available | Gaps";
    const rows = ROGER_SCREEN_DEPENDENCY_MAP.map(r =>
      `${r.screen} | ${r.requiredApis.join("; ")} | ${r.overallReadiness} | ${r.dataAvailability} | ${r.gaps}`
    );
    navigator.clipboard.writeText([header, ...rows].join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggle = (s: typeof openSection) => setOpenSection(o => o === s ? null : s);

  return (
    <div className="space-y-4">

      {/* ── Section: Roger UI Screen Dependency Map ────────────────────────── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div
          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none bg-gradient-to-r from-slate-800 to-slate-700"
          onClick={() => toggle("screens")}
        >
          <Monitor className="w-4 h-4 text-slate-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">Roger UI Screen Dependency Map</div>
            <div className="text-xs text-slate-300 mt-0.5">Which Roger screens depend on which APIs — readiness, data availability, and gaps</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); copyScreenMap(); }}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white border border-slate-600 rounded px-2 py-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
            {openSection === "screens" ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
          </div>
        </div>

        {openSection === "screens" && (
          <div>
            {/* Governance note */}
            <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-start gap-2 text-xs text-slate-600">
              <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
              <span>Roger consumes governed contracts via the Roger Gateway. Roger does not own lineage, governance, or tax authority. PDC = Phoenix Data Consolidation. TDC = Tax Data Consolidation.</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 800 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Roger Screen</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-48">Required APIs</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-36">Readiness</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Data Available</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Gaps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROGER_SCREEN_DEPENDENCY_MAP.map((row, i) => (
                    <React.Fragment key={i}>
                      <tr
                        className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedScreen === i ? "bg-blue-50" : ""}`}
                        onClick={() => setExpandedScreen(expandedScreen === i ? null : i)}
                      >
                        <td className="px-3 py-2.5">
                          <div className="font-bold text-slate-800">{row.screen}</div>
                          <div className="text-slate-400 mt-0.5 leading-tight">{row.description.slice(0, 40)}…</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-1">
                            {row.requiredApis.slice(0, 2).map(api => (
                              <span key={api} className="text-slate-700 leading-tight">{api}</span>
                            ))}
                            {row.requiredApis.length > 2 && (
                              <span className="text-blue-600 font-medium">+{row.requiredApis.length - 2} more</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.requiredBatches.map(b => (
                              <span key={b} className="font-mono text-xs bg-slate-100 text-slate-600 px-1 py-0.5 rounded">{b}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <ReadinessBadge status={row.overallReadiness} />
                        </td>
                        <td className="px-3 py-2.5">
                          <DataBadge status={row.dataAvailability} />
                        </td>
                        <td className="px-3 py-2.5">
                          {row.gaps === "None" || row.gaps.startsWith("None") ? (
                            <span className="text-emerald-700 font-medium">No gaps</span>
                          ) : (
                            <span className="text-amber-700 leading-snug">{row.gaps}</span>
                          )}
                        </td>
                      </tr>
                      {expandedScreen === i && (
                        <tr className="bg-blue-50">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <div className="font-semibold text-slate-700 mb-1">All Required APIs</div>
                                <ul className="space-y-0.5">
                                  {row.requiredApis.map(api => (
                                    <li key={api} className="text-slate-600">• {api}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-700 mb-1">Notes</div>
                                <div className="text-slate-600 leading-snug">{row.notes}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Section: Gateway Consumer Flow ─────────────────────────────────── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div
          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none bg-gradient-to-r from-purple-900 to-purple-700"
          onClick={() => toggle("gateway")}
        >
          <Layers className="w-4 h-4 text-purple-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">Gateway Consumer Flow</div>
            <div className="text-xs text-purple-200 mt-0.5">How Roger consumes governed APIs — ownership boundaries and access mediation</div>
          </div>
          {openSection === "gateway" ? <ChevronUp className="w-4 h-4 text-purple-200" /> : <ChevronDown className="w-4 h-4 text-purple-200" />}
        </div>

        {openSection === "gateway" && (
          <div className="px-6 py-6">
            <div className="flex flex-col items-center gap-0 max-w-lg mx-auto">
              {GATEWAY_FLOW_STEPS.map((step, i) => (
                <React.Fragment key={step.id}>
                  <div
                    className="w-full rounded-xl border-2 px-5 py-4"
                    style={{ borderColor: step.color, background: step.bg }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ background: step.color }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: step.color }}>{step.label}</div>
                        <div className="text-xs font-medium text-slate-500">{step.sublabel}</div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 mb-2 leading-snug">{step.description}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-1">Owns:</div>
                        {step.owns.map(o => (
                          <div key={o} className="text-xs text-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: step.color }} />
                            {o}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-500 mb-1">Does NOT own:</div>
                        {step.doesNotOwn.map(o => (
                          <div key={o} className="text-xs text-slate-500 flex items-center gap-1">
                            <XCircle className="w-3 h-3 shrink-0 text-slate-300" />
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {i < GATEWAY_FLOW_STEPS.length - 1 && (
                    <div className="flex flex-col items-center py-1">
                      <ArrowDown className="w-5 h-5 text-slate-400" />
                      <span className="text-xs text-slate-400 font-medium">Governed Contract</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
              <strong>Key Principle:</strong> Roger consumes governed contracts — it does not access PDC/TDC internals directly.
              The Gateway enforces contracts, auth, and ownership boundaries. Internal PDC/TDC implementations may evolve independently without breaking Roger consumers.
            </div>
          </div>
        )}
      </div>

      {/* ── Section: Demo vs Production Readiness ──────────────────────────── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div
          className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none bg-gradient-to-r from-emerald-900 to-emerald-700"
          onClick={() => toggle("demo")}
        >
          <Eye className="w-4 h-4 text-emerald-200 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">Demo vs Production Readiness</div>
            <div className="text-xs text-emerald-200 mt-0.5">What can be shown today vs what is production-ready vs what is mocked or conceptual</div>
          </div>
          {openSection === "demo" ? <ChevronUp className="w-4 h-4 text-emerald-200" /> : <ChevronDown className="w-4 h-4 text-emerald-200" />}
        </div>

        {openSection === "demo" && (
          <div>
            {/* Summary tiles */}
            <div className="grid grid-cols-4 divide-x divide-slate-100 bg-slate-50 border-b border-slate-100">
              {[
                { label: "Demo Ready", count: DEMO_READINESS_TABLE.filter(r => r.demoReady === "Demo Ready").length, color: "#065f46", bg: "#d1fae5" },
                { label: "Partial Demo", count: DEMO_READINESS_TABLE.filter(r => r.demoReady === "Partial Demo").length, color: "#854d0e", bg: "#fef9c3" },
                { label: "Mocked", count: DEMO_READINESS_TABLE.filter(r => r.demoReady === "Mocked").length, color: "#6b21a8", bg: "#f3e8ff" },
                { label: "Conceptual", count: DEMO_READINESS_TABLE.filter(r => r.demoReady === "Conceptual").length, color: "#475569", bg: "#f1f5f9" },
              ].map(t => (
                <div key={t.label} className="px-4 py-3 text-center">
                  <div className="text-2xl font-bold" style={{ color: t.color }}>{t.count}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.label}</div>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="px-5 py-2.5 flex items-center gap-2 border-b border-slate-100">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">Filter:</span>
              {(["All", "Demo Ready", "Mocked", "Conceptual"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setDemoFilter(f)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                    demoFilter === f
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 750 }}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-40">Capability</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-32">Roger Screen</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Demo Ready</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Production Ready</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-16">Batch</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDemo.map((row, i) => {
                    const ds = DEMO_STYLES[row.demoReady];
                    const ps = PROD_STYLES[row.prodReady];
                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{row.capability}</td>
                        <td className="px-3 py-2.5 text-slate-600">{row.screen}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: ds.bg, color: ds.text }}>
                            {row.demoReady}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: ps.bg, color: ps.text }}>
                            {row.prodReady}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{row.batch}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="text-slate-600 leading-snug">{row.demoNotes}</div>
                          {row.prodNotes !== row.demoNotes && (
                            <div className="text-slate-400 mt-0.5 leading-snug italic">{row.prodNotes}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
