/**
 * Loop n Love - Shopping Cart Module
 * Handles client-side cart operations and persistence
 */

import { CONFIG } from './config.js';

class CartManager {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEYS.CART;
  }

  // Get items array
  getItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to parse cart from storage:', err);
      return [];
    }
  }

  // Save items
  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.dispatchUpdateEvent();
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  }

  // Add item, merge quantities if product already in cart
  addItem(product, quantity = 1, customizationNotes = '') {
    const items = this.getItems();
    const existingIndex = items.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
      if (customizationNotes) {
        items[existingIndex].customizationNotes = customizationNotes;
      }
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        quantity: quantity,
        customizationNotes: customizationNotes || ''
      });
    }

    this.saveItems(items);
  }

  // Update quantity
  updateQuantity(productId, quantity) {
    let items = this.getItems();
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = items.find(i => i.id === productId);
    if (item) {
      item.quantity = quantity;
      this.saveItems(items);
    }
  }

  // Remove single item
  removeItem(productId) {
    let items = this.getItems();
    items = items.filter(i => i.id !== productId);
    this.saveItems(items);
  }

  // Clear all items
  clearCart() {
    localStorage.removeItem(this.storageKey);
    this.dispatchUpdateEvent();
  }

  // Get total count of items
  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  // Get subtotal
  getSubtotal() {
    return this.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  // Calculate shipping
  getShippingFee() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : CONFIG.STANDARD_SHIPPING_FEE;
  }

  // Calculate order total
  getTotal(discountAmount = 0) {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const shipping = this.getShippingFee();
    return Math.max(0, subtotal + shipping - discountAmount);
  }

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent('cart:updated', {
      detail: {
        count: this.getCount(),
        subtotal: this.getSubtotal()
      }
    }));
  }
}

export const Cart = new CartManager();
