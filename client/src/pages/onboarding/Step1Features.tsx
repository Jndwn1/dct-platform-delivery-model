// Step1Features.tsx
// Onboarding Step 1 — Review Existing DCT Features
// Displays B9A, B16, B28 with full business context. Required step — cannot skip.

import { useState } from "react";
import { useLocation } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const FEATURES = [
  {
    id: "b9a",
    batch: "Batch 9A",
    title: "Gateway & Governed Consumer Access Layer",
    icon: "🔐",
    color: "#1e3a5f",
    businessPurpose: "Establish a governed, secure API gateway that controls how downstream consumers (Roger, GoSystem, Provision, State) access TDC data. Ensures all data access is authenticated, authorized, and auditable.",
    businessProblem: "Without a governed access layer, downstream consumers could directly query TDC data without proper authorization controls, creating data governance risk, audit exposure, and inconsistent data delivery.",
    scope: [
      "API Gateway configuration and routing rules",
      "Consumer registration and authentication",
      "Rate limiting and access policy enforcement",
      "Audit logging of all consumer data requests",
      "Roger consumer access profile",
      "GoSystem export access profile",
      "Provision and State read access profiles",
    ],
    capabilities: [
      "Governed API access for all downstream consumers",
      "Consumer-specific data scoping and filtering",
      "Request authentication and authorization",
      "Real-time access audit trail",
      "Rate limiting and throttling per consumer",
    ],
    expectedOutcome: "All downstream consumers access TDC data through a single governed gateway. Every data request is authenticated, logged, and auditable. Provision and State teams receive scoped, filtered data views appropriate to their access level.",
    dependencies: ["B1 — Schema Lock", "B3 — TDC Core Data Model", "B7 — API Contract Publication"],
    relatedAPIs: [
      "GET /api/gateway/consumer/register",
      "GET /api/gateway/consumer/access-profile",
      "GET /api/gateway/audit-log",
      "POST /api/gateway/token/validate",
    ],
    relatedBusinessObjects: [
      "Consumer Access Profile",
      "Gateway Token",
      "Access Policy",
      "Audit Log Entry",
      "Rate Limit Rule",
    ],
  },
  {
    id: "b16",
    batch: "Batch 16",
    title: "Audit Trail & Lineage Governance",
    icon: "📋",
    color: "#065f46",
    businessPurpose: "Provide a complete, immutable audit trail for all tax decisions, data transformations, and system events within DCT. Enables practitioners to trace any tax output back to its source data and the decisions that produced it.",
    businessProblem: "Tax decisions made by AI systems require full explainability for regulatory compliance and practitioner review. Without lineage governance, it is impossible to trace why a classification was made or what data supported a tax position.",
    scope: [
      "Immutable audit log for all TDC write operations",
      "Decision lineage tracking from source data to tax output",
      "Practitioner override capture and justification logging",
      "Data transformation history per financial record",
      "Lineage closure gate verification (G4)",
      "Audit trail export for GoSystem and regulatory review",
    ],
    capabilities: [
      "Complete decision audit trail per tax entity",
      "Source-to-output data lineage tracing",
      "Practitioner override history with justification",
      "Regulatory-ready audit export",
      "Lineage closure verification (G4 gate)",
    ],
    expectedOutcome: "Every tax decision in TDC has a complete, traceable audit trail. Practitioners can review the full history of any classification. Regulatory reviewers can export lineage records. G4 Lineage Closure gate is satisfied.",
    dependencies: ["B9A — Gateway Access", "B12 — Decision Capture", "B14 — Classification Engine"],
    relatedAPIs: [
      "GET /api/audit/trail/{entityId}",
      "GET /api/lineage/record/{decisionId}",
      "POST /api/audit/export",
      "GET /api/lineage/closure/status",
    ],
    relatedBusinessObjects: [
      "Audit Trail Record",
      "Lineage Record",
      "Decision History",
      "Override Justification",
      "Lineage Closure Certificate",
    ],
  },
  {
    id: "b28",
    batch: "Batch 28",
    title: "Tax Workpaper & Provision Schedules",
    icon: "📊",
    color: "#7c3aed",
    businessPurpose: "Deliver structured tax workpaper data and provision schedule outputs from TDC to support Provision team workflows. Enables Provision BAs to access pre-computed tax schedules, adjustments, and workpaper data directly from the governed TDC data layer.",
    businessProblem: "Provision teams currently rely on manual data extraction and spreadsheet-based workpapers. Without a governed data feed from TDC, provision schedules are disconnected from the authoritative tax data source, creating reconciliation risk and manual effort.",
    scope: [
      "Provision schedule data model in TDC",
      "Tax workpaper generation from TDC data",
      "Provision-specific API endpoints",
      "Schedule period management (quarterly, annual)",
      "Adjustment and reclassification tracking",
      "Workpaper export to GoSystem format",
      "State apportionment data feed",
    ],
    capabilities: [
      "Governed provision schedule data from TDC",
      "Tax workpaper generation and export",
      "State apportionment data access",
      "Adjustment and reclassification history",
      "GoSystem-compatible workpaper export",
    ],
    expectedOutcome: "Provision teams access structured, governed workpaper data directly from TDC via the Gateway. Manual spreadsheet extraction is eliminated. State teams receive apportionment data through the same governed channel. GoSystem receives workpaper data in the correct format.",
    dependencies: ["B9A — Gateway Access", "B16 — Audit Trail", "B22 — Tax Object Model", "B25 — GoSystem Integration"],
    relatedAPIs: [
      "GET /api/provision/schedules/{period}",
      "GET /api/provision/workpaper/{entityId}",
      "GET /api/provision/state/apportionment",
      "POST /api/provision/export/gosystem",
    ],
    relatedBusinessObjects: [
      "Provision Schedule",
      "Tax Workpaper",
      "State Apportionment Record",
      "Adjustment Entry",
      "GoSystem Workpaper Export",
    ],
  },
];

