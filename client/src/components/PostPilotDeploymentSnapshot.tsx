import { Fragment, useMemo, useState } from "react";
import { Activity, CheckCircle2, ClipboardCopy, Download, FileText, Plus, Rocket, RotateCcw, X, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DeploymentEnvironmentSelect from "@/components/DeploymentEnvironmentSelect";
import { Streamdown } from "streamdown";

type DeploymentType = "Feature" | "Bug" | "Technical Story" | "Hotfix";
type DeploymentStatus = "Planned" | "Scheduled" | "In Progress" | "Deployed" | "Rolled Back";

import {
  ADO_WORK_ITEM_URL,
  buildChronologicalDeploymentNumbers,
  buildPostPilotDeploymentWiki,
  extractAdoIds,
  splitReleaseSource,
} from "@/lib/pilotDeploymentWiki";

export { buildPostPilotDeploymentWiki } from "@/lib/pilotDeploymentWiki";

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
    if (!form.environment.trim()) return;
    createMutation.mutate({
      releaseName: form.releaseName,
      deploymentDate: form.deploymentDate,
      deploymentOwner: form.deploymentOwner,
      platform: "TDC",
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
      <div role="dialog" aria-modal="true" aria-label="Create Pilot deployment" style={{ background: "#ffffff", boxShadow: "-4px 0 24px rgba(15, 23, 42, 0.18)", display: "flex", flexDirection: "column", maxWidth: "100vw", overflowY: "auto", width: "510px" }}>
        <div style={{ alignItems: "flex-start", background: "#0f172a", display: "flex", justifyContent: "space-between", padding: "20px 22px" }}>
          <div>
            <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 850 }}>Create Pilot Deployment</div>
            <div style={{ color: "#cbd5e1", fontSize: "11px", marginTop: "3px" }}>Creates a record only in the separate Pilot registry.</div>
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
          <div><label style={labelStyle}>Deployment Owner *</label><input required value={form.deploymentOwner} onChange={(event) => set("deploymentOwner", event.target.value)} placeholder="e.g. Gary Luca" style={fieldStyle} /></div>
          <div>
            <label style={labelStyle}>Affected Screen / Capability *</label>
            <textarea required maxLength={8000} value={form.screenName} onChange={(event) => set("screenName", event.target.value)} placeholder="e.g. State Filing Footprint; Data Gateway routing updates" style={{ ...fieldStyle, minHeight: "64px", resize: "vertical" }} />
            <div style={{ color: "#64748b", fontSize: "10px", marginTop: "4px" }}>List multiple affected screens or capabilities when needed · {form.screenName.length.toLocaleString()} / 8,000 characters</div>
          </div>
          <div><label style={labelStyle}>Type *</label><select value={form.type} onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value as DeploymentType }))} style={fieldStyle}>{(["Feature", "Bug", "Technical Story", "Hotfix"] as DeploymentType[]).map((type) => <option key={type}>{type}</option>)}</select></div>
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label htmlFor="pilot-deployment-environments" style={labelStyle}>Environment *</label>
              <DeploymentEnvironmentSelect id="pilot-deployment-environments" value={form.environment} onChange={(value) => set("environment", value)} style={fieldStyle} disabled={createMutation.isPending} />
              <div style={{ color: "#64748b", fontSize: "10px", marginTop: "4px" }}>Select one or more environments.</div>
              {!form.environment.trim() && <div role="alert" style={{ color: "#991b1b", fontSize: "10px", marginTop: "4px" }}>Select at least one environment.</div>}
            </div>
            <div>
              <label style={labelStyle}>ADO Work Item IDs</label>
              <textarea maxLength={4000} value={form.adoWorkItemId} onChange={(event) => set("adoWorkItemId", event.target.value)} placeholder="e.g. 1494188, 1494189" style={{ ...fieldStyle, minHeight: "64px", resize: "vertical" }} />
              <div style={{ color: "#64748b", fontSize: "10px", marginTop: "4px" }}>Use commas or separate lines for multiple items · {form.adoWorkItemId.length.toLocaleString()} / 4,000 characters</div>
            </div>
          </div>
          <div>
            <label htmlFor="pilot-deployment-related-feature" style={labelStyle}>Related Feature</label>
            <textarea id="pilot-deployment-related-feature" maxLength={4000} value={form.relatedFeature} onChange={(event) => set("relatedFeature", event.target.value)} placeholder="e.g. Filing Footprint; Federal Workflow; Prior-Year Rollforward" style={{ ...fieldStyle, minHeight: "64px", resize: "vertical" }} />
            <div style={{ color: "#64748b", fontSize: "10px", marginTop: "4px" }}>List multiple related features when needed · {form.relatedFeature.length.toLocaleString()} / 4,000 characters</div>
          </div>
          <div><label style={labelStyle}>Related Stories / Bugs</label><textarea maxLength={4000} value={form.relatedStory} onChange={(event) => set("relatedStory", event.target.value)} placeholder="e.g. Story 1494188; Bug 1494190 — describe related delivery traceability" style={{ ...fieldStyle, minHeight: "64px", resize: "vertical" }} /><div style={{ color: "#64748b", fontSize: "10px", marginTop: "4px" }}>List multiple related stories or bugs when needed · {form.relatedStory.length.toLocaleString()} / 4,000 characters</div></div>
          <div><label style={labelStyle}>Deployment Summary</label><textarea value={form.summary} onChange={(event) => set("summary", event.target.value)} placeholder="Describe the release scope and deployment notes." style={{ ...fieldStyle, minHeight: "76px", resize: "vertical" }} /></div>

          {createMutation.error && <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "11px", padding: "8px 10px" }}>{createMutation.error.message}</div>}
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
            <button type="submit" disabled={createMutation.isPending || !form.environment.trim()} style={{ background: "#0f766e", border: "none", borderRadius: "6px", color: "#ffffff", cursor: createMutation.isPending || !form.environment.trim() ? "not-allowed" : "pointer", flex: 1, fontSize: "12px", fontWeight: 850, opacity: createMutation.isPending || !form.environment.trim() ? 0.7 : 1, padding: "10px 14px" }}>{createMutation.isPending ? "Creating…" : "Create Deployment"}</button>
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
  const [expandedDeploymentId, setExpandedDeploymentId] = useState<string | null>(null);
  const [wikiCopied, setWikiCopied] = useState(false);
  const [wikiDownloaded, setWikiDownloaded] = useState(false);
  const summary = summaryData ?? { total: 0, production: 0, tdc: 0, rollbackCandidates: 0 };
  const wikiMarkdown = useMemo(() => buildPostPilotDeploymentWiki(records), [records]);
  const chronologicalDeploymentNumbers = useMemo(() => buildChronologicalDeploymentNumbers(records), [records]);
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

  function downloadWikiMarkdown() {
    const file = new Blob([wikiMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "data-gateway-release-notes.md";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setWikiDownloaded(true);
    window.setTimeout(() => setWikiDownloaded(false), 2500);
  }

  return (
    <section aria-labelledby="post-pilot-deployment-snapshot" style={{ marginBottom: "26px" }}>
      <div style={{ borderLeft: "4px solid #0f766e", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>PI4 / Pilot delivery register</div>
        <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
          <h2 id="post-pilot-deployment-snapshot" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>Pilot Deployment Registry</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <button type="button" onClick={downloadWikiMarkdown} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #2563eb", borderRadius: "6px", color: "#1d4ed8", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "7px 10px" }}><Download size={13} />{wikiDownloaded ? "Markdown Downloaded" : "Download Data Gateway Markdown"}</button>
            <button type="button" onClick={copyWikiMarkdown} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #0f766e", borderRadius: "6px", color: "#0f766e", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "7px 10px" }}><ClipboardCopy size={13} />{wikiCopied ? "Wiki Markdown Copied" : "Copy Data Gateway Wiki Markdown"}</button>
            <button type="button" onClick={() => setShowCreate(true)} style={{ alignItems: "center", background: "#0f172a", border: "1px solid #0f172a", borderRadius: "6px", color: "#ffffff", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "7px 10px" }}><Plus size={13} />Create Deployment</button>
          </div>
        </div>
        <p style={{ color: "#64748b", fontSize: "12px", lineHeight: 1.45, margin: "4px 0 0" }}>Tax Data Consolidation (TDC) PI4 / Pilot deployments only. Newest first, with the earliest record as #1. Expand a release for full details; the registry does not change PI4 sprint progress.</p>
        <p style={{ color: "#64748b", fontSize: "11px", margin: "6px 0 0" }}>Wiki copy and download use a compact overview with expandable release details. Your existing header and signature are preserved.</p>
      </div>

      <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(165px, 1fr))", marginBottom: "14px" }}>
        <DeploymentMetricCard label="Total Deployments" value={summary.total} color="#0f172a" icon={<Rocket size={13} />} />
        <DeploymentMetricCard label="Production Releases" value={summary.production} color="#059669" icon={<CheckCircle2 size={13} />} />
        <DeploymentMetricCard label="TDC Deployments" value={summary.tdc} color="#059669" icon={<Activity size={13} />} />
        <DeploymentMetricCard label="Open Rollback Candidates" value={summary.rollbackCandidates} color="#dc2626" icon={<RotateCcw size={13} />} />
      </div>

      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
        <div style={{ alignItems: "center", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "space-between", padding: "10px 14px" }}>
          <div style={{ alignItems: "center", color: "#0f172a", display: "flex", fontSize: "12px", fontWeight: 850, gap: "6px" }}><FileText size={13} color="#0f766e" />Pilot Deployment Records</div>
          <div style={{ color: "#64748b", fontSize: "10px" }}>{isLoading ? "Loading registry…" : `${records.length} record${records.length === 1 ? "" : "s"}`}</div>
        </div>
        {isLoading ? (
          <div style={{ color: "#64748b", fontSize: "12px", padding: "26px", textAlign: "center" }}>Loading Pilot deployment records…</div>
        ) : records.length === 0 ? (
          <div style={{ padding: "26px", textAlign: "center" }}>
            <Rocket size={28} style={{ color: "#cbd5e1", marginBottom: "9px" }} />
            <div style={{ color: "#475569", fontSize: "12px", fontWeight: 800 }}>No Pilot deployments recorded</div>
            <div style={{ color: "#94a3b8", fontSize: "11px", lineHeight: 1.45, margin: "5px auto 0", maxWidth: "510px" }}>Use <strong>Create Deployment</strong> to add the first Pilot release record. The affected screen / capability is required for every record.</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table aria-label="Pilot deployment records" style={{ borderCollapse: "collapse", minWidth: "620px", tableLayout: "fixed", width: "100%" }}>
              <colgroup>
                <col style={{ width: "66px" }} />
                <col />
                <col style={{ width: "150px" }} />
                <col style={{ width: "116px" }} />
              </colgroup>
              <thead>
                <tr style={{ background: "#0f172a", textAlign: "left" }}>
                  {["Chronological #", "Deployment", "Environment", "Details"].map((heading) => (
                    <th key={heading} scope="col" aria-label={heading} title={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textAlign: heading === "Chronological #" ? "center" : "left", textTransform: "uppercase", verticalAlign: "top" }}>{heading === "Chronological #" ? "#" : heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => {
                  const adoIds = extractAdoIds(splitReleaseSource(record.summary).adoItems, record.adoWorkItemId);
                  const deploymentNumber = chronologicalDeploymentNumbers.get(`${record.deploymentDate}|${record.deploymentId}`) ?? 1;
                  const isExpanded = expandedDeploymentId === record.deploymentId;
                  const detailId = `pilot-deployment-details-${index}`;
                  const cellStyle: React.CSSProperties = { color: "#475569", fontSize: "12px", lineHeight: 1.45, overflowWrap: "anywhere", padding: "12px", verticalAlign: "top" };
                  const statusColor = record.status === "Deployed" ? "#0f766e" : record.status === "Rolled Back" ? "#b91c1c" : "#475569";
                  return (
                    <Fragment key={record.deploymentId}>
                      <tr style={{ background: isExpanded ? "#eff6ff" : index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0", verticalAlign: "top" }}>
                        <td style={{ ...cellStyle, color: "#0f766e", fontSize: "14px", fontWeight: 900, textAlign: "center" }}>{deploymentNumber}</td>
                        <td style={{ ...cellStyle, color: "#1e293b" }}>
                          <div title={record.releaseName} style={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.releaseName}</div>
                          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", fontSize: "10px", gap: "8px", marginTop: "4px" }}>
                            <time dateTime={record.deploymentDate}>{record.deploymentDate}</time>
                            <span style={{ color: "#64748b" }}>{record.type}</span>
                            <span style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px", color: statusColor, fontWeight: 750, padding: "1px 5px" }}>{record.status}</span>
                          </div>
                        </td>
                        <td style={{ ...cellStyle, color: "#0f766e", fontSize: "11px", fontWeight: 700 }}>{record.environment}</td>
                        <td style={cellStyle}>
                          <button type="button" aria-expanded={isExpanded} aria-controls={detailId} aria-label={`${isExpanded ? "Hide" : "View"} details for deployment ${deploymentNumber}: ${record.releaseName}`} onClick={() => setExpandedDeploymentId(isExpanded ? null : record.deploymentId)} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", color: "#1e3a5f", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 750, gap: "4px", padding: "5px 7px", whiteSpace: "nowrap" }}>
                            {isExpanded ? "Hide details" : "View details"}{isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && <tr id={detailId} style={{ background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                        <td colSpan={4} style={{ padding: "16px 20px" }}>
                          <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 800, marginBottom: "7px", overflowWrap: "anywhere" }}>{record.releaseName}</div>
                          <div style={{ color: "#64748b", display: "flex", flexWrap: "wrap", fontSize: "11px", gap: "6px 16px", marginBottom: "14px" }}>
                            <span><strong>Deployment owner:</strong> {record.deploymentOwner}</span>
                            <span><strong>Record:</strong> {record.deploymentId}</span>
                            <span><strong>Date:</strong> {record.deploymentDate}</span>
                            <span><strong>Environment:</strong> {record.environment}</span>
                            <span><strong>Type:</strong> {record.type}</span>
                          </div>
                          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", color: "#475569", fontSize: "12px", lineHeight: 1.55, overflowWrap: "anywhere" }}>
                            <div>
                              <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.05em", marginBottom: "5px", textTransform: "uppercase" }}>Scope / Capability</div>
                              <div style={{ whiteSpace: "pre-wrap" }}>{record.screenName}</div>
                              {record.relatedFeature && <div style={{ marginTop: "10px", whiteSpace: "pre-wrap" }}><strong>Related feature:</strong> {record.relatedFeature}</div>}
                            </div>
                            <div>
                              <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.05em", marginBottom: "5px", textTransform: "uppercase" }}>Deployment Summary & Traceability</div>
                              <div style={{ whiteSpace: "pre-wrap" }}>{record.summary ?? "—"}</div>
                              <div style={{ marginTop: "10px" }}><strong>ADO work items:</strong> {adoIds.length ? " " : " —"}{adoIds.map((id, adoIndex) => <span key={id}>{adoIndex > 0 ? ", " : ""}<a href={`${ADO_WORK_ITEM_URL}${id}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontWeight: 750 }}>{id}</a></span>)}</div>
                              {record.adoWorkItemId && <div style={{ color: "#64748b", fontSize: "11px", marginTop: "7px", whiteSpace: "pre-wrap" }}><strong>As recorded:</strong> {record.adoWorkItemId}</div>}
                            </div>
                          </div>
                          {record.relatedStory && <div style={{ borderTop: "1px solid #e2e8f0", color: "#475569", fontSize: "12px", marginTop: "14px", paddingTop: "12px", overflowWrap: "anywhere" }}>
                            <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.05em", marginBottom: "7px", textTransform: "uppercase" }}>Related Stories / Bugs</div>
                            <div className="[&_table]:text-[11px] [&_td]:align-top [&_td]:p-2 [&_th]:p-2 [&_p]:my-1 [&_a]:text-blue-700">
                              <Streamdown controls={false}>{record.relatedStory}</Streamdown>
                            </div>
                          </div>}
                        </td>
                      </tr>}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreate && <CreatePostPilotDeploymentForm onClose={() => setShowCreate(false)} />}
    </section>
  );
}
