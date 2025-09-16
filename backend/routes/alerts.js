const express = require('express');
const router = express.Router();

// Mock alerts data
let alerts = [
  {
    id: 1,
    ticker_symbol: 'AAPL',
    alert_type: 'price_target',
    condition: 'price above 180',
    target_value: 180,
    is_active: true,
    triggered_at: null,
    message: 'AAPL price alert: Target $180 reached',
    priority: 'high',
    created_date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updated_date: new Date().toISOString(),
    user_id: 1
  },
  {
    id: 2,
    ticker_symbol: 'TSLA',
    alert_type: 'price_change',
    condition: 'price change > 5%',
    target_value: 5,
    is_active: true,
    triggered_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    message: 'TSLA significant price movement detected',
    priority: 'medium',
    created_date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_date: new Date().toISOString(),
    user_id: 1
  },
  {
    id: 3,
    ticker_symbol: 'BTC',
    alert_type: 'volume_spike',
    condition: 'volume > 30B',
    target_value: 30000000000,
    is_active: true,
    triggered_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    message: 'BTC volume spike detected',
    priority: 'high',
    created_date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_date: new Date().toISOString(),
    user_id: 1
  }
];

let nextId = 4;

// GET /api/alerts - Get all alerts with filtering
router.get('/', (req, res) => {
  try {
    const {
      ticker_symbol,
      alert_type,
      priority,
      is_active,
      triggered,
      page = 1,
      limit = 20,
      sort = 'created_date',
      order = 'desc'
    } = req.query;

    let filteredAlerts = [...alerts];

    // Apply filters
    if (ticker_symbol) {
      filteredAlerts = filteredAlerts.filter(a => 
        a.ticker_symbol.toLowerCase() === ticker_symbol.toLowerCase()
      );
    }

    if (alert_type) {
      filteredAlerts = filteredAlerts.filter(a => a.alert_type === alert_type);
    }

    if (priority) {
      filteredAlerts = filteredAlerts.filter(a => a.priority === priority);
    }

    if (is_active !== undefined) {
      filteredAlerts = filteredAlerts.filter(a => 
        a.is_active === (is_active === 'true')
      );
    }

    if (triggered !== undefined) {
      if (triggered === 'true') {
        filteredAlerts = filteredAlerts.filter(a => a.triggered_at !== null);
      } else {
        filteredAlerts = filteredAlerts.filter(a => a.triggered_at === null);
      }
    }

    // Apply sorting
    filteredAlerts.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];

      if (sort === 'created_date' || sort === 'updated_date' || sort === 'triggered_at') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      if (order === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedAlerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredAlerts.length,
        pages: Math.ceil(filteredAlerts.length / parseInt(limit))
      },
      filters: { ticker_symbol, alert_type, priority, is_active, triggered },
      sort: { field: sort, order }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/alerts/:id - Get specific alert
router.get('/:id', (req, res) => {
  try {
    const alert = alerts.find(a => a.id === parseInt(req.params.id));
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        message: `No alert found with ID ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/alerts - Create new alert
router.post('/', (req, res) => {
  try {
    const {
      ticker_symbol,
      alert_type,
      condition,
      target_value,
      priority = 'medium',
      message,
      user_id = 1
    } = req.body;

    if (!ticker_symbol || !alert_type || !condition) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Ticker symbol, alert type, and condition are required fields'
      });
    }

    const validAlertTypes = ['price_target', 'price_change', 'volume_spike', 'news_sentiment', 'technical_indicator'];
    if (!validAlertTypes.includes(alert_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid alert type',
        message: `Alert type must be one of: ${validAlertTypes.join(', ')}`
      });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid priority',
        message: `Priority must be one of: ${validPriorities.join(', ')}`
      });
    }

    const newAlert = {
      id: nextId++,
      ticker_symbol: ticker_symbol.toUpperCase(),
      alert_type,
      condition,
      target_value: parseFloat(target_value) || 0,
      is_active: true,
      triggered_at: null,
      message: message || `${alert_type} alert for ${ticker_symbol.toUpperCase()}`,
      priority,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      user_id
    };

    alerts.push(newAlert);

    res.status(201).json({
      success: true,
      data: newAlert,
      message: 'Alert created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// PUT /api/alerts/:id - Update alert
router.put('/:id', (req, res) => {
  try {
    const alertIndex = alerts.findIndex(a => a.id === parseInt(req.params.id));
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        message: `No alert found with ID ${req.params.id}`
      });
    }

    const updatedAlert = {
      ...alerts[alertIndex],
      ...req.body,
      id: parseInt(req.params.id), // Ensure ID doesn't change
      updated_date: new Date().toISOString()
    };

    alerts[alertIndex] = updatedAlert;

    res.json({
      success: true,
      data: updatedAlert,
      message: 'Alert updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// DELETE /api/alerts/:id - Delete alert
router.delete('/:id', (req, res) => {
  try {
    const alertIndex = alerts.findIndex(a => a.id === parseInt(req.params.id));
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        message: `No alert found with ID ${req.params.id}`
      });
    }

    const deletedAlert = alerts.splice(alertIndex, 1)[0];

    res.json({
      success: true,
      data: deletedAlert,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/alerts/:id/trigger - Manually trigger an alert
router.post('/:id/trigger', (req, res) => {
  try {
    const alertIndex = alerts.findIndex(a => a.id === parseInt(req.params.id));
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        message: `No alert found with ID ${req.params.id}`
      });
    }

    alerts[alertIndex] = {
      ...alerts[alertIndex],
      triggered_at: new Date().toISOString(),
      is_active: false,
      updated_date: new Date().toISOString()
    };

    res.json({
      success: true,
      data: alerts[alertIndex],
      message: 'Alert triggered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// POST /api/alerts/:id/reset - Reset a triggered alert
router.post('/:id/reset', (req, res) => {
  try {
    const alertIndex = alerts.findIndex(a => a.id === parseInt(req.params.id));
    
    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found',
        message: `No alert found with ID ${req.params.id}`
      });
    }

    alerts[alertIndex] = {
      ...alerts[alertIndex],
      triggered_at: null,
      is_active: true,
      updated_date: new Date().toISOString()
    };

    res.json({
      success: true,
      data: alerts[alertIndex],
      message: 'Alert reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/alerts/stats/summary - Get alert statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = {
      total: alerts.length,
      active: alerts.filter(a => a.is_active).length,
      triggered: alerts.filter(a => a.triggered_at !== null).length,
      by_priority: {
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length
      },
      by_type: {
        price_target: alerts.filter(a => a.alert_type === 'price_target').length,
        price_change: alerts.filter(a => a.alert_type === 'price_change').length,
        volume_spike: alerts.filter(a => a.alert_type === 'volume_spike').length,
        news_sentiment: alerts.filter(a => a.alert_type === 'news_sentiment').length,
        technical_indicator: alerts.filter(a => a.alert_type === 'technical_indicator').length
      },
      recent_triggers: alerts
        .filter(a => a.triggered_at !== null)
        .sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))
        .slice(0, 5)
        .map(a => ({
          id: a.id,
          ticker_symbol: a.ticker_symbol,
          alert_type: a.alert_type,
          triggered_at: a.triggered_at,
          priority: a.priority
        }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;