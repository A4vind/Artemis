import {
  Briefcase,
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  CircleHelp,
  Clock,
  Flag,
  Gift,
  MapPin,
  Phone,
  SearchX,
  ShieldAlert,
  Square,
  TriangleAlert,
  Users,
  Volume2,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckBadge } from '../components/JobCard';
import { PakkaCheckPanel } from '../components/PakkaCheckPanel';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, ChoiceGroup, EmptyState, FieldError, TextField, TradeIcon } from '../components/ui';
import { useT } from '../i18n';
import { useSpeaker } from '../lib/device';
import {
  distanceLabel,
  durationLabel,
  earningsEstimate,
  hoursLabel,
  jobDistance,
  localityName,
  payLong,
  payParts,
  perHourRate,
  postedLabel,
  rupees,
  startLabel,
} from '../lib/format';
import { pakkaCheck } from '../lib/pakkaCheck';
import { useStore, type ReportReason } from '../state/store';

const REPORT_REASONS: ReportReason[] = ['fee', 'otp', 'fake', 'pay', 'unsafe', 'other'];

export function JobDetail() {
  const { id } = useParams();
  const { t, lt, lang } = useT();
  const { state, dispatch, allJobs } = useStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { speakingId, toggle } = useSpeaker();

  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDone, setApplyDone] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [reportErr, setReportErr] = useState('');

  // Fall back to the saved snapshot if the job was removed after the worker applied.
  const job = allJobs.find((j) => j.id === id) ?? state.applications.find((a) => a.jobId === id)?.job;

  if (!job) {
    return (
      <div className="page">
        <EmptyState
          icon={SearchX}
          title={t('detail.notFound.title')}
          body={t('detail.notFound.body')}
          action={<ButtonLink to="/work">{t('detail.back')}</ButtonLink>}
        />
      </div>
    );
  }

  const profile = state.profile;
  const from = profile?.area ?? 'shivajinagar';
  const check = pakkaCheck(job, t, lang);
  const pay = payParts(t, job);
  const estimate = earningsEstimate(t, job);
  const perHour = perHourRate(job);
  const hours = hoursLabel(t, lang, job);
  const isApplied = state.applications.some((a) => a.jobId === job.id);
  const isReported = state.reports.some((r) => r.jobId === job.id);
  const title = lt(job.title);

  const say = (key: string, text: string) => {
    const r = toggle(key, text, lang);
    if (r !== 'ok') toast(t(r === 'unsupported' ? 'speech.unsupported' : 'speech.noVoice'), 'error');
    return r;
  };

  const fullSpoken = [
    title,
    payLong(t, job),
    job.pay.timing ? t(`timing.${job.pay.timing}`) : t('check.timing.missing'),
    `${t('detail.where')}: ${job.landmark ? `${job.landmark}, ` : ''}${localityName(job.locality, lang)}`,
    `${t('detail.when')}: ${startLabel(t, lang, job.startDay)}`,
    hours ?? t('job.hoursMissing'),
    `${t('detail.duration')}: ${durationLabel(t, job)}`,
    check.summary,
    ...check.warnings.map((w) => `${w.text}. ${w.why}`),
  ].join('. ');

  const startApply = () => {
    setApplyDone(false);
    setApplyOpen(true);
  };

  const confirmApply = () => {
    dispatch({ type: 'apply', job });
    setApplyDone(true);
  };

  const submitReport = () => {
    if (!reason) {
      setReportErr(t('report.err'));
      return;
    }
    dispatch({ type: 'report', report: { jobId: job.id, reason, note: note.trim(), at: Date.now() } });
    setReportOpen(false);
    toast(t('report.done'), 'info');
  };

  const provided = job.provides.map((p) => t(`provide.${p}`)).join(', ');

  return (
    <div className="page page--detail">
      <Link to="/work" className="back-link" onClick={(e) => {
        if (window.history.state?.idx > 0) {
          e.preventDefault();
          navigate(-1);
        }
      }}>
        <ChevronLeft aria-hidden size={20} /> {t('detail.back')}
      </Link>

      <div className="detail">
        <div className="detail__main">
          <header className="detail-head">
            <TradeIcon trade={job.trade} size="lg" />
            <div>
              <p className="job-card__meta">
                {t(`trade.${job.trade}`)} · {postedLabel(t, job.postedHoursAgo)}
              </p>
              <h1 className="h1" lang={job.title[lang] ? undefined : 'en'}>
                {title}
              </h1>
              <CheckBadge check={check} />
            </div>
          </header>

          <section className={`pay-panel ${pay.amount ? '' : 'pay-panel--missing'}`} aria-labelledby="pay-h">
            <h2 id="pay-h" className="pay-panel__label">
              {t('detail.payTitle')}
            </h2>
            {pay.amount ? (
              <p className="pay-panel__amount">
                <strong>{pay.amount}</strong> <span>{job.pay.period ? t(`job.perLong.${job.pay.period}`) : t('job.perMissing')}</span>
              </p>
            ) : (
              <p className="pay-panel__amount pay-panel__amount--missing">
                <TriangleAlert aria-hidden /> {t('job.payMissing')}
              </p>
            )}
            <p className={`pay-panel__timing ${job.pay.timing ? '' : 'is-missing'}`}>
              {job.pay.timing ? <CircleCheck aria-hidden size={18} /> : <CircleHelp aria-hidden size={18} />}
              {job.pay.timing ? t(`timing.${job.pay.timing}`) : t('check.timing.missing')}
            </p>
            {estimate && (
              <div className="pay-panel__estimate">
                <p>
                  <strong>{t('detail.estimate', { amount: estimate.total })}</strong>
                </p>
                <p className="muted">{t('detail.estimateBasis', { calc: estimate.calc })}</p>
              </div>
            )}
            {perHour && <p className="muted">{t('detail.perHour', { amount: rupees(perHour) })}</p>}
          </section>

          <section aria-label={t('detail.about')}>
            <dl className="fact-grid">
              <Fact icon={MapPin} label={t('detail.where')}>
                {job.landmark && <span className="fact__strong">{job.landmark}</span>}
                <span>
                  {localityName(job.locality, lang)} · {distanceLabel(t, jobDistance(job, from))}
                </span>
              </Fact>
              <Fact icon={CalendarDays} label={t('detail.when')}>
                {startLabel(t, lang, job.startDay)}
              </Fact>
              <Fact icon={Clock} label={t('detail.hours')} missing={!hours}>
                {hours ?? t('job.hoursMissing')}
              </Fact>
              <Fact icon={Briefcase} label={t('detail.duration')}>
                {durationLabel(t, job)}
              </Fact>
              <Fact icon={Users} label={t('detail.workers')}>
                {job.workersNeeded === 1 ? t('job.workers1') : t('job.workers', { n: job.workersNeeded })}
              </Fact>
              <Fact icon={Gift} label={t('detail.provided')}>
                {provided || t('detail.nothingProvided')}
              </Fact>
            </dl>
          </section>

          {job.description && (
            <section className="detail-block">
              <h2 className="h3">{t('detail.about')}</h2>
              <p lang={job.description[lang] ? undefined : 'en'}>{lt(job.description)}</p>
            </section>
          )}

          <section className="detail-block employer">
            <h2 className="h3">{t('detail.employer')}</h2>
            <p className="employer__name">
              {job.employer.name} <span className="tag tag--muted">{t(`emp.${job.employer.type}`)}</span>
              {job.source === 'you' && <span className="tag tag--ink">{t('job.yours')}</span>}
            </p>
            <p className={`employer__phone ${job.employer.phone ? '' : 'is-missing'}`}>
              {job.employer.phone ? <Phone aria-hidden size={18} /> : <CircleHelp aria-hidden size={18} />}
              {job.employer.phone ? t('detail.phoneShared') : t('detail.phoneMissing')}
            </p>
            <p className="muted small">{t('detail.notChecked')}</p>
          </section>
        </div>

        <aside className="detail__side">
          <PakkaCheckPanel check={check} speaking={speakingId === 'questions'} onListen={(text) => say('questions', text)} />
          <div className="report-row">
            {isReported ? (
              <p className="tag tag--muted">
                <Flag aria-hidden size={16} /> {t('detail.reported')}
              </p>
            ) : (
              <Button variant="quiet" icon={Flag} onClick={() => setReportOpen(true)}>
                {t('detail.report')}
              </Button>
            )}
          </div>
        </aside>
      </div>

      <div className="action-bar">
        <Button
          variant="secondary"
          icon={speakingId === 'job' ? Square : Volume2}
          aria-pressed={speakingId === 'job'}
          onClick={() => say('job', fullSpoken)}
          className="action-bar__listen"
        >
          {speakingId === 'job' ? t('common.stop') : t('common.listen')}
        </Button>
        {isApplied ? (
          <ButtonLink to="/my-jobs" variant="ok" icon={CircleCheck} className="action-bar__main">
            {t('detail.viewApplication')}
          </ButtonLink>
        ) : (
          <Button className="action-bar__main" onClick={startApply} icon={check.level === 'warning' ? ShieldAlert : undefined}>
            {t('detail.apply')}
          </Button>
        )}
      </div>

      {/* Apply flow */}
      <Sheet
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={applyDone ? t('apply.doneTitle') : t('apply.title')}
        footer={
          !profile ? (
            <ButtonLink to={`/start?next=/work/${job.id}`} size="lg" block>
              {t('card.none.cta')}
            </ButtonLink>
          ) : applyDone ? (
            <div className="btn-row btn-row--stack">
              <ButtonLink to="/my-jobs" size="lg" block>
                {t('apply.seeApplied')}
              </ButtonLink>
              <ButtonLink to="/work" variant="ghost" block>
                {t('apply.findMore')}
              </ButtonLink>
            </div>
          ) : (
            <div className="btn-row btn-row--stack">
              <Button size="lg" block onClick={confirmApply}>
                {t('apply.confirm')}
              </Button>
              <Button variant="ghost" block onClick={() => setApplyOpen(false)}>
                {t('apply.cancel')}
              </Button>
            </div>
          )
        }
      >
        {!profile ? (
          <p className="lead">{t('apply.needProfile')}</p>
        ) : applyDone ? (
          <div className="apply-done">
            <span className="apply-done__icon" aria-hidden>
              <CircleCheck size={44} />
            </span>
            <p className="h3">{title}</p>
            <p>{t('apply.doneBody')}</p>
          </div>
        ) : (
          <div className="stack">
            {check.level === 'warning' && (
              <p className="callout callout--danger">
                <ShieldAlert aria-hidden /> {t('apply.warnNote')}
              </p>
            )}
            <div>
              <p className="field__label">{t('apply.recap')}</p>
              <ul className="recap">
                <li>
                  <span>{t('detail.payTitle')}</span>
                  <strong>{payLong(t, job)}</strong>
                </li>
                <li>
                  <span>{t('detail.when')}</span>
                  <strong>
                    {startLabel(t, lang, job.startDay)}
                    {hours ? `, ${hours}` : ''}
                  </strong>
                </li>
                <li>
                  <span>{t('detail.where')}</span>
                  <strong>
                    {job.landmark ? `${job.landmark}, ` : ''}
                    {localityName(job.locality, lang)}
                  </strong>
                </li>
                <li>
                  <span>{t('detail.duration')}</span>
                  <strong>{durationLabel(t, job)}</strong>
                </li>
              </ul>
            </div>
            {check.missingCount > 0 && check.level !== 'warning' && (
              <p className="callout callout--caution">
                <TriangleAlert aria-hidden /> {t('apply.missingNote')}
              </p>
            )}
            <p className="muted">{t('apply.share')}</p>
          </div>
        )}
      </Sheet>

      {/* Report flow */}
      <Sheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title={t('report.title')}
        tone="danger"
        footer={
          <Button variant="danger" size="lg" block icon={Flag} onClick={submitReport}>
            {t('report.submit')}
          </Button>
        }
      >
        <div className="stack">
          <ChoiceGroup
            legend={t('report.q')}
            value={reason}
            onChange={(r) => {
              setReason(r);
              setReportErr('');
            }}
            options={REPORT_REASONS.map((r) => ({ value: r, label: t(`report.reason.${r}`) }))}
          />
          {reportErr && <FieldError>{reportErr}</FieldError>}
          <TextField label={t('report.note')} optional multiline value={note} onChange={setNote} maxLength={300} />
          <p className="muted small">{t('report.privacy')}</p>
        </div>
      </Sheet>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  missing,
  children,
}: {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  label: string;
  missing?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`fact ${missing ? 'is-missing' : ''}`}>
      <dt>
        <Icon aria-hidden size={18} /> {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
