import { Request, Response, NextFunction } from 'express';
import { AdStatus, ReportStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/db';
import {
  ModerateAdInput,
  UpdateReportStatusInput,
  PendingAdsQueryParams,
  ReportsQueryParams,
} from '../schemas/adminSchemas';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Get pending ads queue for administrative moderation
 * GET /api/v1/admin/ads/pending
 */
export const getPendingAds = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 20 }: PendingAdsQueryParams = req.query as any;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.AdWhereInput = {
      status: AdStatus.PENDING,
    };

    const [total, ads] = await Promise.all([
      prisma.ad.count({ where: whereClause }),
      prisma.ad.findMany({
        where: whereClause,
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true, icon: true } },
          user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        },
        orderBy: { createdAt: 'asc' }, // Oldest pending first
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const formattedAds = ads.map((ad) => ({
      ...ad,
      price: Number(ad.price),
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
      'Pending ads retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Moderate an ad (Approve or Reject with reason)
 * PATCH /api/v1/admin/ads/:id/moderate
 */
export const moderateAd = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, rejectionReason }: ModerateAdInput = req.body;

    // 1. Locate target ad
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!ad) {
      sendError(res, 'AD_NOT_FOUND', 'Ad not found', undefined, 404);
      return;
    }

    let updatedAd;

    if (action === 'APPROVE') {
      // Query system setting for expiry days
      const expirySetting = await prisma.systemSetting.findUnique({
        where: { key: 'ad_expiry_days' },
      });
      const expiryDays = parseInt(expirySetting?.value || '30', 10);
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          status: AdStatus.ACTIVE,
          rejectionReason: null,
          expiresAt,
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      sendSuccess(
        res,
        {
          ...updatedAd,
          price: Number(updatedAd.price),
        },
        'Ad approved successfully and published to marketplace',
        200
      );
      return;
    } else {
      // action === 'REJECT'
      updatedAd = await prisma.ad.update({
        where: { id },
        data: {
          status: AdStatus.REJECTED,
          rejectionReason: rejectionReason?.trim() || 'Violates community guidelines',
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      sendSuccess(
        res,
        {
          ...updatedAd,
          price: Number(updatedAd.price),
        },
        'Ad rejected successfully',
        200
      );
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get user reports queue for moderation
 * GET /api/v1/admin/reports
 */
export const getReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 }: ReportsQueryParams = req.query as any;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: Prisma.ReportWhereInput = {
      ...(status ? { status: status as ReportStatus } : {}),
    };

    const [total, reports] = await Promise.all([
      prisma.report.count({ where: whereClause }),
      prisma.report.findMany({
        where: whereClause,
        include: {
          ad: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              price: true,
              userId: true,
              images: { orderBy: { order: 'asc' }, take: 1, select: { url: true } },
              user: { select: { id: true, name: true, email: true } },
            },
          },
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    const formattedReports = reports.map((r) => ({
      ...r,
      ad: r.ad
        ? {
            ...r.ad,
            price: Number(r.ad.price),
          }
        : null,
    }));

    sendSuccess(
      res,
      {
        reports: formattedReports,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
      'Reports retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update report status (RESOLVED or DISMISSED) with optional ad take down
 * PATCH /api/v1/admin/reports/:id
 */
export const updateReportStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, takeDownAd }: UpdateReportStatusInput = req.body;

    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        ad: { select: { id: true, title: true } },
      },
    });

    if (!report) {
      sendError(res, 'REPORT_NOT_FOUND', 'Report not found', undefined, 404);
      return;
    }

    // If takeDownAd is requested, take down the reported ad to REJECTED
    if (takeDownAd && report.adId) {
      const rejectionReason = `Taken down due to user report (${report.reason})${
        report.details ? `: ${report.details}` : ''
      }`;

      await prisma.ad.update({
        where: { id: report.adId },
        data: {
          status: AdStatus.REJECTED,
          rejectionReason,
        },
      });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status: status as ReportStatus },
      include: {
        ad: { select: { id: true, title: true, slug: true, status: true } },
        reporter: { select: { id: true, name: true, email: true } },
      },
    });

    const successMessage = takeDownAd
      ? `Listing "${report.ad?.title || 'Reported Ad'}" taken down and report marked as ${status}`
      : `Report marked as ${status} successfully`;

    sendSuccess(
      res,
      updatedReport,
      successMessage,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated dashboard metrics and recent activity for admin panel
 * GET /api/v1/admin/dashboard
 */
export const getAdminDashboardMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalAds,
      pendingAds,
      activeAds,
      soldAds,
      rejectedAds,
      totalUsers,
      unresolvedReports,
      recentPendingAds,
      recentReports,
    ] = await Promise.all([
      prisma.ad.count(),
      prisma.ad.count({ where: { status: AdStatus.PENDING } }),
      prisma.ad.count({ where: { status: AdStatus.ACTIVE } }),
      prisma.ad.count({ where: { status: AdStatus.SOLD } }),
      prisma.ad.count({ where: { status: AdStatus.REJECTED } }),
      prisma.user.count(),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.ad.findMany({
        where: { status: AdStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.findMany({
        where: { status: ReportStatus.PENDING },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          ad: { select: { id: true, title: true, slug: true } },
          reporter: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    const formattedRecentAds = recentPendingAds.map((ad) => ({
      ...ad,
      price: Number(ad.price),
    }));

    sendSuccess(
      res,
      {
        metrics: {
          totalAds,
          pendingAds,
          activeAds,
          soldAds,
          rejectedAds,
          totalUsers,
          unresolvedReports,
        },
        recentActivity: {
          recentPendingAds: formattedRecentAds,
          recentReports,
        },
      },
      'Dashboard metrics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

