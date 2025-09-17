const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // For now, allow alerts without users
    index: true
  },
  ticker_symbol: {
    type: String,
    required: [true, 'Ticker symbol is required'],
    uppercase: true,
    trim: true,
    index: true
  },
  alert_type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: {
      values: [
        'price_target', 'price_change', 'price_change_percent',
        'volume_spike', 'market_cap_change', 'news_sentiment',
        'technical_indicator', 'earnings_date', 'dividend_date'
      ],
      message: 'Invalid alert type'
    },
    index: true
  },
  condition: {
    type: String,
    required: [true, 'Alert condition is required'],
    enum: {
      values: ['above', 'below', 'equals', 'crosses_above', 'crosses_below', 'change_by'],
      message: 'Invalid alert condition'
    }
  },
  threshold_value: {
    type: Number,
    required: [true, 'Threshold value is required']
  },
  current_value: {
    type: Number,
    default: 0
  },
  comparison_timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    default: '1d'
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, 'Alert message cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Priority must be low, medium, high, or critical'
    },
    default: 'medium',
    index: true
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  },
  is_triggered: {
    type: Boolean,
    default: false,
    index: true
  },
  trigger_count: {
    type: Number,
    default: 0,
    min: [0, 'Trigger count cannot be negative']
  },
  max_triggers: {
    type: Number,
    default: 1,
    min: [1, 'Max triggers must be at least 1']
  },
  triggered_at: {
    type: Date,
    index: true
  },
  last_checked: {
    type: Date,
    default: Date.now,
    index: true
  },
  expires_at: {
    type: Date,
    index: true
  },
  notification_methods: [{
    type: String,
    enum: ['email', 'sms', 'push', 'webhook', 'in_app'],
    default: 'in_app'
  }],
  webhook_url: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  metadata: {
    created_by: String,
    tags: [String],
    notes: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'automation'],
      default: 'web'
    }
  },
  trigger_history: [{
    triggered_at: {
      type: Date,
      default: Date.now
    },
    trigger_value: Number,
    threshold_value: Number,
    message: String,
    notification_sent: Boolean
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
alertSchema.index({ ticker_symbol: 1, is_active: 1 });
alertSchema.index({ user_id: 1, is_active: 1 });
alertSchema.index({ is_triggered: 1, triggered_at: -1 });
alertSchema.index({ priority: 1, is_active: 1 });
alertSchema.index({ alert_type: 1, is_active: 1 });
alertSchema.index({ expires_at: 1 });
alertSchema.index({ last_checked: 1 });

// Virtual for time until expiry
alertSchema.virtual('time_until_expiry').get(function() {
  if (!this.expires_at) return null;
  return Math.max(0, this.expires_at.getTime() - Date.now());
});

// Virtual for is_expired
alertSchema.virtual('is_expired').get(function() {
  if (!this.expires_at) return false;
  return this.expires_at < new Date();
});

// Virtual for can_trigger
alertSchema.virtual('can_trigger').get(function() {
  return this.is_active && 
         !this.is_expired && 
         this.trigger_count < this.max_triggers;
});

// Virtual for next_check_time
alertSchema.virtual('next_check_time').get(function() {
  const intervals = {
    '1m': 1 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000
  };
  
  const interval = intervals[this.comparison_timeframe] || intervals['1d'];
  return new Date(this.last_checked.getTime() + interval);
});

// Pre-save middleware
alertSchema.pre('save', function(next) {
  // Auto-deactivate if expired
  if (this.is_expired) {
    this.is_active = false;
  }

  // Auto-deactivate if max triggers reached
  if (this.trigger_count >= this.max_triggers) {
    this.is_active = false;
  }

  // Generate default message if not provided
  if (!this.message) {
    this.message = `${this.ticker_symbol} ${this.condition} ${this.threshold_value}`;
  }

  next();
});

// Static methods
alertSchema.statics.findActiveAlerts = function() {
  return this.find({ 
    is_active: true,
    $or: [
      { expires_at: { $exists: false } },
      { expires_at: { $gte: new Date() } }
    ]
  });
};

alertSchema.statics.findTriggeredAlerts = function(limit = 50) {
  return this.find({ is_triggered: true })
    .sort({ triggered_at: -1 })
    .limit(limit);
};

alertSchema.statics.findByTicker = function(ticker) {
  return this.find({ 
    ticker_symbol: ticker.toUpperCase(),
    is_active: true 
  });
};

alertSchema.statics.findByPriority = function(priority) {
  return this.find({ 
    priority,
    is_active: true 
  });
};

alertSchema.statics.findExpiredAlerts = function() {
  return this.find({
    expires_at: { $lt: new Date() },
    is_active: true
  });
};

alertSchema.statics.findAlertsToCheck = function() {
  const now = new Date();
  return this.find({
    is_active: true,
    $or: [
      { last_checked: { $exists: false } },
      { last_checked: { $lt: now } }
    ],
    $or: [
      { expires_at: { $exists: false } },
      { expires_at: { $gte: now } }
    ]
  });
};

alertSchema.statics.cleanupExpiredAlerts = async function() {
  const result = await this.updateMany(
    { expires_at: { $lt: new Date() } },
    { is_active: false }
  );
  return result;
};

alertSchema.statics.getAlertStats = async function(userId = null) {
  const matchCriteria = userId ? { user_id: userId } : {};
  
  const pipeline = [
    { $match: matchCriteria },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: ['$is_active', 1, 0] } },
        triggered: { $sum: { $cond: ['$is_triggered', 1, 0] } },
        high_priority: { 
          $sum: { 
            $cond: [
              { $in: ['$priority', ['high', 'critical']] }, 
              1, 
              0
            ] 
          } 
        }
      }
    }
  ];

  const result = await this.aggregate(pipeline);
  return result[0] || { total: 0, active: 0, triggered: 0, high_priority: 0 };
};

