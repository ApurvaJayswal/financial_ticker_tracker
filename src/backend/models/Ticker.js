const mongoose = require('mongoose');

const tickerSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Ticker symbol is required'],
    uppercase: true,
    trim: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Company/Asset name is required'],
    trim: true,
    index: true
  },
  market: {
    type: String,
    required: [true, 'Market type is required'],
    enum: {
      values: ['us_stock', 'indian_stock', 'crypto', 'forex'],
      message: 'Market must be one of: us_stock, indian_stock, crypto, forex'
    },
    index: true
  },
  sector: {
    type: String,
    trim: true,
    index: true
  },
  industry: {
    type: String,
    trim: true
  },
  current_price: {
    type: Number,
    required: [true, 'Current price is required'],
    min: [0, 'Price cannot be negative']
  },
  price_change: {
    type: Number,
    default: 0
  },
  price_change_percent: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0,
    min: [0, 'Volume cannot be negative']
  },
  market_cap: {
    type: Number,
    default: 0,
    min: [0, 'Market cap cannot be negative']
  },
  high_52_week: {
    type: Number,
    min: [0, '52 week high cannot be negative']
  },
  low_52_week: {
    type: Number,
    min: [0, '52 week low cannot be negative']
  },
  dividend_yield: {
    type: Number,
    default: 0,
    min: [0, 'Dividend yield cannot be negative']
  },
  pe_ratio: {
    type: Number,
    min: [0, 'PE ratio cannot be negative']
  },
  beta: {
    type: Number
  },
  earnings_per_share: {
    type: Number
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  exchange: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  sentiment_score: {
    type: Number,
    default: 0,
    min: [-1, 'Sentiment score must be between -1 and 1'],
    max: [1, 'Sentiment score must be between -1 and 1']
  },
  news_count: {
    type: Number,
    default: 0,
    min: [0, 'News count cannot be negative']
  },
  last_updated: {
    type: Date,
    default: Date.now,
    index: true
  },
  data_source: {
    type: String,
    enum: ['alpha_vantage', 'finnhub', 'yahoo_finance', 'manual', 'other'],
    default: 'manual'
  },
  metadata: {
    tags: [String],
    watchlists: [String],
    notes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tickerSchema.index({ symbol: 1, market: 1 });
tickerSchema.index({ sector: 1, market: 1 });
tickerSchema.index({ last_updated: -1 });
tickerSchema.index({ is_active: 1, market: 1 });
tickerSchema.index({ price_change_percent: -1 });
tickerSchema.index({ market_cap: -1 });

// Virtual for market status
tickerSchema.virtual('market_status').get(function() {
  if (this.price_change_percent > 5) return 'strong_bull';
  if (this.price_change_percent > 1) return 'bull';
  if (this.price_change_percent > -1) return 'neutral';
  if (this.price_change_percent > -5) return 'bear';
  return 'strong_bear';
});

// Virtual for price trend
tickerSchema.virtual('price_trend').get(function() {
  if (this.price_change > 0) return 'up';
  if (this.price_change < 0) return 'down';
  return 'flat';
});

// Pre-save middleware to update last_updated
tickerSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.last_updated = new Date();
  }
  next();
});

// Static methods
tickerSchema.statics.findByMarket = function(market) {
  return this.find({ market, is_active: true });
};

tickerSchema.statics.findTopGainers = function(limit = 10) {
  return this.find({ is_active: true })
    .sort({ price_change_percent: -1 })
    .limit(limit);
};

tickerSchema.statics.findTopLosers = function(limit = 10) {
  return this.find({ is_active: true })
    .sort({ price_change_percent: 1 })
    .limit(limit);
};

tickerSchema.statics.findBySector = function(sector) {
  return this.find({ sector, is_active: true });
};

tickerSchema.statics.searchTickers = function(query) {
  return this.find({
    $and: [
      { is_active: true },
      {
        $or: [
          { symbol: { $regex: query, $options: 'i' } },
          { name: { $regex: query, $options: 'i' } },
          { sector: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  });
};

// Instance methods
tickerSchema.methods.updatePrice = function(newPrice, volume = null) {
  const oldPrice = this.current_price;
  this.current_price = newPrice;
  this.price_change = newPrice - oldPrice;
  this.price_change_percent = ((newPrice - oldPrice) / oldPrice) * 100;
  
  if (volume !== null) {
    this.volume = volume;
  }
  
  this.last_updated = new Date();
  return this.save();
};

tickerSchema.methods.calculateMovingAverage = function(days) {
  // This would need historical price data
  // For now, return current price as placeholder
  return this.current_price;
};

// Export the model
module.exports = mongoose.model('Ticker', tickerSchema);