import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, MoreHorizontal, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const getMarketBadgeColor = (market) => {
  const colors = {
    us_stock: "bg-blue-100 text-blue-800 border-blue-200",
    indian_stock: "bg-orange-100 text-orange-800 border-orange-200", 
    crypto: "bg-purple-100 text-purple-800 border-purple-200",
    forex: "bg-green-100 text-green-800 border-green-200"
  };
  return colors[market] || "bg-gray-100 text-gray-800";
};

const getMarketLabel = (market) => {
  const labels = {
    us_stock: "US Stock",
    indian_stock: "Indian Stock",
    crypto: "Crypto",
    forex: "Forex"
  };
  return labels[market] || market;
};

export default function TickerGrid({ tickers }) {
  const sortedTickers = [...tickers].sort((a, b) => Math.abs(b.price_change_percent || 0) - Math.abs(a.price_change_percent || 0));

  if (tickers.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Your Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No Tickers Added</h3>
            <p className="text-slate-400 mb-6">Start tracking your favorite stocks, crypto, and forex pairs</p>
            <Link to={createPageUrl("AddTicker")}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                Add Your First Ticker
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200">Your Watchlist ({tickers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTickers.map((ticker) => {
            const isPositive = (ticker.price_change || 0) >= 0;
            
            return (
              <div
                key={ticker.id}
                className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-blue-400">{ticker.symbol}</h3>
                        <Badge className={`${getMarketBadgeColor(ticker.market)} text-xs`}>
                          {getMarketLabel(ticker.market)}
                        </Badge>
                      </div>
                      <p className="text-slate-300 font-medium">{ticker.name}</p>
                      <p className="text-slate-400 text-sm">{ticker.sector}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-100">
                      ${ticker.current_price?.toFixed(2) || '0.00'}
                    </div>
                    <div className={`flex items-center gap-1 ${
                      isPositive ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span className="font-semibold">
                        {isPositive ? '+' : ''}${(ticker.price_change || 0).toFixed(2)}
                      </span>
                      <span className="text-sm">
                        ({isPositive ? '+' : ''}{(ticker.price_change_percent || 0).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vol: {ticker.volume ? (ticker.volume / 1e6).toFixed(1) + 'M' : 'N/A'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={createPageUrl(`TickerDetail?symbol=${ticker.symbol}`)}>
                      <Button size="sm" variant="outline" className="border-slate-600 bg-slate-700/50 text-slate-300 hover:bg-slate-600/50">
                        View Details
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-200">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}