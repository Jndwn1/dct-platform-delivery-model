import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger Screen / Area table layout", () => {
  it("removes QA Readiness and Functional columns while preserving fixed-height detail rows", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/RogerScreenTestingStatus.tsx"), "utf8");

    expect(source).toContain('height: "104px"');
    expect(source).toContain('overflowY: "auto"');
    expect(source).toContain('overflowX: "hidden"');
    expect(source).toContain('minWidth: 0, width: "100%"');
    expect(source).toContain('54px');
    expect(source).not.toContain('minWidth: "1320px"');
    expect(source).toContain('"Delivery / Current Status", "What\'s Not Working / Dependency", "Dev Ready", "QA Ready", "UAT Ready", "Owner / Dependency", "Notes"');
    expect(source).not.toContain('"Delivery / Current Status", "QA Readiness", "Functional", "What\'s Not Working / Dependency"');
  });
});
