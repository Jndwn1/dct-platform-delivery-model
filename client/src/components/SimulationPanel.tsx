// SimulationPanel — DCT End-to-End Simulation Overlay
// RSM | CATT · DCT Platform · Visualization layer only — no data persisted
// Architecture diagram is read-only source of truth. This panel is a separate layer.
// RSM Branding: Deep Blue (#003A8F) for structure, Green (#059669) for success states
// Keyboard: Space = Play/Pause, → = Next step, Esc = Close

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, Play, Pause, ChevronRight, ChevronLeft,
  CheckCircle2, AlertCircle, Clock, Zap, Database,
  Brain, Shield, Users, FileText, ArrowRight, RotateCcw,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type StepStatus = "pending" | "running" | "success" | "error";
type SimMode = "guided" | "interactive";

interface SimOutput {
  label: string;
  value: string;
  highlight?: boolean;   // violet = Batch 2A field
  success?: boolean;     // green = success indicator
  error?: boolean;       // red = error/gap
}

interface SimStep {
  id: number;
  title: string;
  system: string;
  systemColor: string;
  batch: string;
  batchColor: string;
  icon: React.ElementType;
  description: string;
  inputs: string[];
  outputs: SimOutput[];
  keyObject?: { label: string; fields: { key: string; value: string; highlight?: boolean }[] };
  successMessage: string;
  durationMs: number;   // auto-play duration for Guided Demo mode
  component: string;    // which architecture component to highlight
}

// ─── SIMULATION STEPS DATA ────────────────────────────────────────────────────

