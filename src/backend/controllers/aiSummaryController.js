const AIAnalysisService = require('../services/aiAnalysisService');
const MarketAnalysisUtils = require('../utils/marketAnalysis');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize services
const aiService = new AIAnalysisService();

/**
 * AI Summary Controller
 * Handles comprehensive market analysis requests with multiple timeframes and focus areas
 */

// @desc    Generate comprehensive market intelligence report
// @route   GET /api/ai-summary/market-intelligence
// @access  Public
const generateMarketIntelligence = catchAsync(async (req, res, next) => {
  const { 
    timeframe = '1d', 
    includeNews = true, 
    includeTechnical = true,
    includeSentiment = true,
    sectors = [],
    markets = []
  } = req.query;

  logger.api('Generating market intelligence report', { 
    timeframe, includeNews, includeTechnical, includeSentiment 
  });

  try {
    // Mock ticker data - replace with real data source
    const mockTickers = [
      {
        symbol: 'AAPL', name: 'Apple Inc.', market: 'us_stock', sector: 'Technology',
        current_price: 175.43, price_change_percent: 1.24, volume: 45678900,
        market_cap: 2750000000000, last_updated: new Date()
      },
      {
        symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'us_stock', sector: 'Technology',
        current_price: 138.21, price_change_percent: -1.04, volume: 23456789,
        market_cap: 1750000000000, last_updated: new Date()
      },
      {
        symbol: 'TSLA', name: 'Tesla Inc.', market: 'us_stock', sector: 'Automotive',
        current_price: 248.50, price_change_percent: 5.21, volume: 78901234,
        market_cap: 789000000000, last_updated: new Date()
      },
      {
        symbol: 'BTC-USD', name: 'Bitcoin', market: 'crypto', sector: 'Cryptocurrency',
        current_price: 43250.75, price_change_percent: -1.93, volume: 12345678901,
        market_cap: 845000000000, last_updated: new Date()
      },
      {
        symbol: 'RELIANCE.BO', name: 'Reliance Industries', market: 'indian_stock', sector: 'Energy',
        current_price: 2456.30, price_change_percent: 1.87, volume: 5678901,
        market_cap: 16500000000000, last_updated: new Date()
      }
    ];

    // Filter data based on query parameters
    let filteredTickers = mockTickers;
    if (markets.length > 0) {
      filteredTickers = filteredTickers.filter(t => markets.includes(t.market));
    }
    if (sectors.length > 0) {
      filteredTickers = filteredTickers.filter(t => sectors.includes(t.sector));
    }

    // Mock news data
    const mockNews = includeNews ? [
      {
        title: 'Tech stocks surge on AI optimism',
        description: 'Major technology companies show strong momentum on artificial intelligence breakthroughs',
        publishedAt: new Date().toISOString(),
        source: { name: 'TechNews' }
      },
      {
        title: 'Federal Reserve signals potential rate cuts',
        description: 'Central bank hints at monetary policy shifts amid economic uncertainty',
        publishedAt: new Date().toISOString(),
        source: { name: 'FinancialTimes' }
      },
      {
        title: 'Cryptocurrency market shows mixed signals',
        description: 'Digital assets face headwinds as regulatory concerns persist',
        publishedAt: new Date().toISOString(),
        source: { name: 'CryptoDaily' }
      }
    ] : [];

    // Generate comprehensive analysis
    const marketSummary = await aiService.generateMarketSummary(filteredTickers, mockNews, timeframe);
    
    // Add technical analysis if requested
    let technicalAnalysis = null;
    if (includeTechnical) {
      // Generate technical analysis for major tickers
      technicalAnalysis = {};
      for (const ticker of filteredTickers.slice(0, 3)) { // Analyze top 3
        const prices = generateMockPrices(ticker.current_price, 30); // 30 days of mock data
        technicalAnalysis[ticker.symbol] = MarketAnalysisUtils.generateTechnicalSummary(prices);
      }
    }

    // Market intelligence report structure
    const intelligenceReport = {
      metadata: {
        generated_at: new Date().toISOString(),
        timeframe,
        data_points: filteredTickers.length,
        news_articles: mockNews.length,
        markets_covered: [...new Set(filteredTickers.map(t => t.market))],
        sectors_covered: [...new Set(filteredTickers.map(t => t.sector))]
      },
      executive_summary: {
        market_overview: marketSummary.summary,
        key_insights: [
          `${marketSummary.metrics.gainers} gainers vs ${marketSummary.metrics.losers} losers`,
          `Average market change: ${marketSummary.metrics.averageChange.toFixed(2)}%`,
          `Market sentiment: ${marketSummary.sentiment.overall}`,
          `Trend analysis: ${marketSummary.trends.trend} with ${marketSummary.trends.strength} strength`
        ],
        risk_level: marketSummary.metrics.marketHealth,
        confidence_score: calculateConfidenceScore(marketSummary, technicalAnalysis)
      },
      market_analysis: marketSummary,
      technical_analysis: technicalAnalysis,
      sector_breakdown: marketSummary.sectors,
      recommendations: {
        immediate: marketSummary.recommendations,
        strategic: generateStrategicRecommendations(marketSummary, technicalAnalysis),
        risk_management: generateRiskRecommendations(marketSummary)
      },
      alerts: generateMarketAlerts(marketSummary, filteredTickers)
    };

    res.status(200).json({
      success: true,
      data: intelligenceReport,
      message: 'Market intelligence report generated successfully'
    });

  } catch (error) {
    logger.error('Error generating market intelligence:', error);
    return next(new AppError('Failed to generate market intelligence report', 500));
  }
});

