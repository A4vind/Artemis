import { ChevronDown, ExternalLink, FileText, HeartPulse, Landmark, Phone, PiggyBank, Scale, ShieldCheck, Siren, UserRound } from 'lucide-react';
import { useState } from 'react';
import { SUPPORT_ITEMS, type SupportCategory, type SupportItem } from '../data/schemes';
import { useT } from '../i18n';

const CATEGORY_ICON = {
  register: Landmark,
  pension: PiggyBank,
  health: HeartPulse,
  complaint: Scale,
  emergency: Siren,
} as const;

const CATEGORIES: (SupportCategory | 'all')[] = ['all', 'register', 'pension', 'health', 'complaint', 'emergency'];

export function Help() {
  const { t } = useT();
  const [cat, setCat] = useState<SupportCategory | 'all'>('all');
  const items = SUPPORT_ITEMS.filter((i) => cat === 'all' || i.category === cat);

  return (
    <div className="page page--help">
      <header className="page-head">
        <h1 className="h1">{t('help.title')}</h1>
        <p className="lead">{t('help.sub')}</p>
      </header>

      <section className="rules" aria-labelledby="rules-h">
        <h2 id="rules-h" className="rules__title">
          <ShieldCheck aria-hidden /> {t('help.rulesTitle')}
        </h2>
        <ol className="rules__list">
          <li>{t('help.rule1')}</li>
          <li>{t('help.rule2')}</li>
          <li>{t('help.rule3')}</li>
          <li>{t('help.rule4')}</li>
        </ol>
      </section>

      <div className="filters filters--scroll" role="group" aria-label={t('home.filters')}>
        {CATEGORIES.map((c) => {
          const Icon = c === 'all' ? null : CATEGORY_ICON[c];
          return (
            <button key={c} className={`chip ${cat === c ? 'is-on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
              {Icon && <Icon aria-hidden size={18} />}
              {t(`help.cat.${c}`)}
            </button>
          );
        })}
      </div>

      <ul className="support-list">
        {items.map((item) => (
          <li key={item.id}>
            <SupportCard item={item} />
          </li>
        ))}
      </ul>

      <section className="callout callout--info help-csc">
        <UserRound aria-hidden />
        <div>
          <h2 className="h3">{t('help.applyHelp.title')}</h2>
          <p>{t('help.applyHelp.body')}</p>
        </div>
      </section>

      <p className="small muted help-disclaimer">{t('help.disclaimer')}</p>
    </div>
  );
}

function SupportCard({ item }: { item: SupportItem }) {
  const { t, lt } = useT();
  const [open, setOpen] = useState(false);
  const Icon = CATEGORY_ICON[item.category];
  const hasDetails = !!(item.who || item.documents || item.howToApply);
  const panelId = `support-${item.id}`;

  return (
    <article className={`support-card support-card--${item.category}`}>
      <div className="support-card__head">
        <span className="support-card__icon" aria-hidden>
          <Icon size={22} />
        </span>
        <div>
          <p className="support-card__cat">{t(`help.cat.${item.category}`)}</p>
          <h3 className="h3">{lt(item.name)}</h3>
        </div>
      </div>
      <p>{lt(item.what)}</p>

      {hasDetails && open && (
        <div id={panelId} className="support-card__details">
          {item.who && (
            <div>
              <h4>{t('help.who')}</h4>
              <p>{lt(item.who)}</p>
            </div>
          )}
          {item.documents && (
            <div>
              <h4>{t('help.docs')}</h4>
              <ul className="doc-list">
                {item.documents.map((d) => (
                  <li key={d.en}>
                    <FileText aria-hidden size={16} /> {lt(d)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.howToApply && (
            <div>
              <h4>{t('help.how')}</h4>
              <p>{lt(item.howToApply)}</p>
            </div>
          )}
        </div>
      )}

      <div className="support-card__actions">
        {item.helpline && (
          <a className="btn btn--secondary" href={`tel:${item.helpline}`}>
            <Phone aria-hidden size={20} />
            <span>{t('help.call', { n: item.helpline })}</span>
          </a>
        )}
        {item.officialUrl && (
          <a className="btn btn--ghost" href={item.officialUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden size={20} />
            <span>{t('help.official')}</span>
          </a>
        )}
        {hasDetails && (
          <button className="btn btn--quiet" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
            <span>{open ? t('help.less') : t('help.more')}</span>
            <ChevronDown aria-hidden size={20} className={open ? 'rot-180' : ''} />
          </button>
        )}
      </div>
    </article>
  );
}
