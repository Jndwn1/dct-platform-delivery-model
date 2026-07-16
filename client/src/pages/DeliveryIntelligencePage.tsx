/**
 * DeliveryIntelligencePage.tsx
 * PI3 Delivery Intelligence Dashboard — Executive Hub
 *
 * Sections:
 *   1 — PI Readiness Dashboard (5 health dimensions)
 *   2 — Executive Dependency Dashboard (batch dependency table)
 *   3 — Critical Path Dashboard (MVP delivery path visual)
 *   4 — Roger Capability Impact Matrix
 *   5 — Executive Delivery Health KPI Cards
 *   6 — Azure DevOps Integration Review
 *   7 — Platform Optimization Review
 *
 * All data sourced from BatchStatusContext + existing lib files — no duplication.
 */

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import { BATCH_REGISTRY } from "@/lib/batchModel";

// ─── Types ────────────────────────────────────────────────────────────────────

type Health = "Green" | "Yellow" | "Red";
type SectionId = "readiness" | "dependency" | "critical-path" | "roger-impact" | "exec-health" | "ado" | "optimization";

// ─── PI3 Dependency Data ──────────────────────────────────────────────────────
// Sourced from batchModel.ts + roadmap v7 — no duplication of batch registry

interface DependencyRow {
  batch: string;
  name: string;
  owner: string;
  blockedBy: string;
  enables: string;
  rogerImpact: string;
  criticalPath: boolean;
  eta: string;
  batchKey: string;
}

const PI3_DEPENDENCY_DATA: DependencyRow[] = [
  { batch: "B9A", name: "Data Gateway (IMS, CDS, DUO)", owner: "PDC", blockedBy: "B9", enables: "Gateway, Roger", rogerImpact: "Gateway delivery status", criticalPath: true, eta: "Jul 15", batchKey: "9a" },
  { batch: "B42", name: "Tax Rules Framework & Book-to-Tax Rules", owner: "TDC", blockedBy: "B3, B6", enables: "B43, Roger Mapping", rogerImpact: "Line mapping context, rules surface", criticalPath: true, eta: "Jul 23", batchKey: "42" },
  { batch: "B43", name: "Practitioner Book & Reclass Adjustments", owner: "TDC", blockedBy: "B6, B10", enables: "B39, Roger Adjustments", rogerImpact: "Adjustment summary read contract", criticalPath: true, eta: "Aug 6", batchKey: "43" },
  { batch: "B17", name: "Practitioner Review & Lock", owner: "TDC", blockedBy: "B4", enables: "B20, Roger Lock", rogerImpact: "Review task list, lock status", criticalPath: true, eta: "Jul 6", batchKey: "17" },
  { batch: "B20", name: "Workflow Orchestration & Period Management", owner: "PDC+TDC", blockedBy: "B17", enables: "B21, B28", rogerImpact: "Period status, workflow state", criticalPath: true, eta: "Jul 15", batchKey: "20" },
  { batch: "B21", name: "Quality Control (PDC MVP)", owner: "PDC", blockedBy: "B20", enables: "B26, B28", rogerImpact: "QC status surface", criticalPath: true, eta: "Jul 23", batchKey: "21" },
  { batch: "B26", name: "Entity Constituents & Allocations (PDC)", owner: "PDC", blockedBy: "B5, B21", enables: "B28, Roger Consolidation", rogerImpact: "Consolidation detail, entity structure", criticalPath: true, eta: "Aug 6", batchKey: "26" },
  { batch: "B28", name: "Tax Workpaper & Provision Schedules", owner: "TDC", blockedBy: "B26", enables: "B29, B33, B39", rogerImpact: "Workpaper access, provision schedules", criticalPath: true, eta: "Aug 20", batchKey: "28" },
  { batch: "B29", name: "Consolidated Return Assembly", owner: "TDC", blockedBy: "B28", enables: "B39, Filing & Signoff", rogerImpact: "Return assembly status, filing readiness", criticalPath: true, eta: "Sep 3", batchKey: "29" },
  { batch: "B39", name: "Calculation Report", owner: "TDC", blockedBy: "B28", enables: "Filing, Pilot", rogerImpact: "Sign-off reports, derivation lineage", criticalPath: true, eta: "Sep 10", batchKey: "39" },
  { batch: "B31", name: "Legacy Tool Prior Year Ingestion", owner: "PDC+TDC", blockedBy: "B9", enables: "B33, Rollforward", rogerImpact: "Prior year data surface", criticalPath: false, eta: "Aug 20", batchKey: "31" },
  { batch: "B33", name: "State Tax (Apportionment, NOL, Forms)", owner: "TDC", blockedBy: "B28", enables: "Pilot (Final TDC)", rogerImpact: "State tax read contract", criticalPath: false, eta: "Sep 15", batchKey: "33" },
];

// ─── Critical Path Nodes ──────────────────────────────────────────────────────

interface CriticalNode {
  id: string;
  label: string;
  sublabel: string;
  owner: string;
  batchKey: string;
  dependencies: string;
  completionPct: number;
  targetDate: string;
}

