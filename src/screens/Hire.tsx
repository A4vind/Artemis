import { ArrowRight, Check, ChevronLeft, CircleCheck, Eye, Megaphone, Pencil, TriangleAlert, Trash2, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCard } from '../components/JobCard';
import { Avatar, KaamCard } from '../components/KaamCard';
import { PakkaCheckPanel } from '../components/PakkaCheckPanel';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import {
  Button,
  ButtonLink,
  ChoiceGroup,
  DemoTag,
  EmptyState,
  FieldError,
  MultiChoiceGroup,
  TextField,
  TradeIcon,
  focusFirstError,
} from '../components/ui';
import type { EmployerType, Job, PayPeriod, PayTiming, Provision } from '../data/jobs';
import { LOCALITIES, distanceKm, type LocalityId } from '../data/localities';
import { TRADES, type TradeId } from '../data/trades';
import { DEMO_WORKERS, type WorkerProfile } from '../data/workers';
import { useT } from '../i18n';
import { localityName, payParts, startLabel } from '../lib/format';
import { pakkaCheck } from '../lib/pakkaCheck';
import { useStore } from '../state/store';
import { isValidPhone } from './Onboarding';

type Tab = 'post' | 'posts' | 'find';

export function Hire() {
  const { t } = useT();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'post';
  const setTab = (next: Tab) => setParams({ tab: next }, { replace: true });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'post', label: t('hire.tab.post') },
    { id: 'posts', label: t('hire.tab.posts') },
    { id: 'find', label: t('hire.tab.find') },
  ];

  return (
    <div className="page page--hire">
      <header className="page-head">
        <h1 className="h1">{t('hire.title')}</h1>
        <p className="lead">{t('hire.sub')}</p>
      </header>

      <nav className="segmented" aria-label={t('hire.title')}>
        {tabs.map((x) => (
          <button key={x.id} className={`segmented__item ${tab === x.id ? 'is-on' : ''}`} aria-current={tab === x.id ? 'page' : undefined} onClick={() => setTab(x.id)}>
            {x.label}
          </button>
        ))}
      </nav>

      {tab === 'post' && <PostJob onPublished={() => setTab('posts')} />}
      {tab === 'posts' && <MyPosts onPost={() => setTab('post')} />}
      {tab === 'find' && <FindWorkers />}
    </div>
  );
}

/* ================= Post work ================= */

interface Draft {
  trade: TradeId | null;
  title: string;
  desc: string;
  workers: string;
  area: LocalityId | null;
  landmark: string;
  startDay: '0' | '1' | '2';
  time: string;
  hours: string;
  durCount: string;
  durUnit: 'day' | 'week' | 'month';
  amount: string;
  period: PayPeriod | null;
  timing: PayTiming | null;
  provides: Provision[];
  empName: string;
  empType: EmployerType | null;
  phone: string;
  noFee: boolean;
}

const EMPTY: Draft = {
  trade: null,
  title: '',
  desc: '',
  workers: '1',
  area: null,
  landmark: '',
  startDay: '1',
  time: '09:00',
  hours: '8',
  durCount: '1',
  durUnit: 'day',
  amount: '',
  period: null,
  timing: null,
  provides: [],
  empName: '',
  empType: null,
  phone: '',
  noFee: false,
};

const STEPS = ['work', 'place', 'pay', 'contact', 'review'] as const;
const inRange = (v: string, min: number, max: number) => {
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max;
};

function toJob(d: Draft): Job {
  return {
    id: `you-${Date.now()}`,
    trade: d.trade!,
    title: { en: d.title.trim() },
    description: d.desc.trim() ? { en: d.desc.trim() } : undefined,
    employer: { name: d.empName.trim(), type: d.empType!, phone: d.phone.replace(/\s/g, '') },
    locality: d.area!,
    landmark: d.landmark.trim() || undefined,
    pay: { amount: Number(d.amount), period: d.period!, timing: d.timing! },
    startDay: Number(d.startDay),
    startTime: d.time,
    hoursPerDay: Number(d.hours),
    duration: { unit: d.durUnit, count: Number(d.durCount) },
    workersNeeded: Number(d.workers),
    provides: d.provides,
    safetyGearMentioned: d.provides.includes('safety_gear'),
    redFlags: [],
    postedHoursAgo: 0,
    source: 'you',
  };
}

