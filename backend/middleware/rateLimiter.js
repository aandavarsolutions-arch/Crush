const rateLimit = require('express-rate-limit');

// Rate limiter for creating links (max 15 requests per 15 minutes per IP)
const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Too many prank links created from this IP. Please wait a few minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for submitting pranks (max 20 requests per 15 minutes per IP)
const submitPrankLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: 'Too many entries submitted. Please wait a bit.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter (max 100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  }
});

module.exports = {
  createLinkLimiter,
  submitPrankLimiter,
  apiLimiter
};
