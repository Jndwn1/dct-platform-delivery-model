// DiscoveryWorkspace.tsx
// Provision & State Discovery Workspace
// Single-page interactive architecture workspace for BA requirements discovery
// Replaces the multi-step onboarding wizard entirely

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { appendSharedBuddyConversation } from "@/lib/askBuddyConversation";
import RuleProcessingTdcPosting from "@/components/RuleProcessingTdcPosting";

// ─── Color palette ────────────────────────────────────────────────────────────
const C = {
  navy:    "#0f1623",
  blue:    "#1e3a5f",
  green:   "#065f46",
  purple:  "#7c3aed",
  amber:   "#b45309",
  teal:    "#0369a1",
  rose:    "#be185d",
  slate:   "#475569",
  b9a:     "#1e3a5f",
  b16:     "#065f46",
  b28:     "#7c3aed",
};

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px",
          backgroundColor: C.navy, color: "#10b981",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "13px", fontWeight: 800, flexShrink: 0,
        }}>{number}</div>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 800, color: C.navy, margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: "12px", color: C.slate, margin: "2px 0 0" }}>{subtitle}</p>}
        </div>
      </div>
      <div style={{ height: "2px", backgroundColor: "#e2e8f0", marginTop: "14px" }} />
    </div>
  );
}

// ─── DCT cross-team refinement model ─────────────────────────────────────────
type ReadinessStatus = "Ready" | "Ready with Dependency" | "Needs Clarification" | "Not Ready";

type DiscoveryStory = {
  id: string;
  outcome: string;
  scope: string;
  owner: string;
  dct: string;
  roger: string;
  questions: string[];
  dependencies: string[];
  existing: string;
  netNew: string;
  implementation: string;
  estimation: ReadinessStatus;
  acceptance: ReadinessStatus;
  reason: string;
};

const REFINEMENT_ROLES = [
  {
    title: "Business Workstream / BA / PO",
    color: C.teal,
    cue: "Business WHAT and WHY",
    items: [
      "Own business requirements, rules, expected outcomes, and the practitioner objective.",
      "Define required business data, its meaning, validation rules, and success, failure, warning, and exception behavior.",
      "Lead refinement and resolve business decisions before DCT accepts a story.",
    ],
  },
  {
    title: "DCT",
    color: C.blue,
    cue: "Backend HOW",
    items: [
      "Pre-review stories for gaps, dependencies, implementation considerations, and estimation concerns.",
      "Determine the technical implementation and how PDC, TDC, Gateway, Orchestrator, and audit / lineage support the requirement.",
      "Do not invent missing State or Provision business requirements or make business decisions for the requesting workstream.",
    ],
  },
  {
    title: "Roger",
    color: "#0878aa",
    cue: "Practitioner UI HOW",
    items: [
      "Own practitioner-facing UI implementation and interaction behavior.",
      "Consume governed DCT data through the Gateway or approved access layer.",
      "Do not own or persist DCT / TDC tax records.",
    ],
  },
] as const;

const REFINEMENT_SEQUENCE = [
  "Discovery / Requirements Defined",
  "DCT Pre-Review",
  "Refinement",
  "Resolve Open Questions / Dependencies",
  "Confirm Implementation Considerations",
  "Estimate",
  "DCT Acceptance",
  "DEV / QA",
] as const;

const REFINEMENT_CHECKLISTS = [
  { title: "Business Definition", color: C.teal, items: ["What is the practitioner trying to accomplish?", "What business event triggers the requirement?", "What is the expected outcome?", "What data elements are required and what do they mean?", "What business rules, missing-data behavior, exceptions, and out-of-scope conditions apply?"] },
  { title: "Data / Integration", color: C.blue, items: ["What system or business process is the source?", "At what business level must data be supported: client, filing, entity, Description / line item, or another level?", "Who consumes the result and what must be returned?", "Is the result working / draft, approved / final, or both?", "What downstream workflow depends on it?"] },
  { title: "DEV / QA Readiness", color: C.green, items: ["Can DEV determine the behavior that must be implemented?", "Can QA determine what must be validated, including positive and negative outcomes?", "Are unresolved business decisions and dependencies documented?", "Can the team estimate without assumptions about missing requirements?"] },
] as const;

const PROVISION_REFINEMENT_CHECKLISTS = [
  { title: "Business Definition", color: C.purple, items: ["What is the practitioner trying to accomplish and what event triggers it?", "What accounting or tax rule applies, what does each amount mean, and what is the authoritative source?", "What happens when data is missing, zero, or null; what exceptions are supported; and what is out of scope?"] },
  { title: "Data / Calculation", color: C.blue, items: ["What level is required: client, filing, entity, Description / line item, or another level?", "How are entity-level amounts rolled up and which values are calculated versus sourced?", "Which values may be corrected, what recalculates, and which source values remain historically visible?"] },
  { title: "Integration", color: C.teal, items: ["Who consumes the result, what must be returned, and at what level?", "When is the result ready, which downstream package depends on it, and what business rule controls routing?"] },
  { title: "DEV / QA Readiness", color: C.green, items: ["Can DEV determine behavior and QA determine positive and negative outcomes?", "Are mappings, calculation rules, business decisions, and dependencies confirmed?", "Can the team estimate without inventing accounting or tax requirements?"] },
] as const;

const PROVISION_PRIMARY_QUESTIONS: Record<string, string> = {
  "1479949": "Can Provision confirm the authoritative source values and business mapping DCT should use for PY Provision and PY Tax Return, including the required level of detail and exception handling?",
  "1479958": "Confirm how DCT should handle RTP items without a Step 9 match, recalculate totals when entities are filtered, roll entity-level amounts into totals, and handle exceptions to the normal Permanent/Temporary classification.",
  "1480251": "When a practitioner corrects an amount, what business value are they actually changing: PY Provision, PY Tax Return, or a separate corrected value?",
  "1480000": "What exact RTP result does each downstream Provision workflow need, and what business rule determines whether the result routes to payable, deferred, or another treatment?",
};

const STATE_STORIES: DiscoveryStory[] = [
  {
    id: "1471480 — Retrieve Return Structure Starting Context for a State Filer / Filing Group",
    outcome: "Roger opens the correct governed State filing context for a single filer or filing group.",
    scope: "Retrieve the initial State filing context when Roger opens or begins the State workflow.",
    owner: "State Business Team", dct: "Determine governed retrieval and backend implementation.", roger: "Render the approved State starting context.",
    questions: ["Define starting context; current-year, prior-year, or both.", "Specify required fields, source meaning, filer / filing-group identification, and no-footprint behavior.", "Confirm whether prior-year data is reviewable starting context only."],
    dependencies: ["State filing-footprint definition", "Roger workflow-entry behavior"], existing: "Gateway consumer access; PDC / TDC governed context patterns.", netNew: "State-specific return-structure starting-context contract.", implementation: "Business clarification required before DCT selects data shape or retrieval pattern.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "Starting context and exception behavior are not yet defined for DEV and QA.",
  },
  {
    id: "1471493 — Save and Lock a State Filing Footprint Version",
    outcome: "A practitioner can work, save, approve, and lock a governed State filing-footprint version with understood lifecycle behavior.",
    scope: "Persist a State Filing Footprint and govern its working / saved through approval / lock lifecycle.",
    owner: "State Business Team", dct: "Implement governed persistence, versioning, and lifecycle enforcement.", roger: "Present statuses and trigger approved practitioner actions.",
    questions: ["Define Save, Approve, and Lock, including each practitioner trigger.", "Specify required persisted business information and lock eligibility.", "Define post-lock change behavior, versioning, and statuses Roger must display."],
    dependencies: ["State lifecycle policy", "Roger approval interaction"], existing: "TDC persistence and audit / lineage patterns.", netNew: "State filing-footprint lifecycle and status model.", implementation: "Business clarification required; DCT will determine persistence pattern after lifecycle rules are defined.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "Lifecycle semantics and post-lock behavior are unresolved.",
  },
  {
    id: "1471498 — Expose Saved State Filing Footprint and Record Audit / Lineage Events",
    outcome: "Approved consumers can access the governed State Filing Footprint with appropriate audit and lineage evidence.",
    scope: "Expose governed State Filing Footprint information and capture audit / lineage for governed changes.",
    owner: "State Business Team", dct: "Compose governed access and reuse existing audit / lineage capabilities.", roger: "Display approved business fields and any required audit history.",
    questions: ["Clarify whether saved means working, approved, or both.", "Identify consumers, required fields, and business events that require audit history.", "Confirm whether Roger displays audit history and whether exposure / audit remain one story."],
    dependencies: ["1471493 lifecycle definition", "B16 audit / lineage capability"], existing: "Batch 16 audit / lineage and Gateway governed access.", netNew: "State consumer field set and exposure contract.", implementation: "Reuse audit / lineage unless a documented State requirement identifies a gap.", estimation: "Ready with Dependency", acceptance: "Needs Clarification", reason: "Consumer state, required fields, and story split require business confirmation.",
  },
  {
    id: "1472734 — DCT Gateway: Compose State Return-Filing Response for Roger",
    outcome: "Roger receives the governed State return-filing response required for the practitioner experience.",
    scope: "Provide the governed Gateway response Roger requires for State filing.",
    owner: "State Business Team / Roger", dct: "Compose the governed response through the appropriate Gateway access layer.", roger: "Own UI interaction behavior and required presentation behavior.",
    questions: ["Define required business fields and field meanings.", "Define filingName and returnStructure from the State perspective.", "Confirm one versus multiple filings, working versus approved data, and incomplete-filing behavior."],
    dependencies: ["State business response definition", "Roger consumer requirements"], existing: "Gateway response composition and governed consumer access.", netNew: "State return-filing response contract.", implementation: "Business clarification required; State does not need to prescribe endpoint, DTO, or Gateway implementation.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "The required business response and incomplete-state behavior are not defined.",
  },
];

const PROVISION_STORIES: DiscoveryStory[] = [
  {
    id: "1479949 — DCT-P1-01: Provide governed RTP inputs, context, and source evidence",
    outcome: "Provision practitioners receive governed prior-year Return-to-Provision inputs and source evidence by Description and entity.",
    scope: "Provide the governed business inputs and context for Package 1 Return-to-Provision Review.",
    owner: "Tax Provision Business Team", dct: "Provide governed inputs, context, and evidence; determine technical implementation.", roger: "Present the approved review experience.",
    questions: ["Confirm authoritative PY Provision and PY Tax Return values, Description mapping, entity detail, and eligible C corporation behavior.", "Define period, missing-value, null versus zero, sign, rounding, final / filed return, amendment, and source-evidence rules."],
    dependencies: ["Package 1 BRD", "A110 example", "Provision source governance"], existing: "PDC financial truth, TDC governed records, audit / lineage patterns.", netNew: "RTP source-context dataset and business evidence contract.", implementation: "DCT will select source integration and persistence approach after business definitions are complete.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "Authoritative values and business handling rules need Provision confirmation.",
  },
  {
    id: "1479958 — DCT-P1-02: Provide the RTP calculation and section dataset",
    outcome: "Package 1 can compare PY Tax Return to PY Provision and present governed section calculations.",
    scope: "Provide the RTP comparison and section-calculation dataset, including entity filtering and rollups.",
    owner: "Tax Provision Business Team", dct: "Provide governed dataset and calculate according to approved business rules.", roger: "Render approved section and entity-level review behavior.",
    questions: ["Confirm RTP Difference = PY Tax Return − PY Provision.", "Define Step 9 Description / group / order reuse and RTP items without a Step 9 match.", "Confirm entity filtering, rollups, Permanent / Temporary exceptions, Pretax Income exclusion, and Taxable Income presentation."],
    dependencies: ["1479949 governed inputs", "Package 1 business calculation rules"], existing: "DCT calculation orchestration, PDC source data, TDC governed outputs.", netNew: "RTP calculation / section business dataset.", implementation: "Confirm how DCT handles unmatched Step 9 items, filtered totals, entity rollups, and classification exceptions.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "Business calculation and presentation behavior remains incomplete.",
  },
  {
    id: "1480251 — DCT-P1-03: Persist, audit, and recalculate prior-year amount corrections",
    outcome: "A practitioner correction is governed, audited, and reflected in affected RTP results.",
    scope: "Persist a practitioner correction to an incorrect prior-year amount, audit the change, and recalculate affected results.",
    owner: "Tax Provision Business Team", dct: "Persist and audit the approved correction model; recalculate governed results.", roger: "Present the business-approved correction interaction and returned values.",
    questions: ["Does the correction change PY Provision, PY Tax Return, or create a separate override?", "Which original value stays visible and what value returns to Roger?", "Define affected totals and original-versus-corrected audit semantics."],
    dependencies: ["Provision correction policy", "B16 audit / lineage capability"], existing: "Governed persistence, audit history, recalculation patterns.", netNew: "Provision correction business model and recalculation rules.", implementation: "MVP excludes correction reason, add / delete row, and formal approval / sign-off. DCT must not select correction meaning.", estimation: "Not Ready", acceptance: "Not Ready", reason: "The core accounting and business meaning of a correction is unresolved.",
  },
  {
    id: "1480000 — DCT-P1-04: Provide RTP true-up outputs to downstream Provision workflows",
    outcome: "Completed governed RTP results are available to downstream Provision workflows when business-ready.",
    scope: "Expose the completed governed RTP result to Package 2 and Package 3 downstream workflows.",
    owner: "Tax Provision Business Team", dct: "Expose the approved governed result with identifiers and lineage.", roger: "Consume downstream-ready information only where needed in the practitioner experience.",
    questions: ["Define Package 2 / Package 3 input requirements, entity versus consolidated output, identifiers, classifications, lineage, and whether consumers need RTP Difference only or supporting PY amounts.", "Confirm Permanent / Temporary and payable / deferred routing, whether an item may route to both, corrected-value behavior, readiness for consumption, and whether a saved correction must complete before downstream output updates."],
    dependencies: ["1479958 completed RTP dataset", "Package 2 — Deferred Rollforward", "Package 3 — Federal Summary"], existing: "Gateway governed access and audit / lineage capabilities.", netNew: "Provision routing and downstream output contract.", implementation: "Temporary differences feed Package 2; Permanent differences do not feed Deferred Rollforward and require payable-account treatment. Provision must define detailed routing rules.", estimation: "Needs Clarification", acceptance: "Needs Clarification", reason: "Downstream output contract and payable / deferred routing require confirmation.",
  },
];

