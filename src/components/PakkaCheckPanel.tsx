import { CircleCheck, CircleHelp, Copy, MessageCircleQuestionMark, ShieldAlert, Square, Stamp, Volume2 } from 'lucide-react';
import { useId } from 'react';
import { useT } from '../i18n';
import { copyText, type SpeakResult } from '../lib/device';
import type { PakkaCheck } from '../lib/pakkaCheck';
import { CheckBadge } from './JobCard';
import { useToast } from './Toast';
import { Button } from './ui';

interface Props {
  check: PakkaCheck;
  /** Show the "ask before you go" tools (hidden in the employer preview). */
  showAsk?: boolean;
  speaking?: boolean;
  onListen?: (text: string) => SpeakResult;
}

export function PakkaCheckPanel({ check, showAsk = true, speaking, onListen }: Props) {
  const { t } = useT();
  const toast = useToast();
  const headId = useId();

  const copy = async () => {
    const text = `${t('check.askTitle')}:\n${check.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    const r = await copyText(text);
    toast(r === 'copied' ? t('check.copied') : t('speech.unsupported'), r === 'copied' ? 'success' : 'error');
  };

  return (
    <section className={`pakka pakka--${check.level}`} aria-labelledby={headId}>
      <header className="pakka__head">
        <span className="pakka__stamp" aria-hidden>
          <Stamp size={24} />
        </span>
        <div>
          <h2 id={headId} className="pakka__title">
            {t('check.title')}
          </h2>
          <p className="pakka__sub">{t('check.subtitle')}</p>
        </div>
      </header>

      <div className="pakka__summary">
        <CheckBadge check={check} />
        <p className="pakka__score">{t('check.score', { ok: check.okCount, total: check.total })}</p>
        <div className="pakka__meter" aria-hidden>
          {check.items.map((i) => (
            <span key={i.id} className={`seg seg--${i.status}`} />
          ))}
        </div>
      </div>

      {check.warnings.length > 0 && (
        <div className="pakka__warnings">
          <h3 className="pakka__h3">
            <ShieldAlert aria-hidden size={20} /> {t('check.warnTitle')}
          </h3>
          <ul>
            {check.warnings.map((w) => (
              <li key={w.id}>
                <strong>{w.text}</strong>
                <span>{w.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="pakka__items">
        {check.items.map((i) => (
          <li key={i.id} className={`pakka-item pakka-item--${i.status}`}>
            {i.status === 'ok' ? <CircleCheck aria-hidden size={22} /> : <CircleHelp aria-hidden size={22} />}
            <span>
              <span className="sr-only">{t(i.status === 'ok' ? 'check.sr.ok' : 'check.sr.missing')}: </span>
              {i.text}
            </span>
          </li>
        ))}
      </ul>

      {showAsk && (
        <div className="pakka__ask">
          <h3 className="pakka__h3">
            <MessageCircleQuestionMark aria-hidden size={20} /> {t('check.askTitle')}
          </h3>
          {check.questions.length ? (
            <>
              <ol className="ask-list">
                {check.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ol>
              <div className="btn-row">
                {onListen && (
                  <Button
                    variant="secondary"
                    icon={speaking ? Square : Volume2}
                    aria-pressed={speaking}
                    onClick={() => {
                      const r = onListen(check.questions.join(' '));
                      if (r !== 'ok') toast(t(r === 'unsupported' ? 'speech.unsupported' : 'speech.noVoice'), 'error');
                    }}
                  >
                    {speaking ? t('common.stop') : t('check.listenQuestions')}
                  </Button>
                )}
                <Button variant="ghost" icon={Copy} onClick={copy}>
                  {t('check.copyQuestions')}
                </Button>
              </div>
            </>
          ) : (
            <p className="pakka__none">{t('check.noQuestions')}</p>
          )}
        </div>
      )}

      <p className="pakka__note">{t('check.disclaimer')}</p>
    </section>
  );
}
