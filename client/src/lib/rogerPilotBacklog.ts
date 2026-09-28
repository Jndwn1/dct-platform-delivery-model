export type RogerPilotWorkItemState = "Active" | "Review Ready" | "QA Ready" | "New" | "Closed";
export type RogerPilotFeatureState = "Requirements" | "New" | "Active" | "On Hold";
export type RogerPilotChildEvidence = "Captured child rows" | "Child indicator shown";

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
  featureState: RogerPilotFeatureState;
  businessValue?: number;
  childEvidence: RogerPilotChildEvidence;
  workItems: readonly RogerPilotWorkItem[];
  candidateWorkstream: string;
  deliveryFocus: string;
  ownershipFinding: string;
};

/**
 * Manual evidence baseline only. This is intentionally not a live ADO integration.
 * Titles marked with an ellipsis were visibly truncated in the supplied Team Roger backlog captures.
 * A visible hierarchy marker identifies a feature for review; it does not disclose the number or state of its child items.
 */
export const ROGER_PILOT_BACKLOG_SOURCE = {
  sprint: "PI4-Sprint 2",
  sourceLabel: "User-supplied Team Roger / Roger TDC PI4-Sprint 2 backlog screenshots",
  capturedOn: "September 28, 2026",
  totalListedFeatureCount: 91,
  featureWithChildIndicatorCount: 25,
  detailedChildFeatureCount: 4,
  coverageNote: "The supplied feature-list screenshots show 91 parent features. Twenty-five display a visible hierarchy marker and are reviewed below; child rows were expanded for only four of those features.",
  refreshRule: "Replace this evidence baseline only from a newer user-supplied ADO export, screenshot, or reviewed artifact. Confirm every feature with a visible hierarchy marker and obtain child rows before asserting child-level scope, ownership, status, or readiness. Do not infer live status.",
} as const;

const NO_CHILD_ROWS: readonly RogerPilotWorkItem[] = [];

