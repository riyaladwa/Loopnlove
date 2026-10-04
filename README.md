# 🌸 Loop n Love — Handmade Crochet E-Commerce Store

> **"Little loops. Lots of love."**

A complete, full-stack e-commerce web application built for **Loop n Love**, an artisanal handmade crochet business selling everlasting crochet flower bouquets, flowers, accessories, bags, and custom gifts.

Developed as a **Full Stack Development Internship Project for CodeAlpha**.

---

## 📋 Table of Contents
1. [Business & Project Overview](#-business--project-overview)
2. [Authentic Product Catalogue (PDF Verified)](#-authentic-product-catalogue-pdf-verified)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Key Features](#-key-features)
6. [Quick Start & Running Locally](#-quick-start--running-locally)
7. [Environment Variables](#-environment-variables)
8. [Database Seeding](#-database-seeding)
9. [Store Administrator Setup](#-store-administrator-setup)
10. [WhatsApp Ordering Configuration](#-whatsapp-ordering-configuration)
11. [Razorpay Payment Integration](#-razorpay-payment-integration)
12. [Deployment Guide](#-deployment-guide)

---

## 🌸 Business & Project Overview

Loop n Love creates everlasting handmade crochet creations with 100% premium milk cotton yarn. This project delivers a real, deployment-ready web application designed for selling bouquets, receiving online customer orders, recording custom requests, and providing the business owner with a protected administration dashboard.

---

## 💐 Authentic Product Catalogue (PDF Verified)

All 13 bouquet products and prices are directly extracted and verified from the business catalogue `Bouquet(3).pdf`. **No AI-generated product images or fictional prices are used.**

| Identifier | Catalogue Name | Selling Price (INR) | PDF Source | Image Path |
| :--- | :--- | :--- | :--- | :--- |
| `bouquet-01` | **Bouquet 01** | **₹199** | Page 1 | `frontend/assets/product-images/bouquet_01.jpg` |
| `bouquet-02` | **Bouquet 02** | **₹399** | Page 1 | `frontend/assets/product-images/bouquet_02.jpg` |
| `bouquet-03` | **Bouquet 03** | **₹399** | Page 2 | `frontend/assets/product-images/bouquet_03.jpg` |
| `bouquet-04` | **Bouquet 04** | **₹299** | Page 3 | `frontend/assets/product-images/bouquet_04.jpg` |
| `bouquet-05` | **Bouquet 05** | **₹699** | Page 3 | `frontend/assets/product-images/bouquet_05.jpg` |
| `bouquet-06` | **Bouquet 06** | **₹999** | Page 4 | `frontend/assets/product-images/bouquet_06.jpg` |
| `bouquet-07` | **Bouquet 07** | **₹899** | Page 4 | `frontend/assets/product-images/bouquet_07.jpg` |
| `bouquet-08` | **Bouquet 08** | **₹399** | Page 5 | `frontend/assets/product-images/bouquet_08.jpg` |
| `bouquet-09` | **Bouquet 09** | **₹499** | Page 5 | `frontend/assets/product-images/bouquet_09.jpg` |
| `bouquet-10` | **Bouquet 10** | **₹599** | Page 6 | `frontend/assets/product-images/bouquet_10.jpg` |
| `bouquet-11` | **Bouquet 11** | **₹449** | Page 6 | `frontend/assets/product-images/bouquet_11.jpg` |
| `bouquet-12` | **Bouquet 12** | **₹449** | Page 7 | `frontend/assets/product-images/bouquet_12.jpg` |
| `bouquet-13` | **Bouquet 13** | **₹149** | Page 7 | `frontend/assets/product-images/bouquet_13.jpg` |

---

## 🛠 Technology Stack

### Frontend
- **HTML5**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<aside>`).
- **CSS3**: Vanilla CSS with modern custom properties, flexbox, CSS grid, responsive media queries, and boutique styling (Warm cream, blush pink, soft rose, warm cocoa brown). No CSS frameworks.
- **Vanilla JavaScript**: ES Modules (`import`/`export`), clean client-side state management, and toast notifications. No React/Next.js.

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js password hashing
- **Security**: Helmet, CORS, express-rate-limit
- **Payments**: Razorpay Node SDK (Test Mode ready)
- **Image Uploads**: Cloudinary SDK / Multer

---

## 📂 Project Structure

```
loopandlove/
├── Bouquet(3).pdf                  # Original authentic bouquet catalogue
├── README.md                       # Comprehensive project documentation
├── .gitignore                      # Git ignore patterns
│
├── frontend/                       # Static Frontend
│   ├── index.html                  # Storefront Homepage (13 sections)
│   ├── shop.html                   # Catalogue, Search, Filter & Sort
│   ├── product.html                # Product Details, Gallery & WhatsApp CTA
│   ├── cart.html                   # Shopping Cart & Quantity Controls
│   ├── wishlist.html               # Wishlist & Move to Cart
│   ├── checkout.html               # Delivery Address & Order Placement
│   ├── login.html                  # Customer Login
│   ├── register.html               # Customer Registration
│   ├── account.html                # Customer Dashboard & Profile
│   ├── contact.html                # Custom Order Inquiries & Contact
│   ├── privacy.html                # Privacy Policy
│   ├── terms.html                  # Terms & Conditions
│   ├── shipping.html               # Shipping & Returns Policy
│   ├── admin-login.html            # Administrator Login Portal
│   ├── admin.html                  # Admin Dashboard (Products & Orders)
│   ├── css/
│   │   └── styles.css              # Brand Design System & Responsive Styles
│   ├── js/
│   │   ├── config.js               # Centralized API & WhatsApp Settings
│   │   ├── products-data.js        # Verified Catalogue Data & Fallback
│   │   ├── api.js                  # Centralized REST Client
│   │   ├── cart.js                 # Cart State & Quantity Merging
│   │   ├── wishlist.js             # Wishlist State Management
│   │   ├── whatsapp.js             # Configurable WhatsApp Ordering
│   │   └── main.js                 # Global UI & Toast Notifications
│   └── assets/
│       └── product-images/         # Extracted authentic bouquet photos (1-13)
│
└── backend/                        # Node.js + Express REST API
    ├── server.js                   # Application Entry & Static Server
    ├── package.json                # Dependencies & Scripts
    ├── .env.example                # Configuration Template
    ├── .env                        # Local Environment Secrets
    └── src/
        ├── config/
        │   └── db.js               # MongoDB Mongoose Connection
        ├── models/
        │   ├── User.js             # User Schema (bcrypt hash & role)
        │   ├── Product.js          # Product Schema (with indexing)
        │   └── Order.js            # Order Schema (with item snapshots)
        ├── middleware/
        │   ├── authMiddleware.js   # JWT verification & Admin RBAC
        │   ├── rateLimiter.js      # Brute-force & API rate limits
        │   └── errorMiddleware.js  # Safe error handling
        ├── controllers/
        │   ├── authController.js   # Registration & Login
        │   ├── productController.js# Catalogue Querying & Admin CRUD
        │   ├── orderController.js  # Server-side Price Verification & Orders
        │   └── paymentController.js# Razorpay HMAC verification
        ├── routes/
        │   ├── authRoutes.js
        │   ├── productRoutes.js
        │   ├── orderRoutes.js
        │   └── paymentRoutes.js
        └── utils/
            └── seed.js             # Database Seeding Script
```

---

## ⚡ Key Features

1. **Authentic Product Showcase**:
   - 13 verified bouquet designs with genuine photography and provided prices.
   - Real-time search across names and descriptions.
   - Price sorting (Low to High, High to Low, New Arrivals, Featured).
   - Category filtering with indicators for custom items.
2. **Shopping Cart & Wishlist**:
   - Merge quantities on duplicate additions.
   - Real-time subtotal and shipping calculations (Free shipping over ₹999, else ₹79).
   - Saved favorites with one-click "Move to Cart".
   - Client persistence using `localStorage`.
3. **Secure Checkout & Server-Side Price Verification**:
   - Complete delivery address validation (Name, Phone, Email, Address, City, State, 6-digit PIN code).
   - **Zero client price trusting**: The backend recalculates order subtotal using live database prices to prevent tampering.
   - First-order 10% discount validation (`FIRST10`).
4. **Configurable WhatsApp Ordering**:
   - Builds clean, polite order messages with product names, quantities, and subtotal.
   - WhatsApp number is centrally configured (`CONFIG.BUSINESS_WHATSAPP_NUMBER` or `.env`).
   - If not yet configured, displays an informative boutique modal guiding the customer to online checkout.
5. **Customer Authentication & RBAC**:
   - Secure customer registration and login with bcrypt password hashing.
   - JWT tokens for session verification.
   - Customer profile page displaying past orders.
6. **Protected Admin Dashboard**:
   - Overview metrics: Revenue, Total Orders, Pending Dispatch, Active Products.
   - Product Management: Add, edit, or remove items.
   - Order Management: Inspect customer delivery info, update order status, and log manual WhatsApp orders.
   - Role-Based Access Control: Unauthorized non-admin accounts receive HTTP 403 Forbidden.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on port 27017 (or MongoDB Atlas connection string)

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```ini
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/loop_n_love
JWT_SECRET=your_jwt_secret_here
```

### 3. Seed MongoDB with Authentic Bouquets
```bash
npm run seed
```
This populates all 13 bouquet products and creates the default administrator account.

### 4. Start the Application Server
```bash
node server.js
```
The server will start at:
- **Storefront**: `http://localhost:5001`
- **Shop**: `http://localhost:5001/shop.html`
- **Customer Login**: `http://localhost:5001/login.html`
- **Admin Portal**: `http://localhost:5001/admin-login.html`
- **API Health**: `http://localhost:5001/api/health`

---

## 🔐 Store Administrator Setup

The seed script creates the initial administrator account:
- **Email**: `admin@loopnlove.com`
- **Password**: `AdminPassword123!`

To access the admin dashboard:
1. Navigate to `http://localhost:5001/admin-login.html`.
2. Sign in with the credentials above.
3. Access product inventory management, customer order oversight, and WhatsApp configuration.

*(Note: In production, change the administrator password immediately via MongoDB or admin settings).*

---

## 💬 WhatsApp Ordering Configuration

To enable direct WhatsApp click-to-chat orders:
1. Open `frontend/js/config.js` or set `BUSINESS_WHATSAPP_NUMBER` in the Admin Dashboard Settings tab.
2. Enter your business WhatsApp number with country code without spaces (e.g., `919876543210` for India).
3. Customers clicking **"Order via WhatsApp"** will open a prefilled chat message with their selected bouquets and order details.

---

## 💳 Razorpay Payment Integration

The application is structured for Razorpay payments in **Test Mode**:
1. Sign up for a [Razorpay Account](https://razorpay.com) and navigate to **Settings → API Keys**.
2. Generate your **Test Key ID** and **Test Key Secret**.
3. Add them to `backend/.env`:
   ```ini
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_razorpay_secret_here
   ```
4. Restart the server. When an order is created, the backend initializes the payment order and validates HMAC-SHA256 signatures server-side.

---

## 🌐 Deployment Guide

### Frontend Deployment (e.g., Vercel)
1. Set the root directory to `frontend/`.
2. Update `frontend/js/config.js` to point `API_BASE_URL` to your production backend URL.

### Backend Deployment (e.g., Render / Railway)
1. Deploy the `backend/` directory as a Node.js web service.
2. Set build command: `npm install`.
3. Set start command: `node server.js`.
4. Configure Environment Variables in the provider dashboard (`MONGODB_URI`, `JWT_SECRET`, `PORT`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`).
5. Run `npm run seed` once to initialize products on your MongoDB Atlas cluster.

---

## 📜 CodeAlpha Internship Verification
- **Internship Track**: Full Stack Web Development
- **Developer**: Riya
- **Project**: Loop n Love — Crochet E-Commerce Store
- **Status**: Complete & Verified (Frontend, Express REST API, MongoDB Database, JWT Auth, Protected Admin)
