{
  "name": "Ticker",
  "type": "object",
  "properties": {
    "symbol": {
      "type": "string",
      "description": "Ticker symbol (e.g., AAPL, TSLA, BTC)"
    },
    "name": {
      "type": "string",
      "description": "Company or asset name"
    },
    "market": {
      "type": "string",
      "enum": [
        "us_stock",
        "indian_stock",
        "crypto",
        "forex"
      ],
      "description": "Market category"
    },
    "current_price": {
      "type": "number",
      "description": "Current price"
    },
    "price_change": {
      "type": "number",
      "description": "Price change from previous close"
    },
    "price_change_percent": {
      "type": "number",
      "description": "Percentage change from previous close"
    },
    "volume": {
      "type": "number",
      "description": "Trading volume"
    },
    "market_cap": {
      "type": "number",
      "description": "Market capitalization"
    },
    "sector": {
      "type": "string",
      "description": "Industry sector"
    },
    "last_updated": {
      "type": "string",
      "format": "date-time",
      "description": "Last price update timestamp"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether ticker is actively tracked"
    },
    "sentiment_score": {
      "type": "number",
      "description": "Overall sentiment score (-1 to 1)"
    },
    "news_count": {
      "type": "integer",
      "description": "Number of recent news items"
    }
  },
  "required": [
    "symbol",
    "name",
    "market"
  ]
}