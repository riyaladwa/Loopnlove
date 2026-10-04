/**
 * Loop n Love - Frontend Configuration
 * Centralized API & business settings
 */

export const CONFIG = {
  BRAND_NAME: 'Loop n Love',
  TAGLINE: 'Little loops. Lots of love.',
  CURRENCY_SYMBOL: '₹',
  FREE_SHIPPING_THRESHOLD: 999,
  STANDARD_SHIPPING_FEE: 79,
  FIRST_ORDER_DISCOUNT_PERCENT: 10,
  
  // API URL - connects to local Node/Express backend in dev, or deployed URL in production
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? `${window.location.protocol}//${window.location.hostname}:5001/api`
    : '/api',

  // Configurable Business WhatsApp Number (E.164 format, e.g. 919876543210)
  // Per strict project requirements: Do not invent or guess. Disabled until owner configures it.
  BUSINESS_WHATSAPP_NUMBER: '', // Empty by default; configure via settings or admin dashboard
  
  STORAGE_KEYS: {
    CART: 'loop_n_love_cart',
    WISHLIST: 'loop_n_love_wishlist',
    AUTH_TOKEN: 'loop_n_love_token',
    USER_INFO: 'loop_n_love_user'
  }
};
