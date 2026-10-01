export type ReadinessLevel = "Defined" | "Clarification needed" | "Material implementation risk" | "Blocking DEV";

export const OPEN_STATE_CONFIRMATION = "OPEN — State/Tax SME confirmation required.";

export type TranscriptTdcNeed = {
  id: string;
  need: string;
  owner: string;
  why: string;
  reference: string;
  workstreams: string;
  status: ReadinessLevel;
};

// Evidence-bound to the supplied Roger State Taxonomy Alignment Discussion transcript.
// These are discussion outcomes and follow-ups, not approved technical design decisions.
export const TRANSCRIPT_TDC_NEEDS: TranscriptTdcNeed[] = [
  {
    id: "DATA-01",
    need: "State data-point inventory",
    owner: "State team",
    why: "State will consolidate the known State data points, including its existing ingested-data view, so the teams can work from one shareable inventory.",
    reference: "1:01:07–1:01:40",
    workstreams: "State · TDC · Orchestrator",
    status: "Clarification needed",
  },
  {
    id: "MATCH-02",
    need: "Orchestrator matching context",
    owner: "State + Orchestrator",
    why: "TDC needs representative source/input examples and the context attributes that help Orchestrator identify a source and map it to normalized State data.",
    reference: "0:59:32–1:00:38",
    workstreams: "State · Orchestrator · TDC",
    status: "Clarification needed",
  },
  {
    id: "TABLE-03",
    need: "Multi-State and account-code table layout",
    owner: "State + TDC",
    why: "The transcript calls for a usable table representation when one item involves multiple account codes and multiple States.",
    reference: "0:58:26–0:58:56",
    workstreams: "State · TDC",
    status: "Clarification needed",
  },
  {
    id: "USER-04",
    need: "User adjustment and mapping-restatement path",
    owner: "State + Roger + TDC",
    why: "The anticipated user interaction and ability to restate a mapping need a confirmed controlled workflow before TDC governs the resulting data.",
    reference: "0:54:32–0:55:32",
    workstreams: "State · Roger · TDC",
    status: "Clarification needed",
  },
  {
    id: "INPUT-05",
    need: "Direct user-loaded State input treatment",
    owner: "State + TDC",
    why: "The group distinguished direct user-loaded State inputs from client ingestion; TDC needs the approved source and governance treatment.",
    reference: "0:52:28–0:52:48",
    workstreams: "State · TDC · Roger",
    status: "Clarification needed",
  },
  {
    id: "CALC-06",
    need: "Calculation and output inventory",
    owner: "State + TDC",
    why: "Apportionment calculations, State modifications, attributes, State taxable income, and liabilities were identified as the next data areas to lay out before governed handling is finalized.",
    reference: "1:01:52–1:02:10",
    workstreams: "State · TDC",
    status: "Material implementation risk",
  },
  {
    id: "TAX-07",
    need: "Taxonomy versus data-table detail",
    owner: "State / Tax SME + TDC",
    why: "The group needs to determine where specific taxonomy detail is required and where a more general data structure is sufficient.",
    reference: "1:02:46–1:02:55",
    workstreams: "State · TDC",
    status: "Clarification needed",
  },
  {
    id: "PLAN-08",
    need: "Follow-up stories and action items",
    owner: "State + TDC + Orchestrator",
    why: "The group will decide which data points, stories, and action items are reasonable to create now so work can progress alongside the other teams.",
    reference: "1:03:02–1:03:24",
    workstreams: "State · TDC · Orchestrator",
    status: "Clarification needed",
  },
];

export type ListenForItem = { topic: string; listenFor: string; why: string; followUp: string };

