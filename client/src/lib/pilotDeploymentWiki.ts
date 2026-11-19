export type DeploymentWikiRecord = {
  deploymentId: string;
  deploymentDate: string;
  releaseName: string;
  screenName: string;
  type: string;
  platform: string;
  status: string;
  environment: string;
  deploymentOwner: string;
  productOwner?: string;
  relatedFeature: string | null;
  relatedStory: string | null;
  adoWorkItemId: string | null;
  summary: string | null;
};

// Overview cells and summary titles cannot create Markdown blocks or HTML.
// Line breaks remain complete without creating additional overview rows.
function escapeWikiCell(value: string | null | undefined) {
  return (value?.trim() || "—")
    .replace(/\r\n?/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/([`*_\[\]~#!])/g, "\\$1")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\|/g, "&#124;")
    .replace(/\n/g, "<br>");
}

// Full content retains authored Markdown tables, links, and paragraphs. Raw HTML
// is inert, so source text cannot close the formatter-owned details container.
function escapeWikiDetailBody(value: string | null | undefined) {
  return (value?.trim() || "—")
    .replace(/\r\n?/g, "\n")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export const ADO_WORK_ITEM_URL = "https://dev.azure.com/rsmdevops/Tax%20AI%20Solutions/_workitems/edit/";

type ReleaseSourceSections = {
  lead: string[];
  adoItems: string[];
};

export function splitReleaseSource(summary: string | null | undefined): ReleaseSourceSections {
  const sections: ReleaseSourceSections = { lead: [], adoItems: [] };
  let active: keyof ReleaseSourceSections = "lead";

  (summary ?? "").split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine
      .replace(/\s+(?:TDC-API|Data-Gateway)-Release-Notes-[^\s]+/g, "")
      .trim();
    if (!line) return;

    if (line === "ADO Items Delivered") { active = "adoItems"; return; }
    if (line === "Deployment Scope" || line === "Consumer Impact") { active = "lead"; return; }
    sections[active].push(line);
  });

  return sections;
}

export function extractAdoIds(lines: string[], fallback: string | null) {
  const source = [...lines, fallback ?? ""].join(" ");
  return Array.from(new Set(source.match(/\b\d{6,8}\b/g) ?? []));
}

function formatAdoLinks(ids: string[]) {
  return ids.length ? ids.map((id) => `[${id}](${ADO_WORK_ITEM_URL}${id})`).join(", ") : "—";
}

function deploymentSequenceKey(record: Pick<DeploymentWikiRecord, "deploymentDate" | "deploymentId">) {
  return `${record.deploymentDate}|${record.deploymentId}`;
}

export function buildChronologicalDeploymentNumbers(records: Array<Pick<DeploymentWikiRecord, "deploymentDate" | "deploymentId">>) {
  return new Map([...records].sort((left, right) => left.deploymentDate.localeCompare(right.deploymentDate) || left.deploymentId.localeCompare(right.deploymentId)).map((record, index) => [deploymentSequenceKey(record), index + 1]));
}

function overviewReleaseName(releaseName: string) {
  const name = releaseName.trim().replace(/\s+/g, " ");
  const characters = Array.from(name);
  return characters.length > 100 ? `${characters.slice(0, 99).join("")}…` : name;
}

export function buildPostPilotDeploymentWiki(records: DeploymentWikiRecord[]) {
  const orderedRecords = [...records].sort((left, right) => right.deploymentDate.localeCompare(left.deploymentDate));
  const chronologicalDeploymentNumbers = buildChronologicalDeploymentNumbers(orderedRecords);
  const lines = [
    "# Data Gateway Release Notes",
    "",
    "> **Scope:** PI4 / Pilot Data Gateway release documentation",
    "> **Ordering:** Reverse chronological by deployment date",
    "> **Numbering:** Chronological by deployment date (earliest deployment is #1)",
    `> **Registry records represented:** ${orderedRecords.length}`,
    "",
    "## Pilot Deployment Records",
    "",
  ];

  if (orderedRecords.length === 0) {
    lines.push("No Data Gateway release entries have been recorded in the Pilot Deployment Registry.");
  } else {
    lines.push(
      "| Chronological # | Date | Deployment | Environment |",
      "|---:|---|---|---|",
    );

    orderedRecords.forEach((record) => {
      const deploymentNumber = chronologicalDeploymentNumbers.get(deploymentSequenceKey(record)) ?? 1;
      lines.push(`| ${deploymentNumber} | ${escapeWikiCell(record.deploymentDate)} | **${escapeWikiCell(overviewReleaseName(record.releaseName))}** | ${escapeWikiCell(record.environment)} |`);
    });

    lines.push("");
    orderedRecords.forEach((record) => {
      const deploymentNumber = chronologicalDeploymentNumbers.get(deploymentSequenceKey(record)) ?? 1;
      const adoIds = extractAdoIds(splitReleaseSource(record.summary).adoItems, record.adoWorkItemId);
      lines.push(
        `<details><summary>Deployment #${deploymentNumber} — ${escapeWikiCell(record.releaseName)}</summary>`,
        "",
        `**Release name:** ${escapeWikiCell(record.releaseName)}`,
        "",
        `**Deployment ID:** ${escapeWikiCell(record.deploymentId)}`,
        "",
        `**Date:** ${escapeWikiCell(record.deploymentDate)}`,
        "",
        `**Type:** ${escapeWikiCell(record.type)}`,
        "",
        `**Status:** ${escapeWikiCell(record.status)}`,
        "",
        `**Environment:** ${escapeWikiCell(record.environment)}`,
        "",
        `**Platform:** ${escapeWikiCell(record.platform)}`,
        "",
        `**Deployment owner:** ${escapeWikiCell(record.deploymentOwner)}`,
        "",
        "**Scope / Capability:**",
        "",
        escapeWikiDetailBody(record.screenName),
        "",
        "**Related feature:**",
        "",
        escapeWikiDetailBody(record.relatedFeature),
        "",
        "**Related stories / bugs:**",
        "",
        escapeWikiDetailBody(record.relatedStory),
        "",
        "**Summary:**",
        "",
        escapeWikiDetailBody(record.summary),
        "",
        `**ADO Work Item IDs (as recorded):** ${escapeWikiCell(record.adoWorkItemId)}`,
        "",
        `**ADO work items:** ${formatAdoLinks(adoIds)}`,
        "",
        "</details>",
        "",
      );
    });
  }

  lines.push(
    "",
    "**Jenniver Dawn Stafford**  ",
    "Business Analysis Manager  ",
    "(CATT) Center for Advanced Tax Technology",
  );
  return lines.join("\n");
}
