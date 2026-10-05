import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  updateContactStatus
} from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public submission
router.post('/', submitContactMessage);

// Admin endpoints
router.get('/', protect, adminOnly, getContactMessages);
router.patch('/:id/status', protect, adminOnly, updateContactStatus);

export default router;
