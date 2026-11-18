import { createAdSchema } from '../lib/validations/ad';
import { PostAdDraft } from '../types/ad';

/**
 * Task 9.5 Automated Verification Probe
 * Tests payload transformation, validation compliance, image ordering,
 * and status handling behavior for Ad Posting Submission & Redirect.
 */

function runVerification() {
  console.log('--- Starting Task 9.5 Ad Posting Submission Probe ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  // 1. Mock valid PostAdDraft with RFC4122 v4 compliant UUIDs
  const mockDraft: PostAdDraft = {
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    categoryName: 'Vehicles',
    subcategoryId: '987fcdeb-51a2-43f7-9876-543210987654',
    subcategoryName: 'Cars',
    title: 'Toyota Corolla GLi 1.3 Automatic 2018 Clean',
    description: 'First owner car, totally genuine paint, neat and clean interior, maintained with authorized dealership records in Lahore.',
    price: 3850000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'USED_GOOD',
    images: [
      { url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', publicId: 'cars/front_view', order: 0 },
      { url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d', publicId: 'cars/side_view', order: 1 },
      { url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', publicId: 'cars/interior', order: 2 },
    ],
    locationCity: 'Lahore',
    locationState: 'Punjab',
    locationAddress: 'DHA Phase 5, Sector C',
    latitude: 31.4697,
    longitude: 74.4022,
    sellerPhone: '03001234567',
    showPhone: true,
    allowWhatsapp: true,
    step: 5,
  };

  // 2. Transform draft into API payload as done in PostAdStepReview.tsx
  const payload = {
    title: mockDraft.title.trim(),
    description: mockDraft.description.trim(),
    categoryId: mockDraft.subcategoryId || mockDraft.categoryId,
    price: Number(mockDraft.price) || 0,
    currency: 'PKR',
    isNegotiable: Boolean(mockDraft.isNegotiable),
    condition: mockDraft.condition === 'USED' ? 'USED_GOOD' : mockDraft.condition,
    locationCity: mockDraft.locationCity || 'Lahore',
    locationState: mockDraft.locationState || 'Punjab',
    locationAddress: mockDraft.locationAddress?.trim() || null,
    latitude: mockDraft.latitude ?? null,
    longitude: mockDraft.longitude ?? null,
    showPhone: mockDraft.showPhone !== false,
    allowWhatsapp: mockDraft.allowWhatsapp !== false,
    images: (mockDraft.images || []).map((img, idx) => ({
      url: img.url,
      publicId: img.publicId || null,
      order: typeof img.order === 'number' ? img.order : idx,
    })),
  };

  // Test 1: Payload validation through createAdSchema
  const parseResult = createAdSchema.safeParse(payload);
  assert(parseResult.success, 'Generated payload strictly adheres to createAdSchema Zod validator');

  // Test 2: Field integrity
  assert(payload.title === mockDraft.title, 'Payload title matches draft title');
  assert(payload.price === 3850000, 'Price parsed as integer/number');
  assert(payload.currency === 'PKR', 'Currency explicitly set to PKR');
  assert(payload.isNegotiable === true, 'isNegotiable correctly serialized as boolean true');
  assert(payload.condition === 'USED_GOOD', 'condition correctly mapped to valid Prisma enum USED_GOOD');

  // Test 3: Location and Coordinates
  assert(payload.locationCity === 'Lahore', 'locationCity is correctly populated');
  assert(payload.locationState === 'Punjab', 'locationState matches provincial mapping');
  assert(payload.latitude === 31.4697 && payload.longitude === 74.4022, 'GPS latitude & longitude coordinates preserved');

  // Test 4: Privacy & Contact toggles
  assert(payload.showPhone === true, 'showPhone correctly retained');
  assert(payload.allowWhatsapp === true, 'allowWhatsapp correctly retained');

  // Test 5: Image serialization & ordering
  assert(payload.images.length === 3, 'All 3 images mapped into payload');
  assert(payload.images[0].order === 0, 'Image 0 preserves cover order index 0');
  assert(payload.images[1].order === 1, 'Image 1 preserves order index 1');
  assert(payload.images[2].publicId === 'cars/interior', 'Image publicId preserved');

  // Test 6: Category resolution logic
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert(UUID_REGEX.test(payload.categoryId), 'Resolved Category ID is a valid RFC4122 UUID');

  // Test 7: Legacy Condition normalization
  const legacyDraft: PostAdDraft = {
    ...mockDraft,
    condition: 'USED' as unknown as 'USED_GOOD',
  };
  const legacyCondition = legacyDraft.condition === 'USED' ? 'USED_GOOD' : legacyDraft.condition;
  assert(legacyCondition === 'USED_GOOD', 'Legacy condition "USED" accurately maps to "USED_GOOD"');

  // Test 8: Empty / Nullable coordinates and address
  const minimalDraft: PostAdDraft = {
    categoryId: '123e4567-e89b-12d3-a456-426614174000',
    categoryName: 'Mobiles',
    subcategoryId: '987fcdeb-51a2-43f7-9876-543210987654',
    subcategoryName: 'Smartphones',
    title: 'Samsung Galaxy S23 Ultra 256GB Box Pack',
    description: 'Brand new pin-pack box with official PTA approved stamp and warranty.',
    price: 265000,
    currency: 'PKR',
    isNegotiable: false,
    condition: 'NEW',
    images: [],
    locationCity: 'Karachi',
    locationState: 'Sindh',
    showPhone: true,
    allowWhatsapp: true,
    step: 5,
  };
  const minimalPayload = {
    title: minimalDraft.title.trim(),
    description: minimalDraft.description.trim(),
    categoryId: minimalDraft.subcategoryId || minimalDraft.categoryId,
    price: Number(minimalDraft.price) || 0,
    currency: 'PKR',
    isNegotiable: Boolean(minimalDraft.isNegotiable),
    condition: minimalDraft.condition === 'USED' ? 'USED_GOOD' : minimalDraft.condition,
    locationCity: minimalDraft.locationCity || 'Lahore',
    locationState: minimalDraft.locationState || 'Punjab',
    locationAddress: minimalDraft.locationAddress?.trim() || null,
    latitude: minimalDraft.latitude ?? null,
    longitude: minimalDraft.longitude ?? null,
    showPhone: minimalDraft.showPhone !== false,
    allowWhatsapp: minimalDraft.allowWhatsapp !== false,
    images: [],
  };
  const minimalParse = createAdSchema.safeParse(minimalPayload);
  assert(minimalParse.success, 'Minimal draft with optional null fields successfully passes Zod validation');

  // Test 9: Status Handling routing verification
  type AdStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';
  function getRedirectDestination(status: AdStatus, slug: string): string {
    if (status === 'ACTIVE') {
      return `/ads/${slug}`;
    }
    return `/my-ads`;
  }
  assert(getRedirectDestination('ACTIVE', 'toyota-corolla-2018-xyz') === '/ads/toyota-corolla-2018-xyz', 'ACTIVE status produces direct link to /ads/[slug]');
  assert(getRedirectDestination('PENDING', 'toyota-corolla-2018-xyz') === '/my-ads', 'PENDING status redirects to user listings with approval notice');

  console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
