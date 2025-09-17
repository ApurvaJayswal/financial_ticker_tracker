import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import AIFinancialAssistant from '../components/ai/AIFinancialAssistant';

export default function AIAssistant() {
  const navigate = useNavigate();
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
            <Bot className="w-8 h-8 text-cyan-400" />
            AI Financial Assistant
            <Sparkles className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-slate-300 mt-1">
            Your intelligent companion for financial analysis, market insights, and investment guidance
          </p>
        </div>
      </div>

      {/* AI Assistant Component */}
      <div className="h-[calc(100vh-12rem)]">
        <AIFinancialAssistant userId={userId} />
      </div>
    </div>
  );
}