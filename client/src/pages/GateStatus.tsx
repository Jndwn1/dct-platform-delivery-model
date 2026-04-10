// Gate Status — G1–G4 Full Artifact Checklist and Verification Status
// RSM | CATT | DCT Platform Executive Demo Environment v3.1

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Shield, Link2, FileText, CheckCircle2, Clock, Circle,
  AlertTriangle, ChevronDown, ChevronRight, User, Calendar
} from "lucide-react";
import { activeBatch } from "@/lib/dctData";
import type { Gate, GateArtifact } from "@/lib/dctData";
import { useBatchStatus, deriveGateStatus } from "@/contexts/BatchStatusContext";

// ─── GATE CONFIG ──────────────────────────────────────────────────────────────

const GATE_CONFIG: Record<string, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  G1: {
    icon: Lock,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    description: "Certifies that the data entity schema in PDC is validated, stable, and approved for downstream use.",
  },
  G2: {
    icon: Shield,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    description: "Certifies that all tax domain business rules and constraints are validated and versioned.",
  },
  G3: {
    icon: Link2,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Certifies that the full data provenance graph is complete and traceable from client source through PDC.",
  },
  G4: {
    icon: FileText,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    description: "Certifies that the published data contract conforms to platform standards and is ready for consumer access.",
  },
};

