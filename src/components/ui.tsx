import { useId, type ReactNode } from "react";
import type { CheckStatus, Verdict } from "../domain/types";

const PATHS = {
  check: "M5 12.5 10 17 19 7",
  x: "M6 6l12 12M18 6 6 18",
  alert: "M12 3 2 20h20zM12 10v4M12 17v.5",
  id: "M3 6h18v12H3zM7 10h4M7 14h6M15.5 11.5a1.5 1.5 0 1 0 0-.01",
  euro: "M18 7a7 7 0 1 0 0 10M4 10h10M4 14h10",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  chevron: "m9 6 6 6-6 6",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  doc: "M6 3h8l4 4v14H6zM14 3v4h4",
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

interface FieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  children: (id: string, describedBy: string | undefined, invalid: boolean) => ReactNode;
}
/** Label, hint and error wired to the control with ids, so screen readers read them together. */
export function Field({ label, hint, error, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : "";
  const errId = error ? `${id}-err` : "";
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children(id, describedBy, !!error)}
      {hint && <span className="hint" id={hintId}>{hint}</span>}
      {error && <span className="err" id={errId} role="alert"><Icon name="alert" size={14} /> {error}</span>}
    </div>
  );
}

export const STATUS_GLYPH: Record<CheckStatus, string> = { pass: "✓", fail: "✕", warn: "!", na: "–" };

export function VerdictPill({ verdict }: { verdict: Verdict }) {
  const text = { verified: "✓ Verified", partial: "! Partly verified", blocked: "✕ Blocked" }[verdict];
  return <span className={`pill pill-${verdict}`}>{text}</span>;
}
