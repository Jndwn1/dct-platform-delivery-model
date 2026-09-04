export type WorkspaceId = "executive" | "delivery" | "roger" | "discovery" | "architecture" | "quality";
export type NavigationVisibility = "Standard" | "Advanced" | "Admin" | "Historical / Training";

export type OperatingModelLink = {
  label: string;
  path: string;
  description: string;
  source: string;
  visibility: NavigationVisibility;
};

export type OperatingModelWorkspace = {
  id: WorkspaceId;
  title: string;
  path: string;
  icon: string;
  audience: string[];
  summary: string;
  source: string;
  groups: { title: string; links: OperatingModelLink[] }[];
};

export const OPERATING_MODEL_WORKSPACES: OperatingModelWorkspace[] = [
  {
    id: "executive",
    title: "Executive Health",
    path: "/",
    icon: "◉",
    audience: ["Executive", "PO", "Cross-functional"],
    summary: "MVP and PI health, readiness, milestones, risks, decisions, and delivery direction.",
    source: "Governed Delivery Model",
    groups: [
      {
        title: "Executive controls",
        links: [
          { label: "Executive Health", path: "/", description: "MVP, PI, readiness, milestone, risk, and decision summary.", source: "Governed Delivery Model", visibility: "Standard" },
          { label: "Ask Buddy", path: "/ask-buddy", description: "Evidence-grounded platform questions and source provenance.", source: "Governed platform evidence", visibility: "Standard" },
        ],
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery Management",
    path: "/workspace/delivery",
    icon: "▤",
    audience: ["PO", "BA", "Delivery", "Admin"],
    summary: "Plan, track, assure, and govern architectural batch delivery from pipeline through completion.",
    source: "Governed Delivery Model",
    groups: [
      {
        title: "Delivery flow",
        links: [
          { label: "Delivery Calendar", path: "/batch-calendar", description: "Current PI and batch delivery schedule.", source: "Governed Delivery Model", visibility: "Standard" },
          { label: "Current Pipeline", path: "/batch-roadmap", description: "Current and historical delivery pipeline context.", source: "Approved delivery roadmap", visibility: "Standard" },
          { label: "Delivery Assurance", path: "/workspace/delivery#assurance", description: "Governance gates, touchpoints, and delivery review access.", source: "Governed delivery assurance", visibility: "Standard" },
        ],
      },
      {
        title: "Delivery assurance",
        links: [
          { label: "Governance Gates", path: "/gate/overview", description: "Gate verification and readiness controls.", source: "Governance Gates", visibility: "Advanced" },
          { label: "Touchpoints", path: "/touchpoints", description: "DCT delivery touchpoint journey.", source: "Governed touchpoint model", visibility: "Advanced" },
          { label: "Batch Delivery Review", path: "/batch-delivery-review", description: "Batch review model and delivery evidence.", source: "Delivery review model", visibility: "Advanced" },
          { label: "Batch Control Panel", path: "/control-panel", description: "Controlled delivery status and reconciliation management.", source: "Governed Delivery Model", visibility: "Admin" },
        ],
      },
    ],
  },
  {
    id: "roger",
    title: "Product & Roger Readiness",
    path: "/workspace/roger",
    icon: "R",
    audience: ["PO", "BA", "QA", "Developer"],
    summary: "Roger screen readiness, UI/API mapping, consumer decisions, and confirmed product gaps.",
    source: "Roger QA Registry",
    groups: [
      {
        title: "Readiness evidence",
        links: [
          { label: "Screen Readiness", path: "/qa-deployment-registry", description: "Authoritative 18-screen QA Registry and release evidence.", source: "Roger QA Registry", visibility: "Standard" },
          { label: "UI Data Mapping", path: "/roger-mapping", description: "Screen-to-API mapping using the shared screen inventory.", source: "Roger QA Registry + registered API evidence", visibility: "Standard" },
          { label: "API Readiness", path: "/roger-api", description: "Roger API evolution and registered contract evidence.", source: "Registered API documentation", visibility: "Standard" },
          { label: "State Compliance Prototype", path: "/state-compliance", description: "Roger-aligned State filing workflow prototype from Return Filings through Outputs & Tracking.", source: "State Taxable Income MVP prototype + Roger UI references", visibility: "Standard" },
        ],
      },
      {
        title: "Consumer governance",
        links: [
          { label: "Consumer Decisions / ADRs", path: "/consumer-integration-hub", description: "Consumer readiness, ADRs, decisions, and dependencies.", source: "Consumer Integration Hub", visibility: "Standard" },
          { label: "Roger Overview", path: "/discovery/roger-overview", description: "Business and product reference for Roger responsibilities.", source: "Roger overview knowledge", visibility: "Advanced" },
        ],
      },
    ],
  },
  {
    id: "discovery",
    title: "Discovery & BA Workspace",
    path: "/workspace/discovery",
    icon: "⌕",
    audience: ["BA", "PO", "Cross-functional"],
    summary: "A governed discovery path from business requirement through readiness, story, traceability, and specialized data workspaces.",
    source: "Discovery knowledge and approved artifacts",
    groups: [
      {
        title: "Core BA flow",
        links: [
          { label: "Requirement Discovery", path: "/discovery/ba-requirements", description: "Business requirement intake and gap-analysis flow.", source: "BA Requirement Discovery", visibility: "Standard" },
          { label: "Readiness Checklist", path: "/discovery/checklist", description: "Story readiness and governance validation.", source: "Discovery Checklist", visibility: "Standard" },
          { label: "Story Builder", path: "/discovery/ba-story-builder", description: "Structured backlog artifact creation.", source: "BA Story Builder", visibility: "Standard" },
        ],
      },
      {
        title: "Specialized discovery",
        links: [
          { label: "Prior Year Workspace", path: "/workspace/discovery#prior-year", description: "Prior Year inventory, migration, traceability, mapping, coverage, gaps, and decisions.", source: "Approved PY inventory", visibility: "Standard" },
          { label: "Master Data & Governance", path: "/discovery/master-data-governance", description: "Authoritative Master Data artifact governance and active-domain evidence.", source: "Authoritative Master Data", visibility: "Standard" },
          { label: "Open Questions & Traceability", path: "/workspace/discovery#traceability", description: "Discovery questions, data/API dependencies, and connected knowledge context.", source: "Discovery evidence and decision records", visibility: "Standard" },
          { label: "Knowledge Graph", path: "/discovery/knowledge-graph", description: "Connected relationships across artifacts, batches, APIs, screens, and decisions.", source: "Discovery knowledge graph", visibility: "Advanced" },
          { label: "Data Gateway", path: "/discovery/data-gateway", description: "Specialized integration and source-data analysis.", source: "Data Gateway workspace", visibility: "Advanced" },
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "Architecture & Governance",
    path: "/workspace/architecture",
    icon: "⬡",
    audience: ["Architect", "Developer", "PO", "BA"],
    summary: "Current architecture, platform boundaries, data governance, mapping decisioning, ADRs, and lineage.",
    source: "Approved architecture artifacts and ADRs",
    groups: [
      {
        title: "Architecture primer",
        links: [
          { label: "Architecture Primer", path: "/workspace/architecture#primer", description: "Ecosystem, responsibilities, end-to-end flow, and integration architecture.", source: "Approved architecture artifacts", visibility: "Standard" },
          { label: "Platform Domains", path: "/workspace/architecture#domains", description: "PDC, DCT/TDC, Roger, and IMS boundaries.", source: "Platform domain references", visibility: "Standard" },
          { label: "Architecture Views", path: "/architecture", description: "Executive, developer, and diagram views.", source: "Architecture diagrams", visibility: "Standard" },
        ],
      },
      {
        title: "Governance and decisioning",
        links: [
          { label: "Data Governance", path: "/data-governance", description: "Source-of-truth, data-model, and taxonomy relationships.", source: "Data Governance & SoT", visibility: "Standard" },
          { label: "Mapping & Decisioning", path: "/gap-analysis", description: "Gap analysis, classification, confidence, and review models.", source: "Governed mapping evidence", visibility: "Advanced" },
          { label: "ADRs & Lineage", path: "/consumer-integration-hub", description: "Current decisions, decision status, dependencies, and consumer lineage.", source: "Current ADRs and decisions", visibility: "Advanced" },
        ],
      },
    ],
  },
  {
    id: "quality",
    title: "QA / UAT / Deployment",
    path: "/workspace/quality",
    icon: "✓",
    audience: ["QA", "BA", "PO", "Developer"],
    summary: "QA readiness, release evidence, UAT workflow, deployment history, known issues, and testing dependencies.",
    source: "QA Registry and Deployment Registry",
    groups: [
      {
        title: "Quality operations",
        links: [
          { label: "QA Registry", path: "/qa-deployment-registry", description: "Roger QA readiness, QA releases, and screen-level evidence.", source: "Roger QA Registry", visibility: "Standard" },
          { label: "QA Release Evidence", path: "/qa-deployment-registry", description: "Approved QA release notes and availability evidence.", source: "QA Deployment Registry", visibility: "Standard" },
          { label: "UAT Readiness", path: "/uat-testing", description: "UAT workflow capability, evidence, defects, risks, and readiness.", source: "UAT Testing", visibility: "Standard" },
          { label: "Deployments", path: "/deployment-registry", description: "Historical deployments and release traceability.", source: "Deployment Registry", visibility: "Standard" },
        ],
      },
      {
        title: "Training and reference",
        links: [
          { label: "QA Release Simulation", path: "/qa-release-sim", description: "Preserved training and simulation content.", source: "QA Release Simulation", visibility: "Historical / Training" },
        ],
      },
    ],
  },
];

export const ADVANCED_NAVIGATION: OperatingModelLink[] = [
  { label: "Developer Architecture", path: "/architecture/developer", description: "Developer-focused architecture view.", source: "Architecture diagrams", visibility: "Advanced" },
  { label: "Architecture Sync", path: "/architecture?tab=visio", description: "Preserved architecture synchronization view.", source: "Architecture Sync", visibility: "Advanced" },
  { label: "Runtime Journey", path: "/runtime-journey", description: "Cross-platform runtime touchpoint journey.", source: "Runtime Journey", visibility: "Advanced" },
  { label: "Taxonomy Explorer", path: "/taxonomy", description: "Taxonomy reference and navigation.", source: "Taxonomy source", visibility: "Advanced" },
  { label: "Tax Mapping Confidence", path: "/tax-mapping", description: "Mapping confidence reference.", source: "Tax Mapping Confidence", visibility: "Advanced" },
  { label: "AAP Review Model", path: "/aap-review", description: "Advanced review model.", source: "AAP Review Model", visibility: "Advanced" },
  { label: "Classification Walkthrough", path: "/classification-walkthrough", description: "Classification decision walkthrough.", source: "Classification Walkthrough", visibility: "Advanced" },
  { label: "Integration Simulation", path: "/integration-simulation", description: "Preserved integration simulation.", source: "Integration Simulation", visibility: "Advanced" },
  { label: "Provision & State Workspace", path: "/onboarding", description: "Specialized Provision and State discovery workspace.", source: "Provision & State discovery", visibility: "Advanced" },
];

export const ADMIN_NAVIGATION: OperatingModelLink[] = [
  { label: "Batch Control Panel", path: "/control-panel", description: "Controlled delivery status and source reconciliation.", source: "Governed Delivery Model", visibility: "Admin" },
];

export const HISTORICAL_TRAINING_NAVIGATION: OperatingModelLink[] = [
  { label: "Guided Onboarding", path: "/guided-onboarding", description: "Preserved staged onboarding sequence.", source: "Guided onboarding", visibility: "Historical / Training" },
  { label: "Learning Center", path: "/learning-center", description: "Preserved learning library.", source: "Learning Center", visibility: "Historical / Training" },
  { label: "QA Release Simulation", path: "/qa-release-sim", description: "Preserved QA simulation and training workflow.", source: "QA Release Simulation", visibility: "Historical / Training" },
];

export function getWorkspace(id: WorkspaceId) {
  return OPERATING_MODEL_WORKSPACES.find((workspace) => workspace.id === id) ?? null;
}
