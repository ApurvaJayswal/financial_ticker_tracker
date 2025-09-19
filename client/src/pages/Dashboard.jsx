import React, { useState, useEffect } from 'react'
import TickerSearch from '../components/TickerSearch'
import PricePanel from '../components/PricePanel'
import NewsList from '../components/NewsList'
import AIChat from '../components/AIChat'
import './Dashboard.css'

function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL')
  const [priceData, setPriceData] = useState(null)
  const [newsData, setNewsData] = useState([])
  const [loading, setLoading] = useState(false)

  const handleTickerSelect = (ticker) => {
    setSelectedTicker(ticker)
    setPriceData(null)
    setNewsData([])
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Financial Dashboard</h2>
        <TickerSearch onTickerSelect={handleTickerSelect} />
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-main">
          <PricePanel 
            ticker={selectedTicker}
            priceData={priceData}
            setPriceData={setPriceData}
            loading={loading}
            setLoading={setLoading}
          />
          <NewsList 
            ticker={selectedTicker}
            newsData={newsData}
            setNewsData={setNewsData}
          />
        </div>
        
        <div className="dashboard-sidebar">
          <AIChat ticker={selectedTicker} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
