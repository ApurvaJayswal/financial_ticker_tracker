import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, ExternalLink, Clock } from "lucide-react";
import { format } from "date-fns";

const getSentimentColor = (sentiment) => {
  const colors = {
    positive: "bg-emerald-100 text-emerald-800 border-emerald-200",
    negative: "bg-red-100 text-red-800 border-red-200",
    neutral: "bg-slate-100 text-slate-800 border-slate-200"
  };
  return colors[sentiment] || colors.neutral;
};

const getImpactColor = (impact) => {
  const colors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    low: "bg-blue-100 text-blue-800 border-blue-200"
  };
  return colors[impact] || colors.low;
};

export default function NewsPanel({ news }) {
  const recentNews = news.slice(0, 10);

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNews.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No recent news available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNews.map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-400 text-sm">
                      {item.ticker_symbol}
                    </span>
                    {item.sentiment && (
                      <Badge className={`${getSentimentColor(item.sentiment)} text-xs`}>
                        {item.sentiment}
                      </Badge>
                    )}
                    {item.impact_level && (
                      <Badge className={`${getImpactColor(item.impact_level)} text-xs`}>
                        {item.impact_level} impact
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    {item.published_at ? format(new Date(item.published_at), "MMM d, HH:mm") : "N/A"}
                  </div>
                </div>

                <h4 className="font-semibold text-slate-200 mb-2 line-clamp-2">
                  {item.headline}
                </h4>

                {item.summary && (
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.source}</span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      Read More
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}