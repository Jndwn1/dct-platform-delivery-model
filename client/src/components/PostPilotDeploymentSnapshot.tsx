import { Link } from "wouter";
import { Activity, CheckCircle2, Layers, Rocket, RotateCcw } from "lucide-react";

const POST_PILOT_DEPLOYMENT_BASELINE = {
  total: 0,
  production: 0,
  pdc: 0,
  tdc: 0,
  rollbackCandidates: 0,
} as const;

function DeploymentMetricCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: "9px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)", minWidth: "152px", padding: "14px 16px" }}>
      <div style={{ alignItems: "flex-start", color: "#64748b", display: "flex", fontSize: "10px", fontWeight: 850, gap: "7px", letterSpacing: "0.07em", lineHeight: 1.25, textTransform: "uppercase" }}>
        <span style={{ color, display: "inline-flex", flexShrink: 0, paddingTop: "1px" }}>{icon}</span>
        {label}
      </div>
      <div style={{ color, fontSize: "26px", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1, marginTop: "13px" }}>{value}</div>
    </div>
  );
}

export default function PostPilotDeploymentSnapshot() {
  const summary = POST_PILOT_DEPLOYMENT_BASELINE;

  return (
    <section aria-labelledby="post-pilot-deployment-snapshot" style={{ marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Release and deployment traceability</div>
        <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
          <h2 id="post-pilot-deployment-snapshot" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>Deployment Snapshot</h2>
          <Link href="/deployment-registry" style={{ color: "#0f766e", fontSize: "11px", fontWeight: 850, textDecoration: "none" }}>Open Historical Deployment Registry →</Link>
        </div>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" }}>Post Pilot deployment tracking begins at zero. These measures are scoped to Post Pilot releases only and do not change PI4 sprint progress.</p>
      </div>

      <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", marginBottom: "14px" }}>
        <DeploymentMetricCard label="Total Deployments" value={summary.total} color="#0f172a" icon={<Rocket size={13} />} />
        <DeploymentMetricCard label="Production Releases" value={summary.production} color="#059669" icon={<CheckCircle2 size={13} />} />
        <DeploymentMetricCard label="PDC Deployments" value={summary.pdc} color="#1d4ed8" icon={<Layers size={13} />} />
        <DeploymentMetricCard label="TDC Deployments" value={summary.tdc} color="#059669" icon={<Activity size={13} />} />
        <DeploymentMetricCard label="Open Rollback Candidates" value={summary.rollbackCandidates} color="#dc2626" icon={<RotateCcw size={13} />} />
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", padding: "10px 14px" }}>
          <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>Post Pilot Deployment Records</div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>0 records</div>
        </div>
        <div style={{ padding: "26px", textAlign: "center" }}>
          <Rocket size={28} style={{ color: "#cbd5e1", marginBottom: "9px" }} />
          <div style={{ color: "#475569", fontSize: "12px", fontWeight: 800 }}>No Post Pilot deployments recorded</div>
          <div style={{ color: "#94a3b8", fontSize: "11px", lineHeight: 1.45, margin: "5px auto 0", maxWidth: "510px" }}>This section will populate when a Post Pilot deployment is formally registered. Historical releases remain available in the Deployment Registry.</div>
        </div>
      </div>
    </section>
  );
}
