import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { masterDataDomains, parseCurrentMasterDataFields, selectAuthoritativeMasterDataArtifact } from "../../../../server/masterDataRegistry";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";

const NAVY = "#1e3a5f";
const GREEN = "#047857";
const AMBER = "#b45309";
const RED = "#b91c1c";

const LIFECYCLE = ["Business Review / Approval", "DCT_Master_Data_Intake.xlsx Updated", "Authoritative Master Data Established", "DCT/TDC Data Load or Reload", "API / Platform Consumption", "Roger / Downstream Integration", "QA Validation", "UAT Validation", "Approved Production Master Data"];
const GOVERNANCE_RULES = [
  "Active workbook tabs are the authoritative source for Master Data values.",
  "Tabs explicitly labeled OLD are historical reference only and cannot override active values.",
  "Changes must be reflected in the authoritative workbook and traced to the applicable load or reload.",
  "QA validates loaded values against the workbook; UAT findings may initiate approved changes.",
  "Conflicting values, missing relationships, and unsupported mappings are surfaced for review rather than inferred.",
];

function domainPurpose(sourceTab: string) {
  if (/firm taxonomy/i.test(sourceTab)) return "PDC canonical firm taxonomy and account hierarchy.";
  if (/tax taxonomy/i.test(sourceTab)) return "TDC tax-account taxonomy and PDC taxonomy relationship.";
  if (/adjustment rules$/i.test(sourceTab)) return "Complete inventory of current TDC adjustment rules.";
  if (/adjustment rule inputs/i.test(sourceTab)) return "Inputs and reference fields required by adjustment rules.";
  if (/adjustment rule lines/i.test(sourceTab)) return "Taxonomy account and line-level treatment used by adjustment rules.";
  if (/eligibility/i.test(sourceTab)) return "Eligibility tier and reference conditions.";
  if (/tax form/i.test(sourceTab)) return "Tax form and form-line reference definitions.";
  if (/return template|workpaper|recon formula/i.test(sourceTab)) return "Return, workpaper, and reconciliation reference definitions.";
  if (/filing due|confidence|depreciation|provision|consol return|carryforward|signing|profile|controlled group|determination|approval/i.test(sourceTab)) return "Current TDC reference and policy data.";
  return "Current workbook reference data.";
}

function statusForDomain(sourceTab: string) {
  if (/firm taxonomy|tax taxonomy/i.test(sourceTab)) return { label: "AUTHORITATIVE", color: GREEN };
  if (/adjustment rule/i.test(sourceTab)) return { label: "Requires Verification", color: AMBER };
  return { label: "Requires Verification", color: AMBER };
}

