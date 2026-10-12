import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Provision October 9 demonstration", () => {
  it("adds the evidence-bound Provision readiness section beside the existing State POC", () => {
    const postPilot = readFileSync(
      resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"),
      "utf8"
    );
    const provision = readFileSync(
      resolve(
        process.cwd(),
        "client/src/components/ProvisionOctober9Demonstration.tsx"
      ),
      "utf8"
    );
    const statePoc = readFileSync(
      resolve(process.cwd(), "client/src/components/StateGoSystemPoc.tsx"),
      "utf8"
    );
    const pageContext = readFileSync(
      resolve(process.cwd(), "client/src/lib/pageContextRegistry.ts"),
      "utf8"
    );
    const knowledgeBase = readFileSync(
      resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"),
      "utf8"
    );

    expect(postPilot).toContain(
      'import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc"'
    );
    expect(postPilot).not.toContain("ProvisionOctober9Demonstration");
    expect(statePoc).toContain(
      'import { ProvisionOctober9DemonstrationDetails } from "@/components/ProvisionOctober9Demonstration"'
    );
    expect(
      statePoc.indexOf("<ProvisionOctober9DemonstrationDetails />")
    ).toBeGreaterThan(statePoc.indexOf("Next Actions and Action Items"));
    expect(provision).toContain("embedded = false");
    expect(provision).toContain("marginBottom: embedded ? 0");

    expect(provision).toContain(
      "Provision — October 9 Demonstration and Delivery Readiness"
    );
    expect(provision).toContain("October 9, 2026 — Provision Progress");
    expect(provision).toContain(
      "Partially Demonstrated — Initial UI Capabilities Available;"
    );
    expect(provision).toContain(
      "End-to-End Provision Workflow Not Yet Validated"
    );
    expect(provision).toContain(
      "Roger Federal Compliance — First Nine Shared Steps"
    );
    expect(provision).toContain("Return to Provision");
    expect(provision).toContain("Deferred Rollforward");
    expect(provision).toContain("Federal Summary");
    expect(provision).toContain("BTP Export");
    expect(provision).toContain("Demonstrated Using Dummy Data");
    expect(provision).toContain("Placeholder — Not Yet Demonstrated");
    expect(provision).toContain("Initial Structure Created");
    expect(provision).toContain("Dummy Data Only");
    expect(provision).toContain("Pending Alignment");
    expect(provision).toContain("Provision Backend Readiness");
    expect(provision).toContain("Provision Dependencies");
    expect(provision).toContain("Pilot Delivery Timeline");
    expect(provision).toContain("Mid-December 2026");
    expect(provision).toContain("Mid-January 2027");
    expect(provision).toContain("performance testing");
    expect(provision).toContain(
      "not a completed automated integration with Bloomberg Tax Provision"
    );
    expect(provision).toContain("No separate transcript or meeting-notes link");
    expect(provision).toContain("was attached to this update");

    expect(pageContext).toContain("Provision October 9 Demonstration");
    expect(knowledgeBase).toContain(
      "Provision — October 9 Demonstration and Delivery Readiness"
    );
    expect(knowledgeBase).toContain("dummy data");
    expect(knowledgeBase).toContain(
      "automated Bloomberg Tax Provision integration"
    );
  });
});
