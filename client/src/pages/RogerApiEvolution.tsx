// Roger API Evolution — Batch-by-batch API surface growth
// Matches reference: rsm-ai-team-niua6bzx.manus.space

import { useState } from "react";
import { useBatchStatus } from "../contexts/BatchStatusContext";

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
  {
    batch: "Batch 7", label: "Client Tax Profile & Eligibility",
    endpoints: [
      { method: "GET",  path: "/api/v1/clients/{clientId}/tax-profile",                   desc: "Full client tax profile including filing status, jurisdiction, and entity type" },
      { method: "GET",  path: "/api/v1/clients/{clientId}/eligibility",                   desc: "Three-Tier Eligibility determination result (ELIGIBLE | CONDITIONAL | INELIGIBLE)" },
      { method: "GET",  path: "/api/v1/clients/{clientId}/eligibility/history",           desc: "Append-only eligibility determination history for a client" },
      { method: "GET",  path: "/api/v1/clients/{clientId}/tax-profile/jurisdiction-flags", desc: "Active jurisdiction-level flags affecting filing obligations" },
    ],
    models: ["ClientTaxProfile", "EligibilityDetermination", "EligibilityTier (enum: ELIGIBLE | CONDITIONAL | INELIGIBLE)", "JurisdictionFlag", "FilingObligation"],
    note: "Roger reads the Three-Tier Eligibility result to gate practitioner workflows. Ineligible clients are surfaced with blocking indicators. No write access — eligibility is owned by TDC.",
  },
  {
    batch: "Batch 8", label: "Exceptions & Remediation",
    endpoints: [
      { method: "GET",  path: "/api/v1/exceptions/{documentId}",                desc: "All active exception records for a document across PDC and TDC" },
      { method: "GET",  path: "/api/v1/exceptions/{exceptionId}",               desc: "Single exception record with failure type, severity, and remediation state" },
      { method: "POST", path: "/api/v1/exceptions/{exceptionId}/remediate",     desc: "Submit remediation action for an exception (OVERRIDE | ESCALATE | DISMISS)" },
      { method: "GET",  path: "/api/v1/exceptions/{documentId}/summary",        desc: "Exception summary by severity and system (PDC vs TDC) for Roger dashboard" },
    ],
    models: ["ExceptionRecord", "ExceptionSeverity (enum: CRITICAL | WARNING | INFO)", "RemediationAction", "RemediationState (enum: OPEN | IN_REVIEW | RESOLVED | ESCALATED)", "ExceptionSource (enum: PDC | TDC)"],
    note: "Roger surfaces exception counts and severity in the home page dashboard. Practitioners can submit remediation actions. Critical exceptions block TAX_READY promotion until resolved.",
  },
  {
    batch: "Batch 9", label: "PDC IMS Integration & Prior Year Retrieval",
    endpoints: [
      { method: "GET",  path: "/api/v1/ims/prior-year/{clientId}/{taxYear}",              desc: "Prior year tax record retrieved from IMS for rollforward comparison" },
      { method: "GET",  path: "/api/v1/ims/prior-year/{clientId}/{taxYear}/delta",        desc: "Delta analysis between prior year and current year TDC records" },
      { method: "GET",  path: "/api/v1/ims/retrieval-status/{jobId}",                    desc: "IMS retrieval job status — PENDING | IN_PROGRESS | COMPLETE | FAILED" },
      { method: "GET",  path: "/api/v1/tdc/records/{documentId}/rollforward-candidates", desc: "TDC records flagged as rollforward candidates based on prior year match" },
    ],
    models: ["ImsRecord", "PriorYearDelta", "RetrievalJob", "RetrievalStatus (enum: PENDING | IN_PROGRESS | COMPLETE | FAILED)", "RollforwardCandidate"],
    note: "Roger displays prior year comparison panels using IMS data. Rollforward candidates are highlighted to accelerate practitioner review. IMS retrieval is asynchronous — Roger polls retrieval status before rendering.",
  },
  {
    batch: "Batch 10", label: "Return Assembly, Filing & Lineage Closure",
    endpoints: [
      { method: "GET",  path: "/api/v1/returns/{documentId}/assembly",          desc: "Return assembly record — all TAX_READY records compiled into a filing package" },
      { method: "GET",  path: "/api/v1/returns/{documentId}/filing-status",     desc: "Current filing status: DRAFT | ASSEMBLED | SUBMITTED | ACCEPTED | REJECTED" },
      { method: "GET",  path: "/api/v1/returns/{documentId}/lineage",           desc: "Full lineage chain from ingestion through filing — Gate 4 closure artifact" },
      { method: "GET",  path: "/api/v1/returns/{documentId}/lineage/summary",   desc: "Lineage closure summary for Roger home page — completeness score and open gaps" },
    ],
    models: ["ReturnAssembly", "FilingPackage", "FilingStatus (enum: DRAFT | ASSEMBLED | SUBMITTED | ACCEPTED | REJECTED)", "LineageRecord", "LineageClosureSummary"],
    note: "Gate 4 — Lineage Closure. Roger displays the lineage closure summary on the home page once all TAX_READY records are assembled. Filing status is read-only in Roger; submission is owned by the filing agent. Lineage records are immutable.",
  },
];

