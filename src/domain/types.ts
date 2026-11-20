export type RentalType = "long" | "seasonal";
export type LandlordType = "individual" | "large";
export type Zone = "none" | "tensionada";
export type Energy = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export type Portal = "idealista" | "fotocasa";

/** The terms of a rental that Spanish rules care about. */
export interface ListingTerms {
  type: RentalType;
  rent: number;
  /** Months of legal deposit (fianza). */
  deposit: number;
  /** Months of extra guarantee on top of the deposit. */
  extraGuarantee: number;
  /** Months of agency fee asked from the tenant. Must be 0 for homes. */
  tenantFee: number;
  landlordType: LandlordType;
  zone: Zone;
  /** Last contract's rent, needed in a stressed zone. */
  prevRent: number | null;
  /** Reference price index, applies to large landlords in a stressed zone. */
  refIndex: number | null;
  /** Habitability certificate uploaded. */
  cedula: boolean;
  /** Registration number for seasonal and short-term lets. */
  nrua: string;
}

export interface ListingDraft extends ListingTerms {
  town: string;
  area: string;
  title: string;
  beds: number;
  m2: number;
  energy: Energy;
  photo: string;
  available: string;
  portals: Portal[];
}

export interface Listing extends ListingDraft {
  id: string;
}

export type CheckId = "fee" | "deposit" | "guarantee" | "nrua" | "cedula" | "cap";
export type CheckStatus = "pass" | "fail" | "warn" | "na";
export type Verdict = "verified" | "partial" | "blocked";

export interface Check {
  id: CheckId;
  status: CheckStatus;
  label: string;
  detail: string;
  law: string;
}

export interface ComplianceReport {
  verdict: Verdict;
  fails: number;
  warns: number;
  checks: Check[];
}

export type CandidateSource = "passport" | "idealista" | "fotocasa";
export type CandidateStatus = "new" | "shortlisted" | "viewing" | "declined";

export interface Candidate {
  id: string;
  name: string;
  source: CandidateSource;
  idOk: boolean;
  incomeOk: boolean;
  /** Net monthly income, known only when income is verified. */
  netMonthly: number | null;
  refs: boolean;
  moveIn: string | null;
  /** Messages merged from several portals into one thread. */
  dupes: number;
  message: string;
  received: string;
  status: CandidateStatus;
  occupation: string;
}

export interface FitPart {
  key: "identity" | "income" | "afford" | "reference" | "movein";
  label: string;
  pts: number;
  max: number;
}
