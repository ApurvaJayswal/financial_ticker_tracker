const AIFinancialAssistant = require('../services/aiFinancialAssistant');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Initialize AI Financial Assistant
const aiAssistant = new AIFinancialAssistant();

/**
 * AI Financial Assistant Chat Controller
 * Handles user queries and conversations with the AI assistant
 */

// @desc    Process user question/query with AI assistant
// @route   POST /api/chat/ask
// @access  Public
const askQuestion = catchAsync(async (req, res, next) => {
  const { 
    question, 
    userId = 'anonymous',
    conversationId = 'default',
    includeMarketData = true,
    includeNews = true
  } = req.body;

  if (!question || question.trim().length === 0) {
    return next(new AppError('Question is required', 400));
  }

  logger.api('AI chat question received', { 
    userId, 
    questionLength: question.length,
    conversationId 
  });

  try {
    const result = await aiAssistant.processUserQuery(userId, question, {
      includeMarketData,
      includeNews,
      conversationId
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          metadata: {
            timestamp: new Date().toISOString(),
            userId,
            conversationId,
            queryType: result.context.queryType,
            dataUsed: result.context.dataUsed,
            llmModel: result.context.llmModel
          }
        },
        message: 'AI assistant response generated successfully'
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          response: result.response,
          metadata: {
            timestamp: new Date().toISOString(),
            userId,
            conversationId,
            error: result.error
          }
        },
        message: 'AI assistant provided fallback response'
      });
    }

  } catch (error) {
    logger.error('Error processing AI chat question:', error);
    return next(new AppError('Failed to process your question', 500));
  }
});

// @desc    Get conversation history
// @route   GET /api/chat/history/:userId
// @access  Public
const getConversationHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { conversationId = 'default' } = req.query;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  try {
    const history = aiAssistant.getConversationHistory(userId, conversationId);
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        conversationId,
        history,
        totalExchanges: history.length
      },
      message: 'Conversation history retrieved successfully'
    });

  } catch (error) {
    logger.error('Error retrieving conversation history:', error);
    return next(new AppError('Failed to retrieve conversation history', 500));
  }
});

// @desc    Clear conversation history
// @route   DELETE /api/chat/history/:userId
// @access  Public
const clearConversationHistory = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { conversationId = 'default' } = req.query;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  try {
    aiAssistant.clearConversationHistory(userId, conversationId);
    
    res.status(200).json({
      success: true,
      data: {
        userId,
        conversationId,
        cleared: true
      },
      message: 'Conversation history cleared successfully'
    });

  } catch (error) {
    logger.error('Error clearing conversation history:', error);
    return next(new AppError('Failed to clear conversation history', 500));
  }
});

// @desc    Get quick financial info (stock/crypto prices)
// @route   GET /api/chat/quick-info
// @access  Public
const getQuickInfo = catchAsync(async (req, res, next) => {
  const { 
    symbol, 
    type = 'auto', // auto, stock, crypto
    userId = 'anonymous' 
  } = req.query;

  if (!symbol) {
    return next(new AppError('Symbol is required', 400));
  }

  logger.api('Quick info request', { symbol, type, userId });

  try {
    let question;
    if (type === 'crypto' || symbol.toLowerCase().includes('btc') || symbol.toLowerCase().includes('eth')) {
      question = `What's the current price of ${symbol} cryptocurrency?`;
    } else {
      question = `What's the current price of ${symbol} stock?`;
    }

    const result = await aiAssistant.processUserQuery(userId, question, {
      includeMarketData: true,
      includeNews: false,
      conversationId: 'quick-info'
    });

    res.status(200).json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        response: result.response,
        type: result.context?.queryType || 'quick_info',
        timestamp: new Date().toISOString()
      },
      message: 'Quick info retrieved successfully'
    });

  } catch (error) {
    logger.error('Error getting quick info:', error);
    return next(new AppError('Failed to retrieve quick info', 500));
  }
});

