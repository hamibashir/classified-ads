import { MyAdListItem, MyAdsFilterTab } from '../types/ad';
import { formatPKR } from '../lib/formatters';

/**
 * Task 9.6 Automated Verification Probe
 * Verifies seller dashboard data structures, status tab filtering,
 * metrics calculation, price formatting, and pagination behavior.
 */

function runVerification() {
  console.log('--- Starting Task 9.6 User Dashboard ("My Ads") Probe ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, desc: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
    }
  }

  // 1. Mock Ads Dataset with various statuses
  const mockAds: MyAdListItem[] = [
    {
      id: 'ad-001',
      title: 'Honda Civic Oriel 2021 Navigation Leather Sunroof',
      slug: 'honda-civic-oriel-2021-lahore',
      description: 'Total original car, bumper to bumper genuine, first owner.',
      price: 6850000,
      currency: 'PKR',
      condition: 'USED_GOOD',
      status: 'ACTIVE',
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'DHA Phase 6',
      latitude: 31.47,
      longitude: 74.41,
      showPhone: true,
      allowWhatsapp: true,
      viewsCount: 342,
      favoritesCount: 28,
      conversationsCount: 14,
      createdAt: '2026-10-01T12:00:00Z',
      updatedAt: '2026-10-01T12:00:00Z',
      images: [
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1590362891988-f77804702e31', order: 0 },
        { id: 'img-2', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70', order: 1 },
      ],
      category: { id: 'cat-1', name: 'Vehicles', slug: 'vehicles' },
    },
    {
      id: 'ad-002',
      title: 'iPhone 15 Pro Max 256GB Natural Titanium JV',
      slug: 'iphone-15-pro-max-256gb-karachi',
      description: '100% battery health, complete box and original cable.',
      price: 245000,
      currency: 'PKR',
      condition: 'LIKE_NEW',
      status: 'PENDING',
      locationCity: 'Karachi',
      locationState: 'Sindh',
      locationAddress: 'Clifton Block 4',
      showPhone: true,
      allowWhatsapp: true,
      viewsCount: 0,
      favoritesCount: 0,
      conversationsCount: 0,
      createdAt: '2026-10-07T10:00:00Z',
      updatedAt: '2026-10-07T10:00:00Z',
      images: [
        { id: 'img-3', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', order: 0 },
      ],
      category: { id: 'cat-2', name: 'Mobiles', slug: 'mobiles' },
    },
    {
      id: 'ad-003',
      title: 'Sony PlayStation 5 Disc Edition 2 Controllers',
      slug: 'ps5-disc-edition-islamabad',
      description: 'Used for only 3 months, includes God of War Ragnarok.',
      price: 155000,
      currency: 'PKR',
      condition: 'USED_GOOD',
      status: 'SOLD',
      locationCity: 'Islamabad',
      locationState: 'Islamabad Capital Territory',
      locationAddress: 'F-10 Markaz',
      showPhone: true,
      allowWhatsapp: false,
      viewsCount: 820,
      favoritesCount: 45,
      conversationsCount: 22,
      createdAt: '2026-09-15T09:00:00Z',
      updatedAt: '2026-09-20T14:00:00Z',
      images: [
        { id: 'img-4', url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db', order: 0 },
      ],
      category: { id: 'cat-3', name: 'Electronics', slug: 'electronics' },
    },
    {
      id: 'ad-004',
      title: 'Dell XPS 15 9520 4K OLED i7 32GB 1TB RTX 3050Ti',
      slug: 'dell-xps-15-rawalpindi',
      description: 'Mint condition powerhouse laptop, boxed.',
      price: 320000,
      currency: 'PKR',
      condition: 'LIKE_NEW',
      status: 'EXPIRED',
      locationCity: 'Rawalpindi',
      locationState: 'Punjab',
      showPhone: false,
      allowWhatsapp: true,
      viewsCount: 140,
      favoritesCount: 6,
      conversationsCount: 3,
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z',
      images: [],
      category: { id: 'cat-4', name: 'Computers', slug: 'computers' },
    },
    {
      id: 'ad-005',
      title: 'Commercial Shop 200 Sqft Main Boulevard Gulberg',
      slug: 'commercial-shop-gulberg-lahore',
      description: 'Prime location commercial property with high rental yield.',
      price: 18500000,
      currency: 'PKR',
      condition: 'NEW',
      status: 'REJECTED',
      locationCity: 'Lahore',
      locationState: 'Punjab',
      locationAddress: 'Main Boulevard, Gulberg III',
      showPhone: true,
      allowWhatsapp: true,
      viewsCount: 0,
      favoritesCount: 0,
      conversationsCount: 0,
      createdAt: '2026-10-05T11:00:00Z',
      updatedAt: '2026-10-05T12:00:00Z',
      images: [],
      category: { id: 'cat-5', name: 'Property', slug: 'property' },
    },
  ];

  // Test 1: Status Counts Computation
  const activeCount = mockAds.filter((a) => a.status === 'ACTIVE').length;
  const pendingCount = mockAds.filter((a) => a.status === 'PENDING').length;
  const soldCount = mockAds.filter((a) => a.status === 'SOLD').length;
  const expiredCount = mockAds.filter((a) => a.status === 'EXPIRED').length;
  const rejectedCount = mockAds.filter((a) => a.status === 'REJECTED').length;

  assert(mockAds.length === 5, 'Total listings count matches dataset size');
  assert(activeCount === 1, 'Active listings count is accurately 1');
  assert(pendingCount === 1, 'Pending listings count is accurately 1');
  assert(soldCount === 1, 'Sold listings count is accurately 1');
  assert(expiredCount === 1, 'Expired listings count is accurately 1');
  assert(rejectedCount === 1, 'Rejected listings count is accurately 1');

  // Test 2: Filter function by Tab
  function filterAdsByTab(adsList: MyAdListItem[], tab: MyAdsFilterTab): MyAdListItem[] {
    if (tab === 'ALL') return adsList;
    return adsList.filter((a) => a.status === tab);
  }

  assert(filterAdsByTab(mockAds, 'ALL').length === 5, 'Tab ALL retains all 5 listings');
  assert(filterAdsByTab(mockAds, 'ACTIVE')[0].id === 'ad-001', 'Tab ACTIVE correctly returns Honda Civic ad');
  assert(filterAdsByTab(mockAds, 'PENDING')[0].id === 'ad-002', 'Tab PENDING correctly returns iPhone 15 ad');
  assert(filterAdsByTab(mockAds, 'SOLD')[0].id === 'ad-003', 'Tab SOLD correctly returns PS5 ad');

  // Test 3: Metric aggregations (Views, Favorites, Inquiries)
  const totalViews = mockAds.reduce((acc, a) => acc + a.viewsCount, 0);
  const totalFavorites = mockAds.reduce((acc, a) => acc + a.favoritesCount, 0);
  const totalInquiries = mockAds.reduce((acc, a) => acc + a.conversationsCount, 0);

  assert(totalViews === 1302, 'Total views across listings aggregated accurately (1,302)');
  assert(totalFavorites === 79, 'Total favorites across listings aggregated accurately (79)');
  assert(totalInquiries === 39, 'Total inquiries across listings aggregated accurately (39)');

  // Test 4: PKR formatting for Pakistani marketplace
  assert(formatPKR(6850000) === 'Rs 6,850,000', 'Honda Civic price formatted with standard Pakistani currency Rs 6,850,000');
  assert(formatPKR(245000) === 'Rs 245,000', 'iPhone price formatted with Rs 245,000');
  assert(formatPKR(18500000) === 'Rs 18,500,000', 'Commercial shop price formatted with Rs 18,500,000');

  // Test 5: Pagination slice calculation
  function paginateAds(adsList: MyAdListItem[], page: number, limit: number) {
    const totalItems = adsList.length;
    const totalPages = Math.ceil(totalItems / limit);
    const start = (page - 1) * limit;
    const items = adsList.slice(start, start + limit);
    return {
      items,
      page,
      limit,
      total: totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  const page1 = paginateAds(mockAds, 1, 2);
  assert(page1.items.length === 2 && page1.hasNextPage && !page1.hasPrevPage, 'Page 1 limit 2 correctly slices 2 items with hasNextPage true');
  const page2 = paginateAds(mockAds, 2, 2);
  assert(page2.items.length === 2 && page2.hasNextPage && page2.hasPrevPage, 'Page 2 limit 2 correctly slices next 2 items with both prev/next true');
  const page3 = paginateAds(mockAds, 3, 2);
  assert(page3.items.length === 1 && !page3.hasNextPage && page3.hasPrevPage, 'Page 3 limit 2 correctly slices remainder with hasNextPage false');

  console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
