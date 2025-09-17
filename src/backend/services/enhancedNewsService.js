const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Enhanced News Service
 * Handles news with trusted sources and validates read links
 */
class EnhancedNewsService {
  constructor() {
    this.config = {
      newsAPI: {
        baseURL: 'https://newsapi.org/v2',
        apiKey: process.env.NEWS_API_KEY || '',
        enabled: process.env.NEWS_API_ENABLED === 'true'
      },
      trustedSourcesOnly: process.env.NEWS_TRUSTED_SOURCES_ONLY === 'true',
      enableReadLinks: process.env.NEWS_ENABLE_READ_LINKS === 'true',
      linkValidation: process.env.NEWS_LINK_VALIDATION === 'true'
    };

    // Trusted financial news sources
    this.trustedSources = [
      // Major Financial Publications
      'Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal', 'MarketWatch',
      'Yahoo Finance', 'CNBC', 'Forbes', 'Business Insider', 'The Motley Fool',
      
      // News Agencies
      'Associated Press', 'Reuters.com', 'Bloomberg.com', 'AP News',
      
      // Specialized Financial Media
      'Seeking Alpha', 'Zacks Investment Research', 'Investor\'s Business Daily',
      'TheStreet', 'Barron\'s', 'Economic Times', 'CoinDesk', 'CoinTelegraph',
      
      // Technology & Market Analysis
      'TechCrunch', 'Ars Technica', 'VentureBeat', 'Biztoc.com',
      
      // International Financial Media
      'Financial News London', 'Nikkei Asian Review', 'South China Morning Post'
    ];

    this.cache = new Map();
    this.cacheTimeout = 600000; // 10 minutes
  }