export default function Step1Features() {
  const [, navigate] = useLocation();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleContinue() {
    markStepComplete("step1-features");
    navigate("/onboarding/step2");
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "960px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Onboarding Hub</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 1 — Review DCT Features</span>
        <span style={{
          marginLeft: "8px", fontSize: "10px", fontWeight: 700, color: "#dc2626",
          backgroundColor: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: "4px", padding: "1px 6px",
        }}>REQUIRED</span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 8px" }}>
          📋 Review Existing DCT Features
        </h1>
        <div style={{
          backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
          borderRadius: "8px", padding: "12px 16px",
        }}>
          <p style={{ margin: 0, fontSize: "14px", color: "#1e40af", lineHeight: "1.6" }}>
            <strong>Before beginning discovery, review the existing DCT Features</strong> to understand the business
            capabilities already planned and in development. These features represent committed scope — understanding
            them prevents duplicate requirements and ensures your discovery questions are focused on genuine gaps.
          </p>
        </div>
      </div>

      {/* Feature cards */}
      {FEATURES.map(feat => (
        <div key={feat.id} style={{
          backgroundColor: "white", border: `1.5px solid ${feat.color}30`,
          borderRadius: "12px", marginBottom: "16px", overflow: "hidden",
        }}>
          {/* Card header */}
          <div
            onClick={() => setExpanded(expanded === feat.id ? null : feat.id)}
            style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "16px 20px", cursor: "pointer",
              backgroundColor: `${feat.color}08`,
              borderBottom: expanded === feat.id ? `1px solid ${feat.color}20` : "none",
            }}
          >
            <div style={{
              width: "44px", height: "44px", borderRadius: "10px",
              backgroundColor: feat.color, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "20px", flexShrink: 0,
            }}>
              {feat.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: feat.color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {feat.batch}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f1623" }}>{feat.title}</div>
            </div>
            <div style={{ fontSize: "18px", color: "#94a3b8", transition: "transform 0.2s", transform: expanded === feat.id ? "rotate(90deg)" : "none" }}>
              ›
            </div>
          </div>

          {/* Collapsed summary */}
          {expanded !== feat.id && (
            <div style={{ padding: "12px 20px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
              {feat.businessPurpose.substring(0, 160)}...
              <span style={{ color: "#2563eb", cursor: "pointer", marginLeft: "4px" }} onClick={() => setExpanded(feat.id)}>
                Read more ↓
              </span>
            </div>
          )}

          {/* Expanded detail */}
          {expanded === feat.id && (
            <div style={{ padding: "20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                {/* Left column */}
                <div>
                  <DetailSection title="Business Purpose" color={feat.color}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>{feat.businessPurpose}</p>
                  </DetailSection>
                  <DetailSection title="Business Problem" color={feat.color}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>{feat.businessProblem}</p>
                  </DetailSection>
                  <DetailSection title="Expected Outcome" color={feat.color}>
                    <p style={{ margin: 0, fontSize: "13px", color: "#1e293b", lineHeight: "1.6" }}>{feat.expectedOutcome}</p>
                  </DetailSection>
                </div>

                {/* Right column */}
                <div>
                  <DetailSection title="Scope" color={feat.color}>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      {feat.scope.map((s, i) => (
                        <li key={i} style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.7" }}>{s}</li>
                      ))}
                    </ul>
                  </DetailSection>
                  <DetailSection title="Business Capabilities" color={feat.color}>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      {feat.capabilities.map((c, i) => (
                        <li key={i} style={{ fontSize: "13px", color: "#1e293b", lineHeight: "1.7" }}>{c}</li>
                      ))}
                    </ul>
                  </DetailSection>
                </div>
              </div>

              {/* Bottom row: dependencies, APIs, business objects */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <TagSection title="Dependencies" tags={feat.dependencies} color="#7f1d1d" bg="#fef2f2" border="#fecaca" />
                <TagSection title="Related APIs" tags={feat.relatedAPIs} color="#1e3a5f" bg="#eff6ff" border="#bfdbfe" />
                <TagSection title="Related Business Objects" tags={feat.relatedBusinessObjects} color="#065f46" bg="#f0fdf4" border="#bbf7d0" />
              </div>

              {/* Step 2 link */}
              <div style={{ marginTop: "14px", textAlign: "right" }}>
                <button
                  onClick={() => { markStepComplete("step2-feature-detail"); navigate("/onboarding/step2?feature=" + feat.id); }}
                  style={{
                    fontSize: "12px", fontWeight: 600, color: feat.color,
                    backgroundColor: `${feat.color}10`, border: `1px solid ${feat.color}40`,
                    borderRadius: "6px", padding: "6px 12px", cursor: "pointer",
                  }}
                >
                  View Full Feature Detail →
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Confirmation + continue */}
      <div style={{
        backgroundColor: "#f0fdf4", border: "1px solid #86efac",
        borderRadius: "10px", padding: "20px 24px", marginTop: "24px",
      }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            style={{ marginTop: "2px", width: "16px", height: "16px", cursor: "pointer" }}
          />
          <span style={{ fontSize: "14px", color: "#065f46", lineHeight: "1.5" }}>
            <strong>I confirm that I have reviewed all three DCT Features</strong> (Batch 9A, Batch 16, and Batch 28)
            and understand the existing business capabilities before proceeding to discovery.
          </span>
        </label>
        <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/onboarding")}
            style={{
              fontSize: "13px", fontWeight: 600, color: "#64748b",
              backgroundColor: "white", border: "1px solid #e2e8f0",
              borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
            }}
          >
            ← Back to Hub
          </button>
          <button
            onClick={handleContinue}
            disabled={!confirmed}
            style={{
              fontSize: "13px", fontWeight: 700, color: "white",
              backgroundColor: confirmed ? "#059669" : "#94a3b8",
              border: "none", borderRadius: "7px", padding: "9px 20px",
              cursor: confirmed ? "pointer" : "not-allowed",
            }}
          >
            ✓ Mark Complete & Continue to Step 2 →
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{
        fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase",
        letterSpacing: "0.07em", marginBottom: "6px",
        borderLeft: `3px solid ${color}`, paddingLeft: "8px",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function TagSection({ title, tags, color, bg, border }: { title: string; tags: string[]; color: string; bg: string; border: string }) {
  return (
    <div>
      <div style={{
        fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase",
        letterSpacing: "0.07em", marginBottom: "8px",
      }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {tags.map((tag, i) => (
          <div key={i} style={{
            fontSize: "11px", color,
            backgroundColor: bg, border: `1px solid ${border}`,
            borderRadius: "4px", padding: "3px 8px",
          }}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
}
