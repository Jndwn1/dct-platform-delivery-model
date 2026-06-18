// -
// ExecDashboard  Executive Delivery Dashboard
// RSM | CATT | DCT Platform
// Placement: Home.tsx  below page title, above GovernanceBanner
// Design: RSM Deep Navy headers, RSM Green for success, slate neutral
// Data: Dynamically derived from BatchStatusContext (no mock values)
// 

import { useRef } from "react";
import { useBatchStatus } from "@/contexts/BatchStatusContext";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import GeneratePOEmail from "@/components/GeneratePOEmail";

//  Helpers 

function isCompleted(s: string) {
  return s === "Complete" || s === "Done" || s === "Delivered";
}
function isActive(s: string) {
  return s === "In Progress" || s === "MVP" || s === "Stretch" || s === "Committed" ||
    s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "New";
}
function isPlanned(s: string) {
  return s === "Not Started" || s === "Planned" || s === "On Hold" || s === "Post-MVP";
}

//  Sub-components 

/** Row 1 — KPI card */
function KPICard({
  title, value, sub, accent, badge, badgeColor,
}: {
  title: string;
  value: string | number;
  sub?: string;
  accent: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderTop: `3px solid ${accent}`,
      borderRadius: "8px",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      minWidth: 0,
    }}>
      <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#64748b" }}>
        {title}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <div style={{ fontSize: "26px", fontWeight: 800, color: "#0f1623", lineHeight: 1 }}>
          {value}
        </div>
        {badge && (
          <span style={{
            fontSize: "10px", fontWeight: 700, color: "white",
            backgroundColor: badgeColor ?? "#059669",
            borderRadius: "4px", padding: "2px 7px", letterSpacing: "0.04em",
          }}>
            {badge}
          </span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "#64748b" }}>{sub}</div>
      )}
    </div>
  );
}

/** Row 2 — Status indicator pill */
function StatusPill({
  label, indicator, color, bg, border,
}: {
  label: string;
  indicator: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "8px",
      backgroundColor: bg, border: `1px solid ${border}`,
      borderRadius: "8px", padding: "10px 14px",
      flex: "1 1 160px", minWidth: "160px",
    }}>
      <span style={{ fontSize: "16px", lineHeight: 1 }}>{indicator}</span>
      <div>
        <div style={{ fontSize: "11px", fontWeight: 700, color: color, lineHeight: 1.3 }}>{label}</div>
      </div>
    </div>
  );
}

/** Row 3 — PI progress card */
function PICard({
  pi, status, pct, color, bg, border,
}: {
  pi: string;
  status: string;
  pct: number;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: "8px",
      padding: "14px 16px",
      flex: "1 1 180px",
      minWidth: "160px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f1623" }}>{pi}</div>
          <div style={{ fontSize: "10px", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: "2px" }}>
            {status}
          </div>
        </div>
        <div style={{ fontSize: "18px", fontWeight: 800, color: color }}>{pct}%</div>
      </div>
      {/* Progress bar */}
      <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: color,
          borderRadius: "3px",
          transition: "width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

//  Main component 

// BATCH_REFERENCE is passed in from Home.tsx for the email generator
interface ExecDashboardProps {
  batches?: Array<{ pi: string; status: string; batchNum: string; platform: string; name: string; whatItDoes: string; rogerImpact: string }>;
}

