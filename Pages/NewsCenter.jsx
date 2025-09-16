import React, { useState, useEffect } from "react";
import { NewsItem } from "@/entities/NewsItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, ExternalLink, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getSentimentColor = (sentiment) => ({
  positive: "bg-emerald-900/50 text-emerald-300 border-emerald-500/30",
  negative: "bg-red-900/50 text-red-300 border-red-500/30",
  neutral: "bg-slate-700 text-slate-300 border-slate-500/30",
}[sentiment] || "bg-slate-700 text-slate-300 border-slate-500/30");

export default function NewsCenter() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setIsLoading(true);
    const newsData = await NewsItem.list("-published_at", 100);
    setNews(newsData);
    setIsLoading(false);
  };
  
  const filteredNews = news.filter(item => {
    const sentimentMatch = sentimentFilter === 'all' || item.sentiment === sentimentFilter;
    const searchMatch = searchTerm === "" || 
                        item.headline.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.ticker_symbol.toLowerCase().includes(searchTerm.toLowerCase());
    return sentimentMatch && searchMatch;
  });

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">News Center</h1>
          <p className="text-slate-300 mt-1">Latest financial news with AI sentiment analysis</p>
        </div>
      </div>
      
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input 
              placeholder="Search news by headline, summary, or ticker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-full md:w-48 h-12 bg-slate-700/50 border-slate-600 text-slate-100">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
              <SelectItem value="all" className="focus:bg-slate-700">All Sentiments</SelectItem>
              <SelectItem value="positive" className="focus:bg-slate-700">Positive</SelectItem>
              <SelectItem value="neutral" className="focus:bg-slate-700">Neutral</SelectItem>
              <SelectItem value="negative" className="focus:bg-slate-700">Negative</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center text-slate-300">Loading news...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(item => (
            <Card key={item.id} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="text-blue-300 border-blue-500/50">{item.ticker_symbol}</Badge>
                   {item.sentiment && <Badge variant="outline" className={getSentimentColor(item.sentiment)}>{item.sentiment}</Badge>}
                </div>
                <CardTitle className="text-lg text-slate-200 line-clamp-3">{item.headline}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-slate-400 text-sm line-clamp-4">{item.summary}</p>
              </CardContent>
              <div className="p-6 pt-0 flex justify-between items-center text-xs">
                 <div className="text-slate-500 flex items-center gap-2">
                   <Clock className="w-3 h-3"/> {format(new Date(item.published_at), 'MMM d, yyyy')} • {item.source}
                 </div>
                 <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
                   Read <ExternalLink className="w-3 h-3" />
                 </a>
              </div>
            </Card>
          ))}
        </div>
      )}
       {filteredNews.length === 0 && !isLoading && (
         <div className="text-center py-16 text-slate-400">No news articles match your criteria.</div>
       )}
    </div>
  );
}