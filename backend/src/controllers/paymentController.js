import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order.js';

let razorpayInstance = null;

function getRazorpayInstance() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    if (!razorpayInstance) {
      razorpayInstance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
    }
    return razorpayInstance;
  }
  return null;
}

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Public / Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      return res.status(503).json({
        configured: false,
        message: 'Razorpay payment gateway credentials are not yet configured in backend environment. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env to enable test mode online payments.'
      });
    }

    // Amount in paise (INR)
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.orderReference,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      configured: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderReference: order.orderReference
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Public / Private
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway configuration error' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature. Verification failed.' });
    }

    const order = await Order.findById(orderId);
    if (order) {
      order.paymentStatus = 'Paid';
      order.paymentMethod = 'Razorpay';
      order.razorpayPaymentId = razorpayPaymentId;
      order.orderStatus = 'Processing';
      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderReference: order ? order.orderReference : ''
    });
  } catch (err) {
    next(err);
  }
};