export const LISTEN_FOR_ITEMS: ListenForItem[] = [
  { topic: "Naming versus identifiers", listenFor: "Whether State is discussing labels only or an authoritative taxonomy ID/code.", why: "TDC persists governed identifiers, not just display labels.", followUp: "Record the approved identifier and source artifact." },
  { topic: "Mapping target", listenFor: 'Statements such as “This maps to…,” “That should be classified as…,” or “This belongs under…”.', why: "A verbal classification must resolve to an actual governed target.", followUp: "Confirm the exact taxonomy target ID or concept." },
  { topic: "Taxonomy version", listenFor: '“New version,” “updated rules,” “changes next year,” “TY26,” or “effective date.”', why: "Version context affects persistence and historical retrieval.", followUp: "Confirm version ID and change trigger." },
  { topic: "State variation", listenFor: '“This State handles it differently” or a named jurisdiction exception.', why: "Mappings may need jurisdiction applicability.", followUp: "Capture State-specific scope and allowed variants." },
  { topic: "Filing footprint", listenFor: "How State determines whether taxonomy data applies to an entity or jurisdiction.", why: "TDC needs approved filing-context scope.", followUp: "Confirm the applicable footprint identifier and source." },
  { topic: "Entity grouping", listenFor: "Combined, consolidated, filing-group, included-entity, or non-legal-entity behavior.", why: "Dataset identity may be broader than one legal entity.", followUp: "Confirm representation and ownership of filing relationships." },
  { topic: "Orchestrator mapping", listenFor: "Whether a result is a recommendation, proposed mapping, or authoritative mapping.", why: "TDC must keep proposed and effective values distinct.", followUp: "Confirm status and review transition." },
  { topic: "Practitioner action", listenFor: "Approve, reject, correct, remap, override, or create-mapping actions.", why: "Each action needs governance and audit treatment.", followUp: "Confirm allowed actions, actor rules, and effective-value behavior." },
  { topic: "Audit expectations", listenFor: "Requirements to preserve original value/mapping, previous decision, user, timestamp, reason, or version.", why: "These determine the audit and lineage record.", followUp: "Confirm fields that must remain immutable and retrievable." },
  { topic: "Taxonomy change behavior", listenFor: "Whether existing records retain an old version, are remapped, create a new dataset version, or are superseded.", why: "TDC needs a non-destructive versioning approach.", followUp: "Confirm the approved supersession and history pattern." },
  { topic: "Validation", listenFor: "Required fields, allowed values, invalid conditions, and error handling.", why: "TDC can enforce only approved controls.", followUp: "Capture validation rule owner and enforcement point." },
  { topic: "Payments", listenFor: "State-specific payment categories and normalization rules.", why: "Payment classification cannot be inferred by TDC.", followUp: "Confirm authoritative categories and tax-year scope." },
  { topic: "Downstream use", listenFor: "What Roger and GoSystem expect to receive from TDC.", why: "The retrieval and Gateway contract must be explicit.", followUp: "Confirm required governed values and metadata." },
];

export type QuestionCategory = { category: string; questions: string[] };

export const TDC_QUESTIONS: QuestionCategory[] = [
  { category: "A. Taxonomy Definition", questions: ["What is the authoritative identifier for each State taxonomy concept?", "Is there one enterprise State taxonomy or different taxonomies by State?", "Is the taxonomy hierarchical?", "Who approves changes to the taxonomy?", "What artifact is considered the source of truth?"] },
  { category: "B. Versioning", questions: ["What taxonomy version should TDC persist with the dataset?", "Is taxonomy version tied to tax year?", "Can the same tax year have multiple taxonomy versions?", "What event creates a new taxonomy version?", "When taxonomy changes, do previously persisted datasets retain their original taxonomy version?"] },
  { category: "C. Mapping", questions: ["What exact taxonomy identifier should TDC persist as the mapping target?", "Are mappings State-specific?", "Are mappings tax-year-specific?", "Is an Orchestrator mapping considered proposed or authoritative?", "What happens when Orchestrator cannot determine a mapping?", "What mapping statuses are required?"] },
  { category: "D. Practitioner Review and Corrections", questions: ["What mappings can a practitioner change?", "Does a correction replace the original mapping or create a new governed version?", "Must TDC preserve the original Orchestrator mapping?", "Is a reason required for corrections?", "Who is allowed to perform corrections?", "What is the effective mapping after a practitioner correction?", "Should prior decisions remain retrievable for audit?"] },
  { category: "E. Dataset Governance", questions: ["What uniquely identifies a Current-Year State Input Dataset?", "What creates a new dataset version?", "Does a mapping correction create a new dataset version or only a new mapping-action record?", "How should TDC represent Proposed, Reviewed, Accepted, Corrected, and Superseded states?", "What data must be immutable?"] },
  { category: "F. Filing Footprint / Entity Context", questions: ["How is taxonomy tied to filing footprint?", "Is the taxonomy dataset created per entity, State, filing group, return, or a combination?", "How are consolidated or combined returns represented?", "How are included entities represented?", "Does TDC receive the filing relationship or derive it?"] },
  { category: "G. GoSystem / Downstream", questions: ["How does the State taxonomy align to GoSystem?", "Is GoSystem mapping part of the taxonomy or a separate crosswalk?", "Who owns the crosswalk?", "What must TDC return to Gateway/Roger?", "Does Gateway perform any State normalization or only return governed TDC data?"] },
];

