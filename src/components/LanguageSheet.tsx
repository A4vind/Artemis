import { Languages } from 'lucide-react';
import { useState } from 'react';
import { LANG_OPTIONS, useT } from '../i18n';
import { useStore } from '../state/store';
import { Sheet } from './Sheet';
import { Button, ChoiceGroup } from './ui';

/** Language picker shown as large native-script options, plus a text size switch. */
export function LanguagePicker({ legendHidden }: { legendHidden?: boolean }) {
  const { state, dispatch } = useStore();
  const { t } = useT();
  return (
    <div className="lang-picker">
      <ChoiceGroup
        legend={t('lang.label')}
        legendHidden={legendHidden}
        layout="row"
        value={state.lang}
        onChange={(lang) => dispatch({ type: 'setLang', lang })}
        options={LANG_OPTIONS.map((o) => ({
          value: o.id,
          label: o.native,
          hint: o.id === 'en' ? undefined : o.english,
        }))}
      />
    </div>
  );
}

export function LanguageButton() {
  const [open, setOpen] = useState(false);
  const { state, dispatch } = useStore();
  const { t } = useT();
  const current = LANG_OPTIONS.find((o) => o.id === state.lang)!;
  return (
    <>
      <button className="lang-btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <Languages aria-hidden size={20} />
        <span className="lang-btn__label">{current.native}</span>
        <span className="sr-only">— {t('lang.title')}</span>
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t('lang.title')}
        footer={
          <Button block onClick={() => setOpen(false)}>
            {t('common.close')}
          </Button>
        }
      >
        <div className="stack">
          <LanguagePicker />
          {state.lang !== 'en' && <p className="field__hint">{t('lang.coverage')}</p>}
          <ChoiceGroup
            legend={t('lang.textSize')}
            layout="row"
            value={state.textSize}
            onChange={(size) => dispatch({ type: 'setTextSize', size })}
            options={[
              { value: 'normal', label: `A · ${t('lang.textNormal')}` },
              { value: 'large', label: `A+ · ${t('lang.textLarge')}` },
            ]}
          />
        </div>
      </Sheet>
    </>
  );
}
