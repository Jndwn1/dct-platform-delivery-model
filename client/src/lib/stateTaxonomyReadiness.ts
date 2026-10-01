export type ReadinessLevel = "Defined" | "Clarification needed" | "Material implementation risk" | "Blocking DEV";

export const OPEN_STATE_CONFIRMATION = "OPEN — State/Tax SME confirmation required.";

export type TaxonomyDependency = {
  dependency: string;
  needs: string;
  owner: string;
  why: string;
  stories: string;
  risk: ReadinessLevel;
};

export const TAXONOMY_DEPENDENCIES: TaxonomyDependency[] = [
  { dependency: "State Taxonomy Definition", needs: "Authoritative structure, concepts, categories, hierarchy, and identifiers/codes.", owner: "State / Tax SME", why: "TDC cannot govern an unknown business classification structure.", stories: "1494222, 1494344", risk: "Material implementation risk" },
  { dependency: "Structured State Data Inventory", needs: "A shared table/list of State data points, beginning with known ingested data and expanded to apportionment calculations, State modifications, attributes, State TI, and liabilities as each becomes available.", owner: "State / Tax SME", why: "The transcript confirms this inventory is the next State action and is needed to align story scope, data format, and governed dataset design.", stories: "1494198, 1494222", risk: "Clarification needed" },
  { dependency: "Orchestrator Matching Context", needs: "Agreed source/input characteristics, representative samples, and the attributes most helpful for Orchestrator matching to the normalized data set.", owner: "State / Tax SME + Orchestrator", why: "The transcript confirms existing sample-based matching work but leaves the most useful matching information open.", stories: "1494198, 1494222, 1494344", risk: "Clarification needed" },
  { dependency: "State Calculation Outcome Scope", needs: "Confirmed treatment of apportionment calculations, State modifications, attributes, State taxable income, and liability outputs within the governed State data scope.", owner: "State / Tax SME + TDC", why: "These were named as the next data areas to lay out, but their persistence, lineage, and taxonomy treatment remain to be confirmed.", stories: "1494222, 1494339", risk: "Material implementation risk" },
  { dependency: "Authoritative Mapping Targets", needs: "Valid destination taxonomy IDs or concepts for Orchestrator and practitioner mappings.", owner: "State / Tax SME", why: "TDC needs valid governed targets rather than inferred labels.", stories: "1494222, 1494344", risk: "Material implementation risk" },
  { dependency: "GoSystem Alignment", needs: "State taxonomy-to-GoSystem fields, forms, lines, classifications, or values crosswalk.", owner: "State / GoSystem SME", why: "Downstream values and the crosswalk must be business-approved.", stories: "1494222, 1494339", risk: "Clarification needed" },
  { dependency: "Tax-Year Applicability", needs: "Tax-year variation, effective dates, and prior-year handling.", owner: "State / Tax SME", why: "TDC must retain applicable tax-year and version context.", stories: "1494198, 1494222", risk: "Clarification needed" },
  { dependency: "Jurisdiction Applicability", needs: "State-specific variants and applicability rules.", owner: "State", why: "A mapping may not be valid across all jurisdictions.", stories: "1494222, 1494339", risk: "Clarification needed" },
  { dependency: "State Filing Footprint", needs: "Relationship between taxonomy data and entity or filing-group jurisdictions.", owner: "State", why: "TDC needs approved filing-context scope for governed records.", stories: "1494198, 1494222", risk: "Clarification needed" },
  { dependency: "Filing Group / Entity Relationship", needs: "Scope across legal entities, filing groups, combined/consolidated returns, and related filing relationships.", owner: "State / TIM where applicable", why: "TDC needs a determinable governed context for each dataset.", stories: "1494222", risk: "Clarification needed" },
  { dependency: "Taxonomy Version", needs: "Identifier showing which taxonomy or rule profile was used.", owner: "State defines; TDC persists", why: "Version context is required for auditability and historical retrieval.", stories: "1494198, 1494222, 1494344", risk: "Material implementation risk" },
  { dependency: "Mapping Status Model", needs: "Approved values such as Proposed, Mapped, Unmapped, Needs Review, Accepted, Rejected, Corrected, and Superseded.", owner: "State + TDC contract", why: "TDC needs a controlled lifecycle for governed mappings.", stories: "1494222, 1494344", risk: "Material implementation risk" },
  { dependency: "Practitioner Review Rules", needs: "When mappings require practitioner review versus automatic acceptance.", owner: "State / Roger", why: "The workflow must distinguish recommendation from an effective governed value.", stories: "1494344", risk: "Clarification needed" },
  { dependency: "Practitioner Correction Rules", needs: "Permitted changes, retention of original Orchestrator mapping, and the effective result.", owner: "State / Roger", why: "TDC must persist a traceable correction history without overwriting source evidence.", stories: "1494344", risk: "Material implementation risk" },
  { dependency: "Dataset Identity", needs: "Approved identity elements: EntityId, TaxYear, State/Jurisdiction, FilingGroupId, StateFootprintVersion, and DatasetVersion.", owner: "TDC requires business confirmation from State", why: "TDC needs deterministic identity for persistence and retrieval.", stories: "1494198, 1494222", risk: "Material implementation risk" },
  { dependency: "Dataset Versioning", needs: "Business events that create a new dataset version.", owner: "State + TDC", why: "TDC must preserve lineage and establish approved version triggers.", stories: "1494222, 1494344", risk: "Material implementation risk" },
  { dependency: "Payment Taxonomy / Normalization", needs: "Approved State payment categories and normalization rules.", owner: "State / Tax SME", why: "TDC cannot independently derive payment classification.", stories: "1494222", risk: "Clarification needed" },
  { dependency: "Validation Rules", needs: "Required fields, allowed values, cross-field checks, and State-specific validations.", owner: "State defines; TDC enforces where applicable", why: "TDC needs approved controls before it can validate governed records.", stories: "1494188, 1494222, 1494344", risk: "Clarification needed" },
  { dependency: "Source-of-Truth Boundaries", needs: "Confirmed origin for PDC, TIM, State, GoSystem, Orchestrator, and practitioner-entered values.", owner: "Cross-team", why: "Source lineage and responsibility must remain explicit.", stories: "1494188, 1494198, 1494222", risk: "Clarification needed" },
  { dependency: "Gateway Contract", needs: "Taxonomy metadata and governed State data Roger needs returned.", owner: "Roger + Gateway + TDC", why: "Gateway must expose approved governed data without adding State business meaning.", stories: "1494339, 1494344", risk: "Clarification needed" },
];

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

