/**
 * Loop n Love - Wishlist Module
 * Handles customer wishlist items and persistence
 */

import { CONFIG } from './config.js';

class WishlistManager {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEYS.WISHLIST;
  }

  getItems() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to parse wishlist from storage:', err);
      return [];
    }
  }

  saveItems(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.dispatchUpdateEvent();
    } catch (err) {
      console.error('Failed to save wishlist:', err);
    }
  }

  isInWishlist(productId) {
    const items = this.getItems();
    return items.some(item => item.id === productId);
  }

  toggle(product) {
    let items = this.getItems();
    const existingIndex = items.findIndex(item => item.id === product.id);
    let added = false;

    if (existingIndex > -1) {
      items.splice(existingIndex, 1);
      added = false;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      });
      added = true;
    }

    this.saveItems(items);
    return added;
  }

  removeItem(productId) {
    let items = this.getItems();
    items = items.filter(item => item.id !== productId);
    this.saveItems(items);
  }

  getCount() {
    return this.getItems().length;
  }

  dispatchUpdateEvent() {
    window.dispatchEvent(new CustomEvent('wishlist:updated', {
      detail: {
        count: this.getCount()
      }
    }));
  }
}

export const Wishlist = new WishlistManager();
