import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger-aligned State Compliance prototype", () => {
  it("provides the requested filing landing, navigation, and full State workflow", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/StateCompliancePrototype.tsx"), "utf8");
    const routes = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const navigation = readFileSync(resolve(process.cwd(), "client/src/lib/operatingModelNavigation.ts"), "utf8");

    expect(routes).toContain('path="/state-compliance"');
    expect(routes).toContain('location === "/state-compliance"');
    expect(navigation).toContain("State Compliance Prototype");
    expect(page).toContain("Federal Compliance");
    expect(page).toContain("State Compliance");
    expect(page).toContain("Platforms Normandy Inc. — California Combined Return");
    expect(page).toContain("Filing Footprint");
    expect(page).toContain("Apportionment Inputs");
    expect(page).toContain("Apportionment");
    expect(page).toContain("State Modifications");
    expect(page).toContain("Payment Inputs");
    expect(page).toContain("State Tax Control");
    expect(page).toContain("State Tax Accrual");
    expect(page).toContain("Outputs & Tracking");
    expect(page).toContain("State is a Roger compliance workflow.");
  });
});
