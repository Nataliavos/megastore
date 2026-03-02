import { Router } from 'express';
import * as productsService from '../service/productsService.js';

const router = Router();

router.get('/',        productsService.getAll);   // GET    /api/products
router.get('/:sku',    productsService.getOne);   // GET    /api/products/:sku
router.post('/',       productsService.create);   // POST   /api/products
router.put('/:sku',    productsService.update);   // PUT    /api/products/:sku
router.delete('/:sku', productsService.remove);   // DELETE /api/products/:sku

export default router;
