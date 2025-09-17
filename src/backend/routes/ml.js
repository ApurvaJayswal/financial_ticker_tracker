const express = require('express');
const router = express.Router();
const AIAnalysisService = require('../services/aiAnalysisService');
const APIIntegrationService = require('../services/apiIntegrationService');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize services
const aiService = new AIAnalysisService();
const apiService = new APIIntegrationService();

// Mock data for development/testing
const mockTickers = [
  {
    _id: '60f7c2b4e3b4a8c7a8e4b5d1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    market: 'us_stock',
    sector: 'Technology',
    current_price: 175.43,
    price_change: 2.15,
    price_change_percent: 1.24,
    volume: 45678900,
    market_cap: 2750000000000,
    is_active: true,
    last_updated: new Date()
  },
  {
    _id: '60f7c2b4e3b4a8c7a8e4b5d2',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    market: 'us_stock',
    sector: 'Technology',
    current_price: 138.21,
    price_change: -1.45,
    price_change_percent: -1.04,
    volume: 23456789,
    market_cap: 1750000000000,
    is_active: true,
    last_updated: new Date()
  },
  {
    _id: '60f7c2b4e3b4a8c7a8e4b5d3',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    market: 'us_stock',
    sector: 'Automotive',
    current_price: 248.50,
    price_change: 12.30,
    price_change_percent: 5.21,
    volume: 78901234,
    market_cap: 789000000000,
    is_active: true,
    last_updated: new Date()
  },
  {
    _id: '60f7c2b4e3b4a8c7a8e4b5d4',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    market: 'crypto',
    sector: 'Cryptocurrency',
    current_price: 43250.75,
    price_change: -850.25,
    price_change_percent: -1.93,
    volume: 12345678901,
    market_cap: 845000000000,
    is_active: true,
    last_updated: new Date()
  }
];

const mockNews = [
  {
    title: 'Tech stocks surge on strong earnings outlook',
    description: 'Technology sector showing strong growth momentum',
    publishedAt: new Date().toISOString(),
    source: { name: 'Market News' }
  },
  {
    title: 'Apple reports record quarterly revenue',
    description: 'AAPL beats analyst expectations with strong iPhone sales',
    publishedAt: new Date().toISOString(),
    source: { name: 'Tech Daily' }
  },
  {
    title: 'Market volatility increases amid economic uncertainty',
    description: 'Investors cautious as inflation concerns persist',
    publishedAt: new Date().toISOString(),
    source: { name: 'Financial Times' }
  }
];

// @desc    Get AI analysis overview
// @route   GET /api/ml
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      available_endpoints: [
        'GET /api/ml/market-summary - Get comprehensive market analysis',
        'GET /api/ml/ticker/:symbol/analysis - Get individual ticker analysis',
        'POST /api/ml/sentiment/analyze - Analyze sentiment from text',
        'GET /api/ml/sectors/analysis - Get sector performance analysis',
        'POST /api/ml/predict/price - Price prediction (placeholder)'
      ],
      service_status: 'active',
      features: [
        'Market trend detection',
        'Sentiment analysis',
        'Technical indicators',
        'Risk assessment',
        'AI-generated summaries'
      ]
    },
    message: 'AI Analysis Service is active'
  });
});

