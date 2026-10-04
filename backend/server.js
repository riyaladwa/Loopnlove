import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import { notFoundHandler, errorHandler } from './src/middleware/errorMiddleware.js';
import { apiLimiter } from './src/middleware/rateLimiter.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security & Utility Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allow loading fonts, scripts, and local images smoothly
}));
app.use(cors({
  origin: '*', // Permissive for local development and static frontend
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Loop n Love Backend API',
    brand: 'Loop n Love — Little loops. Lots of love.'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Category shortcut endpoint
import { getCategories } from './src/controllers/productController.js';
app.get('/api/categories', getCategories);

// Serve static frontend files
const frontendDir = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendDir));

// Fallback to index.html for root or direct navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🌸 Loop n Love Server running on port ${PORT}`);
  console.log(`✨ Storefront: http://localhost:${PORT}`);
  console.log(`✨ API Health: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default app;
