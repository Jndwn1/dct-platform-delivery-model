// Discovery Center — Redesigned Landing Page
// Role-based entry paths + Start Here guided journey + grouped navigation
// Addresses Critical Recommendation #3 from the Discovery Center Audit Report

import { useState } from "react";
import { useLocation } from "wouter";

// Sub-page imports
import EcosystemOverview from "./discovery/EcosystemOverview";
import EndToEndDataFlow from "./discovery/EndToEndDataFlow";
import PlatformResponsibilities from "./discovery/PlatformResponsibilities";
import DCTOverview from "./discovery/DCTOverview";
import RogerOverview from "./discovery/RogerOverview";
import IMSIntegration from "./discovery/GoSystemTax";
import PDCOverview from "./discovery/PDCOverview";
import IntegrationArchitecture from "./discovery/IntegrationArchitecture";
import DataFlowSimulation from "./discovery/DataFlowSimulation";
import BARequirementDiscovery from "./discovery/BARequirementDiscovery";
import DiscoveryChecklist from "./discovery/DiscoveryChecklist";
import Glossary from "./discovery/Glossary";

type DiscoveryPage =
  | "home"
  | "ecosystem"
  | "data-flow"
  | "responsibilities"
  | "dct-overview"
  | "roger-overview"
  | "gosystem"
  | "pdc"
  | "integration"
  | "simulation"
  | "ba-discovery"
  | "checklist"
  | "glossary";

// ─── Navigation groups ─────────────────────────────────────────────────────────
const NAV_GROUPS: {
  groupLabel: string;
  groupColor: string;
  items: { id: DiscoveryPage; label: string; icon: string; badge?: string; badgeColor?: string }[];
}[] = [
  {
    groupLabel: "Platform Overview",
    groupColor: "#1e3a5f",
    items: [
      { id: "ecosystem",        label: "Ecosystem Overview",       icon: "◎", badge: "Start Here", badgeColor: "#059669" },
      { id: "responsibilities", label: "Platform Responsibilities", icon: "▦" },
      { id: "data-flow",        label: "End-to-End Data Flow",      icon: "→" },
      { id: "simulation",       label: "Data Flow Simulation",      icon: "🎮", badge: "LIVE", badgeColor: "#059669" },
    ],
  },
  {
    groupLabel: "Platform Services",
    groupColor: "#065f46",
    items: [
      { id: "pdc",          label: "PDC — Phoenix Data Consolidation", icon: "P", badge: "NEW", badgeColor: "#1e3a5f" },
      { id: "dct-overview", label: "TDC / DCT Overview",               icon: "T" },
      { id: "roger-overview", label: "Roger Overview",                 icon: "R" },
      { id: "gosystem",     label: "IMS Integration",                  icon: "IMS" },
    ],
  },
  {
    groupLabel: "Integration & Architecture",
    groupColor: "#7c3aed",
    items: [
      { id: "integration", label: "Integration Architecture", icon: "↝" },
    ],
  },
  {
    groupLabel: "BA Tools & Reference",
    groupColor: "#dc2626",
    items: [
      { id: "ba-discovery", label: "BA Requirement Discovery", icon: "🔍", badge: "KEY", badgeColor: "#dc2626" },
      { id: "checklist",    label: "Discovery Checklist",      icon: "☑" },
      { id: "glossary",     label: "Glossary",                 icon: "≡" },
    ],
  },
];

