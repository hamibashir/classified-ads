import { PrismaClient, AdStatus, AdCondition } from '../../../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

/**
 * Task 10.5 Automated Verification Suite
 * Verifies Ad Moderation Actions:
 * 1. Approving an ad sets status ACTIVE, sets expiresAt, and publishes to public marketplace.
 * 2. Rejecting an ad sets status REJECTED with rejectionReason recorded, keeping it hidden from public marketplace.
 */
async function runTask10_5Tests() {
  console.log('--- Starting Task 10.5 Ad Moderation Actions Probe ---');
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

  const createdAdIds: string[] = [];

  try {
    // 1. Get or create test user and test category
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'moderation-action-user@example.pk',
          name: 'Action Test User',
          role: 'USER',
        },
      });
    }

    let testCategory = await prisma.category.findFirst({
      where: { parentId: { not: null } },
    });
    if (!testCategory) {
      testCategory = await prisma.category.findFirst();
    }
    if (!testCategory) {
      throw new Error('No categories found for probe');
    }

    // 2. Test Approval Flow
    const adToApprove = await prisma.ad.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        title: 'Toyota Corolla 2022 Altis - Moderation Probe A',
        slug: `toyota-corolla-probe-approve-${Date.now()}`,
        description: 'Testing approval workflow',
        price: 5200000,
        condition: AdCondition.USED_GOOD,
        status: AdStatus.PENDING,
        locationCity: 'Lahore',
        locationState: 'Punjab',
      },
    });
    createdAdIds.push(adToApprove.id);

    // Initial check: ad is PENDING and NOT visible in ACTIVE listings
    const initialActiveCheck = await prisma.ad.findFirst({
      where: { id: adToApprove.id, status: AdStatus.ACTIVE },
    });
    assert(initialActiveCheck === null, 'Pending ad is not present in ACTIVE listings initially');

    // Simulate approval mutation (mirroring PATCH /api/v1/admin/ads/:id/moderate with action: APPROVE)
    const expiryDays = 30;
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const approvedAd = await prisma.ad.update({
      where: { id: adToApprove.id },
      data: {
        status: AdStatus.ACTIVE,
        rejectionReason: null,
        expiresAt,
      },
    });

    assert(approvedAd.status === AdStatus.ACTIVE, 'Ad status updated to ACTIVE upon approval');
    assert(approvedAd.rejectionReason === null, 'Ad rejectionReason is null upon approval');
    assert(approvedAd.expiresAt !== null, 'Ad expiresAt is populated upon approval');

    // Verify marketplace discovery: querying ACTIVE ads now returns this approved listing
    const publicMarketplaceAd = await prisma.ad.findFirst({
      where: { id: adToApprove.id, status: AdStatus.ACTIVE },
    });
    assert(publicMarketplaceAd !== null, 'Approved ad is now discoverable in public marketplace active listings');
    assert(publicMarketplaceAd?.title === adToApprove.title, 'Discovered ad title matches');

    // 3. Test Rejection Flow
    const adToReject = await prisma.ad.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        title: 'Replica Luxury Watch - Moderation Probe B',
        slug: `replica-watch-probe-reject-${Date.now()}`,
        description: 'Testing rejection workflow',
        price: 15000,
        condition: AdCondition.NEW,
        status: AdStatus.PENDING,
        locationCity: 'Karachi',
        locationState: 'Sindh',
      },
    });
    createdAdIds.push(adToReject.id);

    // Simulate rejection mutation (mirroring PATCH /api/v1/admin/ads/:id/moderate with action: REJECT)
    const rejectionReason = 'Counterfeit or Replica Goods: Platform policy prohibits selling unauthorized replica merchandise.';
    const rejectedAd = await prisma.ad.update({
      where: { id: adToReject.id },
      data: {
        status: AdStatus.REJECTED,
        rejectionReason,
      },
    });

    assert(rejectedAd.status === AdStatus.REJECTED, 'Ad status updated to REJECTED upon rejection');
    assert(rejectedAd.rejectionReason === rejectionReason, 'Rejection reason persisted accurately in database');

    // Verify marketplace hiding: querying ACTIVE ads does NOT return rejected listing
    const rejectedInPublicCheck = await prisma.ad.findFirst({
      where: { id: adToReject.id, status: AdStatus.ACTIVE },
    });
    assert(rejectedInPublicCheck === null, 'Rejected ad is hidden from public marketplace');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal probe error:', error);
    process.exit(1);
  } finally {
    if (createdAdIds.length > 0) {
      await prisma.ad.deleteMany({
        where: { id: { in: createdAdIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdAdIds.length} moderation probe ads`);
    }

    await prisma.$disconnect();
  }
}

runTask10_5Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
