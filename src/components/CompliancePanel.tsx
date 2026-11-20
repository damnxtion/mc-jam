import type { ComplianceReport } from "../domain/types";
import { STATUS_GLYPH, VerdictPill } from "./ui";

const SUMMARY = {
  verified: "Ready to publish. Every rule passes.",
  partial: "You can publish, but tenants will see a missing item.",
  blocked: "Fix the items in red before publishing.",
} as const;

export function CompliancePanel({ report, compact = false }: { report: ComplianceReport; compact?: boolean }) {
  const checks = compact ? report.checks.filter((c) => c.status !== "na") : report.checks;
  return (
    <section className="panel compliance" aria-labelledby="compliance-h">
      <div className="row-between">
        <h3 id="compliance-h">Rule check</h3>
        <VerdictPill verdict={report.verdict} />
      </div>
      <p className="muted small" aria-live="polite">{SUMMARY[report.verdict]}</p>
      <ul className="checks">
        {checks.map((c) => (
          <li key={c.id} className={`check check-${c.status}`}>
            <span className="dot" aria-hidden="true">{STATUS_GLYPH[c.status]}</span>
            <div>
              <b>{c.label}</b>
              <span className="muted small">{c.detail}</span>
            </div>
            <span className="law">{c.law}</span>
          </li>
        ))}
      </ul>
      <p className="note">Simplified rules with sample zone data. Not legal advice.</p>
    </section>
  );
}
