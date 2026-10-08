import { useState } from "react";
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

const fieldLabelStyle: React.CSSProperties = { color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" };

function displayDate(value: string) {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function emailStatusStyle(status: EmailStatus) {
  const styles: Record<EmailStatus, { background: string; border: string; color: string }> = {
    Draft: { background: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
    Reviewed: { background: "#fffbeb", border: "#fde68a", color: "#92400e" },
    Sent: { background: "#ecfdf5", border: "#a7f3d0", color: "#047857" },
  };
  return styles[status];
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The transcript could not be read."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function recapUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/Transcript analysis did not complete after two attempts/i.test(message)) {
    return "The recap service was slow after an automatic retry. No recap was created. Keep the selected transcript and try again in a moment.";
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

function Tracker({ records, onSelect, onSelectAction, selectedId }: { records: MeetingRecord[]; onSelect: (id: number) => void; onSelectAction: (id: number) => void; selectedId?: number }) {
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
            <table style={{ borderCollapse: "collapse", minWidth: "1100px", width: "100%" }}>
              <thead><tr style={{ background: "#0f172a", textAlign: "left" }}>{["Meeting Date", "Meeting", "Sprint", "Key Focus", "Email Status", "Action Items", "Transcript", "Notes"].map((heading) => <th key={heading} style={{ color: "#cbd5e1", fontSize: "9px", fontWeight: 850, letterSpacing: "0.06em", padding: "10px 12px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{heading}</th>)}</tr></thead>
              <tbody>{records.map((record, index) => <tr key={record.id} style={{ background: record.id === selectedId ? "#eff6ff" : index % 2 ? "#ffffff" : "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px", whiteSpace: "nowrap" }}>{displayDate(record.meetingDate)}</td>
                <td style={{ padding: "11px 12px" }}><button type="button" onClick={() => onSelect(record.id)} style={{ background: "none", border: "none", color: "#1e3a5f", cursor: "pointer", fontSize: "11px", fontWeight: 850, padding: 0, textAlign: "left" }}>{record.meetingTitle}</button></td>
                <td style={{ color: "#475569", fontSize: "11px", padding: "11px 12px" }}>{record.sprint}</td>
                <td style={{ color: "#475569", fontSize: "11px", maxWidth: "240px", padding: "11px 12px" }}>{record.keyFocus.length ? record.keyFocus.join(" · ") : "Not specified"}</td>
                <td style={{ padding: "11px 12px" }}><StatusPill status={record.emailStatus} /></td>
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

function MeetingRecordDetail({ record, onStatusChange }: { record: MeetingRecord; onStatusChange: (status: EmailStatus) => void }) {
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
  const { data: meetingRecords = [], isLoading } = trpc.tdcMeetingRecaps.list.useQuery();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [recapError, setRecapError] = useState<string | null>(null);
  const createRecap = trpc.tdcMeetingRecaps.createFromTranscript.useMutation({
    onSuccess: async (record) => {
      await utils.tdcMeetingRecaps.list.invalidate();
      setSelectedId(record.id);
      setSelectedFile(null);
      setRecapError(null);
      window.setTimeout(() => document.getElementById(`meeting-recap-${record.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    },
    onError: (error) => setRecapError(recapUploadErrorMessage(error)),
  });
  const updateStatus = trpc.tdcMeetingRecaps.updateEmailStatus.useMutation({ onSuccess: () => utils.tdcMeetingRecaps.list.invalidate() });
  const records = meetingRecords as MeetingRecord[];
  const activeRecords = records.filter((record) => record.emailStatus !== "Sent");
  const sentRecords = records.filter((record) => record.emailStatus === "Sent");
  const selectedRecord = activeRecords.find((record) => record.id === selectedId) ?? activeRecords[0];

  async function generateRecap() {
    if (!selectedFile) return;
    setRecapError(null);
    try {
      const fileBase64 = await fileToBase64(selectedFile);
      createRecap.mutate({ fileName: selectedFile.name, mimeType: selectedFile.type || "application/octet-stream", fileBase64 });
    } catch (error) {
      setRecapError(recapUploadErrorMessage(error));
    }
  }

  return (
    <div style={{ margin: "0 auto", maxWidth: "1340px", padding: "28px 32px 54px" }}>
      <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: "26px", paddingBottom: "18px" }}>
        <div style={{ color: "#0f766e", fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", textTransform: "uppercase" }}>Post Pilot · Meeting Recaps</div>
        <h1 style={{ color: "#0f172a", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>TDC Daily Standup — Meeting Recaps</h1>
        <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.55, margin: "7px 0 0", maxWidth: "810px" }}>A central working tool and historical record for generating, reviewing, and tracking evidence-bound TDC Daily Standup recap emails.</p>
      </div>

      <section aria-labelledby="generate-daily-tdc-recap">
        <div style={{ borderLeft: "4px solid #7c3aed", marginBottom: "14px", paddingLeft: "12px" }}>
          <div style={{ color: "#7c3aed", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Daily recap generator</div>
          <h2 id="generate-daily-tdc-recap" style={{ color: "#0f172a", fontSize: "18px", fontWeight: 900, margin: "4px 0 0" }}>Generate Daily TDC Standup Recap</h2>
          <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0" }}>Upload the transcript from the TDC Daily Standup. Manus will generate the meeting recap email, DEV status table, action items, and tracker entry.</p>
        </div>
        <div style={{ background: "#ffffff", border: "1px solid #d8dee8", borderRadius: "10px", boxShadow: "0 2px 10px rgba(15,23,42,0.05)", padding: "18px" }}>
          <div style={{ background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "7px", color: "#5b21b6", fontSize: "11px", lineHeight: 1.5, marginBottom: "15px", padding: "10px 12px" }}><strong>Evidence control:</strong> The uploaded transcript is retained as the source. The generated recap uses only documented information; unclear details are marked <strong>Needs confirmation</strong>. Every new recap begins in <strong>Draft</strong> status.</div>
          <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <label style={{ alignItems: "center", background: "#ffffff", border: "1px dashed #7c3aed", borderRadius: "6px", color: "#5b21b6", cursor: "pointer", display: "inline-flex", fontSize: "12px", fontWeight: 850, gap: "7px", padding: "10px 12px" }}><Upload size={15} />{selectedFile ? selectedFile.name : "Choose transcript (.docx or .txt)"}<input type="file" accept=".docx,.txt" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} style={{ display: "none" }} /></label>
            <button type="button" onClick={generateRecap} disabled={!selectedFile || createRecap.isPending} style={{ alignItems: "center", background: !selectedFile || createRecap.isPending ? "#94a3b8" : "#0f172a", border: "none", borderRadius: "6px", color: "#ffffff", cursor: !selectedFile || createRecap.isPending ? "not-allowed" : "pointer", display: "inline-flex", fontSize: "12px", fontWeight: 850, gap: "7px", padding: "10px 13px" }}>{createRecap.isPending ? <LoaderCircle className="animate-spin" size={15} /> : <Sparkles size={15} />}{createRecap.isPending ? "Analyzing transcript…" : "Generate Recap"}</button>
            <span style={{ color: "#64748b", fontSize: "11px" }}>No manual re-entry required. Longer transcripts are distilled in parallel; slow requests retry once automatically.</span>
          </div>
          {(recapError || createRecap.error) && <div role="alert" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "11px", marginTop: "12px", padding: "9px 10px" }}>{recapError ?? recapUploadErrorMessage(createRecap.error)}</div>}
        </div>
      </section>

      {isLoading ? <div style={{ color: "#64748b", fontSize: "12px", padding: "28px 0", textAlign: "center" }}>Loading meeting recap history…</div> : <>
        <Tracker records={activeRecords} selectedId={selectedRecord?.id} onSelect={(id) => { setSelectedId(id); window.setTimeout(() => document.getElementById(`meeting-recap-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} onSelectAction={(id) => { setSelectedId(id); window.setTimeout(() => document.getElementById(`meeting-action-items-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }} />
        <SentRecapHistory records={sentRecords} />
        {selectedRecord && <MeetingRecordDetail record={selectedRecord} onStatusChange={(emailStatus) => updateStatus.mutate({ id: selectedRecord.id, emailStatus })} />}
      </>}
    </div>
  );
}
