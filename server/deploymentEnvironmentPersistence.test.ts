import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

const database = vi.hoisted(() => ({ rows: [] as Array<{ environment: string; status: string; platform: string }>, values: vi.fn() }));
vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({ from: () => Object.assign([...database.rows], { where: async () => database.rows }) }),
    insert: () => ({ values: database.values }),
  })),
}));

import { appRouter } from "./routers";
import { buildPostPilotDeploymentWiki } from "../client/src/components/PostPilotDeploymentSnapshot";

const caller = () => appRouter.createCaller({ user: null, req: {}, res: {} } as TrpcContext);
const input = {
  releaseName: "Multi-environment test", deploymentDate: "2026-11-05",
  deploymentOwner: "Test owner", productOwner: "Test product owner", platform: "TDC" as const,
  type: "Feature" as const, status: "Deployed" as const, screenName: "State Filing Footprint",
  environment: "UAT, QA, Dev",
};

beforeEach(() => { database.rows = []; database.values.mockReset().mockResolvedValue({}); });

describe("Pilot deployment multi-environment persistence", () => {
  it("saves all selected environments in one record with the associated screen", async () => {
    const result = await caller().postPilotDeploymentRegistry.create(input);
    expect(result.success).toBe(true);
    expect(database.values).toHaveBeenCalledTimes(1);
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ environment: "UAT, QA, Dev", screenName: "State Filing Footprint", platform: "TDC" }));
  });

  it("rejects an empty environment or missing screen without inserting a record", async () => {
    await expect(caller().postPilotDeploymentRegistry.create({ ...input, environment: " " })).rejects.toThrow();
    await expect(caller().postPilotDeploymentRegistry.create({ ...input, screenName: "" })).rejects.toThrow();
    expect(database.values).not.toHaveBeenCalled();
  });

  it("keeps existing single-environment submissions compatible", async () => {
    await caller().postPilotDeploymentRegistry.create({ ...input, environment: "QA" });
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ environment: "QA" }));
  });

  it("saves Perf alongside existing environments without changing associated screen tracking", async () => {
    await caller().postPilotDeploymentRegistry.create({ ...input, environment: "QA, Dev, Perf" });
    expect(database.values).toHaveBeenCalledTimes(1);
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ environment: "QA, Dev, Perf", screenName: input.screenName }));
  });

  it("counts a deployed production selection once, excluding non-production and planned releases", async () => {
    database.rows = [
      { environment: "Production", status: "Deployed", platform: "TDC" },
      { environment: "Production, UAT, QA, Dev, Perf", status: "Deployed", platform: "TDC" },
      { environment: "QA, Dev, Perf", status: "Deployed", platform: "TDC" },
      { environment: "Production, QA", status: "Planned", platform: "TDC" },
    ];
    expect(await caller().postPilotDeploymentRegistry.summary()).toEqual({ total: 4, production: 2, tdc: 4, rollbackCandidates: 0 });
  });

  it("retains the complete environment selection and associated screen in the wiki export", () => {
    const wiki = buildPostPilotDeploymentWiki([{ ...input, environment: "UAT, QA, Dev, Perf", deploymentId: "TEST-001", relatedFeature: null, relatedStory: null, adoWorkItemId: null, summary: null }]);
    expect(wiki).toContain("| Environment | UAT, QA, Dev, Perf |");
    expect(wiki).toContain("| Scope / Capability | State Filing Footprint |");
  });
});
