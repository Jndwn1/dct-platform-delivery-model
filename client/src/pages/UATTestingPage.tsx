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
        <Callout type="governance">
          <strong>Key Principle:</strong> Business Users validate the workbook, not the platform. If loaded data does not match the workbook, that is a defect. If the workbook is incorrect, that is an Approved Workbook Change — not a defect.
        </Callout>
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
