import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ADMIN_NAVIGATION,
  HISTORICAL_TRAINING_NAVIGATION,
  OPERATING_MODEL_WORKSPACES,
} from "../client/src/lib/operatingModelNavigation";
import { resolvePageContext } from "../client/src/lib/pageContextRegistry";

describe("Phase 1 operating-model navigation", () => {
  it("defines the six approved workspaces with global Ask Buddy retained from the Executive workspace", () => {
    expect(OPERATING_MODEL_WORKSPACES.map((workspace) => workspace.title)).toEqual([
      "Executive Health",
      "Delivery Management",
      "Product & Roger Readiness",
      "Discovery & BA Workspace",
      "Architecture & Governance",
      "QA / UAT / Deployment",
    ]);

    const executive = OPERATING_MODEL_WORKSPACES.find((workspace) => workspace.id === "executive");
    expect(executive?.groups.flatMap((group) => group.links).some((link) => link.path === "/ask-buddy")).toBe(true);
  });

  it("preserves the shared Roger QA Registry as the screen-readiness source and classifies control access without removing routes", () => {
    const roger = OPERATING_MODEL_WORKSPACES.find((workspace) => workspace.id === "roger");
    const screenReadiness = roger?.groups.flatMap((group) => group.links).find((link) => link.label === "Screen Readiness");

    expect(screenReadiness).toMatchObject({ path: "/qa-deployment-registry", source: "Roger QA Registry" });
    expect(ADMIN_NAVIGATION).toContainEqual(expect.objectContaining({ path: "/control-panel", visibility: "Admin" }));
    expect(HISTORICAL_TRAINING_NAVIGATION).toContainEqual(expect.objectContaining({ path: "/guided-onboarding", visibility: "Historical / Training" }));
  });

  it("keeps all pre-restructure routes registered while replacing only sidebar organization", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");
    const sidebarSource = readFileSync(resolve(process.cwd(), "client/src/components/Sidebar.tsx"), "utf8");
    const preservedRoutes = [
      "/", "/batch-calendar", "/batch-roadmap", "/gate-status", "/touchpoints", "/architecture", "/architecture/developer", "/architecture/enterprise", "/architecture/sync", "/architecture/visio",
      "/integration-hub", "/integration-simulation", "/roger-consumer-readiness", "/consumer-integration-hub", "/roger-api", "/runtime-journey", "/control-panel", "/batch/:id", "/gate/overview", "/gate/:id",
      "/taxonomy", "/data-model", "/data-governance", "/roger-mapping", "/aap-review", "/batch-delivery-review", "/ask-buddy", "/tax-mapping", "/classification-walkthrough", "/gap-analysis", "/deployment-registry", "/qa-deployment-registry", "/qa-release-sim",
      "/discovery", "/discovery/ecosystem", "/discovery/platform-responsibilities", "/discovery/data-flow", "/discovery/simulation", "/discovery/integration-architecture", "/discovery/ba-requirements", "/discovery/checklist", "/discovery/glossary", "/discovery/dct-overview", "/discovery/roger-overview", "/discovery/gosystem", "/discovery/prior-year-inventory", "/discovery/pdc", "/discovery/master-data-governance", "/discovery/data-gateway", "/discovery/ba-story-builder", "/discovery/knowledge-graph", "/discovery/prior-year-migration",
      "/uat-testing", "/learning-center", "/onboarding", "/onboarding/step1", "/onboarding/step2", "/onboarding/step3", "/onboarding/step4", "/onboarding/step5", "/onboarding/step6", "/onboarding/step7", "/404",
    ];

    preservedRoutes.forEach((route) => expect(appSource).toContain(`path="${route}"`));
    ["Executive Health", "Delivery Management", "Product & Roger Readiness", "Discovery & BA Workspace", "Architecture & Governance", "QA / UAT / Deployment", "Advanced", "Admin", "Historical / Training"].forEach((label) => {
      expect(sidebarSource).toContain(`title="${label}"`);
    });
  });

  it("preserves historical and unlinked components for later archive review rather than deleting them in Phase 1", () => {
    const preservedComponentPaths = [
      "client/src/pages/AgentHub.tsx",
      "client/src/pages/BATouchpointSummary.tsx",
      "client/src/pages/BatchFlow.tsx",
      "client/src/pages/ComponentShowcase.tsx",
      "client/src/pages/DeliveryIntelligencePage.tsx",
      "client/src/pages/DemoRunner.tsx",
      "client/src/pages/IntegrationAlignmentHub.tsx",
      "client/src/pages/LineageExplorer.tsx",
      "client/src/pages/PlaceholderPage.tsx",
      "client/src/pages/QAReleasePrepPage.tsx",
      "client/src/pages/RegistryAudit.tsx",
      "client/src/pages/WeeklyDemo.tsx",
    ];

    preservedComponentPaths.forEach((componentPath) => {
      expect(existsSync(resolve(process.cwd(), componentPath))).toBe(true);
    });
  });

  it("keeps Ask Buddy page context available for retained pages and the new workspace hubs", () => {
    expect(resolvePageContext("/discovery/ba-requirements")?.pageTitle).toBe("BA Requirement Discovery");
    expect(resolvePageContext("/roger-mapping")?.pageTitle).toBe("Roger Mapping");
    expect(resolvePageContext("/workspace/delivery")?.pageTitle).toBe("Delivery Management");
    expect(resolvePageContext("/workspace/roger")?.businessRules).toContain("The 18-screen QA Registry remains the authoritative screen inventory");
    expect(resolvePageContext("/workspace/quality")?.pageTitle).toBe("QA / UAT / Deployment");
  });
});
