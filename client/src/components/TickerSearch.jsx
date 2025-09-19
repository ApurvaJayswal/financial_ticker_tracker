import React, { useState, useEffect, useRef } from 'react'
import './TickerSearch.css'

const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'US' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'US' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', market: 'US' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'US' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'US' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', market: 'US' },
  { symbol: 'META', name: 'Meta Platforms Inc.', market: 'US' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', market: 'India' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries', market: 'India' },
  { symbol: 'INFY.NS', name: 'Infosys Limited', market: 'India' },
  { symbol: 'BTC-USD', name: 'Bitcoin', market: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum', market: 'Crypto' },
  { symbol: 'BNB-USD', name: 'Binance Coin', market: 'Crypto' },
]

function TickerSearch({ onTickerSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef()
  const suggestionsRef = useRef()

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = POPULAR_TICKERS.filter(
        ticker =>
          ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticker.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSuggestions(filtered)
      setIsOpen(filtered.length > 0)
      setSelectedIndex(-1)
    } else {
      setSuggestions(POPULAR_TICKERS)
      setIsOpen(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleTickerSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleTickerSelect = (ticker) => {
    setSearchTerm(ticker.symbol)
    setIsOpen(false)
    onTickerSelect(ticker.symbol)
  }

  const getMarketColor = (market) => {
    switch (market) {
      case 'US': return '#1f77b4'
      case 'India': return '#ff7f0e'
      case 'Crypto': return '#2ca02c'
      default: return '#666'
    }
  }

  const showPopularTickers = !searchTerm && !isOpen

  return (
    <div className="ticker-search" ref={searchRef}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for stocks, crypto... (e.g., AAPL, BTC-USD, TCS.NS)"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="search-button"
          onClick={() => setIsOpen(!isOpen)}
          type="button"
        >
          🔍
        </button>
      </div>

      {/* Popular Tickers */}
      {showPopularTickers && (
        <div className="popular-tickers">
          <div className="popular-title">Popular Tickers:</div>
          <div className="popular-list">
            {POPULAR_TICKERS.slice(0, 8).map((ticker) => (
              <button
                key={ticker.symbol}
                className="popular-ticker"
                onClick={() => handleTickerSelect(ticker)}
                style={{ borderColor: getMarketColor(ticker.market) }}
              >
                <span className="ticker-symbol">{ticker.symbol}</span>
                <span className="ticker-market" style={{ color: getMarketColor(ticker.market) }}>
                  {ticker.market}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {isOpen && (
        <div className="suggestions-container" ref={suggestionsRef}>
          {suggestions.length > 0 ? (
            suggestions.map((ticker, index) => (
              <div
                key={ticker.symbol}
                className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleTickerSelect(ticker)}
              >
                <div className="suggestion-main">
                  <span className="suggestion-symbol">{ticker.symbol}</span>
                  <span 
                    className="suggestion-market"
                    style={{ color: getMarketColor(ticker.market) }}
                  >
                    {ticker.market}
                  </span>
                </div>
                <div className="suggestion-name">{ticker.name}</div>
              </div>
            ))
          ) : (
            <div className="no-suggestions">
              No results found. Try popular tickers like AAPL, BTC-USD, or TCS.NS
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default TickerSearch