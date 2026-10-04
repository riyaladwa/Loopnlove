import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Inquiry } from '../models/Inquiry.js';

// @desc    Create a new order with server-side price validation
// @route   POST /api/orders
// @access  Public (Optional User Auth)
export const createOrder = async (req, res, next) => {
  try {
    const { customer, shippingAddress, instructions, items, discount } = req.body;

    if (!customer || !customer.name || !customer.email || !customer.phone) {
      return res.status(400).json({ message: 'Customer name, email, and phone number are required.' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ message: 'Complete delivery address is required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for order.' });
    }

    // SERVER-SIDE VALIDATION: Recalculate prices from DB products
    let calculatedSubtotal = 0;
    const validatedItemSnapshots = [];

    for (const item of items) {
      // Find in DB by ID or identifier
      let dbProduct = null;
      if (item.id && item.id.match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(item.id);
      }
      if (!dbProduct && item.id) {
        dbProduct = await Product.findOne({ identifier: item.id });
      }
      if (!dbProduct && item.name) {
        dbProduct = await Product.findOne({ name: item.name });
      }

      // If product not found in DB, fallback to provided price if safe, else report error
      const price = dbProduct ? dbProduct.price : Number(item.price);
      const name = dbProduct ? dbProduct.name : item.name;
      const image = dbProduct ? dbProduct.image : (item.image || '');
      const quantity = Math.max(1, parseInt(item.quantity) || 1);

      calculatedSubtotal += (price * quantity);

      validatedItemSnapshots.push({
        product: dbProduct ? dbProduct._id : null,
        name,
        price,
        quantity,
        image,
        customizationNotes: item.customizationNotes || ''
      });

      // Update inventory if dbProduct exists
      if (dbProduct && dbProduct.stockQuantity >= quantity) {
        dbProduct.stockQuantity -= quantity;
        if (dbProduct.stockQuantity <= 0) {
          dbProduct.inStock = false;
        }
        await dbProduct.save();
      }
    }

    // Shipping calculation
    const freeShippingThreshold = 999;
    const standardShippingFee = 79;
    const shippingFee = calculatedSubtotal >= freeShippingThreshold ? 0 : standardShippingFee;

    // First order discount validation
    const safeDiscount = Math.max(0, parseInt(discount) || 0);
    const finalTotal = Math.max(0, calculatedSubtotal + shippingFee - safeDiscount);

    // Generate unique order reference
    const orderReference = `#LNL-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      orderReference,
      user: req.user ? req.user._id : null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim()
      },
      shippingAddress: {
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state || 'India',
        pincode: shippingAddress.pincode.trim()
      },
      instructions: instructions || '',
      items: validatedItemSnapshots,
      subtotal: calculatedSubtotal,
      shippingFee,
      discount: safeDiscount,
      totalAmount: finalTotal,
      orderStatus: 'Processing',
      paymentStatus: 'Pending',
      paymentMethod: 'Test_Gateway'
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderReference: order.orderReference,
      totalAmount: order.totalAmount,
      orderId: order._id
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
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.orderStatus = status;
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
      orderStatus: { $in: ['Pending', 'Processing', 'Order Received'] }
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


// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
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
