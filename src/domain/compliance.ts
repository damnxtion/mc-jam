import { eur } from "./format";
import type { Check, ComplianceReport, ListingTerms } from "./types";

/** Sample cap on the yearly rent update in a stressed zone. Replace with the official index. */
export const ANNUAL_UPDATE = 0.022;

/**
 * Checks a listing's terms against simplified Spanish rental rules.
 * Prototype logic with sample data. Not legal advice.
 */
export function checkCompliance(t: ListingTerms, annualUpdate = ANNUAL_UPDATE): ComplianceReport {
  const seasonal = t.type === "seasonal";
  const checks: Check[] = [];

  checks.push(
    t.tenantFee > 0
      ? { id: "fee", status: "fail", label: "Agency fee charged to the tenant", detail: `Asks the tenant for ${t.tenantFee} month(s) of fee. The landlord must pay agency and contract fees.`, law: "LAU art. 20.1 · Ley 12/2023" }
      : { id: "fee", status: "pass", label: "Agency fee paid by the landlord", detail: "The tenant pays no agency or contract fee.", law: "LAU art. 20.1 · Ley 12/2023" },
  );

  const legalDeposit = seasonal ? 2 : 1;
  const plural = legalDeposit > 1 ? "s" : "";
  checks.push(
    t.deposit === legalDeposit
      ? { id: "deposit", status: "pass", label: `Deposit of ${legalDeposit} month${plural}`, detail: seasonal ? "Seasonal lets count as non-housing use, so 2 months." : "The legal deposit for a home is one month's rent.", law: "LAU art. 36.1" }
      : { id: "deposit", status: "fail", label: `Deposit should be ${legalDeposit} month${plural}`, detail: `The listing asks for ${t.deposit}.`, law: "LAU art. 36.1" },
  );

  if (!seasonal) {
    checks.push(
      t.extraGuarantee <= 2
        ? { id: "guarantee", status: "pass", label: "Extra guarantee within 2 months", detail: `${t.extraGuarantee} month(s) on top of the deposit.`, law: "LAU art. 36.5" }
        : { id: "guarantee", status: "fail", label: "Extra guarantee above 2 months", detail: `Asks for ${t.extraGuarantee}. The limit for a home is 2.`, law: "LAU art. 36.5" },
    );
  }

  if (seasonal) {
    checks.push(
      t.nrua.trim().length >= 20
        ? { id: "nrua", status: "pass", label: "Registration number (NRUA) added", detail: `${t.nrua.trim().slice(0, 14)}…`, law: "RD 1312/2024" }
        : { id: "nrua", status: "fail", label: "Registration number (NRUA) missing", detail: "Seasonal lets must show their NRUA, and portals must remove listings without one.", law: "RD 1312/2024" },
    );
  } else {
    checks.push({ id: "nrua", status: "na", label: "NRUA not needed", detail: "Long-term home rental.", law: "RD 1312/2024" });
  }

  checks.push(
    t.cedula
      ? { id: "cedula", status: "pass", label: "Habitability certificate on file", detail: "The tenant can register at this address and connect utilities.", law: "Regional housing rules" }
      : { id: "cedula", status: "warn", label: "Habitability certificate missing", detail: "Upload the cédula before signing.", law: "Regional housing rules" },
  );

  checks.push(capCheck(t, seasonal, annualUpdate));

  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  return { verdict: fails ? "blocked" : warns ? "partial" : "verified", fails, warns, checks };
}

function capCheck(t: ListingTerms, seasonal: boolean, annualUpdate: number): Check {
  const law = "Ley 12/2023 · LAU art. 17";
  if (seasonal || t.zone !== "tensionada") {
    return { id: "cap", status: "na", label: "No rent cap applies", detail: seasonal ? "Seasonal let." : "Not in a declared stressed zone (sample data).", law };
  }
  if (t.landlordType === "large" && t.refIndex) {
    return t.rent <= t.refIndex
      ? { id: "cap", status: "pass", label: "Within the reference price index", detail: `${eur(t.rent)} against an index of ${eur(t.refIndex)}.`, law }
      : { id: "cap", status: "fail", label: "Above the reference price index", detail: `${eur(t.rent)} against an index of ${eur(t.refIndex)}. Large landlords here are capped at the index.`, law };
  }
  if (t.prevRent) {
    const max = maxRentInStressedZone(t.prevRent, annualUpdate);
    return t.rent <= max
      ? { id: "cap", status: "pass", label: "Within the stressed-zone cap", detail: `Previous rent ${eur(t.prevRent)} allows up to ${eur(max)}.`, law }
      : { id: "cap", status: "fail", label: "Above the stressed-zone cap", detail: `Previous rent ${eur(t.prevRent)} allows up to ${eur(max)}. You're asking ${eur(t.rent)}.`, law };
  }
  return { id: "cap", status: "warn", label: "Previous rent not recorded", detail: "In a stressed zone the new rent is capped by the last contract. Add it to confirm.", law };
}

export const maxRentInStressedZone = (prevRent: number, annualUpdate = ANNUAL_UPDATE): number =>
  Math.floor(prevRent * (1 + annualUpdate));

/** What the tenant pays at signing. The agency fee is always 0 for a compliant home. */
export function moveInCost(t: Pick<ListingTerms, "rent" | "deposit" | "extraGuarantee" | "tenantFee">) {
  const rows = [
    { label: "First month's rent", amount: t.rent },
    { label: `Deposit · ${t.deposit} month${t.deposit === 1 ? "" : "s"}`, amount: t.rent * t.deposit },
    ...(t.extraGuarantee ? [{ label: `Extra guarantee · ${t.extraGuarantee} month${t.extraGuarantee === 1 ? "" : "s"}`, amount: t.rent * t.extraGuarantee }] : []),
    { label: "Agency fee", amount: t.rent * t.tenantFee },
  ];
  return { rows, total: rows.reduce((a, r) => a + r.amount, 0) };
}
