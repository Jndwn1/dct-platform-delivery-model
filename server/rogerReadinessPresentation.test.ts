import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger readiness presentation", () => {
  it("shows the user-confirmed completed QA status from the authoritative registry", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(home).toContain("Delivery Completed · ${rogerScreenMetrics.completed} QA Completed");
    expect(home).not.toContain("QA status not stated");
    expect(home).not.toContain("QA Status Not Stated");
  });
});
