// ─────────────────────────────────────────────────────────────────────────────
// Deployment Registry - DCT Platform Release History
// Authoritative release history: Batches · Features · Stories · Bugs · Tech Stories
// Design: matches existing RSM dark-theme administrative dashboard styling
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import GovernanceBanner from "@/components/GovernanceBanner";
import {
  Rocket, Bug, Wrench, Layers, Search, Plus, X, ExternalLink,
  ChevronDown, ChevronUp, Calendar, User, Package, FileText,
  Link2, AlertTriangle, CheckCircle2, Clock, RotateCcw, Activity, Mail, Copy, BookOpen,
} from "lucide-react";

// ─── Wiki entry helper ───────────────────────────────────────────────────────
function buildWikiEntry(dep: DeploymentRowLike): string {
  const anchor = dep.releaseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const adoIds = dep.adoWorkItemId ? dep.adoWorkItemId.split(/[,\s]+/).filter(Boolean) : [];
  const summaryText = dep.summary ?? "Deployment details to be documented.";

  // Table row
  const tableRow = `| ${dep.deploymentDate} | ${dep.releaseName} | ${dep.type} | ${dep.platform} | ${dep.deploymentOwner} | ${dep.productOwner} | ${dep.status} | ${summaryText.split(".")[0].trim()}. | [View Details](#${anchor}) |`;

  // Detail section
  const lines: string[] = [];
  lines.push(`### ${dep.releaseName}`);
  lines.push("");
  lines.push(`**Summary**`);
  lines.push("");
  lines.push(summaryText);
  lines.push("");
  if (adoIds.length > 0) {
    lines.push(`**Related Work Items**`);
    adoIds.forEach(id => lines.push(`- ${id.trim()}`));
    lines.push("");
  }
  lines.push(`**Release Notes**`);
  if (dep.relatedFeature) lines.push(`- ${dep.relatedFeature}`);
  if (dep.relatedBatch) lines.push(`- Related to ${dep.relatedBatch}`);
  if (dep.relatedStory) lines.push(`- ${dep.relatedStory}`);
  if (!dep.relatedFeature && !dep.relatedBatch && !dep.relatedStory) lines.push(`- TBD`);
  lines.push("");
  lines.push(`**Reference Links**`);
  lines.push(`- ADO Feature: ${dep.releaseNotesUrl ?? "TBD"}`);
  lines.push(`- ADO Deployment Story: ${adoIds.length > 0 ? adoIds.map(id => `#${id.trim()}`).join(", ") : "TBD"}`);
  lines.push(`- Swagger/API Documentation: ${dep.swaggerUrl ?? "TBD"}`);
  lines.push("");
  lines.push(`| Attribute | Value |`);
  lines.push(`|-----------|-------|`);
  lines.push(`| Platform | ${dep.platform} |`);
  lines.push(`| Type | ${dep.type} |`);
  lines.push(`| Deployment Owner | ${dep.deploymentOwner} |`);
  lines.push(`| Product Owner | ${dep.productOwner} |`);
  lines.push(`| Status | ${dep.status} |`);
  lines.push("");
  lines.push(`---`);

  return `## Deployment Registry Table Row\n\n\`\`\`markdown\n${tableRow}\n\`\`\`\n\n---\n\n## Deployment Details Section\n\n\`\`\`markdown\n${lines.join("\n")}\n\`\`\``;
}

interface DeploymentRowLike {
  releaseName: string; deploymentId: string; deploymentDate: string;
  deploymentOwner: string; productOwner: string; platform: string;
  type: string; status: string; environment: string;
  summary?: string | null; relatedBatch?: string | null;
  relatedFeature?: string | null; relatedStory?: string | null;
  adoWorkItemId?: string | null; releaseNotesUrl?: string | null;
  swaggerUrl?: string | null; githubReleaseTag?: string | null;
}

// ─── Email helper ────────────────────────────────────────────────────────────
const PO_EMAIL_KEY = "dct_deploy_po_email";
const CC_EMAIL_KEY = "dct_deploy_cc_email";

function buildDeploymentEmail(dep: { releaseName: string; deploymentId: string; deploymentDate: string; deploymentOwner: string; productOwner: string; platform: string; type: string; status: string; environment: string; summary?: string | null; relatedBatch?: string | null; relatedFeature?: string | null; adoWorkItemId?: string | null; }, poEmail: string, ccEmail?: string) {
  const subject = encodeURIComponent(`[DCT Platform] Deployment Notification - ${dep.releaseName} (${dep.deploymentId})`);
  const lines: string[] = [];
  lines.push(`Hi ${dep.productOwner},`);
  lines.push("");
  lines.push(`A new deployment has been recorded in the DCT Platform Deployment Registry.`);
  lines.push("");
  lines.push(`─────────────────────────────────────────`);
  lines.push(`DEPLOYMENT SUMMARY`);
  lines.push(`─────────────────────────────────────────`);
  lines.push(`Release Name:       ${dep.releaseName}`);
  lines.push(`Deployment ID:      ${dep.deploymentId}`);
  lines.push(`Date:               ${dep.deploymentDate}`);
  lines.push(`Platform:           ${dep.platform}`);
  lines.push(`Type:               ${dep.type}`);
  lines.push(`Status:             ${dep.status}`);
  lines.push(`Environment:        ${dep.environment}`);
  lines.push(`Deployment Owner:   ${dep.deploymentOwner}`);
  if (dep.relatedBatch) lines.push(`Related Batch:      ${dep.relatedBatch}`);
  if (dep.relatedFeature) lines.push(`Related Feature:    ${dep.relatedFeature}`);
  if (dep.adoWorkItemId) lines.push(`ADO Work Item:      ${dep.adoWorkItemId}`);
  if (dep.summary) {
    lines.push("");
    lines.push(`─────────────────────────────────────────`);
    lines.push(`NOTES`);
    lines.push(`─────────────────────────────────────────`);
    lines.push(dep.summary);
  }
  lines.push("");
  lines.push(`─────────────────────────────────────────`);
  lines.push(`This notification was generated from the DCT Platform Gate Verification Dashboard.`);
  lines.push(`For questions, contact the CATT Sr. Business Analyst.`);
  lines.push("");
  lines.push(`Thank you,`);
  lines.push(`CATT Sr. Business Analyst - DCT Platform Delivery`);
  const body = encodeURIComponent(lines.join("\n"));
  let mailto = `mailto:${poEmail}?subject=${subject}&body=${body}`;
  if (ccEmail) mailto += `&cc=${encodeURIComponent(ccEmail)}`;
  return mailto;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type DeploymentType = "All" | "Batch" | "Bug" | "Technical Story" | "Feature" | "Hotfix";
type PlatformFilter = "All" | "PDC" | "TDC" | "Platform" | "Both";
type SortBy = "deploymentDate" | "releaseName" | "deploymentOwner";
type DeploymentStatus = "Planned" | "Scheduled" | "In Progress" | "Deployed" | "Rolled Back";
type PlatformValue = "PDC" | "TDC" | "Platform" | "Both";
type TypeValue = "Batch" | "Feature" | "Bug" | "Technical Story" | "Hotfix";

interface DeploymentRow {
  id: number;
  deploymentId: string;
  releaseName: string;
  deploymentDate: string;
  deploymentOwner: string;
  productOwner: string;
  platform: PlatformValue;
  type: TypeValue;
  status: DeploymentStatus;
  summary: string | null;
  releaseNotesUrl: string | null;
  swaggerUrl: string | null;
  relatedBatch: string | null;
  relatedFeature: string | null;
  relatedStory: string | null;
  environment: string;
  adoWorkItemId: string | null;
  githubReleaseTag: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<DeploymentStatus, { bg: string; color: string; dot: string }> = {
  "Deployed":    { bg: "#f0fdf4", color: "#166534", dot: "#059669" },
  "In Progress": { bg: "#eff6ff", color: "#1e40af", dot: "#3b82f6" },
  "Planned":     { bg: "#f8fafc", color: "#475569", dot: "#94a3b8" },
  "Scheduled":   { bg: "#faf5ff", color: "#6b21a8", dot: "#a855f7" },
  "Rolled Back": { bg: "#fef2f2", color: "#991b1b", dot: "#ef4444" },
};

const TYPE_STYLE: Record<TypeValue, { bg: string; color: string; icon: React.ReactNode }> = {
  "Batch":           { bg: "#dbeafe", color: "#1e40af", icon: <Layers size={10} /> },
  "Feature":         { bg: "#d1fae5", color: "#065f46", icon: <Rocket size={10} /> },
  "Bug":             { bg: "#fee2e2", color: "#991b1b", icon: <Bug size={10} /> },
  "Technical Story": { bg: "#fef3c7", color: "#92400e", icon: <Wrench size={10} /> },
  "Hotfix":          { bg: "#fce7f3", color: "#9d174d", icon: <AlertTriangle size={10} /> },
};

const PLATFORM_COLOR: Record<PlatformValue, string> = {
  PDC: "#1e40af",
  TDC: "#059669",
  Platform: "#6366f1",
  Both: "#d97706",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DeploymentStatus }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE["Planned"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
      backgroundColor: s.bg, color: s.color, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0, display: "inline-block" }} />
      {status}
    </span>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: TypeValue }) {
  const t = TYPE_STYLE[type] ?? TYPE_STYLE["Feature"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px",
      backgroundColor: t.bg, color: t.color, whiteSpace: "nowrap",
    }}>
      {t.icon}
      {type}
    </span>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <div style={{
      flex: 1, minWidth: "120px",
      backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
      borderRadius: "8px", padding: "16px 20px",
      borderTop: `3px solid ${color}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────
function DetailDrawer({ dep, onClose }: { dep: DeploymentRow; onClose: () => void }) {
  const [showWiki, setShowWiki] = useState(false);
  const [copied, setCopied] = useState(false);
  const wikiText = buildWikiEntry(dep);
  const handleCopy = () => {
    navigator.clipboard.writeText(wikiText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "480px",
      backgroundColor: "#ffffff", borderLeft: "1px solid #e2e8f0",
      boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", zIndex: 50,
      overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0f1623", padding: "20px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <TypeBadge type={dep.type} />
              <StatusBadge status={dep.status} />
            </div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", lineHeight: "1.4" }}>{dep.releaseName}</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>{dep.deploymentId}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "2px", flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px", flex: 1 }}>
        {/* Key fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          {[
            { label: "Deployment Date", value: dep.deploymentDate, icon: <Calendar size={12} /> },
            { label: "Platform", value: dep.platform, icon: <Package size={12} />, color: PLATFORM_COLOR[dep.platform] },
            { label: "Deployment Owner", value: dep.deploymentOwner, icon: <User size={12} /> },
            { label: "Product Owner", value: dep.productOwner, icon: <User size={12} /> },
            { label: "Environment", value: dep.environment, icon: <Activity size={12} /> },
            { label: "Type", value: dep.type, icon: <Layers size={12} /> },
          ].map(f => (
            <div key={f.label} style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>
                {f.icon}{f.label}
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: f.color ?? "#0f1623" }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* Relationships */}
        {(dep.relatedBatch || dep.relatedFeature || dep.relatedStory) && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Relationships</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {dep.relatedBatch && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#eff6ff", borderRadius: "6px", padding: "8px 12px" }}>
                  <Layers size={12} style={{ color: "#1e40af", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>Related Batch</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e3a5f" }}>{dep.relatedBatch}</div>
                  </div>
                </div>
              )}
              {dep.relatedFeature && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f0fdf4", borderRadius: "6px", padding: "8px 12px" }}>
                  <Rocket size={12} style={{ color: "#059669", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Related Feature</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#065f46" }}>{dep.relatedFeature}</div>
                  </div>
                </div>
              )}
              {dep.relatedStory && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef3c7", borderRadius: "6px", padding: "8px 12px" }}>
                  <FileText size={12} style={{ color: "#92400e", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", textTransform: "uppercase" }}>Related Story / Bug</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#78350f" }}>{dep.relatedStory}</div>
                  </div>
                </div>
              )}
              {dep.adoWorkItemId && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f5f3ff", borderRadius: "6px", padding: "8px 12px" }}>
                  <Link2 size={12} style={{ color: "#6366f1", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#6366f1", textTransform: "uppercase" }}>ADO Work Item</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#4338ca" }}>{dep.adoWorkItemId}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        {dep.summary && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Summary</div>
            <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.7", backgroundColor: "#f8fafc", borderRadius: "6px", padding: "12px 14px", whiteSpace: "pre-wrap" }}>
              {dep.summary}
            </div>
          </div>
        )}

        {/* Links */}
        {(dep.releaseNotesUrl || dep.swaggerUrl || dep.githubReleaseTag) && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Links</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {dep.releaseNotesUrl && (
                <a href={dep.releaseNotesUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#1e40af", textDecoration: "none", padding: "6px 10px", backgroundColor: "#eff6ff", borderRadius: "5px" }}>
                  <FileText size={12} />Release Notes<ExternalLink size={10} style={{ marginLeft: "auto" }} />
                </a>
              )}
              {dep.swaggerUrl && (
                <a href={dep.swaggerUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#059669", textDecoration: "none", padding: "6px 10px", backgroundColor: "#f0fdf4", borderRadius: "5px" }}>
                  <Link2 size={12} />Swagger / API Docs<ExternalLink size={10} style={{ marginLeft: "auto" }} />
                </a>
              )}
              {dep.githubReleaseTag && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6366f1", padding: "6px 10px", backgroundColor: "#f5f3ff", borderRadius: "5px" }}>
                  <Package size={12} />GitHub Tag: {dep.githubReleaseTag}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email to PO */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => { window.location.href = buildDeploymentEmail(dep, dep.productOwner.includes("@") ? dep.productOwner : ""); }}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%",
              padding: "10px 14px", backgroundColor: "#0f1623", color: "#ffffff",
              border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Mail size={14} />
            Email Deployment Notification to PO
          </button>
          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "5px", paddingLeft: "2px" }}>
            Opens your email client with deployment details pre-filled. Enter the PO email address in the To field if not auto-populated.
          </div>
        </div>

        {/* Generate Wiki Entry */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowWiki(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%",
              padding: "10px 14px", backgroundColor: showWiki ? "#1e3a5f" : "#f8fafc",
              color: showWiki ? "#ffffff" : "#1e3a5f",
              border: `1px solid ${showWiki ? "#1e3a5f" : "#cbd5e1"}`,
              borderRadius: "6px", fontSize: "12px", fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <BookOpen size={14} />
            {showWiki ? "Hide Wiki Entry" : "Generate Wiki Entry"}
          </button>
          {showWiki && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Wiki Markdown - Ready to Paste</div>
                <button
                  onClick={handleCopy}
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    padding: "4px 10px", backgroundColor: copied ? "#059669" : "#0f1623",
                    color: "#ffffff", border: "none", borderRadius: "4px",
                    fontSize: "10px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <Copy size={10} />{copied ? "Copied!" : "Copy All"}
                </button>
              </div>
              <pre style={{
                backgroundColor: "#0f1623", color: "#e2e8f0",
                borderRadius: "6px", padding: "14px", fontSize: "10px",
                lineHeight: "1.6", overflowX: "auto", whiteSpace: "pre-wrap",
                wordBreak: "break-word", maxHeight: "320px", overflowY: "auto",
                margin: 0,
              }}>{wikiText}</pre>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "5px" }}>
                Copy and paste the two sections into your Deployment Registry wiki page. Insert the table row at the top of the registry table and the detail section at the top of the details list.
              </div>
            </div>
          )}
        </div>

        {/* Governance note */}
        <div style={{ fontSize: "11px", color: "#92400e", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px" }}>
          <strong>Governance Note:</strong> This record is part of the DCT Platform non-production governance workspace. All deployment records require formal enterprise implementation outside this workspace.
        </div>
      </div>
    </div>
  );
}
// ─── Create form ───────────────────────────────────────────────────────────────
function CreateDeploymentForm({ onClose, onCreated }: { onClose: () => void; onCreated: (dep: { releaseName: string; deploymentId: string; deploymentDate: string; deploymentOwner: string; productOwner: string; poEmail?: string; platform: string; type: string; status: string; environment: string; summary?: string | null; relatedBatch?: string | null; relatedFeature?: string | null; adoWorkItemId?: string | null }) => void }) {
  const createMutation = trpc.deploymentRegistry.create.useMutation({
    onSuccess: (result) => { onCreated({ ...(result as any), poEmail: formRef.current?.poEmail, ccEmail: formRef.current?.ccEmail }); },
  });
  const formRef = { current: null as null | { poEmail: string; ccEmail: string } };

  const [form, setForm] = useState({
    releaseName: "",
    deploymentDate: new Date().toISOString().slice(0, 10),
    deploymentOwner: "",
    productOwner: "",
    poEmail: (typeof window !== "undefined" && localStorage.getItem(PO_EMAIL_KEY)) || "Stephane.Lacombe@rsmus.com",
    ccEmail: (typeof window !== "undefined" && localStorage.getItem(CC_EMAIL_KEY)) || "Jenniver.Stafford@rsmus.com",
    platform: "TDC" as PlatformValue,
    type: "Feature" as TypeValue,
    status: "Planned" as DeploymentStatus,
    summary: "",
    releaseNotesUrl: "",
    swaggerUrl: "",
    relatedBatch: "",
    relatedFeature: "",
    relatedStory: "",
    environment: "Production",
    adoWorkItemId: "",
    githubReleaseTag: "",
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "poEmail") localStorage.setItem(PO_EMAIL_KEY, v);
    if (k === "ccEmail") localStorage.setItem(CC_EMAIL_KEY, v);
  };

  // Keep formRef in sync so onSuccess can read email fields after mutation
  formRef.current = { poEmail: form.poEmail, ccEmail: form.ccEmail };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      releaseName: form.releaseName,
      deploymentDate: form.deploymentDate,
      deploymentOwner: form.deploymentOwner,
      productOwner: form.productOwner,
      platform: form.platform,
      type: form.type,
      status: form.status,
      summary: form.summary || undefined,
      releaseNotesUrl: form.releaseNotesUrl || undefined,
      swaggerUrl: form.swaggerUrl || undefined,
      relatedBatch: form.relatedBatch || undefined,
      relatedFeature: form.relatedFeature || undefined,
      relatedStory: form.relatedStory || undefined,
      adoWorkItemId: form.adoWorkItemId || undefined,
      githubReleaseTag: form.githubReleaseTag || undefined,
    });
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "7px 10px", fontSize: "12px",
    border: "1px solid #e2e8f0", borderRadius: "5px",
    backgroundColor: "#f8fafc", color: "#0f1623",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "10px", fontWeight: 700, color: "#64748b",
    textTransform: "uppercase", letterSpacing: "0.06em",
    display: "block", marginBottom: "4px",
  };

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: "520px",
      backgroundColor: "#ffffff", borderLeft: "1px solid #e2e8f0",
      boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", zIndex: 50,
      overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      <div style={{ backgroundColor: "#0f1623", padding: "20px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Create Deployment</div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>Add a new release record to the registry</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Release Name *</label>
          <input required style={fieldStyle} value={form.releaseName} onChange={e => set("releaseName", e.target.value)} placeholder="e.g. Batch 10 Return Assembly, Filing & Lineage Closure" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Deployment Date *</label>
            <input required type="date" style={fieldStyle} value={form.deploymentDate} onChange={e => set("deploymentDate", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={form.status} onChange={e => set("status", e.target.value)}>
              {["Planned","Scheduled","In Progress","Deployed","Rolled Back"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Deployment Owner *</label>
            <input required style={fieldStyle} value={form.deploymentOwner} onChange={e => set("deploymentOwner", e.target.value)} placeholder="e.g. Gary Luca" />
          </div>
          <div>
            <label style={labelStyle}>Product Owner *</label>
            <input required style={fieldStyle} value={form.productOwner} onChange={e => set("productOwner", e.target.value)} placeholder="e.g. Stephane Lacombe" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>PO Email Address</label>
            <input
              type="email"
              style={fieldStyle}
              value={form.poEmail}
              onChange={e => set("poEmail", e.target.value)}
              placeholder="e.g. Stephane.Lacombe@rsmus.com"
            />
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>Saved automatically for future deployments.</div>
          </div>
          <div>
            <label style={labelStyle}>CC Email Address</label>
            <input
              type="email"
              style={fieldStyle}
              value={form.ccEmail}
              onChange={e => set("ccEmail", e.target.value)}
              placeholder="e.g. Jenniver.Stafford@rsmus.com"
            />
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>Saved automatically for future deployments.</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Platform *</label>
            <select style={fieldStyle} value={form.platform} onChange={e => set("platform", e.target.value)}>
              {["PDC","TDC","Platform","Both"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type *</label>
            <select style={fieldStyle} value={form.type} onChange={e => set("type", e.target.value)}>
              {["Batch","Feature","Bug","Technical Story","Hotfix"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Summary</label>
          <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={form.summary} onChange={e => set("summary", e.target.value)} placeholder="Describe what was deployed and any key notes..." />
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Relationships</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Related Batch</label>
            <input style={fieldStyle} value={form.relatedBatch} onChange={e => set("relatedBatch", e.target.value)} placeholder="e.g. B10" />
          </div>
          <div>
            <label style={labelStyle}>Related Feature</label>
            <input style={fieldStyle} value={form.relatedFeature} onChange={e => set("relatedFeature", e.target.value)} placeholder="e.g. Return Assembly" />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Related Story / Bug</label>
          <input style={fieldStyle} value={form.relatedStory} onChange={e => set("relatedStory", e.target.value)} placeholder="e.g. Bug 1401152 or Story #12345" />
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Links & Integration (Optional)</div>
        <div>
          <label style={labelStyle}>Release Notes URL</label>
          <input style={fieldStyle} value={form.releaseNotesUrl} onChange={e => set("releaseNotesUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label style={labelStyle}>Swagger / API Docs URL</label>
          <input style={fieldStyle} value={form.swaggerUrl} onChange={e => set("swaggerUrl", e.target.value)} placeholder="https://..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>ADO Work Item ID</label>
            <input style={fieldStyle} value={form.adoWorkItemId} onChange={e => set("adoWorkItemId", e.target.value)} placeholder="e.g. 1401152" />
          </div>
          <div>
            <label style={labelStyle}>GitHub Release Tag</label>
            <input style={fieldStyle} value={form.githubReleaseTag} onChange={e => set("githubReleaseTag", e.target.value)} placeholder="e.g. v2.4.1" />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", paddingTop: "8px", borderTop: "1px solid #e2e8f0", marginTop: "auto" }}>
          <button
            type="submit"
            disabled={createMutation.isPending}
            style={{
              flex: 1, padding: "9px 16px", backgroundColor: "#0f1623", color: "#ffffff",
              border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
              cursor: createMutation.isPending ? "not-allowed" : "pointer",
              opacity: createMutation.isPending ? 0.7 : 1,
            }}
          >
            {createMutation.isPending ? "Creating..." : "Create Deployment"}
          </button>
          <button type="button" onClick={onClose} style={{ padding: "9px 16px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DeploymentRegistry() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeploymentType>("All");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("All");
  const [sortBy, setSortBy] = useState<SortBy>("deploymentDate");
  const [selectedDep, setSelectedDep] = useState<DeploymentRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAllWiki, setShowAllWiki] = useState(false);
  const [allWikiCopied, setAllWikiCopied] = useState(false);
  const [justCreated, setJustCreated] = useState<{ releaseName: string; deploymentId: string; deploymentDate: string; deploymentOwner: string; productOwner: string; poEmail?: string; ccEmail?: string; platform: string; type: string; status: string; environment: string; summary?: string | null; relatedBatch?: string | null; relatedFeature?: string | null; adoWorkItemId?: string | null } | null>(null);

  const utils = trpc.useUtils();

  const { data: summaryData } = trpc.deploymentRegistry.summary.useQuery();
  const { data: rows = [], isLoading } = trpc.deploymentRegistry.list.useQuery({
    search: search || undefined,
    type: typeFilter === "All" ? undefined : typeFilter,
    platform: platformFilter === "All" ? undefined : platformFilter,
    sortBy,
  });

  const handleCreated = () => {
    utils.deploymentRegistry.list.invalidate();
    utils.deploymentRegistry.summary.invalidate();
  };

  const summary = summaryData ?? { total: 0, production: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#059669",
            }}>
              <Rocket size={16} />
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
                Deployment Registry
              </h1>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Track deployment history, release ownership, release notes, and production availability
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[
              { label: `${summary.total} Total Deployments`, color: "#0f1623" },
              { label: "Non-Production Workspace", color: "#d97706" },
              { label: "ADO-Ready Schema", color: "#6366f1" },
            ].map(b => (
              <span key={b.label} style={{
                fontSize: "10px", fontWeight: 600, color: "white",
                backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px",
              }}>{b.label}</span>
            ))}
          </div>
        </div>
      </div>

      <GovernanceBanner />

      {/* ── Summary cards ── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <SummaryCard label="Total Deployments"     value={summary.total}              color="#0f1623" icon={<Rocket size={14} />} />
        <SummaryCard label="Production Releases"   value={summary.production}         color="#059669" icon={<CheckCircle2 size={14} />} />
        <SummaryCard label="PDC Deployments"       value={summary.pdc}                color="#1e40af" icon={<Layers size={14} />} />
        <SummaryCard label="TDC Deployments"       value={summary.tdc}                color="#059669" icon={<Activity size={14} />} />
        <SummaryCard label="Open Rollback Candidates" value={summary.rollbackCandidates} color="#dc2626" icon={<RotateCcw size={14} />} />
      </div>

      {/* ── Search, filters, create ── */}
      <div style={{
        display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px",
      }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 200px", minWidth: "160px" }}>
          <Search size={12} style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search deployments..."
            style={{
              width: "100%", padding: "6px 10px 6px 28px", fontSize: "12px",
              border: "1px solid #e2e8f0", borderRadius: "5px", backgroundColor: "#ffffff",
              color: "#0f1623", boxSizing: "border-box",
            }}
          />
        </div>

        {/* Type filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>Type</span>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as DeploymentType)}
            style={{ padding: "5px 8px", fontSize: "11px", border: "1px solid #e2e8f0", borderRadius: "5px", backgroundColor: "#ffffff", color: "#0f1623" }}
          >
            {(["All","Batch","Bug","Technical Story","Feature","Hotfix"] as DeploymentType[]).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Platform filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>Platform</span>
          <select
            value={platformFilter}
            onChange={e => setPlatformFilter(e.target.value as PlatformFilter)}
            style={{ padding: "5px 8px", fontSize: "11px", border: "1px solid #e2e8f0", borderRadius: "5px", backgroundColor: "#ffffff", color: "#0f1623" }}
          >
            {(["All","PDC","TDC","Platform","Both"] as PlatformFilter[]).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>Sort</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{ padding: "5px 8px", fontSize: "11px", border: "1px solid #e2e8f0", borderRadius: "5px", backgroundColor: "#ffffff", color: "#0f1623" }}
          >
            <option value="deploymentDate">Deployment Date</option>
            <option value="releaseName">Release Name</option>
            <option value="deploymentOwner">Owner</option>
          </select>
        </div>

        {/* Generate All Wiki button */}
        <button
          onClick={() => setShowAllWiki(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", backgroundColor: "#065f46", color: "#ffffff",
            border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap", marginLeft: "auto",
          }}
        >
          <BookOpen size={12} />Generate Wiki
        </button>
        {/* Email to PO button */}
        <button
          onClick={() => setShowEmailModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", backgroundColor: "#1e3a5f", color: "#ffffff",
            border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <Mail size={12} />Email to PO
        </button>
        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", backgroundColor: "#0f1623", color: "#ffffff",
            border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
        >
          <Plus size={12} />Create Deployment
        </button>
      </div>

      {/* ── Table ── */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "110px 1fr 120px 80px 130px 130px 110px",
          gap: "0",
          backgroundColor: "#0f1623", padding: "10px 16px",
        }}>
          {["Deployment Date","Release Name","Type","Platform","Deployment Owner","Product Owner","Status"].map(h => (
            <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>Loading deployments...</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <Rocket size={32} style={{ color: "#cbd5e1", margin: "0 auto 12px" }} />
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>No deployments found</div>
            <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
              {search || typeFilter !== "All" || platformFilter !== "All" ? "Try adjusting your filters." : "Click Create Deployment to add the first record."}
            </div>
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={row.id}
              onClick={() => setSelectedDep(row as DeploymentRow)}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr 120px 80px 130px 130px 110px",
                gap: "0",
                padding: "10px 16px",
                borderBottom: idx < rows.length - 1 ? "1px solid #f1f5f9" : "none",
                cursor: "pointer",
                backgroundColor: selectedDep?.id === row.id ? "#f0f9ff" : "transparent",
                transition: "background-color 0.1s",
              }}
              onMouseEnter={e => { if (selectedDep?.id !== row.id) (e.currentTarget as HTMLElement).style.backgroundColor = "#f8fafc"; }}
              onMouseLeave={e => { if (selectedDep?.id !== row.id) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, paddingTop: "2px" }}>{row.deploymentDate}</div>
              <div style={{ fontSize: "12px", color: "#0f1623", fontWeight: 600, lineHeight: "1.4", paddingRight: "12px" }}>{row.releaseName}</div>
              <div><TypeBadge type={row.type as TypeValue} /></div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: PLATFORM_COLOR[row.platform as PlatformValue] ?? "#64748b" }}>{row.platform}</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{row.deploymentOwner}</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{row.productOwner}</div>
              <div><StatusBadge status={row.status as DeploymentStatus} /></div>
            </div>
          ))
        )}
      </div>

      {/* Row count */}
      {rows.length > 0 && (
        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "8px", textAlign: "right" }}>
          Showing {rows.length} deployment{rows.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* ── Standalone Email to PO modal ── */}
      {showEmailModal && (() => {
        const poEmail = (typeof window !== "undefined" && localStorage.getItem(PO_EMAIL_KEY)) || "Stephane.Lacombe@rsmus.com";
        const ccEmail = (typeof window !== "undefined" && localStorage.getItem(CC_EMAIL_KEY)) || "Jenniver.Stafford@rsmus.com";
        const subject = encodeURIComponent(`[DCT Platform] Deployment Registry Summary - ${rows.length} Deployment${rows.length !== 1 ? "s" : ""} on Record`);
        const lines: string[] = [];
        lines.push(`Hi ${rows[0]?.productOwner ?? "Stephane"},`);
        lines.push("");
        lines.push(`This is a summary of the current DCT Platform Deployment Registry.`);
        lines.push("");
        lines.push(`─────────────────────────────────────────`);
        lines.push(`DEPLOYMENT REGISTRY SUMMARY`);
        lines.push(`─────────────────────────────────────────`);
        lines.push(`Total Deployments:    ${rows.length}`);
        lines.push(`PDC Deployments:      ${rows.filter(r => r.platform === "PDC").length}`);
        lines.push(`TDC Deployments:      ${rows.filter(r => r.platform === "TDC").length}`);
        lines.push(`Deployed:             ${rows.filter(r => r.status === "Deployed").length}`);
        lines.push("");
        lines.push(`─────────────────────────────────────────`);
        lines.push(`DEPLOYMENT RECORDS`);
        lines.push(`─────────────────────────────────────────`);
        rows.forEach((r, i) => {
          lines.push(`${i + 1}. ${r.releaseName}`);
          lines.push(`   Date: ${r.deploymentDate} | Platform: ${r.platform} | Type: ${r.type} | Status: ${r.status}`);
          lines.push(`   Owner: ${r.deploymentOwner} | PO: ${r.productOwner}`);
          lines.push("");
        });
        lines.push(`─────────────────────────────────────────`);
        lines.push(`This summary was generated from the DCT Platform Gate Verification Dashboard.`);
        lines.push(`For questions, contact the CATT Sr. Business Analyst.`);
        lines.push("");
        lines.push(`Thank you,`);
        lines.push(`CATT Sr. Business Analyst - DCT Platform Delivery`);
        const body = encodeURIComponent(lines.join("\n"));
        let mailto = `mailto:${poEmail}?subject=${subject}&body=${body}`;
        if (ccEmail) mailto += `&cc=${encodeURIComponent(ccEmail)}`;
        return (
          <>
            <div onClick={() => setShowEmailModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }} />
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "480px", backgroundColor: "#ffffff", borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)", zIndex: 50, overflow: "hidden",
            }}>
              <div style={{ backgroundColor: "#1e3a5f", padding: "20px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Mail size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Email Deployment Registry to PO</div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Opens Outlook with {rows.length} deployment{rows.length !== 1 ? "s" : ""} pre-filled</div>
                  </div>
                  <button onClick={() => setShowEmailModal(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={16} /></button>
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>To (Product Owner)</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f1623" }}>{poEmail}</div>
                  </div>
                  <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>CC (BA)</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#0f1623" }}>{ccEmail}</div>
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", marginBottom: "16px", lineHeight: "1.6", backgroundColor: "#f0f9ff", borderRadius: "6px", padding: "10px 12px", border: "1px solid #bae6fd" }}>
                  <strong>Subject:</strong> [DCT Platform] Deployment Registry Summary - {rows.length} Deployment{rows.length !== 1 ? "s" : ""} on Record
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "16px", backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px", maxHeight: "120px", overflowY: "auto", fontFamily: "monospace", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {lines.slice(0, 12).join("\n")}{lines.length > 12 ? "\n..." : ""}
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { window.location.href = mailto; setShowEmailModal(false); }}
                    style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      padding: "10px 16px", backgroundColor: "#1e3a5f", color: "#ffffff",
                      border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    <Mail size={14} /> Send Email
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    style={{
                      padding: "10px 16px", backgroundColor: "#f1f5f9", color: "#475569",
                      border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px", textAlign: "center" }}>
                  Opens your email client (Outlook) with all fields pre-filled. To/CC addresses are saved from your last Create Deployment form.
                </div>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Generate All Wiki Entries modal ── */}
      {showAllWiki && (() => {
        const TABLE_HEADER = `| Deployment Date | Release Name | Type | Platform | Deployment Owner | Product Owner | Status | Summary | Release Notes |\n| --------------- | ------------ | ---- | -------- | ---------------- | ------------- | ------ | ------- | ------------- |`;
        const tableRows = rows.map(r => {
          const anchor = r.releaseName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          const shortSummary = r.summary ? r.summary.split(".")[0].trim() + "." : "Deployment details to be documented.";
          return `| ${r.deploymentDate} | ${r.releaseName} | ${r.type} | ${r.platform} | ${r.deploymentOwner} | ${r.productOwner} | ${r.status} | ${shortSummary} | [View Details](#${anchor}) |`;
        });
        const detailSections = rows.map(r => {
          const entry = buildWikiEntry(r as any);
          // Extract just the detail section markdown block
          const match = entry.match(/## Deployment Details Section\n\n```markdown\n([\s\S]+?)\n```/);
          return match ? match[1] : "";
        });
        const fullWiki = [
          `# DCT Platform Deployment Registry`,
          ``,
          `> **Governance Notice:** This registry documents deployments from the DCT Platform non-production governance workspace. All records are for architecture visualization and delivery tracking purposes only.`,
          ``,
          `---`,
          ``,
          `## Deployment Registry`,
          ``,
          TABLE_HEADER,
          ...tableRows,
          ``,
          `---`,
          ``,
          `## Deployment Details`,
          ``,
          ...detailSections,
        ].join("\n");
        const handleCopyAll = () => {
          navigator.clipboard.writeText(fullWiki).then(() => { setAllWikiCopied(true); setTimeout(() => setAllWikiCopied(false), 2500); });
        };
        return (
          <>
            <div onClick={() => setShowAllWiki(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }} />
            <div style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: "680px", maxWidth: "95vw", backgroundColor: "#ffffff", borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)", zIndex: 50, overflow: "hidden",
              display: "flex", flexDirection: "column", maxHeight: "85vh",
            }}>
              {/* Header */}
              <div style={{ backgroundColor: "#065f46", padding: "20px 24px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={16} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Generate Full Wiki - All Deployments</div>
                    <div style={{ fontSize: "11px", color: "#a7f3d0", marginTop: "2px" }}>{rows.length} deployment{rows.length !== 1 ? "s" : ""} - complete registry table + all detail sections</div>
                  </div>
                  <button onClick={() => setShowAllWiki(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#a7f3d0" }}><X size={18} /></button>
                </div>
              </div>
              {/* Instructions */}
              <div style={{ padding: "16px 24px", backgroundColor: "#f0fdf4", borderBottom: "1px solid #bbf7d0", flexShrink: 0 }}>
                <div style={{ fontSize: "12px", color: "#065f46", lineHeight: "1.6" }}>
                  <strong>How to use:</strong> Click <strong>Copy All Markdown</strong> below, then paste into your wiki page. The output includes:
                  <span style={{ display: "block", marginTop: "4px", color: "#047857" }}>
                    1. Full registry table with all {rows.length} rows and anchor links &nbsp;|&nbsp;
                    2. Complete detail section for every deployment
                  </span>
                </div>
              </div>
              {/* Markdown preview */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
                <pre style={{
                  backgroundColor: "#0f1623", color: "#e2e8f0",
                  borderRadius: "8px", padding: "16px", fontSize: "10px",
                  lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word",
                  margin: 0, minHeight: "200px",
                }}>{fullWiki}</pre>
              </div>
              {/* Footer actions */}
              <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", flexShrink: 0, display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  onClick={handleCopyAll}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "11px 20px", backgroundColor: allWikiCopied ? "#059669" : "#065f46",
                    color: "#ffffff", border: "none", borderRadius: "6px",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <Copy size={14} />{allWikiCopied ? "Copied to Clipboard!" : "Copy All Markdown"}
                </button>
                <button
                  onClick={() => setShowAllWiki(false)}
                  style={{ padding: "11px 20px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* ── Post-create email prompt ── */}
      {justCreated && (
        <>
          <div
            onClick={() => setJustCreated(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 40 }}
          />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "460px", backgroundColor: "#ffffff", borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", zIndex: 50, overflow: "hidden",
          }}>
            <div style={{ backgroundColor: "#0f1623", padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Deployment Created</div>
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{justCreated.deploymentId}</div>
                </div>
                <button onClick={() => setJustCreated(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={16} /></button>
              </div>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f1623", marginBottom: "4px" }}>{justCreated.releaseName}</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>
                {justCreated.platform} · {justCreated.type} · {justCreated.deploymentDate}
              </div>
              <div style={{ fontSize: "12px", color: "#475569", marginBottom: "16px", lineHeight: "1.6", backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>
                Would you like to notify <strong>{justCreated.productOwner}</strong> (Product Owner) about this deployment?
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => { window.location.href = buildDeploymentEmail(justCreated, justCreated.poEmail ?? "", justCreated.ccEmail); setJustCreated(null); }}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "10px 16px", backgroundColor: "#0f1623", color: "#ffffff",
                    border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  }}
                >
                  <Mail size={14} /> Email to PO
                </button>
                <button
                  onClick={() => setJustCreated(null)}
                  style={{
                    padding: "10px 16px", backgroundColor: "#f1f5f9", color: "#475569",
                    border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  Skip
                </button>
              </div>
              <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "8px", textAlign: "center" }}>
                Opens your email client with deployment details pre-filled.
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Detail drawer ── */}
      {selectedDep && (
        <>
          <div
            onClick={() => setSelectedDep(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 40 }}
          />
          <DetailDrawer dep={selectedDep} onClose={() => setSelectedDep(null)} />
        </>
      )}

      {/* ── Create form drawer ── */}
      {showCreate && (
        <>
          <div
            onClick={() => setShowCreate(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 40 }}
          />
          <CreateDeploymentForm onClose={() => setShowCreate(false)} onCreated={(dep) => { handleCreated(); setShowCreate(false); setJustCreated(dep); }} />
        </>
      )}
    </div>
  );
}
