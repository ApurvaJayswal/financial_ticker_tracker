import React, { useState, useEffect } from 'react'
import './Watchlist.css'

function Watchlist() {
  const [watchlists, setWatchlists] = useState([])
  const [newWatchlistName, setNewWatchlistName] = useState('')
  const [selectedTicker, setSelectedTicker] = useState('')

  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      const newWatchlist = {
        id: Date.now(),
        name: newWatchlistName,
        tickers: []
      }
      setWatchlists([...watchlists, newWatchlist])
      setNewWatchlistName('')
    }
  }

  const handleAddTicker = (watchlistId) => {
    if (selectedTicker.trim()) {
      setWatchlists(watchlists.map(wl => 
        wl.id === watchlistId 
          ? { ...wl, tickers: [...wl.tickers, selectedTicker.toUpperCase()] }
          : wl
      ))
      setSelectedTicker('')
    }
  }

  const handleRemoveTicker = (watchlistId, ticker) => {
    setWatchlists(watchlists.map(wl => 
      wl.id === watchlistId 
        ? { ...wl, tickers: wl.tickers.filter(t => t !== ticker) }
        : wl
    ))
  }

  return (
    <div className="watchlist">
      <div className="watchlist-header">
        <h2>My Watchlists</h2>
        <div className="create-watchlist">
          <input
            type="text"
            placeholder="Watchlist name"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateWatchlist()}
          />
          <button onClick={handleCreateWatchlist}>Create</button>
        </div>
      </div>

      <div className="watchlists-grid">
        {watchlists.map(watchlist => (
          <div key={watchlist.id} className="watchlist-card">
            <h3>{watchlist.name}</h3>
            <div className="add-ticker">
              <input
                type="text"
                placeholder="Add ticker (e.g., AAPL)"
                value={selectedTicker}
                onChange={(e) => setSelectedTicker(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTicker(watchlist.id)}
              />
              <button onClick={() => handleAddTicker(watchlist.id)}>Add</button>
            </div>
            <div className="tickers-list">
              {watchlist.tickers.map(ticker => (
                <div key={ticker} className="ticker-item">
                  <span>{ticker}</span>
                  <button 
                    onClick={() => handleRemoveTicker(watchlist.id, ticker)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {watchlists.length === 0 && (
        <div className="empty-state">
          <p>No watchlists yet. Create your first one above!</p>
        </div>
      )}
    </div>
  )
}

export default Watchlist
