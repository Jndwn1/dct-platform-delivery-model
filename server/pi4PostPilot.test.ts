import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";

describe("PI4 Post Pilot visibility", () => {
  it("keeps PI4 excluded from shared MVP completion calculations", () => {
    expect(derivePICompletion(DEFAULT_STATUS).pi4).toEqual({ total: 0, complete: 0, pct: 0 });
  });

  it("shows three source-confirmed PI4 closures and two remaining features without changing MVP KPI scope", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");
    const platformContext = readFileSync(resolve(process.cwd(), "server/platformContext.ts"), "utf8");

    expect(source).toContain("Post Pilot · 3 Closed / 2 Remaining");
    expect(source).toContain("pct: 60");
    expect(source).toContain("Closed PI4 Features");
    expect(source).toContain("Remaining PI4 Features");
    expect(source).toContain("Manual Custom Client Account Management");
    expect(source).toContain("DCT - Data Console");
    expect(source).toContain("DCT - Penetration Testing & Security Readiness");
    expect(source).toContain("DCT Deferred Work – Future Enhancements Backlog");
    expect(source).toContain("IMS Translation & Import Layer Design");
    expect(source).toContain("excluded from MVP completion, readiness, denominator, and KPI calculations");
    expect(platformContext).toContain("3 of 5 source-confirmed features are closed (60%); 2 remain planned");
    expect(platformContext).toContain("PI4 remains excluded from MVP delivery, completion, readiness, denominator, and KPI calculations");
  });
});
