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
  carryForwardTo?: string;
  reportingBasis?: string;
  closeout?: Closeout;
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
  const sprintStart = metricsSource.indexOf(`\n    sprint: ${sprint},`);
  expect(sprintStart).toBeGreaterThanOrEqual(0);
  const entryStart = metricsSource.lastIndexOf("\n  {", sprintStart);
  expect(entryStart).toBeGreaterThanOrEqual(0);

  const remainder = metricsSource.slice(entryStart + 1);
  const nextEntryStart = remainder.indexOf("\n  {", 2);
  const entryEnd = nextEntryStart >= 0 ? nextEntryStart : remainder.length;
  expect(entryEnd).toBeGreaterThan(0);
  return remainder.slice(0, entryEnd);
}

function parseMetric(entry: string): SprintMetric {
  const sprint = Number(entry.match(/sprint:\s*(\d+)/)?.[1]);
  const source = entry.match(/source:\s*"([^"]+)"/)?.[1];
  const carryForwardTo = entry.match(/carryForwardTo:\s*"([^"]+)"/)?.[1];
  const reportingBasis = entry.match(/reportingBasis:\s*"([^"]+)"/)?.[1];
  expect(Number.isInteger(sprint)).toBe(true);
  expect(source).toBeTruthy();

  const closeoutMatch = entry.match(/closeout:\s*\{([\s\S]*?)\n\s*\}/);
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
    ...(carryForwardTo ? { carryForwardTo } : {}),
    ...(reportingBasis ? { reportingBasis } : {}),
    ...(closeout ? { closeout: closeout as unknown as Closeout } : {}),
  };
}

describe("Sprint 5 closeout metrics", () => {
  it("records the exact Sprint 5 closeout, explicit PI5 target, and reporting basis", () => {
    const sprint5 = parseMetric(extractSprintEntry(5));

    expect(sprint5).toEqual({
      sprint: 5,
      source: "Supplied TDC — PI4 Sprint 5 closeout summary",
      carryForwardTo: "PI5 Sprint 1",
      reportingBasis:
        "November 17, 2026 closeout assumption: Awaiting and Resolved items counted as completed; child items excluded.",
      closeout: {
        totalWorkItems: 46,
        completedClosed: 44,
        carriedForward: 2,
        completionRate: 96,
        carryoverRate: 4,
      },
    });

    const closeout = sprint5.closeout as Closeout;
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

  it("preserves the Sprint 2, Sprint 3, and Sprint 4 snapshots", () => {
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
    expect(parseMetric(extractSprintEntry(4))).toMatchObject({
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
  });

  it("uses the shared metric card renderer with explicit target fallback and visible qualifiers", () => {
    const rendererStart = pageSource.indexOf("{closeout ? (");
    expect(rendererStart).toBeGreaterThanOrEqual(0);
    const renderer = pageSource.slice(rendererStart, rendererStart + 2400);

    expect(renderer).toContain("].map((item) => (");
    expect(renderer).toContain("metric.carryForwardTo ? `Carried forward to ${metric.carryForwardTo}` : `Carried forward to Sprint ${metric.sprint + 1}`");
    expect(renderer).toContain('Source: {metric.source}');
    expect(renderer).toContain("metric.reportingBasis &&");
    expect(renderer).toContain('background: "#ffffff"');
    expect(renderer).toContain('borderLeft: `3px solid ${item.color}`');
    expect(renderer).toContain("closeout.totalWorkItems");
    expect(renderer).toContain("closeout.completedClosed");
    expect(renderer).toContain("closeout.carriedForward");
    expect(renderer).toContain("closeout.completionRate");
    expect(renderer).toContain("closeout.carryoverRate");

    expect(pageSource).toContain('carryForwardTo: "PI5 Sprint 1"');
    expect(pageSource).not.toContain('carryForwardTo: "PI4 Sprint 6"');
  });
});
