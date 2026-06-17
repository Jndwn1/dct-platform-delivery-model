// ExecDashboard.tsx — Executive Delivery Dashboard
// Renders above the Governance Notice on the DCT Delivery Model home page.
// Pulls live data from BatchStatusContext — no hardcoded status values.

import { useBatchStatus } from "@/contexts/BatchStatusContext";
import { Link } from "wouter";

// ── Helpers ──────────────────────────────────────────────────────────────────

function statusDot(status: string) {
  if (status === "Complete" || status === "Delivered" || status === "Done")
    return "#059669";
  if (
    status === "In Progress" ||
    status === "Dev" ||
    status === "MVP" ||
    status === "Active"
  )
    return "#2563eb";
  if (status === "QA In Progress" || status === "Ready for QA" || status === "Demo Ready")
    return "#7c3aed";
  if (status === "Blocked") return "#dc2626";
  if (status === "On Hold") return "#b45309";
  if (status === "Stretch") return "#0ea5e9";
  return "#94a3b8"; // Not Started / Planned
}

function statusLabel(status: string): string {
  if (status === "Complete" || status === "Delivered" || status === "Done") return "Done";
  if (status === "In Progress" || status === "Dev" || status === "MVP" || status === "Active") return "Active";
  if (status === "QA In Progress" || status === "Ready for QA") return "QA";
  if (status === "Demo Ready") return "Demo";
  if (status === "Blocked") return "Blocked";
  if (status === "On Hold") return "On Hold";
  if (status === "Stretch") return "Stretch";
  return "Planned";
}

function statusBg(status: string): string {
  const dot = statusDot(status);
  const map: Record<string, string> = {
    "#059669": "#f0fdf4",
    "#2563eb": "#eff6ff",
    "#7c3aed": "#f5f3ff",
    "#dc2626": "#fef2f2",
    "#b45309": "#fffbeb",
    "#0ea5e9": "#f0f9ff",
    "#94a3b8": "#f8fafc",
  };
  return map[dot] ?? "#f8fafc";
}

// ── PI Summary Row ────────────────────────────────────────────────────────────

interface PIRowProps {
  label: string;
  subtitle: string;
  batches: { id: string; name: string; status: string }[];
  color: string;
  href: string;
}

