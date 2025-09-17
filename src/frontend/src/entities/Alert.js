// Alert entity model
class Alert {
  constructor(data = {}) {
    this.ticker_symbol = data.ticker_symbol || '';
    this.alert_type = data.alert_type || 'price_target';
    this.condition = data.condition || '';
    this.target_value = data.target_value || 0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.triggered_at = data.triggered_at || null;
    this.message = data.message || '';
    this.priority = data.priority || 'medium';
    this.created_date = data.created_date || new Date().toISOString();
  }

  static async list(orderBy = '-created_date', limit = 10) {
    // Mock data for development
    const mockAlerts = [
      new Alert({
        ticker_symbol: 'AAPL',
        alert_type: 'price_target',
        condition: 'price above 180',
        target_value: 180,
        is_active: true,
        message: 'AAPL price alert: Target $180 reached',
        priority: 'high',
        created_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      }),
      new Alert({
        ticker_symbol: 'TSLA',
        alert_type: 'price_change',
        condition: 'price change > 5%',
        target_value: 5,
        is_active: true,
        triggered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        message: 'TSLA significant price movement detected',
        priority: 'medium',
        created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      }),
      new Alert({
        ticker_symbol: 'BTC',
        alert_type: 'volume_spike',
        condition: 'volume > 30B',
        target_value: 30000000000,
        is_active: true,
        triggered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        message: 'BTC volume spike detected',
        priority: 'high',
        created_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      }),
      new Alert({
        ticker_symbol: 'RELIANCE.NS',
        alert_type: 'news_sentiment',
        condition: 'sentiment positive',
        target_value: 0.5,
        is_active: true,
        message: 'RELIANCE.NS positive news sentiment alert',
        priority: 'low',
        created_date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      }),
      new Alert({
        ticker_symbol: 'EUR/USD',
        alert_type: 'technical_indicator',
        condition: 'RSI oversold',
        target_value: 30,
        is_active: false,
        triggered_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        message: 'EUR/USD technical indicator triggered',
        priority: 'medium',
        created_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
      })
    ];

    return mockAlerts.slice(0, limit);
  }

  static async filter(filters, orderBy = '-created_date', limit = 10) {
    const allAlerts = await this.list(orderBy, 100);
    let filtered = allAlerts;

    if (filters.ticker_symbol) {
      filtered = filtered.filter(a => a.ticker_symbol === filters.ticker_symbol);
    }

    if (filters.is_active !== undefined) {
      filtered = filtered.filter(a => a.is_active === filters.is_active);
    }

    if (filters.alert_type) {
      filtered = filtered.filter(a => a.alert_type === filters.alert_type);
    }

    if (filters.priority) {
      filtered = filtered.filter(a => a.priority === filters.priority);
    }

    return filtered.slice(0, limit);
  }

  static async create(alertData) {
    return new Alert(alertData);
  }

  static async update(alertId, updateData) {
    // Mock update functionality
    return new Alert({ ...updateData });
  }

  static async delete(alertId) {
    // Mock delete functionality
    return { success: true, message: `Alert deleted` };
  }

  async trigger() {
    this.triggered_at = new Date().toISOString();
    this.is_active = false;
    return this;
  }

  async activate() {
    this.is_active = true;
    this.triggered_at = null;
    return this;
  }

  async save() {
    // Mock save functionality
    return this;
  }
}

export { Alert };