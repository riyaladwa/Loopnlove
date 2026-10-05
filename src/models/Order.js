import mongoose from 'mongoose';

const orderItemSnapshotSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  },
  customizationNotes: {
    type: String,
    default: ''
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderReference: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true }
  },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  instructions: {
    type: String,
    default: ''
  },
  items: [orderItemSnapshotSchema],
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  customizationInstructions: {
    type: String,
    default: ''
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Ready to Dispatch', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'System' },
    note: { type: String, default: '' }
  }],
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Refunded', 'Manual_Verification'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'Online_Razorpay', 'UPI_QR', 'Direct_UPI', 'GooglePay', 'WhatsApp_Manual', 'Test_Gateway'],
    default: 'UPI_QR'
  },
  paymentReference: {
    type: String,
    default: ''
  },
  upiTransactionId: {
    type: String,
    default: ''
  },
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },
  adminWhatsappNotificationSent: {
    type: Boolean,
    default: false
  },
  adminWhatsappNotificationStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed', 'Disabled'],
    default: 'Disabled'
  },
  adminWhatsappNotificationError: {
    type: String,
    default: ''
  },
  adminWhatsappNotificationSentAt: {
    type: Date,
    default: null
  },
  emailNotificationSent: {
    type: Boolean,
    default: false
  },
  emailNotificationStatus: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed', 'Disabled'],
    default: 'Pending'
  },
  emailNotificationError: {
    type: String,
    default: ''
  },
  emailNotificationSentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
