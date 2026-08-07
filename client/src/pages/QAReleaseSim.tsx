// QA Release Notes Simulation
// Interactive step-by-step walkthrough of the Ask Buddy → QA Deployment Registry workflow
import { useState, useEffect, useCallback } from "react";
import {
  Play, Pause, RotateCcw, ChevronRight, CheckCircle2, Copy, Check,
  FileText, MessageSquare, ClipboardList, Rocket, Eye, ChevronDown, ChevronUp,
  AlertTriangle, Info,
} from "lucide-react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#0f1623", navyLt: "#1e3a5f",
  teal: "#0d9488", green: "#059669",
  purple: "#7c3aed", amber: "#d97706",
  slate: "#475569", border: "#e2e8f0",
  bg: "#f8fafc", white: "#ffffff",
};

// ── Simulation Data ───────────────────────────────────────────────────────────
const RAW_DEV_NOTES = `DCT QA Deployment Notes — Aug 7, 2026

Gary confirmed the following was deployed to QA today:

BATCH B1 / B9A — Roger UI Core Screens & Gateway Consumer Access

What went out:
- Roger dashboard layout and navigation (all user roles)
- Trial balance grid with filtering and sorting
- Gateway Consumer Access authentication flow

Override mapping fix — Gary says this is NOT in today's build. 
Planned for later today or tomorrow. Do not test yet.

Backend:
- TDC API updated to v2 contract for trial balance retrieval
- Gateway token now includes Roger-specific claims
- No breaking changes to existing consumers

Mohan and Ichhwak will begin smoke testing this afternoon.
Jenniver, Neha, and Divya to prepare release notes.

ADO: Feature 12345 — Roger Core UI
Owner: Gary Luca / Stephane Lacombe`;

const BUDDY_ANALYSIS = `# QA Release Notes — Roger UI: Core Screens & Gateway Consumer Access (B1 / B9A)

## Release Summary

Roger UI core screens and Gateway Consumer Access are now available in QA as of August 7, 2026. This deployment includes the Roger dashboard layout, trial balance grid, and gateway authentication flow. The override mapping fix is **not included** in this deployment and should not be tested until a separate deployment is confirmed.

---

## Screens / Capabilities Updated

### Roger Dashboard
**Platform:** Roger | **Component:** Core UI | **Change Type:** New
**What Changed:** Core navigation and layout deployed. Role-based menu items are now visible for all user roles.
**Available in QA:** Yes
**What QA Should Test:** Log in as each user role and verify correct menu items appear. Confirm dashboard KPI cards load without errors.
**Expected Result:** Dashboard renders correctly for all roles. No console errors.
**Known Issues / Limitations:** None identified.
**Related ADO Item:** Feature 12345
**Validation Status:** Not Started

### Trial Balance Grid
**Platform:** Roger | **Component:** Data Grid | **Change Type:** New
**What Changed:** Trial balance data grid deployed with filtering, sorting, and column configuration.
**Available in QA:** Yes
**What QA Should Test:** Load trial balance for a test entity. Apply filters by account type and date range. Sort by amount descending.
**Expected Result:** Grid loads within 3 seconds. Filters apply correctly. Sort order is stable.
**Known Issues / Limitations:** None identified.
**Related ADO Item:** Feature 12345
**Validation Status:** Not Started

### Gateway Consumer Access
**Platform:** Roger | **Component:** Authentication | **Change Type:** New
**What Changed:** Authentication flow deployed. Users can log in via gateway and land on Roger.
**Available in QA:** Yes
**What QA Should Test:** Use test credentials to authenticate. Verify redirect to Roger dashboard. Test session timeout behavior.
**Expected Result:** Authentication succeeds. Session persists for configured duration.
**Known Issues / Limitations:** None identified.
**Related ADO Item:** Feature 12345
**Validation Status:** Not Started

### Override Mapping
**Platform:** Roger | **Component:** Mapping Engine | **Change Type:** N/A
**What Changed:** Not yet deployed — pending separate deployment.
**Available in QA:** No
**What QA Should Test:** **DO NOT TEST** — not available in QA yet.
**Expected Result:** N/A
**Known Issues / Limitations:** Pending deployment. Do not test until confirmed.
**Related ADO Item:** TBD
**Validation Status:** Needs Confirmation

---

## Backend / API Changes

### TDC Trial Balance API (v2)
**What Changed:** TDC API endpoints for trial balance retrieval updated to v2 contract.
**Impact to QA:** Trial balance grid now calls v2 endpoints. Verify data loads correctly.
**What QA Should Validate:** Confirm trial balance data returns expected structure. No data truncation.
**Related Screen:** Trial Balance Grid
**Known Limitation:** None identified.

### Gateway Authentication Token
**What Changed:** Gateway authentication token now includes Roger-specific claims.
**Impact to QA:** All authenticated sessions will carry updated claims.
**What QA Should Validate:** Confirm login succeeds and Roger-specific features are accessible post-login.
**Related Screen:** Gateway Consumer Access
**Known Limitation:** None identified.

---

## QA Availability Summary

### Ready / Available in QA
- Roger Dashboard (all user roles)
- Trial Balance Grid (filtering, sorting, column config)
- Gateway Consumer Access (authentication flow)

### Pending Validation
- TDC API v2 contract — functional validation in progress
- Gateway token claims — smoke test pending

### Not Available / Do Not Test
- Override Mapping — pending separate deployment (QADEP-2026-0807-002)

### Known Issues
- Override mapping fix is NOT in this build. Do not test override-related functionality.

### BA Follow-Up Needed
- Confirm exact deployment time for override mapping fix
- Confirm ADO item for Gateway Consumer Access (separate from Feature 12345?)
- Confirm Mohan/Ichhwak smoke test completion before marking validation as In Progress`;

