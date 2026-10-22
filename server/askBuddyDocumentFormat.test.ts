import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { toDocumentFriendlyText } from "../client/src/lib/askBuddyDocumentFormat";

const askBuddyPage = readFileSync("client/src/pages/AskBuddy.tsx", "utf8");
const globalStyles = readFileSync("client/src/index.css", "utf8");

describe("Ask Buddy document-friendly responses", () => {
  it("converts Markdown into clean document text without literal heading or table syntax", () => {
    const result = toDocumentFriendlyText([
      "### TDC Ownership Signals",
      "",
      "**Question addressed:** Review the document.",
      "",
      "| Extracted statement | Status |",
      "| --- | --- |",
      "| Approved mapping decision | Confirmed |",
      "",
      "- Confirm owner agreement",
      "- Review [State readiness](https://example.test/state)",
    ].join("\n"));

    expect(result).toContain("TDC OWNERSHIP SIGNALS");
    expect(result).toContain("Question addressed: Review the document.");
    expect(result).toContain("Extracted statement\tStatus");
    expect(result).toContain("Approved mapping decision\tConfirmed");
    expect(result).toContain("• Confirm owner agreement");
    expect(result).toContain("• Review State readiness (https://example.test/state)");
    expect(result).not.toContain("###");
    expect(result).not.toContain("| --- |");
    expect(result).not.toContain("**");
  });

  it("renders semantic Markdown rather than inserting unparsed response HTML", () => {
    expect(askBuddyPage).toContain('import { Streamdown } from "streamdown"');
    expect(askBuddyPage).toContain('<Streamdown controls={false}>{msg.text}</Streamdown>');
    expect(askBuddyPage).toContain('className="ask-buddy-document-response"');
    expect(askBuddyPage).not.toContain("dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}");
    expect(askBuddyPage).toContain("Copy for Document");
  });

  it("copies both a rich document response and a clean text fallback", () => {
    expect(askBuddyPage).toContain("copyBuddyResponseForDocument");
    expect(askBuddyPage).toContain('"text/html": new Blob([renderedResponse.innerHTML], { type: "text/html" })');
    expect(askBuddyPage).toContain('"text/plain": new Blob([plainText], { type: "text/plain" })');
    expect(askBuddyPage).toContain("toDocumentFriendlyText(message.text)");
  });

  it("styles headings, lists, and tables for readable document preparation", () => {
    expect(globalStyles).toContain(".ask-buddy-document-response table");
    expect(globalStyles).toContain(".ask-buddy-document-response th");
    expect(globalStyles).toContain(".ask-buddy-document-response ul");
    expect(globalStyles).toContain(".ask-buddy-document-response h1");
  });
});
