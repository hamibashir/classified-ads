import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { uploadImages, uploadSingleImage } from '../middleware/upload';
import {
  uploadImagesHandler,
  uploadSingleImageHandler,
} from '../controllers/uploadController';

const router = Router();

/**
 * @route   POST /api/v1/upload
 * @desc    Upload multiple images (up to 8) under 'images' field
 * @access  Protected (Requires Bearer token)
 */
router.post('/', authenticateUser, uploadImages, uploadImagesHandler);

/**
 * @route   POST /api/v1/upload/single
 * @desc    Upload a single image under 'image' field
 * @access  Protected (Requires Bearer token)
 */
router.post('/single', authenticateUser, uploadSingleImage, uploadSingleImageHandler);

export default router;
