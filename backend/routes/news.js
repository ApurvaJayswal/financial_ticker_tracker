const express = require('express');
const router = express.Router();

// Mock news data
let newsItems = [
  {
    id: 1,
    ticker_symbol: 'AAPL',
    headline: 'Apple Announces Revolutionary AI Features for iPhone 16',
    summary: 'Apple unveiled groundbreaking AI capabilities that could reshape smartphone interaction and boost market confidence.',
    source: 'Reuters',
    url: 'https://reuters.com/apple-ai-announcement',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentiment_score: 0.8,
    impact_level: 'high',
    keywords: ['AI', 'iPhone', 'innovation', 'technology'],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    ticker_symbol: 'TSLA',
    headline: 'Tesla Production Faces Challenges in Q4',
    summary: 'Manufacturing delays and supply chain issues may impact Tesla\'s fourth-quarter delivery targets.',
    source: 'Bloomberg',
    url: 'https://bloomberg.com/tesla-production-challenges',
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    sentiment: 'negative',
    sentiment_score: -0.6,
    impact_level: 'medium',
    keywords: ['production', 'supply chain', 'delivery', 'manufacturing'],
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    ticker_symbol: 'BTC',
    headline: 'Bitcoin ETF Sees Record Inflows This Week',
    summary: 'Institutional investors continue to pour money into Bitcoin ETFs, signaling growing mainstream adoption.',
    source: 'CoinDesk',
    url: 'https://coindesk.com/bitcoin-etf-inflows',
    published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentiment_score: 0.7,
    impact_level: 'high',
    keywords: ['ETF', 'institutional', 'adoption', 'investment'],
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    ticker_symbol: 'RELIANCE.NS',
    headline: 'Reliance Industries Expands Green Energy Portfolio',
    summary: 'The Indian conglomerate announced a $10 billion investment in renewable energy infrastructure over the next five years.',
    source: 'Economic Times',
    url: 'https://economictimes.com/reliance-green-energy',
    published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    sentiment: 'positive',
    sentiment_score: 0.6,
    impact_level: 'medium',
    keywords: ['green energy', 'renewable', 'investment', 'expansion'],
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    ticker_symbol: 'EUR/USD',
    headline: 'ECB Signals Potential Rate Changes Amid Economic Uncertainty',
    summary: 'European Central Bank hints at monetary policy adjustments as eurozone faces mixed economic signals.',
    source: 'Financial Times',
    url: 'https://ft.com/ecb-rate-signals',
    published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    sentiment: 'neutral',
    sentiment_score: -0.1,
    impact_level: 'medium',
    keywords: ['ECB', 'interest rates', 'monetary policy', 'eurozone'],
    created_at: new Date().toISOString()
  }
];

let nextId = 6;

