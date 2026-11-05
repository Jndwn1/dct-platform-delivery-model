import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const database = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  values: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({
      from: () => Object.assign([...database.rows], {
        where: async () => database.rows,
        orderBy: async () => database.rows,
      }),
    }),
    insert: () => ({ values: database.values }),
  })),
}));

import { appRouter } from "./routers";
import { buildPostPilotDeploymentWiki } from "../client/src/components/PostPilotDeploymentSnapshot";

const readProjectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");
const caller = () => appRouter.createCaller({ user: null, req: {}, res: {} } as TrpcContext);

const legacyWikiRecord = {
  deploymentId: "TEST-PO-REMOVAL",
  deploymentDate: "2026-11-05",
  releaseName: "Pilot Registry Removal Test",
  screenName: "State Filing Footprint",
  type: "Feature",
  platform: "TDC",
  status: "Deployed",
  environment: "QA, Dev, Perf",
  deploymentOwner: "Deployment Owner Kept",
  productOwner: "LEGACY_PO_DO_NOT_DISPLAY",
  relatedFeature: null,
  relatedStory: null,
  adoWorkItemId: null,
  summary: "Legacy compatibility fixture",
};

beforeEach(() => {
  database.rows = [];
  database.values.mockReset().mockResolvedValue({});
});

describe("Pilot Product Owner removal contract", () => {
  it("removes Product Owner from the scoped Create Deployment form and registry display", () => {
    const snapshot = readProjectFile("client/src/components/PostPilotDeploymentSnapshot.tsx");
    const environmentSelector = readProjectFile("client/src/components/DeploymentEnvironmentSelect.tsx");
    const environmentOptions = readProjectFile("shared/deploymentEnvironments.ts");
    const formStart = snapshot.indexOf("function CreatePostPilotDeploymentForm");
    const formEnd = snapshot.indexOf("export default function PostPilotDeploymentSnapshot");
    const form = snapshot.slice(formStart, formEnd);

    expect(form).not.toMatch(/form\.productOwner/);
    expect(form).not.toMatch(/set\(["']productOwner["']/);
    expect(form).not.toMatch(/Product Owner/);
    expect(form).toContain("Deployment Owner *");
    expect(form).toContain("Affected Screen / Capability *");
    expect(form).toContain("DeploymentEnvironmentSelect");
    expect(form).toContain('set("environment"');
    expect(environmentSelector).toContain("DEPLOYMENT_ENVIRONMENT_OPTIONS");
    expect(environmentOptions).toContain('"Perf"');

    const registryDisplay = snapshot.slice(snapshot.indexOf("export default function PostPilotDeploymentSnapshot"));
    expect(registryDisplay).not.toMatch(/<strong>Product owner:<\/strong>/i);
    expect(registryDisplay).toContain('"Chronological #", "Deployment", "Scope / Capability", "Deployment Summary & Traceability"');
  });

  it("does not emit a legacy Product Owner value or label in wiki Markdown", () => {
    const wiki = buildPostPilotDeploymentWiki([legacyWikiRecord]);

    expect(wiki).not.toContain("LEGACY_PO_DO_NOT_DISPLAY");
    expect(wiki).not.toMatch(/\| Product Owner \|/i);
    expect(wiki).toContain("# Data Gateway Release Notes");
    expect(wiki).toContain("| Deployment Owner | Deployment Owner Kept |");
    expect(wiki).toContain("| Scope / Capability | State Filing Footprint |");
    expect(wiki).toContain("| Environment | QA, Dev, Perf |");
    expect(wiki).toContain("**Jenniver Dawn Stafford**");
  });

  it("accepts an omitted Product Owner and stores the legacy column as an empty string", async () => {
    const result = await caller().postPilotDeploymentRegistry.create({
      releaseName: "No owner input",
      deploymentDate: "2026-11-05",
      deploymentOwner: "Required Deployment Owner",
      platform: "TDC",
      type: "Feature",
      screenName: "Affected Capability",
      environment: "Perf",
    });

    expect(result.success).toBe(true);
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({
      deploymentOwner: "Required Deployment Owner",
      productOwner: "",
      screenName: "Affected Capability",
      environment: "Perf",
    }));
  });

  it("keeps the scoped router optional/default behavior and has no destructive SQL", () => {
    const routers = readProjectFile("server/routers.ts");
    const start = routers.indexOf("postPilotDeploymentRegistry: router");
    const end = routers.indexOf("tdcMeetingRecaps: router", start);
    const registryRouter = routers.slice(start, end);

    expect(registryRouter).toMatch(/productOwner:\s*z\.string\(\)\.max\(128\)\.optional\(\)/);
    expect(registryRouter).toContain("productOwner: input.productOwner ?? \"\"");
    expect(registryRouter).not.toMatch(/delete\s+from|DROP\s+TABLE|TRUNCATE|DELETE\s+FROM/i);
    expect(registryRouter).not.toContain("db.delete(");
  });
});
