import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger readiness presentation", () => {
  it("does not infer QA readiness when the authoritative update supplies delivery status and readiness dates only", () => {
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(home).toContain("QA status not stated");
    expect(home).toContain("QA Status Not Stated");
    expect(home).not.toContain('sub: `${rogerScreenMetrics.ready} Ready · ${rogerScreenMetrics.partial} Partial · ${rogerScreenMetrics.notReady} Not Ready`');
  });
});
