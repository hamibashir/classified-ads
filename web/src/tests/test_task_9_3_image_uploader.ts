import {
  postAdStep3Schema,
  reorderImages,
  setCoverImage,
  MAX_AD_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  AdImageItem,
} from '../lib/validations/ad';

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

async function runImageUploaderTests() {
  console.log('\n========================================');
  console.log('--- Task 9.3: Image Uploader Test Suite ---');
  console.log('========================================\n');

  // 1. Image Schema Validation
  console.log('[Suite 1: Step 3 Image Validation Schema]');
  const validImages: AdImageItem[] = [
    { url: '/uploads/front-view.jpg', order: 0, publicId: 'front-123' },
    { url: '/uploads/back-view.jpg', order: 1, publicId: 'back-456' },
    { url: '/uploads/interior.jpg', order: 2, publicId: 'int-789' },
  ];
  const validResult = postAdStep3Schema.safeParse({ images: validImages });
  assert(validResult.success, 'Valid array of 3 images passes schema');

  const emptyResult = postAdStep3Schema.safeParse({ images: [] });
  assert(!emptyResult.success, 'Empty images array is rejected (minimum 1 required)');

  const maxImagesList: AdImageItem[] = Array.from({ length: 8 }, (_, i) => ({
    url: `/uploads/img-${i}.jpg`,
    order: i,
  }));
  const maxResult = postAdStep3Schema.safeParse({ images: maxImagesList });
  assert(maxResult.success, '8 images (boundary limit) passes schema');

  const excessImagesList: AdImageItem[] = Array.from({ length: 9 }, (_, i) => ({
    url: `/uploads/img-${i}.jpg`,
    order: i,
  }));
  const excessResult = postAdStep3Schema.safeParse({ images: excessImagesList });
  assert(!excessResult.success, '9 images (>8 limit) is rejected');

  const emptyUrlResult = postAdStep3Schema.safeParse({
    images: [{ url: '', order: 0 }],
  });
  assert(!emptyUrlResult.success, 'Image with empty URL is rejected');

  // 2. Reordering Logic
  console.log('\n[Suite 2: Image Reordering & Normalization]');
  const sampleList: AdImageItem[] = [
    { url: 'photo-a.jpg', order: 0 },
    { url: 'photo-b.jpg', order: 1 },
    { url: 'photo-c.jpg', order: 2 },
  ];

  // Move index 2 (photo-c) to index 0
  const reordered = reorderImages(sampleList, 2, 0);
  assert(reordered.length === 3, 'Length preserved after reordering');
  assert(reordered[0].url === 'photo-c.jpg', 'Item moved to target index 0');
  assert(reordered[1].url === 'photo-a.jpg', 'Subsequent item shifted to index 1');
  assert(reordered[2].url === 'photo-b.jpg', 'Subsequent item shifted to index 2');
  assert(
    reordered[0].order === 0 && reordered[1].order === 1 && reordered[2].order === 2,
    'Order indices normalized to 0, 1, 2'
  );

  // Set Cover Photo helper
  const covered = setCoverImage(sampleList, 1); // photo-b becomes cover
  assert(covered[0].url === 'photo-b.jpg', 'setCoverImage places target at index 0');
  assert(covered[0].order === 0, 'New cover photo has order 0');

  // Out of bounds safety
  const safeOOB = reorderImages(sampleList, -1, 5);
  assert(safeOOB === sampleList, 'Out-of-bounds indices returns original array safely');

  // 3. Constants and File Constraints
  console.log('\n[Suite 3: File Upload Constraints]');
  assert(MAX_AD_IMAGES === 8, 'MAX_AD_IMAGES is set to 8');
  assert(MAX_IMAGE_SIZE_BYTES === 5242880, 'MAX_IMAGE_SIZE_BYTES is exactly 5MB (5,242,880 bytes)');
  assert(ALLOWED_IMAGE_TYPES.includes('image/jpeg'), 'JPEG format supported');
  assert(ALLOWED_IMAGE_TYPES.includes('image/png'), 'PNG format supported');
  assert(ALLOWED_IMAGE_TYPES.includes('image/webp'), 'WebP format supported');
  assert(!ALLOWED_IMAGE_TYPES.includes('image/gif'), 'GIF format excluded for classified ads');
  assert(!ALLOWED_IMAGE_TYPES.includes('application/pdf'), 'PDF format excluded');

  console.log('\n========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runImageUploaderTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
