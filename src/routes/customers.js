import { Router } from 'express';
import { getHistory } from '../service/customersService.js';

const router = Router();
router.get('/:email/history', getHistory);  // GET /api/customers/:email/history

export default router;
