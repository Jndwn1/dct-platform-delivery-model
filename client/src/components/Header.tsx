// Header — RSM Command Center design
// RSM dark blue header bar with white text, batch selector, and status indicator

import { Bell, RefreshCw } from "lucide-react";

export default function Header() {
  return (
    <header className="rsm-header flex items-center justify-between px-6 py-3 flex-shrink-0">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-white font-semibold text-base tracking-tight">
            DCT Platform Gate Verification Dashboard
          </h1>
          <p className="text-xs" style={{ color: "oklch(0.70 0.04 264)" }}>
            RSM | CATT · Center for Advanced Tax Technology · Delivery Model v1.0
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active batch indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded text-xs"
          style={{ background: "oklch(0.30 0.10 264)", border: "1px solid oklch(0.40 0.10 264)" }}>
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-white font-medium">AB-01 Active</span>
          <span style={{ color: "oklch(0.70 0.04 264)" }}>· G1 Pending</span>
        </div>

        {/* Last updated */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.70 0.04 264)" }}>
          <RefreshCw size={12} />
          <span>Mar 11, 2026</span>
        </div>

        {/* Notification badge */}
        <div className="relative">
          <Bell size={16} className="text-white opacity-70" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-gray-900"
            style={{ fontSize: "9px" }}>
            2
          </div>
        </div>
      </div>
    </header>
  );
}
