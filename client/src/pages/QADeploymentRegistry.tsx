// -----------------------------------------------------------------------------
// QA Deployment Registry - QA Environment Deployment History
// Tracks deployments into the QA environment for Roger, PDC, TDC, and cross-platform releases
// Design: matches existing RSM dark-theme administrative dashboard styling
// -----------------------------------------------------------------------------
import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import QABuddyPanel, { type AnalyzedRelease } from "@/components/QABuddyPanel";
import GovernanceBanner from "@/components/GovernanceBanner";
import AboutSectionPanel from "@/components/AboutSectionPanel";
import {
  Rocket, Bug, Wrench, Layers, Search, Plus, X, ExternalLink,
  ChevronDown, ChevronUp, Calendar, User, Package, FileText,
  Link2, AlertTriangle, CheckCircle2, Clock, RotateCcw, Activity, Copy, Pencil, Eye, Trash2,
} from "lucide-react";

// --- Wiki entry helper -------------------------------------------------------
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
  if (dep.releaseNotesBullets && dep.releaseNotesBullets.trim()) {
    dep.releaseNotesBullets.split("\n").map(b => b.trim()).filter(Boolean).forEach(b => lines.push(`- ${b}`));
  } else if (dep.relatedFeature) {
    lines.push(`- ${dep.relatedFeature}`);
    if (dep.relatedBatch) lines.push(`- Related to ${dep.relatedBatch}`);
    if (dep.relatedStory) lines.push(`- ${dep.relatedStory}`);
  } else {
    lines.push(`- TBD`);
  }
  lines.push("");
  lines.push(`**Reference Links**`);
  lines.push(`- ADO Feature: ${dep.adoFeatureUrl ?? "TBD"}`);
  lines.push(`- ADO Deployment Story: ${dep.adoStoryUrl ?? (adoIds.length > 0 ? adoIds.map(id => `#${id.trim()}`).join(", ") : "TBD")}`);
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
  adoWorkItemId?: string | null; adoFeatureUrl?: string | null;
  adoStoryUrl?: string | null; adoLinks?: string | null;
  releaseNotesBullets?: string | null;
  releaseNotesUrl?: string | null;
  swaggerUrl?: string | null; githubReleaseTag?: string | null;
}

// --- Types --------------------------------------------------------------------
type DeploymentType = "All" | "Batch" | "Bug" | "Technical Story" | "Feature" | "Hotfix";
type PlatformFilter = "All" | "Roger" | "PDC" | "TDC" | "Platform" | "Both";
type SortBy = "deploymentDate" | "releaseName" | "deploymentOwner";
type DeploymentStatus = "Planned" | "Scheduled" | "In Progress" | "Deployed" | "Rolled Back";
type PlatformValue = "Roger" | "PDC" | "TDC" | "Platform" | "Both";
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
  adoFeatureUrl: string | null;
  adoStoryUrl: string | null;
  releaseNotesBullets: string | null;
  githubReleaseTag: string | null;
  adoLinks: string | null;
  screenChanges: string | null;
  whatChanged: string | null;
  qaTestInstructions: string | null;
  expectedResults: string | null;
  knownIssues: string | null;
  backendChanges: string | null;
  validationStatus: string | null;
  validatedBy: string | null;
  validationDate: string | null;
  validationNotes: string | null;
  releaseNotesStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// --- ADO link type -----------------------------------------------------------
interface AdoLinkEntry { type: "Feature" | "Story"; label: string; url: string; }

function parseAdoLinks(raw: string | null | undefined): AdoLinkEntry[] {
  if (!raw) return [];
  try { return JSON.parse(raw) as AdoLinkEntry[]; } catch { return []; }
}

