const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(helmet({
  contentSecurityPolicy: false // Allows inline scripts for confetti, dynamic share APIs, and ads
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
const PUBLIC_DIR = path.join(__dirname, '../public');
app.use(express.static(PUBLIC_DIR));

// Register Page routes & API routes
app.use('/', pageRoutes);
app.use('/api', apiRoutes);

// Fallback to index.html for home
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`
  💘 ====================================================== 💘
  🚀 Viral Crush Prank Web Application running!
  🌐 Local URL: http://localhost:${PORT}
  💘 ====================================================== 💘
  `);
});
