import express from 'express';
import {
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  recordPaymentFailure
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/failure', recordPaymentFailure);

export default router;
