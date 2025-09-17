const Ticker = require('../models/Ticker');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Mock data for development without MongoDB
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
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
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
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
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
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
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
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '60f7c2b4e3b4a8c7a8e4b5d5',
    symbol: 'RELIANCE.BO',
    name: 'Reliance Industries Limited',
    market: 'indian_stock',
    sector: 'Energy',
    current_price: 2456.30,
    price_change: 45.20,
    price_change_percent: 1.87,
    volume: 5678901,
    market_cap: 16500000000000,
    is_active: true,
    last_updated: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc    Get all tickers with filtering, sorting, and pagination
// @route   GET /api/tickers
// @access  Public
const getTickers = catchAsync(async (req, res, next) => {
  logger.api('GET /api/tickers', { query: req.query });

  // If MongoDB is not connected, use mock data
  if (!isMongoConnected()) {
    let filteredTickers = [...mockTickers];
    
    // Apply filters to mock data
    if (req.query.market) {
      filteredTickers = filteredTickers.filter(ticker => ticker.market === req.query.market);
    }
    
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredTickers = filteredTickers.filter(ticker => 
        ticker.symbol.toLowerCase().includes(searchTerm) ||
        ticker.name.toLowerCase().includes(searchTerm) ||
        ticker.sector.toLowerCase().includes(searchTerm)
      );
    }
    
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const page = parseInt(req.query.page, 10) || 1;
    const startIndex = (page - 1) * limit;
    
    const paginatedTickers = filteredTickers.slice(startIndex, startIndex + limit);
    
    return res.status(200).json({
      success: true,
      count: paginatedTickers.length,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(filteredTickers.length / limit),
        total_count: filteredTickers.length,
        has_next: startIndex + limit < filteredTickers.length,
        has_prev: page > 1,
        next_page: startIndex + limit < filteredTickers.length ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null
      },
      data: paginatedTickers,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  // Build filter object for MongoDB
  const filter = {};
  
  if (req.query.market) {
    filter.market = req.query.market;
  }
  
  if (req.query.sector) {
    filter.sector = new RegExp(req.query.sector, 'i');
  }
  
  if (req.query.is_active !== undefined) {
    filter.is_active = req.query.is_active === 'true';
  }
  
  if (req.query.search) {
    filter.$or = [
      { symbol: new RegExp(req.query.search, 'i') },
      { name: new RegExp(req.query.search, 'i') },
      { sector: new RegExp(req.query.search, 'i') }
    ];
  }

  // Price range filter
  if (req.query.min_price || req.query.max_price) {
    filter.current_price = {};
    if (req.query.min_price) filter.current_price.$gte = parseFloat(req.query.min_price);
    if (req.query.max_price) filter.current_price.$lte = parseFloat(req.query.max_price);
  }

  // Market cap range filter
  if (req.query.min_market_cap || req.query.max_market_cap) {
    filter.market_cap = {};
    if (req.query.min_market_cap) filter.market_cap.$gte = parseFloat(req.query.min_market_cap);
    if (req.query.max_market_cap) filter.market_cap.$lte = parseFloat(req.query.max_market_cap);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const startIndex = (page - 1) * limit;

  // Sorting
  let sortBy = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sortBy[field.substring(1)] = -1;
      } else {
        sortBy[field] = 1;
      }
    });
  } else {
    sortBy = { last_updated: -1 };
  }

  // Execute query
  const tickers = await Ticker.find(filter)
    .sort(sortBy)
    .limit(limit)
    .skip(startIndex)
    .lean();

  // Get total count for pagination
  const total = await Ticker.countDocuments(filter);

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  res.status(200).json({
    success: true,
    count: tickers.length,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_count: total,
      has_next: hasNextPage,
      has_prev: hasPrevPage,
      next_page: hasNextPage ? page + 1 : null,
      prev_page: hasPrevPage ? page - 1 : null
    },
    data: tickers
  });
});

// @desc    Get single ticker
// @route   GET /api/tickers/:id
// @access  Public
const getTicker = catchAsync(async (req, res, next) => {
  const ticker = await Ticker.findById(req.params.id);

  if (!ticker) {
    return next(new AppError(`Ticker not found with id ${req.params.id}`, 404));
  }

  logger.api(`GET ticker: ${ticker.symbol}`, { id: req.params.id });

  res.status(200).json({
    success: true,
    data: ticker
  });
});

