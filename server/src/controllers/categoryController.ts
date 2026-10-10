import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Get all root categories with nested subcategories, icons, and ad counts
 * GET /api/v1/categories
 */
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parentCategories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { ads: true },
            },
          },
        },
        _count: {
          select: { ads: true },
        },
      },
    });

    const formattedCategories = parentCategories.map((cat) => {
      const childrenWithCounts = cat.children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        icon: child.icon,
        order: child.order,
        parentId: child.parentId,
        adCount: child._count.ads,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
      }));

      // Total ad count for parent category includes direct ads and subcategory ads
      const childrenAdCount = childrenWithCounts.reduce((sum, ch) => sum + ch.adCount, 0);
      const totalAdCount = cat._count.ads + childrenAdCount;

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        order: cat.order,
        adCount: totalAdCount,
        children: childrenWithCounts,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      };
    });

    sendSuccess(
      res,
      { categories: formattedCategories },
      'Categories retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single category by slug with children and parent details
 * GET /api/v1/categories/:slug
 */
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      sendError(res, 'BAD_REQUEST', 'Category slug is required.', undefined, 400);
      return;
    }

    const category = await prisma.category.findUnique({
      where: { slug: slug.trim().toLowerCase() },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { ads: true },
            },
          },
        },
        _count: {
          select: { ads: true },
        },
      },
    });

    if (!category) {
      sendError(res, 'CATEGORY_NOT_FOUND', 'Category not found.', undefined, 404);
      return;
    }

    const childrenWithCounts = category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug,
      icon: child.icon,
      order: child.order,
      parentId: child.parentId,
      adCount: child._count.ads,
      createdAt: child.createdAt,
      updatedAt: child.updatedAt,
    }));

    const childrenAdCount = childrenWithCounts.reduce((sum, ch) => sum + ch.adCount, 0);
    const totalAdCount = category._count.ads + childrenAdCount;

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      order: category.order,
      parentId: category.parentId,
      parent: category.parent,
      adCount: totalAdCount,
      children: childrenWithCounts,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    sendSuccess(
      res,
      { category: formattedCategory },
      'Category retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};
