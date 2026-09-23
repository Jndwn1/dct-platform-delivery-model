import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_STATUS, derivePICompletion } from "../client/src/contexts/BatchStatusContext";

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

    expect(dashboard).not.toContain("Post Pilot · Planning Visibility Only");
    expect(dashboard).not.toContain("PI4 Planning Visibility");
    expect(home).not.toContain('{ label: "PI 4", metric: piCompletion.pi4 }');

    expect(postPilot).toContain("Post Pilot");
    expect(postPilot).toContain("Post Pilot · Planning Visibility Only");
    expect(postPilot).toContain("0%");
    expect(postPilot).toContain("Planned PI4 Features");
    expect(postPilot).toContain("PI4_PLANNED_FEATURES");
    expect(postPilot).toContain("excluded from all PI4 and MVP delivery metrics");
    expect(postPilot).toContain('href="/pi4-planning"');
    expect(postPilot).not.toContain("Closed PI4 Features");
    expect(postPilot).not.toContain("Active PI4 Features");
    expect(app).toContain('path="/post-pilot" component={PostPilotPage}');
    expect(sidebar).toContain('["Executive Health", "Post Pilot", "Ask Buddy"]');

    expect(planningModel).toContain('"pi4-manual-client-account-management": "Manual Custom Client Account Management"');
    expect(planningModel).toContain('"pi4-data-console": "DCT - Data Console"');
    expect(planningModel).toContain('"pi4-security-readiness": "DCT - Penetration Testing & Security Readiness"');
    expect(planningModel).toContain('"pi4-deferred-work": "DCT Deferred Work – Future Enhancements Backlog"');
    expect(planningModel).toContain('"pi4-ims-translation": "IMS Translation & Import Layer Design"');
    expect(platformContext).toContain("0 closed, 0 active, and 0% delivery progress");
    expect(platformContext).toContain("excluded from all PI4 and MVP delivery metrics");
  });
});
