import { useMemo, useState } from "react";
import { Activity, CheckCircle2, ClipboardCopy, FileText, Layers, Plus, Rocket, RotateCcw, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type PlatformValue = "PDC" | "TDC" | "Platform" | "Both";
type DeploymentType = "Feature" | "Bug" | "Technical Story" | "Hotfix";
type DeploymentStatus = "Planned" | "Scheduled" | "In Progress" | "Deployed" | "Rolled Back";

type DeploymentWikiRecord = {
  deploymentId: string;
  deploymentDate: string;
  releaseName: string;
  screenName: string;
  type: string;
  platform: string;
  environment: string;
  deploymentOwner: string;
  productOwner: string;
  relatedFeature: string | null;
  adoWorkItemId: string | null;
};

function escapeWikiCell(value: string | null | undefined) {
  return (value ?? "—").replace(/[|\r\n]/g, " ").replace(/\s+/g, " ").trim() || "—";
}

export function buildPostPilotDeploymentWiki(records: DeploymentWikiRecord[]) {
  const lines = [
    "# DCT Platform — Post Pilot Deployment Registry",
    "",
    "**Scope:** PI4 / Post Pilot delivery only",
    `**Registry Records:** ${records.length}`,
    "",
    "## Deployment Summary",
    "",
    "| Metric | Value |",
    "|---|---:|",
    `| Total Deployments | ${records.length} |`,
    "",
    "## Deployment Records",
    "",
    "| # | Date | Release Name | Screen / Capability | Type | Platform | Environment | Deployment Owner | Product Owner | Related Feature | ADO Work Item |",
    "|---:|---|---|---|---|---|---|---|---|---|---|",
  ];

  if (records.length === 0) {
    lines.push("| — | — | No Post Pilot deployments recorded | — | — | — | — | — | — | — | — |");
  } else {
    records.forEach((record, index) => {
      lines.push([
        `| ${index + 1}`,
        escapeWikiCell(record.deploymentDate),
        escapeWikiCell(record.releaseName),
        escapeWikiCell(record.screenName),
        escapeWikiCell(record.type),
        escapeWikiCell(record.platform),
        escapeWikiCell(record.environment),
        escapeWikiCell(record.deploymentOwner),
        escapeWikiCell(record.productOwner),
        escapeWikiCell(record.relatedFeature),
        `${escapeWikiCell(record.adoWorkItemId)} |`,
      ].join(" | "));
    });
  }

  lines.push("", "---", "", "*Deployment status is intentionally excluded from this summary view. Each record captures the required affected screen / capability.*");
  return lines.join("\n");
}

function DeploymentMetricCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
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

function CreatePostPilotDeploymentForm({ onClose }: { onClose: () => void }) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState({
    releaseName: "",
    deploymentDate: new Date().toISOString().slice(0, 10),
    deploymentOwner: "",
    productOwner: "",
    platform: "TDC" as PlatformValue,
    type: "Feature" as DeploymentType,
    status: "Planned" as DeploymentStatus,
    screenName: "",
    summary: "",
    relatedFeature: "",
    relatedStory: "",
    environment: "Production",
    adoWorkItemId: "",
  });

  const createMutation = trpc.postPilotDeploymentRegistry.create.useMutation({
    onSuccess: () => {
      utils.postPilotDeploymentRegistry.list.invalidate();
      utils.postPilotDeploymentRegistry.summary.invalidate();
      onClose();
    },
  });

  const fieldStyle: React.CSSProperties = { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "5px", boxSizing: "border-box", color: "#0f172a", fontSize: "12px", padding: "8px 10px", width: "100%" };
  const labelStyle: React.CSSProperties = { color: "#64748b", display: "block", fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", marginBottom: "4px", textTransform: "uppercase" };
  const set = (key: keyof typeof form, value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  function submit(event: React.FormEvent) {
    event.preventDefault();
    createMutation.mutate({
      releaseName: form.releaseName,
      deploymentDate: form.deploymentDate,
      deploymentOwner: form.deploymentOwner,
      productOwner: form.productOwner,
      platform: form.platform,
      type: form.type,
      status: form.status,
      screenName: form.screenName,
      summary: form.summary || undefined,
      relatedFeature: form.relatedFeature || undefined,
      relatedStory: form.relatedStory || undefined,
      environment: form.environment,
      adoWorkItemId: form.adoWorkItemId || undefined,
    });
  }

  return (
    <div style={{ alignItems: "stretch", background: "rgba(15, 23, 42, 0.34)", display: "flex", inset: 0, justifyContent: "flex-end", position: "fixed", zIndex: 60 }}>
      <div role="dialog" aria-modal="true" aria-label="Create Post Pilot deployment" style={{ background: "#ffffff", boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.18)", display: "flex", flexDirection: "column", maxWidth: "100vw", overflowY: "auto", width: "510px" }}>
        <div style={{ alignItems: "flex-start", background: "#0f172a", display: "flex", justifyContent: "space-between", padding: "20px 22px" }}>
          <div>
            <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 850 }}>Create Post Pilot Deployment</div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", marginTop: "3px" }}>Creates a record only in the separate Post Pilot registry.</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close create deployment form" style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: "0" }}><X size={19} /></button>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "22px" }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "7px", color: "#1e40af", fontSize: "11px", lineHeight: 1.45, padding: "9px 11px" }}><strong>Required tracking detail:</strong> Enter the affected screen / capability for every deployment.</div>
          <div>
            <label style={labelStyle}>Release Name *</label>
            <input required value={form.releaseName} onChange={(event) => set("releaseName", event.target.value)} placeholder="e.g. State filing footprint release" style={fieldStyle} />
          </div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div><label style={labelStyle}>Deployment Date *</label><input required type="date" value={form.deploymentDate} onChange={(event) => set("deploymentDate", event.target.value)} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Status</label><select value={form.status} onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value as DeploymentStatus }))} style={fieldStyle}>{(["Planned", "Scheduled", "In Progress", "Deployed", "Rolled Back"] as DeploymentStatus[]).map((status) => <option key={status}>{status}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div><label style={labelStyle}>Deployment Owner *</label><input required value={form.deploymentOwner} onChange={(event) => set("deploymentOwner", event.target.value)} placeholder="e.g. Gary Luca" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Product Owner *</label><input required value={form.productOwner} onChange={(event) => set("productOwner", event.target.value)} placeholder="e.g. Product Owner" style={fieldStyle} /></div>
          </div>
          <div><label style={labelStyle}>Affected Screen / Capability *</label><input required value={form.screenName} onChange={(event) => set("screenName", event.target.value)} placeholder="e.g. State Filing Footprint" style={fieldStyle} /></div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div><label style={labelStyle}>Platform *</label><select value={form.platform} onChange={(event) => setForm((previous) => ({ ...previous, platform: event.target.value as PlatformValue }))} style={fieldStyle}>{(["PDC", "TDC", "Platform", "Both"] as PlatformValue[]).map((platform) => <option key={platform}>{platform}</option>)}</select></div>
            <div><label style={labelStyle}>Type *</label><select value={form.type} onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as DeploymentType }))} style={fieldStyle}>{(["Feature", "Bug", "Technical Story", "Hotfix"] as DeploymentType[]).map((type) => <option key={type}>{type}</option>)}</select></div>
          </div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div><label style={labelStyle}>Environment</label><select value={form.environment} onChange={(event) => set("environment", event.target.value)} style={fieldStyle}>{["Production", "UAT", "QA", "Dev"].map((environment) => <option key={environment}>{environment}</option>)}</select></div>
            <div><label style={labelStyle}>ADO Work Item ID</label><input value={form.adoWorkItemId} onChange={(event) => set("adoWorkItemId", event.target.value)} placeholder="e.g. 1494188" style={fieldStyle} /></div>
          </div>
          <div><label style={labelStyle}>Related Feature</label><input value={form.relatedFeature} onChange={(event) => set("relatedFeature", event.target.value)} placeholder="e.g. Filing Footprint" style={fieldStyle} /></div>
          <div><label style={labelStyle}>Related Story / Bug</label><input value={form.relatedStory} onChange={(event) => set("relatedStory", event.target.value)} placeholder="e.g. Story 1494188" style={fieldStyle} /></div>
          <div><label style={labelStyle}>Deployment Summary</label><textarea value={form.summary} onChange={(event) => set("summary", event.target.value)} placeholder="Describe the release scope and deployment notes." style={{ ...fieldStyle, minHeight: "76px", resize: "vertical" }} /></div>

          {createMutation.error && <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "11px", padding: "8px 10px" }}>{createMutation.error.message}</div>}
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button type="submit" disabled={createMutation.isPending} style={{ background: "#0f766e", border: "none", borderRadius: "6px", color: "#ffffff", cursor: createMutation.isPending ? "not-allowed" : "pointer", flex: 1, fontSize: "12px", fontWeight: 850, opacity: createMutation.isPending ? 0.7 : 1, padding: "10px 14px" }}>{createMutation.isPending ? "Creating…" : "Create Deployment"}</button>
            <button type="button" onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "6px", color: "#475569", cursor: "pointer", fontSize: "12px", fontWeight: 750, padding: "10px 14px" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PostPilotDeploymentSnapshot() {
  const { data: summaryData, isLoading: isSummaryLoading } = trpc.postPilotDeploymentRegistry.summary.useQuery();
  const { data: records = [], isLoading: isRecordsLoading } = trpc.postPilotDeploymentRegistry.list.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [wikiCopied, setWikiCopied] = useState(false);
  const summary = summaryData ?? { total: 0, production: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 };
  const wikiMarkdown = useMemo(() => buildPostPilotDeploymentWiki(records), [records]);
  const isLoading = isSummaryLoading || isRecordsLoading;

  async function copyWikiMarkdown() {
    try {
      await navigator.clipboard.writeText(wikiMarkdown);
      setWikiCopied(true);
      window.setTimeout(() => setWikiCopied(false), 2500);
    } catch {
      setWikiCopied(false);
    }
  }

  return (
    <section aria-labelledby="post-pilot-deployment-snapshot" style={{ marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>PI4 / Post Pilot delivery register</div>
        <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
          <h2 id="post-pilot-deployment-snapshot" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>Post Pilot Deployment Registry</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button type="button" onClick={copyWikiMarkdown} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #0f766e", borderRadius: "6px", color: "#0f766e", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "7px 10px" }}><ClipboardCopy size={13} />{wikiCopied ? "Wiki Markdown Copied" : "Copy Wiki Markdown"}</button>
            <button type="button" onClick={() => setShowCreate(true)} style={{ alignItems: "center", background: "#0f172a", border: "1px solid #0f172a", borderRadius: "6px", color: "#ffffff", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "7px 10px" }}><Plus size={13} />Create Deployment</button>
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" }}>A separate, persistent registry for PI4 / Post Pilot deployments. It starts at zero, does not use historical deployment records, and does not change PI4 sprint progress.</p>
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
          <div style={{ alignItems: "center", color: "#0f172a", display: "flex", fontSize: "12px", fontWeight: 850, gap: "6px" }}><FileText size={13} color="#0f766e" />Post Pilot Deployment Records</div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>{isLoading ? "Loading registry…" : `${records.length} record${records.length === 1 ? "" : "s"}`}</div>
        </div>
        {isLoading ? (
          <div style={{ color: "#64748b", fontSize: "12px", padding: "26px", textAlign: "center" }}>Loading Post Pilot deployment records…</div>
        ) : records.length === 0 ? (
          <div style={{ padding: "26px", textAlign: "center" }}>
            <Rocket size={28} style={{ color: "#cbd5e1", marginBottom: "9px" }} />
            <div style={{ color: "#475569", fontSize: "12px", fontWeight: 800 }}>No Post Pilot deployments recorded</div>
            <div style={{ color: "#94a3b8", fontSize: "11px", lineHeight: 1.45, margin: "5px auto 0", maxWidth: "510px" }}>Use <strong>Create Deployment</strong> to add the first Post Pilot release record. The affected screen / capability is required for every record.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1100px", width: "100%" }}>
              <thead><tr style={{ background: "#0f172a", textAlign: "left" }}>{["Date", "Release Name", "Screen / Capability", "Type", "Platform", "Environment", "Deployment Owner", "Product Owner", "Related Feature", "ADO Item"].map((heading) => <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead>
              <tbody>{records.map((record, index) => <tr key={record.deploymentId} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px", whiteSpace: "nowrap" }}>{record.deploymentDate}</td>
                <td style={{ color: "#1e293b", fontSize: "11px", fontWeight: 750, maxWidth: "260px", padding: "11px 12px" }}>{record.releaseName}</td>
                <td style={{ color: "#0f766e", fontSize: "11px", fontWeight: 800, maxWidth: "210px", padding: "11px 12px" }}>{record.screenName}</td>
                <td style={{ padding: "11px 12px" }}><span style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "999px", color: "#92400e", display: "inline-flex", fontSize: "9px", fontWeight: 850, padding: "3px 6px", whiteSpace: "nowrap" }}>{record.type}</span></td>
                <td style={{ color: record.platform === "PDC" ? "#1d4ed8" : "#047857", fontSize: "11px", fontWeight: 800, padding: "11px 12px" }}>{record.platform}</td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.environment}</td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.deploymentOwner}</td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.productOwner}</td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.relatedFeature ?? "—"}</td>
                <td style={{ color: "#475569", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "10px", padding: "11px 12px" }}>{record.adoWorkItemId ?? "—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
      {showCreate && <CreatePostPilotDeploymentForm onClose={() => setShowCreate(false)} />}
    </section>
  );
}
