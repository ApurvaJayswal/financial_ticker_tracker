import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import AddTicker from './pages/AddTicker';
import MarketAnalysis from './pages/MarketAnalysis';
import NewsCenter from './pages/NewsCenter';
import Alerts from './pages/Alerts';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          } />
          <Route path="/add-ticker" element={
            <Layout currentPageName="AddTicker">
              <AddTicker />
            </Layout>
          } />
          <Route path="/market-analysis" element={
            <Layout currentPageName="MarketAnalysis">
              <MarketAnalysis />
            </Layout>
          } />
          <Route path="/news-center" element={
            <Layout currentPageName="NewsCenter">
              <NewsCenter />
            </Layout>
          } />
          <Route path="/alerts" element={
            <Layout currentPageName="Alerts">
              <Alerts />
            </Layout>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;