const CRITICAL_PATH_NODES: CriticalNode[] = [
  { id: "pdc-foundation", label: "PDC Foundation", sublabel: "FC + B1–B3 Complete", owner: "PDC", batchKey: "foundation-core", dependencies: "None", completionPct: 100, targetDate: "Done" },
  { id: "b9a", label: "Data Gateway", sublabel: "B9A — IMS, CDS, DUO", owner: "PDC", batchKey: "9a", dependencies: "B9", completionPct: 0, targetDate: "Jul 15" },
  { id: "b42", label: "Tax Rules Framework", sublabel: "B42 — Book-to-Tax Rules", owner: "TDC", batchKey: "42", dependencies: "B3, B6", completionPct: 0, targetDate: "Jul 23" },
  { id: "b43", label: "Line Mapping & Reclass", sublabel: "B43 — Practitioner Adjustments", owner: "TDC", batchKey: "43", dependencies: "B42", completionPct: 0, targetDate: "Aug 6" },
  { id: "b28-b29", label: "Workpaper & Return Assembly", sublabel: "B28 + B29 — Provision & Filing", owner: "TDC", batchKey: "28", dependencies: "B26, B43", completionPct: 0, targetDate: "Sep 3" },
  { id: "b39", label: "Calculation Report", sublabel: "B39 — Sign-off & Lineage", owner: "TDC", batchKey: "39", dependencies: "B28", completionPct: 0, targetDate: "Sep 10" },
  { id: "roger", label: "Roger Consumer Ready", sublabel: "All governed contracts live", owner: "Roger", batchKey: "9a", dependencies: "B9A, B42, B43, B39", completionPct: 0, targetDate: "Sep 15" },
  { id: "pilot", label: "September Pilot", sublabel: "MVP Launch — Sep 21, 2026", owner: "Leadership", batchKey: "39", dependencies: "All MVP batches", completionPct: 0, targetDate: "Sep 21" },
];

// ─── Roger Capability Impact Matrix ──────────────────────────────────────────

interface RogerCapabilityRow {
  capability: string;
  screen: string;
  supportingBatch: string;
  batchKey: string;
  dependency: string;
  risk: string;
}

const ROGER_CAPABILITY_MATRIX: RogerCapabilityRow[] = [
  { capability: "My Clients / Client List", screen: "Client List", supportingBatch: "B9A", batchKey: "9a", dependency: "B9 → B9A", risk: "B9 must close before B9A can ship" },
  { capability: "Entity Identity & Structure", screen: "Client List / Filing Review", supportingBatch: "B9A", batchKey: "9a", dependency: "B5 + B9A", risk: "IMS integration required for entity resolution" },
  { capability: "Consolidation Detail", screen: "Filing Review", supportingBatch: "B9A + B26", batchKey: "26", dependency: "B9A + B26", risk: "B26 PDC portion splits to PI4 for TDC" },
  { capability: "Line Mapping Proposals", screen: "Filing Review", supportingBatch: "B42", batchKey: "42", dependency: "B3 + B6 → B42", risk: "Rules conflict resolution must complete before Roger surface" },
  { capability: "Book & Reclass Adjustments", screen: "Filing Review / Work Queue", supportingBatch: "B43", batchKey: "43", dependency: "B42 → B43", risk: "Adjustment lock enforced — immutable after gate" },
  { capability: "Workpaper & Provision Schedules", screen: "Filing Review", supportingBatch: "B28", batchKey: "28", dependency: "B26 → B28", risk: "State tax tie-out is a hard gate before Roger access" },
  { capability: "Return Assembly & Filing", screen: "Filing & Signoff", supportingBatch: "B29", batchKey: "29", dependency: "B28 → B29", risk: "Consolidated return requires all entity periods FINALIZED" },
  { capability: "Filing & Signoff", screen: "Filing & Signoff", supportingBatch: "B39", batchKey: "39", dependency: "B28 → B39", risk: "Sign-off reports blocked until FINALIZED state confirmed" },
  { capability: "Calculation Report / Derivation Lineage", screen: "Filing & Signoff", supportingBatch: "B39", batchKey: "39", dependency: "B39", risk: "Immutable — reproducible from same data state required at pilot" },
  { capability: "State Tax Read Contract", screen: "Filing Review", supportingBatch: "B33", batchKey: "33", dependency: "B28 → B33", risk: "Final MVP TDC batch — must land by Sep 15" },
];

// ─── ADO Recommendations ──────────────────────────────────────────────────────

const ADO_RECOMMENDATIONS = [
  {
    category: "Parent/Child Relationships",
    description: "Structure Features as parents of User Stories. Each PI3 Feature (e.g., 'B42 — Tax Rules Framework') should parent all stories within that batch. This enables Feature-level rollup queries for PI readiness reporting.",
    queries: ["Features with incomplete child stories", "Features where all stories are Done", "Features with no child stories (orphaned)"],
    priority: "High",
  },
  {
    category: "Successor/Predecessor Relationships",
    description: "Link batch-level dependencies as Predecessor/Successor work item relationships. B9 → B9A, B42 → B43, B28 → B29/B39. This enables ADO to surface blocked work automatically in sprint planning.",
    queries: ["Stories with predecessors not yet Done", "Critical path stories blocked by open predecessors", "Dependency chain from B9 to Pilot"],
    priority: "High",
  },
  {
    category: "Related Work",
    description: "Use 'Related' links to connect stories across teams that share a contract boundary (e.g., PDC B26 stories related to TDC B28 stories that consume the B26 contract). Enables cross-team visibility without creating false dependencies.",
    queries: ["Stories with related items in other teams", "Contract boundary stories with no related links"],
    priority: "Medium",
  },
  {
    category: "Blocked Work",
    description: "Tag blocked stories with a 'Blocked' tag and link to the blocking work item. Use a custom field 'Blocked By' to capture the specific dependency. This enables a single ADO query to surface all blocked stories across PI3.",
    queries: ["All stories tagged 'Blocked'", "Blocked stories on critical path batches", "Blocked stories by team and sprint"],
    priority: "High",
  },
  {
    category: "Cross-Team Dependencies",
    description: "Use ADO Delivery Plans to visualize cross-team dependencies across PDC, TDC, Orchestrator, and Roger teams. Link inter-team dependencies explicitly so they appear in the Delivery Plan dependency view.",
    queries: ["Features with cross-team dependencies", "PI3 delivery plan with dependency lines", "Stories depending on another team's work item"],
    priority: "Medium",
  },
];