// Working requirements derived only from the supplied alignment transcript.
// State / Tax SME confirmation remains required before design commitment or implementation.
export const TDC_TAXONOMY_REQUIREMENTS: TaxonomyRequirement[] = [
  { id: "REQ-TAX-001", title: "Shared State data-point inventory", statement: "TDC requires the State team’s consolidated list of known State data points, starting with the existing ingested-data view, so the teams can align on a shared working inventory.", reference: "1:01:52–1:02:10" },
  { id: "REQ-TAX-002", title: "Source and matching context", statement: "TDC requires representative source and input examples plus the context attributes that help Orchestrator identify the source and relate it to the normalized State data set.", reference: "1:00:30–1:01:04" },
  { id: "REQ-TAX-003", title: "Multi-State account-code table layout", statement: "TDC requires an approved table layout for scenarios that involve multiple account codes and multiple States before it can reliably pull the data into the governed set.", reference: "1:01:23–1:01:36" },
  { id: "REQ-TAX-004", title: "Direct user-loaded input treatment", statement: "TDC requires State confirmation of the source and governance treatment for direct user-loaded inputs that do not come through the client-ingestion process.", reference: "1:01:36–1:01:52" },
  { id: "REQ-TAX-005", title: "User adjustment and mapping restatement", statement: "TDC requires the permitted user interaction and mapping-restatement behavior to be defined before a changed mapping is treated as a governed result.", reference: "1:00:17–1:00:30" },
  { id: "REQ-TAX-006", title: "Calculation and output inventory", statement: "TDC requires the data-point scope for apportionment calculations, State modifications, attributes, State taxable income, and liabilities before governing those inputs and outputs.", reference: "1:01:52–1:02:10" },
  { id: "REQ-TAX-007", title: "Taxonomy versus table-detail decision", statement: "TDC requires State and Tax SMEs to clarify where specific taxonomy detail is needed and where a general table structure is sufficient.", reference: "1:02:46–1:02:55" },
  { id: "REQ-TAX-008", title: "Follow-up story and action scope", statement: "TDC requires agreed data points, stories, or action items that can progress alongside the other teams after the shared State list is available.", reference: "1:03:02–1:03:16" },
];

