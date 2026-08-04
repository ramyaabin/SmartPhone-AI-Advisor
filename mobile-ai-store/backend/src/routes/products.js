import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getBrands,
  getFeatured
} from '../controllers/productController.js';

const router = Router();

router.get('/', getAllProducts);
router.get('/brands', getBrands);
router.get('/featured', getFeatured);
router.get('/:id', getProductById);

export default router;
