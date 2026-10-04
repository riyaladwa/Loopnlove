/**
 * Loop n Love - WhatsApp Ordering Module
 * Strictly follows business rules:
 * - Configurable number, never guessed or invented
 * - Formats order enquiry cleanly with items, quantities, and subtotal
 * - Friendly feedback if number is not yet set
 */

import { CONFIG } from './config.js';

export function isWhatsAppConfigured() {
  return Boolean(CONFIG.BUSINESS_WHATSAPP_NUMBER && CONFIG.BUSINESS_WHATSAPP_NUMBER.trim().length >= 10);
}

export function buildWhatsAppMessage(items, subtotal, notes = '') {
  let message = `Hello Loop n Love! 🌸\nI would like to order the following handmade crochet bouquets:\n\n`;

  items.forEach((item, idx) => {
    message += `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
    if (item.customizationNotes) {
      message += `   _Note: ${item.customizationNotes}_\n`;
    }
  });

  message += `\n*Estimated Subtotal:* ₹${subtotal}\n`;
  if (notes) {
    message += `*Customization / Delivery Note:* ${notes}\n`;
  }
  message += `\nPlease confirm product availability, shipping details, and how I can proceed with payment. Thank you! ✨`;

  return encodeURIComponent(message);
}

export function openWhatsAppOrder(items, subtotal, notes = '') {
  if (!isWhatsAppConfigured()) {
    showWhatsAppUnconfiguredModal();
    return;
  }

  const encodedMsg = buildWhatsAppMessage(items, subtotal, notes);
  const cleanNumber = CONFIG.BUSINESS_WHATSAPP_NUMBER.replace(/\D/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function showWhatsAppUnconfiguredModal() {
  let modal = document.getElementById('whatsapp-info-modal');
  if (!modal) {
    const modalHtml = `
      <div id="whatsapp-info-modal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title">
        <div class="modal-box">
          <button class="modal-close-btn" id="wa-modal-close" aria-label="Close dialog">&times;</button>
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <div style="width: 60px; height: 60px; border-radius: 50%; background-color: #E7F9EE; color: #25D366; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 1.8rem;">
              💬
            </div>
            <h3 id="wa-modal-title" style="margin-bottom: 0.5rem;">WhatsApp Ordering Setup</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem;">
              The business owner has not yet configured the official business WhatsApp number for direct chat ordering.
            </p>
          </div>
          <div style="background-color: var(--bg-surface); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.88rem; color: var(--text-cocoa); margin-bottom: 1.5rem; line-height: 1.6;">
            <strong>For the Store Owner:</strong><br>
            You can configure your business WhatsApp number in <code>frontend/js/config.js</code> or via the admin dashboard once deployed.
          </div>
          <div style="display: flex; gap: 0.8rem; justify-content: center;">
            <button class="btn btn-secondary btn-sm" id="wa-modal-dismiss">Understood</button>
            <a href="checkout.html" class="btn btn-primary btn-sm">Proceed with Online Checkout</a>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('whatsapp-info-modal');

    const close = () => modal.classList.remove('open');
    document.getElementById('wa-modal-close').addEventListener('click', close);
    document.getElementById('wa-modal-dismiss').addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  } else {
    modal.classList.add('open');
  }
}
