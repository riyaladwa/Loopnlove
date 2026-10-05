import express from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  addInquiryNote
} from '../controllers/inquiryController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public inquiry submission
router.post('/', createInquiry);

// Admin-only inquiry management
router.get('/', protect, adminOnly, getInquiries);
router.get('/:id', protect, adminOnly, getInquiryById);
router.patch('/:id/status', protect, adminOnly, updateInquiryStatus);
router.post('/:id/notes', protect, adminOnly, addInquiryNote);

export default router;
