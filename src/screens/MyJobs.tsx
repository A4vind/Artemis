import { Briefcase, Check, Flag } from 'lucide-react';
import { useState } from 'react';
import { CheckBadge } from '../components/JobCard';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, EmptyState, TradeIcon } from '../components/ui';
import { useT } from '../i18n';
import { dateLabel, localityName, payParts, startLabel } from '../lib/format';
import { pakkaCheck } from '../lib/pakkaCheck';
import { useStore, type Application } from '../state/store';

export function MyJobs() {
  const { t, lt, lang } = useT();
  const { state, dispatch, allJobs } = useStore();
  const toast = useToast();
  const [withdrawing, setWithdrawing] = useState<Application | null>(null);

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
        <ul className="app-list">
          {state.applications.map((a) => {
            const job = a.job;
            const pay = payParts(t, job);
            const check = pakkaCheck(job, t, lang);
            return (
              <li key={a.jobId} className="app-card">
                <div className="app-card__top">
                  <TradeIcon trade={job.trade} />
                  <div>
                    <h2 className="h3">{lt(job.title)}</h2>
                    <p className="muted">
                      {pay.amount ? `${pay.amount} ${pay.per}` : pay.per} · {localityName(job.locality, lang)} ·{' '}
                      {startLabel(t, lang, job.startDay)}
                    </p>
                  </div>
                </div>

                <ol className="timeline" aria-label={t('applied.waiting')}>
                  <li className="is-done">
                    <span className="timeline__dot" aria-hidden>
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <span>
                      {t('applied.step1')}
                      <small>{t('applied.on', { date: dateLabel(lang, a.at) })}</small>
                    </span>
                  </li>
                  <li className="is-current">
                    <span className="timeline__dot" aria-hidden />
                    <span>{t('applied.step2')}</span>
                  </li>
                  <li>
                    <span className="timeline__dot" aria-hidden />
                    <span>{t('applied.step3')}</span>
                  </li>
                </ol>
                <p className="small muted">{t('applied.waiting')}</p>

                <CheckBadge check={check} />

                <div className="btn-row">
                  <ButtonLink to={`/work/${job.id}`} variant="secondary">
                    {t('applied.view')}
                  </ButtonLink>
                  <Button variant="quiet" onClick={() => setWithdrawing(a)}>
                    {t('applied.withdraw')}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
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

      <Sheet
        open={!!withdrawing}
        onClose={() => setWithdrawing(null)}
        title={t('applied.withdraw')}
        tone="danger"
        footer={
          <div className="btn-row btn-row--stack">
            <Button
              variant="danger"
              block
              onClick={() => {
                dispatch({ type: 'withdraw', jobId: withdrawing!.jobId });
                setWithdrawing(null);
                toast(t('applied.withdrawn'), 'info');
              }}
            >
              {t('applied.withdraw')}
            </Button>
            <Button variant="ghost" block onClick={() => setWithdrawing(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        }
      >
        {withdrawing && <p className="lead">{t('applied.withdrawQ', { title: lt(withdrawing.job.title) })}</p>}
      </Sheet>
    </div>
  );
}
