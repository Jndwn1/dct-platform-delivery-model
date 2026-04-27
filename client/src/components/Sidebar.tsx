// Sidebar — DCT Platform RSM Design
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// Dark navy (#0f1623), RSM green accent, grouped nav with badges
// Architecture Sync — Live: links to /architecture?tab=visio with pulsing indicator + timestamp

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBatchStatus, contextToSidebarBadge, type BatchKey } from "@/contexts/BatchStatusContext";

interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  indent?: boolean;
  status?: string;
  statusColor?: string;
  isArchSync?: boolean;
  demoLink?: string;
}

const PLATFORM_ITEMS: NavItem[] = [
  { label: "DCT Delivery Model", path: "/", icon: "⬡" },
  { label: "Batch Roadmap (FC + 1–10)", path: "/batch-roadmap", icon: "⬢", badge: "New", badgeColor: "#059669" },
];

// Batch items — FC + Batches 1–8 visible; 9–11 hidden (Future/Stretch scope)
const BATCH_ITEM_DEFS: { label: string; path: string; batchKey: BatchKey }[] = [
  { label: "Foundation Core",                                   path: "/batch/foundation-core", batchKey: "foundation-core" },
  { label: "Batch 1 — File Ingestion & Initial Storage",        path: "/batch/1",               batchKey: "1" },
  { label: "Batch 2 — Normalization & Cross-LOB Taxonomy",      path: "/batch/2",               batchKey: "2" },
  { label: "Batch 2A — Contract Enforcement & Classification",  path: "/batch/2a",              batchKey: "2a" },
  { label: "Batch 3 — Tax Domain Authority & Tax Taxonomy",     path: "/batch/3",               batchKey: "3" },
  { label: "Batch 4 — AI Tax Mapping & Explainability",         path: "/batch/4",               batchKey: "4" },
  { label: "Batch 5 — Entity Identity & Structure",             path: "/batch/5",               batchKey: "5" },
  { label: "Batch 6 — Practitioner Review, Adjustments & Lock", path: "/batch/6",               batchKey: "6" },
  { label: "Batch 7 — Client Tax Profile & Eligibility",        path: "/batch/7",               batchKey: "7" },
  { label: "Batch 8 — Exceptions & Remediation",                path: "/batch/8",               batchKey: "8" },
  // Batches 9–11 hidden — Future/Stretch scope, not in current delivery
];


const GATE_ITEMS: NavItem[] = [
  { label: "Gate 1 — Schema Lock", path: "/gate/1", status: "Locked", statusColor: "#475569" },
  { label: "Gate 2 — Invariant Lock", path: "/gate/2", status: "In Progress", statusColor: "#d97706" },
  { label: "Gate 3 — Contract Publication", path: "/gate/3", status: "Pending", statusColor: "#334155" },
  { label: "Gate 4 — Lineage Closure", path: "/gate/4", status: "Pending", statusColor: "#334155" },
];

// Agents — alphabetical
const AGENT_ITEMS: NavItem[] = [
  { label: "Analyst Agent",   path: "/agent/analyst",   icon: "A", status: "Complete",    statusColor: "#059669" },
  { label: "Architect Agent", path: "/agent/architect", icon: "A", status: "Complete",    statusColor: "#059669" },
  { label: "Developer Agent", path: "/agent/developer", icon: "D", status: "In Progress", statusColor: "#d97706" },
  { label: "QA Agent",        path: "/agent/qa",        icon: "Q", status: "In Progress", statusColor: "#d97706" },
];

// Tools — alphabetical
const TOOL_ITEMS: NavItem[] = [
  { label: "Classification Walkthrough", path: "/classification-walkthrough", icon: "⚑", badge: "Decision", badgeColor: "#dc2626" },
  { label: "Control Panel",              path: "/control-panel",              icon: "⚙", badge: "Admin",    badgeColor: "#6366f1" },
  { label: "Data Model & Gaps",          path: "/data-model",                 icon: "▦", badge: "Exec",     badgeColor: "#7c3aed" },
  { label: "Roger UI Data Mapping",      path: "/roger-mapping",              icon: "≡" },
  { label: "Run Agent Simulation",       path: "/demo",                       icon: "▶", badge: "Live",     badgeColor: "#dc2626" },
  { label: "Taxonomy Explorer",          path: "/taxonomy",                   icon: "◎" },
];