export const ROGER_PILOT_FEATURES: readonly RogerPilotFeature[] = [
  {
    id: "1462484",
    title: "Entity mappings",
    featureState: "Requirements",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Cross-workstream mapping — validate",
    deliveryFocus: "Entity mapping scope and governed cross-system identification.",
    ownershipFinding: "The parent title indicates mapping scope. Child rows and accountable State, Provision, Roger, and TDC ownership were not supplied.",
  },
  {
    id: "1470472",
    title: "Non-Legal Entities (tax-only entities)",
    featureState: "Requirements",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State / Provision / entity mapping — validate",
    deliveryFocus: "Tax-only entity treatment and related practitioner workflow.",
    ownershipFinding: "The feature requires State and Provision impact confirmation before capacity or delivery ownership is assigned.",
  },
  {
    id: "1461160",
    title: "User-Defined Nonstandard TDC Codes",
    featureState: "On Hold",
    businessValue: 9,
    childEvidence: "Captured child rows",
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
    candidateWorkstream: "TDC data capability — validate",
    deliveryFocus: "Manual client-account support and governed data-creation capability.",
    ownershipFinding: "Both captured child work items are Review Ready and assigned to Gary Luca. Confirm whether review readiness includes technical acceptance, product approval, and release readiness separately.",
  },
  {
    id: "1475360",
    title: "Roll-forward (prior yr TWB)",
    featureState: "Requirements",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Prior-year / Provision workflow — validate",
    deliveryFocus: "Prior-year roll-forward capability and related source-data treatment.",
    ownershipFinding: "The title signals prior-year scope; child data, source-system ownership, and Federal/State/Provision impact are not visible.",
  },
  {
    id: "1458058",
    title: "M-3 Reporting",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core / Federal reporting — validate",
    deliveryFocus: "M-3 reporting capability in the practitioner experience.",
    ownershipFinding: "Confirm the reporting consumer, calculation/data source, and whether child items cross the TDC/Roger boundary.",
  },
  {
    id: "1486001",
    title: "Line Mapping and Trial Balance",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core / mapping foundation — validate",
    deliveryFocus: "Line-mapping and trial-balance workflow foundation.",
    ownershipFinding: "Map the feature to its data source, mapping contract, and affected State/Provision/Federal journeys before assignment.",
  },
  {
    id: "1486014",
    title: "Book Adjustments",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core with TDC support — validate",
    deliveryFocus: "Book-adjustment capture, review, and downstream calculation behavior.",
    ownershipFinding: "Child scope is not visible; validate whether the feature affects State, Provision, Federal, and the Book-to-Tax service boundary.",
  },
  {
    id: "1486197",
    title: "Form 1120 and Sign Off",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Federal workflow / Roger Core — validate",
    deliveryFocus: "Federal Form 1120 practitioner workflow and sign-off experience.",
    ownershipFinding: "Confirm product ownership, sign-off governance, and whether child items depend on shared data or approval services.",
  },
  {
    id: "1486189",
    title: "Tax Adjustments",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core with TDC support — validate",
    deliveryFocus: "Tax-adjustment workflow and governed downstream outputs.",
    ownershipFinding: "Review child records for State, Provision, and Federal reach plus persistence and contract ownership.",
  },
  {
    id: "1451927",
    title: "Roger State Taxable Income MVP — State Filing Footprint",
    featureState: "Active",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State — validate",
    deliveryFocus: "State filing-footprint capability for the Roger State taxable-income experience.",
    ownershipFinding: "State intent is explicit; validate jurisdictional scope, upstream data sources, and child-story owners.",
  },
  {
    id: "1471427",
    title: "Roger State Taxable Income MVP — Current-Year State Data…",
    featureState: "Active",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State / TDC data capability — validate",
    deliveryFocus: "Current-year State data capability for the Roger taxable-income workflow.",
    ownershipFinding: "Confirm the State consumer, TDC data producer, source contract, and child-story delivery split.",
  },
  {
    id: "1464702",
    title: "Roger State Taxable Income MVP — Apportionment Manag…",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State — validate",
    deliveryFocus: "State apportionment-management capability.",
    ownershipFinding: "The feature title indicates State scope; confirm tax rules, state taxonomy alignment, and child-level dependencies.",
  },
  {
    id: "1471425",
    title: "Roger State Taxable Income MVP — Prior-Year State Data…",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State / prior-year data — validate",
    deliveryFocus: "Prior-year State data capability for the taxable-income workflow.",
    ownershipFinding: "Validate prior-year source, ingestion, lineage, and relationship to existing Provision and State work before assignment.",
  },
  {
    id: "1441524",
    title: "Finding - 5.2 API and Payload Definitions",
    featureState: "New",
    businessValue: 9,
    childEvidence: "Captured child rows",
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
    candidateWorkstream: "TDC / Gateway support — validate",
    deliveryFocus: "Gateway contract definition, data validation, and payload readiness for Roger-facing capabilities.",
    ownershipFinding: "The captured backlog has one Active Gateway item and one New TDC/IMS validation item. The source does not show a formal dependency link or signed data-contract owner.",
  },
  {
    id: "1441528",
    title: "Finding - 5.6 Security Implementation",
    featureState: "New",
    businessValue: 9,
    childEvidence: "Captured child rows",
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
    candidateWorkstream: "Platform security / TDC Gateway — validate",
    deliveryFocus: "Security implementation and controlled access prerequisites for the Roger backlog.",
    ownershipFinding: "The capture shows individual assignees but no explicit owning team. Validate the accountable team and dependency chain before treating this feature as a committed Roger Core deliverable.",
  },
  {
    id: "1472793",
    title: "Finding - 5.7 Penetration Testing & Security Readiness",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Platform security / release readiness — validate",
    deliveryFocus: "Penetration-testing and security-readiness scope.",
    ownershipFinding: "Confirm security accountable owner, test evidence, remediation path, and release gates from the child records.",
  },
  {
    id: "1489784",
    title: "Set Up Dev/QA Environment for Roger Platform",
    featureState: "Active",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Platform environment / QA — validate",
    deliveryFocus: "Development and QA environment readiness for Roger.",
    ownershipFinding: "The feature is Active; validate environment owner, deployment prerequisites, and the child work that establishes readiness.",
  },
  {
    id: "1486002",
    title: "Roger State Taxable Income MVP — State Data Collection a…",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State / TDC data capability — validate",
    deliveryFocus: "State data collection and related taxable-income workflow.",
    ownershipFinding: "Confirm inbound source, data contract, State ownership, and child-level sequence before planning.",
  },
  {
    id: "1486003",
    title: "Roger State Taxable Income MVP — State Calculation Revie…",
    featureState: "On Hold",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "State / calculation review — validate",
    deliveryFocus: "State calculation review capability.",
    ownershipFinding: "On Hold state is captured at feature level. Confirm hold reason, unblock criteria, impacted jurisdictions, and child ownership.",
  },
  {
    id: "1441539",
    title: "Sub Cons. and Div Cons. Views and Data Aggregations",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core / data aggregation — validate",
    deliveryFocus: "Consolidated and divisional views plus related data aggregation.",
    ownershipFinding: "A child indicator is displayed in the left hierarchy column. Confirm user journey, aggregation source, service boundary, and child deliverable scope before assignment.",
  },
  {
    id: "1441546",
    title: "(ID=11) Book to Tax Reconciliation",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core with TDC support — validate",
    deliveryFocus: "Book-to-Tax reconciliation capability.",
    ownershipFinding: "Validate calculation owner, data persistence boundary, and the affected Federal, State, and Provision journeys.",
  },
  {
    id: "1476344",
    title: "Package 1 — Return-to-Provision",
    featureState: "Active",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Provision — validate",
    deliveryFocus: "Return-to-Provision package and governed practitioner workflow.",
    ownershipFinding: "Provision intent is explicit; confirm required Federal/State return inputs, output contract, and child-story ownership.",
  },
  {
    id: "1476349",
    title: "Package 2 — Deferred Rollforward",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Provision — validate",
    deliveryFocus: "Deferred rollforward package.",
    ownershipFinding: "Confirm provision data foundations, prior-year requirements, calculation rules, and downstream outputs from the child rows.",
  },
  {
    id: "1490944",
    title: "Data — Defect & Bug Management",
    featureState: "New",
    businessValue: 10,
    childEvidence: "Captured child rows",
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
    candidateWorkstream: "Cross-team defect triage — validate",
    deliveryFocus: "Cross-cutting defect, performance-environment, and Roger UI issue triage across the PI4-Sprint 2 backlog.",
    ownershipFinding: "This feature spans legacy DCT-labeled Return Filings items, Roger UI issues, performance-environment issues, and TDC issues. It needs a triage split by current delivery team before it can serve as a clean team backlog.",
  },
  {
    id: "1497107",
    title: "Return screen",
    featureState: "New",
    childEvidence: "Child indicator shown",
    workItems: NO_CHILD_ROWS,
    candidateWorkstream: "Roger Core / return workflow — validate",
    deliveryFocus: "Return-screen experience.",
    ownershipFinding: "Confirm the related return type, State/Provision/Federal journey, dependent data, and child-level ownership before assignment.",
  },
] as const;

