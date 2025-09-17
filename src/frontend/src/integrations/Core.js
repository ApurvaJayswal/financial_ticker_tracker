// Core integration module for external API calls

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Invoke LLM for AI-powered analysis and data processing
 * This is a mock implementation that simulates AI responses
 * In a real application, this would connect to an AI service like OpenAI, Anthropic, etc.
 */
export const InvokeLLM = async ({ 
  prompt, 
  add_context_from_internet = false, 
  response_json_schema = null,
  model = "gpt-3.5-turbo",
  max_tokens = 1000
}) => {
  try {
    // Mock AI response based on the prompt content
    if (prompt.includes("Search for financial tickers")) {
      // Extract search parameters
      const searchQuery = prompt.match(/matching "([^"]+)"/)?.[1] || "";
      const marketText = prompt.match(/(US stock market|Indian stock market|cryptocurrency market|foreign exchange market)/)?.[1] || "";
      
      // Map market text to API values
      const marketMap = {
        "US stock market": "us_stock",
        "Indian stock market": "indian_stock", 
        "cryptocurrency market": "crypto",
        "foreign exchange market": "forex"
      };
      
      const market = marketMap[marketText];
      
      // Call the backend API for ticker search
      try {
        const searchParams = new URLSearchParams();
        if (searchQuery) searchParams.append('search', searchQuery);
        if (market) searchParams.append('market', market);
        
        const response = await fetch(`${API_BASE_URL}/tickers?${searchParams.toString()}`);
        if (!response.ok) {
          throw new Error('API request failed');
        }
        
        const result = await response.json();
        
        return {
          results: result.data.slice(0, 5) // Limit to 5 results
        };
      } catch (apiError) {
        console.warn('API search failed, using mock data:', apiError);
        // Fallback to mock data
        const mockResults = generateMockTickerResults(searchQuery, marketText);
        return {
          results: mockResults
        };
      }
    }
    
    if (prompt.includes("market analysis") || prompt.includes("financial analysis")) {
      const analysisString = generateMockMarketAnalysis(prompt);
      console.log('Generated analysis (type:', typeof analysisString, '):', analysisString);
      return analysisString;
    }
    
    // Default response for other prompts
    return "I'm a mock AI assistant. In a real implementation, I would process your request and provide intelligent responses.";
    
  } catch (error) {
    console.error('LLM invocation error:', error);
    throw new Error('Failed to process AI request');
  }
};

/**
 * Generate mock ticker search results
 */
