const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

console.log('Setting up routes...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'TickerTracker Simple Server',
    version: '1.0.0',
    health: '/health'
  });
});

console.log('Starting server...');

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log('Press Ctrl+C to stop the server');
});

// Keep alive
setInterval(() => {
  console.log('Server is alive:', new Date().toISOString());
}, 10000);

module.exports = app;