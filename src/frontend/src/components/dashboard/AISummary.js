import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, BarChart3, Clock, Target, Zap } from 'lucide-react';

const AISummary = ({ timeframe = '1d' }) => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAISummary();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAISummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAISummary = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ml/market-summary?timeframe=${timeframe}&include_news=true`);
      const data = await response.json();
      
      if (data.success) {
        setSummaryData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch AI summary');
      }
    } catch (err) {
      setError('Network error: Unable to fetch AI summary');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'bullish': return 'text-green-600';
      case 'bearish': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      default: return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getSentimentBadge = (sentiment) => {
    const colors = {
      positive: 'bg-green-100 text-green-800 border-green-200',
      negative: 'bg-red-100 text-red-800 border-red-200',
      neutral: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return `px-3 py-1 rounded-full text-sm font-medium border ${colors[sentiment] || colors.neutral}`;
  };

  const formatPercentage = (value) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-lg mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertTriangle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold font-jakarta">AI Analysis Unavailable</h3>
        </div>
        <p className="text-gray-600 font-poppins">{error}</p>
        <button 
          onClick={fetchAISummary}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-poppins"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-8 h-8 mr-3" />
            <div>
              <h2 className="text-2xl font-bold font-jakarta">AI Market Analysis</h2>
              <p className="text-blue-100 font-poppins">Powered by Advanced Analytics</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span className="font-poppins">
              {new Date(summaryData?.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Market Overview', icon: BarChart3 },
            { id: 'trends', label: 'Trends & Signals', icon: TrendingUp },
            { id: 'recommendations', label: 'Recommendations', icon: Target }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm font-jakarta transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Market Summary */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold font-jakarta mb-3">AI-Generated Summary</h3>
              <p className="text-gray-700 leading-relaxed font-poppins mb-4">
                {summaryData?.summary}
              </p>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 font-jakarta">
                    {summaryData?.metrics?.gainers}
                  </div>
                  <div className="text-sm text-gray-600 font-poppins">Gainers</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 font-jakarta">
                    {summaryData?.metrics?.losers}
                  </div>
                  <div className="text-sm text-gray-600 font-poppins">Losers</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className={`text-2xl font-bold font-jakarta ${
                    summaryData?.metrics?.averageChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(summaryData?.metrics?.averageChange || 0)}
                  </div>
                  <div className="text-sm text-gray-600 font-poppins">Avg Change</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className={`text-2xl font-bold font-jakarta ${
                    summaryData?.metrics?.marketHealth === 'healthy' ? 'text-green-600' : 
                    summaryData?.metrics?.marketHealth === 'cautious' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {summaryData?.metrics?.marketHealth?.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 font-poppins">Health</div>
                </div>
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold font-jakarta mb-4">Market Sentiment</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={getSentimentBadge(summaryData?.sentiment?.overall)}>
                    {summaryData?.sentiment?.overall?.charAt(0).toUpperCase() + summaryData?.sentiment?.overall?.slice(1)}
                  </span>
                  <div className="ml-4 text-sm text-gray-600 font-poppins">
                    Confidence: {Math.round((summaryData?.sentiment?.confidence || 0) * 100)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-poppins">Articles Analyzed</div>
                  <div className="text-lg font-semibold font-jakarta">
                    {summaryData?.sentiment?.articlesAnalyzed || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Sector Performance */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold font-jakarta mb-4">Sector Performance</h3>
              <div className="space-y-3">
                {Object.entries(summaryData?.sectors || {}).map(([sector, data]) => (
                  <div key={sector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{
                        backgroundColor: data.averageChange > 0 ? '#10b981' : data.averageChange < 0 ? '#ef4444' : '#6b7280'
                      }}></div>
                      <span className="font-medium font-jakarta">{sector}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600 font-poppins">
                        {data.tickerCount} stocks
                      </span>
                      <span className={`font-semibold font-jakarta ${
                        data.averageChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(data.averageChange)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Market Trend */}
            <div className="bg-white p-6 rounded-lg border border-gray-100">
              <h3 className="text-lg font-semibold font-jakarta mb-4">Market Trend Analysis</h3>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${getTrendColor(summaryData?.trends?.trend)}`}>
                    {getTrendIcon(summaryData?.trends?.trend)}
                  </div>
                  <div>
                    <div className={`text-xl font-bold font-jakarta ${getTrendColor(summaryData?.trends?.trend)}`}>
                      {summaryData?.trends?.trend?.toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600 font-poppins">
                      Strength: {summaryData?.trends?.strength}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-poppins">Gainer Ratio</div>
                  <div className="text-lg font-semibold font-jakarta">
                    {Math.round((summaryData?.trends?.gainerRatio || 0) * 100)}%
                  </div>
                </div>
              </div>
              
              {/* Market Signals */}
              <div className="mt-4">
                <h4 className="font-semibold font-jakarta mb-2">Key Signals</h4>
                <ul className="space-y-2">
                  {summaryData?.trends?.signals?.map((signal, index) => (
                    <li key={index} className="flex items-center text-sm font-poppins">
                      <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {summaryData?.recommendations?.length > 0 ? (
              summaryData.recommendations.map((rec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${
                      rec.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                      rec.type === 'warning' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold font-jakarta capitalize">
                        {rec.type} - {rec.confidence} Confidence
                      </div>
                      <div className="text-sm text-gray-600 font-poppins mt-1">
                        {rec.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No specific recommendations at this time.</p>
                <p className="text-sm text-gray-400 font-poppins">Continue monitoring market conditions.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummary;