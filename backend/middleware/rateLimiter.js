const rateLimit = require('express-rate-limit');

// Rate limiter for creating links
const createLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many prank links created from this IP. Please wait a few minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// Rate limiter for submitting pranks
const submitPrankLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: 'Too many entries submitted. Please wait a bit.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: 'Too many requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: false
});

module.exports = {
  createLinkLimiter,
  submitPrankLimiter,
  apiLimiter
};
