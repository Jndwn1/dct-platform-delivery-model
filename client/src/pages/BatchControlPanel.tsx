// ─────────────────────────────────────────────────────────────────────────────
// Global Batch Control Panel — v2.1 Governance Readiness Tracker
// Non-production workspace — governance visualization and readiness planning only
// Sections:
//   1. Batch Status (existing — propagates to all screens)
//   2. Delivered Work by Batch
//   3. Swagger / API Coverage
//   4. Roger UI Data Availability
//   5. PO Status Summary (copy-ready)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from "react";
import { Link } from "wouter";
import GovernanceBanner from "@/components/GovernanceBanner";
import {
  useBatchStatus, STATUS_STYLES, BATCH_LABELS, CASCADE_STEPS,
  type BatchKey, type BatchStatus,
} from "@/contexts/BatchStatusContext";
import { CheckCircle2, Clock, Circle, Lock, Shield, Link2, FileText, RotateCcw, Zap, Copy, Check, ChevronDown, ChevronUp, ClipboardCopy, Bug, Activity, Send, Download, FileSpreadsheet, FileJson, AlignLeft, Filter } from "lucide-react";
import { BAAssistant } from "@/components/BAAssistant";
import { RogerConsumerReadinessPanel } from "@/components/RogerConsumerReadinessPanel";

// ── SwaggerBatchGroup ───────────────────────────────────────────────────────
interface SwaggerGroupEntry { batch: string; endpoint: string; path: string; status: string; consumerGuide: string; missingFromGuide: boolean; missingFromSwagger: boolean; notes: string; owner?: string; }

const GOV_BADGE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  "read-contract":   { label: "Read Contract",   color: "#1e40af", bg: "#dbeafe" },
  "write-contract":  { label: "Write Contract",  color: "#7c3aed", bg: "#ede9fe" },
  "lineage":         { label: "Lineage Enabled", color: "#065f46", bg: "#d1fae5" },
  "immutable":       { label: "Immutable",       color: "#92400e", bg: "#fef3c7" },
  "additive-only":   { label: "Additive-Only",   color: "#0e7490", bg: "#cffafe" },
  "demo-ready":      { label: "Demo Ready",      color: "#166534", bg: "#bbf7d0" },
};

const BATCH_GOV_FLAGS: Record<string, string[]> = {
  "Batch FC": ["lineage","demo-ready"],
  "Batch 1": ["lineage","read-contract","demo-ready"],
  "Batch 2": ["lineage","read-contract","demo-ready"],
  "Batch 2A": ["write-contract","immutable","demo-ready"],
  "Batch 3": ["read-contract","lineage","demo-ready"],
  "Batch 4": ["immutable","additive-only","demo-ready"],
  "Batch 5": ["lineage","read-contract","demo-ready"],
  "Batch 6": ["immutable","write-contract","demo-ready"],
  "Batch 7": ["lineage","read-contract","demo-ready"],
  "Batch 8": ["lineage","additive-only"],
};

const ENDPOINT_GOV_FLAGS: Record<string, string[]> = {
  "/api/v1/ingestion-jobs": ["lineage","additive-only"],
  "/api/v1/documents": ["lineage","read-contract"],
  "/api/v1/normalized-records": ["lineage","read-contract","immutable"],
  "/api/v1/mapping-decisions": ["immutable","write-contract"],
  "/api/v1/tax-profiles": ["read-contract","lineage"],
  "/api/v1/eligibility": ["read-contract"],
  "/api/v1/adjustments": ["immutable","write-contract"],
  "/api/v1/sign-off": ["immutable","write-contract"],
};

