import { describe, expect, it } from "vitest";
import { selectBuddyRequestMessages, resolveBuddyRetrievalQuestion } from "../client/src/lib/askBuddyRequestContext";
import { buildCompactAskBuddyPrompt } from "./platformContext";
import { buildExecutiveBuddyEvidence } from "./askBuddyExecutiveEvidence";
import { buildBuddyGrounding } from "./askBuddyGrounding";
import { getAllBatches } from "../client/src/lib/batchModel";
import { ROGER_PI4_EXECUTIVE_METRICS } from "../client/src/lib/rogerPilotBacklog";

const original = "For the Roger Pilot workflow setup what dependencies does TDC have? Tech Story 1528380: TDC V2 non-legal entities and non-legal entity types (API)";
const exchange = [
  { role: "user" as const, content: original },
  { role: "assistant" as const, content: "Earlier incomplete answer mentions Batch 26." },
  { role: "user" as const, content: "Refer to the executive health section" },
];

describe("Ask Buddy platform-wide evidence and follow-up retrieval", () => {
  it("resolves the reported follow-up from user scope, not previous AI assertions", () => {
    const retained = selectBuddyRequestMessages(exchange);
    const retrieval = resolveBuddyRetrievalQuestion(retained);
    expect(retrieval).toContain("1528380");
    expect(retrieval).toContain("executive health");
    expect(retrieval).not.toContain("Batch 26");
    const prompt = buildCompactAskBuddyPrompt({ question: retrieval, currentPagePath: "/ask-buddy" });
    expect(prompt).toContain("Feature 1462484: Entity mappings");
    expect(prompt).toContain("Feature 1470472: Non-Legal Entities");
    expect(prompt).toContain("not proof of parent/child");
    expect(prompt).not.toContain("B26 —");
    expect(prompt).toContain("93 total features");
    expect(prompt.length).toBeLessThan(16_000);
    expect(buildBuddyGrounding(retrieval).sources.map(source => source.path)).toEqual(expect.arrayContaining(["/", "/post-pilot", "/post-pilot/roger-pilot-backlog"]));
  });

  it("uses shared metrics and preserves planning and ownership boundaries", () => {
    const evidence = buildExecutiveBuddyEvidence(original);
    expect(evidence).toContain(`${ROGER_PI4_EXECUTIVE_METRICS.totalFeatures} total features`);
    expect(evidence).toContain("Child rows and accountable");
    expect(evidence).toContain("impact confirmation");
    expect(evidence).toContain("not a live ADO query or confirmed dependency link");
    expect(evidence).toContain("aggregate dependency count does not identify eight specific blockers");
  });

  it.each(["6", "28"])("selects Batch %s exactly instead of keyword-ranked unrelated records", id => {
    const prompt = buildCompactAskBuddyPrompt({ question: `What is Batch ${id}?` });
    expect(prompt).toContain(`- B${id} —`);
    expect(prompt).not.toContain("- B33 —");
    expect(prompt).not.toContain("- B45 —");
  });

  it("supplies all Batch Model records requested for a PI", () => {
    const prompt = buildCompactAskBuddyPrompt({ question: "What batches are in PI 3?" });
    for (const batch of getAllBatches().filter(batch => batch.pi === "PI3")) expect(prompt).toContain(`- ${batch.id} —`);
    expect(prompt).toContain("foundation and delivery reference");
  });

  it("keeps architecture and agent facts available", () => {
    expect(buildCompactAskBuddyPrompt({ question: "What are the platform layers?" })).toContain("Platform layer records");
    expect(buildCompactAskBuddyPrompt({ question: "Which agents are in the architecture?" })).toContain("Governed agent records");
  });

  it("does not carry Pilot or ADO scope into an unrelated general question", () => {
    const retrieval = resolveBuddyRetrievalQuestion([...exchange, { role: "user", content: "How do I prepare for a requirements workshop?" }]);
    expect(retrieval).not.toContain("1528380");
    expect(buildExecutiveBuddyEvidence(retrieval)).toBe("");
  });

  it("bounds six messages and preserves the beginning and end of long user input", () => {
    const content = `Tech Story 1528380\n${"x".repeat(12_000)}\nNon-legal entity API`;
    const messages = selectBuddyRequestMessages(Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? "user" as const : "assistant" as const, content })));
    expect(messages.length).toBeLessThanOrEqual(6);
    expect(messages.reduce((sum, message) => sum + message.content.length, 0)).toBeLessThanOrEqual(16_000);
    expect(messages.at(-1)?.content).toContain("1528380");
    expect(messages.at(-1)?.content).toContain("Non-legal entity API");
  });
});
