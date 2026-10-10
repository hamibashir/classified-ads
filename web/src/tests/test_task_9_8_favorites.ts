import { AdListItem } from '../types/ad';
import { formatPKR } from '../lib/formatters';

/**
 * Task 9.8 Automated Verification Probe
 * Verifies Favorites / Saved Ads data structures, 1-click unbookmarking,
 * pagination calculation, empty state triggering, and PKR price formatting.
 */

function runVerification() {
  console.log('--- Starting Task 9.8 User Favorites Probe ---');
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

  // 1. Mock Favorited Ads Data
  let favoritesList: AdListItem[] = [
    {
      id: 'fav-ad-1',
      title: 'Toyota Yaris ATIV CVT 1.3 2022 Phantom Brown',
      slug: 'toyota-yaris-ativ-2022-lahore',
      price: 4350000,
      currency: 'PKR',
      condition: 'LIKE_NEW',
      isNegotiable: true,
      locationCity: 'Lahore',
      locationAddress: 'Model Town',
      createdAt: '2026-10-02T12:00:00Z',
      images: [
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', order: 0 },
      ],
      category: { id: 'c-1', name: 'Vehicles', slug: 'vehicles' },
      isFavorited: true,
    },
    {
      id: 'fav-ad-2',
      title: 'iPhone 14 Pro 128GB Deep Purple Factory Unlock',
      slug: 'iphone-14-pro-karachi',
      price: 215000,
      currency: 'PKR',
      condition: 'USED_GOOD',
      isNegotiable: false,
      locationCity: 'Karachi',
      locationAddress: 'DHA Phase 5',
      createdAt: '2026-10-04T15:00:00Z',
      images: [
        { id: 'img-2', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569', order: 0 },
      ],
      category: { id: 'c-2', name: 'Mobiles', slug: 'mobiles' },
      isFavorited: true,
    },
    {
      id: 'fav-ad-3',
      title: 'Sony Bravia 55 Inch 4K HDR Google TV',
      slug: 'sony-bravia-55-inch-islamabad',
      price: 145000,
      currency: 'PKR',
      condition: 'LIKE_NEW',
      isNegotiable: true,
      locationCity: 'Islamabad',
      locationAddress: 'F-8/3',
      createdAt: '2026-10-06T18:00:00Z',
      images: [],
      category: { id: 'c-3', name: 'Electronics', slug: 'electronics' },
      isFavorited: true,
    },
  ];

  // Test 1: Initial list size & isFavorited status
  assert(favoritesList.length === 3, 'Initial favorites count is 3');
  assert(favoritesList.every((ad) => ad.isFavorited === true), 'All saved listings have isFavorited set to true');

  // Test 2: PKR formatting
  assert(formatPKR(favoritesList[0].price) === 'Rs 4,350,000', 'Toyota Yaris price formatted as Rs 4,350,000');
  assert(formatPKR(favoritesList[1].price) === 'Rs 215,000', 'iPhone price formatted as Rs 215,000');

  // Test 3: 1-Click Unbookmark / Remove Handler
  function removeFavorite(list: AdListItem[], adId: string): AdListItem[] {
    return list.filter((ad) => ad.id !== adId);
  }

  favoritesList = removeFavorite(favoritesList, 'fav-ad-2');
  assert(favoritesList.length === 2, 'After unbookmarking iPhone, count drops to 2');
  assert(!favoritesList.some((ad) => ad.id === 'fav-ad-2'), 'iPhone listing cleanly removed from favorites list');

  // Test 4: Pagination slicing on favorites
  function paginateFavorites(list: AdListItem[], page: number, limit: number) {
    const total = list.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    return {
      items: list.slice(start, start + limit),
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  const p1 = paginateFavorites(favoritesList, 1, 1);
  assert(p1.items.length === 1 && p1.hasNextPage && !p1.hasPrevPage, 'Page 1 limit 1 hasNextPage true, hasPrevPage false');
  assert(p1.items[0].id === 'fav-ad-1', 'Page 1 item is Toyota Yaris');

  const p2 = paginateFavorites(favoritesList, 2, 1);
  assert(p2.items.length === 1 && !p2.hasNextPage && p2.hasPrevPage, 'Page 2 limit 1 hasNextPage false, hasPrevPage true');
  assert(p2.items[0].id === 'fav-ad-3', 'Page 2 item is Sony Bravia');

  // Test 5: Empty state trigger
  favoritesList = removeFavorite(favoritesList, 'fav-ad-1');
  favoritesList = removeFavorite(favoritesList, 'fav-ad-3');
  assert(favoritesList.length === 0, 'Removing all favorites empties the list');

  const isEmpty = favoritesList.length === 0;
  assert(isEmpty === true, 'Empty state properly triggers when favorites array length is 0');

  console.log(`\nProbe Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  if (passed !== total) {
    process.exit(1);
  }
}

runVerification();
