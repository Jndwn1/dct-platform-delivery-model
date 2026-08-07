// QABuddyPanel — Simple Ask Buddy chat for QA Release Notes
// BA pastes DEV/QA notes → Ask Buddy returns formatted release notes → BA copies into Create Deployment
import { useState, useRef } from "react";
import { Upload, Loader2, Copy, Check, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Keep AnalyzedRelease exported so QADeploymentRegistry doesn't break on import
export interface AnalyzedScreen {
  screenName: string; platform: string; component: string; changeType: string;
  whatChanged: string; availableInQa: string; qaTestInstructions: string;
  expectedResult: string; knownIssues: string; adoItem: string;
  validationStatus: string; isBackendOnly: boolean;
}
export interface AnalyzedRelease {
  releaseName: string; deploymentDate: string; platform: string; type: string;
  deploymentOwner: string; productOwner: string; adoItem: string; summary: string;
  screens: AnalyzedScreen[];
}

interface QABuddyPanelProps {
  onApprove?: (release: AnalyzedRelease) => void;
  onClose?: () => void;
  inline?: boolean;
}

export default function QABuddyPanel({ onClose, inline }: QABuddyPanelProps) {
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState("");
  const [step, setStep] = useState<"input" | "loading" | "result">("input");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.askBuddy.chat.useMutation({
    onSuccess: (data: any) => {
      setResponse(data.text ?? "No response received.");
      setStep("result");
    },
    onError: (err: any) => {
      setError("Analysis failed: " + err.message);
      setStep("input");
    },
  });

  const handleAnalyze = () => {
    if (!notes.trim()) { setError("Please paste or upload deployment notes first."); return; }
    setError("");
    setStep("loading");
    chatMutation.mutate({
      messages: [{ role: "user", content: `Please generate QA release notes from the following deployment notes:\n\n${notes}` }],
      discoveryPagePath: "/qa-deployment-registry",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNotes(prev => prev + (prev ? "\n\n" : "") + (ev.target?.result as string));
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleReset = () => {
    setNotes(""); setResponse(""); setError(""); setStep("input");
  };

  return (
    <div style={{
      position: inline ? "relative" : "fixed" as any,
      ...(inline ? { border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" } : { top: 0, right: 0, bottom: 0, width: "520px", boxShadow: "-4px 0 24px rgba(0,0,0,0.15)", zIndex: 60 }),
      backgroundColor: "#ffffff",
      display: "flex", flexDirection: "column" as any,
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Header */}
      <div style={{ backgroundColor: "#0f1623", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: inline ? "pointer" : "default", flexShrink: 0 }}
        onClick={inline ? () => setCollapsed(c => !c) : undefined}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "20px" }}>🐱</span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Ask Buddy — Prepare QA Release Notes</div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>Paste DEV/QA notes → get formatted release notes to copy into Create Deployment</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {step !== "input" && (
            <button onClick={(e) => { e.stopPropagation(); handleReset(); }}
              style={{ background: "none", border: "1px solid #475569", borderRadius: "5px", color: "#94a3b8", fontSize: "11px", padding: "3px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              <RotateCcw size={11} /> Start Over
            </button>
          )}
          {inline
            ? <span style={{ color: "#94a3b8", fontSize: "11px" }}>{collapsed ? "▼ Expand" : "▲ Collapse"}</span>
            : onClose && <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
          }
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>

          {/* Input step */}
          {step === "input" && (
            <div>
              <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => fileRef.current?.click()}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "white", fontSize: "12px", color: "#374151", cursor: "pointer" }}>
                  <Upload size={13} /> Upload Notes File
                </button>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Supports .txt, .md files</span>
                <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: "none" }} onChange={handleFileUpload} />
              </div>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                placeholder={"Paste DEV/QA deployment notes here...\n\nExample:\nGary confirmed the Mapping Override Policy fix was pushed to QA.\nScreen: Line Mappings\nQA should validate mapping override functionality."}
                style={{ width: "100%", minHeight: "220px", padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", color: "#1e293b", resize: "vertical", fontFamily: "inherit", lineHeight: "1.6", boxSizing: "border-box" as any }} />
              {error && (
                <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", color: "#dc2626" }}>{error}</div>
              )}
              <button onClick={handleAnalyze} disabled={!notes.trim()}
                style={{ marginTop: "12px", width: "100%", padding: "11px", backgroundColor: notes.trim() ? "#059669" : "#94a3b8", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: notes.trim() ? "pointer" : "not-allowed" }}>
                🔍 Generate QA Release Notes
              </button>
              <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", fontSize: "11px", color: "#0369a1" }}>
                <strong>How to use:</strong> Paste the raw deployment notes from the dev team. Ask Buddy will generate formatted QA release notes. Copy the result and paste into the <strong>Create Deployment</strong> form fields below.
              </div>
            </div>
          )}

          {/* Loading step */}
          {step === "loading" && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <Loader2 size={36} style={{ color: "#059669", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>Generating QA Release Notes...</div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "6px" }}>Ask Buddy is analyzing your deployment notes</div>
            </div>
          )}

          {/* Result step */}
          {step === "result" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669" }}>✅ QA Release Notes Ready</div>
                <button onClick={handleCopy}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", border: "1px solid #059669", borderRadius: "6px", background: copied ? "#059669" : "white", color: copied ? "white" : "#059669", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                  {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Release Notes</>}
                </button>
              </div>
              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px", fontSize: "12px", color: "#1e293b", lineHeight: "1.8", whiteSpace: "pre-wrap", maxHeight: "440px", overflowY: "auto" }}>
                {response}
              </div>
              <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", fontSize: "11px", color: "#92400e" }}>
                <strong>Next step:</strong> Copy the release notes above, then click <strong>+ Create Deployment</strong> below to add a new registry entry. Paste the relevant sections into the Summary and Release Notes fields.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
