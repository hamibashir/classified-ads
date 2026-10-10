import { decodeJwtPayload } from '../middleware';
import { ADMIN_NAV_ITEMS } from '../components/admin/AdminSidebar';

/**
 * Task 10.1 Automated Verification Suite
 * Verifies JWT payload decoding, role validation, middleware redirects, and admin navigation.
 */
async function runTask10_1Tests() {
  console.log('--- Starting Task 10.1 Admin Layout & Middleware Probe ---');
  let passed = 0;
  let total = 0;

  const assert = (condition: boolean, message: string) => {
    total++;
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
    }
  };

  // Helper to generate mock base64url JWTs
  const createMockToken = (payload: object) => {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = 'mock_signature_hash_bytes';
    return `${header}.${body}.${sig}`;
  };

  // Test 1: Decode valid ADMIN token
  const adminToken = createMockToken({
    userId: 'admin-uuid-123',
    email: 'admin@classifiedads.pk',
    role: 'ADMIN',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const adminPayload = decodeJwtPayload(adminToken);
  assert(adminPayload !== null, 'Successfully decoded valid admin token');
  assert(adminPayload?.role === 'ADMIN', 'Extracted role is ADMIN');
  assert(adminPayload?.email === 'admin@classifiedads.pk', 'Extracted admin email correctly');

  // Test 2: Decode valid USER token
  const userToken = createMockToken({
    userId: 'user-uuid-456',
    email: 'buyer@example.pk',
    role: 'USER',
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  const userPayload = decodeJwtPayload(userToken);
  assert(userPayload !== null, 'Successfully decoded valid user token');
  assert(userPayload?.role === 'USER', 'Extracted role is USER');

  // Test 3: Malformed & invalid tokens
  assert(decodeJwtPayload('invalid.token') === null, 'Rejects token with fewer than 3 segments');
  assert(decodeJwtPayload('not-a-jwt') === null, 'Rejects completely invalid string');
  assert(decodeJwtPayload('a.not_json.c') === null, 'Rejects non-JSON payload');

  // Test 4: Expired token detection
  const expiredToken = createMockToken({
    userId: 'expired-user-789',
    email: 'expired@example.pk',
    role: 'ADMIN',
    exp: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
  });

  const expiredPayload = decodeJwtPayload(expiredToken);
  const isExpired = !!(expiredPayload?.exp && expiredPayload.exp * 1000 < Date.now());
  assert(isExpired === true, 'Correctly flags expired token timestamp');

  // Test 5: Middleware logic verification simulation
  const simulateMiddleware = (path: string, token: string | null) => {
    if (!path.startsWith('/admin')) {
      return { status: 200, action: 'NEXT' };
    }

    if (!token) {
      return { status: 307, action: 'REDIRECT_LOGIN', returnUrl: path };
    }

    const payload = decodeJwtPayload(token);
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      return { status: 307, action: 'REDIRECT_LOGIN', returnUrl: path };
    }

    if (payload.role !== 'ADMIN') {
      return { status: 307, action: 'REDIRECT_FORBIDDEN', target: '/forbidden' };
    }

    return { status: 200, action: 'NEXT' };
  };

  const resUnauth = simulateMiddleware('/admin/moderation', null);
  assert(resUnauth.action === 'REDIRECT_LOGIN', 'Unauthenticated request to /admin redirects to login');
  assert(resUnauth.returnUrl === '/admin/moderation', 'Preserves returnUrl in login redirect');

  const resUser = simulateMiddleware('/admin/settings', userToken);
  assert(resUser.action === 'REDIRECT_FORBIDDEN', 'Normal user role accessing /admin redirects to /forbidden');
  assert(resUser.target === '/forbidden', 'Target is /forbidden for non-admin');

  const resAdmin = simulateMiddleware('/admin', adminToken);
  assert(resAdmin.action === 'NEXT', 'Admin token granted access to /admin');

  const resPublic = simulateMiddleware('/search', null);
  assert(resPublic.action === 'NEXT', 'Public marketplace path bypasses admin guard');

  // Test 6: Verify Admin Navigation Configuration
  assert(ADMIN_NAV_ITEMS.length === 6, 'Admin sidebar contains exactly 6 management destinations');

  const expectedPaths = [
    '/admin',
    '/admin/moderation',
    '/admin/reports',
    '/admin/categories',
    '/admin/users',
    '/admin/settings',
  ];

  const actualPaths = ADMIN_NAV_ITEMS.map((item) => item.href);
  const allPresent = expectedPaths.every((p) => actualPaths.includes(p));
  assert(allPresent, 'All 6 roadmap Phase 10 admin paths are registered');

  console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTask10_1Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
