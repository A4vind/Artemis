import { Camera, IdCard, Pencil, Plus, Share2, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Avatar, KaamCard } from '../components/KaamCard';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, ChoiceGroup, EmptyState, MultiChoiceGroup, TextField, TradeIcon, focusFirstError } from '../components/ui';
import { LOCALITIES } from '../data/localities';
import { TRADES } from '../data/trades';
import type { WorkerProfile } from '../data/workers';
import { LANG_OPTIONS, useT } from '../i18n';
import { resizePhoto, shareText } from '../lib/device';
import { localityName } from '../lib/format';
import { useStore } from '../state/store';
import { AVAILABILITIES, EXPERIENCES, TRAVEL_OPTIONS, isValidPhone } from './Onboarding';

export function Profile() {
  const { t, lang } = useT();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const profile = state.profile;
  const [editing, setEditing] = useState(false);

  if (!profile) {
    return (
      <div className="page">
        <EmptyState
          icon={IdCard}
          title={t('card.none.title')}
          body={t('card.none.body')}
          action={<ButtonLink to="/start?next=/card">{t('card.none.cta')}</ButtonLink>}
        />
      </div>
    );
  }

  const share = async () => {
    const text = t('card.shareText', {
      name: profile.name,
      trades: profile.trades.map((tr) => t(`trade.${tr}`)).join(', '),
      exp: t(`exp.${profile.experience}`),
      area: localityName(profile.area, lang),
      travel: t('card.travel', { n: profile.travelKm }),
      avail: t(`availLabel.${profile.availability}`),
      langs: profile.languages.map((l) => LANG_OPTIONS.find((o) => o.id === l)!.native).join(', '),
    });
    const r = await shareText(text, t('card.title'));
    if (r === 'copied') toast(t('card.copied'));
  };

  return (
    <div className="page page--card">
      <header className="page-head">
        <h1 className="h1">{t('card.title')}</h1>
        <p className="lead">{t('card.sub')}</p>
      </header>

      {editing ? (
        <ProfileEditor
          profile={profile}
          onCancel={() => setEditing(false)}
          onSave={(p) => {
            dispatch({ type: 'saveProfile', profile: p });
            setEditing(false);
            toast(t('edit.saved'));
          }}
        />
      ) : (
        <div className="card-view">
          <KaamCard profile={profile} />
          <div className="btn-row">
            <Button icon={Share2} onClick={share}>
              {t('card.share')}
            </Button>
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              {t('card.edit')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileEditor({ profile, onSave, onCancel }: { profile: WorkerProfile; onSave: (p: WorkerProfile) => void; onCancel: () => void }) {
  const { t, lang } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  const [p, setP] = useState<WorkerProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newWork, setNewWork] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof WorkerProfile>(k: K, v: WorkerProfile[K]) => setP((cur) => ({ ...cur, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = t('onb.name.err');
    if (!p.trades.length) e.trades = t('onb.trades.err');
    if (!p.languages.length) e.languages = t('onb.lang.err');
    if (p.phone && !isValidPhone(p.phone)) e.phone = t('onb.phone.err');
    setErrors(e);
    if (Object.keys(e).length) {
      toast(t('post.err.summary'), 'error');
      focusFirstError();
      return;
    }
    onSave({ ...p, name: p.name.trim(), phone: p.phone?.replace(/\s/g, '') || undefined });
  };

  const addWork = () => {
    const w = newWork.trim();
    if (!w) return;
    set('workExamples', [...p.workExamples, w]);
    setNewWork('');
  };

  const onPhoto = async (file?: File) => {
    if (!file) return;
    try {
      set('photo', await resizePhoto(file));
    } catch {
      toast(t('edit.photoErr'), 'error');
    }
  };

  return (
    <form
      className="editor"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <h2 className="h2">{t('edit.title')}</h2>

      <div className="photo-field">
        <Avatar profile={p} size="lg" />
        <div className="stack stack--sm">
          <span className="field__label">
            {t('edit.photo')} <span className="field__opt">· {t('common.optional')}</span>
          </span>
          <p className="field__hint">{t('edit.photoHint')}</p>
          <div className="btn-row">
            <Button variant="secondary" icon={Camera} onClick={() => fileRef.current?.click()}>
              {p.photo ? t('edit.changePhoto') : t('edit.addPhoto')}
            </Button>
            {p.photo && (
              <Button variant="quiet" onClick={() => set('photo', undefined)}>
                {t('edit.removePhoto')}
              </Button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </div>
      </div>

      <TextField label={t('onb.name.label')} value={p.name} onChange={(v) => set('name', v)} error={errors.name} maxLength={40} />

      <MultiChoiceGroup
        legend={t('onb.trades.q')}
        values={p.trades}
        onChange={(v) => set('trades', v)}
        error={errors.trades}
        options={TRADES.map((tr) => ({ value: tr.id, label: t(`trade.${tr.id}`), icon: <TradeIcon trade={tr.id} size="sm" /> }))}
      />

      <ChoiceGroup
        legend={t('onb.exp.q')}
        layout="chips"
        value={p.experience}
        onChange={(v) => set('experience', v)}
        options={EXPERIENCES.map((e) => ({ value: e, label: t(`exp.${e}`) }))}
      />

      <ChoiceGroup
        legend={t('onb.area.q')}
        layout="chips"
        value={p.area}
        onChange={(v) => set('area', v)}
        options={LOCALITIES.map((l) => ({ value: l.id, label: l.name[lang] }))}
      />

      <ChoiceGroup
        legend={t('onb.travel.q')}
        layout="chips"
        value={String(p.travelKm)}
        onChange={(v) => set('travelKm', Number(v))}
        options={TRAVEL_OPTIONS.map((n) => ({ value: String(n), label: t('onb.travel.opt', { n }) }))}
      />

      <ChoiceGroup
        legend={t('onb.avail.q')}
        layout="row"
        value={p.availability}
        onChange={(v) => set('availability', v)}
        options={AVAILABILITIES.map((a) => ({ value: a, label: t(`avail.${a}`) }))}
      />

      <MultiChoiceGroup
        legend={t('onb.lang.q')}
        layout="row"
        values={p.languages}
        onChange={(v) => set('languages', v)}
        error={errors.languages}
        options={LANG_OPTIONS.map((o) => ({ value: o.id, label: o.native }))}
      />

      <label className="check-row">
        <input type="checkbox" checked={p.prefersLongTerm} onChange={(e) => set('prefersLongTerm', e.target.checked)} />
        <span>{t('edit.longTerm')}</span>
      </label>

      <div className="field">
        <span className="field__label">{t('edit.workDone')}</span>
        <p className="field__hint">{t('edit.workDoneHint')}</p>
        {p.workExamples.length > 0 && (
          <ul className="work-list">
            {p.workExamples.map((w, i) => (
              <li key={`${w}-${i}`}>
                <span>{w}</span>
                <button
                  type="button"
                  className="icon-btn icon-btn--sm"
                  aria-label={`${t('common.remove')}: ${w}`}
                  onClick={() => set('workExamples', p.workExamples.filter((_, j) => j !== i))}
                >
                  <X aria-hidden size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="inline-add">
          <label htmlFor="new-work" className="sr-only">
            {t('edit.workDoneLabel')}
          </label>
          <input
            id="new-work"
            className="input"
            value={newWork}
            maxLength={80}
            onChange={(e) => setNewWork(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addWork();
              }
            }}
          />
          <Button variant="secondary" icon={Plus} onClick={addWork}>
            {t('edit.addWork')}
          </Button>
        </div>
      </div>

      <TextField
        label={t('onb.phone.label')}
        hint={t('onb.phone.hint')}
        optional
        type="tel"
        inputMode="numeric"
        maxLength={11}
        value={p.phone ?? ''}
        onChange={(v) => set('phone', v)}
        error={errors.phone}
      />

      <div className="editor__actions">
        <Button type="submit" size="lg">
          {t('common.save')}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>

      <div className="danger-zone">
        <Button variant="quiet" icon={Trash2} onClick={() => setConfirmDelete(true)}>
          {t('edit.deleteAll')}
        </Button>
      </div>

      <Sheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t('edit.deleteAll')}
        tone="danger"
        footer={
          <div className="btn-row btn-row--stack">
            <Button
              variant="danger"
              block
              onClick={() => {
                dispatch({ type: 'resetWorker' });
                toast(t('edit.deleted'), 'info');
              }}
            >
              {t('edit.deleteYes')}
            </Button>
            <Button variant="ghost" block onClick={() => setConfirmDelete(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        }
      >
        <p className="lead">{t('edit.deleteQ')}</p>
      </Sheet>
    </form>
  );
}
