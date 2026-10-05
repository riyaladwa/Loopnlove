import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  getOrderByReference,
  updateUpiReference,
  getDashboardStats,
  updateOrderStatus,
  recordWhatsAppOrder
} from '../controllers/orderController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/track/:reference', getOrderByReference);
router.post('/track/:reference/upi-reference', updateUpiReference);

// Admin-only order routes
router.get('/stats', protect, adminOnly, getDashboardStats);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, adminOnly, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);
router.post('/record-whatsapp', protect, adminOnly, recordWhatsAppOrder);

export default router;
