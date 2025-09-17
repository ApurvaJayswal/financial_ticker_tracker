import React, { useState, useEffect } from "react";
import { Alert as AlertEntity } from "../entities/Alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const getPriorityColor = (priority) => ({
    high: "bg-red-900/50 text-red-300 border-red-500/30",
    medium: "bg-yellow-900/50 text-yellow-300 border-yellow-500/30",
    low: "bg-blue-900/50 text-blue-300 border-blue-500/30",
}[priority] || "bg-slate-700 text-slate-300 border-slate-500/30");

function CreateAlertDialog({ onAlertCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    ticker_symbol: '',
    alert_type: 'price_target',
    condition: '',
    target_value: '',
    priority: 'medium',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await AlertEntity.create({
      ...formData,
      target_value: parseFloat(formData.target_value),
    });
    onAlertCreated();
    setIsOpen(false);
    setFormData({ ticker_symbol: '', alert_type: 'price_target', condition: '', target_value: '', priority: 'medium' });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle>Create a New Alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="ticker_symbol">Ticker Symbol</Label>
            <Input id="ticker_symbol" value={formData.ticker_symbol} onChange={e => setFormData({...formData, ticker_symbol: e.target.value.toUpperCase()})} required className="bg-slate-700 border-slate-600" />
          </div>
          <div>
            <Label htmlFor="alert_type">Alert Type</Label>
            <Select value={formData.alert_type} onValueChange={val => setFormData({...formData, alert_type: val})}>
              <SelectTrigger id="alert_type" className="bg-slate-700 border-slate-600"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="price_target" className="focus:bg-slate-700">Price Target</SelectItem>
                <SelectItem value="price_change" className="focus:bg-slate-700">Price Change (%)</SelectItem>
                <SelectItem value="volume_spike" className="focus:bg-slate-700">Volume Spike</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition</Label>
            <Input id="condition" placeholder="e.g., Price crosses above" value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} required className="bg-slate-700 border-slate-600" />
          </div>
          <div>
            <Label htmlFor="target_value">Target Value</Label>
            <Input id="target_value" type="number" step="any" value={formData.target_value} onChange={e => setFormData({...formData, target_value: e.target.value})} required className="bg-slate-700 border-slate-600" />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={val => setFormData({...formData, priority: val})}>
              <SelectTrigger id="priority" className="bg-slate-700 border-slate-600"><SelectValue/></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectItem value="low" className="focus:bg-slate-700">Low</SelectItem>
                <SelectItem value="medium" className="focus:bg-slate-700">Medium</SelectItem>
                <SelectItem value="high" className="focus:bg-slate-700">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit">Create Alert</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    const alertsData = await AlertEntity.list("-created_date", 100);
    setAlerts(alertsData);
    setIsLoading(false);
  };
  
  const toggleAlertStatus = async (alert) => {
    await AlertEntity.update(alert.id, { is_active: !alert.is_active });
    loadAlerts();
  };

  const deleteAlert = async (id) => {
    await AlertEntity.delete(id);
    loadAlerts();
  };
  
  const getAlertTypeLabel = (type) => ({
    price_target: "Price Target", price_change: "Price Change", volume_spike: "Volume Spike", news_sentiment: "News Sentiment", technical_indicator: "Technical"
  }[type] || type);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="flex justify-between items-center gap-4">
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">Alerts</h1>
              <p className="text-slate-300 mt-1">Manage your market alerts</p>
            </div>
        </div>
        <CreateAlertDialog onAlertCreated={loadAlerts} />
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-200">Your Alerts ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-slate-300">Loading alerts...</p> : (
            <div className="space-y-4">
              {alerts.length === 0 ? (
                <p className="py-12 text-center text-slate-400">You haven't created any alerts yet.</p>
              ) : alerts.map(alert => (
                <div key={alert.id} className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${alert.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      <span className="font-bold text-lg text-blue-400">{alert.ticker_symbol}</span>
                      <Badge variant="outline" className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
                      <Badge variant="outline" className="text-slate-300 border-slate-500/50">{getAlertTypeLabel(alert.alert_type)}</Badge>
                    </div>
                    <p className="text-slate-200 mt-2">{alert.condition}</p>
                    <p className="text-xs text-slate-400 mt-1">Created: {format(new Date(alert.created_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleAlertStatus(alert)}>
                      {alert.is_active ? <ToggleRight className="h-6 w-6 text-emerald-400"/> : <ToggleLeft className="h-6 w-6 text-slate-400"/>}
                    </Button>
                     <Button variant="ghost" size="icon" onClick={() => deleteAlert(alert.id)}>
                      <Trash2 className="h-4 w-4 text-red-400"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}