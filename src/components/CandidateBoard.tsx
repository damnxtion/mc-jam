import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CANDIDATES } from "../domain/data";
import { fitScore, isPrequalified, rentToIncome } from "../domain/fit";
import { eur, fmtDate } from "../domain/format";
import type { Candidate, CandidateStatus, Listing } from "../domain/types";
import { CandidateCard } from "./CandidateCard";
import { Photo } from "./Photo";

type Filter = "all" | "prequalified" | "verify" | "shortlisted" | "declined";
type Sort = "fit" | "newest" | "afford";

const FILTERS: { id: Filter; label: string; test: (c: Candidate) => boolean }[] = [
  { id: "all", label: "All", test: (c) => c.status !== "declined" },
  { id: "prequalified", label: "Pre-qualified", test: (c) => isPrequalified(c) && c.status !== "declined" },
  { id: "verify", label: "Needs verification", test: (c) => !isPrequalified(c) && c.status !== "declined" },
  { id: "shortlisted", label: "Shortlisted", test: (c) => c.status === "shortlisted" || c.status === "viewing" },
  { id: "declined", label: "Declined", test: (c) => c.status === "declined" },
];
const NEXT_STATUS: Partial<Record<CandidateStatus, CandidateStatus>> = { new: "shortlisted", shortlisted: "viewing" };

export function CandidateBoard({ listing, justPublished }: { listing: Listing; justPublished: boolean }) {
  const [cands, setCands] = useState<Candidate[]>(CANDIDATES);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("fit");
  const [open, setOpen] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [announce, setAnnounce] = useState("");
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  /** Index to refocus after a card leaves the current view, so keyboard users don't lose their place. */
  const pendingFocus = useRef<number | null>(null);

  const scored = useMemo(() => cands.map((c) => ({ c, score: fitScore(c, listing.rent), ratio: rentToIncome(c, listing.rent) })), [cands, listing.rent]);
  const visible = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0]!;
    const rows = scored.filter((r) => f.test(r.c));
    return rows.sort((a, b) =>
      sort === "fit" ? b.score - a.score
        : sort === "newest" ? b.c.received.localeCompare(a.c.received)
        : (a.ratio ?? 9) - (b.ratio ?? 9),
    );
  }, [scored, filter, sort]);

  const live = scored.filter((r) => r.c.status !== "declined");
  const stats = {
    total: live.length,
    pre: live.filter((r) => isPrequalified(r.c)).length,
    avg: live.length ? Math.round(live.reduce((a, r) => a + r.score, 0) / live.length) : 0,
    short: live.filter((r) => r.c.status === "shortlisted" || r.c.status === "viewing").length,
  };

  const setStatus = (id: string, status: CandidateStatus) => {
    const name = cands.find((c) => c.id === id)?.name ?? "";
    const idx = visible.findIndex((r) => r.c.id === id);
    const target = cands.find((c) => c.id === id);
    const f = FILTERS.find((x) => x.id === filter) ?? FILTERS[0]!;
    if (target && idx >= 0 && !f.test({ ...target, status })) pendingFocus.current = idx;
    setCands((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    setAnnounce(`${name}: ${status === "new" ? "moved back to new" : status === "viewing" ? "viewing booked" : status}.`);
  };

  const focusCard = (i: number) => {
    const n = Math.max(0, Math.min(visible.length - 1, i));
    setActive(n);
    cardRefs.current[n]?.focus();
  };

  useEffect(() => {
    if (pendingFocus.current == null) return;
    const i = Math.min(pendingFocus.current, visible.length - 1);
    pendingFocus.current = null;
    if (i >= 0) { setActive(i); cardRefs.current[i]?.focus(); }
  }, [visible]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const row = visible[active];
    const onCard = e.target === cardRefs.current[active];
    if (["ArrowDown", "ArrowRight", "j"].includes(e.key)) { e.preventDefault(); focusCard(active + 1); }
    else if (["ArrowUp", "ArrowLeft", "k"].includes(e.key)) { e.preventDefault(); focusCard(active - 1); }
    else if (e.key === "Home") { e.preventDefault(); focusCard(0); }
    else if (e.key === "End") { e.preventDefault(); focusCard(visible.length - 1); }
    else if (!row) return;
    else if (e.key === "s" && NEXT_STATUS[row.c.status]) setStatus(row.c.id, NEXT_STATUS[row.c.status]!);
    else if (e.key === "d" && row.c.status !== "declined") setStatus(row.c.id, "declined");
    else if ((e.key === "Enter" || e.key === " ") && onCard) { e.preventDefault(); setOpen(open === row.c.id ? null : row.c.id); }
  };

  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, scored.filter((r) => f.test(r.c)).length])) as Record<Filter, number>;

  return (
    <div className="board">
      {justPublished && (
        <div className="banner" role="status">
          <b>Your listing is live.</b> These applicants are sample data, ranked against your rent of {eur(listing.rent)}.
        </div>
      )}
      <div className="listing-head">
        <Photo name={listing.photo} />
        <div>
          <p className="eyebrow">Applicants</p>
          <h1>{listing.area} · {listing.title}</h1>
          <p className="muted">{eur(listing.rent)} / month · {listing.beds} bed · {listing.m2} m² · available {fmtDate(listing.available)}</p>
        </div>
      </div>

      <dl className="stats">
        <div><dt>Applicants</dt><dd>{stats.total}</dd></div>
        <div><dt>Pre-qualified</dt><dd>{stats.pre}</dd></div>
        <div><dt>Average fit</dt><dd>{stats.avg}</dd></div>
        <div><dt>Shortlisted</dt><dd>{stats.short}</dd></div>
      </dl>

      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter applicants">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`chip-btn${filter === f.id ? " on" : ""}`} aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setActive(0); }}>
              {f.label} <span>{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => { setSort(e.target.value as Sort); setActive(0); }}>
            <option value="fit">Best fit</option>
            <option value="newest">Newest</option>
            <option value="afford">Most affordable</option>
          </select>
        </label>
      </div>
      <p className="kbd-hint muted small">
        Keyboard: <kbd>↑</kbd><kbd>↓</kbd> or <kbd>j</kbd><kbd>k</kbd> to move · <kbd>s</kbd> next step · <kbd>d</kbd> decline · <kbd>Enter</kbd> score breakdown
      </p>

      <div className="cc-grid" role="list" aria-label={`${visible.length} applicants`} onKeyDown={onKey}>
        {visible.map((r, i) => (
          <div role="listitem" key={r.c.id}>
            <CandidateCard
              ref={(el) => { cardRefs.current[i] = el; }}
              candidate={r.c}
              rent={listing.rent}
              score={r.score}
              ratio={r.ratio}
              expanded={open === r.c.id}
              active={i === Math.min(active, visible.length - 1)}
              onFocus={() => setActive(i)}
              onToggle={() => setOpen(open === r.c.id ? null : r.c.id)}
              onStatus={(s) => setStatus(r.c.id, s)}
            />
          </div>
        ))}
        {visible.length === 0 && <p className="empty">No applicants here yet.</p>}
      </div>
      <p className="sr-only" aria-live="polite">{announce}</p>
    </div>
  );
}
