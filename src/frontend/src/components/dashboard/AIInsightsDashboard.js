import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Eye, 
  Zap, 
  Target, 
  BarChart3, 
  Clock,
  Lightbulb,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';
import AISummary from './AISummary';

const AIInsightsDashboard = () => {
  const [insights, setInsights] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [outlook, setOutlook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [activeInsight, setActiveInsight] = useState('market-intelligence');

  useEffect(() => {
    fetchAllInsights();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchAllInsights, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const fetchAllInsights = async () => {
    try {
      setLoading(true);
      
      // Fetch market intelligence
      const intelligenceResponse = await fetch(`/api/ai-summary/market-intelligence?timeframe=${selectedTimeframe}&includeNews=true&includeTechnical=true`);
      if (intelligenceResponse.ok) {
        const intelligenceData = await intelligenceResponse.json();
        setInsights(intelligenceData.data);
      }

      // Fetch real-time alerts
      const alertsResponse = await fetch('/api/ai-summary/alerts?severity=all&limit=5');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data.alerts);
      }

      // Fetch market outlook
      const outlookResponse = await fetch('/api/ai-summary/market-outlook?horizon=short');
      if (outlookResponse.ok) {
        const outlookData = await outlookResponse.json();
        setOutlook(outlookData.data);
      }

    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (category) => {
    switch (category) {
      case 'volatility': return <Activity className="w-4 h-4" />;
      case 'volume': return <BarChart3 className="w-4 h-4" />;
      case 'sentiment': return <Brain className="w-4 h-4" />;
      case 'technical': return <LineChart className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading && !insights) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg p-6 h-96"></div>
                <div className="bg-white rounded-lg p-6 h-48"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-6 h-64"></div>
                <div className="bg-white rounded-lg p-6 h-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-10 h-10 text-blue-600 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 font-jakarta">AI Market Intelligence</h1>
                <p className="text-gray-600 font-poppins">Advanced analytics and real-time insights</p>
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 font-poppins">Timeframe:</span>
              {['1d', '1w', '1m'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  className={`px-3 py-1 rounded-full text-sm font-medium font-jakarta transition-colors ${
                    selectedTimeframe === tf 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-poppins">Confidence Score</p>
                  <p className="text-2xl font-bold text-blue-600 font-jakarta">
                    {Math.round(insights.executive_summary.confidence_score * 100)}%
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-poppins">Market Health</p>
                  <p className={`text-2xl font-bold font-jakarta ${
                    insights.executive_summary.risk_level === 'healthy' ? 'text-green-600' :
                    insights.executive_summary.risk_level === 'cautious' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {insights.executive_summary.risk_level?.toUpperCase()}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-poppins">Data Points</p>
                  <p className="text-2xl font-bold text-purple-600 font-jakarta">
                    {insights.metadata.data_points}
                  </p>
                </div>
                <PieChart className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 font-poppins">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600 font-jakarta">
                    {alerts.length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI Summary Component */}
            <AISummary timeframe={selectedTimeframe} />

            {/* Key Insights */}
            {insights && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold font-jakarta mb-4 flex items-center">
                  <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
                  Key Market Insights
                </h3>
                <div className="space-y-3">
                  {insights.executive_summary.key_insights.map((insight, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <p className="text-gray-700 font-poppins">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Outlook */}
            {outlook && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold font-jakarta mb-4 flex items-center">
                  <TrendingUp className="w-6 h-6 text-green-500 mr-2" />
                  Market Outlook
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(outlook.scenario_analysis).map(([scenario, data]) => (
                    <div key={scenario} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold font-jakarta capitalize">
                          {scenario.replace('_', ' ')}
                        </h4>
                        <span className="text-sm font-medium text-gray-600 font-poppins">
                          {Math.round(data.probability * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-poppins mb-2">
                        Expected Return: {data.expected_return}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {data.drivers.slice(0, 2).map((driver, idx) => (
                          <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-poppins">
                            {driver}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold font-jakarta mb-2">Investment Themes</h4>
                  <div className="space-y-2">
                    {outlook.investment_themes.map((theme, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium font-jakarta">{theme.theme}</span>
                          <p className="text-sm text-gray-600 font-poppins">{theme.description}</p>
                        </div>
                        <div className="flex items-center ml-4">
                          <div className="text-sm font-semibold font-jakarta">
                            {Math.round(theme.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Real-time Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold font-jakarta mb-4 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Real-time Alerts
              </h3>
              
              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border-l-4 border-red-400 bg-red-50 p-3 rounded-r-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          <div className={`p-1 rounded mr-2 ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.category)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm font-jakarta">{alert.title}</h4>
                            <p className="text-xs text-gray-600 font-poppins mt-1">{alert.message}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-poppins">No active alerts</p>
                </div>
              )}
            </div>

            {/* Market Recommendations */}
            {insights && insights.recommendations && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold font-jakarta mb-4 flex items-center">
                  <Target className="w-5 h-5 text-blue-500 mr-2" />
                  AI Recommendations
                </h3>
                
                {insights.recommendations.immediate?.length > 0 ? (
                  <div className="space-y-3">
                    {insights.recommendations.immediate.map((rec, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start">
                          <div className={`p-1 rounded mr-2 ${
                            rec.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                            rec.type === 'warning' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <Target className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="font-medium text-sm font-jakarta capitalize">
                              {rec.type}
                            </div>
                            <p className="text-xs text-gray-600 font-poppins mt-1">{rec.message}</p>
                            <div className="text-xs text-blue-600 font-poppins mt-1">
                              Confidence: {rec.confidence}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 font-poppins">No active recommendations</p>
                  </div>
                )}
              </div>
            )}

            {/* Markets Covered */}
            {insights && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold font-jakarta mb-4">Markets Analyzed</h3>
                <div className="space-y-2">
                  {insights.metadata.markets_covered.map((market, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium font-jakarta capitalize">
                        {market.replace('_', ' ')}
                      </span>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold font-jakarta mb-2">Sectors Covered</h4>
                  <div className="flex flex-wrap gap-1">
                    {insights.metadata.sectors_covered.map((sector, index) => (
                      <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-poppins">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;