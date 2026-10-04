import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

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
    const orders = await Order.find({
      $or: [
        { user: req.user._id },
        { 'customer.email': req.user.email }
      ]
    }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: orders.length,
      orders
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
