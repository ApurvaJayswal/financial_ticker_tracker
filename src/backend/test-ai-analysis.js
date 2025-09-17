const AIAnalysisService = require('./services/aiAnalysisService');
const APIIntegrationService = require('./services/apiIntegrationService');
require('dotenv').config();

async function testAIAnalysisWithRealData() {
  console.log('🧠 Testing AI Analysis with Real Market Data...\n');
  
  const aiService = new AIAnalysisService();
  const apiService = new APIIntegrationService();
  
  try {
    // Fetch real market data
    console.log('📡 Fetching real market data...');
    const marketData = await apiService.fetchComprehensiveMarketData({
      stockSymbols: ['AAPL', 'GOOGL', 'TSLA', 'MSFT'],
      cryptoCoins: ['bitcoin', 'ethereum'],
      newsQuery: 'stock market earnings technology',
      includeHistorical: false
    });

    console.log(`✅ Fetched data from: ${marketData.metadata.data_sources.join(', ')}`);
    console.log(`   Total tickers: ${marketData.metadata.total_tickers}`);
    console.log(`   News articles: ${marketData.metadata.news_count}`);
    console.log('');

    // Generate AI Market Summary
    console.log('🤖 Generating AI Market Summary...');
    const marketSummary = await aiService.generateMarketSummary(
      marketData.tickers, 
      marketData.news, 
      '1d'
    );

    console.log('📊 Market Summary Results:');
    console.log(`   AI Summary: ${marketSummary.summary}`);
    console.log(`   Market Trend: ${marketSummary.trends.trend} (${marketSummary.trends.strength})`);
    console.log(`   Sentiment: ${marketSummary.sentiment.overall} (${Math.round(marketSummary.sentiment.confidence * 100)}% confidence)`);
    console.log(`   Market Health: ${marketSummary.metrics.marketHealth}`);
    console.log(`   Gainers/Losers: ${marketSummary.metrics.gainers}/${marketSummary.metrics.losers}`);
    console.log('');

    // Test individual ticker analysis
    console.log('🎯 Testing Individual Ticker Analysis...');
    if (marketData.tickers.length > 0) {
      const sampleTicker = marketData.tickers[0];
      console.log(`   Analyzing: ${sampleTicker.symbol} (${sampleTicker.name})`);
      
      const tickerAnalysis = await aiService.generateTickerAnalysis(
        sampleTicker,
        [], // No historical data for now
        marketData.news
      );

      console.log(`   Analysis: ${tickerAnalysis.analysis}`);
      console.log(`   Momentum: ${tickerAnalysis.momentum.trend} (${tickerAnalysis.momentum.strength})`);
      console.log(`   Risk Level: ${tickerAnalysis.riskAnalysis.level}`);
    }
    console.log('');

    // Test sector analysis
    console.log('🏭 Sector Performance Analysis:');
    Object.entries(marketSummary.sectors).forEach(([sector, data]) => {
      console.log(`   ${sector}: ${data.averageChange > 0 ? '+' : ''}${data.averageChange.toFixed(2)}% (${data.tickerCount} stocks)`);
    });
    console.log('');

    // Test recommendations
    console.log('💡 AI Recommendations:');
    if (marketSummary.recommendations.length > 0) {
      marketSummary.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.type.toUpperCase()}] ${rec.message} (${rec.confidence} confidence)`);
      });
    } else {
      console.log('   No specific recommendations at this time.');
    }
    console.log('');

    // Test market signals
    console.log('⚡ Market Signals:');
    if (marketSummary.trends.signals.length > 0) {
      marketSummary.trends.signals.forEach((signal, index) => {
        console.log(`   ${index + 1}. ${signal}`);
      });
    }
    console.log('');

    console.log('🎉 AI Analysis with Real Data Complete!');
    console.log(`📈 Summary: ${marketSummary.trends.trend.toUpperCase()} market with ${marketSummary.sentiment.overall} sentiment`);

  } catch (error) {
    console.error('❌ AI Analysis Test Error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testAIAnalysisWithRealData().catch(console.error);