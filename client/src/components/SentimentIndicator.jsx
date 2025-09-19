import React from 'react'
import './SentimentIndicator.css'

function SentimentIndicator({ sentiment, showLabel = true, size = 'medium' }) {
  if (!sentiment) {
    return null
  }

  const getSentimentData = (sentimentScore) => {
    if (sentimentScore >= 0.1) {
      return {
        label: 'Positive',
        color: '#10b981',
        icon: '📈',
        bgColor: 'rgba(16, 185, 129, 0.1)',
      }
    } else if (sentimentScore <= -0.1) {
      return {
        label: 'Negative',
        color: '#ef4444',
        icon: '📉',
        bgColor: 'rgba(239, 68, 68, 0.1)',
      }
    } else {
      return {
        label: 'Neutral',
        color: '#6b7280',
        icon: '➡️',
        bgColor: 'rgba(107, 114, 128, 0.1)',
      }
    }
  }

  const getSentimentPercentage = (score) => {
    // Convert score from -1 to 1 range to 0 to 100 percentage
    return Math.round(((score + 1) / 2) * 100)
  }

  const sentimentData = getSentimentData(sentiment.score)
  const percentage = getSentimentPercentage(sentiment.score)

  return (
    <div className={`sentiment-indicator ${size}`}>
      {/* Compact Version */}
      <div className="sentiment-compact">
        <span 
          className="sentiment-badge"
          style={{ 
            backgroundColor: sentimentData.bgColor,
            color: sentimentData.color,
            borderColor: sentimentData.color,
          }}
        >
          <span className="sentiment-icon">{sentimentData.icon}</span>
          {showLabel && <span className="sentiment-label">{sentimentData.label}</span>}
        </span>
        
        {sentiment.score !== undefined && (
          <span className="sentiment-score">
            {sentiment.score > 0 ? '+' : ''}{(sentiment.score * 100).toFixed(1)}%
          </span>
        )}
      </div>

      {/* Detailed Version with Progress Bar */}
      {size === 'large' && (
        <div className="sentiment-detailed">
          <div className="sentiment-bar-container">
            <div className="sentiment-labels">
              <span className="negative-label">Negative</span>
              <span className="neutral-label">Neutral</span>
              <span className="positive-label">Positive</span>
            </div>
            
            <div className="sentiment-bar">
              <div 
                className="sentiment-fill"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: sentimentData.color,
                }}
              />
              <div 
                className="sentiment-marker"
                style={{
                  left: `${percentage}%`,
                  borderColor: sentimentData.color,
                }}
              />
            </div>
            
            <div className="sentiment-values">
              <span>-100%</span>
              <span>0%</span>
              <span>+100%</span>
            </div>
          </div>
          
          {sentiment.confidence && (
            <div className="sentiment-confidence">
              <span>Confidence: {(sentiment.confidence * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Component for showing multiple sentiment sources
export function SentimentSummary({ sentiments, ticker }) {
  if (!sentiments || sentiments.length === 0) {
    return (
      <div className="sentiment-summary">
        <h4>📊 Sentiment Analysis</h4>
        <p className="no-sentiment">No sentiment data available for {ticker}</p>
      </div>
    )
  }

  // Calculate average sentiment
  const avgSentiment = sentiments.reduce((sum, item) => sum + item.score, 0) / sentiments.length
  const avgConfidence = sentiments.reduce((sum, item) => sum + (item.confidence || 0), 0) / sentiments.length

  const aggregatedSentiment = {
    score: avgSentiment,
    confidence: avgConfidence,
  }

  return (
    <div className="sentiment-summary">
      <div className="sentiment-header">
        <h4>📊 Sentiment Analysis</h4>
        <span className="sentiment-count">{sentiments.length} sources</span>
      </div>
      
      <div className="overall-sentiment">
        <div className="overall-label">Overall Sentiment:</div>
        <SentimentIndicator 
          sentiment={aggregatedSentiment} 
          size="large" 
        />
      </div>
      
      {sentiments.length > 1 && (
        <div className="sentiment-breakdown">
          <div className="breakdown-title">Source Breakdown:</div>
          <div className="sentiment-sources">
            {sentiments.map((sentiment, index) => (
              <div key={index} className="sentiment-source">
                <span className="source-name">
                  {sentiment.source || `Source ${index + 1}`}
                </span>
                <SentimentIndicator 
                  sentiment={sentiment} 
                  size="small" 
                  showLabel={false}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SentimentIndicator