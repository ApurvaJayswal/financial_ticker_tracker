const express = require('express');
const router = express.Router();

// GET /api/markets/overview - Get market overview statistics
router.get('/overview', (req, res) => {
  try {
    // Mock market data
    const marketData = {
      us_stock: {
        name: 'US Stock Market',
        icon: '🇺🇸',
        indices: {
          'S&P 500': { value: 4567.89, change: 12.34, change_percent: 0.27 },
          'NASDAQ': { value: 14234.56, change: -23.45, change_percent: -0.16 },
          'DOW': { value: 34567.12, change: 45.67, change_percent: 0.13 }
        },
        market_status: 'open',
        session_change: 0.15,
        volume: '3.2B',
        top_movers: {
          gainers: ['AAPL', 'MSFT', 'GOOGL'],
          losers: ['TSLA', 'META', 'NFLX']
        }
      },
      indian_stock: {
        name: 'Indian Stock Market',
        icon: '🇮🇳',
        indices: {
          'SENSEX': { value: 65432.10, change: 234.56, change_percent: 0.36 },
          'NIFTY': { value: 19876.54, change: 87.32, change_percent: 0.44 }
        },
        market_status: 'closed',
        session_change: 0.35,
        volume: '₹45,000Cr',
        top_movers: {
          gainers: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'],
          losers: ['HDFC.NS', 'ICICIBANK.NS', 'SBIN.NS']
        }
      },
      crypto: {
        name: 'Cryptocurrency Market',
        icon: '₿',
        indices: {
          'Bitcoin': { value: 43250.75, change: 1250.25, change_percent: 2.98 },
          'Ethereum': { value: 2456.89, change: -45.32, change_percent: -1.81 },
          'Total Market Cap': { value: 1650000000000, change: 25000000000, change_percent: 1.54 }
        },
        market_status: '24/7',
        session_change: 1.85,
        volume: '$125B',
        top_movers: {
          gainers: ['BTC', 'ETH', 'BNB'],
          losers: ['ADA', 'SOL', 'MATIC']
        }
      },
      forex: {
        name: 'Foreign Exchange',
        icon: '💱',
        indices: {
          'EUR/USD': { value: 1.0875, change: -0.0025, change_percent: -0.23 },
          'GBP/USD': { value: 1.2654, change: 0.0034, change_percent: 0.27 },
          'USD/JPY': { value: 149.85, change: 0.45, change_percent: 0.30 }
        },
        market_status: '24/5',
        session_change: -0.05,
        volume: '$6.6T',
        top_movers: {
          gainers: ['GBP/USD', 'AUD/USD', 'USD/CAD'],
          losers: ['EUR/USD', 'USD/CHF', 'NZD/USD']
        }
      }
    };

    res.json({
      success: true,
      data: marketData,
      timestamp: new Date().toISOString(),
      market_hours: {
        us: 'Open 9:30 AM - 4:00 PM EST',
        indian: 'Open 9:15 AM - 3:30 PM IST',
        crypto: '24/7',
        forex: '24/5 (Sun 5PM - Fri 5PM EST)'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/markets/status - Get current market status
router.get('/status', (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Simplified market status logic (you'd want more sophisticated timezone handling in production)
    const marketStatus = {
      us_stock: {
        status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 9 && currentHour < 16) ? 'open' : 'closed',
        next_session: currentDay === 5 && currentHour >= 16 ? 'Monday 9:30 AM EST' : 'Next trading day 9:30 AM EST'
      },
      indian_stock: {
        status: (currentDay >= 1 && currentDay <= 5 && currentHour >= 9 && currentHour < 15) ? 'open' : 'closed',
        next_session: currentDay === 5 && currentHour >= 15 ? 'Monday 9:15 AM IST' : 'Next trading day 9:15 AM IST'
      },
      crypto: {
        status: 'open',
        next_session: 'Always open'
      },
      forex: {
        status: (currentDay >= 0 && currentDay <= 5) ? 'open' : 'closed',
        next_session: currentDay === 5 ? 'Sunday 5:00 PM EST' : 'Always open weekdays'
      }
    };

    res.json({
      success: true,
      data: marketStatus,
      timestamp: now.toISOString(),
      timezone: 'Server timezone (adjust for production)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/markets/gainers-losers - Get top gainers and losers across markets
router.get('/gainers-losers', (req, res) => {
  try {
    const { market = 'all', limit = 10 } = req.query;

    // Mock data for gainers and losers
    const moversData = {
      gainers: [
        { symbol: 'AAPL', name: 'Apple Inc.', market: 'us_stock', change_percent: 5.67, price: 175.43 },
        { symbol: 'BTC', name: 'Bitcoin', market: 'crypto', change_percent: 4.32, price: 43250.75 },
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries', market: 'indian_stock', change_percent: 3.45, price: 2456.75 },
        { symbol: 'EUR/GBP', name: 'Euro to British Pound', market: 'forex', change_percent: 2.87, price: 0.8654 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'us_stock', change_percent: 2.34, price: 342.56 }
      ],
      losers: [
        { symbol: 'TSLA', name: 'Tesla, Inc.', market: 'us_stock', change_percent: -4.23, price: 242.68 },
        { symbol: 'ETH', name: 'Ethereum', market: 'crypto', change_percent: -3.45, price: 2456.89 },
        { symbol: 'HDFC.NS', name: 'HDFC Bank', market: 'indian_stock', change_percent: -2.87, price: 1654.32 },
        { symbol: 'GBP/JPY', name: 'British Pound to Japanese Yen', market: 'forex', change_percent: -2.12, price: 189.45 },
        { symbol: 'META', name: 'Meta Platforms', market: 'us_stock', change_percent: -1.98, price: 298.76 }
      ]
    };

    let filteredData = { ...moversData };

    if (market !== 'all') {
      filteredData.gainers = moversData.gainers
        .filter(item => item.market === market)
        .slice(0, parseInt(limit));
      filteredData.losers = moversData.losers
        .filter(item => item.market === market)
        .slice(0, parseInt(limit));
    } else {
      filteredData.gainers = moversData.gainers.slice(0, parseInt(limit));
      filteredData.losers = moversData.losers.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: filteredData,
      filters: { market, limit },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/markets/sentiment - Get overall market sentiment
router.get('/sentiment', (req, res) => {
  try {
    const sentimentData = {
      overall: {
        sentiment: 'bullish',
        score: 0.65,
        confidence: 0.78,
        description: 'Market showing positive momentum with strong institutional interest'
      },
      by_market: {
        us_stock: { sentiment: 'bullish', score: 0.72, trend: 'up' },
        indian_stock: { sentiment: 'neutral', score: 0.15, trend: 'sideways' },
        crypto: { sentiment: 'very_bullish', score: 0.89, trend: 'up' },
        forex: { sentiment: 'bearish', score: -0.23, trend: 'down' }
      },
      fear_greed_index: {
        value: 68,
        level: 'Greed',
        description: 'Markets showing signs of greed, be cautious of overvaluation'
      },
      volatility_index: {
        value: 15.4,
        level: 'Low',
        description: 'Low volatility suggests stable market conditions'
      },
      key_drivers: [
        'Strong corporate earnings',
        'Favorable economic indicators',
        'Institutional crypto adoption',
        'Central bank policy expectations'
      ],
      risks: [
        'Geopolitical tensions',
        'Interest rate uncertainty',
        'Inflation concerns',
        'Supply chain disruptions'
      ]
    };

    res.json({
      success: true,
      data: sentimentData,
      timestamp: new Date().toISOString(),
      next_update: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;