// Instance methods
alertSchema.methods.trigger = function(currentValue, additionalData = {}) {
  if (!this.can_trigger) {
    return Promise.resolve(false);
  }

  this.is_triggered = true;
  this.triggered_at = new Date();
  this.current_value = currentValue;
  this.trigger_count += 1;

  // Add to trigger history
  this.trigger_history.push({
    triggered_at: new Date(),
    trigger_value: currentValue,
    threshold_value: this.threshold_value,
    message: this.message,
    notification_sent: false,
    ...additionalData
  });

  // Deactivate if max triggers reached
  if (this.trigger_count >= this.max_triggers) {
    this.is_active = false;
  }

  return this.save();
};

alertSchema.methods.updateLastChecked = function() {
  this.last_checked = new Date();
  return this.save();
};

alertSchema.methods.snooze = function(minutes = 60) {
  this.last_checked = new Date(Date.now() + (minutes * 60 * 1000));
  return this.save();
};

alertSchema.methods.reset = function() {
  this.is_triggered = false;
  this.triggered_at = null;
  this.trigger_count = 0;
  this.trigger_history = [];
  this.is_active = true;
  return this.save();
};

alertSchema.methods.checkCondition = function(currentValue) {
  switch (this.condition) {
    case 'above':
      return currentValue > this.threshold_value;
    case 'below':
      return currentValue < this.threshold_value;
    case 'equals':
      return Math.abs(currentValue - this.threshold_value) < 0.01;
    case 'crosses_above':
      return this.current_value <= this.threshold_value && currentValue > this.threshold_value;
    case 'crosses_below':
      return this.current_value >= this.threshold_value && currentValue < this.threshold_value;
    case 'change_by':
      const changePercent = ((currentValue - this.current_value) / this.current_value) * 100;
      return Math.abs(changePercent) >= Math.abs(this.threshold_value);
    default:
      return false;
  }
};

module.exports = mongoose.model('Alert', alertSchema);