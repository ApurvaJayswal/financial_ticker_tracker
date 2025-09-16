import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";
import { Plus, Search, TrendingUp, Globe, AlertCircle } from "lucide-react";
import { Ticker } from "../src/entities/Ticker";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../src/utils";
import { createPageUrl } from "@/utils";

export default function AddTicker() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("us_stock");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const markets = [
    { value: "us_stock", label: "US Stock Market", icon: "🇺🇸" },
    { value: "indian_stock", label: "Indian Stock Market", icon: "🇮🇳" },
    { value: "crypto", label: "Cryptocurrency", icon: "₿" },
    { value: "forex", label: "Foreign Exchange", icon: "💱" }
  ];

  const searchTickers = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const marketContext = {
        us_stock: "US stock market (NYSE, NASDAQ)",
        indian_stock: "Indian stock market (NSE, BSE)", 
        crypto: "cryptocurrency market",
        forex: "foreign exchange market"
      };

      const response = await InvokeLLM({
        prompt: `Search for financial tickers in the ${marketContext[selectedMarket]} matching "${searchQuery}". 
        
        Find up to 5 relevant tickers and return detailed information including:
        - symbol (ticker symbol)
        - name (full company/asset name)  
        - sector (industry/category)
        - current_price (approximate current price in USD)
        - market_cap (market capitalization if available)
        - description (brief description)
        
        Focus on exact matches first, then similar/related tickers. For crypto, use standard symbols like BTC, ETH, etc.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  symbol: { type: "string" },
                  name: { type: "string" },
                  sector: { type: "string" },
                  current_price: { type: "number" },
                  market_cap: { type: "number" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSearchResults(response.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const addTicker = async (tickerData) => {
    setIsAdding(true);
    try {
      await Ticker.create({
        symbol: tickerData.symbol,
        name: tickerData.name,
        market: selectedMarket,
        current_price: tickerData.current_price || 0,
        price_change: 0,
        price_change_percent: 0,
        market_cap: tickerData.market_cap || 0,
        sector: tickerData.sector || "Unknown",
        last_updated: new Date().toISOString(),
        is_active: true,
        sentiment_score: 0,
        news_count: 0
      });
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Error adding ticker:", error);
    }
    setIsAdding(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="shrink-0 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Add New Ticker
          </h1>
          <p className="text-slate-300 mt-1">Search and track stocks, crypto, or forex</p>
        </div>
      </div>

      {/* Search Section */}
      <Card className="mb-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-slate-200">
            <Search className="w-5 h-5 text-blue-400" />
            Search Financial Assets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-300 font-semibold">Search Query</Label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Apple, TSLA, Bitcoin, EUR/USD..."
                className="h-12 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
                onKeyPress={(e) => e.key === 'Enter' && searchTickers()}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-300 font-semibold">Market</Label>
              <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                <SelectTrigger className="h-12 bg-slate-700/50 border-slate-600 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {markets.map((market) => (
                    <SelectItem key={market.value} value={market.value} className="text-slate-100 focus:bg-slate-700">
                      <span className="flex items-center gap-2">
                        <span>{market.icon}</span>
                        {market.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={searchTickers}
            disabled={!searchQuery.trim() || isSearching}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Search Tickers
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-200">Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((ticker, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 hover:bg-slate-700/70 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-xl text-blue-400">{ticker.symbol}</span>
                        <Badge variant="outline" className="border-slate-500 text-slate-300">
                          {markets.find(m => m.value === selectedMarket)?.label}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-slate-200 mb-2">{ticker.name}</h3>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Sector:</span>
                          <span className="ml-2 text-slate-300">{ticker.sector}</span>
                        </div>
                        {ticker.current_price && (
                          <div>
                            <span className="text-slate-400">Price:</span>
                            <span className="ml-2 text-emerald-400 font-semibold">${ticker.current_price.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                      
                      {ticker.market_cap && (
                        <div className="mt-2 text-sm">
                          <span className="text-slate-400">Market Cap:</span>
                          <span className="ml-2 text-slate-300">${(ticker.market_cap / 1e9).toFixed(2)}B</span>
                        </div>
                      )}
                      
                      {ticker.description && (
                        <p className="text-slate-400 text-sm mt-3">{ticker.description}</p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => addTicker(ticker)}
                      disabled={isAdding}
                      className="ml-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Tickers */}
      <Card className="mt-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Popular Tickers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { symbol: "AAPL", name: "Apple Inc.", market: "us_stock" },
              { symbol: "TSLA", name: "Tesla Inc.", market: "us_stock" },
              { symbol: "BTC", name: "Bitcoin", market: "crypto" },
              { symbol: "RELIANCE.NS", name: "Reliance Industries", market: "indian_stock" },
              { symbol: "ETH", name: "Ethereum", market: "crypto" },
              { symbol: "MSFT", name: "Microsoft Corp.", market: "us_stock" }
            ].map((ticker, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSearchQuery(ticker.symbol);
                  setSelectedMarket(ticker.market);
                }}
              >
                <div className="font-semibold text-blue-400">{ticker.symbol}</div>
                <div className="text-sm text-slate-300">{ticker.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}