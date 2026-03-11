// Sidebar — RSM Command Center design
// Fixed left rail, RSM dark blue background, white text

import { LayoutDashboard, GitBranch, CheckSquare, FileText, Activity, Settings } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "batches", label: "Batch Roadmap", icon: GitBranch },
  { id: "gates", label: "Gate Status", icon: CheckSquare },
  { id: "touchpoints", label: "Touchpoints", icon: Activity },
  { id: "artifacts", label: "Artifacts", icon: FileText },
];

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full" style={{ background: "oklch(0.22 0.10 264)" }}>
      {/* Logo area */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "oklch(0.32 0.08 264)" }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "oklch(0.52 0.18 264)" }}>
            R
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">RSM</span>
        </div>
        <div className="text-xs leading-tight" style={{ color: "oklch(0.70 0.04 264)" }}>
          DCT Platform<br />Gate Verification
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-xs font-semibold uppercase tracking-widest px-2 mb-2"
          style={{ color: "oklch(0.55 0.06 264)" }}>
          Navigation
        </div>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-all text-left"
            style={{
              color: activeSection === id ? "white" : "oklch(0.72 0.04 264)",
              background: activeSection === id ? "oklch(0.30 0.10 264)" : "transparent",
              borderLeft: activeSection === id ? "3px solid oklch(0.52 0.18 264)" : "3px solid transparent",
            }}
          >
            <Icon size={15} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "oklch(0.32 0.08 264)" }}>
        <div className="text-xs px-2 mb-3" style={{ color: "oklch(0.55 0.06 264)" }}>
          <div className="font-semibold uppercase tracking-widest mb-1">Active Batch</div>
          <div className="text-white font-medium">AB-01</div>
          <div style={{ color: "oklch(0.70 0.04 264)" }}>Foundation & Source Onboarding</div>
        </div>
        <div className="px-2">
          <div className="flex justify-between text-xs mb-1" style={{ color: "oklch(0.70 0.04 264)" }}>
            <span>Progress</span>
            <span className="text-white font-semibold">78%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "oklch(0.32 0.08 264)" }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: "78%", background: "oklch(0.52 0.18 264)" }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
