import { useState, type CSSProperties } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCopy, ExternalLink, FileText, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { TDC_SPRINT_CLOSEOUT_WORKFLOW } from "@/lib/tdcSprintCloseoutWorkflow";
import SprintCloseoutUploads from "@/components/SprintCloseoutUploads";

// RSM-style navy / green, consistent with Meeting Recaps. App owns the shell.
const palette = {
  navy: "#0f172a",
  navyAccent: "#1e3a5f",
  green: "#047857",
  teal: "#0f766e",
  greenTint: "#ecfdf5",
  blue: "#1d4ed8",
  white: "#ffffff",
  gray: "#f8fafc",
  border: "#e2e8f0",
  text: "#475569",
  muted: "#64748b",
};
const cardStyle: CSSProperties = {
  background: palette.white,
  border: `1px solid ${palette.border}`,
  borderRadius: "10px",
  boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  padding: "16px 18px",
};
const labelStyle: CSSProperties = {
  color: palette.teal,
  fontSize: "10px",
  fontWeight: 850,
  letterSpacing: "0.09em",
  textTransform: "uppercase",
};
const titleStyle: CSSProperties = {
  color: palette.navy,
  fontSize: "16px",
  fontWeight: 900,
  margin: "4px 0 12px",
};
const sourceRequirements = [
  {
    title: "Current PI / sprint and closeout basis",
    detail: "Confirm the current and comparison periods, and whether results are confirmed or projected. Identify any explicitly approved projected closures.",
  },
  {
    title: "Current metrics and ADO reporting parents",
    detail: "Provide totals, completed / closed and carryover counts, plus ADO IDs, titles, statuses and delivery categories. Identify reporting parents so excluded child items are not counted twice.",
  },
  {
    title: "Previous closeout and registry cutoff",
    detail: "Provide the previous approved metrics and deployment cumulative count / reporting cutoff, plus current cutoff evidence for new entries, dates, numbering and duplicate checks.",
  },
  {
    title: "Five approved Sprint 5 PNG templates",
    detail: "Supply all five original approved graphics. Sprint 5 is the visual reference only, not an assumed current or comparison sprint.",
  },
  {
    title: "Executive burndown — all five teams",
    detail: "TDC, State, Provision, NV POD 1 and NV POD 2: current and previous scope completion, average burndown, remaining work and scope increase for validated comparisons and tied rankings.",
  },
  {
    title: "Upcoming priorities (optional)",
    detail: "Provide next PI / sprint priorities and release milestones; include the section only when provided. Technical release notes are optional supporting evidence.",
  },
] as const;
const intendedGraphics = [
  "Sprint-over-Sprint Performance Comparison",
  "Sprint Closeout Summary",
  "Sprint Work Item Detail",
  "Executive Burndown Comparison",
  "TDC Deployment Registry",
] as const;

