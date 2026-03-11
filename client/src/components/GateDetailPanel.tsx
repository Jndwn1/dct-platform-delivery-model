// GateDetailPanel — RSM Command Center design
// Expanded gate detail: purpose, approving authority, artifact checklist

import { type Gate, type GateArtifact, artifactStatusIcon } from "@/lib/dctData";
import { CheckCircle, Clock, Circle, AlertTriangle, User } from "lucide-react";

interface GateDetailPanelProps {
  gate: Gate;
}

function artifactRow(artifact: GateArtifact) {
  const icon = artifactStatusIcon(artifact.status);
  const colorClass =
    artifact.status === "ISSUED" ? "text-green-600"
    : artifact.status === "PENDING" ? "text-amber-600"
    : "text-gray-400";

  return (
    <div key={artifact.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className={`text-base font-bold w-5 text-center flex-shrink-0 ${colorClass}`}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{artifact.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{artifact.id}</div>
      </div>
      <div className="text-right flex-shrink-0">
        {artifact.status === "ISSUED" ? (
          <div>
            <div className="text-xs font-semibold text-green-700">Issued</div>
            {artifact.issuedDate && (
              <div className="text-xs text-muted-foreground">{artifact.issuedDate}</div>
            )}
            {artifact.issuedBy && (
              <div className="text-xs text-muted-foreground">{artifact.issuedBy}</div>
            )}
          </div>
        ) : artifact.status === "PENDING" ? (
          <div>
            <div className="text-xs font-semibold text-amber-700">Pending</div>
            {artifact.issuedBy && (
              <div className="text-xs text-muted-foreground">{artifact.issuedBy}</div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-400">Not started</div>
        )}
      </div>
    </div>
  );
}

export default function GateDetailPanel({ gate }: GateDetailPanelProps) {
  const issuedCount = gate.artifacts.filter(a => a.status === "ISSUED").length;
  const totalCount = gate.artifacts.length;
  const pct = totalCount > 0 ? Math.round((issuedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      {/* Gate header bar */}
      <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4"
        style={{ background: "oklch(0.97 0.02 264)" }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.28 0.12 264)" }}>
              {gate.id}
            </span>
            <span className="text-base font-bold text-foreground">{gate.name}</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">{gate.purpose}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-muted-foreground mb-1">Artifact Readiness</div>
          <div className="text-2xl font-bold" style={{ color: "oklch(0.28 0.12 264)" }}>{pct}%</div>
          <div className="text-xs text-muted-foreground">{issuedCount} of {totalCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Artifact checklist */}
        <div className="md:col-span-2 p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Gate Artifacts
          </div>
          <div>
            {gate.artifacts.map(a => artifactRow(a))}
          </div>
        </div>

        {/* Gate metadata */}
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Approving Authority
            </div>
            <div className="flex items-center gap-2">
              <User size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{gate.approvingAuthority}</span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Last Updated
            </div>
            <div className="text-sm text-foreground">{gate.lastUpdated}</div>
          </div>

          {gate.openIssues > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={14} />
                <span className="text-xs font-semibold">
                  {gate.openIssues} Open Issue{gate.openIssues > 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-red-600 mt-1">
                Gate cannot be approved until all open issues are resolved.
              </p>
            </div>
          )}

          {/* Artifact status summary */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Artifact Status
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Issued", count: gate.artifacts.filter(a => a.status === "ISSUED").length, icon: <CheckCircle size={12} className="text-green-600" /> },
                { label: "Pending", count: gate.artifacts.filter(a => a.status === "PENDING").length, icon: <Clock size={12} className="text-amber-500" /> },
                { label: "Missing", count: gate.artifacts.filter(a => a.status === "MISSING").length, icon: <Circle size={12} className="text-gray-400" /> },
              ].map(({ label, count, icon }) => (
                <div key={label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {icon}
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
