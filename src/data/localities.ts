/**
 * Demo cities: Pune and Mumbai. Coordinates are approximate neighbourhood
 * centres, used only to estimate straight-line distance between areas.
 */
export type CityId = 'pune' | 'mumbai';
export const CITIES: CityId[] = ['pune', 'mumbai'];

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
  | 'yerwada'
  | 'dadar'
  | 'andheri'
  | 'bandra'
  | 'kurla'
  | 'ghatkopar'
  | 'chembur'
  | 'sion'
  | 'goregaon'
  | 'malad'
  | 'borivali'
  | 'thane'
  | 'vashi';

export interface Locality {
  id: LocalityId;
  city: CityId;
  name: { en: string; hi: string; mr: string };
  lat: number;
  lng: number;
}

export const LOCALITIES: Locality[] = [
  { id: 'shivajinagar', city: 'pune', name: { en: 'Shivajinagar', hi: 'शिवाजीनगर', mr: 'शिवाजीनगर' }, lat: 18.53, lng: 73.847 },
  { id: 'kothrud', city: 'pune', name: { en: 'Kothrud', hi: 'कोथरूड', mr: 'कोथरूड' }, lat: 18.507, lng: 73.807 },
  { id: 'hadapsar', city: 'pune', name: { en: 'Hadapsar', hi: 'हडपसर', mr: 'हडपसर' }, lat: 18.508, lng: 73.926 },
  { id: 'wakad', city: 'pune', name: { en: 'Wakad', hi: 'वाकड', mr: 'वाकड' }, lat: 18.598, lng: 73.765 },
  { id: 'hinjewadi', city: 'pune', name: { en: 'Hinjewadi', hi: 'हिंजवडी', mr: 'हिंजवडी' }, lat: 18.591, lng: 73.738 },
  { id: 'kharadi', city: 'pune', name: { en: 'Kharadi', hi: 'खराडी', mr: 'खराडी' }, lat: 18.551, lng: 73.94 },
  { id: 'swargate', city: 'pune', name: { en: 'Swargate', hi: 'स्वारगेट', mr: 'स्वारगेट' }, lat: 18.501, lng: 73.858 },
  { id: 'pimpri', city: 'pune', name: { en: 'Pimpri', hi: 'पिंपरी', mr: 'पिंपरी' }, lat: 18.627, lng: 73.8 },
  { id: 'baner', city: 'pune', name: { en: 'Baner', hi: 'बाणेर', mr: 'बाणेर' }, lat: 18.559, lng: 73.786 },
  { id: 'vimannagar', city: 'pune', name: { en: 'Viman Nagar', hi: 'विमान नगर', mr: 'विमान नगर' }, lat: 18.567, lng: 73.914 },
  { id: 'katraj', city: 'pune', name: { en: 'Katraj', hi: 'कात्रज', mr: 'कात्रज' }, lat: 18.457, lng: 73.867 },
  { id: 'yerwada', city: 'pune', name: { en: 'Yerwada', hi: 'येरवडा', mr: 'येरवडा' }, lat: 18.553, lng: 73.877 },
  { id: 'dadar', city: 'mumbai', name: { en: 'Dadar', hi: 'दादर', mr: 'दादर' }, lat: 19.018, lng: 72.843 },
  { id: 'andheri', city: 'mumbai', name: { en: 'Andheri', hi: 'अंधेरी', mr: 'अंधेरी' }, lat: 19.119, lng: 72.847 },
  { id: 'bandra', city: 'mumbai', name: { en: 'Bandra', hi: 'बांद्रा', mr: 'वांद्रे' }, lat: 19.059, lng: 72.84 },
  { id: 'kurla', city: 'mumbai', name: { en: 'Kurla', hi: 'कुर्ला', mr: 'कुर्ला' }, lat: 19.072, lng: 72.879 },
  { id: 'ghatkopar', city: 'mumbai', name: { en: 'Ghatkopar', hi: 'घाटकोपर', mr: 'घाटकोपर' }, lat: 19.086, lng: 72.908 },
  { id: 'chembur', city: 'mumbai', name: { en: 'Chembur', hi: 'चेंबूर', mr: 'चेंबूर' }, lat: 19.062, lng: 72.9 },
  { id: 'sion', city: 'mumbai', name: { en: 'Sion', hi: 'सायन', mr: 'शीव' }, lat: 19.04, lng: 72.862 },
  { id: 'goregaon', city: 'mumbai', name: { en: 'Goregaon', hi: 'गोरेगांव', mr: 'गोरेगाव' }, lat: 19.164, lng: 72.849 },
  { id: 'malad', city: 'mumbai', name: { en: 'Malad', hi: 'मलाड', mr: 'मालाड' }, lat: 19.187, lng: 72.849 },
  { id: 'borivali', city: 'mumbai', name: { en: 'Borivali', hi: 'बोरीवली', mr: 'बोरिवली' }, lat: 19.229, lng: 72.857 },
  { id: 'thane', city: 'mumbai', name: { en: 'Thane', hi: 'ठाणे', mr: 'ठाणे' }, lat: 19.218, lng: 72.978 },
  { id: 'vashi', city: 'mumbai', name: { en: 'Vashi (Navi Mumbai)', hi: 'वाशी (नवी मुंबई)', mr: 'वाशी (नवी मुंबई)' }, lat: 19.077, lng: 72.999 },
];

export const localityById = (id: LocalityId) => LOCALITIES.find((l) => l.id === id)!;
export const localitiesIn = (city: CityId) => LOCALITIES.filter((l) => l.city === city);

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
