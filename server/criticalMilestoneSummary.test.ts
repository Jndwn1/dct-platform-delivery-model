import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Critical milestone summary", () => {
  it("shows the supplied August 28 on-track summary without changing the Sep. 21 target reference", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

    expect(source).toContain("ON TRACK — Critical MVP development is substantially complete. The primary remaining path to Sep 21 is PY/CCH completion, final integration and reconciliation validation, QA, and environment readiness.");
    expect(source).toContain('id="overall-milestone-status"');
    expect(source).toContain("Milestone Outlook");
    expect(source).toContain("MVP_TARGET_DATE_LABEL");
  });
});
