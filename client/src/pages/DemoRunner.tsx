// Demo Runner — RSM Command Center design
// Animated T1–T11 end-to-end platform simulation for executive audiences

import { useState, useEffect, useRef } from "react";
import { demoSteps, type DemoStep } from "@/lib/agentData";
import { Play, RotateCcw, CheckCircle, Loader2, Circle, ChevronRight, Zap, FileText } from "lucide-react";

type StepState = "pending" | "running" | "complete";

const systemColors: Record<string, { bg: string; text: string; border: string }> = {
  "Phoenix / DMS":    { bg: "#F5F3FF", text: "#5B21B6", border: "#7C3AED" },
  "AI Orchestrator":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#2563EB" },
  "PDC":              { bg: "#ECFDF5", text: "#065F46", border: "#059669" },
  "AI Mapping Layer": { bg: "#FFFBEB", text: "#92400E", border: "#D97706" },
  "TDC":              { bg: "#FEF2F2", text: "#991B1B", border: "#DC2626" },
  "Roger UI":         { bg: "#FDF2F8", text: "#9D174D", border: "#DB2777" },
};

function StepRow({ step, state, isActive }: { step: DemoStep; state: StepState; isActive: boolean }) {
  const sc = systemColors[step.system] || { bg: "#F9FAFB", text: "#374151", border: "#9CA3AF" };

  return (
    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
      isActive ? "shadow-md" : "opacity-70"
    }`}
      style={{
        background: isActive ? sc.bg : "white",
        borderTopWidth: 1,
        borderTopColor: isActive ? sc.border : "#E5E7EB",
        borderRightWidth: 1,
        borderRightColor: isActive ? sc.border : "#E5E7EB",
        borderBottomWidth: 1,
        borderBottomColor: isActive ? sc.border : "#E5E7EB",
        borderLeftWidth: 4,
        borderLeftColor: sc.border,
      }}>
      {/* Step icon */}
      <div className="flex-shrink-0 mt-0.5">
        {state === "complete" ? (
          <CheckCircle size={20} className="text-green-600" />
        ) : state === "running" ? (
          <Loader2 size={20} className="animate-spin" style={{ color: sc.border }} />
        ) : (
          <Circle size={20} className="text-gray-300" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold font-mono" style={{ color: sc.text }}>{step.touchpoint}</span>
          <span className="text-sm font-semibold text-foreground">{step.label}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
            style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
            {step.system}
          </span>
        </div>

        {(state === "running" || state === "complete") && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-1">{step.description}</p>
        )}

        {state === "complete" && (
          <div className="flex items-start gap-1.5 mt-1.5 text-xs">
            <CheckCircle size={11} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 font-medium">{step.output}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DemoRunner() {
  const [stepStates, setStepStates] = useState<StepState[]>(demoSteps.map(() => "pending"));
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const reset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setStepStates(demoSteps.map(() => "pending"));
    setCurrentStep(-1);
    setIsRunning(false);
    setIsComplete(false);
  };

  const runStep = (idx: number) => {
    if (idx >= demoSteps.length) {
      setIsRunning(false);
      setIsComplete(true);
      return;
    }

    setCurrentStep(idx);
    setStepStates(prev => {
      const next = [...prev];
      next[idx] = "running";
      return next;
    });

    // Scroll into view
    setTimeout(() => {
      stepRefs.current[idx]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);

    timeoutRef.current = setTimeout(() => {
      setStepStates(prev => {
        const next = [...prev];
        next[idx] = "complete";
        return next;
      });
      timeoutRef.current = setTimeout(() => runStep(idx + 1), 400);
    }, demoSteps[idx].duration);
  };

  const startDemo = () => {
    if (isRunning) return;
    if (isComplete) reset();
    setIsRunning(true);
    runStep(0);
  };

  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); }, []);

  const completedCount = stepStates.filter(s => s === "complete").length;
  const progressPct = Math.round((completedCount / demoSteps.length) * 100);

  // Group steps by system for the flow indicator
  const systemOrder = ["Phoenix / DMS", "AI Orchestrator", "PDC", "AI Mapping Layer", "TDC", "Roger UI"];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">End-to-End Demo Runner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Simulates a single Trial Balance file flowing through the full DCT platform — T1 through T11
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={startDemo}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded text-sm font-semibold text-white transition-all disabled:opacity-60 shadow-sm hover:shadow-md"
            style={{ background: isRunning ? "oklch(0.52 0.18 264)" : "oklch(0.28 0.12 264)" }}
          >
            {isRunning ? (
              <><Loader2 size={15} className="animate-spin" /> Running…</>
            ) : isComplete ? (
              <><Play size={15} /> Run Again</>
            ) : (
              <><Play size={15} /> Run Demo</>
            )}
          </button>
        </div>
      </div>

      {/* Demo file card */}
      <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.92 0.04 264)" }}>
          <FileText size={20} style={{ color: "oklch(0.28 0.12 264)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">Acme Corp — Q4 2025 Trial Balance</div>
          <div className="text-xs text-muted-foreground">XLSX · 1,842 line items · Standard Chart of Accounts · Received Mar 11, 2026</div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-xs text-muted-foreground mb-0.5">doc_id</div>
          <div className="text-xs font-mono font-semibold" style={{ color: "oklch(0.28 0.12 264)" }}>
            TB-2025-Q4-ACME-001
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-foreground">Platform Progress</span>
          <span className="font-bold" style={{ color: "oklch(0.28 0.12 264)" }}>{progressPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
          <div
            className="h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%`, background: "oklch(0.52 0.18 264)" }}
          />
        </div>
        {/* System flow indicator */}
        <div className="flex items-center gap-1 flex-wrap">
          {systemOrder.map((sys, idx) => {
            const sc = systemColors[sys];
            const sysSteps = demoSteps.filter(s => s.system === sys);
            const sysComplete = sysSteps.every(s => stepStates[demoSteps.indexOf(s)] === "complete");
            const sysActive = sysSteps.some(s => stepStates[demoSteps.indexOf(s)] === "running");
            return (
              <div key={sys} className="flex items-center gap-1">
                <div className={`text-xs px-2 py-0.5 rounded font-medium border transition-all`}
                  style={{
                    background: sysComplete ? sc.bg : sysActive ? sc.bg : "#F9FAFB",
                    color: sysComplete || sysActive ? sc.text : "#9CA3AF",
                    borderColor: sysComplete || sysActive ? sc.border : "#E5E7EB",
                    fontWeight: sysActive ? 700 : undefined,
                  }}>
                  {sys}
                </div>
                {idx < systemOrder.length - 1 && (
                  <ChevronRight size={12} className="text-muted-foreground flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {demoSteps.map((step, idx) => (
          <div key={step.id} ref={el => { stepRefs.current[idx] = el; }}>
            <StepRow
              step={step}
              state={stepStates[idx]}
              isActive={currentStep >= idx}
            />
          </div>
        ))}
      </div>

      {/* Completion banner */}
      {isComplete && (
        <div className="rounded-lg border-2 border-green-400 bg-green-50 p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={22} className="text-green-600" />
            <span className="text-base font-bold text-green-800">Demo Complete</span>
          </div>
          <p className="text-sm text-green-700 mb-1">
            Trial Balance TB-2025-Q4-ACME-001 has completed the full T1–T11 DCT platform journey.
          </p>
          <p className="text-xs text-green-600">
            1,842 records · Canonical dataset persisted · Lineage captured · Tax decisions persisted · Results available in Roger UI
          </p>
        </div>
      )}

      {/* Instructions */}
      {!isRunning && !isComplete && currentStep === -1 && (
        <div className="text-center text-sm text-muted-foreground py-4">
          Click <strong>Run Demo</strong> to simulate the full T1–T11 platform journey for Acme Corp Q4 2025 Trial Balance.
        </div>
      )}
    </div>
  );
}
