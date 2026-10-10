import express from 'express';
import { protect, restrictTo } from '../../middleware/auth.js';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from './product.controller.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', protect, restrictTo('seller'), createProduct);
router.put('/:id', protect, restrictTo('seller'), updateProduct);
router.delete('/:id', protect, restrictTo('seller', 'admin'), deleteProduct);

export default router;
