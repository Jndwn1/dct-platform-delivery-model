// GateRail — RSM Command Center design
// Horizontal gate progress rail: G1 → G2 → G3 → G4 with status badges and artifact counts

import { type Gate, type GateStatus, gateStatusColor } from "@/lib/dctData";
import { CheckCircle, Clock, XCircle, Circle, ChevronRight } from "lucide-react";

interface GateRailProps {
  gates: Gate[];
  onSelectGate: (gate: Gate) => void;
  selectedGateId?: string;
}

function statusIcon(status: GateStatus) {
  switch (status) {
    case "PASSED": return <CheckCircle size={16} className="text-green-600" />;
    case "PENDING": return <Clock size={16} className="text-amber-500 animate-pulse-pending" />;
    case "BLOCKED": return <XCircle size={16} className="text-red-500" />;
    case "PLANNED": return <Circle size={16} className="text-gray-400" />;
  }
}

function statusLabel(status: GateStatus) {
  switch (status) {
    case "PASSED": return "Passed";
    case "PENDING": return "Pending Review";
    case "BLOCKED": return "Blocked";
    case "PLANNED": return "Planned";
  }
}

export default function GateRail({ gates, onSelectGate, selectedGateId }: GateRailProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
      <div className="flex items-stretch gap-0">
        {gates.map((gate, idx) => {
          const isSelected = selectedGateId === gate.id;
          const issuedCount = gate.artifacts.filter(a => a.status === "ISSUED").length;
          const totalCount = gate.artifacts.length;

          return (
            <div key={gate.id} className="flex items-center flex-1 min-w-0">
              {/* Gate Card */}
              <button
                onClick={() => onSelectGate(gate)}
                className={`flex-1 rounded-lg border-2 p-4 text-left transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary shadow-md"
                    : "border-border hover:border-primary/40"
                }`}
                style={{
                  background: isSelected ? "oklch(0.95 0.03 264)" : "white",
                }}
              >
                {/* Gate ID + Status */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "oklch(0.28 0.12 264)" }}>
                      {gate.id}
                    </span>
                    {statusIcon(gate.status)}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${gateStatusColor(gate.status)}`}>
                    {statusLabel(gate.status)}
                  </span>
                </div>

                {/* Gate Name */}
                <div className="font-semibold text-sm text-foreground mb-1 leading-tight">
                  {gate.name}
                </div>

                {/* Artifact progress */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: totalCount > 0 ? `${(issuedCount / totalCount) * 100}%` : "0%",
                        background: gate.status === "PASSED" ? "oklch(0.55 0.15 145)"
                          : gate.status === "PENDING" ? "oklch(0.72 0.14 80)"
                          : gate.status === "BLOCKED" ? "oklch(0.65 0.20 27)"
                          : "oklch(0.80 0.04 264)"
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {issuedCount}/{totalCount} artifacts
                  </span>
                </div>

                {/* Open issues */}
                {gate.openIssues > 0 && (
                  <div className="mt-2 text-xs text-red-600 font-medium">
                    ⚠ {gate.openIssues} open issue{gate.openIssues > 1 ? "s" : ""}
                  </div>
                )}

                {/* Approving authority */}
                <div className="mt-2 text-xs text-muted-foreground truncate">
                  {gate.approvingAuthority}
                </div>
              </button>

              {/* Connector arrow */}
              {idx < gates.length - 1 && (
                <div className="flex-shrink-0 px-1">
                  <ChevronRight size={18} className="text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
