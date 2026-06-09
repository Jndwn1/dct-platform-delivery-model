// Roger ↔ DCT Integration Hub
// BA-led integration command center for all Roger ↔ DCT interactions.
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock,
  Users, FileText, Zap, GitBranch, Shield, ClipboardList, MessageSquare,
} from "lucide-react";

const C = {
  navy: "#003865", navyLt: "#1e3a5f", green: "#059669",
  amber: "#d97706", slate: "#475569",
  slateXl: "#1e293b", bg: "#f8fafc", border: "#e2e8f0", white: "#ffffff",
};

function Chip({ label }: { label: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "Confirmed":                        { bg: "#dcfce7", text: "#15803d" },
    "Requirements Clarified":           { bg: "#dbeafe", text: "#1d4ed8" },
    "DCT Assessment In Progress":       { bg: "#fef9c3", text: "#854d0e" },
    "Design recommendation identified": { bg: "#f5f3ff", text: "#5b21b6" },
    "Business requirement clarified":   { bg: "#dbeafe", text: "#1d4ed8" },
    "Open":                             { bg: "#fef2f2", text: "#991b1b" },
    "Required":                         { bg: "#fff7ed", text: "#9a3412" },
  };
  const s = map[label] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: s.bg, color: s.text, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function Section({ icon, title, badge, defaultOpen = false, children }: {
  icon: React.ReactNode; title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: "10px", marginBottom: "16px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", background: open ? C.navy : C.white, border: "none", cursor: "pointer", textAlign: "left" }}
      >
        <span style={{ color: open ? "rgba(255,255,255,0.8)" : C.navy, fontSize: "16px", flexShrink: 0 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: "14px", fontWeight: 700, color: open ? C.white : C.slateXl }}>{title}</span>
        {badge && (
          <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: open ? "rgba(255,255,255,0.15)" : "#dbeafe", color: open ? "white" : "#1d4ed8" }}>
            {badge}
          </span>
        )}
        {open ? <ChevronUp size={16} color="white" /> : <ChevronDown size={16} color={C.slate} />}
      </button>
      {open && <div style={{ padding: "18px 20px", background: C.white }}>{children}</div>}
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700,
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
  borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
};
const TD: React.CSSProperties = {
  padding: "9px 12px", fontSize: "12px", color: "#1e293b",
  borderBottom: "1px solid #f1f5f9", verticalAlign: "top",
};

const PARTICIPANTS = [
  "Cass Alvarado", "Divya Gaderaju", "Neha Sethi", "Jenniver Stafford",
  "Stephane Lacombe", "Santosh Gokhale", "Nasar Abbas", "Gary Luca",
];

const DISCOVERY_FINDINGS = [
  { finding: "Practitioners can create adjustments",             status: "Confirmed" },
  { finding: "Practitioners can edit adjustments",               status: "Confirmed" },
  { finding: "Practitioners can delete adjustments",             status: "Confirmed" },
  { finding: "Save persists immediately",                        status: "Confirmed" },
  { finding: "Book and Reclass adjustments follow same process", status: "Confirmed" },
  { finding: "Adjustment names and accounts roll forward YOY",   status: "Confirmed" },
  { finding: "Memo intended for practitioner comments",          status: "Confirmed" },
  { finding: "Update existing adjustment expected",              status: "Confirmed" },
  { finding: "Return-level retrieval preferred",                 status: "Confirmed" },
];

const FUNCTIONAL_REQUIREMENTS = [
  "Create Book Adjustment", "Create Reclass Adjustment",
  "Edit Existing Adjustment", "Delete Existing Adjustment",
  "Add/Remove Accounts", "Modify Adjustment Amounts",
  "Modify Adjustment Names", "View Adjustments Across Return",
];
const BUSINESS_RULES = [
  "Adjustments are tax-year aware", "Roll forward only to future years",
  "No prior-year visibility", "Save immediately persists changes",
  "Book/Reclass follow same lifecycle", "Memo represents practitioner commentary",
];
const PERSISTENCE_REQUIREMENTS = [
  "Persist adjustment names", "Persist account associations",
  "Persist debit values", "Persist credit values",
  "Persist edited adjustments", "Persist account additions/removals",
  "Persist memo values",
];

