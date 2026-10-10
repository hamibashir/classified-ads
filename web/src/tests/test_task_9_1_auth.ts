import {
  loginSchema,
  registerSchema,
  normalizePakistaniPhone,
  isValidPakistaniMobile,
  getSafeRedirectUrl,
} from '../lib/validations/auth';

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

async function runAuthTests() {
  console.log('\n========================================');
  console.log('--- Task 9.1: Auth & Validation Test Suite ---');
  console.log('========================================\n');

  // 1. Login Schema Tests
  console.log('[Suite 1: Login Schema Validation]');
  const validLogin = loginSchema.safeParse({
    email: 'test.user@classifiedads.pk',
    password: 'password123',
    rememberMe: true,
  });
  assert(validLogin.success, 'Valid login credentials pass');

  const invalidEmailLogin = loginSchema.safeParse({
    email: 'not-an-email',
    password: 'password123',
  });
  assert(!invalidEmailLogin.success, 'Invalid email rejected');
  if (!invalidEmailLogin.success) {
    assert(
      invalidEmailLogin.error.issues.some((i) => i.path[0] === 'email'),
      'Email error issue path is correctly set'
    );
  }

  const shortPasswordLogin = loginSchema.safeParse({
    email: 'valid@example.com',
    password: '123',
  });
  assert(!shortPasswordLogin.success, 'Short password (<6 chars) rejected');

  // 2. Register Schema Tests
  console.log('\n[Suite 2: Register Schema Validation]');
  const validRegister = registerSchema.safeParse({
    name: 'Muhammad Tariq',
    email: 'tariq@gmail.com',
    phone: '0300 1234567',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    agreeTerms: true,
  });
  assert(validRegister.success, 'Valid registration payload passes');

  const shortNameRegister = registerSchema.safeParse({
    name: 'A',
    email: 'valid@gmail.com',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    agreeTerms: true,
  });
  assert(!shortNameRegister.success, 'Short name (<2 chars) rejected');

  const mismatchedPasswordRegister = registerSchema.safeParse({
    name: 'Muhammad Tariq',
    email: 'tariq@gmail.com',
    password: 'securePassword123',
    confirmPassword: 'differentPassword456',
    agreeTerms: true,
  });
  assert(!mismatchedPasswordRegister.success, 'Password mismatch rejected');
  if (!mismatchedPasswordRegister.success) {
    const issue = mismatchedPasswordRegister.error.issues.find(
      (i) => i.path[0] === 'confirmPassword'
    );
    assert(
      issue?.message === 'Passwords do not match',
      'Accurate password mismatch error message'
    );
  }

  const termsRejected = registerSchema.safeParse({
    name: 'Muhammad Tariq',
    email: 'tariq@gmail.com',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    agreeTerms: false,
  });
  assert(!termsRejected.success, 'Unaccepted terms rejected');

  // 3. Pakistani Mobile Number Validation
  console.log('\n[Suite 3: Pakistani Mobile Number Validation]');
  assert(isValidPakistaniMobile('03001234567'), '03001234567 is valid');
  assert(isValidPakistaniMobile('+923001234567'), '+923001234567 is valid');
  assert(isValidPakistaniMobile('0321-9876543'), '0321-9876543 formatted is valid');
  assert(isValidPakistaniMobile('+92 345 1122334'), '+92 345 1122334 formatted is valid');
  assert(!isValidPakistaniMobile('02131234567'), 'Landline 021 prefix is rejected');
  assert(!isValidPakistaniMobile('123456'), 'Too short number is rejected');
  assert(!isValidPakistaniMobile('+14155552671'), 'US phone number is rejected');

  assert(
    normalizePakistaniPhone('0300 - 1234567') === '03001234567',
    'normalizePakistaniPhone strips spaces and hyphens'
  );

  // 4. Open-Redirect Guard & URL Sanitization
  console.log('\n[Suite 4: Safe Redirect URL Sanitization]');
  assert(getSafeRedirectUrl('/ads/toyota-corolla') === '/ads/toyota-corolla', 'Internal ad path preserved');
  assert(getSafeRedirectUrl('/post-ad') === '/post-ad', 'Internal /post-ad preserved');
  assert(getSafeRedirectUrl('/search?category=mobiles') === '/search?category=mobiles', 'Internal query preserved');
  assert(getSafeRedirectUrl('https://evil-hacker.com') === '/', 'External absolute URL sanitized to /');
  assert(getSafeRedirectUrl('//evil-hacker.com') === '/', 'Protocol-relative URL sanitized to /');
  assert(getSafeRedirectUrl('/\\evil-hacker.com') === '/', 'Backslash bypass URL sanitized to /');
  assert(getSafeRedirectUrl('javascript:alert(1)') === '/', 'JavaScript scheme sanitized to /');
  assert(getSafeRedirectUrl('') === '/', 'Empty string sanitized to /');
  assert(getSafeRedirectUrl(null) === '/', 'Null sanitized to /');

  console.log('\n========================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
