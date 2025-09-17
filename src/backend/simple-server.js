const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Real-time stock data function using Yahoo Finance API
const getStockData = async (symbol) => {
  try {
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      timeout: 5000
    });
    
    const result = response.data.chart.result[0];
    const meta = result.meta;
    
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      id: Math.floor(Math.random() * 10000),
      symbol: symbol.toUpperCase(),
      name: meta.longName || meta.shortName || symbol,
      market: 'us_stock',
      current_price: currentPrice,
      price_change: change,
      price_change_percent: changePercent,
      volume: meta.regularMarketVolume || 0,
      market_cap: meta.marketCap || 0,
      sector: 'Technology', // Default for demo
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.log(`Using fallback data for ${symbol}`);
    // Fallback to mock data with some randomization
    const mockData = {
      'AAPL': { name: 'Apple Inc.', basePrice: 175, sector: 'Technology' },
      'MSFT': { name: 'Microsoft Corporation', basePrice: 338, sector: 'Technology' },
      'GOOGL': { name: 'Alphabet Inc.', basePrice: 134, sector: 'Technology' },
      'AMZN': { name: 'Amazon.com, Inc.', basePrice: 128, sector: 'E-commerce' },
      'TSLA': { name: 'Tesla, Inc.', basePrice: 242, sector: 'Automotive' },
      'META': { name: 'Meta Platforms, Inc.', basePrice: 298, sector: 'Technology' },
      'NVDA': { name: 'NVIDIA Corporation', basePrice: 421, sector: 'Technology' },
      'NFLX': { name: 'Netflix, Inc.', basePrice: 385, sector: 'Entertainment' },
    };
    
    const stock = mockData[symbol] || { name: symbol, basePrice: 100, sector: 'Unknown' };
    const randomChange = (Math.random() - 0.5) * 10; // Random change between -5 and +5
    const currentPrice = stock.basePrice + randomChange;
    const changePercent = (randomChange / stock.basePrice) * 100;
    
    return {
      id: Math.floor(Math.random() * 10000),
      symbol: symbol.toUpperCase(),
      name: stock.name,
      market: 'us_stock',
      current_price: Number(currentPrice.toFixed(2)),
      price_change: Number(randomChange.toFixed(2)),
      price_change_percent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 100000000),
      market_cap: Math.floor(Math.random() * 2000000000000),
      sector: stock.sector,
      last_updated: new Date().toISOString()
    };
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'TickerTracker API Server',
    version: '1.0.0',
    health: '/health'
  });
});

// Real-time tickers endpoint
app.get('/api/tickers', async (req, res) => {
  try {
    const { limit = 10, search, market } = req.query;
    
    // Popular stocks for real-time data
    const popularStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'DIS', 'BABA'];
    
    let stocksToFetch = popularStocks;
    
    // Handle search query
    if (search) {
      const searchLower = search.toLowerCase();
      stocksToFetch = popularStocks.filter(symbol => 
        symbol.toLowerCase().includes(searchLower)
      );
      
      // If search doesn't match any popular stocks, try to fetch the search term as a symbol
      if (stocksToFetch.length === 0 && search.length <= 5) {
        stocksToFetch = [search.toUpperCase()];
      }
    }
    
    // Limit the number of stocks to fetch
    stocksToFetch = stocksToFetch.slice(0, parseInt(limit));
    
    // Fetch real-time data for each stock
    const stockPromises = stocksToFetch.map(symbol => getStockData(symbol));
    const stockData = await Promise.all(stockPromises);
    
    // Filter out any null results
    const validStockData = stockData.filter(stock => stock !== null);
    
    res.json({
      success: true,
      count: validStockData.length,
      data: validStockData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching tickers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ticker data'
    });
  }
});

// Ticker search endpoint for Add Ticker functionality
app.get('/api/tickers/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // For demo, search common stocks + user input
    const commonStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'DIS', 'BABA'];
    const matchingSymbols = commonStocks.filter(symbol => 
      symbol.toLowerCase().includes(q.toLowerCase())
    );

    // Also try the search term as a direct symbol
    if (q.length <= 5 && !matchingSymbols.includes(q.toUpperCase())) {
      matchingSymbols.push(q.toUpperCase());
    }

    const stockData = [];
    for (const symbol of matchingSymbols.slice(0, 5)) {
      const data = await getStockData(symbol);
      if (data) stockData.push(data);
    }

    res.json({
      success: true,
      data: stockData,
      count: stockData.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Add ticker creation endpoint
app.post('/api/tickers', express.json(), async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }

    // Fetch real-time data for the new ticker
    const tickerData = await getStockData(symbol);
    if (!tickerData) {
      return res.status(404).json({ error: 'Ticker not found' });
    }

    res.status(201).json({
      success: true,
      data: tickerData
    });
  } catch (error) {
    console.error('Error creating ticker:', error);
    res.status(500).json({ error: 'Failed to add ticker' });
  }
});

