import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("preview startup performance", () => {
  it("defers dashboard workspaces until their routes are requested", () => {
    const app = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(app).toContain('import { lazy, Suspense } from "react";');
    expect(app).toContain('const Home = lazy(() => import("./pages/Home"));');
    expect(app).toContain('const BatchControlPanel = lazy(() => import("./pages/BatchControlPanel"));');
    expect(app).toContain('const AskBuddy = lazy(() => import("./pages/AskBuddy"));');
    expect(app).toContain('const MeetingRecapsPage = lazy(() => import("./pages/MeetingRecapsPage"));');
    expect(app).toContain("<Suspense fallback={<PageLoading />}>");
    expect(app).toContain("Loading workspace…");
    expect(app).not.toContain('import BatchControlPanel from "./pages/BatchControlPanel";');
    expect(app).not.toContain('import AskBuddy from "./pages/AskBuddy";');
  });
});
