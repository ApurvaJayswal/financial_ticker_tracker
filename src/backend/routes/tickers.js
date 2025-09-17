const express = require('express');
const { body, param, query } = require('express-validator');
const {
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
} = require('../controllers/tickerController');

const router = express.Router();

// Validation rules
const createTickerValidation = [
  body('symbol')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be between 1 and 10 characters')
    .matches(/^[A-Z0-9./-]+$/i)
    .withMessage('Symbol can only contain letters, numbers, dots, slashes, and dashes'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters'),
  body('market')
    .isIn(['us_stock', 'indian_stock', 'crypto', 'forex'])
    .withMessage('Market must be one of: us_stock, indian_stock, crypto, forex'),
  body('current_price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('sector')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sector must be less than 100 characters'),
  body('volume')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Volume must be a positive number'),
  body('market_cap')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Market cap must be a positive number')
];

const updateTickerValidation = [
  body('symbol')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be between 1 and 10 characters')
    .matches(/^[A-Z0-9./-]+$/i)
    .withMessage('Symbol can only contain letters, numbers, dots, slashes, and dashes'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Name must be between 1 and 200 characters'),
  body('market')
    .optional()
    .isIn(['us_stock', 'indian_stock', 'crypto', 'forex'])
    .withMessage('Market must be one of: us_stock, indian_stock, crypto, forex'),
  body('current_price')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('sector')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sector must be less than 100 characters'),
  body('volume')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Volume must be a positive number'),
  body('market_cap')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Market cap must be a positive number')
];

const priceUpdateValidation = [
  body('current_price')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('volume')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Volume must be a positive number')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ticker ID')
];

const symbolValidation = [
  param('symbol')
    .isString()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Symbol must be between 1 and 10 characters')
];

const searchValidation = [
  query('q')
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search query must be between 1 and 50 characters'),
  query('market')
    .optional()
    .isIn(['us_stock', 'indian_stock', 'crypto', 'forex'])
    .withMessage('Market must be one of: us_stock, indian_stock, crypto, forex'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes

// GET /api/tickers/search - Search tickers (must be before /:id)
router.get('/search', searchValidation, searchTickers);

// GET /api/tickers/stats/market - Get market statistics
router.get('/stats/market', getMarketStats);

// GET /api/tickers/top/gainers - Get top gainers
router.get('/top/gainers', getTopGainers);

// GET /api/tickers/top/losers - Get top losers
router.get('/top/losers', getTopLosers);

// GET /api/tickers/symbol/:symbol - Get ticker by symbol
router.get('/symbol/:symbol', symbolValidation, getTickerBySymbol);

// Main CRUD routes
router.route('/')
  .get(getTickers)
  .post(createTickerValidation, createTicker);

router.route('/:id')
  .get(idValidation, getTicker)
  .put([...idValidation, ...updateTickerValidation], updateTicker)
  .delete(idValidation, deleteTicker);

// PATCH /api/tickers/:id/price - Update ticker price
router.patch('/:id/price', [...idValidation, ...priceUpdateValidation], updateTickerPrice);

module.exports = router;