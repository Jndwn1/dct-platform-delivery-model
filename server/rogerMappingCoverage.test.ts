import { describe, expect, it } from "vitest";
import { countMappingCoverage, ROGER_MAPPING_COVERAGE } from "../client/src/lib/rogerMappingCoverage";

describe("Roger UI mapping coverage", () => {
  it("derives all current mapping coverage rows from the 18-screen QA Registry", () => {
    expect(ROGER_MAPPING_COVERAGE).toHaveLength(18);
    expect(ROGER_MAPPING_COVERAGE.map(item => item.screen.id)).not.toContain("line-mapping-page");
  });

  it("keeps undocumented screen contracts as explicit mapping gaps", () => {
    expect(countMappingCoverage("Documented")).toBe(1);
    expect(countMappingCoverage("Related Evidence")).toBe(3);
    expect(countMappingCoverage("Needs Mapping")).toBe(14);
  });
});
