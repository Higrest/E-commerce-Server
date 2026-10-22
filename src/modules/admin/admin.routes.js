import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.js';
import { getProductsByStatus, approveProduct, rejectProduct } from './admin.controller.js';

const router = Router();
router.use(protect, requireRole('admin')); // замените protect на имя вашего auth-middleware

router.get('/products', getProductsByStatus);
router.patch('/products/:id/approve', approveProduct);
router.patch('/products/:id/reject', rejectProduct);

export default router;