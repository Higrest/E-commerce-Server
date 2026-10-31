import { Router } from 'express';
import { protect, requireRole } from '../../middleware/auth.js';
import { getProductsByStatus, getAllUsers, getAllSellers, approveProduct, rejectProduct, deleteUser } from './admin.controller.js';

const router = Router();
router.use(protect, requireRole('admin'));

router.get('/products', getProductsByStatus);
router.get('/users', getAllUsers);
router.get('/sellers', getAllSellers);
router.patch('/products/:id/approve', approveProduct);
router.patch('/products/:id/reject', rejectProduct);
router.delete('/users/:id', deleteUser);

export default router;