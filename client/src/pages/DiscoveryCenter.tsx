// Discovery Center — Onboarding & Architecture Hub for DCT Platform
// Serves as the primary onboarding experience for BAs, POs, Developers, QA, and Architects

import { useState } from "react";
import { useLocation } from "wouter";

// Sub-page imports
import EcosystemOverview from "./discovery/EcosystemOverview";
import EndToEndDataFlow from "./discovery/EndToEndDataFlow";
import PlatformResponsibilities from "./discovery/PlatformResponsibilities";
import DCTOverview from "./discovery/DCTOverview";
import RogerOverview from "./discovery/RogerOverview";
import GoSystemTax from "./discovery/GoSystemTax";
import IntegrationArchitecture from "./discovery/IntegrationArchitecture";
import DataFlowSimulation from "./discovery/DataFlowSimulation";
import BARequirementDiscovery from "./discovery/BARequirementDiscovery";
import DiscoveryChecklist from "./discovery/DiscoveryChecklist";
import Glossary from "./discovery/Glossary";

type DiscoveryPage =
  | "ecosystem"
  | "data-flow"
  | "responsibilities"
  | "dct-overview"
  | "roger-overview"
  | "gosystem"
  | "integration"
  | "simulation"
  | "ba-discovery"
  | "checklist"
  | "glossary";

const NAV_ITEMS: { id: DiscoveryPage; label: string; icon: string; badge?: string; badgeColor?: string }[] = [
  { id: "ecosystem",       label: "Ecosystem Overview",       icon: "⬡", badge: "Start Here", badgeColor: "#059669" },
  { id: "data-flow",       label: "End-to-End Data Flow",     icon: "→" },
  { id: "responsibilities",label: "Platform Responsibilities", icon: "▦" },
  { id: "dct-overview",    label: "DCT Overview",             icon: "◉" },
  { id: "roger-overview",  label: "Roger Overview",           icon: "◈" },
  { id: "gosystem",        label: "GoSystem Tax",             icon: "⚑" },
  { id: "integration",     label: "Integration Architecture", icon: "↝" },
  { id: "simulation",      label: "Data Flow Simulation",     icon: "🎮", badge: "Interactive", badgeColor: "#7c3aed" },
  { id: "ba-discovery",    label: "BA Requirement Discovery", icon: "🔍", badge: "Key", badgeColor: "#dc2626" },
  { id: "checklist",       label: "Discovery Checklist",      icon: "☑" },
  { id: "glossary",        label: "Glossary",                 icon: "≡" },
];

export default function DiscoveryCenter() {
  const [activePage, setActivePage] = useState<DiscoveryPage>("ecosystem");
  const [, navigate] = useLocation();

  const renderPage = () => {
    switch (activePage) {
      case "ecosystem":        return <EcosystemOverview />;
      case "data-flow":        return <EndToEndDataFlow />;
      case "responsibilities": return <PlatformResponsibilities />;
      case "dct-overview":     return <DCTOverview />;
      case "roger-overview":   return <RogerOverview />;
      case "gosystem":         return <GoSystemTax />;
      case "integration":      return <IntegrationArchitecture />;
      case "simulation":       return <DataFlowSimulation />;
      case "ba-discovery":     return <BARequirementDiscovery />;
      case "checklist":        return <DiscoveryChecklist />;
      case "glossary":         return <Glossary />;
      default:                 return <EcosystemOverview />;
    }
  };

  const activeItem = NAV_ITEMS.find(n => n.id === activePage);

  return (
    <div style={{ display: "flex", height: "100%", backgroundColor: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* Sub-navigation sidebar */}
      <div style={{
        width: "220px",
        flexShrink: 0,
        backgroundColor: "#0f1623",
        borderRight: "1px solid #1e2a3a",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
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

        {/* Nav items */}
        <div style={{ padding: "6px 0", flex: 1 }}>
          {NAV_ITEMS.map((item, idx) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  width: "100%", textAlign: "left", border: "none", cursor: "pointer",
                  padding: "7px 14px",
                  backgroundColor: isActive ? "rgba(59,130,246,0.15)" : "transparent",
                  borderLeft: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                  display: "flex", alignItems: "center", gap: "7px",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              >
                <span style={{ fontSize: "11px", width: "14px", textAlign: "center", flexShrink: 0, color: isActive ? "#60a5fa" : "#64748b" }}>
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
                    fontSize: "8px", padding: "1px 4px", borderRadius: "3px", fontWeight: 700,
                    backgroundColor: item.badgeColor, color: "white", flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
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
        {/* Page breadcrumb bar */}
        <div style={{
          padding: "10px 24px", borderBottom: "1px solid #e2e8f0",
          backgroundColor: "white", display: "flex", alignItems: "center", gap: "8px",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>DCT Platform</span>
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>›</span>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Discovery Center</span>
          <span style={{ fontSize: "11px", color: "#cbd5e1" }}>›</span>
          <span style={{ fontSize: "11px", color: "#1e3a5f", fontWeight: 600 }}>{activeItem?.label}</span>
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
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
