const EnhancedNewsService = require('../services/enhancedNewsService');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize Enhanced News Service
const newsService = new EnhancedNewsService();

/**
 * Enhanced News Controller
 * Handles news with trusted sources and link validation
 */

// @desc    Get enhanced financial news
// @route   GET /api/news/enhanced
// @access  Public
const getEnhancedNews = catchAsync(async (req, res, next) => {
  const {
    query = 'financial markets',
    language = 'en',
    pageSize = 10,
    sortBy = 'publishedAt',
    trustedOnly = true,
    category = 'all'
  } = req.query;

  logger.api('Enhanced news request', { 
    query: query.substring(0, 50), 
    pageSize, 
    trustedOnly,
    category 
  });

  try {
    const articles = await newsService.fetchEnhancedNews(query, {
      language,
      pageSize: Math.min(parseInt(pageSize), 50), // Limit max page size
      sortBy,
      trustedOnly: trustedOnly === 'true'
    });

    // Filter by category if specified
    let filteredArticles = articles;
    if (category && category !== 'all') {
      filteredArticles = articles.filter(article => 
        article.source.category === category
      );
    }

    // Calculate statistics
    const stats = {
      totalArticles: filteredArticles.length,
      trustedSources: filteredArticles.filter(a => a.source.trusted).length,
      sentimentBreakdown: {
        positive: filteredArticles.filter(a => a.enhancement.sentiment === 'positive').length,
        negative: filteredArticles.filter(a => a.enhancement.sentiment === 'negative').length,
        neutral: filteredArticles.filter(a => a.enhancement.sentiment === 'neutral').length
      },
      avgRelevance: filteredArticles.reduce((sum, a) => sum + a.enhancement.relevance, 0) / filteredArticles.length || 0,
      accessibleLinks: filteredArticles.filter(a => a.enhancement.linkStatus?.accessible).length
    };

    res.status(200).json({
      success: true,
      data: {
        articles: filteredArticles,
        statistics: stats,
        metadata: {
          query,
          language,
          pageSize,
          trustedOnly,
          category,
          timestamp: new Date().toISOString()
        }
      },
      message: 'Enhanced news fetched successfully'
    });

  } catch (error) {
    logger.error('Error fetching enhanced news:', error);
    return next(new AppError('Failed to fetch enhanced news', 500));
  }
});

// @desc    Get news by specific ticker/symbol
// @route   GET /api/news/ticker/:symbol
// @access  Public
const getNewsByTicker = catchAsync(async (req, res, next) => {
  const { symbol } = req.params;
  const { pageSize = 5, trustedOnly = true } = req.query;

  if (!symbol) {
    return next(new AppError('Symbol is required', 400));
  }

  logger.api('Ticker-specific news request', { symbol, pageSize, trustedOnly });

  try {
    // Create ticker-specific query
    const query = `${symbol.toUpperCase()} stock market earnings finance`;

    const articles = await newsService.fetchEnhancedNews(query, {
      pageSize: Math.min(parseInt(pageSize), 20),
      trustedOnly: trustedOnly === 'true'
    });

    // Filter for ticker relevance
    const relevantArticles = articles.filter(article => {
      const text = `${article.title} ${article.description}`.toLowerCase();
      return text.includes(symbol.toLowerCase()) || article.enhancement.relevance > 50;
    });

    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        articles: relevantArticles,
        totalRelevant: relevantArticles.length,
        metadata: {
          searchQuery: query,
          timestamp: new Date().toISOString()
        }
      },
      message: `News for ${symbol.toUpperCase()} fetched successfully`
    });

  } catch (error) {
    logger.error(`Error fetching news for ticker ${symbol}:`, error);
    return next(new AppError(`Failed to fetch news for ${symbol}`, 500));
  }
});

// @desc    Validate a news article link
// @route   POST /api/news/validate-link
// @access  Public
const validateNewsLink = catchAsync(async (req, res, next) => {
  const { url } = req.body;

  if (!url) {
    return next(new AppError('URL is required', 400));
  }

  logger.api('Link validation request', { url: url.substring(0, 100) });

  try {
    const linkStatus = await newsService.validateReadLink(url);

    res.status(200).json({
      success: true,
      data: {
        url,
        validation: linkStatus,
        timestamp: new Date().toISOString()
      },
      message: 'Link validation completed'
    });

  } catch (error) {
    logger.error('Error validating news link:', error);
    return next(new AppError('Failed to validate link', 500));
  }
});

// @desc    Get trusted news sources
// @route   GET /api/news/trusted-sources
// @access  Public
const getTrustedSources = catchAsync(async (req, res, next) => {
  try {
    const trustedSources = newsService.getTrustedSources();
    
    // Group sources by category
    const sourcesByCategory = trustedSources.reduce((acc, source) => {
      if (!acc[source.category]) {
        acc[source.category] = [];
      }
      acc[source.category].push(source.name);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        trustedSources,
        sourcesByCategory,
        totalSources: trustedSources.length,
        categories: Object.keys(sourcesByCategory)
      },
      message: 'Trusted sources retrieved successfully'
    });

  } catch (error) {
    logger.error('Error retrieving trusted sources:', error);
    return next(new AppError('Failed to retrieve trusted sources', 500));
  }
});

