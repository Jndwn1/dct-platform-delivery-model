// Shared source data for the existing Pilot diagrams and Ask Buddy.
// Demonstration and proposed-path labels are not implementation approval.

export const COMPARISON_ROWS = [
  [
    "Workflow Foundation",
    "Tax Portal-to-Roger State workflow",
    "Demonstrated",
    "Reuse of first nine Federal Compliance steps",
    "Prototype Demonstrated",
  ],
  [
    "Data Collection",
    "State source-file extraction and mapping",
    "Demonstrated",
    "Duplicate return structure with dummy Provision data",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Review",
    "Practitioner review and approval of source mappings",
    "Demonstrated",
    "Return to Provision read-only comparison and filtering",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Entry / Maintenance",
    "State apportionment inputs by entity, jurisdiction, and factor",
    "Demonstrated",
    "Deferred Rollforward entity amount editing and custom adjustment columns",
    "Demonstrated with Dummy Data",
  ],
  [
    "Reconciliation",
    "Check figures, differences, variance percentages, and review threshold",
    "Demonstrated",
    "Prior-year Provision vs. tax-return comparison",
    "Demonstrated with Dummy Data",
  ],
  [
    "Data Governance",
    "Structured inputs and approved mappings shown; complete TDC integration handoff unverified",
    "Partially Demonstrated",
    "Initial Provision database tables created",
    "Initial Structure Created",
  ],
  [
    "Summary Output",
    "GoSystem calculation results not shown",
    "Not Demonstrated",
    "Federal Summary demonstrated; detailed validation scope remains to be confirmed",
    "Demonstrated",
  ],
  [
    "Downstream Integration",
    "IMS translation and transmission to GoSystem not shown",
    "Not Demonstrated",
    "BTP Excel Export demonstrated; transfer evidence remains to be confirmed",
    "Demonstrated",
  ],
  [
    "External Calculation",
    "GoSystem execution not shown",
    "Not Demonstrated",
    "Bloomberg Tax Provision calculation demonstrated; detailed result evidence remains to be confirmed",
    "Demonstrated",
  ],
  [
    "End-to-End Results",
    "No GoSystem-calculated results returned to Roger",
    "Not Demonstrated",
    "No validated end-to-end BTP processing flow",
    "Not Demonstrated",
  ],
] as const;

export const STATE_ARCHITECTURE_STEPS = [
  {
    label: "1 · State data collection",
    title: "Roger UI",
    detail:
      "Collect and review State tax inputs from Tax Portal source files, mappings, and practitioner review.",
    accent: "#0f766e",
    surface: "#f0fdfa",
  },
  {
    label: "2 · Govern and correlate",
    title: "TDC",
    detail:
      "Govern structured State data and calculation-request information through the agreed data path.",
    accent: "#2563eb",
    surface: "#eff6ff",
  },
  {
    label: "3 · Translate and transmit",
    title: "IMS",
    detail:
      "Translate the approved package and communicate with GoSystem using confirmed contracts and formats.",
    accent: "#7c3aed",
    surface: "#faf5ff",
  },
  {
    label: "4 · Compare, roll up and file",
    title: "GoSystem",
    detail:
      "Support apportionment comparison plus return-level roll-up and filing behavior after the governed State package is received.",
    accent: "#b45309",
    surface: "#fffbeb",
  },
  {
    label: "5 · Return and review",
    title: "IMS → TDC → Roger",
    detail:
      "Return processing and roll-up results for correlation, practitioner reconciliation, review, and approval.",
    accent: "#0369a1",
    surface: "#f0f9ff",
  },
];

export const PROVISION_ARCHITECTURE_STEPS = [
  {
    label: "1 · Prototype demonstrated",
    title: "Roger Core",
    detail:
      "Reuse the first nine Federal Compliance workflow steps as the Provision foundation.",
    accent: "#7c3aed",
    surface: "#faf5ff",
  },
  {
    label: "2 · Demonstrated with dummy data",
    title: "Return to Provision",
    detail:
      "Compare prior-year Provision amounts against the prior-year tax return in a read-only review experience.",
    accent: "#0f766e",
    surface: "#f0fdfa",
  },
  {
    label: "3 · Demonstrated with dummy data",
    title: "Deferred Rollforward",
    detail:
      "Maintain temporary-difference information through entity-specific amounts and custom adjustment columns.",
    accent: "#2563eb",
    surface: "#eff6ff",
  },
  {
    label: "4 · Demonstrated",
    title: "Federal Summary",
    detail:
      "Demonstrated October 9; confirm validation scope and retain supporting evidence.",
    accent: "#047857",
    surface: "#ecfdf5",
  },
  {
    label: "5 · Demonstrated",
    title: "BTP Export",
    detail:
      "Demonstrated October 9; confirm BTP transfer approach and validation detail.",
    accent: "#047857",
    surface: "#ecfdf5",
  },
  {
    label: "6 · Demonstrated",
    title: "Bloomberg Tax Provision",
    detail:
      "Calculation demonstrated October 9; confirm end-to-end output and validation detail.",
    accent: "#047857",
    surface: "#ecfdf5",
  },
];

