import { describe, expect, it } from "vitest";
import ts from "typescript";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import index from "./platformPageEvidence.generated.json";
import { buildBuddyPageIndex, INDEX_LIMITS } from "../scripts/buildBuddyPageIndex";
import { retrieveBuddyPageEvidence } from "./askBuddyPageEvidence";

const root = path.resolve(import.meta.dirname, "..");
const page = (pathname: string) => index.pages.find(item => item.path === pathname)!;
function appRoutes() {
  const sf = ts.createSourceFile("App.tsx", readFileSync(path.join(root, "client/src/App.tsx"), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const routes: string[] = [];
  function visit(node: ts.Node) {
    if ((ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) && node.tagName.getText(sf) === "Route") {
      for (const item of node.attributes.properties) if (ts.isJsxAttribute(item) && item.name.getText(sf) === "path") {
        let value = item.initializer;
        if (value && ts.isJsxExpression(value) && value.expression && ts.isStringLiteral(value.expression)) routes.push(value.expression.text);
        else if (value && ts.isStringLiteral(value)) routes.push(value.text);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);
  return routes;
}
function clientSources(folder = path.join(root, "client/src")): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap(item => item.isDirectory() ? clientSources(path.join(folder, item.name)) : /\.[cm]?[jt]sx?$/.test(item.name) ? [path.join(folder, item.name)] : []);
}

describe("build-time authored Buddy page index", () => {
  it("covers every literal App route automatically, including redirects and dynamic paths", () => {
    expect(index.pages.map(item => item.path)).toEqual(appRoutes());
    expect(index.pages.length).toBeGreaterThan(60);
    expect(new Set(index.pages.map(item => item.path)).size).toBe(index.pages.length);
    for (const item of index.pages) {
      expect(item.coverage.routeMapped).toBe(true);
      expect(item.title).toBeTruthy();
      expect(item.sourceFiles.length).toBeGreaterThan(0);
      expect(item.blocks.length).toBeGreaterThan(0);
      expect(item.coverage.notIncluded.join(" ")).toContain("not included");
    }
    expect(page("/batch/:id").component).toBe("BatchDetailPage");
    expect(page("/gate/:id").component).toBe("GateStatus");
    expect(page("/integration-hub").coverage).toMatchObject({ redirectTo: "/consumer-integration-hub" });
  });
  it("is deterministic and current against client authored sources", () => {
    expect(buildBuddyPageIndex(root)).toEqual(buildBuddyPageIndex(root));
    expect(buildBuddyPageIndex(root)).toEqual(index);
  }, 30_000);
  it("indexes imported semantic content and keeps scope and original numbers without evaluating expressions", () => {
    expect(page("/post-pilot").sourceFiles).toContain("client/src/lib/pilotFlowEvidence.ts");
    const pilot = page("/post-pilot").blocks.map(block => block.text).join("\n");
    expect(pilot).toContain("PROPOSED TARGET ARCHITECTURE — NOT COMPLETED IMPLEMENTATION");
    expect(pilot).toContain("Demonstrated with Dummy Data");
    expect(pilot).toContain("not the State IMS / GoSystem path");
    const tracker = page("/pi4-planning").blocks.map(block => block.text).join("\n");
    expect(tracker).toContain("Planning visibility");
    expect(tracker).toContain("Unassigned");
    expect(page("/workspace/delivery").title).toBe("Delivery Management");
    expect(page("/workspace/roger").title).toBe("Product & Roger Readiness");
    expect(page("/post-pilot").coverage.unresolvedExpressions).toBeGreaterThan(0);
  });
  it("bounds generated size and content, excluding server/config/images/URLs/raw code", () => {
    expect(Buffer.byteLength(JSON.stringify(index, null, 2) + "\n")).toBeLessThanOrEqual(INDEX_LIMITS.indexBytes);
    for (const item of index.pages) {
      expect(item.sourceFiles.length).toBeLessThanOrEqual(INDEX_LIMITS.filesPerPage);
      expect(item.blocks.length).toBeLessThanOrEqual(INDEX_LIMITS.blocksPerPage);
      expect(item.blocks.reduce((sum, block) => sum + block.text.length, 0)).toBeLessThanOrEqual(INDEX_LIMITS.textCharsPerPage);
      for (const file of item.sourceFiles) {
        expect(file).toMatch(/^client\/src\/(?:pages|components|lib)\//);
        expect(file).not.toMatch(/node_modules|\/ui\/|\/server\/|(?:env|config|trpc)\./i);
      }
      for (const block of item.blocks) {
        expect(block.text.length).toBeLessThanOrEqual(INDEX_LIMITS.blockChars);
        expect(block.text).not.toMatch(/https?:\/\/|data:|\/manus-storage\/|process\.env|import\.meta\.env|BEGIN .*PRIVATE KEY|=>|console\.(?:log|error|warn)/);
        expect(block.sourceFile).toMatch(/^client\/src\//);
      }
    }
  });
  it("is server-only, with no client imports or filesystem I/O at runtime, and bundles its JSON", async () => {
    const runtimeSource = readFileSync(path.join(root, "server/askBuddyPageEvidence.ts"), "utf8");
    expect(runtimeSource).not.toMatch(/from\s+["'](?:node:)?fs|readFile|existsSync|readdir|fetch\(/);
    for (const file of clientSources()) {
      expect(readFileSync(file, "utf8")).not.toMatch(/(?:from|import\s*\()[^\n]*(?:platformPageEvidence\.generated|server\/askBuddyPageEvidence)/);
    }
    const bundled = await build({ entryPoints: [path.join(root, "server/askBuddyPageEvidence.ts")], bundle: true, platform: "node", format: "esm", write: false, metafile: true });
    expect(Object.keys(bundled.metafile!.inputs)).toContain("server/platformPageEvidence.generated.json");
    expect(bundled.outputFiles[0].text).not.toMatch(/(?:from|import) ["'](?:node:)?fs/);
    expect(bundled.outputFiles[0].text).toContain("PROPOSED TARGET ARCHITECTURE");
  });
});

describe("retrieveBuddyPageEvidence", () => {
  it("matches literal paths and honors explicit user scope over the current page", () => {
    const result = retrieveBuddyPageEvidence("Describe /post-pilot target architecture", "/taxonomy")!;
    expect(result.paths).toEqual(["/post-pilot"]);
    expect(result.explicitPage).toBe(true);
    expect(result.evidenceBlock).toContain("NOT COMPLETED IMPLEMENTATION");
    expect(result.evidenceBlock).toMatch(/proposed|Proposed|PROPOSED/);
    expect(result.evidenceBlock).not.toContain("### Taxonomy Explorer");
    expect(retrieveBuddyPageEvidence("What does /no-such-page say?", "/post-pilot")).toBeNull();
  });
  it("supports names from multiple pages and exact-title aliases", () => {
    const result = retrieveBuddyPageEvidence("Compare Taxonomy Explorer and Data Governance & Source of Truth")!;
    expect(result.paths).toContain("/taxonomy");
    expect(result.paths).toContain("/data-governance");
    expect(result.explicitPage).toBe(true);
    expect(retrieveBuddyPageEvidence("Explain PI4 Sprint & Story Tracker")!.paths[0]).toBe("/pi4-planning");
    expect(retrieveBuddyPageEvidence("Tell me about Team Roger Executive PI4 Dashboard")!.paths[0]).toBe("/post-pilot/roger-pilot-backlog");
    expect(retrieveBuddyPageEvidence("What is Delivery Management?")!.paths[0]).toBe("/workspace/delivery");
  });
  it("supports route aliases and concrete dynamic IDs without claiming live per-record content", () => {
    const alias = retrieveBuddyPageEvidence("Explain /integration-hub")!;
    expect(alias.paths).toEqual(["/integration-hub"]);
    expect(alias.evidenceBlock).toContain("redirects to /consumer-integration-hub");
    const batch = retrieveBuddyPageEvidence("What is authored on /batch/B12?")!;
    expect(batch.paths).toEqual(["/batch/B12"]);
    expect(batch.evidenceBlock).toContain("NOT verified content or status for the requested ID");
    expect(retrieveBuddyPageEvidence("Describe /gate/G2")!.paths).toEqual(["/gate/G2"]);
    expect(retrieveBuddyPageEvidence("Summarize /architecture/visio")!.paths).toEqual(["/architecture/visio"]);
  });
  it("returns null for generic or unrelated questions even with a current page", () => {
    for (const query of ["", "Hello", "What is the weather in Seattle?", "Tell me a joke", "Explain the platform", "What is the status?", "Can you help me?", "What are live records?"]) {
      expect(retrieveBuddyPageEvidence(query, "/post-pilot"), query).toBeNull();
    }
    expect(retrieveBuddyPageEvidence("What does /ask-buddy say?", "/post-pilot")).toBeNull();
    expect(retrieveBuddyPageEvidence("Visit https://example.com/post-pilot for me")).toBeNull();
    expect(retrieveBuddyPageEvidence("Explain /api/batches/status")).toBeNull();
  });
  it("uses current page only for meaningful matching or an explicit this-page question", () => {
    const result = retrieveBuddyPageEvidence("Summarize this page", "/post-pilot")!;
    expect(result.paths[0]).toBe("/post-pilot");
    expect(result.explicitPage).toBe(false);
    expect(retrieveBuddyPageEvidence("Summarize this page", "/ask-buddy")).toBeNull();
    expect(retrieveBuddyPageEvidence("How does apportionment comparison work?", "/post-pilot")!.paths).toContain("/post-pilot");
  });
  it("caps retrieval at 3 pages and 12k characters, preserving safety context and qualifiers", () => {
    const question = "Compare /post-pilot, /taxonomy, /data-governance, /pi4-planning, /discovery/gosystem";
    const result = retrieveBuddyPageEvidence(question)!;
    expect(result.paths).toHaveLength(3);
    expect(result.evidenceBlock.length).toBeLessThanOrEqual(12_000);
    expect(result.evidenceBlock).toContain("not a browser visit");
    expect(result.evidenceBlock).toContain("unresolved");
    expect(result.evidenceBlock).toContain("Evidence boundary");
    expect(retrieveBuddyPageEvidence("/post-pilot " + "architecture ".repeat(20_000))!.evidenceBlock.length).toBeLessThanOrEqual(12_000);
    expect(retrieveBuddyPageEvidence(question)).toEqual(result);
  });
});
