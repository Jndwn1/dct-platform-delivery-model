import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Recent Deployments date display", () => {
  it("treats date-only deployment values as a local calendar date instead of UTC midnight", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");

    expect(source).toContain('new Date(`${d.deploymentDate}T12:00:00`)');
    expect(source).not.toContain('new Date(d.deploymentDate).toLocaleDateString');
  });
});
