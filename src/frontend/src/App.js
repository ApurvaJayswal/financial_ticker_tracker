import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import AddTicker from './pages/AddTicker';
import Alerts from './pages/Alerts';
import NewsCenter from './pages/NewsCenter';
import MarketAnalysis from './pages/MarketAnalysis';
import AIAssistant from './pages/AIAssistant';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App font-jakarta">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-ticker" element={<AddTicker />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/news-center" element={<NewsCenter />} />
            <Route path="/market-analysis" element={<MarketAnalysis />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
