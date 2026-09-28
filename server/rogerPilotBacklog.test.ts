import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ROGER_PILOT_BACKLOG_SOURCE,
  ROGER_PILOT_BACKLOG_SUMMARY,
  ROGER_PILOT_FEATURES,
  ROGER_PILOT_WORK_ITEMS,
} from "../client/src/lib/rogerPilotBacklog";
import { buildRogerPilotBacklogMarkdown } from "../client/src/pages/RogerPilotBacklogPage";

const page = readFileSync("client/src/pages/RogerPilotBacklogPage.tsx", "utf8");
const app = readFileSync("client/src/App.tsx", "utf8");
const sidebar = readFileSync("client/src/components/Sidebar.tsx", "utf8");

describe("Roger Pilot backlog assessment workspace", () => {
  it("uses the supplied PI4-Sprint 2 Team Roger capture as a manual evidence baseline", () => {
    expect(ROGER_PILOT_BACKLOG_SOURCE.sprint).toBe("PI4-Sprint 2");
    expect(ROGER_PILOT_BACKLOG_SOURCE.sourceLabel).toContain("Team Roger / Roger TDC");
    expect(ROGER_PILOT_BACKLOG_SOURCE.refreshRule).toContain("Do not infer live status");
    expect(ROGER_PILOT_FEATURES).toHaveLength(4);
    expect(ROGER_PILOT_WORK_ITEMS).toHaveLength(18);
    expect(ROGER_PILOT_BACKLOG_SUMMARY.legacyDctLabelCount).toBe(4);
  });

  it("preserves the captured features, child work-item states, and legacy-label triage", () => {
    expect(ROGER_PILOT_FEATURES.map((feature) => feature.id)).toEqual(["1441528", "1441524", "1461160", "1490944"]);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Active")).toHaveLength(6);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Review Ready")).toHaveLength(3);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "QA Ready")).toHaveLength(2);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "New")).toHaveLength(3);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === "Closed")).toHaveLength(4);
    expect(ROGER_PILOT_WORK_ITEMS.filter((item) => item.legacyDctLabel).map((item) => item.id)).toEqual(["1488496", "1488477", "1488494", "1488497"]);
  });

  it("provides the required executive assessment, roadmap, ownership, and refresh surfaces", () => {
    expect(page).toContain("PI4–Sprint 2 backlog");
    expect(page).toContain("Sprint roadmap and proposed workstream boundaries");
    expect(page).toContain("Team assignment recommendations");
    expect(page).toContain("Dependencies, gaps, and decision questions");
    expect(page).toContain("Deployment Planning");
    expect(page).toContain("Changes since last backlog review");
    expect(page).toContain("Manual refresh protocol");
    expect(page).toContain("Export assessment (.md)");
    expect(page).toContain("No live Azure DevOps connection is used");
  });

  it("adds the child route and Post Pilot navigation entry", () => {
    expect(app).toContain('path="/post-pilot/roger-pilot-backlog"');
    expect(sidebar).toContain('label: "Roger Pilot Backlog"');
    expect(sidebar).toContain('path: "/post-pilot/roger-pilot-backlog"');
  });

  it("exports an evidence-bound review summary", () => {
    const markdown = buildRogerPilotBacklogMarkdown();
    expect(markdown).toContain("# Roger Pilot Backlog Assessment");
    expect(markdown).toContain("Feature 1490944 — Data — Defect & Bug Management");
    expect(markdown).toContain("Legacy DCT-labeled items requiring current-team allocation: 4");
    expect(markdown).toContain("Do not infer live status");
  });
});
