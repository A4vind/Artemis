import { BookOpen, Briefcase, House, IdCard, LifeBuoy, Repeat, WifiOff } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useT } from '../i18n';
import { useOnline } from '../lib/device';
import { useStore } from '../state/store';
import { LanguageButton } from './LanguageSheet';
import { useToast } from './Toast';
import { Logo } from './ui';

const WORKER_NAV = [
  { to: '/work', icon: House, key: 'nav.work' },
  { to: '/my-jobs', icon: Briefcase, key: 'nav.applied' },
  { to: '/card', icon: IdCard, key: 'nav.card' },
  { to: '/diary', icon: BookOpen, key: 'nav.diary' },
  { to: '/help', icon: LifeBuoy, key: 'nav.help' },
] as const;

export function AppShell({ mode, children }: { mode: 'worker' | 'employer'; children: ReactNode }) {
  const { t } = useT();
  const { state } = useStore();
  const online = useOnline();
  const toast = useToast();
  const wasOffline = useRef(false);
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!online) wasOffline.current = true;
    else if (wasOffline.current) {
      wasOffline.current = false;
      toast(t('online.back'), 'info');
    }
  }, [online, toast, t]);

  // Move focus to the page on navigation so screen readers announce the new screen.
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  // Badge shows what needs the worker's attention: offers to answer and fixed work to close.
  const appliedCount = state.applications.filter((a) => a.status === 'offered' || a.status === 'accepted').length;

  return (
    <div className={`shell shell--${mode}`}>
      <a href="#main" className="skip-link">
        {t('ui.skip')}
      </a>
      <header className="topbar">
        <Link to={mode === 'worker' ? '/work' : '/hire'} className="topbar__brand" aria-label={t('app.name')}>
          <Logo />
          {mode === 'employer' && <span className="mode-badge">{t('hire.badge')}</span>}
        </Link>
        <div className="topbar__actions">
          <Link to={mode === 'worker' ? '/hire' : '/work'} className="mode-switch">
            <Repeat aria-hidden size={18} />
            <span className="mode-switch__long">{mode === 'worker' ? t('nav.toEmployer') : t('nav.toWorker')}</span>
            <span className="mode-switch__short">
              {mode === 'worker' ? t('nav.toEmployerShort') : t('nav.toWorkerShort')}
            </span>
          </Link>
          <LanguageButton />
        </div>
      </header>

      {!online && (
        <div className="offline-bar" role="status">
          <WifiOff aria-hidden size={18} /> {t('offline.msg')}
        </div>
      )}

      <div className="shell__body">
        {mode === 'worker' && (
          <nav className="nav" aria-label={t('nav.label')}>
            {WORKER_NAV.map(({ to, icon: Icon, key }) => (
              <NavLink key={to} to={to} className="nav__item">
                <span className="nav__icon">
                  <Icon aria-hidden size={24} />
                  {to === '/my-jobs' && appliedCount > 0 && <span className="nav__count">{appliedCount}</span>}
                </span>
                <span className="nav__label">{t(key)}</span>
              </NavLink>
            ))}
          </nav>
        )}
        <main id="main" ref={mainRef} tabIndex={-1} className="main">
          {children}
        </main>
      </div>
    </div>
  );
}
