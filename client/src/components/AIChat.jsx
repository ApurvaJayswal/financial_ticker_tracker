import React, { useState, useRef, useEffect } from 'react'
import { aiAPI } from '../services/api'
import './AIChat.css'

const SUGGESTED_QUESTIONS = [
  "What's the latest news about {ticker}?",
  "Why is {ticker} price moving today?",
  "What are the key financial metrics for {ticker}?",
  "What do analysts think about {ticker}?",
  "Is {ticker} a good investment right now?",
  "What are the risks of investing in {ticker}?",
]

function AIChat({ ticker }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    // Add welcome message when ticker changes
    if (ticker) {
      setMessages([
        {
          id: `welcome-${ticker}`,
          type: 'assistant',
          content: `Hi! I'm your AI assistant for analyzing ${ticker}. Ask me anything about this stock, its recent performance, news, or financial data. I can help you understand market movements and provide insights based on the latest information.`,
          timestamp: new Date(),
        }
      ])
    }
  }, [ticker])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await aiAPI.askQuestion(ticker, inputValue.trim())
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources || [],
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('AI Chat error:', err)
      setError(err.message)
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I couldn't process your question about ${ticker}. Please try again or ask a different question.`,
        timestamp: new Date(),
        isError: true,
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSuggestedQuestion = (question) => {
    const formattedQuestion = question.replace('{ticker}', ticker)
    setInputValue(formattedQuestion)
    inputRef.current?.focus()
  }

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${ticker}-${Date.now()}`,
        type: 'assistant',
        content: `Chat cleared! How can I help you analyze ${ticker} today?`,
        timestamp: new Date(),
      }
    ])
    setError(null)
  }

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="ai-chat">
      <div className="chat-header">
        <div className="chat-title">
          <h3>🤖 AI Assistant</h3>
          <span className="chat-ticker">{ticker}</span>
        </div>
        
        <button 
          className="clear-chat-button"
          onClick={clearChat}
          title="Clear chat"
        >
          🗑️
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.type} ${message.isError ? 'error' : ''}`}
          >
            <div className="message-content">
              <div className="message-text">
                {message.content}
              </div>
              
              {message.sources && message.sources.length > 0 && (
                <div className="message-sources">
                  <div className="sources-title">Sources:</div>
                  <ul className="sources-list">
                    {message.sources.map((source, index) => (
                      <li key={index} className="source-item">
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          {source.title || source.source}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="message-time">
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="suggested-questions">
          <div className="suggestions-title">Suggested questions:</div>
          <div className="suggestions-list">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
              >
                {question.replace('{ticker}', ticker)}
              </button>
            ))}
          </div>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={`Ask me anything about ${ticker}...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          
          <button
            type="submit"
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        
        {error && (
          <div className="chat-error">
            ❌ {error}
          </div>
        )}
      </form>

      <div className="chat-footer">
        <small>
          💡 I can help with market analysis, news summaries, and financial insights for {ticker}
        </small>
      </div>
    </div>
  )
}

export default AIChat