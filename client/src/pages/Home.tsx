// DCT Delivery Model — Authoritative Platform Anchor Page
// RSM | CATT | DCT + Roger
// Design: RSM Deep Navy headers, RSM Green for success/insight, slate for neutral
// 9-section structure: Purpose → Flow → Ownership → Batches → Invariants → Enables → NOT → Roger → Failure Modes

import { Link } from "wouter";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, children, accent }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: "blue" | "green" | "red" | "amber" | "slate";
}) {
  const accentMap: Record<string, string> = {
    blue:  "#1e3a5f",
    green: "#065f46",
    red:   "#7f1d1d",
    amber: "#78350f",
    slate: "#1e293b",
  };
  const borderColor = accentMap[accent ?? "slate"];
  return (
    <div style={{ marginBottom: "32px" }}>
      <div style={{
        borderLeft: `4px solid ${borderColor}`,
        paddingLeft: "14px",
        marginBottom: "16px",
      }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", marginBottom: "2px" }}>
          {subtitle}
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Flow node ────────────────────────────────────────────────────────────────
function FlowNode({ label, owner, color, isGap }: { label: string; owner: string; color: string; isGap?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: "110px" }}>
      <div style={{
        backgroundColor: isGap ? "#fef2f2" : color,
        border: `2px solid ${isGap ? "#ef4444" : color}`,
        borderRadius: "8px",
        padding: "10px 14px",
        textAlign: "center",
        width: "100%",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: isGap ? "#dc2626" : "white", lineHeight: "1.3" }}>{label}</div>
      </div>
      <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600, letterSpacing: "0.05em" }}>{owner}</div>
    </div>
  );
}

function FlowArrow({ broken }: { broken?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "2px" }}>
      <div style={{ fontSize: "18px", color: broken ? "#ef4444" : "#94a3b8", lineHeight: 1 }}>
        {broken ? "✕" : "→"}
      </div>
    </div>
  );
}

