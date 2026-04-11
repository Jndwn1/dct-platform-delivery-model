// ─── VISIO SWIMLANE PROCESS FLOW — EXACT MATCH TO REFERENCE SITE ─────────────
// Source: rsm-ai-team-niua6bzx.manus.space/#visio-arch
// Colors: gray=platform/entry, green=PDC, purple=AI Orchestrator, gray=Roger, yellow=TDC

// ── Shared sub-components ────────────────────────────────────────────────────

function TpBadge({ id }: { id: string }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs font-bold shrink-0">
      {id}
    </span>
  );
}

function FlowArrow({ label, dashed = false }: { label: string; dashed?: boolean }) {
  return (
    <div className="flex flex-col items-center py-2">
      <div className={`w-px h-5 ${dashed ? "border-l-2 border-dashed border-slate-400" : "bg-slate-400"}`} />
      <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 rotate-45 -mt-1.5" />
      {label && <div className="text-xs text-slate-500 mt-1 text-center">{label}</div>}
    </div>
  );
}

function SectionHeader({
  num, title, owner, color, tpId,
}: { num: number; title: string; owner: string; color: string; tpId?: string }) {
  return (
    <div className={`${color} px-5 py-3 flex items-center gap-3`}>
      <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold text-white shrink-0">
        {num}
      </div>
      <div className="flex-1">
        <div className="text-sm font-bold text-white uppercase tracking-wide">{title}</div>
        <div className="text-xs text-white/80 mt-0.5">Owner: {owner}</div>
      </div>
      {tpId && <TpBadge id={tpId} />}
    </div>
  );
}

function AnnotationBox({ text }: { text: string }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
      <span className="text-xs font-bold text-blue-800">Annotation: </span>
      <span className="text-xs text-blue-700">{text}</span>
    </div>
  );
}

function WarningBox({ text }: { text: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded px-3 py-2 flex items-start gap-2">
      <span className="text-red-500 shrink-0 text-sm">⚠</span>
      <span className="text-xs text-red-700">{text}</span>
    </div>
  );
}

