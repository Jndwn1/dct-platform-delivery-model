export type RogerSprintGoalWorkstream = "State" | "Provision" | "TDC";

export type RogerSprintGoalFeature = {
  featureId: string;
  purpose: string;
};

export type RogerSprintGoal = {
  workstream: RogerSprintGoalWorkstream;
  sourceWindow: string;
  sourceBasis: string;
  goal: string;
  objectives: readonly string[];
  supportingFeatures: readonly RogerSprintGoalFeature[];
  dependencies: readonly string[];
  impact: string;
};

/**
 * Evidence-bound PI4–Sprint 2 planning goals. State and Provision language comes
 * from Jenniver-supplied goal captures. The TDC goal is an integration goal
 * synthesized only from the explicitly captured TDC/Gateway backlog features and
 * child work-item evidence; it is not a commitment, deployment, or architecture approval.
 */
export const ROGER_PI4_SPRINT_2_GOALS: readonly RogerSprintGoal[] = [
  {
    workstream: "TDC",
    sourceWindow: "PI4–Sprint 2 backlog evidence",
    sourceBasis: "User-supplied Team Roger / Roger TDC PI4–Sprint 2 child work-item capture",
    goal: "Provide the governed Tax Data Consolidation (TDC) API, data, access, environment, and defect-resolution foundation that State and Provision need to progress safely.",
    objectives: [
      "Confirm the TDC, IMS, and Gateway API and payload-validation path, including the data-type and validation standards needed by consuming Roger experiences.",
      "Resolve manual-client-account creation and storage, Gateway access configuration, and related security prerequisites with a named owner and review boundary.",
      "Triage captured TDC, Gateway, performance-environment, Return Filings, and Roger UI defects so their current product owner, user impact, and dependency on State or Provision are explicit.",
      "Support the Provision decision on DCT API ownership and data location, rather than treating the captured backlog state as an architecture approval.",
    ],
    supportingFeatures: [
      { featureId: "1441522", purpose: "Microservice-design capability supporting the architectural separation and service-boundary questions underlying shared data delivery." },
      { featureId: "1441524", purpose: "API and payload-definition work, including TDC-to-IMS data-type and validation standards." },
      { featureId: "1441525", purpose: "Scalability capability that must be considered where Sprint 2 data and calculation paths introduce volume or performance needs." },
      { featureId: "1441526", purpose: "Expandability capability supporting a governed path for future State and Provision scope without prematurely defining an implementation." },
      { featureId: "1441527", purpose: "Data-model and schema-flexibility capability supporting the TDC data foundation and future State/Provision requirements." },
      { featureId: "1461160", purpose: "Manual client-account and governed data-creation capability with Gateway storage support." },
      { featureId: "1441528", purpose: "Security and delegated-access prerequisite work across Gateway and related services." },
      { featureId: "1472793", purpose: "Penetration-testing and security-readiness capability supporting a safe technical path before release conclusions." },
      { featureId: "1489784", purpose: "Development and QA environment readiness for Roger Platform work that consumes TDC and Gateway capabilities." },
      { featureId: "1490944", purpose: "Cross-team defect and bug-management container for captured TDC, Gateway, Return Filings, performance, and Roger UI issues." },
    ],
    dependencies: [
      "A named contract owner for TDC, IMS, and Gateway interfaces plus explicit consumer confirmation from State and Provision.",
      "Current-team triage of legacy DCT-labeled Return Filings defects before State or Provision delivery ownership is assumed.",
      "Environment, access, capacity, and QA evidence for the affected technical paths.",
    ],
    impact: "Reduces the risk that State and Provision build against unresolved data, API, security, environment, or defect assumptions and establishes the technical support path for their Sprint 2 objectives.",
  },
  {
    workstream: "State",
    sourceWindow: "State source window: Sep 28–Oct 2",
    sourceBasis: "User-supplied State Top 4 Goals capture",
    goal: "Advance the two foundational Roger State screens into full development while establishing the data, taxonomy, and calculation foundations for the State MVP.",
    objectives: [
      "Continue front-end and back-end development for Filing and Return Structure, then confirm the DCT implementation-path timing through the September 29 Scrum of Scrums follow-up.",
      "Continue Orchestrator automation, complete daily pattern identification for base apportionment and payment extraction, and finalize the interactive mapping and reconciliation prototype for practitioner review and correction.",
      "Launch the State taxonomy sub-workstream with IMS visibility, use the Roger State BA story set to align DCT, Process, IMS, and State participants, and establish ownership, sequencing, mappings, and transformation-readiness actions.",
      "Advance calculation prototypes, update single-entity apportionment and State-availability views, begin the complex State modifications prototype through a limited multi-entity lens, and publish MVP process steps and scope boundaries.",
    ],
    supportingFeatures: [
      { featureId: "1451927", purpose: "Filing-footprint foundation for the State filing and return-structure experience." },
      { featureId: "1471427", purpose: "Current-year State data foundation for the Roger taxable-income workflow and State screen development." },
      { featureId: "1464702", purpose: "Apportionment-management capability supporting the extraction and single-entity calculation objectives." },
      { featureId: "1471425", purpose: "Prior-year State data capability that must align with the State and Provision source-treatment path." },
      { featureId: "1485999", purpose: "State calculation-configuration capability supporting the calculation-prototype objective." },
      { featureId: "1486002", purpose: "State data-collection capability that needs a confirmed inbound-source and data-contract path." },
      { featureId: "1486003", purpose: "State calculation-review capability; the captured parent state is On Hold and requires unblock criteria." },
      { featureId: "1487518", purpose: "State Provision Output capability connecting State taxable-income results to the downstream Provision view." },
      { featureId: "1462484", purpose: "Shared entity-mapping foundation needed to align State data, practitioner workflow, and downstream transformation." },
    ],
    dependencies: [
      "A confirmed DCT implementation path and timing from the Scrum of Scrums follow-up.",
      "IMS visibility plus State taxonomy ownership, mapping, and transformation-readiness decisions.",
      "Practitioner and SME review of the mapping, reconciliation, apportionment, and calculation prototypes.",
    ],
    impact: "Moves the State workstream from isolated prototype activity toward a governed State MVP path with a clearer filing structure, data foundation, taxonomy alignment, and practitioner review loop.",
  },
  {
    workstream: "Provision",
    sourceWindow: "Provision source window: Sep 21–Sep 25",
    sourceBasis: "User-supplied Provision Top 3 Goals capture",
    goal: "Resolve Provision architecture and API ownership, establish the backlog and refinement baseline, and finalize the prior-year plus audit-history requirements for Return-to-Provision and Deferred Rollforward.",
    objectives: [
      "Resolve whether Provision is developed within the Federal Filing experience or as a separate application or workflow, and resolve whether Provision information belongs in Phoenix Data Consolidation (PDC), Tax Data Consolidation (TDC), or both while confirming DCT API ownership.",
      "Complete the captured Sprint 1 refinement, estimation, and Azure DevOps setup activities: refine DCT stories, associate Roger UI stories, estimate and document dependencies, then apply Team Roger and iteration placement after scope confirmation. This source wording is retained as a planning input; it does not re-label the PI4–Sprint 2 backlog baseline.",
      "Finalize the A1110 prior-year source decision for the initial year, plan a separate subsequent-year source, and finalize override and audit-history behavior for Return-to-Provision and Deferred Rollforward consistent with Roger Core.",
    ],
    supportingFeatures: [
      { featureId: "1476344", purpose: "Package 1 Return-to-Provision capability and its governed practitioner workflow." },
      { featureId: "1476349", purpose: "Package 2 Deferred Rollforward capability and its prior-year, calculation, and downstream-output requirements." },
      { featureId: "1476352", purpose: "Package 3 Federal Summary capability supporting the Federal input and summary perspective for Provision." },
      { featureId: "1476353", purpose: "Package 4 State Summary capability supporting the State summary perspective for Provision." },
      { featureId: "1476354", purpose: "Package 5 BTP Export capability supporting governed downstream delivery and export planning." },
      { featureId: "1475360", purpose: "Prior-year roll-forward foundation for the Tax Workbench and Provision workflow." },
      { featureId: "1470472", purpose: "Tax-only non-legal entity scope requiring Provision and entity-mapping impact confirmation." },
    ],
    dependencies: [
      "A decision on the Federal Filing versus separate Provision experience and the PDC/TDC ownership boundary.",
      "A named DCT API owner and confirmed technical development location before stories are estimated and sequenced.",
      "Confirmed A1110 initial-year source, subsequent-year source approach, and override/audit-history requirements.",
    ],
    impact: "Creates an executable Provision planning baseline by turning architecture, data location, prior-year sourcing, auditability, and ADO refinement questions into explicit decisions and scoped backlog work.",
  },
] as const;

