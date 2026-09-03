import {
  BATCH_DELIVERY_RECORDS,
  GOVERNED_PROGRAM_HEALTH,
  MVP_DELIVERY_RECORDS,
  NON_BATCH_MVP_RECORDS,
  deriveMvpMetrics,
  type BatchStatusMap,
} from "@/contexts/BatchStatusContext";

export type MvpMilestoneStatus = "Complete" | "In Progress" | "At Risk / Confirmation Required" | "Upcoming";

type MvpMilestoneDefinition = {
  id: string;
  date: string;
  dateLabel: string;
  name: string;
  shortDescription: string;
  detail: string[];
  statusNotes?: string[];
  statusOverride?: Exclude<MvpMilestoneStatus, "At Risk / Confirmation Required">;
  sourceScope: "delivery" | "prior-year" | "environment" | "uat" | "release";
};

export type MvpCriticalMilestone = MvpMilestoneDefinition & {
  status: Exclude<MvpMilestoneStatus, "At Risk / Confirmation Required">;
  owner: string;
  source: string;
  confirmationRequired: boolean;
};

export const MVP_TARGET_DATE = GOVERNED_PROGRAM_HEALTH.pilotTargetDate;
export const MVP_TARGET_DATE_LABEL = "Sep 21, 2026";

// Dates and commitments come from the governing leadership milestone communication.
// Status is intentionally NOT stored here; it is derived below from shared delivery inputs.
export const MVP_CRITICAL_MILESTONE_SCHEDULE: MvpMilestoneDefinition[] = [
  {
    id: "critical-story-completion",
    date: "2026-08-21",
    dateLabel: "Aug 21, 2026",
    name: "Critical Story Completion",
    shortDescription: "Critical MVP story work is complete. TDC rule-result and adjustment items are complete, along with reporting page and sign-off development. Two unnecessary stories will be removed from the board.",
    detail: ["TDC rule-result and adjustment items complete", "Reporting page and sign-off development complete", "Two unnecessary stories to be removed from the board"],
    statusOverride: "Complete",
    sourceScope: "delivery",
  },
  {
    id: "remaining-stories-py-ready",
    date: "2026-08-28",
    dateLabel: "Aug 28, 2026",
    name: "Remaining Stories + PY Data Ready",
    shortDescription: "TWB PY mappings are complete. Standalone tool is successfully writing PY data into TDC.",
    detail: ["TWB PY mappings complete", "Standalone tool writing PY data into TDC", "TDC PY table and API surface for CCH migration in progress", "Final client mapping validation pending", "Authorization allow-list PR approval pending"],
    statusNotes: [
      "TDC PY table and API surface for CCH migration are in progress.",
      "Final mapping validation using a client with additional mapping rows is pending.",
      "Authorization allow-list PR approval is pending.",
    ],
    statusOverride: "Complete",
    sourceScope: "prior-year",
  },
  {
    id: "environment-readiness",
    date: "2026-08-28",
    dateLabel: "Aug 28, 2026",
    name: "Environment Readiness",
    shortDescription: "Reporting and sign-off changes are being pushed to Dev.",
    detail: ["Reporting and sign-off changes being pushed to Dev", "Roger UI handoff and backend/UI reconciliation in progress", "Tax Adjustments Workspace QA testing in progress", "QA findings consolidated into one defect for resolution"],
    statusNotes: [
      "Roger UI handoff and backend/UI reconciliation are still in progress.",
      "Tax Adjustments Workspace QA testing is in progress.",
      "QA findings have been consolidated into one defect for resolution.",
    ],
    statusOverride: "Complete",
    sourceScope: "environment",
  },
  {
    id: "uat-ready",
    date: "2026-09-03",
    dateLabel: "Sep 3, 2026",
    name: "UAT Ready",
    shortDescription: "Deploy MVP code to UAT, complete the required UAT data load, and begin formal validation.",
    detail: ["MVP code deployed to UAT", "Required UAT data load", "Formal UAT validation"],
    sourceScope: "uat",
  },
  {
    id: "mvp-target",
    date: MVP_TARGET_DATE,
    dateLabel: MVP_TARGET_DATE_LABEL,
    name: "MVP Target",
    shortDescription: "MVP release target and RC-3 delivery milestone.",
    detail: ["MVP release target", "RC-3 delivery milestone"],
    sourceScope: "release",
  },
];

