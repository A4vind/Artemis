import { ArrowRight, CircleCheck, Share2, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { LOCALE, useT } from '../i18n';
import { shareText } from '../lib/device';
import { localityName } from '../lib/format';
import { termLines, type TermChange } from '../lib/hiring';
import type { Application, OfferTerms } from '../state/store';
import { useStore } from '../state/store';
import { useToast } from './Toast';
import { Button, ChoiceGroup, TextField, focusFirstError } from './ui';

/* ---------- Read-only list of agreed / offered terms ---------- */

export function TermsList({ terms, changes = [] }: { terms: OfferTerms; changes?: TermChange[] }) {
  const { t, lang } = useT();
  return (
    <ul className="recap">
      {termLines(terms, t, lang).map((l) => {
        const ch = changes.find((c) => c.id === l.id);
        return (
          <li key={l.id} className={ch ? (ch.worse ? 'is-worse' : 'is-changed') : ''}>
            <span>{l.label}</span>
            <strong>
              {l.value}
              {ch && (
                <small className={`recap__was ${ch.wasMissing ? 'is-new' : ''}`}>
                  {ch.wasMissing ? t('offer.wasMissing') : t('offer.was', { from: ch.from })}
                </small>
              )}
            </strong>
          </li>
        );
      })}
    </ul>
  );
}

/** Highlights what an offer changes compared with the job post. */
export function OfferChangeNote({ changes }: { changes: TermChange[] }) {
  const { t } = useT();
  const worse = changes.filter((c) => c.worse);
  const filled = changes.filter((c) => c.wasMissing);
  if (!changes.length)
    return (
      <p className="callout callout--ok">
        <CircleCheck aria-hidden /> {t('offer.same')}
      </p>
    );
  return (
    <div className={`callout ${worse.length ? 'callout--danger' : 'callout--caution'}`}>
      <TriangleAlert aria-hidden />
      <div>
        <p>{worse.length ? t('offer.worse') : t('offer.changed')}</p>
        <ul>
          {changes.map((c) => (
            <li key={c.id}>
              <strong>{c.label}:</strong> {c.wasMissing ? `${t('offer.nowStated')} ${c.to}` : `${c.from} → ${c.to}`}
            </li>
          ))}
        </ul>
        {filled.length > 0 && !worse.length && <p className="small">{t('offer.filledNote')}</p>}
      </div>
    </div>
  );
}

/* ---------- Employer: make an offer (select an applicant or invite a worker) ---------- */

export function OfferForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: OfferTerms;
  submitLabel: string;
  onSubmit: (terms: OfferTerms) => void;
}) {
  const { t } = useT();
  const [f, setF] = useState({
    ...initial,
    amount: initial.amount ? String(initial.amount) : '',
    hoursPerDay: String(initial.hoursPerDay),
    startDay: String(Math.min(initial.startDay, 2)) as '0' | '1' | '2',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((cur) => ({ ...cur, [k]: v }));

  const submit = () => {
    const e: Record<string, string> = {};
    if (!(Number(f.amount) > 0)) e.amount = t('post.err.amount');
    const h = Number(f.hoursPerDay);
    if (!Number.isInteger(h) || h < 1 || h > 12) e.hours = t('post.err.hours');
    if (!f.startTime) e.time = t('post.err.time');
    if (!f.place.trim()) e.place = t('offer.err.place');
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    onSubmit({
      amount: Number(f.amount),
      period: f.period,
      timing: f.timing,
      startDay: Number(f.startDay),
      startTime: f.startTime,
      hoursPerDay: h,
      place: f.place.trim(),
    });
  };

  return (
    <form
      className="stack"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="muted small">{t('offer.formHint')}</p>
      <div className="field-row">
        <TextField label={t('post.amount')} type="number" inputMode="numeric" min={1} value={f.amount} onChange={(v) => set('amount', v)} error={errors.amount} />
        <TextField label={t('post.hours')} type="number" inputMode="numeric" min={1} max={12} value={f.hoursPerDay} onChange={(v) => set('hoursPerDay', v)} error={errors.hours} />
      </div>
      <ChoiceGroup
        legend={t('post.period')}
        layout="chips"
        value={f.period}
        onChange={(v) => set('period', v)}
        options={(['day', 'hour', 'job', 'month'] as const).map((p) => ({ value: p, label: t(`post.period.${p}`) }))}
      />
      <ChoiceGroup
        legend={t('post.timing')}
        layout="chips"
        value={f.timing}
        onChange={(v) => set('timing', v)}
        options={(['same_day', 'weekly', 'on_completion', 'monthly'] as const).map((p) => ({ value: p, label: t(`timing.${p}`) }))}
      />
      <ChoiceGroup
        legend={t('post.start')}
        layout="row"
        value={f.startDay}
        onChange={(v) => set('startDay', v)}
        options={(['0', '1', '2'] as const).map((v) => ({ value: v, label: t(`post.start${v}`) }))}
      />
      <div className="field-row">
        <TextField label={t('post.time')} type="time" value={f.startTime} onChange={(v) => set('startTime', v)} error={errors.time} />
        <TextField label={t('post.landmark')} value={f.place} onChange={(v) => set('place', v)} error={errors.place} maxLength={80} />
      </div>
      <Button type="submit" size="lg" block iconEnd={ArrowRight}>
        {submitLabel}
      </Button>
    </form>
  );
}

/* ---------- Pakka Parchi: the agreed-terms slip both sides keep ---------- */

export function PakkaParchi({ app }: { app: Application }) {
  const { t, lt, lang } = useT();
  const { state } = useStore();
  const toast = useToast();
  const offer = app.offer!;
  const job = app.job;
  const worker = state.profile?.name ?? '—';
  const agreed = new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric' }).format(app.acceptedAt ?? Date.now());
  const lines = termLines(offer, t, lang, true);

  const share = async () => {
    const text = [
      `${t('parchi.title')} — ${t('app.name')}`,
      `${t('parchi.work')}: ${lt(job.title)} (${t(`trade.${job.trade}`)})`,
      `${t('parchi.worker')}: ${worker}`,
      `${t('parchi.employer')}: ${job.employer.name}`,
      ...lines.map((l) => `${l.label}: ${l.value}`),
      `${t('parchi.area')}: ${localityName(job.locality, lang)}`,
      `${t('parchi.agreedOn')}: ${agreed}`,
      t('parchi.demoNote'),
    ].join('\n');
    const r = await shareText(text, t('parchi.title'));
    if (r === 'copied') toast(t('parchi.copied'));
  };

  return (
    <div className="stack">
      <article className="parchi" aria-label={t('parchi.title')}>
        <header className="parchi__head">
          <img src="/brand/kaamsetu-emblem.webp" width={240} height={113} alt="" />
          <div>
            <p className="parchi__title">{t('parchi.title')}</p>
            <p className="parchi__sub">{t('parchi.sub')}</p>
          </div>
        </header>
        <p className="parchi__job">
          {lt(job.title)} <span>· {t(`trade.${job.trade}`)}</span>
        </p>
        <dl className="parchi__people">
          <div>
            <dt>{t('parchi.worker')}</dt>
            <dd>{worker}</dd>
          </div>
          <div>
            <dt>{t('parchi.employer')}</dt>
            <dd>{job.employer.name}</dd>
          </div>
        </dl>
        <dl className="parchi__terms">
          {lines.map((l) => (
            <div key={l.id}>
              <dt>{l.label}</dt>
              <dd>{l.value}</dd>
            </div>
          ))}
        </dl>
        <p className="parchi__foot">
          {t('parchi.agreedOn')}: <strong>{agreed}</strong>
          <br />
          {t('parchi.demoNote')}
        </p>
      </article>
      <Button icon={Share2} block onClick={share}>
        {t('parchi.share')}
      </Button>
    </div>
  );
}

