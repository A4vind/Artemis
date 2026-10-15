import type { TKey, Vars } from '../i18n';
import type { Job, PayPeriod } from '../data/jobs';
import { distanceKm } from '../data/localities';
import { DEMO_WORKERS, type WorkerProfile } from '../data/workers';
import type { OfferTerms } from '../state/store';
import { localityName, rupees, startLabel, timeLabel } from './format';
import type { Lang } from '../data/workers';

type T = (key: TKey, vars?: Vars) => string;

/** Offer terms pre-filled from the job post. Gaps get neutral defaults the employer must review. */
export function termsFromJob(job: Job, lang: Lang): OfferTerms {
  return {
    amount: job.pay.amount ?? 0,
    period: job.pay.period ?? 'day',
    timing: job.pay.timing ?? 'same_day',
    startDay: job.startDay,
    startTime: job.startTime ?? '09:00',
    hoursPerDay: job.hoursPerDay ?? 8,
    place: job.landmark ?? localityName(job.locality, lang),
  };
}

export function payText(t: T, amount: number, period: PayPeriod) {
  return `${rupees(amount)} ${t(`job.perLong.${period}`)}`;
}

export interface TermLine {
  id: 'pay' | 'timing' | 'start' | 'hours' | 'place';
  label: string;
  value: string;
}

export function termLines(terms: OfferTerms & { at?: number }, t: T, lang: Lang, absolute = false): TermLine[] {
  return [
    { id: 'pay', label: t('detail.payTitle'), value: payText(t, terms.amount, terms.period) },
    { id: 'timing', label: t('offer.whenPaid'), value: t(`timing.${terms.timing}`) },
    { id: 'start', label: t('detail.when'), value: `${startLabel(t, lang, terms.startDay, terms.at, absolute)}, ${timeLabel(lang, terms.startTime)}` },
    { id: 'hours', label: t('detail.hours'), value: t('job.hoursLong', { n: terms.hoursPerDay }) },
    { id: 'place', label: t('detail.where'), value: terms.place },
  ];
}

export interface TermChange {
  id: TermLine['id'];
  label: string;
  from: string;
  to: string;
  /** True when the job post did not state this at all (the offer fills a gap). */
  wasMissing: boolean;
  /** True when the change is worse for the worker (less pay, later payment, longer day). */
  worse: boolean;
}

const TIMING_RANK = { same_day: 0, weekly: 1, on_completion: 2, monthly: 3 } as const;

/**
 * Compares an offer with what the job post said, so the worker sees any change
 * before accepting. Only compares like with like; it never guesses.
 */
export function offerChanges(job: Job, offer: OfferTerms, t: T, lang: Lang): TermChange[] {
  const out: TermChange[] = [];
  const posted = job.pay;
  if (!posted.amount || !posted.period) {
    out.push({ id: 'pay', label: t('detail.payTitle'), from: t('job.payMissing'), to: payText(t, offer.amount, offer.period), wasMissing: true, worse: false });
  } else if (posted.amount !== offer.amount || posted.period !== offer.period) {
    out.push({
      id: 'pay',
      label: t('detail.payTitle'),
      from: payText(t, posted.amount, posted.period),
      to: payText(t, offer.amount, offer.period),
      wasMissing: false,
      worse: posted.period === offer.period ? offer.amount < posted.amount : true,
    });
  }
  if (!posted.timing) {
    out.push({ id: 'timing', label: t('offer.whenPaid'), from: t('check.timing.missing'), to: t(`timing.${offer.timing}`), wasMissing: true, worse: false });
  } else if (posted.timing !== offer.timing) {
    out.push({
      id: 'timing',
      label: t('offer.whenPaid'),
      from: t(`timing.${posted.timing}`),
      to: t(`timing.${offer.timing}`),
      wasMissing: false,
      worse: TIMING_RANK[offer.timing] > TIMING_RANK[posted.timing],
    });
  }
  if (job.startDay !== offer.startDay || (job.startTime && job.startTime !== offer.startTime)) {
    out.push({
      id: 'start',
      label: t('detail.when'),
      from: `${startLabel(t, lang, job.startDay)}${job.startTime ? `, ${timeLabel(lang, job.startTime)}` : ''}`,
      to: `${startLabel(t, lang, offer.startDay)}, ${timeLabel(lang, offer.startTime)}`,
      wasMissing: false,
      worse: false,
    });
  }
  if (!job.hoursPerDay) {
    out.push({ id: 'hours', label: t('detail.hours'), from: t('job.hoursMissing'), to: t('job.hoursLong', { n: offer.hoursPerDay }), wasMissing: true, worse: false });
  } else if (job.hoursPerDay !== offer.hoursPerDay) {
    out.push({
      id: 'hours',
      label: t('detail.hours'),
      from: t('job.hoursLong', { n: job.hoursPerDay }),
      to: t('job.hoursLong', { n: offer.hoursPerDay }),
      wasMissing: false,
      worse: offer.hoursPerDay > job.hoursPerDay,
    });
  }
  if (!job.landmark) {
    out.push({ id: 'place', label: t('detail.where'), from: t('check.place.missing'), to: offer.place, wasMissing: true, worse: false });
  } else if (job.landmark !== offer.place) {
    out.push({ id: 'place', label: t('detail.where'), from: job.landmark, to: offer.place, wasMissing: false, worse: false });
  }
  return out;
}

