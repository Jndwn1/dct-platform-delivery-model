// Sidebar — RSM Command Center design
// Router-based navigation, 9 modules across two groups

import { useLocation } from "wouter";
import {
  LayoutDashboard, GitBranch, CheckSquare, Activity, FileText,
  Zap, Map, Play, Search
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  group: "governance" | "platform";
}

const navItems: NavItem[] = [
  // Governance group
  { id: "dashboard",   label: "Dashboard",     path: "/",              icon: <LayoutDashboard size={14} />, group: "governance" },
  { id: "batches",     label: "Batch Roadmap", path: "/batch-roadmap", icon: <GitBranch size={14} />,       group: "governance" },
  { id: "gates",       label: "Gate Status",   path: "/gate-status",   icon: <CheckSquare size={14} />,     group: "governance" },
  { id: "touchpoints", label: "Touchpoints",   path: "/touchpoints",   icon: <Activity size={14} />,        group: "governance" },
  { id: "artifacts",   label: "Artifacts",     path: "/artifacts",     icon: <FileText size={14} />,        group: "governance" },
  // Platform group
  { id: "agent-hub",   label: "Agent Hub",     path: "/agent-hub",     icon: <Zap size={14} />,             group: "platform" },
  { id: "architecture",label: "Architecture",  path: "/architecture",  icon: <Map size={14} />,             group: "platform" },
  { id: "demo",        label: "Demo Runner",   path: "/demo",          icon: <Play size={14} />,            group: "platform" },
  { id: "lineage",     label: "Lineage",       path: "/lineage",       icon: <Search size={14} />,          group: "platform" },
];

interface SidebarProps {
  activeSection: string;
}

export default function Sidebar({ activeSection }: SidebarProps) {
  const [, navigate] = useLocation();

  const govItems = navItems.filter(n => n.group === "governance");
  const platItems = navItems.filter(n => n.group === "platform");

  const renderItem = (item: NavItem) => {
    const isActive = activeSection === item.id;
    return (
      <button
        key={item.id}
        onClick={() => navigate(item.path)}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-all text-left"
        style={{
          color: isActive ? "white" : "oklch(0.72 0.04 264)",
          background: isActive ? "oklch(0.30 0.10 264)" : "transparent",
          borderLeft: isActive ? "3px solid oklch(0.52 0.18 264)" : "3px solid transparent",
        }}
      >
        <span className="flex-shrink-0">{item.icon}</span>
        <span className="text-xs">{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-52 flex-shrink-0 flex flex-col h-full" style={{ background: "oklch(0.22 0.10 264)" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b" style={{ borderColor: "oklch(0.32 0.08 264)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "oklch(0.52 0.18 264)" }}>
            R
          </div>
          <span className="text-white font-bold text-sm tracking-wide">RSM</span>
        </div>
        <div className="text-xs leading-tight" style={{ color: "oklch(0.65 0.04 264)" }}>
          DCT Platform<br />Executive Demo
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-3">
        {/* Governance group */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-1"
            style={{ color: "oklch(0.50 0.06 264)" }}>
            Governance
          </div>
          <div className="space-y-0.5">
            {govItems.map(renderItem)}
          </div>
        </div>

        {/* Platform group */}
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-1"
            style={{ color: "oklch(0.50 0.06 264)" }}>
            Platform
          </div>
          <div className="space-y-0.5">
            {platItems.map(renderItem)}
          </div>
        </div>
      </nav>

      {/* Active batch footer */}
      <div className="px-3 py-3 border-t" style={{ borderColor: "oklch(0.32 0.08 264)" }}>
        <div className="text-xs px-2 mb-2" style={{ color: "oklch(0.55 0.06 264)" }}>
          <div className="font-semibold uppercase tracking-widest mb-0.5">Active Batch</div>
          <div className="text-white font-medium text-xs">AB-01</div>
          <div className="text-xs leading-tight" style={{ color: "oklch(0.65 0.04 264)" }}>
            Foundation & Source Onboarding
          </div>
        </div>
        <div className="px-2">
          <div className="flex justify-between text-xs mb-1" style={{ color: "oklch(0.65 0.04 264)" }}>
            <span>Progress</span>
            <span className="text-white font-semibold">78%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "oklch(0.32 0.08 264)" }}>
            <div className="h-1.5 rounded-full" style={{ width: "78%", background: "oklch(0.52 0.18 264)" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
