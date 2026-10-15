import {
  BookOpen,
  Briefcase,
  Check,
  CircleCheck,
  CircleX,
  FileText,
  Flag,
  Handshake,
  Mail,
  TriangleAlert,
  Wand2,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { OfferChangeNote, PakkaParchi, TermsList } from '../components/Hiring';
import { CheckBadge } from '../components/JobCard';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, ChoiceGroup, DemoTag, EmptyState, TextField, TradeIcon, focusFirstError } from '../components/ui';
import { useT } from '../i18n';
import { dateLabel, localityName, payParts, rupees, startLabel } from '../lib/format';
import { offerChanges, promisedTotal, termsFromJob, todayISO, workingDays } from '../lib/hiring';
import { pakkaCheck } from '../lib/pakkaCheck';
import { useStore, type AppStatus, type Application, type PaymentStatus } from '../state/store';

const GROUPS: { key: string; statuses: AppStatus[] }[] = [
  { key: 'offers', statuses: ['offered'] },
  { key: 'fixed', statuses: ['accepted'] },
  { key: 'waiting', statuses: ['applied'] },
  { key: 'closed', statuses: ['done', 'not_selected', 'worker_declined'] },
];

export function MyJobs() {
  const { t, lt, lang } = useT();
  const { state, allJobs } = useStore();

  const [withdrawing, setWithdrawing] = useState<Application | null>(null);
  const [parchi, setParchi] = useState<Application | null>(null);
  const [paying, setPaying] = useState<Application | null>(null);

  const reportedJobs = state.reports
    .map((r) => ({ report: r, job: allJobs.find((j) => j.id === r.jobId) }))
    .filter((x) => x.job);

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="h1">{t('applied.title')}</h1>
        <p className="lead">{t('applied.sub')}</p>
      </header>

      {state.applications.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={t('applied.empty.title')}
          body={t('applied.empty.body')}
          action={<ButtonLink to="/work">{t('applied.find')}</ButtonLink>}
        />
      ) : (
        GROUPS.map((g) => {
          const apps = state.applications.filter((a) => g.statuses.includes(a.status));
          if (!apps.length) return null;
          return (
            <section key={g.key} className="section" aria-labelledby={`grp-${g.key}`}>
              <h2 className="list-group" id={`grp-${g.key}`}>
                {t(`applied.group.${g.key}` as 'applied.group.offers')} · {apps.length}
              </h2>
              <ul className="app-list">
                {apps.map((a) => (
                  <li key={a.jobId}>
                    <AppCard app={a} onWithdraw={setWithdrawing} onParchi={setParchi} onPay={setPaying} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}

      {reportedJobs.length > 0 && (
        <section className="section">
          <h2 className="h2">{t('applied.reportsTitle')}</h2>
          <ul className="simple-list">
            {reportedJobs.map(({ report, job }) => (
              <li key={report.jobId}>
                <Flag aria-hidden size={18} />
                <span>
                  <strong>{lt(job!.title)}</strong>
                  <small>
                    {t(`report.reason.${report.reason}`)} · {dateLabel(lang, report.at)}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <WithdrawSheet app={withdrawing} onClose={() => setWithdrawing(null)} />
      <Sheet open={!!parchi} onClose={() => setParchi(null)} title={t('parchi.title')}>
        {parchi && <PakkaParchi app={parchi} />}
      </Sheet>
      <PaymentSheet app={paying} onClose={() => setPaying(null)} />
    </div>
  );
}

/* ---------- One job in the worker's list ---------- */

function AppCard({
  app,
  onWithdraw,
  onParchi,
  onPay,
}: {
  app: Application;
  onWithdraw: (a: Application) => void;
  onParchi: (a: Application) => void;
  onPay: (a: Application) => void;
}) {
  const { t, lt, lang } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  const job = app.job;
  const terms = app.offer;
  const pay = payParts(t, job);
  const check = pakkaCheck(job, t, lang);
  const changes = terms ? offerChanges(job, terms, t, lang) : [];

  // Timeline position: 0 applied/invited · 1 offer · 2 work fixed · 3 paid
  const stepIndex = { applied: 1, offered: 1, accepted: 3, done: 4, not_selected: 1, worker_declined: 2 }[app.status];
  const steps = [app.via === 'invited' ? t('applied.stepInvited') : t('applied.step1'), t('applied.stepOffer'), t('applied.step3'), t('applied.stepPaid')];
  const closedEarly = app.status === 'not_selected' || app.status === 'worker_declined';
  const unpaid = app.status === 'done' && app.payment?.status !== 'yes';
  // The step where things stopped (declined, not selected, or not fully paid), if any.
  const stopAt = closedEarly ? stepIndex : unpaid ? 3 : -1;

  const simulateOffer = () => {
    dispatch({ type: 'sendOffer', jobId: job.id, offer: { ...termsFromJob(job, lang), amount: job.pay.amount ?? 700, at: Date.now(), simulated: true } });
    toast(t('offer.simulated'), 'info');
  };

  const accept = () => {
    dispatch({ type: 'respondOffer', jobId: job.id, accept: true });
    toast(t('offer.acceptedToast'));
    onParchi({ ...app, status: 'accepted', acceptedAt: Date.now() });
  };

  return (
    <article className={`app-card app-card--${app.status}`}>
      <div className="app-card__top">
        <TradeIcon trade={job.trade} />
        <div>
          <h3 className="h3">{lt(job.title)}</h3>
          <p className="muted">
            {job.employer.name} · {localityName(job.locality, lang)} · {terms ? startLabel(t, lang, terms.startDay, terms.at) : startLabel(t, lang, job.startDay, app.at)}
          </p>
          {!terms && <p className="muted small">{pay.amount ? `${pay.amount} ${pay.per}` : pay.per}</p>}
        </div>
      </div>

      <ol className="timeline" aria-label={t('applied.progress')}>
        {steps.map((s, i) => {
          const stopped = i === stopAt;
          const done = i < stepIndex && !stopped;
          const current = i === stepIndex && stopAt < 0;
          return (
            <li key={s} className={done ? 'is-done' : stopped ? 'is-stopped' : current ? 'is-current' : ''}>
              <span className="timeline__dot" aria-hidden>
                {done ? <Check size={14} strokeWidth={3} /> : stopped ? <CircleX size={14} /> : null}
              </span>
              <span>
                {s}
                {i === 0 && <small>{dateLabel(lang, app.at)}</small>}
              </span>
            </li>
          );
        })}
      </ol>

      {app.status === 'applied' && (
        <>
          <p className="small muted">{t('applied.waiting')}</p>
          <CheckBadge check={check} />
          <div className="btn-row">
            <ButtonLink to={`/work/${job.id}`} variant="secondary">
              {t('applied.view')}
            </ButtonLink>
            <Button variant="quiet" onClick={() => onWithdraw(app)}>
              {t('applied.withdraw')}
            </Button>
          </div>
          {job.source === 'demo' && (
            <div className="demo-action">
              <DemoTag>{t('offer.simulateNote')}</DemoTag>
              <Button variant="ghost" icon={Wand2} onClick={simulateOffer}>
                {t('offer.simulate')}
              </Button>
            </div>
          )}
          {job.source === 'you' && <p className="small muted">{t('offer.yourPostNote')}</p>}
        </>
      )}

      {app.status === 'offered' && terms && (
        <div className="offer-box">
          <p className="offer-box__title">
            <Mail aria-hidden size={20} />
            {app.via === 'invited' ? t('offer.invitedTitle', { employer: job.employer.name }) : t('offer.title', { employer: job.employer.name })}
          </p>
          {terms.simulated && <DemoTag>{t('offer.simulatedTag')}</DemoTag>}
          <OfferChangeNote changes={changes} />
          <TermsList terms={terms} changes={changes} />
          <p className="small muted">{t('offer.acceptNote')}</p>
          <div className="btn-row">
            <Button icon={Handshake} onClick={accept}>
              {t('offer.accept')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                dispatch({ type: 'respondOffer', jobId: job.id, accept: false });
                toast(t('offer.declinedToast'), 'info');
              }}
            >
              {t('offer.decline')}
            </Button>
          </div>
        </div>
      )}

      {app.status === 'accepted' && terms && (
        <>
          <p className="callout callout--ok">
            <CircleCheck aria-hidden /> {t('fixed.title')}
          </p>
          <TermsList terms={terms} />
          {app.employerDone && <p className="small muted">{t('fixed.employerDone')}</p>}
          <div className="btn-row">
            <Button icon={FileText} variant="secondary" onClick={() => onParchi(app)}>
              {t('parchi.open')}
            </Button>
            <Button icon={CircleCheck} onClick={() => onPay(app)}>
              {t('pay.record')}
            </Button>
          </div>
        </>
      )}

      {app.status === 'done' && app.payment && <PaymentResult app={app} onParchi={onParchi} />}

      {closedEarly && (
        <>
          <p className="small muted">{app.status === 'not_selected' ? t('closed.notSelected') : t('closed.youDeclined')}</p>
          <Button variant="quiet" onClick={() => dispatch({ type: 'withdraw', jobId: job.id })}>
            {t('closed.remove')}
          </Button>
        </>
      )}
    </article>
  );
}

function PaymentResult({ app, onParchi }: { app: Application; onParchi: (a: Application) => void }) {
  const { t } = useT();
  const p = app.payment!;
  const promised = promisedTotal(app.job, app.offer!);
  return (
    <>
      {p.status === 'yes' ? (
        <p className="callout callout--ok">
          <CircleCheck aria-hidden /> {t('pay.resultYes', { amount: rupees(p.received) })}
        </p>
      ) : (
        <div className={`callout ${p.status === 'no' ? 'callout--danger' : 'callout--caution'}`}>
          <TriangleAlert aria-hidden />
          <div>
            <p>
              {p.status === 'no'
                ? t('pay.resultNo', { amount: rupees(promised) })
                : t('pay.resultPartly', { got: rupees(p.received), due: rupees(Math.max(promised - p.received, 0)) })}
            </p>
            <p className="small">{t('pay.helpIntro')}</p>
            <ol className="help-steps">
              <li>{t('pay.help1')}</li>
              <li>
                <Link to="/help?cat=complaint">{t('pay.help2')}</Link>
              </li>
              <li>
                <Link to={`/work/${app.jobId}`}>{t('pay.help3')}</Link>
              </li>
            </ol>
          </div>
        </div>
      )}
      <div className="btn-row">
        <Button icon={FileText} variant="secondary" onClick={() => onParchi(app)}>
          {t('parchi.open')}
        </Button>
        <ButtonLink to="/diary" variant="quiet" icon={BookOpen}>
          {t('pay.inDiary')}
        </ButtonLink>
      </div>
    </>
  );
}

/* ---------- Sheets ---------- */

function WithdrawSheet({ app, onClose }: { app: Application | null; onClose: () => void }) {
  const { t, lt } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  return (
    <Sheet
      open={!!app}
      onClose={onClose}
      title={t('applied.withdraw')}
      tone="danger"
      footer={
        <div className="btn-row btn-row--stack">
          <Button
            variant="danger"
            block
            onClick={() => {
              dispatch({ type: 'withdraw', jobId: app!.jobId });
              onClose();
              toast(t('applied.withdrawn'), 'info');
            }}
          >
            {t('applied.withdraw')}
          </Button>
          <Button variant="ghost" block onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      }
    >
      {app && <p className="lead">{t('applied.withdrawQ', { title: lt(app.job.title) })}</p>}
    </Sheet>
  );
}

function PaymentSheet({ app, onClose }: { app: Application | null; onClose: () => void }) {
  const { t } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [got, setGot] = useState('');
  const [err, setErr] = useState('');

  const promised = app?.offer ? promisedTotal(app.job, app.offer) : 0;

  const save = () => {
    if (!app || !status) return setErr(t('pay.err.choose'));
    const received = status === 'yes' ? promised : status === 'no' ? 0 : Number(got);
    if (status === 'partly' && !(received > 0 && received < promised)) {
      setErr(t('pay.err.amount', { max: rupees(promised) }));
      return focusFirstError();
    }
    dispatch({
      type: 'recordPayment',
      jobId: app.jobId,
      status,
      received,
      entry: {
        id: `d-${Date.now()}`,
        date: todayISO(),
        days: workingDays(app.job),
        trade: app.job.trade,
        employer: app.job.employer.name,
        promised,
        received,
        source: 'job',
        jobId: app.jobId,
      },
    });
    toast(t('pay.saved'));
    setStatus(null);
    setGot('');
    setErr('');
    onClose();
  };

  return (
    <Sheet
      open={!!app}
      onClose={onClose}
      title={t('pay.title')}
      footer={
        <Button block size="lg" onClick={save}>
          {t('pay.save')}
        </Button>
      }
    >
      {app && (
        <div className="stack">
          <p className="lead">{t('pay.agreed', { amount: rupees(promised) })}</p>
          <ChoiceGroup
            legend={t('pay.q')}
            value={status}
            onChange={(v) => {
              setStatus(v);
              setErr('');
            }}
            error={status ? undefined : err || undefined}
            options={[
              { value: 'yes', label: t('pay.yes') },
              { value: 'partly', label: t('pay.partly') },
              { value: 'no', label: t('pay.no') },
            ]}
          />
          {status === 'partly' && (
            <TextField label={t('pay.howMuch')} type="number" inputMode="numeric" min={1} value={got} onChange={setGot} error={err || undefined} />
          )}
          <p className="muted small">{t('pay.privacy')}</p>
        </div>
      )}
    </Sheet>
  );
}
