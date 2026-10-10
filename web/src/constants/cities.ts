import { PakistaniCity } from '@/types/location';

export const PAKISTANI_CITIES: PakistaniCity[] = [
  {
    id: 'karachi',
    name: 'Karachi',
    province: 'Sindh',
    coordinates: { latitude: 24.8607, longitude: 67.0011 },
    isPopular: true,
  },
  {
    id: 'lahore',
    name: 'Lahore',
    province: 'Punjab',
    coordinates: { latitude: 31.5204, longitude: 74.3587 },
    isPopular: true,
  },
  {
    id: 'islamabad',
    name: 'Islamabad',
    province: 'Islamabad Capital Territory',
    coordinates: { latitude: 33.6844, longitude: 73.0479 },
    isPopular: true,
  },
  {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    province: 'Punjab',
    coordinates: { latitude: 33.5651, longitude: 73.0169 },
    isPopular: true,
  },
  {
    id: 'faisalabad',
    name: 'Faisalabad',
    province: 'Punjab',
    coordinates: { latitude: 31.4504, longitude: 73.135 },
    isPopular: true,
  },
  {
    id: 'multan',
    name: 'Multan',
    province: 'Punjab',
    coordinates: { latitude: 30.1575, longitude: 71.5249 },
    isPopular: true,
  },
  {
    id: 'peshawar',
    name: 'Peshawar',
    province: 'Khyber Pakhtunkhwa',
    coordinates: { latitude: 34.0151, longitude: 71.5249 },
    isPopular: true,
  },
  {
    id: 'quetta',
    name: 'Quetta',
    province: 'Balochistan',
    coordinates: { latitude: 30.1798, longitude: 66.975 },
    isPopular: true,
  },
  {
    id: 'gujranwala',
    name: 'Gujranwala',
    province: 'Punjab',
    coordinates: { latitude: 32.1877, longitude: 74.1945 },
    isPopular: false,
  },
  {
    id: 'sialkot',
    name: 'Sialkot',
    province: 'Punjab',
    coordinates: { latitude: 32.4945, longitude: 74.5229 },
    isPopular: false,
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    province: 'Sindh',
    coordinates: { latitude: 25.396, longitude: 68.3578 },
    isPopular: false,
  },
  {
    id: 'abbottabad',
    name: 'Abbottabad',
    province: 'Khyber Pakhtunkhwa',
    coordinates: { latitude: 34.1688, longitude: 73.2215 },
    isPopular: false,
  },
  {
    id: 'bahawalpur',
    name: 'Bahawalpur',
    province: 'Punjab',
    coordinates: { latitude: 29.3544, longitude: 71.6911 },
    isPopular: false,
  },
];

export const DEFAULT_CITY: PakistaniCity = PAKISTANI_CITIES[1]; // Lahore

export const findCityByIdOrName = (identifier?: string | null): PakistaniCity => {
  if (!identifier) return DEFAULT_CITY;

  const normalized = identifier.trim().toLowerCase();
  const match = PAKISTANI_CITIES.find(
    (c) => c.id === normalized || c.name.toLowerCase() === normalized
  );

  return match || DEFAULT_CITY;
};