// @desc    Get AI-powered ticker deep analysis
// @route   GET /api/ai-summary/ticker/:symbol/deep-analysis
// @access  Public
const generateTickerDeepAnalysis = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const { 
    timeframe = '1d',
    includeComparisons = true,
    includeProjections = false 
  } = req.query;

  logger.api(`Generating deep analysis for ${symbol}`, { timeframe, includeComparisons });

  try {
    // Mock ticker data
    const tickerData = {
      symbol: symbol,
      name: `${symbol} Corporation`,
      market: 'us_stock',
      sector: 'Technology',
      current_price: 150.00 + Math.random() * 50,
      price_change_percent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 100000000),
      market_cap: Math.floor(Math.random() * 1000000000000),
      last_updated: new Date()
    };

    // Generate comprehensive ticker analysis
    const basicAnalysis = await aiService.generateTickerAnalysis(tickerData, [], []);
    
    // Generate historical price data for technical analysis
    const prices = generateMockPrices(tickerData.current_price, 50);
    const volumes = prices.map(() => Math.floor(Math.random() * 50000000 + 10000000));
    
    const technicalSummary = MarketAnalysisUtils.generateTechnicalSummary(prices, volumes);

    // Deep analysis structure
    const deepAnalysis = {
      metadata: {
        symbol,
        generated_at: new Date().toISOString(),
        timeframe,
        analysis_depth: 'comprehensive'
      },
      basic_analysis: basicAnalysis,
      technical_analysis: technicalSummary,
      fundamental_insights: {
        valuation: generateValuationInsights(tickerData),
        growth_metrics: generateGrowthMetrics(tickerData),
        risk_factors: generateRiskFactors(tickerData, technicalSummary)
      },
      ai_insights: {
        strength_score: calculateStrengthScore(basicAnalysis, technicalSummary),
        momentum_score: technicalSummary.indicators.momentum?.momentumPercent || 0,
        volatility_score: technicalSummary.indicators.volatility?.annualizedVolatility || 15,
        sentiment_score: basicAnalysis.sentiment.score || 0,
        overall_rating: generateOverallRating(basicAnalysis, technicalSummary)
      },
      projections: includeProjections ? generateProjections(tickerData, technicalSummary) : null,
      comparisons: includeComparisons ? generatePeerComparisons(tickerData) : null,
      actionable_insights: generateActionableInsights(basicAnalysis, technicalSummary)
    };

    res.status(200).json({
      success: true,
      data: deepAnalysis,
      message: `Deep analysis for ${symbol} completed successfully`
    });

  } catch (error) {
    logger.error(`Error generating deep analysis for ${symbol}:`, error);
    return next(new AppError(`Failed to generate deep analysis for ${symbol}`, 500));
  }
});

