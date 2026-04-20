// Roger API Evolution — Batch-by-batch API surface growth
// Matches reference: rsm-ai-team-niua6bzx.manus.space

const API_BATCHES = [
  {
    batch: "Batch 2", label: "Normalization & Cross-LOB Taxonomy",
    endpoints: [
      { method: "GET", path: "/api/v1/financial-facts/{documentId}", desc: "Retrieve normalized FinancialFact records for a document" },
      { method: "GET", path: "/api/v1/financial-facts/{documentId}/summary", desc: "Aggregated summary of financial facts by account type" },
      { method: "GET", path: "/api/v1/cross-lob-mappings/{documentId}", desc: "Cross-LOB taxonomy mappings for a document" },
      { method: "GET", path: "/api/v1/processing-runs/{jobId}", desc: "Processing run status and metadata" },
    ],
    models: ["FinancialFact", "CrossLOBMapping", "ProcessingRun", "AccountType (enum)"],
    note: "PDC read-only API surface. Roger consumes normalized data. No write access.",
  },
  {
    batch: "Batch 3", label: "Tax Domain Authority & Tax Taxonomy",
    endpoints: [
      { method: "GET", path: "/api/v1/tdc/records/{documentId}", desc: "Tax mapping proposals for a document" },
      { method: "GET", path: "/api/v1/tdc/records/{tdcRecordId}", desc: "Single TDC record with confidence band and evidence" },
      { method: "GET", path: "/api/v1/tdc/records/{documentId}/confidence-summary", desc: "Confidence band distribution (GREEN/YELLOW/RED)" },
    ],
    models: ["TdcRecord", "TaxMappingProposal", "ConfidenceBand (enum: GREEN | YELLOW | RED)", "TaxEvidence"],
    note: "TDC read-only API surface. Confidence bands drive Roger UI highlighting.",
  },
  {
    batch: "Batch 4", label: "AI Tax Mapping & Explainability",
    endpoints: [
      { method: "GET", path: "/api/v1/tdc/records/{tdcRecordId}/evidence", desc: "Structured evidence and reasoning chain for a mapping" },
      { method: "GET", path: "/api/v1/tdc/records/{tdcRecordId}/confidence", desc: "Confidence score details with contributing factors" },
    ],
    models: ["MappingEvidence", "ConfidenceScore", "ReasoningChain", "ContributingFactor"],
    note: "Explainability layer. Enables practitioners to understand AI reasoning before accepting proposals.",
  },
  {
    batch: "Batch 5", label: "Entity Identity & Structure",
    endpoints: [
      { method: "GET", path: "/api/v1/entities/{entityId}", desc: "Retrieve entity identity record with ownership, jurisdiction, and characteristics" },
      { method: "GET", path: "/api/v1/entities/{clientId}/hierarchy", desc: "Client group hierarchy with parent-child ownership relationships" },
      { method: "GET", path: "/api/v1/entities/{entityId}/entitlements", desc: "User-to-entity entitlement mappings for access scoping" },
    ],
    models: ["EntityRecord", "ClientGroup", "OwnershipRelationship", "EntitlementMapping", "DataSourceType (enum)"],
    note: "PDC entity read contract. Roger uses EntityId to scope views, navigate multi-entity engagements, and display client hierarchy.",
  },
  {
    batch: "Batch 6", label: "Practitioner Review, Adjustments & Lock",
    endpoints: [
      { method: "POST", path: "/api/v1/roger/decisions", desc: "Submit practitioner decision: ACCEPTED | OVERRIDDEN | REJECTED" },
      { method: "GET", path: "/api/v1/roger/decisions/{tdcRecordId}", desc: "Decision history for a TDC record (append-only audit trail)" },
      { method: "POST", path: "/api/v1/adjustments", desc: "Submit adjustment to PDC (cross-LOB) or TDC (tax classification)" },
      { method: "GET", path: "/api/v1/tdc/records/{documentId}/finalized", desc: "TAX_READY records for a document — final output for downstream" },
    ],
    models: ["MappingDecision", "DecisionState (enum: ACCEPTED | OVERRIDDEN | REJECTED)", "AdjustmentRecord", "TaxDecision"],
    note: "First write surface in Roger. Decisions are append-only and immutable. TAX_READY records are locked.",
  },
];

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#eff6ff", text: "#1d4ed8" },
  POST: { bg: "#f0fdf4", text: "#166534" },
  PUT: { bg: "#fffbeb", text: "#92400e" },
  DELETE: { bg: "#fef2f2", text: "#991b1b" },
};

export default function RogerApiEvolution() {
  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "4px" }}>
          Roger API Evolution
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Roger Home Page API Evolution</h1>
        <p style={{ fontSize: "13px", color: "#64748b" }}>
          API surface grows batch-by-batch. Each batch adds new endpoints as platform capabilities are delivered and gate-verified.
        </p>
      </div>

      {/* Architecture note */}
      <div style={{
        backgroundColor: "#eff6ff", borderRadius: "10px", padding: "16px 20px",
        borderWidth: "1px", borderColor: "#bfdbfe", marginBottom: "24px"
      }}>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e40af", marginBottom: "6px" }}>Architecture Principle</div>
        <p style={{ fontSize: "12px", color: "#1e40af", lineHeight: "1.6" }}>
          Roger is a <strong>read-only consumer</strong> of PDC and TDC APIs through Batches 2–5. The first write surface appears in Batch 6 when practitioners submit decisions.
          All decision records are <strong>append-only and immutable</strong>. TAX_READY records are permanently locked once finalized.
        </p>
      </div>

      {/* Batch API sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {API_BATCHES.map((b) => (
          <div key={b.batch} style={{
            backgroundColor: "white", borderRadius: "10px",
            borderWidth: "1px", borderColor: "#e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden"
          }}>
            {/* Section header */}
            <div style={{
              padding: "14px 20px", borderBottomWidth: "1px", borderBottomColor: "#f1f5f9",
              backgroundColor: "#f8fafc", display: "flex", alignItems: "center", gap: "10px"
            }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "10px",
                backgroundColor: "#eff6ff", color: "#1d4ed8"
              }}>
                {b.batch}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>{b.label}</span>
            </div>

            <div style={{ padding: "16px 20px" }}>
              {/* Endpoints */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                  New Endpoints
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {b.endpoints.map((ep) => {
                    const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                    return (
                      <div key={ep.path} style={{
                        display: "flex", alignItems: "flex-start", gap: "10px",
                        padding: "8px 12px", borderRadius: "6px", backgroundColor: "#f8fafc",
                        borderWidth: "1px", borderColor: "#e2e8f0"
                      }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
                          backgroundColor: mc.bg, color: mc.text, flexShrink: 0, marginTop: "1px"
                        }}>
                          {ep.method}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <code style={{ fontSize: "12px", color: "#1e293b", fontFamily: "monospace", display: "block", marginBottom: "2px" }}>
                            {ep.path}
                          </code>
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{ep.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Models + Note */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    New Models
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {b.models.map((m) => (
                      <span key={m} style={{
                        fontSize: "11px", padding: "3px 10px", borderRadius: "6px",
                        backgroundColor: "#f1f5f9", color: "#475569", fontFamily: "monospace"
                      }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    Architecture Note
                  </div>
                  <p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.5" }}>{b.note}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