function generateMockTickerResults(searchQuery, market) {
  const mockData = {
    "US stock market": [
      { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", current_price: 175.43, market_cap: 2800000000000, description: "Technology company known for iPhone, iPad, and Mac" },
      { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", current_price: 338.11, market_cap: 2520000000000, description: "Software and cloud computing services" },
      { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", current_price: 134.12, market_cap: 1670000000000, description: "Internet search and advertising services" },
      { symbol: "TSLA", name: "Tesla, Inc.", sector: "Automotive", current_price: 242.68, market_cap: 770000000000, description: "Electric vehicles and clean energy" },
      { symbol: "AMZN", name: "Amazon.com, Inc.", sector: "E-commerce", current_price: 128.78, market_cap: 1350000000000, description: "E-commerce and cloud computing services" }
    ],
    "Indian stock market": [
      { symbol: "RELIANCE.NS", name: "Reliance Industries Limited", sector: "Energy", current_price: 2456.75, market_cap: 16600000000000, description: "Oil, petrochemicals, and telecommunications" },
      { symbol: "TCS.NS", name: "Tata Consultancy Services", sector: "Technology", current_price: 3420.50, market_cap: 12500000000000, description: "Information technology services" },
      { symbol: "INFY.NS", name: "Infosys Limited", sector: "Technology", current_price: 1456.25, market_cap: 6100000000000, description: "IT services and consulting" },
      { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited", sector: "Banking", current_price: 1678.90, market_cap: 12800000000000, description: "Private sector banking and financial services" },
      { symbol: "ITC.NS", name: "ITC Limited", sector: "Consumer Goods", current_price: 456.75, market_cap: 5600000000000, description: "Tobacco, FMCG, and hospitality" }
    ],
    "cryptocurrency market": [
      { symbol: "BTC", name: "Bitcoin", sector: "Cryptocurrency", current_price: 43250.75, market_cap: 845000000000, description: "First and largest cryptocurrency by market cap" },
      { symbol: "ETH", name: "Ethereum", sector: "Cryptocurrency", current_price: 2456.30, market_cap: 295000000000, description: "Blockchain platform for smart contracts and dApps" },
      { symbol: "BNB", name: "BNB", sector: "Cryptocurrency", current_price: 234.67, market_cap: 35000000000, description: "Binance exchange utility token" },
      { symbol: "ADA", name: "Cardano", sector: "Cryptocurrency", current_price: 0.345, market_cap: 12000000000, description: "Proof-of-stake blockchain platform" },
      { symbol: "SOL", name: "Solana", sector: "Cryptocurrency", current_price: 89.45, market_cap: 38000000000, description: "High-performance blockchain for DeFi and Web3" }
    ],
    "foreign exchange market": [
      { symbol: "EUR/USD", name: "Euro to US Dollar", sector: "Currency", current_price: 1.0875, market_cap: 0, description: "Most traded currency pair globally" },
      { symbol: "GBP/USD", name: "British Pound to US Dollar", sector: "Currency", current_price: 1.2456, market_cap: 0, description: "Major currency pair involving UK pound" },
      { symbol: "USD/JPY", name: "US Dollar to Japanese Yen", sector: "Currency", current_price: 149.85, market_cap: 0, description: "Major Asian currency pair" },
      { symbol: "AUD/USD", name: "Australian Dollar to US Dollar", sector: "Currency", current_price: 0.6534, market_cap: 0, description: "Commodity-linked currency pair" },
      { symbol: "USD/CAD", name: "US Dollar to Canadian Dollar", sector: "Currency", current_price: 1.3456, market_cap: 0, description: "North American currency pair" }
    ]
  };

  const relevantData = mockData[market] || mockData["US stock market"];
  
  // Filter results based on search query
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    return relevantData.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      item.symbol.toLowerCase().includes(searchLower) ||
      item.sector.toLowerCase().includes(searchLower)
    ).slice(0, 5);
  }
  
  return relevantData.slice(0, 5);
}

/**
 * Generate mock market analysis
 */
function generateMockMarketAnalysis(prompt) {
  const analysisTemplates = [
    "Based on current market conditions, the selected securities show mixed sentiment. Technical indicators suggest moderate volatility with potential for both upside and downside movements.",
    "Market analysis reveals strong fundamentals in the technology sector, while traditional industries face headwinds from economic uncertainty.",
    "Current trends indicate a shift towards growth stocks, with increased investor interest in AI and renewable energy sectors.",
    "The market is experiencing a consolidation phase, with key support levels holding and resistance levels being tested.",
    "Geopolitical factors and central bank policies are creating market uncertainty, leading to increased volatility across asset classes."
  ];
  
  return analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];
}

/**
 * Fetch real-time market data
 * Mock implementation - in production would connect to market data providers
 */
export const fetchMarketData = async (symbols, market = 'us_stock') => {
  try {
    const response = await fetch(`${API_BASE_URL}/markets/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols, market })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock market data due to API error:', error);
    // Return mock data
    return {
      data: symbols.map(symbol => ({
        symbol,
        price: Math.random() * 1000 + 50,
        change: (Math.random() - 0.5) * 20,
        change_percent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 10000000),
        last_updated: new Date().toISOString()
      }))
    };
  }
};

/**
 * Fetch financial news
 */
export const fetchFinancialNews = async (tickers = [], limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/financial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickers, limit })
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch financial news');
    }
    
    return await response.json();
  } catch (error) {
    console.warn('Using mock news data due to API error:', error);
    // Return mock news data
    return {
      data: [
        {
          title: "Market Update: Tech Stocks Rally",
          summary: "Technology stocks showed strong performance today...",
          url: "https://example.com/tech-rally",
          source: "MarketWatch",
          sentiment: "positive",
          related_tickers: tickers.slice(0, 2)
        },
        {
          title: "Economic Indicators Show Growth",
          summary: "Latest economic data suggests continued expansion...",
          url: "https://example.com/economic-growth",
          source: "Financial Times",
          sentiment: "positive",
          related_tickers: tickers.slice(1, 3)
        }
      ]
    };
  }
};