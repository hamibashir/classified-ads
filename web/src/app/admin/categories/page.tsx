'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToastBanner, ToastMessage } from '@/components/ui/toast-banner';
import { apiClient } from '@/lib/api-client';
import { AdminCategoryItem, AdminCategoriesResponseData } from '@/types/admin';
import { CategoriesTable } from '@/components/admin/CategoriesTable';
import { CategoryDialog } from '@/components/admin/CategoryDialog';
import { DeleteCategoryDialog } from '@/components/admin/DeleteCategoryDialog';

type LevelFilter = 'ALL' | 'ROOT' | 'SUB';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Dialog State (Create / Edit)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<AdminCategoryItem | null>(null);
  const [presetParentId, setPresetParentId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<AdminCategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const res = await apiClient.get<AdminCategoriesResponseData>('/admin/categories');
      if (res.data) {
        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : raw.categories || [];
        setCategories(list);
        setLastUpdated(new Date());
      }
    } catch (err: unknown) {
      console.error('Failed to load categories:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to connect to category service.';
      setError(message || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open Create Root Category Modal
  const handleOpenAddRoot = () => {
    setCategoryToEdit(null);
    setPresetParentId(null);
    setIsDialogOpen(true);
  };

  // Open Create Subcategory Modal
  const handleOpenAddSub = (parentCategory: AdminCategoryItem) => {
    setCategoryToEdit(null);
    setPresetParentId(parentCategory.id);
    setIsDialogOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEdit = (category: AdminCategoryItem) => {
    setCategoryToEdit(category);
    setPresetParentId(category.parentId);
    setIsDialogOpen(true);
  };

  // Handle Form Submit (Create or Edit)
  const handleSubmitCategory = async (data: {
    name: string;
    slug: string;
    icon?: string | null;
    order: number;
    parentId?: string | null;
  }) => {
    try {
      setIsSubmitting(true);
      if (categoryToEdit) {
        // Edit existing category
        await apiClient.put(`/admin/categories/${categoryToEdit.id}`, data);
        setToast({
          id: Date.now().toString(),
          title: 'Category Updated',
          message: `"${data.name}" has been updated successfully.`,
          variant: 'success',
        });
      } else {
        // Create new category
        await apiClient.post('/admin/categories', data);
        setToast({
          id: Date.now().toString(),
          title: 'Category Created',
          message: `"${data.name}" has been added to the catalog and is live.`,
          variant: 'success',
        });
      }

      setIsDialogOpen(false);
      setCategoryToEdit(null);
      await fetchCategories(true);
    } catch (err: unknown) {
      console.error('Failed to save category:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to save category.';
      setToast({
        id: Date.now().toString(),
        title: 'Action Failed',
        message: message || 'Failed to save category.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Confirmation Dialog
  const handleOpenDelete = (category: AdminCategoryItem) => {
    setCategoryToDelete(category);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);

      await apiClient.delete(`/admin/categories/${categoryToDelete.id}`);

      setToast({
        id: Date.now().toString(),
        title: 'Category Deleted',
        message: `"${categoryToDelete.name}" has been removed from the catalog.`,
        variant: 'success',
      });

      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      await fetchCategories(true);
    } catch (err: unknown) {
      console.error('Failed to delete category:', err);
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
          ? err.message
          : 'Failed to delete category.';
      setDeleteError(message || 'Failed to delete category.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter and Search
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .map((cat): AdminCategoryItem | null => {
        // If level filter is SUB only, return only parents with children
        const matchingChildren = (cat.children || []).filter((sub) => {
          if (!q) return true;
          return sub.name.toLowerCase().includes(q) || sub.slug.toLowerCase().includes(q);
        });

        const parentMatches = !q || cat.name.toLowerCase().includes(q) || cat.slug.toLowerCase().includes(q);

        if (levelFilter === 'ROOT') {
          if (parentMatches) {
            return { ...cat, children: [] };
          }
          return null;
        }

        if (levelFilter === 'SUB') {
          if (matchingChildren.length > 0) {
            return { ...cat, children: matchingChildren };
          }
          return null;
        }

        // ALL
        if (parentMatches || matchingChildren.length > 0) {
          return {
            ...cat,
            children: parentMatches ? cat.children : matchingChildren,
          };
        }

        return null;
      })
      .filter((cat): cat is AdminCategoryItem => cat !== null);
  }, [categories, searchQuery, levelFilter]);

  // Derived counts
  const totalRootCount = categories.length;
  const totalSubCount = categories.reduce((sum, c) => sum + (c.children?.length || 0), 0);
  const totalCategoriesCount = totalRootCount + totalSubCount;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-teal-700" />
              <span>Category Management</span>
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {totalCategoriesCount} total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Organize root categories and subcategories, manage sort orders, and configure marketplace icons.
          </p>
        </div>

        {/* Actions & Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground hidden md:inline">
              Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCategories(true)}
            disabled={isRefreshing || isLoading}
            className="gap-2 h-9 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAddRoot}
            className="gap-1.5 h-9 text-xs bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Level Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <Button
            variant={levelFilter === 'ALL' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLevelFilter('ALL')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0 h-4 border-current">
              {totalCategoriesCount}
            </Badge>
          </Button>

          <Button
            variant={levelFilter === 'ROOT' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLevelFilter('ROOT')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Root Only</span>
            <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0 h-4 border-current">
              {totalRootCount}
            </Badge>
          </Button>

          <Button
            variant={levelFilter === 'SUB' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLevelFilter('SUB')}
            className="text-xs h-8 gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Subcategories</span>
            <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0 h-4 border-current">
              {totalSubCount}
            </Badge>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search category or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs bg-muted/40 border-border"
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchCategories()}
            className="text-xs border-destructive/30 hover:bg-destructive/15 text-destructive"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Categories Table or Empty State */}
      {!isLoading && filteredCategories.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-card border border-border rounded-2xl p-8 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <FolderTree className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">No Categories Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery
                ? 'No categories matched your search. Try clearing your query.'
                : 'No categories currently registered in this view.'}
            </p>
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-xs"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <CategoriesTable
          categories={filteredCategories}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onAddSubcategory={handleOpenAddSub}
        />
      )}

      {/* Add / Edit Category Dialog */}
      <CategoryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmitCategory}
        categoryToEdit={categoryToEdit}
        parentCategories={categories}
        presetParentId={presetParentId}
        isSubmitting={isSubmitting}
      />

      {/* Delete Category Confirmation Dialog */}
      <DeleteCategoryDialog
        category={categoryToDelete}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
