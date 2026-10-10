import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshToken,
  googleAuth,
} from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { authenticateUser } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  googleAuthSchema,
} from '../schemas/authSchemas';

const router = Router();

// Public Authentication Routes
router.post('/register', validateRequest({ body: registerSchema }), registerUser);
router.post('/login', validateRequest({ body: loginSchema }), loginUser);
router.post('/refresh', validateRequest({ body: refreshTokenSchema }), refreshToken);
router.post('/google', validateRequest({ body: googleAuthSchema }), googleAuth);

// Protected Authentication Routes
router.get('/me', authenticateUser, getCurrentUser);

export default router;
