{
  "name": "NewsItem",
  "type": "object",
  "properties": {
    "ticker_symbol": {
      "type": "string",
      "description": "Associated ticker symbol"
    },
    "headline": {
      "type": "string",
      "description": "News headline"
    },
    "summary": {
      "type": "string",
      "description": "Brief summary of the news"
    },
    "source": {
      "type": "string",
      "description": "News source (Reuters, Bloomberg, etc.)"
    },
    "url": {
      "type": "string",
      "description": "Link to full article"
    },
    "published_at": {
      "type": "string",
      "format": "date-time",
      "description": "Publication timestamp"
    },
    "sentiment": {
      "type": "string",
      "enum": [
        "positive",
        "negative",
        "neutral"
      ],
      "description": "Analyzed sentiment"
    },
    "sentiment_score": {
      "type": "number",
      "description": "Sentiment score (-1 to 1)"
    },
    "impact_level": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "default": "low",
      "description": "Potential market impact"
    },
    "keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Extracted keywords"
    }
  },
  "required": [
    "ticker_symbol",
    "headline",
    "source",
    "published_at"
  ]
}