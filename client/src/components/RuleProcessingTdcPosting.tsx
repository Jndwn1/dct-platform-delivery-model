import { RULE_POSTING_DEMO_OBSERVATIONS, RULE_POSTING_FOLLOW_UP } from "@/lib/ruleProcessingTdcPosting";

export default function RuleProcessingTdcPosting() {
  return (
    <section id="s-rule-posting" style={{ marginBottom: "48px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#0f1623", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 }}>4A</div>
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#0f1623", margin: 0 }}>Rule Processing → TDC Posting</h2>
            <p style={{ fontSize: "12px", color: "#475569", margin: "2px 0 0" }}>Status: <strong style={{ color: "#92400e" }}>Meeting Finding / Additional Validation Required</strong></p>
          </div>
        </div>
        <div style={{ height: "2px", backgroundColor: "#e2e8f0", marginTop: "14px" }} />
      </div>

      <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderLeft: "4px solid #1e3a5f", borderRadius: "10px", padding: "16px 18px", marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", fontWeight: 800, color: "#1e3a5f", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Demo Observation / Meeting Finding</div>
        <p style={{ fontSize: "12px", color: "#1e3a5f", lineHeight: "1.55", margin: "0 0 10px" }}>The following records what was demonstrated or discussed in a working demo and business clarification meeting. It is <strong>not</strong> an approved DCT requirement, MVP architecture decision, TDC persistence design, or committed development scope.</p>
        <ul style={{ margin: 0, paddingLeft: "18px" }}>{RULE_POSTING_DEMO_OBSERVATIONS.map(item => <li key={item} style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", marginBottom: "5px" }}>{item}</li>)}</ul>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "15px 17px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>Needs Follow-Up</div>
          <p style={{ fontSize: "12px", color: "#78350f", lineHeight: "1.55", margin: 0 }}>{RULE_POSTING_FOLLOW_UP.clarification}</p>
        </div>
        <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", padding: "15px 17px" }}>
          <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "7px" }}>DCT / PDC Impact</div>
          <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", margin: "0 0 8px" }}><strong>DCT Impact: {RULE_POSTING_FOLLOW_UP.dctImpact}.</strong> {RULE_POSTING_FOLLOW_UP.dctReason}</p>
          <p style={{ fontSize: "12px", color: "#334155", lineHeight: "1.55", margin: 0 }}><strong>PDC Impact: {RULE_POSTING_FOLLOW_UP.pdcImpact}.</strong></p>
        </div>
      </div>
    </section>
  );
}
