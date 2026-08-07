// QABuddyPanel — Embedded Ask Buddy workflow for QA Deployment Registry
// Workflow: Paste/Upload Notes → LLM Analysis → Preview per-screen cards → Edit → Approve → Auto-populate Create Deployment
import { useState, useRef } from "react";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, X,
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

// ── Read-only field display ───────────────────────────────────────────────────
function ReadField({ label, value }: { label: string; value: string }) {
  if (!value || value === "Not Provided") return null;
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#1e293b", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "7px 10px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function QABuddyPanel({ onApprove, onClose, inline = false }: QABuddyPanelProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "preview" | "approved">("input");
  const [notes, setNotes] = useState("");
  const [release, setRelease] = useState<AnalyzedRelease | null>(null);
  const [error, setError] = useState("");
  const [selectedScreen, setSelectedScreen] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.qaScreenRecords.analyzeNotes.useMutation({
    onSuccess: (data: any) => {
      if (data?.error) { setError("Analysis failed: " + data.error); setStep("input"); return; }
      setRelease({
        releaseName: data.releaseName ?? "Not Provided",
        deploymentDate: data.deploymentDate ?? "Not Provided",
        platform: data.platform ?? "Roger",
        type: data.type ?? "",
        deploymentOwner: data.deploymentOwner ?? "Not Provided",
        productOwner: data.productOwner ?? "Not Provided",
        adoItem: data.adoItems ?? data.adoItem ?? "Not Provided",
        summary: data.summary ?? "",
        screens: (data.screens ?? []).map((s: any) => ({
          screenName: s.screenName ?? "",
          platform: s.platform ?? "Roger",
          component: s.component ?? "",
          changeType: s.changeType ?? "New",
          // Handle both old flat format and new capabilities[] format from updated LLM prompt
          whatChanged: s.whatChanged ?? (Array.isArray(s.capabilities) && s.capabilities.length > 0
            ? s.capabilities.map((c: any) => `• ${c.name}: ${c.whatChanged ?? ""}`).join("\n")
            : "Not Provided"),
          availableInQa: s.availableInQa ?? "Partial",
          qaTestInstructions: s.qaTestInstructions ?? (Array.isArray(s.capabilities) && s.capabilities.length > 0
            ? s.capabilities.map((c: any) => `• ${c.name}: ${c.qaValidation ?? c.qaTestInstructions ?? ""}`).join("\n")
            : "Not Provided"),
          expectedResult: s.expectedResult ?? (Array.isArray(s.capabilities) && s.capabilities.length > 0
            ? s.capabilities.map((c: any) => c.expectedResult ?? "").filter(Boolean).join("\n")
            : "Not Provided"),
          knownIssues: s.knownIssues ?? s.knownLimitations ?? "Not Provided",
          adoItem: (() => { const capAdos = Array.isArray(s.capabilities) ? s.capabilities.map((c: any) => c.adoItem ?? "").filter((v: string) => v && v !== "Not Provided").join(", ") : ""; return s.adoItem || s.adoItems || capAdos || "Not Provided"; })(),
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

  return (
    <div style={{
      position: inline ? "relative" : "fixed",
      ...(inline ? {} : { top: 0, right: 0, bottom: 0, width: "600px", boxShadow: "-4px 0 24px rgba(0,0,0,0.14)", zIndex: 60, borderLeft: "1px solid #e2e8f0" }),
      ...(inline ? { border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" } : {}),
      backgroundColor: "#ffffff",
      display: "flex", flexDirection: "column", overflowY: "hidden",
    }}>
      {/* Header */}
      {!inline && <div style={{ backgroundColor: "#0f1623", padding: "18px 22px", flexShrink: 0 }}>
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
      </div>}
      {/* Inline step indicator (shown when header is hidden) */}
      {inline && (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "10px 22px 0", backgroundColor: "#0f1623" }}>
          {step !== "input" && (
            <button onClick={() => { setStep("input"); setNotes(""); setRelease(null); setSelectedScreen(""); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "10px", fontWeight: 600, padding: "0 8px 0 0", whiteSpace: "nowrap", flexShrink: 0 }} title="Start Over">↺ Start Over</button>
          )}
          {[
            { id: "input", label: "1. Notes" },
            { id: "analyzing", label: "2. Analyze" },
            { id: "preview", label: "3. Review" },
            { id: "approved", label: "4. Approve" },
          ].map(s => (
            <div key={s.id} style={{
              flex: 1, height: "4px", borderRadius: "2px",
              backgroundColor: step === s.id ? "#7c3aed" : (["analyzing", "preview", "approved"].indexOf(step) > ["analyzing", "preview", "approved"].indexOf(s.id) || step === "approved") ? "#059669" : "rgba(255,255,255,0.15)",
            }} />
          ))}
        </div>
      )}

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

        {/* Step 3 — Preview (read-only Deployment Summary + Screen selector) */}
        {step === "preview" && release && (
          <div>
            {/* Deployment Summary — read-only, Buddy-generated */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "#f0fdf4", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={14} color="#059669" />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>Deployment Summary</span>
                <span style={{ fontSize: "10px", color: "#059669", fontWeight: 600, marginLeft: "auto" }}>Auto-populated by Ask Buddy</span>
              </div>
              <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <ReadField label="Release Name" value={release.releaseName} />
                </div>
                <ReadField label="Deployment Date" value={release.deploymentDate} />
                <ReadField label="Platform" value={release.platform} />
                <ReadField label="Type" value={release.type} />
                <ReadField label="Deployment Owner" value={release.deploymentOwner} />
                <ReadField label="Product Owner" value={release.productOwner} />
                <div style={{ gridColumn: "1 / -1" }}>
                  <ReadField label="ADO Items" value={release.adoItem} />
                </div>
                {release.summary && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <ReadField label="Release Summary" value={release.summary} />
                  </div>
                )}
              </div>
            </div>

            {/* Screen selector — REQUIRED BA interaction */}
            <div style={{ border: "2px solid #1e3a5f", borderRadius: "10px", overflow: "hidden", marginBottom: "16px" }}>
              <div style={{ backgroundColor: "#1e3a5f", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Screen / Capability</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#fbbf24", backgroundColor: "rgba(251,191,36,0.15)", border: "1px solid #fbbf24", borderRadius: "3px", padding: "1px 6px", marginLeft: "auto" }}>REQUIRED</span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                  {release.screens[0]?.screenName ? (
                    <span>Ask Buddy suggests: <strong style={{ color: "#1e3a5f" }}>{release.screens[0].screenName}</strong> — confirm or select the correct Roger screen below.</span>
                  ) : (
                    <span>Select the Roger screen this deployment affects.</span>
                  )}
                </div>
                <select
                  value={selectedScreen}
                  onChange={e => setSelectedScreen(e.target.value)}
                  style={{ width: "100%", fontSize: "13px", padding: "9px 12px", border: `2px solid ${selectedScreen ? "#059669" : "#e2e8f0"}`, borderRadius: "7px", backgroundColor: "white", color: "#0f1623", fontWeight: selectedScreen ? 600 : 400 }}
                >
                  <option value="">Select Roger Screen ▼</option>
                  {["My Clients Page", "Return Filing Page", "Return Structure Summary", "Line Mapping", "Book/Reclass Adjustments", "Book Return Review", "Tax Adjustment", "Book-to-Tax Report", "Book-to-Tax Reconciliation", "1120 Form", "Sign Off", "Other"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {selectedScreen && release.screens[0] && (
                  <div style={{ marginTop: "14px", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                    <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623" }}>{selectedScreen}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 7px", borderRadius: "4px", color: release.screens[0].availableInQa === "Yes" ? "#065f46" : release.screens[0].availableInQa === "No" ? "#991b1b" : "#92400e", backgroundColor: release.screens[0].availableInQa === "Yes" ? "#f0fdf4" : release.screens[0].availableInQa === "No" ? "#fef2f2" : "#fffbeb" }}>
                        {release.screens[0].availableInQa === "Yes" ? "Available in QA" : release.screens[0].availableInQa === "No" ? "Not Available" : "Partially Available"}
                      </span>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      {release.screens[0].whatChanged && release.screens[0].whatChanged !== "Not Provided" && (
                        <ReadField label="What Changed" value={release.screens[0].whatChanged} />
                      )}
                      {release.screens[0].qaTestInstructions && release.screens[0].qaTestInstructions !== "Not Provided" && (
                        <ReadField label="What QA Should Test" value={release.screens[0].qaTestInstructions} />
                      )}
                      {release.screens[0].expectedResult && release.screens[0].expectedResult !== "Not Provided" && (
                        <ReadField label="Expected Results" value={release.screens[0].expectedResult} />
                      )}
                      {release.screens[0].knownIssues && release.screens[0].knownIssues !== "Not Provided" && (
                        <ReadField label="Known Issues / Limitations" value={release.screens[0].knownIssues} />
                      )}
                      {release.screens[0].adoItem && release.screens[0].adoItem !== "Not Provided" && (
                        <ReadField label="ADO Items" value={release.screens[0].adoItem} />
                      )}
                      <div style={{ marginTop: "10px", padding: "8px 10px", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px", fontSize: "11px", color: "#0369a1" }}>
                        📷 Screenshot: <em>Awaiting BA Upload — can be added after deployment record is created</em>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
            <button onClick={() => { if (!selectedScreen) return; const approved = { ...release, screens: release.screens.map((s, i) => i === 0 ? { ...s, screenName: selectedScreen } : s) }; setStep("approved"); setTimeout(() => { onApprove(approved); }, 800); }} disabled={!selectedScreen} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "11px 20px", backgroundColor: selectedScreen ? "#059669" : "#e2e8f0", color: selectedScreen ? "white" : "#94a3b8", border: "none", borderRadius: "7px", fontSize: "13px", fontWeight: 700, cursor: selectedScreen ? "pointer" : "not-allowed" }}>
              <CheckCircle2 size={16} /> Approve &amp; Create Deployment
            </button>
          </div>
        )}
        {step === "analyzing" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => setStep("input")} style={{ padding: "10px 16px", backgroundColor: "white", color: "#64748b", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", cursor: "pointer" }}>Cancel Analysis</button>
          </div>
        )}
        {step === "approved" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button onClick={() => { setStep("input"); setNotes(""); setRelease(null); setSelectedScreen(""); setError(""); }} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0", borderRadius: "7px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>↺ Reset &amp; Analyze New Notes</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
