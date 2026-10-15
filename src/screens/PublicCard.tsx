import { ArrowRight, IdCard } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { KaamCard } from '../components/KaamCard';
import { LanguageButton } from '../components/LanguageSheet';
import { ButtonLink, EmptyState, Logo } from '../components/ui';
import { useT } from '../i18n';
import { readKaamCardLink } from '../lib/hiring';

/**
 * What a contractor sees after scanning a worker's Kaam Card QR at the naka.
 * Everything comes from the link itself — no account, no server.
 */
export function PublicCard() {
  const { t } = useT();
  const { hash } = useLocation();
  const card = readKaamCardLink(hash);

  return (
    <div className="public-card">
      <header className="topbar">
        <span className="topbar__brand">
          <Logo />
        </span>
        <LanguageButton />
      </header>
      <main id="main" className="page public-card__main">
        {card ? (
          <>
            <p className="lead">{t('public.intro', { name: card.name })}</p>
            <KaamCard profile={card} days={card.days} />
            <p className="callout callout--info">{t('public.note')}</p>
            <ButtonLink to="/hire" iconEnd={ArrowRight}>
              {t('public.hireCta')}
            </ButtonLink>
          </>
        ) : (
          <EmptyState icon={IdCard} title={t('public.bad')} action={<ButtonLink to="/">{t('public.open')}</ButtonLink>} />
        )}
      </main>
    </div>
  );
}
