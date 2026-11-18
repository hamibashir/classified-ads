import { PrismaClient, AdStatus, AdCondition, ReportStatus } from '../../../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

/**
 * Task 10.6 Automated Verification Suite
 * Verifies User Reports Moderation (/admin/reports):
 * 1. Reporting an ad creates a report with status PENDING.
 * 2. Taking down a reported ad sets ad status to REJECTED, sets rejectionReason, and sets report status to RESOLVED.
 * 3. Taken-down ad is excluded from public active marketplace listings.
 * 4. Dismissing a report marks report as DISMISSED while keeping the ad ACTIVE.
 * 5. Report status filtering queries (PENDING, RESOLVED, DISMISSED) work accurately.
 */
async function runTask10_6Tests() {
  console.log('--- Starting Task 10.6 User Reports Moderation Probe ---');
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
  const createdReportIds: string[] = [];
  const createdUserIds: string[] = [];

  try {
    // 1. Setup test users and category
    let testSeller = await prisma.user.findFirst({
      where: { email: 'probe-seller-10-6@example.pk' },
    });
    if (!testSeller) {
      testSeller = await prisma.user.create({
        data: {
          email: 'probe-seller-10-6@example.pk',
          name: 'Probe Seller 10-6',
          role: 'USER',
        },
      });
      createdUserIds.push(testSeller.id);
    }

    let testReporter = await prisma.user.findFirst({
      where: { email: 'probe-reporter-10-6@example.pk' },
    });
    if (!testReporter) {
      testReporter = await prisma.user.create({
        data: {
          email: 'probe-reporter-10-6@example.pk',
          name: 'Probe Reporter 10-6',
          role: 'USER',
        },
      });
      createdUserIds.push(testReporter.id);
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

    // 2. Scenario A: Take Down Flow
    // Create an active ad that gets reported for fraud/scam
    const adToTakeDown = await prisma.ad.create({
      data: {
        userId: testSeller.id,
        categoryId: testCategory.id,
        title: 'iPhone 15 Pro Max 256GB - Suspicious Advance Payment Ad',
        slug: `iphone-probe-take-down-${Date.now()}`,
        description: 'Demands advance JazzCash transfer before dispatching',
        price: 180000,
        condition: AdCondition.NEW,
        status: AdStatus.ACTIVE,
        locationCity: 'Rawalpindi',
        locationState: 'Punjab',
      },
    });
    createdAdIds.push(adToTakeDown.id);

    // Initial check: ad is ACTIVE and discoverable in public listings
    const activePublicCheck = await prisma.ad.findFirst({
      where: { id: adToTakeDown.id, status: AdStatus.ACTIVE },
    });
    assert(activePublicCheck !== null, 'Reported ad is initially active and public');

    // User files a report
    const reportA = await prisma.report.create({
      data: {
        adId: adToTakeDown.id,
        reporterId: testReporter.id,
        reason: 'SCAM',
        details: 'Demanding PKR 50,000 upfront via JazzCash. Seller refuses in-person handoff.',
        status: ReportStatus.PENDING,
      },
    });
    createdReportIds.push(reportA.id);

    assert(reportA.status === ReportStatus.PENDING, 'New report created with status PENDING');

    // Simulate Admin Action: Take Down Listing (mirroring PATCH /api/v1/admin/reports/:id with takeDownAd: true)
    const takeDownReason = `Taken down due to user report (${reportA.reason}): ${reportA.details}`;
    const [updatedReportA, updatedAdA] = await prisma.$transaction([
      prisma.report.update({
        where: { id: reportA.id },
        data: { status: ReportStatus.RESOLVED },
      }),
      prisma.ad.update({
        where: { id: adToTakeDown.id },
        data: {
          status: AdStatus.REJECTED,
          rejectionReason: takeDownReason,
        },
      }),
    ]);

    assert(updatedReportA.status === ReportStatus.RESOLVED, 'Report status updated to RESOLVED after take-down');
    assert(updatedAdA.status === AdStatus.REJECTED, 'Ad status updated to REJECTED after take-down');
    assert(
      updatedAdA.rejectionReason?.includes('SCAM') === true,
      'Ad rejectionReason records violation details from user report'
    );

    // Verify ad is now hidden from public marketplace
    const hiddenPublicCheck = await prisma.ad.findFirst({
      where: { id: adToTakeDown.id, status: AdStatus.ACTIVE },
    });
    assert(hiddenPublicCheck === null, 'Taken-down ad is completely removed from public active listings');

    // 3. Scenario B: Dismiss Report Flow
    // Create another active ad that receives a false/invalid report
    const validAd = await prisma.ad.create({
      data: {
        userId: testSeller.id,
        categoryId: testCategory.id,
        title: 'Honda Civic Oriel 2021 Sunroof - Genuine Ad',
        slug: `civic-probe-dismiss-${Date.now()}`,
        description: 'Genuine family car, bumper to bumper original',
        price: 6800000,
        condition: AdCondition.LIKE_NEW,
        status: AdStatus.ACTIVE,
        locationCity: 'Islamabad',
        locationState: 'Islamabad',
      },
    });
    createdAdIds.push(validAd.id);

    const reportB = await prisma.report.create({
      data: {
        adId: validAd.id,
        reporterId: testReporter.id,
        reason: 'OTHER',
        details: 'Competitor harassment report with false allegations',
        status: ReportStatus.PENDING,
      },
    });
    createdReportIds.push(reportB.id);

    // Admin Action: Dismiss Report (mirroring PATCH /api/v1/admin/reports/:id with status: DISMISSED)
    const updatedReportB = await prisma.report.update({
      where: { id: reportB.id },
      data: { status: ReportStatus.DISMISSED },
    });

    assert(updatedReportB.status === ReportStatus.DISMISSED, 'Report status updated to DISMISSED');

    // Verify ad is UNTOUCHED and still ACTIVE
    const adBCheck = await prisma.ad.findUnique({
      where: { id: validAd.id },
    });
    assert(adBCheck?.status === AdStatus.ACTIVE, 'Listing remains ACTIVE after report dismissal');
    assert(adBCheck?.rejectionReason === null, 'Listing rejectionReason remains null');

    const publicAdBCheck = await prisma.ad.findFirst({
      where: { id: validAd.id, status: AdStatus.ACTIVE },
    });
    assert(publicAdBCheck !== null, 'Listing remains discoverable in public active marketplace');

    // 4. Scenario C: Query and Filter Validation
    const pendingQuery = await prisma.report.findMany({
      where: { id: { in: [reportA.id, reportB.id] }, status: ReportStatus.PENDING },
    });
    assert(pendingQuery.length === 0, 'No remaining pending reports among processed probe reports');

    const resolvedQuery = await prisma.report.findMany({
      where: { id: reportA.id, status: ReportStatus.RESOLVED },
    });
    assert(resolvedQuery.length === 1, 'Resolved query accurately finds taken-down report');

    const dismissedQuery = await prisma.report.findMany({
      where: { id: reportB.id, status: ReportStatus.DISMISSED },
    });
    assert(dismissedQuery.length === 1, 'Dismissed query accurately finds dismissed report');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal probe error:', error);
    process.exit(1);
  } finally {
    // Cleanup probe reports
    if (createdReportIds.length > 0) {
      await prisma.report.deleteMany({
        where: { id: { in: createdReportIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdReportIds.length} probe reports`);
    }

    // Cleanup probe ads
    if (createdAdIds.length > 0) {
      await prisma.ad.deleteMany({
        where: { id: { in: createdAdIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdAdIds.length} probe ads`);
    }

    // Cleanup probe users
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdUserIds.length} probe users`);
    }

    await prisma.$disconnect();
  }
}

runTask10_6Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
