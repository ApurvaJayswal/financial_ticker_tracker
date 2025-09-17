// NewsItem entity model
class NewsItem {
  constructor(data = {}) {
    this.ticker_symbol = data.ticker_symbol || '';
    this.headline = data.headline || '';
    this.summary = data.summary || '';
    this.source = data.source || '';
    this.url = data.url || '';
    this.published_at = data.published_at || new Date().toISOString();
    this.sentiment = data.sentiment || 'neutral';
    this.sentiment_score = data.sentiment_score || 0;
    this.impact_level = data.impact_level || 'low';
    this.keywords = data.keywords || [];
  }

  static async list(orderBy = '-published_at', limit = 20) {
    // Mock data for development
    const mockNews = [
      new NewsItem({
        ticker_symbol: 'AAPL',
        headline: 'Apple Announces Revolutionary AI Features for iPhone 16',
        summary: 'Apple unveiled groundbreaking AI capabilities that could reshape smartphone interaction and boost market confidence.',
        source: 'Reuters',
        url: 'https://reuters.com/apple-ai-announcement',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        sentiment: 'positive',
        sentiment_score: 0.8,
        impact_level: 'high',
        keywords: ['AI', 'iPhone', 'innovation', 'technology']
      }),
      new NewsItem({
        ticker_symbol: 'TSLA',
        headline: 'Tesla Production Faces Challenges in Q4',
        summary: 'Manufacturing delays and supply chain issues may impact Tesla\'s fourth-quarter delivery targets.',
        source: 'Bloomberg',
        url: 'https://bloomberg.com/tesla-production-challenges',
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        sentiment: 'negative',
        sentiment_score: -0.6,
        impact_level: 'medium',
        keywords: ['production', 'supply chain', 'delivery', 'manufacturing']
      }),
      new NewsItem({
        ticker_symbol: 'BTC',
        headline: 'Bitcoin ETF Sees Record Inflows This Week',
        summary: 'Institutional investors continue to pour money into Bitcoin ETFs, signaling growing mainstream adoption.',
        source: 'CoinDesk',
        url: 'https://coindesk.com/bitcoin-etf-inflows',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        sentiment: 'positive',
        sentiment_score: 0.7,
        impact_level: 'high',
        keywords: ['ETF', 'institutional', 'adoption', 'investment']
      }),
      new NewsItem({
        ticker_symbol: 'RELIANCE.NS',
        headline: 'Reliance Industries Expands Green Energy Portfolio',
        summary: 'The Indian conglomerate announced a $10 billion investment in renewable energy infrastructure over the next five years.',
        source: 'Economic Times',
        url: 'https://economictimes.com/reliance-green-energy',
        published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        sentiment: 'positive',
        sentiment_score: 0.6,
        impact_level: 'medium',
        keywords: ['green energy', 'renewable', 'investment', 'expansion']
      }),
      new NewsItem({
        ticker_symbol: 'EUR/USD',
        headline: 'ECB Signals Potential Rate Changes Amid Economic Uncertainty',
        summary: 'European Central Bank hints at monetary policy adjustments as eurozone faces mixed economic signals.',
        source: 'Financial Times',
        url: 'https://ft.com/ecb-rate-signals',
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        sentiment: 'neutral',
        sentiment_score: -0.1,
        impact_level: 'medium',
        keywords: ['ECB', 'interest rates', 'monetary policy', 'eurozone']
      })
    ];

    return mockNews.slice(0, limit);
  }

  static async filter(filters, orderBy = '-published_at', limit = 20) {
    const allNews = await this.list(orderBy, 100);
    let filtered = allNews;

    if (filters.ticker_symbol) {
      filtered = filtered.filter(n => n.ticker_symbol === filters.ticker_symbol);
    }

    if (filters.sentiment) {
      filtered = filtered.filter(n => n.sentiment === filters.sentiment);
    }

    if (filters.impact_level) {
      filtered = filtered.filter(n => n.impact_level === filters.impact_level);
    }

    if (filters.source) {
      filtered = filtered.filter(n => n.source.toLowerCase().includes(filters.source.toLowerCase()));
    }

    return filtered.slice(0, limit);
  }

  static async create(newsData) {
    return new NewsItem(newsData);
  }

  async save() {
    // Mock save functionality
    return this;
  }
}

export { NewsItem };