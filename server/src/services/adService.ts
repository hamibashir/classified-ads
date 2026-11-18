import { Prisma } from '@prisma/client';
import { prisma } from '../config/db';

export interface NearbyAdsOptions {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  categoryId?: string;
  categoryIds?: string[];
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  limit?: number;
  offset?: number;
}

export interface NearbyAdResult {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isNegotiable: boolean;
  condition: string;
  status: string;
  locationCity: string;
  locationState: string;
  locationAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  showPhone: boolean;
  allowWhatsapp: boolean;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: Date;
  distance: number;
  images: Array<{
    id: string;
    adId: string;
    url: string;
    publicId: string | null;
    order: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  } | null;
}

/**
 * Pure mathematical Haversine distance calculator between two GPS points in kilometers
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

/**
 * Executes parameterized MySQL Haversine spatial calculation to find nearby active ads
 */
export const findNearbyAds = async (
  options: NearbyAdsOptions
): Promise<NearbyAdResult[]> => {
  const { latitude, longitude } = options;
  const radiusKm = options.radiusKm ?? 50;
  const limit = options.limit ?? 20;
  const offset = options.offset ?? 0;

  const categoryFilter = options.categoryIds && options.categoryIds.length > 0
    ? Prisma.sql`AND a.categoryId IN (${Prisma.join(options.categoryIds)})`
    : options.categoryId
    ? Prisma.sql`AND a.categoryId = ${options.categoryId}`
    : Prisma.empty;

  let searchFilter = Prisma.empty;
  if (options.search) {
    const rawSearch = options.search.trim();
    const stripped = rawSearch.toLowerCase().replace(/[\s\-_]+/g, '');
    const tokens = rawSearch.split(/\s+/).filter(Boolean);

    const spaceCondition = stripped.length >= 2
      ? Prisma.sql`(
          REPLACE(REPLACE(a.title, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
          OR REPLACE(REPLACE(a.description, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
          OR REPLACE(REPLACE(a.slug, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
        )`
      : Prisma.empty;

    const tokenConditions = tokens.map(
      (t) => Prisma.sql`(a.title LIKE ${`%${t}%`} OR a.description LIKE ${`%${t}%`})`
    );
    const andTokenCondition = tokenConditions.length > 0 ? Prisma.sql`(${Prisma.join(tokenConditions, ' AND ')})` : Prisma.empty;

    if (spaceCondition !== Prisma.empty && andTokenCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND (${spaceCondition} OR ${andTokenCondition})`;
    } else if (spaceCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND ${spaceCondition}`;
    } else if (andTokenCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND ${andTokenCondition}`;
    }
  }

  const cityFilter = options.city
    ? Prisma.sql`AND a.locationCity = ${options.city}`
    : Prisma.empty;

  const minPriceFilter = options.minPrice !== undefined
    ? Prisma.sql`AND a.price >= ${options.minPrice}`
    : Prisma.empty;

  const maxPriceFilter = options.maxPrice !== undefined
    ? Prisma.sql`AND a.price <= ${options.maxPrice}`
    : Prisma.empty;

  const conditionFilter = options.condition
    ? Prisma.sql`AND a.condition = ${options.condition}`
    : Prisma.empty;

  // Execute parameterized raw SQL with Prisma tagged template literal
  const rawRows = await prisma.$queryRaw<Array<any>>`
    SELECT
      a.id,
      a.userId,
      a.categoryId,
      a.title,
      a.slug,
      a.description,
      a.price,
      a.currency,
      a.isNegotiable,
      a.condition,
      a.status,
      a.locationCity,
      a.locationState,
      a.locationAddress,
      a.latitude,
      a.longitude,
      a.showPhone,
      a.allowWhatsapp,
      a.viewsCount,
      a.isFeatured,
      a.createdAt,
      ROUND(( 6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(${latitude})) * cos(radians(a.latitude)) *
          cos(radians(a.longitude) - radians(${longitude})) +
          sin(radians(${latitude})) * sin(radians(a.latitude))
        ))
      ) ), 2) AS distance
    FROM ads a
    INNER JOIN users u ON a.userId = u.id
    WHERE a.status = 'ACTIVE'
      AND u.isBanned = FALSE
      AND a.latitude IS NOT NULL
      AND a.longitude IS NOT NULL
      ${categoryFilter}
      ${searchFilter}
      ${cityFilter}
      ${minPriceFilter}
      ${maxPriceFilter}
      ${conditionFilter}
    HAVING distance <= ${radiusKm}
    ORDER BY distance ASC
    LIMIT ${limit} OFFSET ${offset};
  `;

  if (!rawRows || rawRows.length === 0) {
    return [];
  }

  // Hydrate related images and category summaries in bulk
  const adIds = rawRows.map((r) => r.id);
  const categoryIds = Array.from(new Set(rawRows.map((r) => r.categoryId)));

  const [images, categories] = await Promise.all([
    prisma.adImage.findMany({
      where: { adId: { in: adIds } },
      orderBy: { order: 'asc' },
    }),
    prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, slug: true, icon: true },
    }),
  ]);

  const imagesByAdId = new Map<string, Array<{ id: string; adId: string; url: string; publicId: string | null; order: number }>>();
  for (const img of images) {
    const list = imagesByAdId.get(img.adId) || [];
    list.push(img);
    imagesByAdId.set(img.adId, list);
  }

  const categoriesById = new Map<string, { id: string; name: string; slug: string; icon: string | null }>();
  for (const cat of categories) {
    categoriesById.set(cat.id, cat);
  }

  return rawRows.map((row) => ({
    id: row.id,
    userId: row.userId,
    categoryId: row.categoryId,
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    isNegotiable: Boolean(row.isNegotiable),
    condition: row.condition,
    status: row.status,
    locationCity: row.locationCity,
    locationState: row.locationState,
    locationAddress: row.locationAddress,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    showPhone: Boolean(row.showPhone),
    allowWhatsapp: Boolean(row.allowWhatsapp),
    viewsCount: Number(row.viewsCount || 0),
    isFeatured: Boolean(row.isFeatured),
    createdAt: row.createdAt,
    distance: Number(row.distance),
    images: imagesByAdId.get(row.id) || [],
    category: categoriesById.get(row.categoryId) || null,
  }));
};

/**
 * Counts total nearby active ads matching the spatial radius and filters
 */
export const countNearbyAds = async (
  options: NearbyAdsOptions
): Promise<number> => {
  const { latitude, longitude } = options;
  const radiusKm = options.radiusKm ?? 50;

  const categoryFilter = options.categoryIds && options.categoryIds.length > 0
    ? Prisma.sql`AND a.categoryId IN (${Prisma.join(options.categoryIds)})`
    : options.categoryId
    ? Prisma.sql`AND a.categoryId = ${options.categoryId}`
    : Prisma.empty;

  let searchFilter = Prisma.empty;
  if (options.search) {
    const rawSearch = options.search.trim();
    const stripped = rawSearch.toLowerCase().replace(/[\s\-_]+/g, '');
    const tokens = rawSearch.split(/\s+/).filter(Boolean);

    const spaceCondition = stripped.length >= 2
      ? Prisma.sql`(
          REPLACE(REPLACE(a.title, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
          OR REPLACE(REPLACE(a.description, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
          OR REPLACE(REPLACE(a.slug, ' ', ''), '-', '') LIKE ${`%${stripped}%`}
        )`
      : Prisma.empty;

    const tokenConditions = tokens.map(
      (t) => Prisma.sql`(a.title LIKE ${`%${t}%`} OR a.description LIKE ${`%${t}%`})`
    );
    const andTokenCondition = tokenConditions.length > 0 ? Prisma.sql`(${Prisma.join(tokenConditions, ' AND ')})` : Prisma.empty;

    if (spaceCondition !== Prisma.empty && andTokenCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND (${spaceCondition} OR ${andTokenCondition})`;
    } else if (spaceCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND ${spaceCondition}`;
    } else if (andTokenCondition !== Prisma.empty) {
      searchFilter = Prisma.sql`AND ${andTokenCondition}`;
    }
  }

  const cityFilter = options.city
    ? Prisma.sql`AND a.locationCity = ${options.city}`
    : Prisma.empty;

  const minPriceFilter = options.minPrice !== undefined
    ? Prisma.sql`AND a.price >= ${options.minPrice}`
    : Prisma.empty;

  const maxPriceFilter = options.maxPrice !== undefined
    ? Prisma.sql`AND a.price <= ${options.maxPrice}`
    : Prisma.empty;

  const conditionFilter = options.condition
    ? Prisma.sql`AND a.condition = ${options.condition}`
    : Prisma.empty;

  const countRows = await prisma.$queryRaw<Array<{ count: bigint | number }>>`
    SELECT COUNT(*) as count FROM (
      SELECT a.id,
        ( 6371 * acos(
          LEAST(1.0, GREATEST(-1.0,
            cos(radians(${latitude})) * cos(radians(a.latitude)) *
            cos(radians(a.longitude) - radians(${longitude})) +
            sin(radians(${latitude})) * sin(radians(a.latitude))
          ))
        ) ) AS distance
      FROM ads a
      INNER JOIN users u ON a.userId = u.id
      WHERE a.status = 'ACTIVE'
        AND u.isBanned = FALSE
        AND a.latitude IS NOT NULL
        AND a.longitude IS NOT NULL
        ${categoryFilter}
        ${searchFilter}
        ${cityFilter}
        ${minPriceFilter}
        ${maxPriceFilter}
        ${conditionFilter}
      HAVING distance <= ${radiusKm}
    ) as nearby_count;
  `;

  return Number(countRows[0]?.count || 0);
};
