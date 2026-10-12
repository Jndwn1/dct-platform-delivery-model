import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("BatchControlPanel hook ordering", () => {
  it("declares render-state hooks before its render phase", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/BatchControlPanel.tsx"), "utf8");
    const componentStart = source.indexOf("export default function BatchControlPanel()");
    const renderStart = source.indexOf("  return (", componentStart);
    const componentEnd = source.lastIndexOf("\n}");

    expect(componentStart).toBeGreaterThan(-1);
    expect(renderStart).toBeGreaterThan(componentStart);

    const hookDeclarations = source.slice(componentStart, renderStart);
    const renderPhase = source.slice(renderStart, componentEnd);

    expect(hookDeclarations).toContain("const [exportFilter, setExportFilter] = useState");
    expect(hookDeclarations).toContain("const [showContractMatrix, setShowContractMatrix] = useState");
    expect(hookDeclarations).toContain("const [contractFilter, setContractFilter] = useState");
    expect(renderPhase).not.toContain("useState(");
  });
});
