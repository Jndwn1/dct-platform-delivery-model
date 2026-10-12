import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State GoSystem POC extension", () => {
  it("keeps the October 9 evidence-bound POC within the Post Pilot page", () => {
    const workspace = readFileSync(
      resolve(
        process.cwd(),
        "client/src/pages/onboarding/DiscoveryWorkspace.tsx"
      ),
      "utf8"
    );
    const postPilot = readFileSync(
      resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"),
      "utf8"
    );
    const poc = readFileSync(
      resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"),
      "utf8"
    );
    const app = readFileSync(
      resolve(process.cwd(), "client/src/App.tsx"),
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
    const postPilotKnowledge = knowledgeBase.slice(
      knowledgeBase.indexOf('"/post-pilot"'),
      knowledgeBase.indexOf('"/qa-deployment-registry"')
    );

    expect(workspace).not.toContain("StateGoSystemPoc");
    expect(postPilot).toContain(
      'import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc"'
    );
    expect(postPilot.indexOf("<StateGoSystemPoc />")).toBeGreaterThan(
      postPilot.indexOf("Post Pilot feature inventory")
    );
    expect(postPilot.indexOf("<StatePocBaDiscoveryPackage />")).toBeGreaterThan(
      postPilot.indexOf("<StateGoSystemPoc />")
    );
    expect(
      postPilot.indexOf("<StateGoSystemPocClosingDetails />")
    ).toBeGreaterThan(postPilot.indexOf("<StatePocBaDiscoveryPackage />"));
    expect(app).not.toContain("/state-poc");

    expect(poc).toContain(
      "Roger → GoSystem POC: State Calculation Integration"
    );
    expect(poc).toContain("October 9, 2026 POC Progress");
    expect(poc).toContain(
      "Partially Demonstrated — End-to-End Integration Not Yet Validated"
    );
    expect(poc).toContain("Last reviewed October 9, 2026");
    expect(poc).toContain("Target End-to-End POC Architecture");
    expect(poc).toContain(
      "Proposed target architecture · Not completed implementation"
    );
    expect(poc).toContain("Roger UI → TDC → IMS → GoSystem");
    expect(poc).toContain("GoSystem → IMS → TDC → Roger UI");
    expect(poc).toContain(
      "October 9 Demonstration — Delivered Capabilities and Outstanding Integration"
    );
    expect(poc).toContain("Partially Demonstrated");
    expect(poc).toContain("Not Demonstrated");
    expect(poc).toContain(
      "Not Demonstrated” does not mean Not Developed or Not Implemented"
    );
    expect(poc).toContain("Capabilities Demonstrated on October 9");
    expect(poc).toContain("greater-than-5% review threshold");
    expect(poc).toContain(
      "They do not prove that GoSystem calculations were executed."
    );
    expect(poc).toContain("IMS and GoSystem Responsibilities");
    expect(poc).toContain("Integration Dependencies and Open Questions");
    expect(poc).toContain("What Still Needs to Be Proven");
    expect(poc).toContain("Pending Confirmation");
    expect(poc).toContain("Risks and Dependencies");
    expect(poc).toContain("They are not characterized as active defects.");
    expect(poc).toContain("Next Actions and Action Items");
    expect(poc).toContain("Pending confirmed commitment and ownership");
    expect(poc).toContain("POC Meeting Transcript (DOCX)");
    expect(poc).toContain("/manus-storage/POC_6327d700.docx");
    expect(poc).not.toContain("Open demonstration notes");

    expect(postPilotKnowledge).toContain("Partially Demonstrated");
    expect(postPilotKnowledge).toContain("Not Demonstrated");
    expect(pageContext).toContain("October 9 POC Status");
  });
});
