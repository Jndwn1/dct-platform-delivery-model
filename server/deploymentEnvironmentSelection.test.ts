import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DEPLOYMENT_ENVIRONMENT_OPTIONS,
  hasDeploymentEnvironment,
  parseDeploymentEnvironments,
  setDeploymentEnvironmentChecked,
} from "../shared/deploymentEnvironments";

const readProjectFile = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("deployment environment selection", () => {
  it("keeps legacy single-value environments and parses trimmed combinations", () => {
    expect(parseDeploymentEnvironments("Production")).toEqual(["Production"]);
    expect(parseDeploymentEnvironments(" Production, QA, Dev ")).toEqual([
      "Production",
      "QA",
      "Dev",
    ]);
    expect(parseDeploymentEnvironments(" Production, , QA,, Dev ")).toEqual([
      "Production",
      "QA",
      "Dev",
    ]);
  });

  it("deduplicates parsed values while preserving their first-seen order", () => {
    expect(parseDeploymentEnvironments("QA, Production, QA, Dev, Production")).toEqual([
      "QA",
      "Production",
      "Dev",
    ]);
  });

  it("toggles selections in the governed option order and ignores unknown values", () => {
    expect(setDeploymentEnvironmentChecked("QA", "Production", true)).toBe("Production, QA");
    expect(setDeploymentEnvironmentChecked("Production, Dev", "UAT", true)).toBe(
      "Production, UAT, Dev",
    );
    expect(setDeploymentEnvironmentChecked("Production, QA", "Production", false)).toBe("QA");
    expect(setDeploymentEnvironmentChecked("unknown, QA", "Dev", true)).toBe("QA, Dev");
    expect(setDeploymentEnvironmentChecked("QA", "unknown", true)).toBe("QA");
  });

  it("checks exact environment tokens rather than substring matches", () => {
    expect(hasDeploymentEnvironment("Production, QA", "Production")).toBe(true);
    expect(hasDeploymentEnvironment(" Production ", "Production")).toBe(true);
    expect(hasDeploymentEnvironment("Production Ready, QA", "Production")).toBe(false);
    expect(hasDeploymentEnvironment("QA, Production Ready", "Production")).toBe(false);
    expect(hasDeploymentEnvironment("", "Production")).toBe(false);
  });

  it("defines all five environments in display order including Perf", () => {
    expect(DEPLOYMENT_ENVIRONMENT_OPTIONS).toEqual(["Production", "UAT", "QA", "Dev", "Perf"]);
  });

  it("allows Perf alone or alongside other environments without treating it as Production", () => {
    expect(setDeploymentEnvironmentChecked("", "Perf", true)).toBe("Perf");
    expect(setDeploymentEnvironmentChecked("QA, Dev", "Perf", true)).toBe("QA, Dev, Perf");
    expect(setDeploymentEnvironmentChecked("QA, Dev, Perf", "Perf", false)).toBe("QA, Dev");
    expect(hasDeploymentEnvironment("QA, Dev, Perf", "Perf")).toBe(true);
    expect(hasDeploymentEnvironment("QA, Dev, Perf", "Production")).toBe(false);
    expect(DEPLOYMENT_ENVIRONMENT_OPTIONS.join(", ").length).toBeLessThanOrEqual(64);
  });
});

describe("Pilot Create Deployment environment UI contract", () => {
  it("uses the shared checkbox select, keeps the menu open, and preserves required form behavior", () => {
    const component = readProjectFile("client/src/components/DeploymentEnvironmentSelect.tsx");
    const snapshot = readProjectFile("client/src/components/PostPilotDeploymentSnapshot.tsx");

    expect(component).toContain("DropdownMenuCheckboxItem");
    expect(component).toContain("event.preventDefault()");
    expect(component).toContain("onCheckedChange");
    expect(component).toContain("setDeploymentEnvironmentChecked");
    expect(component).toContain("value");
    expect(component).toContain("onChange");
    expect(component).toContain("aria-label");

    expect(snapshot).toContain("DeploymentEnvironmentSelect");
    expect(snapshot).toMatch(/<DeploymentEnvironmentSelect[\s\S]*value=\{form\.environment\}[\s\S]*onChange=/);
    expect(snapshot).toContain('set("environment"');
    expect(snapshot).toMatch(/disabled=\{[^}]*!form\.environment\.trim\(\)/);
    expect(snapshot).toContain('htmlFor="pilot-deployment-environments"');
    expect(snapshot).toContain('labelStyle}>Environment *</label>');
    expect(snapshot).not.toMatch(/<select[^>]*value=\{form\.environment\}/);

    expect(snapshot).toContain("required maxLength={8000} value={form.screenName}");
    expect(snapshot).toContain('set("screenName"');
    expect(snapshot).toContain("buildPostPilotDeploymentWiki");
    expect(snapshot).toContain("record.environment");
  });
});

describe("post-pilot deployment registry summary", () => {
  it("counts Production as a membership token within the scoped registry router", () => {
    const router = readProjectFile("server/routers.ts");
    const start = router.indexOf("postPilotDeploymentRegistry: router");
    const end = router.indexOf("tdcMeetingRecaps: router", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    const registryRouter = router.slice(start, end);

    expect(registryRouter).toContain("hasDeploymentEnvironment");
    expect(registryRouter).toContain('hasDeploymentEnvironment(record.environment, "Production")');
    expect(registryRouter).not.toContain('record.environment === "Production"');
  });
});