// ─── Platform Optimization Findings ──────────────────────────────────────────

const OPTIMIZATION_FINDINGS = [
  { area: "Duplicate Information", finding: "Roger Consumer Readiness Center and Consumer Integration Readiness Hub both display endpoint matrices. The data is similar but maintained separately.", recommendation: "Consolidate into a single Roger readiness source. Keep Consumer Integration Hub as the primary; link from Roger Consumer Readiness Center.", priority: "High" },
  { area: "Missing Dependency Visibility", finding: "No page currently shows batch-to-batch dependency chains visually. The Batch Roadmap lists batches but does not surface blockers or enables relationships.", recommendation: "This Delivery Intelligence page fills the gap. Add a 'Dependency' column to the Batch Roadmap table as a quick-reference link.", priority: "High" },
  { area: "Missing Readiness Indicators", finding: "The Batch Calendar and Batch Roadmap show status but no readiness health (Green/Yellow/Red) at the PI level. Leadership cannot assess PI confidence from a single view.", recommendation: "The PI Readiness Dashboard (Section 1 of this page) fills this gap. Add a PI Readiness badge to the Batch Calendar header.", priority: "High" },
  { area: "Missing Executive Reporting", finding: "The Executive Dashboard exists but does not surface MVP progress, critical path completion, or Roger readiness in a single view.", recommendation: "Add a 'Delivery Intelligence' quick-link card to the Executive Dashboard that links to this page.", priority: "Medium" },
  { area: "Navigation Improvements", finding: "The sidebar has 30+ navigation items with no grouping for PI3-specific delivery management. New team members cannot quickly find delivery health information.", recommendation: "Add a 'Delivery Intelligence' section to the sidebar (implemented in this release). Consider collapsing the Batches by PI section by default for non-BA users.", priority: "Medium" },
  { area: "Consolidation Opportunities", finding: "Gate Status, Governance Gates Overview, and Governance Timeline all surface gate information. Three separate pages for related content creates maintenance overhead.", recommendation: "Make Governance Timeline the primary gate view. Redirect Gate Status to Governance Timeline. Keep Gate Overview as a quick-reference anchor.", priority: "Low" },
  { area: "Stale Static Data", finding: "GovernanceTimelinePage, ConsumerIntegrationReadinessHub, and RogerConsumerReadinessCenter previously had hardcoded status values that did not update when batches were marked Complete.", recommendation: "All three pages now read from BatchStatusContext (completed in this release). No further action required.", priority: "Resolved" },
];

// ─── Health Indicator ─────────────────────────────────────────────────────────

function HealthBadge({ health }: { health: Health }) {
  const cfg = {
    Green:  { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e", label: "Green" },
    Yellow: { bg: "#fefce8", border: "#fde047", text: "#854d0e", dot: "#eab308", label: "Yellow" },
    Red:    { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", dot: "#ef4444", label: "Red" },
  }[health];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "4px", padding: "2px 7px", fontSize: "11px", fontWeight: 700, color: cfg.text }}>
      <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: cfg.dot, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ number, title, subtitle, id }: { number: string; title: string; subtitle: string; id: string }) {
  return (
    <div id={id} style={{ marginBottom: "20px", paddingTop: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "#003865", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 800, flexShrink: 0 }}>{number}</div>
        <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#003865", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ fontSize: "12px", color: "#64748b", marginLeft: "38px" }}>{subtitle}</div>
    </div>
  );
}

// ─── Readiness Dimension Card ─────────────────────────────────────────────────

