import { Inquiry } from '../models/Inquiry.js';

// @desc    Submit a new customer customization inquiry
// @route   POST /api/inquiries
// @access  Public
export const createInquiry = async (req, res, next) => {
  try {
    const name = (req.body.name || req.body.customerName || '').trim();
    const email = (req.body.email || req.body.customerEmail || '').trim();
    const phone = (req.body.phone || req.body.customerPhone || '').trim();
    const rawCategory = (req.body.category || '').trim();
    const VALID_CATEGORIES = [
      'Crochet Flowers & Bouquets',
      'Hair Accessories',
      'Crochet Bags',
      'Granny-Square Crochet Bags',
      'Keychains',
      'Custom Keychains',
      'Crochet Gifts',
      'Other Handmade Crochet'
    ];
    let category = VALID_CATEGORIES.find(c => c.toLowerCase() === rawCategory.toLowerCase());
    if (!category) {
      // Check partial matches or default
      if (/granny/i.test(rawCategory)) category = 'Granny-Square Crochet Bags';
      else if (/bag/i.test(rawCategory)) category = 'Crochet Bags';
      else if (/hair|bow|clip|scrunch/i.test(rawCategory)) category = 'Hair Accessories';
      else if (/keychain/i.test(rawCategory)) category = /custom/i.test(rawCategory) ? 'Custom Keychains' : 'Keychains';
      else if (/gift/i.test(rawCategory)) category = 'Crochet Gifts';
      else if (/flower|bouquet|rose|tulip|lily/i.test(rawCategory)) category = 'Crochet Flowers & Bouquets';
      else category = rawCategory || 'Crochet Flowers & Bouquets';
    }
    const productName = (req.body.productName || '').trim();
    const requestedCustomization = (req.body.requestedCustomization || req.body.customization || '').trim();
    const preferredColours = (req.body.preferredColours || req.body.colours || '').trim();
    const quantity = Math.max(1, parseInt(req.body.quantity) || 1);
    const budget = (req.body.budget || '').toString().trim();
    const instructions = (req.body.instructions || req.body.additionalInstructions || '').trim();
    const referenceImage = (req.body.referenceImage || '').trim();

    // Validation
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!phone || !phone.trim() || phone.trim().length < 8) {
      return res.status(400).json({ success: false, message: 'Please provide a valid phone or WhatsApp number.' });
    }
    if (!requestedCustomization || !requestedCustomization.trim()) {
      return res.status(400).json({ success: false, message: 'Please describe your requested customization.' });
    }

    const inquiryReference = `#INQ-${Date.now().toString().slice(-6)}`;

    const inquiry = await Inquiry.create({
      inquiryReference,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      category: category || 'Crochet Flowers & Bouquets',
      productName: (productName || '').trim(),
      requestedCustomization: requestedCustomization.trim(),
      preferredColours: (preferredColours || '').trim(),
      quantity: Math.max(1, parseInt(quantity) || 1),
      budget: (budget || '').trim(),
      instructions: (instructions || '').trim(),
      referenceImage: (referenceImage || '').trim(),
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Your custom inquiry has been successfully received! Our artisan will review your design requirements and get in touch with you shortly.',
      inquiryReference: inquiry.inquiryReference,
      inquiry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all customer inquiries (Admin only)
// @route   GET /api/inquiries
// @access  Private/Admin
export const getInquiries = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { inquiryReference: { $regex: search, $options: 'i' } },
        { requestedCustomization: { $regex: search, $options: 'i' } }
      ];
    }

    const inquiries = await Inquiry.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inquiries.length,
      inquiries
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single inquiry details
// @route   GET /api/inquiries/:id
// @access  Private/Admin
export const getInquiryById = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
    res.json({ success: true, inquiry });
  } catch (err) {
    next(err);
  }
};

// @desc    Update inquiry status
// @route   PATCH /api/inquiries/:id/status
// @access  Private/Admin
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'quoted', 'accepted', 'rejected', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({
      success: true,
      message: `Inquiry status updated to ${status}`,
      inquiry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add internal admin note to inquiry
// @route   POST /api/inquiries/:id/notes
// @access  Private/Admin
export const addInquiryNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, message: 'Note text is required' });
    }

    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    inquiry.internalNotes.push({
      note: note.trim(),
      author: req.user ? req.user.name : 'Store Owner',
      createdAt: new Date()
    });

    await inquiry.save();

    res.json({
      success: true,
      message: 'Internal note added successfully',
      inquiry
    });
  } catch (err) {
    next(err);
  }
};
