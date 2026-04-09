// Header — DCT Platform RSM Design
// Matches reference: rsm-ai-team-niua6bzx.manus.space
// White header, RSM logo, status pills, hamburger menu, user avatar

interface HeaderProps {
  onMenuToggle?: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        backgroundColor: "#ffffff",
        borderBottomWidth: "1px",
        borderBottomColor: "#e2e8f0",
        padding: "10px 20px",
        height: "52px",
      }}
    >
      {/* Left: hamburger + RSM logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#64748b", fontSize: "18px", lineHeight: 1, padding: "4px"
          }}
        >
          ☰
        </button>
        {/* RSM Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            <div style={{ width: "8px", height: "20px", backgroundColor: "#10b981", borderRadius: "1px" }} />
            <div style={{ width: "8px", height: "20px", backgroundColor: "#059669", borderRadius: "1px" }} />
            <div style={{ width: "8px", height: "20px", backgroundColor: "#047857", borderRadius: "1px" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b", letterSpacing: "0.05em" }}>RSM</span>
        </div>
      </div>

      {/* Right: status pills + avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
          backgroundColor: "#f0fdf4", color: "#166534",
          borderWidth: "1px", borderColor: "#bbf7d0"
        }}>
          Governance &amp; Platform Structures Active
        </div>
        <div style={{
          padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
          backgroundColor: "#eff6ff", color: "#1e40af",
          borderWidth: "1px", borderColor: "#bfdbfe"
        }}>
          Agentic Execution
        </div>
        <div style={{
          padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
          backgroundColor: "#ecfdf5", color: "#065f46",
          borderWidth: "1px", borderColor: "#6ee7b7"
        }}>
          Batch 1–2
        </div>
        {/* User avatar */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "50%",
          backgroundColor: "#2563eb", color: "white",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", fontWeight: 700, flexShrink: 0
        }}>
          JL
        </div>
      </div>
    </header>
  );
}
