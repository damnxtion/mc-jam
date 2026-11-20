import { describe, expect, it } from "vitest";
import { CANDIDATES } from "./data";
import { affordPoints, fitBand, fitParts, fitScore, incomeBand, rentToIncome } from "./fit";
import type { Candidate } from "./types";

const ane = CANDIDATES.find((c) => c.id === "c1") as Candidate;
const lucia = CANDIDATES.find((c) => c.id === "c4") as Candidate;

describe("fit score", () => {
  it("scores a fully verified applicant out of 100", () => {
    // 1450 / 4300 = 34% -> 22 affordability points
    expect(fitScore(ane, 1450)).toBe(25 + 25 + 22 + 10 + 10);
    expect(fitParts(ane, 1450)).toHaveLength(5);
  });

  it("gives an unverified portal contact zero", () => {
    expect(fitScore(lucia, 1450)).toBe(0);
    expect(rentToIncome(lucia, 1450)).toBeNull();
  });

  it("uses affordability thresholds at 30, 35 and 40 percent", () => {
    expect(affordPoints(0.3)).toBe(30);
    expect(affordPoints(0.35)).toBe(22);
    expect(affordPoints(0.4)).toBe(12);
    expect(affordPoints(0.41)).toBe(0);
    expect(affordPoints(null)).toBe(0);
  });

  it("bands scores for quick scanning", () => {
    expect(fitBand(92)).toBe("strong");
    expect(fitBand(60)).toBe("possible");
    expect(fitBand(10)).toBe("weak");
  });

  it("shows income as a band, never the exact figure", () => {
    expect(incomeBand(4300)).toBe("4200–4600 €");
    expect(incomeBand(null)).toBeNull();
  });
});
