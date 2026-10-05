import nodemailer from 'nodemailer';
import { Order } from '../models/Order.js';

let cachedTransporter = null;

/**
 * Get or create Nodemailer transporter
 */
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_USER || process.env.ADMIN_EMAIL || 'riyaladwa9@gmail.com';
  const pass = process.env.EMAIL_PASS || '';

  if (!pass) {
    return null;
  }

  // If host/port are provided use generic SMTP, otherwise default to Gmail service
  if (process.env.EMAIL_HOST) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10) || 465,
      secure: (process.env.EMAIL_SECURE === 'true') || (process.env.EMAIL_PORT === '465'),
      auth: { user, pass }
    });
  } else {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return cachedTransporter;
}

/**
 * Generate beautiful HTML template for Admin Order Alert
 */
function generateAdminOrderHtml(order) {
  const adminUrl = `${process.env.CLIENT_URL || 'http://localhost:5001'}/admin.html`;
  const itemsRows = (order.items || []).map(i => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6e8; color: #4A3E3D; font-size: 14px;">
        <strong>${i.name}</strong>
        ${i.customizationNotes ? `<br><span style="color: #9C5A60; font-size: 12px;">Customization: ${i.customizationNotes}</span>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6e8; color: #4A3E3D; font-size: 14px; text-align: center;">
        ${i.quantity}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #f0e6e8; color: #4A3E3D; font-size: 14px; text-align: right; font-weight: 600;">
        ₹${i.price * i.quantity}
      </td>
    </tr>
  `).join('');

  const addr = order.shippingAddress || {};
  const customer = order.customer || {};

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6F0; margin: 0; padding: 24px; color: #4A3E3D; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 62, 61, 0.08); border: 1px solid #EEDCD9; }
      .header { background: linear-gradient(135deg, #C46D75, #9C5A60); padding: 28px 24px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0; opacity: 0.92; font-size: 14px; }
      .content { padding: 24px; }
      .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
      .badge-upi { background: #e6f4ea; color: #137333; }
      .card { background: #FDF9F6; border: 1px solid #EEDCD9; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
      .card-title { font-size: 13px; font-weight: 700; color: #9C5A60; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      .btn { display: inline-block; background: #C46D75; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; text-align: center; margin-top: 16px; }
      .footer { text-align: center; font-size: 12px; color: #8F7E7D; padding: 16px; border-top: 1px solid #f0e6e8; background: #FAF6F0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌸 New Loop n Love Order</h1>
        <p>Order Reference: <strong>${order.orderReference}</strong></p>
      </div>
      <div class="content">
        <p style="font-size: 16px; margin-top: 0;">
          Hi <strong>Riya</strong>, you have received a new handcrafted crochet order!
        </p>

        <!-- Customer & Payment Summary Card -->
        <div class="card">
          <div class="card-title">Customer &amp; Payment Details</div>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Customer:</strong> ${customer.name || 'Valued Customer'}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${customer.phone}" style="color: #C46D75;">${customer.phone}</a></p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${customer.email || 'N/A'}</p>
          <p style="margin: 8px 0 4px; font-size: 14px;">
            <strong>Payment Method:</strong> <span class="badge badge-upi">Google Pay / Direct UPI QR</span>
          </p>
          ${order.paymentReference ? `<p style="margin: 4px 0; font-size: 14px; background: #e6f4ea; padding: 6px 10px; border-radius: 4px; font-family: monospace; font-weight: 700; color: #137333;">Google Pay UTR / Ref: ${order.paymentReference}</p>` : ''}
          <p style="margin: 4px 0; font-size: 14px;"><strong>Payment Status:</strong> ${order.paymentStatus || 'Pending'}</p>
        </div>

        <!-- Delivery Address Card -->
        <div class="card">
          <div class="card-title">Delivery Address</div>
          <p style="margin: 2px 0; font-size: 14px;">${addr.address || 'N/A'}</p>
          <p style="margin: 2px 0; font-size: 14px;">${addr.city || ''}, ${addr.state || ''} — <strong>PIN: ${addr.pincode || 'N/A'}</strong></p>
          ${order.instructions ? `<p style="margin: 8px 0 0; font-size: 13px; color: #7B6867;"><strong>Delivery Note:</strong> ${order.instructions}</p>` : ''}
          ${order.customizationInstructions ? `<p style="margin: 4px 0 0; font-size: 13px; color: #9C5A60;"><strong>Customization Note:</strong> ${order.customizationInstructions}</p>` : ''}
        </div>

        <!-- Ordered Items Table -->
        <div class="card">
          <div class="card-title">Items Ordered</div>
          <table>
            <thead>
              <tr style="background: #f7ecee;">
                <th style="padding: 8px 12px; text-align: left; font-size: 12px; color: #9C5A60;">ITEM</th>
                <th style="padding: 8px 12px; text-align: center; font-size: 12px; color: #9C5A60;">QTY</th>
                <th style="padding: 8px 12px; text-align: right; font-size: 12px; color: #9C5A60;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>
          <div style="margin-top: 14px; border-top: 1.5px solid #EEDCD9; padding-top: 10px; font-size: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Subtotal:</span><span>₹${order.subtotal || order.totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span>Shipping:</span><span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            ${order.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px; color: #137333;">
              <span>Discount (FIRST10):</span><span>- ₹${order.discount}</span>
            </div>` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #C46D75; margin-top: 8px; border-top: 1px dashed #EEDCD9; padding-top: 8px;">
              <span>Total Amount:</span><span>₹${order.totalAmount}</span>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 28px 0 10px;">
          <a href="${adminUrl}" class="btn">View Order in Admin Dashboard</a>
          <p style="font-size: 12px; color: #8F7E7D; margin-top: 8px;">
            Check your Google Pay bank receipt for UTR <strong>${order.paymentReference || 'N/A'}</strong> and mark as Confirmed.
          </p>
        </div>

      </div>
      <div class="footer">
        Loop n Love — Little loops. Lots of love. &bull; Handcrafted with devotion in India
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generate Customer Order Confirmation HTML
 */
function generateCustomerOrderHtml(order) {
  const itemsRows = (order.items || []).map(i => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e6e8; color: #4A3E3D; font-size: 14px;">
        <strong>${i.name}</strong> × ${i.quantity}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #f0e6e8; color: #4A3E3D; font-size: 14px; text-align: right; font-weight: 600;">
        ₹${i.price * i.quantity}
      </td>
    </tr>
  `).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6F0; margin: 0; padding: 24px; color: #4A3E3D; }
      .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #EEDCD9; }
      .header { background: #C46D75; padding: 24px; text-align: center; color: #ffffff; }
      .content { padding: 24px; }
      .card { background: #FDF9F6; border: 1px solid #EEDCD9; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      .footer { text-align: center; font-size: 12px; color: #8F7E7D; padding: 16px; border-top: 1px solid #f0e6e8; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2 style="margin: 0;">🌸 Thank You For Your Order!</h2>
        <p style="margin: 6px 0 0; font-size: 14px;">Order Reference: <strong>${order.orderReference}</strong></p>
      </div>
      <div class="content">
        <p>Dear <strong>${order.customer?.name || 'Friend'}</strong>,</p>
        <p>
          We have safely received your order! Your handcrafted crochet creations are being queued for preparation by our artisans.
        </p>

        <div class="card">
          <div style="font-weight: 700; color: #9C5A60; margin-bottom: 8px;">Order Summary</div>
          <table>
            ${itemsRows}
          </table>
          <p style="text-align: right; font-size: 15px; font-weight: 700; color: #C46D75; margin-top: 12px;">
            Total: ₹${order.totalAmount}
          </p>
        </div>

        <div class="card">
          <div style="font-weight: 700; color: #9C5A60; margin-bottom: 6px;">Delivery Details</div>
          <p style="margin: 0; font-size: 14px;">${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</p>
          <p style="margin: 8px 0 0; font-size: 13px; color: #7B6867;">Estimated Dispatch: 3–5 working days</p>
        </div>

        <p style="font-size: 13px; color: #7B6867;">
          Need to customize or check on your order? Reply to this email or chat with us on WhatsApp at <strong>+91 9353232225</strong>.
        </p>
      </div>
      <div class="footer">
        Loop n Love — Little loops. Lots of love.
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Send automatic Email notification to Admin and Customer when order is placed
 * @param {string|Object} orderOrId - Order or order ID
 * @returns {Promise<{success: boolean, status: string, error?: string}>}
 */
export async function sendOrderEmailNotifications(orderOrId) {
  try {
    let order = null;
    if (typeof orderOrId === 'string') {
      order = await Order.findById(orderOrId);
    } else {
      order = orderOrId;
    }

    if (!order) {
      console.warn('[Email Notification] Order not found.');
      return { success: false, status: 'Failed', error: 'Order not found' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'riyaladwa9@gmail.com';
    const emailUser = process.env.EMAIL_USER || adminEmail;
    const emailPass = process.env.EMAIL_PASS;
    const fromAddress = process.env.EMAIL_FROM || `"Loop n Love" <${emailUser}>`;

    const transporter = getTransporter();

    if (!transporter || !emailPass) {
      const msg = `Email credentials not configured in backend/.env (Awaiting EMAIL_PASS). Order #${order.orderReference} logged.`;
      console.log(`[Email Notification] Notice: ${msg}`);
      console.log(`  Admin alert recipient: ${adminEmail}`);
      console.log(`  Customer recipient: ${order.customer?.email}`);

      await Order.findByIdAndUpdate(order._id, {
        emailNotificationSent: false,
        emailNotificationStatus: 'Pending',
        emailNotificationError: 'EMAIL_PASS not configured in backend/.env'
      }).catch(() => {});

      return {
        success: false,
        status: 'Pending',
        message: 'Email notification ready (configure EMAIL_PASS in .env to activate sending)'
      };
    }

    // 1. Send Admin Email Notification
    const adminMailOptions = {
      from: fromAddress,
      to: adminEmail,
      subject: `🌸 New Loop n Love Order ${order.orderReference} — ₹${order.totalAmount} from ${order.customer?.name || 'Customer'}`,
      text: `New order ${order.orderReference} received for ₹${order.totalAmount}. Customer: ${order.customer?.name} (${order.customer?.phone}). UTR: ${order.paymentReference || 'N/A'}. View in Admin: ${process.env.CLIENT_URL || 'http://localhost:5001'}/admin.html`,
      html: generateAdminOrderHtml(order)
    };

    const adminResult = await transporter.sendMail(adminMailOptions);
    console.log(`[Email Notification] Admin alert sent for ${order.orderReference}:`, adminResult.messageId);

    // 2. Send Customer Confirmation Email (if customer provided valid email)
    if (order.customer && order.customer.email && order.customer.email.includes('@')) {
      try {
        const customerMailOptions = {
          from: fromAddress,
          to: order.customer.email,
          subject: `🌸 Order Confirmed! Loop n Love Order ${order.orderReference}`,
          text: `Thank you for your order ${order.orderReference}! Total: ₹${order.totalAmount}. We are preparing your handmade crochet order.`,
          html: generateCustomerOrderHtml(order)
        };
        await transporter.sendMail(customerMailOptions);
        console.log(`[Email Notification] Customer confirmation sent to ${order.customer.email}`);
      } catch (custErr) {
        console.warn(`[Email Notification] Customer email warning:`, custErr.message);
      }
    }

    await Order.findByIdAndUpdate(order._id, {
      emailNotificationSent: true,
      emailNotificationStatus: 'Sent',
      emailNotificationSentAt: new Date(),
      emailNotificationError: ''
    }).catch(() => {});

    return {
      success: true,
      status: 'Sent',
      messageId: adminResult.messageId
    };

  } catch (err) {
    console.error(`[Email Notification] Error sending order email:`, err.message);
    if (orderOrId && orderOrId._id) {
      await Order.findByIdAndUpdate(orderOrId._id, {
        emailNotificationSent: false,
        emailNotificationStatus: 'Failed',
        emailNotificationError: err.message
      }).catch(() => {});
    }
    return {
      success: false,
      status: 'Failed',
      error: err.message
    };
  }
}