// @desc    Get ticker by symbol
// @route   GET /api/tickers/symbol/:symbol
// @access  Public
const getTickerBySymbol = catchAsync(async (req, res, next) => {
  const symbol = req.params.symbol.toUpperCase();
  const ticker = await Ticker.findOne({ symbol });

  if (!ticker) {
    return next(new AppError(`Ticker not found with symbol ${symbol}`, 404));
  }

  logger.api(`GET ticker by symbol: ${symbol}`);

  res.status(200).json({
    success: true,
    data: ticker
  });
});

// @desc    Create new ticker
// @route   POST /api/tickers
// @access  Public
const createTicker = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }

  // Check if ticker already exists
  const existingTicker = await Ticker.findOne({ symbol: req.body.symbol?.toUpperCase() });
  if (existingTicker) {
    return next(new AppError(`Ticker with symbol ${req.body.symbol} already exists`, 409));
  }

  const ticker = await Ticker.create(req.body);

  logger.api(`Created ticker: ${ticker.symbol}`, { id: ticker._id });

  res.status(201).json({
    success: true,
    data: ticker
  });
});

// @desc    Update ticker
// @route   PUT /api/tickers/:id
// @access  Public
const updateTicker = catchAsync(async (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }

  let ticker = await Ticker.findById(req.params.id);

  if (!ticker) {
    return next(new AppError(`Ticker not found with id ${req.params.id}`, 404));
  }

  // Check if trying to update symbol and it already exists
  if (req.body.symbol && req.body.symbol.toUpperCase() !== ticker.symbol) {
    const existingTicker = await Ticker.findOne({ symbol: req.body.symbol.toUpperCase() });
    if (existingTicker) {
      return next(new AppError(`Ticker with symbol ${req.body.symbol} already exists`, 409));
    }
  }

  ticker = await Ticker.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  logger.api(`Updated ticker: ${ticker.symbol}`, { id: req.params.id });

  res.status(200).json({
    success: true,
    data: ticker
  });
});

// @desc    Update ticker price
// @route   PATCH /api/tickers/:id/price
// @access  Public
const updateTickerPrice = catchAsync(async (req, res, next) => {
  const { current_price, volume } = req.body;

  if (!current_price || current_price <= 0) {
    return next(new AppError('Valid current_price is required', 400));
  }

  const ticker = await Ticker.findById(req.params.id);

  if (!ticker) {
    return next(new AppError(`Ticker not found with id ${req.params.id}`, 404));
  }

  // Use the instance method to update price
  await ticker.updatePrice(current_price, volume);

  logger.api(`Updated price for ticker: ${ticker.symbol}`, { 
    old_price: ticker.current_price,
    new_price: current_price 
  });

  res.status(200).json({
    success: true,
    data: ticker
  });
});

// @desc    Delete ticker
// @route   DELETE /api/tickers/:id
// @access  Public
const deleteTicker = catchAsync(async (req, res, next) => {
  const ticker = await Ticker.findById(req.params.id);

  if (!ticker) {
    return next(new AppError(`Ticker not found with id ${req.params.id}`, 404));
  }

  await ticker.deleteOne();

  logger.api(`Deleted ticker: ${ticker.symbol}`, { id: req.params.id });

  res.status(200).json({
    success: true,
    message: `Ticker ${ticker.symbol} deleted successfully`
  });
});

