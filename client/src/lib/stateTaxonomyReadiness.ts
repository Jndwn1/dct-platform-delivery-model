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

export type TaxonomyRequirement = { id: string; title: string; statement: string };

export const TDC_TAXONOMY_REQUIREMENTS: TaxonomyRequirement[] = [
  { id: "REQ-TAX-001", title: "Authoritative Taxonomy Identifier", statement: "TDC shall persist the authoritative State taxonomy identifier associated with each governed mapped State input." },
  { id: "REQ-TAX-002", title: "Source Value Preservation", statement: "TDC shall retain the original source value and source metadata associated with the mapped State input so that the mapping can be traced to its source." },
  { id: "REQ-TAX-003", title: "Orchestrator Mapping Preservation", statement: "TDC shall persist the Orchestrator-proposed taxonomy mapping independently from subsequent practitioner decisions." },
  { id: "REQ-TAX-004", title: "Taxonomy Version", statement: "TDC shall persist the taxonomy version, State profile version, rule version, or other approved version identifier used when the mapping was produced." },
  { id: "REQ-TAX-005", title: "Tax Year", statement: "TDC shall associate the governed State dataset and applicable taxonomy with the appropriate tax year." },
  { id: "REQ-TAX-006", title: "Jurisdiction", statement: "TDC shall associate each applicable State taxonomy record with the appropriate jurisdiction." },
  { id: "REQ-TAX-007", title: "Entity Context", statement: "TDC shall associate State taxonomy data with the appropriate entity, filing group, or other approved filing context." },
  { id: "REQ-TAX-008", title: "Dataset Identity", statement: "TDC shall provide a deterministic identifier for each governed Current-Year State Input Dataset." },
  { id: "REQ-TAX-009", title: "Dataset Versioning", statement: "TDC shall version governed State datasets when an approved version-triggering event occurs." },
  { id: "REQ-TAX-010", title: "Mapping Status", statement: "TDC shall persist the approved mapping status for each mapped State input." },
  { id: "REQ-TAX-011", title: "Practitioner Decision", statement: "TDC shall persist practitioner review, approval, rejection, correction, or remapping actions separately from the original Orchestrator result." },
  { id: "REQ-TAX-012", title: "Audit History", statement: "TDC shall retain previous mappings, decisions, corrections, actors, timestamps, reasons, and applicable versions required for auditability." },
  { id: "REQ-TAX-013", title: "Effective Mapping", statement: "TDC shall identify the currently effective governed mapping without deleting or overwriting prior mappings required for lineage." },
  { id: "REQ-TAX-014", title: "Supersession", statement: "When a newer governed mapping supersedes a prior mapping, TDC shall retain the superseded record and establish the relationship between the prior and current effective mapping." },
  { id: "REQ-TAX-015", title: "Validation", statement: "TDC shall enforce approved State taxonomy validation rules including required values, allowed taxonomy targets, valid statuses, and applicable jurisdiction/tax-year constraints." },
  { id: "REQ-TAX-016", title: "Invalid Mapping Target", statement: "TDC shall reject or flag mappings that reference taxonomy targets that are not valid for the applicable State, tax year, or taxonomy version." },
  { id: "REQ-TAX-017", title: "Filing Footprint", statement: "TDC shall associate State taxonomy data with the applicable filing footprint or approved filing-context identifier when required by the State data model." },
  { id: "REQ-TAX-018", title: "Payment Normalization", statement: "TDC shall persist State payment data using the approved State payment taxonomy and normalization rules." },
  { id: "REQ-TAX-019", title: "Lineage", statement: "TDC shall maintain lineage from source record through Orchestrator mapping, practitioner action, and effective governed result." },
  { id: "REQ-TAX-020", title: "Retrieval", statement: "TDC shall support retrieval of the effective State taxonomy mapping together with the applicable source, version, jurisdiction, entity context, and review status." },
  { id: "REQ-TAX-021", title: "Historical Retrieval", statement: "TDC shall support retrieval of historical mappings and practitioner actions required for audit and troubleshooting." },
  { id: "REQ-TAX-022", title: "Gateway Exposure", statement: "TDC shall expose the approved governed State taxonomy data and required metadata to Gateway for downstream use by Roger." },
  { id: "REQ-TAX-023", title: "No Business-Rule Derivation by TDC", statement: "TDC shall not independently derive State business meaning, taxonomy definitions, or State-specific mapping rules that have not been approved by the State business owner or Tax SME." },
  { id: "REQ-TAX-024", title: "Taxonomy Change Control", statement: "TDC shall preserve the taxonomy/version context under which an existing dataset was created unless an approved process explicitly creates a new governed dataset or mapping version." },
];

export type StoryImpact = { story: string; title: string; dependency: string; risk: ReadinessLevel; decision: string; owner: string };

export const CURRENT_DEV_STORY_IMPACTS: StoryImpact[] = [
  { story: "1494188", title: "PDC — Enable Current-Year State Source Documents Without Financial Mappings", dependency: "Approved State-processing context and the condition under which State documents may proceed without financial mappings.", risk: "Clarification needed", decision: "Confirm approved processing context, mapping-applicability signal, and State validation controls.", owner: "State / Tax SME + PDC" },
  { story: "1494198", title: "PDC — Create and Route Current-Year State Source Submissions for Orchestrator Classification", dependency: "StateFootprintVersion, taxonomy/rule context, and metadata sent to Orchestrator.", risk: "Clarification needed", decision: "Confirm context, version, and routing metadata that accompanies the submission.", owner: "State / Tax SME + PDC + Orchestrator" },
  { story: "1494222", title: "TDC — Persist and Govern the Orchestrator-Mapped Current-Year State Input Dataset", dependency: "Taxonomy target, dataset identity/lifecycle, mapping status, taxonomy version, payment normalization, validation, and lineage.", risk: "Material implementation risk", decision: "Confirm State taxonomy artifact, valid targets, identity model, lifecycle, statuses, and version triggers before final persistence design.", owner: "State / Tax SME + TDC" },
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
];

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