// ─── Invariant card ───────────────────────────────────────────────────────────
function InvariantCard({ index, text }: { index: number; text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "12px",
      backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
      borderRadius: "8px", padding: "12px 14px",
    }}>
      <div style={{
        width: "24px", height: "24px", borderRadius: "50%",
        backgroundColor: "#059669", color: "white",
        fontSize: "11px", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {index}
      </div>
      <div style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Failure mode card ────────────────────────────────────────────────────────
function FailureCard({ text }: { text: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      backgroundColor: "#fef2f2", border: "1px solid #fecaca",
      borderRadius: "8px", padding: "10px 14px",
    }}>
      <div style={{ color: "#dc2626", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>⚠</div>
      <div style={{ fontSize: "13px", color: "#7f1d1d", lineHeight: "1.5" }}>{text}</div>
    </div>
  );
}

// ─── Batch row ────────────────────────────────────────────────────────────────
function BatchRow({ id, name, scope, note }: { id: string; name: string; scope: string; note?: string }) {
  const isActive = ["FC", "1", "2", "2A"].includes(id);
  const isCommitted = ["3", "4", "5", "6", "7", "8"].includes(id);
  const badgeColor = isActive ? "#059669" : isCommitted ? "#2563eb" : "#64748b";
  const badgeLabel = isActive ? "Active" : isCommitted ? "PI 2" : "Stretch";
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "60px 1fr 1fr auto",
      gap: "12px", alignItems: "start",
      padding: "10px 14px",
      borderBottom: "1px solid #f1f5f9",
      fontSize: "13px",
    }}>
      <div style={{
        fontWeight: 700, color: "#0f1623",
        backgroundColor: "#e2e8f0", borderRadius: "4px",
        padding: "2px 6px", textAlign: "center", fontSize: "11px",
      }}>{id}</div>
      <div style={{ color: "#1e293b", fontWeight: 600 }}>{name}</div>
      <div style={{ color: "#475569" }}>{scope}</div>
      <div style={{
        fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
        color: badgeColor, whiteSpace: "nowrap",
      }}>{badgeLabel}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "32px", borderBottom: "2px solid #e2e8f0", paddingBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#059669", fontWeight: 900, fontSize: "16px",
          }}>D</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: 0, lineHeight: 1 }}>
              DCT Delivery Model
            </h1>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              RSM · CATT · Data Consolidation Team · Platform Source of Truth
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Batches 1–8 Active", color: "#059669" },
            { label: "API-First Architecture", color: "#2563eb" },
            { label: "Governed AI Integration", color: "#7c3aed" },
            { label: "Roger Read-Only", color: "#0f1623" },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: "11px", fontWeight: 600, color: "white",
              backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px",
            }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* ── 1. Purpose ── */}
      <Section title="Purpose" subtitle="Section 1" accent="blue">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            DCT is a <strong>governed, batch-driven delivery model</strong> that structures how financial data is ingested,
            normalized, classified, and made available for tax decision-making across RSM's enterprise platform.
          </p>
          <p style={{ margin: "0 0 10px", fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            It enforces a <strong>strict separation of concerns</strong> between financial data (PDC), tax decisions (TDC),
            AI orchestration (Orchestrator), and practitioner consumption (Roger) — ensuring no system owns
            responsibilities outside its defined boundary.
          </p>
          <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>
            The result is <strong>deterministic, traceable, API-driven outcomes</strong> that can be audited, replayed,
            and trusted at every layer of the platform.
          </p>
        </div>
      </Section>

      {/* ── 2. End-to-End Flow ── */}
      <Section title="End-to-End Delivery Model" subtitle="Section 2 — Critical Visual" accent="blue">
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "20px 24px",
          overflowX: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "700px" }}>
            <FlowNode label="Tax Portal" owner="Ingestion" color="#334155" />
            <FlowArrow />
            <FlowNode label="Service Bus" owner="Event Trigger" color="#475569" />
            <FlowArrow />
            <FlowNode label="PDC" owner="Financial Data" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="Orchestrator" owner="Stateless AI" color="#7c3aed" />
            <FlowArrow />
            <FlowNode label="PDC (Classified)" owner="Normalized + FirmTaxonomyId" color="#1e3a5f" />
            <FlowArrow />
            <FlowNode label="TDC" owner="Tax Decisions" color="#065f46" />
            <FlowArrow />
            <FlowNode label="Roger" owner="Read-Only UI" color="#0f1623" />
          </div>
          <div style={{ marginTop: "14px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {[
              { color: "#1e3a5f", label: "PDC (Phoenix Data Consolidation) — Financial truth, lineage anchor" },
              { color: "#7c3aed", label: "Orchestrator — Stateless, no persistence" },
              { color: "#065f46", label: "TDC (Tax Data Consolidation) — Tax decisions, immutable" },
              { color: "#0f1623", label: "Roger — Read-only, no writes" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "#475569" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 3. System Ownership ── */}
      <Section title="System Ownership Model" subtitle="Section 3 — No Overlapping Ownership" accent="blue">
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
            backgroundColor: "#0f1623", padding: "10px 16px", gap: "12px",
          }}>
            {["Layer", "System", "Responsibility"].map(h => (
              <div key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          {[
            { layer: "Ingestion",      system: "Tax Portal",      resp: "File intake, event trigger via Service Bus. Assigns DocumentId at boundary." },
            { layer: "Data Foundation",system: "PDC",             resp: "Financial data storage, lineage anchor (DocumentId), normalization, classification storage. System of record for financial truth." },
            { layer: "Orchestration",  system: "AI Orchestrator", resp: "Stateless processing only. Applies taxonomy rules and returns FirmTaxonomyId. No persistence, no ownership of data." },
            { layer: "Tax Decision",   system: "TDC",             resp: "Tax mapping, adjustments, tax-ready record derivation, eligibility. System of record for all tax decisions. Immutable audit trail." },
            { layer: "Consumption",    system: "Roger",           resp: "Read-only practitioner UI. Reads from TDC primary contract only. No writes, no transformations." },
          ].map((row, i) => (
            <div key={row.layer} style={{
              display: "grid", gridTemplateColumns: "1fr 1fr 2fr",
              gap: "12px", padding: "12px 16px",
              backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8fafc",
              borderTop: "1px solid #f1f5f9",
              fontSize: "13px",
            }}>
              <div style={{ fontWeight: 700, color: "#0f1623" }}>{row.layer}</div>
              <div style={{ fontWeight: 600, color: "#2563eb" }}>{row.system}</div>
              <div style={{ color: "#475569", lineHeight: "1.5" }}>{row.resp}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. Batch Model Overview ── */}
      <Section title="Batch Model Overview" subtitle="Section 4 — Delivery Units" accent="blue">
        <div style={{ marginBottom: "12px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
          The platform is delivered through <strong>architectural batches</strong> — each batch is both a delivery unit
          and a demo unit. Batches may run in parallel within a PI but must satisfy gate conditions before the next
          dependent batch begins. Sequential batches enforce lineage and contract integrity.
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "60px 1fr 1fr auto",
            gap: "12px", backgroundColor: "#0f1623", padding: "10px 14px",
          }}>
            {["ID", "Batch Name", "Scope", "Status"].map(h => (
              <div key={h} style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>
          <BatchRow id="FC"  name="Foundation Core"                                  scope="Infrastructure, repo, templates, agent config" />
          <BatchRow id="1"   name="File Ingestion & Initial Storage"                 scope="IngestionJob, DocumentId, lineage anchor, audit_log" />
          <BatchRow id="2"   name="Normalization & Cross-LOB Taxonomy"               scope="vNormalizedTb, EntityId, PeriodStart/PeriodEnd, XLOB taxonomy" />
          <BatchRow id="2A"  name="Orchestrator Contract Enforcement & Classification" scope="FirmTaxonomyId required, ClassificationStatus, rejection on missing classification" />
          <BatchRow id="3"   name="Tax Domain Authority & Tax Taxonomy"              scope="TDC reference data, tax form templates, mapping rules" />
          <BatchRow id="4"   name="AI Tax Mapping & Explainability"                  scope="MappingProposal, ConfidenceBand, MappingDecision (immutable)" />
          <BatchRow id="5"   name="Entity Identity & Structure"                      scope="ClientGroupId, EntityId hierarchy, RBAC context, DataSourceType" />
          <BatchRow id="6"   name="Practitioner Review, Adjustments & Lock"          scope="AdjustmentRecord, TaxReadyRecord (locked), ReviewTask, SignOff" />
          <BatchRow id="7"   name="Client Tax Profile & Eligibility"                 scope="TaxProfile, EligibilityDetermination, three-tier eligibility model" />
          <BatchRow id="8"   name="Exceptions & Remediation"                         scope="ExceptionRecord, RemedyAction, re-ingestion triggers, audit trail" />
        </div>
        <div style={{ marginTop: "10px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { color: "#059669", label: "Active (PI 1 Complete)" },
            { color: "#2563eb", label: "PI 2 Committed" },
          ].map(l => (
            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: l.color }} />
              <span style={{ fontSize: "11px", color: "#475569" }}>{l.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 5. Foundation Invariants ── */}
      <Section title="What Must Be True — Foundation Invariants" subtitle="Section 5 — Non-Negotiable Rules" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            "All data must enter through a governed ingestion boundary — no direct system writes.",
            "Every file must be assigned a DocumentId at ingestion. DocumentId is immutable.",
            "DocumentId is the lineage anchor across all systems — PDC, TDC, and Roger.",
            "Data is scoped using EntityId + PeriodStart + PeriodEnd. TaxYear is derived in TDC only — not stored in PDC.",
            "PDC is the system of record for financial data and lineage. No other system may own financial truth.",
            "TDC is the system of record for all tax decisions. Decisions are immutable once locked.",
            "The Orchestrator is stateless. It must not persist data, own records, or hold state between calls.",
            "All system interactions must occur via APIs only. No direct system coupling is permitted.",
          ].map((text, i) => (
            <InvariantCard key={i} index={i + 1} text={text} />
          ))}
        </div>
      </Section>

      {/* ── 6. What This Enables ── */}
      <Section title="What This Enables" subtitle="Section 6 — Platform Capabilities" accent="green">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {[
            { icon: "⟳", title: "Deterministic Processing", desc: "Same input always produces the same output. Results are reproducible and auditable." },
            { icon: "⌥", title: "Full Lineage & Traceability", desc: "Every record traces back to its DocumentId origin through all system layers." },
            { icon: "⟷", title: "Cross-System Interoperability", desc: "PDC ↔ TDC ↔ Roger communicate exclusively through governed API contracts." },
            { icon: "◈", title: "Governed AI Integration", desc: "Orchestrator operates within strict stateless boundaries — AI cannot own or persist data." },
            { icon: "⬡", title: "API-First Architecture", desc: "All data access is contract-driven. No system bypasses the API layer." },
            { icon: "▦", title: "Safe Parallel Development", desc: "Batches can run in parallel within a PI because ownership boundaries prevent conflicts." },
          ].map(c => (
            <div key={c.title} style={{
              backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{c.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46", marginBottom: "4px" }}>{c.title}</div>
              <div style={{ fontSize: "12px", color: "#374151", lineHeight: "1.5" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 7. What This Is NOT ── */}
      <Section title="What This Is NOT" subtitle="Section 7 — Guardrails" accent="amber">
        <div style={{
          backgroundColor: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: "8px", padding: "16px 20px",
        }}>
          <div style={{ marginBottom: "10px", fontSize: "13px", color: "#78350f", fontWeight: 600 }}>
            The following responsibilities are explicitly outside the scope of the DCT Delivery Model:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              "Not a UI layer — Roger is the UI layer, not DCT.",
              "Not a transformation engine — PDC normalizes; it does not transform for tax purposes.",
              "Not a taxonomy definition system — TDC owns taxonomy; PDC stores the result.",
              "Not a workflow engine — Review and approval workflows are Batch 6 scope, not platform scope.",
              "Not responsible for tax calculations — TDC derives tax-ready records; it does not calculate tax liability.",
              "Not a reporting layer — Roger reads and presents; it does not aggregate or compute.",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#92400e", lineHeight: "1.5",
              }}>
                <span style={{ color: "#d97706", flexShrink: 0, marginTop: "1px" }}>✕</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 8. Roger Connection ── */}
      <Section title="How This Connects to Roger" subtitle="Section 8 — Consumption Layer" accent="slate">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>Roger's Contract Rules</div>
            {[
              "Roger reads exclusively from TDC — the primary contract. No direct PDC reads.",
              "Roger does not write, transform, or persist data. It is read-only at all times.",
              "Without TDC APIs, Roger cannot function. TDC is a hard dependency.",
              "Roger reflects mapping status in real time: GREEN (accepted), YELLOW (pending), RED (override or exception).",
            ].map((text, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: "8px",
                fontSize: "13px", color: "#334155", lineHeight: "1.5",
                marginBottom: "8px",
              }}>
                <span style={{ color: "#059669", flexShrink: 0, marginTop: "1px" }}>✓</span>
                {text}
              </div>
            ))}
          </div>
          <div style={{
            backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f1623", marginBottom: "10px" }}>What Roger Reflects</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Mapping Status",  value: "GREEN / YELLOW / RED per canonical account",   color: "#059669" },
                { label: "Decisions",       value: "Accepted / Overridden / Pending per TDC record", color: "#2563eb" },
                { label: "Entity Context",  value: "ClientGroupId + EntityId + PeriodStart/End",     color: "#7c3aed" },
                { label: "Tax-Ready State", value: "Locked TaxReadyRecord from Batch 6 TDC",         color: "#065f46" },
              ].map(row => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  gap: "8px", fontSize: "12px", borderBottom: "1px solid #f1f5f9", paddingBottom: "6px",
                }}>
                  <span style={{ fontWeight: 700, color: row.color, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ color: "#475569", textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", padding: "8px 10px", backgroundColor: "#fef2f2", borderRadius: "6px", fontSize: "12px", color: "#7f1d1d", fontWeight: 600 }}>
              ⚠ If TDC APIs are not published, Roger has no data to display.
            </div>
          </div>
        </div>
      </Section>

      {/* ── 9. Failure Modes ── */}
      <Section title="Failure Modes" subtitle="Section 9 — If This Model Is Not Enforced" accent="red">
        <div style={{ marginBottom: "10px", fontSize: "13px", color: "#7f1d1d", fontWeight: 600 }}>
          The following failures occur when DCT governance rules are bypassed or not enforced:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {[
            "Data loses lineage and traceability — DocumentId is no longer a reliable anchor.",
            "Classification becomes inconsistent — FirmTaxonomyId is missing or unreliable across records.",
            "Systems duplicate logic — PDC and TDC both attempt tax derivation, creating conflicts.",
            "APIs become unreliable — contracts diverge from actual data, breaking Roger and downstream consumers.",
            "Roger cannot present trusted outputs — mapping status and decisions are stale or incorrect.",
            "AI becomes non-governed — Orchestrator persists state or owns decisions, violating stateless contract.",
          ].map((text, i) => (
            <FailureCard key={i} text={text} />
          ))}
        </div>
      </Section>

      {/* ── Footer navigation ── */}
      <div style={{
        borderTop: "2px solid #e2e8f0", paddingTop: "20px", marginTop: "8px",
        display: "flex", gap: "10px", flexWrap: "wrap",
      }}>
        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginRight: "4px", alignSelf: "center" }}>
          Continue to:
        </div>
        {[
          { label: "Batch Roadmap", path: "/batch-roadmap" },
          { label: "Gate Status", path: "/gate-status" },
          { label: "Control Panel", path: "/control-panel" },
          { label: "Data Model & Gaps", path: "/data-model" },
          { label: "Classification Walkthrough", path: "/classification-walkthrough" },
          { label: "Taxonomy Explorer", path: "/taxonomy" },
        ].map(l => (
          <Link key={l.path} href={l.path}>
            <span style={{
              fontSize: "12px", fontWeight: 600, color: "#2563eb",
              border: "1px solid #bfdbfe", borderRadius: "6px",
              padding: "4px 10px", cursor: "pointer",
              backgroundColor: "#eff6ff",
              display: "inline-block",
            }}>
              {l.label} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
