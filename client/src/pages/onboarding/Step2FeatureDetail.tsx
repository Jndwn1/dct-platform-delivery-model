// Step2FeatureDetail.tsx
// Discovery Hub Step 2 — Analyze Existing Capabilities
// Shows all 11 sections for each feature: Overview, Business Objectives, Scope,
// Business Workflow, Architecture, Related APIs, Related User Stories,
// Acceptance Criteria, Dependencies, Downstream Consumers, Known Constraints

import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { markStepComplete } from "./OnboardingHub";

const FEATURE_DETAILS: Record<string, {
  id: string; batch: string; title: string; icon: string; color: string;
  overview: string;
  businessObjectives: string[];
  scope: string[];
  businessWorkflow: { step: number; actor: string; action: string; output: string }[];
  architecture: string[];
  relatedAPIs: { method: string; endpoint: string; purpose: string }[];
  relatedStories: { id: string; title: string; priority: string }[];
  acceptanceCriteria: string[];
  dependencies: string[];
  downstreamConsumers: { system: string; dataReceived: string }[];
  knownConstraints: string[];
}> = {
  b9a: {
    id: "b9a", batch: "Batch 9A", title: "Gateway & Governed Consumer Access Layer",
    icon: "🔐", color: "#1e3a5f",
    overview: "Batch 9A establishes the governed API gateway that controls all downstream consumer access to TDC data. It is the single entry point through which Roger, GoSystem, Provision, and State teams receive data. The gateway enforces authentication, authorization, rate limiting, and audit logging for every data request.",
    businessObjectives: [
      "Ensure all TDC data access is authenticated and authorized",
      "Provide consumer-specific data scoping (Provision sees provision data; State sees state data)",
      "Create a complete, immutable audit trail for every data request",
      "Enforce rate limiting to protect TDC from overload",
      "Enable future consumer onboarding without TDC schema changes",
    ],
    scope: [
      "API Gateway configuration and routing rules",
      "Consumer registration and authentication token management",
      "Rate limiting and throttle policies per consumer profile",
      "Audit logging of all consumer data requests",
      "Roger consumer access profile (read-only, UI-scoped data)",
      "IMS-ready governed data access profile (workpaper and schedule data)",
      "Provision read access profile (provision schedules, adjustments)",
      "State read access profile (apportionment data)",
    ],
    businessWorkflow: [
      { step: 1, actor: "Consumer System", action: "Requests access token from Gateway", output: "JWT access token with consumer scope" },
      { step: 2, actor: "Gateway", action: "Validates consumer credentials and issues scoped token", output: "Authenticated session with data scope" },
      { step: 3, actor: "Consumer System", action: "Sends data request with token", output: "Authorized API request" },
      { step: 4, actor: "Gateway", action: "Validates token, applies rate limit, routes to TDC", output: "Filtered data response" },
      { step: 5, actor: "Gateway", action: "Logs request to audit trail", output: "Immutable audit record" },
      { step: 6, actor: "Consumer System", action: "Receives scoped data response", output: "Consumer-appropriate data payload" },
    ],
    architecture: [
      "Gateway sits between all consumers and TDC — no direct TDC access is permitted",
      "Consumer profiles define which TDC objects and fields each system can read",
      "Tokens are short-lived (1 hour) and scoped to the consumer's registered profile",
      "All requests are logged to the Audit Trail (Batch 16) before response is returned",
      "Gateway is stateless — no business logic resides in the gateway layer",
    ],
    relatedAPIs: [
      { method: "POST", endpoint: "/api/gateway/token/issue", purpose: "Issue scoped access token for registered consumer" },
      { method: "POST", endpoint: "/api/gateway/token/validate", purpose: "Validate an existing consumer token" },
      { method: "GET", endpoint: "/api/gateway/consumer/profile/{consumerId}", purpose: "Retrieve consumer access profile and data scope" },
      { method: "GET", endpoint: "/api/gateway/audit-log", purpose: "Retrieve audit log entries for a consumer or date range" },
      { method: "POST", endpoint: "/api/gateway/consumer/register", purpose: "Register a new downstream consumer" },
    ],
    relatedStories: [
      { id: "US-9A-001", title: "As a Provision BA, I need to authenticate to the Gateway so I can access provision schedule data", priority: "High" },
      { id: "US-9A-002", title: "As a State BA, I need a scoped access profile so I only see state apportionment data", priority: "High" },
      { id: "US-9A-003", title: "As an Audit Reviewer, I need to see all data requests made by a consumer in the last 30 days", priority: "Medium" },
      { id: "US-9A-004", title: "As a TDC Admin, I need to register a new consumer without changing the TDC schema", priority: "Medium" },
    ],
    acceptanceCriteria: [
      "All consumer data requests must pass through the Gateway — direct TDC access returns 403",
      "Each consumer receives only data within their registered scope profile",
      "Every request generates an immutable audit log entry within 100ms",
      "Rate limiting enforces per-consumer thresholds (configurable per profile)",
      "Token expiry is enforced — expired tokens return 401 with re-auth instructions",
      "Consumer registration does not require TDC schema migration",
    ],
    dependencies: [
      "B1 — Schema Lock (TDC schema must be stable before Gateway profiles are defined)",
      "B3 — TDC Core Data Model (objects must exist before access profiles can be scoped)",
      "B7 — API Contract Publication (Gateway routes must align with published contracts)",
      "B16 — Audit Trail (Gateway logs feed into the Audit Trail system)",
    ],
    downstreamConsumers: [
      { system: "Roger", dataReceived: "UI-scoped TDC data for practitioner screens" },
      { system: "GoSystem", dataReceived: "Workpaper and provision schedule exports" },
      { system: "Provision Team", dataReceived: "Provision schedules, adjustments, workpapers" },
      { system: "State Team", dataReceived: "State apportionment data and related classifications" },
    ],
    knownConstraints: [
      "Gateway does not perform business logic — all tax decisions remain in TDC",
      "Consumer profiles must be defined before Gateway can be tested end-to-end",
      "Rate limit thresholds require load testing to calibrate correctly",
      "Token refresh flow requires coordination with Roger UI team",
    ],
  },
  b16: {
    id: "b16", batch: "Batch 16", title: "Audit Trail & Lineage Governance",
    icon: "📋", color: "#065f46",
    overview: "Batch 16 provides the complete, immutable audit trail and data lineage system for DCT. Every tax decision, data transformation, and practitioner override is captured and traceable. This batch satisfies the G4 Lineage Closure gate and enables regulatory-ready audit exports.",
    businessObjectives: [
      "Capture every tax decision with full context (who, what, when, why)",
      "Provide source-to-output data lineage for every financial record",
      "Enable practitioners to review and understand AI-generated classifications",
      "Satisfy G4 Lineage Closure gate requirement",
      "Support regulatory audit exports for IMS delivery and external reviewers",
    ],
    scope: [
      "Immutable audit log for all TDC write operations",
      "Decision lineage tracking from source financial data to tax output",
      "Practitioner override capture with mandatory justification",
      "Data transformation history per financial record",
      "Lineage closure gate verification (G4)",
      "Audit trail export in IMS-ready format",
      "Lineage query API for Roger practitioner screens",
    ],
    businessWorkflow: [
      { step: 1, actor: "TDC Classification Engine", action: "Makes tax classification decision", output: "Classification with confidence score" },
      { step: 2, actor: "Audit Trail System", action: "Captures decision with full context", output: "Immutable audit record" },
      { step: 3, actor: "Practitioner (Roger)", action: "Reviews classification in Roger UI", output: "Review event logged" },
      { step: 4, actor: "Practitioner (Roger)", action: "Accepts or overrides classification", output: "Override record with justification" },
      { step: 5, actor: "Audit Trail System", action: "Captures override with justification", output: "Override audit record linked to original decision" },
      { step: 6, actor: "Audit Reviewer", action: "Queries lineage for a specific entity", output: "Complete decision history from source to output" },
    ],
    architecture: [
      "Audit Trail is append-only — no records can be modified or deleted",
      "Each audit record links to the source financial data, the decision, and the output",
      "Lineage records form a directed acyclic graph (DAG) from source to output",
      "G4 Lineage Closure is verified when all records in a batch have complete lineage",
      "Audit exports are generated asynchronously and stored in S3",
    ],
    relatedAPIs: [
      { method: "GET", endpoint: "/api/audit/trail/{entityId}", purpose: "Retrieve full audit trail for a tax entity" },
      { method: "GET", endpoint: "/api/lineage/record/{decisionId}", purpose: "Retrieve lineage record for a specific decision" },
      { method: "POST", endpoint: "/api/audit/export", purpose: "Generate audit export for a date range or entity set" },
      { method: "GET", endpoint: "/api/lineage/closure/status", purpose: "Check G4 Lineage Closure status for a batch" },
      { method: "POST", endpoint: "/api/audit/override/capture", purpose: "Capture practitioner override with justification" },
    ],
    relatedStories: [
      { id: "US-16-001", title: "As a Practitioner, I need to see the full decision history for a classification so I can understand why it was made", priority: "High" },
      { id: "US-16-002", title: "As an Audit Reviewer, I need to export all decisions for a tax period in an IMS-ready format for return engine delivery", priority: "High" },
      { id: "US-16-003", title: "As a TDC Admin, I need to verify G4 Lineage Closure before a batch can be marked complete", priority: "High" },
      { id: "US-16-004", title: "As a Practitioner, I need to provide a justification when overriding an AI classification", priority: "Medium" },
    ],
    acceptanceCriteria: [
      "Every TDC write operation generates an immutable audit record within 200ms",
      "Lineage records link source data → transformation → decision → output for every entity",
      "Practitioner overrides require a non-empty justification text before saving",
      "G4 Lineage Closure gate returns 'Closed' only when all batch records have complete lineage",
      "Audit exports complete within 5 minutes for up to 10,000 records",
      "No audit record can be modified or deleted — all updates create new records",
    ],
    dependencies: [
      "B9A — Gateway Access (audit events flow through the Gateway)",
      "B12 — Decision Capture (decisions must be captured before lineage can be built)",
      "B14 — Classification Engine (classifications are the primary audit subject)",
    ],
    downstreamConsumers: [
      { system: "Roger", dataReceived: "Decision history and lineage for practitioner review screens" },
      { system: "GoSystem", dataReceived: "Regulatory audit export in GoSystem format" },
      { system: "Provision Team", dataReceived: "Adjustment and override history for workpaper review" },
      { system: "Compliance/Regulatory", dataReceived: "Full audit export for external review" },
    ],
    knownConstraints: [
      "Audit records are immutable — corrections require new override records, not edits",
      "Lineage closure requires all upstream batches to be complete",
      "Export generation is asynchronous — clients must poll for completion",
      "Justification text is required for overrides — empty strings are rejected",
    ],
  },
  b28: {
    id: "b28", batch: "Batch 28", title: "Tax Workpaper & Provision Schedules",
    icon: "📊", color: "#7c3aed",
    overview: "Batch 28 delivers provision reference data (DTAClassification, DTLClassification, ETRCategory, ValuationAllowanceCriterion) and the BTPProvisionOutbound contract from TDC to support Provision and State team workflows. It provides governed API access via the B9A Gateway. B28 does not compute provision or export directly to any return engine.",
    businessObjectives: [
      "Provide Provision teams with governed access to TDC provision schedule data",
      "Eliminate manual spreadsheet extraction for workpaper preparation",
      "Deliver State apportionment data through the same governed channel",
      "Enable GoSystem-compatible workpaper exports from TDC",
      "Ensure all provision data is traceable to its source in TDC",
    ],
    scope: [
      "Provision schedule data model in TDC",
      "Tax workpaper generation from TDC data",
      "Provision-specific API endpoints via Gateway (B9A)",
      "Schedule period management (quarterly, annual, interim)",
      "Adjustment and reclassification tracking",
      "Workpaper export to GoSystem format",
      "State apportionment data feed",
      "Provision schedule reconciliation reporting",
    ],
    businessWorkflow: [
      { step: 1, actor: "TDC Classification Engine", action: "Classifies financial records and computes tax adjustments", output: "Classified records with adjustment amounts" },
      { step: 2, actor: "Provision Schedule Engine", action: "Aggregates classified records into provision schedule", output: "Provision schedule for the period" },
      { step: 3, actor: "Provision BA (via Gateway)", action: "Requests provision schedule for a period", output: "Scoped provision schedule data" },
      { step: 4, actor: "Provision BA", action: "Reviews schedule and identifies adjustments", output: "Adjustment entries with justification" },
      { step: 5, actor: "Workpaper Generator", action: "Generates workpaper from schedule and adjustments", output: "Tax workpaper document" },
      { step: 6, actor: "GoSystem Export", action: "Exports workpaper in GoSystem format", output: "GoSystem-compatible workpaper file" },
    ],
    architecture: [
      "Provision schedules are computed by TDC from classified financial records",
      "All Provision and State access goes through the Gateway (B9A) — no direct TDC access",
      "Workpaper generation is triggered by the Provision BA via API — not automatic",
      "GoSystem exports are generated asynchronously and stored in S3",
      "State apportionment data is a separate data feed scoped to State consumer profile",
    ],
    relatedAPIs: [
      { method: "GET", endpoint: "/api/provision/schedules/{period}", purpose: "Retrieve provision schedule for a specific period" },
      { method: "GET", endpoint: "/api/provision/workpaper/{entityId}", purpose: "Retrieve tax workpaper for a specific entity" },
      { method: "GET", endpoint: "/api/provision/state/apportionment", purpose: "Retrieve state apportionment data" },
      { method: "POST", endpoint: "/api/provision/export/gosystem", purpose: "Generate GoSystem-compatible workpaper export" },
      { method: "GET", endpoint: "/api/provision/adjustments/{period}", purpose: "Retrieve adjustment entries for a period" },
    ],
    relatedStories: [
      { id: "US-28-001", title: "As a Provision BA, I need to retrieve the provision schedule for Q3 so I can review it before GoSystem export", priority: "High" },
      { id: "US-28-002", title: "As a State BA, I need to access state apportionment data from TDC so I can validate state filings", priority: "High" },
      { id: "US-28-003", title: "As a Provision BA, I need to generate a GoSystem-compatible workpaper export from TDC data", priority: "High" },
      { id: "US-28-004", title: "As a Provision BA, I need to see all adjustments made to a provision schedule with justifications", priority: "Medium" },
    ],
    acceptanceCriteria: [
      "Provision schedule API returns data scoped to the authenticated consumer's profile",
      "Workpaper generation completes within 30 seconds for up to 1,000 records",
      "GoSystem export format matches the GoSystem import specification exactly",
      "State apportionment data is scoped to State consumer profile — Provision cannot access it",
      "All adjustments include a justification text and are linked to the original classification",
      "Provision schedule reconciliation report shows variance from prior period",
    ],
    dependencies: [
      "B9A — Gateway Access (all Provision/State access goes through Gateway)",
      "B16 — Audit Trail (all workpaper actions are audited)",
      "B22 — Tax Object Model (provision schedule objects must exist in TDC)",
      "B25 — GoSystem Integration (export format must match GoSystem specification)",
    ],
    downstreamConsumers: [
      { system: "Provision Team", dataReceived: "Provision schedules, adjustments, workpapers" },
      { system: "State Team", dataReceived: "State apportionment data and related classifications" },
      { system: "GoSystem", dataReceived: "Workpaper export in GoSystem-compatible format" },
      { system: "Roger", dataReceived: "Provision schedule summary for practitioner review screens" },
    ],
    knownConstraints: [
      "GoSystem export format is fixed — changes require coordination with GoSystem team",
      "Provision schedule computation depends on all upstream classifications being complete",
      "State apportionment data requires separate consumer profile registration",
      "Workpaper generation is not real-time — it reflects the TDC state at time of request",
    ],
  },
};

