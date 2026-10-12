import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("State and Provision delivery-readiness dashboard", () => {
  it("consolidates October 9 evidence in the existing Post Pilot page", () => {
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
    const dashboard = readFileSync(
      resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"),
      "utf8"
    );
    const app = readFileSync(
      resolve(process.cwd(), "client/src/App.tsx"),
      "utf8"
    );

    expect(workspace).not.toContain("StateGoSystemPoc");
    expect(postPilot).toContain(
      'import StateGoSystemPoc from "@/components/StateGoSystemPoc"'
    );
    expect(postPilot).toContain("<StateGoSystemPoc />");
    expect(postPilot).not.toContain("StateGoSystemPocClosingDetails");
    expect(postPilot.indexOf("<StatePocBaDiscoveryPackage />")).toBeGreaterThan(
      postPilot.indexOf("<StateGoSystemPoc />")
    );
    expect(app).not.toContain("/state-poc");

    expect(dashboard).toContain("State & Provision Delivery Readiness");
    expect(dashboard).toContain(
      "Partially Demonstrated — End-to-End Integration"
    );
    expect(dashboard).toContain("Not Yet Validated");
    expect(dashboard).toContain("State vs. Provision");
    expect(dashboard).toContain("Target End-to-End Architecture");
    expect(dashboard).toContain(
      "PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION"
    );
    expect(dashboard).toContain("State — GoSystem Calculation Integration");
    expect(dashboard).toContain("Provision — Bloomberg Tax Provision Workflow");
    expect(dashboard).toContain("Bloomberg Tax Provision");
    expect(dashboard).toContain(
      "Provision does not use GoSystem or the State IMS calculation pathway"
    );
    expect(dashboard).toContain("State & Provision Capability Readiness");
    expect(dashboard).toContain("Integrated Action Tracker");
    expect(dashboard).toContain("Planning Targets Discussed on October 9");
    expect(dashboard).toContain("Evidence Sources");
    expect(dashboard).toContain(
      'eyebrow="3 · PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION"'
    );
    expect(dashboard).toContain('eyebrow="4 · Delivered capabilities');
    expect(dashboard).toContain('eyebrow="5 · Next steps and action items"');
    expect(dashboard).toContain('eyebrow="6 · Pilot delivery milestones"');
    expect(dashboard).toContain(
      'eyebrow="7 · Supporting documents and references"'
    );
    expect(dashboard).not.toContain("Proposed Responsibility Model");
    expect(dashboard).not.toContain("Master Dependency Register");
    expect(dashboard).not.toContain("State & Provision Validation Tracker");
    expect(dashboard).not.toContain("Risk Register");
    expect(dashboard).toContain("Jenniver Dawn Stafford");
    expect(dashboard).toContain("/manus-storage/POC_6327d700.docx");
    expect(dashboard).toContain("No separate source link was");
    expect(dashboard).toContain("attached to this update.");
    expect(dashboard).toContain("Demonstrated with Dummy Data");
    expect(dashboard).toContain("Pending Confirmation");
    expect(dashboard).toMatch(
      /Not Demonstrated<\/strong> does not mean Not\s+Developed\./
    );

    expect(dashboard).not.toContain("IMS and GoSystem Responsibilities");
    expect(dashboard).not.toContain(
      "Integration Dependencies and Open Questions"
    );
    expect(dashboard).not.toContain("What Still Needs to Be Proven");
    expect(dashboard).not.toContain("Risks and Dependencies");
    expect(dashboard).not.toContain("Next Actions and Action Items");
  });
});
