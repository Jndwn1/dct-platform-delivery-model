// Sidebar — DCT Platform RSM Design
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// Dark navy (#0f1623), RSM green accent, grouped nav with badges
// Architecture Sync — Live: links to /architecture?tab=visio with pulsing indicator + timestamp

import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useBatchStatus, contextToSidebarBadge, type BatchKey, type BatchStatus } from "@/contexts/BatchStatusContext";

interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  badgeColor?: string;
  indent?: boolean;
  subBatch?: boolean;
  status?: string;
  statusColor?: string;
  statusTooltip?: string;
  isArchSync?: boolean;
  demoLink?: string;
}

const PLATFORM_ITEMS: NavItem[] = [
  { label: "DCT Delivery Model", path: "/", icon: "⬡" },
  { label: "Ask Buddy", path: "/ask-buddy", icon: "🐱", badge: "AI", badgeColor: "#0d9488" },
  { label: "Batch Delivery Calendar", path: "/batch-calendar", icon: "▤", badge: "Planning", badgeColor: "#64748b" },
];

// PI 1 batch items (FC + B1–B3) — Foundation & AI Mapping
const BATCH_ITEM_DEFS: { label: string; path: string; batchKey: BatchKey }[] = [
  { label: "FC — Foundation Core",                              path: "/batch/foundation-core", batchKey: "foundation-core" },
  { label: "B1 — File Ingestion & Initial Storage",             path: "/batch/1",               batchKey: "1" },
  { label: "B2 — Normalization & Cross-LOB Taxonomy",           path: "/batch/2",               batchKey: "2" },
  { label: "B2A — Contract Enforcement & Classification",       path: "/batch/2a",              batchKey: "2a" },
  { label: "B3 — Tax Domain Authority & Tax Taxonomy",          path: "/batch/3",               batchKey: "3" },
];

// PI 2 batch items (B4–B11) — Entity, Workflow & Tax Ready
const PI2_BATCH_ITEMS: { label: string; path: string; batchKey: BatchKey; indent?: boolean }[] = [
  { label: "B4 — AI Tax Mapping & Explainability",              path: "/batch/4",               batchKey: "4" },
  { label: "B5 — Entity Identity & Structure",                  path: "/batch/5",               batchKey: "5" },
  { label: "B6 — Practitioner Review, Adjustments & Lock",      path: "/batch/6",               batchKey: "6" },
  { label: "B7 — Client Tax Profile & Eligibility",             path: "/batch/7",               batchKey: "7" },
  { label: "B8 — Exceptions & Remediation",                     path: "/batch/8",               batchKey: "8" },
  { label: "  B8 | PDC — Exception & Remediation",              path: "/batch/8-pdc",           batchKey: "8-pdc",  indent: true },
  { label: "  B8 | TDC — Exceptions & Remediation",             path: "/batch/8-tdc",           batchKey: "8-tdc",  indent: true },
  { label: "B9 — Roger Gateway & Consumer Access Layer",         path: "/batch/9",               batchKey: "9" },
  { label: "  B9 | PDC — Roger Gateway & Consumer Access",       path: "/batch/9-pdc",           batchKey: "9-pdc",  indent: true },
  { label: "  B9 | TDC — Rollforward (ON HOLD — B31)",            path: "/batch/9-tdc",           batchKey: "9-tdc",  indent: true },
  { label: "B10 — Return Assembly & Lineage Closure",           path: "/batch/10",              batchKey: "10" },
  { label: "B11 — Learning Governance & Model Evolution",       path: "/batch/11",              batchKey: "11" },
  { label: "B43 — Practitioner Book & Reclass Adjustments",    path: "/batch/43",              batchKey: "43" },
];

// PI 2 Stretch batch items — per Roadmap v7 (6/25–7/3)
const PI2_STRETCH_ITEMS: { label: string; path: string; batchKey: string }[] = [
  { label: "B13 — Platform Reference & Document Provenance",    path: "/batch/13",              batchKey: "13" },
  { label: "B16 — Audit Trail & Lineage Governance (PDC+TDC)",  path: "/batch/16",              batchKey: "16" },
];

