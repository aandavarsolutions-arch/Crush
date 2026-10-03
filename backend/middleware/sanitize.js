const xss = require('xss');

function sanitizeString(input, maxLength = 50) {
  if (typeof input !== 'string') return '';
  // Clean XSS & trim
  let clean = xss(input.trim());
  // Truncate to maximum allowed length
  return clean.substring(0, maxLength);
}

function sanitizeInput(req, res, next) {
  if (req.body) {
    if (req.body.creatorName) req.body.creatorName = sanitizeString(req.body.creatorName, 50);
    if (req.body.visitorName) req.body.visitorName = sanitizeString(req.body.visitorName, 50);
    if (req.body.crushName) req.body.crushName = sanitizeString(req.body.crushName, 50);
    if (req.body.reaction) req.body.reaction = sanitizeString(req.body.reaction, 10);
  }
  next();
}

module.exports = {
  sanitizeString,
  sanitizeInput
};
