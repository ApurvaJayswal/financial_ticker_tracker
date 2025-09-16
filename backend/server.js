const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const tickerRoutes = require('./routes/tickers');
const newsRoutes = require('./routes/news');
const alertRoutes = require('./routes/alerts');
const marketRoutes = require('./routes/markets');
const authRoutes = require('./routes/auth');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { 
    stream: { write: message => logger.info(message.trim()) }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TickerTracker API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickers', tickerRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/markets', marketRoutes);

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to TickerTracker API',
    version: '1.0.0',
    documentation: {
      endpoints: {
        '/api/auth': 'Authentication endpoints',
        '/api/tickers': 'Stock, crypto, and forex ticker data',
        '/api/news': 'Financial news with AI sentiment analysis',
        '/api/alerts': 'Price alerts and monitoring',
        '/api/markets': 'Market overview and statistics'
      },
      examples: {
        'GET /api/tickers': 'Get all tracked tickers',
        'POST /api/tickers': 'Add new ticker to watchlist',
        'GET /api/news?sentiment=positive': 'Get positive sentiment news',
        'POST /api/alerts': 'Create new price alert'
      }
    },
    author: 'TickerTracker Team'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `Route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/api/tickers',
      '/api/news', 
      '/api/alerts',
      '/api/markets',
      '/api/auth'
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 TickerTracker API Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📖 API docs: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;