export const PILOT_FLOW_PAGE = "/post-pilot";
export const PILOT_PROCESS_FLOW = {
  sectionId: "client-to-roger-process-flow",
  title: "Client File to Roger — Federal, State & Provision Process Flow",
  image: "/manus-storage/executive-client-file-to-roger-process-flow_0f8ee1d9.png",
  description: "One client-file journey: intake, governed preparation, Roger review, a single TDC decision, and controlled downstream delivery. Federal, State, and Provision are parallel practitioner workflows—not separate data pipelines.",
  alt: "Five-phase executive process flow: client submits a financial file, Tax Portal validates it, PDC and the AI Orchestrator prepare governed data, TDC governs the tax record, Roger branches Federal, State, and Provision review, TDC records one decision, and controlled downstream delivery follows",
  boundary: "This executive process view illustrates the intended business and platform flow. Detailed technical contracts, APIs, field mappings, and integration rules remain governed by their respective technical artifacts.",
  // Labels transcribed from the registered image; original pixels remain the visual authority.
  phases: ["Client file intake", "Governed data preparation", "Roger review", "Governed decision", "Downstream delivery"],
  steps: [
    { number: 1, title: "Client submits financial file", detail: "Financial file and supporting documents for client and period." },
    { number: 2, title: "Tax Portal receives and validates", detail: "Confirms client and period; creates the intake record." },
    { number: 3, title: "PDC", detail: "Creates the governed financial dataset." },
    { number: 4, title: "AI Orchestrator", detail: "Normalizes and prepares data for tax processing." },
    { number: 5, title: "TDC", detail: "Creates and governs the tax record." },
    { number: 6, title: "Roger readiness", detail: "Displays workflow readiness." },
    { number: 7, title: "Federal", detail: "Reviews governed tax data and supporting evidence." },
    { number: 8, title: "State", detail: "Reviews footprint, inputs, apportionment, and tax data." },
    { number: 9, title: "Provision", detail: "Reviews Return-to-Provision data and related inputs." },
    { number: 10, title: "TDC records governed decision", detail: "Stores the approved decision, status, adjustments, and lineage." },
    { number: 11, title: "Roger shows finalized status", detail: "Shows status, exceptions, and review evidence." },
    { number: 12, title: "Controlled downstream delivery", detail: "Routes eligible results to GoSystem, TIM, and approved consumers." },
  ],
  branchNote: "Steps 7–9 are parallel paths for the same client and period, not sequential tasks. Approved review decisions converge into step 10. The generic downstream illustration does not place Provision on the State IMS/GoSystem path; the distinct target architectures qualify the external paths.",
} as const;

export const PILOT_TARGET_ARCHITECTURE = {
  sectionId: "target-end-to-end-architecture",
  title: "Target End-to-End Architecture",
  boundary: "PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION",
  description: "The State and Provision architectures originate in Roger but use distinct external calculation and output paths. State MVP vision retains transparent entity-and-jurisdiction calculations in Roger, while GoSystem supports return-level roll-up and filing behavior. Provision uses BTP Export and Bloomberg Tax Provision—not the State IMS / GoSystem path.",
  state: {
    title: "State — GoSystem Roll-Up & Filing Integration",
    supportNote: "Forward direction: Roger UI → TDC → IMS → GoSystem. Return direction: GoSystem → IMS → TDC → Roger. IMS is the proposed integration and translation layer; Roger retains transparent entity-and-jurisdiction calculation review, while GoSystem supports return-level roll-up and filing behavior.",
    outcome: "The State round trip is not validated until the representative package, translation, GoSystem comparison or roll-up behavior, returned results, correlation, and practitioner review are confirmed.",
  },
  provision: {
    title: "Provision — Bloomberg Tax Provision Workflow",
    supportNote: "Provision does not use GoSystem or the State IMS calculation pathway. The BTP handoff uses BTP Export; no automated API transmission or automated results return is assumed.",
    outcome: "Federal Summary, BTP Export, and Bloomberg Tax Provision calculation are demonstrated alongside the Roger Core, Return to Provision, and Deferred Rollforward workflow. BTP transfer, end-to-end outputs, and detailed validation evidence remain pending confirmation.",
  },
} as const;
