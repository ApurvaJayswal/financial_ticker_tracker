import PricePoint from '../models/price.model.js';
import NewsArticle from '../models/news.model.js';
import { fetchCryptoPrice } from './coingecko.service.js';
import { fetchStockQuote } from './alphavantage.service.js';
import { fetchNewsForTicker } from './marketaux.service.js';
import { broadcastPriceUpdate, broadcastNewsUpdate } from './websocket.service.js';

// Default tickers to fetch
const DEFAULT_TICKERS = {
  US: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'],
  CRYPTO: ['bitcoin', 'ethereum', 'cardano', 'solana', 'chainlink'],
};

// Cache for tracking last fetch times
const lastFetchTimes = new Map();

// Track error counts to reduce logging
const errorCounts = {
  price: {},
  news: {}
};

async function fetchAndCachePrice(ticker, market) {
  const errorKey = `${ticker}-${market}`;
  
  try {
    let result;
    let source;

    if (market === 'CRYPTO') {
      result = await fetchCryptoPrice(ticker.toLowerCase(), 'usd');
      source = 'coingecko';
    } else {
      result = await fetchStockQuote(ticker.toUpperCase());
      source = 'alphavantage';
    }

    // Reset error count on success
    errorCounts.price[errorKey] = 0;

		const priceDoc = await PricePoint.create({
			ticker: ticker.toUpperCase(),
			market: market.toUpperCase(),
			source,
			price: result.price,
			volume: result.volume,
			timestamp: new Date(),
		});
		
		// Broadcast real-time update
		broadcastPriceUpdate(ticker, {
			price: result.price,
			volume: result.volume,
			market: market.toUpperCase(),
			source
		});
		
		console.log(`[scheduler] Cached price for ${ticker} (${market}): $${result.price}`);
  } catch (err) {
    // Initialize error count if not exists
    if (!errorCounts.price[errorKey]) {
      errorCounts.price[errorKey] = 0;
    }
    
    // Only log every 2nd error to reduce log spam
    errorCounts.price[errorKey]++;
    if (errorCounts.price[errorKey] % 2 === 0) {
      console.error(`[scheduler] Failed to fetch price for ${ticker} (${market}):`, err.message);
    }
  }
}

async function fetchAndCacheNews(ticker) {
  try {
		const articles = await fetchNewsForTicker(ticker);
		if (articles.length > 0) {
			await NewsArticle.insertMany(articles, { ordered: false });
			
			// Broadcast real-time update
			broadcastNewsUpdate(ticker, {
				articles: articles.slice(0, 3), // Send latest 3 articles
				count: articles.length
			});
			
			// Reset error count on success
			errorCounts.news[ticker] = 0;
			
			console.log(`[scheduler] Cached ${articles.length} news articles for ${ticker}`);
		}
  } catch (err) {
    // Initialize error count if not exists
    if (!errorCounts.news[ticker]) {
      errorCounts.news[ticker] = 0;
    }
    
    // Only log every 10th error to reduce log spam
    errorCounts.news[ticker]++;
    if (errorCounts.news[ticker] % 10 === 1) {
      console.error(`[scheduler] Failed to fetch news for ${ticker}:`, err.message);
    }
  }
}

async function runPriceUpdate() {
  console.log('[scheduler] Running price update...');

  for (const [market, tickers] of Object.entries(DEFAULT_TICKERS)) {
    for (const ticker of tickers) {
      await fetchAndCachePrice(ticker, market);
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function runNewsUpdate() {
  console.log('[scheduler] Running news update...');

  // Get unique tickers from all markets
  const allTickers = [...new Set([...DEFAULT_TICKERS.US, ...DEFAULT_TICKERS.CRYPTO])];

  for (const ticker of allTickers) {
    await fetchAndCacheNews(ticker);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

function startScheduler() {
  console.log('[scheduler] Starting periodic data fetches...');

  // Run initial fetch
  runPriceUpdate();
  runNewsUpdate();

  // Price updates every 30 seconds
  setInterval(runPriceUpdate, 30 * 1000);

  // News updates every 5 minutes
  setInterval(runNewsUpdate, 5 * 60 * 1000);

  console.log('[scheduler] Scheduler started - prices every 30s, news every 5min');
}

export { startScheduler, runPriceUpdate, runNewsUpdate };