/** Working days covered by a job, used for diary entries and pay totals. */
export function workingDays(job: Job): number {
  const { unit, count } = job.duration;
  return unit === 'day' ? count : unit === 'week' ? count * 6 : count * 26;
}

/** Total pay promised for the whole job under the agreed terms. */
export function promisedTotal(job: Job, terms: OfferTerms): number {
  const days = workingDays(job);
  switch (terms.period) {
    case 'day':
      return terms.amount * days;
    case 'hour':
      return terms.amount * terms.hoursPerDay * days;
    case 'job':
      return terms.amount;
    case 'month':
      return terms.amount * (job.duration.unit === 'month' ? job.duration.count : 1);
  }
}

export const todayISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Demo workers shown as applicants on a job the employer posted (clearly labelled as demo). */
export function demoApplicants(job: Job) {
  return DEMO_WORKERS.filter((w) => w.trades.includes(job.trade) || (w.trades.includes('helper') && job.trade !== 'electrician'))
    .sort((a, b) => distanceKm(job.locality, a.area) - distanceKm(job.locality, b.area))
    .slice(0, 2);
}

/* ---------- Kaam Card QR payload ---------- */

/** Short keys keep the QR code small, so it scans easily on an old phone in sunlight. */
interface CardPayload {
  n: string; // name
  t: WorkerProfile['trades'];
  e: WorkerProfile['experience'];
  a: WorkerProfile['area'];
  k: number; // travel km
  v: WorkerProfile['availability'];
  l: WorkerProfile['languages'];
  w?: string[]; // work examples
  p?: 1; // prefers long-term
  d?: number; // days recorded in the diary (self-reported)
}

const toB64Url = (s: string) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(s)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const fromB64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/** Public link for a Kaam Card. Phone number and photo are never included. */
export function kaamCardLink(p: WorkerProfile, days: number): string {
  const payload: CardPayload = {
    n: p.name,
    t: p.trades,
    e: p.experience,
    a: p.area,
    k: p.travelKm,
    v: p.availability,
    l: p.languages,
    w: p.workExamples.length ? p.workExamples.slice(0, 2) : undefined,
    p: p.prefersLongTerm ? 1 : undefined,
    d: days || undefined,
  };
  return `${window.location.origin}/k#${toB64Url(JSON.stringify(payload))}`;
}

export function readKaamCardLink(hash: string): (WorkerProfile & { days?: number }) | null {
  try {
    const c = JSON.parse(fromB64Url(hash.replace(/^#/, ''))) as CardPayload;
    if (!c.n || !Array.isArray(c.t)) return null;
    return {
      name: c.n,
      trades: c.t,
      experience: c.e,
      area: c.a,
      travelKm: c.k,
      availability: c.v,
      languages: c.l ?? [],
      workExamples: c.w ?? [],
      prefersLongTerm: !!c.p,
      days: c.d,
    };
  } catch {
    return null;
  }
}
