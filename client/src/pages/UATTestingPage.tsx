// DCT Platform — UAT Master Data Documentation Page
// RSM Digital Solutions | Enterprise Design

import UATWorkflowDiagram from "@/components/UATWorkflowDiagram";

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
          backgroundColor: "white", border: `1px solid ${BORDER}`,
          borderRadius: 10, padding: "28px 32px",
        }}>
          <p style={{ margin: "0 0 18px", fontSize: 14.5, color: "#1e293b", lineHeight: 1.85, maxWidth: 820 }}>
            The <strong style={{ color: NAVY }}>DCT Enterprise Master Data Workbook</strong> is the authoritative source of truth for all master data loaded into the Roger application. It defines the reference data, taxonomy, tax forms, tax form lines, mapping rules, return templates, filing due dates, entity types, jurisdictions, and configuration data that drive application behavior.
          </p>
          <p style={{ margin: 0, fontSize: 14.5, color: "#1e293b", lineHeight: 1.85, maxWidth: 820 }}>
            The purpose of User Acceptance Testing (UAT) is to validate that the approved master data has been accurately loaded into Roger, that relationships and mappings function correctly, and that the application is ready for business approval and production deployment.
          </p>

          {/* Reference Artifact Callout */}
          <div style={{
            marginTop: 24, display: "flex", alignItems: "center", gap: 16,
            backgroundColor: "#f0f6ff", border: "1px solid #bfdbfe",
            borderRadius: 8, padding: "14px 20px",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              backgroundColor: BLUE, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16,
            }}>📎</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginBottom: 2 }}>Reference Artifact</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: NAVY }}>DCT Enterprise Master Data Workbook</div>
              <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>Authoritative Source of Truth for all master data loaded into Roger.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: UAT Objectives ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="02" title="UAT Objectives" icon="📋" color={NAVY} />

        {/* Executive summary statement */}
        <p style={{
          margin: "0 0 28px", fontSize: 15, color: "#1e293b",
          lineHeight: 1.7, fontStyle: "italic", fontWeight: 400,
          borderLeft: `3px solid ${BLUE}`, paddingLeft: 16,
        }}>
          The objective of UAT is to validate the accuracy, integrity, and readiness of master data before production deployment.
        </p>

        {/* Vertical process flow */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", maxWidth: 680 }}>
          {[
            {
              icon: "✔",
              label: "Validate Master Data",
              detail: "Confirm that the master data loaded into Roger matches the approved Master Data Workbook.",
              isApproval: false,
            },
            {
              icon: "✔",
              label: "Verify Data Integrity",
              detail: "Validate relationships and dependencies across reference data to ensure completeness and consistency.",
              isApproval: false,
            },
            {
              icon: "✔",
              label: "Validate Business Rules",
              detail: "Confirm that mappings, tax forms, configurations, jurisdictions, and business rules function as expected.",
              isApproval: false,
            },
            {
              icon: "✔",
              label: "Resolve Defects",
              detail: "Document, prioritize, and resolve master data defects identified during UAT.",
              isApproval: false,
            },
            {
              icon: "✔",
              label: "Business Approval",
              detail: "Obtain business approval confirming the master data is production-ready.",
              isApproval: true,
            },
          ].map((obj, i, arr) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
              {/* Card */}
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                backgroundColor: obj.isApproval ? "#f0fdf4" : "white",
                border: `1px solid ${obj.isApproval ? "#bbf7d0" : BORDER}`,
                borderLeft: `4px solid ${obj.isApproval ? "#059669" : NAVY}`,
                borderRadius: 8, padding: "18px 22px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}>
                {/* Check icon */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                  backgroundColor: obj.isApproval ? "#059669" : NAVY,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "white", fontWeight: 700,
                }}>{obj.icon}</div>
                {/* Text */}
                <div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: obj.isApproval ? "#065f46" : NAVY,
                    marginBottom: 4,
                  }}>{obj.label}</div>
                  <div style={{ fontSize: 13, color: SLATE, lineHeight: 1.65 }}>{obj.detail}</div>
                </div>
              </div>
              {/* Connector arrow (not after last item) */}
              {i < arr.length - 1 && (
                <div style={{
                  display: "flex", justifyContent: "flex-start",
                  paddingLeft: 35, margin: "0",
                }}>
                  <div style={{
                    width: 1, height: 24,
                    backgroundColor: "#cbd5e1",
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", bottom: -4, left: "50%",
                      transform: "translateX(-50%)",
                      width: 0, height: 0,
                      borderLeft: "4px solid transparent",
                      borderRight: "4px solid transparent",
                      borderTop: "5px solid #cbd5e1",
                    }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: UAT Workflow ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="03" title="UAT Workflow" icon="🔄" color={NAVY} />
        <UATWorkflowDiagram />
      </section>

      {/* ── Section 4: Roles & Responsibilities ── */}
      <section style={{ marginBottom: 40 }}>
        <SectionHeader number="04" title="Roles &amp; Responsibilities" icon="👥" color={NAVY} />

        {/* Section subtitle */}
        <p style={{
          margin: "0 0 24px", fontSize: 14, color: SLATE,
          lineHeight: 1.7, fontWeight: 400,
        }}>
          Clear ownership ensures efficient execution of UAT activities, controlled master data updates, and successful business validation.
        </p>

        {/* Three equal-width role cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
          {[
            {
              role: "Business Analyst",
              responsibilities: [
                "Coordinate and facilitate UAT activities",
                "Maintain the Master Data Workbook as the authoritative source of truth",
                "Review and triage master data defects with Business and Development",
                "Update the Master Data Workbook with approved changes",
                "Coordinate master data reload requests and communicate updates",
                "Support business sign-off and maintain change history",
              ],
            },
            {
              role: "Business Users",
              responsibilities: [
                "Execute business validation against loaded master data",
                "Validate business rules, mappings, and data accuracy",
                "Document defects and submit change requests",
                "Revalidate corrected data after workbook updates and reloads",
                "Approve validated results and provide business sign-off",
              ],
            },
            {
              role: "Development Team",
              responsibilities: [
                "Load approved master data into the Roger application",
                "Determine whether changes require a partial or full reload",
                "Execute master data reloads",
                "Resolve technical defects and data load issues",
                "Validate successful data loads before business revalidation",
                "Support UAT environment readiness",
              ],
            },
          ].map((r, i) => (
            <div key={i} style={{
              backgroundColor: "white",
              border: `1px solid ${BORDER}`,
              borderTop: `3px solid ${NAVY}`,
              borderRadius: 10,
              padding: "22px 22px 20px",
              boxShadow: "0 1px 4px rgba(15,45,82,0.06)",
              display: "flex", flexDirection: "column",
            }}>
              {/* Role title */}
              <div style={{
                fontSize: 14, fontWeight: 800, color: NAVY,
                marginBottom: 16,
                paddingBottom: 12,
                borderBottom: `1px solid ${BORDER}`,
                letterSpacing: "0.01em",
              }}>{r.role}</div>
              {/* Responsibilities */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {r.responsibilities.map((resp, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      backgroundColor: "#EEF3FA",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: BLUE, fontWeight: 800,
                    }}>✔</div>
                    <span style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.65 }}>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Key Principle callout */}
        <div style={{
          backgroundColor: "#F0F4FA",
          border: `1px solid #C5D5E8`,
          borderLeft: `4px solid ${BLUE}`,
          borderRadius: 8,
          padding: "16px 20px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Key Principle</div>
          <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.75 }}>
            The <strong>Business Analyst</strong> owns the Master Data Workbook and coordinates approved changes.
            The <strong>Development Team</strong> owns data loads and reload execution.
            <strong> Business Users</strong> validate the loaded data and provide final business approval.
          </div>
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
