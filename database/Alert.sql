{
  "name": "Alert",
  "type": "object",
  "properties": {
    "ticker_symbol": {
      "type": "string",
      "description": "Associated ticker symbol"
    },
    "alert_type": {
      "type": "string",
      "enum": [
        "price_target",
        "price_change",
        "volume_spike",
        "news_sentiment",
        "technical_indicator"
      ],
      "description": "Type of alert"
    },
    "condition": {
      "type": "string",
      "description": "Alert condition (e.g., 'price above 150', 'volume > 1M')"
    },
    "target_value": {
      "type": "number",
      "description": "Target value for the alert"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether alert is active"
    },
    "triggered_at": {
      "type": "string",
      "format": "date-time",
      "description": "When alert was triggered"
    },
    "message": {
      "type": "string",
      "description": "Alert message"
    },
    "priority": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high"
      ],
      "default": "medium",
      "description": "Alert priority level"
    }
  },
  "required": [
    "ticker_symbol",
    "alert_type",
    "condition"
  ]
}