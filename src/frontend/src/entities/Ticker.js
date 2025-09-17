const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Ticker entity model
class Ticker {
  constructor(data = {}) {
    this.id = data.id;
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
    try {
      const response = await fetch(`${API_BASE_URL}/tickers?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tickers');
      }
      const result = await response.json();
      return result.data.map(ticker => new Ticker(ticker));
    } catch (error) {
      console.warn('Failed to fetch from API, using empty array:', error);
      return [];
    }
  }

  static async create(tickerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/tickers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tickerData)
      });
      if (!response.ok) {
        throw new Error('Failed to create ticker');
      }
      const result = await response.json();
      return new Ticker(result.data);
    } catch (error) {
      console.error('Failed to create ticker:', error);
      throw error;
    }
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