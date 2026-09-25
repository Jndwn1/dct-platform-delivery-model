import { useState } from "react";
import StoryReviewAskBuddy from "@/components/StoryReviewAskBuddy";

const C = {
  navy: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  purple: "#7c3aed",
  purpleInk: "#6d28d9",
  purpleSurface: "#faf5ff",
  blue: "#0284c7",
  blueSurface: "#f0f9ff",
  teal: "#0f766e",
  tealSurface: "#f0fdfa",
  green: "#15803d",
  greenSurface: "#f0fdf4",
  amber: "#b45309",
  amberSurface: "#fffbeb",
  red: "#be123c",
  redSurface: "#fff1f2",
};

type CurrentYearStateReview = {
  reviewNumber: number;
  id: string;
  title: string;
  status: "Yellow" | "Yellow/Orange" | "Orange";
  reviewedOn: string;
  reviewFileName: string;
  solid: string;
  gaps: string;
  url: string;
};

const CURRENT_YEAR_STATE_REVIEW_REPORT_URL = "/manus-storage/Current_Year_State_Story_First_Pass_Review_Report_for_Gary_004d26df.md";
const CURRENT_YEAR_STATE_REVIEW_PACKAGE_URL = "/manus-storage/Current_Year_State_Story_Review_Package_for_Gary_5d3a36f5.zip";
const GARY_EMAIL = "Gary.Luca@rsmus.com";
const FIRST_PASS_REVIEW_CYCLE = "PI4 · Batch 2 (9/23–10/6)";
const PUBLIC_REVIEW_ASSET_ORIGIN = "https://dctdash-6z8sjwgc.manus.space";

const CURRENT_YEAR_STATE_REVIEWS: CurrentYearStateReview[] = [
  {
    reviewNumber: 1,
    id: "1494188",
    title: "PDC — Enable Current-Year State Source Documents Without Financial Mappings",
    status: "Yellow",
    reviewedOn: "Sep 24, 2026",
    reviewFileName: "ADO_1494188_PDC_Current_Year_State_Source_Documents_Review.md",
    solid: "Clear exception condition with retained standard controls and audit / reason context.",
    gaps: "Define approved State-processing context, mapping-applicability signal, and PDC status values.",
    url: "/manus-storage/ADO_1494188_PDC_Current_Year_State_Source_Documents_Review_9792f3ed.md",
  },
  {
    reviewNumber: 2,
    id: "1494198",
    title: "PDC — Create and Route Current-Year State Source Submissions for Orchestrator Classification",
    status: "Yellow",
    reviewedOn: "Sep 24, 2026",
    reviewFileName: "ADO_1494198_PDC_Current_Year_State_Submission_Routing_Review.md",
    solid: "Clear Tax Portal, PDC, and Orchestrator ownership split with an explicit source-file boundary.",
    gaps: "Confirm submission envelope, idempotency, failure behavior, and stateFootprintVersion rule.",
    url: "/manus-storage/ADO_1494198_PDC_Current_Year_State_Submission_Routing_Review_e35b8be3.md",
  },
  {
    reviewNumber: 3,
    id: "1494222",
    title: "TDC — Persist and Govern the Orchestrator-Mapped Current-Year State Input Dataset",
    status: "Yellow/Orange",
    reviewedOn: "Sep 24, 2026",
    reviewFileName: "ADO_1494222_TDC_Govern_Current_Year_State_Input_Dataset_Review.md",
    solid: "Strong governance intent for provenance, mapping status, versioning, and source preservation.",
    gaps: "Define dataset identity, lifecycle, status encoding, mapping-target rules, and payment normalization.",
    url: "/manus-storage/ADO_1494222_TDC_Govern_Current_Year_State_Input_Dataset_Review_4bf487fa.md",
  },
  {
    reviewNumber: 4,
    id: "1494339",
    title: "Gateway — Provide the Current-Year State Input Dataset to Roger",
    status: "Yellow",
    reviewedOn: "Sep 24, 2026",
    reviewFileName: "ADO_1494339_Gateway_Current_Year_State_Input_Dataset_to_Roger_Review.md",
    solid: "The read contract, Not Ready concept, and raw-source exclusion are clear at a high level.",
    gaps: "Define endpoint, identifiers, DTO, authorization, response behavior, and Gateway non-calculation boundary.",
    url: "/manus-storage/ADO_1494339_Gateway_Current_Year_State_Input_Dataset_to_Roger_Review_d839808c.md",
  },
  {
    reviewNumber: 5,
    id: "1494344",
    title: "Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions",
    status: "Orange",
    reviewedOn: "Sep 24, 2026",
    reviewFileName: "ADO_1494344_Gateway_TDC_State_Practitioner_Actions_Review.md",
    solid: "Broad practitioner-action coverage with strong audit / lineage intent and source-record preservation.",
    gaps: "Define the action model, request and persistence contracts, versioning, authorization, retry, and retrieval behavior.",
    url: "/manus-storage/ADO_1494344_Gateway_TDC_State_Practitioner_Actions_Review_c1c9320d.md",
  },
];

