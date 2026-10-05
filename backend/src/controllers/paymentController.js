import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Setting } from '../models/Setting.js';

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

// @desc    Get public payment gateway configuration
// @route   GET /api/payments/config
// @access  Public
export const getPaymentConfig = async (req, res, next) => {
  try {
    const codSetting = await Setting.findOne({ key: 'COD_ENABLED' });
    const onlineSetting = await Setting.findOne({ key: 'ONLINE_PAYMENT_ENABLED' });

    const codEnabled = codSetting !== null ? Boolean(codSetting.value) : true;
    const onlineEnabled = onlineSetting !== null ? Boolean(onlineSetting.value) : true;
    const isConfigured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

    res.json({
      success: true,
      gateway: 'razorpay',
      configured: isConfigured,
      keyId: process.env.RAZORPAY_KEY_ID || '', // safe public key
      onlineEnabled,
      codEnabled,
      currency: 'INR'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create Razorpay Payment Order
// @route   POST /api/payments/create-order
// @access  Public / Private
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: 'This order is already paid.' });
    }

    const razorpay = getRazorpayInstance();

    if (!razorpay) {
      return res.status(503).json({
        success: false,
        configured: false,
        message: 'Razorpay online payment gateway is currently in test configuration. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env to activate live or sandbox payments.'
      });
    }

    // Amount in paise (INR) calculated strictly from server-side order total
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: 'INR',
      receipt: order.orderReference,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod = 'Razorpay';
    await order.save();

    res.json({
      success: true,
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

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters (orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature).'
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, message: 'Payment gateway configuration secret is missing on server' });
    }

    // Cryptographic signature check: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for verification' });
    }

    if (expectedSignature !== razorpaySignature) {
      // Mark as Failed
      order.paymentStatus = 'Failed';
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.orderStatus,
        changedAt: new Date(),
        changedBy: 'Razorpay Gateway',
        note: `Payment verification failed. Signature mismatch for payment ID: ${razorpayPaymentId}`
      });
      await order.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Signature matches -> Payment confirmed
    order.paymentStatus = 'Paid';
    order.paymentMethod = 'Razorpay';
    order.paymentReference = razorpayPaymentId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderStatus = 'Confirmed';

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: 'Confirmed',
      changedAt: new Date(),
      changedBy: 'Razorpay Gateway',
      note: `Online payment of ₹${order.totalAmount} verified successfully (Payment Ref: ${razorpayPaymentId})`
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully and order confirmed.',
      orderReference: order.orderReference,
      paymentReference: razorpayPaymentId,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Handle payment failure or modal dismissal
// @route   POST /api/payments/failure
// @access  Public / Private
export const recordPaymentFailure = async (req, res, next) => {
  try {
    const { orderId, reason, restoreStock } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only update if not already paid
    if (order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Failed';
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.orderStatus,
        changedAt: new Date(),
        changedBy: 'System / Customer',
        note: reason || 'Customer payment failed or checkout session cancelled'
      });

      // Restore inventory safely if requested and previously deducted
      if (restoreStock) {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stockQuantity: item.quantity },
              $set: { inStock: true }
            });
          }
        }
      }

      await order.save();
    }

    res.json({
      success: true,
      message: 'Payment status recorded',
      paymentStatus: order.paymentStatus
    });
  } catch (err) {
    next(err);
  }
};
