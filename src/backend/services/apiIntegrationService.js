const logger = require('../utils/logger');
const axios = require('axios');

/**
 * API Integration Service
 * Handles connections to external APIs: IEX Cloud, CoinGecko, NewsAPI
 */
class APIIntegrationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = {
      stocks: 300000,      // 5 minutes
      crypto: 180000,      // 3 minutes
      news: 600000,        // 10 minutes
      historical: 3600000  // 1 hour
    };

    // API configurations
    this.config = {
      iexCloud: {
        baseURL: 'https://cloud.iexapis.com/stable',
        token: process.env.IEX_CLOUD_TOKEN || 'demo',  // Use demo for testing
        enabled: process.env.IEX_CLOUD_ENABLED === 'true'
      },
      coinGecko: {
        baseURL: 'https://api.coingecko.com/api/v3',
        apiKey: process.env.COINGECKO_API_KEY || '',
        enabled: process.env.COINGECKO_ENABLED === 'true'
      },
      newsAPI: {
        baseURL: 'https://newsapi.org/v2',
        apiKey: process.env.NEWS_API_KEY || '',
        enabled: process.env.NEWS_API_ENABLED === 'true'
      },
      alphaVantage: {
        baseURL: 'https://www.alphavantage.co/query',
        apiKey: process.env.ALPHA_VANTAGE_KEY || '',
        enabled: process.env.ALPHA_VANTAGE_ENABLED === 'true'
      }
    };
  }

  /**
   * Fetch stock data from IEX Cloud
   */
  async fetchStockData(symbols, includeHistorical = false) {
    const cacheKey = `stocks_${symbols.join(',')}_${includeHistorical}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.stocks) {
        return cached.data;
      }
    }

    try {
      const stockData = [];

      // Try Alpha Vantage first (since we have the API key)
      if (this.config.alphaVantage.enabled && this.config.alphaVantage.apiKey) {
        try {
          // Use Alpha Vantage for stock data
          for (const symbol of symbols.slice(0, 5)) { // Limit to 5 to avoid rate limits
            try {
              const response = await axios.get(this.config.alphaVantage.baseURL, {
                params: {
                  function: 'GLOBAL_QUOTE',
                  symbol: symbol,
                  apikey: this.config.alphaVantage.apiKey
                }
              });

              const quote = response.data['Global Quote'];
              if (quote && quote['01. symbol']) {
                stockData.push({
                  symbol: quote['01. symbol'],
                  name: `${quote['01. symbol']} Corp`,
                  current_price: parseFloat(quote['05. price']),
                  price_change: parseFloat(quote['09. change']),
                  price_change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
                  volume: parseInt(quote['06. volume']),
                  market_cap: null, // Alpha Vantage doesn't provide market cap in GLOBAL_QUOTE
                  sector: 'Unknown',
                  market: 'us_stock',
                  last_updated: new Date(quote['07. latest trading day']),
                  source: 'alpha_vantage'
                });
              }
              
              // Small delay to respect API rate limits
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
              logger.warn(`Failed to fetch Alpha Vantage data for ${symbol}:`, error.message);
            }
          }
          
          logger.info('Fetched stock data from Alpha Vantage', { count: stockData.length });
        } catch (error) {
          logger.warn('Alpha Vantage API error:', error.message);
        }
      }
      
      // Fallback to IEX Cloud if needed and available
      if (stockData.length === 0 && this.config.iexCloud.enabled && this.config.iexCloud.token !== 'demo') {
        // Use real IEX Cloud API as fallback
        for (const symbol of symbols) {
          try {
            const response = await axios.get(`${this.config.iexCloud.baseURL}/stock/${symbol}/quote`, {
              params: { token: this.config.iexCloud.token }
            });

            const data = response.data;
            stockData.push({
              symbol: data.symbol,
              name: data.companyName,
              current_price: data.latestPrice,
              price_change: data.change,
              price_change_percent: data.changePercent * 100,
              volume: data.volume,
              market_cap: data.marketCap,
              sector: data.sector || 'Unknown',
              market: 'us_stock',
              last_updated: new Date(data.latestUpdate),
              source: 'iex_cloud'
            });

            // Fetch historical data if requested
            if (includeHistorical) {
              const historicalResponse = await axios.get(`${this.config.iexCloud.baseURL}/stock/${symbol}/chart/1m`, {
                params: { token: this.config.iexCloud.token }
              });
              stockData[stockData.length - 1].historical = historicalResponse.data;
            }
          } catch (error) {
            logger.warn(`Failed to fetch IEX data for ${symbol}:`, error.message);
          }
        }
      }
      
      // If no real data was fetched, use mock data
      if (stockData.length === 0) {
        // Use mock data when API is not available
        stockData.push(...this.generateMockStockData(symbols));
        logger.info('Using mock stock data - IEX Cloud not configured');
      }

      // Cache the result
      this.cache.set(cacheKey, { data: stockData, timestamp: Date.now() });
      
      logger.info(`Fetched stock data for ${symbols.length} symbols`, { 
        source: this.config.iexCloud.enabled ? 'iex_cloud' : 'mock',
        count: stockData.length 
      });

      return stockData;

    } catch (error) {
      logger.error('Error fetching stock data:', error);
      return this.generateMockStockData(symbols); // Fallback to mock data
    }
  }

  /**
   * Fetch cryptocurrency data from CoinGecko
   */
  async fetchCryptoData(coinIds = ['bitcoin', 'ethereum', 'cardano']) {
    const cacheKey = `crypto_${coinIds.join(',')}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.crypto) {
        return cached.data;
      }
    }

    try {
      let cryptoData = [];

      if (this.config.coinGecko.enabled) {
        // Use real CoinGecko API with API key
        const headers = {};
        if (this.config.coinGecko.apiKey) {
          headers['x-cg-demo-api-key'] = this.config.coinGecko.apiKey;
        }
        
        const response = await axios.get(`${this.config.coinGecko.baseURL}/simple/price`, {
          headers,
          params: {
            ids: coinIds.join(','),
            vs_currencies: 'usd',
            include_24hr_change: true,
            include_24hr_vol: true,
            include_market_cap: true
          }
        });

        const data = response.data;
        cryptoData = Object.entries(data).map(([coinId, priceData]) => ({
          symbol: `${coinId.toUpperCase()}-USD`,
          name: this.getCoinName(coinId),
          current_price: priceData.usd,
          price_change_percent: priceData.usd_24h_change || 0,
          volume: priceData.usd_24h_vol || 0,
          market_cap: priceData.usd_market_cap || 0,
          sector: 'Cryptocurrency',
          market: 'crypto',
          last_updated: new Date(),
          source: 'coingecko'
        }));
      } else {
        // Use mock crypto data
        cryptoData = this.generateMockCryptoData(coinIds);
        logger.info('Using mock crypto data - CoinGecko disabled');
      }

      // Cache the result
      this.cache.set(cacheKey, { data: cryptoData, timestamp: Date.now() });
      
      logger.info(`Fetched crypto data for ${coinIds.length} coins`, { 
        source: this.config.coinGecko.enabled ? 'coingecko' : 'mock',
        count: cryptoData.length 
      });

      return cryptoData;

    } catch (error) {
      logger.error('Error fetching crypto data:', error);
      return this.generateMockCryptoData(coinIds); // Fallback to mock data
    }
  }

  /**
   * Fetch news data from NewsAPI
   */
  async fetchNewsData(query = 'stock market', language = 'en', pageSize = 20) {
    const cacheKey = `news_${query}_${language}_${pageSize}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.news) {
        return cached.data;
      }
    }

    try {
      let newsData = [];

      if (this.config.newsAPI.enabled && this.config.newsAPI.apiKey) {
        // Use real NewsAPI
        const response = await axios.get(`${this.config.newsAPI.baseURL}/everything`, {
          params: {
            q: query,
            language: language,
            sortBy: 'publishedAt',
            pageSize: pageSize,
            apiKey: this.config.newsAPI.apiKey
          }
        });

        newsData = response.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          source: { name: article.source.name },
          publishedAt: article.publishedAt,
          urlToImage: article.urlToImage
        }));
      } else {
        // Use mock news data
        newsData = this.generateMockNewsData(query);
        logger.info('Using mock news data - NewsAPI not configured');
      }

      // Cache the result
      this.cache.set(cacheKey, { data: newsData, timestamp: Date.now() });
      
      logger.info(`Fetched ${newsData.length} news articles`, { 
        query,
        source: this.config.newsAPI.enabled ? 'newsapi' : 'mock'
      });

      return newsData;

    } catch (error) {
      logger.error('Error fetching news data:', error);
      return this.generateMockNewsData(query); // Fallback to mock data
    }
  }

  /**
   * Fetch comprehensive market data
   */
  async fetchComprehensiveMarketData(options = {}) {
    const {
      stockSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'],
      cryptoCoins = ['bitcoin', 'ethereum', 'cardano'],
      newsQuery = 'stock market finance',
      includeHistorical = false
    } = options;

    try {
      logger.info('Fetching comprehensive market data', { 
        stocks: stockSymbols.length, 
        crypto: cryptoCoins.length 
      });

      // Fetch all data concurrently
      const [stockData, cryptoData, newsData] = await Promise.all([
        this.fetchStockData(stockSymbols, includeHistorical),
        this.fetchCryptoData(cryptoCoins),
        this.fetchNewsData(newsQuery)
      ]);

      // Combine all ticker data
      const allTickers = [...stockData, ...cryptoData];

      // Add market indices if available
      const indices = await this.fetchMarketIndices();
      
      return {
        tickers: allTickers,
        news: newsData,
        indices: indices,
        metadata: {
          total_tickers: allTickers.length,
          stock_count: stockData.length,
          crypto_count: cryptoData.length,
          news_count: newsData.length,
          last_updated: new Date().toISOString(),
          data_sources: this.getActiveSources()
        }
      };

    } catch (error) {
      logger.error('Error fetching comprehensive market data:', error);
      throw error;
    }
  }

  /**
   * Fetch market indices data
   */
  async fetchMarketIndices() {
    try {
      const indices = {};

      if (this.config.iexCloud.enabled && this.config.iexCloud.token !== 'demo') {
        // Fetch major indices from IEX Cloud
        const symbols = ['SPY', 'QQQ', 'DIA']; // ETFs that track major indices
        
        for (const symbol of symbols) {
          try {
            const response = await axios.get(`${this.config.iexCloud.baseURL}/stock/${symbol}/quote`, {
              params: { token: this.config.iexCloud.token }
            });

            const data = response.data;
            indices[symbol] = {
              value: data.latestPrice,
              change: data.change,
              changePercent: data.changePercent * 100
            };
          } catch (error) {
            logger.warn(`Failed to fetch index data for ${symbol}:`, error.message);
          }
        }
      } else {
        // Mock indices data
        indices.SPY = { value: 420.50, change: 2.15, changePercent: 0.51 };
        indices.QQQ = { value: 350.25, change: -1.22, changePercent: -0.35 };
        indices.DIA = { value: 340.80, change: 1.85, changePercent: 0.55 };
      }

      return indices;

    } catch (error) {
      logger.error('Error fetching market indices:', error);
      return {};
    }
  }

  /**
   * Get historical data for technical analysis
   */
  async fetchHistoricalData(symbol, period = '1y', market = 'stock') {
    const cacheKey = `historical_${symbol}_${period}_${market}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout.historical) {
        return cached.data;
      }
    }

    try {
      let historicalData = [];

      if (market === 'stock' && this.config.iexCloud.enabled && this.config.iexCloud.token !== 'demo') {
        // Fetch from IEX Cloud
        const range = period === '1y' ? '1y' : period === '6m' ? '6m' : '3m';
        const response = await axios.get(`${this.config.iexCloud.baseURL}/stock/${symbol}/chart/${range}`, {
          params: { token: this.config.iexCloud.token }
        });

        historicalData = response.data.map(day => ({
          date: day.date,
          price: day.close,
          high: day.high,
          low: day.low,
          volume: day.volume
        }));
      } else if (market === 'crypto' && this.config.coinGecko.enabled) {
        // Fetch crypto historical from CoinGecko
        const coinId = this.getCoinId(symbol);
        const days = period === '1y' ? 365 : period === '6m' ? 180 : 90;
        
        const response = await axios.get(`${this.config.coinGecko.baseURL}/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days: days,
            interval: 'daily'
          }
        });

        historicalData = response.data.prices.map((price, index) => ({
          date: new Date(price[0]).toISOString().split('T')[0],
          price: price[1],
          volume: response.data.total_volumes[index] ? response.data.total_volumes[index][1] : 0
        }));
      } else {
        // Generate mock historical data
        historicalData = this.generateMockHistoricalData(symbol, period);
      }

      // Cache the result
      this.cache.set(cacheKey, { data: historicalData, timestamp: Date.now() });
      
      return historicalData;

    } catch (error) {
      logger.error(`Error fetching historical data for ${symbol}:`, error);
      return this.generateMockHistoricalData(symbol, period);
    }
  }

  // Helper methods

  generateMockStockData(symbols) {
    return symbols.map(symbol => ({
      symbol,
      name: `${symbol} Corporation`,
      current_price: 100 + Math.random() * 200,
      price_change: (Math.random() - 0.5) * 10,
      price_change_percent: (Math.random() - 0.5) * 10,
      volume: Math.floor(Math.random() * 50000000 + 10000000),
      market_cap: Math.floor(Math.random() * 1000000000000),
      sector: ['Technology', 'Healthcare', 'Financial', 'Energy'][Math.floor(Math.random() * 4)],
      market: 'us_stock',
      last_updated: new Date(),
      source: 'mock'
    }));
  }

  generateMockCryptoData(coinIds) {
    const coinNames = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum', 
      'cardano': 'Cardano',
      'polkadot': 'Polkadot',
      'chainlink': 'Chainlink'
    };

    return coinIds.map(coinId => ({
      symbol: `${coinId.toUpperCase()}-USD`,
      name: coinNames[coinId] || coinId,
      current_price: Math.random() * 50000 + 100,
      price_change_percent: (Math.random() - 0.5) * 20,
      volume: Math.floor(Math.random() * 10000000000),
      market_cap: Math.floor(Math.random() * 500000000000),
      sector: 'Cryptocurrency',
      market: 'crypto',
      last_updated: new Date(),
      source: 'mock'
    }));
  }

  generateMockNewsData(query) {
    const mockTitles = [
      'Stock market shows strong momentum amid economic recovery',
      'Technology sector leads market gains for third consecutive week',
      'Federal Reserve signals potential policy changes',
      'Cryptocurrency market faces regulatory uncertainty',
      'Energy stocks surge on supply concerns',
      'Healthcare innovation drives sector performance',
      'Market volatility expected to continue',
      'Investors focus on earnings season results'
    ];

    return mockTitles.map((title, index) => ({
      title,
      description: `${title.toLowerCase()}. Market analysis and expert commentary on recent developments.`,
      content: `Detailed analysis of ${query} trends and market implications...`,
      url: `https://example.com/news/${index + 1}`,
      source: { name: 'Mock Financial News' },
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      urlToImage: null
    }));
  }

  generateMockHistoricalData(symbol, period) {
    const days = period === '1y' ? 365 : period === '6m' ? 180 : 90;
    const basePrice = 100 + Math.random() * 100;
    const data = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      const price = basePrice * (1 + change * i * 0.001);

      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(price, 10),
        volume: Math.floor(Math.random() * 10000000 + 1000000)
      });
    }

    return data;
  }

  getCoinName(coinId) {
    const names = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'cardano': 'Cardano',
      'polkadot': 'Polkadot',
      'chainlink': 'Chainlink'
    };
    return names[coinId] || coinId.charAt(0).toUpperCase() + coinId.slice(1);
  }

  getCoinId(symbol) {
    const ids = {
      'BTC-USD': 'bitcoin',
      'ETH-USD': 'ethereum',
      'ADA-USD': 'cardano',
      'DOT-USD': 'polkadot',
      'LINK-USD': 'chainlink'
    };
    return ids[symbol] || 'bitcoin';
  }

  getActiveSources() {
    const sources = [];
    if (this.config.iexCloud.enabled) sources.push('IEX Cloud');
    if (this.config.coinGecko.enabled) sources.push('CoinGecko');
    if (this.config.newsAPI.enabled) sources.push('NewsAPI');
    if (sources.length === 0) sources.push('Mock Data');
    return sources;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('API cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

module.exports = APIIntegrationService;