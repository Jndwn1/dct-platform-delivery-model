// DCT Platform — UAT Master Data Documentation Page
// RSM Digital Solutions | Enterprise Design

export default function UATTestingPage() {
  // ── Design tokens ──────────────────────────────────────────────────────────
  const NAVY   = "#0f2744";
  const BLUE   = "#1a56db";
  const GREEN  = "#065f46";
  const TEAL   = "#0d9488";
  const SLATE  = "#475569";
  const LIGHT  = "#f8fafc";
  const BORDER = "#e2e8f0";
  const AMBER  = "#92400e";
  const AMBER_BG = "#fffbeb";
  const AMBER_BORDER = "#fde68a";

  // ── Workflow steps ─────────────────────────────────────────────────────────
  const workflowSteps = [
    { icon: "📋", label: "Master Data Workbook", sub: "Source of Truth", color: NAVY },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🔄", label: "Load into Roger", sub: "Data Ingestion", color: "#1e3a5f" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "✅", label: "Business Validation", sub: "UAT Execution", color: "#065f46" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🐛", label: "Log Defects", sub: "Issue Tracking", color: "#7f1d1d" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🔍", label: "Review & Triage", sub: "BA + Dev Analysis", color: "#78350f" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "📝", label: "Workbook Updated", sub: "If Change Approved", color: "#4c1d95" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🔁", label: "Reload Data", sub: "Dev Team Action", color: "#1e3a5f" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🧪", label: "Retest", sub: "Validation Cycle", color: "#065f46" },
    { icon: "⬇", label: "", sub: "", color: "transparent", isArrow: true },
    { icon: "🏁", label: "Business Sign-Off", sub: "UAT Complete", color: TEAL },
  ];

  // ── Roles ──────────────────────────────────────────────────────────────────
  const roles = [
    {
      role: "Business Analyst",
      icon: "📊",
      color: BLUE,
      responsibilities: [
        "Coordinate and manage UAT activities",
        "Update Master Data Workbook with approved changes",
        "Analyze and triage identified issues",
        "Maintain version control and change log",
      ],
    },
    {
      role: "Business Users",
      icon: "👥",
      color: GREEN,
      responsibilities: [
        "Execute test scripts against loaded data",
        "Validate business data accuracy and completeness",
        "Approve validated results and sign off",
        "Escalate critical discrepancies to BA",
      ],
    },
    {
      role: "Development Team",
      icon: "⚙️",
      color: "#1e3a5f",
      responsibilities: [
        "Perform data loads into the Roger platform",
        "Resolve technical defects and data issues",
        "Confirm successful reload after workbook updates",
        "Support environment readiness",
      ],
    },
    {
      role: "Testing Team",
      icon: "🧪",
      color: "#7c3aed",
      responsibilities: [
        "Execute structured test scripts",
        "Log defects with full reproduction details",
        "Validate fixes and confirm defect closure",
        "Maintain defect register and status tracking",
      ],
    },
  ];

  // ── Exit criteria ──────────────────────────────────────────────────────────
  const exitCriteria = [
    { text: "All required master data loaded into the Roger platform", critical: true },
    { text: "All test scripts executed and results documented", critical: true },
    { text: "All Critical and High defects resolved and retested", critical: true },
    { text: "Business validation completed across all data domains", critical: true },
    { text: "Business approval received from designated approvers", critical: true },
    { text: "Master Data Workbook approved for production use", critical: true },
  ];

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1080, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1e293b" }}>

      {/* ── Page Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, #1a3a6e 100%)`,
        borderRadius: 14, padding: "32px 36px", marginBottom: 36, color: "white",
        boxShadow: "0 4px 24px rgba(15,39,68,0.18)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>📋</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>
              DCT Platform · RSM Digital Solutions
            </div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>
              User Acceptance Testing (UAT)
            </h1>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.7, maxWidth: 680 }}>
          Master Data Validation Framework for the DCT Platform MVP · Enterprise Implementation Guide
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
          {["Master Data Workbook", "Roger Platform", "MVP Scope", "Business Sign-Off Required"].map(tag => (
            <span key={tag} style={{
              fontSize: 11, fontWeight: 600, backgroundColor: "rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.9)", borderRadius: 4, padding: "3px 10px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* ── Section 1: Purpose ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="01" title="Purpose" icon="🎯" color={BLUE} />
        <div style={{
          backgroundColor: LIGHT, border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "22px 26px",
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 14, color: "#1e293b", lineHeight: 1.8 }}>
            The <strong>DCT Enterprise Master Data Workbook</strong> serves as the authoritative source of truth for all master data
            used to seed the DCT platform. It defines the reference data, tax form mappings, statutory filing due dates,
            taxonomy structures, and entity configurations that drive platform behavior.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.8 }}>
            The purpose of UAT is to <strong>validate that master data has been loaded accurately into the Roger application</strong> and
            behaves as expected under real business conditions. UAT confirms that all data relationships are intact, all
            mappings are correct, and the platform is ready for production use.
          </p>
        </div>
      </section>

      {/* ── Section 2: UAT Objectives ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="02" title="UAT Objectives" icon="🎯" color={TEAL} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {[
            { icon: "✅", text: "Validate all loaded master data against the approved workbook", color: GREEN },
            { icon: "🔗", text: "Confirm relationships between reference data entities", color: BLUE },
            { icon: "📄", text: "Verify tax forms and line-level mappings are accurate", color: "#7c3aed" },
            { icon: "📅", text: "Validate statutory filing due dates and jurisdiction rules", color: AMBER },
            { icon: "🗂️", text: "Confirm taxonomy mappings align with business definitions", color: TEAL },
            { icon: "🐛", text: "Identify and log data defects for resolution", color: "#7f1d1d" },
            { icon: "🏭", text: "Ensure all data is production-ready before go-live", color: NAVY },
          ].map((obj, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px 16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                backgroundColor: `${obj.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>{obj.icon}</div>
              <p style={{ margin: 0, fontSize: 13, color: "#1e293b", lineHeight: 1.6, fontWeight: 500 }}>{obj.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: UAT Workflow ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="03" title="UAT Workflow" icon="🔄" color={NAVY} />
        <div style={{
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "28px 32px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            {workflowSteps.map((step, i) => {
              if (step.isArrow) {
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: 28 }}>
                    <div style={{ width: 2, height: 14, backgroundColor: "#cbd5e1", marginBottom: 0 }} />
                    <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1 }}>▼</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  backgroundColor: step.color, borderRadius: 10,
                  padding: "13px 24px", width: "100%", maxWidth: 520,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>{step.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Roles & Responsibilities ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="04" title="Roles &amp; Responsibilities" icon="👥" color={BLUE} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {roles.map((r, i) => (
            <div key={i} style={{
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: 10, overflow: "hidden",
              boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                backgroundColor: r.color, padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{r.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{r.role}</span>
              </div>
              <ul style={{ margin: 0, padding: "14px 18px 14px 32px", listStyle: "none" }}>
                {r.responsibilities.map((resp, j) => (
                  <li key={j} style={{
                    fontSize: 12.5, color: "#374151", lineHeight: 1.6, marginBottom: 6,
                    paddingLeft: 0, position: "relative",
                  }}>
                    <span style={{ color: r.color, fontWeight: 700, marginRight: 6 }}>›</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Change Control ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="05" title="Change Control During UAT" icon="🔒" color={AMBER} />
        <div style={{
          backgroundColor: AMBER_BG, border: `1px solid ${AMBER_BORDER}`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 16,
        }}>
          <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: AMBER }}>
            ⚠ Important: All changes to master data during UAT must follow the approved change control process.
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.7 }}>
            SharePoint version history serves as the version control mechanism for the Master Data Workbook.
            No changes may be applied to production data without completing the full change control cycle below.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { step: "1", label: "Business validates the issue", detail: "Business users confirm the discrepancy is a genuine data error, not a test script or environment issue." },
            { step: "2", label: "BA reviews the requested change", detail: "The Business Analyst reviews the change request, assesses impact, and obtains stakeholder approval before proceeding." },
            { step: "3", label: "Workbook is updated", detail: "The approved change is applied to the Master Data Workbook. The version number and change log are updated in SharePoint." },
            { step: "4", label: "Development reloads the data", detail: "The Development Team performs a targeted reload of the affected data records into the Roger platform." },
            { step: "5", label: "Business re-validates affected records", detail: "Business users re-execute the relevant test scripts to confirm the corrected data behaves as expected." },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              backgroundColor: "white", border: `1px solid ${BORDER}`,
              borderRadius: 8, padding: "14px 18px",
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                backgroundColor: AMBER, color: "white",
                fontSize: 12, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{item.step}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6 }}>{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 6: Defect Management ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="06" title="Defect Management" icon="🐛" color="#7f1d1d" />
        <div style={{
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "22px 26px",
        }}>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "#1e293b", lineHeight: 1.8 }}>
            All defects identified during UAT must be formally logged, prioritized, assigned, resolved, and retested
            before they can be closed. No defect may be marked closed without a successful retest confirming the fix.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { phase: "Log", icon: "📝", desc: "Record defect with full details, steps to reproduce, and expected vs. actual result", color: "#1e3a5f" },
              { phase: "Prioritize", icon: "🔢", desc: "Assign severity (Critical / High / Medium / Low) and priority (P1–P4) based on business impact", color: "#7c3aed" },
              { phase: "Assign", icon: "👤", desc: "Assign to the appropriate Development Team member with a target resolution date", color: BLUE },
              { phase: "Resolve", icon: "🔧", desc: "Developer fixes the root cause and confirms the fix in the UAT environment", color: "#065f46" },
              { phase: "Retest", icon: "🧪", desc: "Testing Team re-executes the failed test script to confirm the defect is resolved", color: TEAL },
              { phase: "Close", icon: "✅", desc: "Defect is closed only after a successful retest is documented and approved", color: GREEN },
            ].map((d, i) => (
              <div key={i} style={{
                flex: "1 1 160px", backgroundColor: LIGHT, border: `1px solid ${BORDER}`,
                borderRadius: 8, padding: "14px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: d.color, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{d.phase}</div>
                <div style={{ fontSize: 11.5, color: SLATE, lineHeight: 1.6 }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Exit Criteria ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="07" title="Exit Criteria" icon="🏁" color={GREEN} />
        <div style={{
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "22px 26px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}>
          <p style={{ margin: "0 0 18px", fontSize: 13.5, color: SLATE, lineHeight: 1.7 }}>
            UAT is considered complete only when <strong>all</strong> of the following exit criteria have been met and formally documented.
            Business approval is required before the platform may proceed to production deployment.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {exitCriteria.map((c, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 8, padding: "13px 18px",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  backgroundColor: GREEN, color: "white",
                  fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                }}>✓</div>
                <span style={{ fontSize: 13.5, color: "#166534", fontWeight: 600, lineHeight: 1.5 }}>{c.text}</span>
                {c.critical && (
                  <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: GREEN, backgroundColor: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 4, padding: "2px 7px", whiteSpace: "nowrap" }}>REQUIRED</span>
                )}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 8, padding: "14px 18px",
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>ℹ️</span>
            <p style={{ margin: 0, fontSize: 13, color: "#1e40af", lineHeight: 1.7 }}>
              <strong>Note:</strong> All exit criteria are mandatory for MVP go-live. Partial completion does not constitute UAT sign-off.
              Any waived criteria must be formally documented with business justification and leadership approval.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <div style={{
        borderTop: `2px solid ${BORDER}`, paddingTop: 20, marginTop: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          DCT Platform · Master Data UAT Framework · RSM Digital Solutions
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          Document Owner: Jenniver Stafford · Version 1.0 · MVP Target: September 21, 2026
        </div>
      </div>

    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function SectionHeader({ number, title, icon, color }: { number: string; title: string; icon: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        backgroundColor: color, color: "white",
        fontSize: 11, fontWeight: 800, letterSpacing: "0.04em",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{number}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }} dangerouslySetInnerHTML={{ __html: title }} />
      </div>
      <div style={{ flex: 1, height: 1, backgroundColor: "#e2e8f0", marginLeft: 4 }} />
    </div>
  );
}