// @desc    Generate market outlook and predictions
// @route   GET /api/ai-summary/market-outlook
// @access  Public
const generateMarketOutlook = catchAsync(async (req, res, next) => {
  const { 
    horizon = 'short', // short, medium, long
    focus = 'general', // general, sectors, risk, opportunities
    confidence_threshold = 0.6 
  } = req.query;

  logger.api('Generating market outlook', { horizon, focus });

  try {
    // Mock comprehensive market data
    const marketData = {
      indices: {
        sp500: { value: 4200, change: 1.2 },
        nasdaq: { value: 13000, change: 0.8 },
        dow: { value: 34000, change: 1.5 }
      },
      sectors: {
        'Technology': { performance: 2.1, outlook: 'positive' },
        'Healthcare': { performance: 0.8, outlook: 'neutral' },
        'Energy': { performance: -1.2, outlook: 'negative' },
        'Financial': { performance: 1.5, outlook: 'positive' }
      },
      economic_indicators: {
        inflation: { current: 3.2, trend: 'decreasing' },
        unemployment: { current: 3.8, trend: 'stable' },
        gdp_growth: { current: 2.1, trend: 'increasing' }
      }
    };

    const outlook = {
      metadata: {
        generated_at: new Date().toISOString(),
        horizon,
        focus,
        confidence_threshold
      },
      market_outlook: {
        overall_direction: determineMarketDirection(marketData),
        key_drivers: [
          'Federal Reserve monetary policy decisions',
          'Corporate earnings growth expectations',
          'Geopolitical tensions and trade relations',
          'Technology sector innovation cycles'
        ],
        risk_factors: [
          'Inflationary pressures and central bank response',
          'Supply chain disruptions',
          'Currency fluctuations',
          'Regulatory changes in key sectors'
        ]
      },
      sector_outlook: generateSectorOutlook(marketData.sectors, horizon),
      predictions: generateMarketPredictions(marketData, horizon),
      investment_themes: [
        {
          theme: 'AI and Automation',
          confidence: 0.85,
          timeframe: 'medium_to_long',
          description: 'Artificial intelligence continues to drive innovation across sectors'
        },
        {
          theme: 'Energy Transition',
          confidence: 0.75,
          timeframe: 'long',
          description: 'Renewable energy and clean technology adoption accelerating'
        },
        {
          theme: 'Healthcare Innovation',
          confidence: 0.70,
          timeframe: 'medium',
          description: 'Biotechnology and digital health solutions gaining traction'
        }
      ],
      scenario_analysis: {
        bull_case: {
          probability: 0.30,
          drivers: ['Strong economic growth', 'Tech breakthrough', 'Policy support'],
          expected_return: '15-25%'
        },
        base_case: {
          probability: 0.50,
          drivers: ['Moderate growth', 'Stable policies', 'Gradual recovery'],
          expected_return: '8-12%'
        },
        bear_case: {
          probability: 0.20,
          drivers: ['Economic slowdown', 'Geopolitical crisis', 'Market correction'],
          expected_return: '-10 to 0%'
        }
      }
    };

    res.status(200).json({
      success: true,
      data: outlook,
      message: 'Market outlook generated successfully'
    });

  } catch (error) {
    logger.error('Error generating market outlook:', error);
    return next(new AppError('Failed to generate market outlook', 500));
  }
});

