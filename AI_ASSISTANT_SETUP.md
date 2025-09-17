# AI Financial Assistant Setup Guide

## Overview

Your TickerTracker application now includes a powerful AI Financial Assistant that can:

🤖 **Answer financial questions with real-time data**
📊 **Analyze market trends and provide insights** 
📰 **Summarize and analyze financial news**
🎓 **Provide investment education and explanations**
💡 **Offer portfolio strategy suggestions**
🔍 **Real-time stock and cryptocurrency analysis**

## Features

### 🎯 **Intelligent Query Processing**
- Automatically determines what type of financial data to fetch based on your question
- Supports questions about specific stocks, crypto, market trends, and general finance
- Contextual responses using real-time market data

### 🔄 **Multiple LLM Support**
- **OpenAI GPT** (recommended for best results)
- **Perplexity AI** (excellent for real-time web search)
- **Google Gemini** (free tier available)
- **Anthropic Claude** (high-quality financial analysis)
- Automatic fallback if primary LLM is unavailable

### 📰 **Trusted News Integration**
- Only sources from trusted financial publications
- Working read links validated automatically
- Real-time sentiment analysis of news articles

### 💬 **Advanced Chat Features**
- Conversation history and context
- Copy responses to clipboard
- Popular questions for quick access
- Real-time typing indicators

## Quick Setup (5 minutes)

### 1. **Environment Configuration**
```bash
# Copy the environment template
cp .env.example .env
```

### 2. **Get API Keys**

**Minimum Setup (Required):**
- **OpenAI API Key**: [https://platform.openai.com/](https://platform.openai.com/)
  - Sign up → API Keys → Create new key
  - Cost: ~$0.002 per 1K tokens (very affordable)
  
- **NewsAPI Key**: [https://newsapi.org/](https://newsapi.org/)
  - Free tier: 1,000 requests/day
  - Essential for financial news

### 3. **Update .env File**
```env
# Essential for AI Assistant
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_ENABLED=true

# Essential for News
NEWS_API_KEY=your-actual-newsapi-key-here
NEWS_API_ENABLED=true
NEWS_TRUSTED_SOURCES_ONLY=true
```

### 4. **Optional Enhancements**
```env
# For enhanced real-time capabilities
PERPLEXITY_API_KEY=your-perplexity-key
PERPLEXITY_ENABLED=true

# Alternative/backup LLMs
GEMINI_API_KEY=your-gemini-key
GEMINI_ENABLED=true
```

### 5. **Start the Application**
```bash
# Backend
cd src/backend
npm start

# Frontend
cd src/frontend
npm start
```

### 6. **Access AI Assistant**
- Navigate to your dashboard
- Click on **"AI Assistant"** card
- Start asking financial questions!

## Usage Examples

### 📈 **Stock Analysis**
```
"How is AAPL performing today?"
"What's driving TSLA stock price recently?"
"Should I invest in NVDA right now?"
```

### 🪙 **Cryptocurrency**  
```
"What's the current Bitcoin price and trend?"
"How is the crypto market doing today?"
"Explain Ethereum's recent performance"
```

### 📊 **Market Overview**
```
"How are the markets performing today?"
"What sectors are leading the market?"
"What are the top gainers and losers?"
```

### 🎓 **Financial Education**
```
"What is a P/E ratio and why does it matter?"
"Explain dollar-cost averaging strategy"
"How do interest rates affect the stock market?"
```

### 📰 **News Analysis**
```
"What are the latest financial news?"
"Summarize today's market-moving events"
"How might recent Fed announcements impact my portfolio?"
```

## Advanced Configuration

### **LLM Priority Order**
The system tries LLMs in this order:
1. OpenAI (if enabled)
2. Perplexity (if enabled) 
3. Gemini (if enabled)
4. Anthropic (if enabled)
5. Fallback response

### **News Sources**
Trusted sources include:
- Reuters, Bloomberg, Financial Times
- Wall Street Journal, MarketWatch, CNBC  
- Yahoo Finance, Forbes, Business Insider
- CoinDesk, CoinTelegraph (for crypto)

### **Data Sources**
The assistant pulls data from:
- Real-time stock APIs
- Cryptocurrency price feeds
- Financial news APIs
- Market indices and indicators

## API Costs Estimation

### **OpenAI (Recommended)**
- GPT-3.5-turbo: $0.002/1K tokens
- Average query: ~500-1000 tokens  
- **Cost per query: ~$0.001-0.002**
- 100 queries ≈ $0.10-0.20

### **Alternative: Google Gemini**
- Free tier: 60 requests/minute
- **Cost: Free** for moderate usage

### **NewsAPI**
- Free tier: 1,000 requests/day
- **Cost: Free** for most users

## Troubleshooting

### **"AI assistant provided fallback response"**
- Check if API keys are correctly set
- Verify API keys are active and have credits
- Check network connectivity

### **"No news articles match your criteria"**
- Verify NewsAPI key is set
- Check if you've exceeded daily limit
- Try broader search terms

### **Empty responses or errors**
- Check browser console for detailed errors
- Verify backend server is running
- Check API endpoints are accessible

## Security Notes

- Never commit `.env` file to version control
- Rotate API keys regularly
- Monitor API usage and costs
- Use environment-specific keys for production

## Need Help?

The AI Assistant includes:
- **Popular Questions** sidebar for inspiration
- **Assistant Status** showing current model and capabilities  
- **Conversation History** for context
- **Copy Response** feature for sharing insights

---

## 🎉 You're Ready!

Your AI Financial Assistant is now ready to provide intelligent, data-driven financial insights. Start with simple questions and explore its capabilities!

**Pro Tip**: The assistant works best with specific questions about stocks, crypto, or market events. Try asking about recent news or specific ticker symbols for the most accurate, data-driven responses.