const GAPS = [
  {
    requirement: "Return-Level Retrieval",
    rogerPosition: "Preferred over entity-level retrieval",
    status: "Requirements Clarified",
    dctAssessment: "Determine whether existing APIs support return/client-level retrieval or require enhancement",
    mvpDecision: "Required", owner: "DCT Team",
  },
  {
    requirement: "Unique Adjustment Group ID",
    rogerPosition: "Good practice not to rely solely on description text",
    status: "Design recommendation identified",
    dctAssessment: "Determine whether current grouping approach is sufficient for MVP",
    mvpDecision: "Required", owner: "DCT Team",
  },
  {
    requirement: "Memo Persistence",
    rogerPosition: "Tax user comments should be saved and retrievable",
    status: "Business requirement clarified",
    dctAssessment: "Determine persistence and API support",
    mvpDecision: "Required", owner: "DCT Team",
  },
  {
    requirement: "Update Adjustment Persistence",
    rogerPosition: "Update existing adjustment rather than recreate",
    status: "Business requirement clarified",
    dctAssessment: "Determine whether existing APIs support update operations",
    mvpDecision: "Required", owner: "DCT Team",
  },
];

const ROGER_DEPS  = ["Adjustment UI", "Book Adjustment Story", "Reclass Adjustment Story", "API Consumer Contracts"];
const DCT_DEPS    = ["Adjustments API", "TDC Records API", "Tax Form Line API", "Gateway Integration", "Adjustment Persistence"];
const CROSS_DEPS  = ["Requirements Documentation", "API Contract Alignment", "MVP Prioritization", "Architecture Review"];

const RISKS = [
  { risk: "Requirements not reflected in stories", impact: "Rework and inconsistent implementation", mitigation: "Update requirements artifacts" },
  { risk: "Update API not available",              impact: "Edit functionality cannot be completed",  mitigation: "Technical assessment" },
  { risk: "Memo persistence unsupported",          impact: "Loss of practitioner context",            mitigation: "API enhancement review" },
  { risk: "Return-level retrieval unavailable",    impact: "Performance and scalability concerns",    mitigation: "Evaluate enhancement options" },
  { risk: "MVP scope unclear",                     impact: "Delivery risk",                           mitigation: "Leadership prioritization" },
];

const OPEN_QUESTIONS = [
  "Does existing TDC functionality already support update persistence?",
  "Is return-level retrieval required for MVP?",
  "Is unique adjustment grouping required for MVP?",
  "Should memo persistence be included in MVP?",
  "What technical approach should be used for adjustment grouping?",
];

const ACTION_ITEMS = [
  { action: "Update requirements artifacts with clarified business requirements",  owner: "Roger BA Team",             status: "Open" },
  { action: "Assess existing TDC API capabilities against clarified requirements", owner: "DCT Team",                  status: "Open" },
  { action: "Identify required API enhancements",                                  owner: "DCT Team",                  status: "Open" },
  { action: "Determine MVP vs Post-MVP disposition",                               owner: "Stephane / Santosh / Cass", status: "Open" },
  { action: "Review architecture impacts",                                         owner: "DCT Leads",                 status: "Open" },
];