// PI Planning removed — PI2/PI3 pages removed per governance cleanup

// Governance — alphabetical
const GOVERNANCE_ITEMS: NavItem[] = [
  { label: "AAP Review Model",       path: "/aap-review",          icon: "◈" },
  { label: "Data Governance & SoT",  path: "/data-governance",     icon: "⚖", badge: "New", badgeColor: "#059669" },
  { label: "Data Lineage",           path: "/lineage",             icon: "⌥" },
  { label: "Governance Timeline",    path: "/governance-timeline", icon: "▤" },
  { label: "Roger API Evolution",    path: "/roger-api",           icon: "⚡" },
  { label: "Tax Mapping Confidence", path: "/tax-mapping",         icon: "◇" },
];

// Diagrams — alphabetical; Visio Architecture removed (duplicate of Architecture Sync); Agent Hub moved here
const DIAGRAM_ITEMS: NavItem[] = [
  { label: "Agent Hub",              path: "/agent-hub",               icon: "◈" },
  { label: "Architecture Diagram",   path: "/architecture",            icon: "⬡" },
  { label: "Architecture Sync",      path: "/architecture?tab=visio",  icon: "⟳", isArchSync: true },
  { label: "Developer Architecture", path: "/architecture/developer",  icon: "▤" },
  { label: "Enterprise Architecture",path: "/architecture/enterprise", icon: "▣" },
  { label: "Runtime Journey (T1–10)",path: "/runtime-journey",         icon: "↝" },
];

// Format a Date as "Apr 9, 2026 · 10:41 AM"
function formatSyncTime(d: Date) {
  return d.toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }).replace(",", " ·");
}