// @desc    Generate comprehensive market summary
// @route   GET /api/ml/market-summary
// @access  Public
router.get('/market-summary', catchAsync(async (req, res, next) => {
  const timeframe = req.query.timeframe || '1d';
  const includeNews = req.query.include_news !== 'false';
  
  logger.api('GET /api/ml/market-summary', { timeframe, includeNews });
  
  try {
    // Fetch real market data using API Integration Service
    let tickerData, newsData;
    
    try {
      // Attempt to fetch comprehensive real data
      const marketData = await apiService.fetchComprehensiveMarketData({
        stockSymbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN'],
        cryptoCoins: ['bitcoin', 'ethereum', 'cardano'],
        newsQuery: 'stock market finance earnings',
        includeHistorical: false
      });
      
      tickerData = marketData.tickers;
      newsData = includeNews ? marketData.news : [];
      
      logger.info('Using real market data from API services', {
        tickers: tickerData.length,
        news: newsData.length,
        sources: marketData.metadata.data_sources
      });
      
    } catch (error) {
      logger.warn('Failed to fetch real API data, falling back to mock data:', error.message);
      // Fallback to mock data
      tickerData = mockTickers;
      newsData = includeNews ? mockNews : [];
    }
    
    const marketSummary = await aiService.generateMarketSummary(tickerData, newsData, timeframe);
    
    res.status(200).json({
      success: true,
      data: marketSummary,
      message: 'Market summary generated successfully'
    });
    
  } catch (error) {
    logger.error('Error generating market summary:', error);
    return next(new AppError('Failed to generate market summary', 500));
  }
}));

// @desc    Get individual ticker AI analysis
// @route   GET /api/ml/ticker/:symbol/analysis
// @access  Public
router.get('/ticker/:symbol/analysis', catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const includeNews = req.query.include_news !== 'false';
  
  logger.api(`GET /api/ml/ticker/${symbol}/analysis`, { includeNews });
  
  try {
    // Find ticker in mock data (in production, fetch from database)
    const tickerData = mockTickers.find(t => t.symbol === symbol);
    
    if (!tickerData) {
      return next(new AppError(`Ticker ${symbol} not found`, 404));
    }
    
    // Filter news for this ticker
    const newsData = includeNews ? mockNews.filter(news => 
      news.title.toLowerCase().includes(symbol.toLowerCase()) ||
      news.description.toLowerCase().includes(symbol.toLowerCase())
    ) : [];
    
    const tickerAnalysis = await aiService.generateTickerAnalysis(tickerData, [], newsData);
    
    res.status(200).json({
      success: true,
      data: tickerAnalysis,
      message: `Analysis for ${symbol} generated successfully`
    });
    
  } catch (error) {
    logger.error(`Error generating ticker analysis for ${symbol}:`, error);
    return next(new AppError(`Failed to generate analysis for ${symbol}`, 500));
  }
}));

// @desc    Analyze sentiment from text or news
// @route   POST /api/ml/sentiment/analyze
// @access  Public
router.post('/sentiment/analyze', catchAsync(async (req, res, next) => {
  const { text, articles } = req.body;
  
  if (!text && !articles) {
    return next(new AppError('Either text or articles array is required', 400));
  }
  
  logger.api('POST /api/ml/sentiment/analyze', { 
    hasText: !!text, 
    articlesCount: articles ? articles.length : 0 
  });
  
  try {
    let sentimentData;
    
    if (text) {
      // Analyze single text
      sentimentData = aiService.analyzeSentiment([{ title: text, description: '' }]);
    } else {
      // Analyze articles array
      sentimentData = aiService.analyzeSentiment(articles);
    }
    
    res.status(200).json({
      success: true,
      data: sentimentData,
      message: 'Sentiment analysis completed successfully'
    });
    
  } catch (error) {
    logger.error('Error analyzing sentiment:', error);
    return next(new AppError('Failed to analyze sentiment', 500));
  }
}));

// @desc    Get sector performance analysis
// @route   GET /api/ml/sectors/analysis
// @access  Public
router.get('/sectors/analysis', catchAsync(async (req, res, next) => {
  const timeframe = req.query.timeframe || '1d';
  
  logger.api('GET /api/ml/sectors/analysis', { timeframe });
  
  try {
    const tickerData = mockTickers;
    const sectorAnalysis = aiService.analyzeSectorPerformance(tickerData);
    
    // Add additional insights
    const insights = {
      timestamp: new Date().toISOString(),
      timeframe,
      sectors: sectorAnalysis,
      summary: {
        topPerforming: Object.keys(sectorAnalysis).reduce((a, b) => 
          sectorAnalysis[a].averageChange > sectorAnalysis[b].averageChange ? a : b
        ),
        totalSectors: Object.keys(sectorAnalysis).length,
        overallTrend: Object.values(sectorAnalysis).reduce((sum, sector) => 
          sum + sector.averageChange, 0
        ) / Object.keys(sectorAnalysis).length
      }
    };
    
    res.status(200).json({
      success: true,
      data: insights,
      message: 'Sector analysis completed successfully'
    });
    
  } catch (error) {
    logger.error('Error generating sector analysis:', error);
    return next(new AppError('Failed to generate sector analysis', 500));
  }
}));

