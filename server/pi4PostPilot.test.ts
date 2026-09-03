import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";

describe("PI4 Post Pilot delivery", () => {
  it("includes the three confirmed closures and two active PI4 features in PI4 delivery calculations", () => {
    expect(derivePICompletion(DEFAULT_STATUS).pi4).toEqual({ total: 5, complete: 3, pct: 60 });
  });

  it("shows three source-confirmed PI4 closures and two active PI4 features in dashboard and Ask Buddy views", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");
    const platformContext = readFileSync(resolve(process.cwd(), "server/platformContext.ts"), "utf8");

    expect(source).toContain("Post Pilot · ${pi4Complete} Closed / ${pi4Total - pi4Complete} Active");
    expect(source).toContain("pct: pi4Pct");
    expect(source).toContain("Closed PI4 Features");
    expect(source).toContain("Active PI4 Features");
    expect(source).toContain("Manual Custom Client Account Management");
    expect(source).toContain("DCT - Data Console");
    expect(source).toContain("DCT - Penetration Testing & Security Readiness");
    expect(source).toContain("DCT Deferred Work – Future Enhancements Backlog");
    expect(source).toContain("IMS Translation & Import Layer Design");
    expect(source).toContain("${pi4Complete} Closed / ${pi4Total - pi4Complete} Active");
    expect(platformContext).toContain("3 of 5 source-confirmed features are closed (60%); 2 remain active");
    expect(platformContext).toContain("included in the governed MVP delivery population");
  });
});
