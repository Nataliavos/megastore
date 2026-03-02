import { Router } from 'express';
import { getAnalysis } from '../service/suppliersService.js';

const router = Router();
router.get('/analysis', getAnalysis);   // GET /api/suppliers/analysis

export default router;
