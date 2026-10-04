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

  // Safe fetch with fallback
  async fetchProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${this.baseUrl}/products${query ? '?' + query : ''}`, {
        headers: this.getHeaders(false)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.products || data;
    } catch (err) {
      console.warn('Backend API unavailable, using verified local catalogue data:', err.message);
      // Filter & sort locally from INITIAL_PRODUCTS
      let list = [...INITIAL_PRODUCTS];
      if (params.category && params.category !== 'all') {
        list = list.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (params.sort === 'price-asc') {
        list.sort((a, b) => a.price - b.price);
      } else if (params.sort === 'price-desc') {
        list.sort((a, b) => b.price - a.price);
      } else if (params.sort === 'newest') {
        list.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
      }
      return list;
    }
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
    return data;
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
}

export const API = new ApiService();
