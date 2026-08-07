import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AnalyzedDeploymentScreen {
  screenName: string;
  releaseStatus: "Available in QA" | "Partially Available" | "Not Included in This Deployment";
  changeType: string;
  whatChanged: string;
  newFunctionality: string;
  fixesIncluded: string;
  qaValidationGuidance: string;
  knownLimitations: string;
  functionalityNotIncluded: string;
  dependencies: string;
  adoWorkItems: string;
}

export interface AnalyzedDeployment {
  releaseName: string;
  summary: string;
  knownLimitations: string;
  dependencies: string;
  qaConsiderations: string;
  screens: AnalyzedDeploymentScreen[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROGER_SCREENS = [
  "My Clients Page",
  "Return Filing Page",
  "Return Structure Summary",
  "Line Mapping",
  "Book/Reclass Adjustments",
  "Book Return Review",
  "Tax Adjustment",
  "Book-to-Tax Report",
  "Book-to-Tax Reconciliation",
  "1120 Form",
  "Sign Off",
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Available in QA":                  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0" },
  "Partially Available":              { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  "Not Included in This Deployment":  { bg: "#fef2f2", text: "#991b1b", border: "#fecaca" },
};

const NAVY = "#1e3a5f";

// ─── Screen Card ──────────────────────────────────────────────────────────────
function ScreenCard({
  screen,
  index,
  onUpdate,
  onRemove,
}: {
  screen: AnalyzedDeploymentScreen;
  index: number;
  onUpdate: (i: number, field: keyof AnalyzedDeploymentScreen, value: string) => void;
  onRemove: (i: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const sc = STATUS_COLORS[screen.releaseStatus] ?? STATUS_COLORS["Available in QA"];

  const Field = ({ label, field, multiline = false }: { label: string; field: keyof AnalyzedDeploymentScreen; multiline?: boolean }) => (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "2px" }}>{label}</div>
      {editing ? (
        multiline ? (
          <textarea
            value={screen[field] as string}
            onChange={e => onUpdate(index, field, e.target.value)}
            rows={3}
            style={{ width: "100%", fontSize: "12px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical", fontFamily: "inherit" }}
          />
        ) : (
          <input
            value={screen[field] as string}
            onChange={e => onUpdate(index, field, e.target.value)}
            style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontFamily: "inherit" }}
          />
        )
      ) : (
        <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
          {(screen[field] as string) || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>—</span>}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ border: `1px solid ${sc.border}`, borderRadius: "8px", marginBottom: "12px", overflow: "hidden" }}>
      {/* Card header */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", backgroundColor: sc.bg, cursor: "pointer" }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: "12px", fontWeight: 700, color: sc.text, flex: 1 }}>
          {index + 1}. {screen.screenName || "Unnamed Screen"}
        </span>
        <span style={{ fontSize: "10px", fontWeight: 700, color: sc.text, backgroundColor: "white", border: `1px solid ${sc.border}`, borderRadius: "4px", padding: "2px 7px" }}>
          {screen.releaseStatus}
        </span>
        {editing ? (
          <button onClick={e => { e.stopPropagation(); setEditing(false); }} style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Done</button>
        ) : (
          <button onClick={e => { e.stopPropagation(); setEditing(true); setExpanded(true); }} style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "#475569", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
        )}
        <button onClick={e => { e.stopPropagation(); onRemove(index); }} style={{ fontSize: "10px", padding: "2px 6px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>✕</button>
        <span style={{ fontSize: "12px", color: "#94a3b8" }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {/* Card body */}
      {expanded && (
        <div style={{ padding: "14px", backgroundColor: "white" }}>
          {editing && (
            <div style={{ marginBottom: "10px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Screen Name</div>
              <select
                value={ROGER_SCREENS.includes(screen.screenName) ? screen.screenName : "__custom__"}
                onChange={e => { if (e.target.value !== "__custom__") onUpdate(index, "screenName", e.target.value); }}
                style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginBottom: "4px" }}
              >
                <option value="__custom__">Custom / Other Screen</option>
                {ROGER_SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {!ROGER_SCREENS.includes(screen.screenName) && (
                <input value={screen.screenName} onChange={e => onUpdate(index, "screenName", e.target.value)} placeholder="Enter screen name" style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }} />
              )}
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px", marginTop: "8px" }}>Release Status</div>
              <select value={screen.releaseStatus} onChange={e => onUpdate(index, "releaseStatus", e.target.value)} style={{ width: "100%", fontSize: "12px", padding: "5px 8px", border: "1px solid #cbd5e1", borderRadius: "4px" }}>
                <option>Available in QA</option>
                <option>Partially Available</option>
                <option>Not Included in This Deployment</option>
              </select>
            </div>
          )}
          <Field label="What Changed" field="whatChanged" multiline />
          <Field label="New Functionality" field="newFunctionality" multiline />
          <Field label="Fixes Included" field="fixesIncluded" multiline />
          <Field label="QA Validation Guidance" field="qaValidationGuidance" multiline />
          <Field label="Known Limitations" field="knownLimitations" multiline />
          <Field label="Functionality Not Included" field="functionalityNotIncluded" multiline />
          <Field label="Dependencies" field="dependencies" />
          <Field label="Related ADO Work Items" field="adoWorkItems" />
        </div>
      )}
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
export default function DeploymentBuddyPanel({
  onApprove,
  onClose,
}: {
  onApprove: (release: AnalyzedDeployment) => void;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [analyzed, setAnalyzed] = useState<AnalyzedDeployment | null>(null);
  const [step, setStep] = useState<"input" | "review">("input");
  const [editingHeader, setEditingHeader] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.deploymentRegistryBuddy.analyzeNotes.useMutation({
    onSuccess: (data: any) => {
      if (data?.screens) {
        setAnalyzed(data as AnalyzedDeployment);
        setStep("review");
      }
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNotes(prev => prev + (prev ? "\n\n" : "") + (ev.target?.result as string));
    reader.readAsText(file);
  };

  const updateScreen = (i: number, field: keyof AnalyzedDeploymentScreen, value: string) => {
    if (!analyzed) return;
    const screens = [...analyzed.screens];
    screens[i] = { ...screens[i], [field]: value };
    setAnalyzed({ ...analyzed, screens });
  };

  const removeScreen = (i: number) => {
    if (!analyzed) return;
    setAnalyzed({ ...analyzed, screens: analyzed.screens.filter((_, idx) => idx !== i) });
  };

  const addScreen = () => {
    if (!analyzed) return;
    setAnalyzed({
      ...analyzed,
      screens: [...analyzed.screens, {
        screenName: "", releaseStatus: "Available in QA", changeType: "Enhancement",
        whatChanged: "", newFunctionality: "None", fixesIncluded: "None",
        qaValidationGuidance: "", knownLimitations: "None identified",
        functionalityNotIncluded: "None", dependencies: "None", adoWorkItems: "",
      }],
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end",
    }}>
      <div style={{
        width: "640px", height: "100vh", backgroundColor: "white",
        display: "flex", flexDirection: "column", boxShadow: "-4px 0 24px rgba(0,0,0,0.2)",
      }}>
        {/* Header */}
        <div style={{ backgroundColor: NAVY, padding: "16px 20px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{ fontSize: "20px" }}>🐱</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "white" }}>Ask Buddy — Prepare QA Release Notes</div>
            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px" }}>
              {step === "input" ? "Paste or upload DEV/QA deployment notes to analyze" : `${analyzed?.screens.length ?? 0} screen(s) identified · Review and approve`}
            </div>
          </div>
          <button onClick={onClose} style={{ color: "#94a3b8", background: "none", border: "none", fontSize: "18px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {step === "input" && (
            <>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                  Paste DEV / QA Deployment Notes
                </div>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={16}
                  placeholder="Paste deployment notes, meeting notes, or ADO work item descriptions here...&#10;&#10;Ask Buddy will identify affected screens and generate structured release notes."
                  style={{ width: "100%", fontSize: "12px", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6" }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{ fontSize: "11px", padding: "6px 12px", backgroundColor: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "5px", cursor: "pointer" }}
                >
                  📎 Upload File (.txt, .md)
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md,.text" style={{ display: "none" }} onChange={handleFileUpload} />
                {notes && (
                  <button onClick={() => setNotes("")} style={{ fontSize: "11px", padding: "6px 12px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "5px", cursor: "pointer" }}>
                    Clear
                  </button>
                )}
              </div>
              <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "12px 14px", marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#0369a1", marginBottom: "4px" }}>What Ask Buddy will generate</div>
                <div style={{ fontSize: "11px", color: "#0c4a6e", lineHeight: "1.6" }}>
                  For each affected screen: Screen Name, Release Status, What Changed, New Functionality, Fixes Included, QA Validation Guidance, Known Limitations, Functionality Not Included, Dependencies, and Related ADO Work Items.
                </div>
              </div>
            </>
          )}

          {step === "review" && analyzed && (
            <>
              {/* Release summary header */}
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
                {editingHeader ? (
                  <>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Release Name</div>
                    <input value={analyzed.releaseName} onChange={e => setAnalyzed({ ...analyzed, releaseName: e.target.value })} style={{ width: "100%", fontSize: "13px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", marginBottom: "8px" }} />
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Summary</div>
                    <textarea value={analyzed.summary} onChange={e => setAnalyzed({ ...analyzed, summary: e.target.value })} rows={3} style={{ width: "100%", fontSize: "12px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical", marginBottom: "8px" }} />
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>Known Limitations</div>
                    <textarea value={analyzed.knownLimitations} onChange={e => setAnalyzed({ ...analyzed, knownLimitations: e.target.value })} rows={2} style={{ width: "100%", fontSize: "12px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical", marginBottom: "8px" }} />
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>QA Considerations</div>
                    <textarea value={analyzed.qaConsiderations} onChange={e => setAnalyzed({ ...analyzed, qaConsiderations: e.target.value })} rows={2} style={{ width: "100%", fontSize: "12px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", resize: "vertical" }} />
                    <button onClick={() => setEditingHeader(false)} style={{ marginTop: "8px", fontSize: "11px", padding: "5px 12px", backgroundColor: "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Done Editing</button>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>{analyzed.releaseName}</div>
                      <button onClick={() => setEditingHeader(true)} style={{ fontSize: "10px", padding: "2px 8px", backgroundColor: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "4px", cursor: "pointer" }}>Edit</button>
                    </div>
                    <div style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5", marginBottom: "8px" }}>{analyzed.summary}</div>
                    {analyzed.knownLimitations && analyzed.knownLimitations !== "None" && (
                      <div style={{ fontSize: "11px", color: "#92400e", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "4px", padding: "6px 10px", marginBottom: "4px" }}>
                        <strong>Known Limitations:</strong> {analyzed.knownLimitations}
                      </div>
                    )}
                    {analyzed.qaConsiderations && (
                      <div style={{ fontSize: "11px", color: "#0369a1", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "4px", padding: "6px 10px" }}>
                        <strong>QA Considerations:</strong> {analyzed.qaConsiderations}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Screen cards */}
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginBottom: "10px" }}>
                Affected Screens ({analyzed.screens.length})
              </div>
              {analyzed.screens.map((screen, i) => (
                <ScreenCard key={i} screen={screen} index={i} onUpdate={updateScreen} onRemove={removeScreen} />
              ))}
              <button
                onClick={addScreen}
                style={{ width: "100%", padding: "8px", fontSize: "12px", color: "#475569", backgroundColor: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "6px", cursor: "pointer", marginTop: "4px" }}
              >
                + Add Screen
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", flexShrink: 0, display: "flex", gap: "8px", alignItems: "center" }}>
          {step === "input" && (
            <>
              <button
                onClick={() => analyzeMutation.mutate({ notes })}
                disabled={!notes.trim() || analyzeMutation.isPending}
                style={{
                  flex: 1, padding: "10px", fontSize: "13px", fontWeight: 700,
                  backgroundColor: !notes.trim() || analyzeMutation.isPending ? "#94a3b8" : NAVY,
                  color: "white", border: "none", borderRadius: "6px",
                  cursor: !notes.trim() || analyzeMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                {analyzeMutation.isPending ? "Analyzing..." : "🔍 Analyze Notes"}
              </button>
              <button onClick={onClose} style={{ padding: "10px 16px", fontSize: "12px", backgroundColor: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          )}
          {step === "review" && analyzed && (
            <>
              <button
                onClick={() => { analyzed && onApprove(analyzed); }}
                style={{ flex: 1, padding: "10px", fontSize: "13px", fontWeight: 700, backgroundColor: "#059669", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
              >
                ✅ Approve & Create Deployment
              </button>
              <button
                onClick={() => { setStep("input"); }}
                style={{ padding: "10px 14px", fontSize: "12px", backgroundColor: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" }}
              >
                ↩ Regenerate
              </button>
              <button onClick={onClose} style={{ padding: "10px 14px", fontSize: "12px", backgroundColor: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer" }}>
                Cancel
              </button>
            </>
          )}
          {analyzeMutation.isError && (
            <div style={{ fontSize: "11px", color: "#dc2626", marginLeft: "8px" }}>Analysis failed. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
}
