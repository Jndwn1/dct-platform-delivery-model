import { Link } from "wouter";
import {
  CURRENT_DEV_STORY_IMPACTS,
  OPEN_DECISIONS,
  OPEN_STATE_CONFIRMATION,
  RESPONSIBILITIES,
  TAXONOMY_ALIGNMENT_TRANSCRIPT,
  TAXONOMY_ALIGNMENT_TRANSCRIPT_ACTION,
  TAXONOMY_ALIGNMENT_TRANSCRIPT_NOTE,
  TAXONOMY_ALIGNMENT_TRANSCRIPT_SOURCE,
  TRANSCRIPT_TDC_NEEDS,
  TDC_TAXONOMY_REQUIREMENTS,
  type ReadinessLevel,
} from "@/lib/stateTaxonomyReadiness";

const C = {
  navy: "#0f172a",
  slate: "#334155",
  muted: "#64748b",
  border: "#e2e8f0",
  purple: "#7c3aed",
  purpleSurface: "#faf5ff",
  teal: "#0f766e",
  tealSurface: "#f0fdfa",
  amber: "#b45309",
  amberSurface: "#fffbeb",
  orange: "#c2410c",
  orangeSurface: "#fff7ed",
  red: "#be123c",
  redSurface: "#fff1f2",
};

const riskStyle: Record<ReadinessLevel, { background: string; border: string; color: string; label: string }> = {
  Defined: { background: "#f0fdf4", border: "#86efac", color: "#166534", label: "Defined" },
  "Clarification needed": { background: C.amberSurface, border: "#fde68a", color: C.amber, label: "Clarification needed" },
  "Material implementation risk": { background: C.orangeSurface, border: "#fdba74", color: C.orange, label: "Material implementation risk" },
  "Blocking DEV": { background: C.redSurface, border: "#fecdd3", color: C.red, label: "Blocking DEV" },
};

const transcriptAccent = {
  teal: { background: C.tealSurface, border: "#99f6e4", color: C.teal },
  purple: { background: C.purpleSurface, border: "#ddd6fe", color: C.purple },
  amber: { background: C.amberSurface, border: "#fde68a", color: C.amber },
  orange: { background: C.orangeSurface, border: "#fdba74", color: C.orange },
};

function StatusPill({ status }: { status: ReadinessLevel }) {
  const style = riskStyle[status];
  return <span style={{ background: style.background, border: `1px solid ${style.border}`, borderRadius: "999px", color: style.color, display: "inline-flex", fontSize: "9px", fontWeight: 900, letterSpacing: "0.035em", lineHeight: 1.15, padding: "4px 7px", whiteSpace: "nowrap" }}>{style.label}</span>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ borderLeft: `4px solid ${C.purple}`, marginBottom: "14px", paddingLeft: "12px" }}>
      <div style={{ color: C.purple, fontSize: "10px", fontWeight: 900, letterSpacing: "0.085em", textTransform: "uppercase" }}>{eyebrow}</div>
      <h2 style={{ color: C.navy, fontSize: "19px", fontWeight: 900, letterSpacing: "-0.015em", margin: "4px 0 0" }}>{title}</h2>
      <p style={{ color: C.muted, fontSize: "12px", lineHeight: 1.5, margin: "5px 0 0", maxWidth: "1020px" }}>{description}</p>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return <th style={{ color: "#ffffff", fontSize: "9px", fontWeight: 900, letterSpacing: "0.055em", padding: "10px 11px", textAlign: "left", textTransform: "uppercase" }}>{children}</th>;
}

function Cell({ children, width }: { children: React.ReactNode; width?: string }) {
  return <td style={{ color: C.slate, fontSize: "10px", lineHeight: 1.45, padding: "10px 11px", verticalAlign: "top", width }}>{children}</td>;
}

