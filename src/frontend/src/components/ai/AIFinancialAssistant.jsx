import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Clock,
  TrendingUp,
  DollarSign,
  Globe,
  BookOpen,
  Target,
  AlertCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const AIFinancialAssistant = ({ userId = 'anonymous' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}`);
  const [popularQuestions, setPopularQuestions] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [assistantStatus, setAssistantStatus] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadPopularQuestions();
    loadAssistantStatus();
    // Add welcome message
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: `Hello! I'm your AI Financial Assistant. I can help you with:\n\n📊 Real-time stock and crypto analysis\n📈 Market trends and insights\n📰 Latest financial news analysis\n🎓 Investment education\n💡 Portfolio strategies\n\nWhat would you like to know about the markets today?`,
      timestamp: new Date(),
      metadata: { type: 'welcome' }
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadPopularQuestions = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/chat/popular-questions`);
      const data = await response.json();
      if (data.success) {
        setPopularQuestions(data.data.categories);
      }
    } catch (error) {
      console.error('Error loading popular questions:', error);
    }
  };

  const loadAssistantStatus = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/chat/status`);
      const data = await response.json();
      if (data.success) {
        setAssistantStatus(data.data);
      }
    } catch (error) {
      console.error('Error loading assistant status:', error);
    }
  };

  const sendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          userId,
          conversationId,
          includeMarketData: true,
          includeNews: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const assistantMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          metadata: data.data.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.\n\nError: ${error.message}`,
        timestamp: new Date(),
        metadata: { type: 'error' }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    // Add welcome message back
    setMessages([{
      id: Date.now(),
      type: 'assistant',
      content: `Hello! I'm your AI Financial Assistant. I can help you with:\n\n📊 Real-time stock and crypto analysis\n📈 Market trends and insights\n📰 Latest financial news analysis\n🎓 Investment education\n💡 Portfolio strategies\n\nWhat would you like to know about the markets today?`,
      timestamp: new Date(),
      metadata: { type: 'welcome' }
    }]);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Market Overview': <TrendingUp className="w-4 h-4" />,
      'Specific Stocks': <DollarSign className="w-4 h-4" />,
      'Cryptocurrency': <Globe className="w-4 h-4" />,
      'Financial Education': <BookOpen className="w-4 h-4" />,
      'Investment Strategy': <Target className="w-4 h-4" />,
      'News & Analysis': <Globe className="w-4 h-4" />
    };
    return icons[category] || <MessageCircle className="w-4 h-4" />;
  };

  const formatMessageContent = (content) => {
    // Split content by lines and format
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.trim() === '') return <br key={index} />;
      
      // Format bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={index} className="ml-4 mb-1 text-slate-300">
            {line.trim()}
          </div>
        );
      }
      
      // Format headers (lines with emojis or all caps)
      if (line.match(/^[🔍📊🏭📈💡⚠️]/)) {
        return (
          <div key={index} className="font-semibold text-slate-200 mb-2 mt-3">
            {line}
          </div>
        );
      }
      
      return (
        <div key={index} className="mb-1 text-slate-300">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
              <Bot className="w-6 h-6 text-cyan-400" />
              AI Financial Assistant
              {assistantStatus && (
                <Badge variant="outline" className="ml-2 text-emerald-300 border-emerald-500/50">
                  {assistantStatus.activeLLM}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversation}
              className="border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
          </div>
          <p className="text-slate-400 text-sm">
            Get real-time financial insights, market analysis, and investment guidance
          </p>
        </CardHeader>
      </Card>

      <div className="flex-1 grid lg:grid-cols-4 gap-6 h-full">
        {/* Chat Area */}
        <div className="lg:col-span-3 flex flex-col h-full">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm flex-1 flex flex-col">
            {/* Messages */}
            <CardContent className="flex-1 p-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {message.type === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[85%] ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-700/50 border border-slate-600/50 text-slate-200'
                      } rounded-2xl px-4 py-3 relative group`}>
                        {message.type === 'user' ? (
                          <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        ) : (
                          <div className="space-y-1">
                            {formatMessageContent(message.content)}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-600/30">
                          <span className="text-xs text-slate-500">
                            {format(new Date(message.timestamp), 'HH:mm')}
                            {message.metadata?.llmModel && (
                              <span className="ml-2 text-slate-600">• {message.metadata.llmModel}</span>
                            )}
                          </span>
                          
                          {message.type === 'assistant' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-slate-400 hover:text-slate-200"
                              onClick={() => copyToClipboard(message.content, message.id)}
                            >
                              {copiedMessageId === message.id ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                        
                        {message.metadata?.queryType && (
                          <Badge variant="outline" className="mt-2 text-xs text-slate-400 border-slate-600">
                            {message.metadata.queryType}
                          </Badge>
                        )}
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600/50 text-slate-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing your query...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>

            {/* Input Area */}
            <div className="border-t border-slate-700/50 p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Ask about stocks, crypto, market trends, or get investment advice..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400 pr-10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                    Enter to send
                  </div>
                </div>
                <Button
                  onClick={() => sendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar with Popular Questions */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Popular Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {popularQuestions.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <div className="flex items-center gap-2 mb-2 text-slate-300 font-medium text-sm">
                        {getCategoryIcon(category.category)}
                        {category.category}
                      </div>
                      <div className="space-y-2 ml-6">
                        {category.questions.slice(0, 3).map((question, questionIndex) => (
                          <button
                            key={questionIndex}
                            onClick={() => sendMessage(question)}
                            disabled={isLoading}
                            className="w-full text-left text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/30 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Assistant Status */}
          {assistantStatus && (
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-green-400" />
                  Assistant Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Service:</span>
                    <Badge variant="outline" className="text-green-300 border-green-500/50">
                      {assistantStatus.service}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="text-slate-300">{assistantStatus.activeLLM}</span>
                  </div>
                  <div className="text-slate-400">
                    <span>Capabilities:</span>
                    <div className="mt-1 space-y-1">
                      {assistantStatus.capabilities?.slice(0, 4).map((cap, index) => (
                        <div key={index} className="text-xs text-slate-500">• {cap}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFinancialAssistant;