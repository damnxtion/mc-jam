import type { Candidate, FitPart } from "./types";

export const rentToIncome = (c: Pick<Candidate, "incomeOk" | "netMonthly">, rent: number): number | null =>
  c.incomeOk && c.netMonthly ? rent / c.netMonthly : null;

export function affordPoints(ratio: number | null): number {
  if (ratio == null) return 0;
  if (ratio <= 0.3) return 30;
  if (ratio <= 0.35) return 22;
  if (ratio <= 0.4) return 12;
  return 0;
}

/** Fit score out of 100, split into parts so an agent can see why. */
export function fitParts(c: Candidate, rent: number): FitPart[] {
  const r = rentToIncome(c, rent);
  return [
    { key: "identity", label: "Identity verified", pts: c.idOk ? 25 : 0, max: 25 },
    { key: "income", label: "Income verified", pts: c.incomeOk ? 25 : 0, max: 25 },
    { key: "afford", label: r == null ? "Affordability unknown" : `Rent is ${Math.round(r * 100)}% of income`, pts: affordPoints(r), max: 30 },
    { key: "reference", label: "Landlord reference", pts: c.refs ? 10 : 0, max: 10 },
    { key: "movein", label: "Move-in date fits", pts: c.moveIn ? 10 : 0, max: 10 },
  ];
}

export const fitScore = (c: Candidate, rent: number): number => fitParts(c, rent).reduce((a, p) => a + p.pts, 0);

export type FitBand = "strong" | "possible" | "weak";
export const fitBand = (score: number): FitBand => (score >= 75 ? "strong" : score >= 45 ? "possible" : "weak");

export const isPrequalified = (c: Candidate): boolean => c.idOk && c.incomeOk;

/** Income shown to agents as a band, never the exact figure. */
export function incomeBand(net: number | null): string | null {
  if (!net) return null;
  const lo = Math.floor(net / 200) * 200;
  const f = new Intl.NumberFormat("es-ES");
  return `${f.format(lo)}–${f.format(lo + 400)} €`;
}
