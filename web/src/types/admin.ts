/**
 * Administration Metrics & Moderation Type Definitions
 */

export interface AdminDashboardMetrics {
  totalAds: number;
  pendingAds: number;
  activeAds: number;
  soldAds: number;
  rejectedAds: number;
  totalUsers: number;
  unresolvedReports: number;
}

export interface RecentPendingAdSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  condition: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
}

export interface RecentReportSummary {
  id: string;
  adId: string;
  reason: string;
  details: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  ad: {
    id: string;
    title: string;
    slug: string;
  };
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminDashboardResponseData {
  metrics: AdminDashboardMetrics;
  recentActivity: {
    recentPendingAds: RecentPendingAdSummary[];
    recentReports: RecentReportSummary[];
  };
}

export interface PendingAdDetail {
  id: string;
  userId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  condition: string;
  status: 'PENDING';
  locationCity: string;
  locationState: string;
  createdAt: string;
  images: Array<{
    id: string;
    url: string;
    order: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
  };
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
  };
}

export interface PendingAdsResponseData {
  ads: PendingAdDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UserReportDetail {
  id: string;
  adId: string;
  reporterId: string;
  reason: string;
  details: string | null;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  updatedAt: string;
  ad: {
    id: string;
    title: string;
    slug: string;
    status: string;
    price: number;
    userId: string;
    images?: Array<{ url: string }>;
    user?: { id: string; name: string; email: string };
  } | null;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ReportsResponseData {
  reports: UserReportDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  order: number;
  parentId: string | null;
  adCount: number;
  createdAt: string;
  updatedAt: string;
  children?: AdminCategoryItem[];
}

export interface AdminCategoriesResponseData {
  categories: AdminCategoryItem[];
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  isPhoneVerified: boolean;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    ads: number;
    reportsFiled: number;
  };
}

export interface AdminUsersResponseData {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}


