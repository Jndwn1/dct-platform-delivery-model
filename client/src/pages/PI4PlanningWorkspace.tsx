import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "wouter";
import {
  createPi4PlanningCopy,
  getPi4FeaturesByWorkstream,
  PI4_PLANNING_SUMMARY,
  PI4_SPRINT_PLANNING_LANES,
  PI4_TY26_PILOT_EXPANSIONS,
  PI4_ARCHITECTURE_FOCUS,
  PI4_ARCHITECTURE_QUICK_FLOW,
  PI4_LOGICAL_ARCHITECTURE_FLOW,
  type Pi4Feature,
  type Pi4Workstream,
} from "@/lib/pi4PlanningModel";

type WorkspaceFilter = "All" | Pi4Workstream;

const APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM = "/manus-storage/image1_38887cda.png";
const LOGICAL_ARCHITECTURE_DIAGRAM_KEY = "dct-pi4-logical-architecture-diagram";
const LOGICAL_ARCHITECTURE_LABEL_KEY = "dct-pi4-logical-architecture-label";

const WORKSTREAM_STYLE: Record<Pi4Workstream, { accent: string; ink: string; surface: string; border: string }> = {
  "DCT Platform": { accent: "#0f766e", ink: "#115e59", surface: "#f0fdfa", border: "#99f6e4" },
  State: { accent: "#2563eb", ink: "#1d4ed8", surface: "#eff6ff", border: "#bfdbfe" },
  Provision: { accent: "#7c3aed", ink: "#6d28d9", surface: "#f5f3ff", border: "#ddd6fe" },
};

function CountCard({ label, value, detail, color }: { label: string; value: string | number; detail: string; color: string }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderTop: `3px solid ${color}`, borderRadius: "9px", padding: "13px 15px", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)" }}>
      <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: "#0f172a", fontSize: "27px", fontWeight: 850, lineHeight: 1.1, marginTop: "5px" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "10px", lineHeight: 1.35, marginTop: "5px" }}>{detail}</div>
    </div>
  );
}

