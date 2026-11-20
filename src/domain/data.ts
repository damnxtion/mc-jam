import type { Candidate, Listing, ListingDraft, Zone } from "./types";

export const TODAY = "2026-11-20";

/** Sample stressed-zone status by town. Replace with the official ministry list. */
export const TOWNS: Record<string, { zone: Zone; areas: string[] }> = {
  "Donostia-San Sebastián": { zone: "tensionada", areas: ["Gros", "Amara", "Antiguo", "Egia", "Centro", "Parte Vieja"] },
  Hondarribia: { zone: "none", areas: ["Alde Zaharra", "Marina", "Amute"] },
  Bilbao: { zone: "none", areas: ["Indautxu", "Deusto", "Abando", "Casco Viejo"] },
  Getxo: { zone: "tensionada", areas: ["Neguri", "Algorta", "Las Arenas"] },
  Irun: { zone: "none", areas: ["Centro", "Behobia"] },
  Zarautz: { zone: "none", areas: ["Malecón", "Centro"] },
};

export const PHOTOS = ["h13", "facade01", "h01", "h10", "row01", "street01", "h18", "h21", "h11", "plaza01", "h08", "h20"] as const;

export const EMPTY_DRAFT: ListingDraft = {
  town: "Donostia-San Sebastián",
  area: "",
  title: "",
  beds: 2,
  m2: 70,
  energy: "D",
  photo: "h13",
  available: "2026-12-15",
  type: "long",
  rent: 1450,
  deposit: 1,
  extraGuarantee: 1,
  tenantFee: 0,
  landlordType: "individual",
  zone: "tensionada",
  prevRent: null,
  refIndex: null,
  cedula: false,
  nrua: "",
  portals: ["idealista", "fotocasa"],
};

export const SAMPLE_LISTING: Listing = {
  ...EMPTY_DRAFT,
  id: "dn-gros-01",
  area: "Gros",
  title: "Two-bed flat with balcony",
  m2: 78,
  available: "2026-12-01",
  prevRent: 1420,
  cedula: true,
};

export const CANDIDATES: Candidate[] = [
  { id: "c1", name: "Ane Etxeberria", source: "passport", idOk: true, incomeOk: true, netMonthly: 4300, refs: true, moveIn: "2026-12-01", dupes: 1, message: "Teacher at a school in Gros, moving with my partner.", received: "2026-11-19", status: "new", occupation: "Teacher · permanent" },
  { id: "c2", name: "Jon Agirre", source: "passport", idOk: true, incomeOk: true, netMonthly: 3900, refs: false, moveIn: "2026-12-15", dupes: 2, message: "Can visit any afternoon this week.", received: "2026-11-19", status: "new", occupation: "Software engineer" },
  { id: "c3", name: "Mikel Zubizarreta", source: "passport", idOk: true, incomeOk: true, netMonthly: 3100, refs: true, moveIn: "2026-12-01", dupes: 1, message: "Nurse at Donostia hospital, permanent contract.", received: "2026-11-17", status: "shortlisted", occupation: "Nurse · permanent" },
  { id: "c4", name: "Lucía Martín", source: "idealista", idOk: false, incomeOk: false, netMonthly: null, refs: false, moveIn: null, dupes: 3, message: "¿Sigue disponible?", received: "2026-11-18", status: "new", occupation: "Not shared" },
  { id: "c5", name: "Iker Goikoetxea", source: "passport", idOk: true, incomeOk: false, netMonthly: null, refs: true, moveIn: "2026-12-01", dupes: 1, message: "Freelance designer, can show 2 years of tax returns.", received: "2026-11-16", status: "new", occupation: "Freelance designer" },
  { id: "c6", name: "Sara Ortiz", source: "fotocasa", idOk: false, incomeOk: false, netMonthly: null, refs: false, moveIn: "2027-01-01", dupes: 1, message: "Interested, I have a small dog.", received: "2026-11-15", status: "new", occupation: "Not shared" },
  { id: "c7", name: "Maialen Arrieta", source: "passport", idOk: true, incomeOk: true, netMonthly: 5200, refs: true, moveIn: "2026-12-01", dupes: 1, message: "Researcher at the university, 3-year contract.", received: "2026-11-18", status: "viewing", occupation: "Researcher · 3-year contract" },
  { id: "c8", name: "Gorka Uriarte", source: "passport", idOk: true, incomeOk: true, netMonthly: 2900, refs: false, moveIn: null, dupes: 1, message: "Looking for something long-term with my brother.", received: "2026-11-14", status: "new", occupation: "Electrician" },
  { id: "c9", name: "Claire Dubois", source: "passport", idOk: true, incomeOk: true, netMonthly: 4600, refs: true, moveIn: "2026-12-15", dupes: 1, message: "Relocating from Bayonne for a job at a tech company.", received: "2026-11-20", status: "new", occupation: "Product manager" },
  { id: "c10", name: "Unai Lasa", source: "idealista", idOk: false, incomeOk: false, netMonthly: null, refs: false, moveIn: null, dupes: 2, message: "Hola, info please", received: "2026-11-13", status: "declined", occupation: "Not shared" },
  { id: "c11", name: "Nerea Olaizola", source: "passport", idOk: true, incomeOk: true, netMonthly: 3600, refs: true, moveIn: "2026-12-01", dupes: 1, message: "Quiet couple, both working, references from our last landlord.", received: "2026-11-19", status: "new", occupation: "Accountant" },
  { id: "c12", name: "Daniel Sánchez", source: "fotocasa", idOk: true, incomeOk: false, netMonthly: null, refs: false, moveIn: "2027-01-10", dupes: 2, message: "Is the flat furnished?", received: "2026-11-17", status: "new", occupation: "Not shared" },
];
