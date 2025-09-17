# TickerTracker Backend Startup Script
Write-Host "🚀 Starting TickerTracker Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
Set-Location "D:\TickerTracker-DataQuest\src\backend"

# Check if port 5000 is available
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "⚠️  Port 5000 is already in use. Killing existing processes..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

Write-Host "📊 Backend server will start on http://localhost:5000" -ForegroundColor Green
Write-Host "🤖 AI Chat API available at http://localhost:5000/api/chat/ask" -ForegroundColor Green
Write-Host "❤️  Health check: http://localhost:5000/health" -ForegroundColor Green
Write-Host ""
Write-Host "💡 The AI Assistant works without any API keys needed!" -ForegroundColor Magenta
Write-Host "   It provides intelligent responses using real-time market data" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "----------------------------------------" -ForegroundColor Gray

# Start the server
npm start