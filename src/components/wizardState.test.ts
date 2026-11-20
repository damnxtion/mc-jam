import { describe, expect, it } from "vitest";
import { EMPTY_DRAFT } from "../domain/data";
import { init, reducer, validateStep } from "./wizardState";

describe("wizard reducer", () => {
  it("won't advance past an invalid step and shows errors", () => {
    const s = reducer(init(), { type: "next" });
    expect(s.step).toBe(0);
    expect(s.showErrors).toBe(true);
    expect(Object.keys(validateStep(0, s.draft))).toEqual(expect.arrayContaining(["area", "title"]));
  });

  it("advances once the step is valid and remembers the furthest step", () => {
    const filled = reducer(init(), { type: "set", patch: { area: "Gros", title: "Two-bed flat with balcony" } });
    const s = reducer(filled, { type: "next" });
    expect(s.step).toBe(1);
    expect(s.maxReached).toBe(1);
    expect(reducer(s, { type: "goto", step: 3 }).step).toBe(1); // can't skip ahead
    expect(reducer(reducer(s, { type: "back" }), { type: "goto", step: 1 }).step).toBe(1);
  });

  it("takes the zone from the town and clears the old area", () => {
    const s = reducer(init({ ...EMPTY_DRAFT, area: "Gros" }), { type: "set", patch: { town: "Hondarribia" } });
    expect(s.draft.zone).toBe("none");
    expect(s.draft.area).toBe("");
  });

  it("switches to a 2-month deposit for seasonal lets", () => {
    const s = reducer(init(), { type: "set", patch: { type: "seasonal" } });
    expect(s.draft.deposit).toBe(2);
    expect(s.draft.extraGuarantee).toBe(0);
  });

  it("asks large landlords in a stressed zone for the reference index", () => {
    expect(validateStep(1, { ...EMPTY_DRAFT, landlordType: "large", zone: "tensionada" }).refIndex).toBeDefined();
  });
});
