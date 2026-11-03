import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Closeout = {
  totalWorkItems: number;
  completedClosed: number;
  carriedForward: number;
  completionRate: number;
  carryoverRate: number;
};

type SprintMetric = {
  sprint: number;
  source: string;
  closeout?: Closeout;
  backlogGoalSource?: boolean;
};

const pageSource = readFileSync(
  resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"),
  "utf8",
);

function extractSprintEntry(sprint: number): string {
  const metricsStart = pageSource.indexOf(
    "const POST_PILOT_SPRINT_METRICS: SprintMetricSnapshot[] = [",
  );
  const metricsEnd = pageSource.indexOf("\n];", metricsStart);
  expect(metricsStart).toBeGreaterThanOrEqual(0);
  expect(metricsEnd).toBeGreaterThan(metricsStart);

  const metricsSource = pageSource.slice(metricsStart, metricsEnd);
  const sprintStart = metricsSource.indexOf(
    sprint === 5 ? "{ sprint: 5," : `\n    sprint: ${sprint},`,
  );
  expect(sprintStart).toBeGreaterThanOrEqual(0);
  const entryStart = metricsSource.lastIndexOf("\n  {", sprintStart);
  expect(entryStart).toBeGreaterThanOrEqual(0);

  // Locate the next top-level object, or the metrics array end for the pending Sprint 5 entry.
  const remainder = metricsSource.slice(entryStart + 1);
  const nextEntryStart = remainder.indexOf("\n  {", 2);
  const entryEnd = nextEntryStart >= 0 ? nextEntryStart : remainder.length;
  expect(entryEnd).toBeGreaterThan(0);
  return remainder.slice(0, entryEnd);
}

function parseMetric(entry: string): SprintMetric {
  const sprint = Number(entry.match(/sprint:\s*(\d+)/)?.[1]);
  const source = entry.match(/source:\s*"([^"]+)"/)?.[1];
  expect(Number.isInteger(sprint)).toBe(true);
  expect(source).toBeTruthy();

  const closeoutMatch = entry.match(
    /closeout:\s*\{([\s\S]*?)\n\s*\}/,
  );
  const closeout = closeoutMatch
    ? Object.fromEntries(
        Array.from(
          closeoutMatch[1].matchAll(
            /(totalWorkItems|completedClosed|carriedForward|completionRate|carryoverRate):\s*(\d+)/g,
          ),
        ).map((match) => [match[1], Number(match[2])]),
      )
    : undefined;

  return {
    sprint,
    source: source as string,
    ...(closeout ? { closeout: closeout as unknown as Closeout } : {}),
    ...(entry.includes("backlogGoalSource: true")
      ? { backlogGoalSource: true }
      : {}),
  };
}

describe("Sprint 4 closeout metrics", () => {
  it("records the exact Sprint 4 closeout entry and reconciles rounded percentages", () => {
    const sprint4 = parseMetric(extractSprintEntry(4));

    expect(sprint4).toEqual({
      sprint: 4,
      source: "Supplied TDC — PI4 Sprint 4 closeout summary",
      closeout: {
        totalWorkItems: 35,
        completedClosed: 32,
        carriedForward: 3,
        completionRate: 91,
        carryoverRate: 9,
      },
    });

    const closeout = sprint4.closeout as Closeout;
    expect(closeout.completedClosed + closeout.carriedForward).toBe(
      closeout.totalWorkItems,
    );
    expect(closeout.completionRate).toBe(
      Math.round((closeout.completedClosed / closeout.totalWorkItems) * 100),
    );
    expect(closeout.carryoverRate).toBe(
      Math.round((closeout.carriedForward / closeout.totalWorkItems) * 100),
    );
    expect(closeout.completionRate + closeout.carryoverRate).toBe(100);
  });

  it("preserves Sprint 2 and Sprint 3 closeouts while leaving Sprint 5 pending", () => {
    expect(parseMetric(extractSprintEntry(2))).toMatchObject({
      sprint: 2,
      source: "Supplied TDC — PI4 Sprint 2 closeout summary",
      closeout: {
        totalWorkItems: 12,
        completedClosed: 9,
        carriedForward: 3,
        completionRate: 75,
        carryoverRate: 25,
      },
    });
    expect(parseMetric(extractSprintEntry(3))).toMatchObject({
      sprint: 3,
      source: "Supplied TDC — PI4 Sprint 3 closeout summary",
      closeout: {
        totalWorkItems: 15,
        completedClosed: 11,
        carriedForward: 4,
        completionRate: 73,
        carryoverRate: 27,
      },
    });
    expect(parseMetric(extractSprintEntry(5))).toEqual({
      sprint: 5,
      source: "Backlog snapshot not yet supplied",
    });
  });

  it("renders closeout values through the shared metric card map with a dynamic next-sprint label", () => {
    const closeoutRendererStart = pageSource.indexOf("{closeout ? (");
    expect(closeoutRendererStart).toBeGreaterThanOrEqual(0);

    const renderer = pageSource.slice(closeoutRendererStart, closeoutRendererStart + 2200);
    expect(renderer).toContain("].map((item) => (");
    expect(renderer).toContain("{ label: `Carried forward to Sprint ${metric.sprint + 1}`");
    expect(renderer).toContain("closeout.totalWorkItems");
    expect(renderer).toContain("closeout.completedClosed");
    expect(renderer).toContain("closeout.carriedForward");
    expect(renderer).toContain("closeout.completionRate");
    expect(renderer).toContain("closeout.carryoverRate");
  });
});