export default function Step2FeatureDetail() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialFeature = params.get("feature") || "b9a";

  const [selectedFeature, setSelectedFeature] = useState(initialFeature);
  const [activeSection, setActiveSection] = useState("overview");

  const feat = FEATURE_DETAILS[selectedFeature];

  const SECTIONS = [
    { key: "overview", label: "Overview" },
    { key: "objectives", label: "Business Objectives" },
    { key: "scope", label: "Scope" },
    { key: "workflow", label: "Business Workflow" },
    { key: "architecture", label: "Architecture" },
    { key: "apis", label: "Related APIs" },
    { key: "stories", label: "User Stories" },
    { key: "criteria", label: "Acceptance Criteria" },
    { key: "dependencies", label: "Dependencies" },
    { key: "consumers", label: "Downstream Consumers" },
    { key: "constraints", label: "Known Constraints" },
  ];

  function handleContinue() {
    markStepComplete("step2-feature-detail");
    navigate("/onboarding/step3");
  }

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "12px", color: "#64748b" }}>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding")}>Provision &amp; State Discovery Hub</span>
        <span>›</span>
        <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/onboarding/step1")}>Step 1 — Review Existing DCT Capabilities</span>
        <span>›</span>
        <span style={{ fontWeight: 600, color: "#0f1623" }}>Step 2 — Analyze Existing Capabilities</span>
      </div>

      <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f1623", margin: "0 0 8px" }}>
        🔍 Analyze Existing Capabilities
      </h1>
      <div style={{
        backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
        borderRadius: "8px", padding: "10px 14px", marginBottom: "16px",
      }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.6" }}>
          Review each capability in detail to determine: what business problem it solves, what functionality already exists,
          what is in scope, what is out of scope, dependencies, and integration points.
          Use this analysis to understand whether your business need is already addressed before documenting a new requirement.
        </p>
      </div>

      {/* Feature selector tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {Object.values(FEATURE_DETAILS).map(f => (
          <button
            key={f.id}
            onClick={() => { setSelectedFeature(f.id); setActiveSection("overview"); }}
            style={{
              fontSize: "12px", fontWeight: 700, padding: "8px 14px",
              borderRadius: "7px", cursor: "pointer", border: "none",
              backgroundColor: selectedFeature === f.id ? f.color : "#f1f5f9",
              color: selectedFeature === f.id ? "white" : "#475569",
            }}
          >
            {f.icon} {f.batch}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "20px" }}>

        {/* Section nav */}
        <div style={{
          backgroundColor: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "12px", height: "fit-content",
        }}>
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                fontSize: "12px", fontWeight: activeSection === s.key ? 700 : 500,
                padding: "7px 10px", borderRadius: "6px", border: "none",
                cursor: "pointer",
                backgroundColor: activeSection === s.key ? feat.color : "transparent",
                color: activeSection === s.key ? "white" : "#475569",
                marginBottom: "2px",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div style={{
          backgroundColor: "white", border: "1px solid #e2e8f0",
          borderRadius: "10px", padding: "20px 24px", minHeight: "400px",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: 700, color: feat.color,
            textTransform: "uppercase", letterSpacing: "0.07em",
            marginBottom: "4px",
          }}>
            {feat.batch} — {feat.title}
          </div>

          {activeSection === "overview" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Overview</h2>
              <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7" }}>{feat.overview}</p>
            </div>
          )}

          {activeSection === "objectives" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Business Objectives</h2>
              <ul style={{ paddingLeft: "18px" }}>
                {feat.businessObjectives.map((o, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.8" }}>{o}</li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "scope" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Scope</h2>
              <ul style={{ paddingLeft: "18px" }}>
                {feat.scope.map((s, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.8" }}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "workflow" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Business Workflow</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                {feat.businessWorkflow.map(w => (
                  <div key={w.step} style={{
                    display: "grid", gridTemplateColumns: "32px 120px 1fr 1fr",
                    gap: "12px", alignItems: "start",
                    padding: "10px 14px", backgroundColor: "#f8fafc",
                    borderRadius: "8px", border: "1px solid #e2e8f0",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      backgroundColor: feat.color, color: "white",
                      fontSize: "12px", fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{w.step}</div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: feat.color }}>{w.actor}</div>
                    <div style={{ fontSize: "13px", color: "#1e293b" }}>{w.action}</div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>→ {w.output}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "architecture" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Architecture</h2>
              <ul style={{ paddingLeft: "18px" }}>
                {feat.architecture.map((a, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.8" }}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "apis" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Related APIs</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {feat.relatedAPIs.map((api, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: "10px",
                    padding: "10px 14px", backgroundColor: "#f8fafc",
                    borderRadius: "7px", border: "1px solid #e2e8f0",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "white",
                      backgroundColor: api.method === "GET" ? "#059669" : "#2563eb",
                      borderRadius: "4px", padding: "2px 6px", flexShrink: 0,
                    }}>{api.method}</span>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#1e3a5f", fontWeight: 600 }}>{api.endpoint}</span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{api.purpose}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "stories" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Related User Stories</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {feat.relatedStories.map((s, i) => (
                  <div key={i} style={{
                    padding: "10px 14px", backgroundColor: "#f8fafc",
                    borderRadius: "7px", border: "1px solid #e2e8f0",
                    display: "flex", alignItems: "flex-start", gap: "10px",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, color: "#1e3a5f",
                      backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
                      borderRadius: "4px", padding: "2px 6px", flexShrink: 0,
                    }}>{s.id}</span>
                    <span style={{ fontSize: "13px", color: "#1e293b", flex: 1 }}>{s.title}</span>
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      color: s.priority === "High" ? "#dc2626" : "#d97706",
                      backgroundColor: s.priority === "High" ? "#fef2f2" : "#fffbeb",
                      borderRadius: "4px", padding: "2px 6px", flexShrink: 0,
                    }}>{s.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "criteria" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Acceptance Criteria</h2>
              <ul style={{ paddingLeft: "18px" }}>
                {feat.acceptanceCriteria.map((c, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.8" }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "dependencies" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Dependencies</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                {feat.dependencies.map((d, i) => (
                  <div key={i} style={{
                    fontSize: "13px", color: "#7f1d1d",
                    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: "6px", padding: "8px 12px",
                  }}>
                    ⚠ {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "consumers" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Downstream Consumers</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                {feat.downstreamConsumers.map((c, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0", borderRadius: "8px",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#065f46" }}>{c.system}</div>
                    <div style={{ fontSize: "12px", color: "#475569", marginTop: "3px" }}>{c.dataReceived}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "constraints" && (
            <div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#0f1623", marginTop: "4px" }}>Known Constraints</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "12px" }}>
                {feat.knownConstraints.map((c, i) => (
                  <div key={i} style={{
                    fontSize: "13px", color: "#78350f",
                    backgroundColor: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: "6px", padding: "8px 12px",
                  }}>
                    ⚡ {c}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Continue button */}
      <div style={{
        marginTop: "24px", display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "16px 20px",
        backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px",
      }}>
        <button
          onClick={() => navigate("/onboarding/step1")}
          style={{
            fontSize: "13px", fontWeight: 600, color: "#64748b",
            backgroundColor: "white", border: "1px solid #e2e8f0",
            borderRadius: "7px", padding: "9px 18px", cursor: "pointer",
          }}
        >
          ← Back to Step 1
        </button>
        <button
          onClick={handleContinue}
          style={{
            fontSize: "13px", fontWeight: 700, color: "white",
            backgroundColor: "#059669", border: "none",
            borderRadius: "7px", padding: "9px 20px", cursor: "pointer",
          }}
        >
          ✓ Continue to Step 3 — Discovery Center →
        </button>
      </div>
    </div>
  );
}
