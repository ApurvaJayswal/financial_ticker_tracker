import { io } from 'socket.io-client'

const WEBSOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000'

class WebSocketService {
  constructor() {
    this.socket = null
    this.connected = false
    this.listeners = new Map()
  }

  connect() {
    if (this.socket && this.connected) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      this.socket = io(WEBSOCKET_URL, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
      })

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected')
        this.connected = true
        resolve()
      })

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected')
        this.connected = false
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error)
        this.connected = false
        reject(error)
      })

      // Set up price update listeners
      this.socket.on('priceUpdate', (data) => {
        this.emit('priceUpdate', data)
      })

      this.socket.on('newsUpdate', (data) => {
        this.emit('newsUpdate', data)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected = false
      this.listeners.clear()
    }
  }

  // Subscribe to ticker updates
  subscribeTicker(ticker) {
    if (this.socket && this.connected) {
      this.socket.emit('subscribe', { ticker })
      console.log(`📊 Subscribed to ${ticker}`)
    }
  }

  // Unsubscribe from ticker updates
  unsubscribeTicker(ticker) {
    if (this.socket && this.connected) {
      this.socket.emit('unsubscribe', { ticker })
      console.log(`📊 Unsubscribed from ${ticker}`)
    }
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data))
    }
  }

  // Check connection status
  isConnected() {
    return this.connected
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

export default websocketService