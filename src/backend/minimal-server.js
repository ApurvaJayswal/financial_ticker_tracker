const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectDB } = require('./config/database');
const aiChatRoutes = require('./routes/aiChat');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional in development)
connectDB().then(() => {
  logger.info('🗄️ MongoDB connected successfully');
}).catch(err => {
  logger.warn('📊 Continuing without database in development mode - using mock data');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/chat', aiChatRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'TickerTracker Minimal API Server',
    version: '1.0.0',
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Minimal server running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`AI Chat: http://localhost:${PORT}/api/chat/ask`);
});

module.exports = app;