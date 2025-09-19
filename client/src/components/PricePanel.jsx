import React, { useEffect, useState } from 'react'
import Chart from './Chart'
import { priceAPI } from '../services/api'
import websocketService from '../services/websocket'
import './PricePanel.css'

function PricePanel({ ticker, priceData, setPriceData, loading, setLoading }) {
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')

  useEffect(() => {
    if (ticker) {
      fetchPriceData(ticker)
      setupWebSocketConnection(ticker)
    }

    return () => {
      if (ticker) {
        websocketService.unsubscribeTicker(ticker)
      }
    }
  }, [ticker])

  const fetchPriceData = async (symbol) => {
    setLoading(true)
    setError(null)

    try {
      const response = await priceAPI.getPrice(symbol)
      setPriceData(response.data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch price data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setupWebSocketConnection = async (symbol) => {
    try {
      await websocketService.connect()
      setConnectionStatus('connected')
      
      // Subscribe to price updates for this ticker
      websocketService.subscribeTicker(symbol)
      
      // Listen for price updates
      const handlePriceUpdate = (data) => {
        if (data.ticker === symbol) {
          setPriceData(prevData => ({
            ...prevData,
            ...data.price,
          }))
          setLastUpdated(new Date())
        }
      }

      websocketService.on('priceUpdate', handlePriceUpdate)

      // Cleanup function
      return () => {
        websocketService.off('priceUpdate', handlePriceUpdate)
      }
    } catch (err) {
      console.error('WebSocket connection failed:', err)
      setConnectionStatus('failed')
    }
  }

  const formatPrice = (price) => {
    if (typeof price !== 'number') return '0.00'
    
    if (price >= 1000) {
      return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    return price.toFixed(2)
  }

  const formatChange = (change, changePercent) => {
    if (typeof change !== 'number' || typeof changePercent !== 'number') {
      return { text: '+0.00 (+0.00%)', positive: true }
    }

    const isPositive = change >= 0
    const sign = isPositive ? '+' : ''
    
    return {
      text: `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`,
      positive: isPositive,
    }
  }

  const formatVolume = (volume) => {
    if (typeof volume !== 'number') return '0'
    
    if (volume >= 1_000_000_000) {
      return `${(volume / 1_000_000_000).toFixed(2)}B`
    } else if (volume >= 1_000_000) {
      return `${(volume / 1_000_000).toFixed(2)}M`
    } else if (volume >= 1_000) {
      return `${(volume / 1_000).toFixed(2)}K`
    }
    return volume.toLocaleString()
  }

  const formatTime = (date) => {
    if (!date) return ''
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const changeInfo = priceData ? formatChange(priceData.change, priceData.changePercent) : null

  return (
    <div className="price-panel">
      <div className="price-header">
        <div className="price-title">
          <h2>{ticker}</h2>
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus}`}></div>
            <span className="status-text">
              {connectionStatus === 'connected' ? 'Live' : 
               connectionStatus === 'failed' ? 'Offline' : 'Connecting...'}
            </span>
          </div>
        </div>
        
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {formatTime(lastUpdated)}
          </div>
        )}
      </div>

      {loading && (
        <div className="price-loading">
          <div className="loading-spinner"></div>
          <p>Loading price data...</p>
        </div>
      )}

      {error && (
        <div className="price-error">
          <p>❌ {error}</p>
          <button 
            onClick={() => fetchPriceData(ticker)}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      )}

      {priceData && !loading && (
        <>
          <div className="price-main">
            <div className="current-price">
              <span className="price-value">
                ${formatPrice(priceData.currentPrice)}
              </span>
              {priceData.currency && priceData.currency !== 'USD' && (
                <span className="currency">{priceData.currency}</span>
              )}
            </div>
            
            {changeInfo && (
              <div className={`price-change ${changeInfo.positive ? 'positive' : 'negative'}`}>
                {changeInfo.text}
              </div>
            )}
          </div>

          <div className="price-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Open</span>
                <span className="stat-value">
                  ${formatPrice(priceData.openPrice || 0)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">High</span>
                <span className="stat-value">
                  ${formatPrice(priceData.highPrice || 0)}
                </span>
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Low</span>
                <span className="stat-value">
                  ${formatPrice(priceData.lowPrice || 0)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Volume</span>
                <span className="stat-value">
                  {formatVolume(priceData.volume || 0)}
                </span>
              </div>
            </div>

            {priceData.marketCap && (
              <div className="stat-row">
                <div className="stat-item full-width">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value">
                    ${formatVolume(priceData.marketCap)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="chart-section">
        <Chart 
          ticker={ticker} 
          currentPrice={priceData?.currentPrice}
        />
      </div>
    </div>
  )
}

export default PricePanel