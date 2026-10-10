import express from 'express';
import { protect, restrictTo } from '../../middleware/auth.js';
import { createOrder, getMyOrders, getOrderDetails, updateStatus, cancelMyOrder } from './order.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', restrictTo('customer'), createOrder);
router.get('/my-orders', restrictTo('customer'), getMyOrders);
router.patch('/:id/cancel', restrictTo('customer'), cancelMyOrder);
router.get('/:id', restrictTo('customer', 'seller', 'admin'), getOrderDetails);
router.patch('/:id/status', restrictTo('seller', 'admin'), updateStatus);

export default router;
