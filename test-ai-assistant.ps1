# Test TickerTracker AI Assistant
Write-Host "🧪 Testing TickerTracker AI Assistant..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$headers = @{'Content-Type' = 'application/json'}

# Test 1: Health Check
Write-Host "1️⃣ Testing server health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET
    Write-Host "   ✅ Server is running - Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Server is not running. Please start it first with: .\start-backend.ps1" -ForegroundColor Red
    exit 1
}

# Test 2: Stock Analysis
Write-Host "2️⃣ Testing stock analysis (AAPL)..." -ForegroundColor Yellow
try {
    $stockQuery = @{question = 'How is AAPL stock doing?'; userId = 'test'} | ConvertTo-Json
    $stockResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/ask" -Method POST -Headers $headers -Body $stockQuery
    
    Write-Host "   ✅ Stock analysis working!" -ForegroundColor Green
    Write-Host "   📊 Response preview:" -ForegroundColor Gray
    $preview = $stockResponse.data.response.Split("`n")[0..2] -join "`n"
    Write-Host "   $preview..." -ForegroundColor White
} catch {
    Write-Host "   ❌ Stock analysis failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Market Overview
Write-Host "3️⃣ Testing market overview..." -ForegroundColor Yellow
try {
    $marketQuery = @{question = 'How is the market today?'; userId = 'test'} | ConvertTo-Json
    $marketResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/ask" -Method POST -Headers $headers -Body $marketQuery
    
    Write-Host "   ✅ Market overview working!" -ForegroundColor Green
    Write-Host "   📈 Response preview:" -ForegroundColor Gray
    $preview = $marketResponse.data.response.Split("`n")[0..2] -join "`n"
    Write-Host "   $preview..." -ForegroundColor White
} catch {
    Write-Host "   ❌ Market overview failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Educational Query
Write-Host "4️⃣ Testing educational content..." -ForegroundColor Yellow
try {
    $eduQuery = @{question = 'What is a P/E ratio?'; userId = 'test'} | ConvertTo-Json
    $eduResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/ask" -Method POST -Headers $headers -Body $eduQuery
    
    Write-Host "   ✅ Educational content working!" -ForegroundColor Green
    Write-Host "   🎓 Response preview:" -ForegroundColor Gray
    $preview = $eduResponse.data.response.Split("`n")[0..2] -join "`n"
    Write-Host "   $preview..." -ForegroundColor White
} catch {
    Write-Host "   ❌ Educational content failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Popular Questions
Write-Host "5️⃣ Testing popular questions API..." -ForegroundColor Yellow
try {
    $popularResponse = Invoke-RestMethod -Uri "$baseUrl/api/chat/popular-questions" -Method GET
    Write-Host "   ✅ Popular questions working!" -ForegroundColor Green
    Write-Host "   📝 Found $($popularResponse.data.categories.Count) question categories" -ForegroundColor White
} catch {
    Write-Host "   ❌ Popular questions failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 AI Assistant testing complete!" -ForegroundColor Magenta
Write-Host "✨ Your financial AI is ready to use!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the frontend: cd src/frontend && npm start" -ForegroundColor White
Write-Host "2. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "3. Click the 'AI Assistant' card on the dashboard" -ForegroundColor White