function FirstPassChip({ status }: { status: CurrentYearStateReview["status"] }) {
  const styles: Record<CurrentYearStateReview["status"], { background: string; border: string; color: string }> = {
    Yellow: { background: C.amberSurface, border: "#fde68a", color: C.amber },
    "Yellow/Orange": { background: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    Orange: { background: C.redSurface, border: "#fecdd3", color: C.red },
  };
  const style = styles[status];
  return <span style={{ background: style.background, border: `1px solid ${style.border}`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "3px 7px", whiteSpace: "nowrap" }}>{status}</span>;
}

function reviewAssetUrl(path: string) {
  return `${PUBLIC_REVIEW_ASSET_ORIGIN}${path}`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character] ?? character);
}

function firstPassEmailStatusStyle(status: CurrentYearStateReview["status"]) {
  const styles: Record<CurrentYearStateReview["status"], { background: string; border: string; color: string }> = {
    Yellow: { background: "#fffbeb", border: "#fde68a", color: C.amber },
    "Yellow/Orange": { background: "#fff7ed", border: "#fdba74", color: "#c2410c" },
    Orange: { background: C.redSurface, border: "#fecdd3", color: C.red },
  };
  return styles[status];
}

function createFirstPassReviewEmail() {
  const subject = "Current-Year State Story First-Pass Review Package";
  const packageUrl = reviewAssetUrl(CURRENT_YEAR_STATE_REVIEW_PACKAGE_URL);
  const reportUrl = reviewAssetUrl(CURRENT_YEAR_STATE_REVIEW_REPORT_URL);
  const reviewLines = CURRENT_YEAR_STATE_REVIEWS.map((review) => {
    const reviewUrl = reviewAssetUrl(review.url);
    return `${review.reviewNumber}. Story ${review.id} | First pass: ${review.reviewedOn}\nReview file: ${reviewUrl}`;
  });
  const plainText = [
    "Gary,",
    "",
    `Below is the current-year State first-pass review package for ${FIRST_PASS_REVIEW_CYCLE}.`,
    "",
    `This email contains only the ${CURRENT_YEAR_STATE_REVIEWS.length} recently completed first-pass reviews (all reviewed Sep 24, 2026). Each live review-file link is listed below.`,
    "",
    "Combined review package:",
    packageUrl,
    "",
    "Consolidated report:",
    reportUrl,
    "",
    "First-pass review files:",
    ...reviewLines,
    "",
    "Priority technical review items: 1494344 (Orange) and 1494222 (Yellow/Orange).",
    "",
    "Please confirm the technical decisions, contract patterns, persistence and lifecycle approach, and any required story split recommendations.",
    "",
    "Thank you,",
    "Jenniver",
  ].join("\n");
  const tableRows = CURRENT_YEAR_STATE_REVIEWS.map((review, index) => {
    const statusStyle = firstPassEmailStatusStyle(review.status);
    const reviewUrl = reviewAssetUrl(review.url);
    return `<tr style="background:${index % 2 ? "#ffffff" : "#f8fafc"};vertical-align:top">
      <td style="border:1px solid #e2e8f0;color:#6d28d9;font-size:11px;font-weight:800;padding:9px;text-align:center">${review.reviewNumber}</td>
      <td style="border:1px solid #e2e8f0;color:#334155;font-size:11px;font-weight:700;padding:9px;white-space:nowrap">${escapeHtml(review.reviewedOn)}</td>
      <td style="border:1px solid #e2e8f0;color:#0f172a;font-size:11px;font-weight:700;line-height:1.45;padding:9px"><strong style="color:#6d28d9">${escapeHtml(review.id)}</strong> — ${escapeHtml(review.title)}</td>
      <td style="border:1px solid #e2e8f0;padding:9px"><span style="background:${statusStyle.background};border:1px solid ${statusStyle.border};border-radius:999px;color:${statusStyle.color};display:inline-block;font-size:10px;font-weight:800;padding:3px 7px;white-space:nowrap">${escapeHtml(review.status)}</span></td>
      <td style="border:1px solid #e2e8f0;color:#334155;font-size:11px;line-height:1.45;padding:9px">${escapeHtml(review.solid)}</td>
      <td style="border:1px solid #e2e8f0;color:#b45309;font-size:11px;line-height:1.45;padding:9px">${escapeHtml(review.gaps)}</td>
      <td style="border:1px solid #e2e8f0;font-size:11px;font-weight:800;padding:9px;white-space:nowrap"><a href="${escapeHtml(reviewUrl)}" style="color:#6d28d9;text-decoration:none">Open review (.md) ↗</a></td>
    </tr>`;
  }).join("");
  const html = `<div style="color:#0f172a;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;max-width:1200px">
    <p>Gary,</p>
    <p>Below is the current-year State first-pass review package for <strong>${escapeHtml(FIRST_PASS_REVIEW_CYCLE)}</strong>. This email contains only the <strong>${CURRENT_YEAR_STATE_REVIEWS.length} recently completed first-pass reviews</strong> (all reviewed Sep 24, 2026).</p>
    <p><a href="${escapeHtml(packageUrl)}" style="color:#6d28d9;font-weight:700">Download the combined review package (.zip)</a> &nbsp;|&nbsp; <a href="${escapeHtml(reportUrl)}" style="color:#6d28d9;font-weight:700">Open the consolidated report (.md)</a></p>
    <p style="color:#475569">Each review-file link in the table opens the story-specific Markdown review. The combined ZIP can also be attached if needed.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;width:100%">
      <thead><tr style="background:#0f172a;color:#ffffff">
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">Review #</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">First-pass review date</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">Story</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">First-pass status</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">What looks solid</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">Main gaps / questions to resolve</th>
        <th style="font-size:9px;letter-spacing:.04em;padding:9px;text-align:left;text-transform:uppercase">Review file</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <p><strong>Priority technical review items:</strong> 1494344 (Orange) and 1494222 (Yellow/Orange).</p>
    <p>Please confirm the technical decisions, contract patterns, persistence and lifecycle approach, and any required story split recommendations.</p>
    <p>Thank you,<br/>Jenniver</p>
  </div>`;
  return { html, plainText, subject };
}

