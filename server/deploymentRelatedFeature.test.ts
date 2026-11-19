import { describe, expect, it, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import type { TrpcContext } from "./_core/context";

const database = vi.hoisted(() => ({
  rows: [] as Array<Record<string, unknown>>,
  values: vi.fn(),
}));

vi.mock("./db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({ from: () => database.rows }),
    insert: () => ({ values: database.values }),
  })),
}));

import { appRouter } from "./routers";
import { buildPostPilotDeploymentWiki } from "../client/src/lib/pilotDeploymentWiki";

const caller = () => appRouter.createCaller({ user: null, req: {}, res: {} } as TrpcContext);
const input = {
  releaseName: "Related feature length regression",
  deploymentDate: "2026-11-17",
  deploymentOwner: "Test owner",
  platform: "TDC" as const,
  type: "Feature" as const,
  status: "Deployed" as const,
  screenName: "State Filing Footprint",
  environment: "QA",
};

beforeEach(() => {
  database.rows = [];
  database.values.mockReset().mockResolvedValue({});
});

describe("Pilot deployment Related Feature persistence", () => {
  it.each([257, 4000])("accepts exactly %i characters and passes them unchanged to insert", async (length) => {
    const relatedFeature = "x".repeat(length);

    await caller().postPilotDeploymentRegistry.create({ ...input, relatedFeature });

    expect(database.values).toHaveBeenCalledTimes(1);
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ relatedFeature }));
  });

  it("rejects 4001 characters before inserting", async () => {
    await expect(caller().postPilotDeploymentRegistry.create({ ...input, relatedFeature: "x".repeat(4001) })).rejects.toThrow();
    expect(database.values).not.toHaveBeenCalled();
  });

  it("stores an omitted Related Feature as null and keeps old short input compatible", async () => {
    await caller().postPilotDeploymentRegistry.create(input);
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ relatedFeature: null }));

    database.values.mockClear();
    await caller().postPilotDeploymentRegistry.create({ ...input, relatedFeature: "Return Assembly" });
    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ relatedFeature: "Return Assembly" }));
  });

  it("preserves multiline Related Feature text in persistence and wiki export", async () => {
    const relatedFeature = "Federal Workflow\nPrior-Year Rollforward\r\nState Filing Footprint";
    await caller().postPilotDeploymentRegistry.create({ ...input, relatedFeature });

    expect(database.values).toHaveBeenCalledWith(expect.objectContaining({ relatedFeature }));
    const wiki = buildPostPilotDeploymentWiki([{
      ...input,
      deploymentId: "PPDEP-2026-1117-001",
      relatedFeature,
      relatedStory: null,
      adoWorkItemId: null,
      summary: null,
      productOwner: "",
    }]);
    expect(wiki).toContain("**Related feature:**\n\nFederal Workflow\nPrior-Year Rollforward\nState Filing Footprint");
    expect(wiki).toContain("# Data Gateway Release Notes");
    expect(wiki).toContain("**Jenniver Dawn Stafford**  ");
    expect(wiki).toContain("Business Analysis Manager  ");
    expect(wiki).toContain("(CATT) Center for Advanced Tax Technology");
  });
});

describe("Pilot Related Feature contract and UI guardrails", () => {
  it("uses TEXT only for Pilot Related Feature while other registry fields remain varchar(256)", () => {
    const schema = readFileSync(new URL("../drizzle/schema.ts", import.meta.url), "utf8");
    const pilotStart = schema.indexOf('postPilotDeployments = mysqlTable("post_pilot_deployments"');
    const pilotEnd = schema.indexOf("});", pilotStart);
    const pilotSchema = schema.slice(pilotStart, pilotEnd);

    expect(pilotSchema).toContain('relatedFeature: text("relatedFeature")');
    expect(schema).toContain('relatedFeature: varchar("relatedFeature", { length: 256 })');
    expect(pilotSchema).not.toContain('relatedFeature: varchar("relatedFeature"');
  });

  it("keeps the Pilot textarea id, 4000-character limit, and live count", () => {
    const component = readFileSync(new URL("../client/src/components/PostPilotDeploymentSnapshot.tsx", import.meta.url), "utf8");
    expect(component).toContain('id="pilot-deployment-related-feature"');
    expect(component).toContain('<textarea id="pilot-deployment-related-feature" maxLength={4000}');
    expect(component).toContain("{form.relatedFeature.length.toLocaleString()} / 4,000 characters");
  });
});
