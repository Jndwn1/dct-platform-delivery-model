import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ROGER_PILOT_BACKLOG_SOURCE,
  ROGER_PILOT_BACKLOG_SUMMARY,
  ROGER_PILOT_FEATURES,
  ROGER_PILOT_FEATURES_WITH_CHILD_DETAIL,
  ROGER_PILOT_WORK_ITEMS,
} from "../client/src/lib/rogerPilotBacklog";
import {
  ROGER_PI4_SPRINT_2_ALIGNMENT,
  ROGER_PI4_SPRINT_2_GOALS,
} from "../client/src/lib/rogerPilotSprintGoals";
import { buildRogerPilotBacklogMarkdown } from "../client/src/pages/RogerPilotBacklogPage";

const page = readFileSync("client/src/pages/RogerPilotBacklogPage.tsx", "utf8");
const goalSection = readFileSync("client/src/components/RogerPilotSprintGoals.tsx", "utf8");
const app = readFileSync("client/src/App.tsx", "utf8");
const sidebar = readFileSync("client/src/components/Sidebar.tsx", "utf8");

const FEATURE_IDS_WITH_CHILD_INDICATORS = [
  "1462484", "1470472", "1461160", "1475360", "1458058", "1486001", "1486014", "1486197", "1486189",
  "1451927", "1471427", "1464702", "1471425", "1441524", "1441528", "1472793", "1489784", "1486002",
  "1486003", "1441539", "1441546", "1476344", "1476349", "1490944", "1497107",
];

