/**
 * Loop n Love - Main Client Controller
 * Global UI logic, navigation, badges, toast notifications, and product card rendering
 */

import { Cart } from './cart.js';
import { Wishlist } from './wishlist.js';
import { CONFIG } from './config.js';

// Show non-intrusive toast notification
export function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '🌸' : '✨'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Generate reusable product card markup
export function renderProductCard(product) {
  const inWishlist = Wishlist.isInWishlist(product.id);
  const badgeHtml = product.isConcept
    ? `<span class="badge badge-featured">Design Concept</span>`
    : (product.featured
        ? `<span class="badge badge-featured">Bestseller</span>`
        : (product.isNewArrival ? `<span class="badge badge-featured">New</span>` : ''));

  const isOutOfStock = product.inStock === false || (product.stockQuantity !== undefined && product.stockQuantity <= 0);

  const stockBadge = product.isConcept
    ? `<span class="badge badge-low" style="background:#FFF3E0; color:#E65100; border-color:#FFE0B2;">Made to Order</span>`
    : (isOutOfStock
        ? `<span class="badge badge-low" style="background:#FDE8E8; color:#9B1C1C; border-color:#F8B4B4;">Out of Stock</span>`
        : `<span class="badge badge-stock">In Stock</span>`);

  const actionButton = product.isConcept
    ? `<a href="contact.html?category=${encodeURIComponent(product.category)}&product=${encodeURIComponent(product.name)}" class="btn btn-primary btn-sm">
         Inquire Custom
       </a>`
    : (isOutOfStock
        ? `<button class="btn btn-secondary btn-sm" disabled style="opacity: 0.6; cursor: not-allowed;" aria-disabled="true">
             Out of Stock
           </button>`
        : `<button class="btn btn-primary btn-sm add-to-cart-btn" data-add-id="${product.id}">
             Add to Cart
           </button>`);

  const priceLabel = product.isConcept
    ? `<span class="text-muted" style="font-size: 0.8rem;">(Est. range ₹500–₹600)</span>`
    : `<span class="text-muted" style="font-size: 0.8rem;">(incl. taxes)</span>`;

  const rawImg = product.image || (product.images && product.images[0]) || '';
  let imgSrc = rawImg;
  if (imgSrc && !imgSrc.startsWith('http://') && !imgSrc.startsWith('https://') && !imgSrc.startsWith('data:') && !imgSrc.startsWith('/')) {
    imgSrc = `/${imgSrc}`;
  }
  if (!imgSrc) imgSrc = '/assets/product-images/bouquet_01.jpg';

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-image-container">
        <div class="product-badges">
          ${stockBadge}
          ${badgeHtml}
        </div>
        <button class="wishlist-btn-overlay ${inWishlist ? 'active' : ''}" 
                data-wishlist-id="${product.id}" 
                aria-label="${inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${inWishlist ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <a href="product.html?id=${product.id}">
          <img src="${imgSrc}" alt="${product.name} - Handmade crochet creation" loading="lazy" width="400" height="460" onerror="this.onerror=null; if(!this.src.includes('/assets/product-images/')) this.src='/assets/product-images/' + this.src.split('/').pop();">
        </a>
      </div>
      <div class="product-content">
        <span class="product-category-label">${product.category}</span>
        <h3 class="product-title">
          <a href="product.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-price-row">
          <span class="product-price">₹${product.price}</span>
          ${priceLabel}
        </div>
        <div class="product-actions">
          ${actionButton}
          <a href="product.html?id=${product.id}" class="btn btn-secondary btn-sm" aria-label="View details for ${product.name}">
            Details
          </a>
        </div>
      </div>
    </article>
  `;
}

// Attach event listeners for product cards (Add to cart & Wishlist toggle)
export function attachProductCardListeners(container, productsList) {
  if (!container) return;

  // Add to cart buttons
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-add-id');
      const product = productsList.find(p => p.id === id);
      if (product) {
        Cart.addItem(product, 1);
        showToast(`Added ${product.name} to your cart!`);
      }
    });
  });

  // Wishlist buttons
  container.querySelectorAll('.wishlist-btn-overlay').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.getAttribute('data-wishlist-id');
      const product = productsList.find(p => p.id === id);
      if (product) {
        const added = Wishlist.toggle(product);
        btn.classList.toggle('active', added);
        const svg = btn.querySelector('svg');
        if (svg) svg.setAttribute('fill', added ? 'currentColor' : 'none');
        showToast(added ? `Saved ${product.name} to wishlist!` : `Removed ${product.name} from wishlist.`);
      }
    });
  });
}

// Update header badges
export function updateBadges() {
  const cartBadge = document.getElementById('cart-badge');
  const wishlistBadge = document.getElementById('wishlist-badge');
  const cartCount = Cart.getCount();
  const wishlistCount = Wishlist.getCount();

  if (cartBadge) {
    cartBadge.textContent = cartCount;
    cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
  }

  if (wishlistBadge) {
    wishlistBadge.textContent = wishlistCount;
    wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
  }
}

// Update Account Link in Header
export function updateAuthNav() {
  const accountLink = document.getElementById('account-nav-link');
  const mobileAccountLink = document.getElementById('mobile-account-nav-link');
  const userJson = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_INFO);

  if (userJson) {
    try {
      const user = JSON.parse(userJson);
      const text = user.name ? `Hi, ${user.name.split(' ')[0]}` : 'Account';
      if (accountLink) {
        accountLink.setAttribute('href', 'account.html');
        accountLink.setAttribute('title', 'My Account');
      }
      if (mobileAccountLink) {
        mobileAccountLink.setAttribute('href', 'account.html');
        mobileAccountLink.textContent = text;
      }
    } catch (e) {
      // fallback
    }
  }
}

// Initialize Global Navigation & Events
export function initGlobalUI() {
  updateBadges();
  updateAuthNav();

  window.addEventListener('cart:updated', updateBadges);
  window.addEventListener('wishlist:updated', updateBadges);

  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');
  const closeBtn = document.getElementById('mobile-drawer-close');

  const openDrawer = () => {
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (hamburger) hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Newsletter form (with honest feedback, no fake success)
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      if (input && input.value && input.checkValidity()) {
        showToast('Thank you for your interest! Newsletter subscription will be connected in Phase 2 with Express & MongoDB.');
        input.value = '';
      }
    });
  }
}

// Run on page load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initGlobalUI);
}
