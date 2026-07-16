import { useState } from "react";
import DiscoveryAskBuddy from "@/components/DiscoveryAskBuddy";
import RelatedObjectsPanel from "@/components/RelatedObjectsPanel";

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY   = "#0f1623";
const TEAL   = "#0d7d84";
const TEAL_LIGHT = "#d6ecec";
const TEAL_MID   = "#0a9396";
const BLUE   = "#2563eb";
const BLUE_LIGHT = "#eff6ff";
const BLUE_BORDER = "#3b82f6";
const GREEN  = "#059669";
const GREEN_LIGHT = "#f0fdf4";
const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#faf5ff";
const SLATE  = "#475569";
const BORDER = "#e2e8f0";
const AMBER  = "#d97706";
const AMBER_LIGHT = "#fffbeb";

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ label, sub, sectionNum }: { label: string; sub?: string; sectionNum?: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      {sectionNum && (
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TEAL, marginBottom: "4px" }}>
          {sectionNum}
        </div>
      )}
      <div style={{ fontSize: "17px", fontWeight: 800, color: NAVY, marginBottom: sub ? "4px" : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: "12px", color: SLATE }}>{sub}</div>}
    </div>
  );
}

// ─── Responsibility card ──────────────────────────────────────────────────────
interface ResponsibilityItem {
  icon: string;
  label: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

const RESPONSIBILITIES: ResponsibilityItem[] = [
  { icon: "🔐", label: "Authentication",  desc: "Verifies Okta bearer tokens before processing any request. A missing or invalid token returns 401.", color: NAVY, bg: "#f8fafc", border: BORDER },
  { icon: "🛡️", label: "Authorization",   desc: "Ensures users only access permitted client data. CEM roles, features, and permissions are enforced per request.", color: NAVY, bg: "#f8fafc", border: BORDER },
  { icon: "↝",  label: "Routing",         desc: "Routes each request to the correct backend service — CEM, PDC, TDC, or Task Management — transparently.", color: BLUE, bg: BLUE_LIGHT, border: BLUE_BORDER },
  { icon: "⊕",  label: "Aggregation",     desc: "Combines responses from multiple backend services into a single unified payload for the Roger UI.", color: TEAL, bg: TEAL_LIGHT, border: TEAL },
  { icon: "≡",  label: "Normalization",   desc: "Provides Roger with a consistent API contract regardless of backend differences or version changes.", color: GREEN, bg: GREEN_LIGHT, border: GREEN },
  { icon: "📋", label: "Audit",           desc: "Captures the acting user from the Okta token and propagates audit metadata to downstream systems. The UI never supplies audit fields.", color: PURPLE, bg: PURPLE_LIGHT, border: PURPLE },
  { icon: "⚡", label: "Caching",         desc: "Reference-data routes (firm taxonomies, tax forms, taxonomy accounts) are cached for ~1 hour — safe to call freely.", color: AMBER, bg: AMBER_LIGHT, border: AMBER },
  { icon: "🔄", label: "Versioning",      desc: "Allows backend services to evolve independently without breaking the Roger UI contract.", color: SLATE, bg: "#f8fafc", border: "#cbd5e1" },
];

// ─── Backend service data ─────────────────────────────────────────────────────
interface BackendService {
  id: string;
  label: string;
  fullName: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  examples: string[];
}

const BACKEND_SERVICES: BackendService[] = [
  {
    id: "cem",
    label: "CEM",
    fullName: "Client & Entity Management",
    desc: "Manages client assignments, user roles, permissions, features, and entity structures. The Gateway forwards the user's Okta token directly to CEM for authorization.",
    color: NAVY,
    bg: "#f8fafc",
    border: "#94a3b8",
    icon: "👥",
    examples: ["Assigned clients list", "User roles & permissions", "Entity count per client"],
  },
  {
    id: "pdc",
    label: "PDC",
    fullName: "Phoenix Data Consolidation",
    desc: "Provides financial classifications and firm taxonomy. The Gateway uses a service identity when calling PDC — transparent to the Roger UI.",
    color: "#1e3a5f",
    bg: BLUE_LIGHT,
    border: BLUE_BORDER,
    icon: "☁",
    examples: ["Firm taxonomy concepts", "Taxonomy accounts with form lines", "Financial classifications"],
  },
  {
    id: "tdc",
    label: "TDC",
    fullName: "Tax Data Consolidation",
    desc: "Provides tax transformations, mappings, AI recommendations, and tax decisions. The Gateway uses a service identity when calling TDC.",
    color: "#065f46",
    bg: GREEN_LIGHT,
    border: GREEN,
    icon: "⚙",
    examples: ["Line mappings grid", "Tax forms & form lines", "Submit classify / proposal decisions"],
  },
  {
    id: "tasks",
    label: "Task Mgmt",
    fullName: "Task Management",
    desc: "Provides deliverables and workflow tasks associated with engagements. Supports the Roger practitioner workflow.",
    color: PURPLE,
    bg: PURPLE_LIGHT,
    border: PURPLE,
    icon: "✅",
    examples: ["Deliverables for an engagement", "Workflow task status", "Practitioner assignments"],
  },
];

// ─── Read API data ────────────────────────────────────────────────────────────
interface ReadAPI {
  label: string;
  desc: string;
  source: string;
  sourceColor: string;
  sourceBg: string;
}

const READ_APIS: ReadAPI[] = [
  { label: "Assigned Clients",   desc: "Returns clients the user is assigned to, enriched with roles, features, permissions, and entity count.", source: "CEM",   sourceColor: NAVY,    sourceBg: "#f1f5f9" },
  { label: "Entities",           desc: "Returns legal entities for a client, reshaped to the canonical grid (legalName, taxId, entityType).", source: "CEM",   sourceColor: NAVY,    sourceBg: "#f1f5f9" },
  { label: "Engagements",        desc: "Returns engagements for a client.", source: "CEM",   sourceColor: NAVY,    sourceBg: "#f1f5f9" },
  { label: "Deliverables",       desc: "Returns deliverables and task information for an engagement.", source: "Tasks", sourceColor: PURPLE, sourceBg: PURPLE_LIGHT },
  { label: "Line Mappings",      desc: "Returns the aggregated Line Mappings grid — merges TDC tax records, PDC classifications, taxonomy concepts, and tax-form lines into one row per account.", source: "TDC",   sourceColor: GREEN,   sourceBg: GREEN_LIGHT },
  { label: "Firm Taxonomies",    desc: "Returns available PDC firm taxonomy concepts. Cached ~1 hour.", source: "PDC",   sourceColor: BLUE,    sourceBg: BLUE_LIGHT },
  { label: "Tax Forms",          desc: "Returns tax forms and their form lines for a given tax year. Cached ~1 hour.", source: "TDC",   sourceColor: GREEN,   sourceBg: GREEN_LIGHT },
  { label: "Taxonomy Accounts",  desc: "Returns taxonomy accounts resolved to form lines for a given tax year. Cached ~1 hour.", source: "PDC",   sourceColor: BLUE,    sourceBg: BLUE_LIGHT },
];

// ─── Architecture diagram component ──────────────────────────────────────────
function ArchitectureDiagram() {
  const [activeService, setActiveService] = useState<string | null>(null);
  const activeData = BACKEND_SERVICES.find(s => s.id === activeService);

  return (
    <div style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "28px 24px", marginBottom: "28px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "20px" }}>
        Architecture Flow — Click a backend service to learn more
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        {/* Roger */}
        <div style={{
          width: "min(360px, 100%)", padding: "14px 20px",
          backgroundColor: PURPLE_LIGHT, border: `2px solid ${PURPLE}`,
          borderRadius: "10px", textAlign: "center",
        }}>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>👤</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>Roger</div>
          <div style={{ fontSize: "11px", color: SLATE }}>Tax Professional UI</div>
        </div>

        {/* Arrow down */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
          <div style={{ width: "2px", height: "20px", background: `linear-gradient(to bottom, ${PURPLE}, ${TEAL})`, borderRadius: "1px" }} />
          <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${TEAL}` }} />
          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginTop: "2px" }}>ALL REQUESTS</div>
        </div>

        {/* Gateway */}
        <div style={{
          width: "min(360px, 100%)", padding: "14px 20px",
          backgroundColor: TEAL_LIGHT, border: `2px solid ${TEAL}`,
          borderRadius: "10px", textAlign: "center",
          boxShadow: `0 0 0 4px ${TEAL}18`,
        }}>
          <div style={{ fontSize: "18px", marginBottom: "4px" }}>🔀</div>
          <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>Tax Solutions Data Gateway</div>
          <div style={{ fontSize: "11px", color: SLATE }}>Auth · Route · Aggregate · Normalize · Audit</div>
        </div>

        {/* Fan out to 4 services */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 0" }}>
          <div style={{ width: "2px", height: "20px", background: `linear-gradient(to bottom, ${TEAL}, #94a3b8)`, borderRadius: "1px" }} />
          <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "8px solid #94a3b8" }} />
          <div style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.05em", marginTop: "2px" }}>ROUTES TO</div>
        </div>

        {/* Backend services grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", width: "min(520px, 100%)" }}>
          {BACKEND_SERVICES.map(svc => (
            <button
              key={svc.id}
              onClick={() => setActiveService(activeService === svc.id ? null : svc.id)}
              style={{
                padding: "14px 16px",
                backgroundColor: activeService === svc.id ? svc.bg : "white",
                border: `2px solid ${activeService === svc.id ? svc.border : BORDER}`,
                borderRadius: "10px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                boxShadow: activeService === svc.id ? `0 0 0 3px ${svc.border}22` : "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={e => {
                if (activeService !== svc.id) {
                  (e.currentTarget as HTMLElement).style.borderColor = svc.border;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`;
                }
              }}
              onMouseLeave={e => {
                if (activeService !== svc.id) {
                  (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                }
              }}
            >
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{svc.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: svc.color, marginBottom: "2px" }}>{svc.label}</div>
              <div style={{ fontSize: "11px", color: SLATE, lineHeight: "1.4" }}>{svc.fullName}</div>
            </button>
          ))}
        </div>

        {/* Service detail panel */}
        {activeData && (
          <div style={{
            marginTop: "16px", width: "min(520px, 100%)",
            backgroundColor: activeData.bg, border: `1px solid ${activeData.border}`,
            borderRadius: "10px", padding: "16px 18px",
            animation: "fadeIn 0.2s ease",
          }}>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "20px" }}>{activeData.icon}</span>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: activeData.color }}>{activeData.fullName}</div>
                <div style={{ fontSize: "11px", color: SLATE }}>{activeData.label}</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.6", margin: "0 0 10px" }}>{activeData.desc}</p>
            <div style={{ fontSize: "11px", fontWeight: 700, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>Example Data</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {activeData.examples.map(ex => (
                <span key={ex} style={{
                  fontSize: "11px", padding: "3px 8px", borderRadius: "4px",
                  backgroundColor: "white", border: `1px solid ${activeData.border}`,
                  color: activeData.color, fontWeight: 600,
                }}>{ex}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Write flow diagram ───────────────────────────────────────────────────────
function WriteFlowDiagram() {
  const steps = [
    { label: "Roger", sub: "User makes a decision (Accept / Override)", color: PURPLE, bg: PURPLE_LIGHT, border: PURPLE, icon: "👤" },
    { label: "Tax Solutions Data Gateway", sub: "Receives the decision, validates token, routes to both backends", color: TEAL, bg: TEAL_LIGHT, border: TEAL, icon: "🔀" },
    { label: "PDC Decision", sub: "Financial classification decision recorded in PDC", color: "#1e3a5f", bg: BLUE_LIGHT, border: BLUE_BORDER, icon: "☁" },
    { label: "TDC Decision", sub: "Tax mapping decision recorded in TDC", color: "#065f46", bg: GREEN_LIGHT, border: GREEN, icon: "⚙" },
  ];

  return (
    <div style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "20px" }}>
        Write Decision Flow
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        {steps.map((step, idx) => (
          <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{
              width: "min(400px, 100%)", padding: "14px 18px",
              backgroundColor: step.bg, border: `2px solid ${step.border}`,
              borderRadius: "10px", textAlign: "center",
            }}>
              <div style={{ fontSize: "16px", marginBottom: "4px" }}>{step.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: step.color, marginBottom: "2px" }}>{step.label}</div>
              <div style={{ fontSize: "11px", color: SLATE, lineHeight: "1.4" }}>{step.sub}</div>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0" }}>
                <div style={{ width: "2px", height: "16px", background: `linear-gradient(to bottom, ${step.border}, ${steps[idx + 1].border})`, borderRadius: "1px" }} />
                <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${steps[idx + 1].border}` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: "16px", backgroundColor: AMBER_LIGHT, border: `1px solid ${AMBER}`,
        borderRadius: "8px", padding: "12px 16px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: AMBER, marginBottom: "4px" }}>⚠ Multi-Status Response</div>
        <div style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.6" }}>
          A single user action in Roger may update both PDC and TDC through the Gateway. If the two downstreams don't both fully succeed, the Gateway returns HTTP 207 (Multi-Status). Roger must inspect each side's result independently.
        </div>
      </div>
    </div>
  );
}

// ─── Security model diagram ───────────────────────────────────────────────────
function SecurityDiagram() {
  const steps = [
    { label: "Roger User", sub: "Sends end-user Okta bearer token on every request", icon: "👤", color: PURPLE, bg: PURPLE_LIGHT, border: PURPLE },
    { label: "Okta Authentication", sub: "Token validated — missing or invalid returns 401", icon: "🔐", color: "#b45309", bg: "#fffbeb", border: "#d97706" },
    { label: "Tax Solutions Data Gateway", sub: "Decides per route: forward user token (CEM) or swap to service identity (TDC/PDC). Records audit metadata.", icon: "🔀", color: TEAL, bg: TEAL_LIGHT, border: TEAL },
    { label: "Backend Services", sub: "CEM receives user token · TDC/PDC receive service identity · All receive audit context", icon: "⚙", color: "#065f46", bg: GREEN_LIGHT, border: GREEN },
  ];

  return (
    <div style={{ backgroundColor: "#f8fafc", border: `1px solid ${BORDER}`, borderRadius: "12px", padding: "24px", marginBottom: "20px" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94a3b8", marginBottom: "20px" }}>
        Security Flow
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0" }}>
        {steps.map((step, idx) => (
          <div key={step.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{
              width: "min(420px, 100%)", padding: "14px 18px",
              backgroundColor: step.bg, border: `2px solid ${step.border}`,
              borderRadius: "10px", textAlign: "center",
            }}>
              <div style={{ fontSize: "16px", marginBottom: "4px" }}>{step.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: step.color, marginBottom: "2px" }}>{step.label}</div>
              <div style={{ fontSize: "11px", color: SLATE, lineHeight: "1.4" }}>{step.sub}</div>
            </div>
            {idx < steps.length - 1 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0" }}>
                <div style={{ width: "2px", height: "16px", background: `linear-gradient(to bottom, ${step.border}, ${steps[idx + 1].border})`, borderRadius: "1px" }} />
                <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${steps[idx + 1].border}` }} />
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: "16px", backgroundColor: "#f0fdf4", border: `1px solid #bbf7d0`,
        borderRadius: "8px", padding: "12px 16px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 700, color: GREEN, marginBottom: "4px" }}>✓ Audit Principle</div>
        <div style={{ fontSize: "12px", color: "#14532d", lineHeight: "1.6" }}>
          The UI <strong>never supplies audit fields</strong>. The Gateway derives the acting user (<code style={{ fontSize: "11px", backgroundColor: "#dcfce7", padding: "1px 4px", borderRadius: "3px" }}>decidedBy</code>) from the Okta token and propagates audit context to all downstream systems automatically.
        </div>
      </div>
    </div>
  );
}

// ─── API Consumption Guide viewer ─────────────────────────────────────────────
function APIGuideViewer() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "10px",
          width: "100%", padding: "16px 20px",
          backgroundColor: open ? TEAL_LIGHT : "white",
          border: `2px solid ${open ? TEAL : BORDER}`,
          borderRadius: "10px", cursor: "pointer",
          textAlign: "left", transition: "all 0.2s ease",
        }}
        onMouseEnter={e => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.borderColor = TEAL;
            (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`;
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            (e.currentTarget as HTMLElement).style.borderColor = BORDER;
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }
        }}
      >
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px",
          backgroundColor: TEAL_LIGHT, border: `1px solid ${TEAL}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "16px", flexShrink: 0,
        }}>📄</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY }}>API Consumption Guide</div>
          <div style={{ fontSize: "12px", color: SLATE }}>Full developer reference — authentication, conventions, endpoint reference, line mappings, write decisions, and reference data.</div>
        </div>
        <div style={{
          fontSize: "11px", fontWeight: 700, color: TEAL,
          backgroundColor: TEAL_LIGHT, border: `1px solid ${TEAL}`,
          borderRadius: "4px", padding: "3px 8px", flexShrink: 0,
        }}>
          {open ? "▲ Close" : "▼ Open"}
        </div>
      </button>

      {open && (
        <div style={{
          marginTop: "8px", border: `1px solid ${BORDER}`, borderRadius: "10px",
          overflow: "hidden", height: "600px",
        }}>
          <iframe
            src="/manus-storage/DataGateway-Roger-consumption-guide_e86b3691.html"
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Data Gateway — Roger UI Consumption Guide"
          />
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DataGateway() {
  const [activeService, setActiveService] = useState<string | null>(null);

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "8px",
            backgroundColor: TEAL_LIGHT, border: `2px solid ${TEAL}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>🔀</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: NAVY, margin: 0, lineHeight: 1 }}>Tax Solutions Data Gateway</h1>
            <div style={{ fontSize: "11px", color: SLATE, marginTop: "2px" }}>Integration Architecture · RSM / CATT</div>
          </div>
        </div>
        <p style={{ fontSize: "14px", color: SLATE, margin: "10px 0 0", lineHeight: "1.7", maxWidth: "820px" }}>
          The Tax Solutions Data Gateway provides a single governed API surface for Roger, abstracting multiple backend services into one secure integration layer. Instead of Roger integrating directly with CEM, PDC, TDC, and Task Management, the Gateway centralizes authentication, routing, aggregation, and audit in one place.
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          {[
            { label: "Governed API Layer", color: TEAL },
            { label: "Okta Authentication", color: NAVY },
            { label: "Multi-Backend Aggregation", color: BLUE },
            { label: "Audit-First Design", color: GREEN },
            { label: "Roger Integration", color: PURPLE },
          ].map(b => (
            <span key={b.label} style={{
              fontSize: "11px", fontWeight: 600, color: "white",
              backgroundColor: b.color, borderRadius: "4px", padding: "3px 8px",
            }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* ══ SECTION 1 — WHY THE GATEWAY EXISTS ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Why the Gateway Exists" sub="The Gateway's role in the DCT platform" sectionNum="Section 1" />
        <div style={{
          backgroundColor: TEAL_LIGHT, border: `1px solid ${TEAL}`,
          borderRadius: "10px", padding: "20px 24px", marginBottom: "16px",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: NAVY, marginBottom: "8px" }}>
            Instead of Roger integrating directly with multiple systems, the Gateway provides a single integration layer that:
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
          {RESPONSIBILITIES.map(r => (
            <div key={r.label} style={{
              display: "flex", alignItems: "flex-start", gap: "12px",
              backgroundColor: r.bg, border: `1px solid ${r.border}`,
              borderRadius: "8px", padding: "14px 16px",
              transition: "box-shadow 0.2s ease",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = "none"}
            >
              <div style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>{r.icon}</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: r.color, marginBottom: "3px" }}>{r.label}</div>
                <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.5" }}>{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 2 — ARCHITECTURE DIAGRAM ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Architecture Diagram" sub="Roger → Gateway → Backend Services" sectionNum="Section 2" />
        <ArchitectureDiagram />
      </div>

      {/* ══ SECTION 3 — GATEWAY RESPONSIBILITIES ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Gateway Responsibilities" sub="Eight core capabilities the Gateway provides to Roger" sectionNum="Section 3" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {RESPONSIBILITIES.map(r => (
            <div key={r.label + "-s3"} style={{
              backgroundColor: r.bg, border: `1px solid ${r.border}`,
              borderRadius: "10px", padding: "18px 20px",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.1)`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{r.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: r.color, marginBottom: "6px" }}>{r.label}</div>
              <div style={{ fontSize: "13px", color: SLATE, lineHeight: "1.6" }}>{r.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 4 — SUPPORTED SERVICES ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Supported Backend Services" sub="Four backend systems the Gateway routes to" sectionNum="Section 4" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
          {BACKEND_SERVICES.map(svc => (
            <div
              key={svc.id + "-s4"}
              style={{
                backgroundColor: activeService === svc.id ? svc.bg : "white",
                border: `2px solid ${activeService === svc.id ? svc.border : BORDER}`,
                borderRadius: "10px", padding: "18px 20px",
                cursor: "pointer", transition: "all 0.2s ease",
              }}
              onClick={() => setActiveService(activeService === svc.id ? null : svc.id)}
              onMouseEnter={e => {
                if (activeService !== svc.id) {
                  (e.currentTarget as HTMLElement).style.borderColor = svc.border;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`;
                }
              }}
              onMouseLeave={e => {
                if (activeService !== svc.id) {
                  (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  backgroundColor: svc.bg, border: `1px solid ${svc.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                }}>{svc.icon}</div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: svc.color }}>{svc.label}</div>
                  <div style={{ fontSize: "11px", color: SLATE }}>{svc.fullName}</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#1e293b", lineHeight: "1.6", marginBottom: "10px" }}>{svc.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {svc.examples.map(ex => (
                  <span key={ex} style={{
                    fontSize: "10px", padding: "2px 6px", borderRadius: "3px",
                    backgroundColor: svc.bg, border: `1px solid ${svc.border}`,
                    color: svc.color, fontWeight: 600,
                  }}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 5 — READ APIS ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Read APIs" sub="Conceptual overview — see API Consumption Guide for endpoint details" sectionNum="Section 5" />
        <div style={{
          backgroundColor: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`,
          borderRadius: "8px", padding: "12px 16px", marginBottom: "16px",
        }}>
          <div style={{ fontSize: "12px", color: "#1e3a5f", lineHeight: "1.6" }}>
            <strong>Note:</strong> Endpoint URLs are not displayed on this Discovery page. For the full API contract including paths, query parameters, response envelopes, and code samples, open the API Consumption Guide in Section 8 below.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "10px" }}>
          {READ_APIS.map(api => (
            <div key={api.label} style={{
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: "8px", padding: "14px 16px",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = TEAL;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 12px rgba(0,0,0,0.08)`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = BORDER;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: NAVY }}>{api.label}</div>
                <span style={{
                  fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px",
                  backgroundColor: api.sourceBg, color: api.sourceColor,
                  border: `1px solid ${api.sourceColor}40`,
                }}>{api.source}</span>
              </div>
              <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.5" }}>{api.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 6 — WRITE APIS ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Write APIs — Decision Flow" sub="How Roger decisions propagate through the Gateway" sectionNum="Section 6" />
        <WriteFlowDiagram />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
          {[
            { label: "Accept", desc: "Roger accepts the AI-proposed mapping. The Gateway records the accept decision in both PDC and TDC.", color: GREEN, bg: GREEN_LIGHT, border: "#bbf7d0" },
            { label: "Override", desc: "Roger overrides the proposed mapping with a different value. The Gateway records the override in both PDC and TDC.", color: AMBER, bg: AMBER_LIGHT, border: "#fde68a" },
          ].map(d => (
            <div key={d.label} style={{
              backgroundColor: d.bg, border: `1px solid ${d.border}`,
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: d.color, marginBottom: "4px" }}>{d.label}</div>
              <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.5" }}>{d.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 7 — SECURITY MODEL ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Security Model" sub="How authentication and audit work end-to-end" sectionNum="Section 7" />
        <SecurityDiagram />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
          {[
            { label: "Forward User Token", desc: "CEM receives the end-user's Okta token directly for authorization decisions.", color: NAVY, bg: "#f8fafc", border: "#cbd5e1" },
            { label: "Service Identity Swap", desc: "TDC and PDC receive a Gateway service identity — transparent to the Roger UI.", color: TEAL, bg: TEAL_LIGHT, border: TEAL },
            { label: "Audit Propagation", desc: "The acting user (decidedBy) is derived from the token and propagated downstream automatically.", color: GREEN, bg: GREEN_LIGHT, border: "#bbf7d0" },
          ].map(item => (
            <div key={item.label} style={{
              backgroundColor: item.bg, border: `1px solid ${item.border}`,
              borderRadius: "8px", padding: "14px 16px",
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: item.color, marginBottom: "4px" }}>{item.label}</div>
              <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.5" }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ SECTION 8 — DEVELOPER RESOURCES ══ */}
      <div style={{ marginBottom: "32px" }}>
        <SectionHeading label="Developer Resources" sub="Technical documentation and API reference" sectionNum="Section 8" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px", marginBottom: "20px" }}>
          {[
            { icon: "📖", label: "API Consumption Guide", desc: "Detailed developer documentation covering all endpoints, authentication, conventions, and response envelopes.", color: TEAL, bg: TEAL_LIGHT, border: TEAL, action: "Expand below ↓" },
            { icon: "⚡", label: "Swagger Documentation", desc: "Live interactive API contract. Explore and test endpoints directly in the browser.", color: BLUE, bg: BLUE_LIGHT, border: BLUE_BORDER, action: "Coming soon" },
            { icon: "📋", label: "OpenAPI Specification", desc: "Machine-readable API contract for code generation, SDK creation, and tooling integration.", color: SLATE, bg: "#f8fafc", border: "#cbd5e1", action: "Coming soon" },
          ].map(r => (
            <div key={r.label} style={{
              backgroundColor: r.bg, border: `2px solid ${r.border}`,
              borderRadius: "10px", padding: "18px 20px",
              transition: "all 0.2s ease",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px rgba(0,0,0,0.1)`;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>{r.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: r.color, marginBottom: "6px" }}>{r.label}</div>
              <div style={{ fontSize: "12px", color: SLATE, lineHeight: "1.6", marginBottom: "10px" }}>{r.desc}</div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: r.color }}>{r.action}</div>
            </div>
          ))}
        </div>

        {/* Embedded API Consumption Guide */}
        <APIGuideViewer />
      </div>

      {/* ══ ASK BUDDY ══ */}
      <DiscoveryAskBuddy
        pageContext="Data Gateway"
        suggestedPrompts={[
          "What does the Tax Solutions Data Gateway do?",
          "How does Roger authenticate with the Gateway?",
          "What backend services does the Gateway route to?",
          "How does the write decision flow work?",
          "What is the difference between forwarding a user token vs service identity?",
          "What is the 207 multi-status response?",
          "Which APIs are cached at the Gateway?",
          "What audit fields does the Gateway capture?",
          "How does the Gateway handle PDC vs TDC routing?",
          "What happens if a backend service fails?",
        ]}
      />

      {/* ══ RELATED OBJECTS ══ */}
      <RelatedObjectsPanel
        currentPage="Data Gateway"
        relatedItems={[
          { type: "page", label: "IMS Integration", path: "/discovery/gosystem", desc: "IMS architecture and discovery workspace" },
          { type: "page", label: "Ecosystem Overview", path: "/discovery/ecosystem", desc: "Full platform architecture" },
          { type: "page", label: "Integration Architecture", path: "/discovery/integration-architecture", desc: "Integration patterns" },
          { type: "api", label: "Assigned Clients API", desc: "GET /api/assigned-clients/" },
          { type: "api", label: "Line Mappings API", desc: "GET /api/consolidations/{id}/line-mappings/taxYear/{year}" },
          { type: "api", label: "Decisions API", desc: "POST /api/consolidations/{id}/line-mappings/decisions" },
          { type: "api", label: "Firm Taxonomies API", desc: "GET /api/firm-taxonomies" },
          { type: "api", label: "Tax Forms API", desc: "GET /api/tax-forms/taxYear/{year}" },
        ]}
      />
    </div>
  );
}
