import React, { useState, useEffect } from "react";
import { Ticker } from "../entities/Ticker";
import { NewsItem } from "../entities/NewsItem";
import { Alert } from "../entities/Alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Bell, 
  Plus,
  RefreshCw,
  BarChart3,
  Globe,
  DollarSign
} from "lucide-react";

import MarketOverview from "../components/dashboard/MarketOverview";
import TickerGrid from "../components/dashboard/TickerGrid";
import NewsPanel from "../components/dashboard/NewsPanel";
import AlertsPanel from "../components/dashboard/AlertsPanel";

export default function Dashboard() {
  const [tickers, setTickers] = useState([]);
  const [news, setNews] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tickerData, newsData, alertData] = await Promise.all([
        Ticker.list("-last_updated", 50),
        NewsItem.list("-published_at", 20),
        Alert.filter({ is_active: true }, "-created_date", 10)
      ]);
      
      setTickers(tickerData);
      setNews(newsData);
      setAlerts(alertData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  
  const totalValue = tickers.reduce((sum, t) => sum + (t.current_price * 100), 0); // Assuming 100 shares each
  const totalChange = tickers.reduce((sum, t) => sum + (t.price_change * 100), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Market Dashboard
          </h1>
          <p className="text-slate-300 mt-2">AI-powered financial analysis and insights</p>
          <p className="text-slate-400 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={loadDashboardData}
            variant="outline"
            className="border-blue-400/30 bg-slate-800/50 text-blue-300 hover:bg-blue-900/30"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to={createPageUrl("AddTicker")}>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Ticker
            </Button>
          </Link>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">${totalValue.toFixed(2)}</div>
            <div className={`flex items-center gap-1 text-sm mt-2 ${
              totalChange >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} ({totalChangePercent.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Active Tickers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{tickers.length}</div>
            <p className="text-slate-400 text-sm mt-2">Across all markets</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Recent News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{news.length}</div>
            <p className="text-slate-400 text-sm mt-2">Breaking stories</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-100">{alerts.length}</div>
            <p className="text-slate-400 text-sm mt-2">Monitoring conditions</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Overview */}
      <MarketOverview tickers={tickers} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TickerGrid tickers={tickers} />
        </div>
        
        <div className="space-y-8">
          <NewsPanel news={news} />
          <AlertsPanel alerts={alerts} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link to={createPageUrl("MarketAnalysis")}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-600/80 to-indigo-700/80 backdrop-blur-sm text-white hover:scale-105 transition-transform duration-300 cursor-pointer shadow-xl border border-purple-500/30">
            <BarChart3 className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Market Analysis</h3>
            <p className="text-purple-100">Deep dive into market trends and patterns</p>
          </div>
        </Link>
        
        <Link to={createPageUrl("NewsCenter")}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600/80 to-teal-700/80 backdrop-blur-sm text-white hover:scale-105 transition-transform duration-300 cursor-pointer shadow-xl border border-emerald-500/30">
            <Globe className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">News Center</h3>
            <p className="text-emerald-100">Latest financial news with AI sentiment analysis</p>
          </div>
        </Link>
        
        <Link to={createPageUrl("AddTicker")}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-600/80 to-red-700/80 backdrop-blur-sm text-white hover:scale-105 transition-transform duration-300 cursor-pointer shadow-xl border border-orange-500/30">
            <Plus className="w-8 h-8 mb-3" />
            <h3 className="text-xl font-bold mb-2">Track New Asset</h3>
            <p className="text-orange-100">Add stocks, crypto, or forex to your watchlist</p>
          </div>
        </Link>
      </div>
    </div>
  );
}