import type { LocalityId } from './localities';
import type { TradeId } from './trades';

export type Experience = 'new' | '1to3' | '3to10' | '10plus';
export type Availability = 'today' | 'this_week' | 'not_now';
export type Lang = 'en' | 'hi' | 'mr';
export type Shift = 'morning' | 'day' | 'night';
/** Bands chosen to match scheme age limits (e.g. PM-SYM 18–40, e-Shram 16–59). */
export type AgeRange = '18to25' | '26to40' | '41to59' | '60plus';
export type Gender = 'woman' | 'man' | 'other' | 'no_say';

export interface WorkerProfile {
  name: string;
  trades: TradeId[];
  experience: Experience;
  area: LocalityId;
  /** Max distance the worker is willing to travel, in km. */
  travelKm: number;
  availability: Availability;
  languages: Lang[];
  /** Optional. Kept only on this device. */
  phone?: string;
  /** Optional small photo as data URL. Kept only on this device. */
  photo?: string;
  /** Self-described past work, in the worker's own words. */
  workExamples: string[];
  prefersLongTerm: boolean;
  /** Optional photos of past work (small JPEG data URLs). Kept only on this device. */
  workPhotos?: string[];
  /* Work details — shown on the Kaam Card. */
  ownTools?: boolean;
  /** Daily rate the worker usually asks for, in rupees. */
  expectedWage?: number;
  shifts?: Shift[];
  /* Private details — never shown to employers or put in the QR. Used only for scheme hints. */
  ageRange?: AgeRange;
  gender?: Gender;
  hometown?: string;
}

/** DEMO DATA — fictional worker profiles shown in the employer view. */
export const DEMO_WORKERS: (WorkerProfile & { id: string })[] = [
  {
    id: 'w1',
    name: 'Ramesh K.',
    trades: ['mason', 'helper'],
    experience: '10plus',
    area: 'hadapsar',
    travelKm: 10,
    availability: 'today',
    languages: ['mr', 'hi'],
    workExamples: ['Brick and plaster work on 3 housing projects'],
    prefersLongTerm: true,
  },
  {
    id: 'w2',
    name: 'Salim S.',
    trades: ['plumber'],
    experience: '3to10',
    area: 'kothrud',
    travelKm: 8,
    availability: 'today',
    languages: ['hi', 'en'],
    workExamples: ['Bathroom fittings, water tank connections'],
    prefersLongTerm: false,
  },
  {
    id: 'w3',
    name: 'Sunita P.',
    trades: ['cleaner'],
    experience: '3to10',
    area: 'baner',
    travelKm: 6,
    availability: 'this_week',
    languages: ['mr'],
    workExamples: ['Office and society housekeeping'],
    prefersLongTerm: true,
  },
  {
    id: 'w4',
    name: 'Arjun M.',
    trades: ['electrician', 'helper'],
    experience: '1to3',
    area: 'shivajinagar',
    travelKm: 12,
    availability: 'today',
    languages: ['hi', 'mr'],
    workExamples: ['House wiring, fan and light fitting'],
    prefersLongTerm: false,
  },
  {
    id: 'w5',
    name: 'Kavita D.',
    trades: ['painter'],
    experience: '3to10',
    area: 'pimpri',
    travelKm: 10,
    availability: 'today',
    languages: ['mr', 'hi'],
    workExamples: ['Interior painting, texture walls'],
    prefersLongTerm: false,
  },
  {
    id: 'w6',
    name: 'Bablu Y.',
    trades: ['loader', 'helper'],
    experience: 'new',
    area: 'wakad',
    travelKm: 15,
    availability: 'today',
    languages: ['hi'],
    workExamples: [],
    prefersLongTerm: false,
  },
  {
    id: 'w7',
    name: 'Ganesh T.',
    trades: ['carpenter'],
    experience: '10plus',
    area: 'kharadi',
    travelKm: 10,
    availability: 'this_week',
    languages: ['mr', 'hi', 'en'],
    workExamples: ['Modular kitchens, door frames, wardrobes'],
    prefersLongTerm: false,
  },
  {
    id: 'w8',
    name: 'Shabana K.',
    trades: ['cleaner'],
    experience: '3to10',
    area: 'kurla',
    travelKm: 10,
    availability: 'today',
    languages: ['hi'],
    workExamples: ['Housekeeping in offices and hospitals'],
    prefersLongTerm: true,
  },
  {
    id: 'w9',
    name: 'Prakash J.',
    trades: ['painter', 'helper'],
    experience: '10plus',
    area: 'andheri',
    travelKm: 15,
    availability: 'today',
    languages: ['mr', 'hi'],
    workExamples: ['Painted flats and offices in Andheri and Goregaon'],
    prefersLongTerm: false,
  },
  {
    id: 'w10',
    name: 'Mohan R.',
    trades: ['electrician'],
    experience: '3to10',
    area: 'dadar',
    travelKm: 10,
    availability: 'this_week',
    languages: ['hi', 'en'],
    workExamples: ['Shop wiring, inverter fitting'],
    prefersLongTerm: false,
  },
  {
    id: 'w11',
    name: 'Vijay S.',
    trades: ['loader', 'helper'],
    experience: '1to3',
    area: 'vashi',
    travelKm: 15,
    availability: 'today',
    languages: ['mr', 'hi'],
    workExamples: [],
    prefersLongTerm: false,
  },
];

