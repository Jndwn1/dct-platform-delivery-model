import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADO_FOLLOW_UP_TYPES, buildAdoFollowUpMarkdown, buildAdoWorkItemFormText, createDefaultAdoFollowUpReview, getConfirmedDependencyFollowUps } from "../client/src/lib/askBuddyAdoFollowUps";

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
    ], {
      "D-01-0": {
        draftType: "Bug",
        baReviewNote: "Confirm the receiving team's implementation approach before manual ADO entry.",
        ownerConfirmed: true,
        acceptanceCriteriaReviewed: true,
      },
    });

    expect(markdown).toContain("Draft only");
    expect(markdown).toContain("have not been sent to Azure DevOps");
    expect(markdown).toContain("Requires BA Review");
    expect(markdown).toContain("Not stated in source");
    expect(markdown).toContain("**Draft type (BA selection):** Bug");
    expect(markdown).toContain("Confirm the receiving team's implementation approach");
    expect(markdown).toContain("Owner confirmation checked");
    expect(markdown).toContain("acceptance criteria review checked");
    expect(markdown).toContain("not source evidence or approval");
  });

  it("defaults optional review inputs without inferring an approval", () => {
    expect(ADO_FOLLOW_UP_TYPES).toEqual(["Task", "User Story", "Bug"]);
    expect(createDefaultAdoFollowUpReview()).toEqual({
      draftType: "Task",
      baReviewNote: "",
      ownerConfirmed: false,
      acceptanceCriteriaReviewed: false,
    });
  });

  it("formats a paste-ready Azure DevOps work-item form without inventing missing fields", () => {
    const formText = buildAdoWorkItemFormText([
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
    ], {
      "D-01-0": {
        draftType: "Bug",
        baReviewNote: "Confirm the receiving team's implementation approach before manual ADO entry.",
        ownerConfirmed: true,
        acceptanceCriteriaReviewed: true,
      },
    });

    expect(formText).toContain("AZURE DEVOPS WORK-ITEM FORM DRAFTS");
    expect(formText).toContain("Manual entry only — no work items have been created or sent to Azure DevOps.");
    expect(formText).toContain("WORK ITEM TYPE: Bug");
    expect(formText).toContain("TITLE:\nFollow-up: Confirm State locator and routing context");
    expect(formText).toContain("DESCRIPTION:");
    expect(formText).toContain("Bug Investigation Inputs:");
    expect(formText).toContain("ACCEPTANCE CRITERIA:");
    expect(formText).toContain("BA REVIEW NOTE:");
    expect(formText).toContain("Not stated in source");
    expect(formText).toContain("not source evidence or approval");
  });

  it("provides a response-level action with a guarded empty state and local export options", () => {
    expect(askBuddyPage).toContain("Create ADO Follow-ups");
    expect(askBuddyPage).toContain("No confirmed dependency findings are available to draft");
    expect(askBuddyPage).toContain("Not sent to Azure DevOps");
    expect(askBuddyPage).toContain("Copy ADO Follow-up Drafts");
    expect(askBuddyPage).toContain("Download Markdown");
    expect(askBuddyPage).toContain('anchor.download = "ask-buddy-ado-follow-up-drafts.md"');
    expect(askBuddyPage).toContain("Copy ADO Form Format");
    expect(askBuddyPage).toContain("Download ADO Form Text");
    expect(askBuddyPage).toContain('anchor.download = "ask-buddy-ado-work-item-forms.txt"');
    expect(askBuddyPage).toContain("ADO form format:");
    expect(askBuddyPage).toContain("Draft type");
    expect(askBuddyPage).toContain("BA review note");
    expect(askBuddyPage).toContain("Owner confirmation reviewed");
    expect(askBuddyPage).toContain("Acceptance criteria reviewed");
    expect(askBuddyPage).toContain("BA review inputs are not source evidence or approval.");
    expect(askBuddyPage).not.toContain("trpc.azureDevOps");
  });
});
