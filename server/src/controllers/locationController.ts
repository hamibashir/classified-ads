import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { PAKISTANI_CITIES, CityData } from '../constants/cities';
import { sendSuccess } from '../utils/apiResponse';

/**
 * Get supported Pakistani cities with GPS coordinates and provinces
 * GET /api/v1/locations/cities
 */
export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let cities: CityData[] = PAKISTANI_CITIES;

    // Check if customized city list exists in database system_settings
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'supported_cities' },
    });

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cities = parsed;
        }
      } catch {
        // Fallback to static constant if JSON parsing fails
        cities = PAKISTANI_CITIES;
      }
    }

    // Optional filter by popular cities: ?popular=true
    const isPopularOnly = req.query.popular === 'true';
    if (isPopularOnly) {
      cities = cities.filter((city) => city.isPopular);
    }

    sendSuccess(
      res,
      { cities },
      'Supported cities retrieved successfully.',
      200
    );
  } catch (error) {
    next(error);
  }
};
