import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/adminSettingsController';
import { getCategories } from '../controllers/categoryController';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminCategoryController';
import {
  getPendingAds,
  moderateAd,
  getReports,
  updateReportStatus,
  getAdminDashboardMetrics,
} from '../controllers/adminModerationController';
import { authenticateUser } from '../middleware/auth';
import { requireAdmin } from '../middleware/roleCheck';
import { validateRequest } from '../middleware/validate';
import {
  getUsers,
  updateUserBanStatus,
  updateUserVerificationStatus,
} from '../controllers/adminUserController';
import {
  updateSettingsSchema,
  moderateAdSchema,
  updateReportStatusSchema,
  pendingAdsQuerySchema,
  reportsQuerySchema,
  adminUsersQuerySchema,
  banUserSchema,
  verifyUserSchema,
  userIdParamSchema,
} from '../schemas/adminSchemas';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../schemas/categorySchemas';
import { adIdParamSchema } from '../schemas/adSchemas';

const router = Router();

// Protect all admin routes with authentication & ADMIN role guard
router.use(authenticateUser, requireAdmin);

// Dashboard Metrics & Activity Overview
router.get('/dashboard', getAdminDashboardMetrics);

// System Settings Management
router.get('/settings', getSettings);
router.put('/settings', validateRequest({ body: updateSettingsSchema }), updateSettings);

// Category Management
router.get('/categories', getCategories);
router.post('/categories', validateRequest({ body: createCategorySchema }), createCategory);
router.put('/categories/:id', validateRequest({ body: updateCategorySchema }), updateCategory);
router.delete('/categories/:id', deleteCategory);

// User Management
router.get('/users', validateRequest({ query: adminUsersQuerySchema }), getUsers);
router.patch('/users/:id/ban', validateRequest({ params: userIdParamSchema, body: banUserSchema }), updateUserBanStatus);
router.patch('/users/:id/verify', validateRequest({ params: userIdParamSchema, body: verifyUserSchema }), updateUserVerificationStatus);

// Ad Moderation Queue
router.get('/ads/pending', validateRequest({ query: pendingAdsQuerySchema }), getPendingAds);
router.patch('/ads/:id/moderate', validateRequest({ params: adIdParamSchema, body: moderateAdSchema }), moderateAd);

// Reports Queue
router.get('/reports', validateRequest({ query: reportsQuerySchema }), getReports);
router.patch('/reports/:id', validateRequest({ params: adIdParamSchema, body: updateReportStatusSchema }), updateReportStatus);

export default router;

