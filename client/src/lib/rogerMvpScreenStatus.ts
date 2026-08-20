export type DeliveryStatus = "Completed" | "Done" | "In QA" | "In Progress" | "Not Started" | "Out of Scope" | "Not Functional";
export type QAReadinessStatus = "Ready to Test" | "Partially Ready" | "Not Ready" | "Out of Scope" | "Not Functional";
export type FunctionalStatus = "Functional (reported)" | "Functional with dependencies" | "Not stated" | "Not functional";

export interface RogerMvpScreenRecord {
  id: string;
  screen: string;
  deliveryStatus: DeliveryStatus;
  qaReadinessStatus: QAReadinessStatus;
  functionalStatus: FunctionalStatus;
  dependency: string;
  devReady: string;
  qaReady: string;
  uatReady: string;
  owner: string;
  notes: string;
  lastUpdated: string;
}

export const DELIVERY_STATUSES: DeliveryStatus[] = ["Completed", "Done", "In QA", "In Progress", "Not Started", "Out of Scope", "Not Functional"];
export const QA_READINESS_STATUSES: QAReadinessStatus[] = ["Ready to Test", "Partially Ready", "Not Ready", "Out of Scope", "Not Functional"];
export const ROGER_SCREEN_STATUS_STORAGE_KEY = "roger-mvp-screen-status-v2";

const SOURCE_UPDATE_DATE = "Aug 19, 2026";

