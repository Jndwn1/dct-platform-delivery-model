import { describe, expect, it } from "vitest";
import {
  ADO_WORK_ITEM_URL,
  buildPostPilotDeploymentWiki,
  buildChronologicalDeploymentNumbers,
  extractAdoIds,
  splitReleaseSource,
  type DeploymentWikiRecord,
} from "../client/src/lib/pilotDeploymentWiki";

type Fixture = DeploymentWikiRecord;

const fixture = (overrides: Partial<Fixture> = {}): Fixture => ({
  deploymentId: "PPDEP-2026-1101-001",
  deploymentDate: "2026-11-01",
  releaseName: "Pilot deployment",
  screenName: "State Filing Footprint",
  type: "Feature",
  platform: "TDC",
  status: "Deployed",
  environment: "QA, Dev, Perf",
  deploymentOwner: "Deployment Owner",
  productOwner: "legacy product owner must not be emitted",
  relatedFeature: "State filing capability",
  relatedStory: "Story 1234567",
  adoWorkItemId: null,
  summary: "Deployment summary.",
  ...overrides,
});

const tableLines = (markdown: string) =>
  markdown.split("<details>")[0].split("\n").filter((line) => line.startsWith("|"));

const deploymentRows = (markdown: string) =>
  tableLines(markdown).filter(
    (line) => !line.startsWith("| Chronological #") && !line.startsWith("|---")
  );

const details = (markdown: string) =>
  Array.from(markdown.matchAll(/<details><summary>(.*?)<\/summary>\n\n([\s\S]*?)<\/details>\n\n/g));

const exactHeader = (count: number) => [
  "# Data Gateway Release Notes",
  "",
  "> **Scope:** PI4 / Pilot Data Gateway release documentation",
  "> **Ordering:** Reverse chronological by deployment date",
  "> **Numbering:** Chronological by deployment date (earliest deployment is #1)",
  `> **Registry records represented:** ${count}`,
  "",
  "## Pilot Deployment Records",
  "",
].join("\n");

const exactSignature = "**Jenniver Dawn Stafford**  \nBusiness Analysis Manager  \n(CATT) Center for Advanced Tax Technology";

