const express = require('express');
const router = express.Router();
const {
  generateMarketIntelligence,
  generateTickerDeepAnalysis,
  generateMarketOutlook,
  generateRealTimeAlerts
} = require('../controllers/aiSummaryController');

// Market Intelligence Routes
router.get('/market-intelligence', generateMarketIntelligence);
router.get('/ticker/:symbol/deep-analysis', generateTickerDeepAnalysis);
router.get('/market-outlook', generateMarketOutlook);
router.get('/alerts', generateRealTimeAlerts);

module.exports = router;