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
    const knowledgeBase = readFileSync(
      resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"),
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
    expect(dashboard).toContain("4 · Demonstrated");
    expect(dashboard).toContain("5 · Demonstrated");
    expect(dashboard).toContain("6 · Demonstrated");
    expect(dashboard).toContain(
      "Demonstrated path: Roger Core, Return to Provision,"
    );
    expect(dashboard).toContain("Demonstrated with Dummy Data");
    expect(dashboard).toContain("Prototype Demonstrated");
    expect(dashboard).toContain("Initial Structure Created");
    expect(dashboard).toContain("Federal Summary demonstrated");
    expect(dashboard).toContain("BTP Excel Export demonstrated");
    expect(dashboard).toContain(
      "Bloomberg Tax Provision calculation demonstrated"
    );
    expect(dashboard).not.toContain("Federal Summary remained a placeholder");
    expect(dashboard).not.toContain("BTP Excel Export remained a placeholder");
    expect(dashboard).not.toContain(
      "Bloomberg Tax Provision calculation not shown"
    );
    expect(dashboard).toContain("Pending Confirmation");
    expect(knowledgeBase).toContain(
      "Federal Summary, BTP Excel Export, and Bloomberg Tax Provision calculation are marked **Demonstrated**"
    );
    expect(dashboard).toContain("Mid-December 2026");
    expect(dashboard).toContain("Mid-January 2027");
    expect(dashboard).toContain("performance testing");
    expect(dashboard).toContain(
      "no automated API transmission or automated results return is assumed"
    );
  });
});