  /**
   * Fetch enhanced news with trusted sources and validated links
   */
  async fetchEnhancedNews(query = 'financial markets', options = {}) {
    const {
      language = 'en',
      pageSize = 20,
      sortBy = 'publishedAt',
      trustedOnly = this.config.trustedSourcesOnly
    } = options;

    const cacheKey = `news_${query}_${language}_${pageSize}_${trustedOnly}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      let newsArticles = [];

      if (this.config.newsAPI.enabled && this.config.newsAPI.apiKey) {
        // Fetch from NewsAPI
        const response = await axios.get(`${this.config.newsAPI.baseURL}/everything`, {
          params: {
            q: query,
            language: language,
            sortBy: sortBy,
            pageSize: Math.min(pageSize * 2, 100), // Fetch more to filter later
            apiKey: this.config.newsAPI.apiKey
          }
        });

        if (response.data && response.data.articles) {
          newsArticles = response.data.articles;
        }
      } else {
        // Use mock news data
        newsArticles = this.generateMockNews(query);
      }

      // Process and enhance articles
      let processedArticles = await this.processArticles(newsArticles, { trustedOnly });

      // Limit to requested page size
      processedArticles = processedArticles.slice(0, pageSize);

      // Cache the result
      this.cache.set(cacheKey, { data: processedArticles, timestamp: Date.now() });

      logger.info(`Fetched enhanced news`, {
        query,
        totalArticles: processedArticles.length,
        trustedSourcesOnly: trustedOnly,
        source: this.config.newsAPI.enabled ? 'newsapi' : 'mock'
      });

      return processedArticles;

    } catch (error) {
      logger.error('Error fetching enhanced news:', error);
      return this.generateMockNews(query).slice(0, pageSize);
    }
  }

  /**
   * Process articles with enhancements
   */
  async processArticles(articles, options = {}) {
    const { trustedOnly = false } = options;
    const processedArticles = [];

    for (const article of articles) {
      try {
        // Skip articles without essential data
        if (!article.title || !article.source?.name) continue;

        // Filter by trusted sources if enabled
        if (trustedOnly && !this.isTrustedSource(article.source.name)) {
          continue;
        }

        // Enhance the article
        const enhancedArticle = await this.enhanceArticle(article);
        
        if (enhancedArticle) {
          processedArticles.push(enhancedArticle);
        }
      } catch (error) {
        logger.warn('Error processing article:', error.message);
        continue;
      }
    }

    return processedArticles;
  }

  /**
   * Enhance individual article with additional metadata
   */
  async enhanceArticle(article) {
    const enhanced = {
      id: this.generateArticleId(article),
      title: article.title,
      description: article.description || '',
      content: article.content || '',
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      source: {
        id: article.source.id,
        name: article.source.name,
        trusted: this.isTrustedSource(article.source.name),
        category: this.getSourceCategory(article.source.name)
      },
      enhancement: {
        sentiment: this.analyzeSentiment(article.title, article.description),
        readability: this.assessReadability(article.title, article.description),
        relevance: this.calculateRelevance(article.title, article.description),
        linkStatus: null,
        summary: this.generateSummary(article.description || article.content)
      }
    };

    // Validate read link if enabled
    if (this.config.enableReadLinks && this.config.linkValidation) {
      enhanced.enhancement.linkStatus = await this.validateReadLink(article.url);
    } else {
      enhanced.enhancement.linkStatus = { valid: true, accessible: true };
    }

    return enhanced;
  }

  /**
   * Check if source is trusted
   */
  isTrustedSource(sourceName) {
    return this.trustedSources.some(trusted => 
      sourceName.toLowerCase().includes(trusted.toLowerCase()) ||
      trusted.toLowerCase().includes(sourceName.toLowerCase())
    );
  }

  /**
   * Get source category
   */
  getSourceCategory(sourceName) {
    const lowerName = sourceName.toLowerCase();
    
    if (lowerName.includes('bloomberg') || lowerName.includes('reuters') || lowerName.includes('financial times')) {
      return 'premium_financial';
    } else if (lowerName.includes('cnbc') || lowerName.includes('marketwatch') || lowerName.includes('yahoo finance')) {
      return 'mainstream_financial';
    } else if (lowerName.includes('coindesk') || lowerName.includes('cointelegraph')) {
      return 'cryptocurrency';
    } else if (lowerName.includes('techcrunch') || lowerName.includes('venturebeat')) {
      return 'technology';
    } else {
      return 'general';
    }
  }

  /**
   * Analyze article sentiment
   */
  analyzeSentiment(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    const positiveWords = ['growth', 'gains', 'rise', 'surge', 'bullish', 'positive', 'strong', 'beat', 'outperform', 'record'];
    const negativeWords = ['fall', 'drop', 'decline', 'bearish', 'negative', 'weak', 'miss', 'underperform', 'crash', 'loss'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) positiveScore++;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) negativeScore++;
    });
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  /**
   * Assess article readability
   */
  assessReadability(title, description) {
    const text = `${title} ${description}`;
    const wordCount = text.split(' ').length;
    const avgWordsPerSentence = wordCount / (text.split(/[.!?]+/).length || 1);
    
    if (avgWordsPerSentence < 15) return 'easy';
    if (avgWordsPerSentence < 25) return 'medium';
    return 'complex';
  }

  /**
   * Calculate relevance score
   */
  calculateRelevance(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    const financialKeywords = ['stock', 'market', 'trading', 'investment', 'finance', 'economic', 'earnings', 'revenue', 'crypto'];
    
    let relevanceScore = 0;
    financialKeywords.forEach(keyword => {
      if (text.includes(keyword)) relevanceScore++;
    });
    
    return Math.min(relevanceScore / financialKeywords.length * 100, 100);
  }

  /**
   * Generate article summary
   */
  generateSummary(text) {
    if (!text) return '';
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return '';
    
    // Return first sentence as summary
    return sentences[0].trim() + '.';
  }

  /**
   * Validate read link with enhanced checking
   */
  async validateReadLink(url) {
    if (!url) return { valid: false, accessible: false, error: 'No URL provided' };

    try {
      // Basic URL validation
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return { valid: false, accessible: false, error: 'Invalid protocol' };
      }

      // Check for suspicious or blocked domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'ow.ly', 'goo.gl'];
      if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
        return { valid: false, accessible: false, error: 'Suspicious domain detected' };
      }

      // Perform HEAD request with proper headers to mimic browser
      const response = await axios.head(url, {
        timeout: 8000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate'
        },
        validateStatus: (status) => status < 500 // Accept redirects and client errors
      });

      const isAccessible = response.status >= 200 && response.status < 400;
      
      return {
        valid: true,
        accessible: isAccessible,
        statusCode: response.status,
        contentType: response.headers['content-type'],
        finalUrl: response.request?.responseURL || url,
        redirected: response.request?.responseURL !== url,
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      // If HEAD fails, try GET with small range for some servers
      try {
        const response = await axios.get(url, {
          timeout: 5000,
          headers: {
            'Range': 'bytes=0-1024', // Only get first 1KB
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          maxRedirects: 3
        });
        
        return {
          valid: true,
          accessible: true,
          statusCode: response.status,
          contentType: response.headers['content-type'],
          method: 'GET_fallback',
          lastChecked: new Date().toISOString()
        };
      } catch (fallbackError) {
        return {
          valid: true, // URL format is valid
          accessible: false,
          error: error.code === 'ECONNABORTED' ? 'Timeout' : error.message,
          statusCode: error.response?.status || null,
          lastChecked: new Date().toISOString()
        };
      }
    }
  }

  /**
   * Generate unique article ID
   */
  generateArticleId(article) {
    const baseString = `${article.source.name}_${article.title}_${article.publishedAt}`;
    return Buffer.from(baseString).toString('base64').substring(0, 16);
  }

  /**
   * Get trusted sources list
   */
  getTrustedSources() {
    return this.trustedSources.map(source => ({
      name: source,
      category: this.getSourceCategory(source)
    }));
  }

  /**
   * Generate mock news data with proper structure
   */
  generateMockNews(query) {
    const mockArticles = [
      {
        title: 'Apple Announces Revolutionary AI Features for iPhone 16',
        description: 'Apple unveiled groundbreaking AI capabilities that could reshape smartphone interaction and boost market confidence.',
        content: 'Apple unveiled groundbreaking AI capabilities that could reshape smartphone interaction and boost market confidence.',
        url: 'https://www.reuters.com/technology/apple-ai-iphone-16-2025',
        urlToImage: null,
        publishedAt: new Date().toISOString(),
        source: { id: 'reuters', name: 'Reuters' }
      },
      {
        title: 'Bitcoin ETF Sees Record Inflows This Week',
        description: 'Institutional investors continue to pour money into Bitcoin ETFs, signaling growing mainstream adoption.',
        content: 'Institutional investors continue to pour money into Bitcoin ETFs, signaling growing mainstream adoption.',
        url: 'https://www.coindesk.com/bitcoin-etf-record-inflows-2025',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { id: 'coindesk', name: 'CoinDesk' }
      },
      {
        title: 'Reliance Industries Expands Green Energy Portfolio',
        description: 'The Indian conglomerate announced a $10 billion investment in renewable energy infrastructure over the next five years.',
        content: 'The Indian conglomerate announced a $10 billion investment in renewable energy infrastructure over the next five years.',
        url: 'https://www.economic-times.com/reliance-green-energy-2025',
        urlToImage: null,
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { id: 'economic-times', name: 'Economic Times' }
      }
    ];

    return mockArticles;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Enhanced news cache cleared');
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

module.exports = EnhancedNewsService;