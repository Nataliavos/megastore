import { Router } from 'express';
import { runMigration } from '../service/migrateService.js';

const router = Router();
router.post('/', runMigration);   // POST /api/migrate

export default router;
