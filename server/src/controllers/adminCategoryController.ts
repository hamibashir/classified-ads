import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { CreateCategoryInput, UpdateCategoryInput } from '../schemas/categorySchemas';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Helper to convert title string into a clean URL-friendly slug
 */
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Create a new category or subcategory
 * POST /api/v1/admin/categories
 */
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, slug: customSlug, icon, order, parentId }: CreateCategoryInput = req.body;

    const slug = customSlug ? customSlug.trim().toLowerCase() : slugify(name);

    if (!slug) {
      sendError(res, 'BAD_REQUEST', 'Could not generate a valid slug from name.', undefined, 400);
      return;
    }

    // 1. Check slug uniqueness
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      sendError(res, 'SLUG_ALREADY_EXISTS', `A category with slug "${slug}" already exists.`, undefined, 409);
      return;
    }

    // 2. Validate parent category existence if provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parent) {
        sendError(res, 'INVALID_PARENT_CATEGORY', 'Specified parent category does not exist.', undefined, 400);
        return;
      }
    }

    // 3. Create category record
    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        order: order ?? 0,
        parentId: parentId || null,
      },
    });

    sendSuccess(
      res,
      { category: newCategory },
      'Category created successfully.',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing category
 * PUT /api/v1/admin/categories/:id
 */
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug: customSlug, icon, order, parentId }: UpdateCategoryInput = req.body;

    // 1. Verify target category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found.', undefined, 404);
      return;
    }

    // 2. Validate parentId if modified
    if (parentId !== undefined) {
      if (parentId === id) {
        sendError(res, 'BAD_REQUEST', 'A category cannot be its own parent.', undefined, 400);
        return;
      }

      if (parentId !== null) {
        const parent = await prisma.category.findUnique({
          where: { id: parentId },
        });

        if (!parent) {
          sendError(res, 'INVALID_PARENT_CATEGORY', 'Specified parent category does not exist.', undefined, 400);
          return;
        }
      }
    }

    // 3. Validate slug if modified
    let newSlug = customSlug ? customSlug.trim().toLowerCase() : undefined;
    if (newSlug && newSlug !== category.slug) {
      const existingSlug = await prisma.category.findUnique({
        where: { slug: newSlug },
      });

      if (existingSlug) {
        sendError(res, 'SLUG_ALREADY_EXISTS', `A category with slug "${newSlug}" already exists.`, undefined, 409);
        return;
      }
    }

    // 4. Update category in database
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(newSlug !== undefined && { slug: newSlug }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(parentId !== undefined && { parentId }),
      },
    });

    sendSuccess(
      res,
      { category: updatedCategory },
      'Category updated successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a category
 * DELETE /api/v1/admin/categories/:id
 */
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Verify category exists
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          select: { id: true },
        },
      },
    });

    if (!category) {
      sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found.', undefined, 404);
      return;
    }

    // 2. Enforce referential integrity: check for associated ads
    const categoryIdsToCheck = [id, ...category.children.map((c) => c.id)];
    const attachedAdsCount = await prisma.ad.count({
      where: { categoryId: { in: categoryIdsToCheck } },
    });

    if (attachedAdsCount > 0) {
      sendError(
        res,
        'CATEGORY_HAS_ADS',
        `Cannot delete category because it (or its subcategories) contains ${attachedAdsCount} active ad(s). Reassign or remove ads first.`,
        undefined,
        400
      );
      return;
    }

    // 3. Delete category
    await prisma.category.delete({
      where: { id },
    });

    sendSuccess(
      res,
      { deletedCategoryId: id },
      'Category deleted successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};