// GET /api/news - Get all news with filtering
router.get('/', (req, res) => {
  try {
    const {
      ticker_symbol,
      sentiment,
      impact_level,
      source,
      page = 1,
      limit = 20,
      sort = 'published_at',
      order = 'desc',
      search,
      from_date,
      to_date
    } = req.query;

    let filteredNews = [...newsItems];

    // Apply filters
    if (ticker_symbol) {
      filteredNews = filteredNews.filter(n => 
        n.ticker_symbol.toLowerCase() === ticker_symbol.toLowerCase()
      );
    }

    if (sentiment) {
      filteredNews = filteredNews.filter(n => n.sentiment === sentiment);
    }

    if (impact_level) {
      filteredNews = filteredNews.filter(n => n.impact_level === impact_level);
    }

    if (source) {
      filteredNews = filteredNews.filter(n => 
        n.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (search) {
      filteredNews = filteredNews.filter(n => 
        n.headline.toLowerCase().includes(search.toLowerCase()) ||
        n.summary.toLowerCase().includes(search.toLowerCase()) ||
        n.ticker_symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (from_date) {
      filteredNews = filteredNews.filter(n => 
        new Date(n.published_at) >= new Date(from_date)
      );
    }

    if (to_date) {
      filteredNews = filteredNews.filter(n => 
        new Date(n.published_at) <= new Date(to_date)
      );
    }

    // Apply sorting
    filteredNews.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      if (sort === 'published_at' || sort === 'created_at') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNews = filteredNews.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredNews.length,
        pages: Math.ceil(filteredNews.length / parseInt(limit))
      },
      filters: { ticker_symbol, sentiment, impact_level, source, search, from_date, to_date },
      sort: { field: sort, order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/news/:id - Get specific news item
router.get('/:id', (req, res) => {
  try {
    const newsItem = newsItems.find(n => n.id === parseInt(req.params.id));
    
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        error: 'News item not found',
        message: `No news item found with ID ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: newsItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/news/ticker/:symbol - Get news for specific ticker
router.get('/ticker/:symbol', (req, res) => {
  try {
    const { page = 1, limit = 10, sentiment, impact_level } = req.query;
    
    let tickerNews = newsItems.filter(n => 
      n.ticker_symbol.toLowerCase() === req.params.symbol.toLowerCase()
    );

    if (sentiment) {
      tickerNews = tickerNews.filter(n => n.sentiment === sentiment);
    }

    if (impact_level) {
      tickerNews = tickerNews.filter(n => n.impact_level === impact_level);
    }

    // Sort by published date (newest first)
    tickerNews.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedNews = tickerNews.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedNews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tickerNews.length,
        pages: Math.ceil(tickerNews.length / parseInt(limit))
      },
      ticker_symbol: req.params.symbol.toUpperCase()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/news/sentiment/analysis - Get sentiment analysis summary
router.get('/sentiment/analysis', (req, res) => {
  try {
    const sentimentStats = {
      total_articles: newsItems.length,
      sentiment_breakdown: {
        positive: newsItems.filter(n => n.sentiment === 'positive').length,
        negative: newsItems.filter(n => n.sentiment === 'negative').length,
        neutral: newsItems.filter(n => n.sentiment === 'neutral').length
      },
      average_sentiment_score: newsItems.reduce((sum, n) => sum + n.sentiment_score, 0) / newsItems.length,
      impact_breakdown: {
        high: newsItems.filter(n => n.impact_level === 'high').length,
        medium: newsItems.filter(n => n.impact_level === 'medium').length,
        low: newsItems.filter(n => n.impact_level === 'low').length
      },
      top_keywords: getTopKeywords(newsItems, 10),
      market_sentiment: getMarketSentiment(newsItems)
    };

    res.json({
      success: true,
      data: sentimentStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/news/breaking - Get breaking news (high impact)
router.get('/breaking', (req, res) => {
  try {
    const breakingNews = newsItems
      .filter(n => n.impact_level === 'high')
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
      .slice(0, 10);

    res.json({
      success: true,
      data: breakingNews,
      count: breakingNews.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/news - Add new news item (for admin/system use)
router.post('/', (req, res) => {
  try {
    const {
      ticker_symbol,
      headline,
      summary,
      source,
      url,
      published_at,
      sentiment,
      sentiment_score,
      impact_level,
      keywords
    } = req.body;

    if (!ticker_symbol || !headline || !source) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Ticker symbol, headline, and source are required fields'
      });
    }

    const newNewsItem = {
      id: nextId++,
      ticker_symbol: ticker_symbol.toUpperCase(),
      headline,
      summary: summary || '',
      source,
      url: url || '',
      published_at: published_at || new Date().toISOString(),
      sentiment: sentiment || 'neutral',
      sentiment_score: sentiment_score || 0,
      impact_level: impact_level || 'low',
      keywords: keywords || [],
      created_at: new Date().toISOString()
    };

    newsItems.push(newNewsItem);

    res.status(201).json({
      success: true,
      data: newNewsItem,
      message: 'News item added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Helper functions
function getTopKeywords(news, limit = 10) {
  const keywordCounts = {};
  
  news.forEach(item => {
    if (item.keywords) {
      item.keywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    }
  });

  return Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
}

function getMarketSentiment(news) {
  const sentimentScores = news.map(n => n.sentiment_score);
  const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
  
  let sentiment = 'neutral';
  if (avgSentiment > 0.2) sentiment = 'bullish';
  else if (avgSentiment < -0.2) sentiment = 'bearish';
  
  return {
    overall: sentiment,
    score: avgSentiment,
    confidence: Math.abs(avgSentiment)
  };
}

module.exports = router;