function PostJob({ onPublished }: { onPublished: () => void }) {
  const { t, lang } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  const [d, setD] = useState<Draft>(EMPTY);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const headRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setD((cur) => ({ ...cur, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }));
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headRef.current?.focus();
  }, [step]);

  const validateStep = (s: number): Record<string, string> => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!d.trade) e.trade = t('post.err.trade');
      if (!d.title.trim()) e.title = t('post.err.title');
      if (!inRange(d.workers, 1, 100)) e.workers = t('post.err.workers');
    }
    if (s === 1) {
      if (!d.area) e.area = t('post.err.area');
      if (!d.time) e.time = t('post.err.time');
      if (!inRange(d.hours, 1, 12)) e.hours = t('post.err.hours');
      if (!inRange(d.durCount, 1, 99)) e.durCount = t('post.err.duration');
    }
    if (s === 2) {
      if (!(Number(d.amount) > 0)) e.amount = t('post.err.amount');
      if (!d.period) e.period = t('post.err.period');
      if (!d.timing) e.timing = t('post.err.timing');
    }
    if (s === 3) {
      if (!d.empName.trim()) e.empName = t('post.err.name');
      if (!d.empType) e.empType = t('post.err.type');
      if (!isValidPhone(d.phone)) e.phone = t('post.err.phone');
      if (!d.noFee) e.noFee = t('post.err.noFee');
    }
    return e;
  };

  const next = () => {
    const e = validateStep(step);
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      toast(t('post.err.summary'), 'error');
      focusFirstError();
      return;
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const publish = () => {
    // Re-validate everything; publishing an under-specified job is not allowed.
    for (let s = 0; s < 4; s++) {
      const e = validateStep(s);
      if (Object.values(e).some(Boolean)) {
        setErrors(e);
        setStep(s);
        toast(t('post.err.summary'), 'error');
        focusFirstError();
        return;
      }
    }
    dispatch({ type: 'postJob', job: toJob(d) });
    toast(t('post.published'));
    setD(EMPTY);
    setStep(0);
    onPublished();
  };

  const stepLabel = t(`post.step.${STEPS[step]}`);

  return (
    <section className="post" aria-labelledby="post-step-h">
      <ol className="stepper" aria-label={t('onb.step', { n: step + 1, total: STEPS.length })}>
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
            <span className="stepper__dot" aria-hidden>
              {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
            </span>
            <span className="stepper__label">{t(`post.step.${s}`)}</span>
          </li>
        ))}
      </ol>

      <form
        className="post__form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 4) next();
          else publish();
        }}
      >
        <h2 className="h2" id="post-step-h" tabIndex={-1} ref={headRef}>
          <span className="sr-only">{t('onb.step', { n: step + 1, total: STEPS.length })}. </span>
          {stepLabel}
        </h2>
        {step < 4 && (
          <p className="small muted">
            <span className="req">*</span> {t('common.required')}
          </p>
        )}

        {step === 0 && (
          <div className="stack">
            <ChoiceGroup
              legend={`${t('post.trade')} *`}
              layout="grid"
              value={d.trade}
              onChange={(v) => set('trade', v)}
              error={errors.trade}
              options={TRADES.map((tr) => ({ value: tr.id, label: t(`trade.${tr.id}`), icon: <TradeIcon trade={tr.id} size="sm" /> }))}
            />
            <TextField label={`${t('post.titleLabel')} *`} placeholder={t('post.titlePh')} value={d.title} onChange={(v) => set('title', v)} error={errors.title} maxLength={60} />
            <TextField label={t('post.desc')} optional multiline placeholder={t('post.descPh')} value={d.desc} onChange={(v) => set('desc', v)} maxLength={300} />
            <TextField label={`${t('post.workers')} *`} type="number" inputMode="numeric" min={1} max={100} value={d.workers} onChange={(v) => set('workers', v)} error={errors.workers} className="input input--short" />
          </div>
        )}

        {step === 1 && (
          <div className="stack">
            <ChoiceGroup
              legend={`${t('post.area')} *`}
              layout="chips"
              value={d.area}
              onChange={(v) => set('area', v)}
              error={errors.area}
              options={LOCALITIES.map((l) => ({ value: l.id, label: l.name[lang] }))}
            />
            <TextField label={t('post.landmark')} hint={t('post.landmarkHint')} optional value={d.landmark} onChange={(v) => set('landmark', v)} maxLength={80} />
            <ChoiceGroup
              legend={`${t('post.start')} *`}
              layout="row"
              value={d.startDay}
              onChange={(v) => set('startDay', v)}
              options={(['0', '1', '2'] as const).map((v) => ({ value: v, label: t(`post.start${v}`) }))}
            />
            <div className="field-row">
              <TextField label={`${t('post.time')} *`} type="time" value={d.time} onChange={(v) => set('time', v)} error={errors.time} />
              <TextField label={`${t('post.hours')} *`} type="number" inputMode="numeric" min={1} max={12} value={d.hours} onChange={(v) => set('hours', v)} error={errors.hours} />
            </div>
            <fieldset className="choice-group">
              <legend className="field__label">{t('post.duration')} *</legend>
              <div className="field-row">
                <TextField label={t('post.durationCount')} type="number" inputMode="numeric" min={1} max={99} value={d.durCount} onChange={(v) => set('durCount', v)} error={errors.durCount} />
                <ChoiceGroup
                  legend={t('post.durationUnit')}
                  layout="row"
                  value={d.durUnit}
                  onChange={(v) => set('durUnit', v)}
                  options={(['day', 'week', 'month'] as const).map((u) => ({ value: u, label: t(`post.unit.${u}`) }))}
                />
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <TextField label={`${t('post.amount')} *`} type="number" inputMode="numeric" min={1} value={d.amount} onChange={(v) => set('amount', v)} error={errors.amount} className="input input--short" />
            <ChoiceGroup
              legend={`${t('post.period')} *`}
              layout="chips"
              value={d.period}
              onChange={(v) => set('period', v)}
              error={errors.period}
              options={(['day', 'hour', 'job', 'month'] as const).map((p) => ({ value: p, label: t(`post.period.${p}`) }))}
            />
            <ChoiceGroup
              legend={`${t('post.timing')} *`}
              value={d.timing}
              onChange={(v) => set('timing', v)}
              error={errors.timing}
              options={(['same_day', 'weekly', 'on_completion', 'monthly'] as const).map((p) => ({ value: p, label: t(`timing.${p}`) }))}
            />
            <MultiChoiceGroup
              legend={t('post.provides')}
              hint={t('common.optional')}
              layout="chips"
              values={d.provides}
              onChange={(v) => set('provides', v)}
              options={(['tools', 'safety_gear', 'food', 'travel'] as const).map((p) => ({ value: p, label: t(`provide.${p}`) }))}
            />
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <TextField label={`${t('post.empName')} *`} value={d.empName} onChange={(v) => set('empName', v)} error={errors.empName} maxLength={50} autoComplete="organization" />
            <ChoiceGroup
              legend={`${t('post.empType')} *`}
              layout="row"
              value={d.empType}
              onChange={(v) => set('empType', v)}
              error={errors.empType}
              options={(['household', 'contractor', 'business'] as const).map((e) => ({ value: e, label: t(`emp.${e}`) }))}
            />
            <TextField label={`${t('post.phone')} *`} hint={t('post.phoneHint')} type="tel" inputMode="numeric" maxLength={11} value={d.phone} onChange={(v) => set('phone', v)} error={errors.phone} autoComplete="tel-national" />
            <div className={`field ${errors.noFee ? 'has-error' : ''}`}>
              <label className="check-row check-row--pledge">
                <input type="checkbox" checked={d.noFee} onChange={(e) => set('noFee', e.target.checked)} aria-invalid={!!errors.noFee || undefined} />
                <span>{t('post.noFee')} *</span>
              </label>
              {errors.noFee && <FieldError>{errors.noFee}</FieldError>}
            </div>
          </div>
        )}

        {step === 4 && <Review draft={d} onEdit={setStep} />}

        <div className="post__nav">
          {step > 0 && (
            <Button variant="ghost" icon={ChevronLeft} onClick={() => setStep(step - 1)}>
              {t('common.back')}
            </Button>
          )}
          <Button type="submit" size="lg" icon={step < 4 ? undefined : Megaphone} iconEnd={step < 4 ? ArrowRight : undefined}>
            {step < 4 ? t('common.next') : t('post.publish')}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Review({ draft, onEdit }: { draft: Draft; onEdit: (s: number) => void }) {
  const { t, lang } = useT();
  const job = toJob(draft);
  const check = pakkaCheck(job, t, lang);
  const missing = check.items.filter((i) => i.status === 'missing');

  return (
    <div className="review">
      <div className="review__col">
        <h3 className="h3">{t('post.review.preview')}</h3>
        <JobCard job={job} from={job.locality} preview />
        <div className="btn-row">
          {(['work', 'place', 'pay', 'contact'] as const).map((s, i) => (
            <Button key={s} variant="quiet" icon={Pencil} onClick={() => onEdit(i)}>
              {t(`post.step.${s}`)}
            </Button>
          ))}
        </div>
      </div>
      <div className="review__col">
        {missing.length ? (
          <div className="callout callout--caution">
            <TriangleAlert aria-hidden />
            <div>
              <p>{t('post.review.missing')}</p>
              <ul>
                {missing.map((m) => (
                  <li key={m.id}>{m.text}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="callout callout--ok">
            <CircleCheck aria-hidden /> {t('post.review.complete')}
          </p>
        )}
        <PakkaCheckPanel check={check} showAsk={false} />
      </div>
    </div>
  );
}

/* ================= My posts ================= */

function MyPosts({ onPost }: { onPost: () => void }) {
  const { t, lt, lang } = useT();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [removing, setRemoving] = useState<Job | null>(null);

  if (!state.postedJobs.length) {
    return (
      <EmptyState
        icon={Megaphone}
        title={t('posts.empty.title')}
        body={t('posts.empty.body')}
        action={<Button onClick={onPost}>{t('hire.tab.post')}</Button>}
      />
    );
  }

  return (
    <>
      <ul className="app-list">
        {state.postedJobs.map((job) => {
          const pay = payParts(t, job);
          // Applications made by the worker profile on this same device.
          const applicants = state.applications.filter((a) => a.jobId === job.id);
          return (
            <li key={job.id} className="app-card">
              <div className="app-card__top">
                <TradeIcon trade={job.trade} />
                <div>
                  <h2 className="h3">{lt(job.title)}</h2>
                  <p className="muted">
                    {pay.amount} {pay.per} · {localityName(job.locality, lang)} · {startLabel(t, lang, job.startDay)}
                  </p>
                </div>
              </div>
              <p className={`applicants ${applicants.length ? 'has-some' : ''}`}>
                <Users aria-hidden size={18} />
                {applicants.length === 0
                  ? t('posts.applicants0')
                  : applicants.length === 1
                    ? t('posts.applicants1')
                    : t('posts.applicants', { n: applicants.length })}
              </p>
              {applicants.length > 0 && state.profile && <KaamCard profile={state.profile} compact />}
              <div className="btn-row">
                <ButtonLink to={`/work/${job.id}`} variant="secondary" icon={Eye}>
                  {t('posts.viewAs')}
                </ButtonLink>
                <Button variant="quiet" icon={Trash2} onClick={() => setRemoving(job)}>
                  {t('posts.remove')}
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
      <Sheet
        open={!!removing}
        onClose={() => setRemoving(null)}
        title={t('posts.remove')}
        tone="danger"
        footer={
          <div className="btn-row btn-row--stack">
            <Button
              variant="danger"
              block
              onClick={() => {
                dispatch({ type: 'removePost', jobId: removing!.id });
                setRemoving(null);
                toast(t('posts.removed'), 'info');
              }}
            >
              {t('posts.remove')}
            </Button>
            <Button variant="ghost" block onClick={() => setRemoving(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        }
      >
        {removing && <p className="lead">{t('posts.removeQ', { title: lt(removing.title) })}</p>}
      </Sheet>
    </>
  );
}

/* ================= Find workers ================= */

function FindWorkers() {
  const { t, lang } = useT();
  const { state } = useStore();
  const [trade, setTrade] = useState<TradeId | 'all'>('all');
  const [area, setArea] = useState<LocalityId>('shivajinagar');
  const [todayOnly, setTodayOnly] = useState(false);
  const [viewing, setViewing] = useState<WorkerProfile | null>(null);

  const pool: (WorkerProfile & { id: string; isYou?: boolean })[] = [
    ...(state.profile ? [{ ...state.profile, id: 'you', isYou: true }] : []),
    ...DEMO_WORKERS,
  ];
  const workers = pool
    .filter((w) => (trade === 'all' || w.trades.includes(trade)) && (!todayOnly || w.availability === 'today'))
    .sort((a, b) => distanceKm(area, a.area) - distanceKm(area, b.area));

  return (
    <section aria-labelledby="find-h" className="find">
      <h2 className="h2" id="find-h">
        {t('find.title')}
      </h2>
      <DemoTag>{t('find.note')}</DemoTag>

      <div className="find__filters">
        <div className="field">
          <label className="field__label" htmlFor="find-area">
            {t('post.area')}
          </label>
          <select id="find-area" className="input" value={area} onChange={(e) => setArea(e.target.value as LocalityId)}>
            {LOCALITIES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name[lang]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="find-trade">
            {t('post.trade')}
          </label>
          <select id="find-trade" className="input" value={trade} onChange={(e) => setTrade(e.target.value as TradeId | 'all')}>
            <option value="all">{t('home.filter.allTypes')}</option>
            {TRADES.map((tr) => (
              <option key={tr.id} value={tr.id}>
                {t(`trade.${tr.id}`)}
              </option>
            ))}
          </select>
        </div>
        <button className={`chip ${todayOnly ? 'is-on' : ''}`} aria-pressed={todayOnly} onClick={() => setTodayOnly(!todayOnly)}>
          {t('availLabel.today')}
        </button>
      </div>

      {workers.length === 0 ? (
        <EmptyState icon={Users} title={t('find.empty')} />
      ) : (
        <ul className="worker-list">
          {workers.map((w) => (
            <li key={w.id} className="worker-row">
              <Avatar profile={w} />
              <div className="worker-row__info">
                <p className="worker-row__name">
                  {w.name} {w.isYou && <span className="tag tag--ink">{t('find.you')}</span>}
                </p>
                <p className="muted small">
                  {w.trades.map((tr) => t(`trade.${tr}`)).join(', ')} · {t(`exp.${w.experience}`)}
                </p>
                <p className="small">
                  {localityName(w.area, lang)} ·{' '}
                  {distanceKm(area, w.area) < 1 ? t('find.nearby') : t('job.distance', { n: distanceKm(area, w.area).toFixed(1) })} ·{' '}
                  <span className={`avail-text avail-text--${w.availability}`}>{t(`availLabel.${w.availability}`)}</span>
                </p>
              </div>
              <Button variant="secondary" onClick={() => setViewing(w)}>
                {t('find.viewCard')}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!viewing} onClose={() => setViewing(null)} title={t('card.title')}>
        {viewing && (
          <div className="stack">
            <KaamCard profile={viewing} />
            <p className="muted small">{t('find.contactNote')}</p>
          </div>
        )}
      </Sheet>
    </section>
  );
}
