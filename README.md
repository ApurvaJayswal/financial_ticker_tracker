# TickerTracker DataQuest

A comprehensive ticker tracking application with real-time data analysis, built with React and Node.js.

## Project Structure

```
TickerTracker-DataQuest/
├── docs/                           # Documentation files
│   ├── BACKEND-FIXES-SUMMARY.md
│   ├── PROJECT-STATUS.md
│   ├── REAL_TIME_SETUP.md
│   └── ROUTING-IMPLEMENTATION-SUMMARY.md
├── src/
│   ├── frontend/                   # React frontend application
│   │   ├── public/                 # Public assets
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components
│   │   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   │   └── ui/             # Base UI components
│   │   │   ├── pages/              # Page components
│   │   │   ├── entities/           # Data models and entities
│   │   │   ├── integrations/       # External API integrations
│   │   │   └── assets/             # Frontend assets
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   └── postcss.config.js
│   └── backend/                    # Node.js backend server
│       ├── config/                 # Database and app configuration
│       ├── controllers/            # Route controllers
│       ├── middleware/             # Express middleware
│       ├── models/                 # Data models
│       ├── routes/                 # API routes
│       ├── utils/                  # Utility functions
│       ├── logs/                   # Application logs
│       └── package.json
├── database/                       # Database schemas and migrations
│   ├── Alert.sql
│   ├── NewsItem.sql
│   └── Ticker.sql
├── package.json                    # Root package.json with workspace config
├── .gitignore
└── README.md

```

## Features

- **Real-time ticker tracking** with live price updates
- **Interactive dashboard** with market overview and analysis
- **News integration** for market sentiment analysis
- **Custom alerts** system for price movements
- **Market analysis** tools and charts
- **Professional UI** with Jakarta Sans and Poppins fonts
- **Responsive design** with filtering functionality

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd TickerTracker-DataQuest
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   npm run install:all
   ```

### Development

1. Start the backend server:
   ```bash
   npm run dev:backend
   ```

2. Start the frontend development server:
   ```bash
   npm run dev:frontend
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build:frontend
```

## Tech Stack

### Frontend
- **React** - UI framework
- **Tailwind CSS** - Styling
- **Jakarta Sans & Poppins** - Typography
- **React Router** - Navigation

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Various middleware** - Error handling, logging

### Database
- **SQL-based** entity models
- **Structured schemas** for Tickers, Alerts, and News

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License