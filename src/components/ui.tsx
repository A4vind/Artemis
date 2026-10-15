import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { tradeById, type TradeId } from '../data/trades';
import { useT } from '../i18n';

/* ---------- Buttons ---------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'quiet' | 'ok';

interface BtnOwn {
  variant?: Variant;
  icon?: LucideIcon;
  /** Icon after the label — used for forward actions. */
  iconEnd?: LucideIcon;
  block?: boolean;
  size?: 'md' | 'lg';
}

const btnClass = ({ variant = 'primary', block, size = 'md' }: BtnOwn, extra?: string) =>
  ['btn', `btn--${variant}`, size === 'lg' && 'btn--lg', block && 'btn--block', extra].filter(Boolean).join(' ');

export function Button({ variant, icon: Icon, iconEnd: IconEnd, block, size, className, children, ...rest }: BtnOwn & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={btnClass({ variant, block, size }, className)} type="button" {...rest}>
      {Icon && <Icon aria-hidden size={20} />}
      <span>{children}</span>
      {IconEnd && <IconEnd aria-hidden size={20} />}
    </button>
  );
}

export function ButtonLink({ variant, icon: Icon, iconEnd: IconEnd, block, size, className, children, ...rest }: BtnOwn & LinkProps) {
  return (
    <Link className={btnClass({ variant, block, size }, className)} {...rest}>
      {Icon && <Icon aria-hidden size={20} />}
      <span>{children}</span>
      {IconEnd && <IconEnd aria-hidden size={20} />}
    </Link>
  );
}

/* ---------- Trade icon tile ---------- */

export function TradeIcon({ trade, size = 'md' }: { trade: TradeId; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = tradeById(trade).icon;
  return (
    <span className={`trade-icon trade-icon--${size} trade-icon--${trade}`} aria-hidden>
      <Icon size={size === 'lg' ? 30 : size === 'sm' ? 18 : 22} strokeWidth={2} />
    </span>
  );
}

/* ---------- Choice cards (radio or checkbox styled as large tiles) ---------- */

interface ChoiceOption<V extends string> {
  value: V;
  label: string;
  icon?: ReactNode;
  hint?: string;
}

interface ChoiceProps<V extends string> {
  legend: string;
  hint?: string;
  options: ChoiceOption<V>[];
  error?: string;
  layout?: 'grid' | 'list' | 'row' | 'chips';
  legendHidden?: boolean;
}

export function ChoiceGroup<V extends string>({
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  layout = 'list',
  legendHidden,
}: ChoiceProps<V> & { value: V | null; onChange: (v: V) => void }) {
  const name = useId();
  const errId = useId();
  return (
    <fieldset className="choice-group" aria-describedby={error ? errId : undefined} aria-invalid={!!error || undefined}>
      <legend className={legendHidden ? 'sr-only' : 'field__label'}>{legend}</legend>
      {hint && <p className="field__hint">{hint}</p>}
      <div className={`choices choices--${layout}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice ${value === o.value ? 'is-selected' : ''}`}>
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.icon}
            <span className="choice__text">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
            <span className="choice__mark" aria-hidden>
              <Check size={16} strokeWidth={3} />
            </span>
          </label>
        ))}
      </div>
      {error && <FieldError id={errId}>{error}</FieldError>}
    </fieldset>
  );
}

export function MultiChoiceGroup<V extends string>({
  legend,
  hint,
  options,
  values,
  onChange,
  error,
  layout = 'grid',
  legendHidden,
}: ChoiceProps<V> & { values: V[]; onChange: (v: V[]) => void }) {
  const errId = useId();
  const toggle = (v: V) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <fieldset className="choice-group" aria-describedby={error ? errId : undefined} aria-invalid={!!error || undefined}>
      <legend className={legendHidden ? 'sr-only' : 'field__label'}>{legend}</legend>
      {hint && <p className="field__hint">{hint}</p>}
      <div className={`choices choices--${layout}`}>
        {options.map((o) => (
          <label key={o.value} className={`choice ${values.includes(o.value) ? 'is-selected' : ''}`}>
            <input type="checkbox" value={o.value} checked={values.includes(o.value)} onChange={() => toggle(o.value)} />
            {o.icon}
            <span className="choice__text">
              <span className="choice__label">{o.label}</span>
              {o.hint && <span className="choice__hint">{o.hint}</span>}
            </span>
            <span className="choice__mark choice__mark--box" aria-hidden>
              <Check size={16} strokeWidth={3} />
            </span>
          </label>
        ))}
      </div>
      {error && <FieldError id={errId}>{error}</FieldError>}
    </fieldset>
  );
}

/* ---------- Text field ---------- */

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
}

export function TextField({ label, hint, error, optional, onChange, multiline, id, ...rest }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const errId = `${fieldId}-err`;
  const { t } = useT();
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
        {optional && <span className="field__opt"> · {t('common.optional')}</span>}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          id={fieldId}
          className="input"
          rows={3}
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          value={rest.value as string}
          placeholder={rest.placeholder}
          maxLength={rest.maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={fieldId}
          className="input"
          aria-describedby={describedBy}
          aria-invalid={!!error || undefined}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      )}
      {error && <FieldError id={errId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p className="field__error" id={id}>
      <span aria-hidden>!</span> {children}
    </p>
  );
}

/** After validation fails, move focus to the first invalid field so it is seen and announced. */
export function focusFirstError() {
  requestAnimationFrame(() => {
    const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (!el) return;
    const target = el.matches('fieldset') ? el.querySelector<HTMLElement>('input') : el;
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    target?.focus({ preventScroll: true });
  });
}

/* ---------- Misc ---------- */

export function EmptyState({ icon: Icon, title, body, action }: { icon: LucideIcon; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <span className="empty__icon" aria-hidden>
        <Icon size={30} />
      </span>
      <h2 className="empty__title">{title}</h2>
      {body && <p className="empty__body">{body}</p>}
      {action}
    </div>
  );
}

export function DemoTag({ children }: { children?: ReactNode }) {
  const { t } = useT();
  return <span className="demo-tag">{children ?? t('common.demo')}</span>;
}

/** The KaamSetu emblem (from the logo artwork) with the two-tone wordmark. */
export function Logo({ compact }: { compact?: boolean }) {
  const { t } = useT();
  return (
    <span className="logo">
      <img className="logo__mark" src="/brand/kaamsetu-emblem.webp" width={240} height={113} alt="" />
      {!compact && (
        <span className="logo__word">
          {t('app.name.a')}
          <b>{t('app.name.b')}</b>
        </span>
      )}
    </span>
  );
}
