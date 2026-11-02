import { LOCKED_MVP_BASELINE, GOVERNED_PROGRAM_HEALTH } from "../client/src/contexts/BatchStatusContext";
import { MVP_LIVE_DATE_LABEL } from "../client/src/lib/mvpCriticalMilestones";
import { ROGER_PI4_EXECUTIVE_METRICS, ROGER_PILOT_FEATURES } from "../client/src/lib/rogerPilotBacklog";
import { DISCOVERY_KNOWLEDGE_BASE } from "./discoveryKnowledgeBase";

export const EXECUTIVE_QUESTION = /\b(executive health|executive (?:delivery|status)|dashboard|portfolio|mvp|release|pilot|pi\s?4)\b/i;
export const PILOT_QUESTION = /\b(pilot|pi\s?4|non[-\s]?legal|workflow setup)\b/i;

export function buildExecutiveBuddyEvidence(question: string): string {
  if (!EXECUTIVE_QUESTION.test(question) && !PILOT_QUESTION.test(question)) return "";
  const baseline = LOCKED_MVP_BASELINE;
  const portfolio = ROGER_PI4_EXECUTIVE_METRICS;
  const lines = [
    "## Executive Health and Pilot — shared dashboard source evidence",
    `Executive Health (/): governed MVP baseline as of ${baseline.asOf}; MVP live ${MVP_LIVE_DATE_LABEL}; release candidate ${GOVERNED_PROGRAM_HEALTH.releaseCandidate}; ${baseline.totalFeatures} total MVP features, ${baseline.complete} complete, ${baseline.active} active, ${baseline.inReview} in review, ${baseline.planned} planned, ${baseline.readinessPct}% readiness. These are MVP delivery figures, not Pilot implementation or current UAT completion.`,
    `Team Roger Executive PI4 Dashboard (/post-pilot/roger-pilot-backlog): ${portfolio.totalFeatures} total features; ${portfolio.priorityMustHaveFeatures} Priority Must Have; ${portfolio.defects} defects; ${portfolio.dependencies} dependencies; workstreams ${portfolio.workstreams.join(", ")}. Source captured ${portfolio.capturedOn}: ${portfolio.sourceLabel}. ${portfolio.scopeNote}`,
    "The aggregate dependency count does not identify eight specific blockers, owners, ADO links, or completion. Do not fabricate them. Use the detailed evidence below for supported recommendations, labeled Potential or Proposed unless directly confirmed.",
  ];
  if (PILOT_QUESTION.test(question)) {
    const queryTokens = question.toLowerCase().match(/[a-z0-9]{4,}/g)?.filter((word) => !["what", "have", "does", "this", "that", "with", "from", "refer", "section", "executive", "health", "roger", "pilot", "dependencies", "dependency", "story", "technical"].includes(word)) ?? [];
    const ranked = ROGER_PILOT_FEATURES.map((feature) => ({ feature, score: queryTokens.reduce((score, token) => score + (`${feature.id} ${feature.title} ${feature.deliveryFocus}`.toLowerCase().includes(token) ? 1 : 0), 0) }))
      .filter(({ score }) => score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
    lines.push("\n### Related Pilot feature evidence — captured subset, not a live ADO query or confirmed dependency link");
    for (const { feature } of ranked) {
      lines.push(`- Feature ${feature.id}: ${feature.title}. Captured state: ${feature.featureState}. Scope: ${feature.deliveryFocus} Candidate workstream: ${feature.candidateWorkstream}. Evidence boundary: ${feature.ownershipFinding}`);
      for (const item of feature.workItems.slice(0, 2)) lines.push(`  Captured child ${item.id}: ${item.titleExcerpt}. Team assessment: ${item.teamAssessment}`);
    }
    const pilot = DISCOVERY_KNOWLEDGE_BASE["/post-pilot"];
    // Include complete relevant source statements, not the first 400 characters of the entire page.
    const paragraphs = pilot.context.split("\n").filter((line) => /^- \*\*(Target architecture|Unified dependencies|Planning targets)/.test(line));
    lines.push("\n### Pilot delivery context — working-session evidence, not implementation approval", ...paragraphs);
    lines.push("Relate only relevant features to the user-supplied story. Title-based coverage is complementary context, not proof of parent/child or predecessor/successor links. Answer the supported part first; then list exact unknowns. Do not substitute retired MVP batch planning for current Pilot evidence.");
  }
  return lines.join("\n");
}
