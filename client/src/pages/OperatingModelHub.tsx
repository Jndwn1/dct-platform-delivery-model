import { Link } from "wouter";
import { getWorkspace, type WorkspaceId } from "@/lib/operatingModelNavigation";

const workspaceColors: Record<WorkspaceId, { border: string; ink: string; surface: string }> = {
  executive: { border: "#1e3a5f", ink: "#1e3a5f", surface: "#eff6ff" },
  delivery: { border: "#047857", ink: "#065f46", surface: "#ecfdf5" },
  roger: { border: "#7c3aed", ink: "#6d28d9", surface: "#f5f3ff" },
  discovery: { border: "#b45309", ink: "#92400e", surface: "#fffbeb" },
  architecture: { border: "#0f766e", ink: "#115e59", surface: "#f0fdfa" },
  quality: { border: "#2563eb", ink: "#1d4ed8", surface: "#eff6ff" },
};

export default function OperatingModelHub({ workspaceId }: { workspaceId: WorkspaceId }) {
  const workspace = getWorkspace(workspaceId);
  if (!workspace) return null;
  const color = workspaceColors[workspace.id];

  return (
    <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "30px 32px 48px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ borderLeft: `5px solid ${color.border}`, paddingLeft: "16px", marginBottom: "26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "22px", color: color.ink }}>{workspace.icon}</span>
          <h1 style={{ margin: 0, color: "#0f172a", fontSize: "26px", fontWeight: 800 }}>{workspace.title}</h1>
          <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", color: color.ink, backgroundColor: color.surface, border: `1px solid ${color.border}33`, borderRadius: "99px", padding: "4px 8px", textTransform: "uppercase" }}>Operating Workspace</span>
        </div>
        <p style={{ margin: "8px 0 0", color: "#475569", fontSize: "14px", lineHeight: 1.55, maxWidth: "760px" }}>{workspace.summary}</p>
        <div style={{ marginTop: "10px", display: "inline-flex", gap: "6px", alignItems: "center", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "5px 8px", fontSize: "11px", color: "#475569" }}>
          <strong style={{ color: "#334155" }}>Source:</strong> {workspace.source}
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "22px" }}>
        {workspace.audience.map((audience) => (
          <span key={audience} style={{ fontSize: "10px", fontWeight: 700, color: "#475569", backgroundColor: "#f1f5f9", borderRadius: "4px", padding: "4px 7px" }}>{audience}</span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {workspace.groups.map((group) => (
          <section key={group.title} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ backgroundColor: color.surface, borderBottom: `1px solid ${color.border}22`, padding: "12px 14px", color: color.ink, fontSize: "12px", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>{group.title}</div>
            <div style={{ padding: "8px" }}>
              {group.links.map((link) => (
                <Link key={`${link.path}-${link.label}`} href={link.path} style={{ display: "block", textDecoration: "none", color: "inherit", borderRadius: "7px", padding: "10px", marginBottom: "2px", backgroundColor: "transparent" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                    <div>
                      <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 750 }}>{link.label}</div>
                      <div style={{ color: "#64748b", fontSize: "11px", lineHeight: 1.45, marginTop: "3px" }}>{link.description}</div>
                    </div>
                    <span style={{ color: color.ink, fontSize: "13px", lineHeight: 1 }}>→</span>
                  </div>
                  <div style={{ marginTop: "7px", color: "#64748b", fontSize: "9px" }}><strong>Source:</strong> {link.source} · {link.visibility}</div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div style={{ marginTop: "24px", padding: "13px 15px", borderRadius: "8px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: "12px", lineHeight: 1.55 }}>
        <strong style={{ color: "#334155" }}>Phase 1 preservation notice:</strong> This workspace organizes and links existing DCT capabilities. It does not create a duplicate business-data model, alter source authority, or retire the underlying routes and content.
      </div>
    </div>
  );
}
