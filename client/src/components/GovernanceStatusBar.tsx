/**
 * GovernanceStatusBar
 * Persistent governance health bar displayed at the top of all Roger screens.
 * Shows: Blocking Issues, Warnings, Open Questions, Active Contracts, Governance Status.
 * Grounded in live platform data from the Known Mappings / Book-Reclass integration context.
 */

export interface GovernanceStatusBarProps {
  blocking?: number;
  warnings?: number;
  openQuestions?: number;
  contractsActive?: number;
  contractsTotal?: number;
  governanceStatus?: "Active" | "Degraded" | "Blocked";
  /** Optional label override for the page context */
  context?: string;
}

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  Active:   { bg: "#dcfce7", text: "#15803d", dot: "#16a34a" },
  Degraded: { bg: "#fef9c3", text: "#854d0e", dot: "#ca8a04" },
  Blocked:  { bg: "#fee2e2", text: "#991b1b", dot: "#dc2626" },
};

export function GovernanceStatusBar({
  blocking = 2,
  warnings = 3,
  openQuestions = 5,
  contractsActive = 2,
  contractsTotal = 8,
  governanceStatus = "Active",
  context,
}: GovernanceStatusBarProps) {
  const s = STATUS_COLOR[governanceStatus];
  return (
    <div style={{
      background: "#0f1623",
      borderBottom: "2px solid #1e3a5f",
      padding: "8px 20px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      flexWrap: "wrap",
      fontFamily: "system-ui, sans-serif",
    }}>
      {/* Label */}
      <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginRight: "6px" }}>
        {context ? `${context} ·` : ""} Governance Status
      </span>

      {/* Blocking */}
      <Pill
        label={`${blocking} Blocking`}
        bg={blocking > 0 ? "#fef2f2" : "#f0fdf4"}
        text={blocking > 0 ? "#991b1b" : "#15803d"}
        dot={blocking > 0 ? "#dc2626" : "#16a34a"}
      />

      {/* Warnings */}
      <Pill
        label={`${warnings} Warning${warnings !== 1 ? "s" : ""}`}
        bg={warnings > 0 ? "#fffbeb" : "#f0fdf4"}
        text={warnings > 0 ? "#92400e" : "#15803d"}
        dot={warnings > 0 ? "#d97706" : "#16a34a"}
      />

      {/* Open Questions */}
      <Pill
        label={`${openQuestions} Open Question${openQuestions !== 1 ? "s" : ""}`}
        bg="#eff6ff"
        text="#1d4ed8"
        dot="#3b82f6"
      />

      {/* Contracts */}
      <Pill
        label={`${contractsActive}/${contractsTotal} Contracts`}
        bg="#f5f3ff"
        text="#5b21b6"
        dot="#7c3aed"
      />

      {/* Governance Status */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "5px",
        fontSize: "10px", fontWeight: 700, padding: "3px 9px", borderRadius: "4px",
        background: s.bg, color: s.text,
        marginLeft: "4px",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
        Governance Visualization {governanceStatus}
      </span>
    </div>
  );
}

function Pill({ label, bg, text, dot }: { label: string; bg: string; text: string; dot: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px",
      background: bg, color: text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {label}
    </span>
  );
}
