// Utility functions for TickerTracker

export const createPageUrl = (pageName) => {
  const routes = {
    Dashboard: '/dashboard',
    AddTicker: '/add-ticker',
    MarketAnalysis: '/market-analysis',
    NewsCenter: '/news-center',
    Alerts: '/alerts',
  };
  return routes[pageName] || '/dashboard';
};

export const formatCurrency = (value, currency = 'USD') => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatNumber = (value) => {
  if (!value && value !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value) => {
  if (!value && value !== 0) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const formatMarketCap = (value) => {
  if (!value && value !== 0) return 'N/A';
  
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  }
  
  return formatCurrency(value);
};

export const formatVolume = (value) => {
  if (!value && value !== 0) return 'N/A';
  
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  
  return formatNumber(value);
};

export const getTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export const getSentimentColor = (sentiment) => {
  switch (sentiment?.toLowerCase()) {
    case 'positive':
      return 'text-emerald-400';
    case 'negative':
      return 'text-red-400';
    case 'neutral':
    default:
      return 'text-slate-400';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'text-red-400 bg-red-400/10';
    case 'medium':
      return 'text-amber-400 bg-amber-400/10';
    case 'low':
    default:
      return 'text-slate-400 bg-slate-400/10';
  }
};

export const generateMockData = () => {
  // This will be used for development/demo purposes
  return {
    tickers: [],
    news: [],
    alerts: []
  };
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};