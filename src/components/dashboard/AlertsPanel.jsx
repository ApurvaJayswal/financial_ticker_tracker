import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Bell, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { getTimeAgo, getPriorityColor } from "../../utils";

const getAlertIcon = (type) => {
  const icons = {
    price_target: TrendingUp,
    price_change: Activity,
    volume_spike: Activity,
    news_sentiment: Bell,
    technical_indicator: Activity
  };
  return icons[type] || Bell;
};

const getAlertTypeLabel = (type) => {
  const labels = {
    price_target: "Price Target",
    price_change: "Price Change",
    volume_spike: "Volume Spike", 
    news_sentiment: "News Sentiment",
    technical_indicator: "Technical"
  };
  return labels[type] || type;
};

const getAlertPriorityColor = (priority) => {
  const colors = {
    high: "bg-red-400/20 text-red-300 border-red-400/30",
    medium: "bg-amber-400/20 text-amber-300 border-amber-400/30",
    low: "bg-blue-400/20 text-blue-300 border-blue-400/30"
  };
  return colors[priority] || colors.low;
};

export default function AlertsPanel({ alerts }) {
  const activeAlerts = alerts.filter(alert => alert.is_active);

  return (
    <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Active Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No active alerts</p>
            <p className="text-slate-500 text-sm mt-2">Set up alerts to monitor your tickers</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAlerts.map((alert, index) => {
              const IconComponent = getAlertIcon(alert.alert_type);
              
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      alert.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-blue-400 text-sm">
                          {alert.ticker_symbol}
                        </span>
                        <Badge className={`${getAlertPriorityColor(alert.priority)} text-xs`}>
                          {alert.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
                          {getAlertTypeLabel(alert.alert_type)}
                        </Badge>
                      </div>

                      <p className="text-slate-200 font-medium mb-1">
                        {alert.condition}
                      </p>

                      {alert.message && (
                        <p className="text-slate-400 text-sm mb-2">
                          {alert.message}
                        </p>
                      )}

                      <div className="text-xs text-slate-500">
                        Created {getTimeAgo(alert.created_date)}
                        {alert.triggered_at && (
                          <span className="ml-2 text-amber-400">
                            • Triggered {getTimeAgo(alert.triggered_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}