import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";

describe("PI4 Post Pilot delivery", () => {
  it("keeps PI4 at zero delivery progress because planning items are visibility-only", () => {
    expect(derivePICompletion(DEFAULT_STATUS).pi4).toEqual({ total: 0, complete: 0, pct: 0 });
    expect(DEFAULT_STATUS["pi4-manual-client-account-management"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-data-console"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-security-readiness"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-deferred-work"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-ims-translation"]).toBe("Not Started");
  });

  it("shows the five PI4 planning items without closed or active classifications", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");
    const planningModel = readFileSync(resolve(process.cwd(), "client/src/contexts/BatchStatusContext.tsx"), "utf8");
    const platformContext = readFileSync(resolve(process.cwd(), "server/platformContext.ts"), "utf8");

    expect(source).toContain("Post Pilot · Planning Visibility Only");
    expect(source).toContain("pct: 0");
    expect(source).toContain("Planned PI4 Features");
    expect(source).not.toContain("Closed PI4 Features");
    expect(source).not.toContain("Active PI4 Features");
    expect(source).toContain("plannedFeatures: PI4_PLANNED_FEATURES");
    expect(planningModel).toContain('"pi4-manual-client-account-management": "Manual Custom Client Account Management"');
    expect(planningModel).toContain('"pi4-data-console": "DCT - Data Console"');
    expect(planningModel).toContain('"pi4-security-readiness": "DCT - Penetration Testing & Security Readiness"');
    expect(planningModel).toContain('"pi4-deferred-work": "DCT Deferred Work – Future Enhancements Backlog"');
    expect(planningModel).toContain('"pi4-ims-translation": "IMS Translation & Import Layer Design"');
    expect(source).toContain("excluded from all PI4 and MVP delivery metrics");
    expect(platformContext).toContain("0 closed, 0 active, and 0% delivery progress");
    expect(platformContext).toContain("excluded from all PI4 and MVP delivery metrics");
  });
});
