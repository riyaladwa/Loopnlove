/**
 * Loop n Love - API Service Module
 * Centralized communication with Node.js/Express REST backend
 * With graceful fallback to verified local catalogue
 */

import { CONFIG } from './config.js';
import { INITIAL_PRODUCTS, CATEGORIES } from './products-data.js';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
  }

  // Get auth headers if token exists
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (includeAuth) {
      const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Fetch products from MongoDB backend (single source of truth)
  async fetchProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/products${query ? '?' + query : ''}`, {
      headers: this.getHeaders(false)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to fetch catalogue from database (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.products || data;
  }

  // Get single product details
  async fetchProductById(id) {
    try {
      const res = await fetch(`${this.baseUrl}/products/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend API unavailable, using local product item:', err.message);
      return INITIAL_PRODUCTS.find(p => p.id === id || p._id === id) || null;
    }
  }

  // Get categories
  async fetchCategories() {
    try {
      const res = await fetch(`${this.baseUrl}/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      return CATEGORIES;
    }
  }

  // Authentication API
  async register(userData) {
    const res = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  }

  async login(credentials) {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  }

  async getCurrentUser() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return null;
    try {
      const res = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getHeaders(true)
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  // Order creation
  async createOrder(orderPayload) {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Order creation failed');
    return data;
  }

  // Customer order history
  async getMyOrders() {
    const res = await fetch(`${this.baseUrl}/orders/my-orders`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to retrieve orders');
    return Array.isArray(data) ? data : (data.orders || []);
  }

  // Submit / Update UPI UTR Reference
  async submitUpiReference(reference, utr) {
    const res = await fetch(`${this.baseUrl}/orders/track/${encodeURIComponent(reference)}/upi-reference`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ utr })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit UPI UTR');
    return data;
  }

  // Customer Customization Inquiries API
  async submitInquiry(inquiryPayload) {
    const res = await fetch(`${this.baseUrl}/inquiries`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(inquiryPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit customization inquiry');
    return data;
  }

  async getInquiries(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/inquiries${query ? '?' + query : ''}`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch inquiries');
    return data.inquiries || data;
  }

  async updateInquiryStatus(id, status) {
    const res = await fetch(`${this.baseUrl}/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update inquiry status');
    return data;
  }

  async addInquiryNote(id, note) {
    const res = await fetch(`${this.baseUrl}/inquiries/${id}/notes`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ note })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add note');
    return data;
  }

  // Customer General Contact Messages API
  async submitContactMessage(contactPayload) {
    const res = await fetch(`${this.baseUrl}/contact`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(contactPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send message');
    return data;
  }

  async getContactMessages(status = 'all') {
    const res = await fetch(`${this.baseUrl}/contact${status !== 'all' ? '?status=' + status : ''}`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch contact messages');
    return data.messages || data;
  }

  async updateContactStatus(id, status, adminReply = '') {
    const res = await fetch(`${this.baseUrl}/contact/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(true),
      body: JSON.stringify({ status, adminReply })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update message status');
    return data;
  }

  // Store Settings & WhatsApp API
  async getPublicSettings() {
    try {
      const res = await fetch(`${this.baseUrl}/settings/public`);
      if (!res.ok) throw new Error('Settings unavailable');
      return await res.json();
    } catch (e) {
      return { settings: { whatsappNumber: CONFIG.BUSINESS_WHATSAPP_NUMBER || '' } };
    }
  }

  async getAllSettings() {
    const res = await fetch(`${this.baseUrl}/settings`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch settings');
    return data.settings || {};
  }

  async updateSetting(key, value) {
    const res = await fetch(`${this.baseUrl}/settings`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ key, value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update setting');
    return data;
  }

  // Admin Dashboard & Order Management API
  async getDashboardStats() {
    const res = await fetch(`${this.baseUrl}/orders/stats`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
    return data;
  }

  async getAllOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${this.baseUrl}/orders${query ? '?' + query : ''}`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
    return data.orders || data;
  }

  async getOrderById(id) {
    const res = await fetch(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch order');
    return data.order || data;
  }

  async updateOrderStatus(id, orderStatus, paymentStatus, note = '', restoreStock = false, paymentReference = '') {
    const res = await fetch(`${this.baseUrl}/orders/${id}/status`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify({ orderStatus, paymentStatus, note, restoreStock, paymentReference })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update order status');
    return data;
  }

  async getOrderByReference(reference) {
    const res = await fetch(`${this.baseUrl}/orders/track/${encodeURIComponent(reference)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch order details');
    return data.order || data;
  }

  async recordWhatsAppOrder(orderPayload) {
    const res = await fetch(`${this.baseUrl}/orders/record-whatsapp`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(orderPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record WhatsApp order');
    return data;
  }

  // Admin WhatsApp Notification Retry
  async retryWhatsAppNotification(orderId) {
    const res = await fetch(`${this.baseUrl}/orders/${orderId}/retry-whatsapp`, {
      method: 'POST',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to retry WhatsApp notification');
    return data;
  }


  // Product Management (Admin)
  async createProduct(productPayload) {
    const res = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(productPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  }

  async updateProduct(id, productPayload) {
    const res = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true),
      body: JSON.stringify(productPayload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  }

  async deleteProduct(id) {
    const res = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(true)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete product');
    return data;
  }

  // Payment configuration (safe public config)
  async getPaymentConfig() {
    try {
      const res = await fetch(`${this.baseUrl}/payments/config`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch payment config');
      return data;
    } catch (err) {
      console.warn('Payment config endpoint unavailable, using defaults:', err.message);
      return {
        configured: false,
        keyId: '',
        onlineEnabled: true,
        codEnabled: true,
        currency: 'INR'
      };
    }
  }

  // Razorpay payment order creation
  async createPaymentOrder(orderId) {
    const res = await fetch(`${this.baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify({ orderId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to initialize payment');
    return data;
  }

  // Verify payment signature
  async verifyPayment(paymentData) {
    const res = await fetch(`${this.baseUrl}/payments/verify`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(paymentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment verification failed');
    return data;
  }

  // Record payment failure or modal dismissal
  async recordPaymentFailure(failureData) {
    const res = await fetch(`${this.baseUrl}/payments/failure`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: JSON.stringify(failureData)
    });
    return await res.json();
  }
}

export const API = new ApiService();