const STATUS_STYLE: Record<ReadinessStatus, { bg: string; text: string; border: string }> = {
  "Ready": { bg: "#ecfdf5", text: "#047857", border: "#a7f3d0" },
  "Ready with Dependency": { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" },
  "Needs Clarification": { bg: "#fffbeb", text: "#92400e", border: "#fde68a" },
  "Not Ready": { bg: "#fef2f2", text: "#b91c1c", border: "#fecaca" },
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return <button type="button" onClick={copy} style={{ border: "1px solid #cbd5e1", color: C.navy, backgroundColor: "#ffffff", borderRadius: "5px", padding: "5px 8px", fontSize: "10px", fontWeight: 750, cursor: "pointer" }}>{copied ? "Copied" : label}</button>;
}

function ReadinessBadge({ status }: { status: ReadinessStatus }) {
  const s = STATUS_STYLE[status];
  return <span style={{ display: "inline-flex", border: `1px solid ${s.border}`, backgroundColor: s.bg, color: s.text, borderRadius: "999px", padding: "3px 7px", fontSize: "10px", fontWeight: 800, whiteSpace: "nowrap" }}>{status}</span>;
}

function CrossTeamRefinementModel() {
  return (
    <section id="refinement-model" style={{ marginBottom: "48px" }}>
      <SectionHeading number="A" title="Cross-Team Discovery & Refinement Model" subtitle="Business workstreams define expected behavior first; DCT applies the backend implementation after requirements are ready." />
      <div style={{ backgroundColor: C.navy, borderRadius: "12px", padding: "20px 22px", marginBottom: "18px" }}>
        <div style={{ fontSize: "11px", color: "#6ee7b7", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>DCT acceptance check</div>
        <p style={{ margin: 0, color: "#ffffff", fontSize: "17px", fontWeight: 750, lineHeight: "1.45", maxWidth: "1000px" }}>“Is there enough information in this story for DCT DEV to know what must be built and for QA to know what must be validated, without DCT having to make a business decision?”</p>
        <p style={{ margin: "10px 0 0", color: "#cbd5e1", fontSize: "12px", lineHeight: "1.5" }}>If the answer is <strong>No</strong>, the story requires <strong style={{ color: "#fbbf24" }}>business clarification before DCT acceptance</strong>.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px", marginBottom: "18px" }}>
        {REFINEMENT_ROLES.map(role => <div key={role.title} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderTop: `4px solid ${role.color}`, borderRadius: "10px", padding: "15px 16px" }}><div style={{ color: role.color, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "5px" }}>{role.cue}</div><h3 style={{ color: C.navy, fontSize: "14px", margin: "0 0 10px" }}>{role.title}</h3><ul style={{ margin: 0, paddingLeft: "17px" }}>{role.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "11px", lineHeight: "1.5", marginBottom: "7px" }}>{item}</li>)}</ul></div>)}
      </div>
      <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "14px 16px" }}>
        <div style={{ fontSize: "10px", color: C.slate, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Required sequence — refinement is not first discovery</div>
        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap", alignItems: "center" }}>{REFINEMENT_SEQUENCE.map((step, index) => <div key={step} style={{ display: "flex", alignItems: "center", gap: "7px" }}><span style={{ backgroundColor: index < 2 ? "#e0f2fe" : index < 5 ? "#fef3c7" : "#dcfce7", color: C.navy, borderRadius: "5px", padding: "6px 8px", fontSize: "10px", fontWeight: 750 }}>{step}</span>{index < REFINEMENT_SEQUENCE.length - 1 && <span style={{ color: "#94a3b8", fontWeight: 800 }}>→</span>}</div>)}</div>
      </div>
    </section>
  );
}

function StoryMatrix({ stories }: { stories: DiscoveryStory[] }) {
  const copyText = stories.map(story => `${story.id}\nBusiness outcome: ${story.outcome}\nOpen business questions: ${story.questions.join("; ")}\nDependencies: ${story.dependencies.join("; ")}\nEstimation: ${story.estimation}\nDCT acceptance: ${story.acceptance}\nReason / gap: ${story.reason}`).join("\n\n");
  return <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}><div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}><div><div style={{ fontSize: "12px", color: C.navy, fontWeight: 800 }}>Story Readiness Matrix</div><div style={{ fontSize: "10px", color: C.slate, marginTop: "2px" }}>Ready means DEV and QA can proceed without inventing business behavior.</div></div><CopyButton text={copyText} label="Copy matrix" /></div><div style={{ overflowX: "auto" }}><table style={{ borderCollapse: "collapse", width: "100%", minWidth: "1740px", fontSize: "10px" }}><thead><tr style={{ backgroundColor: C.navy }}>{["Story", "Business Outcome", "Scope", "Business Owner", "DCT Responsibility", "Roger Responsibility", "Open Business Questions", "Dependencies", "Existing DCT Capability", "Net-New DCT Capability", "Implementation Considerations", "Ready for Estimation?", "Ready for DCT Acceptance?", "Reason / Gap"].map(header => <th key={header} style={{ color: "#ffffff", textAlign: "left", padding: "10px", fontWeight: 750, minWidth: header === "Story" ? "190px" : "145px" }}>{header}</th>)}</tr></thead><tbody>{stories.map((story, index) => <tr key={story.id} style={{ backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}><td style={{ padding: "10px", verticalAlign: "top", color: C.navy, fontWeight: 800, lineHeight: "1.4" }}>{story.id}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.outcome}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.scope}</td><td style={{ padding: "10px", verticalAlign: "top" }}>{story.owner}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.dct}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.roger}</td><td style={{ padding: "10px", verticalAlign: "top" }}><ul style={{ margin: 0, paddingLeft: "14px" }}>{story.questions.map(question => <li key={question} style={{ marginBottom: "4px", lineHeight: "1.4" }}>{question}</li>)}</ul></td><td style={{ padding: "10px", verticalAlign: "top" }}><ul style={{ margin: 0, paddingLeft: "14px" }}>{story.dependencies.map(dependency => <li key={dependency} style={{ marginBottom: "4px", lineHeight: "1.4" }}>{dependency}</li>)}</ul></td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.existing}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.netNew}</td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.implementation}</td><td style={{ padding: "10px", verticalAlign: "top" }}><ReadinessBadge status={story.estimation} /></td><td style={{ padding: "10px", verticalAlign: "top" }}><ReadinessBadge status={story.acceptance} /></td><td style={{ padding: "10px", verticalAlign: "top", lineHeight: "1.45" }}>{story.reason}</td></tr>)}</tbody></table></div></div>;
}