const REGISTRY_ENTRY = {
  id: "QADEP-2026-0807-001",
  releaseName: "Roger UI — Core Screens & Gateway Consumer Access (B1 / B9A)",
  date: "2026-08-07",
  owner: "Gary Luca",
  po: "Stephane Lacombe",
  platform: "Roger",
  type: "Batch",
  status: "Deployed",
  batch: "B1, B9A",
  env: "QA",
  ado: "Feature 12345",
  validationStatus: "In Progress",
  validatedBy: "Mohan / Ichhwak",
  releaseNotesStatus: "Pending Validation",
  screens: ["Roger Dashboard", "Trial Balance Grid", "Gateway Consumer Access", "Override Mapping (Not Available)"],
};

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    icon: <FileText size={18} />,
    label: "DEV / QA Notes",
    color: C.slate,
    description: "BA receives raw deployment notes from Gary (DCT Dev Lead)",
  },
  {
    id: 2,
    icon: <MessageSquare size={18} />,
    label: "Paste into Ask Buddy",
    color: C.teal,
    description: "BA pastes notes into Ask Buddy and asks for QA release notes",
  },
  {
    id: 3,
    icon: <Eye size={18} />,
    label: "Ask Buddy Analyzes",
    color: C.purple,
    description: "Ask Buddy produces structured screen-by-screen release notes",
  },
  {
    id: 4,
    icon: <Copy size={18} />,
    label: "BA Reviews & Copies",
    color: C.amber,
    description: "BA reviews the output, confirms accuracy, and copies the content",
  },
  {
    id: 5,
    icon: <Rocket size={18} />,
    label: "Create Deployment",
    color: C.green,
    description: "BA opens Create Deployment in QA Registry and pastes the release details",
  },
  {
    id: 6,
    icon: <CheckCircle2 size={18} />,
    label: "Generate Wiki",
    color: C.navyLt,
    description: "BA generates the QA Wiki from the saved deployment record",
  },
];

