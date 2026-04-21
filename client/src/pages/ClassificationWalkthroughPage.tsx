/**
 * Taxonomy Classification Validation — PDC & Orchestrator Alignment
 *
 * Design: Dark executive panel layout, slate-950 base, amber/red gap callouts.
 * Completely separate from TaxonomyPage.tsx — do NOT import or modify that file.
 *
 * Spec: pasted_content_11.txt — refined walkthrough for leadership (Cass)
 * Steps: Data Retrieval → Data Storage → Taxonomy → Gap Identification
 * Plus: Expected State visual, Decision Checkpoints, Final Message
 */

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = 1 | 2 | 3 | 4 | 5;

interface DecisionCheckpoint {
  id: number;
  question: string;
  answered: boolean;
}

// ─── Decision Checkpoints ─────────────────────────────────────────────────────

const INITIAL_DECISIONS: DecisionCheckpoint[] = [
  { id: 1, question: "Should FirmTaxonomyId be REQUIRED on all PDC records?", answered: false },
  { id: 2, question: "Should PDC reject records that do not include classification?", answered: false },
  { id: 3, question: "Should classification overrides be allowed, and must they be auditable?", answered: false },
  { id: 4, question: "Confirm PDC uses PeriodStart and PeriodEnd only (not TaxYear).", answered: false },
  { id: 5, question: "Confirm taxonomy service owns hierarchy, versioning, and classification rules.", answered: false },
];

// ─── Step Definitions ─────────────────────────────────────────────────────────

const STEPS: { id: StepId; label: string; subtitle: string; stateLabel: string; stateColor: string }[] = [
  { id: 1, label: "Data Retrieval",    subtitle: "API View",               stateLabel: "Current State",   stateColor: "bg-blue-900/60 border-blue-500/40 text-blue-300" },
  { id: 2, label: "Data Storage",      subtitle: "PDC Database",           stateLabel: "Expected State",  stateColor: "bg-emerald-900/60 border-emerald-500/40 text-emerald-300" },
  { id: 3, label: "Taxonomy",          subtitle: "Source of Classification",stateLabel: "Expected State",  stateColor: "bg-emerald-900/60 border-emerald-500/40 text-emerald-300" },
  { id: 4, label: "Gap Identification",subtitle: "Critical",               stateLabel: "Gap",             stateColor: "bg-red-900/60 border-red-500/40 text-red-300" },
  { id: 5, label: "Expected State",    subtitle: "Full Flow",              stateLabel: "Target",          stateColor: "bg-violet-900/60 border-violet-500/40 text-violet-300" },
];

// ─── Callout Block ────────────────────────────────────────────────────────────

