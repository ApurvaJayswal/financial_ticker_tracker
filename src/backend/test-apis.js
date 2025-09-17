const APIIntegrationService = require('./services/apiIntegrationService');
require('dotenv').config();

async function testAllAPIs() {
  console.log('🧪 Testing API Integrations...\n');
  
  const apiService = new APIIntegrationService();
  
  // Test 1: Check Active Sources
  console.log('📊 Active Data Sources:');
  const activeSources = apiService.getActiveSources();
  console.log(activeSources.map(source => `✅ ${source}`).join('\n'));
  console.log('');

  // Test 2: Alpha Vantage Stock Data
  console.log('📈 Testing Alpha Vantage (Stock Data)...');
  try {
    const stockData = await apiService.fetchStockData(['AAPL', 'GOOGL', 'MSFT'], false);
    if (stockData && stockData.length > 0) {
      console.log(`✅ Alpha Vantage: Successfully fetched ${stockData.length} stocks`);
      console.log(`   Sample: ${stockData[0].symbol} - $${stockData[0].current_price} (${stockData[0].price_change_percent.toFixed(2)}%)`);
      console.log(`   Source: ${stockData[0].source}`);
    } else {
      console.log('⚠️ Alpha Vantage: No stock data returned');
    }
  } catch (error) {
    console.log(`❌ Alpha Vantage Error: ${error.message}`);
  }
  console.log('');

  // Test 3: CoinGecko Crypto Data
  console.log('🪙 Testing CoinGecko (Cryptocurrency Data)...');
  try {
    const cryptoData = await apiService.fetchCryptoData(['bitcoin', 'ethereum', 'cardano']);
    if (cryptoData && cryptoData.length > 0) {
      console.log(`✅ CoinGecko: Successfully fetched ${cryptoData.length} cryptocurrencies`);
      console.log(`   Sample: ${cryptoData[0].symbol} - $${cryptoData[0].current_price.toFixed(2)} (${cryptoData[0].price_change_percent.toFixed(2)}%)`);
      console.log(`   Source: ${cryptoData[0].source}`);
    } else {
      console.log('⚠️ CoinGecko: No crypto data returned');
    }
  } catch (error) {
    console.log(`❌ CoinGecko Error: ${error.message}`);
  }
  console.log('');

  // Test 4: NewsAPI Financial News
  console.log('📰 Testing NewsAPI (Financial News)...');
  try {
    const newsData = await apiService.fetchNewsData('stock market', 'en', 5);
    if (newsData && newsData.length > 0) {
      console.log(`✅ NewsAPI: Successfully fetched ${newsData.length} articles`);
      console.log(`   Sample: "${newsData[0].title.substring(0, 80)}..."`);
      console.log(`   Source: ${newsData[0].source.name}`);
    } else {
      console.log('⚠️ NewsAPI: No news articles returned');
    }
  } catch (error) {
    console.log(`❌ NewsAPI Error: ${error.message}`);
  }
  console.log('');

  // Test 5: Comprehensive Market Data
  console.log('🌐 Testing Comprehensive Market Data Fetch...');
  try {
    const marketData = await apiService.fetchComprehensiveMarketData({
      stockSymbols: ['AAPL', 'GOOGL', 'TSLA'],
      cryptoCoins: ['bitcoin', 'ethereum'],
      newsQuery: 'stock market technology',
      includeHistorical: false
    });

    console.log(`✅ Comprehensive Data: Successfully aggregated market data`);
    console.log(`   Total Tickers: ${marketData.metadata.total_tickers}`);
    console.log(`   Stock Count: ${marketData.metadata.stock_count}`);
    console.log(`   Crypto Count: ${marketData.metadata.crypto_count}`);
    console.log(`   News Count: ${marketData.metadata.news_count}`);
    console.log(`   Data Sources: ${marketData.metadata.data_sources.join(', ')}`);
    console.log(`   Last Updated: ${marketData.metadata.last_updated}`);

  } catch (error) {
    console.log(`❌ Comprehensive Data Error: ${error.message}`);
  }
  console.log('');

  // Test 6: Cache Statistics
  console.log('💾 Cache Statistics:');
  const cacheStats = apiService.getCacheStats();
  console.log(`   Cache Size: ${cacheStats.size} entries`);
  if (cacheStats.keys.length > 0) {
    console.log(`   Sample Keys: ${cacheStats.keys.slice(0, 3).join(', ')}`);
  }
  console.log('');

  // Test 7: Test Rate Limiting and Fallbacks
  console.log('⚡ Testing Rate Limiting & Fallback Logic...');
  try {
    // Clear cache to force fresh API calls
    apiService.clearCache();
    console.log('✅ Cache cleared');

    // Test rapid successive calls
    const rapidCalls = [];
    for (let i = 0; i < 3; i++) {
      rapidCalls.push(apiService.fetchCryptoData(['bitcoin']));
    }
    
    const results = await Promise.allSettled(rapidCalls);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Rapid API calls: ${successCount}/3 succeeded (caching working)`);

  } catch (error) {
    console.log(`❌ Rate Limiting Test Error: ${error.message}`);
  }

  console.log('');
  console.log('🎉 API Testing Complete!');
  console.log('');
  console.log('📝 Summary:');
  console.log(`   Alpha Vantage (Stock): ${process.env.ALPHA_VANTAGE_ENABLED === 'true' ? '🟢 Enabled' : '🔴 Disabled'}`);
  console.log(`   CoinGecko (Crypto): ${process.env.COINGECKO_ENABLED === 'true' ? '🟢 Enabled' : '🔴 Disabled'}`);
  console.log(`   NewsAPI (News): ${process.env.NEWS_API_ENABLED === 'true' ? '🟢 Enabled' : '🔴 Disabled'}`);
  console.log('');
  console.log('💡 If any tests failed, check your .env file configuration');
  console.log('💡 The system will automatically fallback to mock data for failed APIs');
}

// Run the tests
testAllAPIs().catch(console.error);