export default function StateTaxonomyReadinessPage() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", margin: "0 auto", maxWidth: "1360px", padding: "28px 32px 52px" }}>
      <div style={{ marginBottom: "22px" }}>
        <div>
          <Link href="/post-pilot" style={{ color: C.purple, fontSize: "11px", fontWeight: 850, textDecoration: "none" }}>← Post Pilot</Link>
          <div style={{ color: C.purple, fontSize: "10px", fontWeight: 900, letterSpacing: "0.1em", marginTop: "12px", textTransform: "uppercase" }}>PI4 · State / TDC Discussion Readiness</div>
          <h1 style={{ color: C.navy, fontSize: "26px", fontWeight: 900, letterSpacing: "-0.025em", margin: "5px 0 0" }}>State Taxonomy — TDC Dependencies, Requirements, and Discussion Readiness</h1>
          <p style={{ color: C.muted, fontSize: "13px", lineHeight: 1.55, margin: "7px 0 0", maxWidth: "990px" }}>An executive and implementation-readiness reference for TDC taxonomy discussions. It records what TDC needs from State, what must be clarified before design decisions, and the governed data-layer responsibilities that follow an approved State definition.</p>
        </div>
      </div>

      <section aria-label="Taxonomy executive summary" style={{ background: C.purpleSurface, border: "1px solid #e9d5ff", borderRadius: "11px", boxShadow: "0 2px 8px rgba(124,58,237,.06)", marginBottom: "26px", overflow: "hidden" }}>
        <div style={{ background: C.navy, color: "#ffffff", padding: "13px 16px" }}>
          <div style={{ fontSize: "10px", fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase" }}>Governing principle</div>
          <div style={{ fontSize: "17px", fontWeight: 900, lineHeight: 1.35, marginTop: "4px" }}>State defines <span style={{ color: "#c4b5fd" }}>WHAT</span> the taxonomy means. TDC defines <span style={{ color: "#c4b5fd" }}>HOW</span> resulting governed data is stored, versioned, audited, retrieved, and exposed.</div>
        </div>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))", padding: "15px" }}>
          <div style={{ background: "#ffffff", border: "1px solid #dbeafe", borderTop: "4px solid #2563eb", borderRadius: "8px", padding: "13px" }}>
            <div style={{ color: "#1d4ed8", fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>State / Tax SME provides</div>
            <p style={{ color: C.slate, fontSize: "11px", lineHeight: 1.55, margin: "7px 0 0" }}>Authoritative taxonomy structure and targets, State business definitions, GoSystem alignment, applicability rules, filing-footprint context, and taxonomy-versioning expectations. TDC does not determine State business meaning.</p>
          </div>
          <div style={{ background: "#ffffff", border: "1px solid #99f6e4", borderTop: `4px solid ${C.teal}`, borderRadius: "8px", padding: "13px" }}>
            <div style={{ color: C.teal, fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>TDC governs after definition</div>
            <p style={{ color: C.slate, fontSize: "11px", lineHeight: 1.55, margin: "7px 0 0" }}>Source data, Orchestrator-proposed mappings, taxonomy IDs and versions, mapping status, practitioner decisions and corrections, source lineage, version/audit history, and effective governed values.</p>
          </div>
          <div style={{ background: C.orangeSurface, border: "1px solid #fdba74", borderTop: `4px solid ${C.orange}`, borderRadius: "8px", padding: "13px" }}>
            <div style={{ color: C.orange, fontSize: "10px", fontWeight: 900, letterSpacing: "0.07em", textTransform: "uppercase" }}>Immediate focus</div>
            <p style={{ color: C.slate, fontSize: "11px", lineHeight: 1.55, margin: "7px 0 0" }}><strong>1494222</strong> and <strong>1494344</strong> carry the highest implementation risk because unresolved taxonomy decisions directly affect persistence, mapping governance, corrections, versioning, audit history, and effective governed values.</p>
          </div>
        </div>
      </section>

      <section id="transcript-alignment-update" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="Transcript-informed update" title="What the State taxonomy discussion aligned, needs next, and leaves open" description="This working update translates the supplied meeting transcript into readiness content. It distinguishes discussion alignment from confirmed design decisions and keeps unresolved items explicitly open." />
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", color: "#1e3a5f", fontSize: "10px", lineHeight: 1.5, marginBottom: "12px", padding: "10px 12px" }}>
          <strong>Source:</strong> {TAXONOMY_ALIGNMENT_TRANSCRIPT_SOURCE}. <span style={{ color: C.muted }}>{TAXONOMY_ALIGNMENT_TRANSCRIPT_NOTE}</span>
        </div>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(285px, 1fr))" }}>
          {TAXONOMY_ALIGNMENT_TRANSCRIPT.map((section) => {
            const accent = transcriptAccent[section.accent];
            return <div key={section.title} style={{ background: accent.background, border: `1px solid ${accent.border}`, borderTop: `4px solid ${accent.color}`, borderRadius: "9px", padding: "13px" }}>
              <div style={{ color: accent.color, fontSize: "11px", fontWeight: 900 }}>{section.title}</div>
              <ul style={{ color: C.slate, fontSize: "10px", lineHeight: 1.5, listStylePosition: "outside", listStyleType: "disc", margin: "9px 0 0", paddingLeft: "18px" }}>
                {section.items.map((item) => <li key={item} style={{ marginBottom: "6px" }}>{item}</li>)}
              </ul>
            </div>;
          })}
        </div>
        <div style={{ background: C.tealSurface, border: "1px solid #99f6e4", borderRadius: "8px", color: C.slate, fontSize: "11px", lineHeight: 1.55, marginTop: "12px", padding: "11px 13px" }}>
          <strong style={{ color: C.teal }}>Next action recorded in the transcript — {TAXONOMY_ALIGNMENT_TRANSCRIPT_ACTION.owner}:</strong> {TAXONOMY_ALIGNMENT_TRANSCRIPT_ACTION.action} {TAXONOMY_ALIGNMENT_TRANSCRIPT_ACTION.supportingAction}
        </div>
      </section>

      <section style={{ marginBottom: "26px" }}>
        <SectionHeading eyebrow="Decision status key" title="Readiness signal" description="Use the signals below to separate confirmed facts from discussion items. No unresolved State business decision is treated as approved on this page." />
        <div style={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {(Object.keys(riskStyle) as ReadinessLevel[]).map((status) => <StatusPill key={status} status={status} />)}
          <span style={{ color: C.muted, fontSize: "10px", marginLeft: "4px" }}>{OPEN_STATE_CONFIRMATION}</span>
        </div>
      </section>

      <section id="taxonomy-dependencies" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="1 · Transcript-driven TDC needs" title="What TDC needs next from the State taxonomy discussion" description="This register is limited to the data, matching, calculation, and follow-up needs discussed in the supplied transcript. It records working needs and gaps; it does not approve a technical design." />
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(15,23,42,.045)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1350px", width: "100%" }}>
              <thead><tr style={{ background: C.navy }}><TableHeader>ID</TableHeader><TableHeader>What TDC Needs Next</TableHeader><TableHeader>Why It Is Needed</TableHeader><TableHeader>Transcript Reference</TableHeader><TableHeader>Owner / Follow-Up</TableHeader><TableHeader>Workstreams</TableHeader><TableHeader>Readiness</TableHeader></tr></thead>
              <tbody>{TRANSCRIPT_TDC_NEEDS.map((item, index) => <tr key={item.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}` }}><Cell width="7%"><strong style={{ color: C.purple, fontSize: "11px" }}>{item.id}</strong></Cell><Cell width="19%"><strong style={{ color: C.navy, fontSize: "11px" }}>{item.need}</strong></Cell><Cell width="29%">{item.why}</Cell><Cell width="11%"><span style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 800 }}>{item.reference}</span></Cell><Cell width="14%"><strong>{item.owner}</strong></Cell><Cell width="11%"><span style={{ color: C.teal, fontWeight: 850 }}>{item.workstreams}</span></Cell><Cell width="9%"><StatusPill status={item.status} /></Cell></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="tdc-requirements" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="2 · Transcript-backed working requirements" title="TDC taxonomy requirements" description="The requirements below reflect needs raised in the supplied alignment transcript. They are working inputs for validation and refinement; they do not independently approve State business meaning, technical design, or delivery commitment." />
        <div style={{ background: C.amberSurface, border: "1px solid #fde68a", borderRadius: "8px", color: "#713f12", fontSize: "11px", lineHeight: 1.5, marginBottom: "12px", padding: "11px 13px" }}><strong>Requirements control:</strong> State / Tax SME confirmation is required before the working requirements become approved design, implementation, or delivery commitments. TDC owns the governed data-layer behavior that follows an approved decision.</div>
        <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))" }}>
          {TDC_TAXONOMY_REQUIREMENTS.map((requirement) => <div key={requirement.id} style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.teal}`, borderRadius: "8px", padding: "11px 12px" }}><div style={{ color: C.teal, fontSize: "10px", fontWeight: 900 }}>{requirement.id}</div><div style={{ color: C.navy, fontSize: "11px", fontWeight: 900, marginTop: "4px" }}>{requirement.title}</div><p style={{ color: C.slate, fontSize: "10px", lineHeight: 1.5, margin: "5px 0 0" }}>{requirement.statement}</p><div style={{ color: C.muted, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "9px", fontWeight: 850, marginTop: "8px" }}>Transcript: {requirement.reference}</div></div>)}
        </div>
      </section>

      <section id="current-dev-story-impact" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="3 · Current DEV story impact" title="Where unresolved taxonomy decisions affect current work" description="The first-pass State review findings are retained as context. These signals identify discussion and implementation-readiness impact only; they do not approve a solution, endpoint, schema, or story split." />
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1170px", width: "100%" }}>
              <thead><tr style={{ background: C.navy }}><TableHeader>Story</TableHeader><TableHeader>Taxonomy Dependency</TableHeader><TableHeader>Current Risk</TableHeader><TableHeader>Decision Needed</TableHeader><TableHeader>Owner</TableHeader></tr></thead>
              <tbody>{CURRENT_DEV_STORY_IMPACTS.map((item, index) => <tr key={item.story} style={{ background: item.risk === "Material implementation risk" ? "#fff7ed" : index % 2 ? "#ffffff" : "#f8fafc", borderLeft: item.risk === "Material implementation risk" ? `4px solid ${C.orange}` : "none", borderTop: `1px solid ${C.border}` }}><Cell width="20%"><strong style={{ color: C.purple, fontSize: "12px" }}>{item.story}</strong><div style={{ color: C.navy, fontSize: "10px", fontWeight: 800, lineHeight: 1.4, marginTop: "4px" }}>{item.title}</div></Cell><Cell width="26%">{item.dependency}</Cell><Cell width="13%"><StatusPill status={item.risk} /></Cell><Cell width="25%"><strong style={{ color: C.orange }}>{item.decision}</strong></Cell><Cell width="16%">{item.owner}</Cell></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="taxonomy-ownership" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="4 · RACI-style ownership view" title="Clear responsibility boundaries" description="State and Tax SMEs remain the authority for State business meaning and authoritative mapping decisions. TDC owns the governed data-layer behavior that follows an approved decision." />
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1040px", width: "100%" }}>
              <thead><tr style={{ background: "#1e3a5f" }}><TableHeader>Decision / Responsibility</TableHeader><TableHeader>State / Tax SME</TableHeader><TableHeader>TDC</TableHeader><TableHeader>Orchestrator</TableHeader><TableHeader>Gateway</TableHeader><TableHeader>Roger</TableHeader></tr></thead>
              <tbody>{RESPONSIBILITIES.map((item, index) => <tr key={item.decision} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}` }}><Cell width="26%"><strong style={{ color: C.navy }}>{item.decision}</strong></Cell><Cell width="17%"><strong style={{ color: item.state === "Owner" ? C.teal : C.slate }}>{item.state}</strong></Cell><Cell width="15%"><strong style={{ color: item.tdc === "Owner" ? C.purple : C.slate }}>{item.tdc}</strong></Cell><Cell width="14%">{item.orchestrator}</Cell><Cell width="14%">{item.gateway}</Cell><Cell width="14%">{item.roger}</Cell></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="open-decisions" style={{ marginBottom: "30px" }}>
        <SectionHeading eyebrow="5 · Dependency tracker" title="Open decisions requiring confirmation" description="These decisions are prepopulated for the State taxonomy discussion. Keep the decision and resolution date blank until an accountable owner confirms the outcome." />
        <div style={{ background: "#ffffff", border: `1px solid ${C.border}`, borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: "1230px", width: "100%" }}>
              <thead><tr style={{ background: C.navy }}><TableHeader>ID</TableHeader><TableHeader>Open Decision</TableHeader><TableHeader>Why TDC Needs It</TableHeader><TableHeader>Impacted Story</TableHeader><TableHeader>Owner</TableHeader><TableHeader>Status</TableHeader><TableHeader>Decision</TableHeader><TableHeader>Date Resolved</TableHeader></tr></thead>
              <tbody>{OPEN_DECISIONS.map((item, index) => <tr key={item.id} style={{ background: index % 2 ? "#ffffff" : "#f8fafc", borderTop: `1px solid ${C.border}` }}><Cell width="6%"><strong style={{ color: C.purple }}>{item.id}</strong></Cell><Cell width="22%"><strong style={{ color: C.navy }}>{item.decision}</strong></Cell><Cell width="17%">{item.why}</Cell><Cell width="11%"><span style={{ color: C.purple, fontWeight: 850 }}>{item.stories}</span></Cell><Cell width="13%">{item.owner}</Cell><Cell width="10%"><StatusPill status="Clarification needed" /></Cell><Cell width="16%"><span style={{ color: C.amber, fontStyle: "italic" }}>{OPEN_STATE_CONFIRMATION}</span></Cell><Cell width="5%">—</Cell></tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
