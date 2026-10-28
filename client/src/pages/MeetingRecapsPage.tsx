import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, ClipboardCopy, ExternalLink, FileText, LoaderCircle, Send, Sparkles, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";

type EmailStatus = "Draft" | "Reviewed" | "Sent";

type DeveloperUpdate = {
  teamMember: "Gary" | "Reshma" | "Morgan";
  completedProgress: string;
  currentFocus: string;
  nextStep: string;
  blockersSupportNeeded: string;
};

type ActionItem = {
  actionItem: string;
  owner: string;
  statusNextStep: string;
  dueDate: string;
};

type MeetingRecord = {
  id: number;
  meetingDate: string;
  meetingTitle: string;
  sprint: string;
  attendees: string[];
  keyFocus: string[];
  transcriptFileName: string;
  transcriptStorageUrl: string;
  emailSubject: string;
  emailBody: string;
  developerUpdates: DeveloperUpdate[];
  actionItems: ActionItem[];
  blockersRisks: string[];
  decisionsCallouts: string[];
  notes: string | null;
  emailStatus: EmailStatus;
};

type RecapGenerationJob = {
  id: string;
  status: "Uploading" | "Queued" | "Running" | "Complete" | "Failed";
  stage: string;
  recapId: number | null;
  failureMessage: string | null;
  attemptCount: number;
};

// The direct endpoint accepts the full supported source limit, avoiding
// sequential browser upload chunks for Meeting Recaps transcripts.
const DIRECT_RECAP_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
const ACTIVE_RECAP_JOB_KEY = "dct-meeting-recap-active-job";

const fieldLabelStyle: React.CSSProperties = { color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" };

function displayDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatUploadDuration(durationMs: number | null | undefined) {
  if (durationMs === null || durationMs === undefined) return "Not yet measured";
  if (durationMs < 1_000) return `${durationMs} ms`;
  return `${(durationMs / 1_000).toFixed(durationMs >= 10_000 ? 0 : 1)} sec`;
}

function formatFileSize(fileSizeBytes: number) {
  if (fileSizeBytes < 1_024 * 1_024) return `${Math.max(1, Math.round(fileSizeBytes / 1_024))} KB`;
  return `${(fileSizeBytes / (1_024 * 1_024)).toFixed(1)} MB`;
}

function emailStatusStyle(status: EmailStatus) {
  const styles: Record<EmailStatus, { background: string; border: string; color: string }> = {
    Draft: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    Reviewed: { background: "#fffbeb", border: "#fde68a", color: "#92400e" },
    Sent: { background: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
  };
  return styles[status];
}

async function uploadTranscriptDirectly(file: File) {
  const response = await fetch("/api/tdc-meeting-recaps/upload", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/octet-stream",
      "x-transcript-file-name": encodeURIComponent(file.name),
      "x-transcript-mime-type": file.type || "application/octet-stream",
    },
    body: file,
  });
  const payload = await response.json().catch(() => null) as { jobId?: string; error?: string } | null;
  if (!response.ok || !payload?.jobId) {
    throw new Error(payload?.error || "The secure transcript upload could not complete. Re-select the file and try again.");
  }
  return payload.jobId;
}

function recapUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/Transcript analysis did not complete after two attempts/i.test(message)) {
    return "The recap service did not complete within the safe processing window after an automatic retry. The transcript remains available; use Retry generation to try again.";
  }
  if (/Failed to fetch|request aborted|network error/i.test(message)) {
    return "The secure upload was interrupted. The selected transcript remains available; select Generate Recap again to restart the upload.";
  }
  return message || "The transcript could not be analyzed. Keep the selected file and try again.";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function summaryBulletsFromEmail(emailBody: string) {
  const summary = emailBody.split("MEETING SUMMARY")[1]?.split("DEV UPDATES")[0] ?? "";
  return summary.split("\n").filter((line) => line.startsWith("- ")).map((line) => line.slice(2));
}

