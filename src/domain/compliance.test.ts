import { describe, expect, it } from "vitest";
import { checkCompliance, maxRentInStressedZone, moveInCost } from "./compliance";
import type { ListingTerms } from "./types";

const base: ListingTerms = {
  type: "long", rent: 1200, deposit: 1, extraGuarantee: 1, tenantFee: 0,
  landlordType: "individual", zone: "none", prevRent: null, refIndex: null, cedula: true, nrua: "",
};
const status = (t: Partial<ListingTerms>, id: string) => checkCompliance({ ...base, ...t }).checks.find((c) => c.id === id)?.status;

describe("checkCompliance", () => {
  it("verifies a clean long-term listing", () => {
    expect(checkCompliance(base).verdict).toBe("verified");
  });

  it("blocks a tenant-paid agency fee", () => {
    const r = checkCompliance({ ...base, tenantFee: 1 });
    expect(r.verdict).toBe("blocked");
    expect(status({ tenantFee: 1 }, "fee")).toBe("fail");
  });

  it("needs a 1-month deposit for homes and 2 for seasonal lets", () => {
    expect(status({ deposit: 2 }, "deposit")).toBe("fail");
    expect(status({ type: "seasonal", deposit: 2, nrua: "ESFCTU000020015000123456" }, "deposit")).toBe("pass");
    expect(status({ type: "seasonal", deposit: 1 }, "deposit")).toBe("fail");
  });

  it("caps the extra guarantee at 2 months", () => {
    expect(status({ extraGuarantee: 2 }, "guarantee")).toBe("pass");
    expect(status({ extraGuarantee: 3 }, "guarantee")).toBe("fail");
  });

  it("requires an NRUA only for seasonal lets", () => {
    expect(status({}, "nrua")).toBe("na");
    expect(status({ type: "seasonal", deposit: 2 }, "nrua")).toBe("fail");
    expect(status({ type: "seasonal", deposit: 2, nrua: "ESFCTU000020015000123456" }, "nrua")).toBe("pass");
  });

  it("only warns when the habitability certificate is missing", () => {
    const r = checkCompliance({ ...base, cedula: false });
    expect(r.verdict).toBe("partial");
    expect(r.warns).toBe(1);
  });

  describe("stressed-zone cap", () => {
    const zone = { zone: "tensionada" as const };
    it("allows the previous rent plus the yearly update", () => {
      const max = maxRentInStressedZone(1420);
      expect(max).toBe(1451);
      expect(status({ ...zone, prevRent: 1420, rent: 1451 }, "cap")).toBe("pass");
      expect(status({ ...zone, prevRent: 1420, rent: 1452 }, "cap")).toBe("fail");
    });
    it("caps large landlords at the reference index", () => {
      expect(status({ ...zone, landlordType: "large", refIndex: 1980, rent: 2100 }, "cap")).toBe("fail");
      expect(status({ ...zone, landlordType: "large", refIndex: 1980, rent: 1900 }, "cap")).toBe("pass");
    });
    it("warns when the previous rent is unknown", () => {
      expect(status({ ...zone }, "cap")).toBe("warn");
    });
    it("does not apply outside a stressed zone or to seasonal lets", () => {
      expect(status({ prevRent: 1000, rent: 5000 }, "cap")).toBe("na");
      expect(status({ ...zone, type: "seasonal", deposit: 2 }, "cap")).toBe("na");
    });
  });
});

describe("moveInCost", () => {
  it("adds rent, deposit and guarantee, with no agency fee", () => {
    const c = moveInCost({ rent: 1000, deposit: 1, extraGuarantee: 2, tenantFee: 0 });
    expect(c.total).toBe(4000);
    expect(c.rows.find((r) => r.label === "Agency fee")?.amount).toBe(0);
  });
});