// @desc    Get market trends and signals
// @route   GET /api/ml/trends
// @access  Public
router.get('/trends', catchAsync(async (req, res, next) => {
  const timeframe = req.query.timeframe || '1d';
  
  logger.api('GET /api/ml/trends', { timeframe });
  
  try {
    const tickerData = mockTickers;
    const trendAnalysis = aiService.detectMarketTrends(tickerData);
    const marketMetrics = aiService.calculateMarketMetrics(tickerData);
    
    const trendsData = {
      timestamp: new Date().toISOString(),
      timeframe,
      trends: trendAnalysis,
      metrics: {
        gainerRatio: marketMetrics.gainerRatio,
        volatility: marketMetrics.volatility,
        marketHealth: marketMetrics.marketHealth
      },
      signals: trendAnalysis.signals,
      recommendation: trendAnalysis.trend === 'bullish' ? 
        'Market conditions favor risk-on positioning' : 
        trendAnalysis.trend === 'bearish' ? 
        'Consider defensive strategies' : 
        'Maintain balanced approach with selective opportunities'
    };
    
    res.status(200).json({
      success: true,
      data: trendsData,
      message: 'Market trends analysis completed successfully'
    });
    
  } catch (error) {
    logger.error('Error analyzing market trends:', error);
    return next(new AppError('Failed to analyze market trends', 500));
  }
}));

// @desc    Price prediction (placeholder for future ML model)
// @route   POST /api/ml/predict/price
// @access  Public
router.post('/predict/price', catchAsync(async (req, res, next) => {
  const { symbol, timeframe = '1d', features } = req.body;
  
  if (!symbol) {
    return next(new AppError('Symbol is required', 400));
  }
  
  logger.api('POST /api/ml/predict/price', { symbol, timeframe });
  
  // Placeholder response - in production, this would use a trained ML model
  const tickerData = mockTickers.find(t => t.symbol === symbol.toUpperCase());
  
  if (!tickerData) {
    return next(new AppError(`Ticker ${symbol} not found`, 404));
  }
  
  // Simple momentum-based prediction (placeholder)
  const currentPrice = tickerData.current_price;
  const priceChange = tickerData.price_change_percent;
  const predictedChange = priceChange * 0.5; // Dampened momentum
  const predictedPrice = currentPrice * (1 + predictedChange / 100);
  
  res.status(200).json({
    success: true,
    data: {
      symbol,
      current_price: currentPrice,
      predicted_price: Math.round(predictedPrice * 100) / 100,
      predicted_change_percent: Math.round(predictedChange * 100) / 100,
      confidence: 0.6, // Placeholder confidence
      timeframe,
      model_version: 'momentum_v1_placeholder',
      disclaimer: 'This is a simplified prediction model for demonstration purposes'
    },
    message: `Price prediction for ${symbol} generated (placeholder model)`
  });
}));

// Add API integration status endpoint
router.get('/api-status', catchAsync(async (req, res, next) => {
  const cacheStats = apiService.getCacheStats();
  const activeSources = apiService.getActiveSources();
  
  res.status(200).json({
    success: true,
    data: {
      active_sources: activeSources,
      cache_stats: cacheStats,
      service_status: 'operational',
      last_checked: new Date().toISOString()
    },
    message: 'API integration service status'
  });
}));

// Clear API cache endpoint
router.post('/clear-cache', catchAsync(async (req, res, next) => {
  apiService.clearCache();
  
  res.status(200).json({
    success: true,
    message: 'API cache cleared successfully'
  });
}));

module.exports = router;