const STATUS_CONFIG = {
  PASSED: { badge: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  PENDING: { badge: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock, dot: "bg-amber-500" },
  BLOCKED: { badge: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle, dot: "bg-red-500" },
  PLANNED: { badge: "bg-slate-100 text-slate-600 border-slate-200", icon: Circle, dot: "bg-slate-400" },
};

const ARTIFACT_STATUS = {
  ISSUED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Issued" },
  PENDING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Pending" },
  MISSING: { icon: Circle, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", label: "Missing" },
};

// ─── ARTIFACT ROW ─────────────────────────────────────────────────────────────

function ArtifactRow({ artifact }: { artifact: GateArtifact }) {
  const cfg = ARTIFACT_STATUS[artifact.status];
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-foreground">{artifact.name}</span>
          <span className="text-xs font-mono text-muted-foreground">{artifact.id}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded border font-medium ml-auto ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>
        {artifact.issuedDate && (
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{artifact.issuedDate}
            </span>
            {artifact.issuedBy && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />{artifact.issuedBy}
              </span>
            )}
          </div>
        )}
        {!artifact.issuedDate && artifact.issuedBy && (
          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
            <User className="w-3 h-3" />
            <span>Pending from: {artifact.issuedBy}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── GATE CARD ────────────────────────────────────────────────────────────────

function GateCard({ gate, isExpanded, onToggle }: {
  gate: Gate;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cfg = GATE_CONFIG[gate.id] || GATE_CONFIG.G1;
  const statusCfg = STATUS_CONFIG[gate.status] || STATUS_CONFIG.PLANNED;
  const StatusIcon = statusCfg.icon;
  const GateIcon = cfg.icon;

  const issuedCount = gate.artifacts.filter(a => a.status === "ISSUED").length;
  const totalCount = gate.artifacts.length;
  const pct = totalCount > 0 ? Math.round((issuedCount / totalCount) * 100) : 0;

  return (
    <div className={`bg-white border border-border rounded-xl shadow-sm overflow-hidden`}>
      {/* Color accent bar */}
      <div className={`h-1 ${
        gate.id === "G1" ? "bg-violet-500" :
        gate.id === "G2" ? "bg-blue-500" :
        gate.id === "G3" ? "bg-emerald-500" : "bg-amber-500"
      }`} />

      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Gate icon */}
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.border} border flex items-center justify-center shrink-0`}>
          <GateIcon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">{gate.id}</span>
            <span className="text-sm font-bold text-foreground">{gate.name}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ml-auto ${statusCfg.badge}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {gate.status}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
            <div
              className={`h-1.5 rounded-full transition-all ${
                gate.id === "G1" ? "bg-violet-500" :
                gate.id === "G2" ? "bg-blue-500" :
                gate.id === "G3" ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span>{issuedCount}/{totalCount} artifacts issued</span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />{gate.approvingAuthority}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />Updated: {gate.lastUpdated}
            </span>
            {gate.openIssues > 0 && (
              <span className="flex items-center gap-1 text-red-600">
                <AlertTriangle className="w-3 h-3" />{gate.openIssues} open issue{gate.openIssues > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Expand */}
        <div className="shrink-0 mt-1">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-border">
              <div className="mt-4 space-y-4">
                {/* Purpose */}
                <div className={`${cfg.bg} ${cfg.border} border rounded-lg p-3`}>
                  <div className={`text-xs font-semibold ${cfg.color} mb-1`}>Gate Purpose</div>
                  <p className="text-xs text-foreground leading-relaxed">{gate.purpose}</p>
                </div>

                {/* Artifacts */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Required Artifacts ({issuedCount}/{totalCount} issued)
                  </div>
                  <div className="space-y-2">
                    {gate.artifacts.map(artifact => (
                      <ArtifactRow key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function GateStatus() {
  const [expanded, setExpanded] = useState<string>("G1");
  const { statuses } = useBatchStatus();
  const derivedGates = deriveGateStatus(statuses);

  // Map derived gate statuses to the PASSED/PENDING/PLANNED vocabulary
  const GATE_STATUS_MAP: Record<string, Gate["status"]> = {
    G1: derivedGates.g1 === "Complete" ? "PASSED" : derivedGates.g1 === "In Progress" ? "PENDING" : "PLANNED",
    G2: derivedGates.g2 === "Complete" ? "PASSED" : derivedGates.g2 === "In Progress" ? "PENDING" : "PLANNED",
    G3: derivedGates.g3 === "Complete" ? "PASSED" : derivedGates.g3 === "In Progress" ? "PENDING" : "PLANNED",
    G4: derivedGates.g4 === "Complete" ? "PASSED" : derivedGates.g4 === "In Progress" ? "PENDING" : "PLANNED",
  };
  const gates = activeBatch.gates.map(g => ({
    ...g,
    status: GATE_STATUS_MAP[g.id] ?? g.status,
  }));

  const passed = gates.filter(g => g.status === "PASSED").length;
  const pending = gates.filter(g => g.status === "PENDING").length;
  const planned = gates.filter(g => g.status === "PLANNED").length;

  const totalArtifacts = gates.reduce((sum, g) => sum + g.artifacts.length, 0);
  const issuedArtifacts = gates.reduce((sum, g) => sum + g.artifacts.filter(a => a.status === "ISSUED").length, 0);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">Gate Status</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            AB-01 · Foundation &amp; Source Onboarding · G1–G4 verification status
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-amber-500" />{pending} Pending
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full font-medium">
            <div className="w-2 h-2 rounded-full bg-slate-400" />{planned} Planned
          </span>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Gates Passed", value: passed, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Gates Pending", value: pending, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
          { label: "Gates Planned", value: planned, color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
          { label: "Artifacts Issued", value: `${issuedArtifacts}/${totalArtifacts}`, color: "text-[#003A8F]", bg: "bg-blue-50 border-blue-200" },
        ].map(kpi => (
          <div key={kpi.label} className={`border rounded-xl p-4 ${kpi.bg}`}>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Gate cards */}
      <div className="space-y-3">
        {gates.map(gate => (
          <GateCard
            key={gate.id}
            gate={gate}
            isExpanded={expanded === gate.id}
            onToggle={() => setExpanded(prev => prev === gate.id ? "" : gate.id)}
          />
        ))}
      </div>

      <footer className="pt-4 pb-2 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>DCT Platform Gate Status · RSM | CATT · v3.1</span>
          <span>All gates require artifact issuance before promotion to next batch</span>
        </div>
      </footer>
    </div>
  );
}
