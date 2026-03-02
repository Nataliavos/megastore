import { Router } from 'express';
import { getTopProducts } from '../service/categoriesService.js';

const router = Router();
router.get('/:name/top-products', getTopProducts);  // GET /api/categories/:name/top-products

export default router;
