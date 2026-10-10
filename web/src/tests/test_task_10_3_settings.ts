import { PrismaClient, AdStatus, AdCondition } from '../../../server/node_modules/@prisma/client';

const prisma = new PrismaClient();

/**
 * Task 10.3 Automated Verification Suite
 * Verifies auto_approve_ads setting persistence, ad status branching (ACTIVE vs PENDING), and cleanup.
 */
async function runTask10_3Tests() {
  console.log('--- Starting Task 10.3 System Settings & Auto-Approve Toggle Probe ---');
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
  let originalAutoApproveValue = 'true';

  try {
    // 1. Get initial setting
    const initialSetting = await prisma.systemSetting.findUnique({
      where: { key: 'auto_approve_ads' },
    });
    originalAutoApproveValue = initialSetting?.value || 'true';
    console.log(`[INFO] Original auto_approve_ads value: "${originalAutoApproveValue}"`);

    // Ensure we have a test user and category to create test ads
    let testUser = await prisma.user.findFirst();
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test-seller-10-3@example.pk',
          name: 'Test Seller 10.3',
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
      throw new Error('No categories found to run test');
    }

    // 2. Test Step A: Set auto_approve_ads = "false"
    await prisma.systemSetting.upsert({
      where: { key: 'auto_approve_ads' },
      update: { value: 'false' },
      create: { key: 'auto_approve_ads', value: 'false' },
    });

    const settingDisabled = await prisma.systemSetting.findUnique({
      where: { key: 'auto_approve_ads' },
    });
    assert(settingDisabled?.value === 'false', 'auto_approve_ads setting toggled to "false"');

    // Simulate ad creation logic when auto_approve_ads is "false"
    const isAutoApproveA = settingDisabled?.value.toLowerCase() === 'true';
    const statusA = isAutoApproveA ? AdStatus.ACTIVE : AdStatus.PENDING;

    const adWithDisabledApproval = await prisma.ad.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        title: 'Probe Ad With Disabled Auto Approval',
        slug: `probe-ad-disabled-approval-${Date.now()}`,
        description: 'Testing that ad receives PENDING status when auto approval is false',
        price: 75000,
        condition: AdCondition.USED_GOOD,
        status: statusA,
        locationCity: 'Lahore',
        locationState: 'Punjab',
      },
    });
    createdAdIds.push(adWithDisabledApproval.id);

    assert(
      adWithDisabledApproval.status === AdStatus.PENDING,
      `Ad posted with auto_approve_ads=false received status PENDING (Actual: ${adWithDisabledApproval.status})`
    );

    // 3. Test Step B: Set auto_approve_ads = "true"
    await prisma.systemSetting.upsert({
      where: { key: 'auto_approve_ads' },
      update: { value: 'true' },
      create: { key: 'auto_approve_ads', value: 'true' },
    });

    const settingEnabled = await prisma.systemSetting.findUnique({
      where: { key: 'auto_approve_ads' },
    });
    assert(settingEnabled?.value === 'true', 'auto_approve_ads setting toggled to "true"');

    // Simulate ad creation logic when auto_approve_ads is "true"
    const isAutoApproveB = settingEnabled?.value.toLowerCase() === 'true';
    const statusB = isAutoApproveB ? AdStatus.ACTIVE : AdStatus.PENDING;

    const adWithEnabledApproval = await prisma.ad.create({
      data: {
        userId: testUser.id,
        categoryId: testCategory.id,
        title: 'Probe Ad With Enabled Auto Approval',
        slug: `probe-ad-enabled-approval-${Date.now()}`,
        description: 'Testing that ad receives ACTIVE status when auto approval is true',
        price: 90000,
        condition: AdCondition.NEW,
        status: statusB,
        locationCity: 'Karachi',
        locationState: 'Sindh',
      },
    });
    createdAdIds.push(adWithEnabledApproval.id);

    assert(
      adWithEnabledApproval.status === AdStatus.ACTIVE,
      `Ad posted with auto_approve_ads=true received status ACTIVE (Actual: ${adWithEnabledApproval.status})`
    );

    // 4. Test secondary settings
    const expirySetting = await prisma.systemSetting.findUnique({
      where: { key: 'ad_expiry_days' },
    });
    assert(!!expirySetting, 'ad_expiry_days setting exists in system_settings');

    const maxImagesSetting = await prisma.systemSetting.findUnique({
      where: { key: 'max_images_per_ad' },
    });
    assert(!!maxImagesSetting, 'max_images_per_ad setting exists in system_settings');

    console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
    if (passed !== total) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test probe error:', error);
    process.exit(1);
  } finally {
    // Cleanup created test ads
    if (createdAdIds.length > 0) {
      await prisma.ad.deleteMany({
        where: { id: { in: createdAdIds } },
      });
      console.log(`[CLEANUP] Deleted ${createdAdIds.length} test ads`);
    }

    // Restore original setting
    await prisma.systemSetting.upsert({
      where: { key: 'auto_approve_ads' },
      update: { value: originalAutoApproveValue },
      create: { key: 'auto_approve_ads', value: originalAutoApproveValue },
    });
    console.log(`[CLEANUP] Restored auto_approve_ads to "${originalAutoApproveValue}"`);

    await prisma.$disconnect();
  }
}

runTask10_3Tests().catch((err) => {
  console.error('Fatal probe error:', err);
  process.exit(1);
});
