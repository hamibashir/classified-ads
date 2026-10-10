'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Layers,
  FileText,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminCategoryItem } from '@/types/admin';
import { AVAILABLE_ICONS } from './CategoryDialog';

interface CategoriesTableProps {
  categories: AdminCategoryItem[];
  isLoading?: boolean;
  onEdit: (category: AdminCategoryItem) => void;
  onDelete: (category: AdminCategoryItem) => void;
  onAddSubcategory: (parentCategory: AdminCategoryItem) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  isLoading = false,
  onEdit,
  onDelete,
  onAddSubcategory,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Default to expanding all root categories with children
    const initial = new Set<string>();
    categories.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        initial.add(cat.id);
      }
    });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return <Tag className="w-4 h-4 text-muted-foreground" />;
    const IconComp = AVAILABLE_ICONS[iconName] || Tag;
    return <IconComp className="w-4 h-4 text-teal-700" />;
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[300px]">Category & Slug</TableHead>
              <TableHead>Hierarchy Level</TableHead>
              <TableHead className="w-[90px] text-center">Order</TableHead>
              <TableHead className="w-[120px] text-center">Listings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i} className="animate-pulse">
                <TableCell>
                  <div className="h-5 bg-muted rounded w-36" />
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-muted rounded w-24" />
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-muted rounded w-10 mx-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-5 bg-muted rounded w-14 mx-auto" />
                </TableCell>
                <TableCell>
                  <div className="h-7 bg-muted rounded w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[320px]">Category & Slug</TableHead>
            <TableHead>Hierarchy Level</TableHead>
            <TableHead className="w-[90px] text-center">Order</TableHead>
            <TableHead className="w-[130px] text-center">Listings</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => {
            const hasChildren = Boolean(cat.children && cat.children.length > 0);
            const isExpanded = expandedIds.has(cat.id);

            return (
              <React.Fragment key={cat.id}>
                {/* Parent Row */}
                <TableRow className="hover:bg-muted/30 transition-colors font-medium">
                  {/* Category Name & Slug */}
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleExpand(cat.id)}
                          className="w-5 h-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors shrink-0"
                          title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      ) : (
                        <span className="w-5 h-5 shrink-0" />
                      )}

                      <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
                        {renderIcon(cat.icon)}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-foreground text-xs sm:text-sm truncate">
                          {cat.name}
                        </div>
                        <div className="text-[11px] font-mono text-muted-foreground truncate">
                          /{cat.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Level Badge */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] bg-teal-500/10 text-teal-700 border-teal-500/20 font-semibold">
                        Root Category
                      </Badge>
                      {hasChildren && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Layers className="w-3 h-3 text-muted-foreground" />
                          {cat.children?.length} subcategories
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Sort Order */}
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">
                    #{cat.order}
                  </TableCell>

                  {/* Ad Count */}
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[10px] gap-1 px-2 py-0.5"
                    >
                      <FileText className="w-3 h-3 text-muted-foreground" />
                      <span>{cat.adCount || 0} ads</span>
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddSubcategory(cat)}
                        className="h-7 px-2 text-[11px] gap-1 text-teal-700 hover:text-teal-800 hover:bg-teal-50"
                        title="Add subcategory under this parent"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Add Sub</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(cat)}
                        className="h-7 w-7 p-0"
                        title="Edit category"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(cat)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Subcategory Rows (if expanded) */}
                {hasChildren &&
                  isExpanded &&
                  cat.children?.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="bg-muted/15 hover:bg-muted/30 transition-colors border-t border-border/40"
                    >
                      {/* Indented Subcategory Name & Slug */}
                      <TableCell className="pl-10 sm:pl-12">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                            {renderIcon(sub.icon)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground text-xs truncate">
                              {sub.name}
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground truncate">
                              /{sub.slug}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Subcategory Level Badge */}
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-[10px] text-muted-foreground bg-muted font-normal"
                        >
                          Subcategory of {cat.name}
                        </Badge>
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        #{sub.order}
                      </TableCell>

                      {/* Ad Count */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] gap-1 px-2 py-0.5"
                        >
                          <span>{sub.adCount || 0} ads</span>
                        </Badge>
                      </TableCell>

                      {/* Subcategory Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(sub)}
                            className="h-7 w-7 p-0"
                            title="Edit subcategory"
                          >
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(sub)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
