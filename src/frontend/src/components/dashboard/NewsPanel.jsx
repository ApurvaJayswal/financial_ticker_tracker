import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Globe, ExternalLink, Clock } from "lucide-react";
import { getTimeAgo } from "../../utils";

const getImpactColor = (impact) => {
  const colors = {
    high: "bg-red-400/20 text-red-300 border-red-400/30",
    medium: "bg-amber-400/20 text-amber-300 border-amber-400/30", 
    low: "bg-blue-400/20 text-blue-300 border-blue-400/30"
  };
  return colors[impact] || colors.low;
};

const getSentimentBadgeColor = (sentiment) => {
  const colors = {
    positive: "bg-emerald-400/20 text-emerald-300 border-emerald-400/30",
    negative: "bg-red-400/20 text-red-300 border-red-400/30",
    neutral: "bg-slate-400/20 text-slate-300 border-slate-400/30"
  };
  return colors[sentiment] || colors.neutral;
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
                      <Badge className={`${getSentimentBadgeColor(item.sentiment)} text-xs`}>
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
                    {item.published_at ? getTimeAgo(item.published_at) : "N/A"}
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