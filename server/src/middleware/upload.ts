import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { sendError } from '../utils/apiResponse';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_COUNT = 8;
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export class MulterFilterError extends Error {
  public code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'MulterFilterError';
    this.code = code;
  }
}

// In-memory storage for direct handoff to storage adapters
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new MulterFilterError(
        'INVALID_FILE_TYPE',
        `Invalid file type '${file.mimetype}'. Only JPEG, PNG, and WebP images are allowed.`
      )
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: MAX_IMAGE_COUNT
  },
  fileFilter
});

/**
 * Maps Multer errors to standardized API 400 responses
 */
export const handleMulterError = (err: any, res: Response): Response => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return sendError(
          res,
          'FILE_TOO_LARGE',
          `File size exceeds maximum limit of 5MB`,
          undefined,
          400
        );
      case 'LIMIT_FILE_COUNT':
        return sendError(
          res,
          'TOO_MANY_FILES',
          `Maximum ${MAX_IMAGE_COUNT} images allowed per upload`,
          undefined,
          400
        );
      case 'LIMIT_UNEXPECTED_FILE':
        return sendError(
          res,
          'UNEXPECTED_FIELD',
          `Unexpected upload field: '${err.field || 'unknown'}'. Please use the expected form field.`,
          undefined,
          400
        );
      default:
        return sendError(res, 'UPLOAD_ERROR', err.message, undefined, 400);
    }
  }

  if (err instanceof MulterFilterError || err?.code === 'INVALID_FILE_TYPE') {
    return sendError(
      res,
      'INVALID_FILE_TYPE',
      err.message || 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      undefined,
      400
    );
  }

  return sendError(
    res,
    'UPLOAD_ERROR',
    err?.message || 'An error occurred during file upload',
    undefined,
    400
  );
};

/**
 * Express middleware for uploading up to 8 images under 'images' field
 */
export const uploadImages = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const handler = upload.array('images', MAX_IMAGE_COUNT);
  handler(req, res, (err: any) => {
    if (err) {
      handleMulterError(err, res);
      return;
    }
    next();
  });
};

/**
 * Express middleware for uploading a single image under 'image' field
 */
export const uploadSingleImage = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const handler = upload.single('image');
  handler(req, res, (err: any) => {
    if (err) {
      handleMulterError(err, res);
      return;
    }
    next();
  });
};