export default function IntegrationSimulation() {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "28px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitBranch size={18} color="#059669" />
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: C.slateXl, margin: 0, lineHeight: 1 }}>
                Roger ↔ DCT Integration Hub
              </h1>
              <p style={{ fontSize: "11px", color: C.slate, margin: "3px 0 0", fontStyle: "italic" }}>
                Authoritative scope: Integration discovery, dependencies, risks &amp; action tracking ·{" "}
                <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>← Platform Home</a>
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { label: "BA-Led Command Center",         color: C.navy },
              { label: "Roger Edit Reclass Adjustment", color: "#7c3aed" },
              { label: "DCT Assessment In Progress",    color: C.amber },
              { label: "Non-Production Reference",      color: "#92400e" },
            ].map(b => (
              <span key={b.label} style={{ fontSize: "11px", fontWeight: 600, color: "white", background: b.color, borderRadius: "4px", padding: "3px 8px" }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Executive Summary (pinned) ── */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Zap size={16} color="#1d4ed8" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Executive Summary
            </span>
          </div>
          <p style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.7", margin: 0 }}>
            The Roger Edit Reclass Adjustment discussion has moved from requirements clarification into DCT assessment and release planning. Roger business requirements have largely been clarified. Remaining work focuses on determining API support, required enhancements, architecture impacts, and MVP prioritization.
          </p>
        </div>

        {/* ── Section 1: Integration Overview ── */}
        <Section icon={<FileText size={16} />} title="1 · Integration Overview" defaultOpen={true}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            {[
              { label: "Objective",     value: "Track all Roger ↔ DCT integration discussions, requirements clarifications, API assessments, dependency analysis, and implementation decisions." },
              { label: "Current Focus", value: "Roger Edit Reclass Adjustment Screen" },
              { label: "Status",        value: "Requirements Clarified · DCT Assessment In Progress" },
              { label: "Last Updated",  value: today },
            ].map(item => (
              <div key={item.label} style={{ background: C.bg, border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ fontSize: "10px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{item.label}</div>
                <div style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.5" }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={12} /> Participants
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {PARTICIPANTS.map(p => (
                <span key={p} style={{ fontSize: "12px", fontWeight: 600, color: C.navyLt, background: "#dbeafe", padding: "4px 10px", borderRadius: "20px" }}>{p}</span>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Section 2: Problem Statement ── */}
        <Section icon={<AlertTriangle size={16} />} title="2 · Problem Statement" badge="Roger Edit Reclass Adjustment Screen" defaultOpen={true}>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "14px 18px", marginBottom: "14px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "8px" }}>Root Cause</div>
            <p style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.7", margin: 0 }}>
              During DCT review of the Roger Edit Reclass Adjustment screen, the team identified uncertainty regarding how Roger persisted and retrieved Book/Reclass Adjustments. The Roger story primarily contained UI-focused acceptance criteria and did not document the underlying functional requirements, business rules, persistence requirements, API consumer expectations, or data contract requirements.
            </p>
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "14px 18px" }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "8px" }}>Impact</div>
            <p style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.7", margin: 0 }}>
              As a result, DCT could not determine whether existing APIs fully supported the expected Roger workflow or whether additional API enhancements were required. This triggered a requirements clarification effort involving Roger, DCT, and Architecture stakeholders.
            </p>
          </div>
        </Section>

        {/* ── Section 3: Discovery Findings ── */}
        <Section icon={<CheckCircle2 size={16} />} title="3 · Discovery Findings" badge={`${DISCOVERY_FINDINGS.length} Confirmed`}>
          <p style={{ fontSize: "12px", color: C.slate, marginBottom: "12px" }}>All findings confirmed through Roger ↔ DCT requirements clarification sessions.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Finding</th>
                  <th style={{ ...TH, width: "120px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {DISCOVERY_FINDINGS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                    <td style={TD}>{row.finding}</td>
                    <td style={TD}><Chip label={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section 4: Clarified Requirements ── */}
        <Section icon={<ClipboardList size={16} />} title="4 · Clarified Requirements">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            {[
              { title: "Functional Requirements", items: FUNCTIONAL_REQUIREMENTS, accent: C.navy },
              { title: "Business Rules",           items: BUSINESS_RULES,           accent: "#7c3aed" },
              { title: "Persistence Requirements", items: PERSISTENCE_REQUIREMENTS, accent: C.green },
            ].map(group => (
              <div key={group.title} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ background: group.accent, padding: "10px 14px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "white", textTransform: "uppercase", letterSpacing: "0.08em" }}>{group.title}</div>
                </div>
                <div style={{ padding: "12px 14px" }}>
                  {group.items.map(item => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "7px", fontSize: "12px", color: C.slateXl, lineHeight: "1.5" }}>
                      <span style={{ color: group.accent, flexShrink: 0, marginTop: "2px" }}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 5: Outstanding Gaps ── */}
        <Section icon={<AlertTriangle size={16} />} title="5 · Outstanding Gaps Requiring Resolution" badge={`${GAPS.length} Open`}>
          <p style={{ fontSize: "12px", color: C.slate, marginBottom: "12px" }}>All gaps require DCT assessment and MVP disposition decision before implementation can proceed.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Requirement</th>
                  <th style={TH}>Roger Position</th>
                  <th style={TH}>Current Status</th>
                  <th style={TH}>DCT Assessment Required</th>
                  <th style={{ ...TH, width: "100px" }}>MVP Decision</th>
                  <th style={{ ...TH, width: "100px" }}>Owner</th>
                </tr>
              </thead>
              <tbody>
                {GAPS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                    <td style={{ ...TD, fontWeight: 700, color: C.navy }}>{row.requirement}</td>
                    <td style={TD}>{row.rogerPosition}</td>
                    <td style={TD}><Chip label={row.status} /></td>
                    <td style={{ ...TD, color: C.slate }}>{row.dctAssessment}</td>
                    <td style={TD}><Chip label={row.mvpDecision} /></td>
                    <td style={{ ...TD, fontWeight: 600 }}>{row.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section 6: Dependency Analysis ── */}
        <Section icon={<GitBranch size={16} />} title="6 · Dependency Analysis">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
            {[
              { title: "Roger Dependencies",      items: ROGER_DEPS, accent: "#1d4ed8", bg: "#eff6ff" },
              { title: "DCT Dependencies",        items: DCT_DEPS,   accent: C.navy,    bg: "#f0f4ff" },
              { title: "Cross-Team Dependencies", items: CROSS_DEPS, accent: "#7c3aed", bg: "#f5f3ff" },
            ].map(group => (
              <div key={group.title} style={{ background: group.bg, border: `1px solid ${group.accent}30`, borderRadius: "8px", padding: "14px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: group.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>{group.title}</div>
                {group.items.map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "12px", color: C.slateXl }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: group.accent, flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 7: Risk Register ── */}
        <Section icon={<Shield size={16} />} title="7 · Risk Register" badge={`${RISKS.length} Risks`}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Risk</th>
                  <th style={TH}>Impact</th>
                  <th style={TH}>Mitigation</th>
                </tr>
              </thead>
              <tbody>
                {RISKS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                    <td style={{ ...TD, fontWeight: 600, color: "#991b1b" }}>{row.risk}</td>
                    <td style={TD}>{row.impact}</td>
                    <td style={{ ...TD, color: C.green, fontWeight: 600 }}>{row.mitigation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section 8: Open Questions ── */}
        <Section icon={<MessageSquare size={16} />} title="8 · Open Questions" badge={`${OPEN_QUESTIONS.length} Unresolved`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {OPEN_QUESTIONS.map((q, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.amber, color: "white", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, fontSize: "13px", color: C.slateXl, lineHeight: "1.5" }}>{q}</div>
                <Chip label="Open" />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Section 9: Action Items ── */}
        <Section icon={<Clock size={16} />} title="9 · Action Items" badge={`${ACTION_ITEMS.length} Open`}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ ...TH, width: "36px" }}>#</th>
                  <th style={TH}>Action</th>
                  <th style={TH}>Owner</th>
                  <th style={{ ...TH, width: "80px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ACTION_ITEMS.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                    <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, color: C.navy }}>{i + 1}</td>
                    <td style={TD}>{row.action}</td>
                    <td style={{ ...TD, fontWeight: 600 }}>{row.owner}</td>
                    <td style={TD}><Chip label={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Footer ── */}
        <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", color: C.slate }}>
            Roger ↔ DCT Integration Hub · DCT Platform · Non-Production Reference Workspace
          </div>
          <div style={{ fontSize: "11px", color: C.slate }}>Last updated: {today}</div>
        </div>

      </div>
    </div>
  );
}
