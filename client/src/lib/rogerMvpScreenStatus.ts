export type DeliveryStatus = "Completed" | "Done" | "In QA" | "In Progress" | "Not Started" | "Out of Scope" | "Not Functional";
export type QAReadinessStatus = "Ready to Test" | "Partially Ready" | "Not Ready" | "Out of Scope" | "Not Functional" | "Not stated";
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
export const QA_READINESS_STATUSES: QAReadinessStatus[] = ["Ready to Test", "Partially Ready", "Not Ready", "Out of Scope", "Not Functional", "Not stated"];
export const ROGER_SCREEN_STATUS_STORAGE_KEY = "roger-mvp-screen-status-v3";

const SOURCE_UPDATE_DATE = "Aug 26, 2026";

export const ROGER_MVP_SCREEN_RECORDS: RogerMvpScreenRecord[] = [
  { id: "login", screen: "Login", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "trial-balance-upload", screen: "Trial Balance Upload", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Roger / DCT", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "entity-selection", screen: "Entity Selection", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "line-mapping", screen: "Line Mapping", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Roger", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "qa", screen: "QA", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Calculation updates", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "Roger", notes: "QA team to validate amount calculation.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "my-clients", screen: "My Clients Page", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "DCT / Nasar", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "return-structure", screen: "Return Structure Management", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Roger / DCT", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "return-filing", screen: "Return Filing Page", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Issue Count", devReady: "Aug 26", qaReady: "Aug 28", uatReady: "—", owner: "DCT / Nasar", notes: "The Total Returns and Total Entities KPIs are unavailable because they are missing from the API response. Confirm API availability for Average Completion and Completed Returns. Return Structure count is not displaying correctly and needs confirmation on the structure-creation status. Has Members is unavailable. Issue Count is TBD.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "summary-consolidation", screen: "Summary Page — Inside Consolidation", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Consolidations, Eliminations, PY Data", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "TDC / Gateway", notes: "Gateway is still pending while TDC is ready. The UI is ready except for PY data, and there are no changes from Gateway. Most data points and the UI are complete through API aside from PY data. “Before NOL and special deduction” and “Net operating loss deduction” are confirmed as Not in MVP Scope.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "line-mapping-page", screen: "Line Mapping Page", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Available", uatReady: "—", owner: "—", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "tb-line-mapping", screen: "TB With Line Mapping", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "—", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-reclass-adjustments", screen: "Book/Reclass Adjustments", deliveryStatus: "Completed", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "None", devReady: "Available", qaReady: "Aug 28", uatReady: "—", owner: "Process", notes: "—", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-return-review", screen: "Book Return Review", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "PY Data", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT", notes: "The UI is not currently using the Gateway endpoint and PY remains pending. Line and PY Final Amount are unavailable through the API. Adjustments are not appearing on review, so an updated API is needed to identify the category, such as income or deduction, associated with each line item.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "tax-adjustment", screen: "Tax Adjustment", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Gateway API, Pending", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT", notes: "Adjustments are coming through correctly and can be updated. Adjustment Rules data still needs confirmation. Ramesh noted that the rule data remains in an invalid state and needs review by Krista. Account Name and Book Balance ($) are unavailable through API. MP-04 gift expense and MP-01 meals expense adjustment-rule fields show API Integration status as Unavailable. Adjustments data, Total Debit, and Total Credit are also unavailable through API.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-tax-report", screen: "Book to Tax Report", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Gateway API and PY Data", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT", notes: "Continue using the same endpoint as Book Return Review. PY remains pending and Tax Adjustment Amounts are also pending. Gateway currently returns: “No assembled consolidated return found for consolidationId, taxYear 2025.” Prior-Year Final Amount is unavailable and the amount hyperlink breakdown details still need to be provided.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "book-tax-reconciliation", screen: "Book to Tax Reconciliation", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Display on UI", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT", notes: "Awaiting Process team confirmation before adding tags to taxonomy accounts that drive net income calculations for the BTT Reconciliation report. Gateway is now up and running. Subtotals for Add-Back, Permanent, and Temporary Adjustments, along with Book Income Total and Taxable Income, are visible in the UI but remain unavailable through API and are pending Gateway API support.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "1120-form", screen: "1120 Form", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "M-1 Line Mapping, M-2 Line Mapping", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT", notes: "M-1 is not ready. Form 4562 is confirmed as Not Applicable for MVP and should be removed from the UI. Validate that the numbers are flowing correctly. Line, Description, and Final Tax Amount are not available for Schedule M-1 and M-2.", lastUpdated: SOURCE_UPDATE_DATE },
  { id: "sign-off", screen: "Sign Off", deliveryStatus: "In Progress", qaReadinessStatus: "Not stated", functionalStatus: "Not stated", dependency: "Gateway API, Integration and Testing Pending", devReady: "Aug 28", qaReady: "Aug 28", uatReady: "—", owner: "DCT / Roger UI", notes: "The API is confirmed ready to support both profile determination and entity characteristics. The Sign Off page still depends on DCT and Roger UI. Validate the UI flow first, including the skeleton, and then provide the required inputs. Track defect #1450692 — Sign-off failing for entity 4008715, TY2025; PDC missing ENTITY_TYPE, which blocks Profile Determinations.", lastUpdated: SOURCE_UPDATE_DATE },
];

export const ROGER_MVP_MILESTONES = [
  { milestone: "All MVP code in QA environment", owners: "Santosh, Stephane", date: "28-Aug", notes: "" },
  { milestone: "Tax Portal code to send Trial Balance to Roger in QA environment", owners: "Amit", date: "28-Aug", notes: "Trial Balance Upload screen — Dev Ready Aug 15, QA Ready Aug 28 (validation issues in progress)" },
  { milestone: "QA team done testing", owners: "Sreedhar, Suvarna", date: "9-Sep", notes: "Provided QA has environment availability and it is stable, for both QA and Performance." },
  { milestone: "MVP code available in UAT environment", owners: "Santosh, Stephane", date: "15-Sep", notes: "Code deployed to UAT previously but may not reflect latest MVP changes. Date for complete, current MVP code deployment to UAT is still being determined." },
] as const;

const REGISTRY_DELIVERY_ORDER: Record<DeliveryStatus, number> = {
  "In Progress": 0,
  "In QA": 1,
  "Not Started": 2,
  "Not Functional": 3,
  "Out of Scope": 4,
  "Done": 5,
  "Completed": 99,
};

export function orderRogerScreensForRegistry(records: RogerMvpScreenRecord[]) {
  return records
    .map((record, index) => ({ record, index }))
    .sort((left, right) => {
      const statusDifference = REGISTRY_DELIVERY_ORDER[left.record.deliveryStatus] - REGISTRY_DELIVERY_ORDER[right.record.deliveryStatus];
      return statusDifference || left.index - right.index;
    })
    .map(item => item.record);
}

export function countBy(records: RogerMvpScreenRecord[], field: "deliveryStatus" | "qaReadinessStatus", value: string) {
  return records.filter(record => record[field] === value).length;
}

export function getRogerScreenReadinessSummary(records: RogerMvpScreenRecord[] = ROGER_MVP_SCREEN_RECORDS) {
  return {
    total: records.length,
    ready: countBy(records, "qaReadinessStatus", "Ready to Test"),
    partial: countBy(records, "qaReadinessStatus", "Partially Ready"),
    notReady: countBy(records, "qaReadinessStatus", "Not Ready"),
    notStated: countBy(records, "qaReadinessStatus", "Not stated"),
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
