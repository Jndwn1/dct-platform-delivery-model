import { describe, expect, it } from "vitest";
import { buildPostPilotDeploymentWiki } from "../client/src/components/PostPilotDeploymentSnapshot";

type Fixture = Parameters<typeof buildPostPilotDeploymentWiki>[0][number];

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
  markdown.split("\n").filter((line) => line.startsWith("|"));

const deploymentRows = (markdown: string) =>
  tableLines(markdown).filter(
    (line) => !line.startsWith("| Chronological #") && !line.startsWith("|---")
  );

describe("Pilot deployment registry Markdown format", () => {
  it("emits one four-column table with full deployment details in each row", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({
        deploymentId: "PPDEP-2026-1101-001",
        deploymentDate: "2026-11-01",
        releaseName: "State package <pilot>",
        screenName: "State Filing Footprint",
        relatedFeature: "State filing capability",
        relatedStory: "Story 1234567",
        environment: "QA, Dev, Perf",
        type: "Technical Story",
        deploymentOwner: "Gary Luca",
        summary: "First paragraph.\nSecond paragraph with complete traceability.",
        adoWorkItemId: "1501980, 1501981",
      }),
    ]);

    expect(wiki).toContain(
      "| Chronological # | Deployment | Scope / Capability | Deployment Summary & Traceability |"
    );
    expect(wiki).toContain("|---:|---|---|---|");
    expect(tableLines(wiki)).toHaveLength(3);
    expect(deploymentRows(wiki)).toHaveLength(1);

    const row = deploymentRows(wiki)[0];
    expect(row).toContain("**State package &lt;pilot&gt;**");
    expect(row).toContain("2026-11-01");
    expect(row).toContain("QA, Dev, Perf");
    expect(row).toContain("Technical Story");
    expect(row).toContain("**State Filing Footprint**");
    expect(row).toContain("State filing capability");
    expect(row).toContain("Story 1234567");
    expect(row).toContain("First paragraph.<br>Second paragraph with complete traceability.");
    expect(row).toContain("[1501980](https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1501980)");
    expect(row).toContain("[1501981](https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1501981)");
    expect(row).toContain("**Deployment owner:** Gary Luca");
    expect(wiki).not.toContain("See **Deployment");
    expect(wiki).not.toContain("| Field | Details |");
    expect(wiki).not.toContain("## Deployment ");
    expect(wiki).not.toContain("legacy product owner must not be emitted");
  });

  it("preserves raw dates, retains duplicate records, numbers earliest first, and preserves registry order for same-date ties", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({ deploymentId: "ZZ-TIE", deploymentDate: "2026-11-02", releaseName: "Tie Z", summary: "Z" }),
      fixture({ deploymentId: "EARLY", deploymentDate: "2026-10-01", releaseName: "Earliest", summary: "Early" }),
      fixture({ deploymentId: "AA-TIE", deploymentDate: "2026-11-02", releaseName: "Tie A", summary: "A" }),
      fixture({ deploymentId: "DUPLICATE", deploymentDate: "2026-11-02", releaseName: "Tie A", summary: "Duplicate raw record" }),
    ]);

    expect(wiki).toContain("> **Registry records represented:** 4");
    expect(deploymentRows(wiki)).toHaveLength(4);
    expect(wiki).toContain("| 1 | **Earliest**");
    expect(wiki).toContain("2026-10-01");
    expect(wiki).toContain("**Tie A**");
    expect(wiki).toContain("**Tie Z**");
    expect(wiki.indexOf("**Tie Z**")).toBeLessThan(wiki.indexOf("**Tie A**"));
    expect(wiki.indexOf("**Tie A**")).toBeLessThan(wiki.indexOf("Duplicate raw record"));
    expect(wiki).toContain("Duplicate raw record");
    expect(wiki.match(/\| 2 \|/g)).toHaveLength(1);
    expect(wiki.match(/\| 3 \|/g)).toHaveLength(1);
    expect(wiki.match(/\| 4 \|/g)).toHaveLength(1);
  });

  it("uses only explicit ADO IDs or the summary ADO Items Delivered section", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({
        deploymentId: "ADO-SUMMARY",
        relatedStory: "Story 7654321 must not become an ADO link",
        adoWorkItemId: null,
        summary: "Deployment notes.\nADO Items Delivered\n1501982\n1501983",
      }),
      fixture({
        deploymentId: "ADO-EXPLICIT",
        relatedStory: "Story 7654322",
        adoWorkItemId: "1501984",
        summary: "No ADO section here.",
      }),
    ]);

    expect(wiki).toContain("[1501982](https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1501982)");
    expect(wiki).toContain("[1501983](https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1501983)");
    expect(wiki).toContain("[1501984](https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/1501984)");
    expect(wiki).not.toContain("_workitems/edit/7654321");
    expect(wiki).not.toContain("_workitems/edit/7654322");
  });

  it("escapes HTML and pipes safely while preserving multiline content without truncation", () => {
    const wiki = buildPostPilotDeploymentWiki([
      fixture({
        releaseName: "Name | with <tag> & details",
        screenName: "Screen | <capability>",
        relatedFeature: "Feature | <one>",
        relatedStory: "Story | <two>",
        summary: "Line <one> & |\nLine two with more detail and no truncation.",
        deploymentOwner: "Owner | <name>",
      }),
    ]);

    const row = deploymentRows(wiki)[0];
    expect(row).not.toMatch(/<tag>|<capability>|<one>|<two>|<name>/);
    expect(row).toContain("&#124;");
    expect(row).toContain("&lt;tag&gt;");
    expect(row).toContain("&amp;");
    expect(row).toContain("Line &lt;one&gt; &amp; &#124;<br>Line two with more detail and no truncation.");
    expect(row).toContain("Owner &#124; &lt;name&gt;");
    expect(row).toMatch(/^\|[^|]*\|.*\|.*\|.*\|$/);
  });

  it("keeps the title, scope/order/numbering header, and exact signature unchanged", () => {
    const wiki = buildPostPilotDeploymentWiki([fixture()]);

    expect(wiki).toContain("# Data Gateway Release Notes");
    expect(wiki).toContain("> **Scope:** PI4 / Pilot Data Gateway release documentation");
    expect(wiki).toContain("> **Ordering:** Reverse chronological by deployment date");
    expect(wiki).toContain("> **Numbering:** Chronological by deployment date (earliest deployment is #1)");
    expect(wiki).toContain("**Jenniver Dawn Stafford**  \nBusiness Analysis Manager  \n(CATT) Center for Advanced Tax Technology");
    expect(wiki).not.toContain("## Release Index");
    expect(wiki).toContain("## Pilot Deployment Records");
  });

  it("renders the empty state without a fabricated table row", () => {
    const wiki = buildPostPilotDeploymentWiki([]);

    expect(wiki).toContain("# Data Gateway Release Notes");
    expect(wiki).toContain("> **Registry records represented:** 0");
    expect(wiki).toContain("## Pilot Deployment Records");
    expect(wiki).toContain("No Data Gateway release entries have been recorded in the Pilot Deployment Registry.");
    expect(tableLines(wiki)).toHaveLength(0);
    expect(wiki).not.toContain("See **Deployment");
    expect(wiki).toContain("**Jenniver Dawn Stafford**");
  });
});
