/**
 * Demo city: Pune. Coordinates are approximate neighbourhood centres,
 * used only to estimate straight-line distance between areas.
 */
export type LocalityId =
  | 'shivajinagar'
  | 'kothrud'
  | 'hadapsar'
  | 'wakad'
  | 'hinjewadi'
  | 'kharadi'
  | 'swargate'
  | 'pimpri'
  | 'baner'
  | 'vimannagar'
  | 'katraj'
  | 'yerwada';

export interface Locality {
  id: LocalityId;
  name: { en: string; hi: string; mr: string };
  lat: number;
  lng: number;
}

export const LOCALITIES: Locality[] = [
  { id: 'shivajinagar', name: { en: 'Shivajinagar', hi: 'शिवाजीनगर', mr: 'शिवाजीनगर' }, lat: 18.53, lng: 73.847 },
  { id: 'kothrud', name: { en: 'Kothrud', hi: 'कोथरूड', mr: 'कोथरूड' }, lat: 18.507, lng: 73.807 },
  { id: 'hadapsar', name: { en: 'Hadapsar', hi: 'हडपसर', mr: 'हडपसर' }, lat: 18.508, lng: 73.926 },
  { id: 'wakad', name: { en: 'Wakad', hi: 'वाकड', mr: 'वाकड' }, lat: 18.598, lng: 73.765 },
  { id: 'hinjewadi', name: { en: 'Hinjewadi', hi: 'हिंजवडी', mr: 'हिंजवडी' }, lat: 18.591, lng: 73.738 },
  { id: 'kharadi', name: { en: 'Kharadi', hi: 'खराडी', mr: 'खराडी' }, lat: 18.551, lng: 73.94 },
  { id: 'swargate', name: { en: 'Swargate', hi: 'स्वारगेट', mr: 'स्वारगेट' }, lat: 18.501, lng: 73.858 },
  { id: 'pimpri', name: { en: 'Pimpri', hi: 'पिंपरी', mr: 'पिंपरी' }, lat: 18.627, lng: 73.8 },
  { id: 'baner', name: { en: 'Baner', hi: 'बाणेर', mr: 'बाणेर' }, lat: 18.559, lng: 73.786 },
  { id: 'vimannagar', name: { en: 'Viman Nagar', hi: 'विमान नगर', mr: 'विमान नगर' }, lat: 18.567, lng: 73.914 },
  { id: 'katraj', name: { en: 'Katraj', hi: 'कात्रज', mr: 'कात्रज' }, lat: 18.457, lng: 73.867 },
  { id: 'yerwada', name: { en: 'Yerwada', hi: 'येरवडा', mr: 'येरवडा' }, lat: 18.553, lng: 73.877 },
];

export const localityById = (id: LocalityId) => LOCALITIES.find((l) => l.id === id)!;

/** Straight-line distance in km (haversine). Real travel distance will be longer. */
export function distanceKm(a: LocalityId, b: LocalityId): number {
  if (a === b) return 0;
  const p = localityById(a);
  const q = localityById(b);
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(q.lat - p.lat);
  const dLng = toRad(q.lng - p.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(p.lat)) * Math.cos(toRad(q.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
