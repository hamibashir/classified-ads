import { Router } from 'express';
import { getCities } from '../controllers/locationController';

const router = Router();

// Public Location Endpoints
router.get('/cities', getCities);

export default router;
