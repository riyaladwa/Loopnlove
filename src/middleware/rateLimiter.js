import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Generous request limit for storefront browsing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests. Please try again in a few moments.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Generous limit to prevent false-positive blocks behind proxy IPs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again after 5 minutes.'
  }
});