function ContentBox({ title, owner, items, className = "" }: {
  title: string; owner?: string; items: string[]; className?: string;
}) {
  return (
    <div className={`bg-white border border-slate-200 rounded p-3 ${className}`}>
      {title && <div className="text-xs font-bold text-slate-800 mb-1">{title}</div>}
      {owner && <div className="text-xs text-blue-700 font-semibold mb-1">{owner}</div>}
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
            <span className="text-slate-400 shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── TOUCHPOINT LEGEND DATA ────────────────────────────────────────────────────

const TP_LEGEND_DATA = [
  { id: "T1", name: "File Ingestion via Tax Portal", step: "Step 1", batch: "Batch 1", system: "Tax Portal", desc: "Tax Portal generates DocumentId (GUID) + JobId (GUID), validates EntityId + PeriodStart + PeriodEnd, publishes NEW_FILE_EVENT to file_ingestion_events." },
  { id: "T2", name: "PDC Record Creation", step: "Step 2", batch: "Batch 1", system: "PDC", desc: "PDC persists IngestionJob (GUID ids, PeriodStart/PeriodEnd) + SourceFile. Status enum = INGESTED. Service Bus is transport only — no processing or enrichment." },
  { id: "T3", name: "AI Processing Trigger", step: "Step 3", batch: "Batch 2", system: "PDC → AI Orchestrator", desc: "PDC advances record state to PROCESSING and invokes the AI Orchestrator once per file." },
  { id: "T4", name: "AI Agent Pipeline Execution", step: "Step 4", batch: "Batch 2", system: "AI Orchestrator", desc: "Agent chain: File Recognizer → File Normalizer → Cross-LOB Mapper → Tax Mapper. Stateless agents persist via APIs." },
  { id: "T5", name: "Canonical Dataset Persistence", step: "Step 4", batch: "Batch 2", system: "PDC", desc: "PDC persists normalized FinancialFact records + Cross-LOB mappings. Assigns RunId (GUID) + SourceRecordId (GUID). Status enum = READY." },
  { id: "T6", name: "Tax Record Creation in TDC", step: "Step 4", batch: "Batch 3", system: "TDC", desc: "Tax mapping proposals stored in TDC. TDC assigns tdc_record_id and preserves full lineage." },
  { id: "T7", name: "Practitioner View in Roger", step: "Step 5", batch: "Batch 4", system: "Roger Web App", desc: "Roger retrieves tax records via GET /api/tdc/records. Read-only consumer of TDC." },
  { id: "T8", name: "Practitioner Decision", step: "Step 6", batch: "Batch 5", system: "Roger Web App", desc: "Practitioner approves, corrects, overrides, or reclassifies mappings. Decision captured against tdc_record_id." },
  { id: "T9", name: "Adjustment Propagation", step: "Step 7", batch: "Batch 5", system: "DCT (PDC + TDC APIs)", desc: "Corrections routed via API: Cross-LOB → PDC, Tax classification → TDC, Both → PDC then TDC." },
  { id: "T10", name: "TDC Finalization — TAX_READY", step: "Step 8", batch: "Batch 5", system: "TDC", desc: "TDC assigns final state: REVIEW_REQUIRED or TAX_READY. All tax decisions versioned as authoritative output." },
];

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

function VisioDiagramTab() {
  const [selectedTp, setSelectedTp] = useState<string | null>(null);

  return (
    <div className="space-y-0">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-xl px-5 py-4 mb-4">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          RSM CATT · DCT PLATFORM · ARCHITECTURE REVIEW DOCUMENT
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          DCT Platform Architecture — End-to-End Flow for Roger Platform
        </h2>
        <div className="text-xs text-slate-500 mt-1">
          Baseline v1.0 &nbsp;|&nbsp; Owner: DCT &nbsp;|&nbsp; Agentic Execution Model
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-1.5 text-xs bg-slate-900 text-white px-3 py-1.5 rounded font-semibold">
            <Play className="w-3 h-3" /> Executive Demo
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium">
            <Download className="w-3 h-3" /> Export SVG <span className="text-slate-400 ml-1">[Ctrl+Shift+E]</span>
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium">
            <Download className="w-3 h-3" /> Export PNG
          </button>
          <button className="inline-flex items-center gap-1.5 text-xs bg-white border border-slate-300 text-slate-600 px-3 py-1.5 rounded font-medium">
            <FileText className="w-3 h-3" /> Copy to Clipboard <span className="text-slate-400 ml-1">[Ctrl+Shift+C]</span>
          </button>
        </div>
        <div className="mt-3 space-y-0.5 text-center">
          {[
            "1. Tax Portal is the single ingestion gate.",
            "2. AI Orchestrator runs once.",
            "3. PDC owns cross-LOB truth.",
            "4. TDC owns tax truth.",
            "5. Roger reads and surfaces practitioner decisions.",
          ].map((g, i) => (
            <div key={i} className="text-xs text-slate-500">{g}</div>
          ))}
        </div>
      </div>

      {/* ── SECTION 1: Platform Entry & Ingestion ───────────────────────────── */}
      <div className="border border-slate-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={1} title="Platform Entry & Ingestion" owner="Platform" color="bg-slate-600" />
        <div className="bg-slate-50 px-5 py-3">
          <div className="text-xs text-slate-500 mb-3">
            All entry points converge into Tax Portal, which enforces the ingestion contract and publishes the event to the Service Bus
          </div>
          {/* Entry points */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {["Direct Upload", "Roger Web App", "Phoenix (future)", "Duo / DSDMS (transition)"].map(ep => (
              <span key={ep} className="text-xs border border-slate-300 bg-white rounded px-3 py-1.5 text-slate-700">{ep}</span>
            ))}
            <span className="text-xs text-slate-400">→ converge →</span>
            <span className="text-xs bg-blue-600 text-white rounded px-3 py-1.5 font-semibold">Tax Portal</span>
          </div>
          <div className="text-xs text-slate-400 mb-2">All entry points → Tax Portal</div>
        </div>

        {/* Tax Portal block */}
        <div className="bg-blue-600 px-5 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wide">TAX PORTAL</span>
            <span className="text-xs text-blue-200">Owner: Platform · Single ingestion gate</span>
            <TpBadge id="T1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ContentBox
              title="Ingestion Gate"
              owner="Owner: Platform"
              items={[
                "Generate DocumentId (GUID) — immutable",
                "Generate JobId (GUID)",
                "Validate ClientId (GUID) — REQUIRED",
                "Validate EntityId (GUID) — REQUIRED",
                "Validate PeriodStart + PeriodEnd — REQUIRED",
                "Enforce: PeriodEnd >= PeriodStart",
                "Document registration",
                "Publish NEW_FILE_EVENT",
              ]}
            />
            <ContentBox
              title="NEW_FILE_EVENT Contract"
              items={[
                "ClientId: GUID — REQUIRED",
                "EntityId: GUID — REQUIRED",
                "DocumentId: GUID (immutable)",
                "JobId: GUID",
                "PeriodStart: DateOnly — REQUIRED",
                "PeriodEnd: DateOnly — REQUIRED",
                "DocumentType: enum",
                "Timestamp: datetime",
                "SourceSystem: string",
                "RequestedBy: string",
                "Note: TaxYear NOT in payload",
              ]}
            />
            <AnnotationBox text="Tax Portal enforces ingestion contract across all entry points." />
          </div>
        </div>

        <FlowArrow label="NEW_FILE_EVENT → Service Bus" />

        {/* Service Bus block */}
        <div className="bg-slate-500 px-5 py-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wide">SERVICE BUS</span>
            <span className="text-xs text-slate-200">Owner: Platform · Event handoff only</span>
            <TpBadge id="T2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ContentBox
              title="Service Bus"
              owner="Owner: Platform"
              items={[
                "Topic: file_ingestion_events",
                "Consumer: PDC Ingestion Listener",
                "Payload: NEW_FILE_EVENT (no mutation)",
                "Delivery: at-least-once",
                "Replay supported",
              ]}
            />
            <AnnotationBox text="Service Bus is transport only — no processing or enrichment." />
            <WarningBox text="No other systems use the Service Bus. Tax Portal → PDC event handoff only." />
          </div>
        </div>

        <FlowArrow label="NEW_FILE_EVENT → PDC Listener" />
      </div>

      {/* ── SECTION 2: PDC Receives Event ───────────────────────────────────── */}
      <div className="border border-green-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={2} title="PDC Receives Event & Persists Initial Record" owner="DCT" color="bg-green-700" />
        <div className="bg-green-50 px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* PDC Ingestion Listener */}
            <div className="bg-white border border-green-200 rounded p-3 md:col-span-2">
              <div className="text-xs font-bold text-slate-800 mb-2">PDC INGESTION LISTENER</div>
              <div className="text-xs text-slate-600 mb-1">PDC listens on the Service Bus for new file events.</div>
              <div className="text-xs text-slate-600 mb-1">Upon receipt PDC immediately persists:</div>
              <ul className="space-y-0.5 mb-2">
                {["ClientId (GUID) — REQUIRED","EntityId (GUID) — REQUIRED","DocumentId (GUID)","JobId (GUID)","PeriodStart (DateOnly) — REQUIRED","PeriodEnd (DateOnly) — REQUIRED","file metadata"].map((item,i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                ))}
              </ul>
              <div className="text-xs text-slate-500 italic mb-2">TaxYear is NOT stored in PDC — it is derived in TDC from PeriodStart.</div>
              <div className="text-xs text-slate-600">PDC sets initial record state: <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">INGESTED</span></div>
              <div className="text-xs text-slate-500 italic mt-2">PDC owns all ingestion. Tax Portal is fully out of the picture. TaxYear NOT stored in PDC — derived in TDC from PeriodStart. No tax logic in PDC.</div>
            </div>
            {/* Right column */}
            <div className="space-y-2">
              <div className="bg-white border border-green-200 rounded p-3">
                <div className="text-xs font-bold text-slate-700 mb-1">Auditability from moment of arrival</div>
                <div className="text-xs text-slate-500">A record exists in PDC before AI is ever invoked.</div>
              </div>
              <div className="bg-white border border-green-200 rounded p-3">
                <div className="text-xs font-bold text-slate-700 mb-1">Retry safety</div>
                <div className="text-xs text-slate-500">If AI fails, PDC holds the backlog and can replay events.</div>
              </div>
              <div className="bg-white border border-green-200 rounded p-3">
                <div className="text-xs font-bold text-slate-700 mb-1">State machine begins</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs bg-green-600 text-white font-bold px-2 py-0.5 rounded">INGESTED</span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded">PROCESSING</span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="text-xs bg-green-600 text-white font-bold px-2 py-0.5 rounded">READY</span>
                </div>
              </div>
            </div>
          </div>

          {/* PDC schema section */}
          <div className="bg-white border border-green-200 rounded p-3">
            <div className="text-xs font-bold text-green-800 mb-2 uppercase tracking-wide">
              PDC — Phoenix Data Consolidation · Cross-LOB System of Record · Ingestion Persistence
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <ContentBox
                title="IngestionJob"
                owner="Owner: DCT"
                items={[
                  "JobId (GUID) — PRIMARY tracking key",
                  "ClientId (GUID) — REQUIRED",
                  "EntityId (GUID) — REQUIRED",
                  "PeriodStart (DateOnly) — REQUIRED",
                  "PeriodEnd (DateOnly) — REQUIRED",
                  "Status enum = INGESTED",
                  "CreatedTimestamp · RequestedBy · SourceSystem",
                  "Rule: TaxYear NOT stored — derived in TDC only",
                ]}
              />
              <ContentBox
                title="SourceFile"
                items={[
                  "SourceFileId (GUID) — record key",
                  "DocumentId (GUID) — immutable lineage anchor",
                  "JobId FK (GUID) — links to IngestionJob",
                  "FileName · FileType · UploadTimestamp",
                  "DocumentType (enum)",
                ]}
              />
              <div className="bg-white border border-slate-200 rounded p-3">
                <div className="text-xs font-bold text-slate-800 mb-2">STATE MACHINE</div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs bg-green-600 text-white font-bold px-2 py-1 rounded text-center">INGESTED</span>
                  <span className="text-slate-400 text-xs text-center">↓</span>
                  <span className="text-xs bg-blue-600 text-white font-bold px-2 py-1 rounded text-center">PROCESSING</span>
                  <span className="text-slate-400 text-xs text-center">↓</span>
                  <span className="text-xs bg-green-600 text-white font-bold px-2 py-1 rounded text-center">READY</span>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded p-3">
                <div className="text-xs font-bold text-slate-800 mb-2">API</div>
                <div className="text-xs font-mono text-blue-700 break-all mb-2">GET /api/pdc/ingestion/status?jobId={"{JobId}"}</div>
                <div className="text-xs text-slate-600 font-semibold mb-1">Returns:</div>
                <ul className="space-y-0.5">
                  {["JobId (GUID) — primary key","DocumentId (GUID) — immutable","SourceFileId (GUID)","ClientId (GUID)","EntityId (GUID)","PeriodStart (DateOnly)","PeriodEnd (DateOnly)","State (INGESTED | PROCESSING | READY)"].map((item,i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-1"><span className="shrink-0">•</span>{item}</li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-blue-700 italic">Annotation: Audit record exists before AI is invoked.</div>
              </div>
            </div>
          </div>
        </div>
        <FlowArrow label="PDC advances state to PROCESSING · prepares invocation payload" />
      </div>

      {/* ── SECTION 3: PDC → AI Orchestrator ────────────────────────────────── */}
      <div className="border border-green-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={3} title="PDC → AI Orchestrator (Single Invocation)" owner="DCT (trigger) · Roger Team (execution)" color="bg-green-700" tpId="T3" />
        <div className="bg-green-50 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-green-200 rounded p-3 md:col-span-1">
              <div className="text-xs font-bold text-slate-800 mb-2">ORCHESTRATOR INVOCATION</div>
              <div className="text-xs text-slate-600 mb-1">PDC advances the record state to:</div>
              <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded">PROCESSING</span>
              <div className="text-xs text-slate-600 mt-2 mb-1">PDC then invokes the AI Orchestrator.</div>
              <div className="text-xs font-semibold text-slate-700 mb-1">This is the only AI invocation for this file.</div>
              <div className="text-xs text-slate-500 mt-2 mb-1 font-semibold">Invocation payload:</div>
              <ul className="space-y-0.5">
                {["JobId (GUID)","PeriodStart (DateOnly) — REQUIRED","PeriodEnd (DateOnly) — REQUIRED","file metadata","TaxYear is NOT passed — PeriodStart/PeriodEnd are the temporal model."].map((item,i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                ))}
              </ul>
              <div className="text-xs text-slate-500 italic mt-2">The AI Orchestrator is stateless — it does not persist data. All persistence occurs through PDC or TDC APIs. TDC does NOT invoke the Orchestrator.</div>
            </div>
            <WarningBox text="PDC and TDC never communicate directly. All coordination flows through the Orchestrator." />
            <ContentBox
              title="Single integration point"
              items={[
                "PDC has one integration point — the Orchestrator.",
                "PDC never invokes individual agents directly.",
                "There is no Service Bus between PDC and TDC.",
              ]}
            />
          </div>
        </div>
        <FlowArrow label="Single invocation per file · ClientId (GUID) + EntityId (GUID) + DocumentId (GUID) + PeriodStart + PeriodEnd + file_metadata" />
      </div>

      {/* ── SECTION 4: AI Orchestrator ──────────────────────────────────────── */}
      <div className="border border-purple-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={4} title="AI Orchestrator" owner="Roger Team · Stateless compute layer" color="bg-purple-700" tpId="T4" />
        <div className="bg-purple-50 px-5 py-4 space-y-3">
          {/* Stage 1 + Stage 2 side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Stage 1 */}
            <div className="bg-purple-100 border border-purple-200 rounded p-3">
              <div className="text-xs font-bold text-purple-900 mb-2">STAGE 1 — File Recognition & Normalization (File Level)</div>
              <div className="text-xs text-purple-700 font-semibold mb-1 flex items-center gap-1">PDC API <ArrowRight className="w-3 h-3" /></div>
              <div className="mb-2">
                <div className="text-xs font-semibold text-slate-700 mb-1">Agent 1 — File Recognizer</div>
                <ul className="space-y-0.5">
                  {["Pattern-matches incoming file structure against canonical schemas","Pulls canonical schemas from PDC API (read-only)","Identifies document type (e.g., Trial Balance, K-1, W-2, 1099)"].map((item,i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2">
                <div className="text-xs font-semibold text-slate-700 mb-1">Agent 2 — File Normalizer</div>
                <ul className="space-y-0.5">
                  {["Extracts raw data and transforms it into the standard canonical format for the identified document type","Pulls canonical schemas from PDC API (read-only)"].map((item,i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-green-700 font-semibold">Output: Normalized canonical records</div>
            </div>
            {/* Stage 2 */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-xs font-bold text-green-900 mb-2">STAGE 2 — Cross-LOB Taxonomy (PDC) (Record Level)</div>
              <div className="text-xs text-green-700 font-semibold mb-1 flex items-center gap-1">TDC API <ArrowRight className="w-3 h-3" /></div>
              <div className="mb-2">
                <div className="text-xs font-semibold text-slate-700 mb-1">Agent 3 — Cross-LOB / Firm Taxonomy Mapper</div>
                <ul className="space-y-0.5">
                  {["Maps each normalized account record independently to the firm's financial taxonomy","Categories: asset, liability, equity, income, expense","Pulls firm and cross-LOB taxonomy tables from PDC API (read-only)"].map((item,i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-100 border border-green-300 rounded p-2 mb-2">
                <div className="text-xs font-bold text-green-800 mb-1">ORCHESTRATOR CALLS PDC API TO PERSIST:</div>
                <ul className="space-y-0.5">
                  {["Normalized canonical records","Cross-LOB taxonomy mappings at the record level","Records keyed by DocumentId (GUID), EntityId (GUID), PeriodStart, PeriodEnd"].map((item,i) => (
                    <li key={i} className="text-xs text-green-700 flex items-start gap-1.5"><span className="shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-green-100 border border-green-300 rounded p-2 mb-2">
                <div className="text-xs font-bold text-green-800 mb-1">PDC RESPONDS WITH:</div>
                <ul className="space-y-0.5">
                  {["RunId (GUID) / versioned","SourceRecordId (GUID) for each persisted record","READY state confirmation"].map((item,i) => (
                    <li key={i} className="text-xs text-green-700 flex items-start gap-1.5"><span className="shrink-0">•</span>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-green-700 font-semibold">Output: RunId (GUID) · SourceRecordId (GUID) · READY state</div>
                <TpBadge id="T5" />
              </div>
              <div className="text-xs text-slate-500 italic mt-1">PDC is the authoritative cross-LOB system of record. Stage 3 cannot begin until source_record_id is returned.</div>
            </div>
          </div>
          {/* Stage 3 */}
          <div className="bg-purple-100 border border-purple-200 rounded p-3">
            <div className="text-xs font-bold text-purple-900 mb-2">STAGE 3 — Tax Taxonomy (TDC) (Record Level)</div>
            <div className="mb-2">
              <div className="text-xs font-semibold text-slate-700 mb-1">Agent 4 — Tax Taxonomy Mapper</div>
              <ul className="space-y-0.5">
                {["Maps each cross-LOB mapped account record independently to the tax taxonomy","Pulls tax taxonomy tables and rules from TDC API (read-only)","Produces proposed tax line, confidence band (GREEN / YELLOW / RED), and evidence / reasoning"].map((item,i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-purple-700 font-semibold">Output: TdcRecordId (GUID) · ConfidenceBand (enum: GREEN|YELLOW|RED) · tax mapping proposals</div>
              <TpBadge id="T6" />
            </div>
          </div>
          <WarningBox text="Agents never persist data directly. All results are written through PDC or TDC APIs." />
        </div>
        <FlowArrow label="Roger Query API (read-only) · GET /api/tdc/records" />
      </div>

      {/* ── SECTION 5: Roger Web Application ────────────────────────────────── */}
      <div className="border border-slate-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={5} title="Roger Web Application" owner="Roger Team · UI layer only · Read-only consumer of TDC" color="bg-slate-600" tpId="T7" />
        <div className="bg-slate-50 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ContentBox
              title="Roger Web App"
              owner="Owner: Roger Team"
              items={["Tax mapping review","Confidence score display","Approve / Correct / Override","Lineage trace view"]}
            />
            <ContentBox
              title="API Calls"
              items={[
                "GET /api/tdc/records?entityId={guid}&periodStart={date}&periodEnd={date}",
                "GET /api/tdc/records/{tdcRecordId}/lineage",
                "Note: No TaxYear param — scoped by ClientId + EntityId + PeriodStart + PeriodEnd (REQUIRED)",
              ]}
            />
            <AnnotationBox text="Roger never: Runs AI · Mutates PDC · Mutates TDC · Bypasses APIs." />
          </div>
        </div>
        <FlowArrow label="Practitioner actions (dashed = user interaction)" dashed />
      </div>

      {/* ── SECTION 6: User Review & Adjustment ─────────────────────────────── */}
      <div className="border border-slate-300 rounded-xl overflow-hidden mb-3">
        <div className="bg-slate-500 px-5 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold text-white shrink-0">6</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">User Review & Adjustment (Human-in-the-loop)</div>
            <div className="text-xs text-white/80 mt-0.5">Owner: Practitioner (via Roger UI)</div>
          </div>
          <TpBadge id="T8" />
        </div>
        <div className="bg-slate-50 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContentBox
              title="Practitioner Actions"
              items={["Approve tax mappings","Correct mapping errors","Reclassify accounts (e.g. liability → asset)","Override tax line assignments"]}
            />
            <ContentBox
              title="Adjustment Routing (Append-Only)"
              items={[
                "Cross-LOB meaning change → PDC (new FinancialFact version, GUID)",
                "Tax classification change → TDC (new MappingDecision appended)",
                "Both → PDC first, then TDC",
                "Lifecycle: Draft → Submitted → Approved → Applied → Locked",
                "No overwrites — append-only. Locked records are immutable.",
              ]}
            />
          </div>
        </div>
        <FlowArrow label="Adjustment routed to PDC and/or TDC via API" />
      </div>

      {/* ── SECTION 7: Adjustment Propagation ───────────────────────────────── */}
      <div className="border border-green-300 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={7} title="Adjustment Propagation" owner="DCT · Corrections routed based on the nature of the change" color="bg-green-700" tpId="T9" />
        <div className="bg-green-50 px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ContentBox
              title="Correction Types"
              items={["Cross-LOB meaning changed","Tax meaning only","Both (cross-LOB and tax)"]}
            />
            <ContentBox
              title="Routing Target"
              items={[
                "Cross-LOB meaning changed → PDC: new FinancialFact version (GUID)",
                "Tax meaning only → TDC: new MappingDecision appended (GUID)",
                "Both → PDC first (FinancialFact), then TDC (MappingDecision)",
                "LineageEvent appended with EventType=CORRECTION on each change",
              ]}
            />
          </div>
          <div className="bg-green-100 border border-green-200 rounded px-3 py-2 text-xs text-green-800">
            All downstream systems stay consistent regardless of the correction path.
          </div>
        </div>
        <FlowArrow label="Final state assignment → TDC" />
      </div>

      {/* ── SECTION 8: TDC Finalization ─────────────────────────────────────── */}
      <div className="border border-yellow-400 rounded-xl overflow-hidden mb-3">
        <SectionHeader num={8} title="TDC Finalization" owner="DCT · Authoritative tax record finalization and versioning" color="bg-yellow-600" tpId="T10" />
        <div className="bg-yellow-50 px-5 py-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white border border-yellow-200 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-orange-100 border border-orange-300 text-orange-800 font-bold px-2 py-0.5 rounded">REVIEW_REQUIRED</span>
              </div>
              <div className="text-xs text-slate-600">After AI proposal — practitioner action required</div>
            </div>
            <div className="bg-white border border-yellow-200 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-green-100 border border-green-300 text-green-800 font-bold px-2 py-0.5 rounded">TAX_READY</span>
              </div>
              <div className="text-xs text-slate-600">After practitioner approval and sign-off</div>
            </div>
          </div>
          <ul className="space-y-0.5">
            {["TDC versions all decisions","All final tax outcomes are stored as authoritative records"].map((item,i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5"><span className="text-slate-400 shrink-0">•</span>{item}</li>
            ))}
          </ul>
          <div className="bg-yellow-500 rounded px-4 py-2 text-sm font-bold text-white text-center">
            Tax truth is finalized here.
          </div>
        </div>
        <FlowArrow label="PDC READY signal · TDC TAX_READY record" />
      </div>

      {/* ── Downstream Consumption ───────────────────────────────────────────── */}
      <div className="border border-cyan-300 rounded-xl overflow-hidden mb-3 bg-cyan-50">
        <div className="px-5 py-3 flex items-center gap-3 bg-cyan-100 border-b border-cyan-200">
          <span className="text-sm font-bold text-slate-800">Downstream Consumption</span>
          <span className="text-xs bg-cyan-600 text-white px-2 py-0.5 rounded font-semibold">PLATFORM EXTENSIBILITY</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="text-xs text-slate-600">
            Any domain can subscribe to PDC and TDC outputs — no changes are required to PDC or TDC as new domains come online.
          </div>
          <table className="w-full text-xs border border-slate-200 rounded overflow-hidden">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Signal</th>
                <th className="text-left px-3 py-2 font-semibold text-slate-700">Available To</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200">
                <td className="px-3 py-2"><span className="text-xs bg-green-100 border border-green-300 text-green-800 font-bold px-2 py-0.5 rounded">PDC READY</span></td>
                <td className="px-3 py-2 text-slate-600">Tax · Audit · Consulting · any future LOB</td>
              </tr>
              <tr className="border-t border-slate-200">
                <td className="px-3 py-2"><span className="text-xs bg-yellow-100 border border-yellow-300 text-yellow-800 font-bold px-2 py-0.5 rounded">TDC TAX_READY</span></td>
                <td className="px-3 py-2 text-slate-600">Tax preparation · filing · reporting systems</td>
              </tr>
            </tbody>
          </table>
          <div className="text-xs text-slate-500 italic">
            Roger reads from TDC only. IMS receives outbound outputs only — it does not read from the platform.
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold">API Contracts:</span> vNormalizedTb (PDC) · TDC Records API · vRollforward · vFinalTaxReady · vReturnSummary
          </div>
        </div>
      </div>

      {/* ── End-to-End Audit Traceability — Lineage Chain ───────────────────── */}
      <div className="border border-slate-200 rounded-xl bg-white px-5 py-4 mb-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          End-to-End Audit Traceability — Lineage Chain
        </div>
        <div className="flex flex-wrap items-start gap-1">
          {[
            { id: "DocumentId (GUID)", system: "Tax Portal", note: "Immutable · Lineage anchor" },
            { id: "JobId (GUID)", system: "Tax Portal", note: "Assigned at ingestion" },
            { id: "SourceRecordId (GUID)", system: "PDC", note: "GUID · Normalization" },
            { id: "RunId (GUID)", system: "PDC", note: "Batch traceability" },
            { id: "TdcRecordId (GUID)", system: "TDC", note: "GUID · Tax Record" },
            { id: "FilingId (GUID)", system: "TDC / Roger", note: "Immutable · Filed return" },
          ].map((item, i, arr) => (
            <span key={item.id} className="flex items-center gap-1">
              <div className="border border-blue-200 bg-blue-50 rounded px-3 py-2 text-center min-w-[100px]">
                <div className="text-xs font-bold text-blue-800">{item.id}</div>
                <div className="text-xs text-slate-500">{item.system}</div>
                <div className="text-xs text-slate-400 italic">{item.note}</div>
              </div>
              {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />}
            </span>
          ))}
        </div>
      </div>

      {/* ── Touchpoint Legend ────────────────────────────────────────────────── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-[#1e3a5f] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Touchpoint Legend</span>
            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-bold">T1 – T10</span>
          </div>
          <div className="text-xs text-blue-300">Hover any badge in the diagram to see details · Source: TOUCHPOINTS model</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                {["ID","Touchpoint Name","Step","Batch","System","Description"].map(h => (
                  <th key={h} className="text-left py-2 px-3 font-semibold text-slate-600 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TP_LEGEND_DATA.map((tp, i) => (
                <tr
                  key={tp.id}
                  onClick={() => setSelectedTp(selectedTp === tp.id ? null : tp.id)}
                  className={`border-b border-slate-100 cursor-pointer transition-colors ${
                    selectedTp === tp.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50"
                  } hover:bg-blue-50`}
                >
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1e3a5f] text-white text-xs font-bold">{tp.id}</span>
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-800">{tp.name}</td>
                  <td className="py-2 px-3 text-slate-500">{tp.step}</td>
                  <td className="py-2 px-3 text-slate-500">{tp.batch}</td>
                  <td className="py-2 px-3 text-slate-500">{tp.system}</td>
                  <td className="py-2 px-3 text-slate-500 max-w-xs">
                    {selectedTp === tp.id ? tp.desc : tp.desc.slice(0, 70) + "..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
