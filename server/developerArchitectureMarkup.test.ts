import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Developer Architecture contract interaction markup", () => {
  it("uses an accessible non-button contract trigger around the native copy button", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/DeveloperArchitecturePage.tsx"), "utf8");
    const apiContractCard = source.slice(
      source.indexOf("function ApiContractCard"),
      source.indexOf("// ─── MAIN COMPONENT")
    );

    expect(apiContractCard).toContain('role="button"');
    expect(apiContractCard).toContain("tabIndex={0}");
    expect(apiContractCard).toContain("onKeyDown={(event)");
    expect(apiContractCard).not.toContain("<button");
    expect(source).toContain("event.stopPropagation()");
  });
});
