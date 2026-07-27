// ─────────────────────────────────────────────────────────────────────────────
// ExecTour — Guided Executive Simulation
// "▶️ Experience the BA Operating System"
//
// 8-scene product tour overlay with:
//   • Full-screen backdrop + spotlight cutout
//   • Step indicator (Step N of 8)
//   • Narration card with business-language description
//   • Next / Previous / Finish controls
//   • Keyboard: → next, ← prev, Esc close
//   • Smooth fade + slide transitions between scenes
//   • Welcome screen and Closing Summary screen
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
      "This simulation will walk you through the DCT Platform's core capabilities — from real-time delivery intelligence to AI-assisted analysis. Each scene explains the business value of a capability before advancing to the next.",
    valueStatement:
      "The DCT Platform is not just a data system. It is a governed, AI-enabled operating model for enterprise tax delivery.",
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
      "The Executive Dashboard gives leadership a single, authoritative view of platform readiness. Batch completion, gate status, PI progress, and active work are all surfaced here — updated in real time from the ADO backlog.",
    valueStatement:
      "Business Value: Eliminates the need for manual status decks. Leadership always has an accurate, current view of delivery progress without waiting for a sprint review.",
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
      "The Learning Center provides structured, role-based onboarding for new team members, architects, and business stakeholders. It covers the DCT architecture, batch model, governance rules, and Roger integration — all in business-readable language.",
    valueStatement:
      "Business Value: Reduces onboarding time from weeks to days. New BAs, POs, and engineers can self-serve platform knowledge without requiring 1:1 architecture walkthroughs.",
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
      "The Discovery Center is the BA's primary workspace for understanding platform architecture, data flows, system responsibilities, and integration patterns. It includes ecosystem maps, data flow simulations, and BA requirement discovery tools.",
    valueStatement:
      "Business Value: Gives BAs and architects a structured environment to explore the platform before writing requirements — reducing rework and misalignment between business intent and technical delivery.",
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
      "Ask Buddy is an AI assistant trained on the DCT platform's architecture, batch model, governance rules, and delivery history. It answers questions in plain language — from 'What does B31 deliver?' to 'Which batches feed Roger's eligibility output?'",
    valueStatement:
      "Business Value: Reduces time spent searching documentation or waiting for architect responses. BAs and POs can get accurate, context-aware answers instantly during sprint planning, PI planning, or stakeholder reviews.",
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
      "The Architecture views provide visual maps of system ownership, data lineage, API contracts, and integration touchpoints. From the enterprise architecture to the developer-level API registry, every layer of the platform is documented and traceable.",
    valueStatement:
      "Business Value: Enables audit readiness, dependency tracking, and impact analysis. When a batch changes, the architecture views immediately show which downstream systems and Roger outputs are affected.",
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
      "The Gate Verification model enforces four delivery gates for every batch: Schema Lock, Invariant Lock, Contract Publication, and Lineage Closure. No batch advances until all gates are verified — ensuring platform integrity at every stage.",
    valueStatement:
      "Business Value: Replaces informal 'done' criteria with a governed, auditable gate model. Every batch delivery is traceable, repeatable, and compliant with enterprise data governance standards.",
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
      "Beyond the current PI, the DCT Platform roadmap includes advanced capabilities: consolidated return assembly, state apportionment, S-Corp specialization, and full audit-trail lineage governance. Each capability is scoped, sequenced, and governed through the batch model.",
    valueStatement:
      "Business Value: The platform is designed for incremental, governed expansion — not big-bang delivery. Each PI adds measurable capability while maintaining the integrity of what has already been delivered.",
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
      "You have just experienced the core capabilities of the DCT Platform: real-time delivery intelligence, structured learning, architecture discovery, AI-assisted analysis, traceability, governance, and a governed roadmap for the future.",
    valueStatement:
      "The DCT Platform is the foundation for RSM's enterprise tax technology strategy — a governed, AI-enabled, API-first operating model that delivers deterministic, auditable, practitioner-ready tax intelligence at scale.",
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

// ── Main component ─────────────────────────────────────────────────────────────

interface ExecTourProps {
  onClose: () => void;
}

export default function ExecTour({ onClose }: ExecTourProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
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
    // Give the page a moment to render before computing spotlight
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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
      if (e.key === "Escape") { onClose(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  // ── Render ──────────────────────────────────────────────────────────────────

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
    backgroundColor: "rgba(10, 15, 28, 0.72)",
    zIndex: 10000,
    pointerEvents: "none",
  };

  // Spotlight cutout using SVG mask
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
        boxShadow: `0 0 0 9999px rgba(10, 15, 28, 0.72), 0 0 0 3px ${scene.accentColor}`,
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
        {/* Accent header bar */}
        <div style={{
          backgroundColor: scene.accentColor,
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
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
              marginLeft: "12px",
              flexShrink: 0,
            }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
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
