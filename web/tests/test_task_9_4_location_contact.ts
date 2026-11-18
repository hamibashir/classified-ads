import {
  postAdStep4Schema,
  getProvinceForCity,
  CITY_PROVINCE_MAP,
} from '../lib/validations/ad';
import { PAKISTANI_CITIES, findCityByIdOrName } from '../constants/cities';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${testName}${errorDetail ? ` -> ${errorDetail}` : ''}`);
    failed++;
  }
}

async function runLocationContactTests() {
  console.log('\n========================================');
  console.log('--- Task 9.4: Location & Contact Test Suite ---');
  console.log('========================================\n');

  // 1. Step 4 Schema Validation
  console.log('[Suite 1: Step 4 Location & Contact Validation]');
  const validPayload = {
    locationCity: 'Lahore',
    locationState: 'Punjab',
    locationAddress: 'Gulberg III, Main Boulevard',
    latitude: 31.5204,
    longitude: 74.3587,
    sellerPhone: '03001234567',
    showPhone: true,
    allowWhatsapp: true,
  };
  const validResult = postAdStep4Schema.safeParse(validPayload);
  assert(validResult.success, 'Valid location and contact data passes schema');

  const emptyCityResult = postAdStep4Schema.safeParse({
    locationCity: '',
    locationAddress: 'Some area',
  });
  assert(!emptyCityResult.success, 'Empty city is rejected');

  const invalidLatResult = postAdStep4Schema.safeParse({
    locationCity: 'Karachi',
    latitude: 95.5,
  });
  assert(!invalidLatResult.success, 'Latitude > 90 is rejected');

  const invalidLngResult = postAdStep4Schema.safeParse({
    locationCity: 'Karachi',
    longitude: -195.5,
  });
  assert(!invalidLngResult.success, 'Longitude < -180 is rejected');

  const defaultsResult = postAdStep4Schema.safeParse({
    locationCity: 'Islamabad',
  });
  assert(defaultsResult.success, 'Minimal payload with city passes defaults');
  if (defaultsResult.success) {
    assert(defaultsResult.data.locationState === 'Punjab', 'Default state is set');
    assert(defaultsResult.data.showPhone === true, 'Default showPhone is true');
    assert(defaultsResult.data.allowWhatsapp === true, 'Default allowWhatsapp is true');
  }

  // 2. Pakistani Province Mapping
  console.log('\n[Suite 2: Pakistani City & Province Resolution]');
  assert(getProvinceForCity('Karachi') === 'Sindh', 'Karachi resolves to Sindh');
  assert(getProvinceForCity('Lahore') === 'Punjab', 'Lahore resolves to Punjab');
  assert(getProvinceForCity('Islamabad') === 'Islamabad Capital Territory', 'Islamabad resolves to ICT');
  assert(getProvinceForCity('Peshawar') === 'Khyber Pakhtunkhwa', 'Peshawar resolves to KPK');
  assert(getProvinceForCity('Quetta') === 'Balochistan', 'Quetta resolves to Balochistan');
  assert(getProvinceForCity('Rawalpindi') === 'Punjab', 'Rawalpindi resolves to Punjab');
  assert(getProvinceForCity('Faisalabad') === 'Punjab', 'Faisalabad resolves to Punjab');
  assert(getProvinceForCity('Multan') === 'Punjab', 'Multan resolves to Punjab');
  assert(getProvinceForCity('Hyderabad') === 'Sindh', 'Hyderabad resolves to Sindh');
  assert(getProvinceForCity('NonExistentCity') === 'Punjab', 'Unknown city falls back safely to Punjab');

  // 3. Pakistani Cities Catalog Integrity
  console.log('\n[Suite 3: Pakistani Cities Catalog & Coordinates]');
  assert(PAKISTANI_CITIES.length === 13, '13 major Pakistani cities cataloged');
  
  const lahoreCity = findCityByIdOrName('Lahore');
  assert(lahoreCity.name === 'Lahore', 'findCityByIdOrName finds Lahore by name');
  assert(lahoreCity.coordinates.latitude > 23 && lahoreCity.coordinates.latitude < 37, 'Lahore lat in Pakistan');
  assert(lahoreCity.coordinates.longitude > 60 && lahoreCity.coordinates.longitude < 78, 'Lahore lng in Pakistan');

  const karachiCity = findCityByIdOrName('karachi');
  assert(karachiCity.name === 'Karachi', 'findCityByIdOrName is case-insensitive');
  assert(karachiCity.province === 'Sindh', 'Karachi province is Sindh');

  // 4. City-Province Dictionary Coverage
  console.log('\n[Suite 4: City-Province Dictionary Coverage]');
  const mappedCities = Object.keys(CITY_PROVINCE_MAP);
  assert(mappedCities.length >= 13, 'All 13 cities mapped in CITY_PROVINCE_MAP');

  console.log('\n========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLocationContactTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
