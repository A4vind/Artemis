import { ChevronDown, ChevronRight, IdCard, Mail, MapPin, Search, SearchX, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { JobCard } from '../components/JobCard';
import { Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Button, ButtonLink, ChoiceGroup, DemoTag, EmptyState, TradeIcon } from '../components/ui';
import type { Job } from '../data/jobs';
import { LOCALITIES, localityById, type LocalityId } from '../data/localities';
import { TRADES, type TradeId } from '../data/trades';
import { useT } from '../i18n';
import { useSpeaker } from '../lib/device';
import { jobDistance, localityName } from '../lib/format';
import { useStore } from '../state/store';
import { TRAVEL_OPTIONS } from './Onboarding';

const isLongTerm = (j: Job) =>
  !!j.duration.ongoing || j.duration.unit === 'month' || (j.duration.unit === 'week' && j.duration.count >= 2);

export function WorkHome() {
  const { t, lang } = useT();
  const { state, dispatch, allJobs } = useStore();
  const toast = useToast();
  const profile = state.profile;
  const { speakingId, toggle } = useSpeaker();

  // Guests can browse too; their area lives only in this screen's state.
  const [guestArea, setGuestArea] = useState<{ area: LocalityId; travelKm: number }>({ area: 'shivajinagar', travelKm: 10 });
  const area = profile?.area ?? guestArea.area;
  const travelKm = profile?.travelKm ?? guestArea.travelKm;

  const [query, setQuery] = useState('');
  const [today, setToday] = useState(false);
  const [near, setNear] = useState(true);
  const [longTerm, setLongTerm] = useState(false);
  const [trade, setTrade] = useState<TradeId | null>(null);

  const [areaOpen, setAreaOpen] = useState(false);
  const [draftArea, setDraftArea] = useState({ area, travelKm });
  const [typeOpen, setTypeOpen] = useState(false);
  const [draftTrade, setDraftTrade] = useState<TradeId | 'all'>('all');

  const applied = new Set(state.applications.map((a) => a.jobId));
  const reported = new Set(state.reports.map((r) => r.jobId));

  const jobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allJobs
      .filter((j) => {
        if (today && j.startDay !== 0) return false;
        if (near && jobDistance(j, area) > travelKm) return false;
        if (longTerm && !isLongTerm(j)) return false;
        if (trade && j.trade !== trade) return false;
        if (q) {
          const loc = localityById(j.locality).name;
          const hay = [
            ...Object.values(j.title),
            j.employer.name,
            j.landmark ?? '',
            t(`trade.${j.trade}`),
            loc.en,
            loc.hi,
            loc.mr,
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => a.startDay - b.startDay || jobDistance(a, area) - jobDistance(b, area));
  }, [allJobs, query, today, near, longTerm, trade, area, travelKm, t]);

  // Work matching the worker's own trades comes first; everything else stays visible below.
  const mine = profile && !trade ? jobs.filter((j) => profile.trades.includes(j.trade)) : jobs;
  const others = profile && !trade ? jobs.filter((j) => !profile.trades.includes(j.trade)) : [];

  const anyFilter = today || near || longTerm || !!trade || !!query;
  const clearAll = () => {
    setQuery('');
    setToday(false);
    setNear(false);
    setLongTerm(false);
    setTrade(null);
  };

  const listen = (id: string, text: string) => {
    const r = toggle(id, text, lang);
    if (r !== 'ok') toast(t(r === 'unsupported' ? 'speech.unsupported' : 'speech.noVoice'), 'error');
  };

  const saveArea = () => {
    if (profile) dispatch({ type: 'saveProfile', profile: { ...profile, ...draftArea } });
    else setGuestArea(draftArea);
    setNear(true);
    setAreaOpen(false);
  };

  const availableToday = profile?.availability === 'today';
  const offers = state.applications.filter((a) => a.status === 'offered');

  const renderList = (list: Job[]) => (
    <ul className="job-list">
      {list.map((j) => (
        <li key={j.id}>
          <JobCard
            job={j}
            from={area}
            applied={applied.has(j.id)}
            reported={reported.has(j.id)}
            speaking={speakingId === j.id}
            onListen={(text) => listen(j.id, text)}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="page page--home">
      <section className="home-head">
        <h1 className="h1">{profile ? t('home.greeting', { name: profile.name }) : t('home.greetingGuest')}</h1>

        {offers.length > 0 && (
          <Link to="/my-jobs" className="offer-banner">
            <Mail aria-hidden size={24} />
            <span>
              <strong>{offers.length === 1 ? t('home.offer1') : t('home.offers', { n: offers.length })}</strong>
              <span>{t('home.offerHint')}</span>
            </span>
            <ChevronRight aria-hidden />
          </Link>
        )}

        {profile ? (
          <div className={`avail-card ${availableToday ? 'is-on' : ''}`}>
            <div className="avail-card__text">
              <p className="avail-card__q" id="avail-q">
                {t('home.availQ')}
              </p>
              <p className="avail-card__hint" id="avail-hint">
                {availableToday ? t('home.availOnHint') : t('home.availOffHint')}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={availableToday}
              aria-labelledby="avail-q"
              aria-describedby="avail-hint"
              className="switch"
              onClick={() => dispatch({ type: 'setAvailability', availability: availableToday ? 'not_now' : 'today' })}
            >
              <span className="switch__track">
                <span className="switch__thumb" />
              </span>
              <span className="switch__label" aria-hidden>
                {availableToday ? t('home.yes') : t('home.no')}
              </span>
            </button>
          </div>
        ) : (
          <div className="guest-banner">
            <IdCard aria-hidden size={26} />
            <p>{t('home.guestBanner')}</p>
            <ButtonLink to="/start" size="md">
              {t('home.guestCta')}
            </ButtonLink>
          </div>
        )}

        <button
          className="area-btn"
          onClick={() => {
            setDraftArea({ area, travelKm });
            setAreaOpen(true);
          }}
          aria-haspopup="dialog"
        >
          <MapPin aria-hidden size={22} />
          <span className="area-btn__text">
            <strong>{t('home.near', { area: localityName(area, lang) })}</strong>
            <span>{t('home.within', { n: travelKm })}</span>
          </span>
          <span className="area-btn__change">{t('home.change')}</span>
        </button>
      </section>

      <section className="home-list" aria-labelledby="list-title">
        <div className="search">
          <Search aria-hidden size={20} className="search__icon" />
          <label htmlFor="job-search" className="sr-only">
            {t('home.search')}
          </label>
          <input
            id="job-search"
            type="search"
            className="input search__input"
            placeholder={`${t('home.search')} — ${t('home.searchPh')}`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="icon-btn icon-btn--sm search__clear" onClick={() => setQuery('')} aria-label={t('home.clearSearch')}>
              <X aria-hidden size={18} />
            </button>
          )}
        </div>

        <div className="filters filters--scroll" role="group" aria-label={t('home.filters')}>
          <FilterChip on={today} onClick={() => setToday(!today)}>
            {t('home.filter.today')}
          </FilterChip>
          <FilterChip on={near} onClick={() => setNear(!near)}>
            {t('home.filter.near', { n: travelKm })}
          </FilterChip>
          <FilterChip on={longTerm} onClick={() => setLongTerm(!longTerm)}>
            {t('home.filter.long')}
          </FilterChip>
          <button
            className={`chip chip--menu ${trade ? 'is-on' : ''}`}
            onClick={() => {
              setDraftTrade(trade ?? 'all');
              setTypeOpen(true);
            }}
            aria-haspopup="dialog"
          >
            {trade ? t(`trade.${trade}`) : t('home.filter.type')}
            <ChevronDown aria-hidden size={18} />
          </button>
        </div>

        <div className="list-head">
          <h2 className="h2" id="list-title">
            {t('home.listTitle')}
          </h2>
          <p className="list-head__meta" aria-live="polite">
            <strong>{jobs.length === 1 ? t('home.count1') : t('home.count', { n: jobs.length })}</strong> ·{' '}
            {t('home.sort')}
          </p>
          <DemoTag>{t('home.demoNote')}</DemoTag>
        </div>

        {jobs.length ? (
          <>
            {profile && !trade && <h3 className="list-group">{t('home.group.mine', { n: mine.length })}</h3>}
            {mine.length > 0 ? (
              renderList(mine)
            ) : (
              <p className="list-empty">{t('home.group.mineEmpty')}</p>
            )}
            {others.length > 0 && (
              <>
                <h3 className="list-group">{t('home.group.other', { n: others.length })}</h3>
                {renderList(others)}
              </>
            )}
          </>
        ) : (
          <EmptyState
            icon={SearchX}
            title={t('home.empty.title')}
            body={t('home.empty.body')}
            action={
              anyFilter && (
                <Button variant="secondary" onClick={clearAll}>
                  {t('home.empty.clear')}
                </Button>
              )
            }
          />
        )}
      </section>

      <Sheet
        open={areaOpen}
        onClose={() => setAreaOpen(false)}
        title={t('home.areaSheet.title')}
        footer={
          <Button block size="lg" onClick={saveArea}>
            {t('home.areaSheet.save')}
          </Button>
        }
      >
        <div className="stack">
          <ChoiceGroup
            legend={t('post.area')}
            layout="chips"
            value={draftArea.area}
            onChange={(a) => setDraftArea((d) => ({ ...d, area: a }))}
            options={LOCALITIES.map((l) => ({ value: l.id, label: l.name[lang] }))}
          />
          <ChoiceGroup
            legend={t('onb.travel.q')}
            layout="chips"
            value={String(draftArea.travelKm)}
            onChange={(v) => setDraftArea((d) => ({ ...d, travelKm: Number(v) }))}
            options={TRAVEL_OPTIONS.map((n) => ({ value: String(n), label: t('onb.travel.opt', { n }) }))}
          />
          <p className="field__hint">{t('detail.approx')}</p>
        </div>
      </Sheet>

      <Sheet
        open={typeOpen}
        onClose={() => setTypeOpen(false)}
        title={t('home.typeSheet.title')}
        footer={
          <Button
            block
            size="lg"
            onClick={() => {
              setTrade(draftTrade === 'all' ? null : draftTrade);
              setTypeOpen(false);
            }}
          >
            {t('home.typeSheet.apply')}
          </Button>
        }
      >
        <ChoiceGroup
          legend={t('home.filter.type')}
          legendHidden
          layout="grid"
          value={draftTrade}
          onChange={setDraftTrade}
          options={[
            { value: 'all' as const, label: t('home.filter.allTypes') },
            ...TRADES.map((tr) => ({ value: tr.id, label: t(`trade.${tr.id}`), icon: <TradeIcon trade={tr.id} size="sm" /> })),
          ]}
        />
      </Sheet>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button className={`chip ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}
