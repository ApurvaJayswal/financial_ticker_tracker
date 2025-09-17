const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News title is required'],
    trim: true,
    maxlength: [500, 'Title cannot be more than 500 characters'],
    index: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [2000, 'Summary cannot be more than 2000 characters']
  },
  content: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    required: [true, 'News URL is required'],
    trim: true,
    unique: true,
    index: true
  },
  source: {
    type: String,
    required: [true, 'News source is required'],
    trim: true,
    index: true
  },
  author: {
    type: String,
    trim: true
  },
  published_at: {
    type: Date,
    required: [true, 'Published date is required'],
    index: true
  },
  image_url: {
    type: String,
    trim: true
  },
  related_tickers: [{
    type: String,
    uppercase: true,
    trim: true,
    index: true
  }],
  category: {
    type: String,
    enum: {
      values: [
        'general', 'technology', 'business', 'entertainment', 'health',
        'science', 'sports', 'finance', 'crypto', 'markets', 'earnings',
        'mergers', 'ipo', 'economy', 'politics', 'breaking'
      ],
      message: 'Invalid news category'
    },
    default: 'general',
    index: true
  },
  sentiment: {
    type: String,
    enum: {
      values: ['positive', 'negative', 'neutral'],
      message: 'Sentiment must be positive, negative, or neutral'
    },
    default: 'neutral',
    index: true
  },
  sentiment_score: {
    type: Number,
    default: 0,
    min: [-1, 'Sentiment score must be between -1 and 1'],
    max: [1, 'Sentiment score must be between -1 and 1']
  },
  sentiment_confidence: {
    type: Number,
    default: 0,
    min: [0, 'Confidence must be between 0 and 1'],
    max: [1, 'Confidence must be between 0 and 1']
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  market_impact: {
    type: String,
    enum: ['high', 'medium', 'low', 'unknown'],
    default: 'unknown',
    index: true
  },
  relevance_score: {
    type: Number,
    default: 0,
    min: [0, 'Relevance score must be between 0 and 1'],
    max: [1, 'Relevance score must be between 0 and 1']
  },
  language: {
    type: String,
    default: 'en',
    lowercase: true
  },
  is_featured: {
    type: Boolean,
    default: false,
    index: true
  },
  is_trending: {
    type: Boolean,
    default: false,
    index: true
  },
  view_count: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  share_count: {
    type: Number,
    default: 0,
    min: [0, 'Share count cannot be negative']
  },
  data_source: {
    type: String,
    enum: ['newsapi', 'finnhub', 'alpha_vantage', 'manual', 'rss', 'other'],
    default: 'manual'
  },
  external_id: {
    type: String,
    trim: true,
    sparse: true
  },
  metadata: {
    scraped_at: Date,
    processing_status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    ai_processed: {
      type: Boolean,
      default: false
    },
    tags: [String],
    region: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
newsSchema.index({ published_at: -1 });
newsSchema.index({ related_tickers: 1, published_at: -1 });
newsSchema.index({ category: 1, published_at: -1 });
newsSchema.index({ sentiment: 1, market_impact: 1 });
newsSchema.index({ is_featured: 1, published_at: -1 });
newsSchema.index({ is_trending: 1, published_at: -1 });
newsSchema.index({ source: 1, published_at: -1 });
newsSchema.index({ keywords: 1 });
newsSchema.index({ title: 'text', summary: 'text', content: 'text' });

// Virtual for age in hours
newsSchema.virtual('age_hours').get(function() {
  return Math.floor((new Date() - this.published_at) / (1000 * 60 * 60));
});

// Virtual for freshness indicator
newsSchema.virtual('freshness').get(function() {
  const hoursAgo = this.age_hours;
  if (hoursAgo <= 1) return 'breaking';
  if (hoursAgo <= 6) return 'fresh';
  if (hoursAgo <= 24) return 'recent';
  if (hoursAgo <= 168) return 'week_old';
  return 'old';
});

// Virtual for engagement score
newsSchema.virtual('engagement_score').get(function() {
  return (this.view_count * 0.1) + (this.share_count * 0.9);
});

// Pre-save middleware
newsSchema.pre('save', function(next) {
  // Auto-determine sentiment from score
  if (this.sentiment_score > 0.1) {
    this.sentiment = 'positive';
  } else if (this.sentiment_score < -0.1) {
    this.sentiment = 'negative';
  } else {
    this.sentiment = 'neutral';
  }

  // Update trending status based on engagement
  if (this.engagement_score > 100 && this.age_hours <= 24) {
    this.is_trending = true;
  }

  next();
});

// Static methods
newsSchema.statics.findByTicker = function(ticker, limit = 20) {
  return this.find({ 
    related_tickers: { $in: [ticker.toUpperCase()] }
  })
  .sort({ published_at: -1 })
  .limit(limit);
};

newsSchema.statics.findByCategory = function(category, limit = 50) {
  return this.find({ category })
    .sort({ published_at: -1 })
    .limit(limit);
};

newsSchema.statics.findTrending = function(limit = 10) {
  return this.find({ is_trending: true })
    .sort({ engagement_score: -1, published_at: -1 })
    .limit(limit);
};

newsSchema.statics.findFeatured = function(limit = 5) {
  return this.find({ is_featured: true })
    .sort({ published_at: -1 })
    .limit(limit);
};

newsSchema.statics.findBySentiment = function(sentiment, limit = 50) {
  return this.find({ sentiment })
    .sort({ published_at: -1 })
    .limit(limit);
};

newsSchema.statics.searchNews = function(query, options = {}) {
  const searchCriteria = {
    $text: { $search: query }
  };

  // Add optional filters
  if (options.category) {
    searchCriteria.category = options.category;
  }
  if (options.sentiment) {
    searchCriteria.sentiment = options.sentiment;
  }
  if (options.tickers && options.tickers.length > 0) {
    searchCriteria.related_tickers = { $in: options.tickers.map(t => t.toUpperCase()) };
  }
  if (options.dateFrom) {
    searchCriteria.published_at = { $gte: options.dateFrom };
  }
  if (options.dateTo) {
    searchCriteria.published_at = { 
      ...searchCriteria.published_at, 
      $lte: options.dateTo 
    };
  }

  return this.find(searchCriteria)
    .sort({ score: { $meta: 'textScore' }, published_at: -1 })
    .limit(options.limit || 50);
};

newsSchema.statics.getMarketSentiment = async function(timeframe = 24) {
  const cutoffDate = new Date(Date.now() - (timeframe * 60 * 60 * 1000));
  
  const pipeline = [
    { $match: { published_at: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
        avg_score: { $avg: '$sentiment_score' }
      }
    }
  ];

  return this.aggregate(pipeline);
};

// Instance methods
newsSchema.methods.incrementViews = function() {
  this.view_count += 1;
  return this.save();
};

newsSchema.methods.incrementShares = function() {
  this.share_count += 1;
  return this.save();
};

newsSchema.methods.addTicker = function(ticker) {
  if (!this.related_tickers.includes(ticker.toUpperCase())) {
    this.related_tickers.push(ticker.toUpperCase());
    return this.save();
  }
  return Promise.resolve(this);
};

newsSchema.methods.removeTicker = function(ticker) {
  const index = this.related_tickers.indexOf(ticker.toUpperCase());
  if (index > -1) {
    this.related_tickers.splice(index, 1);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('News', newsSchema);