export const ROGER_MVP_SCREEN_RECORDS: RogerMvpScreenRecord[] = [
  { id: "login", screen: "Login", deliveryStatus: "Completed", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "trial-balance-upload", screen: "Trial Balance Upload", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Validation issues", devReady: "Aug 15", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Amit", notes: "Validation issues remain in progress.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "entity-selection", screen: "Entity Selection", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Filtering incomplete", devReady: "Aug 18", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "line-mapping", screen: "Line Mapping", deliveryStatus: "In QA", qaReadinessStatus: "Ready to Test", functionalStatus: "Not stated", dependency: "Override refresh and re-approval defect", devReady: "Available", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Roger", notes: "Continue tracking the override refresh and historical re-approval defect during QA. Line Mapping Page is not a separate current MVP screen.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-return", screen: "Book Return", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Calculation updates", devReady: "Aug 22", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "review-submit", screen: "Review & Submit", deliveryStatus: "Not Started", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "Awaiting development", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "Sep 5 (TBD)", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "my-clients", screen: "My Clients Page", deliveryStatus: "In Progress", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "Entity Count, Deliverable Count, average completion percentage, approaching due date", devReady: "Aug 7", qaReady: "—", uatReady: "—", owner: "DCT / Nasar", notes: "Average completion to be completed separately. Open questions remain regarding On Track, Overdue, and At Risk.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "return-structure", screen: "Return Structure Management", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Not connected to Gateway", devReady: "—", qaReady: "—", uatReady: "—", owner: "Roger / DCT", notes: "Gateway supports creating and managing the return structure. Pending constraints on which entities can be added to a return (Krista/Process). Creation of elimination is scheduled for next sprint.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "return-filing", screen: "Return Filing Page", deliveryStatus: "In Progress", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "Issue Count", devReady: "TBD", qaReady: "—", uatReady: "—", owner: "—", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "summary-consolidation", screen: "Summary Page (inside Consolidation)", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Consolidations, Eliminations, Prior Year Data", devReady: "Aug 28, 2026 for Consolidations/Eliminations; TBD for PY Data", qaReady: "—", uatReady: "—", owner: "TDC / Gateway", notes: "TDC Ready; Gateway pending. Apart from Prior Year Data, the UI is ready.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "tb-line-mapping", screen: "TB With Line Mapping", deliveryStatus: "Completed", qaReadinessStatus: "Ready to Test", functionalStatus: "Not stated", dependency: "None", devReady: "Done", qaReady: "—", uatReady: "—", owner: "—", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-reclass-adjustments", screen: "Book/Reclass Adjustments", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Not stated", dependency: "Add New Account", devReady: "TBD", qaReady: "—", uatReady: "—", owner: "—", notes: "Open questions for Process team.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-return-review", screen: "Book Return Review", deliveryStatus: "Completed", qaReadinessStatus: "Ready to Test", functionalStatus: "Functional with dependencies", dependency: "Gateway API and Prior Year Data", devReady: "Screen is Functional", qaReady: "—", uatReady: "—", owner: "DCT", notes: "Gateway endpoint is not currently being used by the UI.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "tax-adjustment", screen: "Tax Adjustment", deliveryStatus: "In Progress", qaReadinessStatus: "Partially Ready", functionalStatus: "Functional with dependencies", dependency: "Valid data availability, Gateway API, testing and fixes if required", devReady: "Done", qaReady: "—", uatReady: "—", owner: "DCT", notes: "Adjustments are loading correctly and can be updated. Adjustment Rules data still needs to be confirmed.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-tax-report", screen: "Book to Tax Report", deliveryStatus: "Completed", qaReadinessStatus: "Ready to Test", functionalStatus: "Functional with dependencies", dependency: "Gateway API and Prior Year Data", devReady: "Screen is Functional — Tax Adjustment Amounts pending", qaReady: "—", uatReady: "—", owner: "DCT", notes: "Should use the same endpoint as Book Return Review.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-tax-reconciliation", screen: "Book to Tax Reconciliation", deliveryStatus: "In Progress", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "Gateway API", devReady: "TBD", qaReady: "—", uatReady: "—", owner: "DCT", notes: "Waiting for confirmation from Process team to add tags to taxonomy accounts that determine net income calculations for the Book-to-Tax Reconciliation report.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "1120-form", screen: "1120 Form", deliveryStatus: "In Progress", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "M-1 Line Mapping, M-2 Line Mapping", devReady: "TBD", qaReady: "—", uatReady: "—", owner: "DCT", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "sign-off", screen: "Sign Off", deliveryStatus: "In Progress", qaReadinessStatus: "Not Ready", functionalStatus: "Not stated", dependency: "Gateway API", devReady: "TBD", qaReady: "—", uatReady: "—", owner: "DCT", notes: "Confirmation of API readiness is needed for profile determination and entity characteristics.", lastUpdated: SOURCE_UPDATE_DATE },
];

export const ROGER_MVP_MILESTONES = [
  { milestone: "All MVP code in QA environment", owners: "Santosh, Stephane", date: "Aug 28, 2026", notes: "Target for all MVP code to be available in QA." },
  { milestone: "Tax Portal code to send Trial Balance to Roger in QA environment", owners: "Amit", date: "Aug 28, 2026", notes: "Trial Balance Upload screen Dev Ready Aug 15; QA Ready Aug 28. Validation issues are currently in progress." },
  { milestone: "QA team done testing", owners: "Sreedhar, Suvarna", date: "Sep 4, 2026", notes: "Dependent on stable environment availability for QA and performance testing." },
  { milestone: "MVP code available in UAT environment", owners: "Santosh, Stephane", date: "TBD", notes: "Code has previously been deployed to UAT, but it may not reflect the latest MVP changes. Final deployment date for the completed MVP code is still being determined." },
] as const;

export function countBy(records: RogerMvpScreenRecord[], field: "deliveryStatus" | "qaReadinessStatus", value: string) {
  return records.filter(record => record[field] === value).length;
}

export function getRogerScreenReadinessSummary(records: RogerMvpScreenRecord[] = ROGER_MVP_SCREEN_RECORDS) {
  return {
    total: records.length,
    ready: countBy(records, "qaReadinessStatus", "Ready to Test"),
    partial: countBy(records, "qaReadinessStatus", "Partially Ready"),
    notReady: countBy(records, "qaReadinessStatus", "Not Ready"),
  };
}

export function getRogerScreenDeliverySummary(records: RogerMvpScreenRecord[] = ROGER_MVP_SCREEN_RECORDS) {
  return {
    total: records.length,
    completed: countBy(records, "deliveryStatus", "Completed"),
    done: countBy(records, "deliveryStatus", "Done"),
    inQa: countBy(records, "deliveryStatus", "In QA"),
    inProgress: countBy(records, "deliveryStatus", "In Progress"),
    notStarted: countBy(records, "deliveryStatus", "Not Started"),
    outOfScope: countBy(records, "deliveryStatus", "Out of Scope"),
    notFunctional: countBy(records, "deliveryStatus", "Not Functional"),
  };
}
