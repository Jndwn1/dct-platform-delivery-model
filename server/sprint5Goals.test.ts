import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type PriorityArea = {
  title: string;
  accent: string;
  bullets: string[];
};

const pageSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"),
  "utf8",
);

function extractPriorityAreas(constName: string): PriorityArea[] {
  const start = pageSource.indexOf(`const ${constName}: SprintPriorityArea[] = [`);
  const end = pageSource.indexOf("\n];", start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);

  const source = pageSource.slice(start, end);
  const areas: PriorityArea[] = [];
  const areaPattern = /\{\s*title:\s*"([^"]+)",\s*accent:\s*(?:"([^"]+)"|(PURPLE)),\s*bullets:\s*\[([\s\S]*?)\]\s*,?\s*\}/g;

  for (const match of source.matchAll(areaPattern)) {
    areas.push({
      title: match[1],
      accent: match[2] ?? (match[3] === "PURPLE" ? "#7c3aed" : ""),
      bullets: Array.from(match[4].matchAll(/"([^"]+)"/g), (bullet) => bullet[1]),
    });
  }

  return areas;
}

describe("Sprint 5 goals", () => {
  it("defines the four supplied grouped goal cards with exact titles, accents, and bullets", () => {
    expect(extractPriorityAreas("SPRINT_5_PRIORITY_AREAS")).toEqual([
      {
        title: "TDC v2 Foundation & Workflow",
        accent: "#1e3a5f",
        bullets: [
          "Workflow setup is 75% complete",
          "Finish the V2 workflow build-out",
          "Address remaining rules-related APIs and migration scripts",
        ],
      },
      {
        title: "Migration & Account Build Readiness",
        accent: "#1d4ed8",
        bullets: [
          "Move requirement-stage migration items into build",
          "Move requirement-stage account items into build",
        ],
      },
      {
        title: "Prior-Year & State Integration",
        accent: "#7c3aed",
        bullets: [
          "Clear prior-year items awaiting review or access",
          "Clear State integration items awaiting review or access",
        ],
      },
      {
        title: "State",
        accent: "#0f766e",
        bullets: [
          "State modifications and State Tax Control integration with Federal",
          "Output approvals and triggering",
          "GoSystem retrieval and simple multi-entity aggregation review",
        ],
      },
    ]);
  });

  it("keeps the 75% statement scoped to workflow setup rather than portfolio completion", () => {
    const start = pageSource.indexOf(
      "const SPRINT_5_PRIORITY_AREAS: SprintPriorityArea[] = [",
    );
    const end = pageSource.indexOf("\n];", start);
    const source = pageSource.slice(start, end);

    expect(source).toContain('"Workflow setup is 75% complete"');
    expect(source).not.toContain("portfolio completion");
    expect(source.match(/75%/g)).toHaveLength(1);
  });

  it("keeps Sprint 5 dates and priorities on the shared timeline renderer", () => {
    expect(pageSource).toContain(
      '{ number: 5, sprint: "PI4 · Sprint 5", dates: "11/4 – 11/17", priorities: SPRINT_5_PRIORITY_AREAS },',
    );

    const timelineStart = pageSource.indexOf(
      "const PI4_SPRINT_TIMELINE: Pi4Sprint[] = [",
    );
    const timelineEnd = pageSource.indexOf("\n];", timelineStart);
    const timelineSource = pageSource.slice(timelineStart, timelineEnd);
    expect(timelineSource).toContain("priorities: SPRINT_5_PRIORITY_AREAS");

    const rendererStart = pageSource.indexOf("PI4_SPRINT_TIMELINE.map");
    expect(rendererStart).toBeGreaterThanOrEqual(0);
    const renderer = pageSource.slice(rendererStart, rendererStart + 2200);
    expect(renderer).toContain("item.priorities.map");
  });

  it("preserves all six existing Sprint 4 grouped goal cards", () => {
    expect(extractPriorityAreas("SPRINT_4_PRIORITY_AREAS")).toEqual([
      {
        title: "TDC v2 Foundation & Workflow",
        accent: "#1e3a5f",
        bullets: [
          "Create the tdc_v2 schema and DbContext foundation",
          "Advance workflow-management APIs",
        ],
      },
      {
        title: "Database Architecture & Data Standards",
        accent: "#1d4ed8",
        bullets: [
          "Implement database architecture enhancements",
          "Define TDC → IMS → GoSystem data types and validation standards",
        ],
      },
      {
        title: "Reliability & Performance",
        accent: "#b45309",
        bullets: [
          "Resolve Performance Environment sign-off issues",
          "Address TDC DTU capacity reaching 100%",
        ],
      },
      {
        title: "Accounts & Prior-Year Data",
        accent: "#0f766e",
        bullets: [
          "Implement persistent manual client accounts and new-account storage",
          "Migrate prior-year financial amounts and configure delegated CEM access",
        ],
      },
      {
        title: "State Integration Discovery",
        accent: "#7c3aed",
        bullets: [
          "Advance State apportionment outbound discovery",
          "Advance GoSystem calculated-results ingestion and persistence discovery",
        ],
      },
      {
        title: "State",
        accent: "#0f766e",
        bullets: [
          "Apportionment calculations",
          "Modifications Workspace design",
          "Prior-year data integration",
        ],
      },
    ]);
  });

  it("leaves Sprint 4 closeout and Sprint 5 pending metrics unchanged", () => {
    const metricsStart = pageSource.indexOf(
      "const POST_PILOT_SPRINT_METRICS: SprintMetricSnapshot[] = [",
    );
    const metricsEnd = pageSource.indexOf("\n];", metricsStart);
    const metricsSource = pageSource.slice(metricsStart, metricsEnd);

    expect(metricsSource).toContain(
      `sprint: 4,\n    source: "Supplied TDC — PI4 Sprint 4 closeout summary",`,
    );
    expect(metricsSource).toContain("totalWorkItems: 35");
    expect(metricsSource).toContain("completedClosed: 32");
    expect(metricsSource).toContain("carriedForward: 3");
    expect(metricsSource).toContain("completionRate: 91");
    expect(metricsSource).toContain("carryoverRate: 9");
    expect(metricsSource).toContain(
      '{ sprint: 5, source: "Backlog snapshot not yet supplied" },',
    );
  });
});
