/**
 * Loop n Love - Frontend Configuration
 * Centralized API, contact, and business settings
 */

export const CONFIG = {
  BRAND_NAME: 'Loop n Love',
  TAGLINE: 'Little loops. Lots of love.',
  CURRENCY_SYMBOL: '₹',
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_SHIPPING_FEE: 79,
  FIRST_ORDER_DISCOUNT_PERCENT: 10,
  
  // Official Business Contact Information
  BUSINESS_EMAIL: 'riyaladwa9@gmail.com',
  LOCATION_TEXT: 'Handcrafted with devotion in India. Pan-India shipping available.',
  WORKING_HOURS: 'Monday – Saturday: 7:00 AM onwards',
  DISPATCH_ESTIMATE: 'Dispatches in 3–5 days',

  // API URL - connects to local Node/Express backend in dev, or deployed URL in production
  API_BASE_URL: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'))
    ? `${(window.location.protocol === 'https:' ? 'https:' : 'http:')}//${window.location.hostname || 'localhost'}:5001/api`
    : '/api',

  // Configurable Business WhatsApp Number (E.164 format, e.g. 919876543210)
  BUSINESS_WHATSAPP_NUMBER: '919353232225',
  
  STORAGE_KEYS: {
    CART: 'loop_n_love_cart',
    WISHLIST: 'loop_n_love_wishlist',
    AUTH_TOKEN: 'loop_n_love_token',
    USER_INFO: 'loop_n_love_user'
  }
};
