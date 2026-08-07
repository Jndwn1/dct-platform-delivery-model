// QABuddyPanel — Embedded Ask Buddy workflow for QA Deployment Registry
// Workflow: Paste/Upload Notes → LLM Analysis → Preview per-screen cards → Edit → Approve → Auto-populate Create Deployment
import { useState, useRef } from "react";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Edit2,
  Trash2, Plus, ChevronDown, ChevronUp, X, Info,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AnalyzedScreen {
  screenName: string;
  platform: string;
  component: string;
  changeType: string;
  whatChanged: string;
  availableInQa: string;
  qaTestInstructions: string;
  expectedResult: string;
  knownIssues: string;
  adoItem: string;
  validationStatus: string;
  isBackendOnly: boolean;
}

export interface AnalyzedRelease {
  releaseName: string;
  deploymentDate: string;
  platform: string;
  type: string;
  deploymentOwner: string;
  productOwner: string;
  adoItem: string;
  summary: string;
  screens: AnalyzedScreen[];
}

interface QABuddyPanelProps {
  onApprove: (release: AnalyzedRelease) => void;
  onClose?: () => void;
  inline?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const NEEDS_REVIEW = ["TBD", "Needs BA Confirmation", "Pending Deployment", "Pending Validation", "Conflicting Information"];

function needsReview(val: string) {
  return NEEDS_REVIEW.some(k => val?.toUpperCase().includes(k.toUpperCase()));
}

function FieldValue({ label, value, onEdit }: { label: string; value: string; onEdit: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const flag = needsReview(value);
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        {flag && <span style={{ fontSize: "9px", fontWeight: 700, color: "#d97706", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "3px", padding: "1px 5px" }}>⚠ Needs Review</span>}
        <button onClick={() => { setDraft(value); setEditing(e => !e); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "1px 4px" }}>
          <Edit2 size={10} />
        </button>
      </div>
      {editing ? (
        <div style={{ display: "flex", gap: "6px" }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            style={{ flex: 1, fontSize: "12px", padding: "6px 8px", border: "1px solid #7c3aed", borderRadius: "5px", resize: "vertical", minHeight: "60px" }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <button onClick={() => { onEdit(draft); setEditing(false); }} style={{ fontSize: "10px", padding: "4px 8px", backgroundColor: "#7c3aed", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ fontSize: "10px", padding: "4px 8px", backgroundColor: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "4px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: "12px", color: flag ? "#92400e" : "#1e293b",
          backgroundColor: flag ? "#fffbeb" : "#f8fafc",
          border: `1px solid ${flag ? "#fde68a" : "#e2e8f0"}`,
          borderRadius: "5px", padding: "6px 10px", lineHeight: "1.5",
        }}>
          {value || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Not provided</span>}
        </div>
      )}
    </div>
  );
}

function ScreenCard({ screen, index, onChange, onRemove }: {
  screen: AnalyzedScreen;
  index: number;
  onChange: (updated: AnalyzedScreen) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const set = (key: keyof AnalyzedScreen, val: string | boolean) =>
    onChange({ ...screen, [key]: val });

  const hasFlags = [screen.whatChanged, screen.availableInQa, screen.qaTestInstructions, screen.expectedResult, screen.knownIssues, screen.adoItem]
    .some(v => needsReview(String(v)));

  return (
    <div style={{ border: `2px solid ${hasFlags ? "#fde68a" : "#e2e8f0"}`, borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: screen.isBackendOnly ? "#f0f9ff" : "#f8fafc", cursor: "pointer" }}
        onClick={() => setOpen(o => !o)}
      >
        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: screen.isBackendOnly ? "#0284c7" : "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white", flexShrink: 0 }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{screen.screenName}</div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>{screen.platform} · {screen.changeType} {screen.isBackendOnly ? "· Backend Only" : ""}</div>
        </div>
        {hasFlags && <span style={{ fontSize: "9px", fontWeight: 700, color: "#d97706", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "3px", padding: "2px 6px" }}>⚠ Review Needed</span>}
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: screen.availableInQa === "Yes" ? "#059669" : screen.availableInQa === "No" ? "#dc2626" : "#d97706", backgroundColor: screen.availableInQa === "Yes" ? "#f0fdf4" : screen.availableInQa === "No" ? "#fef2f2" : "#fffbeb", border: "1px solid currentColor", borderRadius: "4px", padding: "2px 7px" }}>{screen.availableInQa}</span>
          <button onClick={e => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: "2px" }}><Trash2 size={14} /></button>
          {open ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
      </div>
      {open && (
        <div style={{ padding: "16px", backgroundColor: "white" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Platform</label>
              <select value={screen.platform} onChange={e => set("platform", e.target.value)} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px" }}>
                {["Roger", "PDC", "TDC", "Integration", "Both"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Change Type</label>
              <select value={screen.changeType} onChange={e => set("changeType", e.target.value)} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px" }}>
                {["New", "Enhanced", "Updated", "Fixed", "Configuration"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Available in QA</label>
              <select value={screen.availableInQa} onChange={e => set("availableInQa", e.target.value)} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px" }}>
                {["Yes", "Partial", "Pending Validation", "No"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "3px" }}>Validation Status</label>
              <select value={screen.validationStatus} onChange={e => set("validationStatus", e.target.value)} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #e2e8f0", borderRadius: "5px" }}>
                {["Not Started", "In Progress", "Passed", "Failed", "Needs Confirmation"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>
          <FieldValue label="What Changed" value={screen.whatChanged} onEdit={v => set("whatChanged", v)} />
          <FieldValue label="What QA Should Test" value={screen.qaTestInstructions} onEdit={v => set("qaTestInstructions", v)} />
          <FieldValue label="Expected Result" value={screen.expectedResult} onEdit={v => set("expectedResult", v)} />
          <FieldValue label="Known Issues / Limitations" value={screen.knownIssues} onEdit={v => set("knownIssues", v)} />
          <FieldValue label="Related ADO Item" value={screen.adoItem} onEdit={v => set("adoItem", v)} />
        </div>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function QABuddyPanel({ onApprove, onClose, inline = false }: QABuddyPanelProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "preview" | "approved">("input");
  const [notes, setNotes] = useState("");
  const [release, setRelease] = useState<AnalyzedRelease | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.qaScreenRecords.analyzeNotes.useMutation({
    onSuccess: (data: any) => {
      if (data?.error) { setError("Analysis failed: " + data.error); setStep("input"); return; }
      setRelease({
        releaseName: data.releaseName ?? "TBD",
        deploymentDate: data.deploymentDate ?? "TBD",
        platform: data.platform ?? "TBD",
        type: data.type ?? "TBD",
        deploymentOwner: data.deploymentOwner ?? "TBD",
        productOwner: data.productOwner ?? "TBD",
        adoItem: data.adoItem ?? "TBD",
        summary: data.summary ?? "",
        screens: (data.screens ?? []).map((s: any) => ({
          screenName: s.screenName ?? "Needs BA Confirmation",
          platform: s.platform ?? "Roger",
          component: s.component ?? "TBD",
          changeType: s.changeType ?? "Updated",
          whatChanged: s.whatChanged ?? "TBD",
          availableInQa: s.availableInQa ?? "Pending Validation",
          qaTestInstructions: s.qaTestInstructions ?? "TBD",
          expectedResult: s.expectedResult ?? "TBD",
          knownIssues: s.knownIssues ?? "None identified",
          adoItem: s.adoItem ?? "TBD",
          validationStatus: s.validationStatus ?? "Not Started",
          isBackendOnly: s.isBackendOnly ?? false,
        })),
      });
      setStep("preview");
    },
    onError: (err: any) => { setError("Analysis error: " + err.message); setStep("input"); },
  });

  const handleAnalyze = () => {
    if (!notes.trim()) { setError("Please paste or upload deployment notes first."); return; }
    setError("");
    setStep("analyzing");
    analyzeMutation.mutate({ notes });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNotes(prev => prev + (prev ? "\n\n" : "") + (ev.target?.result as string));
    reader.readAsText(file);
  };

  const updateScreen = (i: number, updated: AnalyzedScreen) => {
    if (!release) return;
    const screens = [...release.screens];
    screens[i] = updated;
    setRelease({ ...release, screens });
  };

  const removeScreen = (i: number) => {
    if (!release) return;
    setRelease({ ...release, screens: release.screens.filter((_, idx) => idx !== i) });
  };

  const addScreen = () => {
    if (!release) return;
    setRelease({
      ...release,
      screens: [...release.screens, {
        screenName: "New Screen", platform: "Roger", component: "TBD",
        changeType: "Updated", whatChanged: "TBD", availableInQa: "Pending Validation",
        qaTestInstructions: "TBD", expectedResult: "TBD", knownIssues: "None identified",
        adoItem: "TBD", validationStatus: "Not Started", isBackendOnly: false,
      }],
    });
  };

  const totalFlags = release?.screens.filter(s =>
    [s.whatChanged, s.availableInQa, s.qaTestInstructions, s.expectedResult, s.knownIssues, s.adoItem].some(v => needsReview(String(v)))
  ).length ?? 0;

  const summaryFlags = release ? [release.releaseName, release.deploymentDate, release.platform, release.deploymentOwner, release.productOwner].filter(v => needsReview(v)).length : 0;

  return (
    <div style={{
      position: inline ? "relative" : "fixed",
      ...(inline ? {} : { top: 0, right: 0, bottom: 0, width: "600px", boxShadow: "-4px 0 24px rgba(0,0,0,0.14)", zIndex: 60, borderLeft: "1px solid #e2e8f0" }),
      ...(inline ? { border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" } : {}),
      backgroundColor: "#ffffff",
      display: "flex", flexDirection: "column", overflowY: "hidden",
    }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0f1623", padding: "18px 22px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "white", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>🐱</span> Ask Buddy — QA Release Notes
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              {step === "input" && "Paste or upload DEV/QA notes to generate structured release notes"}
              {step === "analyzing" && "Analyzing notes — please wait..."}
              {step === "preview" && `Preview generated — ${release?.screens.length ?? 0} screens identified`}
              {step === "approved" && "Approved — ready to create deployment"}
            </div>
          </div>
          {!inline && onClose && <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={18} /></button>}
        </div>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
          {[
            { id: "input", label: "1. Notes" },
            { id: "analyzing", label: "2. Analyze" },
            { id: "preview", label: "3. Preview & Edit" },
            { id: "approved", label: "4. Approve" },
          ].map(s => (
            <div key={s.id} style={{
              flex: 1, height: "4px", borderRadius: "2px",
              backgroundColor: step === s.id ? "#7c3aed" : (["analyzing", "preview", "approved"].indexOf(step) > ["analyzing", "preview", "approved"].indexOf(s.id) || step === "approved") ? "#059669" : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>

        {/* Step 1 — Input */}
        {step === "input" && (
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#1e293b" }}>
                <Upload size={14} /> Upload Notes File
              </button>
              <input ref={fileRef} type="file" accept=".txt,.md,.docx,.pdf" style={{ display: "none" }} onChange={handleFileUpload} />
              <div style={{ fontSize: "11px", color: "#64748b", display: "flex", alignItems: "center" }}>Supports .txt, .md files</div>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={"Paste DEV/QA deployment notes here...\n\nExample:\n• Gary confirmed the following was deployed to QA today:\n• Roger dashboard layout and navigation\n• Trial balance grid with filtering and sorting\n• Override mapping fix — NOT in today's build"}
              style={{ width: "100%", minHeight: "280px", fontSize: "12px", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", resize: "vertical", fontFamily: "system-ui, sans-serif", lineHeight: "1.6", boxSizing: "border-box" }}
            />
            {error && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "10px 12px", marginTop: "10px" }}>
                <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
                <span style={{ fontSize: "12px", color: "#991b1b" }}>{error}</span>
              </div>
            )}
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "12px 14px", marginTop: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", marginBottom: "6px" }}>Ask Buddy will identify:</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px" }}>
                {["Screens affected", "What changed per screen", "What QA should test", "What is NOT available", "Backend/API changes", "BA Follow-Up items", "Known issues", "Validation status"].map(item => (
                  <div key={item} style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                    <CheckCircle2 size={10} color="#2563eb" />
                    <span style={{ fontSize: "11px", color: "#1e293b" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Analyzing */}
        {step === "analyzing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "16px" }}>
            <Loader2 size={40} color="#7c3aed" style={{ animation: "spin 1s linear infinite" }} />
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f1623" }}>Analyzing deployment notes...</div>
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", maxWidth: "300px", lineHeight: "1.6" }}>Ask Buddy is identifying screens, changes, QA instructions, and any items requiring BA confirmation.</div>
          </div>
        )}

        {/* Step 3 — Preview */}
        {step === "preview" && release && (
          <div>
            {(totalFlags > 0 || summaryFlags > 0) && (
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
                <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: "1px" }} />
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e" }}>{totalFlags + summaryFlags} field(s) require BA review</div>
                  <div style={{ fontSize: "11px", color: "#92400e", marginTop: "2px" }}>Fields marked ⚠ contain TBD or Needs BA Confirmation. Review and correct before approving.</div>
                </div>
              </div>
            )}

            {/* Deployment Summary */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>Deployment Summary</span>
                {summaryFlags > 0 && <span style={{ fontSize: "9px", fontWeight: 700, color: "#d97706", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "3px", padding: "2px 6px" }}>⚠ {summaryFlags} fields need review</span>}
              </div>
              <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Release Name", key: "releaseName" as const },
                  { label: "Deployment Date", key: "deploymentDate" as const },
                  { label: "Platform", key: "platform" as const },
                  { label: "Type", key: "type" as const },
                  { label: "Deployment Owner", key: "deploymentOwner" as const },
                  { label: "Product Owner", key: "productOwner" as const },
                  { label: "ADO Item", key: "adoItem" as const },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: f.key === "releaseName" ? "1 / -1" : undefined }}>
                    <FieldValue
                      label={f.label}
                      value={release[f.key]}
                      onEdit={v => setRelease({ ...release, [f.key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Screens */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>Screens / Capabilities ({release.screens.length})</div>
              <button onClick={addScreen} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600, color: "#7c3aed", background: "none", border: "1px solid #7c3aed", borderRadius: "5px", padding: "4px 10px", cursor: "pointer" }}>
                <Plus size={12} /> Add Screen
              </button>
            </div>
            {release.screens.map((screen, i) => (
              <ScreenCard key={i} screen={screen} index={i} onChange={s => updateScreen(i, s)} onRemove={() => removeScreen(i)} />
            ))}
            {release.screens.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "12px", border: "1px dashed #e2e8f0", borderRadius: "8px" }}>
                No screens identified. Click "Add Screen" to add one manually.
              </div>
            )}
          </div>
        )}

        {/* Step 4 — Approved */}
        {step === "approved" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "16px" }}>
            <CheckCircle2 size={48} color="#059669" />
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f1623" }}>Release Notes Approved</div>
            <div style={{ fontSize: "12px", color: "#64748b", textAlign: "center", maxWidth: "320px", lineHeight: "1.6" }}>The approved information is being transferred to Create Deployment. No manual copying required.</div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div style={{ borderTop: "1px solid #e2e8f0", padding: "16px 22px", flexShrink: 0, backgroundColor: "#f8fafc" }}>
        {step === "input" && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleAnalyze} disabled={!notes.trim()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 20px", backgroundColor: notes.trim() ? "#7c3aed" : "#e2e8f0", color: notes.trim() ? "white" : "#94a3b8", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: 700, cursor: notes.trim() ? "pointer" : "not-allowed" }}>
              <FileText size={16} /> Generate QA Release Notes
            </button>
            <button onClick={onClose} style={{ padding: "11px 16px", backgroundColor: "white", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
          </div>
        )}
        {step === "preview" && release && (
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setStep("input")} style={{ padding: "10px 16px", backgroundColor: "white", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>← Back to Notes</button>
            <button onClick={() => {
              const draft = { ...release, releaseName: release.releaseName, deploymentDate: release.deploymentDate };
              localStorage.setItem("qa_buddy_draft", JSON.stringify(draft));
            }} style={{ padding: "10px 16px", backgroundColor: "white", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>Save Draft</button>
            <button onClick={() => { setStep("approved"); setTimeout(() => { onApprove(release); }, 800); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 20px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
              <CheckCircle2 size={16} /> Approve &amp; Create Deployment
            </button>
          </div>
        )}
        {step === "analyzing" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => setStep("input")} style={{ padding: "10px 16px", backgroundColor: "white", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>Cancel Analysis</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
