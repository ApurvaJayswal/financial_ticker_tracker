import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// Price API
export const priceAPI = {
  getPrice: async (ticker) => {
    try {
      const response = await api.get(`/price?ticker=${ticker}`)
      const data = response.data
      // Map server response to frontend-friendly shape
      return {
        ticker: data.ticker || ticker,
        market: data.market,
        source: data.source,
        currentPrice: data.price,
        volume: data.volume,
        timestamp: data.timestamp,
        cached: data.cached,
      }
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch price data')
    }
  },

  getHistoricalPrices: async (ticker, period = '1D') => {
    try {
      const response = await api.get(`/price/historical?ticker=${ticker}&period=${period}`)
      // Expect { data: [{ price, timestamp, ... }] }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch historical data')
    }
  },
}

// News API
export const newsAPI = {
  getNews: async (ticker) => {
    try {
      const response = await api.get(`/news?ticker=${ticker}`)
      // Expect { articles: [...] }
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch news')
    }
  },

  getNewsSummary: async (newsId) => {
    try {
      const response = await api.get(`/news/summary/${newsId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch summary')
    }
  },
}

// AI API
export const aiAPI = {
  askQuestion: async (ticker, question) => {
    try {
      // Server endpoint is /api/ai/qa
      const response = await api.post('/ai/qa', {
        ticker,
        question,
      })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get AI response')
    }
  },

  summarizeText: async (text) => {
    try {
      const response = await api.post('/ai/summarize', { text })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || error.message || 'Failed to get summary')
    }
  },
}

// Generic API helper
export const healthCheck = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('API health check failed')
  }
}

export default api