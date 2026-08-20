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
    shortDescription: "Complete identified critical MVP stories required to keep the release on schedule.",
    detail: ["Leadership-critical MVP story list"],
    sourceScope: "delivery",
  },
  {
    id: "remaining-stories-py-ready",
    date: "2026-08-27",
    dateLabel: "Aug 27, 2026",
    name: "Remaining Stories + PY Data Ready",
    shortDescription: "Complete remaining MVP stories, both PY data stories, and initial CCH/TWB loads for selected test clients.",
    detail: ["Remaining MVP stories", "Both PY data stories", "Initial CCH and TWB test-client loads"],
    statusNotes: [
      "TWB PY Data is pending validation with Krista/Jenniver.",
      "CCH code will be retrieved from IMS through the Export API.",
    ],
    sourceScope: "prior-year",
  },
  {
    id: "environment-readiness",
    date: "2026-08-28",
    dateLabel: "Aug 28, 2026",
    name: "Environment Readiness",
    shortDescription: "Gateway, PDC, TDC, Demo, and Production environments operational and available.",
    detail: ["Gateway", "PDC", "TDC", "Demo", "Production"],
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
  const environment = findRecord("env-management");
  const qaWorkstream = findRecord("qa-workstream");

  return MVP_CRITICAL_MILESTONE_SCHEDULE.map(definition => {
    if (definition.sourceScope === "delivery") {
      const confirmationRequired = mvp.inDev === 0 && mvp.complete !== mvp.total;
      return {
        ...definition,
        status: statusFromActiveWork(mvp.inDev > 0, mvp.complete === mvp.total),
        owner: "DCT Delivery Team",
        source: "8 technical stories and 3 bugs — from the governed ADO lifecycle",
        confirmationRequired,
      };
    }

    if (definition.sourceScope === "prior-year") {
      const hasEvidence = Boolean(b31Pdc && b31Tdc);
      return {
        ...definition,
        status: hasEvidence ? "In Progress" : "Upcoming",
        owner: [b31Pdc?.owner, b31Tdc?.owner].filter(Boolean).join(" / ") || "Confirmation required",
        source: hasEvidence ? "B31 PDC and B31 TDC review-ready ADO records" : "No governed B31 Prior Year record available",
        confirmationRequired: !hasEvidence,
      };
    }

    if (definition.sourceScope === "environment") {
      const hasEvidence = Boolean(environment);
      return {
        ...definition,
        status: hasEvidence ? "In Progress" : "Upcoming",
        owner: environment?.owner ?? "Confirmation required",
        source: hasEvidence ? `Environment Management ADO ${environment?.adoId}` : "No governed environment readiness record available",
        confirmationRequired: !hasEvidence,
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
