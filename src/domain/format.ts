const eurFmt = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const eur = (n: number | null | undefined): string => (n == null || Number.isNaN(n) ? "–" : eurFmt.format(n));

export const fmtDate = (iso: string | null | undefined): string =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "–";

export const pct = (ratio: number | null): string => (ratio == null ? "–" : `${Math.round(ratio * 100)}%`);

export const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

/** Days between two ISO dates (b - a). */
export const daysBetween = (a: string, b: string): number =>
  Math.round((new Date(`${b.slice(0, 10)}T12:00`).getTime() - new Date(`${a.slice(0, 10)}T12:00`).getTime()) / 86_400_000);