// PI 3 MVP batch items — per Roadmap v7 (7/13–9/15)
const PI3_BATCH_ITEMS: { label: string; path: string; batchKey: string }[] = [
  { label: "B42 — Tax Rules Framework & Book-to-Tax Rules",     path: "/batch/42",              batchKey: "42" },
  { label: "B17 — Decision Support — Overrides & Workpapers",   path: "/batch/17",              batchKey: "17" },
  { label: "B20 — Firm Governance & Professional Standards",    path: "/batch/20",              batchKey: "20" },
  { label: "B21 — Quality Control (PDC MVP)",                   path: "/batch/21",              batchKey: "21" },
  { label: "B26 — Entity Constituents & Allocations (PDC)",     path: "/batch/26",              batchKey: "26" },
  { label: "B28 — Tax Workpaper & Provision Schedules",         path: "/batch/28",              batchKey: "28" },
  { label: "B29 — Consolidated Return Assembly",                path: "/batch/29",              batchKey: "29" },
  { label: "B31 — Legacy Tool Prior Year Ingestion (PDC+TDC)",  path: "/batch/31",              batchKey: "31" },
  { label: "B9A — Data Gateway (IMS, CDS, DUO)",                path: "/batch/9a",              batchKey: "9a" },
  { label: "B39 — Calculation Report",                          path: "/batch/39",              batchKey: "39" },
  { label: "B33 — State Tax (Apportionment, NOL, Forms)",       path: "/batch/33",              batchKey: "33" },
];

// PI 4 / Post-Pilot batch items — per Roadmap v7
const PI4_BATCH_ITEMS: { label: string; path: string; batchKey: string }[] = [
  { label: "B19 — Audit Tax-Expense Cross-LOB Outbound",        path: "/batch/19",              batchKey: "19" },
  { label: "B21 | TDC — Quality Control Review Records",        path: "/batch/21-tdc",          batchKey: "21" },
  { label: "B26 | TDC — Entity Constituents & Allocations",     path: "/batch/26-tdc",          batchKey: "26-tdc" },
  { label: "B35 — S-Corp Specialization",                       path: "/batch/35",              batchKey: "35" },
  { label: "B40 — Client-Level Line Mapping Reuse",             path: "/batch/40",              batchKey: "40" },
  { label: "B22 — Client Communication (Future PI)",            path: "/batch/22",              batchKey: "22" },
  { label: "B23 — Benchmark & Peer Analytics (Future PI)",      path: "/batch/23",              batchKey: "23" },
];

// On Hold batch items — per Roadmap v7
const ON_HOLD_ITEMS: { label: string; path: string; batchKey: string }[] = [
  { label: "B9 | TDC — Rollforward (absorbed by B31)",          path: "/batch/9-tdc",           batchKey: "9-tdc" },
  { label: "B12 — Engagement Identity & TIM Reconciliation",    path: "/batch/12",              batchKey: "12" },
];


// Governance Gates — informational table-of-contents navigation
// No status badges, no completion indicators — anchors to page sections
const GATE_NAV_ITEMS = [
  { id: "gate-flow",  label: "Governance Gates Overview", icon: "→",  anchor: "gate-flow-section" },
];

// Agents section removed — individual agent nav items consolidated into Agent Hub (Architecture & Diagrams)

// Business Architecture & Governance — primary BA workflow tools
const BA_ITEMS: NavItem[] = [
  { label: "Delivery Intelligence",        path: "/delivery-intelligence",       icon: "◉", badge: "PI3",    badgeColor: "#003865" },
  { label: "Deployment Registry",          path: "/deployment-registry",        icon: "🚀", badge: "New",     badgeColor: "#059669" },
  { label: "Batch Control Panel",         path: "/control-panel",              icon: "⚙", badge: "Admin",    badgeColor: "#6366f1" },
  { label: "Governance Gates",            path: "/gate/overview",              icon: "◉" },
  { label: "Touchpoints (T1–T11)",        path: "/touchpoints",                icon: "↝" },
  { label: "Data Model, Gaps & Governance", path: "/data-model",                 icon: "▦", badge: "Exec",     badgeColor: "#7c3aed" },
  { label: "Classification Walkthrough",  path: "/classification-walkthrough", icon: "⚑", badge: "Decision", badgeColor: "#dc2626" },
  { label: "Taxonomy Explorer",           path: "/taxonomy",                   icon: "◎" },
  { label: "Tax Mapping Confidence",      path: "/tax-mapping",                icon: "◇" },
  { label: "Integration Simulation",      path: "/integration-simulation",     icon: "🎮", badge: "LIVE",    badgeColor: "#059669" },
];

