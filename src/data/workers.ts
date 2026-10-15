import type { LocalityId } from './localities';
import type { TradeId } from './trades';

export type Experience = 'new' | '1to3' | '3to10' | '10plus';
export type Availability = 'today' | 'this_week' | 'not_now';
export type Lang = 'en' | 'hi' | 'mr';

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
];
