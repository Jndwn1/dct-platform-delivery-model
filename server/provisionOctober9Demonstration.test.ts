import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Provision October 9 consolidation", () => {
  it("keeps Provision evidence in the unified State and Provision dashboard without a duplicate component", () => {
    const postPilot = readFileSync(
      resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"),
      "utf8"
    );
    const dashboard = readFileSync(
      resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"),
      "utf8"
    );
    const legacyProvisionComponent = resolve(
      process.cwd(),
      "client/src/components/ProvisionOctober9Demonstration.tsx"
    );

    expect(postPilot).toContain("<StateGoSystemPoc />");
    expect(postPilot).not.toContain("ProvisionOctober9Demonstration");
    expect(existsSync(legacyProvisionComponent)).toBe(false);

    expect(dashboard).toContain("State vs. Provision");
    expect(dashboard).toContain("Provision — Bloomberg Tax Provision Workflow");
    expect(dashboard).toContain("Roger Core");
    expect(dashboard).toContain("Return to Provision");
    expect(dashboard).toContain("Deferred Rollforward");
    expect(dashboard).toContain("Federal Summary");
    expect(dashboard).toContain("BTP Export");
    expect(dashboard).toContain("Bloomberg Tax Provision");
    expect(dashboard).toContain("October 9 workflow evidence");
    expect(dashboard).toContain("1 · Prototype demonstrated");
    expect(dashboard).toContain("2 · Demonstrated with dummy data");
    expect(dashboard).toContain("3 · Demonstrated with dummy data");
    expect(dashboard).toContain("4 · Not demonstrated");
    expect(dashboard).toContain("5 · Not demonstrated");
    expect(dashboard).toContain("6 · Not demonstrated");
    expect(dashboard).toContain(
      "Demonstrated path: Roger Core, Return to Provision, and"
    );
    expect(dashboard).toContain("Demonstrated with Dummy Data");
    expect(dashboard).toContain("Prototype Demonstrated");
    expect(dashboard).toContain("Initial Structure Created");
    expect(dashboard).toContain("Not Demonstrated");
    expect(dashboard).toContain("Pending Confirmation");
    expect(dashboard).toContain("Mid-December 2026");
    expect(dashboard).toContain("Mid-January 2027");
    expect(dashboard).toContain("performance testing");
    expect(dashboard).toContain(
      "no automated API transmission or automated results return is assumed"
    );
  });
});
