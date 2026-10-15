import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { useT } from '../i18n';

type Tone = 'success' | 'info' | 'error';
interface ToastMsg {
  id: number;
  text: string;
  tone: Tone;
}

const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const nextId = useRef(1);
  const { t } = useT();

  const dismiss = useCallback((id: number) => setToasts((ts) => ts.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (text: string, tone: Tone = 'success') => {
      const id = nextId.current++;
      setToasts((ts) => [...ts.slice(-2), { id, text, tone }]);
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 5000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Live region is always mounted so screen readers announce new messages. */}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((m) => {
          const Icon = m.tone === 'success' ? CircleCheck : m.tone === 'error' ? CircleAlert : Info;
          return (
            <div key={m.id} className={`toast toast--${m.tone}`}>
              <Icon aria-hidden size={22} />
              <span>{m.text}</span>
              <button className="icon-btn icon-btn--sm" onClick={() => dismiss(m.id)} aria-label={t('common.dismiss')}>
                <X aria-hidden size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
