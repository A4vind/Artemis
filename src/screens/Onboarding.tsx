import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { KaamCard } from '../components/KaamCard';
import { Button, ButtonLink, ChoiceGroup, Logo, MultiChoiceGroup, TextField, TradeIcon, focusFirstError } from '../components/ui';
import { LOCALITIES, type LocalityId } from '../data/localities';
import { TRADES, type TradeId } from '../data/trades';
import type { Availability, Experience, Lang, WorkerProfile } from '../data/workers';
import { LANG_OPTIONS, useT } from '../i18n';
import { useStore } from '../state/store';

export const EXPERIENCES: Experience[] = ['new', '1to3', '3to10', '10plus'];
export const TRAVEL_OPTIONS = [3, 5, 10, 15];
export const AVAILABILITIES: Availability[] = ['today', 'this_week', 'not_now'];
export const isValidPhone = (p: string) => /^[6-9]\d{9}$/.test(p.replace(/\s/g, ''));

const TOTAL = 5;

export function Onboarding() {
  const { t, lang } = useT();
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = params.get('next') ?? '/work';

  const [step, setStep] = useState(1);
  const [done, setDone] = useState<WorkerProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [trades, setTrades] = useState<TradeId[]>([]);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [area, setArea] = useState<LocalityId | null>(null);
  const [travelKm, setTravelKm] = useState(10);
  const [availability, setAvailability] = useState<Availability>('today');
  const [languages, setLanguages] = useState<Lang[]>([lang]);
  const [phone, setPhone] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo(0, 0);
  }, [step, done]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 1 && !name.trim()) e.name = t('onb.name.err');
    if (step === 2 && trades.length === 0) e.trades = t('onb.trades.err');
    if (step === 3 && !experience) e.experience = t('onb.exp.q');
    if (step === 4 && !area) e.area = t('onb.area.q');
    if (step === 5) {
      if (languages.length === 0) e.languages = t('onb.lang.err');
      if (phone.trim() && !isValidPhone(phone)) e.phone = t('onb.phone.err');
    }
    setErrors(e);
    if (Object.keys(e).length) focusFirstError();
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < TOTAL) return setStep(step + 1);
    const profile: WorkerProfile = {
      name: name.trim(),
      trades,
      experience: experience!,
      area: area!,
      travelKm,
      availability,
      languages,
      phone: phone.replace(/\s/g, '') || undefined,
      workExamples: [],
      prefersLongTerm: false,
    };
    dispatch({ type: 'saveProfile', profile });
    setDone(profile);
  };

  const back = () => {
    setErrors({});
    if (step === 1) navigate('/');
    else setStep(step - 1);
  };

  if (done) {
    return (
      <div className="onb">
        <main className="onb__inner onb__done" id="main">
          <h1 className="h1" tabIndex={-1} ref={headingRef}>
            {t('onb.done.title', { name: done.name })}
          </h1>
          <p className="lead">{t('onb.done.body')}</p>
          <KaamCard profile={done} compact />
          <ButtonLink to={returnTo} size="lg" block iconEnd={ArrowRight}>
            {t('onb.done.cta')}
          </ButtonLink>
        </main>
      </div>
    );
  }

  const questions: Record<number, string> = {
    1: t('onb.name.q'),
    2: t('onb.trades.q'),
    3: t('onb.exp.q'),
    4: t('onb.area.q'),
    5: t('onb.avail.q'),
  };

  return (
    <div className="onb">
      <header className="onb__top">
        <Link to="/" aria-label={t('app.name')}>
          <Logo compact />
        </Link>
        <div className="progress" aria-hidden>
          <span style={{ width: `${(step / TOTAL) * 100}%` }} />
        </div>
        <span className="onb__count">{t('onb.step', { n: step, total: TOTAL })}</span>
      </header>

      <main className="onb__inner" id="main">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          noValidate
        >
          <h1 className="h1 onb__q" tabIndex={-1} ref={headingRef}>
            <span className="sr-only">{t('onb.step', { n: step, total: TOTAL })}. </span>
            {questions[step]}
          </h1>

          {step === 1 && (
            <TextField
              label={t('onb.name.label')}
              hint={t('onb.name.hint')}
              value={name}
              onChange={setName}
              error={errors.name}
              autoComplete="given-name"
              maxLength={40}
              autoFocus
            />
          )}

          {step === 2 && (
            <MultiChoiceGroup
              legend={t('onb.trades.q')}
              legendHidden
              hint={t('onb.trades.hint')}
              values={trades}
              onChange={setTrades}
              error={errors.trades}
              layout="grid"
              options={TRADES.map((tr) => ({
                value: tr.id,
                label: t(`trade.${tr.id}`),
                icon: <TradeIcon trade={tr.id} />,
              }))}
            />
          )}

          {step === 3 && (
            <ChoiceGroup
              legend={t('onb.exp.q')}
              legendHidden
              value={experience}
              onChange={setExperience}
              error={errors.experience}
              options={EXPERIENCES.map((e) => ({ value: e, label: t(`exp.${e}`) }))}
            />
          )}

          {step === 4 && (
            <div className="stack">
              <ChoiceGroup
                legend={t('onb.area.q')}
                legendHidden
                hint={t('onb.area.hint')}
                value={area}
                onChange={setArea}
                error={errors.area}
                layout="chips"
                options={LOCALITIES.map((l) => ({ value: l.id, label: l.name[lang] }))}
              />
              <ChoiceGroup
                legend={t('onb.travel.q')}
                value={String(travelKm)}
                onChange={(v) => setTravelKm(Number(v))}
                layout="chips"
                options={TRAVEL_OPTIONS.map((n) => ({ value: String(n), label: t('onb.travel.opt', { n }) }))}
              />
            </div>
          )}

          {step === 5 && (
            <div className="stack">
              <ChoiceGroup
                legend={t('onb.avail.q')}
                legendHidden
                value={availability}
                onChange={setAvailability}
                layout="row"
                options={AVAILABILITIES.map((a) => ({ value: a, label: t(`avail.${a}`) }))}
              />
              <MultiChoiceGroup
                legend={t('onb.lang.q')}
                values={languages}
                onChange={setLanguages}
                error={errors.languages}
                layout="row"
                options={LANG_OPTIONS.map((o) => ({ value: o.id, label: o.native }))}
              />
              <TextField
                label={t('onb.phone.label')}
                hint={t('onb.phone.hint')}
                optional
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={11}
                value={phone}
                onChange={setPhone}
                error={errors.phone}
              />
            </div>
          )}

          <div className="onb__nav">
            <Button variant="ghost" icon={ChevronLeft} onClick={back}>
              {t('common.back')}
            </Button>
            <Button type="submit" size="lg" iconEnd={step === TOTAL ? undefined : ArrowRight}>
              {step === TOTAL ? t('onb.finish') : t('common.next')}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
