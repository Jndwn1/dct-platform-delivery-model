import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  PI4_ARCHITECTURE_FOCUS,
  PI4_FEATURE_STORY_MAP,
  PI4_LOGICAL_ARCHITECTURE_FLOW,
  PI4_PLANNING_SUMMARY,
  PI4_SPRINT_PLANNING_LANES,
  PI4_TY26_PILOT_EXPANSIONS,
} from "../client/src/lib/pi4PlanningModel";

const workspaceSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/PI4PlanningWorkspace.tsx"), "utf8");

describe("PI4 executive planning presentation", () => {
  it("adds executive hierarchy, navigation, planning status, KPI treatment, summary, and leadership attention without changing planning values", () => {
    const source = workspaceSource();

    expect(source).toContain("PI4 Post-Pilot Planning");
    expect(source).toContain("PI4 Sprint &amp; Story Tracker");
    expect(source).toContain("Planning inventory only — not committed delivery");
    expect(source).toContain("Planning view refreshed");
    expect(source).toContain("Executive navigation");
    ["Executive Overview", "Architecture", "TY26 Pilot", "Planning Lanes", "DCT Platform", "State", "Provision"].forEach((label) => expect(source).toContain(`label: "${label}"`));
    expect(source).toContain("Leadership Attention");
    expect(source).toContain("PI4 baseline still requires approval before sprint commitments.");
    expect(source).toContain("State stories are refined and DCT-owned; PI4 sprint commitments remain pending baseline approval.");
    expect(source).toContain("DCT-owned State delivery dependencies");
    expect(source).toContain("Provision sequencing depends on Package 0 / downstream readiness.");
    expect(source).toContain("DCT Platform work includes foundational data, security, prior-year continuity, and administration capabilities.");
    expect(source).toContain("Baseline approval pending");

    expect(PI4_PLANNING_SUMMARY).toEqual({ featureCount: 7, storyCount: 12, sprintLaneCount: 4, assignedStoryCount: 0 });
  });

  it("keeps detailed architecture, TY26 pilot, lanes, and feature-to-story content available within executive cards and disclosure", () => {
    const source = workspaceSource();
    const stateStories = PI4_FEATURE_STORY_MAP.flatMap((feature) => feature.stories).filter((story) => ["1472734", "1471480"].includes(story.id));

    expect(source).toContain("Logical Architecture &amp; End-to-End Flow");
    expect(source).toContain("Architecture Flow");
    expect(source).toContain("Visual flow summary");
    expect(source).toContain("PI4 Architecture Focus");
    expect(source).toContain("Why This Matters for PI4");
    expect(source).toContain("System ownership");
    expect(source).toContain("Integration points");
    expect(source).toContain("Dependency visibility");
    expect(source).toContain("Transformation vs persistence");
    expect(source).toContain("Cross-team coordination");
    expect(source).toContain("TY26 Pilot Expansion Areas");
    expect(source).toContain("Sequence to validate — not a committed schedule");
    expect(source).toContain("Current timing status");
    expect(source).toContain("Purpose / scope &amp; readiness note");
    expect(source).toContain("Owning workstream(s)");
    expect(source).toContain("<details open");
    expect(source).toContain("Refined · DCT Owned");
    expect(source).toContain("{story.deliveryOwner} owned");
    expect(source).toContain("Planning Visibility");

    expect(stateStories.every((story) => story.deliveryOwner === "DCT")).toBe(true);
    expect(stateStories.every((story) => story.planningStatus === "Planning visibility")).toBe(true);
    expect(PI4_LOGICAL_ARCHITECTURE_FLOW).toHaveLength(10);
    expect(PI4_ARCHITECTURE_FOCUS).toHaveLength(5);
    expect(PI4_TY26_PILOT_EXPANSIONS).toHaveLength(8);
    expect(PI4_SPRINT_PLANNING_LANES).toHaveLength(4);
    expect(PI4_FEATURE_STORY_MAP).toHaveLength(7);
    expect(PI4_FEATURE_STORY_MAP.flatMap((feature) => feature.stories)).toHaveLength(12);
  });
});
