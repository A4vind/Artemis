import { Hammer } from 'lucide-react';
import type { WorkerProfile } from '../data/workers';
import { LANG_OPTIONS, useT } from '../i18n';
import { localityName } from '../lib/format';
import { TradeIcon } from './ui';

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ profile, size = 'md' }: { profile: Pick<WorkerProfile, 'name' | 'photo'>; size?: 'sm' | 'md' | 'lg' }) {
  const { t } = useT();
  return profile.photo ? (
    <img className={`avatar avatar--${size}`} src={profile.photo} alt={t('card.photoAlt', { name: profile.name })} />
  ) : (
    <span className={`avatar avatar--${size} avatar--initials`} aria-hidden>
      {initials(profile.name)}
    </span>
  );
}

/** The worker's resume-free identity: skills, experience, area and availability. */
export function KaamCard({ profile, compact, days }: { profile: WorkerProfile; compact?: boolean; days?: number }) {
  const { t, lang } = useT();
  const langs = profile.languages.map((l) => LANG_OPTIONS.find((o) => o.id === l)!.native).join(', ');

  return (
    <article className={`kaam-card ${compact ? 'kaam-card--compact' : ''}`} aria-label={`${t('card.title')}: ${profile.name}`}>
      <div className="kaam-card__band">
        <span className="kaam-card__brand">
          <img src="/brand/kaamsetu-emblem.webp" width={240} height={113} alt="" />
          <span className="kaam-card__label">{t('card.title')}</span>
        </span>
        <span className={`avail-pill avail-pill--${profile.availability}`}>
          <span className="dot" aria-hidden />
          {t(`availLabel.${profile.availability}`)}
        </span>
      </div>

      <div className="kaam-card__id">
        <Avatar profile={profile} size={compact ? 'md' : 'lg'} />
        <div>
          <h2 className="kaam-card__name">{profile.name}</h2>
          <p className="kaam-card__exp">
            {t('card.experience')}: <strong>{t(`exp.${profile.experience}`)}</strong>
          </p>
        </div>
      </div>

      <ul className="kaam-card__skills" aria-label={t('onb.trades.q')}>
        {profile.trades.map((tr) => (
          <li key={tr}>
            <TradeIcon trade={tr} size="sm" />
            {t(`trade.${tr}`)}
          </li>
        ))}
      </ul>

      <dl className="kaam-card__facts">
        <div>
          <dt>{t('card.area')}</dt>
          <dd>
            {localityName(profile.area, lang)} · {t('card.travel', { n: profile.travelKm })}
          </dd>
        </div>
        <div>
          <dt>{t('card.languages')}</dt>
          <dd>{langs}</dd>
        </div>
        {!!days && (
          <div>
            <dt>{t('card.recorded')}</dt>
            <dd>{t('card.recordedDays', { n: days })}</dd>
          </div>
        )}
        {profile.prefersLongTerm && (
          <div>
            <dt className="sr-only">{t('card.longTerm')}</dt>
            <dd className="kaam-card__pref">{t('card.longTerm')}</dd>
          </div>
        )}
      </dl>

      {!compact && (
        <div className="kaam-card__work">
          <h3>
            <Hammer aria-hidden size={16} /> {t('card.workDone')}
          </h3>
          {profile.workExamples.length ? (
            <ul>
              {profile.workExamples.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">{t('card.noWork')}</p>
          )}
        </div>
      )}

      <p className="kaam-card__foot">{t('card.footer')}</p>
    </article>
  );
}