// Discovery Center — BA learning and platform knowledge hub
const DISCOVERY_ITEMS: NavItem[] = [
  { label: "Discovery Center",          path: "/discovery",                           icon: "🧭", badge: "NEW",  badgeColor: "#7c3aed" },
  { label: "Ecosystem Overview",         path: "/discovery/ecosystem",                icon: "◎" },
  { label: "Platform Responsibilities",  path: "/discovery/platform-responsibilities", icon: "▦" },
  { label: "End-to-End Data Flow",       path: "/discovery/data-flow",                icon: "→" },
  { label: "Data Flow Simulation",       path: "/discovery/simulation",               icon: "🎮", badge: "LIVE", badgeColor: "#059669" },
  { label: "Integration Architecture",  path: "/discovery/integration-architecture",  icon: "↝" },
  { label: "BA Requirement Discovery",   path: "/discovery/ba-requirements",          icon: "🔍", badge: "KEY",  badgeColor: "#dc2626" },
  { label: "Discovery Checklist",        path: "/discovery/checklist",                icon: "☑" },
  { label: "BA Story Builder",            path: "/discovery/ba-story-builder",         icon: "✍", badge: "NEW", badgeColor: "#7c3aed" },
  { label: "TDC / DCT Overview",         path: "/discovery/dct-overview",             icon: "T" },
  { label: "Roger Overview",             path: "/discovery/roger-overview",           icon: "R" },
  { label: "GoSystem Tax",               path: "/discovery/gosystem",                icon: "GS" },
  { label: "Glossary",                   path: "/discovery/glossary",                icon: "≡" },
  { label: "Knowledge Graph",             path: "/discovery/knowledge-graph",          icon: "🕸️", badge: "NEW", badgeColor: "#0891b2" },
];

// Platform Governance Tools — platform governance and data integrity
const GOVERNANCE_ITEMS: NavItem[] = [
  { label: "Gap Analysis Engine",    path: "/gap-analysis",        icon: "🔍", badge: "NEW", badgeColor: "#dc2626" },
  { label: "AAP Review Model",            path: "/aap-review",             icon: "◈" },
  { label: "Batch Delivery Review Model", path: "/batch-delivery-review",  icon: "⬡", badge: "NEW", badgeColor: "#059669" },
  { label: "Data Governance & SoT",  path: "/data-governance",     icon: "⚖" },
  { label: "Roger UI Data Mapping",  path: "/roger-mapping",       icon: "≡" },
];

// PI Planning removed — PI2/PI3 pages removed per governance cleanup

// Roger UI — 2 authoritative pages (Integration Simulation moved to Business Architecture & Governance)
const ROGER_UI_ITEMS: NavItem[] = [
  { label: "Consumer Integration Hub",  path: "/consumer-integration-hub",  icon: "🔗", badge: "v4.0",   badgeColor: "#7c3aed" },
  { label: "Roger API Evolution",      path: "/roger-api",                icon: "⚡", badge: "Export", badgeColor: "#003865" },
];

