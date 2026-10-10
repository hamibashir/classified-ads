'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Loader2,
  Tag,
  Car,
  Smartphone,
  Tv,
  Home,
  Bike,
  Briefcase,
  Wrench,
  Shirt,
  Armchair,
  Dog,
  BookOpen,
  Baby,
  Laptop,
  Sparkles,
  Package,
  Cpu,
  ShoppingBag,
  Layers,
  Camera,
  Music,
  Compass,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminCategoryItem } from '@/types/admin';

export const AVAILABLE_ICONS: Record<string, React.ElementType> = {
  Car,
  Smartphone,
  Tv,
  Home,
  Bike,
  Briefcase,
  Wrench,
  Shirt,
  Armchair,
  Dog,
  BookOpen,
  Baby,
  Laptop,
  Sparkles,
  Package,
  Cpu,
  ShoppingBag,
  Layers,
  Camera,
  Music,
  Compass,
  Tag,
};

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    slug: string;
    icon?: string | null;
    order: number;
    parentId?: string | null;
  }) => Promise<void>;
  categoryToEdit?: AdminCategoryItem | null;
  parentCategories: AdminCategoryItem[];
  presetParentId?: string | null;
  isSubmitting?: boolean;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categoryToEdit = null,
  parentCategories,
  presetParentId = null,
  isSubmitting = false,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [parentId, setParentId] = useState<string>('root');
  const [icon, setIcon] = useState<string>('Tag');
  const [order, setOrder] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state whenever modal opens or item changes
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSlug(categoryToEdit.slug);
      setIsSlugManuallyEdited(true);
      setParentId(categoryToEdit.parentId || 'root');
      setIcon(categoryToEdit.icon || 'Tag');
      setOrder(categoryToEdit.order || 0);
    } else {
      setName('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      setParentId(presetParentId || 'root');
      setIcon('Tag');
      setOrder(0);
    }
    setValidationError(null);
  }, [categoryToEdit, presetParentId, isOpen]);

  // Handle Name Input Change (auto-slugifies unless manually edited)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Handle Slug Input Change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setValidationError('Category name is required.');
      return;
    }
    if (name.trim().length < 2) {
      setValidationError('Category name must be at least 2 characters.');
      return;
    }
    const cleanSlug = slug.trim() || slugify(name);
    if (!cleanSlug) {
      setValidationError('Valid URL slug is required.');
      return;
    }

    setValidationError(null);
    await onSubmit({
      name: name.trim(),
      slug: cleanSlug,
      icon: icon || null,
      order: Number(order) || 0,
      parentId: parentId === 'root' ? null : parentId,
    });
  };

  // Filter out self from parents dropdown when editing to avoid circular parenting
  const eligibleParents = parentCategories.filter(
    (p) => !categoryToEdit || p.id !== categoryToEdit.id
  );

  const SelectedIconComponent = AVAILABLE_ICONS[icon] || Tag;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-700">
            <FolderTree className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">
              {categoryToEdit ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {categoryToEdit
              ? 'Modify category details, hierarchy level, or display order.'
              : 'Add a new root category or subcategory to the marketplace catalog.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {validationError && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {validationError}
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Category Name *</label>
            <Input
              placeholder="e.g., Electric Vehicles, Laptops"
              value={name}
              onChange={handleNameChange}
              disabled={isSubmitting}
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          {/* URL Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">URL Slug *</label>
              <span className="text-[10px] text-muted-foreground font-mono">
                /search?category={slug || 'slug'}
              </span>
            </div>
            <Input
              placeholder="e.g., electric-vehicles"
              value={slug}
              onChange={handleSlugChange}
              disabled={isSubmitting}
              className="h-9 font-mono text-xs"
            />
          </div>

          {/* Hierarchy Level (Parent Category) */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Hierarchy Placement</label>
            <Select
              value={parentId}
              onValueChange={setParentId}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select hierarchy level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root" className="text-xs font-semibold">
                  None (Root Category)
                </SelectItem>
                {eligibleParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id} className="text-xs">
                    Subcategory under: {parent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Icon Picker */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Icon</label>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
                  <SelectedIconComponent className="w-4 h-4" />
                </div>
                <Select
                  value={icon}
                  onValueChange={setIcon}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9 text-xs flex-1">
                    <SelectValue placeholder="Pick icon" />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {Object.keys(AVAILABLE_ICONS).map((iconKey) => {
                      const IconItem = AVAILABLE_ICONS[iconKey];
                      return (
                        <SelectItem key={iconKey} value={iconKey} className="text-xs">
                          <div className="flex items-center gap-2">
                            <IconItem className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{iconKey}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Display Order</label>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                disabled={isSubmitting}
                className="h-9 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-teal-700 hover:bg-teal-800 text-white gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{categoryToEdit ? 'Save Changes' : 'Create Category'}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