// ─── Role-based entry paths ────────────────────────────────────────────────────
const ROLE_PATHS: {
  role: string;
  icon: string;
  color: string;
  desc: string;
  journey: { step: number; page: DiscoveryPage; label: string }[];
}[] = [
  {
    role: "Business Analyst",
    icon: "🔍",
    color: "#1e3a5f",
    desc: "Understand the platform, write accurate stories, and identify gaps",
    journey: [
      { step: 1, page: "ecosystem",        label: "Ecosystem Overview" },
      { step: 2, page: "pdc",              label: "PDC Overview" },
      { step: 3, page: "dct-overview",     label: "TDC / DCT Overview" },
      { step: 4, page: "responsibilities", label: "Platform Responsibilities" },
      { step: 5, page: "ba-discovery",     label: "BA Requirement Discovery" },
      { step: 6, page: "checklist",        label: "Discovery Checklist" },
    ],
  },
  {
    role: "Product Owner",
    icon: "◈",
    color: "#065f46",
    desc: "Understand delivery scope, batch sequencing, and platform boundaries",
    journey: [
      { step: 1, page: "ecosystem",        label: "Ecosystem Overview" },
      { step: 2, page: "responsibilities", label: "Platform Responsibilities" },
      { step: 3, page: "data-flow",        label: "End-to-End Data Flow" },
      { step: 4, page: "pdc",              label: "PDC Overview" },
      { step: 5, page: "dct-overview",     label: "TDC / DCT Overview" },
    ],
  },
  {
    role: "Developer / Architect",
    icon: "⚡",
    color: "#7c3aed",
    desc: "Understand system contracts, APIs, and integration boundaries",
    journey: [
      { step: 1, page: "ecosystem",    label: "Ecosystem Overview" },
      { step: 2, page: "pdc",          label: "PDC Overview" },
      { step: 3, page: "integration",  label: "Integration Architecture" },
      { step: 4, page: "gosystem",     label: "IMS Integration" },
      { step: 5, page: "simulation",   label: "Data Flow Simulation" },
    ],
  },
  {
    role: "QA / Tester",
    icon: "✓",
    color: "#dc2626",
    desc: "Understand data flows, validation rules, and acceptance criteria",
    journey: [
      { step: 1, page: "ecosystem",        label: "Ecosystem Overview" },
      { step: 2, page: "data-flow",        label: "End-to-End Data Flow" },
      { step: 3, page: "responsibilities", label: "Platform Responsibilities" },
      { step: 4, page: "simulation",       label: "Data Flow Simulation" },
      { step: 5, page: "checklist",        label: "Discovery Checklist" },
    ],
  },
];

// ─── Quick access cards ────────────────────────────────────────────────────────
const QUICK_ACCESS: { id: DiscoveryPage; label: string; sub: string; color: string; icon: string; badge?: string }[] = [
  { id: "ecosystem",    label: "Ecosystem Overview",    sub: "The complete platform map",        color: "#1e3a5f", icon: "◎", badge: "Start Here" },
  { id: "pdc",          label: "PDC Overview",          sub: "Financial data foundation",        color: "#1e3a5f", icon: "P",  badge: "NEW" },
  { id: "dct-overview", label: "TDC / DCT Overview",    sub: "Tax data transformation",          color: "#065f46", icon: "T" },
  { id: "roger-overview", label: "Roger Overview",      sub: "Practitioner consumption layer",   color: "#7c3aed", icon: "R" },
  { id: "ba-discovery", label: "BA Requirement Discovery", sub: "Write better stories faster",  color: "#dc2626", icon: "🔍", badge: "KEY" },
  { id: "simulation",   label: "Data Flow Simulation",  sub: "Interactive live data flow",       color: "#059669", icon: "🎮", badge: "LIVE" },
];