function ReadinessDimension({ title, health, metrics }: { title: string; health: Health; metrics: { label: string; value: string | number }[] }) {
  const healthColors: Record<Health, string> = { Green: "#059669", Yellow: "#d97706", Red: "#dc2626" };
  return (
    <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 18px", borderTop: `3px solid ${healthColors[health]}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{title}</div>
        <HealthBadge health={health} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {metrics.map(m => (
          <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "#475569" }}>{m.label}</span>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeliveryIntelligencePage() {
  const { statuses, gates, piCompletion, lastUpdated } = useBatchStatus();
  const [activeSection, setActiveSection] = useState<SectionId>("readiness");
  const [depFilter, setDepFilter] = useState<"All" | "Critical" | "Blocked" | "Green" | "Yellow" | "Red">("All");
  const [rogerFilter, setRogerFilter] = useState<"All" | "Ready" | "At Risk" | "Blocked">("All");

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  // ── Derive live batch status helper ──
  const liveStatus = (key: string): string => (statuses as Record<string, string>)[key] ?? "Planned";
  const isComplete = (key: string) => ["Complete", "Delivered"].includes(liveStatus(key));
  const isActive = (key: string) => ["In Progress", "Dev", "MVP", "Stretch"].includes(liveStatus(key));
  const isBlocked = (key: string) => liveStatus(key) === "Blocked";

  // ── PI3 batch counts ──
  const pi3Keys = ["9a", "42", "43", "17", "20", "21", "26", "28", "29", "39", "31", "33"];
  const pi3Complete = useMemo(() => pi3Keys.filter(k => isComplete(k)).length, [statuses]);
  const pi3Active = useMemo(() => pi3Keys.filter(k => isActive(k)).length, [statuses]);
  const pi3Blocked = useMemo(() => pi3Keys.filter(k => isBlocked(k)).length, [statuses]);
  const pi3Planned = pi3Keys.length - pi3Complete - pi3Active - pi3Blocked;
  const pi3Pct = Math.round((pi3Complete / pi3Keys.length) * 100);

  // ── Critical path completion ──
  const criticalKeys = ["9a", "42", "43", "17", "20", "21", "26", "28", "29", "39"];
  const criticalComplete = useMemo(() => criticalKeys.filter(k => isComplete(k)).length, [statuses]);
  const criticalPct = Math.round((criticalComplete / criticalKeys.length) * 100);

  // ── Gate health ──
  const gatesComplete = [gates.g1, gates.g2, gates.g3, gates.g4].filter(g => g === "Complete").length;

  // ── Roger readiness (from rogerConsumerReadiness lib) ──
  const rogerReadyKeys = ["foundation-core", "1", "2", "4", "5", "6", "7", "8", "10", "11"];
  const rogerReady = useMemo(() => rogerReadyKeys.filter(k => isComplete(k)).length, [statuses]);
  const rogerTotal = rogerReadyKeys.length;

  // ── Derive dependency health per row ──
  const depRowsWithHealth = useMemo(() => {
    return PI3_DEPENDENCY_DATA.map(row => {
      const st = liveStatus(row.batchKey);
      let health: Health = "Green";
      if (st === "Blocked") health = "Red";
      else if (st === "Planned" && row.criticalPath) health = "Yellow";
      else if (isComplete(row.batchKey)) health = "Green";
      else if (isActive(row.batchKey)) health = "Yellow";
      return { ...row, health, liveStatus: st };
    });
  }, [statuses]);

  // ── Derive critical path node health ──
  const criticalNodesWithHealth = useMemo(() => {
    return CRITICAL_PATH_NODES.map(node => {
      const st = liveStatus(node.batchKey);
      let health: Health = "Green";
      if (st === "Blocked") health = "Red";
      else if (isComplete(node.batchKey) || node.id === "pdc-foundation") health = "Green";
      else if (isActive(node.batchKey)) health = "Yellow";
      else health = "Yellow";
      const pct = isComplete(node.batchKey) || node.id === "pdc-foundation" ? 100 : isActive(node.batchKey) ? 35 : 0;
      return { ...node, health, completionPct: pct, liveStatus: st };
    });
  }, [statuses]);

  // ── Roger capability health ──
  const rogerCapWithHealth = useMemo(() => {
    return ROGER_CAPABILITY_MATRIX.map(row => {
      const st = liveStatus(row.batchKey);
      let status = "Planned";
      let health: Health = "Yellow";
      if (isComplete(row.batchKey)) { status = "Consumer Ready"; health = "Green"; }
      else if (st === "Blocked") { status = "Blocked"; health = "Red"; }
      else if (isActive(row.batchKey)) { status = "In Progress"; health = "Yellow"; }
      return { ...row, status, health };
    });
  }, [statuses]);

  // ── Readiness dimension metrics ──
  const totalBatches = Object.keys(statuses).length;
  const totalComplete = Object.values(statuses as Record<string, string>).filter(s => ["Complete", "Delivered"].includes(s)).length;
  const totalActive = Object.values(statuses as Record<string, string>).filter(s => ["In Progress", "Dev", "MVP", "Stretch"].includes(s)).length;
  const totalBlocked = Object.values(statuses as Record<string, string>).filter(s => s === "Blocked").length;

  const backlogHealth: Health = pi3Pct >= 60 ? "Green" : pi3Pct >= 30 ? "Yellow" : "Red";
  const dependencyHealth: Health = pi3Blocked === 0 ? "Green" : pi3Blocked <= 2 ? "Yellow" : "Red";
  const capacityHealth: Health = pi3Active >= 2 && pi3Active <= 5 ? "Green" : "Yellow";
  const releaseHealth: Health = criticalPct >= 70 ? "Green" : criticalPct >= 40 ? "Yellow" : "Red";
  const riskHealth: Health = pi3Blocked === 0 ? "Green" : pi3Blocked <= 1 ? "Yellow" : "Red";

  // ── Section nav ──
  const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
    { id: "readiness",     label: "PI Readiness",      icon: "◉" },
    { id: "dependency",    label: "Dependencies",       icon: "⬡" },
    { id: "critical-path", label: "Critical Path",      icon: "→" },
    { id: "roger-impact",  label: "Roger Impact",       icon: "≡" },
    { id: "exec-health",   label: "Exec Health",        icon: "▦" },
    { id: "ado",           label: "Azure DevOps",       icon: "◈" },
    { id: "optimization",  label: "Optimization",       icon: "⚑" },
  ];

  const filteredDeps = depFilter === "All" ? depRowsWithHealth
    : depFilter === "Critical" ? depRowsWithHealth.filter(r => r.criticalPath)
    : depFilter === "Blocked" ? depRowsWithHealth.filter(r => r.health === "Red")
    : depRowsWithHealth.filter(r => r.health === depFilter);

  const filteredRoger = rogerFilter === "All" ? rogerCapWithHealth
    : rogerFilter === "Ready" ? rogerCapWithHealth.filter(r => r.health === "Green")
    : rogerFilter === "At Risk" ? rogerCapWithHealth.filter(r => r.health === "Yellow")
    : rogerCapWithHealth.filter(r => r.health === "Red");

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "24px 32px", maxWidth: "1300px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#003865", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", fontWeight: 900, fontSize: "16px" }}>DI</div>
              <div>
                <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#003865", margin: 0, lineHeight: 1 }}>Delivery Intelligence</h1>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>PI3 Executive Hub · DCT Platform · RSM | CATT · Non-Production Workspace</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
              {[
                { label: `PI3: ${pi3Pct}% Complete`, color: pi3Pct >= 60 ? "#059669" : "#d97706" },
                { label: `Critical Path: ${criticalPct}%`, color: criticalPct >= 60 ? "#059669" : "#dc2626" },
                { label: `Gates: ${gatesComplete}/4`, color: gatesComplete >= 3 ? "#059669" : "#d97706" },
                { label: `Roger: ${rogerReady}/${rogerTotal} Ready`, color: rogerReady >= 8 ? "#059669" : "#d97706" },
                { label: "Sep 21 MVP Target", color: "#003865" },
              ].map(b => (
                <span key={b.label} style={{ fontSize: "11px", fontWeight: 600, color: "white", backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px" }}>{b.label}</span>
              ))}
            </div>
          </div>
          {lastUpdatedLabel && (
            <div style={{ fontSize: "11px", color: "#6b7280", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "6px 12px", whiteSpace: "nowrap" }}>
              ● Live · synced {lastUpdatedLabel}
            </div>
          )}
        </div>
      </div>

      {/* ── Section Navigation Tabs ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", paddingBottom: "0" }}>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: activeSection === s.id ? 700 : 500,
              color: activeSection === s.id ? "#003865" : "#64748b",
              backgroundColor: "transparent",
              border: "none",
              borderBottom: activeSection === s.id ? "2px solid #003865" : "2px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginBottom: "-1px",
            }}
          >
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 1 — PI READINESS DASHBOARD
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "readiness" && (
        <div>
          <SectionHeader number="1" id="readiness" title="PI Readiness Dashboard" subtitle="Five-dimension health assessment for PI3 and September MVP delivery confidence" />

          {/* Overall PI3 Progress Bar */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.08em" }}>PI3 Delivery Progress</span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#059669" }}>{pi3Pct}% ({pi3Complete}/{pi3Keys.length} batches)</span>
              </div>
              <div style={{ height: "10px", backgroundColor: "#d1fae5", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pi3Pct}%`, backgroundColor: "#059669", borderRadius: "5px", transition: "width 0.4s ease" }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Complete", value: pi3Complete, color: "#059669" },
                { label: "Active", value: pi3Active, color: "#2563eb" },
                { label: "Blocked", value: pi3Blocked, color: "#dc2626" },
                { label: "Planned", value: pi3Planned, color: "#94a3b8" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Five Readiness Dimensions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
            <ReadinessDimension
              title="Backlog Readiness"
              health={backlogHealth}
              metrics={[
                { label: "PI3 Batches Complete", value: pi3Complete },
                { label: "PI3 Batches Active", value: pi3Active },
                { label: "Critical Path Batches Done", value: criticalComplete },
                { label: "Critical Path %", value: `${criticalPct}%` },
                { label: "Gate Compliance", value: `${gatesComplete}/4 Gates` },
              ]}
            />
            <ReadinessDimension
              title="Dependency Readiness"
              health={dependencyHealth}
              metrics={[
                { label: "Total PI3 Dependencies", value: PI3_DEPENDENCY_DATA.length },
                { label: "Open Dependencies", value: PI3_DEPENDENCY_DATA.filter(d => !isComplete(d.batchKey)).length },
                { label: "Blocked Batches", value: pi3Blocked },
                { label: "Cross-Team Deps", value: 4 },
                { label: "Critical Dependencies", value: PI3_DEPENDENCY_DATA.filter(d => d.criticalPath).length },
              ]}
            />
            <ReadinessDimension
              title="Capacity Readiness"
              health={capacityHealth}
              metrics={[
                { label: "Active Batches (Platform)", value: totalActive },
                { label: "PI3 Active Batches", value: pi3Active },
                { label: "Planned (Not Started)", value: pi3Planned },
                { label: "Capacity Risk", value: pi3Active > 5 ? "High" : pi3Active > 3 ? "Medium" : "Low" },
                { label: "Sprint Allocation", value: "PI3 Jul–Sep 2026" },
              ]}
            />
            <ReadinessDimension
              title="Release Readiness"
              health={releaseHealth}
              metrics={[
                { label: "MVP Progress", value: `${criticalPct}%` },
                { label: "Critical Path Closed", value: `${criticalComplete}/${criticalKeys.length}` },
                { label: "Roger Readiness", value: `${rogerReady}/${rogerTotal} APIs` },
                { label: "Gateway Readiness", value: isComplete("9a") ? "Ready" : "Pending B9A" },
                { label: "PI Confidence", value: criticalPct >= 70 ? "High" : criticalPct >= 40 ? "Medium" : "Low" },
              ]}
            />
            <ReadinessDimension
              title="Risk Readiness"
              health={riskHealth}
              metrics={[
                { label: "High Risks", value: pi3Blocked },
                { label: "Medium Risks", value: PI3_DEPENDENCY_DATA.filter(d => d.criticalPath && !isComplete(d.batchKey) && !isActive(d.batchKey)).length },
                { label: "Blockers", value: pi3Blocked },
                { label: "Decisions Required", value: gatesComplete < 4 ? 4 - gatesComplete : 0 },
                { label: "At-Risk Batches", value: PI3_DEPENDENCY_DATA.filter(d => d.criticalPath && !isComplete(d.batchKey)).length },
              ]}
            />
          </div>

          {/* Quick links to existing pages */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Drill Down — Existing Platform Pages</div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                { label: "Batch Roadmap", href: "/batch-roadmap" },
                { label: "Batch Calendar", href: "/batch-calendar" },
                { label: "Control Panel", href: "/control-panel" },
                { label: "Gate Overview", href: "/gate/overview" },
                { label: "Roger Consumer Hub", href: "/consumer-integration-hub" },
                { label: "Governance Timeline", href: "/governance-timeline" },
              ].map(l => (
                <Link key={l.href} href={l.href}>
                  <span style={{ fontSize: "12px", color: "#003865", fontWeight: 600, backgroundColor: "white", border: "1px solid #cbd5e1", borderRadius: "5px", padding: "5px 10px", cursor: "pointer", display: "inline-block" }}>
                    {l.label} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 2 — EXECUTIVE DEPENDENCY DASHBOARD
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "dependency" && (
        <div>
          <SectionHeader number="2" id="dependency" title="Executive Dependency Dashboard" subtitle="Batch-level dependency visibility — blockers, enables, Roger impact, and critical path status" />

          {/* Filter bar */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
            {(["All", "Critical", "Blocked", "Green", "Yellow", "Red"] as const).map(f => (
              <button
                key={f}
                onClick={() => setDepFilter(f)}
                style={{
                  padding: "5px 12px", fontSize: "11px", fontWeight: depFilter === f ? 700 : 500,
                  backgroundColor: depFilter === f ? "#003865" : "white",
                  color: depFilter === f ? "white" : "#475569",
                  border: "1px solid #cbd5e1", borderRadius: "5px", cursor: "pointer",
                }}
              >
                {f} {f !== "All" && f !== "Critical" && f !== "Blocked" ? "" : f === "Critical" ? `(${PI3_DEPENDENCY_DATA.filter(d => d.criticalPath).length})` : f === "Blocked" ? `(${depRowsWithHealth.filter(d => d.health === "Red").length})` : ""}
              </button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "11px", color: "#64748b", alignSelf: "center" }}>
              Showing {filteredDeps.length} of {PI3_DEPENDENCY_DATA.length} batches
            </span>
          </div>

          {/* Dependency Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#003865", color: "white" }}>
                  {["Batch", "Feature Name", "Owner", "Status", "Blocked By", "Enables", "Roger Impact", "Critical Path", "Health", "ETA"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeps.map((row, i) => (
                  <tr key={row.batch} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#003865" }}>{row.batch}</td>
                    <td style={{ padding: "10px 12px", color: "#1e293b", maxWidth: "180px" }}>{row.name}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "white", backgroundColor: row.owner === "PDC" ? "#1e3a5f" : row.owner === "TDC" ? "#065f46" : "#4c1d95", borderRadius: "3px", padding: "2px 6px" }}>{row.owner}</span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: isComplete(row.batchKey) ? "#166534" : isActive(row.batchKey) ? "#1e40af" : "#475569", backgroundColor: isComplete(row.batchKey) ? "#f0fdf4" : isActive(row.batchKey) ? "#eff6ff" : "#f8fafc", border: `1px solid ${isComplete(row.batchKey) ? "#86efac" : isActive(row.batchKey) ? "#93c5fd" : "#e2e8f0"}`, borderRadius: "3px", padding: "2px 6px" }}>
                        {row.liveStatus}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: row.blockedBy !== "None" ? "#dc2626" : "#64748b", fontWeight: row.blockedBy !== "None" ? 600 : 400 }}>{row.blockedBy}</td>
                    <td style={{ padding: "10px 12px", color: "#059669", fontWeight: 600 }}>{row.enables}</td>
                    <td style={{ padding: "10px 12px", color: "#475569", maxWidth: "160px" }}>{row.rogerImpact}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      {row.criticalPath && <span style={{ fontSize: "10px", fontWeight: 700, color: "white", backgroundColor: "#dc2626", borderRadius: "3px", padding: "2px 6px" }}>CRITICAL</span>}
                    </td>
                    <td style={{ padding: "10px 12px" }}><HealthBadge health={row.health} /></td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f1623" }}>{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div style={{ marginTop: "14px", fontSize: "11px", color: "#64748b", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <span><strong style={{ color: "#dc2626" }}>Red</strong> = Blocked or critical path at risk</span>
            <span><strong style={{ color: "#d97706" }}>Yellow</strong> = Critical path not yet started or in progress</span>
            <span><strong style={{ color: "#059669" }}>Green</strong> = Complete or on track</span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 3 — CRITICAL PATH DASHBOARD
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "critical-path" && (
        <div>
          <SectionHeader number="3" id="critical-path" title="Critical Path Dashboard" subtitle="MVP delivery path — every node must close before September 21 pilot start" />

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0", marginBottom: "24px" }}>
            {criticalNodesWithHealth.map((node, i) => {
              const healthColors: Record<Health, { bg: string; border: string; text: string }> = {
                Green:  { bg: "#f0fdf4", border: "#059669", text: "#166534" },
                Yellow: { bg: "#fefce8", border: "#d97706", text: "#854d0e" },
                Red:    { bg: "#fef2f2", border: "#dc2626", text: "#991b1b" },
              };
              const hc = healthColors[node.health];
              const isLast = i === criticalNodesWithHealth.length - 1;
              return (
                <div key={node.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  <div style={{
                    width: "100%", maxWidth: "700px",
                    backgroundColor: hc.bg,
                    border: `2px solid ${hc.border}`,
                    borderRadius: "10px",
                    padding: "14px 20px",
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 80px 120px 80px",
                    gap: "12px",
                    alignItems: "center",
                  }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f1623" }}>{node.label}</div>
                      <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{node.sublabel}</div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>Deps: {node.dependencies}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>Owner</div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#003865" }}>{node.owner}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "2px" }}>Target</div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f1623" }}>{node.targetDate}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>Completion</div>
                      <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${node.completionPct}%`, backgroundColor: hc.border, borderRadius: "3px" }} />
                      </div>
                      <div style={{ fontSize: "10px", color: hc.text, fontWeight: 700, marginTop: "2px" }}>{node.completionPct}%</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <HealthBadge health={node.health} />
                    </div>
                  </div>
                  {!isLast && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "4px 0" }}>
                      <div style={{ width: "2px", height: "16px", backgroundColor: "#cbd5e1" }} />
                      <div style={{ fontSize: "16px", color: "#94a3b8", lineHeight: 1 }}>↓</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 16px", fontSize: "12px", color: "#7f1d1d" }}>
            <strong>Critical Path Rule:</strong> Every node in this chain must reach Complete status before the September 21 pilot start. A slip in any node propagates to all downstream nodes. The Control Panel is the authoritative source for all status values shown above.
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 4 — ROGER CAPABILITY IMPACT MATRIX
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "roger-impact" && (
        <div>
          <SectionHeader number="4" id="roger-impact" title="Roger Capability Impact Matrix" subtitle="Which Roger capabilities are impacted if a batch slips — live-synced from Control Panel" />

          {/* Filter */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
            {(["All", "Ready", "At Risk", "Blocked"] as const).map(f => (
              <button
                key={f}
                onClick={() => setRogerFilter(f)}
                style={{
                  padding: "5px 12px", fontSize: "11px", fontWeight: rogerFilter === f ? 700 : 500,
                  backgroundColor: rogerFilter === f ? "#003865" : "white",
                  color: rogerFilter === f ? "white" : "#475569",
                  border: "1px solid #cbd5e1", borderRadius: "5px", cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr style={{ backgroundColor: "#003865", color: "white" }}>
                  {["Roger Capability", "Roger Screen", "Supporting Batch", "Dependency Chain", "Status", "Health", "Risk if Batch Slips"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, fontSize: "11px", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRoger.map((row, i) => (
                  <tr key={row.capability} style={{ backgroundColor: i % 2 === 0 ? "white" : "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "#003865" }}>{row.capability}</td>
                    <td style={{ padding: "10px 12px", color: "#475569" }}>{row.screen}</td>
                    <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e3a5f" }}>{row.supportingBatch}</td>
                    <td style={{ padding: "10px 12px", color: "#64748b", fontSize: "11px" }}>{row.dependency}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 600, color: row.status === "Consumer Ready" ? "#166534" : row.status === "Blocked" ? "#991b1b" : "#1e40af", backgroundColor: row.status === "Consumer Ready" ? "#f0fdf4" : row.status === "Blocked" ? "#fef2f2" : "#eff6ff", border: `1px solid ${row.status === "Consumer Ready" ? "#86efac" : row.status === "Blocked" ? "#fca5a5" : "#93c5fd"}`, borderRadius: "3px", padding: "2px 6px" }}>
                        {row.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}><HealthBadge health={row.health} /></td>
                    <td style={{ padding: "10px 12px", color: "#475569", fontSize: "11px", maxWidth: "200px" }}>{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "14px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", fontSize: "12px", color: "#475569" }}>
            <strong style={{ color: "#003865" }}>Governance Note:</strong> Roger consumes governed contracts via the Roger Gateway. PDC = Phoenix Data Consolidation (operational layer). TDC = Tax Data Consolidation (tax authority layer). Roger does not own lineage, governance, or tax authority. All status values are live-synced from the Control Panel.
            <div style={{ marginTop: "8px" }}>
              <Link href="/consumer-integration-hub"><span style={{ color: "#003865", fontWeight: 600, cursor: "pointer" }}>→ Consumer Integration Hub (full endpoint matrix)</span></Link>
              {" · "}
              <Link href="/roger-mapping"><span style={{ color: "#003865", fontWeight: 600, cursor: "pointer" }}>→ Roger UI Data Mapping</span></Link>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 5 — EXECUTIVE DELIVERY HEALTH KPI CARDS
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "exec-health" && (
        <div>
          <SectionHeader number="5" id="exec-health" title="Executive Delivery Health" subtitle="Platform-wide KPI cards for leadership — all values live from Control Panel" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
            {[
              { label: "Batches Complete", value: totalComplete, sub: "All PIs", color: "#059669", bg: "#f0fdf4", border: "#86efac" },
              { label: "Batches Active", value: totalActive, sub: "In Dev / Review", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
              { label: "PI3 Complete", value: pi3Complete, sub: `of ${pi3Keys.length} PI3 batches`, color: "#059669", bg: "#f0fdf4", border: "#86efac" },
              { label: "Critical Path", value: `${criticalPct}%`, sub: `${criticalComplete}/${criticalKeys.length} nodes`, color: criticalPct >= 70 ? "#059669" : "#d97706", bg: criticalPct >= 70 ? "#f0fdf4" : "#fefce8", border: criticalPct >= 70 ? "#86efac" : "#fde047" },
              { label: "Blocked Batches", value: totalBlocked, sub: "Require action", color: totalBlocked === 0 ? "#059669" : "#dc2626", bg: totalBlocked === 0 ? "#f0fdf4" : "#fef2f2", border: totalBlocked === 0 ? "#86efac" : "#fca5a5" },
              { label: "Roger Readiness", value: `${rogerReady}/${rogerTotal}`, sub: "APIs consumer-ready", color: rogerReady >= 8 ? "#059669" : "#d97706", bg: rogerReady >= 8 ? "#f0fdf4" : "#fefce8", border: rogerReady >= 8 ? "#86efac" : "#fde047" },
              { label: "Gateway Readiness", value: isComplete("9a") ? "Ready" : "Pending", sub: "B9A Data Gateway", color: isComplete("9a") ? "#059669" : "#d97706", bg: isComplete("9a") ? "#f0fdf4" : "#fefce8", border: isComplete("9a") ? "#86efac" : "#fde047" },
              { label: "Gates Passed", value: `${gatesComplete}/4`, sub: "G1–G4 Governance", color: gatesComplete >= 3 ? "#059669" : "#d97706", bg: gatesComplete >= 3 ? "#f0fdf4" : "#fefce8", border: gatesComplete >= 3 ? "#86efac" : "#fde047" },
              { label: "QA Readiness", value: isComplete("10") ? "Ready" : "In Progress", sub: "B10 QA Workstream", color: isComplete("10") ? "#059669" : "#2563eb", bg: isComplete("10") ? "#f0fdf4" : "#eff6ff", border: isComplete("10") ? "#86efac" : "#93c5fd" },
              { label: "MVP Confidence", value: criticalPct >= 70 ? "High" : criticalPct >= 40 ? "Medium" : "Low", sub: "Based on critical path", color: criticalPct >= 70 ? "#059669" : criticalPct >= 40 ? "#d97706" : "#dc2626", bg: criticalPct >= 70 ? "#f0fdf4" : criticalPct >= 40 ? "#fefce8" : "#fef2f2", border: criticalPct >= 70 ? "#86efac" : criticalPct >= 40 ? "#fde047" : "#fca5a5" },
            ].map(card => (
              <div key={card.label} style={{ backgroundColor: card.bg, border: `1px solid ${card.border}`, borderRadius: "10px", padding: "16px 18px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 900, color: card.color, lineHeight: 1, marginBottom: "4px" }}>{card.value}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", marginBottom: "2px" }}>{card.label}</div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Gate Status Summary */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 18px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Gate Status</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {[
                { label: "G1 Schema Lock", status: gates.g1 },
                { label: "G2 Invariant Lock", status: gates.g2 },
                { label: "G3 Contract Publication", status: gates.g3 },
                { label: "G4 Lineage Closure", status: gates.g4 },
              ].map(g => (
                <div key={g.label} style={{ textAlign: "center", padding: "10px", backgroundColor: g.status === "Complete" ? "#f0fdf4" : g.status === "In Progress" ? "#eff6ff" : "#f8fafc", borderRadius: "6px", border: `1px solid ${g.status === "Complete" ? "#86efac" : g.status === "In Progress" ? "#93c5fd" : "#e2e8f0"}` }}>
                  <div style={{ fontSize: "16px", marginBottom: "4px" }}>{g.status === "Complete" ? "✓" : g.status === "In Progress" ? "◐" : "○"}</div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f1623" }}>{g.label}</div>
                  <div style={{ fontSize: "10px", color: g.status === "Complete" ? "#059669" : g.status === "In Progress" ? "#2563eb" : "#94a3b8", fontWeight: 600, marginTop: "2px" }}>{g.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: "11px", color: "#64748b", textAlign: "right" }}>
            All values live-synced from Control Panel{lastUpdatedLabel ? ` · Last updated: ${lastUpdatedLabel}` : ""}
            {" · "}
            <Link href="/control-panel"><span style={{ color: "#003865", fontWeight: 600, cursor: "pointer" }}>Open Control Panel →</span></Link>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 6 — AZURE DEVOPS INTEGRATION REVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "ado" && (
        <div>
          <SectionHeader number="6" id="ado" title="Azure DevOps Integration Review" subtitle="Recommended ADO dashboard configurations and queries that leverage existing work item relationships" />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {ADO_RECOMMENDATIONS.map(rec => (
              <div key={rec.category} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#003865" }}>{rec.category}</div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "white", backgroundColor: rec.priority === "High" ? "#dc2626" : rec.priority === "Medium" ? "#d97706" : "#64748b", borderRadius: "3px", padding: "2px 7px" }}>{rec.priority} Priority</span>
                </div>
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.6", margin: "0 0 12px" }}>{rec.description}</p>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: "6px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Recommended ADO Queries</div>
                  <ul style={{ margin: 0, paddingLeft: "16px" }}>
                    {rec.queries.map(q => (
                      <li key={q} style={{ fontSize: "12px", color: "#475569", marginBottom: "3px" }}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "20px", backgroundColor: "#eff6ff", border: "1px solid #93c5fd", borderRadius: "8px", padding: "14px 18px", fontSize: "12px", color: "#1e40af" }}>
            <strong>Guiding Principle:</strong> Leverage existing ADO work item relationships (Parent/Child, Predecessor/Successor, Related, Blocked) rather than creating duplicate tracking boards. The DCT Platform is the visualization layer; ADO is the execution record. These two systems should complement, not duplicate, each other.
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
           SECTION 7 — PLATFORM OPTIMIZATION REVIEW
      ════════════════════════════════════════════════════════════════════════ */}
      {activeSection === "optimization" && (
        <div>
          <SectionHeader number="7" id="optimization" title="Platform Optimization Review" subtitle="Comprehensive analysis of duplicate information, missing visibility, and consolidation opportunities" />

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {OPTIMIZATION_FINDINGS.map(f => {
              const priorityColors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                High:     { bg: "#fef2f2", border: "#fca5a5", text: "#7f1d1d", badge: "#dc2626" },
                Medium:   { bg: "#fefce8", border: "#fde047", text: "#713f12", badge: "#d97706" },
                Low:      { bg: "#f8fafc", border: "#e2e8f0", text: "#374151", badge: "#64748b" },
                Resolved: { bg: "#f0fdf4", border: "#86efac", text: "#166534", badge: "#059669" },
              };
              const pc = priorityColors[f.priority] ?? priorityColors.Low;
              return (
                <div key={f.area} style={{ backgroundColor: pc.bg, border: `1px solid ${pc.border}`, borderRadius: "10px", padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#003865" }}>{f.area}</div>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: "white", backgroundColor: pc.badge, borderRadius: "3px", padding: "2px 7px" }}>{f.priority}</span>
                  </div>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Finding</div>
                    <div style={{ fontSize: "12px", color: pc.text, lineHeight: "1.5" }}>{f.finding}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "3px" }}>Recommendation</div>
                    <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5", fontWeight: 500 }}>{f.recommendation}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "20px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 18px", fontSize: "12px", color: "#475569" }}>
            <strong style={{ color: "#003865" }}>Maintainability Principle:</strong> Every dashboard should leverage existing DCT Platform information whenever possible. Minimize duplicate maintenance by connecting existing pages together rather than creating parallel tracking systems. The Control Panel is the single source of truth for all batch and gate status values across the platform.
          </div>
        </div>
      )}

    </div>
  );
}
