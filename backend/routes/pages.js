const express = require('express');
const path = require('path');
const router = express.Router();

const PUBLIC_DIR = path.join(__dirname, '../../public');

// Short code recipient page
router.get('/c/:code', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'prank.html'));
});

// Creator stats dashboard page
router.get('/stats/:code', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'stats.html'));
});

// Static policy & information pages
router.get('/privacy', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'privacy.html'));
});

router.get('/terms', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'terms.html'));
});

router.get('/about', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'about.html'));
});

module.exports = router;