/**
 * Exact or source-truncated display titles from the supplied Team Roger backlog
 * captures. The map deliberately retains ellipses where the screenshot truncated
 * the title rather than guessing missing words.
 */
export const ROGER_PI4_SPRINT_2_FEATURE_TITLES: Readonly<Record<string, string>> = {
  "1451927": "Roger State Taxable Income MVP — State Filing Footprint",
  "1471427": "Roger State Taxable Income MVP — Current-Year State Data…",
  "1464702": "Roger State Taxable Income MVP — Apportionment Manag…",
  "1471425": "Roger State Taxable Income MVP — Prior-Year State Data…",
  "1485999": "Roger State Taxable Income MVP — State Calculation Confi…",
  "1486002": "Roger State Taxable Income MVP — State Data Collection a…",
  "1486003": "Roger State Taxable Income MVP — State Calculation Revie…",
  "1487518": "Roger State Taxable Income MVP-State Provision Output",
  "1462484": "Entity mappings",
  "1476344": "Package 1 — Return-to-Provision",
  "1476349": "Package 2 — Deferred Rollforward",
  "1476352": "Package 3 — Federal Summary",
  "1476353": "Package 4 — State Summary",
  "1476354": "Package 5 — BTP Export",
  "1475360": "Roll-forward (prior yr TWB)",
  "1470472": "Non-Legal Entities (tax-only entities)",
  "1441522": "Finding - 5.1 Microservice Design: Separating the Database …",
  "1441524": "Finding - 5.2 API and Payload Definitions",
  "1441525": "Finding - 5.3 Scalability: Behavior at Production Volumes",
  "1441526": "Finding - 5.4 Expandability",
  "1441527": "Finding - 5.5 Data Model and Schema Flexibility",
  "1461160": "User-Defined Nonstandard TDC Codes",
  "1441528": "Finding - 5.6 Security Implementation",
  "1472793": "Finding - 5.7 Penetration Testing & Security Readiness",
  "1489784": "Set Up Dev/QA Environment for Roger Platform",
  "1490944": "Data — Defect & Bug Management",
};

