// DCT Platform Gate Verification Dashboard — Main Page
// Design: RSM Command Center | Prototype Sandbox / UI Dashboards
// RSM Blue #003A8F authority palette, sidebar nav, gate rail, T1–T11 journey, batch accordion

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import KPIStrip from "@/components/KPIStrip";
import GateRail from "@/components/GateRail";
import TouchpointJourney from "@/components/TouchpointJourney";
import BatchAccordion from "@/components/BatchAccordion";
import GateDetailPanel from "@/components/GateDetailPanel";
import { activeBatch, type Gate } from "@/lib/dctData";

export default function Home() {
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed Sidebar */}
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* KPI Summary Strip */}
          <KPIStrip />

          {/* Gate Status Rail */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Gate Verification Status — AB-01
              </h2>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">Active Batch</span>
            </div>
            <GateRail
              gates={activeBatch.gates}
              onSelectGate={setSelectedGate}
              selectedGateId={selectedGate?.id}
            />
          </section>

          {/* Touchpoint Journey */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Touchpoint Runtime Journey — T1 through T11
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <TouchpointJourney />
          </section>

          {/* Gate Detail Panel (shown when gate selected) */}
          {selectedGate && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Gate Detail — {selectedGate.id}: {selectedGate.name}
                </h2>
                <div className="flex-1 h-px bg-border" />
                <button
                  onClick={() => setSelectedGate(null)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close ×
                </button>
              </div>
              <GateDetailPanel gate={selectedGate} />
            </section>
          )}

          {/* Architectural Batch Roadmap */}
          <section>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Architectural Batch Roadmap — AB-01 through AB-06
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
            <BatchAccordion />
          </section>

          {/* Footer */}
          <footer className="pt-4 pb-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>DCT Platform Gate Verification Dashboard · RSM | CATT · v1.0</span>
              <span>Governed by the DCT Delivery Model · Last updated March 11, 2026</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
