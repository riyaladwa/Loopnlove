import { Order } from '../models/Order.js';

/**
 * Format dynamic WhatsApp message for a newly placed Loop n Love order
 * @param {Object} order - Genuine Mongoose Order document
 * @returns {string} - Formatted plain text WhatsApp message
 */
export function formatOrderNotificationMessage(order) {
  const itemsText = (order.items || [])
    .map(i => `• ${i.name} × ${i.quantity} — ₹${i.price * i.quantity}${i.customizationNotes ? ` (Note: ${i.customizationNotes})` : ''}`)
    .join('\n');

  let paymentMethodLabel = 'Cash on Delivery (COD)';
  if (order.paymentMethod === 'UPI_QR' || order.paymentMethod === 'Direct_UPI') {
    paymentMethodLabel = 'Google Pay / PhonePe / UPI QR';
  } else if (order.paymentMethod === 'Razorpay' || order.paymentMethod === 'Online_Razorpay') {
    paymentMethodLabel = 'Online Payment (Razorpay)';
  } else if (order.paymentMethod === 'WhatsApp_Manual') {
    paymentMethodLabel = 'WhatsApp Manual';
  }

  const addr = order.shippingAddress || {};
  const addressBlock = `${addr.address || 'N/A'}\n${addr.city || ''}, ${addr.state || ''}\nPIN: ${addr.pincode || 'N/A'}`;

  const customizationBlock = order.customizationInstructions
    ? `\n*✨ Customization Note:*\n${order.customizationInstructions}\n`
    : '';

  const instructionsBlock = order.instructions
    ? `\n*📦 Delivery Instructions:*\n${order.instructions}\n`
    : '';

  const utrBlock = order.paymentReference
    ? `\n*UTR / Transaction Ref:* ${order.paymentReference}`
    : '';

  return `🛍️ *NEW LOOP N LOVE ORDER*

*Order ID:* ${order.orderReference}

*Customer:*
Name: ${order.customer ? order.customer.name : 'Valued Customer'}
Phone: ${order.customer ? order.customer.phone : 'N/A'}
Email: ${order.customer ? order.customer.email : 'N/A'}

*Items:*
${itemsText || '• Handcrafted Crochet Items'}

*Subtotal:* ₹${order.subtotal || order.totalAmount}
*Shipping:* ${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee || 0}`}
*Discount:* ${order.discount > 0 ? `- ₹${order.discount}` : '₹0'}
*Total Amount:* ₹${order.totalAmount}

*Payment:*
Method: ${paymentMethodLabel}
Payment Status: ${order.paymentStatus || 'Pending'}${utrBlock}

*Order Status:* ${order.orderStatus || 'Pending'}

*Delivery Address:*
${addressBlock}
${customizationBlock}${instructionsBlock}
Order received and recorded in MongoDB.
Please review in your Loop n Love Admin Dashboard:
${process.env.CLIENT_URL || 'http://localhost:5001'}/admin.html`.trim();
}

/**
 * Send automatic server-side WhatsApp notification to Store Owner
 * Supports Meta WhatsApp Business Cloud API with strict idempotency
 * @param {string|Object} orderOrId - Order document or Order ID
 * @param {boolean} isRetry - Whether this is an intentional manual retry from Admin dashboard
 * @returns {Promise<{success: boolean, status: string, error?: string}>}
 */
export async function sendAdminOrderNotification(orderOrId, isRetry = false) {
  try {
    let order = null;
    if (typeof orderOrId === 'string') {
      order = await Order.findById(orderOrId);
    } else {
      order = orderOrId;
    }

    if (!order) {
      console.warn('[WhatsApp Notification] Order not found.');
      return { success: false, status: 'Failed', error: 'Order not found' };
    }

    // STRICT IDEMPOTENCY: Do not duplicate notifications
    if (order.adminWhatsappNotificationSent && !isRetry) {
      console.log(`[WhatsApp Notification] Order ${order.orderReference} already notified. Skipping duplicate.`);
      return { success: true, status: 'Sent', message: 'Already sent' };
    }

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || process.env.BUSINESS_WHATSAPP_NUMBER || '';
    const cleanAdminPhone = adminPhone.replace(/\D/g, '');

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    // If Meta Cloud API credentials are not yet configured in .env:
    if (!accessToken || !phoneNumberId || !cleanAdminPhone) {
      console.log(`[WhatsApp Notification] Meta Cloud API credentials not configured in backend/.env:`);
      console.log(`  - ADMIN_WHATSAPP_NUMBER: ${cleanAdminPhone ? cleanAdminPhone : 'MISSING'}`);
      console.log(`  - WHATSAPP_PHONE_NUMBER_ID: ${phoneNumberId ? phoneNumberId : 'MISSING'}`);
      console.log(`  - WHATSAPP_ACCESS_TOKEN: ${accessToken ? 'CONFIGURED' : 'MISSING'}`);
      console.log(`  [Preview of notification that would be sent for ${order.orderReference}]:\n${formatOrderNotificationMessage(order)}`);

      // Update order status gracefully so Admin dashboard reflects configuration state
      order.adminWhatsappNotificationStatus = cleanAdminPhone ? 'Pending' : 'Disabled';
      order.adminWhatsappNotificationError = 'Meta WhatsApp Cloud API credentials not configured in backend/.env';
      await order.save().catch(() => {});

      return {
        success: false,
        status: order.adminWhatsappNotificationStatus,
        error: 'WhatsApp API credentials not configured in environment'
      };
    }

    const messageText = formatOrderNotificationMessage(order);

    // Meta WhatsApp Cloud API endpoint
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanAdminPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok && data.messages && data.messages.length > 0) {
      console.log(`🌸 [WhatsApp Notification] Successfully sent automatic WhatsApp notification for ${order.orderReference} to +${cleanAdminPhone}`);
      order.adminWhatsappNotificationSent = true;
      order.adminWhatsappNotificationStatus = 'Sent';
      order.adminWhatsappNotificationSentAt = new Date();
      order.adminWhatsappNotificationError = '';
      await order.save().catch(() => {});
      return { success: true, status: 'Sent' };
    } else {
      const errorMsg = data.error?.message || (typeof data === 'object' ? JSON.stringify(data) : 'Unknown Meta API error');
      console.error(`⚠️ [WhatsApp Notification] Meta API Error for ${order.orderReference}:`, errorMsg);
      order.adminWhatsappNotificationSent = false;
      order.adminWhatsappNotificationStatus = 'Failed';
      order.adminWhatsappNotificationError = errorMsg;
      await order.save().catch(() => {});
      return { success: false, status: 'Failed', error: errorMsg };
    }
  } catch (err) {
    console.error(`⚠️ [WhatsApp Notification] Unexpected failure for order:`, err.message);
    try {
      if (typeof orderOrId === 'object' && orderOrId.save) {
        orderOrId.adminWhatsappNotificationStatus = 'Failed';
        orderOrId.adminWhatsappNotificationError = err.message;
        await orderOrId.save();
      }
    } catch (dbErr) {}
    return { success: false, status: 'Failed', error: err.message };
  }
}