export default function MasterDataGovernance() {
  const { data: artifacts = [], isLoading } = trpc.dataMapping.listArtifacts.useQuery();
  const [query, setQuery] = useState("");
  const masterArtifact = useMemo(() => selectAuthoritativeMasterDataArtifact(artifacts), [artifacts]);
  const fields = useMemo(() => masterArtifact ? parseCurrentMasterDataFields(masterArtifact.fieldsJson) : [], [masterArtifact]);
  const domains = useMemo(() => masterDataDomains(fields).filter(domain => !/^(README|Master Data Authoring Guide|Load Order|Conventions|Sheet1)$/i.test(domain.sourceTab)), [fields]);
  const filteredDomains = domains.filter(domain => domain.sourceTab.toLowerCase().includes(query.toLowerCase()));

  return <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 32px 48px", fontFamily: "system-ui, sans-serif" }}>
    <header style={{ borderBottom: "2px solid #dbe4ee", paddingBottom: 20, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: NAVY, color: "white", fontWeight: 900, display: "grid", placeItems: "center" }}>MD</div>
        <div><h1 style={{ fontSize: 24, margin: 0, color: "#0f172a" }}>Master Data &amp; Governance</h1><div style={{ marginTop: 3, fontSize: 12, color: "#64748b" }}>DCT Discovery Center · Workbook-backed source governance and lifecycle</div></div>
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 12 }}>
        {["Discovery Center", "Authoritative Source", "Active Tabs Only", "Conflict Safe"].map((label, index) => <span key={label} style={{ background: index === 1 ? GREEN : NAVY, color: "white", borderRadius: 4, padding: "3px 8px", fontWeight: 700, fontSize: 10 }}>{label}</span>)}
      </div>
    </header>

    <section style={{ background: masterArtifact ? "#ecfdf5" : "#fff7ed", border: `1px solid ${masterArtifact ? "#86efac" : "#fdba74"}`, borderRadius: 10, padding: "18px 20px", marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div><div style={{ fontSize: 11, color: masterArtifact ? GREEN : AMBER, fontWeight: 800, letterSpacing: ".08em" }}>AUTHORITATIVE MASTER DATA SOURCE</div><h2 style={{ margin: "5px 0", fontSize: 18, color: "#0f172a" }}>{masterArtifact ? masterArtifact.fileName : "DCT_Master_Data_Intake.xlsx"}</h2><p style={{ margin: 0, maxWidth: 760, fontSize: 13, lineHeight: 1.55, color: "#334155" }}>The latest active tabs contain approved DCT Master Data values. Tabs explicitly labeled <strong>OLD</strong> are historical reference only and must not be used for current processing, mappings, system configuration, or Ask Buddy answers.</p></div>
        {masterArtifact ? <a href={masterArtifact.storageUrl} target="_blank" rel="noreferrer" style={{ background: NAVY, color: "white", padding: "9px 12px", borderRadius: 6, textDecoration: "none", fontSize: 12, fontWeight: 700 }}>View Authoritative Master Data</a> : <span style={{ color: AMBER, fontWeight: 700, fontSize: 12 }}>{isLoading ? "Checking registered sources…" : "Workbook needs authoritative registration"}</span>}
      </div>
    </section>

    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 28 }}>
      {[{ label: "Active Domains", value: domains.length || "—", note: "Parsed from active workbook tabs", color: NAVY }, { label: "Active Records", value: fields.length || "—", note: "Current tab records retained", color: GREEN }, { label: "Historical Tabs", value: "2", note: "OLD PDC and TDC taxonomies", color: "#64748b" }, { label: "Load Posture", value: "Verify", note: "Workbook existence is not a load confirmation", color: AMBER }].map(card => <div key={card.label} style={{ border: "1px solid #dbe4ee", borderTop: `3px solid ${card.color}`, borderRadius: 8, padding: 14, background: "white" }}><div style={{ fontSize: 10, color: "#64748b", fontWeight: 800, letterSpacing: ".07em" }}>{card.label.toUpperCase()}</div><div style={{ fontSize: 24, color: card.color, fontWeight: 800, marginTop: 4 }}>{card.value}</div><div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{card.note}</div></div>)}
    </section>

    <section style={{ marginBottom: 28 }}><h2 style={{ fontSize: 18, color: "#0f172a", marginBottom: 8 }}>What DCT Master Data Does</h2><p style={{ fontSize: 14, lineHeight: 1.7, color: "#334155", margin: 0 }}>Master Data establishes the governed reference values used to classify financial data in <strong>PDC</strong>, apply tax taxonomy and rule relationships in <strong>TDC</strong>, and support trusted, read-only practitioner experiences in <strong>Roger</strong>. PDC firm taxonomy provides the canonical financial classification; TDC tax taxonomy, adjustment rules, inputs, and lines describe the governed tax relationship. Roger and downstream integrations consume only published, governed platform data; this page does not infer relationships that are not supported by the workbook or an approved platform artifact.</p></section>

    <section style={{ marginBottom: 28 }}><div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "end", flexWrap: "wrap" }}><div><h2 style={{ fontSize: 18, color: "#0f172a", margin: 0 }}>Master Data Domains</h2><p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>Active workbook tabs only. Load status is not assumed from workbook presence.</p></div><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filter source tab…" style={{ padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12 }} /></div>
      <div style={{ overflowX: "auto", border: "1px solid #dbe4ee", borderRadius: 8, marginTop: 12 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}><thead style={{ background: NAVY, color: "white" }}><tr>{["Domain", "Purpose", "System Owner / Consumer", "Source Tab", "Current Status", "Dependencies"].map(header => <th key={header} style={{ textAlign: "left", padding: "10px 12px", whiteSpace: "nowrap" }}>{header}</th>)}</tr></thead><tbody>{filteredDomains.map(domain => { const status = statusForDomain(domain.sourceTab); return <tr key={domain.sourceTab} style={{ borderTop: "1px solid #e2e8f0" }}><td style={{ padding: 10, fontWeight: 700 }}>{domain.sourceTab.replace(/^PDC - |^TDC - /, "")}</td><td style={{ padding: 10 }}>{domainPurpose(domain.sourceTab)}</td><td style={{ padding: 10 }}>{domain.sourceTab.startsWith("PDC") ? "PDC source tab" : domain.sourceTab.startsWith("TDC") ? "TDC source tab" : "Workbook source tab"}</td><td style={{ padding: 10, color: NAVY }}>{domain.sourceTab}</td><td style={{ padding: 10 }}><span style={{ color: status.color, fontWeight: 800 }}>{status.label}</span></td><td style={{ padding: 10, color: "#64748b" }}>{domain.recordCount} parsed records; load relationship requires verification</td></tr>; })}{!filteredDomains.length && <tr><td colSpan={6} style={{ padding: 18, color: "#64748b" }}>No current domains are registered yet. Register the authoritative workbook to populate this table.</td></tr>}</tbody></table></div>
    </section>

    <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, .7fr)", gap: 18, marginBottom: 28 }}><div style={{ border: "1px solid #dbe4ee", borderRadius: 8, padding: 16, background: "white" }}><h2 style={{ fontSize: 18, margin: 0, color: "#0f172a" }}>Master Data Lifecycle</h2><div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 16 }}>{LIFECYCLE.map((step, index) => <div key={step} style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ maxWidth: 142, padding: "8px 10px", background: index === 2 ? "#dcfce7" : "#eff6ff", border: `1px solid ${index === 2 ? "#86efac" : "#bfdbfe"}`, borderRadius: 6, color: "#1e3a5f", fontSize: 11, fontWeight: 700, textAlign: "center" }}>{step}</span>{index < LIFECYCLE.length - 1 && <span style={{ color: "#94a3b8" }}>→</span>}</div>)}</div></div><div style={{ border: "1px solid #fde68a", borderRadius: 8, padding: 16, background: "#fffbeb" }}><h2 style={{ color: "#92400e", fontSize: 16, margin: 0 }}>Adjustment Rule Inventory</h2><p style={{ fontSize: 12, color: "#78350f", lineHeight: 1.55 }}>The active <strong>TDC - Adjustment Rules</strong> tab is the current rule inventory. No color indicates previously loaded; orange requires load verification; red indicates supporting information is still being completed; yellow indicates an updated value or account mapping that requires review or alignment.</p><div style={{ fontSize: 12, color: "#78350f", fontWeight: 700 }}>Updated Rule Lines: MP-02 · MP-06 · MP-07 · MP-08</div><p style={{ fontSize: 11, color: "#92400e", marginBottom: 0 }}>Rule Inputs were reviewed; the workbook does not evidence a required taxonomy account change for previously loaded adjustments. System alignment remains subject to verification.</p></div></section>

    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18, marginBottom: 28 }}><div style={{ border: "1px solid #dbe4ee", borderRadius: 8, padding: 16 }}><h2 style={{ margin: 0, color: "#0f172a", fontSize: 17 }}>Load &amp; Change Status</h2><p style={{ fontSize: 12, color: "#64748b" }}>An active workbook value does not by itself prove deployment. Where an authoritative load artifact is unavailable, the status remains <strong>Requires Verification</strong>.</p>{[["Already Loaded", "Only when a supporting load record is available", GREEN], ["Requires Reload", "Approved workbook changes awaiting reapplication", AMBER], ["New / Requires Load", "New active rule or reference data", AMBER], ["Pending Supporting Rules", "Rule exists but supporting tab content remains incomplete", RED], ["Historical", "OLD tabs — do not use for current processing", "#64748b"]].map(([label, note, color]) => <div key={String(label)} style={{ display: "flex", gap: 8, marginTop: 8 }}><span style={{ color: String(color), fontWeight: 800, minWidth: 140, fontSize: 12 }}>{label}</span><span style={{ color: "#475569", fontSize: 12 }}>{note}</span></div>)}</div><div style={{ border: "1px solid #dbe4ee", borderRadius: 8, padding: 16 }}><h2 style={{ margin: 0, color: "#0f172a", fontSize: 17 }}>Governance Rules</h2>{GOVERNANCE_RULES.map((rule, index) => <div key={rule} style={{ display: "flex", gap: 9, marginTop: 10, fontSize: 12, color: "#334155", lineHeight: 1.45 }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: NAVY, color: "white", display: "grid", placeItems: "center", fontWeight: 800, flexShrink: 0 }}>{index + 1}</span>{rule}</div>)}</div></section>

    <section style={{ background: "#f8fafc", border: "1px solid #dbe4ee", borderRadius: 8, padding: 16 }}><h2 style={{ margin: 0, color: "#0f172a", fontSize: 17 }}>Connected Discovery</h2><p style={{ fontSize: 12, color: "#64748b" }}>Use the connected platform pages to understand consuming systems and governance. Master Data answers remain governed by the active workbook first.</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[["PDC", "/discovery/pdc"], ["TDC / DCT", "/discovery/dct-overview"], ["Roger", "/discovery/roger-overview"], ["Ask Buddy", "/ask-buddy"], ["BA Requirements", "/discovery/ba-requirements"], ["Provision & State", "/onboarding"], ["Data Gateway", "/discovery/data-gateway"]].map(([label, path]) => <Link key={path} href={path}><span style={{ display: "inline-block", background: "white", border: "1px solid #cbd5e1", color: NAVY, padding: "6px 9px", borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{label}</span></Link>)}</div></section>
    <DiscoveryAskBuddy pagePath="/discovery/master-data-governance" pageTitle="Master Data & Governance" />
  </div>;
}
