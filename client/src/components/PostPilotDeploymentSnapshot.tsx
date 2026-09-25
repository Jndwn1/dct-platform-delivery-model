import { Link } from "wouter";
import { Activity, CheckCircle2, Layers, Rocket, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";

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
  const { data: summaryData, isLoading: isSummaryLoading } = trpc.deploymentRegistry.summary.useQuery();
  const { data: deployments = [], isLoading: isDeploymentLoading } = trpc.deploymentRegistry.list.useQuery({ sortBy: "deploymentDate" });
  const summary = summaryData ?? { total: 0, production: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 };
  const isLoading = isSummaryLoading || isDeploymentLoading;
  const recentDeployments = deployments
    .filter((deployment) => deployment.deploymentDate >= "2026-06-11")
    .slice(0, 5);

  return (
    <section aria-labelledby="post-pilot-deployment-snapshot" style={{ marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Release and deployment traceability</div>
        <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
          <h2 id="post-pilot-deployment-snapshot" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>Deployment Snapshot</h2>
          <Link href="/deployment-registry" style={{ color: "#0f766e", fontSize: "11px", fontWeight: 850, textDecoration: "none" }}>Open Deployment Registry →</Link>
        </div>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" }}>Live production registry counts and recent release records. These deployment measures are traceability indicators and do not change PI4 sprint progress.</p>
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
          <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>Recent Production Deployment Records</div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>{isLoading ? "Loading registry…" : `${recentDeployments.length} of ${summary.total} deployments shown from Jun 11, 2026`}</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "940px", width: "100%" }}>
            <thead>
              <tr style={{ background: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                {["Date", "Release Name", "Type", "Platform", "Environment", "Deployment Owner", "Product Owner"].map((heading) => (
                  <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ color: "#64748b", fontSize: "12px", padding: "26px", textAlign: "center" }}>Loading deployment registry records…</td></tr>
              ) : recentDeployments.length === 0 ? (
                <tr><td colSpan={7} style={{ color: "#64748b", fontSize: "12px", padding: "26px", textAlign: "center" }}>No production deployment records from Jun 11, 2026 onward are currently available in the registry.</td></tr>
              ) : recentDeployments.map((deployment, index) => {
                return (
                  <tr key={deployment.deploymentId} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                    <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px", whiteSpace: "nowrap" }}>{deployment.deploymentDate}</td>
                    <td style={{ color: "#1e293b", fontSize: "11px", fontWeight: 700, lineHeight: 1.35, maxWidth: "330px", padding: "11px 12px" }}>{deployment.releaseName}</td>
                    <td style={{ padding: "11px 12px" }}><span style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "999px", color: "#92400e", display: "inline-flex", fontSize: "9px", fontWeight: 850, padding: "3px 6px", whiteSpace: "nowrap" }}>{deployment.type}</span></td>
                    <td style={{ color: deployment.platform === "PDC" ? "#1d4ed8" : "#047857", fontSize: "11px", fontWeight: 800, padding: "11px 12px" }}>{deployment.platform}</td>
                    <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{deployment.environment}</td>
                    <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{deployment.deploymentOwner}</td>
                    <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{deployment.productOwner}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
