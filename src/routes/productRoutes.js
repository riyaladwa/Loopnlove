import express from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  updateProductStock,
  updateProductStatus,
  deleteProduct
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only management routes
router.post('/', protect, adminOnly, createProduct);
router.put('/:id', protect, adminOnly, updateProduct);
router.patch('/:id', protect, adminOnly, updateProduct);
router.patch('/:id/stock', protect, adminOnly, updateProductStock);
router.patch('/:id/status', protect, adminOnly, updateProductStatus);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
