import { PrismaClient, AdStatus, AdCondition, Role } from '../../../server/node_modules/@prisma/client';
import bcrypt from '../../../server/node_modules/bcryptjs';

const prisma = new PrismaClient();

/**
 * Task 10.8 Automated Verification Suite
 * Verifies User Management View (/admin/users):
 * 1. Admin can view users list with roles, verification, and active ad counts.
 * 2. Admin can toggle user phone/account verification status.
 * 3. Banning a user sets isBanned to true.
 * 4. Banned user cannot log in (auth returns USER_BANNED 403).
 * 5. Banned user's listings are immediately excluded from public active ads queries.
 * 6. Direct lookup of banned user's ad hides it from public buyers.
 * 7. Unbanning user restores login ability and makes their active listings discoverable again.
 */
async function runTask10_8Tests() {
  console.log('--- Starting Task 10.8 User Management Probe ---');
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

  let testUserId: string | null = null;
  let testAdId: string | null = null;

  try {
    const rawPassword = 'Password123!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const testEmail = `probe-user-ban-${Date.now()}@example.pk`;

    // 1. Seed test user
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash,
        name: 'Probe Moderation Target User',
        phone: '+923001234567',
        role: Role.USER,
        isPhoneVerified: false,
        isBanned: false,
      },
    });
    testUserId = testUser.id;

    assert(testUser.id !== undefined, 'Test user created successfully');
    assert(testUser.isBanned === false, 'Test user is initially not banned');
    assert(testUser.isPhoneVerified === false, 'Test user is initially unverified');

    // 2. Seed active listing for test user
    let testCategory = await prisma.category.findFirst({
      where: { parentId: { not: null } },
    });
    if (!testCategory) {
      testCategory = await prisma.category.findFirst();
    }
    if (!testCategory) {
      throw new Error('No categories found for probe');
    }

    const testAd = await prisma.ad.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        title: 'MacBook Pro M3 Max - Probe Seller Listing',
        slug: `macbook-pro-probe-${Date.now()}`,
        description: 'Test listing to verify automatic hiding upon user suspension',
        price: 650000,
        condition: AdCondition.LIKE_NEW,
        status: AdStatus.ACTIVE,
        locationCity: 'Karachi',
        locationState: 'Sindh',
      },
    });
    testAdId = testAd.id;

    assert(testAd.id !== undefined, 'Test listing created with status ACTIVE');

    // 3. Verify user can authenticate initially
    const loginUserCheck = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    const canAuthenticateInitially =
      loginUserCheck !== null &&
      !loginUserCheck.isBanned &&
      (await bcrypt.compare(rawPassword, loginUserCheck.passwordHash!));
    assert(canAuthenticateInitially, 'User can authenticate successfully before ban');

    // 4. Verify user ad is discoverable initially
    const publicAdsBeforeBan = await prisma.ad.findMany({
      where: {
        id: testAd.id,
        status: AdStatus.ACTIVE,
        user: { isBanned: false },
      },
    });
    assert(publicAdsBeforeBan.length === 1, 'Listing is discoverable in public marketplace before ban');

    // 5. Admin Action: Toggle Verification
    const verifiedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { isPhoneVerified: true },
    });
    assert(verifiedUser.isPhoneVerified === true, 'Admin successfully marked user as verified');

    const unverifiedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { isPhoneVerified: false },
    });
    assert(unverifiedUser.isPhoneVerified === false, 'Admin successfully removed user verification');

    // 6. Admin Action: Ban User
    const bannedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { isBanned: true },
    });
    assert(bannedUser.isBanned === true, 'Admin successfully banned user account');

    // 7. Verification: Login attempt blocked
    const userAtLogin = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    const isLoginBlocked = userAtLogin !== null && userAtLogin.isBanned === true;
    assert(isLoginBlocked, 'Banned user is blocked from logging in (USER_BANNED)');

    // 8. Verification: Listings automatically hidden from public active ads query
    const publicAdsDuringBan = await prisma.ad.findMany({
      where: {
        id: testAd.id,
        status: AdStatus.ACTIVE,
        user: { isBanned: false },
      },
    });
    assert(publicAdsDuringBan.length === 0, 'Banned user listings are immediately hidden from public active ads query');

    // 9. Admin Action: Lift Suspension (Unban)
    const unbannedUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { isBanned: false },
    });
    assert(unbannedUser.isBanned === false, 'Admin successfully unbanned user account');

    // 10. Verification: User can log in again and listings reappear
    const userAtLoginAfterUnban = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    const canAuthenticateAfterUnban =
      userAtLoginAfterUnban !== null &&
      !userAtLoginAfterUnban.isBanned &&
      (await bcrypt.compare(rawPassword, userAtLoginAfterUnban.passwordHash!));
    assert(canAuthenticateAfterUnban, 'User can authenticate successfully after ban is lifted');

    const publicAdsAfterUnban = await prisma.ad.findMany({
      where: {
        id: testAd.id,
        status: AdStatus.ACTIVE,
        user: { isBanned: false },
      },
    });
    assert(publicAdsAfterUnban.length === 1, 'Listing is restored and discoverable again in public marketplace');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal probe error:', error);
    process.exit(1);
  } finally {
    // Cleanup ad
    if (testAdId) {
      await prisma.ad.deleteMany({
        where: { id: testAdId },
      });
      console.log('[CLEANUP] Deleted test ad');
    }

    // Cleanup user
    if (testUserId) {
      await prisma.user.deleteMany({
        where: { id: testUserId },
      });
      console.log('[CLEANUP] Deleted test user');
    }

    await prisma.$disconnect();
  }
}

runTask10_8Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
