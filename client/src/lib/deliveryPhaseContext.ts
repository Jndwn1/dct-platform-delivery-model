// Jenniver's delivery-phase clarification supplied November 2, 2026.
// This governs phase interpretation in Ask Buddy; it does not rewrite registries,
// infer per-story completion, or approve proposed technical contracts.
export const DELIVERY_PHASE_CONTEXT = {
  confirmedBy: "Jenniver",
  confirmedOn: "2026-11-02",
  mvp: { deliveredOn: "2026-09-26", label: "Delivered MVP baseline" },
  uat: { status: "Completed", completionDescription: "Last week, as stated November 2, 2026; exact completion day not supplied" },
  pilot: { label: "Current Pilot build", scope: "State and Provision", deliveryDate: "2026-12-16" },
} as const;

export function classifyDeliveryPage(path: string): "Pilot" | "MVP baseline" | "Assistant" {
  const normalized = path.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  if (normalized === "/ask-buddy" || normalized === "/onboarding/step5") return "Assistant";
  if (normalized === "/" || normalized === "/pi4-planning" || normalized === "/workspace/executive" || normalized === "/post-pilot" || normalized.startsWith("/post-pilot/")) return "Pilot";
  return "MVP baseline";
}

export function buildDeliveryPhaseInstruction(): string {
  return "Delivery-phase context confirmed by Jenniver on November 2, 2026: MVP delivered September 26, 2026; UAT completed last week (exact day not supplied). Executive Health and its Pilot pages cover the current State and Provision Pilot build, delivery date December 16, 2026. Other platform pages are the delivered MVP baseline. Use MVP material as existing capability/architecture context for Pilot, not new Pilot scope or a confirmed Pilot dependency. These current phase/date facts supersede older milestone summaries for phase interpretation only; do not rewrite recorded counts, infer individual story completion, or promote proposed diagrams, mappings, contracts, or integration paths to implemented/approved. Pilot is being built, not delivered. Distinguish historical MVP evidence from current Pilot work and user-confirmed dates from artifact-specific status.";
}