const findRecord = (id: string) => [...BATCH_DELIVERY_RECORDS, ...NON_BATCH_MVP_RECORDS].find(record => record.id === id);

function statusFromActiveWork(activeWorkExists: boolean, allComplete: boolean): Exclude<MvpMilestoneStatus, "At Risk / Confirmation Required"> {
  if (allComplete) return "Complete";
  return activeWorkExists ? "In Progress" : "Upcoming";
}

export function deriveMvpCriticalMilestones(statuses: BatchStatusMap): MvpCriticalMilestone[] {
  const mvp = deriveMvpMetrics(statuses);
  const b31Pdc = findRecord("B31-PDC");
  const b31Tdc = findRecord("B31-TDC");
  const environment = findRecord("env-management") ?? { adoId: "1436035", owner: "Luca, Gary" };
  const qaWorkstream = findRecord("qa-workstream") ?? { adoId: "1408161", owner: "Kalakonda, Aravind" };

  return MVP_CRITICAL_MILESTONE_SCHEDULE.map(definition => {
    if (definition.sourceScope === "delivery") {
      const confirmationRequired = !definition.statusOverride && mvp.inDev === 0 && mvp.complete !== mvp.total;
      return {
        ...definition,
        status: definition.statusOverride ?? statusFromActiveWork(mvp.inDev > 0, mvp.complete === mvp.total),
        owner: "DCT Delivery Team",
        source: "10 technical stories and 2 bugs — from the governed ADO lifecycle",
        confirmationRequired,
      };
    }

    if (definition.sourceScope === "prior-year") {
      const hasEvidence = Boolean(b31Pdc && b31Tdc);
      return {
        ...definition,
        status: definition.statusOverride ?? (hasEvidence ? "In Progress" : "Upcoming"),
        owner: [b31Pdc?.owner, b31Tdc?.owner].filter(Boolean).join(" / ") || "Confirmation required",
        source: hasEvidence ? "B31 PDC and B31 TDC Active ADO records" : "No governed B31 Prior Year record available",
        confirmationRequired: !definition.statusOverride && !hasEvidence,
      };
    }

    if (definition.sourceScope === "environment") {
      const hasEvidence = Boolean(environment);
      return {
        ...definition,
        status: definition.statusOverride ?? (hasEvidence ? "In Progress" : "Upcoming"),
        owner: environment?.owner ?? "Confirmation required",
        source: hasEvidence ? `Environment Management ADO ${environment?.adoId}` : "No governed environment readiness record available",
        confirmationRequired: !definition.statusOverride && !hasEvidence,
      };
    }

    if (definition.sourceScope === "uat") {
      const hasEvidence = Boolean(qaWorkstream);
      return {
        ...definition,
        status: hasEvidence ? "In Progress" : "Upcoming",
        owner: qaWorkstream?.owner ?? "Confirmation required",
        source: hasEvidence ? `QA Workstream ADO ${qaWorkstream?.adoId}` : "No governed UAT readiness record available",
        confirmationRequired: !hasEvidence,
      };
    }

    return {
      ...definition,
      status: statusFromActiveWork(mvp.inDev > 0 || mvp.inReview > 0, mvp.complete === mvp.total),
      owner: "DCT Release Management",
      source: `${GOVERNED_PROGRAM_HEALTH.releaseCandidate} target ${GOVERNED_PROGRAM_HEALTH.pilotTargetDate}; governed MVP lifecycle`,
      confirmationRequired: false,
    };
  });
}

export function resolveMilestoneStatus(
  milestone: MvpCriticalMilestone,
  asOf: Date = new Date(),
): MvpMilestoneStatus {
  if (milestone.status === "Complete") return "Complete";
  const day = new Date(`${milestone.date}T23:59:59`);
  if (asOf > day) return "At Risk / Confirmation Required";
  return milestone.status;
}

export function getNextCriticalMilestone(
  milestones: MvpCriticalMilestone[],
  asOf: Date = new Date(),
) {
  return milestones.find(milestone => resolveMilestoneStatus(milestone, asOf) !== "Complete")
    ?? milestones[milestones.length - 1];
}