function StoryTable({ feature }: { feature: Pi4Feature }) {
  const theme = WORKSTREAM_STYLE[feature.workstream];
  return (
    <div style={{ border: `1px solid ${theme.border}`, borderRadius: "9px", overflow: "hidden", background: "#ffffff", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)" }}>
      <div style={{ background: theme.surface, borderBottom: `1px solid ${theme.border}`, padding: "11px 14px", display: "flex", gap: "10px", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
            <span style={{ color: theme.ink, background: "#ffffff", border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: 800, whiteSpace: "nowrap" }}>FEATURE {feature.id}</span>
            <span style={{ color: theme.ink, fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>{feature.workstream}</span>
          </div>
          <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 800, lineHeight: 1.3, marginTop: "6px" }}>{feature.title}</div>
        </div>
        <span style={{ color: theme.ink, background: "rgba(255,255,255,0.72)", border: `1px solid ${theme.border}`, borderRadius: "99px", padding: "3px 8px", fontSize: "10px", fontWeight: 750, whiteSpace: "nowrap" }}>{feature.stories.length} linked {feature.stories.length === 1 ? "story" : "stories"}</span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "760px", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#475569", textAlign: "left" }}>
              <th style={{ padding: "8px 12px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 800, width: "17%" }}>DCT Story</th>
              <th style={{ padding: "8px 12px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 800 }}>Story intent</th>
              <th style={{ padding: "8px 12px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 800, width: "15%" }}>Sprint</th>
              <th style={{ padding: "8px 12px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 800, width: "17%" }}>Planning state</th>
            </tr>
          </thead>
          <tbody>
            {feature.stories.map((story, index) => {
              const refinement = story.planningStatus === "Refinement required";
              const statusColor = refinement ? "#b91c1c" : "#475569";
              const statusSurface = refinement ? "#fef2f2" : "#f8fafc";
              const statusBorder = refinement ? "#fecaca" : "#cbd5e1";
              return (
                <tr key={story.id} style={{ borderTop: index ? "1px solid #e2e8f0" : "none", verticalAlign: "top" }}>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ color: theme.ink, fontSize: "10px", fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase" }}>{story.type}</div>
                    <div style={{ color: "#0f172a", marginTop: "3px", fontWeight: 800 }}>#{story.id}</div>
                  </td>
                  <td style={{ padding: "11px 12px", color: "#334155", lineHeight: 1.42 }}>
                    <div style={{ fontWeight: 650 }}>{story.title}</div>
                    {story.note && <div style={{ color: "#991b1b", fontSize: "10px", lineHeight: 1.4, marginTop: "5px" }}>{story.note}</div>}
                  </td>
                  <td style={{ padding: "11px 12px", color: "#475569", fontWeight: 650 }}>Unassigned<br /><span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>Awaiting PI4 plan</span></td>
                  <td style={{ padding: "11px 12px" }}>
                    <span style={{ display: "inline-block", color: statusColor, background: statusSurface, border: `1px solid ${statusBorder}`, borderRadius: "99px", padding: "4px 7px", fontSize: "10px", fontWeight: 800, lineHeight: 1.2 }}>{story.planningStatus}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PI4PlanningWorkspace() {
  const [filter, setFilter] = useState<WorkspaceFilter>("All");
  const [copied, setCopied] = useState(false);
  const [logicalArchitectureDiagram, setLogicalArchitectureDiagram] = useState(() => {
    if (typeof window === "undefined") return APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM;
    return window.localStorage.getItem(LOGICAL_ARCHITECTURE_DIAGRAM_KEY) || APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM;
  });
  const [logicalArchitectureLabel, setLogicalArchitectureLabel] = useState(() => {
    if (typeof window === "undefined") return "Approved Roger Pilot architecture diagram";
    return window.localStorage.getItem(LOGICAL_ARCHITECTURE_LABEL_KEY) || "Approved Roger Pilot architecture diagram";
  });
  const [diagramNotice, setDiagramNotice] = useState("Approved diagram displayed");
  const [isDiagramExpanded, setIsDiagramExpanded] = useState(false);
  const visibleFeatures = useMemo(() => {
    if (filter === "All") return ["DCT Platform", "State", "Provision"] as Pi4Workstream[];
    return [filter];
  }, [filter]);

  const copyPlanningSummary = async () => {
    try {
      await navigator.clipboard.writeText(createPi4PlanningCopy());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const handleLogicalArchitectureUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setDiagramNotice("Select a PNG, JPEG, or WebP architecture image.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageSource = typeof reader.result === "string" ? reader.result : null;
      if (!imageSource) {
        setDiagramNotice("The selected diagram could not be read.");
        return;
      }

      setLogicalArchitectureDiagram(imageSource);
      setLogicalArchitectureLabel(selectedFile.name);
      setDiagramNotice(`Replacement displayed: ${selectedFile.name}`);
      try {
        window.localStorage.setItem(LOGICAL_ARCHITECTURE_DIAGRAM_KEY, imageSource);
        window.localStorage.setItem(LOGICAL_ARCHITECTURE_LABEL_KEY, selectedFile.name);
      } catch {
        setDiagramNotice(`Replacement displayed for this browser session: ${selectedFile.name}`);
      }
    };
    reader.onerror = () => setDiagramNotice("The selected diagram could not be read.");
    reader.readAsDataURL(selectedFile);
  };

  const restoreApprovedLogicalArchitecture = () => {
    setLogicalArchitectureDiagram(APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM);
    setLogicalArchitectureLabel("Approved Roger Pilot architecture diagram");
    setDiagramNotice("Approved diagram restored");
    try {
      window.localStorage.removeItem(LOGICAL_ARCHITECTURE_DIAGRAM_KEY);
      window.localStorage.removeItem(LOGICAL_ARCHITECTURE_LABEL_KEY);
    } catch {
      // The approved diagram is still restored in the active browser session.
    }
  };

  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "30px 32px 48px", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ borderLeft: "5px solid #7c3aed", paddingLeft: "16px", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#6d28d9", fontSize: "11px", fontWeight: 850, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "5px" }}>PI4 Post-Pilot Planning</div>
            <h1 style={{ color: "#0f172a", fontSize: "27px", lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 850, margin: 0 }}>PI4 Sprint & Story Tracker</h1>
            <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.55, maxWidth: "790px", margin: "8px 0 0" }}>A single planning workspace for the supplied DCT Platform, State, and Provision feature-to-story mappings. Use it to prepare the PI4 sprint baseline without treating planning inventory as committed delivery work.</p>
          </div>
          <button onClick={copyPlanningSummary} style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: copied ? "#065f46" : "#ffffff", background: copied ? "#ecfdf5" : "#1e3a5f", border: copied ? "1px solid #86efac" : "1px solid #1e3a5f", borderRadius: "7px", padding: "8px 11px", fontSize: "11px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}>{copied ? "✓ Planning summary copied" : "▣ Copy planning summary"}</button>
        </div>
      </header>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "#5b21b6", background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "11px 13px", fontSize: "12px", lineHeight: 1.45, marginBottom: "18px" }}>
        <span style={{ fontSize: "15px", lineHeight: 1 }}>ⓘ</span>
        <span><strong>Planning boundary:</strong> This workspace is a PI4 planning inventory only. It does not create Active, Complete, In Progress, or Planned delivery metrics and does not assign sprint dates. Sprint commitments begin only after the PI4 baseline is approved.</span>
      </div>

      <section aria-label="PI4 planning summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <CountCard label="Feature records" value={PI4_PLANNING_SUMMARY.featureCount} detail="DCT Platform, State, and Provision" color="#7c3aed" />
        <CountCard label="Linked stories" value={PI4_PLANNING_SUMMARY.storyCount} detail="Story-level sprint planning inventory" color="#0d9488" />
        <CountCard label="Sprint planning lanes" value={PI4_PLANNING_SUMMARY.sprintLaneCount} detail="No dates or commitments set" color="#2563eb" />
        <CountCard label="Assigned stories" value={PI4_PLANNING_SUMMARY.assignedStoryCount} detail="Sprint assignments pending PI4 baseline" color="#64748b" />
      </section>

      <section aria-label="Logical Architecture and End-to-End Flow" style={{ background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)", marginBottom: "24px" }}>
        <div style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#1d4ed8", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>PI4 technical dependency view</div>
            <h2 style={{ color: "#0f172a", fontSize: "17px", fontWeight: 850, margin: "4px 0 0" }}>Logical Architecture &amp; End-to-End Flow</h2>
            <p style={{ color: "#475569", fontSize: "11px", lineHeight: 1.45, maxWidth: "760px", margin: "5px 0 0" }}>The approved Roger Pilot architecture is the visual source of truth. The companion content below clarifies the end-to-end system interaction for PI4 planning without changing system ownership.</p>
          </div>
          <span style={{ color: "#1e3a8a", background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "99px", padding: "4px 8px", fontSize: "10px", fontWeight: 800 }}>Architecture reference</span>
        </div>

        <div style={{ padding: "16px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #dbeafe", borderRadius: "9px", padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap", marginBottom: "9px" }}>
              <div>
                <div style={{ color: "#0f172a", fontSize: "12px", fontWeight: 850 }}>Logical Architecture Diagram</div>
                <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>{logicalArchitectureLabel}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                <label style={{ color: "#ffffff", background: "#2563eb", border: "1px solid #2563eb", borderRadius: "5px", padding: "6px 9px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>
                  Replace diagram
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogicalArchitectureUpload} style={{ display: "none" }} />
                </label>
                <button type="button" onClick={() => setIsDiagramExpanded(true)} style={{ color: "#1e40af", background: "#ffffff", border: "1px solid #93c5fd", borderRadius: "5px", padding: "6px 9px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>Expand diagram</button>
                {logicalArchitectureDiagram !== APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM && <button type="button" onClick={restoreApprovedLogicalArchitecture} style={{ color: "#475569", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "6px 9px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>Restore approved</button>}
              </div>
            </div>
            <button type="button" onClick={() => setIsDiagramExpanded(true)} style={{ display: "block", width: "100%", background: "#ffffff", border: "1px solid #dbeafe", borderRadius: "7px", padding: "6px", cursor: "zoom-in" }} aria-label="Expand Roger Logical Architecture diagram">
              <img src={logicalArchitectureDiagram} alt="Roger Logical Architecture – PI4" style={{ display: "block", width: "100%", maxHeight: "470px", objectFit: "contain", borderRadius: "4px" }} />
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginTop: "8px", color: "#475569", fontSize: "10px", lineHeight: 1.4 }}>
              <span><strong style={{ color: "#334155" }}>Roger Logical Architecture – PI4</strong></span>
              <span>{diagramNotice}</span>
            </div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 850 }}>Architecture Flow</div>
            <div style={{ color: "#64748b", fontSize: "10px", lineHeight: 1.45, marginTop: "3px" }}>Business-readable explanation of the system names and interactions shown in the approved diagram.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: "8px", marginTop: "10px" }}>
              {PI4_LOGICAL_ARCHITECTURE_FLOW.map((item) => (
                <div key={item.step} style={{ border: "1px solid #dbeafe", borderRadius: "7px", padding: "10px", background: "#ffffff" }}>
                  <div style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                    <span style={{ flex: "0 0 auto", color: "#1d4ed8", background: "#eff6ff", borderRadius: "4px", padding: "2px 5px", fontSize: "9px", fontWeight: 850 }}>{item.step}</span>
                    <div style={{ color: "#0f172a", fontSize: "11px", fontWeight: 850, lineHeight: 1.35 }}>{item.layer}</div>
                  </div>
                  <div style={{ color: "#475569", fontSize: "10px", lineHeight: 1.45, marginTop: "6px" }}>{item.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "13px", background: "#0f172a", borderRadius: "8px", padding: "11px 13px" }}>
            <div style={{ color: "#bfdbfe", fontSize: "9px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>Visual flow summary</div>
            <div style={{ color: "#ffffff", fontSize: "11px", lineHeight: 1.55, fontWeight: 700, marginTop: "4px" }}>{PI4_ARCHITECTURE_QUICK_FLOW}</div>
          </div>

          <div style={{ marginTop: "16px" }}>
            <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 850 }}>PI4 Architecture Focus</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "8px", marginTop: "9px" }}>
              {PI4_ARCHITECTURE_FOCUS.map((item) => (
                <div key={item.system} style={{ borderLeft: "3px solid #2563eb", background: "#f8fafc", borderTop: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0", borderBottom: "1px solid #e2e8f0", borderRadius: "6px", padding: "9px 10px" }}>
                  <div style={{ color: "#1e3a8a", fontSize: "11px", fontWeight: 850 }}>{item.system}</div>
                  <div style={{ color: "#475569", fontSize: "10px", lineHeight: 1.4, marginTop: "4px" }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "14px", display: "flex", gap: "9px", alignItems: "flex-start", background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706", borderRadius: "7px", padding: "11px 13px" }}>
            <span style={{ color: "#b45309", fontSize: "14px", lineHeight: 1 }}>ⓘ</span>
            <div>
              <div style={{ color: "#92400e", fontSize: "11px", fontWeight: 850 }}>Why This Matters for PI4</div>
              <div style={{ color: "#78350f", fontSize: "10px", lineHeight: 1.5, marginTop: "4px" }}>This view helps PI4 teams locate a feature in the platform, identify which system owns data at each stage, recognize integration and dependency points, distinguish transformation from persistence, and coordinate work that spans Roger, DCT, PDC, TDC, or orchestration.</div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="TY26 pilot expansion" style={{ background: "#ffffff", border: "1px solid #bae6fd", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)", marginBottom: "24px" }}>
        <div style={{ background: "#0ea5d8", color: "white", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#0369a1", background: "#ffffff", borderRadius: "5px", padding: "3px 7px", fontSize: "11px", fontWeight: 850 }}>Next</span>
            <div>
              <div style={{ fontSize: "19px", fontWeight: 850, lineHeight: 1.1 }}>TY26 Pilot</div>
              <div style={{ fontSize: "12px", color: "#e0f2fe", marginTop: "3px" }}>What expands for pilot</div>
            </div>
          </div>
          <span style={{ color: "#075985", background: "rgba(255,255,255,0.9)", borderRadius: "99px", padding: "4px 8px", fontSize: "10px", fontWeight: 800 }}>Planning visibility only</span>
        </div>
        <div>
          {PI4_TY26_PILOT_EXPANSIONS.map((item, index) => (
            <div key={item.area} style={{ display: "grid", gridTemplateColumns: "minmax(190px, 0.32fr) 1fr", gap: "14px", padding: "11px 14px", borderTop: index ? "1px solid #dbeafe" : "none" }}>
              <div style={{ color: "#0284c7", fontSize: "12px", fontWeight: 850, lineHeight: 1.3 }}>{item.area}</div>
              <div style={{ color: "#334155", fontSize: "11px", lineHeight: 1.45 }}>{item.expansion}</div>
            </div>
          ))}
        </div>
        <div style={{ color: "#475569", background: "#f8fafc", borderTop: "1px solid #dbeafe", padding: "9px 14px", fontSize: "10px", lineHeight: 1.45 }}><strong style={{ color: "#334155" }}>Planning boundary:</strong> These pilot expansions provide visibility for PI4 planning and do not create committed sprint work or change MVP/PI4 delivery metrics.</div>
      </section>

      <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 4px rgba(15, 23, 42, 0.06)", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "14px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Planning sequence</div>
            <h2 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 850, margin: "4px 0 0" }}>PI4 Sprint Planning Lanes</h2>
          </div>
          <span style={{ color: "#475569", fontSize: "10px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "99px", padding: "4px 8px", fontWeight: 700 }}>Sequence to validate — not a committed schedule</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0", padding: "8px" }}>
          {PI4_SPRINT_PLANNING_LANES.map((lane, index) => (
            <div key={lane.id} style={{ minWidth: 0, padding: "12px", borderRight: index % 4 !== 3 ? "1px solid #e2e8f0" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <span style={{ display: "inline-flex", width: "21px", height: "21px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#ede9fe", color: "#6d28d9", fontSize: "10px", fontWeight: 850 }}>{index + 1}</span>
                <span style={{ color: "#6d28d9", fontSize: "10px", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.06em" }}>Planning lane</span>
              </div>
              <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 800, lineHeight: 1.35, marginTop: "7px" }}>{lane.label}</div>
              <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 700, marginTop: "4px" }}>{lane.timing}</div>
              <p style={{ color: "#475569", fontSize: "11px", lineHeight: 1.45, margin: "8px 0" }}>{lane.scope}</p>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>{lane.workstreams.map((workstream) => <span key={workstream} style={{ color: WORKSTREAM_STYLE[workstream as Pi4Workstream].ink, background: WORKSTREAM_STYLE[workstream as Pi4Workstream].surface, border: `1px solid ${WORKSTREAM_STYLE[workstream as Pi4Workstream].border}`, borderRadius: "4px", padding: "2px 5px", fontSize: "9px", fontWeight: 800 }}>{workstream}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="PI4 feature and story mappings">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Planning inventory</div>
            <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 850, margin: "4px 0 0" }}>Feature → Story Mapping</h2>
            <p style={{ color: "#64748b", fontSize: "11px", margin: "5px 0 0" }}>All stories are unassigned pending PI4 sprint planning. State records retain their current refinement constraint.</p>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["All", "DCT Platform", "State", "Provision"] as WorkspaceFilter[]).map((option) => {
              const active = filter === option;
              const theme = option === "All" ? { accent: "#1e3a5f", surface: "#eff6ff", ink: "#1e3a5f", border: "#bfdbfe" } : WORKSTREAM_STYLE[option];
              return <button key={option} onClick={() => setFilter(option)} style={{ color: active ? "#ffffff" : theme.ink, background: active ? theme.accent : "#ffffff", border: `1px solid ${active ? theme.accent : theme.border}`, borderRadius: "5px", padding: "5px 8px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>{option}</button>;
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {visibleFeatures.map((workstream) => {
            const theme = WORKSTREAM_STYLE[workstream];
            const features = getPi4FeaturesByWorkstream(workstream);
            return (
              <section key={workstream}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "9px" }}>
                  <div style={{ width: "4px", height: "24px", borderRadius: "99px", background: theme.accent }} />
                  <div>
                    <h3 style={{ color: "#0f172a", fontSize: "15px", fontWeight: 850, margin: 0 }}>{workstream}</h3>
                    <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>{features.length} feature {features.length === 1 ? "record" : "records"} · {features.reduce((count, feature) => count + feature.stories.length, 0)} linked stories</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{features.map((feature) => <StoryTable key={feature.id} feature={feature} />)}</div>
              </section>
            );
          })}
        </div>
      </section>

      <footer style={{ marginTop: "26px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px", fontSize: "11px", lineHeight: 1.5, color: "#475569" }}>
        <strong style={{ color: "#334155" }}>Related PI4 planning references:</strong>{" "}
        <Link href="/onboarding" style={{ color: "#2563eb", fontWeight: 750 }}>Provision & State Discovery Workspace</Link>{" "}
        for readiness decisions and prototype references, and{" "}
        <Link href="/uat-testing" style={{ color: "#2563eb", fontWeight: 750 }}>UAT Readiness</Link>{" "}
        for the PI4 UAT execution and TY26 pilot timeline.
      </footer>

      {isDiagramExpanded && (
        <div role="dialog" aria-modal="true" aria-label="Expanded Roger Logical Architecture diagram" onClick={() => setIsDiagramExpanded(false)} style={{ position: "fixed", inset: 0, zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: "26px", background: "rgba(15, 23, 42, 0.78)" }}>
          <div onClick={(event) => event.stopPropagation()} style={{ width: "min(1400px, 96vw)", maxHeight: "92vh", overflow: "auto", background: "#ffffff", borderRadius: "10px", padding: "14px", boxShadow: "0 22px 60px rgba(15, 23, 42, 0.35)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
              <div>
                <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 850 }}>Roger Logical Architecture – PI4</div>
                <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>{logicalArchitectureLabel}</div>
              </div>
              <button type="button" onClick={() => setIsDiagramExpanded(false)} style={{ color: "#334155", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "6px 9px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>Close</button>
            </div>
            <img src={logicalArchitectureDiagram} alt="Expanded Roger Logical Architecture – PI4" style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </div>
      )}
    </div>
  );
}
