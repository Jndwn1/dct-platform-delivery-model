import {
  RULE_POSTING_DECISION,
  RULE_POSTING_DISCOVERY_STATUS,
  RULE_POSTING_FLOW,
  RULE_POSTING_OPEN_QUESTIONS,
  RULE_POSTING_VALIDATION,
  RULE_RESULT_STATES,
} from "@/lib/ruleProcessingTdcPosting";

const cardStyle = { backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 18px" };

export default function RuleProcessingTdcPosting() {
  return (
    <section id="s-rule-posting" style={{ marginBottom: "48px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>4A</div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Rule Processing → TDC Posting</h2>
            <p style={{ fontSize: "12px", color: "#475569", margin: "2px 0 0" }}>Status: <strong style={{ color: "#92400e" }}>In Discovery / Validation</strong> · Related: Roger Rule Processing, Tax Adjustments, TDC Persistence, End-to-End Data Flow</p>
          </div>
        </div>
        <div style={{ height: "2px", backgroundColor: "#e2e8f0", marginTop: "14px" }} />
      </div>

      <div style={{ ...cardStyle, borderLeft: "4px solid #059669", backgroundColor: "#f0fdf4", marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Confirmed Processing Behavior</div>
        <p style={{ fontSize: "13px", color: "#166534", lineHeight: "1.6", margin: "0 0 10px" }}>Roger can evaluate rules across multiple entities. The demonstrated example was <strong>2 rules × 4 entities = 8 rule-results</strong>. Roger’s confirmation modal states: <strong>“Each posted rule creates a DRAFT adjustment in TDC.”</strong></p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>{RULE_POSTING_FLOW.map((step, index) => <div key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ backgroundColor: index === RULE_POSTING_FLOW.length - 1 ? "#065f46" : "#ffffff", border: `1px solid ${index === RULE_POSTING_FLOW.length - 1 ? "#065f46" : "#86efac"}`, color: index === RULE_POSTING_FLOW.length - 1 ? "#ffffff" : "#166534", fontSize: "11px", fontWeight: 700, padding: "5px 8px", borderRadius: "5px" }}>{step}</span>{index < RULE_POSTING_FLOW.length - 1 && <span style={{ color: "#059669", fontWeight: 800 }}>→</span>}</div>)}</div>
      </div>

      <div style={{ ...cardStyle, marginBottom: "14px", borderTop: "3px solid #1e3a5f" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "10px" }}>Discovery Center Status · In Discovery / Validation</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "12px 14px" }}><div style={{ fontSize: "11px", fontWeight: 800, color: "#166534", marginBottom: "6px" }}>Confirmed</div><ul style={{ margin: 0, paddingLeft: "16px" }}>{RULE_POSTING_DISCOVERY_STATUS.confirmed.map(item => <li key={item} style={{ fontSize: "11px", color: "#166534", lineHeight: "1.5", marginBottom: "4px" }}>{item}</li>)}</ul></div>
          <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "12px 14px" }}><div style={{ fontSize: "11px", fontWeight: 800, color: "#92400e", marginBottom: "6px" }}>Requires Clarification</div><ul style={{ margin: 0, paddingLeft: "16px" }}>{RULE_POSTING_DISCOVERY_STATUS.requiresClarification.map(item => <li key={item} style={{ fontSize: "11px", color: "#78350f", lineHeight: "1.5", marginBottom: "4px" }}>{item}</li>)}</ul></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px", marginBottom: "14px" }}>
        {RULE_RESULT_STATES.map(state => <div key={state.title} style={{ ...cardStyle, borderColor: state.tone === "confirmed" ? "#bbf7d0" : "#fde68a", backgroundColor: state.tone === "confirmed" ? "#f0fdf4" : "#fffbeb" }}><div style={{ fontSize: "12px", fontWeight: 800, color: state.tone === "confirmed" ? "#166534" : "#92400e", marginBottom: "6px" }}>{state.title}</div><p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", margin: 0 }}>{state.description}</p></div>)}
      </div>

      <div style={{ ...cardStyle, borderLeft: "4px solid #7c3aed", backgroundColor: "#faf5ff", marginBottom: "14px" }}>
        <div style={{ fontSize: "14px", fontWeight: 900, color: "#5b21b6", marginBottom: "6px" }}>Calculated ≠ Posted ≠ Persisted</div>
        <p style={{ fontSize: "13px", color: "#5b21b6", lineHeight: "1.6", margin: 0 }}>A result may be calculated and displayed by Roger without necessarily being stored as a TDC adjustment. Roger supports multi-entity rule evaluation; the exact TDC persistence structure for the resulting adjustments requires confirmation. The meeting statement that TDC does not save certain multi-value or multi-entity data remains <strong>Open / Requires Clarification</strong> until the affected structure is confirmed.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        <div style={{ ...cardStyle, borderTop: "3px solid #1e3a5f" }}><div style={{ fontSize: "11px", fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Decision Log · {RULE_POSTING_DECISION.title}</div><p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", margin: "0 0 8px" }}>{RULE_POSTING_DECISION.summary}</p><div style={{ fontSize: "11px", fontWeight: 700, color: "#92400e" }}>Status: {RULE_POSTING_DECISION.status}</div><div style={{ fontSize: "11px", color: "#475569", marginTop: "5px", lineHeight: "1.5" }}><strong>DCT impact:</strong> {RULE_POSTING_DECISION.impact}</div></div>
        <div style={{ ...cardStyle, borderTop: "3px solid #0369a1" }}><div style={{ fontSize: "11px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>PDC Impact Boundary</div><p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", margin: "0 0 8px" }}><strong>PDC Impact: TBD — dependent on source of required rule inputs.</strong></p><p style={{ fontSize: "12px", color: "#475569", lineHeight: "1.55", margin: 0 }}>If a skipped input is expected from PDC, flag that specific input as a PDC dependency/data gap for investigation. If the input is practitioner-entered in Roger or supplied by TDC or another source, do not assign the issue to PDC.</p></div>
      </div>

      <details style={{ ...cardStyle, marginBottom: "14px" }}>
        <summary style={{ cursor: "pointer", fontSize: "13px", fontWeight: 800, color: "#1e3a5f" }}>Open Questions / Discovery ({RULE_POSTING_OPEN_QUESTIONS.length})</summary>
        <ol style={{ paddingLeft: "20px", margin: "12px 0 0" }}>{RULE_POSTING_OPEN_QUESTIONS.map(question => <li key={question} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", marginBottom: "7px" }}>{question}</li>)}</ol>
      </details>

      <div style={{ ...cardStyle, backgroundColor: "#f8fafc" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "8px" }}>DCT End-to-End Validation</div>
        <ul style={{ margin: 0, paddingLeft: "18px", columns: 2, columnGap: "28px" }}>{RULE_POSTING_VALIDATION.map(item => <li key={item} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", marginBottom: "7px", breakInside: "avoid" }}>{item}</li>)}</ul>
      </div>
    </section>
  );
}
