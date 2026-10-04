import { Setting } from '../models/Setting.js';

// @desc    Get public store settings (WhatsApp number, etc.)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res, next) => {
  try {
    const waSetting = await Setting.findOne({ key: 'WHATSAPP_BUSINESS_NUMBER' });
    const whatsappNumber = waSetting ? waSetting.value : (process.env.BUSINESS_WHATSAPP_NUMBER || '');

    res.json({
      success: true,
      settings: {
        whatsappNumber: String(whatsappNumber).trim()
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all store settings (Admin only)
// @route   GET /api/settings
// @access  Private/Admin
export const getAllSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find({});
    const map = {};
    settings.forEach(s => {
      map[s.key] = s.value;
    });

    if (!map.WHATSAPP_BUSINESS_NUMBER) {
      map.WHATSAPP_BUSINESS_NUMBER = process.env.BUSINESS_WHATSAPP_NUMBER || '';
    }

    res.json({
      success: true,
      settings: map
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update store setting (Admin only)
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSetting = async (req, res, next) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required' });
    }

    // Sanitize WhatsApp number: keep only digits if updating WhatsApp number
    let cleanVal = value;
    if (key === 'WHATSAPP_BUSINESS_NUMBER' && typeof value === 'string') {
      cleanVal = value.replace(/[^0-9]/g, '');
    }

    const setting = await Setting.findOneAndUpdate(
      { key },
      {
        value: cleanVal,
        updatedBy: req.user ? req.user._id : null
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Setting ${key} updated successfully`,
      setting
    });
  } catch (err) {
    next(err);
  }
};
