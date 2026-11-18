import { Router } from 'express';
import {
  createAd,
  getAds,
  getAdBySlug,
  updateAdStatus,
  updateAd,
  deleteAd,
  getMyAds,
  reportAd,
  revealAdPhone,
  toggleFavoriteAd,
  getFavoriteAds,
  recordAdView,
} from '../controllers/adController';
import { authenticateUser, optionalAuth } from '../middleware/auth';
import { revealPhoneLimiter } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validate';
import {
  createAdSchema,
  adFilterQuerySchema,
  updateAdSchema,
  adStatusUpdateSchema,
  adIdParamSchema,
  myAdsQuerySchema,
  createReportSchema,
  favoritesQuerySchema,
} from '../schemas/adSchemas';

const router = Router();

/**
 * @route   GET /api/v1/ads
 * @desc    Get public ads feed with search, category, city, price & proximity filters
 * @access  Public
 */
router.get(
  '/',
  validateRequest({ query: adFilterQuerySchema }),
  getAds
);

/**
 * @route   POST /api/v1/ads
 * @desc    Create a new classified ad
 * @access  Protected (Requires Bearer token)
 */
router.post(
  '/',
  authenticateUser,
  validateRequest({ body: createAdSchema }),
  createAd
);

/**
 * @route   GET /api/v1/ads/my-ads
 * @desc    Get current authenticated user's own ads with status filter and pagination
 * @access  Protected (Requires Bearer token)
 */
router.get(
  '/my-ads',
  authenticateUser,
  validateRequest({ query: myAdsQuerySchema }),
  getMyAds
);

/**
 * @route   GET /api/v1/ads/favorites
 * @desc    Get current authenticated user's favorite ads with pagination
 * @access  Protected (Requires Bearer token)
 */
router.get(
  '/favorites',
  authenticateUser,
  validateRequest({ query: favoritesQuerySchema }),
  getFavoriteAds
);

/**
 * @route   POST /api/v1/ads/:id/favorite
 * @desc    Toggle favorite on an ad (add or remove)
 * @access  Protected (Requires Bearer token)
 */
router.post(
  '/:id/favorite',
  authenticateUser,
  validateRequest({ params: adIdParamSchema }),
  toggleFavoriteAd
);

/**
 * @route   PATCH /api/v1/ads/:id/status
 * @desc    Update ad status (e.g. toggle between ACTIVE and SOLD)
 * @access  Protected (Requires ad ownership or ADMIN role)
 */
router.patch(
  '/:id/status',
  authenticateUser,
  validateRequest({ params: adIdParamSchema, body: adStatusUpdateSchema }),
  updateAdStatus
);

/**
 * @route   PUT /api/v1/ads/:id
 * @desc    Update ad details, images, and category
 * @access  Protected (Requires ad ownership or ADMIN role)
 */
router.put(
  '/:id',
  authenticateUser,
  validateRequest({ params: adIdParamSchema, body: updateAdSchema }),
  updateAd
);

/**
 * @route   DELETE /api/v1/ads/:id
 * @desc    Permanently delete an ad
 * @access  Protected (Requires ad ownership or ADMIN role)
 */
router.delete(
  '/:id',
  authenticateUser,
  validateRequest({ params: adIdParamSchema }),
  deleteAd
);

/**
 * @route   POST /api/v1/ads/:id/report
 * @desc    Report an ad for spam, fraud, or inappropriate content
 * @access  Protected (Requires Bearer token)
 */
router.post(
  '/:id/report',
  authenticateUser,
  validateRequest({ params: adIdParamSchema, body: createReportSchema }),
  reportAd
);

/**
 * @route   POST /api/v1/ads/:id/reveal-phone
 * @desc    Reveal seller phone number and direct WhatsApp URL (rate limited)
 * @access  Public (Optional Bearer token)
 */
router.post(
  '/:id/reveal-phone',
  optionalAuth,
  revealPhoneLimiter,
  validateRequest({ params: adIdParamSchema }),
  revealAdPhone
);

/**
 * @route   POST /api/v1/ads/:id/view
 * @desc    Increment ad view counter
 * @access  Public
 */
router.post(
  '/:id/view',
  recordAdView
);

/**
 * @route   GET /api/v1/ads/:slug
 * @desc    Get details for a single ad by slug with atomic views count increment
 * @access  Public (Optional Bearer token for owner/admin viewing pending ads)
 */
router.get(
  '/:slug',
  optionalAuth,
  getAdBySlug
);

export default router;

