import { LOCALE, type TKey, type Vars } from '../i18n';
import type { Job } from '../data/jobs';
import { distanceKm, localityById, type LocalityId } from '../data/localities';
import type { Lang } from '../data/workers';

type T = (key: TKey, vars?: Vars) => string;

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function localityName(id: LocalityId, lang: Lang) {
  return localityById(id).name[lang];
}

/** Short pay text for cards, split so the amount can be emphasised. */
export function payParts(t: T, job: Job): { amount: string | null; per: string } {
  const { amount, period } = job.pay;
  if (!amount) return { amount: null, per: t('job.payMissing') };
  return { amount: rupees(amount), per: period ? t(`job.per.${period}`) : t('job.perMissing') };
}

/** Full sentence form, e.g. "₹750 per day". */
export function payLong(t: T, job: Job): string {
  const { amount, period } = job.pay;
  if (!amount) return t('job.payMissing');
  return `${rupees(amount)} ${period ? t(`job.perLong.${period}`) : `(${t('job.perMissing')})`}`;
}

/**
 * When work starts. `startDay` counts from `from` (default: now), so offers made
 * yesterday still show the right day. `absolute` always prints the date.
 */
export function startLabel(t: T, lang: Lang, startDay: number, from?: number, absolute = false): string {
  const d = new Date(from ?? Date.now());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + startDay);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  const date = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  if (absolute) return date;
  if (diff === 0) return t('job.today');
  if (diff === 1) return t('job.tomorrow');
  return date;
}

export function timeLabel(lang: Lang, hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return new Intl.DateTimeFormat(LOCALE[lang], { hour: 'numeric', minute: '2-digit' }).format(d);
}

export function dateLabel(lang: Lang, ts: number): string {
  return new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'short' }).format(ts);
}

export function durationLabel(t: T, job: Job): string {
  const { unit, count, ongoing } = job.duration;
  const base = t(`dur.${unit}.${count === 1 ? 'one' : 'other'}`, { n: count });
  return ongoing ? t('dur.ongoing', { d: base }) : base;
}

export function hoursLabel(t: T, lang: Lang, job: Job): string | null {
  if (!job.hoursPerDay) return null;
  const hours = t('job.hoursLong', { n: job.hoursPerDay });
  return job.startTime ? `${hours}, ${t('job.from', { time: timeLabel(lang, job.startTime) })}` : hours;
}

export function postedLabel(t: T, hours: number): string {
  if (hours < 1) return t('job.postedNow');
  if (hours < 24) return t('job.postedHours', { n: hours });
  return t('job.postedDays', { n: Math.floor(hours / 24) });
}

export function jobDistance(job: Job, from: LocalityId): number {
  return distanceKm(from, job.locality);
}

export function distanceLabel(t: T, km: number): string {
  if (km < 1) return t('job.distanceSame');
  return t('job.distance', { n: km < 10 ? km.toFixed(1) : Math.round(km) });
}

/** Working days for a duration, or null when it cannot be estimated honestly. */
function workingDays(job: Job): number | null {
  const { unit, count } = job.duration;
  if (unit === 'day') return count;
  if (unit === 'week') return count * 6;
  return null;
}

/**
 * Rough total earnings for the full work, shown with its calculation so the
 * worker can see exactly how it was worked out.
 */
export function earningsEstimate(t: T, job: Job): { total: string; calc: string } | null {
  const { amount, period } = job.pay;
  if (!amount || !period || period === 'job' || period === 'month') return null;
  const days = workingDays(job);
  if (!days) return null;
  const daysText = t(`dur.day.${days === 1 ? 'one' : 'other'}`, { n: days });
  const weekNote = job.duration.unit === 'week' ? ` (${t('detail.estimateWeeks')})` : '';
  if (period === 'day') {
    if (days === 1) return null;
    return { total: rupees(amount * days), calc: `${rupees(amount)} × ${daysText}${weekNote}` };
  }
  if (!job.hoursPerDay) return null;
  return {
    total: rupees(amount * job.hoursPerDay * days),
    calc: `${rupees(amount)} × ${t('job.hours', { n: job.hoursPerDay })} × ${daysText}${weekNote}`,
  };
}

export function perHourRate(job: Job): number | null {
  const { amount, period } = job.pay;
  if (!amount || !job.hoursPerDay) return null;
  if (period === 'day') return amount / job.hoursPerDay;
  if (period === 'job' && job.duration.unit === 'day') return amount / (job.hoursPerDay * job.duration.count);
  return null;
}