// @desc    Get news statistics and analytics
// @route   GET /api/news/analytics
// @access  Public
const getNewsAnalytics = catchAsync(async (req, res, next) => {
  const { 
    query = 'financial markets', 
    timeRange = '24h',
    trustedOnly = true 
  } = req.query;

  logger.api('News analytics request', { query, timeRange, trustedOnly });

  try {
    // Fetch recent news for analysis
    const articles = await newsService.fetchEnhancedNews(query, {
      pageSize: 50,
      trustedOnly: trustedOnly === 'true'
    });

    // Calculate analytics
    const analytics = {
      overview: {
        totalArticles: articles.length,
        timeRange,
        query,
        lastUpdated: new Date().toISOString()
      },
      sentiment: {
        positive: articles.filter(a => a.enhancement.sentiment === 'positive').length,
        negative: articles.filter(a => a.enhancement.sentiment === 'negative').length,
        neutral: articles.filter(a => a.enhancement.sentiment === 'neutral').length
      },
      sources: {
        trusted: articles.filter(a => a.source.trusted).length,
        untrusted: articles.filter(a => !a.source.trusted).length,
        categories: {}
      },
      readability: {
        easy: articles.filter(a => a.enhancement.readability === 'easy').length,
        medium: articles.filter(a => a.enhancement.readability === 'medium').length,
        complex: articles.filter(a => a.enhancement.readability === 'complex').length
      },
      accessibility: {
        accessibleLinks: articles.filter(a => a.enhancement.linkStatus?.accessible).length,
        brokenLinks: articles.filter(a => a.enhancement.linkStatus?.accessible === false).length,
        uncheckedLinks: articles.filter(a => !a.enhancement.linkStatus).length
      },
      topSources: []
    };

    // Calculate source distribution
    const sourceCount = {};
    articles.forEach(article => {
      const category = article.source.category;
      if (!analytics.sources.categories[category]) {
        analytics.sources.categories[category] = 0;
      }
      analytics.sources.categories[category]++;

      const sourceName = article.source.name;
      sourceCount[sourceName] = (sourceCount[sourceName] || 0) + 1;
    });

    // Get top sources
    analytics.topSources = Object.entries(sourceCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([source, count]) => ({ source, count }));

    // Calculate trends
    analytics.trends = {
      avgRelevance: articles.reduce((sum, a) => sum + a.enhancement.relevance, 0) / articles.length || 0,
      sentimentScore: (analytics.sentiment.positive - analytics.sentiment.negative) / articles.length || 0,
      trustScore: analytics.sources.trusted / articles.length || 0
    };

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'News analytics generated successfully'
    });

  } catch (error) {
    logger.error('Error generating news analytics:', error);
    return next(new AppError('Failed to generate news analytics', 500));
  }
});

// @desc    Search news with advanced filters
// @route   POST /api/news/search
// @access  Public
const searchNews = catchAsync(async (req, res, next) => {
  const {
    query = 'financial markets',
    sentiment = 'all', // positive, negative, neutral, all
    sourceCategory = 'all',
    readability = 'all', // easy, medium, complex, all
    trustedOnly = true,
    pageSize = 10
  } = req.body;

  if (!query || query.trim().length === 0) {
    return next(new AppError('Search query is required', 400));
  }

  logger.api('Advanced news search', { 
    query: query.substring(0, 50), 
    sentiment, 
    sourceCategory, 
    readability,
    trustedOnly 
  });

  try {
    // Fetch news with base filters
    let articles = await newsService.fetchEnhancedNews(query, {
      pageSize: Math.min(parseInt(pageSize) * 2, 100), // Fetch more for filtering
      trustedOnly: trustedOnly === 'true' || trustedOnly === true
    });

    // Apply advanced filters
    if (sentiment !== 'all') {
      articles = articles.filter(a => a.enhancement.sentiment === sentiment);
    }

    if (sourceCategory !== 'all') {
      articles = articles.filter(a => a.source.category === sourceCategory);
    }

    if (readability !== 'all') {
      articles = articles.filter(a => a.enhancement.readability === readability);
    }

    // Limit to requested page size
    articles = articles.slice(0, parseInt(pageSize));

    // Calculate search metadata
    const searchMetadata = {
      query,
      filters: {
        sentiment: sentiment !== 'all' ? sentiment : null,
        sourceCategory: sourceCategory !== 'all' ? sourceCategory : null,
        readability: readability !== 'all' ? readability : null,
        trustedOnly
      },
      results: {
        total: articles.length,
        avgRelevance: articles.reduce((sum, a) => sum + a.enhancement.relevance, 0) / articles.length || 0
      },
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: {
        articles,
        metadata: searchMetadata
      },
      message: 'Advanced news search completed successfully'
    });

  } catch (error) {
    logger.error('Error in advanced news search:', error);
    return next(new AppError('Failed to perform advanced news search', 500));
  }
});

// @desc    Get news service status
// @route   GET /api/news/status
// @access  Public
const getNewsStatus = catchAsync(async (req, res, next) => {
  try {
    const cacheStats = newsService.getCacheStats();
    const trustedSources = newsService.getTrustedSources();

    const status = {
      service: 'operational',
      newsAPI: {
        enabled: newsService.config.newsAPI.enabled,
        hasApiKey: !!newsService.config.newsAPI.apiKey
      },
      features: {
        trustedSourcesOnly: newsService.config.trustedSourcesOnly,
        linkValidation: newsService.config.linkValidation,
        enhancedMetadata: true
      },
      cache: cacheStats,
      trustedSources: {
        total: trustedSources.length,
        categories: [...new Set(trustedSources.map(s => s.category))]
      },
      capabilities: [
        'Trusted source filtering',
        'Link validation',
        'Sentiment analysis',
        'Readability assessment',
        'Relevance scoring',
        'Source categorization',
        'Advanced search filters'
      ],
      lastUpdated: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      data: status,
      message: 'News service status retrieved successfully'
    });

  } catch (error) {
    logger.error('Error retrieving news status:', error);
    return next(new AppError('Failed to retrieve news status', 500));
  }
});

module.exports = {
  getEnhancedNews,
  getNewsByTicker,
  validateNewsLink,
  getTrustedSources,
  getNewsAnalytics,
  searchNews,
  getNewsStatus
};