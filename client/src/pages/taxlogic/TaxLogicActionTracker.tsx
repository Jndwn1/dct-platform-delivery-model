// Tax Logic Repository Readiness — Action Tracker
// RSM | DCT Platform | Architecture & Readiness Workstream
// NON-PRODUCTION ARCHITECTURE REFERENCE

import { useState } from "react";
import GovernanceBanner from "@/components/GovernanceBanner";

const ACTIONS = [
  { id: "ACT-01", action: "Define StructuredLogic JSON schema", owner: "DCT Architecture + Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "None", risk: "Critical — blocks AI translation pilot", category: "Rule Repository Design" },
  { id: "ACT-02", action: "Add RuleId, RuleVersion, ExpirationDate columns to Krista workbook", owner: "Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "None", risk: "Critical — blocks AI translation pilot", category: "Rule Intake" },
  { id: "ACT-03", action: "Standardize Jurisdiction field in Krista workbook", owner: "Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-02", risk: "High — prevents automated ingestion", category: "Rule Intake" },
  { id: "ACT-04", action: "Add TaxFormReference to all Krista workbook entries", owner: "Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-02", risk: "High — TDC form template linking blocked", category: "Rule Intake" },
  { id: "ACT-05", action: "Define SME Approval workflow (approver, SLA, record format)", owner: "Tax SME + DCT", status: "Not Started", dueDate: "TBD", dependencies: "None", risk: "Critical — AI proposals cannot be promoted without approval workflow", category: "Governance" },
  { id: "ACT-06", action: "Define ConfidenceBandThreshold values aligned with TDC B3", owner: "TDC + Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "TDC B3 confidence band definitions", risk: "High — TDC AI mapping proposals blocked", category: "Rule Repository Design" },
  { id: "ACT-07", action: "Select five pilot rules from Krista workbook", owner: "Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-02, ACT-03", risk: "High — AI translation pilot cannot begin", category: "AI Translation Pilot" },
  { id: "ACT-08", action: "Run AI translation pilot — five rules", owner: "DCT + AI Orchestrator", status: "Not Started", dueDate: "TBD", dependencies: "ACT-01, ACT-07", risk: "High — pilot findings block broader rollout planning", category: "AI Translation Pilot" },
  { id: "ACT-09", action: "Tax SME review and approval of five pilot rule translations", owner: "Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-08", risk: "High — governed promotion blocked", category: "AI Translation Pilot" },
  { id: "ACT-10", action: "Document AI translation pilot findings and recommendations", owner: "DCT + Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-09", risk: "Medium — broader rollout planning delayed", category: "AI Translation Pilot" },
  { id: "ACT-11", action: "Resolve ADR-TL-01 — Rule Execution Ownership (TDC inline vs. external rules engine)", owner: "DCT Architecture + TDC Lead", status: "Not Started", dueDate: "Before B4 Sprint Planning", dependencies: "ADR-TL-01 options review", risk: "Critical — B4 AI Tax Mapping cannot be planned without this decision", category: "Architecture Decisions" },
  { id: "ACT-12", action: "Define Rule Metadata Read Contract endpoint structure", owner: "DCT Architecture", status: "Not Started", dueDate: "TBD", dependencies: "ACT-01, B9 PDC gateway scaffolding", risk: "Critical — all consumers blocked until contract is defined", category: "Gateway & API" },
  { id: "ACT-13", action: "Register rule metadata endpoints in Ocelot gateway (B9 PDC)", owner: "DCT", status: "Not Started", dueDate: "After B9 PDC QA", dependencies: "B9 PDC gateway scaffolding, ACT-12", risk: "High — consumer access blocked", category: "Gateway & API" },
  { id: "ACT-14", action: "Document ownership boundaries — approved by all teams", owner: "DCT Architecture + Tax SME + TDC Lead", status: "In Progress", dueDate: "TBD", dependencies: "None", risk: "Critical — success criterion 1", category: "Governance" },
  { id: "ACT-15", action: "Approve rule metadata structure", owner: "Tax SME + DCT Architecture", status: "Not Started", dueDate: "TBD", dependencies: "ACT-01, ACT-02", risk: "Critical — success criterion 2", category: "Rule Repository Design" },
  { id: "ACT-16", action: "Approve rule repository design", owner: "DCT Architecture", status: "Not Started", dueDate: "TBD", dependencies: "ACT-15", risk: "Critical — success criterion 4", category: "Rule Repository Design" },
  { id: "ACT-17", action: "Approve versioning and lineage strategy", owner: "DCT Architecture + Tax SME", status: "Not Started", dueDate: "TBD", dependencies: "ACT-16", risk: "Critical — success criterion 5", category: "Rule Repository Design" },
  { id: "ACT-18", action: "Approve gateway exposure strategy", owner: "DCT Architecture", status: "Not Started", dueDate: "TBD", dependencies: "ACT-12, B9 PDC", risk: "Critical — success criterion 6", category: "Gateway & API" },
];

const CATEGORIES = ["All", ...Array.from(new Set(ACTIONS.map(a => a.category)))];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Not Started": "bg-slate-100 text-slate-500 border border-slate-200",
    "In Progress": "bg-blue-100 text-blue-800 border border-blue-300",
    Complete: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    Blocked: "bg-red-100 text-red-800 border border-red-300",
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk.startsWith("Critical")) return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300">Critical</span>;
  if (risk.startsWith("High")) return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">High</span>;
  return <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">Medium</span>;
}

export default function TaxLogicActionTracker() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const filtered = selectedCategory === "All" ? ACTIONS : ACTIONS.filter(a => a.category === selectedCategory);

  const stats = {
    total: ACTIONS.length,
    notStarted: ACTIONS.filter(a => a.status === "Not Started").length,
    inProgress: ACTIONS.filter(a => a.status === "In Progress").length,
    complete: ACTIONS.filter(a => a.status === "Complete").length,
    critical: ACTIONS.filter(a => a.risk.startsWith("Critical")).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <GovernanceBanner />
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Architecture & Readiness</span>
            <span className="text-slate-300">›</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#003865]">Tax Logic Repository Readiness</span>
          </div>
          <h1 className="text-2xl font-bold text-[#003865]">Action Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">Owner, status, due date, dependencies, and risks for all workstream actions.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total Actions", value: stats.total, color: "text-[#003865]" },
            { label: "Not Started", value: stats.notStarted, color: "text-slate-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-blue-700" },
            { label: "Complete", value: stats.complete, color: "text-emerald-700" },
            { label: "Critical Risk", value: stats.critical, color: "text-red-700" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${selectedCategory === cat ? "bg-[#003865] text-white border-[#003865]" : "bg-white text-slate-600 border-slate-200 hover:border-[#003865] hover:text-[#003865]"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Action Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#003865] text-white">
                <th className="px-4 py-2 text-left font-semibold">ID</th>
                <th className="px-4 py-2 text-left font-semibold">Action</th>
                <th className="px-4 py-2 text-left font-semibold">Owner</th>
                <th className="px-4 py-2 text-left font-semibold">Status</th>
                <th className="px-4 py-2 text-left font-semibold">Due Date</th>
                <th className="px-4 py-2 text-left font-semibold">Dependencies</th>
                <th className="px-4 py-2 text-left font-semibold">Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, i) => (
                <tr key={a.id} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 whitespace-nowrap">{a.id}</td>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">{a.action}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{a.owner}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">{a.dueDate}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{a.dependencies}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap"><RiskBadge risk={a.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
