/**
 * Taxonomy Classification Validation Walkthrough — PDC & Orchestrator
 *
 * Design: Dark executive panel layout, slate-900 base, amber/red gap callouts.
 * Completely separate from TaxonomyPage.tsx — do NOT import or modify that file.
 *
 * Purpose: Walk leadership through:
 *   1. How classification is supposed to work
 *   2. Where classification lives in the system
 *   3. The current gap (Orchestrator not returning classification)
 *   4. The decisions required to move forward
 */

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4;
type StateLabel = "Current State" | "Expected State" | "Gap";

interface DecisionCheckpoint {
  id: number;
  question: string;
  owner: string;
  urgency: "Required" | "Recommended";
  answered: boolean;
}

// ─── Decision Checkpoints Data ────────────────────────────────────────────────

const INITIAL_DECISIONS: DecisionCheckpoint[] = [
  {
    id: 1,
    question: "Should FirmTaxonomyId be REQUIRED on all PDC records?",
    owner: "PDC / Architecture",
    urgency: "Required",
    answered: false,
  },
  {
    id: 2,
    question: "Should PDC reject records without classification?",
    owner: "PDC / Engineering",
    urgency: "Required",
    answered: false,
  },
  {
    id: 3,
    question:
      "Should classification overrides be allowed? If yes, must they be auditable?",
    owner: "TDC / Governance",
    urgency: "Required",
    answered: false,
  },
  {
    id: 4,
    question: "Confirm PDC uses PeriodStart/End only — not TaxYear?",
    owner: "PDC / Architecture",
    urgency: "Recommended",
    answered: false,
  },
  {
    id: 5,
    question:
      "Confirm taxonomy service owns hierarchy and versioning?",
    owner: "TDC / Taxonomy Team",
    urgency: "Recommended",
    answered: false,
  },
];

// ─── Step Metadata ────────────────────────────────────────────────────────────

const STEPS: {
  id: StepId;
  label: string;
  subtitle: string;
  system: string;
  stateLabel: StateLabel;
  stateColor: string;
}[] = [
  {
    id: 1,
    label: "Data Retrieval",
    subtitle: "API View",
    system: "PDC API",
    stateLabel: "Current State",
    stateColor: "bg-blue-900/60 border-blue-500/40 text-blue-300",
  },
  {
    id: 2,
    label: "Data Storage",
    subtitle: "PDC View",
    system: "PDC / NormalizedRecords",
    stateLabel: "Expected State",
    stateColor: "bg-emerald-900/60 border-emerald-500/40 text-emerald-300",
  },
  {
    id: 3,
    label: "Taxonomy",
    subtitle: "Source of Classification",
    system: "TDC / Taxonomy Service",
    stateLabel: "Expected State",
    stateColor: "bg-emerald-900/60 border-emerald-500/40 text-emerald-300",
  },
  {
    id: 4,
    label: "Gap Identification",
    subtitle: "Critical",
    system: "AI Orchestrator",
    stateLabel: "Gap",
    stateColor: "bg-red-900/60 border-red-500/40 text-red-300",
  },
];

// ─── Flow Diagram Component ───────────────────────────────────────────────────