// @desc    Get market overview stats
// @route   GET /api/tickers/stats/market
// @access  Public
const getMarketStats = catchAsync(async (req, res, next) => {
  // If MongoDB is not connected, use mock data
  if (!isMongoConnected()) {
    const stats = [
      {
        _id: 'us_stock',
        count: 3,
        avg_price: 187.38,
        total_market_cap: 5289000000000,
        avg_change_percent: 1.80,
        gainers: 2,
        losers: 1,
        unchanged: 0
      },
      {
        _id: 'crypto',
        count: 1,
        avg_price: 43250.75,
        total_market_cap: 845000000000,
        avg_change_percent: -1.93,
        gainers: 0,
        losers: 1,
        unchanged: 0
      },
      {
        _id: 'indian_stock',
        count: 1,
        avg_price: 2456.30,
        total_market_cap: 16500000000000,
        avg_change_percent: 1.87,
        gainers: 1,
        losers: 0,
        unchanged: 0
      }
    ];
    
    logger.api('GET market stats (mock data)');
    
    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  const stats = await Ticker.aggregate([
    {
      $match: { is_active: true }
    },
    {
      $group: {
        _id: '$market',
        count: { $sum: 1 },
        avg_price: { $avg: '$current_price' },
        total_market_cap: { $sum: '$market_cap' },
        avg_change_percent: { $avg: '$price_change_percent' },
        gainers: {
          $sum: { $cond: [{ $gt: ['$price_change_percent', 0] }, 1, 0] }
        },
        losers: {
          $sum: { $cond: [{ $lt: ['$price_change_percent', 0] }, 1, 0] }
        },
        unchanged: {
          $sum: { $cond: [{ $eq: ['$price_change_percent', 0] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  logger.api('GET market stats');

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get top gainers
// @route   GET /api/tickers/top/gainers
// @access  Public
const getTopGainers = catchAsync(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const market = req.query.market;

  let filter = { is_active: true };
  if (market) {
    filter.market = market;
  }

  const gainers = await Ticker.find(filter)
    .sort({ price_change_percent: -1 })
    .limit(limit)
    .lean();

  logger.api('GET top gainers', { limit, market });

  res.status(200).json({
    success: true,
    count: gainers.length,
    data: gainers
  });
});

// @desc    Get top losers
// @route   GET /api/tickers/top/losers
// @access  Public
const getTopLosers = catchAsync(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const market = req.query.market;

  let filter = { is_active: true };
  if (market) {
    filter.market = market;
  }

  const losers = await Ticker.find(filter)
    .sort({ price_change_percent: 1 })
    .limit(limit)
    .lean();

  logger.api('GET top losers', { limit, market });

  res.status(200).json({
    success: true,
    count: losers.length,
    data: losers
  });
});

// @desc    Search tickers
// @route   GET /api/tickers/search
// @access  Public
const searchTickers = catchAsync(async (req, res, next) => {
  const { q: query, market, limit = 20 } = req.query;

  if (!query) {
    return next(new AppError('Search query is required', 400));
  }

  // If MongoDB is not connected, use mock data
  if (!isMongoConnected()) {
    const searchTerm = query.toLowerCase();
    let results = mockTickers.filter(ticker => 
      ticker.symbol.toLowerCase().includes(searchTerm) ||
      ticker.name.toLowerCase().includes(searchTerm) ||
      ticker.sector.toLowerCase().includes(searchTerm)
    );
    
    if (market) {
      results = results.filter(ticker => ticker.market === market);
    }
    
    const searchLimit = Math.min(parseInt(limit), 50);
    results = results.slice(0, searchLimit);
    
    logger.api('Search tickers (mock data)', { query, market, results: results.length });
    
    return res.status(200).json({
      success: true,
      count: results.length,
      query,
      data: results,
      message: 'Using mock data - MongoDB not connected'
    });
  }

  const searchLimit = Math.min(parseInt(limit), 50);
  let searchFilter = {
    is_active: true,
    $or: [
      { symbol: new RegExp(query, 'i') },
      { name: new RegExp(query, 'i') },
      { sector: new RegExp(query, 'i') }
    ]
  };

  if (market) {
    searchFilter.market = market;
  }

  const results = await Ticker.find(searchFilter)
    .limit(searchLimit)
    .sort({ symbol: 1 })
    .lean();

  logger.api('Search tickers', { query, market, results: results.length });

  res.status(200).json({
    success: true,
    count: results.length,
    query,
    data: results
  });
});

module.exports = {
  getTickers,
  getTicker,
  getTickerBySymbol,
  createTicker,
  updateTicker,
  updateTickerPrice,
  deleteTicker,
  getMarketStats,
  getTopGainers,
  getTopLosers,
  searchTickers
};