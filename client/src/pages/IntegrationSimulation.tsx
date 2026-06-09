// Roger ↔ DCT Integration Hub
// BA-led integration command center with multi-topic tabs, ADO copy, and live decision log.
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, Clock,
  Users, FileText, Zap, GitBranch, Shield, ClipboardList,
  MessageSquare, Copy, Check, Plus, UserCheck, XCircle, Trash2,
} from "lucide-react";

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy: "#003865", navyLt: "#1e3a5f", green: "#059669",
  amber: "#d97706", slate: "#475569", slateXl: "#1e293b",
  bg: "#f8fafc", border: "#e2e8f0", white: "#ffffff",
};

// ── Chip ─────────────────────────────────────────────────────────────────────
function Chip({ label }: { label: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    "Confirmed":                        { bg: "#dcfce7", text: "#15803d" },
    "Requirements Clarified":           { bg: "#dbeafe", text: "#1d4ed8" },
    "DCT Assessment In Progress":       { bg: "#fef9c3", text: "#854d0e" },
    "Design recommendation identified": { bg: "#f5f3ff", text: "#5b21b6" },
    "Business requirement clarified":   { bg: "#dbeafe", text: "#1d4ed8" },
    "Open":    { bg: "#fef2f2", text: "#991b1b" },
    "Required":{ bg: "#fff7ed", text: "#9a3412" },
    "Resolved":{ bg: "#dcfce7", text: "#15803d" },
    "Deferred":{ bg: "#f3f4f6", text: "#374151" },
  };
  const s = map[label] ?? { bg: "#f3f4f6", text: "#374151" };
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px", background: s.bg, color: s.text, whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────
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

// ── Table styles ──────────────────────────────────────────────────────────────
const TH: React.CSSProperties = {
  padding: "8px 12px", textAlign: "left", fontSize: "10px", fontWeight: 700,
  color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em",
  borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
};
const TD: React.CSSProperties = {
  padding: "9px 12px", fontSize: "12px", color: "#1e293b",
  borderBottom: "1px solid #f1f5f9", verticalAlign: "top",
};

// ── ADO Copy Button ───────────────────────────────────────────────────────────
function AdoCopyButton({ action, owner, status, index }: { action: string; owner: string; status: string; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const adoText = [
      `## User Story`,
      `**As a** DCT/Roger integration team member,`,
      `**I want to** ${action.toLowerCase()},`,
      `**So that** the Roger ↔ DCT integration is properly assessed and implemented.`,
      ``,
      `## Acceptance Criteria`,
      `- [ ] ${action} has been completed and verified`,
      `- [ ] Outcome documented in the Roger ↔ DCT Integration Hub`,
      `- [ ] Relevant stakeholders notified of completion`,
      ``,
      `## Details`,
      `**Owner:** ${owner}`,
      `**Status:** ${status}`,
      `**Action Item #:** ${index + 1}`,
      `**Source:** Roger ↔ DCT Integration Hub — Edit Reclass Adjustment Discovery`,
    ].join("\n");

    navigator.clipboard.writeText(adoText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [action, owner, status, index]);

  return (
    <button
      onClick={handleCopy}
      title="Copy as ADO Story"
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "4px 8px", borderRadius: "4px", border: "1px solid #d1d5db",
        background: copied ? "#dcfce7" : C.white, cursor: "pointer",
        fontSize: "10px", fontWeight: 600, color: copied ? "#15803d" : C.slate,
        transition: "all 0.15s",
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copied!" : "ADO"}
    </button>
  );
}

// ── Live Decision Log (Open Questions) ────────────────────────────────────────
const OWNERS = [
  "Jenniver Stafford", "Cass Alvarado", "Divya Gaderaju", "Neha Sethi",
  "Stephane Lacombe", "Santosh Gokhale", "Nasar Abbas", "Gary Luca",
];

function DecisionLog({ topic }: { topic: string }) {
  const utils = trpc.useUtils();
  const { data: questions = [], isLoading } = trpc.integrationHub.getQuestions.useQuery({ topic });
  const addMutation    = trpc.integrationHub.addQuestion.useMutation({ onSuccess: () => utils.integrationHub.getQuestions.invalidate() });
  const resolveMutation= trpc.integrationHub.resolveQuestion.useMutation({ onSuccess: () => utils.integrationHub.getQuestions.invalidate() });
  const deferMutation  = trpc.integrationHub.deferQuestion.useMutation({ onSuccess: () => utils.integrationHub.getQuestions.invalidate() });
  const assignMutation = trpc.integrationHub.assignQuestion.useMutation({ onSuccess: () => utils.integrationHub.getQuestions.invalidate() });
  const deleteMutation = trpc.integrationHub.deleteQuestion.useMutation({ onSuccess: () => utils.integrationHub.getQuestions.invalidate() });

  const [newQ, setNewQ] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [resolveId, setResolveId] = useState<number | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");

  const openCount = questions.filter(q => q.status === "open").length;
  const resolvedCount = questions.filter(q => q.status === "resolved").length;

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { label: "Open",     value: openCount,     color: "#991b1b", bg: "#fef2f2" },
          { label: "Resolved", value: resolvedCount, color: "#15803d", bg: "#dcfce7" },
          { label: "Deferred", value: questions.filter(q => q.status === "deferred").length, color: "#374151", bg: "#f3f4f6" },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}30`, borderRadius: "8px", padding: "8px 14px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: C.slate }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Questions list */}
      {isLoading ? (
        <div style={{ fontSize: "13px", color: C.slate, padding: "12px" }}>Loading decision log…</div>
      ) : questions.length === 0 ? (
        <div style={{ fontSize: "13px", color: C.slate, padding: "12px", background: C.bg, borderRadius: "8px", textAlign: "center" }}>
          No questions logged yet. Add the first one below.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{
              background: q.status === "resolved" ? "#f0fdf4" : q.status === "deferred" ? "#f9fafb" : "#fffbeb",
              border: `1px solid ${q.status === "resolved" ? "#bbf7d0" : q.status === "deferred" ? "#e5e7eb" : "#fde68a"}`,
              borderRadius: "8px", padding: "12px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: C.amber, color: "white", fontSize: "11px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.5", marginBottom: "6px" }}>{q.question}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <Chip label={q.status === "open" ? "Open" : q.status === "resolved" ? "Resolved" : "Deferred"} />
                    {q.owner && (
                      <span style={{ fontSize: "11px", color: C.slate, fontWeight: 600 }}>Owner: {q.owner}</span>
                    )}
                    {q.resolvedAt && (
                      <span style={{ fontSize: "10px", color: "#6b7280" }}>
                        Resolved: {new Date(q.resolvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {q.notes && (
                      <span style={{ fontSize: "11px", color: "#065f46", fontStyle: "italic" }}>"{q.notes}"</span>
                    )}
                  </div>
                </div>
                {/* Action buttons */}
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  {q.status === "open" && (
                    <>
                      <button
                        onClick={() => setResolveId(q.id)}
                        title="Mark Resolved"
                        style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid #bbf7d0", background: "#f0fdf4", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <CheckCircle2 size={13} color="#15803d" />
                      </button>
                      <button
                        onClick={() => deferMutation.mutate({ id: q.id })}
                        title="Defer"
                        style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", display: "flex", alignItems: "center" }}
                      >
                        <Clock size={13} color="#6b7280" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ id: q.id })}
                    title="Delete"
                    style={{ padding: "4px 6px", borderRadius: "4px", border: "1px solid #fecaca", background: "#fef2f2", cursor: "pointer", display: "flex", alignItems: "center" }}
                  >
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>
              </div>

              {/* Assign owner inline */}
              {q.status === "open" && !q.owner && (
                <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <UserCheck size={12} color={C.slate} />
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) assignMutation.mutate({ id: q.id, owner: e.target.value }); }}
                    style={{ fontSize: "11px", padding: "3px 6px", borderRadius: "4px", border: "1px solid #d1d5db", color: C.slate, background: C.white }}
                  >
                    <option value="" disabled>Assign owner…</option>
                    {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              )}

              {/* Resolve modal inline */}
              {resolveId === q.id && (
                <div style={{ marginTop: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#15803d", marginBottom: "6px" }}>Resolution notes (optional)</div>
                  <textarea
                    value={resolveNotes}
                    onChange={e => setResolveNotes(e.target.value)}
                    placeholder="Describe how this was resolved…"
                    rows={2}
                    style={{ width: "100%", fontSize: "12px", padding: "6px 8px", borderRadius: "4px", border: "1px solid #bbf7d0", resize: "vertical", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                    <button
                      onClick={() => { resolveMutation.mutate({ id: q.id, notes: resolveNotes || undefined }); setResolveId(null); setResolveNotes(""); }}
                      style={{ fontSize: "11px", fontWeight: 700, padding: "4px 12px", borderRadius: "4px", border: "none", background: "#15803d", color: "white", cursor: "pointer" }}
                    >
                      Confirm Resolved
                    </button>
                    <button
                      onClick={() => { setResolveId(null); setResolveNotes(""); }}
                      style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "4px", border: "1px solid #d1d5db", background: C.white, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new question */}
      <div style={{ background: C.bg, border: "1px solid #e2e8f0", borderRadius: "8px", padding: "14px 16px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={12} /> Add New Question
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            value={newQ}
            onChange={e => setNewQ(e.target.value)}
            placeholder="Enter an open question…"
            style={{ flex: "1 1 300px", fontSize: "12px", padding: "7px 10px", borderRadius: "4px", border: "1px solid #d1d5db", fontFamily: "inherit" }}
            onKeyDown={e => { if (e.key === "Enter" && newQ.trim()) { addMutation.mutate({ topic, question: newQ.trim(), owner: newOwner || undefined }); setNewQ(""); setNewOwner(""); } }}
          />
          <select
            value={newOwner}
            onChange={e => setNewOwner(e.target.value)}
            style={{ fontSize: "12px", padding: "7px 10px", borderRadius: "4px", border: "1px solid #d1d5db", color: C.slate, background: C.white, minWidth: "160px" }}
          >
            <option value="">Assign owner (optional)</option>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <button
            onClick={() => { if (newQ.trim()) { addMutation.mutate({ topic, question: newQ.trim(), owner: newOwner || undefined }); setNewQ(""); setNewOwner(""); } }}
            disabled={!newQ.trim() || addMutation.isPending}
            style={{ fontSize: "12px", fontWeight: 700, padding: "7px 16px", borderRadius: "4px", border: "none", background: newQ.trim() ? C.navy : "#d1d5db", color: "white", cursor: newQ.trim() ? "pointer" : "not-allowed" }}
          >
            {addMutation.isPending ? "Adding…" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Topic data ────────────────────────────────────────────────────────────────
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
  { requirement: "Return-Level Retrieval", rogerPosition: "Preferred over entity-level retrieval", status: "Requirements Clarified", dctAssessment: "Determine whether existing APIs support return/client-level retrieval or require enhancement", mvpDecision: "Required", owner: "DCT Team" },
  { requirement: "Unique Adjustment Group ID", rogerPosition: "Good practice not to rely solely on description text", status: "Design recommendation identified", dctAssessment: "Determine whether current grouping approach is sufficient for MVP", mvpDecision: "Required", owner: "DCT Team" },
  { requirement: "Memo Persistence", rogerPosition: "Tax user comments should be saved and retrievable", status: "Business requirement clarified", dctAssessment: "Determine persistence and API support", mvpDecision: "Required", owner: "DCT Team" },
  { requirement: "Update Adjustment Persistence", rogerPosition: "Update existing adjustment rather than recreate", status: "Business requirement clarified", dctAssessment: "Determine whether existing APIs support update operations", mvpDecision: "Required", owner: "DCT Team" },
];

const RISKS_RECLASS = [
  { risk: "Requirements not reflected in stories", impact: "Rework and inconsistent implementation", mitigation: "Update requirements artifacts" },
  { risk: "Update API not available",              impact: "Edit functionality cannot be completed",  mitigation: "Technical assessment" },
  { risk: "Memo persistence unsupported",          impact: "Loss of practitioner context",            mitigation: "API enhancement review" },
  { risk: "Return-level retrieval unavailable",    impact: "Performance and scalability concerns",    mitigation: "Evaluate enhancement options" },
  { risk: "MVP scope unclear",                     impact: "Delivery risk",                           mitigation: "Leadership prioritization" },
];

const ACTION_ITEMS_RECLASS = [
  { action: "Update requirements artifacts with clarified business requirements",  owner: "Roger BA Team",             status: "Open" },
  { action: "Assess existing TDC API capabilities against clarified requirements", owner: "DCT Team",                  status: "Open" },
  { action: "Identify required API enhancements",                                  owner: "DCT Team",                  status: "Open" },
  { action: "Determine MVP vs Post-MVP disposition",                               owner: "Stephane / Santosh / Cass", status: "Open" },
  { action: "Review architecture impacts",                                         owner: "DCT Leads",                 status: "Open" },
];

// Known Mappings topic data
const KM_DISCOVERY = [
  { finding: "Known Mappings API returns entity-level data only",         status: "Confirmed" },
  { finding: "Roger expects return-level aggregation from Known Mappings",status: "Confirmed" },
  { finding: "Gary Luca owns the Known Mappings API endpoint",            status: "Confirmed" },
  { finding: "Current API response schema does not match Roger contract", status: "Confirmed" },
  { finding: "Defect logged in ADO backlog",                              status: "Confirmed" },
];

const KM_GAPS = [
  { requirement: "Return-Level Aggregation", rogerPosition: "Roger consumes return-level mapping data", status: "DCT Assessment In Progress", dctAssessment: "Determine whether API can be enhanced to support return-level aggregation", mvpDecision: "Required", owner: "Gary Luca" },
  { requirement: "Response Schema Alignment", rogerPosition: "Roger contract expects specific field names", status: "DCT Assessment In Progress", dctAssessment: "Map current API response fields to Roger contract fields and identify gaps", mvpDecision: "Required", owner: "Nasar Abbas" },
];

const RISKS_KM = [
  { risk: "API schema mismatch blocks Roger integration",      impact: "Roger cannot consume Known Mappings data",       mitigation: "Schema alignment sprint" },
  { risk: "Return-level aggregation requires new API version", impact: "Delivery delay for Known Mappings feature",      mitigation: "API versioning assessment" },
  { risk: "Defect resolution timeline unknown",                impact: "Roger PI planning dependency not resolved",      mitigation: "Escalate to Stephane / Santosh" },
];

const ACTION_ITEMS_KM = [
  { action: "Gary Luca to provide updated API schema with return-level support", owner: "Gary Luca",    status: "Open" },
  { action: "Nasar Abbas to validate Roger contract against updated schema",     owner: "Nasar Abbas",  status: "Open" },
  { action: "Jenniver to update ADO defect with resolution timeline",            owner: "Jenniver Stafford", status: "Open" },
  { action: "Architecture review of Known Mappings API enhancement options",     owner: "DCT Leads",    status: "Open" },
];

// ── Topic tab content ─────────────────────────────────────────────────────────
function ReclassContent() {
  return (
    <>
      <Section icon={<CheckCircle2 size={16} />} title="3 · Discovery Findings" badge={`${DISCOVERY_FINDINGS.length} Confirmed`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={TH}>Finding</th><th style={{ ...TH, width: "140px" }}>Status</th></tr></thead>
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

      <Section icon={<ClipboardList size={16} />} title="4 · Clarified Requirements">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
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

      <Section icon={<AlertTriangle size={16} />} title="5 · Outstanding Gaps" badge={`${GAPS.length} Open`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Requirement</th>
                <th style={TH}>Roger Position</th>
                <th style={TH}>Status</th>
                <th style={TH}>DCT Assessment Required</th>
                <th style={{ ...TH, width: "90px" }}>MVP</th>
                <th style={{ ...TH, width: "90px" }}>Owner</th>
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

      <Section icon={<Shield size={16} />} title="6 · Risk Register" badge={`${RISKS_RECLASS.length} Risks`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={TH}>Risk</th><th style={TH}>Impact</th><th style={TH}>Mitigation</th></tr></thead>
            <tbody>
              {RISKS_RECLASS.map((row, i) => (
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

      <Section icon={<MessageSquare size={16} />} title="7 · Open Questions — Decision Log" defaultOpen>
        <DecisionLog topic="reclass" />
      </Section>

      <Section icon={<Clock size={16} />} title="8 · Action Items" badge={`${ACTION_ITEMS_RECLASS.length} Open`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: "36px" }}>#</th>
                <th style={TH}>Action</th>
                <th style={TH}>Owner</th>
                <th style={{ ...TH, width: "80px" }}>Status</th>
                <th style={{ ...TH, width: "70px" }}>ADO</th>
              </tr>
            </thead>
            <tbody>
              {ACTION_ITEMS_RECLASS.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                  <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, color: C.navy }}>{i + 1}</td>
                  <td style={TD}>{row.action}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{row.owner}</td>
                  <td style={TD}><Chip label={row.status} /></td>
                  <td style={TD}><AdoCopyButton action={row.action} owner={row.owner} status={row.status} index={i} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

function KnownMappingsContent() {
  return (
    <>
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "14px 18px", marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#991b1b", marginBottom: "6px" }}>Active Defect</div>
        <p style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.7", margin: 0 }}>
          The Known Mappings API (owned by Gary Luca) returns entity-level data only. Roger expects return-level aggregation. The response schema does not match the Roger consumer contract. This defect is logged in ADO and is blocking the Known Mappings integration milestone.
        </p>
      </div>

      <Section icon={<CheckCircle2 size={16} />} title="3 · Discovery Findings" badge={`${KM_DISCOVERY.length} Confirmed`} defaultOpen>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={TH}>Finding</th><th style={{ ...TH, width: "140px" }}>Status</th></tr></thead>
            <tbody>
              {KM_DISCOVERY.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                  <td style={TD}>{row.finding}</td>
                  <td style={TD}><Chip label={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section icon={<AlertTriangle size={16} />} title="4 · Outstanding Gaps" badge={`${KM_GAPS.length} Open`} defaultOpen>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Requirement</th>
                <th style={TH}>Roger Position</th>
                <th style={TH}>Status</th>
                <th style={TH}>DCT Assessment Required</th>
                <th style={{ ...TH, width: "90px" }}>MVP</th>
                <th style={{ ...TH, width: "90px" }}>Owner</th>
              </tr>
            </thead>
            <tbody>
              {KM_GAPS.map((row, i) => (
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

      <Section icon={<Shield size={16} />} title="5 · Risk Register" badge={`${RISKS_KM.length} Risks`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th style={TH}>Risk</th><th style={TH}>Impact</th><th style={TH}>Mitigation</th></tr></thead>
            <tbody>
              {RISKS_KM.map((row, i) => (
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

      <Section icon={<MessageSquare size={16} />} title="6 · Open Questions — Decision Log" defaultOpen>
        <DecisionLog topic="known-mappings" />
      </Section>

      <Section icon={<Clock size={16} />} title="7 · Action Items" badge={`${ACTION_ITEMS_KM.length} Open`}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, width: "36px" }}>#</th>
                <th style={TH}>Action</th>
                <th style={TH}>Owner</th>
                <th style={{ ...TH, width: "80px" }}>Status</th>
                <th style={{ ...TH, width: "70px" }}>ADO</th>
              </tr>
            </thead>
            <tbody>
              {ACTION_ITEMS_KM.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? C.white : C.bg }}>
                  <td style={{ ...TD, fontFamily: "monospace", fontWeight: 700, color: C.navy }}>{i + 1}</td>
                  <td style={TD}>{row.action}</td>
                  <td style={{ ...TD, fontWeight: 600 }}>{row.owner}</td>
                  <td style={TD}><Chip label={row.status} /></td>
                  <td style={TD}><AdoCopyButton action={row.action} owner={row.owner} status={row.status} index={i} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "reclass",        label: "Edit Reclass Adjustment",  badge: "Requirements Clarified" },
  { id: "known-mappings", label: "Known Mappings API Defect", badge: "Active Defect" },
];

export default function IntegrationSimulation() {
  const [activeTopic, setActiveTopic] = useState("reclass");
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: C.bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Page header ── */}
        <div style={{ marginBottom: "24px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GitBranch size={18} color="#059669" />
            </div>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: C.slateXl, margin: 0, lineHeight: 1 }}>
                Roger ↔ DCT Integration Hub
              </h1>
              <p style={{ fontSize: "11px", color: C.slate, margin: "3px 0 0", fontStyle: "italic" }}>
                Authoritative scope: Integration discovery, dependencies, risks &amp; decision tracking ·{" "}
                <a href="/" style={{ color: "#2563eb", textDecoration: "underline" }}>← Platform Home</a>
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
            {[
              { label: "BA-Led Command Center",      color: C.navy },
              { label: "Live Decision Log",          color: C.green },
              { label: "ADO Story Export",           color: "#7c3aed" },
              { label: "Non-Production Reference",   color: "#92400e" },
            ].map(b => (
              <span key={b.label} style={{ fontSize: "11px", fontWeight: 600, color: "white", background: b.color, borderRadius: "4px", padding: "3px 8px" }}>
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Executive Summary ── */}
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <Zap size={16} color="#1d4ed8" />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em" }}>Executive Summary</span>
          </div>
          <p style={{ fontSize: "13px", color: C.slateXl, lineHeight: "1.7", margin: 0 }}>
            This hub tracks all active Roger ↔ DCT integration threads. The <strong>Edit Reclass Adjustment</strong> thread has moved from requirements clarification into DCT API assessment and MVP prioritization. The <strong>Known Mappings API Defect</strong> thread is active — the existing API returns entity-level data only and does not match the Roger consumer contract. Both threads require DCT assessment and architecture review before implementation can proceed.
          </p>
        </div>

        {/* ── Shared: Integration Overview ── */}
        <Section icon={<FileText size={16} />} title="1 · Integration Overview" defaultOpen>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            {[
              { label: "Objective",     value: "Track all Roger ↔ DCT integration discussions, requirements clarifications, API assessments, dependency analysis, and implementation decisions." },
              { label: "Active Threads",value: `${TOPICS.length} integration topics` },
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

        {/* ── Topic Tabs ── */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.slate, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
            2 · Integration Thread
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {TOPICS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTopic(t.id)}
                style={{
                  padding: "10px 18px", borderRadius: "8px", border: "none", cursor: "pointer",
                  background: activeTopic === t.id ? C.navy : C.white,
                  color: activeTopic === t.id ? "white" : C.slateXl,
                  fontWeight: 700, fontSize: "13px",
                  boxShadow: activeTopic === t.id ? "0 2px 8px rgba(0,56,101,0.3)" : "0 1px 3px rgba(0,0,0,0.08)",
                  display: "flex", alignItems: "center", gap: "8px",
                }}
              >
                {t.label}
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
                  background: activeTopic === t.id ? "rgba(255,255,255,0.2)" : "#fee2e2",
                  color: activeTopic === t.id ? "white" : "#991b1b",
                }}>
                  {t.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Active topic content ── */}
        {activeTopic === "reclass" ? <ReclassContent /> : <KnownMappingsContent />}

        {/* ── Footer ── */}
        <div style={{ marginTop: "32px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", color: C.slate }}>Roger ↔ DCT Integration Hub · DCT Platform · Non-Production Reference Workspace</div>
          <div style={{ fontSize: "11px", color: C.slate }}>Last updated: {today}</div>
        </div>

      </div>
    </div>
  );
}
