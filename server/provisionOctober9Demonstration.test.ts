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
    const pageContext = readFileSync(
      resolve(process.cwd(), "client/src/lib/pageContextRegistry.ts"),
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
      "Updated October 9 evidence: Roger Core, Return to"
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
    expect(dashboard).toContain(
      "Provision uses BTP Export and Bloomberg Tax Provision—not the State IMS / GoSystem path."
    );
    expect(dashboard).toMatch(
      /BTP transfer,\s+end-to-end\s+output,\s+and detailed validation evidence remain pending/
    );
    expect(dashboard).toMatch(
      /latest\s+supplied October 9 demonstration-status update/
    );
    expect(dashboard).not.toContain("BTP handoff is a planned Excel export");
    expect(knowledgeBase).toContain(
      "Federal Summary, BTP Excel Export, and Bloomberg Tax Provision calculation are marked **Demonstrated**"
    );
    expect(knowledgeBase).toContain(
      "the BTP handoff uses BTP Export, and no automated API transmission or return path is assumed"
    );
    expect(pageContext).toContain(
      "Provision Federal Summary, BTP Export, and Bloomberg Tax Provision calculation are Demonstrated"
    );
    expect(pageContext).toContain(
      "Provision uses the BTP Export / Bloomberg Tax Provision path"
    );
    expect(dashboard).toContain("Mid-December 2026");
    expect(dashboard).toContain("Mid-January 2027");
    expect(dashboard).toContain(
      "no automated API transmission or automated results return is assumed"
    );
  });
});
