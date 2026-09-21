import { useMemo, useState, type ChangeEvent } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Database,
  Eye,
  FileStack,
  GitBranch,
  Landmark,
  Layers3,
  Network,
  ShieldCheck,
  Target,
  Workflow,
  type LucideIcon,
} from "lucide-react";
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

type AccentTone = {
  accent: string;
  ink: string;
  surface: string;
  border: string;
};

const APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM = "/manus-storage/image1_38887cda.png";
const LOGICAL_ARCHITECTURE_DIAGRAM_KEY = "dct-pi4-logical-architecture-diagram";
const LOGICAL_ARCHITECTURE_LABEL_KEY = "dct-pi4-logical-architecture-label";

const WORKSTREAM_STYLE: Record<Pi4Workstream, AccentTone> = {
  "DCT Platform": { accent: "#0f766e", ink: "#115e59", surface: "#f0fdfa", border: "#99f6e4" },
  State: { accent: "#2563eb", ink: "#1d4ed8", surface: "#eff6ff", border: "#bfdbfe" },
  Provision: { accent: "#7c3aed", ink: "#6d28d9", surface: "#f5f3ff", border: "#ddd6fe" },
};

const WORKSTREAM_IDS: Record<Pi4Workstream, string> = {
  "DCT Platform": "dct-platform",
  State: "state",
  Provision: "provision",
};

const EXECUTIVE_NAV_ITEMS = [
  { label: "Executive Overview", target: "executive-overview" },
  { label: "Architecture", target: "architecture" },
  { label: "TY26 Pilot", target: "ty26-pilot" },
  { label: "Planning Lanes", target: "planning-lanes" },
  { label: "DCT Platform", target: "dct-platform" },
  { label: "State", target: "state" },
  { label: "Provision", target: "provision" },
] as const;

const ARCHITECTURE_STEP_STYLES: AccentTone[] = [
  { accent: "#0f766e", ink: "#115e59", surface: "#f0fdfa", border: "#99f6e4" },
  { accent: "#2563eb", ink: "#1d4ed8", surface: "#eff6ff", border: "#bfdbfe" },
  { accent: "#1e40af", ink: "#1e3a8a", surface: "#eff6ff", border: "#bfdbfe" },
  { accent: "#7c3aed", ink: "#6d28d9", surface: "#f5f3ff", border: "#ddd6fe" },
  { accent: "#d97706", ink: "#92400e", surface: "#fffbeb", border: "#fde68a" },
  { accent: "#0891b2", ink: "#0e7490", surface: "#ecfeff", border: "#a5f3fc" },
  { accent: "#b45309", ink: "#92400e", surface: "#fffbeb", border: "#fde68a" },
  { accent: "#be123c", ink: "#9f1239", surface: "#fff1f2", border: "#fecdd3" },
  { accent: "#0f766e", ink: "#115e59", surface: "#f0fdfa", border: "#99f6e4" },
  { accent: "#334155", ink: "#1e293b", surface: "#f8fafc", border: "#cbd5e1" },
];

const ARCHITECTURE_ROLE_LABELS: Record<string, string> = {
  PDC: "Data & context foundation",
  "DCT / Gateway": "Governed integration",
  TDC: "Tax-domain persistence",
  Orchestrator: "Workflow coordination",
  Roger: "Practitioner experience",
};

