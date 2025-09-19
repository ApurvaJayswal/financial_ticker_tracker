import React, { useRef, useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { priceAPI } from '../services/api'
import './Chart.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const TIME_PERIODS = [
  { label: '1D', value: '1D' },
  { label: '5D', value: '5D' },
  { label: '1M', value: '1M' },
  { label: '3M', value: '3M' },
  { label: '6M', value: '6M' },
  { label: '1Y', value: '1Y' },
]

function Chart({ ticker, currentPrice }) {
  const [chartData, setChartData] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState('1D')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const chartRef = useRef()

  useEffect(() => {
    if (ticker) {
      fetchChartData(ticker, selectedPeriod)
    }
  }, [ticker, selectedPeriod])

  const fetchChartData = async (symbol, period) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await priceAPI.getHistoricalPrices(symbol, period)
      
      if (response.data && response.data.length > 0) {
        const prices = response.data.map(item => item.price)
        const timestamps = response.data.map(item => {
          const date = new Date(item.timestamp)
          
          // Format based on period
          if (period === '1D') {
            return date.toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          } else {
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })
          }
        })

        // Calculate price change for gradient
        const firstPrice = prices[0]
        const lastPrice = prices[prices.length - 1]
        const isPositive = lastPrice >= firstPrice

        setChartData({
          labels: timestamps,
          datasets: [
            {
              label: `${symbol} Price`,
              data: prices,
              borderColor: isPositive ? '#10b981' : '#ef4444',
              backgroundColor: isPositive 
                ? 'rgba(16, 185, 129, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.1,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: isPositive ? '#10b981' : '#ef4444',
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 2,
            },
          ],
        })
      } else {
        setError('No chart data available')
      }
    } catch (err) {
      console.error('Failed to fetch chart data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const price = context.parsed.y
            return `Price: $${price.toFixed(2)}`
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: (value) => `$${value.toFixed(2)}`,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title">
          <h3>{ticker} Price Chart</h3>
          {currentPrice && (
            <span className="current-price">
              ${currentPrice.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="time-period-selector">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              className={`period-button ${
                selectedPeriod === period.value ? 'active' : ''
              }`}
              onClick={() => setSelectedPeriod(period.value)}
              disabled={loading}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-content">
        {loading && (
          <div className="chart-loading">
            <div className="loading-spinner"></div>
            <p>Loading chart data...</p>
          </div>
        )}

        {error && (
          <div className="chart-error">
            <p>❌ {error}</p>
            <button 
              onClick={() => fetchChartData(ticker, selectedPeriod)}
              className="retry-button"
            >
              Retry
            </button>
          </div>
        )}

        {chartData && !loading && (
          <div className="chart-wrapper">
            <Line 
              ref={chartRef}
              data={chartData} 
              options={chartOptions} 
            />
          </div>
        )}

        {!chartData && !loading && !error && (
          <div className="chart-placeholder">
            <p>📊 Select a ticker to view chart</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chart