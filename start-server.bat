@echo off
echo Starting TickerTracker Backend Server...
echo.

cd /d "D:\TickerTracker-DataQuest\src\backend"
echo Backend server starting on http://localhost:5000
echo AI Chat API available at http://localhost:5000/api/chat/ask
echo Health check: http://localhost:5000/health
echo.

node server.js

pause