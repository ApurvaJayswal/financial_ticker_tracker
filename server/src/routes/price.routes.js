import express from 'express';
import PricePoint from '../models/price.model.js';
import { fetchCryptoPrice } from '../services/coingecko.service.js';
import { fetchStockQuote } from '../services/alphavantage.service.js';

const router = express.Router();
const RECENT_MS = 15 * 1000;

// GET /api/price - Get current price for a ticker
router.get('/', async (req, res) => {
  try {
    const { ticker, market = 'US', source } = req.query;
    if (!ticker) {
      res.status(400).json({ error: 'ticker is required' });
      return;
    }

    const now = Date.now();
    const recent = new Date(now - RECENT_MS);

    // Try to get cached price first
    const cached = await PricePoint.findOne({
      ticker: ticker.toUpperCase(),
      timestamp: { $gte: recent }
    })
      .sort({ timestamp: -1 })
      .lean();

    if (cached) {
      return res.json({
        ticker: cached.ticker,
        market: cached.market,
        source: cached.source,
        price: cached.price,
        openPrice: cached.openPrice,
        highPrice: cached.highPrice,
        lowPrice: cached.lowPrice,
        volume: cached.volume,
        marketCap: cached.marketCap,
        change: cached.change,
        changePercent: cached.changePercent,
        timestamp: cached.timestamp,
        cached: true
      });
    }

    // Fetch fresh data
    let result;
    let usedSource = source;

    if (market.toUpperCase() === 'CRYPTO') {
      const coinId = ticker.toLowerCase();
      result = await fetchCryptoPrice(coinId, 'usd');
      usedSource = usedSource || 'coingecko';
    } else {
      result = await fetchStockQuote(ticker.toUpperCase());
      usedSource = usedSource || 'alphavantage';
    }

    // Create new price point
    const newPrice = {
      ticker: ticker.toUpperCase(),
      market: market.toUpperCase(),
      source: usedSource,
      price: result.price,
      openPrice: result.openPrice,
      highPrice: result.highPrice,
      lowPrice: result.lowPrice,
      volume: result.volume,
      marketCap: result.marketCap,
      change: result.change,
      changePercent: result.changePercent,
      timestamp: new Date()
    };

    const doc = await PricePoint.create(newPrice);
    res.json({ ...doc.toObject(), cached: false });

  } catch (err) {
    console.error('Price fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

// GET /api/price/historical - Get historical prices
router.get('/historical', async (req, res) => {
  try {
    const { ticker, period = '1D' } = req.query;
    if (!ticker) {
      res.status(400).json({ error: 'ticker is required' });
      return;
    }

    // Calculate time range based on period
    const now = Date.now();
    let startTime;
    switch (period) {
      case '1D':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case '5D':
        startTime = now - 5 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '3M':
        startTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '6M':
        startTime = now - 180 * 24 * 60 * 60 * 1000;
        break;
      case '1Y':
        startTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    const prices = await PricePoint.find({
      ticker: ticker.toUpperCase(),
      timestamp: { $gte: new Date(startTime) }
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json({ data: prices });
  } catch (err) {
    console.error('Historical prices error:', err);
    res.status(500).json({ error: 'Failed to fetch historical prices' });
  }
});

export default router;