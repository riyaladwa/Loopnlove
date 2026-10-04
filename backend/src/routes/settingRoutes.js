import express from 'express';
import {
  getPublicSettings,
  getAllSettings,
  updateSetting
} from '../controllers/settingController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/public', getPublicSettings);
router.get('/', protect, adminOnly, getAllSettings);
router.put('/', protect, adminOnly, updateSetting);

export default router;
