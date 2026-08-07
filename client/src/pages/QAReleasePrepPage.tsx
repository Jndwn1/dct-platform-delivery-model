// QA Release Preparation — Single-Screen BA Governance Workflow
// Sections: A. Deployment Notes → B. Buddy Summary → C. Screen-Level QA Scope
//           D. Functionality Confirmation → E. Release Notes Preview → F. Publish
import { useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, ArrowRight, Upload, FileText, Loader2, RefreshCw, Eye, Send, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROGER_SCREENS = [
  "My Clients Page", "Return Filing Page", "Return Structure Summary",
  "Line Mapping", "Book/Reclass Adjustments", "Book Return Review",
  "Tax Adjustment", "Book-to-Tax Report", "Book-to-Tax Reconciliation",
  "1120 Form", "Sign Off", "Other",
];

const NAVY = "#1e3a5f";
const GREEN = "#059669";
const AMBER = "#d97706";
const RED = "#dc2626";
const PURPLE = "#7c3aed";

type ConfirmStatus = "Pending Confirmation" | "Confirmed in QA" | "Not Available" | "Deferred";

interface Capability {
  id: string;
  name: string;
  whatChanged: string;
  qaValidation: string;
  adoItem: string;
  status: ConfirmStatus;
}

interface ScreenGroup {
  screenName: string;
  capabilities: Capability[];
}

interface ReleaseSummary {
  releaseName: string;
  deploymentDate: string;
  environment: string;
  platform: string;
  type: string;
  deploymentOwner: string;
  productOwner: string;
  adoItems: string;
  summary: string;
  knownLimitations: string;
  dependencies: string;
}

type WorkflowStatus = "Draft" | "Awaiting Confirmation" | "QA Confirmed" | "Ready to Publish" | "Published";

const WORKFLOW_STEPS: WorkflowStatus[] = ["Draft", "Awaiting Confirmation", "QA Confirmed", "Ready to Publish", "Published"];

// ── Simulation data ───────────────────────────────────────────────────────────
const SIM_NOTES = `Upcoming Roger QA Deployment\n\nThe My Clients screen has been updated.\n\nEntity Count has been added and should display the number of entities associated with the selected client.\n\nDeliverable Count has been added and should display the number of deliverables associated with the selected client.\n\nApproaching Due Date has been added and should display approaching due-date information for applicable client deliverables.\n\nAverage Completion Percentage was also planned for this screen; however, the team is still determining how and where the Average Completion information will be stored and retrieved.\n\nQA should validate Entity Count, Deliverable Count, and Approaching Due Date.\n\nAverage Completion Percentage should not be considered ready until confirmed.\n\nFeature 100001 – My Clients Metrics\nStory 100002 – Entity and Deliverable Counts\nStory 100003 – Approaching Due Date\nStory 100004 – Average Completion Percentage`;

const SIM_SUMMARY: ReleaseSummary = {
  releaseName: "Roger QA – My Clients",
  deploymentDate: new Date().toISOString().split("T")[0],
  environment: "QA",
  platform: "Roger",
  type: "Feature",
  deploymentOwner: "Not Provided",
  productOwner: "Not Provided",
  adoItems: "Feature 100001, Story 100002, Story 100003, Story 100004",
  summary: "The My Clients screen has been updated with Entity Count, Deliverable Count, and Approaching Due Date. Average Completion % is planned but not yet confirmed for this release.",
  knownLimitations: "Average Completion % is not available — team is still determining storage and retrieval approach.",
  dependencies: "Not Provided",
};

const SIM_SCREENS: ScreenGroup[] = [{
  screenName: "My Clients Page",
  capabilities: [
    { id: "c1", name: "Entity Count", whatChanged: "Entity Count has been added and displays the number of entities associated with the selected client.", qaValidation: "Verify Entity Count displays and accurately represents the entities associated with the client.", adoItem: "Story 100002", status: "Pending Confirmation" },
    { id: "c2", name: "Deliverable Count", whatChanged: "Deliverable Count has been added and displays the number of deliverables associated with the selected client.", qaValidation: "Verify Deliverable Count displays and accurately represents the client's deliverables.", adoItem: "Story 100002", status: "Pending Confirmation" },
    { id: "c3", name: "Approaching Due Date", whatChanged: "Approaching Due Date functionality has been added and displays approaching due-date information for applicable client deliverables.", qaValidation: "Verify approaching due-date information displays for applicable client deliverables.", adoItem: "Story 100003", status: "Pending Confirmation" },
    { id: "c4", name: "Average Completion %", whatChanged: "Planned functionality — team is still determining how and where Average Completion information will be stored and retrieved.", qaValidation: "Do not test. Not available in this release.", adoItem: "Story 100004", status: "Pending Confirmation" },
  ],
}];

// ── Status badge helper ───────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ConfirmStatus }) {
  const cfg: Record<ConfirmStatus, { bg: string; text: string; label: string }> = {
    "Pending Confirmation": { bg: "#fffbeb", text: AMBER, label: "⏳ Pending Confirmation" },
    "Confirmed in QA":      { bg: "#f0fdf4", text: GREEN, label: "✓ Confirmed in QA" },
    "Not Available":        { bg: "#fef2f2", text: RED,   label: "✕ Not Available" },
    "Deferred":             { bg: "#f5f3ff", text: PURPLE, label: "→ Deferred" },
  };
  const c = cfg[status];
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", backgroundColor: c.bg, color: c.text, whiteSpace: "nowrap" }}>
      {c.label}
    </span>
  );
}

