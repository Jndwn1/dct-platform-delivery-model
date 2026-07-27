// ─────────────────────────────────────────────────────────────────────────────
// ExecTour — Guided Executive Simulation
// "▶️ Experience the BA Operating System"
//
// Flow:
//   0. Opening Story — business challenge narrative (pre-tour, full-screen modal)
//   1. Welcome screen
//   2–8. Scenes 1–7 (Exec Dashboard → Future Vision)
//   9. Closing Summary
//
// Features:
//   • Full-screen backdrop + spotlight cutout
//   • Step indicator (Step N of 7)
//   • Narration card with business-language description
//   • Next / Previous / Finish controls
//   • Keyboard: → next, ← prev, Esc close
//   • Smooth fade + slide transitions between scenes
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "wouter";

// ── Scene definitions ─────────────────────────────────────────────────────────

export interface TourScene {
  id: string;
  step: number;        // 1-based; 0 = welcome, 9 = finish
  title: string;
  subtitle: string;
  narration: string;
  valueStatement: string;
  route: string;       // navigate to this route before showing scene
  spotlightSelector?: string; // CSS selector to spotlight (optional)
  icon: string;
  accentColor: string;
}

export const TOUR_SCENES: TourScene[] = [
  {
    id: "welcome",
    step: 0,
    title: "Welcome to the DCT BA Operating System",
    subtitle: "A Guided Executive Experience",
    narration:
      "A guided walk through the DCT Platform's core capabilities — from delivery intelligence to AI-assisted analysis. Each scene explains business value before advancing.",
    valueStatement:
      "The DCT Platform is a governed, AI-enabled operating model for enterprise tax delivery.",
    route: "/",
    icon: "🎯",
    accentColor: "#1e3a5f",
  },
  {
    id: "exec-dashboard",
    step: 1,
    title: "Executive Delivery Dashboard",
    subtitle: "Scene 1 of 7 — Real-Time Delivery Intelligence",
    narration:
      "A single authoritative view of platform readiness — batch completion, gate status, PI progress, and active work, updated in real time from ADO.",
    valueStatement:
      "Eliminates manual status decks. Leadership has an accurate delivery view without waiting for sprint reviews.",
    route: "/",
    spotlightSelector: "#exec-dashboard-anchor",
    icon: "📊",
    accentColor: "#1e3a5f",
  },
  {
    id: "learning-center",
    step: 2,
    title: "Platform Learning Center",
    subtitle: "Scene 2 of 7 — Structured Onboarding & Knowledge Transfer",
    narration:
      "Structured, role-based onboarding covering DCT architecture, batch model, governance rules, and Roger integration — all in business-readable language.",
    valueStatement:
      "Reduces onboarding from weeks to days. New BAs and engineers self-serve platform knowledge without 1:1 walkthroughs.",
    route: "/learning-center",
    icon: "📚",
    accentColor: "#7c3aed",
  },
  {
    id: "discovery-center",
    step: 3,
    title: "Discovery Center",
    subtitle: "Scene 3 of 7 — Architecture & Requirements Discovery",
    narration:
      "The BA's workspace for exploring architecture, data flows, system responsibilities, and integration patterns — with ecosystem maps and requirement discovery tools.",
    valueStatement:
      "Structured exploration before writing requirements reduces rework and misalignment between business intent and technical delivery.",
    route: "/discovery",
    icon: "🔭",
    accentColor: "#0369a1",
  },
  {
    id: "ask-buddy",
    step: 4,
    title: "Ask Buddy — AI-Assisted Analysis",
    subtitle: "Scene 4 of 7 — Conversational Intelligence",
    narration:
      "An AI assistant trained on DCT architecture, batch model, and governance rules. Answers plain-language questions instantly — from batch scope to Roger eligibility outputs.",
    valueStatement:
      "Eliminates documentation searches and architect wait time. Accurate answers available during sprint planning, PI planning, and stakeholder reviews.",
    route: "/ask-buddy",
    icon: "🐱",
    accentColor: "#0d9488",
  },
  {
    id: "architecture",
    step: 5,
    title: "Architecture & Traceability",
    subtitle: "Scene 5 of 7 — System Ownership & Data Lineage",
    narration:
      "Visual maps of system ownership, data lineage, API contracts, and integration touchpoints — from enterprise architecture to the developer-level API registry.",
    valueStatement:
      "Enables audit readiness and impact analysis. When a batch changes, affected downstream systems and Roger outputs are immediately visible.",
    route: "/architecture",
    icon: "🏗️",
    accentColor: "#1e3a5f",
  },
  {
    id: "governance",
    step: 6,
    title: "Governance & Gate Verification",
    subtitle: "Scene 6 of 7 — Delivery Integrity & Compliance",
    narration:
      "Four delivery gates — Schema Lock, Invariant Lock, Contract Publication, and Lineage Closure — enforced for every batch before it can advance.",
    valueStatement:
      "Replaces informal 'done' criteria with an auditable gate model. Every batch delivery is traceable and compliant with enterprise governance standards.",
    route: "/gate-status",
    icon: "🔐",
    accentColor: "#065f46",
  },
  {
    id: "future-vision",
    step: 7,
    title: "Future Vision — PI 4 & Beyond",
    subtitle: "Scene 7 of 7 — Roadmap & Strategic Direction",
    narration:
      "Upcoming capabilities include consolidated return assembly, state apportionment, S-Corp specialization, and full audit-trail lineage — each scoped and governed through the batch model.",
    valueStatement:
      "Incremental, governed expansion. Each PI adds measurable capability without compromising what has already been delivered.",
    route: "/batch-calendar",
    icon: "🚀",
    accentColor: "#7c3aed",
  },
  {
    id: "finish",
    step: 8,
    title: "The DCT BA Operating System",
    subtitle: "Closing Summary",
    narration:
      "You've experienced the full DCT Platform: delivery intelligence, structured learning, discovery, AI analysis, architecture traceability, governance, and a governed roadmap.",
    valueStatement:
      "The DCT Platform is RSM's foundation for enterprise tax technology — governed, AI-enabled, API-first, delivering auditable tax intelligence at scale.",
    route: "/",
    icon: "✅",
    accentColor: "#059669",
  },
];

