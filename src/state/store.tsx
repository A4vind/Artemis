import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEMO_JOBS, type Job, type PayPeriod, type PayTiming } from '../data/jobs';
import type { TradeId } from '../data/trades';
import type { Availability, Lang, WorkerProfile } from '../data/workers';

export type ReportReason = 'fee' | 'otp' | 'fake' | 'pay' | 'unsafe' | 'other';

/** The worker's side of one job, from applying (or being invited) to getting paid. */
export type AppStatus = 'applied' | 'offered' | 'accepted' | 'worker_declined' | 'not_selected' | 'done';

/** The exact terms an employer offers. Compared against the job post before the worker accepts. */
export interface OfferTerms {
  amount: number;
  period: PayPeriod;
  timing: PayTiming;
  startDay: number;
  startTime: string;
  hoursPerDay: number;
  place: string;
}

export interface Offer extends OfferTerms {
  at: number;
  /** True when the offer was produced by the demo "simulate employer" button. */
  simulated?: boolean;
}

export type PaymentStatus = 'yes' | 'partly' | 'no';

export interface Application {
  jobId: string;
  at: number;
  /** Snapshot of the job at the time of applying, so conditions can be reviewed later. */
  job: Job;
  status: AppStatus;
  via: 'applied' | 'invited';
  offer?: Offer;
  acceptedAt?: number;
  employerDone?: boolean;
  payment?: { status: PaymentStatus; received: number; at: number };
}

export interface Report {
  jobId: string;
  reason: ReportReason;
  note: string;
  at: number;
}

/** Employer decisions about demo workers (who live only in demo data). Key: `${jobId}:${workerId}`. */
export type DemoDecision = 'offered' | 'declined' | 'invited';

export interface DiaryEntry {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  days: number;
  trade: TradeId;
  employer: string;
  /** Total pay promised for these days, if known. */
  promised?: number;
  received: number;
  source: 'job' | 'manual';
  jobId?: string;
}

export interface AppState {
  lang: Lang;
  textSize: 'normal' | 'large';
  profile: WorkerProfile | null;
  applications: Application[];
  reports: Report[];
  postedJobs: Job[];
  demoDecisions: Record<string, DemoDecision>;
  diary: DiaryEntry[];
}

type Action =
  | { type: 'setLang'; lang: Lang }
  | { type: 'setTextSize'; size: AppState['textSize'] }
  | { type: 'saveProfile'; profile: WorkerProfile }
  | { type: 'setAvailability'; availability: Availability }
  | { type: 'apply'; job: Job }
  | { type: 'withdraw'; jobId: string }
  | { type: 'report'; report: Report }
  | { type: 'postJob'; job: Job }
  | { type: 'removePost'; jobId: string }
  | { type: 'sendOffer'; jobId: string; offer: Offer }
  | { type: 'invite'; job: Job; offer: Offer }
  | { type: 'notSelected'; jobId: string }
  | { type: 'respondOffer'; jobId: string; accept: boolean }
  | { type: 'employerDone'; jobId: string }
  | { type: 'recordPayment'; jobId: string; status: PaymentStatus; received: number; entry: DiaryEntry }
  | { type: 'demoDecision'; key: string; decision: DemoDecision }
  | { type: 'addDiary'; entry: DiaryEntry }
  | { type: 'removeDiary'; id: string }
  | { type: 'resetWorker' };

const STORAGE_KEY = 'kaamsetu:v1';

const initialState: AppState = {
  lang: 'en',
  textSize: 'normal',
  profile: null,
  applications: [],
  reports: [],
  postedJobs: [],
  demoDecisions: {},
  diary: [],
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const saved = { ...initialState, ...(JSON.parse(raw) as Partial<AppState>) };
    // Older saves had applications without a status.
    saved.applications = saved.applications.map((a) => ({ ...a, status: a.status ?? 'applied', via: a.via ?? 'applied' }));
    return saved;
  } catch {
    return initialState;
  }
}

const updateApp = (state: AppState, jobId: string, patch: (a: Application) => Partial<Application>): AppState => ({
  ...state,
  applications: state.applications.map((a) => (a.jobId === jobId ? { ...a, ...patch(a) } : a)),
});

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'setLang':
      return { ...state, lang: action.lang };
    case 'setTextSize':
      return { ...state, textSize: action.size };
    case 'saveProfile':
      return { ...state, profile: action.profile };
    case 'setAvailability':
      return state.profile
        ? { ...state, profile: { ...state.profile, availability: action.availability } }
        : state;
    case 'apply':
      if (state.applications.some((a) => a.jobId === action.job.id)) return state;
      return {
        ...state,
        applications: [
          { jobId: action.job.id, at: Date.now(), job: action.job, status: 'applied', via: 'applied' },
          ...state.applications,
        ],
      };
    case 'withdraw':
      return { ...state, applications: state.applications.filter((a) => a.jobId !== action.jobId) };
    case 'report':
      return {
        ...state,
        reports: [action.report, ...state.reports.filter((r) => r.jobId !== action.report.jobId)],
      };
    case 'postJob':
      return { ...state, postedJobs: [action.job, ...state.postedJobs] };
    case 'removePost':
      return { ...state, postedJobs: state.postedJobs.filter((j) => j.id !== action.jobId) };
    case 'sendOffer':
      return updateApp(state, action.jobId, () => ({ status: 'offered', offer: action.offer }));
    case 'invite': {
      // An invite is an offer the worker did not have to apply for.
      const existing = state.applications.find((a) => a.jobId === action.job.id);
      if (existing) return updateApp(state, action.job.id, () => ({ status: 'offered', offer: action.offer }));
      return {
        ...state,
        applications: [
          { jobId: action.job.id, at: Date.now(), job: action.job, status: 'offered', via: 'invited', offer: action.offer },
          ...state.applications,
        ],
      };
    }
    case 'notSelected':
      return updateApp(state, action.jobId, () => ({ status: 'not_selected' }));
    case 'respondOffer':
      return updateApp(state, action.jobId, () =>
        action.accept ? { status: 'accepted', acceptedAt: Date.now() } : { status: 'worker_declined' },
      );
    case 'employerDone':
      return updateApp(state, action.jobId, () => ({ employerDone: true }));
    case 'recordPayment': {
      const next = updateApp(state, action.jobId, () => ({
        status: 'done',
        payment: { status: action.status, received: action.received, at: Date.now() },
      }));
      return { ...next, diary: [action.entry, ...next.diary.filter((d) => d.jobId !== action.jobId)] };
    }
    case 'demoDecision':
      return { ...state, demoDecisions: { ...state.demoDecisions, [action.key]: action.decision } };
    case 'addDiary':
      return { ...state, diary: [action.entry, ...state.diary] };
    case 'removeDiary':
      return { ...state, diary: state.diary.filter((d) => d.id !== action.id) };
    case 'resetWorker':
      return { ...state, profile: null, applications: [], reports: [], diary: [] };
  }
}

interface Store {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  /** Demo jobs plus anything posted from the employer side on this device. */
  allJobs: Job[];
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or blocked — the app keeps working for this session.
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.lang;
    document.documentElement.dataset.textSize = state.textSize;
  }, [state.lang, state.textSize]);

  const allJobs = useMemo(() => [...state.postedJobs, ...DEMO_JOBS], [state.postedJobs]);

  return <StoreContext.Provider value={{ state, dispatch, allJobs }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
