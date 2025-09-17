const logger = require('../utils/logger');

class AIAnalysisService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = {
      marketSummary: 300000, // 5 minutes
      tickerAnalysis: 180000, // 3 minutes
      sectorAnalysis: 600000  // 10 minutes
    };
  }

  /**
   * Generate comprehensive market summary
   */
  async generateMarketSummary(tickerData, newsData = [], timeframe = '1d') {
    const cacheKey = `market_summary_${timeframe}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.marketSummary) {
        return cached.data;
      }
    }

    try {
      // Analyze overall market performance
      const marketMetrics = this.calculateMarketMetrics(tickerData);
      
      // Analyze sentiment from news
      const sentimentAnalysis = this.analyzeSentiment(newsData);
      
      // Detect market trends
      const trendAnalysis = this.detectMarketTrends(tickerData);
      
      // Generate sectors performance
      const sectorsPerformance = this.analyzeSectorPerformance(tickerData);
      
      // Create AI-generated summary
      const summary = this.generateAISummary({
        marketMetrics,
        sentimentAnalysis,
        trendAnalysis,
        sectorsPerformance,
        timeframe
      });

      const result = {
        timestamp: new Date().toISOString(),
        timeframe,
        summary,
        metrics: marketMetrics,
        sentiment: sentimentAnalysis,
        trends: trendAnalysis,
        sectors: sectorsPerformance,
        recommendations: this.generateRecommendations(marketMetrics, trendAnalysis, sentimentAnalysis)
      };

      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      logger.info('Generated market summary', { timeframe, tickersAnalyzed: tickerData.length });
      return result;

    } catch (error) {
      logger.error('Error generating market summary:', error);
      throw error;
    }
  }

  /**
   * Generate individual ticker analysis
   */
  async generateTickerAnalysis(tickerData, historicalData = [], newsData = []) {
    const symbol = tickerData.symbol;
    const cacheKey = `ticker_analysis_${symbol}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.tickerAnalysis) {
        return cached.data;
      }
    }

    try {
      // Technical analysis
      const technicalIndicators = this.calculateTechnicalIndicators(tickerData, historicalData);
      
      // Sentiment analysis specific to this ticker
      const tickerSentiment = this.analyzeTickerSentiment(tickerData.symbol, newsData);
      
      // Price momentum analysis
      const momentum = this.analyzeMomentum(tickerData, historicalData);
      
      // Risk assessment
      const riskAnalysis = this.assessRisk(tickerData, historicalData);
      
      // Generate AI analysis
      const analysis = this.generateTickerAIAnalysis({
        ticker: tickerData,
        technicalIndicators,
        sentiment: tickerSentiment,
        momentum,
        riskAnalysis
      });

      const result = {
        symbol,
        timestamp: new Date().toISOString(),
        analysis,
        technicalIndicators,
        sentiment: tickerSentiment,
        momentum,
        riskAnalysis,
        recommendations: this.generateTickerRecommendations(tickerData, technicalIndicators, momentum)
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      logger.info('Generated ticker analysis', { symbol });
      return result;

    } catch (error) {
      logger.error(`Error generating ticker analysis for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Calculate key market metrics
   */
  calculateMarketMetrics(tickerData) {
    if (!tickerData || tickerData.length === 0) {
      return { totalMarketCap: 0, averageChange: 0, gainers: 0, losers: 0, totalVolume: 0 };
    }

    const totalMarketCap = tickerData.reduce((sum, ticker) => sum + (ticker.market_cap || 0), 0);
    const totalVolume = tickerData.reduce((sum, ticker) => sum + (ticker.volume || 0), 0);
    const averageChange = tickerData.reduce((sum, ticker) => sum + (ticker.price_change_percent || 0), 0) / tickerData.length;
    
    const gainers = tickerData.filter(ticker => (ticker.price_change_percent || 0) > 0).length;
    const losers = tickerData.filter(ticker => (ticker.price_change_percent || 0) < 0).length;
    const unchanged = tickerData.length - gainers - losers;

    const volatility = this.calculateVolatility(tickerData);

    return {
      totalTickers: tickerData.length,
      totalMarketCap,
      totalVolume,
      averageChange,
      gainers,
      losers,
      unchanged,
      volatility,
      gainerRatio: gainers / tickerData.length,
      marketHealth: this.assessMarketHealth(gainers, losers, averageChange)
    };
  }

  /**
   * Analyze sentiment from news data
   */
  analyzeSentiment(newsData) {
    if (!newsData || newsData.length === 0) {
      return { overall: 'neutral', score: 0, confidence: 0.5, breakdown: {} };
    }

    let positiveCount = 0;
    let negativeCount = 0;
    let totalScore = 0;

    const keywords = {
      positive: ['growth', 'surge', 'rally', 'bullish', 'gains', 'up', 'rise', 'strong', 'beat', 'outperform'],
      negative: ['drop', 'fall', 'decline', 'bearish', 'loss', 'down', 'weak', 'miss', 'underperform', 'crash']
    };

    newsData.forEach(news => {
      const text = `${news.title || ''} ${news.description || ''}`.toLowerCase();
      let articleScore = 0;

      keywords.positive.forEach(word => {
        if (text.includes(word)) articleScore += 1;
      });

      keywords.negative.forEach(word => {
        if (text.includes(word)) articleScore -= 1;
      });

      totalScore += articleScore;
      if (articleScore > 0) positiveCount++;
      else if (articleScore < 0) negativeCount++;
    });

    const averageScore = totalScore / newsData.length;
    const overall = averageScore > 0.1 ? 'positive' : averageScore < -0.1 ? 'negative' : 'neutral';
    const confidence = Math.min(Math.abs(averageScore) / 2, 1);

    return {
      overall,
      score: averageScore,
      confidence,
      breakdown: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: newsData.length - positiveCount - negativeCount
      },
      articlesAnalyzed: newsData.length
    };
  }

  /**
   * Detect market trends
   */
  detectMarketTrends(tickerData) {
    if (!tickerData || tickerData.length === 0) {
      return { trend: 'neutral', strength: 'weak', signals: [] };
    }

    const signals = [];
    const gainers = tickerData.filter(t => (t.price_change_percent || 0) > 0).length;
    const totalTickers = tickerData.length;
    const gainerRatio = gainers / totalTickers;

    // Trend detection logic
    let trend = 'neutral';
    let strength = 'weak';

    if (gainerRatio > 0.7) {
      trend = 'bullish';
      strength = gainerRatio > 0.85 ? 'very strong' : 'strong';
      signals.push('Strong buying pressure across markets');
    } else if (gainerRatio < 0.3) {
      trend = 'bearish';
      strength = gainerRatio < 0.15 ? 'very strong' : 'strong';
      signals.push('Widespread selling pressure');
    } else {
      strength = 'moderate';
      signals.push('Mixed market signals');
    }

    // Volume analysis
    const averageVolume = tickerData.reduce((sum, t) => sum + (t.volume || 0), 0) / totalTickers;
    if (averageVolume > 50000000) { // Arbitrary threshold
      signals.push('High trading volume indicates strong interest');
    }

    // Sector rotation detection
    const sectorPerformance = this.analyzeSectorPerformance(tickerData);
    const topSector = Object.keys(sectorPerformance).reduce((a, b) => 
      sectorPerformance[a].averageChange > sectorPerformance[b].averageChange ? a : b
    );
    
    if (Object.keys(sectorPerformance).length > 1) {
      signals.push(`${topSector} sector showing leadership`);
    }

    return { trend, strength, signals, gainerRatio };
  }

  /**
   * Analyze sector performance
   */
  analyzeSectorPerformance(tickerData) {
    if (!tickerData || tickerData.length === 0) return {};

    const sectorMap = {};

    tickerData.forEach(ticker => {
      const sector = ticker.sector || 'Unknown';
      if (!sectorMap[sector]) {
        sectorMap[sector] = {
          tickers: [],
          totalChange: 0,
          totalMarketCap: 0,
          gainers: 0,
          losers: 0
        };
      }

      sectorMap[sector].tickers.push(ticker);
      sectorMap[sector].totalChange += ticker.price_change_percent || 0;
      sectorMap[sector].totalMarketCap += ticker.market_cap || 0;
      
      if ((ticker.price_change_percent || 0) > 0) sectorMap[sector].gainers++;
      else if ((ticker.price_change_percent || 0) < 0) sectorMap[sector].losers++;
    });

    // Calculate averages and rankings
    Object.keys(sectorMap).forEach(sector => {
      const data = sectorMap[sector];
      data.averageChange = data.totalChange / data.tickers.length;
      data.tickerCount = data.tickers.length;
      data.strength = data.gainers / data.tickerCount;
    });

    return sectorMap;
  }

  /**
   * Calculate technical indicators
   */
  calculateTechnicalIndicators(tickerData, historicalData = []) {
    const indicators = {};

    // RSI calculation (simplified)
    indicators.rsi = this.calculateRSI(historicalData);
    
    // Moving averages (if historical data available)
    if (historicalData.length > 0) {
      indicators.sma20 = this.calculateSMA(historicalData, 20);
      indicators.sma50 = this.calculateSMA(historicalData, 50);
    }

    // Price position relative to recent range
    indicators.pricePosition = this.calculatePricePosition(tickerData, historicalData);
    
    return indicators;
  }

  /**
   * Generate AI-powered summary text
   */
  generateAISummary({ marketMetrics, sentimentAnalysis, trendAnalysis, sectorsPerformance, timeframe }) {
    const { totalTickers, averageChange, gainers, losers, gainerRatio, marketHealth } = marketMetrics;
    const { overall: sentiment, confidence } = sentimentAnalysis;
    const { trend, strength } = trendAnalysis;

    let summary = `Market Overview (${timeframe}): `;

    // Market direction
    if (trend === 'bullish') {
      summary += `The market is showing ${strength} bullish momentum with ${Math.round(gainerRatio * 100)}% of tracked stocks advancing. `;
    } else if (trend === 'bearish') {
      summary += `Markets are experiencing ${strength} bearish pressure with ${Math.round((1 - gainerRatio) * 100)}% of stocks declining. `;
    } else {
      summary += `Markets are consolidating with mixed signals - ${gainers} gainers vs ${losers} losers. `;
    }

    // Sentiment integration
    if (sentiment !== 'neutral') {
      summary += `News sentiment is ${sentiment} with ${Math.round(confidence * 100)}% confidence, `;
      if (sentiment === trend || (sentiment === 'positive' && trend === 'bullish') || (sentiment === 'negative' && trend === 'bearish')) {
        summary += 'aligning with price action. ';
      } else {
        summary += 'creating potential contrarian signals. ';
      }
    }

    // Sector leadership
    const topSector = Object.keys(sectorsPerformance).reduce((a, b) => 
      sectorsPerformance[a].averageChange > sectorsPerformance[b].averageChange ? a : b, 
      Object.keys(sectorsPerformance)[0]
    );

    if (topSector && sectorsPerformance[topSector]) {
      summary += `${topSector} is leading with ${sectorsPerformance[topSector].averageChange > 0 ? '+' : ''}${sectorsPerformance[topSector].averageChange.toFixed(2)}% average change. `;
    }

    // Risk assessment
    if (marketHealth === 'healthy') {
      summary += 'Overall market conditions appear healthy for continued participation.';
    } else if (marketHealth === 'cautious') {
      summary += 'Market conditions suggest a cautious approach with selective opportunities.';
    } else {
      summary += 'Current conditions warrant careful risk management and defensive positioning.';
    }

    return summary;
  }

  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(marketMetrics, trendAnalysis, sentimentAnalysis) {
    const recommendations = [];

    // Trend-based recommendations
    if (trendAnalysis.trend === 'bullish' && trendAnalysis.strength === 'strong') {
      recommendations.push({
        type: 'opportunity',
        message: 'Consider increasing equity exposure in strong trending sectors',
        confidence: 'high'
      });
    } else if (trendAnalysis.trend === 'bearish' && trendAnalysis.strength === 'strong') {
      recommendations.push({
        type: 'warning',
        message: 'Consider defensive positioning and risk management',
        confidence: 'high'
      });
    }

    // Sentiment-based recommendations
    if (sentimentAnalysis.overall === 'positive' && sentimentAnalysis.confidence > 0.7) {
      recommendations.push({
        type: 'opportunity',
        message: 'Strong positive sentiment supports continued upward momentum',
        confidence: 'medium'
      });
    }

    // Market health recommendations
    if (marketMetrics.gainerRatio > 0.8) {
      recommendations.push({
        type: 'caution',
        message: 'Broad-based gains may signal potential overextension - monitor for pullbacks',
        confidence: 'medium'
      });
    }

    return recommendations;
  }

  // Helper methods
  calculateVolatility(tickerData) {
    const changes = tickerData.map(t => t.price_change_percent || 0);
    const mean = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / changes.length;
    return Math.sqrt(variance);
  }

  assessMarketHealth(gainers, losers, averageChange) {
    const ratio = gainers / (gainers + losers);
    if (ratio > 0.6 && averageChange > 0) return 'healthy';
    if (ratio < 0.4 && averageChange < 0) return 'unhealthy';
    return 'cautious';
  }

  calculateRSI(historicalData, period = 14) {
    if (historicalData.length < period + 1) return 50; // Neutral RSI
    
    // Simplified RSI calculation
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i < Math.min(period + 1, historicalData.length); i++) {
      const change = historicalData[i].price - historicalData[i-1].price;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  calculateSMA(historicalData, period) {
    if (historicalData.length < period) return null;
    const prices = historicalData.slice(-period).map(d => d.price);
    return prices.reduce((sum, price) => sum + price, 0) / period;
  }

  calculatePricePosition(tickerData, historicalData) {
    if (historicalData.length === 0) return 0.5;
    
    const prices = historicalData.map(d => d.price);
    const currentPrice = tickerData.current_price;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    return (currentPrice - min) / (max - min);
  }

  analyzeMomentum(tickerData, historicalData) {
    return {
      shortTerm: tickerData.price_change_percent || 0,
      trend: tickerData.price_change_percent > 0 ? 'up' : 'down',
      strength: Math.abs(tickerData.price_change_percent || 0) > 2 ? 'strong' : 'weak'
    };
  }

  assessRisk(tickerData, historicalData) {
    const volatility = this.calculateVolatility([tickerData]);
    return {
      level: volatility > 3 ? 'high' : volatility > 1 ? 'medium' : 'low',
      factors: []
    };
  }

  analyzeTickerSentiment(symbol, newsData) {
    // Filter news specific to this ticker
    const tickerNews = newsData.filter(news => 
      news.title?.toLowerCase().includes(symbol.toLowerCase()) ||
      news.description?.toLowerCase().includes(symbol.toLowerCase())
    );
    
    return this.analyzeSentiment(tickerNews);
  }

  generateTickerAIAnalysis({ ticker, technicalIndicators, sentiment, momentum, riskAnalysis }) {
    const { symbol, name, current_price, price_change_percent } = ticker;
    
    let analysis = `${name} (${symbol}) Analysis: `;
    
    // Price action
    if (price_change_percent > 0) {
      analysis += `Currently trading at $${current_price} with a ${price_change_percent.toFixed(2)}% gain. `;
    } else {
      analysis += `Currently trading at $${current_price} with a ${Math.abs(price_change_percent).toFixed(2)}% decline. `;
    }

    // Technical perspective
    if (technicalIndicators.rsi) {
      if (technicalIndicators.rsi > 70) {
        analysis += 'Technical indicators suggest overbought conditions. ';
      } else if (technicalIndicators.rsi < 30) {
        analysis += 'Technical indicators suggest oversold conditions. ';
      }
    }

    // Sentiment integration
    if (sentiment.overall !== 'neutral') {
      analysis += `Market sentiment for this ticker is ${sentiment.overall}. `;
    }

    return analysis;
  }

  generateTickerRecommendations(tickerData, technicalIndicators, momentum) {
    const recommendations = [];
    
    if (momentum.trend === 'up' && momentum.strength === 'strong') {
      recommendations.push({
        type: 'opportunity',
        message: 'Strong upward momentum - consider position on pullbacks',
        confidence: 'medium'
      });
    }

    return recommendations;
  }
}

module.exports = AIAnalysisService;