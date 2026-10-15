import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { useT } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Visual tone for the header strip. */
  tone?: 'default' | 'danger';
}

/**
 * Bottom sheet on phones, centred dialog on larger screens.
 * Built on the native <dialog> element for focus trapping and Esc to close.
 */
export function Sheet({ open, onClose, title, children, footer, tone = 'default' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const { t } = useT();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`sheet sheet--${tone}`}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Tap on the dimmed backdrop closes the sheet.
        if (e.target === ref.current) onClose();
      }}
    >
      {open && (
        <div className="sheet__inner">
          <div className="sheet__handle" aria-hidden />
          <header className="sheet__head">
            <h2 id={titleId}>{title}</h2>
            <button className="icon-btn" onClick={onClose} aria-label={t('common.close')}>
              <X aria-hidden />
            </button>
          </header>
          <div className="sheet__body">{children}</div>
          {footer && <footer className="sheet__foot">{footer}</footer>}
        </div>
      )}
    </dialog>
  );
}
