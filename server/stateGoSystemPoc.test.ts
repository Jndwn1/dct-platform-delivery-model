import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State GoSystem POC extension", () => {
  it("places the streamlined Roger to GoSystem POC beneath the Post Pilot feature inventory", () => {
    const workspace = readFileSync(resolve(process.cwd(), "client/src/pages/onboarding/DiscoveryWorkspace.tsx"), "utf8");
    const postPilot = readFileSync(resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"), "utf8");
    const poc = readFileSync(resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const knowledgeBase = readFileSync(resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"), "utf8");
    const pageContext = readFileSync(resolve(process.cwd(), "client/src/lib/pageContextRegistry.ts"), "utf8");
    const onboardingKnowledge = knowledgeBase.slice(knowledgeBase.indexOf('"/onboarding"'), knowledgeBase.indexOf('"/post-pilot"'));
    const postPilotKnowledge = knowledgeBase.slice(knowledgeBase.indexOf('"/post-pilot"'), knowledgeBase.indexOf('"/qa-deployment-registry"'));

    expect(workspace).not.toContain('import StateGoSystemPoc from "@/components/StateGoSystemPoc"');
    expect(workspace).not.toContain("<StateGoSystemPoc />");
    expect(postPilot).toContain('import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc"');
    expect(postPilot.indexOf("<StateGoSystemPoc />")).toBeGreaterThan(postPilot.indexOf("Post Pilot feature inventory"));
    expect(postPilot.indexOf("<StatePocBaDiscoveryPackage />")).toBeGreaterThan(postPilot.indexOf("<StateGoSystemPoc />"));
    expect(postPilot.indexOf("<StateGoSystemPocClosingDetails />")).toBeGreaterThan(postPilot.indexOf("<StatePocBaDiscoveryPackage />"));
    expect(poc).toContain("export function StateGoSystemPocClosingDetails");
    expect(app).not.toContain("StateGoSystemPoc");
    expect(app).not.toContain("/state-poc");

    expect(poc).toContain("Roger → GoSystem POC: State Calculation Integration");
    expect(poc).toContain("POC Meeting Transcript (DOCX)");
    expect(poc).toContain('/manus-storage/POC_6327d700.docx');
    expect(poc).toContain("Architecture summary:");
    expect(poc).toContain("Minimum POC Input Package for DCT");
    expect(poc).toContain("Filing Context");
    expect(poc).toContain("Federal Starting Context");
    expect(poc).toContain("Calculation Configuration");
    expect(poc).toContain("Representative Calculation Inputs");
    expect(poc).toContain("Governance & Correlation Metadata");
    expect(poc).toContain("Representative POC Scenario");
    expect(poc).toContain("BA Requirement for the POC");
    expect(poc).toContain("Full Target State Calculation Package");
    expect(poc).toContain("Federal → State Deliverable Linkage");
    expect(poc).toContain("POC Open Questions");
    expect(poc).toContain("POC Success Criteria");
    expect(poc).not.toContain("Minimum POC State Calculation Flow");
    expect(poc).not.toContain('/manus-storage/minimum-poc-state-calculation-flow_00034465.png');
    expect(poc).not.toContain("Open readable POC flow");
    expect(poc).not.toContain("Full-size POC flow viewer");

    expect(poc).not.toContain("Transcript-derived architecture overview");
    expect(poc).not.toContain("POC Proof Path");
    expect(poc).not.toContain("GoSystem as the downstream State calculation system");
    expect(poc).not.toContain("Open readable diagram");
    expect(poc).not.toContain("Ownership boundaries in the State calculation POC");
    expect(poc).not.toContain("Full Target Data Movement");
    expect(poc).not.toContain("Taxonomy Expectations");
    expect(poc).not.toContain("BA Deliverables for Taxonomy & POC");
    expect(poc).not.toContain("gosystem-state-calculation-poc_ddd0591b.png");
    expect(poc).not.toContain("POC — Required Now");
    expect(poc).not.toContain("Future-State Expansion");

    expect(onboardingKnowledge).not.toContain("Roger → GoSystem POC — State Calculation Integration");
    expect(postPilotKnowledge).toContain("Post Pilot — Roger → GoSystem POC: State Calculation Integration");
    expect(postPilotKnowledge).toContain("Minimum POC input package for DCT");
    expect(pageContext).toContain("POC Meeting Transcript Source");
    expect(pageContext).toContain("Minimum POC Input Package");
  });

});
