const axios = require('axios');
const APIIntegrationService = require('./apiIntegrationService');
const logger = require('../utils/logger');

/**
 * AI Financial Assistant Service
 * Handles user queries about finance using LLM models and real-time data
 */
class AIFinancialAssistant {
  constructor() {
    this.apiService = new APIIntegrationService();
    this.conversationHistory = new Map(); // Store conversation context per user
    
    // LLM API configurations
    this.llmConfig = {
      openai: {
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-3.5-turbo',
        enabled: process.env.OPENAI_ENABLED === 'true'
      },
      perplexity: {
        baseURL: 'https://api.perplexity.ai',
        apiKey: process.env.PERPLEXITY_API_KEY || '',
        model: 'llama-3.1-sonar-small-128k-online',
        enabled: process.env.PERPLEXITY_ENABLED === 'true'
      },
      gemini: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: process.env.GEMINI_API_KEY || '',
        model: 'gemini-1.5-flash',
        enabled: process.env.GEMINI_ENABLED === 'true'
      },
      anthropic: {
        baseURL: 'https://api.anthropic.com/v1',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-haiku-20240307',
        enabled: process.env.ANTHROPIC_ENABLED === 'true'
      }
    };
    
    // Financial context and prompts
    this.systemPrompt = `You are an expert AI Financial Assistant for TickerTracker, a professional market analysis platform. You have access to real-time financial data including stocks, cryptocurrencies, and market news.

Your capabilities:
- Provide accurate financial analysis and investment insights
- Answer questions about stocks, cryptocurrencies, market trends
- Explain financial concepts in simple terms
- Give market commentary based on real-time data
- Suggest investment strategies (with appropriate disclaimers)
- Analyze market sentiment and news impact
- Answer general finance questions with educational context
- Provide real-time market updates and breaking news analysis

Response Guidelines:
- Always base your responses on provided real-time data when available
- Structure responses clearly with bullet points or sections when appropriate
- Include specific data points, numbers, and percentages
- Be conversational but professional and authoritative
- If asked about specific stocks/crypto, prioritize the real-time data provided
- For breaking news questions, reference and summarize the latest news data
- Provide actionable insights while maintaining appropriate disclaimers
- Use emojis sparingly for better readability (📈📉💰📊)
- Always end with investment disclaimer

Current date: ${new Date().toLocaleDateString()}
`;
  }

  /**
   * Process user query with real-time financial data
   */
  async processUserQuery(userId, userQuery, options = {}) {
    const {
      includeMarketData = true,
      includeNews = true,
      conversationId = 'default'
    } = options;

    try {
      logger.info('Processing user query', { userId, query: userQuery.substring(0, 100) });

      // Step 1: Analyze query to determine data needs
      const queryAnalysis = this.analyzeQuery(userQuery);
      
      // Step 2: Fetch relevant real-time data based on query
      const contextData = await this.gatherContextData(queryAnalysis, {
        includeMarketData,
        includeNews
      });

      // Step 3: Build comprehensive prompt with real-time data
      const enhancedPrompt = this.buildPromptWithData(userQuery, contextData, queryAnalysis);

      // Step 4: Get response from LLM
      const llmResponse = await this.queryLLM(userId, enhancedPrompt, conversationId, contextData, queryAnalysis, userQuery);

      // Step 5: Store conversation context
      this.updateConversationHistory(userId, conversationId, userQuery, llmResponse);

      return {
        success: true,
        response: llmResponse,
        context: {
          dataUsed: contextData.metadata,
          queryType: queryAnalysis.type,
          timestamp: new Date().toISOString(),
          llmModel: this.getActiveLLMModel()
        }
      };

    } catch (error) {
      logger.error('Error processing user query:', error);
      
      // Try to provide a meaningful response even when there's an error
      try {
        const queryAnalysis = this.analyzeQuery(userQuery);
        const contextData = await this.gatherContextData(queryAnalysis, {
          includeMarketData: false,
          includeNews: false
        });
        
        return {
          success: true,
          response: this.getFallbackResponse(userQuery, contextData, queryAnalysis),
          context: {
            dataUsed: contextData.metadata,
            queryType: queryAnalysis.type,
            timestamp: new Date().toISOString(),
            llmModel: 'fallback_mode',
            error: error.message
          }
        };
      } catch (fallbackError) {
        return {
          success: false,
          response: "I apologize, but I'm having trouble accessing the financial data right now. Please try again in a moment.",
          error: error.message
        };
      }
    }
  }

  /**
   * Analyze user query to determine what data to fetch
   */
  analyzeQuery(query) {
    const lowercaseQuery = query.toLowerCase();
    
    // Extract mentioned tickers/symbols
    const tickerRegex = /\b[A-Z]{2,5}\b/g;
    const possibleTickers = query.match(tickerRegex) || [];
    
    // Extract mentioned cryptocurrencies
    const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency'];
    const cryptoMentioned = cryptoKeywords.some(keyword => lowercaseQuery.includes(keyword));
    
    // Determine query type
    let queryType = 'general';
    if (lowercaseQuery.includes('news') || lowercaseQuery.includes('what happened')) {
      queryType = 'news';
    } else if (possibleTickers.length > 0) {
      queryType = 'stock_specific';
    } else if (cryptoMentioned) {
      queryType = 'crypto';
    } else if (lowercaseQuery.includes('market') || lowercaseQuery.includes('dow') || lowercaseQuery.includes('s&p')) {
      queryType = 'market_overview';
    }

    return {
      type: queryType,
      tickers: possibleTickers.slice(0, 5), // Limit to 5 tickers
      cryptoMentioned,
      needsNews: lowercaseQuery.includes('news') || lowercaseQuery.includes('latest') || lowercaseQuery.includes('recent'),
      needsAnalysis: lowercaseQuery.includes('analysis') || lowercaseQuery.includes('should i') || lowercaseQuery.includes('recommend')
    };
  }

  /**
   * Gather relevant real-time data based on query analysis
   */
  async gatherContextData(queryAnalysis, options) {
    const contextData = {
      marketSummary: null,
      specificStocks: [],
      cryptoData: [],
      news: [],
      metadata: {
        sources: [],
        timestamp: new Date().toISOString()
      }
    };

    try {
      // Fetch market data based on query type
      if (queryAnalysis.type === 'market_overview' || queryAnalysis.type === 'general') {
        // Get general market overview
        const marketData = await this.apiService.fetchComprehensiveMarketData({
          stockSymbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'],
          cryptoCoins: ['bitcoin', 'ethereum'],
          newsQuery: 'stock market finance',
          includeHistorical: false
        });
        
        contextData.marketSummary = {
          totalTickers: marketData.metadata.total_tickers,
          indices: marketData.indices,
          topStocks: marketData.tickers.slice(0, 5)
        };
        contextData.metadata.sources.push(...marketData.metadata.data_sources);
      }

      // Fetch specific stock data
      if (queryAnalysis.tickers.length > 0) {
        const stockData = await this.apiService.fetchStockData(queryAnalysis.tickers);
        contextData.specificStocks = stockData;
        contextData.metadata.sources.push('Stock Data');
      }

      // Fetch crypto data
      if (queryAnalysis.cryptoMentioned || queryAnalysis.type === 'crypto') {
        const cryptoData = await this.apiService.fetchCryptoData(['bitcoin', 'ethereum', 'cardano']);
        contextData.cryptoData = cryptoData;
        contextData.metadata.sources.push('Cryptocurrency Data');
      }

      // Fetch relevant news
      if (options.includeNews || queryAnalysis.needsNews) {
        let newsQuery = 'stock market finance';
        if (queryAnalysis.tickers.length > 0) {
          newsQuery = queryAnalysis.tickers.join(' ') + ' stock market';
        } else if (queryAnalysis.cryptoMentioned) {
          newsQuery = 'cryptocurrency bitcoin ethereum market';
        }
        
        const news = await this.apiService.fetchNewsData(newsQuery, 'en', 10);
        contextData.news = news.slice(0, 5); // Limit to 5 most recent articles
        contextData.metadata.sources.push('Financial News');
      }

      logger.info('Gathered context data', { 
        sources: contextData.metadata.sources,
        stockCount: contextData.specificStocks.length,
        newsCount: contextData.news.length 
      });

      return contextData;

    } catch (error) {
      logger.error('Error gathering context data:', error);
      return contextData;
    }
  }

  /**
   * Build enhanced prompt with real-time data
   */
  buildPromptWithData(userQuery, contextData, queryAnalysis) {
    let dataContext = '\n--- REAL-TIME FINANCIAL DATA ---\n';

    // Add market summary
    if (contextData.marketSummary) {
      dataContext += `Market Overview:\n`;
      if (contextData.marketSummary.indices) {
        Object.entries(contextData.marketSummary.indices).forEach(([symbol, data]) => {
          dataContext += `- ${symbol}: $${data.value} (${data.changePercent > 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)\n`;
        });
      }
      dataContext += `\nTop Stocks:\n`;
      contextData.marketSummary.topStocks.forEach(stock => {
        dataContext += `- ${stock.symbol} (${stock.name}): $${stock.current_price} (${stock.price_change_percent > 0 ? '+' : ''}${stock.price_change_percent.toFixed(2)}%)\n`;
      });
    }

    // Add specific stock data
    if (contextData.specificStocks.length > 0) {
      dataContext += `\nSpecific Stock Data:\n`;
      contextData.specificStocks.forEach(stock => {
        dataContext += `- ${stock.symbol} (${stock.name}): $${stock.current_price} (${stock.price_change_percent > 0 ? '+' : ''}${stock.price_change_percent.toFixed(2)}%) | Volume: ${stock.volume?.toLocaleString()} | Source: ${stock.source}\n`;
      });
    }

    // Add crypto data
    if (contextData.cryptoData.length > 0) {
      dataContext += `\nCryptocurrency Data:\n`;
      contextData.cryptoData.forEach(crypto => {
        dataContext += `- ${crypto.name} (${crypto.symbol}): $${crypto.current_price.toLocaleString()} (${crypto.price_change_percent > 0 ? '+' : ''}${crypto.price_change_percent.toFixed(2)}%)\n`;
      });
    }

    // Add recent news
    if (contextData.news.length > 0) {
      dataContext += `\nLatest Financial News:\n`;
      contextData.news.forEach((article, index) => {
        const publishedTime = new Date(article.publishedAt).toLocaleString();
        dataContext += `${index + 1}. "${article.title}" - ${article.source.name} (${publishedTime})\n`;
        if (article.description) {
          dataContext += `   ${article.description.substring(0, 150)}...\n`;
        }
      });
    }

    dataContext += `\nData Sources: ${contextData.metadata.sources.join(', ')}\n`;
    dataContext += `Last Updated: ${contextData.metadata.timestamp}\n`;
    dataContext += '--- END REAL-TIME DATA ---\n\n';

    return `${this.systemPrompt}

${dataContext}

User Question: ${userQuery}

Please provide a comprehensive, accurate response based on the real-time data above. Include specific numbers and data points where relevant. Always end with an appropriate investment disclaimer.`;
  }

  /**
   * Query the LLM with the enhanced prompt
   */
  async queryLLM(userId, prompt, conversationId, contextData, queryAnalysis, userQuery) {
    // Try each enabled LLM in order of preference
    const enabledLLMs = Object.entries(this.llmConfig).filter(([_, config]) => config.enabled);
    
    if (enabledLLMs.length === 0) {
      logger.info('No LLMs enabled, using intelligent fallback response');
      return this.getFallbackResponse(userQuery, contextData, queryAnalysis);
    }

    for (const [llmName, config] of enabledLLMs) {
      try {
        logger.info(`Attempting to query ${llmName} LLM`);
        
        let response;
        switch (llmName) {
          case 'openai':
            response = await this.queryOpenAI(prompt, config);
            break;
          case 'perplexity':
            response = await this.queryPerplexity(prompt, config);
            break;
          case 'gemini':
            response = await this.queryGemini(prompt, config);
            break;
          case 'anthropic':
            response = await this.queryAnthropic(prompt, config);
            break;
          default:
            continue;
        }

        if (response) {
          logger.info(`Successfully got response from ${llmName}`);
          return response;
        }
      } catch (error) {
        logger.warn(`${llmName} LLM failed:`, error.message);
        continue;
      }
    }

    logger.info('All LLMs failed, using intelligent fallback response');
    return this.getFallbackResponse(userQuery, contextData, queryAnalysis);
  }

  /**
   * Query OpenAI GPT
   */
  async queryOpenAI(prompt, config) {
    const response = await axios.post(`${config.baseURL}/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  /**
   * Query Perplexity AI
   */
  async queryPerplexity(prompt, config) {
    const response = await axios.post(`${config.baseURL}/chat/completions`, {
      model: config.model,
      messages: [
        { role: 'system', content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }

  /**
   * Query Google Gemini
   */
  async queryGemini(prompt, config) {
    const response = await axios.post(`${config.baseURL}/models/${config.model}:generateContent?key=${config.apiKey}`, {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data.candidates[0].content.parts[0].text;
  }

  /**
   * Query Anthropic Claude
   */
  async queryAnthropic(prompt, config) {
    const response = await axios.post(`${config.baseURL}/messages`, {
      model: config.model,
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });

    return response.data.content[0].text;
  }

  /**
   * Get intelligent fallback response when LLMs are unavailable
   */
  getFallbackResponse(userQuery, contextData, queryAnalysis) {
    // Analyze query and provide intelligent response based on available data
    const lowercaseQuery = userQuery.toLowerCase();
    
    // Stock-specific responses
    if (queryAnalysis.type === 'stock_specific' && contextData.specificStocks.length > 0) {
      let response = `📊 **Stock Analysis Based on Real-Time Data**\n\n`;
      
      contextData.specificStocks.forEach(stock => {
        const trend = stock.price_change_percent > 0 ? '📈 UP' : '📉 DOWN';
        const changeColor = stock.price_change_percent > 0 ? '+' : '';
        
        response += `**${stock.symbol}** (${stock.name})\n`;
        response += `• Current Price: $${stock.current_price}\n`;
        response += `• Change: ${changeColor}${stock.price_change_percent?.toFixed(2)}% (${changeColor}$${stock.price_change?.toFixed(2)})\n`;
        response += `• Trend: ${trend}\n`;
        if (stock.volume) response += `• Volume: ${stock.volume.toLocaleString()}\n`;
        response += `• Last Updated: ${new Date(stock.last_updated).toLocaleString()}\n\n`;
      });
      
      response += `💡 **Key Insights:**\n`;
      if (contextData.specificStocks.some(s => s.price_change_percent > 5)) {
        response += `• Strong upward movement detected in some positions\n`;
      }
      if (contextData.specificStocks.some(s => s.price_change_percent < -5)) {
        response += `• Significant decline noted - monitor for support levels\n`;
      }
      response += `• Data sourced from: ${contextData.metadata.sources.join(', ')}\n\n`;
      
      response += `*This analysis is based on real-time market data. Not financial advice.*`;
      return response;
    }
    
    // Crypto-specific responses
    if (queryAnalysis.type === 'crypto' && contextData.cryptoData.length > 0) {
      let response = `🪙 **Cryptocurrency Market Analysis**\n\n`;
      
      contextData.cryptoData.forEach(crypto => {
        const trend = crypto.price_change_percent > 0 ? '🚀 BULLISH' : '🐻 BEARISH';
        response += `**${crypto.name}** (${crypto.symbol})\n`;
        response += `• Price: $${crypto.current_price.toLocaleString()}\n`;
        response += `• 24h Change: ${crypto.price_change_percent > 0 ? '+' : ''}${crypto.price_change_percent?.toFixed(2)}%\n`;
        response += `• Sentiment: ${trend}\n\n`;
      });
      
      response += `📈 **Market Overview:**\n`;
      const avgChange = contextData.cryptoData.reduce((sum, c) => sum + c.price_change_percent, 0) / contextData.cryptoData.length;
      response += avgChange > 0 ? `• Overall crypto market showing positive momentum\n` : `• Crypto market experiencing some volatility\n`;
      
      response += `\n*Cryptocurrency markets are highly volatile. Invest responsibly.*`;
      return response;
    }
    
    // Market overview responses
    if (queryAnalysis.type === 'market_overview' && contextData.marketSummary) {
      let response = `📊 **Market Overview**\n\n`;
      
      if (contextData.marketSummary.topStocks && contextData.marketSummary.topStocks.length > 0) {
        response += `**Top Market Movers:**\n`;
        contextData.marketSummary.topStocks.slice(0, 5).forEach(stock => {
          const trend = stock.price_change_percent > 0 ? '📈' : '📉';
          response += `${trend} ${stock.symbol}: $${stock.current_price} (${stock.price_change_percent > 0 ? '+' : ''}${stock.price_change_percent?.toFixed(2)}%)\n`;
        });
        response += `\n`;
      }
      
      response += `**Market Sentiment Analysis:**\n`;
      const gainers = contextData.marketSummary.topStocks?.filter(s => s.price_change_percent > 0).length || 0;
      const losers = contextData.marketSummary.topStocks?.filter(s => s.price_change_percent < 0).length || 0;
      
      if (gainers > losers) {
        response += `• 🟢 Bullish sentiment - more gainers than losers\n`;
      } else if (losers > gainers) {
        response += `• 🔴 Bearish sentiment - more losers than gainers\n`;
      } else {
        response += `• 🟡 Mixed sentiment - balanced market movement\n`;
      }
      
      response += `\n*Market data updated: ${contextData.metadata.timestamp}*`;
      return response;
    }
    
    // News-related responses
    if (queryAnalysis.needsNews && contextData.news.length > 0) {
      let response = `📰 **Latest Financial News Summary**\n\n`;
      
      contextData.news.slice(0, 3).forEach((article, index) => {
        response += `**${index + 1}. ${article.title}**\n`;
        if (article.description) {
          response += `${article.description.substring(0, 150)}...\n`;
        }
        response += `Source: ${article.source.name} | ${new Date(article.publishedAt).toLocaleDateString()}\n\n`;
      });
      
      response += `💡 **News Impact:** Monitor these developments as they may affect market sentiment.\n\n`;
      response += `*News sourced from trusted financial publications.*`;
      return response;
    }
    
    // Educational responses for financial concepts
    if (this.isEducationalQuery(lowercaseQuery)) {
      return this.getEducationalResponse(lowercaseQuery);
    }
    
    // General fallback with available data context
    let response = `🤖 **AI Financial Assistant** (Fallback Mode)\n\n`;
    
    if (contextData.metadata.sources.length > 0) {
      response += `I have access to real-time data from: ${contextData.metadata.sources.join(', ')}\n\n`;
    }
    
    response += `**What I can help you with:**\n`;
    response += `📈 Stock price analysis and trends\n`;
    response += `🪙 Cryptocurrency market insights\n`;
    response += `📊 Market overview and sentiment\n`;
    response += `📰 Latest financial news analysis\n`;
    response += `🎓 Financial education and concepts\n\n`;
    
    response += `**Try asking:**\n`;
    response += `• "How is AAPL stock doing today?"\n`;
    response += `• "What's the current Bitcoin price?"\n`;
    response += `• "Show me today's market movers"\n`;
    response += `• "What are the latest financial news?"\n\n`;
    
    response += `*Note: I'm currently using advanced data analysis instead of AI language models. Results are based on real-time financial data.*`;
    
    return response;
  }
  
  /**
   * Check if query is asking for educational content
   */
  isEducationalQuery(query) {
    const educationalKeywords = [
      'what is', 'explain', 'definition', 'meaning', 'how does', 'what does',
      'p/e ratio', 'market cap', 'dividend', 'volatility', 'bull market', 'bear market',
      'rsi', 'moving average', 'support', 'resistance', 'diversification'
    ];
    
    return educationalKeywords.some(keyword => query.includes(keyword));
  }
  
  /**
   * Provide educational responses for financial concepts
   */
  getEducationalResponse(query) {
    let response = `🎓 **Financial Education**\n\n`;
    
    if (query.includes('p/e ratio')) {
      response += `**Price-to-Earnings (P/E) Ratio**\n\n`;
      response += `The P/E ratio measures how much investors are willing to pay per dollar of earnings.\n\n`;
      response += `**Formula:** Stock Price ÷ Earnings Per Share\n\n`;
      response += `**Interpretation:**\n`;
      response += `• High P/E (>25): May indicate overvaluation or high growth expectations\n`;
      response += `• Low P/E (<15): May indicate undervaluation or pessimistic outlook\n`;
      response += `• Average P/E (~20): Generally considered reasonable valuation\n\n`;
      response += `**Example:** If a stock trades at $50 and earns $2.50 per share, P/E = 20\n\n`;
    } else if (query.includes('bull market') || query.includes('bear market')) {
      response += `**Bull vs Bear Markets**\n\n`;
      response += `🐂 **Bull Market:**\n`;
      response += `• Rising stock prices (generally 20%+ increase)\n`;
      response += `• Investor optimism and confidence\n`;
      response += `• Strong economic indicators\n\n`;
      response += `🐻 **Bear Market:**\n`;
      response += `• Falling stock prices (generally 20%+ decrease)\n`;
      response += `• Investor pessimism and caution\n`;
      response += `• Economic uncertainty or recession\n\n`;
    } else if (query.includes('diversification')) {
      response += `**Portfolio Diversification**\n\n`;
      response += `Diversification means spreading investments across different assets to reduce risk.\n\n`;
      response += `**Key Principles:**\n`;
      response += `• Don't put all eggs in one basket\n`;
      response += `• Mix different asset classes (stocks, bonds, commodities)\n`;
      response += `• Spread across industries and regions\n`;
      response += `• Balance growth vs stability\n\n`;
      response += `**Benefits:** Reduces portfolio volatility and potential losses\n\n`;
    } else {
      response += `I can explain various financial concepts including:\n\n`;
      response += `📊 **Valuation Metrics:** P/E ratio, P/B ratio, Market Cap\n`;
      response += `📈 **Market Conditions:** Bull markets, Bear markets, Corrections\n`;
      response += `💰 **Investment Strategies:** Diversification, Dollar-cost averaging\n`;
      response += `📉 **Technical Analysis:** Support/Resistance, Moving averages, RSI\n`;
      response += `🏦 **Financial Statements:** Revenue, Earnings, Cash flow\n\n`;
      response += `Try asking: "What is a P/E ratio?" or "Explain diversification"\n\n`;
    }
    
    response += `*This is educational content only, not financial advice.*`;
    return response;
  }

  /**
   * Update conversation history
   */
  updateConversationHistory(userId, conversationId, userQuery, response) {
    const key = `${userId}_${conversationId}`;
    
    if (!this.conversationHistory.has(key)) {
      this.conversationHistory.set(key, []);
    }
    
    const history = this.conversationHistory.get(key);
    history.push({
      timestamp: new Date().toISOString(),
      userQuery,
      response: response.substring(0, 500), // Store truncated version
    });

    // Keep only last 10 exchanges
    if (history.length > 10) {
      history.shift();
    }
  }

  /**
   * Get active LLM model name
   */
  getActiveLLMModel() {
    const enabled = Object.entries(this.llmConfig).find(([_, config]) => config.enabled);
    return enabled ? `${enabled[0]}:${enabled[1].model}` : 'fallback';
  }

  /**
   * Get conversation history
   */
  getConversationHistory(userId, conversationId = 'default') {
    const key = `${userId}_${conversationId}`;
    return this.conversationHistory.get(key) || [];
  }

  /**
   * Clear conversation history
   */
  clearConversationHistory(userId, conversationId = 'default') {
    const key = `${userId}_${conversationId}`;
    this.conversationHistory.delete(key);
  }
}

module.exports = AIFinancialAssistant;