// Map API_BATCHES batch labels to context status keys
const BATCH_CONTEXT_KEY: Record<string, string> = {
  "Batch 2": "B2",
  "Batch 3": "B3",
  "Batch 4": "B4",
  "Batch 5": "B5",
  "Batch 6": "B6",
  "Batch 7": "B7",
  "Batch 8": "B8",
  "Batch 9": "B9",
  "Batch 10": "B10",
};

const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
  "Delivered":      { bg: "#d1fae5", text: "#065f46", label: "Delivered" },
  "Complete":       { bg: "#d1fae5", text: "#065f46", label: "Complete" },
  "Demo Ready":     { bg: "#dbeafe", text: "#1e40af", label: "Demo Ready" },
  "In Progress":    { bg: "#fef3c7", text: "#92400e", label: "In Progress" },
  "Ready for QA":   { bg: "#ede9fe", text: "#5b21b6", label: "Ready for QA" },
  "QA In Progress": { bg: "#ede9fe", text: "#5b21b6", label: "QA In Progress" },
  "Blocked":        { bg: "#fee2e2", text: "#991b1b", label: "Blocked" },
  "MVP":            { bg: "#fef3c7", text: "#92400e", label: "MVP" },
  "Stretch":        { bg: "#f3f4f6", text: "#6b7280", label: "Stretch" },
  "Not Started":    { bg: "#f3f4f6", text: "#9ca3af", label: "Not Started" },
};

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "#eff6ff", text: "#1d4ed8" },
  POST: { bg: "#f0fdf4", text: "#166534" },
  PUT: { bg: "#fffbeb", text: "#92400e" },
  DELETE: { bg: "#fef2f2", text: "#991b1b" },
};

// ── Export Panel helpers ──────────────────────────────────────────────────────