function StatusPill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "planning" | "refinement" | "confirmed" }) {
  const styles = {
    neutral: { color: "#475569", background: "#f8fafc", border: "#cbd5e1" },
    planning: { color: "#1e3a8a", background: "#eff6ff", border: "#bfdbfe" },
    refinement: { color: "#991b1b", background: "#fef2f2", border: "#fecaca" },
    confirmed: { color: "#065f46", background: "#ecfdf5", border: "#a7f3d0" },
  } as const;
  const style = styles[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", width: "fit-content", color: style.color, background: style.background, border: `1px solid ${style.border}`, borderRadius: "99px", padding: "4px 8px", fontSize: "10px", fontWeight: 800, lineHeight: 1.2 }}>{children}</span>;
}

function CountCard({ label, value, detail, color, icon: Icon, featured }: { label: string; value: string | number; detail: string; color: string; icon: LucideIcon; featured?: boolean }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", background: featured ? "#f8fafc" : "#ffffff", border: `1px solid ${featured ? "#cbd5e1" : "#e2e8f0"}`, borderTop: `4px solid ${color}`, borderRadius: "11px", padding: "15px", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)", minHeight: "132px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
        <div style={{ color: "#475569", fontSize: "10px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", color, background: `${color}12`, borderRadius: "7px" }}><Icon size={16} strokeWidth={2.2} /></span>
      </div>
      <div style={{ color: "#0f172a", fontSize: "31px", fontWeight: 850, lineHeight: 1, marginTop: "12px" }}>{value}</div>
      <div style={{ color: "#64748b", fontSize: "10px", lineHeight: 1.45, marginTop: "7px", maxWidth: "220px" }}>{detail}</div>
      {featured && <div style={{ position: "absolute", right: "13px", bottom: "12px" }}><StatusPill tone="planning">Baseline approval pending</StatusPill></div>}
    </div>
  );
}

