import { Request, Response, NextFunction } from 'express';
import { uploadFile, deleteFile, StorageResult } from '../services/storageService';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Handles multipart image uploads (up to 8 images under 'images' field)
 */
export const uploadImagesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const files = (req.files as Express.Multer.File[]) || [];

  if (!files || files.length === 0) {
    return sendError(
      res,
      'NO_FILES_PROVIDED',
      'Please provide at least one image to upload under the "images" field.',
      undefined,
      400
    );
  }

  const uploadedResults: StorageResult[] = [];

  try {
    for (const file of files) {
      const result = await uploadFile(file.buffer, file.originalname, file.mimetype);
      uploadedResults.push(result);
    }

    return sendSuccess(
      res,
      {
        urls: uploadedResults.map((r) => r.url),
        images: uploadedResults,
      },
      'Images uploaded successfully',
      201
    );
  } catch (error) {
    // Automated rollback: clean up partially uploaded files in this batch
    for (const uploaded of uploadedResults) {
      try {
        await deleteFile(uploaded.publicId);
      } catch (cleanupError) {
        console.warn('[Upload Rollback Warning] Failed to delete orphaned file:', cleanupError);
      }
    }
    next(error);
  }
};

/**
 * Handles single image upload under 'image' field
 */
export const uploadSingleImageHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const file = req.file as Express.Multer.File | undefined;

  if (!file) {
    return sendError(
      res,
      'NO_FILE_PROVIDED',
      'Please provide an image to upload under the "image" field.',
      undefined,
      400
    );
  }

  try {
    const result = await uploadFile(file.buffer, file.originalname, file.mimetype);

    return sendSuccess(
      res,
      {
        url: result.url,
        image: result,
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};
