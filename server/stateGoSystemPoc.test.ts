import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State GoSystem POC extension", () => {
  it("places the Roger to GoSystem POC beneath the Post Pilot feature inventory without creating a standalone State page", () => {
    const workspace = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");
    const postPilot = readFileSync(resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"), "utf8");
    const poc = readFileSync(resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const knowledgeBase = readFileSync(resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"), "utf8");
    const onboardingKnowledge = knowledgeBase.slice(knowledgeBase.indexOf('"/onboarding"'), knowledgeBase.indexOf('"/post-pilot"'));
    const postPilotKnowledge = knowledgeBase.slice(knowledgeBase.indexOf('"/post-pilot"'), knowledgeBase.indexOf('"/qa-deployment-registry"'));

    expect(workspace).not.toContain('import StateGoSystemPoc from "@/components/StateGoSystemPoc"');
    expect(workspace).not.toContain("<StateGoSystemPoc />");
    expect(workspace).toContain('<ResponsibilityMatrix workstream="state" />');
    expect(workspace).toContain("State — File Drop + GoSystem Calculation System Flow");
    expect(workspace).toContain("DCT → IMS → GoSystem calculation loop");
    expect(postPilot).toContain('import StateGoSystemPoc from "@/components/StateGoSystemPoc"');
    expect(postPilot.indexOf("<StateGoSystemPoc />")).toBeGreaterThan(postPilot.indexOf("Post Pilot feature inventory"));
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
    expect(poc).toContain("Architecture overview — open the full-size viewer");
    expect(poc).toContain('overflowX: "hidden"');
    expect(poc).toContain('maxWidth: "1280px"');
    expect(poc).toContain('width: "100%"');
    expect(poc).not.toContain('width: "2800px"');
    expect(poc).not.toContain("Scroll horizontally to review the full POC architecture");
    expect(poc).toContain("Open readable diagram");
    expect(poc).toContain("Full-size workflow viewer");
    expect(poc).toContain('role="dialog"');
    expect(poc).toContain("diagramZoom");
    expect(poc).toContain("2800 * diagramZoom");
    expect(poc).toContain('maxWidth: "none", width: `${2800 * diagramZoom}px`');
    expect(poc).toContain("Full-size Roger to GoSystem State calculation POC architecture");
    expect(poc).toContain('gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"');
    expect(poc).toContain('minHeight: "230px"');
    expect(poc).toContain("Ownership boundaries in the State calculation POC");
    expect(poc).toContain(">Ownership</span>");

    expect(onboardingKnowledge).not.toContain("Roger → GoSystem POC — State Calculation Integration");
    expect(onboardingKnowledge).not.toContain("What does the Roger to GoSystem State Calculation POC need to prove?");
    expect(postPilotKnowledge).toContain("Post Pilot — Roger → GoSystem POC: State Calculation Integration");
    expect(postPilotKnowledge).toContain("What does the Roger to GoSystem State Calculation POC need to prove?");
    expect(postPilotKnowledge).toContain("Federal → State Deliverable Linkage is a DCT architecture/data-model concern");
  });

  it("keeps the generated POC architecture asset outside the web project public assets", () => {
    expect(existsSync("/home/ubuntu/webdev-static-assets/gosystem-state-poc/gosystem-state-calculation-poc.png")).toBe(true);
  });
});
