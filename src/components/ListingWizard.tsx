import { useEffect, useMemo, useReducer, useRef } from "react";
import { checkCompliance, maxRentInStressedZone, moveInCost } from "../domain/compliance";
import { PHOTOS, TOWNS } from "../domain/data";
import { eur, fmtDate } from "../domain/format";
import type { ComplianceReport, Energy, Listing, ListingDraft, Portal } from "../domain/types";
import { CompliancePanel } from "./CompliancePanel";
import { Photo } from "./Photo";
import { Field, Icon, VerdictPill } from "./ui";
import { init, loadDraft, reducer, saveDraft, STEP_FOR_CHECK, STEPS, validateStep, type Errors, type StepIndex } from "./wizardState";

const num = (v: string): number => (v === "" ? NaN : Number(v));
const shortCity = (c: string) => c.replace("Donostia-San Sebastián", "Donostia");

type Set = (patch: Partial<ListingDraft>) => void;
interface StepProps { d: ListingDraft; set: Set; errors: Errors }

export function ListingWizard({ onPublish }: { onPublish: (l: Listing) => void }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => init(loadDraft()));
  const { step, draft, maxReached } = state;
  const report = useMemo(() => checkCompliance(draft), [draft]);
  const errors = state.showErrors ? validateStep(step, draft) : {};
  const set: Set = (patch) => dispatch({ type: "set", patch });

  useEffect(() => saveDraft(draft), [draft]);

  // Move focus to the step heading when the step changes, not on first load.
  const heading = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [step]);

  const publish = () => {
    if (report.verdict === "blocked") return;
    saveDraft(null);
    onPublish({ ...draft, id: `ls-${Date.now().toString(36)}` });
  };

  return (
    <div className="wizard">
      <div className="page-head">
        <div>
          <p className="eyebrow">Tejado Pro · New listing</p>
          <h1>List a home</h1>
        </div>
        <button type="button" className="btn ghost small" onClick={() => dispatch({ type: "reset" })}>Start over</button>
      </div>

      <ol className="stepper" aria-label="Progress">
        {STEPS.map((s, i) => {
          const state = i === step ? "current" : i <= maxReached ? "done" : "todo";
          return (
            <li key={s.id} className={`st st-${state}`}>
              <button type="button" disabled={i > maxReached} aria-current={i === step ? "step" : undefined} onClick={() => dispatch({ type: "goto", step: i as StepIndex })}>
                <span className="st-n">{state === "done" ? <Icon name="check" size={15} /> : i + 1}</span>
                <span className="st-t">{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="wiz-grid">
        <form
          className="panel wiz-body"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) dispatch({ type: "next" });
            else publish();
          }}
        >
          <h2 ref={heading} tabIndex={-1}>{STEPS[step].title}</h2>
          <p className="muted">{STEPS[step].hint}</p>
          {state.showErrors && Object.keys(errors).length > 0 && (
            <p className="form-alert" role="alert"><Icon name="alert" size={16} /> {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s need" : " needs"} attention.</p>
          )}

          {step === 0 && <PropertyStep d={draft} set={set} errors={errors} />}
          {step === 1 && <TermsStep d={draft} set={set} errors={errors} />}
          {step === 2 && <DocumentsStep d={draft} set={set} errors={errors} />}
          {step === 3 && <ReviewStep d={draft} set={set} report={report} goto={(s) => dispatch({ type: "goto", step: s })} />}

          <div className="wiz-nav">
            <button type="button" className="btn ghost" disabled={step === 0} onClick={() => dispatch({ type: "back" })}>Back</button>
            <span className="muted small">Step {step + 1} of {STEPS.length} · draft saved</span>
            {step < 3 ? (
              <button type="submit" className="btn primary">Continue</button>
            ) : (
              <button type="submit" className="btn primary" disabled={report.verdict === "blocked"} aria-describedby={report.verdict === "blocked" ? "blocked-why" : undefined}>
                Publish listing
              </button>
            )}
          </div>
        </form>

        <aside className="wiz-side">
          <CompliancePanel report={report} compact />
          <MoveInCard d={draft} />
        </aside>
      </div>
    </div>
  );
}

function PropertyStep({ d, set, errors }: StepProps) {
  const areas = TOWNS[d.town]?.areas ?? [];
  return (
    <div className="form-grid">
      <Field label="Town">
        {(id) => (
          <select id={id} value={d.town} onChange={(e) => set({ town: e.target.value })}>
            {Object.keys(TOWNS).map((t) => <option key={t}>{t}</option>)}
          </select>
        )}
      </Field>
      <Field label="Neighbourhood" error={errors.area}>
        {(id, desc, invalid) => (
          <select id={id} value={d.area} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ area: e.target.value })}>
            <option value="">Choose…</option>
            {areas.map((a) => <option key={a}>{a}</option>)}
          </select>
        )}
      </Field>
      <div className="span-2">
        <Field label="Title" hint="What tenants see first, e.g. “Two-bed flat with balcony”." error={errors.title}>
          {(id, desc, invalid) => <input id={id} value={d.title} maxLength={60} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ title: e.target.value })} />}
        </Field>
      </div>
      <fieldset className="span-2 seg-group">
        <legend>Rental type</legend>
        {(["long", "seasonal"] as const).map((t) => (
          <label key={t} className={`seg-opt${d.type === t ? " on" : ""}`}>
            <input type="radio" name="type" value={t} checked={d.type === t} onChange={() => set({ type: t })} />
            <b>{t === "long" ? "Long-term home" : "Seasonal let"}</b>
            <span className="muted small">{t === "long" ? "Main residence, tenancy law applies" : "Work or study stay, needs an NRUA"}</span>
          </label>
        ))}
      </fieldset>
      <Field label="Bedrooms" error={errors.beds}>
        {(id, desc, invalid) => <input id={id} type="number" min={1} max={10} inputMode="numeric" value={Number.isNaN(d.beds) ? "" : d.beds} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ beds: num(e.target.value) })} />}
      </Field>
      <Field label="Floor area (m²)" error={errors.m2}>
        {(id, desc, invalid) => <input id={id} type="number" min={15} inputMode="numeric" value={Number.isNaN(d.m2) ? "" : d.m2} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ m2: num(e.target.value) })} />}
      </Field>
      <Field label="Energy rating">
        {(id) => (
          <select id={id} value={d.energy} onChange={(e) => set({ energy: e.target.value as Energy })}>
            {["A", "B", "C", "D", "E", "F", "G"].map((x) => <option key={x}>{x}</option>)}
          </select>
        )}
      </Field>
      <Field label="Available from" error={errors.available}>
        {(id, desc, invalid) => <input id={id} type="date" value={d.available} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ available: e.target.value })} />}
      </Field>
      <fieldset className="span-2 photos">
        <legend>Cover photo</legend>
        <div className="photo-grid">
          {PHOTOS.map((p) => (
            <label key={p} className={`photo-opt${d.photo === p ? " on" : ""}`}>
              <input type="radio" name="photo" value={p} checked={d.photo === p} onChange={() => set({ photo: p })} />
              <Photo name={p} alt={`Photo ${PHOTOS.indexOf(p) + 1}`} />
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function TermsStep({ d, set, errors }: StepProps) {
  const stressed = d.zone === "tensionada";
  const seasonal = d.type === "seasonal";
  return (
    <div className="form-grid">
      <div className="span-2">
        <Field label="Monthly rent (€)" error={errors.rent}>
          {(id, desc, invalid) => <input id={id} className="big-input" type="number" min={0} step={10} inputMode="numeric" value={Number.isNaN(d.rent) ? "" : d.rent} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ rent: num(e.target.value) })} />}
        </Field>
      </div>
      <div className={`zone-banner span-2 ${stressed ? "on" : ""}`}>
        <div>
          <b>{shortCity(d.town)} is {stressed ? "a stressed zone" : "not a stressed zone"}</b>
          <span className="muted small">{stressed ? "New rents are capped by the last contract, or by the reference index for large landlords." : "No rent cap applies here."} Sample data.</span>
        </div>
        <label className="switch">
          <input type="checkbox" checked={stressed} onChange={(e) => set({ zone: e.target.checked ? "tensionada" : "none" })} />
          <span>Stressed zone</span>
        </label>
      </div>
      <fieldset className="span-2 seg-group">
        <legend>Landlord</legend>
        {(["individual", "large"] as const).map((t) => (
          <label key={t} className={`seg-opt${d.landlordType === t ? " on" : ""}`}>
            <input type="radio" name="landlord" value={t} checked={d.landlordType === t} onChange={() => set({ landlordType: t })} />
            <b>{t === "individual" ? "Individual owner" : "Large landlord"}</b>
            <span className="muted small">{t === "individual" ? "Owns fewer than 10 homes" : "Owns 10 or more, or 5+ in a stressed zone"}</span>
          </label>
        ))}
      </fieldset>
      {stressed && !seasonal && d.landlordType === "individual" && (
        <div className="span-2">
          <Field label="Previous contract rent (€)" hint={d.prevRent ? `The cap allows up to ${eur(maxRentInStressedZone(d.prevRent))} this year.` : "Needed to confirm the stressed-zone cap."}>
            {(id, desc) => <input id={id} type="number" min={0} inputMode="numeric" value={d.prevRent ?? ""} aria-describedby={desc} onChange={(e) => set({ prevRent: e.target.value === "" ? null : Number(e.target.value) })} />}
          </Field>
        </div>
      )}
      {stressed && !seasonal && d.landlordType === "large" && (
        <div className="span-2">
          <Field label="Reference price index (€)" hint="From the state rental price index for this address." error={errors.refIndex}>
            {(id, desc, invalid) => <input id={id} type="number" min={0} inputMode="numeric" value={d.refIndex ?? ""} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ refIndex: e.target.value === "" ? null : Number(e.target.value) })} />}
          </Field>
        </div>
      )}
      <Field label="Deposit (months)" hint={seasonal ? "2 months for seasonal lets" : "1 month for homes"} error={errors.deposit}>
        {(id, desc, invalid) => <input id={id} type="number" min={0} max={6} inputMode="numeric" value={d.deposit} aria-describedby={desc} aria-invalid={invalid} onChange={(e) => set({ deposit: Number(e.target.value) })} />}
      </Field>
      {!seasonal && (
        <Field label="Extra guarantee (months)" hint="Up to 2 months">
          {(id, desc) => <input id={id} type="number" min={0} max={6} inputMode="numeric" value={d.extraGuarantee} aria-describedby={desc} onChange={(e) => set({ extraGuarantee: Number(e.target.value) })} />}
        </Field>
      )}
      <Field label="Fee charged to the tenant (months)" hint="Must be 0. The landlord pays the agency.">
        {(id, desc) => <input id={id} type="number" min={0} max={3} inputMode="numeric" value={d.tenantFee} aria-describedby={desc} onChange={(e) => set({ tenantFee: Number(e.target.value) })} />}
      </Field>
    </div>
  );
}

