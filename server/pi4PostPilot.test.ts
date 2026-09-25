import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";
import {
  POST_PILOT_PLANNING_INVENTORY,
  POST_PILOT_PLANNING_SOURCE_SELECTION,
  POST_PILOT_PLANNING_SUMMARY,
  POST_PILOT_PLANNING_SPRINT,
} from "../client/src/lib/postPilotPlanningInventory";

describe("PI4 Post Pilot delivery", () => {
  it("keeps PI4 at zero delivery progress because planning items are visibility-only", () => {
    expect(derivePICompletion(DEFAULT_STATUS).pi4).toEqual({ total: 0, complete: 0, pct: 0 });
    expect(DEFAULT_STATUS["pi4-manual-client-account-management"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-data-console"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-security-readiness"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-deferred-work"]).toBe("Not Started");
    expect(DEFAULT_STATUS["pi4-ims-translation"]).toBe("Not Started");
  });

  it("moves the PI4 planning card from the landing page to the dedicated Post Pilot page", () => {
    const dashboard = readFileSync(resolve(process.cwd(), "client/src/components/ExecDashboard.tsx"), "utf8");
    const home = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
    const postPilot = readFileSync(resolve(process.cwd(), "client/src/pages/PostPilotPage.tsx"), "utf8");
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const sidebar = readFileSync(resolve(process.cwd(), "client/src/components/Sidebar.tsx"), "utf8");
    const planningModel = readFileSync(resolve(process.cwd(), "client/src/contexts/BatchStatusContext.tsx"), "utf8");
    const platformContext = readFileSync(resolve(process.cwd(), "server/platformContext.ts"), "utf8");
    const pageContext = readFileSync(resolve(process.cwd(), "client/src/lib/pageContextRegistry.ts"), "utf8");
    const deploymentSnapshot = readFileSync(resolve(process.cwd(), "client/src/components/PostPilotDeploymentSnapshot.tsx"), "utf8");
    const prototypeFlow = readFileSync(resolve(process.cwd(), "client/src/components/StateProvisionPrototypeFlow.tsx"), "utf8");
    const router = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const schema = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");

    expect(dashboard).not.toContain("Post Pilot · Planning Visibility Only");
    expect(dashboard).not.toContain("PI4 Planning Visibility");
    expect(home).not.toContain('{ label: "PI 4", metric: piCompletion.pi4 }');

    expect(postPilot).toContain("Post Pilot");
    expect(postPilot).toContain("Post Pilot · Planning Visibility Only");
    expect(postPilot).toContain("0%");
    expect(postPilot).not.toContain("MVP Dashboard Metrics");
    expect(postPilot).not.toContain("Live portfolio baseline");
    expect(postPilot).not.toContain("MVP Features Complete");
    expect(postPilot).not.toContain("Roger QA Screens");
    expect(postPilot).not.toContain('label: "Unique Features"');
    expect(postPilot).toContain("Post Pilot Metrics");
    expect(postPilot).toContain("PI4 Sprint Timeline");
    expect(postPilot).not.toContain("PI4 · Batch");
    expect(postPilot).not.toContain("9/16 – 9/22");
    expect(postPilot).toContain("PI4 · Sprint 2");
    expect(postPilot).toContain("9/23 – 10/6");
    expect(postPilot).toContain("10/7 – 10/20");
    expect(postPilot).toContain("10/21 – 11/3");
    expect(postPilot).toContain("11/4 – 11/17");
    expect(postPilot).toContain("number: 2");
    expect(postPilot).toContain('title: "TDC"');
    expect(postPilot).not.toContain('title: "DCT"');
    expect(postPilot).toContain("UAT / MVP defects");
    expect(postPilot).toContain("High / Critical first");
    expect(postPilot).toContain('title: "State"');
    expect(postPilot).toContain("Filing Footprint");
    expect(postPilot).toContain("Automated Apportionment & Payments");
    expect(postPilot).toContain("State Taxonomy / GoSystem Alignment");
    expect(postPilot).toContain("Package 1 — Return to Provision");
    expect(postPilot).toContain("Prior-Year Provision + Prior-Year Tax Return ingestion");
    expect(postPilot).toContain("RTP calculation / data foundation");
    expect(postPilot).toContain("Corrections and governed downstream outputs");
    expect(postPilot).toContain("Entity Mapping Requirements");
    expect(postPilot).toContain("Non-Legal Entities");
    expect(postPilot).not.toContain("Sprint 2 goals — Pending Confirmation");
    expect(postPilot).toContain("Planned Features and ADO Dependencies");
    expect(postPilot).toContain('import StateProvisionPrototypeFlow from "@/components/StateProvisionPrototypeFlow"');
    expect(postPilot).toContain("<StateProvisionPrototypeFlow />");
    expect(postPilot.indexOf("<StateProvisionPrototypeFlow />")).toBeGreaterThan(postPilot.indexOf("Planned Features and ADO Dependencies"));
    expect(postPilot.indexOf("<StateProvisionPrototypeFlow />")).toBeLessThan(postPilot.indexOf("State & Provision Prototypes"));
    expect(prototypeFlow).toContain("Roger State &amp; Provision End-to-End Process Flow");
    expect(prototypeFlow).toContain("IMS—not Roger or DCT—owns return-engine routing and payload translation");
    expect(prototypeFlow).toContain("GoSystem is the representative State POC path");
    expect(prototypeFlow).toContain("iTax Provision scope and contracts remain to be defined");
    expect(prototypeFlow).toContain("System Roles &amp; Ownership");
    expect(prototypeFlow).toContain('system: "Roger"');
    expect(prototypeFlow).toContain('system: "TDC"');
    expect(prototypeFlow).toContain('system: "B9A Gateway"');
    expect(prototypeFlow).toContain('system: "IMS"');
    expect(prototypeFlow).toContain('system: "GoSystem"');
    expect(prototypeFlow).toContain('system: "iTax"');
    expect(prototypeFlow).toContain("Integration broker");
    expect(prototypeFlow).toContain("roger-state-provision-end-to-end-process-flow_20c79e7c.png");
    expect(prototypeFlow).toContain("Open readable flow");
    expect(postPilot).toContain("State & Provision Prototypes");
    expect(postPilot).toContain("Roger — State Compliance Prototype");
    expect(postPilot).toContain('href="/state-compliance"');
    expect(postPilot).toContain("Open State Prototype");
    expect(postPilot).toContain('const PROVISION_PROTOTYPE_URL = "https://rogertaxpro-bkwikmrm.manus.space/"');
    expect(postPilot).toContain("Roger — Tax Provision Prototype");
    expect(postPilot).toContain("Open Provision Prototype");
    expect(postPilot.indexOf("State & Provision Prototypes")).toBeGreaterThan(postPilot.indexOf("Planned Features and ADO Dependencies"));
    expect(postPilot.indexOf("State & Provision Prototypes")).toBeLessThan(postPilot.indexOf("PI4 Pod Delivery & Data Review Process"));
    expect(postPilot).toContain("Sprint Metrics");
    expect(postPilot).toContain("Source-backed");
    expect(postPilot).toContain("Pending source");
    expect(postPilot).toContain("ADO work items");
    expect(postPilot).toContain("Feature and ADO work-item metrics will populate");
    expect(postPilot).toContain('import PostPilotDeploymentSnapshot from "@/components/PostPilotDeploymentSnapshot"');
    expect(postPilot).toContain("<PostPilotDeploymentSnapshot />");
    expect(postPilot.indexOf("<PostPilotDeploymentSnapshot />")).toBeGreaterThan(postPilot.indexOf("pi4-sprint-metrics"));
    expect(deploymentSnapshot).toContain("Post Pilot Deployment Registry");
    expect(deploymentSnapshot).toContain("trpc.postPilotDeploymentRegistry.summary.useQuery()");
    expect(deploymentSnapshot).toContain("trpc.postPilotDeploymentRegistry.list.useQuery()");
    expect(deploymentSnapshot).toContain("Create Deployment");
    expect(deploymentSnapshot).toContain("Create Post Pilot Deployment");
    expect(deploymentSnapshot).toContain("Copy Wiki Markdown");
    expect(deploymentSnapshot).toContain("buildPostPilotDeploymentWiki");
    expect(deploymentSnapshot).toContain("affected screen / capability is required");
    expect(deploymentSnapshot).toContain("Total Deployments");
    expect(deploymentSnapshot).toContain("Production Releases");
    expect(deploymentSnapshot).toContain("PDC Deployments");
    expect(deploymentSnapshot).toContain("TDC Deployments");
    expect(deploymentSnapshot).toContain("Open Rollback Candidates");
    expect(deploymentSnapshot).toContain("Post Pilot Deployment Records");
    expect(deploymentSnapshot).toContain("No Post Pilot deployments recorded");
    expect(deploymentSnapshot).toContain("Screen / Capability");
    expect(deploymentSnapshot).toContain("Deployment status is intentionally excluded from this summary view");
    expect(deploymentSnapshot).toContain("does not change PI4 sprint progress");
    expect(deploymentSnapshot).not.toContain('href="/deployment-registry"');
    expect(schema).toContain('postPilotDeployments = mysqlTable("post_pilot_deployments"');
    expect(schema).toContain('screenName: varchar("screenName", { length: 256 }).notNull()');
    expect(router).toContain("postPilotDeploymentRegistry: router");
    expect(router).toContain("from(postPilotDeployments)");
    expect(router).toContain("screenName: z.string().min(1).max(256)");
    expect(router).toContain("PPDEP-");
    expect(postPilot).toContain("PI4 Pod Delivery & Data Review Process");
    expect(postPilot).toContain("POD_DELIVERY_FLOW_IMAGE");
    expect(postPilot).toContain("/manus-storage/pi4-pod-delivery-data-review-process_8340aaca.png");
    expect(postPilot).toContain("Pod delivery and data review flow");
    expect(postPilot).toContain("Open readable flow");
    expect(postPilot).toContain('target="_blank"');
    expect(postPilot).toContain("Gary / Data Review");
    expect(postPilot).toContain("TDC/DCT cross-functional support path");
    expect(postPilot).toContain("TDC/DCT handles MVP/UAT defects, cross-pod data work, migration/shared technical work, and Scrum of Scrums capacity support");
    expect(postPilot).toContain('import StateProvisionStoryReview from "@/components/StateProvisionStoryReview"');
    expect(postPilot).toContain("<StateProvisionStoryReview />");
    expect(postPilot).not.toContain("deriveMvpMetrics");
    expect(postPilot).not.toContain("getRogerScreenReadinessSummary");
    expect(postPilot).toContain("POST_PILOT_PLANNING_INVENTORY");
    expect(postPilot).toContain("excluded from all PI4 and MVP delivery metrics");
    expect(postPilot).toContain('href="/pi4-planning"');
    expect(postPilot).not.toContain("Closed PI4 Features");
    expect(postPilot).not.toContain("Active PI4 Features");
    expect(postPilot).toContain('import StateGoSystemPoc, { StateGoSystemPocClosingDetails } from "@/components/StateGoSystemPoc"');
    expect(postPilot.indexOf("<StateGoSystemPoc />")).toBeGreaterThan(postPilot.indexOf("Post Pilot feature inventory"));
    expect(app).toContain('path="/post-pilot" component={PostPilotPage}');
    expect(sidebar).toContain('["Executive Health", "Post Pilot", "Ask Buddy"]');
    expect(pageContext).toContain('"Roger to GoSystem State Calculation POC"');
    expect(pageContext).toContain('"State Calculation POC"');
    expect(pageContext).toContain('"State / Provision Story Review"');
    expect(pageContext).toContain('"1494344"');

    expect(planningModel).toContain('"pi4-manual-client-account-management": "Manual Custom Client Account Management"');
    expect(planningModel).toContain('"pi4-data-console": "DCT - Data Console"');
    expect(planningModel).toContain('"pi4-security-readiness": "DCT - Penetration Testing & Security Readiness"');
    expect(planningModel).toContain('"pi4-deferred-work": "DCT Deferred Work – Future Enhancements Backlog"');
    expect(planningModel).toContain('"pi4-ims-translation": "IMS Translation & Import Layer Design"');
    expect(platformContext).toContain("0 closed, 0 active, and 0% delivery progress");
    expect(platformContext).toContain("excluded from all PI4 and MVP delivery metrics");
  });

  it("registers the supplied Sprint 2 planned features and ADO dependencies without inventing commitment or sizing", () => {
    expect(POST_PILOT_PLANNING_SPRINT).toBe("PI4 · Sprint 2");
    expect(POST_PILOT_PLANNING_SOURCE_SELECTION).toBe("Supplied ADO backlog selection");
    expect(POST_PILOT_PLANNING_INVENTORY).toHaveLength(4);
    expect(POST_PILOT_PLANNING_SUMMARY).toMatchObject({
      planningRecordCount: 4,
      uniqueFeatureCount: 4,
      markedCommittedCount: 0,
      sizedCount: 0,
      highValueCount: 4,
      linkedAdoDependencyCount: 18,
      unresolvedDependencyCount: 0,
    });
    expect(POST_PILOT_PLANNING_INVENTORY.map((record) => record.objectiveNumber)).toEqual(
      Array.from({ length: 4 }, (_, index) => String(index + 1)),
    );
    expect(POST_PILOT_PLANNING_INVENTORY.every((record) => record.objectiveNumber.trim().length > 0)).toBe(true);
    expect(POST_PILOT_PLANNING_INVENTORY.every((record) => record.committed === "Not captured" && record.sizing === "Not captured")).toBe(true);
    expect(POST_PILOT_PLANNING_INVENTORY).toEqual(expect.arrayContaining([
      expect.objectContaining({ featureId: "1441524", objectiveDescription: "Finding - 5.2 API and Payload Definitions", adoDependencies: ["1483681", "1433863"] }),
      expect.objectContaining({ featureId: "1461160", objectiveDescription: "User-Defined Nonstandard TDC Codes", adoDependencies: ["1454679", "1450150"] }),
      expect.objectContaining({ featureId: "1490944", objectiveDescription: "Data Defect & Bug Management", businessValue: 10, adoDependencies: ["1488496", "1488477", "1463645", "1488332", "1488494", "1488497", "1487890", "1483802", "1477411", "1477413", "1477373", "1492007"] }),
      expect.objectContaining({ featureId: "1441528", objectiveDescription: "Finding - 5.6 Security Implementation", adoDependencies: ["1482205", "1472922"] }),
    ]));
  });

  it("provides a repeatable Ask Buddy first-pass and Gary final technical review model without inventing Story 1494344 requirements", () => {
    const review = readFileSync(resolve(process.cwd(), "client/src/components/StateProvisionStoryReview.tsx"), "utf8");
    const storyReviewBuddy = readFileSync(resolve(process.cwd(), "client/src/components/StoryReviewAskBuddy.tsx"), "utf8");
    const knowledge = readFileSync(resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"), "utf8");

    expect(review).toContain("Ask Buddy First Pass + Gary Technical Review");
    expect(review).toContain("Ask Buddy / Manus does not replace Gary’s final technical review");
    expect(review).toContain("Gateway and TDC — Save State Practitioner Mapping, Correction, and Review Actions");
    expect(review).toContain("ADO_1494344_Gateway_TDC_State_Practitioner_Actions_Review.md");
    expect(review).toContain('import StoryReviewAskBuddy from "@/components/StoryReviewAskBuddy"');
    expect(review).toContain("<StoryReviewAskBuddy />");
    expect(review).not.toContain("Worked example");
    expect(review).not.toContain("Example review status");
    expect(review).not.toContain("Open ADO work item");
    expect(review).not.toContain("Visual review process");
    expect(review).not.toContain("state-provision-ask-buddy-gary-review-flow");
    expect(review).not.toContain("Ask Buddy First-Pass Review Checklist");
    expect(review).not.toContain("Example ownership table");
    expect(review).not.toContain("Data-contract review");
    expect(review).not.toContain(">Markdown review file</div>");
    expect(review).not.toContain("Gary’s TDC / Gateway Development Standard");
    expect(review).not.toContain("Story evidence intake");
    expect(review).not.toContain("Jenniver review dashboard");
    expect(review).not.toContain("Process principle");
    expect(storyReviewBuddy).toContain("Ask Buddy — Story Review Agent");
    expect(storyReviewBuddy).toContain('currentPagePath: "/post-pilot"');
    expect(storyReviewBuddy).toContain('capability: "story-review"');
    expect(storyReviewBuddy).toContain("Gary remains the final technical reviewer");
    expect(storyReviewBuddy).toContain("What are the key gaps that Gary should review for Story 1494344?");
    expect(knowledge).toContain("Ask Buddy does **not** replace Gary");
    expect(knowledge).toContain("Tech Story 1494344");
  });

  it("publishes the evidence-bound current-year State review package for Gary without treating first-pass output as a technical approval", () => {
    const review = readFileSync(resolve(process.cwd(), "client/src/components/StateProvisionStoryReview.tsx"), "utf8");
    const knowledge = readFileSync(resolve(process.cwd(), "server/discoveryKnowledgeBase.ts"), "utf8");
    const pageContext = readFileSync(resolve(process.cwd(), "client/src/lib/pageContextRegistry.ts"), "utf8");

    expect(review).toContain("Current-year State review package");
    expect(review).toContain("First-pass findings for Gary");
    expect(review).toContain("PI4 · Sprint 2 (9/23–10/6)");
    expect(review).not.toContain("PI4 · Batch 2");
    expect(review).toContain("1494188");
    expect(review).toContain("1494198");
    expect(review).toContain("1494222");
    expect(review).toContain("1494339");
    expect(review).toContain("1494344");
    expect(review).toContain("Current_Year_State_Story_First_Pass_Review_Report_for_Gary");
    expect(review).toContain("Download all reviews (.zip)");
    expect(review).toContain("Current_Year_State_Story_Review_Package_for_Gary_5d3a36f5.zip");
    expect(review).toContain("Download report (.md)");
    expect(review).toContain("Download review (.md) ↓");
    expect(review).toContain('const GARY_EMAIL = "Gary.Luca@rsmus.com"');
    expect(review).toContain("FIRST_PASS_REVIEW_CYCLE");
    expect(review).toContain("Review #");
    expect(review).toContain("First-pass review date");
    expect(review).toContain("Sep 24, 2026");
    expect(review).toContain("reviewNumber: 5");
    expect(review).toContain("First-pass review files:");
    expect(review).toContain("First pass: ${review.reviewedOn}");
    expect(review).toContain("Review file: ${reviewUrl}");
    expect(review).toContain('const PUBLIC_REVIEW_ASSET_ORIGIN = "https://dctdash-6z8sjwgc.manus.space"');
    expect(review).toContain("function createFirstPassReviewEmail()");
    expect(review).toContain("Open review (.md) ↗");
    expect(review).toContain('"text/html"');
    expect(review).toContain("Copy Outlook-ready table");
    expect(review).toContain("Table copied with formatting and live review-file links");
    expect(review).toContain("useState(GARY_EMAIL)");
    expect(review).toContain("Gary’s email address");
    expect(review).toContain("Open linked email draft");
    expect(review).toContain("mailto:");
    expect(review).toContain("Gary’s final review remains required");
    expect(knowledge).toContain("Current-year State review package");
    expect(knowledge).toContain("1494222 needs the greatest TDC scrutiny");
    expect(pageContext).toContain("Current-Year State Review Package");
    expect(pageContext).toContain("Inline Story Review Ask Buddy Agent");
    expect(pageContext).toContain("1494188");
  });
});
