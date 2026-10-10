import { Router } from 'express';
import { getCategories, getCategoryBySlug } from '../controllers/categoryController';

const router = Router();

// Public Category Discovery Endpoints
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

export default router;
