# TickerTracker Frontend

A modern React-based dashboard for tracking stocks and cryptocurrencies with real-time updates, AI-powered insights, and sentiment analysis.

## 🚀 Features

### Core Components

- **TickerSearch**: Interactive search with autocomplete for stocks, crypto, and international markets
- **PricePanel**: Real-time price display with current price, volume, and key statistics  
- **Chart**: Interactive price charts with multiple time periods (1D, 5D, 1M, 3M, 6M, 1Y)
- **NewsList**: Latest news with sentiment indicators and AI-powered summaries
- **SentimentIndicator**: Visual sentiment analysis with detailed breakdowns
- **AIChat**: Conversational AI assistant for ticker analysis and Q&A

### Features

- 📊 **Real-time Data**: Live price updates via WebSocket connections
- 🤖 **AI Integration**: OpenAI-powered news summaries and Q&A
- 📈 **Interactive Charts**: Historical and intraday price visualization
- 🎯 **Sentiment Analysis**: News and social sentiment scoring
- 📱 **Responsive Design**: Mobile-first responsive layout
- 🌙 **Dark Mode**: Automatic dark mode support
- ⚡ **Fast Performance**: Optimized with Vite and modern React patterns

## 🛠️ Tech Stack

- **React 19.1.1** - UI Framework
- **Vite 7.1.6** - Build tool and dev server
- **Chart.js & react-chartjs-2** - Interactive charts
- **Socket.IO Client** - Real-time WebSocket connections  
- **Axios** - HTTP client for API requests
- **React Router Dom** - Client-side routing
- **CSS3** - Modern styling with flexbox/grid and animations

## 🏗️ Project Structure

```
client/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── TickerSearch.jsx     # Ticker search with autocomplete
│   │   ├── PricePanel.jsx       # Price display and stats
│   │   ├── Chart.jsx            # Interactive price charts
│   │   ├── NewsList.jsx         # News feed with sentiment
│   │   ├── SentimentIndicator.jsx # Sentiment visualization
│   │   ├── AIChat.jsx           # AI chat interface
│   │   ├── Layout.jsx           # App layout and navigation
│   │   └── *.css                # Component styles
│   ├── pages/               # Page components
│   │   ├── Dashboard.jsx        # Main dashboard page
│   │   ├── Watchlist.jsx        # User watchlists
│   │   └── *.css                # Page styles
│   ├── services/            # API and WebSocket services
│   │   ├── api.js               # HTTP API client
│   │   └── websocket.js         # WebSocket service
│   ├── App.jsx              # Root component
│   ├── main.jsx             # App entry point
│   └── index.css            # Global styles
├── public/
│   └── index.html           # HTML template
├── .env                     # Environment variables
├── .env.example             # Environment template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Running backend server on `http://localhost:4000`

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd financial_ticker_tracker_project/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL if different
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 🎨 Component Usage

### TickerSearch
```jsx
<TickerSearch 
  onTickerSelect={(ticker) => console.log(ticker)} 
/>
```

### PricePanel
```jsx
<PricePanel 
  ticker="AAPL"
  priceData={priceData}
  setPriceData={setPriceData}
  loading={loading}
  setLoading={setLoading}
/>
```

### Chart
```jsx
<Chart 
  ticker="AAPL" 
  currentPrice={150.50}
/>
```

### NewsList
```jsx
<NewsList 
  ticker="AAPL"
  newsData={newsData}
  setNewsData={setNewsData}
/>
```

### AIChat
```jsx
<AIChat ticker="AAPL" />
```

## 🔌 API Integration

The frontend integrates with your backend APIs:

- **Price API**: `/api/price?ticker={symbol}`
- **Historical Data**: `/api/price/historical?ticker={symbol}&period={period}`
- **News API**: `/api/news?ticker={symbol}`
- **AI Chat**: `/api/ai/chat`
- **AI Summaries**: `/api/ai/summary`

### WebSocket Events

- `priceUpdate` - Real-time price changes
- `newsUpdate` - New articles published
- `subscribe`/`unsubscribe` - Ticker subscriptions

## 🎯 Supported Markets

- **US Stocks**: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META
- **Indian Stocks**: TCS.NS, RELIANCE.NS, INFY.NS
- **Cryptocurrencies**: BTC-USD, ETH-USD, BNB-USD

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px  
- **Mobile**: 320px - 767px

## 🌙 Dark Mode

Automatic dark mode support based on system preferences using `prefers-color-scheme`.

## 🔧 Configuration

Environment variables (`.env`):

```env
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
VITE_NODE_ENV=development
VITE_DEBUG=false
```

## 🚀 Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder to your hosting platform:**
   - Vercel
   - Netlify  
   - AWS S3 + CloudFront
   - GitHub Pages

## 📝 Next Steps

To complete your TickerTracker application:

1. **Ensure Backend is Running**: The frontend expects your backend at `http://localhost:4000`
2. **Test Components**: All components are ready and should work with your existing backend APIs
3. **Customize Styling**: Modify CSS files to match your brand
4. **Add More Tickers**: Extend the `POPULAR_TICKERS` array in `TickerSearch.jsx`
5. **Deploy**: Build and deploy both frontend and backend

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**: Check if backend is running on port 4000
2. **WebSocket Issues**: Verify WebSocket server is properly configured
3. **Chart Not Displaying**: Ensure Chart.js dependencies are installed
4. **Build Errors**: Check Node.js version (18+ required)

## 📄 License

This project is part of the TickerTracker application. See the main project README for license information.

---

Built with ❤️ using React and modern web technologies.