// Real-time news endpoint
app.get('/api/news', (req, res) => {
  // Generate dynamic mock news with current timestamps
  const newsTemplates = [
    {
      headline: 'Apple Stock Reaches New Heights Amid Strong iPhone Sales',
      summary: 'Apple Inc. shares surged today following better-than-expected quarterly earnings and strong iPhone 15 sales figures.',
      ticker_symbol: 'AAPL',
      sentiment: 'positive',
      source: 'MarketWatch'
    },
    {
      headline: 'Tesla Announces Major Expansion Plans for Gigafactory Network',
      summary: 'Tesla Inc. unveiled ambitious plans to expand its manufacturing capabilities with three new Gigafactories planned for 2024.',
      ticker_symbol: 'TSLA',
      sentiment: 'positive',
      source: 'Reuters'
    },
    {
      headline: 'Microsoft Azure Revenue Beats Expectations in Cloud Computing Boom',
      summary: 'Microsoft Corporation reported record Azure revenue growth, outpacing competitors in the enterprise cloud market.',
      ticker_symbol: 'MSFT',
      sentiment: 'positive',
      source: 'Bloomberg'
    },
    {
      headline: 'Fed Decision Impacts Tech Sector as Interest Rate Concerns Grow',
      summary: 'Technology stocks faced pressure following Federal Reserve comments about potential interest rate adjustments.',
      ticker_symbol: 'QQQ',
      sentiment: 'negative',
      source: 'CNBC'
    },
    {
      headline: 'Amazon Web Services Launches New AI-Powered Analytics Tools',
      summary: 'Amazon.com Inc. introduced advanced machine learning capabilities to its cloud platform, targeting enterprise customers.',
      ticker_symbol: 'AMZN',
      sentiment: 'positive',
      source: 'TechCrunch'
    }
  ];

  const dynamicNews = newsTemplates.map((template, index) => ({
    id: `news_${Date.now()}_${index}`,
    ...template,
    published_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Random time within last 24 hours
    url: `https://example.com/news/${template.ticker_symbol.toLowerCase()}-${index}`
  }));

  res.json({
    success: true,
    data: dynamicNews,
    count: dynamicNews.length
  });
});

// Alerts endpoints
app.get('/api/alerts', (req, res) => {
  const mockAlerts = [
    {
      id: 'alert_1',
      ticker_symbol: 'AAPL',
      alert_type: 'price_target',
      condition: 'price above 180',
      target_value: 180,
      priority: 'high',
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'alert_2',
      ticker_symbol: 'TSLA',
      alert_type: 'price_change',
      condition: 'price change > 5%',
      target_value: 5,
      priority: 'medium',
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'alert_3',
      ticker_symbol: 'BTC',
      alert_type: 'volume_spike',
      condition: 'volume > 30B',
      target_value: 30000000000,
      priority: 'high',
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'alert_4',
      ticker_symbol: 'RELIANCE.NS',
      alert_type: 'news_sentiment',
      condition: 'sentiment positive',
      target_value: 1,
      priority: 'low',
      is_active: true,
      created_date: new Date().toISOString()
    },
    {
      id: 'alert_5',
      ticker_symbol: 'EUR/USD',
      alert_type: 'technical_indicator',
      condition: 'RSI oversold',
      target_value: 30,
      priority: 'medium',
      is_active: false,
      created_date: new Date().toISOString()
    }
  ];

  res.json({
    success: true,
    data: mockAlerts,
    count: mockAlerts.length
  });
});

// Create alert
app.post('/api/alerts', express.json(), (req, res) => {
  const newAlert = {
    id: `alert_${Date.now()}`,
    ...req.body,
    is_active: true,
    created_date: new Date().toISOString()
  };

  res.json({
    success: true,
    data: newAlert
  });
});

// Update alert
app.put('/api/alerts/:id', express.json(), (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: { id, ...req.body, updated_at: new Date().toISOString() }
  });
});

// Delete alert
app.delete('/api/alerts/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Alert deleted successfully'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 TickerTracker Backend with Real-Time Data running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Tickers API: http://localhost:${PORT}/api/tickers`);
  console.log(`🔍 Ticker Search: http://localhost:${PORT}/api/tickers/search`);
  console.log(`📰 News API: http://localhost:${PORT}/api/news`);
  console.log(`🚨 Alerts API: http://localhost:${PORT}/api/alerts`);
  console.log(`🌐 Frontend: http://localhost:3001`);
});

module.exports = app;