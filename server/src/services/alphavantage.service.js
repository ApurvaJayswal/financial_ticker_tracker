const ALPHA_BASE = 'https://www.alphavantage.co/query';

// Function to generate mock stock data for demo mode
function generateMockStockData(symbol) {
  // Generate realistic but random stock data
  const basePrice = symbol === 'AAPL' ? 180.5 : 
                   symbol === 'MSFT' ? 350.2 : 
                   symbol === 'GOOGL' ? 140.8 : 100.0;
  
  // Add some randomness
  const randomFactor = 0.05; // 5% variation
  const randomChange = basePrice * randomFactor * (Math.random() - 0.5);
  const price = basePrice + randomChange;
  const openPrice = price - (Math.random() * 2);
  const highPrice = price + (Math.random() * 2);
  const lowPrice = openPrice - (Math.random() * 2);
  const change = price - openPrice;
  const changePercent = (change / openPrice) * 100;
  
  return {
    price,
    openPrice,
    highPrice,
    lowPrice,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: price * (Math.floor(Math.random() * 1000000000) + 500000000),
    change,
    changePercent
  };
}

export async function fetchStockQuote(symbol, apiKey = process.env.ALPHA_VANTAGE_API_KEY) {
  // Demo mode - return mock data
  if (apiKey === 'demo') {
    return generateMockStockData(symbol);
  }

  if (!apiKey) {
    throw new Error('Missing ALPHA_VANTAGE_API_KEY');
  }

  // First get quote data
  const quoteUrl = `${ALPHA_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
  const quoteRes = await fetch(quoteUrl, { headers: { Accept: 'application/json' } });

  if (!quoteRes.ok) {
    throw new Error('Alpha Vantage quote error');
  }

  const quoteData = await quoteRes.json();
  const quote = quoteData?.['Global Quote'] || {};

  // Then get overview for market cap
  const overviewUrl = `${ALPHA_BASE}?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
  const overviewRes = await fetch(overviewUrl, { headers: { Accept: 'application/json' } });

  if (!overviewRes.ok) {
    throw new Error('Alpha Vantage overview error');
  }

  const overview = await overviewRes.json();

  const price = parseFloat(quote['05. price']);
  if (Number.isNaN(price)) {
    throw new Error('Alpha Vantage price missing');
  }

  return {
    price,
    openPrice: parseFloat(quote['02. open']),
    highPrice: parseFloat(quote['03. high']),
    lowPrice: parseFloat(quote['04. low']),
    volume: parseFloat(quote['06. volume']),
    marketCap: parseFloat(overview.MarketCapitalization),
    change: parseFloat(quote['09. change']),
    changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
  };
}