// Diagrams — alphabetical; Visio Architecture removed (duplicate of Architecture Sync); Agent Hub moved here
const DIAGRAM_ITEMS: NavItem[] = [
  { label: "Agent Hub — AI Execution Layer", path: "/agent-hub", icon: "◈" },
  { label: "Architecture Diagram",   path: "/architecture",            icon: "⬡" },
  { label: "Architecture Sync",      path: "/architecture?tab=visio",  icon: "⟳", isArchSync: true },
  { label: "Developer Architecture", path: "/architecture/developer",  icon: "▤" },
  { label: "Enterprise Overview",    path: "/architecture/enterprise", icon: "▣" },
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
        padding: item.subBatch ? "2px 12px 2px 32px" : item.indent ? "2px 12px 2px 20px" : "2px 12px",
        backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
        borderLeft: item.subBatch ? "2px solid #1e3a5f" : "none",
        marginLeft: item.subBatch ? "20px" : "0",
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
          color: isActive ? "#ffffff" : item.subBatch ? "#64748b" : "#94a3b8",
          minWidth: 0,
          fontSize: item.subBatch ? "10px" : undefined,
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
          <span
            title={item.statusTooltip}
            style={{
              fontSize: "9px", padding: "1px 5px", borderRadius: "3px", fontWeight: 600,
              flexShrink: 0, color: "white", backgroundColor: item.statusColor,
              cursor: item.statusTooltip ? "help" : "default",
            }}
          >
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

// ─── Governance Gates TOC section ────────────────────────────────────────────
function GatesNavSection() {
  const [location, navigate] = useLocation();
  const isOnGatePage = location.startsWith("/gate");

  const scrollToAnchor = (anchor: string) => {
    // Navigate to the gate page first if not already there
    if (!isOnGatePage) {
      navigate("/gate/overview");
      // Delay scroll to allow page render
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } else {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div style={{ marginBottom: "4px" }}>
      {/* Section header */}
      <div style={{ padding: "10px 12px 4px" }}>
        <div style={{
          fontSize: "9px", fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#475569",
        }}>Governance Gates</div>
      </div>

      {/* Gate TOC items */}
      {GATE_NAV_ITEMS.map(item => {
        const isActive = isOnGatePage;
        return (
          <button
            key={item.id}
            onClick={() => scrollToAnchor(item.anchor)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              width: "100%",
              textAlign: "left",
              padding: "5px 12px 5px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              color: isActive ? "#e2e8f0" : "#94a3b8",
              fontSize: "11px",
              fontWeight: item.id === "gate-flow" ? 500 : 600,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = isActive ? "#e2e8f0" : "#94a3b8";
            }}
          >
            <span style={{ fontSize: "12px", flexShrink: 0, width: "16px", textAlign: "center" }}>
              {item.icon}
            </span>
            <span style={{ lineHeight: "1.3" }}>{item.label}</span>
          </button>
        );
      })}
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
              Batches by PI
            </span>
            <button
              onClick={() => setBatchesOpen(!batchesOpen)}
              style={{ color: "#475569", fontSize: "10px", background: "none", border: "none", cursor: "pointer" }}
            >
              {batchesOpen ? "▲" : "▼"}
            </button>
          </div>
          {batchesOpen && (
            <>
              {/* PI 1 */}
              <div style={{ padding: "4px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#3b82f6", letterSpacing: "0.08em", textTransform: "uppercase" }}>PI 1 — Foundation &amp; AI Mapping</div>
              {BATCH_ITEM_DEFS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey]);
                return <NavItem key={def.path} item={{ label: def.label, path: def.path, indent: true, status: badge?.label, statusColor: badge?.color, statusTooltip: badge?.tooltip }} />;
              })}
              {/* PI 2 */}
              <div style={{ padding: "6px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase" }}>PI 2 — Entity, Workflow &amp; Tax Ready</div>
              {PI2_BATCH_ITEMS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey]);
                const isSubBatch = def.indent === true;
                return <NavItem key={def.path} item={{ label: def.label.trim(), path: def.path, indent: !isSubBatch, subBatch: isSubBatch, status: badge?.label, statusColor: badge?.color, statusTooltip: badge?.tooltip }} />;
              })}
              {/* PI 2 Stretch */}
              <div style={{ padding: "6px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#0ea5e9", letterSpacing: "0.08em", textTransform: "uppercase" }}>PI 2 Stretch — Reference &amp; Audit Trail</div>
              {PI2_STRETCH_ITEMS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey as BatchKey] ?? "Not Started");
                return <NavItem key={def.path} item={{ label: def.label, path: def.path, indent: true, status: badge?.label, statusColor: badge?.color, statusTooltip: badge?.tooltip }} />;
              })}
              {/* PI 3 MVP */}
              <div style={{ padding: "6px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.08em", textTransform: "uppercase" }}>PI 3 — Intelligence, Provision &amp; Pilot (7/13–9/15)</div>
              {PI3_BATCH_ITEMS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey as BatchKey] ?? "Not Started");
                return <NavItem key={def.path} item={{ label: def.label, path: def.path, indent: true, status: badge?.label, statusColor: badge?.color, statusTooltip: badge?.tooltip }} />;
              })}
              {/* Post-MVP / PI 4 */}
              <div style={{ padding: "6px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#f59e0b", letterSpacing: "0.08em", textTransform: "uppercase" }}>PI 4 — Governance, QC &amp; Analytics (Post-Pilot)</div>
              {PI4_BATCH_ITEMS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey as BatchKey] ?? "Not Started");
                return <NavItem key={def.path} item={{ label: def.label, path: def.path, indent: true, status: badge?.label, statusColor: badge?.color, statusTooltip: badge?.tooltip }} />;
              })}
              {/* On Hold */}
              <div style={{ padding: "6px 12px 2px", fontSize: "9px", fontWeight: 700, color: "#b45309", letterSpacing: "0.08em", textTransform: "uppercase" }}>⏸ On Hold</div>
              {ON_HOLD_ITEMS.map((def) => {
                const badge = contextToSidebarBadge(statuses[def.batchKey as BatchKey] ?? "On Hold");
                return <NavItem key={def.path} item={{ label: def.label, path: def.path, indent: true, status: badge?.label ?? "On Hold", statusColor: badge?.color ?? "#b45309", statusTooltip: badge?.tooltip ?? "On Hold — paused pending dependency resolution or PI reprioritization" }} />;
              })}
            </>
          )}
        </div>

        <NavSection title="Discovery Center" items={DISCOVERY_ITEMS} />
        <NavSection title="Business Architecture & Governance" items={BA_ITEMS} />
        <NavSection title="Roger UI" items={ROGER_UI_ITEMS} />
        <NavSection title="Platform Governance Tools" items={GOVERNANCE_ITEMS} />
        <NavSection title="Architecture & Diagrams" items={DIAGRAM_ITEMS} />
      </div>

      {/* Footer */}
      <div style={{ borderTopWidth: "1px", borderTopColor: "#1e2a3a", padding: "10px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981", flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Platform Active · PI 1–2 Done · B42/B43 Active</span>
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
