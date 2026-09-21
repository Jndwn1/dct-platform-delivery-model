export type Pi4Workstream = "DCT Platform" | "State" | "Provision";
export type Pi4PlanningStatus = "Planning visibility" | "Refinement required";

export type Pi4Story = {
  id: string;
  type: "Tech Story" | "User Story";
  title: string;
  sprint: "Unassigned";
  planningStatus: Pi4PlanningStatus;
  note?: string;
};

export type Pi4Feature = {
  id: string;
  workstream: Pi4Workstream;
  title: string;
  stories: Pi4Story[];
};

/**
 * PI4 planning reference only. Story-to-feature mappings originate from the
 * supplied planning snapshots. They are intentionally excluded from MVP and
 * PI4 delivery calculations until a sprint baseline is approved.
 */
export const PI4_FEATURE_STORY_MAP: Pi4Feature[] = [
  {
    id: "1441524",
    workstream: "DCT Platform",
    title: "Finding - 5.2 API and Payload Definitions",
    stories: [
      {
        id: "1433863",
        type: "Tech Story",
        title: "Define Data Type & Validation Standards for TDC → IMS → GoSystem Translation",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
  {
    id: "1461160",
    workstream: "DCT Platform",
    title: "User-Defined Nonstandard TDC Codes",
    stories: [
      {
        id: "1450150",
        type: "Tech Story",
        title: "Data Gateway - Support Creation and Storage of New Accounts for Book and Reclass Adjustments",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
      {
        id: "1454679",
        type: "Tech Story",
        title: "Implement Persistent Manual Client Accounts as First-Class Tax Records",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
  {
    id: "1475360",
    workstream: "DCT Platform",
    title: "Roll-forward (prior yr TWB)",
    stories: [
      {
        id: "1472917",
        type: "Tech Story",
        title: "TDC - Retrieve and Migrate Prior Year Financial Amounts for TY26",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
  {
    id: "1472793",
    workstream: "DCT Platform",
    title: "Finding - 5.7 Penetration Testing & Security Readiness",
    stories: [
      {
        id: "1435463",
        type: "Tech Story",
        title: "Develop Penetration Testing Strategy and Plan",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
  {
    id: "1474067",
    workstream: "DCT Platform",
    title: "PDC/TDC Master Data Administration Console",
    stories: [
      {
        id: "1474079",
        type: "Tech Story",
        title: "Build Initial PDC/TDC Master Data Administration Console",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
  {
    id: "1451927",
    workstream: "State",
    title: "Roger State Taxable Income MVP — State Filing Footprint",
    stories: [
      {
        id: "1472734",
        type: "Tech Story",
        title: "DCT — Integrate, Store, and Provide State Return-Filing Data for the Roger Filing Screen (Interaction/backend)",
        sprint: "Unassigned",
        planningStatus: "Refinement required",
        note: "Current State readiness assessment: not ready to estimate pending TIM/Roger contract and workflow decisions.",
      },
      {
        id: "1471480",
        type: "User Story",
        title: "DCT — Retrieve, Save, and Govern State Filing Footprint Decisions for the Roger Return Structure Screen (Backend)",
        sprint: "Unassigned",
        planningStatus: "Refinement required",
        note: "Current State readiness assessment: not ready to estimate pending filing-group, State Issue Count, and Combined/Unitary decisions.",
      },
    ],
  },
  {
    id: "1476344",
    workstream: "Provision",
    title: "Package 1 — Return-to-Provision",
    stories: [
      {
        id: "1479949",
        type: "User Story",
        title: "DCT-P1-01 — Provide governed RTP inputs, context, and source evidence",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
      {
        id: "1479958",
        type: "User Story",
        title: "DCT-P1-02 — Provide the RTP calculation and section dataset",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
      {
        id: "1480251",
        type: "User Story",
        title: "DCT-P1-03 — Persist, audit, and recalculate prior year amount corrections",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
      {
        id: "1480000",
        type: "User Story",
        title: "DCT-P1-04 — Provide RTP true-up outputs to downstream Provision workflows",
        sprint: "Unassigned",
        planningStatus: "Planning visibility",
      },
    ],
  },
];

export const PI4_SPRINT_PLANNING_LANES = [
  {
    id: "planning-refinement",
    label: "PI4 Planning & Refinement",
    timing: "Sprint dates to be confirmed",
    scope: "Confirm feature scope, dependencies, acceptance evidence, and sprint sequencing before commitment.",
    workstreams: ["DCT Platform", "State", "Provision"],
  },
  {
    id: "platform-foundation",
    label: "Platform Foundation & Controls",
    timing: "Sprint dates to be confirmed",
    scope: "Sequence payload standards, manual-account support, prior-year continuity, security, and Master Data administration work after sizing.",
    workstreams: ["DCT Platform"],
  },
  {
    id: "state-filing-footprint",
    label: "State Filing Footprint",
    timing: "Sprint dates to be confirmed",
    scope: "Assign only after the TIM-to-Roger/DCT contract, State Issue Count, and Combined/Unitary decisions are resolved.",
    workstreams: ["State"],
  },
  {
    id: "return-to-provision",
    label: "Return-to-Provision Package 1",
    timing: "Sprint dates to be confirmed",
    scope: "Sequence governed RTP inputs, calculation, corrections, and downstream true-up outputs after Package 0 dependencies are confirmed.",
    workstreams: ["Provision"],
  },
] as const;

/**
 * TY26 pilot expansion reference supplied for PI4 planning. These capabilities
 * remain planning visibility only and do not alter the MVP or PI4 delivery KPIs.
 */
export const PI4_TY26_PILOT_EXPANSIONS = [
  { area: "Client & Return Setup", expansion: "Support for Disregarded Entities" },
  { area: "Trial Balance Ingestion", expansion: "Client entity identifiers and abbreviations maintained within Roger to improve TB ingestion and entity assignment" },
  { area: "Line Mapping", expansion: "Nonstandard mappings" },
  { area: "Prior-Year Data", expansion: "Prior-year TWB 2.0 balances, mappings, and user inputs" },
  { area: "Book & Reclass Adjustments", expansion: "Import Audit Adjustment reports" },
  { area: "Tax Adjustments & Calculations", expansion: "Nonstandard tax adjustments, supporting documentation, review comment management" },
  { area: "Reporting & Reconciliation", expansion: "Enhanced reporting, comparison reporting, and traceability" },
  { area: "Sign-Off & GoSystem Integration", expansion: "Expanded sign-off functionality and the ability to push selected entities to GoSystem" },
] as const;

/**
 * Business-readable companion to the approved Roger logical architecture.
 * It clarifies the supplied diagram and does not introduce new ownership
 * boundaries or platform components.
 */
export const PI4_LOGICAL_ARCHITECTURE_FLOW = [
  { step: "01", layer: "User / Roger Experience Layer", explanation: "Roger captures practitioner selections, uploaded information, and the client, entity, and tax-year context needed to initiate processing." },
  { step: "02", layer: "PDC — Platform Data Layer", explanation: "PDC stores shared cross-line-of-business information, document and processing metadata, and reusable client/entity context." },
  { step: "03", layer: "PDC API / Gateway", explanation: "The PDC API receives the appropriate context and passes client, entity, tax year, and data-type attributes to downstream processing." },
  { step: "04", layer: "Orchestration Layer", explanation: "The orchestrator evaluates incoming context, determines the workflow, coordinates processing steps, and invokes the appropriate services or agents." },
  { step: "05", layer: "File Identification & Data Extraction", explanation: "For file-based workflows, the platform identifies Excel, PDF, CSV, or another input type and selects the appropriate extraction strategy." },
  { step: "06", layer: "Classification & Schema Mapping", explanation: "Extracted content is classified, such as Trial Balance, and transformed into the appropriate target schema." },
  { step: "07", layer: "Taxonomy / Line Mapping", explanation: "Applicable tax taxonomy and line-mapping information associate source financial data with tax reporting structures, supported by Azure AI Search and maintained mapping indexes." },
  { step: "08", layer: "Human-in-the-Loop Review", explanation: "Where required, Roger surfaces proposed mappings for practitioner review and confirmation before downstream tax processing continues." },
  { step: "09", layer: "TDC — Tax Domain Data Layer", explanation: "TDC stores and governs tax-specific information, including tax master data, mappings, adjustments, calculations, and governed tax outputs." },
  { step: "10", layer: "Downstream Tax Processing / Integrations", explanation: "Mapped, validated, and governed tax information becomes available for downstream workflows and tax-system integrations." },
] as const;

export const PI4_ARCHITECTURE_FOCUS = [
  { system: "PDC", detail: "Shared/cross-LOB data, ingestion, metadata, and reusable platform context." },
  { system: "DCT / Gateway", detail: "Integration, retrieval, composition, and movement of governed data between platform components." },
  { system: "TDC", detail: "Tax-domain data, master data, taxonomy, mappings, adjustments, and governed tax outputs." },
  { system: "Orchestrator", detail: "Determines and coordinates processing based on incoming context." },
  { system: "Roger", detail: "Practitioner-facing workflow, review, decisions, and presentation." },
] as const;

export const PI4_ARCHITECTURE_QUICK_FLOW = "Roger → PDC → PDC API/Gateway → Orchestrator → Extraction & Classification → Schema/Taxonomy Mapping → User Review → TDC → Downstream Tax Processing";

export const PI4_PLANNING_SUMMARY = {
  featureCount: PI4_FEATURE_STORY_MAP.length,
  storyCount: PI4_FEATURE_STORY_MAP.reduce((count, feature) => count + feature.stories.length, 0),
  sprintLaneCount: PI4_SPRINT_PLANNING_LANES.length,
  assignedStoryCount: 0,
} as const;

export function getPi4FeaturesByWorkstream(workstream: Pi4Workstream) {
  return PI4_FEATURE_STORY_MAP.filter((feature) => feature.workstream === workstream);
}

export function createPi4PlanningCopy() {
  const lines = [
    "PI4 Sprint & Story Tracker",
    "Planning visibility only — excluded from PI4 and MVP delivery metrics until a sprint baseline is approved.",
    "",
    "Sprint Planning Lanes",
    ...PI4_SPRINT_PLANNING_LANES.map((lane, index) => `${index + 1}. ${lane.label} — ${lane.timing}: ${lane.scope}`),
    "",
    "TY26 Pilot — What expands for pilot",
    ...PI4_TY26_PILOT_EXPANSIONS.map((item) => `- ${item.area}: ${item.expansion}`),
    "",
    "Logical Architecture & End-to-End Flow",
    `Quick flow: ${PI4_ARCHITECTURE_QUICK_FLOW}`,
    ...PI4_LOGICAL_ARCHITECTURE_FLOW.map((item) => `${item.step}. ${item.layer}: ${item.explanation}`),
    "",
    "Feature-to-Story Mapping",
    ...PI4_FEATURE_STORY_MAP.flatMap((feature) => [
      `Feature ${feature.id} — ${feature.title} [${feature.workstream}]`,
      ...feature.stories.map((story) => `  ${story.type} ${story.id} — ${story.title} | Sprint: ${story.sprint} | ${story.planningStatus}${story.note ? ` | ${story.note}` : ""}`),
    ]),
  ];

  return lines.join("\n");
}
