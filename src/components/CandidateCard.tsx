import { forwardRef, type CSSProperties } from "react";
import { fitBand, fitParts, incomeBand, isPrequalified } from "../domain/fit";
import { fmtDate, initials, pct } from "../domain/format";
import type { Candidate, CandidateStatus } from "../domain/types";
import { Icon } from "./ui";

export interface CandidateCardProps {
  candidate: Candidate;
  rent: number;
  score: number;
  ratio: number | null;
  expanded: boolean;
  active: boolean;
  onToggle: () => void;
  onStatus: (s: CandidateStatus) => void;
  onFocus: () => void;
}

const STATUS_TEXT: Record<CandidateStatus, string> = { new: "New", shortlisted: "Shortlisted", viewing: "Viewing booked", declined: "Declined" };
const SOURCE_TEXT = { passport: "Tejado passport", idealista: "idealista", fotocasa: "Fotocasa" } as const;

/**
 * One applicant, laid out the same way every time so an agent can scan a grid:
 * who → fit score → three checks → three numbers → their message → actions.
 */
export const CandidateCard = forwardRef<HTMLElement, CandidateCardProps>(function CandidateCard(
  { candidate: c, rent, score, ratio, expanded, active, onToggle, onStatus, onFocus },
  ref,
) {
  const band = fitBand(score);
  const titleId = `cand-${c.id}`;
  const detailsId = `cand-${c.id}-details`;
  const afford = ratio == null ? "unknown" : ratio <= 0.35 ? "good" : ratio <= 0.4 ? "tight" : "high";
  return (
    <article
      ref={ref}
      className={`cc band-${band}${active ? " is-active" : ""}${c.status === "declined" ? " is-declined" : ""}`}
      tabIndex={active ? 0 : -1}
      aria-labelledby={titleId}
      onFocus={onFocus}
    >
      <header className="cc-top">
        <span className="avatar" aria-hidden="true">{initials(c.name)}</span>
        <div className="cc-id">
          <h3 id={titleId}>{c.name}</h3>
          <span className="muted small">{c.occupation}</span>
        </div>
        <div className="ring" style={{ "--p": score } as CSSProperties} role="img" aria-label={`Fit ${score} out of 100, ${band}`}>
          <span>{score}</span>
        </div>
      </header>

      <ul className="cc-checks" aria-label="Checks">
        <li className={c.idOk ? "ok" : "no"}><Icon name={c.idOk ? "check" : "x"} size={14} /> ID</li>
        <li className={c.incomeOk ? "ok" : "no"}><Icon name={c.incomeOk ? "check" : "x"} size={14} /> Income</li>
        <li className={c.refs ? "ok" : "no"}><Icon name={c.refs ? "check" : "x"} size={14} /> Reference</li>
        {isPrequalified(c) && <li className="pq">Pre-qualified</li>}
      </ul>

      <dl className="cc-metrics">
        <div className={`afford-${afford}`}><dt>Rent / income</dt><dd>{pct(ratio)}</dd></div>
        <div><dt>Income</dt><dd>{incomeBand(c.netMonthly) ?? "Not verified"}</dd></div>
        <div><dt>Move in</dt><dd>{c.moveIn ? fmtDate(c.moveIn) : "Not given"}</dd></div>
      </dl>

      <p className="cc-msg">“{c.message}”</p>

      <div className="cc-meta">
        <span className="muted small">{SOURCE_TEXT[c.source]}{c.dupes > 1 ? ` · ${c.dupes} messages merged` : ""} · {fmtDate(c.received)}</span>
        <span className={`status st-${c.status}`}>{STATUS_TEXT[c.status]}</span>
      </div>

      <div className="cc-actions">
        {c.status === "declined" ? (
          <button type="button" className="btn ghost small" onClick={() => onStatus("new")}>Undo decline</button>
        ) : (
          <>
            {c.status === "new" && <button type="button" className="btn small primary" onClick={() => onStatus("shortlisted")}>Shortlist</button>}
            {c.status === "shortlisted" && <button type="button" className="btn small primary" onClick={() => onStatus("viewing")}>Book viewing</button>}
            <button type="button" className="btn small ghost" onClick={() => onStatus("declined")}>Decline</button>
          </>
        )}
        <button type="button" className="btn small link-btn" aria-expanded={expanded} aria-controls={detailsId} onClick={onToggle}>
          {expanded ? "Hide" : "Why"} {score}
        </button>
      </div>

      {expanded && (
        <div className="cc-details" id={detailsId}>
          {fitParts(c, rent).map((p) => (
            <div key={p.key} className="fp">
              <span>{p.label}</span>
              <span className="bar"><i style={{ width: `${(p.pts / p.max) * 100}%` }} /></span>
              <b>{p.pts}/{p.max}</b>
            </div>
          ))}
        </div>
      )}
    </article>
  );
});
