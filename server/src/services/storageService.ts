import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Readable } from 'stream';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export interface StorageResult {
  url: string;
  publicId: string;
  driver: 'local' | 'cloudinary';
}

export interface IStorageDriver {
  upload(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<StorageResult>;
  delete(publicId: string): Promise<boolean>;
}

/**
 * Local filesystem storage driver saving files into uploads/ directory
 */
export class LocalStorageDriver implements IStorageDriver {
  private uploadDir: string;

  constructor(customUploadDir?: string) {
    this.uploadDir = customUploadDir || path.resolve(__dirname, '../../uploads');
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.promises.access(this.uploadDir);
    } catch {
      await fs.promises.mkdir(this.uploadDir, { recursive: true });
    }
  }

  public async upload(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<StorageResult> {
    await this.ensureUploadDir();

    // Determine sanitized file extension
    let ext = path.extname(originalName).toLowerCase();
    if (!ext) {
      if (mimeType === 'image/webp') ext = '.webp';
      else if (mimeType === 'image/png') ext = '.png';
      else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') ext = '.jpg';
      else ext = '.bin';
    }

    ext = ext.replace(/[^a-z0-9.]/gi, '');

    const uniqueId = crypto.randomUUID();
    const fileName = `${uniqueId}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    await fs.promises.writeFile(filePath, fileBuffer);

    return {
      url: `/uploads/${fileName}`,
      publicId: fileName,
      driver: 'local',
    };
  }

  public async delete(publicId: string): Promise<boolean> {
    try {
      // Guard strictly against path traversal
      const safeFileName = path.basename(publicId);
      const filePath = path.join(this.uploadDir, safeFileName);

      await fs.promises.unlink(filePath);
      return true;
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }
}

/**
 * Cloudinary storage driver providing remote CDN delivery
 */
export class CloudinaryStorageDriver implements IStorageDriver {
  private isConfigured = false;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.isConfigured = true;
    }
  }

  public async upload(
    fileBuffer: Buffer,
    _originalName: string,
    _mimeType: string
  ): Promise<StorageResult> {
    if (!this.isConfigured) {
      throw new Error(
        'Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) must be configured in environment variables.'
      );
    }

    return new Promise<StorageResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'classified_ads_pk',
          resource_type: 'image',
        },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            return reject(error || new Error('Cloudinary upload returned an empty response.'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            driver: 'cloudinary',
          });
        }
      );

      Readable.from(fileBuffer).pipe(uploadStream);
    });
  }

  public async delete(publicId: string): Promise<boolean> {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured.');
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
      return result.result === 'ok' || result.result === 'not found';
    } catch {
      return false;
    }
  }
}

// Driver registry instances
let customDriver: IStorageDriver | null = null;
const localDriverInstance = new LocalStorageDriver();
let cloudinaryDriverInstance: CloudinaryStorageDriver | null = null;

export const getStorageDriver = (): IStorageDriver => {
  if (customDriver) return customDriver;

  const driverType = process.env.STORAGE_DRIVER?.toLowerCase();
  if (driverType === 'cloudinary') {
    if (!cloudinaryDriverInstance) {
      cloudinaryDriverInstance = new CloudinaryStorageDriver();
    }
    return cloudinaryDriverInstance;
  }

  return localDriverInstance;
};

export const setStorageDriver = (driver: IStorageDriver | null): void => {
  customDriver = driver;
};

export const uploadFile = (
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<StorageResult> => {
  return getStorageDriver().upload(fileBuffer, originalName, mimeType);
};

export const deleteFile = (publicId: string): Promise<boolean> => {
  return getStorageDriver().delete(publicId);
};

