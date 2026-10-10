import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { sendSuccess, sendError } from '../utils/apiResponse';

/**
 * Get all system settings
 * GET /api/v1/admin/settings
 */
export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settingsList = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    for (const item of settingsList) {
      settingsMap[item.key] = item.value;
    }

    sendSuccess(
      res,
      {
        settings: settingsList,
        settingsMap,
      },
      'System settings retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update system settings
 * PUT /api/v1/admin/settings
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Support either { settings: { key: value } } or direct key-value body
    const payload = req.body?.settings || req.body;

    if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) {
      sendError(
        res,
        'BAD_REQUEST',
        'At least one setting key-value pair must be provided.',
        undefined,
        400
      );
      return;
    }

    const updatedKeys: string[] = [];

    for (const [key, rawValue] of Object.entries(payload)) {
      if (key === 'settings') continue;

      const stringValue =
        typeof rawValue === 'object' && rawValue !== null
          ? JSON.stringify(rawValue)
          : String(rawValue);

      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: {
          key,
          value: stringValue,
          description: `Custom setting for ${key}`,
        },
      });

      updatedKeys.push(key);
    }

    // Fetch refreshed settings
    const refreshedList = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    for (const item of refreshedList) {
      settingsMap[item.key] = item.value;
    }

    sendSuccess(
      res,
      {
        updatedKeys,
        settings: refreshedList,
        settingsMap,
      },
      'System settings updated successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};