const SIM_STEPS: SimStep[] = [
  {
    id: 1,
    title: "Upload File",
    system: "Tax Portal",
    systemColor: "#7c3aed",
    batch: "Foundation Core",
    batchColor: "#6d28d9",
    icon: Upload,
    component: "Tax Portal",
    description: "Practitioner uploads a financial file (CSV or Excel) through the Tax Portal. The portal validates the file structure, assigns a DocumentId, and publishes a NEW_FILE_EVENT to the Service Bus.",
    inputs: ["Financial file (CSV / Excel)", "EntityId (firm identifier)", "PeriodStart + PeriodEnd (temporal model)"],
    outputs: [
      { label: "DocumentId", value: "doc-a1b2c3d4-e5f6-7890-abcd-ef1234567890", highlight: false, success: true },
      { label: "JobId", value: "job-f9e8d7c6-b5a4-3210-fedc-ba9876543210", success: true },
      { label: "Event Published", value: "NEW_FILE_EVENT → Service Bus", success: true },
      { label: "File Status", value: "INGESTED", success: true },
    ],
    keyObject: {
      label: "IngestionEvent",
      fields: [
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "entityId", value: "FIRM-001-RSM" },
        { key: "periodStart", value: "2025-01-01" },
        { key: "periodEnd", value: "2025-12-31" },
        { key: "fileType", value: "CSV" },
        { key: "eventType", value: "NEW_FILE_EVENT" },
      ],
    },
    successMessage: "File accepted by Tax Portal. DocumentId assigned. NEW_FILE_EVENT published to Service Bus.",
    durationMs: 7000,
  },
  {
    id: 2,
    title: "Tax Portal Ingestion",
    system: "Tax Portal → Service Bus",
    systemColor: "#7c3aed",
    batch: "Batch 1",
    batchColor: "#6d28d9",
    icon: FileText,
    component: "Service Bus",
    description: "The Service Bus routes the NEW_FILE_EVENT to PDC. PDC subscribes to this topic and begins the ingestion lifecycle. The event carries the DocumentId, EntityId, and temporal model fields.",
    inputs: ["NEW_FILE_EVENT from Service Bus", "DocumentId", "EntityId", "PeriodStart + PeriodEnd"],
    outputs: [
      { label: "PDC Subscription", value: "NEW_FILE_EVENT received", success: true },
      { label: "IngestionJob Created", value: "Status: INGESTED", success: true },
      { label: "SourceFile Record", value: "Persisted to PDC", success: true },
    ],
    keyObject: {
      label: "IngestionJob (PDC)",
      fields: [
        { key: "jobId", value: "job-f9e8d7c6..." },
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "status", value: "INGESTED" },
        { key: "entityId", value: "FIRM-001-RSM" },
        { key: "createdAt", value: "2026-04-27T14:00:00Z" },
      ],
    },
    successMessage: "PDC received NEW_FILE_EVENT. IngestionJob created with status INGESTED.",
    durationMs: 6000,
  },
  {
    id: 3,
    title: "PDC Raw Storage",
    system: "PDC",
    systemColor: "#059669",
    batch: "Batch 1",
    batchColor: "#059669",
    icon: Database,
    component: "PDC",
    description: "PDC stores the raw source file and creates the SourceFile record. The IngestionJob status advances to PROCESSING and the AI Orchestrator is invoked exactly once with the DocumentId and file metadata.",
    inputs: ["IngestionJob (INGESTED status)", "DocumentId + file metadata", "Raw file bytes"],
    outputs: [
      { label: "SourceFile Record", value: "Persisted — immutable", success: true },
      { label: "IngestionJob Status", value: "INGESTED → PROCESSING", success: true },
      { label: "Orchestrator Invoked", value: "DocumentId + metadata sent", success: true },
      { label: "RunId", value: "run-11223344-5566-7788-99aa-bbccddeeff00", success: true },
    ],
    keyObject: {
      label: "SourceFile (PDC)",
      fields: [
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "runId", value: "run-11223344..." },
        { key: "fileHash", value: "sha256:3a7f..." },
        { key: "rowCount", value: "1,247" },
        { key: "status", value: "PROCESSING" },
      ],
    },
    successMessage: "Raw file stored. IngestionJob → PROCESSING. Orchestrator invoked with DocumentId.",
    durationMs: 6000,
  },
  {
    id: 4,
    title: "PDC Normalization",
    system: "AI Orchestrator → PDC",
    systemColor: "#2563eb",
    batch: "Batch 2",
    batchColor: "#2563eb",
    icon: Brain,
    component: "Orchestrator",
    description: "The AI Orchestrator runs Agent 1 (File Recognizer) and Agent 2 (File Normalizer). Raw rows are parsed, headers mapped to the canonical PDC schema, and normalized FinancialFact records are prepared for persistence.",
    inputs: ["Raw file content", "DocumentId", "PDC canonical schema definition"],
    outputs: [
      { label: "Agent 1 — File Recognizer", value: "File type: CSV · Schema: TrialBalance_v2", success: true },
      { label: "Agent 2 — File Normalizer", value: "1,247 rows normalized", success: true },
      { label: "FinancialFact Records", value: "1,247 prepared (not yet persisted)", success: true },
      { label: "Schema Validation", value: "PASSED — all required fields present", success: true },
    ],
    keyObject: {
      label: "NormalizedRecord (sample)",
      fields: [
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "accountCode", value: "1100-CASH" },
        { key: "amount", value: "125,400.00" },
        { key: "currency", value: "USD" },
        { key: "periodStart", value: "2025-01-01" },
        { key: "firmTaxonomyId", value: "⚠ PENDING — Batch 2A", highlight: true },
      ],
    },
    successMessage: "1,247 records normalized. FirmTaxonomyId pending — Batch 2A classification required before persistence.",
    durationMs: 8000,
  },
  {
    id: 5,
    title: "Orchestrator Classification",
    system: "AI Orchestrator → Taxonomy Service",
    systemColor: "#2563eb",
    batch: "Batch 2A",
    batchColor: "#7c3aed",
    icon: Brain,
    component: "Orchestrator",
    description: "Agent 3 (Cross-LOB Mapper) calls the Taxonomy Service API to resolve FirmTaxonomyId for each normalized record. This is the Batch 2A enforcement step. All 1,247 records must receive a valid FirmTaxonomyId before PDC will accept them.",
    inputs: ["1,247 normalized FinancialFact records", "Taxonomy Service API (read-only)", "AccountCode per record"],
    outputs: [
      { label: "Taxonomy Service Called", value: "1,247 lookups completed", success: true },
      { label: "FirmTaxonomyId Resolved", value: "1,241 / 1,247 records CLASSIFIED", success: true },
      { label: "UNCLASSIFIED Records", value: "6 records — manual review required", error: true },
      { label: "ClassificationStatus", value: "CLASSIFIED (1,241) · UNCLASSIFIED (6)", highlight: true },
    ],
    keyObject: {
      label: "ClassificationResult",
      fields: [
        { key: "firmTaxonomyId", value: "tax-00112233-4455-6677-8899-aabbccddeeff", highlight: true },
        { key: "classificationStatus", value: "CLASSIFIED", highlight: true },
        { key: "taxonomyLabel", value: "Cash & Cash Equivalents" },
        { key: "confidence", value: "0.97" },
        { key: "resolvedAt", value: "2026-04-27T14:02:15Z" },
      ],
    },
    successMessage: "1,241 records classified. 6 records UNCLASSIFIED — PDC READY signal will be blocked until resolved.",
    durationMs: 9000,
  },
  {
    id: 6,
    title: "Contract Validation (Batch 2A)",
    system: "PDC — Enforcement Gate",
    systemColor: "#059669",
    batch: "Batch 2A",
    batchColor: "#7c3aed",
    icon: Shield,
    component: "PDC",
    description: "PDC enforces the Batch 2A contract: every FinancialFact record MUST carry a valid FirmTaxonomyId. Records with ClassificationStatus = UNCLASSIFIED are rejected. The 6 unclassified records trigger a validation warning — the READY signal is blocked until all records are classified.",
    inputs: ["1,247 normalized records with ClassificationStatus", "PDC enforcement rule: FirmTaxonomyId REQUIRED", "Batch 2A gate criteria"],
    outputs: [
      { label: "Records Accepted", value: "1,241 — FirmTaxonomyId valid", success: true },
      { label: "Records Rejected", value: "6 — ClassificationStatus = UNCLASSIFIED", error: true },
      { label: "READY Signal", value: "BLOCKED — 6 unclassified records pending", error: true },
      { label: "Validation Rule", value: "ADR-06: FirmTaxonomyId REQUIRED on all FinancialFact records", highlight: true },
    ],
    keyObject: {
      label: "ValidationResult (PDC Gate)",
      fields: [
        { key: "totalRecords", value: "1,247" },
        { key: "accepted", value: "1,241" },
        { key: "rejected", value: "6" },
        { key: "readySignal", value: "BLOCKED", highlight: true },
        { key: "blockingRule", value: "ADR-06 · Batch 2A" },
        { key: "resolveAction", value: "Manual classification required" },
      ],
    },
    successMessage: "Contract validation complete. 1,241 accepted. 6 rejected — READY signal blocked. Manual classification required for 6 records.",
    durationMs: 8000,
  },
  {
    id: 7,
    title: "PDC Classification Persistence",
    system: "PDC",
    systemColor: "#059669",
    batch: "Batch 2A",
    batchColor: "#7c3aed",
    icon: Database,
    component: "PDC",
    description: "After manual classification resolves the 6 unclassified records, all 1,247 FinancialFact records are persisted to PDC with FirmTaxonomyId and ClassificationStatus. PDC assigns SourceRecordId to each record and advances the IngestionJob to READY.",
    inputs: ["1,247 classified FinancialFact records", "FirmTaxonomyId per record (all CLASSIFIED)", "RunId"],
    outputs: [
      { label: "FinancialFact Records Persisted", value: "1,247 — all CLASSIFIED", success: true },
      { label: "SourceRecordId Assigned", value: "1,247 unique GUIDs", success: true },
      { label: "FirmTaxonomyId Stored", value: "On every FinancialFact record", success: true, highlight: true },
      { label: "IngestionJob Status", value: "PROCESSING → READY", success: true },
      { label: "READY Signal Issued", value: "PDC → TDC via Service Bus", success: true },
    ],
    keyObject: {
      label: "FinancialFact (PDC — persisted)",
      fields: [
        { key: "sourceRecordId", value: "src-aabbccdd-eeff-0011-2233-445566778899" },
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "runId", value: "run-11223344..." },
        { key: "firmTaxonomyId", value: "tax-00112233...", highlight: true },
        { key: "classificationStatus", value: "CLASSIFIED", highlight: true },
        { key: "amount", value: "125,400.00" },
      ],
    },
    successMessage: "All 1,247 records persisted. SourceRecordId assigned. READY signal issued to TDC.",
    durationMs: 7000,
  },
  {
    id: 8,
    title: "TDC Tax Authority",
    system: "TDC",
    systemColor: "#dc2626",
    batch: "Batch 3",
    batchColor: "#dc2626",
    icon: Shield,
    component: "TDC",
    description: "TDC receives the READY signal from PDC via Service Bus. The Orchestrator calls Agent 4 (Tax Mapper) which reads the classified FinancialFact records and generates tax mapping proposals. TDC assigns TdcRecordId and derives TaxYear from PeriodStart + PeriodEnd.",
    inputs: ["READY_EVENT from Service Bus", "1,247 classified FinancialFact records (via PDC API)", "Tax mapping rules"],
    outputs: [
      { label: "TDC Subscription", value: "READY_EVENT received", success: true },
      { label: "Agent 4 — Tax Mapper", value: "1,247 tax mapping proposals generated", success: true },
      { label: "TaxYear Derived", value: "2025 (from PeriodStart + PeriodEnd)", success: true },
      { label: "TdcRecordId Assigned", value: "1,247 unique GUIDs", success: true },
    ],
    keyObject: {
      label: "TaxMappingProposal (TDC)",
      fields: [
        { key: "tdcRecordId", value: "tdc-99887766-5544-3322-1100-ffeeddccbbaa" },
        { key: "sourceRecordId", value: "src-aabbccdd..." },
        { key: "documentId", value: "doc-a1b2c3d4..." },
        { key: "taxYear", value: "2025" },
        { key: "taxCategory", value: "Operating Income" },
        { key: "confidenceBand", value: "GREEN" },
      ],
    },
    successMessage: "TDC received READY signal. 1,247 tax mapping proposals created. TaxYear 2025 derived. TdcRecordId assigned.",
    durationMs: 8000,
  },
  {
    id: 9,
    title: "TDC Mapping Decisions",
    system: "TDC — Confidence Bands",
    systemColor: "#dc2626",
    batch: "Batch 4",
    batchColor: "#dc2626",
    icon: Shield,
    component: "TDC",
    description: "TDC assigns confidence bands (GREEN / YELLOW / RED) to each tax mapping proposal. GREEN = auto-approved. YELLOW = practitioner review required. RED = manual override required. Proposals are now visible in Roger for practitioner review.",
    inputs: ["1,247 tax mapping proposals", "Confidence scoring model", "Historical mapping patterns"],
    outputs: [
      { label: "GREEN Band", value: "1,089 records — auto-approved", success: true },
      { label: "YELLOW Band", value: "143 records — practitioner review required", highlight: true },
      { label: "RED Band", value: "15 records — manual override required", error: true },
      { label: "Proposals Visible in Roger", value: "1,247 records surfaced", success: true },
    ],
    keyObject: {
      label: "ConfidenceBandSummary",
      fields: [
        { key: "total", value: "1,247" },
        { key: "GREEN", value: "1,089 (87.3%)" },
        { key: "YELLOW", value: "143 (11.5%)" },
        { key: "RED", value: "15 (1.2%)" },
        { key: "pendingReview", value: "158 records" },
        { key: "autoApproved", value: "1,089 records" },
      ],
    },
    successMessage: "Confidence bands assigned. 1,089 auto-approved (GREEN). 158 require practitioner review (YELLOW/RED).",
    durationMs: 7000,
  },
  {
    id: 10,
    title: "Roger UI Output",
    system: "Roger",
    systemColor: "#f97316",
    batch: "Batch 4",
    batchColor: "#f97316",
    icon: Users,
    component: "Roger",
    description: "Roger surfaces all 1,247 tax mapping proposals to the practitioner. The practitioner can approve, correct, or override proposals. Once all proposals are decided and approved, TDC finalizes the records as TAX_READY — immutable and terminal.",
    inputs: ["1,247 tax mapping proposals (via TDC API Gateway)", "Confidence bands", "Full lineage chain (DocumentId → SourceRecordId → TdcRecordId)"],
    outputs: [
      { label: "Proposals Displayed", value: "1,247 records in Roger UI", success: true },
      { label: "Practitioner Actions", value: "Approve / Correct / Override available", success: true },
      { label: "Lineage Trace", value: "DocumentId → SourceRecordId → TdcRecordId visible", success: true },
      { label: "TAX_READY Finalization", value: "Pending practitioner sign-off", highlight: true },
    ],
    keyObject: {
      label: "RogerOutputSummary",
      fields: [
        { key: "totalProposals", value: "1,247" },
        { key: "pendingReview", value: "158" },
        { key: "autoApproved", value: "1,089" },
        { key: "rogerAccess", value: "Read-only via TDC API Gateway" },
        { key: "taxReadyStatus", value: "PENDING practitioner sign-off" },
        { key: "lineageComplete", value: "true" },
      ],
    },
    successMessage: "Roger UI loaded. 1,247 proposals visible. Practitioner review pending for 158 records. Simulation complete.",
    durationMs: 7000,
  },
];

