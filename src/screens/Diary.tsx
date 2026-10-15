import { BookOpen, BriefcaseBusiness, Plus, Share2, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ChoiceGroup, EmptyState, TextField, TradeIcon, focusFirstError } from '../components/ui';
import { TRADES, type TradeId } from '../data/trades';
import { LOCALE, useT } from '../i18n';
import { shareText } from '../lib/device';
import { rupees } from '../lib/format';
import { todayISO } from '../lib/hiring';
import { useStore, type DiaryEntry } from '../state/store';

/** Trades that count towards the construction workers' board's 90-day rule. */
const CONSTRUCTION: TradeId[] = ['mason', 'helper', 'painter', 'carpenter', 'electrician', 'plumber'];
const BOARD_DAYS = 90;

/** Days recorded in the diary over the last 12 months (self-reported). */
export function diaryDaysLastYear(diary: DiaryEntry[], trades?: TradeId[]) {
  const since = todayISO(-365);
  return diary.filter((d) => d.date >= since && (!trades || trades.includes(d.trade))).reduce((n, d) => n + d.days, 0);
}

export function Diary() {
  const { t, lang } = useT();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const diary = state.diary;

  const month = todayISO().slice(0, 7);
  const thisMonth = diary.filter((d) => d.date.startsWith(month));
  const daysMonth = thisMonth.reduce((n, d) => n + d.days, 0);
  const gotMonth = thisMonth.reduce((n, d) => n + d.received, 0);
  const dueAll = diary.reduce((n, d) => n + Math.max((d.promised ?? 0) - d.received, 0), 0);
  const constructionDays = diaryDaysLastYear(diary, CONSTRUCTION);

  const byMonth = useMemo(() => {
    const groups = new Map<string, DiaryEntry[]>();
    [...diary].sort((a, b) => b.date.localeCompare(a.date)).forEach((d) => {
      const k = d.date.slice(0, 7);
      groups.set(k, [...(groups.get(k) ?? []), d]);
    });
    return [...groups.entries()];
  }, [diary]);

  const monthName = (ym: string) =>
    new Intl.DateTimeFormat(LOCALE[lang], { month: 'long', year: 'numeric' }).format(new Date(`${ym}-01T00:00:00`));
  const dayName = (iso: string) => new Intl.DateTimeFormat(LOCALE[lang], { day: 'numeric', month: 'short' }).format(new Date(`${iso}T00:00:00`));

  const share = async () => {
    const lines = [...diary]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => `${d.date} · ${t(`trade.${d.trade}`)} · ${d.employer} · ${t(`dur.day.${d.days === 1 ? 'one' : 'other'}`, { n: d.days })} · ${t('diary.got')} ${rupees(d.received)}${d.promised ? ` / ${rupees(d.promised)}` : ''}`);
    const r = await shareText(`${t('diary.title')} — ${state.profile?.name ?? ''}\n${lines.join('\n')}\n${t('diary.selfNote')}`, t('diary.title'));
    if (r === 'copied') toast(t('diary.copied'));
  };

  return (
    <div className="page page--diary">
      <header className="page-head">
        <h1 className="h1">{t('diary.title')}</h1>
        <p className="lead">{t('diary.sub')}</p>
      </header>

      <div className="btn-row">
        <Button icon={Plus} onClick={() => setAdding(true)}>
          {t('diary.add')}
        </Button>
        {diary.length > 0 && (
          <Button variant="secondary" icon={Share2} onClick={share}>
            {t('diary.share')}
          </Button>
        )}
      </div>

      {diary.length === 0 ? (
        <EmptyState icon={BookOpen} title={t('diary.empty.title')} body={t('diary.empty.body')} />
      ) : (
        <>
          <section className="stats" aria-label={t('diary.thisMonth')}>
            <h2 className="list-group">{t('diary.thisMonth')}</h2>
            <dl className="stats__grid">
              <div className="stat">
                <dt>{t('diary.statDays')}</dt>
                <dd>{daysMonth}</dd>
              </div>
              <div className="stat">
                <dt>{t('diary.statGot')}</dt>
                <dd>{rupees(gotMonth)}</dd>
              </div>
              <div className={`stat ${dueAll ? 'stat--due' : ''}`}>
                <dt>{t('diary.statDue')}</dt>
                <dd>{rupees(dueAll)}</dd>
              </div>
            </dl>
          </section>

          {constructionDays > 0 && (
            <section className="board-progress" aria-labelledby="board-h">
              <h2 id="board-h" className="h3">
                <BriefcaseBusiness aria-hidden size={20} /> {t('diary.boardTitle')}
              </h2>
              <p>{t('diary.boardProgress', { n: constructionDays, total: BOARD_DAYS })}</p>
              <div
                className="meter"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={BOARD_DAYS}
                aria-valuenow={Math.min(constructionDays, BOARD_DAYS)}
                aria-label={t('diary.boardTitle')}
              >
                <span style={{ width: `${Math.min(100, (constructionDays / BOARD_DAYS) * 100)}%` }} />
              </div>
              <p className="small muted">
                {t('diary.boardNote')} <Link to="/help?cat=register">{t('diary.boardLink')}</Link>
              </p>
            </section>
          )}

          {byMonth.map(([ym, entries]) => (
            <section key={ym} className="section" aria-label={monthName(ym)}>
              <h2 className="list-group">{monthName(ym)}</h2>
              <ul className="diary-list">
                {entries.map((d) => {
                  const due = Math.max((d.promised ?? 0) - d.received, 0);
                  const payState = !d.promised ? 'none' : due === 0 ? 'paid' : d.received === 0 ? 'unpaid' : 'partly';
                  return (
                    <li key={d.id} className="diary-row">
                      <TradeIcon trade={d.trade} size="sm" />
                      <div className="diary-row__main">
                        <p className="diary-row__title">
                          {dayName(d.date)} · {t(`trade.${d.trade}`)}
                        </p>
                        <p className="small muted">
                          {d.employer} · {t(`dur.day.${d.days === 1 ? 'one' : 'other'}`, { n: d.days })} · {d.source === 'job' ? t('diary.fromJob') : t('diary.byYou')}
                        </p>
                      </div>
                      <div className="diary-row__money">
                        <strong>{rupees(d.received)}</strong>
                        {payState === 'paid' && <span className="tag tag--ok">{t('diary.paid')}</span>}
                        {payState === 'partly' && <span className="tag tag--warn">{t('diary.due', { amount: rupees(due) })}</span>}
                        {payState === 'unpaid' && <span className="tag tag--danger">{t('diary.unpaid')}</span>}
                      </div>
                      <button
                        className="icon-btn icon-btn--sm"
                        aria-label={`${t('common.remove')}: ${dayName(d.date)} ${t(`trade.${d.trade}`)}`}
                        onClick={() => {
                          dispatch({ type: 'removeDiary', id: d.id });
                          toast(t('diary.removed'), 'info');
                        }}
                      >
                        <Trash2 aria-hidden size={18} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          <p className="small muted">{t('diary.selfNote')}</p>
        </>
      )}

      <AddEntrySheet open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function AddEntrySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useT();
  const { state, dispatch } = useStore();
  const toast = useToast();
  const blank = { date: todayISO(), days: '1', trade: (state.profile?.trades[0] ?? null) as TradeId | null, employer: '', promised: '', received: '' };
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((c) => ({ ...c, [k]: v }));

  const save = () => {
    const e: Record<string, string> = {};
    if (!f.date || f.date > todayISO()) e.date = t('diary.err.date');
    const days = Number(f.days);
    if (!Number.isInteger(days) || days < 1 || days > 31) e.days = t('diary.err.days');
    if (!f.trade) e.trade = t('post.err.trade');
    if (!f.employer.trim()) e.employer = t('diary.err.employer');
    const received = Number(f.received || 0);
    const promised = f.promised ? Number(f.promised) : undefined;
    if (received < 0 || (promised !== undefined && promised < 0)) e.received = t('diary.err.money');
    setErrors(e);
    if (Object.keys(e).length) return focusFirstError();
    dispatch({
      type: 'addDiary',
      entry: { id: `d-${Date.now()}`, date: f.date, days, trade: f.trade!, employer: f.employer.trim(), promised, received, source: 'manual' },
    });
    toast(t('diary.saved'));
    setF(blank);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('diary.add')}
      footer={
        <Button block size="lg" onClick={save}>
          {t('diary.save')}
        </Button>
      }
    >
      <div className="stack">
        <div className="field-row">
          <TextField label={t('diary.date')} type="date" max={todayISO()} value={f.date} onChange={(v) => set('date', v)} error={errors.date} />
          <TextField label={t('diary.days')} type="number" inputMode="numeric" min={1} max={31} value={f.days} onChange={(v) => set('days', v)} error={errors.days} />
        </div>
        <ChoiceGroup
          legend={t('post.trade')}
          layout="chips"
          value={f.trade}
          onChange={(v) => set('trade', v)}
          error={errors.trade}
          options={TRADES.map((tr) => ({ value: tr.id, label: t(`trade.${tr.id}`) }))}
        />
        <TextField label={t('diary.employer')} hint={t('diary.employerHint')} value={f.employer} onChange={(v) => set('employer', v)} error={errors.employer} maxLength={50} />
        <div className="field-row">
          <TextField label={t('diary.promised')} optional type="number" inputMode="numeric" min={0} value={f.promised} onChange={(v) => set('promised', v)} />
          <TextField label={t('diary.received')} type="number" inputMode="numeric" min={0} value={f.received} onChange={(v) => set('received', v)} error={errors.received} />
        </div>
      </div>
    </Sheet>
  );
}
