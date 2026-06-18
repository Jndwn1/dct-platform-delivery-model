// -
// ExecDashboard  Executive Delivery Dashboard
// RSM | CATT | DCT Platform
// Placement: Home.tsx  below page title, above GovernanceBanner
// Design: RSM Deep Navy headers, RSM Green for success, slate neutral
// Data: Dynamically derived from BATCH_CALENDAR_PI23 (Batch Calendar source of truth)
// 

import { useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import GeneratePOEmail from "@/components/GeneratePOEmail";

// ─── Batch Calendar PI 2 + PI 3 (mirrors Home.tsx BATCH_CALENDAR_PI23) ─────────
// This is the single source of truth for all Executive Dashboard KPI calculations.
const BATCH_CALENDAR_PI23: Array<{
  pi: string; status: string; batch: string; feat: string; name: string;
  startDate: string; endDate: string; whatItDoes: string; rogerImpact: string;
}> = [
  // ── PI 2 ──
  { pi: "PI 2", status: "Done",        batch: "B4",    feat: "TDC",     name: "AI Mapping Proposals & Decisions",                                   startDate: "",          endDate: "Done",      whatItDoes: "Generates AI tax-mapping proposals with confidence and evidence per account.",                                                                  rogerImpact: "Line Mappings (stage 2)" },
  { pi: "PI 2", status: "Done",        batch: "B5",    feat: "PDC",     name: "Entity Identity & Structure",                                       startDate: "Wed 4/22",  endDate: "Thu 4/30",  whatItDoes: "Gives every client and entity a permanent identity and access scope.",                                                                          rogerImpact: "Client / entity selection" },
  { pi: "PI 2", status: "Done",        batch: "B6",    feat: "TDC",     name: "Practitioner Review & Lock",                                        startDate: "Wed 4/22",  endDate: "Thu 4/30",  whatItDoes: "Practitioners review, decide, and lock mappings; decisions are immutable.",                                                                     rogerImpact: "Review & lock" },
  { pi: "PI 2", status: "Done",        batch: "B2A",   feat: "PDC",     name: "Orchestrator Classification Result & Contract Enforcement",          startDate: "Wed 4/29",  endDate: "Mon 5/9",   whatItDoes: "Enforces the orchestrator's classification result and contract at intake.",                                                                      rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "Done",        batch: "B7",    feat: "TDC",     name: "Client Tax Profile & Eligibility",                                  startDate: "Fri 5/1",   endDate: "Mon 5/11",  whatItDoes: "Holds the client tax profile and determines which rules apply.",                                                                               rogerImpact: "Eligibility" },
  { pi: "PI 2", status: "Done",        batch: "B8",    feat: "PDC",     name: "Exceptions & Remediation",                                          startDate: "Tue 5/12",  endDate: "Wed 5/20",  whatItDoes: "Surfaces cross-LOB ingestion and data exceptions for remediation.",                                                                             rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",        batch: "B8",    feat: "TDC",     name: "Exceptions & Remediation",                                          startDate: "Tue 5/12",  endDate: "Wed 5/20",  whatItDoes: "Surfaces tax-side exceptions for remediation.",                                                                                               rogerImpact: "Exceptions surfacing" },
  { pi: "PI 2", status: "Done",        batch: "B9",    feat: "Gateway", name: "Roger Gateway & Governed Consumer Access Layer",                    startDate: "Thu 5/21",  endDate: "Tue 6/2",   whatItDoes: "Governed gateway exposing approved upstream data to consumers.",                                                                               rogerImpact: "None (gateway)" },
  { pi: "PI 2", status: "Done",        batch: "B10",   feat: "TDC",     name: "Return Assembly, Filing & Lineage",                                 startDate: "Wed 6/3",   endDate: "Fri 6/5",   whatItDoes: "Assembles the return, creates the immutable filing record, anchors lineage.",                                                                    rogerImpact: "Form 1120 / filing (stage 10)" },
  { pi: "PI 2", status: "Done",        batch: "B43",   feat: "TDC",     name: "Practitioner Book & Reclass Adjustments",                           startDate: "Wed 6/10",  endDate: "Tue 6/16",  whatItDoes: "Persists practitioner book and reclass adjustments as a multi-line model.",                                                                 rogerImpact: "High: Book Adjustment & Reclass Adjustment (stages 4-5)" },
  { pi: "PI 2", status: "In Progress", batch: "B9",    feat: "Gateway", name: "Roger Gateway - TDC Integration Endpoints",                         startDate: "Wed 6/17",  endDate: "Fri 6/19",  whatItDoes: "Extends the governed gateway to TDC consumers.",                                                                                              rogerImpact: "None (gateway)" },
  { pi: "PI 2", status: "In Progress", batch: "B11",   feat: "TDC",     name: "Learning Governance & Model Evolution",                             startDate: "Wed 6/17",  endDate: "Thu 6/25",  whatItDoes: "Captures learning from real decisions under consent; governs model evolution.",                                                                 rogerImpact: "None (behind the scenes)" },
  { pi: "PI 2", status: "In Progress", batch: "B42",   feat: "TDC",     name: "Tax Rules Framework & Book-to-Tax Adjustment Rules",                startDate: "Wed 6/17",  endDate: "Thu 6/25",  whatItDoes: "Computes book-to-tax adjustments from governed, configured rules.",                                                                            rogerImpact: "High: Tax Adjustment (stage 7) + rule admin screen" },
  { pi: "PI 2", status: "Stretch",     batch: "B16",   feat: "PDC",     name: "Audit Trail & Lineage Governance",                                  startDate: "Mon 6/22",  endDate: "Tue 6/30",  whatItDoes: "Records the cross-LOB audit trail and lineage as governed events.",                                                                             rogerImpact: "None (audit / lineage)" },
  // ── PI 3 ──
  { pi: "PI 3", status: "MVP",         batch: "B16",   feat: "TDC",     name: "Audit Trail & Lineage Governance",                                  startDate: "Mon 7/13",  endDate: "Tue 7/21",  whatItDoes: "Records the tax-side audit trail and lineage as governed events.",                                                                             rogerImpact: "None (audit / lineage)" },
  { pi: "PI 3", status: "MVP",         batch: "B31",   feat: "PDC",     name: "Legacy Tool Prior Year Ingestion",                                  startDate: "Wed 7/1",   endDate: "Mon 7/13",  whatItDoes: "Ingests prior-year data from legacy tools (TWB via CDS / DUO).",                                                                              rogerImpact: "Low: prior-year data appears on TB / rollforward" },
  { pi: "PI 3", status: "MVP",         batch: "B28",   feat: "TDC",     name: "Tax Workpaper & Provision Schedules",                               startDate: "Wed 7/22",  endDate: "Thu 7/30",  whatItDoes: "Produces workpapers and provision schedules (M-1/M-3, Sch J/L, depreciation).",                                                               rogerImpact: "High: Book Return Review & Book to Tax Reconciliation (stages 6, 9)" },
  { pi: "PI 3", status: "MVP",         batch: "B9a",   feat: "Gateway", name: "Data Gateway (IMS, CDS, DUO, Tax Portal)",                          startDate: "Tue 7/14",  endDate: "Wed 7/22",  whatItDoes: "Extends the gateway to new sources (IMS, CDS, DUO) for automated retrieval.",                                                                 rogerImpact: "None (gateway / connectors)" },
  { pi: "PI 3", status: "MVP",         batch: "B39",   feat: "TDC",     name: "Calculation Report",                                                startDate: "Fri 7/31",  endDate: "Mon 8/10",  whatItDoes: "Produces the packaged, partner-ready calculation and sign-off report.",                                                                         rogerImpact: "High: Book to Tax Report (stage 8) + packaged report" },
  { pi: "PI 3", status: "MVP",         batch: "B20",   feat: "PDC",     name: "Firm Governance & Professional Standards",                          startDate: "Thu 7/23",  endDate: "Fri 7/31",  whatItDoes: "Holds firm governance and professional standards that gate sign-off.",                                                                          rogerImpact: "None: gates sign-off, no new screen" },
  { pi: "PI 3", status: "MVP",         batch: "B29",   feat: "TDC",     name: "Consolidated Return Assembly",                                      startDate: "Tue 8/11",  endDate: "Wed 8/19",  whatItDoes: "Assembles consolidated C-corp returns with eliminations and group adjustments.",                                                                rogerImpact: "High: consolidated / multi-entity views + Form 1120" },
  { pi: "PI 3", status: "MVP",         batch: "B21",   feat: "PDC",     name: "Quality Control Standards",                                        startDate: "Mon 8/3",   endDate: "Tue 8/11",  whatItDoes: "Holds quality-control review standards and concurring-partner rules.",                                                                          rogerImpact: "None: reference only, no new screen" },
  { pi: "PI 3", status: "MVP",         batch: "B17",   feat: "TDC",     name: "Decision Support, Overrides, Evidence & Workpapers",               startDate: "Thu 8/20",  endDate: "Fri 8/28",  whatItDoes: "Adds override policies, evidence on decisions, and workpaper lock to snapshot.",                                                                rogerImpact: "Med: wire evidence / override / lock into review screens" },
  { pi: "PI 3", status: "MVP",         batch: "B26",   feat: "PDC",     name: "Entity Constituents & Allocations",                                 startDate: "Wed 8/12",  endDate: "Thu 8/20",  whatItDoes: "Models sub-entities (divisions, branches) and inter-entity allocations.",                                                                       rogerImpact: "None: structure only in MVP" },
  { pi: "PI 3", status: "MVP",         batch: "B31",   feat: "TDC",     name: "Legacy Tool Prior Year Data Housing",                               startDate: "Mon 8/31",  endDate: "Wed 9/9",   whatItDoes: "Houses prior-year balances, filed amounts, and carryforwards in TDC.",                                                                          rogerImpact: "Low: prior-year shown on rollforward / TB" },
  { pi: "PI 3", status: "Stretch",     batch: "B33",   feat: "TDC",     name: "State Reference, Apportionment, Payments, NOL/Credit, Forms, TX Franchise", startDate: "Thu 9/10", endDate: "Fri 9/18", whatItDoes: "Adds state apportionment, nexus, payments, NOL/credit, forms, TX franchise.", rogerImpact: "High (stretch): state screens" },
];

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
  const { data: recentDeployments } = trpc.deploymentRegistry.recent.useQuery();

  // Pilot countdown
  const PILOT_DATE = new Date("2026-09-16T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemaining = Math.max(0, Math.ceil((PILOT_DATE.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const urgencyColor = daysRemaining <= 30 ? "#dc2626" : daysRemaining <= 60 ? "#d97706" : "#059669";
  const urgencyBg = daysRemaining <= 30 ? "#fef2f2" : daysRemaining <= 60 ? "#fffbeb" : "#f0fdf4";
  const urgencyBorder = daysRemaining <= 30 ? "#fecaca" : daysRemaining <= 60 ? "#fde68a" : "#bbf7d0";

  // ── Row 1: KPI counts derived from Batch Calendar ──
  const totalBatches   = BATCH_CALENDAR_PI23.length;
  const completedCount = BATCH_CALENDAR_PI23.filter(b => b.status === "Done").length;
  const activeCount    = BATCH_CALENDAR_PI23.filter(b => b.status === "In Progress").length;
  // Planned = PI 3 MVP batches (represents planned future work)
  const plannedCount   = BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 3" && b.status === "MVP").length;

  // ── Row 3: PI progress data derived from Batch Calendar ──
  const pi2Rows  = BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 2");
  const pi3Rows  = BATCH_CALENDAR_PI23.filter(b => b.pi === "PI 3");
  const pi2Done  = pi2Rows.filter(b => b.status === "Done").length;
  const pi3Done  = pi3Rows.filter(b => b.status === "Done").length;
  const pi2Pct   = pi2Rows.length > 0 ? Math.round((pi2Done / pi2Rows.length) * 100) : 0;
  const pi3Pct   = pi3Rows.length > 0 ? Math.round((pi3Done / pi3Rows.length) * 100) : 0;

  const piCards = [
    {
      pi: "PI 1",
      status: "Complete",
      pct: 100,
      color: "#059669",
      bg: "#f0fdf4",
      border: "#bbf7d0",
    },
    {
      pi: "PI 2",
      status: "Active",
      pct: pi2Pct,
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
    {
      pi: "PI 3",
      status: "MVP",
      pct: pi3Pct,
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
    },
    {
      pi: "PI 4",
      status: "Post Pilot",
      pct: 0,
      color: "#7c3aed",
      bg: "#faf5ff",
      border: "#e9d5ff",
    },
  ];

  return (
    <div ref={dashboardRef} style={{
      backgroundColor: "#ffffff",
      border: "1px solid #e2e8f0",
      borderLeft: "5px solid #1e3a5f",
      borderRadius: "10px",
      padding: "24px 28px",
      marginBottom: "0",
      fontFamily: "system-ui, sans-serif",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}>

      {/* ── Section header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "3px" }}>
            Platform Intelligence · Roadmap v7
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, color: "#0f1623", margin: 0, letterSpacing: "-0.01em" }}>
            Executive Delivery Dashboard
          </h2>
          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", fontWeight: 500 }}>
            Real-time delivery status, roadmap alignment, readiness, and governance health.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#059669" }} />
            <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>Live · Derived from Batch Calendar</span>
          </div>
          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>
            Data as of: Jun 18, 2026
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
          sub="PI 2 + PI 3 batches"
          accent="#1e3a5f"
        />
        <KPICard
          title="Completed"
          value={completedCount}
          sub="Status = Done"
          accent="#059669"
          badge="Done"
          badgeColor="#059669"
        />
        <KPICard
          title="Active"
          value={activeCount}
          sub="Status = In Progress"
          accent="#2563eb"
          badge="In Flight"
          badgeColor="#2563eb"
        />
        <KPICard
          title="Planned"
          value={plannedCount}
          sub="PI 3 MVP batches"
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
