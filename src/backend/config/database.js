const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MongoDB URI not provided in environment variables');
    }

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false,
      bufferMaxEntries: 0,
    };

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri, options);

    logger.info(`🗄️  MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    logger.info(`📚 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    // Database connection cleanup will be handled by main server shutdown

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error.message);
    
    // In development, continue without database
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('⚠️  Running without database connection in development mode');
      logger.info('💡 To fix this, install MongoDB locally or update MONGODB_URI in .env');
      logger.info('🚀 Server will continue running with mock data for development');
      return null;
    }
    
    // Exit process with failure in production
    process.exit(1);
  }
};

// Connection health check
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get connection status
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};

module.exports = {
  connectDB,
  isConnected,
  getConnectionStatus
};