// @desc    Generate real-time market alerts
// @route   GET /api/ai-summary/alerts
// @access  Public
const generateRealTimeAlerts = catchAsync(async (req, res, next) => {
  const { 
    severity = 'all', // all, high, medium, low
    categories = [], // volatility, volume, sentiment, technical
    limit = 10 
  } = req.query;

  logger.api('Generating real-time alerts', { severity, categories, limit });

  try {
    const alerts = [
      {
        id: 'alert_001',
        timestamp: new Date().toISOString(),
        severity: 'high',
        category: 'volatility',
        symbol: 'TSLA',
        title: 'Unusual volatility detected',
        message: 'TSLA showing 15% intraday movement with high volume',
        confidence: 0.92,
        action_required: true
      },
      {
        id: 'alert_002',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        severity: 'medium',
        category: 'sentiment',
        symbol: 'AAPL',
        title: 'Sentiment shift detected',
        message: 'News sentiment for AAPL turned negative in last hour',
        confidence: 0.78,
        action_required: false
      },
      {
        id: 'alert_003',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        severity: 'low',
        category: 'technical',
        symbol: 'SPY',
        title: 'Technical breakout',
        message: 'SPY broke above resistance level with confirmation',
        confidence: 0.65,
        action_required: false
      }
    ];

    // Filter alerts based on criteria
    let filteredAlerts = alerts;
    if (severity !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
    }
    if (categories.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => categories.includes(alert.category));
    }

    filteredAlerts = filteredAlerts.slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        alerts: filteredAlerts,
        summary: {
          total_alerts: filteredAlerts.length,
          high_priority: filteredAlerts.filter(a => a.severity === 'high').length,
          action_required: filteredAlerts.filter(a => a.action_required).length
        }
      },
      message: 'Real-time alerts generated successfully'
    });

  } catch (error) {
    logger.error('Error generating alerts:', error);
    return next(new AppError('Failed to generate real-time alerts', 500));
  }
});

// Helper functions

function generateMockPrices(currentPrice, days) {
  const prices = [];
  let price = currentPrice;
  
  for (let i = days - 1; i >= 0; i--) {
    const volatility = 0.02; // 2% daily volatility
    const change = (Math.random() - 0.5) * 2 * volatility;
    price = price * (1 + change);
    prices.unshift(price);
  }
  
  return prices;
}

