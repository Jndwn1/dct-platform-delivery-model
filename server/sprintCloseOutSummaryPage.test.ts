import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { TDC_SPRINT_CLOSEOUT_WORKFLOW } from "../client/src/lib/tdcSprintCloseoutWorkflow";

const source = readFileSync(resolve(import.meta.dirname, "../client/src/pages/SprintCloseOutSummaryPage.tsx"), "utf8");
const ast = ts.createSourceFile("SprintCloseOutSummaryPage.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function nodesMatching<T extends ts.Node>(guard: (node: ts.Node) => node is T): T[] {
  const matches: T[] = [];
  function visit(node: ts.Node) {
    if (guard(node)) matches.push(node);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return matches;
}

function declaredArray(name: string): ts.ArrayLiteralExpression {
  const declaration = nodesMatching(ts.isVariableDeclaration).find(node => ts.isIdentifier(node.name) && node.name.text === name);
  if (!declaration?.initializer) throw new Error(`Missing ${name} declaration`);
  const initializer = ts.isAsExpression(declaration.initializer) ? declaration.initializer.expression : declaration.initializer;
  if (!ts.isArrayLiteralExpression(initializer)) throw new Error(`${name} must be a static source list`);
  return initializer;
}

const calls = nodesMatching(ts.isCallExpression).map(node => node.expression.getText(ast));
const jsxElements = nodesMatching(ts.isJsxElement);
const openingTags = [
  ...nodesMatching(ts.isJsxOpeningElement),
  ...nodesMatching(ts.isJsxSelfClosingElement),
].map(node => node.tagName.getText(ast));

describe("Sprint Close Out Summary source-gated page", () => {
  it("uses the named heading and shared Meeting Recaps content shell without another sidebar", () => {
    const headings = jsxElements.filter(node => node.openingElement.tagName.getText(ast) === "h1");
    expect(headings).toHaveLength(1);
    expect(headings[0].children.map(node => node.getText(ast)).join("")).toBe("Sprint Close Out Summary");
    expect(source).toContain('maxWidth: "1340px"');
    expect(source).toContain('padding: "28px 32px 54px"');
    expect(openingTags).not.toContain("Sidebar");
    expect(openingTags).not.toContain("AppLayout");
  });

  it("provides the back link and the existing deployment overview anchor", () => {
    expect(source).toContain('href="/post-pilot/meeting-recaps"');
    expect(source).toContain("Back to Meeting Recaps");
    expect(source).toContain('href="/post-pilot#post-pilot-deployment-snapshot"');
    expect(source).toContain("TDC Deployment Registry – Overview");
  });

  it("shows actual source intake separately from validated package readiness", () => {
    expect(source).toContain("Waiting for source files");
    expect(source).toContain("Sources uploaded — validation pending");
    expect(source).toContain("Uploaded evidence has not yet been validated or approved.");
    expect(source).toContain("<SprintCloseoutUploads onIntakeState={setIntakeState} />");
    expect(source).toContain("Master workflow · Received");
    expect(source).toContain("No final email or PNGs will be produced until counts reconcile");
    expect(source).toContain("cross-sprint / cross-team comparisons are validated");
    expect(source).toContain("approved templates and deployment cutoff are verified");
    expect(source).toContain("No final artifacts or downloads are available yet.");
  });

  it("retains the exact user workflow rather than a rewritten or abridged version", () => {
    // Fingerprint of the originally uploaded pasted_content.txt, independent of upload storage.
    expect(createHash("sha256").update(TDC_SPRINT_CLOSEOUT_WORKFLOW).digest("hex"))
      .toBe("aef39a4a4cc306f6a8cac13d89bf79f648c0a26e2c62737243bca56beab718ed");
    expect(TDC_SPRINT_CLOSEOUT_WORKFLOW.length).toBe(9622);
    expect(source).toContain('from "@/lib/tdcSprintCloseoutWorkflow"');
    expect(source).toContain("<Streamdown controls={false}>{TDC_SPRINT_CLOSEOUT_WORKFLOW}</Streamdown>");
    const details = jsxElements.find(node => node.openingElement.tagName.getText(ast) === "details");
    expect(details?.getText(ast)).toContain("<Streamdown");
    expect(details?.openingElement.attributes.getText(ast)).not.toMatch(/\bopen\b/);
    expect(source).toContain("Reference instructions only—not an email draft or generated package.");
  });

  it("copies the complete workflow with clipboard success and failure feedback", () => {
    expect(calls).toContain("navigator.clipboard.writeText");
    expect(source).toContain("await navigator.clipboard.writeText(TDC_SPRINT_CLOSEOUT_WORKFLOW)");
    expect(source).toContain("if (!navigator.clipboard?.writeText)");
    expect(source).toContain('toast.success("Master workflow copied.")');
    expect(source).toMatch(/catch\s*\{\s*toast\.error\(/);
    expect(source).toContain("Check clipboard permissions");
    expect(source).toContain("onClick={copyWorkflow}");
    const buttons = jsxElements.filter(node => node.openingElement.tagName.getText(ast) === "button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getText(ast)).toContain("Copy Workflow");
  });

  it("lists exactly five named PNG outputs in the required order, awaiting evidence", () => {
    const graphics = declaredArray("intendedGraphics").elements;
    expect(graphics.every(ts.isStringLiteral)).toBe(true);
    expect(graphics.map(node => (node as ts.StringLiteral).text)).toEqual([
      "Sprint-over-Sprint Performance Comparison",
      "Sprint Closeout Summary",
      "Sprint Work Item Detail",
      "Executive Burndown Comparison",
      "TDC Deployment Registry",
    ]);
    const list = jsxElements.find(node => node.openingElement.tagName.getText(ast) === "ol");
    expect(list?.getText(ast)).toContain("intendedGraphics.map");
    expect(list?.getText(ast)).toContain("Awaiting validated inputs");
    expect(source).toContain("Outlook-ready executive email:</strong> Pending");
    expect(source).toContain("Downloadable HTML email:</strong> Pending");
  });

  it("requires metrics, reporting parents, prior evidence and all five original templates", () => {
    expect(declaredArray("sourceRequirements").elements).toHaveLength(6);
    expect(source).toContain("Current PI / sprint and closeout basis");
    expect(source).toContain("confirmed or projected");
    expect(source).toContain("explicitly approved projected closures");
    expect(source).toContain("Current metrics and ADO reporting parents");
    expect(source).toContain("ADO IDs, titles, statuses and delivery categories");
    expect(source).toContain("excluded child items are not counted twice");
    expect(source).toContain("Previous closeout and registry cutoff");
    expect(source).toContain("current cutoff evidence for new entries, dates, numbering and duplicate checks");
    expect(source).toContain("Five approved Sprint 5 PNG templates");
    expect(source).toContain("Supply all five original approved graphics");
    expect(source).toContain("Original PNG templates must be uploaded and reviewed separately.");
  });

  it("requires comparative burndown for each named team and flags requested priorities as missing", () => {
    expect(source).toContain("TDC, State, Provision, NV POD 1 and NV POD 2");
    expect(source).toContain("current and previous scope completion, average burndown, remaining work and scope increase");
    expect(source).toContain("tied rankings");
    expect(source).toContain("Upcoming priorities (optional)");
    expect(source).toContain("sourceStatus(index)");
    expect(source).toContain("include the section only when provided");
    expect(source).toContain("Requested · Awaiting source");
  });

  it("does not choose the current sprint or an automatic previous closeout baseline", () => {
    expect(source).toContain("No current PI, sprint or comparison baseline has been selected.");
    expect(source).toContain("Sprint 5 is the visual reference only, not an assumed current or comparison sprint.");
    expect(source).toContain("no baseline is chosen automatically");
    expect(source).not.toMatch(/\bPI\s*\d+\b|\bSprint\s*4\b/);
    expect(source).not.toMatch(/(?:current|previous|baseline)(?:Pi|PI|Sprint|Count|Cutoff)\s*[:=]\s*["'\d]/);
    expect(source).toContain("Requires reporting-basis confirmation");
    expect(source).not.toMatch(/localStorage|sessionStorage|new Date\(/);
  });

  it("reads only the live registry summary and never treats missing or failed loading as zero", () => {
    expect(calls.filter(name => name.startsWith("trpc."))).toEqual([
      "trpc.postPilotDeploymentRegistry.summary.useQuery",
    ]);
    expect(source).toContain("data: registrySummary, isLoading, isError");
    expect(source).toContain("Loading live registry count…");
    expect(source).toContain("The registry request failed; no count is assumed.");
    expect(source).toContain("Live registry count unavailable; no count is assumed.");
    expect(source).toMatch(/isLoading\s*\?[\s\S]*?isError\s*\?[\s\S]*?registrySummary\s*\?[\s\S]*?registrySummary\.total\.toLocaleString\(\)/);
    expect(source).not.toMatch(/\?\?\s*0|\|\|\s*0|total:\s*0|registrySummary\s*=\s*\{/);
    expect(source).toContain("aria-busy={isLoading}");
    expect(source).toContain('role="alert"');
    expect(source).toContain("This live count is NOT a closeout cutoff or a new-deployment count.");
    expect(source).toContain("registry records, not validated sprint deployments");
  });

  it("preserves the new-only registry graphic format without fabricating deployment rows", () => {
    expect(source).toContain("new-only rows, continuous numbering, columns # / Deployment / Date");
    expect(source).toContain("green header and alternating light-green / white rows");
    expect(source).toContain("Cutoff validation is required");
    expect(openingTags).not.toContain("table");
  });

  it("has working file intake but no fake generation, email sending or downloadable final artifacts", () => {
    expect(calls.some(name => /useMutation|\.mutate(?:Async)?$/.test(name))).toBe(false);
    expect(calls).not.toContain("fetch");
    expect(calls).not.toContain("URL.createObjectURL");
    expect(source).not.toMatch(/mailto:|download=|data:image|data:text|dangerouslySetInnerHTML/);
    expect(openingTags).not.toContain("input");
    expect(openingTags).not.toContain("form");
    expect(openingTags).not.toContain("img");
    expect(source).not.toMatch(/Generate (?:Package|Closeout|Email|Graphics)|Send Email/);
    expect(source).toContain("Uploading does not validate results, change deployment records, generate final graphics or distribute email.");
    expect(openingTags).toContain("SprintCloseoutUploads");
  });

  it("uses the professional RSM navy, green, blue, white and light-gray palette", () => {
    expect(source).toContain("RSM-style navy / green");
    for (const color of ["#0f172a", "#1e3a5f", "#047857", "#0f766e", "#ecfdf5", "#1d4ed8", "#ffffff", "#f8fafc"]) {
      expect(source).toContain(color);
    }
    expect(source).toContain("repeat(auto-fit, minmax(min(100%, 360px), 1fr))");
    expect(source).not.toMatch(/https?:\/\/|\/assets\/|\.png["']/);
  });
});
