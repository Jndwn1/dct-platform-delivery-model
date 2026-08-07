// QAScreenReadinessTracker.tsx
// Screen-by-screen QA readiness and confirmation tracker for a QA deployment.
// Spec: pasted_content_150 — tracks Readiness, QA Confirmation, Known Issues, Release Note Status.

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, ChevronDown, ChevronRight, Plus, Save, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
const READINESS_VALUES = ["Ready to Test", "Partially Ready", "Not Ready", "Out of Scope", "Not Functional"] as const;
const QA_CONFIRMATION_VALUES = ["Pending Confirmation", "Confirmed in QA", "Confirmed in QA – Known Issue", "Failed QA Validation", "N/A"] as const;
const RELEASE_NOTE_STATUS_VALUES = ["Pending Confirmation", "Include", "Include – With Known Issue", "Include – With Exclusion", "Exclude – Not Ready", "Exclude – Out of Scope", "Exclude – Not Functional"] as const;

type ReadinessValue = typeof READINESS_VALUES[number];
type QAConfirmationValue = typeof QA_CONFIRMATION_VALUES[number];
type ReleaseNoteStatusValue = typeof RELEASE_NOTE_STATUS_VALUES[number];

interface ScreenRecord {
  id: number;
  screenName: string;
  readiness: string | null;
  qaConfirmation: string | null;
  knownIssueFlag: boolean | null;
  knownIssueDescription: string | null;
  knownIssueWorkaround: string | null;
  knownIssueInvestigationStatus: string | null;
  knownIssueAdoItem: string | null;
  releaseNoteStatus: string | null;
  whatsAvailable: string | null;
  whatsNotAvailable: string | null;
  qaValidationGuidance: string | null;
  baNotes: string | null;
  whatChanged: string | null;
  adoItem: string | null;
  confirmationHistory: string | null;
}