function ProvisionPackageOneDetail() {
  const included = ["Annual Federal C corporation data", "Description", "PY Provision", "PY Tax Return", "RTP Difference", "Entity filtering and entity-level expansion / detail", "Pretax Income", "Permanent Differences", "Temporary Differences", "Total RTP Adjustment", "Taxable Income", "Entity-level correction of an incorrect amount"];
  const excluded = ["Quarterly / interim provisions", "State provision data", "Flow-through entities", "Correction reasons", "Adding or deleting rows", "Formal approval / sign-off", "Separate preparer / reviewer roles", "Payable account reconciliation"];
  const checklistText = PROVISION_REFINEMENT_CHECKLISTS.map(group => `${group.title}\n${group.items.join("\n")}`).join("\n\n");
  return <div style={{ marginBottom: "16px" }}>
    <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderLeft: `5px solid ${C.purple}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}><div><div style={{ color: C.purple, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px" }}>Package 1 purpose</div><h3 style={{ color: C.navy, fontSize: "15px", margin: "0 0 7px" }}>Package 1 — Return-to-Provision Review</h3><p style={{ color: "#334155", fontSize: "12px", lineHeight: "1.55", margin: 0 }}>Allow an authorized practitioner to compare the PY Provision amount with the PY filed Tax Return by Description and entity, identify every variance, and include the governed RTP difference in the current-year provision true-up.</p></div><CopyButton text={"Package 1 — Return-to-Provision Review\nRTP Difference = PY Tax Return − PY Provision"} label="Copy Package 1" /></div>
      <div style={{ display: "inline-flex", marginTop: "10px", backgroundColor: "#ffffff", border: "1px solid #d8b4fe", borderRadius: "6px", padding: "7px 9px", color: C.purple, fontSize: "12px", fontWeight: 850 }}>RTP Difference = PY Tax Return − PY Provision</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #bbf7d0", borderRadius: "9px", padding: "13px" }}><div style={{ color: C.green, fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>MVP includes</div><ul style={{ margin: 0, paddingLeft: "16px", columns: 2 }}>{included.map(item => <li key={item} style={{ color: "#166534", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{item}</li>)}</ul></div>
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #fecaca", borderRadius: "9px", padding: "13px" }}><div style={{ color: "#b91c1c", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>MVP excludes</div><ul style={{ margin: 0, paddingLeft: "16px", columns: 2 }}>{excluded.map(item => <li key={item} style={{ color: "#991b1b", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{item}</li>)}</ul></div>
    </div>
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "9px" }}><div><div style={{ color: C.navy, fontSize: "12px", fontWeight: 800 }}>Provision Refinement Question Framework</div><div style={{ color: C.slate, fontSize: "10px", marginTop: "2px" }}>Refinement resolves questions, dependencies, implementation considerations, estimation, and readiness; it is not a first-time business walkthrough.</div></div><CopyButton text={checklistText} label="Copy Provision checklist" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "9px" }}>{PROVISION_REFINEMENT_CHECKLISTS.map(group => <div key={group.title} style={{ border: `1px solid ${group.color}40`, borderTop: `4px solid ${group.color}`, borderRadius: "8px", padding: "10px" }}><div style={{ color: group.color, fontSize: "10px", fontWeight: 800, marginBottom: "5px" }}>{group.title}</div><ul style={{ margin: 0, paddingLeft: "14px" }}>{group.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "9px", lineHeight: "1.42", marginBottom: "4px" }}>{item}</li>)}</ul></div>)}</div>
    </div>
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "9px" }}><div><div style={{ color: C.navy, fontSize: "12px", fontWeight: 800 }}>Package Dependency Flow</div><div style={{ color: C.slate, fontSize: "10px", marginTop: "2px" }}>No Package 4 State Summary or Package 5 BTP Export dependency is shown because none is approved for Package 1.</div></div><CopyButton text={"Package 0 — Federal Provision Data, Lineage, and Prior-Year Readiness → Package 1 — Return-to-Provision Review → Package 2 — Deferred Rollforward\nPackage 1 — Return-to-Provision Review → Package 3 — Federal Summary"} label="Copy flow" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 1fr 28px 1fr", alignItems: "center", gap: "6px" }}><div style={{ border: "1px solid #bfdbfe", backgroundColor: "#eff6ff", borderRadius: "7px", padding: "9px" }}><strong style={{ color: "#1d4ed8", fontSize: "10px" }}>Package 0</strong><div style={{ color: "#1e3a5f", fontSize: "9px", marginTop: "3px" }}>Federal Provision Data, Lineage, and Prior-Year Readiness</div><div style={{ color: "#1d4ed8", fontSize: "9px", marginTop: "5px", fontWeight: 750 }}>Provides PY values and entity context</div></div><span style={{ textAlign: "center", color: "#64748b", fontWeight: 800 }}>→</span><div style={{ border: `2px solid ${C.purple}`, backgroundColor: "#faf5ff", borderRadius: "7px", padding: "9px" }}><strong style={{ color: C.purple, fontSize: "10px" }}>Package 1</strong><div style={{ color: "#581c87", fontSize: "9px", marginTop: "3px" }}>Return-to-Provision Review</div><div style={{ color: C.purple, fontSize: "9px", marginTop: "5px", fontWeight: 750 }}>Governed RTP comparison and true-up result</div></div><span style={{ textAlign: "center", color: "#64748b", fontWeight: 800 }}>→</span><div style={{ border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", borderRadius: "7px", padding: "9px" }}><strong style={{ color: C.green, fontSize: "10px" }}>Package 2</strong><div style={{ color: "#166534", fontSize: "9px", marginTop: "3px" }}>Deferred Rollforward</div><div style={{ color: C.green, fontSize: "9px", marginTop: "5px", fontWeight: 750 }}>Applicable Temporary Difference RTP true-up results</div></div></div>
      <div style={{ marginTop: "8px", marginLeft: "35%", border: "1px solid #fde68a", backgroundColor: "#fffbeb", borderRadius: "7px", padding: "8px", width: "240px" }}><strong style={{ color: C.amber, fontSize: "10px" }}>Package 3 — Federal Summary</strong><div style={{ color: "#78350f", fontSize: "9px", marginTop: "3px" }}>Consumes RTP results needed by Federal Summary.</div></div>
    </div>
  </div>;
}

function WorkstreamReadinessHub({ active, onChange }: { active: "state" | "provision"; onChange: (workstream: "state" | "provision") => void }) {
  const isState = active === "state";
  const stories = isState ? STATE_STORIES : PROVISION_STORIES;
  const color = isState ? C.teal : C.purple;
  const workstream = isState ? "State" : "Provision";
  const overview = isState ? "State Filing Footprint discovery for Feature 1451927. The business team defines the filing behavior, lifecycle, data meanings, and exception outcomes before DCT acceptance." : "Package 1 Return-to-Provision Review compares prior-year Provision amounts with the prior-year filed Tax Return by Description and entity. RTP Difference = PY Tax Return − PY Provision, and each difference carries into the current-year provision true-up.";
  const boundary = isState ? "DCT provides backend implementation and governed records. State defines business behavior; Roger owns practitioner interaction. State does not prescribe DCT endpoints, database tables, DTOs, persistence patterns, or Gateway implementation." : "The Tax Provision Business Team owns provision-computation rules, data governance, validation, policies, and business processes. DCT provides governed inputs, calculations, persistence, and access only after those rules are defined.";
  const risks = isState ? ["Starting-context, save / approve / lock, and incomplete-filing behavior require business definitions.", "Saved-state meaning and Roger audit-history presentation need an explicit decision."] : ["PY correction semantics are a major unresolved accounting decision.", "Package 2 / Package 3 routing needs detailed business rules before downstream acceptance."];
  const decisionItems = isState ? ["Decide working versus approved data exposure.", "Decide State filing-footprint lifecycle and change-after-lock behavior."] : ["Decide whether a correction changes source values or creates an override.", "Decide routing for Permanent / Temporary, payable, and deferred outputs."];
  return <section id="story-readiness" style={{ marginBottom: "48px" }}><SectionHeading number="B" title="State & Provision Story Readiness" subtitle="A consistent discovery structure that separates business ownership from DCT implementation responsibility." />
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}><button type="button" onClick={() => onChange("state")} style={{ border: `1px solid ${isState ? C.teal : "#cbd5e1"}`, backgroundColor: isState ? C.teal : "#ffffff", color: isState ? "#ffffff" : C.slate, fontWeight: 800, borderRadius: "6px", padding: "8px 14px", cursor: "pointer" }}>State Discovery</button><button type="button" onClick={() => onChange("provision")} style={{ border: `1px solid ${!isState ? C.purple : "#cbd5e1"}`, backgroundColor: !isState ? C.purple : "#ffffff", color: !isState ? "#ffffff" : C.slate, fontWeight: 800, borderRadius: "6px", padding: "8px 14px", cursor: "pointer" }}>Provision Discovery</button></div>
    <div style={{ backgroundColor: `${color}0d`, border: `1px solid ${color}40`, borderLeft: `5px solid ${color}`, borderRadius: "10px", padding: "16px 18px", marginBottom: "16px" }}><div style={{ color, fontSize: "10px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "5px" }}>{workstream} overview</div><p style={{ color: "#334155", fontSize: "13px", lineHeight: "1.55", margin: 0 }}>{overview}</p></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}><div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "15px" }}><div style={{ color, fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>Business Ownership</div><p style={{ color: "#334155", margin: 0, fontSize: "12px", lineHeight: "1.55" }}>{isState ? "State Business Team owns WHAT and WHY: State requirements, rules, data meaning, validation, and practitioner outcomes." : "Provision Workstream owns WHAT and WHY: Package 1 requirements, calculation rules, accounting / tax policies, data governance, and expected outcomes."}</p></div><div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "15px" }}><div style={{ color: C.blue, fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>DCT Ownership Boundary</div><p style={{ color: "#334155", margin: 0, fontSize: "12px", lineHeight: "1.55" }}>{boundary}</p></div></div>
    {!isState && <ProvisionPackageOneDetail />}
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "15px", marginBottom: "16px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}><div><div style={{ color: C.navy, fontWeight: 800, fontSize: "12px" }}>Current Features / Stories</div><div style={{ color: C.slate, fontSize: "10px", marginTop: "2px" }}>Select a story below to review scope, questions, dependencies, capability assessment, and readiness.</div></div><CopyButton text={stories.map(story => `${story.id}\n${story.scope}`).join("\n\n")} label="Copy stories" /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>{stories.map(story => <div key={story.id} style={{ border: `1px solid ${STATUS_STYLE[story.acceptance].border}`, borderRadius: "8px", padding: "12px", backgroundColor: "#ffffff" }}><div style={{ color: C.navy, fontSize: "11px", fontWeight: 800, lineHeight: "1.45", marginBottom: "6px" }}>{story.id}</div><p style={{ color: "#475569", fontSize: "11px", lineHeight: "1.45", margin: "0 0 8px" }}>{story.scope}</p><div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}><ReadinessBadge status={story.estimation} /><ReadinessBadge status={story.acceptance} /></div></div>)}</div></div>
    {!isState && <div style={{ backgroundColor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "9px", padding: "12px 14px", marginBottom: "16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "6px" }}><div style={{ color: "#9a3412", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em" }}>Primary Provision refinement prompts</div><CopyButton text={Object.entries(PROVISION_PRIMARY_QUESTIONS).map(([id, prompt]) => `${id}: ${prompt}`).join("\n\n")} label="Copy prompts" /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "8px" }}>{Object.entries(PROVISION_PRIMARY_QUESTIONS).map(([id, prompt]) => <div key={id} style={{ backgroundColor: "#ffffff", border: "1px solid #fed7aa", borderRadius: "6px", padding: "8px" }}><div style={{ color: "#9a3412", fontSize: "10px", fontWeight: 800, marginBottom: "3px" }}>{id}</div><div style={{ color: "#7c2d12", fontSize: "10px", lineHeight: "1.45" }}>{prompt}</div></div>)}</div></div>}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "16px" }}><div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Dependencies</div><p style={{ color: "#1e3a5f", fontSize: "11px", margin: 0, lineHeight: "1.5" }}>{isState ? "State business definitions, Roger requirements, B16 audit / lineage, and governed Gateway access must be sequenced explicitly." : "Package 1 inputs and calculation rules precede correction handling; Package 2 and Package 3 contracts define downstream readiness."}</p></div><div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px" }}><div style={{ color: C.green, fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Existing DCT Capabilities</div><p style={{ color: "#166534", fontSize: "11px", margin: 0, lineHeight: "1.5" }}>PDC governed source financial data; TDC tax-domain records and persistence; Gateway consumer access; Orchestrator coordination; existing audit / lineage capabilities.</p></div><div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px" }}><div style={{ color: "#92400e", fontWeight: 800, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>Risks / Assumptions & Decision Log</div><ul style={{ margin: "0 0 7px", paddingLeft: "15px" }}>{risks.map(risk => <li key={risk} style={{ color: "#78350f", fontSize: "10px", lineHeight: "1.45", marginBottom: "4px" }}>{risk}</li>)}</ul><div style={{ color: "#78350f", fontSize: "10px", fontWeight: 750 }}>Business clarification required: {decisionItems.join(" ")}</div></div></div>
    <div style={{ marginBottom: "16px" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "8px" }}><div><div style={{ color: C.navy, fontSize: "12px", fontWeight: 800 }}>Reusable Refinement Question Framework</div><div style={{ color: C.slate, fontSize: "10px", marginTop: "2px" }}>Use the same questions for State and Provision before DCT refinement.</div></div><CopyButton text={REFINEMENT_CHECKLISTS.map(checklist => `${checklist.title}\n${checklist.items.join("\n")}`).join("\n\n")} label="Copy checklist" /></div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>{REFINEMENT_CHECKLISTS.map(checklist => <div key={checklist.title} style={{ border: `1px solid ${checklist.color}40`, borderTop: `4px solid ${checklist.color}`, borderRadius: "8px", padding: "12px", backgroundColor: "#ffffff" }}><div style={{ color: checklist.color, fontSize: "11px", fontWeight: 800, marginBottom: "7px" }}>{checklist.title}</div><ul style={{ margin: 0, paddingLeft: "15px" }}>{checklist.items.map(item => <li key={item} style={{ color: "#334155", fontSize: "10px", lineHeight: "1.45", marginBottom: "5px" }}>{item}</li>)}</ul></div>)}</div></div>
    <StoryMatrix stories={stories} />
  </section>;
}

// ─── PI 4 State delivery readiness ───────────────────────────────────────────
const PI4_TIMELINE_ROWS = [
  { label: "State filing / reporting metadata & source ingestion readiness", start: 1, end: 2, color: C.teal },
  { label: "Automated ingestions / Apportionment + Payments", start: 1, end: 2, color: "#0284c7" },
  { label: "Apportionment calculations", start: 2, end: 3, color: C.blue },
  { label: "GoSystem Mapping / Taxonomy TDC mapping", start: 2, end: 4, color: C.purple },
  { label: "State IT/Liability + Provision output", start: 3, end: 4, color: "#0f766e" },
  { label: "Go Transformation / Routing", start: 4, end: 5, color: C.green },
  { label: "Attributes tracking / Roll-forward", start: 5, end: 5, color: C.amber },
] as const;

const PI4_VALIDATION_WINDOWS = [
  { label: "E2E QA", date: "Nov 3–10", color: "#2563eb" },
  { label: "Field UAT", date: "Nov 11–20", color: "#7c3aed" },
  { label: "UAT Updates", date: "Nov 23–Dec 2", color: "#b45309" },
  { label: "UAT Retest", date: "Dec 3–8", color: "#047857" },
] as const;

const STATE_STORY_READINESS = [
  "State stories must be sized for delivery within one to two sprints.",
  "A BRD and acceptance criteria alone are not sufficient for DCT handoff.",
  "Detailed requirements must be written directly in the story so Development can build and QA can test without inference.",
  "Where a prototype exists, document the expected workflow, validations, statuses, system responses, error handling, and outcomes.",
  "State must provide the required detail before a story is refinement-ready; DCT should not determine missing requirements after handoff.",
  "Prefer multiple smaller stories to improve estimation, delivery, testing, and defect reduction.",
] as const;

const STATE_SIZING_ROWS = [
  {
    story: "1464551 – Land and validate the State source submission in PDC",
    scope: "Ingest State source data into PDC, validate the submission, and handle validation outcomes/errors. Includes Orchestrator triggering, sequencing, payload handling, and error behavior.",
    size: "Medium",
    assessment: "Likely yes, if source contracts, validation rules, and orchestration requirements are already defined.",
  },
  {
    story: "1464587 – Persist the versioned State Dataset and validation outcomes",
    scope: "Persist the State Dataset, maintain version history, and store associated validation results/outcomes.",
    size: "Medium–Large",
    assessment: "Possibly, but versioning and validation persistence must be clearly defined before committing.",
  },
  {
    story: "1464691 – Govern the approved State Filing Footprint and expose status to Roger",
    scope: "Manage Filing Footprint approval/governance, maintain approved state, and expose status to Roger.",
    size: "Large",
    assessment: "Higher risk for one sprint because it combines governance, persistence, and downstream Roger integration. Review for decomposition.",
  },
  {
    story: "1464780 – Persist the versioned Apportionment Context, results, approvals, and governed access",
    scope: "Persist Apportionment Context and factor results; support overrides, versions, approvals, immutability, approved-result access, B16 lineage, and stale-result detection.",
    size: "Very Large / Epic-like",
    assessment: "No, not as currently written. Decompose into smaller sprint-ready stories before estimating and committing.",
  },
] as const;

function PI4StateReadiness() {
  return (
    <section id="pi4-state-readiness" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="PI4"
        title="State Delivery Readiness"
        subtitle="Planning view to reduce ambiguity before development begins and preserve testable delivery across PI 4 sprint windows."
      />

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "12px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}>
        <div style={{ backgroundColor: C.teal, padding: "15px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#e0f2fe", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "4px" }}>PI 4 planning timeline</div>
          <div style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff" }}>State delivery path and validation windows</div>
        </div>
        <div style={{ padding: "18px 20px 20px", overflowX: "auto" }}>
          <div style={{ minWidth: "560px", display: "grid", gridTemplateColumns: "180px repeat(5, minmax(54px, 1fr))", gridTemplateRows: `32px repeat(${PI4_TIMELINE_ROWS.length}, 34px)`, columnGap: "6px", rowGap: "6px", alignItems: "center" }}>
            <div style={{ gridColumn: 1, gridRow: 1, fontSize: "10px", fontWeight: 800, color: C.slate, letterSpacing: "0.08em", textTransform: "uppercase" }}>Workstream</div>
            {[1, 2, 3, 4, 5].map(sprint => (
              <div key={sprint} style={{ gridColumn: sprint + 1, gridRow: 1, textAlign: "center", fontSize: "11px", fontWeight: 800, color: C.navy, backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "6px 4px" }}>S{ sprint }</div>
            ))}
            {PI4_TIMELINE_ROWS.map((row, index) => {
              const gridRow = index + 2;
              return (
                <div key={row.label} style={{ display: "contents" }}>
                  <div style={{ gridColumn: 1, gridRow, paddingRight: "8px", fontSize: "11px", color: "#334155", fontWeight: index >= 7 ? 700 : 600, lineHeight: "1.25" }}>{row.label}</div>
                  <div style={{ gridColumn: `${row.start + 1} / ${row.end + 2}`, gridRow, minHeight: "28px", borderRadius: "5px", backgroundColor: `${row.color}16`, border: `1px solid ${row.color}55`, borderLeft: `4px solid ${row.color}`, display: "flex", alignItems: "center", padding: "0 9px", fontSize: "10px", fontWeight: 800, color: row.color }}>
                    {row.start === row.end ? "Scheduled" : `S${row.start}–S${row.end}`}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", marginTop: "16px" }}>
            {PI4_VALIDATION_WINDOWS.map(window => (
              <div key={window.label} style={{ border: `1px solid ${window.color}40`, borderTop: `3px solid ${window.color}`, borderRadius: "6px", backgroundColor: "#ffffff", padding: "8px 9px" }}>
                <div style={{ fontSize: "10px", color: C.slate, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{window.label}</div>
                <div style={{ fontSize: "12px", color: window.color, fontWeight: 800 }}>{window.date}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px", display: "flex", alignItems: "flex-start", gap: "9px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 12px" }}>
            <span style={{ color: C.amber, fontSize: "14px", lineHeight: 1 }}>!</span>
            <p style={{ fontSize: "12px", color: "#78350f", margin: 0, lineHeight: "1.5" }}><strong>Release-timing note:</strong> S5 is outside the main UAT cycle and may need to shift slightly to allow sufficient time for the TR push and UAT completion.</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "20px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #c7d2fe", borderRadius: "10px", padding: "18px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: C.blue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>State Story Readiness for PI 4</div>
          <p style={{ fontSize: "13px", color: "#334155", margin: "0 0 12px", lineHeight: "1.55" }}>State work is refinement-ready when the intended behavior is clear enough for Development to build and QA to test without guesswork.</p>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {STATE_STORY_READINESS.map(item => <li key={item} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", marginBottom: "7px" }}>{item}</li>)}
          </ul>
        </div>
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "18px 20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "9px" }}>Delivery objective</div>
          <p style={{ fontSize: "15px", color: "#065f46", margin: "0 0 16px", fontWeight: 750, lineHeight: "1.45" }}>Provide enough front-end detail to minimize defects, make work testable by QA, and support delivery within planned PI 4 sprint windows.</p>
          <div style={{ borderTop: "1px solid #bbf7d0", paddingTop: "12px" }}>
            {[
              "Detailed behavior and validation rules are captured before handoff.",
              "Prototype evidence is used where available to document expected outcomes.",
              "Story scope is split before estimating when it exceeds one to two sprints.",
            ].map(item => <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", color: "#166534", lineHeight: "1.5", marginBottom: "8px" }}><span style={{ fontWeight: 800 }}>✓</span><span>{item}</span></div>)}
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}>
        <div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Current State Story Sizing Assessment</div>
          <p style={{ fontSize: "12px", color: C.slate, margin: 0, lineHeight: "1.5" }}>Sizing assessment for refinement; it is not a delivery commitment.</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "950px", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ backgroundColor: C.navy }}>
                {[
                  { label: "Story", width: "25%" },
                  { label: "Scope", width: "39%" },
                  { label: "Relative Size", width: "14%" },
                  { label: "1-Sprint Assessment", width: "22%" },
                ].map(column => <th key={column.label} style={{ width: column.width, padding: "11px 14px", textAlign: "left", color: "#ffffff", fontWeight: 750, fontSize: "11px" }}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {STATE_SIZING_ROWS.map((row, index) => (
                <tr key={row.story} style={{ backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "12px 14px", verticalAlign: "top", color: C.navy, fontWeight: 750, lineHeight: "1.45" }}>{row.story}</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top", color: "#334155", lineHeight: "1.5" }}>{row.scope}</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top", color: row.size.includes("Very Large") ? "#b91c1c" : row.size === "Large" ? C.amber : C.blue, fontWeight: 800, lineHeight: "1.45" }}>{row.size}</td>
                  <td style={{ padding: "12px 14px", verticalAlign: "top", color: "#334155", lineHeight: "1.5" }}>{row.assessment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px", marginBottom: "24px" }}>
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Cross-Team Dependencies · Orchestration</div>
          <p style={{ fontSize: "12px", color: "#1e3a5f", margin: "0 0 9px", lineHeight: "1.5" }}>State ingestion requires Orchestrator work. Applicable stories must define:</p>
          <ul style={{ margin: 0, paddingLeft: "17px" }}>{["Trigger behavior", "Processing sequence", "Payload requirements", "Validation handoffs", "Retry behavior", "Error handling", "PDC/DCT handoff and expected responses"].map(item => <li key={item} style={{ fontSize: "11px", color: "#1e3a5f", lineHeight: "1.5" }}>{item}</li>)}</ul>
        </div>
        <div style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: C.teal, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Cross-Team Dependencies · Roger UI</div>
          <p style={{ fontSize: "12px", color: "#164e63", margin: 0, lineHeight: "1.55" }}>Roger has significant 1120-specific hard coding. State-specific configuration, attributes, statuses, mappings, and behavior should be stored and governed in the database/configuration layer so Roger can consume them dynamically. Identify Roger UI changes and dependencies directly in each State story.</p>
        </div>
        <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: C.purple, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Cross-Team Dependencies · Provision</div>
          <p style={{ fontSize: "12px", color: "#581c87", margin: 0, lineHeight: "1.55" }}>Apply the same readiness standard: detailed requirements in the story, QA-testable behavior, and identified DCT, Roger, PDC, and Orchestrator dependencies. Provision work should also be sized for one to two sprints where possible.</p>
        </div>
      </div>

      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>PI 4 High-Level Scope</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["User feedback", "Bugs", "Backlog work not completed in PI 1–3", ".NET 10 migration", "Penetration Testing", "State", "Provision", "PDC XLOB", "ARB feedback work"].map(item => (
            <span key={item} style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "999px", padding: "5px 10px", color: "#334155", fontSize: "12px", fontWeight: 650 }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProvisionDeliveryReadiness() {
  const timeline = [
    { label: "Package 0 source, lineage, and prior-year readiness", start: 1, end: 2, color: C.blue },
    { label: "P1 source values, Description mapping, and entity context", start: 1, end: 2, color: C.purple },
    { label: "RTP calculation, entity roll-up, and section behavior", start: 2, end: 3, color: "#7c3aed" },
    { label: "Correction semantics, audit, and recalculation behavior", start: 3, end: 4, color: C.amber },
    { label: "Package 2 / Package 3 downstream output contracts", start: 4, end: 5, color: C.green },
  ] as const;
  const readinessGates = ["Authoritative PY Provision and PY Tax Return source mappings are confirmed.", "RTP calculation, aggregation, unmatched-item, and classification-exception behavior is defined.", "The business meaning of a practitioner correction is resolved before persistence design and estimation.", "Package 2 / Package 3 payload, routing, and consumption rules are defined.", "QA can validate positive, negative, exception, and recalculation outcomes without a new Provision decision."];
  return <section id="pi4-provision-readiness" style={{ marginBottom: "48px" }}>
    <SectionHeading number="PI4" title="Provision Delivery Readiness" subtitle="Package 1 planning view for Return-to-Provision readiness, refinement gates, and dependency sequencing." />
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e9d5ff", borderRadius: "12px", overflow: "hidden", marginBottom: "24px", boxShadow: "0 1px 4px rgba(15,23,42,0.05)" }}><div style={{ backgroundColor: C.purple, padding: "15px 20px" }}><div style={{ fontSize: "11px", fontWeight: 800, color: "#f3e8ff", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "4px" }}>PI 4 planning timeline</div><div style={{ fontSize: "17px", fontWeight: 800, color: "#ffffff" }}>Provision delivery path and readiness gates</div></div><div style={{ padding: "18px 20px 20px", overflowX: "auto" }}><div style={{ minWidth: "560px", display: "grid", gridTemplateColumns: "220px repeat(5, minmax(54px, 1fr))", gridTemplateRows: `32px repeat(${timeline.length}, 34px)`, columnGap: "6px", rowGap: "6px", alignItems: "center" }}><div style={{ gridColumn: 1, gridRow: 1, fontSize: "10px", fontWeight: 800, color: C.slate, letterSpacing: "0.08em", textTransform: "uppercase" }}>Provision workstream</div>{[1, 2, 3, 4, 5].map(sprint => <div key={sprint} style={{ gridColumn: sprint + 1, gridRow: 1, textAlign: "center", fontSize: "11px", fontWeight: 800, color: C.navy, backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "5px", padding: "6px 4px" }}>S{sprint}</div>)}{timeline.map((row, index) => <div key={row.label} style={{ display: "contents" }}><div style={{ gridColumn: 1, gridRow: index + 2, paddingRight: "8px", fontSize: "11px", color: "#334155", fontWeight: 600, lineHeight: "1.25" }}>{row.label}</div><div style={{ gridColumn: `${row.start + 1} / ${row.end + 2}`, gridRow: index + 2, minHeight: "28px", borderRadius: "5px", backgroundColor: `${row.color}16`, border: `1px solid ${row.color}55`, borderLeft: `4px solid ${row.color}`, display: "flex", alignItems: "center", padding: "0 9px", fontSize: "10px", fontWeight: 800, color: row.color }}>{`S${row.start}–S${row.end}`}</div></div>)}</div><div style={{ marginTop: "15px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 12px", color: "#78350f", fontSize: "12px", lineHeight: "1.5" }}><strong>Planning note:</strong> This is a readiness path, not an approved delivery-date commitment. Confirm sprint dates after Provision business decisions and downstream contracts are ready.</div></div></div>
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "20px", marginBottom: "24px" }}><div style={{ backgroundColor: "#ffffff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "18px 20px" }}><div style={{ fontSize: "11px", fontWeight: 800, color: C.purple, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "7px" }}>Provision story readiness for Package 1</div><p style={{ fontSize: "13px", color: "#334155", margin: "0 0 12px", lineHeight: "1.55" }}>Provision work is refinement-ready only when expected accounting and tax behavior is specific enough for Development to build and QA to test without assuming a missing business rule.</p><ul style={{ margin: 0, paddingLeft: "18px" }}>{readinessGates.map(item => <li key={item} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", marginBottom: "7px" }}>{item}</li>)}</ul></div><div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "18px 20px" }}><div style={{ fontSize: "11px", fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "9px" }}>Delivery objective</div><p style={{ fontSize: "15px", color: "#065f46", margin: "0 0 16px", fontWeight: 750, lineHeight: "1.45" }}>Deliver a governed, testable Return-to-Provision dataset and true-up result without recreating business calculations in downstream workflows.</p><div style={{ borderTop: "1px solid #bbf7d0", paddingTop: "12px" }}>{["Use Package 0 source and lineage evidence before Package 1 implementation.", "Reuse DCT persistence, Gateway access, and audit / lineage capabilities where applicable.", "Decompose or defer scope when a story includes unresolved business policy or a cross-package contract."].map(item => <div key={item} style={{ display: "flex", gap: "8px", alignItems: "flex-start", fontSize: "12px", color: "#166534", lineHeight: "1.5", marginBottom: "8px" }}><span style={{ fontWeight: 800 }}>✓</span><span>{item}</span></div>)}</div></div></div>
    <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "24px" }}><div style={{ padding: "15px 20px", borderBottom: "1px solid #e2e8f0" }}><div style={{ fontSize: "11px", fontWeight: 800, color: C.navy, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Current Provision Story Sizing & Estimation Assessment</div><p style={{ fontSize: "12px", color: C.slate, margin: 0, lineHeight: "1.5" }}>Sizing assessment for refinement; no relative size is assigned until the stated business gaps are resolved.</p></div><div style={{ overflowX: "auto" }}><table style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse", fontSize: "12px" }}><thead><tr style={{ backgroundColor: C.navy }}>{["Story", "Scope", "Estimation Status", "Readiness Assessment"].map(label => <th key={label} style={{ padding: "11px 14px", textAlign: "left", color: "#ffffff", fontWeight: 750, fontSize: "11px" }}>{label}</th>)}</tr></thead><tbody>{PROVISION_STORIES.map((story, index) => <tr key={story.id} style={{ backgroundColor: index % 2 === 0 ? "#f8fafc" : "#ffffff", borderBottom: "1px solid #e2e8f0" }}><td style={{ padding: "12px 14px", verticalAlign: "top", color: C.navy, fontWeight: 750, lineHeight: "1.45" }}>{story.id}</td><td style={{ padding: "12px 14px", verticalAlign: "top", color: "#334155", lineHeight: "1.5" }}>{story.scope}</td><td style={{ padding: "12px 14px", verticalAlign: "top" }}><ReadinessBadge status={story.estimation} /></td><td style={{ padding: "12px 14px", verticalAlign: "top", color: "#334155", lineHeight: "1.5" }}>{story.reason}</td></tr>)}</tbody></table></div></div>
  </section>;
}

// ─── SECTION 1: Workstream Overview ──────────────────────────────────────────
function WorkstreamOverview() {
  return (
    <section id="s1" style={{ marginBottom: "48px" }}>
      <SectionHeading number="1" title="Workstream Overview" subtitle="Understand the State and Provision workstreams before reviewing DCT capabilities." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* STATE */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: C.teal, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>🗺️</span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>State Workstream</div>
                <div style={{ fontSize: "11px", color: "#bae6fd" }}>State Income Tax Compliance & Reporting</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 20px" }}>
            {[
              { label: "What is it?", text: "The State workstream manages state income tax compliance and reporting across all jurisdictions where RSM clients operate. It ensures that state-specific tax data is accurately computed, classified, and delivered to practitioners and downstream systems." },
              { label: "Business Objectives", text: "Ensure accurate state tax data is available for practitioner review, state return preparation, and regulatory compliance. Reduce manual effort in state apportionment and classification." },
              { label: "Primary Business Functions", items: ["Apply state tax rules and classifications", "Compute state apportionment factors", "Prepare state tax returns and disclosures", "Ensure compliance with state regulations", "Provide complete audit trail for regulatory review"] },
              { label: "Downstream Consumers", items: ["Roger (practitioner review)", "IMS (routes governed data to return engines)", "State filing teams", "Regulatory reporting"] },
              { label: "Business Outcomes", text: "Accurate, auditable state tax data available through governed APIs. Reduced manual intervention in state compliance workflows." },
            ].map(({ label, text, items }) => (
              <div key={label} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.teal, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
                {text && <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{text}</p>}
                {items && <ul style={{ margin: "0", paddingLeft: "16px" }}>{items.map(i => <li key={i} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{i}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>

        {/* PROVISION */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: C.purple, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "22px" }}>📊</span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>Provision Workstream</div>
                <div style={{ fontSize: "11px", color: "#e9d5ff" }}>Tax Provision Computation & Reporting</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "18px 20px" }}>
            {[
              { label: "What is it?", text: "The Provision workstream manages tax provision computation and financial reporting. It computes current and deferred tax positions, prepares provision schedules, and delivers structured outputs to practitioners and financial reporting systems. Governed provision data is handed off to IMS, which routes it to the appropriate return engine." },
              { label: "Business Objectives", text: "Deliver accurate, auditable tax provision data for financial reporting. Support interim and annual provision cycles. Ensure traceability from source financial data to final provision output." },
              { label: "Primary Business Functions", items: ["Compute current and deferred tax positions", "Manage uncertain tax positions and reserves", "Prepare provision schedules and workpapers", "Support financial statement reporting", "Require accurate, traceable data and supporting evidence"] },
              { label: "Downstream Consumers", items: ["Roger (provision review)", "IMS (routes governed provision data to return engines)", "Provision teams", "Financial reporting and audit"] },
              { label: "Business Outcomes", text: "Structured, governed provision schedules and workpapers delivered through DCT APIs. Full lineage from ERP source data to final provision output." },
            ].map(({ label, text, items }) => (
              <div key={label} style={{ marginBottom: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{label}</div>
                {text && <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{text}</p>}
                {items && <ul style={{ margin: "0", paddingLeft: "16px" }}>{items.map(i => <li key={i} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{i}</li>)}</ul>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 2: Responsibility Matrix ────────────────────────────────────────
const RESP_ROWS = [
  { row: "Business Rules",  state: "State tax rules, apportionment formulas", provision: "Provision computation rules, deferred tax logic", dct: "TDC owns all tax rule execution", roger: "Displays rule outputs (read-only)", ims: "Routes governed outputs to return engines" },
  { row: "Data Ownership",  state: "State-scoped tax data", provision: "Provision-scoped financial data", dct: "PDC owns source financial records; TDC owns tax records", roger: "No data ownership — read-only consumer", ims: "No data ownership — integration broker only" },
  { row: "User Experience", state: "State practitioners via Roger", provision: "Provision practitioners via Roger", dct: "No direct UX — API provider", roger: "Primary practitioner interface", ims: "No direct UX — engine routing layer" },
  { row: "Persistence",     state: "TDC persists state decisions", provision: "TDC persists provision schedules", dct: "TDC is system of record for all tax decisions", roger: "Does NOT persist data", ims: "Does NOT persist tax data — broker only" },
  { row: "Audit",           state: "Full audit trail via Batch 16", provision: "Full audit trail via Batch 16", dct: "TDC maintains immutable audit records", roger: "Displays audit trail (read-only)", ims: "Receives audit exports for delivery" },
  { row: "Reporting",       state: "State return data via Gateway (B9A)", provision: "Provision schedule data via Gateway (B9A)", dct: "Provides governed API access via B9A", roger: "Renders reports for practitioners", ims: "Routes governed data to return engines for filing" },
  { row: "Tax Returns",     state: "State returns prepared by practitioners", provision: "Not applicable (provision ≠ filing)", dct: "Provides data; does not file", roger: "Supports review before filing", ims: "Routes to GoSystem / CCH / OIT for return execution" },
  { row: "APIs",            state: "Consumes B9A Gateway APIs", provision: "Consumes B9A Gateway APIs", dct: "Publishes all APIs via B9A Gateway", roger: "Calls TDC read APIs via Gateway", ims: "Inbound retrieval, outbound delivery, engine lookup APIs" },
  { row: "Workpapers",      state: "State workpapers via Batch 28", provision: "Provision workpapers via Batch 28", dct: "Batch 28 generates structured workpapers", roger: "Displays workpapers for review", ims: "Receives workpaper payload for engine delivery" },
  { row: "Lineage",         state: "Full lineage via Batch 16", provision: "Full lineage via Batch 16", dct: "TDC enforces lineage closure (G4)", roger: "Displays lineage (read-only)", ims: "Receives lineage evidence with payload" },
];

function ResponsibilityMatrix() {
  const cols = [
    { key: "state",     label: "State",     color: C.teal },
    { key: "provision", label: "Provision", color: C.purple },
    { key: "dct",       label: "DCT / TDC", color: C.blue },
    { key: "roger",     label: "Roger",     color: "#0891b2" },
    { key: "ims",       label: "IMS",       color: C.rose },
  ];

  return (
    <section id="s2" style={{ marginBottom: "48px" }}>
      <SectionHeading number="2" title="Workstream Responsibilities" subtitle="Who owns what across State, Provision, DCT, Roger, and IMS (Integration & Management System)." />
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "110px" }}>Responsibility</th>
              {cols.map(c => (
                <th key={c.key} style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "160px" }}>
                  <span style={{ display: "inline-block", backgroundColor: c.color, borderRadius: "4px", padding: "2px 8px", fontSize: "11px" }}>{c.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RESP_ROWS.map((r, i) => (
              <tr key={r.row} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: C.navy, verticalAlign: "top" }}>{r.row}</td>
                {cols.map(c => (
                  <td key={c.key} style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top", lineHeight: "1.5" }}>
                    {r[c.key as keyof typeof r]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ─── NEW SECTION 3: Discovery Workflow ──────────────────────────────────────
const WORKFLOW_STEPS = [
  {
    number: "1",
    title: "Define the Business Need",
    icon: "🎯",
    color: "#0369a1",
    purpose: "Describe the business capability from the practitioner's perspective.",
    guidance: "Start by clearly articulating what the business needs to accomplish — not how the platform should implement it. Focus on the practitioner's goal.",
    examples: [
      "State Apportionment",
      "State Taxable Income",
      "State Adjustments",
      "Provision Schedules",
      "Workpapers",
      "Audit Evidence",
      "Lineage",
    ],
    note: null,
  },
  {
    number: "2",
    title: "Assess the Current State",
    icon: "🔍",
    color: "#065f46",
    purpose: "Understand how the business capability works today before defining future-state requirements.",
    guidance: "Discovery begins with evaluating the existing business process and platform capabilities. Do not define new requirements until you understand what already exists.",
    examples: [
      "Current business process",
      "Existing systems involved",
      "Current user workflow",
      "Existing platform capabilities",
      "Current pain points",
      "Existing data sources",
      "Existing integrations",
    ],
    note: "Current-state assessment should identify existing capabilities before proposing new functionality.",
  },
  {
    number: "3",
    title: "Review Existing DCT Capabilities",
    icon: "📋",
    color: "#1e3a5f",
    purpose: "Use this Discovery Center and Ask Buddy to determine whether DCT already supports the requested capability.",
    guidance: "Before documenting any requirement, verify whether DCT already delivers it. Check the Existing DCT Capabilities section and use Ask Buddy to search the knowledge base.",
    examples: [
      "Does DCT already support this capability?",
      "Which Batch delivers it?",
      "Which APIs already exist?",
      "Which data model already exists?",
      "Which business objects already support this capability?",
      "Can the capability be reused?",
      "Is this already on the roadmap?",
    ],
    note: "If an existing capability satisfies the business need, reference that capability rather than creating a new requirement.",
  },
  {
    number: "4",
    title: "Classify the Gap",
    icon: "⚖️",
    color: "#b45309",
    purpose: "Determine whether the business need is Covered, Partially Covered, or Net-New.",
    guidance: "Use the three-tier classification to determine the correct action. Only document requirements for the true gap — not for capabilities that already exist.",
    examples: [],
    note: null,
  },
  {
    number: "5",
    title: "Document Business Requirements",
    icon: "📝",
    color: "#7c3aed",
    purpose: "Only document requirements for the identified business gap.",
    guidance: "Requirements define WHAT the business needs. They do not include API design, database design, architecture, or implementation approach. DCT determines HOW the platform implements the solution.",
    examples: [
      "Business purpose",
      "User actions",
      "Functional behavior",
      "Business rules",
      "Validation rules",
      "Exception handling",
      "Expected outcomes",
    ],
    note: null,
  },
  {
    number: "6",
    title: "DCT Platform Assessment",
    icon: "🏗️",
    color: "#be185d",
    purpose: "Once business discovery is complete, DCT performs platform and technical assessment.",
    guidance: "DCT validates platform alignment using the completed business discovery artifacts. This step is DCT-owned and occurs after the BA has completed Steps 1–5.",
    examples: [
      "Platform Capability Assessment",
      "Technical Gap Analysis",
      "Architecture Assessment",
      "Technical Solution Assessment",
      "Implementation Planning",
    ],
    note: "DCT validates platform alignment using the completed business discovery artifacts.",
  },
];

const GAP_CLASSIFICATIONS = [
  {
    label: "Covered",
    color: "#059669",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    definition: "Existing DCT capability satisfies the business need.",
    action: "Reuse the capability.",
    icon: "✓",
  },
  {
    label: "Partially Covered",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    definition: "Existing capability requires enhancement.",
    action: "Document only the enhancement.",
    icon: "~",
  },
  {
    label: "Net-New",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    definition: "No existing platform capability exists.",
    action: "Document the new business requirement.",
    icon: "!",
  },
];

function DiscoveryWorkflowSection() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section id="s-workflow" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="↓"
        title="Discovery Workflow"
        subtitle="Follow this process before documenting new requirements or creating implementation work."
      />

      {/* Workflow step cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "28px" }}>
        {WORKFLOW_STEPS.map((step, idx) => (
          <div
            key={step.number}
            onClick={() => setActiveStep(activeStep === idx ? null : idx)}
            style={{
              backgroundColor: "white",
              border: `2px solid ${activeStep === idx ? step.color : "#e2e8f0"}`,
              borderRadius: "10px",
              padding: "16px 18px",
              cursor: "pointer",
              transition: "all 0.15s",
              borderLeft: `4px solid ${step.color}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "6px",
                backgroundColor: step.color, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 800, flexShrink: 0,
              }}>{step.number}</div>
              <span style={{ fontSize: "14px" }}>{step.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", lineHeight: "1.3" }}>{step.title}</span>
            </div>
            <p style={{ fontSize: "12px", color: "#475569", margin: 0, lineHeight: "1.5" }}>{step.purpose}</p>
            {activeStep === idx && (
              <div style={{ marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "12px" }}>
                <p style={{ fontSize: "12px", color: "#334155", margin: "0 0 10px", lineHeight: "1.6" }}>{step.guidance}</p>
                {step.examples.length > 0 && (
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ fontSize: "10px", fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
                      {step.number === "3" ? "Checklist" : step.number === "5" ? "Requirements Include" : step.number === "6" ? "DCT Performs" : "Examples"}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      {step.examples.map(e => (
                        <li key={e} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.6" }}>{e}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {step.note && (
                  <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "8px 12px" }}>
                    <p style={{ fontSize: "11px", color: "#065f46", margin: 0, lineHeight: "1.5" }}>💡 {step.note}</p>
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: "8px", fontSize: "10px", color: "#94a3b8", textAlign: "right" }}>
              {activeStep === idx ? "▲ collapse" : "▼ expand"}
            </div>
          </div>
        ))}
      </div>

      {/* Step 4 Gap Classification Table */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
        <div style={{ backgroundColor: "#b45309", padding: "12px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⚖️</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>Step 4 — Gap Classification</div>
              <div style={{ fontSize: "11px", color: "#fde68a" }}>Use this decision table to classify the gap before documenting requirements.</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0" }}>
          {GAP_CLASSIFICATIONS.map((g, i) => (
            <div key={g.label} style={{
              backgroundColor: g.bg,
              border: `1px solid ${g.border}`,
              borderTop: "none",
              borderLeft: i === 0 ? "none" : `1px solid ${g.border}`,
              padding: "18px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <div style={{
                  width: "26px", height: "26px", borderRadius: "50%",
                  backgroundColor: g.color, color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 800, flexShrink: 0,
                }}>{g.icon}</div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: g.color }}>{g.label}</span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Definition</div>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{g.definition}</p>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "3px" }}>Action</div>
                <p style={{ fontSize: "12px", color: "#334155", margin: 0, fontWeight: 600, lineHeight: "1.5" }}>{g.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 5 BA vs DCT ownership callout */}
      <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>📝 Step 5 — BA vs. DCT Ownership</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", marginBottom: "6px" }}>✅ Requirements INCLUDE</div>
            {["Business purpose", "User actions", "Functional behavior", "Business rules", "Validation rules", "Exception handling", "Expected outcomes"].map(i => (
              <div key={i} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.7" }}>• {i}</div>
            ))}
          </div>
          <div style={{ backgroundColor: "white", border: "1px solid #fecaca", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#dc2626", marginBottom: "6px" }}>🚫 Requirements do NOT include</div>
            {["API design", "Database design", "Architecture", "Implementation approach", "Technical solution"].map(i => (
              <div key={i} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.7" }}>• {i}</div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: "12px", backgroundColor: "#7c3aed", borderRadius: "8px", padding: "10px 16px" }}>
          <p style={{ fontSize: "13px", color: "white", margin: 0, fontWeight: 600, lineHeight: "1.5" }}>
            💡 The Business Analyst defines <strong>WHAT</strong> the business needs. DCT determines <strong>HOW</strong> the platform implements the solution.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 3: Existing DCT Capabilities ────────────────────────────────────
const BATCHES = [
  {
    id: "B9A",
    name: "Gateway & Governed Consumer Access Layer",
    color: C.b9a,
    icon: "🔐",
    businessPurpose: "Provides a secure, governed API gateway that controls how all downstream consumers (Roger, IMS, Provision, State) access TDC data. B9A is the single entry point for all data consumption outside TDC.",
    businessProblem: "Without a governed gateway, downstream systems would require direct database access to TDC, creating uncontrolled data exposure, no consumer scoping, and no audit trail for data access.",
    capabilities: [
      "Consumer-scoped API access — each consumer (Roger, IMS, State, Provision) receives only the data their profile allows",
      "Governed read-only access to all TDC financial and tax records",
      "Authentication and authorization for all downstream API calls",
      "Rate limiting, logging, and access audit trail",
      "Single versioned API contract for all consumers",
    ],
    scope: "Covers all downstream read access to TDC. Does NOT include write operations — all writes go directly to TDC.",
    businessObjects: ["ConsumerProfile", "AccessToken", "DataScope", "APIContract", "AuditLog"],
    apis: [
      "GET /api/v1/gateway/tax-profiles/{entityId}",
      "GET /api/v1/gateway/provision/schedules/{period}",
      "GET /api/v1/gateway/state/apportionment/{jurisdiction}",
      "GET /api/v1/gateway/workpapers/{entityId}",
      "GET /api/v1/gateway/audit-trail/{entityId}",
    ],
    dependencies: ["TDC (source of all data)", "B3 (Tax Domain Authority)", "B16 (Audit Trail)"],
    supportsState: "Provides State teams with governed API access to state apportionment data, state tax classifications, and state filing data. State consumers are scoped to state-relevant records only. IMS receives the governed state payload for routing to the appropriate return engine.",
    supportsProvision: "Provides Provision teams with governed API access to provision schedules, deferred tax data, and uncertain tax positions. Provision consumers are scoped to provision-relevant records only. IMS receives the governed provision payload for routing to the appropriate return engine.",
  },
  {
    id: "B16",
    name: "Audit Trail & Lineage Governance",
    color: C.b16,
    icon: "📋",
    businessPurpose: "Establishes a complete, immutable audit trail for all TDC decisions and data transformations. Ensures every tax decision can be traced from source financial data through to final output, supporting regulatory review and internal audit.",
    businessProblem: "Tax decisions require full traceability for regulatory compliance and audit readiness. Without a governed audit trail, practitioners cannot demonstrate how a tax position was reached, creating regulatory risk.",
    capabilities: [
      "Immutable audit records for every TDC decision (create, update, override)",
      "Full lineage chain from ERP source data through PDC normalization to TDC tax decision",
      "Decision history with timestamps, actor, and justification",
      "Lineage closure verification (G4 Gate requirement)",
      "Audit export for regulatory review and IMS delivery",
    ],
    scope: "Covers all TDC state changes and decisions. Lineage records are append-only and cannot be modified.",
    businessObjects: ["AuditRecord", "LineageChain", "DecisionHistory", "OverrideRecord", "LineageClosure"],
    apis: [
      "GET /api/v1/audit/decisions/{entityId}",
      "GET /api/v1/audit/lineage/{entityId}",
      "GET /api/v1/audit/history/{decisionId}",
      "POST /api/v1/audit/lineage-closure/{batchId}",
      "GET /api/v1/audit/export/{entityId}",
    ],
    dependencies: ["TDC (source of decisions)", "B3 (Tax Domain Authority)", "B9A (Gateway for audit access)"],
    supportsState: "Provides complete audit trail for all state tax decisions, including state apportionment computations, state classifications, and state override history. Supports regulatory review of state positions.",
    supportsProvision: "Provides complete audit trail for all provision decisions, including provision schedule computations, deferred tax adjustments, and uncertain tax position changes. Supports financial statement audit requirements.",
  },
  {
    id: "B28",
    name: "Provision Reference Data & BTP Outbound Contract",
    color: C.b28,
    icon: "📄",
    businessPurpose: "Batch 28 publishes TDC provision reference data to downstream consumers and hands off the BTPProvisionOutbound contract to BTP. It delivers classification reference data (DTAClassification, DTLClassification, ETRCategory, ValuationAllowanceCriterion) scoped by EntityTypeCode, plus DTA/DTL reconciliation, ETR recon, and return-to-provision data via the BTPProvisionOutbound contract.",
    businessProblem: "Downstream consumers and BTP need governed, structured provision reference data from TDC — specifically classification outputs and reconciliation data — delivered through a versioned contract. Without B28, there is no governed handoff of TDC provision reference data to BTP or downstream consumers.",
    capabilities: [
      "Publishes DTAClassification reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes DTLClassification reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes ETRCategory reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "Publishes ValuationAllowanceCriterion reference data (EntityTypeCode scoped, standard publish lifecycle)",
      "BTPProvisionOutbound contract: DTA/DTL reconciliation data to BTP",
      "BTPProvisionOutbound contract: ETR reconciliation data to BTP",
      "BTPProvisionOutbound contract: Return-to-provision data to BTP",
    ],
    scope: "B28 delivers TDC provision reference data and the BTPProvisionOutbound contract only. It does NOT perform provision computation, recognition/measurement rules, UTP analysis, period mismatch resolution, consolidation, acquisition accounting, or disclosure classification. The actual provision work is owned by the Provision team and BTP.",
    businessObjects: ["DTAClassification", "DTLClassification", "ETRCategory", "ValuationAllowanceCriterion", "BTPProvisionOutbound"],
    apis: [
      "GET /api/v1/provision/reference/dta-classification/{entityTypeCode}",
      "GET /api/v1/provision/reference/dtl-classification/{entityTypeCode}",
      "GET /api/v1/provision/reference/etr-category/{entityTypeCode}",
      "GET /api/v1/provision/reference/valuation-allowance/{entityTypeCode}",
      "POST /api/v1/provision/outbound/btp/{entityId}",
    ],
    dependencies: ["TDC (source of classification and reference data)", "B9A (Gateway for consumer access)", "B16 (Audit trail for reference data)", "B3 (Tax Domain Authority)"],
    supportsState: "B28 does not directly support state-specific provision computation. State provision requirements are handled by the State workstream using state apportionment data from B9A.",
    supportsProvision: "B28 provides TDC provision reference data (DTA/DTL classifications, ETR categories, valuation allowance criteria) and the BTPProvisionOutbound contract. It does NOT compute provision, apply recognition/measurement rules, or handle UTP, period mismatch, consolidation, acquisition accounting, or disclosure classification — those are Provision team and BTP responsibilities.",
  },
];

function CapabilityCard({ batch }: { batch: typeof BATCHES[0] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ backgroundColor: "white", border: `1px solid ${batch.color}30`, borderRadius: "12px", overflow: "hidden", marginBottom: "16px" }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 22px", background: "none", border: "none", cursor: "pointer",
          borderLeft: `4px solid ${batch.color}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span style={{ fontSize: "24px" }}>{batch.icon}</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, backgroundColor: batch.color, color: "white", borderRadius: "4px", padding: "2px 8px" }}>{batch.id}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: C.navy }}>{batch.name}</span>
            </div>
            <p style={{ fontSize: "12px", color: C.slate, margin: "3px 0 0", textAlign: "left" }}>{batch.businessPurpose.substring(0, 120)}...</p>
          </div>
        </div>
        <span style={{ fontSize: "18px", color: C.slate, flexShrink: 0, marginLeft: "12px" }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #f1f5f9" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "18px" }}>
            {/* Left column */}
            <div>
              {[
                { label: "Business Purpose", text: batch.businessPurpose },
                { label: "Business Problem Solved", text: batch.businessProblem },
                { label: "Scope", text: batch.scope },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{f.label}</div>
                  <p style={{ fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6" }}>{f.text}</p>
                </div>
              ))}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Capabilities</div>
                <ul style={{ margin: 0, paddingLeft: "16px" }}>
                  {batch.capabilities.map(c => <li key={c} style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>{c}</li>)}
                </ul>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Dependencies</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {batch.dependencies.map(d => (
                    <span key={d} style={{ fontSize: "11px", backgroundColor: "#f1f5f9", color: C.slate, borderRadius: "4px", padding: "2px 8px" }}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
            {/* Right column */}
            <div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Business Objects</div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {batch.businessObjects.map(o => (
                    <span key={o} style={{ fontSize: "11px", backgroundColor: `${batch.color}10`, color: batch.color, border: `1px solid ${batch.color}30`, borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>{o}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: batch.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>Related APIs</div>
                {batch.apis.map(a => (
                  <div key={a} style={{ fontSize: "11px", fontFamily: "monospace", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "4px 8px", marginBottom: "4px", color: "#0f172a" }}>{a}</div>
                ))}
              </div>
              <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px", marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>🗺️ Supports State by...</div>
                <p style={{ fontSize: "13px", color: "#166534", margin: 0, lineHeight: "1.6" }}>{batch.supportsState}</p>
              </div>
              <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>📊 Supports Provision by...</div>
                <p style={{ fontSize: "13px", color: "#5b21b6", margin: 0, lineHeight: "1.6" }}>{batch.supportsProvision}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExistingCapabilities() {
  return (
    <section id="s3" style={{ marginBottom: "48px" }}>
      <SectionHeading number="3" title="Existing DCT Capabilities" subtitle="Review what DCT already delivers before documenting new requirements. Click any batch to expand." />
      {BATCHES.map(b => <CapabilityCard key={b.id} batch={b} />)}
    </section>
  );
}

// ─── SECTION 4: End-to-End Data Flow ─────────────────────────────────────────
const FLOW_STEPS = [
  {
    id: "erp",
    label: "ERP Systems",
    sublabel: "SAP · Oracle · GL",
    color: "#334155",
    icon: "🏭",
    businessPurpose: "Source of all financial transaction data. ERP systems hold the general ledger, trial balance, and master data that feeds into DCT.",
    dataOwner: "Client ERP / Finance Team",
    infoMoves: "General ledger entries, trial balance, chart of accounts, entity master data",
    stateUse: "State apportionment factors and state-specific financial data originate here",
    provisionUse: "Provision source data (book income, temporary differences) originates here",
    batch: "Pre-DCT — ingestion handled by Tax Portal",
  },
  {
    id: "pdc",
    label: "PDC",
    sublabel: "Phoenix Data Consolidation",
    color: C.blue,
    icon: "⚙️",
    businessPurpose: "Ingests raw ERP data, normalizes it across Lines of Business, and enforces the Cross-LOB Taxonomy contract. PDC is the financial truth layer.",
    dataOwner: "PDC Engineering Team",
    infoMoves: "Normalized financial records, ingestion job status, Cross-LOB classification results",
    stateUse: "State-relevant financial data is normalized and tagged for state workstream consumption",
    provisionUse: "Provision-relevant financial data (book income, temporary differences) is normalized and made available to TDC",
    batch: "FC (Foundation Core), B1 (File Ingestion), B2 (Normalization)",
  },
  {
    id: "tdc",
    label: "TDC",
    sublabel: "Tax Data Consolidation",
    color: C.green,
    icon: "🧮",
    businessPurpose: "Applies tax rules, classifications, and adjustments to PDC financial data. TDC owns all tax decisions and business rules. Generates provision schedules and state tax data.",
    dataOwner: "TDC Engineering Team",
    infoMoves: "TaxProfile, MappingDecision, Adjustment, ProvisionSchedule, StateApportionment, AuditRecord",
    stateUse: "TDC applies state tax rules, computes state apportionment, and generates state tax classifications",
    provisionUse: "TDC computes current and deferred tax positions, generates provision schedules, and creates workpapers (Batch 28)",
    batch: "B3 (Tax Domain), B4 (AI Mapping), B16 (Audit Trail), B28 (Provision Schedules)",
  },
  {
    id: "roger",
    label: "Roger",
    sublabel: "Practitioner Interface",
    color: "#0891b2",
    icon: "👤",
    businessPurpose: "Read-only practitioner interface. Roger displays TDC outputs to tax practitioners for review, override submission, and sign-off. Roger does NOT own data or make decisions.",
    dataOwner: "Roger does NOT own data — read-only consumer via B9A Gateway",
    infoMoves: "Tax profiles, provision schedules, workpapers, audit trail, state apportionment data",
    stateUse: "State practitioners review state tax data, state apportionment, and state workpapers through Roger",
    provisionUse: "Provision practitioners review provision schedules, deferred tax positions, and provision workpapers through Roger",
    batch: "B9A (Gateway — primary access layer for Roger)",
  },
  {
    id: "ims",
    label: "IMS",
    sublabel: "Integration & Management System",
    color: C.rose,
    icon: "🔀",
    businessPurpose: "IMS is the integration broker between DCT/Roger and downstream return engines (GoSystem, CCH, OIT, future engines). DCT does not integrate directly with any return engine — IMS owns all engine routing, translation, and delivery.",
    dataOwner: "IMS Team",
    infoMoves: "Governed tax-ready payload from Roger/TDC; inbound return data from engines; engine lookup results; delivery acknowledgements",
    stateUse: "IMS receives governed state tax data from TDC and routes it to the appropriate return engine for state return preparation and filing",
    provisionUse: "IMS receives governed provision data from TDC and routes it to the appropriate return engine for provision reporting and filing",
    batch: "B9A (Gateway — IMS consumer access)",
  },
];

function DataFlowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= FLOW_STEPS.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  const step = FLOW_STEPS[activeStep];
  const batchHighlights = ["B9A", "B16", "B28"];

  return (
    <section id="s4" style={{ marginBottom: "48px" }}>
      <SectionHeading number="4" title="End-to-End Data Flow" subtitle="State & Provision specific. Step through how data moves from ERP through IMS to return engines and how each workstream uses it." />

      {/* Flow diagram */}
      <div style={{ display: "flex", alignItems: "center", gap: "0", marginBottom: "20px", overflowX: "auto", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px 24px" }}>
        {FLOW_STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => { setPlaying(false); setActiveStep(i); }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                padding: "12px 16px", borderRadius: "10px", border: "none", cursor: "pointer",
                backgroundColor: activeStep === i ? s.color : "#f8fafc",
                transition: "all 0.2s",
                minWidth: "100px",
              }}
            >
              <span style={{ fontSize: "24px" }}>{s.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: activeStep === i ? "white" : C.navy }}>{s.label}</span>
              <span style={{ fontSize: "10px", color: activeStep === i ? "rgba(255,255,255,0.8)" : C.slate }}>{s.sublabel}</span>
            </button>
            {i < FLOW_STEPS.length - 1 && (
              <div style={{ fontSize: "20px", color: "#94a3b8", padding: "0 4px", flexShrink: 0 }}>↓</div>
            )}
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", flexShrink: 0 }}>
          <button
            onClick={() => { setActiveStep(0); setPlaying(false); }}
            style={{ fontSize: "12px", fontWeight: 600, padding: "7px 14px", borderRadius: "6px", border: "1px solid #e2e8f0", backgroundColor: "white", color: C.slate, cursor: "pointer" }}
          >↺ Reset</button>
          <button
            onClick={() => { if (activeStep === FLOW_STEPS.length - 1) setActiveStep(0); setPlaying(!playing); }}
            style={{ fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "6px", border: "none", backgroundColor: playing ? "#dc2626" : "#059669", color: "white", cursor: "pointer" }}
          >{playing ? "⏸ Pause" : "▶ Play"}</button>
        </div>
      </div>

      {/* Step detail */}
      <div style={{ backgroundColor: "white", border: `2px solid ${step.color}`, borderRadius: "12px", padding: "22px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
          <span style={{ fontSize: "28px" }}>{step.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: C.navy }}>{step.label}</span>
              <span style={{ fontSize: "11px", color: C.slate }}>{step.sublabel}</span>
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              {batchHighlights.filter(b => step.batch.includes(b)).map(b => (
                <span key={b} style={{ fontSize: "10px", fontWeight: 700, backgroundColor: b === "B9A" ? C.b9a : b === "B16" ? C.b16 : C.b28, color: "white", borderRadius: "4px", padding: "2px 7px" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          {[
            { label: "Business Purpose", text: step.businessPurpose, color: step.color },
            { label: "Data Owner", text: step.dataOwner, color: step.color },
            { label: "Information Moves", text: step.infoMoves, color: step.color },
          ].map(f => (
            <div key={f.label} style={{ backgroundColor: "#f8fafc", borderRadius: "8px", padding: "12px 14px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: f.color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>{f.label}</div>
              <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: "1.5" }}>{f.text}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>🗺️ How State Uses This</div>
            <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.5" }}>{step.stateUse}</p>
          </div>
          <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>📊 How Provision Uses This</div>
            <p style={{ fontSize: "12px", color: "#5b21b6", margin: 0, lineHeight: "1.5" }}>{step.provisionUse}</p>
          </div>
        </div>
        <div style={{ marginTop: "12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "10px 14px" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Supporting Batch: </span>
          <span style={{ fontSize: "12px", color: "#78350f" }}>{step.batch}</span>
        </div>
      </div>
    </section>
  );
}

// ─── SECTION 5: Capability Mapping Table ─────────────────────────────────────
type StatusType = "Covered" | "Partially Covered" | "Net-New" | "Out of Scope";

const STATUS_CONFIG: Record<StatusType, { dot: string; bg: string; text: string; border: string; label: string }> = {
  "Covered":          { dot: "🟢", bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", label: "Covered" },
  "Partially Covered":{ dot: "🟡", bg: "#fffbeb", text: "#92400e", border: "#fde68a", label: "Partially Covered" },
  "Net-New":          { dot: "🔵", bg: "#eff6ff", text: "#1e40af", border: "#bfdbfe", label: "Net-New" },
  "Out of Scope":     { dot: "⚪", bg: "#f8fafc", text: "#475569", border: "#e2e8f0", label: "Out of Scope" },
};

type CapabilityRow = { need: string; capability: string; batch: string; apis: string; status: StatusType; action: string; story: string };

const STATE_CAPABILITY_ROWS: CapabilityRow[] = [
  { story: "1471480", need: "Retrieve governed State filer / filing-group starting context", capability: "Gateway & governed retrieval patterns", batch: "B9A", apis: "Gateway response contract to be defined", status: "Partially Covered", action: "Define starting-context, filer / filing-group identification, source meaning, and no-footprint behavior before DCT selects the response shape." },
  { story: "1471493", need: "Save, approve, and lock a State Filing Footprint version", capability: "TDC persistence plus audit / lineage patterns", batch: "B16", apis: "Governed filing-footprint lifecycle contract to be defined", status: "Partially Covered", action: "Define working, saved, approved, locked, and post-lock business behavior; DCT then determines versioning and persistence implementation." },
  { story: "1471498", need: "Expose saved State Filing Footprint with audit and lineage evidence", capability: "Audit Trail & Lineage Governance", batch: "B16", apis: "GET /api/v1/audit/lineage/{filingFootprintId}", status: "Partially Covered", action: "Confirm whether saved means working, approved, or both, plus consumers and required audit-history fields." },
  { story: "1472734", need: "Compose State return-filing response for Roger", capability: "Gateway & Governed Consumer Access Layer", batch: "B9A", apis: "State return-filing Gateway response contract to be defined", status: "Partially Covered", action: "Define the Roger-required fields, state-return status behavior, and incomplete / exception response before implementing the consumer contract." },
];

const PROVISION_CAPABILITY_ROWS: CapabilityRow[] = [
  { story: "1479949", need: "Provide PY Provision and PY Tax Return source values, entity context, and source evidence", capability: "PDC governed source financial data and TDC tax-domain context", batch: "B9A", apis: "Package 1 governed input contract to be defined", status: "Partially Covered", action: "Confirm authoritative source mappings, business level of detail, and missing / exception handling before DCT defines the input contract." },
  { story: "1479958", need: "Provide RTP calculation, entity roll-up, and section dataset", capability: "TDC governed calculation and Gateway access patterns", batch: "B9A", apis: "Package 1 RTP dataset contract to be defined", status: "Partially Covered", action: "Confirm unmatched-item behavior, filtered-entity recalculation, roll-up rules, and Permanent / Temporary exceptions before estimation." },
  { story: "1480251", need: "Persist, audit, and recalculate a practitioner correction to a prior-year amount", capability: "TDC persistence and Audit Trail & Lineage Governance", batch: "B16", apis: "Correction / recalculation contract to be defined", status: "Partially Covered", action: "Decide whether a correction changes a source value or creates a governed override, including historical visibility and recalculation rules." },
  { story: "1480000", need: "Expose completed RTP true-up outputs to Package 2 and Package 3", capability: "Provision Reference Data & BTP Outbound Contract", batch: "B28", apis: "Package 2 / Package 3 output contract to be defined", status: "Partially Covered", action: "Confirm the required output, recipient, payable / deferred routing rule, and downstream consumption timing before DCT acceptance." },
];

const LEGEND_ITEMS: { status: StatusType; definition: string; action: string }[] = [
  { status: "Covered",          definition: "Existing DCT capability satisfies the business need.",  action: "Reference the existing capability." },
  { status: "Partially Covered",definition: "Existing capability requires enhancement.",              action: "Document only the enhancement." },
  { status: "Net-New",          definition: "No existing DCT capability exists.",                    action: "Document the complete business requirement." },
  { status: "Out of Scope",     definition: "Capability belongs to another platform or team.",       action: "Coordinate with the owning team rather than creating DCT implementation work." },
];

function CapabilityMappingTable({ workstream }: { workstream: "state" | "provision" }) {
  const isState = workstream === "state";
  const rows = isState ? STATE_CAPABILITY_ROWS : PROVISION_CAPABILITY_ROWS;
  const title = isState ? "How DCT Supports State Stories" : "How DCT Supports Provision Stories";
  const subtitle = isState ? "State story capability matrix — identify governed patterns and business gaps before DCT acceptance." : "Provision Package 1 capability matrix — identify governed patterns and business gaps before DCT acceptance.";
  const batchColor = (b: string) => b === "B9A" ? C.b9a : b === "B16" ? C.b16 : b === "—" ? "#94a3b8" : C.b28;

  return (
    <section id="s5" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="5"
        title={title}
        subtitle={subtitle}
      />

      {/* Section description */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px", marginTop: "-8px" }}><p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", margin: 0 }}>The matrix aligns the current <strong>{isState ? "State" : "Provision"}</strong> stories with available DCT patterns, supporting batches, and the business decisions that must be resolved before implementation.</p><CopyButton text={rows.map(row => `${row.story} | ${row.need} | ${row.capability} | ${row.batch} | ${row.apis} | ${row.status} | ${row.action}`).join("\n")} label="Copy table" /></div>

      {/* Discovery Guidance panel */}
      <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "16px 20px", marginBottom: "20px", borderLeft: "4px solid #059669" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
          🔎 Discovery Guidance
        </div>
        <p style={{ fontSize: "13px", color: "#166534", margin: "0 0 10px", lineHeight: "1.6" }}>
          Before documenting a new requirement, determine whether DCT already provides the requested capability.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ backgroundColor: "white", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#059669", marginBottom: "5px" }}>✅ If the capability already exists</div>
            <ul style={{ margin: 0, paddingLeft: "16px" }}>
              {["Reference the existing Batch.", "Reference the existing API.", "Document only the business enhancement."].map(t => (
                <li key={t} style={{ fontSize: "12px", color: "#166534", lineHeight: "1.6" }}>{t}</li>
              ))}
            </ul>
            <p style={{ fontSize: "11px", color: "#065f46", margin: "8px 0 0", fontWeight: 600 }}>Avoid creating duplicate implementation work.</p>
          </div>
          <div style={{ backgroundColor: "white", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "10px 14px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e40af", marginBottom: "5px" }}>🔵 If the capability does not exist</div>
            <p style={{ fontSize: "12px", color: "#1e40af", margin: 0, lineHeight: "1.6" }}>
              Document the business requirement and identify the capability as <strong>Net-New</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Matrix table */}
      <div style={{ overflowX: "auto", backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ backgroundColor: C.navy }}>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "90px" }}>Story</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "160px" }}>Business Need</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "180px" }}>Existing DCT Capability</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700 }}>Supporting Batch</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "200px" }}>Supporting APIs</th>
              <th style={{ padding: "10px 14px", textAlign: "center", color: "white", fontWeight: 700, minWidth: "120px" }}>Status</th>
              <th style={{ padding: "10px 14px", textAlign: "left", color: "white", fontWeight: 700, minWidth: "200px" }}>BA Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const sc = STATUS_CONFIG[r.status];
              return (
                <tr key={r.need} style={{ backgroundColor: i % 2 === 0 ? "#f8fafc" : "white", borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 14px", fontWeight: 750, color: C.navy, verticalAlign: "top" }}>{r.story}</td>
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: C.navy, verticalAlign: "top" }}>{r.need}</td>
                  <td style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top" }}>{r.capability}</td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, backgroundColor: batchColor(r.batch), color: "white", borderRadius: "4px", padding: "2px 8px" }}>{r.batch}</span>
                  </td>
                  <td style={{ padding: "10px 14px", verticalAlign: "top", fontFamily: "monospace", fontSize: "11px", color: "#0f172a" }}>{r.apis}</td>
                  <td style={{ padding: "10px 14px", textAlign: "center", verticalAlign: "top" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700, backgroundColor: sc.bg, color: sc.text, border: `1px solid ${sc.border}`, borderRadius: "5px", padding: "3px 8px", whiteSpace: "nowrap" }}>
                      {sc.dot} {sc.label}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#334155", verticalAlign: "top", fontSize: "12px", lineHeight: "1.5" }}>{r.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Discovery Decision Legend */}
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Discovery Decision Legend</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
          {LEGEND_ITEMS.map(item => {
            const sc = STATUS_CONFIG[item.status];
            return (
              <div key={item.status} style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}`, borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{sc.dot}</span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: sc.text }}>{sc.label}</span>
                </div>
                <p style={{ fontSize: "11px", color: sc.text, margin: "0 0 5px", lineHeight: "1.5" }}>{item.definition}</p>
                <p style={{ fontSize: "11px", color: sc.text, margin: 0, fontWeight: 600, lineHeight: "1.5" }}>{item.action}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final reminder */}
      <div style={{ backgroundColor: C.navy, borderRadius: "10px", padding: "16px 20px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
          💡 Discovery Reminder
        </div>
        <p style={{ fontSize: "13px", color: "#e2e8f0", margin: "0 0 6px", fontWeight: 600 }}>
          Business Analysts define <span style={{ color: "#10b981" }}>WHAT</span> the business needs. DCT determines <span style={{ color: "#10b981" }}>HOW</span> the platform implements the solution.
        </p>
        <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: "1.6" }}>
          Understanding existing platform capabilities before documenting new requirements reduces duplicate work, accelerates solution assessment, and ensures implementation builds upon the current DCT platform rather than recreating existing functionality.
        </p>
      </div>
    </section>
  );
}

// ─── SECTION 6: Discovery Questions ──────────────────────────────────────────
const DISCOVERY_QUESTIONS = [
  { category: "Current-State Assessment", questions: [
    "What is the current business process?",
    "Which system performs this function today?",
    "What existing functionality already supports this capability?",
    "Which platform owns the capability?",
    "Which data is persisted?",
    "Which data is calculated?",
    "Which system is the system of record?",
    "What business problem is not solved today?",
  ]},
  { category: "Capability Check", questions: [
    "Does DCT already support this capability?",
    "Which existing Batch provides it?",
    "Which APIs already exist?",
    "Which existing business objects support it?",
    "Is the capability Covered, Partially Covered, or Net-New?",
    "If partially covered, what enhancement is required?",
    "If Net-New, why can't the existing platform satisfy the requirement?",
  ]},

  { category: "Scope & Requirements", questions: [
    "Would this require new scope beyond B9A, B16, or B28?",
    "Which system owns this capability — PDC, TDC, or the Gateway?",
    "Is this a new business rule (TDC), a new API (B9A), or a new output format (B28)?",
    "What is the downstream consumer — Roger, IMS, or both?",
  ]},
  { category: "Data & Lineage", questions: [
    "What source data is required, and does PDC already normalize it?",
    "Is full lineage required from ERP to output? (B16 supports this)",
    "Does this require a new business object in TDC, or can an existing one be extended?",
    "What audit trail requirements apply to this capability?",
  ]},
  { category: "Integration", questions: [
    "Does IMS need to route this data to a return engine? (B9A Gateway consumer scope)",
    "Does Roger need to display this data? (B9A Gateway consumer scope)",
    "Are there dependencies on other batches not yet delivered?",
    "What validations and error handling are required?",
  ]},
];

function DiscoveryQuestionsSection() {
  const [expanded, setExpanded] = useState<string | null>("Capability Check");

  return (
    <section id="s6" style={{ marginBottom: "48px" }}>
      <SectionHeading number="6" title="Discovery Questions" subtitle="Use these questions to guide requirements discovery. Expand each category." />
      {DISCOVERY_QUESTIONS.map(cat => (
        <div key={cat.category} style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", marginBottom: "10px", overflow: "hidden" }}>
          <button
            onClick={() => setExpanded(expanded === cat.category ? null : cat.category)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: "14px", fontWeight: 700, color: C.navy }}>{cat.category}</span>
            <span style={{ fontSize: "16px", color: C.slate }}>{expanded === cat.category ? "▲" : "▼"}</span>
          </button>
          {expanded === cat.category && (
            <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f1f5f9" }}>
              {cat.questions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "8px 0", borderBottom: i < cat.questions.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <span style={{ color: "#10b981", fontWeight: 700, flexShrink: 0, marginTop: "1px" }}>?</span>
                  <span style={{ fontSize: "13px", color: "#334155", lineHeight: "1.5" }}>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

// ─── SECTION 7: Ask Buddy ─────────────────────────────────────────────────────
type Message = { role: "user" | "assistant"; content: string };

const BUDDY_SUGGESTED = [
  "What does Batch 9A deliver for State and Provision?",
  "How does Batch 28 support Provision reference data?",
  "What is the role of Batch 16 in audit trail governance?",
  "What APIs are available for State and Provision consumers?",
  "Is this capability Covered, Partially Covered, or Net-New?",
  "What data does the State workstream need from TDC?",
  "How does IMS route Provision data to return engines?",
];

function AskBuddySection() {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "👋 I'm Ask Buddy — your discovery guide for the DCT platform.\n\nBefore documenting any new requirement, ask me to determine whether DCT already supports the capability. I will evaluate existing platform capabilities, identify supporting batches, APIs, and business objects, and classify the request as Covered, Partially Covered, or Net-New before new requirements are created.\n\nDescribe the business capability you need — I'll check the DCT knowledge base first.",
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.askBuddy.chat.useMutation();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const INITIAL_MESSAGE: Message = {
    role: "assistant",
    content: "👋 I'm Ask Buddy — your discovery guide for the DCT platform.\n\nBefore documenting any new requirement, ask me to determine whether DCT already supports the capability. I will evaluate existing platform capabilities, identify supporting batches, APIs, and business objects, and classify the request as Covered, Partially Covered, or Net-New before new requirements are created.\n\nDescribe the business capability you need — I'll check the DCT knowledge base first.",
  };

  function clearChat() {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  }

  async function send(text: string) {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    appendSharedBuddyConversation([{ id: `workspace-user-${Date.now()}`, role: "user", content: text, createdAt: new Date().toISOString() }]);
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    try {
      const allMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const result = await chatMutation.mutateAsync({
        messages: allMsgs,
        discoveryPagePath: "/onboarding",
      });
      setMessages(prev => [...prev, { role: "assistant", content: result.text }]);
      appendSharedBuddyConversation([{ id: `workspace-assistant-${Date.now()}`, role: "assistant", content: result.text, createdAt: new Date().toISOString(), sources: result.sources, status: result.status, knowledgeCheckedAt: result.knowledgeCheckedAt }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="s7" style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <SectionHeading number="7" title="Ask Buddy" subtitle="Before documenting any new requirement, ask Buddy to determine whether DCT already supports the capability. Buddy guides discovery — not just answers." />
        </div>
        <button
          onClick={clearChat}
          title="Clear conversation and start over"
          style={{
            marginTop: "4px",
            display: "flex", alignItems: "center", gap: "5px",
            fontSize: "11px", fontWeight: 700,
            padding: "5px 12px", borderRadius: "6px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white", color: "#64748b",
            cursor: "pointer", whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8fafc"; (e.currentTarget as HTMLButtonElement).style.color = "#1e293b"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white"; (e.currentTarget as HTMLButtonElement).style.color = "#64748b"; }}
        >
          ↺ Clear Chat
        </button>
      </div>
      <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        {/* Messages */}
        <div style={{ height: "340px", overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "78%", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", lineHeight: "1.6",
                backgroundColor: m.role === "user" ? C.navy : "#f8fafc",
                color: m.role === "user" ? "white" : "#1e293b",
                border: m.role === "assistant" ? "1px solid #e2e8f0" : "none",
                whiteSpace: "pre-wrap",
              }}>{m.content}</div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 14px", borderRadius: "10px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "13px", color: C.slate }}>
                Searching DCT knowledge base...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        {/* Suggested questions */}
        <div style={{ padding: "10px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {BUDDY_SUGGESTED.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              fontSize: "11px", fontWeight: 600, padding: "4px 10px", borderRadius: "5px",
              border: "1px solid #e2e8f0", backgroundColor: "white", color: C.blue, cursor: "pointer",
            }}>{q}</button>
          ))}
        </div>
        {/* Input */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Ask about existing DCT capabilities for State & Provision..."
            style={{ flex: 1, padding: "9px 12px", fontSize: "13px", border: "1px solid #e2e8f0", borderRadius: "6px", outline: "none", color: "#0f1623" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            style={{
              padding: "9px 18px", fontSize: "13px", fontWeight: 700,
              backgroundColor: input.trim() && !isLoading ? C.navy : "#94a3b8",
              color: "white", border: "none", borderRadius: "6px",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            }}
          >Ask</button>
        </div>
      </div>
    </section>
  );
}

// ─── FINAL SECTION: Definition of Ready for DCT ─────────────────────────────────
const READY_CHECKLIST = [
  { id: "r1",  text: "Business capability defined" },
  { id: "r2",  text: "Current-state process documented" },
  { id: "r3",  text: "Existing platform capabilities evaluated" },
  { id: "r4",  text: "Business gap identified" },
  { id: "r5",  text: "Functional requirements documented" },
  { id: "r6",  text: "Business rules documented" },
  { id: "r7",  text: "Data ownership identified" },
  { id: "r8",  text: "System of record identified" },
  { id: "r9",  text: "Existing DCT capabilities referenced" },
  { id: "r10", text: "New functionality clearly defined" },
];

function DefinitionOfReadySection() {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const pct = Math.round((checked.size / READY_CHECKLIST.length) * 100);
  const allDone = checked.size === READY_CHECKLIST.length;

  return (
    <section id="s-ready" style={{ marginBottom: "48px" }}>
      <SectionHeading
        number="✓"
        title="Definition of Ready for DCT"
        subtitle="Before engaging DCT for platform assessment, ensure business discovery is complete."
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Checklist */}
        <div style={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ backgroundColor: "#0f1623", padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "white" }}>✅ Business Discovery Checklist</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: allDone ? "#10b981" : "#fbbf24" }}>
                {checked.size}/{READY_CHECKLIST.length} complete
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: "6px", backgroundColor: "#1e293b", borderRadius: "3px", marginTop: "10px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                backgroundColor: allDone ? "#10b981" : "#f59e0b",
                borderRadius: "3px", transition: "width 0.3s ease",
              }} />
            </div>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {READY_CHECKLIST.map(item => (
              <div
                key={item.id}
                onClick={() => toggle(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "9px 0",
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
                  border: `2px solid ${checked.has(item.id) ? "#059669" : "#cbd5e1"}`,
                  backgroundColor: checked.has(item.id) ? "#059669" : "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {checked.has(item.id) && <span style={{ color: "white", fontSize: "12px", fontWeight: 800 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: "13px",
                  color: checked.has(item.id) ? "#64748b" : "#1e293b",
                  textDecoration: checked.has(item.id) ? "line-through" : "none",
                  lineHeight: "1.4",
                }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: what happens next + DCT actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* What DCT does next */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "18px 20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>🏗️ When These Items Are Complete, DCT Performs</div>
            {[
              { label: "Platform Capability Assessment", desc: "DCT evaluates whether existing platform capabilities can satisfy the documented business need." },
              { label: "Technical Gap Analysis", desc: "DCT identifies the technical delta between existing capabilities and the documented requirements." },
              { label: "Technical Solution Assessment", desc: "DCT proposes the implementation approach aligned to the batch delivery model." },
              { label: "Implementation Planning", desc: "DCT sequences the work into the appropriate batch and gate framework." },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  backgroundColor: "#059669", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 800, flexShrink: 0, marginTop: "1px",
                }}>→</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "2px" }}>{item.label}</div>
                  <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.5" }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Readiness status callout */}
          <div style={{
            backgroundColor: allDone ? "#059669" : "#0f1623",
            borderRadius: "12px", padding: "18px 20px",
            transition: "background-color 0.3s ease",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "white", marginBottom: "8px" }}>
              {allDone ? "🎉 Ready to Engage DCT" : "🕒 Discovery In Progress"}
            </div>
            <p style={{ fontSize: "13px", color: allDone ? "#d1fae5" : "#94a3b8", margin: 0, lineHeight: "1.6" }}>
              {allDone
                ? "All business discovery items are complete. You are ready to engage DCT for Platform Capability Assessment, Technical Gap Analysis, Technical Solution Assessment, and Implementation Planning."
                : `Complete all ${READY_CHECKLIST.length} checklist items before engaging DCT. ${READY_CHECKLIST.length - checked.size} item${READY_CHECKLIST.length - checked.size !== 1 ? "s" : ""} remaining.`
              }
            </p>
          </div>

          {/* Boundary reminder */}
          <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "10px", padding: "14px 18px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>📝 Ownership Boundary</div>
            <p style={{ fontSize: "12px", color: "#5b21b6", margin: 0, lineHeight: "1.6" }}>
              The Business Analyst defines <strong>WHAT</strong> the business needs. DCT determines <strong>HOW</strong> the platform implements the solution. Business discovery artifacts must be complete before DCT begins technical assessment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Floating Quick Links sidebar ────────────────────────────────────────────
const QUICK_LINKS = [
  { label: "Refinement Model", href: "#refinement-model", color: C.blue, icon: "⇄" },
  { label: "Story Readiness", href: "#story-readiness", color: C.teal, icon: "✓" },
  { label: "PI 4 State Plan", href: "#pi4-state-readiness", color: C.teal, icon: "◫" },
  { label: "Discovery Workflow", href: "#s-workflow", color: "#0369a1", icon: "🔎" },
  { label: "Batch 9A", href: "#s3", color: C.b9a, icon: "🔐" },
  { label: "Batch 16", href: "#s3", color: C.b16, icon: "📋" },
  { label: "Batch 28", href: "#s3", color: C.b28, icon: "📄" },
  { label: "Workstream Overview", href: "#s1", color: C.slate, icon: "◎" },
  { label: "Responsibilities", href: "#s2", color: C.slate, icon: "▦" },
  { label: "Data Flow", href: "#s4", color: C.slate, icon: "→" },
  { label: "Rule Posting", href: "#s-rule-posting", color: C.green, icon: "⚖" },
  { label: "Capability Map", href: "#s5", color: C.slate, icon: "☑" },
  { label: "Discovery Questions", href: "#s6", color: C.slate, icon: "?" },
  { label: "Ask Buddy", href: "#s7", color: C.slate, icon: "🤖" },
  { label: "Ready for DCT", href: "#s-ready", color: "#059669", icon: "✓" },
];

function QuickLinks() {
  return (
    <div style={{
      position: "sticky", top: "20px", width: "180px", flexShrink: 0,
      backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px",
      padding: "14px 0", alignSelf: "flex-start",
    }}>
      <div style={{ fontSize: "10px", fontWeight: 800, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 14px 10px", borderBottom: "1px solid #f1f5f9" }}>
        Quick Links
      </div>
      {QUICK_LINKS.map(l => (
        <a key={l.label} href={l.href} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 14px", textDecoration: "none", color: "#334155", fontSize: "12px", fontWeight: 500 }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f8fafc")}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <span style={{ fontSize: "13px", width: "16px", textAlign: "center", flexShrink: 0 }}>{l.icon}</span>
          <span>{l.label}</span>
        </a>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DiscoveryWorkspace() {
  const [, navigate] = useLocation();
  const [activeWorkstream, setActiveWorkstream] = useState<"state" | "provision">("state");

  return (
    <div style={{ padding: "28px 32px", fontFamily: "system-ui, sans-serif", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: "32px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: C.navy, display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981", fontWeight: 900, fontSize: "16px" }}>D</div>
              <h1 style={{ fontSize: "24px", fontWeight: 900, color: C.navy, margin: 0 }}>Provision & State Discovery Workspace</h1>
            </div>
            <p style={{ fontSize: "14px", color: C.slate, margin: 0, lineHeight: "1.6", maxWidth: "700px" }}>
              A practical discovery and refinement workspace for State and Provision. Business workstreams define expected behavior; DCT identifies implementation considerations and accepts stories only when DEV and QA can proceed without making a business decision.
            </p>
          </div>
          {/* Discovery Principle */}
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", padding: "14px 18px", minWidth: "260px", flexShrink: 0 }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>🔎 Discovery Principle</div>
            <p style={{ fontSize: "12px", color: "#166534", margin: 0, lineHeight: "1.6" }}>
              Effective discovery begins with understanding existing capabilities before defining new requirements.
            </p>
          </div>
        </div>
        {/* Batch badges */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
          {[
            { label: "Batch 9A — Gateway", color: C.b9a },
            { label: "Batch 16 — Audit Trail", color: C.b16 },
            { label: "Batch 28 — Provision Reference Data", color: C.b28 },
            { label: "State Workstream", color: C.teal },
            { label: "Provision Workstream", color: C.purple },
          ].map(b => (
            <span key={b.label} style={{ fontSize: "11px", fontWeight: 600, color: "white", backgroundColor: b.color, borderRadius: "4px", padding: "3px 9px" }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Two-column layout: content + quick links */}
      <div style={{ display: "flex", gap: "28px", alignItems: "flex-start" }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <CrossTeamRefinementModel />
          <WorkstreamReadinessHub active={activeWorkstream} onChange={setActiveWorkstream} />
          {activeWorkstream === "state" ? <PI4StateReadiness /> : <ProvisionDeliveryReadiness />}
          <WorkstreamOverview />
          <ResponsibilityMatrix />
          <DiscoveryWorkflowSection />
          <ExistingCapabilities />
          <DataFlowSection />
          <RuleProcessingTdcPosting />
          <CapabilityMappingTable workstream={activeWorkstream} />
          <DiscoveryQuestionsSection />
          <AskBuddySection />
          <DefinitionOfReadySection />
        </div>
        {/* Quick links sidebar */}
        <QuickLinks />
      </div>
    </div>
  );
}