// @desc    Get popular financial questions/prompts
// @route   GET /api/chat/popular-questions
// @access  Public
const getPopularQuestions = catchAsync(async (req, res, next) => {
  const popularQuestions = [
    {
      category: 'Market Overview',
      questions: [
        'How is the stock market performing today?',
        'What are the latest market trends?',
        'Which sectors are leading the market?',
        'What are the top gainers and losers today?'
      ]
    },
    {
      category: 'Specific Stocks',
      questions: [
        'How is AAPL stock doing?',
        'What happened to TSLA recently?',
        'Should I buy NVDA stock?',
        'What are analysts saying about GOOGL?'
      ]
    },
    {
      category: 'Cryptocurrency',
      questions: [
        'What is the current price of Bitcoin?',
        'How is the crypto market performing?',
        'Is it a good time to invest in Ethereum?',
        'What are the latest crypto news?'
      ]
    },
    {
      category: 'Financial Education',
      questions: [
        'What is a P/E ratio?',
        'How do I diversify my portfolio?',
        'What is the difference between stocks and bonds?',
        'Explain market volatility'
      ]
    },
    {
      category: 'Investment Strategy',
      questions: [
        'What is dollar-cost averaging?',
        'How do I start investing with $1000?',
        'What are the best defensive stocks?',
        'When should I sell my stocks?'
      ]
    },
    {
      category: 'News & Analysis',
      questions: [
        'What are the latest financial news?',
        'How do interest rates affect the stock market?',
        'What economic events are coming up?',
        'How does inflation impact my investments?'
      ]
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      categories: popularQuestions,
      totalQuestions: popularQuestions.reduce((sum, cat) => sum + cat.questions.length, 0),
      timestamp: new Date().toISOString()
    },
    message: 'Popular questions retrieved successfully'
  });
});

// @desc    Test AI assistant capabilities
// @route   POST /api/chat/test
// @access  Public
const testAssistant = catchAsync(async (req, res, next) => {
  const testQuestions = [
    'How is AAPL stock performing today?',
    'What are the latest financial news?',
    'Explain what is a bear market?'
  ];

  const results = [];

  for (const question of testQuestions) {
    try {
      const result = await aiAssistant.processUserQuery('test-user', question, {
        includeMarketData: true,
        includeNews: true,
        conversationId: 'test'
      });

      results.push({
        question,
        success: result.success,
        responseLength: result.response?.length || 0,
        llmModel: result.context?.llmModel || 'unknown',
        queryType: result.context?.queryType || 'unknown'
      });
    } catch (error) {
      results.push({
        question,
        success: false,
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      testResults: results,
      overallSuccess: results.every(r => r.success),
      timestamp: new Date().toISOString()
    },
    message: 'AI assistant test completed'
  });
});

// @desc    Get AI assistant status and capabilities
// @route   GET /api/chat/status
// @access  Public
const getAssistantStatus = catchAsync(async (req, res, next) => {
  const activeLLMModel = aiAssistant.getActiveLLMModel();
  const enabledLLMs = Object.entries(aiAssistant.llmConfig)
    .filter(([_, config]) => config.enabled)
    .map(([name, config]) => ({ name, model: config.model }));

  const status = {
    service: 'operational',
    activeLLM: activeLLMModel,
    enabledLLMs,
    capabilities: [
      'Real-time stock data analysis',
      'Cryptocurrency price tracking',
      'Financial news analysis',
      'Investment education',
      'Market trend analysis',
      'Portfolio advice',
      'Technical analysis',
      'Economic indicators'
    ],
    supportedQueries: [
      'Stock price inquiries',
      'Market performance questions',
      'Cryptocurrency analysis',
      'Financial education',
      'Investment strategies',
      'News analysis',
      'Economic explanations'
    ],
    dataSources: aiAssistant.apiService.getActiveSources(),
    lastUpdated: new Date().toISOString()
  };

  res.status(200).json({
    success: true,
    data: status,
    message: 'AI assistant status retrieved successfully'
  });
});

module.exports = {
  askQuestion,
  getConversationHistory,
  clearConversationHistory,
  getQuickInfo,
  getPopularQuestions,
  testAssistant,
  getAssistantStatus
};