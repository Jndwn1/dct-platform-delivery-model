/**
 * RogerConsumerReadinessPanel
 *
 * PURPOSE: Surface consumer-facing readiness information for Roger teams on the Control Panel.
 * PERSPECTIVE: "What can Roger operationally consume today?" — not "How is DCT building it?"
 *
 * Sections:
 *   1. Consumer Readiness Summary Banner
 *   2. Roger Endpoint Readiness Matrix (filterable)
 *   3. Platform Exists vs Roger Can Consume distinction
 *   4. Integration Risks (Roger consumer perspective)
 */

import React, { useState, useMemo } from "react";
import {
  ENDPOINT_READINESS_MATRIX,
  INTEGRATION_RISKS,
  CONSUMER_READINESS_STYLES,
  DATA_AVAILABILITY_STYLES,
  type ConsumerReadiness,
  type DataAvailability,
} from "@/lib/rogerConsumerReadiness";
import {
  CheckCircle2, AlertTriangle, XCircle, Clock, Eye,
  ChevronDown, ChevronUp, AlertCircle, Shield, Zap,
  ArrowRight, Info, Copy, Filter,
} from "lucide-react";

// ── Readiness Badge ───────────────────────────────────────────────────────────

function ReadinessBadge({ status }: { status: ConsumerReadiness }) {
  const s = CONSUMER_READINESS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {status === "Consumer Ready" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Delivered" && <CheckCircle2 className="w-3 h-3" />}
      {status === "Partial Data" && <AlertTriangle className="w-3 h-3" />}
      {status === "Mock/Demo Only" && <Eye className="w-3 h-3" />}
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
    <span
      className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RogerConsumerReadinessPanel() {
  const [open, setOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ConsumerReadiness | "All">("All");
  const [showRisks, setShowRisks] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // Summary counts
  const consumerReady = ENDPOINT_READINESS_MATRIX.filter(r => r.rogerCanConsume).length;
  const total = ENDPOINT_READINESS_MATRIX.length;
  const blocked = ENDPOINT_READINESS_MATRIX.filter(r => r.consumerReadiness === "Blocked" || r.consumerReadiness === "Future State").length;
  const govPending = ENDPOINT_READINESS_MATRIX.filter(r => r.consumerReadiness === "Governance Pending").length;
  const partial = ENDPOINT_READINESS_MATRIX.filter(r => r.consumerReadiness === "Partial Data").length;
  const highRisks = INTEGRATION_RISKS.filter(r => r.severity === "High").length;

  // Filter
  const filtered = useMemo(() => {
    if (activeFilter === "All") return ENDPOINT_READINESS_MATRIX;
    return ENDPOINT_READINESS_MATRIX.filter(r => r.consumerReadiness === activeFilter);
  }, [activeFilter]);

  const filterOptions: Array<ConsumerReadiness | "All"> = [
    "All", "Consumer Ready", "Delivered", "Partial Data",
    "Governance Pending", "Blocked", "Future State",
  ];

  const copyMatrix = () => {
    const header = "Batch | API | Roger Capability | Consumer Readiness | Data Available | Blockers";
    const rows = ENDPOINT_READINESS_MATRIX.map(r =>
      `${r.batch} | ${r.api} | ${r.rogerCapability} | ${r.consumerReadiness} | ${r.dataAvailability} | ${r.blockers || "None"}`
    );
    navigator.clipboard.writeText([header, ...rows].join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 cursor-pointer select-none"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)" }}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Eye className="w-4 h-4 text-blue-200 shrink-0" />
          <div>
            <div className="text-sm font-bold text-white">Roger Consumer Readiness</div>
            <div className="text-xs text-blue-200 mt-0.5">What Roger can operationally consume today · {consumerReady} of {total} endpoints consumer-ready</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {highRisks > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> {highRisks} High Risk
            </span>
          )}
          <span className="text-xs text-blue-200 font-medium">{consumerReady}/{total} Ready</span>
          {open ? <ChevronUp className="w-4 h-4 text-blue-200" /> : <ChevronDown className="w-4 h-4 text-blue-200" />}
        </div>
      </div>

      {open && (
        <div className="divide-y divide-slate-100">
          {/* Summary tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-100 bg-slate-50">
            {[
              { label: "Consumer Ready", value: consumerReady, color: "#065f46", bg: "#d1fae5", icon: <CheckCircle2 className="w-4 h-4" /> },
              { label: "Partial / Pending", value: partial + govPending, color: "#854d0e", bg: "#fef9c3", icon: <AlertTriangle className="w-4 h-4" /> },
              { label: "Blocked / Future", value: blocked, color: "#991b1b", bg: "#fee2e2", icon: <XCircle className="w-4 h-4" /> },
              { label: "Integration Risks", value: INTEGRATION_RISKS.length, color: "#1e40af", bg: "#dbeafe", icon: <AlertCircle className="w-4 h-4" /> },
            ].map(t => (
              <div key={t.label} className="px-4 py-3 flex items-center gap-2.5">
                <span style={{ color: t.color, background: t.bg }} className="p-1.5 rounded-lg">{t.icon}</span>
                <div>
                  <div className="text-xl font-bold" style={{ color: t.color }}>{t.value}</div>
                  <div className="text-xs text-slate-500 leading-tight">{t.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Governance note */}
          <div className="px-5 py-2.5 bg-blue-50 flex items-start gap-2 text-xs text-blue-800">
            <Shield className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
            <span>
              <strong>Governance Rule:</strong> Roger consumes governed contracts via the Roger Gateway.
              PDC = Phoenix Data Consolidation (operational layer). TDC = Tax Data Consolidation (tax authority layer).
              Roger does not own lineage, governance, or tax authority.
            </span>
          </div>

          {/* Filter bar */}
          <div className="px-5 py-2.5 flex flex-wrap items-center gap-2 bg-white">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
            {filterOptions.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  activeFilter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
              >
                {f}
              </button>
            ))}
            <button
              onClick={copyMatrix}
              className="ml-auto flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 border border-slate-200 rounded px-2 py-1 transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy Matrix"}
            </button>
          </div>

          {/* Endpoint Readiness Matrix */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ minWidth: 900 }}>
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-12">Batch</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-48">API</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-44">Roger Capability</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-36">Consumer Readiness</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-28">Data Available</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Platform / Roger</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Governance / Blockers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row, i) => (
                  <React.Fragment key={i}>
                    <tr
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedRow === i ? "bg-blue-50" : ""}`}
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono font-bold text-slate-700 text-xs">{row.batch}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-800 leading-tight">{row.api}</div>
                        <div className="text-slate-400 font-mono text-xs mt-0.5 break-all">{row.path}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-slate-700 leading-tight">{row.rogerCapability}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <ReadinessBadge status={row.consumerReadiness} />
                      </td>
                      <td className="px-3 py-2.5">
                        <DataBadge status={row.dataAvailability} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-semibold ${row.platformExists ? "text-emerald-700" : "text-slate-400"}`}>
                            {row.platformExists ? "✓ Platform" : "○ Platform"}
                          </span>
                          <span className={`text-xs font-semibold ${row.rogerCanConsume ? "text-emerald-700" : "text-red-600"}`}>
                            {row.rogerCanConsume ? "✓ Roger" : "✗ Roger"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {row.blockers && row.blockers !== "None" ? (
                          <span className="text-amber-700 leading-snug">{row.blockers}</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">No blockers</span>
                        )}
                      </td>
                    </tr>
                    {expandedRow === i && (
                      <tr className="bg-blue-50">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <div className="font-semibold text-slate-700 mb-1">Governance Status</div>
                              <div className="text-slate-600">{row.governanceStatus}</div>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-700 mb-1">Owner</div>
                              <div className="text-slate-600">{row.owner}</div>
                            </div>
                            <div className="col-span-2">
                              <div className="font-semibold text-slate-700 mb-1">Platform Exists vs Roger Can Consume</div>
                              <div className="flex items-center gap-4">
                                <span className={`flex items-center gap-1 font-semibold ${row.platformExists ? "text-emerald-700" : "text-slate-400"}`}>
                                  {row.platformExists ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                  Platform: {row.platformExists ? "Exists" : "In Development"}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                <span className={`flex items-center gap-1 font-semibold ${row.rogerCanConsume ? "text-emerald-700" : "text-red-600"}`}>
                                  {row.rogerCanConsume ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  Roger: {row.rogerCanConsume ? "Can Consume" : "Cannot Consume Yet"}
                                </span>
                              </div>
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

          {/* Integration Risks toggle */}
          <div className="px-5 py-2.5 bg-white">
            <button
              onClick={() => setShowRisks(r => !r)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-red-600 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
              Integration Risks — Roger Consumer Perspective ({INTEGRATION_RISKS.length} total, {highRisks} high)
              {showRisks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showRisks && (
            <div className="divide-y divide-slate-100">
              {INTEGRATION_RISKS.map(risk => (
                <div key={risk.id} className="px-5 py-3 flex items-start gap-3">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded shrink-0 mt-0.5"
                    style={{
                      background: risk.severity === "High" ? "#fee2e2" : risk.severity === "Medium" ? "#fef9c3" : "#f1f5f9",
                      color: risk.severity === "High" ? "#991b1b" : risk.severity === "Medium" ? "#854d0e" : "#475569",
                    }}
                  >
                    {risk.severity}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-slate-800">{risk.id} — {risk.title}</span>
                      <span className="text-xs text-slate-400">{risk.batch}</span>
                      <span className="text-xs text-slate-400 italic">{risk.category}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-snug">{risk.description}</div>
                    <div className="flex items-start gap-1 mt-1">
                      <Zap className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                      <span className="text-xs text-blue-700 font-medium">{risk.resolution}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.affectedScreens.map(s => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {risk.adoStory && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{risk.adoStory}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="px-5 py-3 bg-slate-50 flex flex-wrap gap-x-4 gap-y-1.5">
            <span className="text-xs font-semibold text-slate-500 w-full mb-0.5">Legend:</span>
            {(Object.keys(CONSUMER_READINESS_STYLES) as ConsumerReadiness[]).map(s => (
              <span key={s} className="flex items-center gap-1 text-xs" style={{ color: CONSUMER_READINESS_STYLES[s].text }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: CONSUMER_READINESS_STYLES[s].border }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