export const ROGER_PILOT_FEATURES_WITH_CHILD_DETAIL = ROGER_PILOT_FEATURES.filter(
  (feature) => feature.childEvidence === "Captured child rows",
);

export const ROGER_PILOT_WORK_ITEMS = ROGER_PILOT_FEATURES.flatMap((feature) =>
  feature.workItems.map((workItem) => ({ ...workItem, featureId: feature.id, featureTitle: feature.title })),
);

export const ROGER_PILOT_WORK_ITEM_STATE_ORDER: readonly RogerPilotWorkItemState[] = ["Active", "Review Ready", "QA Ready", "New", "Closed"] as const;
export const ROGER_PILOT_FEATURE_STATE_ORDER: readonly RogerPilotFeatureState[] = ["Requirements", "New", "Active", "On Hold"] as const;

export const ROGER_PILOT_BACKLOG_SUMMARY = {
  totalListedFeatureCount: ROGER_PILOT_BACKLOG_SOURCE.totalListedFeatureCount,
  featureWithChildIndicatorCount: ROGER_PILOT_FEATURES.length,
  featureWithChildDetailCount: ROGER_PILOT_FEATURES_WITH_CHILD_DETAIL.length,
  childDetailPendingCount: ROGER_PILOT_FEATURES.filter((feature) => feature.childEvidence === "Child indicator shown").length,
  workItemCount: ROGER_PILOT_WORK_ITEMS.length,
  legacyDctLabelCount: ROGER_PILOT_WORK_ITEMS.filter((item) => item.legacyDctLabel).length,
  featureStateCounts: ROGER_PILOT_FEATURE_STATE_ORDER.map((state) => ({
    state,
    count: ROGER_PILOT_FEATURES.filter((feature) => feature.featureState === state).length,
  })),
  workItemStateCounts: ROGER_PILOT_WORK_ITEM_STATE_ORDER.map((state) => ({
    state,
    count: ROGER_PILOT_WORK_ITEMS.filter((item) => item.state === state).length,
  })),
} as const;