function FlowDiagram({ activeStep }: { activeStep: StepId }) {
  const nodes = [
    { id: 1, label: "Ingestion", sub: "PDC", color: "bg-blue-800 border-blue-500" },
    { id: 2, label: "Orchestrator", sub: "AI Agent", color: "bg-violet-800 border-violet-500" },
    { id: 3, label: "Classification", sub: "Taxonomy", color: "bg-emerald-800 border-emerald-500", gap: true },
    { id: 4, label: "PDC Storage", sub: "NormalizedRecords", color: "bg-blue-800 border-blue-500" },
    { id: 5, label: "Retrieval", sub: "DataRecords API", color: "bg-sky-800 border-sky-500" },
  ];

  // Map step → which flow nodes are "active"
  const activeNodes: Record<StepId, number[]> = {
    1: [5],
    2: [4],
    3: [3],
    4: [2, 3],
  };
  const highlightedNodes = activeNodes[activeStep] ?? [];

  return (
    <div className="w-full mb-6">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
        Intended Architecture Flow
      </div>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {nodes.map((node, idx) => {
          const isActive = highlightedNodes.includes(node.id);
          const isGap = node.gap && activeStep === 4;
          const isArrowBroken = isGap;
          return (
            <div key={node.id} className="flex items-center shrink-0">
              {/* Node */}
              <div
                className={`
                  relative flex flex-col items-center justify-center px-4 py-2.5 rounded-lg border
                  transition-all duration-300 min-w-[110px]
                  ${isGap
                    ? "bg-red-900/80 border-red-400 ring-2 ring-red-400/60 shadow-lg shadow-red-900/40"
                    : isActive
                    ? `${node.color} ring-2 ring-white/20 shadow-md`
                    : "bg-slate-800/60 border-slate-600/40 opacity-50"
                  }
                `}
              >
                <span className={`text-xs font-bold ${isGap ? "text-red-200" : isActive ? "text-white" : "text-slate-400"}`}>
                  {node.label}
                </span>
                <span className={`text-[10px] mt-0.5 ${isGap ? "text-red-300" : isActive ? "text-white/70" : "text-slate-500"}`}>
                  {node.sub}
                </span>
                {isGap && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                    ✕ Missing
                  </span>
                )}
              </div>
              {/* Arrow */}
              {idx < nodes.length - 1 && (
                <div className="flex items-center mx-0.5">
                  {isArrowBroken ? (
                    <div className="flex items-center gap-0.5">
                      <div className="w-3 h-0.5 bg-red-400/60 border-dashed" />
                      <span className="text-red-400 text-xs font-bold">✕</span>
                      <div className="w-3 h-0.5 bg-red-400/60" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-6 h-0.5 bg-slate-500/60" />
                      <span className="text-slate-500 text-xs">▶</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {activeStep === 4 && (
        <div className="mt-2 flex items-center gap-2 text-red-300 text-xs font-medium">
          <span className="text-red-400 font-bold">⚠</span>
          Flow breaks at Orchestrator → Classification. Classification is not returned in the Orchestrator output contract.
        </div>
      )}
    </div>
  );
}

// ─── Step 1: Data Retrieval ───────────────────────────────────────────────────

function Step1Content() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
            DataRecords API
          </span>
          <span className="text-slate-400 text-xs font-mono">GET /api/pdc/data-records</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Query Filters</div>
            <div className="space-y-1.5">
              {[
                { field: "entityId", type: "GUID", note: "Required — scopes to entity" },
                { field: "periodStart", type: "DateOnly", note: "Required — temporal model" },
                { field: "periodEnd", type: "DateOnly", note: "Required — temporal model" },
                { field: "classificationStatus", type: "enum", note: "Optional — CLASSIFIED / UNCLASSIFIED / PENDING" },
              ].map((f) => (
                <div key={f.field} className="flex items-start gap-2 bg-slate-900/60 rounded-lg px-3 py-2">
                  <span className="font-mono text-sky-300 text-xs min-w-[160px]">{f.field}</span>
                  <span className="text-slate-500 text-xs min-w-[70px]">{f.type}</span>
                  <span className="text-slate-400 text-xs">{f.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Response Fields</div>
            <div className="space-y-1.5">
              {[
                { field: "documentId", type: "GUID", note: "Immutable lineage anchor" },
                { field: "runId", type: "GUID", note: "Processing run reference" },
                { field: "firmTaxonomyId", type: "GUID?", note: "⚠ May be null — gap" },
                { field: "classificationStatus", type: "enum?", note: "⚠ May be null — gap" },
                { field: "dataJson", type: "JSON", note: "Normalized financial payload" },
                { field: "processingRunId", type: "GUID", note: "Orchestrator run reference" },
              ].map((f) => (
                <div
                  key={f.field}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 ${
                    f.note.startsWith("⚠")
                      ? "bg-amber-900/30 border border-amber-500/30"
                      : "bg-slate-900/60"
                  }`}
                >
                  <span className={`font-mono text-xs min-w-[160px] ${f.note.startsWith("⚠") ? "text-amber-300" : "text-sky-300"}`}>
                    {f.field}
                  </span>
                  <span className="text-slate-500 text-xs min-w-[70px]">{f.type}</span>
                  <span className={`text-xs ${f.note.startsWith("⚠") ? "text-amber-400" : "text-slate-400"}`}>{f.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Annotation */}
      <div className="flex items-start gap-3 bg-blue-950/60 border border-blue-500/30 rounded-xl px-5 py-4">
        <span className="text-blue-400 text-lg mt-0.5">💬</span>
        <div>
          <div className="text-blue-200 font-semibold text-sm mb-1">Architecture Note</div>
          <div className="text-blue-100/80 text-sm leading-relaxed">
            This is how we retrieve data — as a filtered dataset, not individual records. The API supports a{" "}
            <code className="bg-blue-900/60 px-1 rounded text-blue-200 text-xs">classificationStatus</code> filter,
            but the field is inconsistently populated because the Orchestrator is not returning classification in its output.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Data Storage ─────────────────────────────────────────────────────

function Step2Content() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
            NormalizedRecords
          </span>
          <span className="text-slate-400 text-xs font-mono">PDC — vNormalizedTb</span>
        </div>
        <div className="space-y-2">
          {[
            {
              field: "documentId",
              type: "GUID",
              required: true,
              note: "Immutable lineage anchor — set at ingestion",
              state: "current",
            },
            {
              field: "runId",
              type: "GUID",
              required: true,
              note: "Processing run reference",
              state: "current",
            },
            {
              field: "entityId",
              type: "GUID",
              required: true,
              note: "PDC-assigned; immutable",
              state: "current",
            },
            {
              field: "periodStart",
              type: "DateOnly",
              required: true,
              note: "Temporal model — TaxYear is NOT stored",
              state: "current",
            },
            {
              field: "periodEnd",
              type: "DateOnly",
              required: true,
              note: "Temporal model — TaxYear is NOT stored",
              state: "current",
            },
            {
              field: "firmTaxonomyId",
              type: "GUID",
              required: false,
              note: "Classification reference — SHOULD be required; currently nullable",
              state: "gap",
            },
            {
              field: "classificationStatus",
              type: "enum",
              required: false,
              note: "CLASSIFIED / UNCLASSIFIED / PENDING — SHOULD be required; currently nullable",
              state: "gap",
            },
            {
              field: "dataJson",
              type: "JSON",
              required: true,
              note: "Normalized financial payload",
              state: "current",
            },
            {
              field: "processingRunId",
              type: "GUID",
              required: true,
              note: "Orchestrator run reference",
              state: "current",
            },
          ].map((f) => (
            <div
              key={f.field}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${
                f.state === "gap"
                  ? "bg-amber-900/30 border border-amber-500/30"
                  : "bg-slate-900/60"
              }`}
            >
              <span className={`font-mono text-xs w-44 shrink-0 ${f.state === "gap" ? "text-amber-300" : "text-sky-300"}`}>
                {f.field}
              </span>
              <span className="text-slate-500 text-xs w-20 shrink-0">{f.type}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-20 shrink-0 text-center ${
                  f.required
                    ? "bg-emerald-900/60 text-emerald-400 border border-emerald-600/40"
                    : "bg-amber-900/60 text-amber-400 border border-amber-600/40"
                }`}
              >
                {f.required ? "Required" : "Nullable ⚠"}
              </span>
              <span className={`text-xs ${f.state === "gap" ? "text-amber-300" : "text-slate-400"}`}>{f.note}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Annotation */}
      <div className="flex items-start gap-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-5 py-4">
        <span className="text-emerald-400 text-lg mt-0.5">💬</span>
        <div>
          <div className="text-emerald-200 font-semibold text-sm mb-1">Architecture Note</div>
          <div className="text-emerald-100/80 text-sm leading-relaxed">
            This is where classification should live. The system supports it — the schema has{" "}
            <code className="bg-emerald-900/60 px-1 rounded text-emerald-200 text-xs">FirmTaxonomyId</code> and{" "}
            <code className="bg-emerald-900/60 px-1 rounded text-emerald-200 text-xs">ClassificationStatus</code> fields — but they are not consistently populated because the Orchestrator is not returning classification in its output contract.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Taxonomy ─────────────────────────────────────────────────────────

function Step3Content() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hierarchy */}
        <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Hierarchy (Parent → Child)</div>
          <div className="space-y-1.5">
            {[
              { level: "L1", label: "Asset", indent: 0 },
              { level: "L2", label: "Fixed Asset", indent: 1 },
              { level: "L3", label: "Property & Equipment", indent: 2 },
              { level: "L3", label: "Intangible Assets", indent: 2 },
              { level: "L2", label: "Liquid Asset", indent: 1 },
              { level: "L1", label: "Liability", indent: 0 },
              { level: "L2", label: "Payable", indent: 1 },
            ].map((n, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs"
                style={{ paddingLeft: `${n.indent * 14}px` }}
              >
                <span className="text-slate-600 font-mono text-[10px] w-5">{n.level}</span>
                <span className={`${n.indent === 0 ? "text-emerald-300 font-semibold" : n.indent === 1 ? "text-slate-300" : "text-slate-400"}`}>
                  {n.indent > 0 ? "└ " : ""}{n.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Metadata Attributes */}
        <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Metadata Attributes</div>
          <div className="space-y-1.5">
            {[
              { attr: "Jurisdiction", val: "Federal / State / Local" },
              { attr: "EntityType", val: "C-Corp / Partnership / S-Corp" },
              { attr: "BasisType", val: "Tax / Book / GAAP" },
              { attr: "AdjustmentType", val: "Permanent / Temporary" },
              { attr: "ActivityType", val: "Operating / Investing / Financing" },
              { attr: "TimingClass", val: "Current / Deferred" },
              { attr: "IndustryClass", val: "General / Financial / RE" },
            ].map((a) => (
              <div key={a.attr} className="flex items-center gap-2 bg-slate-900/60 rounded px-2.5 py-1.5">
                <span className="text-emerald-300 text-xs font-mono w-28 shrink-0">{a.attr}</span>
                <span className="text-slate-400 text-xs">{a.val}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Effective Dates & Versioning */}
        <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Versioning & Effective Dates</div>
          <div className="space-y-3">
            {[
              {
                label: "TaxonomyVersion",
                val: "v2.4.1",
                note: "Semantic versioning — breaking changes increment major",
              },
              {
                label: "EffectiveFrom",
                val: "2024-01-01",
                note: "PeriodStart-aligned — TaxYear not stored",
              },
              {
                label: "EffectiveTo",
                val: "2024-12-31",
                note: "PeriodEnd-aligned — null = currently active",
              },
              {
                label: "Ownership",
                val: "TDC",
                note: "TDC is system of record for all taxonomy definitions",
              },
            ].map((v) => (
              <div key={v.label} className="bg-slate-900/60 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-emerald-300 text-xs font-mono">{v.label}</span>
                  <span className="text-white text-xs font-semibold">{v.val}</span>
                </div>
                <div className="text-slate-500 text-[11px]">{v.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Annotation */}
      <div className="flex items-start gap-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl px-5 py-4">
        <span className="text-emerald-400 text-lg mt-0.5">💬</span>
        <div>
          <div className="text-emerald-200 font-semibold text-sm mb-1">Architecture Note</div>
          <div className="text-emerald-100/80 text-sm leading-relaxed">
            This is the source of classification — fully metadata-driven. The taxonomy service is owned by TDC, supports parent-child hierarchy, versioned effective dates, and 7 metadata dimensions. Classification is deterministic given the metadata context. The Orchestrator should be consuming this service and returning a{" "}
            <code className="bg-emerald-900/60 px-1 rounded text-emerald-200 text-xs">FirmTaxonomyId</code> on every record.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 4: Gap Identification ───────────────────────────────────────────────

function Step4Content() {
  return (
    <div className="space-y-5">
      {/* Critical Gap Callout */}
      <div className="bg-red-950/80 border-2 border-red-500/60 rounded-xl p-5 shadow-lg shadow-red-900/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-200 font-black text-base uppercase tracking-wide">Critical Gap Identified</div>
            <div className="text-red-300/80 text-sm">Orchestrator output contract is missing classification</div>
          </div>
        </div>
        <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">
            Orchestrator Output — Current State
          </div>
          <div className="space-y-1.5">
            {[
              { field: "documentId", type: "GUID", present: true, note: "✓ Present" },
              { field: "runId", type: "GUID", present: true, note: "✓ Present" },
              { field: "entityId", type: "GUID", present: true, note: "✓ Present" },
              { field: "periodStart", type: "DateOnly", present: true, note: "✓ Present" },
              { field: "periodEnd", type: "DateOnly", present: true, note: "✓ Present" },
              { field: "normalizedAmount", type: "Decimal", present: true, note: "✓ Present" },
              { field: "firmTaxonomyId", type: "GUID", present: false, note: "✕ NOT RETURNED — blocking gap" },
              { field: "classificationStatus", type: "enum", present: false, note: "✕ NOT RETURNED — blocking gap" },
              { field: "classificationConfidence", type: "Decimal?", present: false, note: "✕ NOT RETURNED — blocking gap" },
            ].map((f) => (
              <div
                key={f.field}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  !f.present
                    ? "bg-red-900/60 border border-red-400/40"
                    : "bg-slate-900/40"
                }`}
              >
                <span className={`font-mono text-xs w-44 shrink-0 ${!f.present ? "text-red-300 font-bold" : "text-slate-400"}`}>
                  {f.field}
                </span>
                <span className="text-slate-500 text-xs w-20 shrink-0">{f.type}</span>
                <span className={`text-xs font-semibold ${!f.present ? "text-red-300" : "text-emerald-400"}`}>{f.note}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              label: "Impact on PDC",
              desc: "FirmTaxonomyId and ClassificationStatus remain null in NormalizedRecords — schema supports it but data is absent",
              color: "border-amber-500/40 bg-amber-900/20",
              textColor: "text-amber-300",
            },
            {
              label: "Impact on Retrieval",
              desc: "DataRecords API classificationStatus filter returns no results — the filter exists but the data does not",
              color: "border-red-500/40 bg-red-900/20",
              textColor: "text-red-300",
            },
            {
              label: "Impact on TDC",
              desc: "Tax mapping cannot proceed without classification — Batch 4 AI mapping is blocked until this gap is resolved",
              color: "border-red-500/40 bg-red-900/20",
              textColor: "text-red-300",
            },
          ].map((i) => (
            <div key={i.label} className={`rounded-lg border px-4 py-3 ${i.color}`}>
              <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${i.textColor}`}>{i.label}</div>
              <div className="text-slate-300 text-xs leading-relaxed">{i.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Annotation */}
      <div className="flex items-start gap-3 bg-red-950/60 border border-red-500/30 rounded-xl px-5 py-4">
        <span className="text-red-400 text-lg mt-0.5">💬</span>
        <div>
          <div className="text-red-200 font-semibold text-sm mb-1">Architecture Note</div>
          <div className="text-red-100/80 text-sm leading-relaxed">
            <strong className="text-red-200">Orchestrator is not returning classification — this is the blocking gap.</strong>{" "}
            The architecture is correct: the taxonomy service exists, the PDC schema supports classification fields, and the API filter is implemented. The single missing piece is that the Orchestrator output contract does not include{" "}
            <code className="bg-red-900/60 px-1 rounded text-red-200 text-xs">FirmTaxonomyId</code> or{" "}
            <code className="bg-red-900/60 px-1 rounded text-red-200 text-xs">ClassificationStatus</code>. A decision is required to enforce classification in the Orchestrator contract.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Decision Checkpoints Panel ───────────────────────────────────────────────

function DecisionPanel({
  decisions,
  onToggle,
}: {
  decisions: DecisionCheckpoint[];
  onToggle: (id: number) => void;
}) {
  const answeredCount = decisions.filter((d) => d.answered).length;
  return (
    <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-lg">⚖</span>
          <div>
            <div className="text-amber-200 font-bold text-sm uppercase tracking-wide">Decision Checkpoints</div>
            <div className="text-slate-400 text-xs">Required before Orchestrator contract can be finalized</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-slate-400">{answeredCount}/{decisions.length} addressed</div>
          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(answeredCount / decisions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        {decisions.map((d) => (
          <button
            key={d.id}
            onClick={() => onToggle(d.id)}
            className={`w-full text-left flex items-start gap-3 rounded-lg px-4 py-3 border transition-all duration-200 ${
              d.answered
                ? "bg-emerald-900/30 border-emerald-500/30 hover:bg-emerald-900/40"
                : "bg-slate-900/60 border-slate-600/40 hover:bg-slate-700/60"
            }`}
          >
            <div
              className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                d.answered
                  ? "bg-emerald-500 border-emerald-400"
                  : "border-slate-500"
              }`}
            >
              {d.answered && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm leading-snug ${d.answered ? "text-emerald-200 line-through opacity-70" : "text-slate-200"}`}>
                {d.question}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 text-xs">Owner: {d.owner}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    d.urgency === "Required"
                      ? "bg-red-900/60 text-red-400 border border-red-600/40"
                      : "bg-amber-900/60 text-amber-400 border border-amber-600/40"
                  }`}
                >
                  {d.urgency}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      {answeredCount === decisions.length && (
        <div className="mt-4 flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-3">
          <span className="text-emerald-400">✓</span>
          <span className="text-emerald-200 text-sm font-semibold">All decisions addressed — ready to update Orchestrator contract</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ClassificationWalkthroughPage() {
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [decisions, setDecisions] = useState<DecisionCheckpoint[]>(INITIAL_DECISIONS);
  const [showDecisions, setShowDecisions] = useState(false);

  const toggleDecision = useCallback((id: number) => {
    setDecisions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, answered: !d.answered } : d))
    );
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActiveStep((s) => (s < 4 ? ((s + 1) as StepId) : s));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const currentStep = STEPS.find((s) => s.id === activeStep)!;
  const answeredCount = decisions.filter((d) => d.answered).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/60 bg-slate-900/80 px-6 py-4 sticky top-0 z-30 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-amber-600/30 border border-amber-500/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Architecture Walkthrough
              </span>
              <span className="bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                Decision Required
              </span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight leading-tight">
              Taxonomy Classification Validation Walkthrough
            </h1>
            <div className="text-slate-400 text-xs mt-0.5">PDC &amp; Orchestrator · For Leadership Review</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowDecisions((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showDecisions
                  ? "bg-amber-600/30 border-amber-500/40 text-amber-200"
                  : "bg-slate-800 border-slate-600/40 text-slate-300 hover:border-amber-500/40"
              }`}
            >
              <span>⚖</span>
              <span>Decisions ({answeredCount}/{decisions.length})</span>
            </button>
            <div className="text-slate-600 text-xs hidden md:block">← → to navigate</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Flow Diagram */}
        <FlowDiagram activeStep={activeStep} />

        {/* Step Navigation */}
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative flex flex-col items-start px-4 py-3 rounded-xl border transition-all duration-200 text-left ${
                activeStep === step.id
                  ? step.id === 4
                    ? "bg-red-900/50 border-red-500/60 shadow-lg shadow-red-900/30"
                    : "bg-slate-700/80 border-slate-400/40 shadow-md"
                  : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-500/40"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ${
                    activeStep === step.id
                      ? step.id === 4
                        ? "bg-red-500 text-white"
                        : "bg-white text-slate-900"
                      : "bg-slate-700 text-slate-400"
                  }`}
                >
                  {step.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${step.stateColor}`}
                >
                  {step.stateLabel}
                </span>
              </div>
              <div className={`text-xs font-bold leading-tight ${activeStep === step.id ? "text-white" : "text-slate-400"}`}>
                {step.label}
              </div>
              <div className={`text-[11px] ${activeStep === step.id ? "text-slate-300" : "text-slate-600"}`}>
                {step.subtitle}
              </div>
              <div className={`text-[10px] mt-1 font-mono ${activeStep === step.id ? "text-slate-400" : "text-slate-600"}`}>
                {step.system}
              </div>
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`text-xs font-black w-7 h-7 rounded-full flex items-center justify-center ${
                activeStep === 4 ? "bg-red-500 text-white" : "bg-white text-slate-900"
              }`}
            >
              {activeStep}
            </div>
            <div>
              <div className="text-white font-black text-base">{currentStep.label}</div>
              <div className="text-slate-400 text-xs">{currentStep.subtitle} · {currentStep.system}</div>
            </div>
            <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${currentStep.stateColor}`}>
              {currentStep.stateLabel}
            </span>
          </div>

          {activeStep === 1 && <Step1Content />}
          {activeStep === 2 && <Step2Content />}
          {activeStep === 3 && <Step3Content />}
          {activeStep === 4 && <Step4Content />}

          {/* Step navigation buttons */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/40">
            <button
              onClick={() => setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
              disabled={activeStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600/40 text-slate-300 text-sm font-semibold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← {activeStep > 1 ? `Step ${activeStep - 1}: ${STEPS[activeStep - 2].label}` : "Previous"}
            </button>
            {activeStep < 4 ? (
              <button
                onClick={() => setActiveStep((s) => ((s + 1) as StepId))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  activeStep + 1 === 4
                    ? "bg-red-700/60 border-red-500/60 text-red-100 hover:bg-red-700/80"
                    : "bg-slate-700 border-slate-500/40 text-white hover:bg-slate-600"
                }`}
              >
                {`Step ${activeStep + 1}: ${STEPS[activeStep].label}`} →
              </button>
            ) : (
              <button
                onClick={() => setShowDecisions(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-700/60 border border-amber-500/60 text-amber-100 text-sm font-semibold hover:bg-amber-700/80 transition-all"
              >
                ⚖ Review Decision Checkpoints →
              </button>
            )}
          </div>
        </div>

        {/* Decision Checkpoints (collapsible) */}
        {showDecisions && (
          <DecisionPanel decisions={decisions} onToggle={toggleDecision} />
        )}

        {/* Summary Footer */}
        <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-emerald-400 font-black text-lg">✓</div>
              <div className="text-slate-300 text-xs font-semibold mt-1">Architecture is Correct</div>
              <div className="text-slate-500 text-xs">Schema, API, and taxonomy service are all in place</div>
            </div>
            <div>
              <div className="text-red-400 font-black text-lg">✕</div>
              <div className="text-slate-300 text-xs font-semibold mt-1">Classification Dependency Missing</div>
              <div className="text-slate-500 text-xs">Orchestrator not returning FirmTaxonomyId in output</div>
            </div>
            <div>
              <div className="text-amber-400 font-black text-lg">⚖</div>
              <div className="text-slate-300 text-xs font-semibold mt-1">Decision Required</div>
              <div className="text-slate-500 text-xs">Enforce classification in Orchestrator contract to unblock Batch 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