export type TaxonomyRequirement = { id: string; title: string; statement: string; reference: string };

export const STATE_CURRENT_YEAR_SCHEMA_REFERENCE = {
  title: "Current-Year State Data Acquisition PDC/TDC Schema",
  fileName: "Current_Year_State_Data_Acquisition_PDC_TDC_Schema.xlsx",
  url: "https://rsmnet.sharepoint.com/:x:/r/sites/CATTO365/Shared%20Documents/Roger%20-%20state%20and%20provision/State/State%20Requirements%20-%20for%20Tech%20teams/Current_Year_State_Data_Acquisition_PDC_TDC_Schema.xlsx?d=w049e75f1441b473fa3a4ce130a6bf6cd&csf=1&web=1&e=xlHu2p&xsdata=MDV8MDJ8SmVubml2ZXIuU3RhZmZvcmRAcnNtdXMuY29tfGFmYjJkMTk5OWJjNDQwNjVmMTFjMDhkZjFmZWE2NzcxfDFlM2U3MWJlZmNjYTQyODQ5MDMxNjg4Y2M4ZjM3YjZifDB8MHw2MzkyNjQ3NjM3NzU2NjYxOTB8VW5rbm93bnxUV0ZwYkdac2IzZDhleUpGYlhCMGVVMWhjR2tpT25SeWRXVXNJbFlpT2lJd0xqQXVNREF3TUNJc0lsQWlPaUpYYVc0ek1pSXNJa0ZPSWpvaVRXRnBiQ0lzSWxkVUlqb3lmUT09fDB8fHw%3d&sdata=UUs0Ky93YmI2KzA1K1pIYW16OGtod2pBWkh2MFhPOHROeVZGbzAwWDVSYz0%3d",
  sourceStatus: "State-provided SharePoint workbook.",
  scope: "Current-year Property, Payroll, Sales, and Payments data requirements; source-to-target mapping; intake and routing context; TDC persistence; lineage; practitioner corrections; and proposed dataset structure.",
  decisionStatus: "Proposed approach — State / Tax SME confirmation required before technical design, implementation, or story commitment.",
} as const;

export const PROPOSED_STATE_NORMALIZED_DATASET = {
  principle: "Rather than representing every State data point as a Federal-style taxonomy account, use a State-specific normalized dataset. Standardized categories identify business meaning while each structured item retains State, entity, source, and review context.",
  example: "For Property → Land, a client label such as ‘land cost’ can be proposed by Orchestrator as the standardized Roger target Land. After practitioner review or correction, TDC retains the State-specific structured dataset item and its governance context.",
  exampleCode: "CY_LAND",
  confirmationQuestion: "Is the intended direction a State-specific normalized dataset and mapping structure, rather than a Federal-style taxonomy account for each State item?",
  fields: [
    { label: "Domain", value: "Property", purpose: "Identifies the State data subject area." },
    { label: "Standardized target", value: "Land", purpose: "Records the normalized business category proposed for Roger use." },
    { label: "Proposed input code", value: "CY_LAND", purpose: "Associates the category with the State schema’s proposed TDC input code." },
    { label: "Applicable State and entity", value: "State Filing Footprint + source context", purpose: "Carries the jurisdiction and entity context needed for State-specific use." },
    { label: "Original client label and value", value: "‘land cost’ + extracted amount", purpose: "Preserves the source expression and value for lineage and review." },
    { label: "Current approved value", value: "Roger value after authorized correction", purpose: "Represents the effective value after controlled practitioner action." },
    { label: "Mapping and review context", value: "Status, confidence, reviewer action, source lineage, version", purpose: "Maintains the context needed for display, reconciliation, persistence, and downstream use." },
  ],
} as const;

