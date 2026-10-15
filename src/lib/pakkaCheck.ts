import type { TKey, Vars } from '../i18n';
import type { Job, RedFlag } from '../data/jobs';
import { tradeById } from '../data/trades';
import type { Lang } from '../data/workers';
import { hoursLabel, localityName, payLong, rupees } from './format';

type T = (key: TKey, vars?: Vars) => string;

export type CheckStatus = 'ok' | 'missing';
export type CheckLevel = 'complete' | 'missing' | 'warning';

export interface CheckItem {
  id: 'pay' | 'timing' | 'hours' | 'place' | 'contact' | 'safety';
  status: CheckStatus;
  text: string;
  /** Question to ask the employer when this detail is missing. */
  ask?: string;
}

export interface CheckWarning {
  id: RedFlag;
  text: string;
  why: string;
  short: string;
}

export interface PakkaCheck {
  level: CheckLevel;
  items: CheckItem[];
  warnings: CheckWarning[];
  questions: string[];
  okCount: number;
  total: number;
  missingCount: number;
  /** One-line summary for cards and screen readers. */
  summary: string;
}

/**
 * Pakka Check — reads a job listing and reports, without guessing:
 *  - which key conditions the employer has stated,
 *  - which are missing (and what to ask about them),
 *  - which known scam patterns the listing itself contains.
 * It never claims a job or employer is safe or verified.
 */
export function pakkaCheck(job: Job, t: T, lang: Lang): PakkaCheck {
  const items: CheckItem[] = [];
  const { amount, period, timing } = job.pay;

  if (!amount) items.push({ id: 'pay', status: 'missing', text: t('check.pay.missing'), ask: t('ask.pay') });
  else if (!period) items.push({ id: 'pay', status: 'missing', text: t('check.payPeriod.missing'), ask: t('ask.payPeriod') });
  else items.push({ id: 'pay', status: 'ok', text: t('check.pay.ok', { pay: payLong(t, job) }) });

  items.push(
    timing
      ? { id: 'timing', status: 'ok', text: t(`timing.${timing}`) }
      : { id: 'timing', status: 'missing', text: t('check.timing.missing'), ask: t('ask.timing') },
  );

  const hours = hoursLabel(t, lang, job);
  items.push(
    hours && job.startTime
      ? { id: 'hours', status: 'ok', text: t('check.hours.ok', { hours }) }
      : { id: 'hours', status: 'missing', text: t('check.hours.missing'), ask: t('ask.hours') },
  );

  items.push(
    job.landmark
      ? { id: 'place', status: 'ok', text: t('check.place.ok', { place: `${job.landmark}, ${localityName(job.locality, lang)}` }) }
      : { id: 'place', status: 'missing', text: t('check.place.missing'), ask: t('ask.place') },
  );

  items.push(
    job.employer.phone
      ? { id: 'contact', status: 'ok', text: t('check.contact.ok') }
      : { id: 'contact', status: 'missing', text: t('check.contact.missing'), ask: t('ask.contact') },
  );

  if (tradeById(job.trade).needsSafetyGear) {
    const mentioned = job.safetyGearMentioned || job.provides.includes('safety_gear');
    items.push(
      mentioned
        ? { id: 'safety', status: 'ok', text: t('check.safety.ok') }
        : { id: 'safety', status: 'missing', text: t('check.safety.missing'), ask: t('ask.safety') },
    );
  }

  const warnings: CheckWarning[] = job.redFlags.map((id) => ({
    id,
    text: t(`warn.${id}`, { amount: job.feeAmount ? rupees(job.feeAmount) : '₹' }),
    why: t(`warn.${id}.why`),
    short: t(`warn.short.${id}`),
  }));

  const okCount = items.filter((i) => i.status === 'ok').length;
  const missingCount = items.length - okCount;
  const level: CheckLevel = warnings.length ? 'warning' : missingCount ? 'missing' : 'complete';

  const summary =
    level === 'warning'
      ? `${t('check.level.warning')}: ${warnings.map((w) => w.short).join(', ')}`
      : level === 'missing'
        ? missingCount === 1
          ? t('check.level.missing1')
          : t('check.level.missing', { n: missingCount })
        : t('check.level.complete');

  return {
    level,
    items,
    warnings,
    questions: items.flatMap((i) => (i.ask ? [i.ask] : [])),
    okCount,
    total: items.length,
    missingCount,
    summary,
  };
}