export type StoryImpact = { story: string; title: string; dependency: string; risk: ReadinessLevel; decision: string; owner: string };

export const CURRENT_DEV_STORY_IMPACTS: StoryImpact[] = [
  { story: "1494188", title: "PDC — Enable Current-Year State Source Documents Without Financial Mappings", dependency: "Approved State-processing context, including the treatment of direct user-loaded State inputs that are not from client ingestion.", risk: "Clarification needed", decision: "Confirm approved processing context, source-channel distinction, mapping-applicability signal, and State validation controls.", owner: "State / Tax SME + PDC" },
  { story: "1494198", title: "PDC — Create and Route Current-Year State Source Submissions for Orchestrator Classification", dependency: "Structured State data inventory, StateFootprintVersion, taxonomy/rule context, and the matching information sent to Orchestrator.", risk: "Clarification needed", decision: "Confirm the shared State data table, sample/context attributes most helpful for matching, and routing metadata that accompanies the submission.", owner: "State / Tax SME + PDC + Orchestrator" },
  { story: "1494222", title: "TDC — Persist and Govern the Orchestrator-Mapped Current-Year State Input Dataset", dependency: "Taxonomy target, structured State data inventory, calculation/outcome scope, dataset identity/lifecycle, mapping status, taxonomy version, payment normalization, validation, and lineage.", risk: "Material implementation risk", decision: "Confirm State taxonomy artifact, valid targets, the incoming inventory, calculation-output scope, identity model, lifecycle, statuses, and version triggers before final persistence design.", owner: "State / Tax SME + TDC" },
  { story: "1494339", title: "Gateway — Provide the Current-Year State Input Dataset to Roger", dependency: "State taxonomy metadata and governed effective values that must be exposed to Roger.", risk: "Clarification needed", decision: "Confirm governed response metadata, version context, and the Gateway non-normalization boundary.", owner: "State / Tax SME + TDC + Gateway + Roger" },
  { story: "1494344", title: "Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions", dependency: "Valid mapping targets, practitioner correction, review status, supersession, versioning, audit, and effective value.", risk: "Material implementation risk", decision: "Confirm allowed actions, preserved original mapping, correction/version behavior, audit fields, and effective-result rule.", owner: "State / Tax SME + Roger + TDC + Gateway" },
];

export type Responsibility = { decision: string; state: string; tdc: string; orchestrator: string; gateway: string; roger: string };

export const RESPONSIBILITIES: Responsibility[] = [
  { decision: "Define State taxonomy", state: "Owner", tdc: "Consumer", orchestrator: "Consumer", gateway: "—", roger: "Consumer" },
  { decision: "Define State business meaning", state: "Owner", tdc: "—", orchestrator: "Consumer", gateway: "—", roger: "Consumer" },
  { decision: "Define valid taxonomy mapping targets", state: "Owner", tdc: "Validate / persist", orchestrator: "Uses", gateway: "—", roger: "Uses" },
  { decision: "Determine proposed mapping", state: "Rules / approval", tdc: "Persist", orchestrator: "Owner", gateway: "—", roger: "Displays" },
  { decision: "Persist proposed mapping", state: "—", tdc: "Owner", orchestrator: "Supplies", gateway: "—", roger: "—" },
  { decision: "Persist taxonomy version", state: "Defines", tdc: "Owner", orchestrator: "Supplies context", gateway: "Returns", roger: "Displays" },
  { decision: "Govern mapping history", state: "Policy input", tdc: "Owner", orchestrator: "Source event", gateway: "Retrieves", roger: "Views" },
  { decision: "Define practitioner workflow", state: "Co-owner", tdc: "Persists outcome", orchestrator: "—", gateway: "Contract", roger: "Co-owner" },
  { decision: "Persist practitioner decisions", state: "Policy input", tdc: "Owner", orchestrator: "—", gateway: "Submits / retrieves", roger: "Captures" },
  { decision: "Expose governed data", state: "Business approval", tdc: "Co-owner", orchestrator: "—", gateway: "Co-owner", roger: "Consumer" },
  { decision: "Render data for practitioner", state: "Review input", tdc: "Provides governed data", orchestrator: "—", gateway: "Delivers contract", roger: "Owner" },
  { decision: "Define GoSystem business mapping", state: "Owner with GoSystem SME", tdc: "Persists approved crosswalk context", orchestrator: "Uses if approved", gateway: "—", roger: "Displays outcome" },
];

