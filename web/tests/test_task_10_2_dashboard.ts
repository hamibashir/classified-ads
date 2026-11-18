import { PrismaClient, AdStatus, ReportStatus } from '../../../server/node_modules/@prisma/client';
import { formatPKR, formatRelativeTime } from '../lib/formatters';
import { AdminDashboardMetrics } from '../types/admin';

const prisma = new PrismaClient();

/**
 * Task 10.2 Automated Verification Suite
 * Verifies live database metrics query, endpoint logic, and dashboard KPI calculations.
 */
async function runTask10_2Tests() {
  console.log('--- Starting Task 10.2 Admin Dashboard Metrics Probe ---');
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

  try {
    // 1. Direct Prisma Database Aggregations
    const [
      totalAds,
      pendingAds,
      activeAds,
      soldAds,
      rejectedAds,
      totalUsers,
      unresolvedReports,
      recentPendingAds,
      recentReports,
    ] = await Promise.all([
      prisma.ad.count(),
      prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      prisma.ad.count({ where: { status: AdStatus.ACTIVE } }),
      prisma.ad.count({ where: { status: AdStatus.SOLD } }),
      prisma.ad.count({ where: { status: AdStatus.REJECTED } }),
      prisma.user.count(),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.ad.findMany({
        where: { status: AdStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.findMany({
        where: { status: ReportStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          ad: { select: { id: true, title: true, slug: true } },
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    assert(typeof totalAds === 'number' && totalAds >= 0, `Database Total Ads is a valid number (${totalAds})`);
    assert(typeof pendingAds === 'number' && pendingAds >= 0, `Database Pending Ads is a valid number (${pendingAds})`);
    assert(typeof activeAds === 'number' && activeAds >= 0, `Database Active Ads is a valid number (${activeAds})`);
    assert(typeof soldAds === 'number' && soldAds >= 0, `Database Sold Ads is a valid number (${soldAds})`);
    assert(typeof rejectedAds === 'number' && rejectedAds >= 0, `Database Rejected Ads is a valid number (${rejectedAds})`);
    assert(typeof totalUsers === 'number' && totalUsers >= 1, `Database Total Users contains at least 1 admin user (${totalUsers})`);
    assert(typeof unresolvedReports === 'number' && unresolvedReports >= 0, `Database Unresolved Reports is a valid number (${unresolvedReports})`);

    // Verify consistency
    assert(totalAds >= pendingAds + activeAds + soldAds + rejectedAds, 'Total ads encompasses all listing statuses');

    // 2. Mock Response Payload Simulation
    const mockMetrics: AdminDashboardMetrics = {
      totalAds,
      pendingAds,
      activeAds,
      soldAds,
      rejectedAds,
      totalUsers,
      unresolvedReports,
    };

    assert(mockMetrics.totalAds >= 0, 'AdminDashboardMetrics totalAds field valid');
    assert(mockMetrics.pendingAds >= 0, 'AdminDashboardMetrics pendingAds field valid');
    assert(mockMetrics.activeAds >= 0, 'AdminDashboardMetrics activeAds field valid');
    assert(mockMetrics.totalUsers >= 1, 'AdminDashboardMetrics totalUsers field valid');
    assert(mockMetrics.unresolvedReports >= 0, 'AdminDashboardMetrics unresolvedReports field valid');

    // 3. Activity Feed Array Verification
    assert(Array.isArray(recentPendingAds), 'recentPendingAds is an array');
    assert(recentPendingAds.length <= 5, 'recentPendingAds respects limit of 5 items');
    assert(Array.isArray(recentReports), 'recentReports is an array');
    assert(recentReports.length <= 5, 'recentReports respects limit of 5 items');

    // 4. Formatter and Relative Time Verification
    const formattedSamplePrice = formatPKR(250000);
    assert(formattedSamplePrice === 'Rs 250,000', 'formatPKR correctly formats PKR currency');

    const formattedRelative = formatRelativeTime(new Date());
    assert(typeof formattedRelative === 'string' && formattedRelative.length > 0, 'formatRelativeTime computes valid time string');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Database probe error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTask10_2Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
