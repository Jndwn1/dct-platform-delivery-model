import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";
import { POST_PILOT_PLANNING_INVENTORY, POST_PILOT_PLANNING_SUMMARY } from "../client/src/lib/postPilotPlanningInventory";

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
    expect(postPilot).toContain("9/16 – 9/22");
    expect(postPilot).toContain("9/23 – 10/6");
    expect(postPilot).toContain("10/7 – 10/20");
    expect(postPilot).toContain("10/21 – 11/3");
    expect(postPilot).toContain("11/4 – 11/17");
    expect(postPilot).toContain('title: "DCT"');
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
    expect(postPilot).toContain("PI4 Pod Delivery & Data Review Process");
    expect(postPilot).toContain("POD_DELIVERY_FLOW_IMAGE");
    expect(postPilot).toContain("/manus-storage/pi4-pod-delivery-data-review-process_8340aaca.png");
    expect(postPilot).toContain("Pod delivery and data review flow");
    expect(postPilot).toContain("Open readable flow");
    expect(postPilot).toContain('target="_blank"');
    expect(postPilot).toContain("Gary / Data Review");
    expect(postPilot).toContain("TDC/DCT cross-functional support path");
    expect(postPilot).toContain("TDC/DCT handles MVP/UAT defects, cross-pod data work, migration/shared technical work, and Scrum of Scrums capacity support");
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

    expect(planningModel).toContain('"pi4-manual-client-account-management": "Manual Custom Client Account Management"');
    expect(planningModel).toContain('"pi4-data-console": "DCT - Data Console"');
    expect(planningModel).toContain('"pi4-security-readiness": "DCT - Penetration Testing & Security Readiness"');
    expect(planningModel).toContain('"pi4-deferred-work": "DCT Deferred Work – Future Enhancements Backlog"');
    expect(planningModel).toContain('"pi4-ims-translation": "IMS Translation & Import Layer Design"');
    expect(platformContext).toContain("0 closed, 0 active, and 0% delivery progress");
    expect(platformContext).toContain("excluded from all PI4 and MVP delivery metrics");
  });

  it("registers the supplied planned features, source business values, and ADO dependency IDs without inventing commitment or sizing", () => {
    expect(POST_PILOT_PLANNING_INVENTORY).toHaveLength(14);
    expect(POST_PILOT_PLANNING_SUMMARY).toMatchObject({
      planningRecordCount: 14,
      uniqueFeatureCount: 13,
      markedCommittedCount: 0,
      sizedCount: 0,
      highValueCount: 13,
      unresolvedDependencyCount: 3,
    });
    expect(POST_PILOT_PLANNING_INVENTORY.map((record) => record.objectiveNumber)).toEqual(
      Array.from({ length: 14 }, (_, index) => String(index + 1)),
    );
    expect(POST_PILOT_PLANNING_INVENTORY.every((record) => record.objectiveNumber.trim().length > 0)).toBe(true);
    expect(POST_PILOT_PLANNING_INVENTORY.every((record) => record.committed === "Not captured" && record.sizing === "Not captured")).toBe(true);
    expect(POST_PILOT_PLANNING_INVENTORY).toEqual(expect.arrayContaining([
      expect.objectContaining({ featureId: "1441524", objectiveDescription: "Finding - 5.2 API and Payload Definitions", adoDependencies: ["1433863", "1483681"] }),
      expect.objectContaining({ featureId: "1451927", objectiveDescription: "Roger State Taxable Income MVP - State Filing Footprint", businessValue: 10, adoDependencies: ["1471480", "1472734"] }),
      expect.objectContaining({ featureId: "1490944", objectiveDescription: "Data Defect & Bug Management", businessValue: 10, adoDependencies: ["1477412", "1483802", "1483805", "1487890", "1488332", "1463645", "1477411", "1477413"] }),
      expect.objectContaining({ featureId: "1441528", objectiveDescription: "Finding 5.6 Security Implementation", adoDependencies: ["1472922", "1444513"] }),
    ]));
  });
});
