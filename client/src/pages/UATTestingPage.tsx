// UATTestingPage.tsx — v3.0 Workbook-Driven UAT Governance
// Aligned to DCT Master Data Intake Workbook (July 2026)

import { useState } from "react";
import {
  CheckCircle2, ClipboardList, Database, GitBranch, BookOpen,
  Shield, ArrowDown,
} from "lucide-react";
import UATProcessFlowDiagram from "@/components/UATProcessFlowDiagram";

const NAVY   = "#003865";
const GREEN  = "#059669";
const AMBER  = "#d97706";
const RED    = "#dc2626";
const PURPLE = "#7c3aed";
const TEAL   = "#0891b2";
const SLATE  = "#475569";

const MVP_WORKSHEETS = [
  { order: 1,  name: "PDC - Firm Taxonomy (XLOB)",              layer: "PDC", batch: 2,  status: "Built",               authoring: "Reference Only" },
  { order: 2,  name: "PDC - Entity Types",                       layer: "PDC", batch: 5,  status: "Built",               authoring: "Reference Only" },
  { order: 3,  name: "PDC - Standard Appearances",               layer: "PDC", batch: 2,  status: "Built",               authoring: "Reference Only" },
  { order: 3,  name: "PDC - Jurisdiction Types",                 layer: "PDC", batch: 5,  status: "Built",               authoring: "Reference Only" },
  { order: 4,  name: "TDC - Tax Forms",                          layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 5,  name: "TDC - Tax Form Lines",                     layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 6,  name: "TDC - Return Templates",                   layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 7,  name: "TDC - Tax Taxonomy Accounts",              layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 8,  name: "TDC - Corporate Profile Thresholds",       layer: "TDC", batch: 7,  status: "Built",               authoring: "Complete" },
  { order: 9,  name: "TDC - Corporate Profile Criteria",         layer: "TDC", batch: 7,  status: "Built",               authoring: "Complete" },
  { order: 10, name: "TDC - Eligibility Tier Conditions",        layer: "TDC", batch: 7,  status: "Built",               authoring: "Ready for Authoring" },
  { order: 14, name: "TDC - Filing Due Dates",                   layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 15, name: "TDC - Confidence Bands",                   layer: "TDC", batch: 3,  status: "Built",               authoring: "Complete" },
  { order: 16, name: "TDC - Depreciation Reference Data",        layer: "TDC", batch: 28, status: "In build — due 7/21", authoring: "Author After Delivery" },
  { order: 19, name: "TDC - Workpaper Templates",                layer: "TDC", batch: 28, status: "In build — due 7/21", authoring: "Author After Delivery" },
  { order: 20, name: "TDC - Workpaper Template Lines",           layer: "TDC", batch: 28, status: "In build — due 7/21", authoring: "Author After Delivery" },
  { order: 21, name: "TDC - Reconciliation Formula Definitions", layer: "TDC", batch: 28, status: "In build — due 7/21", authoring: "Author After Delivery" },
];

function AuthoringBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Complete":              { bg: "#d1fae5", color: "#065f46" },
    "Ready for Authoring":   { bg: "#dbeafe", color: "#1e40af" },
    "Author After Delivery": { bg: "#fef3c7", color: "#92400e" },
    "Reference Only":        { bg: "#f1f5f9", color: "#475569" },
  };
  const s = map[status] ?? { bg: "#f1f5f9", color: "#64748b" };
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
      {status}
    </span>
  );
}

