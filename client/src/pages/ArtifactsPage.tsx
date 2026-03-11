// Artifacts — Full DCT Platform Artifact Registry
// RSM | CATT | DCT Platform Executive Demo Environment v3.1

import { useState } from "react";
import { CheckCircle2, Clock, Circle, FileText, Lock, Shield, Link2, User, Calendar, Filter } from "lucide-react";
import { activeBatch } from "@/lib/dctData";
import type { GateArtifact } from "@/lib/dctData";

// ─── CONFIG ───────────────────────────────────────────────────────────────────

const ARTIFACT_STATUS = {
  ISSUED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Issued" },
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending" },
  MISSING: { icon: Circle, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", badge: "bg-slate-100 text-slate-600 border-slate-200", label: "Missing" },
};

const GATE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string; accentBar: string }> = {
  G1: { icon: Lock, color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", accentBar: "bg-violet-500" },
  G2: { icon: Shield, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", accentBar: "bg-blue-500" },
  G3: { icon: Link2, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", accentBar: "bg-emerald-500" },
  G4: { icon: FileText, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", accentBar: "bg-amber-500" },
};

// ─── ARTIFACT ROW ─────────────────────────────────────────────────────────────

function ArtifactTableRow({ artifact, gateId, gateName }: {
  artifact: GateArtifact;
  gateId: string;
  gateName: string;
}) {
  const cfg = ARTIFACT_STATUS[artifact.status];
  const Icon = cfg.icon;
  const gateCfg = GATE_CONFIG[gateId] || GATE_CONFIG.G1;

  return (
    <tr className="border-b border-border hover:bg-slate-50 transition-colors">
      <td className="py-3 px-4">
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${gateCfg.bg} ${gateCfg.color} ${gateCfg.border}`}>
          {artifact.id}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="text-xs font-medium text-foreground">{artifact.name}</div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${gateCfg.bg} ${gateCfg.color} ${gateCfg.border}`}>
          {gateId} — {gateName}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border font-medium w-fit ${cfg.badge}`}>
          <Icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">
        {artifact.issuedDate ? (
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />{artifact.issuedDate}
          </span>
        ) : "—"}
      </td>
      <td className="py-3 px-4 text-xs text-muted-foreground">
        {artifact.issuedBy ? (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />{artifact.issuedBy}
          </span>
        ) : "—"}
      </td>
    </tr>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function ArtifactsPage() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterGate, setFilterGate] = useState<string>("ALL");

  // Flatten all artifacts across all gates
  const allArtifacts = activeBatch.gates.flatMap(gate =>
    gate.artifacts.map(artifact => ({ artifact, gateId: gate.id, gateName: gate.name }))
  );

  const issued = allArtifacts.filter(a => a.artifact.status === "ISSUED").length;
  const pending = allArtifacts.filter(a => a.artifact.status === "PENDING").length;
  const missing = allArtifacts.filter(a => a.artifact.status === "MISSING").length;
  const total = allArtifacts.length;

  const filtered = allArtifacts.filter(({ artifact, gateId }) => {
    const statusMatch = filterStatus === "ALL" || artifact.status === filterStatus;
    const gateMatch = filterGate === "ALL" || gateId === filterGate;
    return statusMatch && gateMatch;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-foreground">Artifact Registry</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AB-01 · {total} artifacts across G1–G4 · governance artifact tracking
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total Artifacts", value: total, color: "text-[#003A8F]", bg: "bg-blue-50 border-blue-200" },
          { label: "Issued", value: issued, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Pending", value: pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Missing", value: missing, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
        ].map(kpi => (
          <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg}`}>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Artifact Issuance Progress</span>
          <span className="text-xs text-muted-foreground">{issued}/{total} issued ({Math.round((issued / total) * 100)}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-[#003A8F] transition-all"
            style={{ width: `${Math.round((issued / total) * 100)}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Issued: {issued}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Pending: {pending}</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />Missing: {missing}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "ISSUED", "PENDING", "MISSING"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                filterStatus === s
                  ? "bg-[#003A8F] text-white border-[#003A8F]"
                  : "bg-white text-muted-foreground border-border hover:border-[#003A8F]/40"
              }`}
            >
              {s === "ALL" ? "All Status" : s}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        <div className="flex flex-wrap gap-1.5">
          {["ALL", "G1", "G2", "G3", "G4"].map(g => (
            <button
              key={g}
              onClick={() => setFilterGate(g)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                filterGate === g
                  ? "bg-[#003A8F] text-white border-[#003A8F]"
                  : "bg-white text-muted-foreground border-border hover:border-[#003A8F]/40"
              }`}
            >
              {g === "ALL" ? "All Gates" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Artifact table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-[#003A8F] text-white">
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Artifact ID</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Artifact Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Gate</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Issued Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wider">Issued By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ artifact, gateId, gateName }) => (
              <ArtifactTableRow
                key={artifact.id}
                artifact={artifact}
                gateId={gateId}
                gateName={gateName}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-muted-foreground">
                  No artifacts match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Gate summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {activeBatch.gates.map(gate => {
          const cfg = GATE_CONFIG[gate.id] || GATE_CONFIG.G1;
          const GateIcon = cfg.icon;
          const gateIssued = gate.artifacts.filter(a => a.status === "ISSUED").length;
          const gateTotal = gate.artifacts.length;
          const pct = gateTotal > 0 ? Math.round((gateIssued / gateTotal) * 100) : 0;
          return (
            <div key={gate.id} className={`border rounded-xl p-4 ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <GateIcon className={`w-4 h-4 ${cfg.color}`} />
                <span className={`text-xs font-bold ${cfg.color}`}>{gate.id}</span>
              </div>
              <div className="text-xs font-medium text-foreground mb-1">{gate.name}</div>
              <div className="w-full bg-white/60 rounded-full h-1.5 mb-1">
                <div
                  className={`h-1.5 rounded-full ${cfg.accentBar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{gateIssued}/{gateTotal} artifacts · {pct}%</div>
            </div>
          );
        })}
      </div>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Artifact Registry · RSM | CATT · v3.1</span>
          <span>All artifacts required before gate promotion</span>
        </div>
      </footer>
    </div>
  );
}
