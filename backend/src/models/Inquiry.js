import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  inquiryReference: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'Crochet Flowers & Bouquets',
      'Hair Accessories',
      'Crochet Bags',
      'Granny-Square Crochet Bags',
      'Keychains',
      'Custom Keychains',
      'Crochet Gifts',
      'Other Handmade Crochet'
    ],
    default: 'Crochet Flowers & Bouquets'
  },
  productName: {
    type: String,
    trim: true,
    default: ''
  },
  requestedCustomization: {
    type: String,
    required: [true, 'Customization description is required'],
    trim: true
  },
  preferredColours: {
    type: String,
    trim: true,
    default: ''
  },
  quantity: {
    type: Number,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  budget: {
    type: String,
    trim: true,
    default: ''
  },
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  referenceImage: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'quoted', 'accepted', 'rejected', 'completed'],
    default: 'new'
  },
  internalNotes: [{
    note: { type: String, required: true },
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

inquirySchema.index({ status: 1 });
inquirySchema.index({ category: 1 });
inquirySchema.index({ createdAt: -1 });

export const Inquiry = mongoose.model('Inquiry', inquirySchema);
