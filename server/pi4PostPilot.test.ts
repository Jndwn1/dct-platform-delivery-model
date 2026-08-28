import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";

describe("PI4 Post Pilot visibility", () => {
  it("keeps PI4 at zero and excludes it from shared PI completion calculations", () => {
    expect(derivePICompletion(DEFAULT_STATUS).pi4).toEqual({ total: 0, complete: 0, pct: 0 });
  });

  it("lists the five approved PI4 features as visibility-only content in PI Progress", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");

    expect(source).toContain("Planned PI4 Features");
    expect(source).toContain("DCT Penetration Testing & Security Readiness");
    expect(source).toContain("DCT Data Console");
    expect(source).toContain("DCT Deferred Work – Future Enhancements Backlog");
    expect(source).toContain("Manual Custom Client Account Management");
    expect(source).toContain("IMS Translation & Import Layer Design");
    expect(source).toContain("excluded from completion, readiness, denominator, percentage, and KPI calculations");
  });
});
