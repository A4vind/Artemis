import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { DEMO_JOBS, type Job } from '../data/jobs';
import type { Availability, Lang, WorkerProfile } from '../data/workers';

export type ReportReason = 'fee' | 'otp' | 'fake' | 'pay' | 'unsafe' | 'other';

export interface Application {
  jobId: string;
  at: number;
  /** Snapshot of the job at the time of applying, so conditions can be reviewed later. */
  job: Job;
}

export interface Report {
  jobId: string;
  reason: ReportReason;
  note: string;
  at: number;
}

export interface AppState {
  lang: Lang;
  textSize: 'normal' | 'large';
  profile: WorkerProfile | null;
  applications: Application[];
  reports: Report[];
  postedJobs: Job[];
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
  | { type: 'resetWorker' };

const STORAGE_KEY = 'kaamsetu:v1';

const initialState: AppState = {
  lang: 'en',
  textSize: 'normal',
  profile: null,
  applications: [],
  reports: [],
  postedJobs: [],
};

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    return { ...initialState, ...(JSON.parse(raw) as Partial<AppState>) };
  } catch {
    return initialState;
  }
}

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
        applications: [{ jobId: action.job.id, at: Date.now(), job: action.job }, ...state.applications],
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
    case 'resetWorker':
      return { ...state, profile: null, applications: [], reports: [] };
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
