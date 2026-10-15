import { CalendarDays, CircleCheck, Clock, Flag, MapPin, ShieldAlert, Square, TriangleAlert, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../data/jobs';
import type { LocalityId } from '../data/localities';
import { useT } from '../i18n';
import {
  distanceLabel,
  durationLabel,
  jobDistance,
  localityName,
  payParts,
  postedLabel,
  startLabel,
  timeLabel,
} from '../lib/format';
import { pakkaCheck, type CheckLevel, type PakkaCheck } from '../lib/pakkaCheck';
import { TradeIcon } from './ui';

const LEVEL_ICON = { complete: CircleCheck, missing: TriangleAlert, warning: ShieldAlert } as const;

export function CheckBadge({ check, level }: { check: PakkaCheck; level?: CheckLevel }) {
  const lv = level ?? check.level;
  const Icon = LEVEL_ICON[lv];
  return (
    <span className={`check-badge check-badge--${lv}`}>
      <Icon aria-hidden size={18} />
      <span>{check.summary}</span>
    </span>
  );
}

interface Props {
  job: Job;
  from: LocalityId;
  applied?: boolean;
  reported?: boolean;
  speaking?: boolean;
  onListen?: (text: string) => void;
  /** Disable the link (used for the employer preview). */
  preview?: boolean;
}

export function JobCard({ job, from, applied, reported, speaking, onListen, preview }: Props) {
  const { t, lt, lang } = useT();
  const check = pakkaCheck(job, t, lang);
  const pay = payParts(t, job);
  const km = jobDistance(job, from);
  const title = lt(job.title);
  const place = localityName(job.locality, lang);
  const when = startLabel(t, lang, job.startDay);
  const hours = job.hoursPerDay ? t('job.hours', { n: job.hoursPerDay }) : t('job.hoursMissing');
  const spoken = [
    title,
    pay.amount ? `${pay.amount} ${pay.per}` : pay.per,
    place,
    when,
    job.startTime ? timeLabel(lang, job.startTime) : '',
    hours,
    check.summary,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <article className={`job-card job-card--${check.level}`}>
      <div className="job-card__top">
        <TradeIcon trade={job.trade} />
        <div className="job-card__heading">
          <p className="job-card__meta">
            {t(`trade.${job.trade}`)} · {postedLabel(t, job.postedHoursAgo)}
          </p>
          <h3 className="job-card__title">
            {preview ? (
              <span>{title}</span>
            ) : (
              <Link to={`/work/${job.id}`} className="stretched-link" lang={job.title[lang] ? undefined : 'en'}>
                {title}
              </Link>
            )}
          </h3>
        </div>
        {onListen && (
          <button
            className={`icon-btn listen-btn ${speaking ? 'is-active' : ''}`}
            onClick={() => onListen(spoken)}
            aria-label={speaking ? t('common.stop') : t('job.listen')}
            aria-pressed={speaking}
          >
            {speaking ? <Square aria-hidden size={18} /> : <Volume2 aria-hidden />}
          </button>
        )}
      </div>

      <p className="job-card__pay">
        {pay.amount ? (
          <>
            <strong className="pay-amount">{pay.amount}</strong> <span className="pay-per">{pay.per}</span>
          </>
        ) : (
          <span className="pay-missing">
            <TriangleAlert aria-hidden size={18} /> {pay.per}
          </span>
        )}
        {job.pay.timing && <span className="pay-timing">{t(`timing.${job.pay.timing}`)}</span>}
      </p>

      <ul className="facts">
        <li>
          <MapPin aria-hidden size={18} />
          <span>{preview ? place : `${place} · ${distanceLabel(t, km)}`}</span>
        </li>
        <li>
          <Clock aria-hidden size={18} />
          <span>{job.startTime ? `${timeLabel(lang, job.startTime)} · ${hours}` : hours}</span>
        </li>
        <li>
          <CalendarDays aria-hidden size={18} />
          <span>
            {when} · {durationLabel(t, job)}
          </span>
        </li>
      </ul>

      <div className="job-card__foot">
        <CheckBadge check={check} />
        {applied && (
          <span className="tag tag--ok">
            <CircleCheck aria-hidden size={16} /> {t('job.applied')}
          </span>
        )}
        {reported && (
          <span className="tag tag--muted">
            <Flag aria-hidden size={16} /> {t('job.reported')}
          </span>
        )}
        {job.source === 'you' && <span className="tag tag--ink">{t('job.yours')}</span>}
      </div>
    </article>
  );
}
