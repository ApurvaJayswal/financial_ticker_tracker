import mongoose from 'mongoose';

const PricePointSchema = new mongoose.Schema({
  ticker: { type: String, required: true, index: true }, // e.g. AAPL, TCS, BTC
  market: {
    type: String,
    required: true,
    enum: ['US', 'INDIA', 'CRYPTO'],
  },
  source: { type: String, required: true }, // e.g. AlphaVantage, CoinGecko
  price: { type: Number, required: true },  // current price
  openPrice: { type: Number, default: null },  // opening price
  highPrice: { type: Number, default: null },  // high price
  lowPrice: { type: Number, default: null },   // low price
  volume: { type: Number, default: null },     // trading volume
  marketCap: { type: Number, default: null },  // market capitalization
  change: { type: Number, default: null },     // price change
  changePercent: { type: Number, default: null }, // percentage change
  timestamp: { type: Date, required: true, index: true }, // price timestamp
}, {
  timestamps: true,  // auto adds createdAt, updatedAt
  versionKey: false, // disables __v
});

// Compound index for fast retrieval of recent prices
PricePointSchema.index({ ticker: 1, timestamp: -1 });

// Optional TTL index for old price data cleanup (e.g., keep 30 days of data only)
PricePointSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('PricePoint', PricePointSchema);
