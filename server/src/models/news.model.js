import mongoose from 'mongoose';

const NewsArticleSchema = new mongoose.Schema({
  ticker: { type: String, required: true, index: true },   // e.g. AAPL, TSLA
  source: { type: String, required: true },                // e.g. Reuters, Bloomberg
  title: { type: String, required: true },
  url: { type: String, required: true, unique: true },     // Prevent duplicate articles
  publishedAt: { type: Date, required: true, index: true },
  sentimentScore: { type: Number, default: 0 },            // Range could be -1 to +1
  sentimentLabel: { 
    type: String, 
    enum: ['positive', 'neutral', 'negative'], 
    default: 'neutral' 
  },
  summary: { type: String },                               // AI-generated summary
  raw: { type: mongoose.Schema.Types.Mixed },              // Store full raw JSON response
}, {
  timestamps: true,     // auto adds createdAt, updatedAt
  versionKey: false,    // disables __v field
});

// Compound index for querying latest news per ticker
NewsArticleSchema.index({ ticker: 1, publishedAt: -1 });

export default mongoose.model('NewsArticle', NewsArticleSchema);