// ── Spotlight position helper ─────────────────────────────────────────────────

interface SpotlightRect {
  top: number; left: number; width: number; height: number;
}

function getSpotlightRect(selector?: string): SpotlightRect | null {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY - 8,
    left: rect.left + window.scrollX - 8,
    width: rect.width + 16,
    height: rect.height + 16,
  };
}

// ── Opening Story Modal ───────────────────────────────────────────────────────

interface OpeningStoryProps {
  onBegin: () => void;
  onClose: () => void;
}

function OpeningStory({ onBegin, onClose }: OpeningStoryProps) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(10, 15, 28, 0.85)",
      zIndex: 10000,
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      padding: "32px 24px 24px",
      overflowY: "auto",
    }}>
      <div style={{
        width: "min(780px, calc(100vw - 48px))",
        backgroundColor: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35), 0 4px 20px rgba(0,0,0,0.15)",
        border: "2px solid #1e3a5f",
        overflow: "hidden",
        marginBottom: "24px",
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)",
          padding: "22px 28px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
        }}>
          <div>
            <div style={{
              fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "rgba(255,255,255,0.7)",
              marginBottom: "4px",
            }}>
              Before We Begin · Opening Story
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
              The Business Challenge That Inspired the BA Operating System
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              padding: "5px 12px",
              cursor: "pointer",
              flexShrink: 0,
              marginTop: "2px",
            }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "28px 32px" }}>

          {/* Challenge section */}
          <div style={{
            borderLeft: "4px solid #1e3a5f",
            paddingLeft: "16px",
            marginBottom: "24px",
          }}>
            <div style={{
              fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#64748b", marginBottom: "4px",
            }}>
              The Business Challenge
            </div>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "0 0 12px" }}>
              Throughout my experience as a Senior Business Analyst, I've consistently observed the same challenge across multiple programs and delivery teams.
            </p>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "0 0 12px" }}>
              Senior Business Analysts are expected to deliver complex initiatives while simultaneously onboarding and mentoring Business Analysts with varying levels of experience. While mentoring is an important part of the role, a significant amount of time is spent teaching foundational Business Analysis skills that could be standardized and supported through better processes, knowledge management, and AI.
            </p>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "0 0 14px" }}>
              Based on my own experience, I estimate that I spend approximately{" "}
              <strong style={{ color: "#1e3a5f" }}>40–50% of my time</strong> on activities such as:
            </p>
            <ul style={{ margin: "0 0 14px", paddingLeft: "20px" }}>
              {[
                "Onboarding new Business Analysts to a project and platform",
                "Teaching Business Analysis fundamentals and best practices",
                "Coaching Business Analysts on how to write effective user stories and acceptance criteria",
                "Improving backlog hygiene and work item quality",
                "Explaining Business Analysis processes and delivery expectations",
                "Helping team members understand platform architecture, business capabilities, and dependencies",
                "Answering the same questions repeatedly because knowledge is distributed across documents, Teams conversations, meetings, and subject matter experts",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#374151", lineHeight: "1.65", marginBottom: "5px" }}>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "0 0 12px" }}>
              These challenges are not unique to one project. They represent a broader organizational opportunity.
            </p>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: 0 }}>
              When experienced Business Analysts spend a significant portion of their time repeatedly transferring foundational knowledge, it reduces the time available for strategic analysis, stakeholder engagement, innovation, and delivering business value.
            </p>
          </div>

          {/* Key question callout */}
          <div style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderLeft: "4px solid #2563eb",
            borderRadius: "8px",
            padding: "16px 20px",
            marginBottom: "24px",
          }}>
            <p style={{ fontSize: "14px", fontWeight: 700, color: "#1e3a5f", lineHeight: "1.65", margin: 0 }}>
              "How can we standardize Business Analysis, preserve organizational knowledge, and leverage AI to help every Business Analyst become productive faster while enabling senior Business Analysts to focus on higher-value work?"
            </p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "8px 0 0", fontStyle: "italic" }}>
              That question became the foundation for the Business Analyst Operating System.
            </p>
          </div>

          {/* Vision statement */}
          <div style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderLeft: "4px solid #059669",
            borderRadius: "8px",
            padding: "14px 18px",
            marginBottom: "24px",
          }}>
            <p style={{ fontSize: "13px", color: "#065f46", lineHeight: "1.65", margin: 0 }}>
              <strong>The vision is not to replace Business Analysts.</strong> The vision is to augment them with trusted organizational knowledge, standardized methodologies, guided workflows, reusable assets, and AI-assisted discovery that enables every Business Analyst to work more consistently, collaborate more effectively, and deliver better outcomes.
            </p>
          </div>

          {/* Opportunity section */}
          <div style={{
            borderLeft: "4px solid #0d9488",
            paddingLeft: "16px",
            marginBottom: "28px",
          }}>
            <div style={{
              fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.08em", color: "#64748b", marginBottom: "8px",
            }}>
              The Opportunity
            </div>
            <p style={{ fontSize: "14px", color: "#1e293b", lineHeight: "1.7", margin: "0 0 10px" }}>
              Imagine an organization where every Business Analyst:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {[
                "Follows a consistent delivery methodology",
                "Has immediate access to trusted organizational knowledge",
                "Learns new platforms in days instead of weeks",
                "Uses AI to accelerate discovery, documentation, and analysis",
                "Reuses proven requirements, business rules, and implementation patterns instead of starting from scratch",
                "Preserves institutional knowledge for future teams rather than allowing it to disappear at the end of each project",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: "13px", color: "#374151", lineHeight: "1.65", marginBottom: "5px" }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Transition CTA */}
          <div style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "18px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#1e293b", lineHeight: "1.6", margin: 0, flex: 1, minWidth: "200px" }}>
              "Let me show you what that experience looks like and how the BA Operating System can transform the way Business Analysts onboard, discover information, collaborate, and deliver value."
            </p>
            <button
              onClick={onBegin}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                fontSize: "14px", fontWeight: 800,
                color: "#ffffff",
                background: "linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)",
                border: "none",
                borderRadius: "10px",
                padding: "12px 26px",
                cursor: "pointer",
                boxShadow: "0 3px 14px rgba(13,148,136,0.35)",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: "16px" }}>▶️</span>
              Begin the Demonstration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface ExecTourProps {
  onClose: () => void;
}

