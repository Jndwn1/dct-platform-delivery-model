// TouchpointJourney — RSM Command Center design
// T1–T11 connected nodes with system color coding and hover tooltips

import { useState } from "react";
import { touchpoints, touchpointStatusColor, systemColor, type Touchpoint } from "@/lib/dctData";

const systemBgMap: Record<string, string> = {
  "Phoenix/DMS": "bg-purple-50 border-purple-200",
  "AI Orchestrator": "bg-blue-50 border-blue-200",
  "PDC": "bg-emerald-50 border-emerald-200",
  "TDC": "bg-amber-50 border-amber-200",
  "Roger UI": "bg-rose-50 border-rose-200",
};

const systemGroups = [
  { label: "Phoenix/DMS", tps: ["T1"], color: "bg-purple-100 text-purple-800" },
  { label: "AI Orchestrator", tps: ["T2", "T3"], color: "bg-blue-100 text-blue-800" },
  { label: "PDC", tps: ["T4", "T5", "T6", "T7"], color: "bg-emerald-100 text-emerald-800" },
  { label: "TDC", tps: ["T8", "T9", "T10"], color: "bg-amber-100 text-amber-800" },
  { label: "Roger UI", tps: ["T11"], color: "bg-rose-100 text-rose-800" },
];

interface TooltipProps {
  tp: Touchpoint;
}

function TPTooltip({ tp }: TooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 w-48 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl pointer-events-none">
      <div className="font-bold mb-1">{tp.id} — {tp.name}</div>
      <div className={`text-xs mb-1 font-medium ${systemColor(tp.system)}`} style={{ color: "inherit", filter: "brightness(1.8)" }}>
        {tp.system}
      </div>
      <div className="text-gray-300 leading-relaxed">{tp.description}</div>
      {tp.gate && (
        <div className="mt-1 text-blue-300 font-medium">Gate: {tp.gate}</div>
      )}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  );
}

export default function TouchpointJourney() {
  const [hoveredTp, setHoveredTp] = useState<string | null>(null);

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-sm overflow-x-auto">
      {/* System lane labels */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {systemGroups.map(g => (
          <span key={g.label} className={`text-xs font-semibold px-2 py-0.5 rounded ${g.color}`}>
            {g.label}
          </span>
        ))}
      </div>

      {/* Journey strip */}
      <div className="flex items-center min-w-max">
        {touchpoints.map((tp, idx) => {
          const isHovered = hoveredTp === tp.id;
          return (
            <div key={tp.id} className="flex items-center">
              {/* Touchpoint node */}
              <div className="relative flex flex-col items-center">
                {/* Tooltip */}
                {isHovered && <TPTooltip tp={tp} />}

                {/* Node circle */}
                <button
                  onMouseEnter={() => setHoveredTp(tp.id)}
                  onMouseLeave={() => setHoveredTp(null)}
                  className={`tp-node border-2 ${touchpointStatusColor(tp.status)}`}
                >
                  {tp.label}
                </button>

                {/* Node label below */}
                <div className="mt-1.5 text-center" style={{ width: "60px" }}>
                  <div className="text-xs font-semibold text-foreground leading-tight truncate">{tp.name}</div>
                  <div className={`text-xs leading-tight ${systemColor(tp.system)}`}>{tp.system}</div>
                </div>
              </div>

              {/* Connector line */}
              {idx < touchpoints.length - 1 && (
                <div
                  className="tp-connector mx-1"
                  style={{
                    background: tp.status === "COMPLETE"
                      ? "oklch(0.65 0.15 145)"
                      : tp.status === "IN_PROGRESS"
                      ? "oklch(0.72 0.14 80)"
                      : "oklch(0.85 0.02 264)",
                    minWidth: "16px",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-5 pt-3 border-t border-border flex-wrap">
        {[
          { status: "COMPLETE", label: "Complete", cls: "bg-green-100 border-green-400 text-green-800" },
          { status: "IN_PROGRESS", label: "In Progress", cls: "bg-amber-100 border-amber-400 text-amber-800" },
          { status: "PENDING", label: "Pending", cls: "bg-blue-100 border-blue-400 text-blue-800" },
          { status: "PLANNED", label: "Planned", cls: "bg-gray-100 border-gray-300 text-gray-500" },
          { status: "BLOCKED", label: "Blocked", cls: "bg-red-100 border-red-400 text-red-800" },
        ].map(({ label, cls }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${cls}`}>
              T
            </div>
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
