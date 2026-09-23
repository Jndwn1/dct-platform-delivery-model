import { Link } from "wouter";
import { PI4_PLANNED_FEATURES } from "@/contexts/BatchStatusContext";

const PURPLE = "#7c3aed";
const PURPLE_INK = "#6d28d9";
const PURPLE_SURFACE = "#faf5ff";
const PURPLE_BORDER = "#e9d5ff";

export default function PostPilotPage() {
  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "28px 32px 48px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <div style={{ color: PURPLE, fontSize: "10px", fontWeight: 850, letterSpacing: "0.1em", textTransform: "uppercase" }}>Executive Health</div>
          <h1 style={{ color: "#0f172a", fontSize: "26px", fontWeight: 900, letterSpacing: "-0.02em", margin: "5px 0 0" }}>Post Pilot</h1>
          <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.5, margin: "6px 0 0", maxWidth: "710px" }}>
            PI4 planning visibility and post-pilot metric tracking. Delivery metrics remain separate from the live MVP portfolio until PI4 work is formally approved.
          </p>
        </div>
        <div style={{ backgroundColor: "#f5f3ff", border: `1px solid ${PURPLE_BORDER}`, borderRadius: "999px", color: PURPLE_INK, fontSize: "10px", fontWeight: 850, letterSpacing: "0.06em", padding: "7px 10px", textTransform: "uppercase" }}>
          Planning visibility only
        </div>
      </div>

      <section aria-labelledby="pi4-post-pilot-title" style={{ backgroundColor: PURPLE_SURFACE, border: `1px solid ${PURPLE_BORDER}`, borderRadius: "10px", boxShadow: "0 2px 8px rgba(124, 58, 237, 0.07)", overflow: "hidden" }}>
        <div style={{ alignItems: "flex-start", display: "flex", flexWrap: "wrap", gap: "18px", justifyContent: "space-between", padding: "18px 20px 14px" }}>
          <div>
            <div style={{ color: "#0f172a", fontSize: "16px", fontWeight: 900 }} id="pi4-post-pilot-title">PI 4</div>
            <div style={{ color: PURPLE, fontSize: "11px", fontWeight: 850, letterSpacing: "0.07em", marginTop: "3px", textTransform: "uppercase" }}>Post Pilot · Planning Visibility Only</div>
          </div>
          <div style={{ color: PURPLE, fontSize: "24px", fontWeight: 900, lineHeight: 1 }}>0%</div>
        </div>

        <div style={{ height: "6px", backgroundColor: "#e2e8f0", borderRadius: "3px", margin: "0 20px" }} />

        <div style={{ borderTop: `1px solid ${PURPLE_BORDER}`, marginTop: "14px", padding: "14px 20px 18px" }}>
          <div style={{ color: PURPLE, fontSize: "11px", fontWeight: 850, letterSpacing: "0.07em", textTransform: "uppercase" }}>Planned PI4 Features</div>
          <div style={{ display: "grid", gap: "10px 18px", gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))", marginTop: "10px" }}>
            {PI4_PLANNED_FEATURES.map((feature) => (
              <div key={feature} style={{ alignItems: "flex-start", color: "#334155", display: "flex", fontSize: "12px", gap: "7px", lineHeight: 1.4 }}>
                <span aria-hidden="true" style={{ color: PURPLE, fontWeight: 900 }}>•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          <div style={{ color: "#64748b", fontSize: "11px", fontStyle: "italic", marginTop: "14px" }}>
            Planning visibility only — excluded from all PI4 and MVP delivery metrics.
          </div>
          <Link href="/pi4-planning" style={{ color: PURPLE_INK, display: "inline-flex", fontSize: "12px", fontWeight: 850, marginTop: "12px", textDecoration: "none" }}>
            Open PI4 Sprint &amp; Story Tracker →
          </Link>
        </div>
      </section>
    </div>
  );
}