// ─── ARCHITECTURE FLOW NODES ──────────────────────────────────────────────────

const ARCH_NODES = [
  { id: "Tax Portal", label: "Tax Portal", color: "#7c3aed", steps: [1, 2] },
  { id: "Service Bus", label: "Service Bus", color: "#64748b", steps: [2] },
  { id: "PDC", label: "PDC", color: "#059669", steps: [3, 4, 6, 7] },
  { id: "Orchestrator", label: "Orchestrator", color: "#2563eb", steps: [4, 5] },
  { id: "TDC", label: "TDC", color: "#dc2626", steps: [8, 9] },
  { id: "Roger", label: "Roger", color: "#f97316", steps: [10] },
];

// ─── HELPER: generate a fake file name ────────────────────────────────────────

function fakeDocId() {
  return "doc-" + Math.random().toString(36).slice(2, 10) + "-" + Math.random().toString(36).slice(2, 6);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

interface SimulationPanelProps {
  onClose: () => void;
}

export default function SimulationPanel({ onClose }: SimulationPanelProps) {
  const [mode, setMode] = useState<SimMode>("interactive");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = not started, 1–10 = step index
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(Array(10).fill("pending"));
  const [isPlaying, setIsPlaying] = useState(false);
  const [docId] = useState(fakeDocId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalSteps = SIM_STEPS.length;
  const activeStep = currentStep > 0 ? SIM_STEPS[currentStep - 1] : null;

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (!started) return;
      if (e.key === " ") { e.preventDefault(); setIsPlaying(p => !p); }
      if (e.key === "ArrowRight") advanceStep();
      if (e.key === "ArrowLeft") retreatStep();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── Auto-play timer for Guided Demo mode ──────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isPlaying || !started) return;
    if (currentStep >= totalSteps) { setIsPlaying(false); return; }
    const step = SIM_STEPS[currentStep]; // next step (0-indexed = currentStep)
    const duration = step ? step.durationMs : 7000;
    timerRef.current = setTimeout(() => {
      advanceStep();
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isPlaying, currentStep, started]);

  const markRunning = (idx: number) => {
    setStepStatuses(prev => {
      const next = [...prev];
      next[idx] = "running";
      return next;
    });
  };

  const markSuccess = (idx: number) => {
    setStepStatuses(prev => {
      const next = [...prev];
      next[idx] = "success";
      return next;
    });
  };

  const advanceStep = useCallback(() => {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next > totalSteps) return prev;
      // Mark previous as success
      if (prev > 0) markSuccess(prev - 1);
      // Mark new as running
      markRunning(next - 1);
      return next;
    });
  }, [totalSteps]);

  const retreatStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev <= 1) return prev;
      const back = prev - 1;
      setStepStatuses(s => {
        const next = [...s];
        next[prev - 1] = "pending";
        next[back - 1] = "running";
        return next;
      });
      return back;
    });
  }, []);

  const startSimulation = () => {
    setStarted(true);
    setCurrentStep(1);
    const statuses: StepStatus[] = Array(10).fill("pending");
    statuses[0] = "running";
    setStepStatuses(statuses);
    if (mode === "guided") setIsPlaying(true);
  };

  const resetSimulation = () => {
    setStarted(false);
    setCurrentStep(0);
    setStepStatuses(Array(10).fill("pending"));
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const completedCount = stepStatuses.filter(s => s === "success").length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10" style={{ backgroundColor: "#0F2A5C" }}>
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-0.5">RSM CATT · DCT Platform</div>
            <h2 className="text-lg font-bold text-white">End-to-End Simulation</h2>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-xs text-blue-300 bg-white/10 px-2 py-1 rounded border border-white/20">
              Visualization layer only — architecture is read-only
            </span>
            {started && (
              <span className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded border border-white/20">
                Step {currentStep} / {totalSteps}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode toggle */}
          <div className="flex bg-white/10 rounded-lg p-1 gap-1">
            {(["interactive", "guided"] as SimMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); if (started && m === "guided") setIsPlaying(true); if (m === "interactive") setIsPlaying(false); }}
                className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                style={{
                  backgroundColor: mode === m ? "white" : "transparent",
                  color: mode === m ? "#0F2A5C" : "#94a3b8",
                }}
              >
                {m === "interactive" ? "Interactive" : "Guided Demo"}
              </button>
            ))}
          </div>
          {/* Keyboard hint */}
          <div className="text-xs text-blue-300 hidden md:block">
            Space = Play/Pause · → = Next · Esc = Close
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Progress bar ── */}
      {started && (
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full"
            style={{ backgroundColor: "#059669" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Architecture flow + step list */}
        <div className="w-72 shrink-0 border-r border-white/10 flex flex-col" style={{ backgroundColor: "#0a1628" }}>
          {/* Architecture node highlights */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Architecture Components</div>
            <div className="flex flex-col gap-2">
              {ARCH_NODES.map((node, i) => {
                const isActive = activeStep?.component === node.id;
                const isDone = node.steps.every(s => stepStatuses[s - 1] === "success");
                return (
                  <div key={node.id} className="flex items-center gap-3">
                    {i > 0 && (
                      <div className="absolute" style={{ display: "none" }} />
                    )}
                    <motion.div
                      animate={{
                        scale: isActive ? 1.05 : 1,
                        opacity: isActive ? 1 : isDone ? 0.7 : started ? 0.4 : 0.6,
                      }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg border transition-all"
                      style={{
                        backgroundColor: isActive ? node.color + "25" : isDone ? node.color + "12" : "transparent",
                        borderColor: isActive ? node.color : isDone ? node.color + "60" : "rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: isActive ? node.color : isDone ? node.color : "#334155" }} />
                      <span className="text-xs font-semibold" style={{ color: isActive ? "white" : isDone ? "#94a3b8" : "#475569" }}>
                        {node.label}
                      </span>
                      {isActive && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="ml-auto w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: node.color }}
                        />
                      )}
                      {isDone && !isActive && (
                        <CheckCircle2 className="w-3 h-3 ml-auto" style={{ color: "#059669" }} />
                      )}
                    </motion.div>
                    {i < ARCH_NODES.length - 1 && (
                      <div className="flex justify-center" style={{ width: "100%", paddingLeft: "18px", marginTop: "-4px", marginBottom: "-4px" }}>
                        <ArrowRight className="w-3 h-3 text-slate-600 rotate-90" style={{ display: "block" }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step list */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2 px-1">Steps</div>
            {SIM_STEPS.map((step, i) => {
              const status = stepStatuses[i];
              const isActive = currentStep === i + 1;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (!started) return;
                    if (mode === "interactive") {
                      const prev = currentStep;
                      setCurrentStep(i + 1);
                      setStepStatuses(s => {
                        const next = [...s];
                        if (prev > 0 && prev <= totalSteps) next[prev - 1] = prev <= i + 1 ? "success" : "pending";
                        next[i] = "running";
                        return next;
                      });
                    }
                  }}
                  className="w-full text-left flex items-center gap-2.5 px-2 py-2 rounded-lg mb-1 transition-all"
                  style={{
                    backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    cursor: started && mode === "interactive" ? "pointer" : "default",
                  }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      backgroundColor:
                        status === "success" ? "#059669" :
                        status === "running" ? step.systemColor :
                        status === "error" ? "#dc2626" :
                        "#1e293b",
                      color: status === "pending" ? "#475569" : "white",
                    }}
                  >
                    {status === "success" ? "✓" : status === "error" ? "!" : step.id}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate" style={{ color: isActive ? "white" : status === "success" ? "#64748b" : "#475569" }}>
                      {step.title}
                    </div>
                    <div className="text-xs" style={{ color: "#334155" }}>{step.batch}</div>
                  </div>
                  {isActive && (
                    <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: step.systemColor }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Not started: upload + start ── */}
          {!started && (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">DCT End-to-End Simulation</h3>
                <p className="text-sm text-slate-400 max-w-lg">
                  Upload a financial file to simulate the full DCT platform pipeline — from Tax Portal ingestion through TDC finalization and Roger output.
                  All steps are visualization only. No data is persisted or modified.
                </p>
              </div>

              {/* File upload */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-md border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragOver ? "#059669" : uploadedFile ? "#059669" : "rgba(255,255,255,0.15)",
                  backgroundColor: dragOver ? "rgba(5,150,105,0.08)" : uploadedFile ? "rgba(5,150,105,0.05)" : "rgba(255,255,255,0.03)",
                }}
              >
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileSelect} />
                {uploadedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10" style={{ color: "#059669" }} />
                    <div className="text-sm font-semibold text-white">{uploadedFile.name}</div>
                    <div className="text-xs text-slate-400">{(uploadedFile.size / 1024).toFixed(1)} KB · Ready to simulate</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{docId}</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="w-10 h-10 text-slate-500" />
                    <div className="text-sm font-semibold text-white">Drop a file or click to browse</div>
                    <div className="text-xs text-slate-500">CSV or Excel (.csv, .xlsx, .xls)</div>
                    <div className="text-xs text-slate-600 mt-1">Or continue without a file to use sample data</div>
                  </div>
                )}
              </div>

              {/* Mode selector */}
              <div className="flex gap-4">
                {(["interactive", "guided"] as SimMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className="px-5 py-3 rounded-xl border text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: mode === m ? "#003A8F" : "rgba(255,255,255,0.04)",
                      borderColor: mode === m ? "#2563eb" : "rgba(255,255,255,0.1)",
                      color: mode === m ? "white" : "#64748b",
                    }}
                  >
                    {m === "interactive" ? "⬡ Interactive Mode" : "▶ Guided Demo Mode"}
                    <div className="text-xs font-normal mt-0.5" style={{ color: mode === m ? "#93c5fd" : "#475569" }}>
                      {m === "interactive" ? "Click through each step" : "Auto-play 5–10s per step"}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startSimulation}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center gap-2"
                style={{ backgroundColor: "#059669" }}
              >
                <Zap className="w-4 h-4" />
                Run Simulation
              </button>
            </div>
          )}

          {/* ── Active simulation ── */}
          {started && (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Controls bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10" style={{ backgroundColor: "#0d1f3c" }}>
                <button
                  onClick={() => setIsPlaying(p => !p)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor: isPlaying ? "rgba(220,38,38,0.2)" : "rgba(5,150,105,0.2)", color: isPlaying ? "#fca5a5" : "#6ee7b7" }}
                >
                  {isPlaying ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Play</>}
                </button>
                <button
                  onClick={retreatStep}
                  disabled={currentStep <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />Back
                </button>
                <button
                  onClick={advanceStep}
                  disabled={currentStep >= totalSteps}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-30 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
                >
                  Next<ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1" />
                {uploadedFile && (
                  <span className="text-xs text-slate-500 font-mono">{uploadedFile.name}</span>
                )}
                <span className="text-xs text-slate-500">{completedCount}/{totalSteps} steps complete</span>
                <button
                  onClick={resetSimulation}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#64748b" }}
                >
                  <RotateCcw className="w-3 h-3" />Reset
                </button>
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto p-5">
                <AnimatePresence mode="wait">
                  {activeStep && (
                    <motion.div
                      key={activeStep.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* Step header */}
                      <div className="rounded-xl px-5 py-4" style={{ backgroundColor: activeStep.systemColor + "18", border: `1px solid ${activeStep.systemColor}40` }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: activeStep.systemColor + "30" }}>
                              <activeStep.icon className="w-5 h-5" style={{ color: activeStep.systemColor }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold" style={{ color: activeStep.systemColor }}>STEP {activeStep.id} OF {totalSteps}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full font-bold border" style={{ backgroundColor: activeStep.batchColor + "20", color: activeStep.batchColor, borderColor: activeStep.batchColor + "40" }}>{activeStep.batch}</span>
                              </div>
                              <h3 className="text-lg font-bold text-white mt-0.5">{activeStep.title}</h3>
                              <div className="text-xs" style={{ color: activeStep.systemColor + "cc" }}>{activeStep.system}</div>
                            </div>
                          </div>
                          <motion.div
                            animate={{ opacity: [1, 0.4, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: activeStep.systemColor + "25", color: activeStep.systemColor }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeStep.systemColor }} />
                            RUNNING
                          </motion.div>
                        </div>
                        <p className="text-sm text-slate-300 mt-3 leading-relaxed">{activeStep.description}</p>
                      </div>

                      {/* Inputs / Outputs / Key Object */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Inputs */}
                        <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Inputs</div>
                          <ul className="space-y-2">
                            {activeStep.inputs.map((inp, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="text-slate-600 shrink-0 mt-0.5">→</span>{inp}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Outputs */}
                        <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Outputs</div>
                          <ul className="space-y-2">
                            {activeStep.outputs.map((out, i) => (
                              <li key={i} className={`rounded-lg px-2.5 py-1.5 text-xs flex items-start gap-2 ${
                                out.error ? "bg-red-950/40 border border-red-900/40" :
                                out.highlight ? "bg-violet-950/40 border border-violet-800/40" :
                                out.success ? "bg-emerald-950/30 border border-emerald-900/30" :
                                "bg-white/5 border border-white/5"
                              }`}>
                                <span className="shrink-0 mt-0.5" style={{ color: out.error ? "#f87171" : out.highlight ? "#a78bfa" : "#34d399" }}>
                                  {out.error ? "✕" : "←"}
                                </span>
                                <div>
                                  <div className="font-semibold" style={{ color: out.error ? "#fca5a5" : out.highlight ? "#c4b5fd" : "#6ee7b7" }}>{out.label}</div>
                                  <div style={{ color: out.error ? "#fca5a5" : out.highlight ? "#ddd6fe" : "#94a3b8" }}>{out.value}</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Key object */}
                        {activeStep.keyObject && (
                          <div className="rounded-xl p-4 border border-white/10" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Key Object</div>
                            <div className="text-xs font-mono font-bold mb-3" style={{ color: activeStep.systemColor }}>{activeStep.keyObject.label}</div>
                            <div className="space-y-1.5">
                              {activeStep.keyObject.fields.map((f, i) => (
                                <div key={i} className={`flex gap-2 text-xs rounded px-2 py-1 font-mono ${f.highlight ? "bg-violet-950/50 border border-violet-800/40" : "bg-white/5"}`}>
                                  <span style={{ color: f.highlight ? "#a78bfa" : "#64748b" }}>{f.key}:</span>
                                  <span className="truncate" style={{ color: f.highlight ? "#ddd6fe" : "#94a3b8" }}>{f.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Success message + Next button */}
                      <div className="flex items-center justify-between gap-4 rounded-xl px-5 py-3 border" style={{ backgroundColor: "rgba(5,150,105,0.08)", borderColor: "rgba(5,150,105,0.25)" }}>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#059669" }} />
                          <span className="text-xs text-slate-300">{activeStep.successMessage}</span>
                        </div>
                        {currentStep < totalSteps ? (
                          <button
                            onClick={advanceStep}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white shrink-0 transition-all hover:opacity-90"
                            style={{ backgroundColor: "#059669" }}
                          >
                            Next — {SIM_STEPS[currentStep].title}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: "#059669", color: "white" }}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Simulation Complete
                          </div>
                        )}
                      </div>

                      {/* Completion summary */}
                      {currentStep === totalSteps && completedCount === totalSteps - 1 && (
                        <div className="rounded-xl p-5 border border-emerald-800/40" style={{ backgroundColor: "rgba(5,150,105,0.08)" }}>
                          <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5" style={{ color: "#059669" }} />
                            Simulation Complete — All 10 Steps Executed
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: "Records Processed", value: "1,247" },
                              { label: "FirmTaxonomyId Assigned", value: "1,247" },
                              { label: "TAX_READY Proposals", value: "1,089" },
                              { label: "Pending Review", value: "158" },
                            ].map(stat => (
                              <div key={stat.label} className="rounded-lg px-3 py-2 text-center border border-emerald-800/30" style={{ backgroundColor: "rgba(5,150,105,0.1)" }}>
                                <div className="text-lg font-bold" style={{ color: "#059669" }}>{stat.value}</div>
                                <div className="text-xs text-slate-400">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                          <button onClick={resetSimulation} className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" />Run Again
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-6 py-2 border-t border-white/10 text-xs text-slate-600" style={{ backgroundColor: "#0a1628" }}>
        <span>DCT End-to-End Simulation · RSM | CATT · Visualization layer only — no data persisted or modified</span>
        <span>Architecture source of truth: Visio Architecture · platformData.ts</span>
      </div>
    </div>
  );
}