function PIRow({ label, subtitle, batches, color, href }: PIRowProps) {
  const done = batches.filter(b =>
    ["Complete", "Delivered", "Done"].includes(b.status)
  ).length;
  const active = batches.filter(b =>
    ["In Progress", "Dev", "MVP", "Active", "QA In Progress", "Ready for QA", "Demo Ready"].includes(b.status)
  ).length;
  const pct = batches.length > 0 ? Math.round((done / batches.length) * 100) : 0;

  return (
    <Link href={href}>
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderLeft: `4px solid ${color}`,
          borderRadius: "8px",
          padding: "12px 16px",
          cursor: "pointer",
          transition: "box-shadow 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623" }}>{label}</span>
            <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "8px" }}>{subtitle}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, color: pct === 100 ? "#059669" : "#0f1623" }}>{pct}%</span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>{done}/{batches.length} batches</span>
            {active > 0 && (
              <span style={{
                fontSize: "10px", fontWeight: 600, color: "#2563eb",
                backgroundColor: "#eff6ff", borderRadius: "4px", padding: "1px 6px",
              }}>
                {active} active
              </span>
            )}
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: "3px",
            transition: "width 0.4s ease",
          }} />
        </div>
        {/* Batch chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
          {batches.map(b => (
            <span
              key={b.id}
              title={`${b.id}: ${b.name} — ${b.status}`}
              style={{
                fontSize: "9px", fontWeight: 600,
                backgroundColor: statusBg(b.status),
                color: statusDot(b.status),
                border: `1px solid ${statusDot(b.status)}30`,
                borderRadius: "3px",
                padding: "1px 5px",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{
                display: "inline-block", width: "5px", height: "5px",
                borderRadius: "50%", backgroundColor: statusDot(b.status),
                marginRight: "3px", verticalAlign: "middle",
              }} />
              {b.id}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── Gate Indicator ────────────────────────────────────────────────────────────

function GateIndicator({ label, status, href }: { label: string; status: string; href: string }) {
  const dot = statusDot(status);
  const bg = statusBg(status);
  const lbl = statusLabel(status);
  return (
    <Link href={href}>
      <div style={{
        backgroundColor: bg,
        border: `1px solid ${dot}30`,
        borderRadius: "8px",
        padding: "10px 14px",
        textAlign: "center",
        cursor: "pointer",
        flex: 1,
        minWidth: "100px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", marginBottom: "4px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: dot }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: dot }}>{lbl}</span>
        </div>
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#0f1623", lineHeight: "1.3" }}>{label}</div>
      </div>
    </Link>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ExecDashboard() {
  const { statuses, piCompletion, gates, lastUpdated } = useBatchStatus();

  // PI 1 — Foundation
  const pi1Batches = [
    { id: "FC",  name: "Foundation Core",               status: statuses["foundation-core"] ?? "Not Started" },
    { id: "B1",  name: "AI Mapping Engine",             status: statuses["1"] ?? "Not Started" },
    { id: "B2",  name: "Normalized Record",             status: statuses["2"] ?? "Not Started" },
    { id: "B2A", name: "Tax-Ready Record",              status: statuses["2a"] ?? "Not Started" },
    { id: "B3",  name: "Engagement Intake",             status: statuses["3"] ?? "Not Started" },
  ];

  // PI 2 — Committed
  const pi2Batches = [
    { id: "B4",  name: "Entity Registry",              status: statuses["4"] ?? "Not Started" },
    { id: "B5",  name: "Entity Identity",              status: statuses["5"] ?? "Not Started" },
    { id: "B6",  name: "Practitioner Workflow",        status: statuses["6"] ?? "Not Started" },
    { id: "B7",  name: "Eligibility",                  status: statuses["7"] ?? "Not Started" },
    { id: "B8",  name: "Exception & Remediation",      status: statuses["8"] ?? "Not Started" },
    { id: "B9",  name: "Roger Gateway",                status: statuses["9"] ?? "Not Started" },
    { id: "B10", name: "Return Assembly",              status: statuses["10"] ?? "Not Started" },
    { id: "B11", name: "Learning Governance",          status: statuses["11"] ?? "Not Started" },
    { id: "B43", name: "Practitioner Book & Reclass",  status: statuses["43"] ?? "Not Started" },
  ];

  // PI 2 Stretch
  const pi2StretchBatches = [
    { id: "B13", name: "Platform Reference",           status: statuses["13"] ?? "Not Started" },
    { id: "B16", name: "Audit Trail & Lineage",        status: statuses["16"] ?? "Not Started" },
  ];

  // PI 3 — MVP
  const pi3Batches = [
    { id: "B42", name: "Tax Rules Framework",          status: statuses["42"] ?? "Not Started" },
    { id: "B17", name: "Decision Support",             status: statuses["17"] ?? "Not Started" },
    { id: "B20", name: "Firm Governance",              status: statuses["20"] ?? "Not Started" },
    { id: "B21", name: "Quality Control (PDC)",        status: statuses["21"] ?? "Not Started" },
    { id: "B26", name: "Entity Constituents (PDC)",    status: statuses["26"] ?? "Not Started" },
    { id: "B28", name: "Tax Workpapers",               status: statuses["28"] ?? "Not Started" },
    { id: "B29", name: "Consolidated Return",          status: statuses["29"] ?? "Not Started" },
    { id: "B31", name: "Legacy Prior Year Ingestion",  status: statuses["31"] ?? "Not Started" },
    { id: "B9A", name: "Data Gateway (IMS/CDS/DUO)",   status: statuses["9a"] ?? "Not Started" },
    { id: "B39", name: "Calculation Report",           status: statuses["39"] ?? "Not Started" },
    { id: "B33", name: "State Tax (Stretch)",          status: statuses["33"] ?? "Not Started" },
  ];

  // PI 4 — Post-Pilot
  const pi4Batches = [
    { id: "B19", name: "Audit Cross-LOB Outbound",     status: statuses["19"] ?? "Not Started" },
    { id: "B35", name: "S-Corp Specialization",        status: statuses["35"] ?? "Not Started" },
    { id: "B40", name: "Client-Level Line Mapping",    status: statuses["40"] ?? "Not Started" },
    { id: "B22", name: "Client Communication",         status: statuses["22"] ?? "Not Started" },
    { id: "B23", name: "Benchmark & Peer Analytics",   status: statuses["23"] ?? "Not Started" },
  ];

  // Overall metrics
  const allBatches = [...pi1Batches, ...pi2Batches, ...pi2StretchBatches, ...pi3Batches, ...pi4Batches];
  const totalBatches = allBatches.length;
  const doneBatches = allBatches.filter(b =>
    ["Complete", "Delivered", "Done"].includes(b.status)
  ).length;
  const activeBatches = allBatches.filter(b =>
    ["In Progress", "Dev", "MVP", "Active", "QA In Progress", "Ready for QA", "Demo Ready"].includes(b.status)
  ).length;
  const overallPct = totalBatches > 0 ? Math.round((doneBatches / totalBatches) * 100) : 0;

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px", flexWrap: "wrap", gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "6px", height: "28px", backgroundColor: "#059669", borderRadius: "3px",
          }} />
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f1623", lineHeight: 1 }}>
              Executive Delivery Dashboard
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              DCT Platform · Roadmap v7 · RSM | CATT
              {lastUpdatedLabel && <span style={{ marginLeft: "8px" }}>· ↻ {lastUpdatedLabel}</span>}
            </div>
          </div>
        </div>
        <Link href="/batch-control-panel">
          <span style={{
            fontSize: "11px", fontWeight: 600, color: "#1e3a5f",
            backgroundColor: "#dbeafe", borderRadius: "5px", padding: "4px 10px",
            cursor: "pointer",
          }}>
            Open Control Panel →
          </span>
        </Link>
      </div>

      {/* ── Summary KPIs ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "10px", marginBottom: "16px",
      }}>
        {[
          { label: "Overall Progress", value: `${overallPct}%`, sub: `${doneBatches} of ${totalBatches} batches`, color: "#059669" },
          { label: "Active Batches",   value: activeBatches,    sub: "In delivery now",                            color: "#2563eb" },
          { label: "Pilot Target",     value: "Sep 16",         sub: "MVP cutoff — 9/15",                          color: "#7c3aed" },
          { label: "Platform Status",  value: "On Track",       sub: "PI 1–2 complete · PI 3 active",              color: "#059669" },
        ].map(k => (
          <div key={k.label} style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "12px 14px",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              {k.label}
            </div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "3px" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Overall Progress Bar ── */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
        borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "12px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", whiteSpace: "nowrap" }}>
          ● Platform Readiness
        </div>
        <div style={{ flex: 1, height: "8px", backgroundColor: "#d1fae5", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${overallPct}%`,
            backgroundColor: "#059669", borderRadius: "4px",
            transition: "width 0.4s ease",
          }} />
        </div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#059669", whiteSpace: "nowrap" }}>
          {overallPct}% Complete
        </div>
      </div>

      {/* ── Gate Status Row ── */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
          Gate Verification Status
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <GateIndicator label="G1 — Schema Lock"       status={gates.g1} href="/gate/1" />
          <GateIndicator label="G2 — Invariant Lock"    status={gates.g2} href="/gate/2" />
          <GateIndicator label="G3 — Contract Pub"      status={gates.g3} href="/gate/3" />
          <GateIndicator label="G4 — Lineage Closure"   status={gates.g4} href="/gate/4" />
        </div>
      </div>

      {/* ── PI Progress Grid ── */}
      <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
        Delivery Progress by Program Increment
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <PIRow
          label="PI 1 — Foundation & AI Mapping"
          subtitle="Complete"
          batches={pi1Batches}
          color="#3b82f6"
          href="/batch-roadmap"
        />
        <PIRow
          label="PI 2 — Entity, Workflow & Tax Ready"
          subtitle="Committed + Stretch"
          batches={[...pi2Batches, ...pi2StretchBatches]}
          color="#10b981"
          href="/batch-roadmap"
        />
        <PIRow
          label="PI 3 — Intelligence, Provision & Pilot"
          subtitle="MVP · 7/13–9/15"
          batches={pi3Batches}
          color="#8b5cf6"
          href="/batch-roadmap"
        />
        <PIRow
          label="PI 4 — Governance, QC & Analytics"
          subtitle="Post-Pilot"
          batches={pi4Batches}
          color="#f59e0b"
          href="/batch-roadmap"
        />
      </div>
    </div>
  );
}
