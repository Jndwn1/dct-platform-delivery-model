import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createPi4PlanningCopy,
  getPi4FeaturesByWorkstream,
  PI4_FEATURE_STORY_MAP,
  PI4_PLANNING_SUMMARY,
  PI4_SPRINT_PLANNING_LANES,
} from "../client/src/lib/pi4PlanningModel";
import { resolvePageContext } from "../client/src/lib/pageContextRegistry";

const allStories = PI4_FEATURE_STORY_MAP.flatMap((feature) => feature.stories);

describe("PI4 Sprint & Story Tracker", () => {
  it("maintains the supplied DCT Platform, State, and Provision feature-to-story mappings as planning inventory", () => {
    expect(PI4_PLANNING_SUMMARY).toMatchObject({
      featureCount: 7,
      storyCount: 12,
      sprintLaneCount: 4,
      assignedStoryCount: 0,
    });
    expect(getPi4FeaturesByWorkstream("DCT Platform")).toHaveLength(5);
    expect(getPi4FeaturesByWorkstream("State")).toHaveLength(1);
    expect(getPi4FeaturesByWorkstream("Provision")).toHaveLength(1);

    ["1433863", "1450150", "1454679", "1472917", "1435463", "1474079", "1472734", "1471480", "1479949", "1479958", "1480251", "1480000"].forEach((storyId) => {
      expect(allStories.some((story) => story.id === storyId)).toBe(true);
    });
    expect(allStories.every((story) => story.sprint === "Unassigned")).toBe(true);
    expect(allStories.filter((story) => story.planningStatus === "Refinement required").map((story) => story.id)).toEqual(["1472734", "1471480"]);
    expect(PI4_SPRINT_PLANNING_LANES.every((lane) => lane.timing === "Sprint dates to be confirmed")).toBe(true);
  });

  it("keeps the workspace isolated from PI4 and MVP delivery metrics and registers it as a routable delivery workspace", () => {
    const pagePath = resolve(process.cwd(), "client/src/pages/PI4PlanningWorkspace.tsx");
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const navSource = readFileSync(resolve(process.cwd(), "client/src/lib/operatingModelNavigation.ts"), "utf8");
    const dashboardSource = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");

    expect(existsSync(pagePath)).toBe(true);
    expect(appSource).toContain('path="/pi4-planning"');
    expect(navSource).toContain('label: "PI4 Sprint Tracker"');
    expect(navSource).toContain('path: "/pi4-planning"');
    expect(dashboardSource).toContain('planningLink: "/pi4-planning"');
    expect(resolvePageContext("/pi4-planning")).toMatchObject({ pageTitle: "PI4 Sprint & Story Tracker" });

    const copiedText = createPi4PlanningCopy();
    expect(copiedText).toContain("Planning visibility only — excluded from PI4 and MVP delivery metrics");
    expect(copiedText).toContain("Feature 1451927 — Roger State Taxable Income MVP — State Filing Footprint [State]");
    expect(copiedText).toContain("User Story 1480000 — DCT-P1-04 — Provide RTP true-up outputs to downstream Provision workflows");
  });
});
