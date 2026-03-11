// BatchAccordion — RSM Command Center design
// Expandable batch rows: AB-01 through AB-06 with gate status, progress, and metadata

import { useState } from "react";
import { allBatches, type ArchitecturalBatch, type BatchStatus } from "@/lib/dctData";
import { ChevronDown, ChevronRight, GitBranch, Calendar, User, AlertTriangle } from "lucide-react";

function batchStatusBadge(status: BatchStatus) {
  switch (status) {
    case "ACTIVE":
      return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">Active</span>;
    case "PLANNED":
      return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-300">Planned</span>;
    case "CLOSED":
      return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 border border-green-300">Closed</span>;
    case "ON_HOLD":
      return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">On Hold</span>;
    case "GATE_PENDING":
      return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">Gate Pending</span>;
  }
}

interface BatchRowProps {
  batch: ArchitecturalBatch;
  isExpanded: boolean;
  onToggle: () => void;
}

function BatchRow({ batch, isExpanded, onToggle }: BatchRowProps) {
  const isActive = batch.status === "ACTIVE";

  return (
    <div className={`batch-row rounded-lg border border-border bg-card shadow-sm overflow-hidden transition-all ${
      isActive ? "border-l-primary" : ""
    }`}>
      {/* Row header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-muted/40 transition-colors"
      >
        {/* Expand icon */}
        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>

        {/* Batch ID */}
        <div className="flex-shrink-0 w-14">
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: isActive ? "oklch(0.28 0.12 264)" : "oklch(0.52 0.04 264)" }}>
            {batch.id}
          </span>
        </div>

        {/* Batch name */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">{batch.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{batch.keyGate}</div>
        </div>

        {/* Progress bar */}
        <div className="hidden md:flex items-center gap-2 w-32 flex-shrink-0">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${batch.completionPct}%`,
                background: isActive ? "oklch(0.52 0.18 264)" : "oklch(0.80 0.04 264)"
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">{batch.completionPct}%</span>
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0">
          {batchStatusBadge(batch.status)}
        </div>

        {/* Issues */}
        {batch.openIssues > 0 && (
          <div className="flex items-center gap-1 text-red-600 flex-shrink-0">
            <AlertTriangle size={13} />
            <span className="text-xs font-semibold">{batch.openIssues}</span>
          </div>
        )}
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="border-t border-border px-5 py-4 bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Primary System</div>
              <div className="text-foreground">{batch.primarySystem}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Batch Lead</div>
              <div className="flex items-center gap-1.5 text-foreground">
                <User size={12} className="text-muted-foreground" />
                {batch.batchLead}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Target Date</div>
              <div className="flex items-center gap-1.5 text-foreground">
                <Calendar size={12} className="text-muted-foreground" />
                {batch.targetDate || "TBD"}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Touchpoints</div>
              <div className="flex flex-wrap gap-1">
                {batch.touchpoints.map(tp => (
                  <span key={tp} className="text-xs px-1.5 py-0.5 rounded font-mono"
                    style={{ background: "oklch(0.92 0.04 264)", color: "oklch(0.28 0.12 264)" }}>
                    {tp}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Entry Condition</div>
              <div className="text-foreground text-xs leading-relaxed">{batch.entryCondition}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Exit Condition</div>
              <div className="text-foreground text-xs leading-relaxed">{batch.exitCondition}</div>
            </div>
          </div>

          {/* Gate status summary for active batch */}
          {batch.gates.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Gate Status</div>
              <div className="flex gap-2 flex-wrap">
                {batch.gates.map(gate => (
                  <div key={gate.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium"
                    style={{
                      background: gate.status === "PASSED" ? "oklch(0.92 0.08 145)"
                        : gate.status === "PENDING" ? "oklch(0.95 0.06 80)"
                        : gate.status === "BLOCKED" ? "oklch(0.94 0.06 27)"
                        : "oklch(0.94 0.01 264)",
                      color: gate.status === "PASSED" ? "oklch(0.28 0.12 145)"
                        : gate.status === "PENDING" ? "oklch(0.38 0.12 80)"
                        : gate.status === "BLOCKED" ? "oklch(0.42 0.18 27)"
                        : "oklch(0.52 0.04 264)",
                      borderColor: gate.status === "PASSED" ? "oklch(0.65 0.15 145)"
                        : gate.status === "PENDING" ? "oklch(0.72 0.14 80)"
                        : gate.status === "BLOCKED" ? "oklch(0.65 0.20 27)"
                        : "oklch(0.80 0.04 264)",
                    }}>
                    {gate.id}: {gate.name} — {gate.status}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BatchAccordion() {
  const [expandedBatch, setExpandedBatch] = useState<string>("AB-01");

  return (
    <div className="space-y-2">
      {allBatches.map(batch => (
        <BatchRow
          key={batch.id}
          batch={batch}
          isExpanded={expandedBatch === batch.id}
          onToggle={() => setExpandedBatch(expandedBatch === batch.id ? "" : batch.id)}
        />
      ))}
    </div>
  );
}