// ── Typing animation ──────────────────────────────────────────────────────────
function useTypingText(text: string, active: boolean, speed = 8) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += speed;
      if (i >= text.length) {
        setDisplayed(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

// ── Collapsible note ─────────────────────────────────────────────────────────
function CollapsibleNote({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: open ? C.navy : C.bg, border: "none", cursor: "pointer" }}>
        <span style={{ fontSize: "12px", fontWeight: 700, color: open ? C.white : C.navyLt }}>{title}</span>
        {open ? <ChevronUp size={14} color={open ? "white" : C.slate} /> : <ChevronDown size={14} color={C.slate} />}
      </button>
      {open && <div style={{ padding: "14px 16px", background: C.white }}>{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QAReleaseSim() {
  const [activeStep, setActiveStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [buddyActive, setBuddyActive] = useState(false);

  // Auto-advance when playing
  useEffect(() => {
    if (!playing) return;
    if (activeStep >= STEPS.length) { setPlaying(false); return; }
    const delay = activeStep === 3 ? 6000 : 3000;
    const t = setTimeout(() => setActiveStep(s => s + 1), delay);
    return () => clearTimeout(t);
  }, [playing, activeStep]);

  // Activate buddy typing when on step 3
  useEffect(() => {
    if (activeStep === 3) setBuddyActive(true);
    else setBuddyActive(false);
  }, [activeStep]);

  // Keyboard shortcuts
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
    if (e.key === "ArrowRight") setActiveStep(s => Math.min(s + 1, STEPS.length));
  }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const reset = () => { setActiveStep(1); setPlaying(false); setBuddyActive(false); };
  const advance = () => setActiveStep(s => Math.min(s + 1, STEPS.length));

  const { displayed: buddyText, done: buddyDone } = useTypingText(BUDDY_ANALYSIS, buddyActive, 12);

  const handleCopy = () => {
    navigator.clipboard.writeText(BUDDY_ANALYSIS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px", borderBottom: `2px solid ${C.border}`, paddingBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Play size={16} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: C.navy, margin: 0, lineHeight: 1 }}>Ask Buddy — QA Release Notes Simulation</h1>
            <div style={{ fontSize: "11px", color: C.slate, marginTop: "2px" }}>Interactive walkthrough of the BA workflow: DEV Notes → Ask Buddy → QA Deployment Registry</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "Non-Production Demo", color: C.amber },
            { label: "Ask Buddy Simulation", color: C.purple },
            { label: "QA Registry Workflow", color: C.green },
          ].map(b => (
            <span key={b.label} style={{ fontSize: "10px", fontWeight: 600, color: "white", backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px" }}>{b.label}</span>
          ))}
          <span style={{ fontSize: "10px", color: C.slate, marginLeft: "auto" }}>⌨ Space = Play/Pause · → = Next Step</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", alignItems: "center" }}>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", backgroundColor: playing ? C.amber : C.teal, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
        >
          {playing ? <><Pause size={14} /> Pause</> : <><Play size={14} /> {activeStep === 1 ? "Run Simulation" : "Continue"}</>}
        </button>
        <button onClick={advance} disabled={activeStep >= STEPS.length} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: C.bg, color: C.navyLt, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: activeStep >= STEPS.length ? "not-allowed" : "pointer", opacity: activeStep >= STEPS.length ? 0.5 : 1 }}>
          <ChevronRight size={14} /> Next Step
        </button>
        <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", backgroundColor: C.bg, color: C.slate, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
          <RotateCcw size={14} /> Reset
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          {STEPS.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                width: "28px", height: "8px", borderRadius: "4px", border: "none", cursor: "pointer",
                backgroundColor: s.id < activeStep ? C.green : s.id === activeStep ? C.purple : C.border,
                transition: "background-color 0.3s",
              }}
              title={s.label}
            />
          ))}
        </div>
      </div>

      {/* Step progress bar */}
      <div style={{ display: "flex", gap: "0", marginBottom: "28px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${C.border}` }}>
        {STEPS.map((s, i) => {
          const isActive = s.id === activeStep;
          const isDone = s.id < activeStep;
          return (
            <button
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                flex: 1, padding: "10px 8px", border: "none", borderRight: i < STEPS.length - 1 ? `1px solid ${C.border}` : "none",
                backgroundColor: isDone ? "#f0fdf4" : isActive ? C.navy : C.white,
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                transition: "background-color 0.2s",
              }}
            >
              <span style={{ color: isDone ? C.green : isActive ? "white" : C.slate }}>{isDone ? <CheckCircle2 size={16} /> : s.icon}</span>
              <span style={{ fontSize: "9px", fontWeight: 700, color: isDone ? C.green : isActive ? "white" : C.slate, textAlign: "center", lineHeight: 1.2 }}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step content */}

      {/* Step 1 — DEV Notes */}
      {activeStep === 1 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.slate, display: "flex", alignItems: "center", justifyContent: "center" }}><FileText size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 1 — DEV / QA Notes</div>
              <div style={{ fontSize: "12px", color: C.slate }}>Gary (DCT Dev Lead) sends raw deployment notes to the BA team</div>
            </div>
          </div>
          <div style={{ backgroundColor: "#1e293b", borderRadius: "10px", padding: "20px 24px", fontFamily: "monospace", fontSize: "12px", color: "#e2e8f0", lineHeight: "1.8", whiteSpace: "pre-wrap", marginBottom: "16px" }}>
            {RAW_DEV_NOTES}
          </div>
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 16px", fontSize: "12px", color: "#92400e", display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "1px" }} />
            <div><strong>BA Challenge:</strong> The notes are unstructured. Multiple screens are mentioned. Override mapping is explicitly excluded. The BA needs to transform this into structured QA release notes without guessing or fabricating details.</div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: C.teal, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Next — Paste into Ask Buddy <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Paste into Ask Buddy */}
      {activeStep === 2 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.teal, display: "flex", alignItems: "center", justifyContent: "center" }}><MessageSquare size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 2 — Paste into Ask Buddy</div>
              <div style={{ fontSize: "12px", color: C.slate }}>BA opens Ask Buddy and pastes the raw notes with a natural language request</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Ask Buddy chat mockup */}
            <div style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ backgroundColor: C.navy, padding: "12px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white" }}>AB</div>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Ask Buddy</span>
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginLeft: "auto" }}>DCT QA Release Notes Assistant</span>
              </div>
              <div style={{ padding: "16px", backgroundColor: C.bg, minHeight: "200px" }}>
                {/* User message */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                  <div style={{ maxWidth: "75%", backgroundColor: C.navy, borderRadius: "10px 0 10px 10px", padding: "10px 14px" }}>
                    <div style={{ fontSize: "12px", color: "#f1f5f9", lineHeight: "1.6" }}>
                      Create QA release notes from these notes.<br /><br />
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}>[Pasted: DCT QA Deployment Notes — Aug 7, 2026...]</span>
                    </div>
                  </div>
                </div>
                {/* Buddy typing indicator */}
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white", flexShrink: 0 }}>AB</div>
                  <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "0 10px 10px 10px", padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal, animation: "pulse 1s infinite" }} />
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal, animation: "pulse 1s 0.2s infinite" }} />
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal, animation: "pulse 1s 0.4s infinite" }} />
                      <span style={{ fontSize: "11px", color: C.slate, marginLeft: "6px" }}>Analyzing deployment notes...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Guidance panel */}
            <div style={{ width: "260px", flexShrink: 0 }}>
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px 16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>BA Prompt Used</div>
                <div style={{ fontSize: "12px", color: "#1e293b", fontStyle: "italic", lineHeight: "1.6" }}>"Create QA release notes from these notes."</div>
                <div style={{ fontSize: "10px", color: C.slate, marginTop: "6px" }}>Ask Buddy infers the release-note task from context — no rigid prompt format required.</div>
              </div>
              <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "14px 16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>Ask Buddy Will Identify</div>
                {["Screens affected", "What changed per screen", "What QA should test", "What is NOT available", "Backend/API changes", "BA Follow-Up items"].map(item => (
                  <div key={item} style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px" }}>
                    <CheckCircle2 size={10} color="#2563eb" />
                    <span style={{ fontSize: "11px", color: "#1e293b" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: C.purple, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Next — View Ask Buddy Analysis <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Ask Buddy Analysis */}
      {activeStep === 3 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.purple, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 3 — Ask Buddy Analysis</div>
              <div style={{ fontSize: "12px", color: C.slate }}>Ask Buddy produces structured screen-by-screen QA release notes</div>
            </div>
            {buddyDone && (
              <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, color: C.green, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "4px", padding: "3px 8px" }}>✓ Analysis Complete</span>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white", flexShrink: 0, marginTop: "4px" }}>AB</div>
            <div style={{ flex: 1, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderRadius: "0 10px 10px 10px", padding: "16px 18px" }}>
              {!buddyDone && (
                <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal }} />
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal }} />
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: C.teal }} />
                  <span style={{ fontSize: "11px", color: C.slate, marginLeft: "6px" }}>Generating release notes...</span>
                </div>
              )}
              <pre style={{ fontSize: "11px", color: "#1e293b", lineHeight: "1.7", whiteSpace: "pre-wrap", fontFamily: "system-ui, sans-serif", margin: 0, maxHeight: "420px", overflowY: "auto" }}>
                {buddyText}
                {!buddyDone && <span style={{ display: "inline-block", width: "2px", height: "14px", backgroundColor: C.teal, marginLeft: "2px", animation: "blink 0.8s infinite" }} />}
              </pre>
            </div>
          </div>
          {buddyDone && (
            <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: C.amber, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                Next — BA Reviews & Copies <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4 — BA Reviews & Copies */}
      {activeStep === 4 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}><ClipboardList size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 4 — BA Reviews & Copies</div>
              <div style={{ fontSize: "12px", color: C.slate }}>BA reviews the Ask Buddy output for accuracy, then copies it for the registry</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <CollapsibleNote title="✅ Screens Identified (4)" defaultOpen>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {[
                    { name: "Roger Dashboard", status: "Available", color: C.green },
                    { name: "Trial Balance Grid", status: "Available", color: C.green },
                    { name: "Gateway Consumer Access", status: "Available", color: C.green },
                    { name: "Override Mapping", status: "Not Available", color: "#dc2626" },
                  ].map(s => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: C.bg, borderRadius: "6px", border: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: C.navy }}>{s.name}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: s.color }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleNote>
              <CollapsibleNote title="⚠️ BA Follow-Up Needed (3)" defaultOpen>
                {["Confirm exact deployment time for override mapping fix", "Confirm ADO item for Gateway Consumer Access", "Confirm Mohan/Ichhwak smoke test completion"].map(item => (
                  <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "6px" }}>
                    <AlertTriangle size={12} color={C.amber} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span style={{ fontSize: "12px", color: "#92400e" }}>{item}</span>
                  </div>
                ))}
              </CollapsibleNote>
              <CollapsibleNote title="ℹ️ Accuracy Flags">
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <Info size={12} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "12px", color: "#1d4ed8" }}>Override Mapping is listed as "Not Available / Do Not Test" — Ask Buddy correctly identified this from the notes without guessing.</span>
                </div>
              </CollapsibleNote>
            </div>
            <div style={{ width: "260px", flexShrink: 0 }}>
              <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Copy Release Notes</div>
                <button
                  onClick={handleCopy}
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px 16px", backgroundColor: copied ? C.green : C.purple, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "background-color 0.2s" }}
                >
                  {copied ? <><Check size={14} /> Copied to Clipboard!</> : <><Copy size={14} /> Copy Release Notes</>}
                </button>
                <div style={{ fontSize: "10px", color: C.slate, marginTop: "8px", textAlign: "center" }}>Copies the full structured release notes markdown ready to paste into Create Deployment</div>
              </div>
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.green, marginBottom: "6px" }}>BA Governance Reminder</div>
                <div style={{ fontSize: "11px", color: "#1e293b", lineHeight: "1.6" }}>Ask Buddy output is a <strong>draft</strong>. The BA must review for accuracy before entering the official deployment record.</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: C.green, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Next — Create Deployment <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5 — Create Deployment */}
      {activeStep === 5 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}><Rocket size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 5 — Create Deployment Record</div>
              <div style={{ fontSize: "12px", color: C.slate }}>BA opens QA Deployment Registry → Create Deployment and pastes the release details</div>
            </div>
          </div>
          {/* Simulated form */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
            <div style={{ backgroundColor: C.navy, padding: "14px 18px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Create Deployment — QA Registry</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>Fields pre-populated from Ask Buddy output</div>
            </div>
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {[
                { label: "Release Name", value: REGISTRY_ENTRY.releaseName, full: true },
                { label: "Deployment Date", value: REGISTRY_ENTRY.date },
                { label: "Status", value: REGISTRY_ENTRY.status },
                { label: "Deployment Owner", value: REGISTRY_ENTRY.owner },
                { label: "Product Owner", value: REGISTRY_ENTRY.po },
                { label: "Platform", value: REGISTRY_ENTRY.platform },
                { label: "Type", value: REGISTRY_ENTRY.type },
                { label: "Related Batch", value: REGISTRY_ENTRY.batch },
                { label: "Environment", value: REGISTRY_ENTRY.env },
                { label: "ADO Work Item", value: REGISTRY_ENTRY.ado },
                { label: "Screen Updated", value: "Roger Dashboard, Trial Balance Grid, Gateway Consumer Access, Override Mapping (Not Available)" },
                { label: "Validation Status", value: REGISTRY_ENTRY.validationStatus },
                { label: "Validated By", value: REGISTRY_ENTRY.validatedBy },
                { label: "Release Notes Status", value: REGISTRY_ENTRY.releaseNotesStatus },
              ].map(f => (
                <div key={f.label} style={{ gridColumn: (f as any).full ? "1 / -1" : undefined }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "12px", color: C.navy, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "5px", padding: "6px 10px", fontWeight: 500 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, backgroundColor: C.bg, display: "flex", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckCircle2 size={16} color={C.green} />
                <span style={{ fontSize: "12px", fontWeight: 700, color: C.green }}>Deployment record saved — QADEP-2026-0807-001</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={advance} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 20px", backgroundColor: C.navyLt, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
              Next — Generate Wiki <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 6 — Generate Wiki */}
      {activeStep === 6 && (
        <div style={{ animation: "fadeIn 0.3s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: C.navyLt, display: "flex", alignItems: "center", justifyContent: "center" }}><CheckCircle2 size={18} color="white" /></div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>Step 6 — Generate Wiki</div>
              <div style={{ fontSize: "12px", color: C.slate }}>BA clicks Generate Wiki in the QA Registry to produce the governance document</div>
            </div>
          </div>
          {/* Wiki preview */}
          <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
            <div style={{ backgroundColor: C.navyLt, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>QA Deployment Wiki — Generated</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>QADEP-2026-0807-001 · Aug 7, 2026</div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#bbf7d0", backgroundColor: "rgba(5,150,105,0.2)", borderRadius: "4px", padding: "3px 8px" }}>✓ Ready</span>
            </div>
            <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
              {[
                { heading: "# QA Deployment Registry", content: "Environment: QA | Generated: Aug 7, 2026" },
                { heading: "## Overview", content: `**Release:** ${REGISTRY_ENTRY.releaseName}\n**Deployment ID:** ${REGISTRY_ENTRY.id}\n**Date:** ${REGISTRY_ENTRY.date}\n**Owner:** ${REGISTRY_ENTRY.owner} | **PO:** ${REGISTRY_ENTRY.po}` },
                { heading: "## Deployment Summary", content: "Initial QA deployment of Roger UI core screens and Gateway Consumer Access. Includes dashboard layout, trial balance grid, and gateway authentication flow." },
                { heading: "## What Changed", content: "Roger UI core screens are now available in QA. Override mapping fix is pending a separate deployment." },
                { heading: "## QA Availability Summary", content: "✅ Roger Dashboard\n✅ Trial Balance Grid\n✅ Gateway Consumer Access\n🚫 Override Mapping — Do Not Test" },
                { heading: "## Governance Notes", content: "Roger Read-Only. Non-production workspace. All data is seed/mock data for planning and readiness purposes only." },
              ].map(section => (
                <div key={section.heading} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.navy, marginBottom: "4px" }}>{section.heading}</div>
                  <div style={{ fontSize: "12px", color: C.slate, lineHeight: "1.7", whiteSpace: "pre-line" }}>{section.content}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Completion summary */}
          <div style={{ backgroundColor: "#f0fdf4", border: "2px solid #bbf7d0", borderRadius: "10px", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <CheckCircle2 size={24} color={C.green} />
              <div style={{ fontSize: "16px", fontWeight: 700, color: C.green }}>Simulation Complete</div>
            </div>
            <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.8", marginBottom: "14px" }}>
              The full BA workflow has been demonstrated end-to-end:
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              {STEPS.map(s => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: C.white, borderRadius: "6px", padding: "8px 12px", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 size={14} color={C.green} />
                  <span style={{ fontSize: "11px", fontWeight: 600, color: C.navy }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button onClick={reset} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", backgroundColor: C.purple, color: "white", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                <RotateCcw size={14} /> Run Again
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