export const STATE_NORMALIZATION_NEXT_ACTIONS = [
  {
    action: "Confirm the current-year State Data Acquisition schema as the agreed working approach",
    detail: "Confirm whether the supplied schema is the approach for capturing and governing a State-specific normalized dataset.",
    owner: "State team + State / Tax SME",
    sourceUrl: STATE_CURRENT_YEAR_SCHEMA_REFERENCE.url,
  },
  {
    action: "Confirm IMS locator context and downstream routing",
    detail: "Work with IMS to confirm the State data, locator context, and routing information needed for downstream GoSystem mapping.",
    owner: "State team + IMS + TDC",
    sourceUrl: null,
  },
  {
    action: "Expand remaining State feature data requirements",
    detail: "As State features are refined, document data needs for apportionment outputs, State modifications, credits and NOLs, State taxable income, State liability, and review/output processes.",
    owner: "State team + TDC + Roger",
    sourceUrl: null,
  },
] as const;

// Working requirements derived only from the supplied alignment transcript.
// State / Tax SME confirmation remains required before design commitment or implementation.
export const TDC_TAXONOMY_REQUIREMENTS: TaxonomyRequirement[] = [
  { id: "REQ-TAX-001", title: "State-specific normalized dataset direction", statement: "Confirm whether TDC should govern State data through a State-specific normalized dataset and mapping structure rather than create a Federal-style taxonomy account for every State data point.", reference: "State-provided schema follow-up · Confirmation pending" },
  { id: "REQ-TAX-002", title: "Standardized category and proposed-code mapping", statement: "For each State data point, preserve the standardized business category and proposed input code while retaining the original client label and extracted value for source lineage and review.", reference: "State-provided schema follow-up · Property → Land / CY_LAND example" },
  { id: "REQ-TAX-003", title: "State, entity, and filing-footprint context", statement: "Each State dataset item needs the applicable State and entity derived from the State Filing Footprint and available source context so downstream use is jurisdiction-aware.", reference: "State-provided schema follow-up" },
  { id: "REQ-TAX-004", title: "Approved-value and practitioner-correction treatment", statement: "Retain the current approved Roger value after authorized correction while preserving mapping status, reviewer action, and the original source context.", reference: "State-provided schema follow-up + transcript 0:54:32–0:55:32" },
  { id: "REQ-TAX-005", title: "Mapping, review, lineage, and version context", statement: "The proposed normalized record needs mapping status, confidence, reviewer action, source lineage, and version information to support review, persistence, reconciliation, and downstream use.", reference: "State-provided schema follow-up" },
  { id: "REQ-TAX-006", title: "IMS locator and GoSystem routing context", statement: "Confirm with IMS the State data, locator context, and routing information required for downstream GoSystem mapping before defining the downstream mapping treatment.", reference: "State-provided next action · Confirmation pending" },
  { id: "REQ-TAX-007", title: "Calculation and output data requirements", statement: "As State features are refined, document data needs for apportionment outputs, State modifications, credits and NOLs, State taxable income, State liability, and review/output processes.", reference: "State-provided next action + transcript 1:01:52–1:02:10" },
  { id: "REQ-TAX-008", title: "Schema and story confirmation", statement: "Confirm the supplied current-year schema as the agreed approach before turning the proposed normalized dataset direction into refined requirements, stories, technical design, or delivery commitment.", reference: "State-provided next action · Confirmation pending" },
];

export type StoryImpact = { story: string; title: string; discussionImpact: string; risk: ReadinessLevel; nextStep: string; owner: string; reference: string };

// These rows identify where the discussion may affect DEV work; no technical design, endpoint, schema, or commitment is inferred.
export const CURRENT_DEV_STORY_IMPACTS: StoryImpact[] = [
  { story: "1494188", title: "PDC — Enable Current-Year State Source Documents Without Financial Mappings", discussionImpact: "The session distinguished direct user-loaded State inputs from client ingestion, but did not decide their data treatment.", risk: "Clarification needed", nextStep: "Obtain the State team’s source and table treatment for direct user-loaded inputs before refining the working scope.", owner: "State team + TDC", reference: "1:01:36–1:01:52" },
  { story: "1494198", title: "PDC — Create and Route Current-Year State Source Submissions for Orchestrator Classification", discussionImpact: "The session confirmed a need for representative source/input examples and the context most useful for Orchestrator matching.", risk: "Clarification needed", nextStep: "Use the shared State data-point inventory and matching-context examples to refine the discussion record.", owner: "State team + Orchestrator + TDC", reference: "1:00:30–1:01:04" },
  { story: "1494222", title: "TDC — Persist and Govern the Orchestrator-Mapped Current-Year State Input Dataset", discussionImpact: "The next data areas named were apportionment calculations, State modifications, attributes, State taxable income, and liabilities; table and taxonomy detail remain open.", risk: "Material implementation risk", nextStep: "Do not finalize governed-data design until the State data inventory, table layout, and detail needed from taxonomy are shared and reviewed.", owner: "State team + TDC", reference: "1:01:52–1:02:55" },
  { story: "1494339", title: "Gateway — Provide the Current-Year State Input Dataset to Roger", discussionImpact: "The transcript did not decide Gateway payload fields, API behavior, or downstream contract boundaries.", risk: "Clarification needed", nextStep: "Keep the Gateway contract open; obtain separate State, TDC, Gateway, and Roger evidence before defining a response contract.", owner: "State team + TDC + Gateway + Roger", reference: "Not specified in transcript" },
  { story: "1494344", title: "Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions", discussionImpact: "The session mentioned user interaction and restating a mapping, but did not confirm permitted actions, approvals, audit treatment, or effective-result behavior.", risk: "Material implementation risk", nextStep: "Capture the controlled user-adjustment workflow and related follow-up action before treating a restated mapping as governed.", owner: "State team + Roger + TDC", reference: "0:54:32–0:55:32" },
];

