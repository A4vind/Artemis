import { ArrowRight, Building2, IndianRupee, ShieldCheck, Stamp, UserRound } from 'lucide-react';
import { LanguagePicker } from '../components/LanguageSheet';
import { ButtonLink } from '../components/ui';
import { useT } from '../i18n';
import { useStore } from '../state/store';

export function Welcome() {
  const { t } = useT();
  const { state } = useStore();
  const profile = state.profile;

  const points = [
    { icon: UserRound, title: t('welcome.point1'), body: t('welcome.point1d') },
    { icon: IndianRupee, title: t('welcome.point2'), body: t('welcome.point2d') },
    { icon: Stamp, title: t('welcome.point3'), body: t('welcome.point3d') },
  ];

  return (
    <div className="welcome">
      <main className="welcome__inner" id="main">
        <div className="welcome__hero">
          <img
            className="welcome__logo"
            src="/brand/kaamsetu-lockup.webp"
            width={720}
            height={433}
            alt={t('app.logoAlt')}
          />
          <p className="welcome__tagline">{t('app.tagline')}</p>
          <h1 className="welcome__lead">{t('welcome.lead')}</h1>
        </div>

        <section className="welcome__lang card" aria-label={t('welcome.chooseLang')}>
          <h2 className="h3">{t('welcome.chooseLang')}</h2>
          <LanguagePicker legendHidden />
        </section>

        <div className="welcome__actions">
          {profile ? (
            <ButtonLink to="/work" size="lg" block iconEnd={ArrowRight}>
              {t('welcome.continue', { name: profile.name })}
            </ButtonLink>
          ) : (
            <ButtonLink to="/start" size="lg" block iconEnd={ArrowRight}>
              {t('welcome.ctaWorker')}
            </ButtonLink>
          )}
          <ButtonLink to="/hire" variant="secondary" block icon={Building2}>
            {t('welcome.ctaEmployer')}
          </ButtonLink>
        </div>

        <ul className="welcome__points">
          {points.map(({ icon: Icon, title, body }) => (
            <li key={title}>
              <span className="welcome__point-icon" aria-hidden>
                <Icon size={22} />
              </span>
              <span>
                <strong>{title}</strong>
                <span>{body}</span>
              </span>
            </li>
          ))}
        </ul>

        <p className="welcome__demo">
          <ShieldCheck aria-hidden size={18} /> {t('welcome.demoNote')}
        </p>
      </main>
    </div>
  );
}
