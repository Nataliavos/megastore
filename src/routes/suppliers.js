import { Router } from 'express';
import { getAnalysis } from '../services/suppliersService.js';

const router = Router();
router.get('/analysis', getAnalysis);   // GET /api/suppliers/analysis

export default router;
