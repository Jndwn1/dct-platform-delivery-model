import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Roger-aligned State Compliance prototype", () => {
  it("provides the revised State filer-first landing, TIM controls, and full State workflow", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/StateCompliancePrototype.tsx"), "utf8");
    const routes = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const navigation = readFileSync(resolve(process.cwd(), "client/src/lib/operatingModelNavigation.ts"), "utf8");

    expect(routes).toContain('path="/state-compliance"');
    expect(routes).toContain('location === "/state-compliance"');
    expect(navigation).toContain("State Compliance Prototype");
    expect(page).toContain("Federal Compliance");
    expect(page).toContain("State Compliance");
    expect(page).toContain("Platforms Normandy State Combined Group");
    expect(page).toContain("{filing.state} State {filing.type} Return");
    expect(page).toContain("State filings / form");
    expect(page).toContain('onClick={() => onOpen(filer)} aria-label={`Open State Compliance workflow for ${filing.state} Income Tax Return`}');
    expect(page).not.toContain('href="/state-compliance"');
    expect(page).toContain("Income Tax Return");
    expect(page).toContain('returnStructure: "3-member group"');
    expect(page).toContain('returnStructure: "1 parent entity"');
    expect(page).toContain("Statutory due date");
    expect(page).toContain("Client due date");
    expect(page).toContain("Add filer / filing group");
    expect(page).toContain("Refresh from TIM");
    expect(page).toContain("Show changes from TIM");
    expect(page).toContain("TIM-SOURCED RECORDS REMAIN AUTHORITATIVE IN TIM");
    expect(page).toContain("Apportionment Inputs");
    expect(page).toContain("Apportionment");
    expect(page).toContain("State Modifications");
    expect(page).toContain("Payment Inputs");
    expect(page).toContain("State Tax Control");
    expect(page).toContain("State Tax Accrual");
    expect(page).toContain("Outputs & Tracking");
    expect(page).toContain("Review factor inputs before calculation");
    expect(page).toContain("Weighted apportionment by State");
    expect(page).toContain("Year 1 uses a static common-modification list");
    expect(page).toContain("State and local payment workpaper");
    expect(page).toContain("State taxable income to liability");
    expect(page).toContain("Global State tax accrual calculation");
    expect(page).toContain("This single State Tax workspace will house future outputs and tracking requirements.");
  });

  it("preserves Federal filing content while applying revisions only to State content", () => {
    const page = readFileSync(resolve(process.cwd(), "client/src/pages/StateCompliancePrototype.tsx"), "utf8");

    expect(page).toContain('name: "Platforms Normandy Inc. — PPT", structure: "1120 consolidated", progress: 43, issues: 147');
    expect(page).toContain('name: "Hutchings Yachting Inc. — PPT", structure: "1120", progress: 20, issues: 55');
    expect(page).toContain('state="Existing Roger experience — unchanged"');
    expect(page).not.toContain('"Next statutory due"');
    expect(page).not.toContain('"Next client due"');
  });
});
