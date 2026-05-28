import { useState } from "react";
import { useAuth, ALLOWLISTED_USERS } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const [selectedId, setSelectedId] = useState(ALLOWLISTED_USERS[0].id);

  const handleSignIn = () => {
    if (selectedId) signIn(selectedId);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a1628 0%, #0d2340 40%, #0a4a5c 75%, #0d7a7a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Card */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "48px 40px 40px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0",
        }}
      >
        {/* Logo / Brand */}
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #0a2540, #0d7a7a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "-0.5px",
            }}
          >
            DCT
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#0a2540", lineHeight: 1.2 }}>
              DCT Platform
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: 1.2 }}>
              Gate Verification Dashboard
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: "1px", background: "#e5e7eb", margin: "20px 0 24px" }} />

        {/* Heading */}
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: "#0a2540", marginBottom: "4px" }}>
            Sign In
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            Select your name to access the dashboard
          </div>
        </div>

        {/* Select */}
        <div style={{ width: "100%", marginBottom: "20px" }}>
          <label
            htmlFor="user-select"
            style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}
          >
            User
          </label>
          <select
            id="user-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              fontSize: "14px",
              color: "#0a2540",
              background: "#f9fafb",
              border: "1.5px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              appearance: "auto",
            }}
          >
            {ALLOWLISTED_USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#ffffff",
            background: "linear-gradient(90deg, #0d7a7a 0%, #0a9e9e 100%)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            letterSpacing: "0.3px",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Sign In
        </button>

        {/* Security note */}
        <div style={{ marginTop: "16px", fontSize: "11.5px", color: "#9ca3af", textAlign: "center" }}>
          Access is restricted to authorized RSM personnel only.
          <br />
          No password required — select your name to continue.
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "32px",
          fontSize: "12px",
          color: "rgba(255,255,255,0.45)",
          textAlign: "center",
        }}
      >
        © 2026 RSM US LLP. All rights reserved.
      </div>
    </div>
  );
}
