# TickerTracker Backend API

A robust MERN stack backend for the TickerTracker financial analysis application.

## 🏗️ Architecture

This backend is built with the MERN stack:
- **MongoDB**: Document-based database for storing financial data
- **Express.js**: Web framework for building RESTful APIs
- **Node.js**: Runtime environment

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── tickerController.js  # Ticker CRUD operations
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── Ticker.js            # Ticker schema & model
│   ├── News.js              # News schema & model
│   └── Alert.js             # Alert schema & model
├── routes/
│   ├── tickers.js           # Ticker routes with validation
│   ├── news.js              # News routes (placeholder)
│   ├── alerts.js            # Alerts routes (placeholder)
│   ├── markets.js           # Market routes (placeholder)
│   ├── auth.js              # Authentication routes (placeholder)
│   └── ml.js                # ML/AI routes (placeholder)
├── utils/
│   └── logger.js            # Winston logger configuration
├── logs/                    # Log files directory
├── server.js                # Main application entry point
├── simple-server.js         # Simplified server without DB
└── .env                     # Environment variables
```

## 🚀 Features Implemented

### ✅ Core Infrastructure
- **Express.js server** with comprehensive middleware stack
- **Security** with Helmet, CORS, rate limiting
- **Logging** with Winston (console, file, and error logging)
- **Error handling** with custom error classes and global error handler
- **Request validation** using express-validator
- **Database connection** with MongoDB using Mongoose

### ✅ Ticker Management API
- **Full CRUD operations** for financial tickers
- **Advanced filtering** by market, sector, price range, market cap
- **Search functionality** across symbol, name, and sector
- **Pagination** with metadata (page, total, has_next, etc.)
- **Sorting** with multiple field support
- **Market statistics** and analytics endpoints
- **Top gainers/losers** endpoints

### ✅ Data Models
- **Ticker Model**: Comprehensive schema with 25+ fields including:
  - Basic info (symbol, name, market, sector)
  - Price data (current_price, changes, volume, market_cap)
  - Advanced metrics (PE ratio, beta, dividend yield)
  - Meta information (sentiment, news count, last updated)
  - Virtual fields for market status and price trends
  - Instance methods for price updates and calculations
  - Static methods for filtering and analytics

- **News Model**: Full-featured news schema with:
  - Article details (title, summary, content, URL, source)
  - Categorization and tagging
  - Sentiment analysis fields
  - Related tickers association
  - Engagement metrics (views, shares)
  - Text search capabilities

- **Alert Model**: Advanced alert system with:
  - Multiple alert types and conditions
  - Trigger history and constraints
  - Notification methods (email, SMS, webhook)
  - Priority levels and expiration
  - Smart virtual fields for status checking

## 🛠️ API Endpoints

### Ticker Endpoints
- `GET /api/tickers` - List tickers with filtering/pagination
- `GET /api/tickers/:id` - Get ticker by ID
- `GET /api/tickers/symbol/:symbol` - Get ticker by symbol
- `POST /api/tickers` - Create new ticker
- `PUT /api/tickers/:id` - Update ticker
- `PATCH /api/tickers/:id/price` - Update ticker price
- `DELETE /api/tickers/:id` - Delete ticker
- `GET /api/tickers/search` - Search tickers
- `GET /api/tickers/stats/market` - Market statistics
- `GET /api/tickers/top/gainers` - Top gaining stocks
- `GET /api/tickers/top/losers` - Top losing stocks

### Other Endpoints (Placeholders)
- `/api/news/*` - News management
- `/api/alerts/*` - Alert management
- `/api/markets/*` - Market data
- `/api/auth/*` - Authentication
- `/api/ml/*` - AI/ML services

## 🔧 Configuration

### Environment Variables
```bash
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/ticker-tracker

# Security
JWT_SECRET=your-jwt-secret

# External APIs
ALPHA_VANTAGE_API_KEY=your-api-key
FINNHUB_API_KEY=your-api-key

# Logging
LOG_LEVEL=info
```

## 🚦 Running the Server

### Simple Server (No Database Required)
```bash
node simple-server.js
```
This runs a basic Express server with mock data, perfect for frontend development.

### Full Server (Requires MongoDB)
```bash
npm start
# or
node server.js
```

## 📊 Logging & Monitoring

- **Winston logger** with multiple transport levels
- **Request logging** with Morgan
- **Error tracking** with separate error logs
- **Database operation logging**
- **API endpoint logging** with metadata

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** and sanitization
- **MongoDB injection protection**
- **Error information filtering** (production vs development)

## 🧪 Testing Support

- **Validation testing** with express-validator
- **Error scenario handling**
- **Mock data support** for development
- **Health check endpoints**

## 📈 Performance Features

- **Database indexing** on frequently queried fields
- **Lean queries** for improved performance
- **Pagination** to limit response sizes
- **Compression middleware**
- **Connection pooling** with MongoDB

## 🎯 Next Steps

1. **Set up MongoDB** locally or use MongoDB Atlas
2. **Implement remaining controllers** (News, Alerts, Markets)
3. **Add authentication** with JWT
4. **Integrate external APIs** (Alpha Vantage, Finnhub)
5. **Implement ML/AI features** for sentiment analysis
6. **Add comprehensive tests**
7. **Deploy to cloud** (AWS, Heroku, etc.)

## 🔗 Frontend Integration

The backend is designed to work seamlessly with the React frontend. The simple-server provides mock data that matches the expected API format, allowing frontend development to continue while the full database setup is completed.

Current status: ✅ **Backend is functional and serving mock data to the frontend successfully!**