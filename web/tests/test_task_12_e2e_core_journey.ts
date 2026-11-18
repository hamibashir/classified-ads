import { registerSchema, normalizePakistaniPhone, isValidPakistaniMobile } from '../lib/validations/auth';
import { createAdSchema } from '../lib/validations/ad';
import { calculateDistanceKm } from '../lib/geo-utils';
import { buildWhatsAppUrl, normalizePakistaniPhone as normalizeWhatsAppPhone } from '../lib/whatsapp';

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

async function runEndToEndCoreJourneyTests() {
  console.log('\n======================================================');
  console.log('--- Task 12.3 & 12.4: End-to-End User Journey & Security ---');
  console.log('======================================================\n');

  // Step 1: User Account Registration & Sanitization
  console.log('[Step 1: User Account Registration & Sanitization]');
  const validRegister = registerSchema.safeParse({
    name: 'Muhammad Tariq',
    email: 'tariq.seller@classifiedads.pk',
    phone: '0301-7654321',
    password: 'Password#2026',
    confirmPassword: 'Password#2026',
    agreeTerms: true,
  });
  assert(validRegister.success, 'Valid registration with Pakistani mobile format succeeds');
  const normalizedPhone = normalizePakistaniPhone('0301-7654321');
  assert(normalizedPhone === '03017654321', 'Mobile phone normalized cleanly to digits');
  assert(isValidPakistaniMobile(normalizedPhone!), 'Pakistani mobile validator accepts 03017654321');

  // Step 2: Classified Ad Posting Flow
  console.log('\n[Step 2: Classified Ad Posting Flow]');
  const validAd = createAdSchema.safeParse({
    title: 'Suzuki Alto VXR 2021 Bumper to Bumper Original',
    description: 'First owner, maintained by Suzuki authorized dealership. In showroom condition with complete service history in Lahore.',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    price: 2450000,
    isNegotiable: true,
    condition: 'USED_GOOD',
    images: ['https://res.cloudinary.com/pk-ads/image/upload/alto1.jpg', 'https://res.cloudinary.com/pk-ads/image/upload/alto2.jpg'],
    locationCity: 'Lahore',
    locationState: 'Punjab',
    locationAddress: 'Model Town, Block C',
    latitude: 31.4822,
    longitude: 74.3182,
    showPhone: true,
    allowWhatsapp: true,
  });
  assert(validAd.success, 'Valid ad posting with GPS coordinates and images passes schema validation');

  // Step 3: Geolocation Proximity & Haversine Distance
  console.log('\n[Step 3: Geolocation Proximity & Haversine Distance]');
  // Distance between Model Town Lahore (31.4822, 74.3182) and Gulberg Lahore (31.5204, 74.3587)
  const distanceKm = calculateDistanceKm(
    { latitude: 31.4822, longitude: 74.3182 },
    { latitude: 31.5204, longitude: 74.3587 }
  );
  assert(distanceKm > 4.0 && distanceKm < 7.0, `Calculated realistic distance within Lahore: ${distanceKm.toFixed(2)} km`);

  // Distance to Islamabad should be ~270 km
  const distanceToIsb = calculateDistanceKm(
    { latitude: 31.4822, longitude: 74.3182 },
    { latitude: 33.6844, longitude: 73.0479 }
  );
  assert(distanceToIsb > 250 && distanceToIsb < 300, `Inter-city distance to Islamabad accurate: ${distanceToIsb.toFixed(1)} km`);

  // Step 4: WhatsApp Deep-linking & Phone Contact
  console.log('\n[Step 4: WhatsApp Deep-linking & Phone Contact]');
  const waPhone = normalizeWhatsAppPhone('03017654321');
  assert(waPhone === '923017654321', 'Local Pakistani phone converted to international MSISDN 923017654321');
  const waUrl = buildWhatsAppUrl('03017654321', 'Suzuki Alto VXR 2021');
  assert(waUrl.startsWith('https://wa.me/923017654321?text='), 'WhatsApp deep-link properly formatted');
  assert(waUrl.includes('Suzuki%20Alto%20VXR%202021'), 'Listing title URI-encoded in WhatsApp prompt');

  // Step 5: Security Defenses & Guardrails
  console.log('\n[Step 5: Security Defenses & Input Guardrails]');
  const negativePrice = createAdSchema.safeParse({
    title: 'Valid Car Title',
    description: 'Valid description with more than 10 characters',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    price: -50000,
    images: ['https://example.com/img.jpg'],
    locationCity: 'Karachi',
    locationState: 'Sindh',
  });
  assert(!negativePrice.success, 'Negative PKR price strictly rejected');

  const shortTitle = createAdSchema.safeParse({
    title: 'Alto',
    description: 'Valid description with more than 10 characters',
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    price: 1500000,
    images: ['https://example.com/img.jpg'],
    locationCity: 'Lahore',
  });
  assert(!shortTitle.success, 'Title shorter than 5 chars rejected');

  console.log('\n======================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEndToEndCoreJourneyTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
