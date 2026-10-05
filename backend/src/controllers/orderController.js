import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Inquiry } from '../models/Inquiry.js';
import { Setting } from '../models/Setting.js';

// @desc    Create a new order with strict server-side price validation
// @route   POST /api/orders
// @access  Public (Optional User Auth)
export const createOrder = async (req, res, next) => {
  try {
    const {
      customer,
      shippingAddress,
      instructions,
      customizationInstructions,
      items,
      discount,
      discountCode,
      paymentMethod = 'COD',
      paymentReference,
      upiTransactionId
    } = req.body;

    // Field validation
    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer name, email, and phone number are required.' });
    }

    if (customer.name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please enter a valid full name.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number.' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address (address, city, pincode) is required.' });
    }

    if (shippingAddress.address.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Please enter a detailed street/delivery address.' });
    }

    const cleanPincode = shippingAddress.pincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit Indian PIN code.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided for order.' });
    }

    // Check payment method availability from store settings
    let selectedMethod = 'COD';
    if (paymentMethod === 'Razorpay' || paymentMethod === 'Online_Razorpay') {
      selectedMethod = 'Razorpay';
    } else if (paymentMethod === 'UPI_QR' || paymentMethod === 'Direct_UPI' || paymentMethod === 'GooglePay') {
      selectedMethod = 'UPI_QR';
    } else {
      selectedMethod = 'COD';
    }

    if (selectedMethod === 'COD') {
      const codSetting = await Setting.findOne({ key: 'COD_ENABLED' });
      const isCodEnabled = codSetting !== null ? Boolean(codSetting.value) : true;
      if (!isCodEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Cash on Delivery is currently disabled by the store. Please choose Online Payment / UPI.'
        });
      }
    } else if (selectedMethod === 'Razorpay') {
      const onlineSetting = await Setting.findOne({ key: 'ONLINE_PAYMENT_ENABLED' });
      const isOnlineEnabled = onlineSetting !== null ? Boolean(onlineSetting.value) : true;
      if (!isOnlineEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Online Payment is currently disabled by the store. Please choose Cash on Delivery or Direct UPI.'
        });
      }
    } else if (selectedMethod === 'UPI_QR') {
      const upiSetting = await Setting.findOne({ key: 'UPI_ENABLED' });
      const isUpiEnabled = upiSetting !== null ? Boolean(upiSetting.value) : true;
      if (!isUpiEnabled) {
        return res.status(400).json({
          success: false,
          message: 'Direct UPI / Google Pay payment is currently disabled by the store.'
        });
      }
    }

    // SERVER-SIDE VALIDATION: Two-pass stock check and strict price recalculation from DB
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      let dbProduct = null;
      if (item.id && String(item.id).match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(item.id);
      }
      if (!dbProduct && item.id) {
        dbProduct = await Product.findOne({ identifier: item.id });
      }
      if (!dbProduct && item.name) {
        dbProduct = await Product.findOne({ name: item.name });
      }

      if (!dbProduct) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name || item.id}" was not found in the verified catalogue.`
        });
      }

      // Check publication status
      if (dbProduct.publicationStatus === 'archived' || dbProduct.publicationStatus === 'unpublished') {
        return res.status(400).json({
          success: false,
          message: `Product "${dbProduct.name}" is no longer available for purchase.`
        });
      }

      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      // Strict inventory check: prevent purchasing more than available stock
      if (typeof dbProduct.stockQuantity === 'number' && dbProduct.stockQuantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${dbProduct.name}". Only ${dbProduct.stockQuantity} unit(s) available in stock.`
        });
      }

      // STRICT PRICING: Product price at purchase time from MongoDB
      const currentPrice = Number(dbProduct.price);
      calculatedSubtotal += (currentPrice * quantity);

      validatedItems.push({
        dbProduct,
        snapshot: {
          product: dbProduct._id,
          name: dbProduct.name,
          price: currentPrice,
          quantity,
          image: dbProduct.image,
          customizationNotes: item.customizationNotes || ''
        }
      });
    }

    // PASS 2: Deduct stock safely
    for (const { dbProduct, snapshot } of validatedItems) {
      if (dbProduct.stockQuantity !== undefined) {
        dbProduct.stockQuantity = Math.max(0, dbProduct.stockQuantity - snapshot.quantity);
        dbProduct.inStock = dbProduct.stockQuantity > 0 || (dbProduct.madeToOrder === true);
        await dbProduct.save();
      }
    }

    // Shipping calculation (Trusted store policy: Free over ₹999, else ₹79)
    const freeShippingThreshold = 999;
    const standardShippingFee = 79;
    const shippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : standardShippingFee;

    // Server-side discount calculation
    let calculatedDiscount = 0;
    if (discountCode && discountCode.trim().toUpperCase() === 'FIRST10') {
      calculatedDiscount = Math.round((calculatedSubtotal * 10) / 100);
    } else if (discount) {
      // Validate passed discount does not exceed 10%
      const candidateDiscount = Math.max(0, parseInt(discount) || 0);
      calculatedDiscount = Math.min(candidateDiscount, Math.round((calculatedSubtotal * 10) / 100));
    }

    const finalTotal = Math.max(0, calculatedSubtotal + shippingFee - calculatedDiscount);

    // Unique order reference
    const orderReference = `#LNL-${Date.now().toString().slice(-6)}`;

    // Order initial status
    const initialOrderStatus = 'Pending';
    const initialPaymentStatus = 'Pending';

    const order = await Order.create({
      orderReference,
      user: req.user ? req.user._id : null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: cleanPhone
      },
      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state || 'India',
        pincode: cleanPincode
      },
      instructions: instructions ? instructions.trim() : '',
      customizationInstructions: customizationInstructions ? customizationInstructions.trim() : '',
      items: validatedItems.map(v => v.snapshot),
      subtotal: calculatedSubtotal,
      shippingFee,
      discount: calculatedDiscount,
      totalAmount: finalTotal,
      orderStatus: initialOrderStatus,
      paymentStatus: initialPaymentStatus,
      paymentMethod: selectedMethod,
      paymentReference: (paymentReference || upiTransactionId || '').trim(),
      upiTransactionId: (upiTransactionId || paymentReference || '').trim(),
      statusHistory: [{
        status: initialOrderStatus,
        changedAt: new Date(),
        changedBy: customer.name.trim(),
        note: selectedMethod === 'UPI_QR'
          ? `Direct UPI / Google Pay payment placed by customer (UTR/Ref: ${(paymentReference || upiTransactionId || 'Pending verification').trim()}). Awaiting admin check.`
          : (selectedMethod === 'COD'
            ? 'Cash on Delivery order placed by customer'
            : 'Online payment order initiated via checkout')
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderReference: order.orderReference,
      totalAmount: order.totalAmount,
      orderId: order._id,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Track single order by public reference
// @route   GET /api/orders/track/:reference
// @access  Public
export const getOrderByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const cleanRef = reference.startsWith('#') ? reference : `#${reference}`;

    const order = await Order.findOne({
      $or: [
        { orderReference: cleanRef },
        { orderReference: reference }
      ]
    }).select('-razorpaySignature');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit or update UPI reference / UTR for an order
// @route   POST /api/orders/track/:reference/upi-reference
// @access  Public
export const updateUpiReference = async (req, res, next) => {
  try {
    const { reference } = req.params;
    const { utr } = req.body;
    if (!utr || String(utr).trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Please provide a valid UPI Reference / UTR number (at least 6 characters).' });
    }

    const cleanRef = reference.startsWith('#') ? reference : `#${reference}`;
    const order = await Order.findOne({
      $or: [
        { orderReference: cleanRef },
        { orderReference: reference }
      ]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order reference not found' });
    }

    const cleanUtr = String(utr).trim();
    order.paymentReference = cleanUtr;
    order.upiTransactionId = cleanUtr;
    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.orderStatus,
      changedAt: new Date(),
      changedBy: 'Customer',
      note: `Customer submitted UPI UTR Reference: ${cleanUtr}`
    });

    await order.save();

    res.json({
      success: true,
      message: 'UPI UTR reference recorded successfully',
      paymentReference: cleanUtr,
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const userQuery = [{ user: req.user._id }];
    if (req.user.email) {
      userQuery.push({ 'customer.email': new RegExp(`^${req.user.email.trim()}$`, 'i') });
    }
    const orders = await Order.find({ $or: userQuery }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order details (Admin only)
// @route   GET /api/orders/:id
// @access  Private/Admin
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, paymentMethod, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { orderReference: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregate dashboard metrics (Admin only)
// @route   GET /api/orders/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ['Pending', 'Processing', 'Confirmed'] }
    });
    const completedOrders = await Order.countDocuments({
      orderStatus: { $in: ['Shipped', 'Delivered'] }
    });

    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const totalInquiries = await Inquiry.countDocuments();
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });
    const totalProducts = await Product.countDocuments();

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
    const recentInquiries = await Inquiry.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalInquiries,
        newInquiries,
        totalProducts
      },
      recentOrders,
      recentInquiries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status and/or payment status independently (Admin only)
// @route   PUT /api/orders/:id/status or PATCH /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, note, restoreStock, paymentReference } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const adminName = req.user ? req.user.name : 'Store Administrator';

    // 1. Order Status update (independent)
    if (orderStatus && order.orderStatus !== orderStatus) {
      const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Ready to Dispatch', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid order status: ${orderStatus}. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      // Check stock restoration on cancellation
      if (orderStatus === 'Cancelled' && restoreStock && !['Shipped', 'Delivered'].includes(order.orderStatus)) {
        for (const item of order.items) {
          if (item.product) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stockQuantity: item.quantity },
              $set: { inStock: true }
            });
          }
        }
      }

      order.orderStatus = orderStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: orderStatus,
        changedAt: new Date(),
        changedBy: adminName,
        note: note || `Order status updated to ${orderStatus}`
      });
    }

    // 2. Payment Status update (independent)
    if (paymentStatus && order.paymentStatus !== paymentStatus) {
      const validPayment = ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded', 'Manual_Verification'];
      if (!validPayment.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid payment status: ${paymentStatus}. Must be one of: ${validPayment.join(', ')}`
        });
      }

      // Audit check for marking online payment as Paid:
      if (order.paymentMethod === 'Razorpay' && paymentStatus === 'Paid' && !order.razorpayPaymentId && !paymentReference) {
        return res.status(400).json({
          success: false,
          message: 'An online payment cannot be marked as Paid without a verified transaction or audit payment reference.'
        });
      }

      if (paymentReference) {
        order.paymentReference = paymentReference;
      }

      order.paymentStatus = paymentStatus;
      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.orderStatus,
        changedAt: new Date(),
        changedBy: adminName,
        note: note || `Payment status manually updated to ${paymentStatus}`
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record manual WhatsApp confirmed order (Admin only)
// @route   POST /api/orders/record-whatsapp
// @access  Private/Admin
export const recordWhatsAppOrder = async (req, res, next) => {
  try {
    const { customerName, phone, bouquetName, price, quantity, address } = req.body;

    const orderReference = `#LNL-WA-${Date.now().toString().slice(-4)}`;
    const totalAmount = Number(price) * Number(quantity);

    const order = await Order.create({
      orderReference,
      customer: {
        name: customerName,
        phone,
        email: `${phone.replace(/\D/g, '')}@whatsapp.order`
      },
      shippingAddress: {
        address: address || 'Confirmed via WhatsApp chat',
        city: 'India',
        state: 'India',
        pincode: '000000'
      },
      items: [{
        name: bouquetName,
        price: Number(price),
        quantity: Number(quantity)
      }],
      subtotal: totalAmount,
      shippingFee: 0,
      totalAmount,
      orderStatus: 'Confirmed',
      paymentStatus: 'Manual_Verification',
      paymentMethod: 'WhatsApp_Manual'
    });

    res.status(201).json({
      success: true,
      message: 'WhatsApp order logged successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};