function calculateConfidenceScore(marketSummary, technicalAnalysis) {
  let confidence = 0.5; // Base confidence
  
  // Increase confidence based on data quality and consistency
  if (marketSummary.sentiment.confidence > 0.7) confidence += 0.1;
  if (marketSummary.trends.strength === 'strong') confidence += 0.15;
  if (technicalAnalysis) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function generateStrategicRecommendations(marketSummary, technicalAnalysis) {
  const recommendations = [];
  
  if (marketSummary.trends.trend === 'bullish') {
    recommendations.push({
      type: 'strategic',
      action: 'Consider increasing equity allocation',
      rationale: 'Strong bullish trend with positive momentum',
      timeframe: 'medium_term',
      confidence: 0.75
    });
  }
  
  if (marketSummary.sentiment.overall === 'negative' && marketSummary.trends.trend === 'bearish') {
    recommendations.push({
      type: 'defensive',
      action: 'Implement hedging strategies',
      rationale: 'Negative sentiment combined with bearish trend',
      timeframe: 'short_term',
      confidence: 0.80
    });
  }
  
  return recommendations;
}

function generateRiskRecommendations(marketSummary) {
  const recommendations = [];
  
  if (marketSummary.metrics.volatility > 2) {
    recommendations.push({
      type: 'risk',
      action: 'Reduce position sizes',
      rationale: 'High market volatility detected',
      urgency: 'immediate'
    });
  }
  
  return recommendations;
}

function generateMarketAlerts(marketSummary, tickers) {
  const alerts = [];
  
  // Check for unusual activity
  const highVolumeTickers = tickers.filter(t => t.volume > 50000000);
  if (highVolumeTickers.length > 0) {
    alerts.push({
      type: 'volume_alert',
      message: `${highVolumeTickers.length} tickers showing unusual volume`,
      tickers: highVolumeTickers.map(t => t.symbol)
    });
  }
  
  return alerts;
}

function generateValuationInsights(tickerData) {
  return {
    current_valuation: 'fair_value',
    pe_ratio_estimate: 20 + Math.random() * 10,
    price_target: tickerData.current_price * (1 + (Math.random() - 0.5) * 0.3),
    analyst_rating: ['buy', 'hold', 'sell'][Math.floor(Math.random() * 3)]
  };
}

function generateGrowthMetrics(tickerData) {
  return {
    revenue_growth: (Math.random() * 20 - 5).toFixed(2) + '%',
    earnings_growth: (Math.random() * 30 - 10).toFixed(2) + '%',
    market_position: ['leader', 'challenger', 'follower'][Math.floor(Math.random() * 3)]
  };
}

function generateRiskFactors(tickerData, technicalSummary) {
  const risks = [];
  
  if (technicalSummary.indicators.volatility?.signal === 'high') {
    risks.push('High price volatility');
  }
  
  if (technicalSummary.indicators.rsi > 70) {
    risks.push('Potential overbought conditions');
  }
  
  return risks;
}

function calculateStrengthScore(basicAnalysis, technicalSummary) {
  let score = 50; // Base score
  
  if (basicAnalysis.momentum.trend === 'up') score += 20;
  if (technicalSummary.overall === 'bullish') score += 15;
  if (technicalSummary.indicators.rsi > 30 && technicalSummary.indicators.rsi < 70) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

function generateOverallRating(basicAnalysis, technicalSummary) {
  const strengthScore = calculateStrengthScore(basicAnalysis, technicalSummary);
  
  if (strengthScore >= 80) return 'strong_buy';
  if (strengthScore >= 65) return 'buy';
  if (strengthScore >= 50) return 'hold';
  if (strengthScore >= 35) return 'weak_hold';
  return 'sell';
}

function generateProjections(tickerData, technicalSummary) {
  return {
    short_term: {
      timeframe: '1_week',
      price_target: tickerData.current_price * (1 + (Math.random() - 0.5) * 0.1),
      confidence: 0.6
    },
    medium_term: {
      timeframe: '1_month',
      price_target: tickerData.current_price * (1 + (Math.random() - 0.5) * 0.2),
      confidence: 0.5
    }
  };
}

function generatePeerComparisons(tickerData) {
  return [
    {
      symbol: 'COMP1',
      relative_strength: 'outperforming',
      correlation: 0.75
    },
    {
      symbol: 'COMP2', 
      relative_strength: 'underperforming',
      correlation: 0.68
    }
  ];
}

function generateActionableInsights(basicAnalysis, technicalSummary) {
  const insights = [];
  
  if (technicalSummary.indicators.rsi < 30) {
    insights.push({
      type: 'opportunity',
      message: 'Potential oversold bounce opportunity',
      action: 'Consider accumulating on weakness',
      confidence: 0.7
    });
  }
  
  return insights;
}

function determineMarketDirection(marketData) {
  const avgChange = Object.values(marketData.indices).reduce((sum, idx) => sum + idx.change, 0) / Object.keys(marketData.indices).length;
  
  if (avgChange > 1) return 'bullish';
  if (avgChange < -1) return 'bearish';
  return 'neutral';
}

function generateSectorOutlook(sectors, horizon) {
  return Object.entries(sectors).map(([sector, data]) => ({
    sector,
    outlook: data.outlook,
    expected_performance: data.performance,
    key_drivers: [`${sector} specific factors`, 'Market conditions', 'Economic environment'],
    timeframe: horizon
  }));
}

function generateMarketPredictions(marketData, horizon) {
  return {
    market_direction: determineMarketDirection(marketData),
    volatility_expectation: 'moderate',
    key_levels: {
      support: 4000,
      resistance: 4400
    },
    probability_ranges: {
      up_10_percent: 0.25,
      flat_5_percent: 0.50,
      down_10_percent: 0.25
    }
  };
}

module.exports = {
  generateMarketIntelligence,
  generateTickerDeepAnalysis,
  generateMarketOutlook,
  generateRealTimeAlerts
};