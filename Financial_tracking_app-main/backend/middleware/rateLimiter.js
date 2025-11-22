/**
 * Rate Limiting Middleware
 * Controls API request frequency to protect against abuse and brute-force attacks
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // Default: 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Max requests per IP per window
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Enable standardized rate limit response headers
  legacyHeaders: false, // Disable old `X-RateLimit-*` headers
  skip: (req) => {
    // Disable rate limiting during development for convenience
    return process.env.NODE_ENV === 'development';
  }
});

// Strict rate limiter for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 5, // Allow only 5 failed attempts per IP
  skipSuccessfulRequests: true, // Successful logins don't count toward the limit
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }
});

// Rate limiter for ML/AI-related routes (slightly restricted)
const mlRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 10, // Allow up to 10 requests per minute
  message: {
    status: 'error',
    message: 'Too many ML requests, please wait a moment.'
  }
});

module.exports = {
  rateLimiter,
  authRateLimiter,
  mlRateLimiter
};