function ArchSyncItem({ item }: { item: NavItem }) {
  const [location, navigate] = useLocation();
  const isActive = location.startsWith("/architecture");
  const [syncTime] = useState(() => formatSyncTime(new Date()));
  const [pulse, setPulse] = useState(true);

  // Pulse every 3s to simulate live sync
  useEffect(() => {
    const id = setInterval(() => setPulse(p => !p), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <button
      onClick={() => navigate(item.path)}
      className="w-full text-left rounded-sm transition-colors"
      style={{
        padding: "5px 12px",
        backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
        color: isActive ? "#ffffff" : "#94a3b8",
        display: "block",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
    >
      {/* Top row: icon + label + Live badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontSize: "11px", width: "14px", textAlign: "center", flexShrink: 0, color: "#64748b" }}>
          {item.icon}
        </span>
        <span style={{ fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "1.3" }}>
          {item.label}
        </span>
        {/* Pulsing Live badge */}
        <span style={{
          display: "flex", alignItems: "center", gap: "3px",
          fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontWeight: 600,
          flexShrink: 0, color: "white", backgroundColor: "#059669"
        }}>
          <span style={{
            width: "5px", height: "5px", borderRadius: "50%",
            backgroundColor: pulse ? "#86efac" : "#ffffff",
            transition: "background-color 0.4s ease",
            display: "inline-block", flexShrink: 0
          }} />
          Live
        </span>
      </div>
      {/* Sub-row: last synced timestamp */}
      <div style={{ paddingLeft: "20px", marginTop: "2px" }}>
        <span style={{ fontSize: "9px", color: "#475569" }}>
          Synced {syncTime}
        </span>
      </div>
    </button>
  );
}

function NavItem({ item }: { item: NavItem }) {
  const [location, navigate] = useLocation();

  if (item.isArchSync) return <ArchSyncItem item={item} />;

  // Strip query strings from both sides for comparison
  const itemBase = item.path.split("?")[0];
  const locationBase = location.split("?")[0];
  const isActive = locationBase === itemBase || (itemBase !== "/" && locationBase.startsWith(itemBase));

  return (
    <div
      className="flex items-center rounded-sm transition-colors group"
      style={{
        padding: item.indent ? "2px 12px 2px 20px" : "2px 12px",
        backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
      }}
      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
    >
      {/* Main nav button */}
      <button
        onClick={() => navigate(item.path)}
        className="flex items-center gap-1.5 flex-1 text-left"
        style={{
          padding: "3px 0",
          background: "none", border: "none", cursor: "pointer",
          color: isActive ? "#ffffff" : "#94a3b8",
          minWidth: 0,
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#e2e8f0"; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = "#94a3b8"; }}
      >
        {item.icon && (
          <span style={{ fontSize: "11px", width: "14px", textAlign: "center", flexShrink: 0, color: "#64748b" }}>
            {item.icon}
          </span>
        )}
        <span style={{ fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: "1.3" }}>
          {item.label}
        </span>
        {item.status && (
          <span style={{
            fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontWeight: 600,
            flexShrink: 0, color: "white", backgroundColor: item.statusColor
          }}>
            {item.status}
          </span>
        )}
        {item.badge && !item.status && (
          <span style={{
            fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontWeight: 600,
            flexShrink: 0, color: "white", backgroundColor: item.badgeColor
          }}>
            {item.badge}
          </span>
        )}
      </button>

      {/* Demo deep-link button — only shown on hover when demoLink is set */}
      {item.demoLink && (
        <button
          onClick={e => { e.stopPropagation(); navigate(item.demoLink!); }}
          title="Open in Weekly Demo Simulator"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#dc2626", fontSize: "9px", padding: "2px 3px",
            flexShrink: 0, lineHeight: 1,
          }}
        >
          ▶
        </button>
      )}
    </div>
  );
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <div style={{
        padding: "10px 12px 3px",
        fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "#475569"
      }}>
        {title}
      </div>
      {items.map((item) => <NavItem key={item.path + item.label} item={item} />)}
    </div>
  );
}

interface SidebarProps {
  activeSection?: string;
}

export default function Sidebar({ activeSection }: SidebarProps) {
  const [batchesOpen, setBatchesOpen] = useState(true);
  const { statuses, resetAll } = useBatchStatus();

  return (
    <aside
      className="flex flex-col h-full flex-shrink-0"
      style={{
        width: "208px",
        backgroundColor: "#0f1623",
        borderRightWidth: "1px",
        borderRightColor: "#1e2a3a",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "14px 12px", borderBottomWidth: "1px", borderBottomColor: "#1e2a3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "#059669",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: "13px", flexShrink: 0
          }}>
            D
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 600, fontSize: "13px", lineHeight: "1.2" }}>DCT Platform</div>
            <div style={{ color: "#64748b", fontSize: "10px" }}>Delivery Model</div>
          </div>
        </div>
      </div>

      {/* Scrollable nav */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        <NavSection title="Platform" items={PLATFORM_ITEMS} />

        {/* Batches section with collapse toggle */}
        <div style={{ marginBottom: "4px" }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px 3px"
          }}>
            <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#475569" }}>
              Batches (FC + 1–10)
            </span>
            <button
              onClick={() => setBatchesOpen(!batchesOpen)}
              style={{ color: "#475569", fontSize: "10px", background: "none", border: "none", cursor: "pointer" }}
            >
              {batchesOpen ? "▲" : "▼"}
            </button>
          </div>
          {batchesOpen && BATCH_ITEM_DEFS.map((def) => {
            const badge = contextToSidebarBadge(statuses[def.batchKey]);
            const navItem: NavItem = {
              label: def.label,
              path: def.path,
              indent: true,
              status: badge?.label,
              statusColor: badge?.color,
            };
            return <NavItem key={def.path} item={navItem} />;
          })}
        </div>

        <NavSection title="Gates" items={GATE_ITEMS} />
        <NavSection title="Agents" items={AGENT_ITEMS} />
        <NavSection title="Tools" items={TOOL_ITEMS} />
        <NavSection title="Governance" items={GOVERNANCE_ITEMS} />
        <NavSection title="Diagrams" items={DIAGRAM_ITEMS} />
      </div>

      {/* Footer */}
      <div style={{ borderTopWidth: "1px", borderTopColor: "#1e2a3a", padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Platform Active · Batch 1–2</span>
        </div>
        <div style={{ fontSize: "10px", color: "#475569", marginBottom: "6px" }}>DCT — Data Consolidation Team</div>
        <button
          onClick={resetAll}
          style={{ fontSize: "10px", color: "#475569", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#475569"}
          title="Reset all batch and gate statuses to default"
        >
          Clear All Progress
        </button>
        {/* Reset confirmation note */}
      </div>
    </aside>
  );
}
