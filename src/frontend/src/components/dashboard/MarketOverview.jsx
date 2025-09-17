import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function MarketOverview({ tickers }) {
  const marketStats = {
    us_stock: tickers.filter(t => t.market === 'us_stock'),
    indian_stock: tickers.filter(t => t.market === 'indian_stock'),
    crypto: tickers.filter(t => t.market === 'crypto'),
    forex: tickers.filter(t => t.market === 'forex')
  };

  const getMarketPerformance = (marketTickers) => {
    if (marketTickers.length === 0) return { avg: 0, positive: 0, negative: 0 };
    
    const avgChange = marketTickers.reduce((sum, t) => sum + (t.price_change_percent || 0), 0) / marketTickers.length;
    const positive = marketTickers.filter(t => (t.price_change_percent || 0) > 0).length;
    const negative = marketTickers.filter(t => (t.price_change_percent || 0) < 0).length;
    
    return { avg: avgChange, positive, negative };
  };

  const markets = [
    { 
      key: 'us_stock', 
      name: 'US Markets', 
      icon: '🇺🇸',
      tickers: marketStats.us_stock,
      performance: getMarketPerformance(marketStats.us_stock)
    },
    { 
      key: 'indian_stock', 
      name: 'Indian Markets', 
      icon: '🇮🇳',
      tickers: marketStats.indian_stock,
      performance: getMarketPerformance(marketStats.indian_stock)
    },
    { 
      key: 'crypto', 
      name: 'Cryptocurrency', 
      icon: '₿',
      tickers: marketStats.crypto,
      performance: getMarketPerformance(marketStats.crypto)
    },
    { 
      key: 'forex', 
      name: 'Forex', 
      icon: '💱',
      tickers: marketStats.forex,
      performance: getMarketPerformance(marketStats.forex)
    }
  ];

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {markets.map((market) => (
            <div
              key={market.key}
              className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{market.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-200">{market.name}</h3>
                    <p className="text-xs text-slate-400">{market.tickers.length} tracked</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1 text-sm ${
                  market.performance.avg >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {market.performance.avg >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-semibold">
                    {market.performance.avg >= 0 ? '+' : ''}{market.performance.avg.toFixed(2)}%
                  </span>
                </div>
                
                <div className="text-xs text-slate-400">
                  <span className="text-emerald-400">{market.performance.positive}↑</span>
                  {' / '}
                  <span className="text-red-400">{market.performance.negative}↓</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}