export default function ExecTour({ onClose }: ExecTourProps) {
  // showStory = true → Opening Story screen; false → guided tour scenes
  const [showStory, setShowStory] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [, navigate] = useLocation();
  const overlayRef = useRef<HTMLDivElement>(null);

  const scene = TOUR_SCENES[currentIdx];
  const isWelcome = scene.step === 0;
  const isFinish = scene.step === 8;
  const totalSteps = 7; // scenes 1-7 (excluding welcome and finish)

  // Navigate to the scene's route and update spotlight
  const applyScene = useCallback((idx: number) => {
    const s = TOUR_SCENES[idx];
    navigate(s.route);
    setTimeout(() => {
      const rect = getSpotlightRect(s.spotlightSelector);
      setSpotlightRect(rect);
      if (rect) {
        window.scrollTo({ top: Math.max(0, rect.top - 120), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 400);
  }, [navigate]);

  // Transition to a new scene
  const goTo = useCallback((idx: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      applyScene(idx);
      setTransitioning(false);
    }, 280);
  }, [transitioning, applyScene]);

  const goNext = useCallback(() => {
    if (currentIdx < TOUR_SCENES.length - 1) goTo(currentIdx + 1);
  }, [currentIdx, goTo]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) goTo(currentIdx - 1);
  }, [currentIdx, goTo]);

  // Apply initial scene on mount
  useEffect(() => {
    applyScene(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation (only active when story is dismissed)
  useEffect(() => {
    if (showStory) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showStory, goNext, goPrev, onClose]);

  // ── Opening Story screen ─────────────────────────────────────────────────────
  if (showStory) {
    return <OpeningStory onBegin={() => setShowStory(false)} onClose={onClose} />;
  }

  // ── Tour scenes ──────────────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    position: "fixed",
    top: "72px",
    left: "50%",
    transform: `translateX(-50%) translateY(${transitioning ? "-16px" : "0"})`,
    opacity: transitioning ? 0 : 1,
    transition: "opacity 0.28s ease, transform 0.28s ease",
    width: "min(680px, calc(100vw - 48px))",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12)",
    border: `2px solid ${scene.accentColor}`,
    zIndex: 10002,
    overflow: "hidden",
  };

  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: minimized ? "rgba(10, 15, 28, 0.12)" : "rgba(10, 15, 28, 0.72)",
    zIndex: 10000,
    pointerEvents: "none",
    transition: "background-color 0.35s ease",
  };

  const renderSpotlight = () => {
    if (!spotlightRect) return null;
    const { top, left, width, height } = spotlightRect;
    return (
      <div style={{
        position: "fixed",
        top: top - window.scrollY,
        left,
        width,
        height,
        zIndex: 10001,
        borderRadius: "10px",
        boxShadow: minimized
          ? `0 0 0 9999px rgba(10, 15, 28, 0.08), 0 0 0 2px ${scene.accentColor}60`
          : `0 0 0 9999px rgba(10, 15, 28, 0.72), 0 0 0 3px ${scene.accentColor}`,
        pointerEvents: "none",
        transition: "all 0.4s ease",
      }} />
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div ref={overlayRef} style={backdropStyle} />

      {/* Spotlight highlight */}
      {renderSpotlight()}

      {/* Narration card */}
      <div style={cardStyle}>
        {/* Accent header bar — always visible, acts as the minimized state handle */}
        <div
          onClick={() => minimized && setMinimized(false)}
          style={{
            backgroundColor: scene.accentColor,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: minimized ? "pointer" : "default",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>{scene.icon}</span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>
                {scene.title}
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>
                {scene.subtitle}
              </div>
            </div>
          </div>
          {/* Step indicator dots */}
          {!isWelcome && !isFinish && (
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  onClick={() => goTo(i + 1)}
                  style={{
                    width: i + 1 === scene.step ? "18px" : "7px",
                    height: "7px",
                    borderRadius: "4px",
                    backgroundColor: i + 1 === scene.step ? "#ffffff" : "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          )}
          {/* Minimize / expand toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setMinimized(m => !m); }}
            title={minimized ? "Expand narration" : "Minimize narration"}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              padding: "3px 9px",
              cursor: "pointer",
              marginLeft: "8px",
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {minimized ? "▼" : "▲"}
          </button>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "6px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              padding: "4px 10px",
              cursor: "pointer",
              marginLeft: "4px",
              flexShrink: 0,
            }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Body — hidden when minimized */}
        <div style={{
          padding: "20px 24px",
          display: minimized ? "none" : "block",
        }}>
          {/* Step counter */}
          {!isWelcome && !isFinish && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "#f1f5f9", borderRadius: "20px",
              padding: "3px 12px", marginBottom: "12px",
              fontSize: "11px", fontWeight: 700, color: "#475569",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: scene.accentColor, display: "inline-block" }} />
              Step {scene.step} of {totalSteps}
            </div>
          )}
          {isWelcome && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "#f0fdf4", borderRadius: "20px",
              padding: "3px 12px", marginBottom: "12px",
              fontSize: "11px", fontWeight: 700, color: "#065f46",
              border: "1px solid #bbf7d0",
            }}>
              ▶️ Executive Simulation · 7 Scenes · ~5 minutes
            </div>
          )}
          {isFinish && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              backgroundColor: "#f0fdf4", borderRadius: "20px",
              padding: "3px 12px", marginBottom: "12px",
              fontSize: "11px", fontWeight: 700, color: "#065f46",
              border: "1px solid #bbf7d0",
            }}>
              ✅ Simulation Complete
            </div>
          )}

          {/* Narration */}
          <p style={{
            fontSize: "14px", color: "#1e293b", lineHeight: "1.65",
            margin: "0 0 12px 0",
          }}>
            {scene.narration}
          </p>

          {/* Value statement */}
          <div style={{
            backgroundColor: "#f8fafc",
            border: `1px solid ${scene.accentColor}30`,
            borderLeft: `3px solid ${scene.accentColor}`,
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "16px",
          }}>
            <p style={{ fontSize: "12px", color: "#374151", lineHeight: "1.6", margin: 0 }}>
              {scene.valueStatement}
            </p>
          </div>

          {/* Navigation controls */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}>
            {/* Prev */}
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              style={{
                fontSize: "12px", fontWeight: 600,
                color: currentIdx === 0 ? "#cbd5e1" : "#475569",
                backgroundColor: "transparent",
                border: `1px solid ${currentIdx === 0 ? "#e2e8f0" : "#cbd5e1"}`,
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: currentIdx === 0 ? "default" : "pointer",
                transition: "all 0.15s",
                minWidth: "90px",
              }}
            >
              ← Previous
            </button>

            {/* Keyboard hint */}
            <span style={{ fontSize: "10px", color: "#94a3b8", textAlign: "center", flex: 1 }}>
              Use → / ← arrow keys or Space to navigate · Esc to exit
            </span>

            {/* Next / Finish */}
            {isFinish ? (
              <button
                onClick={onClose}
                style={{
                  fontSize: "13px", fontWeight: 800,
                  color: "#ffffff",
                  backgroundColor: "#059669",
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 22px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  minWidth: "120px",
                  boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
                }}
              >
                ✅ Finish Tour
              </button>
            ) : (
              <button
                onClick={goNext}
                style={{
                  fontSize: "13px", fontWeight: 800,
                  color: "#ffffff",
                  backgroundColor: scene.accentColor,
                  border: "none",
                  borderRadius: "8px",
                  padding: "9px 22px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  minWidth: "120px",
                  boxShadow: `0 2px 8px ${scene.accentColor}40`,
                }}
              >
                {isWelcome ? "▶️ Begin Tour" : currentIdx === TOUR_SCENES.length - 2 ? "Closing Summary →" : "Next Scene →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
