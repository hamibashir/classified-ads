import {
  postAdStep1Schema,
  postAdStep2Schema,
  postAdBasicSchema,
  CONDITION_OPTIONS,
  getConditionLabel,
} from '../lib/validations/ad';
import { formatPKR, formatCompactPKR } from '../lib/formatters';

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

async function runPostAdTests() {
  console.log('\n========================================');
  console.log('--- Task 9.2: Post Ad Step 1 & 2 Test Suite ---');
  console.log('========================================\n');

  // 1. Step 1 Category Validation
  console.log('[Suite 1: Step 1 Category Selection Validation]');
  const validStep1 = postAdStep1Schema.safeParse({
    categoryId: 'cat-motors',
    subcategoryId: 'sub-cars',
  });
  assert(validStep1.success, 'Valid category and subcategory passes');

  const missingCategory = postAdStep1Schema.safeParse({
    categoryId: '',
    subcategoryId: 'sub-cars',
  });
  assert(!missingCategory.success, 'Missing parent category is rejected');

  const missingSubcategory = postAdStep1Schema.safeParse({
    categoryId: 'cat-motors',
    subcategoryId: '  ',
  });
  assert(!missingSubcategory.success, 'Empty subcategory is rejected');

  // 2. Step 2 Details Validation
  console.log('\n[Suite 2: Step 2 Ad Details Validation]');
  const validStep2 = postAdStep2Schema.safeParse({
    title: 'Honda Civic Oriel 2021 UG Black',
    description: 'Bumper to bumper original, genuine mileage, first owner car.',
    price: 5200000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'LIKE_NEW',
  });
  assert(validStep2.success, 'Valid ad details payload passes');

  const shortTitle = postAdStep2Schema.safeParse({
    title: 'Car',
    description: 'Valid description here with enough words and chars',
    price: 150000,
    condition: 'USED_GOOD',
  });
  assert(!shortTitle.success, 'Short title (<5 chars) is rejected');

  const longTitle = postAdStep2Schema.safeParse({
    title: 'A'.repeat(101),
    description: 'Valid description here with enough words and chars',
    price: 150000,
    condition: 'USED_GOOD',
  });
  assert(!longTitle.success, 'Title > 100 characters is rejected');

  const shortDesc = postAdStep2Schema.safeParse({
    title: 'Honda City 1.3 Automatic',
    description: 'Too short',
    price: 2500000,
    condition: 'USED_GOOD',
  });
  assert(!shortDesc.success, 'Description < 10 characters is rejected');

  const negativePrice = postAdStep2Schema.safeParse({
    title: 'Honda City 1.3 Automatic',
    description: 'Original paint in immaculate condition inside out.',
    price: -500,
    condition: 'USED_GOOD',
  });
  assert(!negativePrice.success, 'Negative price is rejected');

  const extremePrice = postAdStep2Schema.safeParse({
    title: 'Honda City 1.3 Automatic',
    description: 'Original paint in immaculate condition inside out.',
    price: 2000000000,
    condition: 'USED_GOOD',
  });
  assert(!extremePrice.success, 'Price exceeding 1 Billion PKR is rejected');

  // 3. Condition Enums & Helpers
  console.log('\n[Suite 3: Ad Condition Enums & Helpers]');
  const conditions = ['NEW', 'LIKE_NEW', 'USED_GOOD', 'USED_FAIR'] as const;
  for (const cond of conditions) {
    const res = postAdStep2Schema.safeParse({
      title: 'Valid Test Title for Item',
      description: 'Detailed description exceeding ten chars.',
      price: 1000,
      condition: cond,
    });
    assert(res.success, `Condition "${cond}" is supported`);
  }

  const invalidCondition = postAdStep2Schema.safeParse({
    title: 'Valid Test Title for Item',
    description: 'Detailed description exceeding ten chars.',
    price: 1000,
    condition: 'INVALID_STATUS',
  });
  assert(!invalidCondition.success, 'Invalid condition enum is rejected');

  assert(CONDITION_OPTIONS.length === 4, '4 condition presets available');
  assert(getConditionLabel('NEW') === 'Brand New', 'getConditionLabel(NEW) returns "Brand New"');
  assert(getConditionLabel('LIKE_NEW') === 'Like New', 'getConditionLabel(LIKE_NEW) returns "Like New"');

  // 4. Combined Basic Schema
  console.log('\n[Suite 4: Combined Steps 1 & 2 Schema]');
  const combinedValid = postAdBasicSchema.safeParse({
    categoryId: 'cat-mobiles',
    subcategoryId: 'sub-smartphones',
    title: 'Samsung Galaxy S23 Ultra 512GB',
    description: 'PTA Approved with original box and cable. 10/10 condition.',
    price: 295000,
    currency: 'PKR',
    isNegotiable: true,
    condition: 'LIKE_NEW',
  });
  assert(combinedValid.success, 'Combined Step 1 & 2 schema passes');

  // 5. Pakistani Price Formatter Verification
  console.log('\n[Suite 5: Pakistani Price Formatters]');
  assert(formatPKR(45000) === 'Rs 45,000', 'formatPKR(45000) formats to "Rs 45,000"');
  assert(formatCompactPKR(150000) === 'Rs 1.5 Lakh', 'formatCompactPKR(150000) formats to "Rs 1.5 Lakh"');
  assert(formatCompactPKR(25000000) === 'Rs 2.5 Crore', 'formatCompactPKR(25000000) formats to "Rs 2.5 Crore"');

  console.log('\n========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPostAdTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