// ─── Render sub-page ──────────────────────────────────────────────────────────
function renderPage(activePage: DiscoveryPage) {
  switch (activePage) {
    case "ecosystem":        return <EcosystemOverview />;
    case "data-flow":        return <EndToEndDataFlow />;
    case "responsibilities": return <PlatformResponsibilities />;
    case "dct-overview":     return <DCTOverview />;
    case "roger-overview":   return <RogerOverview />;
    case "gosystem":         return <IMSIntegration />;
    case "pdc":              return <PDCOverview />;
    case "integration":      return <IntegrationArchitecture />;
    case "simulation":       return <DataFlowSimulation />;
    case "ba-discovery":     return <BARequirementDiscovery />;
    case "checklist":        return <DiscoveryChecklist />;
    case "glossary":         return <Glossary />;
    default:                 return null;
  }
}

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }: { onNavigate: (page: DiscoveryPage) => void }) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const selectedRolePath = ROLE_PATHS.find(r => r.role === selectedRole);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#3b82f6", fontSize: "18px", flexShrink: 0,
          }}>🧭</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0 }}>DCT Platform Discovery Center</h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              RSM · CATT · Architecture & Onboarding Knowledge Hub · Non-Production Workspace
            </div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.7", margin: "12px 0 0", maxWidth: "760px" }}>
          The Discovery Center is the <strong>authoritative onboarding and architecture reference</strong> for the DCT platform.
          It covers every system, integration, data flow, and governance boundary — structured for your role.
          Select your role below to get a personalized learning path, or use Quick Access to jump directly to a page.
        </p>
      </div>

      {/* ── Role-based entry paths ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
          Step 1 — Select Your Role
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
          {ROLE_PATHS.map(rp => {
            const isSelected = selectedRole === rp.role;
            return (
              <button
                key={rp.role}
                onClick={() => setSelectedRole(isSelected ? null : rp.role)}
                style={{
                  textAlign: "left", border: `2px solid ${isSelected ? rp.color : "#e2e8f0"}`,
                  borderRadius: "10px", padding: "14px",
                  backgroundColor: isSelected ? `${rp.color}11` : "white",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = rp.color; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "6px",
                    backgroundColor: rp.color, color: "white",
                    fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{rp.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{rp.role}</div>
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", lineHeight: "1.4" }}>{rp.desc}</div>
                {isSelected && (
                  <div style={{ marginTop: "8px", fontSize: "10px", fontWeight: 700, color: rp.color }}>
                    ✓ Path selected — see journey below
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Guided journey (shown when role is selected) ── */}
      {selectedRolePath && (
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
            Step 2 — Your Learning Journey: {selectedRolePath.role}
          </div>
          <div style={{
            backgroundColor: `${selectedRolePath.color}08`,
            border: `1px solid ${selectedRolePath.color}33`,
            borderRadius: "10px", padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
              {selectedRolePath.journey.map((step, i) => (
                <div key={step.page} style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  <button
                    onClick={() => onNavigate(step.page)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                      padding: "10px 14px", borderRadius: "8px",
                      backgroundColor: "white", border: `1px solid ${selectedRolePath.color}33`,
                      cursor: "pointer", transition: "all 0.15s", minWidth: "100px",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = selectedRolePath.color;
                      (e.currentTarget as HTMLElement).style.color = "white";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "white";
                      (e.currentTarget as HTMLElement).style.color = "inherit";
                    }}
                  >
                    <div style={{
                      width: "22px", height: "22px", borderRadius: "50%",
                      backgroundColor: selectedRolePath.color, color: "white",
                      fontSize: "11px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{step.step}</div>
                    <div style={{ fontSize: "10px", fontWeight: 600, color: "#0f1623", textAlign: "center", lineHeight: "1.3" }}>
                      {step.label}
                    </div>
                  </button>
                  {i < selectedRolePath.journey.length - 1 && (
                    <div style={{ fontSize: "16px", color: "#cbd5e1", padding: "0 4px" }}>→</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
              Click any step to navigate directly to that page.
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Access ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
          Quick Access — Jump Directly to a Page
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "10px" }}>
          {QUICK_ACCESS.map(qa => (
            <button
              key={qa.id}
              onClick={() => onNavigate(qa.id)}
              style={{
                textAlign: "left", border: "1px solid #e2e8f0",
                borderRadius: "8px", padding: "12px 14px",
                backgroundColor: "white", cursor: "pointer", transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = qa.color;
                (e.currentTarget as HTMLElement).style.backgroundColor = `${qa.color}08`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLElement).style.backgroundColor = "white";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "5px" }}>
                <div style={{
                  width: "24px", height: "24px", borderRadius: "5px",
                  backgroundColor: qa.color, color: "white",
                  fontSize: "11px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>{qa.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f1623", lineHeight: "1.2" }}>{qa.label}</div>
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.4", marginBottom: "6px" }}>{qa.sub}</div>
              {qa.badge && (
                <span style={{
                  fontSize: "8px", fontWeight: 700, color: "white",
                  backgroundColor: qa.badge === "Start Here" ? "#059669" : qa.badge === "KEY" ? "#dc2626" : qa.badge === "LIVE" ? "#059669" : "#1e3a5f",
                  borderRadius: "3px", padding: "1px 5px",
                }}>{qa.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── All pages by group ── */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "14px" }}>
          All Pages — Organized by Topic
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {NAV_GROUPS.map(group => (
            <div key={group.groupLabel} style={{
              border: `1px solid ${group.groupColor}22`,
              borderRadius: "10px", overflow: "hidden",
            }}>
              <div style={{
                padding: "10px 14px",
                backgroundColor: `${group.groupColor}11`,
                borderBottom: `1px solid ${group.groupColor}22`,
                fontSize: "11px", fontWeight: 700, color: group.groupColor,
                textTransform: "uppercase", letterSpacing: "0.08em",
              }}>
                {group.groupLabel}
              </div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: "100%", textAlign: "left", border: "none",
                    borderBottom: "1px solid #f1f5f9",
                    padding: "9px 14px", backgroundColor: "white",
                    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                    transition: "background-color 0.12s",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#f8fafc"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "white"}
                >
                  <span style={{ fontSize: "11px", color: group.groupColor, width: "16px", textAlign: "center", flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: "12px", color: "#1e293b", fontWeight: 500, flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: "8px", fontWeight: 700, color: "white",
                      backgroundColor: item.badgeColor, borderRadius: "3px", padding: "1px 4px", flexShrink: 0,
                    }}>{item.badge}</span>
                  )}
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>→</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform stats bar ── */}
      <div style={{
        backgroundColor: "#0f1623", borderRadius: "10px", padding: "16px 20px",
        display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Discovery Center
        </div>
        {[
          { label: "Pages", value: "14" },
          { label: "Platform Systems", value: "5" },
          { label: "Roles Served", value: "4" },
          { label: "Batches Covered", value: "40+" },
          { label: "APIs Documented", value: "9" },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "white" }}>{stat.value}</div>
            <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: "10px", color: "#475569" }}>Non-Production Workspace · Architecture Reference Only</div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DiscoveryCenter() {
  const [activePage, setActivePage] = useState<DiscoveryPage>("home");
  const [, navigate] = useLocation();

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const activeItem = allItems.find(n => n.id === activePage);
  const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activePage));

  return (
    <div style={{ display: "flex", height: "100%", backgroundColor: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* Sub-navigation sidebar */}
      <div style={{
        width: "220px", flexShrink: 0,
        backgroundColor: "#0f1623", borderRight: "1px solid #1e2a3a",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 14px 10px", borderBottom: "1px solid #1e2a3a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "6px",
              backgroundColor: "#1e3a5f", display: "flex", alignItems: "center",
              justifyContent: "center", color: "#3b82f6", fontSize: "14px", flexShrink: 0,
            }}>🧭</div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "12px", lineHeight: "1.2" }}>Discovery Center</div>
              <div style={{ color: "#64748b", fontSize: "9px" }}>DCT Platform Onboarding</div>
            </div>
          </div>
          <div style={{
            marginTop: "8px", padding: "5px 8px", borderRadius: "4px",
            backgroundColor: "#1e3a5f", border: "1px solid #2563eb22",
            fontSize: "9px", color: "#93c5fd", lineHeight: "1.4",
          }}>
            Learn the complete DCT ecosystem in under 15 minutes
          </div>
        </div>

        {/* Home button */}
        <div style={{ padding: "6px 0 0" }}>
          <button
            onClick={() => setActivePage("home")}
            style={{
              width: "100%", textAlign: "left", border: "none", cursor: "pointer",
              padding: "7px 14px",
              backgroundColor: activePage === "home" ? "rgba(59,130,246,0.15)" : "transparent",
              borderLeft: activePage === "home" ? "2px solid #3b82f6" : "2px solid transparent",
              display: "flex", alignItems: "center", gap: "7px",
            }}
          >
            <span style={{ fontSize: "11px", width: "14px", textAlign: "center", flexShrink: 0, color: activePage === "home" ? "#60a5fa" : "#64748b" }}>⌂</span>
            <span style={{ fontSize: "11px", color: activePage === "home" ? "#e2e8f0" : "#94a3b8", fontWeight: activePage === "home" ? 600 : 400 }}>
              Discovery Home
            </span>
            {activePage === "home" && (
              <span style={{ fontSize: "8px", padding: "1px 4px", borderRadius: "3px", fontWeight: 700, backgroundColor: "#059669", color: "white", flexShrink: 0 }}>
                HERE
              </span>
            )}
          </button>
        </div>

        {/* Grouped nav items */}
        <div style={{ padding: "4px 0", flex: 1 }}>
          {NAV_GROUPS.map(group => (
            <div key={group.groupLabel} style={{ marginBottom: "2px" }}>
              {/* Group header */}
              <div style={{
                padding: "8px 14px 3px",
                fontSize: "8px", fontWeight: 700, letterSpacing: "0.12em",
                textTransform: "uppercase", color: "#475569",
                borderTop: "1px solid #1e2a3a", marginTop: "4px",
              }}>
                <span style={{ color: group.groupColor, marginRight: "4px" }}>─</span>
                {group.groupLabel}
              </div>
              {/* Items */}
              {group.items.map(item => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    style={{
                      width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                      padding: "6px 14px 6px 20px",
                      backgroundColor: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                      borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                      display: "flex", alignItems: "center", gap: "7px",
                      transition: "background-color 0.15s",
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    <span style={{ fontSize: "10px", width: "14px", textAlign: "center", flexShrink: 0, color: isActive ? "#60a5fa" : "#64748b" }}>
                      {item.icon}
                    </span>
                    <span style={{
                      fontSize: "11px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: isActive ? "#e2e8f0" : "#94a3b8", fontWeight: isActive ? 600 : 400,
                    }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        fontSize: "7px", padding: "1px 3px", borderRadius: "3px", fontWeight: 700,
                        backgroundColor: item.badgeColor, color: "white", flexShrink: 0,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid #1e2a3a" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              fontSize: "10px", color: "#475569", background: "none", border: "none",
              cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px",
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#94a3b8"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#475569"}
          >
            ← Platform Home
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {/* Breadcrumb bar */}
        <div style={{
          padding: "10px 24px", borderBottom: "1px solid #e2e8f0",
          backgroundColor: "white", display: "flex", alignItems: "center", gap: "8px",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>DCT Platform</span>
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>›</span>
          <button
            onClick={() => setActivePage("home")}
            style={{ fontSize: "11px", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Discovery Center
          </button>
          {activePage !== "home" && (
            <>
              <span style={{ fontSize: "11px", color: "#cbd5e1" }}>›</span>
              {activeGroup && (
                <>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>{activeGroup.groupLabel}</span>
                  <span style={{ fontSize: "11px", color: "#cbd5e1" }}>›</span>
                </>
              )}
              <span style={{ fontSize: "11px", color: "#1e3a5f", fontWeight: 600 }}>{activeItem?.label}</span>
            </>
          )}
          <div style={{ flex: 1 }} />
          <div style={{
            fontSize: "9px", padding: "2px 7px", borderRadius: "3px", fontWeight: 700,
            backgroundColor: "#dbeafe", color: "#1e40af",
          }}>
            NON-PRODUCTION WORKSPACE
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1 }}>
          {activePage === "home"
            ? <LandingPage onNavigate={setActivePage} />
            : renderPage(activePage)
          }
        </div>
      </div>
    </div>
  );
}