function StoryTable({ feature }: { feature: Pi4Feature }) {
  const theme = WORKSTREAM_STYLE[feature.workstream];

  return (
    <details open style={{ border: `1px solid ${theme.border}`, borderRadius: "10px", overflow: "hidden", background: "#ffffff", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)" }}>
      <summary style={{ listStyle: "none", cursor: "pointer", background: theme.surface, borderBottom: `1px solid ${theme.border}`, padding: "13px 15px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
              <span style={{ color: theme.ink, background: "#ffffff", border: `1px solid ${theme.border}`, borderRadius: "4px", padding: "3px 7px", fontSize: "10px", fontWeight: 850, whiteSpace: "nowrap" }}>FEATURE {feature.id}</span>
              <span style={{ color: theme.ink, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", textTransform: "uppercase" }}>{feature.workstream}</span>
              <span style={{ color: "#64748b", fontSize: "10px", fontWeight: 750 }}>Story detail available</span>
            </div>
            <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 850, lineHeight: 1.35, marginTop: "7px" }}>{feature.title}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
            <StatusPill tone="planning">{feature.stories.length} linked {feature.stories.length === 1 ? "story" : "stories"}</StatusPill>
            <ChevronDown size={16} color={theme.ink} aria-hidden="true" />
          </div>
        </div>
      </summary>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "800px", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#475569", textAlign: "left" }}>
              <th style={{ padding: "9px 13px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 850, width: "17%" }}>DCT Story</th>
              <th style={{ padding: "9px 13px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 850 }}>Story intent</th>
              <th style={{ padding: "9px 13px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 850, width: "18%" }}>Sprint</th>
              <th style={{ padding: "9px 13px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 850, width: "18%" }}>Planning state</th>
            </tr>
          </thead>
          <tbody>
            {feature.stories.map((story, index) => {
              const refinement = story.planningStatus === "Refinement required";
              const noteStyle = refinement
                ? { color: "#991b1b", background: "#fef2f2", border: "#dc2626" }
                : { color: "#1e3a8a", background: "#eff6ff", border: "#2563eb" };
              return (
                <tr key={story.id} style={{ borderTop: index ? "1px solid #e2e8f0" : "none", verticalAlign: "top" }}>
                  <td style={{ padding: "13px" }}>
                    <StatusPill tone={story.type === "Tech Story" ? "planning" : "neutral"}>{story.type}</StatusPill>
                    <div style={{ color: "#0f172a", marginTop: "6px", fontWeight: 850 }}>#{story.id}</div>
                  </td>
                  <td style={{ padding: "13px", color: "#334155", lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 650 }}>{story.title}</div>
                    {story.deliveryOwner && <div style={{ marginTop: "7px" }}><StatusPill tone="confirmed">{story.deliveryOwner} owned</StatusPill></div>}
                    {story.note && <div style={{ color: noteStyle.color, fontSize: "10px", lineHeight: 1.45, marginTop: "7px", padding: "7px 8px", background: noteStyle.background, borderLeft: `3px solid ${noteStyle.border}`, borderRadius: "4px" }}>{story.note}</div>}
                  </td>
                  <td style={{ padding: "13px", color: "#475569" }}>
                    <StatusPill tone="neutral">Unassigned</StatusPill>
                    <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 650, marginTop: "6px" }}>Awaiting PI4 plan</div>
                  </td>
                  <td style={{ padding: "13px" }}>
                    <StatusPill tone={refinement ? "refinement" : "planning"}>{story.planningStatus}</StatusPill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
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
  const planningViewDate = useMemo(() => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date()), []);
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
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "28px 32px 56px", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <header id="executive-overview" style={{ scrollMarginTop: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 62%, #0f766e 100%)", borderRadius: "14px", padding: "24px", boxShadow: "0 14px 32px rgba(15, 23, 42, 0.18)", marginBottom: "14px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.34fr)", gap: "22px", alignItems: "stretch" }}>
          <div>
            <div style={{ color: "#bfdbfe", fontSize: "11px", fontWeight: 850, letterSpacing: "0.12em", textTransform: "uppercase" }}>PI4 Post-Pilot Planning</div>
            <h1 style={{ color: "#ffffff", fontSize: "31px", lineHeight: 1.12, letterSpacing: "-0.028em", fontWeight: 850, margin: "7px 0 0" }}>PI4 Sprint &amp; Story Tracker</h1>
            <p style={{ color: "#dbeafe", fontSize: "13px", lineHeight: 1.6, maxWidth: "800px", margin: "11px 0 0" }}>A single planning workspace for the supplied DCT Platform, State, and Provision feature-to-story mappings. Use it to prepare the PI4 sprint baseline without treating planning inventory as committed delivery work.</p>
          </div>
          <aside style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.21)", borderRadius: "10px", padding: "15px", alignSelf: "stretch" }}>
            <div style={{ color: "#bfdbfe", fontSize: "9px", fontWeight: 850, letterSpacing: "0.1em", textTransform: "uppercase" }}>Planning status</div>
            <div style={{ color: "#ffffff", fontSize: "15px", fontWeight: 850, lineHeight: 1.3, marginTop: "6px" }}>Planning inventory only — not committed delivery</div>
            <div style={{ color: "#dbeafe", fontSize: "10px", lineHeight: 1.5, marginTop: "7px" }}>Sprint commitments and dates remain pending baseline approval.</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#e0f2fe", fontSize: "10px", marginTop: "13px", paddingTop: "11px", borderTop: "1px solid rgba(255,255,255,0.16)" }}><Eye size={13} aria-hidden="true" /> Planning view refreshed {planningViewDate}</div>
          </aside>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginTop: "20px", paddingTop: "15px", borderTop: "1px solid rgba(255,255,255,0.16)" }}>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            <StatusPill tone="planning">Planning inventory only</StatusPill>
            <span style={{ color: "#dbeafe", border: "1px solid rgba(255,255,255,0.23)", borderRadius: "99px", padding: "4px 8px", fontSize: "10px", fontWeight: 800 }}>DCT Platform · State · Provision</span>
          </div>
          <button type="button" onClick={copyPlanningSummary} style={{ display: "inline-flex", alignItems: "center", gap: "7px", color: copied ? "#065f46" : "#ffffff", background: copied ? "#ecfdf5" : "#0f766e", border: copied ? "1px solid #86efac" : "1px solid #14b8a6", borderRadius: "7px", padding: "8px 11px", fontSize: "11px", fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap" }}><ClipboardList size={14} aria-hidden="true" />{copied ? "Planning summary copied" : "Copy planning summary"}</button>
        </div>
      </header>

      <nav aria-label="PI4 executive navigation" style={{ position: "sticky", top: "8px", zIndex: 15, background: "rgba(255,255,255,0.96)", backdropFilter: "blur(10px)", border: "1px solid #dbeafe", borderRadius: "9px", padding: "9px 10px", boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 3px" }}>Executive navigation</span>
          {EXECUTIVE_NAV_ITEMS.map((item) => <a key={item.target} href={`#${item.target}`} style={{ color: "#1e3a8a", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "5px", padding: "5px 8px", fontSize: "10px", fontWeight: 800, textDecoration: "none" }}>{item.label}</a>)}
        </div>
      </nav>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", color: "#5b21b6", background: "#faf5ff", border: "1px solid #e9d5ff", borderLeft: "4px solid #7c3aed", borderRadius: "8px", padding: "12px 14px", fontSize: "12px", lineHeight: 1.5, marginBottom: "18px" }}>
        <Landmark size={17} style={{ flex: "0 0 auto", marginTop: "1px" }} aria-hidden="true" />
        <span><strong>Planning boundary:</strong> This workspace is a PI4 planning inventory only. It does not create Active, Complete, In Progress, or Planned delivery metrics and does not assign sprint dates. Sprint commitments begin only after the PI4 baseline is approved.</span>
      </div>

      <section aria-label="PI4 planning summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "18px" }}>
        <CountCard label="Feature records" value={PI4_PLANNING_SUMMARY.featureCount} detail="DCT Platform, State, and Provision" color="#7c3aed" icon={FileStack} />
        <CountCard label="Linked stories" value={PI4_PLANNING_SUMMARY.storyCount} detail="Story-level sprint planning inventory" color="#0d9488" icon={GitBranch} />
        <CountCard label="Sprint planning lanes" value={PI4_PLANNING_SUMMARY.sprintLaneCount} detail="No dates or commitments set" color="#2563eb" icon={Layers3} />
        <CountCard label="Assigned stories" value={PI4_PLANNING_SUMMARY.assignedStoryCount} detail="Sprint assignments pending PI4 baseline" color="#64748b" icon={Target} featured />
      </section>

      <section aria-label="Executive summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(225px, 1fr))", gap: "11px", marginBottom: "14px" }}>
        {[
          { title: "Planning Status", text: "PI4 planning inventory is established, but sprint commitments and dates remain pending baseline approval.", icon: ClipboardList, color: "#7c3aed" },
          { title: "Primary Workstreams", text: "DCT Platform, State, and Provision.", icon: Layers3, color: "#0f766e" },
          { title: "Architecture", text: "PI4 work spans Roger, DCT/Gateway, PDC, TDC, and orchestration.", icon: Network, color: "#2563eb" },
          { title: "Primary Planning Attention", text: "DCT-owned State delivery dependencies, Package 1 Provision sequencing, and DCT platform foundation/control work.", icon: Eye, color: "#b45309" },
        ].map(({ title, text, icon: Icon, color }) => (
          <div key={title} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "13px", boxShadow: "0 2px 7px rgba(15, 23, 42, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", color, fontSize: "11px", fontWeight: 850 }}><Icon size={15} aria-hidden="true" />{title}</div>
            <div style={{ color: "#475569", fontSize: "11px", lineHeight: 1.5, marginTop: "8px" }}>{text}</div>
          </div>
        ))}
      </section>

      <section aria-label="Leadership attention" style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px 16px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#92400e" }}><ShieldCheck size={16} aria-hidden="true" /><h2 style={{ fontSize: "14px", fontWeight: 850, margin: 0 }}>Leadership Attention</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "8px", marginTop: "10px" }}>
          {[
            "PI4 baseline still requires approval before sprint commitments.",
            "State stories are refined and DCT-owned; PI4 sprint commitments remain pending baseline approval.",
            "Provision sequencing depends on Package 0 / downstream readiness.",
            "DCT Platform work includes foundational data, security, prior-year continuity, and administration capabilities.",
          ].map((item) => <div key={item} style={{ display: "flex", gap: "7px", alignItems: "flex-start", color: "#78350f", fontSize: "10px", lineHeight: 1.45 }}><CheckCircle2 size={14} style={{ flex: "0 0 auto", marginTop: "1px" }} aria-hidden="true" />{item}</div>)}
        </div>
      </section>

      <section id="architecture" aria-label="Logical Architecture and End-to-End Flow" style={{ scrollMarginTop: "72px", background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "12px", overflow: "hidden", boxShadow: "0 7px 20px rgba(15, 23, 42, 0.07)", marginBottom: "26px" }}>
        <div style={{ background: "linear-gradient(90deg, #eff6ff, #f8fafc)", borderBottom: "1px solid #bfdbfe", padding: "17px 18px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: "#1d4ed8", fontSize: "10px", fontWeight: 850, letterSpacing: "0.1em", textTransform: "uppercase" }}>PI4 technical dependency view</div>
            <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 850, margin: "5px 0 0" }}>Logical Architecture &amp; End-to-End Flow</h2>
            <p style={{ color: "#475569", fontSize: "11px", lineHeight: 1.5, maxWidth: "790px", margin: "6px 0 0" }}>The approved Roger Pilot architecture is the visual source of truth. The companion content below clarifies the end-to-end system interaction for PI4 planning without changing system ownership.</p>
          </div>
          <StatusPill tone="planning">Architecture reference</StatusPill>
        </div>

        <div style={{ padding: "18px" }}>
          <figure style={{ margin: 0, background: "#0f172a", border: "1px solid #1e3a5f", borderRadius: "10px", padding: "14px", boxShadow: "0 8px 18px rgba(15, 23, 42, 0.13)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "11px" }}>
              <div>
                <div style={{ color: "#ffffff", fontSize: "13px", fontWeight: 850 }}>Logical Architecture Diagram</div>
                <div style={{ color: "#bfdbfe", fontSize: "10px", marginTop: "3px" }}>{logicalArchitectureLabel}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "7px", flexWrap: "wrap" }}>
                <label style={{ color: "#ffffff", background: "#2563eb", border: "1px solid #60a5fa", borderRadius: "5px", padding: "7px 10px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>
                  Replace diagram
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogicalArchitectureUpload} style={{ display: "none" }} />
                </label>
                <button type="button" onClick={() => setIsDiagramExpanded(true)} style={{ color: "#1e40af", background: "#ffffff", border: "1px solid #93c5fd", borderRadius: "5px", padding: "7px 10px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>Expand diagram</button>
                {logicalArchitectureDiagram !== APPROVED_LOGICAL_ARCHITECTURE_DIAGRAM && <button type="button" onClick={restoreApprovedLogicalArchitecture} style={{ color: "#475569", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "7px 10px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>Restore approved</button>}
              </div>
            </div>
            <button type="button" onClick={() => setIsDiagramExpanded(true)} style={{ display: "block", width: "100%", background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: "7px", padding: "8px", cursor: "zoom-in" }} aria-label="Expand Roger Logical Architecture diagram">
              <img src={logicalArchitectureDiagram} alt="Roger Logical Architecture – PI4" style={{ display: "block", width: "100%", maxHeight: "560px", objectFit: "contain", borderRadius: "4px" }} />
            </button>
            <figcaption style={{ display: "flex", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginTop: "9px", color: "#bfdbfe", fontSize: "10px", lineHeight: 1.4 }}>
              <span><strong style={{ color: "#ffffff" }}>Roger Logical Architecture – PI4</strong></span>
              <span>{diagramNotice}</span>
            </figcaption>
          </figure>

          <div style={{ marginTop: "22px" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 850 }}>Architecture Flow</div>
                <div style={{ color: "#64748b", fontSize: "10px", lineHeight: 1.45, marginTop: "4px" }}>Business-readable explanation of the system names and interactions shown in the approved diagram.</div>
              </div>
              <span style={{ color: "#475569", fontSize: "10px", fontWeight: 700 }}>Steps 01–10</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px", marginTop: "12px" }}>
              {PI4_LOGICAL_ARCHITECTURE_FLOW.map((item, index) => {
                const tone = ARCHITECTURE_STEP_STYLES[index] ?? ARCHITECTURE_STEP_STYLES[0];
                return (
                  <div key={item.step} style={{ position: "relative", border: `1px solid ${tone.border}`, borderRadius: "8px", padding: "12px 12px 12px 15px", background: "#ffffff", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)" }}>
                    <div style={{ position: "absolute", top: "12px", bottom: "12px", left: "0", width: "4px", background: tone.accent, borderRadius: "0 3px 3px 0" }} />
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <span style={{ flex: "0 0 auto", color: tone.ink, background: tone.surface, border: `1px solid ${tone.border}`, borderRadius: "4px", padding: "3px 6px", fontSize: "9px", fontWeight: 850 }}>{item.step}</span>
                      <div style={{ color: tone.ink, fontSize: "11px", fontWeight: 850, lineHeight: 1.35 }}>{item.layer}</div>
                    </div>
                    <div style={{ color: "#475569", fontSize: "10px", lineHeight: 1.5, marginTop: "8px" }}>{item.explanation}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: "16px", background: "#0f172a", borderRadius: "8px", padding: "13px 15px" }}>
            <div style={{ color: "#bfdbfe", fontSize: "9px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Visual flow summary</div>
            <div style={{ color: "#ffffff", fontSize: "12px", lineHeight: 1.55, fontWeight: 700, marginTop: "5px" }}>{PI4_ARCHITECTURE_QUICK_FLOW}</div>
          </div>

          <div style={{ marginTop: "21px" }}>
            <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 850 }}>PI4 Architecture Focus</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", gap: "9px", marginTop: "10px" }}>
              {PI4_ARCHITECTURE_FOCUS.map((item) => (
                <div key={item.system} style={{ border: "1px solid #dbeafe", borderTop: "3px solid #2563eb", background: "#ffffff", borderRadius: "8px", padding: "11px", minHeight: "139px" }}>
                  <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase" }}>System / Component</div>
                  <div style={{ color: "#1e3a8a", fontSize: "13px", fontWeight: 850, marginTop: "4px" }}>{item.system}</div>
                  <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "11px" }}>Role in PI4</div>
                  <div style={{ color: "#334155", fontSize: "10px", fontWeight: 750, marginTop: "4px" }}>{ARCHITECTURE_ROLE_LABELS[item.system]}</div>
                  <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "11px" }}>Primary responsibility</div>
                  <div style={{ color: "#475569", fontSize: "10px", lineHeight: 1.45, marginTop: "4px" }}>{item.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "18px", display: "flex", gap: "10px", alignItems: "flex-start", background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706", borderRadius: "8px", padding: "13px 15px" }}>
            <Landmark size={17} color="#b45309" style={{ flex: "0 0 auto", marginTop: "1px" }} aria-hidden="true" />
            <div>
              <div style={{ color: "#92400e", fontSize: "12px", fontWeight: 850 }}>Why This Matters for PI4</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "7px" }}>{["System ownership", "Integration points", "Dependency visibility", "Transformation vs persistence", "Cross-team coordination"].map((item) => <span key={item} style={{ color: "#92400e", background: "#ffffff", border: "1px solid #fde68a", borderRadius: "99px", padding: "3px 6px", fontSize: "9px", fontWeight: 800 }}>{item}</span>)}</div>
              <div style={{ color: "#78350f", fontSize: "10px", lineHeight: 1.55, marginTop: "9px" }}>This view helps PI4 teams locate a feature in the platform, identify which system owns data at each stage, recognize integration and dependency points, distinguish transformation from persistence, and coordinate work that spans Roger, DCT, PDC, TDC, or orchestration.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="ty26-pilot" aria-label="TY26 pilot expansion" style={{ scrollMarginTop: "72px", background: "#ffffff", border: "1px solid #bae6fd", borderRadius: "12px", overflow: "hidden", boxShadow: "0 5px 16px rgba(15, 23, 42, 0.06)", marginBottom: "26px" }}>
        <div style={{ background: "linear-gradient(90deg, #0284c7, #0ea5d8)", color: "white", padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <span style={{ color: "#0369a1", background: "#ffffff", borderRadius: "5px", padding: "3px 7px", fontSize: "11px", fontWeight: 850 }}>Next</span>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 850, lineHeight: 1.1 }}>TY26 Pilot</div>
              <div style={{ fontSize: "12px", color: "#e0f2fe", marginTop: "3px" }}>What expands for pilot</div>
            </div>
          </div>
          <StatusPill tone="planning">Planning visibility only</StatusPill>
        </div>
        <div style={{ padding: "17px" }}>
          <div style={{ color: "#0f172a", fontSize: "15px", fontWeight: 850 }}>TY26 Pilot Expansion Areas</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "9px", marginTop: "11px" }}>
            {PI4_TY26_PILOT_EXPANSIONS.map((item) => (
              <div key={item.area} style={{ border: "1px solid #dbeafe", borderRadius: "8px", padding: "12px", background: "#f8fdff", minHeight: "103px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#0284c7", fontSize: "11px", fontWeight: 850 }}><Target size={14} aria-hidden="true" />{item.area}</div>
                <div style={{ color: "#334155", fontSize: "11px", lineHeight: 1.5, marginTop: "8px" }}>{item.expansion}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color: "#475569", background: "#f8fafc", borderTop: "1px solid #dbeafe", padding: "11px 17px", fontSize: "10px", lineHeight: 1.5 }}><strong style={{ color: "#334155" }}>Planning boundary:</strong> These pilot expansions provide visibility for PI4 planning and do not create committed sprint work or change MVP/PI4 delivery metrics.</div>
      </section>

      <section id="planning-lanes" aria-label="PI4 sprint planning lanes" style={{ scrollMarginTop: "72px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 5px 16px rgba(15, 23, 42, 0.06)", marginBottom: "26px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "16px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Planning sequence</div>
            <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 850, margin: "5px 0 0" }}>PI4 Sprint Planning Lanes</h2>
          </div>
          <StatusPill tone="planning">Sequence to validate — not a committed schedule</StatusPill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(245px, 1fr))", gap: "10px", padding: "14px" }}>
          {PI4_SPRINT_PLANNING_LANES.map((lane, index) => (
            <div key={lane.id} style={{ position: "relative", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "14px", background: "#ffffff", minHeight: "245px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "9px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ display: "inline-flex", width: "25px", height: "25px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "#ede9fe", color: "#6d28d9", fontSize: "11px", fontWeight: 850 }}>{index + 1}</span>
                  <span style={{ color: "#6d28d9", fontSize: "10px", fontWeight: 850, textTransform: "uppercase", letterSpacing: "0.06em" }}>Planning lane</span>
                </div>
                {index < PI4_SPRINT_PLANNING_LANES.length - 1 && <span style={{ color: "#cbd5e1", fontSize: "20px", lineHeight: 1 }}>→</span>}
              </div>
              <div style={{ color: "#0f172a", fontSize: "14px", fontWeight: 850, lineHeight: 1.35, marginTop: "11px" }}>{lane.label}</div>
              <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "13px" }}>Current timing status</div>
              <div style={{ marginTop: "5px" }}><StatusPill tone="neutral">{lane.timing}</StatusPill></div>
              <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "13px" }}>Purpose / scope &amp; readiness note</div>
              <p style={{ color: "#475569", fontSize: "10px", lineHeight: 1.5, margin: "5px 0 0" }}>{lane.scope}</p>
              <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase", marginTop: "13px" }}>Owning workstream(s)</div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "5px" }}>{lane.workstreams.map((workstream) => <span key={workstream} style={{ color: WORKSTREAM_STYLE[workstream as Pi4Workstream].ink, background: WORKSTREAM_STYLE[workstream as Pi4Workstream].surface, border: `1px solid ${WORKSTREAM_STYLE[workstream as Pi4Workstream].border}`, borderRadius: "4px", padding: "3px 6px", fontSize: "9px", fontWeight: 800 }}>{workstream}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="PI4 feature and story mappings">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "13px" }}>
          <div>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" }}>Planning inventory</div>
            <h2 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 850, margin: "5px 0 0" }}>Feature → Story Mapping</h2>
            <p style={{ color: "#64748b", fontSize: "11px", lineHeight: 1.45, margin: "6px 0 0" }}>All stories are unassigned pending PI4 sprint planning. State records are refined and DCT-owned, with their delivery dependencies managed through the PI4 baseline.</p>
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["All", "DCT Platform", "State", "Provision"] as WorkspaceFilter[]).map((option) => {
              const active = filter === option;
              const theme = option === "All" ? { accent: "#1e3a5f", surface: "#eff6ff", ink: "#1e3a5f", border: "#bfdbfe" } : WORKSTREAM_STYLE[option];
              return <button key={option} type="button" onClick={() => setFilter(option)} style={{ color: active ? "#ffffff" : theme.ink, background: active ? theme.accent : "#ffffff", border: `1px solid ${active ? theme.accent : theme.border}`, borderRadius: "5px", padding: "6px 9px", fontSize: "10px", fontWeight: 800, cursor: "pointer" }}>{option}</button>;
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {visibleFeatures.map((workstream) => {
            const theme = WORKSTREAM_STYLE[workstream];
            const features = getPi4FeaturesByWorkstream(workstream);
            return (
              <section id={WORKSTREAM_IDS[workstream]} key={workstream} style={{ scrollMarginTop: "72px", borderTop: `3px solid ${theme.accent}`, background: "#ffffff", borderRadius: "10px", padding: "15px", boxShadow: "0 3px 12px rgba(15, 23, 42, 0.045)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <span style={{ display: "inline-flex", width: "29px", height: "29px", alignItems: "center", justifyContent: "center", borderRadius: "7px", color: theme.ink, background: theme.surface, border: `1px solid ${theme.border}` }}>{workstream === "DCT Platform" ? <Database size={16} aria-hidden="true" /> : workstream === "State" ? <Landmark size={16} aria-hidden="true" /> : <Workflow size={16} aria-hidden="true" />}</span>
                    <div>
                      <h3 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 850, margin: 0 }}>{workstream}</h3>
                      <div style={{ color: "#64748b", fontSize: "10px", marginTop: "3px" }}>{features.length} feature {features.length === 1 ? "record" : "records"} · {features.reduce((count, feature) => count + feature.stories.length, 0)} linked stories</div>
                    </div>
                  </div>
                  <StatusPill tone={workstream === "State" ? "confirmed" : "planning"}>{workstream === "State" ? "Refined · DCT Owned" : "Planning Visibility"}</StatusPill>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>{features.map((feature) => <StoryTable key={feature.id} feature={feature} />)}</div>
              </section>
            );
          })}
        </div>
      </section>

      <footer style={{ marginTop: "30px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "9px", padding: "14px 16px", fontSize: "11px", lineHeight: 1.55, color: "#475569" }}>
        <strong style={{ color: "#334155" }}>Related PI4 planning references:</strong>{" "}
        <Link href="/onboarding" style={{ color: "#2563eb", fontWeight: 750 }}>Provision &amp; State Discovery Workspace</Link>{" "}
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