function Callout({ items, color = "blue" }: { items: string[]; color?: "blue" | "emerald" | "red" | "amber" | "violet" }) {
  const styles: Record<string, string> = {
    blue:    "bg-blue-950/60 border-blue-500/30 text-blue-100/80",
    emerald: "bg-emerald-950/60 border-emerald-500/30 text-emerald-100/80",
    red:     "bg-red-950/60 border-red-500/30 text-red-100/80",
    amber:   "bg-amber-950/60 border-amber-500/30 text-amber-100/80",
    violet:  "bg-violet-950/60 border-violet-500/30 text-violet-100/80",
  };
  const iconColors: Record<string, string> = {
    blue: "text-blue-400", emerald: "text-emerald-400", red: "text-red-400", amber: "text-amber-400", violet: "text-violet-400",
  };
  return (
    <div className={`border rounded-xl px-5 py-4 space-y-2 ${styles[color]}`}>
      <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${iconColors[color]}`}>💬 Callouts</div>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 text-sm leading-relaxed">
          <span className={`mt-1 shrink-0 ${iconColors[color]}`}>›</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Flow Diagram ─────────────────────────────────────────────────────────────

function FlowDiagram({ activeStep }: { activeStep: StepId }) {
  const nodes = [
    { id: 1, label: "Ingestion",    sub: "PDC",              color: "bg-blue-800 border-blue-500" },
    { id: 2, label: "Orchestrator", sub: "AI Agent",         color: "bg-violet-800 border-violet-500", breakAfter: true },
    { id: 3, label: "Classification",sub: "Taxonomy",        color: "bg-emerald-800 border-emerald-500", isGapNode: true },
    { id: 4, label: "PDC Storage",  sub: "NormalizedRecords",color: "bg-blue-800 border-blue-500" },
    { id: 5, label: "Retrieval",    sub: "DataRecords API",  color: "bg-sky-800 border-sky-500" },
  ];

  const isGapActive = activeStep === 4;
  const isExpectedActive = activeStep === 5;

  // Which nodes are highlighted per step
  const highlightMap: Record<StepId, number[]> = { 1: [5], 2: [4], 3: [3], 4: [2, 3], 5: [1, 2, 3, 4, 5] };
  const highlighted = highlightMap[activeStep] ?? [];

  return (
    <div className="w-full mb-6">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Architecture Flow</div>
      <div className="flex items-center gap-0 overflow-x-auto pb-2">
        {nodes.map((node, idx) => {
          const isActive = highlighted.includes(node.id);
          const isGap = node.isGapNode && isGapActive;
          const isExpected = isExpectedActive;
          return (
            <div key={node.id} className="flex items-center shrink-0">
              <div className={`
                relative flex flex-col items-center justify-center px-4 py-2.5 rounded-lg border
                transition-all duration-300 min-w-[110px]
                ${isGap
                  ? "bg-red-900/80 border-red-400 ring-2 ring-red-400/60 shadow-lg shadow-red-900/40"
                  : isExpected && isActive
                  ? `${node.color} ring-2 ring-emerald-400/40 shadow-md`
                  : isActive
                  ? `${node.color} ring-2 ring-white/20 shadow-md`
                  : "bg-slate-800/60 border-slate-600/40 opacity-40"
                }
              `}>
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
                {isExpectedActive && isActive && node.isGapNode && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide whitespace-nowrap">
                    ✓ Required
                  </span>
                )}
              </div>
              {idx < nodes.length - 1 && (
                <div className="flex items-center mx-0.5">
                  {isGapActive && node.breakAfter ? (
                    <div className="flex items-center gap-0.5">
                      <div className="w-3 h-0.5 bg-red-400/60" />
                      <span className="text-red-400 text-xs font-bold">✕</span>
                      <div className="w-3 h-0.5 bg-red-400/60" />
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className={`w-6 h-0.5 ${isExpectedActive ? "bg-emerald-500/60" : "bg-slate-500/60"}`} />
                      <span className={`text-xs ${isExpectedActive ? "text-emerald-400" : "text-slate-500"}`}>▶</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isGapActive && (
        <div className="mt-2 flex items-center gap-2 text-red-300 text-xs font-medium">
          <span className="text-red-400 font-bold">⚠</span>
          Flow breaks at Orchestrator → Classification. Classification is not returned in the Orchestrator output contract.
        </div>
      )}
      {isExpectedActive && (
        <div className="mt-2 flex items-center gap-2 text-emerald-300 text-xs font-medium">
          <span className="text-emerald-400 font-bold">✓</span>
          Expected: Every record includes FirmTaxonomyId before being stored in PDC.
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
          <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">DataRecords API</span>
          <span className="text-slate-400 text-xs font-mono">GET /api/pdc/data-records</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Query Filters</div>
            <div className="space-y-1.5">
              {[
                { field: "entityId",            type: "GUID",    note: "Required — scopes to entity" },
                { field: "periodStart",          type: "DateOnly",note: "Required — temporal model" },
                { field: "periodEnd",            type: "DateOnly",note: "Required — temporal model" },
                { field: "classificationStatus", type: "enum",   note: "CLASSIFIED / UNCLASSIFIED / PENDING" },
              ].map((f) => (
                <div key={f.field} className="flex items-start gap-2 bg-slate-900/60 rounded-lg px-3 py-2">
                  <span className="font-mono text-sky-300 text-xs min-w-[170px]">{f.field}</span>
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
                { field: "documentId",           type: "GUID",   note: "Immutable lineage anchor",       gap: false },
                { field: "runId",                type: "GUID",   note: "Processing run reference",        gap: false },
                { field: "firmTaxonomyId",        type: "GUID?",  note: "⚠ May be null — gap",            gap: true },
                { field: "classificationStatus",  type: "enum?",  note: "⚠ May be null — gap",            gap: true },
                { field: "dataJson",             type: "JSON",   note: "Normalized financial payload",    gap: false },
                { field: "processingRunId",       type: "GUID",   note: "Orchestrator run reference",     gap: false },
              ].map((f) => (
                <div key={f.field} className={`flex items-start gap-2 rounded-lg px-3 py-2 ${f.gap ? "bg-amber-900/30 border border-amber-500/30" : "bg-slate-900/60"}`}>
                  <span className={`font-mono text-xs min-w-[170px] ${f.gap ? "text-amber-300" : "text-sky-300"}`}>{f.field}</span>
                  <span className="text-slate-500 text-xs min-w-[60px]">{f.type}</span>
                  <span className={`text-xs ${f.gap ? "text-amber-400" : "text-slate-400"}`}>{f.note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Callout color="blue" items={[
        "This is how data is retrieved from PDC — as a filtered dataset, not individual records.",
        "Data is scoped by EntityId and PeriodStart/PeriodEnd.",
        "This design assumes records are already classified and ready for consumption.",
      ]} />
    </div>
  );
}

// ─── Step 2: Data Storage ─────────────────────────────────────────────────────

function Step2Content() {
  return (
    <div className="space-y-5">
      <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">NormalizedRecords</span>
          <span className="text-slate-400 text-xs font-mono">PDC — vNormalizedTb</span>
        </div>
        <div className="space-y-2">
          {[
            { field: "documentId",          type: "GUID",     required: true,  note: "Immutable lineage anchor — set at ingestion",                        gap: false },
            { field: "runId",               type: "GUID",     required: true,  note: "Processing run reference",                                           gap: false },
            { field: "entityId",            type: "GUID",     required: true,  note: "PDC-assigned; immutable",                                            gap: false },
            { field: "periodStart",         type: "DateOnly", required: true,  note: "Temporal model — TaxYear is NOT stored",                             gap: false },
            { field: "periodEnd",           type: "DateOnly", required: true,  note: "Temporal model — TaxYear is NOT stored",                             gap: false },
            { field: "firmTaxonomyId",       type: "GUID",     required: false, note: "Classification reference — SHOULD be required; currently nullable",  gap: true  },
            { field: "classificationStatus", type: "enum",     required: false, note: "CLASSIFIED / UNCLASSIFIED / PENDING — currently nullable",           gap: true  },
            { field: "dataJson",            type: "JSON",     required: true,  note: "Normalized financial payload",                                       gap: false },
            { field: "processingRunId",      type: "GUID",     required: true,  note: "Orchestrator run reference",                                         gap: false },
          ].map((f) => (
            <div key={f.field} className={`flex items-center gap-3 rounded-lg px-4 py-2.5 ${f.gap ? "bg-amber-900/30 border border-amber-500/30" : "bg-slate-900/60"}`}>
              <span className={`font-mono text-xs w-44 shrink-0 ${f.gap ? "text-amber-300" : "text-sky-300"}`}>{f.field}</span>
              <span className="text-slate-500 text-xs w-20 shrink-0">{f.type}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase w-20 shrink-0 text-center ${f.required ? "bg-emerald-900/60 text-emerald-400 border border-emerald-600/40" : "bg-amber-900/60 text-amber-400 border border-amber-600/40"}`}>
                {f.required ? "Required" : "Nullable ⚠"}
              </span>
              <span className={`text-xs ${f.gap ? "text-amber-300" : "text-slate-400"}`}>{f.note}</span>
            </div>
          ))}
        </div>
      </div>
      <Callout color="emerald" items={[
        "This is where classification should live in PDC.",
        "FirmTaxonomyId represents the classification of the financial record.",
        "ClassificationStatus indicates whether the record is usable or incomplete.",
        "The data model supports classification — but it is not consistently populated today.",
      ]} />
    </div>
  );
}