export default function SprintCloseOutSummaryPage() {
  const { data: registrySummary, isLoading, isError } = trpc.postPilotDeploymentRegistry.summary.useQuery();
  const [intakeState, setIntakeState] = useState({ loaded: false, count: 0, categories: [] as string[] });
  function sourceStatus(index: number) {
    if (index === 0) return "Requires reporting-basis confirmation";
    if (!intakeState.loaded) return "Check the uploaded source register";
    const required = [[], ["metrics", "ado"], ["previous-closeout", "deployment-cutoff"], ["template-1", "template-2", "template-3", "template-4", "template-5"], ["burndown"], ["priorities"]][index];
    const received = required.filter(category => intakeState.categories.includes(category)).length;
    if (received === required.length) return "Uploaded — Needs Review";
    if (received) return "Partially uploaded — Needs Review";
    return index === sourceRequirements.length - 1 ? "Requested · Awaiting source" : "Required · Awaiting source";
  }

  async function copyWorkflow() {
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable");
      }
      await navigator.clipboard.writeText(TDC_SPRINT_CLOSEOUT_WORKFLOW);
      toast.success("Master workflow copied.");
    } catch {
      toast.error("Could not copy the workflow. Check clipboard permissions or copy the text from the expanded workflow.");
    }
  }

  return (
    <div style={{ margin: "0 auto", maxWidth: "1340px", padding: "28px 32px 54px" }}>
      <header style={{ borderBottom: `1px solid ${palette.border}`, marginBottom: "20px", paddingBottom: "18px" }}>
        <a href="/post-pilot/meeting-recaps" style={{ alignItems: "center", color: palette.navyAccent, display: "inline-flex", fontSize: "11px", fontWeight: 800, gap: "5px", marginBottom: "12px", textDecoration: "none" }}>
          <ArrowLeft size={13} aria-hidden="true" />Back to Meeting Recaps
        </a>
        <div style={labelStyle}>Pilot · Meeting Recaps · Sprint closeout</div>
        <h1 style={{ color: palette.navy, fontSize: "26px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>Sprint Close Out Summary</h1>
        <p style={{ color: palette.muted, fontSize: "13px", lineHeight: 1.55, margin: "7px 0 0", maxWidth: "830px" }}>
          Evidence-bound TDC executive reporting, using the approved closeout workflow and Sprint 5 visual templates. No current PI, sprint or comparison baseline has been selected.
        </p>
      </header>

      <SprintCloseoutUploads onIntakeState={setIntakeState} />

      <section aria-labelledby="closeout-readiness" style={{ ...cardStyle, background: palette.gray, borderLeft: `4px solid ${palette.navyAccent}`, marginBottom: "16px" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between" }}>
          <div>
            <div style={{ ...labelStyle, color: palette.navyAccent }}>Package readiness</div>
            <h2 id="closeout-readiness" style={{ ...titleStyle, marginBottom: "6px" }}>{intakeState.count ? "Sources uploaded — validation pending" : "Waiting for source files"}</h2>
            <p style={{ color: palette.text, fontSize: "12px", lineHeight: 1.55, margin: 0, maxWidth: "790px" }}>
              {intakeState.count ? `${intakeState.count} source file(s) retained for the selected closeout. Uploaded evidence has not yet been validated or approved.` : "Select a closeout and upload metrics, ADO detail, burndown evidence, original PNG templates and previous deployment cutoff evidence using the controls above."}
            </p>
          </div>
          <span style={{ alignItems: "center", background: palette.greenTint, border: "1px solid #a7f3d0", borderRadius: "999px", color: palette.green, display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "5px", padding: "6px 9px" }}>
            <CheckCircle2 size={13} aria-hidden="true" />Master workflow · Received
          </span>
        </div>
        <p style={{ color: palette.muted, fontSize: "11px", lineHeight: 1.5, margin: "11px 0 0" }}>
          No final email or PNGs will be produced until counts reconcile, cross-sprint / cross-team comparisons are validated, and the approved templates and deployment cutoff are verified. Confirmed and projected results must remain distinct.
        </p>
      </section>

      <div style={{ alignItems: "start", display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))" }}>
        <section aria-labelledby="closeout-required-sources" style={cardStyle}>
          <div style={labelStyle}>Source checklist</div>
          <h2 id="closeout-required-sources" style={titleStyle}>Required closeout evidence</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sourceRequirements.map((source, index) => (
              <li key={source.title} style={{ borderTop: index ? `1px solid ${palette.border}` : undefined, padding: index ? "10px 0" : "0 0 10px" }}>
                <div style={{ alignItems: "baseline", display: "flex", flexWrap: "wrap", gap: "5px 10px", justifyContent: "space-between" }}>
                  <strong style={{ color: palette.navy, fontSize: "12px", fontWeight: 850 }}>{source.title}</strong>
                  <span style={{ color: palette.muted, fontSize: "10px", whiteSpace: "nowrap" }}>{sourceStatus(index)}</span>
                </div>
                <p style={{ color: palette.text, fontSize: "11px", lineHeight: 1.5, margin: "4px 0 0" }}>{source.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <div style={{ display: "grid", gap: "16px" }}>
          <section aria-labelledby="closeout-intended-outputs" style={cardStyle}>
            <div style={labelStyle}>Delivery package · Pending</div>
            <h2 id="closeout-intended-outputs" style={titleStyle}>Five individual high-resolution PNGs</h2>
            <ol style={{ color: palette.navyAccent, margin: 0, paddingLeft: "20px" }}>
              {intendedGraphics.map((name) => (
                <li key={name} style={{ fontSize: "12px", padding: "5px 0" }}>
                  <strong style={{ color: palette.navy, fontWeight: 800 }}>{name}</strong>
                  <div style={{ color: palette.muted, fontSize: "10px", marginTop: "2px" }}>Awaiting validated inputs</div>
                </li>
              ))}
            </ol>
            <p style={{ color: palette.muted, fontSize: "10px", lineHeight: 1.5, margin: "8px 0 0" }}>
              Registry PNG: new-only rows, continuous numbering, columns # / Deployment / Date, green header and alternating light-green / white rows. Cutoff validation is required.
            </p>
            <div style={{ borderTop: `1px solid ${palette.border}`, color: palette.text, fontSize: "11px", lineHeight: 1.6, marginTop: "12px", paddingTop: "10px" }}>
              <div><strong>Outlook-ready executive email:</strong> Pending validated inputs and all five graphics.</div>
              <div><strong>Downloadable HTML email:</strong> Pending the validated email and embedded graphics.</div>
              <p style={{ color: palette.muted, margin: "6px 0 0" }}>No final artifacts or downloads are available yet.</p>
            </div>
          </section>

          <section aria-labelledby="closeout-live-registry" style={{ ...cardStyle, borderTop: `3px solid ${palette.green}` }}>
            <div style={labelStyle}>Read-only reference</div>
            <h2 id="closeout-live-registry" style={titleStyle}>Live TDC registry record count</h2>
            <div aria-live="polite" aria-busy={isLoading} style={{ color: palette.navy, fontSize: "22px", fontWeight: 900, marginBottom: "7px" }}>
              {isLoading ? (
                <span role="status" style={{ color: palette.muted, fontSize: "12px", fontWeight: 700 }}>Loading live registry count…</span>
              ) : isError ? (
                <span role="alert" style={{ color: "#9a3412", fontSize: "12px", fontWeight: 700 }}>Live registry count unavailable. The registry request failed; no count is assumed.</span>
              ) : registrySummary ? (
                registrySummary.total.toLocaleString()
              ) : (
                <span style={{ color: palette.muted, fontSize: "12px", fontWeight: 700 }}>Live registry count unavailable; no count is assumed.</span>
              )}
            </div>
            <p style={{ color: palette.text, fontSize: "11px", lineHeight: 1.55, margin: "0 0 10px" }}>
              This live count is NOT a closeout cutoff or a new-deployment count. It reflects registry records, not validated sprint deployments. The previous cutoff and current closeout evidence must be supplied; no baseline is chosen automatically.
            </p>
            <a href="/post-pilot#post-pilot-deployment-snapshot" style={{ alignItems: "center", color: palette.blue, display: "inline-flex", fontSize: "11px", fontWeight: 800, gap: "5px", textDecoration: "none" }}>
              TDC Deployment Registry – Overview<ExternalLink size={12} aria-hidden="true" />
            </a>
          </section>
        </div>
      </div>

      <section aria-labelledby="closeout-master-workflow" style={{ ...cardStyle, marginTop: "16px" }}>
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between" }}>
          <div>
            <div style={labelStyle}>Retained instructions · Received</div>
            <h2 id="closeout-master-workflow" style={{ ...titleStyle, marginBottom: "5px" }}>Master closeout workflow</h2>
          </div>
          <button type="button" onClick={copyWorkflow} style={{ alignItems: "center", background: palette.navyAccent, border: "none", borderRadius: "6px", color: palette.white, cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "8px 10px" }}>
            <ClipboardCopy size={13} aria-hidden="true" />Copy Workflow
          </button>
        </div>
        <p style={{ color: palette.muted, fontSize: "11px", lineHeight: 1.5, margin: "4px 0 10px" }}>
          Workflow source: pasted_content.txt. Preserved verbatim for subsequent closeouts. Reference instructions only—not an email draft or generated package. Original PNG templates must be uploaded and reviewed separately.
        </p>
        <details style={{ borderTop: `1px solid ${palette.border}`, paddingTop: "10px" }}>
          <summary style={{ alignItems: "center", color: palette.navyAccent, cursor: "pointer", fontSize: "12px", fontWeight: 800 }}>
            <FileText size={13} aria-hidden="true" style={{ display: "inline", marginRight: "6px", verticalAlign: "text-bottom" }} />Read complete master workflow
          </summary>
          <div style={{ background: palette.gray, border: `1px solid ${palette.border}`, borderRadius: "7px", color: palette.text, fontSize: "12px", lineHeight: 1.6, marginTop: "12px", overflowWrap: "anywhere", padding: "16px" }}>
            <Streamdown controls={false}>{TDC_SPRINT_CLOSEOUT_WORKFLOW}</Streamdown>
          </div>
        </details>
      </section>
      <p style={{ alignItems: "center", color: palette.muted, display: "flex", fontSize: "10px", gap: "5px", lineHeight: 1.5, margin: "12px 0 0" }}>
        <LockKeyhole size={12} aria-hidden="true" />Uploaded files are retained for review. Uploading does not validate results, change deployment records, generate final graphics or distribute email.
      </p>
    </div>
  );
}
