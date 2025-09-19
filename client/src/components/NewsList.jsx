import React, { useEffect, useState } from 'react'
import { newsAPI, aiAPI } from '../services/api'
import SentimentIndicator, { SentimentSummary } from './SentimentIndicator'
import websocketService from '../services/websocket'
import './NewsList.css'

function NewsList({ ticker, newsData, setNewsData }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expandedNews, setExpandedNews] = useState(new Set())
  const [summaries, setSummaries] = useState({})
  const [loadingSummaries, setLoadingSummaries] = useState(new Set())

  useEffect(() => {
    if (ticker) {
      fetchNews(ticker)
      setupNewsUpdates(ticker)
    }

    return () => {
      if (ticker) {
        websocketService.off('newsUpdate', handleNewsUpdate)
      }
    }
  }, [ticker])

  const fetchNews = async (symbol) => {
    setLoading(true)
    setError(null)

    try {
      const response = await newsAPI.getNews(symbol)
      setNewsData(response.data || [])
    } catch (err) {
      console.error('Failed to fetch news:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupNewsUpdates = (symbol) => {
    const handleNewsUpdate = (data) => {
      if (data.ticker === symbol) {
        setNewsData(prevNews => {
          // Check if news already exists
          const existingIds = new Set(prevNews.map(item => item.id))
          const newNews = data.news.filter(item => !existingIds.has(item.id))
          
          // Add new news to the beginning
          return [...newNews, ...prevNews].slice(0, 50) // Keep only 50 most recent
        })
      }
    }

    websocketService.on('newsUpdate', handleNewsUpdate)
  }

  const handleNewsUpdate = (data) => {
    if (data.ticker === ticker) {
      setNewsData(prevNews => {
        const existingIds = new Set(prevNews.map(item => item.id))
        const newNews = data.news.filter(item => !existingIds.has(item.id))
        return [...newNews, ...prevNews].slice(0, 50)
      })
    }
  }

  const toggleNewsExpansion = (newsId) => {
    setExpandedNews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(newsId)) {
        newSet.delete(newsId)
      } else {
        newSet.add(newsId)
      }
      return newSet
    })
  }

  const fetchNewsSummary = async (newsItem) => {
    if (summaries[newsItem.id] || loadingSummaries.has(newsItem.id)) {
      return
    }

    setLoadingSummaries(prev => new Set(prev).add(newsItem.id))

    try {
      const response = await aiAPI.getSummary(ticker, 'news')
      setSummaries(prev => ({
        ...prev,
        [newsItem.id]: response.summary
      }))
    } catch (err) {
      console.error('Failed to fetch summary:', err)
      setSummaries(prev => ({
        ...prev,
        [newsItem.id]: 'Failed to generate summary'
      }))
    } finally {
      setLoadingSummaries(prev => {
        const newSet = new Set(prev)
        newSet.delete(newsItem.id)
        return newSet
      })
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours)
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  const extractSentiments = (newsItems) => {
    return newsItems
      .filter(item => item.sentiment && typeof item.sentiment.score === 'number')
      .map(item => ({
        score: item.sentiment.score,
        confidence: item.sentiment.confidence,
        source: item.source,
      }))
  }

  const sentiments = extractSentiments(newsData)

  return (
    <div className="news-list">
      <div className="news-header">
        <h3>📰 Latest News - {ticker}</h3>
        {newsData.length > 0 && (
          <span className="news-count">{newsData.length} articles</span>
        )}
      </div>

      {/* Sentiment Summary */}
      {sentiments.length > 0 && (
        <SentimentSummary sentiments={sentiments} ticker={ticker} />
      )}

      {loading && (
        <div className="news-loading">
          <div className="loading-spinner"></div>
          <p>Loading news...</p>
        </div>
      )}

      {error && (
        <div className="news-error">
          <p>❌ {error}</p>
          <button 
            onClick={() => fetchNews(ticker)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && newsData.length === 0 && !error && (
        <div className="no-news">
          <p>📭 No news available for {ticker}</p>
        </div>
      )}

      <div className="news-items">
        {newsData.map((newsItem) => (
          <div key={newsItem.id} className="news-item">
            <div className="news-main">
              <div className="news-content">
                <h4 className="news-title">
                  <a 
                    href={newsItem.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="news-link"
                  >
                    {newsItem.title}
                  </a>
                </h4>
                
                {newsItem.description && (
                  <p className="news-description">
                    {newsItem.description}
                  </p>
                )}
              </div>

              {newsItem.sentiment && (
                <div className="news-sentiment">
                  <SentimentIndicator 
                    sentiment={newsItem.sentiment} 
                    size="small" 
                  />
                </div>
              )}
            </div>

            <div className="news-meta">
              <div className="news-info">
                <span className="news-source">{newsItem.source}</span>
                <span className="news-time">{formatTime(newsItem.publishedAt)}</span>
              </div>
              
              <div className="news-actions">
                <button
                  className="summary-button"
                  onClick={() => {
                    toggleNewsExpansion(newsItem.id)
                    if (!expandedNews.has(newsItem.id)) {
                      fetchNewsSummary(newsItem)
                    }
                  }}
                >
                  {expandedNews.has(newsItem.id) ? 'Hide Summary' : 'AI Summary'}
                </button>
              </div>
            </div>

            {expandedNews.has(newsItem.id) && (
              <div className="news-summary">
                {loadingSummaries.has(newsItem.id) ? (
                  <div className="summary-loading">
                    <div className="loading-spinner small"></div>
                    <span>Generating summary...</span>
                  </div>
                ) : summaries[newsItem.id] ? (
                  <div className="summary-content">
                    <h5>🤖 AI Summary:</h5>
                    <p>{summaries[newsItem.id]}</p>
                  </div>
                ) : (
                  <div className="summary-error">
                    Failed to generate summary
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {newsData.length > 10 && (
        <div className="news-footer">
          <button 
            className="load-more-button"
            onClick={() => fetchNews(ticker)}
          >
            Refresh News
          </button>
        </div>
      )}
    </div>
  )
}

export default NewsList