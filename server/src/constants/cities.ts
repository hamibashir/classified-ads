export interface CityData {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  isPopular: boolean;
}

export const PAKISTANI_CITIES: CityData[] = [
  { name: 'Karachi', province: 'Sindh', latitude: 24.8607, longitude: 67.0011, isPopular: true },
  { name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587, isPopular: true },
  { name: 'Islamabad', province: 'Islamabad Capital Territory', latitude: 33.6844, longitude: 73.0479, isPopular: true },
  { name: 'Rawalpindi', province: 'Punjab', latitude: 33.5651, longitude: 73.0169, isPopular: true },
  { name: 'Faisalabad', province: 'Punjab', latitude: 31.4504, longitude: 73.1350, isPopular: true },
  { name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249, isPopular: true },
  { name: 'Peshawar', province: 'Khyber Pakhtunkhwa', latitude: 34.0151, longitude: 71.5249, isPopular: true },
  { name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.9750, isPopular: true },
  { name: 'Gujranwala', province: 'Punjab', latitude: 32.1877, longitude: 74.1945, isPopular: false },
  { name: 'Sialkot', province: 'Punjab', latitude: 32.4945, longitude: 74.5229, isPopular: false },
  { name: 'Hyderabad', province: 'Sindh', latitude: 25.3960, longitude: 68.3578, isPopular: false },
  { name: 'Abbottabad', province: 'Khyber Pakhtunkhwa', latitude: 34.1688, longitude: 73.2215, isPopular: false },
  { name: 'Bahawalpur', province: 'Punjab', latitude: 29.3544, longitude: 71.6911, isPopular: false },
];