export type TranscriptFollowUp = { area: string; discussionEvidence: string; nextStep: string; participants: string; reference: string; status: ReadinessLevel };

export const TRANSCRIPT_FOLLOW_UPS: TranscriptFollowUp[] = [
  { area: "State data-point inventory", discussionEvidence: "State has a starting view of ingested data and will consolidate a fuller list for sharing.", nextStep: "State team shares the assembled data-point list and supporting table examples.", participants: "State team · TDC · Orchestrator", reference: "1:01:52–1:03:16", status: "Clarification needed" },
  { area: "Orchestrator matching context", discussionEvidence: "The Orchestrator team has sample-based matching code, while the most helpful source and input information remains an explicit question.", nextStep: "State and Orchestrator identify representative samples and the useful matching context.", participants: "State team · Orchestrator · TDC", reference: "1:00:30–1:01:04", status: "Clarification needed" },
  { area: "Table layout for multi-State data", discussionEvidence: "The discussion called for an easily laid out table when multiple account codes and States are involved.", nextStep: "State and TDC review a workable table representation after the data list is shared.", participants: "State team · TDC", reference: "1:01:23–1:01:36", status: "Clarification needed" },
  { area: "User adjustment and mapping restatement", discussionEvidence: "A user may adjust a mapping and have it restated, with a level of interaction similar to current workbook handling.", nextStep: "State, Roger, and TDC define the controlled interaction before it is treated as an approved workflow.", participants: "State team · Roger · TDC", reference: "0:54:32–0:55:32", status: "Material implementation risk" },
  { area: "Stories and action items", discussionEvidence: "The group anticipated follow-ups on what is reasonable to create as stories or action items while the teams proceed in parallel.", nextStep: "Capture only agreed follow-ups after the shared data points are reviewed.", participants: "State team · TDC · Orchestrator", reference: "1:03:02–1:03:24", status: "Clarification needed" },
];

export type OpenDecision = { id: string; gap: string; why: string; impact: string; owner: string; reference: string };

export const OPEN_DECISIONS: OpenDecision[] = [
  { id: "GAP-01", gap: "What is the shared State data-point inventory and its minimum table structure?", why: "State’s next action is to consolidate the data points; the transcript also identifies table structures as a key area of clarity.", impact: "Working data design and story refinement", owner: "State team", reference: "1:01:23–1:01:40; 1:03:02–1:03:16" },
  { id: "GAP-02", gap: "Which source and input attributes are most useful for Orchestrator matching?", why: "Gary raised this explicitly; sample-based code does not resolve the approved matching context.", impact: "Matching discussion and source examples", owner: "State team + Orchestrator", reference: "1:00:30–1:01:04" },
  { id: "GAP-03", gap: "How are direct user-loaded inputs distinguished from client-ingested inputs?", why: "The discussion identified direct user-loaded inputs but did not decide their governed treatment.", impact: "Source treatment and working scope", owner: "State team + TDC", reference: "1:01:36–1:01:52" },
  { id: "GAP-04", gap: "What user adjustment and mapping-restatement behavior is permitted?", why: "The transcript anticipates interaction and restated mapping, but does not confirm the controlled workflow or resulting governance treatment.", impact: "Practitioner interaction follow-up", owner: "State team + Roger + TDC", reference: "0:54:32–0:55:32" },
  { id: "GAP-05", gap: "Where is specific taxonomy detail required versus a general data table?", why: "Cass identified both table structures and places where specific taxonomy are needed, without deciding the boundary.", impact: "Data model and taxonomy discussion", owner: "State team + TDC", reference: "1:02:46–1:02:55" },
  { id: "GAP-06", gap: "How are calculation and output data areas represented in the shared inventory?", why: "Apportionment calculations, State modifications, attributes, State taxable income, and liabilities were named as next data areas, not as finalized design.", impact: "Calculation/output working scope", owner: "State team + TDC", reference: "1:01:52–1:02:10" },
  { id: "GAP-07", gap: "Which stories or action items can be created now?", why: "The group expected follow-ups, but the transcript does not establish a committed backlog or delivery plan.", impact: "Cross-team sequencing", owner: "State team + TDC + Orchestrator", reference: "1:03:02–1:03:24" },
];

