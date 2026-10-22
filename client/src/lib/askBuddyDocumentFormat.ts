function stripInlineMarkdown(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")
    .replace(/(?<!_)_([^_]+)_(?!_)/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    .trim();
}

function isMarkdownTableDivider(value: string) {
  const cells = value
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function formatTableRow(value: string) {
  return value
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => stripInlineMarkdown(cell))
    .join("\t");
}

/**
 * Provides a clean text alternative for clipboard environments that cannot
 * receive rich HTML. Headings, bullets, links, and Markdown tables are made
 * document-ready rather than copied with literal Markdown syntax.
 */
export function toDocumentFriendlyText(markdown: string) {
  const output: string[] = [];

  markdown.replace(/\r\n/g, "\n").split("\n").forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (output.length > 0 && output.at(-1) !== "") output.push("");
      return;
    }

    if (trimmed.includes("|") && trimmed.startsWith("|")) {
      if (!isMarkdownTableDivider(trimmed)) output.push(formatTableRow(trimmed));
      return;
    }

    const heading = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (heading) {
      output.push(stripInlineMarkdown(heading[1]).toUpperCase());
      return;
    }

    const bullet = line.match(/^(\s*)[-*+]\s+(.+)$/);
    if (bullet) {
      const indentation = "  ".repeat(Math.floor(bullet[1].length / 2));
      output.push(`${indentation}• ${stripInlineMarkdown(bullet[2])}`);
      return;
    }

    const numberedItem = line.match(/^(\s*\d+[.)])\s+(.+)$/);
    if (numberedItem) {
      output.push(`${numberedItem[1]} ${stripInlineMarkdown(numberedItem[2])}`);
      return;
    }

    const quote = trimmed.match(/^>\s+(.+)$/);
    if (quote) {
      output.push(stripInlineMarkdown(quote[1]));
      return;
    }

    output.push(stripInlineMarkdown(line));
  });

  while (output.at(-1) === "") output.pop();
  return output.join("\n");
}