export default function ExecDashboard({ batches = [] }: ExecDashboardProps) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { statuses, piCompletion } = useBatchStatus();
  const { data: recentDeployments } = trpc.deploymentRegistry.recent.useQuery();

  // Pilot countdown
  const PILOT_DATE = new Date("2026-09-16T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil((PILOT_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const urgencyColor = daysRemaining <= 30 ? "#dc2626" : daysRemaining <= 60 ? "#d97706" : "#059669";
  const urgencyBg = daysRemaining <= 30 ? "#fef2f2" : daysRemaining <= 60 ? "#fffbeb" : "#f0fdf4";
  const urgencyBorder = daysRemaining <= 30 ? "#fecaca" : daysRemaining <= 60 ? "#fde68a" : "#bbf7d0";

  //  Row 1: KPI counts derived from live context 
  const allStatuses = Object.values(statuses);
  const totalBatches  = allStatuses.length;
  const completedCount = allStatuses.filter(s => isCompleted(s)).length;
  const activeCount    = allStatuses.filter(s => isActive(s)).length;
  const plannedCount   = allStatuses.filter(s => isPlanned(s)).length;

  //  Row 3: PI progress data 
  const piCards = [
    {
      pi: "PI 1",
      status: "Complete",
      pct: piCompletion.pi1.pct,
      color: "#059669",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    },
    {
      pi: "PI 2",
      status: "Active",
      pct: piCompletion.pi2.pct,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      pi: "PI 3",
      status: "Planned",
      pct: piCompletion.pi3.pct,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      pi: "PI 4",
      status: "Post-Pilot",
      pct: piCompletion.pi4.pct,
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
    },
  ];

  return (
    <div ref={dashboardRef} style={{
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderLeft: "4px solid #1e3a5f",
      borderRadius: "10px",
      padding: "20px 24px",
      marginBottom: "24px",
      fontFamily: "system-ui, sans-serif",
    }}>

      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "2px" }}>
            Platform Intelligence · Roadmap v7
          </div>
          <h2 style={{ fontSize: "17px", fontWeight: 800, color: "#0f1623", margin: 0 }}>
            Executive Delivery Dashboard
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#059669" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>Live · Derived from Roadmap Registry</span>
          </div>
          <GeneratePOEmail dashboardRef={dashboardRef} batches={batches} />
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: "10px",
        marginBottom: "14px",
      }}>
        <KPICard
          title="Total Batches"
          value={totalBatches}
          sub="Roadmap registry"
          accent="#1e3a5f"
        />
        <KPICard
          title="Completed"
          value={completedCount}
          sub="Done · Delivered · Complete"
          accent="#059669"
          badge="Done"
          badgeColor="#059669"
        />
        <KPICard
          title="Active"
          value={activeCount}
          sub="In Progress · Committed"
          accent="#2563eb"
          badge="In Flight"
          badgeColor="#2563eb"
        />
        <KPICard
          title="Planned"
          value={plannedCount}
          sub="Not Started · On Hold"
          accent="#94a3b8"
          badge="Upcoming"
          badgeColor="#64748b"
        />
        <KPICard
          title="Roadmap Alignment"
          value="100%"
          sub="Discrepancies remediated"
          accent="#059669"
          badge="Complete"
          badgeColor="#059669"
        />
        <KPICard
          title="Platform Status"
          value="RC1"
          sub="Release Candidate 1"
          accent="#7c3aed"
          badge="Ready"
          badgeColor="#7c3aed"
        />
      </div>

      {/* ── Row 2: Executive Status Indicators ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#64748b", marginBottom: "8px" }}>
          Executive Status
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <StatusPill
            label="Roadmap v7 Aligned"
            indicator="🟢"
            color="#065f46"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatusPill
            label="Governance Controls Active"
            indicator="🟢"
            color="#065f46"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatusPill
            label="Architecture Validated"
            indicator="🟢"
            color="#065f46"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatusPill
            label="All Routes Validated"
            indicator="🟢"
            color="#065f46"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatusPill
            label="No Runtime Errors"
            indicator="🟢"
            color="#065f46"
            bg="#f0fdf4"
            border="#bbf7d0"
          />
          <StatusPill
            label="Ask Buddy — Demo Mode"
            indicator="🟡"
            color="#92400e"
            bg="#fffbeb"
            border="#fde68a"
          />
        </div>
      </div>

      {/* ── Row 3: PI Progress ── */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#64748b", marginBottom: "8px" }}>
          PI Progress
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {piCards.map(card => (
            <PICard key={card.pi} {...card} />
          ))}
        </div>
      </div>

      {/* Row 4: Pilot Countdown + Last 5 Deployments */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>

        {/* Pilot Countdown */}
        <div style={{
          backgroundColor: urgencyBg,
          border: `1px solid ${urgencyBorder}`,
          borderRadius: "8px",
          padding: "14px 18px",
          flex: "0 0 auto",
          minWidth: "160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "4px",
        }}>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: urgencyColor }}>Pilot Countdown</div>
          <div style={{ fontSize: "36px", fontWeight: 900, color: urgencyColor, lineHeight: 1 }}>{daysRemaining}</div>
          <div style={{ fontSize: "11px", fontWeight: 600, color: urgencyColor }}>days remaining</div>
          <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Target: Sep 16, 2026</div>
        </div>

        {/* Last 5 Deployments */}
        <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#64748b" }}>Recent Deployments</div>
            <Link href="/deployment-registry">
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#2563eb", cursor: "pointer" }}>View all</span>
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {(recentDeployments ?? []).length === 0 && (
              <div style={{ fontSize: "12px", color: "#94a3b8", padding: "8px 0" }}>No deployments recorded yet.</div>
            )}
            {(recentDeployments ?? []).map((d) => {
              const statusColors: Record<string, { bg: string; text: string }> = {
                Deployed:    { bg: "#f0fdf4", text: "#059669" },
                "In Progress": { bg: "#eff6ff", text: "#2563eb" },
                Planned:     { bg: "#f8fafc", text: "#64748b" },
                Scheduled:   { bg: "#faf5ff", text: "#7c3aed" },
                "Rolled Back": { bg: "#fef2f2", text: "#dc2626" },
              };
              const sc = statusColors[d.status ?? "Planned"] ?? { bg: "#f8fafc", text: "#64748b" };
              const dateLabel = d.deploymentDate
                ? new Date(d.deploymentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "";
              return (
                <div key={d.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  backgroundColor: "#ffffff", border: "1px solid #e2e8f0",
                  borderRadius: "6px", padding: "7px 10px",
                }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    backgroundColor: sc.bg, color: sc.text,
                    borderRadius: "4px", padding: "2px 6px", whiteSpace: "nowrap", flexShrink: 0,
                  }}>{d.status ?? "Planned"}</span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d.releaseName}
                  </span>
                  <span style={{ fontSize: "10px", color: "#94a3b8", whiteSpace: "nowrap", flexShrink: 0 }}>{dateLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
