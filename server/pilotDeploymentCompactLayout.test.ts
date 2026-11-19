import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const snapshot = readFileSync(resolve(process.cwd(), "client/src/components/PostPilotDeploymentSnapshot.tsx"), "utf8");
const table = snapshot.slice(snapshot.indexOf('<table aria-label="Pilot deployment records"'), snapshot.indexOf('</table>'));

describe("compact Pilot deployment presentation", () => {
  it("uses a narrow overview instead of full release narratives in default rows", () => {
    expect(table).toContain('minWidth: "620px"');
    expect(table).not.toContain('minWidth: "1220px"');
    expect(table).toContain('["Chronological #", "Deployment", "Environment", "Details"]');
    const overview = table.slice(table.indexOf('<tr style={{ background: isExpanded'), table.indexOf('{isExpanded && <tr'));
    expect(overview).toContain('record.releaseName');
    expect(overview).toContain('record.deploymentDate');
    expect(overview).toContain('record.environment');
    expect(overview).toContain('record.status');
    expect(overview).not.toContain('record.summary');
    expect(overview).not.toContain('record.relatedStory');
    expect(overview).not.toContain('record.relatedFeature');
  });

  it("expands and collapses the complete source fields with accessible controls", () => {
    expect(snapshot).toContain('useState<string | null>(null)');
    expect(table).toContain('aria-expanded={isExpanded}');
    expect(table).toContain('aria-controls={detailId}');
    expect(table).toContain('setExpandedDeploymentId(isExpanded ? null : record.deploymentId)');
    expect(table).toContain('isExpanded ? "Hide details" : "View details"');
    expect(table).toContain('colSpan={4}');
    const detail = table.slice(table.indexOf('{isExpanded && <tr'));
    for (const field of ['screenName', 'summary', 'relatedFeature', 'relatedStory', 'deploymentOwner', 'adoWorkItemId']) {
      expect(detail).toContain(`record.${field}`);
    }
    expect(detail).toContain('whiteSpace: "pre-wrap"');
    expect(detail).not.toContain('record.productOwner');
    expect(detail).toContain('href={`${ADO_WORK_ITEM_URL}${id}`}');
    expect(detail).toContain('<Streamdown controls={false}>{record.relatedStory}</Streamdown>');
    expect(detail).toContain('Related Stories / Bugs');
    expect(detail).not.toContain('dangerouslySetInnerHTML');
  });

  it("preserves create, multi-environment selection, summary metrics, and matching copy/download exports", () => {
    expect(snapshot).toContain('trpc.postPilotDeploymentRegistry.create.useMutation');
    expect(snapshot).toContain('DeploymentEnvironmentSelect');
    expect(snapshot).toContain('maxLength={4000}');
    expect(snapshot).toContain('trpc.postPilotDeploymentRegistry.summary.useQuery()');
    expect(snapshot).toContain('trpc.postPilotDeploymentRegistry.list.useQuery()');
    expect(snapshot).toContain('navigator.clipboard.writeText(wikiMarkdown)');
    expect(snapshot).toContain('new Blob([wikiMarkdown]');
    expect(snapshot).toContain('link.download = "data-gateway-release-notes.md"');
    expect(snapshot).toContain('buildChronologicalDeploymentNumbers(records)');
    expect(snapshot).not.toContain('db.delete(');
    expect(snapshot).toContain('Wiki copy and download use a compact overview with expandable release details.');
  });
});