export type TranscriptAlignmentSection = {
  title: string;
  accent: "teal" | "purple" | "amber" | "orange";
  items: string[];
};

export const TAXONOMY_ALIGNMENT_TRANSCRIPT_SOURCE = "Roger State Taxonomy Alignment Discussion transcript — supplied October 1, 2026";

export const TAXONOMY_ALIGNMENT_TRANSCRIPT_NOTE = "The source document identifies itself as an AI-generated transcript. It is treated as working discussion evidence; unresolved items remain open until the accountable owner confirms the decision.";

export const TAXONOMY_ALIGNMENT_TRANSCRIPT: TranscriptAlignmentSection[] = [
  {
    title: "Working alignment from the session",
    accent: "teal",
    items: [
      "State taxonomy was described as unique identifiers and normalization applied to individual State data points.",
      "The State work is organized around State filing footprint and apportionment, with prepared data intended to support aligned stories and cross-team data preparation.",
      "A starting view of ingested State data already exists; the group can use known intake and output UIs to build a fuller shareable data-point list.",
      "The Orchestrator team has sample-based matching code in progress, with an expected level of user interaction similar to current workbook handling.",
    ],
  },
  {
    title: "What TDC needs next",
    accent: "purple",
    items: [
      "A consolidated, structured State data-point inventory and table layout from State, beginning with known ingested data.",
      "Representative source/input examples and the context attributes that help Orchestrator identify the source and map it to the normalized data set.",
      "A confirmed view of how multiple account codes and multiple States should be laid out and represented in the data table.",
      "Confirmed scope and governance treatment for direct user-loaded inputs and the next data areas: apportionment calculations, State modifications, attributes, State taxable income, and liabilities.",
    ],
  },
  {
    title: "Transcript-backed requirement refinement",
    accent: "amber",
    items: [
      "The governed data design needs a structured State inventory, not only a conceptual taxonomy discussion.",
      "The Orchestrator matching path needs approved source/context information and a traceable relationship to normalized State data.",
      "The model must accommodate a controlled user adjustment and mapping-restatement path without losing the traceability of the prior mapping.",
      "State calculation outputs must receive an explicit approved scope before TDC finalizes their persistence, lineage, and taxonomy treatment.",
    ],
  },
  {
    title: "Open questions and gaps discussed",
    accent: "orange",
    items: [
      "What information is most helpful to Orchestrator for AI matching of the source and inputs to the normalized data set?",
      "What table structures are required, and where is specific taxonomy detail needed versus a more general data structure?",
      "Which data points, stories, or action items are reasonable to create now so the work can proceed alongside the other teams?",
      "What is the formal governed treatment of calculation outputs and direct user-loaded inputs once the State data list is shared?",
    ],
  },
];

export const TAXONOMY_ALIGNMENT_TRANSCRIPT_ACTION = {
  owner: "State team",
  action: "Consolidate the State data points and share them across the teams to continue the alignment work.",
  supportingAction: "Cass will make the recording and transcript accessible for the group to use as working discussion evidence.",
};

export const TAXONOMY_MEETING_TEMPLATE = [
  "Meeting Date:",
  "Participants:",
  "Topics Discussed:",
  "Decisions:",
  "New TDC Dependencies:",
  "Requirements Confirmed:",
  "Requirements Changed:",
  "Open Questions:",
  "Impacted Stories:",
  "Actions:",
  "Owner:",
  "Due Date:",
].join("\n");
