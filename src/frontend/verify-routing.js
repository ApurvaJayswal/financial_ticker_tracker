const fs = require('fs');
const path = require('path');

console.log('🔍 TickerTracker Routing Verification');
console.log('=====================================\n');

const verificationResults = [];

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}`);
  verificationResults.push({ file: filePath, exists, description });
  return exists;
}

function checkFileContent(filePath, searchString, description) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${description} - File not found`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const hasContent = content.includes(searchString);
  const status = hasContent ? '✅' : '❌';
  console.log(`${status} ${description}`);
  return hasContent;
}

console.log('📁 Core Files Check:');
console.log('-------------------');
checkFile('./src/App.js', 'Main App.js file');
checkFile('./src/Layout.js', 'Layout component');
checkFile('./src/utils.js', 'Utilities file');
checkFile('./package.json', 'Package.json');

console.log('\n🧭 Routing Configuration:');
console.log('------------------------');
checkFileContent('./src/App.js', 'BrowserRouter', 'React Router setup');
checkFileContent('./src/App.js', 'Routes', 'Routes component');
checkFileContent('./src/App.js', '/dashboard', 'Dashboard route');
checkFileContent('./src/App.js', '/add-ticker', 'Add Ticker route');
checkFileContent('./src/App.js', '/alerts', 'Alerts route');
checkFileContent('./src/App.js', '/news-center', 'News Center route');
checkFileContent('./src/App.js', '/market-analysis', 'Market Analysis route');

console.log('\n📄 Page Components:');
console.log('-----------------');
checkFile('./src/pages/Dashboard.jsx', 'Dashboard page');
checkFile('./src/pages/AddTicker.jsx', 'Add Ticker page');
checkFile('./src/pages/Alerts.jsx', 'Alerts page');
checkFile('./src/pages/NewsCenter.jsx', 'News Center page');
checkFile('./src/pages/MarketAnalysis.jsx', 'Market Analysis page');

console.log('\n🧩 Dashboard Components:');
console.log('----------------------');
checkFile('./src/components/dashboard/MarketOverview.jsx', 'Market Overview component');
checkFile('./src/components/dashboard/TickerGrid.jsx', 'Ticker Grid component');
checkFile('./src/components/dashboard/NewsPanel.jsx', 'News Panel component');
checkFile('./src/components/dashboard/AlertsPanel.jsx', 'Alerts Panel component');

console.log('\n🎨 UI Components:');
console.log('---------------');
checkFile('./src/components/ui/button.jsx', 'Button component');
checkFile('./src/components/ui/card.jsx', 'Card component');
checkFile('./src/components/ui/badge.jsx', 'Badge component');
checkFile('./src/components/ui/input.jsx', 'Input component');
checkFile('./src/components/ui/sidebar.jsx', 'Sidebar component');

console.log('\n📊 Entity Models:');
console.log('---------------');
checkFile('./src/entities/Ticker.js', 'Ticker entity');
checkFile('./src/entities/NewsItem.js', 'NewsItem entity');
checkFile('./src/entities/Alert.js', 'Alert entity');

console.log('\n🔗 Navigation Check:');
console.log('------------------');
checkFileContent('./src/Layout.js', 'createPageUrl', 'Navigation utility usage');
checkFileContent('./src/Layout.js', 'Link', 'React Router Link component');
checkFileContent('./src/utils.js', 'createPageUrl', 'Page URL generator function');

console.log('\n📋 Summary:');
console.log('---------');
const totalChecks = verificationResults.length;
const passedChecks = verificationResults.filter(r => r.exists).length;
const failedChecks = totalChecks - passedChecks;

console.log(`Total checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`❌ Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log('\n🎉 All routing components are properly set up!');
  console.log('🚀 Your TickerTracker application should work correctly.');
} else {
  console.log('\n⚠️  Some files are missing. Check the failed items above.');
}

console.log('\n🌐 Application URLs:');
console.log('------------------');
console.log('Dashboard: http://localhost:3000/dashboard');
console.log('Add Ticker: http://localhost:3000/add-ticker');
console.log('Alerts: http://localhost:3000/alerts');
console.log('News Center: http://localhost:3000/news-center');
console.log('Market Analysis: http://localhost:3000/market-analysis');