function openGaryEmailDraft(recipient: string) {
  const { plainText, subject } = createFirstPassReviewEmail();
  window.location.href = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainText)}`;
}

async function copyFirstPassReviewEmailTable() {
  const { html, plainText } = createFirstPassReviewEmail();
  if (!navigator.clipboard) return "unavailable" as const;
  if (typeof ClipboardItem === "undefined") {
    await navigator.clipboard.writeText(plainText);
    return "plain-text" as const;
  }
  await navigator.clipboard.write([
    new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    }),
  ]);
  return "rich" as const;
}

export default function StateProvisionStoryReview() {
  const [garyEmail, setGaryEmail] = useState(GARY_EMAIL);
  const [emailCopyState, setEmailCopyState] = useState<"idle" | "rich" | "plain-text" | "unavailable" | "error">("idle");
  const copyLinkedEmailTable = async () => {
    try {
      setEmailCopyState(await copyFirstPassReviewEmailTable());
    } catch {
      setEmailCopyState("error");
    }
  };

  return (
    <section aria-labelledby="state-provision-story-review-title" style={{ marginTop: "26px", marginBottom: "26px" }}>
      <div style={{ borderLeft: `4px solid ${C.purple}`, marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: C.purple, fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>PI4 operating model · story readiness</div>
        <h2 id="state-provision-story-review-title" style={{ color: C.navy, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>State &amp; Provision Story Review — Ask Buddy First Pass + Gary Technical Review</h2>
        <p style={{ color: C.muted, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "1000px" }}>A repeatable pre-review process for stories requiring TDC, Gateway, or shared data-layer work. Ask Buddy / Manus structures the first pass; Gary remains accountable for final technical validation.</p>
      </div>

      <div style={{ background: C.amberSurface, border: "1px solid #fde68a", borderRadius: "9px", color: "#713f12", display: "grid", gap: "8px", gridTemplateColumns: "auto 1fr", marginBottom: "14px", padding: "12px 14px" }}>
        <div style={{ alignItems: "center", background: "#fef3c7", borderRadius: "999px", display: "flex", fontSize: "12px", fontWeight: 900, height: "24px", justifyContent: "center", width: "24px" }}>!</div>
        <div><strong style={{ fontSize: "11px" }}>Control point:</strong> <span style={{ fontSize: "11px", lineHeight: 1.45 }}>Ask Buddy / Manus does not replace Gary’s final technical review. Repository, implementation, API, persistence, architectural, and Claude Code context may not be represented in the submitted story.</span></div>
      </div>

      <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", marginTop: "14px", overflow: "hidden" }}>
        <div style={{ alignItems: "flex-start", background: "#f8fafc", borderBottom: `1px solid ${C.border}`, display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", padding: "14px" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Current-year State review package</div>
            <div style={{ color: C.navy, fontSize: "15px", fontWeight: 900, marginTop: "4px" }}>First-pass findings for Gary</div>
            <p style={{ color: C.muted, fontSize: "10px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "760px" }}>{CURRENT_YEAR_STATE_REVIEWS.length} first-pass reviews completed in {FIRST_PASS_REVIEW_CYCLE}. Each entry retains its review date and Markdown review file for Gary’s technical review.</p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
            <a download href={CURRENT_YEAR_STATE_REVIEW_PACKAGE_URL} style={{ background: C.purple, borderRadius: "6px", color: "#ffffff", fontSize: "10px", fontWeight: 900, padding: "9px 11px", textDecoration: "none", whiteSpace: "nowrap" }}>Download all reviews (.zip)</a>
            <a download href={CURRENT_YEAR_STATE_REVIEW_REPORT_URL} style={{ background: "#ffffff", border: `1px solid ${C.purple}`, borderRadius: "6px", color: C.purpleInk, fontSize: "10px", fontWeight: 900, padding: "8px 10px", textDecoration: "none", whiteSpace: "nowrap" }}>Download report (.md)</a>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", minWidth: "1260px", width: "100%" }}>
            <thead>
              <tr style={{ background: C.navy, color: "#ffffff" }}>
                {[
                  "Review #",
                  "First-pass review date",
                  "Story",
                  "First-pass status",
                  "What looks solid",
                  "Main gaps / questions to resolve",
                  "Review file",
                ].map((header) => <th key={header} style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.045em", padding: "10px", textAlign: "left", textTransform: "uppercase" }}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {CURRENT_YEAR_STATE_REVIEWS.map((review, index) => (
                <tr key={review.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}`, verticalAlign: "top" }}>
                  <td style={{ color: C.purpleInk, fontSize: "11px", fontWeight: 900, padding: "10px", textAlign: "center" }}>{review.reviewNumber}</td>
                  <td style={{ color: C.slate, fontSize: "10px", fontWeight: 800, padding: "10px", whiteSpace: "nowrap" }}>{review.reviewedOn}</td>
                  <td style={{ color: C.navy, fontSize: "10px", fontWeight: 850, lineHeight: 1.4, padding: "10px", width: "24%" }}><strong style={{ color: C.purpleInk }}>{review.id}</strong> — {review.title}</td>
                  <td style={{ padding: "10px" }}><FirstPassChip status={review.status} /></td>
                  <td style={{ color: C.slate, fontSize: "10px", lineHeight: 1.45, padding: "10px", width: "22%" }}>{review.solid}</td>
                  <td style={{ color: C.amber, fontSize: "10px", lineHeight: 1.45, padding: "10px", width: "30%" }}>{review.gaps}</td>
                  <td style={{ padding: "10px", whiteSpace: "nowrap" }}><a download href={review.url} style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, textDecoration: "none" }} title={review.reviewFileName}>Download review (.md) ↓</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ alignItems: "end", background: "#f8fafc", borderTop: `1px solid ${C.border}`, display: "grid", gap: "10px", gridTemplateColumns: "minmax(230px, 1fr) minmax(190px, 0.7fr) auto", padding: "12px 14px" }}>
          <div>
            <div style={{ color: C.purpleInk, fontSize: "10px", fontWeight: 900, letterSpacing: "0.075em", textTransform: "uppercase" }}>Email package to Gary</div>
            <div style={{ color: C.muted, fontSize: "10px", lineHeight: 1.45, marginTop: "3px" }}>The linked draft is addressed to Gary and contains only the {CURRENT_YEAR_STATE_REVIEWS.length} first-pass reviews. Copy the Outlook-ready table to preserve the visible review layout and clickable file links.</div>
          </div>
          <label style={{ color: C.navy, display: "grid", fontSize: "9px", fontWeight: 850, gap: "5px" }}>
            Gary’s email address
            <input aria-label="Gary’s email address" onChange={(event) => setGaryEmail(event.target.value)} placeholder={GARY_EMAIL} style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "6px", color: C.navy, fontSize: "11px", outline: "none", padding: "8px 9px" }} type="email" value={garyEmail} />
          </label>
          <div style={{ alignItems: "stretch", display: "flex", flexDirection: "column", gap: "6px" }}>
            <button disabled={!garyEmail.trim()} onClick={() => openGaryEmailDraft(garyEmail)} style={{ background: C.navy, border: "none", borderRadius: "6px", color: "#ffffff", cursor: garyEmail.trim() ? "pointer" : "not-allowed", fontSize: "10px", fontWeight: 900, opacity: garyEmail.trim() ? 1 : 0.45, padding: "9px 11px", whiteSpace: "nowrap" }} type="button">Open linked email draft</button>
            <button onClick={() => void copyLinkedEmailTable()} style={{ background: "#ffffff", border: `1px solid ${C.purple}`, borderRadius: "6px", color: C.purpleInk, cursor: "pointer", fontSize: "10px", fontWeight: 900, padding: "8px 10px", whiteSpace: "nowrap" }} type="button">Copy Outlook-ready table</button>
          </div>
        </div>
        <div aria-live="polite" style={{ background: "#f8fafc", borderTop: `1px solid ${C.border}`, color: emailCopyState === "error" || emailCopyState === "unavailable" ? C.amber : C.muted, fontSize: "9px", lineHeight: 1.45, padding: "8px 14px" }}>
          {emailCopyState === "rich" && "Table copied with formatting and live review-file links. In the opened Outlook draft, paste with Ctrl+V or Cmd+V."}
          {emailCopyState === "plain-text" && "Plain-text links copied. Paste into the opened Outlook draft; the full review-file URLs will remain available to Gary."}
          {emailCopyState === "unavailable" && "Clipboard access is unavailable in this browser. The linked email draft still includes the full review-file URLs."}
          {emailCopyState === "error" && "The table could not be copied. Use the linked email draft, which includes the direct review-file URLs."}
          {emailCopyState === "idle" && "Open the linked email draft for the direct review-file URLs, then copy and paste the Outlook-ready table when you want the same visible table layout."}
        </div>
        <div style={{ background: C.amberSurface, borderTop: "1px solid #fde68a", color: "#713f12", fontSize: "10px", lineHeight: 1.5, padding: "10px 14px" }}><strong>Technical control:</strong> Gary’s final review remains required for implementation, API, persistence, architectural, and repository-pattern decisions. The individual review files preserve the detailed unresolved questions and split assessment.</div>
      </div>

      <StoryReviewAskBuddy />
    </section>
  );
}
