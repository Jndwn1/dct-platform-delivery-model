import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  createPi4PlanningCopy,
  getPi4FeaturesByWorkstream,
  PI4_FEATURE_STORY_MAP,
  PI4_PLANNING_SUMMARY,
  PI4_SPRINT_PLANNING_LANES,
  PI4_TY26_PILOT_EXPANSIONS,
} from "../client/src/lib/pi4PlanningModel";
import { resolvePageContext } from "../client/src/lib/pageContextRegistry";

const allStories = PI4_FEATURE_STORY_MAP.flatMap((feature) => feature.stories);
const stateStories = allStories.filter((story) => ["1472734", "1471480"].includes(story.id));

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
    expect(stateStories).toHaveLength(2);
    expect(stateStories.every((story) => story.planningStatus === "Planning visibility")).toBe(true);
    expect(stateStories.every((story) => story.deliveryOwner === "DCT")).toBe(true);
    expect(stateStories.every((story) => story.note?.includes("Refinement complete — DCT-owned delivery"))).toBe(true);
    expect(PI4_SPRINT_PLANNING_LANES.every((lane) => lane.timing === "Sprint dates to be confirmed")).toBe(true);
  });

  it("keeps the workspace isolated from PI4 and MVP delivery metrics and registers it as a routable delivery workspace", () => {
    const pagePath = resolve(process.cwd(), "client/src/pages/PI4PlanningWorkspace.tsx");
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const navSource = readFileSync(resolve(process.cwd(), "client/src/lib/operatingModelNavigation.ts"), "utf8");
    const postPilotSource = readFileSync(resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"), "utf8");
    const pageContext = resolvePageContext("/pi4-planning");

    expect(existsSync(pagePath)).toBe(true);
    expect(appSource).toContain('path="/pi4-planning"');
    expect(navSource).toContain('label: "PI4 Sprint Tracker"');
    expect(navSource).toContain('path: "/pi4-planning"');
    expect(postPilotSource).toContain('href="/pi4-planning"');
    expect(pageContext).toMatchObject({ pageTitle: "PI4 Sprint & Story Tracker" });
    expect(pageContext?.businessRules).toContain("State stories 1472734 and 1471480 are refined and DCT-owned; PI4 sprint assignment remains pending baseline approval");

    const copiedText = createPi4PlanningCopy();
    expect(copiedText).toContain("Planning visibility only — excluded from PI4 and MVP delivery metrics");
    expect(copiedText).toContain("Owner: DCT");
    expect(copiedText).toContain("TY26 Pilot — What expands for pilot");
    expect(copiedText).toContain("Client & Return Setup: Support for Disregarded Entities");
    expect(copiedText).toContain("Feature 1451927 — Roger State Taxable Income MVP — State Filing Footprint [State]");
    expect(copiedText).toContain("User Story 1480000 — DCT-P1-04 — Provide RTP true-up outputs to downstream Provision workflows");
  });

  it("keeps the supplied TY26 pilot expansions visible as planning-only content", () => {
    const workspaceSource = readFileSync(resolve(process.cwd(), "client/src/pages/PI4PlanningWorkspace.tsx"), "utf8");

    expect(PI4_TY26_PILOT_EXPANSIONS).toHaveLength(8);
    expect(PI4_TY26_PILOT_EXPANSIONS).toEqual(expect.arrayContaining([
      expect.objectContaining({ area: "Client & Return Setup", expansion: "Support for Disregarded Entities" }),
      expect.objectContaining({ area: "Trial Balance Ingestion", expansion: "Client entity identifiers and abbreviations maintained within Roger to improve TB ingestion and entity assignment" }),
      expect.objectContaining({ area: "Sign-Off & GoSystem Integration", expansion: "Expanded sign-off functionality and the ability to push selected entities to GoSystem" }),
    ]));
    expect(workspaceSource).toContain("TY26 Pilot");
    expect(workspaceSource).toContain("What expands for pilot");
    expect(workspaceSource).toContain("Planning visibility only");
    expect(workspaceSource).toContain("do not create committed sprint work or change MVP/PI4 delivery metrics");
  });
});