function buildExportText(): string {
  const lines: string[] = [];
  lines.push("DCT PLATFORM — ROGER HOME PAGE API EVOLUTION");
  lines.push("=".repeat(60));
  lines.push("API surface grows batch-by-batch. Each batch adds new endpoints");
  lines.push("as platform capabilities are delivered and gate-verified.");
  lines.push("");
  lines.push("ARCHITECTURE PRINCIPLE");
  lines.push("-".repeat(40));
  lines.push("Roger is a read-only consumer of PDC and TDC APIs through Batches 2–5.");
  lines.push("The first write surface appears in Batch 6 when practitioners submit decisions.");
  lines.push("All decision records are append-only and immutable.");
  lines.push("TAX_READY records are permanently locked once finalized.");
  lines.push("");

  for (const b of API_BATCHES) {
    lines.push("=".repeat(60));
    lines.push(`${b.batch.toUpperCase()} — ${b.label}`);
    lines.push("=".repeat(60));
    lines.push("");
    lines.push("NEW ENDPOINTS");
    lines.push("-".repeat(40));
    for (const ep of b.endpoints) {
      lines.push(`  [${ep.method}]  ${ep.path}`);
      lines.push(`         ${ep.desc}`);
    }
    lines.push("");
    lines.push("NEW MODELS");
    lines.push("-".repeat(40));
    lines.push("  " + b.models.join("  |  "));
    lines.push("");
    lines.push("ARCHITECTURE NOTE");
    lines.push("-".repeat(40));
    lines.push("  " + b.note);
    lines.push("");
  }

  lines.push("=".repeat(60));
  lines.push(`Generated: ${new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  })}`);
  lines.push("Source: DCT Platform Gate Verification Dashboard");
  return lines.join("\n");
}

