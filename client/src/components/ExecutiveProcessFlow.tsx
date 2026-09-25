export type ExecutiveFlowStep = {
  label: string;
  title: string;
  detail: string;
  accent: string;
  surface: string;
};

type ExecutiveProcessFlowProps = {
  ariaLabel: string;
  steps: readonly ExecutiveFlowStep[];
  outcome: string;
  supportNote?: string;
};

export default function ExecutiveProcessFlow({ ariaLabel, steps, outcome, supportNote }: ExecutiveProcessFlowProps) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #dbe4ee", borderRadius: "10px", boxShadow: "0 2px 8px rgba(15, 23, 42, 0.045)", overflow: "hidden" }}>
      <div aria-label={ariaLabel} style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", padding: "14px" }}>
        {steps.map((step, index) => (
          <article key={`${step.label}-${step.title}`} style={{ background: step.surface, border: `1px solid ${step.accent}33`, borderTop: `4px solid ${step.accent}`, borderRadius: "8px", boxSizing: "border-box", minHeight: "126px", padding: "12px", position: "relative" }}>
            <div style={{ color: step.accent, fontSize: "10px", fontWeight: 900, letterSpacing: "0.06em", textTransform: "uppercase" }}>{step.label}</div>
            <div style={{ color: "#0f172a", fontSize: "13px", fontWeight: 900, lineHeight: 1.25, marginTop: "5px" }}>{step.title}</div>
            <p style={{ color: "#475569", fontSize: "11px", lineHeight: 1.48, margin: "7px 0 20px" }}>{step.detail}</p>
            {index < steps.length - 1 && <div aria-hidden="true" style={{ bottom: "8px", color: step.accent, fontSize: "10px", fontWeight: 900, position: "absolute", right: "10px" }}>NEXT →</div>}
          </article>
        ))}
      </div>
      {supportNote && <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", color: "#334155", fontSize: "11px", lineHeight: 1.48, padding: "10px 14px" }}><strong>Cross-functional support:</strong> {supportNote}</div>}
      <div style={{ background: "#0f172a", color: "#e2e8f0", fontSize: "11px", lineHeight: 1.5, padding: "10px 14px" }}><strong style={{ color: "#ffffff" }}>Executive outcome:</strong> {outcome}</div>
    </div>
  );
}
