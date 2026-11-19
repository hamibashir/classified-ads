/**
 * Classified Ad Type Definitions
 */

export type AdCondition = 'NEW' | 'LIKE_NEW' | 'USED_GOOD' | 'USED_FAIR' | 'USED';
export type AdStatus = 'ACTIVE' | 'PENDING' | 'SOLD' | 'REJECTED' | 'EXPIRED';

export interface PostAdDraft {
  // Step 1: Category
  categoryId: string;
  subcategoryId: string;
  categoryName?: string;
  subcategoryName?: string;

  // Step 2: Basic Info
  title: string;
  description: string;
  price: number | '';
  currency: string;
  isNegotiable: boolean;
  condition: AdCondition;
  customFields?: Record<string, string>;

  // Step 3: Photos (Upcoming Task 9.3)
  images: { url: string; order: number; publicId?: string | null }[];

  // Step 4: Location & Contact
  locationCity: string;
  locationState?: string;
  locationAddress?: string;
  latitude?: number | null;
  longitude?: number | null;
  sellerPhone?: string;
  showPhone: boolean;
  allowWhatsapp: boolean;

  // Wizard state
  step?: number;
}

export interface AdImage {
  id: string;
  url: string;
  order: number;
  isFeatured?: boolean;
}

export interface AdCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface AdSeller {
  id: string;
  name: string;
  avatarUrl?: string | null;
  phone?: string | null;
  isPhoneVerified?: boolean;
  memberSince?: string;
  createdAt?: string;
}

export interface AdListItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  isNegotiable: boolean;
  condition: AdCondition;
  status?: AdStatus;
  locationCity: string;
  locationState?: string;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceKm?: number | null;
  showPhone?: boolean;
  allowWhatsapp?: boolean;
  viewsCount?: number;
  createdAt: string;
  updatedAt?: string;
  images: AdImage[];
  category: AdCategory;
  user?: AdSeller;
  seller?: AdSeller;
  isFavorited?: boolean;
  isFeatured?: boolean;
  customFields?: Record<string, string>;
}

export type ReportReason =
  | 'SPAM'
  | 'FRAUD'
  | 'INAPPROPRIATE'
  | 'DUPLICATE'
  | 'PROHIBITED_ITEM'
  | 'OTHER';

export interface CreateReportPayload {
  reason: ReportReason;
  details?: string;
}

export type MyAdsFilterTab = 'ALL' | 'ACTIVE' | 'PENDING' | 'SOLD' | 'EXPIRED' | 'REJECTED';

export interface MyAdListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  condition: AdCondition;
  status: AdStatus;
  locationCity: string;
  locationState?: string;
  locationAddress?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  showPhone: boolean;
  allowWhatsapp: boolean;
  viewsCount: number;
  favoritesCount: number;
  conversationsCount: number;
  createdAt: string;
  updatedAt: string;
  images: AdImage[];
  category: AdCategory;
}

export interface MyAdsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MyAdsResponse {
  ads: MyAdListItem[];
  pagination: MyAdsPagination;
}