// ─── Color helpers ────────────────────────────────────────────────────────────
function readinessBadge(r: string | null) {
  const v = r ?? "Ready to Test";
  if (v === "Ready to Test") return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
  if (v === "Partially Ready") return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
  if (v === "Not Ready") return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
  if (v === "Out of Scope") return { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" };
  return { bg: "#faf5ff", text: "#6b21a8", border: "#e9d5ff" }; // Not Functional
}

function confirmationBadge(c: string | null) {
  const v = c ?? "Pending Confirmation";
  if (v === "Confirmed in QA") return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
  if (v === "Confirmed in QA – Known Issue") return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
  if (v === "Failed QA Validation") return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
  if (v === "N/A") return { bg: "#f8fafc", text: "#94a3b8", border: "#e2e8f0" };
  return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" }; // Pending
}

function releaseNoteBadge(r: string | null) {
  const v = r ?? "Pending Confirmation";
  if (v === "Include") return { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" };
  if (v.startsWith("Include –")) return { bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" };
  if (v.startsWith("Exclude")) return { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" };
  return { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };
}

function Badge({ label, style }: { label: string; style: { bg: string; text: string; border: string } }) {
  return (
    <span style={{
      fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px",
      backgroundColor: style.bg, color: style.text, border: `1px solid ${style.border}`,
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

// ─── Auto-derive Release Note Status ─────────────────────────────────────────
function deriveReleaseNoteStatus(readiness: string | null, qaConfirmation: string | null, knownIssue: boolean | null): ReleaseNoteStatusValue {
  const r = readiness ?? "Ready to Test";
  const q = qaConfirmation ?? "Pending Confirmation";
  if (r === "Not Ready") return "Exclude – Not Ready";
  if (r === "Out of Scope") return "Exclude – Out of Scope";
  if (r === "Not Functional") return "Exclude – Not Functional";
  if (q === "Confirmed in QA – Known Issue") return "Include – With Known Issue";
  if (q === "Confirmed in QA") return "Include";
  if (q === "Failed QA Validation") return "Exclude – Not Ready";
  return "Pending Confirmation";
}

// ─── Expandable Screen Row ────────────────────────────────────────────────────
function ScreenRow({ record, onUpdate }: { record: ScreenRecord; onUpdate: (id: number, fields: Partial<ScreenRecord>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<ScreenRecord>>({});

  const current = { ...record, ...draft };
  const rBadge = readinessBadge(current.readiness);
  const cBadge = confirmationBadge(current.qaConfirmation);
  const derivedRNS = deriveReleaseNoteStatus(current.readiness, current.qaConfirmation, current.knownIssueFlag ?? false);
  const rnBadge = releaseNoteBadge(derivedRNS);

  const handleSave = () => {
    const finalDraft = { ...draft, releaseNoteStatus: derivedRNS };
    onUpdate(record.id, finalDraft);
    setDraft({});
    setEditing(false);
  };

  const set = (k: keyof ScreenRecord, v: any) => setDraft(d => ({ ...d, [k]: v }));

  return (
    <div style={{ borderBottom: "1px solid #f1f5f9" }}>
      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 160px 220px 12px 180px 180px", gap: "0", padding: "10px 16px", alignItems: "center", cursor: "pointer", backgroundColor: expanded ? "#f8fafc" : "transparent" }}
        onClick={() => setExpanded(e => !e)}>
        <div style={{ color: "#94a3b8" }}>{expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>{current.screenName}</div>
        <div><Badge label={current.readiness ?? "Ready to Test"} style={rBadge} /></div>
        <div><Badge label={current.qaConfirmation ?? "Pending Confirmation"} style={cBadge} /></div>
        <div style={{ textAlign: "center" }}>
          {(current.knownIssueFlag) && (
            <span title="Known Issue" style={{ color: "#d97706", fontSize: "14px" }}>⚠</span>
          )}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b" }}>{current.knownIssueFlag ? (current.knownIssueDescription?.slice(0, 40) ?? "—") : "—"}</div>
        <div><Badge label={derivedRNS} style={rnBadge} /></div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "16px 24px 20px 44px", backgroundColor: "#fafbfc", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{current.screenName} — Details</div>
            {!editing ? (
              <button onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", backgroundColor: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "5px", cursor: "pointer" }}>
                Edit
              </button>
            ) : (
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={(e) => { e.stopPropagation(); handleSave(); }}
                  style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Save size={11} /> Save
                </button>
                <button onClick={(e) => { e.stopPropagation(); setDraft({}); setEditing(false); }}
                  style={{ fontSize: "11px", fontWeight: 600, padding: "4px 12px", backgroundColor: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "5px", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <Field label="Readiness" editing={editing}>
                {editing ? (
                  <select style={selectStyle} value={current.readiness ?? "Ready to Test"} onChange={e => set("readiness", e.target.value)}>
                    {READINESS_VALUES.map(v => <option key={v}>{v}</option>)}
                  </select>
                ) : <Badge label={current.readiness ?? "Ready to Test"} style={rBadge} />}
              </Field>
              <Field label="QA Confirmation" editing={editing}>
                {editing ? (
                  <select style={selectStyle} value={current.qaConfirmation ?? "Pending Confirmation"} onChange={e => set("qaConfirmation", e.target.value)}>
                    {QA_CONFIRMATION_VALUES.map(v => <option key={v}>{v}</option>)}
                  </select>
                ) : <Badge label={current.qaConfirmation ?? "Pending Confirmation"} style={cBadge} />}
              </Field>
              <Field label="What's Available in QA" editing={editing}>
                {editing ? <textarea style={textareaStyle} value={current.whatsAvailable ?? ""} onChange={e => set("whatsAvailable", e.target.value)} rows={3} /> : <Text v={current.whatsAvailable} />}
              </Field>
              <Field label="What's Not Available" editing={editing}>
                {editing ? <textarea style={textareaStyle} value={current.whatsNotAvailable ?? ""} onChange={e => set("whatsNotAvailable", e.target.value)} rows={2} /> : <Text v={current.whatsNotAvailable} />}
              </Field>
              <Field label="QA Validation Guidance" editing={editing}>
                {editing ? <textarea style={textareaStyle} value={current.qaValidationGuidance ?? ""} onChange={e => set("qaValidationGuidance", e.target.value)} rows={3} /> : <Text v={current.qaValidationGuidance} />}
              </Field>
              <Field label="Related ADO Item" editing={editing}>
                {editing ? <input style={inputStyle} value={current.adoItem ?? ""} onChange={e => set("adoItem", e.target.value)} placeholder="e.g. Tech Story 1449426" /> : <Text v={current.adoItem} />}
              </Field>
            </div>

            {/* Right column — Known Issue */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ backgroundColor: current.knownIssueFlag ? "#fffbeb" : "#f8fafc", border: `1px solid ${current.knownIssueFlag ? "#fde68a" : "#e2e8f0"}`, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <AlertTriangle size={14} color={current.knownIssueFlag ? "#d97706" : "#94a3b8"} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: current.knownIssueFlag ? "#92400e" : "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>Known Issue</span>
                  {editing && (
                    <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b", cursor: "pointer" }}>
                      <input type="checkbox" checked={current.knownIssueFlag ?? false} onChange={e => set("knownIssueFlag", e.target.checked)} />
                      Has Known Issue
                    </label>
                  )}
                </div>
                {current.knownIssueFlag ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <Field label="Issue Description" editing={editing}>
                      {editing ? <textarea style={textareaStyle} value={current.knownIssueDescription ?? ""} onChange={e => set("knownIssueDescription", e.target.value)} rows={2} /> : <Text v={current.knownIssueDescription} />}
                    </Field>
                    <Field label="Workaround" editing={editing}>
                      {editing ? <textarea style={textareaStyle} value={current.knownIssueWorkaround ?? ""} onChange={e => set("knownIssueWorkaround", e.target.value)} rows={2} /> : <Text v={current.knownIssueWorkaround} />}
                    </Field>
                    <Field label="Investigation Status" editing={editing}>
                      {editing ? <input style={inputStyle} value={current.knownIssueInvestigationStatus ?? ""} onChange={e => set("knownIssueInvestigationStatus", e.target.value)} placeholder="e.g. Under investigation" /> : <Text v={current.knownIssueInvestigationStatus} />}
                    </Field>
                    <Field label="ADO Item" editing={editing}>
                      {editing ? <input style={inputStyle} value={current.knownIssueAdoItem ?? ""} onChange={e => set("knownIssueAdoItem", e.target.value)} placeholder="e.g. Bug 1234567" /> : <Text v={current.knownIssueAdoItem} />}
                    </Field>
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>No known issues for this screen.</div>
                )}
              </div>

              <Field label="Release Note Status (Auto-derived)" editing={false}>
                <Badge label={derivedRNS} style={rnBadge} />
                <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "4px" }}>Automatically calculated from Readiness + QA Confirmation.</div>
              </Field>

              <Field label="BA Notes" editing={editing}>
                {editing ? <textarea style={textareaStyle} value={current.baNotes ?? ""} onChange={e => set("baNotes", e.target.value)} rows={3} /> : <Text v={current.baNotes} />}
              </Field>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function Field({ label, editing, children }: { label: string; editing: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
      {children}
    </div>
  );
}
function Text({ v }: { v: string | null | undefined }) {
  return <div style={{ fontSize: "12px", color: v ? "#1e293b" : "#94a3b8" }}>{v || "—"}</div>;
}
const selectStyle: React.CSSProperties = { width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px", fontSize: "12px", backgroundColor: "white" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px", fontSize: "12px" };
const textareaStyle: React.CSSProperties = { width: "100%", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px", fontSize: "12px", resize: "vertical" };

// ─── Add Screen Form ──────────────────────────────────────────────────────────
const ROGER_SCREENS = ["My Clients Page","Trial Balance","Line Mappings","Book Return Review (BRR)","Journal Entries","Master Data","Prior Year Data","Sign Off","Rollforward","Provision Reference Data","TDC Outbound to IMS","Roger UI Core Screens"];

function AddScreenForm({ deploymentId, onAdded }: { deploymentId: string; onAdded: () => void }) {
  const [screenName, setScreenName] = useState("");
  const upsert = trpc.qaScreenRecords.upsertScreen.useMutation({ onSuccess: () => { setScreenName(""); onAdded(); } });
  return (
    <div style={{ display: "flex", gap: "8px", padding: "10px 16px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
      <select style={{ ...selectStyle, flex: 1 }} value={screenName} onChange={e => setScreenName(e.target.value)}>
        <option value="">— Add a screen —</option>
        {ROGER_SCREENS.map(s => <option key={s}>{s}</option>)}
        <option value="__custom__">Other (type below)</option>
      </select>
      {screenName === "__custom__" && (
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Screen name..." onChange={e => setScreenName(e.target.value)} />
      )}
      <button
        disabled={!screenName || screenName === "__custom__" || upsert.isPending}
        onClick={() => upsert.mutate({ deploymentId, screenName })}
        style={{ display: "flex", alignItems: "center", gap: "4px", padding: "5px 14px", backgroundColor: "#0f1623", color: "white", border: "none", borderRadius: "5px", fontSize: "11px", fontWeight: 600, cursor: "pointer", opacity: (!screenName || screenName === "__custom__") ? 0.5 : 1 }}
      >
        <Plus size={12} /> Add
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function QAScreenReadinessTracker({ deploymentId, deploymentName }: { deploymentId: string; deploymentName?: string }) {
  const utils = trpc.useUtils();
  const { data: records = [], isLoading } = trpc.qaScreenRecords.listByDeployment.useQuery({ deploymentId });

  const updateMutation = trpc.qaScreenRecords.update.useMutation({
    onSuccess: () => utils.qaScreenRecords.listByDeployment.invalidate({ deploymentId }),
  });

  const handleUpdate = (id: number, fields: Partial<ScreenRecord>) => {
    updateMutation.mutate({ id, ...fields } as any);
  };

  // ── Summary counts ──────────────────────────────────────────────────────────
  const counts = {
    readyToTest: (records as any[]).filter((r: any) => r.readiness === "Ready to Test").length,
    partiallyReady: (records as any[]).filter((r: any) => r.readiness === "Partially Ready").length,
    notReady: (records as any[]).filter((r: any) => r.readiness === "Not Ready").length,
    outOfScope: (records as any[]).filter((r: any) => r.readiness === "Out of Scope").length,
    awaitingConfirmation: (records as any[]).filter((r: any) => r.qaConfirmation === "Pending Confirmation").length,
    confirmedInQA: (records as any[]).filter((r: any) => r.qaConfirmation === "Confirmed in QA" || r.qaConfirmation === "Confirmed in QA – Known Issue").length,
    knownIssues: (records as any[]).filter((r: any) => r.knownIssueFlag).length,
  };

  const summaryCards = [
    { label: "Ready to Test", count: counts.readyToTest, bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
    { label: "Partially Ready", count: counts.partiallyReady, bg: "#fff7ed", text: "#9a3412", border: "#fed7aa" },
    { label: "Not Ready", count: counts.notReady, bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
    { label: "Out of Scope", count: counts.outOfScope, bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
    { label: "Awaiting QA Confirmation", count: counts.awaitingConfirmation, bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
    { label: "Confirmed in QA", count: counts.confirmedInQA, bg: "#f0fdf4", text: "#065f46", border: "#a7f3d0" },
    { label: "Known Issues", count: counts.knownIssues, bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  ];

  return (
    <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginTop: "24px" }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0f1623", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>QA Screen Readiness Tracker</div>
          {deploymentName && <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{deploymentName}</div>}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", backgroundColor: "#1e293b", padding: "4px 10px", borderRadius: "4px" }}>
          {records.length} screen{records.length !== 1 ? "s" : ""} tracked
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "8px", padding: "14px 16px", flexWrap: "wrap", borderBottom: "1px solid #f1f5f9", backgroundColor: "#f8fafc" }}>
        {summaryCards.map(c => (
          <div key={c.label} style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: "8px", padding: "8px 14px", textAlign: "center", minWidth: "90px" }}>
            <div style={{ fontSize: "20px", fontWeight: 800, color: c.text }}>{c.count}</div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: c.text, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: "1.3", marginTop: "2px" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 160px 220px 12px 180px 180px", gap: "0", backgroundColor: "#1e3a5f", padding: "8px 16px" }}>
        {["", "Screen / Area", "Readiness", "QA Confirmation", "", "Known Issue", "Release Note Status"].map((h, i) => (
          <div key={i} style={{ fontSize: "9px", fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
        ))}
      </div>

      {/* Rows */}
      {isLoading ? (
        <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>Loading screens...</div>
      ) : records.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>No screens tracked yet</div>
          <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>Add screens below or use Ask Buddy to auto-populate from deployment notes.</div>
        </div>
      ) : (
        (records as any[]).map((record: any) => (
          <ScreenRow
            key={record.id}
            record={record as any}
            onUpdate={handleUpdate}
          />
        ))
      )}

      {/* Add screen */}
      <AddScreenForm deploymentId={deploymentId} onAdded={() => utils.qaScreenRecords.listByDeployment.invalidate({ deploymentId })} />
    </div>
  );
}