export const ROGER_PI4_SPRINT_2_COLLECTIVE_OUTCOME = "By the end of PI4–Sprint 2, the intended collective outcome is an integrated execution baseline: State has advanced its foundational screens, taxonomy, data, and calculation path; Provision has a decided architectural and prior-year/audit foundation with refined backlog inputs; and TDC has a named technical support and contract path. Together, the work should make cross-workstream dependencies visible and ready for accountable follow-through. This is a planning outcome, not a claim of feature completion or deployment readiness.";

export const ROGER_PI4_SPRINT_2_ALIGNMENT = [
  {
    from: "State",
    to: "TDC",
    relationship: "State filing, current-year data, apportionment, data collection, and calculation objectives require a confirmed DCT implementation path plus governed TDC, IMS, and Gateway data and API support.",
  },
  {
    from: "Provision",
    to: "TDC",
    relationship: "Provision cannot finalize its data location, DCT API ownership, or dependent story sequence until the TDC/PDC boundary, API ownership, and validation path are decided.",
  },
  {
    from: "State",
    to: "Provision",
    relationship: "Entity mapping, prior-year sourcing, auditability, and shared Roger Core experiences need consistent identifiers, source treatment, and practitioner workflow boundaries across both workstreams.",
  },
  {
    from: "All workstreams",
    to: "Roger delivery",
    relationship: "Refined stories, named owners, agreed data contracts, prototype feedback, and defect triage create the common decision baseline required before capacity, release, or deployment conclusions can be made.",
  },
] as const;
