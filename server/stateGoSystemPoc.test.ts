import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State GoSystem POC extension", () => {
  it("adds the Roger to GoSystem POC to the existing State workspace without creating a standalone State page", () => {
    const workspace = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");
    const poc = readFileSync(resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const knowledgeBase = readFileSync(resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"), "utf8");

    expect(workspace).toContain('import StateGoSystemPoc from "@/components/StateGoSystemPoc"');
    expect(workspace).toContain("<StateGoSystemPoc />");
    expect(workspace).toContain('<ResponsibilityMatrix workstream="state" />');
    expect(workspace).toContain("State — File Drop + GoSystem Calculation System Flow");
    expect(workspace).toContain("DCT → IMS → GoSystem calculation loop");
    expect(app).not.toContain("StateGoSystemPoc");
    expect(app).not.toContain("/state-poc");

    expect(poc).toContain("Roger → GoSystem POC: State Calculation Integration");
    expect(poc).toContain("proof-of-feasibility");
    expect(poc).toContain("POC focus");
    expect(poc).toContain("retrieving structured GoSystem calculation outputs");
    expect(poc).toContain("GoSystem as the downstream State calculation system");
    expect(poc).toContain("Roger → DCT → Taxonomy Mapping → IMS → GoSystem");
    expect(poc).toContain("GoSystem → IMS → Taxonomy Mapping → DCT → Roger");
    expect(poc).toContain("State Calculation Input Package");
    expect(poc).toContain("State Calculation Review Package");
    expect(poc).toContain("Roger → GoSystem: Proposed State Calculation Package");
    expect(poc).toContain("Inbound — Roger/DCT → GoSystem");
    expect(poc).toContain("Outbound — GoSystem → DCT/Roger");
    expect(poc).toContain("Taxonomy Expectations");
    expect(poc).toContain("BA Deliverables for Taxonomy & POC");
    expect(poc).toContain("Federal → State Deliverable Linkage");
    expect(poc).toContain("POC Open Questions");
    expect(poc).toContain("POC Success Criteria");
    expect(poc).toContain("Governed persistence, retrieval, and integration support.");
    expect(poc).toContain("State tax calculation engine.");
    expect(poc).toContain("/manus-storage/gosystem-state-calculation-poc_ddd0591b.png");

    expect(knowledgeBase).toContain("Roger → GoSystem POC — State Calculation Integration");
    expect(knowledgeBase).toContain("What does the Roger to GoSystem State Calculation POC need to prove?");
    expect(knowledgeBase).toContain("Federal → State Deliverable Linkage is a DCT architecture/data-model concern");
  });

  it("keeps the generated POC architecture asset outside the web project public assets", () => {
    expect(existsSync("/home/ubuntu/webdev-static-assets/gosystem-state-poc/gosystem-state-calculation-poc.png")).toBe(true);
  });
});