// --- AdoLinksEditor ----------------------------------------------------------
function AdoLinksEditor({ links, onChange }: { links: AdoLinkEntry[]; onChange: (links: AdoLinkEntry[]) => void }) {
  const fieldStyle: React.CSSProperties = {
    padding: "5px 8px", fontSize: "11px",
    border: "1px solid #e2e8f0", borderRadius: "4px",
    backgroundColor: "#f8fafc", color: "#0f1623", boxSizing: "border-box" as const,
  };

  const addRow = () => onChange([...links, { type: "Feature", label: "", url: "" }]);
  const removeRow = (i: number) => onChange(links.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: keyof AdoLinkEntry, val: string) =>
    onChange(links.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {links.map((link, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 28px", gap: "6px", alignItems: "center" }}>
          <select
            style={fieldStyle}
            value={link.type}
            onChange={e => updateRow(i, "type", e.target.value)}
          >
            <option value="Feature">Feature</option>
            <option value="Story">Story</option>
          </select>
          <input
            style={{ ...fieldStyle, width: "100%" }}
            placeholder="Label (e.g. B10 Return Assembly)"
            value={link.label}
            onChange={e => updateRow(i, "label", e.target.value)}
          />
          <input
            style={{ ...fieldStyle, width: "100%" }}
            placeholder="https://dev.azure.com/..."
            value={link.url}
            onChange={e => updateRow(i, "url", e.target.value)}
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "0", display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      {links.length === 0 && (
        <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic" }}>No ADO links added yet.</div>
      )}
      <button
        type="button"
        onClick={addRow}
        style={{
          display: "inline-flex", alignItems: "center", gap: "5px",
          padding: "5px 10px", backgroundColor: "#eff6ff", color: "#1e40af",
          border: "1px solid #bfdbfe", borderRadius: "5px",
          fontSize: "11px", fontWeight: 700, cursor: "pointer", alignSelf: "flex-start",
        }}
      >
        <Plus size={11} /> Add ADO Link
      </button>
    </div>
  );
}

// --- Style helpers ------------------------------------------------------------
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
  Roger: "#7c3aed",
  PDC: "#1e40af",
  TDC: "#059669",
  Platform: "#6366f1",
  Both: "#d97706",
};

// --- Status badge -------------------------------------------------------------
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

// --- Type badge ---------------------------------------------------------------
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

// --- Summary card -------------------------------------------------------------
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

// --- Detail drawer ----------------------------------------------------------------
function DetailDrawer({ dep, onClose, onEdit }: { dep: DeploymentRow; onClose: () => void; onEdit: (dep: DeploymentRow) => void }) {
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <button
              onClick={() => onEdit(dep)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "5px 10px", backgroundColor: "#1e3a5f", color: "#ffffff",
                border: "1px solid #2563eb", borderRadius: "5px",
                fontSize: "11px", fontWeight: 700, cursor: "pointer",
              }}
            >
              <Pencil size={11} /> Edit
            </button>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "2px" }}>
              <X size={18} />
            </button>
          </div>
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

        {/* ADO Links (multi-link) */}
        {(() => {
          const links = parseAdoLinks(dep.adoLinks);
          if (links.length === 0) return null;
          return (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>ADO Links</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      fontSize: "12px", textDecoration: "none", padding: "6px 10px",
                      borderRadius: "5px",
                      backgroundColor: link.type === "Feature" ? "#eff6ff" : "#f0fdf4",
                      color: link.type === "Feature" ? "#1e40af" : "#065f46",
                    }}
                  >
                    <Link2 size={12} />
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", opacity: 0.7, marginRight: "2px" }}>{link.type}</span>
                    {link.label || link.url}
                    <ExternalLink size={10} style={{ marginLeft: "auto" }} />
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

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

                {/* Governance note */}
        <div style={{ fontSize: "11px", color: "#92400e", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px", padding: "8px 12px" }}>
          <strong>Governance Note:</strong> This record is part of the DCT Platform non-production governance workspace. All deployment records require formal enterprise implementation outside this workspace.
        </div>
      </div>
    </div>
  );
}
// --- Create form ---------------------------------------------------------------
function CreateDeploymentForm({ onClose, onCreated, prefill, draftForm, draftAdoLinks, onDraftChange, onDraftAdoChange }: {
  onClose: () => void;
  onCreated: (dep: { releaseName: string; deploymentId: string; deploymentDate: string; deploymentOwner: string; productOwner: string; poEmail?: string; platform: string; type: string; status: string; environment: string; summary?: string | null; relatedBatch?: string | null; relatedFeature?: string | null; adoWorkItemId?: string | null }) => void;
  prefill?: import('@/components/QABuddyPanel').AnalyzedRelease | null;
  draftForm?: Record<string, string> | null;
  draftAdoLinks?: AdoLinkEntry[];
  onDraftChange?: (form: Record<string, string>) => void;
  onDraftAdoChange?: (links: AdoLinkEntry[]) => void;
}) {
  const createMutation = trpc.qaDeploymentRegistry.create.useMutation({
    onSuccess: (result) => { onCreated(result as any); },
  });

  const defaultForm = {
    releaseName: prefill?.releaseName ?? "",
    deploymentDate: new Date().toISOString().slice(0, 10),
    deploymentOwner: "",
    productOwner: "",
    platform: (prefill?.platform as PlatformValue) ?? "Roger" as PlatformValue,
    type: (prefill?.type as TypeValue) ?? "" as TypeValue,
    status: "Planned" as DeploymentStatus,
    releaseNotesUrl: "",
    swaggerUrl: "",
    relatedBatch: "",
    relatedFeature: "",
    relatedStory: "",
    environment: "Production",
    adoWorkItemId: "",
    adoFeatureUrl: "",
    adoStoryUrl: "",
    releaseNotesBullets: "",
    githubReleaseTag: "",
    whatChanged: prefill?.screens.map(s => `${s.screenName}: ${s.whatChanged}`).join("\n\n") ?? "",
    qaTestInstructions: prefill?.screens.map(s => `${s.screenName}: ${s.qaTestInstructions}`).join("\n\n") ?? "",
    expectedResults: prefill?.screens.map(s => `${s.screenName}: ${s.expectedResult}`).join("\n\n") ?? "",
    knownIssues: prefill?.screens.filter(s => s.knownIssues && s.knownIssues !== "None identified").map(s => `${s.screenName}: ${s.knownIssues}`).join("\n\n") ?? "",
    backendChanges: "",
    validationStatus: "Pending",
    validatedBy: "",
    validationDate: "",
    validationNotes: "",
    releaseNotesStatus: "Draft",
    screenChanges: prefill ? JSON.stringify(prefill.screens) : "",
    summary: prefill?.summary ?? "",
  };

  // Use parent-lifted draft state if provided, otherwise fall back to local state
  const [localForm, setLocalForm] = useState<Record<string, string>>(() => draftForm ?? defaultForm as unknown as Record<string, string>);
  const [localAdoLinks, setLocalAdoLinks] = useState<AdoLinkEntry[]>(() => draftAdoLinks ?? []);

  const form = localForm as typeof defaultForm;
  const adoLinks = localAdoLinks;

  const set = (k: string, v: string) => {
    setLocalForm(f => {
      const next = { ...f, [k]: v };
      onDraftChange?.(next);
      return next;
    });
  };

  const setAdoLinks = (links: AdoLinkEntry[]) => {
    setLocalAdoLinks(links);
    onDraftAdoChange?.(links);
  };

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
      adoFeatureUrl: form.adoFeatureUrl || undefined,
      adoStoryUrl: form.adoStoryUrl || undefined,
      adoLinks: adoLinks.length > 0 ? JSON.stringify(adoLinks) : undefined,
      releaseNotesBullets: form.releaseNotesBullets || undefined,
      githubReleaseTag: form.githubReleaseTag || undefined,
      screenChanges: form.screenChanges || undefined,
      whatChanged: form.whatChanged || undefined,
      qaTestInstructions: form.qaTestInstructions || undefined,
      expectedResults: form.expectedResults || undefined,
      knownIssues: form.knownIssues || undefined,
      backendChanges: form.backendChanges || undefined,
      validationStatus: form.validationStatus || undefined,
      validatedBy: form.validatedBy || undefined,
      validationDate: form.validationDate || undefined,
      validationNotes: form.validationNotes || undefined,
      releaseNotesStatus: form.releaseNotesStatus || undefined,
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
          {prefill && (
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
              <span style={{ fontSize: "16px" }}>🐱</span>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#065f46" }}>Release Details Imported from Ask Buddy</div>
                <div style={{ fontSize: "11px", color: "#047857", marginTop: "2px" }}>
                  {prefill.screens.length} screen(s) identified · Review and confirm all fields before saving
                </div>
              </div>
            </div>
          )}
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
            <label style={labelStyle}>Platform *</label>
            <select style={fieldStyle} value={form.platform} onChange={e => set("platform", e.target.value)}>
              {["PDC","TDC","Platform","Both"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Type *</label>
            <select style={fieldStyle} value={form.type} onChange={e => set("type", e.target.value)}>
              <option value="">— Select Type —</option>
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
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Release Notes</div>
        <div>
          <label style={labelStyle}>Release Notes Bullets</label>
          <textarea
            style={{ ...fieldStyle, minHeight: "100px", resize: "vertical" }}
            value={form.releaseNotesBullets}
            onChange={e => set("releaseNotesBullets", e.target.value)}
            placeholder={"Enter one bullet per line, e.g.:\nKnown Mappings Lookup now returns stable identifiers\nJurisdiction-aware derivation logic added\nBug 1401152 resolved"}
          />
          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>One item per line. Used in the wiki entry Release Notes section.</div>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "2px solid #7c3aed", paddingTop: "12px" }}>QA Release Documentation</div>
        <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>Capture screen-by-screen changes, testing instructions, and validation status for the QA release notes.</div>
        <div>
          <label style={labelStyle}>Screen Updated</label>
          <input style={fieldStyle} value={(form as any).screenUpdated ?? ""} onChange={e => set("screenUpdated" as any, e.target.value)} placeholder="e.g. Roger Dashboard, Trial Balance Grid, No UI / Backend Change" />
          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>Enter the screen(s) affected. Use commas for multiple screens, or "No UI / Backend Change" for API-only changes.</div>
        </div>
        <div>
          <label style={labelStyle}>What Changed (Overall Summary)</label>
          <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={form.whatChanged ?? ""} onChange={e => set("whatChanged", e.target.value)} placeholder="High-level summary of what changed in this deployment..." />
        </div>
        <div>
          <label style={labelStyle}>What QA Should Test</label>
          <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={form.qaTestInstructions ?? ""} onChange={e => set("qaTestInstructions", e.target.value)} placeholder="Overall testing instructions for QA team..." />
        </div>
        <div>
          <label style={labelStyle}>Expected Results</label>
          <textarea style={{ ...fieldStyle, minHeight: "60px", resize: "vertical" }} value={form.expectedResults ?? ""} onChange={e => set("expectedResults", e.target.value)} placeholder="Expected behavior after this deployment..." />
        </div>
        <div>
          <label style={labelStyle}>Known Issues / Limitations</label>
          <textarea style={{ ...fieldStyle, minHeight: "60px", resize: "vertical" }} value={form.knownIssues ?? ""} onChange={e => set("knownIssues", e.target.value)} placeholder="Any known issues or limitations in this release..." />
        </div>
        <div>
          <label style={labelStyle}>Backend / API Changes</label>
          <textarea style={{ ...fieldStyle, minHeight: "60px", resize: "vertical" }} value={form.backendChanges ?? ""} onChange={e => set("backendChanges", e.target.value)} placeholder="Describe any backend or API changes..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>QA Sign-Off Status <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 400 }}>(Has QA confirmed this deployment?)</span></label>
            <select style={fieldStyle} value={form.validationStatus ?? "Pending"} onChange={e => set("validationStatus", e.target.value)}>
              {["Pending", "In Progress", "Complete", "Blocked"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Release Notes Status</label>
            <select style={fieldStyle} value={form.releaseNotesStatus ?? "Draft"} onChange={e => set("releaseNotesStatus", e.target.value)}>
              {["Draft", "Pending Validation", "Ready", "Published"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Validated By</label>
            <input style={fieldStyle} value={form.validatedBy ?? ""} onChange={e => set("validatedBy", e.target.value)} placeholder="e.g. Mohan / Ichhwak" />
          </div>
          <div>
            <label style={labelStyle}>Validation Date</label>
            <input type="date" style={fieldStyle} value={form.validationDate ?? ""} onChange={e => set("validationDate", e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Validation Notes</label>
          <textarea style={{ ...fieldStyle, minHeight: "60px", resize: "vertical" }} value={form.validationNotes ?? ""} onChange={e => set("validationNotes", e.target.value)} placeholder="Notes from validation testing..." />
        </div>
        <div>
          <label style={labelStyle}>Screen-by-Screen Changes (JSON)</label>
          <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical", fontFamily: "monospace", fontSize: "11px" }} value={form.screenChanges ?? ""} onChange={e => set("screenChanges", e.target.value)} placeholder={'[{"name":"Screen Name","whatChanged":"...","qaTestInstructions":"...","expectedResult":"...","knownIssues":"","qaAvailability":"Available"}]'} />
          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>Optional: JSON array of screen entries. Each entry: name, whatChanged, qaTestInstructions, expectedResult, knownIssues, qaAvailability.</div>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>ADO Links (Optional)</div>
        <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>Add one row per Feature or Story ADO link. Each row has a type, a short label, and the full ADO URL.</div>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 28px", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Type</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Label</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>ADO URL</div>
          <div />
        </div>
        <AdoLinksEditor links={adoLinks} onChange={setAdoLinks} />
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Other Integration Fields (Optional)</div>
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
            Discard &amp; Close
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Edit form ---------------------------------------------------------------
function EditDeploymentForm({ dep, onClose, onSaved }: { dep: DeploymentRow; onClose: () => void; onSaved: () => void }) {
  const updateMutation = trpc.qaDeploymentRegistry.update.useMutation({
    onSuccess: () => { onSaved(); onClose(); },
  });

  const [form, setForm] = useState({
    releaseName: dep.releaseName,
    deploymentDate: dep.deploymentDate,
    deploymentOwner: dep.deploymentOwner,
    productOwner: dep.productOwner,
    platform: dep.platform as PlatformValue,
    type: dep.type as TypeValue,
    status: dep.status as DeploymentStatus,
    summary: dep.summary ?? "",
    releaseNotesUrl: dep.releaseNotesUrl ?? "",
    swaggerUrl: dep.swaggerUrl ?? "",
    relatedBatch: dep.relatedBatch ?? "",
    relatedFeature: dep.relatedFeature ?? "",
    relatedStory: dep.relatedStory ?? "",
    environment: dep.environment,
    adoWorkItemId: dep.adoWorkItemId ?? "",
    adoFeatureUrl: dep.adoFeatureUrl ?? "",
    adoStoryUrl: dep.adoStoryUrl ?? "",
    releaseNotesBullets: dep.releaseNotesBullets ?? "",
    githubReleaseTag: dep.githubReleaseTag ?? "",
  });
  const [adoLinks, setAdoLinks] = useState<AdoLinkEntry[]>(() => parseAdoLinks(dep.adoLinks));

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: dep.id,
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
      environment: form.environment || "Production",
      adoWorkItemId: form.adoWorkItemId || undefined,
      adoFeatureUrl: form.adoFeatureUrl || undefined,
      adoStoryUrl: form.adoStoryUrl || undefined,
      adoLinks: adoLinks.length > 0 ? JSON.stringify(adoLinks) : undefined,
      releaseNotesBullets: form.releaseNotesBullets || undefined,
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
      boxShadow: "-4px 0 24px rgba(0,0,0,0.12)", zIndex: 60,
      overflowY: "auto", display: "flex", flexDirection: "column",
    }}>
      <div style={{ backgroundColor: "#1e3a5f", padding: "20px 24px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Pencil size={14} color="#60a5fa" />
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Edit Deployment</div>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{dep.deploymentId}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Release Name *</label>
          <input required style={fieldStyle} value={form.releaseName} onChange={e => set("releaseName", e.target.value)} />
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
            <input required style={fieldStyle} value={form.deploymentOwner} onChange={e => set("deploymentOwner", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Product Owner *</label>
            <input required style={fieldStyle} value={form.productOwner} onChange={e => set("productOwner", e.target.value)} />
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
          <textarea style={{ ...fieldStyle, minHeight: "80px", resize: "vertical" }} value={form.summary} onChange={e => set("summary", e.target.value)} />
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Relationships</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label style={labelStyle}>Related Batch</label>
            <input style={fieldStyle} value={form.relatedBatch} onChange={e => set("relatedBatch", e.target.value)} placeholder="e.g. B10" />
          </div>
          <div>
            <label style={labelStyle}>Related Feature</label>
            <input style={fieldStyle} value={form.relatedFeature} onChange={e => set("relatedFeature", e.target.value)} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Related Story / Bug</label>
          <input style={fieldStyle} value={form.relatedStory} onChange={e => set("relatedStory", e.target.value)} />
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Release Notes</div>
        <div>
          <label style={labelStyle}>Release Notes Bullets</label>
          <textarea
            style={{ ...fieldStyle, minHeight: "100px", resize: "vertical" }}
            value={form.releaseNotesBullets}
            onChange={e => set("releaseNotesBullets", e.target.value)}
            placeholder={"One item per line, e.g.:\nKnown Mappings Lookup now returns stable identifiers\nBug 1401152 resolved"}
          />
          <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>One item per line. Used in the wiki entry Release Notes section.</div>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>ADO Links</div>
        <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>Add one row per Feature or Story ADO link. Each row has a type, a short label, and the full ADO URL.</div>
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr 28px", gap: "6px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Type</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Label</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>ADO URL</div>
          <div />
        </div>
        <AdoLinksEditor links={adoLinks} onChange={setAdoLinks} />
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>Other Integration Fields</div>
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
        {updateMutation.isError && (
          <div style={{ fontSize: "12px", color: "#dc2626", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "8px 12px" }}>
            Save failed. Please try again.
          </div>
        )}
        <div style={{ display: "flex", gap: "10px", paddingTop: "8px", borderTop: "1px solid #e2e8f0", marginTop: "auto" }}>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            style={{
              flex: 1, padding: "9px 16px", backgroundColor: "#1e3a5f", color: "#ffffff",
              border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700,
              cursor: updateMutation.isPending ? "not-allowed" : "pointer",
              opacity: updateMutation.isPending ? 0.7 : 1,
            }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={onClose} style={{ padding: "9px 16px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Main page ----------------------------------------------------------------
export default function QADeploymentRegistry() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeploymentType>("All");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("All");
  const [sortBy, setSortBy] = useState<SortBy>("deploymentDate");
  const [selectedDep, setSelectedDep] = useState<DeploymentRow | null>(null);
  const [editDep, setEditDep] = useState<DeploymentRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showBuddy, setShowBuddy] = useState(true);
  const [buddyPrefill, setBuddyPrefill] = useState<AnalyzedRelease | null>(null);
  // Draft form state lifted to page level so it survives panel open/close
  const [draftForm, setDraftForm] = useState<Record<string, string> | null>(null);
  const [draftAdoLinks, setDraftAdoLinks] = useState<AdoLinkEntry[]>([]);
  const [showWikiModal, setShowWikiModal] = useState(false);
  const [showReleaseNotesPreview, setShowReleaseNotesPreview] = useState(false);
  const [wikiCopied, setWikiCopied] = useState(false);
  const [justCreated, setJustCreated] = useState<{ releaseName: string; deploymentId: string; deploymentDate: string; deploymentOwner: string; productOwner: string; poEmail?: string; ccEmail?: string; platform: string; type: string; status: string; environment: string; summary?: string | null; relatedBatch?: string | null; relatedFeature?: string | null; adoWorkItemId?: string | null } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Open Create form after buddyPrefill state is committed (avoids React batching timing issue)
  useEffect(() => {
    if (buddyPrefill) {
      setShowCreate(true);
    }
  }, [buddyPrefill]);

  const deleteMutation = trpc.qaDeploymentRegistry.delete.useMutation({
    onSuccess: () => {
      utils.qaDeploymentRegistry.list.invalidate();
      utils.qaDeploymentRegistry.summary.invalidate();
      setConfirmDeleteId(null);
      setSelectedDep(null);
    },
  });
  const { data: summaryData } = trpc.qaDeploymentRegistry.summary.useQuery();
  const { data: rows = [], isLoading } = trpc.qaDeploymentRegistry.list.useQuery({
    search: search || undefined,
    type: typeFilter === "All" ? undefined : typeFilter,
    platform: platformFilter === "All" ? undefined : platformFilter,
    sortBy,
  });

  // Auto-generate full wiki page whenever rows data changes
  const wikiMarkdown = useMemo(() => {
    const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
    const sorted = [...rows].sort((a, b) => b.deploymentDate.localeCompare(a.deploymentDate));

    const totalDeployments = sorted.length;
    const productionCount = sorted.filter(r => r.status === "Deployed").length;
    const pdcCount = sorted.filter(r => r.platform === "PDC").length;
    const tdcCount = sorted.filter(r => r.platform === "TDC").length;
    const rollbackCount = sorted.filter(r => r.status === "Rolled Back").length;
    const dates = sorted.map(r => r.deploymentDate).filter(Boolean);
    const dateRange = dates.length > 0 ? `${dates[dates.length - 1]} — ${dates[0]}` : "—";

    const lines: string[] = [];

    // ── Header ──────────────────────────────────────────────────────────────────
    lines.push(`# DCT Platform — Deployment Registry`);
    lines.push(``);
    lines.push(`**Organization:** RSM US LLP — CATT (Center for Advanced Tax Technology)`);
    lines.push(`**Platform:** DCT Gate Verification Dashboard`);
    lines.push(`**Document Type:** Deployment Registry Wiki`);
    lines.push(`**Last Updated:** ${today}`);
    lines.push(`**Maintained By:** CATT Sr. Business Analyst — DCT Platform Delivery`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // ── Overview ────────────────────────────────────────────────────────────────
    lines.push(`## Overview`);
    lines.push(``);
    lines.push(`The DCT Platform Deployment Registry is the authoritative record of all production deployments across the PDC (Phoenix Data Consolidation), TDC (Tax Data Consolidation), and Platform layers of the DCT architecture. Each entry captures the release name, deployment date, type, platform ownership, deployment owner, product owner, status, summary, and release notes reference.`);
    lines.push(``);
    lines.push(`This registry supports delivery governance, audit traceability, and PI readiness reporting. All deployments are governed by the DCT Batch Delivery Model and must satisfy the applicable gate exit conditions (G1 Schema Lock, G2 Invariant Lock, G3 Contract Publication, G4 Lineage Closure) before being recorded as Deployed.`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // ── Summary KPI table ───────────────────────────────────────────────────────
    lines.push(`## Deployment Summary`);
    lines.push(``);
    lines.push(`| Metric | Value |`);
    lines.push(`|---|---|`);
    lines.push(`| Total Deployments | ${totalDeployments} |`);
    lines.push(`| Deployed to Production | ${productionCount} |`);
    lines.push(`| PDC Deployments | ${pdcCount} |`);
    lines.push(`| TDC Deployments | ${tdcCount} |`);
    lines.push(`| Rollback Candidates | ${rollbackCount} |`);
    lines.push(`| Date Range | ${dateRange} |`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // ── Deployment Registry Table ────────────────────────────────────────────────
    lines.push(`## Deployment Registry Table`);
    lines.push(``);
    lines.push(`| # | Deployment Date | Release Name | Type | Platform | Deployment Owner | Product Owner | Status | Summary | Release Notes |`);
    lines.push(`|---|---|---|---|---|---|---|---|---|---|`);

    sorted.forEach((r, idx) => {
      // Sanitize a string for safe use inside a markdown table cell:
      // replace pipes, newlines, carriage returns, and truncate
      const sanitizeCell = (s: string, maxLen = 120) =>
        s.replace(/[|\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLen);

      const rawSummary = r.releaseNotesBullets
        ? r.releaseNotesBullets.split("\n").filter(Boolean).join("; ")
        : (r.summary ?? "");
      const summaryCell = sanitizeCell(rawSummary, 120);

      // Build release notes hyperlink: prefer releaseNotesUrl, then swaggerUrl, then adoFeatureUrl, then adoStoryUrl
      // Wrap URL in angle brackets so ADO wiki treats the whole URL as a single token
      let notesCell = "—";
      const notesUrl = r.releaseNotesUrl ?? r.swaggerUrl ?? r.adoFeatureUrl ?? r.adoStoryUrl ?? null;
      if (notesUrl) {
        const label = r.swaggerUrl && !r.releaseNotesUrl ? "Swagger" : "Release Notes";
        notesCell = `[${label}](<${notesUrl}>)`;
      }

      const releaseName = sanitizeCell(r.releaseName, 200);
      lines.push(`| ${idx + 1} | ${r.deploymentDate} | ${releaseName} | ${r.type} | ${r.platform} | ${r.deploymentOwner} | ${r.productOwner} | ${r.status} | ${summaryCell} | ${notesCell} |`);
    });

    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // ── Governance Notes ─────────────────────────────────────────────────────────
    lines.push(`## Governance Notes`);
    lines.push(``);
    lines.push(`All deployments recorded in this registry have been executed against the DCT Platform's governed delivery model. The following governance principles apply to all entries.`);
    lines.push(``);
    lines.push(`**PDC Authority:** PDC (Phoenix Data Consolidation) is the canonical financial data authority. PDC deployments must not introduce tax logic, classification inference, or TDC-owned domain behavior.`);
    lines.push(``);
    lines.push(`**TDC Authority:** TDC (Tax Data Consolidation) is the tax domain authority. TDC deployments govern tax mapping proposals, practitioner review decisions, adjustment lifecycle management, and tax rule evaluation.`);
    lines.push(``);
    lines.push(`**Roger Read-Only:** Roger UI is a read-only consumer. No deployment may introduce write capabilities to the Roger layer. Roger never writes to PDC or TDC.`);
    lines.push(``);
    lines.push(`**AI Governance:** The AI Orchestrator is stateless compute. AI deployments must not introduce system-of-record behavior, persistent state, or direct tax decision authority. AI assists; humans decide.`);
    lines.push(``);
    lines.push(`**Gate Compliance:** All production deployments must satisfy the applicable gate exit conditions before being recorded as Deployed. Deployments that have not cleared their gate requirements must be recorded as Planned, Scheduled, or In Progress.`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);

    // ── Reference Links ──────────────────────────────────────────────────────────
    lines.push(`## Reference Links`);
    lines.push(``);
    lines.push(`| Resource | Link |`);
    lines.push(`|---|---|`);
    lines.push(`| DCT Platform Gate Verification Dashboard | Internal — CATT Platform |`);
    lines.push(`| DCT Batch Roadmap v4.0 | SharePoint — Project Documentation |`);
    lines.push(`| ADO Feature Board | Azure DevOps — CATT Backlog |`);
    lines.push(`| Swagger — PDC API (QA) | [qa-pdc.api.rsmus.com/swagger](https://qa-pdc.api.rsmus.com/swagger/index.html) |`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
    lines.push(`*This wiki page is maintained by the CATT Sr. Business Analyst — DCT Platform Delivery. For questions or updates, contact Jenniver.Stafford@rsmus.com.*`);

    return lines.join("\n");
  }, [rows]);

  const handleCopyWiki = () => {
    navigator.clipboard.writeText(wikiMarkdown).then(() => {
      setWikiCopied(true);
      setTimeout(() => setWikiCopied(false), 2500);
    });
  };

  const handleCreated = () => {
    utils.deploymentRegistry.list.invalidate();
    utils.deploymentRegistry.summary.invalidate();
  };

  const handleSaved = () => {
    utils.deploymentRegistry.list.invalidate();
    utils.deploymentRegistry.summary.invalidate();
    // Refresh selectedDep if it was the one being edited
    setSelectedDep(null);
  };

  const summary = summaryData ?? { total: 0, roger: 0, pdc: 0, tdc: 0, rollbackCandidates: 0 };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      {/* -- About This Section panel -- */}
      {/* Context panel hidden per user request */}
      {/* -- Page header -- */}
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
                QA Release Notes &amp; Deployment Registry
              </h1>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Prepare QA release notes with Ask Buddy, then create and track deployment records in one place
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

      {/* -- Summary cards -- */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <SummaryCard label="Total Deployments"     value={summary.total}              color="#0f1623" icon={<Rocket size={14} />} />
        <SummaryCard label="Roger Deployments"     value={summary.roger}         color="#059669" icon={<CheckCircle2 size={14} />} />
        <SummaryCard label="PDC Deployments"       value={summary.pdc}                color="#1e40af" icon={<Layers size={14} />} />
        <SummaryCard label="TDC Deployments"       value={summary.tdc}                color="#059669" icon={<Activity size={14} />} />
        <SummaryCard label="Open Rollback Candidates" value={summary.rollbackCandidates} color="#dc2626" icon={<RotateCcw size={14} />} />
      </div>

      {/* -- Ask Buddy Inline Panel -- */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", padding: "10px 14px", backgroundColor: "#0f1623", borderRadius: showBuddy ? "8px 8px 0 0" : "8px", color: "white" }}
          onClick={() => setShowBuddy(b => !b)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🐱</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700 }}>Ask Buddy — Prepare QA Release Notes</div>
              <div style={{ fontSize: "11px", color: "#94a3b8" }}>Paste or upload DEV/QA notes to generate structured release notes, then create a deployment record</div>
            </div>
          </div>
          <span style={{ fontSize: "12px", color: "#94a3b8" }}>{showBuddy ? "▲ Collapse" : "▼ Expand"}</span>
        </div>
        {showBuddy && (
          <div style={{ border: "1px solid #0f1623", borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
            <QABuddyPanel
              inline
              onApprove={(release: AnalyzedRelease) => {
                setBuddyPrefill(release);
              }}
            />
          </div>
        )}
      </div>
      {/* -- Search, filters, create -- */}
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


        {/* Generate Wiki button */}
        <button
          onClick={() => setShowWikiModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", backgroundColor: "#065f46", color: "#ffffff",
            border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap", marginLeft: "auto",
          }}
          title="Generate wiki markdown table for all deployments"
        >
          <FileText size={12} />Generate Wiki
        </button>
        {/* Preview Release Notes button */}
        <button
          onClick={() => setShowReleaseNotesPreview(true)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "6px 14px", backgroundColor: "#7c3aed", color: "#ffffff",
            border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
          }}
          title="Preview release notes from deployment records"
        >
          <Eye size={12} />Preview Release Notes
        </button>
                {/* Delete button */}
        {selectedDep && (
          confirmDeleteId === selectedDep.id ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: 600 }}>Delete?</span>
              <button onClick={() => deleteMutation.mutate({ id: selectedDep.id })} style={{ padding: "6px 12px", backgroundColor: "#dc2626", color: "white", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>Confirm</button>
              <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "6px 12px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "11px", cursor: "pointer" }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeleteId(selectedDep.id)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "11px", fontWeight: 700, cursor: "pointer" }}>
              <Trash2 size={12} /> Delete
            </button>
          )
        )}
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

      {/* -- Table -- */}
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


            {/* -- Release Notes Preview Modal -- */}
      {showReleaseNotesPreview && (
        <>
          <div onClick={() => setShowReleaseNotesPreview(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "820px", maxWidth: "95vw", backgroundColor: "#ffffff", borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", zIndex: 50, overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "85vh",
          }}>
            <div style={{ backgroundColor: "#7c3aed", padding: "20px 24px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>QA Release Notes Preview</div>
                  <div style={{ fontSize: "11px", color: "#e9d5ff", marginTop: "2px" }}>Generated from deployment records — {rows.length} deployment{rows.length !== 1 ? "s" : ""}</div>
                </div>
                <button onClick={() => setShowReleaseNotesPreview(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e9d5ff" }}><X size={18} /></button>
              </div>
            </div>
            <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
              {rows.filter(r => r.whatChanged || r.qaTestInstructions || r.screenChanges).length === 0 ? (
                <div style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
                  <div style={{ fontSize: "14px", marginBottom: "8px" }}>No release documentation yet</div>
                  <div style={{ fontSize: "12px" }}>Add What Changed, QA Test Instructions, or Screen Changes to your deployment records to generate release notes.</div>
                </div>
              ) : rows.filter(r => r.whatChanged || r.qaTestInstructions || r.screenChanges).map(dep => (
                <div key={dep.id} style={{ marginBottom: "32px", borderBottom: "1px solid #e2e8f0", paddingBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623" }}>{dep.releaseName}</div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", backgroundColor: "#f5f3ff", borderRadius: "4px", padding: "2px 6px" }}>{dep.deploymentId}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", backgroundColor: "#f8fafc", borderRadius: "4px", padding: "2px 6px" }}>{dep.deploymentDate}</span>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: dep.releaseNotesStatus === "Published" ? "#059669" : dep.releaseNotesStatus === "Ready" ? "#2563eb" : dep.releaseNotesStatus === "Pending Validation" ? "#d97706" : "#94a3b8", backgroundColor: dep.releaseNotesStatus === "Published" ? "#f0fdf4" : dep.releaseNotesStatus === "Ready" ? "#eff6ff" : dep.releaseNotesStatus === "Pending Validation" ? "#fffbeb" : "#f8fafc", borderRadius: "4px", padding: "2px 6px" }}>{dep.releaseNotesStatus ?? "Draft"}</span>
                  </div>
                  {dep.whatChanged && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>What Changed</div>
                      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6", backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 12px" }}>{dep.whatChanged}</div>
                    </div>
                  )}
                  {dep.qaTestInstructions && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>What QA Should Test</div>
                      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6", backgroundColor: "#f0f9ff", borderRadius: "6px", padding: "10px 12px", border: "1px solid #bae6fd" }}>{dep.qaTestInstructions}</div>
                    </div>
                  )}
                  {dep.expectedResults && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Expected Results</div>
                      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6", backgroundColor: "#f0fdf4", borderRadius: "6px", padding: "10px 12px", border: "1px solid #bbf7d0" }}>{dep.expectedResults}</div>
                    </div>
                  )}
                  {dep.knownIssues && (
                    <div style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Known Issues / Limitations</div>
                      <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.6", backgroundColor: "#fef2f2", borderRadius: "6px", padding: "10px 12px", border: "1px solid #fecaca" }}>{dep.knownIssues}</div>
                    </div>
                  )}
                  {dep.screenChanges && (() => {
                    try {
                      const screens = JSON.parse(dep.screenChanges) as Array<{name: string; whatChanged?: string; qaTestInstructions?: string; expectedResult?: string; knownIssues?: string; qaAvailability?: string}>;
                      if (screens.length === 0) return null;
                      return (
                        <div style={{ marginBottom: "12px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Screen-by-Screen Changes</div>
                          {screens.map((s, i) => (
                            <div key={i} style={{ marginBottom: "12px", border: "1px solid #e2e8f0", borderRadius: "6px", overflow: "hidden" }}>
                              <div style={{ backgroundColor: "#0f1623", padding: "8px 12px", fontSize: "12px", fontWeight: 700, color: "#ffffff" }}>{s.name}</div>
                              <div style={{ padding: "12px" }}>
                                {s.whatChanged && <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>What Changed: </span><span style={{ fontSize: "12px", color: "#1e293b" }}>{s.whatChanged}</span></div>}
                                {s.qaTestInstructions && <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>QA Test: </span><span style={{ fontSize: "12px", color: "#1e293b" }}>{s.qaTestInstructions}</span></div>}
                                {s.expectedResult && <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Expected: </span><span style={{ fontSize: "12px", color: "#059669" }}>{s.expectedResult}</span></div>}
                                {s.knownIssues && <div style={{ marginBottom: "8px" }}><span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Known Issues: </span><span style={{ fontSize: "12px", color: "#dc2626" }}>{s.knownIssues}</span></div>}
                                {s.qaAvailability && <div><span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>QA Availability: </span><span style={{ fontSize: "12px", fontWeight: 700, color: s.qaAvailability === "Available" ? "#059669" : s.qaAvailability === "Not Available" ? "#dc2626" : "#d97706" }}>{s.qaAvailability}</span></div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } catch { return null; }
                  })()}
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>Validation: <strong>{dep.validationStatus ?? "Pending"}</strong></span>
                    {dep.validatedBy && <span style={{ fontSize: "10px", color: "#64748b" }}>· By: <strong>{dep.validatedBy}</strong></span>}
                    {dep.validationDate && <span style={{ fontSize: "10px", color: "#64748b" }}>· Date: <strong>{dep.validationDate}</strong></span>}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "10px", flexShrink: 0 }}>
              <button
                onClick={() => {
                  const lines: string[] = ["# QA Release Notes", "", `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, ""];
                  rows.filter(r => r.whatChanged || r.qaTestInstructions || r.screenChanges).forEach(dep => {
                    lines.push(`## ${dep.releaseName}`);
                    lines.push(`**Deployment ID:** ${dep.deploymentId} | **Date:** ${dep.deploymentDate} | **Status:** ${dep.releaseNotesStatus ?? "Draft"}`);
                    if (dep.whatChanged) { lines.push(""); lines.push("### What Changed"); lines.push(dep.whatChanged); }
                    if (dep.qaTestInstructions) { lines.push(""); lines.push("### What QA Should Test"); lines.push(dep.qaTestInstructions); }
                    if (dep.expectedResults) { lines.push(""); lines.push("### Expected Results"); lines.push(dep.expectedResults); }
                    if (dep.knownIssues) { lines.push(""); lines.push("### Known Issues"); lines.push(dep.knownIssues); }
                    lines.push(""); lines.push("---"); lines.push("");
                  });
                  navigator.clipboard.writeText(lines.join("\n"));
                }}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#7c3aed", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
              >
                <Copy size={14} /> Copy Release Notes Markdown
              </button>
              <button onClick={() => setShowReleaseNotesPreview(false)} style={{ padding: "10px 16px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* -- Generate Wiki Modal -- */}
      {showWikiModal && (
        <>
          <div onClick={() => setShowWikiModal(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 40 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            width: "760px", maxWidth: "95vw", backgroundColor: "#ffffff", borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)", zIndex: 50, overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "85vh",
          }}>
            {/* Header */}
            <div style={{ backgroundColor: "#065f46", padding: "20px 24px", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#059669", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FileText size={16} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>Generate Wiki Page</div>
                  <div style={{ fontSize: "11px", color: "#a7f3d0", marginTop: "2px" }}>{rows.length} deployment{rows.length !== 1 ? "s" : ""} — header, overview, summary, registry table, governance notes, and reference links</div>
                </div>
                <button onClick={() => setShowWikiModal(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#a7f3d0" }}><X size={18} /></button>
              </div>
            </div>
            {/* Instructions */}
            <div style={{ padding: "10px 24px", backgroundColor: "#f0fdf4", borderBottom: "1px solid #bbf7d0", flexShrink: 0 }}>
              <div style={{ fontSize: "12px", color: "#065f46", lineHeight: "1.6" }}>
                <strong>How to use:</strong> Click <em>Copy All Markdown</em> below, then open your ADO wiki page, click Edit, select all existing content, and paste. The page includes the header block, overview, a summary KPI table, the full deployment registry table with hyperlinked release notes, governance notes, and reference links — all {rows.length} deployments sorted newest first.
              </div>
            </div>
            {/* Markdown preview */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              <pre style={{
                backgroundColor: "#0f1623", color: "#e2e8f0",
                borderRadius: "8px", padding: "16px", fontSize: "10px",
                lineHeight: "1.6", whiteSpace: "pre-wrap", wordBreak: "break-word",
                margin: 0, minHeight: "120px",
              }}>{wikiMarkdown}</pre>
            </div>
            {/* Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", flexShrink: 0, display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={handleCopyWiki}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "11px 20px",
                  backgroundColor: wikiCopied ? "#059669" : "#065f46",
                  color: "#ffffff", border: "none", borderRadius: "6px",
                  fontSize: "13px", fontWeight: 700, cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
              >
                <Copy size={14} />{wikiCopied ? "Copied to Clipboard!" : "Copy All Markdown"}
              </button>
              <button
                onClick={() => setShowWikiModal(false)}
                style={{ padding: "11px 20px", backgroundColor: "#f1f5f9", color: "#475569", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}


            {/* -- Detail drawer -- */}
      {selectedDep && (
        <>
          <div
            onClick={() => setSelectedDep(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 40 }}
          />
          <DetailDrawer dep={selectedDep} onClose={() => setSelectedDep(null)} onEdit={(dep) => { setSelectedDep(null); setEditDep(dep); }} />
        </>
      )}

      {/* -- Edit form drawer -- */}
      {editDep && (
        <>
          <div
            onClick={() => setEditDep(null)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 50 }}
          />
          <EditDeploymentForm dep={editDep} onClose={() => setEditDep(null)} onSaved={handleSaved} />
        </>
      )}

      {/* -- Ask Buddy Panel -- */}

      {/* -- Create form drawer -- */}
      {showCreate && (
        <>
          <div
            onClick={() => {/* backdrop does not close — use X or Discard & Close */}}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 40 }}
          />
          <CreateDeploymentForm
            key={buddyPrefill ? `prefill-${buddyPrefill.releaseName}` : "empty"}
            onClose={() => { setShowCreate(false); setBuddyPrefill(null); setDraftForm(null); setDraftAdoLinks([]); }}
            onCreated={(dep) => { handleCreated(); setShowCreate(false); setJustCreated(dep); setBuddyPrefill(null); setDraftForm(null); setDraftAdoLinks([]); }}
            prefill={buddyPrefill}
            draftForm={draftForm}
            draftAdoLinks={draftAdoLinks}
            onDraftChange={setDraftForm}
            onDraftAdoChange={setDraftAdoLinks}
          />
        </>
      )}
    </div>
  );
}