function DocumentsStep({ d, set }: StepProps) {
  return (
    <div className="stack">
      <div className={`doc-row${d.cedula ? " ok" : ""}`}>
        <span className="doc-ic"><Icon name={d.cedula ? "check" : "doc"} /></span>
        <div>
          <b>Habitability certificate</b>
          <span className="muted small">Cédula or certificado de habitabilidad. Tenants need it to register and connect utilities.</span>
        </div>
        {d.cedula ? (
          <button type="button" className="btn ghost small" onClick={() => set({ cedula: false })}>Remove</button>
        ) : (
          <label className="btn small">
            <Icon name="upload" size={15} /> Upload PDF
            <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => e.target.files?.length && set({ cedula: true })} />
          </label>
        )}
      </div>
      {d.type === "seasonal" ? (
        <Field label="Registration number (NRUA)" hint="From the Registro Único de Arrendamientos. Shown on the listing.">
          {(id, desc) => <input id={id} className="mono" value={d.nrua} placeholder="ESFCTU0000…" aria-describedby={desc} onChange={(e) => set({ nrua: e.target.value.toUpperCase() })} />}
        </Field>
      ) : (
        <p className="note">No registration number is needed for a long-term home.</p>
      )}
    </div>
  );
}

function ReviewStep({ d, set, report, goto }: { d: ListingDraft; set: Set; report: ComplianceReport; goto: (s: StepIndex) => void }) {
  const fails = report.checks.filter((c) => c.status === "fail");
  const togglePortal = (p: Portal) => set({ portals: d.portals.includes(p) ? d.portals.filter((x) => x !== p) : [...d.portals, p] });
  return (
    <div className="review">
      <div className="preview-card">
        <div className="ph">
          <Photo name={d.photo} />
          <span className="badge"><VerdictPill verdict={report.verdict} /></span>
        </div>
        <div className="pc-body">
          <b>{d.area || "Neighbourhood"}, {shortCity(d.town)}</b>
          <span className="muted">{d.title || "Your title"}</span>
          <span className="muted">{d.beds} bed · {d.m2} m² · {d.type === "seasonal" ? "Seasonal" : "Long-term"} · from {fmtDate(d.available)}</span>
          <span><b>{eur(d.rent)}</b> month</span>
        </div>
      </div>
      <div className="stack">
        {fails.length > 0 ? (
          <div className="blocked" id="blocked-why" role="alert">
            <b>Fix {fails.length} item{fails.length > 1 ? "s" : ""} to publish</b>
            <ul>
              {fails.map((c) => (
                <li key={c.id}>
                  <span>{c.label}</span>
                  <button type="button" className="link" onClick={() => goto(STEP_FOR_CHECK[c.id])}>Fix in {STEPS[STEP_FOR_CHECK[c.id]].title} <Icon name="chevron" size={14} /></button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="ready"><Icon name="check" /> <span><b>Ready to go live.</b> Tenants see the rule check on the listing.</span></div>
        )}
        <fieldset className="portals">
          <legend>Also publish to</legend>
          {(["idealista", "fotocasa"] as const).map((p) => (
            <label key={p} className="check-line">
              <input type="checkbox" checked={d.portals.includes(p)} onChange={() => togglePortal(p)} /> {p === "idealista" ? "idealista" : "Fotocasa"}
            </label>
          ))}
          <span className="note">Portal feeds only go out once every rule passes.</span>
        </fieldset>
      </div>
    </div>
  );
}

function MoveInCard({ d }: { d: ListingDraft }) {
  const rent = Number.isNaN(d.rent) ? 0 : d.rent;
  const { rows, total } = moveInCost({ ...d, rent });
  return (
    <section className="panel" aria-labelledby="movein-h">
      <h3 id="movein-h">Tenant pays to move in</h3>
      <dl className="cost">
        {rows.map((r) => (
          <div key={r.label} className={r.label === "Agency fee" ? (r.amount ? "bad" : "good") : ""}>
            <dt>{r.label}</dt>
            <dd>{r.label === "Agency fee" && !r.amount ? "0 € · landlord pays" : eur(r.amount)}</dd>
          </div>
        ))}
        <div className="total"><dt>Total</dt><dd>{eur(total)}</dd></div>
      </dl>
    </section>
  );
}
