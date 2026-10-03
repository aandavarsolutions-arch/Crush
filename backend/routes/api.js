const express = require('express');
const router = express.Router();
const prankController = require('../controllers/prankController');
const { createLinkLimiter, submitPrankLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { sanitizeInput } = require('../middleware/sanitize');

// Apply general API rate limiter
router.use(apiLimiter);

// Link creation route
router.post('/create-link', createLinkLimiter, sanitizeInput, prankController.createLink);

// Fetch prank info for recipient page
router.get('/prank/:code', prankController.getPrankInfo);

// Submit prank response
router.post('/submit-prank', submitPrankLimiter, sanitizeInput, prankController.submitPrank);

// Update reaction emoji
router.post('/reaction', sanitizeInput, prankController.updateReaction);

// Creator statistics view
router.get('/stats/:code', prankController.getLinkStats);

// Database Health check
router.get('/health-db', prankController.healthCheckDb);

module.exports = router;
