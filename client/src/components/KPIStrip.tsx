// KPIStrip — RSM Command Center design
// Summary KPI cards: batches, gates, artifacts, issues, progress

import { platformKPIs } from "@/lib/dctData";
import { GitBranch, CheckSquare, FileText, AlertTriangle, TrendingUp } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
}

function KPICard({ label, value, sub, icon, accent }: KPICardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-start gap-3 shadow-sm">
      <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: accent || "oklch(0.94 0.01 264)" }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-foreground leading-none mb-0.5">{value}</div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function KPIStrip() {
  const k = platformKPIs;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <KPICard
        label="Active Batches"
        value={k.activeBatches}
        sub="5 planned"
        icon={<GitBranch size={18} style={{ color: "oklch(0.28 0.12 264)" }} />}
        accent="oklch(0.92 0.04 264)"
      />
      <KPICard
        label="Gates Pending"
        value={k.gatesPendingTotal}
        sub={`${k.gatesPassedTotal} passed · ${k.gatesBlockedTotal} blocked`}
        icon={<CheckSquare size={18} className="text-amber-600" />}
        accent="oklch(0.95 0.06 80)"
      />
      <KPICard
        label="Artifacts Issued"
        value={k.artifactsIssued}
        sub={`${k.artifactsPending} pending · ${k.artifactsMissing} missing`}
        icon={<FileText size={18} className="text-emerald-600" />}
        accent="oklch(0.92 0.06 145)"
      />
      <KPICard
        label="Open Issues"
        value={k.openIssues}
        sub="AB-01 · G1 scope"
        icon={<AlertTriangle size={18} className="text-red-500" />}
        accent="oklch(0.94 0.04 27)"
      />
      <KPICard
        label="Platform Progress"
        value={`${k.overallProgress}%`}
        sub="T1–T4 complete"
        icon={<TrendingUp size={18} style={{ color: "oklch(0.28 0.12 264)" }} />}
        accent="oklch(0.92 0.04 264)"
      />
    </div>
  );
}
