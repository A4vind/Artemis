import { IdCard, ImagePlus, Lock, Pencil, Plus, QrCode as QrIcon, Share2, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { KaamCard } from '../components/KaamCard';
import { ProfilePhotoField, WorkPhotosField } from '../components/PhotoFields';
import { QrCode } from '../components/QrCode';
import { AreaPicker } from '../components/AreaPicker';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, ChoiceGroup, EmptyState, MultiChoiceGroup, TextField, TradeIcon, focusFirstError } from '../components/ui';
import { TRADES } from '../data/trades';
import type { AgeRange, Gender, Shift, WorkerProfile } from '../data/workers';
import { LANG_OPTIONS, useT } from '../i18n';
import { shareText } from '../lib/device';
import { localityName } from '../lib/format';
import { kaamCardLink } from '../lib/hiring';
import { diaryDaysLastYear } from './Diary';
import { useStore } from '../state/store';
import { AVAILABILITIES, EXPERIENCES, TRAVEL_OPTIONS, isValidPhone } from './Onboarding';

const SHIFTS: Shift[] = ['morning', 'day', 'night'];
const AGE_RANGES: AgeRange[] = ['18to25', '26to40', '41to59', '60plus'];
const GENDERS: Gender[] = ['woman', 'man', 'other', 'no_say'];

export function Profile() {
  const { t, lang } = useT();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const profile = state.profile;
  const [editing, setEditing] = useState(false);
  const [naka, setNaka] = useState(false);
  const days = diaryDaysLastYear(state.diary);

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
          <KaamCard profile={profile} days={days} />
          {!profile.workPhotos?.length && (
            <button className="nudge" onClick={() => setEditing(true)}>
              <ImagePlus aria-hidden size={24} />
              <span>
                <strong>{t('card.nudgeTitle')}</strong>
                <span>{t('card.nudgeBody')}</span>
              </span>
            </button>
          )}
          <div className="btn-row">
            <Button icon={QrIcon} onClick={() => setNaka(true)}>
              {t('naka.show')}
            </Button>
            <Button variant="secondary" icon={Share2} onClick={share}>
              {t('card.share')}
            </Button>
            <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>
              {t('card.edit')}
            </Button>
          </div>
        </div>
      )}

      <Sheet open={naka} onClose={() => setNaka(false)} title={t('naka.title')}>
        {naka && (
          <div className="naka">
            <p className="naka__name">{profile.name}</p>
            <p className="naka__trades">{profile.trades.map((tr) => t(`trade.${tr}`)).join(' · ')}</p>
            <QrCode value={kaamCardLink(profile, days)} label={t('naka.qrLabel', { name: profile.name })} size={260} />
            <p className="lead">{t('naka.howTo')}</p>
            <p className="small muted">{t('naka.privacy')}</p>
          </div>
        )}
      </Sheet>
    </div>
  );
}

function ProfileEditor({ profile, onSave, onCancel }: { profile: WorkerProfile; onSave: (p: WorkerProfile) => void; onCancel: () => void }) {
  const { t } = useT();
  const { dispatch } = useStore();
  const toast = useToast();
  const [p, setP] = useState<WorkerProfile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newWork, setNewWork] = useState('');
  const [wage, setWage] = useState(profile.expectedWage ? String(profile.expectedWage) : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof WorkerProfile>(k: K, v: WorkerProfile[K]) => setP((cur) => ({ ...cur, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!p.name.trim()) e.name = t('onb.name.err');
    if (!p.trades.length) e.trades = t('onb.trades.err');
    if (!p.languages.length) e.languages = t('onb.lang.err');
    if (p.phone && !isValidPhone(p.phone)) e.phone = t('onb.phone.err');
    if (wage && !(Number(wage) >= 100 && Number(wage) <= 5000)) e.wage = t('edit.wageErr');
    setErrors(e);
    if (Object.keys(e).length) {
      toast(t('post.err.summary'), 'error');
      focusFirstError();
      return;
    }
    onSave({
      ...p,
      name: p.name.trim(),
      phone: p.phone?.replace(/\s/g, '') || undefined,
      expectedWage: wage ? Number(wage) : undefined,
      hometown: p.hometown?.trim() || undefined,
    });
  };

  const addWork = () => {
    const w = newWork.trim();
    if (!w) return;
    set('workExamples', [...p.workExamples, w]);
    setNewWork('');
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

      <ProfilePhotoField name={p.name} photo={p.photo} onChange={(ph) => set('photo', ph)} />

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

      <AreaPicker legend={t('onb.area.q')} value={p.area} onChange={(v) => set('area', v)} />

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

      <WorkPhotosField photos={p.workPhotos ?? []} onChange={(ph) => set('workPhotos', ph)} />

      <fieldset className="editor__section">
        <legend className="h3">{t('edit.workDetails')}</legend>
        <ChoiceGroup
          legend={t('edit.ownTools')}
          layout="row"
          value={p.ownTools === undefined ? null : p.ownTools ? 'yes' : 'no'}
          onChange={(v) => set('ownTools', v === 'yes')}
          options={[
            { value: 'yes', label: t('edit.toolsYes') },
            { value: 'no', label: t('edit.toolsNo') },
          ]}
        />
        <TextField
          label={t('edit.wage')}
          hint={t('edit.wageHint')}
          optional
          type="number"
          inputMode="numeric"
          min={100}
          max={5000}
          value={wage}
          onChange={setWage}
          error={errors.wage}
          className="input input--short"
        />
        <MultiChoiceGroup
          legend={t('edit.shifts')}
          layout="row"
          values={p.shifts ?? []}
          onChange={(v) => set('shifts', v)}
          options={SHIFTS.map((sh) => ({ value: sh, label: t(`shift.${sh}`) }))}
        />
      </fieldset>

      <fieldset className="editor__section editor__section--private">
        <legend className="h3">
          <Lock aria-hidden size={18} /> {t('edit.private')}
        </legend>
        <p className="field__hint">{t('edit.privateHint')}</p>
        <ChoiceGroup
          legend={t('edit.age')}
          layout="chips"
          value={p.ageRange ?? null}
          onChange={(v) => set('ageRange', v)}
          options={AGE_RANGES.map((a) => ({ value: a, label: t(`age.${a}`) }))}
        />
        <ChoiceGroup
          legend={t('edit.gender')}
          layout="chips"
          value={p.gender ?? null}
          onChange={(v) => set('gender', v)}
          options={GENDERS.map((g) => ({ value: g, label: t(`gender.${g}`) }))}
        />
        <TextField label={t('edit.hometown')} hint={t('edit.hometownHint')} optional value={p.hometown ?? ''} onChange={(v) => set('hometown', v)} maxLength={60} />
      </fieldset>

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