function BuildBadge({ status }: { status: string }) {
  const isBuilt = status === "Built";
  const isInBuild = status.startsWith("In build");
  return (
    <span style={{
      background: isBuilt ? "#d1fae5" : isInBuild ? "#fef3c7" : "#f1f5f9",
      color: isBuilt ? "#065f46" : isInBuild ? "#92400e" : "#475569",
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
    }}>{status}</span>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <div style={{ borderLeft: "4px solid #003865", paddingLeft: 14, marginBottom: 20 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#475569", marginBottom: 2 }}>
        Section {num}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#003865", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 13, color: "#475569", margin: "4px 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

function Callout({ type, children }: { type: "info" | "warning" | "governance" | "success"; children: React.ReactNode }) {
  const styles = {
    info:       { bg: "#eff6ff", border: "#93c5fd" },
    warning:    { bg: "#fffbeb", border: "#fcd34d" },
    governance: { bg: "#faf5ff", border: "#c4b5fd" },
    success:    { bg: "#f0fdf4", border: "#86efac" },
  };
  const s = styles[type];
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

export default function UATTestingPage() {
  const [showAllWorksheets, setShowAllWorksheets] = useState(false);

  const mvpCount     = MVP_WORKSHEETS.length;
  const builtCount   = MVP_WORKSHEETS.filter(w => w.status === "Built").length;
  const inBuildCount = MVP_WORKSHEETS.filter(w => w.status.startsWith("In build")).length;
  const readyCount   = MVP_WORKSHEETS.filter(w => w.authoring === "Ready for Authoring" || w.authoring === "Complete").length;

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 28, borderBottom: "2px solid #e2e8f0", paddingBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, margin: 0 }}>Master Data UAT Framework</h1>
            <div style={{ fontSize: 11, color: SLATE, marginTop: 2 }}>DCT Platform · Workbook-Driven UAT Governance · MVP Target: September 21, 2026</div>
          </div>
        </div>

        {/* Metadata bar */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 16, marginTop: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", fontSize: 11, color: SLATE }}>
          {[["Document Owner","Jenniver Stafford"],["Version","3.0"],["Last Updated","July 16, 2026"],["Status","DRAFT"],["Classification","Internal — Confidential"]].map(([l,v]) => (
            <div key={l}><span style={{ fontWeight: 600, color: NAVY }}>{l}:</span> <span style={{ color: l === "Status" ? AMBER : "#1e293b", fontWeight: l === "Status" ? 700 : 400 }}>{v}</span></div>
          ))}
        </div>

        {/* KPI strip */}
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" as const }}>
          {[["MVP Worksheets", mvpCount, NAVY],["Platform Built", builtCount, GREEN],["In Build", inBuildCount, AMBER],["Ready to Author", readyCount, TEAL]].map(([l,v,c]) => (
            <div key={String(l)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 16px", textAlign: "center" as const, minWidth: 100 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: String(c) }}>{v}</div>
              <div style={{ fontSize: 10, color: SLATE, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 01 — Purpose ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="01" title="Purpose" subtitle="The Master Data Workbook is the authoritative source of truth and execution plan for DCT Master Data UAT." />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
          <p style={{ fontSize: 14, color: "#1e293b", lineHeight: 1.7, margin: "0 0 16px" }}>
            The <strong>DCT Master Data Intake Workbook</strong> is no longer simply a document used to load Roger. It is the single authoritative artifact that governs how Master Data is defined, authored, loaded, validated, and promoted to production.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { icon: <Database className="w-4 h-4" />, label: "Master Data Inventory",    desc: "Defines every data object in scope" },
              { icon: <ClipboardList className="w-4 h-4" />, label: "Implementation Plan", desc: "Governs what is built and when" },
              { icon: <BookOpen className="w-4 h-4" />, label: "Authoring Guide",           desc: "Tells authors what to populate and when" },
              { icon: <GitBranch className="w-4 h-4" />, label: "Dependency Map",           desc: "Defines load order and relationships" },
              { icon: <CheckCircle2 className="w-4 h-4" />, label: "UAT Validation Guide",  desc: "Drives what is tested and in what order" },
              { icon: <Shield className="w-4 h-4" />, label: "Production Source of Truth", desc: "Approved workbook becomes production" },
            ].map(r => (
              <div key={r.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ color: NAVY, flexShrink: 0, marginTop: 1 }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: SLATE, marginTop: 2 }}>{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Callout type="governance">
            <strong>UAT Scope Boundary:</strong> UAT validates <strong>only</strong> worksheets designated for the MVP release, only data marked <strong>Ready for Authoring</strong> in the workbook, and only capabilities delivered in the platform. Not every worksheet is validated during MVP. The Load Order tab defines the sequence and scope.
          </Callout>
        </div>
      </div>

      {/* ── MVP UAT Readiness Dashboard ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader
          num="MVP"
          title="MVP UAT Readiness Dashboard"
          subtitle="Real-time readiness view for the September 21 DCT MVP. Scoped to DCT MVP only — State and Provision are not included."
        />

        {/* Governance note */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderLeft: "4px solid #d97706", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 12, color: "#92400e" }}>
          <strong>Scope Boundary:</strong> This dashboard tracks the September 21 DCT MVP only. It supplements the existing workbook-driven UAT governance framework and does not replace it. State and Provision readiness are out of scope for this dashboard.
        </div>

        {/* ── Executive Summary KPI Cards ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Executive Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {[
              { label: "MVP Target",        value: "Sep 21",    color: NAVY,  sub: "2026" },
              { label: "Current Batch",     value: "RC-3",      color: "#7c3aed", sub: "PI 3 Active" },
              { label: "UAT Readiness",     value: "🟡 At Risk", color: AMBER, sub: "As of Jul 21" },
              { label: "Overall Completion",value: "42%",       color: GREEN, sub: "Across all tracks" },
              { label: "Last Updated",      value: "Jul 21",    color: SLATE, sub: "2026" },
              { label: "Owner",             value: "Jenniver",  color: NAVY,  sub: "Sr. BA · CATT" },
            ].map(k => (
              <div key={k.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 16px", textAlign: "center" as const }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.05em", marginTop: 3 }}>{k.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Leadership Milestones ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Leadership Milestones</div>
          <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {["Milestone","Target Date","Status","Owner","Risk","Notes"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { milestone: "Finalize Scope",          date: "Jul 20",  status: "🟢", owner: "Product Owner(s)",  risk: "Low",    notes: "Scope confirmed for DCT MVP" },
                  { milestone: "UAT Environment Ready",      date: "Jul 24",  status: "⚪", owner: "Infrastructure",    risk: "Low",    notes: "UAT environment provisioning" },
                  { milestone: "Perf Environment Ready",     date: "Jul 31",  status: "⚪", owner: "Infrastructure",    risk: "Low",    notes: "Performance environment provisioning" },
                  { milestone: "Identify Test Population", date: "Aug 10",  status: "🟡", owner: "Business / QA",   risk: "Medium", notes: "Business users to be confirmed" },
                  { milestone: "Development Complete",     date: "Aug 28",  status: "🟡", owner: "DCT Development",   risk: "Medium", notes: "In progress" },
                  { milestone: "Source Data Ready",        date: "Sep 7",   status: "🔴", owner: "DCT / PDC",  risk: "High",   notes: "Dependency on PDC data availability" },
                  { milestone: "Validation Complete",      date: "Sep 15",  status: "⚪", owner: "QA",        risk: "TBD",    notes: "Pending Dev Complete" },
                  { milestone: "Environment Final Check", date: "Sep 18",  status: "⚪", owner: "Infrastructure",     risk: "TBD",    notes: "Final environment validation before UAT" },
                  { milestone: "Test Scripts Ready",       date: "Sep 18",  status: "⚪", owner: "QA",   risk: "TBD",    notes: "Workbook-driven scripts" },
                  { milestone: "Communications Complete",  date: "Sep 18",  status: "⚪", owner: "Product Owner(s)",  risk: "Low",    notes: "Business user notifications" },
                  { milestone: "UAT Begins",               date: "Sep 8",   status: "⚪", owner: "Business",  risk: "TBD",    notes: "9 business days before Sep 21 go-live" },
                ].map((r, i) => {
                  const riskColor = r.risk === "High" ? "#fef2f2" : r.risk === "Medium" ? "#fffbeb" : r.risk === "Low" ? "#f0fdf4" : "#f8fafc";
                  const riskText  = r.risk === "High" ? "#991b1b" : r.risk === "Medium" ? "#92400e" : r.risk === "Low" ? "#166534" : "#475569";
                  return (
                    <tr key={r.milestone} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{r.milestone}</td>
                      <td style={{ padding: "9px 14px", color: "#374151", whiteSpace: "nowrap" as const }}>{r.date}</td>
                      <td style={{ padding: "9px 14px", fontSize: 14 }}>{r.status}</td>
                      <td style={{ padding: "9px 14px", color: "#374151" }}>{r.owner}</td>
                      <td style={{ padding: "9px 14px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, background: riskColor, color: riskText, borderRadius: 4, padding: "2px 8px" }}>{r.risk}</span>
                      </td>
                      <td style={{ padding: "9px 14px", color: SLATE, fontSize: 11 }}>{r.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── MVP Capability Readiness ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>MVP Capability Readiness</div>
          <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {["Capability","Batch","Development","QA","Master Data","Ready for UAT","Risk","Dependencies"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: "Roger UI — Core Screens",         batch: "B1",  dev: "🟢", qa: "🟢", md: "🟡", uatReady: "🟡", risk: "Medium", dep: "Master Data Load" },
                  { cap: "Gateway Consumer Access",         batch: "B9A", dev: "🟢", qa: "🟢", md: "🟢", uatReady: "🟢", risk: "Low",    dep: "None" },
                  { cap: "Audit Trail & Lineage",           batch: "B16", dev: "🟡", qa: "⚪", md: "🟢", uatReady: "🔴", risk: "High",   dep: "Dev Complete" },
                  { cap: "Provision Reference Data",        batch: "B28", dev: "🟡", qa: "⚪", md: "⚪", uatReady: "🔴", risk: "High",   dep: "Dev + MD Load" },
                  { cap: "TDC Outbound Contract to IMS",    batch: "B28", dev: "🟢", qa: "🟡", md: "🟢", uatReady: "🟡", risk: "Medium", dep: "IMS Endpoint" },
                  { cap: "Master Data Load (Roger)",        batch: "FC",  dev: "🟢", qa: "🟢", md: "🟡", uatReady: "🟡", risk: "Medium", dep: "Authoring Complete" },
                ].map((r, i) => (
                  <tr key={r.cap} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{r.cap}</td>
                    <td style={{ padding: "9px 14px" }}><span style={{ fontSize: 11, fontWeight: 700, background: NAVY, color: "white", borderRadius: 4, padding: "2px 8px" }}>{r.batch}</span></td>
                    <td style={{ padding: "9px 14px", fontSize: 14, textAlign: "center" as const }}>{r.dev}</td>
                    <td style={{ padding: "9px 14px", fontSize: 14, textAlign: "center" as const }}>{r.qa}</td>
                    <td style={{ padding: "9px 14px", fontSize: 14, textAlign: "center" as const }}>{r.md}</td>
                    <td style={{ padding: "9px 14px", fontSize: 14, textAlign: "center" as const }}>{r.uatReady}</td>
                    <td style={{ padding: "9px 14px" }}><span style={{ fontSize: 11, fontWeight: 700, background: r.risk === "High" ? "#fef2f2" : r.risk === "Medium" ? "#fffbeb" : "#f0fdf4", color: r.risk === "High" ? "#991b1b" : r.risk === "Medium" ? "#92400e" : "#166534", borderRadius: 4, padding: "2px 8px" }}>{r.risk}</span></td>
                    <td style={{ padding: "9px 14px", color: SLATE, fontSize: 11 }}>{r.dep}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Environment Readiness ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Environment Readiness</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { env: "DEV",        deployment: "🟢", config: "🟢", mdLoaded: "🟢", smoke: "🟢", stable: "🟢" },
              { env: "QA",         deployment: "🟢", config: "🟢", mdLoaded: "🟡", smoke: "🟡", stable: "🟡" },
              { env: "UAT",        deployment: "⚪", config: "⚪", mdLoaded: "⚪", smoke: "⚪", stable: "⚪" },
              { env: "Production", deployment: "⚪", config: "⚪", mdLoaded: "⚪", smoke: "⚪", stable: "⚪" },
            ].map(e => (
              <div key={e.env} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: NAVY, padding: "8px 14px", fontSize: 12, fontWeight: 800, color: "white" }}>{e.env}</div>
                <div style={{ padding: "12px 14px" }}>
                  {[
                    ["Deployment",    e.deployment],
                    ["Configuration", e.config],
                    ["MD Loaded",     e.mdLoaded],
                    ["Smoke Tested",  e.smoke],
                    ["Stable",        e.stable],
                  ].map(([label, icon]) => (
                    <div key={String(label)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                      <span style={{ color: "#374151" }}>{label}</span>
                      <span style={{ fontSize: 14 }}>{icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Master Data + Data Readiness side by side ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Master Data Readiness */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: NAVY, padding: "10px 16px", fontSize: 12, fontWeight: 800, color: "white" }}>Master Data Readiness</div>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: SLATE, marginBottom: 12 }}>Source of truth: DCT Master Data Intake Workbook (Load Order tab)</div>
              {[
                { label: "Total MVP Worksheets",  value: String(mvpCount),   color: NAVY },
                { label: "Platform Built",         value: String(builtCount), color: GREEN },
                { label: "In Development",         value: String(inBuildCount), color: AMBER },
                { label: "Ready for Authoring",    value: String(readyCount), color: TEAL },
                { label: "Authoring Complete",     value: "—",  color: SLATE },
                { label: "Loaded",                 value: "—",  color: SLATE },
                { label: "Validated",              value: "—",  color: SLATE },
                { label: "Approved",               value: "—",  color: SLATE },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  <span style={{ color: "#374151" }}>{row.label}</span>
                  <span style={{ fontWeight: 800, color: row.color, fontSize: 14 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: SLATE, marginBottom: 4 }}>
                  <span>Overall Authoring Progress</span>
                  <span style={{ fontWeight: 700, color: GREEN }}>{Math.round((builtCount / Math.max(mvpCount, 1)) * 100)}%</span>
                </div>
                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.round((builtCount / Math.max(mvpCount, 1)) * 100)}%`, background: GREEN, borderRadius: 4, transition: "width 0.4s ease" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Data Readiness */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: NAVY, padding: "10px 16px", fontSize: 12, fontWeight: 800, color: "white" }}>Data Readiness</div>
            <div style={{ padding: "14px 16px" }}>
              {[
                { label: "Roger Master Data",   status: "🟡", owner: "BA Team",  dep: "Authoring" },
                { label: "Prior Year Data",     status: "🔴", owner: "PDC",      dep: "PDC Delivery" },
                { label: "Reference Data",      status: "🟢", owner: "TDC",      dep: "None" },
                { label: "Taxonomy Data",       status: "🟡", owner: "TDC",      dep: "Taxonomy Review" },
                { label: "Migration Validation",status: "⚪", owner: "QA",       dep: "Data Load" },
                { label: "Load Validation",     status: "⚪", owner: "QA",       dep: "Data Load" },
              ].map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f1f5f9", fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{row.label}</div>
                    <div style={{ fontSize: 10, color: SLATE }}>{row.owner} · {row.dep}</div>
                  </div>
                  <span style={{ fontSize: 16 }}>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Testing Readiness ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Testing Readiness</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { label: "Business Users Identified", status: "🟡", note: "Confirmation pending" },
              { label: "Access Provisioned",         status: "⚪", note: "Awaiting user list" },
              { label: "Test Data Ready",            status: "🔴", note: "Dependent on MD load" },
              { label: "Test Scripts Complete",      status: "🟡", note: "In progress" },
              { label: "Defect Process Ready",       status: "🟢", note: "Documented in framework" },
              { label: "Change Control Ready",       status: "🟢", note: "Documented in framework" },
              { label: "Business Training Complete", status: "⚪", note: "Scheduled for Sep 18" },
            ].map(item => (
              <div key={item.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: SLATE, marginTop: 2 }}>{item.note}</div>
                </div>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Top Risks ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Top Risks</div>
          <div style={{ overflowX: "auto" as const, background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ background: NAVY }}>
                  {["#","Risk","Impact","Owner","Mitigation","Target Resolution"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left" as const, color: "white", fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n:1,  risk: "Prior Year Data not available by Sep 7",          impact: "🔴 High",   owner: "PDC",       mit: "Escalate to PDC PO; identify fallback dataset",      target: "Aug 28" },
                  { n:2,  risk: "Audit Trail (B16) development not complete",       impact: "🔴 High",   owner: "DCT Dev",   mit: "Daily stand-up tracking; scope reduction if needed", target: "Aug 28" },
                  { n:3,  risk: "Business users not confirmed by Aug 10",           impact: "🟡 Medium", owner: "BA Team",   mit: "Escalate to business leadership",                   target: "Aug 10" },
                  { n:4,  risk: "UAT environment not stable by Sep 18",             impact: "🔴 High",   owner: "Infra",     mit: "Early environment provisioning request",            target: "Sep 7" },
                  { n:5,  risk: "Master Data authoring not complete by Sep 7",      impact: "🟡 Medium", owner: "BA Team",   mit: "Prioritize MVP worksheets; defer non-MVP",          target: "Sep 7" },
                  { n:6,  risk: "IMS endpoint not ready for TDC outbound contract", impact: "🟡 Medium", owner: "IMS",       mit: "Stub endpoint for UAT; confirm with IMS team",      target: "Sep 15" },
                  { n:7,  risk: "Taxonomy data review not complete",                impact: "🟡 Medium", owner: "TDC",       mit: "Schedule taxonomy review by Aug 20",               target: "Aug 20" },
                  { n:8,  risk: "Test scripts not ready by Sep 18",                 impact: "🟡 Medium", owner: "QA / BA",   mit: "Workbook-driven scripts; begin drafting now",       target: "Sep 15" },
                  { n:9,  risk: "Business user access not provisioned",             impact: "🟡 Medium", owner: "Infra",     mit: "Submit access requests by Sep 7",                  target: "Sep 7" },
                  { n:10, risk: "Scope creep — non-MVP items entering UAT",         impact: "🟢 Low",    owner: "Jenniver",  mit: "Enforce scope boundary; refer to Load Order tab",  target: "Ongoing" },
                ].map((r, i) => (
                  <tr key={r.n} style={{ background: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "9px 14px", fontWeight: 700, color: SLATE }}>{r.n}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600, color: NAVY }}>{r.risk}</td>
                    <td style={{ padding: "9px 14px", whiteSpace: "nowrap" as const }}>{r.impact}</td>
                    <td style={{ padding: "9px 14px", color: "#374151" }}>{r.owner}</td>
                    <td style={{ padding: "9px 14px", color: SLATE, fontSize: 11 }}>{r.mit}</td>
                    <td style={{ padding: "9px 14px", color: "#374151", whiteSpace: "nowrap" as const }}>{r.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Executive Go / No-Go ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Executive Go / No-Go</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            {[
              { label: "Development Complete",  status: "🟡", note: "RC-3 in progress" },
              { label: "Critical Bugs Closed",   status: "🟡", note: "Monitoring" },
              { label: "Environment Stable",     status: "⚪", note: "UAT env pending" },
              { label: "Master Data Loaded",     status: "🟡", note: "Authoring in progress" },
              { label: "Data Validated",         status: "⚪", note: "Awaiting load" },
              { label: "Business Users Ready",   status: "🟡", note: "Confirmation pending" },
              { label: "Test Scripts Ready",     status: "🟡", note: "In progress" },
              { label: "Support Ready",          status: "⚪", note: "TBD" },
              { label: "Deployment Ready",       status: "⚪", note: "TBD" },
              { label: "Business Approval",      status: "⚪", note: "Pending Go/No-Go meeting" },
            ].map(item => (
              <div key={item.label} style={{
                background: item.status === "🟢" ? "#f0fdf4" : item.status === "🟡" ? "#fffbeb" : item.status === "🔴" ? "#fef2f2" : "#f8fafc",
                border: `1px solid ${item.status === "🟢" ? "#bbf7d0" : item.status === "🟡" ? "#fde68a" : item.status === "🔴" ? "#fecaca" : "#e2e8f0"}`,
                borderRadius: 8, padding: "12px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: SLATE, marginTop: 2 }}>{item.note}</div>
                </div>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Daily Readiness Summary ── */}
        <div style={{ background: NAVY, borderRadius: 10, padding: "18px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#10b981", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>Daily Readiness Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
            {[
              { label: "Completed Yesterday",        items: ["Scope boundary confirmed", "Discovery Decision Matrix published", "Ask Buddy 5-step review process deployed"] },
              { label: "In Progress Today",          items: ["MVP UAT Readiness Dashboard", "RC-3 development", "Master Data authoring"] },
              { label: "Upcoming This Week",         items: ["Test population identification", "Environment readiness review", "Taxonomy data review scheduling"] },
              { label: "Current Risks",              items: ["Prior Year Data (PDC)", "B16 Audit Trail development", "Business user confirmation"] },
              { label: "Leadership Decisions Needed",items: ["Confirm business users by Aug 10", "PDC data availability commitment", "UAT environment provisioning approval"] },
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 8 }}>{col.label}</div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {col.items.map(item => (
                    <li key={item} style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.6, marginBottom: 3 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Section 02 — How the Workbook Drives UAT ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="02" title="How the Master Data Workbook Drives UAT" subtitle="Every UAT activity traces back to an entry in the Approved Master Data Workbook." />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>Authoring Guide Defines</div>
            {["Worksheet ownership","Current readiness status","Dependency relationships","MVP scope (Yes / TBD / No)","Authoring timing and priority"].map(i => (
              <div key={i} style={{ fontSize: 12, color: "#1e293b", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "#2563eb" }}>•</span>{i}</div>
            ))}
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 8 }}>Load Order Defines</div>
            {["Sequence data must be loaded","Dependency relationships between datasets","Current implementation status per dataset","Which worksheets are Required for MVP/UAT","Business users validate in load order sequence"].map(i => (
              <div key={i} style={{ fontSize: 12, color: "#1e293b", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: "#059669" }}>•</span>{i}</div>
            ))}
          </div>
        </div>
        <UATProcessFlowDiagram />
      </div>

      {/* ── Section 02b — UAT Execution Guide ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="02b" title="UAT Execution Guide" subtitle="Using the Master Data Workbook — A practical step-by-step guide for Business Users performing UAT." />

        {/* Intro banner */}
        <div style={{ background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>📘</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e40af", marginBottom: 4 }}>How to Use the Workbook During UAT</div>
            <p style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.65, margin: 0 }}>
              The Approved Master Data Workbook is the single source of truth for all Master Data validation. During UAT, testers do not validate data from memory or documentation. Every validation activity begins with the workbook and ends by confirming the platform matches the approved workbook.
            </p>
          </div>
        </div>

        {/* Two-column layout: steps + checklist panel */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

          {/* Steps column */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" as const, gap: 12 }}>

            {/* Step 1 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #003865", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#003865", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>1</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#003865" }}>Review the Authoring Guide</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Understand what should be tested</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Review:</div>
                  {["MVP Scope","Worksheet Readiness","Business Owner","Current Status","Authoring Priority"].map(i => (
                    <div key={i} style={{ fontSize: 11, color: "#1e293b", display: "flex", gap: 6, marginBottom: 3 }}><span style={{ color: "#003865" }}>•</span>{i}</div>
                  ))}
                </div>
                <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>Outcome:</div>
                  <p style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.55, margin: "0 0 6px" }}>Only worksheets marked:</p>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#dcfce7", borderRadius: 4, padding: "3px 8px", display: "inline-block", marginBottom: 4 }}>Required for MVP = Yes</div>
                  <div style={{ fontSize: 11, color: "#475569", margin: "2px 0" }}>and</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#dcfce7", borderRadius: 4, padding: "3px 8px", display: "inline-block" }}>Ready for Authoring</div>
                  <p style={{ fontSize: 11, color: "#475569", margin: "6px 0 0", lineHeight: 1.4 }}>should be tested unless instructed otherwise.</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #1d4ed8", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#1d4ed8", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>2</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8" }}>Review the Load Order</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Understand the testing sequence</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Review:</div>
                  {["Load sequence","Dependencies","Parent-child relationships","Build status","Authoring status"].map(i => (
                    <div key={i} style={{ fontSize: 11, color: "#1e293b", display: "flex", gap: 6, marginBottom: 3 }}><span style={{ color: "#1d4ed8" }}>•</span>{i}</div>
                  ))}
                </div>
                <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>Dependency Example:</div>
                  {["Tax Forms","Tax Form Lines","Return Templates","Tax Taxonomy Accounts"].map((item, idx, arr) => (
                    <div key={item} style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#1e40af", background: "#dbeafe", borderRadius: 4, padding: "2px 8px" }}>{item}</div>
                      {idx < arr.length - 1 && <div style={{ fontSize: 12, color: "#93c5fd", marginLeft: 8 }}>↓</div>}
                    </div>
                  ))}
                  <p style={{ fontSize: 10, color: "#475569", margin: "6px 0 0", lineHeight: 1.4, fontStyle: "italic" }}>Never validate downstream before prerequisite datasets.</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #0891b2", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0891b2", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>3</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0891b2" }}>Validate Workbook Data</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Compare Roger directly to the workbook</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[
                  { check: "Required records exist",     color: "#059669" },
                  { check: "Values match workbook",      color: "#059669" },
                  { check: "Reference data is correct",  color: "#059669" },
                  { check: "Lookup values resolve",      color: "#059669" },
                  { check: "Required fields populated",  color: "#059669" },
                  { check: "No unexpected values exist", color: "#059669" },
                ].map(c => (
                  <div key={c.check} style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px", display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: c.color, fontSize: 14, flexShrink: 0 }}>✔</span>
                    <span style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.4 }}>{c.check}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #7c3aed", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#7c3aed", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>4</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#7c3aed" }}>Validate Relationships</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>UAT is not simply record validation</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Also validate:</div>
                  {["Parent-child relationships","Cross worksheet references","Taxonomy relationships","Eligibility relationships","Lookup relationships","Business Rules"].map(i => (
                    <div key={i} style={{ fontSize: 11, color: "#1e293b", display: "flex", gap: 6, marginBottom: 3 }}><span style={{ color: "#7c3aed" }}>•</span>{i}</div>
                  ))}
                </div>
                <div style={{ background: "#faf5ff", border: "1px solid #c4b5fd", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", marginBottom: 6 }}>Dependency Chain:</div>
                  {["Workbook","Reference Data","Tax Forms","Tax Form Lines","Templates","Business Rules"].map((item, idx, arr) => (
                    <div key={item} style={{ display: "flex", flexDirection: "column" as const, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#6d28d9", background: "#ede9fe", borderRadius: 4, padding: "2px 8px" }}>{item}</div>
                      {idx < arr.length - 1 && <div style={{ fontSize: 12, color: "#c4b5fd", marginLeft: 8 }}>↓</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #0891b2", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#0891b2", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>5</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0891b2" }}>Validate Roger</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Validation extends into the application</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {["Search","Dropdowns","Filtering","Relationships","Rule execution","Mappings","Screen display","Reference resolution"].map(item => (
                  <div key={item} style={{ background: "#ecfeff", border: "1px solid #67e8f9", borderRadius: 6, padding: "8px 10px", textAlign: "center" as const }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0e7490" }}>{item}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "#475569", margin: "10px 0 0", lineHeight: 1.5, fontStyle: "italic" }}>The platform should reflect the workbook exactly.</p>
            </div>

            {/* Step 6 */}
            <div style={{ background: "#fef2f2", border: "1.5px solid #fca5a5", borderTop: "3px solid #dc2626", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#dc2626", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>6</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#dc2626" }}>Logging Defects</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Every defect must reference the workbook</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7f1d1d", marginBottom: 6 }}>Required defect fields:</div>
                  {["Workbook Tab","Worksheet Row","Master Data Object","Expected Workbook Value","Actual Roger Value","Screenshots","Dependency Impact","Reload Required (TBD — BA assesses)"].map(f => (
                    <div key={f} style={{ fontSize: 11, color: "#1e293b", display: "flex", gap: 6, marginBottom: 3, alignItems: "flex-start" }}>
                      <span style={{ color: "#dc2626", flexShrink: 0 }}>□</span>{f}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
                  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>If workbook is correct and Roger is wrong:</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#dc2626", background: "#fee2e2", borderRadius: 4, padding: "4px 8px", display: "inline-block" }}>→ DEFECT</div>
                  </div>
                  <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>If the workbook is incorrect:</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "4px 8px", display: "inline-block" }}>→ APPROVED WORKBOOK CHANGE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 7 */}
            <div style={{ background: "white", border: "1px solid #e2e8f0", borderTop: "3px solid #d97706", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#d97706", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>7</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#d97706" }}>After Workbook Changes</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Reload process for Business Users</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {[
                  { icon: "⏳", label: "Wait for Development notification" },
                  { icon: "📋", label: "Review workbook version" },
                  { icon: "✅", label: "Confirm reload completed" },
                  { icon: "🔍", label: "Revalidate only affected worksheets" },
                  { icon: "🔗", label: "Verify downstream dependencies" },
                  { icon: "▶️", label: "Resume testing" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "8px 10px", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.4 }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 8 */}
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderTop: "3px solid #059669", borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#059669", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>8</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#059669" }}>Business Sign-off</div>
                <span style={{ fontSize: 10, color: "#64748b", fontStyle: "italic", marginLeft: 4 }}>Final approval — Production ready</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {[
                  "All MVP worksheets validated",
                  "Workbook matches Roger",
                  "Dependencies validated",
                  "Business Rules verified",
                  "Reload validation complete",
                  "Critical defects resolved",
                  "Workbook approved",
                  "Production ready",
                ].map(item => (
                  <div key={item} style={{ background: "white", border: "1px solid #86efac", borderRadius: 6, padding: "8px 10px", display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <span style={{ color: "#059669", fontSize: 14, flexShrink: 0 }}>✔</span>
                    <span style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>{/* end steps column */}

          {/* Quick Reference Checklist panel */}
          <div style={{ width: 200, flexShrink: 0, background: "#f0f4f8", border: "2px solid #003865", borderRadius: 10, padding: "14px 14px", position: "sticky" as const, top: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#003865", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 12 }}>📋 Quick Reference Checklist</div>
            {[
              "Review Authoring Guide",
              "Review Load Order",
              "Validate workbook data",
              "Validate dependencies",
              "Validate Roger",
              "Log defects",
              "Revalidate after reload",
              "Complete sign-off",
            ].map((item, idx) => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ width: 16, height: 16, border: "1.5px solid #003865", borderRadius: 3, flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#003865", fontWeight: 700 }}>{idx + 1}</div>
                <span style={{ fontSize: 11, color: "#1e293b", lineHeight: 1.4 }}>{item}</span>
              </div>
            ))}
          </div>

        </div>{/* end two-column layout */}

        {/* Bottom Best Practice callout */}
        <div style={{ marginTop: 16, background: "#003865", borderRadius: 10, padding: "14px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>💡</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.06em", textTransform: "uppercase" as const, marginBottom: 5 }}>Best Practice</div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: 0 }}>
              Always validate in workbook load order. Testing downstream worksheets before validating prerequisite reference data may produce <strong style={{ color: "#fbbf24" }}>false defects and inconsistent results</strong>. The workbook — not the application — is the authoritative source of truth. Every validation decision should trace back to an approved workbook entry.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 03 — UAT Objectives ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="03" title="UAT Objectives" subtitle="UAT validates that the Approved Master Data Workbook was loaded correctly and all downstream dependencies are satisfied." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
          {[
            { num: "01", label: "Validate MVP Worksheets Only",           desc: "Scope limited to worksheets marked Required for MVP = Yes in the Load Order tab" },
            { num: "02", label: "Validate Loaded Data Matches Workbook",  desc: "Confirm every loaded record matches the approved workbook entry exactly" },
            { num: "03", label: "Validate Worksheet Relationships",        desc: "Confirm foreign key relationships between worksheets resolve correctly" },
            { num: "04", label: "Validate Load Order Dependencies",        desc: "Confirm data was loaded in the sequence defined by the Load Order tab" },
            { num: "05", label: "Validate Reference Data Relationships",   desc: "Confirm reference data (XLOB, Entity Types, Jurisdiction Types) resolves across all consumers" },
            { num: "06", label: "Validate Taxonomy Relationships",         desc: "Confirm Tax Taxonomy Accounts resolve to valid XLOB Concepts" },
            { num: "07", label: "Validate Business Rules",                 desc: "Confirm eligibility, confidence, and determination rules execute as authored" },
            { num: "08", label: "Validate Downstream Usability",           desc: "Confirm Roger can consume and display all validated master data correctly" },
            { num: "09", label: "Validate Reloads After Workbook Changes", desc: "Confirm affected worksheets are revalidated after any approved workbook change" },
            { num: "10", label: "Obtain Business Approval",                desc: "Business formally approves the workbook as the Production Source of Truth" },
          ].map(o => (
            <div key={o.num} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 14px", display: "flex", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: NAVY, color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{o.num}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{o.label}</div>
                <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.5 }}>{o.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 04 — Roles ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="04" title="Roles & Responsibilities" subtitle="Each role has specific workbook-driven responsibilities during UAT." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { role: "Business Analyst", color: NAVY, items: ["Maintain the Authoring Guide","Maintain the Load Order tab","Maintain workbook readiness status","Coordinate workbook updates","Perform impact assessment on every Approved Workbook Change","Coordinate reload approvals","Ensure defects reference correct workbook tab and row"] },
            { role: "Business Users",   color: TEAL, items: ["Review the Authoring Guide before UAT begins","Know which worksheets belong to MVP scope","Validate only worksheets marked Ready for Authoring","Validate in Load Order sequence","Revalidate only affected worksheets after reload","Provide formal sign-off on workbook as Production Source of Truth"] },
            { role: "Development",      color: PURPLE, items: ["Load workbook in dependency order per Load Order tab","Maintain load dependency order throughout UAT","Execute reloads as directed by BA reload decision","Validate successful ingestion after each load","Confirm no orphaned records after reload"] },
          ].map(r => (
            <div key={r.role} style={{ background: "white", border: `1px solid ${r.color}30`, borderTop: `3px solid ${r.color}`, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: r.color, marginBottom: 10 }}>{r.role}</div>
              {r.items.map(item => (
                <div key={item} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: r.color }} />
                  <span style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* ── Key Principle: Defect vs Workbook Change governance panel ── */}
        <div style={{ marginTop: 20 }}>
          {/* Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🔒</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#003865" }}>Key Principle</div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Governance</div>
            </div>
          </div>

          {/* Intro paragraph */}
          <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, marginBottom: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
            During User Acceptance Testing, the <strong>Approved Master Data Workbook</strong> is the authoritative source of truth.
            Business Users validate that the data loaded into Roger accurately reflects the approved workbook.
            Use the following rules when determining whether an issue is a defect or a workbook change.
          </div>

          {/* Two info cards side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>

            {/* Software Defect card — green */}
            <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>✔</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#065f46" }}>Software Defect</div>
              </div>
              <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6, marginBottom: 10 }}>
                The Approved Master Data Workbook is correct, but the data displayed in Roger does not match the approved workbook.
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Examples</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
                <li>Incorrect value loaded</li>
                <li>Missing record</li>
                <li>Incorrect relationship</li>
                <li>Business rule executed incorrectly</li>
                <li>Data load or processing issue</li>
              </ul>
              <div style={{ marginTop: 12, background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#065f46", fontWeight: 700 }}>
                Action: Log a defect and follow the Defect Management process.
              </div>
            </div>

            {/* Approved Workbook Change card — gold */}
            <div style={{ background: "#fffbeb", border: "2px solid #fbbf24", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>📝</span>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#92400e" }}>Approved Workbook Change</div>
              </div>
              <div style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.6, marginBottom: 10 }}>
                The data loaded into Roger matches the Approved Master Data Workbook, but the business determines the workbook itself needs to be updated.
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Examples</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
                <li>Reference data requires correction</li>
                <li>Business rule changes</li>
                <li>Taxonomy updates</li>
                <li>Filing due date changes</li>
                <li>New master data values</li>
                <li>Business decision changes</li>
              </ul>
              <div style={{ marginTop: 12, background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#92400e", fontWeight: 700 }}>
                Action: Update the Approved Master Data Workbook, perform a BA Impact Assessment, determine the reload strategy, execute the reload, and revalidate before UAT resumes.
              </div>
            </div>
          </div>

          {/* Comparison table */}
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ background: "#003865", color: "white", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, padding: "8px 16px" }}>Quick Reference</div>
            <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0" }}>Situation</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0" }}>Result</th>
                  <th style={{ padding: "10px 14px", textAlign: "left" as const, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e2e8f0" }}>Next Step</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 14px", color: "#1e293b" }}>Roger does not match the Approved Workbook</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ background: "#dcfce7", color: "#065f46", fontWeight: 700, borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>Software Defect</span></td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>Log Defect</td>
                </tr>
                <tr>
                  <td style={{ padding: "10px 14px", color: "#1e293b" }}>Roger matches the Approved Workbook, but the workbook needs to change</td>
                  <td style={{ padding: "10px 14px" }}><span style={{ background: "#fef3c7", color: "#92400e", fontWeight: 700, borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>Approved Workbook Change</span></td>
                  <td style={{ padding: "10px 14px", color: "#374151" }}>Follow Change Control Process</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Governance Principle note */}
          <div style={{ background: "#1e293b", borderRadius: 10, padding: "16px 20px", color: "white" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#94a3b8", marginBottom: 8 }}>Governance Principle</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, color: "#e2e8f0" }}>
              The platform is validated against the Approved Master Data Workbook. The workbook is <strong style={{ color: "white" }}>never</strong> changed simply to match the platform.
            </div>
            <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "#334155", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#e2e8f0", lineHeight: 1.6 }}>
                <span style={{ color: "#86efac", fontWeight: 700 }}>If Roger is incorrect</span> — fix the platform.
              </div>
              <div style={{ background: "#334155", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#e2e8f0", lineHeight: 1.6 }}>
                <span style={{ color: "#fbbf24", fontWeight: 700 }}>If the workbook is incorrect</span> — update the workbook through the approved change control process, perform an impact assessment, execute the appropriate reload strategy, and revalidate before continuing UAT.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Examples: Defect vs. Approved Master Data Change ── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ borderLeft: "4px solid #003865", paddingLeft: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#64748b", marginBottom: 2 }}>Section 04b — Worked Examples</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f1623", margin: 0 }}>Examples: Defect vs. Approved Master Data Change</h2>
        </div>
        <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 20, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
          Not every issue discovered during UAT is a software defect. The examples below illustrate how to determine whether an issue should follow the Defect Management process or the Approved Master Data Change process.
        </div>

        {/* Two-column: Example 1 (green) + Example 2 (blue) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>

          {/* Example 1 — Software Defect (green) */}
          <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 10, padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>🐞</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#065f46", marginBottom: 1 }}>Example 1</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#14532d" }}>Software Defect</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#065f46", marginBottom: 6 }}>Scenario</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
                The Approved Master Data Workbook specifies that the Filing Due Date for Form 1120 is <strong>April 15</strong>. After the data load, Roger displays <strong>March 31</strong>.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#065f46", marginBottom: 6 }}>Comparison</div>
              <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#dcfce7" }}>
                    <th style={{ padding: "7px 12px", textAlign: "left" as const, fontWeight: 700, color: "#14532d", borderBottom: "1px solid #86efac" }}>Approved Workbook</th>
                    <th style={{ padding: "7px 12px", textAlign: "left" as const, fontWeight: 700, color: "#14532d", borderBottom: "1px solid #86efac" }}>Roger</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 12px", color: "#166534", fontWeight: 700, background: "white", borderBottom: "1px solid #d1fae5" }}>April 15</td>
                    <td style={{ padding: "8px 12px", color: "#dc2626", fontWeight: 700, background: "white", borderBottom: "1px solid #d1fae5" }}>March 31 ✕</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#065f46" }}>Result: </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#14532d" }}>Software Defect</span>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#065f46", marginBottom: 4 }}>Why?</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>The Approved Master Data Workbook is correct, but the platform does not match the approved data.</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#065f46", marginBottom: 6 }}>Next Steps</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.8 }}>
                <li>Log a software defect.</li>
                <li>Development corrects the issue.</li>
                <li>Reload if necessary.</li>
                <li>Business retests the affected worksheet.</li>
              </ul>
            </div>
          </div>

          {/* Example 2 — Approved Master Data Change (blue) */}
          <div style={{ background: "#eff6ff", border: "2px solid #93c5fd", borderRadius: 10, padding: "20px 22px", display: "flex", flexDirection: "column" as const, gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>📝</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#1d4ed8", marginBottom: 1 }}>Example 2</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a8a" }}>Approved Master Data Change</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#1d4ed8", marginBottom: 6 }}>Scenario</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7 }}>
                The Approved Master Data Workbook specifies the Filing Due Date as <strong>March 31</strong>. Roger also displays <strong>March 31</strong>. During UAT, the business determines the correct due date should actually be <strong>April 15</strong>.
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#1d4ed8", marginBottom: 6 }}>Comparison</div>
              <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#dbeafe" }}>
                    <th style={{ padding: "7px 12px", textAlign: "left" as const, fontWeight: 700, color: "#1e3a8a", borderBottom: "1px solid #93c5fd" }}>Approved Workbook</th>
                    <th style={{ padding: "7px 12px", textAlign: "left" as const, fontWeight: 700, color: "#1e3a8a", borderBottom: "1px solid #93c5fd" }}>Roger</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 12px", color: "#1d4ed8", fontWeight: 700, background: "white", borderBottom: "1px solid #bfdbfe" }}>March 31</td>
                    <td style={{ padding: "8px 12px", color: "#059669", fontWeight: 700, background: "white", borderBottom: "1px solid #bfdbfe" }}>March 31 ✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 6, padding: "8px 12px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#1d4ed8" }}>Result: </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a" }}>Approved Master Data Change</span>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#1d4ed8", marginBottom: 4 }}>Why?</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>Roger correctly loaded the approved workbook. The business decision changed, not the application.</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#1d4ed8", marginBottom: 6 }}>Next Steps</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.8 }}>
                <li>Update the Approved Master Data Workbook.</li>
                <li>Perform a Business Analyst Impact Assessment.</li>
                <li>Determine the appropriate reload strategy.</li>
                <li>Reload the affected data.</li>
                <li>Business revalidates the impacted worksheets.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Example 3 — Taxonomy Mapping Change (orange, full-width) */}
        <div style={{ background: "#fff7ed", border: "2px solid #fdba74", borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>🔄</span>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#c2410c", marginBottom: 1 }}>Example 3 — Full-Width</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#7c2d12" }}>Taxonomy Mapping Change</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ gridColumn: "1 / 3" }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#c2410c", marginBottom: 6 }}>Scenario</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.7, marginBottom: 12 }}>
                During UAT, the business decides that the <strong>Cash Equivalents</strong> Taxonomy Account should map to a different Tax Form Line than originally approved. Roger displays exactly what exists in the Approved Master Data Workbook.
              </div>
              <div style={{ background: "#fed7aa", border: "1px solid #fdba74", borderRadius: 6, padding: "8px 12px", marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#c2410c" }}>Result: </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#7c2d12" }}>Approved Master Data Change</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#c2410c", marginBottom: 4 }}>Why?</div>
              <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6, marginBottom: 12 }}>The application is functioning correctly. The approved business mapping has changed.</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#c2410c", marginBottom: 6 }}>Next Steps</div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.9 }}>
                <li>Update the Approved Master Data Workbook.</li>
                <li>Perform a Business Analyst Impact Assessment.</li>
                <li>Identify all downstream dependencies.</li>
                <li>Determine whether a Partial, Coordinated Partial, or Full Reload is required.</li>
                <li>Execute the reload.</li>
                <li>Revalidate all impacted worksheets before resuming UAT.</li>
              </ol>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#c2410c", marginBottom: 6 }}>Potential Impact</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#1e293b", lineHeight: 1.9 }}>
                <li>Tax Taxonomy Accounts</li>
                <li>Tax Form Lines</li>
                <li>Return Templates</li>
                <li>Downstream Mapping Rules</li>
                <li>Reporting Outputs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Remember callout banner */}
        <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderLeft: "4px solid #2563eb", borderRadius: 8, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
          <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#1e3a8a", marginBottom: 6 }}>Remember</div>
            <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.8 }}>
              <div style={{ marginBottom: 6 }}>If Roger does <strong>not</strong> match the Approved Master Data Workbook, it is a <strong style={{ color: "#14532d" }}>Software Defect</strong>.</div>
              <div>If Roger <strong>matches</strong> the Approved Master Data Workbook, but the business decides the master data should change, it is an <strong style={{ color: "#1d4ed8" }}>Approved Master Data Change</strong> and must follow the Change Control process.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 05 — Change Control ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="05" title="Change Control During UAT" subtitle="All changes originate in the Approved Master Data Workbook. No reload occurs without a documented workbook change." />
        <Callout type="warning">
          <strong>Important:</strong> Every Approved Workbook Change must be assessed for dependency and reload impact before any reload is executed. The BA performs the impact assessment. Development does not reload without BA approval.
        </Callout>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: SLATE, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 14 }}>Change Control Process</div>
          {[
            { num: 1, label: "Business identifies issue during validation",        desc: "Defect or data discrepancy found during UAT execution" },
            { num: 2, label: "BA determines: Defect or Approved Workbook Change?", desc: "Defect = platform did not load workbook correctly. Workbook Change = workbook content needs updating." },
            { num: 3, label: "Approved Workbook Change documented",                desc: "BA updates the workbook. Change is reviewed and approved before proceeding." },
            { num: 4, label: "BA performs impact assessment",                      desc: "Identifies affected worksheets, downstream dependencies, and reload scope" },
            { num: 5, label: "Reload strategy selected",                           desc: "Partial Reload / Coordinated Partial Reload / Full Reload — based on impact assessment" },
            { num: 6, label: "Reload executed and validation completed",           desc: "Development reloads. Business revalidates affected worksheets. UAT resumes only after validation suite passes." },
          ].map((step, i, arr) => (
            <div key={step.num}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "10px 12px", background: "white", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: NAVY, color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step.num}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{step.desc}</div>
                </div>
              </div>
              {i < arr.length - 1 && <div style={{ paddingLeft: 26, margin: "3px 0" }}><div style={{ width: 2, height: 10, background: "#cbd5e1" }} /></div>}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[
            { label: "Partial Reload",             color: "#2563eb", bg: "#eff6ff", items: ["Single worksheet affected","No downstream dependencies impacted","Reload only the changed worksheet","Revalidate only that worksheet"] },
            { label: "Coordinated Partial Reload", color: AMBER,     bg: "#fffbeb", items: ["Multiple worksheets affected","Some downstream dependencies impacted","Reload affected worksheets in dependency order","Revalidate all affected worksheets"] },
            { label: "Full Reload",                color: RED,       bg: "#fef2f2", items: ["Foundational worksheet changed (XLOB, Entity Types)","All downstream data potentially affected","Full reload in complete Load Order sequence","Full revalidation required"] },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}40`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: s.color, marginBottom: 8 }}>{s.label}</div>
              {s.items.map(i => (
                <div key={i} style={{ fontSize: 11, color: "#1e293b", display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: s.color }}>•</span>{i}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 06 — Defect Management ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="06" title="Defect Management" subtitle="Every defect must be tied back to a specific entry in the Approved Master Data Workbook." />
        <Callout type="info">
          <strong>Defect Traceability Rule:</strong> A defect is only valid if it can be traced to a specific workbook tab, row, and expected value. If the workbook value is incorrect, that is an Approved Workbook Change — not a defect.
        </Callout>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Required Fields for Every Defect</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {[
              { field: "Workbook Tab",            desc: "Which worksheet tab contains the issue",             color: NAVY },
              { field: "Worksheet Row",           desc: "Specific row number in the workbook",                color: NAVY },
              { field: "Master Data Object",      desc: "The data object or field that is incorrect",         color: TEAL },
              { field: "Expected Workbook Value", desc: "The value as it appears in the approved workbook",   color: GREEN },
              { field: "Actual Roger Value",      desc: "The value as it appears in Roger / the platform",    color: RED },
              { field: "Dependency Impact",       desc: "Which downstream worksheets or objects are affected",color: AMBER },
              { field: "Reload Required?",        desc: "Yes / No — based on BA impact assessment",          color: PURPLE },
            ].map(f => (
              <div key={f.field} style={{ background: "white", border: `1px solid ${f.color}30`, borderLeft: `3px solid ${f.color}`, borderRadius: 6, padding: "10px 12px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.field}</div>
                <div style={{ fontSize: 11, color: SLATE, marginTop: 3 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" as const }}>
          {[
            { phase: "Log",        color: RED,    desc: "Log with all 7 required workbook fields" },
            { phase: "Prioritize", color: AMBER,  desc: "Critical / High / Medium / Low" },
            { phase: "Assign",     color: NAVY,   desc: "Assign to BA or Dev based on type" },
            { phase: "Resolve",    color: TEAL,   desc: "Fix defect or raise Workbook Change" },
            { phase: "Retest",     color: PURPLE, desc: "Retest against workbook expected value" },
            { phase: "Close",      color: GREEN,  desc: "Close when actual matches workbook" },
          ].map((p, i, arr) => (
            <div key={p.phase} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ background: p.color, color: "white", borderRadius: 8, padding: "10px 12px", textAlign: "center" as const, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 800 }}>{p.phase}</div>
                <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3, lineHeight: 1.3 }}>{p.desc}</div>
              </div>
              {i < arr.length - 1 && <div style={{ color: "#94a3b8", fontSize: 16, margin: "0 4px", flexShrink: 0 }}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 07 — Exit Criteria ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="07" title="Exit Criteria & Business Sign-off" subtitle="Business Sign-off confirms the Approved Master Data Workbook is complete, validated, and ready for production." />
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#166534", marginBottom: 14, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>All of the following must be confirmed before Business Sign-off</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              "All MVP worksheets marked Ready for Authoring have been loaded",
              "All workbook validation completed — loaded data matches approved workbook",
              "All worksheet dependencies validated in load order sequence",
              "Load Order successfully validated end-to-end",
              "All approved workbook changes incorporated and documented",
              "Reload validation completed for all Approved Workbook Changes",
              "All critical defects resolved and retested",
              "Business approval received from authorized stakeholders",
              "Workbook approved as Production Source of Truth",
            ].map(c => (
              <div key={c} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GREEN }} />
                <span style={{ fontSize: 12, color: "#1e293b", lineHeight: 1.5 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
        <Callout type="governance">
          <strong>Sign-off Authority:</strong> Business Sign-off is the formal approval that the Approved Master Data Workbook is complete, accurate, and ready to become the Production Source of Truth. Once signed off, the workbook governs production data. Any subsequent changes require a formal change control process.
        </Callout>
      </div>

      {/* ── REF — MVP Worksheet Reference ── */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader num="REF" title="MVP Worksheet Reference" subtitle={`${mvpCount} worksheets in scope for MVP UAT — sourced from the DCT Master Data Intake Workbook Load Order tab.`} />
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 70px 80px 1fr 140px", background: NAVY, color: "white", padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
            <div>Order</div><div>Worksheet</div><div>Layer</div><div>Batch</div><div>Build Status</div><div>Authoring Status</div>
          </div>
          {(showAllWorksheets ? MVP_WORKSHEETS : MVP_WORKSHEETS.slice(0, 10)).map((w, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 70px 80px 1fr 140px", padding: "8px 14px", borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#f8fafc", fontSize: 12, alignItems: "center" }}>
              <div style={{ fontWeight: 700, color: NAVY }}>{w.order}</div>
              <div style={{ color: "#1e293b", fontWeight: 500 }}>{w.name}</div>
              <div><span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: w.layer === "PDC" ? "#dbeafe" : "#ede9fe", color: w.layer === "PDC" ? "#1e40af" : "#6d28d9" }}>{w.layer}</span></div>
              <div style={{ fontSize: 11, color: SLATE }}>Batch {w.batch}</div>
              <div><BuildBadge status={w.status} /></div>
              <div><AuthoringBadge status={w.authoring} /></div>
            </div>
          ))}
          {MVP_WORKSHEETS.length > 10 && (
            <div style={{ padding: "10px 14px", textAlign: "center" as const, borderTop: "1px solid #e2e8f0" }}>
              <button
                onClick={() => setShowAllWorksheets(v => !v)}
                style={{ fontSize: 12, fontWeight: 600, color: NAVY, background: "none", border: `1px solid ${NAVY}`, borderRadius: 6, padding: "5px 16px", cursor: "pointer" }}
              >
                {showAllWorksheets ? "Show Less" : `Show All ${MVP_WORKSHEETS.length} Worksheets`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14, fontSize: 11, color: "#94a3b8", textAlign: "center" as const }}>
        DCT Platform · Master Data UAT Framework · RSM Digital Solutions · Document Owner: Jenniver Stafford · Version 3.0 · MVP Target: September 21, 2026
      </div>
    </div>
  );
}
