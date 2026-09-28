export type RogerPilotWorkItemState = "Active" | "Review Ready" | "QA Ready" | "New" | "Closed";

export type RogerPilotWorkItem = {
  id: string;
  titleExcerpt: string;
  state: RogerPilotWorkItemState;
  assignedTo: string;
  legacyDctLabel?: boolean;
  candidateTeam: string;
  teamAssessment: string;
};

export type RogerPilotFeature = {
  id: string;
  title: string;
  businessValue: number;
  workItems: readonly RogerPilotWorkItem[];
  deliveryFocus: string;
  ownershipFinding: string;
};

/**
 * Manual evidence baseline only. This is intentionally not a live ADO integration.
 * Text marked with an ellipsis was visibly truncated in the supplied Team Roger backlog capture.
 */
export const ROGER_PILOT_BACKLOG_SOURCE = {
  sprint: "PI4-Sprint 2",
  sourceLabel: "User-supplied Team Roger / Roger TDC ADO backlog capture",
  capturedOn: "September 28, 2026",
  refreshRule: "Replace this baseline only from a newer user-supplied ADO export, screenshot, or reviewed artifact. Do not infer live status.",
} as const;

export const ROGER_PILOT_FEATURES: readonly RogerPilotFeature[] = [
  {
    id: "1441528",
    title: "Finding - 5.6 Security Implementation",
    businessValue: 9,
    deliveryFocus: "Security implementation and controlled access prerequisites for the Roger backlog.",
    ownershipFinding: "The capture shows individual assignees but no explicit owning team. Validate the accountable team and dependency chain before treating this feature as a committed Roger Core deliverable.",
    workItems: [
      {
        id: "1482205",
        titleExcerpt: "[DEVOPS] - AutoMapper license key setup",
        state: "Active",
        assignedTo: "Willis, Morgan",
        candidateTeam: "Roger Core / platform enablement — validate",
        teamAssessment: "The work-item title indicates an enablement prerequisite. The screenshot does not establish a final delivery-team assignment.",
      },
      {
        id: "1472922",
        titleExcerpt: "Data Gateway - Configure Delegated CEM Access to TIM and…",
        state: "Review Ready",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC / Gateway support — validate",
        teamAssessment: "Gateway and access language suggests a shared technical dependency, not a confirmed Roger Core ownership decision.",
      },
    ],
  },
  {
    id: "1441524",
    title: "Finding - 5.2 API and Payload Definitions",
    businessValue: 9,
    deliveryFocus: "Gateway contract definition, data validation, and payload readiness for Roger-facing capabilities.",
    ownershipFinding: "The backlog has one active Gateway item and one new TDC/IMS validation item. The source does not show a formal dependency link or a signed data-contract owner.",
    workItems: [
      {
        id: "1483681",
        titleExcerpt: "Gateway - Use Summary Adjustment Description for Book-t…",
        state: "Active",
        assignedTo: "Sajja, Reshma",
        candidateTeam: "TDC / Gateway support — validate",
        teamAssessment: "The Gateway prefix supports a technical support role; confirm the product-facing owner and API contract approver.",
      },
      {
        id: "1433863",
        titleExcerpt: "Define Data Type & Validation Standards for TDC — IMS — …",
        state: "New",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC / Gateway support — validate",
        teamAssessment: "The title identifies TDC and IMS context. Scope, ownership, and the required contract fields remain unverified in the supplied capture.",
      },
    ],
  },
  {
    id: "1461160",
    title: "User-Defined Nonstandard TDC Codes",
    businessValue: 9,
    deliveryFocus: "Manual client-account support and governed data-creation capability.",
    ownershipFinding: "Both child work items are Review Ready and assigned to Gary Luca. Confirm whether review readiness includes technical acceptance, product approval, and release readiness separately.",
    workItems: [
      {
        id: "1454679",
        titleExcerpt: "Implement Persistent Manual Client Accounts as First-Class …",
        state: "Review Ready",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC data capability — validate",
        teamAssessment: "The parent feature points to TDC codes. Persistence and Roger-facing behavior need explicit ownership confirmation.",
      },
      {
        id: "1450150",
        titleExcerpt: "Data Gateway - Support Creation and Storage of New Acco…",
        state: "Review Ready",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC / Gateway support — validate",
        teamAssessment: "Creation and storage language suggests a shared Gateway/TDC responsibility. No final consumer-team owner appears in the capture.",
      },
    ],
  },
  {
    id: "1490944",
    title: "Data — Defect & Bug Management",
    businessValue: 10,
    deliveryFocus: "Cross-cutting defect, performance-environment, and Roger UI issue triage across the PI4-Sprint 2 backlog.",
    ownershipFinding: "This feature spans legacy DCT-labeled Return Filings items, Roger UI issues, performance-environment issues, and TDC issues. It needs a triage split by current delivery team before it can serve as a clean team backlog.",
    workItems: [
      {
        id: "1488496",
        titleExcerpt: "DCT | Return Filings | Book Adjustment Cleanup Issue Is Not…",
        state: "Active",
        assignedTo: "Kalakonda, Ara…",
        legacyDctLabel: true,
        candidateTeam: "State / Provision triage required",
        teamAssessment: "Legacy DCT label. Return-filings and adjustment language requires State-versus-Provision confirmation before reassignment.",
      },
      {
        id: "1488477",
        titleExcerpt: "DCT | Return Filings | Return Filing Page Counts Each Unma…",
        state: "Active",
        assignedTo: "Sajja, Reshma",
        legacyDctLabel: true,
        candidateTeam: "State / Provision triage required",
        teamAssessment: "Legacy DCT label. The source does not identify whether State or Provision owns the affected filing experience.",
      },
      {
        id: "1463645",
        titleExcerpt: "Roger UI | Book Return Review | Line 22 is missing in Book R…",
        state: "Active",
        assignedTo: "Willis, Morgan",
        candidateTeam: "Roger Core",
        teamAssessment: "Roger UI is explicit in the title. Confirm whether the needed data correction remains with TDC/Gateway support.",
      },
      {
        id: "1488332",
        titleExcerpt: "Perf Env - TDC - Unable to Approve the Tax Adjustment",
        state: "Active",
        assignedTo: "Willis, Morgan",
        candidateTeam: "TDC data capability",
        teamAssessment: "TDC is explicit in the title. Link any practitioner-facing impact back to the responsible Roger Core experience.",
      },
      {
        id: "1488494",
        titleExcerpt: "DCT | Return Filings | TB with Line Mapping Issue Is Not Dis…",
        state: "QA Ready",
        assignedTo: "Kalakonda, Ara…",
        legacyDctLabel: true,
        candidateTeam: "State / Provision triage required",
        teamAssessment: "Legacy DCT label. The current product team must be confirmed before QA ownership and release evidence are assigned.",
      },
      {
        id: "1488497",
        titleExcerpt: "DCT | Return Filings | Reclass Adjustment Cleanup Issue Is N…",
        state: "QA Ready",
        assignedTo: "Kalakonda, Ara…",
        legacyDctLabel: true,
        candidateTeam: "State / Provision triage required",
        teamAssessment: "Legacy DCT label. The title implies adjustment behavior but does not establish State or Provision ownership.",
      },
      {
        id: "1487890",
        titleExcerpt: "Perf Env - Gateway Calls Failure",
        state: "New",
        assignedTo: "Sajja, Reshma",
        candidateTeam: "TDC / Gateway support",
        teamAssessment: "Gateway is explicit in the title. Confirm the consuming Roger capability and escalation owner.",
      },
      {
        id: "1483802",
        titleExcerpt: "Perf Env - TDC - DTUs (100) Reaching 100%",
        state: "New",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC data capability",
        teamAssessment: "TDC capacity issue. Confirm operational ownership and whether it blocks any Sprint 2 Roger validation path.",
      },
      {
        id: "1477411",
        titleExcerpt: "Roger UI | BRR & BTR | Entity name is displayed as \"unknow…",
        state: "Closed",
        assignedTo: "Paderu, Rachana",
        candidateTeam: "Roger Core",
        teamAssessment: "Roger UI is explicit. Closed status is shown only as captured; verify release and regression evidence separately.",
      },
      {
        id: "1477413",
        titleExcerpt: "Taxable Income on Summary page does not match Book-to…",
        state: "Closed",
        assignedTo: "Paderu, Rachana",
        candidateTeam: "Roger Core with TDC support — validate",
        teamAssessment: "The user-facing summary issue may require TDC data support. The source does not show the actual integration boundary.",
      },
      {
        id: "1477373",
        titleExcerpt: "Roger UI | Tax Adjustment | Newly created adjustment recor…",
        state: "Closed",
        assignedTo: "Kalakonda, Ara…",
        candidateTeam: "Roger Core",
        teamAssessment: "Roger UI is explicit. Confirm persistence and data-contract ownership before relying on closed status as end-to-end completion.",
      },
      {
        id: "1492007",
        titleExcerpt: "TDC - Net Income on Book to Tax Review does not match S…",
        state: "Closed",
        assignedTo: "Luca, Gary",
        candidateTeam: "TDC data capability",
        teamAssessment: "TDC is explicit. Confirm downstream Roger display validation where this issue affects a practitioner-facing review.",
      },
    ],
  },
] as const;

export const ROGER_PILOT_WORK_ITEMS = ROGER_PILOT_FEATURES.flatMap((feature) =>
  feature.workItems.map((workItem) => ({ ...workItem, featureId: feature.id, featureTitle: feature.title })),
);

export const ROGER_PILOT_STATE_ORDER: readonly RogerPilotWorkItemState[] = ["Active", "Review Ready", "QA Ready", "New", "Closed"] as const;

export const ROGER_PILOT_BACKLOG_SUMMARY = {
  featureCount: ROGER_PILOT_FEATURES.length,
  workItemCount: ROGER_PILOT_WORK_ITEMS.length,
  legacyDctLabelCount: ROGER_PILOT_WORK_ITEMS.filter((item) => item.legacyDctLabel).length,
  stateCounts: ROGER_PILOT_STATE_ORDER.map((state) => ({
    state,
    count: ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === state).length,
  })),
} as const;
