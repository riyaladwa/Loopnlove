import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  identifier: {
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Crochet Flowers & Bouquets',
      'Hair Accessories',
      'Custom Keychains',
      'Crochet Bags',
      'Keychains'
    ],
    default: 'Crochet Flowers & Bouquets'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Primary product image is required']
  },
  images: [{
    type: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 10,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  pdfPage: {
    type: Number,
    default: 1
  },
  customizable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for fast querying
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