function buildHtmlExport(): string {
  const rows = API_BATCHES.map(b => {
    const epRows = b.endpoints.map(ep => {
      const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
      return `
        <tr style="border-bottom:1px solid #f1f5f9;">
          <td style="padding:8px 12px;vertical-align:top;">
            <span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:${mc.bg};color:${mc.text};font-family:monospace;">${ep.method}</span>
          </td>
          <td style="padding:8px 12px;vertical-align:top;font-family:monospace;font-size:12px;color:#1e293b;">${ep.path}</td>
          <td style="padding:8px 12px;vertical-align:top;font-size:12px;color:#475569;">${ep.desc}</td>
        </tr>`;
    }).join("");

    return `
      <div style="margin-bottom:24px;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;background:white;">
        <div style="padding:12px 20px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:10px;">
          <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:10px;background:#eff6ff;color:#1d4ed8;">${b.batch}</span>
          <span style="font-size:14px;font-weight:700;color:#0f172a;">${b.label}</span>
        </div>
        <div style="padding:16px 20px;">
          <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">New Endpoints</div>
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;width:70px;">Method</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;">Path</th>
                <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;font-weight:600;">Description</th>
              </tr>
            </thead>
            <tbody>${epRows}</tbody>
          </table>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
            <div>
              <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">New Models</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${b.models.map(m => `<span style="font-size:11px;padding:3px 10px;border-radius:6px;background:#f1f5f9;color:#475569;font-family:monospace;">${m}</span>`).join("")}
              </div>
            </div>
            <div>
              <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Architecture Note</div>
              <p style="font-size:12px;color:#475569;line-height:1.5;margin:0;">${b.note}</p>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>DCT Platform — Roger API Evolution</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 32px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <div style="max-width:900px;margin:0 auto;">
    <div style="background:#003865;color:white;padding:20px 28px;border-radius:10px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#93c5fd;margin-bottom:4px;">DCT Platform · Roger UI</div>
      <h1 style="font-size:22px;font-weight:800;margin:0 0 4px;">Roger Home Page API Evolution</h1>
      <p style="font-size:13px;color:#bfdbfe;margin:0;">API surface grows batch-by-batch. Each batch adds new endpoints as platform capabilities are delivered and gate-verified.</p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px 20px;margin-bottom:24px;">
      <div style="font-size:13px;font-weight:700;color:#1e40af;margin-bottom:6px;">Architecture Principle</div>
      <p style="font-size:12px;color:#1e40af;line-height:1.6;margin:0;">
        Roger is a <strong>read-only consumer</strong> of PDC and TDC APIs through Batches 2–5. The first write surface appears in Batch 6 when practitioners submit decisions.
        All decision records are <strong>append-only and immutable</strong>. TAX_READY records are permanently locked once finalized.
      </p>
    </div>
    ${rows}
    <div style="text-align:right;font-size:11px;color:#94a3b8;margin-top:8px;">
      Generated ${new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })} · DCT Platform Gate Verification Dashboard
    </div>
  </div>
</body>
</html>`;
}

function ExportPanel({ onClose }: { onClose: () => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  function handleCopyText() {
    const text = buildExportText();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
          setCopyState("copied");
          setTimeout(() => setCopyState("idle"), 2500);
        }).catch(() => fallbackCopy(text));
      } else {
        fallbackCopy(text);
      }
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2500);
    }
  }

  function fallbackCopy(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("error");
      setTimeout(() => setCopyState("idle"), 2500);
    } finally {
      document.body.removeChild(ta);
    }
  }

  function handleOpenHtml() {
    const html = buildHtmlExport();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        backgroundColor: "white", borderRadius: "12px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        width: "480px", maxWidth: "95vw",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "#003865", padding: "18px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#93c5fd", marginBottom: "2px" }}>
              Roger API Evolution
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>Export Panel</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#93c5fd", fontSize: "18px", lineHeight: 1, padding: "4px" }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
            Export the full Roger API Evolution reference — all batches, endpoints, models, and architecture notes — for sharing with BAs, architects, or stakeholders.
          </p>

          {/* Option 1 — Copy as plain text */}
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px 18px", marginBottom: "12px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Copy as Plain Text
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Structured text with all batches, endpoints, models, and notes. Paste directly into Teams, email, or Confluence.
                </div>
              </div>
              <button
                onClick={handleCopyText}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer",
                  fontSize: "12px", fontWeight: 700,
                  backgroundColor: copyState === "copied" ? "#059669" : copyState === "error" ? "#dc2626" : "#003865",
                  color: "white",
                  transition: "background-color 0.2s",
                  minWidth: "100px",
                }}
              >
                {copyState === "copied" ? "✓ Copied!" : copyState === "error" ? "✗ Failed" : "Copy Text"}
              </button>
            </div>
          </div>

          {/* Option 2 — Open styled HTML */}
          <div style={{
            border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px 18px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
                  Open Styled Report
                </div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>
                  Opens a formatted HTML page matching the on-screen RSM style. Use Ctrl+P / ⌘+P to save as PDF or print.
                </div>
              </div>
              <button
                onClick={handleOpenHtml}
                style={{
                  flexShrink: 0,
                  padding: "8px 16px", borderRadius: "6px", border: "1px solid #003865", cursor: "pointer",
                  fontSize: "12px", fontWeight: 700,
                  backgroundColor: "white", color: "#003865",
                  minWidth: "100px",
                }}
              >
                Open Report ↗
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px", borderTopWidth: "1px", borderTopColor: "#f1f5f9",
          backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end",
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 18px", borderRadius: "6px", border: "1px solid #e2e8f0",
              fontSize: "12px", fontWeight: 600, cursor: "pointer",
              backgroundColor: "white", color: "#64748b",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RogerApiEvolution() {
  const [showExport, setShowExport] = useState(false);
  const { statuses } = useBatchStatus();

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%", padding: "24px 28px" }}>
      {/* Export Panel overlay */}
      {showExport && <ExportPanel onClose={() => setShowExport(false)} />}

      {/* Header */}
      <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2563eb", marginBottom: "4px" }}>
            Roger UI · API Evolution
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>Roger Home Page API Evolution</h1>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            API surface grows batch-by-batch. Each batch adds new endpoints as platform capabilities are delivered and gate-verified.
          </p>
        </div>
        {/* Export Panel button */}
        <button
          onClick={() => setShowExport(true)}
          style={{
            flexShrink: 0,
            padding: "9px 18px", borderRadius: "7px", border: "none", cursor: "pointer",
            fontSize: "12px", fontWeight: 700,
            backgroundColor: "#003865", color: "white",
            display: "flex", alignItems: "center", gap: "6px",
            boxShadow: "0 1px 4px rgba(0,56,101,0.18)",
            marginTop: "4px",
          }}
          title="Export or copy this page for sharing with BAs and stakeholders"
        >
          <span style={{ fontSize: "13px" }}>⬆</span> Export Panel
        </button>
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

      {/* Batch timeline bar */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px 18px", marginBottom: "24px", backgroundColor: "white" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>API Delivery Timeline — Live Status</div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {API_BATCHES.map(b => {
            const key = BATCH_CONTEXT_KEY[b.batch];
            const rawStatus = key ? ((statuses as unknown as Record<string, string>)[key] || "Not Started") : "Not Started";
            const pill = STATUS_PILL[rawStatus] || STATUS_PILL["Not Started"];
            return (
              <div key={b.batch} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "9999px", backgroundColor: pill.bg, color: pill.text, whiteSpace: "nowrap" }}>{b.batch}</span>
                <span style={{ fontSize: "9px", color: pill.text, fontWeight: 600, whiteSpace: "nowrap" }}>{pill.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roger UI Consumer APIs — from Roger API Design v1.0 */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "24px", backgroundColor: "white" }}>
        <div style={{ padding: "14px 20px", backgroundColor: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", fontWeight: 800, padding: "3px 10px", borderRadius: "10px", backgroundColor: "#1e40af", color: "white" }}>Roger UI</span>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "white" }}>Consumer API Reference — v1.0</span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#94a3b8" }}>Last updated 05.07.2026 · Roger API Design document</span>
        </div>
        <div style={{ padding: "12px 20px", backgroundColor: "#f0f9ff", borderBottom: "1px solid #bae6fd" }}>
          <p style={{ fontSize: "12px", color: "#0369a1", lineHeight: "1.6", margin: 0 }}>
            These are the APIs the <strong>Roger UI calls directly</strong> — the consumer-facing contract layer sitting above PDC and TDC.
            Roger reads from PDC/TDC via the batch contracts (Batches 2–10 above) and exposes a simplified UI API for its own pages.
            Roger and the Orchestrator are <strong>consumers only</strong> — they do not own data design, consolidation logic, or governance.
          </p>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* My Clients */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#1d4ed8" }}>My Clients</span>
              <code style={{ fontSize: "12px", color: "#1e293b", fontFamily: "monospace" }}>GET /api/clients?taxYear={'{year}'}</code>
              <span style={{ fontSize: "11px", color: "#64748b" }}>— Landing page client grid</span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Response Fields</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr style={{ backgroundColor: "#f8fafc" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Field</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Type</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Notes</th>
                </tr></thead>
                <tbody>
                  {[{f:"clientId",t:"string",n:"Unique client id — used in /entities/{clientId} and /consolidation-detail/{clientId}"},{f:"name",t:"string",n:"Client display name"},{f:"pctcompleted",t:"number",n:"Overall completion percent (0–100)"},{f:"entityCount",t:"number",n:"Number of entities under this client"},{f:"deliverables",t:"number",n:"Outstanding deliverables count"},{f:"approachingDate",t:"ISO date",n:"Nearest upcoming due date — YYYY-MM-DD"}].map(r => (
                    <tr key={r.f} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 10px" }}><code style={{ fontFamily: "monospace", color: "#1e293b" }}>{r.f}</code></td>
                      <td style={{ padding: "6px 10px", color: "#7c3aed", fontFamily: "monospace", fontSize: "11px" }}>{r.t}</td>
                      <td style={{ padding: "6px 10px", color: "#475569" }}>{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lookups */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534" }}>Lookups</span>
              <code style={{ fontSize: "12px", color: "#1e293b", fontFamily: "monospace" }}>GET /api/lookups?key={'{key}'}</code>
              <span style={{ fontSize: "11px", color: "#64748b" }}>— Dropdown options (e.g. tax-years)</span>
            </div>
            <div style={{ padding: "12px 16px", fontSize: "12px", color: "#475569" }}>
              Returns <code style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>{'{ key: string, options: (string|number)[] }'}</code>.
              Used to populate the Tax Year selector and other dynamic dropdowns. Supported keys: <code style={{ fontFamily: "monospace", backgroundColor: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>tax-years</code>.
            </div>
          </div>

          {/* Entities */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#eff6ff", color: "#1d4ed8" }}>Entities</span>
              <code style={{ fontSize: "12px", color: "#1e293b", fontFamily: "monospace" }}>GET /api/clients/{'{clientId}'}/entities?taxYear={'{year}'}</code>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Entity Fields</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr style={{ backgroundColor: "#f8fafc" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Field</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Type</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Notes</th>
                </tr></thead>
                <tbody>
                  {[{f:"entityId",t:"string",n:"Unique entity id — used in routes and downstream APIs"},{f:"entityCode",t:"string",n:"Internal short code displayed in Entity Code column"},{f:"entityName",t:"string",n:"Legal name displayed in Entity Name column"},{f:"ein",t:"string",n:"Federal EIN — formatted NN-NNNNNNN"},{f:"type",t:"enum",n:"C-Corp | S-Corp | Partnership | LLC | Disregarded | Foreign"},{f:"taxReturn",t:"string",n:"Tax return form label — e.g. Form 1120, Form 1120-S, Form 1065"},{f:"filingStatus",t:"enum",n:"Not Started | In Progress | In Review | Completed"}].map(r => (
                    <tr key={r.f} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 10px" }}><code style={{ fontFamily: "monospace", color: "#1e293b" }}>{r.f}</code></td>
                      <td style={{ padding: "6px 10px", color: "#7c3aed", fontFamily: "monospace", fontSize: "11px" }}>{r.t}</td>
                      <td style={{ padding: "6px 10px", color: "#475569" }}>{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return Detail */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#fef3c7", color: "#92400e" }}>Return Detail</span>
              <span style={{ fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>7 endpoints — member management, role changes, name editing</span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { method: "GET",    path: "/api/returns/{returnId}/members",                          desc: "List all members on a return — drives grid on page mount" },
                  { method: "PUT",    path: "/api/returns/{returnId}/name",                             desc: "Update return display name — inline edit dialog" },
                  { method: "POST",   path: "/api/returns/{returnId}/members",                          desc: "Add members (batch) — triggered after Add Members drawer confirm" },
                  { method: "DELETE", path: "/api/returns/{returnId}/members/{entityId}",               desc: "Remove a member — row delete icon (cannot remove only Parent)" },
                  { method: "PATCH",  path: "/api/returns/{returnId}/members/{entityId}",               desc: "Change member role inline via RoleBadge" },
                  { method: "PUT",    path: "/api/returns/{returnId}/members/{entityId}/role",          desc: "Dedicated role update — preferred when only role is changing" },
                  { method: "GET",    path: "/api/clients/{clientId}/entities/available?returnId={id}", desc: "Available entities for Add Members drawer — excludes existing members" },
                ].map((ep, i) => {
                  const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                  return (
                    <div key={`return-ep-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "7px 10px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: mc.bg, color: mc.text, flexShrink: 0, marginTop: "1px", fontFamily: "monospace" }}>{ep.method}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <code style={{ fontSize: "11px", color: "#1e293b", fontFamily: "monospace", display: "block", marginBottom: "2px" }}>{ep.path}</code>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{ep.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#fffbeb", borderRadius: "6px", border: "1px solid #fde68a", fontSize: "11px", color: "#92400e" }}>
                <strong>Role enum:</strong> Parent | Member | Elimination &nbsp;·&nbsp; <strong>Cannot remove</strong> the only Parent member — promote another first &nbsp;·&nbsp; <strong>Cannot set multiple Parents</strong> — demote existing Parent first
              </div>
            </div>
          </div>

          {/* Consolidation Detail */}
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#f0fdf4", color: "#166534" }}>Consolidation Detail</span>
              <span style={{ fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>4 endpoints — filings grid + lazy-loaded drawers</span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  { method: "GET", path: "/api/clients/{clientId}/consolidations?taxYear={year}", desc: "Filings grid — slim payload on page mount. Summary tiles derived client-side." },
                  { method: "GET", path: "/api/consolidations/{consolidationId}/returns",         desc: "Returns detail — lazy-loaded on Returns count cell click" },
                  { method: "GET", path: "/api/consolidations/{consolidationId}/issues",          desc: "Issues drawer — lazy-loaded on issues badge click. Filterable by status/priority/step." },
                  { method: "GET", path: "/api/consolidations/{consolidationId}/documents",       desc: "Documents drawer — lazy-loaded on documents badge click. Filterable by status/type." },
                ].map(ep => {
                  const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                  return (
                    <div key={ep.path} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "7px 10px", borderRadius: "6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", backgroundColor: mc.bg, color: mc.text, flexShrink: 0, marginTop: "1px", fontFamily: "monospace" }}>{ep.method}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <code style={{ fontSize: "11px", color: "#1e293b", fontFamily: "monospace", display: "block", marginBottom: "2px" }}>{ep.path}</code>
                        <span style={{ fontSize: "11px", color: "#64748b" }}>{ep.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "10px", padding: "8px 12px", backgroundColor: "#f0fdf4", borderRadius: "6px", border: "1px solid #bbf7d0", fontSize: "11px", color: "#166534" }}>
                <strong>Lazy loading pattern:</strong> Grid loads eagerly with slim payload. Issues, documents, returns, and workflow-step details load on user click — keeps initial response small.
                &nbsp;·&nbsp; <strong>Summary tiles</strong> (ConsolidationSummaryTiles.tsx) are derived client-side from the consolidations list — no separate endpoint.
              </div>
            </div>
          </div>

          {/* Shared error schema */}
          <div style={{ border: "1px solid #fecaca", borderRadius: "8px", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", backgroundColor: "#fef2f2", borderBottom: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#fee2e2", color: "#991b1b" }}>Error Schema</span>
              <span style={{ fontSize: "12px", color: "#1e293b", fontWeight: 600 }}>Shared across all Roger UI endpoints</span>
            </div>
            <div style={{ padding: "12px 16px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead><tr style={{ backgroundColor: "#f8fafc" }}>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>HTTP Code</th>
                  <th style={{ padding: "6px 10px", textAlign: "left", color: "#64748b", fontWeight: 600, borderBottom: "1px solid #e2e8f0" }}>Notes</th>
                </tr></thead>
                <tbody>
                  {[{c:"400",n:"INVALID_REQUEST — Missing or invalid query param"},{c:"401",n:"UNAUTHORIZED — Missing or expired auth token"},{c:"403",n:"FORBIDDEN — User lacks access to client or consolidation"},{c:"404",n:"NOT_FOUND — Resource does not exist"},{c:"500",n:"INTERNAL_ERROR — Server fault"}].map(r => (
                    <tr key={r.c} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "6px 10px" }}><code style={{ fontFamily: "monospace", color: "#991b1b", fontWeight: 700 }}>{r.c}</code></td>
                      <td style={{ padding: "6px 10px", color: "#475569" }}>{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Batch API sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {API_BATCHES.map((b) => {
          const key = BATCH_CONTEXT_KEY[b.batch];
          const rawStatus = key ? ((statuses as unknown as Record<string, string>)[key] || "Not Started") : "Not Started";
          const pill = STATUS_PILL[rawStatus] || STATUS_PILL["Not Started"];
          return (
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
              {key && (
                <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", backgroundColor: pill.bg, color: pill.text }}>
                  {pill.label}
                </span>
              )}
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
          );
        })}
      </div>
    </div>
  );
}
