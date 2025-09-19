const BASE = 'https://api.marketaux.com/v1/news/all';

// Function to generate mock news data for demo mode
function generateMockNewsData(ticker) {
  const now = new Date();
  const mockNews = [
    {
      ticker: ticker.toUpperCase(),
      source: 'Financial Times',
      title: `${ticker.toUpperCase()} Reports Strong Quarterly Earnings`,
      url: 'https://example.com/news/1',
      publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2 hours ago
      sentimentScore: 0.75,
      sentimentLabel: 'positive',
      summary: 'Company reported better than expected earnings for the quarter.',
      raw: { description: 'Company reported better than expected earnings for the quarter.' }
    },
    {
      ticker: ticker.toUpperCase(),
      source: 'Wall Street Journal',
      title: `${ticker.toUpperCase()} Announces New Product Line`,
      url: 'https://example.com/news/2',
      publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5), // 5 hours ago
      sentimentScore: 0.82,
      sentimentLabel: 'positive',
      summary: 'Company is expanding its product offerings with innovative technology.',
      raw: { description: 'Company is expanding its product offerings with innovative technology.' }
    },
    {
      ticker: ticker.toUpperCase(),
      source: 'Bloomberg',
      title: `Market Analysis: ${ticker.toUpperCase()} Stock Performance`,
      url: 'https://example.com/news/3',
      publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8), // 8 hours ago
      sentimentScore: 0.5,
      sentimentLabel: 'neutral',
      summary: 'Analysis of recent stock performance and market trends.',
      raw: { description: 'Analysis of recent stock performance and market trends.' }
    },
    {
      ticker: ticker.toUpperCase(),
      source: 'CNBC',
      title: `Industry Outlook: What It Means for ${ticker.toUpperCase()}`,
      url: 'https://example.com/news/4',
      publishedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24), // 1 day ago
      sentimentScore: 0.6,
      sentimentLabel: 'positive',
      summary: 'Industry trends and their potential impact on the company.',
      raw: { description: 'Industry trends and their potential impact on the company.' }
    }
  ];
  
  return mockNews;
}

export async function fetchNewsForTicker(ticker, apiKey = process.env.MARKETAUX_API_KEY) {
	// Demo mode - return mock data
	if (apiKey === 'demo') {
		return generateMockNewsData(ticker);
	}
	
	if (!apiKey) throw new Error('Missing MARKETAUX_API_KEY');
	const params = new URLSearchParams({
		apikey: apiKey,
		symbols: ticker.toUpperCase(),
		language: 'en',
		limit: '20',
	});
	const url = `${BASE}?${params.toString()}`;
	const res = await fetch(url, { headers: { Accept: 'application/json' } });
	if (!res.ok) throw new Error(`Marketaux error ${res.status}`);
	const data = await res.json();
	return (data?.data || []).map((a) => ({
		ticker: ticker.toUpperCase(),
		source: a.source,
		title: a.title,
		url: a.url,
		publishedAt: a.published_at ? new Date(a.published_at) : new Date(),
		sentimentScore: typeof a.sentiment_score === 'number' ? a.sentiment_score : undefined,
		sentimentLabel: a.sentiment ? String(a.sentiment).toLowerCase() : undefined,
		summary: undefined,
		raw: a,
	}));
}
