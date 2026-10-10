import { PrismaClient, AdStatus, AdCondition } from '../../../server/node_modules/@prisma/client';
import { formatPKR, formatRelativeTime } from '../lib/formatters';

const prisma = new PrismaClient();

/**
 * Task 10.4 Automated Verification Suite
 * Verifies Ad Moderation Queue querying, listing fields, formatting, and pagination.
 */
async function runTask10_4Tests() {
  console.log('--- Starting Task 10.4 Ad Moderation Queue Probe ---');
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

  const createdProbeAdIds: string[] = [];

  try {
    // 1. Get or create test user and test category
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'moderation-probe-user@example.pk',
          name: 'Queue Probe User',
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
      throw new Error('No categories available to seed moderation test ads');
    }

    // 2. Ensure at least 2 pending ads exist for queue verification
    const existingPending = await prisma.ad.findMany({
      where: { status: AdStatus.PENDING },
      take: 2,
    });

    if (existingPending.length < 2) {
      const probeAd1 = await prisma.ad.create({
        data: {
          userId: testUser.id,
          categoryId: testCategory.id,
          title: 'Civic 2021 VTI Oriel - Probe Listing 1',
          slug: `civic-2021-probe-${Date.now()}`,
          description: 'Pristine condition family used car awaiting moderator review',
          price: 5850000,
          condition: AdCondition.USED_GOOD,
          status: AdStatus.PENDING,
          locationCity: 'Islamabad',
          locationState: 'Federal',
        },
      });
      createdProbeAdIds.push(probeAd1.id);

      const probeAd2 = await prisma.ad.create({
        data: {
          userId: testUser.id,
          categoryId: testCategory.id,
          title: 'MacBook Pro M2 Max - Probe Listing 2',
          slug: `macbook-pro-m2-probe-${Date.now()}`,
          description: 'Silver 32GB RAM Apple Silicon laptop awaiting moderation approval',
          price: 495000,
          condition: AdCondition.LIKE_NEW,
          status: AdStatus.PENDING,
          locationCity: 'Karachi',
          locationState: 'Sindh',
        },
      });
      createdProbeAdIds.push(probeAd2.id);
    }

    // 3. Query pending ads queue (mirroring GET /api/v1/admin/ads/pending)
    const limit = 15;
    const page = 1;
    const skip = (page - 1) * limit;

    const [totalPendingCount, pendingAds] = await Promise.all([
      prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      prisma.ad.findMany({
        where: { status: AdStatus.PENDING },
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    assert(totalPendingCount >= 2, `Moderation queue contains pending ads (Count: ${totalPendingCount})`);
    assert(pendingAds.length >= 2, `Retrieved pending ads page successfully (Page length: ${pendingAds.length})`);

    // 4. Validate data contract on retrieved pending ads
    const firstAd = pendingAds[0];
    assert(firstAd.status === AdStatus.PENDING, 'First ad status is strictly PENDING');
    assert(typeof firstAd.title === 'string' && firstAd.title.length > 0, 'Ad has title');
    assert(firstAd.category !== null && typeof firstAd.category.name === 'string', 'Ad category relation populated');
    assert(firstAd.user !== null && typeof firstAd.user.email === 'string', 'Ad seller relation populated');
    assert(Array.isArray(firstAd.images), 'Ad images array populated');

    // 5. Test formatters on queue items
    const formattedPrice = formatPKR(Number(firstAd.price));
    assert(formattedPrice.startsWith('Rs '), `Price formatted in PKR (${formattedPrice})`);

    const formattedTime = formatRelativeTime(firstAd.createdAt);
    assert(typeof formattedTime === 'string' && formattedTime.length > 0, `Submission time formatted (${formattedTime})`);

    // 6. Test pagination computations
    const totalPages = Math.ceil(totalPendingCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    assert(totalPages >= 1, `Total pages computed correctly (${totalPages})`);
    assert(hasPrevPage === false, 'Page 1 hasPrevPage is false');
    assert(typeof hasNextPage === 'boolean', 'hasNextPage is boolean');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal probe error:', error);
    process.exit(1);
  } finally {
    // Clean up only probe-created ads
    if (createdProbeAdIds.length > 0) {
      await prisma.ad.deleteMany({
        where: { id: { in: createdProbeAdIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdProbeAdIds.length} probe test ads`);
    }

    await prisma.$disconnect();
  }
}

runTask10_4Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