// ─── Step 3: Taxonomy ─────────────────────────────────────────────────────────

function Step3Content() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Canonical Accounts + Firm Taxonomy Bridge */}
        <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Canonical Accounts → Firm Taxonomy Bridge</div>
          <div className="space-y-2">
            {[
              { canonical: "CA-1001", label: "Fixed Assets — Prop & Equip", firmId: "FT-4210", firmLabel: "Depreciable Property" },
              { canonical: "CA-1002", label: "Fixed Assets — Intangibles",  firmId: "FT-4211", firmLabel: "Amortizable Intangibles" },
              { canonical: "CA-2001", label: "Liquid Assets — Cash",        firmId: "FT-3100", firmLabel: "Cash & Equivalents" },
              { canonical: "CA-3001", label: "Revenue — Service",           firmId: "FT-5010", firmLabel: "Service Revenue" },
              { canonical: "CA-4001", label: "Expense — Compensation",      firmId: "FT-6100", firmLabel: "Compensation Expense" },
            ].map((r) => (
              <div key={r.canonical} className="flex items-center gap-2 bg-slate-900/60 rounded-lg px-3 py-2">
                <span className="font-mono text-sky-300 text-xs w-16 shrink-0">{r.canonical}</span>
                <span className="text-slate-400 text-xs flex-1 min-w-0 truncate">{r.label}</span>
                <span className="text-slate-600 text-xs mx-1">→</span>
                <span className="font-mono text-emerald-300 text-xs w-16 shrink-0">{r.firmId}</span>
                <span className="text-slate-400 text-xs flex-1 min-w-0 truncate">{r.firmLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hierarchy + Metadata */}
        <div className="space-y-3">
          <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Hierarchy Path</div>
            <div className="space-y-1.5">
              {[
                { path: "Asset > Fixed Asset > Property & Equipment", depth: 3 },
                { path: "Asset > Fixed Asset > Intangibles",          depth: 3 },
                { path: "Asset > Liquid Asset > Cash",                depth: 3 },
                { path: "Revenue > Service Revenue",                  depth: 2 },
                { path: "Expense > Compensation",                     depth: 2 },
              ].map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-600 font-mono text-[10px] w-4">{h.depth}</span>
                  <span className="text-slate-400 font-mono">{h.path}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800/80 border border-slate-600/40 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Metadata Attributes + Effective Dates</div>
            <div className="space-y-1.5">
              {[
                { attr: "Jurisdiction",     val: "Federal / State / Local" },
                { attr: "EntityType",       val: "C-Corp / Partnership / S-Corp" },
                { attr: "BasisType",        val: "Tax / Book / GAAP" },
                { attr: "AdjustmentType",   val: "Permanent / Temporary" },
                { attr: "EffectiveFrom",    val: "PeriodStart-aligned" },
                { attr: "EffectiveTo",      val: "PeriodEnd-aligned (null = active)" },
                { attr: "TaxonomyVersion",  val: "Semantic versioning (TDC-owned)" },
              ].map((a) => (
                <div key={a.attr} className="flex items-center gap-2 bg-slate-900/60 rounded px-2.5 py-1.5">
                  <span className="text-emerald-300 text-xs font-mono w-32 shrink-0">{a.attr}</span>
                  <span className="text-slate-400 text-xs">{a.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Callout color="emerald" items={[
        "This is the source of classification — a metadata-driven taxonomy model.",
        "Classification is derived from canonical accounts, firm mappings, and metadata conditions.",
        "All classification logic is defined here — not in PDC.",
        "Taxonomy controls hierarchy, versioning, and rule evaluation inputs.",
      ]} />
    </div>
  );
}

// ─── Step 4: Gap Identification ───────────────────────────────────────────────

function Step4Content() {
  return (
    <div className="space-y-5">
      <div className="bg-red-950/80 border-2 border-red-500/60 rounded-xl p-5 shadow-lg shadow-red-900/30">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-red-200 font-black text-base uppercase tracking-wide">Critical Gap — Orchestrator Output</div>
            <div className="text-red-300/80 text-sm">FirmTaxonomyId is not returned in the Orchestrator output contract</div>
          </div>
        </div>
        <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-4 mb-4">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">Orchestrator Output — Current State</div>
          <div className="space-y-1.5">
            {[
              { field: "documentId",            present: true,  note: "✓ Present" },
              { field: "runId",                 present: true,  note: "✓ Present" },
              { field: "entityId",              present: true,  note: "✓ Present" },
              { field: "periodStart",           present: true,  note: "✓ Present" },
              { field: "periodEnd",             present: true,  note: "✓ Present" },
              { field: "normalizedAmount",       present: true,  note: "✓ Present" },
              { field: "firmTaxonomyId",         present: false, note: "✕ NOT RETURNED — blocking gap" },
              { field: "classificationStatus",   present: false, note: "✕ NOT RETURNED — blocking gap" },
              { field: "classificationConfidence",present: false, note: "✕ NOT RETURNED — blocking gap" },
            ].map((f) => (
              <div key={f.field} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${!f.present ? "bg-red-900/60 border border-red-400/40" : "bg-slate-900/40"}`}>
                <span className={`font-mono text-xs w-48 shrink-0 ${!f.present ? "text-red-300 font-bold" : "text-slate-400"}`}>{f.field}</span>
                <span className={`text-xs font-semibold ${!f.present ? "text-red-300" : "text-emerald-400"}`}>{f.note}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Impact on PDC",      desc: "FirmTaxonomyId and ClassificationStatus remain null in NormalizedRecords — schema supports it but data is absent",               color: "border-amber-500/40 bg-amber-900/20 text-amber-300" },
            { label: "Impact on Retrieval",desc: "DataRecords API classificationStatus filter returns no results — the filter exists but the data does not",                      color: "border-red-500/40 bg-red-900/20 text-red-300" },
            { label: "Impact on Batch 4",  desc: "Tax mapping cannot proceed without classification — Batch 4 AI mapping is blocked until this gap is resolved",                  color: "border-red-500/40 bg-red-900/20 text-red-300" },
          ].map((i) => (
            <div key={i.label} className={`rounded-lg border px-4 py-3 ${i.color}`}>
              <div className="text-xs font-bold uppercase tracking-wide mb-1">{i.label}</div>
              <div className="text-slate-300 text-xs leading-relaxed">{i.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <Callout color="red" items={[
        "Gap: Orchestrator is not returning classification (FirmTaxonomyId).",
        "As a result, PDC receives normalized data without classification.",
        "Without classification: records are incomplete, cannot be used for tax mapping, and cannot be reliably consumed.",
        "Everything in the system is in place — the only missing piece is classification being returned from Orchestrator.",
      ]} />
    </div>
  );
}

// ─── Step 5: Expected State ───────────────────────────────────────────────────

function Step5Content() {
  return (
    <div className="space-y-5">
      {/* Expected flow visual */}
      <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-xl p-5">
        <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide mb-4">Expected Flow — All Records Include FirmTaxonomyId</div>
        <div className="space-y-3">
          {[
            { step: "1", label: "Ingestion",     desc: "Source file received; DocumentId assigned; PeriodStart/PeriodEnd set",                                  system: "PDC",          ok: true },
            { step: "2", label: "Orchestrator",  desc: "Normalizes financial data AND calls taxonomy service — returns FirmTaxonomyId + ClassificationStatus",  system: "AI Orchestrator", ok: true, wasGap: true },
            { step: "3", label: "Classification",desc: "Taxonomy service resolves canonical account → FirmTaxonomyId via metadata conditions",                  system: "TDC / Taxonomy", ok: true },
            { step: "4", label: "PDC Storage",   desc: "NormalizedRecord stored with FirmTaxonomyId and ClassificationStatus = CLASSIFIED",                     system: "PDC",          ok: true },
            { step: "5", label: "Retrieval",     desc: "DataRecords API returns complete records — classificationStatus filter works as designed",               system: "PDC API",      ok: true },
          ].map((s) => (
            <div key={s.step} className={`flex items-start gap-4 rounded-lg px-4 py-3 ${s.wasGap ? "bg-emerald-900/40 border border-emerald-400/40" : "bg-slate-900/40"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${s.wasGap ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"}`}>
                {s.step}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-sm font-bold ${s.wasGap ? "text-emerald-200" : "text-slate-200"}`}>{s.label}</span>
                  {s.wasGap && <span className="text-[10px] bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">Fixed</span>}
                  <span className="text-slate-500 text-xs ml-auto">{s.system}</span>
                </div>
                <div className="text-slate-400 text-xs leading-relaxed">{s.desc}</div>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0 mt-0.5">✓</span>
            </div>
          ))}
        </div>
      </div>

      <Callout color="emerald" items={[
        "Expected: Every record includes FirmTaxonomyId before being stored in PDC.",
        "Break occurs at Orchestrator — classification is not returned.",
      ]} />

      {/* Final Message */}
      <div className="bg-slate-800/80 border-2 border-amber-500/50 rounded-xl p-6 shadow-lg shadow-amber-900/20">
        <div className="flex items-start gap-4">
          <span className="text-3xl mt-1">⚖</span>
          <div>
            <div className="text-amber-200 font-black text-base mb-2 uppercase tracking-wide">Final Message</div>
            <div className="text-white text-base leading-relaxed font-medium">
              Without classification, we do not have usable financial data.
            </div>
            <div className="text-amber-100/80 text-sm leading-relaxed mt-1">
              This decision is required to complete Batch 2 and move forward.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Decision Checkpoints Panel ───────────────────────────────────────────────

function DecisionPanel({ decisions, onToggle }: { decisions: DecisionCheckpoint[]; onToggle: (id: number) => void }) {
  const answered = decisions.filter((d) => d.answered).length;
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
          <span className="text-xs text-slate-400">{answered}/{decisions.length} addressed</span>
          <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${(answered / decisions.length) * 100}%` }} />
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
            <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${d.answered ? "bg-emerald-500 border-emerald-400" : "border-slate-500"}`}>
              {d.answered && <span className="text-white text-[10px] font-black">✓</span>}
            </div>
            <span className={`text-sm leading-snug ${d.answered ? "text-emerald-200 line-through opacity-70" : "text-slate-200"}`}>
              {d.question}
            </span>
          </button>
        ))}
      </div>
      {answered === decisions.length && (
        <div className="mt-4 flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-lg px-4 py-3">
          <span className="text-emerald-400">✓</span>
          <span className="text-emerald-200 text-sm font-semibold">All decisions addressed — ready to update Orchestrator contract</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClassificationWalkthroughPage() {
  const [activeStep, setActiveStep] = useState<StepId>(1);
  const [decisions, setDecisions] = useState<DecisionCheckpoint[]>(INITIAL_DECISIONS);
  const [showDecisions, setShowDecisions] = useState(false);

  const toggleDecision = useCallback((id: number) => {
    setDecisions((prev) => prev.map((d) => (d.id === id ? { ...d, answered: !d.answered } : d)));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") setActiveStep((s) => (s < 5 ? ((s + 1) as StepId) : s));
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s));
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
              <span className="bg-amber-600/30 border border-amber-500/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Architecture Walkthrough</span>
              <span className="bg-red-600/30 border border-red-500/40 text-red-300 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Decision Required</span>
            </div>
            <h1 className="text-lg font-black text-white tracking-tight leading-tight">
              Taxonomy Classification Validation — PDC &amp; Orchestrator Alignment
            </h1>
            <div className="text-slate-400 text-xs mt-0.5">
              Validate where classification is applied, where it is stored, and identify the gap preventing complete financial records.
            </div>
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

        {/* Step Tabs */}
        <div className="grid grid-cols-5 gap-2">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative flex flex-col items-start px-3 py-3 rounded-xl border transition-all duration-200 text-left ${
                activeStep === step.id
                  ? step.id === 4
                    ? "bg-red-900/50 border-red-500/60 shadow-lg shadow-red-900/30"
                    : step.id === 5
                    ? "bg-violet-900/40 border-violet-500/50 shadow-md"
                    : "bg-slate-700/80 border-slate-400/40 shadow-md"
                  : "bg-slate-800/40 border-slate-700/40 hover:bg-slate-700/40 hover:border-slate-500/40"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-xs font-black w-5 h-5 rounded-full flex items-center justify-center ${
                  activeStep === step.id
                    ? step.id === 4 ? "bg-red-500 text-white" : step.id === 5 ? "bg-violet-500 text-white" : "bg-white text-slate-900"
                    : "bg-slate-700 text-slate-400"
                }`}>
                  {step.id}
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${step.stateColor}`}>
                  {step.stateLabel}
                </span>
              </div>
              <div className={`text-xs font-bold leading-tight ${activeStep === step.id ? "text-white" : "text-slate-400"}`}>{step.label}</div>
              <div className={`text-[10px] ${activeStep === step.id ? "text-slate-300" : "text-slate-600"}`}>{step.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className={`text-xs font-black w-7 h-7 rounded-full flex items-center justify-center ${
              activeStep === 4 ? "bg-red-500 text-white" : activeStep === 5 ? "bg-violet-500 text-white" : "bg-white text-slate-900"
            }`}>
              {activeStep}
            </div>
            <div>
              <div className="text-white font-black text-base">{currentStep.label}</div>
              <div className="text-slate-400 text-xs">{currentStep.subtitle}</div>
            </div>
            <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${currentStep.stateColor}`}>
              {currentStep.stateLabel}
            </span>
          </div>

          {activeStep === 1 && <Step1Content />}
          {activeStep === 2 && <Step2Content />}
          {activeStep === 3 && <Step3Content />}
          {activeStep === 4 && <Step4Content />}
          {activeStep === 5 && <Step5Content />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/40">
            <button
              onClick={() => setActiveStep((s) => (s > 1 ? ((s - 1) as StepId) : s))}
              disabled={activeStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600/40 text-slate-300 text-sm font-semibold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ← {activeStep > 1 ? `Step ${activeStep - 1}: ${STEPS[activeStep - 2].label}` : "Previous"}
            </button>
            {activeStep < 5 ? (
              <button
                onClick={() => setActiveStep((s) => ((s + 1) as StepId))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                  activeStep + 1 === 4
                    ? "bg-red-700/60 border-red-500/60 text-red-100 hover:bg-red-700/80"
                    : activeStep + 1 === 5
                    ? "bg-violet-700/60 border-violet-500/60 text-violet-100 hover:bg-violet-700/80"
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

        {/* Decision Checkpoints */}
        {showDecisions && <DecisionPanel decisions={decisions} onToggle={toggleDecision} />}

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
              <div className="text-slate-500 text-xs">Enforce classification in Orchestrator contract to unblock Batch 2 → Batch 4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
