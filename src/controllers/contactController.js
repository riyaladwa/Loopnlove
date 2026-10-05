import { ContactMessage } from '../models/ContactMessage.js';

// @desc    Submit general contact message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, topic, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your name.' });
    }
    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your message.' });
    }

    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      topic: topic || 'General',
      message: message.trim(),
      status: 'unread'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We will get back to you shortly.',
      contactMessage
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
export const getContactMessages = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const messages = await ContactMessage.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contact message status
// @route   PATCH /api/contact/:id/status
// @access  Private/Admin
export const updateContactStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const allowed = ['unread', 'read', 'resolved'];

    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminReply !== undefined) updateFields.adminReply = adminReply;

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message updated successfully',
      contactMessage: msg
    });
  } catch (err) {
    next(err);
  }
};