describe("Pilot deployment registry Markdown format", () => {
  it("emits one short overview row and one collapsed full-content section per record", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({
        releaseName: "State package <pilot>",
        type: "Technical Story",
        deploymentOwner: "Gary Luca",
        summary: "First paragraph.\nSecond paragraph with complete traceability.",
        adoWorkItemId: "1501980, 1501981",
      }),
    ]);

    expect(wiki).toContain("| Chronological # | Date | Deployment | Environment |");
    expect(wiki).toContain("|---:|---|---|---|");
    expect(tableLines(wiki)).toHaveLength(3);
    expect(deploymentRows(wiki)).toEqual([
      "| 1 | 2026-11-01 | **State package &lt;pilot&gt;** | QA, Dev, Perf |",
    ]);
    const table = tableLines(wiki).join("\n");
    expect(table).not.toMatch(/<br>|First paragraph|Second paragraph|Story 1234567|State Filing Footprint|Gary Luca|Technical Story|_workitems/);
    expect(details(wiki)).toHaveLength(1);
    expect(wiki).toContain("<details><summary>Deployment #1 — State package &lt;pilot&gt;</summary>\n\n");
    expect(wiki).toContain("**Deployment ID:** PPDEP-2026-1101-001");
    expect(wiki).toContain("**Date:** 2026-11-01");
    expect(wiki).toContain("**Type:** Technical Story");
    expect(wiki).toContain("**Status:** Deployed");
    expect(wiki).toContain("**Environment:** QA, Dev, Perf");
    expect(wiki).toContain("**Platform:** TDC");
    expect(wiki).toContain("**Scope / Capability:**\n\nState Filing Footprint");
    expect(wiki).toContain("**Related feature:**\n\nState filing capability");
    expect(wiki).toContain("**Related stories / bugs:**\n\nStory 1234567");
    expect(wiki).toContain("**Summary:**\n\nFirst paragraph.\nSecond paragraph with complete traceability.");
    expect(wiki).toContain("**ADO Work Item IDs (as recorded):** 1501980, 1501981");
    expect(wiki).toContain(`[1501980](${ADO_WORK_ITEM_URL}1501980)`);
    expect(wiki).toContain(`[1501981](${ADO_WORK_ITEM_URL}1501981)`);
    expect(wiki).toContain("**Deployment owner:** Gary Luca");
    expect(wiki).not.toContain("| Field | Details |");
    expect(wiki).not.toContain("legacy product owner must not be emitted");
    expect(wiki).not.toMatch(/Product owner/i);
  });

  it("preserves raw dates, retains duplicate records, numbers earliest first, and preserves registry order for same-date ties", () => {
    const records = [
      fixture({ deploymentId: "ZZ-TIE", deploymentDate: "2026-11-02", releaseName: "Tie Z", summary: "Z" }),
      fixture({ deploymentId: "EARLY", deploymentDate: "2026-10-01", releaseName: "Earliest", summary: "Early" }),
      fixture({ deploymentId: "AA-TIE", deploymentDate: "2026-11-02", releaseName: "Tie A", summary: "A" }),
      fixture({ deploymentId: "DUPLICATE", deploymentDate: "2026-11-02", releaseName: "Tie A", summary: "Duplicate raw record" }),
    ];
    const originalRecords = records.map((record) => ({ ...record }));
    const wiki = buildPostPilotDeploymentWiki(records);

    expect(wiki).toContain("> **Registry records represented:** 4");
    expect(deploymentRows(wiki)).toEqual([
      "| 4 | 2026-11-02 | **Tie Z** | QA, Dev, Perf |",
      "| 2 | 2026-11-02 | **Tie A** | QA, Dev, Perf |",
      "| 3 | 2026-11-02 | **Tie A** | QA, Dev, Perf |",
      "| 1 | 2026-10-01 | **Earliest** | QA, Dev, Perf |",
    ]);
    expect(details(wiki).map((match) => match[1])).toEqual([
      "Deployment #4 — Tie Z", "Deployment #2 — Tie A", "Deployment #3 — Tie A", "Deployment #1 — Earliest",
    ]);
    expect(wiki).toContain("Duplicate raw record");
    expect(records).toEqual(originalRecords);
    expect(buildChronologicalDeploymentNumbers(records).get("2026-10-01|EARLY")).toBe(1);
  });

  it("uses only explicit ADO IDs or the summary ADO Items Delivered section", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({
        deploymentId: "ADO-SUMMARY",
        relatedFeature: "Feature 7654320 must not become an ADO link",
        relatedStory: "Story 7654321 must not become an ADO link",
        adoWorkItemId: null,
        summary: "Deployment notes 7654323.\nADO Items Delivered\n1501982\n1501983\nDeployment Scope\nScope 7654324\nConsumer Impact\nImpact 7654325",
      }),
      fixture({
        deploymentId: "ADO-EXPLICIT",
        relatedStory: "Story 7654322",
        adoWorkItemId: "1501984, 1501984\n1501985 (as entered)",
        summary: "No ADO section here.",
      }),
    ]);

    for (const id of ["1501982", "1501983", "1501984", "1501985"]) {
      expect(wiki).toContain(`[${id}](${ADO_WORK_ITEM_URL}${id})`);
    }
    for (const id of ["7654320", "7654321", "7654322", "7654323", "7654324", "7654325"]) {
      expect(wiki).not.toContain(`_workitems/edit/${id}`);
    }
    expect(wiki.match(/\[1501984\]\(/g)).toHaveLength(1);
    expect(wiki).toContain("**ADO Work Item IDs (as recorded):** 1501984, 1501984<br>1501985 (as entered)");
    expect(extractAdoIds(splitReleaseSource("ADO Items Delivered\n1501982\nDeployment Scope\n7654324").adoItems, null)).toEqual(["1501982"]);
  });

  it("shortens only overview names to at most 100 characters with an explicit ellipsis", () => {
    const fullName = `${"Full release name ".repeat(12)}final source name`;
    const wiki = buildPostPilotDeploymentWiki([fixture({ releaseName: fullName })]);
    const overviewName = deploymentRows(wiki)[0].split(" | ")[2].replace(/^\*\*|\*\*$/g, "");

    expect(Array.from(overviewName)).toHaveLength(100);
    expect(overviewName).toBe(`${Array.from(fullName).slice(0, 99).join("")}…`);
    expect(wiki).toContain(`<summary>Deployment #1 — ${fullName}</summary>`);
    expect(wiki).toContain(`**Release name:** ${fullName}`);
  });

  it("keeps every multiline source field complete outside the overview without truncation or rewritten descriptions", () => {
    const longLines = Array.from({ length: 80 }, (_, index) => `Source line ${index}: complete original text.`);
    const source = longLines.join("\r\n");
    const wiki = buildPostPilotDeploymentWiki([fixture({
      screenName: source,
      relatedFeature: source,
      relatedStory: source,
      summary: `${source}\r\n\r\nLast original paragraph. Data-Gateway-Release-Notes-source.md`,
      adoWorkItemId: "1501980\r\n1501981\r\nRaw explicit source note.",
    })]);

    const body = details(wiki)[0][2];
    for (const label of ["Scope / Capability", "Related feature", "Related stories / bugs", "Summary"]) {
      expect(body).toContain(`**${label}:**\n\n${longLines.join("\n")}`);
    }
    expect(body).toContain("\n\nLast original paragraph. Data-Gateway-Release-Notes-source.md");
    expect(body).toContain("1501980<br>1501981<br>Raw explicit source note.");
    expect(tableLines(wiki).join("\n")).not.toContain("Source line");
    expect(body).not.toContain("…");
    expect(body).not.toContain("...");
  });

  it("preserves a supplied Markdown story table and authored links inside collapsed detail while escaping malicious HTML", () => {
    const storyTable = [
      "Full **authored** story notes.",
      "",
      "| ADO ID | Story |",
      "|---|---|",
      `| [7654321](${ADO_WORK_ITEM_URL}7654321) | **Existing** supplied story |`,
      "| 7654322 | Raw story ID — no inferred link |",
      "",
      "</details><script>alert('source')</script>",
      "",
      "Last original story paragraph.",
    ].join("\n");
    const wiki = buildPostPilotDeploymentWiki([fixture({ relatedStory: storyTable, adoWorkItemId: null })]);
    const body = details(wiki)[0][2];

    expect(deploymentRows(wiki)).toHaveLength(1);
    expect(tableLines(wiki)).toHaveLength(3);
    expect(body).toContain(`**Related stories / bugs:**\n\n${storyTable.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`);
    expect(body).toContain("\n| ADO ID | Story |\n|---|---|\n");
    expect(body).toContain(`| [7654321](${ADO_WORK_ITEM_URL}7654321) | **Existing** supplied story |`);
    expect(body).not.toContain("_workitems/edit/7654322");
    expect(body).toContain("**ADO work items:** —");
    expect(wiki).not.toMatch(/<script>/i);
    expect(wiki.match(/<details>/g)).toHaveLength(1);
    expect(wiki.match(/<\/details>/g)).toHaveLength(1);
    expect(body).toContain("\n\nLast original story paragraph.");
  });

  it("escapes HTML and injected details/script tags everywhere and fully escapes overview, titles, and metadata", () => {
    const injection = '</summary></details><details open><script>alert("x")</script> | & **bold** _italic_ `code` [link](javascript:bad) ![image](bad) # heading ~~strike~~ \\';
    const wiki = buildPostPilotDeploymentWiki([fixture({
      deploymentId: injection,
      deploymentDate: "2026-11-01",
      releaseName: injection,
      screenName: injection,
      relatedFeature: injection,
      relatedStory: injection,
      summary: `${injection}\nSecond line with complete source details.`,
      deploymentOwner: injection,
      type: injection,
      status: injection,
      environment: injection,
      platform: injection,
      adoWorkItemId: injection,
    })]);

    expect(wiki).not.toMatch(/<script|<details open|javascript:bad\)\]\(/i);
    expect(wiki.match(/<details>/g)).toHaveLength(1);
    expect(wiki.match(/<\/details>/g)).toHaveLength(1);
    expect(wiki.match(/<summary>/g)).toHaveLength(1);
    expect(wiki.match(/<\/summary>/g)).toHaveLength(1);
    expect(wiki).toContain("&lt;/summary&gt;&lt;/details&gt;&lt;details open&gt;&lt;script&gt;");
    expect(wiki).toContain("alert(&quot;x&quot;)");
    expect(wiki).toContain("&#124; &amp; \\*\\*bold\\*\\*");
    expect(wiki).toContain("\\_italic\\_");
    expect(wiki).toContain("\\`code\\`");
    expect(wiki).toContain("\\[link\\](javascript:bad)");
    expect(wiki).toContain("\\!\\[image\\](bad)");
    expect(wiki).toContain("\\# heading \\~\\~strike\\~\\~");
    expect(wiki).toContain("\nSecond line with complete source details.");
    expect(deploymentRows(wiki)[0].split("|")).toHaveLength(6);
    expect(details(wiki)).toHaveLength(1);
  });

  it("pairs default-collapsed details and requires blank lines after summary and closing details", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({ deploymentId: "FIRST", releaseName: "First" }),
      fixture({ deploymentId: "SECOND", releaseName: "Second" }),
    ]);

    expect(wiki.match(/<details>/g)).toHaveLength(2);
    expect(wiki.match(/<\/details>/g)).toHaveLength(2);
    expect(wiki.match(/<\/summary>\n\n/g)).toHaveLength(2);
    expect(wiki.match(/<\/details>\n\n/g)).toHaveLength(2);
    expect(wiki).not.toMatch(/<details\s+open(?:\s|>|=)/i);
    expect(details(wiki)).toHaveLength(2);
    expect(deploymentRows(wiki)).toHaveLength(2);
  });

  it("keeps the exact title, metadata header, and signature unchanged", () => {
    const wiki = buildPostPilotDeploymentWiki([fixture()]);

    expect(wiki.startsWith(exactHeader(1))).toBe(true);
    expect(wiki.endsWith(exactSignature)).toBe(true);
    expect(wiki).not.toContain("## Release Index");
    expect(wiki).toContain("## Pilot Deployment Records");
  });

  it("renders missing optional fields as empty-source dashes, without invented IDs or descriptions", () => {
    const wiki = buildPostPilotDeploymentWiki([fixture({
      relatedFeature: null, relatedStory: null, summary: null, adoWorkItemId: null,
    })]);

    for (const label of ["Related feature", "Related stories / bugs", "Summary"]) {
      expect(wiki).toContain(`**${label}:**\n\n—`);
    }
    for (const label of ["ADO Work Item IDs (as recorded)", "ADO work items"]) {
      expect(wiki).toContain(`**${label}:** —`);
    }
    expect(wiki).not.toContain("_workitems/edit/");
    expect(wiki).toContain("**Status:** Deployed");
  });

  it("renders the exact empty state without a fabricated table row or details section", () => {
    const wiki = buildPostPilotDeploymentWiki([]);

    expect(wiki).toBe(`${exactHeader(0)}\nNo Data Gateway release entries have been recorded in the Pilot Deployment Registry.\n\n${exactSignature}`);
    expect(tableLines(wiki)).toHaveLength(0);
    expect(details(wiki)).toHaveLength(0);
    expect(wiki).not.toContain("<details>");
  });
});
