// Header — DCT Platform RSM Design
// Updated: Governance realignment — non-production badge, user name/role, sign out button

import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, signOut } = useAuth();
  const initials = user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";

  return (
    <header
      className="flex items-center justify-between flex-shrink-0"
      style={{
        backgroundColor: "#ffffff",
        borderBottomWidth: "1px",
        borderBottomColor: "#e2e8f0",
        padding: "0 20px",
        height: "52px",
      }}
    >
      {/* Left: RSM logo + platform name */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* RSM Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ display: "flex", gap: "2px" }}>
            <div style={{ width: "8px", height: "20px", backgroundColor: "#10b981", borderRadius: "1px" }} />
            <div style={{ width: "8px", height: "20px", backgroundColor: "#059669", borderRadius: "1px" }} />
            <div style={{ width: "8px", height: "20px", backgroundColor: "#047857", borderRadius: "1px" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "16px", color: "#1e293b", letterSpacing: "0.05em" }}>RSM</span>
        </div>
        <div style={{ width: 1, height: 20, backgroundColor: "#e2e8f0" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>DCT Platform</span>
        {/* Non-production governance badge */}
        <span style={{
          fontSize: 10, fontWeight: 700, color: "#92400e",
          backgroundColor: "#fef3c7", border: "1px solid #f59e0b",
          borderRadius: 4, padding: "2px 7px", letterSpacing: "0.05em", textTransform: "uppercase",
        }}>
          ⚠ Non-Production Workspace
        </span>
      </div>

      {/* Right: user info + sign out */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Governance status pill */}
        <div style={{
          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 500,
          backgroundColor: "#f0fdf4", color: "#166534",
          borderWidth: "1px", borderColor: "#bbf7d0",
        }}>
          Governance Visualization Active
        </div>

        {/* User name + role */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.2 }}>{user.role}</div>
            </div>
            {/* Avatar */}
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              backgroundColor: "#0f2d5e", color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "11px", fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            {/* Sign out */}
            <button
              onClick={signOut}
              title="Sign out"
              style={{
                background: "none", border: "1px solid #e2e8f0", borderRadius: 6,
                cursor: "pointer", color: "#6b7280", fontSize: 11, fontWeight: 600,
                padding: "4px 10px", lineHeight: 1.4,
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
