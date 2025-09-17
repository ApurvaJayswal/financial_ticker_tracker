const logger = require('./logger');

/**
 * Market Analysis Utilities
 * Comprehensive technical analysis and market calculation functions
 */

class MarketAnalysisUtils {
  
  /**
   * Calculate Simple Moving Average (SMA)
   */
  static calculateSMA(prices, period) {
    if (prices.length < period) return null;
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / period;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static calculateEMA(prices, period, previousEMA = null) {
    if (prices.length === 0) return null;
    
    const multiplier = 2 / (period + 1);
    const currentPrice = prices[prices.length - 1];
    
    if (previousEMA === null) {
      // Use SMA as starting point
      return this.calculateSMA(prices.slice(-period), period);
    }
    
    return (currentPrice * multiplier) + (previousEMA * (1 - multiplier));
  }

  /**
   * Calculate Relative Strength Index (RSI)
   */
  static calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50; // Neutral RSI
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial average gain/loss
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI for remaining periods
    for (let i = period + 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      const gain = change > 0 ? change : 0;
      const loss = change < 0 ? -change : 0;
      
      avgGain = ((avgGain * (period - 1)) + gain) / period;
      avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    }
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   */
  static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    
    return {
      macd: macdLine,
      signal: null, // Would need historical MACD values to calculate signal line
      histogram: null,
      fastEMA,
      slowEMA
    };
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices, period = 20, standardDeviations = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    const slice = prices.slice(-period);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      middle: sma,
      upper: sma + (standardDeviation * standardDeviations),
      lower: sma - (standardDeviation * standardDeviations),
      bandwidth: (standardDeviation * standardDeviations * 2) / sma * 100
    };
  }

  /**
   * Calculate Stochastic Oscillator
   */
  static calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
    if (highs.length < kPeriod || lows.length < kPeriod || closes.length < kPeriod) {
      return null;
    }
    
    const recentHighs = highs.slice(-kPeriod);
    const recentLows = lows.slice(-kPeriod);
    const currentClose = closes[closes.length - 1];
    
    const highestHigh = Math.max(...recentHighs);
    const lowestLow = Math.min(...recentLows);
    
    const kPercent = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    
    return {
      k: kPercent,
      d: null, // Would need historical %K values to calculate %D
      signal: kPercent > 80 ? 'overbought' : kPercent < 20 ? 'oversold' : 'neutral'
    };
  }

  /**
   * Calculate Average True Range (ATR) - Volatility measure
   */
  static calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < 2 || lows.length < 2 || closes.length < 2) return null;
    
    const trueRanges = [];
    
    for (let i = 1; i < Math.min(highs.length, lows.length, closes.length); i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    if (trueRanges.length < period) return null;
    
    return this.calculateSMA(trueRanges, period);
  }

  /**
   * Detect chart patterns
   */
  static detectPatterns(prices, volume = []) {
    if (prices.length < 10) return [];
    
    const patterns = [];
    const recent = prices.slice(-10);
    
    // Simple pattern detection
    if (this.isDoubleToppPattern(recent)) {
      patterns.push({
        type: 'double_top',
        signal: 'bearish',
        strength: 'medium',
        description: 'Potential double top pattern detected'
      });
    }
    
    if (this.isDoubleBottomPattern(recent)) {
      patterns.push({
        type: 'double_bottom',
        signal: 'bullish',
        strength: 'medium',
        description: 'Potential double bottom pattern detected'
      });
    }
    
    if (this.isTrianglePattern(recent)) {
      patterns.push({
        type: 'triangle',
        signal: 'consolidation',
        strength: 'low',
        description: 'Triangle consolidation pattern detected'
      });
    }
    
    return patterns;
  }

  /**
   * Calculate support and resistance levels
   */
  static findSupportResistance(prices, strength = 2) {
    if (prices.length < 10) return { support: [], resistance: [] };
    
    const support = [];
    const resistance = [];
    const peaks = [];
    const valleys = [];
    
    // Find local maxima and minima
    for (let i = strength; i < prices.length - strength; i++) {
      let isPeak = true;
      let isValley = true;
      
      for (let j = i - strength; j <= i + strength; j++) {
        if (j === i) continue;
        if (prices[j] >= prices[i]) isPeak = false;
        if (prices[j] <= prices[i]) isValley = false;
      }
      
      if (isPeak) peaks.push({ index: i, price: prices[i] });
      if (isValley) valleys.push({ index: i, price: prices[i] });
    }
    
    // Group similar levels
    const tolerance = 0.02; // 2% tolerance
    
    peaks.forEach(peak => {
      const level = resistance.find(r => Math.abs(r.price - peak.price) / peak.price < tolerance);
      if (level) {
        level.touches++;
        level.strength = Math.min(level.strength + 0.1, 1.0);
      } else {
        resistance.push({
          price: peak.price,
          touches: 1,
          strength: 0.5,
          type: 'resistance'
        });
      }
    });
    
    valleys.forEach(valley => {
      const level = support.find(s => Math.abs(s.price - valley.price) / valley.price < tolerance);
      if (level) {
        level.touches++;
        level.strength = Math.min(level.strength + 0.1, 1.0);
      } else {
        support.push({
          price: valley.price,
          touches: 1,
          strength: 0.5,
          type: 'support'
        });
      }
    });
    
    return {
      support: support.sort((a, b) => b.strength - a.strength).slice(0, 3),
      resistance: resistance.sort((a, b) => b.strength - a.strength).slice(0, 3)
    };
  }

  /**
   * Calculate market momentum indicators
   */
  static calculateMomentum(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    const currentPrice = prices[prices.length - 1];
    const pastPrice = prices[prices.length - period - 1];
    
    const momentum = currentPrice - pastPrice;
    const momentumPercent = (momentum / pastPrice) * 100;
    
    return {
      momentum,
      momentumPercent,
      signal: momentumPercent > 5 ? 'strong_bullish' : 
              momentumPercent > 1 ? 'bullish' :
              momentumPercent < -5 ? 'strong_bearish' :
              momentumPercent < -1 ? 'bearish' : 'neutral'
    };
  }

  /**
   * Volume analysis
   */
  static analyzeVolume(prices, volumes, period = 20) {
    if (volumes.length < period) return null;
    
    const avgVolume = this.calculateSMA(volumes, period);
    const currentVolume = volumes[volumes.length - 1];
    const volumeRatio = currentVolume / avgVolume;
    
    const priceChange = prices.length >= 2 ? 
      (prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2] * 100 : 0;
    
    return {
      currentVolume,
      avgVolume,
      volumeRatio,
      signal: this.getVolumeSignal(priceChange, volumeRatio),
      analysis: this.getVolumeAnalysis(priceChange, volumeRatio)
    };
  }

  /**
   * Calculate volatility metrics
   */
  static calculateVolatility(prices, period = 20) {
    if (prices.length < period) return null;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    
    const recentReturns = returns.slice(-period);
    const mean = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;
    const variance = recentReturns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / recentReturns.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Annualized volatility (assuming daily data)
    const annualizedVolatility = standardDeviation * Math.sqrt(252) * 100;
    
    return {
      dailyVolatility: standardDeviation * 100,
      annualizedVolatility,
      signal: annualizedVolatility > 30 ? 'high' : annualizedVolatility > 15 ? 'medium' : 'low'
    };
  }

  /**
   * Market correlation analysis
   */
  static calculateCorrelation(prices1, prices2) {
    if (prices1.length !== prices2.length || prices1.length < 2) return null;
    
    const returns1 = [];
    const returns2 = [];
    
    for (let i = 1; i < prices1.length; i++) {
      returns1.push((prices1[i] - prices1[i - 1]) / prices1[i - 1]);
      returns2.push((prices2[i] - prices2[i - 1]) / prices2[i - 1]);
    }
    
    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;
    
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const correlation = numerator / Math.sqrt(sumSq1 * sumSq2);
    
    return {
      correlation,
      strength: Math.abs(correlation) > 0.7 ? 'strong' : 
                Math.abs(correlation) > 0.3 ? 'moderate' : 'weak',
      direction: correlation > 0 ? 'positive' : 'negative'
    };
  }

  // Helper methods for pattern recognition

  static isDoubleToppPattern(prices) {
    if (prices.length < 5) return false;
    
    const peaks = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        peaks.push({ index: i, price: prices[i] });
      }
    }
    
    if (peaks.length < 2) return false;
    
    const lastTwo = peaks.slice(-2);
    const priceDiff = Math.abs(lastTwo[0].price - lastTwo[1].price);
    const avgPrice = (lastTwo[0].price + lastTwo[1].price) / 2;
    
    return (priceDiff / avgPrice) < 0.03; // Within 3%
  }

  static isDoubleBottomPattern(prices) {
    if (prices.length < 5) return false;
    
    const valleys = [];
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        valleys.push({ index: i, price: prices[i] });
      }
    }
    
    if (valleys.length < 2) return false;
    
    const lastTwo = valleys.slice(-2);
    const priceDiff = Math.abs(lastTwo[0].price - lastTwo[1].price);
    const avgPrice = (lastTwo[0].price + lastTwo[1].price) / 2;
    
    return (priceDiff / avgPrice) < 0.03; // Within 3%
  }

  static isTrianglePattern(prices) {
    if (prices.length < 6) return false;
    
    const highs = [];
    const lows = [];
    
    for (let i = 1; i < prices.length - 1; i++) {
      if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
        highs.push(prices[i]);
      }
      if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
        lows.push(prices[i]);
      }
    }
    
    if (highs.length < 2 || lows.length < 2) return false;
    
    // Check if highs are decreasing and lows are increasing
    const highsDecreasing = highs.length >= 2 && highs[0] > highs[highs.length - 1];
    const lowsIncreasing = lows.length >= 2 && lows[0] < lows[lows.length - 1];
    
    return highsDecreasing && lowsIncreasing;
  }

  static getVolumeSignal(priceChange, volumeRatio) {
    if (priceChange > 1 && volumeRatio > 1.5) return 'strong_bullish';
    if (priceChange > 0 && volumeRatio > 1.2) return 'bullish';
    if (priceChange < -1 && volumeRatio > 1.5) return 'strong_bearish';
    if (priceChange < 0 && volumeRatio > 1.2) return 'bearish';
    return 'neutral';
  }

  static getVolumeAnalysis(priceChange, volumeRatio) {
    if (volumeRatio > 2) {
      return 'Exceptional volume activity suggests strong institutional interest';
    }
    if (volumeRatio > 1.5) {
      return 'Above average volume confirms price movement';
    }
    if (volumeRatio < 0.5) {
      return 'Below average volume suggests lack of conviction';
    }
    return 'Normal volume activity';
  }

  /**
   * Generate comprehensive technical summary
   */
  static generateTechnicalSummary(prices, volumes = [], highs = [], lows = []) {
    const summary = {
      timestamp: new Date().toISOString(),
      indicators: {},
      signals: [],
      patterns: [],
      levels: { support: [], resistance: [] },
      overall: 'neutral'
    };

    try {
      // Calculate indicators
      summary.indicators.sma20 = this.calculateSMA(prices, 20);
      summary.indicators.sma50 = this.calculateSMA(prices, 50);
      summary.indicators.rsi = this.calculateRSI(prices);
      summary.indicators.bollinger = this.calculateBollingerBands(prices);
      summary.indicators.momentum = this.calculateMomentum(prices);
      summary.indicators.volatility = this.calculateVolatility(prices);

      // Generate signals
      if (summary.indicators.rsi > 70) {
        summary.signals.push({ type: 'overbought', message: 'RSI indicates overbought conditions' });
      } else if (summary.indicators.rsi < 30) {
        summary.signals.push({ type: 'oversold', message: 'RSI indicates oversold conditions' });
      }

      if (summary.indicators.sma20 && summary.indicators.sma50) {
        if (summary.indicators.sma20 > summary.indicators.sma50) {
          summary.signals.push({ type: 'bullish', message: 'Short-term MA above long-term MA' });
        } else {
          summary.signals.push({ type: 'bearish', message: 'Short-term MA below long-term MA' });
        }
      }

      // Detect patterns
      summary.patterns = this.detectPatterns(prices, volumes);

      // Find support/resistance
      summary.levels = this.findSupportResistance(prices);

      // Volume analysis if available
      if (volumes.length > 0) {
        summary.indicators.volume = this.analyzeVolume(prices, volumes);
      }

      // Overall assessment
      const bullishSignals = summary.signals.filter(s => s.type === 'bullish').length;
      const bearishSignals = summary.signals.filter(s => s.type === 'bearish').length;
      
      if (bullishSignals > bearishSignals) {
        summary.overall = 'bullish';
      } else if (bearishSignals > bullishSignals) {
        summary.overall = 'bearish';
      }

      logger.info('Generated technical summary', { 
        signalsCount: summary.signals.length,
        patternsCount: summary.patterns.length,
        overall: summary.overall
      });

    } catch (error) {
      logger.error('Error generating technical summary:', error);
      summary.error = error.message;
    }

    return summary;
  }
}

module.exports = MarketAnalysisUtils;