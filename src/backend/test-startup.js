// Simple test script to debug server startup
const logger = require('./utils/logger');

console.log('Starting test...');
logger.info('Logger working');

try {
  console.log('Testing database connection...');
  const { connectDB } = require('./config/database');
  
  connectDB().then(() => {
    console.log('Database connection test passed');
  }).catch((err) => {
    console.log('Database connection failed (expected):', err.message);
  });

  console.log('Testing AI service...');
  const AIFinancialAssistant = require('./services/aiFinancialAssistant');
  const aiService = new AIFinancialAssistant();
  console.log('AI Service created successfully');
  
  console.log('Testing API integration service...');
  const APIIntegrationService = require('./services/apiIntegrationService');
  const apiService = new APIIntegrationService();
  console.log('API Integration service created successfully');
  
  console.log('All services loaded successfully!');
  process.exit(0);
  
} catch (error) {
  console.error('Error during startup test:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}