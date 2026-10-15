import { useCallback } from 'react';
import type { L10n } from '../data/jobs';
import type { Lang } from '../data/workers';
import { useStore } from '../state/store';
import { en, type TKey } from './en';
import { hi } from './hi';
import { mr } from './mr';

export type { TKey };
export type Vars = Record<string, string | number>;

const DICTS: Record<Lang, Partial<Record<TKey, string>>> = { en, hi, mr };

export const LANG_OPTIONS: { id: Lang; native: string; english: string }[] = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { id: 'mr', native: 'मराठी', english: 'Marathi' },
];

/** BCP-47 locale for Intl formatting and speech. */
export const LOCALE: Record<Lang, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

export function translate(lang: Lang, key: TKey, vars?: Vars): string {
  // Missing translation → English → the key itself, so the UI never crashes on a gap.
  let s: string = DICTS[lang][key] ?? en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

export function useT() {
  const { state } = useStore();
  const lang = state.lang;
  const t = useCallback((key: TKey, vars?: Vars) => translate(lang, key, vars), [lang]);
  /** Pick the best available text from data that may be translated. */
  const lt = useCallback((text: L10n) => text[lang] ?? text.en, [lang]);
  return { t, lt, lang };
}