function buildOutlookEmailHtml(record: MeetingRecord) {
  const tableStyle = "border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:12px";
  const headerStyle = "background:#0f172a;color:#ffffff;padding:8px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.04em";
  const cellStyle = "border:1px solid #d8dee8;padding:8px;vertical-align:top;color:#334155";
  const summary = summaryBulletsFromEmail(record.emailBody).map((item) => `<li style=\"margin:0 0 5px\">${escapeHtml(item)}</li>`).join("");
  const developers = record.developerUpdates.map((update) => `<tr><td style=\"${cellStyle};font-weight:700\">${escapeHtml(update.teamMember)}</td><td style=\"${cellStyle}\">${escapeHtml(update.completedProgress)}</td><td style=\"${cellStyle}\">${escapeHtml(update.currentFocus)}</td><td style=\"${cellStyle}\">${escapeHtml(update.nextStep)}</td><td style=\"${cellStyle}\">${escapeHtml(update.blockersSupportNeeded)}</td></tr>`).join("");
  const actions = record.actionItems.length
    ? record.actionItems.map((item, index) => `<tr><td style=\"${cellStyle};font-weight:700\">${index + 1}</td><td style=\"${cellStyle}\">${escapeHtml(item.actionItem)}</td><td style=\"${cellStyle}\">${escapeHtml(item.owner)}</td><td style=\"${cellStyle}\">${escapeHtml(item.statusNextStep)}</td><td style=\"${cellStyle}\">${escapeHtml(item.dueDate)}</td></tr>`).join("")
    : `<tr><td colspan=\"5\" style=\"${cellStyle}\">No action items identified from the transcript.</td></tr>`;
  const blockers = record.blockersRisks.length ? `<h3 style=\"color:#9a3412;font-size:12px;margin:18px 0 7px\">BLOCKERS / RISKS</h3><ul style=\"margin:0;padding-left:20px\">${record.blockersRisks.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  const decisions = record.decisionsCallouts.length ? `<h3 style=\"color:#1d4ed8;font-size:12px;margin:18px 0 7px\">DECISIONS / KEY CALL-OUTS</h3><ul style=\"margin:0;padding-left:20px\">${record.decisionsCallouts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : "";
  return `<div style=\"font-family:Arial,sans-serif;color:#334155;line-height:1.45\"><p><strong>Subject:</strong> ${escapeHtml(record.emailSubject)}</p><p>Hi Team,</p><p>Below is the recap from today's TDC Daily Standup.</p><h3 style=\"color:#1e3a5f;font-size:12px;margin:18px 0 7px\">MEETING SUMMARY</h3><ul style=\"margin:0;padding-left:20px\">${summary}</ul><h3 style=\"color:#1e3a5f;font-size:12px;margin:18px 0 7px\">DEV UPDATES</h3><table style=\"${tableStyle}\"><thead><tr>${["Team Member", "Completed / Progress", "Current Focus", "Next Step", "Blockers / Support Needed"].map((heading) => `<th style=\"${headerStyle}\">${heading}</th>`).join("")}</tr></thead><tbody>${developers}</tbody></table><h3 style=\"color:#1e3a5f;font-size:12px;margin:18px 0 7px\">ACTION ITEMS</h3><table style=\"${tableStyle}\"><thead><tr>${["#", "Action Item", "Owner", "Status / Next Step", "Due Date"].map((heading) => `<th style=\"${headerStyle}\">${heading}</th>`).join("")}</tr></thead><tbody>${actions}</tbody></table>${blockers}${decisions}<p style=\"margin-top:18px\">Thanks,<br/>Jenniver</p></div>`;
}

function StatusPill({ status }: { status: EmailStatus }) {
  const colors = emailStatusStyle(status);
  return <span style={{ background: colors.background, border: `1px solid ${colors.border}`, borderRadius: "999px", color: colors.color, fontSize: "10px", fontWeight: 850, padding: "3px 7px", whiteSpace: "nowrap" }}>{status}</span>;
}

