import { Request, Response, NextFunction } from 'express';
import { AdCondition, AdStatus, ReportStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  CreateAdInput,
  AdFilterQueryParams,
  UpdateAdInput,
  AdStatusUpdateInput,
  MyAdsQueryParams,
  CreateReportInput,
} from '../schemas/adSchemas';
import { generateAdSlug } from '../utils/slugify';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { findNearbyAds, countNearbyAds } from '../services/adService';
import { buildWhatsAppUrl, formatAdWhatsAppMessage } from '../utils/whatsapp';

/**
 * Create a new classified ad
 * POST /api/v1/ads
 */
export const createAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required to post an ad', undefined, 401);
      return;
    }

    const {
      title,
      description,
      categoryId,
      price,
      currency,
      isNegotiable,
      condition,
      locationCity,
      locationState,
      locationAddress,
      latitude,
      longitude,
      showPhone,
      allowWhatsapp,
      images,
    }: CreateAdInput = req.body;

    // 1. Verify user existence and active status
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      sendError(res, 'USER_NOT_FOUND', 'User account does not exist', undefined, 404);
      return;
    }

    if (user.isBanned) {
      sendError(res, 'ACCOUNT_BANNED', 'Your account has been banned from posting ads', undefined, 403);
      return;
    }

    // 2. Verify category existence
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      sendError(res, 'CATEGORY_NOT_FOUND', 'Specified category does not exist', undefined, 404);
      return;
    }

    // 3. Query system settings for moderation and expiration
    const [autoApproveSetting, expirySetting] = await Promise.all([
      prisma.systemSetting.findUnique({ where: { key: 'auto_approve_ads' } }),
      prisma.systemSetting.findUnique({ where: { key: 'ad_expiry_days' } }),
    ]);

    const isAutoApprove = autoApproveSetting
      ? autoApproveSetting.value.toLowerCase() === 'true'
      : true;
    const initialStatus = isAutoApprove ? AdStatus.ACTIVE : AdStatus.PENDING;

    const expiryDays = parseInt(expirySetting?.value || '30', 10);
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    // 4. Generate unique ad slug
    let slug = generateAdSlug(title);
    let existingSlug = await prisma.ad.findUnique({ where: { slug } });
    let attempts = 0;
    while (existingSlug && attempts < 5) {
      slug = generateAdSlug(title);
      existingSlug = await prisma.ad.findUnique({ where: { slug } });
      attempts++;
    }

    // 5. Normalize images array
    const normalizedImages = (images || []).map((img, index) => {
      if (typeof img === 'string') {
        return {
          url: img,
          publicId: null,
          order: index,
        };
      }
      return {
        url: img.url,
        publicId: img.publicId || null,
        order: typeof img.order === 'number' ? img.order : index,
      };
    });

    // 6. Persist ad with nested images
    const newAd = await prisma.ad.create({
      data: {
        userId,
        categoryId,
        title,
        slug,
        description,
        price,
        currency: currency || 'PKR',
        isNegotiable: isNegotiable ?? false,
        condition: (condition as AdCondition) || AdCondition.USED_GOOD,
        status: initialStatus,
        locationCity,
        locationState: locationState || 'Punjab',
        locationAddress: locationAddress || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        showPhone: showPhone ?? true,
        allowWhatsapp: allowWhatsapp ?? true,
        expiresAt,
        images: {
          create: normalizedImages,
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        user: {
          select: { id: true, name: true, phone: true, avatarUrl: true, createdAt: true },
        },
      },
    });

    sendSuccess(
      res,
      newAd,
      initialStatus === AdStatus.ACTIVE
        ? 'Ad created and published successfully'
        : 'Ad submitted successfully and is pending administrative review',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get public ads feed with multi-field filtering and proximity search
 * GET /api/v1/ads
 */
export const getAds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = (req.query as unknown as AdFilterQueryParams) || {};
    const {
      search,
      categoryId,
      city,
      minPrice,
      maxPrice,
      condition,
      lat,
      lng,
      radius,
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = query;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));

    // 1. Resolve category hierarchy: include children if parent is queried
    let categoryIds: string[] | undefined;
    if (categoryId) {
      const subcategories = await prisma.category.findMany({
        where: { parentId: categoryId },
        select: { id: true },
      });
      categoryIds = [categoryId, ...subcategories.map((c) => c.id)];
    }

    // 2. Branch: Spatial Haversine Query when lat and lng provided
    if (lat !== undefined && lng !== undefined) {
      const [ads, total] = await Promise.all([
        findNearbyAds({
          latitude: Number(lat),
          longitude: Number(lng),
          radiusKm: radius ? Number(radius) : 50,
          categoryId,
          categoryIds,
          search,
          city,
          minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
          condition,
          limit: limitNum,
          offset: (pageNum - 1) * limitNum,
        }),
        countNearbyAds({
          latitude: Number(lat),
          longitude: Number(lng),
          radiusKm: radius ? Number(radius) : 50,
          categoryId,
          categoryIds,
          search,
          city,
          minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
          condition,
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);
      const pagination = {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      };

      sendSuccess(res, ads, 'Nearby ads retrieved successfully', 200, { pagination });
      return;
    }

    // 3. Branch: Standard Multi-Field Prisma Query
    const where: Prisma.AdWhereInput = {
      status: AdStatus.ACTIVE,
      user: {
        isBanned: false,
      },
    };

    if (categoryIds && categoryIds.length > 0) {
      where.categoryId = { in: categoryIds };
    }

    if (city) {
      where.locationCity = { equals: city };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {
        ...(minPrice !== undefined && { gte: Number(minPrice) }),
        ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
      };
    }

    if (condition) {
      where.condition = condition as AdCondition;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    let orderBy: Prisma.AdOrderByWithRelationInput[] = [];
    if (sortBy === 'price_asc') {
      orderBy = [{ price: 'asc' }];
    } else if (sortBy === 'price_desc') {
      orderBy = [{ price: 'desc' }];
    } else if (sortBy === 'oldest') {
      orderBy = [{ createdAt: 'asc' }];
    } else if (sortBy === 'views') {
      orderBy = [{ viewsCount: 'desc' }];
    } else {
      // Default: featured ads first, then newest
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const [rawAds, total] = await Promise.all([
      prisma.ad.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true, icon: true },
          },
          user: {
            select: { id: true, name: true, avatarUrl: true, createdAt: true },
          },
        },
      }),
      prisma.ad.count({ where }),
    ]);

    const ads = rawAds.map((ad) => ({
      ...ad,
      price: Number(ad.price),
    }));

    const totalPages = Math.ceil(total / limitNum);
    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };

    sendSuccess(res, ads, 'Ads retrieved successfully', 200, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single ad details by slug with atomic viewsCount increment and privacy guards
 * GET /api/v1/ads/:slug
 */
export const getAdBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      sendError(res, 'BAD_REQUEST', 'Ad slug parameter is required', undefined, 400);
      return;
    }

    // 1. Query ad by unique slug with relations
    let ad = await prisma.ad.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        category: {
          select: { id: true, name: true, slug: true, icon: true, parentId: true },
        },
        user: {
          select: { id: true, name: true, phone: true, avatarUrl: true, isBanned: true, createdAt: true },
        },
      },
    });

    // Fallback: If not found and slug matches UUID pattern, attempt ID lookup
    if (!ad) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(slug)) {
        ad = await prisma.ad.findUnique({
          where: { id: slug },
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            category: {
              select: { id: true, name: true, slug: true, icon: true, parentId: true },
            },
            user: {
              select: { id: true, name: true, phone: true, avatarUrl: true, isBanned: true, createdAt: true },
            },
          },
        });
      }
    }

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Hide ad if owner is banned (unless viewing by admin)
    if (ad.user && (ad.user as { isBanned?: boolean }).isBanned) {
      const isAdmin = req.user && req.user.role === 'ADMIN';
      if (!isAdmin) {
        sendError(res, 'AD_NOT_FOUND', 'Ad not found or owner account suspended', undefined, 404);
        return;
      }
    }

    // 3. Access control: only ACTIVE ads are public; non-active only accessible by owner or admin
    if (ad.status !== AdStatus.ACTIVE) {
      const isOwner = req.user && req.user.userId === ad.userId;
      const isAdmin = req.user && req.user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        sendError(res, 'AD_NOT_FOUND', 'Ad not found or is no longer active', undefined, 404);
        return;
      }
    }

    // 3. Atomically increment views count in database
    await prisma.ad.update({
      where: { id: ad.id },
      data: { viewsCount: { increment: 1 } },
    });

    // 4. Enforce phone privacy toggle
    const sellerPhone = ad.showPhone ? ad.user.phone : null;

    const formattedAd = {
      ...ad,
      price: Number(ad.price),
      viewsCount: ad.viewsCount + 1,
      user: {
        ...ad.user,
        phone: sellerPhone,
      },
    };

    sendSuccess(res, formattedAd, 'Ad details retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Update ad status (e.g. toggle between ACTIVE and SOLD)
 * PATCH /api/v1/ads/:id/status
 */
export const updateAdStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id } = req.params;
    const { status }: AdStatusUpdateInput = req.body;

    // 1. Locate ad
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Ownership verification: seller or admin
    const isOwner = ad.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to modify this ad', undefined, 403);
      return;
    }

    // 3. Moderation protection: Non-admins cannot activate unapproved or rejected ads
    if (!isAdmin && (ad.status === AdStatus.PENDING || ad.status === AdStatus.REJECTED)) {
      sendError(
        res,
        'BAD_REQUEST',
        'Cannot update status of an ad that is pending moderation or rejected',
        undefined,
        400
      );
      return;
    }

    // 4. Update status in database
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: { status: status as AdStatus },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    sendSuccess(
      res,
      {
        ...updatedAd,
        price: Number(updatedAd.price),
      },
      `Ad status updated to ${status} successfully`,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing ad
 * PUT /api/v1/ads/:id
 */
export const updateAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id } = req.params;
    const updateData: UpdateAdInput = req.body;

    // 1. Locate existing ad
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: { images: true },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Ownership verification
    const isOwner = ad.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to edit this ad', undefined, 403);
      return;
    }

    // 3. Category verification if categoryId changed
    if (updateData.categoryId && updateData.categoryId !== ad.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateData.categoryId },
      });
      if (!category) {
        sendError(res, 'CATEGORY_NOT_FOUND', 'Specified category does not exist', undefined, 404);
        return;
      }
    }

    // 4. Title & slug handling
    let slug = ad.slug;
    if (updateData.title && updateData.title.trim() !== ad.title) {
      slug = generateAdSlug(updateData.title);
    }

    // 5. Moderation status re-check: if auto_approve_ads is false and user is not admin
    let nextStatus = ad.status;
    if (!isAdmin && ad.status === AdStatus.ACTIVE) {
      const autoApproveSetting = await prisma.systemSetting.findUnique({
        where: { key: 'auto_approve_ads' },
      });
      const isAutoApprove = autoApproveSetting
        ? autoApproveSetting.value.toLowerCase() === 'true'
        : true;
      if (!isAutoApprove) {
        nextStatus = AdStatus.PENDING;
      }
    }

    // 6. Update transaction: replace images if provided, update scalar fields
    const updatedAd = await prisma.$transaction(async (tx) => {
      if (updateData.images !== undefined) {
        // Delete existing images
        await tx.adImage.deleteMany({ where: { adId: id } });

        // Insert new images
        if (updateData.images.length > 0) {
          const imageRecords = updateData.images.map((img, idx) => {
            if (typeof img === 'string') {
              return {
                adId: id,
                url: img,
                publicId: null,
                order: idx,
              };
            }
            return {
              adId: id,
              url: img.url,
              publicId: img.publicId || null,
              order: img.order !== undefined ? img.order : idx,
            };
          });

          await tx.adImage.createMany({ data: imageRecords });
        }
      }

      return tx.ad.update({
        where: { id },
        data: {
          title: updateData.title !== undefined ? updateData.title.trim() : undefined,
          slug,
          description: updateData.description !== undefined ? updateData.description.trim() : undefined,
          categoryId: updateData.categoryId,
          price: updateData.price !== undefined ? new Prisma.Decimal(updateData.price) : undefined,
          currency: updateData.currency !== undefined ? updateData.currency.trim() : undefined,
          isNegotiable: updateData.isNegotiable,
          condition: updateData.condition as AdCondition | undefined,
          locationCity: updateData.locationCity !== undefined ? updateData.locationCity.trim() : undefined,
          locationState: updateData.locationState !== undefined ? updateData.locationState.trim() : undefined,
          locationAddress: updateData.locationAddress !== undefined ? updateData.locationAddress?.trim() : undefined,
          latitude: updateData.latitude,
          longitude: updateData.longitude,
          showPhone: updateData.showPhone,
          allowWhatsapp: updateData.allowWhatsapp,
          status: nextStatus,
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          user: { select: { id: true, name: true, phone: true, avatarUrl: true } },
        },
      });
    });

    sendSuccess(
      res,
      {
        ...updatedAd,
        price: Number(updatedAd.price),
      },
      'Ad updated successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete an ad
 * DELETE /api/v1/ads/:id
 */
export const deleteAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id } = req.params;

    // 1. Locate ad
    const ad = await prisma.ad.findUnique({
      where: { id },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Ownership verification: seller or admin
    const isOwner = ad.userId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isOwner && !isAdmin) {
      sendError(res, 'FORBIDDEN', 'You do not have permission to delete this ad', undefined, 403);
      return;
    }

    // 3. Delete ad (cascades automatically delete images, conversations, favorites, reports)
    await prisma.ad.delete({
      where: { id },
    });

    sendSuccess(
      res,
      { id, deleted: true },
      'Ad deleted successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's own ads (with status filter and pagination)
 * GET /api/v1/ads/my-ads
 */
export const getMyAds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { status, page = 1, limit = 20 }: MyAdsQueryParams = req.query as any;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.AdWhereInput = {
      userId,
      ...(status ? { status: status as AdStatus } : {}),
    };

    const [total, ads] = await Promise.all([
      prisma.ad.count({ where: whereClause }),
      prisma.ad.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          _count: {
            select: {
              favorites: true,
              conversations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const formattedAds = ads.map((ad) => ({
      ...ad,
      price: Number(ad.price),
      favoritesCount: ad._count.favorites,
      conversationsCount: ad._count.conversations,
    }));

    sendSuccess(
      res,
      {
        ads: formattedAds,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      'User ads retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Report an ad for spam, fraud, inappropriate content, etc.
 * POST /api/v1/ads/:id/report
 */
export const reportAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required to report an ad', undefined, 401);
      return;
    }

    const { id } = req.params;
    const { reason, details }: CreateReportInput = req.body;

    // 1. Check target ad exists
    const ad = await prisma.ad.findUnique({
      where: { id },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Prevent self-reporting
    if (ad.userId === userId) {
      sendError(res, 'BAD_REQUEST', 'You cannot report your own ad', undefined, 400);
      return;
    }

    // 3. Prevent duplicate unresolved reports by the same user
    const existingReport = await prisma.report.findFirst({
      where: {
        adId: id,
        reporterId: userId,
        status: ReportStatus.PENDING,
      },
    });

    if (existingReport) {
      sendError(
        res,
        'CONFLICT',
        'You have already submitted an active report for this ad that is pending review',
        undefined,
        409
      );
      return;
    }

    // 4. Create report record
    const report = await prisma.report.create({
      data: {
        adId: id,
        reporterId: userId,
        reason,
        details: details?.trim() || null,
        status: ReportStatus.PENDING,
      },
      include: {
        ad: { select: { id: true, title: true, slug: true } },
      },
    });

    sendSuccess(res, report, 'Report submitted successfully and queued for review', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Reveal seller phone number and direct WhatsApp URL for an ad with rate limiting and privacy checks
 * POST /api/v1/ads/:id/reveal-phone
 */
export const revealAdPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Query ad with seller profile
    const ad = await prisma.ad.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        userId: true,
        showPhone: true,
        allowWhatsapp: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad listing not found', undefined, 404);
      return;
    }

    // 2. Status verification: If not active, allow only ad owner or admin
    if (ad.status !== AdStatus.ACTIVE) {
      const currentUserId = req.user?.userId;
      const isAdmin = req.user?.role === 'ADMIN';
      const isOwner = currentUserId && ad.userId === currentUserId;

      if (!isOwner && !isAdmin) {
        sendError(res, 'AD_NOT_FOUND', 'Ad not found or is no longer active', undefined, 404);
        return;
      }
    }

    // 3. Privacy check: Did seller disable public phone display?
    if (!ad.showPhone) {
      sendError(
        res,
        'PHONE_HIDDEN',
        'The seller has disabled direct phone contact for this listing.',
        undefined,
        403
      );
      return;
    }

    // 4. Availability check: Does seller profile have a phone number?
    if (!ad.user.phone || !ad.user.phone.trim()) {
      sendError(
        res,
        'PHONE_NOT_AVAILABLE',
        'Seller has not provided a contact phone number.',
        undefined,
        404
      );
      return;
    }

    // 5. Construct direct WhatsApp link if allowed
    const whatsappUrl = ad.allowWhatsapp
      ? buildWhatsAppUrl(ad.user.phone, formatAdWhatsAppMessage(ad.title, ad.slug))
      : null;

    sendSuccess(
      res,
      {
        adId: ad.id,
        sellerName: ad.user.name,
        phone: ad.user.phone.trim(),
        showPhone: ad.showPhone,
        allowWhatsapp: ad.allowWhatsapp,
        whatsappUrl,
      },
      'Seller phone contact details revealed successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle favorite on an ad (Add or Remove)
 * POST /api/v1/ads/:id/favorite
 */
export const toggleFavoriteAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { id: adId } = req.params;

    // 1. Check if ad exists
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: { id: true, title: true, status: true },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    // 2. Check existing favorite
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_adId: {
          userId,
          adId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });

      sendSuccess(
        res,
        { adId, isFavorited: false },
        'Ad removed from favorites',
        200
      );
    } else {
      // Add favorite
      await prisma.favorite.create({
        data: {
          userId,
          adId,
        },
      });

      sendSuccess(
        res,
        { adId, isFavorited: true },
        'Ad added to favorites',
        201
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user's favorite ads
 * GET /api/v1/ads/favorites
 */
export const getFavoriteAds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'UNAUTHORIZED', 'Authentication required', undefined, 401);
      return;
    }

    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [total, favorites] = await Promise.all([
      prisma.favorite.count({
        where: { userId },
      }),
      prisma.favorite.findMany({
        where: { userId },
        include: {
          ad: {
            include: {
              images: { orderBy: { order: 'asc' } },
              category: { select: { id: true, name: true, slug: true, icon: true } },
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  phone: true,
                  isPhoneVerified: true,
                  createdAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const ads = favorites
      .filter((fav) => fav.ad !== null)
      .map((fav) => ({
        ...fav.ad,
        price: Number(fav.ad.price),
        isFavorited: true,
        favoritedAt: fav.createdAt,
      }));

    sendSuccess(
      res,
      {
        ads,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      'Favorite ads retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};


