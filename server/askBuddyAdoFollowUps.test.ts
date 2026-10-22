import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildAdoFollowUpMarkdown, getConfirmedDependencyFollowUps } from "../client/src/lib/askBuddyAdoFollowUps";

const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");

describe("Ask Buddy review-only ADO follow-up drafts", () => {
  it("creates a draft only from an explicitly Confirmed dependency row", () => {
    const answer = [
      "### 3. Cross-Team Dependencies",
      "| ID | Dependency | Required Input / Decision | Responsible Team | Affected ADO Story | Impact if Unresolved | Status |",
      "",
      "| --- | --- | --- | --- | --- | --- | --- |",
      "",
      "| D-01 | Confirm State locator and routing context | Approved locator and routing fields | IMS | 1514276 | Downstream mapping cannot proceed | Confirmed |",
    ].join("\n");

    const drafts = getConfirmedDependencyFollowUps(answer);

    expect(drafts).toEqual([
      expect.objectContaining({
        id: "D-01",
        draftTitle: "Follow-up: Confirm State locator and routing context",
        confirmedEvidence: "Confirm State locator and routing context",
        explicitOwnerOrTeam: "IMS",
        requiredInputOrDecision: "Approved locator and routing fields",
        affectedAdoReference: "1514276",
        impactIfUnresolved: "Downstream mapping cannot proceed",
        adoStatus: "Draft — Requires BA Review",
      }),
    ]);
  });

  it("excludes every non-confirmed or qualified-confirmation status", () => {
    const answer = [
      "| ID | Dependency | Required Input / Decision | Responsible Team | Affected ADO Story | Impact if Unresolved | Status |",
      "| --- | --- | --- | --- | --- | --- |",
      "| D-01 | Open dependency | Needed input | IMS | Not stated | Delivery impact | Open |",
      "| D-02 | Proposed dependency | Needed input | State | Not stated | Delivery impact | Proposed |",
      "| D-03 | Requires confirmation | Needed input | TDC | Not stated | Delivery impact | Requires Confirmation |",
      "| D-04 | Reference only | Needed input | Roger | Not stated | Delivery impact | Reference Only |",
      "| D-05 | Candidate dependency | Needed input | GoSystem | Not stated | Delivery impact | Candidate |",
      "| D-06 | Pending review | Needed input | IMS | Not stated | Delivery impact | Confirmed — Pending Review |",
    ].join("\n");

    expect(getConfirmedDependencyFollowUps(answer)).toEqual([]);
  });

  it("retains unknown attributes as Not stated in source instead of inferring them", () => {
    const answer = [
      "| Dependency | Status |",
      "| --- | --- |",
      "| Publish the agreed mapping decision | Confirmed |",
    ].join("\n");

    const [draft] = getConfirmedDependencyFollowUps(answer);

    expect(draft).toMatchObject({
      explicitOwnerOrTeam: "Not stated in source",
      requiredInputOrDecision: "Not stated in source",
      affectedAdoReference: "Not stated in source",
      impactIfUnresolved: "Not stated in source",
      nextAction: "Not stated in source",
    });
  });

  it("formats a review package that explicitly disclaims a live Azure DevOps action", () => {
    const markdown = buildAdoFollowUpMarkdown([
      {
        id: "D-01",
        draftTitle: "Follow-up: Confirm State locator and routing context",
        confirmedEvidence: "Confirm State locator and routing context",
        explicitOwnerOrTeam: "IMS",
        requiredInputOrDecision: "Approved locator and routing fields",
        affectedAdoReference: "1514276",
        impactIfUnresolved: "Downstream mapping cannot proceed",
        nextAction: "Not stated in source",
        adoStatus: "Draft — Requires BA Review",
      },
    ]);

    expect(markdown).toContain("Draft only");
    expect(markdown).toContain("have not been sent to Azure DevOps");
    expect(markdown).toContain("Requires BA Review");
    expect(markdown).toContain("Not stated in source");
  });

  it("provides a response-level action with a guarded empty state and local export options", () => {
    expect(askBuddyPage).toContain("Create ADO Follow-ups");
    expect(askBuddyPage).toContain("No confirmed dependency findings are available to draft");
    expect(askBuddyPage).toContain("Not sent to Azure DevOps");
    expect(askBuddyPage).toContain("Copy ADO Follow-up Drafts");
    expect(askBuddyPage).toContain("Download Markdown");
    expect(askBuddyPage).toContain('anchor.download = "ask-buddy-ado-follow-up-drafts.md"');
    expect(askBuddyPage).not.toContain("trpc.azureDevOps");
  });
});
