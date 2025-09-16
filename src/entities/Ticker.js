// Ticker entity model
class Ticker {
  constructor(data = {}) {
    this.symbol = data.symbol || '';
    this.name = data.name || '';
    this.market = data.market || 'us_stock';
    this.current_price = data.current_price || 0;
    this.price_change = data.price_change || 0;
    this.price_change_percent = data.price_change_percent || 0;
    this.volume = data.volume || 0;
    this.market_cap = data.market_cap || 0;
    this.sector = data.sector || '';
    this.last_updated = data.last_updated || new Date().toISOString();
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.sentiment_score = data.sentiment_score || 0;
    this.news_count = data.news_count || 0;
  }

  static async list(orderBy = '-last_updated', limit = 50) {
    // Mock data for development
    const mockTickers = [
      new Ticker({
        symbol: 'AAPL',
        name: 'Apple Inc.',
        market: 'us_stock',
        current_price: 175.43,
        price_change: 2.15,
        price_change_percent: 1.24,
        volume: 45623000,
        market_cap: 2800000000000,
        sector: 'Technology',
        sentiment_score: 0.65,
        news_count: 12
      }),
      new Ticker({
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        market: 'us_stock',
        current_price: 242.68,
        price_change: -5.32,
        price_change_percent: -2.15,
        volume: 89542000,
        market_cap: 770000000000,
        sector: 'Automotive',
        sentiment_score: 0.15,
        news_count: 8
      }),
      new Ticker({
        symbol: 'RELIANCE.NS',
        name: 'Reliance Industries Ltd',
        market: 'indian_stock',
        current_price: 2456.75,
        price_change: 18.50,
        price_change_percent: 0.76,
        volume: 1245000,
        market_cap: 16600000000000,
        sector: 'Energy',
        sentiment_score: 0.45,
        news_count: 5
      }),
      new Ticker({
        symbol: 'BTC',
        name: 'Bitcoin',
        market: 'crypto',
        current_price: 43250.75,
        price_change: 1250.25,
        price_change_percent: 2.98,
        volume: 28500000000,
        market_cap: 845000000000,
        sector: 'Cryptocurrency',
        sentiment_score: 0.72,
        news_count: 15
      }),
      new Ticker({
        symbol: 'EUR/USD',
        name: 'Euro to US Dollar',
        market: 'forex',
        current_price: 1.0875,
        price_change: -0.0025,
        price_change_percent: -0.23,
        volume: 0,
        market_cap: 0,
        sector: 'Currency',
        sentiment_score: -0.15,
        news_count: 3
      })
    ];

    return mockTickers.slice(0, limit);
  }

  static async create(tickerData) {
    return new Ticker(tickerData);
  }

  static async update(symbol, updateData) {
    // Mock update functionality
    return new Ticker({ symbol, ...updateData });
  }

  static async delete(symbol) {
    // Mock delete functionality
    return { success: true, message: `Ticker ${symbol} deleted` };
  }

  static async filter(filters, orderBy = '-last_updated', limit = 50) {
    const allTickers = await this.list(orderBy, 100);
    let filtered = allTickers;

    if (filters.market) {
      filtered = filtered.filter(t => t.market === filters.market);
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(t => t.is_active === filters.is_active);
    }

    if (filters.sector) {
      filtered = filtered.filter(t => t.sector.toLowerCase().includes(filters.sector.toLowerCase()));
    }

    return filtered.slice(0, limit);
  }

  async save() {
    // Mock save functionality
    this.last_updated = new Date().toISOString();
    return this;
  }
}

export { Ticker };