function Tracker({ records, onGenerateEmailRecap, onMarkRead, onSelect, onSelectAction, selectedId, emailDraftReadyId, isGeneratingEmailDraft, isMarkingRead }: { records: MeetingRecord[]; onGenerateEmailRecap: (id: number) => void; onMarkRead: (id: number) => void; onSelect: (id: number) => void; onSelectAction: (id: number) => void; selectedId?: number; emailDraftReadyId: number | null; isGeneratingEmailDraft: boolean; isMarkingRead: boolean }) {
  return (
    <section aria-labelledby="tdc-meeting-recap-tracker" style={{ marginTop: "30px" }}>
      <div style={{ borderLeft: "4px solid #1e3a5f", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Recent Meeting Recaps</div>
        <h2 id="tdc-meeting-recap-tracker" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: "4px 0 0" }}>TDC Meeting Recap Tracker</h2>
        <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Newest meeting first. Draft and reviewed recaps remain available for final review; sent recaps move to the compact history below.</p>
      </div>
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", overflow: "hidden" }}>
        {records.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "12px", padding: "28px", textAlign: "center" }}>No draft or reviewed recaps are awaiting action. Upload the daily transcript to create the next draft.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1280px", width: "100%" }}>
              <thead><tr style={{ background: "#0f172a", textAlign: "left" }}>{["Meeting Date", "Meeting", "Sprint", "Key Focus", "Email Status", "Email Actions", "Action Items", "Transcript", "Notes"].map((heading) => <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead>
              <tbody>{records.map((record, index) => <tr key={record.id} style={{ background: record.id === selectedId ? "#eff6ff" : index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px", whiteSpace: "nowrap" }}>{displayDate(record.meetingDate)}</td>
                <td style={{ padding: "11px 12px" }}><button type="button" onClick={() => onSelect(record.id)} style={{ background: "none", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: 0, textAlign: "left" }}>{record.meetingTitle}</button></td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.sprint}</td>
                <td style={{ color: "#475569", fontSize: "11px", maxWidth: "240px", padding: "11px 12px" }}>{record.keyFocus.length ? record.keyFocus.join(" · ") : "Not specified"}</td>
                <td style={{ padding: "11px 12px" }}><StatusPill status={record.emailStatus} /></td>
                <td style={{ padding: "11px 12px" }}><div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minWidth: "190px" }}><button type="button" onClick={() => onGenerateEmailRecap(record.id)} disabled={isGeneratingEmailDraft} style={{ alignItems: "center", background: emailDraftReadyId === record.id ? "#047857" : "#1e3a5f", border: `1px solid ${emailDraftReadyId === record.id ? "#047857" : "#1e3a5f"}`, borderRadius: "5px", color: "#ffffff", cursor: isGeneratingEmailDraft ? "not-allowed" : "pointer", display: "inline-flex", fontSize: "10px", fontWeight: 850, gap: "4px", opacity: isGeneratingEmailDraft ? 0.7 : 1, padding: "6px 7px", whiteSpace: "nowrap" }}><Sparkles size={12} />{isGeneratingEmailDraft ? "Generating…" : emailDraftReadyId === record.id ? "Email Ready" : "Generate Email Recap"}</button>{record.emailStatus === "Draft" && <button type="button" onClick={() => onMarkRead(record.id)} disabled={isMarkingRead} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #d97706", borderRadius: "5px", color: "#92400e", cursor: isMarkingRead ? "not-allowed" : "pointer", display: "inline-flex", fontSize: "10px", fontWeight: 850, gap: "4px", opacity: isMarkingRead ? 0.7 : 1, padding: "6px 7px", whiteSpace: "nowrap" }}><Check size={12} />Mark Read</button>}</div></td>
                <td style={{ padding: "11px 12px" }}><button type="button" onClick={() => onSelectAction(record.id)} style={{ background: "none", border: "none", color: "#0f766e", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: 0 }}>{record.actionItems.length} item{record.actionItems.length === 1 ? "" : "s"}</button></td>
                <td style={{ padding: "11px 12px" }}><a href={record.transcriptStorageUrl} target="_blank" rel="noopener noreferrer" style={{ alignItems: "center", color: "#1d4ed8", display: "inline-flex", fontSize: "11px", fontWeight: 800, gap: "4px", textDecoration: "none" }}><FileText size={12} />Open</a></td>
                <td style={{ color: "#64748b", fontSize: "11px", maxWidth: "230px", padding: "11px 12px" }}>{record.notes || "—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function SentRecapHistory({ records }: { records: MeetingRecord[] }) {
  return (
    <section aria-labelledby="sent-meeting-recaps" style={{ marginTop: "30px" }}>
      <div style={{ borderLeft: "4px solid #059669", marginBottom: "14px", paddingLeft: "12px" }}>
        <div style={{ color: "#047857", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Delivery history</div>
        <h2 id="sent-meeting-recaps" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: "4px 0 0" }}>Sent Meeting Recaps</h2>
        <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Sent emails are retained as a concise audit record. Use the transcript link to open the uploaded source.</p>
      </div>
      <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", overflow: "hidden" }}>
        {records.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "12px", padding: "22px 28px", textAlign: "center" }}>No meeting recap emails have been marked Sent.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "650px", width: "100%" }}>
              <thead><tr style={{ background: "#064e3b", textAlign: "left" }}>{["Meeting Date", "Key Focus", "Transcript"].map((heading) => <th key={heading} style={{ color: "#d1fae5", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead>
              <tbody>{records.map((record, index) => <tr key={record.id} style={{ background: index % 2 ? "#ffffff" : "#f0fdf4", borderTop: "1px solid #d1fae5" }}>
                <td style={{ color: "#334155", fontSize: "11px", padding: "11px 12px", whiteSpace: "nowrap" }}>{displayDate(record.meetingDate)}</td>
                <td style={{ color: "#334155", fontSize: "11px", maxWidth: "520px", padding: "11px 12px" }}>{record.keyFocus.length ? record.keyFocus.join(" · ") : "Not specified"}</td>
                <td style={{ padding: "11px 12px" }}><a href={record.transcriptStorageUrl} target="_blank" rel="noopener noreferrer" style={{ alignItems: "center", color: "#047857", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "4px", textDecoration: "none" }}><FileText size={12} />Open transcript</a></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

function MeetingRecordDetail({ record, onGenerateEmailDraft, onStatusChange, isEmailDraftReady, isGeneratingEmailDraft }: { record: MeetingRecord; onGenerateEmailDraft: () => void; onStatusChange: (status: EmailStatus) => void; isEmailDraftReady: boolean; isGeneratingEmailDraft: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [emailCopied, setEmailCopied] = useState(false);

  async function copyEmail() {
    const html = buildOutlookEmailHtml(record);
    if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([record.emailBody], { type: "text/plain" }),
      })]);
    } else {
      await navigator.clipboard.writeText(record.emailBody);
    }
    setEmailCopied(true);
    window.setTimeout(() => setEmailCopied(false), 2200);
  }

  if (record.emailStatus === "Sent") return null;

  return (
    <section id={`meeting-recap-${record.id}`} aria-labelledby={`meeting-recap-title-${record.id}`} style={{ marginTop: "28px" }}>
      <div style={{ alignItems: "flex-start", borderLeft: "4px solid #0f766e", display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "space-between", marginBottom: "14px", paddingLeft: "12px" }}>
        <div>
          <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Individual Meeting Record</div>
          <h2 id={`meeting-recap-title-${record.id}`} style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: "4px 0 0" }}>{record.meetingTitle} — {displayDate(record.meetingDate)}</h2>
          <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Generated from the retained transcript. Review the draft before changing its email status.</p>
        </div>
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <StatusPill status={record.emailStatus} />
          <button type="button" onClick={onGenerateEmailDraft} disabled={isGeneratingEmailDraft} style={{ alignItems: "center", background: isEmailDraftReady ? "#047857" : "#1e3a5f", border: `1px solid ${isEmailDraftReady ? "#047857" : "#1e3a5f"}`, borderRadius: "6px", color: "#ffffff", cursor: isGeneratingEmailDraft ? "not-allowed" : "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "5px", opacity: isGeneratingEmailDraft ? 0.7 : 1, padding: "7px 9px" }}><Sparkles size={13} />{isGeneratingEmailDraft ? "Generating Email Draft…" : isEmailDraftReady ? "Email Draft Ready" : "Generate Email Draft"}</button>
          {record.emailStatus === "Draft" && <button type="button" onClick={() => onStatusChange("Reviewed")} style={{ alignItems: "center", background: "#ffffff", border: "1px solid #d97706", borderRadius: "6px", color: "#92400e", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "5px", padding: "7px 9px" }}><Check size={13} />Mark Reviewed</button>}
          <button type="button" onClick={() => onStatusChange("Sent")} style={{ alignItems: "center", background: "#0f766e", border: "1px solid #0f766e", borderRadius: "6px", color: "#ffffff", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "5px", padding: "7px 9px" }}><Send size={13} />Mark Sent</button>
          <button type="button" onClick={() => setExpanded((value) => !value)} style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "6px", color: "#475569", cursor: "pointer", display: "inline-flex", padding: "7px" }} aria-label={expanded ? "Collapse meeting recap" : "Expand meeting recap"}>{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
        </div>
      </div>

      {expanded && <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", padding: "13px 16px" }}>
          <div><div style={fieldLabelStyle}>Meeting date</div><div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 800, marginTop: "4px" }}>{displayDate(record.meetingDate)}</div></div>
          <div><div style={fieldLabelStyle}>Attendees</div><div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 800, marginTop: "4px" }}>{record.attendees.length ? record.attendees.join(", ") : "Needs confirmation"}</div></div>
          <div><div style={fieldLabelStyle}>Sprint / work period</div><div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 800, marginTop: "4px" }}>{record.sprint}</div></div>
          <div><div style={fieldLabelStyle}>Source transcript</div><a href={record.transcriptStorageUrl} target="_blank" rel="noopener noreferrer" style={{ alignItems: "center", color: "#1d4ed8", display: "inline-flex", fontSize: "12px", fontWeight: 850, gap: "5px", marginTop: "4px", textDecoration: "none" }}><ExternalLink size={13} />{record.transcriptFileName}</a></div>
        </div>

        <div style={{ padding: "18px" }}>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginBottom: "10px" }}>
            <div><div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Generated Email</div><div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 900, marginTop: "3px" }}>{record.emailSubject}</div></div>
            <button type="button" onClick={copyEmail} style={{ alignItems: "center", background: "#1e3a5f", border: "none", borderRadius: "6px", color: "#ffffff", cursor: "pointer", display: "inline-flex", fontSize: "11px", fontWeight: 850, gap: "6px", padding: "8px 10px" }}><ClipboardCopy size={13} />{emailCopied ? "Email Copied" : "Copy Email for Outlook"}</button>
          </div>
          <pre style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "7px", color: "#334155", fontFamily: "ui-sans-serif, system-ui, sans-serif", fontSize: "11px", lineHeight: 1.55, margin: 0, overflowX: "auto", padding: "14px", whiteSpace: "pre-wrap" }}>{record.emailBody}</pre>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", padding: "18px" }}>
          <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>DEV Updates</div>
          <div style={{ overflowX: "auto", marginTop: "9px" }}><table style={{ borderCollapse: "collapse", minWidth: "900px", width: "100%" }}><thead><tr style={{ background: "#0f172a", textAlign: "left" }}>{["Team Member", "Completed / Progress", "Current Focus", "Next Step", "Blockers / Support Needed"].map((heading) => <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px", textTransform: "uppercase" }}>{heading}</th>)}</tr></thead><tbody>{record.developerUpdates.map((update, index) => <tr key={update.teamMember} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}><td style={{ color: "#0f172a", fontSize: "11px", fontWeight: 850, padding: "10px" }}>{update.teamMember}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{update.completedProgress}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{update.currentFocus}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{update.nextStep}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{update.blockersSupportNeeded}</td></tr>)}</tbody></table></div>
        </div>

        <div id={`meeting-action-items-${record.id}`} style={{ borderTop: "1px solid #e2e8f0", padding: "18px" }}>
          <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Action Items</div>
          <div style={{ overflowX: "auto", marginTop: "9px" }}><table style={{ borderCollapse: "collapse", minWidth: "800px", width: "100%" }}><thead><tr style={{ background: "#0f172a", textAlign: "left" }}>{["#", "Action Item", "Owner", "Status / Next Step", "Due Date"].map((heading) => <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px", textTransform: "uppercase" }}>{heading}</th>)}</tr></thead><tbody>{record.actionItems.length === 0 ? <tr><td colSpan={5} style={{ color: "#64748b", fontSize: "11px", padding: "13px", textAlign: "center" }}>No action items identified from the transcript.</td></tr> : record.actionItems.map((item, index) => <tr key={`${item.actionItem}-${index}`} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}><td style={{ color: "#0f172a", fontSize: "11px", fontWeight: 850, padding: "10px" }}>{index + 1}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{item.actionItem}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{item.owner}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{item.statusNextStep}</td><td style={{ color: "#475569", fontSize: "11px", padding: "10px" }}>{item.dueDate}</td></tr>)}</tbody></table></div>
        </div>

        {(record.blockersRisks.length > 0 || record.decisionsCallouts.length > 0) && <div style={{ borderTop: "1px solid #e2e8f0", display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", padding: "18px" }}>
          {record.blockersRisks.length > 0 && <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "7px", padding: "12px" }}><div style={{ color: "#9a3412", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Blockers / Risks</div><ul style={{ color: "#7c2d12", fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0", paddingLeft: "17px" }}>{record.blockersRisks.map((item) => <li key={item}>{item}</li>)}</ul></div>}
          {record.decisionsCallouts.length > 0 && <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "7px", padding: "12px" }}><div style={{ color: "#1d4ed8", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Decisions / Key Call-Outs</div><ul style={{ color: "#1e3a8a", fontSize: "11px", lineHeight: 1.5, margin: "7px 0 0", paddingLeft: "17px" }}>{record.decisionsCallouts.map((item) => <li key={item}>{item}</li>)}</ul></div>}
        </div>}
      </div>}
    </section>
  );
}

export default function MeetingRecapsPage() {
  const utils = trpc.useUtils();
  const { data: meetingRecords = [], isError: isMeetingHistoryError, isLoading, refetch: refetchMeetingHistory } = trpc.tdcMeetingRecaps.list.useQuery(undefined, {
    retry: 2,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 2_000),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const { data: uploadPerformance } = trpc.tdcMeetingRecaps.uploadPerformance.useQuery(undefined, {
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [recapError, setRecapError] = useState<string | null>(null);
  const [uploadDurationMs, setUploadDurationMs] = useState<number | null>(null);
  const [emailDraftReadyId, setEmailDraftReadyId] = useState<number | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(ACTIVE_RECAP_JOB_KEY);
    } catch {
      return null;
    }
  });
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null);
  const retryGeneration = trpc.tdcMeetingRecaps.retryGeneration.useMutation();
  const recordUploadPerformance = trpc.tdcMeetingRecaps.recordUploadPerformance.useMutation({
    onSuccess: () => void utils.tdcMeetingRecaps.uploadPerformance.invalidate(),
  });
  const activeJobInput = activeJobId
    ? { jobId: activeJobId }
    : { jobId: "00000000-0000-4000-8000-000000000000" };
  const { data: activeJob, error: activeJobError } = trpc.tdcMeetingRecaps.generationStatus.useQuery(
    activeJobInput,
    {
      enabled: Boolean(activeJobId),
      refetchInterval: (query) => {
        const status = (query.state.data as RecapGenerationJob | undefined)?.status;
        return status === "Complete" || status === "Failed" ? false : 1_500;
      },
      retry: 2,
    }
  );
  const updateStatus = trpc.tdcMeetingRecaps.updateEmailStatus.useMutation({ onSuccess: () => utils.tdcMeetingRecaps.list.invalidate() });
  const generateEmailDraft = trpc.tdcMeetingRecaps.generateEmailDraft.useMutation({
    onSuccess: (_result, variables) => {
      void utils.tdcMeetingRecaps.list.invalidate();
      setEmailDraftReadyId(variables.id);
      window.setTimeout(() => setEmailDraftReadyId((current) => current === variables.id ? null : current), 3_000);
    },
    onError: (error) => setRecapError(recapUploadErrorMessage(error)),
  });
  const records = meetingRecords as MeetingRecord[];
  const activeRecords = records.filter((record) => record.emailStatus !== "Sent");
  const sentRecords = records.filter((record) => record.emailStatus === "Sent");
  const selectedRecord = activeRecords.find((record) => record.id === selectedId) ?? activeRecords[0];

  const recapJob = activeJob as RecapGenerationJob | undefined;
  const latestUpload = uploadPerformance?.latest;
  const recentTargetSummary = uploadPerformance?.sampleSize
    ? `${uploadPerformance.metTargetCount} of ${uploadPerformance.sampleSize} recent uploads met target`
    : "Measurements begin with the next upload";
  const isUploading = uploadProgress !== null;
  const isGenerating = recapJob?.status === "Queued" || recapJob?.status === "Running";
  const isRecapBusy = isUploading || isGenerating;

  useEffect(() => {
    if (!recapJob || recapJob.status !== "Complete" || !recapJob.recapId) return;
    void utils.tdcMeetingRecaps.list.invalidate();
    setSelectedId(recapJob.recapId);
    setSelectedFile(null);
    setUploadProgress(null);
    setRecapError(null);
    try {
      window.localStorage.removeItem(ACTIVE_RECAP_JOB_KEY);
    } catch {
      // Local storage is only a convenience for restoring visible job progress.
    }
    window.setTimeout(() => document.getElementById(`meeting-recap-${recapJob.recapId}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
  }, [recapJob?.recapId, recapJob?.status, utils.tdcMeetingRecaps.list]);

  async function generateRecap() {
    if (!selectedFile) return;
    setRecapError(null);
    setUploadProgress(null);
    setUploadDurationMs(null);
    // Use a monotonic in-page clock. Wall-clock time can jump while a browser
    // tab is open and would falsely report a long transfer in the metric.
    const uploadStartedAt = performance.now();
    try {
      if (selectedFile.size > DIRECT_RECAP_UPLOAD_MAX_BYTES) {
        throw new Error("Transcripts must be 10 MB or smaller.");
      }
      setUploadProgress({ completed: 0, total: 1 });
      const jobId = await uploadTranscriptDirectly(selectedFile);
      setActiveJobId(jobId);
      try {
        window.localStorage.setItem(ACTIVE_RECAP_JOB_KEY, jobId);
      } catch {
        // Local storage is only a convenience for restoring visible job progress.
      }
      const durationMs = Math.round(performance.now() - uploadStartedAt);
      setUploadDurationMs(durationMs);
      recordUploadPerformance.mutate({ jobId, durationMs });
      setUploadProgress(null);
    } catch (error) {
      setUploadProgress(null);
      setRecapError(recapUploadErrorMessage(error));
    }
  }

  async function retryActiveJob() {
    if (!activeJobId) return;
    setRecapError(null);
    try {
      await retryGeneration.mutateAsync({ jobId: activeJobId });
    } catch (error) {
      setRecapError(recapUploadErrorMessage(error));
    }
  }

  return (
    <div style={{ margin: "0 auto", maxWidth: "1340px", padding: "28px 32px 54px" }}>
      <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: "26px", paddingBottom: "18px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pilot · Meeting Recaps</div>
        <h1 style={{ color: "#0f172a", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>TDC Daily Standup — Meeting Recaps</h1>
        <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.55, margin: "7px 0 0", maxWidth: "810px" }}>A central working tool and historical record for generating, reviewing, and tracking evidence-bound TDC Daily Standup recap emails.</p>
      </div>

      <section aria-labelledby="recent-upload-performance" style={{ background: "#f8fafc", border: "1px solid #d8dee8", borderRadius: "10px", marginBottom: "18px", padding: "14px 16px" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 900, letterSpacing: "0.09em", textTransform: "uppercase" }}>Performance monitoring</div>
            <h2 id="recent-upload-performance" style={{ color: "#0f172a", fontSize: "15px", fontWeight: 900, margin: "3px 0 0" }}>Recent Upload Performance</h2>
            <p style={{ color: "#64748b", fontSize: "11px", margin: "4px 0 0" }}>Secure transcript transfer only; recap generation time is excluded.</p>
          </div>
          <div style={{ background: latestUpload?.metTarget ? "#ecfdf5" : latestUpload ? "#fff7ed" : "#eff6ff", border: `1px solid ${latestUpload?.metTarget ? "#a7f3d0" : latestUpload ? "#fed7aa" : "#bfdbfe"}`, borderRadius: "999px", color: latestUpload?.metTarget ? "#047857" : latestUpload ? "#9a3412" : "#1d4ed8", fontSize: "11px", fontWeight: 900, padding: "6px 9px" }}>{latestUpload ? (latestUpload.metTarget ? "Latest upload met target" : "Latest upload missed target") : "5-second target"}</div>
        </div>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", marginTop: "13px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "10px" }}><div style={fieldLabelStyle}>Latest upload</div><div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, marginTop: "4px" }}>{formatUploadDuration(latestUpload?.durationMs)}</div><div style={{ color: "#64748b", fontSize: "10px", marginTop: "3px" }}>{latestUpload ? `${formatFileSize(latestUpload.fileSizeBytes)} · ${latestUpload.uploadMode}` : "No upload yet"}</div></div>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "10px" }}><div style={fieldLabelStyle}>Five-second target</div><div style={{ color: uploadPerformance?.metTargetPercent === null || uploadPerformance?.metTargetPercent === undefined || uploadPerformance.metTargetPercent >= 80 ? "#047857" : "#9a3412", fontSize: "16px", fontWeight: 900, marginTop: "4px" }}>{uploadPerformance?.metTargetPercent === null || uploadPerformance?.metTargetPercent === undefined ? "—" : `${uploadPerformance.metTargetPercent}%`}</div><div style={{ color: "#64748b", fontSize: "10px", marginTop: "3px" }}>{recentTargetSummary}</div></div>
          <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "10px" }}><div style={fieldLabelStyle}>Recent average</div><div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900, marginTop: "4px" }}>{formatUploadDuration(uploadPerformance?.averageDurationMs)}</div><div style={{ color: "#64748b", fontSize: "10px", marginTop: "3px" }}>Last {uploadPerformance?.sampleSize ?? 0} completed upload{uploadPerformance?.sampleSize === 1 ? "" : "s"}</div></div>
        </div>
      </section>

      <section aria-labelledby="generate-daily-tdc-recap">
        <div style={{ borderLeft: "4px solid #7c3aed", marginBottom: "14px", paddingLeft: "12px" }}>
          <div style={{ color: "#7c3aed", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Daily recap generator</div>
          <h2 id="generate-daily-tdc-recap" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: "4px 0 0" }}>Generate Daily TDC Standup Recap</h2>
          <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Upload the transcript from the TDC Daily Standup. Manus will create a tracked recap job, then generate the meeting recap email, DEV status table, action items, and tracker entry.</p>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #d8dee8", borderRadius: "10px", boxShadow: "0 2px 10px rgba(15,23,42,0.05)", padding: "18px" }}>
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "7px", color: "#5b21b6", fontSize: "11px", lineHeight: 1.5, marginBottom: "15px", padding: "10px 12px" }}><strong>Evidence control:</strong> The uploaded transcript is retained as the source. The generated recap uses only documented information; unclear details are marked <strong>Needs confirmation</strong>. Every new recap begins in <strong>Draft</strong> status.</div>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <label style={{ alignItems: "center", background: "#ffffff", border: "1px dashed #7c3aed", borderRadius: "6px", color: "#5b21b6", cursor: "pointer", display: "inline-flex", fontSize: "12px", fontWeight: 850, gap: "7px", padding: "10px 12px", position: "relative" }}><Upload size={15} />{selectedFile ? selectedFile.name : "Choose transcript (.docx or .txt)"}<input aria-label="Upload TDC Daily Standup transcript" type="file" accept=".docx,.txt" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} style={{ height: "1px", opacity: 0, overflow: "hidden", position: "absolute", width: "1px" }} /></label>
            <button type="button" onClick={generateRecap} disabled={!selectedFile || isRecapBusy} style={{ alignItems: "center", background: !selectedFile || isRecapBusy ? "#94a3b8" : "#0f172a", border: "none", borderRadius: "6px", color: "#ffffff", cursor: !selectedFile || isRecapBusy ? "not-allowed" : "pointer", display: "inline-flex", fontSize: "12px", fontWeight: 850, gap: "7px", padding: "10px 13px" }}>{isRecapBusy ? <LoaderCircle className="animate-spin" size={15} /> : <Sparkles size={15} />}{isUploading ? "Uploading transcript…" : isGenerating ? "Generating recap…" : "Generate Recap"}</button>
            <span style={{ color: "#64748b", fontSize: "11px" }}>Supported transcripts upload as one direct secure file transfer; recap generation then continues as a tracked job if you refresh the page.</span>
          </div>
          {uploadProgress && <div aria-live="polite" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", color: "#1e3a8a", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}><strong>Secure upload in progress:</strong> transferring the source transcript once, then starting recap generation.</div>}
          {uploadDurationMs !== null && !isUploading && <div aria-live="polite" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "6px", color: "#047857", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}><strong>Transcript upload complete in {(uploadDurationMs / 1000).toFixed(1)} seconds.</strong> Recap generation is continuing in the background.</div>}
          {recapJob && <div aria-live="polite" style={{ background: recapJob.status === "Failed" ? "#fef2f2" : recapJob.status === "Complete" ? "#ecfdf5" : "#eff6ff", border: `1px solid ${recapJob.status === "Failed" ? "#fecaca" : recapJob.status === "Complete" ? "#a7f3d0" : "#bfdbfe"}`, borderRadius: "6px", color: recapJob.status === "Failed" ? "#991b1b" : recapJob.status === "Complete" ? "#047857" : "#1e3a8a", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}><strong>{recapJob.status === "Complete" ? "Recap draft ready:" : recapJob.status === "Failed" ? "Recap generation needs attention:" : "Recap generation in progress:"}</strong> {recapJob.failureMessage || recapJob.stage}{recapJob.status === "Failed" && <button type="button" onClick={retryActiveJob} disabled={retryGeneration.isPending} style={{ background: "#ffffff", border: "1px solid #dc2626", borderRadius: "5px", color: "#991b1b", cursor: retryGeneration.isPending ? "not-allowed" : "pointer", fontSize: "10px", fontWeight: 850, marginLeft: "10px", padding: "5px 7px" }}>{retryGeneration.isPending ? "Retrying…" : "Retry generation"}</button>}</div>}
          {activeJobError && <div role="alert" style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "6px", color: "#9a3412", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}>The recap status could not be refreshed. Refresh the page; the uploaded transcript and recap job remain retained.</div>}
          {recapError && <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}>{recapError}</div>}
        </div>
      </section>

      {isLoading ? <div style={{ color: "#64748b", fontSize: "12px", padding: "28px 0", textAlign: "center" }}>Loading meeting recap history…</div> : isMeetingHistoryError ? <div role="alert" style={{ alignItems: "center", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px", color: "#9a3412", display: "flex", flexWrap: "wrap", fontSize: "12px", gap: "12px", justifyContent: "space-between", marginTop: "28px", padding: "14px 16px" }}><span><strong>Meeting recap history could not be loaded.</strong> The connection was interrupted after automatic retries; no recap records were changed.</span><button type="button" onClick={() => void refetchMeetingHistory()} style={{ background: "#ffffff", border: "1px solid #d97706", borderRadius: "6px", color: "#92400e", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: "7px 10px" }}>Retry loading history</button></div> : <>
        <Tracker records={activeRecords} emailDraftReadyId={emailDraftReadyId} isGeneratingEmailDraft={generateEmailDraft.isPending} isMarkingRead={updateStatus.isPending} onGenerateEmailRecap={(id) => generateEmailDraft.mutate({ id })} onMarkRead={(id) => updateStatus.mutate({ id, emailStatus: "Reviewed" })} selectedId={selectedRecord?.id} onSelect={(id) => { setSelectedId(id); window.setTimeout(() => document.getElementById(`meeting-recap-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} onSelectAction={(id) => { setSelectedId(id); window.setTimeout(() => document.getElementById(`meeting-action-items-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} />
        <SentRecapHistory records={sentRecords} />
        {selectedRecord && <MeetingRecordDetail record={selectedRecord} onGenerateEmailDraft={() => generateEmailDraft.mutate({ id: selectedRecord.id })} onStatusChange={(emailStatus) => updateStatus.mutate({ id: selectedRecord.id, emailStatus })} isEmailDraftReady={emailDraftReadyId === selectedRecord.id} isGeneratingEmailDraft={generateEmailDraft.isPending} />}
      </>}
    </div>
  );
}