export type OpenDecision = { id: string; decision: string; why: string; stories: string; owner: string };

export const OPEN_DECISIONS: OpenDecision[] = [
  { id: "TAX-01", decision: "What is the authoritative State taxonomy artifact?", why: "TDC needs an approved structure and source of truth.", stories: "1494222, 1494344", owner: "State / Tax SME" },
  { id: "TAX-02", decision: "What identifier represents a taxonomy mapping target?", why: "TDC must persist a deterministic target.", stories: "1494222, 1494344", owner: "State / Tax SME" },
  { id: "TAX-03", decision: "How is taxonomy versioned?", why: "Version context supports governed history and retrieval.", stories: "1494198, 1494222, 1494344", owner: "State / Tax SME + TDC" },
  { id: "TAX-04", decision: "Is taxonomy version tied to tax year?", why: "Tax-year applicability changes valid mappings.", stories: "1494198, 1494222", owner: "State / Tax SME" },
  { id: "TAX-05", decision: "Are mappings jurisdiction-specific?", why: "TDC needs jurisdiction-aware applicability rules.", stories: "1494222, 1494339", owner: "State / Tax SME" },
  { id: "TAX-06", decision: "What are the approved mapping statuses?", why: "The governed lifecycle needs controlled values.", stories: "1494222, 1494344", owner: "State / Tax SME + TDC" },
  { id: "TAX-07", decision: "What happens when Orchestrator cannot map a source item?", why: "TDC needs the exception and review state.", stories: "1494222, 1494344", owner: "State / Tax SME + Orchestrator" },
  { id: "TAX-08", decision: "What practitioner actions are supported?", why: "TDC must persist permitted decisions and corrections.", stories: "1494344", owner: "State / Tax SME + Roger" },
  { id: "TAX-09", decision: "Does practitioner correction create a new mapping version or dataset version?", why: "TDC needs an approved non-destructive versioning model.", stories: "1494222, 1494344", owner: "State / Tax SME + TDC" },
  { id: "TAX-10", decision: "What creates a new State dataset version?", why: "TDC needs business-approved version triggers.", stories: "1494222", owner: "State / Tax SME + TDC" },
  { id: "TAX-11", decision: "How does State taxonomy align to filing footprint?", why: "TDC needs confirmed applicability across entities and jurisdictions.", stories: "1494198, 1494222", owner: "State / Tax SME" },
  { id: "TAX-12", decision: "How does State taxonomy align to GoSystem?", why: "Downstream crosswalk ownership and use must be approved.", stories: "1494222, 1494339", owner: "State / GoSystem SME" },
  { id: "TAX-13", decision: "What are the State payment taxonomy and normalization rules?", why: "TDC cannot infer payment classification.", stories: "1494222", owner: "State / Tax SME" },
  { id: "TAX-14", decision: "What taxonomy metadata must Gateway return to Roger?", why: "The governed response contract must be explicit.", stories: "1494339, 1494344", owner: "State / Tax SME + TDC + Gateway + Roger" },
  { id: "TAX-15", decision: "What is the minimum shared table structure for the State data-point inventory?", why: "The transcript identifies table structures as a key area of remaining clarity and State's next action is to consolidate the data points for sharing.", stories: "1494198, 1494222", owner: "State / Tax SME" },
  { id: "TAX-16", decision: "Which source and context attributes are most helpful to Orchestrator AI matching?", why: "Gary raised this explicitly; existing sample-based code does not resolve the approved matching context.", stories: "1494198, 1494222, 1494344", owner: "State / Tax SME + Orchestrator" },
  { id: "TAX-17", decision: "What user adjustment and mapping-restatement behavior is permitted?", why: "The transcript anticipates user interaction and restated mapping, but the controlled action and audit treatment are not yet confirmed.", stories: "1494344", owner: "State / Tax SME + Roger + TDC" },
  { id: "TAX-18", decision: "How are apportionment calculations, State modifications, attributes, State taxable income, and liabilities represented in the governed State dataset?", why: "These were named as the next data areas to lay out, with taxonomy-specific handling still to be defined.", stories: "1494222, 1494339", owner: "State / Tax SME + TDC" },
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
