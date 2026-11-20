import { EMPTY_DRAFT, TOWNS } from "../domain/data";
import type { CheckId, ListingDraft } from "../domain/types";

export const STEPS = [
  { id: "property", title: "Property", hint: "Where the home is and what it's like." },
  { id: "terms", title: "Rent & terms", hint: "What the tenant pays. Rules are checked as you type." },
  { id: "documents", title: "Documents", hint: "Certificates and registration numbers." },
  { id: "review", title: "Review & publish", hint: "Check the listing as tenants will see it, then go live." },
] as const;

export type StepIndex = 0 | 1 | 2 | 3;
export type Errors = Partial<Record<keyof ListingDraft, string>>;

export interface WizardState {
  step: StepIndex;
  /** Furthest step reached, so finished steps stay clickable in the stepper. */
  maxReached: StepIndex;
  draft: ListingDraft;
  showErrors: boolean;
}

export type WizardAction =
  | { type: "set"; patch: Partial<ListingDraft> }
  | { type: "next" }
  | { type: "back" }
  | { type: "goto"; step: StepIndex }
  | { type: "reset" };

export const init = (draft: ListingDraft = EMPTY_DRAFT): WizardState => ({ step: 0, maxReached: 0, draft, showErrors: false });

export function validateStep(step: StepIndex, d: ListingDraft): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.area) e.area = "Choose a neighbourhood.";
    if (d.title.trim().length < 6) e.title = "Write a short title of at least 6 characters.";
    if (!(d.beds >= 1)) e.beds = "Enter at least 1 bedroom.";
    if (!(d.m2 >= 15)) e.m2 = "Enter the floor area in m², 15 or more.";
    if (!d.available) e.available = "Pick a move-in date.";
  }
  if (step === 1) {
    if (!(d.rent > 0)) e.rent = "Enter the monthly rent.";
    if (d.deposit < 0) e.deposit = "The deposit can't be negative.";
    if (d.landlordType === "large" && d.zone === "tensionada" && !d.refIndex)
      e.refIndex = "Large landlords in a stressed zone need the reference index.";
  }
  return e;
}

/** Which step fixes a failed check, so the review step can link straight to it. */
export const STEP_FOR_CHECK: Record<CheckId, StepIndex> = { fee: 1, deposit: 1, guarantee: 1, cap: 1, nrua: 2, cedula: 2 };

export function reducer(s: WizardState, a: WizardAction): WizardState {
  switch (a.type) {
    case "set": {
      let patch = a.patch;
      // A new town brings its own zone status and areas.
      if (patch.town && patch.town !== s.draft.town) patch = { ...patch, zone: TOWNS[patch.town]?.zone ?? "none", area: "" };
      // Seasonal lets use a 2-month deposit and no extra guarantee by default.
      if (patch.type && patch.type !== s.draft.type)
        patch = { ...patch, deposit: patch.type === "seasonal" ? 2 : 1, extraGuarantee: patch.type === "seasonal" ? 0 : 1 };
      return { ...s, draft: { ...s.draft, ...patch } };
    }
    case "next": {
      if (Object.keys(validateStep(s.step, s.draft)).length) return { ...s, showErrors: true };
      const step = Math.min(3, s.step + 1) as StepIndex;
      return { ...s, step, maxReached: Math.max(s.maxReached, step) as StepIndex, showErrors: false };
    }
    case "back":
      return { ...s, step: Math.max(0, s.step - 1) as StepIndex, showErrors: false };
    case "goto":
      return a.step <= s.maxReached ? { ...s, step: a.step, showErrors: false } : s;
    case "reset":
      return init();
  }
}

const KEY = "tejado-listing-draft";
export function loadDraft(): ListingDraft {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<ListingDraft>) } : EMPTY_DRAFT;
  } catch {
    return EMPTY_DRAFT;
  }
}
export function saveDraft(d: ListingDraft | null): void {
  try {
    if (d) localStorage.setItem(KEY, JSON.stringify(d));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable: the draft just won't survive a reload */
  }
}