// ── Read-only summary field ───────────────────────────────────────────────────
function SummaryField({ label, value }: { label: string; value: string }) {
  if (!value || value === "Not Provided") return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#94a3b8", fontStyle: "italic" }}>Not Provided</div>
    </div>
  );
  return (
    <div style={{ marginBottom: "8px" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.5" }}>{value}</div>
    </div>
  );
}

// ── Release Readiness calculator ─────────────────────────────────────────────
function calcReadiness(screens: ScreenGroup[]) {
  const all = screens.flatMap(s => s.capabilities);
  const confirmed = all.filter(c => c.status === "Confirmed in QA").length;
  const pending   = all.filter(c => c.status === "Pending Confirmation").length;
  const notAvail  = all.filter(c => c.status === "Not Available").length;
  const deferred  = all.filter(c => c.status === "Deferred").length;
  const total     = all.length;
  const canPublish = total > 0 && pending === 0;
  const workflowStatus: WorkflowStatus = total === 0 ? "Draft"
    : pending > 0 ? "Awaiting Confirmation"
    : confirmed === total ? "QA Confirmed"
    : canPublish ? "Ready to Publish"
    : "Awaiting Confirmation";
  return { confirmed, pending, notAvail, deferred, total, canPublish, workflowStatus };
}

// ── Generate release notes text ───────────────────────────────────────────────
function generateReleaseNotes(summary: ReleaseSummary | null, screens: ScreenGroup[]): string {
  if (!summary) return "";
  const lines: string[] = [];
  lines.push("ROGER/DCT QA RELEASE NOTES");
  lines.push("");
  lines.push(`Release Name: ${summary.releaseName}`);
  lines.push(`Deployment Date: ${summary.deploymentDate}`);
  lines.push(`Environment: ${summary.environment}`);
  lines.push(`Platform: ${summary.platform}`);
  lines.push("");
  for (const screen of screens) {
    const confirmed = screen.capabilities.filter(c => c.status === "Confirmed in QA");
    const notAvail  = screen.capabilities.filter(c => c.status === "Not Available");
    const deferred  = screen.capabilities.filter(c => c.status === "Deferred");
    const qaStatus  = confirmed.length === screen.capabilities.length ? "Available in QA"
      : confirmed.length > 0 ? "Partially Available"
      : "Not Available in This Release";
    lines.push(`── ${screen.screenName.toUpperCase()} ──`);
    lines.push(`QA Status: ${qaStatus}`);
    lines.push("");
    if (confirmed.length > 0) {
      lines.push("AVAILABLE IN QA");
      for (const cap of confirmed) {
        lines.push(`\n${cap.name}`);
        lines.push(cap.whatChanged);
        if (cap.qaValidation) lines.push(`QA Validation: ${cap.qaValidation}`);
        if (cap.adoItem && cap.adoItem !== "Not Provided") lines.push(`ADO: ${cap.adoItem}`);
      }
      lines.push("");
    }
    if (notAvail.length > 0) {
      lines.push("NOT AVAILABLE IN THIS RELEASE");
      for (const cap of notAvail) {
        lines.push(`\n${cap.name}`);
        lines.push(cap.whatChanged);
      }
      lines.push("");
    }
    if (deferred.length > 0) {
      lines.push("DEFERRED / FUTURE RELEASE");
      for (const cap of deferred) {
        lines.push(`\n${cap.name}`);
        lines.push(cap.whatChanged);
      }
      lines.push("");
    }
  }
  if (summary.knownLimitations && summary.knownLimitations !== "Not Provided") {
    lines.push("KNOWN LIMITATIONS");
    lines.push(summary.knownLimitations);
    lines.push("");
  }
  if (summary.adoItems && summary.adoItems !== "Not Provided") {
    lines.push("RELATED ADO ITEMS");
    lines.push(summary.adoItems);
    lines.push("");
  }
  return lines.join("\n");
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function QAReleasePrepPage() {
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState<ReleaseSummary | null>(null);
  const [screens, setScreens] = useState<ScreenGroup[]>([]);
  const [published, setPublished] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.qaScreenRecords.analyzeNotes.useMutation({
    onSuccess: (data: any) => {
      if (data?.error) { setAnalyzing(false); return; }
      setSummary({
        releaseName: data.releaseName ?? "Not Provided",
        deploymentDate: data.deploymentDate ?? new Date().toISOString().split("T")[0],
        environment: "QA",
        platform: "Roger",
        type: data.type ?? "Feature",
        deploymentOwner: data.deploymentOwner ?? "Not Provided",
        productOwner: data.productOwner ?? "Not Provided",
        adoItems: data.adoItems ?? data.adoItem ?? "Not Provided",
        summary: data.summary ?? "",
        knownLimitations: data.knownLimitations ?? "Not Provided",
        dependencies: data.dependencies ?? "Not Provided",
      });
      // Build screen groups from LLM response
      const rawScreens: ScreenGroup[] = (data.screens ?? []).map((s: any, si: number) => ({
        screenName: s.screenName ?? "",
        capabilities: (s.capabilities ?? s.functionality ?? []).map((cap: any, ci: number) => ({
          id: `s${si}c${ci}`,
          name: cap.name ?? cap.functionality ?? "Unnamed",
          whatChanged: cap.whatChanged ?? cap.description ?? "Not Provided",
          qaValidation: cap.qaValidation ?? cap.qaTestInstructions ?? "Not Provided",
          adoItem: cap.adoItem ?? cap.adoItems ?? "Not Provided",
          status: "Pending Confirmation" as ConfirmStatus,
        })),
      }));
      setScreens(rawScreens.length > 0 ? rawScreens : [{ screenName: "", capabilities: [] }]);
      setAnalyzing(false);
    },
    onError: () => setAnalyzing(false),
  });

  const handleAnalyze = () => {
    if (!notes.trim()) return;
    setAnalyzing(true);
    setSummary(null);
    setScreens([]);
    setPublished(false);
    analyzeMutation.mutate({ notes });
  };

  const handleSimulation = () => {
    setSimMode(true);
    setNotes(SIM_NOTES);
    setSummary(SIM_SUMMARY);
    setScreens(SIM_SCREENS.map(s => ({ ...s, capabilities: s.capabilities.map(c => ({ ...c })) })));
    setPublished(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setNotes(prev => prev + (prev ? "\n\n" : "") + (ev.target?.result as string));
    reader.readAsText(file);
  };

  const updateCapabilityStatus = useCallback((screenIdx: number, capId: string, status: ConfirmStatus) => {
    setScreens(prev => prev.map((s, si) => si !== screenIdx ? s : {
      ...s,
      capabilities: s.capabilities.map(c => c.id === capId ? { ...c, status } : c),
    }));
  }, []);

  const updateScreenName = useCallback((screenIdx: number, name: string) => {
    setScreens(prev => prev.map((s, si) => si !== screenIdx ? s : { ...s, screenName: name }));
  }, []);

  const readiness = calcReadiness(screens);
  const releaseNotesText = generateReleaseNotes(summary, screens);
  const workflowIdx = WORKFLOW_STEPS.indexOf(published ? "Published" : readiness.workflowStatus);

  const handleCopy = () => {
    navigator.clipboard.writeText(releaseNotesText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handlePublish = () => {
    if (!readiness.canPublish) return;
    setPublished(true);
  };

  const hasContent = summary !== null;

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: NAVY, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: "14px" }}>QA</div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f1623", margin: 0 }}>QA Release Preparation</h1>
              {simMode && <span style={{ fontSize: "10px", fontWeight: 700, color: PURPLE, backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE}`, borderRadius: "4px", padding: "2px 8px" }}>SIMULATION MODE</span>}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>Roger/DCT End-to-End QA Release Governance · Single-Screen BA Workflow</div>
          </div>
          <button onClick={handleSimulation} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: PURPLE, backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE}`, borderRadius: "6px", padding: "7px 14px", cursor: "pointer" }}>
            ▶ BA Workflow Simulation
          </button>
        </div>

        {/* Workflow Status Bar */}
        <div style={{ display: "flex", gap: "0", marginTop: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          {WORKFLOW_STEPS.map((step, i) => {
            const isActive = i === workflowIdx;
            const isDone = i < workflowIdx;
            return (
              <div key={step} style={{
                flex: 1, padding: "10px 8px", textAlign: "center",
                backgroundColor: isActive ? NAVY : isDone ? "#f0fdf4" : "#f8fafc",
                borderRight: i < 4 ? "1px solid #e2e8f0" : "none",
              }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: isActive ? "white" : isDone ? GREEN : "#94a3b8" }}>
                  {isDone ? "✓ " : isActive ? "● " : ""}{step}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── A. Deployment Notes ── */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
        <div style={{ backgroundColor: NAVY, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>A. Deployment Notes</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Paste DEV notes, QA notes, meeting notes, ADO references</div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button onClick={() => fileRef.current?.click()} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: "#475569", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "7px 14px", cursor: "pointer" }}>
              <Upload size={13} /> Upload Notes File
            </button>
            <span style={{ fontSize: "11px", color: "#94a3b8", alignSelf: "center" }}>Supports .txt, .md files</span>
            <input ref={fileRef} type="file" accept=".txt,.md" style={{ display: "none" }} onChange={handleFileUpload} />
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Paste DEV/QA deployment notes here..."
            style={{ width: "100%", minHeight: "140px", fontSize: "13px", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", resize: "vertical", fontFamily: "system-ui, sans-serif", boxSizing: "border-box", color: "#1e293b" }}
          />
          <div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleAnalyze}
              disabled={!notes.trim() || analyzing}
              style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "white", backgroundColor: notes.trim() && !analyzing ? NAVY : "#e2e8f0", border: "none", borderRadius: "7px", padding: "11px 24px", cursor: notes.trim() && !analyzing ? "pointer" : "not-allowed" }}
            >
              {analyzing ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</> : <><FileText size={16} /> Generate QA Release</>}
            </button>
            {hasContent && (
              <button onClick={() => { setSummary(null); setScreens([]); setPublished(false); setSimMode(false); }} style={{ fontSize: "12px", color: "#64748b", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "7px", padding: "11px 16px", cursor: "pointer" }}>
                Clear &amp; Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── B. Buddy Generated Deployment Summary ── */}
      {hasContent && (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f0fdf4", padding: "12px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={15} color={GREEN} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>B. Buddy Generated Deployment Summary</span>
            <span style={{ fontSize: "10px", color: GREEN, fontWeight: 600, marginLeft: "auto" }}>Auto-populated · Read Only</span>
          </div>
          <div style={{ padding: "16px 18px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            <div style={{ gridColumn: "1 / -1" }}><SummaryField label="Release Name" value={summary!.releaseName} /></div>
            <SummaryField label="Deployment Date" value={summary!.deploymentDate} />
            <SummaryField label="Environment" value={summary!.environment} />
            <SummaryField label="Platform" value={summary!.platform} />
            <SummaryField label="Type" value={summary!.type} />
            <SummaryField label="Deployment Owner" value={summary!.deploymentOwner} />
            <SummaryField label="Product Owner" value={summary!.productOwner} />
            <div style={{ gridColumn: "1 / -1" }}><SummaryField label="ADO Items" value={summary!.adoItems} /></div>
            {summary!.summary && <div style={{ gridColumn: "1 / -1" }}><SummaryField label="Release Summary" value={summary!.summary} /></div>}
            {summary!.knownLimitations !== "Not Provided" && <div style={{ gridColumn: "1 / -1" }}><SummaryField label="Known Limitations" value={summary!.knownLimitations} /></div>}
            {summary!.dependencies !== "Not Provided" && <div style={{ gridColumn: "1 / -1" }}><SummaryField label="Dependencies" value={summary!.dependencies} /></div>}
          </div>
        </div>
      )}

      {/* ── C & D. Screen-Level QA Scope + Functionality Confirmation ── */}
      {hasContent && screens.map((screen, screenIdx) => (
        <div key={screenIdx} style={{ border: `2px solid ${NAVY}`, borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
          {/* Screen header */}
          <div style={{ backgroundColor: NAVY, padding: "12px 18px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>C. Screen-Level QA Scope</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>Screen:</span>
              <select
                value={screen.screenName}
                onChange={e => updateScreenName(screenIdx, e.target.value)}
                style={{ fontSize: "12px", fontWeight: 700, padding: "5px 10px", border: `2px solid ${screen.screenName ? "#fbbf24" : "#ef4444"}`, borderRadius: "6px", backgroundColor: "white", color: NAVY }}
              >
                <option value="">Select Roger Screen ▼</option>
                {ROGER_SCREENS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {!screen.screenName && <span style={{ fontSize: "10px", fontWeight: 700, color: "#fbbf24" }}>REQUIRED</span>}
            </div>
          </div>

          {/* Capabilities table */}
          <div style={{ padding: "0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 120px 200px", gap: "0", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "8px 16px" }}>
              {["Functionality", "What Changed", "QA Validation", "ADO Item", "D. Confirmation Status"].map(h => (
                <div key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {screen.capabilities.map(cap => (
              <div key={cap.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr 120px 200px", gap: "0", borderBottom: "1px solid #f1f5f9", padding: "12px 16px", alignItems: "start", backgroundColor: cap.status === "Confirmed in QA" ? "#f0fdf4" : cap.status === "Not Available" ? "#fef2f2" : cap.status === "Deferred" ? "#f5f3ff" : "white" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", paddingRight: "8px" }}>{cap.name}</div>
                <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5", paddingRight: "8px" }}>{cap.whatChanged}</div>
                <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.5", paddingRight: "8px" }}>{cap.qaValidation}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>{cap.adoItem}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <StatusBadge status={cap.status} />
                  <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                    {cap.status !== "Confirmed in QA" && (
                      <button onClick={() => updateCapabilityStatus(screenIdx, cap.id, "Confirmed in QA")} style={{ fontSize: "10px", fontWeight: 700, color: GREEN, backgroundColor: "#f0fdf4", border: `1px solid ${GREEN}`, borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>✓ Confirmed</button>
                    )}
                    {cap.status !== "Not Available" && (
                      <button onClick={() => updateCapabilityStatus(screenIdx, cap.id, "Not Available")} style={{ fontSize: "10px", fontWeight: 700, color: RED, backgroundColor: "#fef2f2", border: `1px solid ${RED}`, borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>✕ Not Available</button>
                    )}
                    {cap.status !== "Deferred" && (
                      <button onClick={() => updateCapabilityStatus(screenIdx, cap.id, "Deferred")} style={{ fontSize: "10px", fontWeight: 700, color: PURPLE, backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE}`, borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>→ Defer</button>
                    )}
                    {cap.status !== "Pending Confirmation" && (
                      <button onClick={() => updateCapabilityStatus(screenIdx, cap.id, "Pending Confirmation")} style={{ fontSize: "10px", color: "#64748b", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "2px 7px", cursor: "pointer" }}>↺ Reset</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {screen.capabilities.length === 0 && (
              <div style={{ padding: "24px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>No capabilities identified. Generate QA Release to populate.</div>
            )}
          </div>
        </div>
      ))}

      {/* ── F. Release Readiness ── */}
      {hasContent && (
        <div style={{ border: `2px solid ${readiness.canPublish ? GREEN : AMBER}`, borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ backgroundColor: readiness.canPublish ? "#f0fdf4" : "#fffbeb", padding: "12px 18px", borderBottom: `1px solid ${readiness.canPublish ? "#bbf7d0" : "#fde68a"}`, display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>F. Release Readiness</span>
            <span style={{ fontSize: "12px", fontWeight: 700, color: readiness.canPublish ? GREEN : AMBER, marginLeft: "auto" }}>
              {published ? "✓ PUBLISHED" : readiness.canPublish ? "● READY TO PUBLISH" : "⏳ AWAITING CONFIRMATION"}
            </span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              {[
                { label: "Confirmed", value: readiness.confirmed, color: GREEN },
                { label: "Pending", value: readiness.pending, color: AMBER },
                { label: "Not Available", value: readiness.notAvail, color: RED },
                { label: "Deferred", value: readiness.deferred, color: PURPLE },
              ].map(m => (
                <div key={m.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginLeft: "auto" }}>
              {!published ? (
                <div>
                  <button
                    onClick={handlePublish}
                    disabled={!readiness.canPublish || !screens.every(s => s.screenName)}
                    style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: "white", backgroundColor: readiness.canPublish && screens.every(s => s.screenName) ? GREEN : "#e2e8f0", border: "none", borderRadius: "7px", padding: "12px 24px", cursor: readiness.canPublish && screens.every(s => s.screenName) ? "pointer" : "not-allowed" }}
                  >
                    <Send size={16} /> Publish QA Release Notes
                  </button>
                  {!readiness.canPublish && (
                    <div style={{ fontSize: "11px", color: AMBER, marginTop: "6px", maxWidth: "320px" }}>
                      All functionality must be confirmed, marked Not Available, or Deferred before release notes can be published.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700, color: GREEN }}>
                  <CheckCircle2 size={20} /> Release Notes Published
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── E. Final Release Notes Preview ── */}
      {hasContent && releaseNotesText && (
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "20px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#f8fafc", padding: "12px 18px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Eye size={15} color={NAVY} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>E. Final Release Notes Preview</span>
            <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "4px" }}>Auto-updates as you confirm functionality</span>
            <button onClick={handleCopy} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 600, color: copySuccess ? GREEN : "#475569", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "5px 12px", cursor: "pointer" }}>
              {copySuccess ? "✓ Copied!" : "📋 Copy Markdown"}
            </button>
          </div>
          <div style={{ padding: "18px 20px", backgroundColor: "#0f1623", fontFamily: "monospace", fontSize: "12px", color: "#e2e8f0", whiteSpace: "pre-wrap", lineHeight: "1.7", maxHeight: "500px", overflowY: "auto" }}>
            {releaseNotesText}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