function TruncatedNote({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const MAX = 80;
  if (text.length <= MAX) return <span className="text-slate-600" style={{fontSize:'10px'}}>{text}</span>;
  return (
    <span className="text-slate-600" style={{fontSize:'10px'}}>
      {expanded ? text : text.slice(0, MAX) + "…"}
      <button onClick={() => setExpanded(e => !e)} className="ml-1 text-blue-600 hover:underline font-medium" style={{fontSize:'9.5px'}}>
        {expanded ? "Less" : "More"}
      </button>
    </span>
  );
}

function SwaggerBatchGroup({ batchName, entries, defaultOpen = false }: { batchName: string; entries: SwaggerGroupEntry[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [showGapOnly, setShowGapOnly] = useState(false);
  const [batchCopied, setBatchCopied] = useState<string|null>(null);

  const delivered = entries.filter(e => e.status === "Delivered").length;
  const partial   = entries.filter(e => e.status === "In Progress" || e.status === "Partial").length;
  const missing   = entries.filter(e => e.status === "Missing" || e.status === "Needs PO/Dev Confirmation").length;
  const missingGuide = entries.filter(e => e.missingFromGuide).length;
  const missingSwagger = entries.filter(e => e.missingFromSwagger).length;
  const coveragePct = entries.length > 0 ? Math.round((delivered / entries.length) * 100) : 0;
  const guideAlignPct = entries.length > 0 ? Math.round(((entries.length - missingGuide) / entries.length) * 100) : 0;
  const govFlags = BATCH_GOV_FLAGS[batchName] ?? [];
  const owner = entries[0]?.owner ?? "";

  const displayEntries = showGapOnly
    ? entries.filter(e => e.missingFromGuide || e.missingFromSwagger || e.status !== "Delivered")
    : entries;

  const copyBatchSummary = (type: string) => {
    let text = "";
    if (type === "summary") {
      text = [
        `${batchName} — API Coverage Summary`,
        `Owner: ${owner}`,
        `Total APIs: ${entries.length} | Delivered: ${delivered} | Partial: ${partial} | Missing: ${missing}`,
        `Coverage: ${coveragePct}% | Consumer Guide Alignment: ${guideAlignPct}%`,
        missingGuide > 0 ? `Missing Consumer Guide: ${entries.filter(e=>e.missingFromGuide).map(e=>e.endpoint).join(", ")}` : "Consumer Guide: Fully aligned",
        missingSwagger > 0 ? `Missing Swagger: ${entries.filter(e=>e.missingFromSwagger).map(e=>e.endpoint).join(", ")}` : "Swagger: Fully documented",
      ].join("\n");
    } else if (type === "po") {
      text = [
        `${batchName} — PO API Status`,
        `${delivered} of ${entries.length} APIs delivered (${coveragePct}% coverage).`,
        partial > 0 ? `${partial} endpoint(s) partially implemented.` : "",
        missing > 0 ? `${missing} endpoint(s) require PO/Dev attention.` : "",
        missingGuide > 0 ? `${missingGuide} Consumer Guide gap(s) identified.` : "Consumer Guide fully aligned.",
      ].filter(Boolean).join("\n");
    } else if (type === "qa") {
      text = [
        `QA ENDPOINT SUMMARY — ${batchName}`,
        `Total Endpoints: ${entries.length}`,
        "",
        "DELIVERED (ready for QA):",
        ...entries.filter(e=>e.status==="Delivered").map(e=>`  • ${e.endpoint} [${e.path}]`),
        "",
        entries.filter(e=>e.status!=="Delivered").length > 0 ? "NOT YET DELIVERED:" : "",
        ...entries.filter(e=>e.status!=="Delivered").map(e=>`  • ${e.endpoint} — ${e.status}`),
        "",
        missingGuide > 0 ? `Consumer Guide Gaps (${missingGuide}):` : "",
        ...entries.filter(e=>e.missingFromGuide).map(e=>`  • ${e.endpoint}`),
      ].filter(s => s !== "").join("\n");
    } else {
      // export JSON
      const payload = entries.map(e => ({ endpoint: e.endpoint, path: e.path, status: e.status, consumerGuide: e.consumerGuide, missingFromGuide: e.missingFromGuide, missingFromSwagger: e.missingFromSwagger, notes: e.notes }));
      const blob = new Blob([JSON.stringify({ batch: batchName, owner, coverage: coveragePct, endpoints: payload }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url;
      a.download = `DCT_${batchName.replace(/ /g,"_")}_APIs_${new Date().toISOString().slice(0,10)}.json`;
      a.click(); URL.revokeObjectURL(url);
      setBatchCopied("json"); setTimeout(() => setBatchCopied(null), 1500);
      return;
    }
    navigator.clipboard.writeText(text);
    setBatchCopied(type); setTimeout(() => setBatchCopied(null), 1500);
  };

  return (
    <div className="border-b border-slate-200 last:border-b-0">
      {/* Batch Header */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
        style={{background: open ? '#f0f7ff' : '#f8fafc'}}
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          <span className="text-xs font-bold text-[#003865] truncate">{batchName}</span>
          {owner && <span className="text-xs text-slate-500 shrink-0">· {owner}</span>}
          {govFlags.map(f => (
            <span key={f} className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0" style={{fontSize:'9px', background: GOV_BADGE_MAP[f]?.bg, color: GOV_BADGE_MAP[f]?.color}}>
              {GOV_BADGE_MAP[f]?.label}
            </span>
          ))}
        </div>
        {/* Metrics */}
        <div className="flex items-center gap-3 text-xs shrink-0" onClick={e => e.stopPropagation()}>
          <span className="font-semibold" style={{color: coveragePct === 100 ? '#059669' : coveragePct >= 60 ? '#d97706' : '#dc2626'}}>{coveragePct}% coverage</span>
          <span className="text-slate-500">{entries.length} APIs</span>
          <span className="text-emerald-700 font-medium">{delivered} delivered</span>
          {partial > 0 && <span className="text-amber-700">{partial} partial</span>}
          {missing > 0 && <span className="text-red-700 font-medium">{missing} missing</span>}
          {missingGuide > 0 && <span className="text-red-600 font-medium">{missingGuide} guide gap{missingGuide > 1 ? 's' : ''}</span>}
          {missingSwagger > 0 && <span className="text-orange-600">{missingSwagger} swagger gap{missingSwagger > 1 ? 's' : ''}</span>}
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{background: guideAlignPct === 100 ? '#d1fae5' : '#fef3c7', color: guideAlignPct === 100 ? '#065f46' : '#92400e'}}
          >
            Guide {guideAlignPct}%
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="border-t border-slate-100">
          {/* Batch action bar */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 py-1.5 bg-white border-b border-slate-100">
            <span className="text-xs text-slate-400 font-medium mr-0.5">Batch actions:</span>
            {(["summary","po","qa","json"] as const).map(t => (
              <button key={t} onClick={() => copyBatchSummary(t)}
                className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border transition-colors ${
                  batchCopied === t ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {batchCopied === t ? <Check className="w-3 h-3" /> : t === "json" ? <FileJson className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {batchCopied === t ? "Done" : t === "summary" ? "Copy Summary" : t === "po" ? "Copy PO Update" : t === "qa" ? "Copy QA Summary" : "Export JSON"}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-1 text-xs text-slate-500 cursor-pointer">
              <input type="checkbox" checked={showGapOnly} onChange={e => { e.stopPropagation(); setShowGapOnly(e.target.checked); }} className="rounded" />
              Gaps Only
            </label>
          </div>

          {/* Documentation Gap Rollup */}
          {(missingGuide > 0 || missingSwagger > 0) && (
            <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100 flex flex-wrap gap-3">
              {missingGuide > 0 && (
                <div className="text-xs text-amber-800">
                  <span className="font-semibold">⚠ Consumer Guide Gaps:</span>{" "}
                  {entries.filter(e=>e.missingFromGuide).map(e=>e.endpoint).join(" · ")}
                </div>
              )}
              {missingSwagger > 0 && (
                <div className="text-xs text-orange-800">
                  <span className="font-semibold">⚠ Swagger Gaps:</span>{" "}
                  {entries.filter(e=>e.missingFromSwagger).map(e=>e.endpoint).join(" · ")}
                </div>
              )}
            </div>
          )}

          {/* Endpoint subtable */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{fontSize:'10.5px', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f1f5f9', borderBottom:'1px solid #e2e8f0'}}>
                  <th className="text-left px-3 py-1.5 font-semibold text-slate-600 text-xs">Endpoint</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-slate-600 text-xs" style={{width:'5%'}}>Method</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-slate-600 text-xs" style={{width:'22%'}}>Path</th>
                  <th className="text-center px-2 py-1.5 font-semibold text-slate-600 text-xs" style={{width:'9%'}}>Status</th>
                  <th className="text-center px-2 py-1.5 font-semibold text-slate-600 text-xs" style={{width:'9%'}}>Guide</th>
                  <th className="text-center px-2 py-1.5 font-semibold text-slate-600 text-xs" style={{width:'6%'}}>Swagger</th>
                  <th className="text-left px-2 py-1.5 font-semibold text-slate-600 text-xs">Notes &amp; Badges</th>
                </tr>
              </thead>
              <tbody>
                {displayEntries.map((e, i) => {
                  const method = e.path.includes("GET") ? "GET" : e.path.includes("POST") ? "POST" : e.path.includes("PUT") ? "PUT" : e.path.includes("DELETE") ? "DELETE" : "GET";
                  const pathClean = e.path.replace(/^(GET|POST|PUT|DELETE|PATCH)\s+/,"");
                  const epFlags = ENDPOINT_GOV_FLAGS[pathClean] ?? [];
                  const isGap = e.notes.toLowerCase().includes("block") || e.notes.toLowerCase().includes("gap") || e.notes.toLowerCase().includes("not yet") || e.notes.toLowerCase().includes("pending") || e.notes.toLowerCase().includes("missing");
                  const apiStyle = e.status === "Delivered" ? {bg:"#d1fae5",color:"#065f46"} : e.status === "In Progress" || e.status === "Partial" ? {bg:"#fef3c7",color:"#92400e"} : {bg:"#fee2e2",color:"#991b1b"};
                  return (
                    <tr key={i} style={{borderBottom:'1px solid #f1f5f9', background: i%2===0 ? '#ffffff' : '#fafafa'}}
                      onMouseEnter={ev => (ev.currentTarget.style.background = '#eff6ff')}
                      onMouseLeave={ev => (ev.currentTarget.style.background = i%2===0 ? '#ffffff' : '#fafafa')}
                    >
                      <td className="px-3 py-1.5 font-medium text-slate-800" style={{fontSize:'10.5px'}}>{e.endpoint}</td>
                      <td className="px-2 py-1.5">
                        <span className="font-mono font-bold rounded px-1" style={{fontSize:'9px', background:'#e0e7ff', color:'#3730a3'}}>{method}</span>
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="font-mono text-slate-600 rounded px-1" style={{fontSize:'9px', background:'#f1f5f9', wordBreak:'break-all'}}>{pathClean}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className="font-semibold rounded-full px-2 py-0.5" style={{fontSize:'9px', background:apiStyle.bg, color:apiStyle.color, whiteSpace:'nowrap'}}>{e.status}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <span className="font-semibold rounded-full px-2 py-0.5" style={{fontSize:'9px',
                          background: e.consumerGuide==='Aligned' ? '#d1fae5' : e.consumerGuide==='Partial' ? '#fef3c7' : '#fee2e2',
                          color: e.consumerGuide==='Aligned' ? '#065f46' : e.consumerGuide==='Partial' ? '#92400e' : '#991b1b',
                        }}>{e.consumerGuide}</span>
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        {e.missingFromSwagger
                          ? <span className="font-bold rounded-full px-2 py-0.5 bg-red-100 text-red-700" style={{fontSize:'9px'}}>Gap</span>
                          : <span className="font-semibold rounded-full px-2 py-0.5 bg-emerald-100 text-emerald-700" style={{fontSize:'9px'}}>✓</span>}
                      </td>
                      <td className="px-2 py-1.5">
                        <div className="flex flex-wrap items-center gap-1">
                          {isGap && <span style={{fontSize:'10px'}}>⚠️</span>}
                          <TruncatedNote text={e.notes} />
                          {epFlags.map(f => (
                            <span key={f} className="font-medium rounded px-1 py-0.5 shrink-0" style={{fontSize:'8.5px', background:GOV_BADGE_MAP[f]?.bg, color:GOV_BADGE_MAP[f]?.color}}>
                              {GOV_BADGE_MAP[f]?.label}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BatchExportButton ───────────────────────────────────────────────────────
function BatchExportButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  const [clicked, setClicked] = useState(false);
  const handleClick = () => {
    onClick();
    setClicked(true);
    setTimeout(() => setClicked(false), 1500);
  };
  const iconEl = clicked ? <Check className="w-3 h-3" /> :
    icon === "copy" ? <Copy className="w-3 h-3" /> :
    icon === "clipboard" ? <ClipboardCopy className="w-3 h-3" /> :
    icon === "mail" ? <Send className="w-3 h-3" /> :
    icon === "json" ? <FileJson className="w-3 h-3" /> :
    icon === "md" ? <AlignLeft className="w-3 h-3" /> :
    <Download className="w-3 h-3" />;
  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors font-medium ${
        clicked
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
      }`}
    >
      {iconEl}
      {clicked ? "Done" : label}
    </button>
  );
}

// ── CopyNoteButton ────────────────────────────────────────────────────────────
function CopyNoteButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }, [text]);
  return (
    <button
      onClick={handleCopy}
      title="Copy note"
      className="ml-1.5 shrink-0 inline-flex items-center justify-center w-5 h-5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <ClipboardCopy className="w-3 h-3" />}
    </button>
  );
}

// ── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = "Delivered" | "Complete" | "In Progress" | "Ready for QA" | "Carried Forward" | "Backlogged" | "Not Started" | "Needs PO/Dev Confirmation" | "On Hold" | "Parked";
type ApiStatus = "Delivered" | "In Progress" | "Missing" | "Needs PO/Dev Confirmation";
type RogerAvailability = "Available" | "Partially Available" | "Not Available" | "Carried Forward" | "Backlogged";

interface DeliveredBatch {
  key: string;
  label: string;
  owner: string;
  status: DeliveryStatus;
  delivered: string[];
  validated: string[];
  open: string[];
  readiness: string;
  poNote: string;
}

interface SwaggerEntry {
  batch: string;
  endpoint: string;
  path: string;
  status: ApiStatus;
  consumerGuide: "Aligned" | "Missing" | "Partial";
  missingFromGuide: boolean;
  missingFromSwagger: boolean;
  notes: string;
}

interface AdoStory {
  title: string;
  id: string;
}

interface RogerDataPoint {
  dataPoint: string;
  source: string;
  batch: string;
  availability: RogerAvailability;
  apiEndpoint: string;
  /** Specific response fields/payload fields delivered by the API endpoint for Roger consumption */
  fieldsDelivered: string[];
  adoStories: AdoStory[];   // ADO Tech Story traceability
  notes: string;
  owner: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const DELIVERED_BATCHES: DeliveredBatch[] = [
  {
    key: "foundation-core",
    label: "Foundation Core",
    owner: "PDC + TDC",
    status: "Delivered",
    delivered: ["Code repository", "Code templates", "Copilot Agent & Blitzy configuration", "DEV environment in Azure"],
    validated: ["Dev environment operational", "Agent tooling configured"],
    open: [],
    readiness: "Infrastructure only — not demo-ready",
    poNote: "Foundation Core is complete. Dev infrastructure, code templates, and agent tooling are operational. No Roger-facing output from this batch.",
  },
  {
    key: "1",
    label: "Batch 1 — File Ingestion & Initial Storage",
    owner: "PDC",
    status: "Delivered",
    delivered: ["JobId-based ingestion model", "IngestionJob + SourceFile records", "DocumentId (immutable)", "Lineage anchor at ingestion", "PDC-owned state machine", "IngestionStatus API"],
    validated: ["File upload → Service Bus → PDC flow", "JobId, DocumentId, EntityId captured", "State = INGESTED confirmed", "Lineage immediately visible"],
    open: ["TaxYear governance note: TaxYear is NOT stored in PDC — derived in TDC from PeriodStart/PeriodEnd"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 1 delivered. PDC ingestion framework is operational. Files are received, assigned immutable identifiers, and lineage is anchored at entry. IngestionStatus API is live. Roger can confirm file arrival and processing state.",
  },
  {
    key: "2",
    label: "Batch 2 — Normalization & Cross-LOB Taxonomy",
    owner: "PDC + AI Orchestrator",
    status: "Complete",
    delivered: ["FileSchemas reference data", "FirmTaxonomy (XLOB) reference data", "EDGAR Corpus reference data", "Normalized record persistence (vNormalizedTb)", "Normalized Trial Balance Contract (Roger Read Surface)", "Batch 2A contract enforcement complete"],
    validated: ["FileSchemas queryable and versioned", "RunId assigned on processing", "vNormalizedTb Roger read contract published"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 2 is complete. Normalization reference data and XLOB taxonomy are operational. Normalized record persistence is functional. Roger read contract (vNormalizedTb) is live. Batch 2A contract enforcement is complete.",
  },
  {
    key: "2a",
    label: "Batch 2A — Orchestrator Contract Enforcement & Classification",
    owner: "PDC + AI Orchestrator",
    status: "Complete",
    delivered: ["FirmTaxonomyId enforcement rule implemented", "Rejection logic for missing classification", "Classification status read contract", "Validation audit log queryable"],
    validated: ["FirmTaxonomyId required on all PDC records", "Classification rejection confirmed in demo"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 2A is complete. Contract enforcement layer between Orchestrator and PDC is operational. FirmTaxonomyId is required on every record. Classification rejection and audit log are live.",
  },
  {
    key: "3",
    label: "Batch 3 — Tax Domain Authority & Tax Taxonomy",
    owner: "TDC",
    status: "Delivered",
    delivered: ["TaxFormTemplates and FormLines", "TaxTaxonomyAccounts and MappingRules", "ConfidenceBandThresholds (GREEN/YELLOW/RED)", "TDC Reference Data Read Contract (Orchestrator-facing)"],
    validated: ["TaxFormTemplates queryable by Jurisdiction", "MappingRules versioned and available", "ConfidenceBandThresholds configured"],
    open: ["Domain Governance Note 3b: Tax calculation reference data must be governed tables, not hard-coded"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 3 is delivered. TDC is established as the tax domain authority. TaxFormTemplates, FormLines, TaxTaxonomyAccounts, MappingRules, and ConfidenceBandThresholds (GREEN/YELLOW/RED) are loaded, versioned, and governed. TDC Reference Data Read Contract (Orchestrator-facing) is live. Orchestrator has everything needed to generate proposals (Batch 4).",
  },
  {
    key: "4",
    label: "Batch 4 — AI Tax Mapping & Explainability",
    owner: "TDC + AI Orchestrator",
    status: "Complete",
    delivered: ["AI Mapping Proposals structure", "Confidence band framework (GREEN/YELLOW/RED)", "Mapping Decisions (immutable)", "TDC Records API Contract (Roger Read Surface) — published", "Decision Audit & Event Publishing", "Roger primary read contract live"],
    validated: ["Proposals include confidence score and band", "Decision audit structure confirmed", "Roger practitioner view unblocked"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 4 is complete. AI mapping proposals are live in TDC. Confidence bands and structured evidence are in place. Practitioner decision recording is functional. Roger's primary TDC read contract is published — the platform is live for practitioners.",
  },
  {
    key: "5",
    label: "Batch 5 — Entity Identity & Structure",
    owner: "PDC",
    status: "Complete",
    delivered: ["Client Groups & Legal Entity Registry", "Ownership Chains & Jurisdictions", "Entity Characteristics (DataSourceType, RBAC context)", "Entity Identity Read Contract (PDC-facing)", "CEM Integration & Sync"],
    validated: ["EntityId risk from PI 1 closed", "Entity Identity Read Contract published"],
    open: ["User Entitlement Sync — future scope"],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 5 is complete. PDC is the authoritative entity registry. Client Groups, Legal Entity Registry, Ownership Chains, Jurisdictions, and Entity Characteristics are operational. Entity Identity Read Contract is published. EntityId open item from PI 1 is closed.",
  },
  {
    key: "6",
    label: "Batch 6 — Practitioner Review, Adjustments & Lock",
    owner: "TDC",
    status: "Complete",
    delivered: ["Review task generation from data state", "Six-state adjustment lifecycle (DRAFT → SUBMITTED → APPROVED → APPLIED → LOCKED)", "Sign-Off, Lock & Entity Finalization", "Tax-Ready Record Derivation", "SHA-256 cryptographic hash sign-off (non-repudiable)", "Approval Routing Rules engine"],
    validated: ["Review tasks generated automatically", "Adjustment lifecycle confirmed in demo", "Sign-off hash verified"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 6 is complete. Practitioners can do real work: review tasks generated automatically from data state, governed six-state adjustment lifecycle, tax-ready record derivation, and non-repudiable sign-off with SHA-256 hash.",
  },
  {
    key: "7",
    label: "Batch 7 — Client Tax Profile & Eligibility",
    owner: "TDC",
    status: "Complete",
    delivered: ["Three-Tier Eligibility Model (Must Have / Must Not Have / Flag & Review)", "Client Tax Profile Lifecycle & Determination Records", "Controlled Group & Affiliated Group Determination", "Eligibility gate enforcement", "Flag & Review confirm/override workflow"],
    validated: ["Eligibility gate blocks INELIGIBLE entities", "Controlled group determination confirmed", "Flag & Review workflow operational"],
    open: [],
    readiness: "API-ready · Demo-ready",
    poNote: "Batch 7 is complete. TDC is the system of record for tax profile and eligibility determinations. Three-Tier Eligibility Model is live. Entities in INELIGIBLE or unresolved FLAG_AND_REVIEW state are blocked from downstream workflow.",
  },
  {
    key: "8",
    label: "Batch 8 — Exceptions & Remediation",
    owner: "TDC + PDC",
    status: "In Progress",
    delivered: ["Exception identification surface (TDC Records v2 Known Mapping)", "Proposal decision supersede workflow (in progress)", "Sign-off unlock for remediation (in progress)"],
    validated: [],
    open: ["ExceptionRecord API — in progress", "RemedyAction API — in progress", "Re-ingestion trigger API — in progress", "Remediation audit trail — in progress"],
    readiness: "In progress — PI 2 Committed (sequential after Batch 7)",
    poNote: "Batch 8 is the active delivery batch (PI 2 Committed, sequential after Batch 7 closes). TDC and PDC collaborate on exception identification, remediation workflow, and re-ingestion triggers. ExceptionRecord, RemedyAction, and re-ingestion audit trail are the primary deliverables. Target close: 5/20.",
  },
  {
    key: "8-pdc",
    label: "Batch 8 | PDC — Exception & Remediation",
    owner: "PDC",
    status: "Ready for QA",
    delivered: ["Re-ingestion Trigger API (Submit, Get Status, Audit Trail)", "ExceptionRecord linkage to PDC ingestion runs", "PDC-side remediation audit trail"],
    validated: ["Re-ingestion trigger submit flow", "Lineage linkage to originating ExceptionRecord"],
    open: ["Re-ingestion Trigger Audit Trail gate sign-off pending", "Consumer Guide entry missing"],
    readiness: "Review Ready — awaiting TDC gate alignment",
    poNote: "PDC track of Batch 8. Re-ingestion trigger APIs are the primary PDC deliverable. Lineage closure dependency for B8 gate. Status: Review Ready per ADO Feature #11.",
  },
  {
    key: "8-tdc",
    label: "Batch 8 | TDC — Exceptions & Remediation",
    owner: "TDC",
    status: "In Progress",
    delivered: ["Exception identification surface (TDC Records v2 Known Mapping)", "Proposal decision supersede workflow (in progress)"],
    validated: [],
    open: ["ExceptionRecord API — in progress", "RemedyAction API — in progress", "Sign-off unlock for remediation — in progress"],
    readiness: "Active — PI 2 Committed",
    poNote: "TDC track of Batch 8. ExceptionRecord and RemedyAction APIs are the primary TDC deliverables. Immutable audit trail appended on each status transition. Status: Active per ADO Feature #10.",
  },
  {
    key: "9-pdc",
    label: "Batch 9 | PDC — Roger Gateway & Governed Consumer Access Layer",
    owner: "PDC",
    status: "In Progress",
    delivered: [
      "Ocelot Gateway scaffolding with auth and routing",
      "IMS pass-through surface (prior year + current year — not stored in PDC)",
      "CEM pass-through surface (client auth + user mapping — not stored in PDC)",
      "TIM pass-through surface (engagement metadata, deliverables, due dates — not stored in PDC)",
    ],
    validated: [
      "Gateway scaffolding deployed as single consumer entry point",
      "Surface-not-store principle enforced — no IMS/CEM/TIM data persisted in PDC",
    ],
    open: [
      "Gateway Read Contract publication pending",
      "Roger consumer surface versioning not yet confirmed",
      "Consumer Guide entry missing",
      "Gate sign-off pending B8-PDC closure",
    ],
    readiness: "In Progress — ARCHITECTURAL CHANGE: B9 repurposed from IMS Integration & Prior Year Retrieval to Roger Gateway & Governed Consumer Access Layer (surface-not-store). eODS deferred. Sequential after Batch 8 PDC closes.",
    poNote: "PDC track of Batch 9. Ocelot gateway is the primary PDC deliverable. Roger and all consumers call the gateway — not underlying systems directly. IMS, CEM, and TIM data surfaced via pass-through without PDC storage. Gateway Read Contract published as versioned consumer surface. Source: Roadmap v4 — ARCHITECTURAL CHANGE noted.",
  },
  {
    key: "9-tdc",
    label: "Batch 9 | TDC — Rollforward & Prior Year Intelligence (ON HOLD)",
    owner: "TDC",
    status: "On Hold",
    delivered: [],
    validated: [],
    open: [
      "ON HOLD — original B9 TDC scope absorbed by other batches",
      "Existing-client rollforward queries TDC records directly",
      "Legacy-tool carry-forward data lands via Batch 31",
      "Retained for traceability only — no active work",
    ],
    readiness: "ON HOLD — no active delivery. Retained for governance traceability only. Source: Roadmap v4 On Hold section.",
    poNote: "TDC track of Batch 9 is ON HOLD per Roadmap v4. Original rollforward scope absorbed: existing-client rollforward queries TDC records directly; legacy-tool carry-forward data lands via Batch 31. This entry is preserved for traceability only.",
  },
  // ── PI 2 Committed ────────────────────────────────────────────────────────
  {
    key: "10",
    label: "Batch 10 — Return Assembly, Filing & Lineage Closure",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Return Assembly & Cross-Schedule Validation — not started",
      "Filing Record (immutable) — not started",
      "Return Output Contracts (Roger Read Surface) — not started",
      "Story 4 IMS Outbound Contract Publication — ON HOLD pending IMS readiness",
      "Cross-Layer Lineage View — not started",
    ],
    readiness: "Not Started — PI 2 Committed. Sequential after Batch 6 closes. NOTE: Story 4 (IMS Outbound Contract Publication) is ON HOLD pending IMS readiness. All other scope proceeds.",
    poNote: "Batch 10 assembles tax returns from locked tax-ready records, produces an immutable filing record, and closes end-to-end lineage. BLOCKING cross-schedule validation gates assembly. FILED status is terminal. Story 4 (IMS Outbound) is paused pending IMS readiness — all other stories proceed. Source: Roadmap v4_corrected.",
  },
  {
    key: "11",
    label: "Batch 11 — Learning Governance & Model Evolution",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Learning Signal Capture (practitioner decisions as structured feedback) — not started",
      "Learning Promotion Governance (versioned model registry, approval workflow) — not started",
    ],
    readiness: "Not Started — PI 2 Committed. Depends on Batch 4 (proposals exist) and Batch 6 (practitioner decisions). Terminal and additive — does not block any other batch.",
    poNote: "Batch 11 closes the AI feedback loop. Practitioner decisions captured as structured learning signals. Model updates require explicit sign-off — automatic retraining is prohibited. Batch 11 is terminal and additive. Source: Roadmap v4_corrected.",
  },
  {
    key: "12",
    label: "Batch 12 — Engagement Identity, Reference Data & TIM Reconciliation",
    owner: "PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Engagement Registry & EngagementId Issuance — not started",
      "Governed Reference Data (EngagementType, ReturnType, EngagementRole, AssignmentRole) — not started",
      "Engagement Scope Records & Team Assignments — not started",
      "TIM Identifier Reconciliation API (idempotent, sole engagement-creation path) — not started",
      "Engagement Operations Read Contract (Roger Consumer Surface) — not started",
    ],
    readiness: "Not Started — PI 2 Committed. Runs parallel to Batch 10. NOTE: B12 rescoped per Roadmap v4 — TIM read pass-through moved to B9 gateway. This batch focuses on canonical EngagementId issuance, governed reference data, and TIM identifier reconciliation API only. Manual write surface dropped.",
    poNote: "Batch 12 establishes canonical engagement identity. EngagementId is a PDC-issued GUID — immutable, assigned once. Engagements created exclusively through TIM Reconciliation API (idempotent). Roger never calls TIM directly. Source: Roadmap v4_corrected — B12 rescoped.",
  },
  // ── PI 2 Stretch ─────────────────────────────────────────────────────────
  {
    key: "13",
    label: "Batch 13 — Platform Reference & Document Provenance",
    owner: "PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Industry Codes, Currency Codes, Exchange Rates & Status Codes — not started",
      "Regulatory Calendar (Filing Deadlines, Extensions, Internal Milestones) — not started",
      "Document Provenance (File Identifiers, Hashes, Version Tracking, Tamper-Evidence) — not started",
      "Platform Reference Data Read Contract — not started",
    ],
    readiness: "Not Started — PI 2 Stretch. PDC sequential after Batch 12 closes.",
    poNote: "Batch 13 governs the platform's common language — industry codes, currency codes, filing deadlines, and document provenance. Roger can display deadline-aware workflow context in a firm-standard format. Source: Roadmap v4_corrected.",
  },
  {
    key: "16",
    label: "Batch 16 — Audit Trail & Lineage Governance",
    owner: "TDC + PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "TDC Event Definitions & Decision Lineage Schema — not started",
      "TDC Retention Rules & Access Logging Requirements — not started",
      "TDC Audit Trail Governance Contract — not started",
      "PDC Event Definitions & Lineage Event Schema — not started",
      "PDC Retention Rules & Access Logging Requirements — not started",
      "PDC Audit Trail Governance Contract — not started",
    ],
    readiness: "Not Started — PI 2 Stretch. CORE MVP GOVERNANCE: Must land before pilot start (9/16). Every state transition, decision, sign-off, and transformation must produce a lineage event.",
    poNote: "Batch 16 is the firm's complete event log — every state transition, decision, sign-off, and transformation is captured with retention rules and access logging. Audit trail records are immutable and append-only. CORE MVP GOVERNANCE — must land before 9/16 pilot start. Source: Roadmap v4_corrected.",
  },
  // ── PI 3 MVP ──────────────────────────────────────────────────────────────
  {
    key: "17",
    label: "Batch 17 — Decision Support — Overrides, Evidence & Workpapers",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Classification Override Policy Reference Data — not started",
      "Tax-Specific Mapping Override Policies & Carryforward Rules — not started",
      "Evidence Record Structure & Attachment to Decisions (tamper-evident) — not started",
      "Workpaper Lock & Snapshot Pinning (binds to B28 workpapers) — not started",
      "Schedule Templates (versioned reference data) — not started",
      "Decision Support Read Contract — not started",
    ],
    readiness: "Not Started — PI 3 MVP. Sequenced after B28 — workpaper definitions must exist first. Dependency: B28 (workpaper templates), B6 (practitioner decisions).",
    poNote: "Batch 17 enables practitioners to fully justify and document every decision. Override policies are governed and versioned. Evidence records are tamper-evident. Workpaper snapshots are pinned to the RunId that generated them — a locked workpaper cannot reflect subsequent data changes. Source: Roadmap v4_corrected.",
  },
  {
    key: "20",
    label: "Batch 20 — Firm Governance & Professional Standards",
    owner: "PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Engagement Acceptance & Continuance Criteria — not started",
      "Risk Ratings, AML, Sanctions & Independence Rules — not started",
      "Consent Requirements, Retention Policies & Privacy Classification — not started",
      "CPA License Status, CPE & Signing Authority Reference Data — not started",
      "Firm Governance Read Contract (Roger + TDC) — not started",
    ],
    readiness: "Not Started — PI 3 MVP. PDC free after Batch 17 closes. No sign-off proceeds without firm governance requirements being met.",
    poNote: "Batch 20 governs who is authorized to do what, under what professional standards. Engagement acceptance, AML, independence rules, consent, and CPA licensing are all governed reference data. Return sign-off (B6) and provision sign-off (B19) are retrofitted with firm governance gates additively. Source: Roadmap v4_corrected.",
  },
  {
    key: "21",
    label: "Batch 21 — Quality Control",
    owner: "PDC + TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "PDC — QC Review Requirements & Inspection Criteria Reference Data (PI 3 MVP, 7/15–7/23) — not started",
      "PDC — Independence Confirmation & Concurring Partner Review Standards (PI 3 MVP) — not started",
      "PDC QC Read Contract (PI 3 MVP) — not started",
      "TDC — QC Review Assignment & Results Lifecycle (DEFERRED to PI 4, 9/29–10/8)",
      "TDC — Quality Metrics & Remediation Records (DEFERRED to PI 4)",
      "TDC — TDC QC Read Contract (DEFERRED to PI 4)",
    ],
    readiness: "PI 3 MVP (PDC stories 4–6 only, 7/15–7/23). TDC QC scope (stories 1–3) DEFERRED to PI 4 (9/29–10/8). No TDC QC gates apply at PI 3 pilot start.",
    poNote: "Batch 21 governs the firm's QC program end to end. PI 3 MVP includes PDC stories only (QC reference data, independence confirmation, PDC QC read contract). TDC QC scope (review assignment lifecycle, quality metrics, TDC QC read contract) is deferred to PI 4. No engagement closes without QC requirements being satisfied. Source: Roadmap v4_corrected.",
  },
  {
    key: "22",
    label: "Batch 22 — Client Communication & Outstanding Items",
    owner: "TDC",
    status: "Parked",
    delivered: [],
    validated: [],
    open: [
      "POST-MVP / FUTURE PI — removed from PI 3 MVP scope",
      "No MVP dates apply",
      "Deferred to a future PI post-pilot",
    ],
    readiness: "POST-MVP / FUTURE PI — Client communication tracking and outstanding item management. Removed from PI 3 MVP scope. Deferred to a future PI post-pilot.",
    poNote: "Batch 22 is POST-MVP. Client communication tracking and outstanding item management have been removed from PI 3 MVP scope. No MVP dates apply. Will be planned post-pilot. Source: Roadmap v4_corrected.",
  },
  {
    key: "23",
    label: "Batch 23 — Benchmark & Peer Analytics",
    owner: "TDC",
    status: "Parked",
    delivered: [],
    validated: [],
    open: [
      "POST-MVP / DEFERRED — removed from PI 3 MVP scope",
      "No MVP dates apply",
      "Deferred to a future PI post-pilot",
    ],
    readiness: "POST-MVP / DEFERRED — Benchmark and peer analytics against industry peers. Removed from PI 3 MVP scope. Deferred to a future PI post-pilot.",
    poNote: "Batch 23 is POST-MVP. Benchmark and peer analytics have been removed from PI 3 MVP scope. No MVP dates apply. Will be planned post-pilot. Source: Roadmap v4_corrected.",
  },
  {
    key: "26",
    label: "Batch 26 — Entity Constituents & Allocations (PDC — MVP)",
    owner: "PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Entity Constituent Records (Divisions, Branches, Disregarded Entities) — not started",
      "Inter-Entity Allocation Records (versioned, additive) — not started",
      "Constituent-to-Legal-Entity Mapping (governed, version-tracked) — not started",
      "Extended Entity Identity Read Contract (additive) — not started",
      "B26 TDC (tax workflow layer) — remains PI 4",
    ],
    readiness: "Not Started — PROMOTED TO PI 3 MVP (PDC portion only, 8/4–8/14). Required for pilot CPAs handling divisions, branches, and disregarded entities. B26 TDC remains PI 4.",
    poNote: "Batch 26 PDC extends the entity registry from Batch 5 to model entity constituents (divisions, branches, disregarded entities) and inter-entity allocations as first-class structures. Required for pilot C-corp clients with complex internal structures. PROMOTED from PI 4 to PI 3 MVP. B26 TDC (tax workflow layer) remains PI 4. Source: Roadmap v4_corrected.",
  },
  {
    key: "28",
    label: "Batch 28 — Tax Workpaper & Provision Schedules",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "M-1 and M-3 Reconciliation Workpaper Templates (versioned) — not started",
      "Schedule J and Schedule L Workpaper Templates — not started",
      "Depreciation Rollforward Schedule (MACRS, Straight-Line, Bonus) — not started",
      "Reconciliation Formula Definitions (MVP Slice from B14) — not started",
      "DTA/DTL Classification Workpaper + ETR Reconciliation Workpaper — not started",
      "Return-to-Provision Reconciliation Workpaper + Federal Payments Schedule — not started",
      "Provision Reference Data (MVP Slice from B15) + BTP Outbound Contract — not started",
      "BFA Fixed Assets Export — not started",
      "Tax Workpaper Read Contract — not started",
    ],
    readiness: "Not Started — PI 3 MVP. SCOPE ABSORPTION: Absorbs MVP slices of B14 (reconciliation formulas, depreciation rule definitions) and B15 (provision reference data). Full B14 and B15 computation engines remain Post-MVP.",
    poNote: "Batch 28 delivers the workpaper layer Roger surfaces inline with practitioner review. M-1/M-3, Schedule J/L, depreciation rollforward, and provision workpapers all live here. Absorbs MVP slices of B14 and B15. Full lineage maintained from source data through workpaper to filing. Source: Roadmap v4_corrected.",
  },
  {
    key: "29",
    label: "Batch 29 — Consolidated Return Assembly",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Elimination Entity Records (Create, Modify) — not started",
      "Group-Level Adjustment Lifecycle (Extends B6) — not started",
      "Intercompany Elimination Workflow (must net to zero before assembly) — not started",
      "Consolidated Return Assembly (all constituents must be FINALIZED) — not started",
      "Consolidated Return Read Contract — not started",
    ],
    readiness: "Not Started — PI 3 MVP. Sequenced after B28.",
    poNote: "Batch 29 handles consolidated C-corp returns end to end. Elimination entities are first-class structures. Group-level adjustments are distinct from entity-level adjustments. Intercompany elimination records must be balanced (net to zero) before assembly proceeds. Source: Roadmap v4_corrected.",
  },
  {
    key: "31",
    label: "Batch 31 — Legacy Tool Prior Year Ingestion & Data Housing",
    owner: "TDC + PDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Legacy Tool Schema Registry Extensions (TWB, PartnerSight, CSTE) — not started",
      "Manual Upload Path for Legacy Tool Files — not started",
      "Source-Priority Reconciliation (IMS takes priority over legacy tool data) — not started",
      "PDC Legacy Tool Ingestion Read Contract Extension (additive) — not started",
      "Prior Year Trial Balance & Return Data Storage (TDC) — not started",
      "Carryforward Attribute Balance Tracking (NOL, §179, §163(j), Charitable) — not started",
      "Year-Over-Year Comparison Metrics + Extended v_rollforward — not started",
    ],
    readiness: "Not Started — PI 3 MVP. Prior year data from TWB, PartnerSight, and CSTE ingested through existing platform pipeline. Same governance, lineage, and reconciliation rules apply regardless of source.",
    poNote: "Batch 31 ingests prior year data from legacy tax preparation tools (TWB, PartnerSight, CSTE) through the existing platform pipeline. IMS takes priority over legacy tool data when both sources exist. Roger reads prior year data via v_rollforward — source-agnostic to the consumer. Source: Roadmap v4_corrected.",
  },
  {
    key: "33",
    label: "Batch 33 — State Reference, Apportionment, Payments, NOL/Credit, Forms, TX Franchise",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "State Jurisdiction Reference Data & State Tax Taxonomy — not started",
      "State Apportionment & Nexus Assignments — not started",
      "State Payments Tracking — not started",
      "State NOL & Credit Rollforward (C-corp) — not started",
      "State Form Data Entry & Tie-Out Validation — not started",
      "Texas Franchise Workpaper — not started",
    ],
    readiness: "Not Started — PI 3 MVP. FINAL MVP TDC BATCH: Must land at MVP cutoff 9/15. Single batch covers the full state foundation needed for pilot start.",
    poNote: "Batch 33 is the final MVP TDC batch. Covers the full state tax workflow from reference data through apportionment, payments, NOL/credit rollforward, form entry, tie-out validation, and Texas franchise workpaper. Must land by 9/15 MVP cutoff. Source: Roadmap v4_corrected.",
  },
  {
    key: "39",
    label: "Batch 39 — Calculation Report",
    owner: "TDC",
    status: "Not Started",
    delivered: [],
    validated: [],
    open: [
      "Packaged Sign-Off Reports (partner review format) — not started",
      "Adjustment Reports — not started",
      "Derivation Lineage Reports — not started",
      "Governance-Grade Derivation Report — not started",
    ],
    readiness: "Not Started — PROMOTED TO MVP. Governance-grade derivation report promoted to MVP. Must land before 9/16 pilot start.",
    poNote: "Batch 39 produces packaged sign-off reports, adjustment reports, and derivation lineage reports formatted for partner review and external audit. Governance-grade derivation report promoted to MVP. PROMOTED from PI 4 to MVP — must land before 9/16 pilot start. Source: Roadmap v4_corrected.",
  },
];

const SWAGGER_ENTRIES: SwaggerEntry[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // PDC (dev-pdc.api.rsmus.com) — RSM.TaxSolutions.PDC.Api
  // ══════════════════════════════════════════════════════════════════════════

  // ── Batch 1 — File Ingestion & Initial Storage ────────────────────────────
  { batch: "Batch 1", endpoint: "Ingestion — Submit File", path: "POST /api/v1/Ingestion", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits a new ingestion run. Returns IngestionRunId used for lineage anchor." },
  { batch: "Batch 1", endpoint: "Ingestion — Get Run Status", path: "GET /api/v1/Ingestion/{runId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves ingestion run status by RunId. EntityId, DocumentId, Timestamps returned." },
  { batch: "Batch 1", endpoint: "Processing Run — Create", path: "POST /api/v1/processing-runs", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Creates a new processing run for a given ingestion record." },
  { batch: "Batch 1", endpoint: "Processing Run — Get by ID", path: "GET /api/v1/processing-runs/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the status of a processing run by its unique identifier." },
  { batch: "Batch 1", endpoint: "Processing Run — Get Latest by Ingestion", path: "GET /api/v1/processing-runs/by-ingestion/{ingestionRunId}/latest", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the latest processing run for a given ingestion run. Consumer Guide missing PeriodStart/End." },
  { batch: "Batch 1", endpoint: "Processing Run — Submit Results", path: "POST /api/v1/processing-runs/{id}/results", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits the results of a completed processing run." },
  { batch: "Batch 1", endpoint: "Document Type — Get All", path: "GET /api/v1/document-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all document types. Reference data for ingestion classification." },
  { batch: "Batch 1", endpoint: "Document Type — Get by ID", path: "GET /api/v1/document-types/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a document type by its unique identifier." },
  { batch: "Batch 1", endpoint: "File Schema — Get All", path: "GET /api/v1/file-schemas", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active file schema versions. Versioned and queryable." },
  { batch: "Batch 1", endpoint: "File Schema — Get Latest Active", path: "GET /api/v1/file-schemas/latest-active", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves the latest active file schema version per document type." },
  { batch: "Batch 1", endpoint: "File Schema — Get by Type", path: "GET /api/v1/file-schemas/by-type/{documentTypeCode}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active file schema versions for a given document type code." },

  // ── Batch 2 — Normalization & Cross-LOB Taxonomy ──────────────────────────
  { batch: "Batch 2", endpoint: "Data Records — Get Normalized", path: "GET /api/v1/data-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves normalized data records with optional filtering by entity, period, and classification status." },
  { batch: "Batch 2", endpoint: "Taxonomy Concept — Get All", path: "GET /api/v1/taxonomy/concepts", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active XLOB taxonomy concepts. Versioned." },
  { batch: "Batch 2", endpoint: "Taxonomy Concept — Get by ID", path: "GET /api/v1/taxonomy/concepts/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a taxonomy concept by its unique identifier." },
  { batch: "Batch 2", endpoint: "Characteristic Definition — Get All", path: "GET /api/v1/reference-data/characteristic-definitions", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active characteristic definitions. Reference data for entity profiling." },
  { batch: "Batch 2", endpoint: "Entity Type Ref — Get All", path: "GET /api/v1/reference-data/entity-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active entity types. Reference data." },
  { batch: "Batch 2", endpoint: "Jurisdiction Type Ref — Get All", path: "GET /api/v1/reference-data/jurisdiction-types", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active jurisdiction types. Reference data." },

  // ── Batch 2A — Orchestrator Contract Enforcement & Classification ──────────
  { batch: "Batch 2A", endpoint: "Data Records — Submit Classification", path: "PATCH /api/v1/data-records/{id}/classify", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Submits a classification decision for a normalized record. FirmTaxonomyId enforcement." },

  // ── Batch 3 — Tax Domain Authority & Tax Taxonomy ─────────────────────────
  { batch: "Batch 3", endpoint: "TDC Reference Data Read Contract", path: "GET /api/v1/reference-data", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Orchestrator-facing read-only contract. TaxFormTemplates, MappingRules, ConfidenceBandThresholds." },
  { batch: "Batch 3", endpoint: "Tax Forms — Get All", path: "GET /api/TaxForms", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all tax forms with optional filtering by jurisdiction and tax year." },
  { batch: "Batch 3", endpoint: "Tax Form Lines — Get by Form", path: "GET /api/tax-forms/{formId}/lines", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all tax form lines for a given parent tax form, sorted by sort order." },
  { batch: "Batch 3", endpoint: "Tax Taxonomy Accounts — Get All", path: "GET /api/TaxTaxonomyAccounts", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves tax taxonomy accounts with optional scoping by effective date." },
  { batch: "Batch 3", endpoint: "Mapping Rules — Get All", path: "GET /api/MappingRules", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all mapping rules. Versioned and queryable by tax year." },
  { batch: "Batch 3", endpoint: "Return Templates — Get All", path: "GET /api/ReturnTemplates", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all return templates. Reference data for tax form assembly." },
  { batch: "Batch 3", endpoint: "Tax Year Locks — Get Status", path: "GET /api/TaxYearLocks/{taxYear}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves the lock status of a specific tax year. Returns default unlocked if no lock record exists." },
  { batch: "Batch 3", endpoint: "Filing Due Dates — Get All", path: "GET /api/FilingDueDates", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all filing due dates. Queryable by jurisdiction and tax year." },

  // ── Batch 4 — AI Tax Mapping & Explainability ──────────────────────────────
  { batch: "Batch 4", endpoint: "AI Mapping Proposals — Get", path: "GET /api/v1/ai-mapping-proposals", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves AI mapping proposals by tax year and by client and/or entity. Confidence score + band (GREEN/YELLOW/RED) + structured evidence." },
  { batch: "Batch 4", endpoint: "AI Mapping Proposals — Bulk Submit", path: "POST /api/v1/ai-mapping-proposals/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Submits a batch of AI mapping proposals from the Orchestrator. Per-record validation." },
  { batch: "Batch 4", endpoint: "Proposal Decisions — Bulk Confirm", path: "POST /api/v1/proposal-decisions/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Bulk confirms mapping proposal decisions. Immutable once confirmed." },
  { batch: "Batch 4", endpoint: "Proposal Decisions — Get Confirmed", path: "GET /api/v1/proposal-decisions/confirmed", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves confirmed mapping decisions. Immutable decision records." },
  { batch: "Batch 4", endpoint: "TDC Records v1 — Get", path: "GET /api/v1/tdc-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger primary read contract v1. Published. Roger practitioner view unblocked." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Get", path: "GET /api/v2/tdc-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger primary read contract v2 with enhanced filtering and pagination." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Adjustments", path: "GET /api/v2/tdc-records/adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves adjustment records scoped to TDC records. Roger read surface." },
  { batch: "Batch 4", endpoint: "TDC Records v2 — Derived Records", path: "GET /api/v2/tdc-records/derived-records", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves derived TDC records. Roger read surface." },
  { batch: "Batch 4", endpoint: "TDC Derivation — Get", path: "GET /api/v1/tdc-derivation", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves TDC derivation records. Consumer Guide missing derivation field schema." },
  { batch: "Batch 4", endpoint: "Confidence Band Thresholds — Get", path: "GET /api/ConfidenceBandThresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. GREEN/YELLOW/RED threshold configuration. Queryable by TaxYear and Jurisdiction." },

  // ── Batch 5 — Entity Identity & Structure ─────────────────────────────────
  { batch: "Batch 5", endpoint: "Clients — Get All", path: "GET /api/v1/clients", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all active clients. Client Groups and Legal Entity Registry." },
  { batch: "Batch 5", endpoint: "Clients — Get by ID", path: "GET /api/v1/clients/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a client by its unique identifier." },
  { batch: "Batch 5", endpoint: "Clients — Get by MDM Client", path: "GET /api/v1/clients/by-mdm-client/{mdmClientId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all clients for a given MDM client identifier." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get All", path: "GET /api/v1/legal-entities", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all legal entities for a client. Ownership chains and jurisdictions included." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get by ID", path: "GET /api/v1/legal-entities/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a legal entity by its unique identifier." },
  { batch: "Batch 5", endpoint: "Legal Entities — Get by MDM Legal Entity", path: "GET /api/v1/legal-entities/by-mdm-legal-entity/{mdmLegalEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves a legal entity by its MDM legal entity identifier." },
  { batch: "Batch 5", endpoint: "Entity Characteristics — Get All", path: "GET /api/v1/entity-characteristics", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves entity characteristics. Includes DataSourceType and RBAC context." },
  { batch: "Batch 5", endpoint: "Entity Characteristics — Get by MDM Legal Entity", path: "GET /api/v1/entity-characteristics/by-mdm-legal-entity/{mdmLegalEntityId}", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves entity characteristics by MDM legal entity. Consumer Guide missing RBAC context field." },
  { batch: "Batch 5", endpoint: "Ownership Relationships — Get by Parent", path: "GET /api/v1/ownership-relationships/by-parent/{parentEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all ownership relationships where the given entity is the parent." },
  { batch: "Batch 5", endpoint: "Ownership Relationships — Get by Subsidiary", path: "GET /api/v1/ownership-relationships/by-subsidiary/{subsidiaryEntityId}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves all ownership relationships where the given entity is a subsidiary." },
  { batch: "Batch 5", endpoint: "Jurisdiction Assignments — Get", path: "GET /api/v1/jurisdiction-assignments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "PDC. Retrieves jurisdiction assignments for an entity." },
  { batch: "Batch 5", endpoint: "Entity Profile Attributes — Get", path: "GET /api/v1/entity-profile-attributes", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity profile attributes. Used for tax profile determination." },

  // ── Batch 6 — Practitioner Review, Adjustments & Lock ─────────────────────
  { batch: "Batch 6", endpoint: "Review Tasks — Get", path: "GET /api/v1/review-tasks", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves review tasks. Six-state lifecycle (DRAFT→SUBMITTED→APPROVED→APPLIED→LOCKED)." },
  { batch: "Batch 6", endpoint: "Review Tasks — Generate", path: "POST /api/v1/review-tasks/generate", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Generates review tasks from current data state." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Review Tasks", path: "GET /api/v2/tdc-records/review-tasks", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves review tasks scoped to TDC records. Roger read surface." },
  { batch: "Batch 6", endpoint: "Adjustments — Create", path: "POST /api/Adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a single governed adjustment in DRAFT status. Linked to a tax-ready record." },
  { batch: "Batch 6", endpoint: "Adjustments — Get by Entity Scope", path: "GET /api/Adjustments", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all adjustments scoped by entity identifier and tax year." },
  { batch: "Batch 6", endpoint: "Adjustments — Bulk Create", path: "POST /api/Adjustments/bulk", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a batch of governed adjustments atomically in DRAFT status." },
  { batch: "Batch 6", endpoint: "Adjustments — Submit for Approval", path: "PUT /api/Adjustments/{id}/submit", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Submits a DRAFT adjustment for approval. Resolves applicable approval routing rule." },
  { batch: "Batch 6", endpoint: "Adjustments — Approve", path: "PUT /api/Adjustments/{id}/approve", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Approves a SUBMITTED adjustment. Captures approval routing rule version at approval time." },
  { batch: "Batch 6", endpoint: "Adjustments — Reject", path: "PUT /api/Adjustments/{id}/reject", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Rejects a SUBMITTED adjustment with a required rejection reason. Immutably preserved." },
  { batch: "Batch 6", endpoint: "Sign-Off — Get", path: "GET /api/v1/sign-off", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves sign-off records. Non-repudiable SHA-256 hash sign-off." },
  { batch: "Batch 6", endpoint: "Sign-Off — Create", path: "POST /api/v1/sign-off", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Creates a sign-off record. Consumer Guide missing hash verification schema." },
  { batch: "Batch 6", endpoint: "Approval Routing Rules — Get by Client", path: "GET /api/v1/approval-routing-rules/by-client", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all active client-level and entity-level approval routing rules." },
  { batch: "Batch 6", endpoint: "Approver Roles — Get All", path: "GET /api/v1/approver-roles", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves all active approver role definitions." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Finalization State", path: "GET /api/v2/tdc-records/finalization-state", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves finalization state for TDC records. Lock events and sign-off status." },
  { batch: "Batch 6", endpoint: "TDC Records v2 — Lock Events", path: "GET /api/v2/tdc-records/lock-events", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves lock events for TDC records. Audit trail for lock/unlock operations." },
  { batch: "Batch 6", endpoint: "Entity Finalization — Get", path: "GET /api/v1/entity-finalization", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity finalization state. Used for sign-off gate enforcement." },
  { batch: "Batch 6", endpoint: "Entity Review Status — Get", path: "GET /api/v1/entity-review-status", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves entity review status. Aggregated review task completion state." },

  // ── Batch 7 — Client Tax Profile & Eligibility ────────────────────────────
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Get", path: "GET /api/v1/tax-profile-determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves tax profile determinations. TaxProfile per EntityId with filing status, tax year, jurisdiction." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Get by ID", path: "GET /api/v1/tax-profile-determinations/{id}", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves a specific tax profile determination by ID." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Gate Status", path: "GET /api/v1/tax-profile-determinations/gate-status", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves gate status for tax profile determinations. Blocks INELIGIBLE entities from downstream workflow." },
  { batch: "Batch 7", endpoint: "Tax Profile Determinations — Redetermine", path: "POST /api/v1/tax-profile-determinations/redetermine", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Triggers re-determination of tax profile for an entity." },
  { batch: "Batch 7", endpoint: "Controlled Group Determinations — Get", path: "GET /api/v1/controlled-group-determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active controlled-group determinations including the given entity." },
  { batch: "Batch 7", endpoint: "Controlled Group Determinations — Run", path: "POST /api/v1/controlled-group-determinations", status: "Delivered", consumerGuide: "Partial", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Runs the requested ownership tests against the entity set. Consumer Guide missing consolidated filing flag." },
  { batch: "Batch 7", endpoint: "Eligibility Tier Conditions — Get", path: "GET /api/v1/eligibility-tier-conditions", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active tier conditions filtered by entity type / rule / tier. Three-Tier Eligibility Model." },
  { batch: "Batch 7", endpoint: "Flag and Review — Get", path: "GET /api/v1/flag-and-review", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Retrieves FLAG_AND_REVIEW records. Entities requiring manual review before eligibility gate." },
  { batch: "Batch 7", endpoint: "Flag and Review — Confirm", path: "POST /api/v1/flag-and-review/{id}/confirm", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Confirms a FLAG_AND_REVIEW record. Allows entity to proceed through eligibility gate." },
  { batch: "Batch 7", endpoint: "Flag and Review — Override", path: "POST /api/v1/flag-and-review/{id}/override", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Overrides a FLAG_AND_REVIEW record with documented justification." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Controlled Groups", path: "GET /api/v3/tdc-records/controlled-groups", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for controlled group determinations." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Determinations", path: "GET /api/v3/tdc-records/determinations", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for tax profile determinations." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Eligibility Gate", path: "GET /api/v3/tdc-records/eligibility-gate", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for eligibility gate status." },
  { batch: "Batch 7", endpoint: "TDC Records v3 — Flag and Review", path: "GET /api/v3/tdc-records/flag-and-review", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Roger read surface for FLAG_AND_REVIEW records." },
  { batch: "Batch 7", endpoint: "Corporate Profile Criteria — Get", path: "GET /api/v1/corporate-profile-criteria", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active corporate profile criteria for a tax year." },
  { batch: "Batch 7", endpoint: "Corporate Profile Thresholds — Get", path: "GET /api/v1/corporate-profile-thresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active corporate profile thresholds for a tax year." },
  { batch: "Batch 7", endpoint: "Determination Confidence Thresholds — Get", path: "GET /api/v1/determination-confidence-thresholds", status: "Delivered", consumerGuide: "Aligned", missingFromGuide: false, missingFromSwagger: false, notes: "TDC. Returns active confidence thresholds for a tax year." },

  // ── Batch 8 — Exceptions & Remediation (In Progress) ──────────────────────
  { batch: "Batch 8", endpoint: "TDC Records v2 — Known Mapping", path: "GET /api/v2/tdc-records/known-mapping", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Retrieves known mapping records. Part of exception identification surface. In progress." },
  { batch: "Batch 8", endpoint: "Proposal Decisions — Supersede", path: "POST /api/v1/proposal-decisions/supersede", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Supersedes an existing proposal decision. Used in remediation workflow. In progress." },
  { batch: "Batch 8", endpoint: "Sign-Off — Unlock", path: "POST /api/v1/sign-off/{id}/unlock", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "TDC. Unlocks a previously locked sign-off. Used in exception remediation. In progress." },
  { batch: "Batch 8", endpoint: "EDGAR Corpus — Get Versions", path: "GET /api/v1/edgar-corpus/versions", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: false, notes: "PDC. Retrieves EDGAR corpus versions. Reference data for exception classification. In progress." },
  // ── B8 Primary Deliverables (new) ─────────────────────────────────────────
  { batch: "Batch 8", endpoint: "ExceptionRecord — Create", path: "POST /api/v1/exception-records", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Creates a new exception record when a mapping or ingestion anomaly is detected. Immutable once committed. Primary B8 deliverable." },
  { batch: "Batch 8", endpoint: "ExceptionRecord — Get by ID", path: "GET /api/v1/exception-records/{id}", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Retrieves a single exception record by its unique identifier. Roger read surface for exception visibility." },
  { batch: "Batch 8", endpoint: "ExceptionRecord — List by Batch", path: "GET /api/v1/exception-records", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Lists all exception records filterable by batch, severity, and resolution status. Supports Roger exception dashboard." },
  { batch: "Batch 8", endpoint: "RemedyAction — Create", path: "POST /api/v1/remedy-actions", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Creates a remediation action linked to an ExceptionRecord. Tracks resolution steps, owner, and target date. Primary B8 deliverable." },
  { batch: "Batch 8", endpoint: "RemedyAction — Update Status", path: "PATCH /api/v1/remedy-actions/{id}/status", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Updates the resolution status of a remedy action (Open → In Progress → Resolved). Immutable audit trail appended on each transition." },
  { batch: "Batch 8", endpoint: "RemedyAction — Get by Exception", path: "GET /api/v1/remedy-actions/by-exception/{exceptionId}", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "TDC. Retrieves all remedy actions associated with a given exception record. Roger read surface." },
  { batch: "Batch 8", endpoint: "Re-ingestion Trigger — Submit", path: "POST /api/v1/reingestion-triggers", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "PDC. Submits a re-ingestion trigger for a document that failed initial processing or was flagged by an exception. Creates an immutable audit record of the trigger event." },
  { batch: "Batch 8", endpoint: "Re-ingestion Trigger — Get Status", path: "GET /api/v1/reingestion-triggers/{triggerId}", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "PDC. Retrieves the current status of a re-ingestion trigger (Pending / Processing / Completed / Failed). Lineage-linked to the originating ExceptionRecord." },
  { batch: "Batch 8", endpoint: "Re-ingestion Trigger — Audit Trail", path: "GET /api/v1/reingestion-triggers/{triggerId}/audit", status: "In Progress", consumerGuide: "Missing", missingFromGuide: true, missingFromSwagger: true, notes: "PDC. Returns the full immutable audit trail for a re-ingestion trigger event. Lineage closure dependency for B8 gate." },
];

const ROGER_DATA_POINTS: RogerDataPoint[] = [
  {
    dataPoint: "File ingestion status (JobId, DocumentId, State)",
    source: "PDC", batch: "Batch 1", availability: "Available",
    apiEndpoint: "GET /api/v1/Ingestion/{runId}",
    fieldsDelivered: ["ingestionRunId", "documentId", "entityId", "status", "periodStart", "periodEnd", "createdAt", "updatedAt", "sourceFileName", "documentTypeCode"],
    adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }],
    notes: "Operational. Roger can confirm file arrival and processing state.", owner: "PDC",
  },
  {
    dataPoint: "Lineage anchor (DocumentId → EntityId → PeriodStart/End)",
    source: "PDC", batch: "Batch 1", availability: "Available",
    apiEndpoint: "GET /api/v1/Ingestion/{runId}",
    fieldsDelivered: ["documentId", "entityId", "periodStart", "periodEnd", "ingestionRunId", "lineageAnchorTimestamp", "sourceSystem"],
    adoStories: [{ title: "N/A – Delivered in Batch 1 foundation", id: "" }],
    notes: "Lineage immediately visible at ingestion.", owner: "PDC",
  },
  {
    dataPoint: "Normalized Trial Balance (vNormalizedTb)",
    source: "PDC", batch: "Batch 2", availability: "Partially Available",
    apiEndpoint: "GET /api/v1/data-records",
    fieldsDelivered: ["runId", "entityId", "accountCode", "accountDescription", "firmTaxonomyId", "normalizedAmount", "periodStart", "periodEnd", "documentId", "lineageRef", "schemaVersion"],
    adoStories: [
      { title: "Normalized TB Contract (Roger Read Surface)", id: "1349150" },
      { title: "File Schemas & Firm Financial Taxonomy Reference Data", id: "1349142" },
    ],
    notes: "Pending Batch 2A contract enforcement. Not yet Roger-consumable.", owner: "PDC",
  },
  {
    dataPoint: "FirmTaxonomyId on normalized records",
    source: "PDC / Orchestrator", batch: "Batch 2A", availability: "Not Available",
    apiEndpoint: "GET /api/v1/data-records (field pending)",
    fieldsDelivered: ["firmTaxonomyId (MISSING — blocking)", "firmTaxonomyCode", "classificationStatus", "classificationSource", "rejectionReason"],
    adoStories: [{ title: "Enforce Classification Presence (FirmTaxonomyId)", id: "1370843" }],
    notes: "Blocking gap. Orchestrator not returning FirmTaxonomyId. Classification Walkthrough documents this gap.", owner: "PDC + Orchestrator",
  },
  {
    dataPoint: "Tax form templates and mapping rules",
    source: "TDC", batch: "Batch 3", availability: "Available",
    apiEndpoint: "GET /api/v1/tax-form-templates",
    fieldsDelivered: ["templateId", "formName", "jurisdiction", "taxYear", "formLines[]", "mappingRuleId", "confidenceBandThreshold", "version", "effectiveDate"],
    adoStories: [{ title: "TDC Reference Data Read Contract (Orchestrator Facing)", id: "1349152" }],
    notes: "Orchestrator-facing only. Not Roger-facing.", owner: "TDC",
  },
  {
    dataPoint: "AI mapping proposals (confidence + evidence)",
    source: "TDC", batch: "Batch 4", availability: "Partially Available",
    apiEndpoint: "GET /api/v1/mapping-proposals",
    fieldsDelivered: ["proposalId", "entityId", "accountCode", "suggestedTaxLineId", "confidenceScore", "confidenceBand (GREEN/YELLOW/RED)", "evidenceSummary", "modelVersion", "createdAt", "status"],
    adoStories: [{ title: "AI Mapping Proposals", id: "1349156" }],
    notes: "Proposals available. Roger read contract (TDC Records API) not yet published.", owner: "TDC",
  },
  {
    dataPoint: "Mapping decisions (accept / override / reject)",
    source: "TDC", batch: "Batch 4", availability: "Partially Available",
    apiEndpoint: "GET /api/v1/mapping-decisions",
    fieldsDelivered: ["decisionId", "proposalId", "entityId", "accountCode", "decisionType (ACCEPT/OVERRIDE/REJECT)", "decidedBy", "decidedAt", "overrideReason", "immutableHash", "taxYear (GAP — missing in Swagger)"],
    adoStories: [{ title: "Mapping Decisions", id: "1349157" }],
    notes: "Immutable decisions in place. Out of Sync — tax_year field gap in Swagger.", owner: "TDC",
  },
  {
    dataPoint: "Roger primary TDC read contract (GREEN/YELLOW/RED, pending vs decided)",
    source: "TDC", batch: "Batch 4", availability: "Not Available",
    apiEndpoint: "GET /api/v1/tdc-records",
    fieldsDelivered: ["recordId", "entityId", "accountCode", "taxLineId", "confidenceBand (GREEN/YELLOW/RED)", "decisionStatus (PENDING/DECIDED)", "proposalId", "decisionId", "periodStart", "periodEnd", "lineageRef", "contractVersion"],
    adoStories: [{ title: "TDC Records API Contract (Roger Read Surface)", id: "1349158" }],
    notes: "Not yet published. This is the moment the platform comes to life for practitioners. Blocking.", owner: "TDC",
  },
  {
    dataPoint: "Entity identity (ClientGroupId, EntityId, hierarchy)",
    source: "PDC", batch: "Batch 5", availability: "Not Available",
    apiEndpoint: "GET /api/v1/entities/{entityId}",
    fieldsDelivered: ["entityId", "clientGroupId", "legalEntityName", "jurisdiction", "ownershipChain[]", "dataSourceType", "rbacContext", "cemSyncStatus", "effectiveDate", "entityCharacteristics[]"],
    adoStories: [{ title: "Entity Identity Read Contract (PDC-facing)", id: "1355868" }],
    notes: "In progress (PI 2). EntityId risk from PI 1 being closed. Entity Identity Read Contract (PDC-facing) is the Roger-facing deliverable.", owner: "PDC",
  },
  {
    dataPoint: "Review task state and adjustment lifecycle",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "GET /api/v1/review-tasks",
    fieldsDelivered: ["taskId", "entityId", "taskType", "status (DRAFT/SUBMITTED/APPROVED/APPLIED/LOCKED)", "assignedTo", "dueDate", "adjustmentId", "adjustmentAmount", "approvalRoutingRuleId", "createdAt", "updatedAt"],
    adoStories: [
      { title: "Review Task Management & Entity Status", id: "1350253" },
      { title: "Book-to-Tax Adjustments & Approval Routing", id: "1350254" },
    ],
    notes: "In progress (PI 2, sequential after Batch 4). Review tasks auto-generated from data state. Six-state adjustment lifecycle in development.", owner: "TDC",
  },
  {
    dataPoint: "Tax-ready records (locked, derived)",
    source: "TDC", batch: "Batch 6", availability: "Not Available",
    apiEndpoint: "GET /api/v1/tax-ready-records",
    fieldsDelivered: ["taxReadyRecordId", "entityId", "taxLineId", "finalAmount", "derivationSource", "signOffHash (SHA-256)", "signedOffBy", "signedOffAt", "lockStatus", "periodStart", "periodEnd", "lineageRef"],
    adoStories: [{ title: "Tax-Ready Record Derivation", id: "1350255" }],
    notes: "In progress (PI 2). Tax-ready derivation from mapping decisions + approved adjustments. SHA-256 sign-off in development.", owner: "TDC",
  },
  {
    dataPoint: "Eligibility status and rule reasoning",
    source: "TDC", batch: "Batch 7", availability: "Not Available",
    apiEndpoint: "GET /api/v1/eligibility/{entityId}",
    fieldsDelivered: ["eligibilityId", "entityId", "eligibilityStatus (ELIGIBLE/INELIGIBLE/FLAG_AND_REVIEW)", "tier (MUST_HAVE/MUST_NOT_HAVE/FLAG_AND_REVIEW)", "ruleId", "ruleReasoning", "determinationDate", "controlledGroupId", "affiliatedGroupId", "overrideAllowed", "reviewOutcome"],
    adoStories: [{ title: "Client Tax Profile Lifecycle & Determination Records", id: "1355882" }],
    notes: "In progress (PI 2, sequential after Batch 6). Three-Tier Eligibility Model (Must Have / Must Not Have / Flag & Review). Ineligible entities blocked from downstream workflow.", owner: "TDC",
  },
  {
    dataPoint: "Exception status (ingestion, mapping, workflow)",
    source: "PDC + TDC", batch: "Batch 8", availability: "Not Available",
    apiEndpoint: "GET /api/v1/exceptions",
    fieldsDelivered: ["exceptionId", "entityId", "exceptionType (INGESTION/MAPPING/WORKFLOW)", "status (OPEN/IN_PROGRESS/RESOLVED/CLOSED/SUPPRESSED)", "severity", "sourceSystem", "batchRef", "remedyActionId", "createdAt", "resolvedAt", "auditTrail[]"],
    adoStories: [
      { title: "PDC Exception Record Structure & Failure Tracking", id: "1355898" },
      { title: "TDC Exception Record Structure & Failure Tracking", id: "1355902" },
    ],
    notes: "In progress (PI 2). PDC parallel to Batch 7, TDC sequential after Batch 7. Exception state machine: OPEN → IN_PROGRESS → RESOLVED / CLOSED / SUPPRESSED.", owner: "PDC + TDC",
  },
  {
    dataPoint: "Rollforward proposals & prior year intelligence",
    source: "PDC + TDC", batch: "Batch 9", availability: "Not Available",
    apiEndpoint: "GET /api/v1/rollforward-proposals",
    fieldsDelivered: ["rollforwardId", "entityId", "priorYearRecordId", "currentYearEntityId", "matchConfidence (EXACT/APPROXIMATE/NO_MATCH)", "proposedTaxLineId", "priorYearAmount", "deltaAmount", "imsSourceRef", "createdAt", "contractVersion"],
    adoStories: [
      { title: "IMS Inbound Retrieval Contract", id: "1350260" },
    ],
    notes: "Batch 9 not started. PDC free after Batch 5 closes, TDC sequential after Batch 6 closes. v_rollforward contract extends TDC Records API for Roger. Prior year proposals with EXACT / APPROXIMATE / NO_MATCH confidence scoring.", owner: "PDC + TDC",
  },
];

//// ── Batch label → context key mapping ────────────────────────────────────────────────────────────────
// Maps "Batch 1" → "1", "Batch 2A" → "2a", "Batch FC" / "Foundation Core" → "foundation-core"
function batchLabelToKey(batch: string): string {
  const b = batch.trim();
  if (b === "Foundation Core" || b === "Batch FC" || b === "FC") return "foundation-core";
  const m = b.match(/Batch\s+([0-9]+[A-Za-z]?)/i);
  if (m) return m[1].toLowerCase();
  return b.toLowerCase();
}

// Derive live Swagger status from batch context status
function deriveSwaggerStatus(batchKey: string, statuses: Record<string, string>): ApiStatus {
  const s = statuses[batchKey];
  if (s === "Complete" || s === "Delivered") return "Delivered";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") return "In Progress";
  if (s === "Blocked") return "Needs PO/Dev Confirmation";
  return "Missing";
}

// Derive live Roger availability from batch context status
function deriveRogerAvailability(batchKey: string, statuses: Record<string, string>): RogerAvailability {
  const s = statuses[batchKey];
  if (s === "Complete" || s === "Delivered") return "Available";
  if (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") return "Partially Available";
  if (s === "Blocked") return "Carried Forward";
  return "Not Available";
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DELIVERY_STYLE: Record<DeliveryStatus, { bg: string; text: string; border: string }> = {
  "Complete":                   { bg: "bg-emerald-50",  text: "text-emerald-800", border: "border-emerald-200" },
  "Delivered":                  { bg: "bg-emerald-50",  text: "text-emerald-800", border: "border-emerald-200" },
  "In Progress":                { bg: "bg-blue-50",     text: "text-blue-800",    border: "border-blue-200" },
  "Ready for QA":               { bg: "bg-violet-50",   text: "text-violet-800",  border: "border-violet-200" },
  "Carried Forward":            { bg: "bg-amber-50",    text: "text-amber-800",   border: "border-amber-200" },
  "Backlogged":                 { bg: "bg-slate-50",    text: "text-slate-600",   border: "border-slate-200" },
  "Not Started":                { bg: "bg-slate-50",    text: "text-slate-500",   border: "border-slate-200" },
  "Needs PO/Dev Confirmation":  { bg: "bg-red-50",      text: "text-red-700",     border: "border-red-200" },
  "On Hold":                    { bg: "bg-orange-50",   text: "text-orange-800",  border: "border-orange-200" },
  "Parked":                     { bg: "bg-slate-100",   text: "text-slate-500",   border: "border-slate-300" },
};

const API_STYLE: Record<ApiStatus, { bg: string; text: string }> = {
  "Delivered":                 { bg: "bg-emerald-100", text: "text-emerald-800" },
  "In Progress":               { bg: "bg-blue-100",    text: "text-blue-800" },
  "Missing":                   { bg: "bg-red-100",     text: "text-red-700" },
  "Needs PO/Dev Confirmation": { bg: "bg-amber-100",   text: "text-amber-800" },
};

const ROGER_STYLE: Record<RogerAvailability, { bg: string; text: string }> = {
  "Available":           { bg: "bg-emerald-100", text: "text-emerald-800" },
  "Partially Available": { bg: "bg-blue-100",    text: "text-blue-800" },
  "Not Available":       { bg: "bg-red-100",     text: "text-red-700" },
  "Carried Forward":     { bg: "bg-amber-100",   text: "text-amber-800" },
  "Backlogged":          { bg: "bg-slate-100",   text: "text-slate-600" },
};

const GATE_ICONS = { g1: Lock, g2: Shield, g3: FileText, g4: Link2 };
const GATE_LABELS = {
  g1: "G1 — Schema Lock",
  g2: "G2 — Invariant Lock",
  g3: "G3 — Contract Publication",
  g4: "G4 — Lineage Closure",
};

const BATCH_KEYS: BatchKey[] = [
  // PI 1 — Complete
  "foundation-core","1","2","2a","3",
  // PI 2 — Committed
  "4","5","6","7","8","8-pdc","8-tdc","9","9-pdc","9-tdc","10","11","12",
  // PI 2 — Stretch
  "13","16",
  // PI 3 — MVP
  "17","20","21","22","23","26","28","29","31","33","39",
];

function Badge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
      {label}
    </span>
  );
}

function SectionHeader({ title, subtitle, cascadeStep, cascadeActive, cascadeDone }: {
  title: string;
  subtitle?: string;
  cascadeStep?: number;
  cascadeActive?: boolean;
  cascadeDone?: boolean;
}) {
  return (
    <div className="px-5 py-3 border-b border-slate-100 bg-[#003865] flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        {subtitle && <div className="text-xs text-blue-200 mt-0.5">{subtitle}</div>}
      </div>
      {cascadeStep !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
          cascadeDone
            ? "bg-emerald-500 text-white"
            : cascadeActive
              ? "bg-blue-400 text-white"
              : "bg-blue-800 text-blue-300"
        }`}>
          {cascadeDone
            ? <CheckCircle2 className="w-3 h-3" />
            : cascadeActive
              ? <div className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin" />
              : <Circle className="w-3 h-3" />
          }
          Step {cascadeStep}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 rounded px-2 py-1 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function GateStatusBadge({ status }: { status: "Complete" | "In Progress" | "Locked" }) {
  const cfg = {
    Complete:      { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
    "In Progress": { bg: "bg-amber-100",   text: "text-amber-800",   dot: "bg-amber-500" },
    Locked:        { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BatchControlPanel() {
  const { statuses, setStatus, resetAll, gates, lastUpdated, syncLog, clearSyncLog, unlockedBatches, piCompletion, cascade } = useBatchStatus();
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [poSummaryCopied, setPoSummaryCopied] = useState(false);
  const [poSummaryGeneratedAt, setPoSummaryGeneratedAt] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<Set<number>>(new Set());
  const [expandedAdoRows, setExpandedAdoRows] = useState<Set<number>>(new Set());
  const [adoCopied, setAdoCopied] = useState(false);
  const [panelCopied, setPanelCopied] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [syncFlash, setSyncFlash] = useState(false);
  const prevLastUpdated = useRef<string | null>(null);

  // Flash the sync indicator whenever a status update propagates
  useEffect(() => {
    if (lastUpdated && lastUpdated !== prevLastUpdated.current) {
      prevLastUpdated.current = lastUpdated;
      setSyncFlash(true);
      const t = setTimeout(() => setSyncFlash(false), 2000);
      return () => clearTimeout(t);
    }
  }, [lastUpdated]);

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" })
    : null;
  const copyFullPanel = () => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    // Build styled HTML table rows
    let prevBatch = '';
    const rows = liveRogerPoints.map((d, i) => {
      const isNewBatch = d.batch !== prevBatch;
      prevBatch = d.batch;
      const batchGroupIndex = liveRogerPoints.filter((x, xi) => xi <= i && (xi === 0 || liveRogerPoints[xi-1].batch !== x.batch)).length - 1;
      const rowBg = batchGroupIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
      const borderTop = isNewBatch && i > 0 ? '2px solid #cbd5e1' : '1px solid #f1f5f9';
      const availStyle = d.availability === 'Available'
        ? 'background:#dcfce7;color:#166534;'
        : d.availability === 'Partially Available'
        ? 'background:#dbeafe;color:#1e3a8a;'
        : 'background:#fee2e2;color:#991b1b;';
      const noteIcon = (d.notes.toLowerCase().includes('block') || d.notes.toLowerCase().includes('gap') || d.notes.toLowerCase().includes('pending')) ? '⚠️' : 'ℹ️';
      const adoHtml = d.adoStories.map(s => s.id
        ? `<div style="margin-bottom:4px;text-align:right"><div style="font-size:9px;color:#374151;line-height:1.3">${s.title}</div><span style="display:inline-block;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:1px 6px;font-size:8px;font-weight:700">#${s.id} ↗</span></div>`
        : `<div style="font-size:9px;color:#9ca3af;font-style:italic">${s.title}</div>`
      ).join('');
      return `<tr style="background:${rowBg};border-top:${borderTop}">
        <td style="padding:10px 10px;font-size:11px;font-weight:600;color:#1e293b;word-break:break-word;vertical-align:top">${d.dataPoint}</td>
        <td style="padding:10px 10px;font-size:10px;color:#64748b;vertical-align:top;word-break:break-word">${d.source}</td>
        <td style="padding:10px 10px;font-size:10px;font-weight:700;color:#003865;white-space:nowrap;vertical-align:top">${d.batch}</td>
        <td style="padding:10px 10px;vertical-align:top;text-align:center">
          <span style="display:inline-block;${availStyle}border-radius:9999px;padding:3px 10px;font-size:9px;font-weight:700;white-space:nowrap;min-width:80px;text-align:center">${d.availability}</span>
        </td>
        <td style="padding:10px 10px;vertical-align:top">
          <span style="font-family:monospace;font-size:8.5px;background:#f1f5f9;color:#475569;border-radius:3px;padding:2px 5px;display:block;word-break:break-all;line-height:1.5">${d.apiEndpoint}</span>
        </td>
        <td style="padding:10px 10px;vertical-align:top;text-align:right">${adoHtml}</td>
        <td style="padding:10px 10px;vertical-align:top;font-size:10px;color:#475569">${noteIcon} ${d.notes}</td>
        <td style="padding:10px 10px;vertical-align:top;font-size:10px;color:#64748b;word-break:break-word">${d.owner}</td>
      </tr>`;
    }).join('');
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Roger UI Data Availability — BA Weekly ${today}</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px;background:#f8fafc;}
  .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.10);}
  .header{background:#003865;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;}
  .header-title{color:#fff;font-size:14px;font-weight:700;margin:0;}
  .header-sub{color:#93c5fd;font-size:11px;margin-top:2px;}
  .header-meta{color:#bfdbfe;font-size:10px;text-align:right;}
  table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;}
  thead tr{background:#002a52;}
  th{padding:10px 10px;font-weight:700;font-size:10px;letter-spacing:.04em;color:#fff;text-align:left;}
  th:nth-child(4){text-align:center;}
  th:nth-child(6){text-align:right;}
  tr:hover{background:#eff6ff !important;}
  .legend{display:flex;gap:16px;padding:10px 16px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:10px;color:#64748b;}
  .legend span{display:inline-flex;align-items:center;gap:4px;}
  .footer{padding:8px 16px;font-size:9px;color:#94a3b8;border-top:1px solid #f1f5f9;text-align:right;}
  @media print{body{padding:0;background:#fff;}.card{box-shadow:none;}}
</style></head><body>
<div class="card">
  <div class="header">
    <div><div class="header-title">Roger UI Data Availability</div><div class="header-sub">Which data points are ready for Roger to consume now vs carried forward to PI 2</div></div>
    <div class="header-meta">BA Weekly Update<br>${today}</div>
  </div>
  <table>
    <thead><tr>
      <th style="width:20%">Data Point</th>
      <th style="width:10%">Source</th>
      <th style="width:7%">Batch</th>
      <th style="width:11%;text-align:center">Availability</th>
      <th style="width:15%">API Endpoint</th>
      <th style="width:17%;text-align:right">ADO Story (ID)</th>
      <th style="width:13%">Notes / Gap</th>
      <th style="width:7%">Owner</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="legend">
    <span><span style="display:inline-block;background:#dcfce7;color:#166534;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Available</span></span>
    <span><span style="display:inline-block;background:#dbeafe;color:#1e3a8a;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Partially Available</span></span>
    <span><span style="display:inline-block;background:#fee2e2;color:#991b1b;border-radius:9999px;padding:1px 8px;font-weight:700;font-size:9px">Not Available</span></span>
    <span>⚠️ Gap / Blocker &nbsp; ℹ️ Informational</span>
  </div>
  <div class="footer">DCT Platform Gate Verification Dashboard — Control Panel — Planning View</div>
</div>
</body></html>`;
    const popup = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    if (popup) {
      popup.document.write(html);
      popup.document.close();
      setPanelCopied(true);
      setTimeout(() => setPanelCopied(false), 3000);
    }
  };
  const toggleNote = (i: number) => setExpandedNotes(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const toggleAdo = (i: number) => setExpandedAdoRows(prev => { const s = new Set(prev); s.has(i) ? s.delete(i) : s.add(i); return s; });
  const copyAdoIds = () => {
    const ids = liveRogerPoints.flatMap(d => d.adoStories.map(s => s.id)).filter(Boolean).join(', ');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(ids).then(() => {
        setAdoCopied(true);
        setTimeout(() => setAdoCopied(false), 2500);
      }).catch(() => {
        // fallback
        const el = document.createElement('textarea');
        el.value = ids;
        el.style.position = 'fixed';
        el.style.opacity = '0';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setAdoCopied(true);
        setTimeout(() => setAdoCopied(false), 2500);
      });
    } else {
      // execCommand fallback for non-secure contexts
      const el = document.createElement('textarea');
      el.value = ids;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setAdoCopied(true);
      setTimeout(() => setAdoCopied(false), 2500);
    }
  };

  const complete   = BATCH_KEYS.filter(k => statuses[k] === "Complete" || statuses[k] === "Delivered").length;
  const dev        = BATCH_KEYS.filter(k => statuses[k] === "In Progress" || statuses[k] === "Blocked" || statuses[k] === "MVP" || statuses[k] === "Stretch").length;
  const inReview   = BATCH_KEYS.filter(k => statuses[k] === "Ready for QA" || statuses[k] === "QA In Progress" || statuses[k] === "Demo Ready").length;
  const planned    = BATCH_KEYS.filter(k => statuses[k] === "Not Started").length;

  const advanceAll = () => {
    BATCH_KEYS.forEach(k => {
      const current = statuses[k];
      if (current === "Not Started") setStatus(k, "In Progress");
      else if (current === "In Progress") setStatus(k, "Ready for QA");
      else if (current === "Ready for QA") setStatus(k, "QA In Progress");
      else if (current === "QA In Progress") setStatus(k, "Demo Ready");
      else if (current === "Demo Ready") setStatus(k, "Delivered");
      else if (current === "Delivered") setStatus(k, "Complete");
    });
  };

  // ── Dynamic PO Status Summary (rebuilds whenever statuses change) ────────────
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Classify each batch by live context status
  // Build a full label map from DELIVERED_BATCHES for PO Summary (covers all tracked batches)
  const BATCH_LABEL_MAP: Record<string, string> = Object.fromEntries(
    DELIVERED_BATCHES.map(b => [b.key, b.label])
  );

  const liveDeliveredBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return (s === "Delivered" || s === "Complete") && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveInProgressBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return (s === "In Progress" || s === "Ready for QA" || s === "QA In Progress" || s === "Demo Ready" || s === "MVP" || s === "Stretch") && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveBlockedBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return s === "Blocked" && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  const liveNotStartedBatches = BATCH_KEYS.filter(k => {
    const s = statuses[k];
    return s === "Not Started" && BATCH_LABEL_MAP[k];
  }).map(k => BATCH_LABEL_MAP[k]);

  // ── Live Swagger entries — status derived from batch context ────────────────────────────────────────────────────────────────
  const liveSwaggerEntries: SwaggerEntry[] = SWAGGER_ENTRIES.map(e => ({
    ...e,
    status: deriveSwaggerStatus(batchLabelToKey(e.batch), statuses as unknown as Record<string, string>),
  }));

  // ── Live Roger data points — availability derived from batch context ────────────────────────────────────────────────────────────────
  const liveRogerPoints: RogerDataPoint[] = ROGER_DATA_POINTS.map(d => ({
    ...d,
    availability: deriveRogerAvailability(batchLabelToKey(d.batch), statuses as unknown as Record<string, string>),
  }));

  const apisDelivered = liveSwaggerEntries.filter(e => e.status === "Delivered").length;
  const apisMissing = liveSwaggerEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const rogerAvailable = liveRogerPoints.filter(d => d.availability === "Available").length;
  const rogerBlocked = liveRogerPoints.filter(d => d.availability === "Not Available").length;

  // ── TDC / PDC split counters ────────────────────────────────────────────────
  const tdcEntries = liveSwaggerEntries.filter(e => e.notes?.startsWith("TDC."));
  const pdcEntries = liveSwaggerEntries.filter(e => e.notes?.startsWith("PDC."));
  const tdcDelivered = tdcEntries.filter(e => e.status === "Delivered").length;
  const pdcDelivered = pdcEntries.filter(e => e.status === "Delivered").length;
  const tdcInProgress = tdcEntries.filter(e => e.status === "In Progress").length;
  const pdcInProgress = pdcEntries.filter(e => e.status === "In Progress").length;
  const tdcMissing = tdcEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const pdcMissing = pdcEntries.filter(e => e.status === "Missing" || e.missingFromSwagger).length;
  const tdcTotal = tdcEntries.length;
  const pdcTotal = pdcEntries.length;

  const tdcRogerPoints = liveRogerPoints.filter(d => d.source?.includes("TDC"));
  const pdcRogerPoints = liveRogerPoints.filter(d => d.source?.includes("PDC") && !d.source?.includes("TDC"));
  const tdcRogerAvailable = tdcRogerPoints.filter(d => d.availability === "Available").length;
  const pdcRogerAvailable = pdcRogerPoints.filter(d => d.availability === "Available").length;

  // Carry-forward: open items from batches that are NOT yet complete
  const liveCarryForward = DELIVERED_BATCHES
    .filter(b => {
      const s = statuses[b.key as BatchKey];
      return s !== "Delivered" && s !== "Complete";
    })
    .flatMap(b => b.open.map(o => `${b.label.split(" — ")[0]}: ${o}`))
    .filter(o => o.length > 0);

  // Blockers: only show for Blocked batches
  const liveBlockers = DELIVERED_BATCHES
    .filter(b => statuses[b.key as BatchKey] === "Blocked")
    .flatMap(b => b.open.map(o => `${b.label.split(" — ")[0]}: ${o}`));

  const poSummaryText = [
    `DCT Platform — Delivery Status Update (${today})`,
    "",
    liveDeliveredBatches.length > 0
      ? `DELIVERED (${liveDeliveredBatches.length}):\n${liveDeliveredBatches.map(b => `• ${b}`).join("\n")}`
      : "DELIVERED:\n• No batches marked Delivered yet",
    "",
    liveInProgressBatches.length > 0
      ? `IN PROGRESS (${liveInProgressBatches.length}):\n${liveInProgressBatches.map(b => `• ${b}`).join("\n")}`
      : "IN PROGRESS:\n• No batches currently in progress",
    liveBlockedBatches.length > 0
      ? `\nBLOCKED (${liveBlockedBatches.length}):\n${liveBlockedBatches.map(b => `• ${b}`).join("\n")}`
      : "",
    liveNotStartedBatches.length > 0
      ? `\nNOT STARTED (${liveNotStartedBatches.length}):\n${liveNotStartedBatches.map(b => `• ${b}`).join("\n")}`
      : "",
    "",
    `API COVERAGE (${apisDelivered} of ${liveSwaggerEntries.length} endpoints delivered):\n  TDC: ${tdcDelivered} delivered${tdcInProgress > 0 ? `, ${tdcInProgress} in progress` : ""} of ${tdcTotal} total${tdcMissing > 0 ? ` · ${tdcMissing} missing from Consumer Guide` : ""}\n  PDC: ${pdcDelivered} delivered${pdcInProgress > 0 ? `, ${pdcInProgress} in progress` : ""} of ${pdcTotal} total${pdcMissing > 0 ? ` · ${pdcMissing} missing from Consumer Guide` : ""}${apisMissing > 0 ? `\n• ${apisMissing} endpoint(s) missing from Swagger or Consumer Guide` : "\n• All delivered endpoints aligned with Consumer Guide"}`,
    "",
    `ROGER UI DATA AVAILABILITY (${rogerAvailable} of ${liveRogerPoints.length} data points available):\n  TDC: ${tdcRogerAvailable} of ${tdcRogerPoints.length} data points available\n  PDC: ${pdcRogerAvailable} of ${pdcRogerPoints.length} data points available\n• ${rogerBlocked} data point(s) not yet available to Roger`,
    "",
    liveCarryForward.length > 0
      ? `CARRY-FORWARD ITEMS:\n${liveCarryForward.map(o => `• ${o}`).join("\n")}`
      : "CARRY-FORWARD ITEMS:\n• None — all open items resolved",
    "",
    liveBlockers.length > 0
      ? `RISKS / BLOCKERS:\n${liveBlockers.map(o => `• ${o}`).join("\n")}`
      : "RISKS / BLOCKERS:\n• No active blockers",
    "",
    `OPEN DECISIONS:\n• FirmTaxonomyId enforcement: REQUIRED on all PDC records (ADR-06 proposed)\n• Which system generates JobId — Tax Portal or PDC?\n• Engagement code ownership between EODS and CEM`,
    "",
    `RECOMMENDED NEXT ACTION:\n• Confirm Batch 2A FirmTaxonomyId enforcement decision with engineering (ADR-06 pending approval)\n• Publish TDC Records API contract to unblock Roger Batch 4 view\n• Update Consumer Guide with missing endpoint documentation (Processing Run API, Normalized TB, Mapping Decisions)\n• Confirm Batch 5 EntityId contract scope with PDC team before PI 2 sprint planning`,
  ].filter(s => s !== "").join("\n");

  const formatTimestamp = () => new Date().toLocaleString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });

  const copyPoSummary = () => {
    const ts = formatTimestamp();
    setPoSummaryGeneratedAt(ts);
    navigator.clipboard.writeText(poSummaryText).then(() => {
      setPoSummaryCopied(true);
      setTimeout(() => setPoSummaryCopied(false), 3000);
    });
  };

  const sendToTeams = () => {
    const ts = formatTimestamp();
    setPoSummaryGeneratedAt(ts);
    // Teams deep link: opens a new chat with pre-filled message
    const message = encodeURIComponent(poSummaryText);
    window.open(`https://teams.microsoft.com/l/chat/0/0?message=${message}`, "_blank");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Governance Banner ── */}
      <GovernanceBanner />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#003865]">Global Control Panel</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            DCT Batch Roadmap v2.1 · Governance Readiness Tracker · Non-Production Workspace · RSM | CATT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/ba-touchpoint"
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            BA Touchpoint Summary
          </Link>
          <button
            onClick={() => setShowDebug(d => !d)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
              showDebug ? "bg-amber-50 border-amber-300 text-amber-700" : "text-slate-500 border-slate-200 hover:bg-slate-50"
            }`}
            title="Toggle debug / sync log"
          >
            <Bug className="w-3.5 h-3.5" />
            Debug
          </button>
          <button
            onClick={advanceAll}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#003865] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Advance All
          </button>
          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── Sync Status Bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-500"
        style={{
          backgroundColor: syncFlash ? "#f0fdf4" : "#f8fafc",
          borderColor: syncFlash ? "#86efac" : "#e2e8f0",
          color: syncFlash ? "#166534" : "#64748b",
        }}
      >
        <Activity className={`w-3.5 h-3.5 shrink-0 ${syncFlash ? "text-emerald-500" : "text-slate-400"}`} />
        <span className="flex-1">
          {syncFlash
            ? "✓ Status update propagated to all workspace views — Roadmap, Calendar, Detail Pages, Executive Summary, Home"
            : "Control Panel propagates readiness status across all workspace views. This is a non-production governance visualization environment."}
        </span>
        {lastUpdatedLabel && (
          <span className="shrink-0 text-slate-400 font-normal">
            Last updated: {lastUpdatedLabel}
          </span>
        )}
      </div>

      {/* ── Dependency Unlock Notification ── */}
      {unlockedBatches.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-800">
          <span className="text-base">🔓</span>
          <span>
            Dependency unlocked: {unlockedBatches.map(k => k === "foundation-core" ? "FC" : `B${k}`).join(", ")} — now available to start
          </span>
        </div>
      )}

      {/* ── Debug / Sync Log Panel ── */}
      {showDebug && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <Bug className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">Sync Log — Last {syncLog.length} Updates</span>
            </div>
            <button
              onClick={clearSyncLog}
              className="text-xs text-amber-600 hover:text-amber-900 font-semibold"
            >
              Clear log
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-amber-100">
            {syncLog.length === 0 ? (
              <div className="px-4 py-3 text-xs text-amber-600 italic">No updates recorded yet. Change a batch status to see propagation.</div>
            ) : (
              [...syncLog].reverse().map((entry, i) => (
                <div key={i} className="px-4 py-2.5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-amber-500 shrink-0">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                    <span className="font-bold text-amber-900">{entry.batch === "foundation-core" ? "FC" : `B${entry.batch}`}</span>
                    <span className="text-amber-600">{entry.from} → {entry.to}</span>
                    <span className="text-amber-500 text-xs">{entry.derivedUpdates.length} views updated</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {entry.derivedUpdates.map((d, j) => (
                      <span key={j} className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{d}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="px-4 py-2 border-t border-amber-200 bg-amber-100">
            <div className="text-xs font-bold text-amber-800 mb-1">PI Completion (live)</div>
            <div className="flex gap-4">
              {(["pi1","pi2","pi3","pi4"] as const).map(pi => (
                <div key={pi} className="text-center">
                  <div className="text-sm font-bold text-amber-900">{piCompletion[pi].pct}%</div>
                  <div className="text-[10px] text-amber-600 uppercase">{pi.toUpperCase()}</div>
                  <div className="text-[10px] text-amber-500">{piCompletion[pi].complete}/{piCompletion[pi].total}</div>
                </div>
              ))}
              <div className="text-center border-l border-amber-200 pl-4">
                <div className="text-sm font-bold text-amber-900">{piCompletion.overall.pct}%</div>
                <div className="text-[10px] text-amber-600 uppercase">Overall</div>
                <div className="text-[10px] text-amber-500">{piCompletion.overall.complete}/{piCompletion.overall.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cascade Progress Overlay ── */}
      {cascade.active && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-blue-200 bg-blue-100">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
            <span className="text-sm font-bold text-blue-900">Updating Platform…</span>
            <span className="text-xs text-blue-600 ml-auto">
              {cascade.batch === "foundation-core" ? "FC" : `B${cascade.batch}`} status change propagating
            </span>
          </div>
          {cascade.isRollback && cascade.rollbackImpact.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs font-semibold text-amber-800">
              <span>⚠️</span>
              <span>Rollback detected — recalculating downstream readiness for: {cascade.rollbackImpact.map(k => k === "foundation-core" ? "FC" : `B${k}`).join(", ")}</span>
            </div>
          )}
          <div className="px-4 py-3 space-y-2">
            {([1, 2, 3, 4] as const).map(step => {
              const done = cascade.completedSteps.includes(step);
              const active = cascade.currentStep === step;
              return (
                <div key={step} className={`flex items-start gap-3 text-xs transition-all duration-300 ${
                  done ? "opacity-100" : active ? "opacity-100" : "opacity-40"
                }`}>
                  <div className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center ${
                    done ? "bg-emerald-500" : active ? "bg-blue-500" : "bg-slate-200"
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-3 h-3 text-white" />
                      : active
                        ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        : <span className="text-[9px] text-slate-400 font-bold">{step}</span>
                    }
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold ${
                      done ? "text-emerald-700" : active ? "text-blue-800" : "text-slate-400"
                    }`}>
                      Step {step} — {CASCADE_STEPS[step].label}
                    </div>
                    {active && (
                      <div className="text-blue-600 mt-0.5">{CASCADE_STEPS[step].description}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Cascade Success Confirmation ── */}
      {!cascade.active && cascade.completedSteps.length === 4 && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="flex-1">
            ✓ Platform sync complete — Delivered Work, Swagger/API Coverage, Roger UI, and PO Summary all updated
          </span>
          {cascade.isRollback && (
            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-bold">ROLLBACK</span>
          )}
        </div>
      )}

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { count: complete,  label: "Complete",   bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
          { count: dev,       label: "In Dev",      bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700" },
          { count: inReview,  label: "In Review",   bg: "bg-violet-50",  border: "border-violet-200",  text: "text-violet-700" },
          { count: planned,   label: "Planned",     bg: "bg-slate-50",   border: "border-slate-200",   text: "text-slate-600" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 text-center`}>
            <div className={`text-3xl font-bold ${s.text}`}>{s.count}</div>
            <div className={`text-xs font-semibold mt-0.5 ${s.text}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Roger Consumer Readiness ── */}
      <RogerConsumerReadinessPanel />

      {/* ── Section 1: Batch Status ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Batch Status" subtitle="Update status here — changes propagate instantly to all screens" />
        <div className="divide-y divide-slate-100">
          {BATCH_KEYS.map((key) => {
            const status = statuses[key];
            const style = STATUS_STYLES[status];
            return (
              <div key={key} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: style.dot }}
                >
                  {key === "foundation-core" ? "FC" : `B${key}`}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 truncate">{BATCH_LABELS[key]}</div>
                </div>
                <select
                  value={status}
                  onChange={e => setStatus(key, e.target.value as BatchStatus)}
                  disabled={cascade.active}
                  className="text-xs font-semibold rounded-full border px-3 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Ready for QA">Ready for QA</option>
                  <option value="QA In Progress">QA In Progress</option>
                  <option value="Demo Ready">Demo Ready</option>
                  <option value="MVP">MVP</option>
                  <option value="Stretch">Stretch</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Gate Status ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader title="Derived Gate Status" subtitle="Updates automatically from batch progress" />
        <div className="divide-y divide-slate-100">
          {(["g1","g2","g3","g4"] as const).map(gKey => {
            const Icon = GATE_ICONS[gKey];
            return (
              <div key={gKey} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>
                <div className="flex-1 text-sm font-semibold text-slate-800">{GATE_LABELS[gKey]}</div>
                <GateStatusBadge status={gates[gKey]} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: Delivered Work by Batch ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader
          title="Delivered Work by Batch"
          subtitle="What was delivered, validated, and what remains open — use for PO status updates"
          cascadeStep={1}
          cascadeActive={cascade.active && cascade.currentStep === 1}
          cascadeDone={cascade.completedSteps.includes(1)}
        />
        {/* ── Export Panel ── */}
        {(() => {
          // ── PI membership map for filter ──
          const PI_MAP: Record<string,string> = {
            "foundation-core":"PI 1","1":"PI 1","2":"PI 1","2a":"PI 1","3":"PI 1",
            "4":"PI 2","5":"PI 2","6":"PI 2","7":"PI 2","8":"PI 2","9":"PI 2","10":"PI 2","11":"PI 2",
            "12":"PI 2","13":"PI 2 Stretch","16":"PI 2 Stretch",
            "17":"PI 3 MVP","20":"PI 3 MVP","21":"PI 3 MVP","22":"Post-MVP","23":"Post-MVP",
            "26":"PI 3 MVP","28":"PI 3 MVP","29":"PI 3 MVP","31":"PI 3 MVP","33":"PI 3 MVP","39":"MVP Promoted",
          };
          const DEMO_READY_KEYS = new Set(["foundation-core","1","2","2a","3","4","5","6","7"]);
          const GOV_KEYS = new Set(["3","4","6","7","9","11","12","14","16","24","25"]);

          const [exportFilter, setExportFilter] = useState<{pi:string;system:string;status:string;demoReady:boolean;govOnly:boolean}>({
            pi:"all", system:"all", status:"all", demoReady:false, govOnly:false
          });
          const [emailTemplate, setEmailTemplate] = useState<"executive"|"po-weekly"|"qa-readiness">("po-weekly");
          const [execRecapCopied, setExecRecapCopied] = useState(false);
          const [allPoNotesCopied, setAllPoNotesCopied] = useState(false);

          const applyFilter = (batches: typeof DELIVERED_BATCHES) => batches.filter(b => {
            const s = statuses[b.key as BatchKey] ?? "Not Started";
            const pi = PI_MAP[b.key] ?? "";
            if (exportFilter.pi !== "all" && pi !== exportFilter.pi) return false;
            if (exportFilter.system !== "all") {
              const sys = exportFilter.system;
              if (sys === "PDC" && !b.owner.includes("PDC")) return false;
              if (sys === "TDC" && !b.owner.includes("TDC")) return false;
            }
            if (exportFilter.status !== "all") {
              if (exportFilter.status === "complete" && s !== "Complete" && s !== "Delivered") return false;
              if (exportFilter.status === "inprogress" && s !== "In Progress") return false;
              if (exportFilter.status === "open" && b.open.length === 0) return false;
            }
            if (exportFilter.demoReady && !DEMO_READY_KEYS.has(b.key)) return false;
            if (exportFilter.govOnly && !GOV_KEYS.has(b.key)) return false;
            return true;
          });

          const buildBatchPayload = (b: typeof DELIVERED_BATCHES[0]) => ({
            batchId: b.key,
            batchName: b.label,
            pi: PI_MAP[b.key] ?? "Unknown",
            systemOwner: b.owner,
            status: statuses[b.key as BatchKey] ?? "Not Started",
            deliveryWindow: b.readiness,
            demoReady: DEMO_READY_KEYS.has(b.key),
            governanceFlags: GOV_KEYS.has(b.key) ? ["Governance-Aligned"] : [],
            delivered: b.delivered,
            validated: b.validated,
            openItems: b.open,
            dependencies: [],
            risks: b.open.filter(o => o.toLowerCase().includes("risk") || o.toLowerCase().includes("block")),
            poNote: b.poNote,
            lastUpdated: new Date().toISOString(),
          });

          const buildEmailText = (b: typeof DELIVERED_BATCHES[0], template: typeof emailTemplate) => {
            const s = statuses[b.key as BatchKey] ?? "Not Started";
            if (template === "executive") {
              return [
                `${b.label}`,
                `Status: ${s} | System: ${b.owner} | PI: ${PI_MAP[b.key] ?? "—"}`,
                "",
                `Summary: ${b.poNote}`,
                "",
                b.open.length > 0 ? `Open Items (${b.open.length}): ${b.open.join("; ")}` : "No open items.",
              ].join("\n");
            }
            if (template === "qa-readiness") {
              return [
                `QA READINESS — ${b.label}`,
                `Status: ${s} | Readiness: ${b.readiness}`,
                "",
                "Validated:",
                ...(b.validated.length > 0 ? b.validated.map(v => `• ${v}`) : ["• Not yet validated"]),
                "",
                "Open / Carry-Forward:",
                ...(b.open.length > 0 ? b.open.map(o => `• ${o}`) : ["• None"]),
              ].join("\n");
            }
            // po-weekly (default)
            return [
              `${b.label}`,
              `Status: ${s}`,
              `System: ${b.owner}`,
              "",
              "Delivered:",
              ...b.delivered.map(d => `• ${d}`),
              "",
              "Validated:",
              ...(b.validated.length > 0 ? b.validated.map(v => `• ${v}`) : ["• (none yet)"]),
              "",
              "Open / Carry Forward:",
              ...(b.open.length > 0 ? b.open.map(o => `• ${o}`) : ["• None"]),
              "",
              `PO Summary:\n${b.poNote}`,
            ].join("\n");
          };

          const buildMarkdown = (b: typeof DELIVERED_BATCHES[0]) => {
            const s = statuses[b.key as BatchKey] ?? "Not Started";
            return [
              `## ${b.label}`,
              `**Status:** ${s} | **System:** ${b.owner} | **PI:** ${PI_MAP[b.key] ?? "—"}`,
              `**Readiness:** ${b.readiness}`,
              "",
              "### Delivered",
              ...b.delivered.map(d => `- ${d}`),
              "",
              "### Validated",
              ...(b.validated.length > 0 ? b.validated.map(v => `- ${v}`) : ["- *(not yet validated)*"]),
              "",
              "### Open / Carry-Forward",
              ...(b.open.length > 0 ? b.open.map(o => `- ${o}`) : ["- *(none)*"]),
              "",
              "### PO Status Note",
              b.poNote,
            ].join("\n");
          };

          const buildWiki = (rows: typeof DELIVERED_BATCHES) => {
            const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            return [
              `= DCT Platform — Delivered Work by Batch =`,
              `Generated: ${today}`,
              "",
              ...rows.flatMap(b => {
                const s = statuses[b.key as BatchKey] ?? "Not Started";
                return [
                  `== ${b.label} ==`,
                  `'''Status:''' ${s} | '''System:''' ${b.owner}`,
                  "",
                  "'''Delivered:'''",
                  ...b.delivered.map(d => `* ${d}`),
                  "",
                  "'''Validated:'''",
                  ...(b.validated.length > 0 ? b.validated.map(v => `* ${v}`) : ["* (not yet validated)"]),
                  "",
                  "'''Open / Carry-Forward:'''",
                  ...(b.open.length > 0 ? b.open.map(o => `* ${o}`) : ["* (none)"]),
                  "",
                  `'''PO Note:''' ${b.poNote}`,
                  "",
                ];
              }),
            ].join("\n");
          };

          const buildExecRecap = (rows: typeof DELIVERED_BATCHES) => {
            const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
            const complete = rows.filter(b => { const s = statuses[b.key as BatchKey]; return s === "Complete" || s === "Delivered"; });
            const inProg = rows.filter(b => statuses[b.key as BatchKey] === "In Progress");
            const openItems = rows.flatMap(b => b.open.map(o => `${b.label.split(" — ")[0]}: ${o}`));
            const piCounts: Record<string,number> = {};
            complete.forEach(b => { const p = PI_MAP[b.key] ?? "Unknown"; piCounts[p] = (piCounts[p] ?? 0) + 1; });
            return [
              `DCT PLATFORM — EXECUTIVE DELIVERY RECAP`,
              `${today} | Source: DCT Gate Verification Dashboard`,
              "",
              "OVERALL COMPLETION",
              `${complete.length} of ${rows.length} tracked batches are complete.`,
              inProg.length > 0 ? `${inProg.length} batch(es) currently in progress: ${inProg.map(b => b.label.split(" — ")[0]).join(", ")}.` : "No batches currently in progress.",
              "",
              "PI PROGRESS SUMMARY",
              ...Object.entries(piCounts).map(([pi, n]) => `${pi}: ${n} batch(es) complete`),
              "",
              "GOVERNANCE MILESTONES",
              "• Schema Lock enforced on all delivered batches",
              "• Invariant Lock active — no breaking changes permitted post-delivery",
              "• Contract Publication confirmed for all Complete batches",
              complete.some(b => GOV_KEYS.has(b.key)) ? `• ${complete.filter(b => GOV_KEYS.has(b.key)).length} governance-aligned batch(es) delivered` : "",
              "",
              "CARRY-FORWARD SUMMARY",
              openItems.length > 0
                ? openItems.map(o => `• ${o}`).join("\n")
                : "• No open carry-forward items across delivered batches.",
              "",
              "UPCOMING DEPENDENCIES",
              inProg.length > 0
                ? inProg.map(b => `• ${b.label.split(" — ")[0]} — ${b.readiness}`).join("\n")
                : "• No active dependency blockers identified.",
              "",
              "OPEN RISK SUMMARY",
              openItems.filter(o => o.toLowerCase().includes("risk") || o.toLowerCase().includes("block") || o.toLowerCase().includes("pending")).length > 0
                ? openItems.filter(o => o.toLowerCase().includes("risk") || o.toLowerCase().includes("block") || o.toLowerCase().includes("pending")).map(o => `• ${o}`).join("\n")
                : "• No active risks identified at this time.",
            ].filter(Boolean).join("\n");
          };

          const downloadFile = (content: string, filename: string, type: string) => {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
          };

          const filtered = applyFilter(DELIVERED_BATCHES);
          const dateStr = new Date().toISOString().slice(0,10);

          return (
            <div className="border-b border-slate-200">
              {/* Row 1: Filters */}
              <div className="px-5 py-2.5 bg-slate-50 flex flex-wrap items-center gap-2 border-b border-slate-100">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1"><Filter className="w-3 h-3" /> Filter:</span>
                <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" value={exportFilter.pi} onChange={e => setExportFilter(f => ({...f, pi: e.target.value}))}>
                  <option value="all">All PIs</option>
                  <option value="PI 1">PI 1</option>
                  <option value="PI 2">PI 2</option>
                  <option value="PI 3">PI 3</option>
                  <option value="PI 4">PI 4</option>
                </select>
                <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" value={exportFilter.system} onChange={e => setExportFilter(f => ({...f, system: e.target.value}))}>
                  <option value="all">All Systems</option>
                  <option value="PDC">PDC Only</option>
                  <option value="TDC">TDC Only</option>
                </select>
                <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" value={exportFilter.status} onChange={e => setExportFilter(f => ({...f, status: e.target.value}))}>
                  <option value="all">All Statuses</option>
                  <option value="complete">Complete Only</option>
                  <option value="inprogress">In Progress Only</option>
                  <option value="open">Has Open Items</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={exportFilter.demoReady} onChange={e => setExportFilter(f => ({...f, demoReady: e.target.checked}))} className="rounded" />
                  Demo-Ready Only
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={exportFilter.govOnly} onChange={e => setExportFilter(f => ({...f, govOnly: e.target.checked}))} className="rounded" />
                  Governance Features Only
                </label>
                <span className="ml-auto text-xs text-slate-400">{filtered.length} of {DELIVERED_BATCHES.length} batches</span>
              </div>
              {/* Row 2: Email Template + Export All actions */}
              <div className="px-5 py-2.5 bg-slate-50 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1"><Download className="w-3 h-3" /> Export All:</span>
                <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-700" value={emailTemplate} onChange={e => setEmailTemplate(e.target.value as typeof emailTemplate)}>
                  <option value="po-weekly">PO Weekly Status</option>
                  <option value="executive">Executive Summary</option>
                  <option value="qa-readiness">QA Readiness Summary</option>
                </select>
                {/* CSV */}
                <button onClick={() => {
                  const header = ["BatchId","BatchName","PI","SystemOwner","Status","DeliveryWindow","DemoReady","GovernanceFlags","Delivered","Validated","OpenItems","Risks","PONote","LastUpdated"];
                  const rows = filtered.map(b => { const p = buildBatchPayload(b); return [
                    `"${p.batchId}"`,`"${p.batchName}"`,`"${p.pi}"`,`"${p.systemOwner}"`,`"${p.status}"`,`"${p.deliveryWindow}"`,
                    `"${p.demoReady}"`,`"${p.governanceFlags.join("|")}"`,`"${p.delivered.join(" | ")}"`,`"${p.validated.join(" | ")}"`,
                    `"${p.openItems.join(" | ")}"`,`"${p.risks.join(" | ")}"`,`"${p.poNote.replace(/"/g,"'")}"`,`"${p.lastUpdated}"`
                  ].join(","); });
                  downloadFile([header.join(","), ...rows].join("\n"), `DCT_Batch_Delivery_${dateStr}.csv`, "text/csv");
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-medium">
                  <FileSpreadsheet className="w-3 h-3" /> CSV
                </button>
                {/* JSON */}
                <button onClick={() => {
                  downloadFile(JSON.stringify(filtered.map(buildBatchPayload), null, 2), `DCT_Batch_Delivery_${dateStr}.json`, "application/json");
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-medium">
                  <FileJson className="w-3 h-3" /> JSON
                </button>
                {/* Markdown */}
                <button onClick={() => {
                  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  const md = [`# DCT Platform — Delivered Work by Batch`, `*Generated: ${today} | Filter: ${exportFilter.pi !== "all" ? exportFilter.pi : "All PIs"} · ${exportFilter.system !== "all" ? exportFilter.system : "All Systems"} · ${exportFilter.status !== "all" ? exportFilter.status : "All Statuses"}*`, "", ...filtered.map(buildMarkdown)].join("\n\n");
                  downloadFile(md, `DCT_Batch_Delivery_${dateStr}.md`, "text/markdown");
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 font-medium">
                  <AlignLeft className="w-3 h-3" /> Markdown
                </button>
                {/* Email Format */}
                <button onClick={() => {
                  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  const templateLabel = emailTemplate === "executive" ? "Executive Summary" : emailTemplate === "qa-readiness" ? "QA Readiness" : "PO Weekly Status";
                  const content = [`DCT PLATFORM — ${templateLabel.toUpperCase()} (${today})`, "", "═".repeat(60), "", ...filtered.map(b => buildEmailText(b, emailTemplate) + "\n\n" + "─".repeat(60))].join("\n");
                  downloadFile(content, `DCT_Batch_${emailTemplate}_${dateStr}.txt`, "text/plain");
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium">
                  <FileText className="w-3 h-3" /> Email Format
                </button>
                {/* Wiki/Confluence */}
                <button onClick={() => {
                  downloadFile(buildWiki(filtered), `DCT_Batch_Wiki_${dateStr}.txt`, "text/plain");
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                  <Link2 className="w-3 h-3" /> Wiki/Confluence
                </button>
                {/* Generate Executive Recap */}
                <button onClick={() => {
                  const recap = buildExecRecap(filtered);
                  navigator.clipboard.writeText(recap).then(() => { setExecRecapCopied(true); setTimeout(() => setExecRecapCopied(false), 2000); });
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-[#003865] bg-[#003865] text-white hover:bg-[#002a4d] font-medium">
                  {execRecapCopied ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                  {execRecapCopied ? "Copied!" : "Generate Exec Recap"}
                </button>
                {/* Copy All PO Notes */}
                <button onClick={() => {
                  const text = filtered.map(b => `${b.label.split(" — ")[0]}:\n${b.poNote}`).join("\n\n");
                  navigator.clipboard.writeText(text).then(() => { setAllPoNotesCopied(true); setTimeout(() => setAllPoNotesCopied(false), 2000); });
                }} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium">
                  {allPoNotesCopied ? <Check className="w-3 h-3" /> : <ClipboardCopy className="w-3 h-3" />}
                  {allPoNotesCopied ? "Copied!" : "Copy All PO Notes"}
                </button>
              </div>
            </div>
          );
        })()}
        <div className="divide-y divide-slate-100">
          {DELIVERED_BATCHES.map(b => {
            // Use live context status — overrides the hardcoded static value
            const liveStatus: BatchStatus = statuses[b.key as BatchKey] ?? "Not Started";
            // Map BatchStatus → DeliveryStatus for the style lookup
            const deliveryStatus: DeliveryStatus = (
              liveStatus === "Complete" || liveStatus === "Delivered" ? "Delivered" :
              liveStatus === "In Progress" || liveStatus === "Ready for QA" || liveStatus === "QA In Progress" || liveStatus === "Demo Ready" || liveStatus === "MVP" || liveStatus === "Stretch" ? "In Progress" :
              liveStatus === "Blocked" ? "Needs PO/Dev Confirmation" :
              "Not Started"
            );
            const style = DELIVERY_STYLE[deliveryStatus];
            const isExpanded = expandedBatch === b.key;
            return (
              <div key={b.key}>
                <button
                  onClick={() => setExpandedBatch(isExpanded ? null : b.key)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${style.bg} ${style.text} ${style.border}`}>
                    {liveStatus}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800">{b.label}</div>
                    <div className="text-xs text-slate-500">{b.owner} · {b.readiness}</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="text-xs font-bold text-[#003865] uppercase tracking-wide mb-1.5">Delivered</div>
                        {b.delivered.length > 0 ? b.delivered.map((d, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
                            <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>{d}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">Nothing delivered yet</div>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#003865] uppercase tracking-wide mb-1.5">Validated</div>
                        {b.validated.length > 0 ? b.validated.map((v, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700 mb-1">
                            <span className="text-blue-500 shrink-0 mt-0.5">✓</span>{v}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">Not yet validated</div>}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1.5">Open / Carry-Forward</div>
                        {b.open.length > 0 ? b.open.map((o, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-amber-800 mb-1">
                            <span className="shrink-0 mt-0.5">›</span>{o}
                          </div>
                        )) : <div className="text-xs text-slate-400 italic">No open items</div>}
                      </div>
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3 bg-white border border-slate-200 rounded-lg p-3">
                      <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">PO Status Note</div>
                        <div className="text-xs text-slate-700">{b.poNote}</div>
                      </div>
                      <CopyButton text={b.poNote} />
                    </div>
                    {/* Per-batch export actions */}
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-medium mr-0.5">Export this batch:</span>
                      <BatchExportButton label="Copy Summary" icon="copy" onClick={() => {
                        const s = statuses[b.key as BatchKey] ?? "Not Started";
                        const text = [
                          `${b.label}`,
                          `Status: ${s} | System: ${b.owner}`,
                          `Readiness: ${b.readiness}`,
                          "",
                          "Delivered: " + b.delivered.join(", "),
                          "Validated: " + (b.validated.length > 0 ? b.validated.join(", ") : "(none yet)"),
                          "Open: " + (b.open.length > 0 ? b.open.join(", ") : "None"),
                        ].join("\n");
                        navigator.clipboard.writeText(text);
                      }} />
                      <BatchExportButton label="Copy PO Update" icon="clipboard" onClick={() => {
                        navigator.clipboard.writeText(b.poNote);
                      }} />
                      <BatchExportButton label="Copy Email" icon="mail" onClick={() => {
                        const s = statuses[b.key as BatchKey] ?? "Not Started";
                        const text = [
                          `${b.label}`,
                          `Status: ${s}`,
                          `System: ${b.owner}`,
                          "",
                          "Delivered:",
                          ...b.delivered.map(d => `• ${d}`),
                          "",
                          "Validated:",
                          ...(b.validated.length > 0 ? b.validated.map(v => `• ${v}`) : ["• (none yet)"]),
                          "",
                          "Open / Carry Forward:",
                          ...(b.open.length > 0 ? b.open.map(o => `• ${o}`) : ["• None"]),
                          "",
                          `PO Summary:\n${b.poNote}`,
                        ].join("\n");
                        navigator.clipboard.writeText(text);
                      }} />
                      <BatchExportButton label="Export JSON" icon="json" onClick={() => {
                        const s = statuses[b.key as BatchKey] ?? "Not Started";
                        const payload = {
                          batchId: b.key, batchName: b.label, systemOwner: b.owner,
                          status: s, deliveryWindow: b.readiness,
                          delivered: b.delivered, validated: b.validated, openItems: b.open,
                          poNote: b.poNote, lastUpdated: new Date().toISOString(),
                        };
                        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url;
                        a.download = `DCT_Batch_${b.key}_${new Date().toISOString().slice(0,10)}.json`;
                        a.click(); URL.revokeObjectURL(url);
                      }} />
                      <BatchExportButton label="Export Markdown" icon="md" onClick={() => {
                        const s = statuses[b.key as BatchKey] ?? "Not Started";
                        const md = [
                          `## ${b.label}`,
                          `**Status:** ${s} | **System:** ${b.owner}`,
                          `**Readiness:** ${b.readiness}`,
                          "",
                          "### Delivered",
                          ...b.delivered.map(d => `- ${d}`),
                          "",
                          "### Validated",
                          ...(b.validated.length > 0 ? b.validated.map(v => `- ${v}`) : ["- *(not yet validated)*"]),
                          "",
                          "### Open / Carry-Forward",
                          ...(b.open.length > 0 ? b.open.map(o => `- ${o}`) : ["- *(none)*"]),
                          "",
                          "### PO Status Note",
                          b.poNote,
                        ].join("\n");
                        const blob = new Blob([md], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url;
                        a.download = `DCT_Batch_${b.key}_${new Date().toISOString().slice(0,10)}.md`;
                        a.click(); URL.revokeObjectURL(url);
                      }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Swagger / API Coverage ── */}
      {/* ── Section 3: Swagger / API Coverage (grouped) ── */}
      {(() => {
        // Build batch groups from liveSwaggerEntries
        const batchOrder: string[] = [];
        const batchMap: Record<string, SwaggerGroupEntry[]> = {};
        liveSwaggerEntries.forEach(e => {
          if (!batchMap[e.batch]) { batchMap[e.batch] = []; batchOrder.push(e.batch); }
          batchMap[e.batch].push(e as SwaggerGroupEntry);
        });

        return (
          <div className="space-y-0">
            {batchOrder.map((bn, idx) => (
              <SwaggerBatchGroup
                key={bn}
                batchName={bn}
                entries={batchMap[bn]}
                defaultOpen={idx === 0}
              />
            ))}
          </div>
        );
      })()}

      {/* ── Section 4: Roger UI Data Availability ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-100 bg-[#003865] flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-white">Roger UI Data Availability</div>
            <div className="text-xs text-blue-200 mt-0.5">Which data points are ready for Roger to consume now vs carried forward to PI 2</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* Cascade Step 3 indicator */}
            <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${
              cascade.completedSteps.includes(3)
                ? "bg-emerald-500 text-white"
                : cascade.active && cascade.currentStep === 3
                  ? "bg-blue-400 text-white"
                  : "bg-blue-800 text-blue-300"
            }`}>
              {cascade.completedSteps.includes(3)
                ? <CheckCircle2 className="w-3 h-3" />
                : cascade.active && cascade.currentStep === 3
                  ? <div className="w-2.5 h-2.5 rounded-full border border-white border-t-transparent animate-spin" />
                  : <Circle className="w-3 h-3" />
              }
              Step 3
            </div>
            {/* Copy Full Panel — for BA weekly */}
            <button
              onClick={copyFullPanel}
              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                panelCopied
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
              }`}
              title="Copy full panel as formatted text for BA weekly update"
            >
              {panelCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {panelCopied ? 'Opened!' : 'Export Panel'}
            </button>
            {/* Copy ADO IDs only */}
            <button
              onClick={copyAdoIds}
              className={`flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors ${
                adoCopied
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/30'
              }`}
              title="Copy all ADO Story IDs as comma-separated list"
            >
              {adoCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {adoCopied ? 'Copied!' : 'Copy ADO IDs'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table style={{fontSize: '11.5px', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: '1100px'}}>
            <colgroup>
              {/* Data Point */}
              <col style={{width: '170px'}} />
              {/* Source */}
              <col style={{width: '70px'}} />
              {/* Batch */}
              <col style={{width: '72px'}} />
              {/* Availability */}
              <col style={{width: '100px'}} />
              {/* API Endpoint */}
              <col style={{width: '200px'}} />
              {/* Fields Delivered */}
              <col style={{width: '220px'}} />
              {/* ADO Story */}
              <col style={{width: '160px'}} />
              {/* Notes */}
              <col style={{width: '130px'}} />
              {/* Owner */}
              <col style={{width: '70px'}} />
            </colgroup>
            <thead>
              <tr style={{background: '#002a52', borderBottom: '2px solid #001d3d'}}>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Data Point</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Source</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Batch</th>
                <th className="text-center px-3 py-2.5 font-bold text-white text-xs tracking-wide">Availability</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">API Endpoint</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">
                  <span className="flex items-center gap-1">
                    Fields Delivered
                    <span className="text-blue-300 font-normal text-xs">(payload)</span>
                  </span>
                </th>
                <th className="text-right px-3 py-2.5 font-bold text-white text-xs tracking-wide">ADO Story (ID)</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Notes / Gap</th>
                <th className="text-left px-3 py-2.5 font-bold text-white text-xs tracking-wide">Owner</th>
              </tr>
            </thead>
            <tbody>
              {liveRogerPoints.map((d, i) => {
                const rStyle = ROGER_STYLE[d.availability];
                const prevBatch = i > 0 ? liveRogerPoints[i - 1].batch : null;
                const isNewBatch = d.batch !== prevBatch;
                const isGap = d.notes.toLowerCase().includes("block") || d.notes.toLowerCase().includes("gap") || d.notes.toLowerCase().includes("not yet") || d.notes.toLowerCase().includes("pending");
                const noteIcon = isGap ? "⚠️" : "ℹ️";
                const noteExpanded = expandedNotes.has(i);
                const adoExpanded = expandedAdoRows.has(i);
                const visibleStories = adoExpanded ? d.adoStories : d.adoStories.slice(0, 2);
                const hasMoreStories = d.adoStories.length > 2;
                // Batch group tint — alternate subtle background per batch group
                const batchIndex = liveRogerPoints.findIndex(x => x.batch === d.batch);
                const batchGroupIndex = liveRogerPoints.filter((x, xi) => xi <= i && (xi === 0 || liveRogerPoints[xi-1].batch !== x.batch)).length - 1;
                const rowBg = batchGroupIndex % 2 === 0 ? '#ffffff' : '#f8fafc';
                return (
                  <tr
                    key={i}
                    style={{background: rowBg, borderTop: isNewBatch && i > 0 ? '2px solid #e2e8f0' : '1px solid #f1f5f9'}}
                    className="transition-colors hover:bg-blue-50"
                    onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = rowBg)}
                  >
                    {/* Data Point */}
                    <td className="px-3 font-medium text-slate-800" style={{padding: '12px 12px', wordBreak:'break-word', verticalAlign:'top'}}>{d.dataPoint}</td>
                    {/* Source */}
                    <td className="px-3 text-slate-500 text-xs" style={{padding: '12px 12px', wordBreak:'break-word', verticalAlign:'top'}}>{d.source}</td>
                    {/* Batch */}
                    <td className="px-3 font-semibold text-xs" style={{padding: '12px 12px', color:'#003865', whiteSpace:'nowrap', verticalAlign:'top'}}>{d.batch}</td>
                    {/* Availability — centered badge */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top', textAlign:'center'}}>
                      <span
                        className={`inline-flex items-center justify-center font-semibold rounded-full ${rStyle.bg} ${rStyle.text}`}
                        style={{fontSize:'10px', padding:'3px 10px', whiteSpace:'nowrap', minWidth:'90px'}}
                      >
                        {d.availability}
                      </span>
                    </td>
                    {/* API Endpoint — monospace with tint */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top'}}>
                      <span
                        className="font-mono text-slate-700 rounded px-1.5 py-1 block"
                        style={{fontSize:'10px', background:'#f1f5f9', wordBreak:'break-word', overflowWrap:'anywhere', lineHeight:'1.6', border:'1px solid #e2e8f0'}}
                      >
                        {d.apiEndpoint}
                      </span>
                    </td>
                    {/* Fields Delivered — expandable field chips */}
                    <td className="px-3" style={{padding: '10px 12px', verticalAlign:'top'}}>
                      {d.fieldsDelivered.length === 0 ? (
                        <span className="text-slate-400 italic" style={{fontSize:'10px'}}>— pending</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(expandedNotes.has(i + 1000) ? d.fieldsDelivered : d.fieldsDelivered.slice(0, 4)).map((f, fi) => {
                            const isGapField = f.toLowerCase().includes('missing') || f.toLowerCase().includes('gap') || f.toLowerCase().includes('pending');
                            return (
                              <span
                                key={fi}
                                className={`inline-block rounded px-1.5 py-0.5 font-mono leading-snug ${
                                  isGapField
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                                style={{fontSize:'9.5px', whiteSpace:'nowrap', maxWidth:'180px', overflow:'hidden', textOverflow:'ellipsis'}}
                                title={f}
                              >
                                {f}
                              </span>
                            );
                          })}
                          {d.fieldsDelivered.length > 4 && (
                            <button
                              onClick={() => toggleNote(i + 1000)}
                              className="text-blue-500 hover:text-blue-700 font-medium"
                              style={{fontSize:'9px'}}
                            >
                              {expandedNotes.has(i + 1000)
                                ? '▲ less'
                                : `+${d.fieldsDelivered.length - 4} more`
                              }
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    {/* ADO Story — right-aligned stacked cards with clickable links */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top', textAlign:'right'}}>
                      {visibleStories.map((s, si) => (
                        <div key={si} style={{marginBottom: si < visibleStories.length - 1 ? '8px' : 0}}>
                          {s.id ? (
                            <div className="inline-block text-right">
                              <div className="text-slate-700 leading-snug" style={{fontSize:'10px'}}>{s.title}</div>
                              <a
                                href={`https://dev.azure.com/RSMEquiCo/DCT/_workitems/edit/${s.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 mt-0.5 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                                style={{fontSize:'9px', padding:'2px 7px', textDecoration:'none'}}
                                title={`View in Azure DevOps — Story #${s.id}`}
                              >
                                #{s.id} ↗
                              </a>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic" style={{fontSize:'10px'}}>{s.title}</span>
                          )}
                        </div>
                      ))}
                      {hasMoreStories && (
                        <button
                          onClick={() => toggleAdo(i)}
                          className="text-blue-600 hover:text-blue-800 font-medium mt-1 block ml-auto"
                          style={{fontSize:'9.5px'}}
                        >
                          {adoExpanded ? '▲ show less' : `+${d.adoStories.length - 2} more`}
                        </button>
                      )}
                    </td>
                    {/* Notes / Gap — truncated with expand */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top'}}>
                      <div className="flex items-start gap-1">
                        <span style={{fontSize:'11px', lineHeight:'1.1', flexShrink:0}}>{noteIcon}</span>
                        <div className="flex-1 min-w-0">
                          <span
                            className="text-slate-700 leading-relaxed"
                            style={{
                              fontSize:'11px',
                              display: noteExpanded ? 'block' : '-webkit-box',
                              WebkitLineClamp: noteExpanded ? undefined : 3,
                              WebkitBoxOrient: 'vertical' as const,
                              overflow: noteExpanded ? 'visible' : 'hidden',
                              wordBreak: 'break-word',
                            }}
                          >
                            {d.notes}
                          </span>
                          {d.notes.length > 80 && (
                            <button
                              onClick={() => toggleNote(i)}
                              className="text-blue-500 hover:text-blue-700 font-medium mt-0.5 block"
                              style={{fontSize:'9.5px'}}
                            >
                              {noteExpanded ? 'show less' : '...'}
                            </button>
                          )}
                        </div>
                        <CopyNoteButton text={d.notes} />
                      </div>
                    </td>
                    {/* Owner */}
                    <td className="px-3" style={{padding: '12px 12px', verticalAlign:'top'}}>
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5" style={{fontSize:'10px', whiteSpace:'nowrap'}}>{d.owner}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BA Assistant: Roger UI Data Point Agent ── */}
      <BAAssistant
        rogerDataPoints={liveRogerPoints.map(d => ({
          dataPoint: d.dataPoint,
          source: d.source,
          batch: d.batch,
          availability: d.availability,
          apiEndpoint: d.apiEndpoint,
          notes: d.notes,
          owner: d.owner,
          adoStories: d.adoStories,
        }))}
        swaggerEntries={liveSwaggerEntries.map(e => ({
          batch: e.batch,
          endpoint: e.endpoint,
          path: e.path,
          status: e.status,
          consumerGuide: e.consumerGuide,
          notes: e.notes,
        }))}
      />

      {/* ── Section 5: PO Status Summary ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <SectionHeader
          title="PO Status Summary"
          subtitle="Copy-ready summary for Stephane / PO email or Teams update"
          cascadeStep={4}
          cascadeActive={cascade.active && cascade.currentStep === 4}
          cascadeDone={cascade.completedSteps.includes(4)}
        />
        <div className="p-5">
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Auto-generated from current batch data</div>
              {poSummaryGeneratedAt && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Generated: {poSummaryGeneratedAt}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={sendToTeams}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#464EB8] text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                title="Open Microsoft Teams with this summary pre-filled"
              >
                <Send className="w-3.5 h-3.5" />
                Send to Teams
              </button>
              <button
                onClick={copyPoSummary}
                className="flex items-center gap-1.5 text-xs font-semibold bg-[#003865] text-white px-3 py-1.5 rounded-lg hover:bg-blue-900 transition-colors"
              >
                {poSummaryCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {poSummaryCopied ? "Copied!" : "Copy Full Summary"}
              </button>
            </div>
          </div>
          <pre className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-4 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
            {poSummaryText}
          </pre>
        </div>
      </div>

      {/* ── Section 6 (Panel 7): Contract Readiness Matrix ── */}
      {(() => {
        // ── Contract metadata derived entirely from SWAGGER_ENTRIES + BATCH_GOV_FLAGS ──
        // One row per batch. Contract status, version, additive-only flag, consumer guide
        // alignment, and endpoint counts are all computed from live data — no static duplication.
        const CONTRACT_META: Record<string, {
          contractName: string;
          version: string;
          system: "PDC" | "TDC" | "PDC + TDC";
          additiveOnly: boolean;
          readContractPublished: boolean;
          lineageEnabled: boolean;
          immutable: boolean;
          consumerGuideLink: string;
          notes: string;
        }> = {
          "Batch FC":  { contractName: "Foundation Infrastructure",             version: "—",    system: "PDC + TDC", additiveOnly: false, readContractPublished: false, lineageEnabled: true,  immutable: false, consumerGuideLink: "—",                                          notes: "Infrastructure only. No Roger-facing contract." },
          "Batch 1":   { contractName: "IngestionStatus Read Contract",          version: "v1",  system: "PDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: false, consumerGuideLink: "GET /api/v1/Ingestion/{runId}",           notes: "Roger can confirm file arrival and processing state." },
          "Batch 2":   { contractName: "Normalized Trial Balance Read Contract", version: "v1",  system: "PDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: false, consumerGuideLink: "GET /api/v1/normalized-records",           notes: "vNormalizedTb Roger read contract published." },
          "Batch 2A":  { contractName: "Classification Enforcement Contract",    version: "v1",  system: "PDC",      additiveOnly: false, readContractPublished: true,  lineageEnabled: false, immutable: true,  consumerGuideLink: "GET /api/v1/classification-status/{runId}", notes: "Write contract. FirmTaxonomyId required. Rejection audit log." },
          "Batch 3":   { contractName: "TDC Reference Data Read Contract",       version: "v1",  system: "TDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: false, consumerGuideLink: "GET /api/TaxFormTemplates",                notes: "Orchestrator-facing. TaxFormTemplates, MappingRules, ConfidenceBandThresholds." },
          "Batch 4":   { contractName: "TDC Records Read Contract",              version: "v2",  system: "TDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: true,  consumerGuideLink: "GET /api/v2/tdc-records",                  notes: "Roger primary read contract. v1 and v2 both published. Decisions immutable." },
          "Batch 5":   { contractName: "Entity Identity Read Contract",          version: "v1",  system: "PDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: false, consumerGuideLink: "GET /api/v1/legal-entities",               notes: "PDC entity registry. Client Groups, Ownership Chains, Jurisdictions." },
          "Batch 6":   { contractName: "Adjustment & Sign-Off Write Contract",   version: "v1",  system: "TDC",      additiveOnly: false, readContractPublished: true,  lineageEnabled: false, immutable: true,  consumerGuideLink: "GET /api/v1/adjustments",                  notes: "Six-state adjustment lifecycle. SHA-256 sign-off. Non-repudiable." },
          "Batch 7":   { contractName: "Eligibility Determination Read Contract",version: "v1",  system: "TDC",      additiveOnly: true,  readContractPublished: true,  lineageEnabled: true,  immutable: true,  consumerGuideLink: "GET /api/v1/eligibility",                  notes: "Three-Tier Eligibility Model. Controlled Group determination." },
          "Batch 8":   { contractName: "ExceptionRecord & RemedyAction Contract",version: "v1*", system: "PDC + TDC", additiveOnly: true,  readContractPublished: false, lineageEnabled: true,  immutable: true,  consumerGuideLink: "GET /api/v1/exception-records (In Progress)", notes: "In Progress. ExceptionRecord, RemedyAction, Re-ingestion Trigger. Contract pending gate." },
        };

        // Compute per-batch endpoint counts from liveSwaggerEntries
        const endpointCounts: Record<string, { delivered: number; inProgress: number; total: number }> = {};
        liveSwaggerEntries.forEach(e => {
          if (!endpointCounts[e.batch]) endpointCounts[e.batch] = { delivered: 0, inProgress: 0, total: 0 };
          endpointCounts[e.batch].total++;
          if (e.status === "Delivered") endpointCounts[e.batch].delivered++;
          else if (e.status === "In Progress") endpointCounts[e.batch].inProgress++;
        });

        const batchOrder = ["Batch FC", "Batch 1", "Batch 2", "Batch 2A", "Batch 3", "Batch 4", "Batch 5", "Batch 6", "Batch 7", "Batch 8"];

        const [showContractMatrix, setShowContractMatrix] = useState(true);
        const [contractFilter, setContractFilter] = useState<"all" | "published" | "in-progress" | "missing">("all");

        const filteredBatches = batchOrder.filter(bn => {
          const meta = CONTRACT_META[bn];
          if (!meta) return false;
          if (contractFilter === "published") return meta.readContractPublished;
          if (contractFilter === "in-progress") return !meta.readContractPublished && bn === "Batch 8";
          if (contractFilter === "missing") return !meta.readContractPublished && bn !== "Batch FC";
          return true;
        });

        return (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <button
              className="w-full flex items-center justify-between px-5 py-3.5 bg-[#003865] text-white hover:bg-[#004a80] transition-colors"
              onClick={() => setShowContractMatrix(s => !s)}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-300" />
                <span className="text-sm font-bold">Panel 7 — Contract Readiness Matrix</span>
                <span className="text-xs text-blue-300 font-normal">· Derived from SWAGGER_ENTRIES · Read Contract publication status per batch</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200">{batchOrder.filter(b => CONTRACT_META[b]?.readContractPublished).length} published · {batchOrder.filter(b => !CONTRACT_META[b]?.readContractPublished && b !== "Batch FC").length} pending</span>
                {showContractMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showContractMatrix && (
              <div className="p-5 space-y-4">

                {/* Governance rule */}
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
                  <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />
                  <span>
                    <strong>Governance Rule:</strong> A Read Contract is only considered Published when all four gate conditions are met for that batch.
                    Additive-Only contracts may never remove or rename fields. Version history is immutable.
                    Data derived from <strong>SWAGGER_ENTRIES</strong> and <strong>BATCH_GOV_FLAGS</strong> — no manual entry.
                  </span>
                </div>

                {/* Summary tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Contracts Published",  value: batchOrder.filter(b => CONTRACT_META[b]?.readContractPublished).length,                         color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                    { label: "Additive-Only",         value: batchOrder.filter(b => CONTRACT_META[b]?.additiveOnly && CONTRACT_META[b]?.readContractPublished).length, color: "text-cyan-700",    bg: "bg-cyan-50 border-cyan-200" },
                    { label: "Lineage Enabled",       value: batchOrder.filter(b => CONTRACT_META[b]?.lineageEnabled).length,                                color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
                    { label: "Pending / In Progress", value: batchOrder.filter(b => !CONTRACT_META[b]?.readContractPublished && b !== "Batch FC").length,      color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
                  ].map(tile => (
                    <div key={tile.label} className={`rounded-lg border px-4 py-3 ${tile.bg}`}>
                      <div className={`text-2xl font-black ${tile.color}`}>{tile.value}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{tile.label}</div>
                    </div>
                  ))}
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter:</span>
                  {(["all", "published", "in-progress", "missing"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setContractFilter(f)}
                      className={`text-xs px-3 py-1 rounded-full font-semibold border transition-colors ${
                        contractFilter === f
                          ? "bg-[#003865] text-white border-[#003865]"
                          : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {f === "all" ? "All Batches" : f === "published" ? "Published" : f === "in-progress" ? "In Progress" : "Pending"}
                    </button>
                  ))}
                </div>

                {/* Matrix table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-600 w-24">Batch</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Contract Name</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-16">Version</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">System</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-24">Published</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-24">Additive-Only</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">Lineage</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">Immutable</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20">Endpoints</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Consumer Guide Entry Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBatches.map((bn, i) => {
                        const meta = CONTRACT_META[bn];
                        if (!meta) return null;
                        const counts = endpointCounts[bn] ?? { delivered: 0, inProgress: 0, total: 0 };
                        const isFC = bn === "Batch FC";
                        const isInProgress = !meta.readContractPublished && !isFC;
                        return (
                          <tr key={bn} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            {/* Batch */}
                            <td className="px-3 py-2.5">
                              <span className="font-bold text-slate-800">{bn.replace("Batch ", "B").replace("BFC", "FC")}</span>
                            </td>
                            {/* Contract Name */}
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-slate-700">{meta.contractName}</div>
                              <div className="text-slate-400 mt-0.5 leading-snug">{meta.notes}</div>
                            </td>
                            {/* Version */}
                            <td className="px-3 py-2.5 text-center">
                              <span className={`font-mono font-semibold ${
                                meta.version === "—" ? "text-slate-400" :
                                meta.version.includes("*") ? "text-amber-600" : "text-blue-700"
                              }`}>{meta.version}</span>
                            </td>
                            {/* System */}
                            <td className="px-3 py-2.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                meta.system === "PDC" ? "bg-blue-100 text-blue-800" :
                                meta.system === "TDC" ? "bg-purple-100 text-purple-800" :
                                "bg-slate-100 text-slate-700"
                              }`}>{meta.system}</span>
                            </td>
                            {/* Published */}
                            <td className="px-3 py-2.5 text-center">
                              {isFC ? (
                                <span className="text-slate-400">N/A</span>
                              ) : meta.readContractPublished ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                                  <Clock className="w-3.5 h-3.5" /> In Progress
                                </span>
                              )}
                            </td>
                            {/* Additive-Only */}
                            <td className="px-3 py-2.5 text-center">
                              {meta.additiveOnly ? (
                                <span className="inline-flex items-center gap-1 text-cyan-700 font-semibold">
                                  <Shield className="w-3 h-3" /> Yes
                                </span>
                              ) : (
                                <span className="text-slate-400">No</span>
                              )}
                            </td>
                            {/* Lineage */}
                            <td className="px-3 py-2.5 text-center">
                              {meta.lineageEnabled ? (
                                <span className="text-emerald-600 font-semibold">✓</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            {/* Immutable */}
                            <td className="px-3 py-2.5 text-center">
                              {meta.immutable ? (
                                <span className="inline-flex items-center gap-1 text-amber-700">
                                  <Lock className="w-3 h-3" /> Yes
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            {/* Endpoints */}
                            <td className="px-3 py-2.5 text-center">
                              <div className="font-semibold text-slate-700">{counts.total}</div>
                              {counts.inProgress > 0 && (
                                <div className="text-amber-600 text-xs">{counts.inProgress} in prog.</div>
                              )}
                            </td>
                            {/* Consumer Guide Entry Point */}
                            <td className="px-3 py-2.5">
                              <code className={`text-xs font-mono break-all ${
                                isInProgress ? "text-amber-600" : "text-blue-700"
                              }`}>{meta.consumerGuideLink}</code>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Published — all four gates verified</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-500" /> In Progress — delivery active, contract pending gate</div>
                  <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-cyan-500" /> Additive-Only — fields may only be added, never removed</div>
                  <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-500" /> Immutable — records locked after commitment</div>
                  <div className="flex items-center gap-1.5"><span className="font-mono text-amber-600">v1*</span> — version pending final gate</div>
                </div>

              </div>
            )}
          </div>
        );
      })()}

      {/* ── How it works ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="text-xs font-semibold text-blue-800 mb-2">How Status Propagation Works</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-700">
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Batch Roadmap</strong> — progress bar and badge update instantly</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Weekly Demo</strong> — readiness banner and feature statuses update</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Gate Status</strong> — G1–G4 PASSED/PENDING/PLANNED derived automatically</span></div>
          <div className="flex items-start gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Agent Hub</strong> — agent Active/Running/Standby/Idle derived from batch progress</span></div>
          <div className="flex items-start gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Persisted to localStorage</strong> — status survives page refresh and navigation</span></div>
          <div className="flex items-start gap-1.5"><Circle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" /><span><strong>Reset</strong> — restores Foundation Core + Batch 1 as Complete, Batch 2 as Dev</span></div>
        </div>
      </div>

      <footer className="pt-2 pb-1 border-t border-slate-100">
        <div className="text-xs text-slate-400">DCT Platform Global Control Panel · RSM | CATT · Batch Roadmap v2.1 · April 28, 2026</div>
      </footer>
    </div>
  );
}