describe("Roger Pilot backlog assessment workspace", () => {
  it("uses the supplied PI4-Sprint 2 Team Roger screenshots as a manual evidence baseline", () => {
    expect(ROGER_PILOT_BACKLOG_SOURCE.sprint).toBe("PI4-Sprint 2");
    expect(ROGER_PILOT_BACKLOG_SOURCE.sourceLabel).toContain("Team Roger / Roger TDC");
    expect(ROGER_PILOT_BACKLOG_SOURCE.totalListedFeatureCount).toBe(91);
    expect(ROGER_PILOT_BACKLOG_SOURCE.featureWithChildIndicatorCount).toBe(25);
    expect(ROGER_PILOT_BACKLOG_SOURCE.coverageNote).toContain("Twenty-five display a visible hierarchy marker");
    expect(ROGER_PILOT_BACKLOG_SOURCE.refreshRule).toContain("Do not infer live status");
  });

  it("reviews every parent feature that displays a child indicator", () => {
    expect(ROGER_PILOT_FEATURES).toHaveLength(25);
    expect(ROGER_PILOT_FEATURES.map((feature) => feature.id)).toEqual(FEATURE_IDS_WITH_CHILD_INDICATORS);
    expect(ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildIndicatorCount).toBe(25);
    expect(ROGER_PILOT_BACKLOG_SUMMARY.featureWithChildDetailCount).toBe(4);
    expect(ROGER_PILOT_BACKLOG_SUMMARY.childDetailPendingCount).toBe(21);
    expect(ROGER_PILOT_BACKLOG_SUMMARY.featureStateCounts).toEqual([
      { state: "Requirements", count: 3 },
      { state: "New", count: 16 },
      { state: "Active", count: 4 },
      { state: "On Hold", count: 2 },
    ]);
  });

  it("keeps child-level findings bounded to the four features with captured child rows", () => {
    expect(ROGER_PILOT_FEATURES_WITH_CHILD_DETAIL.map((feature) => feature.id)).toEqual(["1461160", "1441524", "1441528", "1490944"]);
    expect(ROGER_PILOT_WORK_ITEMS).toHaveLength(20);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Active")).toHaveLength(6);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Review Ready")).toHaveLength(3);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "QA Ready")).toHaveLength(2);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "New")).toHaveLength(5);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Closed")).toHaveLength(4);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.id === "1444168" || item.id === "1488637").map((item) => item.id)).toEqual(["1444168", "1488637"]);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.legacyDataLabel).map((item) => item.id)).toEqual(["1488496", "1488477", "1488494", "1488497"]);
  });

  it("defines evidence-bound PI4-Sprint 2 goals with TDC first, followed by State and Provision", () => {
    expect(ROGER_PI4_SPRINT_2_GOALS.map((goal) => goal.workstream)).toEqual(["TDC", "State", "Provision"]);
    expect(ROGER_PI4_SPRINT_2_GOALS.find((goal) => goal.workstream === "State")?.supportingFeatures.map((feature) => feature.featureId)).toEqual(["1451927", "1471427", "1464702", "1471425", "1485999", "1486002", "1486003", "1487518", "1462484"]);
    expect(ROGER_PI4_SPRINT_2_GOALS.find((goal) => goal.workstream === "Provision")?.supportingFeatures.map((feature) => feature.featureId)).toEqual(["1476344", "1476349", "1476352", "1476353", "1476354", "1475360", "1470472"]);
    expect(ROGER_PI4_SPRINT_2_GOALS.find((goal) => goal.workstream === "TDC")?.supportingFeatures.map((feature) => feature.featureId)).toEqual(["1441522", "1441524", "1441525", "1441526", "1441527", "1461160", "1441528", "1472793", "1489784", "1490944"]);
    expect(ROGER_PI4_SPRINT_2_GOALS.find((goal) => goal.workstream === "TDC")?.supportingFeatures.find((feature) => feature.featureId === "1461160")?.purpose).toContain("Parent feature status: On Hold");
    expect(ROGER_PI4_SPRINT_2_ALIGNMENT).toHaveLength(4);
  });

  it("keeps the retained leadership, Sprint goal, and readiness surfaces without the removed backlog sections", () => {
    expect(page).toContain("RogerPilotSprintGoals");
    expect(goalSection).toContain("PI4–Sprint 2 goals, objectives, and cross-workstream outcome");
    expect(goalSection).toContain("Supporting features and purpose");
    expect(goalSection).toContain("How the workstreams align and depend on one another");
    expect(goalSection.indexOf("How the workstreams align and depend on one another")).toBeLessThan(goalSection.indexOf("ROGER_PI4_SPRINT_2_GOALS.map"));
    expect(goalSection).not.toContain("Planning boundary:");
    expect(goalSection).not.toContain("Collective end-of-sprint outcome");
    expect(page).not.toContain("Feature state distribution");
    expect(page).not.toContain("Workstream review lanes");
    expect(page).not.toContain("All features with visible child indicators");
    expect(page).not.toContain("Team assignment recommendations");
    expect(page).toContain("Dependencies, gaps, and decision questions");
    expect(page).not.toContain("Deployment Planning");
    expect(page).not.toContain("Changes since last backlog review");
    expect(page).not.toContain("Manual refresh protocol");
    expect(page).not.toContain("Manual source baseline");
    expect(page).toContain("Export assessment (.md)");
    expect(page).not.toContain("No live Azure DevOps connection is used");
    expect(page).not.toContain("DCT");
    expect(JSON.stringify(ROGER_PILOT_FEATURES)).not.toContain("DCT");
    expect(JSON.stringify(ROGER_PI4_SPRINT_2_GOALS)).not.toContain("DCT");
  });

  it("places Sprint 2 goals directly after the Leadership Snapshot and before readiness assessment", () => {
    const leadershipSnapshot = page.indexOf('eyebrow="Leadership snapshot"');
    const sprintGoals = page.indexOf("<RogerPilotSprintGoals />");
    const readinessAssessment = page.indexOf('aria-labelledby="dependencies-and-gaps"');

    expect(leadershipSnapshot).toBeGreaterThan(-1);
    expect(sprintGoals).toBeGreaterThan(leadershipSnapshot);
    expect(readinessAssessment).toBeGreaterThan(sprintGoals);
  });

  it("adds the child route and Post Pilot navigation entry", () => {
    expect(app).toContain('path="/post-pilot/roger-pilot-backlog"');
    expect(sidebar).toContain('label: "Roger Pilot Backlog"');
    expect(sidebar).toContain('path: "/post-pilot/roger-pilot-backlog"');
  });

  it("exports an evidence-bound review summary", () => {
    const markdown = buildRogerPilotBacklogMarkdown();
    expect(markdown).toContain("# Roger Pilot Backlog Assessment");
    expect(markdown).toContain("Parent features visible in source list: 91");
    expect(markdown).toContain("Features with visible child indicator: 25");
    expect(markdown).toContain("Features requiring child-row expansion: 21");
    expect(markdown).toContain("## PI4–Sprint 2 goals, objectives, and cross-workstream outcome");
    expect(markdown).toContain("### State goal");
    expect(markdown).toContain("### Provision goal");
    expect(markdown).toContain("### TDC goal");
    expect(markdown).not.toContain("### Collective end-of-sprint outcome");
    expect(markdown).not.toContain("## Captured child detail");
    expect(markdown).toContain("| 1490944 |");
    expect(markdown).toContain("Related ADO IDs: 1488496, 1488477, 1463645, 1488332, 1488494, 1488497, 1487890, 1444168, 1488637, 1483802");
    expect(markdown).toContain("Do not infer live status");
  });
});
