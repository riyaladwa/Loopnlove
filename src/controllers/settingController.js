import { Setting } from '../models/Setting.js';

// @desc    Get public store settings (WhatsApp number, etc.)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res, next) => {
  try {
    const waSetting = await Setting.findOne({ key: 'WHATSAPP_BUSINESS_NUMBER' });
    const codSetting = await Setting.findOne({ key: 'COD_ENABLED' });
    const onlineSetting = await Setting.findOne({ key: 'ONLINE_PAYMENT_ENABLED' });
    const upiSetting = await Setting.findOne({ key: 'UPI_ENABLED' });
    const upiIdSetting = await Setting.findOne({ key: 'UPI_ID' });
    const upiPayeeSetting = await Setting.findOne({ key: 'UPI_PAYEE_NAME' });
    const upiQrSetting = await Setting.findOne({ key: 'UPI_QR_IMAGE' });

    const whatsappNumber = waSetting ? waSetting.value : (process.env.BUSINESS_WHATSAPP_NUMBER || '');
    const codEnabled = codSetting !== null ? Boolean(codSetting.value) : false;
    const onlinePaymentEnabled = onlineSetting !== null ? Boolean(onlineSetting.value) : false;
    const upiEnabled = upiSetting !== null ? Boolean(upiSetting.value) : true;
    const upiId = upiIdSetting ? String(upiIdSetting.value).trim() : (process.env.UPI_ID || 'riyaladwa9@oksbi');
    const upiPayeeName = upiPayeeSetting ? String(upiPayeeSetting.value).trim() : (process.env.UPI_PAYEE_NAME || 'Riya Ladwa');
    const upiQrImage = upiQrSetting ? String(upiQrSetting.value).trim() : (process.env.UPI_QR_IMAGE || '/assets/payments/google-pay-qr.jpg');

    res.json({
      success: true,
      settings: {
        whatsappNumber: String(whatsappNumber).trim(),
        codEnabled,
        onlinePaymentEnabled,
        upiEnabled,
        upiId,
        upiPayeeName,
        upiQrImage,
        freeShippingThreshold: 999,
        standardShippingFee: 79
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
    if (map.COD_ENABLED === undefined) {
      map.COD_ENABLED = false;
    }
    if (map.ONLINE_PAYMENT_ENABLED === undefined) {
      map.ONLINE_PAYMENT_ENABLED = false;
    }
    if (map.UPI_ENABLED === undefined) {
      map.UPI_ENABLED = true;
    }
    if (!map.UPI_ID) {
      map.UPI_ID = process.env.UPI_ID || 'riyaladwa9@oksbi';
    }
    if (!map.UPI_PAYEE_NAME) {
      map.UPI_PAYEE_NAME = process.env.UPI_PAYEE_NAME || 'Riya Ladwa';
    }
    if (!map.UPI_QR_IMAGE) {
      map.UPI_QR_IMAGE = process.env.UPI_QR_IMAGE || '/assets/payments/google-pay-qr.jpg';
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
