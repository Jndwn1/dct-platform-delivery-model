import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ROGER_PI4_EXECUTIVE_METRICS } from "../client/src/lib/rogerPilotBacklog";
import { ROGER_PI4_GOALS } from "../client/src/components/RogerPilotPiGoals";
import { buildRogerPilotBacklogMarkdown } from "../client/src/pages/RogerPilotBacklogPage";

const page = readFileSync("client/src/pages/RogerPilotBacklogPage.tsx", "utf8");
const goals = readFileSync(
  "client/src/components/RogerPilotPiGoals.tsx",
  "utf8"
);
const app = readFileSync("client/src/App.tsx", "utf8");
const sidebar = readFileSync("client/src/components/Sidebar.tsx", "utf8");
const pageContext = readFileSync(
  "client/src/lib/pageContextRegistry.ts",
  "utf8"
);
const knowledge = readFileSync("server/discoveryKnowledgeBase.ts", "utf8");

describe("Team Roger Executive PI4 Dashboard", () => {
  it("uses the supplied PI-wide portfolio snapshot as the leadership baseline", () => {
    expect(ROGER_PI4_EXECUTIVE_METRICS.totalFeatures).toBe(93);
    expect(ROGER_PI4_EXECUTIVE_METRICS.priorityMustHaveFeatures).toBe(50);
    expect(ROGER_PI4_EXECUTIVE_METRICS.defects).toBe(23);
    expect(ROGER_PI4_EXECUTIVE_METRICS.dependencies).toBe(8);
    expect(ROGER_PI4_EXECUTIVE_METRICS.workstreams).toEqual([
      "Federal NV POD 1",
      "Federal NV POD 2",
      "TDC",
      "State",
      "Provision",
    ]);
  });

  it("defines all five PI workstream goals without inferring completion or burndown", () => {
    expect(ROGER_PI4_GOALS.map(goal => goal.workstream)).toEqual([
      "Federal NV POD 1",
      "Federal NV POD 2",
      "TDC",
      "State",
      "Provision",
    ]);
    expect(goals).toContain("PI4 Goals, Objectives & Cross-Workstream Outcome");
    expect(goals).toContain("not a team burndown or completion view");
    expect(goals).toContain("A transparent Federal POD 1 delivery view");
    expect(goals).toContain("A governed State MVP path");
    expect(goals).toContain("A Provision plan");
  });

  it("uses PI-wide leadership treatment without cycle-specific framing", () => {
    expect(page).toContain("Team Roger Executive PI4 Dashboard");
    expect(page).toContain(
      "All Team Roger Workstreams — PI4 Portfolio Metrics"
    );
    expect(page).toContain("Total features");
    expect(page).toContain("Priority Must Have");
    expect(page).toContain("Defects");
    expect(page).toContain("Dependencies");
    expect(page).toContain("All-workstream focus");
    expect(page).toContain("PI Goal / Focus");
    expect(page).not.toContain("metricColumns");
    expect(page).not.toContain("metricStatus");
    expect(page).not.toContain('"Metric Status"');
    expect(page).toContain("<RogerPilotPiGoals />");
    expect(page).not.toContain("Parent-Feature Review Register");
    expect(page).not.toContain("parent-feature-review");
    const removedCycleLabel = "Sprint" + " 2";
    expect(page).not.toContain(removedCycleLabel);
    expect(goals).not.toContain(removedCycleLabel);
  });

  it("makes the absence of team scorecard detail a visible governance gap", () => {
    expect(page).toContain("Team scorecard gaps");
    expect(page).toContain("Do not derive team burndown");
    expect(page).toContain("all 8 dependencies");
    expect(page).toContain("all 23 defects");
  });

  it("exports a PI-wide leadership dashboard summary", () => {
    const markdown = buildRogerPilotBacklogMarkdown();
    expect(markdown).toContain("# Team Roger Executive PI4 Dashboard");
    expect(markdown).toContain("Total features: 93");
    expect(markdown).toContain("Priority Must Have features: 50");
    expect(markdown).toContain("Defects: 23");
    expect(markdown).toContain("Dependencies: 8");
    expect(markdown).toContain(
      "Federal NV POD 1, Federal NV POD 2, TDC, State, Provision"
    );
    expect(markdown).toContain(
      "## PI4 goals, objectives, and cross-workstream outcome"
    );
    expect(markdown).not.toContain("Parent-Feature Review Register");
    expect(markdown).not.toContain("Detailed parent-feature evidence register");
    expect(markdown).not.toContain("25-record evidence subset");
    expect(markdown).not.toContain("Sprint" + " 2");
  });

  it("registers the dashboard route, navigation, and evidence-bound Ask Buddy context", () => {
    expect(app).toContain('path="/post-pilot/roger-pilot-backlog"');
    expect(sidebar).toContain('label: "Roger Pilot Backlog"');
    expect(pageContext).toContain('"/post-pilot/roger-pilot-backlog"');
    expect(pageContext).toContain(
      "93 total features, 50 Priority Must Have features, 23 defects, and 8 dependencies"
    );
    expect(knowledge).toContain('"/post-pilot/roger-pilot-backlog"');
    expect(knowledge).toContain(
      "Aggregate metrics do not establish per-team scope"
    );
  });
});
