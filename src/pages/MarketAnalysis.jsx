import React, { useState, useEffect } from "react";
import { Ticker } from "@/entities/Ticker";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BrainCircuit, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#eab308'];

export default function MarketAnalysis() {
  const navigate = useNavigate();
  const [tickers, setTickers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const tickerData = await Ticker.list();
    setTickers(tickerData);
    setIsLoading(false);
  };

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis("");
    try {
      const tickerSummary = tickers.map(t => ({
        symbol: t.symbol,
        name: t.name,
        market: t.market,
        price_change_percent: t.price_change_percent,
        volume: t.volume,
        sector: t.sector,
        sentiment_score: t.sentiment_score
      }));

      const response = await InvokeLLM({
        prompt: `Provide a brief market analysis based on the following ticker data. Focus on overall trends, top-performing sectors, and any notable sentiment shifts.
        
        Data: ${JSON.stringify(tickerSummary)}`,
        add_context_from_internet: true,
      });
      setAnalysis(response);
    } catch (error) {
      console.error("Error generating analysis:", error);
      setAnalysis("Could not generate AI analysis at this time.");
    }
    setIsAnalyzing(false);
  };
  
  const sectorPerformance = React.useMemo(() => {
    const sectors = {};
    tickers.forEach(t => {
      if (!t.sector || t.sector === "Unknown") return;
      if (!sectors[t.sector]) {
        sectors[t.sector] = { totalChange: 0, count: 0 };
      }
      sectors[t.sector].totalChange += t.price_change_percent || 0;
      sectors[t.sector].count += 1;
    });

    return Object.entries(sectors)
      .map(([name, data]) => ({ name, avgChange: data.totalChange / data.count }))
      .sort((a,b) => b.avgChange - a.avgChange);
  }, [tickers]);
  
  const topGainers = tickers.filter(t => (t.price_change_percent || 0) > 0).sort((a,b) => b.price_change_percent - a.price_change_percent).slice(0, 5);
  const topLosers = tickers.filter(t => (t.price_change_percent || 0) < 0).sort((a,b) => a.price_change_percent - b.price_change_percent).slice(0, 5);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="shrink-0 border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700/50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Market Analysis</h1>
          <p className="text-slate-300 mt-1">Deep dive into market trends and patterns</p>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            AI Market Summary
          </CardTitle>
          <Button onClick={generateAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? "Analyzing..." : "Generate AI Summary"}
          </Button>
        </CardHeader>
        <CardContent>
          {isAnalyzing && (
            <div className="flex justify-center items-center py-8">
              <p className="text-slate-300">Generating insights...</p>
            </div>
          )}
          {analysis && <p className="text-slate-300 whitespace-pre-wrap">{analysis}</p>}
          {!analysis && !isAnalyzing && <p className="text-slate-400 text-center py-8">Click the button to generate an AI-powered market summary.</p>}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-200">Sector Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 12, fill: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(30 41 59 / 0.9)', border: '1px solid rgb(51 65 85)' }}
                  labelStyle={{ color: '#f1f5f9' }}
                  formatter={(value) => [`${value.toFixed(2)}%`, 'Avg. Change']}
                />
                <Bar dataKey="avgChange" radius={[4, 4, 0, 0]}>
                  {sectorPerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgChange > 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <TrendingUp className="text-emerald-400"/> Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topGainers.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-700/50">
                    <div>
                      <div className="font-bold text-slate-200">{t.symbol}</div>
                      <div className="text-slate-400 truncate max-w-[150px]">{t.name}</div>
                    </div>
                    <div className="text-emerald-400 font-bold">+{t.price_change_percent?.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                <TrendingDown className="text-red-400"/> Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topLosers.map(t => (
                  <div key={t.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-700/50">
                    <div>
                      <div className="font-bold text-slate-200">{t.symbol}</div>
                      <div className="text-slate-400 truncate max-w-[150px]">{t.name}</div>
                    </div>
                    <div className="text-red-400 font-bold">{t.price_change_percent?.toFixed(2)}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}