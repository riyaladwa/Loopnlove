/**
 * Loop n Love - WhatsApp Direct Chat Module
 * Strictly adheres to business specifications:
 * - Single configurable setting: WHATSAPP_BUSINESS_NUMBER
 * - Sanitized international E.164 digits without spaces or punctuation
 * - Desktop & mobile compatible click-to-chat links (https://wa.me/)
 * - Product-specific and custom-order prefilled messages
 * - Graceful notification if number is not yet configured (no broken links)
 * - Never auto-sends without customer action
 */

import { CONFIG } from './config.js';

// Clean international format: numbers only
export function getCleanWhatsAppNumber() {
  const num = (CONFIG.BUSINESS_WHATSAPP_NUMBER || '').trim();
  return num.replace(/\D/g, '');
}

export function isWhatsAppConfigured() {
  const clean = getCleanWhatsAppNumber();
  return clean.length >= 10;
}

// Fetch public settings from backend to keep WhatsApp number synchronized
export async function syncWhatsAppNumber() {
  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}/settings/public`);
    if (res.ok) {
      const data = await res.json();
      if (data.settings && data.settings.whatsappNumber) {
        CONFIG.BUSINESS_WHATSAPP_NUMBER = data.settings.whatsappNumber;
      }
    }
  } catch (e) {
    // Graceful fallback to static CONFIG.BUSINESS_WHATSAPP_NUMBER
  }
}

// Ensure settings sync on initial script evaluation
syncWhatsAppNumber();

/**
 * Product-specific WhatsApp Click-to-Chat
 * Example prefill: "Hello Loop n Love! I am interested in [product name]. I would like to know more about customization and ordering."
 */
export function openWhatsAppProductChat(productName, customizationDetails = '') {
  if (!isWhatsAppConfigured()) {
    showWhatsAppUnconfiguredNotice();
    return;
  }

  let text = `Hello Loop n Love! I am interested in *${productName}*.`;
  if (customizationDetails && customizationDetails.trim()) {
    text += ` Customization request: ${customizationDetails.trim()}.`;
  }
  text += ` I would like to know more about customization and ordering.`;

  openWhatsAppWindow(text);
}

/**
 * Customization Inquiry WhatsApp Click-to-Chat
 * Includes category and requested customization
 */
export function openWhatsAppCustomInquiry(category, customization = '', colours = '') {
  if (!isWhatsAppConfigured()) {
    showWhatsAppUnconfiguredNotice();
    return;
  }

  let text = `Hello Loop n Love! 🌸\nI would like to enquire about a custom order for *${category || 'Crochet Creations'}*.\n`;
  if (customization && customization.trim()) {
    text += `*Requested Customization:* ${customization.trim()}\n`;
  }
  if (colours && colours.trim()) {
    text += `*Preferred Colours:* ${colours.trim()}\n`;
  }
  text += `\nPlease let me know about feasibility, yarn options, and pricing estimates. Thank you! ✨`;

  openWhatsAppWindow(text);
}

/**
 * Order Confirmation WhatsApp sharing
 */
export function openWhatsAppOrder(items = [], subtotal = 0, notes = '') {
  if (!isWhatsAppConfigured()) {
    showWhatsAppUnconfiguredNotice();
    return;
  }

  let text = `Hello Loop n Love! 🌸\nI would like to discuss my crochet order:\n\n`;
  if (items && items.length > 0) {
    items.forEach((item, idx) => {
      text += `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
      if (item.customizationNotes) {
        text += `   _Note: ${item.customizationNotes}_\n`;
      }
    });
    text += `\n*Subtotal:* ₹${subtotal}\n`;
  }
  if (notes) {
    text += `*Details:* ${notes}\n`;
  }
  text += `\nPlease confirm order status. Thank you!`;

  openWhatsAppWindow(text);
}

function openWhatsAppWindow(text) {
  const cleanNumber = getCleanWhatsAppNumber();
  const encodedText = encodeURIComponent(text);
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodedText}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

/**
 * User-friendly unconfigured notice modal (replaces broken links)
 */
export function showWhatsAppUnconfiguredNotice() {
  let modal = document.getElementById('whatsapp-info-modal');
  if (!modal) {
    const modalHtml = `
      <div id="whatsapp-info-modal" class="modal-overlay open" role="dialog" aria-modal="true" aria-labelledby="wa-modal-title">
        <div class="modal-box" style="max-width: 480px; text-align: center;">
          <button class="modal-close-btn" id="wa-modal-close" aria-label="Close dialog">&times;</button>
          <div style="width: 58px; height: 58px; border-radius: 50%; background-color: #E7F9EE; color: #25D366; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; font-size: 1.8rem;">
            💬
          </div>
          <h3 id="wa-modal-title" style="margin-bottom: 0.5rem; font-family: var(--font-serif);">Direct WhatsApp Contact</h3>
          <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.25rem;">
            Our official WhatsApp direct line will be active shortly once boutique phone verification is finalized.
          </p>
          <div style="background-color: var(--bg-surface); padding: 1rem; border-radius: var(--radius-md); font-size: 0.88rem; color: var(--text-cocoa-heading); text-align: left; margin-bottom: 1.5rem; border: 1px solid var(--border-warm);">
            <strong>Alternative Ways to Connect:</strong><br>
            &bull; Email us directly at: <a href="mailto:riyaladwa9@gmail.com" style="color: var(--primary-rose); font-weight: 600;">riyaladwa9@gmail.com</a><br>
            &bull; Or submit your custom requirements via our <a href="contact.html" style="color: var(--primary-rose); font-weight: 600;">Custom Inquiry Form</a>.
          </div>
          <button id="wa-modal-ok-btn" class="btn btn-primary btn-block">Understood</button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('whatsapp-info-modal');

    const closeModal = () => modal.classList.remove('open');
    document.getElementById('wa-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('wa-modal-ok-btn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  } else {
    modal.classList.add('open');
  }
}
