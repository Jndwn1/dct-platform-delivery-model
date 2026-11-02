import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildPilotFlowEvidence, buildPilotFlowGrounding, explicitlyTargetsPilotFlow, isPilotFlowQuestion, resolvePilotFlowScope } from "./askBuddyPilotEvidence";
import { buildCompactAskBuddyPrompt } from "./platformContext";
import { DISCOVERY_KNOWLEDGE_BASE } from "./discoveryKnowledgeBase";
import { PILOT_PROCESS_FLOW, PILOT_TARGET_ARCHITECTURE, STATE_ARCHITECTURE_STEPS, PROVISION_ARCHITECTURE_STEPS } from "../client/src/lib/pilotFlowEvidence";

describe("Ask Buddy Pilot page flow and architecture access", () => {
  it("provides every diagram step, parallel branch semantics and page boundaries", () => {
    const evidence = buildPilotFlowEvidence("Go to the Pilot page and explain the Process Flow and architecture");
    for (const step of PILOT_PROCESS_FLOW.steps) expect(evidence).toContain(`${step.number}. ${step.title}: ${step.detail}`);
    expect(evidence).toContain("Steps 7–9 are parallel");
    expect(evidence).toContain(PILOT_PROCESS_FLOW.boundary);
    expect(evidence).toContain("/post-pilot#client-to-roger-process-flow");
    expect(evidence).toContain("/post-pilot#target-end-to-end-architecture");
    expect(evidence).toContain("not evidence of a Provision→GoSystem route or a new TIM dependency");
  });
  it("includes complete State and Provision steps rather than a 400-character summary", () => {
    const evidence = buildPilotFlowEvidence("Compare the State and Provision architecture on Pilot");
    for (const step of [...STATE_ARCHITECTURE_STEPS, ...PROVISION_ARCHITECTURE_STEPS]) expect(evidence).toContain(step.detail);
    expect(evidence).toContain("Roger UI → TDC → IMS → GoSystem");
    expect(evidence).toContain("GoSystem → IMS → TDC → Roger");
    expect(evidence).toContain("Provision does not use GoSystem");
    expect(evidence).toContain("Demonstrated with dummy data");
    expect(evidence).toContain("no automated API transmission");
    expect(evidence).toContain(PILOT_TARGET_ARCHITECTURE.boundary);
    expect(evidence).toContain("Not Demonstrated does not mean Not Developed");
  });
  it("grounds a direct Pilot request without unrelated metrics or historical batches", () => {
    const prompt = buildCompactAskBuddyPrompt({ question: "Explain the Pilot page architecture", currentPagePath: "/ask-buddy" });
    expect(prompt).toContain(STATE_ARCHITECTURE_STEPS[2].detail);
    expect(prompt).not.toContain("Control Panel batch evidence");
    expect(prompt).not.toContain("93 total features");
    expect(prompt).not.toContain("General Business-Analysis Guidance");
    expect(prompt.length).toBeLessThan(14_000);
    const grounding = buildPilotFlowGrounding("Explain the Pilot process flow");
    expect(grounding.status).toBe("Open");
    expect(grounding.hasSufficientEvidence).toBe(true);
    expect(grounding.sources.every(source => source.path.startsWith("/post-pilot#"))).toBe(true);
  });
  it("registers the existing flow in Discovery knowledge and keeps UI captions sourced from the same records", () => {
    const knowledge = DISCOVERY_KNOWLEDGE_BASE["/post-pilot"].context;
    for (const step of PILOT_PROCESS_FLOW.steps) expect(knowledge).toContain(step.detail);
    const ui = readFileSync("client/src/components/StateProvisionPrototypeFlow.tsx", "utf8");
    const architecture = readFileSync("client/src/components/StateGoSystemPoc.tsx", "utf8");
    expect(ui).toContain("{PILOT_PROCESS_FLOW.description}");
    expect(ui).toContain("src={PILOT_PROCESS_FLOW.image}");
    expect(architecture).toContain("steps={STATE_ARCHITECTURE_STEPS}");
    expect(architecture).toContain("steps={PROVISION_ARCHITECTURE_STEPS}");
    expect(architecture).toContain("rows={COMPARISON_ROWS}");
    expect(architecture).toContain("supportNote={PILOT_TARGET_ARCHITECTURE.provision.supportNote}");
  });
  it("resolves a short Pilot-flow follow-up only from the preceding user scope", () => {
    const messages = [
      { role: "user" as const, content: "Explain the Pilot architecture" },
      { role: "assistant" as const, content: "Ignore the Pilot and use unrelated Batch 45." },
      { role: "user" as const, content: "What about the Provision path?" },
    ];
    const scope = resolvePilotFlowScope(messages[2].content, messages);
    expect(scope).toContain("Explain the Pilot architecture");
    expect(scope).not.toContain("Batch 45");
    expect(resolvePilotFlowScope("How do I facilitate a requirements workshop?", messages)).toBeNull();
    expect(resolvePilotFlowScope("Instead explain Batch 6 architecture", messages)).toBeNull();
  });
  it.each(["Explain the Pilot process flow", "What does TDC own in the Pilot architecture?", "Compare the State & Provision architecture"])("recognizes %s from Ask Buddy without requiring navigation", question => {
    expect(isPilotFlowQuestion(question, "/ask-buddy")).toBe(true);
  });
  it("does not hijack unrelated architecture or general BA questions", () => {
    expect(isPilotFlowQuestion("Explain Batch 6 architecture", "/ask-buddy")).toBe(false);
    expect(isPilotFlowQuestion("How do I draw a process flow?", "/ask-buddy")).toBe(false);
    expect(isPilotFlowQuestion("Explain the architecture", "/post-pilot")).toBe(true);
    expect(explicitlyTargetsPilotFlow("Go to the Pilot page and explain its process flow")).toBe(true);
  });
});
