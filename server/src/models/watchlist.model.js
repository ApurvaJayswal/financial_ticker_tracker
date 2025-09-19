import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema({
  userId: { type: String },
  name: { type: String, required: true },
  tickers: { type: [String], default: [] },
}, {
  timestamps: true,
  versionKey: false,
});

WatchlistSchema.index(
  { userId: 1, name: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' } } }
);

export default mongoose.model('Watchlist', WatchlistSchema);
