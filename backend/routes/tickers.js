const express = require('express');
const router = express.Router();

// Mock data for demonstration - replace with real database in production
let tickers = [
  {
    id: 1,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    market: 'us_stock',
    current_price: 175.43,
    price_change: 2.15,
    price_change_percent: 1.24,
    volume: 45623000,
    market_cap: 2800000000000,
    sector: 'Technology',
    last_updated: new Date().toISOString(),
    is_active: true,
    sentiment_score: 0.65,
    news_count: 12
  },
  {
    id: 2,
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    market: 'us_stock',
    current_price: 242.68,
    price_change: -5.32,
    price_change_percent: -2.15,
    volume: 89542000,
    market_cap: 770000000000,
    sector: 'Automotive',
    last_updated: new Date().toISOString(),
    is_active: true,
    sentiment_score: 0.15,
    news_count: 8
  },
  {
    id: 3,
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd',
    market: 'indian_stock',
    current_price: 2456.75,
    price_change: 18.50,
    price_change_percent: 0.76,
    volume: 1245000,
    market_cap: 16600000000000,
    sector: 'Energy',
    last_updated: new Date().toISOString(),
    is_active: true,
    sentiment_score: 0.45,
    news_count: 5
  },
  {
    id: 4,
    symbol: 'BTC',
    name: 'Bitcoin',
    market: 'crypto',
    current_price: 43250.75,
    price_change: 1250.25,
    price_change_percent: 2.98,
    volume: 28500000000,
    market_cap: 845000000000,
    sector: 'Cryptocurrency',
    last_updated: new Date().toISOString(),
    is_active: true,
    sentiment_score: 0.72,
    news_count: 15
  },
  {
    id: 5,
    symbol: 'EUR/USD',
    name: 'Euro to US Dollar',
    market: 'forex',
    current_price: 1.0875,
    price_change: -0.0025,
    price_change_percent: -0.23,
    volume: 0,
    market_cap: 0,
    sector: 'Currency',
    last_updated: new Date().toISOString(),
    is_active: true,
    sentiment_score: -0.15,
    news_count: 3
  }
];

let nextId = 6;

// GET /api/tickers - Get all tickers with filtering and pagination
router.get('/', (req, res) => {
  try {
    const { 
      market, 
      sector, 
      is_active, 
      page = 1, 
      limit = 50, 
      sort = 'symbol',
      order = 'asc',
      search 
    } = req.query;

    let filteredTickers = [...tickers];

    // Apply filters
    if (market && market !== 'all') {
      filteredTickers = filteredTickers.filter(t => t.market === market);
    }
    
    if (sector) {
      filteredTickers = filteredTickers.filter(t => 
        t.sector.toLowerCase().includes(sector.toLowerCase())
      );
    }
    
    if (is_active !== undefined) {
      filteredTickers = filteredTickers.filter(t => 
        t.is_active === (is_active === 'true')
      );
    }
    
    if (search) {
      filteredTickers = filteredTickers.filter(t => 
        t.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    filteredTickers.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickers = filteredTickers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedTickers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredTickers.length,
        pages: Math.ceil(filteredTickers.length / parseInt(limit))
      },
      filters: { market, sector, is_active, search },
      sort: { field: sort, order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/tickers/:id - Get ticker by ID
router.get('/:id', (req, res) => {
  try {
    const ticker = tickers.find(t => t.id === parseInt(req.params.id));
    
    if (!ticker) {
      return res.status(404).json({
        success: false,
        error: 'Ticker not found',
        message: `No ticker found with ID ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: ticker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/tickers/symbol/:symbol - Get ticker by symbol
router.get('/symbol/:symbol', (req, res) => {
  try {
    const ticker = tickers.find(t => 
      t.symbol.toLowerCase() === req.params.symbol.toLowerCase()
    );
    
    if (!ticker) {
      return res.status(404).json({
        success: false,
        error: 'Ticker not found',
        message: `No ticker found with symbol ${req.params.symbol}`
      });
    }

    res.json({
      success: true,
      data: ticker
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/tickers - Add new ticker
router.post('/', (req, res) => {
  try {
    const { symbol, name, market, sector } = req.body;

    if (!symbol || !name || !market) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Symbol, name, and market are required fields'
      });
    }

    // Check if ticker already exists
    const existingTicker = tickers.find(t => 
      t.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (existingTicker) {
      return res.status(409).json({
        success: false,
        error: 'Ticker already exists',
        message: `Ticker with symbol ${symbol} already exists`
      });
    }

    const newTicker = {
      id: nextId++,
      symbol: symbol.toUpperCase(),
      name,
      market,
      current_price: 0,
      price_change: 0,
      price_change_percent: 0,
      volume: 0,
      market_cap: 0,
      sector: sector || '',
      last_updated: new Date().toISOString(),
      is_active: true,
      sentiment_score: 0,
      news_count: 0
    };

    tickers.push(newTicker);

    res.status(201).json({
      success: true,
      data: newTicker,
      message: 'Ticker added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /api/tickers/:id - Update ticker
router.put('/:id', (req, res) => {
  try {
    const tickerIndex = tickers.findIndex(t => t.id === parseInt(req.params.id));
    
    if (tickerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ticker not found',
        message: `No ticker found with ID ${req.params.id}`
      });
    }

    const updatedTicker = {
      ...tickers[tickerIndex],
      ...req.body,
      id: parseInt(req.params.id), // Ensure ID doesn't change
      last_updated: new Date().toISOString()
    };

    tickers[tickerIndex] = updatedTicker;

    res.json({
      success: true,
      data: updatedTicker,
      message: 'Ticker updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /api/tickers/:id - Delete ticker
router.delete('/:id', (req, res) => {
  try {
    const tickerIndex = tickers.findIndex(t => t.id === parseInt(req.params.id));
    
    if (tickerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Ticker not found',
        message: `No ticker found with ID ${req.params.id}`
      });
    }

    const deletedTicker = tickers.splice(tickerIndex, 1)[0];

    res.json({
      success: true,
      data: deletedTicker,
      message: 'Ticker deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/tickers/stats/summary - Get ticker statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = {
      total: tickers.length,
      active: tickers.filter(t => t.is_active).length,
      markets: {
        us_stock: tickers.filter(t => t.market === 'us_stock').length,
        indian_stock: tickers.filter(t => t.market === 'indian_stock').length,
        crypto: tickers.filter(t => t.market === 'crypto').length,
        forex: tickers.filter(t => t.market === 'forex').length
      },
      performance: {
        gainers: tickers.filter(t => t.price_change > 0).length,
        losers: tickers.filter(t => t.price_change < 0).length,
        unchanged: tickers.filter(t => t.price_change === 0).length
      },
      sentiment: {
        positive: tickers.filter(t => t.sentiment_score > 0).length,
        negative: tickers.filter(t => t.sentiment_score < 0).length,
        neutral: tickers.filter(t => t.sentiment_score === 0).length
      }
    };

    res.json({
      success: true,
      data: stats
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