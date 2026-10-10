/**
 * Category Types for Classified Ads PK
 */

export interface SubcategorySummary {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  color: string;
  bgTint: string;
  adCount?: number;
  description?: string;
  subcategories?: SubcategorySummary[];
}

export interface CategoryApiResponse {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  parentId?: string | null;
  children?: CategoryApiResponse[];
}
